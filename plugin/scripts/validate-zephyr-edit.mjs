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
 * path outside the project root, a project that is not Zephyr — it exits 0 in
 * silence. Exit 2 is the blocking-error contract and is reserved for a finding
 * about the file's contents. SessionStart already reports a missing or unusable
 * index once per session.
 *
 * A check that finds nothing is otherwise indistinguishable from a check that
 * never ran, both to someone reading a transcript and to a user wondering
 * whether the plugin is alive — and that blindness is exactly what hid an
 * unreachable devicetree branch for a whole release. So a clean file is
 * acknowledged once per file per session, on exit 0, as JSON on stdout:
 * `hookSpecificOutput.additionalContext` reaches the model and `systemMessage`
 * reaches the user, and neither is framed as a blocking error.
 */
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  descriptorFingerprint,
  findWestWorkspace,
  firstTimeThisSession,
  readHookInput,
  resolveIndexPath,
  validIndexDescriptor,
} from './index-paths.mjs';

const EXPECTED_SCHEMA = 7;
const EXPECTED_DESCRIPTOR = 2;
const MAX_REPORTED = 12;

function fileKind(path) {
  const name = basename(path);
  if (/\.conf$/.test(name) || /_defconfig$/.test(name)) return 'kconfig';
  if (/\.(dts|dtsi|overlay)$/.test(name)) return 'devicetree';
  return null;
}

/**
 * Blank out comment bodies, preserving length and line breaks.
 *
 * Offsets stay true to the file on disk, so a reported line number points at
 * the line the author sees. A `compatible` inside a commented-out node is not a
 * declaration.
 */
function blankComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
}

/**
 * Every `compatible` declaration in a devicetree source, with its line.
 *
 * This is a scan, not a parse, and it is confined to `compatible` for that
 * reason: the property is unambiguous wherever it appears, whereas deciding
 * whether any *other* property is valid needs to know which node owns it and
 * therefore which binding applies. Matching property names globally instead
 * produces false positives on `aliases`, `chosen`, and label assignments.
 */
function extractCompatibles(text) {
  const source = blankComments(text.replace(/\r\n?/g, '\n'));
  const out = [];
  for (const match of source.matchAll(/(?:^|[\s;{}])compatible\s*=\s*([^;{}]*);/g)) {
    const values = [...match[1].matchAll(/"([^"]*)"/g)].map((value) => value[1]).filter(Boolean);
    if (values.length === 0) continue;
    out.push({ values, line: source.slice(0, match.index).split('\n').length });
  }
  return out;
}

/**
 * Compatibles the project declares itself, which the catalogue cannot know.
 *
 * An application may add bindings through `dts/bindings`, so a compatible
 * missing from the index is only evidence of a mistake once these are ruled out.
 */
function localCompatibles(projectRoot) {
  const found = new Set();
  const walk = (dir, depth) => {
    if (depth > 6) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, depth + 1);
      else if (/\.ya?ml$/.test(entry.name)) {
        try {
          for (const match of readFileSync(path, 'utf8').matchAll(
            /^\s*(?:-\s*)?compatible\s*:\s*"?([^"\n#]+?)"?\s*$/gm,
          )) {
            found.add(match[1].trim());
          }
        } catch {
          /* an unreadable binding cannot narrow the catalogue */
        }
      }
    }
  };
  walk(join(projectRoot, 'dts', 'bindings'), 0);
  return found;
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
  if (!inside(root, lexical)) throw new Error('the edited path is outside the active project root');
  if (!existsSync(lexical)) throw new Error('the edited file does not exist after the tool completed');
  const canonicalPath = realpathSync(lexical);
  if (!inside(root, canonicalPath)) {
    throw new Error('the edited path resolves outside the active project root');
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
    const version = meta.zephyr_version ?? 'unknown';
    if (
      Number(meta.schema_version) !== EXPECTED_SCHEMA ||
      !validIndexDescriptor(descriptor, EXPECTED_SCHEMA, EXPECTED_DESCRIPTOR) ||
      descriptor.contextFingerprint !== meta.context_fingerprint ||
      descriptorFingerprint(descriptor) !== descriptor.contextFingerprint
    ) {
      throw new Error('the index schema or descriptor is incompatible');
    }
    return { db, descriptor, version };
  } catch (error) {
    db.close();
    throw error;
  }
}

