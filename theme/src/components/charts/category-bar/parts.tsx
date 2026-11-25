import { num } from "../chart-utils";
import { ChartValueTable, defaultCompact, defaultPercent } from "../heatmap";
import { defaultCategoryBarLabels, type CategoryBarProps } from "./model";

/* ---------- Table view ---------- */

/**
 * Props of CategoryBarTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type CategoryBarTableProps = Pick<
  CategoryBarProps,
  "data" | "start" | "format" | "locale" | "marker" | "markerLabel" | "labels"
> & {
  /** Formats a share of the total for the data table cells: takes the share, returns the text shown. Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
};

/**
 * Every band with its span and share of the scale, then where the marker falls.
 *
 * Props: the bar's `data`, `start`, `marker`, `markerLabel`, `format`, `locale` and `labels`, plus `formatPercent` and `caption` (hidden, names the table). A real table: each band's span and share, then where the marker falls. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { CategoryBarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CategoryBarTable data={[{ label: "Poor", value: 580 }, { label: "Good", value: 130 }]} start={300} marker={655} caption="Credit score bands" />
 *   );
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function CategoryBarTable({
  data,
  start = 0,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  marker,
  markerLabel,
  labels: labelOverrides,
  caption,
}: CategoryBarTableProps) {
  const t = { ...defaultCategoryBarLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const values = data.map((d) => Math.max(0, num(d.value)));
  const bands = data.map((d, i) => {
    const value = values[i] ?? 0;
    const from = values.slice(0, i).reduce((sum, v) => sum + v, start);
    return { label: d.label, from, to: from + value, value };
  });
  const at = values.reduce((sum, v) => sum + v, start);
  const total = at - start;
  const hasMarker = marker !== null && marker !== undefined && Number.isFinite(marker) && total > 0;
  const value = hasMarker ? marker : start;
  const inBand =
    hasMarker && value >= start && value <= at
      ? bands.find((b, i) => value < b.to || i === bands.length - 1)
      : undefined;
  const where = !hasMarker
    ? ""
    : value > at
      ? t.markerAbove(format(value))
      : value < start
        ? t.markerBelow(format(value))
        : inBand
          ? t.markerIn(format(value), inBand.label)
          : format(value);
  return (
    <div className="flex flex-col gap-3">
      <ChartValueTable
        caption={caption}
        emptyState={t.empty}
        columns={[{ label: t.band }, { label: t.from }, { label: t.to }, { label: t.share }]}
        rows={bands.map((b) => [b.label, format(b.from), format(b.to), pct(total > 0 ? b.value / total : NaN)])}
      />
      {hasMarker && (
        <p className="text-sm text-sheen-fg-muted">
          {markerLabel ?? t.marker}: <span className="font-semibold text-sheen-fg tabular-nums">{where}</span>
        </p>
      )}
    </div>
  );
}
