# STM32 on Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Zephyr supports STM32 through the `hal_stm32` module, which vendors ST's HAL and
LL drivers. Zephyr's own drivers sit on top; you rarely call the ST HAL directly,
and doing so usually means a Zephyr driver was missed.

Start with `get_board` for the target. It gives the qualified build target, the
SoC, the Twister flash and RAM figures, and the peripherals the board exposes.
Then read the board `.dts` for the node labels and pinctrl groups that exist on
that package.

## Clocks come first

Almost every STM32 bring-up problem is a clock problem. A peripheral with no
clock enumerates but does nothing, and the driver reports no error.

The clock tree is configured in devicetree, not in C:

```dts
&clk_hse {
        clock-frequency = <DT_FREQ_M(8)>;
        hse-bypass;                 /* ST-LINK MCO feeds HSE on most Nucleos */
        status = "okay";
};

&pll {
        div-m = <1>;
        mul-n = <60>;
        div-p = <2>;
        div-q = <4>;
        clocks = <&clk_hse>;
        status = "okay";
};

&rcc {
        clocks = <&pll>;
        clock-frequency = <DT_FREQ_M(480)>;   /* must match what the PLL produces */
        d1cpre = <1>;
        hpre = <2>;                            /* AHB  = SYSCLK / 2 */
        d2ppre1 = <2>;                         /* APB1 = AHB / 2 */
        d2ppre2 = <2>;
};
```

Two rules:

- `clock-frequency` on `&rcc` must equal the frequency the PLL settings produce.
  Zephyr uses this number for every derived baud rate and timer period. If it is
  wrong, UART output is corrupted by a fixed ratio.
- Every peripheral node needs its own `clocks = <&rcc STM32_CLOCK_BUS_APBx N>;`
  entry. The board `.dtsi` normally supplies it. If you add a peripheral by hand
  and it does nothing, check this first.

Prescaler property names differ by series (`d2ppre1` on H7, `ppre1` on F4/G4).
Call `get_binding` on the SoC's `rcc` compatible rather than copying from another
series.

## A peripheral has two clocks, and only one of them is the bus clock

Most STM32 peripherals take a second `clocks` entry that selects the source of
their kernel clock — the domain clock. The first entry gates the bus; the second
decides what the peripheral is actually clocked from. They are different clocks
and they fail differently.

```dts
usb: usb@40005c00 {
        clocks = <&rcc STM32_CLOCK(APB1, 13)>,      /* bus gate */
                 <&rcc STM32_SRC_HSE USB_SEL(1)>;   /* kernel clock source */
};
```

**A selector naming a clock node that is disabled produces no build error.** The
chain is: `clock_control_configure()` returns `-ENOTSUP`, the driver turns that
into an init failure, and the device never enables. Nothing appears in
`build/zephyr/.config`, nothing appears in the linked image, and the build
succeeds. On a peripheral whose init error the application does not check, the
first symptom is on hardware.

**A property you did not write is still your decision.** Enabling a node adopts
every property it inherits from the SoC `.dtsi`. An overlay that sets `status`
and `pinctrl` on a peripheral leaves `clocks` at the SoC default, and several
SoC files default a domain clock to `STM32_SRC_HSE` — which is wrong on a board
that fits no crystal. Read the resolved value in `build/zephyr/zephyr.dts`, not
in the overlay you wrote.

`check_devicetree` resolves this mechanically. Pass it the merged tree after a
build succeeds and before flashing: it reports every enabled node whose domain
clock selects a source whose clock node is disabled, and every enabled node
whose `clocks`, `dmas`, `resets`, `power-domains`, `*-gpios` or `*-supply`
names a node the build did not enable.

**Never restate the selector table.** `STM32_SRC_*` values are chained
increments — `stm32c0_clock.h` defines `STM32_SRC_HSI48` as `STM32_SRC_HSI + 1`
on a base in `stm32_common_clocks.h` — so inserting one selector upstream
renumbers every one after it. Read the header for the family in hand:

```
get_source include/zephyr/dt-bindings/clock/stm32<series>_clock.h
```

The same headers declare `STM32_PERIPH_BUS_MIN` and `STM32_PERIPH_BUS_MAX`,
which is how a bus entry is told apart from a source selector.

## Boards with no crystal

A board that fits no oscillator has `clk_hse` and `clk_lse` disabled and runs
everything from internal RC. That is a supported configuration, and it makes two
things load-bearing:

- **Every domain clock must select an internal source.** The SoC default is
  frequently HSE, so each enabled peripheral needs its second `clocks` entry
  overridden. This is the single most common way a crystal-less board fails.
- **USB full speed needs HSI48 trimmed by the CRS.** The specification requires
  ±0.25 %, which a free-running HSI48 does not meet. The trim is requested in
  devicetree:

```dts
&clk_hsi48 {
        crs-usb-sof;
        status = "okay";
};
```

Some SoC files ship `clk_hsi48` as `status = "disabled"`, so enabling USB
without enabling the clock node leaves the selector pointing at a node that is
not built.

Internal RC also bounds serial baud rates. The USART divisor is exact at some
rates and rounds at others, and the rounding error is a property of the SYSCLK
the board actually runs at. Confirm `CONFIG_SYS_CLOCK_HW_CYCLES_PER_SEC` in the
built `.config` before treating a rate as usable.

## Pinctrl

STM32 pin assignments are pre-generated by `hal_stm32` and referenced by name:

```dts
&usart3 {
        pinctrl-0 = <&usart3_tx_pd8 &usart3_rx_pd9>;
        pinctrl-names = "default";
        current-speed = <115200>;
        status = "okay";
};
```

