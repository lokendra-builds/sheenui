"use client";

import type { ChartRoot } from "./chart-utils";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, LegendKey, type LegendItem } from "./chart-parts";
import {
  chartFades,
  DockHint,
  dockHintHeight,
  dockSpace,
  FittedTooltip,
  fitTicks,
  TableScroll,
  useDockedReadout,
  useInputSource,
  type Readout,
} from "./chart-fit";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  clamp,
  enterEase,
  extent,
  formatCompact,
  linear,
  slotColor,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** One point of a ScatterChart: x and y, and optionally a bubble size, a label and an id. */
export type ScatterPoint = {
  x: number;
  y: number;
  /** Bubble size (with `bubble`): drawn as the circle's AREA, so 4x the size reads as 4x the ink. */
  size?: number;
  /** Names the point in the tooltip and the table (e.g. a company or a city). */
  label?: string;
  /** Stable identity, so the point glides to its new position when the data changes. Defaults to label, then position. */
  id?: string;
};

/** A series of a ScatterChart: a label, an optional palette slot and its points. */
export type ScatterSeries = {
  label: string;
  /** Colour slot 1–8. Defaults to the series' position. */
  color?: ChartColor;
  data: readonly ScatterPoint[];
};

/** Every string the chart shows or announces, for translation. */
export type ScatterChartLabels = {
  /** Axis names used when `xLabel` / `yLabel` / `sizeLabel` aren't given. */
  x: string;
  y: string;
  size: string;
  /** Name of the neutral series that folds in every series past the third. */
  other: string;
  /** Header of the series column in the table. */
  series: string;
  /** Header of the point-name column in the table. */
  point: string;
  /** Shown in an empty table. */
  noData: string;
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a point is active. */
  touchHint: string;
  /**
   * Describes a series' trend line for screen readers. `slope` (change in y per 1 of x) and `r2`
   * come pre-formatted to 3 significant digits; `fit` has the raw numbers for your own wording.
   */
  trendSummary: (
    series: string,
    slope: string,
    r2: string,
    fit: { slope: number; intercept: number; r2: number },
  ) => string;
};

/**
 * The built-in English strings of ScatterChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultScatterChartLabels: ScatterChartLabels = {
  x: "x",
  y: "y",
  size: "Size",
  other: "Other",
  series: "Series",
  point: "Point",
  noData: "No data",
  instructions: "Use the arrow keys to move between points: left and right follow x, up and down follow y.",
  touchHint: "Tap near a point to read it.",
  trendSummary: (series, slope, r2) => `${series} trend: slope ${slope} per unit of x, R² ${r2}.`,
};

/**
 * Props of ScatterChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type ScatterChartProps = {
  /**
   * Up to 3 series: in a scatter every colour sits next to every other, so a 4th would be
   * hard to tell apart. Series past the third fold into one neutral "Other" series.
   */
  series: readonly ScatterSeries[];
  /** Name of the x measure: titles the axis and the tooltip. */
  xLabel?: string;
  /** Name of the y measure: titles the axis and the tooltip. */
  yLabel?: string;
  /** Sets the name of the size measure (bubble charts). */
  sizeLabel?: string;
  /** Size each point by its `size` (a bubble chart). */
  bubble?: boolean;
  /** Draw a least-squares trend line through each series (needs 2+ points with different x). */
  trendline?: boolean;
  /** Keep 0 on the axes even when the data sits far from it. */
  includeZero?: boolean;
  /** Height of the chart in px; the width follows the container. Default 300. */
  height?: number;
  /** Formats x values on the axis and in the tooltip. Default compact numbers. */
  formatX?: (n: number) => string;
  /** Formats y values on the axis and in the tooltip. Default compact numbers. */
  formatY?: (n: number) => string;
  /** Formats bubble sizes in the tooltip. Default compact numbers. */
  formatSize?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override any built-in string (i18n). */
  labels?: Partial<ScatterChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** In a scatter every colour is compared with every other ("all pairs"): three is the safe limit. */
export const MAX_SCATTER_SERIES = 3;
const DOT_R = 4.5;
const slopeFormatter = new Intl.NumberFormat("en", { maximumSignificantDigits: 3 });
const formatSlope = (n: number) => slopeFormatter.format(n).replace("-", "\u2212");

