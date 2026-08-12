#!/usr/bin/env node
/**
 * PostToolUse hook: validate Zephyr configuration edits against the index.
 *
 * Catches type errors the current catalogue can prove. Catalogue misses are
 * intentionally non-blocking because generated and workspace-local symbols
 * and bindings are not necessarily represented.
 *
 * Deliberately silent when everything checks out: a hook that comments on every
 * edit trains the reader to ignore it. When something is wrong it exits 2, which
 * is the only PostToolUse channel that reliably reaches the model (stdout on
 * exit 0 goes to the debug log, not to Claude).
 *
 * Devicetree *property* names are not validated. Doing that correctly needs a
 * real devicetree parse to know which node — and therefore which binding — a
 * property belongs to; matching property names globally produces false
 * positives on `aliases`, `chosen`, and label assignments, and a validator that
 * cries wolf is worse than none.
 */

import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { readHookInput, resolveIndexPath } from './index-paths.mjs';

/** Cap the report so a large generated file cannot flood the context. */
const MAX_REPORTED = 12;

function fileKind(path) {
  const name = basename(path);
  if (/\.(overlay|dts|dtsi)$/.test(name)) return 'devicetree';
  if (/\.conf$/.test(name) || /_defconfig$/.test(name)) return 'kconfig';
  return null;
}

/** Extract `CONFIG_X=...` assignments with their line numbers. */
function extractConfigs(text) {
  const out = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/^\s*CONFIG_([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out.push({ name: m[1], value: m[2], line: i + 1 });
  }
  return out;
}

/** Extract `compatible = "vendor,device"` strings, including multi-value lists. */
function extractCompatibles(text) {
  const out = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(\/\/|\*|\/\*)/.test(lines[i])) continue;
    const assignment = lines[i].match(/compatible\s*=\s*([^;]*)/);
    if (!assignment) continue;
    for (const m of assignment[1].matchAll(/"([^"]+)"/g)) {
      out.push({ value: m[1], line: i + 1 });
    }
  }
  return out;
}

/** The text an edit introduces, across the several tool input shapes. */
function editedText(toolName, input) {
  if (!input || typeof input !== 'object') return '';
  if (typeof input.content === 'string') return input.content;
  if (typeof input.new_string === 'string') return input.new_string;
  if (Array.isArray(input.edits)) {
    return input.edits.map((e) => (typeof e?.new_string === 'string' ? e.new_string : '')).join('\n');
  }
  return '';
}

/**
 * Suggest near-miss names by trying progressively shorter prefixes.
 *
 * A typo is usually a character too many or too few, so `bosch,bme280x` should
 * reach `bosch,bme280` — which searching on the vendor alone does not do, since
 * it returns whatever sorts shortest across the vendor's whole catalogue.
 */
function suggest(db, table, column, needles, limit = 3) {
  for (const needle of needles) {
    if (!needle || needle.length < 3) continue;
    try {
      const rows = db
        .prepare(
          `SELECT DISTINCT ${column} AS v FROM ${table} WHERE ${column} LIKE ?
             ORDER BY LENGTH(${column}), ${column} LIMIT ?`,
        )
        .all(`%${needle}%`, limit);
      if (rows.length > 0) return rows.map((r) => String(r.v));
    } catch {
      return [];
    }
  }
  return [];
}

/** Candidate substrings to match on, longest (most specific) first. */
function needleLadder(name) {
  const out = [name, name.slice(0, -1), name.slice(0, -2)];
  const comma = name.indexOf(',');
  if (comma > 0) out.push(name.slice(0, comma));
  else out.push(name.split('_').slice(0, 2).join('_'));
  return out;
}

async function main() {
  const payload = await readHookInput();
  const toolInput = payload.tool_input ?? {};
  const path = toolInput.file_path ?? toolInput.path ?? '';
  if (!path) return 0;

  const kind = fileKind(path);
  if (!kind) return 0;

  const text = editedText(payload.tool_name, toolInput);
  if (!text.trim()) return 0;

  const info = resolveIndexPath();
  if (!info || !existsSync(info.path)) return 0; // no index: stay quiet

  let db;
  try {
    db = new DatabaseSync(info.path, { readOnly: true });
  } catch {
    return 0;
  }

  const version = (() => {
    try {
      return db.prepare("SELECT value FROM meta WHERE key = 'zephyr_version'").get()?.value ?? '?';
    } catch {
      return '?';
    }
  })();

  const problems = [];

  if (kind === 'kconfig') {
    const stmt = db.prepare('SELECT name, type FROM kconfig WHERE name = ?');
    for (const entry of extractConfigs(text)) {
      const row = stmt.get(entry.name);
      if (!row) {
        // An index miss cannot prove invalidity until the catalogue has complete
        // generated and workspace-local coverage. Keep it non-blocking.
        continue;
      }
      // A bool assigned a number, or an int assigned y, silently misbehaves.
      const isBoolValue = entry.value === 'y' || entry.value === 'n';
      if (row.type === 'bool' && !isBoolValue) {
        problems.push(
          `  line ${entry.line}: CONFIG_${entry.name} is a bool but is set to "${entry.value}" (expected y or n).`,
        );
      } else if ((row.type === 'int' || row.type === 'hex') && isBoolValue) {
        problems.push(
          `  line ${entry.line}: CONFIG_${entry.name} is ${row.type} but is set to "${entry.value}".`,
        );
      }
    }
  }

  if (kind === 'devicetree') {
    const stmt = db.prepare('SELECT compatible FROM dt_binding WHERE compatible = ?');
    for (const entry of extractCompatibles(text)) {
      if (stmt.get(entry.value)) continue;
      // Binding misses are advisory until declaration coverage is proven by
      // the index descriptor. Do not reject otherwise valid devicetree.
      continue;
    }
  }

  db.close();
  if (problems.length === 0) return 0;

  const shown = problems.slice(0, MAX_REPORTED);
  const extra = problems.length - shown.length;

  process.stderr.write(
    `Zephyr validation found ${problems.length} problem(s) in ${path}:\n` +
      `${shown.join('\n')}\n` +
      (extra > 0 ? `  ... and ${extra} more.\n` : '') +
      '\nVerify each with the zephyr MCP tools (get_kconfig, get_binding) and correct the file. ' +
      'If a symbol comes from an out-of-tree module that is not indexed, say so and continue.\n',
  );
  return 2;
}

main()
  .then((code) => process.exit(code))
  .catch(() => process.exit(0)); // never let a hook failure disrupt the session
