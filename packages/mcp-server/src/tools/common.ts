import type { Index, Row } from '../db.ts';
import { type Tool, ToolError, type ToolResult } from '../protocol.ts';

export type ToolFactory = (index: () => Index) => Tool;

/**
 * Build a tool result.
 *
 * Every tool returns human-readable Markdown as its primary content and the
 * same facts as `structuredContent`. No tool declares an `outputSchema`: the
 * spec makes it optional, and declaring one commits the server to schema
 * validation on every response for a benefit the Markdown already provides.
 */
export function result(text: string, structured?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text', text }],
    ...(structured ? { structuredContent: structured } : {}),
  };
}

export function requireString(args: Record<string, unknown>, name: string): string {
  const value = args[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ToolError(`The "${name}" argument is required and must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalString(args: Record<string, unknown>, name: string): string | undefined {
  const value = args[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** A "no results" answer that tells the model what to try instead. */
export function noResults(what: string, query: string, hint: string): ToolResult {
  return result(`No ${what} matched "${query}".\n\n${hint}`, { results: [], query });
}

/**
 * Names sharing the longest available prefix with `value`.
 *
 * Full-text search cannot reach a single-character typo: `BT_PERIPHERL` is not a
 * prefix of `BT_PERIPHERAL`, so the AND and prefix variants miss and the OR
 * variant returns whichever `BT_*` symbols rank highest — in practice the
 * generated logging family. Backing off one character at a time finds the real
 * neighbours, which `relevantSuggestions` then filters.
 */
export function prefixCandidates(
  all: (sql: string, ...params: unknown[]) => Row[],
  sql: string,
  value: string,
  column: string,
  minimum = 3,
): string[] {
  for (let length = Math.min(value.length, 24); length >= minimum; length--) {
    const rows = all(sql, `${value.slice(0, length).replace(/[%_]/g, '\\$&')}%`);
    if (rows.length > 0) return rows.map((row) => String(row[column]));
  }
  return [];
}

/**
 * Keep typo suggestions conservative. A semantically unrelated rename is more
 * damaging than returning no suggestion, especially for generated Kconfig
 * families and vendor-prefixed compatibles.
 */
export function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0]!;
    previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j]!;
      previous[j] = Math.min(
        previous[j]! + 1,
        previous[j - 1]! + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length]!;
}

export function relevantSuggestions(requested: string, candidates: string[]): string[] {
  const normalise = (value: string) =>
    value
      .replace(/^CONFIG_/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const distance = editDistance;
  const needle = normalise(requested);
  if (needle.length < 3) return [];
  return candidates.filter((candidate) => {
    const value = normalise(candidate);
    if (value.length < 3) return false;
    const edits = distance(needle, value);
    const maxLength = Math.max(needle.length, value.length);
    return edits <= 2 && 1 - edits / maxLength >= 0.72;
  });
}

/**
 * An honest catalogue-scoped miss, without claiming global absence.
 *
 * Split from `catalogueMiss` because a batch lookup must report a miss on one
 * item and carry on: throwing would discard the answers for everything else in
 * the same call, which is the cost that made one-fact-per-call lose to a shell
 * loop in the first place.
 */
export function catalogueMissText(
  kind: string,
  requested: string,
  version: string,
  suggestions: string[] = [],
  coverageNote = 'Generated, application-local, and external-module declarations may not be covered.',
): string {
  const close = relevantSuggestions(requested, suggestions);
  return (
    `${kind} "${requested}" was not found in the indexed Zephyr ${version} catalogue. ` +
    coverageNote +
    (close.length > 0
      ? `\n\nClose spelling matches:\n${close.map((value) => `- \`${value}\``).join('\n')}`
      : '\n\nNo sufficiently close spelling match was found.')
  );
}

/** Render an honest catalogue-scoped miss without claiming global absence. */
export function catalogueMiss(
  kind: string,
  requested: string,
  version: string,
  suggestions: string[] = [],
  coverageNote = 'Generated, application-local, and external-module declarations may not be covered.',
): never {
  throw new ToolError(catalogueMissText(kind, requested, version, suggestions, coverageNote));
}

/**
 * Resolve an argument that accepts one value or many.
 *
 * The schema validator has no `anyOf`, so "exactly one of these" is enforced
 * here — the same division `get_board` already uses for its name/board pair.
 * Duplicates are collapsed: a repeated name in a batch spends the character
 * budget twice for one fact.
 */
export function oneOrMany(
  args: Record<string, unknown>,
  singular: string,
  plural: string,
): { values: string[]; batched: boolean } {
  const many = args[plural];
  if (many !== undefined) {
    if (args[singular] !== undefined) {
      throw new ToolError(`Supply "${singular}" or "${plural}", not both.`);
    }
    const values = (many as unknown[])
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value !== '');
    if (values.length === 0) {
      throw new ToolError(`"${plural}" must contain at least one non-empty name.`);
    }
    return { values: [...new Set(values)], batched: true };
  }
  return { values: [requireString(args, singular)], batched: false };
}

export interface BatchEntry {
  key: string;
  text: string;
  structured: Record<string, unknown>;
}

/**
 * Assemble a batched answer under a character budget.
 *
 * Everything requested reaches `structuredContent`; only the Markdown is
 * budgeted, and what it drops it names. A batch that quietly rendered the first
 * dozen entries would read as the complete answer, which is the failure mode
 * that made an unrendered platform list into a confident false claim.
 */
export function batchResult(entries: BatchEntry[], maxChars: number): ToolResult {
  const rendered: BatchEntry[] = [];
  const omitted: string[] = [];
  let size = 0;
  for (const entry of entries) {
    if (rendered.length > 0 && size + entry.text.length > maxChars) {
      omitted.push(entry.key);
      continue;
    }
    rendered.push(entry);
    size += entry.text.length;
  }

  const text = joinSections([
    ...rendered.map((entry) => entry.text),
    omitted.length > 0
      ? `_Requested but not rendered, to stay within ${maxChars} characters: ` +
        `${omitted.map((key) => `\`${key}\``).join(', ')}. Ask for them in a smaller batch._`
      : undefined,
  ]);

  return result(text, {
    requested: entries.length,
    rendered: rendered.length,
    omitted,
    results: entries.map((entry) => entry.structured),
  });
}

/** Maximum items a single batched lookup accepts. */
export const BATCH_MAX_ITEMS = 50;

/** Character budget for a batched answer's Markdown. */
export const BATCH_MAX_CHARS = 40000;

export function batchSchema(description: string): Record<string, unknown> {
  return {
    type: 'array',
    items: { type: 'string' },
    minItems: 1,
    maxItems: BATCH_MAX_ITEMS,
    description,
  };
}

/**
 * Blank out comment bodies, preserving length and line breaks.
 *
 * Length is preserved because callers report the line a finding sits on, and a
 * comment that shortened the text would move every line after it.
 */
export function blankComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
}

/** Language hint for fencing a file from the Zephyr tree. */
export function fenceLang(path: string): string {
  if (path.endsWith('.c') || path.endsWith('.h')) return 'c';
  if (path.endsWith('.cpp') || path.endsWith('.hpp')) return 'cpp';
  if (path.endsWith('.overlay') || path.endsWith('.dts') || path.endsWith('.dtsi')) return 'dts';
  if (path.endsWith('.conf') || path.endsWith('_defconfig')) return 'kconfig';
  if (path.endsWith('CMakeLists.txt') || path.endsWith('.cmake')) return 'cmake';
  if (path.endsWith('.yaml') || path.endsWith('.yml')) return 'yaml';
  if (path.endsWith('.py')) return 'python';
  if (path.endsWith('.sh')) return 'bash';
  if (path.endsWith('.rst')) return 'rst';
  if (path.endsWith('.ld') || path.endsWith('.S') || path.endsWith('.s')) return '';
  return '';
}

/**
 * Render a list of names, naming the remainder instead of dropping it quietly.
 *
 * A capped list that does not say it was capped reads as the whole set. That is
 * how an unrendered `platform_allow` became a confident claim that no upstream
 * sample named a board that seven of them name.
 */
export function boundedList(values: string[], max: number): string {
  const shown = values
    .slice(0, max)
    .map((value) => `\`${value}\``)
    .join(', ');
  const rest = values.length - max;
  return rest > 0 ? `${shown} — and ${rest} more, ${values.length} in total` : shown;
}

export const STRING = { type: 'string' } as const;

export function limitSchema(fallback: number, max = 50): Record<string, unknown> {
  return {
    type: 'integer',
    minimum: 1,
    maximum: max,
    default: fallback,
    description: `Maximum results to return (default ${fallback}, max ${max}).`,
  };
}

/** Render a labelled list, skipping empty entries. */
export function section(title: string, lines: string[]): string {
  const kept = lines.filter((l) => l.trim() !== '');
  return kept.length === 0 ? '' : `**${title}**\n${kept.map((l) => `- ${l}`).join('\n')}`;
}

export function joinSections(parts: (string | undefined)[]): string {
  return parts.filter((p): p is string => Boolean(p && p.trim())).join('\n\n');
}
