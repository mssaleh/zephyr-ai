# Changelog

All notable user-visible changes are recorded here. The format follows Keep a
Changelog, and releases use semantic versioning.

## [0.9.0] - 2026-08-14

Rebuild the index with the `zephyr-index` skill after upgrading; the schema moves
to 11 and the server and hooks refuse an older one.

Six skills were merged into three and every skill description was rewritten, so
`/zephyr-ai:stm32-platform`, `/zephyr-ai:esp32-platform`,
`/zephyr-ai:zephyr-prerequisites`, `/zephyr-ai:zephyr-project-setup`,
`/zephyr-ai:zephyr-networking` and `/zephyr-ai:zephyr-bluetooth` are now
`/zephyr-ai:zephyr-platforms`, `/zephyr-ai:zephyr-setup` and
`/zephyr-ai:zephyr-connectivity`. No guidance was removed; each former skill's
body is a `references/` page inside its successor.

### Added

- **The index records what each driver will accept, not only where it is used.**
  Many drivers refuse to initialise unless an identity register reads one of a
  fixed set of values, and that set exists in no binding, board file, or
  documentation page. `invensense,mpu6050` accepts `0x19`, which is an MPU6880 —
  a part whose name appears nowhere in the tree. `get_binding` now states the
  register and the accepted values inline, and `search_bindings` answers the
  reverse direction from an `identity_value` read off the hardware, which is the
  direction a developer at a bench actually has. Where the driver's shape was not
  recognised nothing is stored, and every rendering says that an absent record is
  not a claim that the driver accepts nothing.
- **`get_board` names the configuration upstream already publishes for a target.**
  A sample or test that ships `boards/<qualified_target>.overlay` configures that
  exact target, with the DMA channels, request numbers and cache attributes that
  nobody would guess, and it need not name the board in any Twister key.
  `search_samples` counts those suites as evidence too: on one board that is eight
  further suites which a search of the platform lists reported as none.
- **`get_board` states the memory the application gets.** Read from the board's
  own `chosen` node and the `reg` of what it points at, through the devicetree
  include chain and any `ranges` translation: 511 KB at `0x34180400` where the
  Twister metadata says 1024 KB. A board whose devicetree chain cannot be resolved
  unambiguously reports nothing rather than a guess.
- **The devicetree usage corpus records the node each board declares.** The node
  name is the part number, so an answer reads "used on `m5stack_atoms3` as
  `mpu6886@68`" rather than requiring the reader to know what that board carries.
  The full `get_binding` answer now carries this section, which only the batched
  summary did.

### Changed

- **The skill listing fits the budget Claude Code gives it.** Claude Code loads
  skill names and descriptions into a character budget of about 1% of the context
  window and drops descriptions when it overflows, starting with the skills
  invoked least — which for a freshly installed plugin is all of them. This
  plugin's listing was 8 592 characters across 17 skills, over four times the
  budget on a 200k-context session, and across four measured studies exactly one
  skill ever fired. It is now 2 938 characters across 14, a gate holds it there,
  and no guidance was lost: the merged bodies are `references/` pages.
- **The MCP server instructions are written to be searched for.** Claude Code
  defers MCP tool definitions, so at session start the model sees the tool names
  and this text and nothing else. It now leads with the situations that should
  send a session to these tools, and names the two questions the index answers
  that no file-level source can.
- **SessionStart names the tools and the indexed Zephyr version.** In a healthy
  project the hook said nothing at all, which left the one channel that reliably
  reaches a session silent in exactly the case where the tools can answer. It now
  states the version and the scoped tool names, which are what a deferred tool
  must be loaded by.
- **The devicetree write nudge names the identity question and drops the agent
  referral.** Across four studies the tool advice in that sentence was taken and
  the agent referral in the same sentence was not, so the words are spent on the
  check that prevents a device which initialises and returns numbers that are not
  readings.
- **Agent descriptions name the situation to reach for them without being asked**,
  which is the mechanism Claude Code documents for automatic delegation.

### Fixed

- **`check_config` reported `ok` for lines it did not judge.**
  `CONFIG_LV_USE_MONKEY=y` came back `ok, bool` — the identical verdict
  `CONFIG_GPIO=y` receives, which was verified in full — while the module Kconfig
  that declares it had never been read. Every line now falls in one of three
  populations, confirmed, not judged, or a problem, the summary counts all three,
  and a not-judged line says which test could not be applied.
- **`search_bindings` would not match part of a compatible.** `st,stm32-digi-temp`
  resolved and `stm32-digi-temp` and `digi-temp` returned nothing, because the
  full-text tokeniser treats the whole compatible as one token — and the miss
  volunteered "out-of-tree drivers are not in this index" about a binding that is
  present, which is a reason to stop looking. Fragments now match, and that
  sentence appears only when nothing in the catalogue matched.
