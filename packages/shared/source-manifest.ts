import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * The declared input set for one source root.
 *
 * The ingest used to ask the filesystem what it contained, which made the file
 * set and its order answers the disk gave rather than values anyone declared.
 * That is how a locale, a directory order and an inherited environment variable
 * each changed the catalogue without changing any count: nothing named what the
 * build consumed, so a dependency could only be found by watching two machines
 * disagree.
 *
 * A manifest is that declaration. It is ordered, content-addressed, and closed:
 * reading a file it does not list, or one whose bytes no longer match, is an
 * error rather than a difference nobody sees.
 */

export interface ManifestEntry {
  /** Tree-relative POSIX path. */
  path: string;
  /** Git blob hash: sha1 over `blob <bytes>\0<content>`. */
  hash: string;
}

export interface ManifestSelector {
  /** Restrict to a subtree, given as a tree-relative POSIX prefix. */
  under?: string;
  /** Tree-relative POSIX prefixes to exclude. */
  skip?: string[];
  /** Directory names to exclude wherever they appear in a path. */
  skipSegments?: ReadonlySet<string>;
  /** Applied to the basename, as the old walk did. */
  match: (basename: string) => boolean;
}

/** Git's own object hash, so an entry taken from git needs no rehashing. */
export function gitBlobHash(content: Buffer): string {
  return createHash('sha1')
    .update(`blob ${content.length}\u0000`)
    .update(content)
    .digest('hex');
}

function git(root: string, args: string[]): string | null {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout : null;
}

/** Directories never worth descending into when enumerating a source tree. */
const SKIP_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  '__pycache__',
  '.venv',
  'build',
  'twister-out',
]);

/**
 * Enumerate a tree from the filesystem, sorted.
 *
 * The only place the ingest reads a directory. It sorts because the result is an
 * input declaration and an unordered one would defeat the purpose; there is no
 * option to opt out, because the previous walker offered one and three of its
 * four callers got it wrong.
 */
function enumerateFilesystem(root: string): string[] {
  const found: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const directory = stack.pop()!;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) stack.push(absolute);
      } else if (entry.isFile()) {
        found.push(relative(root, absolute).split(sep).join('/'));
      }
      // Symbolic links and devices are not source, and a tree that contains one
      // where source is expected is a tree this cannot honestly address.
    }
  }
  return found.sort();
}

/** Paths git tracks, with the hashes it already computed for them. */
function trackedEntries(root: string): ManifestEntry[] | null {
  const listing = git(root, ['ls-files', '-s', '-z']);
  if (listing === null) return null;
  const entries: ManifestEntry[] = [];
  for (const record of listing.split('\u0000')) {
    if (record === '') continue;
    // `<mode> <hash> <stage>\t<path>`
    const tab = record.indexOf('\t');
    if (tab < 0) continue;
    const [mode, hash] = record.slice(0, tab).split(/\s+/);
    // Regular files only. A symlink or a submodule is not content this reads.
    if (mode !== '100644' && mode !== '100755') continue;
    entries.push({ path: record.slice(tab + 1), hash: hash! });
  }
  return entries;
}

export class SourceManifest {
  readonly root: string;
  /** Whether the source could be content-addressed, or was merely hashed. */
  readonly addressed: boolean;
  readonly entries: readonly ManifestEntry[];
  readonly #byPath: Map<string, string>;

  private constructor(root: string, addressed: boolean, entries: ManifestEntry[]) {
    this.root = root;
    this.addressed = addressed;
    this.entries = entries;
    this.#byPath = new Map(entries.map((entry) => [entry.path, entry.hash]));
  }

  /**
   * Build the manifest for a root.
   *
   * Git supplies both the order and the hashes for nothing, so it is used where
   * it exists. A worktree that has moved away from the index is reconciled
   * against the worktree, because that is what the ingest will read. A root that
   * is not a repository is hashed directly and marked unaddressed, so the weaker
   * guarantee travels with the index instead of being assumed away.
   */
  static forRoot(root: string): SourceManifest {
    const tracked = trackedEntries(root);
    if (tracked === null) {
      const entries = enumerateFilesystem(root).map((path) => ({
        path,
        hash: gitBlobHash(readFileSync(join(root, path))),
      }));
      return new SourceManifest(root, false, entries);
    }

    // The index records the staged blob, which is not what a modified file
    // contains, and lists paths that may since have been deleted.
    const status = git(root, ['status', '--porcelain', '-z', '--untracked-files=all']) ?? '';
    const changed = new Set<string>();
    const fields = status.split('\u0000');
    for (let index = 0; index < fields.length; index++) {
      const record = fields[index]!;
      if (record.length < 4) continue;
      const path = record.slice(3);
      // A rename carries its source path in the following field.
      if (record[0] === 'R') index++;
      changed.add(path);
    }

    const byPath = new Map(tracked.map((entry) => [entry.path, entry]));
    for (const path of changed) {
      if (path === '' || path === MANAGED_MARKER) continue;
      const absolute = join(root, path);
      if (!existsSync(absolute) || !statSync(absolute).isFile()) {
        byPath.delete(path);
        continue;
      }
      byPath.set(path, { path, hash: gitBlobHash(readFileSync(absolute)) });
    }
    byPath.delete(MANAGED_MARKER);

    const entries = [...byPath.values()].sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
    return new SourceManifest(root, true, entries);
  }

  /** The declared input set, as a single value. */
  fingerprint(): string {
    const hash = createHash('sha256');
    hash.update(this.addressed ? 'addressed\u0001' : 'unaddressed\u0001');
    for (const entry of this.entries) {
      hash.update(`${entry.path}\u0000${entry.hash}\u0001`);
    }
    return hash.digest('hex');
  }

  /** Tree-relative paths matching a selector, in manifest order. */
  select(selector: ManifestSelector): string[] {
    const under = selector.under ? `${selector.under.replace(/\/+$/, '')}/` : '';
    const skip = (selector.skip ?? []).map((prefix) => `${prefix.replace(/\/+$/, '')}/`);
    const found: string[] = [];
    for (const entry of this.entries) {
      if (under && !entry.path.startsWith(under)) continue;
      if (skip.some((prefix) => entry.path.startsWith(prefix))) continue;
      const segments = entry.path.split('/');
      if (selector.skipSegments && segments.slice(0, -1).some((part) => selector.skipSegments!.has(part))) {
        continue;
      }
      const basename = segments[segments.length - 1]!;
      if (selector.match(basename)) found.push(entry.path);
    }
    return found;
  }

  has(path: string): boolean {
    return this.#byPath.has(path);
  }

  /**
   * Read a declared file, refusing anything the manifest does not vouch for.
   *
   * An undeclared read means the input set is not what it says it is; a hash
   * mismatch means the tree moved under the build. Both are reported rather than
   * absorbed, because absorbing them is precisely what let four machine
   * dependencies ship.
   */
  readBinary(path: string): Buffer {
    const expected = this.#byPath.get(path);
    if (expected === undefined) {
      throw new Error(`${path} is not a declared input of ${this.root}`);
    }
    const content = readFileSync(join(this.root, path));
    const actual = gitBlobHash(content);
    if (actual !== expected) {
      throw new Error(
        `${path} changed while the index was being built (declared ${expected}, read ${actual})`,
      );
    }
    return content;
  }

  read(path: string): string {
    return this.readBinary(path).toString('utf8');
  }
}

/** Written by the pinned fetch; it describes the checkout rather than being in it. */
const MANAGED_MARKER = '.zephyr-ai-managed.json';
