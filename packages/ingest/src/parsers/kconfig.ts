/**
 * Kconfig parser.
 *
 * Scope: this extracts *declarations*, not a resolved configuration. Full
 * evaluation needs a board, an architecture, and a toolchain (that is what
 * `west build` does); what an agent actually needs is different and cheaper —
 * does this symbol exist, what type is it, what does it default to, and what
 * does it depend on.
 *
 * Zephyr declares the same symbol in many files to layer per-SoC and per-board
 * defaults, so definitions are collected per file and aggregated afterwards by
 * `aggregate()`.
 *
 * Files are discovered by walking the tree rather than by following `source`
 * directives, because those contain environment variables (`$(ARCH_DIR)`) and
 * globs that only resolve inside a configured build. Walking finds every symbol;
 * the cost is that the cross-file menu hierarchy is not reconstructed, so each
 * definition records its defining file and its *in-file* menu context instead.
 */

import { byField } from '../../../shared/ordering.ts';

export type KconfigType = 'bool' | 'tristate' | 'int' | 'hex' | 'string';

const TYPE_KEYWORDS = new Set<string>(['bool', 'tristate', 'int', 'hex', 'string']);

/** `def_bool X` is shorthand for `bool` plus `default X`. */
const DEF_TYPE_KEYWORDS: Record<string, KconfigType> = {
  def_bool: 'bool',
  def_tristate: 'tristate',
  def_int: 'int',
  def_hex: 'hex',
  def_string: 'string',
};

export interface Conditional {
  value: string;
  cond?: string;
}

export interface KconfigRange {
  low: string;
  high: string;
  cond?: string;
}

/** A single `config`/`menuconfig` block in one file. */
export interface KconfigDef {
  name: string;
  type?: KconfigType;
  prompt?: string;
  help?: string;
  defaults: Conditional[];
  /** `depends on` plus conditions inherited from enclosing `if`/`choice` blocks. */
  depends: string[];
  selects: Conditional[];
  implies: Conditional[];
  ranges: KconfigRange[];
  file: string;
  line: number;
  /** Titles of enclosing `menu` blocks, outermost first. */
  menuPath: string[];
  /** Name of the enclosing `choice`, when the symbol is one of its options. */
  choice?: string;
  isMenuconfig: boolean;
}

/** A symbol aggregated across every file that defines it. */
export interface KconfigSymbol {
  name: string;
  type?: KconfigType;
  prompt?: string;
  help?: string;
  defaults: Conditional[];
  depends: string[];
  selects: Conditional[];
  implies: Conditional[];
  ranges: KconfigRange[];
  definedIn: { file: string; line: number }[];
  menuPath: string;
  isChoice: boolean;
  choice?: string;
  nDefs: number;
}

interface Context {
  kind: 'if' | 'menu' | 'choice';
  cond?: string;
  title?: string;
  choiceName?: string;
}

/** Choice blocks, which group mutually exclusive options. */
export interface KconfigChoice {
  name?: string;
  prompt?: string;
  help?: string;
  options: string[];
  file: string;
  line: number;
}

export interface ParseResult {
  defs: KconfigDef[];
  choices: KconfigChoice[];
}

function emptyDef(name: string, file: string, line: number, isMenuconfig: boolean): KconfigDef {
  return {
    name,
    defaults: [],
    depends: [],
    selects: [],
    implies: [],
    ranges: [],
    file,
    line,
    menuPath: [],
    isMenuconfig,
  };
}

/**
 * Read a possibly-quoted token from the front of `s`.
 * Returns the token text and whatever follows it.
 */
function readToken(s: string): { value: string; rest: string } {
  const str = s.trimStart();
  const quote = str[0];
  if (quote === '"' || quote === "'") {
    let out = '';
    let i = 1;
    while (i < str.length) {
      const ch = str[i]!;
      if (ch === '\\' && i + 1 < str.length) {
        out += str[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) {
        i++;
        break;
      }
      out += ch;
      i++;
    }
    return { value: out, rest: str.slice(i) };
  }
  const m = str.match(/^(\S+)/);
  if (!m) return { value: '', rest: '' };
  return { value: m[1]!, rest: str.slice(m[1]!.length) };
}

/** Split a trailing `if <expr>` off a statement, respecting quotes. */
function splitIfCondition(s: string): { head: string; cond?: string } {
  let depth = 0;
  let inQuote: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (inQuote) {
      if (ch === '\\') i++;
      else if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && s.startsWith('if', i)) {
      const before = i === 0 ? ' ' : s[i - 1]!;
      const after = s[i + 2] ?? ' ';
      if (/\s/.test(before) && /\s/.test(after)) {
        return { head: s.slice(0, i).trim(), cond: s.slice(i + 2).trim() };
      }
    }
  }
  return { head: s.trim() };
}

/** Strip a trailing `# comment`, respecting quoted strings. */
function stripComment(line: string): string {
  let inQuote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuote) {
      if (ch === '\\') i++;
      else if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") inQuote = ch;
    else if (ch === '#') return line.slice(0, i);
  }
  return line;
}

