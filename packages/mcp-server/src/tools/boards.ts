import { type Index, clampLimit, json } from '../db.ts';
import { byField } from '../../../shared/ordering.ts';
import { targetFileNames } from '../../../shared/build-string.ts';
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
  /** Why this board is confusable: the same silicon, or a near-miss name. */
  relation: 'same SoC' | 'similar name';
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
 * document cross-checking catches, because the documents look alike too.
 *
 * Two relations produce that confusion and only one of them is nominal.
 *
 * **Name.** A genuine twin is one or two characters away, an unrelated board is
 * many — the near-miss discipline the write validator uses for compatibles.
 * `NUCLEO-F401RE` and `NUCLEO-F411RE` differ by one character and by their RAM.
 *
 * **Silicon.** Two boards carrying the *same* SoC are confusable no matter what
 * they are called, and vendor naming hides this more often than it reveals it:
 * `nucleo_n657x0_q` and `stm32n6570_dk` are both `stm32n657xx` and share not one
 * near-miss token, yet they differ on the external flash part, the `--extload`
 * file, the download address, the target count, and the declared RAM — every one
 * a thing that breaks a build. A name-only rule links the first pair and misses
 * the second, which is the pair where the mistake actually costs hardware time.
 *
 * Which relation fired is part of the answer: "shares this board's SoC" and
 * "has a name one character away" are different reasons to look twice.
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
  if (socs.length === 0) return [];
  const ownSocs = new Set(socs.map((soc) => soc.name));

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
    const soc = String(candidate['soc']);
    const sameSilicon = ownSocs.has(soc);

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
    if (best === null && !sameSilicon) continue;

    const ram = candidate['ram'] === null ? null : Number(candidate['ram']);
    const flash = candidate['flash'] === null ? null : Number(candidate['flash']);
    twins.push({
      name: String(candidate['name']),
      fullName: candidateFull,
      soc,
      ram,
      flash,
      relation: sameSilicon ? 'same SoC' : 'similar name',
      // Name what actually differs, so the answer can be checked against a probe
      // rather than against a datasheet that describes the other board.
      differs: [
        sameSilicon ? '' : `SoC ${soc}`,
        ram !== null && ram !== ownRam ? `${ram} KB RAM` : '',
        flash !== null && flash !== ownFlash ? `${flash} KB flash` : '',
      ].filter(Boolean),
    });
  }
  // Same-silicon first: a board that runs the same part is the one whose runner
  // arguments and memory layout will be copied by mistake.
  return twins.sort(
    byField((twin) => `${twin.relation === 'same SoC' ? '0' : '1'} ${twin.name}`),
  );
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
    // The default is chosen for correctness, never for how long a cycle takes.
    // Where getting an image onto the board costs a physical action — a strap
    // moved, a button held, a power cycle — the runner that costs the fewest is
    // worth finding *before* settling into a rhythm, because the rhythm is what
    // stops the question being asked. A project can pay every cycle at many
    // times its necessary price with the alternative sitting in the board's own
    // files. These are the alternatives this board actually declares.
    registered.length > 1 || (debug?.available && flash?.available && debug.runner !== flash.runner)
      ? 'If loading an image onto this board requires a manual step such as moving a jumper or ' +
        'power-cycling, compare these runners before you start iterating. They differ in whether ' +
        'they program flash, load through the debug probe, or use a separate boot path, and ' +
        '`west debug` often loads without programming flash. Call get_runner for what each one ' +
        'accepts. The board documentation and `board.cmake` list alternate boot modes that are not ' +
        'runners.'
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
    'board target identifier that `west build -b` expects. That is often not the bare board ' +
    'name: the ESP32-S3 DevKitC builds as `esp32s3_devkitc/esp32s3/procpu`, and `esp32s3_devkitc` ' +
    'alone fails. Also use this to check whether a board supports a peripheral before designing ' +
    'around it.',
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
    'Get what the index holds about one Zephyr board: every qualified build target with its ' +
    'architecture, Twister flash and RAM figures and supported peripherals; the overlay and ' +
    '.conf filenames each target picks up; the SoCs and CPU clusters it contains; hardware ' +
    'revisions; the runners it registers and which one west flash and west debug select; and a ' +
    'link to its documentation page. Use before starting a project for a board, and to confirm ' +
    'which peripherals it exposes. It also lists boards this one is easy to confuse with, either ' +
    'because they carry the same SoC or because the names are close, with the figures that differ.',
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
              revisions, default_revision, supported, doc_path, no_xip_targets
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

    const noXip = new Set(json<string[]>(row['no_xip_targets'], []));

    // The filenames each target picks up, and the memory figures qualified by
    // what they actually describe. Both are answers to questions a developer
    // adding a build variant already has, and both were previously wrong in the
    // same direction: silently, and in a way that reads as fact.
    const targetLines = targets.map((t) => {
      const mem = [t.flash ? `${t.flash} KB flash` : '', t.ram ? `${t.ram} KB RAM` : '']
        .filter(Boolean)
        .join(', ');
      const detail = [t.arch, mem, t.toolchains.length ? `toolchains: ${t.toolchains.join(', ')}` : '']
        .filter(Boolean)
        .join(' · ');
      const names = targetFileNames(t.identifier);
      // The most qualified name is the one that is easy to get wrong: a file
      // named for the board alone applies to every target, so it is never the
      // one that goes missing.
      const overlay = names.overlay[names.overlay.length - 1] ?? '';
      const conf = names.conf[names.conf.length - 1] ?? '';
      return (
        `\`${t.identifier}\`${detail ? ` — ${detail}` : ''}` +
        (noXip.has(t.identifier) ? '\n  - `CONFIG_XIP=n` in this target\'s defconfig' : '') +
        (overlay ? `\n  - overlay: \`boards/${overlay}\`` : '') +
        (conf ? `\n  - conf:    \`boards/${conf}\`` : '')
      );
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
      // These figures come from `twister.yaml`, where they size a test runner's
      // expectations. Rendered bare they read as the application's memory
      // budget, and they are not: upstream's NUCLEO-N657X0-Q declares 1024 KB of
      // each while the application gets 511 KB of SRAM and no internal flash at
      // all. The `_defconfig` says which case a target is in.
      flash !== null || ram !== null
        ? '_Those figures come from `twister.yaml`. They are test metadata, not the memory the ' +
          'application gets.' +
          (noXip.size > 0
            ? ' Some targets on this board set `CONFIG_XIP=n`, so the image is not executed from an ' +
              'internal flash that the flash figure could describe. Use the devicetree partitions ' +
              'for the actual limit.'
            : '') +
          '_'
        : undefined,
      section('Build targets (use with `west build -b`)', targetLines),
      // A board overlay or `.conf` whose filename does not match the *qualified*
      // target is skipped in silence — nothing reports a file that matched
      // nothing, and the build fails much later as an undefined devicetree
      // symbol, which reads as a mistake in the C. Adding a build variant is
      // exactly when this bites, and it is exactly when this tool is called.
      targets.length > 0
        ? '_Zephyr selects board overlays and `.conf` fragments by building these filenames and ' +
          'testing whether the file exists, so a file named for the unqualified board does not apply ' +
          'to a qualified target. A file that matches nothing produces no warning. Check the ' +
          'configure output for `Found devicetree overlay:` and `Merged configuration`, and check it ' +
          'again after changing the target, not only after changing the file._'
        : undefined,
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
                  `\`${t.name}\` (${t.fullName}) — ${t.relation}` +
                  (t.differs.length > 0
                    ? `; differs: ${t.differs.join(', ')}`
                    : '; same flash and RAM figures — check the peripheral list, the external memory part, and the runner arguments'),
              ),
          ) +
          (twins.length > 8 ? `\n- …and ${twins.length - 8} more` : '') +
          '\n\nEach entry is listed either because it uses the same SoC or because its name is close ' +
          'to this one. Same-SoC boards are easy to miss, because vendor names do not show the ' +
          'relation. What differs between them is usually the external flash part, the loader file, ' +
          'the download address, and the memory figures, and each of those breaks a build. Check the ' +
          'target against the SoC rather than against a datasheet.'
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
