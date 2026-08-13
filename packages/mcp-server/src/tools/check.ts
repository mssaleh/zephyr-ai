import type { Index } from '../db.ts';
import { bindingVariants } from './devicetree.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
  editDistance,
  joinSections,
  optionalString,
  requireString,
  result,
} from './common.ts';

/** Upper bound on rendered per-line verdicts; the problem list is never capped. */
const MAX_LINES = 200;

type Kind = 'kconfig' | 'devicetree';

interface Verdict {
  line: number;
  subject: string;
  problem: string | null;
  note: string;
}

/**
 * Join `\`-continued lines, keeping the first physical line number.
 *
 * A reported line must point at the line the author sees, so the continuation
 * collapses into the line that started it rather than renumbering.
 */
function logicalLines(text: string): { line: number; text: string }[] {
  const physical = text.replace(/\r\n?/g, '\n').split('\n');
  const out: { line: number; text: string }[] = [];
  for (let i = 0; i < physical.length; i++) {
    const start = i + 1;
    let value = physical[i]!;
    while (/\\\s*$/.test(value) && i + 1 < physical.length) {
      value = value.replace(/\\\s*$/, '') + physical[++i]!.trimStart();
    }
    out.push({ line: start, text: value });
  }
  return out;
}

interface Assignment {
  name: string;
  value: string;
  line: number;
  raw: string;
}

