#!/usr/bin/env node
/**
 * PostToolUse signal for a failed Zephyr build.
 *
 * Agent and skill descriptions name "a build has failed" as a trigger, but
 * nothing otherwise tells the session that it happened. A `west build` is an
 * ordinary Bash call, so without this hook the failure is invisible to the
 * plugin.
 *
 * Two conditions must both hold before this hook speaks: the command has to be a
 * Zephyr build, and the output has to carry a recognised failure signature. A
 * hook that fires on any failed command is noise, and noise gets ignored.
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
  /(?:^|[;&|])\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*(?:west\s+(?:build|twister)\b|cmake\s+--build\b|ninja\b(?!\s+-t\s)|make\b)/;

/**
 * Remove heredoc bodies before deciding whether a command is a build.
 *
 * `cat > run.sh <<'EOF' … west build … EOF` writes a script; it does not build.
 * The separator alternation above matches a newline through `\s*`, so without
 * this the body reads as another command in the same line.
 */
function withoutHeredocs(command) {
  return command.replace(
    /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1[\s\S]*?^\s*\2\s*$/gm,
    (match) => match.replace(/[^\n]/g, ' '),
  );
}

/**
 * Failure signatures, most specific first. The classification decides which
 * lookup the message names.
 *
 * Every pattern here must satisfy two requirements:
 *
 * 1. Match across line breaks. Zephyr's `err()` puts the whole message through
 *    `textwrap.fill(..., 100)`, which discards the line breaks in the source
 *    string and re-wraps at column 100. The break position depends on the length
 *    of the symbol name and its `(defined at …)` location, so it differs per
 *    symbol. A pattern written against one sample's line breaks matches only
 *    that sample.
 * 2. Use upstream's wording, not a paraphrase. `assigned to.*but has no prompt`
 *    matched nothing, because upstream says "is assigned in a configuration
 *    file, but is not directly user-configurable (has no prompt)". The corpus in
 *    `test/fixtures/build-failures/` is the source of truth for these patterns.
 *    A class with no fixture has not been checked.
 *
 * Order matters. Every Kconfig and devicetree failure also prints `CMake Error`,
 * because CMake invoked the script that failed, so the specific classes must be
 * tested before `cmake`.
 */
