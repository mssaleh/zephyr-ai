---
name: zephyr-testing
description: "Test firmware with ztest and twister: unit and integration suites, testcase.yaml, running on native_sim, QEMU or hardware, mocking drivers, and adding tests to CI."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.10.0"
---

# Testing

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Most firmware logic can be tested without hardware. `native_sim` compiles the
application for the host, so tests run in milliseconds, under a debugger, and in
CI without a board attached. Use hardware runs only for what requires hardware.

Upstream's own tests are indexed and are a usable template:

- `search_samples` with `kind: "test"` finds a Twister suite covering the
  subsystem you are testing. Read its `testcase.yaml` and sources.
- `get_sample` returns the file list, the platforms it declares, and the harness
  it uses, so a new suite follows a structure upstream runs.
- `search_boards` shows which targets support the peripheral under test, before
  you write a `platform_allow` that matches nothing.
- `search_kconfig` finds the test-only symbols a suite needs. Names change
  between releases.

## A ztest suite

```
tests/my_feature/
├── CMakeLists.txt
├── prj.conf
├── testcase.yaml
└── src/main.c
```

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(my_feature_test)
target_sources(app PRIVATE src/main.c)
```

```kconfig
# prj.conf
CONFIG_ZTEST=y
```

```c
#include <zephyr/ztest.h>
#include "my_feature.h"

/* Per-suite fixture; NULL if the suite needs no state. */
struct my_feature_fixture {
        struct my_ctx ctx;
};

static struct my_feature_fixture test_fixture;

static void *setup(void)
{
        my_feature_init(&test_fixture.ctx);
        return &test_fixture;
}

static void before_each(void *fixture)
{
        struct my_feature_fixture *state = fixture;
        my_feature_reset(&state->ctx);
}

ZTEST_SUITE(my_feature, NULL, setup, before_each, NULL, NULL);

ZTEST_F(my_feature, test_rejects_out_of_range)
{
        zassert_equal(-EINVAL, my_feature_set(&fixture->ctx, 9999),
                      "out-of-range value should be rejected");
}

ZTEST_F(my_feature, test_accumulates)
{
        /* ZTEST_F gives the fixture as `fixture` */
        zassert_ok(my_feature_add(&fixture->ctx, 5));
        zassert_equal(5, my_feature_total(&fixture->ctx));
}
```

Useful assertions: `zassert_ok` (expects 0, the Zephyr success convention),
`zassert_equal`, `zassert_true`, `zassert_not_null`, `zassert_mem_equal`,
`zassert_within` for floating point. Each takes an optional message. Write one:
an assertion failure in CI without a message is hard to interpret.

## testcase.yaml

```yaml
tests:
  my_feature.unit:
    tags: my_feature unit
    platform_allow:
      - native_sim
      - qemu_cortex_m3
    integration_platforms:
      - native_sim

  my_feature.hardware:
    tags: my_feature hardware
    platform_allow:
      - nucleo_h743zi
      - esp32s3_devkitc/esp32s3/procpu
    harness: console
    harness_config:
      type: one_line
      regex:
        - "PROJECT EXECUTION SUCCESSFUL"
```

`integration_platforms` is the subset run in a quick CI pass. `platform_allow`
restricts which platforms twister will attempt.

## Running with twister

```bash
west twister -T tests --integration          # quick: integration platforms only
west twister -T tests -p native_sim          # one platform
west twister -T tests -p native_sim -v       # show output
west twister -T tests --tag my_feature       # by tag
west twister -T tests -p nucleo_h743zi --device-testing \
    --device-serial /dev/ttyACM0             # on real hardware
west twister -T tests --coverage -p native_sim
```

Results are written to `twister-out/`, with per-test build directories and logs.
Read `twister-out/twister.log` for the failure. The summary table gives only the
name of the failing test.

## Testing code that touches hardware

Keep logic separate from I/O so the logic is testable at all. Where a device is
unavoidable, Zephyr provides fakes:

```kconfig
CONFIG_ZTEST=y
CONFIG_GPIO_EMUL=y              # emulated GPIO controller
CONFIG_I2C_EMUL=y               # emulated I2C bus for driver tests
```

`native_sim` with the `*_EMUL` drivers lets a driver be exercised against a
scripted peripheral. For application logic, FFF fakes let you assert on calls:

```c
#include <zephyr/fff.h>
DEFINE_FFF_GLOBALS;
FAKE_VALUE_FUNC(int, sensor_sample_fetch, const struct device *);

ZTEST(my_feature, test_handles_fetch_failure)
{
        sensor_sample_fetch_fake.return_val = -EIO;
        zassert_equal(-EIO, read_temperature());
        zassert_equal(1, sensor_sample_fetch_fake.call_count);
}
```

## What is worth testing

Prioritise what fails in the field and cannot be found by reading the code:

- Protocol encoders and decoders, against known-good byte sequences
- State machines, including every error and timeout transition
- Boundary conditions on anything that indexes a buffer
- Error paths: make each driver call fail and assert the recovery
- Persistence and settings across a simulated reboot

Do not write tests that assert a peripheral register was written. That tests the
mock. Test the behaviour the register produces.

## CI

```yaml
- run: west twister -T tests --integration --inline-logs
- run: west twister -T tests -p native_sim --coverage --coverage-tool gcovr
```

`--inline-logs` puts failure output in the CI log, so you do not have to download
artefacts to read a one-line assertion message.
