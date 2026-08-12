/**
 * Extracts the public C API from Zephyr headers.
 *
 * Zephyr's API surface is Doxygen-annotated, so the comment immediately above a
 * declaration carries the brief, parameter meanings, and return contract. That
 * is exactly what a model needs to call a function correctly, and it is the
 * thing most often hallucinated.
 *
 * Two Zephyr-specific wrinkles are handled:
 *  - Syscalls are declared `__syscall int gpio_pin_configure(...)` and defined
 *    as `static inline int z_impl_gpio_pin_configure(...)`. The public name is
 *    the one without the `z_impl_` prefix.
 *  - `@defgroup`/`@addtogroup` with `@{` ... `@}` establish the API grouping
 *    that the published documentation is organised by.
 */

export type SymbolKind =
  | 'function'
  | 'macro'
  | 'struct'
  | 'enum'
  | 'enumvalue'
  | 'typedef'
  | 'union'
  | 'variable';

export interface ApiParam {
  name: string;
  description: string;
  direction?: string;
  type?: string;
}

export interface ApiSymbol {
  name: string;
  kind: SymbolKind;
  signature: string;
  brief?: string;
  detail?: string;
  params: ApiParam[];
  returns: string[];
  /** `@retval <value> <meaning>` entries, which Zephyr uses heavily for errno codes. */
  retvals: { value: string; description: string }[];
  group?: string;
  since?: string;
  deprecated?: boolean;
  header: string;
  line: number;
  /** Stable identities exist only for Doxygen XML ingestion. */
  doxygenId?: string;
  compoundId?: string;
  docAnchor?: string;
}

export interface ApiGroup {
  id: string;
  title: string;
  parent?: string;
  header: string;
}

export interface ParsedHeader {
  symbols: ApiSymbol[];
  groups: ApiGroup[];
}

interface DocComment {
  text: string;
  endLine: number;
}

/** Strip the leading `*` decoration from a doc comment body. */
function stripCommentDecoration(raw: string): string {
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*\*\/?/, '').replace(/^ /, ''))
    .join('\n')
    .trim();
}

interface DoxyTags {
  brief?: string;
  detail: string;
  params: ApiParam[];
  returns: string[];
  retvals: { value: string; description: string }[];
  defgroup?: { id: string; title: string };
  addtogroup?: string;
  ingroup?: string;
  since?: string;
  deprecated: boolean;
}

/** Split a doc comment into its Doxygen tags and free text. */
export function parseDocComment(text: string): DoxyTags {
  const out: DoxyTags = {
    detail: '',
    params: [],
    returns: [],
    retvals: [],
    deprecated: false,
  };

  const lines = text.split('\n');
  const detailLines: string[] = [];
  // Tag bodies continue across lines until the next tag, so track the open one.
  let sink: { kind: 'brief' | 'param' | 'return' | 'retval' | 'detail'; index?: number } = {
    kind: 'detail',
  };

  const append = (chunk: string) => {
    const text = chunk.trim();
    if (!text) return;
    switch (sink.kind) {
      case 'brief':
        out.brief = out.brief ? `${out.brief} ${text}` : text;
        break;
      case 'param': {
        const p = out.params[sink.index!];
        if (p) p.description = p.description ? `${p.description} ${text}` : text;
        break;
      }
      case 'return': {
        const i = sink.index!;
        out.returns[i] = out.returns[i] ? `${out.returns[i]} ${text}` : text;
        break;
      }
      case 'retval': {
        const r = out.retvals[sink.index!];
        if (r) r.description = r.description ? `${r.description} ${text}` : text;
        break;
      }
      default:
        detailLines.push(text);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // A blank line terminates `@brief`; everything after it is detail. Without
    // this the whole comment collapses into the brief.
    if (line === '') {
      if (sink.kind === 'brief') sink = { kind: 'detail' };
      else if (sink.kind === 'detail') detailLines.push('');
      continue;
    }
    if (line === '@{' || line === '@}') continue;

    const tag = line.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);
    if (!tag) {
      append(line);
      continue;
    }

    const [, nameRaw = '', restRaw = ''] = tag;
    const name = nameRaw.toLowerCase();
    const rest = restRaw.trim();

    switch (name) {
      case 'brief':
      case 'short':
        sink = { kind: 'brief' };
        append(rest);
        break;
      case 'param': {
        // `@param[in] name description` / `@param name description`
        const m = rest.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);
        if (m) {
          const param: ApiParam = { name: m[2]!, description: (m[3] ?? '').trim() };
          if (m[1]) param.direction = m[1].replace(/\s+/g, '');
          out.params.push(param);
          sink = { kind: 'param', index: out.params.length - 1 };
        }
        break;
      }
      case 'return':
      case 'returns':
      case 'result':
        out.returns.push(rest);
        sink = { kind: 'return', index: out.returns.length - 1 };
        break;
      case 'retval': {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) {
          out.retvals.push({ value: m[1]!, description: (m[2] ?? '').trim() });
          sink = { kind: 'retval', index: out.retvals.length - 1 };
        }
        break;
      }
      case 'defgroup': {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) out.defgroup = { id: m[1]!, title: (m[2] ?? '').trim() };
        sink = { kind: 'detail' };
        break;
      }
      case 'addtogroup':
        out.addtogroup = rest.split(/\s+/)[0];
        sink = { kind: 'detail' };
        break;
      case 'ingroup':
        out.ingroup = rest.split(/\s+/)[0];
        sink = { kind: 'detail' };
        break;
      case 'since':
        out.since = rest;
        sink = { kind: 'detail' };
        break;
      case 'deprecated':
        out.deprecated = true;
        sink = { kind: 'detail' };
        append(rest);
        break;
      case 'note':
      case 'warning':
      case 'details':
      case 'remark':
        sink = { kind: 'detail' };
        append(`${nameRaw.toUpperCase()}: ${rest}`);
        break;
      case 'version':
      case 'name':
      case 'file':
      case 'cond':
      case 'endcond':
      case 'internal':
      case 'endinternal':
        sink = { kind: 'detail' };
        break;
      default:
        sink = { kind: 'detail' };
        append(rest);
        break;
    }
  }

  out.detail = detailLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  // Inline Doxygen markup only matters to the HTML renderer; left in place it
  // shows up verbatim in tool output as things like "for @a duration".
  if (out.brief) out.brief = cleanDoxyInline(out.brief);
  out.detail = cleanDoxyInline(out.detail);
  out.returns = out.returns.map(cleanDoxyInline);
  for (const p of out.params) p.description = cleanDoxyInline(p.description);
  for (const r of out.retvals) r.description = cleanDoxyInline(r.description);

  return out;
}

