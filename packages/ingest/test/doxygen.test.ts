import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  cleanDoxyInline,
  groupEvents,
  parseDeclaration,
  parseDocComment,
  parseHeader,
} from '../src/parsers/doxygen.ts';
import { collectApi } from '../src/sources/api.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const GPIO_H = join(ZEPHYR, 'include', 'zephyr', 'drivers', 'gpio.h');
const KERNEL_H = join(ZEPHYR, 'include', 'zephyr', 'kernel.h');
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !existsSync(GPIO_H)) {
  throw new Error('Release tests require the pinned Zephyr public headers.');
}

describe('parseDocComment', () => {
  it('ends the brief at the first blank line', () => {
    const tags = parseDocComment(
      ['@brief Put the current thread to sleep.', '', 'This routine puts it to sleep.'].join('\n'),
    );
    strictEqual(tags.brief, 'Put the current thread to sleep.');
    strictEqual(tags.detail, 'This routine puts it to sleep.');
  });

  it('continues a brief across wrapped lines', () => {
    const tags = parseDocComment(['@brief Configure a single', 'pin on the port.'].join('\n'));
    strictEqual(tags.brief, 'Configure a single pin on the port.');
  });

  it('parses params with and without direction', () => {
    const tags = parseDocComment(
      ['@param[in] port Pointer to device.', '@param pin Pin number.'].join('\n'),
    );
    deepStrictEqual(tags.params, [
      { name: 'port', description: 'Pointer to device.', direction: 'in' },
      { name: 'pin', description: 'Pin number.' },
    ]);
  });

  it('parses retval entries', () => {
    const tags = parseDocComment(
      ['@retval 0 If successful.', '@retval -EINVAL Invalid argument.'].join('\n'),
    );
    deepStrictEqual(tags.retvals, [
      { value: '0', description: 'If successful.' },
      { value: '-EINVAL', description: 'Invalid argument.' },
    ]);
  });

  it('strips inline markup from every text field', () => {
    const tags = parseDocComment(
      ['@brief Sleep for @a duration.', '@param x see @ref foo and @kconfig{CONFIG_BAR}'].join('\n'),
    );
    strictEqual(tags.brief, 'Sleep for duration.');
    strictEqual(tags.params[0]!.description, 'see foo and CONFIG_BAR');
  });

  it('joins a multi-line param description', () => {
    const tags = parseDocComment(
      ['@param flags Flags for pin configuration:', "        'GPIO input/output flags'."].join('\n'),
    );
    strictEqual(
      tags.params[0]!.description,
      "Flags for pin configuration: 'GPIO input/output flags'.",
    );
  });
});

describe('cleanDoxyInline', () => {
  it('keeps the decorated word', () => {
    strictEqual(cleanDoxyInline('wait @a timeout ms'), 'wait timeout ms');
    strictEqual(cleanDoxyInline('see @ref k_sleep'), 'see k_sleep');
    strictEqual(cleanDoxyInline('needs @kconfig{CONFIG_BT}'), 'needs CONFIG_BT');
  });
});

describe('groupEvents', () => {
  it('reads nested open/close pairs in one comment in order', () => {
    const events = groupEvents(
      [
        '@defgroup gpio_interface GPIO',
        '@ingroup io_interfaces',
        '@{',
        '',
        '@defgroup gpio_interface_ext Device-specific GPIO API extensions',
        '',
        '@{',
        '@}',
      ].join('\n'),
    );
    deepStrictEqual(
      events.map((e) => (e.kind === 'define' ? `define:${e.id}` : e.kind)),
      ['define:gpio_interface', 'open', 'define:gpio_interface_ext', 'open', 'close'],
    );
  });
});

describe('parseDeclaration', () => {
  it('recognises a syscall function and strips the z_impl_ prefix', () => {
    const d = parseDeclaration(
      'static inline int z_impl_gpio_pin_configure(const struct device *port, gpio_pin_t pin)',
    )!;
    strictEqual(d.kind, 'function');
    strictEqual(d.name, 'gpio_pin_configure');
  });

  it('recognises function-like and object-like macros', () => {
    strictEqual(parseDeclaration('#define DEVICE_DT_GET(node_id) ...')!.name, 'DEVICE_DT_GET');
    strictEqual(parseDeclaration('#define K_FOREVER 1')!.kind, 'macro');
  });

  it('recognises structs and enums', () => {
    strictEqual(parseDeclaration('struct gpio_dt_spec {')!.kind, 'struct');
    strictEqual(parseDeclaration('enum gpio_int_mode {')!.name, 'gpio_int_mode');
  });

  it('recognises a function-pointer typedef', () => {
    const d = parseDeclaration('typedef void (*gpio_callback_handler_t)(const struct device *p);')!;
    strictEqual(d.kind, 'typedef');
    strictEqual(d.name, 'gpio_callback_handler_t');
  });

});

describe('parseHeader', () => {
  it('attributes symbols to the enclosing group', () => {
    const { symbols, groups } = parseHeader(
      [
        '/**',
        ' * @defgroup demo_interface Demo',
        ' * @{',
        ' */',
        '',
        '/**',
        ' * @brief Do a thing.',
        ' * @param x A number.',
        ' * @retval 0 Success.',
        ' */',
        'int demo_do(int x);',
        '',
        '/** @} */',
      ].join('\n'),
      'include/zephyr/demo.h',
    );

    strictEqual(groups.length, 1);
    strictEqual(groups[0]!.id, 'demo_interface');
    strictEqual(symbols.length, 1);
    strictEqual(symbols[0]!.name, 'demo_do');
    strictEqual(symbols[0]!.group, 'demo_interface');
    strictEqual(symbols[0]!.brief, 'Do a thing.');
  });

  it('skips preprocessor conditionals between comment and declaration', () => {
    const { symbols } = parseHeader(
      ['/**', ' * @brief Thing.', ' */', '#ifdef CONFIG_X', 'int thing(void);'].join('\n'),
      'h.h',
    );
    strictEqual(symbols[0]!.name, 'thing');
  });
});

