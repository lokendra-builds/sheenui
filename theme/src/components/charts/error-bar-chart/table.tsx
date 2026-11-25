import { ChartValueTable, defaultCompact } from "../heatmap";
import { isolate } from "../chart-pointer";
import { defaultErrorBarChartLabels, resolveErrorRows, type ErrorBarChartProps } from "./model";

/**
 * Props of ErrorBarTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type ErrorBarTableProps = Pick<
  ErrorBarChartProps,
  "data" | "format" | "locale" | "valueLabel" | "intervalLabel" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every item with its estimate and the lower and upper end of its interval.
 *
 * Props: the chart's `data`, `format`, `locale`, `valueLabel`, `intervalLabel` and `labels`, plus `caption` (hidden, names the table) and `className`. A real table: each item with its estimate and both interval ends. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { ErrorBarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ErrorBarTable
 *       data={[{ label: "Control", value: 12.4, low: 11.1, high: 13.7 }, { label: "Variant", value: 14.2, low: 12.9, high: 15.5 }]}
 *       caption="Conversion rate with 95% intervals"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/error-bar-chart
 */
export function ErrorBarTable({
  data,
  format: formatProp,
  locale,
  valueLabel,
  intervalLabel,
  labels,
  caption,
  className,
}: ErrorBarTableProps) {
  const t = { ...defaultErrorBarChartLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const name = intervalLabel ?? t.intervalName;
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.item },
        { label: valueLabel ?? t.value },
        { label: `${t.lower} (${name})` },
        { label: `${t.upper} (${name})` },
      ]}
      rows={resolveErrorRows(data, 1).map((r) => [
        r.label,
        isolate(format(r.value)),
        isolate(format(r.low)),
        isolate(format(r.high)),
      ])}
    />
  );
}
