#!/usr/bin/env node
/**
 * Build the Zephyr knowledge index.
 *
 * Runs against any Zephyr tree — the pinned upstream checkout, or a user's own
 * west workspace. Indexing the user's actual tree is the point: firmware
 * projects pin a Zephyr version and carry vendor HAL modules with their own
 * bindings and Kconfig, and serving those removes version drift, which is the
 * largest single source of wrong firmware code.
 *
 * Usage:
 *   zephyr-ai-ingest [--zephyr <path>] [--out <path>] [--modules <path>...] [--quiet]
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { BUILD_FTS, DDL, SCHEMA_VERSION } from './schema.ts';
import { collectApi } from './sources/api.ts';
import { collectBindings } from './sources/bindings.ts';
import { collectBoards, collectSocs } from './sources/boards.ts';
import { collectDocs } from './sources/docs.ts';
import { collectKconfig } from './sources/kconfig.ts';
import { collectSamples } from './sources/samples.ts';
import { symbolsInExpr } from './parsers/kconfig.ts';

interface Options {
  zephyr: string;
  out: string;
  modules: string[];
  quiet: boolean;
}

function parseArgs(argv: string[]): Options {
  const repoRoot = resolve(process.cwd());
  const opts: Options = {
    zephyr: process.env['ZEPHYR_BASE'] ?? join(repoRoot, '.cache', 'zephyr'),
    out: join(repoRoot, 'index', 'zephyr.db'),
    modules: [],
    quiet: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--zephyr':
        opts.zephyr = resolve(argv[++i]!);
        break;
      case '--out':
        opts.out = resolve(argv[++i]!);
        break;
      case '--modules':
        opts.modules.push(resolve(argv[++i]!));
        break;
      case '--quiet':
      case '-q':
        opts.quiet = true;
        break;
      case '--help':
      case '-h':
        console.log(
          'Usage: zephyr-ai-ingest [--zephyr <path>] [--out <path>] [--modules <path>]... [--quiet]',
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  opts.zephyr = resolve(opts.zephyr);
  return opts;
}

/** Read `VERSION` from the tree being indexed rather than trusting the lockfile. */
function readTreeVersion(root: string): string {
  try {
    const text = readFileSync(join(root, 'VERSION'), 'utf8');
    const field = (name: string) => text.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
    const version = [field('VERSION_MAJOR'), field('VERSION_MINOR'), field('PATCHLEVEL')].join('.');
    const extra = field('EXTRAVERSION');
    return extra ? `${version}-${extra}` : version;
  } catch {
    return 'unknown';
  }
}

function readLock(): Record<string, string> {
  for (const candidate of [
    join(process.cwd(), 'zephyr.lock.json'),
    join(process.cwd(), '..', '..', 'zephyr.lock.json'),
  ]) {
    try {
      return JSON.parse(readFileSync(candidate, 'utf8')) as Record<string, string>;
    } catch {
      /* try the next candidate */
    }
  }
  return {};
}

