import { ChartValueTable, defaultCompact, defaultPercent } from "../heatmap";
import { isolate } from "../chart-pointer";
import { defaultPopulationPyramidLabels, resolvePyramidRows, type PopulationPyramidProps } from "./model";

/**
 * Props of PopulationPyramidTable, the table view of the chart: the chart's data and formatting props
 * plus a hidden `caption` for screen readers.
 */
export type PopulationPyramidTableProps = Pick<
  PopulationPyramidProps,
  "data" | "share" | "format" | "formatPercent" | "locale" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every group with the size of each side and the total, and (with `share`) its share of the population.
 *
 * Props: the chart's `data`, `share`, `format`, `formatPercent`, `locale` and `labels`, plus `caption` (hidden, names the table) and `className`. A real table: each group with both sides and their total. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { PopulationPyramidTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopulationPyramidTable
 *       data={[{ label: "0–19", start: 9.1, end: 8.7 }, { label: "20–39", start: 10.4, end: 10.2 }]}
 *       caption="Population by age group"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/population-pyramid
 */
export function PopulationPyramidTable({
  data,
  share = false,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  labels,
  caption,
  className,
}: PopulationPyramidTableProps) {
  const t = { ...defaultPopulationPyramidLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.group },
        { label: t.start },
        { label: t.end },
        { label: t.total },
        ...(share ? [{ label: t.shareOfTotal }] : []),
      ]}
      rows={resolvePyramidRows(data).map((r) => [
        r.label,
        isolate(format(r.start)),
        isolate(format(r.end)),
        isolate(format(r.total)),
        ...(share ? [isolate(pct(r.share))] : []),
      ])}
    />
  );
}
