import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { fingerprint } from './index-descriptor.ts';

function git(root: string, args: string[]): string | null {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export interface GitTreeIdentity {
  commit: string;
  dirty: boolean;
  stateFingerprint: string;
}

/** Fingerprint a Git checkout including tracked changes and untracked file content. */
export function gitTreeIdentity(root: string): GitTreeIdentity | null {
  const canonical = realpathSync(root);
  const commit = git(canonical, ['rev-parse', 'HEAD']);
  if (!commit) return null;
  const diff = git(canonical, ['diff', '--binary', 'HEAD']) ?? '';
  const untracked = (git(canonical, ['ls-files', '--others', '--exclude-standard']) ?? '')
    .split('\n')
    .filter((path) => Boolean(path) && path !== '.zephyr-ai-managed.json')
    .sort()
    .map((path) => {
      const absolute = join(canonical, path);
      if (!existsSync(absolute)) return { path, missing: true };
      try {
        const stat = lstatSync(absolute);
        if (stat.isSymbolicLink()) return { path, symlink: readlinkSync(absolute) };
        if (!stat.isFile()) return { path, special: stat.mode };
        return {
          path,
          sha256: createHash('sha256').update(readFileSync(absolute)).digest('hex'),
        };
      } catch {
        return { path, unreadable: true };
      }
    });
  return {
    commit,
    dirty: Boolean(diff || untracked.length),
    stateFingerprint: fingerprint({ commit, diff, untracked }),
  };
}
