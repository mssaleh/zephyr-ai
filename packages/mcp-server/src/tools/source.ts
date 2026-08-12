/**
 * Read a file from the indexed Zephyr tree.
 *
 * The other tools are a symbol oracle: they answer "does this exist, what is it,
 * what does it depend on". Board DTS files, SoC Kconfig, runner scripts, and
 * driver implementations are none of those, and fetching them from GitHub means
 * fetching `main` — which is exactly the version drift this server exists to
 * prevent.
 *
 * Content comes from `git show <indexed-commit>:<path>` rather than from the
 * working tree, so a checkout that has moved on since the index was built still
 * yields the revision the rest of the index describes.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

import { clampLimit } from '../db.ts';
import { ToolError } from '../protocol.ts';
import { type ToolFactory, fenceLang, requireString, result } from './common.ts';

const DEFAULT_MAX_CHARS = 20000;
const HARD_MAX_CHARS = 80000;
/** Refuse to buffer a pathologically large blob before slicing it. */
const MAX_BYTES = 16 * 1024 * 1024;

function git(root: string, args: string[]): string | null {
  const out = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: MAX_BYTES,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return out.status === 0 ? out.stdout : null;
}

/**
 * Reduce a caller-supplied path to a tree-relative one, or refuse it.
 *
 * An absolute path inside the tree is accepted and rewritten, because a model
 * that has just read a `header:line` reference from another tool will paste
 * exactly that. Anything that leaves the tree is refused rather than clamped.
 */
export function treeRelative(requested: string, root: string | null): string {
  const value = requested.replace(/\\/g, '/').trim();
  let rel = value;

  if (isAbsolute(value)) {
    if (!root) {
      throw new ToolError(
        `"${requested}" is an absolute path, but the indexed Zephyr tree is not available on this machine, ` +
          'so it cannot be interpreted. Pass a tree-relative path such as "include/zephyr/drivers/gpio.h".',
      );
    }
    const inside = relative(root, resolve(value));
    if (inside === '' || inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) {
      throw new ToolError(`"${requested}" is outside the indexed Zephyr tree.`);
    }
    rel = inside.split(sep).join('/');
  }

  rel = rel.replace(/^\.\//, '').replace(/\/+$/, '');
  if (rel === '') throw new ToolError('The "path" argument must name a file in the Zephyr tree.');
  if (rel.split('/').includes('..')) {
    throw new ToolError(`"${requested}" must not contain ".." segments.`);
  }
  return rel;
}

/** A tree's remote never changes while the server runs, so ask git once. */
const slugCache = new Map<string, string | null>();

/** `owner/repo` for the tree's origin remote, for a citable reference. */
function repoSlug(root: string | null, sourceKind: string): string | null {
  const key = `${root ?? ''}\0${sourceKind}`;
  const cached = slugCache.get(key);
  if (cached !== undefined) return cached;

  const url = root ? git(root, ['remote', 'get-url', 'origin'])?.trim() : null;
  const matched = url?.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/);
  // A pinned index is fetched from upstream by construction, so its identity is
  // known even when the checkout is not present to be asked.
  const slug = matched
    ? `${matched[1]}/${matched[2]}`
    : sourceKind === 'pinned-upstream'
      ? 'zephyrproject-rtos/zephyr'
      : null;
  slugCache.set(key, slug);
  return slug;
}

function reference(
  slug: string | null,
  commit: string,
  path: string,
  range: { start: number; end: number } | null,
): string {
  const anchor = range ? `#L${range.start}-L${range.end}` : '';
  return `${slug ? `${slug}@` : ''}${commit.slice(0, 8)}:${path}${anchor}`;
}

