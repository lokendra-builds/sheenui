"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type LegendItem } from "./chart-parts";
import {
  axisFormat,
  barPath,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  clamp,
  enterEase,
  exitTransition,
  linear,
  niceTicks,
  num,
  slotColor,
  thinLabels,
  TOOLTIP_DOCK_BELOW,
  tooltipDockSpace,
  truncate,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
  useFirstPlay,
} from "./chart-utils";
import {
  ChartDockHint,
  ChartTip,
  ChartValueTable,
  defaultCompact,
  MissingValue,
  useEntrance,
  type ChartTipSide,
} from "./heatmap";
import { ChartFigure } from "./chart-figure";

/**
 * One step of a WaterfallChart: a label, a value and a `kind` (`start`, `delta`, `subtotal` or
 * `total`).
 */
export type WaterfallStep = {
  label: string;
  /** The change (for "delta"), the opening amount (for "start"). Ignored by "subtotal" / "total". */
  value?: number;
  /**
   * "delta" (default): adds to the running total. "start": sets it, drawn from zero.
   * "subtotal" / "total": a bar from zero to the running total so far.
   */
  kind?: "start" | "delta" | "subtotal" | "total";
};

/**
 * Every string WaterfallChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type WaterfallChartLabels = {
  increase: string;
  decrease: string;
  total: string;
  runningTotal: string;
  instructions: ChartInstructions;
  roleDescription: string;
  /** Shown in the readout band of a narrow chart while no step is being read. */
  hint: string;
};

/**
 * The built-in English strings of WaterfallChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultWaterfallChartLabels: WaterfallChartLabels = {
  increase: "Increase",
  decrease: "Decrease",
  total: "Total",
  runningTotal: "Running total",
  instructions: "Use the arrow keys to read each step.",
  roleDescription: "waterfall chart",
  hint: "Tap or hover a bar for its change",
};

/**
 * Props of WaterfallChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type WaterfallChartProps = {
  /** The steps in order: { label, value?, kind? }. Kinds are "start", "delta", "subtotal" and "total". */
  data: readonly WaterfallStep[];
  /** "auto" draws columns, and switches to horizontal bars when the chart is narrow or a step name wouldn't fit whole. */
  layout?: "auto" | "vertical" | "horizontal";
  /** The diverging pair: palette slots for increases and decreases (default blue / red). Totals are neutral. */
  increaseColor?: ChartColor;
  /** Sets the palette slot (1 to 8) of decreases. Default 8. */
  decreaseColor?: ChartColor;
  /** Plot height (vertical layout). Horizontal grows with the number of steps. */
  height?: number;
  /** Formats values and ticks. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Signed value labels on the bars ("+1.2K", "−400"), so colour is never the only cue. */
  showValues?: boolean;
  /** Hairline steps joining each bar to the next at the running total. */
  showConnectors?: boolean;
  /** Shown when there are no steps. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<WaterfallChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

type Kind = "increase" | "decrease" | "total";
type Bar = { label: string; kind: Kind; from: number; to: number; change: number; running: number };

/** Running totals: every step's start and end on the value axis. */
function computeBars(data: readonly WaterfallStep[]): Bar[] {
  let running = 0;
  return data.map((step) => {
    const v = num(step.value);
    const kind = step.kind ?? "delta";
    if (kind === "start") {
      running = v;
      return { label: step.label, kind: "total", from: 0, to: v, change: v, running };
    }
    if (kind === "subtotal" || kind === "total")
      return { label: step.label, kind: "total", from: 0, to: running, change: running, running };
    const from = running;
    running += v;
    return { label: step.label, kind: v < 0 ? "decrease" : "increase", from, to: running, change: v, running };
  });
}

const TOTAL_COLOR = "var(--sheen-fg-subtle)"; // neutral midpoint of the diverging pair
const MAX_THICKNESS = 24;
const CHAR_W = 6.4;

/** A column label on one line, or over two at the space that balances them, truncating only what still won't fit. */
function wrapLabel(label: string, chars: number): string[] {
  if (label.length <= chars) return [label];
  let best: [string, string] | null = null;
  for (let i = label.indexOf(" "); i > 0; i = label.indexOf(" ", i + 1)) {
    const pair: [string, string] = [label.slice(0, i), label.slice(i + 1)];
    if (Math.max(pair[0].length, pair[1].length) > chars) continue;
    if (!best || Math.max(...pair.map((p) => p.length)) < Math.max(...best.map((p) => p.length))) best = pair;
  }
  if (best) return best;
  const cut = label.lastIndexOf(" ", chars);
  return cut > 0 ? [label.slice(0, cut), truncate(label.slice(cut + 1), chars)] : [truncate(label, chars)];
}