- **The build-failure hook could fire when no build had failed.** It required a
  build command, but a recognised failure signature alone was enough when the
  harness reported no exit status, so any command printing a captured build log
  qualified. It now requires a non-zero exit, or west's own failure line where no
  status was reported, and ignores a build command inside a heredoc body.
  `west twister` and `make` were missing from the command set and are now
  included.

## [0.8.0] - 2026-08-14

Rebuild the index with the `zephyr-index` skill after upgrading; the schema moves
to 10 and the server and hooks refuse an older one.

### Fixed

- **The write validator gave a clean bill to a `prj.conf` that cannot build.**
  `CONFIG_USE_STM32_HAL_DTS=y` is rejected outright by Zephyr's
  `check_no_promptless_assign`, and `validate-zephyr-edit` reported "checked 24
  Kconfig assignments … no problems found". A guard suppressed the promptless
  check for any symbol with a definition under `modules/`, on the reasoning that
  such a declaration ships with an absent module. `modules/` holds two unrelated
  kinds of file and the guard could not tell them apart: `modules/Kconfig.stm32`
  is upstream's own file, it declares the whole `USE_STM32_HAL_*` family, and no
  module redeclares any of it — while `modules/lvgl/Kconfig` mirrors symbols the
  lvgl module itself declares *with* prompts. Measured on the catalogue index, the
  guard silenced 745 symbols to avoid 16 real false positives, all of them LVGL.
  The index now records each module's in-tree glue directory and whether its own
  Kconfig was read, so the two cases are separated by the manifest rather than by
  a path prefix: 729 symbols become reportable, the 16 stay suppressed, and both
  `check_config` and the write hook make the corrected claim.
- **The build-failure hook did not recognise Zephyr's promptless error.** The same
  mistake, missed a second time after the build, and answered with generic CMake
  advice while the correct Kconfig advice sat unused in the same table. The
  patterns were written from paraphrase and could not cross a line break;
  Zephyr's `err()` puts the message through `textwrap.fill(…, 100)`, so the source
  line breaks are discarded and the text is re-wrapped at column 100 — the break
  falls in a different place for every symbol, because the symbol's name and
  location are inside the wrapped text. Classification is now driven by a corpus
  of real Zephyr output in `test/fixtures/build-failures/`, one file per class,
  with the routing asserted for each. Missing-binding and region-overflow became
  their own classes, because the advice that helps differs from the neighbours
  they were folded into.
- **"No problems found" claimed more than the check knew.** Lines the validator
  skipped were counted as lines it had checked. It now reports three populations —
  verified, outside the catalogue, and not judged with the reason — so the
  reassurance is as narrow as the check.
- **SessionStart was silent in a first-day firmware project.** It spoke only when
  the project root held nothing but dot-entries, so a single `docs/` folder of
  board manuals silenced it. The predicate is now "holds nothing that identifies
  it as another kind of project"; documentation, `.git`, and editor state do not
  disqualify.

### Added

- **`get_source` reads module trees.** A third of the grounding lookups in the
  evaluation that produced this release went to `modules/hal/stm32/stm32cube/**` —
  CMSIS headers and HAL sources the index could not see at any activation rate.
  Module files are now readable by their workspace-relative path at the revision
  the manifest pins, with the module and revision named in the answer. This is not
  an STM32 quirk: "does this driver work on my silicon" is answered in the vendor
  HAL for every vendor Zephyr supports.
- **Bindings report where upstream instantiates them.** `get_binding` and
  `search_bindings` now say which boards and SoC series actually use a compatible,
  from a new corpus of every `compatible` in the tree's devicetree sources. This is
  the answer to the study's most expensive discovery: `st,stm32-digi-temp` is the
  name of the peripheral an STM32N657 has, written for a different IP block, and a
  node using it compiles and does nothing. Establishing that took roughly a dozen
  shell calls; it is now one, and it reports H5 and H7 devicetree and no N6.
- **Kconfig symbols scoped to an SoC series are indexed.** Zephyr sources a
  series' Kconfig only once that series is selected, so a catalogue could not
  resolve `STM32N6_BOOT_SERIAL` — the symbol every `stm32cubeprogrammer` argument
  on that board is guarded on, and one `get_board` cites by name. These are now
  carried as declaration-level records with their type, prompt and location, in
  their own table, labelled as parsed rather than evaluated.
- **A resolved build can be ingested.** `--build-dir` now reads
  `build/zephyr/.config` and `build/zephyr/zephyr.dts` into their own tables rather
  than only recording build identity. `get_kconfig` reports what a symbol actually
  came out as beside what the tree says it is, which is where "I set it and it did
  not take" lives. An explicitly unset symbol is stored as a resolved value, not
  as an absence.
