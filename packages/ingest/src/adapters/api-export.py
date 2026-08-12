#!/usr/bin/env python3
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
    # ``discovered`` at the point where their candidate is encountered.
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
