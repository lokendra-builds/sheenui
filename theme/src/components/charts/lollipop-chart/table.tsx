import { ChartValueTable, defaultCompact } from "../heatmap";
import { isolate } from "../chart-pointer";
import { signedText } from "../kits/histogram-kit/kit";
import { defaultLollipopChartLabels, type LollipopChartProps, resolveRows } from "./model";

/* ---------- Table view ---------- */

/**
 * Props of LollipopTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type LollipopTableProps = Pick<
  LollipopChartProps,
  "data" | "sort" | "format" | "locale" | "reference" | "labels" | "valueLabel"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every item with its value (and its difference from the reference line), in the chart's order.
 *
 * Props: the chart's `data`, `sort`, `format`, `locale`, `reference`, `labels` and `valueLabel`, plus `caption` (hidden, names the table) and `className`. A real table: each item with its value and difference from the reference line. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { LollipopTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LollipopTable data={[{ label: "Berlin", value: 82 }, { label: "Paris", value: 74 }]} reference={{ value: 70, label: "Average" }} caption="Customer satisfaction by city" />
 *   );
 * }
 * ```
 *
 * @see /charts/lollipop
 */
export function LollipopTable({
  data,
  sort = "none",
  format: formatProp,
  locale,
  reference,
  labels,
  valueLabel,
  caption,
  className,
}: LollipopTableProps) {
  const t = { ...defaultLollipopChartLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const rows = resolveRows(data, sort, 1, null);
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.item },
        { label: valueLabel ?? t.value },
        ...(reference ? [{ label: t.versus(reference.label) }] : []),
      ]}
      rows={rows.map((r) => {
        const diff = reference ? r.value - reference.value : 0;
        // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
        return [r.label, isolate(format(r.value)), ...(reference ? [isolate(signedText(diff, format(diff)))] : [])];
      })}
    />
  );
}
