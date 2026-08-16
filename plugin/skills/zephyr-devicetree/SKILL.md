---
name: zephyr-devicetree
description: "Devicetree: .overlay, .dts, .dtsi and binding .yaml. Use when adding a sensor, display or peripheral, wiring pinctrl, aliases, chosen, interrupts or DMA, or when a node, property or binding error appears."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.10.0"
---

# Devicetree in Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Devicetree describes the hardware; Kconfig selects the software. A driver only
runs if a node with its `compatible` exists **and** is `status = "okay"`. Enabling
a `CONFIG_` for a driver without a matching enabled node does nothing at all.

## Always read the binding first

A binding file is almost never self-contained. `st,stm32-spi.yaml` declares no
properties at all. It includes `st,stm32-spi-common.yaml`, which reaches
`spi-controller.yaml`, which reaches `base.yaml`, and the node ends up accepting
about forty properties. Reading the binding file tells you nothing useful.

Call `get_binding` with the compatible. It returns the **flattened** property set
with types, requiredness, allowed values, and which file each property came from.
Use `search_bindings` when you know the hardware but not the compatible.

## A compatible that exists may not fit your silicon

A binding tells you a driver exists and what properties it accepts. It does not
tell you the driver was written for your part. Vendors reuse peripheral names
across incompatible implementations more often than they reuse implementations.
The same name, such as "digital temperature sensor", "quad SPI", or "timer", can
refer to a different register block on the next part in the same family.

A node using the wrong compatible passes devicetree validation, compiles, links,
and does nothing. No stage of the build compares the driver against your silicon.

Before using a driver on a part you have not used it on, especially a newer
member of a family you have used, run three checks:

1. **Where does upstream use it?** `get_binding` and `search_bindings` report
   which SoC and board devicetree name the compatible, and the node name each
   board gives it — usually the part number actually fitted. If it is used only
   in SoC directories that do not include your part, that is not proof of
   incompatibility, but it is the strongest available signal.
2. **What identity does the driver demand?** Where the driver gates
   initialisation on an identity register, `get_binding` states the register and
   the values it accepts. Binding a driver whose check the part fails gives a
   device that initialises and returns numbers that are not readings, with no
   error anywhere. If you have already read a value off the part,
   `search_bindings` takes it as `identity_value`.
3. **Do the registers exist on your part?** Read the driver with `get_source`,
   list the register and macro names it uses, and look for them in your SoC
   vendor header. `get_source` reads the HAL module trees as well. Missing
   register definitions are strong evidence.

Check the register contract, not the family name. Where a driver is used
indicates what it was written for. That a driver exists indicates nothing.

## Overlay syntax

An overlay patches the board's tree. Reference existing nodes by label with `&`:

```dts
/* Enable a peripheral the board leaves disabled */
&spi1 {
        status = "okay";
        pinctrl-0 = <&spi1_sck_pa5 &spi1_miso_pa6 &spi1_mosi_pa7>;
        pinctrl-names = "default";
        cs-gpios = <&gpioa 4 GPIO_ACTIVE_LOW>;

        /* A device on that bus */
        bme280@0 {
                compatible = "bosch,bme280";
                reg = <0>;
                spi-max-frequency = <1000000>;
                status = "okay";
        };
};

/* Add a node that has no parent bus */
/ {
        aliases {
                statusled = &green_led;
        };

        chosen {
                zephyr,console = &usart3;
        };

        leds {
                compatible = "gpio-leds";
                green_led: led_0 {
                        gpios = <&gpiob 0 GPIO_ACTIVE_HIGH>;
                        label = "Green LED";
                };
        };
};
```

Rules that trip people up:

- `reg` on a bus child is its address on that bus (SPI chip-select index, I²C
  address), and it must match the `@0` in the node name.
- A node is only compiled in when `status = "okay"`. Board `.dtsi` files disable
  most peripherals by default.
- `aliases` and `chosen` go at the root (`/`), never inside a peripheral node.
- Deleting is explicit: `/delete-node/ &node;` and `/delete-property/ prop;`.
- Include C macros where you use them: `#include <zephyr/dt-bindings/gpio/gpio.h>`
  for `GPIO_ACTIVE_LOW`, and the board's pinctrl header for pin macros.

