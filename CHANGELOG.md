# Changelog

All notable user-visible changes are recorded here. The format follows Keep a
Changelog, and releases use semantic versioning.

## [0.4.0] - 2026-08-13

Indexes built by earlier versions are not readable by this one: the index schema is
now 8. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- **West flash and debug runners are indexed.** `get_board` now names every runner
  a board registers, which one `west flash` and `west debug` each select, and the
  arguments the board presets — read from the board's own `board.cmake` and the
  common runner files it includes. The two defaults are not always the same runner:
  every Espressif board flashes with `esp32` and debugs with `openocd`, and a board
  can name a default it never registers, in which case that command has nothing to
  run and the answer says so. Checked against the `runners.yaml` Zephyr's build
  system resolves, across eleven boards and six vendors.
- `get_runner` reports what a runner implements and which options it accepts —
  `--dev-id`, `--erase`, `--reset-type` and its permitted values, `--extload`,
  `-O` — introspected from the runner classes in the indexed tree rather than from
  a fixed table. West rejects an option a runner does not declare before touching
  hardware.
- `search_boards` takes a `runner` filter, so the probe on the desk can narrow the
  board list.
- `check_environment` reports whether this machine can actually build the indexed
  Zephyr version. It lists every Python interpreter separately with the packages
  each one carries, because the interpreter that satisfies the indexer is often not
  the one CMake selects — a west installed in its own environment indexes perfectly
  and cannot build. It names the command that closes each gap and never installs
  anything.
- A new `zephyr-prerequisites` skill covers the interpreter contract, Python
  environments with uv or pip, toolchain installation through `west sdk`, and
  per-board host tools.
- The build-failure hook recognises a host environment failure and routes it to
  `check_environment` instead of to the symbol lookups. These arrive wrapped in
  `CMake Error` and were previously answered with advice about verifying symbols,
  sending the reader to edit a file that was not wrong.

### Changed

- `zephyr-build-flash` no longer carries a hand-written runner table. It listed six
  runners; this Zephyr ships 49 and boards reference 41. It now calls `get_board`
  and `get_runner`, and its depth moved to `references/`, read on demand.
- `index_status` counts the runner, board-runner, and west-command corpora, and
  reports west coverage alongside the others.

### Fixed

- **The release gate could not pass in CI.** `api_symbol` counts are Doxygen
  output compared for exact equality against a committed fixture, and
  `scripts/toolchain.json` declared `doxygen` with no version — the one tool whose
  output is baselined was the one the contract did not pin. CI's Doxygen 1.9.8
  found 84,919 symbols where the fixture recorded 84,934. The contract now pins an
  exact version, which a minimum could not do because a newer Doxygen diverges as
  surely as an older one, and CI installs that version instead of the
  distribution's.
- The runner catalogue no longer depends silently on which Python built the index.
  `runners/openocd.py` imports the west package, and `runners/__init__.py`
  downgrades an import failure to a warning, so an index built by an interpreter
  without west omitted the runner 328 boards select and said nothing. Completeness
  is now recorded in the coverage map and forms part of the context fingerprint,
  and the gate builds refuse an incomplete catalogue.

## [0.3.0] - 2026-08-13

Indexes built by earlier versions are not readable by this one: the index schema is
now 7. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- `get_kconfig`, `get_binding`, and `get_api` each accept a list — `names`,
  `compatibles`, `names` — and answer the whole list in one call, returning the
  facts a shell `grep` cannot give: a symbol's type, prompt, dependencies, defaults
  and choice alternatives; a compatible's bus and required properties; a function's
  signature and header. Checking a dozen symbols cost a dozen calls, so agents used
  a shell loop instead and settled for a weaker answer.
- `check_config` takes a whole `prj.conf`, defconfig, `.overlay`, or `.dts` and
  returns a verdict per line, making the same claims as the write hook.
- Upstream Twister test suites under `tests/` are indexed alongside `samples/`,
  with their scenario names. `search_samples` takes a `kind` filter, and a `board`
  with no query lists everything upstream names for that board and how many of each
  kind exist. Questions about what upstream verifies on a board were previously
  unanswerable by construction.
