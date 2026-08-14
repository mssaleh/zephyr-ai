/**
 * The modules the west manifest declares, and how much of each this index read.
 *
 * The manifest is a file inside the Zephyr tree, so the module set is a fact the
 * catalogue can state without leaving its declared inputs. What the catalogue
 * cannot state without reading a module is whether that module redeclares any of
 * the symbols Zephyr's in-tree glue also declares — and that difference decides
 * whether a promptless symbol is a build error or a mirror of one that has a
 * prompt somewhere the index never looked.
 */
import { parse as parseYaml } from 'yaml';

import type { SourceManifest } from '../../../shared/source-manifest.ts';
import { byField } from '../../../shared/ordering.ts';

export interface ModuleRecord {
  name: string;
  /** Workspace-relative, exactly as the manifest declares it. */
  path: string;
  revision: string;
  /** `modules/<glueDir>/…` in the Zephyr tree, when upstream ships glue for it. */
  glueDir: string;
  kconfigIngested: boolean;
  sourceIngested: boolean;
}

/** Where west keeps the manifest inside the Zephyr repository itself. */
const MANIFEST = 'west.yml';

/**
 * Glue directories under `modules/`, mapped to the single path segment.
 *
 * Only a directory counts. `modules/Kconfig.stm32` is a file upstream owns and
 * maintains; `modules/lvgl/Kconfig` is a directory named after a module and
 * mirrors that module's own symbols. Treating the two alike is what let an
 * assignment to a genuinely promptless symbol pass as clean.
 */
function glueDirectories(tree: SourceManifest): Set<string> {
  const found = new Set<string>();
  for (const path of tree.select({ under: 'modules/', match: (name) => name.startsWith('Kconfig') })) {
    const segments = path.split('/');
    if (segments.length > 2) found.add(segments[1]!);
  }
  return found;
}

/**
 * Read the manifest's project list.
 *
 * A malformed or absent manifest yields no modules rather than an error: the
 * module set narrows two claims and gates neither, so an index without it is
 * simply more conservative.
 */
export function collectModules(
  tree: SourceManifest,
  ingested: { name: string; kconfig: boolean; source: boolean }[] = [],
): ModuleRecord[] {
  if (!tree.has(MANIFEST)) return [];
  let parsed: unknown;
  try {
    parsed = parseYaml(tree.read(MANIFEST), { logLevel: 'silent' });
  } catch {
    return [];
  }
  const projects = (parsed as { manifest?: { projects?: unknown } } | null)?.manifest?.projects;
  if (!Array.isArray(projects)) return [];

  const glue = glueDirectories(tree);
  const byName = new Map(ingested.map((entry) => [entry.name, entry]));
  const records: ModuleRecord[] = [];

  for (const project of projects) {
    if (!project || typeof project !== 'object') continue;
    const entry = project as Record<string, unknown>;
    const name = typeof entry['name'] === 'string' ? entry['name'] : '';
    if (!name) continue;
    const path = typeof entry['path'] === 'string' ? entry['path'] : '';
    const revision = typeof entry['revision'] === 'string' ? entry['revision'] : '';
    // Upstream names the glue directory after either the project or the last
    // segment of its path, and the two differ often enough to check both:
    // `lvgl` sits at `modules/lib/gui/lvgl` and glues at `modules/lvgl`.
    const basename = path.split('/').filter(Boolean).pop() ?? '';
    const glueDir = [name, basename].find((candidate) => candidate && glue.has(candidate)) ?? '';
    const read = byName.get(name);
    records.push({
      name,
      path,
      revision,
      glueDir,
      kconfigIngested: read?.kconfig ?? false,
      sourceIngested: read?.source ?? false,
    });
  }
  return records.sort(byField((record) => record.name));
}

/**
 * Match an ingested module root back to the manifest project it belongs to.
 *
 * The root is a filesystem path chosen by whoever ran the ingest; the manifest
 * declares a workspace-relative one. Comparing the trailing segments is what
 * survives a workspace laid out somewhere other than where the manifest assumes.
 */
export function moduleNameForRoot(root: string, records: { name: string; path: string }[]): string | null {
  const normalise = (value: string) => value.replace(/\\/g, '/').replace(/\/+$/, '');
  const target = normalise(root);
  let best: { name: string; length: number } | null = null;
  for (const record of records) {
    const declared = normalise(record.path);
    if (!declared) continue;
    if (target === declared || target.endsWith(`/${declared}`)) {
      if (!best || declared.length > best.length) best = { name: record.name, length: declared.length };
    }
  }
  if (best) return best.name;
  const basename = target.split('/').pop() ?? '';
  return records.find((record) => record.name === basename)?.name ?? null;
}
