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

## What we optimise for

Correct Zephyr answers. Gates, fixtures, counts, and process are overhead that
must earn its place — no vanity numbers, no unjustified gates, no tests written
to pass, no hash pinning outside a real integrity boundary, no governance
theatre, plain voice. **[AGENTS.md](AGENTS.md#what-we-optimise-for) has the full
list and it outranks anything older in the repository.**

## The gate

```bash
npm run check:quick  # unit/fixture tests and validation; no Zephyr checkout required
npm run check        # fetch/verify, rebuild index, all real-data tests and quality gates
npm run check:release # Doxygen API, skill compile matrix, copied-artifact clean room
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
- **Bump the shared schema/descriptor versions and rebuild the index** after any
  stored semantic, schema, or parser change.
- **Throw `ToolError`** for anything the model can correct; reserve JSON-RPC
  error codes for protocol faults.
- **PostToolUse hooks must exit 2 with stderr** to reach the model. On exit 0,
  stdout goes only to the debug log.
- **Never commit `index/` or `.cache/`.**
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
non-obvious trade-off — not what the line does. The semantic adapters encode
real Zephyr quirks (Kconfig definition alternatives, recursive binding includes,
Doxygen member identity); when you change one, keep the rationale accurate and
add both a focused fixture and pinned-tree differential evidence.

## Prose

All English here is plain technical English. This covers skills, agents, MCP
tool descriptions, hook messages, comments, and docs.

No theatrical or sensationalist writing: no dramatic framing, suspense,
aphorisms, metaphor, rhetorical repetition, sentences built for rhythm, emphasis
for effect, or em-dash asides carrying tone rather than information. Do not call
a problem expensive, painful, or costly unless quoting a measured number.

State the fact, the cause, and the action. One idea per clause. A short flat
sentence is better than a balanced one. A sentence that belongs in a reference
manual is right; one that belongs in an essay is wrong. The reader is a coding
agent, and decorative prose buries the instruction.
<!-- git-workflow-rule -->
## Git workflow

- **Never create a branch or a pull request without an explicit request.** When asked to commit,
  commit to the branch that is currently checked out — including `main`. Do not branch first as a
  precaution, and do not offer branching as a safer default.
- Commit only when asked. Push only when asked. Each is a separate ask; permission to commit is not
  permission to push.