/** Legend items for a waterfall's three kinds of bar (pass to ChartCard's `legend`). */
export function waterfallLegend(
  labels: Partial<Pick<WaterfallChartLabels, "increase" | "decrease" | "total">> = {},
  { increaseColor = 7, decreaseColor = 8 }: { increaseColor?: ChartColor; decreaseColor?: ChartColor } = {},
): LegendItem[] {
  const l = { ...defaultWaterfallChartLabels, ...labels };
  return [
    { label: l.increase, color: slotColor(increaseColor), kind: "rect" },
    { label: l.decrease, color: slotColor(decreaseColor), kind: "rect" },
    { label: l.total, color: TOTAL_COLOR, kind: "rect" },
  ];
}

const VERTICAL_TIP: readonly ChartTipSide[] = ["right", "left", "above", "below"];
const HORIZONTAL_TIP: readonly ChartTipSide[] = ["right", "left", "below", "above"];

/**
 * A running total broken into its steps: a start, increases and decreases floating from the
 * previous level, subtotals and a total from zero, joined by hairline connectors.
 *
 * - Increases and decreases are the two poles of the diverging pair (blue / red); totals are the
 *   neutral grey between them. Every delta also carries a signed label (+ / −) and the bars grow
 *   in their own direction, so colour is never the only signal.
 * - "auto" layout switches to horizontal bars on narrow charts, or when a step name wouldn't fit
 *   whole under its column, so names stay readable.
 * - Per-bar tooltip on hover, tap and the arrow keys. Bars grow from where they start, in order,
 *   the first time the chart scrolls into view; changed data morphs each bar to its new place.
 *   Instant with reduced motion.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between steps, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; every change carries a signed label (+ or -) and bars grow in their own direction, so colour is never the only signal. `WaterfallTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and morphs bars instantly.
 *
 * @example
 * ```tsx
 * import { WaterfallChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WaterfallChart
 *       data={[
 *         { label: "Opening", value: 120, kind: "start" },
 *         { label: "New", value: 45, kind: "delta" },
 *         { label: "Churn", value: -30, kind: "delta" },
 *         { label: "Closing", kind: "total" },
 *       ]}
 *       aria-label="MRR bridge, in thousands"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/waterfall-chart
 */
