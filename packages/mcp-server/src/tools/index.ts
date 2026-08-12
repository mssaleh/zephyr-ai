import type { Index } from '../db.ts';
import type { Tool } from '../protocol.ts';

import { getApi, searchApi } from './api.ts';
import { getBoard, searchBoards } from './boards.ts';
import type { ToolFactory } from './common.ts';
import { getBinding, searchBindings } from './devicetree.ts';
import { getDoc, searchDocs } from './docs.ts';
import { getKconfig, searchKconfig } from './kconfig.ts';
import { getSample, searchSamples } from './samples.ts';
import { indexStatus } from './status.ts';

/**
 * Tool order matters a little: clients present tools in this order, and the
 * three that prevent the most wasted build cycles come first.
 */
const FACTORIES: ToolFactory[] = [
  searchKconfig,
  getKconfig,
  searchBindings,
  getBinding,
  searchBoards,
  getBoard,
  searchApi,
  getApi,
  searchSamples,
  getSample,
  searchDocs,
  getDoc,
  indexStatus,
];

export function createTools(index: () => Index): Tool[] {
  return FACTORIES.map((factory) => factory(index));
}
