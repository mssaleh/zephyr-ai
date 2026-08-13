import { ok, notStrictEqual, strictEqual } from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, it } from 'node:test';

import { NON_CONTENT_META_KEYS, contentDigest } from '../../shared/content-digest.ts';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const INDEX = process.env['ZEPHYR_AI_INDEX'] ?? join(ROOT, 'index', 'zephyr.db');
const ready = existsSync(INDEX);
if (process.env['ZEPHYR_AI_RELEASE_TEST'] === '1' && !ready) {
  throw new Error('Release tests require the rebuilt index.');
}

describe('content digest', { skip: !ready && 'build the index first' }, () => {
  it('describes the index it is stored in', () => {
    // The digest is computed before the FTS tables are built and written last.
    // If that ordering ever moves, the stored value would describe a different
    // database from the one it ships in, and every comparison against it would
    // be meaningless while still looking authoritative.
    const db = new DatabaseSync(INDEX, { readOnly: true });
    try {
      const stored = db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get() as
        | { value: string }
        | undefined;
      ok(stored?.value, 'the index records no content_hash');
      strictEqual(contentDigest(db), stored.value);
    } finally {
      db.close();
    }
  });

  it('changes when a single stored value changes', () => {
    // A digest that cannot fail is decoration. Perturbing one cell of one row
    // must move it, or it is not covering the rows it claims to.
    const db = new DatabaseSync(':memory:');
    try {
      db.exec("CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
      db.exec('CREATE TABLE kconfig (id INTEGER PRIMARY KEY, name TEXT, help TEXT)');
      db.exec("INSERT INTO kconfig (name, help) VALUES ('BT', 'Bluetooth'), ('NVS', 'Storage')");
      const before = contentDigest(db);
      db.exec("UPDATE kconfig SET help = 'Bluetooth.' WHERE name = 'BT'");
      notStrictEqual(contentDigest(db), before);
    } finally {
      db.close();
    }
  });

  it('distinguishes a value that moved between adjacent columns', () => {
    // Without a field separator the rows ('ab','c') and ('a','bc') hash the same,
    // which would let a parser bug that shifts a column go unnoticed.
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE kconfig (id INTEGER PRIMARY KEY, name TEXT, help TEXT)');
      db.exec("INSERT INTO kconfig (name, help) VALUES ('ab', 'c')");
      const first = contentDigest(db);
      db.exec("UPDATE kconfig SET name = 'a', help = 'bc'");
      notStrictEqual(contentDigest(db), first);
    } finally {
      db.close();
    }
  });

  it('ignores exactly the keys that describe the build', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      const insert = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
      for (const key of NON_CONTENT_META_KEYS) insert.run(key, 'before');
      insert.run('zephyr_commit', 'abc');
      const before = contentDigest(db);
      for (const key of NON_CONTENT_META_KEYS) {
        db.prepare('UPDATE meta SET value = ? WHERE key = ?').run('after', key);
      }
      strictEqual(contentDigest(db), before, 'a build-describing key changed the digest');

      db.prepare('UPDATE meta SET value = ? WHERE key = ?').run('def', 'zephyr_commit');
      notStrictEqual(contentDigest(db), before, 'a content key failed to change the digest');
    } finally {
      db.close();
    }
  });
});
