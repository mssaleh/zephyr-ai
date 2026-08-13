import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { findWestWorkspace, westZephyrBase } from '../db.ts';
import { type ToolFactory, joinSections, result, section } from './common.ts';
import { publicDescriptor } from '../../../shared/index-descriptor.ts';
import { gitTreeIdentity } from '../../../shared/source-identity.ts';
import { byCodeUnits } from '../../../shared/ordering.ts';

const ORIGIN_LABEL: Record<string, string> = {
  explicit: 'explicitly selected via ZEPHYR_AI_INDEX',
  project: "the active fingerprinted index for this project",
  development: 'the repository development index',
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

function manifestHash(workspace: string): string | null {
  const frozen = spawnSync('west', ['manifest', '--freeze'], {
    cwd: workspace,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (frozen.status === 0 && frozen.stdout.trim()) {
    return createHash('sha256').update(frozen.stdout).digest('hex');
  }
  let manifestPath = '';
  let manifestFile = 'west.yml';
  try {
    const config = readFileSync(join(workspace, '.west', 'config'), 'utf8');
    manifestPath = config.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim() ?? '';
    manifestFile = config.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim() ?? manifestFile;
  } catch {
    /* fallback candidates below */
  }
  const manifest = [
    ...(manifestPath ? [join(workspace, manifestPath, manifestFile)] : []),
    join(workspace, 'west.yml'),
    join(workspace, 'west.yaml'),
  ].find(existsSync);
  return manifest ? createHash('sha256').update(readFileSync(manifest)).digest('hex') : null;
}

function storedIndexUsage(): { bytes: number; files: number } {
  const data = process.env['ZEPHYR_AI_PLUGIN_DATA'] ?? process.env['CLAUDE_PLUGIN_DATA'];
  if (!data) return { bytes: 0, files: 0 };
  const root = resolve(data, 'indexes');
  let bytes = 0;
  let files = 0;
  const visit = (path: string): void => {
    let entries;
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && entry.name === 'zephyr.db') {
        bytes += statSync(child).size;
        files++;
      }
    }
  };
  visit(root);
  return { bytes, files };
}

function canonicalPath(path: string): string {
  try {
    return realpathSync(resolve(path));
  } catch {
    return resolve(path);
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
      ['West flash/debug runners', meta['count_runners'] ?? '?'],
      ['Board-runner pairings', meta['count_board_runners'] ?? '?'],
      ['West commands', meta['count_west_commands'] ?? '?'],
    ];

    const projectStart = idx.info.projectRoot ?? process.env['ZEPHYR_AI_PROJECT_ROOT'] ?? process.env['CLAUDE_PROJECT_DIR'];
    const workspace = findWestWorkspace(projectStart ?? process.cwd());
    const workspaceBase = workspace ? westZephyrBase(workspace) : null;
    const workspaceVersion = workspaceBase ? treeVersion(workspaceBase) : null;
    const workspaceIdentity = workspaceBase ? gitTreeIdentity(workspaceBase) : null;
    const workspaceCommit = workspaceIdentity?.commit ?? null;
    const workspaceTreeFingerprint = workspaceIdentity?.stateFingerprint ?? null;
    const indexedVersion = meta['zephyr_version'] ?? 'unknown';
    const indexedCommit = idx.descriptor.zephyrCommit;
    const versionMismatch = workspaceVersion !== null && workspaceVersion !== indexedVersion;
    const commitMismatch = workspaceCommit !== null && workspaceCommit !== indexedCommit;
    const treeMismatch =
      workspaceTreeFingerprint !== null &&
      workspaceTreeFingerprint !== idx.descriptor.zephyrTreeFingerprint;
    const mismatch = versionMismatch || commitMismatch || treeMismatch;
    const projectMatch = idx.descriptor.projectRoot
      ? Boolean(projectStart && canonicalPath(projectStart) === canonicalPath(idx.descriptor.projectRoot))
      : null;
    const activeManifestHash = workspace ? manifestHash(workspace) : null;
    const manifestMatch = idx.descriptor.westManifestHash
      ? activeManifestHash === null
        ? null
        : activeManifestHash === idx.descriptor.westManifestHash
      : null;
    const usage = storedIndexUsage();
    const contextKind = idx.descriptor.boardTarget || idx.descriptor.buildDirectory
      ? 'catalogue context with build identity recorded (resolved values are not ingested)'
      : 'catalogue context';

    const text = joinSections([
      `# Zephyr index: version ${indexedVersion}`,
      `Source: ${ORIGIN_LABEL[idx.info.origin] ?? idx.info.origin}` +
        `\nArtifact: \`${basename(idx.info.path)}\` (${(idx.sizeBytes / 1024 / 1024).toFixed(1)} MiB)` +
        `\nContext: ${contextKind}` +
        (indexedCommit ? `\nCommit: \`${indexedCommit}\`` : '') +
        `\nFingerprint: \`${idx.descriptor.contextFingerprint}\`` +
        (meta['built_at'] ? `\nBuilt: ${meta['built_at']}` : ''),
      section(
        'Indexed rows',
        counts.map(([label, value]) => `${label}: ${value}`),
      ),
      // Completeness is the signal that keeps a catalogue miss from being read as
      // proof of absence, so it belongs in the text the model reads, not only in
      // structuredContent.
      section(
        'Coverage',
        Object.entries(idx.descriptor.coverage)
          .sort(([left], [right]) => byCodeUnits(left, right))
          .map(
            ([corpus, coverage]) =>
              `${corpus}: ${coverage.complete ? 'complete' : 'incomplete'}` +
              (coverage.note ? ` — ${coverage.note}` : ''),
          ),
      ),
      idx.descriptor.producer
        ? section('Built by', [
            `Node ${idx.descriptor.producer.node} · SQLite ${idx.descriptor.producer.sqlite}` +
              (idx.descriptor.producer.python ? ` · ${idx.descriptor.producer.python}` : '') +
              (idx.descriptor.producer.doxygen ? ` · Doxygen ${idx.descriptor.producer.doxygen}` : ''),
            `collator: ${idx.descriptor.producer.collator} — recorded because ordering must not depend on it`,
          ])
        : undefined,
      'Coverage describes the indexed Zephyr tree and the modules named when it was built. ' +
        "It never describes this project's own Kconfig or devicetree bindings, which are outside " +
        'the index, so a symbol or compatible missing here may still be valid in this workspace.',
      workspace
        ? mismatch
          ? `## ⚠️ Source-context mismatch\n\nThis project is a west workspace whose Zephyr is ` +
            `**${workspaceVersion}** at commit \`${workspaceCommit ?? 'unknown'}\`, but the index describes ` +
            `**${indexedVersion}** at commit \`${indexedCommit}\`.\n\n` +
            (treeMismatch
              ? 'The checkout content also differs from the indexed tree (tracked or untracked changes are present).\n\n'
              : '') +
            'Kconfig symbol names, devicetree properties, and APIs move between releases, so ' +
            'answers from this index may not apply. Rebuild it against this workspace by ' +
            'invoking the `zephyr-index` skill.'
          : `**West workspace** detected; Zephyr ${workspaceVersion ?? 'unknown'} at the same commit as the index.`
        : '_No west workspace detected for the active project; this answer is catalogue-scoped._',
      `**Stored indexes:** ${usage.files} artifact(s), ${(usage.bytes / 1024 / 1024).toFixed(1)} MiB total.`,
      manifestMatch === false
        ? '**Manifest mismatch:** the active west manifest differs from the index descriptor; rebuild the project index.'
        : undefined,
    ]);

    return result(text, {
      zephyrVersion: indexedVersion,
      zephyrCommit: meta['zephyr_commit'] ?? null,
      origin: idx.info.origin,
      sizeBytes: idx.sizeBytes,
      builtAt: meta['built_at'] ?? null,
      docBaseUrl: meta['doc_base_url'] ?? null,
      counts: Object.fromEntries(counts),
      workspaceDetected: Boolean(workspace),
      workspaceZephyrVersion: workspaceVersion,
      workspaceZephyrCommit: workspaceCommit,
      workspaceTreeFingerprint,
      treeMismatch,
      versionMismatch,
      commitMismatch,
      sourceContextMismatch: mismatch,
      projectMatch,
      manifestMatch,
      descriptor: publicDescriptor(idx.descriptor),
      storedIndexUsage: usage,
    });
  },
});
