# Zephyr AI audit remediation and release-readiness plan

Created: 2026-08-12
Revised: 2026-08-12 (independent re-verification pass — see §3.6)
Scope: ingestion, database schema, MCP runtime, Claude Code plugin, skills, agents,
hooks, distribution, and release engineering
Release decision: **no-go for public production release** (unchanged after re-verification)

## 1. Purpose

This document is the durable handoff from the initial comprehensive repository
audit. It records the evidence, defects, design decisions, implementation work,
tests, and release criteria needed to turn the current prototype into a reliable
Zephyr firmware-development plugin.

Future work sessions should not need access to the original audit conversation.
They should begin here, verify the baseline has not materially changed, and select the
first incomplete work package whose declared technical dependencies are satisfied.

This is both a remediation plan and a correction to claims currently made in
[`README.md`](../README.md), [`ARCHITECTURE.md`](../ARCHITECTURE.md),
[`AGENTS.md`](../AGENTS.md), and [`CLAUDE.md`](../CLAUDE.md). A claim is not considered
fixed merely because its wording changes: whenever practical it must become an
executable acceptance test.

**Every quantitative claim in this document must name the script that produces it.**
Hardcoded counts without a reproduction method are not gates; they rot silently and
cannot be re-derived by a future session. Where the original audit reported a number
that a different measurement method reproduces differently, both are recorded and the
canonical measurement is named. This rule was added in the revision pass after several
audit counts proved method-dependent (§3.6).

## 2. Product objective

The target product is a Claude Code plugin that helps implement production-quality
Zephyr firmware, especially on STM32 and ESP32, by combining:

1. A version- and workspace-exact structured knowledge index.
2. An MCP 2025-11-25 server that exposes narrow search/get tools over that index.
3. Skills that encode safe Zephyr workflows and consult the MCP tools before
   generating firmware.
4. Focused agents for architecture, build triage, devicetree, and firmware review.
5. Conservative hooks that catch proven errors without rejecting valid Zephyr code.
6. A reproducible installation and release process.

The central product invariant is:

> Results presented as exact must be derived from the user's actual Zephyr tree and
> build context, or must be explicitly labeled as context-independent catalogue
> information. An index miss must never be presented as proof that valid Zephyr
> syntax does not exist unless the relevant corpus is known to be complete.

The re-verification pass found that this invariant is violated today in the two places
where a violation does the most damage: the PostToolUse hook and the `get_*` tool
miss-path prose both assert nonexistence in absolute terms. Restoring the invariant does
not require any semantic rewrite and is therefore promoted to the first work package
(§7, WP-A).

## 3. Audit baseline

### 3.1 Environment and source baseline

The audit was performed against, and re-verified on:

- Zephyr tag `v4.4.2`.
- Zephyr commit `dccb09599635bdff17633fa7e9dab014b91dce90`.
- A clean pinned checkout under `.cache/zephyr`.
- Node.js `22.22.1`.
- npm `9.2.0`.
- Claude Code `2.1.228`.

At audit completion, and still at re-verification, the local `zephyr-ai` repository had
**no commits** and every project file was untracked (`git log` reports
`your current branch 'main' does not have any commits yet`; 15 untracked top-level
entries). That state prevents provenance checks and means future implementers must
establish a Git baseline before claiming that generated artifacts are committed or
reproducible across commits.

### 3.2 Verification performed

The audit included:

- Full source, manifest, skill, agent, and hook inspection.
- Direct SQL inspection of the generated database.
- Differential checks against the pinned Zephyr source tree.
- Adversarial MCP calls over real stdio.
- Hook execution against valid and invalid Zephyr snippets.
- A clean index build into a temporary location.
- SQLite integrity, foreign-key, and FTS/content-count checks.
- Rebuilding both committed plugin bundles and comparing their hashes.
- Strict plugin and root marketplace validation.
- Comparison with the MCP 2025-11-25, JSON-RPC 2.0, Claude Code plugin, Claude
  hooks, Claude subagent, Agent Skills, and Zephyr specifications.

### 3.3 Passing mechanical baseline

`npm run check` passes in an unrestricted process environment (re-confirmed, exit 0):

- TypeScript typechecking passed.
- Both plugin bundles built successfully.
- 52 ingestion tests passed.
- 26 real stdio MCP tests passed, `# skipped 0`.
- Strict plugin validation passed.
- Root marketplace validation passed when run separately (`claude plugin validate .
  --strict` → `✔ Validation passed`).
- Rebuilt plugin bundles were byte-identical to the existing files.
- `npm audit --offline` reported no vulnerabilities in the installed dependency
  graph.

The clean index took approximately four seconds, was approximately 72 MiB
(75,157,504 bytes), passed `PRAGMA integrity_check`, and had zero foreign-key
violations.

**The green run is not evidence of correctness.** `npm run check` is literally
`typecheck && build && test && validate:plugin`. It does not run `fetch:zephyr` and does
not run `build:index`. It passed above only because this working tree already had both
inputs. See REL-001.

### 3.4 Indexed baseline counts

Re-verified by direct SQL against `index/zephyr.db`; every count below matched the
original audit exactly.

| Corpus | Audited count | Re-verified | `meta` table |
| --- | ---: | ---: | ---: |
| Documentation pages | 2,080 | 2,080 | 2,080 |
| Documentation chunks | 15,842 | 15,842 | 15,842 |
| Kconfig symbols | 19,796 | 19,796 | 19,796 |
| Kconfig source files | 6,547 | not re-measured | — |
| Devicetree bindings | 3,442 | 3,442 | 3,442 |
| Devicetree properties | 119,718 | 119,718 | 119,718 |
| Devicetree fragments | 283 | not re-measured | — |
| Boards | 1,014 | 1,014 | 1,014 |
| Board targets | 1,425 | 1,425 | 1,425 |
| SoC records | 1,475 | 1,475 | 1,475 |
| Samples | 610 | 610 | 610 |
| API symbols | 26,148 | 26,148 | 26,148 |
| API groups | 1,006 | 1,006 | — |

These counts prove repeatability, not correctness. Several corpus-level defects below
show that a stable database can still be semantically incomplete or polluted.

### 3.5 Baseline drift check for future sessions

Before selecting work, confirm the baseline still holds:

```bash
git log --oneline -1                       # expect: a WP-A baseline commit, or none
node -e "..." # counts per §3.4 via scripts/quality/counts.mjs (WP-A deliverable)
npm run check                              # expect exit 0 until WP-A tightens it
```

If any §3.4 count differs and no work package explains it, stop and re-audit: an
unexplained count change means the corpus moved without a recorded cause, which is
itself the condition REL-001 and §8.2 exist to prevent.

### 3.6 Independent re-verification (revision pass)

Every finding below was re-tested against the same pinned tree and database. Results:

**Reproduced exactly as reported** — KCF-001 (partially, see below), KCF-003, KCF-005,
KCF-006, KCF-007, IDX-001, IDX-003, IDX-004, IDX-005, IDX-006, DTS-002, DTS-006,
DOC-001, DOC-002, DOC-003, DOC-004, API-001, API-002, BRD-001, BRD-003, SMP-002,
SMP-003, SMP-004, MCP-001 through MCP-006, SKL-001, SKL-002, SKL-003, SKL-006,
HOK-001, HOK-002, HOK-003, HOK-004, HOK-006, HOK-007, REL-001, REL-002, REL-004,
REL-005.

Selected reproductions worth recording verbatim, because they are the highest-severity
user-visible failures:

```
$ get_kconfig SENSOR_LOG_LEVEL_DBG
  → "CONFIG_SENSOR_LOG_LEVEL_DBG does not exist in Zephyr 4.4.2.
     Did you mean: CONFIG_LOG_DBG_COLOR_BLUE, CONFIG_LOG_INFO_COLOR_..."
  (the symbol is generated by Zephyr's logging Kconfig template and IS assigned in the
   pinned tree's own samples; the suggestions are unrelated)

$ PostToolUse hook, prj.conf containing CONFIG_SENSOR_LOG_LEVEL_DBG=y
  → exit 2, "CONFIG_SENSOR_LOG_LEVEL_DBG does not exist in Zephyr 4.4.2."

$ PostToolUse hook, overlay containing compatible = "microchip,mpfs-mailbox"
  → exit 2, "no binding for compatible ... Closest: microchip,tc-g1, microchip,adc-g1"
  (the binding exists at dts/bindings/mbox/microchip,mpfs-mailbox.yaml and the
   compatible is used by dts/riscv/microchip/mpfs.dtsi:156)

$ tools/list sent before initialize
  → full tool list returned, no error

$ {"jsonrpc":"2.0","id":3}          → -32601 "Method not found: undefined"
$ {not json                          → id 0 (must be null), -32700
$ get_doc {path: <valid page>, max_chars: 1}        → accepted, schema minimum is 1000
$ get_kconfig {name:"BT_PERIPHERAL", bogus_property:"x"} → accepted despite
                                                            additionalProperties:false
$ search_kconfig {query:"gpio", limit:"3"}          → string coerced to integer
$ get_doc {path:"https://docs.zephyrproject.org/4.4.2/kernel/index.html"} → found:false
```

**Corrected during re-verification.** Four claims were materially inaccurate and are
fixed inline in §5. They are listed here because they change prioritisation:

1. **DTS-001 scope was overstated (severity Critical → High).** The audit framed
   "supported compatible schema forms are omitted" as a class defect. Measured against
   the pinned tree: 3,725 binding YAML files declare 3,348 distinct compatibles, of
   which **exactly one** uses `properties.compatible.const`
   (`microchip,mpfs-mailbox`) and **zero** use `properties.compatible.enum`. The
   present blast radius is one binding, not a class. The finding survives — a loader
   that silently drops what it does not recognise will drop the next such binding too,
   and the tree does use this one — but it is no longer a Critical-tier corpus hole and
   must not outrank DTS-002.

2. **The proposed devicetree coverage gate was unachievable as written.** The plan
   required that "all bindings used by the pinned DTS/DTSI corpus resolve to indexed
   compatibles or a checked-in exclusion". Measured: the DTS/DTSI/overlay corpus uses
   4,200 distinct compatibles, of which **1,693 have no binding file anywhere in the
   tree**. That is overwhelmingly legitimate — board and SoC root-node compatibles
   (`adafruit,feather_esp32s3`, `aaeon,up_squared`, …) are matched by name alone and
   have no YAML. Enforcing the gate literally would demand a ~1,700-entry exclusion
   list, which would be abandoned or rubber-stamped. The gate is restated in §5.3 and
   §8.2 with the correct denominator.

3. **KCF-001's recall number is method-dependent.** The audit reported 161 of 2,297
   distinct sample/snippet `CONFIG_` assignments absent from the index. Re-measuring
   over `samples/**/*.conf` + `snippets/**/*.conf` (1,776 files) with the matcher
   `^\s*CONFIG_([A-Za-z0-9_]+)\s*=` gives **139 of 2,202 absent**. Both measurements
   agree on the finding and on its dominant cause — the missing set is overwhelmingly
   generated per-module logging symbols (`SENSOR_LOG_LEVEL_DBG`, `WIFI_LOG_LEVEL_DBG`,
   `NET_TCP_LOG_LEVEL_DBG`, …). The gate must ship as a script, not a number.

4. **KCF-002's count is method-dependent** (456 reported; 258 under a stricter
   path filter that also excludes `snippets/`, `share/`, and `modules/`). The defect
   class — application-local symbols presented as global catalogue entries — is
   confirmed; `defined_in` for these rows points only at `samples/**/Kconfig`.

Minor corrections: `configdefault` occurs on 428 lines matching `^\s*configdefault`
(440 unanchored), not 431. 87 boards have a null `doc_path`, of which the audit's 74
are the subset that have some other RST file. The binding file
`microchip,mpfs-mailbox.yaml` lives under `dts/bindings/mbox/`, not `mailbox/`.

**Not re-verified** (accepted from the audit as stated, flagged for the implementer to
confirm before relying on them): the 6,547 Kconfig source-file count, the 283
devicetree fragments, DOC-002's directive counts (569 `include::` / 66
`literalinclude::` / 9 `only::`), API-003's 3,938 header-guard heuristic (the audit
already labels this an indicator, not a count), API-004, API-005, SMP-001's 214/193
`common:` split, and DTS-007's constraint inventory.

