import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Directories never worth descending into when indexing a Zephyr tree. */
const DEFAULT_SKIP = new Set([
  '.git',
  'node_modules',
  '__pycache__',
  '.venv',
  'build',
  'twister-out',
]);

export interface WalkOptions {
  /** Directory names to skip anywhere in the tree. */
  skipDirs?: Set<string>;
  /** Tree-relative path prefixes to skip, using forward slashes. */
  skipPrefixes?: string[];
  /** Return only files whose basename satisfies this predicate. */
  match?: (basename: string) => boolean;
}

/**
 * Recursively walk `root`, yielding tree-relative POSIX paths.
 *
 * Written by hand rather than using `readdirSync(recursive: true)` because the
 * Zephyr tree contains a 300 MB `.git` directory that must not be traversed and
 * several subtrees (notably `tests/`) that are deliberately excluded.
 */
export function* walk(root: string, opts: WalkOptions = {}): Generator<string> {
  if (!existsSync(root)) return;
  const skipDirs = opts.skipDirs ?? DEFAULT_SKIP;
  const skipPrefixes = opts.skipPrefixes ?? [];
  const stack: string[] = [root];

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      throw new Error(
        `Failed to read source directory ${dir}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    for (const entry of entries) {
      const abs = join(dir, entry.name);
      const rel = toPosix(relative(root, abs));

      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        if (skipPrefixes.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
        stack.push(abs);
      } else if (entry.isFile()) {
        if (skipPrefixes.some((p) => rel.startsWith(`${p}/`))) continue;
        if (opts.match && !opts.match(entry.name)) continue;
        yield rel;
      } else if (entry.isSymbolicLink()) {
        throw new Error(`Refusing symbolic link in indexed source tree: ${abs}`);
      }
    }
  }
}

export function toPosix(p: string): string {
  return sep === '/' ? p : p.split(sep).join('/');
}
