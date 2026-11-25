"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useCallback,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type LegendItem } from "./chart-parts";
import {
  DockHint,
  dockHintHeight,
  dockSpace,
  SeriesTable,
  useDockedReadout,
  useInputSource,
  type Readout,
} from "./chart-fit";
import {
  chartFocusClass,
  chartKeyHandler,
  clamp,
  MAX_SERIES,
  niceTicks,
  num,
  seriesColor,
  slotColor,
  truncate,
  useElementWidth,
  type ChartRow,
  type ChartSeries,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartTip, defaultCompact, useEntrance } from "./heatmap";
import { markGlow, solidTipsScope, useTableRows } from "./category-bar";
import { ChartFigure } from "./chart-figure";

/**
 * Every string PolarAreaChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type PolarAreaChartLabels = {
  instructions: ChartInstructions;
  /** Tooltip / table row for the stacked total. */
  total: string;
  /** Name of the series that folds everything past the 8th. */
  other: string;
  /** Touch screens: the hint in the readout band before anything is read. */
  touchHint: string;
  empty: string;
};

/**
 * The built-in English strings of PolarAreaChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultPolarAreaChartLabels: PolarAreaChartLabels = {
  instructions: "Use the arrow keys to read each wedge.",
  total: "Total",
  other: "Other",
  touchHint: "Tap or drag around the chart to read values",
  empty: "No data",
};

/**
 * Props of PolarAreaChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type PolarAreaChartProps = {
  /** One row per wedge (e.g. per month), clockwise from 12 o'clock. */
  data: readonly ChartRow[];
  /** Key of the wedge's name in each row. */
  index: string;
  /** One or more series; several stack outwards (Nightingale's rose). Up to 8, each with a fixed `color` slot. */
  series: readonly ChartSeries[];
  /**
   * "area" (default): a wedge's AREA is proportional to its value, which is how a rose must be read.
   * "radius": its length is, which exaggerates large values; only for familiar 0–100 scores.
   */
  scale?: "area" | "radius";
  /** Height in px; the rose is as large as fits. Default 340. */
  height?: number;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<PolarAreaChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const TAU = Math.PI * 2;
const CHAR_W = 6.2;
const HOLE = 0.1; // inner radius as a share of the outer one: the wedges never meet in a blot

const f = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0");
const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;

/**
 * Annular sector from radius r0 to r1 between angles a0 and a1 (radians, clockwise from 12
 * o'clock). `round` rounds the two outer corners (the data end) by up to that many px.
 */
function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, round = 0) {
  if (r1 - r0 < 0.05) return "";
  const span = a1 - a0;
  if (span >= TAU - 1e-6) {
    // A full ring: two half arcs each way.
    const [ox, oy] = polar(cx, cy, r1, 0);
    const [bx, by] = polar(cx, cy, r1, Math.PI);
    const [ix, iy] = polar(cx, cy, r0, 0);
    const [jx, jy] = polar(cx, cy, r0, Math.PI);
    return (
      `M${f(ox)},${f(oy)} A${f(r1)},${f(r1)} 0 1 1 ${f(bx)},${f(by)} A${f(r1)},${f(r1)} 0 1 1 ${f(ox)},${f(oy)} Z ` +
      `M${f(ix)},${f(iy)} A${f(r0)},${f(r0)} 0 1 0 ${f(jx)},${f(jy)} A${f(r0)},${f(r0)} 0 1 0 ${f(ix)},${f(iy)} Z`
    );
  }
  const large = span > Math.PI ? 1 : 0;
  const cr = Math.max(0, Math.min(round, (r1 - r0) / 2, (r1 * span) / 4));
  const d = cr / Math.max(1, r1); // angle the rounding takes off each outer corner
  const [p0x, p0y] = polar(cx, cy, r1 - cr, a0);
  const [c0x, c0y] = polar(cx, cy, r1, a0);
  const [q0x, q0y] = polar(cx, cy, r1, a0 + d);
  const [q1x, q1y] = polar(cx, cy, r1, a1 - d);
  const [c1x, c1y] = polar(cx, cy, r1, a1);
  const [p1x, p1y] = polar(cx, cy, r1 - cr, a1);
  const [i1x, i1y] = polar(cx, cy, r0, a1);
  const [i0x, i0y] = polar(cx, cy, r0, a0);
  return (
    `M${f(i0x)},${f(i0y)} L${f(p0x)},${f(p0y)} Q${f(c0x)},${f(c0y)} ${f(q0x)},${f(q0y)} ` +
    `A${f(r1)},${f(r1)} 0 ${large} 1 ${f(q1x)},${f(q1y)} Q${f(c1x)},${f(c1y)} ${f(p1x)},${f(p1y)} ` +
    `L${f(i1x)},${f(i1y)} A${f(r0)},${f(r0)} 0 ${large} 0 ${f(i0x)},${f(i0y)} Z`
  );
}

