# Working on this repository

Guidance for humans and coding agents changing **zephyr-ai** itself. If you are
looking for what the plugin does for its users, read [README.md](README.md); for
why it is shaped this way, read [ARCHITECTURE.md](ARCHITECTURE.md).

## What this project is

Three separable pieces that meet at a SQLite file:

```
packages/ingest  ──builds──▶  index/zephyr.db  ◀──reads──  packages/mcp-server
   (dev-time)                  (SQLite + FTS5)               (runtime, bundled)
                                                                    ▲
                                                            declared by plugin/
```

`ingest` runs at development time and may use dependencies freely.
`mcp-server` is spawned on every Claude Code session, so it is bundled to a
single dependency-free `.mjs` and uses Node's built-in `node:sqlite`.

## Commands

```bash
npm install
npm run fetch:zephyr     # pinned Zephyr into .cache/ (~610 MB, ~15 s) — do this first
npm run build            # bundles BOTH plugin/mcp/*.mjs artefacts
npm run build:index      # index/zephyr.db (~4 s, ~72 MiB)
npm test                 # 78 tests
npm run typecheck
npm run validate:plugin
npm run check:quick      # no pinned tree/index required
npm run check            # fetch, rebuild index, test real inputs, quality, validation
```

`npm run check` is the gate. Nothing is done until it passes.

## Environment facts that bite

- **Node here is not compiled with TypeScript support.** `node foo.ts` fails with
  a syntax error, and `--experimental-strip-types` reports `ERR_NO_TYPESCRIPT`.
  Everything goes through esbuild — which is why each package has a `pretest`
  step that bundles tests into `dist-test/` before `node --test` runs them.
- **`node:sqlite` needs Node ≥ 22.13** and provides FTS5. Do not add a native
  SQLite driver: `better-sqlite3` needs lifecycle scripts, and Claude Code
  installs plugin dependencies with `--ignore-scripts`.
- **The `yaml` package needs a CJS interop banner** when bundled to ESM, or it
  fails at runtime with `Dynamic require of "process" is not supported`. Every
  esbuild invocation that pulls in `ingest` carries
  `--banner:js="import{createRequire}from'node:module';…"`. Copy it when adding a
  new bundle target.

## Tests

| Suite | Location | Needs |
| --- | --- | --- |
| Parsers | `packages/ingest/test/*.test.ts` | Inline fixtures always; real-tree assertions **skip** without `.cache/zephyr` |
| MCP conformance | `packages/mcp-server/test/server.test.ts` | Spawns the **built** bundle; **skips** without `plugin/mcp/zephyr-mcp.mjs` and `index/zephyr.db` |

Both suites may skip real-data assertions in explicit quick mode. The full gate sets
release mode, where a missing pinned tree, built bundle, or index is a failure.

The MCP suite drives a real child process over stdio with a minimal client. It
covers protocol negotiation, notification handling, error taxonomy, and FTS
injection safety alongside the tool behaviour — keep that shape when adding
tests rather than calling handlers directly.

## Invariants

Breaking any of these produces failures that are hard to trace back.

**Committed build artefacts.** `plugin/mcp/zephyr-mcp.mjs` and
`plugin/mcp/zephyr-ingest.mjs` are committed and are what users actually run.
Changing `packages/*/src` without `npm run build` ships stale code that passes
review and fails in the field.

**Schema version.** Bump `SCHEMA_VERSION` in `packages/ingest/src/schema.ts`
whenever the database schema changes; the server warns on mismatch. Rebuild the
index after any schema *or parser* change — parser output is baked in.

**FTS5 tables are external-content and populated once** by the `BUILD_FTS`
statement, with no triggers, because the index is written once and never mutated.
Any column you add to an FTS table must exist **by that name** on its content
table. This is why a chunk carries its page `title` and a binding carries
`prop_names`.

**Query `dt_property_v`, never `dt_property`.** Property descriptions are
interned into `text_pool` — 20.7 MB of text across 119 718 rows is only 0.8 MB of
distinct strings. The view hides the join; the base table has a `description_id`,
not a description.

