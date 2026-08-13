/**
 * The one comparator the index is sorted with.
 *
 * `String.prototype.localeCompare` resolves against the environment's collator:
 * `Intl.Collator().resolvedOptions().locale` answers `en-US`, `de-DE`, `tr-TR` or
 * `und` depending on `LC_ALL`, and the result follows. Sorting the API corpus
 * with a Turkish collator moves 20,968 of 84,934 symbols, because it mixes
 * `acpi_current_resource_free` with `ACPI_DMAR_FLAG_*` and Turkish `i`/`I`
 * collation cascades through the whole list. Row counts are identical either way,
 * so nothing in the gate could see it: two machines built measurably different
 * indexes and both passed.
 *
 * Code-unit order depends on nothing outside the data. It is also what SQLite's
 * default `BINARY` collation uses, so the order rows are written in and the order
 * `ORDER BY name` returns them in finally agree — they did not before.
 */
export function byCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Sort by one string-valued field, in code-unit order. */
export function byField<T>(field: (item: T) => string): (left: T, right: T) => number {
  return (left, right) => byCodeUnits(field(left), field(right));
}
