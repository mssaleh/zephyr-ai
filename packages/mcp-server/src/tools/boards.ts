import { type Index, clampLimit, json } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  type ToolFactory,
  boundedList,
  catalogueMiss,
  editDistance,
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

interface NearTwin {
  name: string;
  fullName: string;
  soc: string;
  ram: number | null;
  flash: number | null;
  differs: string[];
}

/**
 * The part-code-shaped tokens in a board's marketing name.
 *
 * A vendor writes the orderable code into `full_name` — "Disco L475 IOT01
 * (B-L475E-IOT01A)", "B-L4S5I-IOT01A Discovery kit" — in whatever position it
 * likes, so the code is found by shape rather than by position. Requiring both a
 * digit and a letter rejects prose ("Discovery", "kit", "V2") without needing a
 * per-vendor rule.
 */
function partCodes(fullName: string): string[] {
  return [
    ...new Set(
      fullName
        .split(/[\s()[\],/]+/)
        .map((token) => token.replace(/[.,;:]+$/, '').toUpperCase())
        .filter((token) => token.length >= 6 && /\d/.test(token) && /[A-Z]/.test(token)),
    ),
  ];
}

/**
 * Boards that are easy to mistake for this one, and the figures that separate
 * them.
 *
 * Two boards can share a PCB reference and a series and still differ on flash,
 * RAM, and which bus the external memory sits on — a confusion no amount of
 * document cross-checking catches, because the documents look alike too. The
 * rule is the near-miss discipline the write validator already uses for
 * compatibles: a genuine twin is one or two characters away, an unrelated board
 * is many. Requiring the same vendor and the same SoC series does the rest, so
 * no curated list of confusable products is needed and every vendor gets the
 * same treatment.
 */
function nearTwins(
  idx: Index,
  name: string,
  fullName: string,
  socs: Soc[],
  ownRam: number | null,
  ownFlash: number | null,
): NearTwin[] {
  const codes = partCodes(fullName);
  if (codes.length === 0 || socs.length === 0) return [];

  const candidates = idx.all(
    `SELECT DISTINCT b.name, b.full_name, b.ram, b.flash, s.name AS soc
       FROM board b, json_each(b.socs) j
       JOIN soc s ON s.name = json_extract(j.value, '$.name')
      WHERE b.name <> ?
        AND b.vendor = (SELECT vendor FROM board WHERE name = ?)
        AND s.series IN (
          SELECT series FROM soc WHERE name IN (
            SELECT json_extract(value, '$.name') FROM json_each((SELECT socs FROM board WHERE name = ?))
          )
        )`,
    name,
    name,
    name,
  );

  const twins: NearTwin[] = [];
  for (const candidate of candidates) {
    const candidateFull = String(candidate['full_name'] ?? '');
    let best: number | null = null;
    for (const mine of codes) {
      for (const theirs of partCodes(candidateFull)) {
        if (Math.abs(mine.length - theirs.length) > 2) continue;
        const edits = editDistance(mine, theirs);
        if (edits === 0 || edits > 2) continue;
        // One character apart is the confusion case whatever the code's length —
        // a ratio floor would drop NUCLEO-F401RE against NUCLEO-F411RE, which
        // differ in RAM. The floor only earns its place on the second edit,
        // where it keeps unrelated parts in the same series apart.
        if (edits > 1 && 1 - edits / Math.max(mine.length, theirs.length) < 0.85) continue;
        if (best === null || edits < best) best = edits;
      }
    }
    if (best === null) continue;

    const ram = candidate['ram'] === null ? null : Number(candidate['ram']);
    const flash = candidate['flash'] === null ? null : Number(candidate['flash']);
    const soc = String(candidate['soc']);
    twins.push({
      name: String(candidate['name']),
      fullName: candidateFull,
      soc,
      ram,
      flash,
      // Name what actually differs, so the answer can be checked against a probe
      // rather than against a datasheet that describes the other board.
      differs: [
        socs.some((s) => s.name === soc) ? '' : `SoC ${soc}`,
        ram !== null && ram !== ownRam ? `${ram} KB RAM` : '',
        flash !== null && flash !== ownFlash ? `${flash} KB flash` : '',
      ].filter(Boolean),
    });
  }
  return twins.sort((a, b) => a.name.localeCompare(b.name));
}

