---
name: zephyr-project-setup
description: Create and structure a Zephyr project. Use when starting a new firmware application, setting up or updating a west workspace and manifest, laying out an application repository, writing CMakeLists.txt, creating an out-of-tree module, board, or driver, or organising code for several boards and build variants. Covers workspace topologies, the T2 star manifest, application structure, out-of-tree modules, and CI.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.3.0"
---

# Project setup

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Choose a workspace topology

| Topology | Shape | Use when |
| --- | --- | --- |
| **T1 — Zephyr as manifest** | App lives inside a Zephyr workspace | Learning, experiments |
| **T2 — application as manifest** ⭐ | Your repo is the manifest project inside a workspace | Almost every product |
| **T3 — forked Zephyr** | You maintain a Zephyr fork | Only with real upstream divergence |

T2 is the right default: your repository owns the manifest, pins the exact Zephyr
revision, and is reproducible for everyone who clones it. The repository is not the
west topdir. West's topdir is a non-repository parent containing `.west/` and all
manifest projects:

```
my-workspace/               # west topdir; not a Git repository
├── .west/
├── my-product/            # your Git repository and manifest project
│   ├── west.yml           # pins Zephyr and modules
│   ├── CMakeLists.txt
│   ├── prj.conf
│   ├── src/
│   ├── boards/
│   ├── dts/bindings/
│   ├── drivers/
│   └── zephyr/module.yml
├── zephyr/
└── modules/
```

```yaml
# west.yml — pin Zephyr by tag, never by branch
manifest:
  remotes:
    - name: upstream
      url-base: https://github.com/zephyrproject-rtos
  projects:
    - name: zephyr
      remote: upstream
      revision: v4.4.2
      import:
        # Pull only the HALs you need; importing everything costs GB
        name-allowlist:
          - cmsis
          - hal_stm32
          - hal_espressif
          - mcuboot
  self:
    path: my-product
```

```bash
# Run from my-workspace, the parent of the application repository.
west init -l my-product && west update && west zephyr-export
```

After initialization, `west topdir` from inside `my-product` must print
`my-workspace`, and `west list -f '{name} {posixpath}'` must include every HAL the
targets require. A `.west/config` beside the application with no corresponding
manifest projects is an incomplete workspace, not a shortcut to another topdir.

Pin `revision` to a tag. A branch makes builds irreproducible and turns an
unrelated `west update` into a source of new failures.

## Application CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(my_product)

target_sources(app PRIVATE
  src/main.c
  src/sensors.c
)

target_include_directories(app PRIVATE include)

# Conditional compilation follows Kconfig, not #ifdef in C
target_sources_ifdef(CONFIG_MY_FEATURE app PRIVATE src/feature.c)
```

`app` is the target Zephyr defines; do not create your own executable target.

## Supporting several boards

Let the build system select by filename rather than branching in code:

```
boards/
├── nucleo_h743zi.conf
├── nucleo_h743zi.overlay
├── esp32s3_devkitc_esp32s3_procpu.conf
└── esp32s3_devkitc_esp32s3_procpu.overlay
```

Slashes in a qualified target become underscores. Keep `src/` board-agnostic and
push differences into devicetree, so adding a board means adding two files rather
than editing C.

## Application-specific Kconfig

Declare your own options rather than using `#define`:

```kconfig
# Kconfig  (at the application root)
menu "My product"

config MY_SAMPLE_INTERVAL_MS
	int "Sensor sampling interval (ms)"
	default 1000
	range 10 60000
	help
	  How often to read the environmental sensor.

config MY_FEATURE
	bool "Enable the optional feature"
	select SENSOR

endmenu

source "Kconfig.zephyr"
```

The trailing `source "Kconfig.zephyr"` is required — without it the application
Kconfig replaces Zephyr's instead of extending it.

## Out-of-tree modules

Make a repository a Zephyr module so its drivers, bindings, and Kconfig are found
automatically:

```yaml
# zephyr/module.yml
name: my-product
build:
  cmake: .
  kconfig: Kconfig
settings:
  dts_root: .          # exposes dts/bindings/
  board_root: .        # exposes boards/
```

Bindings then go in `dts/bindings/`, custom boards in `boards/<vendor>/<board>/`,
and both are discovered without any extra flags.

## Out-of-tree drivers

```
drivers/
├── CMakeLists.txt        # add_subdirectory_ifdef(CONFIG_MY_SENSOR my_sensor)
├── Kconfig               # source "drivers/my_sensor/Kconfig"
└── my_sensor/
    ├── CMakeLists.txt
    ├── Kconfig
    └── my_sensor.c
```

Implement Zephyr's existing driver API (sensor, GPIO, ...) rather than exposing a
bespoke one — the subsystem, shell commands, and logging then work unchanged.

## Version control

Commit: `west.yml`, application sources, `prj.conf`, overlays, `boards/`, `CMakeLists.txt`.

Ignore:

```gitignore
build/
twister-out/
```

## CI

```yaml
# Check the application out as workspace/my-product first.
- run: python -m pip install west
- run: cd workspace && west init -l my-product && west update
- run: cd workspace/my-product && west build -b nucleo_h743zi -p always .
- run: cd workspace/my-product && west build -b esp32s3_devkitc/esp32s3/procpu -p always .
- run: cd workspace/my-product && west twister -T tests --integration
```

Build every supported target on every commit. A board that is not built in CI
stops working quietly.

## Workflow

1. `search_boards` for the targets you intend to support; record the qualified
   identifiers.
2. Create the T2 manifest pinned to a Zephyr tag, with a HAL allowlist.
3. From the non-repository workspace parent, `west init -l <application-repo> && west update && west zephyr-export`.
4. Build the empty application for every target before writing features.
5. Rebuild the reference index for this Zephyr version — see the `zephyr-index` skill.
