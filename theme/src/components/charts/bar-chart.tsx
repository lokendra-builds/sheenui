"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useEffect, useId, useMemo, useState, type ReactNode, useRef } from "react";
import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnotationsLayer, annotationValues, eventsAt, type ChartAnnotation } from "./chart-annotations";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
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
  axisFormat,
  barPath,
  changeEase,
  chartFocusClass,
  chartGlow,
  chartKeyHandler,
  clamp,
  compactFormat,
  dataSignature,
  enterEase,
  exitTransition,
  indexOfKey,
  linear,
  localeTickFormat,
  niceTicks,
  num,
  rowKeys,
  seriesColor,
  thinLabels,
  tooltipDockSpace,
  truncate,
  useChartFrame,
  useDataChanged,
  useElementInView,
  useHasMounted,
  type ChartRow,
  type CompareSeries,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** Legend key that hides / shows every previous-period marker at once (same as LineChart's). */
const PREVIOUS_KEY = "__previous";

/**
 * Every string BarChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type BarChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Tooltip row with the stack total. */
  total: string;
  /** Name of a previous-period value, e.g. "Signups (previous)". */
  previous: (label: string) => string;
};

/**
 * The built-in English strings of BarChart; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultBarChartLabels: BarChartLabels = {
  instructions: "Use arrow keys to read values.",
  total: "Total",
  previous: (label) => `${label} (previous)`,
};

/**
 * Props of BarChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BarChartProps = {
  /** One object per category: the `index` key plus one number per series key, e.g. { day: "Mon", orders: 12 }. */
  data: readonly ChartRow[];
  /** Key of each row that names its category (the axis label), e.g. "day". */
  index: string;
  /** The bars. Give a series a `compareKey` to mark its previous period on each bar (unstacked). */
  series: readonly CompareSeries[];
  /** "vertical" = columns rising from the x-axis; "horizontal" = bars from the left (best for long category names). */
  layout?: "vertical" | "horizontal";
  /**
   * Stack series on top of each other instead of side by side. Negative values stack
   * downwards from zero (a diverging stack).
   */
  stacked?: boolean;
  /** Print the value at the end of each bar (single, unstacked series only). */
  showValues?: boolean;
  /** Chart height in px, axes and labels included. Default 260 for columns; bars grow with the number of categories (at least 160). */
  height?: number;
  /** Format values in the tooltip and labels, and on the axis (the default axis format follows the tick step). */
  format?: (n: number) => string;
  /** Locale for the default number format (e.g. "de"). */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell series apart without colour (hatch fills). Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** A soft sheen down each bar (strongest at the value end). Default true. */
  gradient?: boolean;
  /** Soft glow on the bars being read, in dark mode. Default true. */
  glow?: boolean;
  /** Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. */
  hiddenSeries?: readonly string[];
  /** Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. */
  highlightedSeries?: string | null;
  /** Reference lines / bands on the value axis, event markers and ranges on the categories. */
  annotations?: readonly ChartAnnotation[];
  /** Inside a ChartSyncProvider: share the active category with the other charts. Default true. */
  sync?: boolean;
  /** Tooltip surface style: "glass" (default) or "opaque" for busy charts. */
  tooltipSurface?: TooltipSurface;
  /** The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<BarChartLabels>;
  /** Names the chart for assistive tech (required): say what is plotted, e.g. "Orders per day". */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP = 2; // surface gap between touching marks
const MAX_THICKNESS = 24;
const CHAR_W = 6.6; // average glyph width of the 12px category labels

type Mark = {
  key: string;
  seriesKey: string;
  /** Final shape. */
  d: string;
  /** Collapsed onto the zero baseline: where the bar grows from. */
  d0: string;
  color: string;
  /** Gradient id for this bar (unstacked bars only). */
  fill: string;
  category: number;
  /** Hangs below (or left of) zero: it grows from its far edge. */
  negative: boolean;
  label?: { x: number; y: number; text: string; anchor: "start" | "middle" | "end"; below: boolean };
  /** Previous-period marker: a short dashed line across the bar at the previous value. */
  previous?: { x1: number; y1: number; x2: number; y2: number };
};

