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

const EXPECTED_SCHEMA = 11;
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
 * Files that identify a directory as another kind of project.
 *
 * A manifest is the reliable signal: it means another toolchain owns this
 * directory. A single source file is not; a lone `main.c` may well be the start
 * of firmware.
 */
const FOREIGN_MANIFESTS = new Set([
  'package.json',
  'Cargo.toml',
  'go.mod',
  'pyproject.toml',
  'setup.py',
  'Gemfile',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'composer.json',
  'Makefile',
  'GNUmakefile',
  'requirements.txt',
]);

/** Source trees in a language Zephyr applications are not written in. */
const FOREIGN_SOURCE = /\.(?:js|mjs|cjs|ts|tsx|jsx|rs|go|rb|php|java|kt|swift|cs|py)$/;

/**
 * Whether the root holds nothing that identifies it as another kind of project.
 *
 * The previous rule was "nothing but dot-entries", which excluded the case the
 * message exists for: a directory holding only a `docs/` folder of board manuals
 * is the start of a firmware project and got no message. Dot-entries are still
 * ignored, because `.git`, `.claude` and editor state say nothing about what the
 * directory is for. Documentation is ignored for the same reason.
 *
 * The test is whether another toolchain owns the directory, not whether it is
 * empty. A foreign manifest shows ownership; a README does not.
 */
function looksUnclaimed(root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    const name = entry.name;
    if (name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      // A directory of sources in another language is a claim; docs are not.
      if (['node_modules', 'src', 'lib', 'app', 'cmd', 'pkg', 'target', 'vendor'].includes(name)) {
        try {
          if (readdirSync(join(root, name)).some((child) => FOREIGN_SOURCE.test(child))) return false;
        } catch {
          /* an unreadable directory cannot claim the root */
        }
      }
      continue;
    }
    if (FOREIGN_MANIFESTS.has(name)) return false;
    if (FOREIGN_SOURCE.test(name)) return false;
  }
  return true;
}

/**
 * How the Zephyr tools are named once they are loaded.
 *
 * Claude Code defers MCP tool definitions: at session start only the tool names
 * and the server's own instructions are in context, and a tool cannot be called
 * until it is loaded by name. Naming the exact scoped form here, in the message
 * that is read before anything else happens, is the difference between a session
 * that can reach these tools and one that never sees them. The prefix is the
 * plugin name and the server key from .mcp.json; a test ties it to both.
 */
const TOOL_NAMES =
  'The Zephyr tools are named `mcp__plugin_zephyr-ai_zephyr__<tool>`, for example ' +
  '`mcp__plugin_zephyr-ai_zephyr__index_status`, `mcp__plugin_zephyr-ai_zephyr__get_kconfig` and ' +
  '`mcp__plugin_zephyr-ai_zephyr__get_binding`. They are loaded on demand rather than listed ' +
  'upfront, so load them by that name before writing Kconfig, devicetree, or a board target.';

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
    } else if (looksUnclaimed(projectRoot)) {
      // The fresh-user state. Staying silent is correct only where the directory
      // is demonstrably another kind of project, which a directory holding only
      // documentation is not.
      emit(
        `${TOOL_NAMES} They cannot answer yet: ` +
          'this project has no Zephyr index, no west workspace, and no ZEPHYR_BASE, so Zephyr lookups and ' +
          'edit validation are unavailable. If this will be Zephyr firmware, use the zephyr-index skill ' +
          'first. In an empty directory it fetches the pinned Zephyr tree and builds the index without an ' +
          'existing workspace. To use an existing index instead, set ZEPHYR_AI_INDEX to its path. ' +
          'ZEPHYR_AI_PROJECT_ROOT does not work for this: the CLI overwrites it with the session working ' +
          'directory. Building an index needs Node 24+ and Python 3.12+ with PyYAML. Building firmware ' +
          'needs more than that, and the zephyr-setup skill covers it.',
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

  // A usable index is the case where naming the tools matters most, and it is
  // the case that said nothing at all. The message is one line about a fact the
  // session cannot get without a tool call — which Zephyr version its answers
  // will describe — and the names it needs to make that call.
  const ready = (extra) =>
    emit(
      `A Zephyr ${state.descriptor.zephyrVersion} index is available for this project. ${TOOL_NAMES}` +
        (extra ? ` ${extra}` : ''),
    );

  if (!workspace) {
    ready();
    return;
  }
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
    return;
  }
  ready('It matches the Zephyr in this west workspace.');
}

main().catch(() => {
  emit(
    'The Zephyr SessionStart compatibility check failed. Run index_status before relying on facts from the index.',
  );
});