**New findings added in the revision pass**: KCF-008, DTS-008, MCP-007, HOK-008,
HOK-009, REL-007, ING-001. All are marked *(new)* in §5.

## 4. Architecture assessment

### 4.1 Keep these decisions

The following foundations are sound and should be retained:

- Separate dev-time ingestion from the per-session runtime server.
- Use SQLite and external-content FTS5 tables.
- Keep the runtime server dependency-free and bundled as one `.mjs` file.
- Use Node's built-in `node:sqlite` and require Node 22.13 or newer.
- Use stdio only and keep stdout protocol-clean.
- Expose narrow search/get tool pairs plus `index_status`.
- Return Markdown and equivalent `structuredContent`.
- Parameterize SQL and keep the existing FTS injection protections.
- Keep skills short, trigger-oriented, and tool-first.
- Keep build artifacts reproducible and included in release verification.
- Keep string interning for large repeated text (`text_pool` and the `dt_property_v`
  view). It reduced the index from 86.1 MB to 65.7 MB and the same technique must
  survive the schema-v2 rewrites in WP-2 and WP-3, which will add expression trees and
  recursive child-binding rows to the two largest tables.

### 4.2 Change these decisions

The following current assumptions are not safe:

- Hand-parsing Kconfig files cannot provide exact Kconfig semantics.
- Regular-expression reconstruction of Doxygen C declarations is not an adequate
  public API index.
- A single global `workspace.db` cannot represent multiple projects safely.
- A semantic Zephyr version is not a sufficient workspace identity.
- Hard edit-time validation cannot depend on a best-effort static catalogue.
- Silently skipping unreadable source material is incompatible with completeness
  claims.
- A green test command that silently skips its integration inputs is not a release
  gate.

### 4.3 New decision required: the ingest-time toolchain contract *(revision pass)*

WP-2 and WP-3 both resolve to "call Zephyr's own Python tooling". That is the right
call for correctness, and the plan's justification is sound — ingest is dev-time and
may take dependencies. But the plan does not follow the consequence through, and it is
load-bearing:

**`plugin/mcp/zephyr-ingest.mjs` is a committed artifact that the `zephyr-index` skill
runs on the end user's machine.** Today it is pure Node and needs nothing else. After
WP-2/WP-3 it would need Python 3, the target tree's `scripts/kconfig/kconfiglib.py`,
`scripts/dts/python-devicetree`, and PyYAML. A user's index build then fails in a new
way, on their machine, at first use.

This is survivable — anyone with a Zephyr workspace already has west, which is Python,
and Zephyr ships both libraries in-tree — but it must be an explicit, tested contract
rather than an accident:

1. Declare the contract: index building requires Python ≥ 3.10 and a Zephyr tree
   containing `scripts/kconfig/kconfiglib.py` and `scripts/dts/python-devicetree`.
   Prefer the tree's own copies over any pip-installed version, so semantics match the
   indexed release exactly.
2. Detect it before doing work. The CLI must probe the interpreter and both libraries
   and fail with one actionable message naming what is missing and how to get it — not
   a Python traceback.
3. Degrade honestly. If the toolchain is absent, the CLI must refuse to build rather
   than silently falling back to the legacy regex parsers; a half-semantic index whose
   provenance says "semantic" is worse than no index. Record the resolver mode in
   `IndexDescriptor.builderVersion`.
4. Prefer the user's west-managed virtualenv when one is discoverable.
5. Keep the runtime MCP server unchanged: zero dependencies, Node only. The Python
   contract is ingest-only and must never leak into the server bundle or the hooks.

Acceptance: a container with Node but no Python must produce the actionable error, and
a container with a west workspace must build successfully without manual configuration.

### 4.4 Ecosystem comparison retained from the original product brief

The audit did not identify an obvious mature, directly comparable Claude Code plugin
that combines a Zephyr semantic index, MCP tools, skills, agents, and hooks. This was
not an exhaustive proof that no such project exists. Before introducing a new public
tool or knowledge-pack interface, search current Zephyr, STM32, ESP32, MCP, and Claude
Code ecosystems again and record any source-compatible implementation worth reusing.

The strongest confirmed comparison was the Context7 Claude Code pattern: a plugin
bundles MCP grounding with auto-triggering workflow knowledge and a focused lookup
agent. Preserve that separation while keeping Zephyr's structured Kconfig,
devicetree, board, and API facts local and version-exact. Generic framework plugins
can inform invocation and progressive-disclosure design, but cannot substitute for
Zephyr semantic tooling.

## 5. Severity-ranked finding register

The identifiers in this section are stable. Regression tests and relevant code
comments should reference them. Findings added during the revision pass are marked
*(new)*; findings whose severity or scope changed are marked *(revised)*.

### 5.1 Critical: Kconfig correctness

#### KCF-001 — Raw file parsing does not evaluate Zephyr Kconfig

Audited files:

- `packages/ingest/src/sources/kconfig.ts`
- `packages/ingest/src/parsers/kconfig.ts`
- `plugin/scripts/validate-zephyr-edit.mjs`

Evidence (re-verified):

- The collector walks independent `Kconfig*` files.
- `source` and preprocessing directives are not evaluated.
- The index contains **45** literal template identifiers, confirmed by
  `SELECT COUNT(*) FROM kconfig WHERE name LIKE '%$(%'`. Examples:
  `$(module)_LOG_LEVEL_DBG`, `$(module)_DEVICE_COUNT`,
  `$(cur-level)_LVL_INTR_0$(aggregator)_OFFSET`.
- Valid generated `CONFIG_SENSOR_LOG_LEVEL_DBG` is absent; only `SENSOR_LOG_LEVEL` is
  indexed.
- The PostToolUse hook rejects that valid symbol even though the pinned Zephyr tree
  uses it in a sample `prj.conf` (reproduced, §3.6).
- Recall measurement: of 2,202 distinct `CONFIG_` assignments across 1,776
  `samples/**/*.conf` and `snippets/**/*.conf` files, **139 are absent** from the
  index. The absent set is dominated by generated per-module logging symbols. Some
  residual entries are external image or module symbols; the generated sensor logging
  symbol proves the set also contains core false negatives.

Required outcome: build the catalogue through Zephyr's Kconfiglib semantics, including
preprocessing and the real root source graph. Ship the recall measurement as
`scripts/quality/kconfig-recall.mjs` with a checked-in allowlist, so the gate is
reproducible rather than a number in a document.

#### KCF-002 — Unreachable application-local symbols are presented globally

Symbols defined exclusively under `samples/` are indexed into the same flat catalogue as
core symbols; their `defined_in` points only at `samples/**/Kconfig`. These symbols are
normally visible only when an application's own Kconfig sources them. The audit counted
456; a stricter path filter counts 258 (§3.6). Ship the measurement, not the number.

Required outcome: distinguish the canonical Zephyr catalogue from application-local
or module-local catalogues and record the source graph/context in which each symbol is
reachable.

#### KCF-003 — Menu and choice dependency semantics are lost

Dependencies attached to enclosing menus and choices are not reliably propagated.
Choice membership is inferred by comparing symbol names with named choices rather than
recording actual membership; re-verification found rows whose `choice` column is the
literal string `<unnamed>`, and `menu_path` empty for template symbols.

Required outcome: persist the dependency expression and choice membership reported by
Kconfiglib for each definition.

#### KCF-004 — Zephyr `configdefault` is ignored

The pinned tree contains 428 lines matching `^\s*configdefault` (440 occurrences
unanchored). The parser recognizes only `config` and `menuconfig` definitions, and the
`kconfig` table has no column that could represent a `configdefault` contribution.

Required outcome: use the Zephyr Kconfig implementation, which supports its documented
extensions, instead of adding another isolated regex/parser case.

#### KCF-005 — Multiple definitions are flattened into a false AND

Definitions for the same symbol are aggregated into one list and shown as if all
conditions simultaneously apply. Kconfig definitions are independently conditioned;
their applicability is an OR over definition contexts. Re-verified: **1,685** symbols
have `n_defs > 1` and are subject to this flattening.

Required outcome: introduce definition-level records and preserve expression trees.

#### KCF-006 — User-facing Kconfig guidance contains false claims

`README.md` line 20 and `plugin/skills/zephyr-development/SKILL.md` line 13 state that
an unknown `CONFIG_` assignment is "silently ignored". This is false for the case that
matters. `zephyr/scripts/kconfig/kconfig.py` sets `kconf.warn_assign_undef = True` for
handwritten fragments and then, under the comment *"Turn all warnings into errors, so
that e.g. assignments to undefined Kconfig symbols become errors"*, calls
`err("Aborting due to Kconfig warnings")`. An invented symbol in `prj.conf` **fails the
build**.

This weakens the product's headline argument and must be restated honestly: the value
is not "we prevent a silent misconfiguration", it is "we prevent a failed build and the
round-trip it costs". The same file also runs `check_no_promptless_assign`, so assigning
a promptless symbol is likewise an error — see HOK-009 for the opportunity this creates.

The Kconfig skill (`plugin/skills/zephyr-kconfig/SKILL.md:83`) also recommends
`west build -t hardenconfig` as a dependency/provenance tracing tool. Both targets exist
in `cmake/modules/kconfig.cmake:220`, but `traceconfig` is the tracing tool;
`hardenconfig` is for security hardening.

Required outcome: correct all prose and add a documentation assertion test for these
high-risk claims.

#### KCF-007 — The validation hook turns catalogue incompleteness into false errors

The hook reports an index miss as proof that a symbol does not exist. Reproduced with a
valid generated Zephyr symbol (§3.6).

Required outcome: downgrade misses to non-blocking uncertainty until KCF-001 through
KCF-005 have objective recall gates. Hard errors may be restored only for a known
complete context-specific index. **Scheduling changed in the revision pass:** this
downgrade is no longer deferred to WP-8. It requires no semantic work and is the single
largest source of user-visible harm, so it moves to WP-A.

#### KCF-008 *(new)* — `get_kconfig` asserts nonexistence in absolute terms

KCF-007 was scoped to the hook, but the MCP tool has the same defect and reaches the
model on every lookup, not only on edits. `get_kconfig` on an unknown name returns the
sentence *"CONFIG_X does not exist in Zephyr 4.4.2."* — an absolute claim the corpus
cannot support — followed by BM25-nearest suggestions that can be actively misleading
(`SENSOR_LOG_LEVEL_DBG` → `CONFIG_LOG_DBG_COLOR_BLUE`). The same pattern appears in
`get_binding`, `get_board`, and `get_api`.

A confident wrong answer is worse than an admitted miss: it teaches the model to
"correct" valid firmware into invalid firmware.

