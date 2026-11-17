import type { ComponentProps, ReactNode } from "react";

import { ChartTable } from "./chart-parts";
import { ChartValueTable, defaultCompact, defaultPercent } from "./heatmap";
import { isolate } from "./chart-pointer";
import type { DonutChartProps } from "./donut-chart";

/** Props of the row-based table twins (`BarTable`, `LineTable`, `StepLineTable`, `RadarTable`): those of `ChartTable`. */
export type SeriesTableProps = ComponentProps<typeof ChartTable>;

/**
 * The table view of a `BarChart`: one row per category, one column per series. It takes the chart's own
 * `data`, `index` and `series` (plus `format`, `indexLabel`, `caption` and `labels`), so the same objects feed both.
 * Pass it to `ChartCard table`.
 *
 * Props: `data`, `index`, `series`, `format` (number text), `indexLabel` (first column header), `caption` (hidden, names the table) and `labels` (`noData`, `previous`). Static (no motion).
 * Keyboard: the table is a plain table; a wide one scrolls inside its own focusable region.
 * Accessibility: a real `<table>` with a caption, column headers and row headers, the full text alternative of the chart.
 *
 * @example
 * ```tsx
 * import { BarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BarTable
 *       data={[{ plan: "Free", users: 1204 }, { plan: "Pro", users: 380 }]}
 *       index="plan"
 *       series={[{ key: "users", label: "Users" }]}
 *       caption="Users per plan"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bar-chart
 */
export function BarTable(props: SeriesTableProps) {
  return <ChartTable {...props} />;
}

/**
 * The table view of a `LineChart` or an `AreaChart`: one row per point on the x axis, one column per series
 * (a series with a `compareKey` also gets a previous-period column). Pass it to `ChartCard table`.
 *
 * Props: `data`, `index`, `series`, `format` (number text), `indexLabel` (first column header), `caption` (hidden, names the table) and `labels` (`noData`, `previous`). Static (no motion).
 * Keyboard: the table is a plain table; a wide one scrolls inside its own focusable region.
 * Accessibility: a real `<table>` with a caption, column headers and row headers, the full text alternative of the chart.
 *
 * @example
 * ```tsx
 * import { LineTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LineTable
 *       data={[{ month: "Jan", visits: 120 }, { month: "Feb", visits: 150 }]}
 *       index="month"
 *       series={[{ key: "visits", label: "Visits" }]}
 *       caption="Visits per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/line-chart
 */
export function LineTable(props: SeriesTableProps) {
  return <ChartTable {...props} />;
}

/**
 * The table view of a `StepLineChart`: one row per step on the x axis, one column per series.
 * Pass it to `ChartCard table`.
 *
 * Props: `data`, `index`, `series`, `format` (number text), `indexLabel` (first column header), `caption` (hidden, names the table) and `labels` (`noData`, `previous`). Static (no motion).
 * Keyboard: the table is a plain table; a wide one scrolls inside its own focusable region.
 * Accessibility: a real `<table>` with a caption, column headers and row headers, the full text alternative of the chart.
 *
 * @example
 * ```tsx
 * import { StepLineTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StepLineTable
 *       data={[{ month: "Jan", price: 9 }, { month: "Jun", price: 12 }]}
 *       index="month"
 *       series={[{ key: "price", label: "Price per seat" }]}
 *       caption="Price per seat"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/step-line-chart
 */
export function StepLineTable(props: SeriesTableProps) {
  return <ChartTable {...props} />;
}

/**
 * The table view of a `RadarChart`: one row per axis, one column per series. Pass it to `ChartCard table`.
 *
 * Props: `data`, `index`, `series`, `format` (number text), `indexLabel` (first column header), `caption` (hidden, names the table) and `labels` (`noData`, `previous`). Static (no motion).
 * Keyboard: the table is a plain table; a wide one scrolls inside its own focusable region.
 * Accessibility: a real `<table>` with a caption, column headers and row headers, the full text alternative of the chart.
 *
 * @example
 * ```tsx
 * import { RadarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadarTable
 *       data={[{ skill: "Speed", ada: 8 }, { skill: "Accuracy", ada: 6 }]}
 *       index="skill"
 *       series={[{ key: "ada", label: "Ada" }]}
 *       caption="Skills by person"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/radar-chart
 */
export function RadarTable(props: SeriesTableProps) {
  return <ChartTable {...props} />;
}

/** The text of `DonutTable`: its column headers and the empty message. */
export type DonutTableLabels = {
  /** Header of the first column. */
  slice: string;
  /** Header of the value column. */
  value: string;
  /** Header of the share column. */
  share: string;
  /** Shown when there is nothing to list. */
  noData: ReactNode;
};

/** English defaults of {@link DonutTableLabels}. */
export const defaultDonutTableLabels: DonutTableLabels = {
  slice: "Slice",
  value: "Value",
  share: "Share",
  noData: "No data",
};

/** Props of DonutTable, the table view of the donut chart: its slices and number formats plus a hidden `caption`. */
export type DonutTableProps = Pick<DonutChartProps, "data" | "format" | "locale"> & {
  /** Formats a share (0.412 → "41.2%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Header and empty-state text; pass only the keys you translate. */
  labels?: Partial<DonutTableLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The table view of a `DonutChart`: every slice with its value and its share of the total. Pass it to
 * `ChartCard table`.
 *
 * Props: the chart's `data`, `format` and `locale`, plus `formatPercent`, `caption` (hidden, names the table), `labels` (`slice`, `value`, `share`, `noData`) and `className`. Static (no motion).
 * Keyboard: the table is a plain table; a wide one scrolls inside its own focusable region.
 * Accessibility: a real `<table>` with a caption, column headers and row headers, the full text alternative of the chart.
 *
 * @example
 * ```tsx
 * import { DonutTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DonutTable
 *       data={[{ label: "Organic", value: 41200 }, { label: "Direct", value: 22800 }]}
 *       caption="Sessions by traffic source"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/donut-chart
 */
export function DonutTable({
  data,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  labels,
  className,
}: DonutTableProps) {
  const t = { ...defaultDonutTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const values = data.map((d) => (Number.isFinite(d.value) ? Math.max(0, d.value) : 0));
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[{ label: t.slice }, { label: t.value }, { label: t.share }]}
      rows={data.map((d, i) => [
        d.label,
        isolate(format(values[i] ?? 0)),
        isolate(total > 0 ? pct((values[i] ?? 0) / total) : "–"),
      ])}
    />
  );
}
