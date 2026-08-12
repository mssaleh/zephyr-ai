import { notStrictEqual, strictEqual } from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { after, describe, it } from 'node:test';

import { buildIndexDescriptor } from '../src/identity.ts';

const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-identity-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

function repository(path: string, files: Record<string, string>): void {
  mkdirSync(path, { recursive: true });
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(path, name, '..'), { recursive: true });
    writeFileSync(join(path, name), text);
  }
  for (const args of [
    ['init'],
    ['config', 'user.email', 'test@example.invalid'],
    ['config', 'user.name', 'Test'],
    ['add', '.'],
    ['commit', '-m', 'fixture'],
  ]) {
    const result = spawnSync('git', args, { cwd: path, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr);
  }
}

describe('index source identity', () => {
  it('changes context identity for uncommitted Zephyr and module content', () => {
    const zephyr = join(TEMPORARY, 'zephyr');
    const module = join(TEMPORARY, 'module');
    repository(zephyr, {
      VERSION: 'VERSION_MAJOR = 4\nVERSION_MINOR = 4\nPATCHLEVEL = 2\nEXTRAVERSION =\n',
      'doc/index.rst': 'Fixture\n-------\n',
    });
    repository(module, { 'zephyr/module.yml': 'build:\n  kconfig: Kconfig\n', Kconfig: 'config FIXTURE\n\tbool\n' });

    const clean = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    writeFileSync(join(zephyr, 'doc', 'index.rst'), 'Fixture changed\n===============\n');
    const dirtyTree = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    strictEqual(clean.zephyrCommit, dirtyTree.zephyrCommit);
    notStrictEqual(clean.zephyrTreeFingerprint, dirtyTree.zephyrTreeFingerprint);
    notStrictEqual(clean.contextFingerprint, dirtyTree.contextFingerprint);

    writeFileSync(join(module, 'Kconfig'), 'config FIXTURE_CHANGED\n\tbool\n');
    const dirtyModule = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    notStrictEqual(dirtyTree.moduleFingerprint, dirtyModule.moduleFingerprint);
    notStrictEqual(dirtyTree.contextFingerprint, dirtyModule.contextFingerprint);
  });
});
