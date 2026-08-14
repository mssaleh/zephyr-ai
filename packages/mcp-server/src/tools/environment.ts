import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { type Index, json } from '../db.ts';
import {
  interpreterCandidates,
  westInterpreter,
  type Requirement,
} from '../../../shared/python-interpreters.ts';
import { type ToolFactory, joinSections, optionalString, result, section } from './common.ts';

interface InterpreterReport {
  path: string;
  resolved: string | null;
  version: string | null;
  role: string;
  missing: string[];
  unevaluated: string[];
  error?: string;
}

const PROBE_TIMEOUT_MS = 5000;

/**
 * Ask one interpreter what it is and which of the tree's requirements it holds.
 *
 * `importlib.metadata` is queried by distribution name, which is what a
 * requirements file writes; probing by import name would need a hand-written
 * translation table (PyYAML imports as `yaml`) and would be wrong the first time
 * Zephyr adds a package nobody thought to map.
 *
 * Markers are evaluated with `packaging` when it is present. When it is not, a
 * conditional requirement is reported as unevaluated rather than missing: saying
 * a Windows-only package is absent on Linux would make the whole report noise.
 */
const PROBE = `
import json, sys
try:
    from importlib.metadata import distribution
except Exception:
    print(json.dumps({"error": "importlib.metadata unavailable"})); raise SystemExit(0)
try:
    from packaging.markers import Marker
except Exception:
    Marker = None
requirements = json.loads(sys.argv[1])
missing, unevaluated = [], []
for entry in requirements:
    marker = entry.get("marker")
    if marker:
        if Marker is None:
            unevaluated.append(entry["name"]); continue
        try:
            if not Marker(marker).evaluate():
                continue
        except Exception:
            unevaluated.append(entry["name"]); continue
    try:
        distribution(entry["name"])
    except Exception:
        missing.append(entry["name"])
print(json.dumps({
    "version": ".".join(str(p) for p in sys.version_info[:3]),
    "executable": sys.executable,
    "missing": missing,
    "unevaluated": unevaluated,
}))
`;

function probe(command: string, requirements: Requirement[], role: string): InterpreterReport {
  const run = spawnSync(command, ['-c', PROBE, JSON.stringify(requirements)], {
    encoding: 'utf8',
    timeout: PROBE_TIMEOUT_MS,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
  });
  if (run.status !== 0 || !run.stdout.trim()) {
    return {
      path: command,
      resolved: null,
      version: null,
      role,
      missing: [],
      unevaluated: [],
      error: run.error ? run.error.message : run.stderr.trim().split('\n').slice(-2).join(' '),
    };
  }
  const parsed = JSON.parse(run.stdout) as {
    version?: string;
    executable?: string;
    missing?: string[];
    unevaluated?: string[];
    error?: string;
  };
  return {
    path: command,
    resolved: parsed.executable ?? null,
    version: parsed.version ?? null,
    role,
    missing: parsed.missing ?? [],
    unevaluated: parsed.unevaluated ?? [],
    ...(parsed.error ? { error: parsed.error } : {}),
  };
}

function commandVersion(command: string, args: string[]): string | null {
  const run = spawnSync(command, args, { encoding: 'utf8', timeout: PROBE_TIMEOUT_MS });
  if (run.status !== 0) return null;
  return `${run.stdout}${run.stderr}`.trim().split('\n')[0] ?? null;
}

/**
 * Whether a Zephyr SDK is visible.
 *
 * The CMake package registry is the mechanism Zephyr's own `find_package` uses,
 * so it is checked rather than guessed at from a conventional directory name.
 */
function zephyrSdk(): { found: boolean; detail: string } {
  const explicit = process.env['ZEPHYR_SDK_INSTALL_DIR'];
  if (explicit && existsSync(explicit)) {
    return { found: true, detail: `ZEPHYR_SDK_INSTALL_DIR=${explicit}` };
  }
  const registry = join(homedir(), '.cmake', 'packages', 'Zephyr-sdk');
  if (existsSync(registry)) {
    try {
      const entries = readdirSync(registry)
        .map((entry) => readFileSync(join(registry, entry), 'utf8').trim())
        .filter((path) => existsSync(path));
      if (entries.length > 0) {
        return { found: true, detail: `registered with CMake: ${entries.join(', ')}` };
      }
    } catch {
      /* fall through to not-found */
    }
  }
  return { found: false, detail: 'no ZEPHYR_SDK_INSTALL_DIR and nothing in the CMake registry' };
}

