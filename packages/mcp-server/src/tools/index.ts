import type { Index } from '../db.ts';
import type { Tool } from '../protocol.ts';

import { getApi, searchApi } from './api.ts';
import { getBoard, searchBoards } from './boards.ts';
import { checkConfig } from './check.ts';
import { checkEnvironment } from './environment.ts';
import type { ToolFactory } from './common.ts';
import { getBinding, searchBindings } from './devicetree.ts';
import { getDoc, searchDocs } from './docs.ts';
import { getKconfig, searchKconfig } from './kconfig.ts';
import { getSample, searchSamples } from './samples.ts';
import { getSource } from './source.ts';
import { indexStatus } from './status.ts';
import { getRunner } from './west.ts';

/**
 * Tool order matters a little: clients present tools in this order, so the ones
 * that prevent the most wasted build cycles come first. `check_config` leads
 * because it settles a whole file in one call, and the per-symbol lookups follow
 * in the order the three commonest failures occur — Kconfig, devicetree, board.
 */
const FACTORIES: ToolFactory[] = [
  checkConfig,
  checkEnvironment,
  searchKconfig,
  getKconfig,
  searchBindings,
  getBinding,
  searchBoards,
  getBoard,
  getRunner,
  searchApi,
  getApi,
  searchSamples,
  getSample,
  searchDocs,
  getDoc,
  getSource,
  indexStatus,
];

export function createTools(index: () => Index): Tool[] {
  return FACTORIES.map((factory) => factory(index));
}
