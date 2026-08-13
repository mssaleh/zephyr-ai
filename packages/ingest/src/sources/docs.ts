import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

import { type DocChunk, parseRst } from '../parsers/rst.ts';
import type { SourceReport } from '../report.ts';
import { walk } from '../walk.ts';

export interface DocOrigin {
  path: string;
  startLine: number;
  endLine: number;
  directive: 'page' | 'include' | 'literalinclude';
}

export interface DocPage {
  path: string;
  url: string;
  title: string;
  area: string;
  labels: string[];
  chunks: DocChunk[];
  origins: DocOrigin[];
}

export interface CollectedDocs {
  pages: DocPage[];
  report: SourceReport;
}

const DOC_SKIP = new Set([
  '_build',
  '_static',
  '_scripts',
  '_extensions',
  '_templates',
  '_doxygen',
  'images',
  'node_modules',
  '.git',
]);

export function docUrl(relPath: string, baseUrl: string): string {
  const withoutExt = relPath.replace(/\.rst$/, '');
  const trimmed = withoutExt.startsWith('doc/') ? withoutExt.slice('doc/'.length) : withoutExt;
  return `${baseUrl.replace(/\/?$/, '/')}${trimmed}.html`;
}

function titleFromPath(relPath: string): string {
  const parts = relPath.split('/');
  const base = parts[parts.length - 1]!.replace(/\.rst$/, '');
  if (base !== 'index') return base.replace(/[_-]/g, ' ');
  return (parts[parts.length - 2] ?? base).replace(/[_-]/g, ' ');
}

function areaOf(relPath: string): string {
  if (relPath.startsWith('boards/')) return 'boards';
  const parts = relPath.split('/');
  if (parts[0] === 'doc') return parts.length > 2 ? parts[1]! : 'index';
  return parts[0] ?? 'other';
}

/**
 * Preserve the useful part of structural landing pages.  Zephyr has a small
 * number of pages whose entire body is a Sphinx toctree.  Dropping those pages
 * loses their stable URL and makes corpus coverage appear incomplete, while
 * indexing the directive syntax itself only adds search noise.  Turn the
 * entries into a compact, retrievable navigation summary instead.
 */
function toctreeNavigation(text: string): string[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const entries: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const directive = lines[index]!.match(/^(\s*)\.\.\s+toctree::\s*$/);
    if (!directive) continue;
    const indent = directive[1]!.length;
    for (index += 1; index < lines.length; index++) {
      const line = lines[index]!;
      if (line.trim() === '') continue;
      const lineIndent = line.match(/^\s*/)![0].length;
      if (lineIndent <= indent) {
        index -= 1;
        break;
      }
      const value = line.trim();
      if (value.startsWith(':')) continue;
      const titled = value.match(/^(.+?)\s*<([^>]+)>$/);
      const target = (titled?.[2] ?? value).replace(/\.rst$/, '');
      const label = titled?.[1]?.trim() || target
        .split('/')
        .filter(Boolean)
        .at(-1)
        ?.replace(/^index$/, target.split('/').at(-2) ?? 'index')
        .replace(/[_-]/g, ' ');
      if (target && label) entries.push(`${label} (${target})`);
    }
  }
  return [...new Set(entries)];
}

function optionMap(lines: string[]): Record<string, string> {
  return Object.fromEntries(
    lines.flatMap((line) => {
      const match = line.trim().match(/^:([a-z-]+):\s*(.*)$/i);
      return match ? [[match[1]!, match[2]!]] : [];
    }),
  );
}

function sliceIncluded(text: string, options: Record<string, string>): { text: string; start: number; end: number } {
  let lines = text.replace(/\r\n?/g, '\n').split('\n');
  let start = 1;
  let end = lines.length;
  const startLine = Number(options['start-line']);
  const endLine = Number(options['end-line']);
  if (Number.isInteger(startLine) && startLine >= 1) start = startLine;
  if (Number.isInteger(endLine) && endLine >= start) end = Math.min(endLine, lines.length);
  const startMarker = options['start-after'] ?? options['start-at'];
  if (startMarker) {
    const index = lines.findIndex((line) => line.includes(startMarker));
    if (index < 0) throw new Error(`start marker not found: ${startMarker}`);
    start = index + (options['start-after'] ? 2 : 1);
  }
  const endMarker = options['end-before'] ?? options['end-at'];
  if (endMarker) {
    const index = lines.findIndex((line, lineIndex) => lineIndex >= start - 1 && line.includes(endMarker));
    if (index < 0) throw new Error(`end marker not found: ${endMarker}`);
    end = index + (options['end-at'] ? 1 : 0);
  }
  lines = lines.slice(start - 1, end);
  return { text: lines.join('\n'), start, end };
}

