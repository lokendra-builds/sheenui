import { type ReactNode } from "react";

import { type LegendItem } from "../chart-parts";
import { slotColor, truncate, type ChartColor, type ChartRow, type ChartInstructions } from "../chart-utils";
import { hueMix, type ChartTipSide } from "../heatmap";
import { signedText } from "../kits/histogram-kit/kit";

/** One answer level of a DivergingBarChart: the key of its value in each row and its label. */
export type DivergingLevel = {
  /** Key of the value in each data row. */
  key: string;
  label: string;
};

/**
 * Every string DivergingBarChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type DivergingBarChartLabels = {
  roleDescription: (butterfly: boolean) => string;
  instructions: ChartInstructions;
  hint: string;
  /** Readout rows with the arm totals of a Likert row. */
  totalNegative: string;
  totalPositive: string;
  /** Net score (positive share minus negative share). */
  net: string;
  total: string;
  share: string;
  /** Table header of the row names. */
  item: string;
  noData: string;
};

/**
 * The built-in English strings of DivergingBarChart; spread it into your own `labels` and change what
 * you need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultDivergingBarChartLabels: DivergingBarChartLabels = {
  roleDescription: (butterfly) => (butterfly ? "butterfly chart" : "diverging bar chart"),
  instructions: "Use the up and down arrow keys to move between rows, and left and right to read each segment.",
  hint: "Tap a bar to read it",
  totalNegative: "All negative",
  totalPositive: "All positive",
  net: "Net",
  total: "Total",
  share: "Share",
  item: "Item",
  noData: "No data",
};

/**
 * Props of DivergingBarChart. The component's own doc comment describes its behaviour, keyboard use
 * and accessibility.
 */
