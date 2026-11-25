"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { memo, useCallback, useDeferredValue, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, cubicBezier, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, fitTicks, useDockedReadout, useInputSource } from "./chart-fit";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  clamp,
  enterEase,
  exitTransition,
  linear,
  slotColor,
  truncate,
  useElementWidth,
  type ChartColor,
  ORIGIN_PT,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartTip, ChartValueTable, defaultCompact, hueMix, useEntrance } from "./heatmap";
import { markGlow, solidTipsScope, useDeferredDraw } from "./category-bar";
import { curvePath, useMorphClock, useMorphPoints, type MorphTiming, type Pt } from "./streamgraph";
import { ChartFigure } from "./chart-figure";

/* ======================================================================
 * Statistics: quantiles and kernel density estimation
 * ====================================================================== */

/** Quantile of sorted values by linear interpolation (the R-7 / Excel method). */
export function quantile(sorted: readonly number[], q: number) {
  const n = sorted.length;
  if (n === 0) return NaN;
  const pos = clamp(q, 0, 1) * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(n - 1, lo + 1);
  return (sorted[lo] ?? 0) + ((sorted[hi] ?? 0) - (sorted[lo] ?? 0)) * (pos - lo);
}

/** Count, five-number summary and mean of a sample. */
export type Summary = { n: number; min: number; p25: number; median: number; p75: number; max: number; mean: number };

/** Count, five-number summary and mean of the finite values. */
export function summarize(values: readonly number[]): Summary {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  const n = sorted.length;
  const mean = n ? sorted.reduce((s, v) => s + v, 0) / n : NaN;
  return {
    n,
    min: sorted[0] ?? NaN,
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    max: sorted[n - 1] ?? NaN,
    mean,
  };
}

/**
 * Silverman's rule-of-thumb bandwidth: 0.9 · min(σ, IQR / 1.34) · n^(−1/5). Falls back to a
 * twentieth of `span` when the values don't vary (one value, or all equal).
 */
export function silvermanBandwidth(values: readonly number[], span = 1) {
  const s = summarize(values);
  if (s.n < 2) return Math.max(1e-9, span / 20);
  const sd = Math.sqrt(values.reduce((acc, v) => acc + (v - s.mean) ** 2, 0) / (s.n - 1));
  const iqr = (s.p75 - s.p25) / 1.34;
  const spread = Math.min(sd, iqr > 0 ? iqr : sd);
  const h = 0.9 * spread * s.n ** -0.2;
  return h > 0 && Number.isFinite(h) ? h : Math.max(1e-9, span / 20);
}

/** Gaussian kernel density of `values` at each x in `xs` (bandwidth `h`); integrates to 1. */
export function kde(values: readonly number[], xs: readonly number[], h: number) {
  const n = values.length;
  if (n === 0 || !(h > 0)) return xs.map(() => 0);
  const k = 1 / (n * h * Math.sqrt(2 * Math.PI));
  return xs.map((x) => {
    let sum = 0;
    for (const v of values) {
      const u = (x - v) / h;
      if (u > -8 && u < 8) sum += Math.exp(-0.5 * u * u);
    }
    return sum * k;
  });
}

/* ======================================================================
 * Ridgeline
 * ====================================================================== */

/** One ridge of a RidgelineChart: a label, the raw observations and an optional palette slot. */
export type RidgelineGroup = {
  label: string;
  /** Raw observations (e.g. every delivery time this month). Non-finite values are ignored. */
  values: readonly number[];
  /** Palette slot of this ridge. Default: the chart's `color`. */
  color?: ChartColor;
};

/**
 * Every string RidgelineChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type RidgelineChartLabels = {
  instructions: ChartInstructions;
  median: string;
  mean: string;
  /** The interquartile range row, e.g. "Middle 50%". */
  middle: string;
  range: string;
  count: string;
  /** Low–high pair, e.g. "12–18". */
  between: (low: string, high: string) => string;
  /** Group column header in the table. */
  group: string;
  min: string;
  max: string;
  p25: string;
  p75: string;
  /** Touch screens: the hint in the readout band before anything is read. */
  touchHint: string;
  empty: string;
};

