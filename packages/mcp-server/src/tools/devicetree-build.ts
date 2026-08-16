/**
 * Check a build's own merged devicetree for references that resolve to nothing.
 *
 * `check_config` deliberately scans a devicetree fragment for `compatible` and
 * nothing else, because deciding anything about a property in an overlay needs
 * to know which node owns it and therefore which binding applies. A *merged*
 * tree is a different input: `build/zephyr/zephyr.dts` is complete, every label
 * is declared in it, and every `status` is resolved. A real parse is honest
 * there, and it answers a question nothing else in this server can.
 *
 * The question is whether an enabled node points at a provider that is not
 * enabled. That failure has no build error, no line in `.config`, and no trace
 * in the linked image. The device's init returns an errno the application often
 * latches and carries on from, so the first symptom is a peripheral that never
 * comes up on hardware.
 *
 * The STM32 domain-clock case gets its own pass because the generic one cannot
 * see it. In `clocks = <&rcc 0x6 0x10c0058>` the phandle names `rcc`, which is
 * enabled; the disabled clock is reached through the numeric selector `0x6`,
 * which is `STM32_SRC_HSE`. The selector table is read out of the indexed tree
 * rather than restated here: the entries are chained increments, so a copied
 * table names the wrong clock the moment upstream inserts one.
 */

import type { Index } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
  blankComments,
  joinSections,
  optionalString,
  requireString,
  result,
} from './common.ts';
import { readZephyrFile } from './source.ts';

/** Upper bound on rendered per-finding lines; the problem list is never capped. */
const MAX_FINDINGS = 200;

/**
 * Properties whose value names a device that has to be enabled to be usable.
 *
 * Deliberately a list rather than "every phandle". `pinctrl-N` names pin
 * configuration nodes, which carry no status; `chosen` entries and
 * `zephyr,memory-region` are references of a different kind. Reporting those
 * would produce findings the tree cannot support, and a check that cries wolf
 * stops being read.
 */
const PROVIDER_PROPERTIES = new Set([
  'clocks',
  'dmas',
  'io-channels',
  'iommus',
  'mboxes',
  'nvmem-cells',
  'phys',
  'power-domains',
  'pwms',
  'resets',
]);

/** `reset-gpios`, `cs-gpios`, `vdd-supply` — the same relationship, named per use. */
const PROVIDER_SUFFIX = /(?:^|-)(?:gpios|supply)$/;

type Status = 'ok' | 'not-judged' | 'problem';

interface Finding {
  line: number;
  subject: string;
  status: Status;
  problem: string | null;
  note: string;
}

interface DtNode {
  path: string;
  labels: string[];
  props: Map<string, { value: string; line: number }>;
}

interface DtTree {
  nodes: Map<string, DtNode>;
  byLabel: Map<string, string>;
}

/**
 * Parse a merged devicetree into nodes, labels and properties.
 *
 * A merged tree is the board and SoC files, every overlay, and every `&label`
 * fragment concatenated in build order, so the same node is opened more than
 * once and a later assignment wins. Properties are therefore merged into one
 * record per node rather than collected per block — which is the whole point
 * here, because the failure this tool exists for is a board fragment that
 * overrode `status` and `pinctrl` on a node and left `clocks` at the SoC
 * default.
 */
