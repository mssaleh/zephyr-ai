---
name: zephyr-rtos-patterns
description: "Concurrency on Zephyr: threads, workqueues, ISRs, mutexes, semaphores, queues, stack sizing, timeouts, callbacks you do not own, and the mistakes that cause intermittent field failures."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.0"
---

# Real-time patterns

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Bugs of this class rarely appear in testing. They appear in the field at rates
that are hard to reproduce. Follow the rules below even when a shortcut appears
to work.

Check these against the index rather than from memory:

- `get_api` for any `k_*` call before using it. The parameter order, the type of
  the timeout argument, and the return contract are what code gets wrong, and the
  index has them exactly.
- `get_kconfig` and `search_kconfig` for the instrumentation symbols below.
  `check_config` checks a whole `prj.conf` in one call.

## What is legal in an ISR

An interrupt handler must never block. These are safe:

- `k_sem_give()`, `k_work_submit()`, `k_msgq_put(..., K_NO_WAIT)`
- `k_fifo_put()`, `k_event_post()`, `k_timer_start()`
- Atomic operations, GPIO/register access

These are not, and will either assert or corrupt the system:

- `k_sleep()`, `k_msleep()`, or any `K_FOREVER` or non-zero timeout
- `k_mutex_lock()`: mutexes require a thread context
- `k_malloc()` / `malloc()`
- Anything that logs in immediate mode, or does floating point on a target
  without lazy FPU context saving

Do the minimum in the ISR and hand off to a thread. A work item coalesces
repeated submissions, so use a counting or queued primitive when every event
must be processed:

```c
struct edge_event {
        uint32_t pins;
        k_ticks_t timestamp;
};

K_MSGQ_DEFINE(edge_events, sizeof(struct edge_event), 16, 4);
static atomic_t dropped_edges;

static void gpio_isr(const struct device *dev, struct gpio_callback *cb, uint32_t pins)
{
        struct edge_event event = {
                .pins = pins,
                .timestamp = k_uptime_ticks(),
        };

        /* Define and monitor an overflow policy. Do not drop edges without counting them. */
        if (k_msgq_put(&edge_events, &event, K_NO_WAIT) != 0) {
                atomic_inc(&dropped_edges);
        }
}

static void edge_thread(void)
{
        struct edge_event event;

        while (k_msgq_get(&edge_events, &event, K_FOREVER) == 0) {
                process_edge(&event);
        }
}
```

Use `k_work` when processing only the latest state is intended, and record that
coalescing behaviour next to the submission.

If the handler can take more than a few hundred microseconds, put it on a
dedicated workqueue rather than the system one. The system workqueue is shared,
and blocking it stalls unrelated subsystems.

The same rule covers every callback you did not write the stack for. A callback
from a subsystem — network management, Bluetooth, a driver — runs on a stack that
subsystem sized for its own work, and you cannot see how much of it is left. Do
nothing in it except hand the work to a context you own. With immediate-mode
logging there is no log thread to absorb formatting, so a single log line inside
a network-management callback overflows a stack somebody else sized, 2.5 seconds
into every boot.

## Choosing a synchronisation primitive

| Need | Use | Notes |
| --- | --- | --- |
| Signal an event from an ISR | `k_sem` | The only counting primitive safe to give from an ISR |
| Mutual exclusion between threads | `k_mutex` | Has priority inheritance; never usable in an ISR |
| Pass sized data items | `k_msgq` | Copies; fixed item size; bounded and predictable |
| Pass pointers to buffers | `k_fifo` / `k_lifo` | No copy, but you own the buffer lifetime |
| Wait on several conditions | `k_event` | Wait for any or all of a bit set |
| Defer work from an ISR | `k_work` | The default answer for interrupt bottom halves |
| Fixed-size buffers | `k_mem_slab` | Deterministic; no fragmentation |

Do not use a semaphore for mutual exclusion. A binary semaphore has no priority
inheritance, so a low-priority holder can block a high-priority waiter
indefinitely while a medium-priority thread runs. That is priority inversion.

## Priorities and preemption

