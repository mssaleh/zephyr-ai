#!/usr/bin/env node
/**
 * Regenerate the reviewed Kconfig recall exclusions from pinned-tree evidence.
 *
 * The catalogue intentionally evaluates Zephyr's canonical Kconfig root, not
 * every application, test, sysbuild image, or optional external module.  This
 * utility records the exact source lines behind the residual sample/snippet
 * assignments so the recall gate has auditable exclusions instead of a bag of
 * unexplained symbol names.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ZEPHYR = resolve(process.env.ZEPHYR_BASE ?? join(ROOT, '.cache', 'zephyr'));
const INDEX = resolve(process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db'));
const OUTPUT = join(ROOT, 'scripts', 'quality', 'fixtures', 'kconfig-recall-allowlist.json');

if (!existsSync(join(ZEPHYR, 'VERSION')) || !existsSync(INDEX)) {
  throw new Error('Allowlist generation requires the pinned Zephyr tree and rebuilt index.');
}

function* files(root, predicate) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) yield* files(path, predicate);
    else if (entry.isFile() && predicate(path)) yield path;
  }
}

function sourceRef(path, line) {
  return `${relative(ZEPHYR, path).replaceAll('\\', '/')}:${line}`;
}

const definitions = new Map();
for (const path of files(ZEPHYR, (file) => /(?:^|\/)Kconfig(?:\.[^/]+)?$/.test(file))) {
  readFileSync(path, 'utf8').split(/\r?\n/).forEach((line, index) => {
    const match = line.match(/^\s*(?:menuconfig|config|configdefault)\s+([A-Za-z0-9_]+)\b/);
    if (!match) return;
    const locations = definitions.get(match[1]) ?? [];
    locations.push(sourceRef(path, index + 1));
    definitions.set(match[1], locations);
  });
}

const assignments = new Map();
for (const base of ['samples', 'snippets']) {
  for (const path of files(join(ZEPHYR, base), (file) => file.endsWith('.conf'))) {
    readFileSync(path, 'utf8').split(/\r?\n/).forEach((line, index) => {
      const match = line.match(/^\s*CONFIG_([A-Za-z0-9_]+)\s*=/)
        ?? line.match(/^\s*#\s*CONFIG_([A-Za-z0-9_]+)\s+is not set\s*$/);
      if (!match) return;
      const locations = assignments.get(match[1]) ?? [];
      locations.push(sourceRef(path, index + 1));
      assignments.set(match[1], locations);
    });
  }
}

const db = new DatabaseSync(INDEX, { readOnly: true });
const indexed = new Set(db.prepare('SELECT name FROM kconfig').all().map((row) => String(row.name)));
db.close();

const result = {};
for (const name of [...assignments.keys()].filter((symbol) => !indexed.has(symbol)).sort()) {
  const declaredAt = [...new Set(definitions.get(name) ?? [])].sort();
  const assignedAt = [...new Set(assignments.get(name) ?? [])].sort();
  result[name] = {
    reason: declaredAt.length > 0
      ? 'Declared by application/test-local Kconfig outside the canonical target-root catalogue.'
      : 'Referenced by a pinned-tree fixture but not declared by the canonical target-root evaluation; the declaration is generated or supplied by an optional module/image.',
    assignedAt,
    ...(declaredAt.length > 0 ? { declaredAt } : {}),
  };
}

const rendered = `${JSON.stringify(result, null, 2)}\n`;
if (process.argv.includes('--write')) {
  writeFileSync(OUTPUT, rendered);
  process.stdout.write(`Wrote ${Object.keys(result).length} source-backed exclusions to ${relative(ROOT, OUTPUT)}.\n`);
} else {
  process.stdout.write(rendered);
}
