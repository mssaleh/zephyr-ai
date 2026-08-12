import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, it } from 'node:test';

import { aggregate, parseKconfig, symbolsInExpr } from '../src/parsers/kconfig.ts';
import { collectKconfig } from '../src/sources/kconfig.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const INDEX = process.env.ZEPHYR_AI_INDEX ?? join(process.cwd(), '..', '..', 'index', 'zephyr.db');
const RELEASE_TEST = process.env.ZEPHYR_AI_RELEASE_TEST === '1';

describe('parseKconfig', () => {
  it('parses a menuconfig with type, prompt, and help', () => {
    const { defs } = parseKconfig(
      [
        'menuconfig SPI',
        '\tbool "Serial Peripheral Interface (SPI) bus drivers"',
        '\thelp',
        '\t  Enable support for the SPI hardware bus.',
        '',
      ].join('\n'),
      'drivers/spi/Kconfig',
    );

    strictEqual(defs.length, 1);
    const spi = defs[0]!;
    strictEqual(spi.name, 'SPI');
    strictEqual(spi.type, 'bool');
    strictEqual(spi.prompt, 'Serial Peripheral Interface (SPI) bus drivers');
    strictEqual(spi.help, 'Enable support for the SPI hardware bus.');
    strictEqual(spi.isMenuconfig, true);
    strictEqual(spi.line, 1);
  });

  it('inherits conditions from enclosing if blocks', () => {
    const { defs } = parseKconfig(
      [
        'if SPI',
        'config SPI_ASYNC',
        '\tbool "Asynchronous call support"',
        '\tdepends on MULTITHREADING',
        '\tselect POLL',
        'endif',
      ].join('\n'),
      'drivers/spi/Kconfig',
    );

    const async = defs[0]!;
    deepStrictEqual(async.depends, ['SPI', 'MULTITHREADING']);
    deepStrictEqual(async.selects, [{ value: 'POLL' }]);
  });

  it('records conditional defaults in declaration order', () => {
    const { defs } = parseKconfig(
      [
        'config BT_LONG_WQ_STACK_SIZE',
        '\tint "Long workqueue stack size."',
        '\tdefault 4096 if NO_OPTIMIZATIONS',
        '\tdefault 1400 if BT_ECC',
        '\tdefault 1024',
      ].join('\n'),
      'subsys/bluetooth/host/Kconfig',
    );

    deepStrictEqual(defs[0]!.defaults, [
      { value: '4096', cond: 'NO_OPTIMIZATIONS' },
      { value: '1400', cond: 'BT_ECC' },
      { value: '1024' },
    ]);
    deepStrictEqual(defs[0]!.type, 'int');
  });

  it('handles a separate prompt line with a condition', () => {
    const { defs } = parseKconfig(
      [
        'config BT_HCI_TX_STACK_SIZE',
        '\tint',
        '\tprompt "HCI Tx thread stack size" if BT_HCI_TX_STACK_SIZE_WITH_PROMPT',
        '\tdefault 512 if BT_H4',
      ].join('\n'),
      'subsys/bluetooth/host/Kconfig',
    );

    const sym = defs[0]!;
    strictEqual(sym.type, 'int');
    strictEqual(sym.prompt, 'HCI Tx thread stack size');
    ok(sym.depends.includes('BT_HCI_TX_STACK_SIZE_WITH_PROMPT'));
  });

  it('expands def_bool into a type plus a default', () => {
    const { defs } = parseKconfig(
      ['config FOO', '\tdef_bool y if BAR'].join('\n'),
      'Kconfig',
    );
    strictEqual(defs[0]!.type, 'bool');
    deepStrictEqual(defs[0]!.defaults, [{ value: 'y', cond: 'BAR' }]);
  });

  it('does not treat help text as keywords', () => {
    const { defs } = parseKconfig(
      [
        'config A',
        '\tbool "A"',
        '\thelp',
        '\t  config B is mentioned here',
        '\t  select C is too',
        'config REAL',
        '\tbool "Real"',
      ].join('\n'),
      'Kconfig',
    );

    strictEqual(defs.length, 2);
    deepStrictEqual(
      defs.map((d) => d.name),
      ['A', 'REAL'],
    );
    strictEqual(defs[0]!.selects.length, 0);
  });

  it('captures menu titles and choice membership', () => {
    const { defs, choices } = parseKconfig(
      [
        'menu "Bluetooth"',
        'choice BT_ROLE',
        '\tprompt "Role"',
        'config BT_PERIPHERAL',
        '\tbool "Peripheral"',
        'config BT_CENTRAL',
        '\tbool "Central"',
        'endchoice',
        'endmenu',
      ].join('\n'),
      'subsys/bluetooth/Kconfig',
    );

    deepStrictEqual(defs[0]!.menuPath, ['Bluetooth']);
    strictEqual(defs[0]!.choice, 'BT_ROLE');
    strictEqual(choices.length, 1);
    strictEqual(choices[0]!.prompt, 'Role');
    deepStrictEqual(choices[0]!.options, ['BT_PERIPHERAL', 'BT_CENTRAL']);
  });

  it('strips comments but keeps hashes inside strings', () => {
    const { defs } = parseKconfig(
      ['config A', '\tstring "value # not a comment"  # a comment'].join('\n'),
      'Kconfig',
    );
    strictEqual(defs[0]!.prompt, 'value # not a comment');
  });

  it('joins backslash continuations', () => {
    const { defs } = parseKconfig(
      ['config A', '\tbool "A"', '\tdepends on B && \\', '\t\tC'].join('\n'),
      'Kconfig',
    );
    deepStrictEqual(defs[0]!.depends, ['B && C']);
  });

  it('parses ranges with and without conditions', () => {
    const { defs } = parseKconfig(
      [
        'config BT_LONG_WQ_PRIO',
        '\tint "prio"',
        '\trange 0 NUM_PREEMPT_PRIORITIES',
        '\trange 1 9 if TUNED',
      ].join('\n'),
      'Kconfig',
    );
    deepStrictEqual(defs[0]!.ranges, [
      { low: '0', high: 'NUM_PREEMPT_PRIORITIES' },
      { low: '1', high: '9', cond: 'TUNED' },
    ]);
  });
});

