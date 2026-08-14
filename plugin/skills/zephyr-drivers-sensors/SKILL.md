---
name: zephyr-drivers-sensors
description: "Device drivers and sensors: GPIO, SPI, I2C, UART, PWM, ADC, flash, the sensor API. Use when a device fails to initialise, device_is_ready returns false, a reading looks wrong, or writing a driver or binding."
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.0"
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

Initialisation runs in levels (`EARLY`, `PRE_KERNEL_1`, `PRE_KERNEL_2`,
`POST_KERNEL`, `APPLICATION`) and within a level by priority number. A driver that depends on
another must initialise later. Getting this wrong is the classic cause of a device
that works when probed by hand but fails at boot.

## Sensors

Zephyr has two sensor APIs and they are easy to confuse.

**Fetch-and-get**: stable, synchronous, available everywhere:

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

**Read-and-decode**: the newer RTIO-based path, non-blocking and higher
throughput, used for streaming and high-rate sensors. It is stabilising and is
expected to replace fetch-and-get. Check with `search_docs` for the current shape
before using it, since it has moved between releases.

Triggers replace polling where the hardware supports them:

```c
static void trigger_handler(const struct device *dev, const struct sensor_trigger *trig)
{
        /* Runs in an ISR or a dedicated thread depending on the driver.
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
a software one. Establish that before reading driver code.

## Before adopting an in-tree driver on new silicon

A driver existing in the tree does not mean it fits your part. Vendors reuse
peripheral names across incompatible register layouts more often than they reuse
the layouts. A driver written for the temperature sensor on one member of a
family can address registers that do not exist on the next one. The result is a
node that compiles, links, initialises, and returns nothing useful. There is no
build error, because no stage of the build compares the driver against your
silicon.

This is most likely in the case that looks safest: same vendor, same family, same
peripheral name, newer part.

Run three checks before using a driver on a part you have not used it on:

1. **Where does upstream use it?** `search_bindings` and `get_binding` report the
   SoC and board devicetree that name the compatible, and the node name each
   board gives it — which is usually the part number actually fitted. If your
   part is not among them, treat the driver as unverified on your part.
2. **What does the driver's identity check accept?** Many drivers refuse to
   initialise unless an identity register reads one of a fixed set of values, and
   `get_binding` reports that set. A part whose marketing name appears nowhere may
   still be accepted: `invensense,mpu6050` accepts `0x19`, which is an MPU6880.
   If you have already read a value off the hardware, `search_bindings` takes it
   as `identity_value` and answers the other direction.
3. **Do the registers it uses exist on your part?** Read the driver with
   `get_source`, list the register and macro names it depends on, and look for
   them in your SoC vendor header. `get_source` reads module trees, so the CMSIS
   or HAL header is one call away.

**Never bind a driver whose identity check the part would fail.** It initialises,
or half-initialises, and produces numbers that look like readings. A device that
is absent is better than a device that lies.

If the registers are missing, stop. No devicetree change will make that driver
work. The options are a different compatible, a vendor-supplied driver, or
writing one.

Check the register contract, not the family name.

### "There is no driver for this part" is a claim that needs the search behind it

State it only with the evidence attached: the part name appears nowhere in the
tree; here are the drivers that do exist for that class; here is the protocol
each speaks; here is why none of them matches. That paragraph is what justifies
writing your own driver, and it is what stops the next person re-deriving it.

Look for the subsystem before writing an application-level driver. Discovering
that a subsystem already exists for the class of device changes the shape of the
solution even when the answer is still to write your own, because the API, the
devicetree binding and the shell commands are then decided for you. `search_docs`
and `get_source` on `drivers/` settle it in two calls.
