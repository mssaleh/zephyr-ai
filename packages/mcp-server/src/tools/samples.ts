import { clampLimit, json } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
  boundedList,
  catalogueMiss,
  fenceLang,
  joinSections,
  limitSchema,
  noResults,
  optionalString,
  requireString,
  result,
  section,
} from './common.ts';

export const searchSamples: ToolFactory = (index) => ({
  name: 'search_samples',
  title: 'Search Zephyr samples',
  description:
    'Find Zephyr sample applications and upstream Twister test suites by what they demonstrate ' +
    'or verify. Each sample combines a prj.conf, devicetree overlays, and source, plus the ' +
    'Twister platforms upstream records for it. Adapting a sample is more reliable than ' +
    'assembling a configuration from documentation. Search here before writing a new application ' +
    'that uses an unfamiliar subsystem. Pass "board" without a query to list everything upstream ' +
    'declares for that board, which shows what is tested on it. Pass "kind" to restrict the ' +
    'results to samples or to tests.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'What the sample should demonstrate, e.g. "ble peripheral", "lvgl display". ' +
          'Optional when "board" is given.',
      },
      board: {
        type: 'string',
        description:
          'A board name or qualified target. With a query it ranks recorded integration or ' +
          'allowlist evidence for this board first; on its own it returns only what names it.',
      },
      kind: {
        type: 'string',
        enum: ['sample', 'test'],
        description:
          'Restrict to worked examples under samples/ ("sample") or to upstream Twister suites ' +
          'under tests/ ("test"). Both are returned by default.',
      },
      limit: limitSchema(10),
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = optionalString(args, 'query');
    const board = optionalString(args, 'board');
    const kind = optionalString(args, 'kind');
    const limit = clampLimit(args['limit'], 10);
    if (!query && !board) {
      throw new ToolError('Supply "query", "board", or both.');
    }

    const bareBoard = board?.split('/')[0];
    const COLUMNS = `s.path, s.name, s.description, s.tags, s.kind, s.scenarios,
              s.integration_platforms, s.platform_allow, s.files`;
    const namesBoardSql = `EXISTS (
           SELECT 1 FROM sample_platform p
            WHERE p.sample_id = s.id AND (p.platform = ? OR p.platform LIKE ?)
         )`;
    const kindFilter = kind ? ' AND s.kind = ?' : '';

    // Without a query there is nothing to MATCH, so the board evidence becomes
    // the filter rather than a ranking term. "What does upstream run on this
    // board" is a question about the platform lists, not about wording.
    const rows = query
      ? index().search(
        `SELECT ${COLUMNS}
             FROM sample_fts f JOIN sample s ON s.id = f.rowid
            WHERE sample_fts MATCH ?${kindFilter}
            ORDER BY ${bareBoard ? `CASE WHEN ${namesBoardSql} THEN 0 ELSE 1 END,` : ''}
                     bm25(sample_fts, 6.0, 4.0, 3.0, 2.0)
            LIMIT ?`,
        query,
        [
          ...(kind ? [kind] : []),
          ...(bareBoard ? [bareBoard, `${bareBoard}/%`] : []),
          limit,
        ],
        limit,
      )
      : index().all(
        // Interleave the kinds. Ordering by kind or by path puts every sample
        // before every test, so a limit smaller than the sample count hides the
        // tests completely — which is the blindness indexing tests/ exists to
        // remove, reintroduced one layer up.
        `SELECT ${COLUMNS} FROM (
               SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.kind ORDER BY s.path) AS rank
                 FROM sample s
                WHERE ${namesBoardSql}${kindFilter}
             ) s
            ORDER BY s.rank, s.kind LIMIT ?`,
        bareBoard,
        `${bareBoard}/%`,
        ...(kind ? [kind] : []),
        limit,
      );

    if (rows.length === 0) {
      return noResults(
        'samples or tests',
        query ?? String(board),
        query
          ? 'Try the subsystem name on its own ("bluetooth", "sensor", "usb"), or drop the board filter.'
          : 'No indexed sample or test names this board. Try the bare board name without a qualifier, or search by subsystem instead.',
      );
    }

    // A board target may be qualified (`board/soc/cpucluster`); upstream metadata
    // records either form, so match a bare board against both.
    const namesBoard = (platforms: string[]) =>
      bareBoard !== undefined &&
      platforms.some((p) => p === bareBoard || p.startsWith(`${bareBoard}/`));

    const results = rows.map((r) => {
      const integrationPlatforms = json<string[]>(r['integration_platforms'], []);
      const platformAllow = json<string[]>(r['platform_allow'], []);
      return {
        path: String(r['path']),
        name: String(r['name']),
        kind: String(r['kind']),
        description: String(r['description'] ?? ''),
        tags: json<string[]>(r['tags'], []),
        scenarios: json<string[]>(r['scenarios'], []),
        integrationPlatforms,
        platformAllow,
        files: json<string[]>(r['files'], []),
        // Why this row ranked where it did. Ranking already consults both kinds
        // of evidence; saying only "integration platforms" hid the allowlist
        // that put the row first.
        boardEvidence: board
          ? [
              namesBoard(platformAllow) ? 'platform_allow' : '',
              namesBoard(integrationPlatforms) ? 'integration_platforms' : '',
            ].filter(Boolean)
          : [],
      };
    });

    const text = results
      .map((r) =>
        [
          `### ${r.name}${r.kind === 'test' ? ' _(upstream test suite)_' : ''}`,
          `\`${r.path}\``,
          r.description || '',
          r.tags.length > 0 ? `tags: ${r.tags.join(', ')}` : '',
          r.scenarios.length > 0 ? `twister scenarios: ${boundedList(r.scenarios, 4)}` : '',
          r.platformAllow.length > 0
            ? `platform_allow: ${boundedList(r.platformAllow, 6)}`
            : '',
          r.integrationPlatforms.length > 0
            ? `integration_platforms: ${boundedList(r.integrationPlatforms, 6)}`
            : '',
          r.boardEvidence.length > 0 ? `names ${board} in: ${r.boardEvidence.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n');

    // How many exist, not merely how many fitted. "What does upstream run on
    // this board" is a counting question, and a truncated list that does not say
    // it was truncated answers it wrongly.
    const totals = bareBoard
      ? index()
        .all(
          `SELECT s.kind, COUNT(DISTINCT s.id) AS n FROM sample s
              WHERE EXISTS (
                SELECT 1 FROM sample_platform p
                 WHERE p.sample_id = s.id AND (p.platform = ? OR p.platform LIKE ?)
              )${kindFilter}
              GROUP BY s.kind`,
          bareBoard,
          `${bareBoard}/%`,
          ...(kind ? [kind] : []),
        )
        .map((r) => ({ kind: String(r['kind']), count: Number(r['n']) }))
      : [];
    const total = totals.reduce((sum, entry) => sum + entry.count, 0);

    const heading = bareBoard
      ? `\`${bareBoard}\` is named by ` +
        `${totals.map((t) => `${t.count} ${t.kind}${t.count === 1 ? '' : 's'}`).join(' and ')}` +
        `${total > results.length ? `; showing ${results.length}. Raise "limit" or pass "kind" for the rest.` : '.'}`
      : `Found ${results.length} sample(s) or test suite(s) for "${String(query)}".`;

    return result(
      `${heading}\n\n${text}\n\n` +
        'Use get_sample with a path to read its prj.conf, overlays, and source.',
      {
        query: query ?? null,
        board: board ?? null,
        kind: kind ?? null,
        count: results.length,
        totalsByKind: totals,
        results,
      },
    );
  },
});

