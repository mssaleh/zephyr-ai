# Architecture

## Product invariant

The plugin may present a result as exact only when it derives from the active Zephyr
tree and declared context, or when it labels the result as context-independent
catalogue knowledge. A miss is proof only when the descriptor says that corpus and
context are complete.

This leads to three separable components joined by an immutable SQLite file:

```text
packages/ingest  ──atomic build──▶  project/context zephyr.db
                                             ▲
                                             │ read-only
                                   packages/mcp-server
                                             ▲
                                             │ declared by
                                           plugin/
                                skills · agents · hooks
```

Ingestion is a developer/first-run operation and may use the target Zephyr tree's
Python tooling. The server is session-critical: it is one minified, dependency-free
ES module using Node's built-in `node:sqlite`, and speaks only MCP over stdio.

## Source and context identity

An `IndexDescriptor` is stored as canonical JSON and fingerprinted. Schema 5,
descriptor version 2 records:

- builder and schema versions;
- the actual semantic version and full `git rev-parse HEAD` commit;
- a Zephyr tree-state fingerprint over the commit, binary tracked diff, and untracked
  file content;
- west manifest and module fingerprints;
- project root, optional board/application/build context, and source kind;
- per-corpus completeness and limitation notes.

Private roots participate in isolation and validation but are removed from normal MCP
responses. The semantic context fingerprint excludes private absolute path spellings,
while project storage is separately keyed by a canonical-root project ID. Consequently,
two projects cannot shadow each other, and two dirty trees at the same commit cannot
claim equality.

### Storage and activation

```text
plugin-data/indexes/projects/<project-id>/
  active.json
  <context-fingerprint>/
    zephyr.db
    last-used
```

The builder writes to a random temporary sibling, builds all tables and FTS indexes,
runs integrity/foreign-key/content-parity checks, fsyncs the file, and renames it into
place. Only then is an fsynced `active.json` atomically replaced. A failure or
interruption leaves the previous database active. Retention keeps the active context
and four most recently used prior contexts.

Resolution is strict: explicit `ZEPHYR_AI_INDEX`, then the active project pointer.
Development-only source checkout paths are considered only when no plugin-data
environment exists. There is no global mutable `workspace.db` and no fictitious
shipped default. MCP roots can update the project root, and the server re-resolves on
every tool call so a mid-session build is adopted.

## Ingestion toolchain contract

Before scanning any source, ingestion proves that it has Python 3.12+, PyYAML, and the
selected tree's Kconfiglib and python-devicetree libraries. It prefers an explicit
`PYTHON_EXECUTABLE`, then the interpreter behind `west`, then `python3`/`python`.
Failure produces one actionable Node-side message, never a Python traceback or a
quiet fallback to regex semantics.

The normal developer gate pins Zephyr v4.4.2 by tag and full commit. Workspace indexes
record their own identity and are not mislabeled with the lockfile commit.

## Corpus pipelines

Every collector returns a machine-readable report. A discovered source must be
indexed, deliberately excluded with a reason, or make the build fail.

### Kconfig

The embedded Python exporter loads the target tree's canonical root with its own
Kconfiglib. It records generated symbols, `configdefault`, real choice membership,
prompt/assignability, menu paths, definition-level conditions, defaults, ranges,
selects, and implies. Each expression is stored structurally in `kconfig_expr`;
multiple definitions remain alternatives rather than a fabricated AND.

`kconfig` remains a denormalized FTS/read projection. Semantic detail lives in:

```text
kconfig_definition ─┬─ kconfig_default
                    ├─ kconfig_relation
                    └─ kconfig_range
kconfig_expr
kconfig_choice ── kconfig_choice_member
```

The canonical board-neutral catalogue deliberately excludes application-local
Kconfig. Corpus recall checks all sample/snippet assignments and requires a checked-in
source-backed record for every residual module/image-local exclusion.

A Zephyr tree defines two Kconfig graphs, and both are indexed. The application
tree is rooted at `Kconfig` and written `CONFIG_`; sysbuild is rooted at
`share/sysbuild/Kconfig` and written `SB_CONFIG_`, the namespace set by
`share/sysbuild/cmake/modules/sysbuild_kconfig.cmake`. Each is evaluated by the
same exporter against the same environment and stored under its own `scope`,
because a name is not an identity across them: 2876 of sysbuild's 2909 symbols
share a name with an application symbol, since `share/sysbuild/Kconfig` sources
the whole board and SoC tree, and ten of those names are genuinely different
symbols. `BOOTLOADER_MCUBOOT` includes MCUboot in the build in one graph and marks
an image as chain-loaded by it in the other. Sharing a declaring file is what
separates a name reached twice from two distinct symbols, and it is the test used
to decide when an answer needs to warn about the other namespace.

