---
name: zephyr-build-flash
description: Build, flash, and run Zephyr firmware with west. Use when compiling an application, choosing a board target, flashing or debugging hardware, working with sysbuild or MCUboot, setting up or updating a west workspace, or when a build behaves inconsistently. Covers west build options, pristine builds, runners for STM32 and ESP32, multi-image builds, and reading build output.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.2.0"
---

# Building and flashing

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## The workspace

Zephyr applications live in a **west workspace** — Zephyr plus its modules,
managed together:

First make sure `west` comes from the Python environment intended for this
workspace. If it is absent, create or activate a virtual environment and install it:

```bash
python3 -m venv <workspace>/.venv
source <workspace>/.venv/bin/activate
python -m pip install west
```

```bash
west init -m https://github.com/zephyrproject-rtos/zephyr --mr v4.4.2 my-ws
cd my-ws && west update
west zephyr-export                 # makes find_package(Zephyr) work
west packages pip --install        # Python dependencies
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

Verify the toolchain before debugging anything else:

```bash
echo "$ZEPHYR_SDK_INSTALL_DIR"
west --version && cmake --version
```

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

## Flashing

```bash
west flash                       # default runner for the board
west flash -r <runner>           # pick one
west flash --dev-id <serial>     # when several probes are attached
```

Runners are declared per board in `board.cmake`. Common ones:

| Runner | Typical use |
| --- | --- |
| `openocd` | Broadly supported, many probes |
| `pyocd` | CMSIS-DAP, many Cortex-M targets |
| `jlink` | SEGGER probes |
| `stm32cubeprogrammer` | ST-LINK on STM32, needs STM32CubeProgrammer installed |
| `dfu-util` | USB DFU bootloader |
| `esp32` | Espressif, wraps esptool over a serial port |

See `zephyr-build-flash` companions `stm32-platform` and `esp32-platform` for
vendor specifics, and run `west flash --context` to list what a board supports.

## Debugging on hardware

```bash
west debug            # start GDB attached to the target
west attach           # attach without resetting
west debugserver      # GDB server only, connect your own client
```

## Running without hardware

`native_sim` builds the application as a host binary. It is the fastest way to
test logic, and it runs under valgrind and gdb like any program:

```bash
west build -b native_sim . && ./build/zephyr/zephyr.exe
```

QEMU targets (`qemu_cortex_m3`, `qemu_riscv32`) run with `west build -t run`.

## Multi-image builds with sysbuild

Sysbuild builds several images as one system — application plus MCUboot, or the
two cores of a dual-core SoC:

```bash
west build --sysbuild -b <target> .
```

```kconfig
# sysbuild.conf
SB_CONFIG_BOOTLOADER_MCUBOOT=y
```

With MCUboot the artefact to flash is the signed image
(`build/<app>/zephyr/zephyr.signed.bin`); flashing the unsigned one produces a
board that boots the bootloader and stops. Sysbuild Kconfig lives in
`sysbuild.conf` and uses the `SB_` prefix — a plain `CONFIG_` there does nothing.

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

## Workflow

1. `search_boards` / `get_board` for the qualified target and its runners.
2. `west build -b <target> -p always .`
3. Read the memory report; confirm it fits.
4. `west flash`, then watch the console before declaring success.
