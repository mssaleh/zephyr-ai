/**
 * The application memory budget each board declares.
 *
 * See `parsers/devicetree-memory.ts` for what is resolved and why it refuses to
 * guess. This collector supplies the include chain from the declared input
 * manifest and attributes each board `.dts` to the build target its filename
 * names; it decides nothing about devicetree.
 */
import { buildStrings, parseTarget } from '../../../shared/build-string.ts';
import { byField, compositeKey } from '../../../shared/ordering.ts';
import type { SourceManifest } from '../../../shared/source-manifest.ts';
import {
  type MemoryRejection,
  type ScannedFile,
  blankComments,
  chosenLabels,
  resolveRegion,
  scanNodes,
} from '../parsers/devicetree-memory.ts';
import type { SourceReport } from '../report.ts';

export interface BoardMemoryRecord {
  board: string;
  /** Empty when the declaration applies to every target of the board. */
  target: string;
  role: 'sram' | 'code-partition' | 'flash';
  label: string;
  node: string;
  address: number;
  size: number;
  source: string;
}

export interface CollectedBoardMemory {
  regions: BoardMemoryRecord[];
  report: SourceReport;
}

/** Where an `#include` can resolve to. Bounded, so a match is cheap and unique. */
const INCLUDE_ROOTS = ['dts/', 'include/'];

/**
 * The `.dts` filenames a board target can be declared in.
 *
 * Wider than `buildStrings`, and deliberately not shared with it. Overlay and
 * `.conf` selection is exact — Zephyr joins the board with every qualifier — but
 * a board directory may drop the SoC segment from its own devicetree when the
 * board has one SoC: `m5stack_atoms3/esp32s3/procpu` is declared in
 * `m5stack_atoms3_procpu.dts`. Applying this looseness to overlay matching would
 * claim a file applies where the build would skip it.
 */
function boardFileNames(identifier: string): string[] {
  const names = new Set(buildStrings(identifier));
  const { board, qualifiers } = parseTarget(identifier);
  for (let skip = 1; skip < qualifiers.length; skip++) {
    names.add([board, ...qualifiers.slice(skip)].join('_'));
  }
  return [...names];
}

class ChainReader {
  readonly #tree: SourceManifest;
  readonly #scanned = new Map<string, ScannedFile | null>();
  readonly #includes = new Map<string, string[]>();
  readonly #bySuffix = new Map<string, string[]>();

  constructor(tree: SourceManifest) {
    this.#tree = tree;
    // One pass over the declared inputs, so resolving an include is a lookup
    // rather than a scan of the manifest per directive.
    for (const root of INCLUDE_ROOTS) {
      for (const path of tree.select({ under: root, match: (name) => /\.(dtsi|dts|h)$/.test(name) })) {
        const cut = path.lastIndexOf('/');
        const name = cut < 0 ? path : path.slice(cut + 1);
        const existing = this.#bySuffix.get(name);
        if (existing) existing.push(path);
        else this.#bySuffix.set(name, [path]);
      }
    }
  }

  /** Resolve `#include <a/b.dtsi>` or `"b.dtsi"`, or null when it is not unique. */
  #resolve(spec: string, from: string): string | null {
    const local = `${from.slice(0, from.lastIndexOf('/'))}/${spec}`;
    if (this.#tree.has(local)) return local;
    const cut = spec.lastIndexOf('/');
    const candidates = (this.#bySuffix.get(cut < 0 ? spec : spec.slice(cut + 1)) ?? []).filter(
      (path) => path === spec || path.endsWith(`/${spec}`),
    );
    return candidates.length === 1 ? candidates[0]! : null;
  }

