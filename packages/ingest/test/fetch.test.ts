import { strictEqual, throws } from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { fetchPinnedZephyr, PINNED_ZEPHYR_LOCK } from '../src/fetch.ts';

describe('bundled pinned-tree fetch', () => {
  it('never replaces an existing path that is not the exact clean pin', () => {
    const pluginData = mkdtempSync(join(tmpdir(), 'zephyr-ai-bundled-fetch-'));
    const destination = join(
      pluginData,
      'sources',
      `zephyr-${PINNED_ZEPHYR_LOCK['version']}-${PINNED_ZEPHYR_LOCK['commit']!.slice(0, 12)}`,
    );
    try {
      mkdirSync(destination, { recursive: true });
      const sentinel = join(destination, 'sentinel.txt');
      writeFileSync(sentinel, 'preserve me\n');
      throws(
        () => fetchPinnedZephyr(pluginData, () => undefined),
        /Refusing to replace/,
      );
      strictEqual(existsSync(sentinel), true);
      strictEqual(readFileSync(sentinel, 'utf8'), 'preserve me\n');
    } finally {
      rmSync(pluginData, { recursive: true, force: true });
    }
  });
});
