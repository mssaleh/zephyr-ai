---
name: zephyr-drivers-sensors
description: Use and write Zephyr device drivers. Use when reading sensors, driving GPIO, SPI, I2C, UART, PWM, ADC, or flash from an application; when a device fails to initialise or device_is_ready returns false; or when writing a custom driver or binding for new hardware. Covers the device model, initialisation order, the sensor API including the newer read-and-decode path, and the structure of an out-of-tree driver.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Drivers and sensors

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## The device model

A `struct device` is created at build time for every enabled devicetree node with
a matching driver. Get it with `DEVICE_DT_GET`, and always check readiness:

```c
static const struct device *const dev = DEVICE_DT_GET(DT_ALIAS(env_sensor));

if (!device_is_ready(dev)) {
        LOG_ERR("%s not ready", dev->name);
        return -ENODEV;
}
```

`device_is_ready()` returning false means the driver's init function failed or
never ran. The usual causes, in order of likelihood: the node is not
`status = "okay"`; its bus controller is disabled; the `CONFIG_` for the driver is
off; the device did not respond on the bus.

Initialisation runs in levels — `EARLY`, `PRE_KERNEL_1`, `PRE_KERNEL_2`, `POST_KERNEL`,
`APPLICATION` — and within a level by priority number. A driver that depends on
another must initialise later. Getting this wrong is the classic cause of a device
that works when probed by hand but fails at boot.

## Sensors

Zephyr has two sensor APIs and they are easy to confuse.

**Fetch-and-get** — stable, synchronous, everywhere:

```c
#include <zephyr/drivers/sensor.h>

struct sensor_value temp, press, humidity;

int rc = sensor_sample_fetch(dev);       /* one bus transaction, all channels */
if (rc < 0) {
        LOG_ERR("fetch failed: %d", rc);
        return rc;
}

sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);
sensor_channel_get(dev, SENSOR_CHAN_PRESS, &press);

/* sensor_value is fixed point: val1 is whole units, val2 is millionths */
printk("%d.%06d C\n", temp.val1, abs(temp.val2));
double celsius = sensor_value_to_double(&temp);
```

`sensor_sample_fetch()` blocks for the bus transaction. Do not call it from an
ISR; sample on a thread or a workqueue.

**Read-and-decode** — the newer RTIO-based path, non-blocking and higher
throughput, used for streaming and high-rate sensors. It is stabilising and is
expected to replace fetch-and-get. Check with `search_docs` for the current shape
before using it, since it has moved between releases.

Triggers replace polling where the hardware supports them:

```c
static void trigger_handler(const struct device *dev, const struct sensor_trigger *trig)
{
        /* Runs in ISR or a dedicated thread depending on the driver —
           treat it as ISR context and defer real work. */
        k_work_submit(&sample_work);
}

struct sensor_trigger trig = {
        .type = SENSOR_TRIG_DATA_READY,
        .chan = SENSOR_CHAN_ALL,
};
sensor_trigger_set(dev, &trig, trigger_handler);
```

Triggers need `CONFIG_<DRIVER>_TRIGGER_OWN_THREAD` or `_GLOBAL_THREAD` and an
interrupt line wired in devicetree. Without both, `sensor_trigger_set` returns
`-ENOTSUP`.

## Bus APIs

```c
/* I2C and SPI: prefer the _dt variants, which carry the bus and address */
static const struct i2c_dt_spec sensor = I2C_DT_SPEC_GET(DT_NODELABEL(mysensor));
uint8_t reg = 0x00, val;
i2c_write_read_dt(&sensor, &reg, 1, &val, 1);

static const struct spi_dt_spec flash = SPI_DT_SPEC_GET(
        DT_NODELABEL(myflash), SPI_WORD_SET(8) | SPI_TRANSFER_MSB, 0);
struct spi_buf tx = { .buf = cmd, .len = sizeof(cmd) };
struct spi_buf_set tx_set = { .buffers = &tx, .count = 1 };
spi_write_dt(&flash, &tx_set);
```

Every one of these returns a negative errno. `get_api` lists the specific set.

## Writing a driver

Implement the existing subsystem API so the shell, logging, and any generic
consumer work with your device unchanged.

```c
#define DT_DRV_COMPAT mycompany_mysensor

#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(mysensor, CONFIG_SENSOR_LOG_LEVEL);

struct mysensor_config {
        struct i2c_dt_spec bus;
        uint8_t resolution;
};

struct mysensor_data {
        int32_t last_value;
};

static int mysensor_sample_fetch(const struct device *dev, enum sensor_channel chan)
{
        const struct mysensor_config *cfg = dev->config;
        struct mysensor_data *data = dev->data;
        uint8_t raw[2];

        int rc = i2c_burst_read_dt(&cfg->bus, REG_DATA, raw, sizeof(raw));
        if (rc < 0) {
                return rc;
        }
        data->last_value = sys_get_be16(raw);
        return 0;
}

static int mysensor_channel_get(const struct device *dev, enum sensor_channel chan,
                                struct sensor_value *val)
{
        struct mysensor_data *data = dev->data;

        if (chan != SENSOR_CHAN_AMBIENT_TEMP) {
                return -ENOTSUP;
        }
        val->val1 = data->last_value / 100;
        val->val2 = (data->last_value % 100) * 10000;
        return 0;
}

static DEVICE_API(sensor, mysensor_api) = {
        .sample_fetch = mysensor_sample_fetch,
        .channel_get = mysensor_channel_get,
};

static int mysensor_init(const struct device *dev)
{
        const struct mysensor_config *cfg = dev->config;

        if (!i2c_is_ready_dt(&cfg->bus)) {
                return -ENODEV;
        }
        return 0;
}

/* One instance per matching, enabled devicetree node. */
#define MYSENSOR_DEFINE(inst)                                                   \
        static struct mysensor_data mysensor_data_##inst;                       \
        static const struct mysensor_config mysensor_config_##inst = {          \
                .bus = I2C_DT_SPEC_INST_GET(inst),                              \
                .resolution = DT_INST_PROP_OR(inst, resolution, 12),            \
        };                                                                      \
        SENSOR_DEVICE_DT_INST_DEFINE(inst, mysensor_init, NULL,                 \
                &mysensor_data_##inst, &mysensor_config_##inst,                 \
                POST_KERNEL, CONFIG_SENSOR_INIT_PRIORITY, &mysensor_api);

DT_INST_FOREACH_STATUS_OKAY(MYSENSOR_DEFINE)
```

Points that matter: `config` is `const` and lives in flash, `data` is mutable RAM;
`DT_INST_FOREACH_STATUS_OKAY` instantiates one device per enabled node, so the
driver supports several instances for free; returning `-ENOTSUP` for channels you
do not implement is the contract, not an error.

The driver also needs a binding in `dts/bindings/sensor/mycompany,mysensor.yaml`
and a `Kconfig` entry gating it.

## Debugging device problems

```kconfig
CONFIG_LOG=y
CONFIG_SENSOR_LOG_LEVEL_DBG=y
CONFIG_DEVICE_SHELL=y      # `device list` shows every device and readiness
CONFIG_I2C_SHELL=y         # `i2c scan i2c1` proves the wiring
CONFIG_SENSOR_SHELL=y      # `sensor get <device>` without writing code
```

`i2c scan` answering with no devices is a wiring, address, or pull-up problem, not
a software one — establish that before reading driver code.
