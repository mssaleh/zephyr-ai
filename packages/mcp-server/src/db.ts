/**
 * Index location, opening, and query helpers.
 */

import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  INDEX_SCHEMA_VERSION,
  parseIndexDescriptor,
  projectId,
  type IndexDescriptor,
} from '../../shared/index-descriptor.ts';

export interface IndexInfo {
  path: string;
  /** How the index was chosen, for `index_status` to report. */
  origin: 'explicit' | 'project' | 'development';
  identity: string;
  projectRoot?: string;
}

export class IndexResolutionError extends Error {}

function fileInfo(path: string, origin: IndexInfo['origin'], projectRoot?: string): IndexInfo {
  let stat;
  try {
    stat = statSync(path, { bigint: true });
  } catch {
    throw new IndexResolutionError('The selected Zephyr index is unavailable. Rebuild it with the zephyr-index skill.');
  }
  if (!stat.isFile()) {
    throw new IndexResolutionError('The selected Zephyr index is not a regular file. Select or rebuild a valid index.');
  }
  return {
    path: realpathSync(path),
    origin,
    identity: `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}`,
    ...(projectRoot ? { projectRoot } : {}),
  };
}

function pluginData(env: NodeJS.ProcessEnv): string | undefined {
  return env['ZEPHYR_AI_PLUGIN_DATA'] ?? env['CLAUDE_PLUGIN_DATA'];
}

function activeProjectIndex(data: string, projectRoot: string): string | null {
  const projectDir = join(data, 'indexes', 'projects', projectId(projectRoot));
  const active = join(projectDir, 'active.json');
  if (!existsSync(active)) return null;
  let relativePath: unknown;
  try {
    relativePath = (JSON.parse(readFileSync(active, 'utf8')) as Record<string, unknown>)['relativePath'];
  } catch {
    throw new IndexResolutionError('The active project-index pointer is corrupt. Rebuild the project index.');
  }
  if (typeof relativePath !== 'string' || isAbsolute(relativePath)) {
    throw new IndexResolutionError('The active project-index pointer is invalid. Rebuild the project index.');
  }
  const candidate = resolve(projectDir, relativePath);
  const escaped = relative(projectDir, candidate);
  if (escaped === '..' || escaped.startsWith(`..${sep}`)) {
    throw new IndexResolutionError('The active project-index pointer escapes its storage directory.');
  }
  if (!existsSync(candidate)) {
    throw new IndexResolutionError(
      'The active project-index pointer names a missing artifact. Rebuild the project index.',
    );
  }
  return candidate;
}

/** Candidate index locations, most specific first. */
export function resolveIndexPath(env: NodeJS.ProcessEnv = process.env): IndexInfo | null {
  const explicit = env['ZEPHYR_AI_INDEX'];
  if (explicit) {
    if (!existsSync(explicit)) {
      throw new IndexResolutionError('ZEPHYR_AI_INDEX names a missing file. Correct it or rebuild the index.');
    }
    return fileInfo(resolve(explicit), 'explicit');
  }

  const projectRootValue = env['ZEPHYR_AI_PROJECT_ROOT'] ?? env['CLAUDE_PROJECT_DIR'];
  const requestedRoot = projectRootValue ? resolve(projectRootValue) : resolve(process.cwd());
  const projectRoot = existsSync(requestedRoot) ? realpathSync(requestedRoot) : requestedRoot;
  const data = pluginData(env);
  if (data) {
    const project = activeProjectIndex(resolve(data), projectRoot);
    if (project) return fileInfo(project, 'project', projectRoot);
  }

  // Development fallback only. The presence of plugin-data means this is an
  // installed-plugin context; falling through to a source checkout there could
  // silently answer one project's request with an unrelated development DB.
  if (!data) {
    for (const candidate of [
      join(process.cwd(), 'index', 'zephyr.db'),
      join(process.cwd(), '..', '..', 'index', 'zephyr.db'),
    ]) {
      if (existsSync(candidate)) return fileInfo(resolve(candidate), 'development', projectRoot);
    }
  }

  return null;
}

/**
 * Walk up from `start` looking for a west workspace.
 *
 * Reported by `index_status` so the model can tell the user their project has a
 * pinned Zephyr that differs from the indexed one, and offer to reindex it.
 */
