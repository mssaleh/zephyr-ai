import { clampLimit, json } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
  catalogueMiss,
  joinSections,
  limitSchema,
  noResults,
  optionalString,
  requireString,
  result,
  section,
} from './common.ts';

interface Target {
  identifier: string;
  name?: string;
  arch?: string;
  ram?: number;
  flash?: number;
  toolchains: string[];
  supported: string[];
}

interface Soc {
  name: string;
  variants: string[];
  cpuclusters: string[];
}

export const searchBoards: ToolFactory = (index) => ({
  name: 'search_boards',
  title: 'Search boards',
  description:
    'Find Zephyr boards by name, vendor, SoC, or supported peripheral. Returns the qualified ' +
    'board target identifier that `west build -b` expects — which is frequently not the bare ' +
    'board name: the ESP32-S3 DevKitC builds as `esp32s3_devkitc/esp32s3/procpu`, and using ' +
    '`esp32s3_devkitc` alone fails. Also use this to check whether a board supports a peripheral ' +
    'before designing around it.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Board name, product name, SoC, or vendor, e.g. "nucleo h743" or "esp32s3".',
      },
      vendor: { type: 'string', description: 'Restrict to a vendor, e.g. "st", "espressif".' },
      arch: { type: 'string', description: 'Restrict to an architecture: arm, xtensa, riscv, ...' },
      feature: {
        type: 'string',
        description:
          'Require support for a peripheral tag, e.g. "can", "netif:wifi", "usb_device", "adc".',
      },
      limit: limitSchema(15),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = requireString(args, 'query');
    const vendor = optionalString(args, 'vendor');
    const arch = optionalString(args, 'arch');
    const feature = optionalString(args, 'feature');
    const limit = clampLimit(args['limit'], 15);

    const filters: string[] = [];
    const params: unknown[] = [];
    if (vendor) {
      filters.push('AND b.vendor = ?');
      params.push(vendor);
    }
    if (arch) {
      filters.push('AND b.arch = ?');
      params.push(arch);
    }
    if (feature) {
      // supported_text is a space-joined tag list; pad both sides for a whole-tag match.
      filters.push("AND (' ' || b.supported_text || ' ') LIKE ?");
      params.push(`% ${feature} %`);
    }

    const rows = index().search(
      `SELECT b.name, b.full_name, b.vendor, b.arch, b.ram, b.flash,
              b.targets_text, b.socs_text, b.supported_text, b.doc_path
         FROM board_fts f JOIN board b ON b.id = f.rowid
        WHERE board_fts MATCH ? ${filters.join(' ')}
        ORDER BY bm25(board_fts, 10.0, 6.0, 2.0, 4.0, 1.0, 3.0)
        LIMIT ?`,
      query,
      [...params, limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'boards',
        query,
        'Try the vendor name, the SoC part number, or a shorter fragment. Boards from ' +
          'out-of-tree HAL modules are not in this index.',
      );
    }

    const results = rows.map((r) => ({
      name: String(r['name']),
      fullName: String(r['full_name'] ?? ''),
      vendor: String(r['vendor'] ?? ''),
      arch: (r['arch'] as string) ?? null,
      targets: String(r['targets_text'] ?? '').split(' ').filter(Boolean),
      socs: String(r['socs_text'] ?? '').split(' ').filter(Boolean),
      supported: String(r['supported_text'] ?? '').split(' ').filter(Boolean),
      ramKb: (r['ram'] as number) ?? null,
      flashKb: (r['flash'] as number) ?? null,
    }));

    const text = results
      .map((r) => {
        const targets = r.targets.length > 0 ? r.targets : [r.name];
        const mem = [
          r.flashKb ? `${r.flashKb} KB flash` : '',
          r.ramKb ? `${r.ramKb} KB RAM` : '',
        ]
          .filter(Boolean)
          .join(', ');
        return [
          `### ${r.fullName || r.name}`,
          `**Build targets:** ${targets.map((t) => `\`${t}\``).join(' , ')}`,
          `vendor: ${r.vendor}${r.arch ? ` · arch: ${r.arch}` : ''}${r.socs.length ? ` · SoC: ${r.socs.join(', ')}` : ''}${mem ? ` · ${mem}` : ''}`,
          r.supported.length > 0 ? `supports: ${r.supported.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');

    return result(
      `Found ${results.length} board(s) for "${query}".\n\n${text}\n\n` +
        'Pass a build target to `west build -b <target>`. Use get_board for pin and flashing detail.',
      { query, count: results.length, results },
    );
  },
});