The naming scheme is `<peripheral>_<signal>_<port><pin>`. Valid names live in
`modules/hal/stm32/dts/st/<series>/<part>-pinctrl.dtsi` in the workspace. Read it
with `get_source` when a name is rejected. A name that does not exist produces a
devicetree error naming the overlay rather than the missing macro.

Add analogue or sleep states when needed:

```dts
        pinctrl-0 = <&usart3_tx_pd8 &usart3_rx_pd9>;
        pinctrl-1 = <&analog_pd8 &analog_pd9>;   /* lowest leakage in STOP */
        pinctrl-names = "default", "sleep";
```

The `sleep` state is applied automatically when `CONFIG_PM_DEVICE=y` and the
peripheral suspends. Without it, pins keep driving in low-power modes and the
measured current stays high.

## Series differences

STM32 is not one part. Driver availability and property names vary:

- **F0/F1/F3/L0/L1** — small, older; some subsystems unsupported
- **F4/F7** — very well supported, the common reference
- **G0/G4** — newer mainstream; different RCC property names
- **L4/L5/U5** — low power focus; TrustZone on L5/U5
- **H5/H7** — high performance, multi-core on some H7 parts, cache coherency
  considerations for DMA
- **WB/WL** — integrated radio; WB runs the BLE stack on a second core with ST
  firmware that must be flashed separately

`search_boards` with `vendor: "st"` and a `feature` filter is the fast way to find
which boards support what.

## DMA and cache

On H7 and other parts with a D-cache, DMA buffers must be cache-line aligned and
placed in memory the peripheral can reach. A buffer in DTCM is invisible to some
DMA controllers, and an unaligned buffer produces corruption that looks like a
driver bug:

```c
/* 32-byte aligned, in a DMA-reachable region */
static uint8_t __aligned(32) rx_buf[256] __attribute__((section(".dma_buffer")));
```

Check the board `.dts` for `zephyr,memory-region` nodes describing usable regions,
and use `CONFIG_DCACHE` deliberately.

## Flashing and debugging

```bash
west flash                              # board default
west flash -r openocd
west flash -r stm32cubeprogrammer       # needs STM32CubeProgrammer on PATH
west flash -r pyocd
west flash --dev-id <serial>            # several ST-LINKs attached
```

`stm32cubeprogrammer` is required for option-byte work and for parts OpenOCD does
not yet know. If flashing fails with the target held in reset, connect under
reset:

```bash
west flash -r openocd --cmd-pre-init "reset_config srst_only srst_nogate connect_assert_srst"
```

A board that will not connect after enabling a low-power mode is usually asleep
with the debug interface clock gated. Boot into the system bootloader instead of
the application — see `stm32-boot-and-recovery.md` for what selects that — or
use connect-under-reset, and set `CONFIG_DEBUG=y` during development, which
keeps the debug clocks running in STOP.

### When the debug port depends on strap state

On parts where boot mode is selected by strap pins, such as BOOT0/BOOT1, a boot
selection jumper, or an OTP or option-byte boot source, the mode that runs the
application and the mode that exposes the debug port can be different modes.

A probe that cannot reach the core is therefore a configuration state, not a
fault. The board is doing what the straps select. Reflashing, swapping cables, or
reinstalling drivers will not change it.

The pattern, which applies to any vendor:

- One strap position runs the application from its normal boot source. In this
  position the debug port may be unavailable, available only briefly after reset,
  or unavailable once the application enters a low-power state.
- Another position enters a vendor bootloader or development mode. The probe
  connects and programming works, but the application does not run, so this is
  not the position to leave it in.

The resulting cycle is: set the straps for programming, flash, set the straps for
running, reset. That is two manual steps per iteration. See
`zephyr-hardware-iteration` for reducing that cost, including checking whether a
runner or boot mode exists that avoids it.

Before concluding a board has failed, determine which state it is in:

- Check what the board's documentation says each strap position selects, and
  confirm the physical position rather than assuming the default.
- Try connect-under-reset, which catches the parts whose debug port is available
  only in the window immediately after reset.
- Try the vendor's own programming tool once. If the vendor tool connects and the
  generic probe does not, the problem is protocol or sequence, not hardware.

Record the answer where the next person will find it. Strap state is not visible
from the firmware or the build output.

## Low power

```kconfig
CONFIG_PM=y
CONFIG_PM_DEVICE=y
CONFIG_PM_DEVICE_RUNTIME=y
```

```dts
&cpu0 {
        cpu-power-states = <&stop0 &stop1 &stop2>;
};
```

Expect to also: define `sleep` pinctrl states for every active peripheral, disable
unused GPIO banks' clocks, and confirm which RAM regions are retained in each
STOP mode for the series in use. Measured current that will not drop is almost
always a pin still being driven or a peripheral clock left enabled.

## Checklist

1. `get_board` for the qualified target and supported peripherals.
2. Confirm the clock tree: `&rcc` `clock-frequency` matches the PLL maths.
3. Use pinctrl names that exist in the `hal_stm32` pinctrl `.dtsi`.
4. `get_binding` before writing any STM32 peripheral node. Property names differ
   between series.
5. For every peripheral you enabled, confirm its **domain clock** in
   `build/zephyr/zephyr.dts` — the second `clocks` entry — rather than assuming
   the SoC default suits this board. `check_devicetree` on the merged tree does
   this for the whole tree at once.
6. Build pristine, flash, and check the console before assuming the clock is right.

For boot mode, the system-memory bootloader, USB DFU, option bytes and the
independent watchdog, read `stm32-boot-and-recovery.md`.
