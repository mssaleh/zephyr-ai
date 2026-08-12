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
  id: number | string | null;
  method?: string;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

/** Minimal MCP client over a child process's stdio. */
class Client {
  #child: ChildProcessWithoutNullStreams;
  #buffer = '';
  #pending = new Map<number | string, (r: Response) => void>();
  #unmatched: Array<(r: Response) => void> = [];
  #queued: Response[] = [];
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
        const responseId = message.id;
        const resolver = responseId === null ? undefined : this.#pending.get(responseId);
        if (resolver) {
          this.#pending.delete(responseId as string | number);
          resolver(message);
        } else {
          const waiter = this.#unmatched.shift();
          if (waiter) waiter(message);
          else this.#queued.push(message);
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

  /** Write a frame and expect nothing back. */
  send(message: unknown): void {
    this.#child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  /** Frames the server sent that answered no request of ours. */
  get stray(): Response[] {
    return this.#queued;
  }

  exchange(message: unknown, raw = false): Promise<Response> {
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout waiting for raw response')), 20000);
      this.#unmatched.push((response) => {
        clearTimeout(timer);
        resolvePromise(response);
      });
      this.#child.stdin.write(raw ? `${String(message)}\n` : `${JSON.stringify(message)}\n`);
    });
  }

  nextMessage(): Promise<Response> {
    const queued = this.#queued.shift();
    if (queued) return Promise.resolve(queued);
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout waiting for server message')), 20000);
      this.#unmatched.push((response) => {
        clearTimeout(timer);
        resolvePromise(response);
      });
    });
  }

  respond(id: string | number, result: Record<string, unknown>): void {
    this.#child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
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

    it('enforces the complete initialization lifecycle', async () => {
      const fresh = new Client();
      const before = await fresh.request('tools/list');
      strictEqual(before.error?.code, -32600);
      const initialized = await fresh.request('initialize', {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'test', version: '1' },
      });
      strictEqual(initialized.error, undefined);
      const tooEarly = await fresh.request('tools/list');
      strictEqual(tooEarly.error?.code, -32600);
      fresh.notify('notifications/initialized');
      const readyResponse = await fresh.request('tools/list');
      strictEqual(readyResponse.error, undefined);
      const duplicate = await fresh.request('initialize');
      strictEqual(duplicate.error?.code, -32600);
      fresh.close();
    });

    it('negotiates roots and refreshes them after list_changed', async () => {
      const fresh = new Client();
      await fresh.request('initialize', {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: { roots: { listChanged: true } },
        clientInfo: { name: 'roots-client', version: '1' },
      });
      fresh.notify('notifications/initialized');
      const first = await fresh.nextMessage();
      strictEqual(first.method, 'roots/list');
      fresh.respond(first.id as string, { roots: [{ uri: `file://${REPO}` }] });
      fresh.notify('notifications/roots/list_changed');
      const second = await fresh.nextMessage();
      strictEqual(second.method, 'roots/list');
      fresh.respond(second.id as string, { roots: [{ uri: `file://${REPO}` }] });
      fresh.close();
    });

    it('rejects malformed JSON-RPC envelopes with standard IDs and codes', async () => {
      const fresh = new Client();
      const malformed = await fresh.exchange('{not json', true);
      strictEqual(malformed.id, null);
      strictEqual(malformed.error?.code, -32700);
      for (const envelope of [
        7,
        [],
        { jsonrpc: '2.0', id: 3 },
        { jsonrpc: '1.0', id: 4, method: 'ping' },
        { jsonrpc: '2.0', id: [], method: 'ping' },
        { jsonrpc: '2.0', id: 6, method: 'ping', params: [] },
      ]) {
        const response = await fresh.exchange(envelope);
        strictEqual(response.error?.code, -32600);
      }
      fresh.close();
    });

    it('never answers a response frame whose id it does not recognise', async () => {
      // A roots/list answer arriving after the 5s timeout dropped the correlation.
      // Replying would put a JSON-RPC error on the wire against a client-owned id.
      const fresh = new Client();
      fresh.send({ jsonrpc: '2.0', id: 'zephyr-roots-999', result: { roots: [] } });
      // Lines are processed in order, so any reply is already queued by the pong.
      const pong = await fresh.request('ping');
      strictEqual(pong.error, undefined);
      strictEqual(fresh.stray.length, 0);
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

    it('enforces every reproduced schema boundary without coercion', async () => {
      for (const [name, args] of [
        ['get_doc', { path: 'kernel/index.rst', max_chars: 1 }],
        ['get_kconfig', { name: 'BT', bogus_property: 'x' }],
        ['search_kconfig', { query: 'gpio', limit: '3' }],
      ] as const) {
        const res = await client.request('tools/call', { name, arguments: args });
        strictEqual(res.error, undefined);
        strictEqual(res.result?.['isError'], true);
        const text = ((res.result?.['content'] ?? []) as { text: string }[])[0]?.text ?? '';
        ok(text.includes('Invalid input'), text);
      }
    });

    it('returns a protocol error for an unknown tool', async () => {
      const res = await client.request('tools/call', { name: 'no_such_tool', arguments: {} });
      strictEqual(res.error?.code, -32602);
    });

    it('reports unknown catalogue entities as correctable tool errors', async () => {
      const res = await client.call('get_kconfig', { name: 'CONFIG_BT_PERIPHERAL_MODE' });
      strictEqual(res.isError, true);
      ok(res.text.includes('not found in the indexed'));
      ok(!res.text.includes('does not exist in Zephyr'));
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

    it('does not turn absent return documentation into a no-failure claim', async () => {
      const res = await client.call('get_api', { name: 'adc_raw_to_microvolts' });
      strictEqual(res.structured['found'], true);
      ok(res.text.includes('No return description is present'));
      ok(res.text.includes('does not prove the call cannot fail'));
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

    it('renders the coverage map and its scope in the text answer', async () => {
      // The completeness signal must reach the model that reads the Markdown, not
      // only clients that read structuredContent.
      const res = await client.call('index_status');
      ok(res.text.includes('**Coverage**'));
      ok(/kconfig: incomplete — /.test(res.text));
      ok(res.text.includes("never describes this project's own Kconfig"));
    });
  });
});
