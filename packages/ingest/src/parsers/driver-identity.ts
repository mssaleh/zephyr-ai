/**
 * What a driver will accept, as against where it is used.
 *
 * Many drivers refuse to initialise unless an identity register reads one of a
 * fixed set of values. That set is the answer to the question a developer at a
 * bench actually has — "is the part in front of me supported?" — and it exists
 * nowhere in devicetree. `invensense,mpu6050` accepts `0x19`, which is an
 * MPU6880, a part whose name appears in no binding, no board file and no
 * documentation page. Establishing that by hand means grepping driver headers.
 *
 * The extraction is deliberately narrow. Nothing here guesses: a driver whose
 * shape is not recognised produces no record, and a missing record must never be
 * rendered as "this driver accepts nothing".
 *
 * Recognised shape, in the order it is established:
 *
 * 1. a comparison of some lvalue against a `#define`d constant whose name looks
 *    like an identity and whose value is an integer;
 * 2. exactly one such lvalue in the file, compared consistently. A driver that
 *    checks `id[0]`, `id[1]` and `id[2]` against three constants is asserting a
 *    three-byte signature, and reading those as three alternatives would be
 *    wrong in the most damaging direction — it would say a part is accepted when
 *    it is refused;
 * 3. the register, taken from the call that wrote that lvalue rather than from
 *    the constant's name, because vendors name it `REG_WAI`, `REG_CHIP_ID`,
 *    `DEVICE_ID_REG` and `REG_ID` with no agreement.
 */

/**
 * Identity-shaped constant names, matched against the macro name.
 *
 * Exported because the collector pre-filters driver sources with it. Two
 * patterns meaning the same thing drift, and the one that narrows silently
 * decides what the corpus contains.
 */
export const IDENTITY_NAME =
  /(?:CHIP_?ID|DEVICE_?ID|DEV_?ID|WHO_?AM_?I|WHOAMI|PART_?ID|MANUF|_ID_VAL|_ID$)/;

/** Names that read as "the register the identity lives in". */
const REGISTER_NAME = /(?:REG|ADDR|WAI|WHO)/;

export interface IdentityValue {
  /** The macro, so the answer can be checked against the driver. */
  name: string;
  value: number;
}

export interface DriverIdentity {
  /** `DT_DRV_COMPAT` tokens: the compatible with non-alphanumerics replaced. */
  compatTokens: string[];
  /** Macro naming the identity register, empty when the call could not be read. */
  registerName: string;
  /** Its value, null when unresolved. */
  register: number | null;
  values: IdentityValue[];
}

/** Why a candidate driver produced no record. Stable codes; they reach the report. */
export type IdentityRejection =
  | 'several-compared-lvalues'
  | 'no-identity-comparison'
  | 'no-drv-compat';

/** Blank comment bodies, preserving line structure so nothing joins across them. */
export function blankComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
}

/** An integer literal, or null for anything that needs a preprocessor to know. */
function integerLiteral(token: string): number | null {
  const text = token
    .trim()
    .replace(/^\((.*)\)$/, '$1')
    .trim()
    .replace(/[uUlL]+$/, '');
  if (/^0[xX][0-9a-fA-F]+$/.test(text)) return Number.parseInt(text.slice(2), 16);
  if (/^0[bB][01]+$/.test(text)) return Number.parseInt(text.slice(2), 2);
  if (/^[0-9]+$/.test(text)) return Number.parseInt(text, 10);
  return null;
}

/**
 * Object-like macros with an integer value.
 *
 * Function-like macros and expressions are skipped rather than evaluated. A
 * value this cannot read is a value it must not report.
 */
export function integerDefines(text: string): Map<string, number> {
  const found = new Map<string, number>();
  for (const match of text.matchAll(
    /^[ \t]*#[ \t]*define[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]+([^\n\\]*)$/gm,
  )) {
    const value = integerLiteral(match[2]!);
    // First definition wins: a driver's own header is read before its siblings.
    if (value !== null && !found.has(match[1]!)) found.set(match[1]!, value);
  }
  return found;
}

