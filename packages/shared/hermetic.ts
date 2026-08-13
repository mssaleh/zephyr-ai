import { spawnSync } from 'node:child_process';

/**
 * The environment the ingest is allowed to see.
 *
 * The build inherited its caller's environment, so a `west zephyr-export` in
 * somebody's shell changed the catalogue: `ZEPHYR_TOOLCHAIN_VARIANT` is
 * referenced 56 times across the tree's Kconfig, second only to `BOARD`. CI
 * exported it to run the compile matrix, this machine did not, and the two
 * produced different indexes with identical row counts.
 *
 * The answer is not to strip the variables that were noticed. It is to construct
 * the environment from a declaration and re-exec into it, so that no descendant
 * — the Python adapters, git, Doxygen, or a tool added next year — can see
 * anything undeclared. There is no call site left to get wrong.
 */

/** Variables carried through, because the build genuinely needs them. */
const CARRIED = [
  // Finding git, python and doxygen at all.
  'PATH',
  // git reads its configuration from here, and Python locates its user site.
  'HOME',
  'USERPROFILE',
  'SYSTEMROOT',
  'TMPDIR',
  'TEMP',
  'TMP',
  // The ingest's own options, which parseArgs reads as defaults.
  'PYTHON_EXECUTABLE',
  'ZEPHYR_BASE',
  'ZEPHYR_AI_PROJECT_ROOT',
  'ZEPHYR_AI_PLUGIN_DATA',
  'CLAUDE_PROJECT_DIR',
  'CLAUDE_PLUGIN_DATA',
] as const;

/**
 * Variables imposed, because leaving them to the machine is what caused this.
 *
 * `LC_ALL` fixes collation for every tool in the tree at once rather than per
 * call site. `PYTHONHASHSEED` fixes the iteration order of Python sets and dicts
 * in the adapters, which nothing had ever pinned and which no count would have
 * revealed. `TZ` keeps any date a tool renders from following the machine.
 */
const IMPOSED: Record<string, string> = {
  LC_ALL: 'C',
  LANG: 'C',
  LC_COLLATE: 'C',
  TZ: 'UTC',
  PYTHONHASHSEED: '0',
  PYTHONDONTWRITEBYTECODE: '1',
  PYTHONNOUSERSITE: '1',
  GIT_CONFIG_NOSYSTEM: '1',
  SOURCE_DATE_EPOCH: '0',
};

const MARKER = 'ZEPHYR_AI_HERMETIC';

/** The environment the build runs in, as a value that can be recorded and hashed. */
export function hermeticEnvironment(source: NodeJS.ProcessEnv): Record<string, string> {
  const environment: Record<string, string> = { ...IMPOSED, [MARKER]: '1' };
  for (const name of CARRIED) {
    const value = source[name];
    if (value !== undefined) environment[name] = value;
  }
  return environment;
}

/**
 * The part of the environment that changes what the build produces.
 *
 * `PATH`, `HOME` and the temporary directory decide which tools are found and
 * where scratch files live, not what the catalogue says, so they are named as
 * inputs without their values being hashed — a build is not a different build
 * because it ran from a different home.
 */
export function declaredEnvironmentIdentity(
  environment: Record<string, string>,
): Record<string, string> {
  const opaque = new Set(['PATH', 'HOME', 'USERPROFILE', 'SYSTEMROOT', 'TMPDIR', 'TEMP', 'TMP']);
  return Object.fromEntries(
    Object.entries(environment)
      .filter(([name]) => !opaque.has(name))
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)),
  );
}

export function isHermetic(source: NodeJS.ProcessEnv = process.env): boolean {
  return source[MARKER] === '1';
}

/**
 * Re-exec into the declared environment, once.
 *
 * Costs one process start — about 21 ms against a build of twenty seconds — and
 * is what makes every later spawn hermetic without any of them knowing.
 */
export function reExecHermetically(argv: string[]): never {
  const result = spawnSync(process.execPath, argv, {
    env: hermeticEnvironment(process.env),
    stdio: 'inherit',
  });
  if (result.error) {
    process.stderr.write(`zephyr-ai-ingest: could not re-exec hermetically: ${result.error.message}\n`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}
