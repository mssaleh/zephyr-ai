#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const paths = ['plugin/mcp/zephyr-mcp.mjs', 'plugin/mcp/zephyr-ingest.mjs'];
const tracked = spawnSync('git', ['ls-files', '--error-unmatch', ...paths], { encoding: 'utf8' });
if (tracked.status !== 0) {
  throw new Error('Built plugin artifacts are not tracked in Git. Establish the repository baseline first.');
}
const diff = spawnSync('git', ['diff', '--exit-code', '--', ...paths], { stdio: 'inherit' });
if (diff.status !== 0) {
  process.stderr.write('Committed plugin artifacts are stale. Run npm run build and commit the rebuilt files.\n');
  process.exitCode = 1;
}