- **`index_status` renders `input_hash` and `content_hash`.** 0.7.0 stored both and
  described a two-machine diagnosis built on the pair; neither was reachable
  through any tool, so the procedure could not be carried out.
- **`get_board` renders the filenames each qualified target picks up.** A board
  overlay whose name does not match the qualified target is skipped in silence and
  fails much later as an undefined devicetree symbol, which reads as a mistake in
  the C. The exact `overlay:` and `conf:` names are now listed per target.
- **A `hardware-bringup` agent**, carrying the method the evaluated session
  actually used: read the failure signature before the register map, divide the
  clock before the archaeology, read the code behind an alarming message, prefer
  the hypothesis with the cheapest disproof, and buy observability when each cycle
  costs a physical action.
- **A `zephyr-hardware-iteration` skill** for work where every test cycle costs a
  jumper, a power cycle, or a trip to a lab. Its first rule is the one that pays
  most: before adapting to a slow loop, check whether a faster one exists.
  `get_board` and `get_runner` already enumerate every runner a board declares,
  and they differ in whether they program flash, load through the probe, or use a
  separate boot path — an alternate loop sitting unused in the board's own files
  can mean every cycle of a project is paid at many times its necessary price.
  `get_board` now says so where a board declares more than one option.
- **The promptless finding names the symbols that select it.** "Enable whatever
  selects it" is advice; `CONFIG_A`, `CONFIG_B` is an edit. Where nothing in the
  catalogue selects the symbol, the message says to declare an application symbol
  that does.

### Changed

- **`get_board` links boards by silicon, not only by name.** The confusable-boards
  feature worked on the pair it was designed for and did not link
  `nucleo_n657x0_q` with `stm32n6570_dk`, which share the `stm32n657xx` SoC, share
  no near-miss name token, and differ on the external flash part, the `--extload`
  file, the download address, and the declared RAM. SoC identity is now a second
  predicate and the answer says which relation fired.
- **Twister metadata is labelled as such.** `get_board` reported "1024 KB flash,
  1024 KB RAM" for a board whose application gets 511 KB of SRAM and no internal
  flash at all. The figures are correct as Twister metadata and were being read as
  a memory budget; where a target's `_defconfig` sets `CONFIG_XIP=n`, the answer
  now says the image is not executed from an internal flash that figure could be
  describing, and points at the devicetree partitions for the real limit.
- **A `get_kconfig` miss names its own context and remedy.** A miss whose leading
  token matches an indexed SoC series or board now says where a symbol of that
  name would be declared and how to reach it, instead of only that no close
  spelling was found.
- **`ZEPHYR_AI_INDEX` is named as the override.** `ZEPHYR_AI_PROJECT_ROOT` is set
  from `${CLAUDE_PROJECT_DIR}`, which the CLI always overwrites with the session's
  working directory, so exporting it before launching a session has no effect and
  no index resolves. An evaluation run was voided by exactly this. The no-index
  message and SessionStart now say so.
- **`build-triage` no longer claims the easy failures.** Its trigger is narrowed to
  failures that are genuinely non-local — a build that differs between pristine and
  incremental, an error naming a file the developer did not write, a failure that
  survived the obvious fix — and it is told to decline a one-line fix rather than
  perform an investigation the caller does not need.
- Skills gained the behavioural findings: verify the register contract rather than
  the family name; the polled-succeeds/reply-fails signature and dividing the clock
  before register archaeology; a green build is not a runnable artifact; time and
  ordering as the bug class that actually bites; watchdog details that turn a
  safety net into a brick; lossy early-boot output and competing serial readers;
  boards whose debug port depends on strap state; and confirming a file was
  consumed rather than inferring it from the absence of a complaint.
- `zephyr-prerequisites` gained explicit trigger language for before the first
  build in a new workspace, and `zephyr-index` hands off to it once an index
  completes — indexing succeeding while building fails is the split that skill
  exists for.

## [0.7.0] - 2026-08-13

Rebuild the index with the `zephyr-index` skill after upgrading. The schema is
unchanged at 9 and the catalogue this produces is byte-identical to 0.6.2's; what
changed is that it is now reproducible on purpose rather than by inspection.

### Changed

- **The index is a derivation with declared inputs.** Four releases each fixed a
  machine dependency where it was found — a locale-dependent sort, an unsorted
  directory walk, a Doxygen traversal that decided which of two records survived a
  merge, an environment variable inherited from the caller's shell — and three
  tags went out with a red release gate. Each fix was correct and none closed
  anything, because the ingest had never declared what it consumes. It does now.
