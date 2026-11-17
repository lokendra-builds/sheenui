import { type ReactNode } from "react";

import { num, slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";
import { type LegendItem } from "../chart-parts";

/** One age group (or any ordered band) of a PopulationPyramid: its label and the size of each side. */
export type PyramidGroup = {
  label: string;
  /** The size of the side at the inline start (left in left-to-right text). Negative values count as 0. */
  start: number;
  /** The size of the side at the inline end (right in left-to-right text). Negative values count as 0. */
  end: number;
};

/**
 * Every string PopulationPyramid speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type PopulationPyramidLabels = {
  roleDescription: string;
  /** Appended to the accessible name: how to read the chart with the keyboard. */
  instructions: ChartInstructions;
  /** Names of the two sides in the legend, readout and table. */
  start: string;
  end: string;
  /** Readout row and table header of both sides added up. */
  total: string;
  /** Table header of the group column. */
  group: string;
  /** Table header and readout row of a group's share of the whole population. */
  shareOfTotal: string;
  noData: string;
};

/** The built-in English strings of PopulationPyramid; spread it into your own `labels` and change what you need. */
export const defaultPopulationPyramidLabels: PopulationPyramidLabels = {
  roleDescription: "population pyramid",
  instructions: "Use the up and down arrow keys to read each group, Home and End for the first and last.",
  start: "Male",
  end: "Female",
  total: "Total",
  group: "Age group",
  shareOfTotal: "Share of total",
  noData: "No data",
};

/**
 * Props of PopulationPyramid. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type PopulationPyramidProps = {
  /** One item per age group: { label, start, end }, from the first group to the last, e.g. 0–4 up to 85+. */
  data: readonly PyramidGroup[];
  /**
   * Show each bar as a share of the whole population (%) instead of a count.
   *
   * @default false
   */
  share?: boolean;
  /**
   * Which end of `data` sits at the bottom. "bottom" puts the first group at the bottom, so the youngest are at the base.
   *
   * @default "bottom"
   */
  firstAt?: "bottom" | "top";
  /**
   * Palette slots (1–8) of the start and the end side.
   *
   * @default [1, 2]
   */
  colors?: readonly [ChartColor, ChartColor];
  /**
   * Tell the two sides apart without colour (hatch fills on the end side). Off by default: only two sides, and they sit on opposite sides of the centre line.
   *
   * @default false
   */
  patterns?: boolean;
  /**
   * Print each bar's value past its end where it fits.
   *
   * @default true
   */
  showValues?: boolean;
  /** Formats a count for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share (0.082 → "8.2%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /**
   * Locale of the default number formats.
   *
   * @default "en"
   */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<PopulationPyramidLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One resolved group: finite non-negative sizes and its share of the grand total. @internal */
export type PyramidRow = {
  key: string;
  label: string;
  start: number;
  end: number;
  total: number;
  /** This group's share (0–1) of both sides of every group; NaN when the population is 0. */
  share: number;
};

/** The groups as drawn: finite, non-negative, with stable keys and each one's share of the whole. @internal */
export function resolvePyramidRows(data: readonly PyramidGroup[]): PyramidRow[] {
  const seen = new Map<string, number>();
  const rows = data.map((d) => {
    const k = seen.get(d.label) ?? 0;
    seen.set(d.label, k + 1);
    const start = Math.max(0, num(d.start));
    const end = Math.max(0, num(d.end));
    return { key: `${d.label}\u0000${k}`, label: d.label, start, end, total: start + end, share: NaN };
  });
  const grand = rows.reduce((s, r) => s + r.total, 0);
  return rows.map((r) => ({ ...r, share: grand > 0 ? r.total / grand : NaN }));
}

/** The legend of a PopulationPyramid: the two sides, in the chart's colours. */
export function populationPyramidLegend(
  startLabel = defaultPopulationPyramidLabels.start,
  endLabel = defaultPopulationPyramidLabels.end,
  colors: readonly [ChartColor, ChartColor] = [1, 2],
): LegendItem[] {
  return [
    { label: startLabel, color: slotColor(colors[0]), kind: "rect", key: "start" },
    { label: endLabel, color: slotColor(colors[1]), kind: "rect", key: "end" },
  ];
}
