# Changelog

All notable user-visible changes are recorded here. The format follows Keep a
Changelog, and releases use semantic versioning.

## [Unreleased]

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