/**
 * The built-in English strings of RidgelineChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultRidgelineChartLabels: RidgelineChartLabels = {
  instructions: "Use the arrow keys to read each distribution.",
  median: "median",
  mean: "mean",
  middle: "middle 50%",
  range: "range",
  count: "values",
  between: (low, high) => (/^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`),
  group: "Group",
  min: "Min",
  max: "Max",
  p25: "25th pct",
  p75: "75th pct",
  touchHint: "Tap a ridge to read its distribution",
  empty: "No data",
};

/**
 * Props of RidgelineChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type RidgelineChartProps = {
  /** One group per ridge, top to bottom, each with its raw values. */
  data: readonly RidgelineGroup[];
  /** Palette slot for the ridges (one hue: position and name tell them apart). Default 1. */
  color?: ChartColor;
  /** "series": each ridge in its colour. "sequential": filled with a light → dark ramp along the value axis. */
  fill?: "series" | "sequential";
  /** Sets the kernel bandwidth in value units. Default: Silverman's rule, per group. */
  bandwidth?: number;
  /** Sets the value axis range. Default: the data, padded by the widest bandwidth. */
  domain?: [number, number];
  /** "shared" (default): one density scale, so a tight distribution stands taller. "each": every ridge peaks at the same height. */
  scale?: "shared" | "each";
  /** How far a ridge may rise into the rows above, in rows. Default 2. */
  overlap?: number;
  /** Sets the height of each row, in px. Default 34. */
  rowHeight?: number;
  /** Draw a tick at each group's median. Default true. */
  showMedian?: boolean;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<RidgelineChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GRID = 96; // density samples per ridge
const CHAR_W = 6.6;

const bezier = (e: readonly number[]) => cubicBezier(e[0] ?? 0, e[1] ?? 0, e[2] ?? 1, e[3] ?? 1);
const enterCurve = bezier(enterEase);
const changeCurve = bezier(changeEase);

/**
 * One ridge: occluder, fill, baseline, outline and median tick. Its points morph on the chart's
 * clock and every path is derived from them (useTransform), so the rise-in and data changes
 * never re-render React. The shape is memoised apart from its emphasis: reading another ridge
 * only flips data attributes on this group (CSS lights the glow), so no path is rebuilt.
 */
const Ridge = memo(function Ridge({
  lit,
  dim,
  reduced,
  ...shape
}: RidgeShapeProps & { lit: boolean; dim: boolean; reduced: boolean }) {
  return (
    <motion.g
      data-ridge-lit={lit ? "" : undefined}
      initial={{ opacity: 1 }}
      animate={{ opacity: dim ? 0.4 : 1 }}
      exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
      transition={{ opacity: { duration: reduced ? 0 : duration.fast } }}
    >
      <RidgeShape {...shape} />
    </motion.g>
  );
});

type RidgeShapeProps = {
  top: readonly Pt[];
  flat: readonly Pt[];
  clock: MotionValue<number>;
  timing: (order: number) => MorphTiming;
  order: number;
  line: string;
  fill: string;
  fillOpacity: number;
  innerW: number;
  yb: number;
  /** x of the median tick (null: no tick); `medianJ` is its index on the density grid. */
  medianX: number | null;
  medianJ: number;
};

