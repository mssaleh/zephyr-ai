#!/usr/bin/env node
/**
 * zephyr-ai MCP server entry point.
 */

import { Index, IndexResolutionError, resolveIndexPath } from './db.ts';
import { McpServer, ToolError } from './protocol.ts';
import { createTools } from './tools/index.ts';
import { fileURLToPath } from 'node:url';
import { statSync } from 'node:fs';
import packageMetadata from '../package.json' with { type: 'json' };

const VERSION = packageMetadata.version;

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
  let negotiatedProjectRoot: string | undefined;

  const index = (): Index => {
    let info;
    try {
      info = resolveIndexPath({
        ...process.env,
        ...(negotiatedProjectRoot ? { ZEPHYR_AI_PROJECT_ROOT: negotiatedProjectRoot } : {}),
      });
    } catch (error) {
      const message = error instanceof IndexResolutionError ? error.message : 'Index discovery failed.';
      throw new ToolError(message);
    }

    // Re-resolve on every call so an index built mid-session — which is the
    // normal way a user gets one for their own workspace — is picked up without
    // restarting Claude Code. Resolution is a few existsSync calls.
    if (cached) {
      if (info && info.path === cached.info.path && info.identity === cached.info.identity) return cached;
      cached.close();
      cached = null;
    }

    if (!info) {
      throw new ToolError(
        'No project-specific Zephyr index is available, so the lookup tools cannot answer. ' +
        'Build one by invoking the `zephyr-index` skill, which locates the project\'s Zephyr ' +
        'tree and runs the bundled indexer. Alternatively set ZEPHYR_AI_INDEX to an existing ' +
        'compatible index file.',
      );
    }

    try {
      cached = new Index(info);
    } catch (err) {
      McpServer.log(`failed to open selected index: ${(err as Error).message}`);
      throw new ToolError(
        'The selected Zephyr index is incompatible or corrupt. Run the zephyr-index skill to replace it.',
      );
    }
    McpServer.log(
      `serving Zephyr ${cached.meta['zephyr_version'] ?? '?'} (${info.origin}, ${cached.descriptor.contextFingerprint.slice(0, 12)})`,
    );
    return cached;
  };

  const server = new McpServer({
    name: 'zephyr',
    version: VERSION,
    title: 'Zephyr RTOS',
    description: 'Version-exact Zephyr RTOS reference: Kconfig, devicetree, boards, API, samples.',
    instructions: INSTRUCTIONS,
    rootsChanged: (roots) => {
      negotiatedProjectRoot = roots.flatMap((uri) => {
        try {
          if (!uri.startsWith('file://')) return [];
          const path = fileURLToPath(uri);
          return statSync(path).isDirectory() ? [path] : [];
        } catch {
          return [];
        }
      })[0];
    },
  });

  const tools = createTools(index);
  for (const tool of tools) server.tool(tool);
  const status = tools.find((tool) => tool.name === 'index_status');

  server.resource({
    uri: 'zephyr://index/status',
    name: 'zephyr-index-status',
    title: 'Zephyr index status',
    description: 'Which Zephyr version is indexed, where it came from, and what it covers.',
    mimeType: 'text/markdown',
    read: async () => {
      const resolved = status ? await status.handler({}) : undefined;
      return resolved?.content[0]?.text ?? 'Index status unavailable.';
    },
  });

  process.on('uncaughtException', (err) => {
    McpServer.log(`uncaught exception: ${err.stack ?? err.message}`);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    McpServer.log(`unhandled rejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)}`);
    process.exit(1);
  });

  server.start();
}

main();
