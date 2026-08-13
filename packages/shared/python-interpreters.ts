import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';

/**
 * Interpreter discovery, shared because two consumers must agree on it.
 *
 * The indexer picks an interpreter to run its adapters with; the environment
 * check reports which interpreters exist and what each carries. If those two
 * disagreed about what is even a candidate, the check would describe a Python
 * the indexer never uses, which is worse than not checking at all.
 */

export function executableOnPath(name: string, pathValue: string | undefined): string | undefined {
  if (name.includes('/') || name.includes('\\')) return existsSync(name) ? resolve(name) : undefined;
  for (const directory of (pathValue ?? '').split(delimiter).filter(Boolean)) {
    const candidate = join(directory, name);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/**
 * The interpreter that owns `west`, read from its shebang.
 *
 * Preferred by the indexer because west's own dependencies include PyYAML, so
 * this interpreter usually satisfies the adapters. It is emphatically not the
 * interpreter a build uses: CMake resolves Python from PATH.
 */
export function westInterpreter(env: NodeJS.ProcessEnv): string | undefined {
  const west = executableOnPath('west', env['PATH']);
  if (!west) return undefined;
  try {
    const firstLine = readFileSync(realpathSync(west), 'utf8').split(/\r?\n/, 1)[0] ?? '';
    const shebang = firstLine.match(/^#!\s*(\S+)(?:\s+(.+))?$/);
    if (!shebang) return undefined;
    if (shebang[1]?.endsWith('/env') && shebang[2]) {
      return executableOnPath(shebang[2].trim().split(/\s+/, 1)[0]!, env['PATH']);
    }
    return shebang[1] && existsSync(shebang[1]) ? shebang[1] : undefined;
  } catch {
    return undefined;
  }
}

export function interpreterCandidates(env: NodeJS.ProcessEnv): string[] {
  return [env['PYTHON_EXECUTABLE'], westInterpreter(env), 'python3', 'python'].filter(
    (value, index, all): value is string => Boolean(value) && all.indexOf(value) === index,
  );
}

export interface Requirement {
  name: string;
  /** PEP 508 environment marker, when the requirement is conditional. */
  marker?: string;
}

/**
 * Distribution requirements declared by a Zephyr requirements file.
 *
 * Names are kept as written, because that is what `importlib.metadata` takes:
 * mapping a distribution to its import name is not mechanical (PyYAML imports as
 * `yaml`, pyelftools as `elftools`) and any table that tried would be a guess.
 *
 * The marker is kept with the name rather than stripped. `windows-curses` is
 * required only on win32, and calling it missing on Linux would be a false
 * report of a broken environment — the failure mode that makes a checker ignored.
 */
export function parseRequirements(text: string): Requirement[] {
  const found = new Map<string, Requirement>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0]!.trim();
    if (line === '' || line.startsWith('-')) continue;
    const [specifier, ...markerParts] = line.split(';');
    const name = specifier!.split('[')[0]!.split(/[<>=!~]/)[0]!.trim();
    if (name === '') continue;
    const marker = markerParts.join(';').trim();
    if (!found.has(name)) found.set(name, { name, ...(marker ? { marker } : {}) });
  }
  return [...found.values()];
}