Required outcome: miss-path prose states what was searched and what was not covered
("not present in the indexed catalogue for Zephyr 4.4.2, which does not include
generated or module-local symbols"), and suppresses suggestions below a relevance
threshold rather than always emitting the top-N.

### 5.2 Critical: index discovery, identity, and lifecycle

#### IDX-001 — Plugin environment wiring is inconsistent

`plugin/.mcp.json` exports **only** `ZEPHYR_AI_PLUGIN_ROOT` and
`ZEPHYR_AI_PLUGIN_DATA`. `plugin/scripts/index-paths.mjs` accepts either spelling
(`env.CLAUDE_PLUGIN_DATA ?? env.ZEPHYR_AI_PLUGIN_DATA`), but
`packages/mcp-server/src/db.ts` reads **only** `CLAUDE_PLUGIN_DATA` and
`CLAUDE_PLUGIN_ROOT`. Re-verified by reading both resolvers side by side.

A synthetic server start with only the explicitly forwarded aliases fails to find a
valid database. The server works in practice only if Claude Code also exports the
`CLAUDE_*` variables into the child environment — an undocumented, untested dependency.

Required outcome: define one explicit environment contract, use it consistently, and
cover it with a fresh-install process test.

#### IDX-002 — One global workspace database allows cross-project shadowing

Every user-built index is stored at `${CLAUDE_PLUGIN_DATA}/index/workspace.db`, and
`resolveIndexPath` prefers it over everything except `ZEPHYR_AI_INDEX`. Project A can
overwrite or shadow Project B.

Required outcome: project- and corpus-fingerprinted storage with deterministic lookup.

#### IDX-003 — Failed initialization is cached permanently

In `packages/mcp-server/src/main.ts` the guard order is `resolveIndexPath()` →
`if (cached)` → `if (failure) throw`. Once `failure` is set, a freshly built index is
never adopted because the throw precedes any use of the newly resolved `info`. Building
an index during the same Claude session does not recover. This directly contradicts the
comment above it, which claims mid-session rebuilds are picked up.

Required outcome: retry resolution on later calls or invalidate the failure when the
candidate set changes.

#### IDX-004 — Custom-workspace metadata can claim the pinned upstream commit

`packages/ingest/src/cli.ts` reads the semantic version from the tree
(`/** Read VERSION from the tree being indexed rather than trusting the lockfile. */`)
but then writes `zephyr_commit: lock['commit']` and `zephyr_tag: lock['tag']`
unconditionally — even when `--zephyr` points elsewhere. `source_kind` is inferred from
whether the path contains `.cache/zephyr`.

An index built from a user's workspace therefore carries the upstream pinned commit as
provenance. Every downstream "exact for commit X" claim inherits that lie.

Required outcome: interrogate the actual tree and west manifest. Never label an
artifact with lockfile identity unless the source tree was verified against it.

#### IDX-005 — Implemented discovery differs from documented discovery

`ARCHITECTURE.md` promises MCP roots or `ZEPHYR_BASE` discovery. The server does not
call `roots/list`, does not use `CLAUDE_PROJECT_DIR`, and does not use `ZEPHYR_BASE`
for index resolution — `ZEPHYR_BASE` appears in `README.md`'s configuration table but
only the `zephyr-index` skill consults it.

Required outcome: implement the documented contract or replace the documentation with
an equally robust, tested contract.

#### IDX-006 — Schema mismatch is warning-only

`main.ts` compares `schema_version` against `'1'` and calls `McpServer.log` on
mismatch, then serves queries against the incompatible database anyway.

Required outcome: fail closed with a model-correctable `ToolError` that identifies the
expected/actual schema and rebuild command.

#### IDX-007 — Index status does not prove workspace equality

`status.ts` compares only the semantic Zephyr version (`treeVersion()` from the
workspace `VERSION` file against `meta['zephyr_version']`). Two trees at 4.4.2 with
different commits, modules, or manifests report "matches the index".

Required outcome: report and compare a structured corpus fingerprint.

#### IDX-008 — Module ingestion is narrower than advertised

`--modules` adds Kconfig and devicetree binding roots. It does not index module docs,
boards, samples, or APIs, despite claims of comprehensive vendor HAL coverage.

Required outcome: either support each module corpus or clearly publish a per-source
coverage matrix.

### 5.3 Critical: devicetree correctness

#### DTS-002 — Recursive child bindings are truncated

*(Promoted above DTS-001 in the revision pass: this is the larger devicetree defect.)*

96 binding source files contain more than one `child-binding:` key, i.e. nested child
bindings. The database contains property rows at `child_level` 0 (115,723) and 1
(3,995) and **none deeper**. Merge and write paths both truncate the hierarchy.

Required outcome: preserve arbitrary supported nesting, include provenance, and filter
semantics recursively.

#### DTS-001 *(revised: Critical → High)* — Not every compatible schema form is supported

The official `microchip,mpfs-mailbox` binding expresses compatibility through
`properties.compatible.const`. It is used by `dts/riscv/microchip/mpfs.dtsi:156`, is
absent from the index, and the hook rejects it (§3.6).

Measured scope, which the original audit did not bound: across 3,725 binding YAML files
declaring 3,348 distinct compatibles, exactly **one** uses the `const` form and **zero**
use an `enum` form. So the present corpus hole is a single binding.

The finding stands on forward risk rather than present breadth: a loader that silently
ignores a schema form it does not recognise will drop the next such binding, in a
module or a future release, with no diagnostic. That is the argument for using Zephyr's
own loader — not the size of today's gap.

Required outcome: use Zephyr's binding loader, or fully implement and test every schema
form accepted by the pinned Zephyr release **and** make an unrecognised schema key a
build error (DTS-003).

#### DTS-003 — Parse/include failures are silent

Missing include targets and YAML failures can be skipped without failing the build or
recording a diagnostic.

Required outcome: every source file must end in indexed, intentionally excluded with a
reason, or fatal-error state. Produce a machine-readable ingestion report.

#### DTS-004 — Generated skeleton values are not type-correct

Every required property is rendered as `<...>`, including booleans, strings,
string-arrays, phandles, and compound properties.

Required outcome: render type-aware placeholders or omit skeleton generation where a
safe value cannot be inferred. Compile generated fixtures with `dtc`/Zephyr.

#### DTS-005 — Include provenance is incomplete

Direct include names are retained, but the full resolved include chain and filter path
are not represented.

Required outcome: retain the complete provenance graph for every inherited property.

#### DTS-006 — Duplicate binding basenames are resolved by traversal order

The binding source map is keyed by basename and silently keeps one file. This can
produce order-dependent resolution.

Required outcome: resolve includes according to Zephyr search roots and fail on the
same ambiguity that Zephyr would reject.

#### DTS-007 — Binding constraints are incomplete

Constraints such as `min`, `max`, `min-len`, `max-len`, and newer dependency behavior
are not represented.

Required outcome: publish and test a schema coverage matrix for the pinned release.

#### DTS-008 *(new)* — The coverage gate must use the right denominator

The DTS/DTSI/overlay corpus references 4,200 distinct compatibles; 1,693 of them have no
binding file in the tree at all. That is expected: board and SoC root-node compatibles
are matched by name and carry no YAML. Any gate phrased as "every compatible used in
DTS must be indexed" is therefore unsatisfiable and will be disabled the first time it
blocks a release.

Required outcome: state coverage as two separate, individually achievable gates.

1. **Declaration coverage** — every compatible declared by a binding file under the
   active binding roots is indexed. Current value: 3,347 of 3,348 (the one failure is
   DTS-001). Target: 100%, no exclusions permitted.
2. **Resolution coverage** — every compatible used in the DTS corpus *for which a
   binding file exists* resolves to an indexed binding. Bindingless root-node
   compatibles are excluded by rule, not by enumeration, and the rule itself is tested.

### 5.4 High: documentation corpus

#### DOC-001 — The Zephyr build manual is excluded

`packages/ingest/src/sources/docs.ts` skips directories named `build`. Re-verified: the
tree contains **37** `.rst` files under `doc/build/`, and
`SELECT COUNT(*) FROM doc WHERE path LIKE 'doc/build/%'` returns **0**. This removes
Kconfig, devicetree, CMake, flashing, sysbuild, signing, and snippet documentation while
tools advertise build coverage.

#### DOC-002 — Sphinx includes are not resolved

The audited source set contained 569 `include::`, 66 `literalinclude::`, and 9
`only::` directives (not re-verified). Indexed results can contain a filename and
directive options instead of the included documentation. The database contains **701**
chunks whose `body` is empty after trimming (re-verified).

#### DOC-003 — Published URL lookup does not match its tool contract

`get_doc` claims to accept a published Zephyr URL but does not normalize the official
site prefix. Re-verified: `get_doc {path: "https://docs.zephyrproject.org/4.4.2/kernel/index.html"}`
returns `found: false`, even though `doc.url` for that page stores exactly that string.

#### DOC-004 — Tool input schema bounds are not enforced

Re-verified: `get_doc` accepts `max_chars: 1` (declared `minimum: 1000`), `get_kconfig`
accepts an undeclared property despite `additionalProperties: false`, and
`search_kconfig` accepts `limit: "3"` as a string. There is no validator in
`protocol.ts` at all. See MCP-002 — this is one defect with two visible faces.

#### DOC-005 — Path fallback is ambiguous

The fallback `%path%` query uses wildcard semantics and chooses an arbitrary first
match.

Required outcome for DOC-001 through DOC-005: index all intended pages, resolve the
required RST/Sphinx directives, store source-to-rendered provenance, normalize URLs
deterministically, and reject ambiguous lookups with candidates.

### 5.5 High: public C API corpus

#### API-001 — Regex parsing creates false functions

Re-verified: **110** records with `kind='function'` have `=` in their signature, and
inspection confirms they are enum-body fragments, not functions. Actual indexed
examples:

```
name "Access"    signature "CELLULAR_ACCESS_TECHNOLOGY_GSM_EGPRS = 3, /** UTRAN …"
name "Address"   signature "LLDP_TLV_MANAGEMENT_ADDR = 8, /**< Management Address …"
name "alerted"   signature "BT_HFP_HF_CALL_STATUS_ACTIVE = 0, /** Call is on hold */ …"
name "Aqua"      signature "VIDEO_COLORFX_BW = 1, /**< Black and white effect. */ …"
```

The parser accepts an identifier followed by `(` from a broad post-comment window
rather than consuming a compiler- or Doxygen-derived declaration. Note the names: these
records are indexed under English words from prose, so they pollute search as well as
lookup.

#### API-002 — Documentation completeness is overstated

Re-verified: of 26,148 API records, **11,105** have an empty `brief` — 42%. The audit
additionally reported 1,860 function records with neither return description nor return
values (not re-verified), while the MCP tool promises full contracts and errno handling.

#### API-003 — Macro and internal-header noise is substantial

Header guards and internal implementation declarations are included. The skip logic
recognizes only a narrow set of internal directories. An audit heuristic classified
3,938 macro records as likely header guards; this is a pollution indicator rather
than a definitive semantic count and should be replaced by Doxygen-derived kind and
visibility data.

#### API-004 — Deduplication deletes legitimate context

Deduplication uses `kind:name` across headers and can erase distinct declarations or
provenance.

#### API-005 — Documentation URLs are not populated

The lockfile carries an API base URL, but API symbols do not expose reliable upstream
links.

#### API-006 — Precision tests are insufficient

Real-tree tests cover a few positive symbols but do not assert false-positive
rejection.

Required outcome for API-001 through API-006: generate and consume Doxygen XML (or an
equally authoritative compiler-derived representation), retain stable compound/member
identifiers, and establish both precision and recall gates.

### 5.6 High: boards and samples

#### BRD-001 — Current board target schemas are not fully supported

The collector expects a top-level `identifier:` in `twister.yaml`. Re-verified: exactly
six boards have an empty target list —

`adafruit_feather_esp32s2`, `cdns_swerv`, `intel_adsp`, `nucleo_n657x0_q`,
`stm32_min_dev`, `stm32n6570_dk`

— and the mechanism is now confirmed. `boards/st/nucleo_n657x0_q/twister.yaml` and
`boards/st/stm32n6570_dk/twister.yaml` carry only capability metadata (`name`, `type`,
`arch`, `ram`, `flash`, `supported`) with **no `identifier:` key**; target identity
lives in `board.yml`. `boards/others/stm32_min_dev` additionally uses `revision.cmake`,
so its targets are revision-qualified.

Two of the six named boards (`nucleo_n657x0_q`, `stm32n6570_dk`) are current ST parts —
this defect lands directly on the product's declared STM32 focus.

#### BRD-002 — Board documentation detection is name-specific

Only `doc/index.rst` is recognized. Re-verified: **87** board records have a null or
empty `doc_path`; the audit's 74 is the subset that have some other RST file present.

#### BRD-003 — ESP32 qualifier guidance is overly absolute

The ESP32 skill states that all targets are qualified. Re-verified against the tree's
own `twister.yaml` identifiers: `esp32c3_devkitc`, `esp32c3_devkitm`,
`esp32s2_devkitc`, `esp32s2_saola`, and `esp8684_devkitm` are all **unqualified**
single-target boards, while `esp32s3_devkitc` genuinely is qualified
(`esp32s3_devkitc/esp32s3/procpu` and `/appcpu`). Qualifier requirements are
board/SoC-specific.

`README.md` repeats the absolute form in its failure-modes table.

#### BRD-004 — ESP32 multiprocessing guidance is incomplete

The skill focuses on separate `procpu`/`appcpu` images and does not accurately explain
when Zephyr SMP versus AMP applies.

#### SMP-001 — Twister `common:` metadata is ignored

Two hundred fourteen of 610 sample YAML files use `common:`; in 193 cases it carries
relevant tags, dependencies, integration platforms, or platform filtering (audit
figures, not re-verified).

#### SMP-002 — Sample file capture is internally inconsistent

Re-verified, with the mechanism identified. `shouldStore()` accepts `sample.yaml`,
`prj*.conf`, `boards/**`, `snippets/**`, and `src/**`, but the file list it filters
comes from `interestingFiles()`, which:

- hardcodes the literal names `prj.conf`, `CMakeLists.txt`, `Kconfig`,
  `sysbuild.conf`, `README.rst` — so `sample.yaml` is never offered, and alternate
  configurations such as `prj_minimal.conf` are never offered;
- uses a single non-recursive `readdirSync` over `src`, `boards`, and `snippets`, so
  nested sources are dropped.

Result: **4,722** files stored and **zero** `sample.yaml` rows, against 5,388 that the
storage predicate would have accepted.

#### SMP-003 — CI verification claims are not supported

Re-verified: **278** samples have no integration platform data and **134** have neither
integration platforms nor `platform_allow`. The tools describe every sample as
"built in CI" and "CI-verified" (`search_samples` description; `README.md`).

#### SMP-004 — A documented preference is implemented as a hard filter

`search_samples` documents `board` as "Prefer samples known to build for this board
target", but the implementation appends
`AND (s.integration_platforms LIKE ? OR s.platform_allow LIKE ?)` — a hard filter, over
substring matches against serialized JSON, using only the bare board name before the
first `/`.

#### SMP-005 — Sample README content is not returned

README/doc paths may be recorded, but `get_sample` does not return their useful
explanatory content.

Required outcome for BRD/SMP findings: use the same hardware-model and Twister
semantics as the pinned Zephyr release, retain normalized relational metadata, and
label CI evidence precisely.

### 5.7 High: MCP and JSON-RPC behavior

All six original findings reproduced over real stdio against the built bundle (§3.6).

#### MCP-001 — Lifecycle state is not enforced

`#initialized` is tracked in `protocol.ts` but never consulted: `#dispatch` switches
straight on `method`. `tools/list` before `initialize` returns the full tool list. MCP
normal operation must begin only after the initialization lifecycle.

#### MCP-002 — Advertised JSON Schemas are not enforced

There is no validator in the server. Minimum bounds, types, and unexpected properties
are accepted; numeric values are coerced from strings (§3.6, DOC-004).

#### MCP-003 — JSON-RPC error identity/classification is incorrect

`this.#fail(0, ErrorCode.ParseError, …)` returns `id: 0` for malformed JSON; the
specification requires `null`. Invalid requests fall back to `?? 0` for the same reason.
A structurally invalid request carrying an id but no `method` reaches `#dispatch` and
returns `-32601 Method not found: undefined` instead of `-32600 Invalid Request`.

#### MCP-004 — Correctable tool misses do not follow the repository invariant

Unknown Kconfig symbols, bindings, boards, API symbols, docs, and samples return
ordinary successful `{found:false}` responses instead of `ToolError`/`isError: true`,
contrary to `AGENTS.md` and SEP-1303. Six call sites confirmed. Current tests codify the
inconsistent behavior.

#### MCP-005 — Uncaught exceptions do not terminate the process

`main.ts` registers `process.on('uncaughtException', …)` that only logs, so the server
continues serving after arbitrary state corruption.

#### MCP-006 — Status resource construction is unnecessarily brittle

The resource handler calls `createTools(index)` again to find `index_status`, then
discards the result if it is a Promise (`out instanceof Promise ? null : out`) — so the
resource silently degrades to "Index status unavailable." the moment any tool handler
becomes async.

#### MCP-007 *(new)* — Internal identifiers leak into protocol error messages

`Method not found: undefined` is returned to the client when `method` is absent, and
the generic catch path forwards raw `Error.message` into the JSON-RPC `message` field.
Both leak implementation detail into a protocol surface, and the latter can carry
absolute filesystem paths — which §9 item 12 explicitly forbids for tool responses and
should equally forbid here.

Required outcome: implement a strict JSON-RPC request boundary, explicit MCP lifecycle
state machine, schema-subset validator, consistent `ToolError` mapping, sanitised error
text, and fatal process policy for unrecoverable exceptions.

### 5.8 High: skills, agents, and hooks

Every symbol named in SKL-001 through SKL-003 was re-verified as absent from **both**
the pinned Zephyr tree (no `config`/`menuconfig` definition anywhere) and the index.

#### SKL-001 — The testing skill contains non-compiling guidance

`plugin/skills/zephyr-testing/SKILL.md:36` recommends `CONFIG_ZTEST_NEW_API=y` and
line 130 `CONFIG_FFF=y`; neither symbol exists. Its fixture example invokes a
nonexistent fixture accessor and declares a structure incompatible with `ZTEST_F`.

#### SKL-002 — Bluetooth symbols and error handling are outdated

`plugin/skills/zephyr-bluetooth/SKILL.md:15` recommends `CONFIG_BT_CTLR=y` and line 199
`CONFIG_BT_DEBUG_LOG=y`; neither exists. Examples discard relevant return values.

#### SKL-003 — Debugging guidance includes an invalid symbol and incorrect diagnosis

`plugin/skills/zephyr-debugging/SKILL.md:67` recommends
`CONFIG_RESET_ON_FATAL_ERROR=n`; the symbol does not exist. The skill also equates
`DEVICE_DT_GET` readiness failures with null pointers and gives an overly narrow
explanation of generated devicetree identifier errors.

#### SKL-004 — RTOS synchronization advice is unsafe or internally inconsistent

The RTOS skill describes `volatile` as required synchronization, though it provides no
ordering guarantee. Its deferred-work example can coalesce and lose repeated ISR
events.

#### SKL-005 — Reviewer doctrine is too absolute

The reviewer treats every discarded kernel/driver return as a defect and accepts
"single writer plus volatile" as synchronization. Both rules require contextual
qualification.

#### SKL-006 — Read-only agents can still mutate through Bash

`zephyr-architect` and `firmware-reviewer` declare `disallowedTools: Write, Edit,
NotebookEdit` and describe themselves as non-editing ("You do not edit files — you
report findings"), but retain Bash and can therefore write through a shell. All four
agents also hard-code a model (`opus` for the architect, `sonnet` for the rest), which
introduces access, portability, and cost issues.

#### SKL-007 — Bundled examples violate bundled review rules

For example, the development skill discards a GPIO operation result while the reviewer
states that such returns must always be handled.

#### SKL-008 — Several product guarantees are too broad

Examples include "CI verified", "every return is a negative errno", and interpreting a
supported feature as proof that the peripheral is physically wired and available.

#### HOK-001 — Validation examines an edit snippet, not the resulting file

`validate-zephyr-edit.mjs` reads `input.content`, `input.new_string`, or the joined
`new_string` values of `edits[]` — never the file on disk. This loses file context,
produces snippet-relative line numbers, and misses errors created through partial
replacement.

#### HOK-002 — `# CONFIG_FOO is not set` is skipped

Re-verified: a fragment containing `# CONFIG_BT_PERIPHERALZ is not set` exits 0.
Typos in valid Kconfig unset syntax are never checked.

#### HOK-003 — Large symbol families are excluded wholesale

Re-verified: `CONFIG_BOARD_TOTALLY_FAKE=y`, `CONFIG_SOC_NOT_REAL=y`, and
`CONFIG_DT_HAS_NOTHING=y` together exit 0. All `BOARD_`, `SOC_`, and `DT_` names are
ignored, allowing real hallucinations to pass.

#### HOK-004 — Compatible extraction is line-based

Re-verified: in a two-line `compatible = "totally,fake-one",\n "also,fake-two";`
declaration, only the first string is reported. Multiline compatible lists are not
parsed reliably.

#### HOK-005 — Type validation is shallow

Only a subset of boolean versus integer/hex mistakes is caught. String, tristate,
enum, range, and dependency semantics are not validated.

#### HOK-006 — Hook infrastructure failures fail open silently

`check-index.mjs` wraps its work in bare `catch {}` blocks and ends with
`main().catch(() => process.exit(0))`. Database corruption and other hook errors
disable the safety mechanism without an actionable warning. The SessionStart check also
lacks a schema check.

#### HOK-007 — Hooks have no automated tests

Confirmed: no test file references either hook script.

#### HOK-008 *(new)* — Miss suggestions are misleading, compounding the false error

The hook does not merely report a false error; it recommends a wrong fix. Reproduced:

```
CONFIG_SENSOR_LOG_LEVEL_DBG does not exist … Closest: CONFIG_SENSOR_LOG_LEVEL
compatible "microchip,mpfs-mailbox" … Closest: microchip,tc-g1, microchip,adc-g1,
                                               microchip,aes-g1
```

The first suggestion silently changes a log-level selector into an unrelated integer
symbol; the second proposes three unrelated Microchip peripherals for a mailbox
controller. A model that trusts the hook will "fix" working firmware into broken
firmware.

Required outcome: rank suggestions by a relevance floor and emit none when nothing
clears it. "Not found in the indexed catalogue, no close match" is a safe message;
a confident wrong rename is not.

#### HOK-009 *(new)* — The highest-value provable check is not implemented

KCF-006 established that Zephyr fails the build on assignments to undefined symbols
*and*, via `check_no_promptless_assign`, on assignments to promptless symbols. The
second class is fully decidable from data the catalogue already holds — a symbol with
no `prompt` cannot be set from `prj.conf` — and it is a mistake models make constantly,
because promptless symbols look exactly like settable ones in documentation.

This is the rare hook check that can be *definitive* rather than advisory even under
today's incomplete catalogue: a false positive requires the symbol to exist with a
prompt that the index missed, which is a much narrower failure mode than existence
itself.

Required outcome: implement promptless-assignment detection in WP-8 and classify it as
a definitive error while existence checks remain advisory.

Required outcome for SKL/HOK findings: compile and validate skill examples; make agent
permissions truthful; parse final files where possible; distinguish definitive errors
from advisory uncertainty; and add end-to-end hook fixtures.

### 5.9 High: release and filesystem safety

#### REL-001 — `npm run check` can pass after integration tests skip

Re-verified from `package.json`:

```json
"check": "npm run typecheck && npm run build && npm test && npm run validate:plugin"
```

It does not fetch Zephyr and does not rebuild the database. Real-tree parser tests and
MCP conformance tests silently skip when their inputs are absent.

This contradicts the repository's own documentation in two places, and both must be
corrected in the same change that fixes the script:

- `CLAUDE.md`: "a green run without `npm run fetch:zephyr && npm run build:index`
  proves much less than it looks like. **`npm run check` sequences this correctly.**"
  — the warning is right, the reassurance is false.
- `AGENTS.md`: "`npm run check` # all of the above, in order — run before finishing".

#### REL-002 — No CI or release provenance exists

Re-verified: no `.github/` directory, no `SECURITY.md`, no `CHANGELOG.md`, no
`CONTRIBUTING.md`, and no commits in the audited workspace.

#### REL-003 — No default index is actually distributed

`index/` is gitignored (`.gitignore` excludes both `*.db` and `index/`). The plugin is
the `plugin/` directory, so a repository-level `index/` would not be part of the plugin
package anyway. There is no first-run download, checksum, or automatic bootstrap
implementation — yet `db.ts` has a `plugin-data`/`plugin-root` resolution branch
labelled "the default index installed with the plugin", `README.md` tells users to
install and then just ask Claude to build one, and `status.ts` can report an origin that
can never occur in a real install.

#### REL-004 — Zephyr fetch can delete an unsafe destination

`scripts/fetch-zephyr.mjs` calls `rmSync(dest, { recursive: true, force: true })` in two
branches: after a checkout mismatch at an existing `.git` destination, and
unconditionally under `--force` for any existing `dest`, which `--dest` makes arbitrary.
There is no ownership marker or safe-root validation.

#### REL-005 — Index construction destroys the previous index first

`packages/ingest/src/cli.ts` removes `${out}`, `${out}-journal`, `${out}-wal`, and
`${out}-shm` before building. A failed build removes the last working artifact.

#### REL-006 — Security and redistribution policy are undocumented

Workspace modules can inject model-facing text into the corpus. If a derived Zephyr
database is distributed, provenance, attribution, licensing, checksums, and update
policy need explicit treatment.

#### REL-007 *(new)* — The CI cost of the proposed gates is unbudgeted

Two gates in this plan are far more expensive than the rest and will silently become
"temporarily disabled" if they are attached to every pull request:

- **WP-9 skill compilation** needs a Zephyr SDK toolchain (multi-GB) plus a west
  workspace, per target board.
- **WP-5 Doxygen XML generation** needs Doxygen and a full pass over Zephyr's headers.

Required outcome: split CI into a fast required job (typecheck, build, unit tests,
corpus gates against a cached index, plugin/marketplace validation) and a slower
scheduled/pre-release job (fetch, full index rebuild, Doxygen, skill compilation).
Release predicates require the slow job to have passed on the release commit; they do
not require it on every commit. Cache keys per WP-0.

### 5.10 Product-scope gap: STM32 and ESP32 beyond Zephyr

#### VND-001 — Vendor support is primarily Zephyr-local

The current product indexes Zephyr boards, APIs, Kconfig, and bindings and adds two
workflow skills. It does not provide comprehensive STM32Cube HAL, STM32 reference
manual, ESP-IDF, ESP32 technical reference manual, errata, or vendor-tool knowledge.

Note that the plugin manifest currently claims "World-class Zephyr RTOS firmware
development for STM32 and ESP32" and `README.md` is titled as a plugin "for developing
Zephyr RTOS firmware on STM32 and ESP32". Neither is false, but both invite the reading
that vendor SDK knowledge is present. BRD-001 also shows two current ST boards with
zero indexed targets, so even the Zephyr-local STM32 claim is not fully met today.

Required outcome: describe current support as Zephyr-on-STM32/ESP32. Add separately
versioned vendor knowledge packs only after their source, licensing, update, and
accuracy strategies are designed.

## 6. Target architecture

### 6.1 Two levels of semantic truth

The index must distinguish two kinds of knowledge:

1. **Catalogue knowledge**: declarations reachable from the canonical Zephyr root and
   selected modules, independent of one board where possible.
2. **Resolved build-context knowledge**: visibility, values, generated symbols,
   devicetree nodes, chosen board/revision/qualifiers, modules, and build outputs for a
   specific application and build directory.

Tools must state which level supports each answer. For example:

- "This symbol is declared" can use the catalogue.
- "This symbol is assignable for this application" requires a resolved context.
- "This property is allowed by the compatible's binding" can use the binding
  catalogue.
- "This node accepts the property here" requires the resolved DTS and matching
  binding.

A third state must be representable and is the one the product gets wrong today:
**"not found, and this corpus cannot prove absence."** Every miss path — tool prose,
`structuredContent`, and hook output — must be able to express it (KCF-008, HOK-008).

### 6.2 Project and corpus identity

Define an `IndexDescriptor` shared between ingest and runtime:

```ts
interface IndexDescriptor {
  schemaVersion: number;
  builderVersion: string;
  createdAt: string;
  sourceKind: "pinned-upstream" | "west-workspace" | "explicit-tree";
  projectRoot?: string;
  zephyrRoot: string;
  zephyrVersion: string;
  zephyrCommit: string;
  westManifestHash?: string;
  moduleFingerprint: string;
  boardTarget?: string;
  applicationRoot?: string;
  buildDirectory?: string;
  contextFingerprint: string;
  /** Which corpora this artifact actually contains, per IDX-008 and §8.2. */
  coverage: Record<string, { complete: boolean; note?: string }>;
}
```

Do not expose private absolute paths in normal tool responses. Store display-safe
origin fields separately where necessary.

The context fingerprint must be a stable hash of normalized semantic inputs, at
minimum:

- Zephyr Git commit.
- West manifest revision/content identity.
- Module names, roots, and Git commits or content fingerprints.
- Board target and revision when context-specific.
- Application root identity when application-local Kconfig/bindings are included.
- Relevant generated configuration inputs.
- Schema and builder version.

`coverage` is what lets a tool answer honestly. A catalogue built without module docs
(IDX-008) or without a resolved build context must say so at the point of the miss,
not only in `index_status`.

### 6.3 Index storage and lookup

Use a structure similar to:

```text
${CLAUDE_PLUGIN_DATA}/indexes/
  projects/<project-id>/<context-fingerprint>/zephyr.db
  projects/<project-id>/active.json
  defaults/<zephyr-commit>/<schema-version>/zephyr.db
```

Where `project-id` is a hash of the canonical project root, not a basename.

Resolution order:

1. Explicit `ZEPHYR_AI_INDEX`, validated strictly.
2. Active project index resolved from `CLAUDE_PROJECT_DIR` or negotiated MCP roots.
3. A verified default index matching the requested release, if installed.
4. An actionable `ToolError` explaining how to create/download an index.

Do not allow a global project index to shadow a project-specific candidate.

Resolution should be retried when:

- No index was previously found.
- Candidate file modification metadata changes.
- An explicit reload notification/tool is invoked.
- The active MCP root changes.

Retention: fingerprinted directories accumulate one index per context. Define an
eviction policy (keep the N most recently used per project, plus the active one) and
report total on-disk usage from `index_status`, so a plugin data directory cannot grow
without bound on a machine that builds many contexts.

### 6.4 Atomic immutable database builds

Indexes are immutable artifacts. Building should:

1. Resolve and validate every input, including the §4.3 toolchain contract.
2. Create a temporary database in the destination filesystem.
3. Write all data in a transaction.
4. Run `foreign_key_check`, `integrity_check`, FTS parity checks, corpus diagnostics,
   and acceptance invariants.
5. Close all connections and fsync where supported.
6. Rename the verified database atomically.
7. Update `active.json` atomically.
8. Retain the previous valid artifact until replacement succeeds.

Schema changes do not need in-place migration because the index can be rebuilt. The
server must reject an incompatible database and provide the rebuild instruction.

### 6.5 Ingestion diagnostics

Every collector must return a structured report:

```ts
interface SourceReport {
  discovered: number;
  indexed: number;
  intentionallyExcluded: Array<{ path: string; reason: string }>;
  warnings: Array<{ path?: string; code: string; message: string }>;
  errors: Array<{ path?: string; code: string; message: string }>;
}
```

Release builds fail if:

- Any source was silently lost.
- An exclusion has no stable reason code.
- A parse/include failure is downgraded without an explicit allowlist.
- The aggregate report violates a corpus-specific quality gate.

## 7. Implementation work packages

### WP-A *(new)* — Stop asserting false negatives

Depends on: none — deliberately ahead of the baseline work
Addresses: KCF-007, KCF-008, HOK-008, and the prose half of KCF-006, BRD-003, SMP-003,
SKL-001, SKL-002, SKL-003

The original plan routed every false-positive fix through WP-8, which depends on WP-2
and WP-3 — the two largest rewrites in the programme. That means the plugin keeps
telling users that valid Zephyr code is invalid for as long as the semantic pipelines
take. Nothing about the downgrade requires those pipelines. This package exists to
separate *harm reduction* from *capability building*, and it is the first thing to do.

Tasks:

1. Reclassify hook findings: an index miss becomes an advisory note, not an error.
   Keep exit 2 only for findings the current corpus can actually prove — today that is
   the type mismatch check (`CONFIG_X is int but is set to "y"`), which depends on the
   symbol being found, not missing.
2. Apply a relevance floor to all suggestion lists in the hook and in the `get_*` tools;
   emit none rather than a poor one (HOK-008).
3. Replace absolute miss prose everywhere with corpus-scoped language (KCF-008). One
   shared helper, used by `get_kconfig`, `get_binding`, `get_board`, `get_api`,
   `get_doc`, `get_sample`, and both hooks.
4. Correct the four load-bearing false statements in user-facing prose: "silently
   ignored" (KCF-006), `hardenconfig` → `traceconfig` (KCF-006), "all ESP32 targets are
   qualified" (BRD-003), and "CI-verified" applied to every sample (SMP-003).
5. Delete or correct the five nonexistent Kconfig symbols in the testing, Bluetooth, and
   debugging skills (SKL-001, SKL-002, SKL-003). These are one-line edits; they do not
   need the WP-9 verification harness to be right.

Acceptance criteria:

- A `prj.conf` containing `CONFIG_SENSOR_LOG_LEVEL_DBG=y` does not produce exit 2.
- An overlay using `microchip,mpfs-mailbox` does not produce exit 2.
- No tool or hook output contains the substring "does not exist in Zephyr".
- `grep` for the five removed symbols across `plugin/` returns nothing.
- The type-mismatch fixture still produces exit 2, so the hook is not merely muted.

This package intentionally makes the plugin *less* assertive before it makes it more
correct. That trade is right: an advisory miss costs one wasted lookup, a false error
costs a working configuration.

### WP-0 — Establish an auditable baseline

Depends on: WP-A (so the baseline commit captures the corrected behaviour)
Addresses: REL-001, REL-002, REL-007

Tasks:

1. Create the repository's initial Git commit from the intended source state so later
   bundle, schema, and corpus changes have a reproducible baseline.
2. Record bundle hashes and current database counts in a checked-in test fixture,
   generated by `scripts/quality/counts.mjs` so §3.4 can be re-derived on demand.
3. Split the development gate into explicit commands:
   - `check:quick`: typecheck, fixture/unit tests, bundle build, plugin validation.
   - `check`: fetch/verify pinned Zephyr, rebuild index, run all real-tree and stdio
     tests, run semantic corpus gates, validate both plugin and root marketplace.
4. Remove silent integration-test skips from `check`. Tests may skip only under an
   explicitly named quick/local mode.
5. Correct the `npm run check` claims in `CLAUDE.md` and `AGENTS.md` in the same
   commit (REL-001).
6. Add a CI workflow with cache keys based on `zephyr.lock.json`, lockfile, Node
   version, and schema version. Split fast/slow jobs per REL-007.
7. Make CI compare rebuilt bundle hashes with checked-in artifacts and fail on drift.
8. Add `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md` skeletons now; WP-10 fills
   in the distribution-specific content.

Likely files:

- `package.json`
- `packages/ingest/package.json`
- `packages/mcp-server/package.json`
- `.github/workflows/ci.yml`
- `scripts/fetch-zephyr.mjs`
- New scripts under `scripts/quality/`
- `CLAUDE.md`, `AGENTS.md`

Acceptance criteria:

- Deleting `.cache/zephyr`, the database, or a built MCP bundle causes `npm run check`
  either to recreate it or fail explicitly; it never silently reduces coverage.
- `npm run check:quick` remains usable without the 610 MiB Zephyr checkout.
- CI performs all 78 existing tests plus the new semantic gates.
- A stale committed `.mjs` causes CI failure.
- The fast CI job completes without a Zephyr SDK or Doxygen installation.

### WP-1 — Project-scoped index discovery and metadata

Depends on: WP-0
Addresses: IDX-001 through IDX-008, REL-003

Tasks:

1. Add the shared `IndexDescriptor` type and canonical serializer, including
   `coverage`.
2. Read actual Zephyr identity with `git rev-parse HEAD`, semantic `VERSION`, and west
   manifest/module inspection.
3. Reject a requested pinned build when the checkout does not match
   `zephyr.lock.json`.
4. Implement canonical project-root discovery from:
   - `CLAUDE_PROJECT_DIR` forwarded explicitly by `plugin/.mcp.json`.
   - MCP roots when available.
   - An explicit CLI option for tests and non-Claude clients.
5. Align plugin, server, skills, and hooks on one documented set of environment
   variables. Decide explicitly whether the canonical names are `CLAUDE_*` or
   `ZEPHYR_AI_*`; forward both from `.mcp.json` during a deprecation window, and make
   the server's resolver accept exactly the documented set (IDX-001).
6. Implement project- and fingerprint-scoped storage, with the retention policy in
   §6.3.
7. Replace the one-time failure cache with a resolver that can observe a newly created
   index (IDX-003).
8. Validate schema and descriptor before constructing any tool (IDX-006).
9. Expand `index_status` to report:
   - schema/builder version;
   - Zephyr version and full commit;
   - source kind;
   - project match status;
   - module/manifest match status;
   - catalogue versus resolved-context capabilities;
   - per-corpus coverage;
   - on-disk usage across stored indexes;
   - actionable rebuild instructions.
10. Add a controlled default-index install/download strategy or remove all "shipped
    default" claims until it exists — including the `plugin-data`/`plugin-root`
    resolution branches and the `ORIGIN_LABEL` entries that describe them (REL-003).

Likely files:

- `packages/ingest/src/cli.ts`
- `packages/ingest/src/schema.ts`
- New `packages/ingest/src/identity.ts`
- `packages/mcp-server/src/db.ts`
- `packages/mcp-server/src/main.ts`
- `packages/mcp-server/src/tools/status.ts`
- `plugin/.mcp.json`
- `plugin/scripts/index-paths.mjs`
- `plugin/skills/zephyr-index/SKILL.md`
- `README.md`
- `ARCHITECTURE.md`

Tests:

- Fresh-install process test with only documented environment variables.
- Two projects with identical Zephyr versions and different commits.
- Two projects with the same Zephyr commit and different modules.
- Index created after the server's first failed lookup.
- Corrupt database, missing descriptor, and schema mismatch.
- Paths containing spaces and non-ASCII characters.
- Explicit index precedence and project-index non-shadowing.
- An index built with `--zephyr <other tree>` does not report the lockfile commit
  (IDX-004).

Definition of done:

- No mutable global `workspace.db` remains.
- Same-version/different-context workspaces never report an exact match.
- A valid index created mid-session is discovered without restarting Claude.
- The resolver behavior is fully documented and process-tested.

### WP-2 — Kconfig semantic ingestion v2

Depends on: WP-0, WP-1
Addresses: KCF-001 through KCF-005, and the code half of KCF-006

Preferred implementation:

Use the Kconfiglib shipped by the target Zephyr tree, per the §4.3 toolchain contract.
Add a small Python exporter under the ingest package and invoke it from TypeScript.

The exporter should:

1. Import the Kconfiglib version from the target Zephyr tree.
2. Evaluate the canonical root Kconfig with the environment and generated module
   fragments used by Zephyr.
3. Enumerate symbols, definitions/nodes, choices, prompts, types, help, defaults,
   ranges, selects, implies, visibility expressions, and source locations.
4. Serialize expression trees structurally, not as lossy display strings.
5. Record definition-level enclosing conditions and menu paths.
6. Exclude sample/application-local definitions unless that application is explicitly
   part of a context index.
7. Emit diagnostics for undefined references and source/preprocessor failures.
8. Record whether each symbol has a prompt, so HOK-009 can be decided offline.

Schema direction:

```text
kconfig_symbol(id, name, type, help, has_prompt, ...)
kconfig_definition(id, symbol_id, file, line, prompt, menu_path, condition_expr_id)
kconfig_default(id, definition_id, value_expr_id, condition_expr_id, ord)
kconfig_relation(id, definition_id, kind, target_symbol_id, condition_expr_id)
kconfig_choice(id, name, type, prompt, condition_expr_id)
kconfig_choice_member(choice_id, symbol_id, definition_id)
kconfig_expr(id, kind, value, left_id, right_id)
```

Keep a denormalized FTS projection for search, but make full-detail tools query the
semantic tables. Intern help text into `text_pool` as the current schema does for
property descriptions — 19,796 symbols with per-definition rows will otherwise
regress the index size budget (§8.4).

Tool behavior changes:

- `search_kconfig` searches declaration names/prompts/help.
- `get_kconfig` displays each definition as an alternative context.
- Catalogue responses distinguish declaration, visibility, assignability, and current
  value.
- Context responses may report why a symbol is invisible for the selected build.
- The tool must never rewrite OR alternatives as a single dependency list.

Tests and corpus gates, all shipped as scripts under `scripts/quality/`:

- Zero indexed symbol names contain `$(` or unresolved preprocessor syntax
  (current: 45).
- `SENSOR_LOG_LEVEL_DBG` and other generated logging symbols are present.
- `configdefault` fixtures preserve their semantics (current tree: 428 occurrences).
- Menu/choice dependencies match Kconfiglib outputs; no row carries a `<unnamed>`
  choice placeholder.
- Multiple-definition fixtures remain independent alternatives (current: 1,685 symbols
  affected).
- No sample-local symbol appears in the canonical catalogue unless sourced by the
  canonical root.
- `scripts/quality/kconfig-recall.mjs` reports zero unexplained misses across
  `samples/**/*.conf` and `snippets/**/*.conf` (current: 139 of 2,202), with every
  remaining entry in a checked-in allowlist recording the external module/image source
  and evidence for exclusion.
- Differential tests compare randomly sampled records directly with Kconfiglib.
- The hook regression fixture for `CONFIG_SENSOR_LOG_LEVEL_DBG=y` passes.

Definition of done:

- The old handwritten Kconfig parser is removed from production use.
- A schema-version bump and complete index rebuild are included.
- Kconfig claims in README, architecture, skills, and tool descriptions match tested
  behavior.
- The validator remains advisory for context-dependent existence until resolved build
  context support is complete.

### WP-3 — Devicetree binding semantic ingestion v2

Depends on: WP-0, WP-1
Addresses: DTS-001 through DTS-008

Tasks:

1. Create an executable spike using the pinned Zephyr Python devicetree tooling
   (`scripts/dts/python-devicetree`) to load and resolve bindings.
2. Before full implementation, record a decision:
   - use Zephyr's loader directly, or
   - implement a local loader only if the official API cannot produce a catalogue.
3. If a local loader is retained, make unknown schema keys fatal in release builds and
   maintain a pinned schema coverage fixture.
4. Resolve include search paths using Zephyr's precedence, not global basename lookup.
5. Support every compatible declaration form accepted by the pinned release — at
   minimum top-level `compatible:` (3,347 uses) and `properties.compatible.const`
   (1 use); `enum` has no uses today but must not be silently dropped.
6. Preserve recursive `child-binding` without a hardcoded depth.
7. Apply allowlist/blocklist filters at the correct recursive level.
8. Persist full inherited-property provenance and include paths.
9. Add constraints including numeric bounds, array lengths, enums, constants,
   dependency modes, bus/on-bus, and specifier cells.
10. Replace generic skeleton placeholders with a type-aware renderer.
11. Emit a source report and fail on unresolved includes, duplicate ambiguity, or YAML
    failures.
12. Preserve the `text_pool` interning and the `dt_property_v` view contract through
    the schema change; recursive child levels increase row count, so the 119,718-row
    baseline is a floor, not a target.

Tests and corpus gates:

- **Declaration coverage** (DTS-008 gate 1): every compatible declared by a binding
  file under the active roots is indexed. Current: 3,347 of 3,348. Target: 3,348 of
  3,348, no exclusions permitted.
- **Resolution coverage** (DTS-008 gate 2): every compatible used in the DTS corpus for
  which a binding file exists resolves to an indexed binding. Bindingless root-node
  compatibles (1,693 today) are excluded by a tested rule, never by enumeration.
- The official `microchip,mpfs-mailbox` compatible is found.
- A hook fixture using that compatible does not report an error.
- Database nesting depth matches source nesting depth; the 96 known nested bindings are
  represented, and `SELECT DISTINCT child_level FROM dt_property` contains values > 1.
- Include-chain and filter provenance are exact for representative STM32, ESP32, bus,
  and child-binding fixtures.
- Required boolean, string, array, phandle, phandle-array, and compound skeleton
  fixtures compile through Zephyr devicetree processing.
- Duplicate basenames resolve exactly as Zephyr resolves them or fail identically.

Likely files:

- `packages/ingest/src/parsers/binding.ts`
- `packages/ingest/src/sources/bindings.ts`
- `packages/ingest/src/cli.ts`
- `packages/ingest/src/schema.ts`
- `packages/mcp-server/src/tools/devicetree.ts`
- New Python adapter and fixtures under `packages/ingest/`

Definition of done:

- No silent binding loss remains.
- Binding and property counts are explained by an ingestion report.
- A hard unknown-compatible error is emitted only when declaration coverage is 100% and
  the resolution rule is tested.

### WP-4 — Documentation ingestion v2

Depends on: WP-0, WP-1
Addresses: DOC-001 through DOC-005

Implementation sequence:

1. Remove the broad `build` directory exclusion and replace it with path-specific
   generated-output exclusions.
2. Add a preprocessing layer that resolves `include::` and `literalinclude::`
   recursively with cycle detection, path-boundary checks, line ranges, markers, and
   directive options.
3. Implement the limited `only::`/conditional behavior required by the indexed Zephyr
   source or adopt Sphinx doctree/JSON output if direct preprocessing cannot achieve
   parity.
4. Preserve origin file and line spans for included content.
5. Do not create empty chunks; attach structural headings without bodies to their
   nearest useful content or omit them deliberately.
6. Normalize lookup inputs as one of:
   - exact source path;
   - exact stored documentation URL;
   - canonical path derived from configured documentation base URL.
7. Escape wildcard characters and reject ambiguous suffix searches with candidates.
8. Enforce `max_chars` bounds through MCP schema validation (shared with WP-7).

Tests and corpus gates:

- All 37 `doc/build/*.rst` pages are indexed (current: 0).
- An ESP32 board programming section contains the rendered shared flashing text, not
  an `include::` filename.
- Include cycles, missing targets, path traversal, `start-after`, `end-before`, and
  line-range options have fixtures.
- Empty chunk count is zero unless a documented exception is asserted (current: 701).
- Every stored URL round-trips through `get_doc` — in particular
  `https://docs.zephyrproject.org/4.4.2/kernel/index.html`, which fails today.
- Exact path lookup is deterministic; ambiguous fallback produces a tool error with
  candidates.

### WP-5 — Public API ingestion v2

Depends on: WP-0, WP-1
Addresses: API-001 through API-006

Preferred implementation:

Generate Doxygen XML using the pinned Zephyr documentation configuration, then ingest
compound and member definitions by stable Doxygen identifiers. Do not reconstruct C
declarations from arbitrary source windows.

Tasks:

1. Add an explicit Doxygen XML generation/precondition command, gated as a slow CI job
   per REL-007 and declared in the §4.3 toolchain contract.
2. Parse functions, macros, typedefs, enums, enum values, variables, structs, unions,
   and groups as distinct kinds.
3. Preserve header/file provenance and overload-like duplicate contexts.
4. Build signatures from structured XML fields.
5. Extract parameter direction, description, return description, documented return
   values, deprecation, since/version, and group membership.
6. Generate upstream documentation anchors from compound/member identities.
7. Define public-header inclusion rules and explicit internal exclusions.
8. Make tool text distinguish "undocumented" from "no error behavior" — 42% of current
   records have no brief, so this is the common case, not the edge case.

Tests and corpus gates:

- Zero functions have signatures containing enum assignments (current: 110).
- Known enum fragments and header guards are never classified as functions; the four
  named examples in API-001 are regression fixtures.
- `gpio_pin_configure`, `k_sleep`, Bluetooth, networking, sensor, and power APIs match
  Doxygen outputs exactly.
- Identically named declarations in different valid contexts retain both provenance
  records.
- Every symbol with a Doxygen member ID has a working official URL.
- Precision fixtures include negative syntax, not only happy-path lookup.

### WP-6 — Boards and samples v2

Depends on: WP-0, WP-1
Addresses: BRD-001 through BRD-004, SMP-001 through SMP-005

Tasks:

1. Invoke or import the pinned Zephyr hardware-model implementation to enumerate
   boards, revisions, qualifiers, SoCs, and targets.
2. Compare output with `west boards` in integration tests.
3. Parse `twister.yaml` files that carry capability metadata without a top-level
   `identifier:`, taking target identity from `board.yml` — this is the confirmed
   mechanism behind BRD-001.
4. Handle revision-qualified `board@revision` targets, including boards using
   `revision.cmake` such as `stm32_min_dev`.
5. Discover board documentation using metadata and all supported local RST layouts.
6. Parse samples with Twister-compatible `common:` inheritance and platform filters.
7. Normalize platform lists relationally instead of substring-searching JSON.
8. Change the `board` parameter to either a true ranking preference or a clearly
   documented hard filter with a new name — the current description and behaviour
   disagree (SMP-004).
9. Capture all intended sample files recursively with explicit size and extension
   limits. Reconcile `interestingFiles()` with `shouldStore()` so the two agree by
   construction rather than by coincidence (SMP-002).
10. Return sample README documentation alongside configurations and source.
11. Report CI evidence precisely: integration platform, platform allowlist, test case,
    or no recorded evidence.
12. Correct qualifier and ESP32 SMP/AMP guidance in skills (BRD-003, BRD-004) — the
    prose half is already done in WP-A; this step makes the tool output match.

Tests and corpus gates:

- No board with valid targets has an empty target list; the six audited boards are
  named regression fixtures, with `nucleo_n657x0_q` and `stm32n6570_dk` called out as
  STM32-focus regressions.
- `board@revision` and multi-qualifier fixtures round-trip.
- All 214 `common:` samples inherit expected values.
- Eligible sample-file discovery and stored-file counts agree exactly (current: 4,722
  stored against 5,388 eligible, with 0 of 610 `sample.yaml` captured).
- Search ranking versus filtering behavior is asserted.
- Board `doc_path` is non-null wherever any board RST exists (current: 87 null).

### WP-7 — MCP protocol hardening

Depends on: WP-0, WP-1
Addresses: MCP-001 through MCP-007, DOC-004

Tasks:

1. Add an explicit lifecycle state machine: `new`, `initializing`, `ready`, `closing`,
   `closed`.
2. Permit only lifecycle-valid methods in each state.
3. Validate the JSON-RPC envelope before method dispatch:
   - object request;
   - `jsonrpc === "2.0"`;
   - string method **present**;
   - valid ID type;
   - valid params shape;
   - notification/request distinctions.
4. Return `id: null` for parse errors and correct standard error codes.
5. Implement a small dependency-free validator for the JSON Schema subset used by
   tools: object, array, string, boolean, integer, number, enum, required,
   `additionalProperties`, minimum/maximum, and length bounds. No new runtime
   dependency — this is why the subset is deliberately small.
6. Treat tool argument validation as `ToolError`/`isError: true`, per SEP-1303.
7. Make unknown user-correctable entities consistent `ToolError`s with suggestions,
   using the WP-A relevance floor and corpus-scoped language.
8. Exit on uncaught exceptions after writing diagnostics to stderr.
9. Construct status/resource handlers directly rather than recreating all tools, and
   support async handlers (MCP-006).
10. Sanitise error text: no internal identifiers, no `undefined`, no absolute paths
    (MCP-007).
11. Re-audit capability and tool annotations, including `openWorldHint` for workspace
    content.

Tests:

- Full initialization ordering matrix, including `tools/list` before `initialize`.
- Batch-like invalid inputs even if batching remains unsupported.
- Malformed JSON, scalar JSON, missing method, invalid IDs, bad params, unknown method,
  unknown tool, invalid tool input, notification errors, and shutdown behavior.
- Every declared tool schema receives generated negative cases, including the three
  reproduced in §3.6.
- Stdout remains protocol-only under all failures.

Definition of done:

- Behavior matches MCP 2025-11-25 and JSON-RPC 2.0 for every supported path.
- Existing tests that assert successful not-found responses are replaced with the
  repository's documented `ToolError` contract.

### WP-8 — Hook redesign

Depends on: WP-A, WP-2, WP-3
Addresses: HOK-001 through HOK-009

Note the changed dependency: WP-A already removed the false errors, so this package is
about *restoring* justified strictness rather than *reducing* harm.

Tasks:

1. Read the resulting file after PostToolUse rather than validating only inserted
   snippets, where the Claude hook payload provides a safe file path.
2. Restrict reads to the active project root.
3. Parse `.conf` syntax including unset assignments (`# CONFIG_FOO is not set`) and
   continuation behavior.
4. Parse DTS compatible arrays across lines; do not use line-only extraction.
5. Report actual file line numbers.
6. Re-enable the `BOARD_`, `SOC_`, and `DT_` families now that the catalogue can
   distinguish generated from invented symbols (HOK-003).
7. Implement promptless-assignment detection as a **definitive** error (HOK-009) — it
   is decidable from `has_prompt` and matches a real Zephyr build failure.
8. Separate findings into:
   - definitive error (type mismatch, promptless assignment, malformed syntax);
   - context-dependent advisory (existence, when coverage is incomplete);
   - validator infrastructure failure.
9. Emit exit 2/stderr only for useful model-visible findings.
10. Surface an actionable warning when validation is unavailable because an index is
    corrupt or incompatible; do not silently pretend validation succeeded (HOK-006).
11. Add schema and fingerprint checks to SessionStart.
12. Keep devicetree property-name validation out of the hook unless a resolved node
    and binding context is available.
13. Restore hard existence errors only when `IndexDescriptor.coverage` proves the
    relevant corpus complete for the active context.

Tests:

- Full-file create and partial edit.
- Valid and invalid unset Kconfig syntax.
- Multiline compatible arrays, asserting that the *second* compatible is checked.
- Generated Kconfig symbol and `microchip,mpfs-mailbox` regressions.
- Promptless-symbol assignment produces a definitive error.
- Corrupt/missing/stale index produces a visible warning, not silence.
- Paths outside the project root.
- Silent success and exit-2/stderr failure behavior.

### WP-9 — Skill and agent correctness program

Depends on: WP-A, WP-2 through WP-7
Addresses: SKL-001 through SKL-008, KCF-006, VND-001

Tasks:

1. Audit every skill statement against pinned Zephyr documentation and source.
2. Correct all remaining invalid symbols and snippets from the finding register
   (WP-A handled the five known ones; this is the systematic sweep).
3. Add verification metadata around complete code blocks. Metadata should declare:
   - target board or `native_sim`;
   - required files;
   - expected build command;
   - whether the block is illustrative or compile-verified.
4. Build a script that extracts verified examples into temporary Zephyr applications
   and compiles them.
5. Scan all literal `CONFIG_` references against the semantic catalogue. Require an
   explicit annotation for placeholders or external-module symbols.
6. Scan literal compatibles and API names similarly.
7. Replace absolute reviewer rules with context-aware rules and examples.
8. Correct synchronization guidance using atomics, locks, queues, or documented
   single-context ownership rather than `volatile`.
9. Ensure bundled examples follow the reviewer doctrine they teach.
10. Make read-only agents deny Bash or restrict them to a fixed read-only command set
    covered by mutation-attempt tests. `zephyr-architect` and `firmware-reviewer` both
    claim not to edit and both currently can.
11. Reconsider hard-coded models; document why a model is required or inherit the
    user's configured model.
12. Keep every skill below the repository's approximate 500-line limit and preserve
    progressive disclosure.

Required build matrix:

- `native_sim` for generic kernel/testing/networking examples where applicable.
- At least one maintained STM32 board for STM32/pinctrl/driver examples.
- At least one maintained ESP32 board for ESP32 examples.
- Compile-only checks for hardware-dependent paths, with runtime tests where emulation
  supports them.

Per REL-007 this matrix runs in the slow CI job, not on every commit.

Definition of done:

- No unannotated skill symbol is absent from the applicable corpus.
- Every code block labeled complete/verified builds.
- Illustrative fragments are clearly marked and never presented as drop-in programs.
- Agent permissions match their stated operating mode.

### WP-10 — Safe fetch, atomic build, and distribution

Depends on: WP-0, WP-1
Addresses: REL-003 through REL-007

Tasks:

1. Restrict default fetch destinations to the repository cache.
2. For custom destinations, require an explicit initialized ownership marker before
   replacement.
3. Never recursively delete an arbitrary path because it merely contains `.git`.
4. Clone into a temporary sibling, verify remote/tag/commit, then atomically rename.
5. Build indexes through the atomic process in section 6.4.
6. Define the default-index distribution model:
   - release asset with checksum/signature and descriptor; or
   - deterministic local build as an explicit first-run step.
7. Add download size, progress, cancellation, checksum, retry, and offline behavior.
8. Document Zephyr-derived data provenance, license notices, and update support.
9. Fill in `SECURITY.md`, release notes/changelog, supported versions, and vulnerability
   reporting (skeletons created in WP-0).
10. Document the trust boundary for indexing arbitrary workspace modules and remind
    skills that indexed content is reference data, not executable model instruction.
11. Document the §4.3 ingest toolchain contract in user-facing installation docs, since
    it becomes a first-run requirement for workspace indexes.

Acceptance criteria:

- Interrupting fetch/build leaves the previous checkout/index usable.
- A custom directory without the ownership marker is never deleted.
- A tampered download is rejected before use.
- A fresh plugin install has one documented, tested path from no index to ready state.
- A machine without Python produces the actionable §4.3 error, not a traceback.

### WP-11 — STM32 and ESP32 vendor-pack strategy

Depends on: WP-1 through WP-7, WP-10
Addresses: VND-001

Prerequisite: source and licensing constraints

1. Define "Zephyr-on-STM32/ESP32 support" separately from vendor-native SDK support.
2. Inventory authoritative sources:
   - Zephyr HAL modules and board/SoC metadata;
   - STM32Cube HAL/LL source and device metadata;
   - STM32 reference manuals, datasheets, and errata where redistribution permits;
   - ESP-IDF headers/docs and ESP32 technical references/errata.
3. Record license, redistribution, versioning, and update strategy for every source.
4. Decide whether large/proprietary manuals are locally indexed, remotely queried, or
   represented only by metadata/link references.

Dependent implementation: isolated packs

1. Use separately versioned databases or attached schemas rather than mixing vendor
   facts invisibly into the Zephyr corpus.
2. Add provenance fields to every result.
3. Make tools disambiguate Zephyr API, STM32 HAL/LL, and ESP-IDF APIs.
4. Add silicon revision and errata awareness where source licensing permits.
5. Test representative clock, pinmux, DMA, low-power, radio, boot, flash, and debug
   workflows on real hardware before making production guarantees.

Definition of done:

- Marketing and tool descriptions accurately state which knowledge pack answered a
  question and its exact version.
- No vendor-native API is presented as a Zephyr API or vice versa.

### WP-12 — Documentation truth pass and public release

Depends on: WP-A, WP-0 through WP-10, excluding optional WP-11
Addresses: all user-facing claims

Tasks:

1. Rewrite README coverage counts from the final release artifact, generated by
   `scripts/quality/counts.mjs` rather than transcribed.
2. Update architecture to describe the implemented Kconfig and devicetree semantics,
   project identity, index storage, and limitations.
3. Replace every absolute claim with either a linked executable quality gate or precise
   limitation language. The specific claims to re-check are the README failure-modes
   table (all four rows), the `plugin.json` description, the coverage table, and the
   `AGENTS.md` invariants list.
4. Document installation, first index creation, upgrades, schema mismatch, offline use,
   multi-project behavior, the ingest toolchain contract, and recovery.
5. Publish tool and skill coverage tables.
6. Add a release checklist and rollback procedure.
7. Run a clean-room install from the actual marketplace artifact, not the source tree.
8. Tag only after the release artifact passes the complete gate.

## 8. Cross-cutting test strategy

### 8.1 Test layers

1. **Parser/unit tests**: inline fixtures for every syntax branch and negative case.
2. **Pinned-tree conformance tests**: compare adapters against Zephyr's own tools.
3. **Corpus-quality SQL tests**: reject known pollution, missing data, orphan rows, and
   unexplained count drift.
4. **MCP stdio tests**: real process, lifecycle, schemas, errors, and tool behavior.
5. **Plugin process tests**: exact `.mcp.json` environment and installed-directory
   layout.
6. **Hook tests**: real JSON payloads, final-file reads, stderr, and exit codes.
7. **Skill compile tests**: extracted complete examples built with west (slow job).
8. **Clean-room release tests**: marketplace install into empty plugin data.
9. **Hardware smoke tests**: representative STM32 and ESP32 boards. **Scoped to WP-11
   only.** Requiring physical hardware to ship the first Zephyr-only release would
   block indefinitely on lab access for no corresponding correctness gain — every
   WP-A..WP-10 claim is verifiable in software.

### 8.2 Corpus quality gates

The release build must assert at least the following. Each is a script under
`scripts/quality/`, each prints its measured value, and each has a checked-in baseline
so drift is visible in review.

- SQLite integrity and foreign-key checks pass.
- Every external-content FTS table has exact content-row parity.
- No discovered file disappears without an indexed/excluded/error outcome.
- No unresolved Kconfig preprocessor identifier is indexed as a symbol (from 45 → 0).
- Kconfig recall over `samples/`+`snippets/` `.conf` assignments is complete after
  checked-in, source-backed exclusions (from 139 unexplained → 0).
- Binding **declaration** coverage is 100% with no exclusions (from 3,347/3,348 →
  3,348/3,348).
- Binding **resolution** coverage is 100% over compatibles that have a binding file,
  with bindingless root-node compatibles excluded by tested rule (DTS-008).
- Source and indexed child-binding depths agree (from max depth 1 → source depth).
- No API function contains enum-assignment syntax (from 110 → 0).
- Every board exposed by the canonical board tool has the expected targets (from 6
  zero-target boards → 0).
- Every sample's inherited metadata matches Twister semantics.
- Eligible and stored sample-file counts agree (from 4,722/5,388 → equal).
- Every stored documentation URL resolves to exactly one page.
- Empty documentation chunks are absent or explicitly justified (from 701 → 0).
- Coverage-count changes require a checked-in fixture update containing the generated
  count diff and its source-derived explanation.

### 8.3 Test skip policy

- Unit tests may use explicit capability-based skips.
- The release gate must set `ZEPHYR_AI_RELEASE_TEST=1` or equivalent, under which any
  missing required input is a failure.
- Test output must print a suite summary including pass/fail/skip counts.
- CI must fail when release-required skip count is nonzero.

### 8.4 Performance and size budgets

Preserve the current fast startup and index experience while prioritizing correctness.
Record each baseline in WP-0 so later regressions are attributable:

- MCP cold startup: measure the current 43 KB bundle before WP-7 and treat that as the
  ceiling; the schema validator must not meaningfully move it.
- Simple indexed tool call: establish p50/p95 baselines and prevent major regressions.
- Default index size: currently 75,157,504 bytes at schema v1. WP-2 and WP-3 both add
  rows to the largest tables, so set an explicit ceiling (suggested: 150 MiB) and
  require interning of any newly added repeated text. An index that no longer fits
  comfortably in a plugin data directory is a product regression even if it is more
  correct.
- Full ingest: the current approximately four-second raw parse is not a hard target.
  Semantic correctness will cost more — invoking Kconfiglib and the devicetree loader
  is minutes, not seconds — but CI and local build budgets must be stated, and the
  `zephyr-index` skill must set user expectations accordingly.
- Runtime server continues to have no package installation or native build step.

## 9. Security and safety requirements

1. Treat source text from workspace modules as untrusted model-facing content.
2. Preserve provenance in every tool response and label source excerpts as reference
   material.
3. Never execute commands found in indexed content.
4. Restrict hook file reads to canonical project roots.
5. Parameterize every SQL value, including fallback searches.
6. Escape FTS and `LIKE` metacharacters intentionally.
7. Validate explicit index paths as regular readable files, then validate schema and
   descriptor before querying.
8. Reject symlink/path traversal during include and literalinclude processing.
9. Avoid recursive deletion unless the exact target has a tool-created ownership
   marker and has been resolved to a safe canonical path.
10. Verify downloaded artifacts cryptographically before activation.
11. Keep stdout free of logs and secrets; diagnostics go to stderr.
12. Do not expose private absolute paths through normal MCP responses — including
    JSON-RPC error `message` fields, which currently forward raw exception text
    (MCP-007).

## 10. Documentation and specification references

Implementation should be checked against these authoritative sources:

- [MCP 2025-11-25 lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)
- [MCP server tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [SEP-1303 tool input validation errors](https://modelcontextprotocol.io/seps/1303-input-validation-errors-as-tool-execution-errors)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code MCP configuration](https://code.claude.com/docs/en/mcp)
- [Claude Code hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents)
- [Agent Skills specification](https://agentskills.io/specification)
- [Zephyr Kconfig extensions](https://docs.zephyrproject.org/latest/build/kconfig/extensions.html)
- [Zephyr Kconfig setting and multiple definitions](https://docs.zephyrproject.org/latest/build/kconfig/setting.html)
- [Zephyr Kconfig tips](https://docs.zephyrproject.org/latest/build/kconfig/tips.html)
- [Zephyr Kconfig tracing](https://docs.zephyrproject.org/latest/build/kconfig/tracing.html)
- [Zephyr devicetree binding syntax](https://docs.zephyrproject.org/latest/build/dts/bindings-syntax.html)
- [Zephyr board porting and qualifiers](https://docs.zephyrproject.org/latest/hardware/porting/board_porting.html)
- [Zephyr Ztest](https://docs.zephyrproject.org/latest/develop/test/ztest.html)
- [Zephyr SMP](https://docs.zephyrproject.org/latest/kernel/services/smp/smp.html)
- [ESP32 DevKitC board documentation](https://docs.zephyrproject.org/latest/boards/espressif/esp32_devkitc/doc/index.html)
- [Context7 Claude Code plugin pattern](https://context7.com/docs/clients/claude-code)

In-tree authorities that settle the corresponding findings, and which a future session
should read before re-litigating them:

- `.cache/zephyr/scripts/kconfig/kconfig.py` — warnings-to-errors policy (KCF-006).
- `.cache/zephyr/cmake/modules/kconfig.cmake` — `hardenconfig` vs `traceconfig`
  (KCF-006).
- `.cache/zephyr/dts/bindings/mbox/microchip,mpfs-mailbox.yaml` — the `const`
  compatible form (DTS-001).
- `.cache/zephyr/boards/st/nucleo_n657x0_q/twister.yaml` — `twister.yaml` without
  `identifier:` (BRD-001).

The pinned Zephyr source remains the authority for release-specific behavior when the
latest online documentation differs from `v4.4.2`.

## 11. Executable release predicates

These predicates are not a schedule. Each can be exercised as soon as its declared
work-package dependencies exist. A public artifact must satisfy all non-optional
predicates simultaneously.

### Harm-reduction predicate *(new — satisfiable immediately)*

- WP-A complete.
- No tool or hook asserts nonexistence in absolute terms.
- The two known false-positive fixtures (`CONFIG_SENSOR_LOG_LEVEL_DBG`,
  `microchip,mpfs-mailbox`) do not produce errors.
- The type-mismatch fixture still errors, proving the validator was narrowed rather
  than disabled.

This predicate does not authorise a public release. It exists so that a partial
programme still leaves the plugin safer than it is today, and so that any interim
internal use is not actively harmful.

### Semantic-foundation predicate

- WP-0 through WP-3 complete.
- Kconfig and devicetree corpus gates pass, including both DTS-008 gates.
- Project-specific indexes cannot cross-contaminate.
- Hard validator false-positive regressions pass.

### Knowledge-corpus predicate

- WP-4 through WP-6 complete.
- Documentation includes resolve.
- API precision gate passes.
- Board and sample data match upstream tools.

### Plugin-behavior predicate

- WP-7 through WP-9 complete.
- MCP protocol negative matrix passes.
- All verified skill examples compile.
- Hooks are context-aware and tested, and any restored hard error is justified by a
  proven-complete corpus.

### Distribution-safety predicate

- WP-10 complete.
- Clean-room install and first-run setup pass.
- Fetch and index replacement are interruption-safe.
- The ingest toolchain contract is detected and reported, not assumed.
- Security and provenance documentation exists.

### Public-artifact predicate

- WP-12 complete.
- All README/architecture claims are backed by the release artifact.
- `npm run check` passes with zero release-required skips.
- Bundle hashes match committed artifacts.
- Marketplace artifact, not merely the source tree, passes end-to-end testing.
- A release rollback path has been exercised.

WP-11 vendor packs are not required for the first accurate Zephyr-only release, but
public language must not claim comprehensive STM32Cube or ESP-IDF coverage until it is
complete.

## 12. Technical dependency graph

```text
WP-A harm reduction  (no dependencies — do this first)
  └─> WP-0 baseline and CI
        └─> WP-1 identity/discovery
              ├─> WP-2 Kconfig ─────────────┐
              ├─> WP-3 devicetree ──────────┴─> WP-8 hooks
              ├─> WP-4 documentation ───────┐
              ├─> WP-5 API ─────────────────┤
              ├─> WP-6 boards/samples ──────┼─> WP-9 skills/agents
              ├─> WP-7 MCP hardening ───────┘
              └─> WP-10 safe distribution

WP-1..WP-7 + WP-10 ─> WP-11 optional vendor packs
WP-A, WP-0..WP-10, excluding WP-11 ─> WP-12 release truth pass
```

The following work is technically independent after WP-1 and may execute concurrently
without creating ordering assumptions:

- Kconfig and devicetree adapters.
- Documentation and API pipelines.
- Board/sample semantics and MCP protocol hardening.

Do not restore hard edit-time validation or finalize skill wording while the semantic
corpus it relies on is still changing.

If the programme is ever cut short, the acceptable stopping points are after WP-A
(safe but limited) or after the semantic-foundation predicate (safe and substantially
correct). Stopping mid-WP-2 or mid-WP-3 leaves the schema and the corpus inconsistent
and is worse than not starting.

## 13. Repository implementation invariants

1. Bump `SCHEMA_VERSION` whenever schema or stored semantics change.
2. Rebuild both plugin `.mjs` artifacts after source changes.
3. Rebuild the database after parser, collector, schema, or upstream pin changes.
4. Include a finding ID in changes that remediate this plan.
5. Add the failing regression test before or with each fix.
6. Do not lower a corpus-quality threshold unless the missing source records are
   represented by a checked-in exclusion, evidence, and a test for that exclusion.
7. Update README/architecture claims in the same change that alters behavior.
8. Preserve backwards compatibility only where it does not conceal schema or context
   mismatch; immutable indexes should normally be rebuilt.
9. Do not add runtime dependencies to the MCP server. The §4.3 Python contract is
   ingest-only and must never reach the server bundle or the hook scripts.
10. Every quantitative claim ships as a script under `scripts/quality/`, never as a
    number in prose.
11. Run the complete `npm run check` before declaring a work package complete.

## 14. Definition of release-ready

The project is release-ready only when all of the following are true:

- The plugin installed from its marketplace artifact can create or acquire an index
  and use it without source-repository assumptions.
- Every exact result identifies the Zephyr commit and context that supports it.
- Kconfig and binding misses are trustworthy within the stated context, and a miss the
  corpus cannot prove is labeled as such.
- Multiple projects and module sets remain isolated.
- Corpus build failures never silently drop source material.
- Documentation search includes build documentation and resolved shared content.
- API search has a measured precision gate and no known declaration-class pollution.
- Board targets and sample metadata agree with Zephyr's own tooling.
- MCP lifecycle, validation, and JSON-RPC errors conform to their specifications.
- Skills contain no unverified drop-in code and all verified examples compile.
- Hooks have a very low false-positive rate and distinguish uncertainty from proof.
- Fetching, downloading, and indexing are recoverable and do not risk unrelated user
  data.
- CI runs the real pinned-tree and real-process suites with zero required skips.
- User-facing documentation describes implemented behavior and current limitations.

## 15. First dependency-valid implementation slice

WP-A is the only work package with no dependencies, and it is deliberately small.
Its implementation slice is:

1. Downgrade hook existence misses to advisory; keep the type-mismatch error.
2. Add the relevance floor to hook and tool suggestions.
3. Replace absolute miss prose with corpus-scoped language behind one shared helper.
4. Fix the five nonexistent Kconfig symbols in skills and the four false prose claims.
5. Add the two false-positive fixtures as **passing** tests — they pass because the
   behaviour changed, not because the subsystem was rewritten.

WP-0 then follows:

1. Establish the Git baseline, capturing WP-A's corrected behaviour.
2. Add `check:quick` while making `check` require real integration inputs, and correct
   the `CLAUDE.md`/`AGENTS.md` claims about it.
3. Add the split fast/slow CI workflow.
4. Add audit regression fixtures for:
   - generated Kconfig symbol lookup;
   - `microchip,mpfs-mailbox` lookup;
   - tools before MCP initialization;
   - invalid tool schema bounds;
   - same-version/different-project index selection;
   - index creation after first lookup failure;
   - build documentation page discovery.
5. Register each fixture that WP-A did not already fix as an explicit expected failure
   outside the passing release gate, then convert it to a required passing test in the
   work package that fixes its dependent subsystem. The public-artifact predicate
   permits no expected failures.
6. Begin WP-1 with the shared descriptor and project-scoped path design.

This sequence removes the worst user-visible harm in days rather than months, then
creates an honest gate, and preserves each high-value audit finding as a regression
test before the larger semantic pipelines are replaced.
