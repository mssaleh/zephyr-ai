import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import API_EXPORTER from '../adapters/api-export.py';
import { type ApiGroup, type ApiSymbol, parseHeader } from '../parsers/doxygen.ts';
import { standardPython } from '../python.ts';
import type { SourceReport } from '../report.ts';
import { walk } from '../walk.ts';
import { byField } from '../../../shared/ordering.ts';

export interface CollectedApi {
  symbols: ApiSymbol[];
  groups: ApiGroup[];
  mode: 'doxygen-xml' | 'header-fallback';
  report: SourceReport;
}

/** Find Doxygen XML produced in either conventional Zephyr documentation layout. */
export function discoverDoxygenXml(root: string): string | undefined {
  const requested = resolve(root);
  let canonical = requested;
  try {
    canonical = realpathSync(requested);
  } catch {
    /* the caller reports an invalid Zephyr root separately */
  }
  return [...new Set([requested, canonical])]
    .flatMap((base) => [
      resolve(base, '..', 'doxygen', 'xml'),
      resolve(base, 'doc', '_build', 'doxygen', 'xml'),
    ])
    .find((candidate) => existsSync(join(candidate, 'index.xml')));
}

function collectDoxygenXml(root: string, xmlDirectory: string): CollectedApi {
  if (!existsSync(join(xmlDirectory, 'index.xml'))) {
    throw new Error(`The Doxygen XML directory has no index.xml: ${xmlDirectory}`);
  }
  const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-api-'));
  const exporter = join(temporary, 'api-export.py');
  try {
    writeFileSync(exporter, API_EXPORTER, { mode: 0o600 });
    const exported = spawnSync(standardPython(), [exporter, '--xml', xmlDirectory], {
      encoding: 'utf8',
      maxBuffer: 512 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (exported.status !== 0) {
      // The exporter reports refusals as a structured report on stdout and exits
      // non-zero; only an interpreter-level crash reaches stderr. Reading stderr
      // alone turned every content failure into a blank, unactionable message.
      let detail = exported.stderr?.trim() ?? '';
      try {
        const report = (JSON.parse(exported.stdout) as { report?: SourceReport }).report;
        if (report?.errors?.length) {
          const shown = report.errors.slice(0, 8).map((e) => `- ${e.code}: ${e.message}${e.path ? ` (${e.path})` : ''}`);
          const extra = report.errors.length - shown.length;
          detail = `${report.errors.length} error(s) in the Doxygen XML:\n${shown.join('\n')}${
            extra > 0 ? `\n- ... and ${extra} more` : ''
          }`;
        }
      } catch {
        /* stdout was not a report; fall back to whatever stderr carried */
      }
      throw new Error(`Doxygen XML export failed.\n${detail || 'The exporter produced no diagnostic output.'}`);
    }
    const collected = JSON.parse(exported.stdout) as CollectedApi;
    collected.symbols = collected.symbols.map((symbol) => {
      const portable = symbol.header.replaceAll('\\', '/');
      const marker = '/include/zephyr/';
      const index = portable.lastIndexOf(marker);
      return {
        ...symbol,
        header: index >= 0 ? `include/zephyr/${portable.slice(index + marker.length)}` : portable,
      };
    });
    return collected;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

/**
 * Index the public C API from `include/zephyr`.
 *
 * Only public headers are read: internal headers under `include/zephyr/internal`
 * and the arch-private trees describe implementation detail an application must
 * not call, and indexing them would let a model reach for private functions.
 */
export function collectApi(root: string, xmlDirectory?: string): CollectedApi {
  if (xmlDirectory) return collectDoxygenXml(root, xmlDirectory);
  const base = join(root, 'include', 'zephyr');
  const symbols: ApiSymbol[] = [];
  const groups: ApiGroup[] = [];
  const intentionallyExcluded: SourceReport['intentionallyExcluded'] = [];

  // Sorted: unsorted, filesystem order decided the order headers were parsed and
  // so the order symbols were emitted before the final sort below.
  const headers = [
    ...walk(base, {
      skipPrefixes: ['internal', 'arch/arm/internal'],
      match: (name) => name.endsWith('.h'),
    }),
  ].sort();
  for (const rel of headers) {
    let text: string;
    try {
      text = readFileSync(join(base, rel), 'utf8');
    } catch (error) {
      throw new Error(
        `Cannot read public API header ${join(base, rel)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const header = `include/zephyr/${rel}`;
    const parsed = parseHeader(text, header);

    for (const symbol of parsed.symbols) {
      // The fallback remains deliberately conservative. These two shapes are
      // proven parser artefacts, never public declarations. Semantic release
      // indexes use Doxygen XML and do not pass through this filter.
      if (symbol.kind === 'function' && symbol.signature.includes('=')) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: 'fallback-initializer-artifact',
        });
        continue;
      }
      const array = symbol.signature.indexOf('[');
      const call = symbol.signature.indexOf('(');
      if (symbol.kind === 'function' && array >= 0 && (call < 0 || array < call)) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: 'fallback-array-declarator-artifact',
        });
        continue;
      }
      if (
        symbol.kind === 'macro' &&
        /^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(symbol.signature)
      ) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: 'fallback-include-guard',
        });
        continue;
      }
      // Preserve duplicate contexts. A syscall declaration and inline wrapper
      // may share a public name, but distinct provenance is useful and Doxygen
      // IDs disambiguate it in semantic mode.
      symbols.push(symbol);
    }

    groups.push(...parsed.groups);
  }

  symbols.sort(byField((symbol) => symbol.name));

  const groupById = new Map<string, ApiGroup>();
  for (const g of groups) {
    if (!groupById.has(g.id) || (g.title && !groupById.get(g.id)!.title)) groupById.set(g.id, g);
  }

  return {
    symbols,
    groups: [...groupById.values()],
    mode: 'header-fallback',
    report: {
      // One additional discovered source unit records the explicitly excluded
      // private-header subtree. This keeps the report balanced without
      // pretending those implementation headers were parsed as public API.
      discovered: symbols.length + groupById.size + intentionallyExcluded.length + 1,
      indexed: symbols.length + groupById.size,
      intentionallyExcluded: [
        ...intentionallyExcluded,
        {
          path: 'include/zephyr/internal',
          reason: 'private-header-policy',
        },
      ],
      warnings: [
        {
          code: 'header-fallback',
          message:
            'Doxygen XML was not supplied; API results are an incomplete header-comment catalogue.',
        },
      ],
      errors: [],
    },
  };
}
