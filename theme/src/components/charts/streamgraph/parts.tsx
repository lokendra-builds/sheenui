"use client";

import { useMemo } from "react";

import { SeriesTable } from "../chart-fit";
import { defaultCompact } from "../heatmap";
import { useTableRows } from "../category-bar";
import { defaultStreamgraphLabels, type StreamgraphProps, foldStreamSeries, layerColor } from "./model";

/* ---------- Table view ---------- */

/**
 * Props of StreamgraphTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type StreamgraphTableProps = Pick<
  StreamgraphProps,
  "data" | "index" | "series" | "format" | "locale" | "labels"
> & {
  /** Sets the header of the first column. */
  indexLabel?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
};

/**
 * One row per x value, one column per layer, plus the total.
 *
 * Props: the chart's `data`, `index`, `series`, `format`, `locale` and `labels`, plus `indexLabel` (first column header) and `caption` (hidden, names the table). A real table: one row per x value, one column per layer, plus the total. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { StreamgraphTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StreamgraphTable
 *       data={[{ year: "2022", rock: 30, pop: 45 }]}
 *       index="year"
 *       series={[
 *         { key: "rock", label: "Rock" },
 *         { key: "pop", label: "Pop" },
 *       ]}
 *       indexLabel="Year"
 *       caption="Listening share by genre"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/streamgraph
 */
export function StreamgraphTable({
  data,
  index,
  series,
  format: formatProp,
  locale,
  labels: labelOverrides,
  indexLabel,
  caption,
}: StreamgraphTableProps) {
  const t = { ...defaultStreamgraphLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const { rows, series: layers } = useMemo(() => foldStreamSeries(data, series, t.other), [data, series, t.other]);
  // The first rows render with the tab switch and the rest right after it, so opening the table stays instant.
  const { rows: shown } = useTableRows(rows, { first: 12, cap: Infinity });
  return (
    <SeriesTable
      data={shown}
      index={index}
      indexLabel={indexLabel}
      caption={caption}
      format={format}
      noData={t.empty}
      plotted={(v) => Math.max(0, v)}
      columns={layers.map((s, i) => ({ key: s.key, label: s.label, color: layerColor(s, i) }))}
      total={{ label: t.total, keys: layers.map((s) => s.key) }}
    />
  );
}
