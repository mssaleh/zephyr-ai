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
  /**
   * The symbol this one is a member of, by name — an `enumvalue`'s enum.
   * `compoundId` cannot serve this: in Doxygen XML it names the containing
   * group or file, which every sibling symbol shares.
   */
  parentSymbol?: string;
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

/**
 * Attribute macros that sit between a record keyword and its tag.
 *
 * `enum __packed bt_conn_type { ... }` is ordinary Zephyr. Reading the token
 * after the keyword as the tag files the type under `__packed` and loses the
 * real one, so the attribute run is skipped. `__aligned(4)` carries arguments.
 */
const RECORD_ATTRIBUTES = String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`;

/**
 * A record *definition* or forward declaration, as opposed to a use of one.
 *
 * The tag has to be followed by a body, a semicolon, or the end of the
 * declaration. Without that anchor `enum bt_conn_type type;` — a struct field
 * whose type happens to be an enum — parses as a second definition of
 * `bt_conn_type`, overwriting the real one's location and documentation.
 */
const RECORD = new RegExp(
  String.raw`^(struct|union|enum)\s+${RECORD_ATTRIBUTES}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`,
);

/**
 * A function-pointer declarator, i.e. `(*name)(args)`.
 *
 * These are struct members such as `void (*const destroy)(struct net_buf *)`.
 * The function branch below would name them after their return type. A
 * function that merely *takes* a callback — `int foo(void (*cb)(void))` — has
 * a parameter list, not a `*`, immediately after its first `(`, so it is
 * untouched by this.
 */
const FUNCTION_POINTER_DECLARATOR = /^[^(]*\(\s*\*/;

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

  // The `*` is optional: `typedef void (fn_t)(args)` declares a function type
  // rather than a pointer to one, and Zephyr uses both spellings. Without it
  // the function branch below names the typedef after its return type.
  const typedefFn = text.match(
    /^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/,
  );
  if (typedefFn) {
    return { kind: 'typedef', name: typedefFn[1]!, signature: normaliseSignature(text) };
  }

  const typedefPlain = text.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);
  if (typedefPlain) {
    return { kind: 'typedef', name: typedefPlain[1]!, signature: normaliseSignature(text) };
  }

  const record = text.match(RECORD);
  if (record) {
    return {
      kind: record[1] as SymbolKind,
      name: record[2]!,
      signature: normaliseSignature(text.replace(/\{[\s\S]*$/, '').trim()),
    };
  }

  if (FUNCTION_POINTER_DECLARATOR.test(text)) return null;

  // A function declaration: the last identifier before the argument list. This
  // has to run after the record branch but before giving up, or a function
  // returning a record — `struct net_buf *net_buf_alloc(...)` — is lost.
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

export interface EnumMember {
  name: string;
  /** The initialiser without the `=`, e.g. `BIT(0)`. Empty when implicit. */
  value: string;
  brief: string;
  detail: string;
  line: number;
}

/**
 * Read an enum definition through its closing brace.
 *
 * `readDeclaration` stops at the opening `{` because a signature never needs
 * the body. Enum bodies are the exception: the members are the answer to "what
 * can I pass here", and in Zephyr they run to hundreds of lines —
 * `display_pixel_format` gives every member a memory-layout diagram — so this
 * is deliberately not bounded the way an ordinary declaration is.
 */
function readEnumBody(
  lines: string[],
  start: number,
): { body: string; line: number; endLine: number } | null {
  let depth = 0;
  let opened = false;
  let inComment = false;
  const buf: string[] = [];
  for (let j = start; j < lines.length; j++) {
    const line = lines[j]!;
    buf.push(line);
    // Braces inside comments do not nest the body. Zephyr's member
    // documentation uses Doxygen's `@{` and `@}` grouping, and `usb_audio.h`
    // opens a group it never closes before the enum ends — counting those would
    // run the body past its real terminator and into the next declaration.
    for (let k = 0; k < line.length; k++) {
      const ch = line[k]!;
      if (inComment) {
        if (ch === '*' && line[k + 1] === '/') {
          inComment = false;
          k++;
        }
        continue;
      }
      if (ch === '/' && line[k + 1] === '*') {
        inComment = true;
        k++;
      } else if (ch === '/' && line[k + 1] === '/') break;
      else if (ch === '{') {
        depth++;
        opened = true;
      } else if (ch === '}') depth--;
    }
    if (opened && depth <= 0) {
      const text = buf.join('\n');
      const open = text.indexOf('{');
      const close = text.lastIndexOf('}');
      if (open < 0 || close < open) return null;
      // The body keeps its newlines so member line numbers stay real.
      const prefix = text.slice(0, open + 1).replace(/[^\n]/g, '');
      return { body: prefix + text.slice(open + 1, close), line: start, endLine: j };
    }
  }
  return null;
}

/**
 * Split an enum body into its members.
 *
 * Zephyr documents members both ways, often in the same enum: a `/** … *\/`
 * block above the member, and a `/**< … *\/` trailing the value. The `<` means
 * "documents the preceding element", which is why a trailing comment appears
 * after the separating comma and therefore belongs to the member before it.
 */
export function parseEnumMembers(body: string, bodyLine: number): EnumMember[] {
  // Conditional members are ordinary; the directive itself is not part of any
  // member. Blanking the line rather than dropping it keeps line numbers real.
  const source = body
    .split('\n')
    .map((line) => (/^\s*#/.test(line) ? '' : line))
    .join('\n');

  interface Chunk {
    code: string;
    /** `/** … *\/` blocks, which document the member that follows them. */
    before: string[];
    /** A `/**< … *\/` reached before this chunk's member, so it documents the
     *  member in the previous chunk — the usual case, since the separating
     *  comma comes first. */
    trailingPrevious: string[];
    /** A `/**< … *\/` reached after this chunk's member, which happens only
     *  when the last member has no trailing comma. */
    trailingOwn: string[];
    line: number;
  }
  const chunks: Chunk[] = [];
  let code = '';
  let before: string[] = [];
  let trailingPrevious: string[] = [];
  let trailingOwn: string[] = [];
  let depth = 0;
  let line = bodyLine;
  let codeLine = bodyLine;

  const push = (): void => {
    chunks.push({ code, before, trailingPrevious, trailingOwn, line: codeLine });
    code = '';
    before = [];
    trailingPrevious = [];
    trailingOwn = [];
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;
    if (ch === '\n') {
      line++;
      code += ' ';
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end < 0 ? source.length : end + 2;
      const raw = source.slice(i, stop);
      if (/^\/\*[*!]</.test(raw)) (code.trim() ? trailingOwn : trailingPrevious).push(raw);
      else if (/^\/\*[*!]/.test(raw)) before.push(raw);
      for (const c of raw) if (c === '\n') line++;
      i = stop - 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      i = (end < 0 ? source.length : end) - 1;
      continue;
    }
    // Parentheses and brackets guard value expressions such as `BIT(0)`, whose
    // commas do not separate members.
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth <= 0) {
      push();
      continue;
    }
    if (!code.trim() && ch.trim()) codeLine = line;
    code += ch;
  }
  push();

  const docText = (raw: string): string =>
    stripCommentDecoration(raw.replace(/^\/\*[*!]<?/, '').replace(/\*\/\s*$/, ''));

  const members: EnumMember[] = [];
  const fillBrief = (member: EnumMember | undefined, raw: string | undefined): void => {
    if (member && raw && !member.brief) member.brief = cleanDoxyInline(docText(raw));
  };

  for (const chunk of chunks) {
    fillBrief(members[members.length - 1], chunk.trailingPrevious[0]);
    const declared = chunk.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);
    if (!declared) continue;
    const block = chunk.before[chunk.before.length - 1];
    const tags = block ? parseDocComment(docText(block)) : undefined;
    // Members are commonly documented with an untagged one-liner, which
    // `parseDocComment` files as detail. For a member the distinction carries
    // nothing, and only the brief reaches the FTS index, so promote it.
    const brief = tags?.brief ?? tags?.detail ?? '';
    const member: EnumMember = {
      name: declared[1]!,
      value: normaliseSignature(declared[2] ?? ''),
      // The block's `@brief` is richer than the trailing one-liner where both
      // exist, so it wins; the trailing comment fills in the rest.
      brief,
      detail: tags?.brief ? (tags.detail ?? '') : '',
      line: chunk.line,
    };
    members.push(member);
    fillBrief(member, chunk.trailingOwn[0]);
  }
  return members;
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

    // An enum's members are its usable content, and they are not reachable by
    // scanning: without the body parse below, a member's own doc comment leads
    // `readDeclaration` into the initialiser and yields artefacts such as a
    // "function" named after the `BIT` macro. Parsing the body and then
    // skipping past it replaces those with real `enumvalue` records.
    if (parsed.kind === 'enum' && decl.text.includes('{')) {
      const enumBody = readEnumBody(lines, decl.line);
      if (enumBody) {
        for (const member of parseEnumMembers(enumBody.body, enumBody.line)) {
          const memberSymbol: ApiSymbol = {
            name: member.name,
            kind: 'enumvalue',
            signature: member.value ? `${member.name} = ${member.value}` : member.name,
            params: [],
            returns: [],
            retvals: [],
            header,
            line: member.line + 1,
            deprecated: false,
            parentSymbol: parsed.name,
          };
          if (member.brief) memberSymbol.brief = member.brief;
          if (member.detail) memberSymbol.detail = member.detail;
          if (group) memberSymbol.group = group;
          symbols.push(memberSymbol);
        }
        i = enumBody.endLine;
      }
    }
  }

  return { symbols, groups };
}
