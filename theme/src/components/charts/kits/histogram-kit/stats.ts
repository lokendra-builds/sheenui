import { itemAt, clamp, decimalsOf } from "../../chart-utils";

/* ======================================================================
 * Statistics shared by the histogram, box plot / violin and beeswarm:
 * quantiles, five-number summaries, kernel density and binning.
 * Pure functions: no React, safe to call on the server.
 * ====================================================================== */

/** The finite numbers of a list, sorted ascending (a new array; the input is untouched).
 *
 * @see /charts/histogram
 */
export function sortedValues(values: readonly unknown[]): number[] {
  const out: number[] = [];
  for (const v of values) if (typeof v === "number" && Number.isFinite(v)) out.push(v);
  return out.sort((a, b) => a - b);
}

/** The p-quantile (0–1) of SORTED values, linearly interpolated (R type 7, Excel PERCENTILE.INC). NaN when empty.
 *
 * @see /charts/histogram
 */
export function quantileSorted(sorted: readonly number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const h = (n - 1) * clamp(p, 0, 1);
  const lo = Math.floor(h);
  const a = sorted[lo] ?? 0;
  const b = sorted[Math.min(n - 1, lo + 1)] ?? 0;
  return a + (b - a) * (h - lo);
}

/**
 * Summary of a sample: count, extremes, mean, standard deviation, quartiles, whisker reach and
 * outliers.
 */
export type DistributionStats = {
  n: number;
  min: number;
  max: number;
  mean: number;
  /** Sample standard deviation (0 for fewer than two values). */
  sd: number;
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  /** Ends of the whiskers: the most extreme values inside the fences. */
  whiskerLow: number;
  whiskerHigh: number;
  /** Values beyond the whiskers, ascending. */
  outliers: number[];
};

/**
 * Summary of SORTED values for a box plot. `whisker` is the Tukey multiple of the IQR (1.5 by
 * default: points beyond Q1 − 1.5·IQR or Q3 + 1.5·IQR are outliers), or "minmax" (whiskers reach
 * the extremes, no outliers). Null when there are no values.
 *
 * @see /charts/histogram
 */
export function distributionStats(
  sorted: readonly number[],
  whisker: number | "minmax" = 1.5,
): DistributionStats | null {
  const n = sorted.length;
  if (n === 0) return null;
  let sum = 0;
  for (const v of sorted) sum += v;
  const mean = sum / n;
  let ss = 0;
  for (const v of sorted) ss += (v - mean) ** 2;
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
  const q1 = quantileSorted(sorted, 0.25);
  const median = quantileSorted(sorted, 0.5);
  const q3 = quantileSorted(sorted, 0.75);
  const iqr = q3 - q1;
  const min = sorted[0] ?? 0;
  const max = sorted[n - 1] ?? 0;
  if (whisker === "minmax")
    return { n, min, max, mean, sd, q1, median, q3, iqr, whiskerLow: min, whiskerHigh: max, outliers: [] };
  const k = Math.max(0, whisker);
  const lowFence = q1 - k * iqr;
  const highFence = q3 + k * iqr;
  let whiskerLow = q1;
  let whiskerHigh = q3;
  const outliers: number[] = [];
  for (const v of sorted) {
    if (v < lowFence || v > highFence) outliers.push(v);
    else {
      whiskerLow = Math.min(whiskerLow, v);
      whiskerHigh = Math.max(whiskerHigh, v);
    }
  }
  return { n, min, max, mean, sd, q1, median, q3, iqr, whiskerLow, whiskerHigh, outliers };
}

/**
 * Silverman's rule-of-thumb bandwidth for a Gaussian KDE of SORTED values:
 * 0.9 · min(sd, IQR / 1.34) · n^(−1/5), with sensible fallbacks when the spread is zero.
 */
export function silvermanBandwidth(sorted: readonly number[]): number {
  const s = distributionStats(sorted, "minmax");
  if (!s || s.n < 2) return 0;
  const spread = Math.min(s.sd, s.iqr / 1.34) || s.sd || (s.max - s.min) / 4;
  return spread > 0 ? 0.9 * spread * s.n ** -0.2 : 0;
}

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/**
 * Gaussian kernel density of SORTED values, evaluated at each of `at`. Integrates to 1.
 * Only the values within 4 bandwidths of a point are summed, so it stays fast for large samples.
 *
 * @see /charts/histogram
 */
export function kernelDensity(sorted: readonly number[], bandwidth: number, at: readonly number[]): number[] {
  const n = sorted.length;
  if (n === 0 || !(bandwidth > 0)) return at.map(() => 0);
  const reach = bandwidth * 4;
  const k = 1 / (n * bandwidth * SQRT_2PI);
  let start = 0;
  return at.map((x) => {
    // `at` is usually ascending: keep a sliding window start; fall back to a scan otherwise.
    if (start > 0 && (sorted[start - 1] ?? 0) >= x - reach) start = 0;
    while (start < n && (sorted[start] ?? 0) < x - reach) start++;
    let sum = 0;
    for (let i = start; i < n && (sorted[i] ?? 0) <= x + reach; i++) {
      const u = (x - (sorted[i] ?? 0)) / bandwidth;
      sum += Math.exp(-0.5 * u * u);
    }
    return sum * k;
  });
}

