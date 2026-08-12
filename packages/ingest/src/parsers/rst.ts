/**
 * reStructuredText parser, tuned for the Zephyr documentation set.
 *
 * The goal is not a faithful RST implementation — it is retrieval. Pages are
 * split at section headings so a search can return the paragraph that answers a
 * question instead of a 3 000-line page, and Sphinx markup is reduced to plain
 * text so BM25 ranks on prose rather than on role syntax.
 *
 * Code blocks are preserved deliberately: for firmware work the sample snippet
 * inside a doc page is often the most useful thing on it.
 */

/** Punctuation characters Sphinx accepts as section underlines. */
const ADORNMENT = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export interface DocChunk {
  /** Sphinx label (`.. _sensor-using:`) attached to this section, if any. */
  anchor?: string;
  heading: string;
  /** Headings from the page title down to this section. */
  headingPath: string[];
  ord: number;
  body: string;
}

export interface ParsedDoc {
  title: string;
  /** Every `.. _label:` defined on the page. */
  labels: string[];
  chunks: DocChunk[];
}

interface Heading {
  line: number;
  text: string;
  char: string;
  overlined: boolean;
}

function isAdornmentLine(line: string): { char: string; length: number } | null {
  const trimmed = line.trimEnd();
  if (trimmed.length < 2) return null;
  const char = trimmed[0]!;
  if (!ADORNMENT.includes(char)) return null;
  for (const ch of trimmed) {
    if (ch !== char) return null;
  }
  return { char, length: trimmed.length };
}

/** Locate section headings and the adornment character each level uses. */
function findHeadings(lines: string[]): Heading[] {
  const headings: Heading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rule = isAdornmentLine(lines[i]!);
    if (!rule) continue;

    const prev = lines[i - 1];
    if (prev === undefined) continue;
    const text = prev.trim();

    // An underline must be at least as long as the text it underlines. A blank
    // previous line means this is an overline (or a transition, which we skip).
    if (text === '' || rule.length < text.length) continue;
    // Guard against list markers and tables being read as underlines.
    if (isAdornmentLine(prev)) {
      const over = isAdornmentLine(lines[i - 2] ?? '');
      if (over) continue;
      continue;
    }

    const overRule = isAdornmentLine(lines[i - 2] ?? '');
    const overlined = overRule !== null && overRule.char === rule.char;

    headings.push({ line: i - 1, text, char: rule.char, overlined });
  }

  return headings;
}

/**
 * Assign a depth to each heading.
 *
 * RST has no fixed adornment order: the hierarchy is whatever order the
 * characters first appear in, and an overlined heading always outranks a
 * plain-underlined one using the same character.
 */
function assignLevels(headings: Heading[]): number[] {
  const order: string[] = [];
  return headings.map((h) => {
    const key = h.overlined ? `over:${h.char}` : h.char;
    let idx = order.indexOf(key);
    if (idx === -1) {
      idx = order.length;
      order.push(key);
    }
    return idx;
  });
}

const LABEL_RE = /^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;

/**
 * Reduce Sphinx inline markup and block directives to plain text.
 *
 * Directives that carry no retrievable meaning (`toctree`, `figure`, `only`)
 * are dropped entirely; `code-block` bodies are kept and fenced.
 */
