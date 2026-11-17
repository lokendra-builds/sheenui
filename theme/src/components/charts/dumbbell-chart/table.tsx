import { ChartValueTable, defaultCompact, defaultPercent } from "../heatmap";
import { isolate } from "../chart-pointer";
import { signedText } from "../kits/histogram-kit/kit";
import { defaultDumbbellChartLabels, type DumbbellChartProps, resolveRows } from "./model";

/* ---------- Table view ---------- */

/**
 * Props of DumbbellTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type DumbbellTableProps = Pick<
  DumbbellChartProps,
  "data" | "sort" | "fromLabel" | "toLabel" | "format" | "formatPercent" | "locale" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every item's two values, its change and its percent change.
 *
 * Props: the chart's `data`, `sort`, `fromLabel`, `toLabel`, `format`, `formatPercent`, `locale` and `labels`, plus `caption` (hidden, names the table) and `className`. A real table: each item's two values, its change and its percent change. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { DumbbellTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DumbbellTable data={[{ label: "Checkout", from: 3.2, to: 4.1 }]} fromLabel="Q1" toLabel="Q2" caption="Satisfaction score, Q1 to Q2" />
 *   );
 * }
 * ```
 *
 * @see /charts/dumbbell
 */
export function DumbbellTable({
  data,
  sort = "none",
  fromLabel,
  toLabel,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  labels,
  caption,
  className,
}: DumbbellTableProps) {
  const t = { ...defaultDumbbellChartLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const rows = resolveRows(data, sort, null);
  const signed = signedText;
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.item },
        { label: fromLabel ?? t.from },
        { label: toLabel ?? t.to },
        { label: t.change },
        { label: t.percentChange },
      ]}
      // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
      rows={rows.map((r) => [
        r.label,
        isolate(format(r.from)),
        isolate(format(r.to)),
        r.diff === 0 ? t.noChange : isolate(signed(r.diff, format(r.diff))),
        Number.isFinite(r.ratio) && r.diff !== 0 ? isolate(signed(r.ratio, pct(r.ratio))) : "–",
      ])}
    />
  );
}
