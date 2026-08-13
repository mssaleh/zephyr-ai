import { ok, strictEqual } from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { collectBoards } from '../src/sources/boards.ts';
import { collectSamples } from '../src/sources/samples.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const haveTree = existsSync(join(ZEPHYR, 'boards'));
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !haveTree) {
  throw new Error('Release tests require the pinned Zephyr hardware and sample trees.');
}

describe('boards and samples against the real Zephyr tree', { skip: !haveTree && 'Zephyr tree not fetched' }, () => {
  it('enumerates all targets derived from board qualifiers and Twister metadata', () => {
    const boards = collectBoards(ZEPHYR);
    const audited = [
      'adafruit_feather_esp32s2',
      'cdns_swerv',
      'intel_adsp',
      'nucleo_n657x0_q',
      'stm32_min_dev',
      'stm32n6570_dk',
    ];
    for (const name of audited) {
      const board = boards.find((candidate) => candidate.name === name);
      ok(board, `missing board ${name}`);
      ok(board!.targets.length > 0, `${name} has no targets`);
    }
    const revision = boards.find((board) => board.name === 'stm32_min_dev')!;
    strictEqual(revision.defaultRevision, 'blue');
    ok(revision.revisions.includes('black'));
  });

  it('applies common Twister metadata and stores every eligible sample file', () => {
    const samples = collectSamples(ZEPHYR);
    ok(samples.some((sample) => sample.tags.length > 0));
    for (const sample of samples) {
      strictEqual(sample.files.length, sample.contents.length, `eligible/stored mismatch for ${sample.path}`);
      // The manifest a record is defined by, which is the filename its kind is
      // read from rather than the directory it happens to sit in.
      ok(sample.files.includes(sample.kind === 'test' ? 'testcase.yaml' : 'sample.yaml'), sample.path);
      if (sample.docPath) ok(sample.files.includes('README.rst'));
    }
  });

  it('indexes Twister suites under tests/ and keys the kind off the manifest', () => {
    // Upstream validates sample.yaml and testcase.yaml with one schema, so the
    // parser needs no special case — but the tree has testcase.yaml under
    // samples/ and a sample.yaml under tests/, so a path prefix would mislabel
    // both. The filename is the honest discriminator.
    const samples = collectSamples(ZEPHYR);
    const tests = samples.filter((sample) => sample.kind === 'test');
    ok(tests.length > 0, 'no testcase.yaml was indexed');
    ok(tests.some((sample) => sample.path.startsWith('tests/')));
    ok(
      tests.some((sample) => sample.path.startsWith('samples/')),
      'a testcase.yaml under samples/ must still be a test',
    );
    ok(
      samples.some((sample) => sample.kind === 'sample' && sample.path.startsWith('tests/')),
      'a sample.yaml under tests/ must still be a sample',
    );
    ok(tests.some((sample) => sample.scenarios.length > 0), 'twister scenario ids are not captured');
  });
});