/** Settled clock: every wedge has finished its tween. */
const SETTLED = 1e9;
/** Ease-out cubic over 0..1 (clamped), each wedge's local progress. */
const bloomCurve = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3));

/** One series' sector of one wedge; its path follows the radii MotionValue (no React render per frame). */
function Segment({
  radii,
  outer,
  inner,
  cx,
  cy,
  r0,
  a0,
  a1,
  round,
  fill,
  strokeWidth,
  glow,
}: {
  radii: MotionValue<number[]>;
  /** Index of this sector's outer radius in `radii`; `inner` is the one below it (-1: the hole). */
  outer: number;
  inner: number;
  cx: number;
  cy: number;
  r0: number;
  a0: number;
  a1: number;
  round: number;
  fill: string;
  strokeWidth: number;
  glow?: string;
}) {
  const geo = useRef({ outer, inner, cx, cy, r0, a0, a1, round });
  useSyncRef(geo, { outer, inner, cx, cy, r0, a0, a1, round });
  const d = useTransform(radii, (r: number[]) => {
    const g = geo.current;
    return sectorPath(g.cx, g.cy, g.inner < 0 ? g.r0 : (r[g.inner] ?? g.r0), r[g.outer] ?? g.r0, g.a0, g.a1, g.round);
  });
  return (
    <motion.path
      d={d}
      fill={fill}
      stroke="var(--sheen-chart-surface)"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className="forced-colors:stroke-[CanvasText]"
      style={{ filter: glow }}
    />
  );
}

/**
 * More than 8 series: the first 7 keep their slots and the rest are summed into one "Other"
 * series (neutral grey), so colour slots never repeat. Returns rows with the "Other" value added.
 */
export function foldPolarSeries(
  data: readonly ChartRow[],
  series: readonly ChartSeries[],
  otherLabel = defaultPolarAreaChartLabels.other,
): { rows: readonly ChartRow[]; series: readonly ChartSeries[] } {
  if (series.length <= MAX_SERIES) return { rows: data, series };
  const kept = series.slice(0, MAX_SERIES - 1);
  const rest = series.slice(MAX_SERIES - 1);
  const key = "__other";
  return {
    rows: data.map((row) => ({ ...row, [key]: rest.reduce((sum, s) => sum + Math.max(0, num(row[s.key])), 0) })),
    series: [
      ...kept.map((s, i) => ({ ...s, color: s.color ?? ((i + 1) as ChartSeries["color"]) })),
      { key, label: otherLabel, color: undefined },
    ],
  };
}

/** Colour of a series of the rose: its slot, or neutral grey for the folded "Other". */
const roseColor = (s: ChartSeries, i: number) => (s.key === "__other" ? slotColor(0) : seriesColor(s, i));

/** Legend for a rose: one swatch per series (skip it for a single series: the title names it). */
export function polarAreaLegend(series: readonly ChartSeries[], otherLabel?: string): LegendItem[] {
  return foldPolarSeries([], series, otherLabel).series.map((s, i) => ({
    label: s.label,
    color: roseColor(s, i),
    kind: "rect",
  }));
}

/**
 * Nightingale's rose: one wedge per category around a circle (months, hours, compass points),
 * each wedge's area proportional to its value. Several series stack outwards.
 *
 * - Area-true by default: radii grow with the square root of the value, as the eye reads area.
 * - Rings mark round values; names sit around the outside, thinned so they never collide.
 * - Hover, tap or arrow through the wedges: the wedge eases outwards (and glows in the dark
 *   theme), the others step back, and the values are shown and announced.
 * - Wedges bloom outwards clockwise the first time the chart scrolls into view; new data
 *   reshapes them. Reduced motion: drawn in place.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between wedges, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the wedge and its values. `PolarAreaTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws the wedges in place.
 *
 * @example
 * ```tsx
 * import { PolarAreaChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PolarAreaChart
 *       data={[
 *         { month: "Jan", rain: 80 },
 *         { month: "Feb", rain: 55 },
 *         { month: "Mar", rain: 62 },
 *         { month: "Apr", rain: 40 },
 *       ]}
 *       index="month"
 *       series={[{ key: "rain", label: "Rainfall (mm)" }]}
 *       aria-label="Rainfall by month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/polar-area
 */
