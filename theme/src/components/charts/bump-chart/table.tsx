import { ChartValueTable, defaultCompact } from "../heatmap";
import { isolate } from "../chart-pointer";
import { bumpModel, defaultBumpChartLabels, type BumpChartProps } from "./model";

/**
 * Props of BumpTable, the table view of the chart: the chart's data props plus a hidden `caption`
 * for screen readers.
 */
export type BumpTableProps = Pick<
  BumpChartProps,
  "data" | "index" | "series" | "rankBy" | "higherIsBetter" | "format" | "locale" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every point in time with each series' rank (and its value), one column per series.
 *
 * Props: the chart's `data`, `index`, `series`, `rankBy`, `higherIsBetter`, `format`, `locale` and `labels`, plus `caption` (hidden, names the table) and `className`. A real table: one row per period, one column per series, each cell "rank (value)". Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { BumpTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BumpTable
 *       data={[{ year: "2023", ada: 82, bo: 77 }, { year: "2024", ada: 74, bo: 90 }]}
 *       index="year"
 *       series={[{ key: "ada", label: "Ada" }, { key: "bo", label: "Bo" }]}
 *       caption="Ranking by year"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bump-chart
 */
export function BumpTable({
  data,
  index,
  series,
  rankBy = "value",
  higherIsBetter = true,
  format: formatProp,
  locale,
  labels,
  caption,
  className,
}: BumpTableProps) {
  const t = { ...defaultBumpChartLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const m = bumpModel(data, index, series, rankBy, higherIsBetter);
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[{ label: t.period }, ...m.series.map((s) => ({ label: s.label }))]}
      // Numbers are isolated so right-to-left pages keep each one whole.
      rows={m.periods.map((p, i) => [
        p,
        ...m.series.map((s) =>
          isolate(rankBy === "rank" ? `#${s.ranks[i]}` : `#${s.ranks[i]} (${format(s.values[i] ?? 0)})`),
        ),
      ])}
    />
  );
}
