import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/doxygen.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

// src/parsers/doxygen.ts
function stripCommentDecoration(raw) {
  return raw.split("\n").map((line) => line.replace(/^\s*\*\/?/, "").replace(/^ /, "")).join("\n").trim();
}
function parseDocComment(text) {
  const out = {
    detail: "",
    params: [],
    returns: [],
    retvals: [],
    deprecated: false
  };
  const lines = text.split("\n");
  const detailLines = [];
  let sink = {
    kind: "detail"
  };
  const append = (chunk) => {
    const text2 = chunk.trim();
    if (!text2) return;
    switch (sink.kind) {
      case "brief":
        out.brief = out.brief ? `${out.brief} ${text2}` : text2;
        break;
      case "param": {
        const p = out.params[sink.index];
        if (p) p.description = p.description ? `${p.description} ${text2}` : text2;
        break;
      }
      case "return": {
        const i = sink.index;
        out.returns[i] = out.returns[i] ? `${out.returns[i]} ${text2}` : text2;
        break;
      }
      case "retval": {
        const r = out.retvals[sink.index];
        if (r) r.description = r.description ? `${r.description} ${text2}` : text2;
        break;
      }
      default:
        detailLines.push(text2);
    }
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") {
      if (sink.kind === "brief") sink = { kind: "detail" };
      else if (sink.kind === "detail") detailLines.push("");
      continue;
    }
    if (line === "@{" || line === "@}") continue;
    const tag = line.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);
    if (!tag) {
      append(line);
      continue;
    }
    const [, nameRaw = "", restRaw = ""] = tag;
    const name = nameRaw.toLowerCase();
    const rest = restRaw.trim();
    switch (name) {
      case "brief":
      case "short":
        sink = { kind: "brief" };
        append(rest);
        break;
      case "param": {
        const m = rest.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);
        if (m) {
          const param = { name: m[2], description: (m[3] ?? "").trim() };
          if (m[1]) param.direction = m[1].replace(/\s+/g, "");
          out.params.push(param);
          sink = { kind: "param", index: out.params.length - 1 };
        }
        break;
      }
      case "return":
      case "returns":
      case "result":
        out.returns.push(rest);
        sink = { kind: "return", index: out.returns.length - 1 };
        break;
      case "retval": {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) {
          out.retvals.push({ value: m[1], description: (m[2] ?? "").trim() });
          sink = { kind: "retval", index: out.retvals.length - 1 };
        }
        break;
      }
      case "defgroup": {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) out.defgroup = { id: m[1], title: (m[2] ?? "").trim() };
        sink = { kind: "detail" };
        break;
      }
      case "addtogroup":
        out.addtogroup = rest.split(/\s+/)[0];
        sink = { kind: "detail" };
        break;
      case "ingroup":
        out.ingroup = rest.split(/\s+/)[0];
        sink = { kind: "detail" };
        break;
      case "since":
        out.since = rest;
        sink = { kind: "detail" };
        break;
      case "deprecated":
        out.deprecated = true;
        sink = { kind: "detail" };
        append(rest);
        break;
      case "note":
      case "warning":
      case "details":
      case "remark":
        sink = { kind: "detail" };
        append(`${nameRaw.toUpperCase()}: ${rest}`);
        break;
      case "version":
      case "name":
      case "file":
      case "cond":
      case "endcond":
      case "internal":
      case "endinternal":
        sink = { kind: "detail" };
        break;
      default:
        sink = { kind: "detail" };
        append(rest);
        break;
    }
  }
  out.detail = detailLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (out.brief) out.brief = cleanDoxyInline(out.brief);
  out.detail = cleanDoxyInline(out.detail);
  out.returns = out.returns.map(cleanDoxyInline);
  for (const p of out.params) p.description = cleanDoxyInline(p.description);
  for (const r of out.retvals) r.description = cleanDoxyInline(r.description);
  return out;
}
function cleanDoxyInline(text) {
  return text.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g, "$1").replace(/[@\\]ref\s+(\S+)/g, "$1").replace(/[@\\]kconfig\{([^}]*)\}/g, "$1").replace(/[@\\]f\$/g, "").replace(/[ \t]{2,}/g, " ").trim();
}
function groupEvents(comment) {
  const events = [];
  for (const rawLine of comment.split("\n")) {
    const line = rawLine.trim();
    const def = line.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);
    if (def) {
      events.push({ kind: "define", id: def[1], title: (def[2] ?? "").trim() });
      continue;
    }
    const add = line.match(/^[@\\]addtogroup\s+(\S+)/);
    if (add) {
      events.push({ kind: "add", id: add[1] });
      continue;
    }
    for (const m of line.matchAll(/[@\\]([{}])/g)) {
      events.push(m[1] === "{" ? { kind: "open" } : { kind: "close" });
    }
  }
  return events;
}
function normaliseSignature(sig) {
  return sig.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").replace(/\s*,\s*/g, ", ").trim();
}
var PUBLIC_PREFIXES = ["z_impl_"];
function publicName(name) {
  for (const prefix of PUBLIC_PREFIXES) {
    if (name.startsWith(prefix)) return name.slice(prefix.length);
  }
  return name;
}
function parseDeclaration(decl) {
  const text = decl.trim();
  if (!text) return null;
  const macro = text.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);
  if (macro) {
    const name = macro[1];
    const signature = normaliseSignature(text.split("\n")[0].replace(/\\$/, ""));
    return { kind: "macro", name, signature };
  }
  const typedefFn = text.match(
    /^typedef\s+[\s\S]*?\(\s*\*\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/
  );
  if (typedefFn) {
    return { kind: "typedef", name: typedefFn[1], signature: normaliseSignature(text) };
  }
  const typedefPlain = text.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);
  if (typedefPlain) {
    return { kind: "typedef", name: typedefPlain[1], signature: normaliseSignature(text) };
  }
  const record = text.match(/^(struct|union|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (record) {
    return {
      kind: record[1],
      name: record[2],
      signature: normaliseSignature(text.replace(/\{[\s\S]*$/, "").trim())
    };
  }
  const fn = text.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);
  if (fn && /^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(text)) {
    const name = fn[1];
    if (name === "if" || name === "for" || name === "while" || name === "switch") return null;
    return {
      kind: "function",
      name: publicName(name),
      signature: normaliseSignature(text.replace(/\s*\{[\s\S]*$/, "").replace(/;\s*$/, ""))
    };
  }
  return null;
}
function readDeclaration(lines, start) {
  let i = start;
  const SKIP = /^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || SKIP.test(line)) {
      i++;
      continue;
    }
    break;
  }
  if (i >= lines.length) return null;
  if (/^\s*#\s*define\b/.test(lines[i])) {
    const buf2 = [];
    let j = i;
    while (j < lines.length) {
      buf2.push(lines[j]);
      if (!lines[j].trimEnd().endsWith("\\")) break;
      j++;
    }
    return { text: buf2.join("\n"), line: i };
  }
  const buf = [];
  let depth = 0;
  for (let j = i; j < lines.length && j < i + 40; j++) {
    const line = lines[j];
    buf.push(line);
    for (const ch of line) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
    }
    if (depth <= 0 && (line.includes(";") || line.includes("{"))) break;
  }
  return { text: buf.join("\n"), line: i };
}
function parseHeader(text, header) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const symbols = [];
  const groups = [];
  const groupStack = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/\/\*\*|\/\*!/.test(line)) continue;
    const buf = [];
    let j = i;
    let closed = false;
    for (; j < lines.length; j++) {
      buf.push(lines[j]);
      if (lines[j].includes("*/")) {
        closed = true;
        break;
      }
    }
    if (!closed) continue;
    const commentRaw = buf.join("\n").replace(/^[\s\S]*?\/\*[*!]/, "").replace(/\*\/[\s\S]*$/, "");
    const comment = { text: stripCommentDecoration(commentRaw), endLine: j };
    const tags = parseDocComment(comment.text);
    const events = groupEvents(comment.text);
    if (events.length > 0) {
      let pending;
      for (const ev of events) {
        switch (ev.kind) {
          case "define": {
            const group2 = { id: ev.id, title: ev.title, header };
            const parent = tags.ingroup ?? groupStack[groupStack.length - 1];
            if (parent) group2.parent = parent;
            groups.push(group2);
            pending = ev.id;
            break;
          }
          case "add":
            pending = ev.id;
            break;
          case "open":
            groupStack.push(pending ?? groupStack[groupStack.length - 1] ?? "");
            pending = void 0;
            break;
          case "close":
            groupStack.pop();
            break;
        }
      }
      if (!tags.brief && tags.params.length === 0 && tags.retvals.length === 0) {
        i = j;
        continue;
      }
    }
    const decl = readDeclaration(lines, j + 1);
    if (!decl) {
      i = j;
      continue;
    }
    const parsed = parseDeclaration(decl.text);
    if (!parsed) {
      i = j;
      continue;
    }
    const group = tags.ingroup ?? groupStack.filter(Boolean)[groupStack.filter(Boolean).length - 1];
    const symbol = {
      name: parsed.name,
      kind: parsed.kind,
      signature: parsed.signature,
      params: tags.params,
      returns: tags.returns,
      retvals: tags.retvals,
      header,
      line: decl.line + 1,
      deprecated: tags.deprecated
    };
    if (tags.brief) symbol.brief = tags.brief;
    if (tags.detail) symbol.detail = tags.detail;
    if (group) symbol.group = group;
    if (tags.since) symbol.since = tags.since;
    symbols.push(symbol);
    i = j;
  }
  return { symbols, groups };
}