export function parseDevicetree(source: string): DtTree {
  const text = blankComments(source.replace(/\r\n?/g, '\n'));
  const nodes = new Map<string, DtNode>();
  const byLabel = new Map<string, string>();
  const stack: string[] = [];
  const newlines: number[] = [];
  for (let at = 0; at < text.length; at++) {
    if (text[at] === '\n') newlines.push(at);
  }
  /** Binary search over newline offsets; a slice-and-split per property is quadratic. */
  const lineAt = (offset: number): number => {
    let low = 0;
    let high = newlines.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (newlines[mid]! < offset) low = mid + 1;
      else high = mid;
    }
    return low + 1;
  };

  const node = (path: string): DtNode => {
    const existing = nodes.get(path);
    if (existing) return existing;
    const created: DtNode = { path, labels: [], props: new Map() };
    nodes.set(path, created);
    return created;
  };

  let i = 0;
  while (i < text.length) {
    const char = text[i]!;
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (char === '}') {
      stack.pop();
      i++;
      if (text[i] === ';') i++;
      continue;
    }

    // Read one statement, respecting the three places a `;` or `{` can appear
    // without ending it: a string, a cell array, and a bytestring.
    const start = i;
    let angle = 0;
    let square = 0;
    let terminator = '';
    let end = -1;
    while (i < text.length) {
      const c = text[i]!;
      if (c === '"') {
        i++;
        while (i < text.length && text[i] !== '"') i += text[i] === '\\' ? 2 : 1;
        i++;
        continue;
      }
      if (c === '<') angle++;
      else if (c === '>') angle--;
      else if (c === '[') square++;
      else if (c === ']') square--;
      else if (angle === 0 && square === 0 && (c === '{' || c === ';' || c === '}')) {
        end = i;
        terminator = c;
        if (c !== '}') i++;
        break;
      }
      i++;
    }
    if (end < 0) break;
    const statement = text.slice(start, end).trim();
    if (statement === '') {
      if (terminator === '}') {
        stack.pop();
        i++;
        if (text[i] === ';') i++;
      }
      continue;
    }

    if (terminator === '{') {
      const labels: string[] = [];
      let head = statement;
      for (;;) {
        const label = head.match(/^([A-Za-z_][\w-]*)\s*:\s*/);
        if (!label) break;
        labels.push(label[1]!);
        head = head.slice(label[0].length);
      }
      head = head.trim();

      let path: string;
      if (head === '/') {
        path = '/';
      } else if (head.startsWith('&')) {
        const byPath = head.match(/^&\{([^}]+)\}$/);
        const target = byPath ? byPath[1]!.trim() : head.slice(1).trim();
        // A fragment can only address a label the base tree already declared, so
        // one forward pass resolves it. An unresolved one still gets a node, so
        // its properties are parsed rather than silently dropped.
        path = byPath ? target : (byLabel.get(target) ?? `&${target}`);
      } else {
        const parent = stack[stack.length - 1] ?? '/';
        path = parent === '/' ? `/${head}` : `${parent}/${head}`;
      }

      const entered = node(path);
      for (const label of labels) {
        if (!entered.labels.includes(label)) entered.labels.push(label);
        byLabel.set(label, path);
      }
      stack.push(path);
      continue;
    }

    if (terminator === ';') {
      // `/dts-v1/;`, `/plugin/;`, `/memreserve/ …;` carry nothing this check reads.
      if (statement.startsWith('/') && !statement.startsWith('/delete-')) continue;
      const current = stack[stack.length - 1];
      if (current === undefined) continue;
      const owner = node(current);

      const deleted = statement.match(/^\/delete-property\/\s+(.+)$/);
      if (deleted) {
        owner.props.delete(deleted[1]!.trim());
        continue;
      }
      if (statement.startsWith('/delete-node/')) continue;

      const equals = statement.indexOf('=');
      const name = (equals < 0 ? statement : statement.slice(0, equals)).trim();
      const value = equals < 0 ? '' : statement.slice(equals + 1).trim();
      if (/^[\w,.+?#-]+$/.test(name)) owner.props.set(name, { value, line: lineAt(start) });
      continue;
    }

    if (terminator === '}') {
      stack.pop();
      i++;
      if (text[i] === ';') i++;
    }
  }

  return { nodes, byLabel };
}

/** A node with no `status` is enabled; `ok` is the legacy spelling of `okay`. */
function statusOf(node: DtNode | undefined): string {
  if (!node) return 'absent';
  const raw = node.props.get('status');
  if (!raw) return 'okay';
  return raw.value.match(/"([^"]*)"/)?.[1] ?? 'okay';
}

function isEnabled(node: DtNode | undefined): boolean {
  const status = statusOf(node);
  return status === 'okay' || status === 'ok';
}

/** How the node is worth naming in a finding: its label if it has one, else its path. */
function nameOf(node: DtNode): string {
  return node.labels[0] ?? node.path;
}