export function PolarAreaChart({
  data: dataProp,
  index,
  series: seriesProp,
  scale: scaleProp = "area",
  height = 340,
  format: formatProp,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<PolarAreaChartProps>) {
  const t = { ...defaultPolarAreaChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const docked = useDockedReadout(width);
  const [active, setActive] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();
  // New data or a new scale is laid out in a deferred render (React yields while it rebuilds the
  // rose), so the control that changed it responds at once; then the wedges reshape.
  const data = useDeferredValue(dataProp);
  const series = useDeferredValue(seriesProp);
  const scale = useDeferredValue(scaleProp);

  const n = data.length;
  const { rows: plotRows, series: shown } = useMemo(
    () => foldPolarSeries(data, series, t.other),
    [data, series, t.other],
  );
  // Stacked values per wedge: [wedge][series] = cumulative top.
  const stacks = useMemo(
    () =>
      plotRows.map((row) => {
        let at = 0;
        return shown.map((s) => (at += Math.max(0, num(row[s.key]))));
      }),
    [plotRows, shown],
  );
  const max = stacks.reduce((m, st) => Math.max(m, st[st.length - 1] ?? 0), 0);
  const ticks = useMemo(() => niceTicks(0, max, 3), [max]);
  const top = ticks[ticks.length - 1] ?? 1;

  const readouts: Readout[] = useMemo(
    () =>
      plotRows.map((row) => ({
        title: String(row[index] ?? ""),
        rows: [
          ...shown.map((s, si) => ({
            label: s.label,
            value: format(Math.max(0, num(row[s.key]))),
            color: roseColor(s, si),
            kind: "rect" as const,
          })),
          ...(shown.length > 1
            ? [
                {
                  label: t.total,
                  value: format(shown.reduce((sum, s) => sum + Math.max(0, num(row[s.key])), 0)),
                  color: "transparent",
                },
              ]
            : []),
        ],
      })),
    [plotRows, shown, index, format, t.total],
  );
  const dock = docked ? dockSpace(width, readouts) : 0;

  // Geometry: the rose is centred and as large as fits, with room around it for the names.
  const longest = data.reduce((m, row) => Math.max(m, String(row[index] ?? "").length), 0);
  const labelRoom = Math.min(64, longest * CHAR_W * 0.75 + 18);
  const size = Math.max(0, Math.min(width, height - dock));
  const R = Math.max(0, size / 2 - labelRoom);
  const r0 = R * HOLE;
  const cx = width / 2;
  const cy = dock + (height - dock) / 2;
  const radiusOf = useCallback(
    (v: number) => {
      const k = clamp(top > 0 ? v / top : 0, 0, 1);
      return scale === "area" ? Math.sqrt(r0 * r0 + (R * R - r0 * r0) * k) : r0 + (R - r0) * k;
    },
    [top, scale, r0, R],
  );
  const step = n > 0 ? TAU / n : TAU;

  /*
   * Radii tween: the entrance blooms wedge by wedge, clockwise; data changes reshape together.
   * One clock MotionValue drives it: every wedge's path is derived from it (useTransform), so the
   * bloom never re-renders React. Resizes snap; only data changes animate.
   */
  const target = useMemo(() => stacks.flat().map((v) => radiusOf(v)), [stacks, radiusOf]);
  const per = shown.length;
  const morph = useRef<{ from: number[]; to: number[]; drawn: number[] }>({
    from: target.map(() => r0),
    to: target,
    drawn: target.map(() => r0),
  });
  // Bumped when a new target is adopted, so the wedges redraw even when the clock does not move (a resize, reduced motion).
  const adopted = useMotionValue(0);
  // A new target: the tween starts from what is drawn now. A layout effect, declared before the one that starts the clock.
  useLayoutEffect(() => {
    if (morph.current.to === target) return;
    morph.current = { from: morph.current.drawn, to: target, drawn: morph.current.drawn };
    adopted.set(adopted.get() + 1);
  }, [target, adopted]);
  const timing = useRef<{ lag: number; span: number; n: number; per: number; r0: number }>({
    lag: 0,
    span: duration.slower,
    n,
    per,
    r0,
  });
  const clock = useMotionValue(0);
  const radii = useTransform([clock, adopted], ([time = 0]: number[]) => {
    const m = morph.current;
    const tm = timing.current;
    const next = m.to.map((v, i) => {
      const w = Math.floor(i / Math.max(1, tm.per));
      const local = bloomCurve((time - w * tm.lag) / Math.max(1e-6, tm.span - tm.lag * tm.n));
      const s0 = m.from[i] ?? tm.r0;
      return s0 + (v - s0) * local;
    });
    m.drawn = next;
    return next;
  });
  const sized = width > 0;
  const dataKey = `${stacks.map((st) => st.join(",")).join("|")}|${scale}|${top}`;
  const entered = useRef(false);
  const lastData = useRef(dataKey);
  useLayoutEffect(() => {
    if (!play || !sized) return;
    const changed = lastData.current !== dataKey;
    lastData.current = dataKey;
    if (reduced || (entered.current && !changed)) {
      entered.current = true;
      clock.jump(SETTLED);
      return;
    }
    const first = !entered.current;
    entered.current = true;
    const lag = first ? Math.min(0.06, 0.6 / Math.max(1, n)) : 0;
    const span = (first ? duration.slower : duration.slow) + lag * n;
    timing.current = { lag, span, n, per, r0 };
    clock.jump(0);
    const controls = animate(clock, span, { duration: span, ease: "linear" });
    return () => controls.stop();
  }, [play, sized, reduced, target, dataKey, n, per, r0, clock]);

  if (n === 0 || shown.length === 0 || max <= 0) {
    return (
      <div ref={measureRef} className={cn("w-full", className)}>
        <ChartEmpty height={height} aria-label={ariaLabel}>
          {emptyState ?? t.empty}
        </ChartEmpty>
      </div>
    );
  }

  const act = active !== null && active < n ? active : null;
  const readout = act !== null ? readouts[act] : undefined;
  const announceText = readout
    ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}`
    : "";
  const r = (i: number, si: number) => target[i * per + si] ?? r0;

  // Names around the outside: drop any that would overlap one already placed.
  const placed: [number, number, number, number][] = [];
  const names = data.map((row, i) => {
    const text = truncate(String(row[index] ?? ""), 14);
    const a = (i + 0.5) * step;
    const [x, y] = polar(cx, cy, R + 12, a);
    const sin = Math.sin(a);
    const anchor: "middle" | "start" | "end" = Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "start" : "end";
    const w = text.length * CHAR_W;
    const left = anchor === "middle" ? x - w / 2 : anchor === "start" ? x : x - w;
    const ty = y + Math.cos(a) * -4; // nudge away from the rose at top / bottom
    const box: [number, number, number, number] = [left - 3, ty - 8, left + w + 3, ty + 8];
    const clear = placed.every(([l, tp, rr, b]) => box[2] < l || box[0] > rr || box[3] < tp || box[1] > b);
    const inside = box[0] >= 0 && box[2] <= width;
    if (clear && inside) placed.push(box);
    return { text, x, y: ty, anchor, show: clear && inside };
  });

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    fromPointer();
    const x = event.clientX - rect.left - cx;
    const y = event.clientY - rect.top - cy;
    const dist = Math.hypot(x, y);
    if (event.pointerType === "mouse" && dist > R + 10) {
      setActive(null);
      return;
    }
    let a = Math.atan2(x, -y);
    if (a < 0) a += TAU;
    setActive(clamp(Math.floor(a / step), 0, n - 1));
  }

  // Tooltip anchor: the outer middle of the active wedge.
  const anchor = (() => {
    if (act === null) return null;
    const outer = r(act, shown.length - 1);
    const [x, y] = polar(cx, cy, outer, (act + 0.5) * step);
    return { x: x - 4, y: y - 4, w: 8, h: 8 };
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
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
            // Drawn in px, so it never mirrors (RTL); dragging around it scrubs, vertical swipes scroll.
            style={{ direction: "ltr", touchAction: "pan-y pinch-zoom" }}
            onKeyDown={(e) => {
              fromKeyboard();
              chartKeyHandler(n, act, setActive)(e);
            }}
            onBlur={() => setActive(null)}
          >
            <defs>
              {shown.map((s, si) => {
                const color = roseColor(s, si);
                return (
                  <radialGradient
                    key={si}
                    id={`${id}-g${si}`}
                    gradientUnits="userSpaceOnUse"
                    cx={cx}
                    cy={cy}
                    r={Math.max(1, R)}
                  >
                    <stop offset={HOLE} stopColor={color} stopOpacity={0.42} />
                    <stop offset={0.7} stopColor={color} stopOpacity={0.82} />
                    <stop offset={1} stopColor={color} stopOpacity={1} />
                  </radialGradient>
                );
              })}
            </defs>
            <g aria-hidden>
              {/* Rings at round values, and a hairline spoke per wedge boundary. */}
              {ticks.slice(1).map((tk) => (
                <circle key={tk} cx={cx} cy={cy} r={radiusOf(tk)} fill="none" stroke="var(--sheen-chart-grid)" />
              ))}
              {n > 1 &&
                data.map((_, i) => {
                  const [x1, y1] = polar(cx, cy, r0, i * step);
                  const [x2, y2] = polar(cx, cy, R, i * step);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--sheen-chart-grid)" />;
                })}

              <g className="forced-color-adjust-none">
                {data.map((_, i) => {
                  const lit = act === i;
                  const dim = act !== null && !lit;
                  const mid = (i + 0.5) * step;
                  // The active wedge eases outwards along its bisector (a transform).
                  const push = lit && !reduced ? 4 : 0;
                  return (
                    <g
                      key={i}
                      className="motion-ok:transition-[transform,opacity] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out"
                      style={{
                        transform: `translate(${f(Math.sin(mid) * push)}px, ${f(-Math.cos(mid) * push)}px)`,
                        opacity: dim ? 0.38 : 1,
                      }}
                    >
                      {shown.map((s, si) => (
                        <Segment
                          key={si}
                          radii={radii}
                          outer={i * per + si}
                          inner={si === 0 ? -1 : i * per + si - 1}
                          cx={cx}
                          cy={cy}
                          r0={r0}
                          a0={i * step}
                          a1={(i + 1) * step}
                          round={si === per - 1 ? 4 : 0}
                          fill={`url(#${id}-g${si})`}
                          strokeWidth={n > 1 || per > 1 ? 2 : 0}
                          glow={lit ? markGlow(roseColor(s, si), 8) : undefined}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>

              {/* Ring values just inside each ring on the 12 o'clock spoke, haloed so they read over the wedges. */}
              {ticks.slice(1).map((tk) => {
                const rr = radiusOf(tk);
                if (rr - r0 < 18) return null;
                return (
                  <text
                    key={tk}
                    x={cx + 4}
                    y={cy - rr + 12}
                    className="fill-sheen-fg-muted text-2xs tabular-nums"
                    stroke="var(--sheen-chart-surface)"
                    strokeWidth={3}
                    paintOrder="stroke"
                    strokeLinejoin="round"
                  >
                    {format(tk)}
                  </text>
                );
              })}

              {names.map((nm, i) =>
                nm.show ? (
                  <text
                    key={i}
                    x={nm.x}
                    y={nm.y}
                    dy="0.32em"
                    textAnchor={nm.anchor}
                    className={cn("text-2xs", act === i ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted")}
                  >
                    {nm.text}
                  </text>
                ) : null,
              )}
            </g>

            {/* Hit area: the whole chart; dragging around it scrubs on touch (vertical swipes still scroll). */}
            <rect
              width={width}
              height={height}
              fill="transparent"
              onPointerDown={onPointer}
              onPointerMove={onPointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </ChartFigure>
        )}

        {docked && act === null && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
        {readout && anchor && (
          <ChartTip
            title={readout.title}
            rows={readout.rows}
            anchor={anchor}
            bounds={{ w: width, h: height }}
            docked={docked}
          />
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of PolarAreaTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type PolarAreaTableProps = Pick<
  PolarAreaChartProps,
  "data" | "index" | "series" | "format" | "locale" | "labels"
> & {
  /** Sets the header of the first column. */
  indexLabel?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
};

/**
 * One row per wedge, one column per series, plus the total when there are several.
 *
 * Props: the chart's `data`, `index`, `series`, `format`, `locale` and `labels`, plus `indexLabel` (first column header) and `caption` (hidden, names the table). One row per wedge and one column per series, with a total when there are several. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { PolarAreaTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PolarAreaTable data={[{ month: "Jan", rain: 80 }, { month: "Feb", rain: 55 }]} index="month" series={[{ key: "rain", label: "Rainfall (mm)" }]} indexLabel="Month" caption="Rainfall by month" />
 *   );
 * }
 * ```
 *
 * @see /charts/polar-area
 */
export function PolarAreaTable({
  data,
  index,
  series,
  format: formatProp,
  locale,
  labels: labelOverrides,
  indexLabel,
  caption,
}: PolarAreaTableProps) {
  const t = { ...defaultPolarAreaChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const { rows, series: shown } = useMemo(() => foldPolarSeries(data, series, t.other), [data, series, t.other]);
  // The first rows render with the tab switch and the rest right after it, so opening the table stays instant.
  const { rows: firstRows } = useTableRows(rows, { first: 12, cap: Infinity });
  return (
    <SeriesTable
      data={firstRows}
      index={index}
      indexLabel={indexLabel}
      caption={caption}
      format={format}
      noData={t.empty}
      plotted={(v) => Math.max(0, v)}
      columns={shown.map((s, i) => ({ key: s.key, label: s.label, color: roseColor(s, i) }))}
      total={shown.length > 1 ? { label: t.total, keys: shown.map((s) => s.key) } : undefined}
    />
  );
}
