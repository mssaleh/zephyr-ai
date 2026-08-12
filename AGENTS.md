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

## What we optimise for

The deliverable is correct Zephyr answers. Everything else — gates, fixtures,
counts, process — is overhead that has to earn its place and gets deleted when it
stops earning it.

- **No vanity numbers.** A count written into prose is a liability: it goes stale,
  and keeping it true costs more than it ever returned. Derive a number where it
  is used, or do not state it.
- **Gates must be justified.** Every check answers one question: what real
  breakage does this catch that nothing else catches? A gate that cannot answer
  it is deleted, not kept for symmetry. Overlapping gates are worse than none —
  they double the cost of every change and train people to update fixtures
  without reading them.
- **No tests written to pass.** A test that cannot fail for a real reason is
  noise. One test reproducing an actual defect beats ten asserting the obvious.
  Coverage is not a goal.
- **Digests and seals only where substitution would be silent and harmful.**
  Pinning a hash taxes every future change. Spend that only on a genuine
  integrity boundary, never to look rigorous.
- **No governance theatre.** No mandatory prose fields, sign-offs, or ceremony
  around ordinary edits. Explain the change in the commit message and move on.
- **Plain voice.** Say what the thing does in the fewest words that stay
  accurate. No enterprise register, no grandeur, no words chosen to sound
  serious.

When one of these conflicts with something already in the repository, this
section wins and the older thing goes.

## The local gate is the CI gate

**A gate that passes locally and fails in GitHub Actions is a defect in the gate,
never a quirk of CI.** This is the one failure this project does not tolerate. It
means the gate was measuring the developer's machine instead of the product, and
every green run before it proved nothing. It has happened once: `validate:plugin`
shelled out to `claude`, which was on the author's machine and on no runner, so
the gate was green locally and exited 127 on the first push.

It is prevented by construction, not by remembering:

- Every external binary any gate needs is declared once in
  `scripts/toolchain.json`, with its minimum version, the tier that needs it, and
  how CI installs it.
- `scripts/preflight.mjs` verifies that contract before any `check*` script runs.
  Local and CI hit the same wall at the same point, with the same install command.
- `test/toolchain.test.mjs` fails the gate when a declared tool is not provisioned
  by the workflow job that runs its tier. **You cannot add a dependency on
  something only your machine has — the gate breaks on your machine first.**
- No check is ever conditional on a tool being present. Skipping when something is
  missing is exactly how this divergence gets in, and a skipped check that reports
  success is worse than no check at all.

When CI fails on something that passed locally, reproduce it by taking away what
your machine has. Never by relaxing the CI job.

## Commands

```bash
npm install
npm run fetch:zephyr     # pinned Zephyr into .cache/ — do this first
npm run build            # bundles BOTH plugin/mcp/*.mjs artefacts
npm run build:index      # semantic Kconfig/bindings; local API fallback
npm test                 # fixture, pinned-tree, real stdio, and hook/fetch suites
npm run typecheck
npm run validate:plugin
npm run check:quick      # no pinned tree/index required
npm run check            # fetch, rebuild index, test real inputs, quality, validation
npm run check:release    # Doxygen API, skill compile matrix, copied-artifact clean room
```

`npm run check` is the gate. Nothing is done until it passes.

## Environment facts that bite

- **Node here is not compiled with TypeScript support.** `node foo.ts` fails with
  a syntax error, and `--experimental-strip-types` reports `ERR_NO_TYPESCRIPT`.
  Everything goes through esbuild — which is why each package has a `pretest`
  step that bundles tests into `dist-test/` before `node --test` runs them.
- **`node:sqlite` needs Node ≥ 24** and provides FTS5. Do not add a native
  SQLite driver: `better-sqlite3` needs lifecycle scripts, and Claude Code
  installs plugin dependencies with `--ignore-scripts`.
- **The `yaml` package needs a CJS interop banner** when bundled to ESM, or it
  fails at runtime with `Dynamic require of "process" is not supported`. Every
  esbuild invocation that pulls in `ingest` carries
  `--banner:js="import{createRequire}from'node:module';…"`. Copy it when adding a
  new bundle target.
- **Ingestion requires Python 3.12+, PyYAML, and the selected tree's Kconfiglib
  and python-devicetree.** The preflight prefers the west interpreter and fails
  before scanning. Do not add a silent handwritten-parser fallback.

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

**Schema version.** Bump `INDEX_SCHEMA_VERSION` in
`packages/shared/index-descriptor.ts` whenever the database schema or stored
semantics change; `schema.ts` imports it and the server fails closed on mismatch. Rebuild the
index after any schema *or parser* change — parser output is baked in.

**FTS5 tables are external-content and populated once** by the `BUILD_FTS`
statement, with no triggers, because the index is written once and never mutated.
Any column you add to an FTS table must exist **by that name** on its content
table. This is why a chunk carries its page `title` and a binding carries
`prop_names`.

**Query `dt_property_v`, never `dt_property`.** Property descriptions are
interned into `text_pool`. The view hides the join; the base table has a
`description_id`, not a description.

**Descriptor identity is semantic.** Commit alone is insufficient. The
descriptor fingerprints tracked diffs, untracked source, west manifest, and module
state. Keep private paths out of normal MCP projections and bump descriptor/builder
versions when its contract changes.

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
| `packages/ingest/src/adapters/` | Embedded Python exporters for target-tree Kconfiglib, edtlib, and Doxygen XML |
| `packages/ingest/src/parsers/` | RST and conservative fallback/fixture parsers; pure functions, no I/O |
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

- **Do not commit `index/` or `.cache/`.** They are large reproducible inputs and
  outputs. Both are gitignored; keep it that way.
- **Do not add runtime dependencies to `packages/mcp-server`.** The bundle is
  size-gated and starts on every session. `ingest` may use dependencies; the server
  may not. This is also why the MCP protocol layer is hand-written rather than
  taken from `@modelcontextprotocol/sdk`, which pulls in express, hono, jose,
  cors, ajv and zod to cover transports this server does not use.
- **Do not validate devicetree *property* names in the hook.** It needs a real
  devicetree parse to know which node — and therefore which binding — a property
  belongs to. Matching names globally produces false positives on `aliases`,
  `chosen`, and label assignments, and a validator that cries wolf gets ignored.
  Compatible and `CONFIG_` existence is a hard error only when descriptor coverage
  proves the relevant context complete; properties are left to `get_binding`.
- **Do not re-pin Zephyr casually.** `scripts/fetch-zephyr.mjs` verifies the
  checked-out commit against `zephyr.lock.json` and refuses a mismatch. Re-pin
  deliberately with `--update <tag>`, then rebuild the index and re-run the
  real-tree tests, which assert against specific upstream content.
