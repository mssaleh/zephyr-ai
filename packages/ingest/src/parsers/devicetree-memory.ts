/**
 * The memory a board's `chosen` node actually points at.
 *
 * `twister.yaml` sizes a test runner's expectations. Rendered bare its figures
 * read as the application's memory budget and are not one: upstream's
 * NUCLEO-N657X0-Q declares 1024 KB of each while the application gets 511 KB of
 * SRAM and no internal flash at all. What settles it is `chosen`, the node the
 * phandle names, and that node's `reg`.
 *
 * Getting there needs three things a single-file scan does not have:
 *
 * 1. **The include chain.** The board names `&axisram2`; the label is declared
 *    in the SoC `.dtsi` two includes away.
 * 2. **Path merging.** The labelled node often carries no `reg` where the label
 *    is declared. On the N6 the size arrives in a later file that reopens the
 *    same node *by path*, `/axisram12@24000000/memory@180400`, and never
 *    mentions the label.
 * 3. **`ranges` translation.** That node's address is `0x180400`, an offset in
 *    its parent's child space; the parent's `ranges` maps it to `0x34180400`.
 *    Reporting the untranslated number would be worse than reporting nothing.
 *
 * This is a scan, not a devicetree compiler. Where any link is ambiguous it
 * returns a reason instead of a number, and the caller stores nothing. A silent
 * board is correct; a wrong address is not.
 */

export interface DevicetreeNode {
  /** Absolute path, or `&label` for a block that reopens a node by label. */
  path: string;
  /** Label declared on this node, empty when it has none. */
  label: string;
  reg: string | null;
  ranges: string | null;
}

export interface MemoryRegion {
  address: number;
  size: number;
  /** Devicetree path of the node the figures came from. */
  path: string;
}

export type MemoryRejection =
  | 'label-not-found'
  | 'label-ambiguous'
  | 'no-reg'
  | 'unreadable-reg'
  | 'unreadable-ranges';

/** Blank comment bodies, preserving line structure. */
export function blankComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
}

/**
 * Arithmetic over the subset devicetree sources use: integer literals, the
 * `DT_SIZE_*` macros, `+`, `-`, `*` and parentheses.
 *
 * Hand-written rather than evaluated, so an expression carrying anything else —
 * a macro this does not know, a symbol from a header — yields null instead of a
 * plausible number.
 */
export function evaluateExpression(text: string): number | null {
  // The replacements turn `DT_SIZE_K(511)` into `1024*(511)`, which is the same
  // value and needs no special case in the grammar below.
  const expanded = text
    .replace(/DT_SIZE_K/g, '1024*')
    .replace(/DT_SIZE_M/g, '1048576*')
    .replace(/DT_SIZE_G/g, '1073741824*');
  // Rejected as a whole before tokenising. Tokenising first would silently drop
  // an unknown macro and return the arithmetic of what was left, which is a
  // wrong number rather than no number.
  if (!/^[\s0-9a-fA-FxX()+*-]*$/.test(expanded)) return null;
  if (/[a-fA-FxX]/.test(expanded.replace(/0[xX][0-9a-fA-F]+/g, ''))) return null;
  const tokens = expanded.match(/0[xX][0-9a-fA-F]+|[0-9]+|[()+*-]/g);
  if (!tokens) return null;

  let position = 0;
  const peek = (): string | undefined => tokens[position];
  const take = (): string | undefined => tokens[position++];

  const primary = (): number | null => {
    const token = take();
    if (token === undefined) return null;
    if (token === '(') {
      const value = expression();
      return take() === ')' ? value : null;
    }
    if (token === '-') {
      const value = primary();
      return value === null ? null : -value;
    }
    if (/^0[xX]/.test(token)) return Number.parseInt(token.slice(2), 16);
    if (/^[0-9]+$/.test(token)) return Number.parseInt(token, 10);
    return null;
  };
  const product = (): number | null => {
    let left = primary();
    while (left !== null && peek() === '*') {
      take();
      const right = primary();
      left = right === null ? null : left * right;
    }
    return left;
  };
  const expression = (): number | null => {
    let left = product();
    while (left !== null && (peek() === '+' || peek() === '-')) {
      const operator = take();
      const right = product();
      if (right === null) return null;
      left = operator === '+' ? left + right : left - right;
    }
    return left;
  };

  const value = expression();
  return position === tokens.length && value !== null && Number.isFinite(value) ? value : null;
}

/**
 * Split a `<...>` cell list on whitespace that is not inside parentheses, so
 * `<0x0 (DT_SIZE_K(400) + DT_SIZE_K(624))>` stays two cells.
 */
