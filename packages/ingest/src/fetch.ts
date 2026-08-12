import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import lock from '../../../zephyr.lock.json' with { type: 'json' };

export const PINNED_ZEPHYR_LOCK: Record<string, string> = lock;

const MARKER = '.zephyr-ai-managed.json';

function git(args: string[], cwd?: string) {
  return spawnSync('git', args, {
    ...(cwd ? { cwd } : {}),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function checkoutIsReusable(destination: string): boolean {
  if (!existsSync(join(destination, '.git')) || !existsSync(join(destination, 'VERSION'))) return false;
  const head = git(['rev-parse', 'HEAD'], destination);
  if (head.status !== 0 || head.stdout.trim() !== lock.commit) return false;
  const status = git(['status', '--porcelain', '--untracked-files=all'], destination);
  if (status.status !== 0) return false;
  return status.stdout
    .split('\n')
    .filter(Boolean)
    .every((line) => line.endsWith(` ${MARKER}`));
}

/** Fetch the release pinned into this ingest bundle without replacing any existing path. */
export function fetchPinnedZephyr(pluginData: string, log: (message: string) => void): string {
  const destination = resolve(pluginData, 'sources', `zephyr-${lock.version}-${lock.commit.slice(0, 12)}`);
  if (checkoutIsReusable(destination)) {
    log(`Using pinned Zephyr ${lock.version} checkout at ${destination}`);
    return destination;
  }
  if (existsSync(destination)) {
    throw new Error(
      `Refusing to replace ${destination}: it is not a clean checkout of pinned Zephyr ${lock.version}.`,
    );
  }

  mkdirSync(dirname(destination), { recursive: true });
  const staging = mkdtempSync(join(dirname(destination), '.zephyr-ai-fetch-'));
  const candidate = join(staging, 'zephyr');
  try {
    log(`Cloning pinned Zephyr ${lock.version}; this requires network access and may take several minutes.`);
    const cloned = git(
      ['clone', '--depth', '1', '--branch', lock.tag, '--single-branch', lock.repository, candidate],
    );
    if (cloned.error) {
      throw new Error(`Cannot run git: ${cloned.error.message}`);
    }
    if (cloned.status !== 0) {
      throw new Error(`git clone failed: ${cloned.stderr.trim() || cloned.stdout.trim() || `status ${cloned.status}`}`);
    }
    const head = git(['rev-parse', 'HEAD'], candidate);
    if (head.status !== 0 || head.stdout.trim() !== lock.commit) {
      throw new Error(
        `Fetched commit ${head.stdout.trim() || 'unknown'} does not match the bundled pin ${lock.commit}.`,
      );
    }
    writeFileSync(
      join(candidate, MARKER),
      `${JSON.stringify({ owner: 'zephyr-ai', repository: lock.repository, tag: lock.tag, commit: lock.commit }, null, 2)}\n`,
      { flag: 'wx' },
    );
    renameSync(candidate, destination);
    log(`Pinned Zephyr ${lock.version} is ready at ${destination}`);
    return destination;
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
