# zephyr-ai

Grounded Zephyr RTOS firmware development for Claude Code, with STM32 and ESP32
workflow guidance.

## First use

Ask Claude to **build the Zephyr index for this project**. The bundled
`zephyr-index` skill discovers the workspace and creates an immutable,
project/fingerprint-scoped database in the plugin data directory. Requirements are
Node.js 24+, Python 3.12+, PyYAML, and the semantic Python libraries shipped in the
selected Zephyr tree. No npm installation occurs at runtime.

If the project has no Zephyr checkout, the skill offers to fetch the revision pinned
into the plugin and waits for consent before using the network. The checkout is kept in
the persistent plugin data directory and can be reused across projects.

The server does not ship or silently select a global default. `ZEPHYR_AI_INDEX` is a
strict override; otherwise the active index for `CLAUDE_PROJECT_DIR` is used. Call
`index_status` to inspect the exact commit, fingerprint, coverage, and project match.

## How it behaves

- Thirteen MCP tools search/get Kconfig, bindings, boards, APIs, samples, and docs.
- Fifteen skills activate by workflow and query the index before generating firmware.
- Four specialist agents cover architecture, build triage, devicetree, and review.
- The edit hook reports only what the catalogue can decide alone: malformed Kconfig
  syntax, a type mismatch, or assigning a promptless symbol. It never reports a
  `CONFIG_` symbol or a compatible as missing, because coverage describes the indexed
  Zephyr tree and not your project, and it is silent outside a Zephyr project or when no
  index is available. SessionStart reports an unusable index once per session.

`--modules` currently extends Kconfig and binding coverage only. Ordinary workspace
indexes auto-detect conventional Doxygen XML output when it exists and otherwise use
an explicitly incomplete API header fallback; release indexes are built from Doxygen
XML.

Troubleshooting:

- **No index:** invoke `zephyr-index`.
- **Schema, commit, manifest, or context mismatch:** rebuild the project index.
- **Python contract failure:** activate the west environment containing PyYAML or set
  `PYTHON_EXECUTABLE`.
- **A catalogue miss for module syntax:** rebuild with the applicable module root and
  treat the miss as unproven until coverage is complete.

Apache-2.0.