describe('Doxygen XML adapter', () => {
  it('preserves structured functions, enum values, IDs, and documentation anchors', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-doxygen-test-'));
    try {
      mkdirSync(join(temporary, 'xml'));
      writeFileSync(
        join(temporary, 'xml', 'index.xml'),
        '<doxygenindex><compound refid="group__gpio" kind="group"><name>GPIO</name></compound></doxygenindex>',
      );
      writeFileSync(
        join(temporary, 'xml', 'group__gpio.xml'),
        `<doxygen><compounddef id="group__gpio" kind="group">
          <compoundname>gpio_interface</compoundname><title>GPIO</title>
          <sectiondef>
            <memberdef kind="function" id="group__gpio_1a_fn">
              <type>int</type><definition>int gpio_demo</definition><argsstring>(const struct device * dev)</argsstring>
              <name>gpio_demo</name><briefdescription><para>Configure GPIO.</para></briefdescription>
              <detaileddescription><para>Detailed contract.</para><parameterlist kind="param"><parameteritem>
                <parameternamelist><parametername direction="in">dev</parametername></parameternamelist>
                <parameterdescription><para>GPIO device.</para></parameterdescription>
              </parameteritem></parameterlist><simplesect kind="return"><para>Zero on success.</para></simplesect></detaileddescription>
              <param><type>const struct device *</type><declname>dev</declname></param>
              <location file="include/zephyr/drivers/gpio.h" line="42"/>
            </memberdef>
            <memberdef kind="enum" id="group__gpio_1a_enum"><name>gpio_mode</name>
              <definition>enum gpio_mode</definition><location file="include/zephyr/drivers/gpio.h" line="50"/>
              <enumvalue id="group__gpio_1a_value"><name>GPIO_DEMO</name><initializer>= 1</initializer></enumvalue>
            </memberdef>
          </sectiondef><location file="include/zephyr/drivers/gpio.h"/>
        </compounddef></doxygen>`,
      );
      const api = collectApi(temporary, join(temporary, 'xml'));
      strictEqual(api.mode, 'doxygen-xml');
      const fn = api.symbols.find((symbol) => symbol.name === 'gpio_demo')!;
      strictEqual(fn.signature, 'int gpio_demo (const struct device * dev)');
      deepStrictEqual(fn.params[0], {
        name: 'dev',
        description: 'GPIO device.',
        direction: 'in',
        type: 'const struct device *',
      });
      strictEqual(fn.doxygenId, 'group__gpio_1a_fn');
      strictEqual(fn.docAnchor, 'group__gpio.html#group__gpio_1a_fn');
      ok(api.symbols.some((symbol) => symbol.name === 'GPIO_DEMO' && symbol.kind === 'enumvalue'));
      strictEqual(
        api.report.discovered,
        api.report.indexed + api.report.intentionallyExcluded.length + api.report.errors.length,
      );
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});

describe('public-header fallback', () => {
  it('reason-codes array declarators instead of exposing their bound macro as a function', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-header-test-'));
    try {
      mkdirSync(join(temporary, 'include', 'zephyr'), { recursive: true });
      writeFileSync(
        join(temporary, 'include', 'zephyr', 'fixture.h'),
        '/** @brief Fixed storage. */\nuint8_t bits[BIT(3)];\n',
      );
      const api = collectApi(temporary);
      ok(!api.symbols.some((symbol) => symbol.name === 'BIT'));
      ok(api.report.intentionallyExcluded.some(
        (entry) => entry.reason === 'fallback-array-declarator-artifact',
      ));
      strictEqual(
        api.report.discovered,
        api.report.indexed + api.report.intentionallyExcluded.length + api.report.errors.length,
      );
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});

describe('against the real Zephyr tree', {
  skip: !existsSync(GPIO_H) && 'Zephyr tree not fetched',
}, () => {
  it('files gpio_pin_configure under gpio_interface, not the extension group', () => {
    const { symbols } = parseHeader(readFileSync(GPIO_H, 'utf8'), 'include/zephyr/drivers/gpio.h');
    const fn = symbols.find((s) => s.name === 'gpio_pin_configure' && s.kind === 'function');
    ok(fn, 'gpio_pin_configure should be extracted');
    strictEqual(fn!.group, 'gpio_interface');
    strictEqual(fn!.brief, 'Configure a single pin.');
    deepStrictEqual(fn!.params.map((p) => p.name), ['port', 'pin', 'flags']);
    ok(fn!.retvals.some((r) => r.value === '-ENOTSUP'));
  });

  it('extracts k_sleep with a brief separate from its detail', () => {
    const { symbols } = parseHeader(readFileSync(KERNEL_H, 'utf8'), 'include/zephyr/kernel.h');
    const fn = symbols.find((s) => s.name === 'k_sleep');
    ok(fn, 'k_sleep should be extracted');
    strictEqual(fn!.brief, 'Put the current thread to sleep.');
    ok(!fn!.brief!.includes('@a'), 'inline markup should be stripped');
    strictEqual(fn!.group, 'thread_apis');
  });
});
