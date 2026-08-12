#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const indexPath = resolve(process.env.ZEPHYR_AI_INDEX ?? `${ROOT}/index/zephyr.db`);
const baselinePath = resolve(ROOT, 'scripts', 'quality', 'fixtures', 'baseline-counts.json');

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

if (!existsSync(indexPath)) {
  throw new Error(`Required index is missing: ${indexPath}. Run npm run build:index.`);
}

const db = new DatabaseSync(indexPath, { readOnly: true });
const tables = [
  'doc',
  'doc_chunk',
  'kconfig',
  'dt_binding',
  'dt_property',
  'board',
  'soc',
  'sample',
  'sample_file',
  'api_symbol',
  'api_group',
];
const counts = Object.fromEntries(
  tables.map((table) => [table, Number(db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count)]),
);
const meta = Object.fromEntries(
  db.prepare('SELECT key, value FROM meta ORDER BY key').all().map((row) => [row.key, row.value]),
);
db.close();

const report = {
  schemaVersion: Number(meta.schema_version),
  zephyrVersion: meta.zephyr_version,
  zephyrCommit: meta.zephyr_commit,
  indexBytes: statSync(indexPath).size,
  counts,
  bundles: Object.fromEntries(
    ['plugin/mcp/zephyr-mcp.mjs', 'plugin/mcp/zephyr-ingest.mjs'].map((path) => [
      path,
      { bytes: statSync(resolve(ROOT, path)).size, sha256: sha256(resolve(ROOT, path)) },
    ]),
  ),
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes('--verify')) {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const measurement = baseline.measurement ?? baseline;
  if (baseline.measurement && (
    !Array.isArray(baseline.explanation) ||
    baseline.explanation.length === 0 ||
    baseline.explanation.some((entry) => typeof entry !== 'string' || !entry.trim())
  )) {
    throw new Error('A wrapped corpus baseline requires a non-empty source-derived explanation.');
  }
  if (JSON.stringify(report) !== JSON.stringify(measurement)) {
    process.stderr.write(
      `Corpus baseline differs from ${baselinePath}. Regenerate the report, explain the source-derived change, and update the fixture intentionally.\n`,
    );
    process.exitCode = 1;
  }
}
