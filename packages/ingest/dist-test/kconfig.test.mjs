import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/kconfig.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "node:fs";
import { join as join3 } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, it } from "node:test";

// src/parsers/kconfig.ts
var TYPE_KEYWORDS = /* @__PURE__ */ new Set(["bool", "tristate", "int", "hex", "string"]);
var DEF_TYPE_KEYWORDS = {
  def_bool: "bool",
  def_tristate: "tristate",
  def_int: "int",
  def_hex: "hex",
  def_string: "string"
};
function emptyDef(name, file, line, isMenuconfig) {
  return {
    name,
    defaults: [],
    depends: [],
    selects: [],
    implies: [],
    ranges: [],
    file,
    line,
    menuPath: [],
    isMenuconfig
  };
}
function readToken(s) {
  const str = s.trimStart();
  const quote = str[0];
  if (quote === '"' || quote === "'") {
    let out = "";
    let i = 1;
    while (i < str.length) {
      const ch = str[i];
      if (ch === "\\" && i + 1 < str.length) {
        out += str[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) {
        i++;
        break;
      }
      out += ch;
      i++;
    }
    return { value: out, rest: str.slice(i) };
  }
  const m = str.match(/^(\S+)/);
  if (!m) return { value: "", rest: "" };
  return { value: m[1], rest: str.slice(m[1].length) };
}
function splitIfCondition(s) {
  let depth = 0;
  let inQuote = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuote) {
      if (ch === "\\") i++;
      else if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (depth === 0 && s.startsWith("if", i)) {
      const before = i === 0 ? " " : s[i - 1];
      const after = s[i + 2] ?? " ";
      if (/\s/.test(before) && /\s/.test(after)) {
        return { head: s.slice(0, i).trim(), cond: s.slice(i + 2).trim() };
      }
    }
  }
  return { head: s.trim() };
}
function stripComment(line) {
  let inQuote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === "\\") i++;
      else if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") inQuote = ch;
    else if (ch === "#") return line.slice(0, i);
  }
  return line;
}
function indentWidth(line) {
  let n = 0;
  for (const ch of line) {
    if (ch === " ") n += 1;
    else if (ch === "	") n += 8 - n % 8;
    else break;
  }
  return n;
}
function parseKconfig(text, file) {
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    let joined = rawLines[i];
    const startLine = i + 1;
    while (joined.endsWith("\\") && i + 1 < rawLines.length) {
      joined = `${joined.slice(0, -1)} ${rawLines[++i].trim()}`;
    }
    lines.push({ text: joined, line: startLine });
  }
  const defs = [];
  const choices = [];
  const stack = [];
  let current = null;
  let currentChoice = null;
  const contextConds = () => stack.flatMap((c) => c.kind !== "menu" && c.cond ? [c.cond] : []);
  const menuTitles = () => stack.flatMap((c) => c.kind === "menu" && c.title ? [c.title] : []);
  const enclosingChoice = () => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const c = stack[i];
      if (c.kind === "choice") return c.choiceName ?? "<unnamed>";
    }
    return void 0;
  };
  const flush = () => {
    if (current) {
      defs.push(current);
      current = null;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i];
    const stripped = stripComment(entry.text);
    const trimmed = stripped.trim();
    if (trimmed === "") continue;
    const [keyword = "", ...restParts] = trimmed.split(/\s+/);
    const rest = restParts.join(" ");
    if (keyword === "help" || keyword === "---help---") {
      const helpLines = [];
      let baseIndent = -1;
      let j = i + 1;
      for (; j < lines.length; j++) {
        const raw = lines[j].text;
        if (raw.trim() === "") {
          helpLines.push("");
          continue;
        }
        const ind = indentWidth(raw);
        if (baseIndent === -1) {
          baseIndent = ind;
        } else if (ind < baseIndent) {
          break;
        }
        helpLines.push(raw.slice(Math.min(raw.length, countChars(raw, baseIndent))));
      }
      i = j - 1;
      const help = helpLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
      if (current) current.help = help;
      else if (currentChoice) currentChoice.help = help;
      continue;
    }
    switch (keyword) {
      case "config":
      case "menuconfig": {
        flush();
        const { value: name } = readToken(rest);
        if (!name) continue;
        current = emptyDef(name, file, entry.line, keyword === "menuconfig");
        current.menuPath = menuTitles();
        current.depends.push(...contextConds());
        const choice = enclosingChoice();
        if (choice) {
          current.choice = choice;
          const ch = choices.find((c) => (c.name ?? "<unnamed>") === choice);
          if (ch) ch.options.push(name);
        }
        continue;
      }
      case "choice": {
        flush();
        const { value: name } = readToken(rest);
        currentChoice = {
          name: name || void 0,
          options: [],
          file,
          line: entry.line
        };
        choices.push(currentChoice);
        stack.push({ kind: "choice", choiceName: name || "<unnamed>" });
        continue;
      }
      case "endchoice": {
        flush();
        currentChoice = null;
        popUntil(stack, "choice");
        continue;
      }
      case "menu": {
        flush();
        const { value: title } = readToken(rest);
        stack.push({ kind: "menu", title });
        continue;
      }
      case "endmenu": {
        flush();
        popUntil(stack, "menu");
        continue;
      }
      case "if": {
        flush();
        stack.push({ kind: "if", cond: rest.trim() });
        continue;
      }
      case "endif": {
        flush();
        popUntil(stack, "if");
        continue;
      }
      case "source":
      case "rsource":
      case "osource":
      case "orsource":
      case "gsource":
      case "grsource":
      case "mainmenu":
      case "comment": {
        flush();
        continue;
      }
      default:
        break;
    }
    if (!current && !currentChoice) continue;
    if (TYPE_KEYWORDS.has(keyword)) {
      const { value: promptText } = readToken(rest);
      const target = current ?? null;
      if (target) {
        target.type = keyword;
        if (promptText && rest.trimStart().startsWith('"')) target.prompt = promptText;
      } else if (currentChoice && promptText) {
        currentChoice.prompt = promptText;
      }
      continue;
    }
    const defType = DEF_TYPE_KEYWORDS[keyword];
    if (defType && current) {
      current.type = defType;
      const { head, cond } = splitIfCondition(rest);
      if (head) current.defaults.push(cond ? { value: head, cond } : { value: head });
      continue;
    }
    switch (keyword) {
      case "prompt": {
        const { value: text2, rest: after } = readToken(rest);
        const { cond } = splitIfCondition(after);
        if (current) {
          current.prompt = text2;
          if (cond) current.depends.push(cond);
        } else if (currentChoice) {
          currentChoice.prompt = text2;
        }
        break;
      }
      case "default": {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const { value } = readToken(head);
        const isQuoted = head.trimStart().startsWith('"');
        const val = isQuoted ? value : head;
        if (val) current.defaults.push(cond ? { value: val, cond } : { value: val });
        break;
      }
      case "depends": {
        const expr = rest.replace(/^on\s+/, "").trim();
        if (expr && current) current.depends.push(expr);
        break;
      }
      case "select":
      case "imply": {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const { value: sym } = readToken(head);
        if (!sym) break;
        const item = cond ? { value: sym, cond } : { value: sym };
        if (keyword === "select") current.selects.push(item);
        else current.implies.push(item);
        break;
      }
      case "range": {
        if (!current) break;
        const { head, cond } = splitIfCondition(rest);
        const parts = head.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          current.ranges.push(
            cond ? { low: parts[0], high: parts[1], cond } : { low: parts[0], high: parts[1] }
          );
        }
        break;
      }
      case "visible":
      case "option":
      case "optional":
      case "modules":
        break;
      default:
        break;
    }
  }
  flush();
  return { defs, choices };
}
function countChars(line, width) {
  let n = 0;
  let col = 0;
  while (n < line.length && col < width) {
    const ch = line[n];
    if (ch === " ") col += 1;
    else if (ch === "	") col += 8 - col % 8;
    else break;
    n++;
  }
  return n;
}
function popUntil(stack, kind) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].kind === kind) {
      stack.splice(i, 1);
      return;
    }
  }
}
function uniq(items, key) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
function aggregate(defs, choices) {
  const bySymbol = /* @__PURE__ */ new Map();
  for (const def of defs) {
    const list = bySymbol.get(def.name);
    if (list) list.push(def);
    else bySymbol.set(def.name, [def]);
  }
  const choiceNames = new Set(choices.map((c) => c.name).filter(Boolean));
  const out = [];
  for (const [name, group] of bySymbol) {
    const primary = group.find((d) => d.help && d.prompt && d.type) ?? group.find((d) => d.help) ?? group.find((d) => d.prompt) ?? group.find((d) => d.type) ?? group[0];
    const merged = {
      name,
      type: group.find((d) => d.type)?.type,
      prompt: group.find((d) => d.prompt)?.prompt,
      help: group.find((d) => d.help)?.help,
      defaults: uniq(
        group.flatMap((d) => d.defaults),
        (d) => `${d.value}|${d.cond ?? ""}`
      ),
      depends: [...new Set(group.flatMap((d) => d.depends))],
      selects: uniq(
        group.flatMap((d) => d.selects),
        (d) => `${d.value}|${d.cond ?? ""}`
      ),
      implies: uniq(
        group.flatMap((d) => d.implies),
        (d) => `${d.value}|${d.cond ?? ""}`
      ),
      ranges: uniq(
        group.flatMap((d) => d.ranges),
        (r) => `${r.low}|${r.high}|${r.cond ?? ""}`
      ),
      definedIn: group.map((d) => ({ file: d.file, line: d.line })),
      menuPath: primary.menuPath.join(" > "),
      isChoice: choiceNames.has(name),
      choice: group.find((d) => d.choice)?.choice,
      nDefs: group.length
    };
    out.push(merged);
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}
var EXPR_KEYWORDS = /* @__PURE__ */ new Set(["y", "n", "m", "if", "on", "not", "and", "or"]);
function symbolsInExpr(expr) {
  const withoutStrings = expr.replace(/"(?:[^"\\]|\\.)*"/g, " ");
  const ids = withoutStrings.match(/\$?\(?[A-Za-z_][A-Za-z0-9_]*\)?/g) ?? [];
  const out = /* @__PURE__ */ new Set();
  for (const raw of ids) {
    if (raw.startsWith("$")) continue;
    const id = raw.replace(/[()]/g, "");
    if (EXPR_KEYWORDS.has(id) || EXPR_KEYWORDS.has(id.toLowerCase())) continue;
    if (!/^[A-Z0-9_]+$/.test(id)) continue;
    out.add(id);
  }
  return [...out];
}

