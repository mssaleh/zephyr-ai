/**
 * End-to-end conformance test: spawns the built server and drives it over
 * stdio exactly as a client would.
 */

import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { after, before, describe, it } from 'node:test';

import { LATEST_PROTOCOL_VERSION } from '../src/protocol.ts';

const REPO = resolve(process.cwd(), '..', '..');
const SERVER = join(REPO, 'plugin', 'mcp', 'zephyr-mcp.mjs');
const INDEX = process.env['ZEPHYR_AI_INDEX'] ?? join(REPO, 'index', 'zephyr.db');
const ready = existsSync(SERVER) && existsSync(INDEX);

/** The tree the index under test was built from, as it recorded it. */
function indexedTree(): string {
  const db = new DatabaseSync(INDEX, { readOnly: true });
  try {
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('source_path') as
      | { value: string }
      | undefined;
    return row?.value ?? '';
  } finally {
    db.close();
  }
}
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
      strictEqual(tools.length, 17);
      for (const tool of tools) {
        ok(tool.description.length > 60, `${tool.name} needs a substantial description`);
        ok(tool.inputSchema, `${tool.name} needs an inputSchema`);
      }
      const names = tools.map((t) => t.name);
      for (const expected of ['search_kconfig', 'get_binding', 'search_boards', 'get_source', 'index_status', 'check_config', 'get_runner', 'check_environment']) {
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

  describe('check_config', () => {
    it('gives a verdict per line for a whole Kconfig fragment', async () => {
      const res = await client.call('check_config', {
        path: 'prj.conf',
        text: [
          'CONFIG_BT=y',
          'CONFIG_BT_BUF_ACL_RX_SIZE=y',
          'CONFIG_MALFORMED',
          'CONFIG_ZEPHYR_AI_INVENTED_SYMBOL=y',
        ].join('\n'),
      });
      strictEqual(res.structured['kind'], 'kconfig');
      strictEqual(res.structured['checked'], 4);
      strictEqual(res.structured['problemCount'], 2);
      ok(res.text.includes('is int but is set to "y"'));
      ok(res.text.includes('malformed Kconfig assignment'));
      // An unknown symbol is scope, never a mistake: generated and
      // application-local symbols live outside the catalogue by construction.
      ok(res.text.includes('not in the indexed catalogue'));
      ok(!res.text.includes('CONFIG_ZEPHYR_AI_INVENTED_SYMBOL is'), 'absence must not be a finding');
    });

    it('separates what it verified from what it could not judge', async () => {
      // CONFIG_LV_USE_MONKEY is declared only in modules/lvgl/Kconfig, a mirror
      // of a symbol the lvgl module declares with a prompt. Suppressing the
      // promptless complaint is right. Returning `ok, bool` — the identical
      // verdict CONFIG_GPIO=y gets, which was verified in full — reported a
      // check that did not happen.
      const res = await client.call('check_config', {
        path: 'prj.conf',
        text: ['CONFIG_GPIO=y', 'CONFIG_LV_USE_MONKEY=y'].join('\n'),
      });
      const verdicts = res.structured['verdicts'] as { subject: string; status: string; note: string }[];
      strictEqual(verdicts.find((v) => v.subject.includes('GPIO'))?.status, 'ok');
      const monkey = verdicts.find((v) => v.subject.includes('LV_USE_MONKEY'));
      strictEqual(monkey?.status, 'not-judged');
      ok(monkey.note.includes('modules/lvgl'), 'the reason must name what was not read');
      strictEqual(res.structured['problemCount'], 0);
      strictEqual(res.structured['notJudgedCount'], 1);
      strictEqual(res.structured['confirmedCount'], 1);
      ok(res.text.includes('1 confirmed, 1 not judged'));
    });

    it('checks devicetree without checking property names', async () => {
      const res = await client.call('check_config', {
        path: 'app.overlay',
        text:
          '&spi1 {\n screen: s@0 {\n  compatible = "sitronix,st7789v";\n' +
          '  not-a-real-property = <1>;\n };\n};\n',
      });
      strictEqual(res.structured['kind'], 'devicetree');
      strictEqual(res.structured['problemCount'], 0);
      ok(!res.text.includes('not-a-real-property'), 'property names belong to get_binding');
    });

    it('infers the file kind from content when no path is given', async () => {
      const dt = await client.call('check_config', {
        text: 'a { compatible = "sitronix,st7789v"; };',
      });
      strictEqual(dt.structured['kind'], 'devicetree');
      const kc = await client.call('check_config', { text: 'CONFIG_BT=y\n' });
      strictEqual(kc.structured['kind'], 'kconfig');
      const neither = await client.call('check_config', { text: 'hello world\n' });
      strictEqual(neither.isError, true);
      ok(neither.text.includes('kind'));
    });

    it('does not report a promptless assignment in a defconfig', async () => {
      // A defconfig is exactly where assigning a promptless symbol is correct,
      // so the same line is a finding in prj.conf and not one here.
      const symbol = await client.call('search_kconfig', { query: 'sensor', limit: 1 });
      ok(symbol.text.length > 0);
      const text = 'CONFIG_SENSOR_LOG_LEVEL_DBG=y\n';
      const asApp = await client.call('check_config', { path: 'prj.conf', text });
      const asDefconfig = await client.call('check_config', { path: 'board_defconfig', text });
      ok(Number(asDefconfig.structured['problemCount']) <= Number(asApp.structured['problemCount']));
    });
  });

  describe('the sysbuild Kconfig namespace', () => {
    it('answers SB_CONFIG_ from the sysbuild tree, not the application tree', async () => {
      const res = await client.call('get_kconfig', { name: 'SB_CONFIG_BOOTLOADER_MCUBOOT' });
      strictEqual(res.structured['found'], true);
      strictEqual(res.structured['name'], 'SB_CONFIG_BOOTLOADER_MCUBOOT');
      // The two declarations mean opposite things: one includes MCUboot in the
      // build, the other marks this image as chain-loaded by it.
      strictEqual(res.structured['prompt'], 'MCUboot');
      ok(String(res.structured['help']).includes('Include MCUboot'));
    });

    it('warns when a name means something else in the other namespace', async () => {
      const app = await client.call('get_kconfig', { name: 'CONFIG_BOOTLOADER_MCUBOOT' });
      strictEqual(app.structured['prompt'], 'MCUboot bootloader support');
      ok(app.text.includes('A different symbol shares this name'));
      ok(app.text.includes('SB_CONFIG_BOOTLOADER_MCUBOOT'));
    });

    it('stays silent when the same name is the same symbol', async () => {
      // 2866 of the 2876 shared names are one symbol reached through both roots,
      // because share/sysbuild/Kconfig sources the whole board and SoC tree. A
      // warning on those would be noise on almost every board symbol.
      const shared = await client.call('get_kconfig', { name: 'CONFIG_BT' });
      ok(!shared.text.includes('A different symbol shares this name'));
    });

    it('redirects a sysbuild-only symbol instead of offering near misses', async () => {
      const res = await client.call('get_kconfig', { name: 'MCUBOOT_MODE_SWAP_USING_MOVE' });
      ok(res.isError);
      ok(res.text.includes('SB_CONFIG_MCUBOOT_MODE_SWAP_USING_MOVE'));
      ok(res.text.includes('sysbuild.conf'));
      ok(!res.text.includes('Close spelling matches'), 'the exact symbol exists; do not guess');
    });

    it('searches one namespace at a time', async () => {
      const sys = await client.call('search_kconfig', { query: 'mcuboot mode', scope: 'sysbuild' });
      const names = (sys.structured['results'] as { name: string }[]).map((r) => r.name);
      ok(names.length > 0);
      ok(names.every((n) => n.startsWith('SB_CONFIG_')), `got ${names.join(', ')}`);
      ok(names.some((n) => n.includes('MCUBOOT_MODE')));

      const app = await client.call('search_kconfig', { query: 'bluetooth peripheral' });
      const appNames = (app.structured['results'] as { name: string }[]).map((r) => r.name);
      ok(appNames.every((n) => n.startsWith('CONFIG_')), `got ${appNames.join(', ')}`);
    });

    it('reports a CONFIG_ line in sysbuild.conf as ignored by the build', async () => {
      const res = await client.call('check_config', {
        path: 'sysbuild.conf',
        text: 'SB_CONFIG_BOOTLOADER_MCUBOOT=y\nCONFIG_BOOTLOADER_MCUBOOT=y\nCONFIG_BT=y\n',
      });
      ok(res.text.includes('The build ignores it silently'));
      // Named only where the counterpart exists; SB_CONFIG_BT does not.
      ok(res.text.includes('`SB_CONFIG_BOOTLOADER_MCUBOOT` exists'));
      ok(!res.text.includes('`SB_CONFIG_BT` exists'));
    });
  });

  describe('check_environment', () => {
    it('separates the interpreter a build uses from the one the indexer used', async () => {
      const res = await client.call('check_environment');
      const interpreters = res.structured['interpreters'] as {
        path: string;
        role: string;
        missing: string[];
      }[];
      ok(interpreters.length > 0, 'at least the interpreter running the tests must be visible');
      // The whole point of the tool: CMake resolves Python from PATH, so python3
      // is the build's interpreter whatever the indexer preferred.
      const build = interpreters.find((item) => item.path === 'python3');
      ok(build, 'python3 must be probed and labelled');
      ok(build.role.includes('CMake'), `python3 must be labelled as the build interpreter: ${build.role}`);
      ok(res.text.includes('Python interpreters'));
    });

    it('never reports a requirement whose marker excludes this platform', async () => {
      // Zephyr requires windows-curses only on win32. Calling it missing on Linux
      // would be a false report of a broken environment, which is how a checker
      // gets ignored along with everything else the plugin says.
      const res = await client.call('check_environment');
      const interpreters = res.structured['interpreters'] as { missing: string[] }[];
      for (const item of interpreters) {
        ok(
          !item.missing.includes('windows-curses'),
          'a requirement excluded by its environment marker must not be reported missing',
        );
      }
      if (process.platform !== 'win32') ok(!res.text.includes('windows-curses'));
    });

    it('grounds the toolchain advice in what this Zephyr ships', async () => {
      const res = await client.call('check_environment');
      // 4.4 ships `west sdk`; the advice must come from the indexed command list
      // rather than assuming a command that older trees do not have.
      strictEqual(res.structured['shipsWestSdk'], true);
      ok((res.structured['requirements'] as number) > 0, 'the index must record a requirements list');
    });

    it('names the runners a board needs on the host without inventing binaries', async () => {
      const res = await client.call('check_environment', { board: 'esp32s3_devkitc' });
      ok(res.text.includes('esp32'));
      ok(res.text.includes('openocd'));
      ok(res.text.includes('host-tools.rst'), 'it must point at the indexed host-tool document');
      // There is no uniform declaration of a runner's host binary, so it must not
      // claim to have checked for one.
      ok(!/\besptool\b/.test(res.text), 'must not name a host binary it cannot verify');
    });
  });

  describe('west runners', () => {
    // Every fact here is checked against the resolved runners.yaml that Zephyr's
    // own build system writes, for these same boards.
    it('names both defaults, which are not always the same runner', async () => {
      const esp = await client.call('get_board', { name: 'esp32s3_devkitc' });
      const runners = esp.structured['runners'] as {
        runner: string;
        available: boolean;
        flashDefault: boolean;
        debugDefault: boolean;
      }[];
      strictEqual(runners.find((r) => r.flashDefault)?.runner, 'esp32');
      strictEqual(runners.find((r) => r.debugDefault)?.runner, 'openocd');
      ok(esp.text.includes('`west flash` uses `esp32`'));
      ok(esp.text.includes('`west debug` uses `openocd`'));

      // A board whose two defaults coincide must not be described as if they differ.
      const sim = await client.call('get_board', { name: 'native_sim' });
      const simRunners = sim.structured['runners'] as { runner: string }[];
      strictEqual(simRunners.length, 1);
      strictEqual(simRunners[0]?.runner, 'native');
    });

    it('separates a declared runner from a registered one', async () => {
      // qemu_cortex_m3 sets qemu as the debug default and never finalises it, so
      // Zephyr writes no runners.yaml at all and `west debug` has nothing to run.
      // Reporting it as available would send the reader at a command that fails.
      const res = await client.call('get_board', { name: 'qemu_cortex_m3' });
      const runners = res.structured['runners'] as {
        runner: string;
        available: boolean;
        debugDefault: boolean;
      }[];
      strictEqual(runners.length, 1);
      strictEqual(runners[0]?.runner, 'qemu');
      strictEqual(runners[0]?.debugDefault, true);
      strictEqual(runners[0]?.available, false);
      ok(res.text.includes('not registered'));
      ok(!res.text.includes('`west debug` uses'));
    });

    it('never splits a preset flag from the value it takes', async () => {
      // board_runner_args is a flat argument vector, so `--cmd-load` and the command
      // it loads are separate entries. openocd's value is ${OPENOCD_CMD_LOAD_DEFAULT},
      // expanded at build time; printing the flag without it would read as a complete
      // argument and is worse than printing nothing.
      const res = await client.call('get_board', { name: 'nucleo_h743zi' });
      if (res.text.includes('Arguments the board always passes')) {
        const block = res.text.slice(res.text.indexOf('Arguments the board always passes'));
        ok(!block.includes('--cmd-load'), 'a flag whose value is unexpanded must not be shown');
        ok(!/\$\{/.test(block), 'no unexpanded reference may reach the reader');
      }
      // The runner whose arguments are all settled is still shown in full.
      ok(res.text.includes('`--port=swd` `--reset-mode=hw`'));
    });

    it('reports capabilities read from this tree, not from a fixed list', async () => {
      const res = await client.call('get_runner', { name: 'stm32cubeprogrammer' });
      strictEqual(res.structured['found'], true);
      const capabilities = res.structured['capabilities'] as Record<string, unknown>;
      // The runner class declares exactly these three; passing any other value to
      // --reset-type is rejected before the probe is touched.
      deepStrictEqual(capabilities['reset_types_supported'], ['sw', 'hw', 'core']);
      deepStrictEqual(res.structured['commands'], ['flash']);
      ok(res.text.includes('`sw`, `hw`, `core`'));
      // It flashes but does not debug, so it must not be offered for `west debug`.
      ok(!res.text.includes('`west debug`'));
    });

    it('filters boards by a runner they actually register', async () => {
      const res = await client.call('search_boards', { query: 'nucleo', runner: 'pyocd', limit: 5 });
      const results = res.structured['results'] as { name: string }[];
      ok(results.length > 0);
      for (const board of results) {
        const detail = await client.call('get_board', { name: board.name });
        const runners = detail.structured['runners'] as { runner: string; available: boolean }[];
        ok(
          runners.some((r) => r.runner === 'pyocd' && r.available),
          `${board.name} was returned for runner=pyocd but does not register it`,
        );
      }
    });

    it('reports an unknown runner as a catalogue miss, not as absence', async () => {
      const res = await client.call('get_runner', { name: 'openocd2' });
      strictEqual(res.structured['found'], false);
      ok(res.text.includes('was not found in the indexed Zephyr'));
      ok(res.text.includes('openocd'), 'a one-character miss must suggest the real runner');
    });
  });

  describe('batched lookups', () => {
    // One fact per call lost to the shell: a single `for` loop checked thirteen
    // Kconfig symbols in one command, so an agent economising on tool calls
    // reached for grep and got a weaker answer than the index holds.
    const SYMBOLS = [
      'SETTINGS_NVS',
      'NVS',
      'HTS221',
      'LPS22HB',
      'LSM6DSL',
      'BT_SETTINGS',
      'WATCHDOG',
      'BT_GATT_DYNAMIC_DB',
    ];

    it('answers many Kconfig symbols in one call, with more than grep gives', async () => {
      const res = await client.call('get_kconfig', { names: SYMBOLS });
      strictEqual(res.structured['requested'], SYMBOLS.length);
      const results = res.structured['results'] as { name: string; found: boolean }[];
      strictEqual(results.length, SYMBOLS.length);
      ok(results.every((r) => r.found), 'every symbol above is indexed');
      for (const symbol of SYMBOLS) ok(res.text.includes(`CONFIG_${symbol}`), `${symbol} missing`);
      // The point of the batch is that it beats `grep "^config FOO$"` on content,
      // not only on call count.
      ok(res.text.includes('Depends on'));
      ok(res.text.includes('Choice alternatives'));
    });

    it('reports a miss inside a batch without discarding the rest', async () => {
      const res = await client.call('get_kconfig', {
        names: ['NVS', 'A_SYMBOL_THAT_IS_NOT_INDEXED', 'WATCHDOG'],
      });
      const results = res.structured['results'] as { name: string; found: boolean }[];
      strictEqual(results.length, 3);
      strictEqual(results.filter((r) => r.found).length, 2);
      ok(res.text.includes('was not found in the indexed Zephyr'));
      ok(res.text.includes('CONFIG_WATCHDOG'), 'a miss must not abort the entries after it');
    });

    it('batches bindings and API symbols too', async () => {
      const bindings = await client.call('get_binding', {
        compatibles: ['st,lsm6dsl', 'st,hts221'],
      });
      strictEqual((bindings.structured['results'] as unknown[]).length, 2);
      ok(bindings.text.includes('Required properties'));

      const api = await client.call('get_api', {
        names: ['sensor_sample_fetch', 'sensor_channel_get'],
      });
      strictEqual((api.structured['results'] as unknown[]).length, 2);
      ok(api.text.includes('sensor_sample_fetch') && api.text.includes('sensor_channel_get'));
    });

    it('keeps the singular form and its full answer unchanged', async () => {
      const res = await client.call('get_kconfig', { name: 'SETTINGS_NVS' });
      // The flat, per-symbol structuredContent shape, not the batch envelope.
      strictEqual(res.structured['name'], 'CONFIG_SETTINGS_NVS');
      strictEqual(res.structured['requested'], undefined);
      ok(res.text.includes('Definition contexts'));
    });

    it('rejects supplying both the singular and plural argument', async () => {
      const res = await client.call('get_kconfig', { name: 'NVS', names: ['NVS'] });
      strictEqual(res.isError, true);
      ok(res.text.includes('not both'));
    });

    it('collapses duplicates rather than spending the budget twice', async () => {
      const res = await client.call('get_kconfig', { names: ['NVS', 'CONFIG_NVS', 'NVS'] });
      // CONFIG_NVS normalises to NVS only after the dedupe, so three inputs
      // become two lookups and one duplicated rendering — not three.
      ok(Number(res.structured['requested']) < 3);
    });

    it('rejects a batch larger than the declared maximum', async () => {
      const res = await client.call('get_kconfig', {
        names: Array.from({ length: 51 }, (_, i) => `SYMBOL_${i}`),
      });
      strictEqual(res.isError, true);
      ok(res.text.includes('Invalid input'));
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

    it('bounds a symbol defined by hundreds of board defconfigs', async () => {
      // NUM_IRQS has 730 definition contexts. Rendering them all produced a
      // quarter-megabyte answer, which is a context and latency problem, not a
      // correctness one, so the cap must be visible rather than silent.
      const res = await client.call('get_kconfig', { name: 'NUM_IRQS' });
      strictEqual(res.structured['found'], true);
      strictEqual(res.structured['definitionsTruncated'], true);
      ok(Number(res.structured['definitionCount']) > 500);
      ok((res.structured['definitions'] as unknown[]).length <= 12);
      ok(res.text.includes('of 730'), res.text.slice(0, 200));
      ok(res.text.includes('further definition context'));
      ok(res.text.length < 20000, `response was ${res.text.length} characters`);
    });

    it('lists the alternatives in a choice', async () => {
      // Naming SETTINGS_BACKEND without its members is what sent an agent to
      // grep subsys/settings/Kconfig for the backends it could pick from.
      const res = await client.call('get_kconfig', { name: 'SETTINGS_NVS' });
      strictEqual(res.structured['choice'], 'SETTINGS_BACKEND');
      const members = res.structured['choiceMembers'] as { name: string }[];
      ok(members.some((m) => m.name === 'CONFIG_SETTINGS_FCB'));
      ok(members.some((m) => m.name === 'CONFIG_SETTINGS_FILE'));
      ok(!members.some((m) => m.name === 'CONFIG_SETTINGS_NVS'), 'the symbol is not its own sibling');
      ok(res.text.includes('Alternatives in this choice'));
      ok(res.text.includes('CONFIG_SETTINGS_FCB'), res.text.slice(0, 400));
    });

    it('does not truncate a symbol with a single definition', async () => {
      const res = await client.call('get_kconfig', { name: 'CONFIG_BT_PERIPHERAL' });
      strictEqual(res.structured['definitionsTruncated'], false);
      ok(!res.text.includes('further definition context'));
    });

    it('suggests the real symbol for a one-character typo', async () => {
      // Full-text search alone cannot reach this: PERIPHERL is not a prefix of
      // PERIPHERAL, so the candidate pool used to fill with BT_*_LOG_LEVEL_*.
      const res = await client.call('get_kconfig', { name: 'CONFIG_BT_PERIPHERL' });
      strictEqual(res.isError, true);
      ok(res.text.includes('CONFIG_BT_PERIPHERAL'), res.text);
    });
  });

  describe('driver identity', () => {
    it('states what the driver accepts, in the binding answer', async () => {
      // The question the gateway study spent three steps and a grep on: an I2C
      // part at 0x68 reporting WHO_AM_I = 0x19. The authoritative fact is
      // MPU6880_CHIP_ID in the driver header, and no binding, board file or
      // documentation page contains it.
      const res = await client.call('get_binding', { compatible: 'invensense,mpu6050' });
      ok(res.text.includes('Driver identity check'), 'the contract must be in the answer');
      ok(res.text.includes('0x19'), 'the accepted value must be stated');
      const identity = res.structured['identity'] as { register: number; accepts: { value: number }[] };
      strictEqual(identity.register, 0x75);
      ok(identity.accepts.some((entry) => entry.value === 0x19));
    });

    it('answers the reverse direction, which is the one a bench has', async () => {
      const res = await client.call('search_bindings', { identity_value: '0x19' });
      const results = res.structured['results'] as { compatible: string }[];
      ok(
        results.some((entry) => entry.compatible === 'invensense,mpu6050'),
        'reading 0x19 off a part must reach the compatible that accepts it',
      );
      // An identity value is not unique across vendors, and an answer that does
      // not say so invites binding the first driver returned.
      ok(res.text.includes('not unique'));
    });

    it('reports a miss as a limit of the corpus, not as absence', async () => {
      const res = await client.call('search_bindings', { identity_value: '0xfe', identity_register: '0x7f' });
      ok(res.text.includes('not proof'), 'a miss must not read as "no driver accepts this"');
    });

    it('rejects an identity value that is not a number', async () => {
      const res = await client.call('search_bindings', { identity_value: 'who-knows' });
      strictEqual(res.isError, true);
    });
  });

  describe('devicetree tools', () => {
    it('matches part of a compatible when the vendor prefix is not known', async () => {
      // dt_fts tokenises on `_,-`, so `st,stm32-digi-temp` is one token and a
      // fragment matches nothing. Searching bindings is the tool for when the
      // compatible is exactly what is not known, and the miss used to volunteer
      // "out-of-tree drivers are not in this index" about a binding that is
      // present — a reason to stop looking, offered wrongly.
      for (const query of ['stm32-digi-temp', 'digi-temp']) {
        const res = await client.call('search_bindings', { query });
        const results = res.structured['results'] as { compatible: string }[];
        ok(
          results.some((entry) => entry.compatible === 'st,stm32-digi-temp'),
          `"${query}" must reach st,stm32-digi-temp`,
        );
        ok(!res.text.includes('out-of-tree drivers are not in this index'));
      }
    });

    it('names the node a board carries, not only the board', async () => {
      // The node name is the part number. "used on m5stack_atoms3" requires the
      // reader to know what that board carries; the node says `mpu6886@68`.
      const res = await client.call('get_binding', { compatible: 'invensense,mpu6050' });
      ok(res.text.includes('mpu6886@68'), 'the node name must be rendered with the board');
    });

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

    it('never hides that a device has a binding per bus', async () => {
      // A part reachable over both I2C and SPI has one binding per bus, and they
      // do not require the same properties — the SPI one needs
      // spi-max-frequency. Returning whichever row the database stored first
      // answered an I2C question for a SPI part, silently, and the node would
      // fail to build. The compatible is read from the index, so the test states
      // the rule rather than one vendor's part.
      const dual = await client.call('search_bindings', { query: 'accelerometer', bus: 'spi' });
      const candidates = (dual.structured['results'] as { compatible: string }[]).map((r) => r.compatible);

      let exercised = 0;
      for (const compatible of candidates) {
        const res = await client.call('get_binding', { compatible });
        const variants = res.structured['busVariants'] as { onBus: string | null }[];
        if (variants.length < 2) continue;
        exercised++;
        ok(res.text.includes('bindings, one per bus'), `${compatible} hid its bus variants`);

        const spi = await client.call('get_binding', { compatible, on_bus: 'spi' });
        strictEqual(spi.structured['onBus'], 'spi');
        const required = (spi.structured['required'] as { name: string }[]).map((p) => p.name);
        ok(required.includes('spi-max-frequency'), `${compatible} on spi must require it`);
        break;
      }
      ok(exercised > 0, 'no dual-bus binding was reached, so the rule went untested');
    });

    it('refuses a bus the compatible is not declared for', async () => {
      const res = await client.call('get_binding', {
        compatible: 'st,lsm6dsl',
        on_bus: 'not-a-bus',
      });
      strictEqual(res.isError, true);
      ok(res.text.includes('It is declared for'));
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

    it('names upstream configuration published for this board target', async () => {
      // ST publishes a SPI loopback overlay for this exact target, with the DMA
      // channels, request numbers and cache attributes. The suite names the
      // board in no Twister key, so a search on platform metadata reported that
      // nothing upstream configures it, and a session wrote its own from
      // scratch and ran at 1 MHz without DMA.
      const res = await client.call('get_board', { name: 'nucleo_n657x0_q' });
      const files = res.structured['upstreamConfiguration'] as { suite: string; file: string }[];
      ok(files.length > 0, 'the board ships upstream configuration files');
      ok(
        files.some((entry) => entry.suite.includes('spi_loopback') && entry.file.endsWith('.overlay')),
        'the SPI loopback overlay must be reachable from get_board',
      );
      ok(res.text.includes('Upstream configures this board'));
    });

    it('states the memory the application gets, not only the Twister figures', async () => {
      // twister.yaml declares 1024 KB of each for this board. The application
      // gets 511 KB of SRAM at 0x34180400 and no internal flash, and that is
      // decided by the board's chosen node.
      const res = await client.call('get_board', { name: 'nucleo_n657x0_q' });
      const memory = res.structured['memory'] as { role: string; address: number; size: number }[];
      const sram = memory.find((entry) => entry.role === 'sram');
      ok(sram, 'the board declares zephyr,sram');
      strictEqual(sram.address, 0x34180400);
      strictEqual(sram.size, 511 * 1024);
      ok(res.text.includes('0x34180400'));
    });

    it('says nothing about memory it could not resolve', async () => {
      // Silence is the contract where the devicetree chain is ambiguous: a wrong
      // address is worse than no address.
      for (const board of ['esp32s3_devkitc', 'nucleo_f401re', 'm5stack_atoms3']) {
        const res = await client.call('get_board', { name: board });
        const memory = res.structured['memory'] as { address: number; size: number }[];
        for (const entry of memory) {
          ok(Number.isInteger(entry.address) && entry.address >= 0, `${board} address must be real`);
          ok(Number.isInteger(entry.size) && entry.size > 0, `${board} size must be real`);
        }
      }
    });

    it('accepts board as an alias for the get_board name argument', async () => {
      const res = await client.call('get_board', { board: 'm5stack_atoms3' });
      strictEqual(res.structured['found'], true);
      strictEqual(res.structured['name'], 'm5stack_atoms3');
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

    it('reports the memory figures and SoC series it holds for a board', async () => {
      // Board-level ram and flash were selected and then dropped, so they
      // reached a caller only through targets that happen to carry Twister
      // metadata — a generated qualifier target carries none. Upstream leaves
      // both unset for some boards, so the claim is "renders what it holds",
      // not "every board has figures".
      const found = await client.call('search_boards', { query: 'nucleo', limit: 10 });
      const names = (found.structured['results'] as { name: string }[]).map((r) => r.name);

      let exercised = 0;
      for (const name of names) {
        const res = await client.call('get_board', { name });
        const flash = res.structured['flash'];
        const ram = res.structured['ram'];
        const socs = res.structured['socs'] as { name: string; series: string }[];
        ok(socs.length > 0 && socs.every((s) => s.series !== ''), `${name} surfaced no SoC series`);
        if (flash === null || ram === null) continue;
        exercised++;
        ok(res.text.includes(`${String(flash)} KB flash`), `${name} stored flash unrendered`);
        ok(res.text.includes(`${String(ram)} KB RAM`), `${name} stored ram unrendered`);
      }
      ok(exercised > 0, 'no board carried both figures, so the invariant went untested');
    });

    it('names near-twin boards symmetrically and only real ones', async () => {
      // Confusing two products built on one PCB reference is an error no
      // document check catches, because the documents look alike too. The rule
      // is structural — same vendor, same SoC series, part codes within two
      // edits — so these invariants hold for whatever boards it selects.
      const found = await client.call('search_boards', { query: 'nucleo', limit: 20 });
      const names = (found.structured['results'] as { name: string }[]).map((r) => r.name);

      let exercised = 0;
      for (const name of names) {
        const res = await client.call('get_board', { name });
        const twins = res.structured['nearTwins'] as { name: string; differs: string[] }[];
        if (twins.length === 0) continue;
        exercised++;
        ok(res.text.includes('Easily confused with'), `${name} found twins but rendered none`);
        for (const twin of twins.slice(0, 3)) {
          const back = await client.call('get_board', { name: twin.name });
          strictEqual(back.structured['found'], true, `${twin.name} is not a real board`);
          const reverse = back.structured['nearTwins'] as { name: string }[];
          ok(
            reverse.some((t) => t.name === name),
            `${name} names ${twin.name} as a twin but not the reverse`,
          );
        }
      }
      ok(exercised > 0, 'no board reported a twin, so the rule went untested');
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

    it('lists the members of an enum', async () => {
      // Returning the enum as an opaque type is what sent an agent to grep
      // display.h for the values it is allowed to pass.
      const res = await client.call('get_api', { name: 'display_pixel_format' });
      strictEqual(res.structured['found'], true);
      strictEqual(res.structured['kind'], 'enum');
      const members = res.structured['members'] as { name: string; brief: string }[];
      ok(members.length >= 10, `expected the full member list, got ${members.length}`);
      ok(members.some((m) => m.name === 'PIXEL_FORMAT_RGB_565'));
      ok(res.text.includes('Members'));
      ok(res.text.includes('PIXEL_FORMAT_RGB_565'), res.text.slice(0, 400));
    });

    it('resolves an attribute-decorated enum to its definition', async () => {
      // `enum __packed bt_conn_type` resolved to the struct field that uses the
      // type: wrong line, a field's signature, and no members.
      const res = await client.call('get_api', { name: 'bt_conn_type' });
      strictEqual(res.structured['kind'], 'enum');
      strictEqual(res.structured['line'], 523);
      ok(
        (res.structured['members'] as { name: string }[]).some((m) => m.name === 'BT_CONN_TYPE_LE'),
      );
    });
  });

  describe('source tool', () => {
    it('returns a line range read from the indexed commit', async () => {
      const res = await client.call('get_source', {
        path: 'include/zephyr/drivers/display.h',
        start: 49,
        end: 49,
      });
      strictEqual(res.structured['found'], true);
      // Read from the object database, so a checkout that has moved on since
      // the index was built still yields the indexed revision.
      strictEqual(res.structured['verifiedAtCommit'], true);
      strictEqual(res.structured['start'], 49);
      strictEqual(res.structured['end'], 49);
      ok(String(res.structured['content']).includes('enum display_pixel_format'));
      ok(
        String(res.structured['reference']).startsWith('zephyrproject-rtos/zephyr@'),
        `reference was ${String(res.structured['reference'])}`,
      );
      ok(res.text.includes('#L49-L49'));
    });

    it('accepts an absolute path inside the indexed tree', async () => {
      // A model pasting a path it read from its own shell supplies an absolute
      // one; refusing it would be a pointless round trip.
      const res = await client.call('get_source', { path: join(indexedTree(), 'VERSION') });
      strictEqual(res.structured['path'], 'VERSION');
      ok(String(res.structured['content']).includes('VERSION_MAJOR'));
    });

    it('refuses to leave the indexed tree', async () => {
      for (const path of ['../../etc/passwd', '/etc/passwd', 'include/../../../etc/passwd']) {
        const res = await client.call('get_source', { path });
        strictEqual(res.isError, true, `${path} should be refused`);
      }
    });

    it('reports a missing path and a directory as correctable errors', async () => {
      const missing = await client.call('get_source', { path: 'include/zephyr/drivers/nope.h' });
      strictEqual(missing.isError, true);
      ok(missing.text.includes('does not exist'));

      const directory = await client.call('get_source', { path: 'include/zephyr/drivers' });
      strictEqual(directory.isError, true);
      ok(directory.text.includes('is a directory'));
    });

    it('truncates a large file and says where to resume', async () => {
      const res = await client.call('get_source', {
        path: 'include/zephyr/drivers/display.h',
        max_chars: 400,
      });
      strictEqual(res.structured['truncated'], true);
      ok(Number(res.structured['end']) < Number(res.structured['totalLines']));
      ok(res.text.includes(`start: ${Number(res.structured['end']) + 1}`));
    });
  });

  describe('sample tools', () => {
    it('counts a suite that names a board only through a boards/ file', async () => {
      // The question that separated the arms in the gateway study: how much
      // upstream material names this board. Counting Twister keys alone answered
      // "two"; eight further suites ship a file named for one of its qualified
      // targets and never appear in a Twister list.
      const res = await client.call('search_samples', { board: 'nucleo_n657x0_q', limit: 40 });
      const results = res.structured['results'] as {
        path: string;
        boardEvidence: string[];
        boardFiles: { path: string }[];
      }[];
      const byFile = results.filter(
        (entry) => entry.boardFiles.length > 0 && entry.boardEvidence.includes('a file under boards/'),
      );
      ok(byFile.length >= 5, `expected suites found through boards/ files, got ${byFile.length}`);
      ok(
        results.some((entry) => entry.path.includes('spi_loopback')),
        'the SPI loopback suite configures this target and must be listed',
      );
      ok(res.text.includes("upstream's own configuration for this target"));
    });

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

    it('renders every platform list it stores, not only the CI subset', async () => {
      // A column that is indexed but never rendered is invisible in a way no row
      // count catches. get_sample stored platform_allow and showed it only when
      // integration_platforms was empty, so "not in CI" read as "not supported"
      // — and a reader concluded no upstream sample named a board that several
      // of them name. The assertion is the invariant, not any one sample.
      const found = await client.call('search_samples', { query: 'net', limit: 15 });
      const paths = (found.structured['results'] as { path: string }[]).map((r) => r.path);

      let exercised = 0;
      for (const path of paths) {
        const res = await client.call('get_sample', { path, max_chars: 1000 });
        const allow = res.structured['platformAllow'] as string[];
        const integration = res.structured['integrationPlatforms'] as string[];
        if (allow.length === 0 || integration.length === 0) continue;
        exercised++;
        ok(res.text.includes('platform allowlist'), `${path} stored platform_allow unrendered`);
        ok(res.text.includes('integration platforms'), `${path} stored integration unrendered`);
        ok(res.text.includes(allow[0]!), `${path} did not name ${allow[0]}`);
      }
      ok(exercised > 0, 'no sample carried both lists, so the invariant went untested');
    });

    it('answers what upstream verifies on a board, from tests/ as well as samples/', async () => {
      // The index held 610 rows, all under samples/ and none under tests/, so
      // "is this exercised in CI" was half unanswerable by construction — a
      // reader could only see the sample half and reasonably conclude the rest
      // did not exist.
      const res = await client.call('search_samples', { board: 'frdm_k64f', limit: 25 });
      const results = res.structured['results'] as { path: string; kind: string }[];
      ok(results.length > 0);
      ok(results.some((r) => r.kind === 'test' && r.path.startsWith('tests/')), 'no tests/ rows');
      ok(results.some((r) => r.kind === 'sample'), 'no samples/ rows');

      const onlyTests = await client.call('search_samples', {
        board: 'frdm_k64f',
        kind: 'test',
        limit: 25,
      });
      const testRows = onlyTests.structured['results'] as { kind: string }[];
      ok(testRows.length > 0);
      ok(testRows.every((r) => r.kind === 'test'), 'the kind filter let a sample through');
    });

    it('reads a test suite and tells you how to run it', async () => {
      const found = await client.call('search_samples', { query: 'gpio', kind: 'test', limit: 1 });
      const path = (found.structured['results'] as { path: string }[])[0]!.path;
      const res = await client.call('get_sample', { path, max_chars: 1000 });
      strictEqual(res.structured['kind'], 'test');
      ok(res.text.includes('west twister -T'), 'a test suite is run, not built');
      ok((res.structured['scenarios'] as string[]).length > 0, 'no twister scenario ids');
    });

    it('requires a query or a board, not neither', async () => {
      const res = await client.call('search_samples', {});
      strictEqual(res.isError, true);
    });

    it('says which evidence made a sample match the requested board', async () => {
      const found = await client.call('search_samples', {
        query: 'net',
        board: 'frdm_k64f',
        limit: 10,
      });
      const results = found.structured['results'] as { boardEvidence: string[] }[];
      const matched = results.filter((r) => r.boardEvidence.length > 0);
      ok(matched.length > 0, 'ranking consulted board evidence but reported none');
      ok(found.text.includes('names frdm_k64f in:'));
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
