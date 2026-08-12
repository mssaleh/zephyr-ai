# STM32 and ESP32 vendor-pack boundary

The current plugin supports **Zephyr on STM32 and ESP32** through Zephyr's board, SoC,
binding, Kconfig, sample, documentation, and public-API sources. It does not claim
native STM32Cube or ESP-IDF knowledge and must not translate between those APIs without
explicit provenance.

## Source inventory and treatment

| Source | Authority and likely license | Current treatment | Future pack rule |
| --- | --- | --- | --- |
| Zephyr board/SoC metadata and bindings | Pinned Zephyr Git tree; Apache-2.0 with per-file notices | Indexed in the core database | Remains core and versioned by Zephyr tree fingerprint |
| `hal_stm32` / `hal_espressif` west modules | Exact west commits; mixed upstream notices | Optional module Kconfig/bindings only | Record module commit/state; expand other corpora only with explicit coverage |
| STM32Cube HAL/LL source and device headers | ST software-license terms vary by component | Not indexed | Separate database/attached schema; retain component/version/license per row |
| STM32 reference manuals, datasheets, errata | ST copyrighted documents; redistribution terms vary | Metadata or user-supplied links only | Do not redistribute full text without written permission; version by part/revision |
| ESP-IDF public headers and documentation | Apache-2.0 for much of ESP-IDF, with component notices | Not indexed | Separate ESP-IDF pack keyed by exact release/commit |
| ESP32 technical references and errata | Espressif copyrighted documents and publication terms | Metadata or official links only | Store text only where redistribution is explicitly permitted; key by silicon revision |

Before adding a source, record its origin URL, exact version, license/SPDX evidence,
redistribution permission, update mechanism, and whether content can be placed in a
release artifact. Proprietary or very large manuals should be queried from a
user-authorized local copy or represented by metadata and official links.

## Isolation contract

Vendor-native packs use separate versioned databases or attached schemas. Every result
must state its pack and version. Tool names and response prose must distinguish:

- Zephyr API and devicetree/Kconfig;
- STM32 HAL/LL;
- ESP-IDF;
- silicon documentation/errata.

The core context fingerprint may reference enabled pack fingerprints but vendor facts
must not be silently merged into Zephyr tables. Conflicting names return all qualified
contexts rather than an arbitrary declaration.

## Evidence required before stronger claims

Clock, pinmux, DMA, low-power, boot/flash, radio/coexistence, and debug workflows need
compile evidence against exact toolchains. Claims about silicon behavior or errata also
need the applicable device revision and representative hardware smoke evidence. Until
those packs and tests exist, marketing and skills remain scoped to Zephyr's own
abstraction and published board support.
