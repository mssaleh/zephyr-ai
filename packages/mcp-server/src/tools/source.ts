/**
 * Read a file from the indexed Zephyr tree, or from one of its modules.
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
 *
 * Modules are readable for the same reason the Zephyr tree is. "Does this driver
 * work on my silicon" is answered in the vendor HAL — the register definitions,
 * the CMSIS headers, the conditional compilation — for every vendor Zephyr
 * supports, and a reader who cannot reach those files falls back to a web search
 * against whatever revision the vendor's default branch happens to be. Full
 * semantic ingestion of HAL sources is a different and much larger job; reading
 * the file at the manifest's pinned revision closes most of the gap, exactly as
 * reading the Zephyr tree did.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

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

/**
 * One readable tree: the Zephyr checkout, or a module beside it.
 *
 * `prefix` is what a caller's path has to start with to mean this tree, and it
 * is empty for Zephyr itself — Zephyr paths are the unprefixed default, and
 * module paths are workspace-relative because that is how the manifest, west,
 * and every build message name them.
 */
interface ReadableTree {
  name: string;
  prefix: string;
  root: string;
  commit: string;
}

/**
 * The west workspace containing the Zephyr tree.
 *
 * Walking up for `.west/config` is what west itself does. The parent directory
 * is the fallback because the T2 star topology puts Zephyr one level down, and
 * an index built from a plain checkout still has modules beside it in practice.
 */
