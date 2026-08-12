# Architecture

## Goal

Give Claude Code enough grounded, version-exact knowledge of Zephyr RTOS — and of the
STM32 and ESP32 silicon it runs on — to write firmware that builds and runs on the
first or second attempt rather than the tenth.

## The problem this solves

An LLM writing Zephyr firmware fails in a small number of highly repeatable ways:

| Failure | Why it happens | What fixes it |
| --- | --- | --- |
| Invents `CONFIG_` symbols that do not exist | ~24 k symbols across 6.8 k Kconfig files, many renamed between releases | Exact symbol lookup with type, defaults, and dependencies |
| Invents devicetree properties | 3.7 k binding files, and properties are inherited through `include:` chains that are never visible in one file | Flattened per-compatible property tables |
| Uses the wrong board target name | Board targets are qualified (`esp32s3_devkitc/esp32s3/procpu`), not bare names | Board catalog with qualifiers and supported-feature lists |
| Mixes API generations | `device_get_binding()` vs `DEVICE_DT_GET()`, old vs new GPIO/sensor APIs | Version-pinned docs and API index |
| Writes code for the wrong Zephyr version | The user's tree is pinned to a release that is not the newest | Index the user's *actual* workspace, not just upstream |

Prose documentation search alone does not fix any of these. The high-value data is
*structured* and lives outside `doc/`: in Kconfig files, devicetree bindings, board
metadata, and headers. So the index covers all of it.

## Corpus

Measured against Zephyr v4.4.2 (commit `dccb0959`, 612 MB shallow checkout):

| Source | Count | Location |
| --- | --- | --- |
| Documentation pages (reStructuredText) | 746 | `doc/**/*.rst` |
| Devicetree bindings | 3 725 | `dts/bindings/**/*.yaml` |
| Kconfig files | 6 814 | `**/Kconfig*` |
| Boards | 973 | `boards/*/*/board.yml` |
| Board targets (twister metadata) | ~1 400 | `boards/*/*/*.yaml` |
| SoCs | 126 `soc.yml` families | `soc/*/*/soc.yml` |
| Samples | 610 | `samples/**/sample.yaml` |
| Public headers | 1 982 | `include/zephyr/**/*.h` |
| Devicetree sources | 5 204 | `**/*.dts`, `**/*.dtsi` |

Board documentation also lives per-board in `boards/<vendor>/<board>/doc/index.rst`
— pinouts, jumper settings, and flashing instructions — and is indexed alongside the
main documentation set.

## Shape: three separable pieces

```
┌──────────────┐   builds    ┌──────────────┐   reads    ┌──────────────┐
│  ingest      │ ──────────▶ │  index.db    │ ◀───────── │  mcp-server  │
│  (dev-time)  │             │  SQLite/FTS5 │            │  (runtime)   │
└──────────────┘             └──────────────┘            └──────────────┘
       ▲                                                        ▲
       │ Zephyr tree (pinned upstream, or the user's workspace)  │ declared by
                                                                 │
                                                          ┌──────────────┐
                                                          │  plugin      │
                                                          │  skills,     │
                                                          │  agents,     │
                                                          │  hooks       │
                                                          └──────────────┘
```

The pieces are independently useful and independently testable. `ingest` runs at
development time and may use whatever dependencies it likes. `mcp-server` runs on
every Claude Code session, so it is bundled to a single dependency-free `.mjs` file
and uses Node's built-in `node:sqlite` — no native modules, no install step, no
compilation on the user's machine.

### Why not the official MCP SDK

`@modelcontextprotocol/sdk` depends on `express`, `hono`, `jose`, `cors`, `ajv`, and
`zod` because it ships every transport. This server speaks stdio only, where the
protocol is newline-delimited JSON-RPC 2.0. The protocol layer is hand-written
(~250 lines) against the `2025-11-25` specification and covered by a conformance
test, keeping the shipped bundle small and session startup fast.

### Why not a git submodule for the Zephyr tree

A submodule would push 612 MB onto everyone who clones this repository, including
people who only want the plugin. The tree is a *build input*: pinned by commit in
`zephyr.lock.json`, fetched into gitignored `.cache/` by `scripts/fetch-zephyr.mjs`,
and reproducible because the script verifies the checked-out commit against the lock.

## Index schema

One SQLite database. Structured tables hold facts; FTS5 external-content tables
provide BM25 ranked search without duplicating the text.

```
meta(key, value)                     -- schema version, zephyr version/commit, doc base URL, source kind

doc(id, path, url, title, area)      -- one row per .rst page
doc_chunk(id, doc_id, anchor, heading, heading_path, ord, body)
doc_fts                              -- FTS5 over (title, heading_path, body)

kconfig(id, name, type, prompt, help, defaults, depends, selects,
        implies, ranges, defined_in, menu_path, is_choice, n_defs)
kconfig_edge(from_sym, to_sym, kind) -- select/imply/depends, for reverse lookup
kconfig_fts                          -- FTS5 over (name, prompt, help)

dt_binding(id, compatible, path, description, bus, on_bus, includes, cells)
dt_property(id, binding_id, name, type, required, description, const,
            default_value, enum_values, inherited_from, child_level)
dt_fts                               -- FTS5 over (compatible, description, property names)

board(id, name, full_name, vendor, dir, socs, targets, arch, ram, flash,
      toolchains, supported, doc_path, revisions)
soc(id, name, series, family, vendor, arch, dir)
board_fts                            -- FTS5 over (name, full_name, vendor, soc, supported)

sample(id, path, name, description, tags, depends_on, integration_platforms, files)
sample_fts                           -- FTS5 over (name, path, description, tags)

api_symbol(id, name, kind, signature, header, group, brief, detail,
           params, returns, since, doc_url)
api_fts                              -- FTS5 over (name, brief, detail)
```