export function cleanRst(text: string): string {
  const lines = text.split('\n');
  // Segments are tagged so inline cleaning can skip code: the ``literal``
  // rule would otherwise chew the backticks off a ```c fence.
  const out: { code: boolean; text: string }[] = [];
  const emit = (text: string) => out.push({ code: false, text });

  const DROP_DIRECTIVES = new Set([
    'toctree',
    'figure',
    'image',
    'only',
    'contents',
    'highlight',
    'raw',
    'graphviz',
    'index',
    'rst-class',
    'sectionauthor',
    'zephyr:board',
    'zephyr:board-supported-hw',
    'zephyr:board-supported-runners',
    'zephyr:code-sample-category',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // `.. _label:` targets and comments carry no prose.
    if (LABEL_RE.test(line)) continue;

    const directive = line.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);
    if (directive) {
      const [, indentRaw = '', nameRaw = '', argRaw = ''] = directive;
      const indent = indentRaw.length;
      const name = nameRaw.toLowerCase();

      // Consume the directive's indented body.
      const body: string[] = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const l = lines[j]!;
        if (l.trim() === '') {
          body.push('');
          continue;
        }
        const ind = l.match(/^\s*/)![0].length;
        if (ind <= indent) break;
        body.push(l);
      }

      if (DROP_DIRECTIVES.has(name)) {
        i = j - 1;
        continue;
      }

      if (name === 'code-block' || name === 'code' || name === 'literalinclude') {
        const lang = argRaw.trim();
        const dedented = dedent(body).join('\n').replace(/^\n+|\n+$/g, '');
        if (dedented) {
          out.push({ code: true, text: `\`\`\`${lang}\n${dedented}\n\`\`\`` });
        }
        i = j - 1;
        continue;
      }

      if (name === 'note' || name === 'warning' || name === 'important' || name === 'tip') {
        const dedented = dedent(body).join('\n').trim();
        if (dedented) emit(`${nameRaw.toUpperCase()}: ${dedented}`);
        i = j - 1;
        continue;
      }

      // Unknown directive: keep its argument and body as plain text.
      if (argRaw.trim()) emit(argRaw.trim());
      for (const l of dedent(body)) emit(l);
      i = j - 1;
      continue;
    }

    // Field lists inside directives (`:maxdepth: 2`) are noise on their own line.
    if (/^\s*:[a-z-]+:\s*\S*\s*$/i.test(line) && !line.includes(' ')) continue;

    emit(line);
  }

  return out
    .map((seg) => (seg.code ? seg.text : cleanInline(seg.text)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Strip the common leading indentation from a directive body. */
function dedent(lines: string[]): string[] {
  const indents = lines
    .filter((l) => l.trim() !== '')
    .map((l) => l.match(/^\s*/)![0].length);
  const min = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((l) => (l.trim() === '' ? '' : l.slice(min)));
}

/** Reduce inline roles and literals to their text content. */
export function cleanInline(text: string): string {
  return (
    text
      // :ref:`Label <target>` -> Label ; :ref:`target` -> target
      .replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi, '$1')
      .replace(/:[a-z:+-]+:`([^`]*)`/gi, '$1')
      // ``literal`` -> literal
      .replace(/``([^`]+)``/g, '$1')
      // `text`_ hyperlink references
      .replace(/`([^`]+)`__?/g, '$1')
      // **strong** / *emphasis* markers add nothing to a text index
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Substitution references |zephyr-version|
      .replace(/\|([A-Za-z0-9_-]+)\|/g, '$1')
      // Trailing `::` that introduces a literal block
      .replace(/::\s*$/gm, ':')
  );
}

export function parseRst(text: string): ParsedDoc {
  const source = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const lines = source.split('\n');

  const labels: string[] = [];
  for (const line of lines) {
    const m = line.match(LABEL_RE);
    if (m) labels.push(m[1]!.trim());
  }

  const headings = findHeadings(lines);
  const levels = assignLevels(headings);

  if (headings.length === 0) {
    const body = cleanRst(source);
    return {
      title: '',
      labels,
      chunks: body ? [{ heading: '', headingPath: [], ord: 0, body }] : [],
    };
  }

  const title = headings[0]!.text;
  const chunks: DocChunk[] = [];
  const pathStack: { level: number; text: string }[] = [];

  for (let h = 0; h < headings.length; h++) {
    const heading = headings[h]!;
    const level = levels[h]!;
    const next = headings[h + 1];

    while (pathStack.length > 0 && pathStack[pathStack.length - 1]!.level >= level) {
      pathStack.pop();
    }
    pathStack.push({ level, text: heading.text });

    // Body runs from just after the underline to just before the next heading
    // (or its overline, if it has one).
    const bodyStart = heading.line + 2;
    const bodyEnd = next ? next.line - (next.overlined ? 1 : 0) : lines.length;
    const raw = lines.slice(bodyStart, Math.max(bodyStart, bodyEnd)).join('\n');
    const body = cleanRst(raw);

    // The label immediately preceding a heading is that section's anchor.
    const anchor = findPrecedingLabel(lines, heading.line - (heading.overlined ? 1 : 0));

    if (body || h === 0) {
      chunks.push({
        ...(anchor ? { anchor } : {}),
        heading: heading.text,
        headingPath: pathStack.map((p) => p.text),
        ord: chunks.length,
        body,
      });
    }
  }

  return { title, labels, chunks };
}

function findPrecedingLabel(lines: string[], headingLine: number): string | undefined {
  for (let i = headingLine - 1; i >= 0 && i >= headingLine - 4; i--) {
    const line = lines[i]!;
    if (line.trim() === '') continue;
    const m = line.match(LABEL_RE);
    if (m) return m[1]!.trim();
    return undefined;
  }
  return undefined;
}
