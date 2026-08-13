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
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const INGEST = join(ROOT, 'packages', 'ingest', 'dist', 'cli.js');

const DOXYGEN_XML = join(ROOT, '.cache', 'doxygen', 'xml');

/**
 * A copy of the Doxygen XML with index.xml's compounds in the opposite order.
 *
 * Doxygen lists compounds in its own traversal of the input tree, and that order
 * is not the same on two machines. The exporter merges a member seen in both a
 * file and a group compound, so the order decided which record was kept and which
 * was merged into it — identical counts, different content, invisible until a CI
 * release build compared digests. Reversing it here reproduces that difference
 * locally, which is the only reason this is checkable before a tag.
 */
function reversedXml(destination) {
  cpSync(DOXYGEN_XML, destination, { recursive: true });
  const indexPath = join(destination, 'index.xml');
  const text = readFileSync(indexPath, 'utf8');
  const compounds = [...text.matchAll(/<compound [\s\S]*?<\/compound>/g)].map((match) => match[0]);
  if (compounds.length === 0) throw new Error('the Doxygen index.xml lists no compounds');
  const first = text.indexOf(compounds[0]);
  const last = compounds[compounds.length - 1];
  const end = text.lastIndexOf(last) + last.length;
  writeFileSync(indexPath, text.slice(0, first) + [...compounds].reverse().join('\n') + text.slice(end));
  return compounds.length;
}

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
  // The semantic corpus is a different code path with a different input, and it
  // is the one that shipped a machine-dependent ordering. Checked only when the
  // Doxygen XML is present, which is the release tier.
  const semantic = [];
  let reversedCompounds = 0;
  if (existsSync(join(DOXYGEN_XML, 'index.xml'))) {
    const shuffled = join(workspace, 'xml-reversed');
    reversedCompounds = reversedXml(shuffled);
    for (const [run, xml] of [['semantic', DOXYGEN_XML], ['semantic-reversed', shuffled]]) {
      const out = join(workspace, `${run}.db`);
      const build = spawnSync(
        process.execPath,
        ['--disable-warning=ExperimentalWarning', INGEST, '--api-xml', xml, '--out', out, '--quiet'],
        { cwd: ROOT, encoding: 'utf8' },
      );
      if (build.status !== 0) {
        throw new Error(
          `The ${run} index build failed:\n${build.stderr.trim().split('\n').slice(-8).join('\n')}`,
        );
      }
      const db = new DatabaseSync(out, { readOnly: true });
      try {
        semantic.push(String(db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get()?.value));
      } finally {
        db.close();
      }
    }
    if (semantic[0] !== semantic[1]) {
      process.stderr.write(
        'The semantic corpus depends on the order Doxygen lists its compounds:\n' +
          `  ${semantic[0]}\n  ${semantic[1]}\n\n` +
          'Two machines running the same Doxygen will disagree. Make the exporter\'s ' +
          'traversal and its merge tie-breaks independent of index.xml order.\n',
      );
      process.exitCode = 1;
    }
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        digest: digests[0],
        builds: digests.length,
        ...(semantic.length ? { semanticDigest: semantic[0], reversedCompounds } : {}),
      },
      null,
      2,
    )}\n`,
  );
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
