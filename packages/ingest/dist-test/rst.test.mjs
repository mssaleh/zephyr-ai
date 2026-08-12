import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/rst.test.ts
import { deepStrictEqual, match, ok, strictEqual } from "node:assert/strict";
import {
  existsSync as existsSync3,
  mkdtempSync,
  mkdirSync,
  readFileSync as readFileSync2,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join as join3 } from "node:path";
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
import { existsSync as existsSync2, lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join as join2, relative as relative2, resolve, sep as sep2 } from "node:path";

// src/walk.ts
import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
var DEFAULT_SKIP = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".venv",
  "build",
  "twister-out"
]);
function* walk(root, opts = {}) {
  if (!existsSync(root)) return;
  const skipDirs = opts.skipDirs ?? DEFAULT_SKIP;
  const skipPrefixes = opts.skipPrefixes ?? [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      throw new Error(
        `Failed to read source directory ${dir}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name);
      const rel = toPosix(relative(root, abs));
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        if (skipPrefixes.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
        stack.push(abs);
      } else if (entry.isFile()) {
        if (skipPrefixes.some((p) => rel.startsWith(`${p}/`))) continue;
        if (opts.match && !opts.match(entry.name)) continue;
        yield rel;
      } else if (entry.isSymbolicLink()) {
        throw new Error(`Refusing symbolic link in indexed source tree: ${abs}`);
      }
    }
  }
}
function toPosix(p) {
  return sep === "/" ? p : p.split(sep).join("/");
}

// src/sources/docs.ts
var DOC_SKIP = /* @__PURE__ */ new Set([
  "_build",
  "_static",
  "_scripts",
  "_extensions",
  "_templates",
  "_doxygen",
  "images",
  "node_modules",
  ".git"
]);
function docUrl(relPath, baseUrl) {
  const withoutExt = relPath.replace(/\.rst$/, "");
  const trimmed = withoutExt.startsWith("doc/") ? withoutExt.slice("doc/".length) : withoutExt;
  return `${baseUrl.replace(/\/?$/, "/")}${trimmed}.html`;
}
function titleFromPath(relPath) {
  const parts = relPath.split("/");
  const base = parts[parts.length - 1].replace(/\.rst$/, "");
  if (base !== "index") return base.replace(/[_-]/g, " ");
  return (parts[parts.length - 2] ?? base).replace(/[_-]/g, " ");
}
function areaOf(relPath) {
  if (relPath.startsWith("boards/")) return "boards";
  const parts = relPath.split("/");
  if (parts[0] === "doc") return parts.length > 2 ? parts[1] : "index";
  return parts[0] ?? "other";
}
function toctreeNavigation(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const entries = [];
  for (let index = 0; index < lines.length; index++) {
    const directive = lines[index].match(/^(\s*)\.\.\s+toctree::\s*$/);
    if (!directive) continue;
    const indent = directive[1].length;
    for (index += 1; index < lines.length; index++) {
      const line = lines[index];
      if (line.trim() === "") continue;
      const lineIndent = line.match(/^\s*/)[0].length;
      if (lineIndent <= indent) {
        index -= 1;
        break;
      }
      const value = line.trim();
      if (value.startsWith(":")) continue;
      const titled = value.match(/^(.+?)\s*<([^>]+)>$/);
      const target = (titled?.[2] ?? value).replace(/\.rst$/, "");
      const label = titled?.[1]?.trim() || target.split("/").filter(Boolean).at(-1)?.replace(/^index$/, target.split("/").at(-2) ?? "index").replace(/[_-]/g, " ");
      if (target && label) entries.push(`${label} (${target})`);
    }
  }
  return [...new Set(entries)];
}
function optionMap(lines) {
  return Object.fromEntries(
    lines.flatMap((line) => {
      const match2 = line.trim().match(/^:([a-z-]+):\s*(.*)$/i);
      return match2 ? [[match2[1], match2[2]]] : [];
    })
  );
}
function sliceIncluded(text, options) {
  let lines = text.replace(/\r\n?/g, "\n").split("\n");
  let start = 1;
  let end = lines.length;
  const startLine = Number(options["start-line"]);
  const endLine = Number(options["end-line"]);
  if (Number.isInteger(startLine) && startLine >= 1) start = startLine;
  if (Number.isInteger(endLine) && endLine >= start) end = Math.min(endLine, lines.length);
  const startMarker = options["start-after"] ?? options["start-at"];
  if (startMarker) {
    const index = lines.findIndex((line) => line.includes(startMarker));
    if (index < 0) throw new Error(`start marker not found: ${startMarker}`);
    start = index + (options["start-after"] ? 2 : 1);
  }
  const endMarker = options["end-before"] ?? options["end-at"];
  if (endMarker) {
    const index = lines.findIndex((line, lineIndex) => lineIndex >= start - 1 && line.includes(endMarker));
    if (index < 0) throw new Error(`end marker not found: ${endMarker}`);
    end = index + (options["end-at"] ? 1 : 0);
  }
  lines = lines.slice(start - 1, end);
  return { text: lines.join("\n"), start, end };
}
function preprocessRst(treeRoot, sourcePath, text, origins, stack = []) {
  const canonical = realpathSync(sourcePath);
  if (stack.includes(canonical)) {
    throw new Error(`include cycle: ${[...stack, canonical].map((path) => relative2(treeRoot, path)).join(" -> ")}`);
  }
  const nextStack = [...stack, canonical];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const directive = line.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);
    if (!directive) {
      out.push(line);
      continue;
    }
    const indent = directive[1].length;
    const kind = directive[2];
    const argument = directive[3].trim();
    const body = [];
    let cursor = index + 1;
    for (; cursor < lines.length; cursor++) {
      const candidate2 = lines[cursor];
      if (candidate2.trim() === "") {
        body.push(candidate2);
        continue;
      }
      if (candidate2.match(/^\s*/)[0].length <= indent) break;
      body.push(candidate2);
    }
    index = cursor - 1;
    if (kind === "only") {
      if (/\bhtml\b/.test(argument)) {
        const dedented = body.map((value) => value.trim() ? value.slice(Math.min(value.length, indent + 3)) : "");
        const nested = preprocessRst(treeRoot, canonical, dedented.join("\n"), origins, stack);
        out.push(...nested.split("\n").map((value) => `${" ".repeat(indent)}${value}`));
      }
      continue;
    }
    const options = optionMap(body);
    const candidate = resolve(dirname(canonical), argument);
    if (!existsSync2(candidate)) throw new Error(`include target not found: ${argument}`);
    if (lstatSync(candidate).isSymbolicLink()) {
      throw new Error(`include target is a symbolic link: ${argument}`);
    }
    const canonicalRoot = realpathSync(treeRoot);
    const canonicalCandidate = realpathSync(candidate);
    const escaped = relative2(canonicalRoot, canonicalCandidate);
    if (escaped === ".." || escaped.startsWith(`..${sep2}`)) {
      throw new Error(`include escapes the Zephyr tree: ${argument}`);
    }
    const included = sliceIncluded(readFileSync(canonicalCandidate, "utf8"), options);
    origins.push({
      path: relative2(canonicalRoot, canonicalCandidate).replaceAll(sep2, "/"),
      startLine: included.start,
      endLine: included.end,
      directive: kind
    });
    if (kind === "literalinclude") {
      const language = options["language"] ?? extname(candidate).slice(1);
      out.push(`${" ".repeat(indent)}.. code-block:: ${language}`, "", ...included.text.split("\n").map((value) => `${" ".repeat(indent + 3)}${value}`));
    } else {
      const nested = preprocessRst(canonicalRoot, canonicalCandidate, included.text, origins, nextStack);
      out.push(...nested.split("\n").map((value) => `${" ".repeat(indent)}${value}`));
    }
  }
  return out.join("\n");
}
function collectFrom(root, subdir, baseUrl, report) {
  const pages = [];
  const base = join2(root, subdir);
  for (const rel of walk(base, { skipDirs: DOC_SKIP, match: (name) => name.endsWith(".rst") })) {
    const relPath = `${subdir}/${rel}`;
    const absolute = join2(base, rel);
    report.discovered++;
    try {
      const source = readFileSync(absolute, "utf8");
      const origins = [{
        path: relPath,
        startLine: 1,
        endLine: source.split(/\r?\n/).length,
        directive: "page"
      }];
      const expanded = preprocessRst(root, absolute, source, origins);
      const parsed = parseRst(expanded);
      let chunks = parsed.chunks.filter((chunk) => chunk.body.trim() !== "").map((chunk, ord) => ({ ...chunk, ord }));
      if (chunks.length === 0) {
        const entries = toctreeNavigation(expanded);
        if (entries.length > 0) {
          const title = parsed.title || titleFromPath(relPath);
          chunks = [{
            heading: title,
            headingPath: [title],
            ord: 0,
            body: `Contained documentation pages:
${entries.map((entry) => `- ${entry}`).join("\n")}`
          }];
        }
      }
      if (chunks.length === 0) {
        report.intentionallyExcluded.push({ path: relPath, reason: "no-retrievable-content" });
        continue;
      }
      pages.push({
        path: relPath,
        url: docUrl(relPath, baseUrl),
        title: parsed.title || titleFromPath(relPath),
        area: areaOf(relPath),
        labels: parsed.labels,
        chunks,
        origins
      });
      report.indexed++;
    } catch (error) {
      report.errors.push({ path: relPath, code: "rst-preprocess", message: error.message });
    }
  }
  return pages;
}
function collectDocs(root, baseUrl) {
  const report = {
    discovered: 0,
    indexed: 0,
    intentionallyExcluded: [],
    warnings: [],
    errors: []
  };
  const pages = [
    ...collectFrom(root, "doc", baseUrl, report),
    ...collectFrom(root, "boards", baseUrl, report)
  ];
  if (report.errors.length > 0) {
    const detail = report.errors.slice(0, 12).map((error) => `${error.path}: ${error.message}`).join("\n");
    throw new Error(`Documentation preprocessing failed for ${report.errors.length} source(s).
${detail}`);
  }
  return { pages, report };
}

// test/rst.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join3(process.cwd(), "..", "..", ".cache", "zephyr");
var SENSOR_RST = join3(ZEPHYR, "doc", "hardware", "peripherals", "sensor", "index.rst");
if (process.env.ZEPHYR_AI_RELEASE_TEST === "1" && !existsSync3(SENSOR_RST)) {
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
describe("documentation preprocessing", () => {
  it("keeps toctree-only landing pages as searchable navigation summaries", () => {
    const root = mkdtempSync(join3(tmpdir(), "zephyr-ai-rst-nav-"));
    try {
      mkdirSync(join3(root, "doc"), { recursive: true });
      mkdirSync(join3(root, "boards"), { recursive: true });
      writeFileSync(
        join3(root, "doc", "index.rst"),
        "Build System\n============\n\n.. toctree::\n   :maxdepth: 1\n\n   CMake guide <cmake/index.rst>\n   flashing/index.rst\n"
      );
      const { pages, report } = collectDocs(root, "https://example.invalid/");
      strictEqual(report.indexed, 1);
      strictEqual(pages[0].chunks.length, 1);
      ok(pages[0].chunks[0].body.includes("CMake guide (cmake/index)"));
      ok(pages[0].chunks[0].body.includes("flashing (flashing/index)"));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("applies include line and marker ranges and records their origin", () => {
    const root = mkdtempSync(join3(tmpdir(), "zephyr-ai-rst-"));
    try {
      mkdirSync(join3(root, "doc"), { recursive: true });
      mkdirSync(join3(root, "boards"), { recursive: true });
      writeFileSync(join3(root, "doc", "fragment.txt"), "ignore\nSTART\nkept one\nkept two\nEND\nignore\n");
      writeFileSync(
        join3(root, "doc", "index.rst"),
        "Fixture\n-------\n\n.. literalinclude:: fragment.txt\n   :start-after: START\n   :end-before: END\n   :language: text\n"
      );
      const { pages } = collectDocs(root, "https://example.invalid/");
      const page = pages.find((item) => item.path === "doc/index.rst");
      const text = page.chunks.map((chunk) => chunk.body).join("\n");
      ok(text.includes("kept one"));
      ok(!text.includes("START"));
      ok(!text.includes("END"));
      ok(page.origins.some((origin) => origin.path === "doc/fragment.txt" && origin.startLine === 3));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("fails closed on cycles, missing includes, path traversal, and missing markers", () => {
    for (const [name, body, extra] of [
      ["cycle", ".. include:: other.rst\n", { "other.rst": ".. include:: index.rst\n" }],
      ["missing", ".. include:: absent.rst\n", {}],
      ["traversal", ".. include:: ../../outside.rst\n", {}],
      ["marker", ".. include:: fragment.txt\n   :start-after: ABSENT\n", { "fragment.txt": "text\n" }]
    ]) {
      const root = mkdtempSync(join3(tmpdir(), `zephyr-ai-rst-${name}-`));
      try {
        mkdirSync(join3(root, "doc"), { recursive: true });
        mkdirSync(join3(root, "boards"), { recursive: true });
        writeFileSync(join3(root, "doc", "index.rst"), `Fixture
-------

${body}`);
        for (const [path, text] of Object.entries(extra)) writeFileSync(join3(root, "doc", path), text);
        let failed = false;
        try {
          collectDocs(root, "https://example.invalid/");
        } catch {
          failed = true;
        }
        strictEqual(failed, true, `${name} should fail the corpus build`);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });
  it("rejects a literalinclude symlink even when its target is readable", () => {
    const root = mkdtempSync(join3(tmpdir(), "zephyr-ai-rst-symlink-"));
    try {
      mkdirSync(join3(root, "doc"), { recursive: true });
      mkdirSync(join3(root, "boards"), { recursive: true });
      const outside = join3(root, "outside.txt");
      writeFileSync(outside, "private text\n");
      symlinkSync(outside, join3(root, "doc", "linked.txt"));
      writeFileSync(
        join3(root, "doc", "index.rst"),
        "Fixture\n-------\n\n.. literalinclude:: linked.txt\n"
      );
      let message = "";
      try {
        collectDocs(root, "https://example.invalid/");
      } catch (error) {
        message = error.message;
      }
      match(message, /symbolic link/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("recursively resolves an include nested inside an HTML-only block", () => {
    const root = mkdtempSync(join3(tmpdir(), "zephyr-ai-rst-only-"));
    try {
      mkdirSync(join3(root, "doc"), { recursive: true });
      mkdirSync(join3(root, "boards"), { recursive: true });
      writeFileSync(join3(root, "doc", "fragment.rst"), "Nested include text.\n");
      writeFileSync(
        join3(root, "doc", "index.rst"),
        "Fixture\n-------\n\n.. only:: html\n\n   .. include:: fragment.rst\n"
      );
      const page = collectDocs(root, "https://example.invalid/").pages[0];
      ok(page.chunks.some((chunk) => chunk.body.includes("Nested include text.")));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
describe("against the real Zephyr tree", {
  skip: !existsSync3(SENSOR_RST) && "Zephyr tree not fetched"
}, () => {
  it("parses the sensor documentation page", () => {
    const doc = parseRst(readFileSync2(SENSOR_RST, "utf8"));
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
  it("indexes build documentation and resolves board includes", () => {
    const { pages, report } = collectDocs(ZEPHYR, "https://docs.zephyrproject.org/4.4.2/");
    ok(pages.some((page) => page.path.startsWith("doc/build/")));
    const esp = pages.find((page) => page.path === "boards/espressif/esp32s3_devkitc/doc/index.rst");
    ok(esp);
    const text = esp.chunks.map((chunk) => chunk.body).join("\n");
    ok(esp.chunks.some((chunk) => chunk.heading === "Simple Boot"));
    ok(text.includes("west espressif monitor"));
    ok(!text.includes("building-flashing.rst"));
    ok(pages.every((page) => page.chunks.every((chunk) => chunk.body.trim() !== "")));
    strictEqual(report.errors.length, 0);
  });
});