/** Strip inline Doxygen commands, keeping the text they decorate. */
export function cleanDoxyInline(text: string): string {
  return text
    .replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g, '$1')
    .replace(/[@\\]ref\s+(\S+)/g, '$1')
    .replace(/[@\\]kconfig\{([^}]*)\}/g, '$1')
    .replace(/[@\\]f\$/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

type GroupEvent =
  | { kind: 'define'; id: string; title: string }
  | { kind: 'add'; id: string }
  | { kind: 'open' }
  | { kind: 'close' };

/**
 * Extract group-scoping directives from a comment, in source order.
 *
 * Order matters and a single comment can carry several directives. Zephyr's
 * `gpio.h` opens `gpio_interface`, then opens *and closes* a nested
 * `gpio_interface_ext` inside the same comment; reading only the last
 * `@defgroup` would file every GPIO function under the extension group.
 */
export function groupEvents(comment: string): GroupEvent[] {
  const events: GroupEvent[] = [];
  for (const rawLine of comment.split('\n')) {
    const line = rawLine.trim();
    const def = line.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);
    if (def) {
      events.push({ kind: 'define', id: def[1]!, title: (def[2] ?? '').trim() });
      continue;
    }
    const add = line.match(/^[@\\]addtogroup\s+(\S+)/);
    if (add) {
      events.push({ kind: 'add', id: add[1]! });
      continue;
    }
    // `@{` and `@}` may share a line with surrounding comment punctuation.
    for (const m of line.matchAll(/[@\\]([{}])/g)) {
      events.push(m[1] === '{' ? { kind: 'open' } : { kind: 'close' });
    }
  }
  return events;
}

/** Collapse a multi-line declaration into one readable line. */
function normaliseSignature(sig: string): string {
  return sig.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\s*,\s*/g, ', ').trim();
}

const PUBLIC_PREFIXES = ['z_impl_'];

function publicName(name: string): string {
  for (const prefix of PUBLIC_PREFIXES) {
    if (name.startsWith(prefix)) return name.slice(prefix.length);
  }
  return name;
}