function indentWidth(line: string): number {
  let n = 0;
  for (const ch of line) {
    if (ch === ' ') n += 1;
    else if (ch === '\t') n += 8 - (n % 8);
    else break;
  }
  return n;
}

/**
 * Parse one Kconfig file.
 *
 * `file` is the tree-relative path, used only for provenance.
 */
export function parseKconfig(text: string, file: string): ParseResult {
  const rawLines = text.split(/\r?\n/);

  // Join backslash continuations into logical lines, remembering source line numbers.
  const lines: { text: string; line: number }[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    let joined = rawLines[i]!;
    const startLine = i + 1;
    while (joined.endsWith('\\') && i + 1 < rawLines.length) {
      joined = `${joined.slice(0, -1)} ${rawLines[++i]!.trim()}`;
    }
    lines.push({ text: joined, line: startLine });
  }

  const defs: KconfigDef[] = [];
  const choices: KconfigChoice[] = [];
  const stack: Context[] = [];
  let current: KconfigDef | null = null;
  let currentChoice: KconfigChoice | null = null;

  const contextConds = (): string[] =>
    stack.flatMap((c) => (c.kind !== 'menu' && c.cond ? [c.cond] : []));
  const menuTitles = (): string[] =>
    stack.flatMap((c) => (c.kind === 'menu' && c.title ? [c.title] : []));
  const enclosingChoice = (): string | undefined => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const c = stack[i]!;
      if (c.kind === 'choice') return c.choiceName ?? '<unnamed>';
    }
    return undefined;
  };

  const flush = () => {
    if (current) {
      defs.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i]!;
    const stripped = stripComment(entry.text);
    const trimmed = stripped.trim();
    if (trimmed === '') continue;

    const [keyword = '', ...restParts] = trimmed.split(/\s+/);
    const rest = restParts.join(' ');

    // --- help blocks -------------------------------------------------------
    // Consumed inline so their contents are never dispatched as keywords.
    if (keyword === 'help' || keyword === '---help---') {
      const helpLines: string[] = [];
      let baseIndent = -1;
      let j = i + 1;
      for (; j < lines.length; j++) {
        const raw = lines[j]!.text;
        if (raw.trim() === '') {
          helpLines.push('');
          continue;
        }
        const ind = indentWidth(raw);
        if (baseIndent === -1) {
          baseIndent = ind;
        } else if (ind < baseIndent) {
          break;
        }
        helpLines.push(raw.slice(Math.min(raw.length, countChars(raw, baseIndent))));
      }
      i = j - 1;
      const help = helpLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      if (current) current.help = help;
      else if (currentChoice) currentChoice.help = help;
      continue;
    }

    // --- block structure ---------------------------------------------------
    switch (keyword) {
      case 'config':
      case 'menuconfig': {
        flush();
        const { value: name } = readToken(rest);
        if (!name) continue;
        current = emptyDef(name, file, entry.line, keyword === 'menuconfig');
        current.menuPath = menuTitles();
        current.depends.push(...contextConds());
        const choice = enclosingChoice();
        if (choice) {
          current.choice = choice;
          const ch = choices.find((c) => (c.name ?? '<unnamed>') === choice);
          if (ch) ch.options.push(name);
        }
        continue;
      }
      case 'choice': {
        flush();
        const { value: name } = readToken(rest);
        currentChoice = {
          name: name || undefined,
          options: [],
          file,
          line: entry.line,
        };
        choices.push(currentChoice);
        stack.push({ kind: 'choice', choiceName: name || '<unnamed>' });
        continue;
      }
      case 'endchoice': {
        flush();
        currentChoice = null;
        popUntil(stack, 'choice');
        continue;
      }
      case 'menu': {
        flush();
        const { value: title } = readToken(rest);
        stack.push({ kind: 'menu', title });
        continue;
      }
      case 'endmenu': {
        flush();
        popUntil(stack, 'menu');
        continue;
      }
      case 'if': {
        flush();
        stack.push({ kind: 'if', cond: rest.trim() });
        continue;
      }
      case 'endif': {
        flush();
        popUntil(stack, 'if');
        continue;
      }
      case 'source':
      case 'rsource':
      case 'osource':
      case 'orsource':
      case 'gsource':
      case 'grsource':
      case 'mainmenu':
      case 'comment': {
        flush();
        continue;
      }
      default:
        break;
    }

    // --- properties of the current entry -----------------------------------
    if (!current && !currentChoice) continue;

    if (TYPE_KEYWORDS.has(keyword)) {
      const { value: promptText } = readToken(rest);
      const target = current ?? null;
      if (target) {
        target.type = keyword as KconfigType;
        if (promptText && rest.trimStart().startsWith('"')) target.prompt = promptText;
      } else if (currentChoice && promptText) {
        currentChoice.prompt = promptText;
      }
      continue;
    }

    const defType = DEF_TYPE_KEYWORDS[keyword];
    if (defType && current) {
      current.type = defType;
      const { head, cond } = splitIfCondition(rest);
      if (head) current.defaults.push(cond ? { value: head, cond } : { value: head });
      continue;
    }

    switch (keyword) {
      case 'prompt': {
        const { value: text, rest: after } = readToken(rest);
        const { cond } = splitIfCondition(after);
        if (current) {
          current.prompt = text;
          if (cond) current.depends.push(cond);
        } else if (currentChoice) {
          currentChoice.prompt = text;
        }
        break;
      }
      case 'default': {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const { value } = readToken(head);
        const isQuoted = head.trimStart().startsWith('"');
        const val = isQuoted ? value : head;
        if (val) current.defaults.push(cond ? { value: val, cond } : { value: val });
        break;
      }
      case 'depends': {
        // `depends on EXPR`
        const expr = rest.replace(/^on\s+/, '').trim();
        if (expr && current) current.depends.push(expr);
        break;
      }
      case 'select':
      case 'imply': {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const { value: sym } = readToken(head);
        if (!sym) break;
        const item: Conditional = cond ? { value: sym, cond } : { value: sym };
        if (keyword === 'select') current.selects.push(item);
        else current.implies.push(item);
        break;
      }
      case 'range': {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const parts = head.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          current.ranges.push(
            cond
              ? { low: parts[0]!, high: parts[1]!, cond }
              : { low: parts[0]!, high: parts[1]! },
          );
        }
        break;
      }
      case 'visible':
      case 'option':
      case 'optional':
      case 'modules':
        break;
      default:
        break;
    }
  }

  flush();
  return { defs, choices };
}

