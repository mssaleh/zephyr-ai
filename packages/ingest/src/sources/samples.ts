import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { toPosix, walk } from '../walk.ts';
import { byField } from '../../../shared/ordering.ts';

/**
 * Whether a record came from a `sample.yaml` or a `testcase.yaml`.
 *
 * Twister validates both with one schema, so they are the same record with
 * different intent: a sample is a worked example to copy, a test is evidence of
 * what upstream verifies and on which boards. Keying this off the filename
 * rather than the directory is deliberate — the tree has `testcase.yaml` under
 * `samples/` and a `sample.yaml` under `tests/`, so a path prefix would mislabel
 * both.
 */
export type SampleKind = 'sample' | 'test';

export interface SampleRecord {
  /** Tree-relative directory, e.g. `samples/basic/blinky`. */
  path: string;
  kind: SampleKind;
  name: string;
  description?: string;
  tags: string[];
  /** Twister scenario ids under `tests:` — what `twister -s` takes. */
  scenarios: string[];
  dependsOn: string[];
  /** Boards the sample is routinely built against — the best "known good" targets. */
  integrationPlatforms: string[];
  platformAllow: string[];
  /** Interesting files present in the sample directory, relative to `path`. */
  files: string[];
  /**
   * Contents of the small, high-value files.
   *
   * Stored in the index rather than read from disk at query time so the server
   * works without a Zephyr checkout. A sample's `prj.conf` and board overlay are
   * the most directly reusable artefacts in the tree: together they show the
   * exact Kconfig and devicetree changes a feature needs.
   */
  contents: { path: string; text: string }[];
  exclusions: { path: string; reason: string }[];
  docPath?: string;
}

/** Per-file and per-sample caps, so one large sample cannot bloat the index. */
const MAX_FILE_BYTES = 64 * 1024;
const MAX_SAMPLE_BYTES = 160 * 1024;

function shouldStore(rel: string): boolean {
  if (
    /^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(rel)
  ) {
    return true;
  }
  return /\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(rel) &&
    /^(boards|snippets|src)\//.test(rel);
}

/** The manifest filenames Twister recognises, and the kind each one implies. */
const MANIFESTS: Record<string, SampleKind> = {
  'sample.yaml': 'sample',
  'testcase.yaml': 'test',
};

function readContents(
  sampleDir: string,
  files: string[],
): { contents: { path: string; text: string }[]; exclusions: { path: string; reason: string }[] } {
  const out: { path: string; text: string }[] = [];
  const exclusions: { path: string; reason: string }[] = [];
  let budget = MAX_SAMPLE_BYTES;

  for (const rel of files) {
    if (!shouldStore(rel)) continue;
    const abs = join(sampleDir, rel);
    try {
      if (statSync(abs).size > MAX_FILE_BYTES) {
        exclusions.push({ path: rel, reason: 'file-size-limit' });
        continue;
      }
      const text = readFileSync(abs, 'utf8');
      if (Buffer.byteLength(text) > budget) {
        exclusions.push({ path: rel, reason: 'sample-size-budget' });
        continue;
      }
      budget -= Buffer.byteLength(text);
      out.push({ path: rel, text });
    } catch (error) {
      throw new Error(`Failed to capture sample file ${abs}: ${(error as Error).message}`);
    }
  }
  return { contents: out, exclusions };
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return [v];
  return [];
}

function asStrings(v: unknown): string[] {
  return asArray(v).filter((x): x is string => typeof x === 'string');
}

/**
 * List the files worth pointing an agent at.
 *
 * A sample's value is its `prj.conf` plus its board overlays: together they show
 * the exact Kconfig and devicetree changes a feature needs, which is far more
 * reliable than reconstructing them from prose.
 */
function interestingFiles(sampleDir: string): string[] {
  const out: string[] = [];

  const push = (rel: string) => {
    if (existsSync(join(sampleDir, rel))) out.push(rel);
  };
  for (const f of [
    'sample.yaml',
    'testcase.yaml',
    'prj.conf',
    'CMakeLists.txt',
    'Kconfig',
    'sysbuild.conf',
    'README.rst',
  ]) {
    push(f);
  }

  for (const dir of ['src', 'boards', 'snippets']) {
    const abs = join(sampleDir, dir);
    if (!existsSync(abs)) continue;
    try {
      out.push(
        ...[...walk(abs, { match: (name) => shouldStore(`${dir}/${name}`) })]
          .sort()
          .map((path) => `${dir}/${path}`),
      );
    } catch {
      /* unreadable directory */
    }
  }

  return out;
}

