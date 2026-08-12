import { match, strictEqual } from 'node:assert/strict';
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { after, describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const HOOK = join(ROOT, 'plugin', 'scripts', 'validate-zephyr-edit.mjs');
const SESSION_HOOK = join(ROOT, 'plugin', 'scripts', 'check-index.mjs');
const INDEX = process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db');
const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-hooks-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

/**
 * A fixture project. `zephyrProject` writes the `find_package(Zephyr` marker the
 * validator uses to recognise a Zephyr project; pass false to model an unrelated
 * project that merely happens to contain a `.conf` file.
 */
function projectFile(name, text, { zephyrProject = true } = {}) {
  const project = mkdtempSync(join(TEMPORARY, 'project-'));
  if (zephyrProject) {
    writeFileSync(
      join(project, 'CMakeLists.txt'),
      'cmake_minimum_required(VERSION 3.20.0)\nfind_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})\nproject(app)\n',
    );
  }
  const path = join(project, name);
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, text);
  return { project, path };
}

function runHook({ project, path, content = '', index = INDEX, toolName = 'Edit' }) {
  return new Promise((resolvePromise, reject) => {
    const env = {
      ...process.env,
      ZEPHYR_AI_INDEX: index,
      ZEPHYR_AI_PROJECT_ROOT: project,
      CLAUDE_PROJECT_DIR: project,
    };
    // Otherwise a developer's exported ZEPHYR_BASE would satisfy the project gate
    // and the non-Zephyr fixture below would pass for the wrong reason.
    delete env.ZEPHYR_BASE;
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', HOOK], {
      cwd: ROOT,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (value) => (stdout += value));
    child.stderr.on('data', (value) => (stderr += value));
    child.once('error', reject);
    child.once('close', (code) => resolvePromise({ code, stdout, stderr }));
    child.stdin.end(
      JSON.stringify({ tool_name: toolName, tool_input: { file_path: path, new_string: content } }),
    );
  });
}

function rewriteDescriptor(path, mutate) {
  const db = new DatabaseSync(path);
  const row = db.prepare("SELECT value FROM meta WHERE key = 'index_descriptor'").get();
  const descriptor = JSON.parse(String(row.value));
  mutate(descriptor);
  const { createdAt, contextFingerprint, zephyrRoot, projectRoot, ...semantic } = descriptor;
  const canonical = (value) => {
    const normalise = (item) => Array.isArray(item)
      ? item.map(normalise)
      : item && typeof item === 'object'
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalise(child)]))
        : item;
    return JSON.stringify(normalise(value));
  };
  descriptor.contextFingerprint = createHash('sha256').update(canonical(semantic)).digest('hex');
  db.prepare("UPDATE meta SET value = ? WHERE key = 'index_descriptor'").run(JSON.stringify(descriptor));
  db.prepare("UPDATE meta SET value = ? WHERE key = 'context_fingerprint'").run(descriptor.contextFingerprint);
  db.close();
}

function indexCopy(label, mutate) {
  const path = join(TEMPORARY, `${label}-${Date.now()}-${Math.random()}.db`);
  copyFileSync(INDEX, path);
  rewriteDescriptor(path, mutate);
  return path;
}

function runSession({ project, index, pluginData }) {
  return new Promise((resolvePromise, reject) => {
    const env = {
      ...process.env,
      ZEPHYR_AI_PROJECT_ROOT: project,
      CLAUDE_PROJECT_DIR: project,
    };
    delete env.ZEPHYR_AI_INDEX;
    delete env.ZEPHYR_AI_PLUGIN_DATA;
    delete env.CLAUDE_PLUGIN_DATA;
    if (index) env.ZEPHYR_AI_INDEX = index;
    if (pluginData) env.ZEPHYR_AI_PLUGIN_DATA = pluginData;
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SESSION_HOOK], {
      cwd: ROOT,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (value) => (stdout += value));
    child.stderr.on('data', (value) => (stderr += value));
    child.once('error', reject);
    child.once('close', (code) => resolvePromise({ code, stdout, stderr }));
    child.stdin.end('{}');
  });
}

