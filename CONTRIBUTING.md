# Contributing

Read [AGENTS.md](AGENTS.md) before changing the repository. It documents the source
layout, generated-artifact invariants, and test requirements.

Use `npm run check:quick` while developing without the pinned Zephyr checkout. Before
submitting a change, run `npm run check`; the full gate verifies the pinned tree,
rebuilds the index, runs real-tree and stdio tests with required inputs, applies corpus
quality checks, and validates both plugin manifests.

Parser or schema changes require a schema-version bump, a complete index rebuild, and
an intentional update to generated corpus baselines with a source-derived explanation.
MCP runtime code must remain dependency-free. Generated bundles under `plugin/mcp/`
must be rebuilt and committed with their sources.

Contributions are licensed under Apache-2.0 as described in [LICENSE](LICENSE).