describe('aggregate', () => {
  it('merges definitions across files and keeps documentation from the richest one', () => {
    const a = parseKconfig(
      ['config X', '\tbool "X prompt"', '\thelp', '\t  Real help.'].join('\n'),
      'drivers/x/Kconfig',
    );
    const b = parseKconfig(['config X', '\tdefault y if BOARD_FOO'].join('\n'), 'boards/foo/Kconfig');

    const merged = aggregate([...a.defs, ...b.defs], [...a.choices, ...b.choices]);
    strictEqual(merged.length, 1);
    const x = merged[0]!;
    strictEqual(x.help, 'Real help.');
    strictEqual(x.prompt, 'X prompt');
    strictEqual(x.nDefs, 2);
    deepStrictEqual(
      x.definedIn.map((d) => d.file),
      ['drivers/x/Kconfig', 'boards/foo/Kconfig'],
    );
  });
});

describe('symbolsInExpr', () => {
  it('extracts symbol references and ignores literals and preprocessor vars', () => {
    deepStrictEqual(symbolsInExpr('BT && !BT_CTLR || y').sort(), ['BT', 'BT_CTLR']);
    deepStrictEqual(symbolsInExpr('$(ARCH_DIR) && FOO'), ['FOO']);
    deepStrictEqual(symbolsInExpr('"a string" && BAR'), ['BAR']);
  });
});

describe('against the real Zephyr tree', () => {
  const spiKconfig = join(ZEPHYR, 'drivers', 'spi', 'Kconfig');
  let text: string | null = null;
  try {
    text = readFileSync(spiKconfig, 'utf8');
  } catch {
    text = null;
  }

  if (RELEASE_TEST && text === null) {
    throw new Error('Release tests require the pinned Zephyr tree; run npm run fetch:zephyr.');
  }

  it('parses drivers/spi/Kconfig', { skip: text === null && 'Zephyr tree not fetched' }, () => {
    const { defs } = parseKconfig(text!, 'drivers/spi/Kconfig');
    const names = defs.map((d) => d.name);
    ok(names.includes('SPI'), 'expected the SPI menuconfig');
    ok(names.includes('SPI_ASYNC'), 'expected SPI_ASYNC');
    ok(names.includes('SPI_RTIO'), 'expected SPI_RTIO');

    const rtio = defs.find((d) => d.name === 'SPI_RTIO')!;
    ok(
      rtio.selects.some((s) => s.value === 'RTIO'),
      'SPI_RTIO should select RTIO',
    );
    ok(rtio.depends.includes('SPI'), 'SPI_RTIO is inside `if SPI`');

    const fallback = defs.find((d) => d.name === 'SPI_RTIO_FALLBACK_MSGS')!;
    strictEqual(fallback.type, 'int');
    deepStrictEqual(fallback.defaults, [{ value: '4' }]);
    ok(fallback.help!.startsWith('When RTIO is used'), 'help text should be captured');
  });

  it('evaluates the canonical source graph with Zephyr Kconfiglib', { skip: text === null && 'Zephyr tree not fetched' }, () => {
    const semantic = collectKconfig(ZEPHYR);
    ok(semantic.symbols.some((symbol) => symbol.name === 'SENSOR_LOG_LEVEL_DBG'));
    ok(semantic.symbols.every((symbol) => !symbol.name.includes('$(')));
    ok(
      semantic.symbols.some((symbol) =>
        symbol.definitions.some((definition) => definition.isConfigDefault),
      ),
    );
    ok(
      semantic.symbols.every((symbol) =>
        symbol.definitions.every((definition) => !definition.file.startsWith('samples/')),
      ),
    );
  });

  it('matches a deterministic semantic sample against the rebuilt SQLite projection', {
    skip: (text === null || !existsSync(INDEX)) && 'Zephyr tree or rebuilt index not available',
  }, () => {
    const semantic = collectKconfig(ZEPHYR);
    const selected = [...semantic.symbols]
      .sort((left, right) => left.name.localeCompare(right.name))
      .filter((_symbol, index) => index % 317 === 0)
      .slice(0, 64);
    const db = new DatabaseSync(INDEX, { readOnly: true });
    try {
      for (const symbol of selected) {
        const row = db.prepare(
          'SELECT id, type, has_prompt, n_defs FROM kconfig WHERE name = ?',
        ).get(symbol.name);
        ok(row, `index is missing sampled Kconfiglib symbol ${symbol.name}`);
        strictEqual(row.type, symbol.type);
        strictEqual(Number(row.has_prompt), symbol.hasPrompt ? 1 : 0);
        strictEqual(Number(row.n_defs), symbol.definitions.length);
        const defaults = Number(db.prepare(
          `SELECT COUNT(*) AS n FROM kconfig_default d
             JOIN kconfig_definition k ON k.id = d.definition_id
            WHERE k.symbol_id = ?`,
        ).get(Number(row.id))!.n);
        strictEqual(
          defaults,
          symbol.definitions.reduce((count, definition) => count + definition.defaults.length, 0),
          `${symbol.name} default projection differs from Kconfiglib`,
        );
      }
    } finally {
      db.close();
    }
  });
});
