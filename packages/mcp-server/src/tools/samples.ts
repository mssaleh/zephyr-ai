import { clampLimit, json } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
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
    'Find Zephyr sample applications by what they demonstrate. Samples are the highest-value ' +
    'reference material in the tree: each combines prj.conf, devicetree overlays, and source, ' +
    'with explicit Twister platform evidence where upstream records it. Adapting one is safer than ' +
    'assembling a configuration from prose. Search before writing a new application that uses an ' +
    'unfamiliar subsystem.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'What the sample should demonstrate, e.g. "ble peripheral", "lvgl display".',
      },
      board: {
        type: 'string',
        description: 'Rank samples with recorded integration or allowlist evidence for this board first.',
      },
      limit: limitSchema(10),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = requireString(args, 'query');
    const board = optionalString(args, 'board');
    const limit = clampLimit(args['limit'], 10);

    const bareBoard = board?.split('/')[0];
    const ranking = bareBoard
      ? `CASE WHEN EXISTS (
           SELECT 1 FROM sample_platform p
            WHERE p.sample_id = s.id AND (p.platform = ? OR p.platform LIKE ?)
         ) THEN 0 ELSE 1 END,`
      : '';
    const params: unknown[] = bareBoard ? [bareBoard, `${bareBoard}/%`] : [];

    const rows = index().search(
      `SELECT s.path, s.name, s.description, s.tags, s.integration_platforms, s.files
         FROM sample_fts f JOIN sample s ON s.id = f.rowid
        WHERE sample_fts MATCH ?
        ORDER BY ${ranking} bm25(sample_fts, 6.0, 4.0, 3.0, 2.0)
        LIMIT ?`,
      query,
      [...params, limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'samples',
        query,
        'Try the subsystem name on its own ("bluetooth", "sensor", "usb"), or drop the board filter.',
      );
    }

    const results = rows.map((r) => ({
      path: String(r['path']),
      name: String(r['name']),
      description: String(r['description'] ?? ''),
      tags: json<string[]>(r['tags'], []),
      integrationPlatforms: json<string[]>(r['integration_platforms'], []),
      files: json<string[]>(r['files'], []),
    }));

    const text = results
      .map((r) =>
        [
          `### ${r.name}`,
          `\`${r.path}\``,
          r.description || '',
          r.tags.length > 0 ? `tags: ${r.tags.join(', ')}` : '',
          r.integrationPlatforms.length > 0
            ? `recorded Twister integration platforms: ${r.integrationPlatforms.slice(0, 6).join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n');

    return result(
      `Found ${results.length} sample(s) for "${query}".\n\n${text}\n\n` +
        'Use get_sample with a path to read its prj.conf, overlays, and source.',
      { query, count: results.length, results },
    );
  },
});

export const getSample: ToolFactory = (index) => ({
  name: 'get_sample',
  title: 'Read a Zephyr sample',
  description:
    'Read a sample application: its description, recorded Twister platform evidence, and the ' +
    'contents of its prj.conf, devicetree overlays, CMakeLists.txt, and C sources. Use this to ' +
    'copy a working configuration rather than deriving one — the Kconfig and devicetree changes ' +
    'a subsystem needs are rarely all documented in one place. The index returns the small, ' +
    'high-value files retained under its explicit size policy.',
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
      `SELECT id, path, name, description, tags, depends_on, integration_platforms,
              platform_allow, files, doc_path
         FROM sample WHERE path = ?`,
      path,
    );
    if (!row) {
      const escaped = path.replace(/[\\%_]/g, '\\$&');
      const candidates = idx.all(
        `SELECT id, path, name, description, tags, depends_on, integration_platforms,
                platform_allow, files, doc_path
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
    const dependsOn = json<string[]>(row['depends_on'], []);
    const allFiles = json<string[]>(row['files'], []);

    const text = joinSections([
      `# ${String(row['name'])}`,
      row['description'] ? String(row['description']) : undefined,
      `\`${String(row['path'])}\``,
      section('Tags', tags),
      section('Requires board support for', dependsOn),
      integration.length > 0
        ? `**Twister integration platforms**: ${integration.map((p) => `\`${p}\``).join(', ')}`
        : allow.length > 0
          ? `**Twister platform allowlist**: ${allow.slice(0, 12).map((p) => `\`${p}\``).join(', ')}`
          : undefined,
      `**Build it:**\n\`\`\`bash\nwest build -b <board-target> ${String(row['path'])}\n\`\`\``,
      rendered ? `## Files\n\n${rendered.trimEnd()}` : '_No file contents stored for this sample._',
      truncated
        ? `_Some files omitted to stay within ${maxChars} characters. All files: ${allFiles.join(', ')}. Request specific ones with the "files" argument._`
        : undefined,
    ]);

    return result(text, {
      path: row['path'],
      found: true,
      name: row['name'],
      description: row['description'] ?? '',
      tags,
      dependsOn,
      integrationPlatforms: integration,
      platformAllow: allow,
      filesIncluded: included,
      filesAvailable: allFiles,
      truncated,
    });
  },
});
