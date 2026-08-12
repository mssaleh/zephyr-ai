import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

import BINDING_EXPORTER from '../adapters/binding-export.py';
import type { BindingProperty, ResolvedBinding } from '../parsers/binding.ts';
import { semanticPython } from '../python.ts';
import type { SourceReport } from '../report.ts';

export interface SemanticBindingProperty extends BindingProperty {
  provenance?: { declaredIn: string; includeChain: string[] };
  constraints?: Record<string, unknown>;
}

export interface SemanticResolvedBinding extends Omit<ResolvedBinding, 'properties' | 'children'> {
  properties: SemanticBindingProperty[];
  children: SemanticResolvedBinding[];
  adapter?: string;
}

export interface CollectedBindings {
  bindings: SemanticResolvedBinding[];
  fragments: number;
  report: SourceReport;
}

const CACHE = new Map<string, CollectedBindings>();

export function collectBindings(roots: string[]): CollectedBindings {
  const cacheKey = JSON.stringify(roots);
  const cached = CACHE.get(cacheKey);
  if (cached) return cached;
  if (roots.length === 0) throw new Error('At least one devicetree binding root is required.');
  const zephyrRoot = dirname(dirname(roots[0]!));
  const officialLibrary = join(
    zephyrRoot,
    'scripts',
    'dts',
    'python-devicetree',
    'src',
    'devicetree',
    'edtlib.py',
  );
  if (!existsSync(officialLibrary)) {
    throw new Error('The selected Zephyr tree does not provide its Python devicetree tooling.');
  }
  const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-bindings-'));
  const exporter = join(temporary, 'binding-export.py');
  try {
    writeFileSync(exporter, BINDING_EXPORTER, { mode: 0o600 });
    const args = [exporter, '--zephyr', zephyrRoot];
    for (const root of roots) args.push('--root', root);
    const result = spawnSync(semanticPython(zephyrRoot), args, {
      encoding: 'utf8',
      maxBuffer: 512 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (result.status !== 0) {
      let reportDetail = '';
      try {
        const failed = JSON.parse(result.stdout) as { report?: SourceReport };
        reportDetail = (failed.report?.errors ?? [])
          .slice(0, 12)
          .map((error) => `${error.path ?? '<unknown>'} [${error.code}]: ${error.message}`)
          .join('\n');
      } catch {
        /* stderr below covers exporter crashes before a report is written */
      }
      const detail = reportDetail || result.stderr.trim().split('\n').slice(-12).join('\n');
      throw new Error(`Zephyr devicetree binding export failed.\n${detail}`);
    }
    const collected = JSON.parse(result.stdout) as CollectedBindings;
    CACHE.set(cacheKey, collected);
    return collected;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
