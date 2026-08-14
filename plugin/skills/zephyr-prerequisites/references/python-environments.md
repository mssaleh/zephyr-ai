# Python environments for Zephyr

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Two interpreters, one build

Three separate things choose a Python interpreter, and they do not have to agree:

| Chooser | How it chooses | What it needs |
| --- | --- | --- |
| CMake, during `west build` | `find_package(Python3)`, by **PATH order** | everything in `scripts/requirements-base.txt` |
| `west` itself | its own shebang | west's dependencies only |
| This plugin's indexer | `PYTHON_EXECUTABLE`, then west's interpreter, then `python3` | PyYAML, plus the tree's kconfiglib and python-devicetree |

The indexer prefers west's interpreter deliberately: west depends on PyYAML, so
that interpreter usually satisfies indexing. CMake never consults it.

## Installing west as an isolated tool

Installing west as an isolated tool with `uv tool install west`, `pipx install
west`, or an equivalent puts it in a virtual environment containing west and its
dependencies and nothing else. That environment is enough to index and not enough
to build:

```
uv's west environment   PyYAML ✓  pykwalify ✓  pyelftools ✗  anytree ✗
system python3          PyYAML ✓  pykwalify ✗  pyelftools ✗  anytree ✗
```

Indexing succeeds, because it only needs PyYAML. The build then fails inside
CMake, which used `python3`:

```
CMake Error at cmake/modules/zephyr_module.cmake:73 (message):
  Missing jsonschema dependency
```

The error names a package, not an interpreter, so it reads as "install
jsonschema". Installing it into the wrong interpreter changes nothing. Run
`check_environment`; it reports each interpreter separately and says which one
CMake will use.

Two further consequences worth knowing:

- **A tool-scoped environment usually has no `pip`.** `west packages pip --install`
  runs `sys.executable -m pip`, so inside such an environment it cannot repair
  anything. Install into the build interpreter instead.
- **The failure moves as PATH moves.** Activating a virtual environment changes
  which interpreter `python3` resolves to, so a build that worked in one shell
  can fail in another with no change to the source.

## Choosing a layout

**A workspace virtual environment** is the most predictable, because activating it
makes one interpreter both `python3` and the owner of every requirement:

```bash
uv venv .venv --python 3.12          # or: python3 -m venv .venv
source .venv/bin/activate
uv pip install -r <zephyr>/scripts/requirements.txt
```

`requirements.txt` includes `requirements-base.txt` and the optional extras;
`requirements-base.txt` alone is enough to build.

**Installing into the system interpreter** is fine on a machine dedicated to
Zephyr, and is what CI usually does:

```bash
python3 -m pip install -r <zephyr>/scripts/requirements-base.txt
```

**A tool-scoped west alongside either** is useful for bootstrapping, when there is
no tree to read requirements from yet. Keep it, and do not treat it as the build
environment.

## Requirements files

The tree is the authority. What each carries:

| File | Contents |
| --- | --- |
| `scripts/requirements-base.txt` | what building and creating images needs |
| `scripts/requirements.txt` | base plus the optional sets below |
| `scripts/requirements-build-test.txt` | Twister and build testing |
| `scripts/requirements-run-test.txt` | running tests on hardware |
| `scripts/requirements-extras.txt` | tools some subsystems and runners want |

Some requirements are conditional: `windows-curses` is required only on win32,
and is not missing on Linux. `check_environment` evaluates those markers rather
than reporting them as gaps.

A few runners import packages that no Zephyr requirements file lists. The
`rtsflash` runner needs `pyusb`. Those runners are simply unavailable until the
package is installed, which is a property of upstream rather than of this machine.

## Reading a failure

| Message | Meaning |
| --- | --- |
| `Missing <package> dependency` | Zephyr's own check; the build interpreter lacks it |
| `ModuleNotFoundError: No module named 'x'` | same, raised by a build script directly |
| `Could NOT find Python3` | no interpreter on PATH meets the minimum version |
| `west: command not found` | west is not on PATH at all |
| `Unable to find zephyr base` | west is present but not run from a workspace |

The first three are host environment problems. Nothing in the application is
wrong, and editing it will not help.
