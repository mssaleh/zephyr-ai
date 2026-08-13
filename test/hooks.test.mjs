import { match, ok, strictEqual } from 'node:assert/strict';
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
const BUILD_HOOK = join(ROOT, 'plugin', 'scripts', 'check-build-failure.mjs');
const MCP_SERVER = join(ROOT, 'plugin', 'mcp', 'zephyr-mcp.mjs');
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

function runHook({ project, path, content = '', index = INDEX, toolName = 'Edit', sessionId, hook = HOOK }) {
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
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', hook], {
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
      JSON.stringify({
        ...(sessionId ? { session_id: sessionId } : {}),
        tool_name: toolName,
        tool_input: { file_path: path, new_string: content },
      }),
    );
  });
}

function rewriteDescriptor(path, mutate) {
  const db = new DatabaseSync(path);
  const row = db.prepare("SELECT value FROM meta WHERE key = 'index_descriptor'").get();
  const descriptor = JSON.parse(String(row.value));
  mutate(descriptor);
  // Strips what packages/shared/index-descriptor.ts strips, including producer.
  const { createdAt, contextFingerprint, zephyrRoot, projectRoot, producer, ...semantic } =
    descriptor;
  const canonical = (value) => {
    const normalise = (item) => Array.isArray(item)
      ? item.map(normalise)
      : item && typeof item === 'object'
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([key, child]) => [key, normalise(child)]))
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

/**
 * Call one MCP tool on the built server and return its text content.
 *
 * The hook cannot import the server bundle — it is a short-lived process with no
 * build step — so `check_config` reimplements the claims the hook makes. The
 * only thing keeping the two honest is a test that drives both, which needs a
 * client here.
 */
