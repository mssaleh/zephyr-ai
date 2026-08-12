#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const path = resolve(process.env.ZEPHYR_AI_INDEX ?? `${ROOT}/index/zephyr.db`);
if (!existsSync(path)) throw new Error(`Required index is missing: ${path}`);

const db = new DatabaseSync(path, { readOnly: true });
const integrity = String(db.prepare('PRAGMA integrity_check').get().integrity_check);
const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
const pairs = [
  ['doc_fts', 'doc_chunk'],
  ['kconfig_fts', 'kconfig'],
  ['dt_fts', 'dt_binding'],
  ['board_fts', 'board'],
  ['sample_fts', 'sample'],
  ['api_fts', 'api_symbol'],
];
const parity = pairs.map(([fts, content]) => ({
  fts,
  content,
  ftsCount: Number(db.prepare(`SELECT COUNT(*) AS n FROM ${fts}`).get().n),
  contentCount: Number(db.prepare(`SELECT COUNT(*) AS n FROM ${content}`).get().n),
}));
db.close();

process.stdout.write(`${JSON.stringify({ integrity, foreignKeyViolations: foreignKeys.length, parity }, null, 2)}\n`);
if (integrity !== 'ok' || foreignKeys.length > 0 || parity.some((row) => row.ftsCount !== row.contentCount)) {
  process.exitCode = 1;
}