function jsonOrNull(value: unknown): string | null {
  return value === undefined ? null : JSON.stringify(value);
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const log = (msg: string) => {
    if (!opts.quiet) process.stderr.write(`${msg}\n`);
  };

  if (!existsSync(join(opts.zephyr, 'VERSION'))) {
    throw new Error(
      `${opts.zephyr} does not look like a Zephyr tree (no VERSION file).\n` +
        `Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`,
    );
  }

  const lock = readLock();
  const version = readTreeVersion(opts.zephyr);
  const docBaseUrl = `https://docs.zephyrproject.org/${version}/`;

  log(`Indexing Zephyr ${version} from ${opts.zephyr}`);
  const started = Date.now();

  // ---------------------------------------------------------------- collect --
  const t0 = Date.now();
  const docs = collectDocs(opts.zephyr, docBaseUrl);
  const chunkCount = docs.reduce((n, d) => n + d.chunks.length, 0);
  log(`  docs      ${docs.length} pages, ${chunkCount} sections (${Date.now() - t0} ms)`);

  const t1 = Date.now();
  const kconfig = collectKconfig(opts.zephyr, opts.modules);
  log(
    `  kconfig   ${kconfig.symbols.length} symbols from ${kconfig.filesScanned} files (${Date.now() - t1} ms)`,
  );

  const t2 = Date.now();
  const bindingRoots = [
    join(opts.zephyr, 'dts', 'bindings'),
    ...opts.modules.map((m) => join(m, 'dts', 'bindings')).filter(existsSync),
  ];
  const { bindings, fragments } = collectBindings(bindingRoots);
  const propCount = bindings.reduce(
    (n, b) => n + b.properties.length + b.children.reduce((m, c) => m + c.properties.length, 0),
    0,
  );
  log(
    `  bindings  ${bindings.length} compatibles, ${propCount} properties, ${fragments} fragments (${Date.now() - t2} ms)`,
  );

  const t3 = Date.now();
  const boards = collectBoards(opts.zephyr);
  const socs = collectSocs(opts.zephyr);
  const targetCount = boards.reduce((n, b) => n + b.targets.length, 0);
  log(
    `  boards    ${boards.length} boards, ${targetCount} targets, ${socs.length} SoCs (${Date.now() - t3} ms)`,
  );

  const t4 = Date.now();
  const samples = collectSamples(opts.zephyr);
  log(`  samples   ${samples.length} (${Date.now() - t4} ms)`);

  const t5 = Date.now();
  const api = collectApi(opts.zephyr);
  log(
    `  api       ${api.symbols.length} symbols, ${api.groups.length} groups (${Date.now() - t5} ms)`,
  );

  // ------------------------------------------------------------------ write --
  mkdirSync(dirname(opts.out), { recursive: true });
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(`${opts.out}${suffix}`, { force: true });
  }

  const db = new DatabaseSync(opts.out);
  db.exec(DDL);

  const tWrite = Date.now();
  db.exec('BEGIN');

  // docs
  const insDoc = db.prepare(
    'INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)',
  );
  const insChunk = db.prepare(
    `INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const page of docs) {
    const info = insDoc.run(page.path, page.url, page.title, page.area, JSON.stringify(page.labels));
    const docId = Number(info.lastInsertRowid);
    for (const chunk of page.chunks) {
      insChunk.run(
        docId,
        chunk.anchor ?? null,
        chunk.heading,
        chunk.headingPath.join(' > '),
        chunk.ord,
        page.title,
        chunk.body,
      );
    }
  }

  // kconfig
  const insSym = db.prepare(
    `INSERT INTO kconfig
       (name, type, prompt, help, defaults, depends, selects, implies, ranges,
        defined_in, menu_path, is_choice, choice, n_defs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insEdge = db.prepare(
    'INSERT INTO kconfig_edge (from_sym, to_sym, kind) VALUES (?, ?, ?)',
  );
  for (const sym of kconfig.symbols) {
    insSym.run(
      sym.name,
      sym.type ?? null,
      sym.prompt ?? '',
      sym.help ?? '',
      JSON.stringify(sym.defaults),
      JSON.stringify(sym.depends),
      JSON.stringify(sym.selects),
      JSON.stringify(sym.implies),
      JSON.stringify(sym.ranges),
      JSON.stringify(sym.definedIn),
      sym.menuPath,
      sym.isChoice ? 1 : 0,
      sym.choice ?? null,
      sym.nDefs,
    );
    for (const sel of sym.selects) insEdge.run(sym.name, sel.value, 'select');
    for (const imp of sym.implies) insEdge.run(sym.name, imp.value, 'imply');
    for (const dep of sym.depends) {
      for (const target of symbolsInExpr(dep)) insEdge.run(sym.name, target, 'depends');
    }
  }

  // devicetree bindings
  const insBinding = db.prepare(
    `INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insProp = db.prepare(
    `INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  // Intern property descriptions; see the note on `text_pool` in schema.ts.
  const insText = db.prepare('INSERT INTO text_pool (text) VALUES (?)');
  const textIds = new Map<string, number>();
  const internText = (text: string | undefined): number | null => {
    if (!text) return null;
    const existing = textIds.get(text);
    if (existing !== undefined) return existing;
    const id = Number(insText.run(text).lastInsertRowid);
    textIds.set(text, id);
    return id;
  };
  for (const binding of bindings) {
    const compatible = binding.compatible!;
    const allProps = [
      ...binding.properties,
      ...binding.children.flatMap((c) => c.properties),
    ];
    const info = insBinding.run(
      compatible,
      binding.path,
      binding.description ?? '',
      // A scalar bus is stored verbatim so it can be filtered in SQL; the rare
      // list form is JSON. Consumers try JSON.parse and fall back to the string.
      binding.bus === undefined
        ? null
        : typeof binding.bus === 'string'
          ? binding.bus
          : JSON.stringify(binding.bus),
      binding.onBus ?? null,
      JSON.stringify(binding.cells),
      JSON.stringify(binding.includes),
      allProps.map((p) => p.name).join(' '),
      allProps.length,
      compatible.includes(',') ? compatible.split(',')[0]! : null,
    );
    const bindingId = Number(info.lastInsertRowid);

    const levels: { level: number; props: typeof binding.properties }[] = [
      { level: 0, props: binding.properties },
      ...binding.children.map((c, i) => ({ level: i + 1, props: c.properties })),
    ];
    for (const { level, props } of levels) {
      for (const p of props) {
        insProp.run(
          bindingId,
          level,
          p.name,
          p.type ?? null,
          p.required ? 1 : 0,
          internText(p.description),
          jsonOrNull(p.default),
          p.enum === undefined ? null : JSON.stringify(p.enum),
          jsonOrNull(p.const),
          p.deprecated ? 1 : 0,
          p.specifierSpace ?? null,
          p.inheritedFrom ?? null,
        );
      }
    }
  }

  // boards and SoCs
  const insBoard = db.prepare(
    `INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const board of boards) {
    const socNames = board.socs.map((s) => s.name);
    insBoard.run(
      board.name,
      board.fullName ?? '',
      board.vendor ?? '',
      board.dir,
      board.arch ?? null,
      board.ram ?? null,
      board.flash ?? null,
      JSON.stringify(board.socs),
      socNames.join(' '),
      JSON.stringify(board.targets),
      board.targets.map((t) => t.identifier).join(' '),
      JSON.stringify(board.revisions),
      board.defaultRevision ?? null,
      JSON.stringify(board.supported),
      board.supported.join(' '),
      board.docPath ?? null,
    );
  }

  const insSoc = db.prepare(
    'INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const soc of socs) {
    insSoc.run(
      soc.name,
      soc.series ?? null,
      soc.family ?? null,
      soc.vendor ?? null,
      soc.dir,
      JSON.stringify(soc.cpuclusters),
    );
  }

  // samples
  const insSample = db.prepare(
    `INSERT INTO sample
       (path, name, description, tags, tags_text, depends_on, integration_platforms,
        platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insSampleFile = db.prepare(
    'INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)',
  );
  for (const sample of samples) {
    const info = insSample.run(
      sample.path,
      sample.name,
      sample.description ?? '',
      JSON.stringify(sample.tags),
      sample.tags.join(' '),
      JSON.stringify(sample.dependsOn),
      JSON.stringify(sample.integrationPlatforms),
      JSON.stringify(sample.platformAllow),
      JSON.stringify(sample.files),
      sample.docPath ?? null,
    );
    const sampleId = Number(info.lastInsertRowid);
    for (const file of sample.contents) insSampleFile.run(sampleId, file.path, file.text);
  }

  // api
  const insApi = db.prepare(
    `INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const sym of api.symbols) {
    insApi.run(
      sym.name,
      sym.kind,
      sym.signature,
      sym.brief ?? '',
      sym.detail ?? '',
      JSON.stringify(sym.params),
      JSON.stringify(sym.returns),
      JSON.stringify(sym.retvals),
      sym.group ?? null,
      sym.since ?? null,
      sym.deprecated ? 1 : 0,
      sym.header,
      sym.line,
    );
  }

  const insGroup = db.prepare(
    'INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)',
  );
  for (const group of api.groups) {
    insGroup.run(group.id, group.title, group.parent ?? null, group.header);
  }

  // meta
  const insMeta = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
  const meta: Record<string, string> = {
    schema_version: String(SCHEMA_VERSION),
    zephyr_version: version,
    zephyr_commit: lock['commit'] ?? '',
    zephyr_tag: lock['tag'] ?? '',
    source_path: opts.zephyr,
    source_kind: opts.zephyr.includes(`${'.cache'}/zephyr`) ? 'upstream' : 'workspace',
    doc_base_url: docBaseUrl,
    built_at: new Date().toISOString(),
    ingest_version: '0.1.0',
    count_docs: String(docs.length),
    count_doc_chunks: String(chunkCount),
    count_kconfig: String(kconfig.symbols.length),
    count_bindings: String(bindings.length),
    count_dt_properties: String(propCount),
    count_boards: String(boards.length),
    count_board_targets: String(targetCount),
    count_socs: String(socs.length),
    count_samples: String(samples.length),
    count_api: String(api.symbols.length),
  };
  for (const [key, value] of Object.entries(meta)) insMeta.run(key, value);

  db.exec('COMMIT');
  log(`  written   (${Date.now() - tWrite} ms)`);

  const tFts = Date.now();
  db.exec(BUILD_FTS);
  log(`  indexed   full-text (${Date.now() - tFts} ms)`);

  db.exec('VACUUM');
  db.exec('PRAGMA optimize');
  db.close();

  const bytes = statSync(opts.out).size;
  log(
    `Done in ${((Date.now() - started) / 1000).toFixed(1)} s -> ${opts.out} (${(bytes / 1024 / 1024).toFixed(1)} MiB)`,
  );
}

try {
  main();
} catch (err) {
  process.stderr.write(`zephyr-ai-ingest: ${(err as Error).message}\n`);
  process.exit(1);
}