/** Every `DT_DRV_COMPAT` token declared in the given sources. */
export function drvCompatTokens(sources: string[]): string[] {
  const tokens = new Set<string>();
  for (const source of sources) {
    for (const match of source.matchAll(/^\s*#\s*define\s+DT_DRV_COMPAT\s+([A-Za-z0-9_]+)\s*$/gm)) {
      tokens.add(match[1]!);
    }
  }
  return [...tokens].sort();
}

/**
 * The final member of an lvalue: `data->chip_id` and `dev_data->chip_id` are the
 * same field reached through different locals, and a driver routinely uses both.
 * A subscript is kept, because `id[0]` and `id[1]` are genuinely different bytes.
 */
function lastMember(lvalue: string): string {
  const arrow = lvalue.lastIndexOf('->');
  const dot = lvalue.lastIndexOf('.');
  const cut = Math.max(arrow < 0 ? -1 : arrow + 2, dot < 0 ? -1 : dot + 1);
  return (cut <= 0 ? lvalue : lvalue.slice(cut)).trim();
}

interface Comparison {
  lvalue: string;
  op: '==' | '!=';
  name: string;
  value: number;
}

function comparisons(text: string, defines: Map<string, number>): Comparison[] {
  const found: Comparison[] = [];
  const add = (lvalue: string, op: string, name: string): void => {
    const value = defines.get(name);
    if (value === undefined || !IDENTITY_NAME.test(name)) return;
    found.push({ lvalue: lastMember(lvalue), op: op as '==' | '!=', name, value });
  };
  const LVALUE = String.raw`[A-Za-z_][A-Za-z0-9_.\[\]]*(?:->[A-Za-z0-9_.\[\]]+)*`;
  for (const match of text.matchAll(new RegExp(`(${LVALUE})\\s*(==|!=)\\s*([A-Za-z_][A-Za-z0-9_]*)`, 'g'))) {
    add(match[1]!, match[2]!, match[3]!);
  }
  // The mirrored form, `CHIP_ID == id`, which upstream also writes.
  for (const match of text.matchAll(new RegExp(`([A-Za-z_][A-Za-z0-9_]*)\\s*(==|!=)\\s*(${LVALUE})`, 'g'))) {
    if (defines.has(match[3]!)) continue;
    add(match[3]!, match[2]!, match[1]!);
  }
  return found;
}

/**
 * The macro naming the register whose read produced `lvalue`.
 *
 * Found through the call that takes its address, so the register is whatever the
 * driver passed rather than whatever its name suggests. A driver that reads
 * through a transfer-function pointer still matches, because the argument list
 * is the same shape.
 */
function registerFor(
  text: string,
  lvalue: string,
  defines: Map<string, number>,
  accepted: Set<string>,
): string {
  const call = new RegExp(String.raw`\w+\s*\(([^;{}]*?&[\w.\->\[\]]*\b${lvalue}\b[^;{}]*?)\)`, 'g');
  for (const match of text.matchAll(call)) {
    const candidates = match[1]!
      .split(',')
      .map((argument) => argument.replace(/^\([^)]*\)/, '').trim())
      .filter(
        (argument) =>
          /^[A-Za-z_][A-Za-z0-9_]*$/.test(argument) &&
          defines.has(argument) &&
          !accepted.has(argument),
      );
    const chosen = candidates.find((name) => REGISTER_NAME.test(name)) ?? candidates[0];
    if (chosen) return chosen;
  }
  return '';
}

/**
 * Read one driver's identity contract.
 *
 * `sources` is the driver `.c` first, then every header beside it: upstream puts
 * `DT_DRV_COMPAT` in either, and the constants are usually in the header.
 * Returns the rejection code instead of a record when the shape is not
 * recognised, so the caller can account for every candidate it looked at.
 */
export function readDriverIdentity(sources: string[]): DriverIdentity | IdentityRejection {
  const blanked = sources.map(blankComments);
  const compatTokens = drvCompatTokens(blanked);
  if (compatTokens.length === 0) return 'no-drv-compat';

  const defines = new Map<string, number>();
  for (const source of blanked) {
    for (const [name, value] of integerDefines(source)) {
      if (!defines.has(name)) defines.set(name, value);
    }
  }

  // Only the driver source is scanned for the check itself. A constant declared
  // in a header is data; a comparison in a header is another driver's business.
  const source = blanked[0] ?? '';
  const found = comparisons(source, defines);
  if (found.length === 0) return 'no-identity-comparison';

  const lvalues = new Set(found.map((comparison) => comparison.lvalue));
  if (lvalues.size !== 1) return 'several-compared-lvalues';
  const lvalue = [...lvalues][0]!;

  // Both operators name a value the driver recognises: `id == X` selects a
  // variant, `if (id != X) return -EINVAL` accepts exactly X. Taking only the
  // equalities dropped X entirely in a driver that rejects with `!=` and
  // branches on `==` for a second part, which is the shape that loses a
  // supported part silently.
  const values = [...new Map(found.map((comparison) => [comparison.name, comparison.value]))]
    .map(([name, value]) => ({ name, value }))
    // A total order, because these rows are part of the index content digest.
    .sort((left, right) => left.value - right.value || (left.name < right.name ? -1 : 1));

  const registerName = registerFor(source, lvalue, defines, new Set(values.map((v) => v.name)));
  return {
    compatTokens,
    registerName,
    register: registerName ? (defines.get(registerName) ?? null) : null,
    values,
  };
}

/**
 * The compatible a `DT_DRV_COMPAT` token names.
 *
 * The token is the compatible with every non-alphanumeric replaced by `_`, which
 * is not reversible: `_` may have been `,`, `-` or `.`. Rather than guess, every
 * indexed compatible is normalised the same way and the token is looked up, so a
 * token that matches nothing yields nothing.
 */
export function compatibleIndex(compatibles: Iterable<string>): Map<string, string> {
  const index = new Map<string, string>();
  for (const compatible of compatibles) {
    const token = compatible.replace(/[^A-Za-z0-9]/g, '_');
    const existing = index.get(token);
    // A collision is two *different* compatibles normalising alike; the token
    // cannot identify either, so both are dropped. The same compatible arriving
    // twice is not a collision: a device reachable over more than one bus has
    // one binding per bus and appears once per binding, and treating that as
    // ambiguity dropped every multi-bus sensor in the tree.
    if (existing !== undefined && existing !== compatible) index.set(token, '');
    else if (existing === undefined) index.set(token, compatible);
  }
  return index;
}
