# Release and rollback

The public artifact is ready only when the semantic API and skill compile gates pass;
the ordinary development database's header-fallback API is not a release substitute.

## Release predicate

1. Worktree and generated artifacts are committed and clean.
2. Run `npm ci` with Node 24 or newer.
3. Run `npm run check`. This verifies the pinned source, schema-5 index, exact baseline,
   real-process suites, corpus semantics, performance budgets, both manifests, and
   committed bundle parity.
4. Install Doxygen, CMake, Ninja, Python requirements from the pinned tree, and Zephyr
   SDK 1.0.1 GNU toolchains for native, ARM and Xtensa. The extended gate runs
   `fetch:modules` to synchronize the manifest-pinned STM32 and Espressif HAL sources.
   Run the SDK's `setup.sh -t all -h -c` once and select the `zephyr` toolchain variant.
5. Run `npm run check:release`. It rebuilds the API catalogue from Doxygen XML, reruns
   the complete repository gate, compiles the generic/STM32/ESP32 example matrix, and
   performs the copied-marketplace clean-room path from no index to a live MCP query.
6. Inspect `npm run quality:counts` and the semantic report. Explain source-derived
   drift in the commit that updates `scripts/quality/fixtures/baseline-counts.json`.
7. Confirm `git diff --exit-code` after the gates. A changed bundle means the committed
   artifact was stale.
8. Review `CHANGELOG.md`, supported Zephyr/Node/Python requirements, license notices,
   and the plugin/marketplace version together.
9. Create the tag only from the exact commit that passed the copied-artifact test.

No release-required test may skip. Hardware tests and vendor-native packs are not part
of the first Zephyr-only predicate and must not be implied by release language.

## Clean-room behavior

`scripts/quality/clean-room.mjs` copies `.claude-plugin/` and `plugin/` to a temporary
marketplace layout, validates that copy, starts its bundled server with empty plugin
data, builds an index through the copied ingest bundle, and queries the same still-live
server. This detects source-tree assumptions, undocumented environment dependencies,
global-index fallback, and failure-cache regressions.

## Rollback

1. Identify the last tag whose complete release gate passed.
2. Restore marketplace/plugin metadata to that version and publish from its immutable
   commit; do not rebuild old bundles with a newer toolchain.
3. If the failure is schema-specific, tell users to invoke `zephyr-index`. The runtime
   fails closed on incompatible schema and immutable prior contexts remain on disk.
4. If an index build failed, do not alter `active.json`; the atomic builder already
   leaves the former artifact active.
5. If an upstream Zephyr tag or release asset is suspect, retain the current
   `zephyr.lock.json` and halt repinning. The fetcher refuses a moved tag whose commit
   differs from the lock.
6. Exercise rollback before announcing it: install the prior marketplace commit into
   empty plugin data, build its supported index, and query `index_status`.

An index contains rebuildable reference data. It is safe to remove one project
fingerprint directory after stopping Claude, but never hand-edit `active.json` or a
SQLite file. Prefer rebuilding so descriptor and FTS invariants are re-established.
