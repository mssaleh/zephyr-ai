---
name: esp32-platform
description: Zephyr firmware on Espressif ESP32 microcontrollers. Use when an Espressif build fails to configure or link, when esptool is missing or refuses to flash, when a board target is rejected as unqualified, when the console prints nothing or drops on reset over native USB, when Wi-Fi or Bluetooth will not initialise, when a partition or PSRAM change does not take effect, or when targeting any ESP32 variant (ESP32, S2, S3, C2, C3, C5, C6, H2) or DevKit board. Covers the qualified build targets these boards require, the dual-core appcpu/procpu image model, sysbuild and bootloader handling, partition tables, pinctrl via the IO matrix, and Espressif-specific pitfalls.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.5.0"
---

# ESP32 on Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Zephyr supports Espressif parts through the `hal_espressif` module. Zephyr is a
different world from ESP-IDF: there is no `app_main`, no `menuconfig` in the IDF
sense, no `idf.py`, and IDF component code does not port over. ESP-IDF answers
found online are usually wrong here.

## Build targets may be qualified

Many ESP32 boards require a qualified target; some valid targets are bare board names.
Never infer the target shape:

```bash
west build -b esp32s3_devkitc              # fails
west build -b esp32s3_devkitc/esp32s3/procpu   # correct
```

Qualified identifiers use `<board>/<soc>/<cpucluster>` or a shorter supported form.
Always get the exact string from `search_boards` or `get_board`; do not construct it.

## The dual-core model on ESP32 and ESP32-S3

These parts have two cores that run **separate Zephyr images**:

- `procpu` — the application core, where your code goes
- `appcpu` — a second core, used for offload or for the radio on some designs

They are separate build targets producing separate binaries. Running code on both
means sysbuild, or building and flashing each image explicitly. If you do not
need the second core, target `procpu` only and ignore `appcpu`.

Per-target overlays use underscores for the slashes:
`boards/esp32s3_devkitc_esp32s3_procpu.overlay`.

## Bootloader and flashing

Espressif parts boot a second-stage bootloader before the application. Zephyr can
build it for you via sysbuild, which is the path to prefer:

```bash
west build --sysbuild -b esp32s3_devkitc/esp32s3/procpu .
west flash
```

Direct flashing:

```bash
west flash -r esp32                      # wraps esptool
west flash --esp-device /dev/ttyUSB0
west flash --esp-baud-rate 921600        # much faster on large images
```

Serial console, which is where most bring-up time is spent:

```bash
west espressif monitor -p /dev/ttyUSB0
# or any terminal at 115200
```

If flashing fails to sync, the board is not in download mode: hold BOOT, tap
EN/RST, release BOOT. Boards with a native-USB variant (S2, S3, C3) expose a USB
CDC port that disappears on reset — target the UART bridge port instead while
bringing up, or the flash tool will lose the device mid-write.

## Partitions

The flash layout is devicetree, and it must accommodate everything you enable —
bootloader, application, and any storage partition:

```dts
&flash0 {
        partitions {
                compatible = "fixed-partitions";
                #address-cells = <1>;
                #size-cells = <1>;

                boot_partition: partition@0 {
                        label = "mcuboot";
                        reg = <0x00000000 0x0000F000>;
                };
                slot0_partition: partition@10000 {
                        label = "image-0";
                        reg = <0x00010000 0x00100000>;
                };
                storage_partition: partition@110000 {
                        label = "storage";
                        reg = <0x00110000 0x00040000>;
                };
        };
};
```

An image that overflows its partition flashes and then fails to boot with a
checksum error rather than failing at build time — check sizes against the
partition map, not just against total flash.

## Pinctrl through the IO matrix

Espressif silicon routes most peripherals to almost any pin through an IO matrix,
so pinctrl is written explicitly rather than picked from pre-generated names:

```dts
#include <zephyr/dt-bindings/pinctrl/esp32s3-pinctrl.h>

&pinctrl {
        uart1_default: uart1_default {
                group1 {
                        pinmux = <UART1_TX_GPIO17>;
                        output-high;
                };
                group2 {
                        pinmux = <UART1_RX_GPIO18>;
                        bias-pull-up;
                };
        };
};

&uart1 {
        pinctrl-0 = <&uart1_default>;
        pinctrl-names = "default";
        current-speed = <115200>;
        status = "okay";
};
```

The `pinmux` macros come from the variant's header — an ESP32-S3 macro will not
exist on a C3. Strapping pins and the pins wired to flash and PSRAM are not
usable as GPIO; the board documentation page (via `get_board`, then `get_doc`)
lists them.

## Wi-Fi

```kconfig
CONFIG_WIFI=y
CONFIG_WIFI_ESP32=y
CONFIG_NETWORKING=y
CONFIG_NET_IPV4=y
CONFIG_NET_DHCPV4=y
CONFIG_NET_L2_ETHERNET=y
CONFIG_NET_SOCKETS=y

CONFIG_HEAP_MEM_POOL_SIZE=98304     # the Wi-Fi stack needs a substantial heap
CONFIG_MAIN_STACK_SIZE=4096
```

Wi-Fi is memory-hungry. Under-provisioning the heap produces association
failures and allocation errors rather than an obvious out-of-memory report. Start
from `search_samples` for a Wi-Fi sample and copy its `prj.conf` — the working
combination is not something to derive.

## Bluetooth

ESP32 (original) and C3/S3 support BLE through the Espressif controller:

```kconfig
CONFIG_BT=y
CONFIG_BT_PERIPHERAL=y
CONFIG_BT_ESP32=y
```

Wi-Fi and BLE coexist on shared radio hardware; running both costs throughput and
needs more heap again. Verify which combination a given variant supports before
designing around it.

## PSRAM

Larger modules carry external PSRAM, which must be enabled explicitly:

```kconfig
CONFIG_ESP_SPIRAM=y
CONFIG_ESP_SPIRAM_SIZE=8388608
```

PSRAM is markedly slower than internal SRAM and is not usable for DMA on every
variant. Keep hot data and DMA buffers internal.

## Checklist

1. `get_board` for the exact qualified target — never construct it by hand.
2. Decide `procpu` only, or sysbuild for multi-image.
3. `get_binding` before writing peripheral nodes; ESP32 property sets differ from
   other vendors.
4. Use `pinmux` macros from the header for that exact variant.
5. Size the heap generously for Wi-Fi or BLE, starting from a working sample.
6. Confirm the image fits its partition before flashing.
