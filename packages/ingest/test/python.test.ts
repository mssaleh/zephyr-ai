import { match, strictEqual, throws } from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { semanticPython, standardPython } from '../src/python.ts';

const TEMPORARY = mkdtempSync(join(tmpdir(), 'zephyr-ai-python-'));
after(() => rmSync(TEMPORARY, { recursive: true, force: true }));

describe('semantic Python preflight', () => {
  it('selects a standard-library interpreter without requiring a Zephyr tree', () => {
    strictEqual(typeof standardPython(), 'string');
  });

  it('reports an incomplete Zephyr tree before probing interpreters', () => {
    throws(() => semanticPython(TEMPORARY), /missing its semantic ingestion libraries/);
  });

  it('reports one actionable contract error when no usable interpreter exists', () => {
    const root = join(TEMPORARY, 'tree');
    mkdirSync(join(root, 'scripts', 'kconfig'), { recursive: true });
    mkdirSync(join(root, 'scripts', 'dts', 'python-devicetree', 'src', 'devicetree'), { recursive: true });
    writeFileSync(join(root, 'scripts', 'kconfig', 'kconfiglib.py'), '');
    writeFileSync(join(root, 'scripts', 'dts', 'python-devicetree', 'src', 'devicetree', 'edtlib.py'), '');
    let message = '';
    try {
      semanticPython(root, { PATH: '', PYTHON_EXECUTABLE: join(TEMPORARY, 'missing-python') });
    } catch (error) {
      message = (error as Error).message;
    }
    match(message, /Python 3\.10 or newer with PyYAML/);
    match(message, /PYTHON_EXECUTABLE/);
  });
});