describe('PostToolUse Zephyr validation', {
  skip: !existsSync(INDEX) && 'release hook tests require the rebuilt index',
}, () => {
  it('reads the final file after a partial edit and reports its actual line', async () => {
    const file = projectFile('prj.conf', '# heading\n\nCONFIG_BT_BUF_ACL_RX_SIZE=y\n');
    const result = await runHook({ ...file, content: '# harmless inserted snippet' });
    strictEqual(result.code, 2);
    match(result.stderr, /line 3: .* is int but is set to "y"/);
  });

  it('does not reject generated symbols', async () => {
    const file = projectFile('prj.conf', 'CONFIG_SENSOR_LOG_LEVEL_DBG=y\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('never rejects the shipped binding-skeleton example', async () => {
    // The exact file that the coverage-gated compatible check used to reject, even
    // though its bindings sit beside it and the release gate compiles it.
    const overlay = readFileSync(join(ROOT, 'plugin', 'examples', 'binding-skeleton', 'app.overlay'), 'utf8');
    const file = projectFile('app.overlay', overlay);
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('does not report an application-local compatible as absent', async () => {
    const file = projectFile('app.overlay', 'sensor { compatible = "vendor,invented-device"; };\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('accepts valid unset syntax and rejects malformed unset syntax', async () => {
    const valid = projectFile('valid.conf', '# CONFIG_BT is not set\n');
    strictEqual((await runHook(valid)).code, 0);
    const invalid = projectFile('invalid.conf', '# CONFIG_BT is not set trailing\n');
    const result = await runHook(invalid);
    strictEqual(result.code, 2);
    match(result.stderr, /line 1: malformed Kconfig assignment/);
  });

  it('does not report an unknown Kconfig symbol as absent', async () => {
    const file = projectFile('prj.conf', 'CONFIG_ZEPHYR_AI_INVENTED_SYMBOL=y\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('is silent in a non-Zephyr project for content it would otherwise flag', async () => {
    const file = projectFile('app.conf', 'CONFIG_BT_BUF_ACL_RX_SIZE=y\n', { zephyrProject: false });
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('reports promptless application assignments as definitive errors', async () => {
    const db = new DatabaseSync(INDEX, { readOnly: true });
    const symbol = db.prepare(
      "SELECT name FROM kconfig WHERE has_prompt = 0 AND type IN ('bool','tristate') ORDER BY name LIMIT 1",
    ).get();
    db.close();
    const file = projectFile('promptless.conf', `CONFIG_${symbol.name}=y\n`);
    const result = await runHook(file);
    strictEqual(result.code, 2);
    match(result.stderr, /has no prompt and cannot be assigned/);
  });

  it('is silent when no index is available', async () => {
    // SessionStart carries the one report of an unusable index; repeating it per
    // edit made every .conf edit in an unindexed project a blocking failure.
    const file = projectFile('prj.conf', 'CONFIG_BT_BUF_ACL_RX_SIZE=y\n');
    const result = await runHook({ ...file, index: join(TEMPORARY, 'missing.db') });
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('refuses to read paths outside the active project root', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'project-'));
    const outside = join(TEMPORARY, 'outside.conf');
    writeFileSync(outside, 'CONFIG_BT=y\n');
    const result = await runHook({ project, path: outside });
    strictEqual(result.code, 2);
    match(result.stderr, /outside the active project root/);
  });

  it('is completely silent for a valid file', async () => {
    const file = projectFile('prj.conf', '# CONFIG_BT is not set\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stdout, '');
    strictEqual(result.stderr, '');
  });
});

describe('SessionStart index compatibility', {
  skip: !existsSync(INDEX) && 'release hook tests require the rebuilt index',
}, () => {
  it('is silent for a compatible catalogue outside a west workspace', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'plain-project-'));
    const result = await runSession({ project, index: INDEX });
    strictEqual(result.code, 0);
    strictEqual(result.stdout, '');
    strictEqual(result.stderr, '');
  });

  it('distinguishes a missing checkout from a missing project index', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'west-project-'));
    const pluginData = mkdtempSync(join(TEMPORARY, 'empty-plugin-data-'));
    mkdirSync(join(project, '.west'), { recursive: true });
    writeFileSync(join(project, '.west', 'config'), '[manifest]\npath = zephyr\n');
    const withoutTree = await runSession({ project, pluginData });
    strictEqual(withoutTree.code, 0);
    match(withoutTree.stdout, /no usable Zephyr checkout/);
    strictEqual(withoutTree.stderr, '');

    mkdirSync(join(project, 'zephyr'));
    writeFileSync(join(project, 'zephyr', 'VERSION'), 'VERSION_MAJOR = 4\nVERSION_MINOR = 4\nPATCHLEVEL = 2\n');
    const withTree = await runSession({ project, pluginData });
    strictEqual(withTree.code, 0);
    match(withTree.stdout, /workspace Zephyr tree is available/);
    strictEqual(withTree.stderr, '');
  });

  it('reports corrupt indexes without exposing an exception', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'corrupt-project-'));
    const corrupt = join(TEMPORARY, 'corrupt-index.db');
    writeFileSync(corrupt, 'not a SQLite database');
    const result = await runSession({ project, index: corrupt });
    strictEqual(result.code, 0);
    match(result.stdout, /corrupt or incompatible/);
    strictEqual(result.stderr, '');
  });

  it('reports a version mismatch without claiming the tree content differs', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'version-drift-'));
    mkdirSync(join(project, '.west'), { recursive: true });
    writeFileSync(join(project, '.west', 'config'), '[manifest]\npath = zephyr\n');
    mkdirSync(join(project, 'zephyr'), { recursive: true });
    writeFileSync(
      join(project, 'zephyr', 'VERSION'),
      'VERSION_MAJOR = 3\nVERSION_MINOR = 7\nPATCHLEVEL = 0\nEXTRAVERSION =\n',
    );
    const result = await runSession({ project, index: INDEX });
    strictEqual(result.code, 0);
    match(result.stdout, /uses Zephyr 3\.7\.0/);
    strictEqual(/source content also differs/.test(result.stdout), false);
  });

  it('rejects an otherwise valid index belonging to another project root', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'active-project-'));
    const owner = mkdtempSync(join(TEMPORARY, 'owner-project-'));
    const foreign = indexCopy('foreign-project', (descriptor) => {
      descriptor.projectRoot = owner;
    });
    const result = await runSession({ project, index: foreign });
    strictEqual(result.code, 0);
    match(result.stdout, /belongs to a different project root/);
    strictEqual(result.stderr, '');
  });
});
