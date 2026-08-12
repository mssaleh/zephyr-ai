import{createRequire}from'node:module';const require=createRequire(import.meta.url);

// test/doxygen.test.ts
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { existsSync as existsSync4, mkdtempSync as mkdtempSync2, mkdirSync, readFileSync as readFileSync3, rmSync as rmSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { join as join4 } from "node:path";
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

// src/sources/api.ts
import { existsSync as existsSync3, mkdtempSync, readFileSync as readFileSync2, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as join3 } from "node:path";
import { spawnSync as spawnSync2 } from "node:child_process";

// src/adapters/api-export.py
var api_export_default = `#!/usr/bin/env python3
"""Export Doxygen XML into stable, typed Zephyr public-API records.

Only Python's standard library is used. Doxygen owns C parsing; this adapter
only maps its XML model into the index contract.
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET


KINDS = {"function", "define", "typedef", "enum", "variable"}
KIND_MAP = {"define": "macro", "variable": "variable"}


def text(node):
    if node is None:
        return ""
    return " ".join("".join(node.itertext()).split())


def location(member, compound):
    loc = member.find("location")
    compound_loc = compound.find("location")
    path = (loc.get("file") if loc is not None else None) or (
        compound_loc.get("file") if compound_loc is not None else ""
    )
    try:
        line = int((loc.get("line") if loc is not None else "0") or "0")
    except ValueError:
        line = 0
    return path.replace(os.sep, "/"), line


def description(member, kind):
    return text(member.find(kind))


def parameter_docs(member):
    by_name = {}
    for item in member.findall(".//parameterlist[@kind='param']/parameteritem"):
        desc = text(item.find("parameterdescription"))
        for name_node in item.findall("./parameternamelist/parametername"):
            name = text(name_node)
            if name:
                record = {"name": name, "description": desc}
                direction = name_node.get("direction")
                if direction:
                    record["direction"] = direction
                by_name[name] = record

    result = []
    for param in member.findall("param"):
        name = text(param.find("declname")) or text(param.find("defname"))
        record = by_name.get(name, {"name": name, "description": ""})
        record["type"] = text(param.find("type"))
        result.append(record)
    return result


def simple_sections(member, kind):
    return [text(node) for node in member.findall(".//simplesect[@kind='%s']" % kind) if text(node)]


def signatures(member, kind, name):
    definition = text(member.find("definition"))
    args = text(member.find("argsstring"))
    if kind == "define":
        params = [text(node.find("defname")) for node in member.findall("param")]
        suffix = "(%s)" % ", ".join(params) if params else ""
        initializer = text(member.find("initializer"))
        return "#define %s%s%s" % (name, suffix, (" " + initializer) if initializer else "")
    return (definition + (" " + args if args else "")).strip()


def member_record(member, compound, compound_id, compound_kind, group=None):
    kind = member.get("kind", "")
    name = text(member.find("name"))
    header, line = location(member, compound)
    member_id = member.get("id", "")
    ingroup = member.find("ingroup")
    api_group = ingroup.get("refid") if ingroup is not None else group
    detail = description(member, "detaileddescription")
    xref_titles = [text(node).lower() for node in member.findall(".//xrefsect/xreftitle")]
    since = simple_sections(member, "version")
    record = {
        "name": name,
        "kind": KIND_MAP.get(kind, kind),
        "signature": signatures(member, kind, name),
        "brief": description(member, "briefdescription"),
        "detail": detail,
        "params": parameter_docs(member),
        "returns": simple_sections(member, "return"),
        "retvals": [],
        "group": api_group,
        "since": since[0] if since else None,
        "deprecated": any("deprecated" in title for title in xref_titles),
        "header": header,
        "line": line,
        "doxygenId": member_id,
        "compoundId": compound_id,
        "docAnchor": "%s.html#%s" % (compound_id, member_id) if member_id else "%s.html" % compound_id,
    }
    for item in member.findall(".//parameterlist[@kind='retval']/parameteritem"):
        desc = text(item.find("parameterdescription"))
        for value in item.findall("./parameternamelist/parametername"):
            record["retvals"].append({"value": text(value), "description": desc})
    return record


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--xml", required=True)
    args = parser.parse_args()
    index_path = os.path.join(args.xml, "index.xml")
    if not os.path.isfile(index_path):
        raise RuntimeError("Doxygen XML directory has no index.xml: %s" % args.xml)

    index = ET.parse(index_path).getroot()
    compound_refs = [(c.get("refid", ""), c.get("kind", "")) for c in index.findall("compound")]
    symbols_by_id = {}
    groups = []
    group_parents = {}
    discovered = 0
    excluded = []
    excluded_ids = set()
    errors = []

    def add_symbol(record):
        nonlocal discovered
        stable_id = record.get("doxygenId") or "{}:{}:{}:{}".format(
            record.get("compoundId", ""), record.get("kind", ""),
            record.get("name", ""), record.get("line", 0)
        )
        previous = symbols_by_id.get(stable_id)
        if previous is None:
            symbols_by_id[stable_id] = record
            discovered += 1
            return
        # The same Doxygen member can be referenced by file and group
        # compounds. Keep one stable record and prefer its group/richer prose.
        if not previous.get("group") and record.get("group"):
            previous["group"] = record["group"]
        for field in ("brief", "detail"):
            if len(record.get(field, "")) > len(previous.get(field, "")):
                previous[field] = record[field]

    for compound_id, indexed_kind in compound_refs:
        source = os.path.join(args.xml, compound_id + ".xml")
        if not os.path.isfile(source):
            discovered += 1
            errors.append({"path": source, "code": "missing-compound", "message": "Referenced by index.xml"})
            continue
        root = ET.parse(source).getroot()
        compound = root.find("compounddef")
        if compound is None:
            discovered += 1
            errors.append({"path": source, "code": "missing-compounddef", "message": "No compounddef element"})
            continue
        compound_kind = compound.get("kind", indexed_kind)
        compound_name = text(compound.find("compoundname"))
        group = compound_id if compound_kind == "group" else None
        if compound_kind == "group":
            header, _line = location(compound, compound)
            groups.append({
                "id": compound_id,
                "title": text(compound.find("title")) or compound_name,
                "parent": None,
                "header": header,
                "doxygenId": compound_id,
                "docAnchor": compound_id + ".html",
            })
            for child in compound.findall("innergroup"):
                if child.get("refid"):
                    group_parents[child.get("refid")] = compound_id

        # Structs and unions are public symbols in their own right.
        if compound_kind in ("struct", "union"):
            header, line = location(compound, compound)
            brief = description(compound, "briefdescription")
            detail = description(compound, "detaileddescription")
            add_symbol({
                "name": compound_name.split("::")[-1], "kind": compound_kind,
                "signature": compound_kind + " " + compound_name,
                "brief": brief, "detail": detail, "params": [], "returns": [], "retvals": [],
                "group": None, "since": None, "deprecated": False, "header": header, "line": line,
                "doxygenId": compound_id, "compoundId": compound_id, "docAnchor": compound_id + ".html",
            })

        for member in compound.findall(".//memberdef"):
            kind = member.get("kind", "")
            if kind not in KINDS:
                exclusion_id = member.get("id", "") or source + ":" + kind
                if exclusion_id not in excluded_ids:
                    excluded_ids.add(exclusion_id)
                    discovered += 1
                    excluded.append({
                        "id": exclusion_id,
                        "path": source,
                        "reason": "unsupported-doxygen-kind:" + (kind or "unknown"),
                    })
                continue
            record = member_record(member, compound, compound_id, compound_kind, group)
            if not record["name"]:
                discovered += 1
                errors.append({"path": source, "code": "unnamed-member", "message": "Doxygen member has no name"})
                continue
            add_symbol(record)
            if kind == "enum":
                for enum_value in member.findall("enumvalue"):
                    enum_record = member_record(enum_value, compound, compound_id, compound_kind, group)
                    enum_record["kind"] = "enumvalue"
                    enum_record["signature"] = enum_record["name"]
                    add_symbol(enum_record)

    for group in groups:
        group["parent"] = group_parents.get(group["id"])

    symbols = list(symbols_by_id.values())
    # Groups are first-class indexed records, so source accounting includes
    # them in the same way as symbols. Errors and exclusions already increment
    # \`\`discovered\`\` at the point where their candidate is encountered.
    discovered_with_groups = discovered + len(groups)
    indexed_with_groups = len(symbols) + len(groups)
    for item in excluded:
        item.pop("id", None)

    if errors:
        print(json.dumps({"report": {"discovered": discovered_with_groups, "indexed": indexed_with_groups,
            "intentionallyExcluded": excluded, "warnings": [], "errors": errors}}))
        return 2
    print(json.dumps({
        "symbols": symbols,
        "groups": groups,
        "mode": "doxygen-xml",
        "report": {"discovered": discovered_with_groups, "indexed": indexed_with_groups,
                   "intentionallyExcluded": excluded, "warnings": [], "errors": []},
    }, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("api-export: %s" % exc, file=sys.stderr)
        sys.exit(2)
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
function standardPython(env = process.env) {
  for (const candidate of interpreterCandidates(env)) {
    const result = spawnSync(candidate, ["-c", "import sys; assert sys.version_info >= (3, 10)"], {
      encoding: "utf8",
      env: { ...env, PYTHONDONTWRITEBYTECODE: "1" }
    });
    if (result.status === 0) return candidate;
  }
  throw new Error(
    "This index adapter requires Python 3.10 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry."
  );
}

// src/walk.ts
import { existsSync as existsSync2, readdirSync } from "node:fs";
import { join as join2, relative, sep } from "node:path";
var DEFAULT_SKIP = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".venv",
  "build",
  "twister-out"
]);
function* walk(root, opts = {}) {
  if (!existsSync2(root)) return;
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
      const abs = join2(dir, entry.name);
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

// src/sources/api.ts
function collectDoxygenXml(root, xmlDirectory) {
  if (!existsSync3(join3(xmlDirectory, "index.xml"))) {
    throw new Error(`The Doxygen XML directory has no index.xml: ${xmlDirectory}`);
  }
  const temporary = mkdtempSync(join3(tmpdir(), "zephyr-ai-api-"));
  const exporter = join3(temporary, "api-export.py");
  try {
    writeFileSync(exporter, api_export_default, { mode: 384 });
    const exported = spawnSync2(standardPython(), [exporter, "--xml", xmlDirectory], {
      encoding: "utf8",
      maxBuffer: 512 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }
    });
    if (exported.status !== 0) {
      throw new Error(
        `Doxygen XML export failed.
${exported.stderr.trim().split("\n").slice(-12).join("\n")}`
      );
    }
    const collected = JSON.parse(exported.stdout);
    collected.symbols = collected.symbols.map((symbol) => {
      const portable = symbol.header.replaceAll("\\", "/");
      const marker = "/include/zephyr/";
      const index = portable.lastIndexOf(marker);
      return {
        ...symbol,
        header: index >= 0 ? `include/zephyr/${portable.slice(index + marker.length)}` : portable
      };
    });
    return collected;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
function collectApi(root, xmlDirectory) {
  if (xmlDirectory) return collectDoxygenXml(root, xmlDirectory);
  const base = join3(root, "include", "zephyr");
  const symbols = [];
  const groups = [];
  const intentionallyExcluded = [];
  for (const rel of walk(base, {
    skipPrefixes: ["internal", "arch/arm/internal"],
    match: (name) => name.endsWith(".h")
  })) {
    let text;
    try {
      text = readFileSync2(join3(base, rel), "utf8");
    } catch (error) {
      throw new Error(
        `Cannot read public API header ${join3(base, rel)}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    const header = `include/zephyr/${rel}`;
    const parsed = parseHeader(text, header);
    for (const symbol of parsed.symbols) {
      if (symbol.kind === "function" && symbol.signature.includes("=")) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: "fallback-initializer-artifact"
        });
        continue;
      }
      const array = symbol.signature.indexOf("[");
      const call = symbol.signature.indexOf("(");
      if (symbol.kind === "function" && array >= 0 && (call < 0 || array < call)) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: "fallback-array-declarator-artifact"
        });
        continue;
      }
      if (symbol.kind === "macro" && /^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(symbol.signature)) {
        intentionallyExcluded.push({
          path: `${header}:${symbol.line}`,
          reason: "fallback-include-guard"
        });
        continue;
      }
      symbols.push(symbol);
    }
    groups.push(...parsed.groups);
  }
  symbols.sort((a, b) => a.name.localeCompare(b.name));
  const groupById = /* @__PURE__ */ new Map();
  for (const g of groups) {
    if (!groupById.has(g.id) || g.title && !groupById.get(g.id).title) groupById.set(g.id, g);
  }
  return {
    symbols,
    groups: [...groupById.values()],
    mode: "header-fallback",
    report: {
      // One additional discovered source unit records the explicitly excluded
      // private-header subtree. This keeps the report balanced without
      // pretending those implementation headers were parsed as public API.
      discovered: symbols.length + groupById.size + intentionallyExcluded.length + 1,
      indexed: symbols.length + groupById.size,
      intentionallyExcluded: [
        ...intentionallyExcluded,
        {
          path: "include/zephyr/internal",
          reason: "private-header-policy"
        }
      ],
      warnings: [
        {
          code: "header-fallback",
          message: "Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."
        }
      ],
      errors: []
    }
  };
}

