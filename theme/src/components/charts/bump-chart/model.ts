import { type ReactNode } from "react";

import { num, seriesColor, type ChartInstructions, type ChartRow, type ChartSeries } from "../chart-utils";
import { type LegendItem } from "../chart-parts";

/**
 * Every string BumpChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type BumpChartLabels = {
  /** Announced as the figure's kind. */
  roleDescription: string;
  /** Appended to the accessible name: how to read the chart with the keyboard. */
  instructions: ChartInstructions;
  /** Readout row: the rank at that point, e.g. "Rank 2 of 6". */
  rank: (rank: number, of: number) => string;
  /** Readout row: the series' value at that point, e.g. "Score". */
  value: string;
  /** Readout row: how the rank moved since the previous point, e.g. "Up 2". */
  movedUp: (places: number) => string;
  movedDown: (places: number) => string;
  /** Readout row when the rank did not change. */
  unchanged: string;
  /** Table header of the period column. */
  period: string;
  /** Shown when there is nothing to plot. */
  noData: string;
};

/** The built-in English strings of BumpChart; spread it into your own `labels` and change what you need. */
export const defaultBumpChartLabels: BumpChartLabels = {
  roleDescription: "bump chart",
  instructions:
    "Use the left and right arrow keys to move through time and the up and down keys to move between ranks.",
  rank: (rank, of) => `Rank ${rank} of ${of}`,
  value: "Value",
  movedUp: (places) => `Up ${places}`,
  movedDown: (places) => `Down ${places}`,
  unchanged: "No change",
  period: "Period",
  noData: "No data",
};

/**
 * Props of BumpChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BumpChartProps = {
  /** One row per point in time: the `index` key plus one number per series key, e.g. `{ year: "2022", ada: 82, bo: 77 }`. */
  data: readonly ChartRow[];
  /** The key of each row that names the point in time (the x axis). */
  index: string;
  /** The competing series: `{ key, label, color? }`. Ranks are computed per row across them. */
  series: readonly ChartSeries[];
  /**
   * What the numbers are: "value" ranks them in each row, "rank" treats them as ready-made ranks (1 = best).
   *
   * @default "value"
   */
  rankBy?: "value" | "rank";
  /**
   * With `rankBy="value"`: whether a larger value ranks higher. Set false for times or error rates.
   *
   * @default true
   */
  higherIsBetter?: boolean;
  /** Emphasise one series (by key); the others step back. Hovering or reading a series does this too. */
  highlight?: string;
  /**
   * Print the series names at the end of the lines.
   *
   * @default true
   */
  showLabels?: boolean;
  /**
   * Tell series apart without colour (dash styles). Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /**
   * Sets the height of the plot in px. It grows with the number of ranks (at least 220).
   *
   * @default max(220, ranks × row height + padding)
   */
  height?: number;
  /** Formats a value for the tooltip and table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
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
  labels?: Partial<BumpChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One series of a bump chart with its rank and value at every point in time. @internal */
export type BumpSeries = {
  key: string;
  label: string;
  /** Palette position (0-based) in the series list: the colour, dash and marker index. */
  index: number;
  color: string;
  ranks: number[];
  values: number[];
};

/** The computed model: the time labels and each visible series' ranks. @internal */
export type BumpModel = { periods: string[]; series: BumpSeries[]; count: number };

/**
 * Ranks every series in every row. Ties keep the series order (the earlier series ranks higher), so each
 * rank is used once per row. Hidden series are left out and the rest are re-ranked.
 */
export function bumpModel(
  data: readonly ChartRow[],
  index: string,
  series: readonly ChartSeries[],
  rankBy: "value" | "rank",
  higherIsBetter: boolean,
  hidden?: ReadonlySet<string>,
): BumpModel {
  const live = series.map((s, i) => ({ s, i })).filter(({ s }) => !hidden?.has(s.key));
  const periods = data.map((row) => String(row[index] ?? ""));
  const out: BumpSeries[] = live.map(({ s, i }) => ({
    key: s.key,
    label: s.label,
    index: i,
    color: seriesColor(s, i),
    ranks: [],
    values: [],
  }));
  data.forEach((row) => {
    const entries = live.map(({ s }, k) => ({ k, v: num(row[s.key]) }));
    entries.sort((a, b) => {
      const d = rankBy === "rank" ? a.v - b.v : higherIsBetter ? b.v - a.v : a.v - b.v;
      return d || a.k - b.k;
    });
    entries.forEach((e, position) => {
      const target = out[e.k];
      if (!target) return;
      target.ranks.push(position + 1);
      target.values.push(e.v);
    });
  });
  return { periods, series: out, count: live.length };
}

/** The legend of a BumpChart: one entry per series, in the chart's colours. */
export function bumpLegend(series: readonly ChartSeries[]): LegendItem[] {
  return series.map((s, i) => ({ label: s.label, color: seriesColor(s, i), kind: "line", key: s.key }));
}
