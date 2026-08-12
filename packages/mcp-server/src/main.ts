#!/usr/bin/env node
/**
 * zephyr-ai MCP server entry point.
 */

import { Index, resolveIndexPath } from './db.ts';
import { McpServer, ToolError } from './protocol.ts';
import { createTools } from './tools/index.ts';

const VERSION = '0.1.0';

const INSTRUCTIONS = [
  'Grounded reference for Zephyr RTOS, indexed from a specific Zephyr release.',
  '',
  'Query this server before writing Zephyr code rather than after a build fails. Three classes',
  'of error account for most broken Zephyr firmware, and each has a tool that prevents it:',
  '- Invented CONFIG_ symbols -> search_kconfig / get_kconfig before editing prj.conf.',
  '- Invented devicetree properties -> get_binding before editing a .dts or .overlay. Bindings',
  '  inherit almost everything through include: chains, so the binding file is not the answer.',
  '- Wrong board target -> search_boards. Targets are qualified, e.g. esp32s3_devkitc/esp32s3/procpu.',
  '',
  'Call index_status if answers seem wrong for the project: it reports the indexed Zephyr version',
  'and detects a west workspace pinned to a different one.',
].join('\n');

function main(): void {
  // The index is opened lazily so the server still starts, and can explain
  // itself, when no index has been built yet.
  let cached: Index | null = null;
  let failure: string | null = null;

  const index = (): Index => {
    const info = resolveIndexPath();

    // Re-resolve on every call so an index built mid-session — which is the
    // normal way a user gets one for their own workspace — is picked up without
    // restarting Claude Code. Resolution is a few existsSync calls.
    if (cached) {
      if (info && info.path === cached.info.path) return cached;
      cached.close();
      cached = null;
      failure = null;
    }
    if (failure) throw new ToolError(failure);

    if (!info) {
      failure =
        'No Zephyr index is available, so none of the zephyr lookup tools can answer. ' +
        'Build one by invoking the `zephyr-index` skill, which locates the project\'s Zephyr ' +
        'tree and runs the bundled indexer. Alternatively set ZEPHYR_AI_INDEX to an existing ' +
        'index file.';
      throw new ToolError(failure);
    }

    try {
      cached = new Index(info);
    } catch (err) {
      failure = `Failed to open the Zephyr index at ${info.path}: ${(err as Error).message}`;
      throw new ToolError(failure);
    }

    const schema = cached.meta['schema_version'];
    if (schema !== '1') {
      McpServer.log(`warning: index schema version ${schema ?? 'unknown'}, expected 1`);
    }
    McpServer.log(
      `serving Zephyr ${cached.meta['zephyr_version'] ?? '?'} from ${info.path} (${info.origin})`,
    );
    return cached;
  };

  const server = new McpServer({
    name: 'zephyr',
    version: VERSION,
    title: 'Zephyr RTOS',
    description: 'Version-exact Zephyr RTOS reference: Kconfig, devicetree, boards, API, samples.',
    instructions: INSTRUCTIONS,
  });

  for (const tool of createTools(index)) server.tool(tool);

  server.resource({
    uri: 'zephyr://index/status',
    name: 'zephyr-index-status',
    title: 'Zephyr index status',
    description: 'Which Zephyr version is indexed, where it came from, and what it covers.',
    mimeType: 'text/markdown',
    read: () => {
      const status = createTools(index).find((t) => t.name === 'index_status');
      const out = status?.handler({});
      const resolved = out instanceof Promise ? null : out;
      return resolved?.content[0]?.text ?? 'Index status unavailable.';
    },
  });

  process.on('uncaughtException', (err) => {
    McpServer.log(`uncaught exception: ${err.stack ?? err.message}`);
  });

  server.start();
}

main();
