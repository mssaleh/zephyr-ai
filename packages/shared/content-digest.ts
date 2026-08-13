import { createHash } from 'node:crypto';

/**
 * A digest of everything the index asserts, independent of how it is stored.
 *
 * Row counts cannot see the failures this exists to catch. A locale that
 * reorders 20,968 API symbols, a filesystem that hands back directory entries in
 * a different order, a Doxygen that finds the same number of symbols with
 * different text — all leave every count identical, and all produce a different
 * catalogue. Two machines passed the whole gate while disagreeing about content.
 *
 * It covers rows, not bytes. SQLite's page layout and FTS5 internals move with
 * the library version bundled into whatever Node ran the build, so a file hash
 * would report differences that say nothing about Zephyr.
 */

/**
 * Keys that describe the build rather than the catalogue.
 *
 * Kept here, in one place, so that "what is allowed to vary" is a list someone
 * can read rather than a property they have to infer from a hash mismatch. The
 * test is not "does this change often" but "is this an assertion about Zephyr":
 * a copy of the same tree at another path is a different build of an identical
 * catalogue, and the digest exists to say the second half of that.
 */
export const NON_CONTENT_META_KEYS: ReadonlySet<string> = new Set([
  // When the build ran.
  'built_at',
  // Carries createdAt, the absolute tree path, and the producer environment.
  'index_descriptor',
  // Identity derived from the descriptor: it separates a workspace build from a
  // pinned one and follows the tree's git state, neither of which is content.
  'context_fingerprint',
  // Where this machine keeps its Zephyr checkout.
  'source_path',
  // The plugin's own release number. A version bump is not a change to what the
  // index says about Zephyr, and letting it move the digest would force a fixture
  // regeneration every release — which teaches the habit of regenerating without
  // reading, and that is how a pinned value stops being a check. A code change
  // that alters extraction moves the digest through the extracted content itself.
  'ingest_version',
  // The digest cannot cover itself, nor the per-table digests it is built from.
  'content_hash',
  'table_hashes',
]);

interface DigestDatabase {
  prepare(sql: string): { all(...params: unknown[]): unknown[] };
}

/** Tables whose contents are derived, and so are not independent assertions. */
function isDerived(name: string): boolean {
  return /_fts(_|$)/.test(name) || name.startsWith('sqlite_');
}

/**
 * Hash every stored assertion in a stable order.
 *
 * Rows are read in `rowid` order rather than sorted here: the order rows were
 * written in is itself part of what must be reproducible, so imposing an order
 * at hash time would conceal exactly the drift this is meant to expose.
 *
 * Fields are separated by NUL and rows by SOH. SQLite text never contains
 * either, so no pair of adjacent values can be confused for one longer value —
 * without a separator, the rows ('ab','c') and ('a','bc') hash identically.
 */
/**
 * A digest per table, and the whole-index digest over them.
 *
 * Per table because a single hash says only "these two indexes differ", and the
 * two are usually on different machines with no way to diff them. Naming the
 * table turns a bisect into a question, which is worth the few extra bytes in the
 * fixture — the first mismatch this caught cost two release builds to localise.
 */
export function tableDigests(db: DigestDatabase): Record<string, string> {
  const FIELD = '\u0000';
  const ROW = '\u0001';
  const tables = (
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[]
  )
    .map((row) => row.name)
    .filter((name) => !isDerived(name));

  const digests: Record<string, string> = {};
  for (const table of tables) {
    const hash = createHash('sha256');
    if (table === 'meta') {
      const rows = db.prepare('SELECT key, value FROM meta ORDER BY key').all() as {
        key: string;
        value: string;
      }[];
      for (const row of rows) {
        if (NON_CONTENT_META_KEYS.has(row.key)) continue;
        hash.update(`${row.key}${FIELD}${row.value}${ROW}`);
      }
    } else {
      for (const row of db.prepare(`SELECT * FROM "${table}" ORDER BY rowid`).all() as Record<
        string,
        unknown
      >[]) {
        // Column order comes from the table declaration, so it is stable. A null is
        // encoded distinctly from the empty string, which are different assertions.
        for (const value of Object.values(row)) {
          hash.update(value === null ? `${FIELD}null` : String(value));
          hash.update(FIELD);
        }
        hash.update(ROW);
      }
    }
    digests[table] = hash.digest('hex');
  }
  return digests;
}

export function contentDigest(db: DigestDatabase): string {
  const hash = createHash('sha256');
  for (const [table, digest] of Object.entries(tableDigests(db))) {
    hash.update(`${table}\u0000${digest}\u0001`);
  }
  return hash.digest('hex');
}
