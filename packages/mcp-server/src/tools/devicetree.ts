import { type Index, type Row, clampLimit, json, snippet } from '../db.ts';
import { ToolError } from '../protocol.ts';
import {
  BATCH_MAX_CHARS,
  type BatchEntry,
  type ToolFactory,
  batchResult,
  batchSchema,
  catalogueMissText,
  joinSections,
  limitSchema,
  noResults,
  oneOrMany,
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

    const idx = index();
    const rows = idx.search(
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

    // Where each candidate is used, in one query rather than one per row. This
    // is the column that separates "a driver named after my peripheral" from "a
    // driver written for my peripheral", and picking the wrong one costs a build
    // that compiles and a device that does nothing.
    const usage = new Map<string, { boards: number; files: number; dirs: string[] }>();
    try {
      for (const row of idx.all(
        `SELECT compatible,
                COUNT(DISTINCT NULLIF(board, '')) AS boards,
                COUNT(DISTINCT file) AS files
           FROM dt_instance
          WHERE compatible IN (${rows.map(() => '?').join(',')})
          GROUP BY compatible`,
        ...rows.map((r) => String(r['compatible'])),
      )) {
        // SQLite has no dirname, so the directories come from the file paths in
        // JS rather than from a substr expression that would break on depth.
        const files = idx.all(
          "SELECT DISTINCT file FROM dt_instance WHERE compatible = ? AND board = '' LIMIT 200",
          String(row['compatible']),
        );
        const dirs = [
          ...new Set(
            files
              .map((f) => String(f['file']))
              .map((file) => (file.lastIndexOf('/') < 0 ? '' : file.slice(0, file.lastIndexOf('/'))))
              .filter(Boolean),
          ),
        ].sort();
        usage.set(String(row['compatible']), {
          boards: Number(row['boards'] ?? 0),
          files: Number(row['files'] ?? 0),
          dirs,
        });
      }
    } catch {
      // An index predating the instance table adds no usage column.
    }

    const results = rows.map((r) => {
      const compatible = String(r['compatible']);
      const used = usage.get(compatible);
      return {
        compatible,
        description: snippet(String(r['description'] ?? '').replace(/\n+/g, ' '), 200),
        bus: (r['bus'] as string) ?? null,
        onBus: (r['on_bus'] as string) ?? null,
        propertyCount: Number(r['n_props']),
        path: String(r['path']),
        boardsUsing: used?.boards ?? 0,
        filesUsing: used?.files ?? 0,
        socDirectories: used?.dirs ?? [],
      };
    });

    const text = results
      .map((r) => {
        const tags = [r.bus ? `bus: ${r.bus}` : '', r.onBus ? `on-bus: ${r.onBus}` : '']
          .filter(Boolean)
          .join(', ');
        // The directories of the SoC devicetree that names it are the silicon
        // signal and are comparable across vendors. The board count is not: a
        // board normally enables an SoC peripheral by label without repeating
        // the compatible, so it measures devicetree style rather than use.
        const where =
          r.socDirectories.length > 0
            ? `named under ${r.socDirectories.slice(0, 3).join(', ')}` +
              `${r.socDirectories.length > 3 ? ` +${r.socDirectories.length - 3} more` : ''}` +
              `${r.boardsUsing > 0 ? `, and in ${r.boardsUsing} board file(s)` : ''}`
            : r.boardsUsing > 0
              ? `named in ${r.boardsUsing} board file(s)`
              : r.filesUsing > 0
                ? `named in ${r.filesUsing} devicetree file(s)`
                : 'not named in any devicetree here';
        return `### \`${r.compatible}\`${tags ? `  (${tags})` : ''}\n${r.description || '_no description_'}\n_${r.propertyCount} properties · ${where} — ${r.path}_`;
      })
      .join('\n\n');

    return result(`Found ${results.length} binding(s) for "${query}".\n\n${text}`, {
      query,
      count: results.length,
      results,
    });
  },
});

