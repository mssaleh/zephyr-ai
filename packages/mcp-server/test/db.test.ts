import { ok, strictEqual, throws } from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { after, describe, it } from 'node:test';

import { Index, IndexResolutionError, resolveIndexPath } from '../src/db.ts';
import {
  INDEX_BUILDER_VERSION,
  INDEX_DESCRIPTOR_VERSION,
  INDEX_SCHEMA_VERSION,
  canonicalJson,
  descriptorFingerprint,
  parseIndexDescriptor,
  projectId,
  type IndexDescriptor,
} from '../../shared/index-descriptor.ts';

const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-db-tests-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

function descriptor(overrides: Partial<IndexDescriptor> = {}): IndexDescriptor {
  const base = {
    descriptorVersion: INDEX_DESCRIPTOR_VERSION,
    schemaVersion: INDEX_SCHEMA_VERSION,
    builderVersion: INDEX_BUILDER_VERSION,
    sourceKind: 'explicit-tree' as const,
    zephyrRoot: '/private/zephyr',
    zephyrVersion: '4.4.2',
    zephyrCommit: 'a'.repeat(40),
    zephyrTreeFingerprint: 'c'.repeat(64),
    moduleFingerprint: 'b'.repeat(64),
    coverage: { docs: { complete: true } },
    ...overrides,
  };
  const semantic = { ...base };
  return {
    ...base,
    createdAt: '2026-08-12T00:00:00.000Z',
    contextFingerprint: descriptorFingerprint(semantic),
  };
}

function database(path: string, value = descriptor()): void {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const insert = db.prepare('INSERT INTO meta(key, value) VALUES (?, ?)');
  insert.run('schema_version', String(value.schemaVersion));
  insert.run('index_descriptor', canonicalJson(value));
  insert.run('context_fingerprint', value.contextFingerprint);
  db.close();
}

function activate(data: string, project: string, dbPath: string): void {
  const projectDirectory = join(data, 'indexes', 'projects', projectId(project));
  mkdirSync(projectDirectory, { recursive: true });
  writeFileSync(
    join(projectDirectory, 'active.json'),
    JSON.stringify({ relativePath: dbPath.slice(projectDirectory.length + 1) }),
  );
}

describe('project-scoped index resolution', () => {
  it('discovers an index created after an initial miss without process restart', () => {
    const data = join(TEMPORARY, 'late data');
    const project = join(TEMPORARY, 'project ü');
    mkdirSync(project, { recursive: true });
    const env = { ZEPHYR_AI_PLUGIN_DATA: data, ZEPHYR_AI_PROJECT_ROOT: project };
    strictEqual(resolveIndexPath(env), null);
    const projectDirectory = join(data, 'indexes', 'projects', projectId(project));
    const path = join(projectDirectory, 'context', 'zephyr.db');
    database(path);
    activate(data, project, path);
    strictEqual(resolveIndexPath(env)?.path, path);
  });

  it('isolates two projects and handles spaces and non-ASCII paths', () => {
    const data = join(TEMPORARY, 'plugin data');
    const first = join(TEMPORARY, 'alpha project');
    const second = join(TEMPORARY, 'βeta project');
    for (const [project, context] of [[first, 'one'], [second, 'two']] as Array<[string, string]>) {
      mkdirSync(project, { recursive: true });
      const directory = join(data, 'indexes', 'projects', projectId(project));
      const path = join(directory, context, 'zephyr.db');
      database(path);
      activate(data, project, path);
    }
    const firstPath = resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: first })?.path;
    const secondPath = resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: second })?.path;
    ok(firstPath?.includes('/one/'));
    ok(secondPath?.includes('/two/'));
  });

  it('canonicalizes a symlinked project root before deriving its storage identity', () => {
    const data = join(TEMPORARY, 'symlink-data');
    const project = join(TEMPORARY, 'canonical-project');
    const alias = join(TEMPORARY, 'project-alias');
    mkdirSync(project, { recursive: true });
    symlinkSync(project, alias, 'dir');
    const directory = join(data, 'indexes', 'projects', projectId(project));
    const path = join(directory, 'context', 'zephyr.db');
    database(path);
    activate(data, project, path);
    strictEqual(
      resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: alias })?.path,
      path,
    );
  });

  it('gives an explicit valid index precedence and never falls back when it is missing', () => {
    const explicit = join(TEMPORARY, 'explicit.db');
    database(explicit);
    strictEqual(resolveIndexPath({ ZEPHYR_AI_INDEX: explicit })?.origin, 'explicit');
    throws(
      () => resolveIndexPath({ ZEPHYR_AI_INDEX: join(TEMPORARY, 'missing.db') }),
      IndexResolutionError,
    );
  });

  it('rejects corrupt pointers and directory traversal', () => {
    const data = join(TEMPORARY, 'corrupt-data');
    const project = join(TEMPORARY, 'corrupt-project');
    const directory = join(data, 'indexes', 'projects', projectId(project));
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'active.json'), '{bad');
    throws(() => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }));
    writeFileSync(join(directory, 'active.json'), JSON.stringify({ relativePath: '../../escape.db' }));
    throws(() => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }));
    writeFileSync(join(directory, 'active.json'), JSON.stringify({ relativePath: 'missing/zephyr.db' }));
    throws(
      () => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }),
      /missing artifact/,
    );
  });
});

describe('index descriptor validation', () => {
  it('rejects malformed identities and coverage even with a recomputed fingerprint', () => {
    for (const overrides of [
      { sourceKind: 'invented' },
      { zephyrCommit: 'not-a-commit' },
      { zephyrTreeFingerprint: 'short' },
      { createdAt: 'not-a-date' },
      { coverage: { docs: { complete: 'yes' } } },
    ]) {
      const candidate = descriptor(overrides as Partial<IndexDescriptor>);
      throws(() => parseIndexDescriptor(canonicalJson(candidate)));
    }
  });

  it('rejects schema mismatch, missing descriptor, and fingerprint corruption', () => {
    const validPath = join(TEMPORARY, 'valid.db');
    database(validPath);
    const validInfo = resolveIndexPath({ ZEPHYR_AI_INDEX: validPath })!;
    new Index(validInfo).close();

    const mismatchPath = join(TEMPORARY, 'mismatch.db');
    const mismatch = descriptor();
    database(mismatchPath, mismatch);
    const mismatchDb = new DatabaseSync(mismatchPath);
    mismatchDb.prepare("UPDATE meta SET value = '1' WHERE key = 'schema_version'").run();
    mismatchDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: mismatchPath })!), /schema/);

    const missingPath = join(TEMPORARY, 'missing-descriptor.db');
    database(missingPath);
    const missingDb = new DatabaseSync(missingPath);
    missingDb.prepare("DELETE FROM meta WHERE key = 'index_descriptor'").run();
    missingDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: missingPath })!), /descriptor/);

    const corruptPath = join(TEMPORARY, 'corrupt-fingerprint.db');
    database(corruptPath);
    const corruptDb = new DatabaseSync(corruptPath);
    const row = corruptDb.prepare("SELECT value FROM meta WHERE key = 'index_descriptor'").get()!;
    const corrupt = JSON.parse(String(row['value']));
    corrupt.zephyrCommit = 'c'.repeat(40);
    corruptDb.prepare("UPDATE meta SET value = ? WHERE key = 'index_descriptor'").run(JSON.stringify(corrupt));
    corruptDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: corruptPath })!), /fingerprint/);
  });
});
