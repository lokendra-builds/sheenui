"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import { useId, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { cn } from "../lib/cn";
import { useSyncRef } from "../hooks/use-latest";
import { duration, ease } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import {
  ChartAnnouncer,
  ChartLegend,
  defaultChartLegendLabels,
  useChartSeriesState,
  useChartSharedLabels,
  type ChartLegendLabels,
} from "./chart-parts";
import {
  chartFocusClass,
  chartGlow,
  chartKeyHandler,
  compactFormat,
  num,
  slotColor,
  useElementInView,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** One slice of a DonutChart: a label, a value, an optional palette slot and a stable key. */
export type DonutSlice = {
  label: string;
  value: number;
  color?: ChartColor;
  /** Stable identity for legend toggling (defaults to the label). */
  key?: string;
};

/**
 * Every string DonutChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type DonutChartLabels = ChartLegendLabels & {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Spoken when the chart has nothing to show. */
  noDataSuffix: string;
  /** "42.1 percent" in the announcement. */
  percent: (pct: string) => string;
  /** Text under the total in the centre while no slice is active. */
  center: string;
};

/**
 * The built-in English strings of DonutChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultDonutChartLabels: DonutChartLabels = {
  ...defaultChartLegendLabels,
  legend: "Slices: press to show or hide",
  instructions: "Use arrow keys to read each slice.",
  noDataSuffix: "no data",
  percent: (pct) => `${pct} percent`,
  center: "Total",
};

/**
 * Props of DonutChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type DonutChartProps = {
  /** Part-to-whole only, at most 6 slices: fold the rest into "Other". Negative values count as 0. */
  data: readonly DonutSlice[];
  /** Outer diameter of the ring in px; the chart is a circle of this width and height. Default 200. */
  diameter?: number;
  /** Formats values in the tooltip and legend. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Locale for the default number format and percentages (e.g. "de"). */
  locale?: string;
  /** Shown in the centre when there is nothing to plot (no slices, or every value is 0). */
  emptyState?: ReactNode;
  /** Legend items toggle slices (the ring re-flows, the total updates). Default true. */
  legendToggle?: boolean;
  /** Slice keys (or labels) to hide (controlled). */
  hiddenSlices?: readonly string[];
  /** Slice keys (or labels) hidden at first (uncontrolled). */
  defaultHiddenSlices?: readonly string[];
  /** Called with the keys of the hidden slices whenever the legend toggles one. */
  onHiddenSlicesChange?: (keys: string[]) => void;
  /** Soft glow on the active slice in dark mode. Default true. */
  glow?: boolean;
  /**
   * Tell slices apart without colour (hatch fills). Default: on when the ring has more than 3 slices.
   *
   * @default true when data.length > 3
   */
  patterns?: boolean;
  /** The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<DonutChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP_PX = 2;
const START = -Math.PI / 2;
const TURN = Math.PI * 2;

type Geometry = { c: number; r: number; gap: number };

function arcPath(s: number, e: number, { c, r }: Geometry) {
  if (e - s >= TURN - 1e-4) e = s + TURN - 1e-4; // a full ring still needs two distinct end points
  if (e - s <= 1e-4) return "M0,0";
  const pt = (a: number) => `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`;
  return `M${pt(s)} A${r},${r} 0 ${e - s > Math.PI ? 1 : 0} 1 ${pt(e)}`;
}

/**
 * One slice. Its path is a MotionValue derived from the shared tween progress, so the ring
 * re-flows without a single React render per frame.
 */
function Slice({
  i,
  progress,
  sweep,
  from,
  to,
  geometry,
  color,
  paint,
  thickness,
  active,
  dimmed,
  glow,
  reduced,
  onEnter,
  onLeave,
}: {
  i: number;
  progress: MotionValue<number>;
  sweep: MotionValue<number>;
  from: React.RefObject<number[]>;
  to: React.RefObject<number[]>;
  geometry: Geometry;
  color: string;
  /** What the arc is stroked with: the colour, or its hatch pattern. */
  paint: string;
  thickness: number;
  active: boolean;
  dimmed: boolean;
  glow: boolean;
  reduced: boolean;
  onEnter: () => void;
  onLeave: (e: React.PointerEvent) => void;
}) {
  const d = useTransform([progress, sweep], ([p, sw]) => {
    const f = from.current;
    const tt = to.current;
    const lerp = (k: number) => {
      const a = f[k] ?? START + TURN;
      const b = tt[k] ?? START;
      return a + (b - a) * (p as number);
    };
    const cap = START + (sw as number) * TURN;
    const s = lerp(i) + geometry.gap / 2;
    const e = Math.min(lerp(i + 1), cap) - geometry.gap / 2;
    return arcPath(s, e, geometry);
  });
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={paint}
      strokeWidth={thickness}
      onPointerEnter={onEnter}
      onPointerDown={onEnter}
      onPointerLeave={onLeave}
      className="cursor-pointer"
      style={{
        originX: "50%",
        originY: "50%",
        transformBox: "view-box",
        filter: active && glow && !reduced ? chartGlow(color, 8) : undefined,
      }}
      initial={false}
      animate={{ scale: active && !reduced ? 1.045 : 1, opacity: dimmed ? 0.4 : 1 }}
      transition={{
        scale: { type: "spring", visualDuration: 0.22, bounce: 0.2 },
        opacity: { duration: duration.fast },
      }}
    />
  );
}

