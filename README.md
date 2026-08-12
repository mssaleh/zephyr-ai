# zephyr-ai

A Claude Code plugin for developing Zephyr RTOS firmware on STM32 and ESP32.

It gives Claude a version-exact reference for the Zephyr tree you are actually
building against — every Kconfig symbol, every devicetree binding with its
inherited properties resolved, every board target, every public API symbol, and
every sample — served over MCP, plus workflow skills, review agents, and
edit-time validation that catches invented symbols before they reach a build.

---

## Why

An LLM writing Zephyr firmware fails in a few highly repeatable ways. Each one
has a cheap fix, and the plugin is built around them:

| Failure | Why it happens | What fixes it |
| --- | --- | --- |
| Invents `CONFIG_` symbols | ~20 000 symbols across thousands of Kconfig files, renamed between releases; an undefined assignment fails Kconfig processing | Exact lookup with type, defaults, and the dependency chain before the build round-trip |
| Invents devicetree properties | Properties arrive through `include:` chains: `st,stm32-spi.yaml` declares **zero** properties and the node accepts **forty** | Flattened per-compatible property tables with provenance |
| Uses the wrong board target | Targets are qualified — `esp32s3_devkitc/esp32s3/procpu`, not `esp32s3_devkitc` | Board catalogue with targets and supported peripherals |
| Writes code for the wrong Zephyr version | Projects pin a release that is not the newest | Index the user's own workspace, not just upstream |

Prose documentation search alone fixes none of these. The data that matters is
structured and lives *outside* `doc/` — in Kconfig files, devicetree bindings,
board metadata, and headers. So the index covers all of it.

---

## Install

```bash
claude plugin marketplace add mssaleh/zephyr-ai
claude plugin install zephyr-ai@zephyr-ai
```

Then build the index for your Zephyr tree. Ask Claude:

> build the Zephyr index for this project

which runs the `zephyr-index` skill: it finds your west workspace, indexes it in
about four seconds, and writes to the plugin's persistent data directory so it
survives plugin updates. Rebuild after `west update` or when you change the
pinned Zephyr revision.

**Requirements:** Node.js 22.13 or newer, for the built-in `node:sqlite`. No
native modules, no compilation, and no `npm install` at runtime.

### Try it without installing

```bash
git clone https://github.com/mssaleh/zephyr-ai && cd zephyr-ai
npm install && npm run fetch:zephyr && npm run build && npm run build:index
ZEPHYR_AI_INDEX="$PWD/index/zephyr.db" claude --plugin-dir "$PWD/plugin"
```

---

## What you get

### 13 MCP tools

In `search` / `get` pairs, so the model narrows before it reads:

| Tool | Answers |
| --- | --- |
| `search_kconfig` / `get_kconfig` | Does this symbol exist? What type, defaults, dependencies? **What selects it?** |
| `search_bindings` / `get_binding` | What properties does this compatible accept, flattened across its include chain? |
| `search_boards` / `get_board` | What is the qualified build target? Which peripherals does the board support? |
| `search_api` / `get_api` | What is the signature, and which negative errno values must I handle? |
| `search_samples` / `get_sample` | Show me a sample `prj.conf` and overlay, including its recorded Twister platform evidence |
| `search_docs` / `get_doc` | Documentation, chunked by section, with upstream URLs |
| `index_status` | Which Zephyr version is indexed, and does it match this project? |

### 15 skills

`zephyr-development` (the router that establishes tool discipline), then
`zephyr-kconfig`, `zephyr-devicetree`, `zephyr-build-flash`, `zephyr-debugging`,
`zephyr-rtos-patterns`, `zephyr-drivers-sensors`, `zephyr-project-setup`,
`zephyr-power`, `zephyr-bluetooth`, `zephyr-networking`, `zephyr-testing`,
`zephyr-index`, and the platform packs `stm32-platform` and `esp32-platform`.

### 4 agents

| Agent | Use for |
| --- | --- |
| `zephyr-architect` | Turning a product requirement into a firmware design, grounded in what the target hardware actually supports |
| `build-triage` | Root-causing a failing build from its output and generated artefacts |
| `devicetree-specialist` | Authoring or repairing overlays and bindings |
| `firmware-reviewer` | ISR-context violations, unchecked errno returns, stack sizing, blocking in the wrong place |

### 2 hooks

`SessionStart` warns when the index and the project's west workspace disagree on
the Zephyr version. `PostToolUse` validates every `.conf` and `.overlay` edit
against the index:

```
Zephyr validation found 2 problem(s) in prj.conf:
  line 2: CONFIG_BT_PERIPHERAL_MODE was not found in the indexed Zephyr 4.4.2 catalogue.
          Generated or application-local symbols may not be covered.
  line 4: CONFIG_BT_RX_STACK_SIZE is int but is set to "y".
```

It is silent when the edit is clean, so it stays worth reading.

---

## Coverage

Indexed from Zephyr **v4.4.2** (`dccb0959`). Builds in ~4 seconds to a 72 MiB
SQLite database.

| | |
| --- | --- |
| Documentation pages / sections | 2 080 / 15 842 |
| Kconfig symbols | 19 796 |
| Devicetree compatibles / properties | 3 442 / 119 718 |
| Boards / build targets / SoCs | 1 014 / 1 425 / 1 475 |
| Samples (with `prj.conf` and overlays inlined) | 610 |
| C API symbols | 26 148 |

Board documentation — pinouts, jumpers, flashing procedures — is indexed too:
1 084 board pages live under `boards/`, not `doc/`.

---

## Configuration

| Environment variable | Effect |
| --- | --- |
| `ZEPHYR_AI_INDEX` | Use this index file, overriding everything else |
| `ZEPHYR_BASE` | Where the `zephyr-index` skill looks for a Zephyr tree |

The server resolves the index on every call — `ZEPHYR_AI_INDEX`, then a
`workspace.db` built from your own tree, then the shipped default — so an index
built mid-session is picked up without restarting Claude Code.

---

## Repository layout

```
packages/ingest/       Parsers and index builder (dev-time)
packages/mcp-server/   MCP server, protocol 2025-11-25, stdio
plugin/                The Claude Code plugin
scripts/               fetch-zephyr.mjs — pinned Zephyr checkout
zephyr.lock.json       The pinned Zephyr revision
```

The Zephyr tree is a **build input, not a submodule**: pinned by commit in
`zephyr.lock.json` and fetched into gitignored `.cache/`. A submodule would push
612 MB onto everyone who clones this repository, including people who only want
the plugin.

---

## Development

```bash
npm install
npm run fetch:zephyr     # shallow clone of the pinned Zephyr (~610 MB, ~15 s)
npm run build            # bundle the server and the ingest CLI into plugin/mcp/
npm run build:index      # build index/zephyr.db
npm run check            # typecheck + build + 78 tests + plugin validation
```

Contributor guide, invariants, and extension points: **[AGENTS.md](AGENTS.md)**.

Design rationale — index schema, devicetree include flattening, Kconfig
aggregation, and why the MCP protocol layer is hand-written rather than taken
from the official SDK: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Licence

Apache-2.0, matching Zephyr.
