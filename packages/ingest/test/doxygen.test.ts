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
import { collectApi, discoverDoxygenXml } from '../src/sources/api.ts';
import { SourceManifest } from '../../shared/source-manifest.ts';

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

  it('recognises a function-type typedef declared without the pointer', () => {
    // `typedef void (fn_t)(args)` is valid C and appears in Zephyr; reading it
    // as a function named it after its return type.
    const d = parseDeclaration('typedef bool (npf_local_in_fn_t)(struct net_pkt *pkt, void *data);')!;
    strictEqual(d.kind, 'typedef');
    strictEqual(d.name, 'npf_local_in_fn_t');
  });

  it('skips attribute macros between a record keyword and its tag', () => {
    // `enum __packed bt_conn_type` filed the type under `__packed`, so the real
    // enum and its documentation were unreachable by name.
    const d = parseDeclaration('enum __packed bt_conn_type {')!;
    strictEqual(d.kind, 'enum');
    strictEqual(d.name, 'bt_conn_type');
    strictEqual(parseDeclaration('enum __deprecated bt_hci_bus {')!.name, 'bt_hci_bus');
    strictEqual(parseDeclaration('struct __aligned(4) demo_buf {')!.name, 'demo_buf');
  });

  it('rejects a use of a record type as a definition of it', () => {
    // A struct field whose type is an enum otherwise overwrites the enum's own
    // location and brief with the field's.
    strictEqual(parseDeclaration('enum bt_conn_type type;'), null);
    strictEqual(parseDeclaration('enum display_pixel_format current_pixel_format;'), null);
    strictEqual(parseDeclaration('struct k_mutex lock;'), null);
  });

  it('rejects a function-pointer member but keeps a callback parameter', () => {
    // These name the member after its return type: `void`, `int`, and so on.
    strictEqual(parseDeclaration('void (*const destroy)(struct net_buf *buf);'), null);
    strictEqual(parseDeclaration('int (*read)(const struct device *dev, uint8_t *buf);'), null);
    strictEqual(parseDeclaration('int demo_register(void (*cb)(void), int n);')!.name, 'demo_register');
  });

  it('keeps functions that return a record type', () => {
    // The record branch runs first, so these must fall through to it intact.
    strictEqual(parseDeclaration('struct net_buf *net_buf_alloc(struct net_buf_pool *pool);')!.name, 'net_buf_alloc');
    strictEqual(parseDeclaration('enum bt_conn_type bt_conn_get_type(const struct bt_conn *conn);')!.name, 'bt_conn_get_type');
    strictEqual(parseDeclaration('const struct device *device_get_binding(const char *name);')!.name, 'device_get_binding');
  });

  it('keeps a forward declaration', () => {
    strictEqual(parseDeclaration('struct device;')!.name, 'device');
  });
});