- Collectors read a `SourceManifest`: an ordered, content-addressed list built
  from `git ls-files -s`, reconciled against the worktree for modified and
  untracked files, and hashed directly when a root is not a repository — in which
  case the index records that its source was not addressable rather than implying
  otherwise. A read the manifest does not vouch for, or one whose bytes changed
  under the build, is an error. The directory walker is gone: its contract asked
  callers to sort and three of its four callers did not.
- The ingest re-execs once into an environment built from a declaration and
  inherits nothing, so every descendant is hermetic without knowing it. That
  closed the `ZEPHYR_TOOLCHAIN_VARIANT` leak and, without anyone looking for them,
  `PYTHONHASHSEED`, `TZ` and the system git configuration.
- `zephyr.lock.json` is resolved from where the ingest is installed rather than
  from the working directory. The same tree indexed as `pinned-upstream` from the
  repository root and as `explicit-tree` from anywhere else.

### Added

- Every index records `input_hash` beside `content_hash`, covering the tree and
  module manifests, the Doxygen XML, the adapter sources, the lockfile, the tool
  versions and the declared environment. The pair makes a disagreement between two
  machines answerable: a differing `input_hash` means the inputs differ and names
  which, and a matching one with differing content means the derivation is impure.
  Every failure of the last four releases is one of those two lines.
- `quality:reproducible` varies nine environment variables and the working
  directory at once and checks that one property, instead of sampling the axes
  someone had already thought of. It found the lockfile dependency above on its
  first run.

## [0.6.2] - 2026-08-13

Rebuild the index with the `zephyr-index` skill after upgrading.

### Fixed

- **Doxygen's traversal order decided API content, not just row order.** 0.6.1
  sorted the rows, which was necessary and not sufficient: the exporter merges a
  member that appears in both a file compound and a group compound, keeping the
  longer prose and breaking ties by whichever was seen first. Compounds are listed
  in `index.xml` in Doxygen's own traversal of the input tree, so which record
  survived a tie differed between machines — identical counts, different text. The
  exporter now visits compounds in sorted order and breaks ties lexicographically,
  so neither depends on the listing.

### Added

- `quality:reproducible` now covers the semantic corpus, and builds it a third
  time against a copy of the Doxygen XML with all 5,853 compounds reversed. That
  is the check that makes this class provable before a tag rather than on a
  release build: the path it exercises had never been checked for determinism at
  all, which is how the defect above survived 0.6.0 and 0.6.1.
- The index records a digest per table, and `quality:baseline` names the tables
  that differ. A single whole-index hash said only that two machines disagreed,
  which cost two release builds to localise.

## [0.6.1] - 2026-08-13

Rebuild the index with the `zephyr-index` skill after upgrading.

### Fixed

- **The Doxygen-backed API corpus was still stored in a machine-dependent order.**
  Doxygen emits compounds in `index.xml` order, which follows its own traversal of
  the input tree, and the semantic path stored them as they arrived. Every count
  was identical, so 84,934 rows sat in one order here and another on a CI runner.
  The content digest added in 0.6.0 caught it on its first release build — the
  defect predates that release and had been invisible. Rows are now stored in a
  key that is provably total across the corpus: name, header, line, kind, and
  Doxygen id, which is needed because thousands of API names are not unique.

## [0.6.0] - 2026-08-13

Rebuild the index with the `zephyr-index` skill after upgrading. The schema is
unchanged at 9 and old indexes still load, but they were built before the ordering
below was made deterministic, so their contents differ from what this version
produces.

### Fixed

- **The locale decided the order of the index.** Eleven sorts used
  `localeCompare`, which resolves against the environment's collator. Building
  with a Turkish collator moved 20,968 of 84,934 API symbols, because the corpus
  mixes `acpi_current_resource_free` with `ACPI_DMAR_FLAG_*` and Turkish `i`/`I`
  collation cascades. Every count stayed identical, so every gate passed while two
  machines produced measurably different catalogues. Ordering is now by code
  units, which depends on nothing outside the data and agrees with the `BINARY`
  collation `ORDER BY` already used — the two disagreed before.
- **Kconfig defaults stored absolute paths.** Upstream writes
  `default "$(ZEPHYR_BASE)/boards/qemu/x86/qemu_x86_tiny.ld"`; kconfiglib expanded
  it against the local tree and `get_kconfig` rendered the result, putting the
  builder's home directory into an answer. The expansion is undone, so the value
  reads as the Kconfig source wrote it.
- **The Doxygen report stored absolute paths.** All 198 API exclusions recorded
  the full path of the XML file they came from.
- Four `walk()` callers consumed filesystem order without sorting it, which
  decided the position of every documentation row and the order of the file list
  `get_sample` renders.

### Added

- Every index records a `content_hash`: a digest of every stored assertion, in
  order. It is pinned beside the corpus counts and verified by `quality:baseline`,
  which is the only check that can see ordering or within-row drift — counts
  cannot see either, and both defects above left counts untouched.