/**
 * A column or bar chart for comparing values across categories, grouped or stacked, with optional previous-period marks. Use it for "this vs that" over a handful to a few dozen categories.
 *
 * Keyboard: Tab focuses the chart; Left/Right (Up/Down) arrows move the reading one category, Home and End jump to the first and last, Escape clears it.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; moving by keyboard announces the category and its values. Pair it with `ChartCard table={<ChartTable … />}` for the colour-free table view.
 * Glass and motion: bars grow from the baseline the first time the chart scrolls into view and tween on data changes; reduced motion draws them in place. The plot draws no backdrop blur (only the glass-3 tooltip does); colours are the `--sheen-chart-*` tokens.
 *
 * @example
 * ```tsx
 * import { BarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BarChart
 *       data={[
 *         { day: "Mon", orders: 12 },
 *         { day: "Tue", orders: 18 },
 *         { day: "Wed", orders: 9 },
 *       ]}
 *       index="day"
 *       series={[{ key: "orders", label: "Orders" }]}
 *       aria-label="Orders per day"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bar-chart
 */
export function BarChart({
  data,
  index,
  series: allSeries,
  layout = "vertical",
  stacked = false,
  showValues = false,
  height,
  format: formatProp,
  locale,
  emptyState,
  patterns,
  gradient = true,
  glow = true,
  hiddenSeries,
  highlightedSeries,
  annotations,
  sync: syncEnabled = true,
  tooltipSurface,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BarChartProps>) {
  const t = { ...defaultBarChartLabels, ...labels };
  const format = useMemo(() => formatProp ?? compactFormat(locale), [formatProp, locale]);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const { ref, element, width } = useChartFrame<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const seen = useElementInView(element, { once: true, amount: 0.2 }) || reduced;
  const mounted = useHasMounted(seen && width > 0 && data.length > 0);
  const [active, setActiveState] = useState<number | null>(null);
  const sync = useChartSync(syncEnabled);
  const visibility = useChartSeriesVisibility({ hiddenSeries, highlightedSeries });
  const horizontal = layout === "horizontal";
  const tickFormat = useMemo(
    () => (formatProp ? axisFormat(formatProp) : localeTickFormat(locale)),
    [formatProp, locale],
  );
  const showPrevious = !stacked && !visibility.hidden.has(PREVIOUS_KEY);

  // Visible series keep their palette slot (colour by position in the FULL list, never re-ranked).
  const hiddenSet = visibility.hidden;
  const series = useMemo(
    () => allSeries.map((s, si) => ({ s, si, color: seriesColor(s, si) })).filter(({ s }) => !hiddenSet.has(s.key)),
    [allSeries, hiddenSet],
  );
  const hatched = resolvePatterns(patterns, allSeries.length);
  const highlighted =
    visibility.highlighted && series.some((v) => v.s.key === visibility.highlighted) ? visibility.highlighted : null;
  const labelValues = showValues && series.length === 1 && !stacked;

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const hiddenSig = [...hiddenSet].sort().join(",");
  const signature = useMemo(
    () => dataSignature(data, [index, ...allSeries.map((s) => s.key)]),
    [data, index, allSeries],
  );
  const dataChanged = useDataChanged(signature + "|" + hiddenSig);

  // Extent of the data. Stacks sum positives and negatives separately.
  const { lo, hi } = useMemo(() => {
    let lo = 0;
    let hi = 0;
    for (const row of data) {
      if (stacked) {
        let pos = 0;
        let neg = 0;
        for (const { s } of series) {
          const v = num(row[s.key]);
          if (v >= 0) pos += v;
          else neg += v;
        }
        hi = Math.max(hi, pos);
        lo = Math.min(lo, neg);
      } else {
        for (const { s } of series) {
          const v = num(row[s.key]);
          hi = Math.max(hi, v);
          lo = Math.min(lo, v);
          if (s.compareKey && showPrevious && row[s.compareKey] !== undefined) {
            const p = num(row[s.compareKey]);
            hi = Math.max(hi, p);
            lo = Math.min(lo, p);
          }
        }
      }
    }
    for (const v of annotationValues(annotations)) {
      hi = Math.max(hi, v);
      lo = Math.min(lo, v);
    }
    return { lo, hi };
  }, [data, series, stacked, showPrevious, annotations]);
  const hasNegative = lo < 0;

  // Horizontal: the label column grows to fit the longest category (up to 40% of the width).
  const longest = horizontal ? data.reduce((n, row) => Math.max(n, String(row[index] ?? "").length), 0) : 0;
  const labelCol = horizontal ? clamp(Math.ceil(longest * CHAR_W) + 20, 56, Math.max(56, Math.floor(width * 0.4))) : 48;
  const maxChars = Math.max(3, Math.floor((labelCol - 20) / CHAR_W));

  // Narrow charts (phones): the readout docks in a band above the plot, clear of the finger.
  const docked = useDockedReadout(width);
  const dock = docked
    ? tooltipDockSpace(
        width,
        data,
        index,
        [
          ...series.flatMap(({ s }) => [
            { label: s.label, values: data.map((row) => format(num(row[s.key]))) },
            // Previous-period values share the readout: reserve their room too.
            ...(s.compareKey && showPrevious
              ? [
                  {
                    label: t.previous(s.label),
                    values: data.map((row) =>
                      row[s.compareKey ?? ""] === undefined ? "" : format(num(row[s.compareKey ?? ""])),
                    ),
                  },
                ]
              : []),
          ]),
          ...(stacked && series.length > 1
            ? [
                {
                  label: t.total,
                  values: data.map((row) => format(series.reduce((sum, { s }) => sum + num(row[s.key]), 0))),
                },
              ]
            : []),
        ],
        // Event notes are read out with their bar: reserve their line too.
        (annotations ?? []).flatMap((a) => (a.type === "event" ? [a.label] : [])),
      )
    : 0;
  // A height derived from the row count also grows by the dock band, so bars keep their size.
  const h = height ?? (horizontal ? Math.max(160, data.length * 36 + 40) + dock : 260);
  const M = horizontal
    ? { top: 4 + dock, bottom: 24, left: labelCol, right: labelValues ? 52 : 16 }
    : { top: (labelValues ? 22 : 12) + dock, bottom: 28, left: 48, right: 12 };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, h - M.top - M.bottom);
  // Room for value labels past the end of negative bars.
  const negPad = labelValues && hasNegative ? (horizontal ? 48 : 18) : 0;

  // Horizontal value axes get fewer ticks on narrow screens so their labels never collide.
  const tickCount = horizontal ? clamp(Math.floor((innerW - negPad) / 72), 2, 5) : 4;
  const { ticks, scale } = useMemo(() => {
    const ticks = niceTicks(lo, hi, tickCount);
    const t0 = ticks[0] ?? 0;
    const t1 = ticks[ticks.length - 1] ?? 0;
    return { ticks, scale: horizontal ? linear(t0, t1, negPad, innerW) : linear(t0, t1, innerH - negPad, 0) };
  }, [lo, hi, tickCount, horizontal, innerW, innerH, negPad]);
  const zero = scale(0);
  // Last line of defence for horizontal tick labels: skip every other one if they'd still touch.
  const tickGap = ticks.length > 1 ? Math.abs(scale(ticks[1] ?? 0) - scale(ticks[0] ?? 0)) : Infinity;
  const widestTick = ticks.reduce((n, tk) => Math.max(n, tickFormat(tk).length), 0) * CHAR_W;
  const tickLabelEvery = horizontal && tickGap < widestTick + 8 ? 2 : 1;

  const band = (horizontal ? innerH : innerW) / Math.max(1, data.length);
  const groupSize = stacked ? 1 : Math.max(1, series.length);
  const thickness = Math.max(2, Math.min(MAX_THICKNESS, (band * 0.62 - GAP * (groupSize - 1)) / groupSize));
  const groupWidth = thickness * groupSize + GAP * (groupSize - 1);

  const marks = useMemo(() => {
    const marks: Mark[] = [];
    data.forEach((row, ci) => {
      const bandStart = ci * band + (band - groupWidth) / 2;
      // In a stack only the outermost segment on each side of zero gets the rounded end.
      let lastPos = -1;
      let lastNeg = -1;
      series.forEach(({ s }, vi) => {
        const v = num(row[s.key]);
        if (v > 0) lastPos = vi;
        else if (v < 0) lastNeg = vi;
      });
      let pos = 0;
      let neg = 0;
      series.forEach(({ s, si, color }, vi) => {
        const value = num(row[s.key]);
        const positive = value >= 0;
        let from = 0;
        let to = value;
        if (stacked) {
          from = positive ? pos : neg;
          to = from + value;
          if (positive) pos = to;
          else neg = to;
        }
        const isEnd = !stacked || vi === (positive ? lastPos : lastNeg);
        const offset = stacked ? 0 : vi * (thickness + GAP);
        const key = `${keys[ci]}|${s.key}`;
        // Pixel positions of the zero-side (a) and value-side (b) edges, inset for stack gaps.
        let a = scale(from);
        let b = scale(to);
        const dir = Math.sign(b - a) || (horizontal ? 1 : -1);
        if (stacked && from !== 0) a += (dir * GAP) / 2;
        if (stacked && !isEnd) b -= (dir * GAP) / 2;
        const len = Math.max(0, (b - a) * dir);
        const fill = patternFill(
          hatched,
          id,
          si,
          gradient && !stacked
            ? `url(#${id}-g${si}-${horizontal ? (positive ? "r" : "l") : positive ? "t" : "b"})`
            : color,
        );
        const prevRaw = s.compareKey && showPrevious && row[s.compareKey] !== undefined ? num(row[s.compareKey]) : null;
        const prevPx = prevRaw === null ? null : scale(prevRaw);

        if (horizontal) {
          const y0 = bandStart + offset;
          const end = !isEnd ? "none" : positive ? "right" : "left";
          marks.push({
            key,
            seriesKey: s.key,
            d: barPath(dir > 0 ? a : a - len, y0, len, thickness, end),
            d0: barPath(zero, y0, 0, thickness, end),
            color,
            fill,
            category: ci,
            negative: !positive,
            label: labelValues
              ? {
                  x: positive ? b + 8 : b - 8,
                  y: y0 + thickness / 2,
                  text: format(value),
                  anchor: positive ? "start" : "end",
                  below: false,
                }
              : undefined,
            previous: prevPx === null ? undefined : { x1: prevPx, x2: prevPx, y1: y0 - 3, y2: y0 + thickness + 3 },
          });
        } else {
          const x0 = bandStart + offset;
          const end = !isEnd ? "none" : positive ? "top" : "bottom";
          marks.push({
            key,
            seriesKey: s.key,
            d: barPath(x0, dir < 0 ? a - len : a, thickness, len, end),
            d0: barPath(x0, zero, thickness, 0, end),
            color,
            fill,
            category: ci,
            negative: !positive,
            label: labelValues
              ? {
                  x: x0 + thickness / 2,
                  y: positive ? b - 8 : b + 8,
                  text: format(value),
                  anchor: "middle",
                  below: !positive,
                }
              : undefined,
            previous: prevPx === null ? undefined : { x1: x0 - 3, x2: x0 + thickness + 3, y1: prevPx, y2: prevPx },
          });
        }
      });
    });
    return marks;
  }, [
    data,
    series,
    keys,
    scale,
    horizontal,
    stacked,
    band,
    groupWidth,
    thickness,
    zero,
    gradient,
    hatched,
    id,
    showPrevious,
    labelValues,
    format,
  ]);

  /* ---------- Active category (pointer, keyboard, or another synced chart) ---------- */
  const act = active !== null && active < data.length ? active : null;
  const external = act === null ? indexOfKey(data, index, sync.external) : -1;
  const shown = act ?? (external >= 0 ? external : null);
  function setActive(i: number | null) {
    setActiveState(i);
    sync.publish(i === null ? null : String(data[i]?.[index] ?? ""));
  }
  // Hit areas: one per category, larger than the marks. Memoised (through a ref to the latest
  // setActive) so a pointer move doesn't rebuild 40+ rects and their handlers.
  const setActiveRef = useRef(setActive);
  useSyncRef(setActiveRef, setActive);
  const count = data.length;
  const hitAreas = useMemo(
    () =>
      Array.from({ length: count }, (_, ci) => (
        <rect
          key={`hit-${ci}`}
          x={horizontal ? 0 : ci * band}
          y={horizontal ? ci * band : 0}
          width={horizontal ? innerW : band}
          height={horizontal ? band : innerH}
          fill="transparent"
          onPointerEnter={() => setActiveRef.current(ci)}
          onPointerDown={() => setActiveRef.current(ci)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setActiveRef.current(null)}
        />
      )),
    [count, band, horizontal, innerW, innerH],
  );

  // Reading a category dims every bar (one opacity on the whole bar layer, no re-render); the
  // category being read is redrawn on top at full strength. Until the entrance starts, the
  // layer is invisible.
  const barsOpacity = useMotionValue(reduced ? 1 : 0);
  useEffect(() => {
    const to = !seen ? 0 : act !== null ? 0.45 : 1;
    if (reduced) {
      barsOpacity.jump(to);
      return;
    }
    const controls = animate(barsOpacity, to, { duration: duration.fast });
    return () => controls.stop();
  }, [act, seen, reduced, barsOpacity]);

  // The grow-from-baseline entrance runs on the browser's own animation engine (Web Animations:
  // one transform per bar, no JavaScript per frame and nothing to set up per bar), the first
  // time the chart is seen. Later data changes tween the bar shapes with Motion instead.
  const barsGroup = useRef<SVGGElement>(null);
  const grown = useRef(false);
  useEffect(() => {
    if (grown.current || !seen || reduced || width <= 0 || data.length === 0) return;
    const group = barsGroup.current;
    if (!group) return;
    grown.current = true;
    const bars = group.querySelectorAll<SVGPathElement>("path[data-ci]");
    if (typeof group.animate === "function") {
      const easing = `cubic-bezier(${enterEase.join(",")})`;
      bars.forEach((bar) => {
        const ci = Number(bar.dataset.ci);
        const negative = bar.dataset.neg === "1";
        bar.style.transformBox = "fill-box";
        bar.style.transformOrigin = horizontal ? (negative ? "100% 50%" : "0% 50%") : negative ? "50% 0%" : "50% 100%";
        bar.animate([{ transform: horizontal ? "scaleX(0)" : "scaleY(0)" }, { transform: "none" }], {
          duration: duration.slower * 1000,
          delay: Math.min(ci * 40, 400),
          easing,
          fill: "backwards",
        });
      });
    }
    barsOpacity.jump(1);
  }, [seen, reduced, width, data.length, horizontal, barsOpacity]);

  /* ---------- The plot: memoised, so reading values never re-renders the bars ---------- */
  const animateData = !reduced && dataChanged;
  const gradients = gradient && !stacked;
  const shownLabels = useMemo(
    () =>
      horizontal
        ? null
        : thinLabels(
            data.map((row) => String(row[index] ?? "")),
            band,
          ),
    [horizontal, data, index, band],
  );
  const plot = useMemo(() => {
    if (width <= 0 || data.length === 0) return null;
    // Timing: bars tween on data changes and snap on resize (their first-sight growth is the
    // Web Animation above). Labels and markers fade in after the bars have grown.
    const move = animateData ? { duration: duration.slow, ease: changeEase } : { duration: 0 };
    const labelDelay = (ci: number) => (reduced ? 0 : !mounted ? duration.slower * 0.8 + Math.min(ci * 0.04, 0.4) : 0);
    const seriesOpacity = (m: Mark) => (highlighted && highlighted !== m.seriesKey ? 0.25 : 1);

    return (
      <>
        {hatched && <ChartPatternDefs id={id} entries={series.map(({ si, color }) => ({ index: si, color }))} />}
        {gradients && (
          <defs>
            {series.map(({ si, color }) =>
              (horizontal ? (["r", "l"] as const) : (["t", "b"] as const)).map((dir) => (
                <linearGradient
                  key={`${si}-${dir}`}
                  id={`${id}-g${si}-${dir}`}
                  x1={dir === "l" ? "1" : "0"}
                  x2={dir === "r" ? "1" : "0"}
                  y1={dir === "t" ? "1" : "0"}
                  y2={dir === "b" ? "1" : "0"}
                >
                  {/* From the base (softer) to the value end (full strength). */}
                  <stop offset="0%" stopColor={color} stopOpacity={0.72} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              )),
            )}
          </defs>
        )}
        {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view.
            pointer-events none: the pointer is read by the category hit rects, so hit testing skips every bar. */}
        <g aria-hidden pointerEvents="none" transform={`translate(${M.left},${M.top})`}>
          {/* Value grid: slides when the scale changes. Zero gets a firmer line when bars go negative. */}
          <AnimatePresence initial={false}>
            {ticks.map((tick, ti) => {
              const strong = tick === 0 && hasNegative;
              const showLabel = ti % tickLabelEvery === 0 || tick === 0;
              return horizontal ? (
                <motion.g
                  key={tick}
                  initial={{ opacity: 0, x: scale(tick) }}
                  animate={{ opacity: 1, x: scale(tick) }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ x: move, opacity: { duration: duration.base } }}
                >
                  <line y2={innerH} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  {showLabel && (
                    <text y={innerH + 18} textAnchor="middle" className="fill-sheen-fg-muted text-2xs tabular-nums">
                      {tickFormat(tick)}
                    </text>
                  )}
                </motion.g>
              ) : (
                <motion.g
                  key={tick}
                  initial={{ opacity: 0, y: scale(tick) }}
                  animate={{ opacity: 1, y: scale(tick) }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ y: move, opacity: { duration: duration.base } }}
                >
                  <line x2={innerW} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                    {tickFormat(tick)}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Category labels. Vertical: thinned so each label gets ~36px and never collides
              (every value stays reachable via the tooltip and the table view).
              Horizontal: long names are truncated, with the full name as a tooltip. */}
          <AnimatePresence initial={false}>
            {data.map((row, ci) => {
              if (shownLabels && !shownLabels.has(ci)) return null;
              const label = String(row[index] ?? "");
              const short = horizontal ? truncate(label, maxChars) : label;
              return horizontal ? (
                <motion.text
                  key={keys[ci]}
                  x={-12}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-sheen-fg-muted text-xs"
                  initial={{ opacity: 0, y: ci * band + band / 2 }}
                  animate={{ opacity: 1, y: ci * band + band / 2 }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ y: move, opacity: { duration: duration.base } }}
                >
                  {short !== label && <title>{label}</title>}
                  {short}
                </motion.text>
              ) : (
                <motion.text
                  key={keys[ci]}
                  y={innerH + 20}
                  textAnchor="middle"
                  className="fill-sheen-fg-muted text-2xs"
                  initial={{ opacity: 0, x: ci * band + band / 2 }}
                  animate={{ opacity: 1, x: ci * band + band / 2 }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ x: move, opacity: { duration: duration.base } }}
                >
                  {label}
                </motion.text>
              );
            })}
          </AnimatePresence>

          {annotations && annotations.length > 0 && (
            <ChartAnnotationsLayer
              annotations={annotations}
              data={data}
              index={index}
              innerW={innerW}
              innerH={innerH}
              value={scale}
              position={(ci) => ci * band + band / 2}
              band={band}
              horizontal={horizontal}
              layer="back"
              show={seen}
              delay={reduced ? 0 : duration.slower * 0.6}
              reduced={reduced}
            />
          )}

          {/* Bars share one path structure, so a bar can tween from any shape to any other.
              A bar that arrives with new data grows from the baseline; the first set grows
              through the Web Animation instead (initial: false keeps Motion out of it). */}
          <motion.g ref={barsGroup} className="forced-color-adjust-none" style={{ opacity: barsOpacity }}>
            <AnimatePresence>
              {marks.map((m) => (
                <motion.path
                  key={m.key}
                  data-ci={m.category}
                  data-neg={m.negative ? "1" : undefined}
                  fill={m.fill}
                  initial={reduced || !mounted ? false : { d: m.d0, opacity: 1 }}
                  animate={{ d: m.d, opacity: seriesOpacity(m) }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ d: move, opacity: { duration: duration.fast } }}
                />
              ))}
            </AnimatePresence>
          </motion.g>

          {/* Previous period: a short dashed tick across each bar, in a text colour (never a series colour). */}
          <AnimatePresence>
            {marks.map((m) =>
              m.previous ? (
                <motion.line
                  key={`p-${m.key}`}
                  stroke="var(--sheen-fg)"
                  strokeWidth={2}
                  strokeDasharray="3 2"
                  strokeLinecap="butt"
                  initial={{ opacity: 0, x1: m.previous.x1, x2: m.previous.x2, y1: m.previous.y1, y2: m.previous.y2 }}
                  animate={{
                    opacity: seen ? 0.7 * seriesOpacity(m) : 0,
                    x1: m.previous.x1,
                    x2: m.previous.x2,
                    y1: m.previous.y1,
                    y2: m.previous.y2,
                  }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{
                    x1: move,
                    x2: move,
                    y1: move,
                    y2: move,
                    opacity: { duration: duration.base, delay: mounted || reduced ? 0 : labelDelay(m.category) },
                  }}
                />
              ) : null,
            )}
          </AnimatePresence>

          <AnimatePresence>
            {marks.map((m) =>
              m.label ? (
                <motion.text
                  key={`v-${m.key}`}
                  dy={horizontal ? "0.32em" : m.label.below ? "0.71em" : 0}
                  textAnchor={m.label.anchor}
                  className="fill-sheen-fg text-2xs font-medium tabular-nums"
                  initial={{ opacity: 0, x: m.label.x, y: m.label.y }}
                  animate={{ opacity: seen ? 1 : 0, x: m.label.x, y: m.label.y }}
                  exit={{ opacity: 0, transition: exitTransition }}
                  transition={{ x: move, y: move, opacity: { duration: duration.base, delay: labelDelay(m.category) } }}
                >
                  {m.label.text}
                </motion.text>
              ) : null,
            )}
          </AnimatePresence>

          {annotations && annotations.length > 0 && (
            <ChartAnnotationsLayer
              annotations={annotations}
              data={data}
              index={index}
              innerW={innerW}
              innerH={innerH}
              value={scale}
              position={(ci) => ci * band + band / 2}
              band={band}
              horizontal={horizontal}
              layer="front"
              show={seen}
              delay={reduced ? 0 : duration.slower}
              reduced={reduced}
            />
          )}
        </g>
      </>
    );
  }, [
    width,
    data,
    reduced,
    highlighted,
    gradients,
    hatched,
    series,
    horizontal,
    id,
    M.left,
    M.top,
    ticks,
    hasNegative,
    tickLabelEvery,
    scale,
    innerH,
    innerW,
    tickFormat,
    shownLabels,
    index,
    maxChars,
    keys,
    band,
    annotations,
    seen,
    marks,
    barsOpacity,
    mounted,
    animateData,
  ]);

  if (data.length === 0 || allSeries.length === 0) {
    return (
      <ChartEmpty height={h} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const activeRow = act !== null ? data[act] : undefined;
  const tooltipRows: TooltipRow[] = [];
  if (activeRow) {
    for (const { s, color } of series) {
      tooltipRows.push({ label: s.label, value: format(num(activeRow[s.key])), color, kind: "rect" });
      if (s.compareKey && showPrevious && activeRow[s.compareKey] !== undefined) {
        tooltipRows.push({
          label: t.previous(s.label),
          value: format(num(activeRow[s.compareKey])),
          color,
          kind: "rect",
          dashed: true,
        });
      }
    }
    if (stacked && series.length > 1) {
      tooltipRows.push({
        label: t.total,
        value: format(series.reduce((sum, { s }) => sum + num(activeRow[s.key]), 0)),
        color: "transparent",
        kind: "rect",
      });
    }
  }
  const notes = act !== null ? eventsAt(annotations, data, index, act).map((e) => e.label) : [];

  const tooltipPos =
    act === null
      ? { x: 0, y: 0 }
      : horizontal
        ? { x: M.left + innerW / 2, y: M.top + act * band + band / 2 }
        : { x: M.left + act * band + band / 2, y: M.top + innerH / 2 };

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height: h }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width}
          height={h}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={chartKeyHandler(data.length, act, setActive)}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
        >
          {/* Hover band behind the category being read (dashed outline when another synced chart is read). */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {shown !== null && (
              <rect
                x={horizontal ? -8 : shown * band + 2}
                y={horizontal ? shown * band + 2 : -4}
                width={horizontal ? innerW + 16 : Math.max(0, band - 4)}
                height={horizontal ? Math.max(0, band - 4) : innerH + 4}
                rx={8}
                fill="var(--sheen-hover)"
                stroke={act === null ? "var(--sheen-border)" : undefined}
                strokeDasharray={act === null ? "3 3" : undefined}
              />
            )}
          </g>
          {plot}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {/* The category being read, redrawn at full strength over the dimmed bars (with a glow in dark mode). */}
            {act !== null && (
              <g pointerEvents="none" className="forced-color-adjust-none">
                {marks.map((m) =>
                  m.category === act ? (
                    <path
                      key={m.key}
                      d={m.d}
                      fill={m.fill}
                      opacity={highlighted && highlighted !== m.seriesKey ? 0.25 : 1}
                      style={{ filter: glow && !reduced ? chartGlow(m.color, 6) : undefined }}
                    />
                  ) : null,
                )}
              </g>
            )}
            {hitAreas}
          </g>
        </ChartFigure>
      )}

      {activeRow && (
        <ChartTooltip
          title={String(activeRow[index])}
          rows={tooltipRows}
          notes={notes}
          x={tooltipPos.x}
          y={tooltipPos.y}
          containerWidth={width}
          docked={docked}
          surface={tooltipSurface}
        />
      )}
      <ChartAnnouncer
        text={
          activeRow
            ? `${activeRow[index]}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}${notes.length ? `. ${notes.join(", ")}` : ""}`
            : ""
        }
      />
    </div>
  );
}
