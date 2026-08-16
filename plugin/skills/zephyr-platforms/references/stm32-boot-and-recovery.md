# STM32 boot mode, the ROM bootloader and recovery

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Every STM32 has a bootloader in ROM that can program flash over USB, UART, I2C,
SPI or CAN without a debug probe. Which of those a part implements, and what
makes it run instead of the application, differ per part. This page covers what
selects the boot area, how to reach the bootloader, and the two mechanisms — the
independent watchdog and the option bytes — that can leave a board unreachable.

For clocks, pinctrl and DMA, read `stm32.md`.

## What selects the boot area

At reset the part boots from one of three places: main flash, system memory (the
ROM bootloader), or SRAM. The selection comes from a boot pin, from option bits,
or from both, and which terms apply is a property of the part:

| Term | Where it lives | What it does |
| --- | --- | --- |
| `BOOT0` | a pin, sometimes shared with a GPIO | selects system memory when high, on parts that read it |
| `nBOOT_SEL` | option byte | on newer parts, decides whether the pin is read at all or the `nBOOT0` bit replaces it |
| `nBOOT0`, `nBOOT1` | option bytes | the boot selection when the pin is not used |
| `BOOT_LOCK` | option byte | forces boot from main flash and disables every other path |
| `RDP` | option byte | at level 2 the bootloader and the debug port are permanently unavailable |

**Do not generalise from one part to another.** AN2606 states the activation
pattern per device: find the `## STM32<part>xx devices` section, then
`### Bootloader configuration`. The pattern table it refers to gives the exact
combination of terms that runs the bootloader on that part.

The document ships with this plugin at
`reference/st/an2606-introduction-to-system-memory-boot-mode-on-stm32-mcus.md`.
It is 13,625 lines and organised as one section per device family, so it is a
lookup, never a read-through. The general sections worth knowing are
`### Bootloader activation`, `### Bootloader identification`,
`### Programming constraints` and `### IWDG usage`.

## Reaching the bootloader without a probe

A part in the ROM bootloader with its USB DFU interface active enumerates as
`0483:df11`, whatever the application's own VID:PID is. That is the fastest way
to tell which of the two is running:

```bash
lsusb                       # 0483:df11 is the ROM; anything else is the application
dfu-util -l
```

`AN3156` describes the DFU protocol the ROM implements, including what leaving
DFU does. It ships at `reference/st/an3156-usb-dfu-bootloader-stm32.md`. Check
its applicable-products table for the part before citing it: the series lists
changed between revisions.

**On some newer families, jumping from application code into system memory does
not work.** The result is a ROM that enumerates, answers status requests and
reads flash correctly, but fails every erase. The parts that behave this way are
the ones implementing an empty-check mechanism, where the boot area is selected
from a flag rather than from a branch target. AN2606 says so for the parts it
applies to. Use the entry the part's own documentation gives instead of a jump,
and read the `### Bootloader configuration` section for that part before writing
any handover code.

If the application must hand over, Zephyr's USB DFU support gives it a detach
interface:

```kconfig
CONFIG_USB_DEVICE_STACK=y
CONFIG_USB_DFU_CLASS=y
CONFIG_USB_DFU_ENABLE_UPLOAD=y
```

Look the symbols up before writing them — the USB stack a given Zephyr version
prefers changes, and the two stacks do not share symbol names:

```
search_kconfig "USB DFU"
get_kconfig CONFIG_USB_DFU_CLASS
```

## Option bytes

Option bytes are stored with a complement, and the loader rejects a mismatched
pair. **An option-byte write that is interrupted can leave a part that will not
boot and cannot be reprogrammed**, so treat them as a last resort rather than a
way around a configuration problem. AN3156 notes that a DFU write to the option
byte area erases every option first, which is exactly that window.

Nothing in a normal Zephyr application writes option bytes. If a board's boot
behaviour is wrong, the fix is almost always in devicetree, in the runner
arguments, or in the physical boot pin — not in the option bytes.

## The independent watchdog

The IWDG is clocked from the LSI and is deliberately independent of everything
the application configures. Three properties drive design decisions:

- **It cannot be stopped once started.** `iwdg_stm32_disable()` returns
  `-EPERM`. Whatever starts it owns the reset behaviour for the rest of the
  power cycle.
- **It survives a warm reset.** A boot path longer than the timeout becomes a
  reset loop that only a power cycle clears. Count every failure mode with a
  timeout on the path from reset to the first feed.
- **Whether hardware starts it at every power-on is an option bit** (`IWDG_SW`),
  not a Kconfig symbol.

`CONFIG_WDT_DISABLE_AT_BOOT` is only selectable when the driver declares
`HAS_WDT_DISABLE_AT_BOOT`. Where it does not, the assignment is dropped without
a message and the `.conf` line reads as if it took effect. Check the symbol
before writing it, and check the result in the artefact:

```
get_kconfig CONFIG_WDT_DISABLE_AT_BOOT
```

```bash
grep WDT build/zephyr/.config      # what the build resolved, not what was asked for
```

## Do not register a runner the board cannot use

`board.cmake` decides which runners `west flash` and `west debug` offer. A board
with no SWD header should not register `stm32cubeprogrammer --port=swd`,
`openocd` or `jlink`: a runner that cannot work is a trap that costs a bench
cycle to discover.

```
get_board <target>        # every runner the board registers, and which command picks each
get_runner <name>         # what that runner accepts
```

`stm32cubeprogrammer` is the runner that speaks the ROM bootloader's protocols,
so on a board whose only programming path is USB DFU or a serial bootloader, it
is usually the one to register.

## When the Zephyr lookup does not settle it

Zephyr answers what the RTOS provides. Boot behaviour, register layout and
erratum-level detail are properties of the silicon, and they are answered in
ST's own documents and in the CMSIS device header.

**The device header is a lookup, not a recollection.** `get_source` reads the
vendor HAL at the revision the manifest pins, so a register offset or a bit
position can be read rather than remembered:

```
get_source modules/hal/stm32/stm32cube/stm32c0xx/soc/stm32c071xx.h
```

The four ST documents that answer the rest, in the order they are usually
needed: the reference manual for the register behaviour, the datasheet for the
pin and package facts, the errata sheet for what the silicon does that the
reference manual says it should not, and AN2606 for the bootloader. Cite the
document and the section, and check the revision — a statement that covers a
part in one revision may not appear in an earlier one.