export const getSource: ToolFactory = (index) => ({
  name: 'get_source',
  title: 'Read Zephyr source at the indexed revision',
  description:
    'Read a file from the indexed Zephyr tree at the exact commit the index was built from. Use ' +
    'when a symbol lookup is not enough and you need the source itself: a board .dts, an SoC ' +
    'Kconfig, a driver implementation, a linker script, a runner script. Prefer get_binding, ' +
    'get_kconfig, and get_api first — they answer faster and more precisely. Reach for this for ' +
    'what they do not model, instead of fetching the file from GitHub, where the default branch ' +
    'is a different Zephyr from the one being built against.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description:
          'Path relative to the Zephyr tree root, e.g. "boards/st/nucleo_f401re/nucleo_f401re.dts" ' +
          'or "include/zephyr/drivers/gpio.h". An absolute path inside the indexed tree is also accepted.',
      },
      start: {
        type: 'integer',
        minimum: 1,
        description: 'First line to return, 1-based and inclusive. Defaults to the start of the file.',
      },
      end: {
        type: 'integer',
        minimum: 1,
        description: 'Last line to return, 1-based and inclusive. Defaults to the end of the file.',
      },
      max_chars: {
        type: 'integer',
        minimum: 1,
        maximum: HARD_MAX_CHARS,
        default: DEFAULT_MAX_CHARS,
        description: `Truncate the returned content at roughly this many characters (default ${DEFAULT_MAX_CHARS}).`,
      },
    },
    required: ['path'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const idx = index();
    const commit = idx.meta['zephyr_commit'] ?? idx.descriptor.zephyrCommit;
    const configuredRoot = idx.meta['source_path'] ?? idx.descriptor.zephyrRoot;
    const root = configuredRoot && existsSync(configuredRoot) ? realpathSync(configuredRoot) : null;

    const path = treeRelative(requireString(args, 'path'), root);
    const slug = repoSlug(root, idx.descriptor.sourceKind);
    const maxChars = clampLimit(args['max_chars'], DEFAULT_MAX_CHARS, HARD_MAX_CHARS);

    const requestedStart = args['start'] === undefined ? undefined : clampLimit(args['start'], 1, 1_000_000);
    const requestedEnd = args['end'] === undefined ? undefined : clampLimit(args['end'], 1, 1_000_000);
    if (requestedStart !== undefined && requestedEnd !== undefined && requestedEnd < requestedStart) {
      throw new ToolError(`"end" (${requestedEnd}) is before "start" (${requestedStart}).`);
    }

    if (!root) {
      // The index describes a tree this machine does not have. A pinned
      // reference is still a complete answer to "which revision", which is the
      // half that produces wrong firmware when it is guessed.
      return result(
        `The indexed Zephyr tree is not available on this machine, so its files cannot be read here.\n\n` +
          `Reference this exact revision instead:\n\n\`${reference(slug, commit, path, null)}\`\n\n` +
          `_Indexed Zephyr ${idx.meta['zephyr_version'] ?? 'unknown'} at commit \`${commit}\`. ` +
          'Anything fetched from a default branch describes a different Zephyr._',
        { path, found: false, treeAvailable: false, commit, reference: reference(slug, commit, path, null) },
      );
    }

    // `git show` reads the object database, so the answer is the indexed
    // revision even when the working tree has been updated since.
    const kind = git(root, ['cat-file', '-t', `${commit}:${path}`])?.trim();
    let text: string | null = null;
    let atCommit = false;

    if (kind === 'blob') {
      text = git(root, ['cat-file', '-p', `${commit}:${path}`]);
      atCommit = text !== null;
    } else if (kind === 'tree') {
      throw new ToolError(
        `"${path}" is a directory in the indexed tree, not a file. Name a file inside it.`,
      );
    }

    if (text === null) {
      // Not a Git checkout, or the commit is absent from it. The file on disk is
      // still the tree the index was built from, but it cannot be proven to
      // match the commit, so the answer says so rather than implying it does.
      const absolute = join(root, path);
      let resolved: string;
      try {
        resolved = realpathSync(absolute);
      } catch {
        throw new ToolError(
          `"${path}" does not exist in the indexed Zephyr ${idx.meta['zephyr_version'] ?? ''} tree. ` +
            'Check the path against search_boards, search_samples, or the header reported by get_api.',
        );
      }
      const escaped = relative(root, resolved);
      if (escaped === '..' || escaped.startsWith(`..${sep}`) || isAbsolute(escaped)) {
        throw new ToolError(`"${path}" resolves outside the indexed Zephyr tree.`);
      }
      if (!statSync(resolved).isFile()) {
        throw new ToolError(`"${path}" is not a regular file in the indexed tree.`);
      }
      if (statSync(resolved).size > MAX_BYTES) {
        throw new ToolError(`"${path}" is too large to return. Request a line range with "start" and "end".`);
      }
      text = readFileSync(resolved, 'utf8');
    }

    if (text.includes('\0')) {
      throw new ToolError(`"${path}" is a binary file and has no useful text representation.`);
    }

    const lines = text.split('\n');
    // A trailing newline yields an empty final element that is not a line.
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    const total = lines.length;

    const start = Math.min(requestedStart ?? 1, total);
    const end = Math.min(requestedEnd ?? total, total);
    if (requestedStart !== undefined && requestedStart > total) {
      throw new ToolError(`"${path}" has ${total} lines; "start" (${requestedStart}) is past the end.`);
    }

    const selected = lines.slice(start - 1, end);
    let body = selected.join('\n');
    let truncatedAt: number | null = null;
    if (body.length > maxChars) {
      let kept = 0;
      const out: string[] = [];
      for (const line of selected) {
        if (kept + line.length + 1 > maxChars) break;
        out.push(line);
        kept += line.length + 1;
      }
      body = out.join('\n');
      truncatedAt = start + out.length - 1;
    }

    const shownEnd = truncatedAt ?? end;
    const ref = reference(slug, commit, path, { start, end: shownEnd });
    const range = start === 1 && shownEnd === total ? `${total} lines` : `lines ${start}–${shownEnd} of ${total}`;

    const text_ = [
      `# \`${path}\``,
      '',
      `\`\`\`${fenceLang(path)}`,
      body,
      '```',
      '',
      truncatedAt !== null
        ? `_Truncated at ${maxChars} characters. Request the rest with \`start: ${shownEnd + 1}\`._`
        : '',
      `_\`${ref}\` — ${range}._`,
      atCommit
        ? `_Content read from the indexed commit \`${commit}\`, not from the working tree._`
        : `_Content read from the tree on disk. It could not be verified against the indexed commit \`${commit}\`; run index_status to check whether the tree has drifted._`,
    ]
      .filter((part, i, all) => part !== '' || (i > 0 && all[i - 1] !== ''))
      .join('\n');

    return result(text_, {
      path,
      found: true,
      treeAvailable: true,
      commit,
      reference: ref,
      start,
      end: shownEnd,
      totalLines: total,
      truncated: truncatedAt !== null,
      verifiedAtCommit: atCommit,
      content: body,
    });
  },
});
