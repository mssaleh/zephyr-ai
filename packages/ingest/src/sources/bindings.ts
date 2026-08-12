import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  type BindingLoader,
  type ResolvedBinding,
  resolveBinding,
  safeParseYaml,
} from '../parsers/binding.ts';
import { walk } from '../walk.ts';

/**
 * Build a loader over every binding directory in the tree.
 *
 * Zephyr resolves `include:` by bare filename across all binding directories,
 * so the loader is a filename index. Later roots (modules, vendor HALs in a west
 * workspace) are registered first-wins so the core tree cannot be shadowed
 * accidentally by a module that ships a same-named file.
 */
export function createBindingLoader(roots: string[]): {
  loader: BindingLoader;
  files: { rel: string; abs: string }[];
} {
  const byName = new Map<string, string>();
  const absByRel = new Map<string, string>();
  const files: { rel: string; abs: string }[] = [];
  const cache = new Map<string, ReturnType<typeof safeParseYaml>>();

  for (const root of roots) {
    for (const rel of walk(root, {
      match: (name) => name.endsWith('.yaml') || name.endsWith('.yml'),
    })) {
      const abs = join(root, rel);
      if (!absByRel.has(rel)) {
        absByRel.set(rel, abs);
        files.push({ rel, abs });
      }
      const name = basename(rel);
      if (!byName.has(name)) byName.set(name, rel);
    }
  }

  const loader: BindingLoader = {
    resolve(name) {
      return byName.get(name) ?? byName.get(basename(name));
    },
    load(rel) {
      if (cache.has(rel)) return cache.get(rel)!;
      const abs = absByRel.get(rel);
      let parsed = null;
      if (abs) {
        try {
          parsed = safeParseYaml(readFileSync(abs, 'utf8'));
        } catch {
          parsed = null;
        }
      }
      cache.set(rel, parsed);
      return parsed;
    },
  };

  return { loader, files };
}

export interface CollectedBindings {
  /** Bindings that declare a `compatible`, keyed by resolution order. */
  bindings: ResolvedBinding[];
  /** Include-only fragments (`base.yaml`, `spi-controller.yaml`, ...). */
  fragments: number;
}

/**
 * Resolve every binding under the given directories.
 *
 * `roots` are the binding directories themselves (e.g. `<zephyr>/dts/bindings`),
 * because binding include resolution is scoped to those directories.
 */
export function collectBindings(roots: string[]): CollectedBindings {
  const { loader, files } = createBindingLoader(roots);
  const bindings: ResolvedBinding[] = [];
  let fragments = 0;

  for (const { rel } of files) {
    const resolved = resolveBinding(rel, loader);
    if (!resolved) continue;
    if (resolved.compatible) bindings.push(resolved);
    else fragments++;
  }

  bindings.sort((a, b) => a.compatible!.localeCompare(b.compatible!));
  return { bindings, fragments };
}