/** Every `&label` and `&{/path}` reference in a property value. */
function referencesIn(value: string): string[] {
  const found: string[] = [];
  for (const match of value.matchAll(/&\{([^}]+)\}|&([A-Za-z_][\w-]*)/g)) {
    found.push((match[1] ?? match[2] ?? '').trim());
  }
  return found;
}

function isProviderProperty(name: string): boolean {
  return PROVIDER_PROPERTIES.has(name) || PROVIDER_SUFFIX.test(name);
}

/**
 * Finding A: an enabled node holding a reference to a disabled provider.
 *
 * Vendor-neutral, and true of the tree as the build produced it rather than of
 * any catalogue, so it is stated as a problem rather than as a suggestion.
 */
function disabledProviders(tree: DtTree): Finding[] {
  const findings: Finding[] = [];
  for (const node of tree.nodes.values()) {
    if (!isEnabled(node)) continue;
    for (const [property, entry] of node.props) {
      if (!isProviderProperty(property)) continue;
      for (const reference of new Set(referencesIn(entry.value))) {
        const path = tree.byLabel.get(reference) ?? (reference.startsWith('/') ? reference : null);
        const target = path === null ? undefined : tree.nodes.get(path);
        // A reference this tree does not declare is a fact about the text handed
        // over, not about the build. It is recorded and not judged, because a
        // partial tree is a caller mistake rather than a devicetree defect.
        if (!target) {
          findings.push({
            line: entry.line,
            subject: `${nameOf(node)}: ${property}`,
            status: 'not-judged',
            problem: null,
            note: `names \`${reference}\`, which this text does not declare. Pass the whole merged tree`,
          });
          continue;
        }
        if (isEnabled(target)) {
          findings.push({
            line: entry.line,
            subject: `${nameOf(node)}: ${property}`,
            status: 'ok',
            problem: null,
            note: `names \`${reference}\`, which is enabled`,
          });
          continue;
        }
        findings.push({
          line: entry.line,
          subject: `${nameOf(node)}: ${property}`,
          status: 'problem',
          problem:
            `\`${nameOf(node)}\` is enabled and its \`${property}\` names \`${reference}\`, which ` +
            `is \`status = "${statusOf(target)}"\`. The provider is not built, so this device ` +
            'fails at init with an errno rather than at build time.',
          note: '',
        });
      }
    }
  }
  return findings;
}

