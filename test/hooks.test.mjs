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

function projectFile(name, text) {
  const project = mkdtempSync(join(TEMPORARY, 'project-'));
  const path = join(project, name);
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, text);
  return { project, path };
}

function runHook({ project, path, content = '', index = INDEX, toolName = 'Edit' }) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', HOOK], {
      cwd: ROOT,
      env: {
        ...process.env,
        ZEPHYR_AI_INDEX: index,
        ZEPHYR_AI_PROJECT_ROOT: project,
        CLAUDE_PROJECT_DIR: project,
      },
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

function completeBindingIndex() {
  return indexCopy('complete', (descriptor) => {
    descriptor.coverage.bindings = { complete: true };
  });
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

  it('does not reject generated symbols while catalogue coverage is incomplete', async () => {
    const file = projectFile('prj.conf', 'CONFIG_SENSOR_LOG_LEVEL_DBG=y\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('does not reject the official MPFS mailbox compatible', async () => {
    const file = projectFile('app.overlay', 'mailbox { compatible = "microchip,mpfs-mailbox"; };\n');
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

  it('checks every compatible in a multiline array and reports the second line', async () => {
    const file = projectFile(
      'multi.overlay',
      'node { compatible =\n  "st,stm32-spi",\n  "invented,not-a-binding";\n};\n',
    );
    const result = await runHook({ ...file, index: completeBindingIndex() });
    strictEqual(result.code, 2);
    match(result.stderr, /line 3: compatible "invented,not-a-binding"/);
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

  it('makes unavailable validation visible without calling the edit invalid', async () => {
    const file = projectFile('prj.conf', 'CONFIG_BT=y\n');
    const result = await runHook({ ...file, index: join(TEMPORARY, 'missing.db') });
    strictEqual(result.code, 2);
    match(result.stderr, /validation was unavailable: no compatible project index/);
    match(result.stderr, /edit was not proven invalid/);
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

  it('makes a missing project index visible in a west workspace', async () => {
    const project = mkdtempSync(join(TEMPORARY, 'west-project-'));
    const pluginData = mkdtempSync(join(TEMPORARY, 'empty-plugin-data-'));
    mkdirSync(join(project, '.west'), { recursive: true });
    writeFileSync(join(project, '.west', 'config'), '[manifest]\npath = zephyr\n');
    const result = await runSession({ project, pluginData });
    strictEqual(result.code, 0);
    match(result.stdout, /no compatible project index/);
    strictEqual(result.stderr, '');
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
