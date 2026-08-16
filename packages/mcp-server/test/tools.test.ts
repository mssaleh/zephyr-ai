import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { skeletonProperty } from '../src/tools/devicetree.ts';
import {
  clockNodeCandidates,
  evaluateDefines,
  parseDevicetree,
} from '../src/tools/devicetree-build.ts';

describe('type-aware binding skeletons', () => {
  it('renders syntactically appropriate placeholders for every supported required type', () => {
    const property = (name: string, type: string) => ({
      name,
      type,
      required: 1,
      description: '',
      default_value: null,
      enum_values: null,
      const_value: null,
      deprecated: 0,
      specifier_space: null,
      inherited_from: null,
      child_level: 0,
      child_path: '',
      provenance: '{}',
      constraints: '{}',
    });
    deepStrictEqual(
      [
        property('flag', 'boolean'),
        property('text', 'string'),
        property('texts', 'string-array'),
        property('number', 'int'),
        property('numbers', 'array'),
        property('bytes', 'uint8-array'),
        property('handle', 'phandle'),
        property('handles', 'phandles'),
        property('specifiers', 'phandle-array'),
      ].map(skeletonProperty),
      [
        '        flag;',
        '        text = "replace-me";',
        '        texts = "replace-me";',
        '        number = <0>;',
        '        numbers = <0>;',
        '        bytes = [00];',
        '        handle = <&replace_me>;',
        '        handles = <&replace_me>;',
        '        specifiers = <&replace_me 0>;',
      ],
    );
  });
});

describe('merged devicetree parsing', () => {
  it('merges a later fragment into the node it addresses by label', () => {
    // The whole reason this reads the merged tree: a fragment that enables a
    // node without restating `clocks` leaves the SoC default in place, and only
    // the merged view shows both halves.
    const tree = parseDevicetree(`
/ {
  soc {
    usb: usb@1 { clocks = < &rcc 0x6 0x1 >; status = "disabled"; };
  };
};
&usb { status = "okay"; };
`);
    const usb = tree.nodes.get('/soc/usb@1');
    ok(usb);
    strictEqual(usb.props.get('status')?.value, '"okay"');
    ok(usb.props.get('clocks')?.value.includes('0x6'), 'the inherited property must survive');
  });

  it('does not end a property at a semicolon inside a string or a cell array', () => {
    const tree = parseDevicetree('/ { a { label = "x;y"; cells = < 1 2 >; done; }; };');
    const node = tree.nodes.get('/a');
    strictEqual(node?.props.get('label')?.value, '"x;y"');
    strictEqual(node?.props.get('cells')?.value, '< 1 2 >');
    strictEqual(node?.props.get('done')?.value, '');
  });
});

describe('STM32 clock selectors', () => {
  it('resolves chained increments rather than assuming a literal', () => {
    // The headers define each selector as one more than the previous, on a base
    // in stm32_common_clocks.h. A copied table names the wrong clock the moment
    // upstream inserts one.
    const values = evaluateDefines([
      '#define STM32_SRC_LSI 0x003\n',
      '#define STM32_SRC_HSI (STM32_SRC_LSI + 1)\n' +
        '#define STM32_SRC_HSI48 (STM32_SRC_HSI + 1)\n' +
        '#define STM32_SRC_HSE (STM32_SRC_HSI48 + 1)\n' +
        '#define STM32_CLOCK_BUS_APB1 0x03c\n' +
        '#define STM32_PERIPH_BUS_MAX STM32_CLOCK_BUS_APB1\n',
    ]);
    strictEqual(values.get('STM32_SRC_HSI48'), 5);
    strictEqual(values.get('STM32_SRC_HSE'), 6);
    strictEqual(values.get('STM32_PERIPH_BUS_MAX'), 0x03c);
  });

  it('maps a selector to the node of the source, not of the output', () => {
    // A selector names a source and one of its outputs. The families disagree on
    // the labels, so the candidates are derived by dropping trailing segments
    // rather than tabulated: H7 labels PLL1 `pll`, U5 and WBA declare both, and
    // G4 has no number at all.
    ok(clockNodeCandidates('STM32_SRC_HSE').includes('clk_hse'));
    ok(clockNodeCandidates('STM32_SRC_PLL2_Q').includes('pll2'));
    ok(clockNodeCandidates('STM32_SRC_PLL1_Q').includes('pll'));
    ok(clockNodeCandidates('STM32_SRC_PLL_Q').includes('pll'));
    ok(clockNodeCandidates('STM32_SRC_PLLSAI2_POST_R').includes('pllsai2'));
    // Derived from the clock it is taken from, which is the node that can be off.
    ok(clockNodeCandidates('STM32_SRC_HSI_KER').includes('clk_hsi'));
  });
});
