# The west command surface

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

West has two layers. **Built-in commands** manage the workspace and come from west
itself. **Extension commands** are contributed by Zephyr and only exist inside a
workspace whose manifest provides them — which is why `west build` works in a
workspace and nowhere else.

Zephyr declares its extensions in `scripts/west-commands.yml`, and that set
changes between releases: `sdk` and `packages` are recent additions. This index
records the list for the version it was built from, so ask rather than assume a
command exists.

```
index_status                                    # which Zephyr version this is
get_source path=scripts/west-commands.yml       # the exact extension set it ships
```

## Workspace commands

```bash
west init -m <url> --mr <revision> <dir>   # new workspace from a manifest URL
west init -l <app-dir>                     # workspace around an existing manifest repo
west update                                # fetch and check out every manifest project
west list -f '{name} {posixpath}'          # what the workspace actually contains
west topdir                                # the workspace root, found upward from cwd
west manifest --resolve                    # the manifest after imports are applied
west manifest --freeze                     # the same, with every revision pinned to a SHA
west config <name> <value>                 # workspace or global configuration
```

`west manifest --freeze` is what makes a build reproducible for someone else, and
what to attach to a bug report about module versions.

`west update` operates on the manifest, not on your application. A dirty manifest
project stops it; a dirty application does not.

## Build, flash, debug

```bash
west build -b <target> [<app-dir>]
west build -t <target-name>                # menuconfig, rom_report, ram_report, run
west flash [-r <runner>] [--dev-id <id>]
west debug | west attach | west debugserver
west reset
west rtt                                   # runners that declare RTT support
```

`west build -t run` is how emulated targets start; they register no flash runner.

## Signing and images

```bash
west sign -t imgtool -- --key <key.pem>    # sign for MCUboot
west blobs list | west blobs fetch         # vendor binaries some HALs need
west bindesc dump <binary>                 # read the binary descriptor block
```

With sysbuild, signing usually happens as part of the build; `west sign` is for
signing an image explicitly or with a key the build does not know about.

`west blobs fetch` matters on parts whose drivers ship as binaries — some wireless
stacks will not build until it has run.

## Testing

```bash
west twister -T tests --integration        # the integration subset upstream CI runs
west twister -p <platform> -T <path>       # one platform
west twister -s <scenario>                 # one scenario by its identifier
```

Scenario identifiers are the keys under `tests:` in a `testcase.yaml`, and are
what `search_samples` and `get_sample` report for an indexed suite.

## Discovery

```bash
west boards -f '{name}'                    # boards this workspace can build
west shields                               # shields it knows about
west sdk list                              # installed toolchains
west packages pip --install                # requirements for the tree and its modules
west completion bash                       # shell completion
```

`west boards` lists what the *workspace* provides, including boards from modules
and out-of-tree board roots. `search_boards` answers from the index, which covers
the tree it was built from. When the two disagree, the workspace is right about
what will build and the index is right about what upstream ships.

## Extending west

An application or module can add its own commands with a `west-commands.yml` of
its own, declared in `zephyr/module.yml`. They then appear in `west --help`
alongside Zephyr's. This is the supported way to give a project a `west
flash-production` or similar without wrapping west in a shell script.
