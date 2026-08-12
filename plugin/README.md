# zephyr-ai

Grounded Zephyr RTOS firmware development for Claude Code, with STM32 and ESP32
workflow guidance.

## First use

Ask Claude to **build the Zephyr index for this project**. The bundled
`zephyr-index` skill discovers the workspace and creates an immutable,
project/fingerprint-scoped database in the plugin data directory. Requirements are
Node.js 22.13+, Python 3.10+, PyYAML, and the semantic Python libraries shipped in the
selected Zephyr tree. No npm installation occurs at runtime.

The server does not ship or silently select a global default. `ZEPHYR_AI_INDEX` is a
strict override; otherwise the active index for `CLAUDE_PROJECT_DIR` is used. Call
`index_status` to inspect the exact commit, fingerprint, coverage, and project match.

## How it behaves

- Thirteen MCP tools search/get Kconfig, bindings, boards, APIs, samples, and docs.
- Fifteen skills activate by workflow and query the index before generating firmware.
- Four specialist agents cover architecture, build triage, devicetree, and review.
- Session and edit hooks validate only what available evidence can prove. Catalogue
  misses remain uncertainty when generated, application-local, or external-module
  declarations are not covered.

`--modules` currently extends Kconfig and binding coverage only. Ordinary workspace
indexes use an explicitly incomplete API header fallback; release indexes are built
from Doxygen XML.

Troubleshooting:

- **No index:** invoke `zephyr-index`.
- **Schema, commit, manifest, or context mismatch:** rebuild the project index.
- **Python contract failure:** activate the west environment containing PyYAML or set
  `PYTHON_EXECUTABLE`.
- **A catalogue miss for module syntax:** rebuild with the applicable module root and
  treat the miss as unproven until coverage is complete.

Apache-2.0.