export const getBoard: ToolFactory = (index) => ({
  name: 'get_board',
  title: 'Get a board',
  description:
    'Get everything the index knows about one Zephyr board: every qualified build target with ' +
    'its architecture, flash and RAM budget and supported peripherals, the SoCs and CPU clusters ' +
    'it contains, available hardware revisions, and a link to its documentation page (pinout, ' +
    'jumper settings, and flashing instructions). Use before starting a project for a specific ' +
    'board, and to confirm which peripherals are actually wired up.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Board name (e.g. "nucleo_h743zi"). A qualified target is also accepted.',
      },
      board: {
        type: 'string',
        description: 'Alias for name, accepted because it matches the get_board tool name.',
      },
    },
    anyOf: [{ required: ['name'] }, { required: ['board'] }],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    // A qualified target (board/soc/cluster) reduces to the board name.
    const requestedName = optionalString(args, 'name');
    const requestedBoard = optionalString(args, 'board');
    if (requestedName && requestedBoard && requestedName !== requestedBoard) {
      throw new ToolError('The "name" and "board" arguments must match when both are supplied.');
    }
    const requested = requestedName ?? requestedBoard;
    if (!requested) {
      throw new ToolError('The "name" argument (or its "board" alias) is required.');
    }
    const name = requested.split('/')[0]!.split('@')[0]!.trim();
    const idx = index();

    const row = idx.get(
      `SELECT name, full_name, vendor, dir, arch, ram, flash, socs, targets,
              revisions, default_revision, supported, doc_path
         FROM board WHERE name = ?`,
      name,
    );

    if (!row) {
      const near = idx.search(
        `SELECT b.name FROM board_fts f JOIN board b ON b.id = f.rowid
          WHERE board_fts MATCH ? ORDER BY bm25(board_fts) LIMIT 8`,
        name.replace(/[_/]/g, ' '),
        [],
        8,
      );
      return catalogueMiss(
        'Board',
        name,
        idx.meta['zephyr_version'] ?? 'unknown',
        near.map((r) => String(r['name'])),
        'Boards supplied by external modules or workspace-specific hardware roots may not be covered.',
      );
    }

    const targets = json<Target[]>(row['targets'], []);
    const socs = json<Soc[]>(row['socs'], []);
    const revisions = json<string[]>(row['revisions'], []);
    const supported = json<string[]>(row['supported'], []);
    const docPath = row['doc_path'] as string | null;
    const docUrl = docPath
      ? `${(idx.meta['doc_base_url'] ?? '').replace(/\/?$/, '/')}${docPath.replace(/\.rst$/, '.html')}`
      : null;

    const targetLines = targets.map((t) => {
      const mem = [t.flash ? `${t.flash} KB flash` : '', t.ram ? `${t.ram} KB RAM` : '']
        .filter(Boolean)
        .join(', ');
      const detail = [t.arch, mem, t.toolchains.length ? `toolchains: ${t.toolchains.join(', ')}` : '']
        .filter(Boolean)
        .join(' · ');
      return `\`${t.identifier}\`${detail ? ` — ${detail}` : ''}`;
    });

    const text = joinSections([
      `# ${String(row['full_name'] || row['name'])}`,
      `Board \`${String(row['name'])}\` from **${String(row['vendor'] ?? 'unknown')}**` +
        `${row['arch'] ? `, ${String(row['arch'])} architecture` : ''}.`,
      section('Build targets (use with `west build -b`)', targetLines),
      section(
        'SoCs',
        socs.map(
          (s) =>
            `\`${s.name}\`` +
            (s.variants.length ? ` — variants: ${s.variants.join(', ')}` : '') +
            (s.cpuclusters.length ? ` — CPU clusters: ${s.cpuclusters.join(', ')}` : ''),
        ),
      ),
      supported.length > 0
        ? `**Supported peripherals** (${supported.length})\n${supported.map((s) => `\`${s}\``).join(' · ')}`
        : undefined,
      revisions.length > 0
        ? `**Hardware revisions**: ${revisions.map((r) => `\`${r}\``).join(', ')}` +
          (row['default_revision'] ? ` (default \`${String(row['default_revision'])}\`)` : '') +
          '\nSelect one with `west build -b ' + name + '@<revision>`.'
        : undefined,
      docUrl
        ? `**Documentation** (pinout, jumpers, flashing): ${docUrl}\nSource: \`${docPath}\` — read it with get_doc.`
        : undefined,
      `_Board directory: \`${String(row['dir'])}\`_`,
    ]);

    return result(text, {
      name: String(row['name']),
      found: true,
      fullName: row['full_name'] ?? '',
      vendor: row['vendor'] ?? '',
      arch: row['arch'] ?? null,
      dir: row['dir'],
      targets,
      socs,
      revisions,
      defaultRevision: row['default_revision'] ?? null,
      supported,
      docPath,
      docUrl,
    });
  },
});
