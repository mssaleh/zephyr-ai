/**
 * End-to-end conformance test: spawns the built server and drives it over
 * stdio exactly as a client would.
 */

import { ok, strictEqual } from 'node:assert/strict';
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { LATEST_PROTOCOL_VERSION } from '../src/protocol.ts';

const REPO = resolve(process.cwd(), '..', '..');
const SERVER = join(REPO, 'plugin', 'mcp', 'zephyr-mcp.mjs');
const INDEX = process.env['ZEPHYR_AI_INDEX'] ?? join(REPO, 'index', 'zephyr.db');
const ready = existsSync(SERVER) && existsSync(INDEX);
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !ready) {
  throw new Error('Release tests require the built MCP bundle and rebuilt Zephyr index.');
}

interface Response {
  jsonrpc: '2.0';
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

/** Minimal MCP client over a child process's stdio. */
class Client {
  #child: ChildProcessWithoutNullStreams;
  #buffer = '';
  #pending = new Map<number, (r: Response) => void>();
  #nextId = 1;
  readonly stderr: string[] = [];

  constructor() {
    this.#child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], {
      env: { ...process.env, ZEPHYR_AI_INDEX: INDEX },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.#child.stdout.setEncoding('utf8');
    this.#child.stdout.on('data', (chunk: string) => {
      this.#buffer += chunk;
      let newline: number;
      while ((newline = this.#buffer.indexOf('\n')) >= 0) {
        const line = this.#buffer.slice(0, newline).trim();
        this.#buffer = this.#buffer.slice(newline + 1);
        if (line === '') continue;
        const message = JSON.parse(line) as Response;
        const resolver = this.#pending.get(message.id);
        if (resolver) {
          this.#pending.delete(message.id);
          resolver(message);
        }
      }
    });
    this.#child.stderr.setEncoding('utf8');
    this.#child.stderr.on('data', (chunk: string) => this.stderr.push(chunk));
  }

  request(method: string, params: Record<string, unknown> = {}): Promise<Response> {
    const id = this.#nextId++;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 20000);
      this.#pending.set(id, (r) => {
        clearTimeout(timer);
        resolvePromise(r);
      });
      this.#child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    });
  }

  notify(method: string, params: Record<string, unknown> = {}): void {
    this.#child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
  }

  /** Call a tool and return its text content. */
  async call(name: string, args: Record<string, unknown> = {}): Promise<{ text: string; isError: boolean; structured: Record<string, unknown> }> {
    const res = await this.request('tools/call', { name, arguments: args });
    if (res.error) throw new Error(`${name} returned protocol error: ${res.error.message}`);
    const content = (res.result?.['content'] ?? []) as { type: string; text: string }[];
    return {
      text: content.map((c) => c.text).join('\n'),
      isError: res.result?.['isError'] === true,
      structured: (res.result?.['structuredContent'] ?? {}) as Record<string, unknown>,
    };
  }

  close(): void {
    this.#child.stdin.end();
    this.#child.kill();
  }
}