// test/doxygen.test.ts
var ZEPHYR = process.env.ZEPHYR_BASE ?? join4(process.cwd(), "..", "..", ".cache", "zephyr");
var GPIO_H = join4(ZEPHYR, "include", "zephyr", "drivers", "gpio.h");
var KERNEL_H = join4(ZEPHYR, "include", "zephyr", "kernel.h");
if (process.env.ZEPHYR_AI_RELEASE_TEST === "1" && !existsSync4(GPIO_H)) {
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
describe("Doxygen XML adapter", () => {
  it("preserves structured functions, enum values, IDs, and documentation anchors", () => {
    const temporary = mkdtempSync2(join4(tmpdir2(), "zephyr-ai-doxygen-test-"));
    try {
      mkdirSync(join4(temporary, "xml"));
      writeFileSync2(
        join4(temporary, "xml", "index.xml"),
        '<doxygenindex><compound refid="group__gpio" kind="group"><name>GPIO</name></compound></doxygenindex>'
      );
      writeFileSync2(
        join4(temporary, "xml", "group__gpio.xml"),
        `<doxygen><compounddef id="group__gpio" kind="group">
          <compoundname>gpio_interface</compoundname><title>GPIO</title>
          <sectiondef>
            <memberdef kind="function" id="group__gpio_1a_fn">
              <type>int</type><definition>int gpio_demo</definition><argsstring>(const struct device * dev)</argsstring>
              <name>gpio_demo</name><briefdescription><para>Configure GPIO.</para></briefdescription>
              <detaileddescription><para>Detailed contract.</para><parameterlist kind="param"><parameteritem>
                <parameternamelist><parametername direction="in">dev</parametername></parameternamelist>
                <parameterdescription><para>GPIO device.</para></parameterdescription>
              </parameteritem></parameterlist><simplesect kind="return"><para>Zero on success.</para></simplesect></detaileddescription>
              <param><type>const struct device *</type><declname>dev</declname></param>
              <location file="include/zephyr/drivers/gpio.h" line="42"/>
            </memberdef>
            <memberdef kind="enum" id="group__gpio_1a_enum"><name>gpio_mode</name>
              <definition>enum gpio_mode</definition><location file="include/zephyr/drivers/gpio.h" line="50"/>
              <enumvalue id="group__gpio_1a_value"><name>GPIO_DEMO</name><initializer>= 1</initializer></enumvalue>
            </memberdef>
          </sectiondef><location file="include/zephyr/drivers/gpio.h"/>
        </compounddef></doxygen>`
      );
      const api = collectApi(temporary, join4(temporary, "xml"));
      strictEqual(api.mode, "doxygen-xml");
      const fn = api.symbols.find((symbol) => symbol.name === "gpio_demo");
      strictEqual(fn.signature, "int gpio_demo (const struct device * dev)");
      deepStrictEqual(fn.params[0], {
        name: "dev",
        description: "GPIO device.",
        direction: "in",
        type: "const struct device *"
      });
      strictEqual(fn.doxygenId, "group__gpio_1a_fn");
      strictEqual(fn.docAnchor, "group__gpio.html#group__gpio_1a_fn");
      ok(api.symbols.some((symbol) => symbol.name === "GPIO_DEMO" && symbol.kind === "enumvalue"));
      strictEqual(
        api.report.discovered,
        api.report.indexed + api.report.intentionallyExcluded.length + api.report.errors.length
      );
    } finally {
      rmSync2(temporary, { recursive: true, force: true });
    }
  });
});
describe("public-header fallback", () => {
  it("reason-codes array declarators instead of exposing their bound macro as a function", () => {
    const temporary = mkdtempSync2(join4(tmpdir2(), "zephyr-ai-header-test-"));
    try {
      mkdirSync(join4(temporary, "include", "zephyr"), { recursive: true });
      writeFileSync2(
        join4(temporary, "include", "zephyr", "fixture.h"),
        "/** @brief Fixed storage. */\nuint8_t bits[BIT(3)];\n"
      );
      const api = collectApi(temporary);
      ok(!api.symbols.some((symbol) => symbol.name === "BIT"));
      ok(api.report.intentionallyExcluded.some(
        (entry) => entry.reason === "fallback-array-declarator-artifact"
      ));
      strictEqual(
        api.report.discovered,
        api.report.indexed + api.report.intentionallyExcluded.length + api.report.errors.length
      );
    } finally {
      rmSync2(temporary, { recursive: true, force: true });
    }
  });
});
describe("against the real Zephyr tree", {
  skip: !existsSync4(GPIO_H) && "Zephyr tree not fetched"
}, () => {
  it("files gpio_pin_configure under gpio_interface, not the extension group", () => {
    const { symbols } = parseHeader(readFileSync3(GPIO_H, "utf8"), "include/zephyr/drivers/gpio.h");
    const fn = symbols.find((s) => s.name === "gpio_pin_configure" && s.kind === "function");
    ok(fn, "gpio_pin_configure should be extracted");
    strictEqual(fn.group, "gpio_interface");
    strictEqual(fn.brief, "Configure a single pin.");
    deepStrictEqual(fn.params.map((p) => p.name), ["port", "pin", "flags"]);
    ok(fn.retvals.some((r) => r.value === "-ENOTSUP"));
  });
  it("extracts k_sleep with a brief separate from its detail", () => {
    const { symbols } = parseHeader(readFileSync3(KERNEL_H, "utf8"), "include/zephyr/kernel.h");
    const fn = symbols.find((s) => s.name === "k_sleep");
    ok(fn, "k_sleep should be extracted");
    strictEqual(fn.brief, "Put the current thread to sleep.");
    ok(!fn.brief.includes("@a"), "inline markup should be stripped");
    strictEqual(fn.group, "thread_apis");
  });
});