- `quality:reproducible` builds the index twice and requires the two digests to
  match, which catches an ingest that does not agree with itself.
- The descriptor records what produced the index — Node, SQLite, Python, Doxygen,
  and the resolved collator — so a digest mismatch between two machines is
  answered by reading two descriptors. It is recorded, never gated on, and
  deliberately excluded from the context fingerprint: a Node upgrade must not
  invalidate an index whose contents are identical.

## [0.5.0] - 2026-08-13

Indexes built by earlier versions are not readable by this one: the index schema is
now 9. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- **The sysbuild Kconfig namespace is indexed.** A Zephyr tree defines two Kconfig
  graphs — the application tree written `CONFIG_`, and sysbuild, rooted at
  `share/sysbuild/Kconfig` and written `SB_CONFIG_`. Only the first was indexed, so
  `SB_CONFIG_BOOTLOADER_MCUBOOT` and `MCUBOOT_MODE_SWAP_USING_MOVE` were misses and
  no sysbuild option could be checked at all. Both are now stored under their own
  scope, and the prefix selects the namespace.
- `search_kconfig` takes a `scope`, and reads `SB_CONFIG_` in a query as naming it.
- `check_config` reads `sysbuild.conf` in the sysbuild namespace, and the write
  hook does the same.

### Fixed

- **A symbol name was treated as an identity across two namespaces, and it is
  not.** `BOOTLOADER_MCUBOOT` exists in both trees with opposite meanings: under
  `SB_CONFIG_` it includes MCUboot in the build, under `CONFIG_` it marks the image
  as chain-loaded by one. `get_kconfig` returned the application symbol to a
  sysbuild question with no indication anything was wrong. Answers now come from
  the namespace the prefix names, and where a name means something else in the
  other namespace the answer says so — which is ten names in this tree, separated
  from the 2866 that are one symbol reached through both roots by whether the two
  share a declaring file.
- A symbol that exists only in the other namespace is now named directly instead of
  being answered with a list of unrelated near spellings.
- A plain `CONFIG_` line in `sysbuild.conf`, and an `SB_CONFIG_` line in a
  `prj.conf`, are reported. The build ignores both rather than rejecting them, so
  nothing surfaced until the option silently failed to take effect. The counterpart
  symbol is named only where it exists.

## [0.4.0] - 2026-08-13

Indexes built by earlier versions are not readable by this one: the index schema is
now 8. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- **West flash and debug runners are indexed.** `get_board` now names every runner
  a board registers, which one `west flash` and `west debug` each select, and the
  arguments the board presets — read from the board's own `board.cmake` and the
  common runner files it includes. The two defaults are not always the same runner:
  every Espressif board flashes with `esp32` and debugs with `openocd`, and a board
  can name a default it never registers, in which case that command has nothing to
  run and the answer says so. Checked against the `runners.yaml` Zephyr's build
  system resolves, across eleven boards and six vendors.
- `get_runner` reports what a runner implements and which options it accepts —
  `--dev-id`, `--erase`, `--reset-type` and its permitted values, `--extload`,
  `-O` — introspected from the runner classes in the indexed tree rather than from
  a fixed table. West rejects an option a runner does not declare before touching
  hardware.
- `search_boards` takes a `runner` filter, so the probe on the desk can narrow the
  board list.
- `check_environment` reports whether this machine can actually build the indexed
  Zephyr version. It lists every Python interpreter separately with the packages
  each one carries, because the interpreter that satisfies the indexer is often not
  the one CMake selects — a west installed in its own environment indexes perfectly
  and cannot build. It names the command that closes each gap and never installs
  anything.
- A new `zephyr-prerequisites` skill covers the interpreter contract, Python
  environments with uv or pip, toolchain installation through `west sdk`, and
  per-board host tools.
- The build-failure hook recognises a host environment failure and routes it to
  `check_environment` instead of to the symbol lookups. These arrive wrapped in
  `CMake Error` and were previously answered with advice about verifying symbols,
  sending the reader to edit a file that was not wrong.

### Changed

- `zephyr-build-flash` no longer carries a hand-written runner table. It listed six
  runners; this Zephyr ships 49 and boards reference 41. It now calls `get_board`
  and `get_runner`, and its depth moved to `references/`, read on demand.
- `index_status` counts the runner, board-runner, and west-command corpora, and
  reports west coverage alongside the others.

### Fixed

- **The release gate could not pass in CI.** `api_symbol` counts are Doxygen
  output compared for exact equality against a committed fixture, and
  `scripts/toolchain.json` declared `doxygen` with no version — the one tool whose
  output is baselined was the one the contract did not pin. CI's Doxygen 1.9.8
  found 84,919 symbols where the fixture recorded 84,934. The contract now pins an
  exact version, which a minimum could not do because a newer Doxygen diverges as
  surely as an older one, and CI installs that version instead of the
  distribution's.
