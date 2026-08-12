import { clampLimit, json, snippet } from '../db.ts';
import {
  type ToolFactory,
  catalogueMiss,
  joinSections,
  limitSchema,
  noResults,
  prefixCandidates,
  requireString,
  result,
  section,
} from './common.ts';

interface Conditional {
  value: string;
  cond?: string;
}

interface DefinitionDetail {
  file: string;
  line: number;
  prompt: string | null;
  promptCondition: string | null;
  menuPath: string[];
  condition: string;
  isMenuconfig: boolean;
  isConfigDefault: boolean;
  defaults: Conditional[];
  selects: Conditional[];
  implies: Conditional[];
  ranges: Array<{ low: string; high: string; cond?: string }>;
}

/** Upper bound on rendered definition contexts; see the query in `get_kconfig`. */
const MAX_DEFINITIONS = 12;

/** Kconfig symbols are stored without the `CONFIG_` prefix that appears in .conf files. */
function normaliseName(name: string): string {
  return name.trim().replace(/^CONFIG_/, '').toUpperCase();
}

function renderConditionals(items: Conditional[]): string[] {
  return items.map((d) => (d.cond ? `\`${d.value}\` if \`${d.cond}\`` : `\`${d.value}\``));
}

export const searchKconfig: ToolFactory = (index) => ({
  name: 'search_kconfig',
  title: 'Search Kconfig symbols',
  description:
    'Search Zephyr Kconfig symbols by name or by what they do. Use this before writing any ' +
    'CONFIG_ line in prj.conf, a defconfig, or a Kconfig file: symbol names are renamed between ' +
    'Zephyr releases and are the single most common thing to get wrong. Accepts names with or ' +
    'without the CONFIG_ prefix, and plain-language queries such as "bluetooth peripheral role" ' +
    'or "spi dma". Returns each symbol with its type and prompt; follow up with get_kconfig for ' +
    'defaults and dependencies.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Symbol name fragment or plain-language description of the option.',
      },
      limit: limitSchema(15),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const raw = requireString(args, 'query');
    const limit = clampLimit(args['limit'], 15);
    const query = raw.replace(/\bCONFIG_/g, '');

    const rows = index().search(
      `SELECT k.name, k.type, k.prompt, k.help, k.menu_path
         FROM kconfig_fts f JOIN kconfig k ON k.id = f.rowid
        WHERE kconfig_fts MATCH ?
        ORDER BY bm25(kconfig_fts, 12.0, 4.0, 1.0)
        LIMIT ?`,
      query,
      [limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'Kconfig symbols',
        raw,
        'Try a shorter query, a single keyword, or search the documentation with search_docs. ' +
          'Note that a symbol may exist only when a particular subsystem or board is selected.',
      );
    }

    const results = rows.map((r) => ({
      name: `CONFIG_${String(r['name'])}`,
      type: (r['type'] as string) ?? 'unknown',
      prompt: (r['prompt'] as string) ?? '',
      summary: snippet(String(r['help'] ?? '').split('\n\n')[0] ?? '', 220),
      menuPath: (r['menu_path'] as string) ?? '',
    }));

    const text = results
      .map((r) => {
        const head = `### CONFIG_${r.name.replace(/^CONFIG_/, '')}  \`${r.type}\``;
        const prompt = r.prompt ? `\n${r.prompt}` : '';
        const help = r.summary ? `\n\n${r.summary}` : '';
        return `${head}${prompt}${help}`;
      })
      .join('\n\n');

    return result(
      `Found ${results.length} Kconfig symbol(s) for "${raw}".\n\n${text}\n\n` +
        'Use get_kconfig for defaults, dependencies, and what selects a symbol.',
      { query: raw, count: results.length, results },
    );
  },
});