interface BoardRunner {
  runner: string;
  available: boolean;
  flashDefault: boolean;
  debugDefault: boolean;
  args: { value: string; guard?: string; unresolved: boolean }[];
  declaredIn: string[];
}

function boardRunners(idx: Index, boardName: string): BoardRunner[] {
  return idx
    .all(
      `SELECT r.runner, r.available, r.flash_default, r.debug_default, r.args, r.declared_in
         FROM board_runner r JOIN board b ON b.id = r.board_id
        WHERE b.name = ? ORDER BY r.runner`,
      boardName,
    )
    .map((row) => ({
      runner: String(row['runner']),
      available: Number(row['available']) === 1,
      flashDefault: Number(row['flash_default']) === 1,
      debugDefault: Number(row['debug_default']) === 1,
      args: json<BoardRunner['args']>(row['args'], []),
      declaredIn: json<string[]>(row['declared_in'], []),
    }));
}

/**
 * The flashing and debugging section of a board answer.
 *
 * Two facts here are routinely got wrong from prose. `west flash` and `west
 * debug` can select different runners on the same board — every Espressif board
 * flashes with `esp32` and debugs with `openocd` — and a runner can be named as a
 * default without ever being registered, in which case the command fails. Both
 * come straight from the board's own CMake.
 */
