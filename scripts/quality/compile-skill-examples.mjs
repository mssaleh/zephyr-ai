#!/usr/bin/env node
/** Configure and compile every complete example declared by the skills. */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

try {
const ROOT = resolve(import.meta.dirname, '..', '..');
const ZEPHYR = resolve(process.env.ZEPHYR_BASE ?? join(ROOT, '.cache', 'zephyr'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin', 'examples', 'manifest.json'), 'utf8'));
if (!existsSync(join(ZEPHYR, 'VERSION'))) throw new Error('Skill example builds require the pinned Zephyr tree.');
for (const command of ['cmake', 'ninja']) {
  const probe = spawnSync(command, ['--version'], { stdio: 'ignore' });
  if (probe.error?.code === 'ENOENT') {
    throw new Error(`Skill example builds require ${command}. Install the Zephyr build toolchain and retry.`);
  }
}
const requiredClasses = new Set(['generic', 'stm32', 'esp32']);
for (const example of manifest.examples) requiredClasses.delete(example.class);
if (requiredClasses.size) throw new Error(`Skill example matrix is missing: ${[...requiredClasses].join(', ')}`);

for (const example of manifest.examples) {
  const output = mkdtempSync(join(tmpdir(), `zephyr-ai-${example.class}-`));
  try {
    const configure = spawnSync(
      'cmake',
      [
        '-GNinja',
        `-DBOARD=${example.target}`,
        `-DZephyr_DIR=${join(ZEPHYR, 'share', 'zephyr-package', 'cmake')}`,
        '-S', resolve(ROOT, example.path),
        '-B', output,
      ],
      { encoding: 'utf8', env: { ...process.env, ZEPHYR_BASE: ZEPHYR } },
    );
    if (configure.status !== 0) {
      throw new Error(`${example.id} configure failed:\n${configure.stderr.trim().split('\n').slice(-30).join('\n')}`);
    }
    const build = spawnSync('cmake', ['--build', output], { encoding: 'utf8' });
    if (build.status !== 0) {
      throw new Error(`${example.id} build failed:\n${build.stderr.trim().split('\n').slice(-30).join('\n')}`);
    }
    process.stdout.write(`verified ${example.id} on ${example.target}\n`);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
}
} catch (error) {
  process.stderr.write(
    `compile-skill-examples: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