**`Index.search(sql, query, params, limit)`.** `params` is an array of the
bindings that follow the MATCH placeholder, *including* the LIMIT. The method
runs several progressively broader MATCH expressions and concatenates the
results, de-duplicating on the **first selected column** — so the identity column
must come first in the SELECT. It does not stop at the first variant that returns
rows: `"bluetooth peripheral role"` matches two obscure ISO symbols under strict
AND and would otherwise hide `BT_PERIPHERAL`, whose help text never says
"bluetooth".

**Tool errors are `ToolError`.** Anything the model can correct — a missing
argument, an unknown symbol — throws `ToolError` and comes back as
`isError: true`, per SEP-1303, so the model can retry. Reserve JSON-RPC error
codes for genuine protocol faults such as an unknown tool name.

**PostToolUse hooks must exit 2 with stderr to reach the model.** On exit 0,
stdout goes to the debug log and Claude never sees it. The validator is silent on
success and exits 2 only when it has a real finding.

**Skill `name` frontmatter must equal its directory name.** `claude plugin
validate ./plugin --strict` catches this; run it.

## Where things live

| Path | Contents |
| --- | --- |
| `packages/ingest/src/parsers/` | `kconfig.ts`, `binding.ts`, `rst.ts`, `doxygen.ts` — pure functions, no I/O, heavily tested |
| `packages/ingest/src/sources/` | Filesystem walkers that feed the parsers and shape records |
| `packages/ingest/src/schema.ts` | DDL and the FTS population statement |
| `packages/ingest/src/cli.ts` | Orchestration and all SQL writes |
| `packages/mcp-server/src/protocol.ts` | JSON-RPC/MCP 2025-11-25 over stdio |
| `packages/mcp-server/src/db.ts` | Index resolution, FTS query building, helpers |
| `packages/mcp-server/src/tools/` | One module per domain; `index.ts` assembles them |
| `plugin/skills/*/SKILL.md` | Workflow knowledge, one directory per skill |
| `plugin/agents/*.md` | Subagent definitions |
| `plugin/scripts/*.mjs` | Hook scripts — plain JS, no build step, no dependencies |

## Extending

**A new MCP tool.** Add a `ToolFactory` in `packages/mcp-server/src/tools/`,
register it in `tools/index.ts`, and add conformance coverage. The description is
the highest-leverage text in the project: state *when* to reach for the tool and
what failure it prevents, not just what it returns. Return Markdown as the
primary content and mirror the facts into `structuredContent`. Do not declare an
`outputSchema` — that commits the server to schema validation for a benefit the
Markdown already provides.

**A new indexed source.** Parser in `parsers/` (pure, tested against inline
fixtures *and* the real tree), collector in `sources/`, tables in `schema.ts`,
writes in `cli.ts`, then bump `SCHEMA_VERSION` and rebuild.

**A new skill.** Directory under `plugin/skills/` with `SKILL.md`, frontmatter
`name` matching the directory. The `description` decides whether the skill ever
fires — name the triggering situations and the vocabulary a user would actually
use. Keep the body under ~500 lines and teach the model to query the MCP tools
before writing code; that is what converts the index into correct output.

## Do not

- **Do not commit `index/` or `.cache/`.** They are 72 MB and 610 MB. Both are
  gitignored; keep it that way. The repository is ~1.6 MB without them.
- **Do not add runtime dependencies to `packages/mcp-server`.** The bundle is
  43 KB and starts on every session. `ingest` may use dependencies; the server
  may not. This is also why the MCP protocol layer is hand-written rather than
  taken from `@modelcontextprotocol/sdk`, which pulls in express, hono, jose,
  cors, ajv and zod to cover transports this server does not use.
- **Do not validate devicetree *property* names in the hook.** It needs a real
  devicetree parse to know which node — and therefore which binding — a property
  belongs to. Matching names globally produces false positives on `aliases`,
  `chosen`, and label assignments, and a validator that cries wolf gets ignored.
  Compatibles and `CONFIG_` symbols are validated; properties are left to
  `get_binding`.
- **Do not re-pin Zephyr casually.** `scripts/fetch-zephyr.mjs` verifies the
  checked-out commit against `zephyr.lock.json` and refuses a mismatch. Re-pin
  deliberately with `--update <tag>`, then rebuild the index and re-run the
  real-tree tests, which assert against specific upstream content.
