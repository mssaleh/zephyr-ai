import { clampLimit, json, snippet } from '../db.ts';
import {
  type ToolFactory,
  catalogueMiss,
  joinSections,
  limitSchema,
  noResults,
  requireString,
  result,
  section,
} from './common.ts';

interface Conditional {
  value: string;
  cond?: string;
}

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
      `SELECT name, type, prompt, help, defaults, depends, selects, implies, ranges,
              defined_in, menu_path, is_choice, choice, n_defs
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
      return catalogueMiss(
        'Kconfig symbol',
        `CONFIG_${name}`,
        idx.meta['zephyr_version'] ?? 'unknown',
        near.map((r) => `CONFIG_${String(r['name'])}`),
        'Generated, application-local, board/SoC-derived, and external-module symbols may not be covered.',
      );
    }

    const defaults = json<Conditional[]>(row['defaults'], []);
    const depends = json<string[]>(row['depends'], []);
    const selects = json<Conditional[]>(row['selects'], []);
    const implies = json<Conditional[]>(row['implies'], []);
    const ranges = json<{ low: string; high: string; cond?: string }[]>(row['ranges'], []);
    const definedIn = json<{ file: string; line: number }[]>(row['defined_in'], []);

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
      section('Defaults', renderConditionals(defaults)),
      section('Depends on', depends.map((d) => `\`${d}\``)),
      section('Range', ranges.map((r) => `\`${r.low}\` .. \`${r.high}\`${r.cond ? ` if \`${r.cond}\`` : ''}`)),
      section('Selects', renderConditionals(selects)),
      section('Implies', renderConditionals(implies)),
      section(
        'Selected by (enabling any of these forces it on)',
        selectedBy.map((s) => `CONFIG_${s}`),
      ),
      section('Implied by', impliedBy.map((s) => `CONFIG_${s}`)),
      row['choice'] ? `**Part of choice** \`${String(row['choice'])}\` — options are mutually exclusive.` : undefined,
      section(
        `Defined in (${definedIn.length} location${definedIn.length === 1 ? '' : 's'})`,
        definedIn.slice(0, 12).map((d) => `\`${d.file}:${d.line}\``),
      ),
      row['menu_path'] ? `**Menu path** ${String(row['menu_path'])}` : undefined,
    ]);

    return result(text, {
      name: `CONFIG_${name}`,
      found: true,
      type,
      prompt: row['prompt'] ?? '',
      help: row['help'] ?? '',
      defaults,
      depends,
      selects,
      implies,
      ranges,
      selectedBy: selectedBy.map((s) => `CONFIG_${s}`),
      impliedBy: impliedBy.map((s) => `CONFIG_${s}`),
      definedIn,
      choice: row['choice'] ?? null,
      menuPath: row['menu_path'] ?? '',
    });
  },
});
