"use client";

import type { ComponentProps } from "react";
import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";

import { cn } from "../lib/cn";
import { useSyncRef } from "../hooks/use-latest";
import { duration, ease } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { ChartAnnotationsLayer, annotationValues, eventsAt, type ChartAnnotation } from "./chart-annotations";
import { ChartBrush, clampBrushRange, type ChartBrushLabels, type ChartBrushRange } from "./chart-brush";
import { markerPath, resolvePatterns } from "./chart-patterns";
import {
  ChartAnnouncer,
  ChartEmpty,
  ChartTooltip,
  useChartSeriesVisibility,
  type TooltipRow,
  type TooltipSurface,
} from "./chart-parts";
import { useChartSync } from "./chart-sync";
import {
  areaPath,
  axisFormat,
  budgetDelay,
  changeEase,
  chartFocusClass,
  chartGlow,
  chartKeyHandler,
  clamp,
  compactFormat,
  localeTickFormat,
  dataSignature,
  enterEase,
  extent,
  exitTransition,
  followPointer,
  indexOfKey,
  linear,
  linePath,
  niceTicks,
  num,
  rowKeys,
  seriesColor,
  slideShift,
  thinLabels,
  tooltipDockSpace,
  useChartFrame,
  useCommitted,
  useDataChanged,
  useElementInView,
  useHasMounted,
  type ChartCurve,
  type ChartRow,
  type CompareSeries,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** Legend key that hides / shows every previous-period (comparison) line at once. */
export const PREVIOUS_SERIES_KEY = "__previous";

/**
 * Every string LineChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type LineChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Name of a previous-period value, e.g. "Organic (previous)". */
  previous: (label: string) => string;
  /** Brush (range selector) text. */
  brush: Partial<ChartBrushLabels>;
};

/**
 * The built-in English strings of LineChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultLineChartLabels: LineChartLabels = {
  instructions: "Use left and right arrow keys to read values.",
  previous: (label) => `${label} (previous)`,
  brush: {},
};

/**
 * Options of the range selector under a LineChart: the initial or controlled range and its change
 * handler.
 */
export type LineChartBrush = {
  /** Rows shown at first, inclusive [start, end]. Default: everything. */
  defaultRange?: ChartBrushRange;
  /** Controlled range. */
  range?: ChartBrushRange;
  onRangeChange?: (range: ChartBrushRange) => void;
  /** Fewest rows the window can show. Default 3. */
  minSpan?: number;
  /** Brush height in px. Default 44. */
  height?: number;
  /** True while the window is being dragged (e.g. hold back expensive updates elsewhere until release). */
  onScrubChange?: (scrubbing: boolean) => void;
};

