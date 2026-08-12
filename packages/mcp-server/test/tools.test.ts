import { deepStrictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { skeletonProperty } from '../src/tools/devicetree.ts';

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
