import { type ReactNode } from "react";

import { ChartValueTable, defaultCompact } from "../heatmap";
import { type ChordDiagramProps, fold } from "./model";

/* ---------- Table view ---------- */

/**
 * Props of ChordTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type ChordTableProps = Pick<ChordDiagramProps, "groups" | "matrix" | "format" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Column headers. Merged over {@link defaultChordTableLabels}. */
  labels?: Partial<ChordTableLabels>;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/** The text of `ChordTable`: the first column's header, the row-total header and the name of the folded "other" group. */
export type ChordTableLabels = {
  /** Sets the header of the first column. */
  corner: string;
  /** Header of the row-total column. */
  total: string;
  /** Name of the group that sums the flows to every other group. */
  other: string;
};

/** English defaults of {@link ChordTableLabels}. */
export const defaultChordTableLabels: ChordTableLabels = {
  corner: "From \\ To",
  total: "Total out",
  other: "Other",
};

/**
 * The flow matrix as a table: one row per source group, one column per target, plus row totals.
 *
 * Props: the chart's `groups`, `matrix`, `format` and `locale`, plus `caption` (hidden, names the table), `labels` (`corner`, `total`, `other` headers) and `emptyState`. A real table: one row per source group, one column per target, plus row totals. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { ChordTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChordTable groups={[{ id: "eu", label: "Europe" }, { id: "us", label: "US" }]} matrix={[[0, 12], [9, 0]]} caption="Trade flows between regions" />
 *   );
 * }
 * ```
 *
 * @see /charts/chord-diagram
 */
export function ChordTable({
  groups: groupsIn,
  matrix: matrixIn,
  format: formatProp,
  locale,
  caption,
  labels,
  emptyState,
}: ChordTableProps) {
  const { corner: cornerLabel, total: totalLabel, other: otherLabel } = { ...defaultChordTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const { groups, matrix } = fold(groupsIn, matrixIn, otherLabel);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: cornerLabel }, ...groups.map((g) => ({ label: g.label })), { label: totalLabel }]}
      rows={groups.map((g, i) => [
        g.label,
        ...groups.map((_, j) => format(matrix[i]?.[j] ?? 0)),
        <strong className="font-semibold">{format((matrix[i] ?? []).reduce((s, v) => s + v, 0))}</strong>,
      ])}
    />
  );
}