- The runner catalogue no longer depends silently on which Python built the index.
  `runners/openocd.py` imports the west package, and `runners/__init__.py`
  downgrades an import failure to a warning, so an index built by an interpreter
  without west omitted the runner 328 boards select and said nothing. Completeness
  is now recorded in the coverage map and forms part of the context fingerprint,
  and the gate builds refuse an incomplete catalogue.

## [0.3.0] - 2026-08-13

Indexes built by earlier versions are not readable by this one: the index schema is
now 7. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- `get_kconfig`, `get_binding`, and `get_api` each accept a list — `names`,
  `compatibles`, `names` — and answer the whole list in one call, returning the
  facts a shell `grep` cannot give: a symbol's type, prompt, dependencies, defaults
  and choice alternatives; a compatible's bus and required properties; a function's
  signature and header. Checking a dozen symbols cost a dozen calls, so agents used
  a shell loop instead and settled for a weaker answer.
- `check_config` takes a whole `prj.conf`, defconfig, `.overlay`, or `.dts` and
  returns a verdict per line, making the same claims as the write hook.
- Upstream Twister test suites under `tests/` are indexed alongside `samples/`,
  with their scenario names. `search_samples` takes a `kind` filter, and a `board`
  with no query lists everything upstream names for that board and how many of each
  kind exist. Questions about what upstream verifies on a board were previously
  unanswerable by construction.
- `get_board` names the boards a target is easy to mistake for — products sharing a
  PCB reference and a SoC series — alongside the flash, RAM, and SoC figures that
  separate them, so a board chosen from a document can be checked against silicon.
- A `PreToolUse` hook names the lookup and the agent that fit a `.conf`, `.dts`,
  `.dtsi`, or `.overlay` before it is written. It never blocks the write.
- A clean Kconfig or devicetree file is acknowledged once per file per session,
  reporting what was checked and against which indexed Zephyr version. A check that
  reports nothing was previously indistinguishable from one that never ran.

### Fixed

- **Devicetree write validation could never run.** It required
  `coverage.bindings.complete`, which the ingest sets only when there is no project
  root — and a project-scoped index always has one. Every index a user builds
  reported the flag as false, so the devicetree half of the write hook was dead in
  the field for the whole of 0.2.0. The gate is removed; safety comes from the
  near-miss rule, which never reports absence. The test fixture ran against the one
  descriptor shape in which the gate opened and no user ever has, so it passed
  throughout; it now runs against a project-scoped index.
- **`get_sample` never rendered `platform_allow`.** It showed the allowlist only
  when `integration_platforms` was empty, which hid it for 249 of 610 samples. A
  reader concluded from that output that no upstream Wi-Fi sample named a board that
  seven of them name. Both lists are now always rendered and labelled by what they
  mean. `search_samples` ranked on allowlist evidence without ever saying so, and
  now reports which list matched.
- An absent value exported from Python was stored as the four-character string
  `"null"`, which every consumer read as a value — `get_binding` announced "is a bus
  controller for: `null`" on 2,929 bindings that control no bus. The index is
  smaller for the fix, and a corpus gate now fails on any stringified null.
- **A device reachable over more than one bus has a binding per bus, and
  `get_binding` returned whichever one the database held first.** Of the compatibles
  with several bindings, 78 of 80 require different properties, and the difference is
  usually `spi-max-frequency` — so a SPI part got the I2C answer and the node it
  produced would not build. `get_binding` now takes `on_bus`, names every variant
  when asked without one, and orders them stably; `check_config` reports each
  variant's required-property count rather than picking one.
- **The write validator reported nodes that upstream ships.** A devicetree node binds
  through the first of its compatibles that has a binding, so a fallback list such as
  `"microchip,mcp9808", "jedec,jc-42.4-temp"` is correct with only the generic name
  indexed. Judging each value alone flagged four of Zephyr's own sample overlays,
  because the specific name lands two edits from an unrelated Microchip ADC.
- **`CONFIG_X=y # comment` was reported as a type error.** For bool and tristate
  kconfiglib reads only the first character after `=`, matching the C implementation,
  so the assignment is legal and upstream uses it.
- **Promptless assignments were reported from an incomplete view.** Zephyr decides
  promptlessness across every definition of a symbol; this catalogue holds only those
  reachable in the context it was built for, so a symbol declared in a module Kconfig
  or another SoC's tree looked promptless when it was not. The claim is now made only
  where the catalogue can see the declaration. Measured over 800 upstream files, the
  validator's findings on correct code went from nine to none.
