import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/identity.test.ts
import { notStrictEqual, strictEqual } from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as join3 } from "node:path";
import { spawnSync as spawnSync3 } from "node:child_process";
import { after, describe, it } from "node:test";

// src/identity.ts
import { createHash as createHash3 } from "node:crypto";
import { existsSync as existsSync2, readFileSync as readFileSync2, realpathSync as realpathSync2, statSync } from "node:fs";
import { basename, dirname, join as join2, relative, resolve } from "node:path";
import { spawnSync as spawnSync2 } from "node:child_process";

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
function descriptorFingerprint(descriptor) {
  const { zephyrRoot: _privateZephyrRoot, projectRoot: _privateProjectRoot, ...semantic } = descriptor;
  return fingerprint(semantic);
}

// ../shared/source-identity.ts
import { createHash as createHash2 } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"]
  });
  return result.status === 0 ? result.stdout.trim() : null;
}
function gitTreeIdentity(root) {
  const canonical = realpathSync(root);
  const commit = git(canonical, ["rev-parse", "HEAD"]);
  if (!commit) return null;
  const diff = git(canonical, ["diff", "--binary", "HEAD"]) ?? "";
  const untracked = (git(canonical, ["ls-files", "--others", "--exclude-standard"]) ?? "").split("\n").filter((path) => Boolean(path) && path !== ".zephyr-ai-managed.json").sort().map((path) => {
    const absolute = join(canonical, path);
    if (!existsSync(absolute)) return { path, missing: true };
    try {
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) return { path, symlink: readlinkSync(absolute) };
      if (!stat.isFile()) return { path, special: stat.mode };
      return {
        path,
        sha256: createHash2("sha256").update(readFileSync(absolute)).digest("hex")
      };
    } catch {
      return { path, unreadable: true };
    }
  });
  return {
    commit,
    dirty: Boolean(diff || untracked.length),
    stateFingerprint: fingerprint({ commit, diff, untracked })
  };
}