- **Negative priority** (`-CONFIG_NUM_COOP_PRIORITIES` to `-1`): cooperative.
  Runs until it yields or blocks. Cannot be preempted by another thread.
- **Zero and positive**: preemptible. A lower number is a higher priority.

Cooperative threads provide mutual exclusion imprecisely and delay every other
thread. Prefer preemptible threads with explicit locking.

`k_sleep()` yields. A busy-wait loop at a positive priority starves every lower
priority thread. Use `k_busy_wait()` only for sub-millisecond hardware delays and
`k_sleep()` for anything longer.

## Always handle the timeout

```c
/* Wrong: hides a lost interrupt as an unexplained hang */
k_sem_take(&data_ready, K_FOREVER);

/* Right: a stuck peripheral becomes a reported error */
int rc = k_sem_take(&data_ready, K_MSEC(100));
if (rc == -EAGAIN) {
        LOG_WRN("sensor timeout, resetting bus");
        return recover_bus();
}
```

Use `K_FOREVER` only when the wait is unbounded by design and a watchdog covers
the failure. Otherwise it turns a recoverable fault into a hang with no error.

## Sharing data with an ISR

`volatile` is not synchronisation. It provides neither atomicity nor the ordering
needed between an ISR and a thread. Use Zephyr atomics for scalar state, an
ISR-safe queue for data transfer, or a short ISR-safe lock:

```c
static atomic_t event_count;

void isr(void) { atomic_inc(&event_count); }
void thread(void) { atomic_val_t n = atomic_clear(&event_count); }
```

For a small multi-word read on one CPU, a short interrupt-locked critical section
is appropriate. SMP code needs a `k_spinlock` or an ownership protocol:

```c
unsigned int key = irq_lock();
/* Access shared state. Keep this to a few instructions. */
irq_unlock(key);
```

`irq_lock()` raises interrupt latency for every interrupt in the system. A long
critical section here causes missed deadlines elsewhere.

## Memory

Prefer static allocation. Firmware that allocates dynamically at steady state
fragments over time and eventually fails to allocate.

```c
/* Static, deterministic, visible in the RAM report */
K_THREAD_STACK_DEFINE(worker_stack, 2048);
static struct k_thread worker_thread;

K_MEM_SLAB_DEFINE(packet_slab, sizeof(struct packet), 16, 4);
```

If a heap is needed, use `k_heap` with a bounded size rather than
`CONFIG_HEAP_MEM_POOL_SIZE` and libc `malloc`. Always handle allocation
failure.

## Stack sizing

Do not guess a stack size. Measure it:

```kconfig
CONFIG_THREAD_ANALYZER=y
CONFIG_THREAD_ANALYZER_AUTO=y
CONFIG_HW_STACK_PROTECTION=y
```

Run the worst-case path: deepest call chain, largest log line, and error
handling. Size the stack to peak usage plus about 30%. On some architectures ISRs
run on the interrupted thread's stack, so `CONFIG_ISR_STACK_SIZE` matters too.

Read the high-water marks while the system is doing real work, not at idle. With
stack initialisation enabled the shell reports true per-thread usage, which turns
stack sizing from an estimate into a table you can act on. Some driver threads
have their size fixed in their own source and cannot be configured from the
application; record that where the next person will find it rather than treating
it as a fault.

## Timing and ordering assumptions

Race conditions on shared data get most of the attention. The defects that pass
review and fail on hardware are usually assumptions about when code runs. Each of
these reads correctly line by line.

**Statically defined threads start before `main()`.** `K_THREAD_DEFINE` starts a
thread during kernel init, so initialisation in `main()` may not have run when
that thread first executes. It often appears to work, because such a thread
usually sleeps first, which makes the failure intermittent and dependent on
timing you did not choose. Either create the thread with `k_thread_create()`
after initialisation, or have it wait on a primitive that initialisation gives.

**Boot takes time, so a zero baseline is wrong.** A liveness, timeout, or
watchdog check that compares the current time against a last-seen timestamp
counts the whole boot as an outage if that timestamp starts at zero. Set it when
the check starts, not at definition:

