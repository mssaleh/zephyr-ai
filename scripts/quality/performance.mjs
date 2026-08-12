#!/usr/bin/env node
/** Stable release budgets for artifact size, server startup, and an indexed call. */
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { performance } from 'node:perf_hooks';

const ROOT = resolve(import.meta.dirname, '..', '..');
const SERVER = join(ROOT, 'plugin', 'mcp', 'zephyr-mcp.mjs');
const INGEST = join(ROOT, 'plugin', 'mcp', 'zephyr-ingest.mjs');
const INDEX = resolve(process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db'));
if (![SERVER, INGEST, INDEX].every(existsSync)) throw new Error('Performance gates require built bundles and index.');

class Client {
  child;
  pending = new Map();
  sequence = 0;

  constructor() {
    this.child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], {
      env: { ...process.env, ZEPHYR_AI_INDEX: INDEX },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    createInterface({ input: this.child.stdout }).on('line', (line) => {
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
      const timeout = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 5000);
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

function percentile(values, quantile) {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * quantile) - 1)];
}

const startup = [];
for (let iteration = 0; iteration < 5; iteration++) {
  const started = performance.now();
  const client = new Client();
  await client.request('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'performance', version: '1' },
  });
  startup.push(performance.now() - started);
  client.close();
}

const client = new Client();
await client.request('initialize', {
  protocolVersion: '2025-11-25',
  capabilities: {},
  clientInfo: { name: 'performance', version: '1' },
});
client.notify('notifications/initialized');
const calls = [];
for (let iteration = 0; iteration < 30; iteration++) {
  const started = performance.now();
  await client.request('tools/call', {
    name: 'get_kconfig',
    arguments: { name: iteration % 2 ? 'BT_PERIPHERAL' : 'GPIO' },
  });
  calls.push(performance.now() - started);
}
client.close();

const measured = {
  bytes: {
    serverBundle: statSync(SERVER).size,
    ingestBundle: statSync(INGEST).size,
    index: statSync(INDEX).size,
  },
  startupMs: { p50: percentile(startup, 0.5), p95: percentile(startup, 0.95) },
  indexedCallMs: { p50: percentile(calls, 0.5), p95: percentile(calls, 0.95) },
};
const budgets = {
  serverBundle: 64 * 1024,
  ingestBundle: 256 * 1024,
  index: 150 * 1024 * 1024,
  startupP95Ms: 1500,
  indexedCallP95Ms: 250,
};
const failures = [];
if (measured.bytes.serverBundle > budgets.serverBundle) failures.push('MCP bundle exceeds 64 KiB');
if (measured.bytes.ingestBundle > budgets.ingestBundle) failures.push('ingest bundle exceeds 256 KiB');
if (measured.bytes.index > budgets.index) failures.push('index exceeds 150 MiB');
if (measured.startupMs.p95 > budgets.startupP95Ms) failures.push('MCP startup p95 exceeds 1500 ms');
if (measured.indexedCallMs.p95 > budgets.indexedCallP95Ms) failures.push('indexed call p95 exceeds 250 ms');
process.stdout.write(`${JSON.stringify({ measured, budgets, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
