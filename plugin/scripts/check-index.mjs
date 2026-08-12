#!/usr/bin/env node
/** SessionStart index compatibility and project-identity check. */
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

import {
  descriptorFingerprint,
  findWestWorkspace,
  gitTreeFingerprint,
  readHookInput,
  resolveIndexPath,
  validIndexDescriptor,
} from './index-paths.mjs';

const EXPECTED_SCHEMA = 6;
const EXPECTED_DESCRIPTOR = 2;

function treeVersion(root) {
  try {
    const text = readFileSync(join(root, 'VERSION'), 'utf8');
    const field = (name) => text.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
    const version = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')].join('.');
    const extra = field('EXTRAVERSION');
    return extra ? `${version}-${extra}` : version;
  } catch {
    return null;
  }
}

function treeCommit(root) {
  const result = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

function westZephyrBase(workspace) {
  try {
    const config = readFileSync(join(workspace, '.west', 'config'), 'utf8');
    const path = config.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim();
    if (path && existsSync(join(workspace, path, 'VERSION'))) return join(workspace, path);
  } catch {
    /* fall through */
  }
  const fallback = join(workspace, 'zephyr');
  return existsSync(join(fallback, 'VERSION')) ? fallback : null;
}

/**
 * Whether the project root holds nothing but dot-entries.
 *
 * Dot-entries are ignored because `.git`, `.claude`, and editor state say
 * nothing about what the directory is for. Anything else means the user has a
 * project of some kind already, and guessing that it wants Zephyr would be
 * nagging.
 */
function isEmptyDirectory(root) {
  try {
    return readdirSync(root).every((entry) => entry.startsWith('.'));
  } catch {
    return false;
  }
}

function emit(context) {
  process.stdout.write(
    `${JSON.stringify({
      additionalContext: context,
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
    })}\n`,
  );
}

function readDescriptor(path) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const rows = db.prepare('SELECT key, value FROM meta').all();
    const meta = Object.fromEntries(rows.map((row) => [String(row.key), String(row.value)]));
    const descriptor = JSON.parse(meta.index_descriptor ?? 'null');
    if (
      Number(meta.schema_version) !== EXPECTED_SCHEMA ||
      !validIndexDescriptor(descriptor, EXPECTED_SCHEMA, EXPECTED_DESCRIPTOR) ||
      descriptor?.contextFingerprint !== meta.context_fingerprint ||
      descriptorFingerprint(descriptor) !== descriptor?.contextFingerprint
    ) throw new Error('incompatible descriptor');
    return { meta, descriptor };
  } finally {
    db.close();
  }
}

async function main() {
  await readHookInput();
  const requestedProjectRoot = resolve(
    process.env.ZEPHYR_AI_PROJECT_ROOT ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
  );
  const projectRoot = existsSync(requestedProjectRoot)
    ? realpathSync(requestedProjectRoot)
    : requestedProjectRoot;
  const workspace = findWestWorkspace(projectRoot);
  const info = resolveIndexPath();
  if (!info) {
    if (workspace) {
      const base = westZephyrBase(workspace);
      emit(base
        ? 'The Zephyr lookup and edit-validation services have no compatible project index, but the workspace Zephyr tree is available. ' +
          'Use the zephyr-index skill to build it before relying on generated CONFIG_, binding, board, or API facts.'
        : 'The Zephyr lookup and edit-validation services have no compatible project index, and this west workspace has no usable Zephyr checkout. ' +
          'Run west update in the intended workspace, or invoke the zephyr-index skill and approve its pinned-tree fetch.');
    } else if (process.env.ZEPHYR_BASE && existsSync(join(process.env.ZEPHYR_BASE, 'VERSION'))) {
      emit(
        'The Zephyr lookup and edit-validation services have no compatible project index, but ZEPHYR_BASE names a usable tree. ' +
          'Use the zephyr-index skill to build it before relying on generated CONFIG_, binding, board, or API facts.',
      );
    } else if (isEmptyDirectory(projectRoot)) {
      // An empty directory is the fresh-user state and the one that most needs
      // this. Staying silent here is only correct in a directory that is
      // demonstrably some other kind of project, which an empty one is not.
      emit(
        'This project has no Zephyr index, no west workspace, and no ZEPHYR_BASE, so Zephyr lookups and edit ' +
          'validation are unavailable. If this is going to be Zephyr firmware, use the zephyr-index skill first: ' +
          'in an empty directory it can fetch the pinned Zephyr tree and build the index without an existing ' +
          'workspace. Building it needs Node 24+ and Python 3.12+ with PyYAML.',
      );
    }
    return;
  }

  let state;
  try {
    state = readDescriptor(info.path);
  } catch {
    emit(
      'The selected Zephyr index is corrupt or incompatible with this plugin version. ' +
        'Use the zephyr-index skill to replace it; until then, index-backed answers and edit validation are unavailable.',
    );
    return;
  }

  if (state.descriptor.projectRoot && resolve(state.descriptor.projectRoot) !== projectRoot) {
    emit(
      'The selected Zephyr index belongs to a different project root. Rebuild a project-scoped index with the ' +
        'zephyr-index skill; treat current index-backed answers as catalogue-only.',
    );
    return;
  }

  if (!workspace) return;
  const base = westZephyrBase(workspace);
  const version = base ? treeVersion(base) : null;
  const treeIdentity = base ? gitTreeFingerprint(base) : null;
  const commit = treeIdentity?.commit ?? (base ? treeCommit(base) : null);
  const treeMismatch = Boolean(
    treeIdentity && treeIdentity.stateFingerprint !== state.descriptor.zephyrTreeFingerprint,
  );
  if (
    (version && version !== state.descriptor.zephyrVersion) ||
    (commit && commit !== state.descriptor.zephyrCommit) ||
    treeMismatch
  ) {
    emit(
      `The active west workspace uses Zephyr ${version ?? 'of unknown version'} at commit ` +
        `${commit ?? 'unknown'}, while the project index describes ${state.descriptor.zephyrVersion} at commit ` +
        `${state.descriptor.zephyrCommit}. ` +
        (treeMismatch
          ? 'Its tracked or untracked source content also differs from the indexed fingerprint. '
          : '') +
        'Rebuild it with the zephyr-index skill before relying on ' +
        'version-sensitive Kconfig, devicetree, board, or API answers.',
    );
  }
}

main().catch(() => {
  emit(
    'The Zephyr SessionStart compatibility check failed unexpectedly. Run index_status before relying on index-backed facts.',
  );
});
