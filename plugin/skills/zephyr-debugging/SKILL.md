---
name: zephyr-debugging
description: Diagnose Zephyr build failures and runtime faults. Use when a build fails with a CMake, Kconfig, devicetree, or linker error; when firmware hard-faults, hangs, reboots, or produces a stack overflow; when a device fails to initialise; or when a peripheral silently does nothing. Covers reading Zephyr's error output, decoding fault dumps, thread and stack analysis, and the instrumentation to enable while investigating.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.6.1"
---

# Debugging Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## First move for any inconsistent behaviour

```bash
west build -b <target> -p always .
```

Incremental builds do not reliably regenerate Kconfig and devicetree output. A
significant share of "impossible" behaviour is a stale build directory. Do this
before forming a theory.

## Build failures

### Devicetree

| Message | Meaning | Fix |
| --- | --- | --- |
| `'foo-bar' is not a valid property name` | Not in the binding | `get_binding` on the compatible; use only listed properties |
| `Unable to find binding for compatible 'v,x'` | No such binding | `search_bindings`; the module providing it may not be in the workspace |
| `undefined node label 'spi5'` | Label absent on this SoC | Read the board `.dtsi` for real labels |
| `_DT_N_S_soc_S_..._P_... undeclared` | Node not `status = "okay"` | Enable it in the overlay |
| `duplicate unit-address` | Two children with the same `reg` | Give each device its own chip select or address |

Confirm what actually compiled in `build/zephyr/zephyr.dts`. If your node is not
there, the overlay never applied — check its filename against the build target.

### Kconfig

An undefined assignment produces a Kconfig warning and the standard Zephyr
application flow aborts on Kconfig warnings. A known symbol can still resolve
off when its dependencies are unmet; check `build/zephyr/.config` and use
`get_kconfig` to inspect each alternative definition and dependency.

`error: Aborting due to Kconfig warnings` with "assigned but has no prompt"
means the symbol is selected by others and cannot be set directly.

### Linker

`undefined reference to 'foo'` in Zephyr almost always means the subsystem
providing `foo` was not enabled — the header is visible but nothing compiled it.
Find the owning `CONFIG_` with `search_kconfig` rather than looking for a missing
source file.

`region 'FLASH' overflowed by N bytes` — run `west build -t rom_report`, then cut
`CONFIG_LOG`, `CONFIG_SHELL`, `CONFIG_ASSERT`, or unused subsystems, or set
`CONFIG_SIZE_OPTIMIZATIONS=y`.

## Runtime faults

Enable the instrumentation before you need it:

```kconfig
CONFIG_ASSERT=y
CONFIG_THREAD_NAME=y
CONFIG_EXCEPTION_STACK_TRACE=y
CONFIG_HW_STACK_PROTECTION=y      # MPU catches overflow at the point of overflow
CONFIG_STACK_SENTINEL=y           # software fallback where no MPU exists
```

### Reading a fault dump

```
E: ***** BUS FAULT *****
E:   Precise data bus error
E:   BFAR Address: 0x00000004
E: r0/a1:  0x00000000  r1/a2:  0x2000a1b4
E:  pc:  0x0800a2f4  lr:  0x0800a1c9
E: >>> ZEPHYR FATAL ERROR 0: CPU exception on CPU 0
E: Current thread: 0x20000f18 (my_worker)
```

The fault address `0x00000004` is the tell: a small offset from zero means a
member access through a `NULL` pointer — nearly always an unchecked
`DEVICE_DT_GET` result or a driver whose init failed.

Turn `pc` into a source location:

```bash
arm-zephyr-eabi-addr2line -e build/zephyr/zephyr.elf 0x0800a2f4
```

Fault types map to causes fairly reliably:

- **Bus fault, low address** — dereferencing `NULL`
- **Usage fault, unaligned access** — casting a byte buffer to a struct pointer
- **Memory manage fault** — stack overflow caught by the MPU, or writing to flash
- **Stack overflow / sentinel corrupted** — the thread's stack is too small

### Stack sizing

Stack overflow is the most common Zephyr runtime failure and it corrupts memory
silently without `CONFIG_HW_STACK_PROTECTION`. Measure rather than guess:

```kconfig
CONFIG_THREAD_ANALYZER=y
CONFIG_THREAD_ANALYZER_AUTO=y
CONFIG_THREAD_ANALYZER_AUTO_INTERVAL=10
```

```
Thread analyze:
 my_worker  : STACK: unused 216 usage 1832 / 2048 (89 %)
```

Above ~80% peak usage, raise the stack. Printf-style logging, floating point, and
deep call chains in ISRs are the usual consumers. With a shell built in,
`kernel stacks` prints the same on demand.

## Nothing happens at all

Work down this list:

1. **Is the device ready?** `device_is_ready()` returning false means the driver's
   init failed — often a devicetree node that is not `status = "okay"`, or a bus
   controller that is disabled.
2. **Did init fail earlier?** With `CONFIG_DEVICE_SHELL=y`, `device list` shows
   every device and its readiness.
3. **Is the node in the tree?** `grep` the node in `build/zephyr/zephyr.dts`.
4. **Is the pin actually routed?** Check `pinctrl-0` against the board's pinctrl
   `.dtsi`; a peripheral with no pinctrl group drives nothing.
5. **Are return values checked?** Zephyr reports failure through negative errno.
   Unchecked returns turn a clear error into silence.

## Logging that does not distort timing

```kconfig
CONFIG_LOG=y
CONFIG_LOG_MODE_DEFERRED=y      # format on a low-priority thread
CONFIG_LOG_BUFFER_SIZE=4096
```

`CONFIG_LOG_MODE_IMMEDIATE=y` formats and transmits synchronously in the caller's
context. Inside an ISR or a real-time thread it will change the behaviour you are
trying to observe. Use deferred mode, and if messages are lost, raise the buffer
rather than switching to immediate.

For timing-sensitive work, toggle a GPIO and watch it on a logic analyser — it
costs nanoseconds where a log line costs microseconds.

## Useful shell commands

```
kernel threads      # state, priority, stack usage of every thread
kernel stacks       # stack high-water marks
device list         # devices and readiness
```

## Workflow

1. Pristine rebuild.
2. Read the *first* error, not the last — later ones are usually consequences.
3. For a devicetree or Kconfig error, verify the symbol with the MCP tools before
   changing anything.
4. For a runtime fault, get `pc` through `addr2line`, then inspect that function's
   assumptions about pointers and stack.
5. Add the instrumentation above and reproduce; do not reason about state you have
   not observed.