```c
/* Wrong: at the first evaluation this reads as "never seen", and boot took 800 ms */
static int64_t last_seen;

/* Right: the baseline starts when supervision starts */
static int64_t last_seen;

static void supervisor_start(void)
{
        last_seen = k_uptime_get();
}
```

**Check a configurable value's whole range against every timing constant it is
compared with.** This passes review because each part is reasonable on its own
and they are in different files. A sampling interval a user can set from 1 s to
60 s, and a liveness window of 3 s, are each sensible. Together, every interval
above 3 s causes a reset. Neither module is wrong on its own.

When you add a tunable, list every timing constant it is compared against and
check both ends of its range, not a typical value.

The fix is structural: separate how often the work runs from how often the thread
wakes. A worker that sleeps for its whole duty cycle cannot report in during it.
One that wakes on a short fixed tick can do both, whatever the configured
interval:

```c
/* The report interval is independent of the work interval, so a long work
 * interval does not look like a stalled thread. */
#define SUPERVISION_TICK K_MSEC(500)

static void sampler(void *a, void *b, void *c)
{
        int64_t next = k_uptime_get();

        for (;;) {
                report_alive(SAMPLER_ID);           /* every tick, whatever the duty cycle */
                if (k_uptime_get() >= next) {
                        take_sample();
                        next += sample_interval_ms;  /* configurable, any value */
                }
                k_sleep(SUPERVISION_TICK);
        }
}
```

## Watchdog details that make a device unrecoverable

A watchdog resets a device that has stopped making progress. Two common mistakes
make the result worse than having no watchdog.

**Feeding unconditionally only shows that the feeding thread is running.** If one
thread feeds on a timer while the workers it supervises are stuck, the watchdog
keeps a non-functional device running. Feed on evidence instead: have each
supervised worker report in, and feed only when all of them have reported within
their deadline.

```c
static atomic_t checked_in;
#define ALL_WORKERS (BIT(SAMPLER_ID) | BIT(UPLINK_ID) | BIT(CONTROL_ID))

void report_alive(int id) { atomic_or(&checked_in, BIT(id)); }

static void watchdog_thread(void *a, void *b, void *c)
{
        for (;;) {
                if ((atomic_clear(&checked_in) & ALL_WORKERS) == ALL_WORKERS) {
                        wdt_feed(wdt, channel);
                }
                /* Otherwise do not feed. A reset is the correct outcome. */
                k_sleep(FEED_INTERVAL);
        }
}
```

**An independent watchdog usually cannot be stopped once started, and it usually
survives a warm reset.** These two properties combine badly. If the path from
reset to the first feed can exceed the timeout, the resulting reset is a warm
reset, the watchdog is still running, and the device resets in a loop until power
is removed.

Before writing the code, answer this:

> What is the longest path from reset to the first feed, including every failure
> mode that has a timeout?

Network attach, a sensor that does not respond and uses its full retry budget, a
filesystem mount that has to repair, a bootloader verifying an image. Add them as
if all of them fail at once. Then either arm the watchdog after the slow work, or
move the slow work
off the boot path so it happens with the system already supervised.

Zephyr's own knobs interact with this. `CONFIG_WDT_DISABLE_AT_BOOT=y` leaves the
watchdog off until you install a timeout, which is the safe default while the
boot path is still growing.

## Review checklist

When reviewing or writing firmware, check each of these explicitly:

- No blocking call reachable from an ISR or a `k_timer` expiry function
- Every `k_sem_take` / `k_mutex_lock` / `k_msgq_get` timeout return value handled
- Shared state is atomic, lock-protected, or single-writer
- No dynamic allocation on a steady-state path
- Stacks sized from measurement, with `CONFIG_HW_STACK_PROTECTION` on
- Every driver call's negative errno checked
- A watchdog covers any unbounded wait, and is fed on evidence of progress rather
  than on a timer
- No initialisation in `main()` that a statically defined thread already assumes
- Every liveness or timeout baseline seeded when supervision starts, not at
  definition
- Every configurable interval checked at both ends of its range against the
  timing constants it interacts with
- The longest reset-to-first-feed path costed with every failure mode timing out
  at once
