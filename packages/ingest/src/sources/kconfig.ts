import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import KCONFIG_EXPORTER from '../adapters/kconfig-export.py';
import { semanticPython } from '../python.ts';

export interface KconfigExpr {
  kind: string;
  value?: string;
  display: string;
  children?: KconfigExpr[];
}

export interface KconfigDefault {
  value: KconfigExpr;
  condition: KconfigExpr;
  order: number;
}

export interface KconfigRelation {
  target: string;
  condition: KconfigExpr;
  order: number;
}

export interface KconfigRange {
  low: KconfigExpr;
  high: KconfigExpr;
  condition: KconfigExpr;
  order: number;
}

export interface KconfigDefinition {
  file: string;
  line: number;
  prompt: string | null;
  promptCondition: KconfigExpr | null;
  menuPath: string[];
  condition: KconfigExpr;
  defaults: KconfigDefault[];
  selects: KconfigRelation[];
  implies: KconfigRelation[];
  ranges: KconfigRange[];
  isMenuconfig: boolean;
  isConfigDefault: boolean;
}

export interface SemanticKconfigSymbol {
  name: string;
  type: string | null;
  help: string | null;
  hasPrompt: boolean;
  choice: string | null;
  definitions: KconfigDefinition[];
}

export interface SemanticKconfigChoice {
  id: string;
  name: string | null;
  type: string | null;
  definitions: Array<{
    file: string;
    line: number;
    prompt: string | null;
    condition: KconfigExpr;
  }>;
  members: string[];
}

export interface CollectedKconfig {
  symbols: SemanticKconfigSymbol[];
  choices: SemanticKconfigChoice[];
  filesScanned: number;
  warnings: string[];
}

const CACHE = new Map<string, CollectedKconfig>();

/**
 * The Kconfig namespaces a Zephyr tree defines.
 *
 * `zephyr` is the application tree written as `CONFIG_`. `sysbuild` is rooted at
 * `share/sysbuild/Kconfig` and written as `SB_CONFIG_`, the prefix set by
 * `share/sysbuild/cmake/modules/sysbuild_kconfig.cmake`. They are separate
 * namespaces that share most of their symbol names and not their meanings:
 * `BOOTLOADER_MCUBOOT` marks an image as chain-loaded in one and selects MCUboot
 * as the bootloader to build in the other.
 */
export const KCONFIG_SCOPES = {
  zephyr: 'Kconfig',
  sysbuild: 'share/sysbuild/Kconfig',
} as const;

export type KconfigScope = keyof typeof KCONFIG_SCOPES;

/** Evaluate the canonical source graph through Zephyr's own Kconfiglib. */
export function collectKconfig(
  root: string,
  moduleRoots: string[] = [],
  scope: KconfigScope = 'zephyr',
): CollectedKconfig {
  const cacheKey = JSON.stringify([root, [...moduleRoots].sort(), scope]);
  const cached = CACHE.get(cacheKey);
  if (cached) return cached;
  const library = join(root, 'scripts', 'kconfig', 'kconfiglib.py');
  if (!existsSync(library)) {
    throw new Error(`The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.`);
  }

  const temporary = mkdtempSync(join(tmpdir(), 'zephyr-ai-kconfig-'));
  const exporter = join(temporary, 'kconfig-export.py');
  const buildDir = join(temporary, 'generated');
  try {
    writeFileSync(exporter, KCONFIG_EXPORTER, { mode: 0o600 });
    const args = [exporter, '--zephyr', root, '--build-dir', buildDir, '--root', KCONFIG_SCOPES[scope]];
    for (const moduleRoot of moduleRoots) args.push('--module', moduleRoot);
    const result = spawnSync(semanticPython(root), args, {
      // Kconfiglib resolves `source "Kconfig.zephyr"` against the process
      // working directory even when the top-level Kconfig path is absolute.
      // Pinning cwd makes collection independent of the caller's directory.
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    if (result.status !== 0) {
      const detail = result.stderr.trim().split('\n').slice(-8).join('\n');
      throw new Error(`Zephyr Kconfiglib export failed.\n${detail}`);
    }
    const parsed = JSON.parse(result.stdout) as Omit<CollectedKconfig, 'filesScanned'> & {
      files: string[];
    };
    const collected = {
      symbols: parsed.symbols,
      choices: parsed.choices,
      filesScanned: parsed.files.length,
      warnings: parsed.warnings,
    };
    CACHE.set(cacheKey, collected);
    return collected;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