/** `count` evenly spaced numbers from `a` to `b`, inclusive. */
export function samplePoints(a: number, b: number, count: number): number[] {
  const n = Math.max(2, Math.floor(count));
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

/** A rule for the number of histogram bins: `auto`, `sturges`, `freedman-diaconis` or `scott`. */
export type BinMethod = "auto" | "sturges" | "freedman-diaconis" | "scott";

/**
 * How many bins a rule suggests for SORTED values. "auto" takes the larger of Sturges and
 * Freedman–Diaconis (as numpy does): Sturges suits small samples, FD resists outliers in large ones.
 *
 * @see /charts/histogram
 */
export function suggestedBinCount(sorted: readonly number[], method: BinMethod = "auto"): number {
  const n = sorted.length;
  if (n < 2) return 1;
  const span = (sorted[n - 1] ?? 0) - (sorted[0] ?? 0);
  if (!(span > 0)) return 1;
  const sturges = Math.ceil(Math.log2(n)) + 1;
  const byWidth = (w: number) => (w > 0 ? Math.ceil(span / w) : sturges);
  const iqr = quantileSorted(sorted, 0.75) - quantileSorted(sorted, 0.25);
  const fd = byWidth(2 * iqr * n ** (-1 / 3));
  const s = distributionStats(sorted, "minmax");
  const scott = byWidth(3.49 * (s?.sd ?? 0) * n ** (-1 / 3));
  const k =
    method === "sturges"
      ? sturges
      : method === "freedman-diaconis"
        ? fd
        : method === "scott"
          ? scott
          : Math.max(sturges, fd);
  return clamp(k, 1, 120);
}

/** The "nice" step (1, 2, 2.5 or 5 × 10ⁿ) closest to `rough` (on a log scale). */
export function niceStep(rough: number): number {
  if (!(rough > 0) || !Number.isFinite(rough)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  let best = magnitude;
  for (const m of [1, 2, 2.5, 5, 10]) {
    const step = m * magnitude;
    if (Math.abs(Math.log(step / rough)) < Math.abs(Math.log(best / rough))) best = step;
  }
  return best;
}

/** One bin of a histogram: its lower and upper edge and how many values fall in it. */
export type HistogramBin = {
  /** Lower edge (inclusive). */
  x0: number;
  /** Upper edge (exclusive, except the last bin, which includes it). */
  x1: number;
  count: number;
};

/**
 * Options of the binning function: the bin count or rule, the range to bin and whether to round the
 * edges to nice numbers.
 */
export type HistogramBinOptions = {
  /** A bin count, or a rule that suggests one. Default "auto". */
  bins?: number | BinMethod;
  /** Range to bin. Default: the data's extent. Values outside it are left out. */
  domain?: readonly [number, number];
  /** Snap edges to round numbers (the count then lands near, not exactly on, `bins`). Default true. */
  nice?: boolean;
};

/** Bins SORTED values into equal-width intervals. Empty input gives no bins.
 *
 * @see /charts/histogram
 */
export function histogramBins(
  sorted: readonly number[],
  { bins = "auto", domain, nice = true }: HistogramBinOptions = {},
): HistogramBin[] {
  if (sorted.length === 0) return [];
  let lo = domain ? Math.min(domain[0], domain[1]) : (sorted[0] ?? 0);
  let hi = domain ? Math.max(domain[0], domain[1]) : (sorted[sorted.length - 1] ?? 0);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [];
  const inside = domain ? sorted.filter((v) => v >= lo && v <= hi) : sorted;
  const wanted = typeof bins === "number" ? clamp(Math.round(bins), 1, 500) : suggestedBinCount(inside, bins);
  if (hi === lo) {
    // One distinct value: a single bin around it.
    const pad = nice ? niceStep(Math.abs(lo) * 0.2 || 1) / 2 : Math.abs(lo) * 0.1 || 0.5;
    lo -= pad;
    hi += pad;
  }
  let step = (hi - lo) / wanted;
  let start = lo;
  let count = wanted;
  if (nice) {
    step = niceStep(step);
    start = Math.floor(lo / step + 1e-9) * step;
    count = Math.max(1, Math.ceil((hi - start) / step - 1e-9));
    // A value sitting exactly on the top edge belongs to the last bin.
  }
  const digits = Math.min(20, decimalsOf(step) + 2);
  const edge = (i: number) => Number((start + i * step).toFixed(digits));
  const out: HistogramBin[] = Array.from({ length: count }, (_, i) => ({ x0: edge(i), x1: edge(i + 1), count: 0 }));
  for (const v of inside) {
    const i = clamp(Math.floor((v - start) / step + 1e-9), 0, count - 1);
    itemAt(out, i).count++;
  }
  return out;
}