/**
 * Props of LineChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type LineChartProps = {
  /** One object per point: the `index` key plus one number per series key, e.g. { month: "Jan", visits: 4200 }. */
  data: readonly ChartRow[];
  /** Key of the x-axis value in each row (e.g. "month"). */
  index: string;
  /**
   * The lines. `color` is a palette slot 1–8. Give a series a `compareKey` to draw its previous
   * period from that key of each row as a dashed, muted line.
   */
  series: readonly CompareSeries[];
  /** Fill the area under each line with a gradient that fades to transparent. */
  area?: boolean;
  /** Height of the chart in px; the width follows the container. Default 260. */
  height?: number;
  /**
   * Format values in the tooltip, labels and on the axis. Without it, values use
   * formatCompact (or the locale's compact format) and axis ticks get exactly as many decimals
   * as their step needs.
   */
  format?: (n: number) => string;
  /** Locale for the default number format (e.g. "de"). */
  locale?: string;
  /** Label the end of each line (only when labels don't collide; the legend always carries identity). */
  endLabels?: boolean;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** "monotone" (default): smooth curves that never overshoot a value. "linear": straight segments. */
  curve?: ChartCurve;
  /** Area fill fades from the line to transparent (default). false: a flat soft wash. */
  gradient?: boolean;
  /**
   * Keep zero on the value axis (default). false fits the axis to the data, for values that
   * live far from zero (rates, prices, temperatures). Areas then fill to the bottom of the plot.
   */
  zero?: boolean;
  /** Soft glow on the active line and point in dark mode. Default true. */
  glow?: boolean;
  /**
   * Tell series apart without colour: each series gets its own marker shape (circle, square, triangle, diamond).
   * Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. */
  hiddenSeries?: readonly string[];
  /** Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. */
  highlightedSeries?: string | null;
  /** Reference lines and bands, event markers and ranges. */
  annotations?: readonly ChartAnnotation[];
  /** A range selector under the chart for long series (drag, keyboard, touch). */
  brush?: boolean | LineChartBrush;
  /** Inside a ChartSyncProvider: share the crosshair with the other charts. Default true. */
  sync?: boolean;
  /**
   * Streaming data: when the rows slide by (oldest out, newest in), the lines slide left
   * instead of morphing. Pair with useLiveData(). `duration` = seconds per slide (default 0.6).
   */
  live?: boolean | { duration?: number };
  /** Tooltip surface: "glass" (default) or "opaque" for busy charts. */
  tooltipSurface?: TooltipSurface;
  /** The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<LineChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const MARGIN = { top: 12, bottom: 28, left: 48 };
const BRUSH_GAP = 12;

/**
 * A multi-series line chart for trends over time or any ordered axis, with optional area wash, previous-period lines, annotations, a range brush and live (sliding) data. Use it for the main trend on a page.
 *
 * Keyboard: Tab focuses the chart; Left/Right (Up/Down) arrows move the reading one point, Home and End jump to the first and last, Escape clears it. With `brush`, the range slider below is its own tab stop (arrows, Page Up/Down, Home/End).
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the point and its values. Use `ChartCard table` for the table view. For `live` data give users a pause control (see `useLiveData`).
 * Glass and motion: lines draw in once when first seen, tween on data change and slide for live data; reduced motion makes all of it instant. Only the glass-3 tooltip uses backdrop blur. Inside a `ChartSyncProvider` the crosshair is shared with sibling charts.
 *
 * @example
 * ```tsx
 * import { LineChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LineChart
 *       data={[
 *         { month: "Jan", visits: 4200, signups: 310 },
 *         { month: "Feb", visits: 5100, signups: 420 },
 *         { month: "Mar", visits: 4800, signups: 390 },
 *       ]}
 *       index="month"
 *       series={[
 *         { key: "visits", label: "Visits" },
 *         { key: "signups", label: "Signups" },
 *       ]}
 *       aria-label="Visits and signups per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/line-chart
 */
