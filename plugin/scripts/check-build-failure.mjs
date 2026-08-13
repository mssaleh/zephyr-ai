#!/usr/bin/env node
/**
 * PostToolUse signal for a failed Zephyr build.
 *
 * Agent and skill descriptions already name "a build has failed" as their
 * trigger, and it is not enough: nothing tells the session the event happened.
 * A `west build` is an ordinary Bash call, so without this hook a failure is
 * invisible to the plugin and `build-triage` is never reached for.
 *
 * The bar for speaking is deliberately high. Two independent conditions must
 * hold — the command has to be a Zephyr build, and the output has to carry a
 * recognised failure signature — because a hook that fires on any failed
 * command is noise, and a hook that is noise gets ignored along with everything
 * else this plugin says.
 */
import { readHookInput } from './index-paths.mjs';

/**
 * Commands that build Zephyr. `west flash` and friends are not builds.
 *
 * The build has to start a command, not merely appear in one, so that
 * `grep "west build" notes.txt` returning non-zero stays silent. Leading
 * whitespace and environment-variable prefixes are still the same command.
 */
const BUILD_COMMAND =
  /(?:^|[;&|])\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:west\s+build\b|cmake\s+--build\b|ninja\b(?!\s+-t\s))/;

/**
 * Failure signatures, most specific first. The classification decides which
 * lookup to name, which is what makes the message worth reading twice.
 */
const FAILURES = [
  {
    // First, because these surface as a CMake error and would otherwise be
    // classified as one and answered with advice about symbols. Nothing in the
    // file the user is editing is wrong: the interpreter CMake selected is
    // missing a package Zephyr needs, which happens whenever west lives in an
    // environment of its own and the build resolves python3 from PATH instead.
    kind: 'environment',
    pattern:
      /Missing \w[\w.-]* dependency|ModuleNotFoundError: No module named|ImportError: No module named|Could NOT find Python3|A suitable Python3 (?:interpreter|version) could not be found/,
    advice:
      'This is a host environment failure, not a mistake in the source. Call check_environment: it ' +
      'reports every Python interpreter on this machine and which of the packages this Zephyr ' +
      'version requires each one carries, and names the command that fixes the gap. The usual cause ' +
      'is that west runs from its own environment while CMake resolves python3 from PATH, so the ' +
      'index builds cleanly and the build does not.',
  },
  {
    kind: 'devicetree',
    pattern: /devicetree error|dtc: Error|Error: (?:\S+\.dtsi?|\S+\.overlay):|'[^']+' is not a valid property|node '[^']+' is not/i,
    advice:
      'Devicetree failures are usually an invented property or a compatible that does not exist at this ' +
      'Zephyr version. Call get_binding for the node\'s compatible before editing the overlay — bindings ' +
      'inherit most of their properties through include: chains, so reading the binding file is not enough.',
  },
  {
    kind: 'kconfig',
    pattern: /Kconfig(?:lib)?[^\n]*\berror\b|error: Aborting due to Kconfig warnings|is not a valid setting|assigned to.*but has no prompt/i,
    advice:
      'Call get_kconfig for each symbol the error names before changing prj.conf. A symbol that does not ' +
      'exist in this Zephyr version is silently ignored rather than reported, and a promptless symbol ' +
      'cannot be assigned from an application configuration at all.',
  },
  {
    kind: 'board',
    pattern: /board .* not found|Invalid BOARD|No board named|could not find board/i,
    advice:
      'Call search_boards for the board name. Targets are qualified — esp32s3_devkitc/esp32s3/procpu, ' +
      'not esp32s3_devkitc — and the qualifier differs per SoC revision and core.',
  },
  {
    kind: 'link',
    pattern: /undefined reference to|region `[^']+' overflowed by|will not fit in region/i,
    advice:
      'An undefined reference in Zephyr is usually a subsystem that was never enabled rather than a ' +
      'missing source file. Search for the CONFIG_ symbol that provides the function with search_kconfig ' +
      'before adding code.',
  },
  {
    kind: 'cmake',
    pattern: /CMake Error/,
    advice:
      'Read the first CMake error, not the last: later ones are usually consequences. Verify any symbol, ' +
      'board target, or binding it names against the index before changing the build files.',
  },
  {
    kind: 'compile',
    pattern: /^\s*\S+:\d+:\d+:\s*error:|^FAILED:|ninja: build stopped/m,
    advice:
      'Verify any Zephyr API the failing code calls with get_api, including its parameter order and ' +
      'return contract, before rewriting it.',
  },
];

/** West wraps the real failure, so its own line is the most reliable marker. */
const WEST_FAILED = /FATAL ERROR: command exited with status \d+|ERROR: command exited with status \d+/;

function commandOf(input) {
  const value = input?.command ?? input?.cmd;
  return typeof value === 'string' ? value : '';
}

/**
 * Concatenate whatever the harness reports for the call.
 *
 * The Bash result shape has varied across versions, so every plausible carrier
 * is read rather than depending on one field being present.
 */
function outputOf(response) {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';
  return ['stdout', 'stderr', 'output', 'content', 'error', 'result']
    .map((key) => (typeof response[key] === 'string' ? response[key] : ''))
    .join('\n');
}

/** An explicit non-zero status, or null when the harness reported none. */
function exitStatus(response) {
  if (!response || typeof response !== 'object') return null;
  for (const key of ['exit_code', 'exitCode', 'returncode', 'returnCode', 'status', 'code']) {
    if (typeof response[key] === 'number') return response[key];
  }
  return null;
}

async function main() {
  const payload = await readHookInput();
  const command = commandOf(payload.tool_input ?? {});
  if (!BUILD_COMMAND.test(command)) return 0;

  const response = payload.tool_response ?? payload.tool_result;
  // A build the user stopped is not a build that failed.
  if (response && typeof response === 'object' && response.interrupted === true) return 0;

  const status = exitStatus(response);
  if (status === 0) return 0;

  const output = outputOf(response);
  const failure = FAILURES.find((entry) => entry.pattern.test(output));
  // An explicit non-zero status is enough on its own; otherwise a recognised
  // signature has to stand in for it.
  if (!failure && !(status !== null && status !== 0) && !WEST_FAILED.test(output)) return 0;

  const advice =
    failure?.advice ??
    'Verify every CONFIG_ symbol, devicetree property, and board target the error names against the ' +
      'index before changing anything.';

  process.stderr.write(
    'The Zephyr build failed. Run the build-triage agent before editing: it reads the build output and ' +
      'the generated artefacts, verifies each symbol against the indexed Zephyr version, and reports a ' +
      `root cause rather than a guess.\n\n${advice}\n`,
  );
  return 2;
}

main()
  .then((code) => process.exit(code))
  .catch(() => {
    // An internal fault must not be reported as a build problem.
    process.exit(0);
  });
