#!/usr/bin/env node
/**
 * Verify the declared external toolchain before any gate runs.
 *
 * The point is that a developer machine and a CI runner fail here identically.
 * A gate that runs anyway on a richer machine is worse than one that refuses,
 * because it reports success for a product nobody proved.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const contract = JSON.parse(readFileSync(resolve(ROOT, 'scripts', 'toolchain.json'), 'utf8'));

const requested = process.argv[2];
if (!requested || !contract.tiers[requested]) {
  throw new Error(`Usage: preflight.mjs <${Object.keys(contract.tiers).join('|')}>`);
}

// Tiers are cumulative: the release gate runs everything the quick gate runs.
const order = Object.keys(contract.tiers);
const included = new Set(order.slice(0, order.indexOf(requested) + 1));

function parseVersion(text) {
  return text.match(/(\d+)\.(\d+)\.(\d+)/)?.slice(1, 4).map(Number) ?? null;
}

function olderThan(found, minimum) {
  const want = minimum.split('.').map(Number);
  for (let i = 0; i < want.length; i++) {
    if ((found[i] ?? 0) !== want[i]) return (found[i] ?? 0) < want[i];
  }
  return false;
}

const problems = [];
for (const tool of contract.tools) {
  if (!included.has(tool.tier)) continue;
  const probe = spawnSync(tool.command, tool.versionArgs, { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    problems.push(`${tool.command} is not available (${tool.tier} tier)\n      ${tool.install}`);
    continue;
  }
  if (!tool.minimum) continue;
  const found = parseVersion(`${probe.stdout}${probe.stderr}`);
  if (!found) {
    problems.push(`${tool.command} did not report a parseable version\n      ${tool.install}`);
  } else if (olderThan(found, tool.minimum)) {
    problems.push(
      `${tool.command} is ${found.join('.')}, below the required ${tool.minimum}\n      ${tool.install}`,
    );
  }
}

if (problems.length > 0) {
  process.stderr.write(
    `The ${requested} gate needs tools this environment does not provide:\n\n` +
      problems.map((problem) => `  - ${problem}`).join('\n') +
      '\n\nEvery entry is declared in scripts/toolchain.json. Install them and retry; do not\n' +
      'skip the checks that use them.\n',
  );
  process.exit(1);
}