function valueProblem(type, value) {
  // For bool and tristate, kconfiglib reads only the first character after `=`,
  // matching the C implementation it replaces, so `CONFIG_X=y # why` assigns y
  // and is legal — upstream ships exactly that. Rejecting the whole token
  // contradicted the tool that actually builds the firmware. Numeric and string
  // types are not lenient in the same way: kconfiglib validates those in full.
  if (type === 'bool' || type === 'tristate') {
    const allowed = type === 'bool' ? /^[yn]/ : /^[ymn]/;
    return allowed.test(value)
      ? null
      : `is ${type} but is set to "${value}" (expected ${type === 'bool' ? 'y or n' : 'y, m, or n'})`;
  }
  if (type === 'int' && !/^-?[0-9]+$/.test(value)) return `is int but is set to "${value}"`;
  if (type === 'hex' && !/^(?:0x)?[0-9a-fA-F]+$/.test(value)) return `is hex but is set to "${value}"`;
  if (type === 'string' && !/^"(?:[^"\\]|\\.)*"$/.test(value)) return `is string but is not a quoted string`;
  return null;
}

/**
 * Acknowledge a file that was really checked and really came back clean.
 *
 * Bounded to once per file per session, and said only when a check actually ran
 * against a real index — an acknowledgement that could appear when nothing was
 * checked would be worth less than the silence it replaces.
 */
