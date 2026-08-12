// test/tools.test.ts
import { deepStrictEqual } from "node:assert/strict";
import { describe, it } from "node:test";

// src/db.ts
import { DatabaseSync } from "node:sqlite";
function json(value, fallback) {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// src/tools/devicetree.ts
function dtsLiteral(value, type) {
  if (value === true) return "";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number") return `<${value}>`;
  if (Array.isArray(value)) {
    if (type === "string-array") return value.map((item) => `"${String(item)}"`).join(", ");
    if (type === "uint8-array") return `[${value.map((item) => Number(item).toString(16).padStart(2, "0")).join(" ")}]`;
    return `<${value.map(String).join(" ")}>`;
  }
  return null;
}
function skeletonProperty(property) {
  const fixed = json(property.const_value, void 0);
  const defaultValue = json(property.default_value, void 0);
  const rawEnums = json(property.enum_values, []);
  const enums = Array.isArray(rawEnums) ? rawEnums : [];
  const known = fixed ?? defaultValue ?? enums[0];
  const literal = dtsLiteral(known, property.type);
  if (literal !== null) {
    return literal === "" ? `        ${property.name};` : `        ${property.name} = ${literal};`;
  }
  switch (property.type) {
    case "boolean":
      return `        ${property.name};`;
    case "string":
    case "string-array":
      return `        ${property.name} = "replace-me";`;
    case "int":
    case "array":
      return `        ${property.name} = <0>;`;
    case "uint8-array":
      return `        ${property.name} = [00];`;
    case "phandle":
    case "phandles":
      return `        ${property.name} = <&replace_me>;`;
    case "phandle-array":
      return `        ${property.name} = <&replace_me 0>;`;
    case "path":
      return `        ${property.name} = &replace_me;`;
    default:
      return `        /* Required: ${property.name} (${property.type ?? "binding-specific value"}). */`;
  }
}

// test/tools.test.ts
describe("type-aware binding skeletons", () => {
  it("renders syntactically appropriate placeholders for every supported required type", () => {
    const property = (name, type) => ({
      name,
      type,
      required: 1,
      description: "",
      default_value: null,
      enum_values: null,
      const_value: null,
      deprecated: 0,
      specifier_space: null,
      inherited_from: null,
      child_level: 0,
      child_path: "",
      provenance: "{}",
      constraints: "{}"
    });
    deepStrictEqual(
      [
        property("flag", "boolean"),
        property("text", "string"),
        property("texts", "string-array"),
        property("number", "int"),
        property("numbers", "array"),
        property("bytes", "uint8-array"),
        property("handle", "phandle"),
        property("handles", "phandles"),
        property("specifiers", "phandle-array")
      ].map(skeletonProperty),
      [
        "        flag;",
        '        text = "replace-me";',
        '        texts = "replace-me";',
        "        number = <0>;",
        "        numbers = <0>;",
        "        bytes = [00];",
        "        handle = <&replace_me>;",
        "        handles = <&replace_me>;",
        "        specifiers = <&replace_me 0>;"
      ]
    );
  });
});