/** Number of characters that make up `width` columns of leading whitespace. */
function countChars(line: string, width: number): number {
  let n = 0;
  let col = 0;
  while (n < line.length && col < width) {
    const ch = line[n]!;
    if (ch === ' ') col += 1;
    else if (ch === '\t') col += 8 - (col % 8);
    else break;
    n++;
  }
  return n;
}

function popUntil(stack: Context[], kind: Context['kind']): void {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]!.kind === kind) {
      stack.splice(i, 1);
      return;
    }
  }
}

function uniq<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

/**
 * Merge every definition of each symbol into one record.
 *
 * The first definition that supplies a type, prompt, or help text wins, since
 * Zephyr's convention is that the primary declaration carries the documentation
 * and later files only add defaults for specific hardware.
 */
export function aggregate(defs: KconfigDef[], choices: KconfigChoice[]): KconfigSymbol[] {
  const bySymbol = new Map<string, KconfigDef[]>();
  for (const def of defs) {
    const list = bySymbol.get(def.name);
    if (list) list.push(def);
    else bySymbol.set(def.name, [def]);
  }

  const choiceNames = new Set(choices.map((c) => c.name).filter(Boolean) as string[]);
  const out: KconfigSymbol[] = [];

  for (const [name, group] of bySymbol) {
    // Prefer the definition richest in documentation for the descriptive fields.
    const primary =
      group.find((d) => d.help && d.prompt && d.type) ??
      group.find((d) => d.help) ??
      group.find((d) => d.prompt) ??
      group.find((d) => d.type) ??
      group[0]!;

    const merged: KconfigSymbol = {
      name,
      type: group.find((d) => d.type)?.type,
      prompt: group.find((d) => d.prompt)?.prompt,
      help: group.find((d) => d.help)?.help,
      defaults: uniq(
        group.flatMap((d) => d.defaults),
        (d) => `${d.value}|${d.cond ?? ''}`,
      ),
      depends: [...new Set(group.flatMap((d) => d.depends))],
      selects: uniq(
        group.flatMap((d) => d.selects),
        (d) => `${d.value}|${d.cond ?? ''}`,
      ),
      implies: uniq(
        group.flatMap((d) => d.implies),
        (d) => `${d.value}|${d.cond ?? ''}`,
      ),
      ranges: uniq(
        group.flatMap((d) => d.ranges),
        (r) => `${r.low}|${r.high}|${r.cond ?? ''}`,
      ),
      definedIn: group.map((d) => ({ file: d.file, line: d.line })),
      menuPath: primary.menuPath.join(' > '),
      isChoice: choiceNames.has(name),
      choice: group.find((d) => d.choice)?.choice,
      nDefs: group.length,
    };
    out.push(merged);
  }

  out.sort(byField((symbol) => symbol.name));
  return out;
}

const EXPR_KEYWORDS = new Set(['y', 'n', 'm', 'if', 'on', 'not', 'and', 'or']);

/** Pull symbol references out of a Kconfig expression, for the reverse-dependency graph. */
export function symbolsInExpr(expr: string): string[] {
  const withoutStrings = expr.replace(/"(?:[^"\\]|\\.)*"/g, ' ');
  const ids = withoutStrings.match(/\$?\(?[A-Za-z_][A-Za-z0-9_]*\)?/g) ?? [];
  const out = new Set<string>();
  for (const raw of ids) {
    if (raw.startsWith('$')) continue; // $(VAR) is a preprocessor reference, not a symbol
    const id = raw.replace(/[()]/g, '');
    if (EXPR_KEYWORDS.has(id) || EXPR_KEYWORDS.has(id.toLowerCase())) continue;
    if (!/^[A-Z0-9_]+$/.test(id)) continue; // Kconfig symbols are upper snake case
    out.add(id);
  }
  return [...out];
}
