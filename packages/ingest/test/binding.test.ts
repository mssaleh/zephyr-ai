import { ok, strictEqual } from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  type BindingLoader,
  parseIncludes,
  resolveBinding,
  safeParseYaml,
} from '../src/parsers/binding.ts';
import { collectBindings } from '../src/sources/bindings.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const BINDINGS_DIR = join(ZEPHYR, 'dts', 'bindings');
const haveTree = existsSync(BINDINGS_DIR);
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !haveTree) {
  throw new Error('Release tests require Zephyr devicetree bindings; run npm run fetch:zephyr.');
}

/** Build an in-memory loader from a map of path -> YAML text. */
function mockLoader(files: Record<string, string>): BindingLoader {
  return {
    resolve: (name) => (name in files ? name : undefined),
    load: (path) => (files[path] !== undefined ? safeParseYaml(files[path]!) : null),
  };
}

describe('parseIncludes', () => {
  it('accepts a bare string', () => {
    strictEqual(parseIncludes('base.yaml').length, 1);
    strictEqual(parseIncludes('base.yaml')[0]!.name, 'base.yaml');
  });

  it('accepts a list of strings', () => {
    const specs = parseIncludes(['a.yaml', 'b.yaml']);
    strictEqual(specs.length, 2);
    strictEqual(specs[1]!.name, 'b.yaml');
  });

  it('accepts filter objects', () => {
    const specs = parseIncludes([
      { name: 'base.yaml', 'property-allowlist': ['status', 'reg'] },
      { name: 'gpio-controller.yaml' },
    ]);
    strictEqual(specs.length, 2);
    strictEqual(specs[0]!.name, 'base.yaml');
    strictEqual(specs[0]!.allowlist?.length, 2);
    strictEqual(specs[1]!.allowlist, undefined);
  });
});

describe('resolveBinding', () => {
  it('flattens a multi-level include chain', () => {
    const loader = mockLoader({
      'base.yaml': 'properties:\n  status:\n    type: string\n  reg:\n    type: array\n',
      'spi-controller.yaml':
        'include: base.yaml\nbus: spi\nproperties:\n  clock-frequency:\n    type: int\n    description: Clock rate\n',
      'st,stm32-spi-common.yaml':
        'include: spi-controller.yaml\nproperties:\n  cs-gpios:\n    type: phandle-array\n',
      'st,stm32-spi.yaml':
        'description: STM32 SPI controller\ncompatible: "st,stm32-spi"\ninclude: st,stm32-spi-common.yaml\n',
    });

    const b = resolveBinding('st,stm32-spi.yaml', loader)!;
    strictEqual(b.compatible, 'st,stm32-spi');
    strictEqual(b.bus, 'spi');

    const names = b.properties.map((p) => p.name);
    for (const expected of ['status', 'reg', 'clock-frequency', 'cs-gpios']) {
      ok(names.includes(expected), `expected inherited property ${expected}, got ${names}`);
    }

    const clock = b.properties.find((p) => p.name === 'clock-frequency')!;
    strictEqual(clock.type, 'int');
    strictEqual(clock.inheritedFrom, 'spi-controller.yaml');
  });

  it('applies property-allowlist', () => {
    const loader = mockLoader({
      'base.yaml':
        'properties:\n  status:\n    type: string\n  reg:\n    type: array\n  label:\n    type: string\n  extra:\n    type: int\n',
      'x.yaml':
        'compatible: "v,x"\ninclude:\n  - name: base.yaml\n    property-allowlist:\n      - status\n      - reg\n',
    });
    const b = resolveBinding('x.yaml', loader)!;
    const names = b.properties.map((p) => p.name).sort();
    strictEqual(names.join(','), 'reg,status');
  });

  it('applies property-blocklist', () => {
    const loader = mockLoader({
      'base.yaml': 'properties:\n  a:\n    type: int\n  b:\n    type: int\n',
      'x.yaml':
        'compatible: "v,x"\ninclude:\n  - name: base.yaml\n    property-blocklist:\n      - b\n',
    });
    const b = resolveBinding('x.yaml', loader)!;
    strictEqual(b.properties.map((p) => p.name).join(','), 'a');
  });

  it('lets a local declaration refine an inherited property without losing its description', () => {
    const loader = mockLoader({
      'base.yaml': 'properties:\n  reg:\n    type: array\n    description: Register space\n',
      'x.yaml': 'compatible: "v,x"\ninclude: base.yaml\nproperties:\n  reg:\n    required: true\n',
    });
    const reg = resolveBinding('x.yaml', loader)!.properties.find((p) => p.name === 'reg')!;
    strictEqual(reg.required, true);
    strictEqual(reg.type, 'array');
    strictEqual(reg.description, 'Register space');
  });

  it('resolves child-binding blocks', () => {
    const loader = mockLoader({
      'gpio-controller.yaml': 'properties:\n  "#gpio-cells":\n    type: int\n',
      'x.yaml': [
        'compatible: "v,x"',
        'child-binding:',
        '  description: Group of 32 pins',
        '  include: gpio-controller.yaml',
        '  properties:',
        '    reg:',
        '      type: int',
        '      required: true',
      ].join('\n'),
    });
    const b = resolveBinding('x.yaml', loader)!;
    strictEqual(b.children.length, 1);
    const child = b.children[0]!;
    strictEqual(child.description, 'Group of 32 pins');
    const names = child.properties.map((p) => p.name).sort();
    strictEqual(names.join(','), '#gpio-cells,reg');
  });

  it('survives include cycles', () => {
    const loader = mockLoader({
      'a.yaml': 'compatible: "v,a"\ninclude: b.yaml\nproperties:\n  pa:\n    type: int\n',
      'b.yaml': 'include: a.yaml\nproperties:\n  pb:\n    type: int\n',
    });
    const b = resolveBinding('a.yaml', loader)!;
    ok(b.properties.some((p) => p.name === 'pa'));
    ok(b.properties.some((p) => p.name === 'pb'));
  });

  it('captures specifier cells', () => {
    const loader = mockLoader({
      'x.yaml': 'compatible: "v,x"\ngpio-cells:\n  - pin\n  - flags\n',
    });
    const b = resolveBinding('x.yaml', loader)!;
    strictEqual(b.cells['gpio-cells']?.join(','), 'pin,flags');
  });
});

