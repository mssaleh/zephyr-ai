#!/usr/bin/env node
/**
 * SessionStart hook: make the model aware of the index situation, once.
 *
 * Emits context only when there is something worth saying — no index at all, or
 * an index whose Zephyr version differs from the workspace the user is actually
 * building against. In the common case where everything lines up it prints
 * nothing, so it costs no tokens.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { findWestWorkspace, readHookInput, resolveIndexPath } from './index-paths.mjs';

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

function westZephyrBase(workspace) {
  try {
    const config = readFileSync(join(workspace, '.west', 'config'), 'utf8');
    const path = config.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim();
    if (path && existsSync(join(workspace, path, 'VERSION'))) return join(workspace, path);
  } catch {
    /* unreadable */
  }
  const fallback = join(workspace, 'zephyr');
  return existsSync(join(fallback, 'VERSION')) ? fallback : null;
}

function emit(context) {
  process.stdout.write(
    `${JSON.stringify({
      additionalContext: context,
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
    })}\n`,
  );
}

async function main() {
  await readHookInput();

  const workspace = findWestWorkspace();
  const info = resolveIndexPath();

  if (!info) {
    // Only worth saying inside a Zephyr project; elsewhere it is noise.
    if (!workspace) return;
    emit(
      'The zephyr MCP server has no index available, so its lookup tools will fail. Tell the ' +
        'user to build one by running the zephyr-index skill, then continue.',
    );
    return;
  }

  if (!workspace) return;

  const base = westZephyrBase(workspace);
  const projectVersion = base ? treeVersion(base) : null;
  if (!projectVersion) return;

  let indexedVersion = null;
  try {
    const db = new DatabaseSync(info.path, { readOnly: true });
    indexedVersion = db.prepare("SELECT value FROM meta WHERE key = 'zephyr_version'").get()?.value ?? null;
    db.close();
  } catch {
    return;
  }

  if (indexedVersion && indexedVersion !== projectVersion) {
    emit(
      `This project is a west workspace using Zephyr ${projectVersion}, but the zephyr MCP index ` +
        `describes Zephyr ${indexedVersion}. Kconfig symbols, devicetree properties, and APIs ` +
        'differ between releases. Tell the user they should rebuild the index for this workspace ' +
        '(the zephyr-index skill does it), and until then treat MCP answers as approximate and ' +
        'verify anything version-sensitive against the source tree.',
    );
  }
}

main().catch(() => process.exit(0));
