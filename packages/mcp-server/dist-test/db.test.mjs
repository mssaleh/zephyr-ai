// test/db.test.ts
import { ok, strictEqual, throws } from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync as writeFileSync2 } from "node:fs";
import { tmpdir } from "node:os";
import { dirname as dirname2, join as join2 } from "node:path";
import { DatabaseSync as DatabaseSync2 } from "node:sqlite";
import { after, describe, it } from "node:test";

// src/db.ts
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { DatabaseSync } from "node:sqlite";

// ../shared/index-descriptor.ts
import { createHash } from "node:crypto";
var INDEX_SCHEMA_VERSION = 5;
var INDEX_DESCRIPTOR_VERSION = 2;
var INDEX_BUILDER_VERSION = "0.5.0";
function canonicalJson(value) {
  const normalise = (item) => {
    if (Array.isArray(item)) return item.map(normalise);
    if (item !== null && typeof item === "object") {
      return Object.fromEntries(
        Object.entries(item).filter(([, child]) => child !== void 0).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => [key, normalise(child)])
      );
    }
    return item;
  };
  return JSON.stringify(normalise(value));
}
function fingerprint(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
function projectId(projectRoot) {
  return fingerprint({ projectRoot }).slice(0, 24);
}
function descriptorFingerprint(descriptor2) {
  const { zephyrRoot: _privateZephyrRoot, projectRoot: _privateProjectRoot, ...semantic } = descriptor2;
  return fingerprint(semantic);
}
function parseIndexDescriptor(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("the index descriptor is not valid JSON");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("the index descriptor must be an object");
  }
  const descriptor2 = value;
  const requiredStrings = [
    "builderVersion",
    "createdAt",
    "sourceKind",
    "zephyrRoot",
    "zephyrVersion",
    "zephyrCommit",
    "zephyrTreeFingerprint",
    "moduleFingerprint",
    "contextFingerprint"
  ];
  for (const key of requiredStrings) {
    if (typeof descriptor2[key] !== "string" || descriptor2[key] === "") {
      throw new Error(`the index descriptor is missing ${key}`);
    }
  }
  if (!["pinned-upstream", "west-workspace", "explicit-tree"].includes(descriptor2.sourceKind)) {
    throw new Error(`the index descriptor has an invalid sourceKind: ${descriptor2.sourceKind}`);
  }
  if (Number.isNaN(Date.parse(descriptor2.createdAt))) {
    throw new Error("the index descriptor has an invalid createdAt timestamp");
  }
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(descriptor2.zephyrCommit)) {
    throw new Error("the index descriptor has an invalid Zephyr commit");
  }
  for (const key of ["zephyrTreeFingerprint", "moduleFingerprint", "contextFingerprint"]) {
    if (!/^[0-9a-f]{64}$/.test(descriptor2[key])) {
      throw new Error(`the index descriptor has an invalid ${key}`);
    }
  }
  if (descriptor2.westManifestHash !== void 0 && !/^[0-9a-f]{64}$/.test(descriptor2.westManifestHash)) {
    throw new Error("the index descriptor has an invalid westManifestHash");
  }
  if (descriptor2.descriptorVersion !== INDEX_DESCRIPTOR_VERSION) {
    throw new Error(
      `descriptor version ${String(descriptor2.descriptorVersion)} is incompatible; expected ${INDEX_DESCRIPTOR_VERSION}`
    );
  }
  if (descriptor2.schemaVersion !== INDEX_SCHEMA_VERSION) {
    throw new Error(
      `schema version ${String(descriptor2.schemaVersion)} is incompatible; expected ${INDEX_SCHEMA_VERSION}`
    );
  }
  if (descriptor2.coverage === null || typeof descriptor2.coverage !== "object" || Array.isArray(descriptor2.coverage)) {
    throw new Error("the index descriptor has no coverage map");
  }
  for (const [corpus, coverage] of Object.entries(descriptor2.coverage)) {
    if (coverage === null || typeof coverage !== "object" || Array.isArray(coverage) || typeof coverage.complete !== "boolean" || coverage.note !== void 0 && typeof coverage.note !== "string") {
      throw new Error(`the index descriptor has invalid coverage for ${corpus}`);
    }
  }
  const {
    createdAt: _createdAt,
    contextFingerprint,
    ...semantic
  } = descriptor2;
  if (descriptorFingerprint(semantic) !== contextFingerprint) {
    throw new Error("the index descriptor fingerprint is invalid");
  }
  return descriptor2;
}

