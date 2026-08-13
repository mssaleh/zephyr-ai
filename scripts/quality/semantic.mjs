#!/usr/bin/env node
/** Corpus-level semantic gates derived from the pinned source and built index. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ZEPHYR = resolve(process.env.ZEPHYR_BASE ?? join(ROOT, '.cache', 'zephyr'));
const INDEX = resolve(process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db'));
const ALLOWLIST = JSON.parse(
  readFileSync(join(ROOT, 'scripts', 'quality', 'fixtures', 'kconfig-recall-allowlist.json'), 'utf8'),
);
if (!existsSync(join(ZEPHYR, 'VERSION')) || !existsSync(INDEX)) {
  throw new Error('Semantic quality gates require the pinned Zephyr tree and rebuilt index.');
}

function* files(root, predicate) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) yield* files(path, predicate);
    else if (entry.isFile() && predicate(path)) yield path;
  }
}

function asStrings(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

const db = new DatabaseSync(INDEX, { readOnly: true });
const failures = [];
const measured = {};
const count = (sql, ...params) => Number(db.prepare(sql).get(...params).n);

measured.unresolvedKconfigNames = count("SELECT COUNT(*) AS n FROM kconfig WHERE name LIKE '%$(%' OR name LIKE '%${%'");
if (measured.unresolvedKconfigNames !== 0) failures.push('unresolved Kconfig preprocessor names are indexed');
measured.generatedLoggingSymbol = count("SELECT COUNT(*) AS n FROM kconfig WHERE name = 'SENSOR_LOG_LEVEL_DBG'");
if (measured.generatedLoggingSymbol !== 1) failures.push('SENSOR_LOG_LEVEL_DBG is missing');
measured.sampleLocalKconfig = count("SELECT COUNT(*) AS n FROM kconfig_definition WHERE file LIKE 'samples/%' OR file LIKE 'snippets/%'");
if (measured.sampleLocalKconfig !== 0) failures.push('sample-local Kconfig definitions polluted the canonical catalogue');
measured.unnamedChoices = count("SELECT COUNT(*) AS n FROM kconfig_choice WHERE stable_id LIKE '%<unnamed>%'");
if (measured.unnamedChoices !== 0) failures.push('unnamed choice placeholders are indexed');

const indexedSymbols = new Set(db.prepare('SELECT name FROM kconfig').all().map((row) => String(row.name)));
const assigned = new Set();
const assignedEvidence = new Map();
for (const base of ['samples', 'snippets']) {
  for (const path of files(join(ZEPHYR, base), (file) => file.endsWith('.conf'))) {
    readFileSync(path, 'utf8').split(/\r?\n/).forEach((line, index) => {
      const match = line.match(/^\s*CONFIG_([A-Za-z0-9_]+)\s*=/)
        ?? line.match(/^\s*#\s*CONFIG_([A-Za-z0-9_]+)\s+is not set\s*$/);
      if (!match) return;
      assigned.add(match[1]);
      const evidence = assignedEvidence.get(match[1]) ?? new Set();
      evidence.add(`${path.slice(ZEPHYR.length + 1)}:${index + 1}`);
      assignedEvidence.set(match[1], evidence);
    });
  }
}
const malformedAllowlist = Object.entries(ALLOWLIST).flatMap(([name, entry]) => {
  if (!entry || typeof entry !== 'object' || typeof entry.reason !== 'string' || !entry.reason.trim()) return [name];
  if (!Array.isArray(entry.assignedAt) || entry.assignedAt.length === 0) return [name];
  const observed = assignedEvidence.get(name) ?? new Set();
  if (entry.assignedAt.some((value) => typeof value !== 'string' || !observed.has(value))) return [name];
  return [];
}).sort();
const unexplained = [...assigned].filter((name) => !indexedSymbols.has(name) && !ALLOWLIST[name]).sort();
const staleAllowlist = Object.keys(ALLOWLIST)
  .filter((name) => indexedSymbols.has(name) || !assigned.has(name))
  .sort();
measured.kconfigAssigned = assigned.size;
measured.kconfigUnexplainedMisses = unexplained;
measured.kconfigStaleAllowlist = staleAllowlist;
measured.kconfigMalformedAllowlist = malformedAllowlist;
if (unexplained.length) failures.push(`unexplained sample Kconfig misses: ${unexplained.join(', ')}`);
if (staleAllowlist.length) failures.push(`stale Kconfig recall allowlist entries: ${staleAllowlist.join(', ')}`);
if (malformedAllowlist.length) failures.push(`Kconfig recall exclusions without current source evidence: ${malformedAllowlist.join(', ')}`);

const declaredCompatibles = new Set();
let rawChildDepth = 0;
const childDepth = (node, depth = 0) => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  rawChildDepth = Math.max(rawChildDepth, depth);
  if (node['child-binding']) childDepth(node['child-binding'], depth + 1);
};
for (const path of files(join(ZEPHYR, 'dts', 'bindings'), (file) => /\.ya?ml$/.test(file))) {
  const doc = parseYaml(readFileSync(path, 'utf8'), { logLevel: 'silent' });
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) continue;
  if (typeof doc.compatible === 'string') declaredCompatibles.add(doc.compatible);
  const compatible = doc.properties?.compatible;
  if (typeof compatible?.const === 'string') declaredCompatibles.add(compatible.const);
  for (const value of compatible?.enum ?? []) if (typeof value === 'string') declaredCompatibles.add(value);
  childDepth(doc);
}
const indexedCompatibles = new Set(db.prepare('SELECT DISTINCT compatible FROM dt_binding').all().map((row) => String(row.compatible)));
const missingDeclarations = [...declaredCompatibles].filter((value) => !indexedCompatibles.has(value)).sort();
measured.bindingDeclarations = declaredCompatibles.size;
measured.bindingDeclarationMisses = missingDeclarations;
if (missingDeclarations.length) failures.push(`binding declaration misses: ${missingDeclarations.join(', ')}`);

const usedCompatibles = new Set();
for (const sourceRoot of ['boards', 'dts', 'soc', 'samples', 'tests']) {
  for (const path of files(join(ZEPHYR, sourceRoot), (file) => /\.(?:dts|dtsi|overlay)$/.test(file))) {
    const text = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const assignment of text.matchAll(/\bcompatible\s*=\s*([\s\S]*?);/g)) {
      for (const value of assignment[1].matchAll(/"([^"]+)"/g)) usedCompatibles.add(value[1]);
    }
  }
}
const resolvable = [...usedCompatibles].filter((value) => declaredCompatibles.has(value));
const unresolved = resolvable.filter((value) => !indexedCompatibles.has(value)).sort();
measured.bindingResolvableUses = resolvable.length;
measured.bindingResolutionMisses = unresolved;
if (unresolved.length) failures.push(`binding resolution misses: ${unresolved.join(', ')}`);
const indexedDepth = count('SELECT COALESCE(MAX(child_level), 0) AS n FROM dt_property');
measured.bindingRawChildDepth = rawChildDepth;
measured.bindingIndexedChildDepth = indexedDepth;
if (indexedDepth < rawChildDepth) failures.push(`indexed child-binding depth ${indexedDepth} is below source depth ${rawChildDepth}`);

measured.emptyDocChunks = count("SELECT COUNT(*) AS n FROM doc_chunk WHERE TRIM(body) = ''");
if (measured.emptyDocChunks) failures.push('empty documentation chunks are indexed');
const buildDocs = [...files(join(ZEPHYR, 'doc', 'build'), (file) => file.endsWith('.rst'))].length;
const indexedBuildDocs = count("SELECT COUNT(*) AS n FROM doc WHERE path LIKE 'doc/build/%.rst'");
measured.buildDocs = { source: buildDocs, indexed: indexedBuildDocs };
if (buildDocs !== indexedBuildDocs) failures.push(`doc/build coverage is ${indexedBuildDocs}/${buildDocs}`);
measured.ambiguousDocUrls = count('SELECT COUNT(*) AS n FROM (SELECT url FROM doc GROUP BY url HAVING COUNT(*) != 1)');
if (measured.ambiguousDocUrls) failures.push('stored documentation URLs are not one-to-one');

measured.apiEnumAssignmentFunctions = count("SELECT COUNT(*) AS n FROM api_symbol WHERE kind = 'function' AND signature LIKE '%=%'");
if (measured.apiEnumAssignmentFunctions) failures.push('enum assignments are classified as API functions');
measured.apiArrayDeclaratorFunctions = count(
  "SELECT COUNT(*) AS n FROM api_symbol WHERE kind = 'function' AND instr(signature, '[') > 0 AND instr(signature, '[') < instr(signature, '(')",
);
if (measured.apiArrayDeclaratorFunctions) failures.push('array-bound macro calls are classified as API functions');
const apiMode = String(db.prepare("SELECT value FROM meta WHERE key = 'api_ingest_mode'").get()?.value ?? 'unknown');
measured.apiMode = apiMode;
if (apiMode === 'doxygen-xml') {
  const requiredApi = [
    'gpio_pin_configure',
    'k_sleep',
    'bt_enable',
    'net_if_up',
    'sensor_sample_fetch',
    'pm_device_action_run',
  ];
  const missingApi = requiredApi.filter((name) => count('SELECT COUNT(*) AS n FROM api_symbol WHERE name = ?', name) === 0);
  measured.apiRequiredMisses = missingApi;
  measured.apiMissingAnchors = count("SELECT COUNT(*) AS n FROM api_symbol WHERE doxygen_id IS NULL OR doxygen_id = '' OR doc_anchor IS NULL OR doc_anchor = ''");
  measured.apiPrivateHeaders = count("SELECT COUNT(*) AS n FROM api_symbol WHERE header LIKE '/%' OR header LIKE '%:\\%'");
  if (missingApi.length) failures.push(`semantic API misses required public symbols: ${missingApi.join(', ')}`);
  if (measured.apiMissingAnchors) failures.push('semantic API symbols lack stable Doxygen identifiers/anchors');
  if (measured.apiPrivateHeaders) failures.push('semantic API provenance exposes absolute paths');
}

measured.boardsWithoutTargets = count("SELECT COUNT(*) AS n FROM board WHERE targets = '[]'");
if (measured.boardsWithoutTargets) failures.push('boards with valid metadata have no targets');
measured.boardDocsMissing = count(
  "SELECT COUNT(*) AS n FROM board b WHERE b.doc_path IS NULL AND EXISTS (SELECT 1 FROM doc d WHERE d.path LIKE b.dir || '/doc/%.rst')",
);
if (measured.boardDocsMissing) failures.push('board documentation exists but is not linked from the board record');
measured.sampleFileParity = count(
  'SELECT COUNT(*) AS n FROM sample s WHERE json_array_length(s.files) != (SELECT COUNT(*) FROM sample_file f WHERE f.sample_id = s.id)',
);
if (measured.sampleFileParity) failures.push('eligible and stored sample file counts differ');
// Each row must carry the manifest its kind is named for: a sample is defined by
// its sample.yaml and a Twister suite by its testcase.yaml, and a row whose
// manifest was not captured cannot be read back at all.
measured.samplesMissingManifest = count(
  `SELECT COUNT(*) AS n FROM sample s WHERE NOT EXISTS (
     SELECT 1 FROM sample_file f
      WHERE f.sample_id = s.id
        AND f.path = CASE s.kind WHEN 'test' THEN 'testcase.yaml' ELSE 'sample.yaml' END
   )`,
);
if (measured.samplesMissingManifest) failures.push('the defining manifest is not captured for every sample or test');

measured.testsIndexed = count("SELECT COUNT(*) AS n FROM sample WHERE kind = 'test'");
if (!measured.testsIndexed) failures.push('no upstream Twister test suites are indexed');

// A Python `None` that reached JSON.stringify becomes the four-character string
// "null", which every consumer reads as a value: get_binding announced "is a bus
// controller for: null" on 2,929 bindings that control no bus. Nothing else
// catches it, because the column is populated and the row count is right.
measured.stringifiedNulls = [];
for (const table of db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE '%_fts%'")
  .all()) {
  for (const column of db.prepare(`PRAGMA table_info(${table.name})`).all()) {
    if (column.type !== 'TEXT') continue;
    const n = count(
      `SELECT COUNT(*) AS n FROM "${table.name}" WHERE "${column.name}" = 'null'`,
    );
    if (n) measured.stringifiedNulls.push(`${table.name}.${column.name}=${n}`);
  }
}
if (measured.stringifiedNulls.length) {
  failures.push(`a stringified null is stored as a value: ${measured.stringifiedNulls.join(', ')}`);
}

const REPORTS = ['report_docs', 'report_kconfig', 'report_bindings', 'report_boards', 'report_samples', 'report_api', 'report_west'];
for (const key of REPORTS) {
  const raw = db.prepare('SELECT value FROM meta WHERE key = ?').get(key)?.value;
  const report = raw ? JSON.parse(String(raw)) : null;
  const exclusions = report?.intentionallyExcluded?.length ?? 0;
  const errors = report?.errors?.length ?? 0;
  measured[key] = report ? { discovered: report.discovered, indexed: report.indexed, exclusions, errors } : null;
  if (!report || report.errors.length) failures.push(`${key} is absent or contains errors`);
  if (report?.intentionallyExcluded?.some(
    (entry) => !entry.path || !/^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9_-]+)?$/.test(entry.reason),
  )) {
    failures.push(`${key} has an exclusion without a path and stable reason code`);
  }
  if (report && report.discovered !== report.indexed + exclusions + errors) {
    failures.push(
      `${key} has unaccounted records: discovered=${report.discovered}, indexed=${report.indexed}, ` +
      `excluded=${exclusions}, errors=${errors}`,
    );
  }
}

// Twister `common:` is merged into the relational sample evidence and tags.
let commonMismatches = 0;
for (const path of files(join(ZEPHYR, 'samples'), (file) => /\/sample\.yaml$/.test(file))) {
  const doc = parseYaml(readFileSync(path, 'utf8'), { logLevel: 'silent' });
  if (!doc?.common || typeof doc.common !== 'object') continue;
  const rel = path.slice(ZEPHYR.length + 1).replace(/\/sample\.yaml$/, '');
  const row = db.prepare('SELECT tags, depends_on, integration_platforms, platform_allow FROM sample WHERE path = ?').get(rel);
  if (!row) continue;
  for (const [source, column] of [
    ['tags', 'tags'], ['depends_on', 'depends_on'], ['integration_platforms', 'integration_platforms'], ['platform_allow', 'platform_allow'],
  ]) {
    const indexed = new Set(JSON.parse(String(row[column])));
    if (asStrings(doc.common[source]).some((value) => !indexed.has(value))) commonMismatches++;
  }
}
measured.twisterCommonMismatches = commonMismatches;
if (commonMismatches) failures.push('Twister common metadata does not match indexed sample metadata');

db.close();
process.stdout.write(`${JSON.stringify({ measured, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
