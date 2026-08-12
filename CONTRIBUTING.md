# Contributing

Read [AGENTS.md](AGENTS.md) before changing the repository. It documents the source
layout, generated-artifact invariants, and test requirements.

Use `npm run check:quick` while developing without the pinned Zephyr checkout. Before
submitting a change, run `npm run check`; the full gate verifies the pinned tree,
rebuilds the index, runs real-tree and stdio tests with required inputs, applies corpus
quality checks, and validates both plugin manifests.

Before a public artifact, run `npm run check:release` with Doxygen and the Zephyr SDK.
It consumes semantic Doxygen XML, compiles the declared generic/STM32/ESP32 example
matrix, and tests a copied marketplace layout from empty plugin data. See
[docs/RELEASING.md](docs/RELEASING.md).

Parser or schema changes require a schema-version bump, a complete index rebuild, and an
intentional update to the corpus baselines, with the reason for the moved counts in the
commit message.
MCP runtime code must remain dependency-free. Generated bundles under `plugin/mcp/`
must be rebuilt and committed with their sources.

Do not weaken a semantic threshold to accommodate drift. Add a source-backed exclusion
only when the corpus rule cannot include the record by design. Regenerate the Kconfig
recall evidence with `npm run quality:kconfig-allowlist`; review its paths and reasons
before committing it.

Contributions are licensed under Apache-2.0 as described in [LICENSE](LICENSE).
