import { clampLimit, snippet } from '../db.ts';
import {
  type ToolFactory,
  catalogueMiss,
  limitSchema,
  noResults,
  optionalString,
  requireString,
  result,
} from './common.ts';

export const searchDocs: ToolFactory = (index) => ({
  name: 'search_docs',
  title: 'Search Zephyr documentation',
  description:
    'Search the Zephyr documentation for the exact version in use, returning the individual ' +
    'sections that match rather than whole pages. Covers the kernel, subsystems, driver models, ' +
    'connectivity stacks, build system, and every board page (pinouts and flashing instructions). ' +
    'Use for concepts and procedures — "how do I use the sensor API", "power management states", ' +
    '"sysbuild". For a symbol, a compatible, or a board, the dedicated tools are more precise.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What you want to know about.' },
      area: {
        type: 'string',
        description:
          'Restrict to a documentation area: kernel, services, connectivity, hardware, build, ' +
          'develop, boards, contribute, security, safety, project, releases.',
      },
      limit: limitSchema(8, 25),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = requireString(args, 'query');
    const area = optionalString(args, 'area');
    const limit = clampLimit(args['limit'], 8, 25);

    const filters: string[] = [];
    const params: unknown[] = [];
    if (area) {
      filters.push('AND d.area = ?');
      params.push(area);
    }

    const rows = index().search(
      `SELECT d.path, d.url, d.title, d.area, c.heading, c.heading_path, c.anchor, c.body
         FROM doc_fts f
         JOIN doc_chunk c ON c.id = f.rowid
         JOIN doc d ON d.id = c.doc_id
        WHERE doc_fts MATCH ? ${filters.join(' ')}
        ORDER BY bm25(doc_fts, 8.0, 4.0, 1.0)
        LIMIT ?`,
      query,
      [...params, limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'documentation sections',
        query,
        'Try fewer or more general words. For configuration options use search_kconfig, for ' +
          'devicetree use search_bindings, and for C functions use search_api.',
      );
    }

    const results = rows.map((r) => ({
      title: String(r['title']),
      heading: String(r['heading'] ?? ''),
      headingPath: String(r['heading_path'] ?? ''),
      path: String(r['path']),
      anchor: (r['anchor'] as string) ?? null,
      area: String(r['area']),
      url: String(r['url']) + (r['anchor'] ? `#${String(r['anchor'])}` : ''),
      excerpt: snippet(String(r['body'] ?? ''), 700),
    }));

    const text = results
      .map(
        (r) =>
          `### ${r.headingPath || r.title}\n_${r.area} · \`${r.path}\`${r.anchor ? ` · anchor \`${r.anchor}\`` : ''}_\n\n${r.excerpt}\n\n${r.url}`,
      )
      .join('\n\n---\n\n');

    return result(
      `${results.length} section(s) matching "${query}".\n\n${text}\n\n` +
        'Use get_doc with a path to read a full page.',
      { query, count: results.length, results },
    );
  },
});

export const getDoc: ToolFactory = (index) => ({
  name: 'get_doc',
  title: 'Read a documentation page',
  description:
    'Read a Zephyr documentation page in full, or a single section of it. Take the path from a ' +
    'search_docs result or from get_board (board pages carry the pinout and the flashing ' +
    'procedure for that hardware). Long pages are returned section by section unless a section ' +
    'is named.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description:
          'Source path of the page, e.g. "doc/services/sensor/index.rst" or ' +
          '"boards/st/nucleo_h743zi/doc/index.rst".',
      },
      section: {
        type: 'string',
        description:
          'Optional: return only this section, matched against its heading or anchor label.',
      },
      max_chars: {
        type: 'integer',
        minimum: 1000,
        maximum: 60000,
        default: 18000,
        description: 'Truncate the page at roughly this many characters.',
      },
    },
    required: ['path'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const path = requireString(args, 'path');
    const wanted = optionalString(args, 'section');
    const maxChars = clampLimit(args['max_chars'], 18000, 60000);
    const idx = index();

    // Accept a bare path, a published URL, or a path missing the .rst suffix.
    const candidates = [path, path.replace(/\.html?(#.*)?$/, '.rst'), `${path}.rst`, `doc/${path}`];
    let page = undefined;
    for (const candidate of candidates) {
      page = idx.get('SELECT id, path, url, title, area FROM doc WHERE path = ?', candidate);
      if (page) break;
    }
    if (!page) {
      page = idx.get('SELECT id, path, url, title, area FROM doc WHERE path LIKE ?', `%${path}%`);
    }

    if (!page) {
      return catalogueMiss(
        'Documentation page',
        path,
        idx.meta['zephyr_version'] ?? 'unknown',
        [],
        'Module documentation and pages excluded by this index\'s coverage report may not be covered. Use search_docs to find an indexed path.',
      );
    }

    const chunks = idx.all(
      'SELECT heading, heading_path, anchor, body FROM doc_chunk WHERE doc_id = ? ORDER BY ord',
      Number(page['id']),
    );

    const selected = wanted
      ? chunks.filter(
          (c) =>
            String(c['heading'] ?? '').toLowerCase().includes(wanted.toLowerCase()) ||
            String(c['anchor'] ?? '').toLowerCase() === wanted.toLowerCase(),
        )
      : chunks;

    if (selected.length === 0) {
      return result(
        `Page \`${String(page['path'])}\` has no section matching "${wanted}".\n\nSections:\n` +
          chunks.map((c) => `- ${String(c['heading'])}`).join('\n'),
        { path: page['path'], found: true, sectionFound: false },
      );
    }

    let body = '';
    let truncated = false;
    for (const chunk of selected) {
      const part = `## ${String(chunk['heading'])}\n\n${String(chunk['body'] ?? '')}\n\n`;
      if (body.length + part.length > maxChars) {
        truncated = true;
        break;
      }
      body += part;
    }

    const header = `# ${String(page['title'])}\n\n_${String(page['area'])} · \`${String(page['path'])}\` · ${String(page['url'])}_\n\n`;
    const footer = truncated
      ? `\n\n_Truncated at ${maxChars} characters. Remaining sections: ${selected
          .slice(body.split('## ').length - 1)
          .map((c) => String(c['heading']))
          .join(', ')}. Request one with the "section" argument._`
      : '';

    return result(header + body.trimEnd() + footer, {
      path: page['path'],
      url: page['url'],
      title: page['title'],
      found: true,
      sections: selected.map((c) => String(c['heading'])),
      truncated,
    });
  },
});
