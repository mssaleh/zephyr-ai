import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  type KconfigChoice,
  type KconfigSymbol,
  aggregate,
  parseKconfig,
} from '../parsers/kconfig.ts';
import { walk } from '../walk.ts';

export interface CollectedKconfig {
  symbols: KconfigSymbol[];
  choices: KconfigChoice[];
  filesScanned: number;
}

/**
 * Scan every Kconfig file in the tree.
 *
 * `tests/` is excluded: its Kconfig files declare throwaway symbols for test
 * fixtures that would otherwise appear in searches as if they were real
 * configuration options.
 */
export function collectKconfig(root: string, extraRoots: string[] = []): CollectedKconfig {
  const allDefs = [];
  const allChoices: KconfigChoice[] = [];
  let filesScanned = 0;

  for (const base of [root, ...extraRoots]) {
    for (const rel of walk(base, {
      skipPrefixes: ['tests', 'doc/_build'],
      match: (name) => name === 'Kconfig' || name.startsWith('Kconfig.'),
    })) {
      let text: string;
      try {
        text = readFileSync(join(base, rel), 'utf8');
      } catch {
        continue;
      }
      filesScanned++;
      const { defs, choices } = parseKconfig(text, rel);
      allDefs.push(...defs);
      allChoices.push(...choices);
    }
  }

  return {
    symbols: aggregate(allDefs, allChoices),
    choices: allChoices,
    filesScanned,
  };
}