function preprocessRst(
  treeRoot: string,
  sourcePath: string,
  text: string,
  origins: DocOrigin[],
  stack: string[] = [],
): string {
  const canonical = realpathSync(sourcePath);
  if (stack.includes(canonical)) {
    throw new Error(`include cycle: ${[...stack, canonical].map((path) => relative(treeRoot, path)).join(' -> ')}`);
  }
  const nextStack = [...stack, canonical];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const directive = line.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);
    if (!directive) {
      out.push(line);
      continue;
    }
    const indent = directive[1]!.length;
    const kind = directive[2]! as 'include' | 'literalinclude' | 'only';
    const argument = directive[3]!.trim();
    const body: string[] = [];
    let cursor = index + 1;
    for (; cursor < lines.length; cursor++) {
      const candidate = lines[cursor]!;
      if (candidate.trim() === '') {
        body.push(candidate);
        continue;
      }
      if (candidate.match(/^\s*/)![0].length <= indent) break;
      body.push(candidate);
    }
    index = cursor - 1;

    if (kind === 'only') {
      if (/\bhtml\b/.test(argument)) {
        const dedented = body.map((value) => (value.trim() ? value.slice(Math.min(value.length, indent + 3)) : ''));
        const nested = preprocessRst(treeRoot, canonical, dedented.join('\n'), origins, stack);
        out.push(...nested.split('\n').map((value) => `${' '.repeat(indent)}${value}`));
      }
      continue;
    }

    const options = optionMap(body);
    const candidate = resolve(dirname(canonical), argument);
    if (!existsSync(candidate)) throw new Error(`include target not found: ${argument}`);
    if (lstatSync(candidate).isSymbolicLink()) {
      throw new Error(`include target is a symbolic link: ${argument}`);
    }
    const canonicalRoot = realpathSync(treeRoot);
    const canonicalCandidate = realpathSync(candidate);
    const escaped = relative(canonicalRoot, canonicalCandidate);
    if (escaped === '..' || escaped.startsWith(`..${sep}`)) {
      throw new Error(`include escapes the Zephyr tree: ${argument}`);
    }
    const included = sliceIncluded(readFileSync(canonicalCandidate, 'utf8'), options);
    origins.push({
      path: relative(canonicalRoot, canonicalCandidate).replaceAll(sep, '/'),
      startLine: included.start,
      endLine: included.end,
      directive: kind,
    });

    if (kind === 'literalinclude') {
      const language = options['language'] ?? extname(candidate).slice(1);
      out.push(`${' '.repeat(indent)}.. code-block:: ${language}`, '', ...included.text.split('\n').map((value) => `${' '.repeat(indent + 3)}${value}`));
    } else {
      const nested = preprocessRst(canonicalRoot, canonicalCandidate, included.text, origins, nextStack);
      out.push(...nested.split('\n').map((value) => `${' '.repeat(indent)}${value}`));
    }
  }
  return out.join('\n');
}

function collectFrom(root: string, subdir: string, baseUrl: string, report: SourceReport): DocPage[] {
  const pages: DocPage[] = [];
  const base = join(root, subdir);
  // Sorted: walk() follows filesystem order, and unsorted it decided the id every
  // doc row got, so two machines produced the same pages in different positions.
  const found = [
    ...walk(base, { skipDirs: DOC_SKIP, match: (name) => name.endsWith('.rst') }),
  ].sort();
  for (const rel of found) {
    const relPath = `${subdir}/${rel}`;
    const absolute = join(base, rel);
    report.discovered++;
    try {
      const source = readFileSync(absolute, 'utf8');
      const origins: DocOrigin[] = [{
        path: relPath,
        startLine: 1,
        endLine: source.split(/\r?\n/).length,
        directive: 'page',
      }];
      const expanded = preprocessRst(root, absolute, source, origins);
      const parsed = parseRst(expanded);
      let chunks = parsed.chunks
        .filter((chunk) => chunk.body.trim() !== '')
        .map((chunk, ord) => ({ ...chunk, ord }));
      if (chunks.length === 0) {
        const entries = toctreeNavigation(expanded);
        if (entries.length > 0) {
          const title = parsed.title || titleFromPath(relPath);
          chunks = [{
            heading: title,
            headingPath: [title],
            ord: 0,
            body: `Contained documentation pages:\n${entries.map((entry) => `- ${entry}`).join('\n')}`,
          }];
        }
      }
      if (chunks.length === 0) {
        report.intentionallyExcluded.push({ path: relPath, reason: 'no-retrievable-content' });
        continue;
      }
      pages.push({
        path: relPath,
        url: docUrl(relPath, baseUrl),
        title: parsed.title || titleFromPath(relPath),
        area: areaOf(relPath),
        labels: parsed.labels,
        chunks,
        origins,
      });
      report.indexed++;
    } catch (error) {
      report.errors.push({ path: relPath, code: 'rst-preprocess', message: (error as Error).message });
    }
  }
  return pages;
}

export function collectDocs(root: string, baseUrl: string): CollectedDocs {
  const report: SourceReport = {
    discovered: 0,
    indexed: 0,
    intentionallyExcluded: [],
    warnings: [],
    errors: [],
  };
  const pages = [
    ...collectFrom(root, 'doc', baseUrl, report),
    ...collectFrom(root, 'boards', baseUrl, report),
  ];
  if (report.errors.length > 0) {
    const detail = report.errors.slice(0, 12).map((error) => `${error.path}: ${error.message}`).join('\n');
    throw new Error(`Documentation preprocessing failed for ${report.errors.length} source(s).\n${detail}`);
  }
  return { pages, report };
}
