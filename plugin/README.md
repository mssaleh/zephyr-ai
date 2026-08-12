# zephyr-ai

Zephyr RTOS firmware development for Claude Code, on STM32 and ESP32.

Gives Claude a version-exact reference for the Zephyr tree you build against —
Kconfig symbols, devicetree bindings with inherited properties resolved, board
targets, C API, and samples — plus workflow skills, review agents, and edit-time
validation.

## Setup

The plugin needs an index of a Zephyr tree. Ask Claude:

> build the Zephyr index for this project

which runs the `zephyr-index` skill. It finds your west workspace, indexes it in
about four seconds, and writes to the plugin's persistent data directory so it
survives plugin updates.

Requires Node.js 22.13 or newer. Nothing is compiled and nothing is installed at
runtime.

## Using it

Just work on firmware. The skills activate on their own — `zephyr-devicetree`
when you touch an overlay, `stm32-platform` when the target is an STM32, and so
on. Claude queries the MCP tools before writing configuration rather than after a
build fails.

Worth invoking explicitly:

- `@zephyr-ai:zephyr-architect` — design a firmware project before writing code
- `@zephyr-ai:build-triage` — root-cause a failing build
- `@zephyr-ai:firmware-reviewer` — review for ISR-context violations, unchecked
  returns, stack sizing, and the other defects that fail in the field
- `@zephyr-ai:devicetree-specialist` — author or repair devicetree

## Configuration

| Environment variable | Effect |
| --- | --- |
| `ZEPHYR_AI_INDEX` | Use this index file, overriding everything else |
| `ZEPHYR_BASE` | Where the `zephyr-index` skill looks for a Zephyr tree |

The server prefers, in order: `ZEPHYR_AI_INDEX`, a `workspace.db` built from your
own tree, then the default index.

## Troubleshooting

**"No Zephyr index is available"** — run the `zephyr-index` skill.

**Answers are wrong for your Zephyr version** — call `index_status`. It reports
the indexed version and detects a west workspace pinned to a different one.
Rebuild with `zephyr-index`.

**A symbol exists but the validator flags it** — it is probably from an
out-of-tree module. Pass that module to the indexer with `--modules`, or ignore
the warning; it never blocks an edit.

Apache-2.0.