// src/db.ts
var IndexResolutionError = class extends Error {
};
function fileInfo(path, origin, projectRoot) {
  let stat;
  try {
    stat = statSync(path, { bigint: true });
  } catch {
    throw new IndexResolutionError("The selected Zephyr index is unavailable. Rebuild it with the zephyr-index skill.");
  }
  if (!stat.isFile()) {
    throw new IndexResolutionError("The selected Zephyr index is not a regular file. Select or rebuild a valid index.");
  }
  return {
    path: realpathSync(path),
    origin,
    identity: `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}`,
    ...projectRoot ? { projectRoot } : {}
  };
}
function pluginData(env) {
  return env["ZEPHYR_AI_PLUGIN_DATA"] ?? env["CLAUDE_PLUGIN_DATA"];
}
function activeProjectIndex(data, projectRoot) {
  const projectDir = join(data, "indexes", "projects", projectId(projectRoot));
  const active = join(projectDir, "active.json");
  if (!existsSync(active)) return null;
  let relativePath;
  try {
    relativePath = JSON.parse(readFileSync(active, "utf8"))["relativePath"];
  } catch {
    throw new IndexResolutionError("The active project-index pointer is corrupt. Rebuild the project index.");
  }
  if (typeof relativePath !== "string" || isAbsolute(relativePath)) {
    throw new IndexResolutionError("The active project-index pointer is invalid. Rebuild the project index.");
  }
  const candidate = resolve(projectDir, relativePath);
  const escaped = relative(projectDir, candidate);
  if (escaped === ".." || escaped.startsWith(`..${sep}`)) {
    throw new IndexResolutionError("The active project-index pointer escapes its storage directory.");
  }
  if (!existsSync(candidate)) {
    throw new IndexResolutionError(
      "The active project-index pointer names a missing artifact. Rebuild the project index."
    );
  }
  return candidate;
}
function resolveIndexPath(env = process.env) {
  const explicit = env["ZEPHYR_AI_INDEX"];
  if (explicit) {
    if (!existsSync(explicit)) {
      throw new IndexResolutionError("ZEPHYR_AI_INDEX names a missing file. Correct it or rebuild the index.");
    }
    return fileInfo(resolve(explicit), "explicit");
  }
  const projectRootValue = env["ZEPHYR_AI_PROJECT_ROOT"] ?? env["CLAUDE_PROJECT_DIR"];
  const requestedRoot = projectRootValue ? resolve(projectRootValue) : resolve(process.cwd());
  const projectRoot = existsSync(requestedRoot) ? realpathSync(requestedRoot) : requestedRoot;
  const data = pluginData(env);
  if (data) {
    const project = activeProjectIndex(resolve(data), projectRoot);
    if (project) return fileInfo(project, "project", projectRoot);
  }
  if (!data) {
    for (const candidate of [
      join(process.cwd(), "index", "zephyr.db"),
      join(process.cwd(), "..", "..", "index", "zephyr.db")
    ]) {
      if (existsSync(candidate)) return fileInfo(resolve(candidate), "development", projectRoot);
    }
  }
  return null;
}
var Index = class {
  db;
  info;
  meta;
  descriptor;
  constructor(info) {
    this.info = info;
    this.db = new DatabaseSync(info.path, { readOnly: true });
    this.meta = {};
    for (const row of this.db.prepare("SELECT key, value FROM meta").all()) {
      this.meta[String(row["key"])] = String(row["value"]);
    }
    const schema = Number(this.meta["schema_version"]);
    if (schema !== INDEX_SCHEMA_VERSION) {
      this.db.close();
      throw new Error(
        `Index schema ${Number.isFinite(schema) ? schema : "unknown"} is incompatible; expected ${INDEX_SCHEMA_VERSION}. Rebuild the index.`
      );
    }
    const rawDescriptor = this.meta["index_descriptor"];
    if (!rawDescriptor) {
      this.db.close();
      throw new Error("The index has no descriptor. Rebuild it with the current indexer.");
    }
    try {
      this.descriptor = parseIndexDescriptor(rawDescriptor);
    } catch (error) {
      this.db.close();
      throw error;
    }
    if (this.meta["context_fingerprint"] !== this.descriptor.contextFingerprint) {
      this.db.close();
      throw new Error("The index descriptor fingerprint does not match its metadata. Rebuild the index.");
    }
    if (info.origin === "project") {
      try {
        writeFileSync(join(dirname(info.path), "last-used"), `${(/* @__PURE__ */ new Date()).toISOString()}
`);
      } catch {
      }
    }
  }
  get sizeBytes() {
    try {
      return statSync(this.info.path).size;
    } catch {
      return 0;
    }
  }
  all(sql, ...params) {
    return this.db.prepare(sql).all(...params);
  }
  get(sql, ...params) {
    return this.db.prepare(sql).get(...params);
  }
  /**
   * Run a full-text query, widening the match and concatenating the results.
   *
   * Requiring every term is precise but brittle: "bluetooth peripheral role"
   * matches two obscure ISO symbols and misses BT_PERIPHERAL, whose help text
   * never says "bluetooth". Stopping at the first variant that returns anything
   * would therefore hide the best answer behind two worse ones.
   *
   * So every variant runs, narrowest first, and their results are concatenated
   * with duplicates dropped. Precise hits stay at the top and broader hits fill
   * in behind them, up to `limit`.
   *
   * `params` are the bindings that follow the MATCH placeholder, including the
   * LIMIT; rows are de-duplicated on their first column, which is the identity
   * column in every query here.
   */
  search(sql, query, params = [], limit = 50) {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const match of matchVariants(query)) {
      for (const row of this.all(sql, match, ...params)) {
        const key = String(Object.values(row)[0] ?? "");
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(row);
        if (out.length >= limit) return out;
      }
    }
    return out;
  }
  close() {
    this.db.close();
  }
};
function matchVariants(input) {
  const tokens = input.match(/[\p{L}\p{N}_#.,:+-]+/gu) ?? [];
  const cleaned = tokens.map((t) => t.replace(/^[.,:+-]+|[.,:+-]+$/g, "")).filter((t) => t.length > 0).slice(0, 12);
  if (cleaned.length === 0) return [];
  const quote = (t) => `"${t.replace(/"/g, '""')}"`;
  const exact = cleaned.map(quote);
  const prefix = cleaned.map((t) => `${quote(t)}*`);
  const variants = [exact.join(" AND ")];
  if (prefix.join(" AND ") !== variants[0]) variants.push(prefix.join(" AND "));
  if (cleaned.length > 1) variants.push(prefix.join(" OR "));
  return variants;
}

// test/db.test.ts
var TEMPORARY = mkdtempSync(join2(tmpdir(), "zephyr-ai-db-tests-"));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));
function descriptor(overrides = {}) {
  const base = {
    descriptorVersion: INDEX_DESCRIPTOR_VERSION,
    schemaVersion: INDEX_SCHEMA_VERSION,
    builderVersion: INDEX_BUILDER_VERSION,
    sourceKind: "explicit-tree",
    zephyrRoot: "/private/zephyr",
    zephyrVersion: "4.4.2",
    zephyrCommit: "a".repeat(40),
    zephyrTreeFingerprint: "c".repeat(64),
    moduleFingerprint: "b".repeat(64),
    coverage: { docs: { complete: true } },
    ...overrides
  };
  const semantic = { ...base };
  return {
    ...base,
    createdAt: "2026-08-12T00:00:00.000Z",
    contextFingerprint: descriptorFingerprint(semantic)
  };
}
function database(path, value = descriptor()) {
  mkdirSync(dirname2(path), { recursive: true });
  const db = new DatabaseSync2(path);
  db.exec("CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  const insert = db.prepare("INSERT INTO meta(key, value) VALUES (?, ?)");
  insert.run("schema_version", String(value.schemaVersion));
  insert.run("index_descriptor", canonicalJson(value));
  insert.run("context_fingerprint", value.contextFingerprint);
  db.close();
}
function activate(data, project, dbPath) {
  const projectDirectory = join2(data, "indexes", "projects", projectId(project));
  mkdirSync(projectDirectory, { recursive: true });
  writeFileSync2(
    join2(projectDirectory, "active.json"),
    JSON.stringify({ relativePath: dbPath.slice(projectDirectory.length + 1) })
  );
}
describe("project-scoped index resolution", () => {
  it("discovers an index created after an initial miss without process restart", () => {
    const data = join2(TEMPORARY, "late data");
    const project = join2(TEMPORARY, "project \xFC");
    mkdirSync(project, { recursive: true });
    const env = { ZEPHYR_AI_PLUGIN_DATA: data, ZEPHYR_AI_PROJECT_ROOT: project };
    strictEqual(resolveIndexPath(env), null);
    const projectDirectory = join2(data, "indexes", "projects", projectId(project));
    const path = join2(projectDirectory, "context", "zephyr.db");
    database(path);
    activate(data, project, path);
    strictEqual(resolveIndexPath(env)?.path, path);
  });
  it("isolates two projects and handles spaces and non-ASCII paths", () => {
    const data = join2(TEMPORARY, "plugin data");
    const first = join2(TEMPORARY, "alpha project");
    const second = join2(TEMPORARY, "\u03B2eta project");
    for (const [project, context] of [[first, "one"], [second, "two"]]) {
      mkdirSync(project, { recursive: true });
      const directory = join2(data, "indexes", "projects", projectId(project));
      const path = join2(directory, context, "zephyr.db");
      database(path);
      activate(data, project, path);
    }
    const firstPath = resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: first })?.path;
    const secondPath = resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: second })?.path;
    ok(firstPath?.includes("/one/"));
    ok(secondPath?.includes("/two/"));
  });
  it("canonicalizes a symlinked project root before deriving its storage identity", () => {
    const data = join2(TEMPORARY, "symlink-data");
    const project = join2(TEMPORARY, "canonical-project");
    const alias = join2(TEMPORARY, "project-alias");
    mkdirSync(project, { recursive: true });
    symlinkSync(project, alias, "dir");
    const directory = join2(data, "indexes", "projects", projectId(project));
    const path = join2(directory, "context", "zephyr.db");
    database(path);
    activate(data, project, path);
    strictEqual(
      resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: alias })?.path,
      path
    );
  });
  it("gives an explicit valid index precedence and never falls back when it is missing", () => {
    const explicit = join2(TEMPORARY, "explicit.db");
    database(explicit);
    strictEqual(resolveIndexPath({ ZEPHYR_AI_INDEX: explicit })?.origin, "explicit");
    throws(
      () => resolveIndexPath({ ZEPHYR_AI_INDEX: join2(TEMPORARY, "missing.db") }),
      IndexResolutionError
    );
  });
  it("rejects corrupt pointers and directory traversal", () => {
    const data = join2(TEMPORARY, "corrupt-data");
    const project = join2(TEMPORARY, "corrupt-project");
    const directory = join2(data, "indexes", "projects", projectId(project));
    mkdirSync(directory, { recursive: true });
    writeFileSync2(join2(directory, "active.json"), "{bad");
    throws(() => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }));
    writeFileSync2(join2(directory, "active.json"), JSON.stringify({ relativePath: "../../escape.db" }));
    throws(() => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }));
    writeFileSync2(join2(directory, "active.json"), JSON.stringify({ relativePath: "missing/zephyr.db" }));
    throws(
      () => resolveIndexPath({ ZEPHYR_AI_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: project }),
      /missing artifact/
    );
  });
});
describe("index descriptor validation", () => {
  it("rejects malformed identities and coverage even with a recomputed fingerprint", () => {
    for (const overrides of [
      { sourceKind: "invented" },
      { zephyrCommit: "not-a-commit" },
      { zephyrTreeFingerprint: "short" },
      { createdAt: "not-a-date" },
      { coverage: { docs: { complete: "yes" } } }
    ]) {
      const candidate = descriptor(overrides);
      throws(() => parseIndexDescriptor(canonicalJson(candidate)));
    }
  });
  it("rejects schema mismatch, missing descriptor, and fingerprint corruption", () => {
    const validPath = join2(TEMPORARY, "valid.db");
    database(validPath);
    const validInfo = resolveIndexPath({ ZEPHYR_AI_INDEX: validPath });
    new Index(validInfo).close();
    const mismatchPath = join2(TEMPORARY, "mismatch.db");
    const mismatch = descriptor();
    database(mismatchPath, mismatch);
    const mismatchDb = new DatabaseSync2(mismatchPath);
    mismatchDb.prepare("UPDATE meta SET value = '1' WHERE key = 'schema_version'").run();
    mismatchDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: mismatchPath })), /schema/);
    const missingPath = join2(TEMPORARY, "missing-descriptor.db");
    database(missingPath);
    const missingDb = new DatabaseSync2(missingPath);
    missingDb.prepare("DELETE FROM meta WHERE key = 'index_descriptor'").run();
    missingDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: missingPath })), /descriptor/);
    const corruptPath = join2(TEMPORARY, "corrupt-fingerprint.db");
    database(corruptPath);
    const corruptDb = new DatabaseSync2(corruptPath);
    const row = corruptDb.prepare("SELECT value FROM meta WHERE key = 'index_descriptor'").get();
    const corrupt = JSON.parse(String(row["value"]));
    corrupt.zephyrCommit = "c".repeat(40);
    corruptDb.prepare("UPDATE meta SET value = ? WHERE key = 'index_descriptor'").run(JSON.stringify(corrupt));
    corruptDb.close();
    throws(() => new Index(resolveIndexPath({ ZEPHYR_AI_INDEX: corruptPath })), /fingerprint/);
  });
});
