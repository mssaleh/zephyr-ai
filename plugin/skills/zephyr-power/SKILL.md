---
name: zephyr-power
description: "Cut power on battery or energy-harvesting devices: CONFIG_PM and PM_DEVICE, device runtime PM, low-power states, wake sources, and why measured current is higher than expected."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.1"
---

# Power management

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Power symbols and power states are both version- and SoC-specific, so check them
against the indexed tree rather than from memory:

- `search_kconfig` and `get_kconfig` for which PM symbols exist here, what they
  depend on, and what selects them.
- `get_binding` on `zephyr,power-state` for the properties a power-state node
  accepts, including the residency and latency values a state requires.
- `get_source` on the SoC `.dtsi` for the states your part defines. Which states
  exist is a property of the silicon, not of Zephyr.

## The two layers

- **System PM** (`CONFIG_PM`): the idle thread selects a low-power state when no
  thread is runnable. This is automatic once configured; the application does
  nothing.
- **Device PM** (`CONFIG_PM_DEVICE`): individual peripherals suspend and resume.
  Needed because a peripheral left clocked will hold current high, and on many
  SoCs will block the deepest system states outright.

```kconfig
CONFIG_PM=y
CONFIG_PM_DEVICE=y
CONFIG_PM_DEVICE_RUNTIME=y      # suspend a device as soon as it is idle
```

Device runtime PM is what you usually want: drivers acquire and release
themselves around each operation, so an idle sensor is powered down without the
application tracking it.

## Sleep is a consequence, not a call

There is no "enter low power" function. The system sleeps when **every** thread is
blocked. So the way to save power is to make threads block:

```c
/* Blocks: the idle thread runs and PM engages */
k_sleep(K_MSEC(1000));
k_sem_take(&data_ready, K_FOREVER);
k_msgq_get(&queue, &msg, K_FOREVER);

/* Does not block: the CPU stays awake at full current */
while (!flag) { }
k_busy_wait(1000000);
```

A single polling loop anywhere in the firmware defeats all of the configuration
below. This is the first thing to look for when current will not drop.

## Defining states

Power states are described in devicetree per SoC:

```dts
&cpu0 {
        cpu-power-states = <&stop0 &stop1 &standby>;
};

/* Usually provided by the SoC dtsi; tune the thresholds, not the encoding */
stop1: state1 {
        compatible = "zephyr,power-state";
        power-state-name = "suspend-to-idle";
        substate-id = <2>;
        min-residency-us = <20000>;   /* do not enter unless idle this long */
        exit-latency-us = <100>;      /* subtracted from the wake deadline */
};
```

`min-residency-us` and `exit-latency-us` are the levers. If they are wrong, the
system either never enters the deep state (residency too high for your duty
cycle) or wakes late and misses deadlines (latency understated).

## Keeping something awake

```c
/* Block deep states across a critical section */
pm_policy_state_lock_get(PM_STATE_SUSPEND_TO_RAM, PM_ALL_SUBSTATES);
do_uninterruptible_work();
pm_policy_state_lock_put(PM_STATE_SUSPEND_TO_RAM, PM_ALL_SUBSTATES);

/* Hold a device on across a burst of transactions */
pm_device_runtime_get(uart);
transmit_batch();
pm_device_runtime_put(uart);
```

Every `get` needs its `put`, including on error paths. A leaked reference is a
device that never suspends, and it presents as "PM does not work".

## Wake sources

A pin that must wake the system is marked in devicetree:

```dts
&gpio0 {
        status = "okay";
};

&button0 {
        wakeup-source;
};
```

Without `wakeup-source`, the peripheral is powered down in deep states and the
interrupt never fires. This is a common cause of a device that sleeps correctly
and then never wakes.

## Diagnosing current that will not drop

Work down this list in order; the answer is almost always in the first three:

1. **Something is not blocking.** Enable `CONFIG_THREAD_ANALYZER` and confirm the
   idle thread runs. A busy-wait or a short `k_sleep` in a loop keeps the
   CPU at full current.
2. **A pin is still driving.** Floating inputs and outputs left high leak through
   whatever is attached. Define `sleep` pinctrl states and apply them.
3. **A peripheral is still clocked.** `CONFIG_PM_DEVICE_RUNTIME` plus a leaked
   `pm_device_runtime_get` keeps a whole clock domain alive.
4. **Debug is enabled.** `CONFIG_DEBUG=y` and an attached debugger keep debug
   clocks running, often several milliamps. Measure with the probe detached.
5. **A timer is too frequent.** Every wake costs the exit latency plus the work.
   Batch periodic work onto one timer rather than several.
6. **Logging.** A UART transmitting is a peripheral that cannot suspend. Buffer and
   flush in bursts, or disable logging for power measurements.

Instrument the state machine while investigating:

```kconfig
CONFIG_PM_LOG_LEVEL_DBG=y
CONFIG_PM_DEVICE_RUNTIME=y
```

Measure with an ammeter or power profiler across a realistic duty cycle. Average
current over a full cycle is the number that determines battery life; peak current
during a radio transmission tells you about the supply, not the lifetime.

## Design guidance

The largest wins are architectural, not configuration:

- Sleep between samples rather than sampling continuously; a sensor read every
  10 s at 5 mA for 20 ms averages microamps.
- Use hardware triggers and interrupts instead of polling, so the CPU is only
  awake when there is something to do.
- Batch radio traffic. A BLE connection interval of 1 s costs far less than 50 ms,
  and sending ten readings at once costs little more than sending one.
- Choose a peripheral that can run in the low-power domain, such as an LPUART or
  low-power timer keeps working in states where the normal one does not.
