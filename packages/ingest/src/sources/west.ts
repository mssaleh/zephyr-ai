import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { parse as parseYaml } from 'yaml';

import RUNNER_EXPORTER from '../adapters/runner-export.py';
import { standardPython } from '../python.ts';
import type { SourceReport } from '../report.ts';
import type { SourceManifest } from '../../../shared/source-manifest.ts';
import { byField } from '../../../shared/ordering.ts';

export interface RunnerRecord {
  name: string;
  /** Tree path of the implementing module, which is what `get_source` takes. */
  module: string;
  description?: string;
  capabilities: Record<string, unknown>;
}

export interface WestCommandRecord {
  name: string;
  className: string;
  file: string;
  help?: string;
}

export interface RunnerArgument {
  value: string;
  /** The `if()` expression governing this argument, absent when unconditional. */
  guard?: string;
  /** Whether the value still holds an unexpanded `${...}` reference. */
  unresolved: boolean;
}

export interface BoardRunnerRecord {
  board: string;
  runner: string;
  /** Whether `board_finalize_runner_args` puts it on ZEPHYR_RUNNERS for this board. */
  available: boolean;
  flashDefault: boolean;
  debugDefault: boolean;
  args: RunnerArgument[];
  /** Tree paths of the files that declared this pairing, in evaluation order. */
  declaredIn: string[];
}

export interface CollectedWest {
  runners: RunnerRecord[];
  commands: WestCommandRecord[];
  boardRunners: BoardRunnerRecord[];
  report: SourceReport;
}

interface CMakeCall {
  name: string;
  args: string[];
  guard?: string;
}

/**
 * Strip `#` comments without losing a `#` inside a quoted argument.
 *
 * Runner arguments carry them: `--cmd-erase=stm32l1x mass_erase 0` is quoted, and
 * so are GDB init strings that contain almost anything.
 */
function stripComments(text: string): string {
  let output = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;
    if (quoted) {
      output += char;
      if (char === '\\') {
        output += text[index + 1] ?? '';
        index++;
      } else if (char === '"') {
        quoted = false;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      output += char;
      continue;
    }
    if (char === '#') {
      while (index < text.length && text[index] !== '\n') index++;
      output += '\n';
      continue;
    }
    output += char;
  }
  return output;
}

/** Split a CMake argument list on whitespace, keeping quoted arguments whole. */
function splitArguments(body: string): string[] {
  const args: string[] = [];
  let current = '';
  let quoted = false;
  let started = false;
  for (let index = 0; index < body.length; index++) {
    const char = body[index]!;
    if (quoted) {
      if (char === '\\') {
        current += body[index + 1] ?? '';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      started = true;
      continue;
    }
    if (/\s/.test(char)) {
      if (started) args.push(current);
      current = '';
      started = false;
      continue;
    }
    current += char;
    started = true;
  }
  if (started) args.push(current);
  return args;
}

/** CMake conditions wrap across lines; collapse them so a guard reads as one clause. */
function normalise(expression: string): string {
  return expression.replace(/\s+/g, ' ').trim();
}

/** One branch of an `if()` chain, as the predicate under which it actually runs. */
interface Frame {
  taken: string[];
  predicate: string | null;
}

function framePredicate(frame: Frame): string | null {
  return frame.predicate;
}

/**
 * Parse a CMake file into the calls we care about, each carrying the `if()`
 * predicate that governs it.
 *
 * CMake evaluates an `if`/`elseif` chain in order, so an `elseif(X)` branch runs
 * only when X holds and every earlier branch did not. Recording X alone would
 * present a condition the reader could satisfy while the arguments still did not
 * apply, so the earlier branches are carried into the predicate.
 */
function parseCMake(text: string): CMakeCall[] {
  const source = stripComments(text);
  const calls: CMakeCall[] = [];
  const stack: Frame[] = [];
  const pattern = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const name = match[1]!.toLowerCase();
    let depth = 1;
    let index = match.index + match[0].length;
    let quoted = false;
    for (; index < source.length && depth > 0; index++) {
      const char = source[index]!;
      if (quoted) {
        if (char === '\\') index++;
        else if (char === '"') quoted = false;
        continue;
      }
      if (char === '"') quoted = true;
      else if (char === '(') depth++;
      else if (char === ')') depth--;
    }
    if (depth !== 0) break;
    const body = source.slice(match.index + match[0].length, index - 1);
    pattern.lastIndex = index;

    if (name === 'if') {
      const predicate = normalise(body);
      stack.push({ taken: [predicate], predicate });
      continue;
    }
    if (name === 'elseif' || name === 'else') {
      const frame = stack[stack.length - 1];
      if (!frame) continue;
      const branch = normalise(body);
      // Each branch is parenthesised before being combined, or a disjunction like
      // `A OR B AND NOT (C)` would read as `A OR (B AND NOT C)` and claim the
      // arguments apply in a case where CMake never reaches them.
      const negated = frame.taken.map((item) => `NOT (${item})`).join(' AND ');
      frame.predicate =
        name === 'else' ? negated || null : negated ? `(${branch}) AND ${negated}` : branch;
      if (name === 'elseif') frame.taken.push(branch);
      continue;
    }
    if (name === 'endif') {
      stack.pop();
      continue;
    }

    const predicates = stack.map(framePredicate).filter((item): item is string => Boolean(item));
    calls.push({
      name,
      args: splitArguments(body),
      ...(predicates.length > 0 ? { guard: predicates.join(' AND ') } : {}),
    });
  }
  return calls;
}

