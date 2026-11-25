import { type ReactNode } from "react";

import { slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";
import { type ChartTipSide } from "../heatmap";
import type { MarkState } from "../kits/histogram-kit/kit";
import {
  distributionStats,
  kernelDensity,
  samplePoints,
  silvermanBandwidth,
  sortedValues,
} from "../kits/histogram-kit/stats";

/** A precomputed five-number summary, for when you only have the statistics. */
export type BoxSummary = {
  /** Lower whisker end. */
  low: number;
  q1: number;
  median: number;
  q3: number;
  /** Upper whisker end. */
  high: number;
  mean?: number;
  /** Sample size. */
  n?: number;
  outliers?: readonly number[];
};

/** One box of a BoxPlot: a label plus the raw sample (`values`) or precomputed statistics. */
export type BoxPlotGroup = {
  label: string;
  /** The raw sample. Its quartiles, whiskers and outliers are computed for you. */
  values?: readonly number[];
  /** Precomputed statistics instead of (or overriding) `values`. A violin needs raw values. */
  summary?: BoxSummary;
  /** Palette slot (1–8) of this group: use it to emphasise one group. Default: the chart's `color`. */
  color?: ChartColor;
};

/**
 * Every string BoxPlot speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type BoxPlotLabels = {
  roleDescription: string;
  /** Appended to the accessible name: a string, or a function of `{ horizontal }` to word the keys for each orientation. */
  instructions: ChartInstructions<{ horizontal: boolean }>;
  hint: string;
  median: string;
  quartiles: string;
  whiskers: string;
  mean: string;
  count: string;
  outliers: string;
  outlier: string;
  min: string;
  max: string;
  q1: string;
  q3: string;
  group: string;
  /** A low–high pair, e.g. "42–68". */
  between: (low: string, high: string) => string;
  noData: string;
};

/**
 * The built-in English strings of BoxPlot; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultBoxPlotLabels: BoxPlotLabels = {
  roleDescription: "box plot",
  instructions: ({ horizontal }) =>
    horizontal
      ? "Use the up and down arrow keys to move between groups, and left and right to read a group's outliers."
      : "Use the left and right arrow keys to move between groups, and up and down to read a group's outliers.",
  hint: "Tap a group to read it",
  median: "Median",
  quartiles: "Middle 50%",
  whiskers: "Whiskers",
  mean: "Mean",
  count: "Values",
  outliers: "Outliers",
  outlier: "Outlier",
  min: "Min",
  max: "Max",
  q1: "Q1",
  q3: "Q3",
  group: "Group",
  between: (low, high) => `${low}–${high}`,
  noData: "No data",
};

/**
 * Props of BoxPlot. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BoxPlotProps = {
  /** One box per group, in order. */
  data: readonly BoxPlotGroup[];
  /** "box": box and whiskers. "violin": the density shape with a slim box inside. */
  variant?: "box" | "violin";
  /** "auto" draws upright boxes, and turns them sideways on narrow charts or when group names wouldn't fit. */
  orientation?: "auto" | "vertical" | "horizontal";
  /** Whisker reach in IQRs (Tukey: 1.5): points beyond are outliers. "minmax" reaches the extremes. */
  whisker?: number | "minmax";
  /** Mark each group's mean with a small diamond. */
  showMean?: boolean;
  /** Keep 0 on the value axis. */
  includeZero?: boolean;
  /** KDE bandwidth of the violins, in data units. Default: Silverman's rule per group. */
  bandwidth?: number;
  /** Palette slot (1–8) of every box (groups can override). Default 1. */
  color?: ChartColor;
  /** Height of an upright chart. Sideways charts grow with the number of groups. */
  height?: number;
  /** Names the value axis. */
  valueLabel?: string;
  /** Formats a value for the axis, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<BoxPlotLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One group with its computed statistics, colour and optional samples. @internal */
export type Resolved = {
  key: string;
  label: string;
  color: string;
  n: number | null;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
  mean: number | null;
  min: number;
  max: number;
  outliers: number[];
  /** Violin outline: [value, density] samples. */
  density: (readonly [number, number])[] | null;
};

/** The number of density samples that draw a violin. @internal */
export const VIOLIN_SAMPLES = 56;
/** The radius of an outlier dot, in pixels. @internal */
export const OUTLIER_R = 4;
/** The tooltip side order for vertical box plots. @internal */
export const TIP_V: readonly ChartTipSide[] = ["right", "left", "above", "below"];
/** The tooltip side order for horizontal box plots. @internal */
export const TIP_H: readonly ChartTipSide[] = ["below", "above", "right", "left"];

/** Statistics for every group: computed from raw values, or taken from `summary`.
 *
 * @see /charts/box-plot
 */
