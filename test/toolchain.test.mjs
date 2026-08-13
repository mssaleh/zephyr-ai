import { ok, strictEqual } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const contract = JSON.parse(readFileSync(join(ROOT, 'scripts', 'toolchain.json'), 'utf8'));
const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

/** The body of one workflow job, from its key to the next job at the same indent. */
function jobBody(name) {
  const start = workflow.indexOf(`\n  ${name}:\n`);
  if (start < 0) return null;
  const rest = workflow.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][a-z0-9-]*:\n/);
  return next < 0 ? rest : rest.slice(0, next + 1);
}

describe('local gate and CI cannot diverge', () => {
  it('declares a CI job for every tier', () => {
    for (const [tier, meta] of Object.entries(contract.tiers)) {
      ok(jobBody(meta.job), `tier ${tier} names job ${meta.job}, which ci.yml does not define`);
    }
  });

  it('provisions every declared tool in the job that runs its tier', () => {
    // This is the check that makes the red line structural. A tool the gate needs
    // but CI never installs fails here, on the contributor's machine, before it can
    // fail on a runner. Tiers are cumulative, so a quick-tier tool must be present
    // in the release job too.
    const order = Object.keys(contract.tiers);
    const missing = [];
    for (const [tier, meta] of Object.entries(contract.tiers)) {
      const body = jobBody(meta.job);
      if (!body) continue;
      const inherited = order.slice(0, order.indexOf(tier) + 1);
      for (const tool of contract.tools) {
        if (!inherited.includes(tool.tier)) continue;
        if (!body.includes(tool.provisionedBy)) {
          missing.push(`${meta.job} never provisions ${tool.command} (via ${tool.provisionedBy})`);
        }
      }
    }
    strictEqual(missing.join('\n'), '', `CI cannot run the gate it is asked to run:\n${missing.join('\n')}`);
  });

  it('runs preflight before every gate, so both sides fail at the same point', () => {
    for (const script of ['check:quick', 'check', 'check:extended']) {
      ok(
        packageJson.scripts[script].startsWith('npm run preflight'),
        `${script} must start with a preflight; otherwise a missing tool surfaces as an exit 127 mid-run`,
      );
    }
  });

  it('keeps an exact pin and its install command in agreement', () => {
    // Preflight quotes `install` verbatim when a version is wrong. If the pin moves
    // and the command does not, it tells the reader to install the version it just
    // rejected, and the only way out is to read this file.
    for (const tool of contract.tools) {
      if (!tool.exact) continue;
      ok(
        !tool.minimum,
        `${tool.command} declares both exact and minimum; they answer different questions`,
      );
      ok(
        tool.install.includes(tool.exact),
        `${tool.command} is pinned to ${tool.exact} but its install command never names it: ${tool.install}`,
      );
    }
  });

  it('never makes a gate conditional on a tool being present', () => {
    // A check that quietly downgrades to a skip is how a green run stops meaning
    // anything. Guard the two validators that shell out to an external binary.
    for (const script of ['validate:plugin', 'validate:marketplace']) {
      const body = packageJson.scripts[script];
      ok(!/command -v|which |\|\| true|; *true/.test(body), `${script} must not tolerate a missing binary: ${body}`);
    }
  });
});
