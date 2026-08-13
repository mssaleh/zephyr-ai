---
name: zephyr-development
description: Core workflow for writing, building, and debugging Zephyr RTOS firmware. Use whenever work involves Zephyr, west, prj.conf, devicetree overlays, Kconfig symbols, a Zephyr application or driver, or firmware for STM32, ESP32, nRF, or any Zephyr-supported board. Establishes which reference tool to use before writing code, the layout of a Zephyr application, and how to avoid the version-drift errors that make firmware fail to build.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.3.0"
---

# Zephyr development

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

The complete release-gated example is `plugin/examples/kernel-smoke`; its manifest
declares `native_sim`, STM32, and ESP32 targets and the extended release gate builds all three.

Zephyr is large, version-sensitive, and unforgiving: a misspelled `CONFIG_` assignment
fails Kconfig processing, an invented devicetree property fails at
build time with an error that names the wrong file, and an unqualified board name
fails only after CMake has run for a minute. Most of that is avoidable by looking
things up instead of recalling them.

## The rule that matters

**Look up, then write.** Before writing a `CONFIG_`, a devicetree property, a
board target, or an API call, query the `zephyr` MCP server. Its index is built
from a specific Zephyr tree. Treat exact results as version-exact only when
`index_status` confirms the project commit and context match.

| Before you write | Call | Why |
| --- | --- | --- |
| A `CONFIG_` line | `search_kconfig`, then `get_kconfig` | Symbols get renamed between releases; unknown assignments fail the build |
| A devicetree node or property | `get_binding` | Bindings inherit almost everything through `include:`; the binding file itself lists little |
| A `west build -b` target | `search_boards` | Targets are qualified: `esp32s3_devkitc/esp32s3/procpu`, not `esp32s3_devkitc` |
| A Zephyr API call | `get_api` | Shows the indexed return contract and documented errno values; missing prose is uncertainty |
| Anything unfamiliar | `search_samples` | A sample with explicit Twister platform evidence is a better starting point than assembled prose |
| The source itself — a board `.dts`, an SoC Kconfig, a driver, a runner script | `get_source` | Returns the file at the indexed commit; a copy fetched from the web is a different Zephyr |

Run `index_status` when answers look wrong for the project — it reports the
indexed version and detects a west workspace pinned to a different one.

## The other half: after you write

Looking things up first prevents the errors that are cheap to prevent. The rest
surface after the code exists, and each has an agent that is better at it than a
straight-line continuation of your own reasoning.

| What just happened | Do this |
| --- | --- |
| A `west build` failed | Run the `build-triage` agent. It reads the build output *and* the generated artefacts — `build/zephyr/.config`, `build/zephyr/zephyr.dts` — which is where the real cause usually is |
| You wrote a driver, an ISR, or anything shared between contexts | Run `firmware-reviewer` before calling it done. Interrupt-context violations and init-order races pass testing and fail in the field |
| You edited a `.dts`, `.dtsi`, `.overlay`, or a binding | Run `devicetree-specialist`, or at minimum confirm the result in the compiled tree at `build/zephyr/zephyr.dts` — the source overlay is not the answer |
| You are choosing hardware or structuring a new product | Run `zephyr-architect` before writing code, not after |

Do not treat a failed build as a prompt to guess and rebuild. The second and
third attempts cost more than one triage pass, and a fix that happens to compile
can leave the wrong symbol set in place.

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
                if (gpio_pin_toggle_dt(&led) < 0) {
                        return -EIO;
                }
                k_sleep(K_MSEC(500));
        }
        return 0;
}
```

`device_get_binding("GPIO_0")` is the old API. It still compiles, resolves at
runtime, and costs a string comparison — use `DEVICE_DT_GET` and the `_dt`
accessors instead.

Zephyr calls commonly report failure with a negative errno. Check the documented
contract and the implementation context. `get_api` lists indexed return values when
the source documents them; an empty list does not prove the call cannot fail.

## Working style

1. **Establish the target first.** `search_boards` for the hardware, then
   `get_board` for its build targets and supported peripherals. Designing around a
   peripheral the board does not expose wastes everything that follows.
2. **Find a sample that already does it.** `search_samples`, then `get_sample` to
   read its `prj.conf` and overlay. Copy the configuration, then adapt.
3. **Verify every symbol you write.** `check_config` takes a whole `prj.conf` or
   `.overlay` and returns a verdict per line; `get_kconfig`, `get_binding`, and
   `get_api` each take a list, so grounding a file costs one call rather than one
   per name. The plugin also validates provable mistakes on write. A name the
   catalogue does not hold is never reported as wrong — an application may
   declare its own Kconfig and bindings — so confirm uncertain names against the
   build.
4. **Build before claiming it works.** `west build -b <target> <app>`. Firmware
   that has not been compiled has not been written.
5. **Triage failures, review what compiled.** A failed build goes to
   `build-triage`; a driver or ISR that now compiles goes to `firmware-reviewer`
   before it is called done.

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