/**
 * Every binding declaring this compatible, in a stable order.
 *
 * A device reachable over more than one bus has one binding per bus, and they do
 * not accept the same properties: of the compatibles with several bindings,
 * almost all differ, and the difference is usually `spi-max-frequency` — omit it
 * on a SPI node and the build fails. Returning whichever row the database
 * happened to store first answered an I2C question for a SPI part, silently.
 */
export function bindingVariants(idx: Index, compatible: string): Row[] {
  return idx.all(
    `SELECT id, compatible, path, description, bus, on_bus, cells, includes
       FROM dt_binding WHERE compatible = ? ORDER BY COALESCE(on_bus, ''), path`,
    compatible,
  );
}

/** Name the sibling bus variants, so picking one is a choice and not an accident. */
function variantNote(variants: Row[], compatible: string): string | undefined {
  if (variants.length < 2) return undefined;
  const buses = variants.map((v) => (v['on_bus'] ? String(v['on_bus']) : 'no bus'));
  return (
    `**This compatible has ${variants.length} bindings, one per bus: ` +
    `${buses.map((b) => `\`${b}\``).join(', ')}.** They do not require the same properties. ` +
    `The answer above is the \`${buses[0]}\` one; pass \`on_bus\` to get_binding to select ` +
    `another, e.g. \`{ "compatible": "${compatible}", "on_bus": "${buses[buses.length - 1]}" }\`.`
  );
}

function bindingMissText(idx: Index, compatible: string): string {
  const near = idx.search(
    `SELECT b.compatible FROM dt_fts f JOIN dt_binding b ON b.id = f.rowid
      WHERE dt_fts MATCH ? ORDER BY bm25(dt_fts, 10.0, 2.0, 1.0) LIMIT 8`,
    compatible.replace(/[,_-]/g, ' '),
    [],
    8,
  );
  return catalogueMissText(
    'Devicetree compatible',
    compatible,
    idx.meta['zephyr_version'] ?? 'unknown',
    near.map((r) => String(r['compatible'])),
    'Bindings from external modules and compatible declarations not represented by this catalogue may not be covered.',
  );
}

/**
 * What a batched lookup returns for one compatible: whether it is indexed, what
 * bus it sits on, and the properties a node must carry. The flattened property
 * table stays behind the singular form — one compatible can accept forty
 * properties, so fifty of them is not an answer anyone can read.
 */
/**
 * Where upstream actually instantiates a compatible, and on what silicon.
 *
 * A binding says a driver exists and describes what it accepts. It cannot say
 * whether the driver fits your part, and the gap is not academic: vendors reuse
 * peripheral *names* across incompatible register layouts far more often than
 * they reuse implementations. `st,stm32-digi-temp` is the name of the peripheral
 * an STM32N657 has, written against registers that part does not implement — a
 * node using it compiles, links, and silently does nothing, and `get_binding`
 * describes it accurately the whole way.
 *
 * Nothing proves incompatibility from the tree alone. What the tree does support
 * is the strongest signal available: "used by 6 boards, all stm32f4x/stm32l4x,
 * none on stm32n6x". Establishing that by hand meant grepping the SoC's CMSIS
 * header for the driver's register macros — about a dozen shell calls, and the
 * most expensive discovery of the study that produced this release.
 */