export const getKconfig: ToolFactory = (index) => ({
  name: 'get_kconfig',
  title: 'Get a Kconfig symbol',
  description:
    'Get the full definition of one Zephyr Kconfig symbol: type, default values with the ' +
    'conditions that select them, what it depends on, what it selects and implies, valid ranges, ' +
    'help text, the files that define it, and which other symbols select or imply it. Use this to ' +
    'confirm a symbol exists before relying on it, and to diagnose a setting that appears to be ' +
    'ignored. The tool shows catalogue-level dependency information; use the resolved build ' +
    'configuration to determine whether a setting is visible and effective.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Symbol name, with or without the CONFIG_ prefix (e.g. CONFIG_BT_PERIPHERAL).',
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const requested = requireString(args, 'name');
    const name = normaliseName(requested);
    const idx = index();

    const row = idx.get(
      `SELECT id, name, type, prompt, help, has_prompt, choice, n_defs
         FROM kconfig WHERE name = ?`,
      name,
    );

    if (!row) {
      // Offer the nearest names rather than a bare miss. Underscores are split
      // into separate terms so BT_PERIPHERAL_MODE can still reach BT_PERIPHERAL;
      // as one token it matches nothing and the user gets no help at all.
      const near = idx.search(
        `SELECT k.name FROM kconfig_fts f JOIN kconfig k ON k.id = f.rowid
          WHERE kconfig_fts MATCH ? ORDER BY bm25(kconfig_fts, 12.0, 4.0, 1.0) LIMIT 8`,
        name.replace(/_/g, ' '),
        [],
        8,
      );
      const byPrefix = prefixCandidates(
        (sql, ...params) => idx.all(sql, ...params),
        "SELECT name FROM kconfig WHERE name LIKE ? ESCAPE '\\' ORDER BY LENGTH(name) LIMIT 40",
        name,
        'name',
      );
      const candidates = [...new Set([...near.map((r) => String(r['name'])), ...byPrefix])];
      return catalogueMiss(
        'Kconfig symbol',
        `CONFIG_${name}`,
        idx.meta['zephyr_version'] ?? 'unknown',
        candidates.map((value) => `CONFIG_${value}`),
        'Generated, application-local, board/SoC-derived, and external-module symbols may not be covered.',
      );
    }

    // Board and SoC defconfigs make definition counts wildly uneven: NUM_IRQS has
    // 730 alternatives and SOC 719. Rendering every one produced a quarter-megabyte
    // answer and ran four queries per definition, so the set is capped here — in
    // SQL, not after the fact — with prompted (assignable) contexts first, since
    // those are the ones an application configuration can act on.
    const definitionTotal = Number(row['n_defs']);
    const definitionRows = idx.all(
      `SELECT d.id, d.file, d.line, d.prompt, d.menu_path, d.is_menuconfig,
              d.is_configdefault, COALESCE(e.display, 'y') AS condition,
              pe.display AS prompt_condition
         FROM kconfig_definition d
         LEFT JOIN kconfig_expr e ON e.id = d.condition_expr_id
         LEFT JOIN kconfig_expr pe ON pe.id = d.prompt_condition_id
        WHERE d.symbol_id = ? ORDER BY (d.prompt IS NULL), d.id
        LIMIT ?`,
      Number(row['id']),
      MAX_DEFINITIONS,
    );
    const omitted = Math.max(0, definitionTotal - definitionRows.length);
    const definitions: DefinitionDetail[] = definitionRows.map((definition) => {
      const definitionId = Number(definition['id']);
      const defaults = idx.all(
        `SELECT v.display AS value, COALESCE(c.display, 'y') AS cond
           FROM kconfig_default d
           JOIN kconfig_expr v ON v.id = d.value_expr_id
           LEFT JOIN kconfig_expr c ON c.id = d.condition_expr_id
          WHERE d.definition_id = ? ORDER BY d.ord`,
        definitionId,
      ).map((item) => ({
        value: String(item['value']),
        ...(item['cond'] !== 'y' ? { cond: String(item['cond']) } : {}),
      }));
      const relations = (kind: 'select' | 'imply'): Conditional[] =>
        idx.all(
          `SELECT r.target_name AS value, COALESCE(c.display, 'y') AS cond
             FROM kconfig_relation r
             LEFT JOIN kconfig_expr c ON c.id = r.condition_expr_id
            WHERE r.definition_id = ? AND r.kind = ? ORDER BY r.ord`,
          definitionId,
          kind,
        ).map((item) => ({
          value: String(item['value']),
          ...(item['cond'] !== 'y' ? { cond: String(item['cond']) } : {}),
        }));
      const ranges = idx.all(
        `SELECT low.display AS low, high.display AS high, COALESCE(c.display, 'y') AS cond
           FROM kconfig_range r
           JOIN kconfig_expr low ON low.id = r.low_expr_id
           JOIN kconfig_expr high ON high.id = r.high_expr_id
           LEFT JOIN kconfig_expr c ON c.id = r.condition_expr_id
          WHERE r.definition_id = ? ORDER BY r.ord`,
        definitionId,
      ).map((item) => ({
        low: String(item['low']),
        high: String(item['high']),
        ...(item['cond'] !== 'y' ? { cond: String(item['cond']) } : {}),
      }));
      return {
        file: String(definition['file']),
        line: Number(definition['line']),
        prompt: (definition['prompt'] as string) ?? null,
        promptCondition: (definition['prompt_condition'] as string) ?? null,
        menuPath: json<string[]>(definition['menu_path'], []),
        condition: String(definition['condition']),
        isMenuconfig: Number(definition['is_menuconfig']) === 1,
        isConfigDefault: Number(definition['is_configdefault']) === 1,
        defaults,
        selects: relations('select'),
        implies: relations('imply'),
        ranges,
      };
    });

    const selectedBy = idx
      .all('SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? ORDER BY from_sym LIMIT 40', name, 'select')
      .map((r) => String(r['from_sym']));
    const impliedBy = idx
      .all('SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? ORDER BY from_sym LIMIT 20', name, 'imply')
      .map((r) => String(r['from_sym']));

    const type = (row['type'] as string) ?? 'unknown';
    const header = `# CONFIG_${name}\n\n\`${type}\`${row['prompt'] ? ` — ${String(row['prompt'])}` : ''}`;

    const text = joinSections([
      header,
      row['help'] ? String(row['help']) : undefined,
      definitions.length > 0
        ? `## Definition contexts (${definitions.length} of ${definitionTotal}${omitted > 0 ? ', prompted contexts first' : ''})\n\n` +
          definitions.map((definition, index) => joinSections([
            `### Alternative ${index + 1}: \`${definition.file}:${definition.line}\`${definition.isConfigDefault ? ' (`configdefault`)' : ''}`,
            `**Depends on in this context:** \`${definition.condition}\``,
            definition.prompt ? `**Prompt:** ${definition.prompt}` : '**Prompt:** _none (not directly assignable from application configuration)_',
            definition.promptCondition
              ? `**Prompt visibility expression:** \`${definition.promptCondition}\``
              : undefined,
            section('Defaults in this context', renderConditionals(definition.defaults)),
            section('Selects in this context', renderConditionals(definition.selects)),
            section('Implies in this context', renderConditionals(definition.implies)),
            section(
              'Ranges in this context',
              definition.ranges.map((range) =>
                `\`${range.low}\` .. \`${range.high}\`${range.cond ? ` if \`${range.cond}\`` : ''}`,
              ),
            ),
            definition.menuPath.length > 0 ? `**Menu path:** ${definition.menuPath.join(' > ')}` : undefined,
          ])).join('\n\n') +
          (omitted > 0
            ? `\n\n_${omitted} further definition context(s) are not shown; they are board, SoC, and shield ` +
              'defconfig alternatives. The effective value comes from the resolved build configuration, ' +
              'not from any single alternative here._'
            : '')
        : undefined,
      section(
        'Selected by (enabling any of these forces it on)',
        selectedBy.map((s) => `CONFIG_${s}`),
      ),
      section('Implied by', impliedBy.map((s) => `CONFIG_${s}`)),
      row['choice'] ? `**Part of choice** \`${String(row['choice'])}\` — options are mutually exclusive.` : undefined,
      Number(row['has_prompt']) === 0
        ? '**Assignability:** promptless; do not assign this symbol from `prj.conf`.'
        : '**Assignability:** at least one definition has a user-visible prompt. Visibility still depends on the selected build context.',
    ]);

    return result(text, {
      name: `CONFIG_${name}`,
      found: true,
      type,
      prompt: row['prompt'] ?? '',
      help: row['help'] ?? '',
      hasPrompt: Number(row['has_prompt']) === 1,
      definitions,
      definitionCount: definitionTotal,
      definitionsTruncated: omitted > 0,
      selectedBy: selectedBy.map((s) => `CONFIG_${s}`),
      impliedBy: impliedBy.map((s) => `CONFIG_${s}`),
      choice: row['choice'] ?? null,
      knowledgeLevel: 'catalogue',
    });
  },
});
