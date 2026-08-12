import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/kconfig.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

// test/kconfig.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), "..", "..", ".cache", "zephyr");
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
  const spiKconfig = join(ZEPHYR, "drivers", "spi", "Kconfig");
  let text = null;
  try {
    text = readFileSync(spiKconfig, "utf8");
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
});
