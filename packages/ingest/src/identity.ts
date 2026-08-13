import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  INDEX_BUILDER_VERSION,
  type ProducerRecord,
  INDEX_DESCRIPTOR_VERSION,
  INDEX_SCHEMA_VERSION,
  descriptorFingerprint,
  fingerprint,
  type IndexDescriptor,
  type SourceKind,
} from '../../shared/index-descriptor.ts';
import { gitTreeIdentity } from '../../shared/source-identity.ts';

export interface IdentityOptions {
  zephyrRoot: string;
  projectRoot?: string;
  modules: string[];
  pinnedCommit?: string;
  boardTarget?: string;
  applicationRoot?: string;
  buildDirectory?: string;
  apiSemantic?: boolean;
  westComplete?: boolean;
  producer?: ProducerRecord;
}

function git(root: string, args: string[]): string | null {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function readTreeVersion(root: string): string {
  const text = readFileSync(join(root, 'VERSION'), 'utf8');
  const field = (name: string) =>
    text.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const version = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')].join('.');
  const extra = field('EXTRAVERSION');
  return extra ? `${version}-${extra}` : version;
}

function findWorkspace(start: string): string | undefined {
  let cursor = resolve(start);
  while (true) {
    if (existsSync(join(cursor, '.west', 'config'))) return cursor;
    const parent = dirname(cursor);
    if (parent === cursor) return undefined;
    cursor = parent;
  }
}

function manifestHash(workspace: string | undefined): string | undefined {
  if (!workspace) return undefined;
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
  const candidates = [
    ...(manifestPath ? [join(workspace, manifestPath, manifestFile)] : []),
    join(workspace, 'west.yml'),
    join(workspace, 'west.yaml'),
  ];
  const manifest = candidates.find(existsSync);
  return manifest ? createHash('sha256').update(readFileSync(manifest)).digest('hex') : undefined;
}

function contentIdentity(root: string): Record<string, unknown> {
  const canonical = realpathSync(root);
  const identity = gitTreeIdentity(canonical);
  if (identity) return { name: basename(canonical), ...identity };

  const markerPaths = ['VERSION', 'west.yml', 'zephyr/module.yml', 'module.yml']
    .map((path) => join(canonical, path))
    .filter(existsSync)
    .map((path) => {
      const stat = statSync(path);
      return {
        path: relative(canonical, path),
        bytes: stat.size,
        sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
      };
    });
  return { name: basename(canonical), markers: markerPaths };
}

export function buildIndexDescriptor(options: IdentityOptions): IndexDescriptor {
  const zephyrRoot = realpathSync(options.zephyrRoot);
  const projectRoot = options.projectRoot && existsSync(options.projectRoot)
    ? realpathSync(options.projectRoot)
    : undefined;
  const zephyrCommit = git(zephyrRoot, ['rev-parse', 'HEAD']);
  if (!zephyrCommit) {
    throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${zephyrRoot}.`);
  }
  const workspace = findWorkspace(projectRoot ?? zephyrRoot);
  const westManifestHash = manifestHash(workspace);
  const modules = options.modules.map((root) => contentIdentity(root));
  const moduleFingerprint = fingerprint(modules);
  const zephyrIdentity = contentIdentity(zephyrRoot);
  const zephyrTreeFingerprint = String(zephyrIdentity['stateFingerprint'] ?? fingerprint(zephyrIdentity));
  const sourceKind: SourceKind =
    options.pinnedCommit === zephyrCommit && zephyrIdentity['dirty'] === false
      ? 'pinned-upstream'
      : workspace
        ? 'west-workspace'
        : 'explicit-tree';

  const base = {
    descriptorVersion: INDEX_DESCRIPTOR_VERSION,
    schemaVersion: INDEX_SCHEMA_VERSION,
    builderVersion: INDEX_BUILDER_VERSION,
    sourceKind,
    ...(projectRoot ? { projectRoot } : {}),
    zephyrRoot,
    zephyrVersion: readTreeVersion(zephyrRoot),
    zephyrCommit,
    zephyrTreeFingerprint,
    ...(westManifestHash ? { westManifestHash } : {}),
    moduleFingerprint,
    ...(options.boardTarget ? { boardTarget: options.boardTarget } : {}),
    ...(options.applicationRoot ? { applicationRoot: realpathSync(options.applicationRoot) } : {}),
    ...(options.buildDirectory ? { buildDirectory: realpathSync(options.buildDirectory) } : {}),
    ...(options.producer ? { producer: options.producer } : {}),
    coverage: {
      docs: { complete: options.modules.length === 0, note: options.modules.length ? 'Module documentation is not indexed.' : undefined },
      kconfig: { complete: false, note: 'Catalogue index covering the application and sysbuild namespaces; generated and application-local symbols require resolved context.' },
      bindings: {
        complete: options.modules.length === 0 && !projectRoot && !options.applicationRoot,
        note: options.modules.length || projectRoot || options.applicationRoot
          ? 'Application-local or undisclosed module binding roots may not be indexed.'
          : undefined,
      },
      boards: { complete: options.modules.length === 0, note: options.modules.length ? 'Module board roots are not indexed.' : undefined },
      samples: { complete: options.modules.length === 0, note: options.modules.length ? 'Module samples are not indexed.' : undefined },
      api: {
        complete: Boolean(options.apiSemantic) && options.modules.length === 0,
        note: options.apiSemantic
          ? options.modules.length
            ? 'Module public headers are not indexed.'
            : undefined
          : 'Doxygen XML was not supplied; the API catalogue is an incomplete header fallback.',
      },
      west: {
        complete: Boolean(options.westComplete),
        note: options.westComplete
          ? undefined
          : 'The west package was not importable when this index was built, so runners that import it — openocd among them — carry no capabilities.',
      },
      resolvedBuild: {
        complete: false,
        note: options.buildDirectory
          ? 'Build identity is recorded, but resolved .config and final devicetree values are not ingested.'
          : 'No resolved build output was supplied or ingested.',
      },
    },
  } satisfies Omit<IndexDescriptor, 'createdAt' | 'contextFingerprint'>;

  return {
    ...base,
    createdAt: new Date().toISOString(),
    contextFingerprint: descriptorFingerprint(base),
  };
}
