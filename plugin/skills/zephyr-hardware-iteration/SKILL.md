---
name: zephyr-hardware-iteration
description: "Work efficiently when every firmware test needs a manual step: a jumper, a button, a power cycle, a trip to the bench. Use when progress is a few attempts an hour or a person is helping at the hardware."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.0"
---

# Iterating against real hardware

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

On hardware a test cycle can need a jumper move, a power cycle, a cable swap, an
enclosure opened, or a walk to another room. When that is the case, shorten the
loop rather than spending longer reasoning between attempts. Reasoning about a
system you cannot observe has limited returns; adding observability does not.

Measure the cost first:

> How many attempts per hour are possible, and what manual step does each need?

At twenty cycles an hour, trial and error is fine. At three, each image needs to
be worth flashing.

## First check whether a faster loop exists

Before adapting to a slow cycle, check whether it is necessary. Boards often
provide a path that sets the straps once, or not at all:

- an alternate boot mode that receives an image over USB or UART and runs it from
  RAM;
- a runner that loads into RAM over the debug probe instead of programming flash;
- a bootloader with a serial or USB update path;
- a second connector that stays usable in the mode that runs the application.

Two tools list what the board actually provides:

```
get_board <target>     # every runner the board registers, and which command
                       # selects each one
get_runner <name>      # what that runner accepts, and how it loads
```

Also read the board's programming documentation and its `board.cmake`.

A project can run every hardware cycle at many times the necessary cost while a
documented alternative sits unused in the board's own files. A slow loop also
degrades the work: experiments get combined until they are no longer separable,
hypotheses get discussed instead of tested, and bugs get characterised and left
unfixed.

When the loop is slow, ask whether a faster one exists before deciding how to
work within this one.

## Add observability early

Spend the first cycles on being able to run later experiments without reflashing.

**Build a shell.** A device you can query turns most later questions into a
command instead of a build-flash-strap cycle.

```kconfig
CONFIG_SHELL=y
CONFIG_DEVICE_SHELL=y          # `device list` shows what initialised
CONFIG_KERNEL_SHELL=y          # `kernel threads`, `kernel stacks`
CONFIG_I2C_SHELL=y             # probe a bus without writing code
CONFIG_SENSOR_SHELL=y          # read a sensor without writing code
```

**Enable the shell for the subsystem that is failing.** This is more useful than
a general shell. A subsystem shell drives one operation with parameters you
choose, separated from the higher-level code that normally calls it: read this
many bytes at this offset, on demand, without a rebuild. A storage layer that
performs read, erase and write together cannot show which of the three fails; the
underlying driver's shell can vary each one separately.

Look the symbol up rather than guessing the name:

```
search_kconfig "<subsystem> shell"     # the CONFIG_ that builds it in
get_kconfig CONFIG_<NAME>_SHELL        # and what it depends on
```

**Move slow or failure-prone initialisation off the boot path.** Anything that
can hang, retry for tens of seconds, or prevent the console coming up should run
when you choose, with the console already available. Mark the node
`zephyr,deferred-init` and bring the device up from the application with
`device_init()`:

```dts
&suspect_device {
        zephyr,deferred-init;
};
```

This makes a boot-time failure observable and retryable. It also keeps a slow
peripheral out of the path between reset and the first watchdog feed.

**Have the device report its own state.** A command that prints configuration,
last error, retry counts, and the values you are reasoning about removes a class
of reflash-to-add-a-log-line cycles.

## State the expected observation before flashing

Write down what you expect to see before the image goes on: which LED, what
pattern, what console line, what value. An expectation you did not state cannot
be checked.

Aliases, node labels, array indices and silkscreen numbering are four separate
naming systems, and nothing keeps them consistent. `led0` is not necessarily the
lowest-numbered LED on the board, and the devicetree node name need not match the
silkscreen either. Firmware that assumes they match compiles and drives the wrong
output. Without a stated prediction, you can watch the wrong indicator and
conclude the code works.

Resolve the chain against the tree you are building:

```
get_source boards/<vendor>/<board>/<board>.dts     # the alias and the node it names
```

Board documentation is a secondary source and it drifts. A board page can name
the wrong oscillator, the wrong clock frequency, or LEDs on pins that are not
user-controllable, and none of that appears at build time. Use the devicetree,
and use `build/zephyr/zephyr.dts` in preference to that, because it is what the
build used.

## Report degradation on the device

A degraded mode visible only in logs will not be noticed. When part of the system
is unavailable, show it where it can be seen without a console: latch an
indicator, report it from a status command, and return a non-zero result from the
operation that did not complete.

A command that applied a setting but could not store it should report that, not
success. Keep this behaviour after the bug is fixed.

**Build the health registry before the features.** One place where every
subsystem records its state and a one-line detail, feeding the boot banner, the
shell, whatever the device reports over the network, and the indicator LED.
Written once, early, it costs nothing per feature; retrofitted, it produces N
inconsistent answers to the same question.

**Latch faults, not weather.** An unplugged cable is not a device defect. A fault
indicator that latches on transient external conditions is one operators learn to
ignore, which is worse than having none.

**Report on change, not on schedule.** A periodic dump buries the transition that
matters in identical lines.

**Prove the safety mechanism by firing it.** "The watchdog is armed" is a claim
about configuration. A command that hangs the system deliberately, plus a known
external signature for the reset, is a claim about reality.

## Directing someone at the bench

The person holding the board cannot see your terminal, and each round trip costs
more than any command you will run.