export function boxPlotStats(
  data: readonly BoxPlotGroup[],
  whisker: number | "minmax" = 1.5,
  bandwidth?: number,
  color: ChartColor = 1,
  violin = false,
): Resolved[] {
  const seen = new Map<string, number>();
  return data.flatMap((g): Resolved[] => {
    const n0 = seen.get(g.label) ?? 0;
    seen.set(g.label, n0 + 1);
    const key = `${g.label}\u0000${n0}`;
    const fill = slotColor(g.color ?? color);
    const sorted = g.values ? sortedValues(g.values) : [];
    const s = sorted.length > 0 ? distributionStats(sorted, whisker) : null;
    const sum = g.summary;
    if (!s && !sum) return [];
    const pick = (a: number | undefined, b: number | undefined) =>
      a !== undefined && Number.isFinite(a) ? a : (b ?? NaN);
    const low = pick(sum?.low, s?.whiskerLow);
    const high = pick(sum?.high, s?.whiskerHigh);
    const q1 = pick(sum?.q1, s?.q1);
    const q3 = pick(sum?.q3, s?.q3);
    const median = pick(sum?.median, s?.median);
    if (![low, high, q1, q3, median].every(Number.isFinite)) return [];
    const outliers = (sum?.outliers ?? s?.outliers ?? []).filter(Number.isFinite).sort((a, b) => a - b);
    const mean = sum?.mean ?? s?.mean ?? null;
    let density: Resolved["density"] = null;
    if (violin && sorted.length >= 3) {
      const bw = bandwidth && bandwidth > 0 ? bandwidth : silvermanBandwidth(sorted);
      if (bw > 0) {
        const at = samplePoints(sorted[0] ?? 0, sorted[sorted.length - 1] ?? 0, VIOLIN_SAMPLES);
        const d = kernelDensity(sorted, bw, at);
        density = at.map((v, i) => [v, d[i] ?? 0] as const);
      }
    }
    const lo = Math.min(low, q1, ...outliers);
    const hi = Math.max(high, q3, ...outliers);
    return [
      {
        key,
        label: g.label,
        color: fill,
        n: sum?.n ?? s?.n ?? null,
        low: Math.min(low, q1),
        q1: Math.min(q1, q3),
        median,
        q3: Math.max(q1, q3),
        high: Math.max(high, q3),
        mean: mean !== null && Number.isFinite(mean) ? mean : null,
        min: s?.min ?? lo,
        max: s?.max ?? hi,
        outliers,
        density,
      },
    ];
  });
}

/** The zero-length transition used under reduced motion. */
export const INSTANT = { duration: 0 };

/** A rectangle with every corner rounded, as one path with a fixed command structure (so it morphs). */
export function roundRect(x: number, y: number, w: number, h: number, r: number) {
  w = Math.max(0, w);
  h = Math.max(0, h);
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  const f = (n: number) => n.toFixed(2);
  return (
    `M${f(x)},${f(y + k)} Q${f(x)},${f(y)} ${f(x + k)},${f(y)} H${f(x + w - k)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + k)} ` +
    `V${f(y + h - k)} Q${f(x + w)},${f(y + h)} ${f(x + w - k)},${f(y + h)} H${f(x + k)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - k)} Z`
  );
}

/**
 * Outlier positions across the group's centre line, dodged so equal or close values sit side by
 * side instead of on top of each other.
 */
export function dodgeOutliers(pixels: number[], centre: number, spread: number) {
  const placed: { c: number; v: number }[] = [];
  const minD = OUTLIER_R * 2 + 1.5;
  return pixels.map((v) => {
    for (let k = 0; k < 12; k++) {
      const off = k === 0 ? 0 : Math.ceil(k / 2) * minD * (k % 2 ? 1 : -1);
      if (Math.abs(off) > spread) break;
      const c = centre + off;
      if (placed.every((p) => Math.hypot(p.c - c, p.v - v) >= minD)) {
        placed.push({ c, v });
        return c;
      }
    }
    placed.push({ c: centre, v });
    return centre;
  });
}

/** The hovered or focused mark: group index and outlier index, or null for the box. @internal */
export type Active = { g: number; o: number | null };

/** A dot as one path (so a data change morphs its `d`, never cx / cy). */
export function dotPath(cx: number, cy: number, r: number) {
  const f = (n: number) => n.toFixed(2);
  return `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0 Z`;
}
/** A straight segment as an SVG path, so a data change morphs `d`. @internal */
export const segmentPath = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)}`;
/** A diamond (mean marker) as an SVG path around a centre. @internal */
export const diamondPath = (cx: number, cy: number) =>
  `M${cx.toFixed(2)},${(cy - 4.5).toFixed(2)} l4.5,4.5 l-4.5,4.5 l-4.5,-4.5 Z`;
/** A closed polygon path through a flat `x, y` coordinate list. @internal */
export function polyPath(points: readonly number[]) {
  let d = "";
  for (let k = 0; k + 1 < points.length; k += 2)
    d += `${k ? "L" : "M"}${(points[k] ?? 0).toFixed(1)},${(points[k + 1] ?? 0).toFixed(1)}`;
  return `${d} Z`;
}

/** The kinds of mark a box plot draws; each turns its numbers into a `d`. */
export type MarkKind = "rect" | "poly" | "line" | "dot" | "diamond";
/** The path `d` of an animated mark from its kind and numeric state. @internal */
export function markD(kind: string | undefined, s: MarkState) {
  switch (kind) {
    case "rect":
      return roundRect(s[0] ?? 0, s[1] ?? 0, s[2] ?? 0, s[3] ?? 0, s[4] ?? 0);
    case "poly":
      return polyPath(s);
    case "line":
      return segmentPath(s[0] ?? 0, s[1] ?? 0, s[2] ?? 0, s[3] ?? 0);
    case "dot":
      return dotPath(s[0] ?? 0, s[1] ?? 0, s[2] ?? 0);
    default:
      return diamondPath(s[0] ?? 0, s[1] ?? 0);
  }
}

/** One mark of a group: what it is, its numbers, and how it enters (origin of its scale, in its own box). */
export type GroupMark = {
  id: string;
  kind: MarkKind;
  state: MarkState;
  role: "box" | "violin" | "whisker" | "cap" | "median" | "mean" | "outlier";
  origin?: string;
  outlier?: number;
};
