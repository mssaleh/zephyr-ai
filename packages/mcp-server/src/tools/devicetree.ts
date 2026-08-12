import { clampLimit, json, snippet } from '../db.ts';
import {
  type ToolFactory,
  catalogueMiss,
  joinSections,
  limitSchema,
  noResults,
  optionalString,
  requireString,
  result,
} from './common.ts';

interface PropertyRow {
  name: string;
  type: string | null;
  required: number;
  description: string;
  default_value: string | null;
  enum_values: string | null;
  const_value: string | null;
  deprecated: number;
  specifier_space: string | null;
  inherited_from: string | null;
  child_level: number;
  child_path: string;
  provenance: string;
  constraints: string;
}

/** Devicetree properties that every node has; noise in a property listing. */
const UNIVERSAL = new Set([
  'compatible',
  'status',
  'interrupt-parent',
  'interrupts-extended',
  'wakeup-source',
  'zephyr,deferred-init',
  'zephyr,pm-device-runtime-auto',
  'zephyr,disabling-power-states',
  'power-domains',
  'power-domain-names',
  '#power-domain-cells',
  'label',
  'hwlocks',
  'hwlock-names',
  'mbox-names',
  'mboxes',
]);

function formatProperty(p: PropertyRow): string {
  const bits: string[] = [`\`${p.name}\``];
  if (p.type) bits.push(`*${p.type}*`);
  if (p.required) bits.push('**required**');
  if (p.deprecated) bits.push('_deprecated_');

  const extras: string[] = [];
  if (p.const_value !== null) extras.push(`const ${p.const_value}`);
  if (p.default_value !== null) extras.push(`default ${p.default_value}`);
  const rawEnums = json<unknown>(p.enum_values, []);
  const enums = Array.isArray(rawEnums) ? rawEnums : [];
  if (enums.length > 0) extras.push(`one of ${enums.map((e) => JSON.stringify(e)).join(', ')}`);
  if (p.specifier_space) extras.push(`specifier-space ${p.specifier_space}`);
  const constraints = json<Record<string, unknown>>(p.constraints, {});
  for (const [name, value] of Object.entries(constraints)) {
    extras.push(`${name} ${Array.isArray(value) ? value.map(String).join(', ') : JSON.stringify(value)}`);
  }

  const head = `- ${bits.join(' ')}${extras.length > 0 ? ` — ${extras.join('; ')}` : ''}`;
  const desc = p.description ? `\n  ${snippet(p.description.replace(/\n+/g, ' '), 240)}` : '';
  const provenance = json<{ declaredIn?: string; includeChain?: string[] }>(p.provenance, {});
  const origin = provenance.declaredIn
    ? `\n  _Declared in \`${provenance.declaredIn}\`${
        provenance.includeChain && provenance.includeChain.length > 1
          ? ` via ${provenance.includeChain.map((path) => `\`${path}\``).join(' → ')}`
          : ''
      }._`
    : '';
  return `${head}${desc}${origin}`;
}

function dtsLiteral(value: unknown, type: string | null): string | null {
  if (value === true) return '';
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === 'number') return `<${value}>`;
  if (Array.isArray(value)) {
    if (type === 'string-array') return value.map((item) => `"${String(item)}"`).join(', ');
    if (type === 'uint8-array') return `[${value.map((item) => Number(item).toString(16).padStart(2, '0')).join(' ')}]`;
    return `<${value.map(String).join(' ')}>`;
  }
  return null;
}

export function skeletonProperty(property: PropertyRow): string {
  const fixed = json<unknown>(property.const_value, undefined);
  const defaultValue = json<unknown>(property.default_value, undefined);
  const rawEnums = json<unknown>(property.enum_values, []);
  const enums = Array.isArray(rawEnums) ? rawEnums : [];
  const known = fixed ?? defaultValue ?? enums[0];
  const literal = dtsLiteral(known, property.type);
  if (literal !== null) {
    return literal === '' ? `        ${property.name};` : `        ${property.name} = ${literal};`;
  }
  switch (property.type) {
    case 'boolean':
      return `        ${property.name};`;
    case 'string':
    case 'string-array':
      return `        ${property.name} = "replace-me";`;
    case 'int':
    case 'array':
      return `        ${property.name} = <0>;`;
    case 'uint8-array':
      return `        ${property.name} = [00];`;
    case 'phandle':
    case 'phandles':
      return `        ${property.name} = <&replace_me>;`;
    case 'phandle-array':
      return `        ${property.name} = <&replace_me 0>;`;
    case 'path':
      return `        ${property.name} = &replace_me;`;
    default:
      return `        /* Required: ${property.name} (${property.type ?? 'binding-specific value'}). */`;
  }
}

