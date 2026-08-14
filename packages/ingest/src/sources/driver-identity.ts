/**
 * The identity contract each in-tree driver enforces at initialisation.
 *
 * See `parsers/driver-identity.ts` for what is recognised and why it is narrow.
 * This collector supplies the files and resolves `DT_DRV_COMPAT` tokens against
 * the binding catalogue; it decides nothing about the C.
 */
import type { SourceManifest } from '../../../shared/source-manifest.ts';
import { byField } from '../../../shared/ordering.ts';
import {
  type DriverIdentity,
  type IdentityValue,
  IDENTITY_NAME,
  compatibleIndex,
  readDriverIdentity,
} from '../parsers/driver-identity.ts';

/**
 * The parser's own pattern, without the end anchor, applied to a whole file.
 *
 * `_ID$` anchors a macro name; here the same token appears mid-file, so the
 * anchor is dropped and the rest is reused verbatim.
 */
const PREFILTER = new RegExp(IDENTITY_NAME.source.replace('_ID$', '_ID'));
import type { SourceReport } from '../report.ts';

export interface IdentityRecord {
  compatible: string;
  /** Tree path of the driver source the contract was read from. */
  driverFile: string;
  registerName: string;
  register: number | null;
  values: IdentityValue[];
}

export interface CollectedIdentities {
  identities: IdentityRecord[];
  report: SourceReport;
}

/** Headers a driver's constants can live in: the ones beside its source. */
function siblingHeaders(tree: SourceManifest, directory: string): string[] {
  return tree.select({ under: directory, match: (name) => name.endsWith('.h') })
    .filter((path) => path.slice(directory.length + 1).indexOf('/') < 0);
}

export function collectDriverIdentities(
  tree: SourceManifest,
  compatibles: Iterable<string>,
): CollectedIdentities {
  const byToken = compatibleIndex(compatibles);
  const errors: SourceReport['errors'] = [];
  const excluded: SourceReport['intentionallyExcluded'] = [];
  const identities: IdentityRecord[] = [];
  // The denominator is the population this claims to extract from: driver
  // sources that check something against an identity-shaped constant. Counting
  // every driver instead would report a 4% hit rate for a corpus that is not
  // trying to describe a UART controller.
  let candidates = 0;

  const headersByDirectory = new Map<string, string[]>();

  for (const path of tree.select({ under: 'drivers/', match: (name) => name.endsWith('.c') })) {
    let source: string;
    try {
      source = tree.read(path);
    } catch (error) {
      errors.push({ path, code: 'driver-read', message: (error as Error).message });
      continue;
    }
    // Cheap pre-filter before the sibling headers are read: a driver with no
    // identity-shaped token in it cannot produce a record, and there are 2400
    // of them. The pattern is the parser's own, so the filter cannot narrow what
    // the parser would have accepted.
    if (!PREFILTER.test(source)) continue;

    const directory = path.slice(0, path.lastIndexOf('/'));
    let headers = headersByDirectory.get(directory);
    if (!headers) {
      headers = siblingHeaders(tree, directory);
      headersByDirectory.set(directory, headers);
    }

    const sources = [source];
    let failed = false;
    for (const header of headers) {
      try {
        sources.push(tree.read(header));
      } catch (error) {
        errors.push({ path: header, code: 'driver-header-read', message: (error as Error).message });
        failed = true;
      }
    }
    if (failed) continue;

    const result: DriverIdentity | string = readDriverIdentity(sources);
    if (typeof result === 'string') {
      // Not a candidate at all: no compatible, or nothing compared. Only the
      // second says a driver looked like one and was not read.
      if (result === 'no-identity-comparison' || result === 'no-drv-compat') continue;
      candidates++;
      excluded.push({ path, reason: result });
      continue;
    }
    candidates++;

    const resolved = result.compatTokens
      .map((token) => byToken.get(token) ?? '')
      .filter((compatible) => compatible !== '');
    if (resolved.length === 0) {
      excluded.push({ path, reason: 'unresolved-drv-compat' });
      continue;
    }
    if (result.values.length === 0) {
      excluded.push({ path, reason: 'no-accepted-value' });
      continue;
    }

    for (const compatible of resolved) {
      identities.push({
        compatible,
        driverFile: path,
        registerName: result.registerName,
        register: result.register,
        values: result.values,
      });
    }
  }

  identities.sort(byField((record) => `${record.compatible} ${record.driverFile}`));
  return {
    identities,
    report: {
      // One record per compatible, so a driver naming two compatibles indexes
      // twice from one candidate; the accounting counts drivers, not rows.
      discovered: candidates,
      indexed: candidates - excluded.length - errors.length,
      intentionallyExcluded: excluded,
      warnings: [],
      errors,
    },
  };
}