/** The total in the centre: rolls to its value (a MotionValue child: no re-render per frame). */
function RollingTotal({
  value,
  format,
  play,
  reduced,
}: {
  value: number;
  format: (n: number) => string;
  play: boolean;
  reduced: boolean;
}) {
  const mv = useMotionValue(reduced ? value : 0);
  // Whole numbers roll through whole numbers (no "99.7" on the way to 100).
  const whole = Number.isInteger(value);
  const text = useTransform(mv, (v) => format(whole ? Math.round(v) : v));
  useEffect(() => {
    if (!play) return;
    if (reduced) {
      mv.jump(value);
      return;
    }
    const controls = animate(mv, value, { duration: duration.slower * 1.4, ease: ease.out });
    return () => controls.stop();
  }, [value, play, reduced, mv]);
  // One grid cell holds the final text (invisible) and the counting text, so the box already has the final width: the
  // centred label never resizes, and nothing shifts, while the number counts up.
  return (
    <span className="inline-grid justify-items-center">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {format(value)}
      </span>
      {/* Fills the cell (centred text) so its own box never changes while the digits count. */}
      <motion.span className="col-start-1 row-start-1 w-full text-center">{text}</motion.span>
    </span>
  );
}

/**
 * A donut for the share of a whole, with a centre label (`labels.center`, default "Total") and a legend that can hide slices. Use it for 2 to 6 parts that add up to something meaningful; for more categories prefer a bar chart.
 *
 * Keyboard: Tab focuses the chart; Left/Right (Up/Down) arrows move between slices, Home and End jump to the first and last, Escape clears. Legend items are toggle buttons (Enter or Space).
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the slice, its value and percentage. Pair with a table view through `ChartCard table`.
 * Glass and motion: the ring sweeps in once when first seen and tweens on data change; reduced motion jumps. No backdrop blur on the plot.
 *
 * @example
 * ```tsx
 * import { DonutChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DonutChart
 *       data={[
 *         { label: "Direct", value: 4200 },
 *         { label: "Search", value: 3100 },
 *         { label: "Referral", value: 1200 },
 *       ]}
 *       labels={{ center: "Visits" }}
 *       aria-label="Visits by channel, share"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/donut-chart
 */
