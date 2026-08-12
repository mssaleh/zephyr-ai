import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { toPosix, walk } from '../walk.ts';

export interface SampleRecord {
  /** Tree-relative directory, e.g. `samples/basic/blinky`. */
  path: string;
  name: string;
  description?: string;
  tags: string[];
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
  docPath?: string;
}

/** Per-file and per-sample caps, so one large sample cannot bloat the index. */
const MAX_FILE_BYTES = 64 * 1024;
const MAX_SAMPLE_BYTES = 160 * 1024;

function shouldStore(rel: string): boolean {
  if (/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml)$/.test(rel)) return true;
  if (/^boards\/.*\.(overlay|conf|dts|dtsi)$/.test(rel)) return true;
  if (/^snippets\/.*\.(overlay|conf|yml|yaml)$/.test(rel)) return true;
  if (/^src\/.*\.(c|h|cpp|hpp)$/.test(rel)) return true;
  return false;
}

function readContents(sampleDir: string, files: string[]): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  let budget = MAX_SAMPLE_BYTES;

  for (const rel of files) {
    if (!shouldStore(rel)) continue;
    const abs = join(sampleDir, rel);
    try {
      if (statSync(abs).size > MAX_FILE_BYTES) continue;
      const text = readFileSync(abs, 'utf8');
      if (text.length > budget) continue;
      budget -= text.length;
      out.push({ path: rel, text });
    } catch {
      /* unreadable file */
    }
  }
  return out;
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
  for (const f of ['prj.conf', 'CMakeLists.txt', 'Kconfig', 'sysbuild.conf', 'README.rst']) {
    push(f);
  }

  for (const dir of ['src', 'boards', 'snippets']) {
    const abs = join(sampleDir, dir);
    if (!existsSync(abs)) continue;
    try {
      for (const entry of readdirSync(abs, { withFileTypes: true })) {
        if (entry.isFile()) out.push(`${dir}/${entry.name}`);
      }
    } catch {
      /* unreadable directory */
    }
  }

  return out;
}

export function collectSamples(root: string): SampleRecord[] {
  const samples: SampleRecord[] = [];
  const seen = new Set<string>();

  for (const subdir of ['samples', 'snippets']) {
    const base = join(root, subdir);
    if (!existsSync(base)) continue;

    for (const rel of walk(base, { match: (name) => name === 'sample.yaml' })) {
      const abs = join(base, rel);
      let doc: Record<string, unknown> | null = null;
      try {
        const parsed = parseYaml(readFileSync(abs, 'utf8'), { logLevel: 'silent' });
        doc = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
      } catch {
        continue;
      }
      if (!doc) continue;

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
      const tags = new Set<string>();
      const dependsOn = new Set<string>();
      const integration = new Set<string>();
      const platformAllow = new Set<string>();

      for (const value of Object.values(tests)) {
        if (!value || typeof value !== 'object') continue;
        const t = value as Record<string, unknown>;
        for (const x of asStrings(t['tags'])) tags.add(x);
        // `tags` is sometimes a space-separated scalar rather than a list.
        if (typeof t['tags'] === 'string') {
          for (const x of t['tags'].split(/\s+/).filter(Boolean)) tags.add(x);
        }
        for (const x of asStrings(t['depends_on'])) dependsOn.add(x);
        for (const x of asStrings(t['integration_platforms'])) integration.add(x);
        for (const x of asStrings(t['platform_allow'])) platformAllow.add(x);
      }

      const files = interestingFiles(sampleDir);
      const record: SampleRecord = {
        path: relDir,
        name: typeof meta['name'] === 'string' ? meta['name'] : relDir.split('/').pop()!,
        tags: [...tags].sort(),
        dependsOn: [...dependsOn].sort(),
        integrationPlatforms: [...integration].sort(),
        platformAllow: [...platformAllow].sort(),
        files,
        contents: readContents(sampleDir, files),
      };
      if (typeof meta['description'] === 'string') record.description = meta['description'];
      if (existsSync(join(sampleDir, 'README.rst'))) record.docPath = `${relDir}/README.rst`;

      samples.push(record);
    }
  }

  samples.sort((a, b) => a.path.localeCompare(b.path));
  return samples;
}
