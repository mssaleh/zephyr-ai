# Changelog

All notable user-visible changes are recorded here. The format follows Keep a
Changelog, and releases use semantic versioning.

## [Unreleased]

### Changed

- Catalogue misses are reported as uncertainty instead of proof that valid Zephyr
  syntax is absent.
- The edit hook keeps definitive type checks while no longer rejecting unproven
  Kconfig-symbol or devicetree-binding misses.

### Security

- Added the security-reporting and workspace-index trust-boundary policy.
