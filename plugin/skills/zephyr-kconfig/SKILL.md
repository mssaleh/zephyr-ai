---
name: zephyr-kconfig
description: Configure a Zephyr application with Kconfig. Use when editing prj.conf, a board .conf, a defconfig, or a Kconfig file; when a CONFIG_ option appears to have no effect; when choosing between prj.conf, board overlays, and Kconfig fragments; or when a build fails with an undefined symbol, a dependency error, or an unexpected default. Covers symbol lookup, dependency and select semantics, where each kind of setting belongs, and how to inspect the resolved configuration.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Kconfig in Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## The failure mode to understand first

Setting a symbol that does not exist, or whose `depends on` is unsatisfied, is
**not an error**. The line is dropped and the build succeeds with the feature
missing. There is no warning by default. This is why "I set the CONFIG and
nothing happened" is the most common Zephyr complaint, and why every symbol
should be verified before it is written.

Use `get_kconfig`. It returns the type, defaults with their conditions,
`depends on`, and — critically — **what selects the symbol**, which is how you
find out why it is on when you did not ask for it, or what to enable to make it
available.

## Where a setting belongs

| File | Scope | Use for |
| --- | --- | --- |
| `prj.conf` | The application, every board | Features the application always needs |
| `boards/<target>.conf` | One build target | Hardware-specific tuning, per-board buffer sizes |
| `<app>/Kconfig` | Declares new symbols | Application options you want configurable |
| `sysbuild.conf` | The multi-image build | Which images to build, MCUboot settings |
| `*_defconfig` | A board's own defaults | Only when maintaining a board, never in an application |

Extra fragments compose explicitly:

```bash
west build -b nucleo_h743zi . -- -DEXTRA_CONF_FILE="debug.conf;prod.conf"
```

Never edit files under the Zephyr tree to configure an application. It works
until the next `west update` and it breaks every other application in the
workspace.

## Syntax that actually matters

```kconfig
CONFIG_BT=y                    # bool: y or n, never 1/0/true
CONFIG_BT_DEVICE_NAME="MyDev"  # string: quotes required
CONFIG_BT_BUF_ACL_RX_SIZE=251  # int: bare number
CONFIG_HEAP_MEM_POOL_SIZE=0x2000  # hex where the symbol is hex
```

Setting `CONFIG_FOO=n` explicitly turns a symbol **off** even if something would
otherwise default it on — but it cannot defeat a `select`.

## depends on versus select

This distinction causes most Kconfig confusion:

- **`depends on X`** — this symbol is invisible and unsettable unless `X` is on.
  You must enable `X` yourself. If you assign the symbol without `X`, Kconfig
  reports that the requested value could not be honored and the resolved value
  remains off; warnings are fatal in the standard Zephyr application flow.
- **`select X`** — enabling this symbol forces `X` on, *ignoring X's own
  dependencies*. This is why a symbol you never enabled shows up in the build.

When a symbol will not turn on, read its `depends on` from `get_kconfig` and
enable the chain from the bottom up. When a symbol is on and you do not know why,
read the "Selected by" list.

## Inspecting what you actually got

The resolved configuration is the ground truth, not `prj.conf`:

```bash
# Every symbol as resolved for this build
grep CONFIG_BT_PERIPHERAL build/zephyr/.config

# Interactive browser with dependency navigation (shows *why* a symbol is unavailable)
west build -t menuconfig

# Non-interactive equivalent, greppable
west build -t traceconfig
```

`build/zephyr/.config` is regenerated on each build. If a symbol you set is
absent from it, its dependencies were not met.

## Common configuration blocks

Logging, which almost every project wants:

```kconfig
CONFIG_LOG=y
CONFIG_LOG_MODE_DEFERRED=y      # do not format in the calling context
CONFIG_LOG_DEFAULT_LEVEL=3      # 0 none, 1 err, 2 wrn, 3 inf, 4 dbg
CONFIG_LOG_BUFFER_SIZE=2048
```

Deferred mode matters: with `CONFIG_LOG_MODE_IMMEDIATE=y` a log call formats and
writes synchronously, which can take milliseconds and will wreck real-time
behaviour if it happens in an ISR or a high-priority thread.

A shell for interactive debugging:

```kconfig
CONFIG_SHELL=y
CONFIG_SHELL_BACKEND_SERIAL=y
CONFIG_DEVICE_SHELL=y           # `device list` shows what initialised
CONFIG_KERNEL_SHELL=y           # `kernel threads`, `kernel stacks`
```

Catching problems during development:

```kconfig
CONFIG_ASSERT=y
CONFIG_THREAD_NAME=y
CONFIG_THREAD_ANALYZER=y
CONFIG_THREAD_ANALYZER_AUTO=y   # periodic stack usage report
CONFIG_STACK_SENTINEL=y
CONFIG_HW_STACK_PROTECTION=y    # MPU-backed, catches overflow at the fault
```

Turn `CONFIG_ASSERT` and the analyzers off for production; they cost flash, RAM,
and time.

## Changing configuration safely

Kconfig changes are not always picked up incrementally. If a change appears to
have no effect, do a pristine build before investigating anything else:

```bash
west build -b <target> -p always .
```

## Workflow

1. `search_kconfig` with plain language to find candidate symbols.
2. `get_kconfig` on each to confirm the name, type, and dependency chain.
3. Write the minimum set — enable the feature, not every symbol that mentions it.
4. Build, then check `build/zephyr/.config` for each symbol you set.
5. If a symbol is missing there, its `depends on` was unmet. Fix the chain.