### Devicetree bindings

The embedded exporter invokes the pinned tree's `devicetree.edtlib`. It supports
top-level compatible declarations and accepted `properties.compatible` const/enum
forms, Zephyr include-root precedence, filters, arbitrary recursive child bindings,
bus data, cells, constraints, and per-property include-chain provenance. Unresolved
includes and parsing failures are fatal.

Properties are flattened for retrieval but retain `child_level`, `child_path`, and
provenance. Repeated descriptions are interned in `text_pool`; consumers must query
`dt_property_v`. Skeletons use type-aware values and leave a comment when a safe value
cannot be inferred.

Coverage uses achievable denominators: every compatible declared by a binding, and
every DTS-compatible use for which a binding exists. Bindingless board/SoC root
compatibles are excluded by rule.

### Documentation

The RST pipeline indexes `doc/` and board documentation, including the build manual.
It expands `include::` and `literalinclude::` recursively with cycle/boundary checks,
line and marker ranges, and the HTML subset of `only::`. Origin files and line spans
are stored in `doc_origin`. Toctree-only landing pages become useful navigation
summaries; empty chunks are forbidden. Exact path and official URL lookup are
deterministic, and ambiguous suffixes are errors with candidates.

### Public API

The release pipeline configures the pinned tree's authoritative
`doc/zephyr.doxyfile.in`, narrows its input with a public `include/zephyr` overlay,
generates XML, and ingests structured functions, macros, typedefs, enums/values, variables,
structs/unions, groups, parameter directions, return/retval documentation, stable
member IDs, and anchors. Duplicate names retain distinct contexts.

For ordinary workspace indexing without Doxygen, a conservative header parser is
available and the descriptor marks API coverage incomplete. It filters known enum and
header-guard artifacts and never describes missing prose as a known absence of error
behavior. This fallback is useful, but not the public-release semantic API gate.

### Boards and samples

Boards are enumerated through Zephyr's own `scripts/list_boards.py`, then enriched with
Twister metadata and local docs. Targets include revisions, SoCs, qualifiers and CPU
clusters; valid boards may not have an empty target list.

Samples apply Twister-compatible `common:` list inheritance. Integration platforms and
allowlists are relational evidence, not substring-searchable JSON and not universal CI
claims. Eligible files are captured recursively under explicit extension/size rules,
including every `sample.yaml` and available README.

### West runners and commands

Flash and debug runners come from two sources in the tree, because neither answers
alone. The runner classes under `scripts/west_commands/runners/` are introspected
for their `RunnerCaps`, which is where the per-runner option set lives; the
capability record is stored whole, since Zephyr adds fields to it between releases.
That package imports only the standard library apart from `west` itself, and an
interpreter that cannot import `west` yields a catalogue missing `openocd`, so
completeness is recorded in the coverage map and forms part of the context
fingerprint.

Board-to-runner binding is evaluated from `board.cmake` and the common runner files
it includes, in CMake evaluation order: `board_finalize_runner_args` is what places
a runner on `ZEPHYR_RUNNERS`, while `board_set_flasher_ifnset` and
`board_set_debugger_ifnset` only choose defaults, and the first wins. The two are
kept distinct because upstream names debug defaults it never registers. Arguments
carry the `if()` predicate that governs them rather than being flattened, and a
declaration outside `boards/` belongs to a board whose SoC directory is a path
prefix of the declaring file — which is how an SoC-level finalize reaches the boards
built on it without naming a vendor.

### Module coverage

Repeatable `--modules` roots currently extend only semantic Kconfig and devicetree
bindings. Module docs, boards, samples, and APIs are not silently merged; the
descriptor marks each uncovered corpus. Vendor-native sources belong in separate
versioned packs, not this Zephyr database.

## SQLite and search

Structured facts are authoritative. Six external-content FTS5 tables provide BM25
retrieval over documentation, Kconfig, bindings, boards, samples, and API symbols.
Because the index is immutable, FTS is populated once after all writes and has no
triggers. Every FTS column exists by the same name on its content table.