- `get_board` names the boards a target is easy to mistake for — products sharing a
  PCB reference and a SoC series — alongside the flash, RAM, and SoC figures that
  separate them, so a board chosen from a document can be checked against silicon.
- A `PreToolUse` hook names the lookup and the agent that fit a `.conf`, `.dts`,
  `.dtsi`, or `.overlay` before it is written. It never blocks the write.
- A clean Kconfig or devicetree file is acknowledged once per file per session,
  reporting what was checked and against which indexed Zephyr version. A check that
  reports nothing was previously indistinguishable from one that never ran.

### Fixed

- **Devicetree write validation could never run.** It required
  `coverage.bindings.complete`, which the ingest sets only when there is no project
  root — and a project-scoped index always has one. Every index a user builds
  reported the flag as false, so the devicetree half of the write hook was dead in
  the field for the whole of 0.2.0. The gate is removed; safety comes from the
  near-miss rule, which never reports absence. The test fixture ran against the one
  descriptor shape in which the gate opened and no user ever has, so it passed
  throughout; it now runs against a project-scoped index.
- **`get_sample` never rendered `platform_allow`.** It showed the allowlist only
  when `integration_platforms` was empty, which hid it for 249 of 610 samples. A
  reader concluded from that output that no upstream Wi-Fi sample named a board that
  seven of them name. Both lists are now always rendered and labelled by what they
  mean. `search_samples` ranked on allowlist evidence without ever saying so, and
  now reports which list matched.
- An absent value exported from Python was stored as the four-character string
  `"null"`, which every consumer read as a value — `get_binding` announced "is a bus
  controller for: `null`" on 2,929 bindings that control no bus. The index is
  smaller for the fix, and a corpus gate now fails on any stringified null.
- **A device reachable over more than one bus has a binding per bus, and
  `get_binding` returned whichever one the database held first.** Of the compatibles
  with several bindings, 78 of 80 require different properties, and the difference is
  usually `spi-max-frequency` — so a SPI part got the I2C answer and the node it
  produced would not build. `get_binding` now takes `on_bus`, names every variant
  when asked without one, and orders them stably; `check_config` reports each
  variant's required-property count rather than picking one.
- **The write validator reported nodes that upstream ships.** A devicetree node binds
  through the first of its compatibles that has a binding, so a fallback list such as
  `"microchip,mcp9808", "jedec,jc-42.4-temp"` is correct with only the generic name
  indexed. Judging each value alone flagged four of Zephyr's own sample overlays,
  because the specific name lands two edits from an unrelated Microchip ADC.
- **`CONFIG_X=y # comment` was reported as a type error.** For bool and tristate
  kconfiglib reads only the first character after `=`, matching the C implementation,
  so the assignment is legal and upstream uses it.
- **Promptless assignments were reported from an incomplete view.** Zephyr decides
  promptlessness across every definition of a symbol; this catalogue holds only those
  reachable in the context it was built for, so a symbol declared in a module Kconfig
  or another SoC's tree looked promptless when it was not. The claim is now made only
  where the catalogue can see the declaration. Measured over 800 upstream files, the
  validator's findings on correct code went from nine to none.
- `get_board` selected the board's flash and RAM and then dropped them, so they
  reached a caller only through build targets that happen to carry Twister metadata.
  SoC series and family were indexed but never queried by any tool.
- The write hook and `check-index` hardcode the index schema they accept and nothing
  tied them to the shared constant; after a bump that was not carried across, every
  hook would silently refuse every index. A gate now ties the three together.

## [0.2.0] - 2026-08-12

Indexes built by earlier versions are not readable by this one: the index schema
is now 6. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- `get_source` returns a file from the indexed Zephyr tree at the exact commit the
  index was built from, with an optional line range. Where the tree is not present
  it returns a pinned `owner/repo@commit:path#Lstart-Lend` reference instead, so a
  file fetched elsewhere is still anchored to the right revision.
- `get_api` lists the members of an enum, with each member's value and
  documentation.
- `get_kconfig` lists the other options in a symbol's choice, so "mutually
  exclusive with what" no longer requires reading the subsystem's Kconfig.
