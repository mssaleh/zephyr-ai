#!/usr/bin/env node
/** Install the copied marketplace artifact, build its first index, and query it over stdio. */
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

const ROOT = resolve(import.meta.dirname, '..', '..');

/**
 * The schema this build produces, read from its one declaration.
 *
 * Node here has no TypeScript support, so the constant cannot be imported. It
 * is still read rather than copied: a hardcoded number silently stops testing
 * the current artifact the moment the schema is bumped.
 */
const EXPECTED_SCHEMA = Number(
  readFileSync(join(ROOT, 'packages', 'shared', 'index-descriptor.ts'), 'utf8').match(
    /INDEX_SCHEMA_VERSION\s*=\s*(\d+)/,
  )?.[1],
);
if (!Number.isInteger(EXPECTED_SCHEMA)) {
  throw new Error('Could not read INDEX_SCHEMA_VERSION from packages/shared/index-descriptor.ts.');
}
const ZEPHYR = resolve(process.env.ZEPHYR_BASE ?? join(ROOT, '.cache', 'zephyr'));
if (!existsSync(join(ZEPHYR, 'VERSION'))) throw new Error('Clean-room release testing requires the pinned Zephyr tree.');

const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-clean-room-'));
const artifact = join(temporary, 'marketplace');
const project = join(temporary, 'project with spaces');
const data = join(temporary, 'plugin data');
mkdirSync(project, { recursive: true });
mkdirSync(data, { recursive: true });
cpSync(join(ROOT, '.claude-plugin'), join(artifact, '.claude-plugin'), { recursive: true });
cpSync(join(ROOT, 'plugin'), join(artifact, 'plugin'), { recursive: true });

function command(commandName, args, options = {}) {
  const run = spawnSync(commandName, args, { encoding: 'utf8', ...options });
  if (run.status !== 0) {
    throw new Error(`${commandName} ${args.join(' ')} failed:\n${(run.stderr || run.stdout).trim()}`);
  }
  return run;
}

class Client {
  child;
  pending = new Map();
  sequence = 0;

  constructor(server) {
    this.child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', server], {
      cwd: project,
      env: {
        PATH: process.env.PATH,
        ZEPHYR_AI_PLUGIN_DATA: data,
        ZEPHYR_AI_PROJECT_ROOT: project,
        CLAUDE_PLUGIN_DATA: data,
        CLAUDE_PROJECT_DIR: project,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const lines = createInterface({ input: this.child.stdout });
    lines.on('line', (line) => {
      const message = JSON.parse(line);
      const callback = this.pending.get(message.id);
      if (callback) {
        this.pending.delete(message.id);
        callback(message);
      }
    });
  }

  request(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => reject(new Error(`clean-room timeout waiting for ${method}`)), 30000);
      this.pending.set(id, (message) => {
        clearTimeout(timeout);
        resolvePromise(message);
      });
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    });
  }

  notify(method) {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params: {} })}\n`);
  }

  close() {
    this.child.stdin.end();
    this.child.kill();
  }
}

let client;
try {
  command('claude', ['plugin', 'validate', artifact, '--strict']);
  command('claude', ['plugin', 'validate', join(artifact, 'plugin'), '--strict']);

  client = new Client(join(artifact, 'plugin', 'mcp', 'zephyr-mcp.mjs'));
  await client.request('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'clean-room', version: '1' },
  });
  client.notify('notifications/initialized');
  const before = await client.request('tools/call', { name: 'index_status', arguments: {} });
  if (before.result?.isError !== true) throw new Error('A fresh plugin-data directory unexpectedly resolved an index.');

  command(
    process.execPath,
    [
      '--disable-warning=ExperimentalWarning',
      join(artifact, 'plugin', 'mcp', 'zephyr-ingest.mjs'),
      '--zephyr', ZEPHYR,
      '--project-root', project,
      '--plugin-data', data,
      '--quiet',
    ],
    { cwd: project, env: { ...process.env, ZEPHYR_BASE: ZEPHYR } },
  );

  const after = await client.request('tools/call', { name: 'index_status', arguments: {} });
  if (after.result?.isError === true) throw new Error('The live server did not adopt the newly created project index.');
  const descriptor = after.result?.structuredContent?.descriptor;
  if (descriptor?.zephyrVersion !== '4.4.2' || descriptor?.schemaVersion !== EXPECTED_SCHEMA) {
    throw new Error(
      `The copied artifact returned an unexpected index descriptor: ` +
        `Zephyr ${descriptor?.zephyrVersion}, schema ${descriptor?.schemaVersion} ` +
        `(expected 4.4.2 and schema ${EXPECTED_SCHEMA}).`,
    );
  }
  process.stdout.write('clean-room marketplace copy: no index -> built project index -> live MCP query verified\n');
} finally {
  client?.close();
  rmSync(temporary, { recursive: true, force: true });
}