describe('MCP server', { skip: !ready && 'run `npm run build` and build the index first' }, () => {
  let client: Client;

  before(async () => {
    client = new Client();
    await client.request('initialize', {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    });
    client.notify('notifications/initialized');
  });

  after(() => client.close());

  describe('protocol', () => {
    it('echoes a supported protocol version and identifies itself', async () => {
      const fresh = new Client();
      const res = await fresh.request('initialize', {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'test', version: '1' },
      });
      strictEqual(res.result?.['protocolVersion'], LATEST_PROTOCOL_VERSION);
      const info = res.result?.['serverInfo'] as Record<string, string>;
      strictEqual(info['name'], 'zephyr');
      ok(typeof res.result?.['instructions'] === 'string');
      const caps = res.result?.['capabilities'] as Record<string, unknown>;
      ok(caps['tools'], 'tools capability should be advertised');
      ok(!('prompts' in caps), 'prompts must not be advertised when none are registered');
      fresh.close();
    });

    it('falls back to its newest version when asked for an unknown one', async () => {
      const fresh = new Client();
      const res = await fresh.request('initialize', {
        protocolVersion: '1999-01-01',
        capabilities: {},
        clientInfo: { name: 'test', version: '1' },
      });
      strictEqual(res.result?.['protocolVersion'], LATEST_PROTOCOL_VERSION);
      fresh.close();
    });

    it('answers ping', async () => {
      const res = await client.request('ping');
      strictEqual(res.error, undefined);
    });

    it('returns a JSON-RPC error for an unknown method', async () => {
      const res = await client.request('does/not/exist');
      strictEqual(res.error?.code, -32601);
    });

    it('never responds to a notification', async () => {
      client.notify('notifications/cancelled', { requestId: 999 });
      // If the server replied, the next request's id would not match.
      const res = await client.request('ping');
      strictEqual(res.error, undefined);
    });

    it('lists tools with schemas', async () => {
      const res = await client.request('tools/list');
      const tools = res.result?.['tools'] as { name: string; description: string; inputSchema: unknown }[];
      strictEqual(tools.length, 13);
      for (const tool of tools) {
        ok(tool.description.length > 60, `${tool.name} needs a substantial description`);
        ok(tool.inputSchema, `${tool.name} needs an inputSchema`);
      }
      const names = tools.map((t) => t.name);
      for (const expected of ['search_kconfig', 'get_binding', 'search_boards', 'index_status']) {
        ok(names.includes(expected), `expected tool ${expected}`);
      }
    });

    it('exposes the status resource', async () => {
      const list = await client.request('resources/list');
      const resources = list.result?.['resources'] as { uri: string }[];
      strictEqual(resources[0]?.uri, 'zephyr://index/status');
      const read = await client.request('resources/read', { uri: 'zephyr://index/status' });
      const contents = read.result?.['contents'] as { text: string }[];
      ok(contents[0]!.text.includes('Zephyr index'));
    });
  });

  describe('error handling', () => {
    it('reports a missing required argument as a tool error, not a protocol error', async () => {
      const res = await client.request('tools/call', { name: 'get_kconfig', arguments: {} });
      strictEqual(res.error, undefined, 'must not be a JSON-RPC error');
      strictEqual(res.result?.['isError'], true);
      const content = res.result?.['content'] as { text: string }[];
      ok(content[0]!.text.includes('name'), 'should name the missing argument');
    });

    it('returns a protocol error for an unknown tool', async () => {
      const res = await client.request('tools/call', { name: 'no_such_tool', arguments: {} });
      strictEqual(res.error?.code, -32602);
    });

    it('does not crash on FTS operator characters in a query', async () => {
      for (const query of ['"', 'a OR OR b', 'NEAR(', '*', 'st,stm32-spi', '#gpio-cells']) {
        const res = await client.call('search_bindings', { query });
        strictEqual(res.isError, false, `query ${query} should not error`);
      }
    });
  });

  describe('kconfig tools', () => {
    it('finds a symbol by description', async () => {
      const res = await client.call('search_kconfig', { query: 'bluetooth peripheral role' });
      ok(res.text.includes('BT_PERIPHERAL'), res.text.slice(0, 300));
    });

    it('accepts the CONFIG_ prefix', async () => {
      const res = await client.call('get_kconfig', { name: 'CONFIG_BT_PERIPHERAL' });
      strictEqual(res.structured['found'], true);
      ok(res.text.includes('Peripheral Role support'));
      ok(res.text.includes('Depends on'));
    });

    it('reports reverse dependencies', async () => {
      const res = await client.call('get_kconfig', { name: 'RTIO' });
      ok(res.text.includes('Selected by'), 'should list symbols that select RTIO');
      ok(res.text.includes('CONFIG_SPI_RTIO'));
    });

    it('reports an indexed-catalogue miss without inventing an alternative', async () => {
      const res = await client.call('get_kconfig', { name: 'CONFIG_BT_PERIPHERAL_MODE' });
      strictEqual(res.structured['found'], false);
      ok(res.text.includes('not found in the indexed'));
      strictEqual((res.structured['suggestions'] as string[]).length, 0);
    });
  });

  describe('devicetree tools', () => {
    it('returns the flattened property set for a compatible', async () => {
      const res = await client.call('get_binding', { compatible: 'st,stm32-spi' });
      strictEqual(res.structured['found'], true);
      // Inherited through st,stm32-spi-common -> spi-controller -> base.
      ok(res.text.includes('cs-gpios'), 'inherited property must be present');
      ok(res.text.includes('pinctrl-0'));
      ok(res.text.includes('Skeleton'), 'should include a node skeleton');
    });

    it('hides universal properties unless asked', async () => {
      const lean = await client.call('get_binding', { compatible: 'st,stm32-spi' });
      const full = await client.call('get_binding', {
        compatible: 'st,stm32-spi',
        include_common: true,
      });
      ok(!lean.text.includes('`wakeup-source`'));
      ok(full.text.includes('wakeup-source'));
    });

    it('filters bindings by vendor', async () => {
      const res = await client.call('search_bindings', { query: 'gpio', vendor: 'espressif' });
      const results = res.structured['results'] as { compatible: string }[];
      ok(results.length > 0);
      ok(results.every((r) => r.compatible.startsWith('espressif,')));
    });
  });

  describe('board tools', () => {
    it('returns qualified build targets', async () => {
      const res = await client.call('get_board', { name: 'esp32s3_devkitc' });
      ok(res.text.includes('esp32s3_devkitc/esp32s3/procpu'), 'must give the qualified target');
      ok(res.text.includes('west build -b') || res.text.includes('Build targets'));
    });

    it('accepts a qualified target as input', async () => {
      const res = await client.call('get_board', { name: 'esp32s3_devkitc/esp32s3/procpu' });
      strictEqual(res.structured['found'], true);
    });

    it('filters boards by supported feature', async () => {
      const res = await client.call('search_boards', {
        query: 'nucleo',
        vendor: 'st',
        feature: 'can',
      });
      const results = res.structured['results'] as { supported: string[] }[];
      ok(results.length > 0, 'expected ST nucleo boards with CAN');
      ok(results.every((r) => r.supported.includes('can')));
    });
  });

  describe('api tools', () => {
    it('returns parameters and errno return values', async () => {
      const res = await client.call('get_api', { name: 'gpio_pin_configure' });
      strictEqual(res.structured['found'], true);
      ok(res.text.includes('-ENOTSUP'), 'retval list should be present');
      ok(res.text.includes('Parameters'));
      strictEqual((res.structured['params'] as unknown[]).length, 3);
    });
  });

  describe('sample tools', () => {
    it('returns the prj.conf contents stored in the index', async () => {
      const res = await client.call('get_sample', { path: 'samples/basic/blinky' });
      strictEqual(res.structured['found'], true);
      ok(res.text.includes('west build -b'));
      const included = res.structured['filesIncluded'] as string[];
      ok(included.some((f) => f.startsWith('src/')), `expected source files, got ${included}`);
    });

    it('can restrict to named files', async () => {
      const res = await client.call('get_sample', {
        path: 'samples/basic/blinky',
        files: ['prj.conf'],
      });
      const included = res.structured['filesIncluded'] as string[];
      ok(!included.some((f) => f.startsWith('src/')));
    });
  });

  describe('docs tools', () => {
    it('searches sections and returns a URL', async () => {
      const res = await client.call('search_docs', { query: 'sensor fetch and get' });
      ok(res.text.includes('https://docs.zephyrproject.org/'));
      const results = res.structured['results'] as { path: string }[];
      ok(results.length > 0);
    });

    it('reads a page by path', async () => {
      const res = await client.call('get_doc', {
        path: 'doc/hardware/peripherals/sensor/index.rst',
      });
      strictEqual(res.structured['found'], true);
      ok(res.text.includes('Sensors'));
    });
  });

  describe('index_status', () => {
    it('reports the indexed version and coverage', async () => {
      const res = await client.call('index_status');
      strictEqual(res.structured['zephyrVersion'], '4.4.2');
      ok(res.text.includes('Kconfig symbols'));
      ok(Number((res.structured['counts'] as Record<string, string>)['Boards']) > 900);
    });
  });
});
