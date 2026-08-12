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
      ok(sample.files.includes('sample.yaml'));
      if (sample.docPath) ok(sample.files.includes('README.rst'));
    }
  });
});