function workspaceRoot(zephyrRoot: string): string {
  let dir = zephyrRoot;
  for (let depth = 0; depth < 40; depth++) {
    if (existsSync(join(dir, '.west', 'config'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return dirname(zephyrRoot);
}

/**
 * Every tree this index can read, longest prefix first.
 *
 * Order matters and the Zephyr tree does not simply win: Zephyr ships its own
 * `modules/` directory of Kconfig glue, so `modules/lvgl/Kconfig` is a real file
 * in the Zephyr tree while `modules/lib/gui/lvgl/Kconfig` is a file in a module.
 * Matching the longest module prefix first and falling back to Zephyr resolves
 * both without either shadowing the other.
 */
const treeCache = new Map<string, ReadableTree[]>();

function readableTrees(idx: {
  all: (sql: string, ...params: unknown[]) => Record<string, unknown>[];
  meta: Record<string, string>;
  descriptor: { zephyrCommit: string; zephyrRoot?: string };
}, zephyrRoot: string | null): ReadableTree[] {
  const trees: ReadableTree[] = [];
  if (!zephyrRoot) return trees;
  // A manifest can declare a hundred modules, and probing each one costs a stat.
  // The workspace layout does not change while the server runs, and the server
  // is spawned per session, so this is resolved once rather than per call.
  const cached = treeCache.get(zephyrRoot);
  if (cached) return cached;
  const workspace = workspaceRoot(zephyrRoot);
  let modules: Record<string, unknown>[] = [];
  try {
    modules = idx.all(
      "SELECT name, path, revision FROM west_module WHERE path <> '' ORDER BY LENGTH(path) DESC, name",
    );
  } catch {
    // An index predating the module table simply has no modules to offer.
    modules = [];
  }
  for (const row of modules) {
    const relativePath = String(row['path']);
    const root = join(workspace, relativePath);
    if (!existsSync(root)) continue;
    trees.push({
      name: String(row['name']),
      prefix: `${relativePath.replace(/\/+$/, '')}/`,
      root: realpathSync(root),
      commit: String(row['revision'] ?? ''),
    });
  }
  trees.push({
    name: 'zephyr',
    prefix: '',
    root: zephyrRoot,
    commit: idx.meta['zephyr_commit'] ?? idx.descriptor.zephyrCommit,
  });
  treeCache.set(zephyrRoot, trees);
  return trees;
}

/** What a tool needs from the index to reach the files on disk. */
export interface TreeReader {
  all: (sql: string, ...params: unknown[]) => Record<string, unknown>[];
  meta: Record<string, string>;
  descriptor: { zephyrCommit: string; zephyrRoot?: string };
}

/**
 * Read one file out of the indexed Zephyr tree, or null.
 *
 * `get_source` renders a file for a reader: citation, line ranges, character
 * budget, and an explanation when the tree is absent. A tool that needs a fact
 * out of a header wants none of that, only the content at the indexed commit
 * with the same working-tree fallback. Splitting it here keeps the two callers
 * reading the same bytes rather than one of them reopening the question of
 * which revision it is looking at.
 */
export function readZephyrFile(idx: TreeReader, path: string): string | null {
  const configured = idx.meta['source_path'] ?? idx.descriptor.zephyrRoot;
  if (!configured || !existsSync(configured)) return null;
  const root = realpathSync(configured);
  const commit = idx.meta['zephyr_commit'] ?? idx.descriptor.zephyrCommit;

  if (commit && git(root, ['cat-file', '-t', `${commit}:${path}`])?.trim() === 'blob') {
    const text = git(root, ['cat-file', '-p', `${commit}:${path}`]);
    if (text !== null) return text;
  }

  // Not a Git checkout, or the commit is absent from it. The file on disk is
  // still the tree the index was built from; it just cannot be proven to match.
  try {
    const resolved = realpathSync(join(root, path));
    const escaped = relative(root, resolved);
    if (escaped === '..' || escaped.startsWith(`..${sep}`) || isAbsolute(escaped)) return null;
    if (!statSync(resolved).isFile() || statSync(resolved).size > MAX_BYTES) return null;
    return readFileSync(resolved, 'utf8');
  } catch {
    return null;
  }
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
    'Read a file from the indexed Zephyr tree, or from any west module beside it, at the revision ' +
    'the index was built from. Use it when a symbol lookup is not enough and you need the source: ' +
    'a board .dts, an SoC Kconfig, a driver implementation, a linker script, a runner script, or a ' +
    'vendor HAL header. A HAL header answers whether the registers a driver uses exist on your ' +
    'part. Name a module file by its workspace-relative path, for example ' +
    '"modules/hal/stm32/stm32cube/...". Try get_binding, get_kconfig, and get_api first; they are ' +
    'faster and more precise. Use this tool for what they do not cover, rather than fetching the ' +
    'file from GitHub, where the default branch is a different Zephyr version.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description:
          'Path relative to the Zephyr tree root, e.g. "boards/st/nucleo_f401re/nucleo_f401re.dts" ' +
          'or "include/zephyr/drivers/gpio.h". A module file is named by its workspace-relative ' +
          'path, e.g. "modules/hal/stm32/stm32cube/stm32n6xx/soc/stm32n657xx.h". An absolute path ' +
          'inside any of those trees is also accepted.',
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
    const configuredRoot = idx.meta['source_path'] ?? idx.descriptor.zephyrRoot;
    const zephyrRoot = configuredRoot && existsSync(configuredRoot) ? realpathSync(configuredRoot) : null;

    const requested = requireString(args, 'path');
    const trees = readableTrees(idx, zephyrRoot);

    // An absolute path is interpreted against whichever readable tree contains
    // it, so a path pasted out of a compiler error inside a module resolves the
    // same way one pasted out of a Zephyr header does.
    let tree = trees.find((candidate) => candidate.prefix === '') ?? null;
    let path: string;
    if (isAbsolute(requested.replace(/\\/g, '/').trim())) {
      const absolute = resolve(requested.replace(/\\/g, '/').trim());
      const containing = trees.find((candidate) => {
        const inside = relative(candidate.root, absolute);
        return inside !== '' && inside !== '..' && !inside.startsWith(`..${sep}`) && !isAbsolute(inside);
      });
      if (!containing) {
        path = treeRelative(requested, zephyrRoot);
      } else {
        tree = containing;
        path = relative(containing.root, absolute).split(sep).join('/');
      }
    } else {
      const relPath = treeRelative(requested, zephyrRoot);
      // Longest module prefix wins, then Zephyr. A module prefix only claims the
      // path when the file is actually there, so Zephyr's own `modules/` glue is
      // not shadowed by a module whose workspace path happens to overlap.
      const claimed = trees.find(
        (candidate) =>
          candidate.prefix !== '' &&
          relPath.startsWith(candidate.prefix) &&
          existsSync(join(candidate.root, relPath.slice(candidate.prefix.length))),
      );
      if (claimed) {
        tree = claimed;
        path = relPath.slice(claimed.prefix.length);
      } else {
        path = relPath;
      }
    }

    const root = tree?.root ?? null;
    const commit = tree?.commit || idx.descriptor.zephyrCommit;
    const inModule = Boolean(tree && tree.prefix !== '');
    /** How the caller named it, which is what a citation has to echo back. */
    const displayPath = inModule ? `${tree!.prefix}${path}` : path;
    const slug = repoSlug(root, inModule ? 'module' : idx.descriptor.sourceKind);
    const maxChars = clampLimit(args['max_chars'], DEFAULT_MAX_CHARS, HARD_MAX_CHARS);

    const requestedStart = args['start'] === undefined ? undefined : clampLimit(args['start'], 1, 1_000_000);
    const requestedEnd = args['end'] === undefined ? undefined : clampLimit(args['end'], 1, 1_000_000);
    if (requestedStart !== undefined && requestedEnd !== undefined && requestedEnd < requestedStart) {
      throw new ToolError(`"end" (${requestedEnd}) is before "start" (${requestedStart}).`);
    }

    if (!root) {
      // The index describes a tree this machine does not have. The pinned
      // reference still answers "which revision", which is the part that
      // produces wrong firmware when guessed.
      return result(
        'The indexed Zephyr tree is not present on this machine, so its files cannot be read here.\n\n' +
          `Use this reference for the exact revision:\n\n\`${reference(slug, commit, displayPath, null)}\`\n\n` +
          `_Indexed Zephyr ${idx.meta['zephyr_version'] ?? 'unknown'} at commit \`${commit}\`. ` +
          'A file fetched from a default branch is a different Zephyr version._',
        {
          path: displayPath,
          found: false,
          treeAvailable: false,
          commit,
          reference: reference(slug, commit, displayPath, null),
        },
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
        const searched = inModule
          ? `the ${tree!.name} module tree`
          : `the indexed Zephyr ${idx.meta['zephyr_version'] ?? ''} tree`;
        const available = trees.filter((candidate) => candidate.prefix !== '');
        throw new ToolError(
          `"${displayPath}" does not exist in ${searched}. ` +
            'Check the path against search_boards, search_samples, or the header reported by get_api.' +
            (available.length > 0 && !inModule
              ? ` Module sources are readable too, under their workspace-relative paths — ${available
                  .slice(0, 4)
                  .map((candidate) => `\`${candidate.prefix}\``)
                  .join(', ')}${available.length > 4 ? `, and ${available.length - 4} more` : ''}.`
              : ''),
        );
      }
      const escaped = relative(root, resolved);
      if (escaped === '..' || escaped.startsWith(`..${sep}`) || isAbsolute(escaped)) {
        throw new ToolError(`"${displayPath}" resolves outside the tree it names.`);
      }
      if (!statSync(resolved).isFile()) {
        throw new ToolError(`"${displayPath}" is not a regular file in the indexed tree.`);
      }
      if (statSync(resolved).size > MAX_BYTES) {
        throw new ToolError(`"${displayPath}" is too large to return. Request a line range with "start" and "end".`);
      }
      text = readFileSync(resolved, 'utf8');
    }

    if (text.includes('\0')) {
      throw new ToolError(`"${displayPath}" is a binary file and has no useful text representation.`);
    }

    const lines = text.split('\n');
    // A trailing newline yields an empty final element that is not a line.
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    const total = lines.length;

    const start = Math.min(requestedStart ?? 1, total);
    const end = Math.min(requestedEnd ?? total, total);
    if (requestedStart !== undefined && requestedStart > total) {
      throw new ToolError(`"${displayPath}" has ${total} lines; "start" (${requestedStart}) is past the end.`);
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
    const ref = reference(slug, commit, displayPath, { start, end: shownEnd });
    const range = start === 1 && shownEnd === total ? `${total} lines` : `lines ${start}–${shownEnd} of ${total}`;
    // Which tree the bytes came from is part of the answer, not decoration: a
    // HAL header and a Zephyr header can carry the same name, and the module's
    // revision is pinned by the manifest rather than by the Zephyr commit.
    const provenance = inModule
      ? `_Read from the \`${tree!.name}\` module` +
        (commit ? ` at manifest revision \`${commit.slice(0, 8)}\`` : '') +
        ', not from the Zephyr tree._'
      : '';

    const text_ = [
      `# \`${displayPath}\``,
      '',
      `\`\`\`${fenceLang(path)}`,
      body,
      '```',
      '',
      truncatedAt !== null
        ? `_Truncated at ${maxChars} characters. Request the rest with \`start: ${shownEnd + 1}\`._`
        : '',
      `_\`${ref}\` — ${range}._`,
      provenance,
      atCommit
        ? `_Read from pinned commit \`${commit}\`, not from the working tree._`
        : `_Read from the tree on disk. This content could not be verified against pinned commit \`${commit}\`. Call index_status to check whether the tree has changed._`,
    ]
      .filter((part, i, all) => part !== '' || (i > 0 && all[i - 1] !== ''))
      .join('\n');

    return result(text_, {
      path: displayPath,
      found: true,
      treeAvailable: true,
      commit,
      tree: tree?.name ?? 'zephyr',
      inModule,
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