- `get_board` selected the board's flash and RAM and then dropped them, so they
  reached a caller only through build targets that happen to carry Twister metadata.
  SoC series and family were indexed but never queried by any tool.
- The write hook and `check-index` hardcode the index schema they accept and nothing
  tied them to the shared constant; after a bump that was not carried across, every
  hook would silently refuse every index. A gate now ties the three together.

## [0.2.0] - 2026-08-12

Indexes built by earlier versions are not readable by this one: the index schema
is now 6. Rebuild with the `zephyr-index` skill after upgrading.

### Added

- `get_source` returns a file from the indexed Zephyr tree at the exact commit the
  index was built from, with an optional line range. Where the tree is not present
  it returns a pinned `owner/repo@commit:path#Lstart-Lend` reference instead, so a
  file fetched elsewhere is still anchored to the right revision.
- `get_api` lists the members of an enum, with each member's value and
  documentation.
- `get_kconfig` lists the other options in a symbol's choice, so "mutually
  exclusive with what" no longer requires reading the subsystem's Kconfig.
- A failed `west build` now produces a signal: the plugin names the `build-triage`
  agent and the lookup that fits the failure — `get_binding` for a devicetree
  error, `get_kconfig` for a Kconfig one, `search_kconfig` for an undefined
  reference.
- `.dts`, `.dtsi`, and `.overlay` edits are checked for a `compatible` that
  misspells an indexed one. A compatible that is merely absent is not reported:
  applications legitimately declare their own through `dts/bindings`, `DTS_ROOT`,
  or an out-of-tree module.
- The `zephyr-development` skill states what to do after writing, not only before:
  which agent handles a failed build, a new driver or ISR, and a devicetree edit.
- SessionStart now speaks in an empty directory, naming the prerequisites and the
  `zephyr-index` skill, and the skill leads with the pinned fetch for that case.

### Fixed

- The API catalogue built without Doxygen XML no longer misfiles symbols. A record
  declared with an attribute macro was indexed under the attribute, leaving
  `enum __packed bt_conn_type` reachable only as `__packed` while `bt_conn_type`
  resolved to a struct field that merely used the type — wrong location, wrong
  signature, no documentation. Uses of a type were also indexed as definitions of
  it, and function-pointer struct members were indexed under their return type,
  putting hundreds of symbols named `void` and `int` into search results.
- Enum members are indexed without Doxygen XML, where previously they were dropped
  entirely.
- With Doxygen XML, enum members recorded no header of their own, which hid most of
  them from `get_api`.
- The edit validator no longer reports a path outside the project root as a
  blocking error. It cannot inspect such a file, which is a reason to stay quiet
  rather than a finding about the edit.

## [0.1.1] - 2026-08-12

### Added

- The bundled indexer can fetch the pinned Zephyr tree into persistent plugin data
  after explicit user consent, so first use no longer requires an existing checkout.
- Workspace indexing auto-detects conventional Doxygen XML outputs and reports when it
  uses them.

### Fixed

- The `zephyr-index` skill passes the plugin data directory explicitly, so the indexer
  and MCP server select the same project index.
- `get_board` accepts `board` as an alias for `name`.
- Build and project-setup guidance now checks for west, identifies the active topdir,
  and keeps the application manifest repository distinct from the workspace root.
- Context-only index flags are described as identity inputs rather than resolved build
  ingestion.

## [0.1.0] - 2026-08-12

First public release. Indexed against Zephyr v4.4.2, commit
`dccb09599635bdff17633fa7e9dab014b91dce90`.

### Changed

- **Breaking:** the runtime now requires Node.js 24 or newer, raised from 22.13. Bundles
  target `node24`.
- **Breaking:** index creation now requires Python 3.12 or newer in the selected
  interpreter, raised from 3.10. A west virtual environment on 3.10 or 3.11 is refused
  with an actionable message; point `PYTHON_EXECUTABLE` at a newer interpreter.
- Upgraded the build toolchain to TypeScript 7.0, esbuild 0.28, `@types/node` 24, and
  yaml 2.9, and the CI actions to `checkout@v7`, `setup-node@v7`, `setup-python@v7`, and
  `cache@v6`. CI now builds on Node 24 and Python 3.14.
- The MCP protocol revision is unchanged at 2025-11-25.
- Performance budgets gate what they measure. Bundle byte ceilings were a proxy for
  session startup cost, which is measured directly and sits at a few percent of its
  budget, so they are reported rather than gated. The index bound is raised to 256 MiB,
  where it still catches runaway corpus growth without policing normal growth.

- Replaced raw Kconfig ingestion with the target tree's Kconfiglib and definition-level
  expression, choice, default, range, select, imply, and assignability records.
- Replaced binding traversal with the target tree's edtlib, recursive child bindings,
  constraints, provenance, and type-aware skeletons.
