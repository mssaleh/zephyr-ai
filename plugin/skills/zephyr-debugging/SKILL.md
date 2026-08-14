---
name: zephyr-debugging
description: "Diagnose a Zephyr build failure or runtime fault: CMake, Kconfig, devicetree or linker errors, hard faults, stack overflows, hangs, reboots, a device that does nothing, or a reply that decodes wrongly."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.0"
---

# Debugging Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## First move for any inconsistent behaviour

```bash
west build -b <target> -p always .
```

Incremental builds do not reliably regenerate Kconfig and devicetree output. A
stale build directory explains a large share of behaviour that otherwise looks
impossible. Do this before forming a theory.

## Build failures

### Devicetree

| Message | Meaning | Fix |
| --- | --- | --- |
| `'foo-bar' is not a valid property name` | Not in the binding | `get_binding` on the compatible; use only listed properties |
| `Unable to find binding for compatible 'v,x'` | No such binding | `search_bindings`; the module providing it may not be in the workspace |
| `undefined node label 'spi5'` | Label absent on this SoC | Read the board `.dtsi` for real labels |
| `_DT_N_S_soc_S_..._P_... undeclared` | Node not `status = "okay"` | Enable it in the overlay |
| `duplicate unit-address` | Two children with the same `reg` | Give each device its own chip select or address |

Check what compiled in `build/zephyr/zephyr.dts`. If your node is not there, the
overlay did not apply. Check its filename against the build target; `get_board`
lists the filenames each target uses.

### Kconfig

An assignment to an undefined symbol produces a Kconfig warning, and the standard
Zephyr application flow aborts on Kconfig warnings. A symbol that does exist can
still resolve to off when its dependencies are unmet. Check
`build/zephyr/.config`, and use `get_kconfig` to read each definition and its
dependencies.

An error saying a symbol is assigned but is not directly user-configurable means
the symbol has no prompt. Other symbols select it, and it cannot be set from an
application configuration. `check_config` reports this for a whole file.

### Linker

`undefined reference to 'foo'` usually means the subsystem providing `foo` was
not enabled. The header is visible, the implementation was not compiled. Find the
owning `CONFIG_` with `search_kconfig` rather than looking for a missing source
file.

An undefined `__device_dts_ord_..._ORD` is the devicetree form of the same
problem: the node the code references is not in the merged tree.

For `region 'FLASH' overflowed by N bytes`, first confirm what the region
actually is: `get_board` reports the memory this target's devicetree gives the
application, which is often not the Twister flash figure and on a target without
execute-in-place describes no internal flash at all. Then run
`west build -t rom_report`, and
remove `CONFIG_LOG`, `CONFIG_SHELL`, `CONFIG_ASSERT`, or unused subsystems, or
set `CONFIG_SIZE_OPTIMIZATIONS=y`.

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

The fault address `0x00000004` identifies the cause: a small offset from zero
means a member access through a `NULL` pointer, usually an unchecked
`DEVICE_DT_GET` result or a driver whose init failed.

Turn `pc` into a source location:

```bash
arm-zephyr-eabi-addr2line -e build/zephyr/zephyr.elf 0x0800a2f4
```

Fault types map to causes reliably:

- **Bus fault, low address**: dereferencing `NULL`
- **Usage fault, unaligned access**: casting a byte buffer to a struct pointer
- **Memory manage fault**: stack overflow caught by the MPU, or a write to flash
- **Stack overflow or corrupted sentinel**: the thread's stack is too small

### Stack sizing

Stack overflow is a common Zephyr runtime failure. Without
`CONFIG_HW_STACK_PROTECTION` it corrupts memory with no immediate error. Measure
rather than guess:

```kconfig
CONFIG_THREAD_ANALYZER=y
CONFIG_THREAD_ANALYZER_AUTO=y
CONFIG_THREAD_ANALYZER_AUTO_INTERVAL=10
```

```
Thread analyze:
 my_worker  : STACK: unused 216 usage 1832 / 2048 (89 %)
```

Above about 80% peak usage, raise the stack. Printf-style logging, floating
point, and deep call chains in ISRs consume the most. With a shell built in,
`kernel stacks` prints the same figures on demand.

## Nothing happens at all

Work down this list:

1. **Is the device ready?** `device_is_ready()` returning false means the
   driver's init failed, often because a devicetree node is not
   `status = "okay"`, or a bus controller is disabled.
2. **Did init fail earlier?** With `CONFIG_DEVICE_SHELL=y`, `device list` shows
   every device and its readiness.
3. **Is the node in the tree?** `grep` the node in `build/zephyr/zephyr.dts`.
4. **Is the pin routed?** Check `pinctrl-0` against the board's pinctrl `.dtsi`.
   A peripheral with no pinctrl group drives nothing.
5. **Are return values checked?** Zephyr reports failure through negative errno.
   Unchecked returns turn a clear error into silence.

## A peripheral on a bus that does not enumerate

Read the pattern of the failure before reading register maps.

### Command-only phases succeed, the first reply fails

A controller shifting bits out cannot detect whether anything is listening.
Writes, resets, and other command-only phases report success when no device is
present. The failure appears at the first operation that needs data back: reading
an ID register, waiting for a ready bit, or an ACK.

Read that pattern as a link-layer problem: clocking, signal integrity, pin
configuration, chip select, power, or pull-ups. It is rarely the driver state
machine, and the register named in the error is usually not the cause.

In general, the first error reported is usually not the first thing that went
wrong. Check what ran before it.

### Lower the bus clock before reading register maps

