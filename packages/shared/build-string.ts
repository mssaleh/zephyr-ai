/**
 * The filenames a Zephyr build target picks up, built the way Zephyr builds them.
 *
 * Zephyr selects board overlays, `.conf` fragments and defconfigs by constructing
 * names and testing whether the file exists. Nothing reports a file that matched
 * nothing, so a board overlay whose name does not match the *qualified* target is
 * ignored in silence and the build fails much later — typically as an undefined
 * devicetree symbol like `__device_dts_ord_DT_N_ALIAS_die_temp_ORD undeclared`,
 * which reads as a mistake in the C rather than a file that was never read.
 *
 * `zephyr_build_string` in `cmake/modules/extensions.cmake` splits
 * `BOARD_QUALIFIERS` on `/` and joins the board with each segment using `_`,
 * which is why upstream's own file is
 * `tests/drivers/flash/common/boards/stm32n6570_dk_stm32n657xx_sb.conf`.
 */

/** The `<board>[@revision][/soc[/cluster]]` form used as a build target. */
export interface ParsedTarget {
  board: string;
  revision: string;
  qualifiers: string[];
}

export function parseTarget(identifier: string): ParsedTarget {
  const [head = '', ...qualifiers] = identifier.split('/');
  const at = head.indexOf('@');
  return {
    board: at < 0 ? head : head.slice(0, at),
    revision: at < 0 ? '' : head.slice(at + 1),
    qualifiers: qualifiers.filter(Boolean),
  };
}

/**
 * Every basename this target matches, least specific first.
 *
 * Zephyr applies all of them that exist rather than only the closest, so the
 * order is the merge order: a value set in a more qualified file wins. The
 * revision form is included because upstream builds it the same way, joining the
 * revision with `_` after the board.
 */
export function buildStrings(identifier: string): string[] {
  const { board, revision, qualifiers } = parseTarget(identifier);
  if (!board) return [];
  const names: string[] = [];
  const push = (value: string) => {
    if (value && !names.includes(value)) names.push(value);
  };

  push(board);
  for (let depth = 1; depth <= qualifiers.length; depth++) {
    push([board, ...qualifiers.slice(0, depth)].join('_'));
  }
  if (revision) {
    const withRevision = `${board}_${revision.replace(/\./g, '_')}`;
    push(withRevision);
    for (let depth = 1; depth <= qualifiers.length; depth++) {
      push([withRevision, ...qualifiers.slice(0, depth)].join('_'));
    }
  }
  return names;
}

/** The board-level overlay and `.conf` an application may add for this target. */
export function targetFileNames(identifier: string): { overlay: string[]; conf: string[]; defconfig: string[] } {
  const names = buildStrings(identifier);
  return {
    overlay: names.map((name) => `${name}.overlay`),
    conf: names.map((name) => `${name}.conf`),
    defconfig: names.map((name) => `${name}_defconfig`),
  };
}
