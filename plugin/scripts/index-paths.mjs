/**
 * Shared index-location logic for the plugin's hook scripts.
 *
 * Mirrors the resolution order in the MCP server (packages/mcp-server/src/db.ts).
 * Kept as a tiny standalone module rather than imported from the server bundle,
 * because hooks run as separate short-lived processes and must not pay the cost
 * of loading the whole server.
 */

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export function resolveIndexPath(env = process.env) {
  const explicit = env.ZEPHYR_AI_INDEX;
  if (explicit && existsSync(explicit)) return { path: resolve(explicit), origin: 'env' };

  const data = env.CLAUDE_PLUGIN_DATA ?? env.ZEPHYR_AI_PLUGIN_DATA;
  if (data) {
    const workspace = join(data, 'index', 'workspace.db');
    if (existsSync(workspace)) return { path: workspace, origin: 'workspace' };
    const shipped = join(data, 'index', 'zephyr.db');
    if (existsSync(shipped)) return { path: shipped, origin: 'plugin-data' };
  }

  const root = env.CLAUDE_PLUGIN_ROOT ?? env.ZEPHYR_AI_PLUGIN_ROOT;
  if (root) {
    const bundled = join(root, 'index', 'zephyr.db');
    if (existsSync(bundled)) return { path: bundled, origin: 'plugin-root' };
  }

  for (const candidate of [
    join(process.cwd(), 'index', 'zephyr.db'),
    join(process.cwd(), '..', '..', 'index', 'zephyr.db'),
  ]) {
    if (existsSync(candidate)) return { path: resolve(candidate), origin: 'cwd' };
  }

  return null;
}

/** Walk up looking for a west workspace, so hooks can mention version drift. */
export function findWestWorkspace(start = process.cwd()) {
  let dir = resolve(start);
  for (let depth = 0; depth < 40; depth++) {
    if (existsSync(join(dir, '.west', 'config'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Read the hook's JSON payload from stdin. Returns {} if there is none. */
export async function readHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
