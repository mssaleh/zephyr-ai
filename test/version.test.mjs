import { strictEqual } from 'node:assert/strict';
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
});
