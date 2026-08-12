import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function executableOnPath(name: string, pathValue: string | undefined): string | undefined {
  if (name.includes('/') || name.includes('\\')) return existsSync(name) ? resolve(name) : undefined;
  for (const directory of (pathValue ?? '').split(delimiter).filter(Boolean)) {
    const candidate = join(directory, name);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** Prefer the interpreter which owns `west`, because its environment normally carries PyYAML. */
function westInterpreter(env: NodeJS.ProcessEnv): string | undefined {
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

function interpreterCandidates(env: NodeJS.ProcessEnv): string[] {
  return [
    env['PYTHON_EXECUTABLE'],
    westInterpreter(env),
    'python3',
    'python',
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

/** Locate a supported Python for adapters which only use the standard library. */
export function standardPython(env: NodeJS.ProcessEnv = process.env): string {
  for (const candidate of interpreterCandidates(env)) {
    const result = spawnSync(candidate, ['-c', 'import sys; assert sys.version_info >= (3, 10)'], {
      encoding: 'utf8',
      env: { ...env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (result.status === 0) return candidate;
  }
  throw new Error(
    'This index adapter requires Python 3.10 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.',
  );
}

export function semanticPython(
  zephyrRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const kconfigDirectory = join(zephyrRoot, 'scripts', 'kconfig');
  const devicetreeDirectory = join(
    zephyrRoot,
    'scripts',
    'dts',
    'python-devicetree',
    'src',
  );
  const missing = [
    join(kconfigDirectory, 'kconfiglib.py'),
    join(devicetreeDirectory, 'devicetree', 'edtlib.py'),
  ].filter((path) => !existsSync(path));
  if (missing.length > 0) {
    throw new Error(
      'The selected Zephyr tree is missing its semantic ingestion libraries ' +
        '(scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). ' +
        'Use a complete Zephyr checkout and retry.',
    );
  }

  const candidates = interpreterCandidates(env);
  const probe = [
    'import sys',
    `sys.path.insert(0, ${JSON.stringify(kconfigDirectory)})`,
    `sys.path.insert(0, ${JSON.stringify(devicetreeDirectory)})`,
    'import kconfiglib',
    'import yaml',
    'from devicetree import edtlib',
    'assert sys.version_info >= (3, 10)',
  ].join('; ');
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['-c', probe], {
      encoding: 'utf8',
      env: { ...env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (result.status === 0) return candidate;
  }
  throw new Error(
    'Semantic index creation requires Python 3.10 or newer with PyYAML, plus the Kconfiglib ' +
      'and devicetree libraries shipped by the selected Zephyr tree. Activate the project\'s ' +
      'west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.',
  );
}
