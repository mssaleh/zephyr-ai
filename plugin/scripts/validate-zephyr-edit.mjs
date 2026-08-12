#!/usr/bin/env node
/**
 * Conservative PostToolUse validation for Zephyr configuration files.
 *
 * The validator only reports what the indexed catalogue can decide on its own:
 * malformed assignment syntax, assigning a promptless symbol from application
 * configuration, and a value whose type contradicts the declaration. It does not
 * report that a symbol or compatible is absent. Catalogue completeness describes
 * the indexed Zephyr tree, not the user's project, which may legitimately declare
 * its own Kconfig and bindings through DTS_ROOT and out-of-tree module roots.
 *
 * When validation cannot run at all — no project index, an unreadable file, a
 * project that is not Zephyr — it exits 0 in silence. SessionStart already
 * reports a missing or unusable index once per session.
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  descriptorFingerprint,
  findWestWorkspace,
  readHookInput,
  resolveIndexPath,
  validIndexDescriptor,
} from './index-paths.mjs';

const EXPECTED_SCHEMA = 5;
const EXPECTED_DESCRIPTOR = 2;
const MAX_REPORTED = 12;

/** The edited path left the project root; a genuine anomaly, not an unavailability. */
class OutsideProjectError extends Error {}

function fileKind(path) {
  const name = basename(path);
  if (/\.conf$/.test(name) || /_defconfig$/.test(name)) return 'kconfig';
  return null;
}

function inside(root, path) {
  const rel = relative(root, path);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`));
}

function canonical(path) {
  try {
    return realpathSync(resolve(path));
  } catch {
    return resolve(path);
  }
}

function finalFile(projectRoot, requestedPath) {
  const root = realpathSync(resolve(projectRoot));
  const lexical = resolve(root, requestedPath);
  if (!inside(root, lexical)) throw new OutsideProjectError('the edited path is outside the active project root');
  if (!existsSync(lexical)) throw new Error('the edited file does not exist after the tool completed');
  const canonicalPath = realpathSync(lexical);
  if (!inside(root, canonicalPath)) {
    throw new OutsideProjectError('the edited path resolves outside the active project root');
  }
  return { root, path: canonicalPath, text: readFileSync(canonicalPath, 'utf8') };
}

/**
 * Decide whether this project is a Zephyr project at all.
 *
 * A `.conf` file is not a Zephyr artifact by extension alone. Without this the
 * validator would inspect any configuration file in any project that happens to
 * have an index in scope.
 */
function looksLikeZephyrProject(projectRoot, descriptor) {
  if (findWestWorkspace(projectRoot)) return true;
  if (process.env.ZEPHYR_BASE) return true;
  if (descriptor?.projectRoot && canonical(descriptor.projectRoot) === projectRoot) return true;
  try {
    return /find_package\s*\(\s*Zephyr\b/.test(readFileSync(join(projectRoot, 'CMakeLists.txt'), 'utf8'));
  } catch {
    return false;
  }
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
      '\nUse get_kconfig to inspect the indexed declaration, then correct the file.\n',
  );
  return 2;
}

async function main() {
  const payload = await readHookInput();
  const input = payload.tool_input ?? {};
  const requestedPath = input.file_path ?? input.path ?? '';
  if (!requestedPath || fileKind(requestedPath) !== 'kconfig') return 0;
  const projectRoot = process.env.ZEPHYR_AI_PROJECT_ROOT ?? process.env.CLAUDE_PROJECT_DIR;
  if (!projectRoot) return 0;

  let file;
  try {
    file = finalFile(projectRoot, requestedPath);
  } catch (error) {
    if (error instanceof OutsideProjectError) {
      process.stderr.write(`Zephyr validation stopped: ${error.message}.\n`);
      return 2;
    }
    return 0;
  }

  const info = resolveIndexPath();
  if (!info) return 0;
  let opened;
  try {
    opened = openValidatedIndex(info.path);
  } catch {
    return 0;
  }
  const { db, descriptor } = opened;
  const problems = [];
  try {
    if (!looksLikeZephyrProject(file.root, descriptor)) return 0;
    const parsed = extractConfigs(file.text);
    for (const entry of parsed.malformed) {
      problems.push(`  line ${entry.line}: malformed Kconfig assignment: ${entry.text}`);
    }
    const stmt = db.prepare('SELECT name, type, has_prompt FROM kconfig WHERE name = ?');
    for (const entry of parsed.assignments) {
      const row = stmt.get(entry.name);
      // A miss is not evidence of absence: generated, application-local, and
      // out-of-tree module symbols are outside this catalogue by construction.
      if (!row) continue;
      if (!file.path.endsWith('_defconfig') && Number(row.has_prompt) === 0) {
        problems.push(
          `  line ${entry.line}: CONFIG_${entry.name} has no prompt and cannot be assigned from an application configuration. Enable the symbol that selects it instead.`,
        );
        continue;
      }
      const mismatch = valueProblem(String(row.type ?? ''), entry.value);
      if (mismatch) problems.push(`  line ${entry.line}: CONFIG_${entry.name} ${mismatch}.`);
    }
  } finally {
    db.close();
  }
  return problems.length ? emit(file.path, problems) : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    // Exit 0 keeps an internal fault from being reported as an invalid edit; the
    // message still reaches the hook debug log.
    process.stderr.write(
      `Zephyr validation skipped after an internal error: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(0);
  });
