# Sysbuild and signed images

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## What sysbuild changes

Sysbuild builds several images as one system: an application plus MCUboot, the two
cores of a dual-core SoC, or an application plus a network-core image.

```bash
west build --sysbuild -b <target> .
```

Two things move when it is enabled:

- **The build directory gains a level.** Artefacts are under
  `build/<image-name>/zephyr/` rather than `build/zephyr/`. Scripts and CI steps
  that hard-code the old path silently pick up the wrong file or none at all.
- **Configuration splits in two.** `sysbuild.conf` configures the *system* and uses
  the `SB_CONFIG_` prefix. `prj.conf` still configures the application. A plain
  `CONFIG_` in `sysbuild.conf` does nothing at all — it is not an error, it is
  ignored, which is why it costs time to find.

```kconfig
# sysbuild.conf
SB_CONFIG_BOOTLOADER_MCUBOOT=y
```

Per-image configuration uses the image name:

```kconfig
# sysbuild.conf
SB_CONFIG_BOOTLOADER_MCUBOOT=y
SB_CONFIG_MCUBOOT_MODE_SWAP_USING_MOVE=y
```

Search the system options with `search_kconfig` as usual — they are indexed like
any other Kconfig symbol.

## Flashing a signed image

With MCUboot in the system, the application is signed as part of the build and the
artefact to flash is `build/<app>/zephyr/zephyr.signed.bin`. Flashing the unsigned
`zephyr.bin` produces a board that boots the bootloader, fails to validate the
image, and stops — with no error on the console beyond the bootloader's own
output, which is easy to read as a hardware fault.

`west flash` with sysbuild flashes the whole system, bootloader included, and
picks the right artefact for each image. Prefer it over flashing files by hand.

## Signing explicitly

```bash
west sign -t imgtool -- --key <key.pem>
west sign -t rimage                      # Intel ADSP and similar
```

`west sign` is for signing outside the build: with a key the build does not hold,
for a release artefact, or when re-signing an image built elsewhere. Inside a
sysbuild with MCUboot, signing already happened.

The signing key matters for what the device will accept later. A development build
signed with MCUboot's default key will not be accepted by a bootloader built with
a production key, and the failure appears as a device that boots to the bootloader
and stays there.

Read the version this index was built from rather than assuming the option set:

```
get_doc path=doc/develop/west/sign.rst
search_kconfig query=MCUBOOT_SIGNATURE
```

## Checking what was produced

```bash
west build -t rom_report          # where flash went, per image
ls build/*/zephyr/*.bin           # every image the system produced
```

If a `zephyr.signed.bin` is absent when you expected one, the bootloader was not
actually enabled — check that `sysbuild.conf` was picked up and that the build was
pristine after adding it.
