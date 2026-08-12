import { match, strictEqual } from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-fetch-test-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

describe('safe Zephyr fetch', () => {
  it('never replaces a custom directory without its ownership marker', () => {
    const destination = join(TEMPORARY, 'user checkout');
    mkdirSync(join(destination, '.git'), { recursive: true });
    writeFileSync(join(destination, 'sentinel.txt'), 'preserve me\n');
    const result = spawnSync(
      process.execPath,
      [join(ROOT, 'scripts', 'fetch-zephyr.mjs'), '--force', '--dest', destination],
      { encoding: 'utf8' },
    );
    strictEqual(result.status, 1);
    match(result.stderr, /was not created by zephyr-ai/);
    strictEqual(readFileSync(join(destination, 'sentinel.txt'), 'utf8'), 'preserve me\n');
  });

  it('rejects repository-wide and home-directory destinations before touching them', () => {
    for (const destination of [ROOT, process.env.HOME].filter(Boolean)) {
      const result = spawnSync(
        process.execPath,
        [join(ROOT, 'scripts', 'fetch-zephyr.mjs'), '--force', '--dest', destination],
        { encoding: 'utf8' },
      );
      strictEqual(result.status, 1);
      match(result.stderr, /Refusing unsafe fetch destination/);
    }
  });
});

describe('plugin first-use index path', () => {
  it('passes persistent plugin data explicitly and offers the bundled pinned fetch', () => {
    const skill = readFileSync(join(ROOT, 'plugin', 'skills', 'zephyr-index', 'SKILL.md'), 'utf8');
    match(skill, /--project-root "\$\{CLAUDE_PROJECT_DIR\}"\s+\\\n\s+--plugin-data "\$\{CLAUDE_PLUGIN_DATA\}"/);
    match(skill, /ask\s+first[\s\S]+--fetch-pinned/);

    const help = spawnSync(
      process.execPath,
      [join(ROOT, 'plugin', 'mcp', 'zephyr-ingest.mjs'), '--help'],
      { encoding: 'utf8' },
    );
    strictEqual(help.status, 0);
    match(help.stdout, /--fetch-pinned/);
  });
});