function instantiationNote(idx: Index, compatible: string): { text?: string; structured: Record<string, unknown> } {
  let rows: Record<string, unknown>[];
  try {
    rows = idx.all('SELECT file, board FROM dt_instance WHERE compatible = ? ORDER BY file', compatible);
  } catch {
    // An index predating the instance table simply has nothing to add.
    return { structured: {} };
  }
  if (rows.length === 0) {
    return {
      text:
        '**No devicetree in this tree uses this compatible.** There is no upstream example of it in ' +
        'use and no indication of which silicon it targets. Out-of-tree boards may still use it, so ' +
        'this is not proof it is wrong. Read the driver before adopting it.',
      structured: { usedIn: { files: 0, socDirectories: [], boards: [] } },
    };
  }

  const boards = [...new Set(rows.map((row) => String(row['board'])).filter(Boolean))].sort();
  // The directory a shared devicetree file sits in is the silicon grouping, and
  // it is exact. Deriving an SoC series from the boards instead is not
  // comparable across vendors, for the reason given in the closing note.
  const socDirectories = [
    ...new Set(
      rows
        .filter((row) => !row['board'])
        .map((row) => {
          const file = String(row['file']);
          const cut = file.lastIndexOf('/');
          return cut < 0 ? '' : file.slice(0, cut);
        })
        .filter(Boolean),
    ),
  ].sort();

  const parts: string[] = [];
  if (socDirectories.length > 0) {
    parts.push(
      '**Named in SoC and shared devicetree under**: ' +
        `${socDirectories.slice(0, 8).map((dir) => `\`${dir}\``).join(', ')}` +
        `${socDirectories.length > 8 ? `, and ${socDirectories.length - 8} more` : ''}. ` +
        'These directories indicate the silicon the driver targets. If your part is not among them, ' +
        'treat the driver as unverified on your part.',
    );
  }
  if (boards.length > 0) {
    parts.push(
      `**Declared directly in ${boards.length} board file${boards.length === 1 ? '' : 's'}**: ` +
        `${boards.slice(0, 8).map((name) => `\`${name}\``).join(', ')}` +
        `${boards.length > 8 ? `, and ${boards.length - 8} more` : ''}.`,
    );
  }
  // Without this, a zero board count reads as "nothing uses it", which for most
  // SoC peripherals is the opposite of the truth: a board enables one by
  // referencing its label (`&usart3 { status = "okay"; }`) and never repeats the
  // compatible. The count therefore tracks how a vendor writes devicetree rather
  // than how widely the driver is used, and only the directories above are
  // comparable between vendors.
  parts.push(
    '_A board normally enables an SoC peripheral by referencing its label, not by repeating the ' +
      'compatible, so a low board count does not mean the driver is unused. Use the devicetree ' +
      'directories instead. Where a driver is used indicates what it was written for; it does not ' +
      'guarantee compatibility. If your part is not covered, read the driver with get_source, note ' +
      'the registers it uses, and check they exist in your SoC vendor header, which get_source also ' +
      'reads from the HAL module._',
  );

  return {
    text: parts.join('\n\n'),
    structured: { usedIn: { files: rows.length, socDirectories, boards } },
  };
}

function bindingSummary(idx: Index, requested: string): BatchEntry {
  const compatible = requested.replace(/^["']|["']$/g, '');
  const variants = bindingVariants(idx, compatible);
  const binding = variants[0];
  if (!binding) {
    return {
      key: compatible,
      text: `### \`${compatible}\`\n\n${bindingMissText(idx, compatible)}`,
      structured: { compatible, found: false },
    };
  }

  const counts = idx.all(
    `SELECT required, child_level, name FROM dt_property_v WHERE binding_id = ?`,
    Number(binding['id']),
  );
  const own = counts.filter((p) => Number(p['child_level']) === 0 && !UNIVERSAL.has(String(p['name'])));
  const required = own.filter((p) => Number(p['required']) === 1).map((p) => String(p['name']));
  const optionalCount = own.length - required.length;
  const includes = json<string[]>(binding['includes'], []);
  const usage = instantiationNote(idx, compatible);

  return {
    key: compatible,
    text: joinSections([
      `### \`${compatible}\``,
      binding['description'] ? String(binding['description']).trim() : undefined,
      binding['bus'] ? `**Is a bus controller for:** \`${String(binding['bus'])}\`` : undefined,
      binding['on_bus']
        ? `**Must be a child of a** \`${String(binding['on_bus'])}\` **bus node**`
        : undefined,
      required.length > 0
        ? `**Required properties** (${required.length}): ${required.map((n) => `\`${n}\``).join(', ')}`
        : '**Required properties**: none beyond the universal ones.',
      usage.text,
      variantNote(variants, compatible),
      `_${optionalCount} optional propert${optionalCount === 1 ? 'y' : 'ies'} and the full flattened ` +
        `set are behind a single-compatible get_binding call. Binding file: \`${String(binding['path'])}\`._`,
      includes.length > 0 ? `_Inherits from: ${includes.map((i) => `\`${i}\``).join(', ')}_` : undefined,
    ]),
    structured: {
      compatible,
      found: true,
      path: binding['path'],
      description: binding['description'] ?? '',
      bus: binding['bus'] ?? null,
      onBus: binding['on_bus'] ?? null,
      required,
      optionalCount,
      includes,
      ...usage.structured,
    },
  };
}

export const getBinding: ToolFactory = (index) => ({
  name: 'get_binding',
  title: 'Get devicetree bindings',
  description:
    'Get the complete, flattened property set a devicetree compatible accepts, with each ' +
    "property's type, whether it is required, its allowed values, and which binding file it is " +
    'inherited from. Also reports which SoC and board devicetree files name the compatible, which ' +
    'indicates what silicon the driver was written for. Vendors reuse peripheral names across ' +
    'incompatible register layouts, and a node using the wrong one compiles and does nothing. ' +
    'Use this before writing or editing any devicetree node or overlay. Zephyr bindings inherit ' +
    'most of their properties through include: chains, so the binding file itself usually lists ' +
    'few of them: st,stm32-spi declares no properties in its own file and accepts about forty. ' +
    'Pass "compatibles" to check several at once, which returns each one\'s bus, required ' +
    'properties and include chain; the full property set requires a single-compatible call. A ' +
    'device reachable over more than one bus has one binding per bus, and they require different ' +
    'properties: a SPI node needs spi-max-frequency and an I2C node does not. Pass "on_bus" for ' +
    'the bus the node sits on.',
  inputSchema: {
    type: 'object',
    properties: {
      compatible: {
        type: 'string',
        description: 'The compatible string, e.g. "st,stm32-spi" or "bosch,bme280".',
      },
      compatibles: batchSchema(
        'Several compatibles in one call, e.g. ["st,lsm6dsl", "st,hts221"]. Returns a compact ' +
          'summary of each instead of the full flattened property table.',
      ),
      on_bus: {
        type: 'string',
        description:
          'Select the binding for the bus this node sits on, e.g. "spi" or "i2c". Only matters ' +
          'for a device with a binding per bus, where the required properties differ.',
      },
      include_common: {
        type: 'boolean',
        default: false,
        description:
          'Include universally available properties (status, compatible, power-domains, ...). ' +
          'Off by default to keep the answer focused on what is specific to this device.',
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const { values, batched } = oneOrMany(args, 'compatible', 'compatibles');
    const includeCommon = args['include_common'] === true;
    const idx = index();

    if (batched) {
      return batchResult(
        values.map((value) => bindingSummary(idx, value)),
        BATCH_MAX_CHARS,
      );
    }

    const compatible = values[0]!.replace(/^["']|["']$/g, '');
    const onBus = optionalString(args, 'on_bus');

    const variants = bindingVariants(idx, compatible);
    if (variants.length === 0) throw new ToolError(bindingMissText(idx, compatible));

    const binding = onBus
      ? variants.find((v) => String(v['on_bus'] ?? '') === onBus)
      : variants[0];
    if (!binding) {
      const available = variants.map((v) => (v['on_bus'] ? String(v['on_bus']) : 'no bus'));
      throw new ToolError(
        `"${compatible}" has no binding for a "${onBus}" bus. It is declared for: ` +
          `${available.map((b) => `"${b}"`).join(', ')}.`,
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
      onBus ? undefined : variantNote(variants, compatible),
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
      `_Binding file: \`${String(binding['path'])}\`${includeCommon ? '' : `. ${all.length - visible.length} universal properties hidden; pass include_common: true to see them_`}_`,
    ]);

    return result(text, {
      compatible,
      found: true,
      path: binding['path'],
      description: binding['description'] ?? '',
      bus: binding['bus'] ?? null,
      onBus: binding['on_bus'] ?? null,
      busVariants: variants.map((v) => ({
        onBus: v['on_bus'] ?? null,
        path: String(v['path']),
      })),
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
