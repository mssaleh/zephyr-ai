---
name: zephyr-index
description: Build or refresh the Zephyr reference index that the zephyr MCP server queries. Use when the MCP tools report no index is available, when index_status reports a version mismatch between the index and the project's west workspace, after running west update or changing the pinned Zephyr revision, or when the user wants lookups to reflect their own tree including vendor HAL modules and out-of-tree bindings. Indexing takes a few seconds.
license: Apache-2.0
compatibility: Requires Node.js 22.13 or newer and a Zephyr source tree on disk.
allowed-tools: Bash(node:*) Bash(west:*) Bash(ls:*) Bash(test:*) Read
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Build the Zephyr index

The MCP server answers from a SQLite index built from a specific Zephyr tree.
Indexing the user's own workspace is what makes the answers exact: it captures
their pinned Zephyr version plus the vendor HAL modules and any out-of-tree
bindings and Kconfig they carry.

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
west list -f '{name} {posixpath}' 2>/dev/null | grep -E 'hal_|cmsis'
```

## 3. Build it

```bash
node "${CLAUDE_PLUGIN_ROOT}/mcp/zephyr-ingest.mjs" \
  --zephyr "<zephyr-base>" \
  --modules "<workspace>/modules/hal/stm32" \
  --modules "<workspace>/modules/hal/espressif" \
  --out "${CLAUDE_PLUGIN_DATA}/index/workspace.db"
```

`--modules` is optional and repeatable; drop the ones that do not exist. The
output path matters: the server prefers `workspace.db` over the default
`zephyr.db`, so writing there makes the project's own index take precedence.

To build the default index instead — for example on first install, from a
checkout of upstream Zephyr — write to `zephyr.db`:

```bash
node "${CLAUDE_PLUGIN_ROOT}/mcp/zephyr-ingest.mjs" \
  --zephyr "<zephyr-base>" \
  --out "${CLAUDE_PLUGIN_DATA}/index/zephyr.db"
```

Expect output like:

```
Indexing Zephyr 4.4.2 from /home/user/ws/zephyr
  docs      2080 pages, 15842 sections (211 ms)
  kconfig   19796 symbols from 6547 files (324 ms)
  bindings  3442 compatibles, 119718 properties, 283 fragments (603 ms)
  boards    1014 boards, 1425 targets, 1475 SoCs (254 ms)
  samples   610 (120 ms)
  api       26148 symbols, 1006 groups (1049 ms)
Done in 3.8 s -> .../index/workspace.db (71.7 MiB)
```

Roughly 4 seconds and 70 MB. If any count is zero, the path is probably not a
Zephyr tree root.

## 4. Confirm

Call `index_status`. It should now report the project's Zephyr version, an origin
of "workspace", and no version mismatch.

The server resolves the index on each call, so a freshly built index is picked up
without restarting Claude Code. If `index_status` still shows the old version,
run `/reload-plugins`.

## Notes

- The index is written to `${CLAUDE_PLUGIN_DATA}`, which survives plugin updates,
  so it does not need rebuilding when the plugin is upgraded.
- Rebuild after `west update`, after changing the pinned Zephyr revision, and
  after adding out-of-tree bindings or Kconfig you want to be searchable.
- Set `ZEPHYR_AI_INDEX` to point the server at an index anywhere on disk; that
  overrides everything else.