// src/sources/kconfig.ts
import { existsSync as existsSync2, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as join2 } from "node:path";
import { spawnSync as spawnSync2 } from "node:child_process";

// src/adapters/kconfig-export.py
var kconfig_export_default = `#!/usr/bin/env python3
"""Export Zephyr's evaluated Kconfig declaration graph as deterministic JSON."""

import argparse
import glob
import json
import os
from pathlib import Path
import re
import sys


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zephyr", required=True)
    parser.add_argument("--build-dir", required=True)
    parser.add_argument("--module", action="append", default=[])
    return parser.parse_args()


def write_sources(path, paths):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as stream:
        for source in sorted(set(paths)):
            stream.write('source "{}"\\n'.format(source.replace("\\\\", "/")))


def module_kconfig(root):
    module_yml = Path(root, "zephyr", "module.yml")
    if module_yml.is_file():
        text = module_yml.read_text(encoding="utf-8")
        match = re.search(r"^\\s*kconfig:\\s*([^#\\n]+)", text, re.MULTILINE)
        if match:
            configured = match.group(1).strip().strip('"\\'')
            candidate = Path(root, configured)
            if candidate.is_file():
                return str(candidate.resolve())
    for relative_path in ("zephyr/Kconfig", "Kconfig"):
        candidate = Path(root, relative_path)
        if candidate.is_file():
            return str(candidate.resolve())
    return None


def prepare_environment(args):
    zephyr = str(Path(args.zephyr).resolve())
    build = str(Path(args.build_dir).resolve())
    Path(build, "soc").mkdir(parents=True, exist_ok=True)
    Path(build, "arch").mkdir(parents=True, exist_ok=True)
    Path(build, "toolchain").mkdir(parents=True, exist_ok=True)

    write_sources(
        Path(build, "soc", "Kconfig.soc"),
        glob.glob(str(Path(zephyr, "soc", "**", "Kconfig.soc")), recursive=True),
    )
    write_sources(
        Path(build, "soc", "Kconfig.defconfig"),
        glob.glob(str(Path(zephyr, "soc", "**", "Kconfig.defconfig")), recursive=True),
    )
    write_sources(
        Path(build, "arch", "Kconfig"),
        glob.glob(str(Path(zephyr, "arch", "*", "Kconfig"))),
    )
    write_sources(
        Path(build, "Kconfig.modules"),
        [path for path in (module_kconfig(root) for root in args.module) if path],
    )

    os.environ.update(
        srctree=zephyr,
        ZEPHYR_BASE=zephyr,
        CMAKE_BINARY_DIR=build,
        KCONFIG_BINARY_DIR=build,
        KCONFIG_DOC_MODE="1",
        SOC_DIR="soc",
        ARCH_DIR="arch",
        KCONFIG_BOARD_DIR="boards/*/*",
        ARCH="*",
        APPLICATION_SOURCE_DIR=zephyr,
        TOOLCHAIN_KCONFIG_DIR=str(Path(build, "toolchain")),
        TOOLCHAIN_HAS_NEWLIB="n",
        TOOLCHAIN_HAS_PICOLIBC="n",
        TOOLCHAIN_HAS_GLIBCXX="n",
        TOOLCHAIN_HAS_LIBCXX="n",
    )
    sys.path.insert(0, str(Path(zephyr, "scripts", "kconfig")))
    return zephyr


def main():
    args = parse_args()
    zephyr = prepare_environment(args)

    import kconfiglib as kc

    kconf = kc.Kconfig(
        str(Path(zephyr, "Kconfig")), warn_to_stderr=False, suppress_traceback=True
    )

    allowed_source_roots = [Path(zephyr).resolve(), Path(args.build_dir).resolve()]
    allowed_source_roots.extend(Path(root).resolve() for root in args.module)
    for filename in kconf.kconfig_filenames:
        source = Path(filename).resolve()
        if not any(source.is_relative_to(root) for root in allowed_source_roots):
            raise RuntimeError("Kconfig source escapes declared roots: {}".format(source))

    operators = {
        kc.AND: "and",
        kc.OR: "or",
        kc.NOT: "not",
        kc.EQUAL: "equal",
        kc.UNEQUAL: "unequal",
        kc.LESS: "less",
        kc.LESS_EQUAL: "less_equal",
        kc.GREATER: "greater",
        kc.GREATER_EQUAL: "greater_equal",
    }

    def expression(value):
        if value is None:
            return None
        if isinstance(value, tuple):
            op = operators.get(value[0], "unknown")
            children = [expression(child) for child in value[1:]]
            return {"kind": op, "children": children, "display": kc.expr_str(value)}
        if isinstance(value, kc.Symbol):
            return {
                "kind": "constant" if value.is_constant else "symbol",
                "value": value.name,
                "display": kc.expr_str(value),
            }
        if isinstance(value, kc.Choice):
            return {"kind": "choice", "value": choice_id(value), "display": kc.expr_str(value)}
        return {"kind": "literal", "value": str(value), "display": str(value)}

    roots = [(Path(zephyr), "")]
    roots.extend((Path(root).resolve(), "modules/{}/".format(Path(root).name)) for root in args.module)

    def source_path(filename):
        path = Path(filename).resolve()
        for root, prefix in roots:
            try:
                return prefix + path.relative_to(root).as_posix()
            except ValueError:
                pass
        return "external/{}".format(path.name)

    def choice_id(choice):
        if choice.name:
            return choice.name
        node = choice.nodes[0]
        return "choice@{}:{}".format(source_path(node.filename), node.linenr)

    def menu_path(node):
        entries = []
        parent = node.parent
        while parent:
            if parent.prompt and not isinstance(parent.item, kc.Symbol):
                entries.append(parent.prompt[0])
            parent = parent.parent
        entries.reverse()
        return entries

    types = {
        kc.BOOL: "bool",
        kc.TRISTATE: "tristate",
        kc.INT: "int",
        kc.HEX: "hex",
        kc.STRING: "string",
        kc.UNKNOWN: None,
    }

    symbols = []
    for sym in kconf.unique_defined_syms:
        if not sym.name:
            continue
        definitions = []
        for node in sym.nodes:
            prompt = node.prompt[0] if node.prompt else None
            definitions.append(
                {
                    "file": source_path(node.filename),
                    "line": node.linenr,
                    "prompt": prompt,
                    "promptCondition": expression(node.prompt[1]) if node.prompt else None,
                    "menuPath": menu_path(node),
                    "condition": expression(node.dep),
                    "defaults": [
                        {"value": expression(value), "condition": expression(condition), "order": order}
                        for order, (value, condition, *_location) in enumerate(node.defaults)
                    ],
                    "selects": [
                        {"target": target.name, "condition": expression(condition), "order": order}
                        for order, (target, condition, *_location) in enumerate(node.selects)
                    ],
                    "implies": [
                        {"target": target.name, "condition": expression(condition), "order": order}
                        for order, (target, condition, *_location) in enumerate(node.implies)
                    ],
                    "ranges": [
                        {
                            "low": expression(low),
                            "high": expression(high),
                            "condition": expression(condition),
                            "order": order,
                        }
                        for order, (low, high, condition, *_location) in enumerate(node.ranges)
                    ],
                    "isMenuconfig": bool(node.is_menuconfig),
                    "isConfigDefault": bool(getattr(node, "is_configdefault", False)),
                }
            )
        symbols.append(
            {
                "name": sym.name,
                "type": types.get(sym.orig_type),
                "help": next((node.help for node in sym.nodes if node.help), None),
                "hasPrompt": any(node.prompt for node in sym.nodes),
                "choice": choice_id(sym.choice) if sym.choice else None,
                "definitions": definitions,
            }
        )

    choices = []
    for choice in kconf.unique_choices:
        definitions = []
        for node in choice.nodes:
            definitions.append(
                {
                    "file": source_path(node.filename),
                    "line": node.linenr,
                    "prompt": node.prompt[0] if node.prompt else None,
                    "condition": expression(node.dep),
                }
            )
        choices.append(
            {
                "id": choice_id(choice),
                "name": choice.name,
                "type": types.get(choice.orig_type),
                "definitions": definitions,
                "members": [symbol.name for symbol in choice.syms],
            }
        )

    merged_choices = {}
    for choice in choices:
        previous = merged_choices.get(choice["id"])
        if previous is None:
            merged_choices[choice["id"]] = choice
        else:
            previous["definitions"].extend(choice["definitions"])
            previous["members"] = sorted(set(previous["members"] + choice["members"]))

    files = sorted(source_path(path) for path in kconf.kconfig_filenames)
    json.dump(
        {
            "symbols": sorted(symbols, key=lambda symbol: symbol["name"]),
            "choices": sorted(merged_choices.values(), key=lambda choice: choice["id"]),
            "files": files,
            "warnings": kconf.warnings,
        },
        sys.stdout,
        separators=(",", ":"),
    )


if __name__ == "__main__":
    main()
`;

