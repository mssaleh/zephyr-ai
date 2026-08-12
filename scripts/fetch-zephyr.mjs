#!/usr/bin/env node
/** Interruption-safe fetch of the lockfile-pinned Zephyr source tree. */
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCKFILE = join(ROOT, 'zephyr.lock.json');
const DEFAULT_DESTINATION = join(ROOT, '.cache', 'zephyr');
const MARKER = '.zephyr-ai-managed.json';

function git(args, options = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  return result;
}

function gitOrThrow(args, options = {}) {
  const result = git(args, { stdio: ['ignore', 'pipe', 'inherit'], ...options });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed with status ${result.status}`);
  return result.stdout.trim();
}

function parseArgs(argv) {
  const options = { force: false, update: null, dest: null };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--force' || argument === '-f') options.force = true;
    else if (argument === '--update') options.update = argv[++index];
    else if (argument === '--dest') options.dest = argv[++index];
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.update && !/^v\d+\.\d+\.\d+$/.test(options.update)) {
    throw new Error(`--update expects a release tag like v4.4.2, got: ${options.update}`);
  }
  return options;
}

function resolveTagCommit(repository, tag) {
  const output = gitOrThrow(['ls-remote', repository, `refs/tags/${tag}`, `refs/tags/${tag}^{}`]);
  const rows = output.split('\n').filter(Boolean).map((line) => line.split('\t'));
  const chosen = rows.find(([, ref]) => ref.endsWith('^{}')) ??
    rows.find(([, ref]) => ref === `refs/tags/${tag}`);
  if (!chosen) throw new Error(`Tag ${tag} was not found in ${repository}`);
  return chosen[0];
}

function readTreeVersions(destination) {
  const versionFile = readFileSync(join(destination, 'VERSION'), 'utf8');
  const field = (name) => versionFile.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const base = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')].join('.');
  const version = field('EXTRAVERSION') ? `${base}-${field('EXTRAVERSION')}` : base;
  let sdkVersion = '';
  try {
    sdkVersion = readFileSync(join(destination, 'SDK_VERSION'), 'utf8').trim();
  } catch {
    /* absent in older releases */
  }
  return { version, sdkVersion };
}

function assertSafeDestination(destination) {
  const forbidden = new Set([parse(destination).root, resolve(homedir()), ROOT]);
  if (forbidden.has(destination)) {
    throw new Error(`Refusing unsafe fetch destination: ${destination}`);
  }
}

function hasValidMarker(destination, repository) {
  try {
    const marker = JSON.parse(readFileSync(join(destination, MARKER), 'utf8'));
    return marker.owner === 'zephyr-ai' && marker.repository === repository;
  } catch {
    return false;
  }
}

function atomicJson(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  renameSync(temporary, path);
}

function activate(candidate, destination, custom, repository) {
  if (custom && existsSync(destination) && !hasValidMarker(destination, repository)) {
    throw new Error(
      `Refusing to replace custom destination ${destination}: it has no valid ${MARKER} ownership marker. ` +
        'Choose a new path, or initialize it with this fetcher before attempting replacement.',
    );
  }
  const backup = `${destination}.zephyr-ai-backup-${randomUUID()}`;
  let movedPrevious = false;
  try {
    if (existsSync(destination)) {
      renameSync(destination, backup);
      movedPrevious = true;
    }
    renameSync(candidate, destination);
  } catch (error) {
    if (movedPrevious && !existsSync(destination) && existsSync(backup)) renameSync(backup, destination);
    throw error;
  }
  if (movedPrevious) rmSync(backup, { recursive: true, force: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: npm run fetch:zephyr -- [--force] [--update vX.Y.Z] [--dest <path>]');
    return;
  }
  const lock = JSON.parse(readFileSync(LOCKFILE, 'utf8'));
  const destination = resolve(args.dest ?? DEFAULT_DESTINATION);
  const custom = destination !== DEFAULT_DESTINATION;
  assertSafeDestination(destination);

  let tag = lock.tag;
  let commit = lock.commit;
  if (args.update) {
    tag = args.update;
    commit = resolveTagCommit(lock.repository, tag);
    console.log(`Re-pinning to ${tag} (${commit})`);
  }

  if (!args.force && existsSync(join(destination, '.git'))) {
    const head = git(['rev-parse', 'HEAD'], { cwd: destination });
    if (head.status === 0 && head.stdout.trim() === commit) {
      const status = git(['status', '--porcelain', '--untracked-files=all'], { cwd: destination });
      const changes = status.status === 0
        ? status.stdout.split('\n').filter((line) => line && !line.endsWith(` ${MARKER}`))
        : ['status-unavailable'];
      if (changes.length === 0) {
        console.log(`Zephyr ${tag} already present at ${destination}`);
        return;
      }
      throw new Error(
        `The pinned checkout at ${destination} has local changes. Preserve them elsewhere or run ` +
          `'npm run fetch:zephyr -- --force' to replace this managed cache deliberately.`,
      );
    }
  }
  if (custom && existsSync(destination) && !hasValidMarker(destination, lock.repository)) {
    throw new Error(
      `Refusing to replace custom destination ${destination}: it was not created by zephyr-ai (${MARKER} is missing or invalid).`,
    );
  }

  mkdirSync(dirname(destination), { recursive: true });
  const staging = mkdtempSync(join(dirname(destination), '.zephyr-ai-fetch-'));
  const candidate = join(staging, 'zephyr');
  try {
    console.log(`Cloning ${lock.repository} at ${tag} (shallow, single branch)...`);
    const clone = git(
      ['clone', '--depth', '1', '--branch', tag, '--single-branch', lock.repository, candidate],
      { stdio: 'inherit' },
    );
    if (clone.status !== 0) throw new Error('git clone failed; the previous checkout was left unchanged');
    const head = gitOrThrow(['rev-parse', 'HEAD'], { cwd: candidate });
    if (head !== commit && !args.update) {
      throw new Error(
        `Checked-out commit ${head} does not match pinned commit ${commit}. The tag may have moved; ` +
          `re-pin deliberately with --update ${tag}.`,
      );
    }
    commit = head;
    const { version, sdkVersion } = readTreeVersions(candidate);
    atomicJson(join(candidate, MARKER), {
      owner: 'zephyr-ai',
      repository: lock.repository,
      tag,
      commit,
    });
    activate(candidate, destination, custom, lock.repository);

    if (args.update) {
      atomicJson(LOCKFILE, {
        ...lock,
        tag,
        commit,
        version,
        sdkVersion,
        docBaseUrl: `https://docs.zephyrproject.org/${version}/`,
        apiBaseUrl: `https://docs.zephyrproject.org/${version}/doxygen/html/`,
      });
    } else if (version !== lock.version) {
      console.warn(`Warning: tree reports version ${version} but lockfile says ${lock.version}.`);
    }
    console.log(`Zephyr ${version} (${commit.slice(0, 12)}) ready at ${destination}`);
  } finally {
    // `staging` is created by this process in the destination's parent and is
    // the only recursive deletion target used during failed fetches.
    rmSync(staging, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`fetch-zephyr: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
