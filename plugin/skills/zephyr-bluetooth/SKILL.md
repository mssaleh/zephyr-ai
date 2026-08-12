---
name: zephyr-bluetooth
description: Build Bluetooth Low Energy firmware on Zephyr. Use when implementing a BLE peripheral or central, defining GATT services and characteristics, configuring advertising and connections, handling pairing, bonding, and security, or debugging BLE connectivity, throughput, and power. Covers the host and controller split, the minimum working configuration, GATT service definition, connection parameters, and the settings needed for bonds to persist.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.1.0"
---

# Bluetooth LE

## Host and controller

Zephyr's BLE host is portable; the controller is not. On nRF and some others the
controller is Zephyr's own controller implementation. On ESP32 and STM32WB it is
vendor firmware reached over an HCI transport. Which one you have determines what
is configurable, so confirm with `search_kconfig` for the target rather than
assuming.

## Minimum peripheral configuration

```kconfig
CONFIG_BT=y
CONFIG_BT_PERIPHERAL=y
CONFIG_BT_DEVICE_NAME="My Device"
CONFIG_BT_DEVICE_NAME_DYNAMIC=y      # only if you set the name at runtime

# GATT
CONFIG_BT_GATT_CLIENT=n
CONFIG_BT_ATT_PREPARE_COUNT=2

# Persistent bonds require settings + a storage backend
CONFIG_BT_SETTINGS=y
CONFIG_SETTINGS=y
CONFIG_FLASH=y
CONFIG_FLASH_MAP=y
CONFIG_NVS=y

CONFIG_MAIN_STACK_SIZE=2048
```

Bonds only survive a reboot with `CONFIG_BT_SETTINGS`, `CONFIG_SETTINGS`, a
storage partition in devicetree, **and** a `settings_load()` call after
`bt_enable()`. Missing any one of those produces a device that pairs happily and
forgets on every reset.

## Bringing the stack up

```c
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/settings/settings.h>

static const struct bt_data ad[] = {
        BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
        BT_DATA(BT_DATA_NAME_COMPLETE, CONFIG_BT_DEVICE_NAME,
                sizeof(CONFIG_BT_DEVICE_NAME) - 1),
};

static void connected(struct bt_conn *conn, uint8_t err)
{
        if (err) {
                LOG_ERR("connection failed (0x%02x)", err);
                return;
        }
        LOG_INF("connected");
}

static void disconnected(struct bt_conn *conn, uint8_t reason)
{
        LOG_INF("disconnected (0x%02x)", reason);
}

BT_CONN_CB_DEFINE(conn_callbacks) = {
        .connected = connected,
        .disconnected = disconnected,
};

int main(void)
{
        int rc = bt_enable(NULL);
        if (rc) {
                LOG_ERR("bt_enable: %d", rc);
                return rc;
        }

        if (IS_ENABLED(CONFIG_BT_SETTINGS)) {
                settings_load();          /* must follow bt_enable() */
        }

        rc = bt_le_adv_start(BT_LE_ADV_CONN_FAST_1, ad, ARRAY_SIZE(ad), NULL, 0);
        if (rc) {
                LOG_ERR("adv start: %d", rc);
                return rc;
        }
        return 0;
}
```

Advertising data is limited to 31 bytes in a legacy packet. A long device name
plus a 128-bit UUID does not fit — move the name to the scan response, or shorten
it. `bt_le_adv_start` returning `-EINVAL` is usually this.

## A GATT service

```c
#define MY_SERVICE_UUID BT_UUID_128_ENCODE(0x12345678, 0x1234, 0x5678, 0x1234, 0x56789abcdef0)
static struct bt_uuid_128 svc_uuid = BT_UUID_INIT_128(MY_SERVICE_UUID);
static struct bt_uuid_128 chr_uuid = BT_UUID_INIT_128(
        BT_UUID_128_ENCODE(0x12345678, 0x1234, 0x5678, 0x1234, 0x56789abcdef1));

static uint8_t value[4];

static ssize_t read_value(struct bt_conn *conn, const struct bt_gatt_attr *attr,
                          void *buf, uint16_t len, uint16_t offset)
{
        return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(value));
}

static void ccc_changed(const struct bt_gatt_attr *attr, uint16_t v)
{
        notify_enabled = (v == BT_GATT_CCC_NOTIFY);
}

BT_GATT_SERVICE_DEFINE(my_svc,
        BT_GATT_PRIMARY_SERVICE(&svc_uuid),
        BT_GATT_CHARACTERISTIC(&chr_uuid.uuid,
                BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                BT_GATT_PERM_READ,
                read_value, NULL, value),
        BT_GATT_CCC(ccc_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),
);
```

Every notifiable characteristic needs a `BT_GATT_CCC` descriptor immediately after
it — that is where the client subscribes. Notify only when subscribed:

```c
if (notify_enabled) {
        bt_gatt_notify(NULL, &my_svc.attrs[1], value, sizeof(value));
}
```

Read and write callbacks run in the BLE stack's context. Do not block in them;
copy and hand off to a workqueue.

## Connection parameters

The peripheral proposes; the central decides. Trade latency against power:

```c
static const struct bt_le_conn_param param = {
        .interval_min = BT_GAP_INIT_CONN_INT_MIN,   /* units of 1.25 ms */
        .interval_max = BT_GAP_INIT_CONN_INT_MAX,
        .latency = 4,          /* may skip 4 intervals with nothing to send */
        .timeout = 400,        /* units of 10 ms */
};
bt_conn_le_param_update(conn, &param);
```

Slave latency is the cheapest power win available: the peripheral stays connected
but skips intervals when idle. Keep `timeout` comfortably above
`interval_max × (latency + 1)`, or the link drops.

## Throughput

Default throughput is low. If you are moving data:

```kconfig
CONFIG_BT_L2CAP_TX_MTU=498
CONFIG_BT_BUF_ACL_RX_SIZE=502
CONFIG_BT_BUF_ACL_TX_SIZE=251
CONFIG_BT_CTLR_DATA_LENGTH_MAX=251     # where a Zephyr controller is used
CONFIG_BT_USER_PHY_UPDATE=y            # request 2M PHY
```

Then negotiate MTU and PHY after connecting. Without both the ATT MTU stays at 23
bytes and every notification carries 20 bytes of payload.

## Security

```kconfig
CONFIG_BT_SMP=y
CONFIG_BT_FIXED_PASSKEY=n            # never ship a fixed passkey
CONFIG_BT_SMP_SC_ONLY=y              # LE Secure Connections only
```

```c
bt_conn_set_security(conn, BT_SECURITY_L2);
```

Guard sensitive characteristics with `BT_GATT_PERM_READ_ENCRYPT` or
`_AUTHEN` rather than checking security in the callback — the permission is
enforced by the stack and cannot be forgotten.

## Debugging

```kconfig
CONFIG_BT_SHELL=y            # `bt init`, `bt advertise on`, `bt connect`
CONFIG_LOG=y
```

For anything protocol-level, capture with a sniffer. Disconnect reason `0x08` is
supervision timeout (out of range, or latency and timeout misconfigured), `0x13`
is remote user termination, `0x3e` is failure to establish. Guessing between them
from firmware logs alone wastes time a capture resolves in seconds.

Start from a working sample: `search_samples` with "bluetooth peripheral" and read
its `prj.conf` with `get_sample` — the buffer and stack sizing in those samples is
tuned and hard to derive.
