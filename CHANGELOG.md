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
- Catalogue misses are uncertainty rather than proof; final-file hooks retain only
  evidence-backed hard errors and make validator failure visible.
- Corrected and catalogue-scanned all skills/agents; added a three-platform compile
  matrix and inherited model/read-only permission policy.
- Fetch and index activation are ownership-checked, atomic, and interruption-safe.

### Added

- Corpus semantic, integrity, drift, artifact, performance, and copied-marketplace
  clean-room gates.
- Explicit release/rollback instructions and an isolated vendor-pack strategy.

### Security

- Added the security-reporting and workspace-index trust-boundary policy.