export function DonutChart({
  data,
  diameter: size = 200,
  format: formatProp,
  locale,
  emptyState,
  legendToggle = true,
  hiddenSlices,
  defaultHiddenSlices,
  onHiddenSlicesChange,
  glow = true,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<DonutChartProps>) {
  const id = useId();
  const t = { ...defaultDonutChartLabels, ...labels };
  const shared = useChartSharedLabels();
  const format = formatProp ?? compactFormat(locale);
  const pctFormat = useMemo(
    () => new Intl.NumberFormat(locale ?? "en", { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
    [locale],
  );
  const pctShort = useMemo(() => new Intl.NumberFormat(locale ?? "en", { maximumFractionDigits: 0 }), [locale]);
  const reduced = useSheenReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const rootMerged = useMergedRef(setRoot, outerRef);
  const seen = useElementInView(root, { once: true, amount: 0.3 }) || reduced;

  // Hidden slices: controlled, or local legend state.
  const local = useChartSeriesState(defaultHiddenSlices);
  const keyOf = (d: DonutSlice) => d.key ?? d.label;
  const hidden = useMemo(() => (hiddenSlices ? new Set(hiddenSlices) : local.hidden), [hiddenSlices, local.hidden]);
  const toggle = (key: string) => {
    if (hiddenSlices) {
      const next = new Set(hiddenSlices);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onHiddenSlicesChange?.([...next]);
    } else {
      local.toggle(key);
      const next = new Set(local.hidden);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onHiddenSlicesChange?.([...next]);
    }
  };

  const values = data.map((d) => (hidden.has(keyOf(d)) ? 0 : Math.max(0, num(d.value))));
  const total = values.reduce((sum, v) => sum + v, 0);
  const isEmpty = total <= 0;
  const allZero = data.every((d) => Math.max(0, num(d.value)) <= 0);
  const thickness = size * 0.13;
  // Room so the hovered slice (scaled 4.5%) never clips.
  const r = size / 2 - thickness / 2 - size * 0.035;
  const c = size / 2;
  const gap = values.filter((v) => v > 0).length > 1 ? GAP_PX / r : 0;
  const geometry = { c, r, gap };

  // Slice boundaries as angles (n + 1 of them), tweened through one progress MotionValue.
  const target = [
    START,
    ...values.map((_, i) => START + (values.slice(0, i + 1).reduce((sum, v) => sum + v, 0) / (total || 1)) * TURN),
  ];
  const targetKey = target.map((v) => v.toFixed(5)).join(",");
  const from = useRef<number[]>(target);
  const to = useRef<number[]>(target);
  const targetRef = useRef(target);
  useSyncRef(targetRef, target);
  const progress = useMotionValue(1);
  const sweep = useMotionValue(reduced ? 1 : 0);
  useEffect(() => {
    const next = targetRef.current;
    const prev = to.current;
    const cur = progress.get();
    // Start from wherever the ring is right now (interrupting a tween mid-way is smooth).
    from.current = next.map((_, k) => {
      const a = from.current[k] ?? START + TURN;
      const b = prev[k] ?? START + TURN;
      return a + (b - a) * cur;
    });
    to.current = next;
    if (reduced) {
      progress.jump(1);
      return;
    }
    progress.jump(0);
    const controls = animate(progress, 1, { duration: duration.slower, ease: ease.out });
    return () => controls.stop();
  }, [targetKey, reduced, progress]);

  // Entrance: the ring sweeps clockwise once, revealing slices in order, when it scrolls into view.
  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      sweep.jump(1);
      return;
    }
    const controls = animate(sweep, 1, { duration: duration.slower * 1.4, ease: ease.out });
    return () => controls.stop();
  }, [seen, reduced, sweep]);

  const hatched = resolvePatterns(patterns, data.length);
  const slices = data.map((d, i) => {
    const off = hidden.has(keyOf(d));
    const pct = isEmpty || off ? 0 : ((values[i] ?? 0) / total) * 100;
    return { key: keyOf(d), label: d.label, value: values[i] ?? 0, pct, off, color: slotColor(d.color ?? i + 1) };
  });

  const act = active !== null && active < slices.length && !slices[active]?.off ? active : null;
  const focus = act !== null ? slices[act] : undefined;
  // Keyboard reads only the visible slices.
  const order = slices.map((s, i) => (s.off ? -1 : i)).filter((i) => i >= 0);
  const pos = act === null ? null : order.indexOf(act);
  const onKeyDown = chartKeyHandler(order.length, pos, (p) => setActive(p === null ? null : (order[p] ?? null)));
  const emptyText = emptyState ?? shared.noData;

  return (
    <div {...rest} ref={rootMerged} className={cn("flex flex-wrap items-center justify-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <ChartFigure
          as="svg"
          width={size}
          height={size}
          label={allZero ? `${ariaLabel}: ${t.noDataSuffix}` : ariaLabel}
          description={allZero ? undefined : resolveInstructions(t.instructions)}
          tabIndex={isEmpty ? undefined : 0}
          onKeyDown={isEmpty ? undefined : onKeyDown}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-full", chartFocusClass)}
        >
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--sheen-chart-grid)" strokeWidth={thickness} />
          {hatched && <ChartPatternDefs id={id} entries={slices.map((s, i) => ({ index: i, color: s.color }))} />}
          <g className="forced-color-adjust-none">
            {slices.map((s, i) => (
              <Slice
                key={`${s.key}-${i}`}
                i={i}
                progress={progress}
                sweep={sweep}
                from={from}
                to={to}
                geometry={geometry}
                color={s.color}
                paint={patternFill(hatched, id, i, s.color)}
                thickness={thickness}
                active={act === i}
                dimmed={act !== null && act !== i}
                glow={glow}
                reduced={reduced}
                onEnter={() => !s.off && setActive(i)}
                onLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              />
            ))}
          </g>
        </ChartFigure>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {isEmpty ? (
            <span className="max-w-[60%] text-sm text-sheen-fg-muted">{emptyText}</span>
          ) : (
            <>
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {focus ? (
                  format(focus.value)
                ) : (
                  <>
                    <span aria-hidden>
                      <RollingTotal value={total} format={format} play={seen} reduced={reduced} />
                    </span>
                    <span className="sr-only">{format(total)}</span>
                  </>
                )}
              </span>
              <span className="max-w-[60%] truncate text-xs text-sheen-fg-muted">
                {focus ? `${focus.label} · ${pctFormat.format(focus.pct)}%` : t.center}
              </span>
            </>
          )}
        </div>
      </div>

      {slices.length > 0 && (
        <ChartLegend
          className="max-w-56 flex-col items-start gap-y-1"
          items={slices.map((s, i) => ({
            label: s.label,
            color: s.color,
            kind: "rect",
            pattern: hatched && i > 0 ? i : undefined,
            key: s.key,
            value: s.off ? "–" : `${pctShort.format(s.pct)}%`,
          }))}
          hidden={legendToggle ? hidden : undefined}
          onToggle={legendToggle && !allZero ? toggle : undefined}
          onHighlight={(key) => {
            const i = key === null ? -1 : slices.findIndex((s) => s.key === key);
            setActive(i >= 0 ? i : null);
          }}
          labels={{ legend: t.legend, shown: t.shown, hidden: t.hidden }}
        />
      )}
      <ChartAnnouncer
        text={focus ? `${focus.label}: ${format(focus.value)}, ${t.percent(pctFormat.format(focus.pct))}` : ""}
      />
    </div>
  );
}
