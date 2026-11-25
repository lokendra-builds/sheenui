import { type ReactNode } from "react";

import { type LegendItem } from "../chart-parts";
import { fitTicks, type Readout } from "../chart-fit";
import { clamp, niceTicks, slotColor, type ChartColor, type ChartInstructions, itemAt } from "../chart-utils";
import { defaultCompact, type ChartTipSide } from "../heatmap";
import { textWidth, isolate } from "../chart-pointer";
import type { MarkState } from "../kits/histogram-kit/kit";
import { distributionStats, quantileSorted, type BinMethod, type HistogramBin } from "../kits/histogram-kit/stats";

/**
 * A reference marker on a histogram: `mean`, `median`, a percentile (`p90`, `p95`, `p99`) or a value
 * of your own with a label.
 */
export type HistogramMarker =
  | "mean"
  | "median"
  | "p90"
  | "p95"
  | "p99"
  /** A reference value of your own, e.g. an SLO threshold. */
  | { value: number; label: string };

/**
 * Every string Histogram speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type HistogramLabels = {
  roleDescription: string;
  /** Appended to the accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a bin is read. */
  hint: string;
  count: string;
  share: string;
  /** Readout row: the share of values at or below a bin's upper edge. */
  cumulative: (edge: string) => string;
  /** Table header of the cumulative share. */
  cumulativeHeader: string;
  /** A bin's range, e.g. "40–50". */
  range: (from: string, to: string) => string;
  /** Spoken summary of the sample. */
  summary: (n: string, median: string, mean: string) => string;
  /** Names of the built-in markers. */
  mean: string;
  median: string;
  percentile: (p: number) => string;
  /** Table headers. */
  bin: string;
  noData: string;
};

/**
 * The built-in English strings of Histogram; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultHistogramLabels: HistogramLabels = {
  roleDescription: "histogram",
  instructions: "Use the left and right arrow keys to read each bin.",
  hint: "Tap a bar to read its bin",
  count: "Count",
  share: "Share",
  cumulative: (edge) => `at or below ${edge}`,
  cumulativeHeader: "Cumulative",
  range: (from, to) => `${from}–${to}`,
  summary: (n, median, mean) => `${n} values, median ${median}, mean ${mean}.`,
  mean: "Mean",
  median: "Median",
  percentile: (p) => `p${p}`,
  bin: "Range",
  noData: "No data",
};

/**
 * Props of Histogram. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type HistogramProps = {
  /** The raw sample, e.g. every request's latency. Non-finite values are ignored. */
  values: readonly number[];
  /** A bin count, or a rule: "auto" (default), "sturges", "freedman-diaconis" or "scott". */
  bins?: number | BinMethod;
  /** Range to bin. Default: the data's extent. Values outside it are left out. */
  domain?: readonly [number, number];
  /** Snap bin edges to round numbers (the bin count lands near `bins`). Default true. */
  niceBins?: boolean;
  /** Height of a bar: the number of values, or their share of the sample. */
  measure?: "count" | "percent";
  /** Draw the bins. Turn off (with `density`) for a smooth density plot. Default true. */
  bars?: boolean;
  /** Overlay a smooth density curve (Gaussian kernel density estimate). */
  density?: boolean;
  /** Sets the KDE bandwidth in data units. Default: Silverman's rule. */
  bandwidth?: number;
  /** Reference lines: "median", "mean", "p90", "p95", "p99", or { value, label }. */
  markers?: readonly HistogramMarker[];
  /** Sets the palette slot (1–8) of the bars. Default 1. */
  color?: ChartColor;
  /** Height of the chart in px; the width follows the container. Default 280. */
  height?: number;
  /** Names the value axis (shown under it and in the readout). */
  xLabel?: string;
  /** Names the count axis (shown above it). */
  yLabel?: string;
  /** Formats values (bin edges, markers). Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a bin count for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  formatCount?: (n: number) => string;
  /** Formats a share as text (0.12 → "12%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<HistogramLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** How many points the density curve is sampled at. */
export const KDE_SAMPLES = 160;
/** The sides a bin tooltip tries, in order. */
export const TIP_ORDER: readonly ChartTipSide[] = ["right", "left", "above", "below"];

/** Anchor of a centred label at `x`, `w` wide: flipped to "start" / "end" where centring would cross [lo, hi]. */
export function edgeAnchor(x: number, w: number, lo: number, hi: number): "start" | "middle" | "end" {
  if (x + w / 2 > hi) return "end";
  if (x - w / 2 < lo) return "start";
  return "middle";
}

