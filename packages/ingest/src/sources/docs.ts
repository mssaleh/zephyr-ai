import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { type DocChunk, parseRst } from '../parsers/rst.ts';
import { walk } from '../walk.ts';

export interface DocPage {
  /** Tree-relative source path, e.g. `doc/services/sensor/index.rst`. */
  path: string;
  /** Published URL on docs.zephyrproject.org for the indexed version. */
  url: string;
  title: string;
  /** Top-level documentation area (`services`, `connectivity`, `boards`, ...). */
  area: string;
  labels: string[];
  chunks: DocChunk[];
}

/** Directories under `doc/` that hold build machinery rather than content. */
const DOC_SKIP = new Set([
  '_build',
  '_static',
  '_scripts',
  '_extensions',
  '_templates',
  '_doxygen',
  'images',
  'build',
  'node_modules',
  '.git',
]);

/**
 * Map a source path to its published URL.
 *
 * Board documentation is built into the same tree at its repository path, so
 * `boards/st/nucleo_h743zi/doc/index.rst` publishes at
 * `<base>boards/st/nucleo_h743zi/doc/index.html`.
 */
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

function collectFrom(root: string, subdir: string, baseUrl: string): DocPage[] {
  const pages: DocPage[] = [];
  const base = join(root, subdir);

  for (const rel of walk(base, {
    skipDirs: DOC_SKIP,
    match: (name) => name.endsWith('.rst'),
  })) {
    const relPath = `${subdir}/${rel}`;
    let text: string;
    try {
      text = readFileSync(join(base, rel), 'utf8');
    } catch {
      continue;
    }

    const parsed = parseRst(text);
    if (parsed.chunks.length === 0) continue;

    pages.push({
      path: relPath,
      url: docUrl(relPath, baseUrl),
      title: parsed.title || titleFromPath(relPath),
      area: areaOf(relPath),
      labels: parsed.labels,
      chunks: parsed.chunks,
    });
  }

  return pages;
}

/**
 * Collect the documentation set.
 *
 * Board documentation (1 084 pages carrying pinouts, jumper settings, and
 * per-board flashing instructions) lives under `boards/`, not `doc/`, and is
 * some of the most directly actionable prose in the tree — so both are indexed.
 */
export function collectDocs(root: string, baseUrl: string): DocPage[] {
  return [...collectFrom(root, 'doc', baseUrl), ...collectFrom(root, 'boards', baseUrl)];
}
