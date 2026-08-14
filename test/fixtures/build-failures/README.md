# Real Zephyr build failures, one per class

Each `.txt` here is build output as Zephyr actually emits it, not a paraphrase of
it. `check-build-failure.mjs` classifies output to decide which lookup to name,
and the classification is only worth anything if it matches the strings upstream
prints — a pattern written from memory routed a promptless assignment to generic
CMake advice while the correct Kconfig advice sat unused in the same table.

The awkward part is that Zephyr does not print these messages verbatim. `err()`
in `scripts/kconfig/kconfig.py` runs the whole message through
`textwrap.fill(..., 100)`, which discards the line breaks in the source string
and re-wraps at column 100. The break therefore lands in a different place for
every symbol, because the symbol's name and its `(defined at …)` location are
part of the wrapped text:

    …is assigned in a configuration file,
    but is not directly user-configurable (has no prompt).      <- USE_STM32_HAL_DTS

    …is assigned in a configuration file, but is
    not directly user-configurable (has no prompt).             <- PINCTRL

No pattern that spans more than a few words can assume where the newline falls,
which is why the classifier matches across line breaks rather than within a line.

Where each string comes from upstream:

| file | source |
| --- | --- |
| `promptless.txt` | `scripts/kconfig/kconfig.py` `check_no_promptless_assign` |
| `undefined-symbol.txt` | `scripts/kconfig/kconfiglib.py` `_assign_undef`, escalated by `err("Aborting due to Kconfig warnings")` |
| `devicetree-property.txt` | `scripts/dts/python-devicetree/src/devicetree/edtlib.py` `_check_undeclared_props` |
| `missing-binding.txt` | `edtlib.py`, a node whose compatible resolves to no binding |
| `board-not-found.txt` | `cmake/modules/boards.cmake` |
| `region-overflow.txt` | the linker, through Zephyr's link step |
| `host-environment.txt` | a missing Python package in the interpreter CMake selected |

Add a class by adding a file and its expected `kind` to the table in
`test/hooks.test.mjs`. A class with no fixture is a class nobody has checked.
