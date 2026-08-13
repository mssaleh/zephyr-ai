#!/usr/bin/env python3
"""Export the west runner catalogue from the target tree's own runner classes."""

import argparse
import dataclasses
import json
import logging
from pathlib import Path
import sys


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zephyr", required=True)
    return parser.parse_args()


def encode(value):
    """Capability values are JSON-safe apart from the command set, which is unordered."""
    if isinstance(value, (set, frozenset)):
        return sorted(value)
    return value


def summary(cls):
    doc = (cls.__doc__ or "").strip()
    return doc.split("\n", 1)[0].strip() or None


def main():
    args = parse_args()
    zephyr = Path(args.zephyr).resolve()
    commands = zephyr / "scripts" / "west_commands"
    if not (commands / "runners" / "core.py").is_file():
        raise RuntimeError("the selected Zephyr tree ships no west runner package")
    sys.path.insert(0, str(commands))

    # runners/__init__.py imports every runner module and downgrades an ImportError to
    # a warning, so one runner missing a third-party dependency still leaves the rest
    # of the catalogue intact. That silent partial success is the danger: openocd,
    # which 328 boards select, imports zephyr_ext_common and so needs the west package
    # importable. An interpreter without it yields a catalogue missing the commonest
    # runner in Zephyr and says nothing. Import each module separately and report what
    # failed, so the caller can refuse an incomplete catalogue instead of shipping one.
    logging.disable(logging.WARNING)
    import importlib

    import runners
    from runners.core import ZephyrBinaryRunner

    # Completeness is pinned to the west package rather than to a clean import of
    # every module. Zephyr declares west in requirements-base, so an environment that
    # can build Zephyr can import it, and it is what openocd needs. Some runners
    # depend on packages no Zephyr requirements file names at all -- rtsflash wants
    # pyusb -- so demanding zero failures would refuse every environment that exists.
    try:
        importlib.import_module("west")
        west_importable = True
    except Exception:
        west_importable = False

    excluded = []
    notes = []
    for module in getattr(runners, "_names", []):
        try:
            importlib.import_module("runners.{}".format(module))
        except Exception as error:
            excluded.append(
                {
                    "path": "scripts/west_commands/runners/{}.py".format(module),
                    "reason": "runner-import",
                }
            )
            notes.append(
                {
                    "path": "scripts/west_commands/runners/{}.py".format(module),
                    "code": "runner-import",
                    "message": "{}: {}".format(type(error).__name__, error),
                }
            )

    entries = []
    errors = []
    for cls in sorted(ZephyrBinaryRunner.get_runners(), key=lambda item: item.name()):
        try:
            caps = dataclasses.asdict(cls.capabilities())
        except Exception as error:
            errors.append(
                {
                    "path": cls.__module__,
                    "code": "runner-capabilities",
                    "message": str(error),
                }
            )
            continue
        entries.append(
            {
                "name": cls.name(),
                # __module__ is "runners.<file>"; the tree path is what get_source takes.
                "module": "scripts/west_commands/{}.py".format(cls.__module__.replace(".", "/")),
                "description": summary(cls),
                "capabilities": {key: encode(value) for key, value in caps.items()},
            }
        )

    report = {
        # Runner classes, not modules: mdb.py registers two and nsim.py renames its
        # one, so the two counts do not agree and the exclusions are per module.
        "discovered": len(entries) + len(excluded) + len(errors),
        "indexed": len(entries),
        "intentionallyExcluded": excluded,
        "warnings": notes,
        "errors": errors,
    }
    json.dump(
        {"runners": entries, "complete": west_importable, "report": report},
        sys.stdout,
        separators=(",", ":"),
    )
    if errors:
        sys.exit(2)


if __name__ == "__main__":
    main()
