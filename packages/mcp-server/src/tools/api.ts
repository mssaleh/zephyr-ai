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
  oneOrMany,
  optionalString,
  requireString,
  result,
  section,
} from './common.ts';

interface Param {
  name: string;
  description: string;
  direction?: string;
  type?: string;
}

const API_KINDS = [
  'function',
  'macro',
  'struct',
  'enum',
  'enumvalue',
  'typedef',
  'union',
  'variable',
] as const;

export const searchApi: ToolFactory = (index) => ({
  name: 'search_api',
  title: 'Search the Zephyr C API',
  description:
    'Search Zephyr public C functions, macros, structs, enums, and typedefs by name or purpose. ' +
    'Use this to confirm a function exists and to find the right one for a task ("read a sensor ' +
    'channel", "get a device from devicetree", "submit work"). Zephyr often has more than one API ' +
    'for the same job, such as device_get_binding() and DEVICE_DT_GET(), or sensor fetch-and-get ' +
    'and read-and-decode. Search first so you do not pick a deprecated one.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Symbol name fragment or description of the task.' },
      kind: {
        type: 'string',
        enum: API_KINDS,
        description: 'Restrict to one kind of symbol.',
      },
      group: {
        type: 'string',
        description: 'Restrict to a Doxygen API group, e.g. "gpio_interface", "thread_apis".',
      },
      limit: limitSchema(12),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = requireString(args, 'query');
    const kind = optionalString(args, 'kind');
    const group = optionalString(args, 'group');
    const limit = clampLimit(args['limit'], 12);

    const filters: string[] = [];
    const params: unknown[] = [];
    if (kind) {
      filters.push('AND s.kind = ?');
      params.push(kind);
    }
    if (group) {
      filters.push('AND s.api_group = ?');
      params.push(group);
    }

    const rows = index().search(
      `SELECT s.name, s.kind, s.signature, s.brief, s.header, s.api_group, s.deprecated
         FROM api_fts f JOIN api_symbol s ON s.id = f.rowid
        WHERE api_fts MATCH ? ${filters.join(' ')}
        ORDER BY bm25(api_fts, 10.0, 3.0, 1.0)
        LIMIT ?`,
      query,
      [...params, limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'API symbols',
        query,
        'Try the subsystem prefix on its own ("k_", "gpio_", "sensor_"), or search_docs for the ' +
          'concept. Driver-internal and vendor HAL functions are not indexed.',
      );
    }

    const results = rows.map((r) => ({
      name: String(r['name']),
      kind: String(r['kind']),
      signature: String(r['signature'] ?? ''),
      brief: String(r['brief'] ?? ''),
      header: String(r['header']),
      group: (r['api_group'] as string) ?? null,
      deprecated: Number(r['deprecated']) === 1,
    }));

    const text = results
      .map((r) =>
        [
          `### ${r.name}${r.deprecated ? '  ⚠️ DEPRECATED' : ''}`,
          '```c',
          snippet(r.signature, 300),
          '```',
          r.brief,
          `_${r.kind} · ${r.header}${r.group ? ` · group ${r.group}` : ''}_`,
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n');

    return result(
      `Found ${results.length} symbol(s) for "${query}".\n\n${text}\n\n` +
        'Use get_api for parameters and return values.',
      { query, count: results.length, results },
    );
  },
});

function apiMissText(idx: Index, name: string): string {
  const near = idx.search(
    `SELECT s.name, s.kind FROM api_fts f JOIN api_symbol s ON s.id = f.rowid
      WHERE api_fts MATCH ? ORDER BY bm25(api_fts, 10.0, 3.0, 1.0) LIMIT 8`,
    name.replace(/_/g, ' '),
    [],
    8,
  );
  return catalogueMissText(
    'C API symbol',
    name,
    idx.meta['zephyr_version'] ?? 'unknown',
    near.map((r) => String(r['name'])),
    'Internal APIs, vendor-native SDK APIs, generated declarations, and external-module headers may not be covered.',
  );
}