export type DivergingBarChartProps = {
  /** One row per item (a question, a product, an age group). */
  data: readonly ChartRow[];
  /** Key of the row name in each data row. */
  index: string;
  /**
   * Likert: the answer levels, most negative first ("Strongly disagree" … "Strongly agree"); with an
   * odd count the middle one is neutral and straddles the centre line.
   * Butterfly: exactly two levels, drawn to the left and right of the spine (e.g. Men / Women).
   */
  levels: readonly DivergingLevel[];
  /** "likert": stacked levels diverging from a neutral midpoint. "butterfly": two sides back to back (population pyramid). */
  variant?: "likert" | "butterfly";
  /** Likert: sets the key of the neutral level. Default: the middle level of an odd count; null for none. */
  neutral?: string | null;
  /** Likert: draw shares (each row sums to 100%). Default true. Butterfly: draw each side's share of the grand total. Default false. */
  normalize?: boolean;
  /** Likert: print the net score (positive minus negative) after each row. Default true. */
  showNet?: boolean;
  /** Print values in (Likert) or past (butterfly) the bars where they fit. Default true. */
  showValues?: boolean;
  /** Likert: palette slots of the negative and positive poles (a diverging pair). Default red 8 / blue 7. */
  negativeColor?: ChartColor;
  /** Sets thepalette slot (1 to 8) of the positive arm. Default 7. */
  positiveColor?: ChartColor;
  /** Butterfly: palette slots of the left and right sides. Default [7, 5]. */
  colors?: readonly [ChartColor, ChartColor];
  /** Sets the height of the plot in px. Default: grows with the rows. */
  height?: number;
  /** Formats a response count for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share as text (0.42 → "42%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<DivergingBarChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The average glyph width of the labels, in pixels. @internal */
export const CHAR_W = 6.4;
/** The thickest a bar can be, in pixels. @internal */
export const MAX_BAR = 24;
/** The fill of the neutral level. @internal */
export const NEUTRAL_FILL =
  "light-dark(color-mix(in oklab, var(--sheen-fg-subtle) 32%, var(--sheen-chart-surface)), color-mix(in oklab, var(--sheen-fg-subtle) 48%, var(--sheen-chart-surface)))";
/** The tooltip side order. @internal */
export const TIP: readonly ChartTipSide[] = ["below", "above", "right", "left"];
/** A row name on one line, or two (split at the space that balances them); only what still won't fit is truncated. */
export function wrapName(label: string, chars: number): string[] {
  if (label.length <= chars) return [label];
  let best: [string, string] | null = null;
  for (let i = label.indexOf(" "); i > 0; i = label.indexOf(" ", i + 1)) {
    const a = label.slice(0, i);
    const b = label.slice(i + 1);
    if (a.length > chars) break;
    if (!best || Math.max(a.length, b.length) < Math.max(best[0].length, best[1].length)) best = [a, b];
  }
  return best ? [best[0], truncate(best[1], chars)] : [truncate(label, chars)];
}

/** A whole-number percent formatter for a locale. @internal */
export const wholePercent = (locale: string | undefined) => {
  const f = new Intl.NumberFormat(locale ?? "en", { style: "percent", maximumFractionDigits: 0 });
  // Typographic minus, like every other number in the chart family.
  return (r: number) => (Number.isFinite(r) ? f.format(r).replace("-", "−") : "–");
};
/** A net score as text: "+69%", "−2%", "0%" (no sign on values that round to zero). */
export const netText = (v: number, fmt: (r: number) => string) => {
  const text = fmt(v).replace("-", "−");
  return /[1-9]/.test(text) ? signedText(v, text) : text.replace(/^[+−]/, "");
};

/** Which side of the axis a level sits on. @internal */
export type Side = "negative" | "neutral" | "positive";
/** A level with its side, colour and stacking order. @internal */
export type LevelInfo = DivergingLevel & { side: Side; color: string; order: number };

/** Each level's side and colour: equal steps per arm, strongest at the extremes, a grey neutral.
 *
 * @see /charts/diverging-bar
 */
export function divergingLevels(
  levels: readonly DivergingLevel[],
  {
    neutral,
    negativeColor = 8,
    positiveColor = 7,
  }: { neutral?: string | null; negativeColor?: ChartColor; positiveColor?: ChartColor } = {},
): LevelInfo[] {
  const L = levels.length;
  const nu =
    neutral === null
      ? -1
      : neutral !== undefined
        ? levels.findIndex((l) => l.key === neutral)
        : L % 2 === 1
          ? (L - 1) / 2
          : -1;
  const negCount = nu >= 0 ? nu : Math.floor(L / 2);
  const posCount = L - negCount - (nu >= 0 ? 1 : 0);
  // Shares of the pole hue: 1 at the extreme, stepping down to 0.42 next to the middle.
  const step = (j: number, count: number) => (count <= 1 ? 0.85 : 1 - (0.58 * j) / (count - 1));
  return levels.map((l, i) => {
    if (i === nu) return { ...l, side: "neutral", color: NEUTRAL_FILL, order: i };
    if (i < negCount) return { ...l, side: "negative", color: armColor(negativeColor, step(i, negCount)), order: i };
    const j = L - 1 - i; // 0 = the most positive
    return { ...l, side: "positive", color: armColor(positiveColor, step(j, posCount)), order: i };
  });
}

/** The neutral grey of a dark chart (the dark arm of NEUTRAL_FILL). */
export const DARK_NEUTRAL = "color-mix(in oklab, var(--sheen-fg-subtle) 48%, var(--sheen-chart-surface))";

/**
 * One step of a diverging arm. Light surfaces: a tint of the pole hue towards the surface. Dark
 * surfaces: a step towards the neutral grey instead, so the softer answers stay clearly off the
 * surface (a mix into a dark surface would sink into it) and sit between the neutral and the pole.
 */
export function armColor(color: ChartColor, share: number) {
  return share >= 0.999
    ? slotColor(color)
    : `light-dark(${hueMix(color, share)}, ${hueMix(color, share, DARK_NEUTRAL)})`;
}

/** Legend items for a diverging chart, in level order (or the two sides of a butterfly).
 *
 * @see /charts/diverging-bar
 */
export function divergingLegend(
  levels: readonly DivergingLevel[],
  options: {
    variant?: "likert" | "butterfly";
    neutral?: string | null;
    negativeColor?: ChartColor;
    positiveColor?: ChartColor;
    colors?: readonly [ChartColor, ChartColor];
  } = {},
): LegendItem[] {
  if (options.variant === "butterfly") {
    const [a = 7, b = 5] = options.colors ?? [];
    return levels.slice(0, 2).map((l, i) => ({ label: l.label, color: slotColor(i === 0 ? a : b), kind: "rect" }));
  }
  return divergingLevels(levels, options).map((l) => ({ label: l.label, color: l.color, kind: "rect" }));
}

/** One bar segment: a row, a level and its extent. @internal */
export type Segment = {
  level: LevelInfo;
  value: number;
  share: number;
  x0: number;
  x1: number;
  end: "left" | "right" | "none";
};
/** The hovered or focused segment as row and segment indexes. @internal */
export type Active = { r: number; s: number };
/** One diverging row with its segments and totals. @internal */
export type DivRow = {
  key: string;
  label: string;
  raw: number[];
  total: number;
  shares: number[];
  plotted: number[];
  negSum: number;
  posSum: number;
  neutralVal: number;
  net: number;
  negShare: number;
  posShare: number;
};

/** The default colour slots of the negative and positive sides. @internal */
export const DEFAULT_SIDES: readonly [ChartColor, ChartColor] = [7, 5];
/** A stable empty fill list, so a default never changes identity. @internal */
export const NO_FILLS: string[] = [];
/** A segment's rounded end as a number, so it can travel in a mark's state. */
export const END_CODE = { none: 0, left: 1, right: 2 } as const;
/** The end labels to show: none, left or right. @internal */
export const END_NAME = ["none", "left", "right"] as const;
/** The stable key of a segment from its row and level. @internal */
export const segKey = (row: string, level: string) => `${row}\u0001${level}`;

/** The pointer kit compares hits by value: a segment is "row:segment". */
export function parseActive(key: string | null, rows: number, segments: number): Active | null {
  if (key === null) return null;
  const [r = NaN, s = NaN] = key.split(":").map(Number);
  return r >= 0 && r < rows && s >= 0 && s < segments ? { r, s } : null;
}
