---
name: zephyr-development
description: Core workflow for writing, building, and debugging Zephyr RTOS firmware. Use whenever work involves Zephyr, west, prj.conf, devicetree overlays, Kconfig symbols, a Zephyr application or driver, or firmware for STM32, ESP32, nRF, or any Zephyr-supported board. Establishes which reference tool to use before writing code, the layout of a Zephyr application, and how to avoid the version-drift errors that make firmware fail to build.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Zephyr development

Zephyr is large, version-sensitive, and unforgiving: a misspelled `CONFIG_` assignment
fails Kconfig processing, an invented devicetree property fails at
build time with an error that names the wrong file, and an unqualified board name
fails only after CMake has run for a minute. Most of that is avoidable by looking
things up instead of recalling them.

## The rule that matters

**Look up, then write.** Before writing a `CONFIG_`, a devicetree property, a
board target, or an API call, query the `zephyr` MCP server. Its index is built
from a specific Zephyr release, so what it returns is true for the version in use
— which is not the same as what is true in general.

| Before you write | Call | Why |
| --- | --- | --- |
| A `CONFIG_` line | `search_kconfig`, then `get_kconfig` | Symbols get renamed between releases; unknown assignments fail the build |
| A devicetree node or property | `get_binding` | Bindings inherit almost everything through `include:`; the binding file itself lists little |
| A `west build -b` target | `search_boards` | Targets are qualified: `esp32s3_devkitc/esp32s3/procpu`, not `esp32s3_devkitc` |
| A Zephyr API call | `get_api` | Tells you the exact negative errno values to handle |
| Anything unfamiliar | `search_samples` | A sample with explicit Twister platform evidence is a better starting point than assembled prose |

Run `index_status` when answers look wrong for the project — it reports the
indexed version and detects a west workspace pinned to a different one.

## Application layout

A Zephyr application is a directory, not a fork of Zephyr:

```
my-app/
├── CMakeLists.txt          # find_package(Zephyr) then target_sources()
├── prj.conf                # Kconfig for this application
├── app.overlay             # devicetree changes for every board (optional)
├── boards/
│   ├── nucleo_h743zi.overlay   # per-board devicetree
│   └── nucleo_h743zi.conf      # per-board Kconfig
├── src/
│   └── main.c
└── sysbuild.conf           # multi-image builds (optional)
```

`CMakeLists.txt` is nearly always this:

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(my_app)
target_sources(app PRIVATE src/main.c)
```

Board-specific files are picked up automatically by filename: for a build target
`nucleo_h743zi`, `boards/nucleo_h743zi.overlay` and `boards/nucleo_h743zi.conf`
are applied on top of `app.overlay` and `prj.conf`. Prefer this over `#ifdef` in
C or conditional CMake.

## Getting hardware in C

Never look devices up by string. Bind to the devicetree at compile time:

```c
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>

/* Resolve an alias declared in the board dts or your overlay. */
static const struct gpio_dt_spec led = GPIO_DT_SPEC_GET(DT_ALIAS(led0), gpios);

int main(void)
{
        if (!gpio_is_ready_dt(&led)) {
                return -ENODEV;
        }
        if (gpio_pin_configure_dt(&led, GPIO_OUTPUT_ACTIVE) < 0) {
                return -EIO;
        }
        while (1) {
                gpio_pin_toggle_dt(&led);
                k_sleep(K_MSEC(500));
        }
        return 0;
}
```

`device_get_binding("GPIO_0")` is the old API. It still compiles, resolves at
runtime, and costs a string comparison — use `DEVICE_DT_GET` and the `_dt`
accessors instead.

Every Zephyr call that can fail returns a negative errno. Check it. `get_api`
lists the exact set a function documents, and it differs per function.

## Working style

1. **Establish the target first.** `search_boards` for the hardware, then
   `get_board` for its build targets and supported peripherals. Designing around a
   peripheral the board does not expose wastes everything that follows.
2. **Find a sample that already does it.** `search_samples`, then `get_sample` to
   read its `prj.conf` and overlay. Copy the configuration, then adapt.
3. **Verify every symbol you write.** The plugin validates `.conf` and `.overlay`
   edits automatically and will tell you when a symbol or compatible does not
   exist; fix those immediately rather than at build time.
4. **Build before claiming it works.** `west build -b <target> <app>`. Firmware
   that has not been compiled has not been written.

## Related skills

Reach for the specialised skill when the work goes deep:

- `zephyr-kconfig` — configuration strategy, why a symbol has no effect
- `zephyr-devicetree` — overlays, bindings, the DT macro API
- `zephyr-build-flash` — west, runners, sysbuild, flashing
- `zephyr-debugging` — build failures and runtime faults
- `zephyr-drivers-sensors` — the driver model and sensor API
- `zephyr-rtos-patterns` — threads, ISRs, synchronisation, stack sizing
- `zephyr-power`, `zephyr-bluetooth`, `zephyr-networking`, `zephyr-testing`
- `stm32-platform`, `esp32-platform` — silicon-specific behaviour
- `zephyr-index` — rebuild the reference index for this project's Zephyr version
