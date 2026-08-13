---
name: zephyr-prerequisites
description: Get a machine ready to build Zephyr, and diagnose a host environment that cannot. Use before the first west build in a project, when a build fails with a missing Python module, a CMake error naming jsonschema, pykwalify, elftools or another package, when west or the Zephyr SDK is absent, or when indexing succeeds but building does not. Covers the interpreter contract, Python environments with uv or pip, toolchain installation, and per-board host tools.
license: Apache-2.0
compatibility: Requires Node.js 24+ and Python 3.12+; the toolchain and host flashing tools are installed as described here.
allowed-tools: Bash(west:*) Bash(python3:*) Bash(uv:*) Bash(command:*) Bash(node:*) Read
metadata:
  author: zephyr-ai
  version: "0.6.1"
---

# Build prerequisites

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Start by measuring, not installing

```
check_environment
```

It reports every Python interpreter on this machine, which of the packages *this*
Zephyr version requires each one carries, whether `west` and a Zephyr SDK are
present, and the one command that closes each gap. Pass `board` to also name the
runners that board needs on the host.

Run it before installing anything. Most "broken environment" reports are one
missing package in one interpreter, and installing a second toolchain on top of a
working one makes the real problem harder to see.

## The contract

A Zephyr build needs four things, and they are separable:

| Requirement | Who resolves it | How it fails |
| --- | --- | --- |
| Python ≥ 3.12 **on PATH** | CMake, via `find_package(Python3)` | configure stops before any source is read |
| The packages in `scripts/requirements-base.txt`, **in that same interpreter** | Zephyr's build scripts import them | `Missing <package> dependency`, `ModuleNotFoundError` |
| `west` | you, on PATH | `west: command not found` |
| A toolchain (Zephyr SDK) | CMake, via the SDK's CMake package | `No toolchain found`, or a missing cross-compiler |

The second row is the one that surprises people, and it is worth stating plainly:

> **The interpreter that satisfies the indexer is not necessarily the one that
> builds.** This plugin's indexer prefers the interpreter behind `west`, because
> west's own dependencies include PyYAML. CMake ignores that entirely and takes
> `python3` from PATH. So a machine can index Zephyr perfectly and fail to build
> it, and nothing in the index will look wrong.

`references/python-environments.md` has the failure in full, including why a
tool-scoped `west` cannot repair itself.

## Python

Zephyr's own requirements file is the authority on what is needed; never install
from a remembered list.

```bash
# uv — fast, and installs into the interpreter you name
uv pip install --python "$(command -v python3)" -r <zephyr>/scripts/requirements-base.txt

# pip equivalent
python3 -m pip install -r <zephyr>/scripts/requirements-base.txt
```

For a workspace that should not touch the system interpreter, make the virtual
environment the thing on PATH:

```bash
uv venv .venv --python 3.12          # or: python3 -m venv .venv
source .venv/bin/activate            # now `python3` is the venv's
uv pip install -r <zephyr>/scripts/requirements.txt
```

Either is fine. What matters is that the interpreter `python3` resolves to when
you run `west build` is the one holding the packages.

## west

`west` has two jobs, and they justify different installations:

- **Bootstrapping**, before any Zephyr tree exists — `uv tool install west` keeps
  it isolated and always available.
- **Building**, where Zephyr's scripts import `west` as a library — it must be in
  the build interpreter's environment, which `requirements-base.txt` already
  arranges.

Installing it both ways is normal and not a conflict. Installing it *only* the
first way is the trap in `references/python-environments.md`.

## Toolchain

Check what the indexed Zephyr offers before choosing a method:

```
get_runner            # per-runner host requirements
index_status          # the indexed version, so the right SDK is chosen
```

Zephyr 4.x ships a `west sdk` command:

```bash
west sdk install                          # every GNU toolchain: several GB
west sdk install -t arm-zephyr-eabi       # only what your targets need
west sdk list                             # what is already installed
```

`west sdk` needs a west workspace. Without one, install the SDK from the
`zephyrproject-rtos/sdk-ng` releases and run its `setup.sh`.
`references/toolchain.md` covers both paths and the per-board host tools.

## Validation checklist

- [ ] `check_environment` reports nothing blocking.
- [ ] `python3 --version` is 3.12 or newer, and it is the interpreter you installed into.
- [ ] `west --version` succeeds.
- [ ] `west sdk list` shows a toolchain covering your target's architecture.
- [ ] An empty application builds for one real target — not just `native_sim`,
      which needs no cross-toolchain and so proves less than it appears to.

## Workflow

1. `check_environment` — and, if a board is chosen, `check_environment` with it.
2. Fix what it names, one gap at a time, re-running it after each.
3. Build an empty application for a real target before writing any firmware.
4. Build the reference index — see the `zephyr-index` skill.
