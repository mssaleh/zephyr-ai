---
name: zephyr-rtos-patterns
description: Write correct concurrent code on Zephyr. Use when creating threads, workqueues, or interrupt handlers; choosing between mutexes, semaphores, message queues, FIFOs, and events; sizing stacks; sharing data between an ISR and a thread; or reviewing firmware for real-time correctness. Covers what is legal in interrupt context, priority and preemption semantics, timeout handling, memory allocation policy, and the concurrency mistakes that produce intermittent field failures.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.6.2"
---

# Real-time patterns

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Firmware bugs of this class do not show up in testing. They show up in the field,
at rates that make them nearly impossible to reproduce. The rules below are worth
following even when a shortcut appears to work.

## What is legal in an ISR

An interrupt handler must never block. These are safe:

- `k_sem_give()`, `k_work_submit()`, `k_msgq_put(..., K_NO_WAIT)`
- `k_fifo_put()`, `k_event_post()`, `k_timer_start()`
- Atomic operations, GPIO/register access

These are **not**, and will either assert or corrupt the system:

- `k_sleep()`, `k_msleep()`, or any `K_FOREVER` / non-zero timeout
- `k_mutex_lock()` — mutexes require a thread context
- `k_malloc()` / `malloc()`
- Anything that logs in immediate mode, or does floating point on a target
  without lazy FPU context saving

The correct shape is: do the minimum in the ISR, hand off to a thread. A work
item can coalesce repeated submissions, so use a counting or queued primitive
when every event matters:

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

        /* Define and monitor an overflow policy; never silently lose edges. */
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

Use `k_work` when processing only the latest state is intentional; record that
coalescing contract next to the submission.

If the handler can take more than a few hundred microseconds, put it on a
dedicated workqueue rather than the system one — the system workqueue is shared,
and blocking it stalls unrelated subsystems.

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
indefinitely while a medium-priority thread runs — classic priority inversion.

## Priorities and preemption

- **Negative priority** (`-CONFIG_NUM_COOP_PRIORITIES` .. `-1`) — cooperative.
  Runs until it yields or blocks. Cannot be preempted by another thread.
- **Zero and positive** — preemptible, lower number is higher priority.

Cooperative threads are a blunt instrument for mutual exclusion; they also delay
every other thread. Prefer preemptible threads with explicit locking.

`k_sleep()` yields. A busy-wait loop at a positive priority starves everything
below it; use `k_busy_wait()` only for sub-millisecond hardware delays, and
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

`K_FOREVER` is defensible only when the wait is genuinely unbounded by design and
a watchdog covers the failure. Everywhere else it converts a recoverable fault
into a silent hang.

## Sharing data with an ISR

`volatile` is not synchronization: it supplies neither an atomic transaction nor
the ordering needed between an ISR and a thread. Use Zephyr atomics for scalar
state, an ISR-safe queue for data transfer, or a very short ISR-safe lock:

```c
static atomic_t event_count;

void isr(void) { atomic_inc(&event_count); }
void thread(void) { atomic_val_t n = atomic_clear(&event_count); }
```

For a small multi-word snapshot on one CPU, a short interrupt-locked critical
section can be appropriate; SMP code needs a `k_spinlock` or an ownership protocol:

```c
unsigned int key = irq_lock();
/* touch shared state — keep this to a few instructions */
irq_unlock(key);
```

`irq_lock()` raises interrupt latency for every interrupt in the system. Long
critical sections here cause missed deadlines elsewhere.

## Memory

Prefer static allocation. Firmware that allocates dynamically at steady state
will eventually fragment and fail at the worst moment.

```c
/* Static, deterministic, visible in the RAM report */
K_THREAD_STACK_DEFINE(worker_stack, 2048);
static struct k_thread worker_thread;

K_MEM_SLAB_DEFINE(packet_slab, sizeof(struct packet), 16, 4);
```

If a heap is genuinely needed, use `k_heap` with a bounded size rather than
`CONFIG_HEAP_MEM_POOL_SIZE` and libc `malloc`, and always handle allocation
failure.

## Stack sizing

Guessing is how firmware fails in the field. Measure:

```kconfig
CONFIG_THREAD_ANALYZER=y
CONFIG_THREAD_ANALYZER_AUTO=y
CONFIG_HW_STACK_PROTECTION=y
```

Run the worst-case path — deepest call chain, largest log line, error handling —
and size to peak usage plus roughly 30%. Note that ISRs may run on the
interrupted thread's stack on some architectures, so `CONFIG_ISR_STACK_SIZE`
matters too.

## Review checklist

When reviewing or writing firmware, check each of these explicitly:

- No blocking call reachable from an ISR or a `k_timer` expiry function
- Every `k_sem_take` / `k_mutex_lock` / `k_msgq_get` timeout return value handled
- Shared state is atomic, lock-protected, or single-writer
- No dynamic allocation on a steady-state path
- Stacks sized from measurement, with `CONFIG_HW_STACK_PROTECTION` on
- Every driver call's negative errno checked
- A watchdog covers any unbounded wait
