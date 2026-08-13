import { deepStrictEqual, match, notStrictEqual, ok, strictEqual, throws } from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { after, describe, it } from 'node:test';

import { SourceManifest, gitBlobHash } from '../../shared/source-manifest.ts';

const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-manifest-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

function tree(label: string, files: Record<string, string>): string {
  const root = mkdtempSync(join(TEMPORARY, `${label}-`));
  for (const [path, text] of Object.entries(files)) {
    const absolute = join(root, path);
    mkdirSync(join(absolute, '..'), { recursive: true });
    writeFileSync(absolute, text);
  }
  return root;
}

function asRepository(root: string, ignore?: string): string {
  if (ignore) writeFileSync(join(root, '.gitignore'), `${ignore}\n`);
  for (const args of [
    ['init', '-q'],
    ['config', 'user.email', 'test@example.invalid'],
    ['config', 'user.name', 'test'],
    ['add', '-A'],
    ['commit', '-qm', 'fixture'],
  ]) {
    spawnSync('git', ['-C', root, ...args], { stdio: 'ignore' });
  }
  return root;
}

describe('source manifest', () => {
  it('agrees with git about content hashes', () => {
    const root = asRepository(tree('hash', { 'VERSION': 'MAJOR = 4\n' }));
    const manifest = SourceManifest.forRoot(root);
    const listed = spawnSync('git', ['-C', root, 'ls-files', '-s', 'VERSION'], { encoding: 'utf8' });
    const fromGit = listed.stdout.trim().split(/\s+/)[1];
    strictEqual(manifest.entries.find((entry) => entry.path === 'VERSION')?.hash, fromGit);
    strictEqual(gitBlobHash(Buffer.from('MAJOR = 4\n')), fromGit);
  });

  it('refuses a read it never declared', () => {
    // An undeclared read means the input set is not what it says it is. Absorbing
    // it is how a build comes to depend on something nobody wrote down.
    const root = asRepository(tree('undeclared', { 'a.txt': 'a\n' }));
    const manifest = SourceManifest.forRoot(root);
    writeFileSync(join(root, 'sneaked-in.txt'), 'not declared\n');
    throws(() => manifest.read('sneaked-in.txt'), /is not a declared input/);
  });

  it('refuses a file that changed under the build', () => {
    const root = asRepository(tree('changed', { 'a.txt': 'original\n' }));
    const manifest = SourceManifest.forRoot(root);
    strictEqual(manifest.read('a.txt'), 'original\n');
    writeFileSync(join(root, 'a.txt'), 'rewritten\n');
    throws(() => manifest.read('a.txt'), /changed while the index was being built/);
  });

  it('takes the worktree, not the index, for a modified file', () => {
    // git ls-files reports the staged blob. Reading that hash while the ingest
    // reads the worktree would declare one thing and consume another.
    const root = asRepository(tree('dirty', { 'a.txt': 'committed\n' }));
    writeFileSync(join(root, 'a.txt'), 'modified\n');
    const manifest = SourceManifest.forRoot(root);
    strictEqual(manifest.read('a.txt'), 'modified\n');
    strictEqual(
      manifest.entries.find((entry) => entry.path === 'a.txt')?.hash,
      gitBlobHash(Buffer.from('modified\n')),
    );
  });

  it('includes untracked files and drops deleted ones', () => {
    const root = asRepository(tree('delta', { 'kept.txt': 'k\n', 'gone.txt': 'g\n' }));
    writeFileSync(join(root, 'added.txt'), 'a\n');
    rmSync(join(root, 'gone.txt'));
    const manifest = SourceManifest.forRoot(root);
    const paths = manifest.entries.map((entry) => entry.path).filter((p) => p.endsWith('.txt'));
    ok(paths.includes('added.txt'), 'an untracked file is still an input');
    ok(!paths.includes('gone.txt'), 'a deleted file is not');
  });

  it('marks a source it cannot address, rather than assuming it can', () => {
    // Users index plain checkouts. Refusing would break them; pretending the
    // result is reproducible would be worse.
    const plain = tree('plain', { 'a.txt': 'a\n' });
    const manifest = SourceManifest.forRoot(plain);
    strictEqual(manifest.addressed, false);
    strictEqual(manifest.entries.length, 1);
    strictEqual(manifest.read('a.txt'), 'a\n');
    strictEqual(SourceManifest.forRoot(asRepository(tree('addressed', { 'a.txt': 'a\n' }))).addressed, true);
  });

  it('orders entries by code units, independently of the collator', () => {
    const root = asRepository(
      tree('order', { 'I_LOW.txt': '1\n', 'i_low.txt': '2\n', 'a.txt': '3\n', 'B.txt': '4\n' }),
    );
    const paths = SourceManifest.forRoot(root)
      .select({ match: (name) => name.endsWith('.txt') })
      .filter((path) => path !== '.gitignore');
    deepStrictEqual(paths, [...paths].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)));
  });

  it('selects by subtree, prefix and segment', () => {
    const root = asRepository(
      tree('select', {
        'include/zephyr/a.h': '1\n',
        'include/zephyr/internal/b.h': '2\n',
        'doc/_build/c.rst': '3\n',
        'doc/d.rst': '4\n',
      }),
    );
    const manifest = SourceManifest.forRoot(root);
    deepStrictEqual(
      manifest.select({ under: 'include/zephyr', skip: ['include/zephyr/internal'], match: (n) => n.endsWith('.h') }),
      ['include/zephyr/a.h'],
    );
    deepStrictEqual(
      manifest.select({ under: 'doc', skipSegments: new Set(['_build']), match: (n) => n.endsWith('.rst') }),
      ['doc/d.rst'],
    );
  });

  it('changes its fingerprint when any declared input changes', () => {
    const root = asRepository(tree('fingerprint', { 'a.txt': 'a\n' }));
    const before = SourceManifest.forRoot(root).fingerprint();
    writeFileSync(join(root, 'a.txt'), 'b\n');
    notStrictEqual(SourceManifest.forRoot(root).fingerprint(), before);
  });

  it('excludes ignored build artefacts', () => {
    const root = asRepository(tree('ignored', { 'a.txt': 'a\n' }), '*.pyc');
    writeFileSync(join(root, 'stale.pyc'), 'compiled\n');
    const manifest = SourceManifest.forRoot(root);
    ok(!manifest.has('stale.pyc'));
    throws(() => manifest.read('stale.pyc'), /is not a declared input/);
  });
});
