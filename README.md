# zephyr-ai

A Claude Code plugin for grounded Zephyr RTOS firmware development, with focused
guidance for STM32 and ESP32 targets.

The plugin combines a project-scoped SQLite knowledge index, thirteen MCP tools,
fifteen workflow skills, four specialist agents, and conservative edit hooks. Exact
answers identify the Zephyr source context that supports them; catalogue misses are
reported as uncertainty unless coverage proves otherwise.

## Why it exists

Zephyr failures often come from structured facts that prose search cannot settle:

| Failure mode | Grounded response |
| --- | --- |
| A misspelled or renamed `CONFIG_` assignment fails Kconfig processing | Query evaluated Kconfiglib declarations, types, alternative definition contexts, defaults, and reverse selects before editing |
| A devicetree node uses a property inherited several bindings away | Query the compatible's recursively flattened property set, types, constraints, and provenance |
| A build uses the wrong board or qualifier | Query targets derived through Zephyr's board tooling, including revisions and CPU clusters |
| Code targets another Zephyr revision | Build an index from the project's actual Git tree and module state, then compare its fingerprint at runtime |

The hook catches only what the available evidence proves, such as malformed
configuration, a known type mismatch, or assigning a known promptless symbol. It does
not turn an incomplete catalogue miss into a claim that valid workspace syntax is
impossible.

## Install and first index

```bash
claude plugin marketplace add mssaleh/zephyr-ai
claude plugin install zephyr-ai@zephyr-ai
```

Open a Zephyr project and ask Claude:

> Build the Zephyr index for this project.

The `zephyr-index` skill finds the west workspace or `ZEPHYR_BASE`, then runs the
bundled indexer. Index creation requires:

- Node.js 22.13 or newer (`node:sqlite` with FTS5);
- Python 3.10 or newer;
- the target tree's `scripts/kconfig/kconfiglib.py` and
  `scripts/dts/python-devicetree`;
- PyYAML in the selected Python environment. The indexer prefers the interpreter
  behind `west`; set `PYTHON_EXECUTABLE` when a different environment is required.

No npm packages or native SQLite modules are installed at plugin runtime. The Python
contract applies only while creating an index. `npm run build:index` prints the
machine-specific build duration, while `npm run quality:counts` records the exact
resulting size and corpus counts; both vary with the selected tree and storage.

For source-repository development:

```bash
git clone https://github.com/mssaleh/zephyr-ai
cd zephyr-ai
npm install
npm run fetch:zephyr
npm run build
npm run build:index
ZEPHYR_AI_INDEX="$PWD/index/zephyr.db" claude --plugin-dir "$PWD/plugin"
```

## Capabilities

### MCP tools

| Tools | Answers |
| --- | --- |
| `search_kconfig` / `get_kconfig` | Symbol declarations, type, prompt/assignability, independent definition contexts, defaults, ranges, selects and implies |
| `search_bindings` / `get_binding` | Compatible properties, recursive child bindings, constraints, provenance, and a type-aware skeleton |
| `search_boards` / `get_board` | Exact targets, revisions, SoCs, features, and board documentation |
| `search_api` / `get_api` | Public C declarations, parameters, return contracts, groups, and Doxygen anchors when semantic XML is used |
| `search_samples` / `get_sample` | Twister metadata, platform evidence, README, configuration, overlays, and source files |
| `search_docs` / `get_doc` | Section-level documentation with resolved includes, source origins, and official URLs |
| `index_status` | Schema, builder, commit, source-tree/module fingerprint, coverage, project/manifest match, and stored-index usage |

### Skills and agents

The fifteen skills cover project setup, Kconfig, devicetree, build/flash, debugging,
RTOS patterns, drivers and sensors, power, Bluetooth, networking, testing, indexing,
and STM32/ESP32 platform workflows. Fenced snippets are explicitly illustrative unless
their metadata identifies a release-gated example.

| Skill group | Included skills | Coverage boundary |
| --- | --- | --- |
| Project foundation | `zephyr-project-setup`, `zephyr-development`, `zephyr-index` | Workspace layout, grounded implementation workflow, and project index lifecycle |
| Configuration and hardware | `zephyr-kconfig`, `zephyr-devicetree`, `zephyr-drivers-sensors` | Semantic configuration/binding lookup, overlays, buses, devices, and sensors |
| Kernel behavior | `zephyr-rtos-patterns`, `zephyr-power` | Concurrency, timing, ISR boundaries, synchronization, and Zephyr power workflows |
| Connectivity | `zephyr-bluetooth`, `zephyr-networking` | Zephyr Bluetooth and networking configuration/API workflows |
| Build confidence | `zephyr-build-flash`, `zephyr-debugging`, `zephyr-testing` | Build/flash/debug diagnosis and ztest/Twister workflows |
| Vendor platforms | `stm32-platform`, `esp32-platform` | Zephyr-native STM32 and ESP32 board/SoC workflows; no STM32Cube or ESP-IDF claim |

The bundled agents are `zephyr-architect`, `build-triage`,
`devicetree-specialist`, and `firmware-reviewer`. Read-only agents deny Bash and inherit
the user's model selection.

### Hooks

- `SessionStart` validates schema, descriptor fingerprint, project identity, and
  Zephyr commit and makes stale or missing validation visible.
- `PostToolUse` reads the final edited file inside the canonical project root. It
  handles Kconfig continuations/unset syntax and multiline DTS compatible arrays,
  reports final-file line numbers, and is silent on success.