/** Identify what a declaration declares, and under what name. */
export function parseDeclaration(
  decl: string,
): { kind: SymbolKind; name: string; signature: string } | null {
  const text = decl.trim();
  if (!text) return null;

  const macro = text.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);
  if (macro) {
    const name = macro[1]!;
    const signature = normaliseSignature(text.split('\n')[0]!.replace(/\\$/, ''));
    return { kind: 'macro', name, signature };
  }

  const typedefFn = text.match(
    /^typedef\s+[\s\S]*?\(\s*\*\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/,
  );
  if (typedefFn) {
    return { kind: 'typedef', name: typedefFn[1]!, signature: normaliseSignature(text) };
  }

  const typedefPlain = text.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);
  if (typedefPlain) {
    return { kind: 'typedef', name: typedefPlain[1]!, signature: normaliseSignature(text) };
  }

  const record = text.match(/^(struct|union|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (record) {
    return {
      kind: record[1] as SymbolKind,
      name: record[2]!,
      signature: normaliseSignature(text.replace(/\{[\s\S]*$/, '').trim()),
    };
  }

  // A function declaration: the last identifier before the argument list.
  const fn = text.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);
  if (fn && /^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(text)) {
    const name = fn[1]!;
    if (name === 'if' || name === 'for' || name === 'while' || name === 'switch') return null;
    return {
      kind: 'function',
      name: publicName(name),
      signature: normaliseSignature(text.replace(/\s*\{[\s\S]*$/, '').replace(/;\s*$/, '')),
    };
  }

  return null;
}

/**
 * Read the declaration that follows a doc comment.
 *
 * Preprocessor conditionals and attribute macros sit between the comment and the
 * declaration often enough that they have to be skipped rather than treated as
 * the declaration itself.
 */
function readDeclaration(lines: string[], start: number): { text: string; line: number } | null {
  let i = start;
  const SKIP = /^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === '' || SKIP.test(line)) {
      i++;
      continue;
    }
    break;
  }
  if (i >= lines.length) return null;

  // A `#define` continues while lines end with a backslash.
  if (/^\s*#\s*define\b/.test(lines[i]!)) {
    const buf: string[] = [];
    let j = i;
    while (j < lines.length) {
      buf.push(lines[j]!);
      if (!lines[j]!.trimEnd().endsWith('\\')) break;
      j++;
    }
    return { text: buf.join('\n'), line: i };
  }

  // Otherwise accumulate until the declaration terminates at `;` or a body `{`.
  const buf: string[] = [];
  let depth = 0;
  for (let j = i; j < lines.length && j < i + 40; j++) {
    const line = lines[j]!;
    buf.push(line);
    for (const ch of line) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    if (depth <= 0 && (line.includes(';') || line.includes('{'))) break;
  }
  return { text: buf.join('\n'), line: i };
}

export function parseHeader(text: string, header: string): ParsedHeader {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const symbols: ApiSymbol[] = [];
  const groups: ApiGroup[] = [];
  const groupStack: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!/\/\*\*|\/\*!/.test(line)) continue;

    // Collect the whole comment.
    const buf: string[] = [];
    let j = i;
    let closed = false;
    for (; j < lines.length; j++) {
      buf.push(lines[j]!);
      if (lines[j]!.includes('*/')) {
        closed = true;
        break;
      }
    }
    if (!closed) continue;

    const commentRaw = buf
      .join('\n')
      .replace(/^[\s\S]*?\/\*[*!]/, '')
      .replace(/\*\/[\s\S]*$/, '');
    const comment: DocComment = { text: stripCommentDecoration(commentRaw), endLine: j };
    const tags = parseDocComment(comment.text);

    // Replay this comment's group directives in order so nested open/close
    // pairs inside a single comment leave the stack correct.
    const events = groupEvents(comment.text);
    if (events.length > 0) {
      let pending: string | undefined;
      for (const ev of events) {
        switch (ev.kind) {
          case 'define': {
            const group: ApiGroup = { id: ev.id, title: ev.title, header };
            const parent = tags.ingroup ?? groupStack[groupStack.length - 1];
            if (parent) group.parent = parent;
            groups.push(group);
            pending = ev.id;
            break;
          }
          case 'add':
            pending = ev.id;
            break;
          case 'open':
            groupStack.push(pending ?? groupStack[groupStack.length - 1] ?? '');
            pending = undefined;
            break;
          case 'close':
            groupStack.pop();
            break;
        }
      }

      // A comment that only does group bookkeeping documents no symbol.
      if (!tags.brief && tags.params.length === 0 && tags.retvals.length === 0) {
        i = j;
        continue;
      }
    }

    const decl = readDeclaration(lines, j + 1);
    if (!decl) {
      i = j;
      continue;
    }

    const parsed = parseDeclaration(decl.text);
    if (!parsed) {
      i = j;
      continue;
    }

    const group = tags.ingroup ?? groupStack.filter(Boolean)[groupStack.filter(Boolean).length - 1];
    const symbol: ApiSymbol = {
      name: parsed.name,
      kind: parsed.kind,
      signature: parsed.signature,
      params: tags.params,
      returns: tags.returns,
      retvals: tags.retvals,
      header,
      line: decl.line + 1,
      deprecated: tags.deprecated,
    };
    if (tags.brief) symbol.brief = tags.brief;
    if (tags.detail) symbol.detail = tags.detail;
    if (group) symbol.group = group;
    if (tags.since) symbol.since = tags.since;

    symbols.push(symbol);
    i = j;
  }

  return { symbols, groups };
}