/**
 * What a batched lookup returns for one symbol: that it exists, its signature,
 * and where it is declared. Parameter and return documentation stays behind the
 * singular form, which is the call to make before actually using the symbol.
 */
function apiSummary(idx: Index, requested: string, kind: string | undefined): BatchEntry {
  const name = requested.replace(/\(\)$/, '');
  const rows = idx.all(
    `SELECT name, kind, signature, brief, header, line, deprecated
       FROM api_symbol WHERE name = ? ${kind ? 'AND kind = ?' : ''}
       ORDER BY CASE kind WHEN 'function' THEN 0 WHEN 'macro' THEN 1 ELSE 2 END`,
    ...(kind ? [name, kind] : [name]),
  );
  if (rows.length === 0) {
    return {
      key: name,
      text: `### ${name}\n\n${apiMissText(idx, name)}`,
      structured: { name, found: false },
    };
  }

  const row = rows[0]!;
  const memberCount =
    String(row['kind']) === 'enum'
      ? Number(
        idx.get(
          `SELECT COUNT(*) AS c FROM api_symbol
              WHERE kind = 'enumvalue' AND parent_symbol = ? AND header = ?`,
          String(row['name']),
          String(row['header']),
        )?.['c'] ?? 0,
      )
      : 0;

  return {
    key: name,
    text: joinSections([
      `### ${name}${Number(row['deprecated']) === 1 ? '  ⚠️ DEPRECATED' : ''}`,
      `\`\`\`c\n${String(row['signature'])}\n\`\`\``,
      row['brief']
        ? String(row['brief'])
        : '_No brief description is present in the indexed API source._',
      memberCount > 0
        ? `_${memberCount} enum members — call get_api with a single name to list them._`
        : undefined,
      `_${String(row['kind'])} · \`${String(row['header'])}:${Number(row['line'])}\`` +
        `${rows.length > 1 ? ` · also defined as ${rows.slice(1).map((r) => String(r['kind'])).join(', ')}` : ''}_`,
    ]),
    structured: {
      name: row['name'],
      found: true,
      kind: row['kind'],
      signature: row['signature'],
      brief: row['brief'] ?? '',
      header: row['header'],
      line: row['line'],
      deprecated: Number(row['deprecated']) === 1,
      memberCount,
    },
  };
}