const FAILURES = [
  {
    // First, because these appear as a CMake error and would otherwise be
    // classified as one and answered with advice about symbols. The file being
    // edited is not wrong: the interpreter CMake selected is missing a package
    // Zephyr needs. This happens when west runs from its own environment and the
    // build resolves python3 from PATH.
    kind: 'environment',
    pattern:
      /Missing \w[\w.-]* dependency|ModuleNotFoundError: No module named|ImportError: No module named|Could NOT find Python3|A suitable Python3 (?:interpreter|version) could not be found/,
    advice:
      'This is a host environment failure, not an error in the source. Call check_environment. It ' +
      'lists every Python interpreter on this machine, which of the packages this Zephyr version ' +
      'requires each one has, and the command that fixes the gap. The usual cause is that west runs ' +
      'from its own environment while CMake resolves python3 from PATH, so indexing works and the ' +
      'build does not.',
  },
  {
    // Before the general devicetree class. A node that binds to nothing is a
    // different error from a property a binding does not declare, and needs
    // different advice.
    kind: 'binding',
    pattern: /lacks binding|has no binding|no binding found|Unable to find binding|binding.*not found for compatible/i,
    advice:
      'A node whose compatible resolves to no binding is dropped, along with every property on it, so ' +
      'the first symptom is usually an undefined DT_ macro elsewhere. Call search_bindings to confirm ' +
      'the compatible exists at this Zephyr version, then get_binding to read what it accepts. If the ' +
      'binding is your own, check that its directory is on DTS_ROOT.',
  },
  {
    kind: 'devicetree',
    pattern:
      /devicetree error|dtc: Error|Error: (?:\S+\.dtsi?|\S+\.overlay):|'[^']+'\s+appears in\s+\S+[\s\S]{0,200}?is not declared in|'[^']+' is not a valid property|node '[^']+' is not/i,
    advice:
      'Devicetree failures are usually a property or compatible that does not exist at this Zephyr ' +
      'version. Call get_binding for the node\'s compatible before editing the overlay. Bindings ' +
      'inherit most of their properties through include: chains, so reading the binding file is not ' +
      'enough.',
  },
  {
    // The promptless message is split across a line break at an unpredictable
    // column, so it is matched as two anchors with bounded text between them
    // rather than as one phrase.
    kind: 'kconfig',
    pattern:
      /is assigned in a configuration file,[\s\S]{0,120}?(?:is not directly[\s\S]{0,40}?user-configurable|has no prompt)|attempt to assign the value[\s\S]{0,80}?to the undefined symbol|Aborting due to Kconfig warnings|Kconfig(?:lib)?[^\n]*\berror\b|is not a valid setting|assigned to[\s\S]{0,80}?but has no prompt/i,
    advice:
      'Call get_kconfig for each symbol the error names before changing prj.conf. A symbol that does ' +
      'not exist in this Zephyr version is ignored without a warning. A promptless symbol cannot be ' +
      'assigned from an application configuration at all; enable the symbol that selects it instead. ' +
      'check_config takes the whole file and returns a verdict per line, which checks every other ' +
      'assignment in the same call.',
  },
  {
    kind: 'board',
    pattern: /board .* not found|Invalid BOARD|No board named|could not find board/i,
    advice:
      'Call search_boards for the board name. Targets are qualified: esp32s3_devkitc/esp32s3/procpu, ' +
      'not esp32s3_devkitc. The qualifier differs per SoC revision and core.',
  },
  {
    // Split from the undefined-reference case. The two share only the linker.
    // Enabling a subsystem fixes one and makes the other worse.
    kind: 'overflow',
    pattern: /region `[^']+' overflowed by|will not fit in region|not enough room for program headers/i,
    advice:
      'The image does not fit the region the linker was given. Check what the region is before trimming ' +
      'code. get_board reports the memory this target actually gets, read from the board devicetree, ' +
      'alongside the Twister flash and RAM figures, which are test metadata and frequently larger. On a ' +
      'target whose defconfig sets CONFIG_XIP=n the image is not executed from internal flash at all, ' +
      'and the limit comes from the devicetree partition it is linked into.',
  },
  {
    kind: 'link',
    pattern: /undefined reference to/i,
    advice:
      'An undefined reference in Zephyr is usually a subsystem that was not enabled, not a missing ' +
      'source file. Use search_kconfig to find the CONFIG_ symbol that provides the function before ' +
      'adding code. An undefined `__device_dts_ord_…` symbol is the devicetree form of the same problem: ' +
      'the node it names is not in the merged tree, usually because an overlay whose filename did not ' +
      'match the qualified build target was skipped without a warning.',
  },
  {
    kind: 'cmake',
    pattern: /CMake Error/,
    advice:
      'Read the first CMake error, not the last. Later ones are usually consequences. Check any symbol, ' +
      'board target, or binding it names against the index before changing the build files.',
  },
  {
    kind: 'compile',
    pattern: /^\s*\S+:\d+:\d+:\s*error:|^FAILED:|ninja: build stopped/m,
    advice:
      'Check any Zephyr API the failing code calls with get_api, including its parameter order and ' +
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
  if (!BUILD_COMMAND.test(withoutHeredocs(command))) return 0;

  const response = payload.tool_response ?? payload.tool_result;
  // A build the user stopped is not a build that failed.
  if (response && typeof response === 'object' && response.interrupted === true) return 0;

  const status = exitStatus(response);
  // Whether a build failed is decided by whether it failed, never by what its
  // output contains. A command that prints a captured build log — `west build …
  // 2>&1 | tee build.log` re-run after a fix, a diff of two logs — carries every
  // signature below while having succeeded. Where the harness reports no status
  // at all, west's own line stands in; a signature alone does not.
  const output = outputOf(response);
  if (status === null ? !WEST_FAILED.test(output) : status === 0) return 0;

  const failure = FAILURES.find((entry) => entry.pattern.test(output));

  const advice =
    failure?.advice ??
    'Check every CONFIG_ symbol, devicetree property, and board target the error names against the ' +
      'index before changing anything.';

  process.stderr.write(
    'The Zephyr build failed.\n\n' +
      `${advice}\n\n` +
      'If the cause is not one line in one file, run the build-triage agent. It reads the build output ' +
      'and the generated artefacts, checks each symbol against the indexed Zephyr version, and reports ' +
      'a root cause.\n',
  );
  return 2;
}

main()
  .then((code) => process.exit(code))
  .catch(() => {
    // An internal fault must not be reported as a build problem.
    process.exit(0);
  });
