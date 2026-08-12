import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/rst.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

// src/parsers/rst.ts
var ADORNMENT = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
function isAdornmentLine(line) {
  const trimmed = line.trimEnd();
  if (trimmed.length < 2) return null;
  const char = trimmed[0];
  if (!ADORNMENT.includes(char)) return null;
  for (const ch of trimmed) {
    if (ch !== char) return null;
  }
  return { char, length: trimmed.length };
}
function findHeadings(lines) {
  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    const rule = isAdornmentLine(lines[i]);
    if (!rule) continue;
    const prev = lines[i - 1];
    if (prev === void 0) continue;
    const text = prev.trim();
    if (text === "" || rule.length < text.length) continue;
    if (isAdornmentLine(prev)) {
      const over = isAdornmentLine(lines[i - 2] ?? "");
      if (over) continue;
      continue;
    }
    const overRule = isAdornmentLine(lines[i - 2] ?? "");
    const overlined = overRule !== null && overRule.char === rule.char;
    headings.push({ line: i - 1, text, char: rule.char, overlined });
  }
  return headings;
}
function assignLevels(headings) {
  const order = [];
  return headings.map((h) => {
    const key = h.overlined ? `over:${h.char}` : h.char;
    let idx = order.indexOf(key);
    if (idx === -1) {
      idx = order.length;
      order.push(key);
    }
    return idx;
  });
}
var LABEL_RE = /^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;
function cleanRst(text) {
  const lines = text.split("\n");
  const out = [];
  const emit = (text2) => out.push({ code: false, text: text2 });
  const DROP_DIRECTIVES = /* @__PURE__ */ new Set([
    "toctree",
    "figure",
    "image",
    "only",
    "contents",
    "highlight",
    "raw",
    "graphviz",
    "index",
    "rst-class",
    "sectionauthor",
    "zephyr:board",
    "zephyr:board-supported-hw",
    "zephyr:board-supported-runners",
    "zephyr:code-sample-category"
  ]);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (LABEL_RE.test(line)) continue;
    const directive = line.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);
    if (directive) {
      const [, indentRaw = "", nameRaw = "", argRaw = ""] = directive;
      const indent = indentRaw.length;
      const name = nameRaw.toLowerCase();
      const body = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const l = lines[j];
        if (l.trim() === "") {
          body.push("");
          continue;
        }
        const ind = l.match(/^\s*/)[0].length;
        if (ind <= indent) break;
        body.push(l);
      }
      if (DROP_DIRECTIVES.has(name)) {
        i = j - 1;
        continue;
      }
      if (name === "code-block" || name === "code" || name === "literalinclude") {
        const lang = argRaw.trim();
        const dedented = dedent(body).join("\n").replace(/^\n+|\n+$/g, "");
        if (dedented) {
          out.push({ code: true, text: `\`\`\`${lang}
${dedented}
\`\`\`` });
        }
        i = j - 1;
        continue;
      }
      if (name === "note" || name === "warning" || name === "important" || name === "tip") {
        const dedented = dedent(body).join("\n").trim();
        if (dedented) emit(`${nameRaw.toUpperCase()}: ${dedented}`);
        i = j - 1;
        continue;
      }
      if (argRaw.trim()) emit(argRaw.trim());
      for (const l of dedent(body)) emit(l);
      i = j - 1;
      continue;
    }
    if (/^\s*:[a-z-]+:\s*\S*\s*$/i.test(line) && !line.includes(" ")) continue;
    emit(line);
  }
  return out.map((seg) => seg.code ? seg.text : cleanInline(seg.text)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function dedent(lines) {
  const indents = lines.filter((l) => l.trim() !== "").map((l) => l.match(/^\s*/)[0].length);
  const min = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((l) => l.trim() === "" ? "" : l.slice(min));
}
function cleanInline(text) {
  return text.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi, "$1").replace(/:[a-z:+-]+:`([^`]*)`/gi, "$1").replace(/``([^`]+)``/g, "$1").replace(/`([^`]+)`__?/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\|([A-Za-z0-9_-]+)\|/g, "$1").replace(/::\s*$/gm, ":");
}
function parseRst(text) {
  const source = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const lines = source.split("\n");
  const labels = [];
  for (const line of lines) {
    const m = line.match(LABEL_RE);
    if (m) labels.push(m[1].trim());
  }
  const headings = findHeadings(lines);
  const levels = assignLevels(headings);
  if (headings.length === 0) {
    const body = cleanRst(source);
    return {
      title: "",
      labels,
      chunks: body ? [{ heading: "", headingPath: [], ord: 0, body }] : []
    };
  }
  const title = headings[0].text;
  const chunks = [];
  const pathStack = [];
  for (let h = 0; h < headings.length; h++) {
    const heading = headings[h];
    const level = levels[h];
    const next = headings[h + 1];
    while (pathStack.length > 0 && pathStack[pathStack.length - 1].level >= level) {
      pathStack.pop();
    }
    pathStack.push({ level, text: heading.text });
    const bodyStart = heading.line + 2;
    const bodyEnd = next ? next.line - (next.overlined ? 1 : 0) : lines.length;
    const raw = lines.slice(bodyStart, Math.max(bodyStart, bodyEnd)).join("\n");
    const body = cleanRst(raw);
    const anchor = findPrecedingLabel(lines, heading.line - (heading.overlined ? 1 : 0));
    if (body || h === 0) {
      chunks.push({
        ...anchor ? { anchor } : {},
        heading: heading.text,
        headingPath: pathStack.map((p) => p.text),
        ord: chunks.length,
        body
      });
    }
  }
  return { title, labels, chunks };
}
function findPrecedingLabel(lines, headingLine) {
  for (let i = headingLine - 1; i >= 0 && i >= headingLine - 4; i--) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const m = line.match(LABEL_RE);
    if (m) return m[1].trim();
    return void 0;
  }
  return void 0;
}

// src/sources/docs.ts
function docUrl(relPath, baseUrl) {
  const withoutExt = relPath.replace(/\.rst$/, "");
  const trimmed = withoutExt.startsWith("doc/") ? withoutExt.slice("doc/".length) : withoutExt;
  return `${baseUrl.replace(/\/?$/, "/")}${trimmed}.html`;
}

// test/rst.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), "..", "..", ".cache", "zephyr");
var SENSOR_RST = join(ZEPHYR, "doc", "hardware", "peripherals", "sensor", "index.rst");
if (process.env.ZEPHYR_AI_RELEASE_TEST === "1" && !existsSync(SENSOR_RST)) {
  throw new Error("Release tests require the pinned Zephyr documentation tree.");
}
describe("parseRst", () => {
  it("reads the title and splits sections by adornment level", () => {
    const doc = parseRst(
      [
        "Sensors",
        "#######",
        "",
        "Intro paragraph.",
        "",
        "Using Sensors",
        "*************",
        "",
        "Body of using.",
        "",
        "Channels",
        "========",
        "",
        "Body of channels."
      ].join("\n")
    );
    strictEqual(doc.title, "Sensors");
    deepStrictEqual(
      doc.chunks.map((c) => c.heading),
      ["Sensors", "Using Sensors", "Channels"]
    );
    deepStrictEqual(doc.chunks[2].headingPath, ["Sensors", "Using Sensors", "Channels"]);
    strictEqual(doc.chunks[1].body, "Body of using.");
  });
  it("attaches the preceding label as the section anchor", () => {
    const doc = parseRst(
      [
        ".. _sensor:",
        "",
        "Sensors",
        "#######",
        "",
        "Intro.",
        "",
        ".. _sensor-using:",
        "",
        "Using Sensors",
        "*************",
        "",
        "Body."
      ].join("\n")
    );
    strictEqual(doc.chunks[0].anchor, "sensor");
    strictEqual(doc.chunks[1].anchor, "sensor-using");
    deepStrictEqual(doc.labels, ["sensor", "sensor-using"]);
  });
  it("handles overlined headings", () => {
    const doc = parseRst(
      ["######", "Zephyr", "######", "", "Text.", "", "Part", "====", "", "More."].join("\n")
    );
    strictEqual(doc.title, "Zephyr");
    strictEqual(doc.chunks.length, 2);
    strictEqual(doc.chunks[0].body, "Text.");
  });
  it("keeps code blocks and drops toctrees", () => {
    const body = cleanRst(
      [
        ".. toctree::",
        "   :maxdepth: 1",
        "",
        "   foo",
        "   bar",
        "",
        "Configure it:",
        "",
        ".. code-block:: c",
        "",
        "   int rc = gpio_pin_configure_dt(&led, GPIO_OUTPUT);",
        "",
        "Done."
      ].join("\n")
    );
    ok(!body.includes("toctree"), "toctree directive should be dropped");
    ok(!body.includes("maxdepth"), "directive options should be dropped");
    ok(body.includes("```c"), "code blocks should be fenced");
    ok(body.includes("gpio_pin_configure_dt(&led, GPIO_OUTPUT);"), "code content preserved");
    ok(body.includes("Done."));
  });
  it("renders admonitions as labelled text", () => {
    const body = cleanRst([".. note::", "   Watch out for this."].join("\n"));
    strictEqual(body, "NOTE: Watch out for this.");
  });
  it("strips a leading byte order mark", () => {
    const doc = parseRst("\uFEFFTitle\n#####\n\nBody.\n");
    strictEqual(doc.title, "Title");
  });
});
describe("cleanInline", () => {
  it("reduces roles and literals to text", () => {
    strictEqual(cleanInline("See :ref:`sensor-channel`."), "See sensor-channel.");
    strictEqual(cleanInline("See :ref:`Channels <sensor-channel>`."), "See Channels.");
    strictEqual(cleanInline("Set ``CONFIG_SPI`` to y."), "Set CONFIG_SPI to y.");
    strictEqual(cleanInline("This is **bold** text."), "This is bold text.");
  });
});
describe("docUrl", () => {
  it("maps doc/ paths to the published site", () => {
    strictEqual(
      docUrl("doc/services/sensor/index.rst", "https://docs.zephyrproject.org/4.4.2/"),
      "https://docs.zephyrproject.org/4.4.2/services/sensor/index.html"
    );
  });
  it("keeps the repository path for board documentation", () => {
    strictEqual(
      docUrl("boards/st/nucleo_h743zi/doc/index.rst", "https://docs.zephyrproject.org/4.4.2/"),
      "https://docs.zephyrproject.org/4.4.2/boards/st/nucleo_h743zi/doc/index.html"
    );
  });
});
describe("against the real Zephyr tree", {
  skip: !existsSync(SENSOR_RST) && "Zephyr tree not fetched"
}, () => {
  it("parses the sensor documentation page", () => {
    const doc = parseRst(readFileSync(SENSOR_RST, "utf8"));
    strictEqual(doc.title, "Sensors");
    ok(doc.labels.includes("sensor"), "page label should be captured");
    ok(doc.chunks.length > 3, `expected several sections, got ${doc.chunks.length}`);
    ok(
      doc.chunks.some((c) => c.heading === "Using Sensors"),
      'expected the "Using Sensors" section'
    );
    ok(
      doc.chunks.every((c) => !c.body.includes(".. toctree::")),
      "no raw directives should survive"
    );
  });
});