/** Accumulated runner state for one board, in CMake evaluation order. */
interface RunnerState {
  finalized: Set<string>;
  flashDefault?: string;
  debugDefault?: string;
  args: Map<string, RunnerArgument[]>;
  declaredIn: Map<string, Set<string>>;
}

function noteDeclaration(state: RunnerState, runner: string, file: string): void {
  const existing = state.declaredIn.get(runner);
  if (existing) existing.add(file);
  else state.declaredIn.set(runner, new Set([file]));
}

function addArguments(
  state: RunnerState,
  runner: string,
  values: string[],
  guard: string | undefined,
): void {
  const list = state.args.get(runner) ?? [];
  for (const value of values) {
    list.push({
      value,
      ...(guard ? { guard } : {}),
      unresolved: value.includes('${'),
    });
  }
  state.args.set(runner, list);
}

/**
 * Evaluate one CMake file into runner state, following `include()` of other files
 * in the tree so that `boards/common/*.board.cmake` contributes at the point the
 * board includes it.
 *
 * Order is load-bearing. `board_set_flasher_ifnset` is `set_ifndef`, so the first
 * declaration wins and later ones are ignored; upstream board files carry `keep
 * first` comments for exactly this reason.
 */
function evaluate(
  zephyrRoot: string,
  relative: string,
  state: RunnerState,
  seen: Set<string>,
  errors: SourceReport['errors'],
): void {
  if (seen.has(relative)) return;
  seen.add(relative);
  const absolute = join(zephyrRoot, relative);
  if (!existsSync(absolute)) return;

  let calls: CMakeCall[];
  try {
    calls = parseCMake(readFileSync(absolute, 'utf8'));
  } catch (error) {
    errors.push({ path: relative, code: 'cmake-parse', message: (error as Error).message });
    return;
  }

  for (const call of calls) {
    const [first, ...rest] = call.args;
    switch (call.name) {
      case 'include': {
        if (!first) break;
        // ${ZEPHYR_BASE} is the only variable that resolves to a path we can follow;
        // anything else is a build-time value this catalogue cannot evaluate.
        const target = first.startsWith('${ZEPHYR_BASE}/') ? first.slice('${ZEPHYR_BASE}/'.length) : null;
        if (target) evaluate(zephyrRoot, target, state, seen, errors);
        break;
      }
      case 'board_finalize_runner_args': {
        if (!first) break;
        state.finalized.add(first);
        noteDeclaration(state, first, relative);
        addArguments(state, first, rest, call.guard);
        break;
      }
      case 'board_runner_args': {
        if (!first) break;
        noteDeclaration(state, first, relative);
        addArguments(state, first, rest, call.guard);
        break;
      }
      case 'board_set_flasher_ifnset': {
        if (first && state.flashDefault === undefined) {
          state.flashDefault = first;
          noteDeclaration(state, first, relative);
        }
        break;
      }
      case 'board_set_debugger_ifnset': {
        if (first && state.debugDefault === undefined) {
          state.debugDefault = first;
          noteDeclaration(state, first, relative);
        }
        break;
      }
      case 'board_set_flasher': {
        // The non-ifnset form is an explicit override, so the last one wins.
        if (first) {
          state.flashDefault = first;
          noteDeclaration(state, first, relative);
        }
        break;
      }
      case 'board_set_debugger': {
        if (first) {
          state.debugDefault = first;
          noteDeclaration(state, first, relative);
        }
        break;
      }
      default:
        break;
    }
  }
}

