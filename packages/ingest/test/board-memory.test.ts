import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cells,
  chosenLabels,
  evaluateExpression,
  resolveRegion,
  scanNodes,
} from '../src/parsers/devicetree-memory.ts';

const scan = (path: string, text: string) => ({ path, nodes: scanNodes(text) });

describe('evaluateExpression', () => {
  it('reads the literals and size macros devicetree uses', () => {
    strictEqual(evaluateExpression('0x34180400'), 0x34180400);
    strictEqual(evaluateExpression('DT_SIZE_K(511)'), 511 * 1024);
    strictEqual(evaluateExpression('(DT_SIZE_K(400) + DT_SIZE_K(624) + DT_SIZE_M(1))'), (400 + 624 + 1024) * 1024);
  });

  it('refuses anything it cannot evaluate rather than reading the rest', () => {
    // Dropping the unknown token and evaluating what is left produces a wrong
    // number, which is the one outcome this corpus must never have.
    strictEqual(evaluateExpression('CONFIG_SRAM_SIZE * 1024'), null);
    strictEqual(evaluateExpression('DT_SIZE_K(SOME_MACRO)'), null);
  });
});

describe('cells', () => {
  it('splits on whitespace outside parentheses', () => {
    deepStrictEqual(cells('0x0 (DT_SIZE_K(400) + DT_SIZE_K(624))'), [
      '0x0',
      '(DT_SIZE_K(400) + DT_SIZE_K(624))',
    ]);
  });
});

describe('scanNodes', () => {
  it('gives every node its absolute path and label', () => {
    const nodes = scanNodes(`
/ {
	axisram12@24000000 {
		ranges = <0x0 0x34000000 0x200000>;
		axisram2: memory@180400 {
			zephyr,memory-region = "AXISRAM2";
		};
	};
};
`);
    const labelled = nodes.find((node) => node.label === 'axisram2');
    ok(labelled);
    strictEqual(labelled.path, '/axisram12@24000000/memory@180400');
    const parent = nodes.find((node) => node.path === '/axisram12@24000000');
    ok(parent?.ranges);
  });
});

describe('resolveRegion', () => {
  // The shape that made this corpus worth building. The board names a label; the
  // label is declared in one file without a reg; the size arrives in a second
  // file that reopens the same node by path and never mentions the label; and
  // the address is an offset the parent's ranges translates.
  const soc = scan(
    'dts/arm/st/n6/stm32n6.dtsi',
    `
/ {
	axisram12@24000000 {
		reg = <0x24000000 0x01c00000>;
		ranges = <0x0 0x34000000 DT_SIZE_M(2)>;
		axisram2: memory@180400 {
			compatible = "mmio-sram";
		};
	};
};
`,
  );
  const variant = scan(
    'dts/arm/st/n6/stm32n657X0.dtsi',
    `
/ {
	axisram12@24000000 {
		memory@180400 {
			reg = <0x180400 DT_SIZE_K(511)>;
		};
	};
};
`,
  );

  it('merges a reg declared by path and translates through ranges', () => {
    // Chain order is the preprocessor's: what a file includes comes before the
    // file's own content, so the deepest include is first.
    const region = resolveRegion([soc, variant], 'axisram2');
    ok(typeof region !== 'string', `expected a region, got ${String(region)}`);
    strictEqual(region.address, 0x34180400);
    strictEqual(region.size, 511 * 1024);
    strictEqual(region.source, 'dts/arm/st/n6/stm32n657X0.dtsi');
  });

  it('reports a reason instead of a number when the label is absent', () => {
    strictEqual(resolveRegion([soc], 'sram0'), 'label-not-found');
  });

  it('reports a reason when the node carries no reg anywhere', () => {
    strictEqual(resolveRegion([soc], 'axisram2'), 'no-reg');
  });

  it('reports a reason when the reg cannot be read', () => {
    const file = scan('board.dts', '/ { sram0: memory@0 { reg = <0x0 CONFIG_SRAM_SIZE>; }; };');
    strictEqual(resolveRegion([file], 'sram0'), 'unreadable-reg');
  });

  it('lets the board override the SoC, as the build does', () => {
    // The board's own content comes last in the chain, so its `reg` wins. Read
    // the chain the other way round and every board that redeclares its memory
    // — any board with external RAM — reports the SoC's figure instead, with
    // nothing to show the answer came from the wrong file.
    const base = scan('soc.dtsi', '/ { sram0: memory@0 { reg = <0x20000000 0x10000>; }; };');
    const board = scan('board.dts', '&sram0 { reg = <0x20000000 0x20000>; };');
    const region = resolveRegion([base, board], 'sram0');
    ok(typeof region !== 'string');
    strictEqual(region.size, 0x20000);
  });
});

describe('chosenLabels', () => {
  it('reads the roles this corpus records', () => {
    const labels = chosenLabels(`
	chosen {
		zephyr,console = &usart1;
		zephyr,sram = &axisram2;
		zephyr,code-partition = &slot0_partition;
	};
`);
    strictEqual(labels.get('sram'), 'axisram2');
    strictEqual(labels.get('code-partition'), 'slot0_partition');
    strictEqual(labels.has('console'), false);
  });
});
