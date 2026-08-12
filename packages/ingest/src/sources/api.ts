import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { type ApiGroup, type ApiSymbol, parseHeader } from '../parsers/doxygen.ts';
import { walk } from '../walk.ts';

export interface CollectedApi {
  symbols: ApiSymbol[];
  groups: ApiGroup[];
}

/**
 * Index the public C API from `include/zephyr`.
 *
 * Only public headers are read: internal headers under `include/zephyr/internal`
 * and the arch-private trees describe implementation detail an application must
 * not call, and indexing them would let a model reach for private functions.
 */
export function collectApi(root: string): CollectedApi {
  const base = join(root, 'include', 'zephyr');
  const symbols: ApiSymbol[] = [];
  const groups: ApiGroup[] = [];
  const seen = new Set<string>();

  for (const rel of walk(base, {
    skipPrefixes: ['internal', 'arch/arm/internal'],
    match: (name) => name.endsWith('.h'),
  })) {
    let text: string;
    try {
      text = readFileSync(join(base, rel), 'utf8');
    } catch {
      continue;
    }

    const header = `include/zephyr/${rel}`;
    const parsed = parseHeader(text, header);

    for (const symbol of parsed.symbols) {
      // A syscall appears twice: the `__syscall` declaration and the
      // `z_impl_`-prefixed inline. Both normalise to the same public name, so
      // keep whichever is documented most richly.
      const key = `${symbol.kind}:${symbol.name}`;
      const existing = seen.has(key)
        ? symbols.find((s) => s.kind === symbol.kind && s.name === symbol.name)
        : undefined;

      if (!existing) {
        seen.add(key);
        symbols.push(symbol);
        continue;
      }

      const score = (s: ApiSymbol) =>
        (s.brief ? 2 : 0) + (s.detail ? 1 : 0) + s.params.length + s.retvals.length;
      if (score(symbol) > score(existing)) {
        symbols[symbols.indexOf(existing)] = symbol;
      }
    }

    groups.push(...parsed.groups);
  }

  symbols.sort((a, b) => a.name.localeCompare(b.name));

  const groupById = new Map<string, ApiGroup>();
  for (const g of groups) {
    if (!groupById.has(g.id) || (g.title && !groupById.get(g.id)!.title)) groupById.set(g.id, g);
  }

  return { symbols, groups: [...groupById.values()] };
}
