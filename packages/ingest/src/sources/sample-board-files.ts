/**
 * The per-board configuration a sample or test suite ships, resolved to the
 * build target its filename names.
 *
 * Twister metadata is not the only way upstream names a board, and it is not the
 * most useful way. A suite carrying `boards/<qualified_target>.overlay`
 * configures that exact target, and those files hold what nobody would guess:
 * ST's SPI loopback overlay for the NUCLEO-N657X0-Q carries the DMA channels,
 * the request numbers and `CONFIG_NOCACHE_MEMORY=y`. Recording only
 * `platform_allow` and `integration_platforms` undercounted the material naming
 * one board by eight suites, and a session wrote its own SPI configuration from
 * scratch without learning that the vendor had published one.
 *
 * Resolution uses the same `buildStrings` the build uses to look these files up,
 * so a filename is attributed exactly where Zephyr would apply it.
 */
import { buildStrings } from '../../../shared/build-string.ts';
import { byField, compositeKey } from '../../../shared/ordering.ts';
import type { SourceManifest } from '../../../shared/source-manifest.ts';
import type { SourceReport } from '../report.ts';

export interface SampleBoardFileRecord {
  /** Sample directory, matching `sample.path`. */
  sample: string;
  /** Path relative to the sample directory. */
  path: string;
  /** Board the filename resolves to, empty when it resolves to none. */
  board: string;
  /** Qualified target, empty when the name is not one target's build string. */
  target: string;
  kind: 'overlay' | 'conf' | 'defconfig' | 'other';
}

export interface CollectedSampleBoardFiles {
  files: SampleBoardFileRecord[];
  report: SourceReport;
}

function kindOf(name: string): SampleBoardFileRecord['kind'] {
  if (name.endsWith('.overlay')) return 'overlay';
  if (name.endsWith('.conf')) return 'conf';
  if (name.endsWith('_defconfig')) return 'defconfig';
  return 'other';
}

/** The build string a filename carries, with its extension removed. */
function buildStringOf(name: string): string {
  if (name.endsWith('_defconfig')) return name;
  const dot = name.lastIndexOf('.');
  return dot < 0 ? name : name.slice(0, dot);
}

export function collectSampleBoardFiles(
  tree: SourceManifest,
  samples: string[],
  boards: { name: string; targets: string[] }[],
): CollectedSampleBoardFiles {
  // A build string names one board, and names one target only when no sibling
  // target answers to it as well. `nucleo_n657x0_q` is every target of that
  // board; `nucleo_n657x0_q_stm32n657xx_sb` is one.
  const boardByString = new Map<string, string>();
  const targetByString = new Map<string, string>();
  for (const board of boards) {
    for (const target of board.targets.length > 0 ? board.targets : [board.name]) {
      for (const name of buildStrings(target)) {
        boardByString.set(name, boardByString.has(name) && boardByString.get(name) !== board.name ? '' : board.name);
        targetByString.set(name, targetByString.has(name) ? '' : target);
      }
    }
  }

  const files: SampleBoardFileRecord[] = [];
  const excluded: SourceReport['intentionallyExcluded'] = [];
  let discovered = 0;

  for (const sample of samples) {
    // Read from the manifest rather than from the sample's stored contents: a
    // file too large to store is still evidence that upstream configures this
    // target, and the size policy must not decide what the corpus knows exists.
    for (const path of tree.select({ under: `${sample}/boards`, match: () => true })) {
      const relative = path.slice(sample.length + 1);
      // Only the immediate `boards/` directory: a nested path is not a name the
      // build constructs.
      if (relative.split('/').length !== 2) {
        excluded.push({ path, reason: 'nested-board-path' });
        discovered++;
        continue;
      }
      discovered++;
      const name = relative.slice('boards/'.length);
      const string = buildStringOf(name);
      files.push({
        sample,
        path: relative,
        board: boardByString.get(string) ?? '',
        target: targetByString.get(string) ?? '',
        kind: kindOf(name),
      });
    }
  }

  files.sort(byField((record) => compositeKey(record.sample, record.path)));
  return {
    files,
    report: {
      discovered,
      indexed: files.length,
      intentionallyExcluded: excluded,
      warnings: [],
      errors: [],
    },
  };
}
