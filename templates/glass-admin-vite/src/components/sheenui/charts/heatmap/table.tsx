import type { ComponentProps } from "react";
import { type ReactNode } from "react";

import { ChartValueTable } from "../chart-tip";
export {
  useEntrance,
  placeChartTip,
  ChartTip,
  ChartValueTable,
  type ChartTipAnchor,
  type ChartTipSide,
  type ChartTipProps,
  type ChartValueTableColumn,
  type ChartValueTableProps,
} from "../chart-tip";
import { defaultCompact, ChartDockHint, MissingValue, type HeatmapProps, valueOrNull } from "./kit";

/* ---------- Table view ---------- */

/**
 * Props of HeatmapTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type HeatmapTableProps = Pick<HeatmapProps, "data" | "index" | "columns" | "format" | "locale"> & {
  /** Sets the header of the row-label column. */
  indexLabel?: string;
  /** Visually hidden caption that names the table. */
  caption?: string;
  /** Text for a cell that has no value. */
  noDataLabel?: string;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every heatmap value as a table: rows × columns, missing cells read "No data".
 *
 * @example
 * ```tsx
 * import { HeatmapTable } from "@sheenui/theme";
 *
 * const columns = [
 *   { key: "am", label: "Morning" },
 *   { key: "pm", label: "Evening" },
 * ];
 * const data = [
 *   { day: "Mon", am: 12, pm: 30 },
 *   { day: "Tue", am: 18, pm: 22 },
 * ];
 *
 * export function Example() {
 *   return (
 *     <HeatmapTable data={data} index="day" columns={columns} indexLabel="Day" caption="Traffic table" />
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function HeatmapTable({
  data,
  index,
  columns,
  format: formatProp,
  locale,
  indexLabel,
  caption,
  noDataLabel,
  emptyState,
}: HeatmapTableProps) {
  const format = formatProp ?? defaultCompact(locale);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: indexLabel ?? index }, ...columns.map((c) => ({ label: c.label }))]}
      rows={data.map((row) => [
        String(row[index] ?? ""),
        ...columns.map((c) => {
          const v = valueOrNull(row[c.key]);
          return v === null ? <MissingValue label={noDataLabel} /> : format(v);
        }),
      ])}
    />
  );
}

/** Props of {@link MissingValue}. A table cell without a value: a dash, read as `label` ("No data", "Not applicable"...). */
export type MissingValueProps = ComponentProps<typeof MissingValue>;

/** Props of {@link ChartDockHint}. Muted hint in the band a narrow chart reserves for its docked readout, shown while nothing is being read, so the band is never just empty space. */
export type ChartDockHintProps = ComponentProps<typeof ChartDockHint>;
