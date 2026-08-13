---
name: zephyr-devicetree
description: Describe hardware to Zephyr with devicetree. Use when writing or editing .overlay, .dts, .dtsi, or binding .yaml files; when adding a sensor, display, or peripheral to a board; when wiring pinctrl, aliases, or chosen nodes; when using DT_ macros from C; or when a build fails with a devicetree error such as an unknown property, a missing binding, or an undefined node label. Covers overlay authoring, the binding include model, phandle specifiers, and how to inspect the compiled tree.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.6.2"
---

# Devicetree in Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Devicetree describes the hardware; Kconfig selects the software. A driver only
runs if a node with its `compatible` exists **and** is `status = "okay"`. Enabling
a `CONFIG_` for a driver without a matching enabled node does nothing at all.

## Always read the binding first

A binding file is almost never self-contained. `st,stm32-spi.yaml` declares no
properties whatsoever — it includes `st,stm32-spi-common.yaml`, which reaches
`spi-controller.yaml`, which reaches `base.yaml`, and the node ends up accepting
about forty properties. Reading the binding file tells you nothing useful.

Call `get_binding` with the compatible. It returns the **flattened** property set
with types, requiredness, allowed values, and which file each property came from.
Use `search_bindings` when you know the hardware but not the compatible.

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
is `boards/esp32s3_devkitc_esp32s3_procpu.overlay` — slashes become underscores.

## Reaching devicetree from C

Resolve at compile time. There is no runtime lookup cost and a wrong node fails
the build rather than returning `NULL` at 3am:

```c
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>

/* By alias — the portable choice, keeps C free of board specifics */
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

# The generated macros — grep here when a DT_ macro will not expand
grep -i bme280 build/zephyr/include/generated/zephyr/devicetree_generated.h

# Which bindings were found
west build -t dts
```

If a node is missing from `zephyr.dts`, the overlay did not apply — check the
filename against the build target, and confirm the build was pristine.

## Reading build errors

| Error | Cause |
| --- | --- |
| `'xyz' is not a valid property name` | Property not in the binding — call `get_binding` |
| `Unable to find binding for compatible 'x,y'` | Typo, or the binding lives in a module that is not in the workspace |
| `undefined node label 'spiN'` | That label does not exist on this SoC — read the board `.dtsi` |
| `duplicate unit-address` | Two children share a `reg` on the same bus |
| `_DT_N_... undeclared` | The node exists but is not `status = "okay"` |

## Workflow

1. `get_board` to find the board directory, then read its `.dts` for the labels
   and pinctrl groups that actually exist.
2. `search_bindings` / `get_binding` for the device you are adding.
3. Write the overlay using only properties the binding lists.
4. Build pristine (`-p always`) and confirm the node in `build/zephyr/zephyr.dts`.