/** `#define NAME value` and `#define NAME (OTHER + 1)`, resolved to numbers. */
export function evaluateDefines(sources: string[]): Map<string, number> {
  const raw = new Map<string, string>();
  for (const source of sources) {
    for (const match of blankComments(source).matchAll(/^\s*#define\s+([A-Za-z_]\w*)\s+(.+)$/gm)) {
      raw.set(match[1]!, match[2]!.trim());
    }
  }

  const values = new Map<string, number>();
  const resolve = (name: string, depth: number): number | null => {
    const known = values.get(name);
    if (known !== undefined) return known;
    if (depth > 64) return null;
    const expression = raw.get(name);
    if (expression === undefined) return null;

    const literal = expression.match(/^\(?\s*(0[xX][0-9a-fA-F]+|\d+)\s*\)?$/);
    if (literal) {
      const value = Number(literal[1]);
      values.set(name, value);
      return value;
    }
    // The clock headers express every selector as one more than the previous, so
    // a single addition covers the whole family without an expression parser.
    const chained = expression.match(/^\(?\s*([A-Za-z_]\w*)\s*\+\s*(\d+)\s*\)?$/);
    if (chained) {
      const base = resolve(chained[1]!, depth + 1);
      if (base === null) return null;
      const value = base + Number(chained[2]);
      values.set(name, value);
      return value;
    }
    const alias = expression.match(/^\(?\s*([A-Za-z_]\w*)\s*\)?$/);
    if (alias) {
      const base = resolve(alias[1]!, depth + 1);
      if (base === null) return null;
      values.set(name, base);
      return base;
    }
    return null;
  };

  for (const name of raw.keys()) resolve(name, 0);
  return values;
}

/**
 * Which clock-selector header applies, found the way the build finds it.
 *
 * The `soc` node names the part and the series — `"st,stm32c071", "st,stm32c0"`
 * — and the part's own `.dtsi` includes the header. Following that chain avoids
 * a series-to-filename table here, which would be wrong for the parts that have
 * their own header: G0B1 and G0C1 share `stm32g0_b1x_c1x_clock.h`, and L4+,
 * F410, F427, F10x and F37x each have one.
 */
function clockHeaderFor(idx: Index, tree: DtTree): { path: string; text: string } | null {
  const soc = tree.nodes.get('/soc');
  const compatibles = [...(soc?.props.get('compatible')?.value.matchAll(/"([^"]*)"/g) ?? [])].map(
    (match) => match[1]!,
  );
  const parts = compatibles
    .map((value) => value.match(/^st,(stm32[a-z0-9]+)$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.length - left.length);
  if (parts.length === 0) return null;

  const series = parts[parts.length - 1]!;
  const directory = series.replace(/^stm32/, '');
  const seen = new Set<string>();
  const queue = parts.map((part) => `dts/arm/st/${directory}/${part}.dtsi`);

  for (let step = 0; step < 24 && queue.length > 0; step++) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);
    const text = readZephyrFile(idx, path);
    if (text === null) continue;

    const header = text.match(/#include\s+<(zephyr\/dt-bindings\/clock\/stm32[\w]*_clock\.h)>/);
    if (header) {
      const headerPath = `include/${header[1]!}`;
      const headerText = readZephyrFile(idx, headerPath);
      if (headerText !== null) return { path: headerPath, text: headerText };
    }
    // `#include <st/c0/stm32c051.dtsi>` resolves against `dts/arm`, which is how
    // the SoC files chain from a part up to its series.
    for (const include of text.matchAll(/#include\s+<(st\/[\w./-]+\.dtsi)>/g)) {
      queue.push(`dts/arm/${include[1]!}`);
    }
  }
  return null;
}

interface SelectorTable {
  headerPath: string;
  byValue: Map<number, string>;
  busMin: number;
  busMax: number;
}

function selectorTable(idx: Index, tree: DtTree): SelectorTable | null {
  const header = clockHeaderFor(idx, tree);
  if (!header) return null;
  const common = readZephyrFile(idx, 'include/zephyr/dt-bindings/clock/stm32_common_clocks.h');
  const defines = evaluateDefines(common === null ? [header.text] : [common, header.text]);

  const byValue = new Map<number, string>();
  for (const [name, value] of defines) {
    if (name.startsWith('STM32_SRC_') && !byValue.has(value)) byValue.set(value, name);
  }
  // The headers declare the peripheral-bus range themselves, so which cells gate
  // a bus and which select a source is the tree's own classification, not one
  // invented here.
  const busMin = defines.get('STM32_PERIPH_BUS_MIN');
  const busMax = defines.get('STM32_PERIPH_BUS_MAX');
  if (byValue.size === 0 || busMin === undefined || busMax === undefined) return null;
  return { headerPath: header.path, byValue, busMin, busMax };
}

/** The `< … >` groups of a cell-array property, each without its brackets. */
function cellsOf(value: string): string[] {
  return [...value.matchAll(/<([^>]*)>/g)].map((match) => match[1]!.trim());
}

/**
 * Node labels a clock selector could name, best first.
 *
 * A selector names a source and one of its outputs — `STM32_SRC_PLL2_Q` is
 * PLL2's Q output — and the node is the source, so trailing segments are
 * dropped one at a time until a label matches. That also resolves
 * `STM32_SRC_HSI_KER` to `clk_hsi`, which is the clock it is derived from, and
 * `STM32_SRC_PLLSAI2_POST_R` to `pllsai2`, which needs two.
 *
 * Derived rather than tabulated, because the families disagree: H7 labels PLL1
 * `pll` while U5 and WBA declare both `pll1` and `pll`, and G4 and L4 have no
 * number at all.
 */
export function clockNodeCandidates(selector: string): string[] {
  const parts = selector.replace(/^STM32_SRC_/, '').toLowerCase().split('_');
  const candidates: string[] = [];
  const push = (name: string): void => {
    if (name !== '' && !candidates.includes(name)) candidates.push(name);
  };
  for (let keep = parts.length; keep > 0; keep--) {
    const stem = parts.slice(0, keep).join('_');
    push(`clk_${stem}`);
    push(stem);
    if (stem === 'pll1') push('pll');
  }
  return candidates;
}

/**
 * Finding B: an STM32 domain clock whose selected source is disabled.
 *
 * `clock_control_configure()` answers `-ENOTSUP` when the selected source node
 * is not enabled, the driver turns that into an init failure, and nothing else
 * in the build says so.
 */
function stm32DomainClocks(tree: DtTree, table: SelectorTable): Finding[] {
  const findings: Finding[] = [];
  for (const node of tree.nodes.values()) {
    if (!isEnabled(node)) continue;
    const clocks = node.props.get('clocks');
    if (!clocks) continue;

    for (const cell of cellsOf(clocks.value)) {
      const tokens = cell.split(/\s+/).filter(Boolean);
      if (tokens.length < 2 || !tokens[0]!.startsWith('&')) continue;

      // A merged tree carries the preprocessed number; an overlay handed here
      // directly still carries the macro, and both name the same selector.
      const raw = tokens[1]!;
      const numeric = /^(0[xX][0-9a-fA-F]+|\d+)$/.test(raw) ? Number(raw) : null;
      const selector =
        numeric === null
          ? raw.startsWith('STM32_SRC_')
            ? raw
            : null
          : numeric >= table.busMin && numeric <= table.busMax
            ? null
            : (table.byValue.get(numeric) ?? null);
      if (numeric !== null && numeric >= table.busMin && numeric <= table.busMax) continue;

      if (selector === null) {
        if (numeric === null) continue;
        findings.push({
          line: clocks.line,
          subject: `${nameOf(node)}: clocks`,
          status: 'not-judged',
          problem: null,
          note:
            `domain-clock selector \`${raw}\` is outside the peripheral-bus range but matches no ` +
            `\`STM32_SRC_*\` value in \`${table.headerPath}\`. Read that header with get_source ` +
            'and check the source node it names',
        });
        continue;
      }

      const candidates = clockNodeCandidates(selector);
      const label = candidates.find((name) => tree.byLabel.has(name));
      const path = label === undefined ? undefined : tree.byLabel.get(label);
      const target = path === undefined ? undefined : tree.nodes.get(path);
      if (!target) {
        findings.push({
          line: clocks.line,
          subject: `${nameOf(node)}: clocks`,
          status: 'not-judged',
          problem: null,
          note:
            `selects \`${selector}\`, and no node in this tree is labelled ` +
            `${candidates.slice(0, 4).map((name) => `\`${name}\``).join(' or ')}. Whether that ` +
            'source is enabled was not established',
        });
        continue;
      }
      if (isEnabled(target)) {
        findings.push({
          line: clocks.line,
          subject: `${nameOf(node)}: clocks`,
          status: 'ok',
          problem: null,
          note: `selects \`${selector}\`, and \`${nameOf(target)}\` is enabled`,
        });
        continue;
      }
      findings.push({
        line: clocks.line,
        subject: `${nameOf(node)}: clocks`,
        status: 'problem',
        problem:
          `\`${nameOf(node)}\` is enabled and its domain clock selects \`${selector}\`, whose node ` +
          `\`${nameOf(target)}\` is \`status = "${statusOf(target)}"\`. ` +
          '`clock_control_configure()` returns `-ENOTSUP`, the driver fails init, and the build ' +
          'reports nothing. If this node was enabled by an overlay that set `status` and ' +
          '`pinctrl` only, the `clocks` property is still the SoC default.',
        note: '',
      });
    }
  }
  return findings;
}