function callTool(name, args, index = INDEX) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [MCP_SERVER], {
      cwd: ROOT,
      env: { ...process.env, ZEPHYR_AI_INDEX: index },
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    let buffer = '';
    const pending = new Map();
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const message = JSON.parse(line);
        if (message.id && pending.has(message.id)) {
          pending.get(message.id)(message);
          pending.delete(message.id);
        }
      }
    });
    child.once('error', reject);
    let id = 0;
    const send = (method, params) =>
      new Promise((done) => {
        const next = ++id;
        pending.set(next, done);
        child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: next, method, params })}\n`);
      });
    send('initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'hooks-test', version: '1' },
    })
      .then(() => {
        child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
        return send('tools/call', { name, arguments: args });
      })
      .then((response) => {
        child.kill();
        resolvePromise((response.result?.content ?? []).map((part) => part.text).join('\n'));
      })
      .catch(reject);
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
    // A developer's exported ZEPHYR_BASE would otherwise take the branch ahead
    // of the empty-directory one and pass the cold-start test for the wrong
    // reason on their machine only.
    delete env.ZEPHYR_BASE;
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

function runBuild(command, response) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', BUILD_HOOK], {
      cwd: ROOT,
      env: process.env,
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
    child.stdin.end(JSON.stringify({ tool_input: { command }, tool_response: response }));
  });
}

// Needs no index: the subject is the build result, not the catalogue.
describe('PostToolUse build failure', () => {
  it('stays silent for anything that is not a failing Zephyr build', async () => {
    const quiet = [
      ['ls -la', { stderr: 'No such file', exit_code: 2 }],
      ['npm test', { stdout: '1 failing\nerror: nope', exit_code: 1 }],
      // A build that worked.
      ['west build -b nucleo_f401re app', { stdout: 'Memory region  Used Size', exit_code: 0 }],
      // A build the user stopped is not a build that failed.
      ['west build -b nucleo_f401re app', { stdout: '', interrupted: true }],
      // Reading a log that quotes an error is not an error.
      ['grep -r "CMake Error" build/', { stdout: 'CMake Error at x', exit_code: 0 }],
      // The build has to start a command, not merely appear inside one.
      ['grep "west build" notes.txt', { stdout: 'CMake Error at x', exit_code: 1 }],
    ];
    for (const [command, response] of quiet) {
      const result = await runBuild(command, response);
      strictEqual(result.code, 0, `${command} should be silent`);
      strictEqual(result.stderr, '', `${command} should be silent`);
    }
  });

  it('names build-triage and the lookup that fits the failure class', async () => {
    // PostToolUse must exit 2 with stderr to reach the model at all.
    const cases = [
      ['devicetree error: \'pixel-format\' is not a valid property', /get_binding/],
      ['error: Aborting due to Kconfig warnings', /get_kconfig/],
      ["undefined reference to `bt_enable'", /search_kconfig/],
      ['Invalid BOARD; board esp32s3 not found', /search_boards/],
    ];
    for (const [output, expected] of cases) {
      const result = await runBuild('west build -b x app', { stderr: output, exit_code: 1 });
      strictEqual(result.code, 2, `${output} should block`);
      match(result.stderr, /build-triage/);
      match(result.stderr, expected);
    }
  });

  it('sends a host environment failure to check_environment, not to the symbol lookups', async () => {
    // These arrive wrapped in "CMake Error", so without a more specific rule they
    // are classified as a CMake problem and answered with advice about verifying
    // symbols — sending the reader to edit a file that is not wrong. The real text
    // upstream emits is scripts/zephyr_module.py's `sys.exit('Missing jsonschema
    // dependency')`, surfaced by zephyr_module.cmake as a FATAL_ERROR.
    const cases = [
      'CMake Error at cmake/modules/zephyr_module.cmake:73 (message):\n  Missing jsonschema dependency',
      "CMake Error: ModuleNotFoundError: No module named 'pykwalify'",
      'CMake Error at CMakeLists.txt:8 (find_package): Could NOT find Python3',
    ];
    for (const output of cases) {
      const result = await runBuild('west build -b x app', { stderr: output, exit_code: 1 });
      strictEqual(result.code, 2, `${output} should block`);
      match(result.stderr, /check_environment/);
      match(result.stderr, /not a mistake in the source/);
    }
  });

  it('speaks on a non-zero build even when no signature is recognised', async () => {
    const result = await runBuild('west build', { stderr: 'something unfamiliar', exit_code: 1 });
    strictEqual(result.code, 2);
    match(result.stderr, /build-triage/);
  });

  it('recognises the build through leading whitespace, chaining, and env prefixes', async () => {
    for (const command of [
      '  west build -b nucleo_f401re app',
      'cd app && west build',
      'ZEPHYR_BASE=/opt/zephyr west build -b x .',
      'cmake --build build',
    ]) {
      const result = await runBuild(command, { stderr: 'CMake Error at x', exit_code: 1 });
      strictEqual(result.code, 2, `${command} should be recognised as a build`);
    }
  });
});

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

  it('is silent for paths outside the active project root', async () => {
    // The file is never read, but not reading it is a reason to skip rather
    // than a finding: exit 2 is reserved for a real problem in the edit.
    const project = mkdtempSync(join(TEMPORARY, 'project-'));
    const outside = join(TEMPORARY, 'outside.conf');
    writeFileSync(outside, 'CONFIG_BT=y\n');
    const result = await runHook({ project, path: outside });
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('accepts a trailing comment on a bool, because kconfiglib does', async () => {
    // kconfiglib reads only the first character after `=` for bool and tristate,
    // matching the C implementation, so `y # why` assigns y. Upstream ships it.
    // Rejecting the whole token contradicted the tool that builds the firmware.
    const file = projectFile('prj.conf', 'CONFIG_BT=y # every target supports this\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');

    // The leniency is bool-shaped, not general: an int is still validated whole.
    const int = projectFile('prj.conf', 'CONFIG_BT_BUF_ACL_RX_SIZE=64 # bytes\n');
    const reported = await runHook(int);
    strictEqual(reported.code, 2);
    match(reported.stderr, /is int but is set to/);
  });

  it('does not claim promptless when the catalogue cannot see every definition', async () => {
    // Zephyr decides promptlessness across all of a symbol's definitions. This
    // catalogue holds only those reachable in the context it was built for, so
    // a symbol whose declaration lives in a module Kconfig or another SoC's
    // tree looks promptless when it is not — which reported four assignments
    // that Zephyr's own samples make and its own CI builds.
    const db = new DatabaseSync(INDEX, { readOnly: true });
    const hidden = db.prepare(`
      SELECT k.name FROM kconfig k
       WHERE k.has_prompt = 0
         AND (SELECT COUNT(*) FROM kconfig_definition d WHERE d.symbol_id = k.id) > 0
         AND (k.type IS NULL
              OR (SELECT COUNT(*) FROM kconfig_definition d
                   WHERE d.symbol_id = k.id AND d.file LIKE 'modules/%') > 0)
       ORDER BY k.name LIMIT 1`).get();
    db.close();
    ok(hidden, 'expected at least one symbol whose prompt status the catalogue cannot decide');

    const file = projectFile('prj.conf', `CONFIG_${hidden.name}=y\n`);
    const result = await runHook(file);
    strictEqual(result.code, 0, `must not claim ${hidden.name} is promptless`);
    strictEqual(result.stderr, '');
  });

  it('raises no finding for a valid file', async () => {
    const file = projectFile('prj.conf', '# CONFIG_BT is not set\n');
    const result = await runHook(file);
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '', 'stderr is the finding channel and must stay empty');
  });

  describe('acknowledging a clean file', () => {
    // A check that finds nothing looks exactly like a check that never ran, and
    // that blindness is what hid an unreachable devicetree branch for a whole
    // release. The acknowledgement is what tells the two apart — but it is
    // information, not a finding, so it goes out on stdout at exit 0 rather than
    // through the exit-2 blocking contract.
    it('says what it checked, once per file per session', async () => {
      const file = projectFile('prj.conf', 'CONFIG_BT=y\nCONFIG_GPIO=y\n');
      const first = await runHook({ ...file, sessionId: `ack-${Date.now()}-${Math.random()}` });
      strictEqual(first.code, 0);
      strictEqual(first.stderr, '');

      const payload = JSON.parse(first.stdout);
      strictEqual(payload.hookSpecificOutput.hookEventName, 'PostToolUse');
      match(payload.hookSpecificOutput.additionalContext, /checked 2 Kconfig assignments/);
      match(payload.systemMessage, /against indexed Zephyr \d/);
      // No decision field: PostToolUse cannot block, and this is not a finding.
      strictEqual(payload.hookSpecificOutput.permissionDecision, undefined);
    });

    it('does not repeat itself for the same file in the same session', async () => {
      const file = projectFile('prj.conf', 'CONFIG_BT=y\n');
      const sessionId = `repeat-${Date.now()}-${Math.random()}`;
      const first = await runHook({ ...file, sessionId });
      const second = await runHook({ ...file, sessionId });
      ok(first.stdout.length > 0, 'the first edit should be acknowledged');
      strictEqual(second.stdout, '', 'a per-edit acknowledgement would be noise');
    });

    it('stays silent when nothing was actually checked', async () => {
      // An acknowledgement that can appear when no check ran is worth less than
      // the silence it replaces.
      const empty = projectFile('prj.conf', '# just a comment\n');
      const result = await runHook({ ...empty, sessionId: `empty-${Date.now()}` });
      strictEqual(result.stdout, '');

      const notZephyr = projectFile('prj.conf', 'CONFIG_BT=y\n', { zephyrProject: false });
      const outside = await runHook({ ...notZephyr, sessionId: `outside-${Date.now()}` });
      strictEqual(outside.stdout, '');
    });

    it('acknowledges nothing when it has a finding to report instead', async () => {
      const file = projectFile('prj.conf', 'CONFIG_BT_BUF_ACL_RX_SIZE=y\n');
      const result = await runHook({ ...file, sessionId: `finding-${Date.now()}` });
      strictEqual(result.code, 2);
      strictEqual(result.stdout, '', 'a finding is reported once, through stderr');
      match(result.stderr, /is int but is set to "y"/);
    });
  });

  describe('PreToolUse pointer', () => {
    const POINTER = join(ROOT, 'plugin', 'scripts', 'announce-zephyr-write.mjs');

    it('names the lookup and never blocks the write', async () => {
      for (const [name, expected] of [
        ['prj.conf', /get_kconfig/],
        ['app.overlay', /get_binding/],
      ]) {
        const file = projectFile(name, '');
        const result = await runHook({
          ...file,
          hook: POINTER,
          sessionId: `pre-${name}-${Date.now()}-${Math.random()}`,
        });
        // Exit 2 would block the tool call, and a heuristic must never do that.
        strictEqual(result.code, 0, `${name} must not block`);
        const payload = JSON.parse(result.stdout);
        strictEqual(payload.hookSpecificOutput.permissionDecision, 'allow');
        match(payload.hookSpecificOutput.additionalContext, expected);
        match(payload.hookSpecificOutput.additionalContext, /check_config/);
      }
    });

    it('says nothing for a file it has no claim about, or a second time', async () => {
      const sessionId = `pre-quiet-${Date.now()}-${Math.random()}`;
      const source = projectFile('main.c', '');
      const c = await runHook({ ...source, hook: POINTER, sessionId });
      strictEqual(c.stdout, '', 'a pointer on every C file would be noise');

      const conf = projectFile('prj.conf', '');
      const first = await runHook({ ...conf, hook: POINTER, sessionId });
      const second = await runHook({ ...conf, hook: POINTER, sessionId });
      ok(first.stdout.length > 0);
      strictEqual(second.stdout, '');
    });

    it('says nothing without an index to back the advice', async () => {
      const file = projectFile('prj.conf', '');
      const result = await runHook({
        ...file,
        hook: POINTER,
        index: join(TEMPORARY, 'no-such-index.db'),
        sessionId: `pre-noindex-${Date.now()}`,
      });
      strictEqual(result.code, 0);
      strictEqual(result.stdout, '');
    });
  });

  describe('devicetree compatibles', () => {
    // Every test below runs against a project-scoped index, because that is the
    // only kind a user ever has and the coverage gate that used to guard this
    // check could open only on the other kind. The suite was green for the whole
    // period the feature was dead in the field, which is worse than no suite:
    // it was read as evidence.
    const PROJECT_INDEX = indexCopy('project-scoped', (descriptor) => {
      descriptor.projectRoot = '/home/someone/firmware';
      descriptor.coverage.bindings = {
        complete: false,
        note: 'Application-local or undisclosed module binding roots may not be indexed.',
      };
    });

    const OVERLAY = [
      '/ {',
      '\tchosen { zephyr,display = &screen; };',
      '\taliases { led0 = &green; };',
      '};',
      '&spi1 {',
      '\tscreen: st7789v@0 {',
      '\t\tcompatible = "sitronix,st7789v";',
      '\t\treg = <0>;',
      '\t\tpixel-format = <1>;',
      '\t};',
      '\tfallback@2 {',
      '\t\tcompatible = "vendor,unknown-part", "sitronix,st7789v";',
      '\t\treg = <2>;',
      '\t};',
      '\t/* compatible = "commented,out"; */',
      '};',
    ].join('\n');

    it('accepts real compatibles, fallback lists, and comments', async () => {
      // A node needs only one of its compatibles to resolve, so a legitimate
      // `"vendor,part", "generic-part"` fallback must not be reported.
      const file = projectFile('app.overlay', OVERLAY);
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 0);
      strictEqual(result.stderr, '');
    });

    it('reports a misspelling of a real compatible, at its line', async () => {
      // One character from `sitronix,st7789v`, same vendor: a slip, not an
      // out-of-tree device.
      const file = projectFile('app.overlay', `${OVERLAY}\n&i2c0 {\n\tx: dev@1 {\n\t\tcompatible = "sitronix,st7789";\n\t};\n};\n`);
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 2);
      match(result.stderr, /line 19: "sitronix,st7789" is not a known compatible/);
      match(result.stderr, /"sitronix,st7789v" is and differs by 1 character/);
      match(result.stderr, /get_binding/);
    });

    it('stays silent for an out-of-tree compatible with no near neighbour', async () => {
      // Absence is not evidence: an application may declare bindings through
      // dts/bindings, DTS_ROOT, or a module the catalogue cannot see.
      const file = projectFile('app.overlay', '&i2c0 {\n\tdev@1 {\n\t\tcompatible = "acme,invented-widget";\n\t};\n};\n');
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 0);
      strictEqual(result.stderr, '');
    });

    it('does not check property names', async () => {
      // Deciding a property is invalid needs to know which node owns it, and so
      // which binding applies. `get_binding` owns that question.
      const file = projectFile(
        'bad.overlay',
        '&spi1 {\n\tscreen: st7789v@0 {\n\t\tcompatible = "sitronix,st7789v";\n\t\tnot-a-real-property = <1>;\n\t};\n};\n',
      );
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 0);
      strictEqual(result.stderr, '');
    });

    it('accepts a fallback list whose specific name is not indexed', async () => {
      // A node binds through the first compatible that has a binding, so
      // `"microchip,mcp9808", "jedec,jc-42.4-temp"` is correct even though only
      // the generic name is indexed — and upstream ships exactly that. Judging
      // each value alone reported it, because the specific name lands two edits
      // from an unrelated Microchip ADC. The compatibles are read from the
      // catalogue rather than named here, so the test states the rule.
      const db = new DatabaseSync(INDEX, { readOnly: true });
      const generic = String(
        db.prepare("SELECT compatible FROM dt_binding WHERE compatible LIKE '%,%' ORDER BY compatible LIMIT 1").get().compatible,
      );
      db.close();
      // A specific name one edit from nothing, paired with a real generic one.
      const file = projectFile(
        'app.overlay',
        `&i2c0 {\n\tdev@1 {\n\t\tcompatible = "acme,unindexed-specific-part", "${generic}";\n\t};\n};\n`,
      );
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 0);
      strictEqual(result.stderr, '');
    });

    it('reports a one-edit misspelling and stays silent on an out-of-tree name', async () => {
      // The pair the evaluation ran by hand against a real project-scoped index,
      // where the coverage gate had made both outcomes identically silent. The
      // compatibles are read out of the catalogue rather than named here, so the
      // test states the rule, not one vendor's device.
      const db = new DatabaseSync(INDEX, { readOnly: true });
      const indexed = String(
        db.prepare(
          "SELECT compatible FROM dt_binding WHERE compatible LIKE '%,%' AND LENGTH(compatible) > 12 ORDER BY compatible LIMIT 1",
        ).get().compatible,
      );
      db.close();

      // One inserted character, same vendor prefix: a slip.
      const comma = indexed.indexOf(',');
      const slip = `${indexed.slice(0, comma + 2)}x${indexed.slice(comma + 2)}`;
      const misspelled = projectFile('app.overlay', `&i2c0 {\n\tdev@1 {\n\t\tcompatible = "${slip}";\n\t};\n};\n`);
      const reported = await runHook({ ...misspelled, index: PROJECT_INDEX });
      strictEqual(reported.code, 2, `expected a finding for ${slip} against ${indexed}`);
      match(reported.stderr, new RegExp(`"${indexed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" is and differs by 1 character`));

      const outOfTree = projectFile(
        'app.overlay',
        '&i2c0 {\n\tdev@1 {\n\t\tcompatible = "acme,totally-out-of-tree-widget";\n\t};\n};\n',
      );
      const quiet = await runHook({ ...outOfTree, index: PROJECT_INDEX });
      strictEqual(quiet.code, 0);
      strictEqual(quiet.stderr, '');
    });

    it('accepts a compatible the project declares in its own bindings', async () => {
      const file = projectFile('app.overlay', '&i2c0 {\n\tdev@1 {\n\t\tcompatible = "acme,invented";\n\t};\n};\n');
      mkdirSync(join(file.project, 'dts', 'bindings'), { recursive: true });
      writeFileSync(
        join(file.project, 'dts', 'bindings', 'acme.yaml'),
        'description: Out-of-tree device.\ncompatible: "acme,invented"\n',
      );
      const result = await runHook({ ...file, index: PROJECT_INDEX });
      strictEqual(result.code, 0);
      strictEqual(result.stderr, '');
    });
  });
});