Two design points worth stating:

**Devicetree include resolution.** `st,stm32-spi.yaml` declares no properties at all;
it `include:`s `st,stm32-spi-common.yaml`, which reaches `spi-controller.yaml` and
`base.yaml`. Asking "what properties does `st,stm32-spi` accept" is unanswerable from
any single file. Ingestion resolves the include graph — honouring `property-allowlist`
and `property-blocklist` filters and `child-binding` nesting — and stores the
*flattened* property set, recording `inherited_from` so provenance survives.

**Kconfig aggregation.** Zephyr defines the same symbol in many files to layer
per-board and per-SoC defaults. Ingestion parses definitions without fully evaluating
the configuration (which would require a board and toolchain context), aggregates them
per symbol, and tracks enclosing `if`/`menu`/`choice` blocks so each definition carries
its real dependency context and menu path.

## MCP server

Protocol `2025-11-25`, stdio transport. Thirteen tools in `search` / `get` pairs — the
search returns ranked summaries with stable identifiers, the get returns full detail.
This keeps the model's context small until it has decided what it needs.

| Tool | Purpose |
| --- | --- |
| `search_docs` / `get_doc` | Prose documentation, chunked by section, with upstream URLs |
| `search_kconfig` / `get_kconfig` | Symbol existence, type, defaults, dependencies, reverse `select` |
| `search_bindings` / `get_binding` | Compatible → flattened property set with types and requiredness |
| `search_boards` / `get_board` | Board targets, qualifiers, SoC, supported features, flash/RAM |
| `search_samples` / `get_sample` | Working reference code, including `prj.conf` and overlays |
| `search_api` / `get_api` | C symbols with signature, parameters, return values |
| `index_status` | Which Zephyr version is indexed and where it came from |

Structured content is returned alongside text so the model gets typed data rather than
re-parsing prose.

**Workspace awareness is the differentiator.** Firmware projects pin a Zephyr version
and carry vendor HAL modules (`hal_stm32`, `hal_espressif`) with their own bindings and
Kconfig. On startup the server resolves, in order: an explicit `ZEPHYR_AI_INDEX`, an
index built for the project's own west workspace (discovered via MCP `roots/list` or
`ZEPHYR_BASE`), then the shipped upstream index. Serving the user's actual tree removes
version drift entirely, which is the single largest source of wrong firmware code.

## Plugin composition

The plugin declares the MCP server and layers behaviour on top of it.

**Skills** encode workflow and judgement — the things a tool call cannot supply:
project bootstrap and west workspace layout, devicetree overlay authoring, Kconfig
strategy, driver and sensor integration, power management, Bluetooth, networking,
testing with twister and ztest, debugging, and board bring-up. Each skill teaches the
model to reach for the MCP tools *before* writing code, which is what converts the
index into correct output.

**Agents** handle work that deserves its own context window: a firmware architect for
design decisions, a build-failure triager that reads CMake/Kconfig/devicetree errors
and traces them to root cause, a devicetree specialist, and a firmware reviewer that
checks for the failure modes embedded systems actually suffer from — ISR-context
violations, stack sizing, blocking calls in the wrong place, unchecked returns.

**Hooks** enforce the mechanical parts: validating devicetree and Kconfig edits as they
happen, and surfacing build diagnostics.

## Vendor packs: STM32 and ESP32

Zephyr's own tree already carries most of what these platforms need — boards, SoCs,
pinctrl bindings, and per-board documentation are all indexed by the pipeline above and
are queryable by vendor. The vendor packs add what the tree does not explain:

- Which runner flashes which board (`stm32cubeprogrammer`, `openocd`, `pyocd`,
  `esp32`/`esptool`), and the arguments each needs
- Pinctrl conventions, which differ sharply between the two families
- Clock tree and power domain configuration in devicetree
- ESP32 multi-core targets (`procpu`/`appcpu`), partition tables, and sysbuild
- STM32 series differences that change driver availability

## Distribution

The plugin is published through a marketplace manifest at the repository root. The MCP
server ships as a committed, bundled `.mjs`. The index is the one large artifact; it is
fetched or built into `${CLAUDE_PLUGIN_DATA}`, which survives plugin updates, rather
than living in the plugin directory that gets re-copied on every version bump.

## Non-goals

- Not a device control plane. This does not flash or talk to hardware over the MCP
  connection; `west` already does that, and the plugin drives `west` through skills.
- Not a Kconfig evaluator. Full evaluation requires board and toolchain context and is
  `west build`'s job. The index answers what exists and what it depends on.
- Not a devicetree compiler. It answers what a binding permits, not what a specific
  board's resolved tree contains.
