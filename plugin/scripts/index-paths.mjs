/**
 * Shared index-location logic for the plugin's hook scripts.
 *
 * Mirrors the resolution order in the MCP server (packages/mcp-server/src/db.ts).
 * Kept as a tiny standalone module rather than imported from the server bundle,
 * because hooks run as separate short-lived processes and must not pay the cost
 * of loading the whole server.
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readlinkSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

function projectId(root) {
  const canonical = JSON.stringify({ projectRoot: root });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 24);
}

export function canonicalJson(value) {
  const normalise = (item) => {
    if (Array.isArray(item)) return item.map(normalise);
    if (item !== null && typeof item === 'object') {
      return Object.fromEntries(
        Object.entries(item)
          .filter(([, child]) => child !== undefined)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, child]) => [key, normalise(child)]),
      );
    }
    return item;
  };
  return JSON.stringify(normalise(value));
}

export function descriptorFingerprint(descriptor) {
  const {
    createdAt: _createdAt,
    contextFingerprint: _contextFingerprint,
    zephyrRoot: _zephyrRoot,
    projectRoot: _projectRoot,
    ...semantic
  } = descriptor;
  return createHash('sha256').update(canonicalJson(semantic)).digest('hex');
}

/** Strict descriptor shape checks shared by SessionStart and PostToolUse. */
export function validIndexDescriptor(descriptor, expectedSchema, expectedDescriptor) {
  if (!descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor)) return false;
  if (descriptor.schemaVersion !== expectedSchema || descriptor.descriptorVersion !== expectedDescriptor) return false;
  if (!['pinned-upstream', 'west-workspace', 'explicit-tree'].includes(descriptor.sourceKind)) return false;
  if (typeof descriptor.createdAt !== 'string' || Number.isNaN(Date.parse(descriptor.createdAt))) return false;
  if (typeof descriptor.zephyrCommit !== 'string' || !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(descriptor.zephyrCommit)) return false;
  for (const key of ['zephyrTreeFingerprint', 'moduleFingerprint', 'contextFingerprint']) {
    if (typeof descriptor[key] !== 'string' || !/^[0-9a-f]{64}$/.test(descriptor[key])) return false;
  }
  if (descriptor.westManifestHash !== undefined && !/^[0-9a-f]{64}$/.test(descriptor.westManifestHash)) return false;
  if (!descriptor.coverage || typeof descriptor.coverage !== 'object' || Array.isArray(descriptor.coverage)) return false;
  return Object.values(descriptor.coverage).every((coverage) =>
    coverage &&
    typeof coverage === 'object' &&
    !Array.isArray(coverage) &&
    typeof coverage.complete === 'boolean' &&
    (coverage.note === undefined || typeof coverage.note === 'string'));
}

function regularFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function resolveIndexPath(env = process.env) {
  const explicit = env.ZEPHYR_AI_INDEX;
  if (explicit) return regularFile(explicit) ? { path: resolve(explicit), origin: 'explicit' } : null;

  const data = env.ZEPHYR_AI_PLUGIN_DATA ?? env.CLAUDE_PLUGIN_DATA;
  if (data) {
    const requestedRoot = resolve(env.ZEPHYR_AI_PROJECT_ROOT ?? env.CLAUDE_PROJECT_DIR ?? process.cwd());
    const projectRoot = existsSync(requestedRoot) ? realpathSync(requestedRoot) : requestedRoot;
    const projectDir = join(data, 'indexes', 'projects', projectId(projectRoot));
    const active = join(projectDir, 'active.json');
    if (existsSync(active)) {
      try {
        const pointer = JSON.parse(readFileSync(active, 'utf8')).relativePath;
        if (typeof pointer === 'string' && !isAbsolute(pointer)) {
          const candidate = resolve(projectDir, pointer);
          const escaped = relative(projectDir, candidate);
          if (escaped !== '..' && !escaped.startsWith(`..${sep}`) && regularFile(candidate)) {
            return { path: candidate, origin: 'project' };
          }
        }
      } catch {
        return null;
      }
    }
  }

  if (!data) {
    for (const candidate of [
      join(process.cwd(), 'index', 'zephyr.db'),
      join(process.cwd(), '..', '..', 'index', 'zephyr.db'),
    ]) {
      if (regularFile(candidate)) return { path: resolve(candidate), origin: 'development' };
    }
  }

  return null;
}

/** Fingerprint tracked and untracked checkout state without exposing its paths. */
export function gitTreeFingerprint(root) {
  let canonical;
  try {
    canonical = realpathSync(root);
  } catch {
    return null;
  }
  const git = (args) => {
    const result = spawnSync('git', ['-C', canonical, ...args], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return result.status === 0 ? result.stdout.trim() : null;
  };
  const commit = git(['rev-parse', 'HEAD']);
  if (!commit) return null;
  const diff = git(['diff', '--binary', 'HEAD']) ?? '';
  const untracked = (git(['ls-files', '--others', '--exclude-standard']) ?? '')
    .split('\n')
    .filter((path) => Boolean(path) && path !== '.zephyr-ai-managed.json')
    .sort()
    .map((path) => {
      try {
        const absolute = join(canonical, path);
        const stat = lstatSync(absolute);
        if (stat.isSymbolicLink()) return { path, symlink: readlinkSync(absolute) };
        if (!stat.isFile()) return { path, special: stat.mode };
        return { path, sha256: createHash('sha256').update(readFileSync(absolute)).digest('hex') };
      } catch {
        return { path, unreadable: true };
      }
    });
  return {
    commit,
    stateFingerprint: createHash('sha256')
      .update(canonicalJson({ commit, diff, untracked }))
      .digest('hex'),
  };
}

/** Walk up looking for a west workspace, so hooks can mention version drift. */
export function findWestWorkspace(start = process.cwd()) {
  let dir = resolve(start);
  for (let depth = 0; depth < 40; depth++) {
    if (existsSync(join(dir, '.west', 'config'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Read the hook's JSON payload from stdin. Returns {} if there is none. */
export async function readHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