describe('against the real Zephyr tree', { skip: !haveTree && 'Zephyr tree not fetched' }, () => {
  it('resolves st,stm32-spi through its full include chain', () => {
    const { bindings } = collectBindings([BINDINGS_DIR]);
    const spi = bindings.find((b) => b.compatible === 'st,stm32-spi');
    ok(spi, 'st,stm32-spi binding should be found');

    const names = spi!.properties.map((p) => p.name);
    // These come from spi-controller.yaml and base.yaml, never from the file itself.
    for (const expected of ['cs-gpios', 'clock-frequency', 'reg', 'status', '#address-cells']) {
      ok(names.includes(expected), `expected ${expected} in resolved properties`);
    }
    strictEqual(spi!.bus, 'spi');

    const cs = spi!.properties.find((p) => p.name === 'cs-gpios')!;
    strictEqual(cs.type, 'phandle-array');
    ok(cs.inheritedFrom, 'cs-gpios is inherited, so provenance should be recorded');
  });

  it('indexes the expected number of bindings', () => {
    const { bindings, fragments } = collectBindings([BINDINGS_DIR]);
    ok(bindings.length > 3000, `expected >3000 compatibles, got ${bindings.length}`);
    ok(fragments > 100, `expected include-only fragments, got ${fragments}`);
  });

  it('resolves an espressif binding', () => {
    const { bindings } = collectBindings([BINDINGS_DIR]);
    const esp = bindings.find((b) => b.compatible === 'espressif,esp32-gpio');
    ok(esp, 'espressif,esp32-gpio should be found');
    ok(
      esp!.properties.some((p) => p.name === '#gpio-cells' || p.name === 'gpio-controller'),
      'GPIO controller properties should be inherited',
    );
  });

  it('indexes every declared compatible form through the official loader adapter', () => {
    const { bindings, report } = collectBindings([BINDINGS_DIR]);
    ok(bindings.some((binding) => binding.compatible === 'microchip,mpfs-mailbox'));
    strictEqual(report.errors.length, 0);
    strictEqual(report.discovered, report.indexed + report.intentionallyExcluded.length);
  });

  it('preserves recursively nested child bindings', () => {
    const { bindings } = collectBindings([BINDINGS_DIR]);
    const depth = (binding: (typeof bindings)[number]): number =>
      binding.children.length === 0
        ? 0
        : 1 + Math.max(...binding.children.map(depth));
    ok(Math.max(...bindings.map(depth)) > 1);
  });
});