export const searchBindings: ToolFactory = (index) => ({
  name: 'search_bindings',
  title: 'Search devicetree bindings',
  description:
    'Search Zephyr devicetree bindings by compatible string, hardware description, or property ' +
    'name. Use this to find the right compatible for a peripheral or sensor ("bosch bme280", ' +
    '"stm32 spi", "gpio led"), or to find which bindings accept a given property. Returns ' +
    'compatible strings; pass one to get_binding for the full property set.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Compatible fragment, hardware description, or property name.',
      },
      vendor: {
        type: 'string',
        description: 'Restrict to a devicetree vendor prefix, e.g. "st", "espressif", "nordic".',
      },
      bus: { type: 'string', description: 'Restrict to a bus, e.g. "spi", "i2c".' },
      limit: limitSchema(15),
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const query = requireString(args, 'query');
    const vendor = optionalString(args, 'vendor');
    const bus = optionalString(args, 'bus');
    const limit = clampLimit(args['limit'], 15);

    const filters: string[] = [];
    const params: unknown[] = [];
    if (vendor) {
      filters.push('AND b.vendor = ?');
      params.push(vendor);
    }
    if (bus) {
      filters.push('AND (b.bus = ? OR b.on_bus = ?)');
      params.push(bus, bus);
    }

    const rows = index().search(
      `SELECT b.compatible, b.description, b.bus, b.on_bus, b.n_props, b.path
         FROM dt_fts f JOIN dt_binding b ON b.id = f.rowid
        WHERE dt_fts MATCH ? ${filters.join(' ')}
        ORDER BY bm25(dt_fts, 10.0, 2.0, 1.0)
        LIMIT ?`,
      query,
      [...params, limit],
      limit,
    );

    if (rows.length === 0) {
      return noResults(
        'devicetree bindings',
        query,
        'Try the vendor name alone, the peripheral type ("temperature sensor"), or search_docs ' +
          'for the subsystem. Remember that out-of-tree drivers are not in this index.',
      );
    }

    const results = rows.map((r) => ({
      compatible: String(r['compatible']),
      description: snippet(String(r['description'] ?? '').replace(/\n+/g, ' '), 200),
      bus: (r['bus'] as string) ?? null,
      onBus: (r['on_bus'] as string) ?? null,
      propertyCount: Number(r['n_props']),
      path: String(r['path']),
    }));

    const text = results
      .map((r) => {
        const tags = [r.bus ? `bus: ${r.bus}` : '', r.onBus ? `on-bus: ${r.onBus}` : '']
          .filter(Boolean)
          .join(', ');
        return `### \`${r.compatible}\`${tags ? `  (${tags})` : ''}\n${r.description || '_no description_'}\n_${r.propertyCount} properties — ${r.path}_`;
      })
      .join('\n\n');

    return result(`Found ${results.length} binding(s) for "${query}".\n\n${text}`, {
      query,
      count: results.length,
      results,
    });
  },
});