/** Clip the segment (x1,y1)–(x2,y2) to a rectangle (Liang–Barsky). Null when it lies outside. */
function clipSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, x1 - left],
    [dx, right - x1],
    [-dy, y1 - top],
    [dy, bottom - y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return { x1: x1 + t0 * dx, y1: y1 + t0 * dy, x2: x1 + t1 * dx, y2: y1 + t1 * dy };
}
const MIN_R = 4;
const CHAR_W = 6.2;

/** Least-squares fit y = slope * x + intercept, with R². Null for < 2 points or no spread in x. */
export function linearRegression(points: readonly { x: number; y: number }[]) {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const n = pts.length;
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of pts) {
    sxx += (p.x - mx) ** 2;
    sxy += (p.x - mx) * (p.y - my);
    syy += (p.y - my) ** 2;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2 };
}

type FoldedSeries = { label: string; color: string; data: readonly ScatterPoint[]; other: boolean; slot: number };

/** The series as drawn: the first three keep their colour slot, the rest fold into a neutral "Other". */
export function foldScatterSeries(
  series: readonly ScatterSeries[],
  otherLabel = defaultScatterChartLabels.other,
): FoldedSeries[] {
  const kept = series.slice(0, MAX_SCATTER_SERIES).map((s, i) => {
    const slot = s.color ?? i + 1;
    return { label: s.label, color: slotColor(slot), data: s.data, other: false, slot };
  });
  const rest = series.slice(MAX_SCATTER_SERIES);
  if (rest.length === 0) return kept;
  return [...kept, { label: otherLabel, color: slotColor(0), data: rest.flatMap((s) => s.data), other: true, slot: 0 }];
}

/** Legend items for a scatter chart, with the same "Other" fold as the chart. */
export function scatterLegend(series: readonly ScatterSeries[], otherLabel?: string): LegendItem[] {
  return foldScatterSeries(series, otherLabel).map((s) => ({ label: s.label, color: s.color, kind: "rect" }));
}

type Dot = {
  key: string;
  si: number;
  point: ScatterPoint;
  px: number;
  py: number;
  r: number;
  color: string;
};

/**
 * A scatter plot of x against y, with optional bubble sizes and trendline. Use it to show whether two measures move together and to spot outliers.
 *
 * Keyboard: Tab focuses the chart; Right/Left step through the points in x order, Up/Down in y order, Home and End jump to the first and last in x order, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the point's x, y (and size). `ScatterTable` is the table view.
 * Glass and motion: points fade in the first time the chart appears and tween on data change; reduced motion makes both instant. Only the glass-3 tooltip uses backdrop blur.
 *
 * @example
 * ```tsx
 * import { ScatterChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ScatterChart
 *       series={[
 *         {
 *           label: "Accounts",
 *           data: [
 *             { x: 12, y: 340 },
 *             { x: 30, y: 910 },
 *             { x: 55, y: 1480 },
 *           ],
 *         },
 *       ]}
 *       xLabel="Sessions"
 *       yLabel="Revenue"
 *       trendline
 *       aria-label="Sessions against revenue"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/scatter-plot
 */