// src/identity.ts
function git2(root, args) {
  const result = spawnSync2("git", ["-C", root, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  return result.status === 0 ? result.stdout.trim() : null;
}
function readTreeVersion(root) {
  const text = readFileSync2(join2(root, "VERSION"), "utf8");
  const field = (name) => text.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
  const version = [field("VERSION_MAJOR"), field("VERSION_MINOR"), field("PATCHLEVEL")].join(".");
  const extra = field("EXTRAVERSION");
  return extra ? `${version}-${extra}` : version;
}
function findWorkspace(start) {
  let cursor = resolve(start);
  while (true) {
    if (existsSync2(join2(cursor, ".west", "config"))) return cursor;
    const parent = dirname(cursor);
    if (parent === cursor) return void 0;
    cursor = parent;
  }
}
function manifestHash(workspace) {
  if (!workspace) return void 0;
  const frozen = spawnSync2("west", ["manifest", "--freeze"], {
    cwd: workspace,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  if (frozen.status === 0 && frozen.stdout.trim()) {
    return createHash3("sha256").update(frozen.stdout).digest("hex");
  }
  let manifestPath = "";
  let manifestFile = "west.yml";
  try {
    const config = readFileSync2(join2(workspace, ".west", "config"), "utf8");
    manifestPath = config.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim() ?? "";
    manifestFile = config.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim() ?? manifestFile;
  } catch {
  }
  const candidates = [
    ...manifestPath ? [join2(workspace, manifestPath, manifestFile)] : [],
    join2(workspace, "west.yml"),
    join2(workspace, "west.yaml")
  ];
  const manifest = candidates.find(existsSync2);
  return manifest ? createHash3("sha256").update(readFileSync2(manifest)).digest("hex") : void 0;
}
function contentIdentity(root) {
  const canonical = realpathSync2(root);
  const identity = gitTreeIdentity(canonical);
  if (identity) return { name: basename(canonical), ...identity };
  const markerPaths = ["VERSION", "west.yml", "zephyr/module.yml", "module.yml"].map((path) => join2(canonical, path)).filter(existsSync2).map((path) => {
    const stat = statSync(path);
    return {
      path: relative(canonical, path),
      bytes: stat.size,
      sha256: createHash3("sha256").update(readFileSync2(path)).digest("hex")
    };
  });
  return { name: basename(canonical), markers: markerPaths };
}
function buildIndexDescriptor(options) {
  const zephyrRoot = realpathSync2(options.zephyrRoot);
  const projectRoot = options.projectRoot && existsSync2(options.projectRoot) ? realpathSync2(options.projectRoot) : void 0;
  const zephyrCommit = git2(zephyrRoot, ["rev-parse", "HEAD"]);
  if (!zephyrCommit) {
    throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${zephyrRoot}.`);
  }
  const workspace = findWorkspace(projectRoot ?? zephyrRoot);
  const westManifestHash = manifestHash(workspace);
  const modules = options.modules.map((root) => contentIdentity(root));
  const moduleFingerprint = fingerprint(modules);
  const zephyrIdentity = contentIdentity(zephyrRoot);
  const zephyrTreeFingerprint = String(zephyrIdentity["stateFingerprint"] ?? fingerprint(zephyrIdentity));
  const sourceKind = options.pinnedCommit === zephyrCommit && zephyrIdentity["dirty"] === false ? "pinned-upstream" : workspace ? "west-workspace" : "explicit-tree";
  const base = {
    descriptorVersion: INDEX_DESCRIPTOR_VERSION,
    schemaVersion: INDEX_SCHEMA_VERSION,
    builderVersion: INDEX_BUILDER_VERSION,
    sourceKind,
    ...projectRoot ? { projectRoot } : {},
    zephyrRoot,
    zephyrVersion: readTreeVersion(zephyrRoot),
    zephyrCommit,
    zephyrTreeFingerprint,
    ...westManifestHash ? { westManifestHash } : {},
    moduleFingerprint,
    ...options.boardTarget ? { boardTarget: options.boardTarget } : {},
    ...options.applicationRoot ? { applicationRoot: realpathSync2(options.applicationRoot) } : {},
    ...options.buildDirectory ? { buildDirectory: realpathSync2(options.buildDirectory) } : {},
    coverage: {
      docs: { complete: options.modules.length === 0, note: options.modules.length ? "Module documentation is not indexed." : void 0 },
      kconfig: { complete: false, note: "Catalogue index; generated and application-local symbols require resolved context." },
      bindings: {
        complete: options.modules.length === 0 && !projectRoot && !options.applicationRoot,
        note: options.modules.length || projectRoot || options.applicationRoot ? "Application-local or undisclosed module binding roots may not be indexed." : void 0
      },
      boards: { complete: options.modules.length === 0, note: options.modules.length ? "Module board roots are not indexed." : void 0 },
      samples: { complete: options.modules.length === 0, note: options.modules.length ? "Module samples are not indexed." : void 0 },
      api: {
        complete: Boolean(options.apiSemantic) && options.modules.length === 0,
        note: options.apiSemantic ? options.modules.length ? "Module public headers are not indexed." : void 0 : "Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."
      },
      resolvedBuild: {
        complete: false,
        note: options.buildDirectory ? "Build identity is recorded, but resolved .config and final devicetree values are not ingested." : "No resolved build output was supplied or ingested."
      }
    }
  };
  return {
    ...base,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    contextFingerprint: descriptorFingerprint(base)
  };
}

// test/identity.test.ts
var TEMPORARY = mkdtempSync(join3(tmpdir(), "zephyr-ai-identity-"));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));
function repository(path, files) {
  mkdirSync(path, { recursive: true });
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join3(path, name, ".."), { recursive: true });
    writeFileSync(join3(path, name), text);
  }
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "fixture"]
  ]) {
    const result = spawnSync3("git", args, { cwd: path, encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr);
  }
}
describe("index source identity", () => {
  it("changes context identity for uncommitted Zephyr and module content", () => {
    const zephyr = join3(TEMPORARY, "zephyr");
    const module = join3(TEMPORARY, "module");
    repository(zephyr, {
      VERSION: "VERSION_MAJOR = 4\nVERSION_MINOR = 4\nPATCHLEVEL = 2\nEXTRAVERSION =\n",
      "doc/index.rst": "Fixture\n-------\n"
    });
    repository(module, { "zephyr/module.yml": "build:\n  kconfig: Kconfig\n", Kconfig: "config FIXTURE\n	bool\n" });
    const clean = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    writeFileSync(join3(zephyr, "doc", "index.rst"), "Fixture changed\n===============\n");
    const dirtyTree = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    strictEqual(clean.zephyrCommit, dirtyTree.zephyrCommit);
    notStrictEqual(clean.zephyrTreeFingerprint, dirtyTree.zephyrTreeFingerprint);
    notStrictEqual(clean.contextFingerprint, dirtyTree.contextFingerprint);
    writeFileSync(join3(module, "Kconfig"), "config FIXTURE_CHANGED\n	bool\n");
    const dirtyModule = buildIndexDescriptor({ zephyrRoot: zephyr, modules: [module] });
    notStrictEqual(dirtyTree.moduleFingerprint, dirtyModule.moduleFingerprint);
    notStrictEqual(dirtyTree.contextFingerprint, dirtyModule.contextFingerprint);
  });
});
