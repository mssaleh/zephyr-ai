import { deepStrictEqual, match, ok, strictEqual } from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { cleanInline, cleanRst, parseRst } from '../src/parsers/rst.ts';
import { collectDocs, docUrl } from '../src/sources/docs.ts';

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

describe('documentation preprocessing', () => {
  it('keeps toctree-only landing pages as searchable navigation summaries', () => {
    const root = mkdtempSync(join(tmpdir(), 'zephyr-ai-rst-nav-'));
    try {
      mkdirSync(join(root, 'doc'), { recursive: true });
      mkdirSync(join(root, 'boards'), { recursive: true });
      writeFileSync(
        join(root, 'doc', 'index.rst'),
        'Build System\n============\n\n.. toctree::\n   :maxdepth: 1\n\n   CMake guide <cmake/index.rst>\n   flashing/index.rst\n',
      );
      const { pages, report } = collectDocs(root, 'https://example.invalid/');
      strictEqual(report.indexed, 1);
      strictEqual(pages[0]!.chunks.length, 1);
      ok(pages[0]!.chunks[0]!.body.includes('CMake guide (cmake/index)'));
      ok(pages[0]!.chunks[0]!.body.includes('flashing (flashing/index)'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('applies include line and marker ranges and records their origin', () => {
    const root = mkdtempSync(join(tmpdir(), 'zephyr-ai-rst-'));
    try {
      mkdirSync(join(root, 'doc'), { recursive: true });
      mkdirSync(join(root, 'boards'), { recursive: true });
      writeFileSync(join(root, 'doc', 'fragment.txt'), 'ignore\nSTART\nkept one\nkept two\nEND\nignore\n');
      writeFileSync(
        join(root, 'doc', 'index.rst'),
        'Fixture\n-------\n\n.. literalinclude:: fragment.txt\n   :start-after: START\n   :end-before: END\n   :language: text\n',
      );
      const { pages } = collectDocs(root, 'https://example.invalid/');
      const page = pages.find((item) => item.path === 'doc/index.rst')!;
      const text = page.chunks.map((chunk) => chunk.body).join('\n');
      ok(text.includes('kept one'));
      ok(!text.includes('START'));
      ok(!text.includes('END'));
      ok(page.origins.some((origin) => origin.path === 'doc/fragment.txt' && origin.startLine === 3));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails closed on cycles, missing includes, path traversal, and missing markers', () => {
    for (const [name, body, extra] of [
      ['cycle', '.. include:: other.rst\n', { 'other.rst': '.. include:: index.rst\n' }],
      ['missing', '.. include:: absent.rst\n', {}],
      ['traversal', '.. include:: ../../outside.rst\n', {}],
      ['marker', '.. include:: fragment.txt\n   :start-after: ABSENT\n', { 'fragment.txt': 'text\n' }],
    ] as const) {
      const root = mkdtempSync(join(tmpdir(), `zephyr-ai-rst-${name}-`));
      try {
        mkdirSync(join(root, 'doc'), { recursive: true });
        mkdirSync(join(root, 'boards'), { recursive: true });
        writeFileSync(join(root, 'doc', 'index.rst'), `Fixture\n-------\n\n${body}`);
        for (const [path, text] of Object.entries(extra)) writeFileSync(join(root, 'doc', path), text);
        let failed = false;
        try {
          collectDocs(root, 'https://example.invalid/');
        } catch {
          failed = true;
        }
        strictEqual(failed, true, `${name} should fail the corpus build`);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it('rejects a literalinclude symlink even when its target is readable', () => {
    const root = mkdtempSync(join(tmpdir(), 'zephyr-ai-rst-symlink-'));
    try {
      mkdirSync(join(root, 'doc'), { recursive: true });
      mkdirSync(join(root, 'boards'), { recursive: true });
      const outside = join(root, 'outside.txt');
      writeFileSync(outside, 'private text\n');
      symlinkSync(outside, join(root, 'doc', 'linked.txt'));
      writeFileSync(
        join(root, 'doc', 'index.rst'),
        'Fixture\n-------\n\n.. literalinclude:: linked.txt\n',
      );
      let message = '';
      try {
        collectDocs(root, 'https://example.invalid/');
      } catch (error) {
        message = (error as Error).message;
      }
      match(message, /symbolic link/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('recursively resolves an include nested inside an HTML-only block', () => {
    const root = mkdtempSync(join(tmpdir(), 'zephyr-ai-rst-only-'));
    try {
      mkdirSync(join(root, 'doc'), { recursive: true });
      mkdirSync(join(root, 'boards'), { recursive: true });
      writeFileSync(join(root, 'doc', 'fragment.rst'), 'Nested include text.\n');
      writeFileSync(
        join(root, 'doc', 'index.rst'),
        'Fixture\n-------\n\n.. only:: html\n\n   .. include:: fragment.rst\n',
      );
      const page = collectDocs(root, 'https://example.invalid/').pages[0]!;
      ok(page.chunks.some((chunk) => chunk.body.includes('Nested include text.')));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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

  it('indexes build documentation and resolves board includes', () => {
    const { pages, report } = collectDocs(ZEPHYR, 'https://docs.zephyrproject.org/4.4.2/');
    ok(pages.some((page) => page.path.startsWith('doc/build/')));
    const esp = pages.find((page) => page.path === 'boards/espressif/esp32s3_devkitc/doc/index.rst');
    ok(esp);
    const text = esp!.chunks.map((chunk) => chunk.body).join('\n');
    ok(esp!.chunks.some((chunk) => chunk.heading === 'Simple Boot'));
    ok(text.includes('west espressif monitor'));
    ok(!text.includes('building-flashing.rst'));
    ok(pages.every((page) => page.chunks.every((chunk) => chunk.body.trim() !== '')));
    strictEqual(report.errors.length, 0);
  });
});
