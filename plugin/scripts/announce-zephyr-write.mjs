#!/usr/bin/env node
/**
 * PreToolUse pointer for Zephyr configuration writes.
 *
 * The write validator can only react to what has already been authored. By then
 * an invented CONFIG_ symbol or a misspelled compatible is in the file, and the
 * cheap moment to look it up has passed. This hook names the lookup that fits
 * the file about to be written, and the agent whose job that file is, before the
 * write happens.
 *
 * It never blocks. A `permissionDecision` of `"allow"` carries the message on
 * exit 0; exit 2 would block the tool call, and a heuristic must not stop a user
 * writing a file. It speaks once per file per session, and only when an index
 * exists to back the advice — pointing at tools that cannot answer is worse than
 * saying nothing.
 *
 * The bar is the one `check-build-failure` sets: a hook that becomes noise gets
 * ignored along with everything else the plugin says. That is why this covers
 * devicetree and Kconfig only. They are the two error classes with a tool that
 * prevents them outright, and they are where the file's kind alone is enough to
 * know what to say. A pointer on every C file would fire constantly and carry no
 * comparable claim.
 */
import { basename } from 'node:path';

import { firstTimeThisSession, readHookInput, resolveIndexPath } from './index-paths.mjs';

const ADVICE = {
  devicetree: {
    text:
      'Before writing devicetree: confirm every `compatible` with get_binding, which returns the ' +
      'flattened property set. A binding file lists almost nothing itself — most properties arrive ' +
      'through `include:` chains, so reading the file is not the answer. get_binding takes a list ' +
      'of `compatibles`, and check_config takes the whole overlay and returns a verdict per line. ' +
      'For anything beyond a small edit, the devicetree-specialist agent does this end to end.',
  },
  kconfig: {
    text:
      'Before writing Kconfig: confirm every symbol with get_kconfig, which returns its type, ' +
      'prompt, dependencies and defaults — a symbol that exists is not the same as one that is ' +
      'assignable here. get_kconfig takes a list of `names`, and check_config takes the whole ' +
      'file and returns a verdict per line, so grounding it costs one call rather than one per ' +
      'setting.',
  },
};

function fileKind(path) {
  const name = basename(path);
  if (/\.conf$/.test(name) || /_defconfig$/.test(name)) return 'kconfig';
  if (/\.(dts|dtsi|overlay)$/.test(name)) return 'devicetree';
  return null;
}

async function main() {
  const payload = await readHookInput();
  const input = payload.tool_input ?? {};
  const path = input.file_path ?? input.path ?? '';
  const kind = path ? fileKind(path) : null;
  if (!kind) return;

  // No index means the lookups named below cannot answer yet. SessionStart
  // already says so once; repeating it here would be the second voice on the
  // same subject.
  if (!resolveIndexPath()) return;
  if (!firstTimeThisSession(payload.session_id, `about-to-write:${path}`)) return;

  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        additionalContext: ADVICE[kind].text,
      },
    })}\n`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // An internal fault must never stand between the user and their edit.
    process.stderr.write(
      `Zephyr pre-write pointer skipped after an internal error: ${
        error instanceof Error ? error.message : String(error)
      }\n`,
    );
    process.exit(0);
  });
