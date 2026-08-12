# CLAUDE.md

**[AGENTS.md](AGENTS.md) is the source of truth for working on this repository.**
Read it before making changes — it covers the commands, the invariants, where
things live, and how to extend each piece. This file carries only the summary and
the Claude Code specifics.

## What this is

A Claude Code plugin that gives Claude a version-exact Zephyr RTOS reference.
Three pieces meeting at a SQLite file: `packages/ingest` builds `index/zephyr.db`
from a Zephyr checkout, `packages/mcp-server` serves it over MCP, and `plugin/`
wraps both with skills, agents, and hooks.

## The gate

```bash
npm run check:quick  # unit/fixture tests and validation; no Zephyr checkout required
npm run check        # fetch/verify, rebuild index, all real-data tests and quality gates
```

Run the full gate before reporting work complete. It recreates missing release inputs
and sets release-test mode, in which missing real-tree or stdio inputs are failures.
Use `check:quick` only for feedback while those large inputs are unavailable.

## Invariants worth holding in context

Full list and reasoning in AGENTS.md. These are the ones that cause silent
breakage:

- **`plugin/mcp/*.mjs` are committed artefacts.** Editing `packages/*/src`
  without `npm run build` ships stale code.
- **Node here has no TypeScript support.** `node foo.ts` fails; everything goes
  through esbuild, including tests.
- **Query `dt_property_v`, not `dt_property`** — descriptions are interned in
  `text_pool`.
- **Bump `SCHEMA_VERSION` and rebuild the index** after any schema *or parser*
  change.
- **Throw `ToolError`** for anything the model can correct; reserve JSON-RPC
  error codes for protocol faults.
- **PostToolUse hooks must exit 2 with stderr** to reach the model. On exit 0,
  stdout goes only to the debug log.
- **Never commit `index/` (72 MB) or `.cache/` (610 MB).**
- **No runtime dependencies in `packages/mcp-server`** — the bundle must stay
  dependency-free and fast to start.

## Testing the plugin in Claude Code

Load it without installing, and point it at a locally built index:

```bash
npm run build && npm run build:index
ZEPHYR_AI_INDEX="$PWD/index/zephyr.db" claude --plugin-dir "$PWD/plugin"
```

The server's tools appear as `mcp__plugin_zephyr-ai_zephyr__<tool>` — that scoped
form is what hook matchers and `--allowedTools` need; the bare name will not
match.

For a non-interactive end-to-end check:

```bash
ZEPHYR_AI_INDEX="$PWD/index/zephyr.db" claude --plugin-dir "$PWD/plugin" \
  -p "Call index_status and report the Zephyr version." \
  --allowedTools "mcp__plugin_zephyr-ai_zephyr__index_status"
```

Skill edits take effect immediately. Changes to `hooks/`, `.mcp.json`, and
`agents/` need `/reload-plugins` or a restart.

## Style

Match the surrounding code: TypeScript with `strict` and
`noUncheckedIndexedAccess`, no `any`, explicit return types on exported
functions. Comments explain *why* — a domain constraint, a spec requirement, a
non-obvious trade-off — not what the line does. Several parsers encode real
Zephyr quirks (devicetree include flattening, Kconfig multi-definition
aggregation, Doxygen group nesting); when you change one, keep the comment that
explains the quirk accurate, and add a test that pins the behaviour against the
real tree rather than only a fixture.
