import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

function safeYaml(path: string): Record<string, unknown> | null {
  try {
    const parsed = parseYaml(readFileSync(path, 'utf8'), { logLevel: 'silent' });
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asStrings(v: unknown): string[] {
  return asArray(v).filter((x): x is string => typeof x === 'string');
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
    if (!doc || typeof doc['identifier'] !== 'string') continue;

    const target: BoardTarget = {
      identifier: doc['identifier'],
      toolchains: asStrings(doc['toolchain']),
      supported: asStrings(doc['supported']),
    };
    if (typeof doc['name'] === 'string') target.name = doc['name'];
    if (typeof doc['arch'] === 'string') target.arch = doc['arch'];
    if (typeof doc['type'] === 'string') target.type = doc['type'];
    if (typeof doc['ram'] === 'number') target.ram = doc['ram'];
    if (typeof doc['flash'] === 'number') target.flash = doc['flash'];
    if (typeof doc['vendor'] === 'string') target.vendor = doc['vendor'];
    targets.push(target);
  }

  targets.sort((a, b) => a.identifier.localeCompare(b.identifier));
  return targets;
}

export function collectBoards(root: string): BoardRecord[] {
  const boards: BoardRecord[] = [];

  for (const rel of walk(join(root, 'boards'), {
    match: (name) => name === 'board.yml' || name === 'board.yaml',
  })) {
    const abs = join(root, 'boards', rel);
    const doc = safeYaml(abs);
    if (!doc) continue;

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
    const docPath = existsSync(join(boardDir, 'doc', 'index.rst'))
      ? `${relDir}/doc/index.rst`
      : undefined;

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

      const revisionRec =
        entry['revision'] && typeof entry['revision'] === 'object'
          ? (entry['revision'] as Record<string, unknown>)
          : null;

      // Targets are matched by prefix because an identifier is
      // `<board>/<soc>/<cluster>` and a directory can define several boards.
      const own = targets.filter(
        (t) => t.identifier === name || t.identifier.startsWith(`${name}/`),
      );
      const effective = own.length > 0 ? own : entries.length === 1 ? targets : [];

      const record: BoardRecord = {
        name,
        dir: relDir,
        socs,
        targets: effective,
        revisions: revisionRec ? asArray(revisionRec['revisions']).flatMap((r) =>
          r && typeof r === 'object' && typeof (r as Record<string, unknown>)['name'] === 'string'
            ? [(r as Record<string, unknown>)['name'] as string]
            : [],
        ) : [],
        supported: [...new Set(effective.flatMap((t) => t.supported))].sort(),
      };
      if (typeof entry['full_name'] === 'string') record.fullName = entry['full_name'];
      if (typeof entry['vendor'] === 'string') record.vendor = entry['vendor'];
      if (revisionRec && typeof revisionRec['default'] === 'string') {
        record.defaultRevision = revisionRec['default'];
      }
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
    if (!doc) continue;

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
