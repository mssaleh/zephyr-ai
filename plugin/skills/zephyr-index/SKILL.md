---
name: zephyr-index
description: Build or refresh the project-scoped Zephyr reference index that the zephyr MCP server queries. Use when lookup tools report no index, index_status reports a commit or context mismatch, after west update, or when answers must reflect the active workspace and modules.
license: Apache-2.0
compatibility: Requires Node.js 22.13+, Python 3.10+ with PyYAML, and a complete Zephyr source tree.
allowed-tools: Bash(node:*) Bash(west:*) Bash(ls:*) Bash(test:*) Read
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Build the Zephyr index

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

The MCP server answers from a SQLite index built from a specific Zephyr tree.
The index descriptor records the actual Zephyr commit, module fingerprint, project
identity, dirty tree state, and per-corpus coverage. Catalogue answers remain distinct from resolved
build-context answers. Module ingestion currently covers Kconfig and bindings only.

Before scanning, the indexer probes Python, PyYAML, and the target tree's Kconfiglib
and python-devicetree. It prefers `PYTHON_EXECUTABLE`, then the interpreter behind
`west`, then `python3`/`python`. A failure is actionable and leaves the active index
unchanged.

## 1. Find the Zephyr tree

Try these in order and stop at the first that resolves to a directory containing
a `VERSION` file:

```bash
# A west workspace in or above the project
west topdir 2>/dev/null && west list zephyr -f '{posixpath}' 2>/dev/null

# An exported environment
echo "$ZEPHYR_BASE"

# The conventional layout
ls -d ./zephyr ../zephyr 2>/dev/null
```

If none resolves, ask the user where their Zephyr checkout is. Do not guess, and
do not clone one without being asked — a Zephyr checkout is over 600 MB.

## 2. Find the HAL modules worth including

Vendor HALs carry their own bindings and Kconfig. Include the ones relevant to
the project's targets:

```bash
west list -f '{name} {posixpath}' 2>/dev/null
```

## 3. Build it

```bash
node "${CLAUDE_PLUGIN_ROOT}/mcp/zephyr-ingest.mjs" \
  --zephyr "<zephyr-base>" \
  --project-root "${CLAUDE_PROJECT_DIR}" \
  --modules "<workspace>/modules/hal/stm32" \
  --modules "<workspace>/modules/hal/espressif"
```

`--modules` is optional and repeatable; drop the ones that do not exist. The indexer
derives a context fingerprint and atomically activates the artifact below
`${CLAUDE_PLUGIN_DATA}/indexes/projects/`, isolating projects and module sets.

For a standalone non-Claude client, select an output path explicitly:

```bash
node "${CLAUDE_PLUGIN_ROOT}/mcp/zephyr-ingest.mjs" \
  --zephyr "<zephyr-base>" \
  --out "<destination>/zephyr.db"
```

Expect output like:

```
Indexing Zephyr 4.4.2 from /home/user/ws/zephyr
  docs      2115 pages, 16664 sections
  kconfig   20973 symbols from 6280 files
  bindings  3443 compatibles, 120569 properties, 282 fragments
  boards    1014 boards, 2324 targets, 1475 SoCs
  samples   610
  api       33821 symbols, 1006 groups, header-fallback
Done in 22.6 s -> .../<context-fingerprint>/zephyr.db (111.0 MiB)
```

These are reproducible pinned-tree measurements, not promised duration or size for a
different workspace. If any major corpus count is zero, stop and inspect the emitted
source report rather than activating a partial index.

## 4. Confirm

Call `index_status`. It should report the project's exact Zephyr commit, context
fingerprint, coverage map, and no project mismatch.

The server resolves the index on each call, so a freshly built index is picked up
without restarting Claude Code. If `index_status` still shows an old fingerprint,
inspect the project-root and plugin-data variables it reports before rebuilding.

## Notes

- The index is written to `${CLAUDE_PLUGIN_DATA}`, which survives plugin updates,
  so it does not need rebuilding when the plugin is upgraded.
- Rebuild after `west update`, after changing the pinned Zephyr revision, and
  after modifying the tree or adding out-of-tree bindings or Kconfig you want searchable.
- The normal first-run API catalogue is a conservative header fallback and its
  descriptor says incomplete. Doxygen XML is required by the public release gate.
- Set `ZEPHYR_AI_INDEX` to point the server at an index anywhere on disk; that
  overrides everything else.