export function LineChart({
  data: allData,
  index,
  series,
  area = false,
  height = 260,
  format: formatProp,
  locale,
  endLabels = true,
  emptyState,
  curve = "monotone",
  gradient = true,
  zero = true,
  glow = true,
  patterns,
  hiddenSeries,
  highlightedSeries,
  annotations,
  brush,
  sync: syncEnabled = true,
  live,
  tooltipSurface,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<LineChartProps>) {
  const t = { ...defaultLineChartLabels, ...labels };
  const format = useMemo(() => formatProp ?? compactFormat(locale), [formatProp, locale]);
  const tickFormat = useMemo(
    () => (formatProp ? axisFormat(formatProp) : localeTickFormat(locale)),
    [formatProp, locale],
  );
  const id = useId();
  const reduced = useSheenReducedMotion();
  const { ref, element, width } = useChartFrame<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const seen = useElementInView(element, { once: true, amount: 0.2 }) || reduced;
  const [active, setActiveState] = useState<number | null>(null);
  const sync = useChartSync(syncEnabled);
  const visibility = useChartSeriesVisibility({ hiddenSeries, highlightedSeries });

  /* ---------- Brush: which rows are on screen ---------- */
  const brushOpts: LineChartBrush | null = brush ? (brush === true ? {} : brush) : null;
  const minSpan = brushOpts?.minSpan ?? 3;
  const [innerRange, setInnerRange] = useState<ChartBrushRange>(
    () => brushOpts?.defaultRange ?? [0, Math.max(0, allData.length - 1)],
  );
  const [scrubbing, setScrubbing] = useState(false);
  const range = brushOpts ? clampBrushRange(brushOpts.range ?? innerRange, allData.length, minSpan) : null;
  // Stable callbacks (read the latest options through a ref), so the memoised brush doesn't
  // re-render on every pointer move of the chart above it.
  const brushLive = useRef(brushOpts);
  useSyncRef(brushLive, brushOpts);
  const [setRange] = useState(() => (r: ChartBrushRange) => {
    const opts = brushLive.current;
    if (!opts?.range) setInnerRange(r);
    opts?.onRangeChange?.(r);
  });
  const [onScrub] = useState(() => (on: boolean) => {
    setScrubbing(on);
    brushLive.current?.onScrubChange?.(on);
  });
  const brushed = range !== null;
  const r0 = range?.[0] ?? 0;
  const r1 = range?.[1] ?? allData.length - 1;
  const brushRange = useMemo<ChartBrushRange>(() => [r0, r1], [r0, r1]);
  const brushLabelOf = useCallback((i: number) => String(allData[i]?.[index] ?? ""), [allData, index]);
  const data = useMemo(() => (brushed ? allData.slice(r0, r1 + 1) : allData), [allData, brushed, r0, r1]);
  const brushH = brushOpts && allData.length > 2 ? (brushOpts.height ?? 44) : 0;

  /* ---------- Series ---------- */
  const hiddenSet = visibility.hidden;
  const showPrevious = !hiddenSet.has(PREVIOUS_SERIES_KEY);
  const visible = useMemo(
    () => series.map((s, si) => ({ s, si, color: seriesColor(s, si) })).filter(({ s }) => !hiddenSet.has(s.key)),
    [series, hiddenSet],
  );
  const hatched = resolvePatterns(patterns, series.length);
  const highlighted =
    visibility.highlighted && visible.some((v) => v.s.key === visibility.highlighted) ? visibility.highlighted : null;

  // Narrow charts (phones): the readout docks in a band above the plot, clear of the finger.
  const docked = useDockedReadout(width);
  const previousLabel = labels?.previous ?? defaultLineChartLabels.previous;
  const dock = useMemo(
    () =>
      docked
        ? tooltipDockSpace(
            width,
            data,
            index,
            visible.flatMap(({ s }) => [
              { label: s.label, values: data.map((row) => format(num(row[s.key]))) },
              ...(s.compareKey && showPrevious
                ? [{ label: previousLabel(s.label), values: data.map((row) => format(num(row[s.compareKey ?? ""]))) }]
                : []),
            ]),
            // Event notes are read out with their point: reserve their line too.
            (annotations ?? []).flatMap((a) => (a.type === "event" ? [a.label] : [])),
          )
        : 0,
    [docked, width, data, index, visible, showPrevious, format, previousLabel, annotations],
  );
  const M = { ...MARGIN, top: MARGIN.top + dock };
  // End labels cost ~76px of plot: on narrow screens the legend carries identity instead.
  const showEndLabels = endLabels && visible.length > 1 && visible.length <= 4 && width >= 440 && !live;
  const right = showEndLabels ? 76 : 16;
  const innerW = Math.max(0, width - M.left - right);
  const innerH = Math.max(0, height - M.top - MARGIN.bottom);

  // Identity of the x-axis (which categories are shown). A new identity (e.g. a new time range)
  // crossfades the lines and re-draws them; the same identity with new values morphs them.
  // Brushed and live charts keep their lines (they scrub / slide instead).
  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const stable = Boolean(brushOpts) || Boolean(live);
  const version = stable ? "stable" : keys.join("\u0001");
  const hiddenSig = [...hiddenSet].sort().join(",");
  const signature = useMemo(() => dataSignature(data, [index, ...series.map((s) => s.key)]), [data, index, series]);
  const dataChanged = useDataChanged(`${signature}|${hiddenSig}|${r0}-${r1}`);
  const mounted = useHasMounted(seen && width > 0 && data.length > 0);

  // Live: how many rows slid in since the last render.
  const prevKeys = useCommitted(keys);
  const shift = live ? slideShift(prevKeys, keys) : 0;

  const { ticks, x, y, baseline } = useMemo(() => {
    const values: number[] = [];
    for (const row of data) {
      for (const s of series) {
        if (hiddenSet.has(s.key)) continue;
        values.push(num(row[s.key]));
        if (s.compareKey && showPrevious && row[s.compareKey] !== undefined) values.push(num(row[s.compareKey]));
      }
    }
    values.push(...annotationValues(annotations));
    const [min, max] = extent(values);
    // Zero is on the axis by default, so areas fill to a real baseline (above it for negative data).
    // Without it, a little headroom keeps the line off the plot's edges.
    const pad = zero ? 0 : (max - min || Math.abs(max) || 1) * 0.08;
    const ticks = zero ? niceTicks(Math.min(0, min), Math.max(0, max), 4) : niceTicks(min - pad, max + pad, 4);
    const lo = ticks[0] ?? 0;
    const hi = ticks[ticks.length - 1] ?? 0;
    const y = linear(lo, hi, innerH, 0);
    return {
      ticks,
      x: (i: number) => (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: (v: number) => clamp(y(v), 0, innerH),
      baseline: clamp(y(clamp(0, lo, hi)), 0, innerH),
    };
  }, [data, series, hiddenSet, showPrevious, annotations, innerW, innerH, zero]);

  const paths = useMemo(
    () =>
      visible.map(({ s, si, color }) => {
        const values = data.map((row) => num(row[s.key]));
        const points = values.map((v, i) => [x(i), y(v)] as const);
        // Negative-only series: the wash is strongest at the line (bottom) and fades up to zero.
        const negative = values.length > 0 && values.every((v) => v <= 0) && values.some((v) => v < 0);
        let compare: string | null = null;
        if (s.compareKey && showPrevious) {
          const ck = s.compareKey;
          const cp = data.map((row, i) => [x(i), y(num(row[ck]))] as const);
          compare = data.some((row) => row[ck] !== undefined) ? linePath(cp, curve) : null;
        }
        return {
          s,
          si,
          color,
          points,
          line: linePath(points, curve),
          fill: areaPath(points, baseline, curve),
          negative,
          compare,
        };
      }),
    [visible, data, x, y, baseline, curve, showPrevious],
  );

  // X labels: thinned so they never collide.
  const shownLabels = useMemo(
    () =>
      thinLabels(
        data.map((row) => String(row[index] ?? "")),
        data.length > 1 ? innerW / (data.length - 1) : innerW,
      ),
    [data, index, innerW],
  );

  /* ---------- Active point (pointer, keyboard, or another synced chart) ---------- */
  const act = active !== null && active < data.length ? active : null;
  const external = act === null ? indexOfKey(data, index, sync.external) : -1;
  const shown = act ?? (external >= 0 ? external : null);
  function setActive(i: number | null) {
    setActiveState(i);
    sync.publish(i === null ? null : String(data[i]?.[index] ?? ""));
  }

  // Crosshair x glides on the pointer spring; it appears in place (no fly-in from 0).
  const crossTarget = useMotionValue(0);
  const crossX = useSpring(crossTarget, followPointer);
  const wasShown = useRef(false);
  useLayoutEffect(() => {
    if (shown === null) {
      wasShown.current = false;
      return;
    }
    const px = x(shown);
    if (!wasShown.current || reduced) {
      crossTarget.jump(px);
      crossX.jump(px);
    } else crossTarget.set(px);
    wasShown.current = true;
  }, [shown, x, reduced, crossTarget, crossX]);

  // Live slide: the series group starts `shift` steps to the right, then slides home.
  const slide = useMotionValue(0);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const liveDuration = typeof live === "object" ? (live.duration ?? 0.6) : 0.6;
  useLayoutEffect(() => {
    if (!shift || reduced || !step) return;
    slide.jump(shift * step);
    const controls = animate(slide, 0, { duration: liveDuration, ease: ease.out });
    return () => controls.stop();
  }, [keys, shift, reduced, step, liveDuration, slide]);

  // Brush miniature values: the first visible series over all rows (memoised: no re-draw per hover).
  const brushKey = (visible[0] ?? { s: series[0] }).s?.key;
  const brushValues = useMemo(() => (brushKey ? allData.map((row) => num(row[brushKey])) : []), [allData, brushKey]);

  /* ---------- The plot: everything but the crosshair. Memoised, so hovering never re-renders it. ---------- */
  const animateData = !reduced && dataChanged && !scrubbing && shift === 0;
  const single = data.length === 1;
  const plot = useMemo(() => {
    if (width <= 0 || data.length === 0) return null;
    // End labels: only if every pair is at least 14px apart; otherwise rely on the legend.
    const ends = paths.map((p) => p.points[p.points.length - 1]?.[1] ?? 0).sort((a, b) => a - b);
    const labelsFit = ends.every((e, i) => i === 0 || e - (ends[i - 1] ?? 0) >= 14);
    // Choreography: the line draws, THEN its end dot and label fade in where the line arrives.
    const draw = reduced ? 0 : mounted ? duration.slower * 1.15 : duration.slower * 1.2;
    const endDelay = reduced || single ? 0 : draw * 0.8;
    const instant = { duration: 0 };
    const move = animateData ? { duration: duration.slow, ease: changeEase } : instant;
    const labelMove = shift > 0 && !reduced ? { duration: liveDuration, ease: ease.out } : move;
    const dim = (key: string) => (highlighted && highlighted !== key ? 0.22 : 1);
    const glowOn = (key: string) => glow && !reduced && highlighted === key;
    const multi = paths.length > 1;

    return (
      <>
        <defs>
          {paths.map((p) => (
            <linearGradient
              key={p.s.key}
              id={`${id}-fill-${p.s.key}`}
              x1="0"
              x2="0"
              y1={p.negative ? "1" : "0"}
              y2={p.negative ? "0" : "1"}
            >
              {gradient ? (
                <>
                  <stop offset="0%" stopColor={p.color} stopOpacity={multi ? 0.2 : 0.32} />
                  <stop offset="55%" stopColor={p.color} stopOpacity={multi ? 0.06 : 0.1} />
                  <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={p.color} stopOpacity={multi ? 0.1 : 0.16} />
                  <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                </>
              )}
            </linearGradient>
          ))}
          {live && (
            <clipPath id={`${id}-clip`}>
              {/* In the plot's own (translated) coordinates: it clips the series group inside it. */}
              <rect x={-6} y={-12} width={innerW + 12} height={innerH + 24} />
            </clipPath>
          )}
        </defs>

        {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view.
            pointer-events none: the pointer is read by one hit rect, so hit testing skips every mark. */}
        <g aria-hidden pointerEvents="none" transform={`translate(${M.left},${M.top})`}>
          {/* Grid + y ticks: hairline, solid, recessive. Ticks slide when the scale changes. */}
          <AnimatePresence initial={false}>
            {ticks.map((tick) => (
              <motion.g
                key={tick}
                initial={{ opacity: 0, y: y(tick) }}
                animate={{ opacity: 1, y: y(tick) }}
                exit={{ opacity: 0, transition: exitTransition }}
                transition={{ y: move, opacity: { duration: duration.fast } }}
              >
                <line
                  x2={innerW}
                  stroke={tick === 0 && (ticks[0] ?? 0) < 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"}
                  strokeWidth={1}
                />
                <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                  {tickFormat(tick)}
                </text>
              </motion.g>
            ))}
          </AnimatePresence>

          {/* X labels keep their identity across ranges, so shared months glide to their new spot.
              Brushed charts key them by position instead: scrubbing then only swaps their text. */}
          {brushed ? (
            <g>
              {data.map((row, i) =>
                shownLabels.has(i) ? (
                  <text key={i} x={x(i)} y={innerH + 20} textAnchor="middle" className="fill-sheen-fg-muted text-2xs">
                    {row[index]}
                  </text>
                ) : null,
              )}
            </g>
          ) : (
            <AnimatePresence initial={false}>
              {data.map((row, i) => {
                if (!shownLabels.has(i)) return null;
                return (
                  <motion.text
                    key={keys[i]}
                    y={innerH + 20}
                    textAnchor="middle"
                    className="fill-sheen-fg-muted text-2xs"
                    initial={{ opacity: 0, x: x(i) + shift * step }}
                    animate={{ opacity: 1, x: x(i) }}
                    exit={{ opacity: 0, transition: exitTransition }}
                    transition={{ x: labelMove, opacity: { duration: duration.fast } }}
                  >
                    {row[index]}
                  </motion.text>
                );
              })}
            </AnimatePresence>
          )}

          {annotations && annotations.length > 0 && (
            <ChartAnnotationsLayer
              annotations={annotations}
              data={data}
              index={index}
              innerW={innerW}
              innerH={innerH}
              value={y}
              position={x}
              layer="back"
              show={seen}
              delay={reduced ? 0 : draw * 0.6}
              reduced={reduced}
              avoid={paths.map((pp) => pp.points)}
            />
          )}

          <g clipPath={live ? `url(#${id}-clip)` : undefined}>
            <motion.g style={{ x: slide }}>
              {area && (
                <AnimatePresence>
                  {paths.map((p) => (
                    <motion.path
                      key={`a-${p.s.key}-${version}`}
                      fill={`url(#${id}-fill-${p.s.key})`}
                      initial={{ opacity: 0, d: p.fill }}
                      animate={{ opacity: seen ? (highlighted && highlighted !== p.s.key ? 0.25 : 1) : 0, d: p.fill }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{
                        d: move,
                        opacity: mounted
                          ? { duration: duration.fast }
                          : { duration: reduced ? duration.fast : duration.slow, delay: reduced ? 0 : draw * 0.35 },
                      }}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Previous period: dashed and muted, drawn under the current lines. */}
              <AnimatePresence>
                {paths.map((p) =>
                  p.compare ? (
                    <motion.path
                      key={`c-${p.s.key}-${version}`}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      initial={{ opacity: 0, d: p.compare }}
                      animate={{ opacity: seen ? 0.55 * dim(p.s.key) : 0, d: p.compare }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{
                        d: move,
                        opacity: {
                          duration: mounted ? duration.fast : duration.slow,
                          delay: mounted || reduced ? 0 : draw * 0.5,
                        },
                      }}
                    />
                  ) : null,
                )}
              </AnimatePresence>

              <AnimatePresence>
                {paths.map((p, i) => (
                  <motion.path
                    key={`l-${p.s.key}-${version}`}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: glowOn(p.s.key) ? chartGlow(p.color, 5) : undefined }}
                    initial={{ pathLength: reduced ? 1 : 0, opacity: 1, d: p.line }}
                    animate={{ pathLength: seen ? 1 : 0, opacity: dim(p.s.key), d: p.line }}
                    exit={{ opacity: 0, transition: exitTransition }}
                    transition={{
                      pathLength: {
                        duration: draw,
                        ease: enterEase,
                        delay: mounted || reduced ? 0 : budgetDelay(i, paths.length, 0.08),
                      },
                      d: move,
                      opacity: { duration: duration.fast },
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* End dots with a 2px surface ring: they appear as each line arrives. */}
              <AnimatePresence>
                {paths.map((p) => {
                  const last = p.points[p.points.length - 1];
                  const shape = hatched ? markerPath(p.si, 4) : "";
                  return last && shape ? (
                    <motion.path
                      key={`e-${p.s.key}-${version}`}
                      d={shape}
                      fill={p.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      initial={{ opacity: 0, x: last[0], y: last[1] }}
                      animate={{ opacity: seen ? dim(p.s.key) : 0, x: last[0], y: last[1] }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{
                        x: move,
                        y: move,
                        opacity: { duration: duration.fast, delay: mounted ? 0 : endDelay },
                      }}
                    />
                  ) : last ? (
                    <motion.circle
                      key={`e-${p.s.key}-${version}`}
                      r={4}
                      fill={p.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      initial={{ opacity: 0, cx: last[0], cy: last[1] }}
                      animate={{ opacity: seen ? dim(p.s.key) : 0, cx: last[0], cy: last[1] }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{
                        cx: move,
                        cy: move,
                        opacity: { duration: duration.fast, delay: mounted ? 0 : endDelay },
                      }}
                    />
                  ) : null;
                })}
              </AnimatePresence>
            </motion.g>
          </g>

          <AnimatePresence>
            {showEndLabels &&
              labelsFit &&
              paths.map((p) => {
                const last = p.points[p.points.length - 1];
                return last ? (
                  <motion.text
                    key={`t-${p.s.key}-${version}`}
                    dy="0.32em"
                    className="fill-sheen-fg-muted text-2xs"
                    initial={{ opacity: 0, x: last[0] + 10, y: last[1] }}
                    animate={{ opacity: seen ? dim(p.s.key) : 0, x: last[0] + 10, y: last[1] }}
                    exit={{ opacity: 0, transition: exitTransition }}
                    transition={{
                      x: move,
                      y: move,
                      opacity: { duration: duration.fast, delay: mounted ? 0 : endDelay },
                    }}
                  >
                    {p.s.label}
                  </motion.text>
                ) : null;
              })}
          </AnimatePresence>

          {annotations && annotations.length > 0 && (
            <ChartAnnotationsLayer
              annotations={annotations}
              data={data}
              index={index}
              innerW={innerW}
              innerH={innerH}
              value={y}
              position={x}
              layer="front"
              show={seen}
              delay={reduced ? 0 : draw * 0.8}
              reduced={reduced}
              avoid={paths.map((pp) => pp.points)}
            />
          )}
        </g>
      </>
    );
  }, [
    width,
    data,
    paths,
    hatched,
    reduced,
    single,
    liveDuration,
    highlighted,
    glow,
    id,
    gradient,
    live,
    M.left,
    M.top,
    innerW,
    innerH,
    ticks,
    y,
    x,
    tickFormat,
    brushed,
    shownLabels,
    index,
    keys,
    step,
    annotations,
    seen,
    slide,
    area,
    version,
    showEndLabels,
    mounted,
    animateData,
    shift,
  ]);

  if (allData.length === 0 || series.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  function onPointerMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const i = data.length <= 1 ? 0 : Math.round((px / Math.max(1, rect.width)) * (data.length - 1));
    const next = clamp(i, 0, data.length - 1);
    if (next !== act) setActive(next);
  }

  const activeRow = shown !== null ? data[shown] : undefined;
  const tooltipRows: TooltipRow[] = [];
  if (activeRow && act !== null) {
    const main = paths.map((p) => ({ p, raw: num(activeRow[p.s.key]) })).sort((a, b) => b.raw - a.raw);
    for (const { p, raw } of main) {
      tooltipRows.push({ label: p.s.label, value: format(raw), color: p.color });
      if (p.compare && p.s.compareKey && activeRow[p.s.compareKey] !== undefined) {
        tooltipRows.push({
          label: t.previous(p.s.label),
          value: format(num(activeRow[p.s.compareKey])),
          color: p.color,
          dashed: true,
        });
      }
    }
  }
  const notes = act !== null ? eventsAt(annotations, data, index, act).map((e) => e.label) : [];
  const dimDot = (key: string) => (highlighted && highlighted !== key ? 0.22 : 1);
  const totalH = height + (brushH ? brushH + BRUSH_GAP : 0);

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height: totalH }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width}
          height={height}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={chartKeyHandler(data.length, act, setActive)}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
        >
          {plot}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {/* Crosshair: glides between points on the pointer spring. Passive (dashed) when another synced chart is read. */}
            {shown !== null && (
              <motion.g pointerEvents="none" style={{ x: crossX }} data-slot="chart-crosshair">
                <line
                  y2={innerH}
                  stroke={act === null ? "var(--sheen-fg-subtle)" : "var(--sheen-fg-muted)"}
                  strokeWidth={1}
                  strokeDasharray={act === null ? "3 3" : undefined}
                />
                {paths.map((p) => {
                  const pt = p.points[shown];
                  const shape = hatched ? markerPath(p.si, 4.5) : "";
                  return pt && shape ? (
                    <motion.path
                      key={p.s.key}
                      d={shape}
                      fill={p.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      style={{ filter: glow && !reduced ? chartGlow(p.color, 4) : undefined }}
                      initial={false}
                      animate={{ y: pt[1], opacity: dimDot(p.s.key) }}
                      transition={
                        reduced ? { duration: 0 } : { y: followPointer, opacity: { duration: duration.fast } }
                      }
                    />
                  ) : pt ? (
                    <motion.circle
                      key={p.s.key}
                      cx={0}
                      r={4.5}
                      fill={p.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      style={{ filter: glow && !reduced ? chartGlow(p.color, 4) : undefined }}
                      initial={false}
                      animate={{ cy: pt[1], opacity: dimDot(p.s.key) }}
                      transition={
                        reduced ? { duration: 0 } : { cy: followPointer, opacity: { duration: duration.fast } }
                      }
                    />
                  ) : null;
                })}
              </motion.g>
            )}

            {/* Hit area: the whole plot, so the pointer only needs to be near a date. Horizontal drags scrub on touch. */}
            <rect
              width={innerW}
              height={innerH}
              fill="transparent"
              style={{ touchAction: "pan-y pinch-zoom" }}
              onPointerDown={onPointerMove}
              onPointerMove={onPointerMove}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </g>
        </ChartFigure>
      )}

      {brushOpts && brushH > 0 && width > 0 && (
        <div className="absolute inset-x-0 bottom-0" style={{ paddingLeft: M.left, paddingRight: right }}>
          <ChartBrush
            count={allData.length}
            labelOf={brushLabelOf}
            values={brushValues}
            range={brushRange}
            onRangeChange={setRange}
            onScrubChange={onScrub}
            minSpan={minSpan}
            height={brushH}
            color={visible[0]?.color}
            labels={t.brush}
          />
        </div>
      )}

      {activeRow && act !== null && (
        <ChartTooltip
          title={String(activeRow[index])}
          rows={tooltipRows}
          notes={notes}
          x={M.left + x(act)}
          y={M.top + innerH / 2}
          containerWidth={width}
          docked={docked}
          surface={tooltipSurface}
        />
      )}
      <ChartAnnouncer
        text={
          activeRow && act !== null
            ? `${activeRow[index]}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}${notes.length ? `. ${notes.join(", ")}` : ""}`
            : ""
        }
      />
    </div>
  );
}

/**
 * Line chart with a gradient wash under each line.
 *
 * Takes every LineChart prop except `area`. Keyboard, accessibility and motion are the same as LineChart: Tab focuses the chart, arrow keys read points, Home/End jump, Escape clears; reduced motion makes the draw-in instant.
 *
 * @example
 * ```tsx
 * import { AreaChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AreaChart
 *       data={[
 *         { month: "Jan", users: 120 },
 *         { month: "Feb", users: 180 },
 *         { month: "Mar", users: 150 },
 *       ]}
 *       index="month"
 *       series={[{ key: "users", label: "Active users" }]}
 *       aria-label="Active users per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/area-chart
 */
export function AreaChart(props: Omit<LineChartProps, "area">) {
  return <LineChart {...props} area />;
}

/** Props of {@link AreaChart}. Line chart with a gradient wash under each line. */
export type AreaChartProps = ComponentProps<typeof AreaChart>;
