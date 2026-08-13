import { type Index, json } from '../db.ts';
import {
  BATCH_MAX_CHARS,
  type BatchEntry,
  type ToolFactory,
  batchResult,
  batchSchema,
  boundedList,
  catalogueMissText,
  joinSections,
  oneOrMany,
  section,
  STRING,
} from './common.ts';

export interface RunnerArgument {
  value: string;
  guard?: string;
  unresolved: boolean;
}

/** Board rows for one runner, used to say who selects it and how. */
interface RunnerUsage {
  boards: number;
  flashDefaultFor: number;
  debugDefaultFor: number;
  examples: string[];
}

/**
 * How a capability set reads to someone about to type a command.
 *
 * RunnerCaps is a flag bag; the flags that matter are the ones that decide
 * whether an option exists at all. `--dev-id` on a runner that does not declare
 * `dev_id` is rejected by west before any hardware is touched.
 */
function capabilityLines(capabilities: Record<string, unknown>): string[] {
  const flagNames: Record<string, string> = {
    dev_id: '`--dev-id` to pick between several attached probes',
    mult_dev_ids: '`--dev-id` more than once, to flash several devices',
    flash_addr: '`--dt-flash` to flash at an address from devicetree',
    erase: '`--erase` for a mass erase before flashing',
    reset: '`--reset` to reset after flashing',
    reset_types: '`--reset-type` to choose how the device is reset',
    extload: '`--extload` for an external loader',
    tool_opt: '`-O`/`--tool-opt` to pass options straight to the underlying tool',
    file: '`--file` to override the artefact chosen from the build directory',
    rtt: '`west rtt` for a Segger RTT terminal',
  };
  const lines: string[] = [];
  for (const [flag, description] of Object.entries(flagNames)) {
    if (capabilities[flag] === true) lines.push(description);
  }
  const resetTypes = capabilities['reset_types_supported'];
  if (Array.isArray(resetTypes) && resetTypes.length > 0) {
    lines.push(`\`--reset-type\` accepts: ${resetTypes.map((t) => `\`${String(t)}\``).join(', ')}`);
  }
  return lines;
}

function usage(idx: Index, runner: string): RunnerUsage {
  const row = idx.get(
    `SELECT COUNT(*) AS boards,
            SUM(flash_default) AS flash_default_for,
            SUM(debug_default) AS debug_default_for
       FROM board_runner WHERE runner = ? AND available = 1`,
    runner,
  );
  const examples = idx.all(
    `SELECT b.name FROM board_runner r JOIN board b ON b.id = r.board_id
      WHERE r.runner = ? AND r.available = 1 ORDER BY b.name LIMIT 6`,
    runner,
  );
  return {
    boards: row ? Number(row['boards'] ?? 0) : 0,
    flashDefaultFor: row ? Number(row['flash_default_for'] ?? 0) : 0,
    debugDefaultFor: row ? Number(row['debug_default_for'] ?? 0) : 0,
    examples: examples.map((item) => String(item['name'])),
  };
}

function renderRunner(idx: Index, name: string): BatchEntry {
  const row = idx.get(
    'SELECT name, module, description, capabilities, commands FROM runner WHERE name = ?',
    name,
  );
  if (!row) {
    const all = idx
      .all('SELECT name FROM runner ORDER BY name')
      .map((item) => String(item['name']));
    return {
      key: name,
      text: `## ${name}\n\n${catalogueMissText(
        'Runner',
        name,
        idx.meta['zephyr_version'] ?? 'unknown',
        all,
        'Runners come from this Zephyr tree; a runner added by an out-of-tree module is not covered.',
      )}`,
      structured: { name, found: false },
    };
  }

  const capabilities = json<Record<string, unknown>>(row['capabilities'], {});
  const commands = json<string[]>(row['commands'], []);
  const where = usage(idx, name);
  const description = (row['description'] as string | null) ?? '';

  const text = joinSections([
    `## \`${name}\``,
    description,
    commands.length > 0
      ? `**Supports:** ${commands.map((c) => `\`west ${c}\``).join(', ')}`
      : '**Supports no west command directly.** It is selected for a board but ' +
        'drives nothing through `west flash` or `west debug`.',
    section('Options this runner accepts', capabilityLines(capabilities)),
    where.boards > 0
      ? `**Selected by ${where.boards} board(s)** in this tree` +
        (where.flashDefaultFor > 0 ? `, the flash default for ${where.flashDefaultFor}` : '') +
        (where.debugDefaultFor > 0 ? `, the debug default for ${where.debugDefaultFor}` : '') +
        `.\nFor example: ${boundedList(where.examples, 6)}`
      : '**No board in this tree registers this runner.**',
    `_Implementation: \`${String(row['module'])}\` — read it with get_source._`,
  ]);

  return {
    key: name,
    text,
    structured: {
      name,
      found: true,
      module: row['module'],
      description,
      commands,
      capabilities,
      usedBy: where,
    },
  };
}

export const getRunner: ToolFactory = (index) => ({
  name: 'get_runner',
  title: 'Get a west runner',
  description:
    'Get what a Zephyr flash/debug runner actually supports in this Zephyr version: which west ' +
    'commands it implements, which options it accepts, and which boards select it. Use before ' +
    'passing `west flash -r <runner>` or an option like `--dev-id`, `--erase`, or `--reset-type`: ' +
    'runners differ in what they accept and west rejects an unsupported option outright. ' +
    'Capabilities are read from the runner classes in the indexed tree, not from a fixed list. ' +
    'Accepts one name or a list.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { ...STRING, description: 'Runner name, e.g. "openocd", "jlink", "esp32".' },
      names: batchSchema('Several runner names, answered compactly in one call.'),
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const { values, batched } = oneOrMany(args, 'name', 'names');
    const idx = index();
    const entries = values.map((value) => renderRunner(idx, value));
    if (!batched) {
      const only = entries[0]!;
      return { content: [{ type: 'text' as const, text: only.text }], structuredContent: only.structured };
    }
    return batchResult(entries, BATCH_MAX_CHARS);
  },
});
