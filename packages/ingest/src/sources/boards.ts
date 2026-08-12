import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { parse as parseYaml } from 'yaml';

import { toPosix, walk } from '../walk.ts';

export interface BoardTarget {
  /** Fully qualified target, e.g. `esp32s3_devkitc/esp32s3/procpu`. */
  identifier: string;
  name?: string;
  arch?: string;
  type?: string;
  ram?: number;
  flash?: number;
  toolchains: string[];
  /** Peripheral/feature tags from twister metadata, e.g. `netif:wifi`. */
  supported: string[];
  vendor?: string;
}

export interface BoardRecord {
  name: string;
  fullName?: string;
  vendor?: string;
  dir: string;
  socs: { name: string; variants: string[]; cpuclusters: string[] }[];
  targets: BoardTarget[];
  revisions: string[];
  defaultRevision?: string;
  /** Union of `supported:` across all targets, for feature search. */
  supported: string[];
  arch?: string;
  ram?: number;
  flash?: number;
  docPath?: string;
}

export interface SocRecord {
  name: string;
  series?: string;
  family?: string;
  vendor?: string;
  dir: string;
  cpuclusters: string[];
}

function safeYaml(path: string): Record<string, unknown> {
  try {
    const parsed = parseYaml(readFileSync(path, 'utf8'), { logLevel: 'silent' });
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('expected a YAML mapping');
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Failed to parse board/SoC metadata ${path}: ${(error as Error).message}`);
  }
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asStrings(v: unknown): string[] {
  return asArray(v).filter((x): x is string => typeof x === 'string');
}

interface OfficialBoard {
  qualifiers: string[];
  revisions: string[];
  defaultRevision?: string;
}

/** Enumerate targets through the exact implementation used by `west boards`. */
function officialBoards(root: string): Map<string, OfficialBoard> {
  const script = join(root, 'scripts', 'list_boards.py');
  if (!existsSync(script)) throw new Error('The selected Zephyr tree has no scripts/list_boards.py.');
  let exported;
  for (const python of [process.env['PYTHON_EXECUTABLE'], 'python3', 'python']) {
    if (!python) continue;
    exported = spawnSync(
      python,
      [
        script,
        '--board-root', root,
        '--soc-root', root,
        '--arch-root', root,
        '--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}',
      ],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    if (!exported.error || (exported.error as NodeJS.ErrnoException).code !== 'ENOENT') break;
  }
  if (!exported || exported.status !== 0) {
    throw new Error(
      'Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. ' +
        `The official board exporter failed: ${exported?.stderr.trim() ?? 'Python was not found.'}`,
    );
  }
  const result = new Map<string, OfficialBoard>();
  for (const line of exported.stdout.split('\n').filter(Boolean)) {
    const fields = line.split('@@').filter(Boolean).map((field) => field.split(';'));
    const value = (name: string) => fields.find(([label]) => label === name)?.slice(1) ?? [];
    const name = value('NAME')[0];
    if (!name) continue;
    const record: OfficialBoard = {
      qualifiers: value('QUALIFIERS').filter(Boolean),
      revisions: value('REVISIONS').filter(Boolean),
    };
    const defaultRevision = value('REVISION_DEFAULT')[0];
    if (defaultRevision && defaultRevision !== 'NOTFOUND') record.defaultRevision = defaultRevision;
    result.set(name, record);
  }
  return result;
}

/**
 * Read the twister metadata files that sit alongside `board.yml`.
 *
 * These carry the data an agent actually needs to pick a board — the qualified
 * target identifier, the architecture, flash and RAM budgets, and the list of
 * supported peripherals — none of which is in `board.yml` itself.
 */
function readTargets(boardDir: string): BoardTarget[] {
  const targets: BoardTarget[] = [];
  let entries: string[];
  try {
    entries = readdirSync(boardDir);
  } catch {
    return targets;
  }

  for (const entry of entries) {
    if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
    if (entry === 'board.yml' || entry === 'board.yaml') continue;

    const doc = safeYaml(join(boardDir, entry));
    const common = {
      toolchains: asStrings(doc['toolchain']),
      supported: asStrings(doc['supported']),
      ...(typeof doc['name'] === 'string' ? { name: doc['name'] } : {}),
      ...(typeof doc['arch'] === 'string' ? { arch: doc['arch'] } : {}),
      ...(typeof doc['type'] === 'string' ? { type: doc['type'] } : {}),
      ...(typeof doc['ram'] === 'number' ? { ram: doc['ram'] } : {}),
      ...(typeof doc['flash'] === 'number' ? { flash: doc['flash'] } : {}),
      ...(typeof doc['vendor'] === 'string' ? { vendor: doc['vendor'] } : {}),
    };
    if (typeof doc['identifier'] === 'string') {
      targets.push({ identifier: doc['identifier'], ...common });
    }
    const variants =
      doc['variants'] && typeof doc['variants'] === 'object' && !Array.isArray(doc['variants'])
        ? (doc['variants'] as Record<string, unknown>)
        : {};
    for (const [identifier, override] of Object.entries(variants)) {
      const details = override && typeof override === 'object' && !Array.isArray(override)
        ? (override as Record<string, unknown>)
        : {};
      targets.push({
        identifier,
        ...common,
        toolchains: asStrings(details['toolchain']).length
          ? asStrings(details['toolchain'])
          : common.toolchains,
        supported: [...new Set([...common.supported, ...asStrings(details['supported'])])],
      });
    }
  }

  targets.sort((a, b) => a.identifier.localeCompare(b.identifier));
  return targets;
}

export function collectBoards(root: string): BoardRecord[] {
  const boards: BoardRecord[] = [];
  const official = officialBoards(root);

  for (const rel of walk(join(root, 'boards'), {
    match: (name) => name === 'board.yml' || name === 'board.yaml',
  })) {
    const abs = join(root, 'boards', rel);
    const doc = safeYaml(abs);

    // `board:` is the common shape; `boards:` (a list) appears in shared-directory setups.
    const entries: Record<string, unknown>[] = [];
    const single = doc['board'];
    if (single && typeof single === 'object' && !Array.isArray(single)) {
      entries.push(single as Record<string, unknown>);
    }
    for (const item of asArray(doc['boards'])) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        entries.push(item as Record<string, unknown>);
      }
    }
    if (entries.length === 0) continue;

    const boardDir = dirname(abs);
    const relDir = toPosix(join('boards', dirname(rel)));
    const targets = readTargets(boardDir);
    const documentation = [...walk(join(boardDir, 'doc'), { match: (name) => name.endsWith('.rst') })];
    const preferredDoc = documentation.includes('index.rst') ? 'index.rst' : documentation.sort()[0];
    const docPath = preferredDoc ? `${relDir}/doc/${preferredDoc}` : undefined;

    for (const entry of entries) {
      if (typeof entry['name'] !== 'string') continue;
      const name = entry['name'];

      const socs = asArray(entry['socs']).flatMap((s) => {
        if (!s || typeof s !== 'object') return [];
        const rec = s as Record<string, unknown>;
        if (typeof rec['name'] !== 'string') return [];
        return [
          {
            name: rec['name'],
            variants: asArray(rec['variants']).flatMap((v) =>
              v && typeof v === 'object' && typeof (v as Record<string, unknown>)['name'] === 'string'
                ? [(v as Record<string, unknown>)['name'] as string]
                : [],
            ),
            cpuclusters: asArray(rec['cpuclusters']).flatMap((c) =>
              c && typeof c === 'object' && typeof (c as Record<string, unknown>)['name'] === 'string'
                ? [(c as Record<string, unknown>)['name'] as string]
                : [],
            ),
          },
        ];
      });

      // Targets are matched by prefix because an identifier is
      // `<board>/<soc>/<cluster>` and a directory can define several boards.
      const own = targets.filter(
        (t) => t.identifier === name || t.identifier.startsWith(`${name}/`),
      );
      const officialBoard = official.get(name);
      if (!officialBoard) throw new Error(`Zephyr's board model did not enumerate ${name}.`);
      const qualifiers = officialBoard.qualifiers.length > 0 ? officialBoard.qualifiers : [''];
      const identifiers = qualifiers.map((qualifier) => qualifier ? `${name}/${qualifier}` : name);
      for (const revision of officialBoard.revisions) {
        identifiers.push(
          ...qualifiers.map((qualifier) => qualifier ? `${name}@${revision}/${qualifier}` : `${name}@${revision}`),
        );
      }
      const generated: BoardTarget[] = identifiers.map((identifier) => ({
        identifier,
        toolchains: [],
        supported: [],
      }));
      const candidates = own.length > 0 ? own : entries.length === 1 ? targets : [];
      const targetByName = new Map(generated.map((target) => [target.identifier, target]));
      for (const target of candidates) {
        const existing = targetByName.get(target.identifier);
        targetByName.set(target.identifier, existing ? { ...existing, ...target } : target);
      }
      const effective = [...targetByName.values()].sort((left, right) =>
        left.identifier.localeCompare(right.identifier),
      );

      const record: BoardRecord = {
        name,
        dir: relDir,
        socs,
        targets: effective,
        revisions: officialBoard.revisions,
        supported: [...new Set(effective.flatMap((t) => t.supported))].sort(),
      };
      if (typeof entry['full_name'] === 'string') record.fullName = entry['full_name'];
      if (typeof entry['vendor'] === 'string') record.vendor = entry['vendor'];
      if (officialBoard.defaultRevision) record.defaultRevision = officialBoard.defaultRevision;
      if (docPath) record.docPath = docPath;

      const arch = effective.find((t) => t.arch)?.arch;
      if (arch) record.arch = arch;
      const ram = effective.find((t) => t.ram !== undefined)?.ram;
      if (ram !== undefined) record.ram = ram;
      const flash = effective.find((t) => t.flash !== undefined)?.flash;
      if (flash !== undefined) record.flash = flash;

      boards.push(record);
    }
  }

  boards.sort((a, b) => a.name.localeCompare(b.name));
  return boards;
}

