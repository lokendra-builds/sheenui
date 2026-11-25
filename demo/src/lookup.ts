/**
 * `record[key]`, typed `T | undefined`. The demo does not enable `noUncheckedIndexedAccess` (the
 * library does), so reading a map whose key may be missing goes through this to keep that case in the type.
 */
export function lookup<T>(record: Readonly<Record<string, T>>, key: string): T | undefined {
  return record[key];
}

/** `items[index]`, typed `T | undefined` (see `lookup`): an index past the end is a normal case. */
export function itemAt<T>(items: readonly T[], index: number): T | undefined {
  return items[index];
}