function flashingSection(runners: BoardRunner[], boardName: string): string | undefined {
  if (runners.length === 0) {
    return (
      '**Flashing and debugging**\n' +
      'This board declares no runner in its `board.cmake`. That is what the tree says, not ' +
      'proof that the board cannot be programmed — emulated targets run with ' +
      '`west build -t run`, and some boards are programmed by vendor tooling outside west.'
    );
  }

  const registered = runners.filter((r) => r.available);
  const flash = runners.find((r) => r.flashDefault);
  const debug = runners.find((r) => r.debugDefault);

  const lines = runners.map((r) => {
    const roles = [
      r.flashDefault ? '`west flash` default' : '',
      r.debugDefault ? '`west debug` default' : '',
    ].filter(Boolean);
    const conditional = r.args.filter((a) => a.guard).length;
    const detail = [
      roles.join(', '),
      r.available ? '' : 'declared but never registered — this command will fail',
      r.args.length > 0 ? `${r.args.length} preset argument(s)` : '',
      conditional > 0 ? `${conditional} of them conditional on Kconfig` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    return `\`${r.runner}\`${detail ? ` — ${detail}` : ''}`;
  });

  const commands = [
    flash?.available ? `\`west flash\` uses \`${flash.runner}\`` : '',
    debug?.available ? `\`west debug\` uses \`${debug.runner}\`` : '',
  ].filter(Boolean);

  // A count of preset arguments is not something a reader can act on. The
  // unconditional ones for the two defaults are short and are what the command
  // actually passes, so they are shown; conditional and unexpanded ones are left
  // to `west flash --context` against a configured build, which resolves them.
  const presets = [flash, debug]
    .filter((runner, position, all): runner is BoardRunner =>
      Boolean(runner?.available) && all.indexOf(runner) === position,
    )
    .flatMap((runner) => {
      // All or nothing. The list is a flat argument vector, so a flag and its value
      // are separate entries; dropping one because it holds an unexpanded ${...}
      // leaves the other reading as a complete argument. `--cmd-load` shown without
      // the command it loads is worse than showing nothing.
      if (runner.args.length === 0) return [];
      if (runner.args.some((arg) => arg.guard || arg.unresolved)) return [];
      return [`\`${runner.runner}\`: ${runner.args.map((arg) => `\`${arg.value}\``).join(' ')}`];
    });

  return joinSections([
    section(`Flashing and debugging \`${boardName}\``, lines),
    commands.length > 0 ? commands.join('; ') + '.' : undefined,
    presets.length > 0
      ? section('Arguments the board always passes', presets) +
        '\n\nConditional and build-time-expanded arguments are not shown; ' +
        '`west flash --context` resolves them against a configured build.'
      : undefined,
    registered.length > 1
      ? `Select another with \`west flash -r <runner>\`. Call get_runner for what each accepts.`
      : undefined,
    debug && !debug.available
      ? `\`${debug.runner}\` is set as the debug default but is not registered for this board, ` +
        'so `west debug` has no runner to use.'
      : undefined,
  ]);
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
      runner: {
        type: 'string',
        description:
          'Require that the board registers this flash/debug runner, e.g. "pyocd", "jlink". ' +
          'Use when the probe on the desk decides which board is worth considering.',
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
    const runner = optionalString(args, 'runner');
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
    if (runner) {
      // Registered, not merely declared: a board that names a runner it never
      // finalises cannot be flashed with it.
      filters.push(
        'AND EXISTS (SELECT 1 FROM board_runner br WHERE br.board_id = b.id AND br.runner = ? AND br.available = 1)',
      );
      params.push(runner);
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
    'board, and to confirm which peripherals are actually wired up. It also names the boards ' +
    'this one is easy to mistake for — products that share a PCB reference and a SoC series but ' +
    'differ on flash, RAM, or SoC — so a board chosen from a document can be checked against ' +
    'the silicon before a build targets the wrong twin.',
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
    const ram = row['ram'] === null ? null : Number(row['ram']);
    const flash = row['flash'] === null ? null : Number(row['flash']);
    const docPath = row['doc_path'] as string | null;

    // The soc table carries the series and family that place a part in its
    // range; without them a board answer names a SoC that cannot be checked
    // against anything.
    const socDetail = socs.map((s) => {
      const identity = idx.get('SELECT series, family, vendor FROM soc WHERE name = ?', s.name);
      return {
        ...s,
        series: identity ? String(identity['series'] ?? '') : '',
        family: identity ? String(identity['family'] ?? '') : '',
      };
    });

    const twins = nearTwins(idx, name, String(row['full_name'] ?? ''), socs, ram, flash);
    const runners = boardRunners(idx, name);
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
        `${row['arch'] ? `, ${String(row['arch'])} architecture` : ''}` +
        // The figures that distinguish one board from a near-identical one, on
        // the board itself rather than only on targets that happen to carry
        // Twister metadata.
        `${flash !== null ? `, ${flash} KB flash` : ''}` +
        `${ram !== null ? `, ${ram} KB RAM` : ''}.`,
      section('Build targets (use with `west build -b`)', targetLines),
      section(
        'SoCs',
        socDetail.map(
          (s) =>
            `\`${s.name}\`` +
            (s.series ? ` — series \`${s.series}\`` : '') +
            (s.family ? `, family \`${s.family}\`` : '') +
            (s.variants.length ? ` — variants: ${s.variants.join(', ')}` : '') +
            (s.cpuclusters.length ? ` — CPU clusters: ${s.cpuclusters.join(', ')}` : ''),
        ),
      ),
      twins.length > 0
        ? section(
            'Easily confused with',
            twins
              .slice(0, 8)
              .map(
                (t) =>
                  `\`${t.name}\` (${t.fullName})` +
                  (t.differs.length > 0
                    ? ` — differs: ${t.differs.join(', ')}`
                    : ' — same SoC, flash and RAM; check the peripheral list'),
              ),
          ) +
          (twins.length > 8 ? `\n- …and ${twins.length - 8} more in the same series` : '') +
          '\n\nThese share a marketing name and a SoC series. Confirm the target against ' +
          'the silicon rather than against a document — the documents look alike too.'
        : undefined,
      flashingSection(runners, name),
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
      ram,
      flash,
      dir: row['dir'],
      targets,
      socs: socDetail,
      runners,
      nearTwins: twins,
      revisions,
      defaultRevision: row['default_revision'] ?? null,
      supported,
      docPath,
      docUrl,
    });
  },
});