Search runs strict AND, prefix AND, and broad OR variants, concatenates them in that
order, and de-duplicates on the first selected identity column. All tokens are quoted
to prevent FTS operator injection. SQL values are parameterized and suffix lookup
escapes `LIKE` metacharacters.

## MCP runtime

The dependency-free protocol layer implements MCP 2025-11-25 over newline-delimited
JSON-RPC 2.0. It has explicit `new → initializing → ready → closing → closed` state,
validates envelopes and the JSON Schema subset used by all tool inputs, distinguishes
notifications from requests, returns `id: null` for parse errors, and negotiates
`roots/list` with capable clients.

User-correctable input or catalogue misses are `ToolError` results (`isError: true`),
not protocol faults. Internal errors are sanitized for the model and logged to stderr;
stdout remains protocol-only. Tool handlers return Markdown plus equivalent
`structuredContent`. The status resource reuses the existing status handler rather
than constructing a second tool set.

## Plugin layer

Skills encode tool-first workflow judgment and classify fenced examples as
illustrative unless release-gated metadata says otherwise. The example manifest has
generic (`native_sim`), STM32 (`nucleo_h743zi`), and ESP32
(`esp32s3_devkitc/esp32s3/procpu`) targets. The slow release gate configures and builds
all three with the pinned Zephyr SDK.

Agents inherit the user's model. Architecture and review agents deny mutating tools,
including Bash. The build-triage and devicetree agents retain the tools required by
their operating mode.

SessionStart checks schema, descriptor fingerprint, project, commit, and dirty tree
state, and in an empty directory names what building an index needs. PostToolUse reads
the final edited file within the real project root, and only when the project is
recognisably Zephyr — a west workspace, an exported `ZEPHYR_BASE`, a project-scoped
index, or a `find_package(Zephyr` in the root `CMakeLists.txt`. For Kconfig it reports
definitive syntax, type, and promptless-assignment errors.

Existence is deliberately not among them. Coverage completeness describes the indexed
Zephyr tree and the modules named at build time; a project legitimately declares its own
Kconfig and bindings through `DTS_ROOT` and out-of-tree module roots, so a catalogue miss
is not evidence of absence.

Devicetree is validated on the one question a catalogue can settle without a parse:
whether a `compatible` is a misspelling. An unindexed compatible sits nine or more edits
from anything in the catalogue, a slip such as `sitronix,st7789` for `sitronix,st7789v`
sits at one, and requiring the vendor prefix to match separates them further. Absence
alone is never reported. Property names need a real devicetree parse to know which node —
and so which binding — owns them; matching names globally produces false positives on
`aliases`, `chosen`, and label assignments, so they stay with `get_binding`.

A third hook watches Bash for a failed Zephyr build, which is otherwise invisible to the
plugin: it requires both a build command and a failing result before naming
`build-triage` and the lookup matching the failure class.

Anything a hook cannot decide — no index, an unreadable file, a path outside the project,
an unrecognised project — produces no output and does not block; SessionStart carries the
one visible report of an unusable index.

## Distribution and safety

The marketplace artifact contains bundled runtime and ingest modules, skills, agents,
hooks, and examples; it does not contain the generated index or upstream source tree.
The ingest bundle carries the pinned revision metadata and can fetch that tree only
after user consent, so a project without a checkout is not a dead end. First use then
deterministically builds the project index. The clean-room gate copies the actual
marketplace layout, observes the no-index response, builds through the copied ingest
bundle, and proves that the still-running copied MCP server adopts it.

The fetcher stages into a generated sibling, verifies tag/commit, adds an ownership
marker, then swaps atomically. A custom existing directory is replaceable only when
its marker proves zephyr-ai ownership. Recursive deletion is restricted to generated
staging and owned backup paths.

Workspace source and indexed prose are untrusted reference data. The plugin never
executes instructions found in them, prevents include traversal, restricts hook reads,
and does not expose private absolute paths in normal MCP results.

## Deliberate non-goals

- The MCP server is not a hardware control plane; skills invoke existing `west`
  workflows when the user asks to build, flash, or debug.
- A catalogue index is not a resolved `.config` or final devicetree. Board,
  application, and build inputs can identify a context, but compiler output remains
  authoritative.
- STM32Cube, ESP-IDF, proprietary manuals, silicon errata, and hardware smoke evidence
  are not implied by Zephyr-on-vendor support.