function extractConfigs(text: string): { assignments: Assignment[]; malformed: Assignment[] } {
  const assignments: Assignment[] = [];
  const malformed: Assignment[] = [];
  for (const logical of logicalLines(text)) {
    const line = logical.text;
    if (/^\s*$/.test(line)) continue;
    const unset = line.match(/^\s*#\s*CONFIG_([A-Za-z0-9_]+)\s+is\s+not\s+set\s*$/);
    if (unset) {
      assignments.push({ name: unset[1]!, value: 'n', line: logical.line, raw: line.trim() });
      continue;
    }
    if (/^\s*#/.test(line)) {
      // Only the canonical unset form is legal in a comment; anything else that
      // looks like one is a setting the author believes is being applied.
      if (/^\s*#\s*CONFIG_.*\bis\s+not\b/.test(line)) {
        malformed.push({ name: '', value: '', line: logical.line, raw: line.trim() });
      }
      continue;
    }
    const assignment = line.match(/^\s*CONFIG_([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (assignment && assignment[2] !== '') {
      assignments.push({
        name: assignment[1]!,
        value: assignment[2]!,
        line: logical.line,
        raw: line.trim(),
      });
    } else if (/^\s*CONFIG_/.test(line)) {
      malformed.push({ name: '', value: '', line: logical.line, raw: line.trim() });
    }
  }
  return { assignments, malformed };
}

function valueProblem(type: string, value: string): string | null {
  // For bool and tristate, kconfiglib reads only the first character after `=`,
  // matching the C implementation it replaces, so `CONFIG_X=y # why` assigns y
  // and is legal — upstream ships exactly that. Numeric and string types are not
  // lenient in the same way: kconfiglib validates those in full.
  if (type === 'bool' || type === 'tristate') {
    const allowed = type === 'bool' ? /^[yn]/ : /^[ymn]/;
    return allowed.test(value)
      ? null
      : `is ${type} but is set to "${value}" (expected ${type === 'bool' ? 'y or n' : 'y, m, or n'})`;
  }
  if (type === 'int' && !/^-?[0-9]+$/.test(value)) return `is int but is set to "${value}"`;
  if (type === 'hex' && !/^(?:0x)?[0-9a-fA-F]+$/.test(value)) return `is hex but is set to "${value}"`;
  if (type === 'string' && !/^"(?:[^"\\]|\\.)*"$/.test(value)) return 'is string but is not a quoted string';
  return null;
}

/** Blank out comment bodies, preserving length and line breaks. */
function blankComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
}

/**
 * Every `compatible` declaration in a devicetree source, with its line.
 *
 * A scan rather than a parse, and confined to `compatible` for that reason: the
 * property is unambiguous wherever it appears, whereas deciding whether any
 * other property is valid needs to know which node owns it and therefore which
 * binding applies.
 */
function extractCompatibles(text: string): { values: string[]; line: number }[] {
  const source = blankComments(text.replace(/\r\n?/g, '\n'));
  const out: { values: string[]; line: number }[] = [];
  for (const match of source.matchAll(/(?:^|[\s;{}])compatible\s*=\s*([^;{}]*);/g)) {
    const values = [...match[1]!.matchAll(/"([^"]*)"/g)].map((v) => v[1]!).filter(Boolean);
    if (values.length === 0) continue;
    out.push({ values, line: source.slice(0, match.index).split('\n').length });
  }
  return out;
}

/**
 * The indexed compatible a value was most likely meant to be, if any.
 *
 * Absence is deliberately not treated as evidence of a mistake: an application
 * may declare bindings through `dts/bindings`, `DTS_ROOT`, or an out-of-tree
 * module, none of which the catalogue can see. A near miss is a different claim
 * and a safe one — an out-of-tree name is nine or more edits from anything
 * indexed, a genuine slip is one, and requiring the vendor prefix to match
 * exactly separates the two further.
 *
 * This mirrors `nearestCompatible` in plugin/scripts/validate-zephyr-edit.mjs.
 * The hook cannot import this bundle — it is a short-lived process with no build
 * step — so the two implementations are kept honest by a test that feeds the
 * same text to both and requires the same findings.
 */
function nearestCompatible(value: string, candidates: string[]): { name: string; edits: number } | null {
  const comma = value.indexOf(',');
  const vendor = comma < 0 ? null : value.slice(0, comma);
  let best: string | null = null;
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
  return 1 - bestEdits / Math.max(value.length, best.length) >= 0.85
    ? { name: best, edits: bestEdits }
    : null;
}

/**
 * Which catalogue a body should be checked against.
 *
 * The path decides when there is one, because an author naming the file is
 * stating their intent. Otherwise the content decides: a `compatible =` or a
 * node block is devicetree, a `CONFIG_` assignment is Kconfig.
 */
function inferKind(path: string | undefined, text: string): Kind {
  if (path) {
    if (/\.(dts|dtsi|overlay)$/.test(path)) return 'devicetree';
    if (/(\.conf|_defconfig)$/.test(path)) return 'kconfig';
  }
  if (/(^|[\s;{}])compatible\s*=/.test(text)) return 'devicetree';
  if (/^\s*(?:#\s*)?CONFIG_[A-Za-z0-9_]+\s*[=\s]/m.test(text)) return 'kconfig';
  throw new ToolError(
    'Could not tell whether this is a Kconfig fragment or devicetree source. ' +
      'Pass "kind" as "kconfig" or "devicetree", or pass "path" so the extension can decide.',
  );
}

function checkKconfig(idx: Index, text: string, isDefconfig: boolean): Verdict[] {
  const parsed = extractConfigs(text);
  const verdicts: Verdict[] = [];

  for (const entry of parsed.malformed) {
    verdicts.push({
      line: entry.line,
      subject: entry.raw,
      problem: `malformed Kconfig assignment: ${entry.raw}`,
      note: '',
    });
  }

  // Zephyr's build decides promptlessness across every definition of a symbol.
  // This catalogue holds only the definitions reachable in the context it was
  // built for, so the claim is made only where that view is knowably complete:
  // the declaration was indexed (it has a type), no definition sits under
  // `modules/` (whose real declaration ships with the module), and not every
  // definition is a `Kconfig.defconfig` (which sets a value, not a declaration).
  const symbol = idx.db.prepare(`
    SELECT k.name AS name, k.type AS type, k.prompt AS prompt, k.has_prompt AS has_prompt,
           (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id) AS defs,
           (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id
             AND d.file LIKE 'modules/%') AS module_defs,
           (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id
             AND d.file LIKE '%Kconfig.defconfig%') AS defconfig_defs
      FROM kconfig k WHERE k.name = ?`);
  const promptStatusIsKnown = (row: Record<string, unknown>): boolean =>
    row['type'] !== null &&
    Number(row['defs']) > 0 &&
    Number(row['module_defs']) === 0 &&
    Number(row['defconfig_defs']) < Number(row['defs']);
  for (const entry of parsed.assignments) {
    const row = symbol.get(entry.name) as Record<string, unknown> | undefined;
    if (!row) {
      // A miss is not evidence of absence: generated, application-local, and
      // out-of-tree module symbols are outside this catalogue by construction.
      const near = idx.all(
        "SELECT name FROM kconfig WHERE name LIKE ? ESCAPE '\\' ORDER BY LENGTH(name) LIMIT 4",
        `${entry.name.slice(0, Math.max(4, entry.name.length - 4)).replace(/[%_]/g, '\\$&')}%`,
      ).map((r) => `CONFIG_${String(r['name'])}`);
      verdicts.push({
        line: entry.line,
        subject: entry.raw,
        problem: null,
        note:
          'not in the indexed catalogue — generated, application-local, board-derived and ' +
          'external-module symbols live outside it, so this is not proof the symbol is wrong' +
          (near.length > 0 ? `. Similar indexed names: ${near.join(', ')}` : ''),
      });
      continue;
    }

    const type = String(row['type'] ?? '');
    const prompt = row['prompt'] ? String(row['prompt']) : '';
    if (!isDefconfig && Number(row['has_prompt']) === 0 && promptStatusIsKnown(row)) {
      const selectedBy = idx
        .all(
          'SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? ORDER BY from_sym LIMIT 4',
          entry.name,
          'select',
        )
        .map((r) => `CONFIG_${String(r['from_sym'])}`);
      verdicts.push({
        line: entry.line,
        subject: entry.raw,
        problem:
          `CONFIG_${entry.name} has no prompt and cannot be assigned from an application ` +
          'configuration. Enable the symbol that selects it instead' +
          (selectedBy.length > 0 ? `: ${selectedBy.join(', ')}` : '.'),
        note: '',
      });
      continue;
    }

    const mismatch = valueProblem(type, entry.value);
    verdicts.push({
      line: entry.line,
      subject: entry.raw,
      problem: mismatch ? `CONFIG_${entry.name} ${mismatch}.` : null,
      note: mismatch ? '' : `ok — \`${type || 'unknown'}\`${prompt ? ` "${prompt}"` : ''}`,
    });
  }

  return verdicts.sort((a, b) => a.line - b.line);
}

function checkDevicetree(idx: Index, text: string): Verdict[] {
  const nodes = extractCompatibles(text);
  const exact = idx.db.prepare('SELECT 1 FROM dt_binding WHERE compatible = ?');
  let catalogue: string[] | null = null;
  const verdicts: Verdict[] = [];

  for (const node of nodes) {
    // A node binds through the first of its compatibles that has a binding, so a
    // fallback list such as `"microchip,mcp9808", "jedec,jc-42.4-temp"` is
    // correct even though only the generic name is indexed. Judging each value
    // alone reported that node, which upstream ships.
    const bound = node.values.some((value) => exact.get(value) !== undefined);

    for (const value of node.values) {
      if (exact.get(value) !== undefined) {
        const variants = bindingVariants(idx, value);
        // Deciding which of a device's per-bus bindings applies needs to know
        // the parent node, which needs a real devicetree parse. Naming the
        // variants is the claim this can support on its own; picking one would
        // be a guess, and on SPI the guess costs `spi-max-frequency`.
        const detail = variants
          .map((variant) => {
            const required = Number(
              idx.get(
                'SELECT COUNT(*) AS c FROM dt_property_v WHERE binding_id = ? AND required = 1',
                Number(variant['id']),
              )?.['c'] ?? 0,
            );
            const bus = variant['on_bus'] ? String(variant['on_bus']) : null;
            return `${bus ? `on \`${bus}\`: ` : ''}${required} required propert${required === 1 ? 'y' : 'ies'}`;
          })
          .join('; ');
        verdicts.push({
          line: node.line,
          subject: value,
          problem: null,
          note:
            `indexed — ${detail}` +
            (variants.length > 1
              ? '. The bindings differ by bus; use get_binding with `on_bus` for the one this node sits on'
              : ''),
        });
        continue;
      }

      catalogue ??= idx.all('SELECT compatible FROM dt_binding').map((r) => String(r['compatible']));
      const near = bound ? null : nearestCompatible(value, catalogue);
      verdicts.push({
        line: node.line,
        subject: value,
        problem: near
          ? `"${value}" is not a known compatible, but "${near.name}" is and differs by ` +
            `${near.edits} character${near.edits === 1 ? '' : 's'}. A node whose compatible ` +
            'resolves to no binding is ignored, and every property on it is silently dropped.'
          : null,
        note: bound
          ? 'not indexed itself, but another compatible on this node is, so the node still binds'
          : 'not in the indexed catalogue, and not close to anything in it — an application may ' +
            'declare its own binding through `dts/bindings`, `DTS_ROOT`, or a module',
      });
    }
  }

  return verdicts.sort((a, b) => a.line - b.line);
}

export const checkConfig: ToolFactory = (index) => ({
  name: 'check_config',
  title: 'Check a configuration file against the index',
  description:
    'Check a whole prj.conf, board .conf, defconfig, .overlay, .dts or .dtsi against the indexed ' +
    'Zephyr version and get a verdict for every line, in one call. Use it before writing a ' +
    'configuration file and again after, instead of looking symbols up one at a time or grepping ' +
    'the tree — a shell loop proves only that a name appears somewhere, while this reports each ' +
    "symbol's type, prompt and assignability, each compatible's bus and required-property count, " +
    'and the mistakes that survive a build: a malformed assignment, a promptless symbol assigned ' +
    'from an application configuration, a value contradicting the declared type, and a compatible ' +
    'that misspells an indexed one. A symbol or compatible that is merely absent is reported as ' +
    'outside the catalogue, never as wrong.',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        minLength: 1,
        maxLength: 200000,
        description: 'The complete file contents to check.',
      },
      path: {
        type: 'string',
        description:
          'Optional file path, e.g. "prj.conf" or "boards/nucleo_h743zi.overlay". Decides which ' +
          'catalogue applies, and suppresses the promptless finding for a _defconfig, where ' +
          'assigning a promptless symbol is legitimate.',
      },
      kind: {
        type: 'string',
        enum: ['kconfig', 'devicetree'],
        description: 'Override the file kind when the path does not state it.',
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const text = requireString(args, 'text');
    const path = optionalString(args, 'path');
    const kind = (optionalString(args, 'kind') as Kind | undefined) ?? inferKind(path, text);
    const idx = index();
    const version = idx.meta['zephyr_version'] ?? 'unknown';

    const verdicts =
      kind === 'kconfig'
        ? checkKconfig(idx, text, Boolean(path?.endsWith('_defconfig')))
        : checkDevicetree(idx, text);
    const problems = verdicts.filter((v) => v.problem !== null);
    const subject = kind === 'kconfig' ? 'Kconfig assignment' : 'compatible declaration';

    const shown = verdicts.slice(0, MAX_LINES);
    const body = joinSections([
      `# ${path ? `\`${path}\`` : `${kind} fragment`}`,
      `Checked ${verdicts.length} ${subject}${verdicts.length === 1 ? '' : 's'} against the ` +
        `indexed Zephyr ${version} catalogue.`,
      problems.length > 0
        ? `## Problems (${problems.length})\n` +
          problems.map((p) => `- line ${p.line}: ${p.problem}`).join('\n')
        : '## Problems\n_None. Every line above is either confirmed against the catalogue or ' +
          'outside its scope; see the per-line verdicts._',
      shown.length > 0
        ? '## Per line\n' +
          shown
            .map(
              (v) =>
                `- line ${v.line} \`${v.subject}\` — ${v.problem ?? v.note}`,
            )
            .join('\n')
        : undefined,
      verdicts.length > shown.length
        ? `_${verdicts.length - shown.length} further line verdict(s) are not shown; every problem ` +
          'is listed above regardless._'
        : undefined,
      kind === 'devicetree'
        ? '_Property names are not checked. Bindings inherit most of their properties through ' +
          '`include:` chains, so get_binding is the only reliable source for them._'
        : undefined,
    ]);

    return result(body, {
      kind,
      path: path ?? null,
      zephyrVersion: version,
      checked: verdicts.length,
      problemCount: problems.length,
      verdicts,
    });
  },
});