**Batch the physical actions and state the rhythm first.** "Press and hold the
button, I will tell you when to release" beats discovering the sequence one
message at a time. Say what you are about to do, what they should see, and what
to tell you.

**Make interactive timeouts generous.** Fifteen seconds to present a finger or
press a button, not eight. Timing out halfway through a three-step enrolment
costs a full restart with a person waiting.

**The person at the bench is the authority on physical facts.** Which LED is lit,
what is plugged in, whether the jumper is fitted, whether the board is warm. Ask,
and believe the answer over the schematic — the schematic describes the design,
and they are looking at the build.

## Characterise precisely

If a bug is not fixed in this session, the quality of the description decides
whether the next person can finish it.

This is usable:

> the read at this offset, on a freshly reset peripheral, stalls for the driver's
> five-second timeout, three times, then returns `-EIO`

"Flash writes don't work" is not. The first names variables someone can change.

A precise statement is also cheaper to disprove, which is useful when it turns
out to be wrong.

**Count things.** "Reads seem to work" is weaker than "779 consecutive reads
completed with no errors, then this one failed". A quantified boundary makes the
remaining question answerable, and the numbers are usually in a log you already
have:

```bash
grep -c 'read ok' capture.log
grep -n 'error\|timeout' capture.log | head
```

**An identification that cannot be falsified is not an identification.** Report
the value you read next to the conclusion you drew from it: "reads 0x19 at
register 0x75, which `invensense,mpu6050` accepts" can be checked by the next
person; "it's an MPU6886" cannot. `search_bindings` takes that value as
`identity_value` and answers which compatibles have a driver that accepts it,
which is faster and more reliable than searching for the part number.

**Prefer a handshake with a checksum over an acknowledgement.** A bare ACK proves
only that something is at that address. A response whose CRC validates cannot
have come from a device that did not send it.

**When a read returns zeros, read something known-non-zero through the same
path.** Zeros are ambiguous: blank storage, a failed read reporting success, a
peripheral in the wrong security state. If the control read is also zero, say so.
"The fuse is blank" and "nothing is coming back from this path" are different
claims, and choosing the flattering one costs a test cycle.

**A response that changes with state tells you what it means.** Perturb the
system deliberately — cover the sensor, unplug the cable, hold the button — and
watch which bytes move.

**Report raw bytes on the failure path.** "Not recognised" locates nothing; "id
2, code 0x01" locates everything.

## Put several changes in one image

When a cycle has a high fixed cost, an image with one change wastes it. Include
three things:

1. **The fix you think is correct.**
2. **A second candidate fix behind a switch**, reachable from the shell or a
   Kconfig option, so testing it costs a command rather than a cycle.
3. **More instrumentation** for whatever you had to guess about last cycle.

If the first fix works, nothing is lost. If it does not, the next two experiments
are already on the device.

Keep the changes separately observable, with separate log output and separate
switches. Otherwise a combined image only shows that something changed.

## Rank hypotheses by cost of disproof

Order candidates by what it costs to eliminate them, not by likelihood. A cheap
test that removes part of the search space is worth running before a slower test
that would settle the most likely cause.

Cheap tests, roughly in order:

- change a devicetree value and rebuild, with no strap change or rewiring;
- run an existing shell command;
- read the source of the failing component;
- read the vendor header for your part to confirm a register exists;
- swap a cable or use a known-good board.

Expensive tests: rewiring, an oscilloscope session, an enclosure teardown, asking
someone at another site to press a button.

Use data you already have before collecting more. Counts, timings and ordering
can come from a log you already captured:

```bash
# How many retries before it gave up, and how far apart?
grep -c 'retry' capture.log
grep -n 'init\|error\|timeout' capture.log | head -40
```

## Read the code behind an alarming message

A boot message is not evidence for the condition its wording describes. Before
spending a cycle on it, find where it is emitted and read that branch.
`get_source` reads Zephyr and its module trees at the pinned revision, so this
costs one call.

Two common results: the message is unconditional on a path that always runs and
carries no information; or it is conditional on something different from what the
text says. Neither is visible from the message.

The same applies in reverse: a phase that logs success may mean only that a
command was transmitted, not that a device received it.

## Check what a framework function guarantees before exposing it

A command that cannot do what it says turns a visible failure into a confusing
one, and on slow hardware it costs a cycle to find out.

Zephyr's `device_init()` marks a device initialised even when its init function
returns an error. A "retry this device" shell command built on it reports success
and changes nothing.

```c
/* Wrong: reports success even when the device's init failed. */
SHELL_CMD_REGISTER(retry_sensor, NULL, "retry", cmd_calls_device_init);
```

Before adding a recovery, reset, or retry command, read the framework function
with `get_source` rather than assuming from its name. If the operation cannot be
retried, say so in the command help, or expose the driver operation instead of
the framework wrapper.

Do not offer a diagnostic command that cannot report failure.

## When to stop shortening the loop

Stop when the next improvement costs more cycles than it saves. A shell you will
use twenty times is worth two cycles; one you will use twice is not. Near the end
of a problem, spend the cycle on the answer.

## Workflow

1. Measure the cost of a cycle. Below about five per hour, treat the loop as part
   of the problem.
2. Check `get_board` and `get_runner` for a faster load path before adapting to
   the slow one.
3. Spend early cycles on a shell, on device-reported diagnostics, and on moving
   fragile initialisation off the boot path.
4. Rank hypotheses by cost of disproof and run the cheap ones first.
5. Read the code behind any message you are about to act on.
6. Put a confident fix, a switchable candidate, and more instrumentation in each
   image.
7. Before offering a retry or recovery command, confirm the framework supports it.