- A failed `west build` now produces a signal: the plugin names the `build-triage`
  agent and the lookup that fits the failure — `get_binding` for a devicetree
  error, `get_kconfig` for a Kconfig one, `search_kconfig` for an undefined
  reference.
- `.dts`, `.dtsi`, and `.overlay` edits are checked for a `compatible` that
  misspells an indexed one. A compatible that is merely absent is not reported:
  applications legitimately declare their own through `dts/bindings`, `DTS_ROOT`,
  or an out-of-tree module.
- The `zephyr-development` skill states what to do after writing, not only before:
  which agent handles a failed build, a new driver or ISR, and a devicetree edit.
- SessionStart now speaks in an empty directory, naming the prerequisites and the
  `zephyr-index` skill, and the skill leads with the pinned fetch for that case.

### Fixed

- The API catalogue built without Doxygen XML no longer misfiles symbols. A record
  declared with an attribute macro was indexed under the attribute, leaving
  `enum __packed bt_conn_type` reachable only as `__packed` while `bt_conn_type`
  resolved to a struct field that merely used the type — wrong location, wrong
  signature, no documentation. Uses of a type were also indexed as definitions of
  it, and function-pointer struct members were indexed under their return type,
  putting hundreds of symbols named `void` and `int` into search results.
- Enum members are indexed without Doxygen XML, where previously they were dropped
  entirely.
- With Doxygen XML, enum members recorded no header of their own, which hid most of
  them from `get_api`.
- The edit validator no longer reports a path outside the project root as a
  blocking error. It cannot inspect such a file, which is a reason to stay quiet
  rather than a finding about the edit.

## [0.1.1] - 2026-08-12

### Added

- The bundled indexer can fetch the pinned Zephyr tree into persistent plugin data
  after explicit user consent, so first use no longer requires an existing checkout.
- Workspace indexing auto-detects conventional Doxygen XML outputs and reports when it
  uses them.

### Fixed

- The `zephyr-index` skill passes the plugin data directory explicitly, so the indexer
  and MCP server select the same project index.
- `get_board` accepts `board` as an alias for `name`.
- Build and project-setup guidance now checks for west, identifies the active topdir,
  and keeps the application manifest repository distinct from the workspace root.
- Context-only index flags are described as identity inputs rather than resolved build
  ingestion.

## [0.1.0] - 2026-08-12

First public release. Indexed against Zephyr v4.4.2, commit
`dccb09599635bdff17633fa7e9dab014b91dce90`.

### Changed

- **Breaking:** the runtime now requires Node.js 24 or newer, raised from 22.13. Bundles
  target `node24`.
- **Breaking:** index creation now requires Python 3.12 or newer in the selected
  interpreter, raised from 3.10. A west virtual environment on 3.10 or 3.11 is refused
  with an actionable message; point `PYTHON_EXECUTABLE` at a newer interpreter.
- Upgraded the build toolchain to TypeScript 7.0, esbuild 0.28, `@types/node` 24, and
  yaml 2.9, and the CI actions to `checkout@v7`, `setup-node@v7`, `setup-python@v7`, and
  `cache@v6`. CI now builds on Node 24 and Python 3.14.
- The MCP protocol revision is unchanged at 2025-11-25.
- Performance budgets gate what they measure. Bundle byte ceilings were a proxy for
  session startup cost, which is measured directly and sits at a few percent of its
  budget, so they are reported rather than gated. The index bound is raised to 256 MiB,
  where it still catches runaway corpus growth without policing normal growth.

- Replaced raw Kconfig ingestion with the target tree's Kconfiglib and definition-level
  expression, choice, default, range, select, imply, and assignability records.
- Replaced binding traversal with the target tree's edtlib, recursive child bindings,
  constraints, provenance, and type-aware skeletons.
- Added project/context fingerprints, immutable atomic indexes, MCP-root negotiation,
  exact tree/manifest comparison, and multi-project retention.
- Added RST include expansion and build-manual coverage, structured Doxygen XML API
  ingestion, canonical board enumeration, and Twister-compatible sample evidence.
- Hardened JSON-RPC lifecycle/envelopes and dependency-free tool schema validation.
- Catalogue misses are uncertainty rather than proof; the final-file hook reports only
  errors the catalogue can decide on its own, and stays silent when it cannot validate.
