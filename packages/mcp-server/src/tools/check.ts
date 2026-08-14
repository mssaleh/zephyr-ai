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
type Prefix = 'CONFIG_' | 'SB_CONFIG_';

/**
 * What the check actually established about a line.
 *
 * Three populations, not two. `ok` used to cover both "verified against the
 * catalogue" and "the catalogue cannot judge this, so nothing was checked", and
 * the two are different claims: `CONFIG_LV_USE_MONKEY=y` came back `ok, bool`,
 * the identical verdict `CONFIG_GPIO=y` receives, when the module Kconfig that
 * declares it was never read. Suppressing the complaint is right; reporting the
 * result as verified is not.
 */
type Status = 'ok' | 'not-judged' | 'problem';

interface Verdict {
  line: number;
  subject: string;
  status: Status;
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

/**
 * Read the assignments in a configuration fragment.
 *
 * `prefix` is the namespace the file is written in: `CONFIG_` for prj.conf and
 * defconfigs, `SB_CONFIG_` for sysbuild.conf. Lines carrying the *other* prefix
 * are collected separately, because the build does not reject them — it ignores
 * them silently, which is why they cost so much to find by hand.
 */
function extractConfigs(
  text: string,
  prefix: Prefix = 'CONFIG_',
): { assignments: Assignment[]; malformed: Assignment[]; foreign: Assignment[] } {
  const assignments: Assignment[] = [];
  const malformed: Assignment[] = [];
  const foreign: Assignment[] = [];
  // SB_CONFIG_ ends with CONFIG_, so the longer alternative is tested first and
  // the captured prefix, not a substring test, decides which namespace a line is in.
  const shape = /^\s*(#\s*)?(SB_CONFIG_|CONFIG_)([A-Za-z0-9_]+)\s*(.*)$/;

  for (const logical of logicalLines(text)) {
    const line = logical.text;
    if (/^\s*$/.test(line)) continue;
    const match = line.match(shape);

    if (match && match[2] !== prefix) {
      foreign.push({ name: match[3]!, value: '', line: logical.line, raw: line.trim() });
      continue;
    }

    if (match?.[1]) {
      // Commented: only the canonical unset form is a real setting. Anything else
      // that looks like one is a line the author believes is being applied.
      if (/^is\s+not\s+set$/.test((match[4] ?? '').trim())) {
        assignments.push({ name: match[3]!, value: 'n', line: logical.line, raw: line.trim() });
      } else if (/\bis\s+not\b/.test(line)) {
        malformed.push({ name: '', value: '', line: logical.line, raw: line.trim() });
      }
      continue;
    }
    if (/^\s*#/.test(line)) continue;

    if (match) {
      const rest = (match[4] ?? '').trim();
      const value = rest.startsWith('=') ? rest.slice(1).trim() : '';
      if (rest.startsWith('=') && value !== '') {
        assignments.push({ name: match[3]!, value, line: logical.line, raw: line.trim() });
      } else {
        malformed.push({ name: '', value: '', line: logical.line, raw: line.trim() });
      }
    }
  }
  return { assignments, malformed, foreign };
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
 * Which Kconfig namespace a configuration file is written in.
 *
 * sysbuild.conf is the only file the build treats as sysbuild configuration, so
 * the name decides. Content cannot: an SB_CONFIG_ line in a prj.conf is a
 * mistake to report, not a signal to switch namespace.
 */
function inferPrefix(path: string | undefined): Prefix {
  return path && /(^|\/)sysbuild\.conf$/.test(path) ? 'SB_CONFIG_' : 'CONFIG_';
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
  if (/^\s*(?:#\s*)?(?:SB_)?CONFIG_[A-Za-z0-9_]+\s*[=\s]/m.test(text)) return 'kconfig';
  throw new ToolError(
    'Could not tell whether this is a Kconfig fragment or devicetree source. ' +
      'Pass "kind" as "kconfig" or "devicetree", or pass "path" so the extension can decide.',
  );
}

function checkKconfig(
  idx: Index,
  text: string,
  isDefconfig: boolean,
  prefix: Prefix = 'CONFIG_',
): Verdict[] {
  const scope = prefix === 'SB_CONFIG_' ? 'sysbuild' : 'zephyr';
  const parsed = extractConfigs(text, prefix);
  const verdicts: Verdict[] = [];

  // The build ignores a line from the other namespace rather than rejecting it,
  // so nothing surfaces until the option silently fails to take effect.
  for (const entry of parsed.foreign) {
    const wrong = prefix === 'SB_CONFIG_' ? 'CONFIG_' : 'SB_CONFIG_';
    // Only name the counterpart when it exists. Offering one that does not is the
    // same confident-but-wrong answer the line itself is being reported for.
    const counterpart =
      entry.name &&
      idx.get('SELECT 1 FROM kconfig WHERE name = ? AND scope = ?', entry.name, scope)
        ? `; \`${prefix}${entry.name}\` exists and may be what was meant`
        : '';
    verdicts.push({
      line: entry.line,
      subject: entry.raw,
      status: 'problem',
      problem:
        `is a ${wrong} line in a ${prefix === 'SB_CONFIG_' ? 'sysbuild.conf' : 'prj.conf'}-style ` +
        `file, where only ${prefix} settings apply. The build ignores it silently${counterpart}`,
      note: '',
    });
  }

  for (const entry of parsed.malformed) {
    verdicts.push({
      line: entry.line,
      subject: entry.raw,
      status: 'problem',
      problem: `malformed Kconfig assignment: ${entry.raw}`,
      note: '',
    });
  }

  // Zephyr's build decides promptlessness across every definition of a symbol.
  // This catalogue holds only the definitions reachable in the context it was
  // built for, so the claim is made only where that view is knowably complete:
  // the declaration was indexed (it has a type), not every definition is a
  // `Kconfig.defconfig` (which sets a value, not a declaration), and no
  // definition sits in the in-tree glue directory of a module whose own Kconfig
  // this index did not read.
  //
  // That last test is about the manifest, not about the `modules/` prefix.
  // Upstream keeps its own files under `modules/` as well, and the two kinds
  // behave oppositely: `modules/lvgl/Kconfig` mirrors symbols the lvgl module
  // declares with prompts, so a promptless reading there is an artefact — while
  // `modules/Kconfig.stm32` declares the USE_STM32_HAL_* family outright, no
  // module redeclares them, and assigning one fails the build. Judging both by
  // their path prefix reported the artefact and cleared the real error.
  const glue = new Set(
    idx
      .all("SELECT glue_dir FROM west_module WHERE glue_dir <> '' AND kconfig_ingested = 0")
      .map((row) => String(row['glue_dir'])),
  );
  const symbol = idx.db.prepare(`
    SELECT k.name AS name, k.type AS type, k.prompt AS prompt, k.has_prompt AS has_prompt,
           (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id) AS defs,
           (SELECT group_concat(DISTINCT d.file) FROM kconfig_definition d
             WHERE d.symbol_id = k.id) AS files,
           (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id
             AND d.file LIKE '%Kconfig.defconfig%') AS defconfig_defs
      FROM kconfig k WHERE k.name = ? AND k.scope = ?`);
  const mirrorsAnUnreadModule = (files: unknown): boolean =>
    String(files ?? '')
      .split(',')
      .some((file) => {
        const match = /^modules\/([^/]+)\//.exec(file);
        return match ? glue.has(match[1]!) : false;
      });
  /** Which of the three tests below failed, in the words of the thing that failed. */
  const unjudgedReason = (row: Record<string, unknown>, glueDirs: Set<string>): string => {
    if (row['type'] === null || Number(row['defs']) === 0) {
      return 'no declaration for this symbol was indexed, so it has no type or prompt here';
    }
    const mirrored = String(row['files'] ?? '')
      .split(',')
      .map((file) => /^modules\/([^/]+)\//.exec(file)?.[1] ?? '')
      .find((directory) => directory && glueDirs.has(directory));
    if (mirrored) {
      return `the only declarations are in \`modules/${mirrored}\`, whose module Kconfig this ` +
        'index did not read, so a prompt the module itself declares is not visible here';
    }
    return 'every indexed declaration is a `Kconfig.defconfig`, which sets a value rather than ' +
      'declaring the symbol, so its prompt is declared somewhere this index did not read';
  };
  const promptStatusIsKnown = (row: Record<string, unknown>): boolean =>
    row['type'] !== null &&
    Number(row['defs']) > 0 &&
    !mirrorsAnUnreadModule(row['files']) &&
    Number(row['defconfig_defs']) < Number(row['defs']);
  for (const entry of parsed.assignments) {
    const row = symbol.get(entry.name, scope) as Record<string, unknown> | undefined;
    if (!row) {
      // A miss is not evidence of absence: generated, application-local, and
      // out-of-tree module symbols are outside this catalogue by construction.
      const near = idx.all(
        "SELECT name FROM kconfig WHERE name LIKE ? ESCAPE '\\' AND scope = ? ORDER BY LENGTH(name) LIMIT 4",
        `${entry.name.slice(0, Math.max(4, entry.name.length - 4)).replace(/[%_]/g, '\\$&')}%`,
        scope,
      ).map((r) => `${prefix}${String(r['name'])}`);
      verdicts.push({
        line: entry.line,
        subject: entry.raw,
        status: 'not-judged',
        problem: null,
        note:
          'not in the indexed catalogue. Generated, application-local, board-derived and ' +
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
          'SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? AND scope = ? ORDER BY from_sym LIMIT 4',
          entry.name,
          'select',
          scope,
        )
        .map((r) => `${prefix}${String(r['from_sym'])}`);
      verdicts.push({
        line: entry.line,
        subject: entry.raw,
        status: 'problem',
        problem:
          `CONFIG_${entry.name} has no prompt and cannot be assigned from an application ` +
          'configuration. Enable the symbol that selects it instead' +
          (selectedBy.length > 0 ? `: ${selectedBy.join(', ')}` : '.'),
        note: '',
      });
      continue;
    }

    const mismatch = valueProblem(type, entry.value);
    if (mismatch) {
      verdicts.push({
        line: entry.line,
        subject: entry.raw,
        status: 'problem',
        problem: `CONFIG_${entry.name} ${mismatch}.`,
        note: '',
      });
      continue;
    }

    // A symbol whose prompt status this catalogue cannot settle was verified
    // against nothing. Reporting it as `ok` states a check that did not happen,
    // which is the same failure mode as reporting a symbol absent.
    const unjudged = Number(row['has_prompt']) === 0 && !promptStatusIsKnown(row);
    verdicts.push({
      line: entry.line,
      subject: entry.raw,
      status: unjudged ? 'not-judged' : 'ok',
      problem: null,
      note: unjudged
        ? `not judged — ${unjudgedReason(row, glue)}. The type is \`${type || 'unknown'}\`, but ` +
          'whether this line can be assigned here was not established'
        : `ok, \`${type || 'unknown'}\`${prompt ? ` "${prompt}"` : ''}`,
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
          status: 'ok',
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
        // A compatible the catalogue does not hold was judged only when a near
        // miss was found. Otherwise nothing was established: an application may
        // declare its own binding through dts/bindings, DTS_ROOT or a module.
        status: near ? 'problem' : bound ? 'ok' : 'not-judged',
        problem: near
          ? `"${value}" is not a known compatible. "${near.name}" is, and differs by ` +
            `${near.edits} character${near.edits === 1 ? '' : 's'}. A node whose compatible ` +
            'resolves to no binding is dropped, along with every property on it, without a warning.'
          : null,
        note: bound
          ? 'not indexed itself, but another compatible on this node is, so the node still binds'
          : 'not in the indexed catalogue and not close to anything in it. An application may ' +
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
    'Check a whole prj.conf, board .conf, defconfig, sysbuild.conf, .overlay, .dts or .dtsi ' +
    'against the indexed Zephyr version and get a verdict for every line, in one call. Use it ' +
    'before writing a configuration file and again after. Every line comes back in one of three ' +
    'populations: confirmed against the catalogue, carrying a problem, or not judged — the last ' +
    'meaning the catalogue could not settle it and checked nothing, with the reason given. It ' +
    'reports each symbol\'s type, prompt and whether it can be assigned; each compatible\'s bus ' +
    'and required-property count; and four errors: a malformed assignment, a promptless symbol ' +
    'assigned from an application configuration, a value that contradicts the declared type, and a ' +
    'compatible that misspells an indexed one. A grep only tells you whether a name appears ' +
    'somewhere. A symbol or compatible that is absent from the index is reported as outside the ' +
    'catalogue, not as wrong.',
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
      namespace: {
        type: 'string',
        enum: ['CONFIG_', 'SB_CONFIG_'],
        description:
          'Which Kconfig namespace the file is written in. Inferred from the path, where only ' +
          'sysbuild.conf is SB_CONFIG_. Pass this only for an unnamed sysbuild fragment.',
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

    const prefix = (optionalString(args, 'namespace') as Prefix | undefined) ?? inferPrefix(path);
    const verdicts =
      kind === 'kconfig'
        ? checkKconfig(idx, text, Boolean(path?.endsWith('_defconfig')), prefix)
        : checkDevicetree(idx, text);
    const problems = verdicts.filter((v) => v.problem !== null);
    const confirmed = verdicts.filter((v) => v.status === 'ok').length;
    const notJudged = verdicts.filter((v) => v.status === 'not-judged').length;
    const subject = kind === 'kconfig' ? 'Kconfig assignment' : 'compatible declaration';

    const shown = verdicts.slice(0, MAX_LINES);
    const body = joinSections([
      `# ${path ? `\`${path}\`` : `${kind} fragment`}`,
      `Checked ${verdicts.length} ${subject}${verdicts.length === 1 ? '' : 's'} against the ` +
        `indexed Zephyr ${version} catalogue: ${confirmed} confirmed, ${notJudged} not judged, ` +
        `${problems.length} with a problem.` +
        (notJudged > 0
          ? ' A line that was not judged was checked against nothing; the reason is on the line ' +
            'itself. It is neither an error nor a confirmation.'
          : ''),
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
      confirmedCount: confirmed,
      notJudgedCount: notJudged,
      problemCount: problems.length,
      verdicts,
    });
  },
});