## Where overlays live

| Path | Applies to |
| --- | --- |
| `app.overlay` | Every build target |
| `boards/<target>.overlay` | That build target only, picked up by filename |
| `--  -DEXTRA_DTC_OVERLAY_FILE=x.overlay` | Explicitly, composes with the above |

For a qualified target such as `esp32s3_devkitc/esp32s3/procpu`, the overlay file
is `boards/esp32s3_devkitc_esp32s3_procpu.overlay`: slashes become underscores.

**An overlay whose filename does not match is skipped without a warning.** Zephyr
constructs these names and tests whether the file exists. A file that matches
nothing produces no message. The build then fails later with an undefined
devicetree symbol such as `__device_dts_ord_..._ORD undeclared`, which looks like
an error in the C rather than an overlay that was not read.

This matters most when adding a build variant: the file that worked for the
default target does not apply to the qualified target, because the name differs.

Before writing an overlay for a peripheral, check whether upstream already
published one. `get_board` lists every sample and test that ships a
configuration file for this board's targets, and those files carry the DMA
channels, request numbers and cache attributes the vendor verified. Read one
with `get_sample`.

Two checks prevent it:

- Ask `get_board` for the exact filenames each qualified target uses. It lists
  them per target.
- Look for the positive signal in the configure output rather than assuming the
  file was read because there was no error:

  ```
  -- Found devicetree overlay: /path/to/app/boards/<name>.overlay
  ```

  Check again after changing the target, not only after changing the file.

## Reaching devicetree from C

Resolve at compile time. There is no runtime lookup cost and a wrong node fails
the build rather than returning `NULL` at 3am:

```c
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>

/* By alias: portable, and keeps board specifics out of the C */
static const struct device *const sensor = DEVICE_DT_GET(DT_ALIAS(env_sensor));

/* By compatible, when exactly one such node exists */
static const struct device *const bme = DEVICE_DT_GET_ANY(bosch_bme280);

/* By label */
static const struct device *const spi = DEVICE_DT_GET(DT_NODELABEL(spi1));

/* GPIO specifiers carry pin and flags together */
static const struct gpio_dt_spec led = GPIO_DT_SPEC_GET(DT_ALIAS(statusled), gpios);

int main(void)
{
        /* Always check: the node may exist but its driver may have failed init */
        if (!device_is_ready(sensor)) {
                return -ENODEV;
        }
        ...
}
```

Guard optional hardware with `DT_HAS_ALIAS` / `DT_NODE_EXISTS` so the application
still builds on boards that lack it:

```c
#if DT_NODE_EXISTS(DT_ALIAS(env_sensor))
        /* sensor-specific code */
#endif
```

Read properties with `DT_PROP(node, prop)`, and note that property names become
lowercase with hyphens turned into underscores: `spi-max-frequency` is
`DT_PROP(node, spi_max_frequency)`.

## Inspecting the compiled tree

The build output is authoritative, and reading it resolves most devicetree
confusion in one step:

```bash
# The fully merged, human-readable tree for this build
less build/zephyr/zephyr.dts

# The generated macros. Grep here when a DT_ macro does not expand
grep -i bme280 build/zephyr/include/generated/zephyr/devicetree_generated.h

# Which bindings were found
west build -t dts
```

If a node is missing from `zephyr.dts`, the overlay did not apply. Check the
filename against the build target, and confirm the build was pristine.

## Reading build errors

| Error | Cause |
| --- | --- |
| `'xyz' is not a valid property name` | Property not in the binding. Call `get_binding` |
| `Unable to find binding for compatible 'x,y'` | Typo, or the binding lives in a module that is not in the workspace |
| `undefined node label 'spiN'` | That label does not exist on this SoC. Read the board `.dtsi` |
| `duplicate unit-address` | Two children share a `reg` on the same bus |
| `_DT_N_... undeclared` | The node exists but is not `status = "okay"` |

## Workflow

1. `get_board` to find the board directory, then read its `.dts` for the labels
   and pinctrl groups that exist on that package.
2. `search_bindings` / `get_binding` for the device you are adding.
3. Write the overlay using only properties the binding lists.
4. Build pristine (`-p always`) and confirm the node in `build/zephyr/zephyr.dts`.