export const getBinding: ToolFactory = (index) => ({
  name: 'get_binding',
  title: 'Get a devicetree binding',
  description:
    'Get the complete, flattened property set a devicetree compatible accepts, with each ' +
    "property's type, whether it is required, its allowed values, and which binding file it is " +
    'inherited from. Use this before writing or editing any devicetree node or overlay. This is ' +
    'the only reliable source: Zephyr bindings inherit most of their properties through include: ' +
    'chains, so a binding file usually lists almost nothing itself — st,stm32-spi declares zero ' +
    'properties in its own file but accepts forty.',
  inputSchema: {
    type: 'object',
    properties: {
      compatible: {
        type: 'string',
        description: 'The compatible string, e.g. "st,stm32-spi" or "bosch,bme280".',
      },
      include_common: {
        type: 'boolean',
        default: false,
        description:
          'Include universally available properties (status, compatible, power-domains, ...). ' +
          'Off by default to keep the answer focused on what is specific to this device.',
      },
    },
    required: ['compatible'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const compatible = requireString(args, 'compatible').replace(/^["']|["']$/g, '');
    const includeCommon = args['include_common'] === true;
    const idx = index();

    const binding = idx.get(
      'SELECT id, compatible, path, description, bus, on_bus, cells, includes FROM dt_binding WHERE compatible = ?',
      compatible,
    );

    if (!binding) {
      const near = idx.search(
        `SELECT b.compatible FROM dt_fts f JOIN dt_binding b ON b.id = f.rowid
          WHERE dt_fts MATCH ? ORDER BY bm25(dt_fts, 10.0, 2.0, 1.0) LIMIT 8`,
        compatible.replace(/[,_-]/g, ' '),
        [],
        8,
      );
      return catalogueMiss(
        'Devicetree compatible',
        compatible,
        idx.meta['zephyr_version'] ?? 'unknown',
        near.map((r) => String(r['compatible'])),
        'Bindings from external modules and compatible declarations not represented by this catalogue may not be covered.',
      );
    }

    const bindingId = Number(binding['id']);
    const all = idx.all(
      `SELECT name, type, required, description, default_value, enum_values, const_value,
              deprecated, specifier_space, inherited_from, child_level, child_path,
              provenance, constraints
         FROM dt_property_v WHERE binding_id = ? ORDER BY child_level, required DESC, name`,
      bindingId,
    ) as unknown as PropertyRow[];

    const visible = includeCommon ? all : all.filter((p) => !UNIVERSAL.has(p.name));
    const own = visible.filter((p) => p.child_level === 0);
    const required = own.filter((p) => p.required);
    const optional = own.filter((p) => !p.required);
    const childProps = visible.filter((p) => p.child_level > 0);

    const cells = json<Record<string, string[]>>(binding['cells'], {});
    const includes = json<string[]>(binding['includes'], []);

    // A skeleton node saves the model from guessing syntax for required properties.
    const skeleton = [
      '```dts',
      `example_node: node@0 {`,
      `        compatible = "${compatible}";`,
      ...required
        .filter((p) => p.name !== 'compatible')
        .map(skeletonProperty),
      `        status = "okay";`,
      `};`,
      '```',
    ].join('\n');

    const text = joinSections([
      `# \`${compatible}\``,
      binding['description'] ? String(binding['description']) : undefined,
      binding['bus'] || binding['on_bus']
        ? [
            binding['bus'] ? `**Is a bus controller for:** \`${String(binding['bus'])}\`` : '',
            binding['on_bus'] ? `**Must be a child of a** \`${String(binding['on_bus'])}\` **bus node**` : '',
          ]
            .filter(Boolean)
            .join('\n')
        : undefined,
      Object.keys(cells).length > 0
        ? `**Specifier cells**\n${Object.entries(cells)
            .map(([k, v]) => `- \`${k}\`: ${v.join(', ')}`)
            .join('\n')}`
        : undefined,
      required.length > 0
        ? `## Required properties (${required.length})\n${required.map(formatProperty).join('\n')}`
        : '## Required properties\n_None beyond the universal ones._',
      optional.length > 0
        ? `## Optional properties (${optional.length})\n${optional.map(formatProperty).join('\n')}`
        : undefined,
      childProps.length > 0
        ? `## Child node properties (${childProps.length})\nThis binding defines child nodes with their own properties:\n${childProps.map(formatProperty).join('\n')}`
        : undefined,
      `## Skeleton\n${skeleton}`,
      includes.length > 0
        ? `_Inherits from: ${includes.map((i) => `\`${i}\``).join(', ')}_`
        : undefined,
      `_Binding file: \`${String(binding['path'])}\`${includeCommon ? '' : ` — ${all.length - visible.length} universal properties hidden; pass include_common: true to see them_`}_`,
    ]);

    return result(text, {
      compatible,
      found: true,
      path: binding['path'],
      description: binding['description'] ?? '',
      bus: binding['bus'] ?? null,
      onBus: binding['on_bus'] ?? null,
      cells,
      includes,
      required: required.map((p) => ({
        name: p.name,
        type: p.type,
        description: p.description,
        provenance: json<Record<string, unknown>>(p.provenance, {}),
        constraints: json<Record<string, unknown>>(p.constraints, {}),
      })),
      optional: optional.map((p) => ({
        name: p.name,
        type: p.type,
        description: p.description,
        provenance: json<Record<string, unknown>>(p.provenance, {}),
        constraints: json<Record<string, unknown>>(p.constraints, {}),
      })),
      childProperties: childProps.map((p) => ({
        name: p.name,
        type: p.type,
        level: p.child_level,
        childPath: p.child_path,
        provenance: json<Record<string, unknown>>(p.provenance, {}),
        constraints: json<Record<string, unknown>>(p.constraints, {}),
      })),
    });
  },
});
