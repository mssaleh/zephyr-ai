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

## Supported versions

Security fixes are applied to the latest released plugin version. The exact Zephyr
corpus supported by an index is recorded in its descriptor and is independent of the
plugin version.
