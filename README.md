# zephyr-ai

A Claude Code plugin for grounded Zephyr RTOS firmware development, with focused
guidance for STM32 and ESP32 targets.

The plugin combines a project-scoped SQLite knowledge index, MCP tools, workflow
skills, specialist agents, and conservative edit and build hooks. Exact answers
identify the Zephyr source context that supports them; a name the catalogue does
not hold is reported as outside its scope, never as wrong.

## Why it exists

Zephyr failures often come from structured facts that prose search cannot settle:

| Failure mode | Grounded response |
| --- | --- |
| A misspelled or renamed `CONFIG_` assignment fails Kconfig processing | Query evaluated Kconfiglib declarations, types, alternative definition contexts, defaults, and reverse selects before editing |
| A devicetree node uses a property inherited several bindings away | Query the compatible's recursively flattened property set, types, constraints, and provenance |
| A build uses the wrong board or qualifier | Query targets derived through Zephyr's board tooling, including revisions and CPU clusters |
| Code targets another Zephyr revision | Build an index from the project's actual Git tree and module state, then compare its fingerprint at runtime |

The hook catches only what the catalogue can decide on its own: malformed configuration,
a type mismatch against a known declaration, or assigning a known promptless symbol. It
does **not** report that a `CONFIG_` symbol or a compatible is missing. Coverage
describes the indexed Zephyr tree, never your project, which legitimately declares its
own Kconfig and bindings through `DTS_ROOT` and out-of-tree module roots — so a
catalogue miss is not evidence of absence. Existence questions belong to the tools,
which answer them with their scope stated.

## Install and first index

```bash
claude plugin marketplace add mssaleh/zephyr-ai
claude plugin install zephyr-ai@zephyr-ai
```

Open a Zephyr project and ask Claude:

> Build the Zephyr index for this project.

The `zephyr-index` skill finds the west workspace or `ZEPHYR_BASE`, then runs the
bundled indexer. If neither exists, it can fetch the revision pinned into the plugin
after asking for consent; the checkout is stored in persistent plugin data rather than
the project. Index creation requires:

- Node.js 24 or newer (`node:sqlite` with FTS5);
- Python 3.12 or newer (tested on 3.14);
- the target tree's `scripts/kconfig/kconfiglib.py` and
  `scripts/dts/python-devicetree`;
- PyYAML in the selected Python environment. The indexer prefers the interpreter
  behind `west`; set `PYTHON_EXECUTABLE` when a different environment is required.
- Git and network access only when accepting the pinned-tree fetch.

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
| `search_kconfig` / `get_kconfig` | Symbol declarations, type, prompt/assignability, independent definition contexts, defaults, ranges, selects and implies, in both the application (`CONFIG_`) and sysbuild (`SB_CONFIG_`) namespaces |
| `search_bindings` / `get_binding` | Compatible properties, recursive child bindings, constraints, provenance, and a type-aware skeleton |
| `search_boards` / `get_board` | Exact targets, revisions, SoCs, features, board documentation, and the runners the board registers with the command each one serves |
| `search_api` / `get_api` | Public C declarations, parameters, return contracts, groups, and Doxygen anchors when semantic XML is used |
| `check_config` | A verdict per line for a whole `prj.conf`, defconfig, `sysbuild.conf`, `.overlay`, or `.dts` |
| `check_environment` | Every Python interpreter on the machine and which of this Zephyr's requirements each carries, plus west, the SDK, and the command that closes each gap |
| `get_runner` | What a flash/debug runner implements and which options it accepts, read from the tree's own runner classes |
| `search_samples` / `get_sample` | Samples and upstream Twister test suites: platform allowlists and integration platforms, scenario names, README, configuration, overlays, and source files |
| `search_docs` / `get_doc` | Section-level documentation with resolved includes, source origins, and official URLs |
| `get_source` | Any file in the indexed tree, read at the commit the index was built from, with a line range and a citable reference |
| `index_status` | Schema, builder, commit, source-tree/module fingerprint, coverage, project/manifest match, and stored-index usage |

### Skills and agents

The skills cover host prerequisites, project setup, Kconfig, devicetree, build/flash,
debugging, RTOS patterns, drivers and sensors, power, Bluetooth, networking, testing,
indexing, and STM32/ESP32 platform workflows. Fenced snippets are explicitly illustrative unless
their metadata identifies a release-gated example.

| Skill group | Included skills | Coverage boundary |
| --- | --- | --- |
| Project foundation | `zephyr-prerequisites`, `zephyr-project-setup`, `zephyr-development`, `zephyr-index` | Workspace layout, grounded implementation workflow, and project index lifecycle |
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
  Zephyr commit and makes stale or missing validation visible. In an empty directory
  it names the prerequisites for building an index, which is the state a first-time
  user starts in.
- `PostToolUse` on an edit reads the final file inside the canonical project root, and
  only for a recognisably Zephyr project. For Kconfig it handles line continuations and
  `is not set` syntax and reports final-file line numbers. For `.dts`, `.dtsi`, and
  `.overlay` it reports a `compatible` that misspells an indexed one; a compatible that
  is merely absent is not reported, because applications legitimately declare their own.
  Property names are left to `get_binding`, which is the only thing that can know which
  binding owns a property.
- `PostToolUse` on Bash recognises a failed Zephyr build and names the `build-triage`
  agent together with the lookup that fits the failure class. It requires both a build
  command and a failing result, so an unrelated command that fails is silent.
- `PreToolUse` on an edit to a `.conf`, `.dts`, `.dtsi`, or `.overlay` names the lookup
  that prevents the mistakes in that file kind, and the agent whose job it is, before
  the file is written — the write validator can only react to what already exists. It
  allows the write unconditionally; a heuristic must never block one.

A hook that reports nothing looks exactly like a hook that never ran, so a clean
Kconfig or devicetree file is acknowledged once per file per session: what was checked,
and against which indexed Zephyr version. Findings go to stderr with the blocking exit
code; acknowledgements and pre-write pointers do not, and neither repeats itself. When
no index is available every hook stays quiet, because SessionStart already says so once
per session.

## What the index covers

Run `npm run quality:counts` to print the corpus of a built index, and
`npm run quality:semantic` to check it against the source tree. The semantic gates
prove the properties that matter rather than a headline number: every compatible a
binding declares is indexed, every resolvable compatible use resolves, child-binding
depth matches the source, no documentation chunk is empty, no valid board is missing
its targets, sample files are captured exactly, and every Kconfig symbol a sample
assigns is either indexed or carries a source-backed exclusion.

The ordinary local index labels API coverage incomplete because it uses a conservative
header fallback. Workspace indexing automatically uses Doxygen XML from an adjacent
`doxygen/xml` tree or `doc/_build/doxygen/xml` when present; pass `--api-xml` for any
other location. Public-release validation uses Doxygen XML through
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