/**
 * One candidate tick label of an axis: where it sits, its text and the group it is kept or dropped
 * with.
 */
export type AxisLabelSlot = {
  /** Physical x of the tick (after any right-to-left mirroring). */
  x: number;
  text: string;
  /** Labels sharing a group are kept or dropped together (e.g. the two sides of a symmetric axis). Default: the label's index. */
  group?: number;
};

/**
 * Which axis labels to print so none collide. Each label is centred on its tick, or pinned to the
 * chart's edge where centring would cross [lo, hi] (exactly as `edgeAnchor` places it); every n-th
 * group is kept, with the smallest n whose labels clear each other by `gap` px. Gridlines stay for
 * every tick: only the text thins out.
 */
export function axisLabelsShown(
  labels: readonly AxisLabelSlot[],
  lo: number,
  hi: number,
  {
    gap = 8,
    charPx,
  }: {
    gap?: number;
    /** A fixed width per character instead of the measured text width (11px labels). */ charPx?: number;
  } = {},
): Set<number> {
  const boxes = labels.map((l, i) => {
    const w = charPx !== undefined ? l.text.length * charPx : textWidth(l.text);
    const anchor = edgeAnchor(l.x, w, lo, hi);
    const a = anchor === "middle" ? l.x - w / 2 : anchor === "start" ? l.x : l.x - w;
    return { i, group: l.group ?? i, a, b: a + w };
  });
  const groups = Array.from(new Set(boxes.map((b) => b.group))).sort((p, q) => p - q);
  for (let every = 1; every <= Math.max(1, groups.length); every++) {
    const keep = new Set(groups.filter((_, k) => k % every === 0));
    const kept = boxes.filter((b) => keep.has(b.group)).sort((p, q) => p.a - q.a);
    if (kept.every((b, k) => k === 0 || b.a >= itemAt(kept, k - 1).b + gap)) return new Set(kept.map((b) => b.i));
  }
  return new Set(boxes.filter((b) => b.group === groups[0]).map((b) => b.i));
}

/**
 * Round ticks strictly inside [lo, hi] (bins, swarms: no axis past the data), at least two of them
 * whenever the range allows it. `fitTicks` may pick a set whose round ends overshoot the range, so
 * that only one tick would survive the cut; denser nice sets are tried then. Pair with
 * `axisLabelsShown` so the denser labels still never collide.
 */
export function insideTicks(lo: number, hi: number, options: Parameters<typeof fitTicks>[2]): number[] {
  const inside = (ticks: number[]) => ticks.filter((tk) => tk >= lo - 1e-9 && tk <= hi + 1e-9);
  const fitted = inside(fitTicks(lo, hi, options));
  if (fitted.length >= 2 || !(hi > lo)) return fitted;
  for (let count = 3; count <= 12; count++) {
    const denser = inside(niceTicks(lo, hi, count));
    if (denser.length >= 2) return denser;
  }
  return fitted;
}

/** A resolved reference marker: its key, value, name and text. */
export type MarkerLine = { key: string; value: number; name: string; text: string };

/** Resolves marker names and custom markers to values, names and text for the sample. */
export function resolveMarkers(
  markers: readonly HistogramMarker[],
  sorted: readonly number[],
  t: HistogramLabels,
  format: (n: number) => string,
): MarkerLine[] {
  const stats = distributionStats(sorted, "minmax");
  if (!stats) return [];
  return markers.flatMap((m, i): MarkerLine[] => {
    if (typeof m === "object")
      return Number.isFinite(m.value) ? [{ key: `c${i}`, value: m.value, name: m.label, text: format(m.value) }] : [];
    const value =
      m === "mean" ? stats.mean : m === "median" ? stats.median : quantileSorted(sorted, Number(m.slice(1)) / 100);
    const name = m === "mean" ? t.mean : m === "median" ? t.median : t.percentile(Number(m.slice(1)));
    return [{ key: m, value, name, text: format(value) }];
  });
}

/** The zero-length transition used under reduced motion. */
export const INSTANT = { duration: 0 };