export const checkEnvironment: ToolFactory = (index) => ({
  name: 'check_environment',
  title: 'Check the build environment',
  description:
    'Check whether this machine can build the indexed Zephyr version, and give the command that ' +
    'fixes each gap. Use before the first `west build` in a session, and whenever a build fails ' +
    'with a missing Python module, a missing toolchain, or a CMake error naming jsonschema, ' +
    'pykwalify, or elftools. It lists every Python interpreter it can find and which required ' +
    'packages each one has. The interpreter that satisfies the indexer is often not the one CMake ' +
    'selects for a build; a west installed in its own environment is the common cause. This tool ' +
    'only reports. It does not install anything.',
  inputSchema: {
    type: 'object',
    properties: {
      board: {
        type: 'string',
        description:
          'Optional board or qualified target. Adds the runners this board needs on the host.',
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: (args) => {
    const idx = index();
    const board = optionalString(args, 'board');
    const requirements = json<Requirement[]>(idx.meta['python_requirements'], []);
    const zephyrVersion = idx.meta['zephyr_version'] ?? 'unknown';

    // CMake resolves Python from PATH, so `python3` is the interpreter a build
    // uses. The indexer prefers west's interpreter. Reporting both, labelled, is
    // the whole point: they are frequently different and only one is checked today.
    const westPython = westInterpreter(process.env);
    const roles = new Map<string, string>();
    for (const candidate of interpreterCandidates(process.env)) {
      const role =
        candidate === process.env['PYTHON_EXECUTABLE']
          ? 'PYTHON_EXECUTABLE, which the indexer prefers'
          : candidate === westPython
            ? "west's own interpreter, used by the indexer and not by a build"
            : candidate === 'python3'
              ? 'python3 on PATH, which is what CMake selects for a build'
              : 'fallback on PATH';
      roles.set(candidate, role);
    }
    // A candidate that is simply not installed is not a finding. `python` is absent
    // on most modern distributions, and listing it as a problem trains the reader
    // to skim past the ones that matter.
    const interpreters = [...roles.entries()]
      .map(([command, role]) => probe(command, requirements, role))
      .filter((item) => item.version !== null || !/ENOENT/.test(item.error ?? ''));

    const buildInterpreter = interpreters.find((item) => item.path === 'python3' && item.version);
    const westVersion = commandVersion('west', ['--version']);
    const sdk = zephyrSdk();
    const shipsWestSdk =
      idx.get('SELECT 1 AS present FROM west_command WHERE name = ?', 'sdk') !== undefined;

    const problems: string[] = [];
    // Without a requirements list there is nothing to check the interpreters
    // against, and an empty `missing` would otherwise read as a clean bill of
    // health. Absence of evidence is reported as such, never as evidence.
    const canCheckPackages = requirements.length > 0;
    if (!buildInterpreter) {
      problems.push(
        'No `python3` on PATH. CMake resolves Python from PATH, so a build cannot start. ' +
          'Install Python 3.12 or newer and make sure `python3` resolves to it.',
      );
    } else if (buildInterpreter.missing.length > 0) {
      problems.push(
        `The interpreter a build will use (\`${buildInterpreter.resolved ?? 'python3'}\`) is missing ` +
          `${buildInterpreter.missing.length} of the packages Zephyr ${zephyrVersion} requires: ` +
          `${buildInterpreter.missing.map((name) => `\`${name}\``).join(', ')}.\n\n` +
          'Install them into that interpreter\'s environment:\n\n' +
          '```bash\n' +
          '# with uv\n' +
          'uv pip install --python "$(command -v python3)" -r <zephyr>/scripts/requirements-base.txt\n' +
          '# or with pip\n' +
          'python3 -m pip install -r <zephyr>/scripts/requirements-base.txt\n' +
          '```',
      );
    }
    if (!westVersion) {
      problems.push(
        'No `west` on PATH. Install it — `uv tool install west` keeps it isolated, ' +
          '`python3 -m pip install west` puts it in the same environment as the build.',
      );
    }
    if (!sdk.found) {
      problems.push(
        `No Zephyr SDK found (${sdk.detail}). ` +
          (shipsWestSdk
            ? 'This Zephyr ships `west sdk`, so `west sdk install` fetches a matching toolchain ' +
              'and registers it. Add `-t <toolchain>` to install only what your targets need.'
            : 'This Zephyr version has no `west sdk` command; install the SDK from the ' +
              'zephyrproject-rtos/sdk-ng releases and run its `setup.sh`.'),
      );
    }

    // The split that this tool exists to expose, called out only when it is real.
    const satisfied = interpreters.filter((item) => item.version && item.missing.length === 0);
    const split =
      buildInterpreter && buildInterpreter.missing.length > 0 && satisfied.length > 0
        ? `\`${satisfied[0]!.path}\` has everything and \`python3\` does not. The index was built ` +
          'with the former, which is why indexing succeeded while a build will not. Installing ' +
          'the requirements into the interpreter on PATH is what resolves this; a tool-scoped ' +
          'west cannot be repaired from inside, because it has no pip of its own.'
        : undefined;

    const boardSection = ((): string | undefined => {
      if (!board) return undefined;
      const name = board.split('/')[0]!.split('@')[0]!.trim();
      const rows = idx.all(
        `SELECT r.runner, r.available, r.flash_default, r.debug_default
           FROM board_runner r JOIN board b ON b.id = r.board_id
          WHERE b.name = ? AND r.available = 1 ORDER BY r.runner`,
        name,
      );
      if (rows.length === 0) {
        return section(`Host tools for \`${name}\``, [
          'This board registers no runner in the indexed tree, so there is no host flashing tool to check.',
        ]);
      }
      const lines = rows.map((row) => {
        const roleText = [
          Number(row['flash_default']) === 1 ? '`west flash`' : '',
          Number(row['debug_default']) === 1 ? '`west debug`' : '',
        ]
          .filter(Boolean)
          .join(' and ');
        return `\`${String(row['runner'])}\`${roleText ? ` — used by ${roleText}` : ''}`;
      });
      return joinSections([
        section(`Host tools for \`${name}\``, lines),
        'Each runner wraps a separate host program, and they are not declared in a form this ' +
          'index can check — read `doc/develop/flash_debug/host-tools.rst` with get_doc for what ' +
          'each needs, and run `west flash --context` in a configured build for the authoritative list.',
      ]);
    })();

    const text = joinSections([
      '# Build environment',
      problems.length === 0
        ? canCheckPackages
          ? `Nothing blocking. A build of Zephyr ${zephyrVersion} should start on this machine.`
          : `No blocking problem found, but the package check did not run — see the note below, ` +
            `and treat this as unverified rather than clean.`
        : problems.length === 1
          ? `One thing will stop a build of Zephyr ${zephyrVersion}.`
          : `${problems.length} things will stop a build of Zephyr ${zephyrVersion}.`,
      section(
        'Python interpreters',
        interpreters.map((item) => {
          if (!item.version) return `\`${item.path}\` — not usable${item.error ? ` (${item.error})` : ''}`;
          const state =
            item.missing.length === 0
              ? 'has every required package'
              : `missing ${item.missing.map((name) => `\`${name}\``).join(', ')}`;
          const skipped =
            item.unevaluated.length > 0
              ? ` · not evaluated here: ${item.unevaluated.join(', ')}`
              : '';
          return `\`${item.resolved ?? item.path}\` — Python ${item.version} · ${item.role} · ${state}${skipped}`;
        }),
      ),
      split,
      section('Tooling', [
        `west: ${westVersion ?? 'not on PATH'}`,
        `Node: ${process.version}`,
        `Zephyr SDK: ${sdk.found ? sdk.detail : 'not found'}`,
      ]),
      problems.length > 0 ? section('What to fix', problems) : undefined,
      boardSection,
      canCheckPackages
        ? undefined
        : '_This index records no Python requirements, so no interpreter was checked against one. ' +
          'That happens when the indexed tree has no `scripts/requirements-base.txt` — a partial ' +
          'checkout, usually. Nothing above says the environment is good; it says it was not checked._',
    ]);

    return result(text, {
      zephyrVersion,
      ok: problems.length === 0 && canCheckPackages,
      packagesChecked: canCheckPackages,
      interpreters,
      buildInterpreter: buildInterpreter ?? null,
      west: westVersion,
      node: process.version,
      sdk,
      shipsWestSdk,
      requirements: requirements.length,
      problems,
      ...(board ? { board } : {}),
    });
  },
});
