#!/usr/bin/env node
/**
 * Fetch the pinned upstream Zephyr tree used to build the default index.
 *
 * A shallow, single-branch clone of one tag is ~610 MB on disk and takes
 * ~15 s on a warm connection, so this is deliberately *not* a git submodule:
 * submodules would force the weight onto everyone who clones this repo,
 * including users who only want the plugin. The tree is a build input,
 * pinned by commit in zephyr.lock.json, and lives in .cache/ (gitignored).
 *
 * Usage:
 *   node scripts/fetch-zephyr.mjs                # fetch the pinned revision
 *   node scripts/fetch-zephyr.mjs --force        # re-clone from scratch
 *   node scripts/fetch-zephyr.mjs --update v4.5.0  # re-pin the lockfile to a tag
 *   node scripts/fetch-zephyr.mjs --dest <path>  # clone somewhere else
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCKFILE = join(ROOT, 'zephyr.lock.json');

function git(args, opts = {}) {
  const res = spawnSync('git', args, { encoding: 'utf8', ...opts });
  if (res.error) throw res.error;
  return res;
}

function gitOrThrow(args, opts = {}) {
  const res = git(args, { stdio: ['ignore', 'pipe', 'inherit'], ...opts });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed with status ${res.status}`);
  }
  return res.stdout.trim();
}

function parseArgs(argv) {
  const out = { force: false, update: null, dest: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force' || a === '-f') out.force = true;
    else if (a === '--update') out.update = argv[++i];
    else if (a === '--dest') out.dest = argv[++i];
    else if (a === '--help' || a === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (out.update && !/^v\d+\.\d+\.\d+$/.test(out.update)) {
    throw new Error(`--update expects a release tag like v4.4.2, got: ${out.update}`);
  }
  return out;
}

/** Resolve a tag to the commit it points at, following annotated tag objects. */
function resolveTagCommit(repository, tag) {
  const out = gitOrThrow(['ls-remote', repository, `refs/tags/${tag}`, `refs/tags/${tag}^{}`]);
  const lines = out.split('\n').filter(Boolean).map((l) => l.split('\t'));
  // `^{}` is the peeled entry: the commit an annotated tag points at. Prefer it.
  const peeled = lines.find(([, ref]) => ref.endsWith('^{}'));
  const direct = lines.find(([, ref]) => ref === `refs/tags/${tag}`);
  const chosen = peeled ?? direct;
  if (!chosen) throw new Error(`Tag ${tag} not found in ${repository}`);
  return chosen[0];
}

/** Read VERSION and SDK_VERSION out of a checked-out tree. */
function readTreeVersions(dest) {
  const versionFile = readFileSync(join(dest, 'VERSION'), 'utf8');
  const field = (name) => {
    const m = versionFile.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
    return m ? m[1].trim() : '';
  };
  const parts = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')];
  let version = parts.join('.');
  const extra = field('EXTRAVERSION');
  if (extra) version += `-${extra}`;

  let sdkVersion = '';
  try {
    sdkVersion = readFileSync(join(dest, 'SDK_VERSION'), 'utf8').trim();
  } catch {
    /* SDK_VERSION is absent on older trees */
  }
  return { version, sdkVersion };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].split('/**')[1]);
    return;
  }

  const lock = JSON.parse(readFileSync(LOCKFILE, 'utf8'));
  const dest = args.dest ? resolve(args.dest) : join(ROOT, '.cache', 'zephyr');

  let { tag, commit } = lock;
  if (args.update) {
    tag = args.update;
    commit = resolveTagCommit(lock.repository, tag);
    console.log(`Re-pinning to ${tag} (${commit})`);
  }

  // Already at the right revision? Nothing to do.
  if (!args.force && existsSync(join(dest, '.git'))) {
    const head = git(['rev-parse', 'HEAD'], { cwd: dest });
    if (head.status === 0 && head.stdout.trim() === commit) {
      console.log(`Zephyr ${tag} already present at ${dest}`);
      return;
    }
    console.log(`Existing checkout at ${dest} is not at ${commit}; re-cloning.`);
    rmSync(dest, { recursive: true, force: true });
  } else if (args.force && existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }

  console.log(`Cloning ${lock.repository} at ${tag} into ${dest} (shallow, single branch)...`);
  const clone = git(
    ['clone', '--depth', '1', '--branch', tag, '--single-branch', lock.repository, dest],
    { stdio: 'inherit' },
  );
  if (clone.status !== 0) throw new Error('git clone failed');

  const head = gitOrThrow(['rev-parse', 'HEAD'], { cwd: dest });
  if (head !== commit) {
    if (!args.update) {
      throw new Error(
        `Checked-out commit ${head} does not match the pinned commit ${commit}.\n` +
          `The tag may have been moved. Re-pin deliberately with --update ${tag}.`,
      );
    }
    commit = head;
  }

  const { version, sdkVersion } = readTreeVersions(dest);

  if (args.update) {
    const updated = {
      ...lock,
      tag,
      commit,
      version,
      sdkVersion,
      docBaseUrl: `https://docs.zephyrproject.org/${version}/`,
      apiBaseUrl: `https://docs.zephyrproject.org/${version}/doxygen/html/`,
    };
    writeFileSync(LOCKFILE, `${JSON.stringify(updated, null, 2)}\n`);
    console.log(`Updated ${LOCKFILE}`);
  } else if (version !== lock.version) {
    console.warn(
      `Warning: tree reports version ${version} but lockfile says ${lock.version}.`,
    );
  }

  console.log(`Zephyr ${version} (${commit.slice(0, 12)}) ready at ${dest}`);
}

try {
  main();
} catch (err) {
  console.error(`fetch-zephyr: ${err.message}`);
  process.exit(1);
}