export function collectSamples(root: string): SampleRecord[] {
  const samples: SampleRecord[] = [];
  const seen = new Set<string>();

  for (const subdir of ['samples', 'snippets', 'tests']) {
    const base = join(root, subdir);
    if (!existsSync(base)) continue;

    // `hasOwn`, not `in`: `in` also matches Object.prototype keys, so a file
    // named `constructor` or `toString` would pass the filter and then resolve
    // to a function instead of a kind. Sorted, so that a directory carrying both
    // manifests resolves the same way on every machine — `sample.yaml` sorts
    // first and wins — rather than following readdir order.
    for (const rel of [...walk(base, { match: (name) => Object.hasOwn(MANIFESTS, name) })].sort()) {
      const abs = join(base, rel);
      const manifest = rel.split('/').pop()!;
      const kind = MANIFESTS[manifest]!;
      let doc: Record<string, unknown> | null = null;
      try {
        const parsed = parseYaml(readFileSync(abs, 'utf8'), { logLevel: 'silent' });
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('expected a YAML mapping');
        }
        doc = parsed as Record<string, unknown>;
      } catch (error) {
        throw new Error(`Failed to parse ${manifest} metadata ${rel}: ${(error as Error).message}`);
      }

      const sampleDir = dirname(abs);
      const relDir = toPosix(join(subdir, dirname(rel)));
      if (seen.has(relDir)) continue;
      seen.add(relDir);

      const meta =
        doc['sample'] && typeof doc['sample'] === 'object'
          ? (doc['sample'] as Record<string, unknown>)
          : {};

      // Test entries carry the tags and the platform lists; merge across all of them.
      const tests =
        doc['tests'] && typeof doc['tests'] === 'object'
          ? (doc['tests'] as Record<string, unknown>)
          : {};
      const common =
        doc['common'] && typeof doc['common'] === 'object' && !Array.isArray(doc['common'])
          ? (doc['common'] as Record<string, unknown>)
          : {};
      const tags = new Set<string>();
      const dependsOn = new Set<string>();
      const integration = new Set<string>();
      const platformAllow = new Set<string>();

      const addMetadata = (t: Record<string, unknown>): void => {
        for (const x of asStrings(t['tags'])) tags.add(x);
        if (typeof t['tags'] === 'string') {
          for (const x of t['tags'].split(/\s+/).filter(Boolean)) tags.add(x);
        }
        for (const x of asStrings(t['depends_on'])) dependsOn.add(x);
        for (const x of asStrings(t['integration_platforms'])) integration.add(x);
        for (const x of asStrings(t['platform_allow'])) platformAllow.add(x);
      };
      addMetadata(common);
      for (const value of Object.values(tests)) {
        if (!value || typeof value !== 'object') continue;
        addMetadata({ ...common, ...(value as Record<string, unknown>) });
      }

      const eligibleFiles = interestingFiles(sampleDir);
      const { contents, exclusions } = readContents(sampleDir, eligibleFiles);
      const files = contents.map((file) => file.path);
      const record: SampleRecord = {
        path: relDir,
        kind,
        name: typeof meta['name'] === 'string' ? meta['name'] : relDir.split('/').pop()!,
        tags: [...tags].sort(),
        scenarios: Object.keys(tests).sort(),
        dependsOn: [...dependsOn].sort(),
        integrationPlatforms: [...integration].sort(),
        platformAllow: [...platformAllow].sort(),
        files,
        contents,
        exclusions,
      };
      if (typeof meta['description'] === 'string') record.description = meta['description'];
      if (existsSync(join(sampleDir, 'README.rst'))) record.docPath = `${relDir}/README.rst`;

      samples.push(record);
    }
  }

  samples.sort(byField((sample) => sample.path));
  return samples;
}
