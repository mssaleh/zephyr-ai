/**
 * What a build actually used, as opposed to what the tree makes possible.
 *
 * `build/zephyr/.config` and `build/zephyr/zephyr.dts` are the only artefacts
 * that state the outcome of every decision the build made — which defaults won,
 * which `depends on` went unmet, which overlay applied, which node ended up
 * enabled. Every question about a merged devicetree or a resolved Kconfig value
 * is answered there and nowhere else, which is why a session with a build
 * directory ends up reading these files directly.
 *
 * A resolved build is a *layer over* the catalogue, never a replacement for it.
 * The catalogue says what a symbol is and what it depends on; the resolved build
 * says what it came out as, for one board, one application, and one moment. Kept
 * in their own tables, the two answer different questions and neither can be
 * mistaken for the other.
 *
 * This also subsumes the per-SoC gap for any project that has built once: a
 * resolved `.config` contains every SoC symbol the catalogue cannot reach,
 * because by then an SoC has been selected.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { byField } from '../../../shared/ordering.ts';
import type { SourceReport } from '../report.ts';

export interface ResolvedConfigRecord {
  name: string;
  /** The value as written, or the empty string for an explicitly unset symbol. */
  value: string;
  set: boolean;
}

export interface ResolvedNodeRecord {
  path: string;
  label: string;
  compatible: string;
  status: string;
}

export interface CollectedResolvedBuild {
  configs: ResolvedConfigRecord[];
  nodes: ResolvedNodeRecord[];
  /** Files actually read, for the input manifest and the coverage note. */
  files: { path: string; bytes: number }[];
  report: SourceReport;
}

/** Read `<build>/zephyr/.config` in kconfiglib's own output format. */
function readConfig(path: string, errors: SourceReport['errors']): ResolvedConfigRecord[] {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    errors.push({ path, code: 'config-read', message: (error as Error).message });
    return [];
  }
  const records: ResolvedConfigRecord[] = [];
  const seen = new Set<string>();
  for (const line of text.split('\n')) {
    // kconfiglib writes an unset bool as a comment, and that is a resolved value
    // rather than an absence — treating it as missing would make "I set this and
    // it did not take" unanswerable, which is the question this table is for.
    const unset = /^\s*#\s*(?:SB_)?CONFIG_([A-Za-z0-9_]+)\s+is not set\s*$/.exec(line);
    if (unset) {
      const name = unset[1]!;
      if (!seen.has(name)) {
        seen.add(name);
        records.push({ name, value: '', set: false });
      }
      continue;
    }
    const assigned = /^\s*(?:SB_)?CONFIG_([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!assigned) continue;
    const name = assigned[1]!;
    if (seen.has(name)) continue;
    seen.add(name);
    records.push({ name, value: assigned[2]!.trim(), set: true });
  }
  return records.sort(byField((record) => record.name));
}

/**
 * Read the merged devicetree into one row per node.
 *
 * This is a scan rather than a parse, and it is confined to the three facts that
 * make a node identifiable and answer the question that brings people here — is
 * this node in the final tree, and is it enabled. Anything finer belongs to
 * `get_source` on the file itself, which is exact.
 */
function readDevicetree(path: string, errors: SourceReport['errors']): ResolvedNodeRecord[] {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    errors.push({ path, code: 'dts-read', message: (error as Error).message });
    return [];
  }
  const source = text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, '');

  const nodes: ResolvedNodeRecord[] = [];
  const stack: string[] = [];
  let pending: { label: string; name: string } | null = null;
  let current: { path: string; label: string; compatible: string; status: string } | null = null;
  const flush = (): void => {
    if (current) nodes.push({ ...current });
    current = null;
  };

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (line === '') continue;

    const open = /^(?:([A-Za-z_][\w-]*)\s*:\s*)?([^\s{};]+)\s*\{$/.exec(line);
    if (open) {
      flush();
      pending = { label: open[1] ?? '', name: open[2]! };
      stack.push(pending.name);
      current = {
        path: `/${stack.filter((part) => part !== '/').join('/')}`,
        label: pending.label,
        compatible: '',
        status: '',
      };
      continue;
    }
    if (line.startsWith('}')) {
      flush();
      stack.pop();
      continue;
    }
    if (!current) continue;
    const compatible = /^compatible\s*=\s*(.+);$/.exec(line);
    if (compatible) {
      current.compatible = [...compatible[1]!.matchAll(/"([^"]*)"/g)].map((m) => m[1]!).join(' ');
      continue;
    }
    const status = /^status\s*=\s*"([^"]*)"\s*;$/.exec(line);
    if (status) current.status = status[1]!;
  }
  flush();
  return nodes
    .filter((node) => node.compatible || node.status || node.label)
    .sort(byField((node) => `${node.path} ${node.label}`));
}

export function collectResolvedBuild(buildDirectory: string): CollectedResolvedBuild {
  const errors: SourceReport['errors'] = [];
  const warnings: SourceReport['warnings'] = [];
  const configPath = join(buildDirectory, 'zephyr', '.config');
  const dtsPath = join(buildDirectory, 'zephyr', 'zephyr.dts');

  const files: { path: string; bytes: number }[] = [];
  for (const path of [configPath, dtsPath]) {
    if (existsSync(path)) files.push({ path, bytes: statSync(path).size });
  }
  if (files.length === 0) {
    warnings.push({
      path: buildDirectory,
      code: 'no-resolved-output',
      message:
        'the build directory holds neither zephyr/.config nor zephyr/zephyr.dts; ' +
        'run a build there before indexing it as a resolved build',
    });
  }

  const configs = existsSync(configPath) ? readConfig(configPath, errors) : [];
  const nodes = existsSync(dtsPath) ? readDevicetree(dtsPath, errors) : [];

  return {
    configs,
    nodes,
    files,
    report: {
      discovered: files.length,
      indexed: configs.length + nodes.length,
      intentionallyExcluded: [],
      warnings,
      errors,
    },
  };
}