When a device does not enumerate, halve the bus frequency and retry first. It is
one line and reversible.

A `max-frequency` property, or its equivalent, describes the data path the board
designer specified, at the voltage and trace length of that design. Probe, reset,
and identification phases often run in a slower compatibility mode on the same
divider, so a frequency the steady-state path handles can be too fast for
enumeration. This is more likely through a header, a flying lead, or a long trace
that was not part of the original design.

```dts
&spi_or_i2c_bus {
        /* Halve it. If enumeration then works, the problem is the link rather
           than the driver. Raise it again to find the usable maximum. */
        clock-frequency = <1000000>;
};
```

If it works at the lower clock and fails at the higher one, the problem is signal
integrity or timing.

### Vary the shape of an operation, not only its location

When an operation fails inconsistently, the address is one variable and often the
wrong one. Hold the location fixed and vary one parameter at a time:

- **length**, in particular odd against even and multiples of the bus width;
- **alignment** of the buffer and of the offset;
- **count**, one item against many;
- **direction**, read against write;
- **mode**, single against multi-line, DDR against SDR, DMA against polled.

Length is the one usually skipped, and it is where wide and double-data-rate
buses fail. A controller that moves two bytes per clock has no encoding for a
data phase of odd length. The transfer can return data that looks correct and
leave the peripheral waiting for the missing half of the last pair, after which
every operation times out. If a driver reports one-byte write granularity
regardless of data rate, callers will issue odd-length transfers, and the value
that triggers it will be whichever one has an odd length.

The test takes seconds: read 14 bytes, read 15, read 16, and check which one
leaves the next operation failing.

### An operation that returns success can still leave the hardware unusable

Check the peripheral after a suspect operation, not only that operation's return
value. The odd-length transfer above returns data that looks correct, and only
the next operation fails. When a failure appears at operation N, test whether
operation N−1 caused it. The operation that reported success is often the cause.

### On NOR flash, a failed write makes the location unusable

Programming only clears bits. A byte left at `0x00` by a failed write cannot be
rewritten to any other value. It reads back wrong regardless of later code.

After fixing a flash bug, erase and retest. Otherwise the stale byte makes the
value read back wrong and the old fault looks like a new one, costing another
test cycle.

## Believe the device before your decoder

Three failures look like broken hardware and are not.

**A non-zero return is not always a failure.** `-EALREADY` means the operation
was already done: bringing up an interface that auto-started returns it, and so
do many idempotent calls. Treating every non-zero return as an error produced a
prominent, confident report that a link had failed while it was carrying traffic.
Read the documented return set with `get_api` before wrapping a call; an
idempotent operation has an "already done" code, and it is a success.

**Distinguish "not yet" from "never".** A subsystem that will be ready in one
second and one that never will deserve different words and different
consequences. Wait, bounded, for the steady state before reporting it, and say
which of the two you observed.

**A field whose meaning depends on the outcome cannot be decoded
unconditionally.** A reply that carries a privilege level on success and a status
code on failure, in the same byte, will be decoded wrongly by a status table that
is correct for every other command in the protocol — and the failure is silent
and fails closed, so it reads as a hardware or user problem. Decide the outcome
from a field that is unambiguous, then interpret the overloaded one. A shared
enumeration feels safe because it is usually right; ask which commands it
actually applies to.

**Suspect your own decoder first when the device answered promptly with a valid
checksum.** That combination means it understood the question. Report the raw
bytes on the failure path: "not recognised" locates nothing, "id 2, code 0x01"
locates everything.

## Early-boot output is lost, and garbled serial is usually a host problem

Two separate effects make the console unreliable during bring-up, and both look
like firmware faults.

**Deferred logging drops messages emitted before the log thread runs.** That is
the window in which drivers initialise. A device that appears to print nothing
may be writing into a subsystem that has not started.

The options are structural:

- use synchronous logging for bring-up (`CONFIG_LOG_MODE_IMMEDIATE=y`), accepting
  that it changes timing, which is an acceptable trade while the question is
  whether the code ran at all;
- move the work off the boot path so it runs with logging available;
- use a transport that is available earlier, such as an on-chip trace or a direct
  UART write, for the first messages;
- buffer diagnostics and print them on demand from a shell.

**A host-enumerated transport is not connected for the first second or two,**
whatever the firmware does. On USB CDC-ACM the device cannot transmit until the
host has enumerated and opened the port, so earlier output is discarded at the
source. Either wait for DTR before the first message, or accept that earlier
output is lost and design the diagnostics accordingly.

### Two readers on one serial port split the byte stream

If a terminal, a monitor script, an IDE console, or a leftover background process
are attached to the same port, each read takes bytes the others do not see. The
output on each is interleaved fragments and truncated lines, which looks like the
device emitting corrupted data and leads to checking baud rates, clock accuracy,
and signal integrity.

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

For timing-sensitive work, toggle a GPIO and watch it on a logic analyser. It
costs nanoseconds where a log line costs microseconds.

## Useful shell commands

```
kernel threads      # state, priority, stack usage of every thread
kernel stacks       # stack high-water marks
device list         # devices and readiness
```

## Workflow

1. Pristine rebuild.
2. Read the first error, not the last. Later ones are usually consequences.
3. For a devicetree or Kconfig error, verify the symbol with the MCP tools before
   changing anything.
4. For a runtime fault, get `pc` through `addr2line`, then inspect that function's
   assumptions about pointers and stack.
5. Add the instrumentation above and reproduce; do not reason about state you have
   not observed.
