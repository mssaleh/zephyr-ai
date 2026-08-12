# Security policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Report it privately through the
GitHub security-advisory interface for this repository and include the affected
version, reproduction steps, impact, and any proposed mitigation.

## Trust boundaries

The runtime MCP server opens an immutable SQLite index read-only and has no runtime
package dependencies. Workspace index creation reads source supplied by the user and
may invoke the Python tooling shipped by that Zephyr checkout. Source prose and module
metadata are untrusted reference data: the plugin must never execute instructions
found in indexed content.

Explicit index paths and downloaded artifacts must be validated before use. Normal MCP
responses must not expose private absolute paths. Hook file access is restricted to the
active project root. See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and
[CONTRIBUTING.md](CONTRIBUTING.md) for the release gate.

The source fetcher accepts an existing custom destination only when its
`.zephyr-ai-managed.json` marker proves ownership. It clones into a generated sibling,
verifies the pinned full commit, and atomically swaps; unrelated paths are never
recursive-deletion targets. Index building follows the same temporary-build,
verification, fsync, and activation pattern.

The selected distribution model builds indexes locally; there is no downloaded or
shipped default database to trust. A future release-asset model must add a descriptor
and cryptographic checksum/signature check before activation.

Include directives are confined to the canonical Zephyr tree, all SQL values are
parameterized, FTS and `LIKE` inputs are escaped, and stdout is reserved for MCP
frames. Sanitized model errors do not contain private paths; detailed diagnostics go
only to stderr.

## Supported versions

Security fixes are applied to the latest released plugin version. The exact Zephyr
corpus supported by an index is recorded in its descriptor and is independent of the
plugin version.