  #read(path: string): { file: ScannedFile; text: string } | null {
    const cached = this.#scanned.get(path);
    if (cached === null) return null;
    let text: string;
    try {
      text = blankComments(this.#tree.read(path));
    } catch {
      this.#scanned.set(path, null);
      return null;
    }
    const file = cached ?? { path, nodes: scanNodes(text) };
    if (!cached) {
      this.#scanned.set(path, file);
      this.#includes.set(
        path,
        [...text.matchAll(/^\s*#\s*include\s+[<"]([^>"]+)[>"]/gm)]
          .map((match) => this.#resolve(match[1]!, path))
          .filter((resolved): resolved is string => resolved !== null),
      );
    }
    return { file, text };
  }

  /**
   * The file and everything it includes, in the order the preprocessor produces.
   *
   * Included content appears where the `#include` sits, which is at the top, so
   * a file's own declarations come after everything it includes. That order is
   * what decides which declaration of a node wins: the board overriding
   * `&sram0 { reg = <...>; }` must beat the SoC `.dtsi` that declared it, and
   * reading the chain the other way round silently returned the SoC's value for
   * every board with external memory.
   */
  chain(path: string): { files: ScannedFile[]; texts: string[] } {
    const files: ScannedFile[] = [];
    const texts: string[] = [];
    const seen = new Set<string>();
    const visit = (current: string): void => {
      if (seen.has(current)) return;
      seen.add(current);
      const read = this.#read(current);
      if (!read) return;
      for (const include of this.#includes.get(current) ?? []) visit(include);
      files.push(read.file);
      texts.push(read.text);
    };
    visit(path);
    return { files, texts };
  }
}

export function collectBoardMemory(
  tree: SourceManifest,
  boards: { name: string; dir: string; targets: string[] }[],
): CollectedBoardMemory {
  const reader = new ChainReader(tree);
  const regions: BoardMemoryRecord[] = [];
  const excluded: SourceReport['intentionallyExcluded'] = [];
  const seen = new Set<string>();
  let discovered = 0;

  for (const board of boards) {
    if (!board.dir) continue;
    // A build string names one target only when no sibling answers to it too;
    // the bare board name covers every target, and is recorded as such.
    const targetByString = new Map<string, string>();
    for (const target of board.targets) {
      for (const name of boardFileNames(target)) {
        targetByString.set(name, targetByString.has(name) ? '' : target);
      }
    }

    const sources = tree.select({ under: board.dir, match: (name) => name.endsWith('.dts') });
    // A board whose several `.dts` files name no target cannot be attributed:
    // the appcpu and procpu images of a dual-core board declare different SRAM,
    // and recording whichever file sorted first as the board's memory reports
    // one core's budget for the other. Storing nothing is the honest answer.
    const unattributable = sources.filter(
      (path) => !targetByString.has(path.slice(path.lastIndexOf('/') + 1, -'.dts'.length)),
    );
    if (unattributable.length > 1) {
      for (const path of unattributable) excluded.push({ path, reason: 'ambiguous-board-dts' });
      discovered += unattributable.length;
      continue;
    }

    for (const path of sources) {
      const name = path.slice(path.lastIndexOf('/') + 1, -'.dts'.length);
      const target = targetByString.get(name) ?? '';
      const { files, texts } = reader.chain(path);
      // Last wins, and the chain is in preprocessor order, so a board that
      // reassigns `zephyr,sram` overrides the SoC `.dtsi` that set it — which is
      // what the build does.
      const chosen = new Map<string, string>();
      for (const text of texts) {
        for (const [role, label] of chosenLabels(text)) chosen.set(role, label);
      }

      for (const [role, label] of chosen) {
        discovered++;
        const resolved = resolveRegion(files, label);
        if (typeof resolved === 'string') {
          excluded.push({ path, reason: resolved satisfies MemoryRejection });
          continue;
        }
        // One row per (board, target, role). A board whose several `.dts` files
        // resolve to the same target would otherwise contradict itself, and the
        // schema rejects it; the first in manifest order wins.
        const key = compositeKey(board.name, target, role);
        if (seen.has(key)) {
          excluded.push({ path, reason: 'duplicate-target-role' });
          continue;
        }
        seen.add(key);
        regions.push({
          board: board.name,
          target,
          role: role as BoardMemoryRecord['role'],
          label,
          node: resolved.path,
          address: resolved.address,
          size: resolved.size,
          source: resolved.source,
        });
      }
    }
  }

  regions.sort(byField((region) => compositeKey(region.board, region.target, region.role)));

  return {
    regions,
    report: {
      discovered,
      indexed: regions.length,
      intentionallyExcluded: excluded,
      warnings: [],
      errors: [],
    },
  };
}
