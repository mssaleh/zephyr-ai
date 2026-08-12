#!/usr/bin/env node
/** Conservative PostToolUse validation for Zephyr configuration files. */
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  descriptorFingerprint,
  readHookInput,
  resolveIndexPath,
  validIndexDescriptor,
} from './index-paths.mjs';

const EXPECTED_SCHEMA = 5;
const EXPECTED_DESCRIPTOR = 2;
const MAX_REPORTED = 12;

function fileKind(path) {
  const name = basename(path);
  if (/\.(overlay|dts|dtsi)$/.test(name)) return 'devicetree';
  if (/\.conf$/.test(name) || /_defconfig$/.test(name)) return 'kconfig';
  return null;
}

function inside(root, path) {
  const rel = relative(root, path);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`));
}

function finalFile(projectRoot, requestedPath) {
  const root = realpathSync(resolve(projectRoot));
  const lexical = resolve(root, requestedPath);
  if (!inside(root, lexical)) throw new Error('the edited path is outside the active project root');
  if (!existsSync(lexical)) throw new Error('the edited file does not exist after the tool completed');
  const canonical = realpathSync(lexical);
  if (!inside(root, canonical)) throw new Error('the edited path resolves outside the active project root');
  return { path: canonical, text: readFileSync(canonical, 'utf8') };
}

function logicalLines(text) {
  const physical = text.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  for (let i = 0; i < physical.length; i++) {
    const start = i + 1;
    let value = physical[i];
    while (/\\\s*$/.test(value) && i + 1 < physical.length) {
      value = value.replace(/\\\s*$/, '') + physical[++i].trimStart();
    }
    out.push({ line: start, text: value });
  }
  return out;
}

function extractConfigs(text) {
  const assignments = [];
  const malformed = [];
  for (const logical of logicalLines(text)) {
    const line = logical.text;
    if (/^\s*$/.test(line)) continue;
    const unset = line.match(/^\s*#\s*CONFIG_([A-Za-z0-9_]+)\s+is\s+not\s+set\s*$/);
    if (unset) {
      assignments.push({ name: unset[1], value: 'n', line: logical.line, unset: true });
      continue;
    }
    if (/^\s*#/.test(line)) {
      if (/^\s*#\s*CONFIG_.*\bis\s+not\b/.test(line)) {
        malformed.push({ line: logical.line, text: line.trim() });
      }
      continue;
    }
    const assignment = line.match(/^\s*CONFIG_([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (assignment && assignment[2] !== '') {
      assignments.push({ name: assignment[1], value: assignment[2], line: logical.line, unset: false });
    } else if (/^\s*CONFIG_/.test(line)) {
      malformed.push({ line: logical.line, text: line.trim() });
    }
  }
  return { assignments, malformed };
}

function stripDtsComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (comment) => ' '.repeat(comment.length));
}

function extractCompatibles(text) {
  const source = stripDtsComments(text);
  const out = [];
  for (const assignment of source.matchAll(/\bcompatible\s*=\s*([\s\S]*?);/g)) {
    const body = assignment[1];
    const base = (assignment.index ?? 0) + assignment[0].indexOf(body);
    for (const value of body.matchAll(/"([^"\n]+)"/g)) {
      const offset = base + (value.index ?? 0);
      out.push({ value: value[1], line: source.slice(0, offset).split('\n').length });
    }
  }
  return out;
}

function openValidatedIndex(path) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const rows = db.prepare('SELECT key, value FROM meta').all();
    const meta = Object.fromEntries(rows.map((row) => [String(row.key), String(row.value)]));
    const descriptor = JSON.parse(meta.index_descriptor ?? 'null');
    if (
      Number(meta.schema_version) !== EXPECTED_SCHEMA ||
      !validIndexDescriptor(descriptor, EXPECTED_SCHEMA, EXPECTED_DESCRIPTOR) ||
      descriptor.contextFingerprint !== meta.context_fingerprint ||
      descriptorFingerprint(descriptor) !== descriptor.contextFingerprint
    ) {
      throw new Error('the index schema or descriptor is incompatible');
    }
    return { db, descriptor };
  } catch (error) {
    db.close();
    throw error;
  }
}

function valueProblem(type, value) {
  if ((type === 'bool' || type === 'tristate') && !['y', 'm', 'n'].includes(value)) {
    return `is ${type} but is set to "${value}" (expected ${type === 'bool' ? 'y or n' : 'y, m, or n'})`;
  }
  if (type === 'bool' && value === 'm') return 'is bool but is set to "m" (expected y or n)';
  if (type === 'int' && !/^-?[0-9]+$/.test(value)) return `is int but is set to "${value}"`;
  if (type === 'hex' && !/^(?:0x)?[0-9a-fA-F]+$/.test(value)) return `is hex but is set to "${value}"`;
  if (type === 'string' && !/^"(?:[^"\\]|\\.)*"$/.test(value)) return `is string but is not a quoted string`;
  return null;
}

function emit(path, problems) {
  const shown = problems.slice(0, MAX_REPORTED);
  const extra = problems.length - shown.length;
  process.stderr.write(
    `Zephyr validation found ${problems.length} problem(s) in ${basename(path)}:\n` +
      `${shown.join('\n')}\n` +
      (extra > 0 ? `  ... and ${extra} more.\n` : '') +
      '\nUse get_kconfig or get_binding to inspect the indexed declaration, then correct the file.\n',
  );
  return 2;
}

function unavailable(reason) {
  process.stderr.write(
    `Zephyr validation was unavailable: ${reason}. The edit was not proven invalid. ` +
      'Run the zephyr-index skill to create or repair the project index, then re-check this file.\n',
  );
  return 2;
}

async function main() {
  const payload = await readHookInput();
  const input = payload.tool_input ?? {};
  const requestedPath = input.file_path ?? input.path ?? '';
  if (!requestedPath || !fileKind(requestedPath)) return 0;
  const projectRoot = process.env.ZEPHYR_AI_PROJECT_ROOT ?? process.env.CLAUDE_PROJECT_DIR;
  if (!projectRoot) return unavailable('the active project root was not provided to the hook');

  let file;
  try {
    file = finalFile(projectRoot, requestedPath);
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : 'the final file could not be read safely');
  }

  const info = resolveIndexPath();
  if (!info) return unavailable('no compatible project index is available');
  let opened;
  try {
    opened = openValidatedIndex(info.path);
  } catch {
    return unavailable('the selected index is corrupt or incompatible');
  }
  const { db, descriptor } = opened;
  const problems = [];
  try {
    if (fileKind(file.path) === 'kconfig') {
      const parsed = extractConfigs(file.text);
      for (const entry of parsed.malformed) {
        problems.push(`  line ${entry.line}: malformed Kconfig assignment: ${entry.text}`);
      }
      const stmt = db.prepare('SELECT name, type, has_prompt FROM kconfig WHERE name = ?');
      for (const entry of parsed.assignments) {
        const row = stmt.get(entry.name);
        if (!row) {
          if (descriptor.coverage.kconfig?.complete) {
            problems.push(
              `  line ${entry.line}: CONFIG_${entry.name} was not found in this complete indexed Kconfig context.`,
            );
          }
          continue;
        }
        if (!file.path.endsWith('_defconfig') && Number(row.has_prompt) === 0) {
          problems.push(
            `  line ${entry.line}: CONFIG_${entry.name} has no prompt and cannot be assigned from an application configuration. Enable the symbol that selects it instead.`,
          );
          continue;
        }
        const mismatch = valueProblem(String(row.type ?? ''), entry.value);
        if (mismatch) problems.push(`  line ${entry.line}: CONFIG_${entry.name} ${mismatch}.`);
      }
    } else {
      const stmt = db.prepare('SELECT 1 FROM dt_binding WHERE compatible = ? LIMIT 1');
      for (const entry of extractCompatibles(file.text)) {
        if (!stmt.get(entry.value) && descriptor.coverage.bindings?.complete) {
          problems.push(
            `  line ${entry.line}: compatible "${entry.value}" was not found in this complete indexed binding catalogue.`,
          );
        }
      }
    }
  } finally {
    db.close();
  }
  return problems.length ? emit(file.path, problems) : 0;
}

main()
  .then((code) => process.exit(code))
  .catch(() => process.exit(unavailable('the validator encountered an unexpected infrastructure failure')));