/**
 * Runner declarations that live outside `boards/`.
 *
 * `board_finalize_runner_args` is not confined to the board layer: an SoC's
 * CMakeLists can finalize a runner for every board built on it. Such a
 * declaration belongs to a board when the board's SoC directory is a path prefix
 * of the declaring file, which is a property of the tree layout rather than of any
 * particular vendor.
 */
function socScopedDeclarations(
  source: SourceManifest,
  errors: SourceReport['errors'],
): { path: string; runner: string; args: RunnerArgument[] }[] {
  const found: { path: string; runner: string; args: RunnerArgument[] }[] = [];
  for (const relative of source.select({
    under: 'soc',
    match: (name) => name === 'CMakeLists.txt' || name.endsWith('.cmake'),
  })) {
    const text = source.read(relative);
    if (!text.includes('board_finalize_runner_args')) continue;
    let calls: CMakeCall[];
    try {
      calls = parseCMake(text);
    } catch (error) {
      errors.push({ path: relative, code: 'cmake-parse', message: (error as Error).message });
      continue;
    }
    for (const call of calls) {
      if (call.name !== 'board_finalize_runner_args') continue;
      const [runner, ...rest] = call.args;
      if (!runner) continue;
      found.push({
        path: relative,
        runner,
        args: rest.map((value) => ({
          value,
          ...(call.guard ? { guard: call.guard } : {}),
          unresolved: value.includes('${'),
        })),
      });
    }
  }
  return found;
}

export interface CollectedRunners {
  runners: RunnerRecord[];
  /** False when the west package was not importable, which costs the openocd runner. */
  complete: boolean;
  report: SourceReport;
}