// test/doxygen.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), "..", "..", ".cache", "zephyr");
var GPIO_H = join(ZEPHYR, "include", "zephyr", "drivers", "gpio.h");
var KERNEL_H = join(ZEPHYR, "include", "zephyr", "kernel.h");
if (process.env.ZEPHYR_AI_RELEASE_TEST === "1" && !existsSync(GPIO_H)) {
  throw new Error("Release tests require the pinned Zephyr public headers.");
}
describe("parseDocComment", () => {
  it("ends the brief at the first blank line", () => {
    const tags = parseDocComment(
      ["@brief Put the current thread to sleep.", "", "This routine puts it to sleep."].join("\n")
    );
    strictEqual(tags.brief, "Put the current thread to sleep.");
    strictEqual(tags.detail, "This routine puts it to sleep.");
  });
  it("continues a brief across wrapped lines", () => {
    const tags = parseDocComment(["@brief Configure a single", "pin on the port."].join("\n"));
    strictEqual(tags.brief, "Configure a single pin on the port.");
  });
  it("parses params with and without direction", () => {
    const tags = parseDocComment(
      ["@param[in] port Pointer to device.", "@param pin Pin number."].join("\n")
    );
    deepStrictEqual(tags.params, [
      { name: "port", description: "Pointer to device.", direction: "in" },
      { name: "pin", description: "Pin number." }
    ]);
  });
  it("parses retval entries", () => {
    const tags = parseDocComment(
      ["@retval 0 If successful.", "@retval -EINVAL Invalid argument."].join("\n")
    );
    deepStrictEqual(tags.retvals, [
      { value: "0", description: "If successful." },
      { value: "-EINVAL", description: "Invalid argument." }
    ]);
  });
  it("strips inline markup from every text field", () => {
    const tags = parseDocComment(
      ["@brief Sleep for @a duration.", "@param x see @ref foo and @kconfig{CONFIG_BAR}"].join("\n")
    );
    strictEqual(tags.brief, "Sleep for duration.");
    strictEqual(tags.params[0].description, "see foo and CONFIG_BAR");
  });
  it("joins a multi-line param description", () => {
    const tags = parseDocComment(
      ["@param flags Flags for pin configuration:", "        'GPIO input/output flags'."].join("\n")
    );
    strictEqual(
      tags.params[0].description,
      "Flags for pin configuration: 'GPIO input/output flags'."
    );
  });
});
describe("cleanDoxyInline", () => {
  it("keeps the decorated word", () => {
    strictEqual(cleanDoxyInline("wait @a timeout ms"), "wait timeout ms");
    strictEqual(cleanDoxyInline("see @ref k_sleep"), "see k_sleep");
    strictEqual(cleanDoxyInline("needs @kconfig{CONFIG_BT}"), "needs CONFIG_BT");
  });
});
describe("groupEvents", () => {
  it("reads nested open/close pairs in one comment in order", () => {
    const events = groupEvents(
      [
        "@defgroup gpio_interface GPIO",
        "@ingroup io_interfaces",
        "@{",
        "",
        "@defgroup gpio_interface_ext Device-specific GPIO API extensions",
        "",
        "@{",
        "@}"
      ].join("\n")
    );
    deepStrictEqual(
      events.map((e) => e.kind === "define" ? `define:${e.id}` : e.kind),
      ["define:gpio_interface", "open", "define:gpio_interface_ext", "open", "close"]
    );
  });
});
describe("parseDeclaration", () => {
  it("recognises a syscall function and strips the z_impl_ prefix", () => {
    const d = parseDeclaration(
      "static inline int z_impl_gpio_pin_configure(const struct device *port, gpio_pin_t pin)"
    );
    strictEqual(d.kind, "function");
    strictEqual(d.name, "gpio_pin_configure");
  });
  it("recognises function-like and object-like macros", () => {
    strictEqual(parseDeclaration("#define DEVICE_DT_GET(node_id) ...").name, "DEVICE_DT_GET");
    strictEqual(parseDeclaration("#define K_FOREVER 1").kind, "macro");
  });
  it("recognises structs and enums", () => {
    strictEqual(parseDeclaration("struct gpio_dt_spec {").kind, "struct");
    strictEqual(parseDeclaration("enum gpio_int_mode {").name, "gpio_int_mode");
  });
  it("recognises a function-pointer typedef", () => {
    const d = parseDeclaration("typedef void (*gpio_callback_handler_t)(const struct device *p);");
    strictEqual(d.kind, "typedef");
    strictEqual(d.name, "gpio_callback_handler_t");
  });
});
describe("parseHeader", () => {
  it("attributes symbols to the enclosing group", () => {
    const { symbols, groups } = parseHeader(
      [
        "/**",
        " * @defgroup demo_interface Demo",
        " * @{",
        " */",
        "",
        "/**",
        " * @brief Do a thing.",
        " * @param x A number.",
        " * @retval 0 Success.",
        " */",
        "int demo_do(int x);",
        "",
        "/** @} */"
      ].join("\n"),
      "include/zephyr/demo.h"
    );
    strictEqual(groups.length, 1);
    strictEqual(groups[0].id, "demo_interface");
    strictEqual(symbols.length, 1);
    strictEqual(symbols[0].name, "demo_do");
    strictEqual(symbols[0].group, "demo_interface");
    strictEqual(symbols[0].brief, "Do a thing.");
  });
  it("skips preprocessor conditionals between comment and declaration", () => {
    const { symbols } = parseHeader(
      ["/**", " * @brief Thing.", " */", "#ifdef CONFIG_X", "int thing(void);"].join("\n"),
      "h.h"
    );
    strictEqual(symbols[0].name, "thing");
  });
});
describe("against the real Zephyr tree", {
  skip: !existsSync(GPIO_H) && "Zephyr tree not fetched"
}, () => {
  it("files gpio_pin_configure under gpio_interface, not the extension group", () => {
    const { symbols } = parseHeader(readFileSync(GPIO_H, "utf8"), "include/zephyr/drivers/gpio.h");
    const fn = symbols.find((s) => s.name === "gpio_pin_configure" && s.kind === "function");
    ok(fn, "gpio_pin_configure should be extracted");
    strictEqual(fn.group, "gpio_interface");
    strictEqual(fn.brief, "Configure a single pin.");
    deepStrictEqual(fn.params.map((p) => p.name), ["port", "pin", "flags"]);
    ok(fn.retvals.some((r) => r.value === "-ENOTSUP"));
  });
  it("extracts k_sleep with a brief separate from its detail", () => {
    const { symbols } = parseHeader(readFileSync(KERNEL_H, "utf8"), "include/zephyr/kernel.h");
    const fn = symbols.find((s) => s.name === "k_sleep");
    ok(fn, "k_sleep should be extracted");
    strictEqual(fn.brief, "Put the current thread to sleep.");
    ok(!fn.brief.includes("@a"), "inline markup should be stripped");
    strictEqual(fn.group, "thread_apis");
  });
});
