# Changelog

All notable user-visible changes are recorded here. The format follows Keep a
Changelog, and releases use semantic versioning.

## [Unreleased]

### Changed

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
- Explicit release/rollback instructions and an isolated vendor-pack strategy.

### Fixed

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