export function WaterfallChart({
  data,
  layout = "auto",
  increaseColor = 7,
  decreaseColor = 8,
  height,
  format: formatProp,
  locale,
  showValues = true,
  showConnectors = true,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<WaterfallChartProps>) {
  const labels = { ...defaultWaterfallChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const bars = useMemo(() => computeBars(data), [data]);
  const version = bars.map((b) => `${b.from}:${b.to}`).join("|");
  const tickFormat = axisFormat(format);
  const first = useFirstPlay(play && width > 0);

  const n = bars.length;
  const colorOf = (kind: Kind) =>
    kind === "increase" ? slotColor(increaseColor) : kind === "decrease" ? slotColor(decreaseColor) : TOTAL_COLOR;
  const valueText = (b: Bar) =>
    b.kind === "total" ? format(b.to) : b.change >= 0 ? `+${format(b.change)}` : format(b.change);

  // Column names: one line, or two (split at a space) when that keeps them whole.
  const columnChars = Math.max(2, Math.floor(((width - 64) / Math.max(1, n) - 4) / 6.2));
  const verticalLines = bars.map((b) => wrapLabel(b.label, columnChars));
  const wouldTruncate = columnChars < 4 || verticalLines.some((lines, i) => lines.join(" ") !== itemAt(bars, i).label);

  // Orientation: columns unless the chart is narrow, crowded, or a name would be cut short.
  const horizontal =
    layout === "horizontal" ||
    (layout === "auto" &&
      width > 0 &&
      (width < TOOLTIP_DOCK_BELOW || (width - 56) / Math.max(1, n) < 40 || wouldTruncate));
  const docked = useDockedReadout(width);
  // One line of readout, or two when the longest step's readout wouldn't fit on one.
  const dock = docked
    ? tooltipDockSpace(
        width,
        bars.map((b) => ({ label: b.label })),
        "label",
        [
          {
            label: labels.decrease.length > labels.increase.length ? labels.decrease : labels.increase,
            values: bars.map(valueText),
          },
          { label: labels.runningTotal, values: bars.map((b) => format(b.running)) },
        ],
      )
    : 0;

  let lo = 0;
  let hi = 0;
  for (const b of bars) {
    lo = Math.min(lo, b.from, b.to);
    hi = Math.max(hi, b.from, b.to);
  }

  const longest = horizontal ? bars.reduce((m, b) => Math.max(m, b.label.length), 0) : 0;
  const labelCol = horizontal ? clamp(Math.ceil(longest * 6.6) + 20, 56, Math.max(56, Math.floor(width * 0.38))) : 52;
  const widestValue = showValues ? bars.reduce((m, b) => Math.max(m, valueText(b).length), 0) * CHAR_W + 10 : 0;
  const h = height ?? (horizontal ? Math.max(160, n * 36 + 40) + dock : 280 + dock);
  const columnLines = horizontal || columnChars < 4 ? null : verticalLines;
  const twoLines = columnLines?.some((l) => l.length > 1) ?? false;
  const M = horizontal
    ? { top: 4 + dock, bottom: 24, left: labelCol, right: 12 + widestValue }
    : { top: (showValues ? 22 : 12) + dock, bottom: twoLines ? 41 : 28, left: 52, right: 12 };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, h - M.top - M.bottom);
  // Room past the end of negative-going values for their labels.
  const lowPad = showValues && lo < 0 ? (horizontal ? widestValue : 18) : 0;

  // Value ticks: of the few counts that leave room for their labels, the one that wastes the least
  // axis past the data (0–$6M for a $4.2M peak leaves a third of the plot empty; 0–$5M doesn't).
  const tickCount = horizontal ? clamp(Math.floor(innerW / 80), 2, 5) : 5;
  let ticks = niceTicks(lo, hi, tickCount);
  if (horizontal) {
    const overshoot = (t: number[]) => (t[t.length - 1] ?? 0) - hi + (lo - (t[0] ?? 0));
    for (const count of [tickCount + 1, tickCount + 2]) {
      const candidate = niceTicks(lo, hi, count);
      const widest = candidate.reduce((m, t) => Math.max(m, tickFormat(t).length), 0) * 6.2 + 16;
      if (innerW / Math.max(1, candidate.length - 1) < widest) break;
      if (overshoot(candidate) < overshoot(ticks)) ticks = candidate;
    }
  }
  const t0 = ticks[0] ?? 0;
  const t1 = ticks[ticks.length - 1] ?? 0;
  const scale = horizontal ? linear(t0, t1, lowPad, innerW) : linear(t0, t1, innerH - lowPad, 0);
  const band = (horizontal ? innerH : innerW) / Math.max(1, n);
  const thickness = Math.max(2, Math.min(MAX_THICKNESS, band * 0.6));
  const zeroStrong = lo < 0;

  const geometry = bars.map((b, i) => {
    const a = scale(b.from);
    const z = scale(b.to);
    const lowPx = Math.min(a, z);
    const len = Math.max(1, Math.abs(z - a));
    const c0 = i * band + (band - thickness) / 2;
    // Which side carries the value: where the bar ends up, on the value axis.
    const up = b.to >= b.from;
    if (horizontal) {
      return {
        d: barPath(lowPx, c0, len, thickness, up ? "right" : "left"),
        rect: { x: lowPx, y: c0, w: len, h: thickness },
        endPx: z,
        mid: c0 + thickness / 2,
        up,
      };
    }
    return {
      d: barPath(c0, lowPx, thickness, len, up ? "top" : "bottom"),
      rect: { x: c0, y: lowPx, w: thickness, h: len },
      endPx: z,
      mid: c0 + thickness / 2,
      up,
    };
  });

  // Signed values past each bar's data end: right / above when it rose, left / below when it fell.
  // A fall that ends too close to the axis for its label flips to the bar's other end, so labels
  // never run into the step names.
  const values = bars.map((b, i) => {
    const g = itemAt(geometry, i);
    const text = valueText(b);
    const textW = text.length * CHAR_W;
    const fits = showValues && (horizontal || textW <= band + 2);
    const startPx = scale(b.from);
    if (horizontal) {
      const roomLeft = g.endPx - 6 - textW >= 2;
      const right = g.up || !roomLeft;
      const x = right ? Math.max(g.endPx, startPx) + 6 : g.endPx - 6;
      return {
        text,
        fits,
        x,
        y: g.mid,
        dy: "0.32em",
        anchor: right ? ("start" as const) : ("end" as const),
        x0: right ? x : x - textW,
        x1: right ? x + textW : x,
        y0: g.mid - 7,
        y1: g.mid + 7,
      };
    }
    const roomBelow = g.endPx + 7 + 12 <= innerH;
    const above = g.up || !roomBelow;
    const y = above ? Math.min(g.endPx, startPx) - 7 : g.endPx + 7;
    return {
      text,
      fits,
      x: g.mid,
      y,
      dy: above ? 0 : "0.71em",
      anchor: "middle" as const,
      x0: g.mid - textW / 2,
      x1: g.mid + textW / 2,
      y0: above ? y - 11 : y,
      y1: above ? y : y + 11,
    };
  });

  if (n === 0) {
    return (
      <ChartEmpty height={height ?? 240} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < n ? active : null;
  const activeBar = act !== null ? bars[act] : undefined;
  const tooltipRows = activeBar
    ? activeBar.kind === "total"
      ? [{ label: labels.total, value: format(activeBar.to), color: TOTAL_COLOR, kind: "rect" as const }]
      : [
          {
            label: activeBar.kind === "increase" ? labels.increase : labels.decrease,
            value: valueText(activeBar),
            color: colorOf(activeBar.kind),
            kind: "rect" as const,
          },
          { label: labels.runningTotal, value: format(activeBar.running), color: "transparent" },
        ]
    : [];

  // Timing: an ordered cascade on first view; afterwards bars morph together and labels follow.
  const grow = (i: number) =>
    reduced
      ? { duration: 0 }
      : { duration: first ? duration.slow : duration.base, ease: enterEase, delay: first ? i * 0.07 : i * 0.025 };
  const morph = reduced ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const after = (i: number) =>
    reduced ? 0 : first ? i * 0.07 + duration.slow * 0.8 : duration.slow * 0.85 + i * 0.015;

  const categoryChars = Math.max(2, Math.floor((horizontal ? labelCol - 16 : band - 4) / 6.2));
  const shownCategories = horizontal
    ? null
    : categoryChars < 4
      ? thinLabels(
          bars.map((b) => b.label),
          band,
        )
      : null;

  // The tooltip sits beside the active bar and its value label, never on top of them.
  let tipAnchor = { x: 0, y: 0, w: 0, h: 0 };
  if (act !== null) {
    const g = itemAt(geometry, act);
    const v = itemAt(values, act);
    const x0 = Math.min(g.rect.x, v.fits ? v.x0 : Infinity);
    const x1 = Math.max(g.rect.x + g.rect.w, v.fits ? v.x1 : -Infinity);
    const y0 = horizontal ? act * band : Math.min(g.rect.y, v.fits ? v.y0 : Infinity);
    const y1 = horizontal ? (act + 1) * band : Math.max(g.rect.y + g.rect.h, v.fits ? v.y1 : -Infinity);
    tipAnchor = { x: M.left + x0, y: M.top + y0, w: x1 - x0, h: y1 - y0 };
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: h }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={h}
            roleDescription={labels.roleDescription}
            label={ariaLabel}
            description={resolveInstructions(labels.instructions)}
            tabIndex={0}
            onKeyDown={chartKeyHandler(n, act, setActive)}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
          >
            <g aria-hidden transform={`translate(${M.left},${M.top})`}>
              {/* Value grid: hairline, solid; zero gets a firmer line when the total dips below it. */}
              <AnimatePresence initial={false}>
                {ticks.map((t) => {
                  const p = scale(t);
                  const strong = t === 0 && zeroStrong;
                  return horizontal ? (
                    <motion.g
                      key={`x${t}`}
                      initial={{ opacity: 0, x: p }}
                      animate={{ opacity: 1, x: p }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{ x: { duration: 0 }, opacity: { duration: reduced ? 0 : duration.base } }}
                    >
                      <line y2={innerH} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                      <text y={innerH + 18} textAnchor="middle" className="fill-sheen-fg-muted text-2xs tabular-nums">
                        {tickFormat(t)}
                      </text>
                    </motion.g>
                  ) : (
                    <motion.g
                      key={`y${t}`}
                      initial={{ opacity: 0, y: p }}
                      animate={{ opacity: 1, y: p }}
                      exit={{ opacity: 0, transition: exitTransition }}
                      transition={{ y: { duration: 0 }, opacity: { duration: reduced ? 0 : duration.base } }}
                    >
                      <line x2={innerW} stroke={strong ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                      <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                        {tickFormat(t)}
                      </text>
                    </motion.g>
                  );
                })}
              </AnimatePresence>

              {/* Step names: whole when they fit, truncated (full name on hover) or thinned when they don't. */}
              {bars.map((b, i) => {
                if (shownCategories && !shownCategories.has(i)) return null;
                const short = truncate(b.label, categoryChars);
                const lines = columnLines?.[i] ?? [short];
                const strong = act === i;
                return horizontal ? (
                  <text
                    key={`c${i}`}
                    x={-12}
                    y={itemAt(geometry, i).mid}
                    dy="0.32em"
                    textAnchor="end"
                    className={cn(
                      "text-xs",
                      strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted",
                      b.kind === "total" && "font-semibold",
                    )}
                  >
                    {short !== b.label && <title>{b.label}</title>}
                    {short}
                  </text>
                ) : (
                  <text
                    key={`c${i}`}
                    x={itemAt(geometry, i).mid}
                    y={innerH + 20}
                    textAnchor="middle"
                    className={cn(
                      "text-2xs",
                      strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted",
                      b.kind === "total" && "font-semibold",
                    )}
                  >
                    {lines.join(" ") !== b.label && <title>{b.label}</title>}
                    {lines.map((line, k) => (
                      <tspan key={k} x={itemAt(geometry, i).mid} dy={k === 0 ? 0 : "1.2em"}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                );
              })}

              {/* Hover band behind the active step. */}
              {act !== null && (
                <rect
                  x={horizontal ? -8 : act * band + 2}
                  y={horizontal ? act * band + 2 : -4}
                  width={horizontal ? innerW + 16 : Math.max(0, band - 4)}
                  height={horizontal ? Math.max(0, band - 4) : innerH + 4}
                  rx={8}
                  fill="var(--sheen-hover)"
                />
              )}

              {/* Connectors at the running total, drawn from one bar's end towards the next bar. */}
              {showConnectors && (
                <AnimatePresence>
                  {bars.slice(0, -1).map((b, i) => {
                    const level = scale(b.running);
                    const s = i * band + (band + thickness) / 2;
                    const e = (i + 1) * band + (band - thickness) / 2;
                    return (
                      <motion.line
                        key={`${version}:k${i}:${horizontal}`}
                        x1={horizontal ? level : s}
                        x2={horizontal ? level : e}
                        y1={horizontal ? s : level}
                        y2={horizontal ? e : level}
                        stroke="var(--sheen-fg-subtle)"
                        strokeOpacity={0.55}
                        strokeWidth={1}
                        shapeRendering="crispEdges"
                        // Motion's own origin props (an inline transform-origin would be overridden).
                        style={{ originX: 0, originY: 0 }}
                        initial={reduced ? false : horizontal ? { scaleY: 0, opacity: 1 } : { scaleX: 0, opacity: 1 }}
                        animate={play ? { scaleX: 1, scaleY: 1, opacity: 1 } : undefined}
                        exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                        transition={{ duration: reduced ? 0 : duration.base, ease: enterEase, delay: after(i) }}
                      />
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Bars grow from where they start: increases up (right), decreases down (left), totals from zero. */}
              <g className="forced-color-adjust-none">
                <AnimatePresence>
                  {bars.map((b, i) => {
                    const g = itemAt(geometry, i);
                    return (
                      <motion.path
                        key={`b${i}:${horizontal}`}
                        style={{
                          fill: colorOf(b.kind),
                          originX: horizontal ? (g.up ? 0 : 1) : 0.5,
                          originY: horizontal ? 0.5 : g.up ? 1 : 0,
                        }}
                        // High contrast keeps the diverging fills (forced-color-adjust: none) and adds a CanvasText edge.
                        className="forced-colors:stroke-[CanvasText]"
                        initial={
                          reduced
                            ? false
                            : horizontal
                              ? { scaleX: 0, opacity: 1, d: g.d }
                              : { scaleY: 0, opacity: 1, d: g.d }
                        }
                        animate={
                          play
                            ? { d: g.d, scaleX: 1, scaleY: 1, opacity: act === null || act === i ? 1 : 0.45 }
                            : undefined
                        }
                        exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                        transition={{
                          d: morph,
                          scaleX: grow(i),
                          scaleY: grow(i),
                          opacity: { duration: reduced ? 0 : duration.fast },
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
              </g>

              {/* Signed values at each bar's data end (text tokens, never the bar colour). */}
              {showValues && (
                <AnimatePresence>
                  {bars.map((b, i) => {
                    const v = itemAt(values, i);
                    if (!v.fits) return null;
                    return (
                      <motion.text
                        key={`${version}:v${i}:${horizontal}`}
                        x={v.x}
                        y={v.y}
                        dy={v.dy}
                        textAnchor={v.anchor}
                        className={cn(
                          "fill-sheen-fg text-2xs tabular-nums",
                          b.kind === "total" ? "font-semibold" : "font-medium",
                        )}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={play ? { opacity: 1 } : undefined}
                        exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
                        transition={{ duration: reduced ? 0 : duration.base, delay: after(i) }}
                      >
                        {v.text}
                      </motion.text>
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Hit areas: a whole band per step, larger than the bar. */}
              {bars.map((_, i) => (
                <rect
                  key={`hit${i}`}
                  x={horizontal ? -M.left + 8 : i * band}
                  y={horizontal ? i * band : 0}
                  width={horizontal ? innerW + M.left - 8 : band}
                  height={horizontal ? band : innerH}
                  fill="transparent"
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onPointerDown={() => setActive(i)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                />
              ))}
            </g>
          </ChartFigure>
        )}

        {activeBar ? (
          <ChartTip
            title={activeBar.label}
            rows={tooltipRows}
            anchor={tipAnchor}
            bounds={{ w: width, h }}
            docked={docked}
            order={horizontal ? HORIZONTAL_TIP : VERTICAL_TIP}
            minLeft={horizontal ? M.left : 0}
          />
        ) : (
          docked && <ChartDockHint>{labels.hint}</ChartDockHint>
        )}
      </div>
      <ChartAnnouncer
        text={activeBar ? `${activeBar.label}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}` : ""}
      />
    </div>
  );
}

/* ---------- Table view ---------- */

/** The text of `WaterfallTable` that is not a column header. */
export type WaterfallTableLabels = {
  /** Read for the change of a subtotal / total row (it has none: it restates the running total). */
  notApplicable: string;
};

/** English defaults of {@link WaterfallTableLabels}. */
export const defaultWaterfallTableLabels: WaterfallTableLabels = {
  notApplicable: "Not applicable",
};

/**
 * Props of WaterfallTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type WaterfallTableProps = Pick<WaterfallChartProps, "data" | "format" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { step, change, runningTotal }. */
  headers?: Partial<{ step: string; change: string; runningTotal: string }>;
  /** Strings for the cells that have no value. Merged over {@link defaultWaterfallTableLabels}. */
  labels?: Partial<WaterfallTableLabels>;
  /** Shown when there are no steps. */
  emptyState?: ReactNode;
};

/**
 * Every step with its signed change and the running total after it.
 *
 * Props: the chart's `data`, `format` and `locale`, plus `caption` (hidden, names the table), `headers` ({ step, change, runningTotal }), `labels` (`notApplicable` "Not applicable") and `emptyState`. A real table: each step's signed change and the running total after it. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { WaterfallTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WaterfallTable data={[{ label: "Opening", value: 120, kind: "start" }, { label: "Churn", value: -30, kind: "delta" }]} caption="MRR bridge" />
 *   );
 * }
 * ```
 *
 * @see /charts/waterfall-chart
 */
export function WaterfallTable({
  data,
  format: formatProp,
  locale,
  caption,
  headers,
  labels,
  emptyState,
}: WaterfallTableProps) {
  const { notApplicable: notApplicableLabel } = { ...defaultWaterfallTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const h = { step: "Step", change: "Change", runningTotal: "Running total", ...headers };
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: h.step }, { label: h.change }, { label: h.runningTotal }]}
      rows={computeBars(data).map((b, i) => {
        const opening = data[i]?.kind === "start";
        return [
          b.kind === "total" ? <strong className="font-semibold text-sheen-fg">{b.label}</strong> : b.label,
          b.kind === "total" && !opening ? (
            <MissingValue label={notApplicableLabel} />
          ) : b.change >= 0 ? (
            `${opening ? "" : "+"}${format(b.change)}`
          ) : (
            format(b.change)
          ),
          b.kind === "total" ? <strong className="font-semibold">{format(b.running)}</strong> : format(b.running),
        ];
      })}
    />
  );
}
