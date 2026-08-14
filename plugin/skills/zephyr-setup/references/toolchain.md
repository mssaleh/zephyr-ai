# Toolchain and host tools

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## The Zephyr SDK

The SDK supplies the cross-compilers plus host tools such as `dtc` and QEMU. It
registers itself with CMake, which is how `find_package(Zephyr)` locates it
without any environment variable.

```bash
west sdk list                              # what is installed and registered
west sdk install                           # every GNU toolchain: several GB
west sdk install -t arm-zephyr-eabi        # one architecture
west sdk install -t arm-zephyr-eabi -t xtensa-espressif_esp32s3_zephyr-elf
```

Zephyr's own help is explicit that installing every toolchain "requires
downloading several gigabytes and occupies significant disk space", so name the
ones your targets need. `west sdk list` prints the available names for the
version you are installing.

`west sdk` runs inside a west workspace. Without one, take the release directly:

```bash
# from the zephyrproject-rtos/sdk-ng releases
tar -xf zephyr-sdk-<version>_linux-x86_64.tar.xz
zephyr-sdk-<version>/setup.sh -t <toolchain> -h -c
```

`-h` installs host tools, `-c` registers the SDK with CMake. Whichever route you
take, confirm registration rather than assuming it:

```bash
west sdk list
ls ~/.cmake/packages/Zephyr-sdk
```

`ZEPHYR_SDK_INSTALL_DIR` is only needed when the registry is not usable, or when
several SDKs are installed and one must be selected.

## Other toolchains

`ZEPHYR_TOOLCHAIN_VARIANT` selects something other than the Zephyr SDK, such as a vendor
toolchain, a distribution cross-compiler, or LLVM. Each has its own variables and
its own supported architectures. Prefer the Zephyr SDK unless a specific target
requires otherwise; it is the combination upstream CI exercises.

## Host flashing and debugging tools

Every runner wraps a separate host program, and the program is *not* the runner
name. `openocd` needs OpenOCD; `stm32cubeprogrammer` needs STM32CubeProgrammer,
which ST distributes separately; `jlink` needs the SEGGER tools; `esp32` wraps
esptool.

Zephyr does not declare these in a machine-readable form, so this plugin does not
claim to check them. It can tell you which runner a board uses:

```
get_board board=<name>       # every registered runner, and which command picks it
get_runner name=<runner>     # what that runner supports and which options it takes
```

Two facts from that output matter before installing anything:

- `west flash` and `west debug` do not always select the same runner. Every
  Espressif board flashes with `esp32` and debugs with `openocd`, so a working
  flash setup does not imply a working debug setup.
- A board can name a default runner it never registers, in which case the
  corresponding command has nothing to run. `get_board` reports this.

For what each host program is and where it comes from, read Zephyr's own page:

```
get_doc path=doc/develop/flash_debug/host-tools.rst
```

In a configured build directory, the authoritative list for that exact build is:

```bash
west flash --context
```

## Espressif targets

Zephyr's Espressif SoC CMake requires `esptool` on PATH at **configure** time, not
only when flashing, so a build fails before compiling if it is absent. It is not
in `requirements-base.txt`.

```bash
uv tool install --upgrade esptool     # or: python3 -m pip install esptool
```

The `esp32` runner also needs the Espressif HAL module present in the workspace,
which `west update` provides when the manifest includes `hal_espressif`.