- Added project/context fingerprints, immutable atomic indexes, MCP-root negotiation,
  exact tree/manifest comparison, and multi-project retention.
- Added RST include expansion and build-manual coverage, structured Doxygen XML API
  ingestion, canonical board enumeration, and Twister-compatible sample evidence.
- Hardened JSON-RPC lifecycle/envelopes and dependency-free tool schema validation.
- Catalogue misses are uncertainty rather than proof; the final-file hook reports only
  errors the catalogue can decide on its own, and stays silent when it cannot validate.
- Corrected and catalogue-scanned all skills/agents; added a three-platform compile
  matrix and inherited model/read-only permission policy.
- Fetch and index activation are ownership-checked, atomic, and interruption-safe.

### Added

- Corpus semantic, integrity, drift, artifact, performance, and copied-marketplace
  clean-room gates.
- A separate corpus baseline for the released Doxygen-backed index. `quality:baseline`
  selects it on the recorded `api_ingest_mode`, and `check:extended` now runs it, so the
  artifact that ships is pinned rather than only the development header-fallback build.
- Explicit release/rollback instructions and an isolated vendor-pack strategy.

### Fixed

- The gate can no longer pass locally and fail in CI on a missing tool. `validate:plugin`
  shells out to `claude`, which was present on the author's machine and on no runner, so
  the first push exited 127 after a green local run. Every external binary a gate needs
  is now declared in `scripts/toolchain.json`; `scripts/preflight.mjs` verifies it before
  any gate runs, and `test/toolchain.test.mjs` fails when a declared tool is not
  provisioned by the CI job that runs its tier — so the divergence breaks the
  contributor's build first. A `contract` job runs the quick gate in a bare
  `node:24-trixie-slim` container carrying only what the contract declares, which is the one
  place a dependency nobody declared can be caught.
- Doxygen XML generation is reproducible. The pinned template leaves
  `NUM_PROC_THREADS` at one thread per core, and successive runs over the same tree
  produced 84,934 and then 84,935 API symbols. Parsing is now pinned to one thread.
- The shipped `binding-skeleton` example did not compile. Its provider binding declared
  `#test-cells` without the `test-cells:` list naming them, which edtlib rejects.
- `fetch:modules` failed on any healthy workspace. `west manifest --freeze` requires
  every project in every group to be cloned, including the optional groups `west update`
  deliberately skips, and its only consumer was a log line. It is now advisory.
- The release compile matrix builds the generic class on `native_sim/native/64` instead
  of 32-bit `native_sim`, which needed host multilib headers for no added coverage, and
  CI installs `esptool`, which Zephyr's Espressif SoC CMake requires and
  `requirements-base.txt` does not carry.
- Doxygen API ingestion no longer fails the release build on anonymous unions and
  structs. Zephyr 4.4.2 contains 198 of them; they are ordinary C11 and carry no name to
  look up, so they are recorded as intentional exclusions rather than errors. This path
  had never produced output before, so the semantic API index was unbuildable.
- A failing Doxygen export now reports the exporter's structured error list. It writes
  that report to stdout and exits non-zero, but only stderr was read, so every content
  failure surfaced as `Doxygen XML export failed.` with nothing after it.
- `get_kconfig` bounds how many definition contexts it renders. `CONFIG_NUM_IRQS` has
  730 board and SoC defconfig alternatives and returned roughly a quarter of a megabyte;
  it now returns 5 KB, shows prompted contexts first, and states what it omitted.
- `get_kconfig` suggests near names that full-text search cannot reach. A one-character
  typo such as `CONFIG_BT_PERIPHERL` returned no suggestion because `PERIPHERL` is not a
  prefix of `PERIPHERAL`; candidates now also come from a longest-prefix lookup.
- The edit hook no longer reports a `CONFIG_` symbol or a devicetree compatible as
  absent. Coverage describes the indexed Zephyr tree rather than the project, so
  application-local bindings were rejected as invalid — including those in the plugin's
  own `binding-skeleton` example. Devicetree files are not inspected until the index can
  be built from the project's own binding roots.
- The edit hook is silent for files outside a recognisable Zephyr project, and when no
  usable index exists. It previously reported every `.conf` edit in any project as a
  blocking validation failure; SessionStart reports an unusable index once per session.
- `index_status` renders the per-corpus coverage map and its notes in the text answer,
  not only in structured content.
- The MCP server no longer replies with a JSON-RPC error to a response frame whose id it
  does not recognise, which occurred whenever a `roots/list` answer arrived after the
  request timed out.
- The SessionStart mismatch report no longer states that workspace content differs from
  the indexed fingerprint when only the version or commit differs.

### Security

- Added the security-reporting and workspace-index trust-boundary policy.