## Audited pinned-corpus measurements

`npm run quality:counts` derives these values from the current schema-5 development
index for Zephyr v4.4.2, commit
`dccb09599635bdff17633fa7e9dab014b91dce90`:

| Corpus | Indexed rows |
| --- | ---: |
| Documentation pages / non-empty sections | 2,115 / 16,664 |
| Kconfig symbols | 20,973 |
| Devicetree binding rows / recursively flattened properties | 3,443 / 120,569 |
| Boards / build targets / SoCs | 1,014 / 2,324 / 1,475 |
| Samples / stored eligible files | 610 / 5,930 |
| Public API symbols / groups (header fallback) | 33,814 / 1,006 |

The semantic gates additionally prove zero unexplained sample/snippet Kconfig misses
after source-backed exclusions, 100% coverage of 3,348 declared compatibles and 3,198
resolvable compatible uses, matching source/index child-binding depth of three, all 37
build-manual pages, no empty documentation chunks, no board without targets, and exact
sample-file parity. Run `npm run quality:semantic` to reproduce those measurements.

The ordinary local index labels API coverage incomplete because it uses a conservative
header fallback. Public-release validation uses Doxygen XML through
`npm run check:release`; API responses state when documentation is absent rather than
inventing a contract.

## Index identity, storage, and lookup

Project indexes are immutable artifacts under:

```text
${CLAUDE_PLUGIN_DATA}/indexes/projects/<project-id>/<context-fingerprint>/zephyr.db
```

An atomic `active.json` selects one fingerprint. The active context and four most
recently used prior contexts are retained. A failed build never replaces the active
database.

Resolution order is intentionally narrow:

1. `ZEPHYR_AI_INDEX`, which is strict and never falls through when invalid;
2. the active fingerprinted index for `ZEPHYR_AI_PROJECT_ROOT` /
   `CLAUDE_PROJECT_DIR` (MCP roots can refresh the project root);
3. `index/zephyr.db` only while running from a source checkout with no plugin-data
   environment.

There is no claimed shipped default and no mutable global `workspace.db`. The server
re-resolves on every call, so it adopts an index created during the same session.

`--modules` currently adds module Kconfig and binding roots. Module documentation,
boards, samples, and public headers are explicitly marked uncovered. A board,
application, and build directory may be recorded in identity, but answers remain
catalogue-level because final `.config` and resolved devicetree values are not ingested.

## Configuration

| Variable | Effect |
| --- | --- |
| `ZEPHYR_AI_INDEX` | Strict explicit index override |
| `ZEPHYR_AI_PROJECT_ROOT` / `CLAUDE_PROJECT_DIR` | Active project identity |
| `ZEPHYR_AI_PLUGIN_DATA` / `CLAUDE_PLUGIN_DATA` | Persistent fingerprinted index store |
| `ZEPHYR_BASE` | Zephyr tree used by the indexing workflow |
| `PYTHON_EXECUTABLE` | Python environment for semantic ingestion |

The plugin manifest forwards both `ZEPHYR_AI_*` and `CLAUDE_*` spellings during the
compatibility window; the `ZEPHYR_AI_*` names are the explicit product contract.

## Upgrades, offline use, and recovery

- Plugin upgrades that change the schema or builder fail closed with an actionable
  rebuild instruction. Invoke the `zephyr-index` skill; an incompatible database is
  never queried as though it were current.
- Each canonical project root owns a separate active pointer and retained context
  history, so switching projects cannot select another project's catalogue.
- Once the plugin, selected Zephyr tree, and project index are present, MCP lookup is
  offline. Creating an index from an existing workspace is also local; only fetching a
  missing upstream tree or installing prerequisites needs network access.
- Interrupted or failed index creation leaves the former active artifact untouched.
  Stop Claude before manually removing a single project fingerprint directory, and
  prefer rebuilding over editing `active.json` or SQLite files.
- An unavailable, corrupt, stale, foreign-project, or mismatched index is visible in
  `index_status` and SessionStart diagnostics rather than silently falling through to
  unrelated data.

## Development and release gates

```bash
npm run check:quick     # source/fixture feedback; integration inputs may be absent
npm run check           # pinned tree, rebuilt index, real-process tests and corpus gates
npm run check:release   # Doxygen API index, compile matrix, copied-artifact clean room
```

`npm run check` is the repository completion gate. `check:release` additionally
requires Doxygen, CMake, Ninja, and the Zephyr SDK toolchains needed by the declared
generic, STM32, and ESP32 build matrix. It synchronizes the HAL/module revisions from
the pinned tree's west manifest; missing release inputs fail rather than skip.

See [AGENTS.md](AGENTS.md) for implementation invariants,
[ARCHITECTURE.md](ARCHITECTURE.md) for design details, [SECURITY.md](SECURITY.md) for
trust boundaries, and [docs/RELEASING.md](docs/RELEASING.md) for release and rollback.

## Scope

The present product is Zephyr-on-STM32/ESP32 support grounded in Zephyr's own tree. It
does not claim STM32Cube HAL/LL, ESP-IDF API, proprietary reference-manual, silicon
errata, or hardware-in-the-loop coverage. Those sources require separately versioned
and licensed knowledge packs; see [docs/VENDOR-PACKS.md](docs/VENDOR-PACKS.md).

Apache-2.0. The generated index is not committed; source excerpts retain their
upstream provenance and applicable Zephyr licensing.
