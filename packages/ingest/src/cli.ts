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
 *   zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--out <path>]
 *     [--plugin-data <path>] [--modules <path>...] [--quiet]
 */

import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

import { BUILD_FTS, DDL, SCHEMA_VERSION } from './schema.ts';
import { collectApi, discoverDoxygenXml } from './sources/api.ts';
import { collectBindings } from './sources/bindings.ts';
import { collectBoards, collectSocs } from './sources/boards.ts';
import { collectDocs } from './sources/docs.ts';
import { collectKconfig, type CollectedKconfig, type KconfigScope } from './sources/kconfig.ts';
import { collectSamples } from './sources/samples.ts';
import { collectBoardRunners, collectRunners, collectWestCommands } from './sources/west.ts';
import type { KconfigExpr } from './sources/kconfig.ts';
import { buildIndexDescriptor } from './identity.ts';
import { semanticPython } from './python.ts';
import { canonicalJson, projectId, type ProducerRecord } from '../../shared/index-descriptor.ts';
import { contentDigest } from '../../shared/content-digest.ts';
import { parseRequirements, type Requirement } from '../../shared/python-interpreters.ts';
import { fetchPinnedZephyr, PINNED_ZEPHYR_LOCK } from './fetch.ts';
import packageMetadata from '../package.json' with { type: 'json' };

interface Options {
  zephyr: string;
  out?: string;
  modules: string[];
  quiet: boolean;
  projectRoot?: string;
  pluginData?: string;
  boardTarget?: string;
  applicationRoot?: string;
  buildDirectory?: string;
  apiXml?: string;
  requireDoxygen: boolean;
  requireWest: boolean;
  requirePinned: boolean;
  fetchPinned: boolean;
  autoDetectApiXml: boolean;
}