describe('the write hook and check_config make the same claims', {
  skip:
    (!existsSync(INDEX) || !existsSync(MCP_SERVER)) &&
    'needs the rebuilt index and the built server bundle',
}, () => {
  // The hook runs in a short-lived process with no build step, so it cannot
  // import the server bundle and the two implement the same claim set twice.
  // Nothing but this test stops a threshold or a regex being changed in one and
  // not the other, which would leave the plugin contradicting itself depending
  // on whether the model asked or the hook spoke.
  const CASES = [
    {
      name: 'prj.conf',
      text: 'CONFIG_BT_BUF_ACL_RX_SIZE=y\nCONFIG_MALFORMED\n',
      expect: [/is int but is set to "y"/, /malformed Kconfig assignment/],
    },
    {
      name: 'clean.conf',
      text: '# CONFIG_BT is not set\nCONFIG_ZEPHYR_AI_INVENTED_SYMBOL=y\n',
      expect: [],
    },
    {
      name: 'app.overlay',
      text: '&i2c0 {\n\tdev@1 {\n\t\tcompatible = "acme,invented-widget";\n\t};\n};\n',
      expect: [],
    },
    {
      // A plain CONFIG_ line in sysbuild.conf is ignored by the build rather than
      // rejected, so it is invisible until the option fails to take effect.
      name: 'sysbuild.conf',
      text: 'SB_CONFIG_BOOTLOADER_MCUBOOT=y\nCONFIG_BOOTLOADER_MCUBOOT=y\n',
      expect: [/is a CONFIG_ line in a sysbuild\.conf-style file/],
    },
    {
      // And the reverse: SB_CONFIG_ in an application configuration.
      name: 'prj.conf',
      text: 'SB_CONFIG_BOOTLOADER_MCUBOOT=y\n',
      expect: [/is a SB_CONFIG_ line in a prj\.conf-style file/],
    },
  ];

  for (const example of CASES) {
    it(`agrees on ${example.name}`, async () => {
      const file = projectFile(example.name, example.text);
      const hook = await runHook(file);
      const tool = await callTool('check_config', { text: example.text, path: example.name });

      strictEqual(
        hook.code === 2,
        example.expect.length > 0,
        `hook exit ${hook.code} disagrees with the expected finding count`,
      );
      // The tool always answers; the agreement is about which findings exist.
      const toolProblems = /## Problems \((\d+)\)/.exec(tool);
      strictEqual(
        Number(toolProblems?.[1] ?? 0),
        example.expect.length,
        `check_config reported ${toolProblems?.[1] ?? 0} problems:\n${tool}`,
      );
      for (const pattern of example.expect) {
        match(hook.stderr, pattern);
        match(tool, pattern);
      }
    });
  }

  it('agrees that a one-edit misspelling is a finding and absence is not', async () => {
    const db = new DatabaseSync(INDEX, { readOnly: true });
    const indexed = String(
      db.prepare(
        "SELECT compatible FROM dt_binding WHERE compatible LIKE '%,%' AND LENGTH(compatible) > 12 ORDER BY compatible LIMIT 1",
      ).get().compatible,
    );
    db.close();
    const comma = indexed.indexOf(',');
    const slip = `${indexed.slice(0, comma + 2)}x${indexed.slice(comma + 2)}`;
    const text = `&i2c0 {\n\tdev@1 {\n\t\tcompatible = "${slip}";\n\t};\n};\n`;

    const hook = await runHook(projectFile('app.overlay', text));
    const tool = await callTool('check_config', { text, path: 'app.overlay' });
    strictEqual(hook.code, 2);
    match(hook.stderr, /differs by 1 character/);
    match(tool, /differs by 1 character/);
    match(tool, /## Problems \(1\)/);
  });
});

// Deliberately not gated on a built index: the subject is what happens when
// there is no index, which is the state a first-time user starts in.
describe('SessionStart cold start', () => {
  it('names the prerequisites in an empty project', async () => {
    const pluginData = mkdtempSync(join(TEMPORARY, 'no-index-'));
    const project = mkdtempSync(join(TEMPORARY, 'empty-project-'));
    const result = await runSession({ project, pluginData });
    strictEqual(result.code, 0);
    match(result.stdout, /zephyr-index skill/);
    strictEqual(result.stderr, '');
  });

  it('stays silent in a directory that is some other kind of project', async () => {
    const pluginData = mkdtempSync(join(TEMPORARY, 'no-index-'));
    const project = mkdtempSync(join(TEMPORARY, 'other-project-'));
    writeFileSync(join(project, 'main.py'), 'print("hi")\n');
    const result = await runSession({ project, pluginData });
    strictEqual(result.code, 0);
    strictEqual(result.stdout, '');
    strictEqual(result.stderr, '');
  });

  it('ignores dot-entries when deciding a project is empty', async () => {
    // `.git` and editor state say nothing about what a directory is for.
    const pluginData = mkdtempSync(join(TEMPORARY, 'no-index-'));
    const project = mkdtempSync(join(TEMPORARY, 'dotted-project-'));
    mkdirSync(join(project, '.git'), { recursive: true });
    const result = await runSession({ project, pluginData });
    strictEqual(result.code, 0);
    match(result.stdout, /zephyr-index skill/);
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