export function ScatterChart({
  series,
  xLabel,
  yLabel,
  sizeLabel,
  bubble = false,
  trendline = false,
  includeZero = false,
  height = 300,
  formatX = formatCompact,
  formatY = formatCompact,
  formatSize = formatCompact,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<ScatterChartProps>) {
  const t = { ...defaultScatterChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const { fade, exit } = chartFades(reduced);
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const folded = useMemo(() => foldScatterSeries(series, t.other), [series, t.other]);
  const all = folded.flatMap((s) => s.data.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  const mounted = useHasMounted(width > 0 && all.length > 0);
  const [active, setActive] = useState<string | null>(null);
  const input = useInputSource();
  const dataChanged = useDataChanged(
    folded.map((s) => s.data.map((p) => `${p.x},${p.y},${p.size ?? ""}`).join(";")).join("|"),
  );

  const xName = xLabel ?? t.x;
  const yName = yLabel ?? t.y;
  const sName = sizeLabel ?? t.size;

  /** The readout for one point: its name (and series), then y, x and size. */
  const readoutFor = (si: number, p: ScatterPoint): Readout => {
    const s = folded[si];
    return {
      title: [p.label, folded.length > 1 || !p.label ? s?.label : undefined].filter(Boolean).join(" · "),
      rows: [
        { label: yName, value: formatY(p.y), color: s?.color ?? "transparent", kind: "rect" },
        { label: xName, value: formatX(p.x), color: "transparent" },
        ...(bubble && p.size !== undefined ? [{ label: sName, value: formatSize(p.size), color: "transparent" }] : []),
      ],
    };
  };

  // Narrow charts on touch screens: the readout docks in a band above the plot.
  const docked = useDockedReadout(width);
  const dock = docked
    ? dockSpace(
        width,
        folded.flatMap((s, si) => s.data.map((p) => readoutFor(si, p))),
      )
    : 0;

  // Y first: its tick labels decide the left margin, which decides the plot width.
  const [ylo, yhi] = extent(all.map((p) => p.y));
  const [xlo, xhi] = extent(all.map((p) => p.x));
  const yFmt = axisFormat(formatY);
  const xFmt = axisFormat(formatX);
  const top0 = 10 + dock + (yLabel ? 22 : 0);
  const bottom = 26 + (xLabel ? 20 : 0);
  const innerH = Math.max(0, height - top0 - bottom);
  const yTicks = fitTicks(includeZero ? Math.min(0, ylo) : ylo, includeZero ? Math.max(0, yhi) : yhi, {
    length: innerH,
    axis: "y",
    format: yFmt,
  });
  const widestY = yTicks.reduce((n, tk) => Math.max(n, yFmt(tk).length), 0);
  const M = { top: top0, bottom, left: clamp(Math.ceil(widestY * CHAR_W) + 16, 32, 80), right: 16 };
  const innerW = Math.max(0, width - M.left - M.right);
  const xTicks = fitTicks(includeZero ? Math.min(0, xlo) : xlo, includeZero ? Math.max(0, xhi) : xhi, {
    length: innerW,
    axis: "x",
    format: xFmt,
    labelEvery: 2,
  });

  // Bubbles are sized by area; the biggest gets maxR. The ticks' range is inset by it, so a
  // bubble on the outermost tick still sits inside the plot, clear of the tick labels.
  const sizes = bubble ? all.map((p) => p.size ?? NaN).filter((v) => Number.isFinite(v) && v > 0) : [];
  const [minSize, maxSize] = sizes.length > 0 ? extent(sizes) : [0, 0];
  const maxR = bubble ? clamp(Math.min(innerW, innerH) / 12, 10, 28) : DOT_R;
  const radius = (p: ScatterPoint) =>
    bubble && maxSize > 0 && Number.isFinite(p.size)
      ? Math.max(MIN_R, Math.sqrt(Math.max(0, p.size ?? 0) / maxSize) * maxR)
      : bubble
        ? MIN_R
        : DOT_R;
  const inset = Math.ceil(maxR) + 4;
  const x = linear(xTicks[0] ?? 0, xTicks[xTicks.length - 1] ?? 0, inset, Math.max(inset, innerW - inset));
  const y = linear(yTicks[0] ?? 0, yTicks[yTicks.length - 1] ?? 0, Math.max(inset, innerH - inset), inset);

  const dots: Dot[] = [];
  folded.forEach((s, si) => {
    const seen = new Map<string, number>();
    s.data.forEach((p, pi) => {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
      const base = p.id ?? p.label ?? String(pi);
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      dots.push({
        key: `${si}\u0000${base}\u0000${n}`,
        si,
        point: p,
        px: x(p.x),
        py: y(p.y),
        r: radius(p),
        color: s.color,
      });
    });
  });
  // Big bubbles behind small ones, so every point stays visible and reachable.
  const drawOrder = [...dots].sort((a, b) => b.r - a.r);
  // Keyboard order: left/right walk the points by x, up/down by y.
  const byX = [...dots].sort((a, b) => a.point.x - b.point.x || a.point.y - b.point.y).map((d) => d.key);
  const byY = [...dots].sort((a, b) => a.point.y - b.point.y || a.point.x - b.point.x).map((d) => d.key);

  // The grid spans exactly the tick range; trend lines are clipped to it so they never cross an axis.
  const gridX0 = x(xTicks[0] ?? 0);
  const gridX1 = x(xTicks[xTicks.length - 1] ?? 0);
  const gridY0 = y(yTicks[yTicks.length - 1] ?? 0);
  const gridY1 = y(yTicks[0] ?? 0);

  const trends = trendline
    ? folded.map((s) => {
        const fit = s.other ? null : linearRegression(s.data);
        if (!fit) return null;
        const [a, b] = extent(s.data.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)).map((p) => p.x));
        const seg = clipSegment(
          x(a),
          y(fit.slope * a + fit.intercept),
          x(b),
          y(fit.slope * b + fit.intercept),
          gridX0,
          gridY0,
          gridX1,
          gridY1,
        );
        return seg ? { fit, ...seg, color: s.color, label: s.label } : null;
      })
    : [];

  if (dots.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null ? dots.find((d) => d.key === active) : undefined;

  // Pointer: the nearest point wins (a Voronoi-style hit test), measured to the circle's edge,
  // within a generous reach, so a small dot never needs a pixel-perfect aim.
  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const reach = event.pointerType === "mouse" ? 28 : 40;
    let best: Dot | undefined;
    let bestD = Infinity;
    for (const d of dots) {
      const dist = Math.max(0, Math.hypot(d.px - mx, d.py - my) - d.r);
      if (dist < bestD || (dist === bestD && best && d.r < best.r)) {
        best = d;
        bestD = dist;
      }
    }
    input.fromPointer();
    setActive(best && bestD <= reach ? best.key : null);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const step = (order: string[], delta: number) => {
      const at = act ? order.indexOf(act.key) : -1;
      const next = at < 0 ? (delta > 0 ? 0 : order.length - 1) : clamp(at + delta, 0, order.length - 1);
      return order[next] ?? null;
    };
    let next: string | null | undefined;
    if (event.key === "ArrowRight") next = step(byX, 1);
    else if (event.key === "ArrowLeft") next = step(byX, -1);
    else if (event.key === "ArrowUp") next = step(byY, 1);
    else if (event.key === "ArrowDown") next = step(byY, -1);
    else if (event.key === "Home") next = byX[0] ?? null;
    else if (event.key === "End") next = byX[byX.length - 1] ?? null;
    else if (event.key === "Escape" && act) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next);
  }

  const readout = act ? readoutFor(act.si, act.point) : null;

  const move = reduced || !dataChanged ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  // Entrance: points pop in sweeping left to right; later data changes glide.
  const pop = (d: Dot) =>
    reduced
      ? { duration: 0 }
      : !mounted
        ? { duration: duration.slow, ease: enterEase, delay: (d.px / Math.max(1, innerW)) * 0.45 }
        : { duration: duration.base, ease: enterEase };
  const trendDelay = reduced || mounted ? 0 : 0.55;
  const xTickGap = xTicks.length > 1 ? Math.abs(x(xTicks[1] ?? 0) - x(xTicks[0] ?? 0)) : Infinity;
  const widestX = xTicks.reduce((n, tk) => Math.max(n, xFmt(tk).length), 0) * CHAR_W;
  const xEvery = Math.max(1, Math.ceil((widestX + 10) / Math.max(1, xTickGap)));
  const summary = trends
    .filter((tr) => tr !== null)
    .map((tr) => t.trendSummary(tr.label, formatSlope(tr.fit.slope), tr.fit.r2.toFixed(2), tr.fit))
    .join(" ");

  // Bubble charts get a size key: the smallest and largest size, drawn at their real radius.
  const keySizes = bubble && maxSize > 0 ? (minSize < maxSize ? [minSize, maxSize] : [maxSize]) : [];

  return (
    <div {...rest} ref={outerRef} className={cn("flex w-full flex-col gap-2", className)}>
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={height}
            label={ariaLabel}
            description={`${summary ? `${summary} ` : ""}${resolveInstructions(t.instructions)}`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {yLabel && (
                <text x={-M.left + 2} y={-12} className="fill-sheen-fg-muted text-2xs font-medium">
                  {yLabel}
                </text>
              )}
              {xLabel && (
                <text
                  x={(gridX0 + gridX1) / 2}
                  y={innerH + 36}
                  textAnchor="middle"
                  className="fill-sheen-fg-muted text-2xs font-medium"
                >
                  {xLabel}
                </text>
              )}

              <AnimatePresence initial={false}>
                {yTicks.map((tk) => (
                  <motion.g
                    key={`y-${tk}`}
                    initial={{ opacity: 0, y: y(tk) }}
                    animate={{ opacity: 1, y: y(tk) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ y: move, opacity: fade(duration.base) }}
                  >
                    {/* Gridlines run the full plot (through the bubble inset), so labels outside it stay tied to them. */}
                    <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                    <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                      {yFmt(tk)}
                    </text>
                  </motion.g>
                ))}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {xTicks.map((tk, ti) => (
                  <motion.g
                    key={`x-${tk}`}
                    initial={{ opacity: 0, x: x(tk) }}
                    animate={{ opacity: 1, x: x(tk) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, opacity: fade(duration.base) }}
                  >
                    <line y2={innerH} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                    {ti % xEvery === 0 && (
                      <text y={innerH + 16} textAnchor="middle" className="fill-sheen-fg-muted text-2xs tabular-nums">
                        {xFmt(tk)}
                      </text>
                    )}
                  </motion.g>
                ))}
              </AnimatePresence>

              {/* Drop lines from the active point to both axes. */}
              {act && (
                <g pointerEvents="none" stroke="var(--sheen-fg-subtle)" strokeWidth={1}>
                  <line x1={act.px} x2={act.px} y1={act.py + act.r + 2} y2={innerH} />
                  <line x1={0} x2={Math.max(0, act.px - act.r - 2)} y1={act.py} y2={act.py} />
                </g>
              )}

              <g className="forced-color-adjust-none">
                {trends.map((tr, i) =>
                  tr ? (
                    <motion.line
                      key={`trend-${i}`}
                      stroke={tr.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray="1 5"
                      initial={{ opacity: 0, x1: tr.x1, y1: tr.y1, x2: tr.x2, y2: tr.y2 }}
                      animate={{ opacity: act ? 0.35 : 0.9, x1: tr.x1, y1: tr.y1, x2: tr.x2, y2: tr.y2 }}
                      transition={{ opacity: fade(duration.slow, trendDelay), x1: move, y1: move, x2: move, y2: move }}
                    />
                  ) : null,
                )}

                {/* Points: each carries a 2px surface ring so overlaps stay legible. */}
                <AnimatePresence>
                  {drawOrder.map((d) => {
                    const on = act?.key === d.key;
                    return (
                      <motion.circle
                        key={d.key}
                        cx={0}
                        cy={0}
                        fill={d.color}
                        fillOpacity={bubble ? 0.78 : 1}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                        initial={
                          reduced
                            ? { x: d.px, y: d.py, r: d.r, scale: 1, opacity: 1 }
                            : { x: d.px, y: d.py, r: d.r, scale: 0, opacity: 0 }
                        }
                        animate={{ x: d.px, y: d.py, r: d.r, scale: 1, opacity: act && !on ? 0.3 : 1 }}
                        exit={{ opacity: 0, scale: 0.6, transition: exit }}
                        transition={{
                          x: move,
                          y: move,
                          r: move,
                          scale: pop(d),
                          opacity: act ? fade(duration.fast) : pop(d),
                        }}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* The active point: redrawn on top with a ring in its own colour. */}
                {act && (
                  <g pointerEvents="none">
                    <circle
                      cx={act.px}
                      cy={act.py}
                      r={act.r}
                      fill={act.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                    />
                    <circle cx={act.px} cy={act.py} r={act.r + 3.5} fill="none" stroke={act.color} strokeWidth={2} />
                  </g>
                )}
              </g>

              {/* Hit layer: the whole plot finds the nearest point. Touch drags still scroll the page. */}
              <rect
                x={-8}
                y={-8}
                width={innerW + 16}
                height={innerH + 16}
                fill="transparent"
                style={{ touchAction: "pan-y pinch-zoom" }}
                onPointerDown={onPointer}
                onPointerMove={onPointer}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              />
            </g>
          </ChartFigure>
        )}

        {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
        {act && (
          <FittedTooltip
            title={readout?.title ?? ""}
            rows={readout?.rows ?? []}
            x={M.left + act.px}
            reach={act.r + 4}
            y={M.top + act.py}
            containerWidth={width}
            docked={docked}
          />
        )}
        <ChartAnnouncer
          text={input.announce(
            readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : "",
          )}
        />
      </div>
      {keySizes.length > 0 && width > 0 && (
        <p
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sheen-fg-muted"
          style={{ paddingLeft: M.left }}
        >
          <span>{sName}</span>
          {keySizes.map((v) => {
            const r = radius({ x: 0, y: 0, size: v });
            return (
              <span key={v} className="inline-flex items-center gap-1.5">
                <svg aria-hidden width={2 * r + 2} height={2 * r + 2} className="shrink-0 forced-color-adjust-none">
                  <circle
                    cx={r + 1}
                    cy={r + 1}
                    r={r}
                    fill="var(--sheen-hover)"
                    stroke="var(--sheen-fg-subtle)"
                    strokeWidth={1.5}
                  />
                </svg>
                <span className="font-medium text-sheen-fg tabular-nums">{formatSize(v)}</span>
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of ScatterTable, the table view of the chart: the chart's data and formatting props plus
 * a hidden `caption` for screen readers.
 */
export type ScatterTableProps = Pick<
  ScatterChartProps,
  "series" | "xLabel" | "yLabel" | "sizeLabel" | "bubble" | "formatX" | "formatY" | "formatSize" | "labels"
> & {
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  className?: string;
};

/**
 * The table view of a scatter chart: one row per point, grouped by series (with the same "Other" fold).
 *
 * Takes `series`, `xLabel`, `yLabel`, `sizeLabel`, `bubble`, the three formatters and `labels` from ScatterChart, plus `caption` (hidden, names the table) and `className`. A real table with one row per point; it scrolls in a region that is focusable only when it overflows. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { ScatterTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ScatterTable series={[{ label: "Accounts", data: [{ x: 12, y: 340 }, { x: 30, y: 910 }] }]} xLabel="Sessions" yLabel="Revenue" caption="Sessions against revenue" />
 *   );
 * }
 * ```
 *
 * @see /charts/scatter-plot
 */
export function ScatterTable({
  series,
  xLabel,
  yLabel,
  sizeLabel,
  bubble = false,
  formatX = formatCompact,
  formatY = formatCompact,
  formatSize = formatCompact,
  labels,
  caption,
  className,
}: ScatterTableProps) {
  const t = { ...defaultScatterChartLabels, ...labels };
  const folded = foldScatterSeries(series, t.other);
  const rows = folded.flatMap((s) => s.data.map((p) => ({ s, p })));
  const showSeries = folded.length > 1;
  const showNames = rows.some((r) => r.p.label);
  const cols = 2 + (showSeries ? 1 : 0) + (showNames ? 1 : 0) + (bubble ? 1 : 0);
  return (
    <TableScroll label={caption ?? `${yLabel ?? t.y} / ${xLabel ?? t.x}`} className={className}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            {showSeries && (
              <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 font-medium">
                {t.series}
              </th>
            )}
            {showNames && (
              <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 font-medium">
                {t.point}
              </th>
            )}
            <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 text-end font-medium">
              {xLabel ?? t.x}
            </th>
            <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 text-end font-medium">
              {yLabel ?? t.y}
            </th>
            {bubble && (
              <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 text-end font-medium">
                {sizeLabel ?? t.size}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols} className="py-6 text-center text-sheen-fg-muted">
                {t.noData}
              </td>
            </tr>
          ) : (
            rows.map(({ s, p }, i) => (
              <tr key={i} className="border-b border-sheen-border last:border-0">
                {showSeries && (
                  <td className="py-2 pe-3 sm:pe-4 last:pe-0 whitespace-nowrap text-sheen-fg-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <LegendKey color={s.color} />
                      {s.label}
                    </span>
                  </td>
                )}
                {showNames && (
                  <th scope="row" className="py-2 pe-3 sm:pe-4 last:pe-0 font-normal">
                    {p.label ?? "–"}
                  </th>
                )}
                <td className="py-2 pe-3 sm:pe-4 last:pe-0 text-end tabular-nums">{formatX(p.x)}</td>
                <td className="py-2 pe-3 sm:pe-4 last:pe-0 text-end tabular-nums">{formatY(p.y)}</td>
                {bubble && (
                  <td className="py-2 pe-3 sm:pe-4 last:pe-0 text-end tabular-nums">
                    {p.size === undefined ? "–" : formatSize(p.size)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}
