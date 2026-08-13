import { type Index, clampLimit, json, snippet } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  BATCH_MAX_CHARS,
  type BatchEntry,
  type ToolFactory,
  batchResult,
  batchSchema,
  catalogueMissText,
  joinSections,
  limitSchema,
  noResults,
  optionalString,
  oneOrMany,
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

export type KconfigScope = 'zephyr' | 'sysbuild';

interface ScopedName {
  name: string;
  scope: KconfigScope;
  /** The prefix this symbol is written with in a configuration file. */
  prefix: string;
}

/**
 * Split a requested symbol into its namespace and bare name.
 *
 * A Zephyr tree defines two Kconfig graphs. The application tree is written
 * `CONFIG_`; sysbuild is written `SB_CONFIG_`, and the prefix is the only thing
 * in the request that distinguishes them — the stored names carry neither. The
 * order matters: `SB_CONFIG_` has to be tested first, because stripping
 * `CONFIG_` from it would leave a name in the wrong namespace.
 */
function normaliseName(name: string): ScopedName {
  const trimmed = name.trim().toUpperCase();
  if (trimmed.startsWith('SB_CONFIG_')) {
    return { name: trimmed.slice('SB_CONFIG_'.length), scope: 'sysbuild', prefix: 'SB_CONFIG_' };
  }
  return { name: trimmed.replace(/^CONFIG_/, ''), scope: 'zephyr', prefix: 'CONFIG_' };
}

const SCOPE_PREFIX: Record<KconfigScope, string> = {
  zephyr: 'CONFIG_',
  sysbuild: 'SB_CONFIG_',
};

/**
 * A note when the same name means something else in the other namespace.
 *
 * Only ten symbol names in this tree are genuinely different symbols across the
 * two graphs; the other 2866 shared names are one symbol reached through both
 * roots, because share/sysbuild/Kconfig sources the whole board and SoC tree.
 * Sharing a declaring file is what separates the two cases, so the note fires
 * where the answer would otherwise be confidently wrong and stays silent
 * everywhere else.
 */
