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

/**
 * The one part of this server that is always in context.
 *
 * Claude Code defers MCP tool definitions: at session start the model sees the
 * tool *names* and this text, and nothing else. Every tool description in
 * `tools/` — the text this project spends the most care on — arrives only after
 * the model has already decided to go looking. So this string is what decides
 * whether the tools are reached for at all, and it is written for that job: the
 * situations first, the tool names next, and no prose that does not name one.
 */
const INSTRUCTIONS = [
  'Zephyr RTOS reference, indexed from one specific Zephyr revision.',
  '',
  'Load and call these tools before writing or editing a prj.conf, a devicetree overlay, a board',
  'target, a runner argument, or a driver binding — not after a build fails. They are the only',
  'source here that matches the Zephyr revision this project actually builds against; a web',
  'search and a repository default branch return a different version.',
  '',
  'Query this server before writing Zephyr code, not after a build fails. Four common errors',
  'each have a tool that prevents them:',
  '- CONFIG_ symbol that does not exist -> search_kconfig / get_kconfig before editing prj.conf.',
  '- Devicetree property that does not exist -> get_binding before editing a .dts or .overlay.',
  '  Bindings inherit most properties through include: chains, so reading the binding file is',
  '  not enough.',
  '- Wrong board target -> search_boards. Targets are qualified, e.g. esp32s3_devkitc/esp32s3/procpu.',
  '- Wrong flash or debug runner -> get_board lists the runners a board registers and which one',
  '  each command selects. get_runner says what a runner accepts. west flash and west debug do',
  '  not always select the same runner, and west rejects an option the runner does not declare.',
  '',
  'Batch lookups. get_kconfig, get_binding and get_api each accept a list and answer all of it',
  'in one call, so checking a whole prj.conf or overlay costs one call. check_config takes the',
  'file contents and returns a verdict per line. A shell loop over the tree returns yes or no;',
  'these tools return the type, prompt, dependencies and defaults as well.',
  '',
  'Use get_source when you need a file rather than a symbol: a board .dts, an SoC Kconfig, a',
  'driver, a linker script, a runner script, or a vendor HAL header from a west module. It reads',
  'the file at the revision this index was built from. A web search or a repository default',
  'branch returns a different Zephyr version.',
  '',
  'Two questions have an answer here and nowhere else, because they are aggregates over the whole',
  'tree rather than facts in one file:',
  '- A part answers 0x19 from its WHO_AM_I or chip-ID register: which driver accepts it? Pass',
  '  identity_value to search_bindings. get_binding reports the same contract forwards, and a',
  '  driver whose identity check the part fails initialises and returns numbers that are not',
  '  readings.',
  '- What does upstream already publish for this board target? get_board and search_samples name',
  '  every sample and test that ships a configuration file for it, which is where the vendor put',
  '  the DMA channels, clock sources and cache attributes for each peripheral.',
  '',
  'Call index_status if answers look wrong for the project. It reports the indexed Zephyr version',
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
        'No Zephyr index is available, so the lookup tools cannot answer. Build one with the ' +
        '`zephyr-index` skill: it locates the project\'s Zephyr tree and runs the bundled indexer. ' +
        'To use an existing index instead, set ZEPHYR_AI_INDEX to its path. ZEPHYR_AI_INDEX is the ' +
        'only variable that selects an index. Setting ZEPHYR_AI_PROJECT_ROOT does not work: the ' +
        'plugin sets it from ${CLAUDE_PROJECT_DIR}, and the CLI overwrites that with the session ' +
        'working directory.',
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