export const getApi: ToolFactory = (index) => ({
  name: 'get_api',
  title: 'Get Zephyr API symbols',
  description:
    'Get the indexed contract of a Zephyr C symbol: signature, parameter documentation, return ' +
    'description, and documented error codes. Use before calling an unfamiliar function. Zephyr ' +
    'commonly returns negative errno values, and the documented set differs per function. When a ' +
    'symbol has no documentation the tool reports that as unknown; it does not mean the call ' +
    'cannot fail. Pass "names" to check several symbols and read their signatures in one call.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Exact symbol name, e.g. "gpio_pin_configure_dt".' },
      names: batchSchema(
        'Several symbols in one call, e.g. ["sensor_sample_fetch", "sensor_channel_get"]. ' +
          'Returns each signature and where it is declared, without the parameter and return ' +
          'documentation the single-name form gives.',
      ),
      kind: {
        type: 'string',
        enum: API_KINDS,
        description: 'Disambiguate when a name exists as more than one kind.',
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const { values, batched } = oneOrMany(args, 'name', 'names');
    const kind = optionalString(args, 'kind');
    const idx = index();

    if (batched) {
      return batchResult(
        values.map((value) => apiSummary(idx, value, kind)),
        BATCH_MAX_CHARS,
      );
    }

    const name = values[0]!.replace(/\(\)$/, '');

    const rows = idx.all(
      `SELECT name, kind, signature, brief, detail, params, returns, retvals,
              api_group, since, deprecated, header, line, doxygen_id, doc_anchor
         FROM api_symbol WHERE name = ? ${kind ? 'AND kind = ?' : ''}
         ORDER BY CASE kind WHEN 'function' THEN 0 WHEN 'macro' THEN 1 ELSE 2 END`,
      ...(kind ? [name, kind] : [name]),
    );

    if (rows.length === 0) throw new ToolError(apiMissText(idx, name));

    const row = rows[0]!;
    const params = json<Param[]>(row['params'], []);
    const returns = json<string[]>(row['returns'], []);
    const retvals = json<{ value: string; description: string }[]>(row['retvals'], []);

    // An enum without its members answers only that the type exists. The
    // members are what a caller has to pass, and reading them out of the header
    // is the second of the two lookups this server previously sent to grep.
    // `ORDER BY id` is declaration order, which carries meaning for flag and
    // sequence enums.
    const members =
      String(row['kind']) === 'enum'
        ? idx
          .all(
            `SELECT name, signature, brief FROM api_symbol
                WHERE kind = 'enumvalue' AND parent_symbol = ? AND header = ? ORDER BY id`,
            String(row['name']),
            String(row['header']),
          )
          .map((r) => ({
            name: String(r['name']),
            signature: String(r['signature'] ?? ''),
            brief: String(r['brief'] ?? ''),
          }))
        : [];

    const text = joinSections([
      `# ${String(row['name'])}${Number(row['deprecated']) === 1 ? '  ⚠️ DEPRECATED' : ''}`,
      `\`\`\`c\n${String(row['signature'])}\n\`\`\``,
      row['brief'] ? String(row['brief']) : '_No brief description is present in the indexed API source._',
      row['detail'] ? String(row['detail']) : '_No detailed documentation is present; this does not imply the API has no constraints or failure modes._',
      section(
        'Members',
        members.map((m) => `\`${m.signature || m.name}\`${m.brief ? ` — ${m.brief}` : ''}`),
      ),
      String(row['kind']) === 'enum' && members.length === 0
        ? '_No members are recorded for this enum in the indexed API source._'
        : undefined,
      section(
        'Parameters',
        params.map(
          (p) =>
            `\`${p.name}\`${p.type ? ` (${p.type})` : ''}${p.direction ? ` *[${p.direction}]*` : ''} — ` +
            (p.description || '_undocumented_'),
        ),
      ),
      returns.length > 0
        ? section('Returns', returns)
        : '_No return description is present in the indexed API source._',
      retvals.length > 0
        ? section(
          'Return values',
          retvals.map((r) => `\`${r.value}\` — ${r.description}`),
        )
        : '_No individual return values are documented here; this does not prove the call cannot fail._',
      row['since'] ? `_Available since Zephyr ${String(row['since'])}._` : undefined,
      row['doc_anchor']
        ? `[Official API documentation](${idx.meta['doc_base_url'] ?? ''}doxygen/html/${String(row['doc_anchor'])})`
        : '_No stable Doxygen documentation anchor is available because this index used the header fallback._',
      `_${String(row['kind'])} · \`${String(row['header'])}:${Number(row['line'])}\`` +
        `${row['api_group'] ? ` · group \`${String(row['api_group'])}\`` : ''}_`,
      rows.length > 1
        ? `_Also defined as: ${rows.slice(1).map((r) => String(r['kind'])).join(', ')}. Pass "kind" to select one._`
        : undefined,
    ]);

    return result(text, {
      name: row['name'],
      found: true,
      kind: row['kind'],
      signature: row['signature'],
      brief: row['brief'] ?? '',
      detail: row['detail'] ?? '',
      params,
      returns,
      retvals,
      members,
      group: row['api_group'] ?? null,
      header: row['header'],
      line: row['line'],
      deprecated: Number(row['deprecated']) === 1,
      since: row['since'] ?? null,
      doxygenId: row['doxygen_id'] ?? null,
      documentationUrl: row['doc_anchor']
        ? `${idx.meta['doc_base_url'] ?? ''}doxygen/html/${String(row['doc_anchor'])}`
        : null,
    });
  },
});