describe('enum members', () => {
  const HEADER = [
    '/** @brief Pixel formats */',
    'enum display_pixel_format {',
    '\t/**',
    '\t * @brief 24-bit RGB format with 8 bits per component.',
    '\t */',
    '\tPIXEL_FORMAT_RGB_888 = BIT(0), /**< 24-bit RGB */',
    '\tPIXEL_FORMAT_MONO01 = BIT(1), /**< Monochrome (0=Black 1=White) */',
    '#if defined(CONFIG_DEMO)',
    '\tPIXEL_FORMAT_GATED = BIT(2),',
    '#endif',
    '\t/** This and higher values are display specific. */',
    '\tPIXEL_FORMAT_PRIV_START = (PIXEL_FORMAT_BGRA_8888 << 1)',
    '};',
  ].join('\n');

  it('indexes each member against its parent enum', () => {
    const { symbols } = parseHeader(HEADER, 'include/zephyr/drivers/display.h');
    const members = symbols.filter((s) => s.kind === 'enumvalue');
    deepStrictEqual(
      members.map((m) => m.name),
      [
        'PIXEL_FORMAT_RGB_888',
        'PIXEL_FORMAT_MONO01',
        'PIXEL_FORMAT_GATED',
        'PIXEL_FORMAT_PRIV_START',
      ],
    );
    ok(members.every((m) => m.parentSymbol === 'display_pixel_format'));
    // The enum itself is indexed once, not once per member.
    strictEqual(symbols.filter((s) => s.name === 'display_pixel_format').length, 1);
  });

  it('keeps a value expression whose commas are parenthesised', () => {
    const members = parseHeader(HEADER, 'h').symbols.filter((s) => s.kind === 'enumvalue');
    strictEqual(members[0]!.signature, 'PIXEL_FORMAT_RGB_888 = BIT(0)');
    strictEqual(
      members[3]!.signature,
      'PIXEL_FORMAT_PRIV_START = (PIXEL_FORMAT_BGRA_8888 << 1)',
    );
  });

  it('reads both documentation forms and prefers the richer one', () => {
    const members = parseHeader(HEADER, 'h').symbols.filter((s) => s.kind === 'enumvalue');
    // A block `@brief` outranks the trailing one-liner where both are present.
    strictEqual(members[0]!.brief, '24-bit RGB format with 8 bits per component.');
    // A trailing `/**< */` documents the member before it, across the comma.
    strictEqual(members[1]!.brief, 'Monochrome (0=Black 1=White)');
    // An untagged block is the member's brief, not its detail.
    strictEqual(members[3]!.brief, 'This and higher values are display specific.');
  });

  it('ends the body at the real brace, not a Doxygen group marker', () => {
    // usb_audio.h opens an `@{` group inside the enum and never closes it
    // before the enum ends. Counting braces in comments runs the body past its
    // terminator and into whatever declaration follows.
    const header = [
      '/** @brief Terminal types */',
      'enum usb_audio_terminal_types {',
      '\t/**',
      '\t * @name USB Terminal Types',
      '\t * @{',
      '\t */',
      '\tUSB_AUDIO_USB_UNDEFINED = 0x0100,',
      '};',
      '',
      '/** @brief Direction */',
      'enum usb_audio_direction {',
      '\tUSB_AUDIO_IN = 0x00,',
      '};',
    ].join('\n');
    const { symbols } = parseHeader(header, 'include/zephyr/usb/class/usb_audio.h');
    deepStrictEqual(
      symbols.filter((s) => s.kind === 'enumvalue').map((s) => s.name),
      ['USB_AUDIO_USB_UNDEFINED', 'USB_AUDIO_IN'],
    );
    // The declaration after the unterminated group is still reached.
    ok(symbols.some((s) => s.name === 'usb_audio_direction' && s.kind === 'enum'));
  });

  it('does not emit artefacts from member initialisers', () => {
    const { symbols } = parseHeader(HEADER, 'h');
    ok(!symbols.some((s) => s.name === 'BIT'));
    ok(!symbols.some((s) => s.kind === 'function'));
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
  it('discovers conventional generated XML without overriding an explicit path', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-doxygen-discovery-'));
    try {
      const zephyr = join(temporary, 'zephyr');
      const adjacent = join(temporary, 'doxygen', 'xml');
      mkdirSync(zephyr);
      mkdirSync(adjacent, { recursive: true });
      writeFileSync(join(adjacent, 'index.xml'), '<doxygenindex/>');
      strictEqual(discoverDoxygenXml(zephyr), adjacent);

      rmSync(join(adjacent, 'index.xml'));
      const inTree = join(zephyr, 'doc', '_build', 'doxygen', 'xml');
      mkdirSync(inTree, { recursive: true });
      writeFileSync(join(inTree, 'index.xml'), '<doxygenindex/>');
      strictEqual(discoverDoxygenXml(zephyr), inTree);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });

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
      const api = collectApi(SourceManifest.forRoot(temporary), join(temporary, 'xml'));
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
      const value = api.symbols.find((symbol) => symbol.name === 'GPIO_DEMO')!;
      strictEqual(value.kind, 'enumvalue');
      // The owning enum, which `compoundId` cannot identify: it names the
      // containing group, which every sibling symbol here also carries.
      strictEqual(value.parentSymbol, 'gpio_mode');
      strictEqual(value.compoundId, 'group__gpio');
      strictEqual(value.signature, 'GPIO_DEMO = 1');
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
      const api = collectApi(SourceManifest.forRoot(temporary));
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

  it('resolves an attribute-decorated enum to its definition, not a field using it', () => {
    // `enum __packed bt_conn_type` at conn.h:523 was indexed as `__packed`,
    // leaving `bt_conn_type` to resolve to the `struct bt_conn_info` field that
    // merely has that type — wrong line, wrong signature, no documentation.
    const conn = join(ZEPHYR, 'include', 'zephyr', 'bluetooth', 'conn.h');
    const { symbols } = parseHeader(readFileSync(conn, 'utf8'), 'include/zephyr/bluetooth/conn.h');
    const found = symbols.filter((s) => s.name === 'bt_conn_type');
    strictEqual(found.length, 1);
    strictEqual(found[0]!.kind, 'enum');
    strictEqual(found[0]!.line, 523);
    ok(!symbols.some((s) => s.name === '__packed'));

    const members = symbols.filter((s) => s.parentSymbol === 'bt_conn_type');
    ok(
      members.some((m) => m.name === 'BT_CONN_TYPE_LE' && m.brief === 'LE Connection Type'),
      'enum members carry their trailing documentation',
    );
  });

  it('indexes display_pixel_format once, with its members', () => {
    const display = join(ZEPHYR, 'include', 'zephyr', 'drivers', 'display.h');
    const { symbols } = parseHeader(readFileSync(display, 'utf8'), 'include/zephyr/drivers/display.h');
    strictEqual(symbols.filter((s) => s.name === 'display_pixel_format').length, 1);
    const members = symbols.filter((s) => s.parentSymbol === 'display_pixel_format');
    ok(members.some((m) => m.name === 'PIXEL_FORMAT_RGB_565'), 'RGB_565 is a member');
    ok(members.every((m) => m.brief), 'every member is documented');
  });

  it('names no symbol after a C type keyword across the public headers', () => {
    // Function-pointer struct members were indexed under their return type,
    // putting 595 symbols named `void` into the catalogue and the FTS index.
    const api = collectApi(SourceManifest.forRoot(ZEPHYR));
    const bogus = api.symbols.filter((s) =>
      ['void', 'int', 'char', 'bool', 'unsigned', 'size_t', '__packed', '__deprecated'].includes(
        s.name,
      ),
    );
    deepStrictEqual(bogus.map((s) => `${s.name} ${s.header}:${s.line}`), []);
  });
});
