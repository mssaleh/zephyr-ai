import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { cleanInline, cleanRst, parseRst } from '../src/parsers/rst.ts';
import { docUrl } from '../src/sources/docs.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const SENSOR_RST = join(ZEPHYR, 'doc', 'hardware', 'peripherals', 'sensor', 'index.rst');
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !existsSync(SENSOR_RST)) {
  throw new Error('Release tests require the pinned Zephyr documentation tree.');
}

describe('parseRst', () => {
  it('reads the title and splits sections by adornment level', () => {
    const doc = parseRst(
      [
        'Sensors',
        '#######',
        '',
        'Intro paragraph.',
        '',
        'Using Sensors',
        '*************',
        '',
        'Body of using.',
        '',
        'Channels',
        '========',
        '',
        'Body of channels.',
      ].join('\n'),
    );

    strictEqual(doc.title, 'Sensors');
    deepStrictEqual(
      doc.chunks.map((c) => c.heading),
      ['Sensors', 'Using Sensors', 'Channels'],
    );
    deepStrictEqual(doc.chunks[2]!.headingPath, ['Sensors', 'Using Sensors', 'Channels']);
    strictEqual(doc.chunks[1]!.body, 'Body of using.');
  });

  it('attaches the preceding label as the section anchor', () => {
    const doc = parseRst(
      [
        '.. _sensor:',
        '',
        'Sensors',
        '#######',
        '',
        'Intro.',
        '',
        '.. _sensor-using:',
        '',
        'Using Sensors',
        '*************',
        '',
        'Body.',
      ].join('\n'),
    );
    strictEqual(doc.chunks[0]!.anchor, 'sensor');
    strictEqual(doc.chunks[1]!.anchor, 'sensor-using');
    deepStrictEqual(doc.labels, ['sensor', 'sensor-using']);
  });

  it('handles overlined headings', () => {
    const doc = parseRst(
      ['######', 'Zephyr', '######', '', 'Text.', '', 'Part', '====', '', 'More.'].join('\n'),
    );
    strictEqual(doc.title, 'Zephyr');
    strictEqual(doc.chunks.length, 2);
    strictEqual(doc.chunks[0]!.body, 'Text.');
  });

  it('keeps code blocks and drops toctrees', () => {
    const body = cleanRst(
      [
        '.. toctree::',
        '   :maxdepth: 1',
        '',
        '   foo',
        '   bar',
        '',
        'Configure it:',
        '',
        '.. code-block:: c',
        '',
        '   int rc = gpio_pin_configure_dt(&led, GPIO_OUTPUT);',
        '',
        'Done.',
      ].join('\n'),
    );

    ok(!body.includes('toctree'), 'toctree directive should be dropped');
    ok(!body.includes('maxdepth'), 'directive options should be dropped');
    ok(body.includes('```c'), 'code blocks should be fenced');
    ok(body.includes('gpio_pin_configure_dt(&led, GPIO_OUTPUT);'), 'code content preserved');
    ok(body.includes('Done.'));
  });

  it('renders admonitions as labelled text', () => {
    const body = cleanRst(['.. note::', '   Watch out for this.'].join('\n'));
    strictEqual(body, 'NOTE: Watch out for this.');
  });

  it('strips a leading byte order mark', () => {
    const doc = parseRst('﻿Title\n#####\n\nBody.\n');
    strictEqual(doc.title, 'Title');
  });
});

describe('cleanInline', () => {
  it('reduces roles and literals to text', () => {
    strictEqual(cleanInline('See :ref:`sensor-channel`.'), 'See sensor-channel.');
    strictEqual(cleanInline('See :ref:`Channels <sensor-channel>`.'), 'See Channels.');
    strictEqual(cleanInline('Set ``CONFIG_SPI`` to y.'), 'Set CONFIG_SPI to y.');
    strictEqual(cleanInline('This is **bold** text.'), 'This is bold text.');
  });
});

describe('docUrl', () => {
  it('maps doc/ paths to the published site', () => {
    strictEqual(
      docUrl('doc/services/sensor/index.rst', 'https://docs.zephyrproject.org/4.4.2/'),
      'https://docs.zephyrproject.org/4.4.2/services/sensor/index.html',
    );
  });

  it('keeps the repository path for board documentation', () => {
    strictEqual(
      docUrl('boards/st/nucleo_h743zi/doc/index.rst', 'https://docs.zephyrproject.org/4.4.2/'),
      'https://docs.zephyrproject.org/4.4.2/boards/st/nucleo_h743zi/doc/index.html',
    );
  });
});

describe('against the real Zephyr tree', {
  skip: !existsSync(SENSOR_RST) && 'Zephyr tree not fetched',
}, () => {
  it('parses the sensor documentation page', () => {
    const doc = parseRst(readFileSync(SENSOR_RST, 'utf8'));
    strictEqual(doc.title, 'Sensors');
    ok(doc.labels.includes('sensor'), 'page label should be captured');
    ok(doc.chunks.length > 3, `expected several sections, got ${doc.chunks.length}`);
    ok(
      doc.chunks.some((c) => c.heading === 'Using Sensors'),
      'expected the "Using Sensors" section',
    );
    ok(
      doc.chunks.every((c) => !c.body.includes('.. toctree::')),
      'no raw directives should survive',
    );
  });
});