/** Read the `soc.yml` family/series/soc hierarchy. */
export function collectSocs(root: string): SocRecord[] {
  const socs: SocRecord[] = [];

  for (const rel of walk(join(root, 'soc'), {
    match: (name) => name === 'soc.yml' || name === 'soc.yaml',
  })) {
    const abs = join(root, 'soc', rel);
    const doc = safeYaml(abs);

    const relDir = toPosix(join('soc', dirname(rel)));
    const vendor = rel.includes('/') ? rel.split('/')[0] : undefined;

    const pushSoc = (
      socEntry: Record<string, unknown>,
      family?: string,
      series?: string,
    ): void => {
      if (typeof socEntry['name'] !== 'string') return;
      const record: SocRecord = {
        name: socEntry['name'],
        dir: relDir,
        cpuclusters: asArray(socEntry['cpuclusters']).flatMap((c) =>
          c && typeof c === 'object' && typeof (c as Record<string, unknown>)['name'] === 'string'
            ? [(c as Record<string, unknown>)['name'] as string]
            : [],
        ),
      };
      if (family) record.family = family;
      if (series) record.series = series;
      if (vendor) record.vendor = vendor;
      socs.push(record);
    };

    const walkFamilies = (families: unknown[]): void => {
      for (const fam of families) {
        if (!fam || typeof fam !== 'object') continue;
        const f = fam as Record<string, unknown>;
        const famName = typeof f['name'] === 'string' ? f['name'] : undefined;
        for (const s of asArray(f['socs'])) {
          if (s && typeof s === 'object') pushSoc(s as Record<string, unknown>, famName);
        }
        for (const ser of asArray(f['series'])) {
          if (!ser || typeof ser !== 'object') continue;
          const sr = ser as Record<string, unknown>;
          const serName = typeof sr['name'] === 'string' ? sr['name'] : undefined;
          for (const s of asArray(sr['socs'])) {
            if (s && typeof s === 'object') {
              pushSoc(s as Record<string, unknown>, famName, serName);
            }
          }
        }
      }
    };

    walkFamilies(asArray(doc['family']));
    // Some trees declare SoCs at the top level with no family wrapper.
    for (const s of asArray(doc['socs'])) {
      if (s && typeof s === 'object') pushSoc(s as Record<string, unknown>);
    }
  }

  socs.sort((a, b) => a.name.localeCompare(b.name));
  return socs;
}
