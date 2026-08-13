#!/usr/bin/env node
/**
 * Prove the ingest is a function of its inputs.
 *
 * Builds the index twice into a temporary directory and compares the content
 * digest each build recorded. Two runs on one machine share every input, so any
 * difference is the ingest depending on something it was never given — a
 * filesystem order, a clock, an iteration order that is not what it looks like.
 *
 * This is the half of reproducibility a fixture cannot check. The pinned digest
 * in baseline-counts.json catches drift *between* machines; only building twice
 * catches an ingest that does not agree with itself, and that failure would make
 * the pinned digest unmaintainable rather than merely wrong.
 *
 * Whether the recorded digest actually describes the file it sits in is a
 * separate claim, checked by the ingest test suite, which can import the digest
 * itself. This script deliberately trusts nothing but the two recorded values.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const INGEST = join(ROOT, 'packages', 'ingest', 'dist', 'cli.js');

const workspace = mkdtempSync(join(tmpdir(), 'zephyr-ai-reproducible-'));
try {
  const digests = [];
  for (const run of ['first', 'second']) {
    const out = join(workspace, `${run}.db`);
    const build = spawnSync(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', INGEST, '--no-api-xml-auto-detect', '--out', out, '--quiet'],
      { cwd: ROOT, encoding: 'utf8' },
    );
    if (build.status !== 0) {
      throw new Error(
        `The ${run} index build failed:\n${build.stderr.trim().split('\n').slice(-8).join('\n')}`,
      );
    }
    const db = new DatabaseSync(out, { readOnly: true });
    try {
      const stored = db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get()?.value;
      if (!stored) throw new Error(`The ${run} build recorded no content_hash.`);
      digests.push(String(stored));
    } finally {
      db.close();
    }
  }

  if (digests[0] !== digests[1]) {
    process.stderr.write(
      'Two builds of the same tree produced different content:\n' +
        `  ${digests[0]}\n  ${digests[1]}\n\n` +
        'The ingest is depending on something it was not given. Look for an unsorted walk(), an ' +
        'iteration over a Set or Map filled in filesystem order, or a value derived from the ' +
        'clock or from an absolute path.\n',
    );
    process.exitCode = 1;
  }
  process.stdout.write(`${JSON.stringify({ digest: digests[0], builds: digests.length }, null, 2)}\n`);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
