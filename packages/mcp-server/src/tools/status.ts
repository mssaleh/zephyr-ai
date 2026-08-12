import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { findWestWorkspace, westZephyrBase } from '../db.ts';
import { type ToolFactory, joinSections, result, section } from './common.ts';

const ORIGIN_LABEL: Record<string, string> = {
  env: 'explicitly selected via ZEPHYR_AI_INDEX',
  workspace: "built from this project's own west workspace",
  'plugin-data': 'the default index installed with the plugin',
  'plugin-root': 'bundled inside the plugin directory',
  cwd: 'found in the working directory (development build)',
};

/** Read the Zephyr version from a checkout, for comparison with the index. */
function treeVersion(root: string): string | null {
  try {
    const text = readFileSync(join(root, 'VERSION'), 'utf8');
    const field = (name: string) =>
      text.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
    const version = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')].join('.');
    const extra = field('EXTRAVERSION');
    return extra ? `${version}-${extra}` : version;
  } catch {
    return null;
  }
}

export const indexStatus: ToolFactory = (index) => ({
  name: 'index_status',
  title: 'Index status',
  description:
    'Report which Zephyr version is indexed, where the index came from, and how much it covers. ' +
    'Call this when an answer looks wrong for the version in use, when a symbol or board that ' +
    'should exist is missing, or at the start of work on an unfamiliar project — it also detects ' +
    "whether the project has its own west workspace pinned to a different Zephyr than the one " +
    'indexed, which is the usual explanation for advice that does not compile.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const idx = index();
    const meta = idx.meta;

    const counts: [string, string][] = [
      ['Documentation pages', meta['count_docs'] ?? '?'],
      ['Documentation sections', meta['count_doc_chunks'] ?? '?'],
      ['Kconfig symbols', meta['count_kconfig'] ?? '?'],
      ['Devicetree compatibles', meta['count_bindings'] ?? '?'],
      ['Devicetree properties', meta['count_dt_properties'] ?? '?'],
      ['Boards', meta['count_boards'] ?? '?'],
      ['Board build targets', meta['count_board_targets'] ?? '?'],
      ['SoCs', meta['count_socs'] ?? '?'],
      ['Samples', meta['count_samples'] ?? '?'],
      ['C API symbols', meta['count_api'] ?? '?'],
    ];

    const workspace = findWestWorkspace();
    const workspaceBase = workspace ? westZephyrBase(workspace) : null;
    const workspaceVersion = workspaceBase ? treeVersion(workspaceBase) : null;
    const indexedVersion = meta['zephyr_version'] ?? 'unknown';
    const mismatch =
      workspaceVersion !== null && workspaceVersion !== indexedVersion;

    const text = joinSections([
      `# Zephyr index: version ${indexedVersion}`,
      `Source: ${ORIGIN_LABEL[idx.info.origin] ?? idx.info.origin}` +
        `\nFile: \`${idx.info.path}\` (${(idx.sizeBytes / 1024 / 1024).toFixed(1)} MiB)` +
        (meta['zephyr_commit'] ? `\nCommit: \`${meta['zephyr_commit'].slice(0, 12)}\`` : '') +
        (meta['built_at'] ? `\nBuilt: ${meta['built_at']}` : ''),
      section(
        'Coverage',
        counts.map(([label, value]) => `${label}: ${value}`),
      ),
      workspace
        ? mismatch
          ? `## ⚠️ Version mismatch\n\nThis project is a west workspace at \`${workspace}\` whose Zephyr is ` +
            `**${workspaceVersion}**, but the index describes **${indexedVersion}**.\n\n` +
            'Kconfig symbol names, devicetree properties, and APIs move between releases, so ' +
            'answers from this index may not apply. Rebuild it against this workspace by ' +
            'invoking the `zephyr-index` skill' +
            (workspaceBase ? ` (its Zephyr tree is \`${workspaceBase}\`)` : '') +
            '.'
          : `**West workspace** detected at \`${workspace}\`, Zephyr ${workspaceVersion ?? 'unknown'} — matches the index.`
        : '_No west workspace detected in or above the working directory; serving the default index._',
    ]);

    return result(text, {
      zephyrVersion: indexedVersion,
      zephyrCommit: meta['zephyr_commit'] ?? null,
      origin: idx.info.origin,
      path: idx.info.path,
      sizeBytes: idx.sizeBytes,
      builtAt: meta['built_at'] ?? null,
      docBaseUrl: meta['doc_base_url'] ?? null,
      counts: Object.fromEntries(counts),
      workspace,
      workspaceZephyrBase: workspaceBase,
      workspaceZephyrVersion: workspaceVersion,
      versionMismatch: mismatch,
    });
  },
});
