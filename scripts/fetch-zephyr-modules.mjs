#!/usr/bin/env node
/** Materialize the module revisions pinned by the selected Zephyr west manifest. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const ZEPHYR = resolve(process.env.ZEPHYR_BASE ?? resolve(ROOT, '.cache', 'zephyr'));
const WORKSPACE = dirname(ZEPHYR);

try {
if (!existsSync(resolve(ZEPHYR, 'west.yml')) || !existsSync(resolve(ZEPHYR, 'VERSION'))) {
  throw new Error('A complete Zephyr manifest checkout is required. Run npm run fetch:zephyr first.');
}
const relativeZephyr = relative(WORKSPACE, ZEPHYR);
if (!relativeZephyr || relativeZephyr === '..' || relativeZephyr.startsWith(`..${sep}`)) {
  throw new Error('ZEPHYR_BASE must be a child of its west workspace directory.');
}

function west(args) {
  const result = spawnSync('west', args, {
    cwd: WORKSPACE,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error?.code === 'ENOENT') {
    throw new Error(
      'Fetching Zephyr modules requires west. Activate the project Python environment or install the pinned tree requirements.',
    );
  }
  if (result.status !== 0) {
    throw new Error(`west ${args.join(' ')} failed:\n${result.stderr.trim().split('\n').slice(-20).join('\n')}`);
  }
  return result.stdout.trim();
}

if (!existsSync(resolve(WORKSPACE, '.west', 'config'))) {
  west(['init', '-l', relativeZephyr]);
}
const configured = west(['config', 'manifest.path']);
if (resolve(WORKSPACE, configured) !== ZEPHYR) {
  throw new Error(
    `The existing west workspace selects ${configured}, not ${relativeZephyr}; refusing to update an unrelated manifest.`,
  );
}

west(['update']);
const frozen = west(['manifest', '--freeze']);
const lock = JSON.parse(readFileSync(resolve(ROOT, 'zephyr.lock.json'), 'utf8'));
const head = spawnSync('git', ['-C', ZEPHYR, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
if (head.status !== 0 || head.stdout.trim() !== lock.commit) {
  throw new Error('The west manifest repository no longer matches the lockfile-pinned Zephyr revision.');
}
const manifestHash = createHash('sha256').update(frozen).digest('hex');
process.stderr.write(`Zephyr west modules are synchronized under ${WORKSPACE} (manifest ${manifestHash.slice(0, 12)}).\n`);
} catch (error) {
  process.stderr.write(
    `fetch-zephyr-modules: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
