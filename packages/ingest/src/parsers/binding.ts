/**
 * Devicetree binding parser with `include:` resolution.
 *
 * This is the piece that makes bindings usable by an agent. `st,stm32-spi.yaml`
 * declares *no* properties: it includes `st,stm32-spi-common.yaml`, which reaches
 * `spi-controller.yaml`, which reaches `base.yaml`. Asking "what properties does
 * `st,stm32-spi` accept" cannot be answered from any single file, which is
 * exactly why models invent properties.
 *
 * So the include graph is flattened here, honouring `property-allowlist` /
 * `property-blocklist` filters (167 files use them) and `child-binding` nesting
 * (245 files), and every property records the binding it came from.
 */

import { parse as parseYaml } from 'yaml';

export interface BindingProperty {
  name: string;
  type?: string;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  const?: unknown;
  deprecated?: boolean;
  specifierSpace?: string;
  /** Binding path this property was inherited from, or undefined if declared locally. */
  inheritedFrom?: string;
}

export interface ResolvedBinding {
  path: string;
  compatible?: string;
  description?: string;
  title?: string;
  bus?: string | string[];
  onBus?: string;
  /** Specifier cell names, e.g. `{ "gpio-cells": ["pin", "flags"] }`. */
  cells: Record<string, string[]>;
  includes: string[];
  properties: BindingProperty[];
  /** Nested child-binding levels, index 0 being the direct child. */
  children: ResolvedBinding[];
  examples?: string;
}

interface IncludeSpec {
  name: string;
  allowlist?: string[];
  blocklist?: string[];
  childAllowlist?: string[];
  childBlocklist?: string[];
}

type RawBinding = Record<string, unknown>;

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  if (typeof v === 'string') return [v];
  return undefined;
}

/** Normalise the several shapes `include:` can take into a flat list of specs. */
export function parseIncludes(raw: unknown): IncludeSpec[] {
  if (!raw) return [];
  if (typeof raw === 'string') return [{ name: raw }];
  if (!Array.isArray(raw)) {
    const rec = asRecord(raw);
    return rec ? parseIncludes([rec]) : [];
  }

  const out: IncludeSpec[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      out.push({ name: item });
      continue;
    }
    const rec = asRecord(item);
    if (!rec || typeof rec['name'] !== 'string') continue;
    const childRec = asRecord(rec['child-binding']);
    out.push({
      name: rec['name'],
      allowlist: asStringArray(rec['property-allowlist']),
      blocklist: asStringArray(rec['property-blocklist']),
      childAllowlist: childRec ? asStringArray(childRec['property-allowlist']) : undefined,
      childBlocklist: childRec ? asStringArray(childRec['property-blocklist']) : undefined,
    });
  }
  return out;
}

function applyFilters(
  props: BindingProperty[],
  allowlist?: string[],
  blocklist?: string[],
): BindingProperty[] {
  let out = props;
  if (allowlist) {
    const allow = new Set(allowlist);
    out = out.filter((p) => allow.has(p.name));
  }
  if (blocklist) {
    const block = new Set(blocklist);
    out = out.filter((p) => !block.has(p.name));
  }
  return out;
}

/**
 * Read the properties a binding declares itself.
 *
 * `inheritedFrom` is deliberately left unset here and stamped when the binding
 * is pulled in through an `include:`, so a property is attributed to the file
 * that actually declares it rather than to whichever intermediate file relayed it.
 */
function readProperties(raw: unknown): BindingProperty[] {
  const rec = asRecord(raw);
  if (!rec) return [];
  const out: BindingProperty[] = [];

  for (const [name, value] of Object.entries(rec)) {
    // `"#gpio-cells":` with an empty body is valid and means "no constraints".
    const spec = asRecord(value) ?? {};
    const prop: BindingProperty = {
      name,
      required: spec['required'] === true,
    };
    if (typeof spec['type'] === 'string') prop.type = spec['type'];
    if (typeof spec['description'] === 'string') prop.description = spec['description'].trim();
    if ('default' in spec) prop.default = spec['default'];
    if (Array.isArray(spec['enum'])) prop.enum = spec['enum'];
    if ('const' in spec) prop.const = spec['const'];
    if (spec['deprecated'] === true) prop.deprecated = true;
    if (typeof spec['specifier-space'] === 'string') prop.specifierSpace = spec['specifier-space'];
    out.push(prop);
  }
  return out;
}

