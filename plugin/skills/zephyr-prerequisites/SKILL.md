---
name: zephyr-prerequisites
description: Get a machine ready to build Zephyr, and diagnose a host environment that cannot. Use BEFORE the first build in a new or freshly cloned workspace, before the first build on a machine you have not built Zephyr on, right after creating a west workspace or building a Zephyr index, and whenever setting up, bootstrapping, or preparing a Zephyr project. Also use when a build fails with a missing Python module, a CMake error naming jsonschema, pykwalify, elftools or another package, when west, cmake, ninja, dtc or the Zephyr SDK is absent or the wrong version, when a flashing or signing tool is missing, or when indexing succeeds but building does not. Covers the interpreter contract, Python environments with uv or pip, toolchain installation, and per-board host tools.
license: Apache-2.0
compatibility: Requires Node.js 24+ and Python 3.12+; the toolchain and host flashing tools are installed as described here.
allowed-tools: Bash(west:*) Bash(python3:*) Bash(uv:*) Bash(command:*) Bash(node:*) Read
metadata:
  author: zephyr-ai
  version: "0.8.0"
---

# Build prerequisites

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Start by measuring, not installing

```
check_environment
```

It lists every Python interpreter on this machine, which of the packages this
Zephyr version requires each one has, whether `west` and a Zephyr SDK are
present, and the command that fixes each gap. Pass `board` to also list the
runners that board needs on the host.

Run it before installing anything. Most broken environments are one missing
package in one interpreter. Installing a second toolchain on top of a working one
makes the problem harder to identify.

## The contract

A Zephyr build needs four things, and they are separable:

| Requirement | Who resolves it | How it fails |
| --- | --- | --- |
| Python ≥ 3.12 **on PATH** | CMake, via `find_package(Python3)` | configure stops before any source is read |
| The packages in `scripts/requirements-base.txt`, **in that same interpreter** | Zephyr's build scripts import them | `Missing <package> dependency`, `ModuleNotFoundError` |
| `west` | you, on PATH | `west: command not found` |
| A toolchain (Zephyr SDK) | CMake, via the SDK's CMake package | `No toolchain found`, or a missing cross-compiler |

The second row causes most failures:

> **The interpreter that satisfies the indexer is not necessarily the one that
> builds.** This plugin's indexer prefers the interpreter behind `west`, because
> west's dependencies include PyYAML. CMake takes `python3` from PATH instead. A
> machine can therefore index Zephyr and fail to build it, with no sign of the
> problem in the index.

`references/python-environments.md` has the failure in full, including why a
tool-scoped `west` cannot repair itself.

## Python

Zephyr's own requirements file is the authority on what is needed; never install
from a remembered list.

```bash
# uv installs into the interpreter you name
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

**The interpreter your build system picks is not necessarily the one your tools
run from.** CMake resolves Python from `PATH`; `west` may be installed in an
environment of its own. So the index can build cleanly, `west` can work, and the
*build* can still fail on a missing package, because a third interpreter is the
one doing the work. This is a common host failure, and it is why
`check_environment` lists every interpreter on the machine and which of this
Zephyr's packages each one has. Read that before installing anything.

Put the intended environment first on `PATH`, then confirm which one was
selected:

```bash
command -v python3                    # what CMake will resolve
python3 -c 'import sys; print(sys.executable)'
```

On a distribution whose system Python is externally managed, `pip install --user`
is refused outright; a virtual environment is the supported route, not a
workaround.

**Install the set you need, not the union of all of them.** The full requirements
file pulls in packages for debug probes and workflows a given board never uses,
and one of those needing native headers can fail an otherwise fine setup.
`requirements-base.txt` is the build-critical subset; add the extras a specific
runner needs when you reach for that runner.

## west

`west` has two jobs, and they justify different installations:

- **Bootstrapping**, before any Zephyr tree exists. `uv tool install west` keeps
  it isolated and always available.
- **Building**, where Zephyr's scripts import `west` as a library. It must be in
  the build interpreter's environment, which `requirements-base.txt` provides.

Installing it both ways is normal and not a conflict. Installing it only the
first way causes the failure described in `references/python-environments.md`.

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
- [ ] An empty application builds for one real target, not only `native_sim`,
      which needs no cross-toolchain and so proves less than it appears to.

## Workflow

1. `check_environment`, and if a board is chosen, `check_environment` with it.
2. Fix what it names, one gap at a time, re-running it after each.
3. Build an empty application for a real target before writing any firmware.
4. Build the reference index. See the `zephyr-index` skill.