export function collectRunners(zephyrRoot: string): CollectedRunners {
  const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-runners-'));
  const exporter = join(temporary, 'runner-export.py');
  try {
    writeFileSync(exporter, RUNNER_EXPORTER, { mode: 0o600 });
    // The runner package is stdlib-only, so this needs no PyYAML and no west.
    const result = spawnSync(standardPython(), [exporter, '--zephyr', zephyrRoot], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (result.status !== 0) {
      const detail = result.stderr.trim().split('\n').slice(-12).join('\n');
      throw new Error(`The west runner catalogue could not be exported:\n${detail}`);
    }
    return JSON.parse(result.stdout) as CollectedRunners;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

export function collectWestCommands(source: SourceManifest): WestCommandRecord[] {
  const declaration = 'scripts/west-commands.yml';
  if (!source.has(declaration)) return [];
  const parsed = parseYaml(source.read(declaration), { logLevel: 'silent' }) as unknown;
  if (!parsed || typeof parsed !== 'object') return [];
  const groups = (parsed as Record<string, unknown>)['west-commands'];
  if (!Array.isArray(groups)) return [];

  const records: WestCommandRecord[] = [];
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue;
    const entry = group as Record<string, unknown>;
    const file = typeof entry['file'] === 'string' ? entry['file'] : '';
    for (const item of Array.isArray(entry['commands']) ? entry['commands'] : []) {
      if (!item || typeof item !== 'object') continue;
      const command = item as Record<string, unknown>;
      if (typeof command['name'] !== 'string') continue;
      records.push({
        name: command['name'],
        className: typeof command['class'] === 'string' ? command['class'] : '',
        file,
        ...(typeof command['help'] === 'string' ? { help: command['help'] } : {}),
      });
    }
  }
  return records.sort(byField((record) => record.name));
}

export function collectBoardRunners(
  source: SourceManifest,
  boards: { name: string; dir: string; socDirs: string[] }[],
): { boardRunners: BoardRunnerRecord[]; report: SourceReport } {
  const zephyrRoot = source.root;
  const errors: SourceReport['errors'] = [];
  const socScoped = socScopedDeclarations(source, errors);
  const records: BoardRunnerRecord[] = [];
  let withoutCMake = 0;

  for (const board of boards) {
    const relative = `${board.dir}/board.cmake`;
    const state: RunnerState = {
      finalized: new Set(),
      args: new Map(),
      declaredIn: new Map(),
    };
    if (existsSync(join(zephyrRoot, relative))) {
      evaluate(zephyrRoot, relative, state, new Set(), errors);
    } else {
      withoutCMake++;
    }

    for (const declaration of socScoped) {
      if (!board.socDirs.some((dir) => dir && declaration.path.startsWith(`${dir}/`))) continue;
      state.finalized.add(declaration.runner);
      noteDeclaration(state, declaration.runner, declaration.path);
      const list = state.args.get(declaration.runner) ?? [];
      list.push(...declaration.args);
      state.args.set(declaration.runner, list);
    }

    // A default is not available by virtue of being a default. Upstream sets a debug
    // default that is never finalized on 21 boards -- every QEMU target, plus a few
    // ESP32 boards that name openocd without including its common file -- and Zephyr
    // emits no runners.yaml entry for it, so `west debug` there fails. Keep the row so
    // the declaration is visible, and let `available` continue to mean registered.
    const names = new Set(state.finalized);
    if (state.flashDefault) names.add(state.flashDefault);
    if (state.debugDefault) names.add(state.debugDefault);

    for (const runner of [...names].sort()) {
      records.push({
        board: board.name,
        runner,
        available: state.finalized.has(runner),
        flashDefault: state.flashDefault === runner,
        debugDefault: state.debugDefault === runner,
        args: state.args.get(runner) ?? [],
        declaredIn: [...(state.declaredIn.get(runner) ?? [])].sort(),
      });
    }
  }

  // Two distinct populations, and collapsing them would misreport both: a board can
  // ship a board.cmake that names no runner at all, as the QEMU targets do.
  const named = new Set(records.map((record) => record.board));
  const withoutRunner = boards.filter((board) => !named.has(board.name)).length;
  const warnings: SourceReport['warnings'] = [];
  if (withoutCMake > 0) {
    warnings.push({
      path: 'boards',
      code: 'no-board-cmake',
      message: `${withoutCMake} boards ship no board.cmake`,
    });
  }
  if (withoutRunner > 0) {
    warnings.push({
      path: 'boards',
      code: 'no-runner-declared',
      message: `${withoutRunner} boards declare no runner; report this as undeclared, never as unsupported`,
    });
  }

  return {
    boardRunners: records,
    report: {
      // The unit is the board-runner pairing, so every pairing found is stored and
      // the two agree. A board that declares no runner produces no record; it is
      // not an excluded one, and the warnings above carry that coverage fact.
      discovered: records.length,
      indexed: records.length,
      intentionallyExcluded: [],
      warnings,
      errors,
    },
  };
}