function parseArgs(argv: string[]): Options {
  const repoRoot = resolve(process.cwd());
  const opts: Options = {
    zephyr: process.env['ZEPHYR_BASE'] ?? join(repoRoot, '.cache', 'zephyr'),
    modules: [],
    quiet: false,
    requireDoxygen: false,
    requireWest: false,
    requirePinned: false,
    fetchPinned: false,
    autoDetectApiXml: true,
    projectRoot: process.env['CLAUDE_PROJECT_DIR'] ?? process.env['ZEPHYR_AI_PROJECT_ROOT'],
    pluginData: process.env['ZEPHYR_AI_PLUGIN_DATA'] ?? process.env['CLAUDE_PLUGIN_DATA'],
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
      case '--project-root':
        opts.projectRoot = resolve(argv[++i]!);
        break;
      case '--plugin-data':
        opts.pluginData = resolve(argv[++i]!);
        break;
      case '--fetch-pinned':
        opts.fetchPinned = true;
        break;
      case '--board':
        opts.boardTarget = argv[++i]!;
        break;
      case '--application':
        opts.applicationRoot = resolve(argv[++i]!);
        break;
      case '--build-dir':
        opts.buildDirectory = resolve(argv[++i]!);
        break;
      case '--api-xml':
        opts.apiXml = resolve(argv[++i]!);
        break;
      case '--no-api-xml-auto-detect':
        opts.autoDetectApiXml = false;
        break;
      case '--require-doxygen':
        opts.requireDoxygen = true;
        break;
      case '--require-west':
        opts.requireWest = true;
        break;
      case '--require-pinned':
        opts.requirePinned = true;
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
        console.log([
          'Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]',
          '  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]',
          '  [--board <target>] [--application <path>] [--build-dir <path>]',
          '  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]',
          '',
          '--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.',
          'Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.',
          'Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.',
          '--board, --application, and --build-dir record context identity only; resolved .config',
          'and final devicetree values are not currently ingested.',
        ].join('\n'));
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  opts.zephyr = resolve(opts.zephyr);
  return opts;
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

/**
 * JSON for a value, or SQL NULL when there is no value.
 *
 * The exporters come from Python, where an absent field is `None` and arrives
 * as JSON `null` rather than as `undefined`. Testing only for `undefined` stored
 * the four-character string `"null"`, which reads as a value everywhere
 * downstream — `get_binding` announced "is a bus controller for: null" on every
 * binding that controls no bus.
 */
function jsonOrNull(value: unknown): string | null {
  return value === undefined || value === null ? null : JSON.stringify(value);
}

/** Distributions a build of this tree needs, from the tree's own requirements. */
function buildRequirements(zephyrRoot: string): Requirement[] {
  const path = join(zephyrRoot, 'scripts', 'requirements-base.txt');
  if (!existsSync(path)) return [];
  return parseRequirements(readFileSync(path, 'utf8'));
}

/**
 * What produced this index, measured at build time.
 *
 * Recorded, never gated on. scripts/toolchain.json pins the one tool whose
 * version provably changes stored content; this exists so a digest mismatch
 * between two machines is answered by reading two descriptors.
 */
function producerRecord(zephyrRoot: string, apiXml: string | undefined): ProducerRecord {
  const version = (command: string, args: string[]): string | undefined => {
    const run = spawnSync(command, args, { encoding: 'utf8', timeout: 5000 });
    if (run.status !== 0) return undefined;
    return `${run.stdout}${run.stderr}`.trim().split('\n')[0] ?? undefined;
  };
  let python: string | undefined;
  try {
    python = version(semanticPython(zephyrRoot), ['--version']);
  } catch {
    // The interpreter probe throws when nothing usable exists; the ingest will
    // fail on its own terms shortly, and a missing entry says so honestly.
  }
  return {
    node: process.version,
    sqlite: String(
      new DatabaseSync(':memory:').prepare('SELECT sqlite_version() AS v').get()?.['v'] ?? '',
    ),
    ...(python ? { python } : {}),
    ...(apiXml ? { doxygen: version('doxygen', ['--version']) ?? 'unknown' } : {}),
    collator: new Intl.Collator().resolvedOptions().locale,
  };
}

function fsyncPath(path: string): void {
  const fd = openSync(path, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function fsyncDirectory(path: string): void {
  try {
    fsyncPath(path);
  } catch {
    // Opening a directory is unsupported on some platforms. The database and
    // pointer files themselves have already been synced.
  }
}

/** Keep the active context plus the four most recently used prior contexts. */
function retainProjectIndexes(projectDirectory: string, activeFingerprint: string): void {
  const candidates = readdirSync(projectDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-f0-9]{64}$/.test(entry.name))
    .flatMap((entry) => {
      const directory = join(projectDirectory, entry.name);
      const database = join(directory, 'zephyr.db');
      if (!existsSync(database)) return [];
      const usage = join(directory, 'last-used');
      return [{
        fingerprint: entry.name,
        directory,
        usedAt: statSync(existsSync(usage) ? usage : database).mtimeMs,
      }];
    })
    .sort((left, right) => right.usedAt - left.usedAt);
  const keep = new Set([
    activeFingerprint,
    ...candidates.filter((item) => item.fingerprint !== activeFingerprint).slice(0, 4).map((item) => item.fingerprint),
  ]);
  for (const candidate of candidates) {
    if (!keep.has(candidate.fingerprint)) rmSync(candidate.directory, { recursive: true, force: true });
  }
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const log = (msg: string) => {
    if (!opts.quiet) process.stderr.write(`${msg}\n`);
  };

  if (opts.fetchPinned) {
    if (!opts.pluginData) {
      throw new Error('--fetch-pinned requires --plugin-data so the checkout survives plugin updates.');
    }
    opts.zephyr = fetchPinnedZephyr(opts.pluginData, log);
  }

  if (!existsSync(join(opts.zephyr, 'VERSION'))) {
    throw new Error(
      `${opts.zephyr} does not look like a Zephyr tree (no VERSION file).\n` +
        `Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`,
    );
  }

  // Probe the complete ingest-time contract before scanning any corpus. A
  // half-built index and a late Python traceback are both avoidable failures.
  semanticPython(opts.zephyr);

  if (!opts.apiXml && opts.autoDetectApiXml) {
    const detected = discoverDoxygenXml(opts.zephyr);
    if (detected) {
      opts.apiXml = detected;
      log(`Using auto-detected Doxygen XML from ${detected}`);
    }
  }

  const lock = opts.fetchPinned ? PINNED_ZEPHYR_LOCK : readLock();
  if (opts.requireDoxygen && !opts.apiXml) {
    throw new Error(
      'Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.',
    );
  }
  // Collected before the descriptor because its completeness belongs in the
  // coverage map, and so in the context fingerprint: an index built where west was
  // importable holds a different catalogue from one built where it was not, and the
  // two must not share an identity and be reused for one another.
  const runnerExport = collectRunners(opts.zephyr);
  if (opts.requireWest && !runnerExport.complete) {
    throw new Error(
      'The west runner catalogue is incomplete: the selected interpreter cannot import the ' +
        'west package, which openocd needs, and hundreds of boards select openocd. An index ' +
        'built here would omit it without saying so. Install the tree\'s requirements ' +
        '(python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.',
    );
  }
  const descriptor = buildIndexDescriptor({
    zephyrRoot: opts.zephyr,
    westComplete: runnerExport.complete,
    ...(opts.projectRoot ? { projectRoot: opts.projectRoot } : {}),
    modules: opts.modules,
    ...(lock['commit'] ? { pinnedCommit: lock['commit'] } : {}),
    ...(opts.boardTarget ? { boardTarget: opts.boardTarget } : {}),
    ...(opts.applicationRoot ? { applicationRoot: opts.applicationRoot } : {}),
    ...(opts.buildDirectory ? { buildDirectory: opts.buildDirectory } : {}),
    apiSemantic: Boolean(opts.apiXml),
    producer: producerRecord(opts.zephyr, opts.apiXml),
  });
  const version = descriptor.zephyrVersion;
  if (opts.requirePinned && (!lock['commit'] || descriptor.sourceKind !== 'pinned-upstream')) {
    throw new Error(
      `The requested pinned index build requires commit ${lock['commit'] ?? '<missing lock>'}, but the selected tree is ${descriptor.zephyrCommit}. ` +
        'The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit ' +
        '--require-pinned for an explicit workspace index.',
    );
  }
  const docBaseUrl = `https://docs.zephyrproject.org/${version}/`;

  let activePath: string | undefined;
  let out = opts.out;
  if (!out && opts.pluginData) {
    if (descriptor.projectRoot) {
      const projectDir = join(opts.pluginData, 'indexes', 'projects', projectId(descriptor.projectRoot));
      out = join(projectDir, descriptor.contextFingerprint, 'zephyr.db');
      activePath = join(projectDir, 'active.json');
    } else {
      out = join(
        opts.pluginData,
        'indexes',
        'defaults',
        descriptor.zephyrCommit,
        String(descriptor.schemaVersion),
        'zephyr.db',
      );
    }
  }
  out ??= join(resolve(process.cwd()), 'index', 'zephyr.db');

  log(`Indexing Zephyr ${version} from ${opts.zephyr}`);
  const started = Date.now();

  // ---------------------------------------------------------------- collect --
  const t0 = Date.now();
  const { pages: docs, report: docsReport } = collectDocs(opts.zephyr, docBaseUrl);
  const chunkCount = docs.reduce((n, d) => n + d.chunks.length, 0);
  log(`  docs      ${docs.length} pages, ${chunkCount} sections (${Date.now() - t0} ms)`);

  const t1 = Date.now();
  // Both namespaces the tree defines. Modules extend the application namespace
  // only: a module contributes sysbuild Kconfig through a separate manifest key
  // that a catalogue build has no CMake run to generate.
  const kconfigByScope = new Map<KconfigScope, CollectedKconfig>([
    ['zephyr', collectKconfig(opts.zephyr, opts.modules, 'zephyr')],
    ['sysbuild', collectKconfig(opts.zephyr, [], 'sysbuild')],
  ]);
  const kconfig = kconfigByScope.get('zephyr')!;
  log(
    `  kconfig   ${kconfig.symbols.length} symbols from ${kconfig.filesScanned} files, ` +
      `${kconfigByScope.get('sysbuild')!.symbols.length} sysbuild (${Date.now() - t1} ms)`,
  );

  const t2 = Date.now();
  const bindingRoots = [
    join(opts.zephyr, 'dts', 'bindings'),
    ...opts.modules.map((m) => join(m, 'dts', 'bindings')).filter(existsSync),
  ];
  const { bindings, fragments, report: bindingReport } = collectBindings(bindingRoots);
  const countBindingProperties = (binding: (typeof bindings)[number]): number =>
    binding.properties.length + binding.children.reduce((count, child) => count + countBindingProperties(child), 0);
  const propCount = bindings.reduce((count, binding) => count + countBindingProperties(binding), 0);
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
  const socDirByName = new Map(socs.map((soc) => [soc.name, soc.dir]));
  const westCommands = collectWestCommands(opts.zephyr);
  const boardRunnerExport = collectBoardRunners(
    opts.zephyr,
    boards.map((board) => ({
      name: board.name,
      dir: board.dir,
      socDirs: [
        ...new Set(
          board.socs
            .map((soc) => socDirByName.get(soc.name))
            .filter((dir): dir is string => Boolean(dir)),
        ),
      ],
    })),
  );
  const west = {
    runners: runnerExport.runners,
    commands: westCommands,
    boardRunners: boardRunnerExport.boardRunners,
  };
  log(
    `  west      ${west.runners.length} runners, ${west.commands.length} commands, ` +
      `${west.boardRunners.length} board bindings${runnerExport.complete ? '' : ', incomplete'} (${Date.now() - t4} ms)`,
  );

  const t5s = Date.now();
  const samples = collectSamples(opts.zephyr);
  log(`  samples   ${samples.length} (${Date.now() - t5s} ms)`);

  const t5 = Date.now();
  const api = collectApi(opts.zephyr, opts.apiXml);
  log(
    `  api       ${api.symbols.length} symbols, ${api.groups.length} groups, ${api.mode} (${Date.now() - t5} ms)`,
  );

  // ------------------------------------------------------------------ write --
  mkdirSync(dirname(out), { recursive: true });
  const temporaryOutput = join(dirname(out), `.${randomUUID()}.zephyr.db.tmp`);
  let db: DatabaseSync | undefined;
  let activated = false;
  try {
    db = new DatabaseSync(temporaryOutput);
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
  const insDocOrigin = db.prepare(
    'INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)',
  );
  for (const page of docs) {
    const info = insDoc.run(page.path, page.url, page.title, page.area, JSON.stringify(page.labels));
    const docId = Number(info.lastInsertRowid);
    for (const origin of page.origins) {
      insDocOrigin.run(docId, origin.path, origin.startLine, origin.endLine, origin.directive);
    }
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

  // kconfig, once per namespace. The application tree and the sysbuild tree are
  // separate Kconfig graphs that share most symbol names, so each is written under
  // its own scope and nothing is resolved across the boundary.
  for (const [scope, kconfig] of kconfigByScope) {
    const insSym = db.prepare(
      `INSERT INTO kconfig
         (name, scope, type, prompt, help, defaults, depends, selects, implies, ranges,
          defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insEdge = db.prepare(
      'INSERT INTO kconfig_edge (from_sym, to_sym, kind, scope) VALUES (?, ?, ?, ?)',
    );
    const symbolIds = new Map<string, number>();
    for (const sym of kconfig.symbols) {
      const defaults = sym.definitions.flatMap((definition) =>
        definition.defaults.map((item) => ({
          value: item.value.display,
          ...(item.condition.display !== 'y' ? { cond: item.condition.display } : {}),
        })),
      );
      const depends = sym.definitions
        .map((definition) => definition.condition.display)
        .filter((value, index, all) => value !== 'y' && all.indexOf(value) === index);
      const selects = sym.definitions.flatMap((definition) =>
        definition.selects.map((item) => ({
          value: item.target,
          ...(item.condition.display !== 'y' ? { cond: item.condition.display } : {}),
        })),
      );
      const implies = sym.definitions.flatMap((definition) =>
        definition.implies.map((item) => ({
          value: item.target,
          ...(item.condition.display !== 'y' ? { cond: item.condition.display } : {}),
        })),
      );
      const ranges = sym.definitions.flatMap((definition) =>
        definition.ranges.map((item) => ({
          low: item.low.display,
          high: item.high.display,
          ...(item.condition.display !== 'y' ? { cond: item.condition.display } : {}),
        })),
      );
      const prompt = sym.definitions.find((definition) => definition.prompt)?.prompt ?? '';
      const menuPath =
        sym.definitions.find((definition) => definition.menuPath.length > 0)?.menuPath.join(' > ') ?? '';
      const info = insSym.run(
        sym.name,
        scope,
        sym.type ?? null,
        prompt,
        sym.help ?? '',
        JSON.stringify(defaults),
        JSON.stringify(depends),
        JSON.stringify(selects),
        JSON.stringify(implies),
        JSON.stringify(ranges),
        JSON.stringify(sym.definitions.map((definition) => ({ file: definition.file, line: definition.line }))),
        menuPath,
        sym.choice ? 1 : 0,
        sym.choice ?? null,
        sym.definitions.length,
        sym.hasPrompt ? 1 : 0,
      );
      symbolIds.set(sym.name, Number(info.lastInsertRowid));
      for (const relation of selects) insEdge.run(sym.name, relation.value, 'select', scope);
      for (const relation of implies) insEdge.run(sym.name, relation.value, 'imply', scope);
      const expressionSymbols = (expression: KconfigExpr): string[] => [
        ...(expression.kind === 'symbol' && expression.value ? [expression.value] : []),
        ...(expression.children ?? []).flatMap(expressionSymbols),
      ];
      for (const definition of sym.definitions) {
        for (const target of expressionSymbols(definition.condition)) {
          insEdge.run(sym.name, target, 'depends', scope);
        }
      }
    }

    const insExpr = db.prepare(
      'INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)',
    );
    const expressionIds = new Map<string, number>();
    const expressionId = (expression: KconfigExpr | null): number | null => {
      if (!expression) return null;
      const key = canonicalJson(expression);
      const existing = expressionIds.get(key);
      if (existing !== undefined) return existing;
      const children = expression.children ?? [];
      const id = Number(
        insExpr.run(
          expression.kind,
          expression.value ?? null,
          expression.display,
          expressionId(children[0] ?? null),
          expressionId(children[1] ?? null),
        ).lastInsertRowid,
      );
      expressionIds.set(key, id);
      return id;
    };
    const insDefinition = db.prepare(
      `INSERT INTO kconfig_definition
         (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
          is_menuconfig, is_configdefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insDefault = db.prepare(
      `INSERT INTO kconfig_default
         (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`,
    );
    const insRelation = db.prepare(
      `INSERT INTO kconfig_relation
         (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const insRange = db.prepare(
      `INSERT INTO kconfig_range
         (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?)`,
    );
    for (const sym of kconfig.symbols) {
      const symbolId = symbolIds.get(sym.name)!;
      for (const definition of sym.definitions) {
        const definitionId = Number(
          insDefinition.run(
            symbolId,
            definition.file,
            definition.line,
            definition.prompt,
            JSON.stringify(definition.menuPath),
            expressionId(definition.condition),
            expressionId(definition.promptCondition),
            definition.isMenuconfig ? 1 : 0,
            definition.isConfigDefault ? 1 : 0,
          ).lastInsertRowid,
        );
        for (const item of definition.defaults) {
          insDefault.run(definitionId, expressionId(item.value), expressionId(item.condition), item.order);
        }
        for (const [kind, items] of [
          ['select', definition.selects],
          ['imply', definition.implies],
        ] as const) {
          for (const item of items) {
            insRelation.run(
              definitionId,
              kind,
              item.target,
              symbolIds.get(item.target) ?? null,
              expressionId(item.condition),
              item.order,
            );
          }
        }
        for (const item of definition.ranges) {
          insRange.run(
            definitionId,
            expressionId(item.low),
            expressionId(item.high),
            expressionId(item.condition),
            item.order,
          );
        }
      }
    }

    const insChoice = db.prepare(
      'INSERT INTO kconfig_choice (stable_id, scope, name, type, definitions) VALUES (?, ?, ?, ?, ?)',
    );
    const insChoiceMember = db.prepare(
      'INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)',
    );
    for (const choice of kconfig.choices) {
      const choiceId = Number(
        insChoice.run(choice.id, scope, choice.name, choice.type, JSON.stringify(choice.definitions)).lastInsertRowid,
      );
      for (const member of new Set(choice.members)) {
        const memberId = symbolIds.get(member);
        if (memberId !== undefined) insChoiceMember.run(choiceId, memberId);
      }
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
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    const flatten = (
      current: typeof binding,
      level = 0,
      childPath = '',
    ): Array<{ level: number; childPath: string; property: (typeof binding.properties)[number] }> => [
      ...current.properties.map((property) => ({ level, childPath, property })),
      ...current.children.flatMap((child, index) =>
        flatten(child, level + 1, childPath ? `${childPath}/${index}` : String(index)),
      ),
    ];
    const allProps = flatten(binding);
    const info = insBinding.run(
      compatible,
      binding.path,
      binding.description ?? '',
      // A scalar bus is stored verbatim so it can be filtered in SQL; the rare
      // list form is JSON. Consumers try JSON.parse and fall back to the string.
      binding.bus === undefined || binding.bus === null
        ? null
        : typeof binding.bus === 'string'
          ? binding.bus
          : JSON.stringify(binding.bus),
      binding.onBus ?? null,
      JSON.stringify(binding.cells),
      JSON.stringify(binding.includes),
      allProps.map(({ property }) => property.name).join(' '),
      allProps.length,
      compatible.includes(',') ? compatible.split(',')[0]! : null,
    );
    const bindingId = Number(info.lastInsertRowid);

    for (const { level, childPath, property: p } of allProps) {
        insProp.run(
          bindingId,
          level,
          p.name,
          p.type ?? null,
          p.required ? 1 : 0,
          internText(p.description),
          jsonOrNull(p.default),
          jsonOrNull(p.enum),
          jsonOrNull(p.const),
          p.deprecated ? 1 : 0,
          p.specifierSpace ?? null,
          p.inheritedFrom ?? null,
          JSON.stringify(p.provenance ?? {}),
          JSON.stringify(p.constraints ?? {}),
          childPath,
        );
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

  // west runners and commands
  const insRunner = db.prepare(
    'INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)',
  );
  for (const runner of west.runners) {
    insRunner.run(
      runner.name,
      runner.module,
      runner.description ?? null,
      canonicalJson(runner.capabilities),
      JSON.stringify(runner.capabilities['commands'] ?? []),
    );
  }

  const insWestCommand = db.prepare(
    'INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)',
  );
  for (const command of west.commands) {
    insWestCommand.run(command.name, command.className, command.file, command.help ?? null);
  }

  const insBoardRunner = db.prepare(
    `INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`,
  );
  for (const row of west.boardRunners) {
    insBoardRunner.run(
      row.board,
      row.runner,
      row.available ? 1 : 0,
      row.flashDefault ? 1 : 0,
      row.debugDefault ? 1 : 0,
      JSON.stringify(row.args),
      JSON.stringify(row.declaredIn),
    );
  }

  // samples
  const insSample = db.prepare(
    `INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insSampleFile = db.prepare(
    'INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)',
  );
  const insSamplePlatform = db.prepare(
    'INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)',
  );
  for (const sample of samples) {
    const info = insSample.run(
      sample.path,
      sample.kind,
      sample.name,
      sample.description ?? '',
      JSON.stringify(sample.tags),
      sample.tags.join(' '),
      JSON.stringify(sample.scenarios),
      JSON.stringify(sample.dependsOn),
      JSON.stringify(sample.integrationPlatforms),
      JSON.stringify(sample.platformAllow),
      JSON.stringify(sample.files),
      sample.docPath ?? null,
    );
    const sampleId = Number(info.lastInsertRowid);
    for (const file of sample.contents) insSampleFile.run(sampleId, file.path, file.text);
    for (const platform of sample.integrationPlatforms) {
      insSamplePlatform.run(sampleId, platform, 'integration');
    }
    for (const platform of sample.platformAllow) {
      insSamplePlatform.run(sampleId, platform, 'allowlist');
    }
  }

  // api
  const insApi = db.prepare(
    `INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      sym.doxygenId ?? null,
      sym.compoundId ?? null,
      sym.docAnchor ?? null,
      sym.parentSymbol ?? null,
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
    zephyr_commit: descriptor.zephyrCommit,
    zephyr_tag: descriptor.sourceKind === 'pinned-upstream' ? (lock['tag'] ?? '') : '',
    source_path: opts.zephyr,
    source_kind: descriptor.sourceKind,
    index_descriptor: canonicalJson(descriptor),
    context_fingerprint: descriptor.contextFingerprint,
    module_fingerprint: descriptor.moduleFingerprint,
    doc_base_url: docBaseUrl,
    built_at: new Date().toISOString(),
    ingest_version: packageMetadata.version,
    count_docs: String(docs.length),
    count_doc_chunks: String(chunkCount),
    report_docs: canonicalJson(docsReport),
    count_kconfig: String(kconfig.symbols.length),
    count_kconfig_sysbuild: String(kconfigByScope.get('sysbuild')!.symbols.length),
    report_kconfig: canonicalJson({
      // The report accounts for semantic records. Kconfiglib either evaluates
      // every sourced file or aborts the export, so a successful run has one
      // indexed outcome for every discovered symbol. The separately reported
      // filesScanned value remains useful provenance, but is not the same unit.
      discovered: [...kconfigByScope.values()].reduce(
        (total, scoped) => total + scoped.symbols.length + scoped.choices.length,
        0,
      ),
      indexed: [...kconfigByScope.values()].reduce(
        (total, scoped) => total + scoped.symbols.length + scoped.choices.length,
        0,
      ),
      intentionallyExcluded: [],
      warnings: [
        {
          code: 'report-units',
          message: 'Counts cover both Kconfig namespaces: the application tree and sysbuild.',
        },
        ...[...kconfigByScope].map(([scope, scoped]) => ({
          code: 'source-files',
          message: `Kconfiglib evaluated ${scoped.filesScanned} source files for the ${scope} namespace.`,
        })),
        ...[...kconfigByScope].flatMap(([scope, scoped]) =>
          scoped.warnings.map((message) => ({ code: 'kconfiglib', message: `${scope}: ${message}` })),
        ),
      ],
      errors: [],
    }),
    count_bindings: String(bindings.length),
    count_dt_properties: String(propCount),
    report_bindings: canonicalJson(bindingReport),
    count_boards: String(boards.length),
    count_board_targets: String(targetCount),
    count_socs: String(socs.length),
    report_boards: canonicalJson({
      // Board, target, and SoC records are all primary hardware-catalogue
      // outcomes produced by this collector family.
      discovered: boards.length + targetCount + socs.length,
      indexed: boards.length + targetCount + socs.length,
      intentionallyExcluded: [],
      warnings: [
        { code: 'report-units', message: 'Counts include board, target, and SoC records.' },
      ],
      errors: [],
    }),
    // Recorded so the environment check can name what a build of *this* tree needs
    // without the tree still being on disk, and without a hard-coded package list
    // that would drift from whatever Zephyr requires next.
    python_requirements: canonicalJson(buildRequirements(opts.zephyr)),
    count_runners: String(west.runners.length),
    count_west_commands: String(west.commands.length),
    count_board_runners: String(west.boardRunners.length),
    report_west: canonicalJson({
      discovered:
        runnerExport.report.discovered + west.commands.length + boardRunnerExport.report.discovered,
      indexed: west.runners.length + west.commands.length + boardRunnerExport.report.indexed,
      intentionallyExcluded: runnerExport.report.intentionallyExcluded,
      warnings: [
        ...runnerExport.report.warnings,
        ...boardRunnerExport.report.warnings,
        {
          code: 'report-units',
          message: 'Counts include runner classes, west commands, and board-runner pairings.',
        },
      ],
      errors: [...runnerExport.report.errors, ...boardRunnerExport.report.errors],
    }),
    count_samples: String(samples.length),
    report_samples: canonicalJson({
      // Account for both each sample record and each eligible attached file.
      // Oversized files remain visible as reason-coded exclusions.
      discovered: samples.length + samples.reduce(
        (count, sample) => count + sample.contents.length + sample.exclusions.length,
        0,
      ),
      indexed: samples.length + samples.reduce((count, sample) => count + sample.contents.length, 0),
      intentionallyExcluded: samples.flatMap((sample) =>
        sample.exclusions.map((exclusion) => ({
          path: `${sample.path}/${exclusion.path}`,
          reason: exclusion.reason,
        })),
      ),
      warnings: [{ code: 'report-units', message: 'Counts include sample records and eligible attached files.' }],
      errors: [],
    }),
    count_api: String(api.symbols.length),
    api_ingest_mode: api.mode,
    report_api: canonicalJson(api.report),
  };
  for (const [key, value] of Object.entries(meta)) insMeta.run(key, value);

  db.exec('COMMIT');
  log(`  written   (${Date.now() - tWrite} ms)`);

  // Computed before the FTS tables exist, and written last, so the digest covers
  // every assertion the index makes and nothing derived from them.
  const digest = contentDigest(db);
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('content_hash', digest);
  log(`  content   ${digest.slice(0, 16)}…`);

  const tFts = Date.now();
  db.exec(BUILD_FTS);
  log(`  indexed   full-text (${Date.now() - tFts} ms)`);

  db.exec('VACUUM');
  db.exec('PRAGMA optimize');
  const integrity = String(db.prepare('PRAGMA integrity_check').get()?.['integrity_check'] ?? '');
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
  if (integrity !== 'ok' || foreignKeys.length > 0) {
    throw new Error(
      `Index verification failed (integrity=${integrity}, foreign-key violations=${foreignKeys.length}).`,
    );
  }
  for (const [fts, content] of [
    ['doc_fts', 'doc_chunk'],
    ['kconfig_fts', 'kconfig'],
    ['dt_fts', 'dt_binding'],
    ['board_fts', 'board'],
    ['sample_fts', 'sample'],
    ['api_fts', 'api_symbol'],
  ]) {
    const ftsCount = Number(db.prepare(`SELECT COUNT(*) AS n FROM ${fts}`).get()?.['n']);
    const contentCount = Number(db.prepare(`SELECT COUNT(*) AS n FROM ${content}`).get()?.['n']);
    if (ftsCount !== contentCount) {
      throw new Error(`Index verification failed: ${fts} has ${ftsCount} rows; ${content} has ${contentCount}.`);
    }
  }
  db.close();
  db = undefined;

  fsyncPath(temporaryOutput);
  renameSync(temporaryOutput, out);
  fsyncDirectory(dirname(out));
  activated = true;

  if (activePath) {
    const temporaryActive = `${activePath}.${randomUUID()}.tmp`;
    writeFileSync(
      temporaryActive,
      `${canonicalJson({
        contextFingerprint: descriptor.contextFingerprint,
        relativePath: `${descriptor.contextFingerprint}/zephyr.db`,
        activatedAt: new Date().toISOString(),
      })}\n`,
      { flag: 'wx' },
    );
    fsyncPath(temporaryActive);
    renameSync(temporaryActive, activePath);
    fsyncDirectory(dirname(activePath));
    retainProjectIndexes(dirname(activePath), descriptor.contextFingerprint);
  }

  const bytes = statSync(out).size;
  log(
    `Done in ${((Date.now() - started) / 1000).toFixed(1)} s -> ${out} (${(bytes / 1024 / 1024).toFixed(1)} MiB)`,
  );
  } finally {
    try {
      db?.close();
    } catch {
      /* the original build error is more useful */
    }
    if (!activated) {
      rmSync(temporaryOutput, { force: true });
      rmSync(`${temporaryOutput}-journal`, { force: true });
    }
  }
}

try {
  main();
} catch (err) {
  process.stderr.write(`zephyr-ai-ingest: ${(err as Error).message}\n`);
  process.exit(1);
}