// src/python.ts
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
function executableOnPath(name, pathValue) {
  if (name.includes("/") || name.includes("\\")) return existsSync(name) ? resolve(name) : void 0;
  for (const directory of (pathValue ?? "").split(delimiter).filter(Boolean)) {
    const candidate = join(directory, name);
    if (existsSync(candidate)) return candidate;
  }
  return void 0;
}
function westInterpreter(env) {
  const west = executableOnPath("west", env["PATH"]);
  if (!west) return void 0;
  try {
    const firstLine = readFileSync(realpathSync(west), "utf8").split(/\r?\n/, 1)[0] ?? "";
    const shebang = firstLine.match(/^#!\s*(\S+)(?:\s+(.+))?$/);
    if (!shebang) return void 0;
    if (shebang[1]?.endsWith("/env") && shebang[2]) {
      return executableOnPath(shebang[2].trim().split(/\s+/, 1)[0], env["PATH"]);
    }
    return shebang[1] && existsSync(shebang[1]) ? shebang[1] : void 0;
  } catch {
    return void 0;
  }
}
function interpreterCandidates(env) {
  return [
    env["PYTHON_EXECUTABLE"],
    westInterpreter(env),
    "python3",
    "python"
  ].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
}
function semanticPython(zephyrRoot, env = process.env) {
  const kconfigDirectory = join(zephyrRoot, "scripts", "kconfig");
  const devicetreeDirectory = join(
    zephyrRoot,
    "scripts",
    "dts",
    "python-devicetree",
    "src"
  );
  const missing = [
    join(kconfigDirectory, "kconfiglib.py"),
    join(devicetreeDirectory, "devicetree", "edtlib.py")
  ].filter((path) => !existsSync(path));
  if (missing.length > 0) {
    throw new Error(
      "The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry."
    );
  }
  const candidates = interpreterCandidates(env);
  const probe = [
    "import sys",
    `sys.path.insert(0, ${JSON.stringify(kconfigDirectory)})`,
    `sys.path.insert(0, ${JSON.stringify(devicetreeDirectory)})`,
    "import kconfiglib",
    "import yaml",
    "from devicetree import edtlib",
    "assert sys.version_info >= (3, 10)"
  ].join("; ");
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-c", probe], {
      encoding: "utf8",
      env: { ...env, PYTHONDONTWRITEBYTECODE: "1" }
    });
    if (result.status === 0) return candidate;
  }
  throw new Error(
    "Semantic index creation requires Python 3.10 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry."
  );
}