function acknowledge(sessionId, path, kind, checked, version) {
  if (checked === 0) return;
  if (!firstTimeThisSession(sessionId, `validated:${path}`)) return;
  const subject = kind === 'kconfig' ? 'Kconfig assignment' : 'devicetree compatible';
  const summary =
    `Zephyr: checked ${checked} ${subject}${checked === 1 ? '' : 's'} in ${basename(path)} ` +
    `against indexed Zephyr ${version} — no problems found.`;
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          `${summary} Names absent from the catalogue are not reported: an application may ` +
          'declare its own Kconfig and bindings. Property names are never checked here — ' +
          'get_binding is the only reliable source for them.',
      },
      systemMessage: summary,
    })}\n`,
  );
}

function emit(path, problems, followUp) {
  const shown = problems.slice(0, MAX_REPORTED);
  const extra = problems.length - shown.length;
  process.stderr.write(
    `Zephyr validation found ${problems.length} problem(s) in ${basename(path)}:\n` +
      `${shown.join('\n')}\n` +
      (extra > 0 ? `  ... and ${extra} more.\n` : '') +
      `\n${followUp}\n`,
  );
  return 2;
}

async function main() {
  const payload = await readHookInput();
  const input = payload.tool_input ?? {};
  const requestedPath = input.file_path ?? input.path ?? '';
  const kind = requestedPath ? fileKind(requestedPath) : null;
  if (!kind) return 0;
  const projectRoot = process.env.ZEPHYR_AI_PROJECT_ROOT ?? process.env.CLAUDE_PROJECT_DIR;
  if (!projectRoot) return 0;

  let file;
  try {
    file = finalFile(projectRoot, requestedPath);
  } catch {
    // Exit 2 is the blocking-error contract, reserved for a finding about the
    // file's contents. A path this hook cannot reach is a reason not to run,
    // not a defect in the edit; reporting it as blocking taught agents to read
    // this hook's output as noise.
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
  const { db, descriptor, version } = opened;
  const sessionId = payload.session_id;
  const problems = [];
  let checked = 0;
  try {
    if (!looksLikeZephyrProject(file.root, descriptor)) return 0;
    if (kind === 'devicetree') {
      const outcome = validateDevicetree(db, file);
      if (outcome.code === 0) {
        acknowledge(sessionId, file.path, kind, outcome.checked, version);
      }
      return outcome.code;
    }
    const parsed = extractConfigs(file.text);
    checked = parsed.assignments.length + parsed.malformed.length;
    for (const entry of parsed.malformed) {
      problems.push(`  line ${entry.line}: malformed Kconfig assignment: ${entry.text}`);
    }
    // Zephyr's own build refuses an assignment to a promptless symbol, and it
    // decides promptlessness across *every* definition. This catalogue holds
    // only the definitions reachable in the context it was built for, so its
    // view is incomplete in three knowable ways, and each one produced a false
    // positive on Zephyr's own samples:
    //   - no type: the declaration itself was never indexed;
    //   - a definition under modules/: the real declaration lives in a module
    //     Kconfig that is only present when that module is;
    //   - only Kconfig.defconfig definitions: a defconfig sets a value, it does
    //     not declare the symbol.
    // Where the view is incomplete the check stays quiet, for the same reason a
    // missing symbol is never reported as absent.
    const stmt = db.prepare(`
      SELECT k.type AS type, k.has_prompt AS has_prompt,
             (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id) AS defs,
             (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id
               AND d.file LIKE 'modules/%') AS module_defs,
             (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id
               AND d.file LIKE '%Kconfig.defconfig%') AS defconfig_defs
        FROM kconfig k WHERE k.name = ?`);
    const promptStatusIsKnown = (row) =>
      row.type !== null && Number(row.defs) > 0 && Number(row.module_defs) === 0 &&
      Number(row.defconfig_defs) < Number(row.defs);
    for (const entry of parsed.assignments) {
      const row = stmt.get(entry.name);
      // A miss is not evidence of absence: generated, application-local, and
      // out-of-tree module symbols are outside this catalogue by construction.
      if (!row) continue;
      if (!file.path.endsWith('_defconfig') && Number(row.has_prompt) === 0 && promptStatusIsKnown(row)) {
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
  if (problems.length) {
    return emit(file.path, problems, 'Use get_kconfig to inspect the indexed declaration, then correct the file.');
  }
  acknowledge(sessionId, file.path, kind, checked, version);
  return 0;
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[right.length];
}

/**
 * The indexed compatible a value was most likely meant to be, if any.
 *
 * Absence is deliberately *not* treated as evidence of a mistake. An
 * application may declare bindings through `dts/bindings`, `DTS_ROOT`, or an
 * out-of-tree module, none of which the catalogue can see, so reporting every
 * unindexed compatible fires on correct code — including this plugin's own
 * binding-skeleton example.
 *
 * A near miss is a different claim and a safe one. Measured against the indexed
 * catalogue, an out-of-tree name such as `zephyr-ai,skeleton-provider` is nine
 * or more edits from anything; a genuine slip like `sitronix,st7789` for
 * `sitronix,st7789v` is one. Requiring the vendor prefix to match exactly
 * separates the two further, because a typo keeps the vendor and an unrelated
 * device does not.
 */
function nearestCompatible(value, candidates) {
  const comma = value.indexOf(',');
  const vendor = comma < 0 ? null : value.slice(0, comma);
  let best = null;
  let bestEdits = Infinity;
  for (const candidate of candidates) {
    if (Math.abs(candidate.length - value.length) > 2) continue;
    if (vendor !== null && !candidate.startsWith(`${vendor},`)) continue;
    if (vendor === null && candidate.includes(',')) continue;
    const edits = editDistance(value, candidate);
    if (edits < bestEdits) {
      bestEdits = edits;
      best = candidate;
    }
  }
  if (!best || bestEdits === 0 || bestEdits > 2) return null;
  return 1 - bestEdits / Math.max(value.length, best.length) >= 0.85 ? { name: best, edits: bestEdits } : null;
}

/**
 * Report `compatible` strings that look like a misspelling of an indexed one.
 *
 * Binding-catalogue completeness is deliberately not consulted, because it can
 * never hold where it would matter: the ingest marks binding coverage complete
 * only when there is no project root, no application root and no modules, and a
 * project-scoped index always records a project root. Gating on it disabled
 * this check for every index a user builds.
 *
 * Safety comes from `nearestCompatible`, which reports a near miss against an
 * indexed vendor and never reports absence. That claim holds whether or not the
 * catalogue is complete — the same reasoning the Kconfig path relies on when it
 * skips symbols it cannot see.
 */
function validateDevicetree(db, file) {
  const nodes = extractCompatibles(file.text);
  if (nodes.length === 0) return { code: 0, checked: 0 };

  const local = localCompatibles(file.root);
  const exact = db.prepare('SELECT 1 FROM dt_binding WHERE compatible = ?');
  let catalogue = null;

  const resolves = (value) => local.has(value) || exact.get(value) !== undefined;

  const problems = [];
  let checked = 0;
  for (const node of nodes) {
    // A node binds through the FIRST of its compatibles that has a binding, so a
    // fallback list is correct as long as one entry resolves. Upstream ships
    // `compatible = "microchip,mcp9808", "jedec,jc-42.4-temp"`, where only the
    // generic name is indexed and the specific one lands two edits from an
    // unrelated Microchip ADC. Judging each value on its own reported that node
    // — a false positive on Zephyr's own sample, and a validator that cries wolf
    // gets ignored along with everything else this plugin says.
    if (node.values.some(resolves)) {
      checked += node.values.length;
      continue;
    }
    for (const value of node.values) {
      checked++;
      catalogue ??= db.prepare('SELECT compatible FROM dt_binding').all().map((row) => row.compatible);
      const near = nearestCompatible(value, catalogue);
      if (!near) continue;
      problems.push(
        `  line ${node.line}: "${value}" is not a known compatible, but "${near.name}" is and differs by ` +
          `${near.edits} character${near.edits === 1 ? '' : 's'}. A node whose compatible resolves to no ` +
          'binding is ignored, and every property on it is silently dropped.',
      );
    }
  }

  return {
    code: problems.length
      ? emit(
        file.path,
        problems,
        'Confirm the name with search_bindings, then use get_binding to read the properties it accepts. ' +
            'Property names are not checked here — get_binding is the only reliable source for them, ' +
            'because bindings inherit most of their properties through include: chains.',
      )
      : 0,
    checked,
  };
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
