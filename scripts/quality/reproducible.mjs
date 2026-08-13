#!/usr/bin/env node
/**
 * The index is a derivation: `input_hash` determines `content_hash`.
 *
 * This used to sample axes one at a time — build under another locale, build from
 * another path, build with the Doxygen listing reversed — and each sample only
 * ever proved the axis someone had already thought of. Four machine dependencies
 * shipped that way, because the fifth axis is always the one nobody sampled.
 *
 * So this varies everything at once and checks a single property instead. Two
 * builds of the same tree, one of them under a deliberately hostile environment,
 * must agree on both hashes. When they do not, the pair says which of exactly two
 * things went wrong rather than leaving a search:
 *
 *   input_hash differs                      -> the inputs differ; look at which
 *   input_hash matches, content_hash differs -> the derivation is impure
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const INGEST = join(ROOT, 'packages', 'ingest', 'dist', 'cli.js');

/**
 * An environment chosen to break a build that reads anything it was not given.
 *
 * Every entry here is a channel that has actually changed the catalogue at some
 * point: a collator that reorders API symbols, the toolchain variables Zephyr's
 * Kconfig reads 56 times, a Python hash seed that permutes set iteration in the
 * adapters. The hermetic re-exec should make all of it inert.
 */
const HOSTILE = {
  LC_ALL: 'tr_TR.UTF-8',
  LANG: 'tr_TR.UTF-8',
  LC_COLLATE: 'tr_TR.UTF-8',
  TZ: 'Pacific/Kiritimati',
  PYTHONHASHSEED: 'random',
  ZEPHYR_TOOLCHAIN_VARIANT: 'zephyr',
  ZEPHYR_SDK_INSTALL_DIR: '/nonexistent/sdk',
  ZEPHYR_EXTRA_MODULES: '/nonexistent/modules',
  KCONFIG_BOARD_DIR: '/nonexistent/boards',
};

const ZEPHYR = join(ROOT, '.cache', 'zephyr');

function build(out, environment, cwd) {
  // The tree is named rather than defaulted, because the default is derived from
  // the working directory: varying cwd would otherwise change which tree is read,
  // which is a different thing from the property under test.
  const result = spawnSync(
    process.execPath,
    [
      '--disable-warning=ExperimentalWarning',
      INGEST,
      '--zephyr',
      ZEPHYR,
      '--no-api-xml-auto-detect',
      '--out',
      out,
      '--quiet',
    ],
    { cwd, encoding: 'utf8', env: environment },
  );
  if (result.status !== 0) {
    throw new Error(`build failed:\n${result.stderr.trim().split('\n').slice(-8).join('\n')}`);
  }
  const db = new DatabaseSync(out, { readOnly: true });
  try {
    const read = (key) => String(db.prepare('SELECT value FROM meta WHERE key = ?').get(key)?.value ?? '');
    return {
      input: read('input_hash'),
      content: read('content_hash'),
      tables: JSON.parse(read('table_hashes') || '{}'),
    };
  } finally {
    db.close();
  }
}

const workspace = mkdtempSync(join(tmpdir(), 'zephyr-ai-reproducible-'));
try {
  const plain = build(join(workspace, 'plain.db'), { ...process.env }, ROOT);
  // A different working directory as well, because cwd is an ambient input like
  // any other and nothing else in the gate varies it.
  const hostile = build(join(workspace, 'hostile.db'), { ...process.env, ...HOSTILE }, workspace);

  if (plain.input !== hostile.input) {
    const both = new Set([...Object.keys(plain.tables), ...Object.keys(hostile.tables)]);
    const differing = [...both].filter((table) => plain.tables[table] !== hostile.tables[table]);
    process.stderr.write(
      'The declared inputs differ between two builds of the same tree:\n' +
        `  ${plain.input}\n  ${hostile.input}\n\n` +
        'Something in the environment reached the input declaration. Check what the ' +
        'hermetic environment carries, and whether a manifest picked up a file that ' +
        'depends on where or how the build ran.\n' +
        (differing.length ? `Content differs in: ${differing.join(', ')}\n` : ''),
    );
    process.exitCode = 1;
  } else if (plain.content !== hostile.content) {
    const differing = Object.keys(plain.tables).filter(
      (table) => plain.tables[table] !== hostile.tables[table],
    );
    process.stderr.write(
      'The same inputs produced a different catalogue, so the derivation is impure:\n' +
        `  input_hash ${plain.input}\n` +
        `  ${plain.content}\n  ${hostile.content}\n\n` +
        `Content differs in: ${differing.join(', ') || '(table set changed)'}\n` +
        'Look for something read outside the manifest, or an ordering that still ' +
        'follows the machine rather than the data.\n',
    );
    process.exitCode = 1;
  }

  process.stdout.write(
    `${JSON.stringify({ inputHash: plain.input, contentHash: plain.content, hostileEnvironment: Object.keys(HOSTILE).length }, null, 2)}\n`,
  );
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