export const checkDevicetree: ToolFactory = (index) => ({
  name: 'check_devicetree',
  title: 'Check a build\'s merged devicetree',
  description:
    'Check a build\'s merged devicetree — `build/zephyr/zephyr.dts` — for enabled nodes that ' +
    'reference something the build did not enable. Call it after a build succeeds and before ' +
    'flashing. It catches a class of defect that has no build error, no line in `.config` and no ' +
    'trace in the linked image: the device fails at init with an errno, so the first symptom is a ' +
    'peripheral that never comes up on hardware. Two checks. Any enabled node whose `clocks`, ' +
    '`dmas`, `resets`, `power-domains`, `*-gpios` or `*-supply` names a node that is disabled. And ' +
    'on STM32, a peripheral whose domain (kernel) clock selects a source whose clock node is ' +
    'disabled — the common case being a board with no crystal that enabled a peripheral without ' +
    'overriding the SoC default of HSE. Pass the merged tree, not an overlay: an overlay does not ' +
    'show what the build used, and a property you did not write is still yours.',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        minLength: 1,
        maxLength: 4000000,
        description: 'The complete contents of the merged devicetree, normally build/zephyr/zephyr.dts.',
      },
      path: {
        type: 'string',
        description: 'Optional path the text came from, echoed back in the report.',
      },
    },
    required: ['text'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const text = requireString(args, 'text');
    const path = optionalString(args, 'path');
    const idx = index();
    const tree = parseDevicetree(text);

    if (tree.nodes.size === 0) {
      throw new ToolError(
        'No devicetree nodes were found in this text. Pass the contents of the merged tree, ' +
          'normally `build/zephyr/zephyr.dts`.',
      );
    }

    const table = selectorTable(idx, tree);
    const isStm32 = [
      ...(tree.nodes.get('/soc')?.props.get('compatible')?.value.matchAll(/"([^"]*)"/g) ?? []),
    ].some((match) => match[1]!.startsWith('st,stm32'));

    const findings = [...disabledProviders(tree), ...(table ? stm32DomainClocks(tree, table) : [])]
      .sort((left, right) => left.line - right.line || left.subject.localeCompare(right.subject));

    const problems = findings.filter((finding) => finding.problem !== null);
    const notJudged = findings.filter((finding) => finding.status === 'not-judged');
    const confirmed = findings.filter((finding) => finding.status === 'ok');
    const enabled = [...tree.nodes.values()].filter((node) => isEnabled(node)).length;

    const domainClockScope = table
      ? `Domain clocks were resolved against \`${table.headerPath}\` from the indexed tree.`
      : isStm32
        ? 'This is an STM32 tree, but the selector header could not be read, so **domain clock ' +
          'sources were not checked**. That needs the indexed Zephyr tree on this machine.'
        : undefined;

    const body = joinSections([
      `# ${path ? `\`${path}\`` : 'Merged devicetree'}`,
      `Parsed ${tree.nodes.size} node${tree.nodes.size === 1 ? '' : 's'}, ${enabled} enabled, and ` +
        'checked every reference from an enabled node to a provider: ' +
        `${problems.length} problem${problems.length === 1 ? '' : 's'}, ` +
        `${notJudged.length} not judged, ${confirmed.length} reaching an enabled node. ` +
        'A reference that resolves cleanly gets no line below; it is in `structuredContent`.',
      domainClockScope,
      problems.length > 0
        ? `## Problems (${problems.length})\n` +
          problems
            .slice(0, MAX_FINDINGS)
            .map((finding) => `- line ${finding.line}: ${finding.problem}`)
            .join('\n')
        : '## Problems\n_None. Every reference from an enabled node reaches a node that is also ' +
          'enabled._',
      notJudged.length > 0
        ? `## Not judged (${notJudged.length})\nChecked against nothing. Neither an error nor a ` +
          `confirmation.\n${notJudged
            .slice(0, MAX_FINDINGS)
            .map((finding) => `- line ${finding.line} \`${finding.subject}\` — ${finding.note}`)
            .join('\n')}`
        : undefined,
      problems.length > MAX_FINDINGS || notJudged.length > MAX_FINDINGS
        ? `_Rendering is capped at ${MAX_FINDINGS} per section; every finding reaches ` +
          '`structuredContent`._'
        : undefined,
      '_This reads the tree the build produced. It does not check property names against bindings ' +
        '— use get_binding for those — and it says nothing about a reference this tree does not ' +
        'contain._',
    ]);

    return result(body, {
      path: path ?? null,
      nodes: tree.nodes.size,
      enabledNodes: enabled,
      domainClockHeader: table?.headerPath ?? null,
      problemCount: problems.length,
      notJudgedCount: notJudged.length,
      confirmedCount: confirmed.length,
      findings,
    });
  },
});
