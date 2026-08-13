import { createHash } from 'node:crypto';

export const INDEX_SCHEMA_VERSION = 7;
export const INDEX_DESCRIPTOR_VERSION = 2;
export const INDEX_BUILDER_VERSION = '0.7.0';

export type SourceKind = 'pinned-upstream' | 'west-workspace' | 'explicit-tree';

export interface CorpusCoverage {
  complete: boolean;
  note?: string;
}

export interface IndexDescriptor {
  descriptorVersion: number;
  schemaVersion: number;
  builderVersion: string;
  createdAt: string;
  sourceKind: SourceKind;
  projectRoot?: string;
  zephyrRoot: string;
  zephyrVersion: string;
  zephyrCommit: string;
  /** Commit plus tracked and untracked workspace modifications. */
  zephyrTreeFingerprint: string;
  westManifestHash?: string;
  moduleFingerprint: string;
  boardTarget?: string;
  applicationRoot?: string;
  buildDirectory?: string;
  contextFingerprint: string;
  coverage: Record<string, CorpusCoverage>;
}

/** JSON with stable key ordering, used for identities and checked-in fixtures. */
export function canonicalJson(value: unknown): string {
  const normalise = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalise);
    if (item !== null && typeof item === 'object') {
      return Object.fromEntries(
        Object.entries(item as Record<string, unknown>)
          .filter(([, child]) => child !== undefined)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, child]) => [key, normalise(child)]),
      );
    }
    return item;
  };
  return JSON.stringify(normalise(value));
}

export function fingerprint(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function projectId(projectRoot: string): string {
  return fingerprint({ projectRoot }).slice(0, 24);
}

export function descriptorFingerprint(
  descriptor: Omit<IndexDescriptor, 'createdAt' | 'contextFingerprint'>,
): string {
  const { zephyrRoot: _privateZephyrRoot, projectRoot: _privateProjectRoot, ...semantic } = descriptor;
  return fingerprint(semantic);
}

export function parseIndexDescriptor(text: string): IndexDescriptor {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('the index descriptor is not valid JSON');
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('the index descriptor must be an object');
  }
  const descriptor = value as Partial<IndexDescriptor>;
  const requiredStrings: Array<keyof IndexDescriptor> = [
    'builderVersion',
    'createdAt',
    'sourceKind',
    'zephyrRoot',
    'zephyrVersion',
    'zephyrCommit',
    'zephyrTreeFingerprint',
    'moduleFingerprint',
    'contextFingerprint',
  ];
  for (const key of requiredStrings) {
    if (typeof descriptor[key] !== 'string' || descriptor[key] === '') {
      throw new Error(`the index descriptor is missing ${key}`);
    }
  }
  if (!['pinned-upstream', 'west-workspace', 'explicit-tree'].includes(descriptor.sourceKind!)) {
    throw new Error(`the index descriptor has an invalid sourceKind: ${descriptor.sourceKind}`);
  }
  if (Number.isNaN(Date.parse(descriptor.createdAt!))) {
    throw new Error('the index descriptor has an invalid createdAt timestamp');
  }
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(descriptor.zephyrCommit!)) {
    throw new Error('the index descriptor has an invalid Zephyr commit');
  }
  for (const key of ['zephyrTreeFingerprint', 'moduleFingerprint', 'contextFingerprint'] as const) {
    if (!/^[0-9a-f]{64}$/.test(descriptor[key]!)) {
      throw new Error(`the index descriptor has an invalid ${key}`);
    }
  }
  if (descriptor.westManifestHash !== undefined && !/^[0-9a-f]{64}$/.test(descriptor.westManifestHash)) {
    throw new Error('the index descriptor has an invalid westManifestHash');
  }
  if (descriptor.descriptorVersion !== INDEX_DESCRIPTOR_VERSION) {
    throw new Error(
      `descriptor version ${String(descriptor.descriptorVersion)} is incompatible; expected ${INDEX_DESCRIPTOR_VERSION}`,
    );
  }
  if (descriptor.schemaVersion !== INDEX_SCHEMA_VERSION) {
    throw new Error(
      `schema version ${String(descriptor.schemaVersion)} is incompatible; expected ${INDEX_SCHEMA_VERSION}`,
    );
  }
  if (
    descriptor.coverage === null ||
    typeof descriptor.coverage !== 'object' ||
    Array.isArray(descriptor.coverage)
  ) {
    throw new Error('the index descriptor has no coverage map');
  }
  for (const [corpus, coverage] of Object.entries(descriptor.coverage)) {
    if (
      coverage === null ||
      typeof coverage !== 'object' ||
      Array.isArray(coverage) ||
      typeof (coverage as Partial<CorpusCoverage>).complete !== 'boolean' ||
      ((coverage as Partial<CorpusCoverage>).note !== undefined &&
        typeof (coverage as Partial<CorpusCoverage>).note !== 'string')
    ) {
      throw new Error(`the index descriptor has invalid coverage for ${corpus}`);
    }
  }
  const {
    createdAt: _createdAt,
    contextFingerprint,
    ...semantic
  } = descriptor as IndexDescriptor;
  if (descriptorFingerprint(semantic) !== contextFingerprint) {
    throw new Error('the index descriptor fingerprint is invalid');
  }
  return descriptor as IndexDescriptor;
}

/** A display-safe projection: no private absolute paths leave the process. */
export function publicDescriptor(descriptor: IndexDescriptor): Record<string, unknown> {
  return {
    descriptorVersion: descriptor.descriptorVersion,
    schemaVersion: descriptor.schemaVersion,
    builderVersion: descriptor.builderVersion,
    createdAt: descriptor.createdAt,
    sourceKind: descriptor.sourceKind,
    zephyrVersion: descriptor.zephyrVersion,
    zephyrCommit: descriptor.zephyrCommit,
    zephyrTreeFingerprint: descriptor.zephyrTreeFingerprint,
    westManifestHash: descriptor.westManifestHash ?? null,
    moduleFingerprint: descriptor.moduleFingerprint,
    boardTarget: descriptor.boardTarget ?? null,
    contextFingerprint: descriptor.contextFingerprint,
    resolvedContext: Boolean(descriptor.boardTarget || descriptor.buildDirectory),
    coverage: descriptor.coverage,
  };
}
