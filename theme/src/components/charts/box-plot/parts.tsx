import { ChartValueTable, defaultCompact } from "../heatmap";
import { isolate } from "../chart-pointer";
import { defaultBoxPlotLabels, type BoxPlotProps, boxPlotStats, type GroupMark } from "./model";

/** Paint of one mark: fills for shapes, neutral ink for whiskers, a surface ring around dots. */
export function markPaint(m: GroupMark, color: string, violin: boolean): React.SVGProps<SVGPathElement> {
  const ink = violin ? "var(--sheen-fg)" : "var(--sheen-fg-subtle)";
  switch (m.role) {
    case "violin":
      return {
        fill: color,
        fillOpacity: 0.26,
        stroke: color,
        strokeWidth: 1.5,
        strokeLinejoin: "round",
        className: "forced-colors:stroke-[CanvasText]",
      };
    case "whisker":
    case "cap":
      return { fill: "none", stroke: ink, strokeWidth: 1.5, strokeLinecap: "round" };
    case "box":
      return { style: { fill: violin ? "var(--sheen-fg)" : color }, className: "forced-colors:stroke-[CanvasText]" };
    case "median":
      return m.kind === "dot"
        ? { fill: "var(--sheen-chart-surface)" }
        : { fill: "none", stroke: "var(--sheen-chart-surface)", strokeWidth: 2.5 };
    case "mean":
      return {
        fill: "var(--sheen-chart-surface)",
        stroke: "var(--sheen-fg)",
        strokeWidth: 1.5,
        strokeLinejoin: "round",
      };
    default:
      return { fill: color, stroke: "var(--sheen-chart-surface)", strokeWidth: 2 };
  }
}

/* ---------- Table view ---------- */

/**
 * Props of BoxPlotTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type BoxPlotTableProps = Pick<BoxPlotProps, "data" | "whisker" | "format" | "locale" | "labels"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every group's statistics in text: n, min, quartiles, median, max, mean and the outliers.
 *
 * Props: the chart's `data`, `whisker`, `format`, `locale` and `labels`, plus `caption` (hidden, names the table) and `className`. A real table with every group's statistics in text: n, min, quartiles, median, max, mean and outliers. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { BoxPlotTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BoxPlotTable data={[{ label: "Free", values: [2, 3, 3, 4, 5, 6, 9] }]} caption="Weekly sessions by plan" />
 *   );
 * }
 * ```
 *
 * @see /charts/box-plot
 */
export function BoxPlotTable({
  data,
  whisker = 1.5,
  format: formatProp,
  locale,
  labels,
  caption,
  className,
}: BoxPlotTableProps) {
  const t = { ...defaultBoxPlotLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const count = defaultCompact(locale);
  const groups = boxPlotStats(data, whisker);
  // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
  const f = (n: number) => isolate(format(n));
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.group },
        { label: t.count },
        { label: t.min },
        { label: t.q1 },
        { label: t.median },
        { label: t.q3 },
        { label: t.max },
        { label: t.mean },
        { label: t.outliers, align: "start" },
      ]}
      rows={groups.map((g) => [
        g.label,
        g.n === null ? "–" : isolate(count(g.n)),
        f(g.min),
        f(g.q1),
        <strong key="m" className="font-semibold">
          {f(g.median)}
        </strong>,
        f(g.q3),
        f(g.max),
        g.mean === null ? "–" : f(g.mean),
        g.outliers.length === 0 ? "–" : g.outliers.map(f).join(", "),
      ])}
    />
  );
}