export const getSample: ToolFactory = (index) => ({
  name: 'get_sample',
  title: 'Read a Zephyr sample',
  description:
    'Read a sample application or an upstream Twister test suite: its description, the Twister ' +
    'platforms recorded for it, scenario names, and the contents of its prj.conf, devicetree ' +
    'overlays, CMakeLists.txt, and C sources. Use this to copy a working configuration instead of ' +
    'deriving one. The Kconfig and devicetree changes a subsystem needs are seldom documented in ' +
    'one place. It also shows what upstream tests on a given board. The index stores the small ' +
    'files under its size policy, not every file in the directory.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Sample directory path, e.g. "samples/basic/blinky".',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Optional: only these files, relative to the sample directory (e.g. ["prj.conf"]). ' +
          'Defaults to configuration files plus sources.',
      },
      max_chars: {
        type: 'integer',
        minimum: 1000,
        maximum: 80000,
        default: 20000,
        description: 'Truncate the combined file contents at roughly this many characters.',
      },
    },
    required: ['path'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const path = requireString(args, 'path').replace(/\/+$/, '');
    const wanted = Array.isArray(args['files'])
      ? (args['files'] as unknown[]).filter((f): f is string => typeof f === 'string')
      : null;
    const maxChars = clampLimit(args['max_chars'], 20000, 80000);
    const idx = index();

    let row = idx.get(
      `SELECT id, path, kind, name, description, tags, scenarios, depends_on,
              integration_platforms, platform_allow, files, doc_path
         FROM sample WHERE path = ?`,
      path,
    );
    if (!row) {
      const escaped = path.replace(/[\\%_]/g, '\\$&');
      const candidates = idx.all(
        `SELECT id, path, kind, name, description, tags, scenarios, depends_on,
                integration_platforms, platform_allow, files, doc_path
           FROM sample WHERE path LIKE ? ESCAPE '\\' ORDER BY LENGTH(path), path LIMIT 12`,
        `%/${escaped}`,
      );
      if (candidates.length > 1) {
        throw new ToolError(
          `Sample path "${path}" is ambiguous. Use one exact path:\n` +
            candidates.map((candidate) => `- ${String(candidate['path'])}`).join('\n'),
        );
      }
      row = candidates[0];
    }

    if (!row) {
      return catalogueMiss(
        'Sample',
        path,
        idx.meta['zephyr_version'] ?? 'unknown',
        [],
        'Module-local samples and samples outside this index\'s declared roots may not be covered. Use search_samples to find an indexed path.',
      );
    }

    const sampleId = Number(row['id']);
    const stored = idx.all(
      'SELECT path, text FROM sample_file WHERE sample_id = ? ORDER BY path',
      sampleId,
    );

    // prj.conf and overlays first: they are what a caller almost always wants.
    const priority = (p: string) =>
      /^prj.*\.conf$/.test(p) ? 0 : p.startsWith('boards/') ? 1 : p.startsWith('src/') ? 3 : 2;
    const selected = stored
      .filter((f) => !wanted || wanted.includes(String(f['path'])))
      .sort((a, b) => priority(String(a['path'])) - priority(String(b['path'])));

    let rendered = '';
    let truncated = false;
    const included: string[] = [];
    for (const file of selected) {
      const p = String(file['path']);
      const block = `#### \`${p}\`\n\`\`\`${fenceLang(p)}\n${String(file['text']).trimEnd()}\n\`\`\`\n\n`;
      if (rendered.length + block.length > maxChars) {
        truncated = true;
        continue;
      }
      rendered += block;
      included.push(p);
    }

    const integration = json<string[]>(row['integration_platforms'], []);
    const allow = json<string[]>(row['platform_allow'], []);
    const tags = json<string[]>(row['tags'], []);
    const scenarios = json<string[]>(row['scenarios'], []);
    const dependsOn = json<string[]>(row['depends_on'], []);
    const allFiles = json<string[]>(row['files'], []);
    const kind = String(row['kind'] ?? 'sample');

    const text = joinSections([
      `# ${String(row['name'])}${kind === 'test' ? ' _(upstream test suite)_' : ''}`,
      row['description'] ? String(row['description']) : undefined,
      `\`${String(row['path'])}\``,
      section('Tags', tags),
      scenarios.length > 0
        ? `**Twister scenarios** — pass one to \`twister -s\`: ${boundedList(scenarios, 20)}`
        : undefined,
      section('Requires board support for', dependsOn),
      // Both lists, always, labelled by what they mean. They are different
      // claims: a board must appear in platform_allow to be built at all, while
      // integration_platforms is the smaller set upstream CI actually runs.
      // Rendering only the second one made "not in CI" read as "not supported".
      allow.length > 0
        ? '**Twister platform allowlist** — a board must appear here to build this at all: ' +
          boundedList(allow, 30)
        : undefined,
      integration.length > 0
        ? '**Twister integration platforms** — the smaller set upstream CI runs: ' +
          boundedList(integration, 30)
        : undefined,
      kind === 'test'
        ? `**Run it:**\n\`\`\`bash\nwest twister -T ${String(row['path'])} -p <board-target>\n\`\`\``
        : `**Build it:**\n\`\`\`bash\nwest build -b <board-target> ${String(row['path'])}\n\`\`\``,
      rendered ? `## Files\n\n${rendered.trimEnd()}` : '_No file contents stored for this sample._',
      truncated
        ? `_Some files omitted to stay within ${maxChars} characters. All files: ${allFiles.join(', ')}. Request specific ones with the "files" argument._`
        : undefined,
    ]);

    return result(text, {
      path: row['path'],
      found: true,
      kind,
      name: row['name'],
      description: row['description'] ?? '',
      tags,
      scenarios,
      dependsOn,
      integrationPlatforms: integration,
      platformAllow: allow,
      filesIncluded: included,
      filesAvailable: allFiles,
      truncated,
    });
  },
});