function otherNamespaceNote(idx: Index, name: string, scope: KconfigScope): string | undefined {
  const other: KconfigScope = scope === 'zephyr' ? 'sysbuild' : 'zephyr';
  const row = idx.get(
    'SELECT prompt, defined_in FROM kconfig WHERE name = ? AND scope = ?',
    name,
    other,
  );
  if (!row) return undefined;
  const mine = idx.get(
    'SELECT defined_in FROM kconfig WHERE name = ? AND scope = ?',
    name,
    scope,
  );
  const files = (value: unknown): string[] =>
    json<Array<string | { file?: string }>>(value, []).map((entry) =>
      typeof entry === 'string' ? entry : (entry.file ?? ''),
    );
  const ours = new Set(files(mine?.['defined_in']));
  if (files(row['defined_in']).some((file) => ours.has(file))) return undefined;
  const prompt = String(row['prompt'] ?? '').trim();
  return (
    `> **A different symbol shares this name.** \`${SCOPE_PREFIX[other]}${name}\` exists in the ` +
    `${other === 'sysbuild' ? 'sysbuild' : 'application'} namespace and is declared elsewhere` +
    `${prompt ? `: "${prompt}"` : ''}. ` +
    `${other === 'sysbuild' ? '`sysbuild.conf`' : '`prj.conf`'} takes that one.`
  );
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
    'defaults and dependencies. A Zephyr tree has two Kconfig namespaces: pass scope="sysbuild" ' +
    '(or write SB_CONFIG_) to search the sysbuild.conf options instead of the application ones.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Symbol name fragment or plain-language description of the option.',
      },
      scope: {
        type: 'string',
        enum: ['zephyr', 'sysbuild'],
        description:
          'Which Kconfig namespace to search. "zephyr" is prj.conf and CONFIG_ (the default); ' +
          '"sysbuild" is sysbuild.conf and SB_CONFIG_.',
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
    // A query written as SB_CONFIG_FOO names its own namespace; strip the longer
    // prefix first so the shorter one does not leave SB_ behind on the term.
    const requestedScope = optionalString(args, 'scope');
    const scope: KconfigScope =
      requestedScope === 'sysbuild' || /\bSB_CONFIG_/.test(raw) ? 'sysbuild' : 'zephyr';
    const prefix = SCOPE_PREFIX[scope];
    const query = raw.replace(/\bSB_CONFIG_/g, '').replace(/\bCONFIG_/g, '');

    const rows = index().search(
      `SELECT k.name, k.type, k.prompt, k.help, k.menu_path
         FROM kconfig_fts f JOIN kconfig k ON k.id = f.rowid
        WHERE kconfig_fts MATCH ? AND k.scope = ?
        ORDER BY bm25(kconfig_fts, 12.0, 4.0, 1.0)
        LIMIT ?`,
      query,
      [scope, limit],
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
      name: `${prefix}${String(r['name'])}`,
      type: (r['type'] as string) ?? 'unknown',
      prompt: (r['prompt'] as string) ?? '',
      summary: snippet(String(r['help'] ?? '').split('\n\n')[0] ?? '', 220),
      menuPath: (r['menu_path'] as string) ?? '',
    }));

    const text = results
      .map((r) => {
        const head = `### ${r.name}  \`${r.type}\``;
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

/**
 * The message for a symbol the catalogue does not hold.
 *
 * Offers the nearest names rather than a bare miss. Underscores are split into
 * separate terms so BT_PERIPHERAL_MODE can still reach BT_PERIPHERAL; as one
 * token it matches nothing and the user gets no help at all.
 */
function kconfigMissText(idx: Index, name: string, scope: KconfigScope): string {
  // Before offering spelling matches, check whether the symbol simply lives in
  // the other namespace. A user who drops the SB_ from a sysbuild option gets a
  // near-miss list of unrelated names otherwise, when the exact symbol exists.
  const other: KconfigScope = scope === 'zephyr' ? 'sysbuild' : 'zephyr';
  if (idx.get('SELECT 1 FROM kconfig WHERE name = ? AND scope = ?', name, other)) {
    return (
      `Kconfig symbol \`${SCOPE_PREFIX[scope]}${name}\` is not in the ` +
      `${scope === 'sysbuild' ? 'sysbuild' : 'application'} namespace of the indexed Zephyr ` +
      `${idx.meta['zephyr_version'] ?? 'unknown'} catalogue, but \`${SCOPE_PREFIX[other]}${name}\` ` +
      `is. ${other === 'sysbuild' ? '`sysbuild.conf` is where that one is set.' : '`prj.conf` is where that one is set.'}`
    );
  }
  const near = idx.search(
    `SELECT k.name FROM kconfig_fts f JOIN kconfig k ON k.id = f.rowid
      WHERE kconfig_fts MATCH ? AND k.scope = ? ORDER BY bm25(kconfig_fts, 12.0, 4.0, 1.0) LIMIT 8`,
    name.replace(/_/g, ' '),
    [scope],
    8,
  );
  const byPrefix = prefixCandidates(
    (sql, ...params) => idx.all(sql, ...params),
    "SELECT name FROM kconfig WHERE name LIKE ? ESCAPE '\\' AND scope = '" + scope + "' ORDER BY LENGTH(name) LIMIT 40",
    name,
    'name',
  );
  const candidates = [...new Set([...near.map((r) => String(r['name'])), ...byPrefix])];
  return catalogueMissText(
    'Kconfig symbol',
    `${SCOPE_PREFIX[scope]}${name}`,
    idx.meta['zephyr_version'] ?? 'unknown',
    candidates.map((value) => `${SCOPE_PREFIX[scope]}${value}`),
    'Generated, application-local, board/SoC-derived, and external-module symbols may not be covered.',
  );
}

/**
 * What a batched lookup returns for one symbol.
 *
 * This is the answer a shell `grep "^config FOO$"` was reaching for and could
 * not give: existence plus type, prompt, dependencies, defaults, and the
 * alternatives in its choice. The full definition-context walk stays behind the
 * singular form, because rendering it for fifty symbols is the quarter-megabyte
 * answer the per-symbol cap already exists to prevent.
 */
function kconfigSummary(idx: Index, requested: string): BatchEntry {
  const { name, scope, prefix } = normaliseName(requested);
  const key = `${prefix}${name}`;
  const row = idx.get(
    'SELECT id, name, type, prompt, has_prompt, choice, n_defs FROM kconfig WHERE name = ? AND scope = ?',
    name,
    scope,
  );
  if (!row) {
    return {
      key,
      text: `### ${key}\n\n${kconfigMissText(idx, name, scope)}`,
      structured: { name: key, found: false, scope },
    };
  }

  // The context an application configuration can actually act on is a prompted
  // one; an unprompted definition is a board or SoC defconfig alternative.
  const definition = idx.get(
    `SELECT d.id, d.file, d.line, COALESCE(e.display, 'y') AS condition
       FROM kconfig_definition d
       LEFT JOIN kconfig_expr e ON e.id = d.condition_expr_id
      WHERE d.symbol_id = ? ORDER BY (d.prompt IS NULL), d.id LIMIT 1`,
    Number(row['id']),
  );
  const defaults = definition
    ? idx
      .all(
        `SELECT v.display AS value, COALESCE(c.display, 'y') AS cond
             FROM kconfig_default d
             JOIN kconfig_expr v ON v.id = d.value_expr_id
             LEFT JOIN kconfig_expr c ON c.id = d.condition_expr_id
            WHERE d.definition_id = ? ORDER BY d.ord LIMIT 6`,
        Number(definition['id']),
      )
      .map((item) =>
        item['cond'] === 'y'
          ? `\`${String(item['value'])}\``
          : `\`${String(item['value'])}\` if \`${String(item['cond'])}\``,
      )
    : [];
  const choiceMembers = idx
    .all(
      `SELECT k2.name AS name
         FROM kconfig_choice_member m1
         JOIN kconfig_choice_member m2 ON m2.choice_id = m1.choice_id
         JOIN kconfig k1 ON k1.id = m1.symbol_id
         JOIN kconfig k2 ON k2.id = m2.symbol_id
        WHERE k1.name = ? AND k1.scope = ? AND k2.name <> k1.name ORDER BY k2.name`,
      name,
      scope,
    )
    .map((r) => `${prefix}${String(r['name'])}`);
  const selectedBy = idx
    .all(
      'SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? AND scope = ? ORDER BY from_sym LIMIT 8',
      name,
      'select',
      scope,
    )
    .map((r) => `${prefix}${String(r['from_sym'])}`);

  const type = (row['type'] as string) ?? 'unknown';
  const hasPrompt = Number(row['has_prompt']) === 1;
  const condition = definition ? String(definition['condition']) : 'y';
  const definitionCount = Number(row['n_defs']);

  const text = joinSections([
    `### ${key}`,
    `\`${type}\`${row['prompt'] ? ` — ${String(row['prompt'])}` : ''}`,
    otherNamespaceNote(idx, name, scope),
    condition !== 'y' ? `**Depends on:** \`${condition}\`` : undefined,
    defaults.length > 0 ? `**Defaults:** ${defaults.join(', ')}` : undefined,
    hasPrompt
      ? undefined
      : '**Promptless** — do not assign this from `prj.conf`; enable a symbol that selects it.',
    selectedBy.length > 0 ? `**Selected by:** ${selectedBy.join(', ')}` : undefined,
    choiceMembers.length > 0
      ? `**Choice alternatives** (selecting one deselects the rest): ${choiceMembers.join(', ')}`
      : undefined,
    definitionCount > 1
      ? `_${definitionCount} definition contexts — call get_kconfig with a single name for all of them._`
      : undefined,
  ]);

  return {
    key,
    text,
    structured: {
      name: key,
      found: true,
      type,
      prompt: row['prompt'] ?? '',
      hasPrompt,
      dependsOn: condition,
      definitionCount,
      selectedBy,
      choice: row['choice'] ?? null,
      choiceMembers,
      knowledgeLevel: 'catalogue',
    },
  };
}

export const getKconfig: ToolFactory = (index) => ({
  name: 'get_kconfig',
  title: 'Get Kconfig symbols',
  description:
    'Get the full definition of a Zephyr Kconfig symbol: type, default values with the ' +
    'conditions that select them, what it depends on, what it selects and implies, valid ranges, ' +
    'help text, the files that define it, and which other symbols select or imply it. Use this to ' +
    'confirm a symbol exists before relying on it, and to diagnose a setting that appears to be ' +
    'ignored. Pass "names" to check many symbols in one call — checking a whole prj.conf should ' +
    'cost one call, not one per line — which returns type, prompt, dependencies, defaults and ' +
    'choice alternatives for each. The tool shows catalogue-level dependency information; use the ' +
    'resolved build configuration to determine whether a setting is visible and effective. ' +
    'Prefixes select the namespace: CONFIG_ is prj.conf, SB_CONFIG_ is sysbuild.conf. Ten symbol ' +
    'names exist in both and mean different things, so pass the prefix the file actually uses.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          'Symbol name, with or without a prefix (e.g. CONFIG_BT_PERIPHERAL). An SB_CONFIG_ ' +
          'prefix selects the sysbuild namespace.',
      },
      names: batchSchema(
        'Several symbols in one call, e.g. ["BT_PERIPHERAL", "NVS", "SETTINGS_NVS"]. Returns a ' +
          'compact summary of each instead of the full definition-context listing. Prefer this ' +
          'over repeated single-name calls.',
      ),
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const { values, batched } = oneOrMany(args, 'name', 'names');
    const idx = index();

    if (batched) {
      return batchResult(
        values.map((value) => kconfigSummary(idx, value)),
        BATCH_MAX_CHARS,
      );
    }

    const { name, scope, prefix } = normaliseName(values[0]!);

    const row = idx.get(
      `SELECT id, name, type, prompt, help, has_prompt, choice, n_defs
         FROM kconfig WHERE name = ? AND scope = ?`,
      name,
      scope,
    );

    if (!row) throw new ToolError(kconfigMissText(idx, name, scope));

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
      .all('SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? AND scope = ? ORDER BY from_sym LIMIT 40', name, 'select', scope)
      .map((r) => String(r['from_sym']));
    const impliedBy = idx
      .all('SELECT DISTINCT from_sym FROM kconfig_edge WHERE to_sym = ? AND kind = ? AND scope = ? ORDER BY from_sym LIMIT 20', name, 'imply', scope)
      .map((r) => String(r['from_sym']));

    // Naming the choice without its members answers "this is exclusive" but not
    // "exclusive with what", which is the question that sends an agent to grep
    // the subsystem's Kconfig. The join goes through this symbol's own
    // membership rather than matching on the choice name, which is nullable for
    // an anonymous choice and not unique.
    const choiceMembers = idx
      .all(
        `SELECT k2.name AS name, k2.prompt AS prompt, k2.type AS type
           FROM kconfig_choice_member m1
           JOIN kconfig_choice_member m2 ON m2.choice_id = m1.choice_id
           JOIN kconfig k1 ON k1.id = m1.symbol_id
           JOIN kconfig k2 ON k2.id = m2.symbol_id
          WHERE k1.name = ? AND k2.name <> k1.name
          ORDER BY k2.name`,
        name,
      )
      .map((r) => ({
        name: `${prefix}${String(r['name'])}`,
        prompt: (r['prompt'] as string) ?? null,
      }));

    const type = (row['type'] as string) ?? 'unknown';
    const header = `# ${prefix}${name}\n\n\`${type}\`${row['prompt'] ? ` — ${String(row['prompt'])}` : ''}`;
    const namespaceNote = otherNamespaceNote(idx, name, scope);

    const text = joinSections([
      header,
      namespaceNote,
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
        selectedBy.map((s) => `${prefix}${s}`),
      ),
      section('Implied by', impliedBy.map((s) => `${prefix}${s}`)),
      row['choice'] ? `**Part of choice** \`${String(row['choice'])}\` — options are mutually exclusive.` : undefined,
      section(
        'Alternatives in this choice (selecting one deselects the rest)',
        choiceMembers.map((m) => `\`${m.name}\`${m.prompt ? ` — ${m.prompt}` : ''}`),
      ),
      Number(row['has_prompt']) === 0
        ? '**Assignability:** promptless; do not assign this symbol from `prj.conf`.'
        : '**Assignability:** at least one definition has a user-visible prompt. Visibility still depends on the selected build context.',
    ]);

    return result(text, {
      name: `${prefix}${name}`,
      found: true,
      type,
      prompt: row['prompt'] ?? '',
      help: row['help'] ?? '',
      hasPrompt: Number(row['has_prompt']) === 1,
      definitions,
      definitionCount: definitionTotal,
      definitionsTruncated: omitted > 0,
      selectedBy: selectedBy.map((s) => `${prefix}${s}`),
      impliedBy: impliedBy.map((s) => `${prefix}${s}`),
      choice: row['choice'] ?? null,
      choiceMembers,
      knowledgeLevel: 'catalogue',
    });
  },
});
