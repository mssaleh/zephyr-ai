#!/usr/bin/env node
/** Generate the authoritative Doxygen XML consumed by semantic API ingestion. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

try {
const repo = resolve(process.cwd());
const zephyr = resolve(process.env.ZEPHYR_BASE ?? join(repo, '.cache', 'zephyr'));
const output = resolve(process.env.ZEPHYR_AI_DOXYGEN_DIR ?? join(repo, '.cache', 'doxygen'));
if (!existsSync(join(zephyr, 'VERSION'))) {
  throw new Error('The pinned Zephyr tree is missing. Run npm run fetch:zephyr first.');
}
const version = readFileSync(join(zephyr, 'VERSION'), 'utf8');
const semanticVersion = ['VERSION_MAJOR', 'VERSION_MINOR', 'PATCHLEVEL']
  .map((key) => version.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'))?.[1]?.trim())
  .join('.');
mkdirSync(output, { recursive: true });
const config = join(output, 'Doxyfile');
const templatePath = join(zephyr, 'doc', 'zephyr.doxyfile.in');
if (!existsSync(templatePath)) {
  throw new Error(`The selected Zephyr tree has no authoritative Doxygen template: ${templatePath}`);
}
const doxyValue = (value) => `"${value.replaceAll('\\', '/').replaceAll('"', '\\"')}"`;
let configured = readFileSync(templatePath, 'utf8')
  .replaceAll('@ZEPHYR_BASE@', zephyr.replaceAll('\\', '/'))
  .replaceAll('@ZEPHYR_VERSION@', semanticVersion)
  .replaceAll('@DOXY_OUT@', output.replaceAll('\\', '/'))
  .replaceAll('@INCLUDE_CUSTOM_FILE@', '');
const unresolved = [...new Set(configured.match(/@[A-Z][A-Z0-9_]+@/g) ?? [])];
if (unresolved.length > 0) {
  throw new Error(`Unsupported placeholders in Zephyr's Doxygen template: ${unresolved.join(', ')}`);
}
// Preserve the pinned Zephyr parser/alias configuration, then narrow INPUT to
// the product's documented public-header boundary. Last assignments override
// the template's wider documentation build inputs.
configured += `
# zephyr-ai public API overlay
OUTPUT_DIRECTORY = ${doxyValue(output)}
INPUT = ${doxyValue(join(zephyr, 'include', 'zephyr'))}
STRIP_FROM_PATH = ${doxyValue(zephyr)}
EXCLUDE_PATTERNS += */internal/* */arch/*/internal/*
GENERATE_HTML = NO
GENERATE_LATEX = NO
GENERATE_XML = YES
XML_OUTPUT = xml
XML_PROGRAMLISTING = NO
HAVE_DOT = NO
QUIET = YES
WARN_IF_UNDOCUMENTED = NO
WARN_AS_ERROR = NO
`;
writeFileSync(config, configured);
const result = spawnSync('doxygen', [config], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
if (result.error && result.error.code === 'ENOENT') {
  throw new Error(
    'Doxygen is required for semantic public-API ingestion. Install Doxygen and rerun npm run build:api-xml.',
  );
}
if (result.status !== 0) {
  throw new Error(`Doxygen failed:\n${result.stderr.trim().split('\n').slice(-20).join('\n')}`);
}
if (!existsSync(join(output, 'xml', 'index.xml'))) {
  throw new Error('Doxygen completed without producing xml/index.xml.');
}
process.stderr.write(`Doxygen XML ready: ${join(output, 'xml')}\n`);
} catch (error) {
  process.stderr.write(
    `build-doxygen: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