/**
 * Merge inherited properties with locally declared ones.
 *
 * A binding that redeclares an inherited property is refining it (usually just
 * adding `required: true` or a tighter description), so fields are merged
 * field-by-field with the local value winning where present.
 */
function mergeProperties(
  inherited: BindingProperty[],
  local: BindingProperty[],
): BindingProperty[] {
  const byName = new Map<string, BindingProperty>();
  for (const p of inherited) {
    const existing = byName.get(p.name);
    byName.set(p.name, existing ? { ...existing, ...stripUndefined(p) } : p);
  }
  for (const p of local) {
    const existing = byName.get(p.name);
    if (!existing) {
      byName.set(p.name, p);
      continue;
    }
    const merged: BindingProperty = { ...existing, ...stripUndefined(p) };
    // `required` is a logical OR: an include requiring it cannot be un-required.
    merged.required = existing.required || p.required;
    // Keep the richer description if the local one is absent.
    if (!p.description && existing.description) merged.description = existing.description;
    byName.set(p.name, merged);
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Attribute properties arriving through an `include:` to their declaring file.
 *
 * Only unattributed properties are stamped, so a property inherited through a
 * chain keeps the path of the file that first declared it rather than that of
 * the last file to pass it along.
 */
function stampOrigin(props: BindingProperty[], path: string): BindingProperty[] {
  return props.map((p) => (p.inheritedFrom ? p : { ...p, inheritedFrom: path }));
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

function readCells(raw: RawBinding): Record<string, string[]> {
  const cells: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.endsWith('-cells')) continue;
    const names = asStringArray(value);
    if (names) cells[key] = names;
  }
  return cells;
}

export interface BindingLoader {
  /** Resolve an include name (a bare filename) to a tree-relative path. */
  resolve(name: string): string | undefined;
  /** Read and YAML-parse a binding by tree-relative path. */
  load(path: string): RawBinding | null;
}

/**
 * Resolve one binding, flattening its include graph.
 *
 * `stack` guards against include cycles, which would otherwise recurse forever.
 */
export function resolveBinding(
  path: string,
  loader: BindingLoader,
  stack: string[] = [],
): ResolvedBinding | null {
  if (stack.includes(path)) return null; // cycle
  const raw = loader.load(path);
  if (!raw) return null;

  const nextStack = [...stack, path];
  const includes = parseIncludes(raw['include']);

  let inheritedProps: BindingProperty[] = [];
  let inheritedCells: Record<string, string[]> = {};
  let inheritedChildren: ResolvedBinding[] = [];
  let inheritedBus: string | string[] | undefined;
  let inheritedOnBus: string | undefined;
  const includePaths: string[] = [];

  for (const spec of includes) {
    const incPath = loader.resolve(spec.name);
    if (!incPath) continue;
    const inc = resolveBinding(incPath, loader, nextStack);
    if (!inc) continue;

    includePaths.push(incPath);
    inheritedProps = mergeProperties(
      inheritedProps,
      stampOrigin(applyFilters(inc.properties, spec.allowlist, spec.blocklist), inc.path),
    );
    inheritedCells = { ...inheritedCells, ...inc.cells };
    if (inc.bus !== undefined) inheritedBus = inc.bus;
    if (inc.onBus !== undefined) inheritedOnBus = inc.onBus;

    if (inc.children.length > 0) {
      const filteredChildren = inc.children.map((child, idx) => ({
        ...child,
        properties: stampOrigin(
          idx === 0
            ? applyFilters(child.properties, spec.childAllowlist, spec.childBlocklist)
            : child.properties,
          inc.path,
        ),
      }));
      inheritedChildren = mergeChildren(inheritedChildren, filteredChildren);
    }
  }

  const localProps = readProperties(raw['properties']);
  const properties = mergeProperties(inheritedProps, localProps);

  const localChild = asRecord(raw['child-binding']);
  let children = inheritedChildren;
  if (localChild) {
    const resolvedChild = resolveChildBinding(localChild, path, loader, nextStack);
    children = mergeChildren(inheritedChildren, [resolvedChild]);
  }

  const compatible = typeof raw['compatible'] === 'string' ? raw['compatible'] : undefined;
  const description =
    typeof raw['description'] === 'string' ? raw['description'].trim() : undefined;

  const result: ResolvedBinding = {
    path,
    compatible,
    description,
    cells: { ...inheritedCells, ...readCells(raw) },
    includes: includePaths,
    properties,
    children,
  };
  if (typeof raw['title'] === 'string') result.title = raw['title'];
  const bus = raw['bus'] ?? inheritedBus;
  if (bus !== undefined && (typeof bus === 'string' || Array.isArray(bus))) {
    result.bus = bus as string | string[];
  }
  const onBus = raw['on-bus'] ?? inheritedOnBus;
  if (typeof onBus === 'string') result.onBus = onBus;
  if (typeof raw['examples'] === 'string') result.examples = raw['examples'].trim();

  return result;
}

/** A `child-binding:` block is a binding in its own right, and can nest further. */
function resolveChildBinding(
  raw: RawBinding,
  parentPath: string,
  loader: BindingLoader,
  stack: string[],
): ResolvedBinding {
  const includes = parseIncludes(raw['include']);
  let inheritedProps: BindingProperty[] = [];
  let inheritedChildren: ResolvedBinding[] = [];
  const includePaths: string[] = [];

  for (const spec of includes) {
    const incPath = loader.resolve(spec.name);
    if (!incPath) continue;
    const inc = resolveBinding(incPath, loader, stack);
    if (!inc) continue;
    includePaths.push(incPath);
    inheritedProps = mergeProperties(
      inheritedProps,
      stampOrigin(applyFilters(inc.properties, spec.allowlist, spec.blocklist), inc.path),
    );
    if (inc.children.length > 0) inheritedChildren = mergeChildren(inheritedChildren, inc.children);
  }

  const properties = mergeProperties(inheritedProps, readProperties(raw['properties']));

  const nested = asRecord(raw['child-binding']);
  const children = nested
    ? mergeChildren(inheritedChildren, [resolveChildBinding(nested, parentPath, loader, stack)])
    : inheritedChildren;

  const out: ResolvedBinding = {
    path: `${parentPath}#child`,
    cells: readCells(raw),
    includes: includePaths,
    properties,
    children,
  };
  if (typeof raw['description'] === 'string') out.description = raw['description'].trim();
  return out;
}

function mergeChildren(a: ResolvedBinding[], b: ResolvedBinding[]): ResolvedBinding[] {
  const depth = Math.max(a.length, b.length);
  const out: ResolvedBinding[] = [];
  for (let i = 0; i < depth; i++) {
    const left = a[i];
    const right = b[i];
    if (!left) {
      out.push(right!);
      continue;
    }
    if (!right) {
      out.push(left);
      continue;
    }
    out.push({
      ...left,
      ...right,
      properties: mergeProperties(left.properties, right.properties),
      cells: { ...left.cells, ...right.cells },
      includes: [...new Set([...left.includes, ...right.includes])],
      children: [],
    });
  }
  return out;
}

/** Parse YAML defensively: a single malformed binding must not fail the build. */
export function safeParseYaml(text: string): RawBinding | null {
  try {
    const parsed = parseYaml(text, { logLevel: 'silent' });
    return asRecord(parsed);
  } catch {
    return null;
  }
}