// src/sources/kconfig.ts
var CACHE = /* @__PURE__ */ new Map();
function collectKconfig(root, moduleRoots = []) {
  const cacheKey = JSON.stringify([root, [...moduleRoots].sort()]);
  const cached = CACHE.get(cacheKey);
  if (cached) return cached;
  const library = join2(root, "scripts", "kconfig", "kconfiglib.py");
  if (!existsSync2(library)) {
    throw new Error(`The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.`);
  }
  const temporary = mkdtempSync(join2(tmpdir(), "zephyr-ai-kconfig-"));
  const exporter = join2(temporary, "kconfig-export.py");
  const buildDir = join2(temporary, "generated");
  try {
    writeFileSync(exporter, kconfig_export_default, { mode: 384 });
    const args = [exporter, "--zephyr", root, "--build-dir", buildDir];
    for (const moduleRoot of moduleRoots) args.push("--module", moduleRoot);
    const result = spawnSync2(semanticPython(root), args, {
      // Kconfiglib resolves `source "Kconfig.zephyr"` against the process
      // working directory even when the top-level Kconfig path is absolute.
      // Pinning cwd makes collection independent of the caller's directory.
      cwd: root,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }
    });
    if (result.status !== 0) {
      const detail = result.stderr.trim().split("\n").slice(-8).join("\n");
      throw new Error(`Zephyr Kconfiglib export failed.
${detail}`);
    }
    const parsed = JSON.parse(result.stdout);
    const collected = {
      symbols: parsed.symbols,
      choices: parsed.choices,
      filesScanned: parsed.files.length,
      warnings: parsed.warnings
    };
    CACHE.set(cacheKey, collected);
    return collected;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

// test/kconfig.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join3(process.cwd(), "..", "..", ".cache", "zephyr");
var INDEX = process.env.ZEPHYR_AI_INDEX ?? join3(process.cwd(), "..", "..", "index", "zephyr.db");
var RELEASE_TEST = process.env.ZEPHYR_AI_RELEASE_TEST === "1";
describe("parseKconfig", () => {
  it("parses a menuconfig with type, prompt, and help", () => {
    const { defs } = parseKconfig(
      [
        "menuconfig SPI",
        '	bool "Serial Peripheral Interface (SPI) bus drivers"',
        "	help",
        "	  Enable support for the SPI hardware bus.",
        ""
      ].join("\n"),
      "drivers/spi/Kconfig"
    );
    strictEqual(defs.length, 1);
    const spi = defs[0];
    strictEqual(spi.name, "SPI");
    strictEqual(spi.type, "bool");
    strictEqual(spi.prompt, "Serial Peripheral Interface (SPI) bus drivers");
    strictEqual(spi.help, "Enable support for the SPI hardware bus.");
    strictEqual(spi.isMenuconfig, true);
    strictEqual(spi.line, 1);
  });
  it("inherits conditions from enclosing if blocks", () => {
    const { defs } = parseKconfig(
      [
        "if SPI",
        "config SPI_ASYNC",
        '	bool "Asynchronous call support"',
        "	depends on MULTITHREADING",
        "	select POLL",
        "endif"
      ].join("\n"),
      "drivers/spi/Kconfig"
    );
    const async = defs[0];
    deepStrictEqual(async.depends, ["SPI", "MULTITHREADING"]);
    deepStrictEqual(async.selects, [{ value: "POLL" }]);
  });
  it("records conditional defaults in declaration order", () => {
    const { defs } = parseKconfig(
      [
        "config BT_LONG_WQ_STACK_SIZE",
        '	int "Long workqueue stack size."',
        "	default 4096 if NO_OPTIMIZATIONS",
        "	default 1400 if BT_ECC",
        "	default 1024"
      ].join("\n"),
      "subsys/bluetooth/host/Kconfig"
    );
    deepStrictEqual(defs[0].defaults, [
      { value: "4096", cond: "NO_OPTIMIZATIONS" },
      { value: "1400", cond: "BT_ECC" },
      { value: "1024" }
    ]);
    deepStrictEqual(defs[0].type, "int");
  });
  it("handles a separate prompt line with a condition", () => {
    const { defs } = parseKconfig(
      [
        "config BT_HCI_TX_STACK_SIZE",
        "	int",
        '	prompt "HCI Tx thread stack size" if BT_HCI_TX_STACK_SIZE_WITH_PROMPT',
        "	default 512 if BT_H4"
      ].join("\n"),
      "subsys/bluetooth/host/Kconfig"
    );
    const sym = defs[0];
    strictEqual(sym.type, "int");
    strictEqual(sym.prompt, "HCI Tx thread stack size");
    ok(sym.depends.includes("BT_HCI_TX_STACK_SIZE_WITH_PROMPT"));
  });
  it("expands def_bool into a type plus a default", () => {
    const { defs } = parseKconfig(
      ["config FOO", "	def_bool y if BAR"].join("\n"),
      "Kconfig"
    );
    strictEqual(defs[0].type, "bool");
    deepStrictEqual(defs[0].defaults, [{ value: "y", cond: "BAR" }]);
  });
  it("does not treat help text as keywords", () => {
    const { defs } = parseKconfig(
      [
        "config A",
        '	bool "A"',
        "	help",
        "	  config B is mentioned here",
        "	  select C is too",
        "config REAL",
        '	bool "Real"'
      ].join("\n"),
      "Kconfig"
    );
    strictEqual(defs.length, 2);
    deepStrictEqual(
      defs.map((d) => d.name),
      ["A", "REAL"]
    );
    strictEqual(defs[0].selects.length, 0);
  });
  it("captures menu titles and choice membership", () => {
    const { defs, choices } = parseKconfig(
      [
        'menu "Bluetooth"',
        "choice BT_ROLE",
        '	prompt "Role"',
        "config BT_PERIPHERAL",
        '	bool "Peripheral"',
        "config BT_CENTRAL",
        '	bool "Central"',
        "endchoice",
        "endmenu"
      ].join("\n"),
      "subsys/bluetooth/Kconfig"
    );
    deepStrictEqual(defs[0].menuPath, ["Bluetooth"]);
    strictEqual(defs[0].choice, "BT_ROLE");
    strictEqual(choices.length, 1);
    strictEqual(choices[0].prompt, "Role");
    deepStrictEqual(choices[0].options, ["BT_PERIPHERAL", "BT_CENTRAL"]);
  });
  it("strips comments but keeps hashes inside strings", () => {
    const { defs } = parseKconfig(
      ["config A", '	string "value # not a comment"  # a comment'].join("\n"),
      "Kconfig"
    );
    strictEqual(defs[0].prompt, "value # not a comment");
  });
  it("joins backslash continuations", () => {
    const { defs } = parseKconfig(
      ["config A", '	bool "A"', "	depends on B && \\", "		C"].join("\n"),
      "Kconfig"
    );
    deepStrictEqual(defs[0].depends, ["B && C"]);
  });
  it("parses ranges with and without conditions", () => {
    const { defs } = parseKconfig(
      [
        "config BT_LONG_WQ_PRIO",
        '	int "prio"',
        "	range 0 NUM_PREEMPT_PRIORITIES",
        "	range 1 9 if TUNED"
      ].join("\n"),
      "Kconfig"
    );
    deepStrictEqual(defs[0].ranges, [
      { low: "0", high: "NUM_PREEMPT_PRIORITIES" },
      { low: "1", high: "9", cond: "TUNED" }
    ]);
  });
});
describe("aggregate", () => {
  it("merges definitions across files and keeps documentation from the richest one", () => {
    const a = parseKconfig(
      ["config X", '	bool "X prompt"', "	help", "	  Real help."].join("\n"),
      "drivers/x/Kconfig"
    );
    const b = parseKconfig(["config X", "	default y if BOARD_FOO"].join("\n"), "boards/foo/Kconfig");
    const merged = aggregate([...a.defs, ...b.defs], [...a.choices, ...b.choices]);
    strictEqual(merged.length, 1);
    const x = merged[0];
    strictEqual(x.help, "Real help.");
    strictEqual(x.prompt, "X prompt");
    strictEqual(x.nDefs, 2);
    deepStrictEqual(
      x.definedIn.map((d) => d.file),
      ["drivers/x/Kconfig", "boards/foo/Kconfig"]
    );
  });
});
describe("symbolsInExpr", () => {
  it("extracts symbol references and ignores literals and preprocessor vars", () => {
    deepStrictEqual(symbolsInExpr("BT && !BT_CTLR || y").sort(), ["BT", "BT_CTLR"]);
    deepStrictEqual(symbolsInExpr("$(ARCH_DIR) && FOO"), ["FOO"]);
    deepStrictEqual(symbolsInExpr('"a string" && BAR'), ["BAR"]);
  });
});
describe("against the real Zephyr tree", () => {
  const spiKconfig = join3(ZEPHYR, "drivers", "spi", "Kconfig");
  let text = null;
  try {
    text = readFileSync2(spiKconfig, "utf8");
  } catch {
    text = null;
  }
  if (RELEASE_TEST && text === null) {
    throw new Error("Release tests require the pinned Zephyr tree; run npm run fetch:zephyr.");
  }
  it("parses drivers/spi/Kconfig", { skip: text === null && "Zephyr tree not fetched" }, () => {
    const { defs } = parseKconfig(text, "drivers/spi/Kconfig");
    const names = defs.map((d) => d.name);
    ok(names.includes("SPI"), "expected the SPI menuconfig");
    ok(names.includes("SPI_ASYNC"), "expected SPI_ASYNC");
    ok(names.includes("SPI_RTIO"), "expected SPI_RTIO");
    const rtio = defs.find((d) => d.name === "SPI_RTIO");
    ok(
      rtio.selects.some((s) => s.value === "RTIO"),
      "SPI_RTIO should select RTIO"
    );
    ok(rtio.depends.includes("SPI"), "SPI_RTIO is inside `if SPI`");
    const fallback = defs.find((d) => d.name === "SPI_RTIO_FALLBACK_MSGS");
    strictEqual(fallback.type, "int");
    deepStrictEqual(fallback.defaults, [{ value: "4" }]);
    ok(fallback.help.startsWith("When RTIO is used"), "help text should be captured");
  });
  it("evaluates the canonical source graph with Zephyr Kconfiglib", { skip: text === null && "Zephyr tree not fetched" }, () => {
    const semantic = collectKconfig(ZEPHYR);
    ok(semantic.symbols.some((symbol) => symbol.name === "SENSOR_LOG_LEVEL_DBG"));
    ok(semantic.symbols.every((symbol) => !symbol.name.includes("$(")));
    ok(
      semantic.symbols.some(
        (symbol) => symbol.definitions.some((definition) => definition.isConfigDefault)
      )
    );
    ok(
      semantic.symbols.every(
        (symbol) => symbol.definitions.every((definition) => !definition.file.startsWith("samples/"))
      )
    );
  });
  it("matches a deterministic semantic sample against the rebuilt SQLite projection", {
    skip: (text === null || !existsSync3(INDEX)) && "Zephyr tree or rebuilt index not available"
  }, () => {
    const semantic = collectKconfig(ZEPHYR);
    const selected = [...semantic.symbols].sort((left, right) => left.name.localeCompare(right.name)).filter((_symbol, index) => index % 317 === 0).slice(0, 64);
    const db = new DatabaseSync(INDEX, { readOnly: true });
    try {
      for (const symbol of selected) {
        const row = db.prepare(
          "SELECT id, type, has_prompt, n_defs FROM kconfig WHERE name = ?"
        ).get(symbol.name);
        ok(row, `index is missing sampled Kconfiglib symbol ${symbol.name}`);
        strictEqual(row.type, symbol.type);
        strictEqual(Number(row.has_prompt), symbol.hasPrompt ? 1 : 0);
        strictEqual(Number(row.n_defs), symbol.definitions.length);
        const defaults = Number(db.prepare(
          `SELECT COUNT(*) AS n FROM kconfig_default d
             JOIN kconfig_definition k ON k.id = d.definition_id
            WHERE k.symbol_id = ?`
        ).get(Number(row.id)).n);
        strictEqual(
          defaults,
          symbol.definitions.reduce((count, definition) => count + definition.defaults.length, 0),
          `${symbol.name} default projection differs from Kconfiglib`
        );
      }
    } finally {
      db.close();
    }
  });
});
