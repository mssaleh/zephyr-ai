#!/usr/bin/env node
/** Static and catalogue-backed correctness checks for skills and agents. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROOT = resolve(import.meta.dirname, '..', '..');
const SKILLS = join(ROOT, 'plugin', 'skills');
const AGENTS = join(ROOT, 'plugin', 'agents');
const INDEX = resolve(process.env.ZEPHYR_AI_INDEX ?? join(ROOT, 'index', 'zephyr.db'));
const symbolAllowlist = JSON.parse(readFileSync(join(ROOT, 'scripts/quality/fixtures/skill-symbol-allowlist.json'), 'utf8'));
const compatibleAllowlist = JSON.parse(readFileSync(join(ROOT, 'scripts/quality/fixtures/skill-compatible-allowlist.json'), 'utf8'));
const failures = [];
const markdown = [];

/** Every Markdown file a skill owns, entry point first. */
function skillDocuments(directory) {
  const found = [];
  const stack = [directory];
  while (stack.length > 0) {
    for (const entry of readdirSync(stack.pop(), { withFileTypes: true })) {
      const path = join(entry.parentPath, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (entry.name.endsWith('.md')) found.push(path);
    }
  }
  return found.sort();
}

for (const entry of readdirSync(SKILLS, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = join(SKILLS, entry.name);
  const path = join(directory, 'SKILL.md');
  const text = readFileSync(path, 'utf8');
  markdown.push({ path, text });
  const name = text.match(/^name:\s*(\S+)$/m)?.[1];
  if (name !== entry.name) failures.push(`${path}: frontmatter name ${name ?? '<missing>'} differs from directory`);
  if (text.split('\n').length > 500) failures.push(`${path}: exceeds 500 lines`);
  if (!text.includes('Example status: fenced snippets are illustrative')) {
    failures.push(`${path}: fenced examples have no explicit illustrative/verified classification`);
  }
  if ((text.match(/^```/gm)?.length ?? 0) % 2 !== 0) failures.push(`${path}: unbalanced fenced code block`);

  // Supporting documents are read by the model exactly as SKILL.md is, so they
  // are held to the same catalogue-backed checks below. Skipping them would let
  // any claim escape verification simply by being moved into references/.
  for (const supporting of skillDocuments(directory)) {
    if (supporting === path) continue;
    const supportingText = readFileSync(supporting, 'utf8');
    markdown.push({ path: supporting, text: supportingText });
    if ((supportingText.match(/^```/gm)?.length ?? 0) % 2 !== 0) {
      failures.push(`${supporting}: unbalanced fenced code block`);
    }
    if (!/^references\//.test(supporting.slice(directory.length + 1))) {
      failures.push(`${supporting}: skill Markdown belongs in references/`);
    }
  }
}

for (const entry of readdirSync(AGENTS, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const path = join(AGENTS, entry.name);
  const text = readFileSync(path, 'utf8');
  markdown.push({ path, text });
  if (/^model:/m.test(text)) failures.push(`${path}: hard-codes a model instead of inheriting the user's configuration`);
  if (/You (?:do not edit|produce a design document, not code)/.test(text)) {
    const denied = text.match(/^disallowedTools:\s*(.*)$/m)?.[1] ?? '';
    if (!denied.split(/\s*,\s*/).includes('Bash')) failures.push(`${path}: read-only agent can still mutate through Bash`);
  }
}

const allText = markdown.map((file) => file.text).join('\n');
for (const forbidden of [
  'CONFIG_ZTEST_NEW_API',
  'CONFIG_FFF',
  'CONFIG_BT_CTLR=y',
  'CONFIG_BT_DEBUG_LOG',
  'CONFIG_RESET_ON_FATAL_ERROR',
  'does not exist in Zephyr',
  'hardenconfig',
]) {
  if (allText.includes(forbidden)) failures.push(`forbidden obsolete or absolute guidance remains: ${forbidden}`);
}

if (existsSync(INDEX)) {
  const db = new DatabaseSync(INDEX, { readOnly: true });
  const symbols = [...new Set(allText.match(/CONFIG_[A-Z0-9_]+/g) ?? [])].sort();
  const absentSymbols = symbols.filter(
    (symbol) => !db.prepare('SELECT 1 FROM kconfig WHERE name = ? LIMIT 1').get(symbol.slice('CONFIG_'.length)) && !symbolAllowlist[symbol],
  );
  if (absentSymbols.length) failures.push(`unannotated skill Kconfig symbols are absent: ${absentSymbols.join(', ')}`);
  const staleSymbols = Object.keys(symbolAllowlist).filter((symbol) =>
    db.prepare('SELECT 1 FROM kconfig WHERE name = ? LIMIT 1').get(symbol.slice('CONFIG_'.length)),
  );
  if (staleSymbols.length) failures.push(`skill symbol allowlist is stale: ${staleSymbols.join(', ')}`);

  const compatibles = [...new Set(
    [...allText.matchAll(/\bcompatible\s*(?:=|:)\s*["']([^"']+)["']/g)].map((match) => match[1]),
  )].sort();
  const absentCompatibles = compatibles.filter(
    (compatible) => !db.prepare('SELECT 1 FROM dt_binding WHERE compatible = ? LIMIT 1').get(compatible) && !compatibleAllowlist[compatible],
  );
  if (absentCompatibles.length) failures.push(`unannotated skill compatibles are absent: ${absentCompatibles.join(', ')}`);
  db.close();
} else if (process.env.ZEPHYR_AI_RELEASE_TEST === '1') {
  failures.push('release skill validation requires the rebuilt index');
}

const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin/examples/manifest.json'), 'utf8'));
const classes = new Set(manifest.examples.map((example) => example.class));
for (const required of ['generic', 'stm32', 'esp32']) {
  if (!classes.has(required)) failures.push(`verified example matrix is missing ${required}`);
}
for (const example of manifest.examples) {
  if (!example.id || !example.target || !example.path || !example.command) failures.push('example metadata is incomplete');
  if (!existsSync(resolve(ROOT, example.path))) failures.push(`example path is missing: ${example.path}`);
}

process.stdout.write(`${JSON.stringify({ skills: readdirSync(SKILLS).length, agents: readdirSync(AGENTS).length, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
