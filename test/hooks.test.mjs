import { strictEqual, match } from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const HOOK = join(ROOT, 'plugin', 'scripts', 'validate-zephyr-edit.mjs');
const INDEX = process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db');

function runHook(filePath, content) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', HOOK], {
      cwd: ROOT,
      env: { ...process.env, ZEPHYR_AI_INDEX: INDEX },
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
        tool_name: 'Write',
        tool_input: { file_path: filePath, content },
      }),
    );
  });
}

describe('PostToolUse Zephyr validation', () => {
  it('does not reject a valid generated Kconfig symbol missing from the v1 catalogue', async () => {
    const result = await runHook('/project/prj.conf', 'CONFIG_SENSOR_LOG_LEVEL_DBG=y\n');
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('does not reject a valid compatible missing from the v1 catalogue', async () => {
    const result = await runHook(
      '/project/app.overlay',
      'mailbox { compatible = "microchip,mpfs-mailbox"; };\n',
    );
    strictEqual(result.code, 0);
    strictEqual(result.stderr, '');
  });

  it('still reports a provable Kconfig type mismatch', async () => {
    const result = await runHook('/project/prj.conf', 'CONFIG_BT_BUF_ACL_RX_SIZE=y\n');
    strictEqual(result.code, 2);
    match(result.stderr, /is int but is set to "y"/);
  });
});