export function findWestWorkspace(start: string = process.cwd()): string | null {
  let dir = resolve(start);
  for (let depth = 0; depth < 40; depth++) {
    if (existsSync(join(dir, '.west', 'config'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Read `ZEPHYR_BASE` from a west workspace's config, if it declares one. */
export function westZephyrBase(workspace: string): string | null {
  try {
    const config = readFileSync(join(workspace, '.west', 'config'), 'utf8');
    const path = config.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim();
    if (path) {
      const candidate = join(workspace, path);
      if (existsSync(join(candidate, 'VERSION'))) return candidate;
    }
  } catch {
    /* unreadable config */
  }
  const fallback = join(workspace, 'zephyr');
  return existsSync(join(fallback, 'VERSION')) ? fallback : null;
}

export type Row = Record<string, unknown>;

export class Index {
  readonly db: DatabaseSync;
  readonly info: IndexInfo;
  readonly meta: Record<string, string>;
  readonly descriptor: IndexDescriptor;

  constructor(info: IndexInfo) {
    this.info = info;
    this.db = new DatabaseSync(info.path, { readOnly: true });
    this.meta = {};
    for (const row of this.db.prepare('SELECT key, value FROM meta').all() as Row[]) {
      this.meta[String(row['key'])] = String(row['value']);
    }
    const schema = Number(this.meta['schema_version']);
    if (schema !== INDEX_SCHEMA_VERSION) {
      this.db.close();
      throw new Error(
        `Index schema ${Number.isFinite(schema) ? schema : 'unknown'} is incompatible; expected ${INDEX_SCHEMA_VERSION}. Rebuild the index.`,
      );
    }
    const rawDescriptor = this.meta['index_descriptor'];
    if (!rawDescriptor) {
      this.db.close();
      throw new Error('The index has no descriptor. Rebuild it with the current indexer.');
    }
    try {
      this.descriptor = parseIndexDescriptor(rawDescriptor);
    } catch (error) {
      this.db.close();
      throw error;
    }
    if (this.meta['context_fingerprint'] !== this.descriptor.contextFingerprint) {
      this.db.close();
      throw new Error('The index descriptor fingerprint does not match its metadata. Rebuild the index.');
    }
    if (info.origin === 'project') {
      try {
        writeFileSync(join(dirname(info.path), 'last-used'), `${new Date().toISOString()}\n`);
      } catch {
        // Usage tracking is best-effort; read-only plugin data must not make
        // an otherwise valid index unusable.
      }
    }
  }

  get sizeBytes(): number {
    try {
      return statSync(this.info.path).size;
    } catch {
      return 0;
    }
  }

  all(sql: string, ...params: unknown[]): Row[] {
    return this.db.prepare(sql).all(...(params as never[])) as Row[];
  }

  get(sql: string, ...params: unknown[]): Row | undefined {
    return this.db.prepare(sql).get(...(params as never[])) as Row | undefined;
  }

  /**
   * Run a full-text query, widening the match and concatenating the results.
   *
   * Requiring every term is precise but brittle: "bluetooth peripheral role"
   * matches two obscure ISO symbols and misses BT_PERIPHERAL, whose help text
   * never says "bluetooth". Stopping at the first variant that returns anything
   * would therefore hide the best answer behind two worse ones.
   *
   * So every variant runs, narrowest first, and their results are concatenated
   * with duplicates dropped. Precise hits stay at the top and broader hits fill
   * in behind them, up to `limit`.
   *
   * `params` are the bindings that follow the MATCH placeholder, including the
   * LIMIT; rows are de-duplicated on their first column, which is the identity
   * column in every query here.
   */
  search(sql: string, query: string, params: unknown[] = [], limit = 50): Row[] {
    const out: Row[] = [];
    const seen = new Set<string>();

    for (const match of matchVariants(query)) {
      for (const row of this.all(sql, match, ...params)) {
        const key = String(Object.values(row)[0] ?? '');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(row);
        if (out.length >= limit) return out;
      }
    }
    return out;
  }

  close(): void {
    this.db.close();
  }
}

/**
 * Turn free text into progressively broader FTS5 MATCH expressions.
 *
 * Every term is emitted as a quoted phrase so that punctuation common in this
 * domain — `st,stm32-spi`, `CONFIG_BT_PERIPHERAL`, `#gpio-cells` — cannot be
 * read as FTS5 operator syntax and raise a query error.
 */
export function matchVariants(input: string): string[] {
  const tokens = input.match(/[\p{L}\p{N}_#.,:+-]+/gu) ?? [];
  const cleaned = tokens
    .map((t) => t.replace(/^[.,:+-]+|[.,:+-]+$/g, ''))
    .filter((t) => t.length > 0)
    .slice(0, 12);

  if (cleaned.length === 0) return [];

  const quote = (t: string) => `"${t.replace(/"/g, '""')}"`;
  const exact = cleaned.map(quote);
  const prefix = cleaned.map((t) => `${quote(t)}*`);

  const variants = [exact.join(' AND ')];
  if (prefix.join(' AND ') !== variants[0]) variants.push(prefix.join(' AND '));
  if (cleaned.length > 1) variants.push(prefix.join(' OR '));
  return variants;
}

/** Parse a JSON column, returning `fallback` when it is null or malformed. */
export function json<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || value === '') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Clamp a caller-supplied limit into a sane range. */
export function clampLimit(value: unknown, fallback: number, max = 50): number {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

/** Truncate long text for search results, on a line boundary where possible. */
export function snippet(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastBreak = cut.lastIndexOf('\n');
  return `${(lastBreak > maxChars * 0.5 ? cut.slice(0, lastBreak) : cut).trimEnd()}\n…`;
}
