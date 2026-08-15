---
name: zephyr-setup
description: Prepare a machine and lay out a Zephyr project. Use before the first build in a new or cloned workspace, when west, cmake, dtc, the SDK or a Python module is missing, or when creating an application, manifest, module, board or driver.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.9.1"
---

# Getting a Zephyr project buildable

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

Two questions, in this order:

1. **Can this machine build Zephyr at all?** — `references/host-environment.md`.
   The interpreter contract, Python environments with `uv` or `pip`, toolchain
   installation, per-board host tools, and how to read a build that fails before
   it compiles anything.
2. **Is the project laid out the way west expects?** —
   `references/project-structure.md`. Workspace topologies, the T2 star manifest,
   application structure, `CMakeLists.txt`, out-of-tree modules, boards and
   drivers, and CI.

Run `check_environment` before diagnosing either by hand. It lists every Python
interpreter on the machine, which of the packages this Zephyr version requires
each one has, and the command that closes the gap. The usual failure is that west
runs from its own environment while CMake resolves `python3` from `PATH`, so
indexing works and the build does not.

## The order that avoids rework

**Environment first, index second, code third.** A missing `dtc` or `pykwalify`
fails the build long after the code is written, and the error names a file nobody
edited.

**Build the index once the workspace exists.** Use the `zephyr-index` skill. Until
it exists, `get_kconfig`, `get_binding`, `get_board` and the edit validation
answer nothing, and the session is back to guessing symbol names.

**Pick the board target before the application layout.** `search_boards` returns
the qualified target `west build -b` expects, and `get_board` reports the memory
the application actually gets rather than the Twister figures — which is what
decides whether the design fits.

**A new board, driver or module belongs out of tree.** Nothing in this project
requires editing the Zephyr checkout, and an edit there is lost at the next `west
update`.
