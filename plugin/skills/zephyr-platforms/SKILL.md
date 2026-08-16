---
name: zephyr-platforms
description: STM32 and ESP32 specifics. Use for a Nucleo, Discovery, DevKit or any STM32/ESP32 target, an unqualified-target error, a clock or PLL problem, pinctrl, DMA, PSRAM, partitions, or a rejected runner.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.10.0"
---

# STM32 and ESP32

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Read the vendor page for the target you are working on:

- **STM32** — `references/stm32.md`. The clock tree, domain clocks and
  crystal-less boards, the pinctrl naming scheme, series differences that change
  driver availability, DMA and cache coherency, ST-LINK and runner selection,
  low power.
- **STM32 boot and recovery** — `references/stm32-boot-and-recovery.md`. What
  selects the boot area, the system-memory ROM bootloader and USB DFU, option
  bytes, the independent watchdog, and reading the CMSIS device header when the
  Zephyr lookup does not settle it. ST's AN2606 and AN3156 ship with this plugin
  under `reference/st/`, so a citation is checkable from an installed copy.
- **ESP32** — `references/esp32.md`. Qualified build targets, the dual-core
  appcpu/procpu image model, sysbuild and the bootloader, partition tables,
  pinctrl through the IO matrix, Wi-Fi, Bluetooth, PSRAM.

## What applies to both

**Start with `get_board`.** It gives the qualified build target, the SoCs, the
memory the application actually gets, the runners the board registers and which
one each command selects, and the samples and tests upstream ships for that
target. Guessing any of those costs a build.

**Build targets are qualified.** `esp32s3_devkitc` is rejected;
`esp32s3_devkitc/esp32s3/procpu` builds. The qualifier differs per SoC revision
and core, and `search_boards` returns the exact string `west build -b` expects.

**A driver that exists for one part in a family may not exist for the next.**
Vendors reuse peripheral names across incompatible register layouts. `get_binding`
reports which SoC devicetree name a compatible, which is the evidence that a
driver was written for your silicon; where it also reports an identity check,
confirm the part you have returns a value the driver accepts.

**The runner that flashes is not always the runner that debugs.** Every Espressif
board flashes with `esp32` and debugs with `openocd`. `get_board` names both, and
`get_runner` says what each accepts.

**Check the peripheral against the board, not against the datasheet.** A package
exposes a subset of what the die implements, and the board `.dts` is what decides
which nodes exist. Read it with `get_source`.

**Enabling a node adopts every property it inherits.** A peripheral takes clock
sources, DMA channels, power domains and supplies from the SoC `.dtsi`, and an
overlay that sets only `status` and `pinctrl` leaves the rest at defaults chosen
for a reference board. A selector that resolves to a disabled node is legal
devicetree, produces no build error, and appears in neither `.config` nor the
linked image. After a build succeeds, pass `build/zephyr/zephyr.dts` to
`check_devicetree`.
