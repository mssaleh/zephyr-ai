#!/usr/bin/env node
/**
 * Report the corpus a built index actually contains, and optionally pin it.
 *
 * Only row counts are pinned. They are the one thing here that no other check
 * covers: against a fixed Zephyr tree, a parser or query regression shows up as a
 * count that moved. Index size is budgeted in performance.mjs and bundle identity
 * is proven by verify-artifacts, so repeating either here would tax every change
 * without catching anything new.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const indexPath = resolve(process.env.ZEPHYR_AI_INDEX ?? `${ROOT}/index/zephyr.db`);
const fixtures = resolve(ROOT, 'scripts', 'quality', 'fixtures');

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

// Counts are only meaningful against the tree they were measured from, so the
// tree identity is pinned with them.
const pinned = {
  schemaVersion: Number(meta.schema_version),
  zephyrVersion: meta.zephyr_version,
  zephyrCommit: meta.zephyr_commit,
  counts,
};

process.stdout.write(
  `${JSON.stringify({ ...pinned, indexBytes: statSync(indexPath).size, apiIngestMode: meta.api_ingest_mode }, null, 2)}\n`,
);

if (process.argv.includes('--verify')) {
  // The development index and the released Doxygen-backed index are different
  // artifacts with different corpora, so each owns a baseline. Selecting by the
  // recorded ingest mode means the artifact that ships is the one that is pinned,
  // instead of only the header-fallback build being checked.
  const baselinePath = resolve(
    fixtures,
    meta.api_ingest_mode === 'doxygen-xml' ? 'baseline-counts-semantic.json' : 'baseline-counts.json',
  );
  if (!existsSync(baselinePath)) {
    throw new Error(`No corpus baseline exists for api_ingest_mode=${meta.api_ingest_mode}: ${baselinePath}`);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  if (JSON.stringify(pinned) !== JSON.stringify(baseline)) {
    process.stderr.write(
      `Corpus counts differ from ${baselinePath}. If the change is intended, regenerate the fixture with ` +
        'npm run quality:counts and say why in the commit message.\n',
    );
    process.exitCode = 1;
  }
}