export function cells(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const character of text) {
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (/\s/.test(character) && depth === 0) {
      if (current) out.push(current);
      current = '';
    } else current += character;
  }
  if (current) out.push(current);
  return out;
}

/**
 * Every node a source declares, with its absolute path.
 *
 * Node headers are unambiguous in devicetree — `label: name@unit {`, `name {`,
 * `&label {` — and nothing else opens a brace except a property value, which
 * cannot contain one.
 */
export function scanNodes(text: string): DevicetreeNode[] {
  const found: DevicetreeNode[] = [];
  const stack: DevicetreeNode[] = [];
  const token =
    /(?:^|[\s;}])(?:([A-Za-z_][\w-]*)\s*:\s*)?(&?[A-Za-z_/][\w,.+@-]*)?\s*\{|\}|(?:^|[\s;{}])(reg|ranges)\s*=\s*<([^;]*)>\s*;/g;

  for (const match of text.matchAll(token)) {
    if (match[3]) {
      const node = stack[stack.length - 1];
      if (node) {
        if (match[3] === 'reg') node.reg = match[4]!;
        else node.ranges = match[4]!;
      }
      continue;
    }
    if (match[0].endsWith('{')) {
      const name = match[2] ?? '';
      const parent = stack[stack.length - 1];
      const path =
        name === '/'
          ? '/'
          : name.startsWith('&') || !parent
            ? name
            : parent.path === '/'
              ? `/${name}`
              : `${parent.path}/${name}`;
      const node: DevicetreeNode = { path, label: match[1] ?? '', reg: null, ranges: null };
      stack.push(node);
      found.push(node);
    } else stack.pop();
  }
  return found;
}

export interface ScannedFile {
  path: string;
  nodes: DevicetreeNode[];
}

/**
 * The region a label names, across every file in an include chain.
 *
 * `files` is the chain in include order, the board's own source first, each one
 * already scanned. The last declaration of a `reg` wins, matching how the build
 * merges the same node declared in several files.
 */
export function resolveRegion(
  files: ScannedFile[],
  label: string,
): (MemoryRegion & { source: string }) | MemoryRejection {
  const all = files.flatMap((file) => file.nodes.map((node) => ({ ...node, file: file.path })));
  const paths = new Set(all.filter((node) => node.label === label).map((node) => node.path));
  if (paths.size > 1) return 'label-ambiguous';
  const path = [...paths][0];
  // A node may also be reopened as `&label { ... }`, which carries no path.
  const declarations = all.filter(
    (node) => (path !== undefined && node.path === path) || node.path === `&${label}`,
  );
  if (declarations.length === 0) return 'label-not-found';

  const carrying = declarations.filter((node) => node.reg !== null).pop();
  if (!carrying) return 'no-reg';
  const parts = cells(carrying.reg!);
  if (parts.length < 2) return 'unreadable-reg';
  const size = evaluateExpression(parts.slice(1).join('+'));
  let address = evaluateExpression(parts[0]!);
  if (address === null || size === null) return 'unreadable-reg';

  // Translate through every ancestor that declares `ranges`, innermost first.
  let current = path ?? carrying.path;
  while (current.startsWith('/') && current !== '/') {
    const parentPath = current.slice(0, current.lastIndexOf('/')) || '/';
    const parent = all.filter((node) => node.path === parentPath && node.ranges !== null).pop();
    if (parent) {
      const mapping = cells(parent.ranges!);
      if (mapping.length >= 3) {
        const child = evaluateExpression(mapping[0]!);
        const host = evaluateExpression(mapping[1]!);
        if (child === null || host === null) return 'unreadable-ranges';
        address = address - child + host;
      }
    }
    if (parentPath === '/') break;
    current = parentPath;
  }

  return { address, size, path: path ?? carrying.path, source: carrying.file };
}

/** The `chosen` phandles this corpus records, and the role each one names. */
export const CHOSEN_ROLES: Record<string, 'sram' | 'code-partition' | 'flash'> = {
  'zephyr,sram': 'sram',
  'zephyr,code-partition': 'code-partition',
  'zephyr,flash': 'flash',
};

/** The labels a source's `chosen` node assigns, by role. */
export function chosenLabels(text: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of text.matchAll(/([\w,-]+)\s*=\s*&([\w-]+)\s*;/g)) {
    const role = CHOSEN_ROLES[match[1]!];
    if (role && !found.has(role)) found.set(role, match[2]!);
  }
  return found;
}
