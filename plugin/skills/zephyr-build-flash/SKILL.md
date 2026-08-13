---
name: zephyr-build-flash
description: Build, flash, and run Zephyr firmware with west. Use when compiling an application, choosing a board target, flashing or debugging hardware, picking or configuring a runner, working with sysbuild or MCUboot, setting up or updating a west workspace, or when a build behaves inconsistently. Covers west build options, pristine builds, runner selection from the indexed tree, multi-image builds, and reading build output.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.6.0"
---

# Building and flashing

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Before the first build

If this machine has not built Zephyr before, or a build fails with a missing
Python module or a missing toolchain, use the `zephyr-prerequisites` skill and
call `check_environment`. A host environment failure looks like a build error but
nothing in the application is wrong, and editing it will not help.

## The workspace

Zephyr applications live in a **west workspace** — Zephyr plus its modules,
managed together:

```bash
west init -m https://github.com/zephyrproject-rtos/zephyr --mr v4.4.2 my-ws
cd my-ws && west update
west zephyr-export                 # makes find_package(Zephyr) work
west packages pip --install        # Python dependencies, into west's interpreter
```

`west update` after any manifest change; module versions are pinned by
`zephyr/west.yml` and skipping it produces confusing build errors.

Run build commands from the intended workspace. `west topdir` walks upward from the
current directory to the first `.west/config`; a second, richer workspace elsewhere
is irrelevant. Confirm the selected manifest and required modules before diagnosing
CMake:

```bash
west topdir
west list zephyr -f '{posixpath}'
west list -f '{name} {posixpath}'
```

If `.west/config` exists but a manifest project required by the target is missing,
run `west update` in that workspace. Do not borrow a `modules/` directory from a
different topdir; its revisions may not match the selected manifest.

`references/west-commands.md` covers the wider command surface — `sign`, `twister`,
`blobs`, `shields`, `sdk` — and which of them a given Zephyr version ships.

## Building

```bash
west build -b <target> <app-dir>

# Concrete
west build -b nucleo_h743zi .
west build -b esp32s3_devkitc/esp32s3/procpu .
```

The target must be the **qualified** identifier. `search_boards` returns it;
guessing from the board's marketing name fails. Boards with revisions take
`-b <board>@<revision>`.

Options worth knowing:

| Flag | Effect |
| --- | --- |
| `-p always` | Pristine. Use after changing Kconfig, devicetree, or CMake |
| `-p auto` | Pristine only when the build system thinks it is needed |
| `-d build-h7` | Alternate build directory, so several targets coexist |
| `-t menuconfig` | Interactive Kconfig browser |
| `-t rom_report` / `-t ram_report` | Where flash and RAM actually went |
| `--` | Everything after is passed to CMake |

```bash
# Extra config fragments and overlays
west build -b nucleo_h743zi . -- \
  -DEXTRA_CONF_FILE=debug.conf \
  -DEXTRA_DTC_OVERLAY_FILE=sensors.overlay
```

**When a change seems not to take effect, build pristine before investigating
anything else.** Incremental builds do not always re-run Kconfig and devicetree
generation, and this accounts for a large share of apparently impossible
behaviour.

## Flashing and debugging

```bash
west flash                       # the board's default flash runner
west flash -r <runner>           # pick another one it registers
west debug                       # the board's default debug runner
west attach                      # attach without resetting
west debugserver                 # GDB server only, connect your own client
```

**Ask the index which runners a board has rather than assuming.** Runners are
declared per board in `board.cmake`, they differ by vendor and by board within a
vendor, and the set changes between Zephyr versions:

```
get_board board=<name>       # every registered runner, and which command selects it
get_runner name=<runner>     # which commands it implements and which options it takes
```

Three things that output tells you and a general rule cannot:

- **`west flash` and `west debug` can select different runners on the same
  board.** Every Espressif board flashes with `esp32` and debugs with `openocd`.
- **Options are per runner.** `--dev-id`, `--erase`, `--reset-type`, `--extload`
  and `-O` exist only where the runner declares them, and west rejects an
  undeclared one before touching hardware. `--reset-type` also has a fixed set of
  values per runner.
- **A board can name a default runner it never registers,** in which case that
  command has nothing to run. `get_board` says so rather than implying it works.

In a configured build directory, `west flash --context` is the authoritative list
for that exact build. Host programs each runner wraps are covered in the
`zephyr-prerequisites` skill; vendor specifics are in `stm32-platform` and
`esp32-platform`.

## Running without hardware

`native_sim` builds the application as a host binary. It is the fastest way to
test logic, and it runs under valgrind and gdb like any program:

```bash
west build -b native_sim . && ./build/zephyr/zephyr.exe
```

QEMU targets (`qemu_cortex_m3`, `qemu_riscv32`) run with `west build -t run`.
They register no flash runner, so `west flash` is not the way to start them.

## Multi-image builds with sysbuild

```bash
west build --sysbuild -b <target> .
```

Sysbuild builds several images as one system — application plus MCUboot, or the
two cores of a dual-core SoC. Its Kconfig lives in `sysbuild.conf` under the `SB_`
prefix, and with a bootloader the artefact to flash is the *signed* image.
`references/sysbuild-and-signing.md` has the layout, the flashing consequences,
and how `west sign` relates.

## Reading the output

The build ends with a memory report:

```
Memory region  Used Size  Region Size  %age Used
       FLASH:     84512 B       2 MB      4.03%
         RAM:     22376 B     512 KB      4.27%
```

`region FLASH overflowed by N bytes` means the image does not fit: use
`-t rom_report` to see the breakdown, then disable what you do not need
(`CONFIG_LOG`, `CONFIG_SHELL`, `CONFIG_ASSERT`, unused subsystems) or raise the
optimisation level with `CONFIG_SIZE_OPTIMIZATIONS=y`.

Artefacts land in `build/zephyr/`: `zephyr.elf` for debugging, `zephyr.bin` and
`zephyr.hex` for flashing, `.config` for the resolved Kconfig, `zephyr.dts` for
the resolved devicetree.

## Validation checklist

- [ ] `west topdir` prints the workspace you intend to build in.
- [ ] The target came from `search_boards`, qualified, not from a product name.
- [ ] The build was pristine (`-p always`) after any Kconfig, devicetree, or CMake change.
- [ ] The memory report shows the image fits, with headroom you are willing to defend.
- [ ] The runner you passed to `-r` appears in `get_board` output for this board.
- [ ] After flashing, the console showed the firmware running — not just a successful flash.

## Workflow

1. `search_boards` / `get_board` for the qualified target and its runners.
2. `west build -b <target> -p always .`
3. Read the memory report; confirm it fits.
4. `west flash`, then watch the console before declaring success.