/** The markers a content key (see `Histogram`'s `markerKey`) was made from, so the memo depends on the key alone. */
export function markersFromKey(key: string): HistogramMarker[] {
  if (key === "") return [];
  return key.split("\u0002").map((part): HistogramMarker => {
    const at = part.indexOf("\u0001");
    return at < 0 ? (part as HistogramMarker) : { value: Number(part.slice(0, at)), label: part.slice(at + 1) };
  });
}

/** Legend items for a histogram: the bins, plus the density curve when it is drawn over them.
 *
 * @see /charts/histogram
 */
export function histogramLegend({
  color = 1,
  density = false,
  bars = true,
  labels,
}: {
  color?: ChartColor;
  density?: boolean;
  bars?: boolean;
  labels?: Partial<{ bins: string; density: string }>;
} = {}): LegendItem[] {
  const l = { bins: "Values", density: "Density", ...labels };
  const items: LegendItem[] = [];
  if (bars) items.push({ label: l.bins, color: slotColor(color), kind: "rect" });
  if (density) items.push({ label: l.density, color: bars ? "var(--sheen-fg-muted)" : slotColor(color), kind: "line" });
  return items;
}

/**
 * Formats bin edges so neighbouring bins never share a label: the default compact format when it
 * tells every edge apart, otherwise plain numbers with as many decimals as the bin width needs
 * (0.05-wide bins read "−0.85–−0.8", never "−0.9–−0.9"; 10-wide bins near 100,000 read
 * "100,010", never "100K").
 */
export function binEdgeFormat(bins: readonly HistogramBin[], locale?: string): (n: number) => string {
  const base = defaultCompact(locale);
  const edges = bins.length > 0 ? [itemAt(bins, 0).x0, ...bins.map((b) => b.x1)] : [];
  const distinct = (f: (n: number) => string) => edges.every((e, i) => i === 0 || f(e) !== f(edges[i - 1] ?? 0));
  if (distinct(base)) return base;
  const step = Math.abs((bins[0]?.x1 ?? 1) - (bins[0]?.x0 ?? 0)) || 1;
  let digits = clamp(Math.ceil(-Math.log10(step)) + 1, 0, 8);
  let f = plainFormat(locale, digits);
  while (!distinct(f) && digits < 8) f = plainFormat(locale, ++digits);
  return f;
}

/** A plain locale number formatter with a fixed number of decimals. */
export function plainFormat(locale: string | undefined, digits: number) {
  let intl: Intl.NumberFormat;
  try {
    intl = new Intl.NumberFormat(locale ?? "en", { maximumFractionDigits: digits });
  } catch {
    intl = new Intl.NumberFormat("en", { maximumFractionDigits: digits });
  }
  return (n: number) => (Number.isFinite(n) ? intl.format(n).replace("-", "−") : "–");
}

/** The stable empty marker list (keeps memo dependencies equal). */
export const NO_MARKERS: HistogramMarker[] = [];
/** The stable empty mark map (keeps memo dependencies equal). */
export const NO_MARKS: ReadonlyMap<string, MarkState> = new Map();

/** What binReadout needs to describe one bin. */
export type BinReadoutContext = {
  binList: readonly HistogramBin[];
  /** Values at or below each bin's upper edge. */
  below: readonly number[];
  total: number;
  measure: "count" | "percent";
  t: HistogramLabels;
  format: (n: number) => string;
  formatCount: (n: number) => string;
  pct: (ratio: number) => string;
  xLabel?: string;
  fill: string;
};

/** What a bin reads: its range, count, share and the share at or below it. */
export function binReadout(i: number, c: BinReadoutContext): Readout | undefined {
  const b = c.binList[i];
  if (!b) return undefined;
  const share = (count: number) => (c.total > 0 ? count / c.total : 0);
  // Numbers are isolated so right-to-left pages keep each one whole ("−0.9", not "0.9−").
  const f = (n: number) => isolate(c.format(n));
  const count = { label: c.t.count, value: isolate(c.formatCount(b.count)) };
  const part = { label: c.t.share, value: isolate(c.pct(share(b.count))) };
  const [main, other] = c.measure === "percent" ? [part, count] : [count, part];
  return {
    title: `${c.xLabel ? `${c.xLabel} ` : ""}${c.t.range(f(b.x0), f(b.x1))}`,
    rows: [
      { ...main, color: c.fill, kind: "rect" },
      { ...other, color: "transparent" },
      { label: c.t.cumulative(f(b.x1)), value: isolate(c.pct(share(c.below[i] ?? 0))), color: "transparent" },
    ],
  };
}