const RidgeShape = memo(function RidgeShape({
  top,
  flat,
  clock,
  timing,
  order,
  line,
  fill,
  fillOpacity,
  innerW,
  yb,
  medianX,
  medianJ,
}: RidgeShapeProps) {
  const pts = useMorphPoints(top, flat, clock, () => timing(order));
  const geo = useRef({ yb, medianJ });
  useSyncRef(geo, { yb, medianJ });
  // One curve per frame; the area closes it along the (straight) baseline.
  const shapes = useTransform(pts, (p: readonly Pt[]) => {
    const c = curvePath(p);
    const first = p[0];
    const last = p[p.length - 1];
    const b = geo.current.yb.toFixed(1);
    return { c, a: first && last ? `${c} L${last[0].toFixed(1)},${b} L${first[0].toFixed(1)},${b} Z` : "" };
  });
  const curve = useTransform(shapes, (s: { c: string }) => s.c);
  const area = useTransform(shapes, (s: { a: string }) => s.a);
  const medianY = useTransform(pts, (p: readonly Pt[]) => p[geo.current.medianJ]?.[1] ?? geo.current.yb);
  return (
    <>
      {/* Opaque occluder, so the ridge in front hides the one behind. */}
      <motion.path fill="var(--sheen-chart-surface)" d={area} />
      <motion.path fill={fill} fillOpacity={fillOpacity} d={area} />
      <line x1={0} x2={innerW} y1={yb} y2={yb} stroke="var(--sheen-border)" />
      <motion.path
        d={curve}
        fill="none"
        stroke={line}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="forced-colors:stroke-[CanvasText] in-data-ridge-lit:[filter:var(--ridge-glow)]"
        style={{ "--ridge-glow": markGlow(line, 7) } as React.CSSProperties}
      />
      {medianX !== null && (
        <motion.line
          x1={medianX}
          x2={medianX}
          y1={yb}
          y2={medianY}
          stroke="var(--sheen-fg)"
          strokeOpacity={0.7}
          strokeWidth={1.5}
          strokeDasharray="2 2"
          className="forced-colors:stroke-[CanvasText]"
        />
      )}
    </>
  );
});

/**
 * Distributions stacked as overlapping ridges (a joyplot): how a measure is spread in each
 * group, and how that shifts from group to group (delivery times per month, salaries per role).
 *
 * - Each ridge is a Gaussian kernel density of the raw values (Silverman's bandwidth unless
 *   you set one), on one shared value axis; a tick marks the median.
 * - Ridges overlap the rows above for that "mountain range" look, layered back to front so each
 *   stays readable; names sit in their own column, never under a curve.
 * - Hover, tap or arrow through the ridges: the ridge lights up (and glows in the dark theme),
 *   the others step back, and its median, mean, middle 50%, range and count are shown and announced.
 * - Ridges rise from their baselines, top to bottom, the first time the chart scrolls into view;
 *   new data reshapes them. Reduced motion: drawn in place.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between ridges, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the group's median, mean, middle 50%, range and count. `RidgelineTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws the ridges in place.
 *
 * @example
 * ```tsx
 * import { RidgelineChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RidgelineChart
 *       data={[
 *         { label: "Jan", values: [3, 4, 4, 5, 6, 6, 7, 9] },
 *         { label: "Feb", values: [4, 5, 5, 6, 7, 8, 8, 10] },
 *         { label: "Mar", values: [5, 6, 7, 7, 8, 9, 10, 12] },
 *       ]}
 *       aria-label="Delivery time in days, by month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/ridgeline
 */
