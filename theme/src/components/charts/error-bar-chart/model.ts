import { type ReactNode } from "react";

import { num, slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";
import { type LegendItem } from "../chart-parts";

/** One item of an ErrorBarChart: a label, its estimate and the interval around it. */
export type ErrorBarItem = {
  label: string;
  /** The estimate: the bar's end, the dot, or a point of the line. */
  value: number;
  /** The lower end of the interval (a confidence interval, a standard error, a min). */
  low: number;
  /** The upper end of the interval. Swapped with `low` if they are given the wrong way round. */
  high: number;
  /** Palette slot (1–8) of this item. Default: the chart's `color`. */
  color?: ChartColor;
};

/**
 * Every string ErrorBarChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type ErrorBarChartLabels = {
  roleDescription: string;
  /** Appended to the accessible name: how to read the chart with the keyboard. */
  instructions: ChartInstructions<{ vertical: boolean }>;
  /** Readout and table header of the estimate. */
  value: string;
  /** Readout row of the interval, e.g. "62 to 71". */
  interval: (low: string, high: string) => string;
  /** Name of the interval in the legend, the readout and the table, e.g. "95% confidence interval". */
  intervalName: string;
  /** Table headers. */
  item: string;
  lower: string;
  upper: string;
  noData: string;
};

/** The built-in English strings of ErrorBarChart; spread it into your own `labels` and change what you need. */
export const defaultErrorBarChartLabels: ErrorBarChartLabels = {
  roleDescription: "error bar chart",
  instructions: ({ vertical }) =>
    `Use the ${vertical ? "left and right" : "up and down"} arrow keys to read each item, Home and End for the first and last.`,
  value: "Estimate",
  interval: (low, high) => `${low} to ${high}`,
  intervalName: "Interval",
  item: "Item",
  lower: "Lower",
  upper: "Upper",
  noData: "No data",
};

/**
 * Props of ErrorBarChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type ErrorBarChartProps = {
  /** One item per mark: { label, value, low, high, color? }. */
  data: readonly ErrorBarItem[];
  /**
   * "bar": bars from the baseline with a whisker; "point": a dot with a whisker (for estimates and effects); "band": a line with a shaded confidence band over ordered categories (a time series).
   *
   * @default "bar"
   */
  variant?: "bar" | "point" | "band";
  /**
   * Where the bars start (variant "bar").
   *
   * @default 0
   */
  baseline?: number;
  /** A reference line, e.g. { value: 0, label: "No effect" }. */
  reference?: { value: number; label: string };
  /**
   * Print each estimate next to its mark (not on a band).
   *
   * @default true
   */
  showValues?: boolean;
  /**
   * Sets the palette slot (1–8) used for the whole chart.
   *
   * @default 1
   */
  color?: ChartColor;
  /**
   * Tell items of different colours apart without colour: hatched bars, and different marker shapes for points and
   * bands (the first colour stays solid and round). Default: on when the items use more than 3 colours.
   *
   * @default true when item colours > 3
   */
  patterns?: boolean;
  /**
   * Height of the plot in px. Bars and points grow with the number of rows; a band chart uses it as is.
   *
   * @default 300
   */
  height?: number;
  /** Names the value axis. */
  valueLabel?: string;
  /**
   * Names the interval in the legend, readout and table (e.g. "95% CI").
   *
   * @default labels.intervalName
   */
  intervalLabel?: string;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /**
   * Locale of the default number format.
   *
   * @default "en"
   */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<ErrorBarChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One resolved item: finite numbers, `low <= high`, a stable key. @internal */
export type ErrorRow = {
  key: string;
  label: string;
  value: number;
  low: number;
  high: number;
  color: string;
};

/** The rows as drawn: finite numbers, interval ends in order, stable keys for duplicate labels. @internal */
export function resolveErrorRows(data: readonly ErrorBarItem[], color: ChartColor): ErrorRow[] {
  const seen = new Map<string, number>();
  return data.map((d) => {
    const n = seen.get(d.label) ?? 0;
    seen.set(d.label, n + 1);
    const a = num(d.low);
    const b = num(d.high);
    return {
      key: `${d.label}\u0000${n}`,
      label: d.label,
      value: num(d.value),
      low: Math.min(a, b),
      high: Math.max(a, b),
      color: slotColor(d.color ?? color),
    };
  });
}

/** The legend of an ErrorBarChart: the estimate and the interval around it. */
export function errorBarLegend(
  estimate = defaultErrorBarChartLabels.value,
  interval = defaultErrorBarChartLabels.intervalName,
  color: ChartColor = 1,
): LegendItem[] {
  return [
    { label: estimate, color: slotColor(color), kind: "rect" },
    { label: interval, color: "var(--sheen-fg)", kind: "line" },
  ];
}