- Corrected and catalogue-scanned all skills/agents; added a three-platform compile
  matrix and inherited model/read-only permission policy.
- Fetch and index activation are ownership-checked, atomic, and interruption-safe.

### Added

- Corpus semantic, integrity, drift, artifact, performance, and copied-marketplace
  clean-room gates.
- A separate corpus baseline for the released Doxygen-backed index. `quality:baseline`
  selects it on the recorded `api_ingest_mode`, and `check:extended` now runs it, so the
  artifact that ships is pinned rather than only the development header-fallback build.
- Explicit release/rollback instructions and an isolated vendor-pack strategy.

### Fixed

- The gate can no longer pass locally and fail in CI on a missing tool. `validate:plugin`
  shells out to `claude`, which was present on the author's machine and on no runner, so
  the first push exited 127 after a green local run. Every external binary a gate needs
  is now declared in `scripts/toolchain.json`; `scripts/preflight.mjs` verifies it before
  any gate runs, and `test/toolchain.test.mjs` fails when a declared tool is not
  provisioned by the CI job that runs its tier — so the divergence breaks the
  contributor's build first. A `contract` job runs the quick gate in a bare
  `node:24-trixie-slim` container carrying only what the contract declares, which is the one
  place a dependency nobody declared can be caught.
- Doxygen XML generation is reproducible. The pinned template leaves
  `NUM_PROC_THREADS` at one thread per core, and successive runs over the same tree
  produced 84,934 and then 84,935 API symbols. Parsing is now pinned to one thread.
- The shipped `binding-skeleton` example did not compile. Its provider binding declared
  `#test-cells` without the `test-cells:` list naming them, which edtlib rejects.
- `fetch:modules` failed on any healthy workspace. `west manifest --freeze` requires
  every project in every group to be cloned, including the optional groups `west update`
  deliberately skips, and its only consumer was a log line. It is now advisory.
- The release compile matrix builds the generic class on `native_sim/native/64` instead
  of 32-bit `native_sim`, which needed host multilib headers for no added coverage, and
  CI installs `esptool`, which Zephyr's Espressif SoC CMake requires and
  `requirements-base.txt` does not carry.
- Doxygen API ingestion no longer fails the release build on anonymous unions and
  structs. Zephyr 4.4.2 contains 198 of them; they are ordinary C11 and carry no name to
  look up, so they are recorded as intentional exclusions rather than errors. This path
  had never produced output before, so the semantic API index was unbuildable.
- A failing Doxygen export now reports the exporter's structured error list. It writes
  that report to stdout and exits non-zero, but only stderr was read, so every content
  failure surfaced as `Doxygen XML export failed.` with nothing after it.
- `get_kconfig` bounds how many definition contexts it renders. `CONFIG_NUM_IRQS` has
  730 board and SoC defconfig alternatives and returned roughly a quarter of a megabyte;
  it now returns 5 KB, shows prompted contexts first, and states what it omitted.
- `get_kconfig` suggests near names that full-text search cannot reach. A one-character
  typo such as `CONFIG_BT_PERIPHERL` returned no suggestion because `PERIPHERL` is not a
  prefix of `PERIPHERAL`; candidates now also come from a longest-prefix lookup.
- The edit hook no longer reports a `CONFIG_` symbol or a devicetree compatible as
  absent. Coverage describes the indexed Zephyr tree rather than the project, so
  application-local bindings were rejected as invalid — including those in the plugin's
  own `binding-skeleton` example. Devicetree files are not inspected until the index can
  be built from the project's own binding roots.
- The edit hook is silent for files outside a recognisable Zephyr project, and when no
  usable index exists. It previously reported every `.conf` edit in any project as a
  blocking validation failure; SessionStart reports an unusable index once per session.
- `index_status` renders the per-corpus coverage map and its notes in the text answer,
  not only in structured content.
- The MCP server no longer replies with a JSON-RPC error to a response frame whose id it
  does not recognise, which occurred whenever a `roots/list` answer arrived after the
  request timed out.
- The SessionStart mismatch report no longer states that workspace content differs from
  the indexed fingerprint when only the version or commit differs.

### Security

- Added the security-reporting and workspace-index trust-boundary policy.