export function RidgelineChart({
  data: dataProp,
  color = 1,
  fill: fillProp = "series",
  bandwidth,
  domain,
  scale: scaleProp = "shared",
  overlap = 2,
  rowHeight = 34,
  showMedian = true,
  format: formatProp,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<RidgelineChartProps>) {
  const t = { ...defaultRidgelineChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const countFormat = defaultCompact(locale);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const docked = useDockedReadout(width);
  const [active, setActive] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();
  // New data, scale or fill are drawn in a deferred render (React yields while it rebuilds the
  // ridges), so the control that changed them responds at once; then the ridges reshape.
  const data = useDeferredValue(dataProp);
  const scale = useDeferredValue(scaleProp);
  const fill = useDeferredValue(fillProp);
  // Marks are built once the chart nears the viewport, in a deferred render (see useDeferredDraw):
  // a page load or a ChartCard's Chart tab coming back paints the frame at once, the marks right after.
  const drawn = useDeferredDraw(rootRef);

  const groups = useMemo(
    () => data.map((g) => ({ label: g.label, color: g.color, values: g.values.filter(Number.isFinite) })),
    [data],
  );
  const count = groups.length;
  const isEmpty = count === 0 || groups.every((g) => g.values.length === 0);
  const domainLo = domain?.[0];
  const domainHi = domain?.[1];

  const model = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of groups.flatMap((g) => g.values)) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
    const span = hi - lo || Math.abs(hi) || 1;
    const hs = groups.map((g) => bandwidth ?? silvermanBandwidth(g.values, span));
    const pad = Math.max(0, ...hs) * 1.5;
    const d0 = domainLo ?? lo - pad;
    const d1 = domainHi ?? hi + pad;
    const xs = Array.from({ length: GRID }, (_, i) => d0 + ((d1 - d0) * i) / (GRID - 1));
    const densities = groups.map((g, i) => (drawn ? kde(g.values, xs, hs[i] ?? 0) : xs.map(() => 0)));
    const peaks = densities.map((d) => d.reduce((m, v) => Math.max(m, v), 0));
    const shared = Math.max(1e-12, ...peaks);
    const stats = groups.map((g) => summarize(g.values));
    return { xs, d0, d1, densities, peaks, shared, stats };
  }, [groups, bandwidth, domainLo, domainHi, drawn]);

  const signature = groups.map((g) => g.label + ":" + g.values.join(",")).join("|") + scale + fill;

  const between = t.between;
  const readouts = useMemo(
    () =>
      groups.map((g, i) => {
        const s = itemAt(model.stats, i);
        const swatch = slotColor(g.color ?? color);
        const rows: TooltipRow[] =
          s.n === 0
            ? [{ label: "", value: t.empty, color: "transparent" }]
            : [
                { label: t.median, value: format(s.median), color: swatch, kind: "line" },
                { label: t.mean, value: format(s.mean), color: "transparent" },
                { label: t.middle, value: between(format(s.p25), format(s.p75)), color: "transparent" },
                { label: t.range, value: between(format(s.min), format(s.max)), color: "transparent" },
                { label: t.count, value: countFormat(s.n), color: "transparent" },
              ];
        return { title: g.label, rows };
      }),
    [groups, model, format, countFormat, color, t.median, t.mean, t.middle, t.range, t.count, t.empty, between],
  );
  const dock = docked ? dockSpace(width, readouts, 3) : 0;

  // Layout: a name column, then the plot. Ridge i sits on baseline (i + 1) rows down; the first
  // ridge's overlap needs headroom above it.
  const longest = groups.reduce((m, g) => Math.max(m, g.label.length), 0);
  const nameW = width > 0 ? clamp(Math.ceil(longest * CHAR_W) + 14, 40, Math.max(40, Math.floor(width * 0.3))) : 0;
  const peakH = rowHeight * Math.max(0.5, overlap);
  const headroom = Math.max(6, peakH - rowHeight + 6);
  const axisH = 26;
  const height = dock + headroom + count * rowHeight + axisH;
  const M = { top: dock + headroom, left: nameW, right: 12 };
  const innerW = Math.max(0, width - M.left - M.right);
  const x = useMemo(() => linear(model.d0, model.d1, 0, innerW), [model.d0, model.d1, innerW]);
  const baseline = useCallback((i: number) => (i + 1) * rowHeight, [rowHeight]);
  const tickFormat = axisFormat(formatProp);
  const ticks = fitTicks(model.d0, model.d1, { length: innerW, axis: "x", format: tickFormat }).filter(
    (v) => v >= model.d0 && v <= model.d1,
  );

  // Ridge paths depend on the data and the size only, never on what is being read: built once
  // per layout, so hovering re-renders no curves.
  const ridges = useMemo(
    () =>
      groups.map((g, i) => {
        const dens = itemAt(model.densities, i);
        const peak = scale === "each" ? (model.peaks[i] ?? 0) : model.shared;
        const yb = baseline(i);
        const k = peak > 0 ? peakH / peak : 0;
        const top: Pt[] = model.xs.map((v, j) => [x(v), yb - (dens[j] ?? 0) * k]);
        const flat: Pt[] = model.xs.map((v) => [x(v), yb]);
        const s = itemAt(model.stats, i);
        // Height of the curve at the median, for the tick.
        const mj = s.n
          ? clamp(Math.round(((s.median - model.d0) / (model.d1 - model.d0 || 1)) * (GRID - 1)), 0, GRID - 1)
          : 0;
        const peakJ = dens.reduce((best, v, j) => (v > (dens[best] ?? 0) ? j : best), 0);
        return {
          g,
          i,
          line: slotColor(g.color ?? color),
          yb,
          top,
          flat,
          median: s.n ? { x: x(s.median), j: mj } : null,
          peak: top[peakJ] ?? ORIGIN_PT,
          empty: s.n === 0,
        };
      }),
    [groups, model, scale, peakH, baseline, x, color],
  );

  // Choreography on one clock: ridges rise from their baselines, top to bottom; data changes
  // reshape them. Resizes snap; reduced motion draws in place.
  const clock = useMotionValue(0);
  const phase = useMorphClock(clock, {
    play,
    ready: width > 0 && !isEmpty && drawn,
    reduced,
    signature,
    version: ridges,
    entrance: duration.slower + Math.max(0, count - 1) * 0.07,
    change: duration.slow,
  });
  const [timing] = useState(
    () =>
      (order: number): MorphTiming =>
        phase.current === "enter"
          ? { delay: order * 0.07, span: duration.slower, ease: enterCurve }
          : { delay: 0, span: duration.slow, ease: changeCurve },
  );

  if (isEmpty) {
    return (
      <div ref={measureRef} className={cn("w-full", className)}>
        <ChartEmpty height={Math.max(160, count * rowHeight + 60)} aria-label={ariaLabel}>
          {emptyState ?? t.empty}
        </ChartEmpty>
      </div>
    );
  }

  const act = active !== null && active < count ? active : null;
  const readout = act !== null ? readouts[act] : undefined;
  const announceText = readout
    ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}`
    : "";

  const sequential = fill === "sequential";

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    fromPointer();
    const py = event.clientY - rect.top - (headroom - 0);
    // Each row owns the band above its baseline (where its own ridge mostly is).
    setActive(clamp(Math.floor(py / rowHeight), 0, count - 1));
  }

  const tipAnchor = (() => {
    if (act === null) return null;
    const r = itemAt(ridges, act);
    return { x: M.left + r.peak[0] - 4, y: M.top + r.peak[1] - 4, w: 8, h: 8 };
  })();

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className={cn("relative w-full", solidTipsScope)} style={{ height }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={height}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            onKeyDown={(e) => {
              fromKeyboard();
              chartKeyHandler(count, act, setActive)(e);
            }}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
            // Drawn in px with names on the left; it never mirrors (RTL). Vertical swipes scroll, drags read.
            style={{ direction: "ltr", touchAction: "pan-y pinch-zoom" }}
          >
            <defs>
              {/* Each ridge fades from its crest to the baseline. */}
              {ridges.map((r) => (
                <linearGradient key={r.i} id={`${id}-v${r.i}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={r.line} stopOpacity={0.62} />
                  <stop offset="1" stopColor={r.line} stopOpacity={0.1} />
                </linearGradient>
              ))}
              {/* Sequential fill: a single-hue ramp along the value axis, light → dark. */}
              {sequential && (
                <linearGradient id={`${id}-seq`} gradientUnits="userSpaceOnUse" x1={0} x2={innerW} y1={0} y2={0}>
                  {[0, 0.25, 0.5, 0.75, 1].map((s) => (
                    <stop key={s} offset={s} style={{ stopColor: hueMix(color, 0.22 + 0.78 * s) }} />
                  ))}
                </linearGradient>
              )}
            </defs>

            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {/* Vertical gridlines at the value ticks, behind every ridge. */}
              {ticks.map((tk) => (
                <line
                  key={tk}
                  x1={x(tk)}
                  x2={x(tk)}
                  y1={-headroom + 4}
                  y2={count * rowHeight}
                  stroke="var(--sheen-chart-grid)"
                />
              ))}

              <g className="forced-color-adjust-none">
                <AnimatePresence initial={false}>
                  {drawn &&
                    ridges.map((r) => (
                      <Ridge
                        key={`${r.g.label}-${r.i}`}
                        top={r.top}
                        flat={r.flat}
                        clock={clock}
                        timing={timing}
                        order={r.i}
                        line={r.line}
                        fill={sequential ? `url(#${id}-seq)` : `url(#${id}-v${r.i})`}
                        fillOpacity={sequential ? 0.92 : 1}
                        innerW={innerW}
                        yb={r.yb}
                        medianX={showMedian && r.median ? r.median.x : null}
                        medianJ={r.median?.j ?? 0}
                        lit={act === r.i}
                        dim={act !== null && act !== r.i}
                        reduced={reduced}
                      />
                    ))}
                </AnimatePresence>
              </g>

              {/* Value axis. */}
              {ticks.map((tk) => (
                <text
                  key={tk}
                  x={x(tk)}
                  y={count * rowHeight + 18}
                  textAnchor="middle"
                  className="fill-sheen-fg-muted text-2xs tabular-nums"
                >
                  {tickFormat(tk)}
                </text>
              ))}
            </g>

            {/* Names, each on its ridge's baseline. */}
            <g aria-hidden>
              {groups.map((g, i) => (
                <text
                  key={i}
                  x={nameW - 10}
                  y={M.top + baseline(i) - 5}
                  textAnchor="end"
                  className={cn("text-xs", act === i ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted")}
                >
                  {truncate(g.label, Math.max(3, Math.floor((nameW - 14) / CHAR_W)))}
                </text>
              ))}
            </g>

            <rect
              x={0}
              y={dock}
              width={width}
              height={headroom + count * rowHeight}
              fill="transparent"
              onPointerDown={onPointer}
              onPointerMove={onPointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </ChartFigure>
        )}

        {docked && act === null && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
        {readout && tipAnchor && (
          <ChartTip
            title={readout.title}
            rows={readout.rows}
            anchor={tipAnchor}
            bounds={{ w: width, h: height }}
            docked={docked}
            order={["right", "left", "above", "below"]}
            minLeft={nameW}
          />
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of RidgelineTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type RidgelineTableProps = Pick<RidgelineChartProps, "data" | "format" | "locale" | "labels"> & {
  /** Visually hidden caption that names the table. */
  caption?: string;
};

/**
 * Each group's count, five-number summary and mean.
 *
 * Props: the chart's `data`, `format`, `locale` and `labels`, plus `caption` (hidden, names the table). A real table: each group's count, five-number summary and mean. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { RidgelineTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RidgelineTable data={[{ label: "Jan", values: [3, 4, 4, 5, 6, 6, 7, 9] }]} caption="Delivery time in days, by month" />
 *   );
 * }
 * ```
 *
 * @see /charts/ridgeline
 */
export function RidgelineTable({
  data,
  format: formatProp,
  locale,
  labels: labelOverrides,
  caption,
}: RidgelineTableProps) {
  const t = { ...defaultRidgelineChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={t.empty}
      columns={[t.group, cap(t.count), t.min, t.p25, cap(t.median), t.p75, t.max, cap(t.mean)].map((label) => ({
        label,
      }))}
      rows={data.map((g) => {
        const s = summarize(g.values);
        const cell = (v: number) => (Number.isFinite(v) ? format(v) : "–");
        return [
          g.label,
          defaultCompact(locale)(s.n),
          cell(s.min),
          cell(s.p25),
          cell(s.median),
          cell(s.p75),
          cell(s.max),
          cell(s.mean),
        ];
      })}
    />
  );
}
