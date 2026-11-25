/**
 * Splits the rendered rows of a windowed list into runs that share a group, so each run can sit in a
 * `role="group"` named by that group. A windowed list drops the group heading when it scrolls out of view,
 * so the name comes from the rows themselves, not from the heading's element.
 *
 * @example
 * ```tsx
 * import { Select } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Select label="Item" items={[{ value: "a", label: "A", group: "Letters" }]} />;
 * }
 * ```
 *
 * @see /components/select
 *
 * @internal
 */
export function segmentByGroup<T>(entries: T[], groupOf: (entry: T) => string | undefined) {
  const segments: { label: string | undefined; key: string; entries: T[] }[] = [];
  const seen = new Map<string, number>();
  for (const entry of entries) {
    const label = groupOf(entry);
    const last = segments.at(-1);
    if (last && last.label === label) last.entries.push(entry);
    else {
      // Keyed by the group (not the position), so a group's wrapper survives scrolling and keeps the focused option mounted.
      const base = label ?? "\u0000";
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      segments.push({ label, key: `${base}#${n}`, entries: [entry] });
    }
  }
  return segments;
}
