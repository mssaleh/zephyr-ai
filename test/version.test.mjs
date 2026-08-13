import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const json = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

describe('release version', () => {
  it('matches every package, plugin manifest, marketplace entry, and skill', () => {
    const version = json('package.json').version;
    strictEqual(json('packages/ingest/package.json').version, version);
    strictEqual(json('packages/mcp-server/package.json').version, version);
    strictEqual(json('plugin/.claude-plugin/plugin.json').version, version);

    const marketplace = json('.claude-plugin/marketplace.json');
    strictEqual(marketplace.metadata.version, version);
    for (const plugin of marketplace.plugins) strictEqual(plugin.version, version);

    const lock = json('package-lock.json');
    strictEqual(lock.version, version);
    strictEqual(lock.packages[''].version, version);
    strictEqual(lock.packages['packages/ingest'].version, version);
    strictEqual(lock.packages['packages/mcp-server'].version, version);

    for (const entry of readdirSync(join(ROOT, 'plugin', 'skills'), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skill = readFileSync(join(ROOT, 'plugin', 'skills', entry.name, 'SKILL.md'), 'utf8');
      strictEqual(skill.match(/^\s+version:\s+"([^"]+)"$/m)?.[1], version, entry.name);
    }
  });

  it('strips the same fields from the fingerprint in the hook as in the shared code', () => {
    // The hook has no build step and cannot import the shared descriptor, so it
    // reimplements descriptorFingerprint. When `producer` was added and stripped
    // in one and not the other, every hook silently refused every index — which
    // looks exactly like a clean file, the same failure mode the schema check
    // below exists for. Nothing else ties the two field lists together.
    const stripped = (source) => {
      const body = source.match(/descriptorFingerprint\([\s\S]*?\{([\s\S]*?)\.\.\.semantic/);
      ok(body, 'could not find the destructuring in descriptorFingerprint');
      return [...body[1].matchAll(/^\s*(\w+)\s*:/gm)].map((match) => match[1]).sort();
    };
    const shared = stripped(readFileSync(join(ROOT, 'packages', 'shared', 'index-descriptor.ts'), 'utf8'));
    const hook = stripped(readFileSync(join(ROOT, 'plugin', 'scripts', 'index-paths.mjs'), 'utf8'));
    // The hook also strips contextFingerprint, which the shared signature already
    // excludes by type; everything else must match exactly.
    deepStrictEqual(
      shared,
      hook.filter((name) => name !== 'contextFingerprint' && name !== 'createdAt'),
    );
  });

  it('keeps the hooks in step with the index schema they refuse to read', () => {
    // The hooks are plain JS with no build step, so they cannot import the
    // constant and hardcode it instead. After a schema bump that nobody carried
    // across, every hook silently refuses every index — the validator exits 0
    // on an incompatible index by design, so the failure looks exactly like a
    // clean file. Nothing else in the gate ties these together.
    const shared = readFileSync(join(ROOT, 'packages', 'shared', 'index-descriptor.ts'), 'utf8');
    const schema = shared.match(/INDEX_SCHEMA_VERSION\s*=\s*(\d+)/)?.[1];
    const descriptor = shared.match(/INDEX_DESCRIPTOR_VERSION\s*=\s*(\d+)/)?.[1];
    ok(schema && descriptor, 'could not read the shared version constants');

    for (const hook of ['check-index.mjs', 'validate-zephyr-edit.mjs']) {
      const source = readFileSync(join(ROOT, 'plugin', 'scripts', hook), 'utf8');
      strictEqual(source.match(/EXPECTED_SCHEMA\s*=\s*(\d+)/)?.[1], schema, hook);
      strictEqual(source.match(/EXPECTED_DESCRIPTOR\s*=\s*(\d+)/)?.[1], descriptor, hook);
    }
  });
});
