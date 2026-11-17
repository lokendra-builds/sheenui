"use client";

import { memo, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { animate, cubicBezier, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { useSyncRef } from "../../../hooks/use-latest";
import { duration } from "../../../motion/tokens";
import { type LegendItem } from "../chart-parts";
import { resolvePatterns } from "../chart-patterns";
import {
  changeEase,
  clamp,
  enterEase,
  exitTransition,
  MAX_SERIES,
  num,
  seriesColor,
  slotColor,
  type ChartRow,
  type ChartSeries,
  ORIGIN_PT,
  type ChartInstructions,
  monotoneTangents,
  type Pt,
} from "../chart-utils";
import { markGlow } from "../category-bar";

/* ======================================================================
 * Curves (shared with the ridgeline chart)
 * ====================================================================== */

/** @internal A point in px. */
export type { Pt };
export { monotoneTangents };
/** Formats a number to one decimal for path data, mapping non-finite values to 0. @internal */
export const f = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "0");

/**
 * @internal Cubic segments through the points (no initial move): one per neighbouring pair, so
 * two curves over the same xs share a command structure and Motion can morph between them.
 * `reverse` walks the same curve backwards (for closing an area along its lower edge).
 */
export function curveSegments(pts: readonly Pt[], reverse = false) {
  if (pts.length < 2) return "";
  const t = monotoneTangents(pts);
  const parts: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i] ?? ORIGIN_PT;
    const [x1, y1] = pts[i + 1] ?? ORIGIN_PT;
    const dx = (x1 - x0) / 3;
    const c1: Pt = [x0 + dx, y0 + dx * (t[i] ?? 0)];
    const c2: Pt = [x1 - dx, y1 - dx * (t[i + 1] ?? 0)];
    parts.push(
      reverse
        ? `C${f(c2[0])},${f(c2[1])} ${f(c1[0])},${f(c1[1])} ${f(x0)},${f(y0)}`
        : `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(x1)},${f(y1)}`,
    );
  }
  return (reverse ? parts.reverse() : parts).join(" ");
}

/** @internal A closed area between an upper and a lower edge over the same xs. One point: a thin sliver. */
export function bandArea(top: readonly Pt[], bottom: readonly Pt[]) {
  const first = top[0];
  const last = bottom[bottom.length - 1];
  if (!first || !last) return "";
  if (top.length === 1) {
    const b = bottom[0] ?? ORIGIN_PT;
    return `M${f(first[0] - 6)},${f(first[1])} L${f(first[0] + 6)},${f(first[1])} L${f(b[0] + 6)},${f(b[1])} L${f(b[0] - 6)},${f(b[1])} Z`;
  }
  return `M${f(first[0])},${f(first[1])} ${curveSegments(top)} L${f(last[0])},${f(last[1])} ${curveSegments(bottom, true)} Z`;
}

/** @internal An open curve through the points. */
export function curvePath(pts: readonly Pt[]) {
  const first = pts[0];
  return first ? `M${f(first[0])},${f(first[1])} ${curveSegments(pts)}` : "";
}

/* ======================================================================
 * Morphs on one clock (shared with the ridgeline chart)
 * ====================================================================== */

/** @internal A clock value past every tween: shapes are drawn at their targets. */
export const SETTLED = 1e9;

/** @internal When a shape's tween starts on the clock (s), how long it takes (s), and its easing. */
export type MorphTiming = { delay: number; span: number; ease: (k: number) => number };

/**
 * @internal Points that tween from what is drawn now to `target` on a shared `clock` MotionValue
 * (seconds since the current tween started; SETTLED when idle). `enter` is where a new shape
 * starts (a flat or centre line). Path strings are built from the points in useTransform, so a
 * morph never re-renders React and Motion never has to parse or mix path strings: one clock
 * drives every shape of the chart. `timing` is read on every frame (it may change between the
 * entrance and later updates).
 *
 * Arguments: `target` (the points to reach), `enter` (where a new shape starts, e.g. a flat line), `clock` (a MotionValue in seconds, SETTLED when idle) and `timing()` ({ delay, span, ease } of this shape's tween). Returns a MotionValue of the points currently drawn; build the path string from it with `useTransform`. Not a component: no DOM, keyboard or screen-reader behaviour. With reduced motion the clock is set to SETTLED, so shapes sit at their targets.
 *
 * @example
 * ```tsx
 * import { useMotionValue } from "motion/react";
 * import { SETTLED, useMorphClock, useMorphPoints, type Pt } from "./model";
 *
 * function Shape({ target, play, reduced, version }: { target: Pt[]; play: boolean; reduced: boolean; version: string }) {
 *   const clock = useMotionValue(SETTLED);
 *   const flat: Pt[] = target.map(([x]) => [x, 0]);
 *   const points = useMorphPoints(target, flat, clock, () => ({ delay: 0, span: 0.6, ease: (k) => k }));
 *   useMorphClock(clock, { play, ready: true, reduced, signature: "", version, entrance: 0.8, change: 0.5 });
 *   return <p>{points.get().length} points</p>;
 * }
 * ```
 *
 * @see /charts/streamgraph
 */
export function useMorphPoints(
  target: readonly Pt[],
  enter: readonly Pt[],
  clock: MotionValue<number>,
  timing: () => MorphTiming,
) {
  const state = useRef<{ from: readonly Pt[]; to: readonly Pt[]; drawn: readonly Pt[] }>({
    from: enter,
    to: target,
    drawn: enter,
  });
  // Bumped when a new target is adopted, so a shape redraws even when the clock does not move (a resize, or reduced motion).
  const adopted = useMotionValue(0);
  // A new target: the tween starts from what is drawn now. Done in a layout effect, before the chart's clock (declared after the shapes) starts.
  useLayoutEffect(() => {
    if (state.current.to === target) return;
    state.current = { from: state.current.drawn, to: target, drawn: state.current.drawn };
    adopted.set(adopted.get() + 1);
  }, [target, adopted]);
  const timingRef = useRef(timing);
  useSyncRef(timingRef, timing);
  return useTransform([clock, adopted], ([c = 0]: number[]) => {
    const s = state.current;
    const { delay, span, ease } = timingRef.current();
    const k = span <= 0 ? 1 : clamp((c - delay) / span, 0, 1);
    const pts = k >= 1 ? s.to : k <= 0 ? s.from : lerpPoints(s.from, s.to, ease(k));
    s.drawn = pts;
    return pts;
  });
}

/** Points part-way from `a` to `b` (any lengths: missing ones start from the nearest end). */
export function lerpPoints(a: readonly Pt[], b: readonly Pt[], k: number): Pt[] {
  return b.map(([bx, by], i) => {
    const [ax, ay] = a[i] ?? a[a.length - 1] ?? [bx, by];
    return [ax + (bx - ax) * k, ay + (by - ay) * k] as const;
  });
}

/**
 * @internal Runs a chart's clock: the entrance once it plays, a tween on every data change, and
 * a snap (no animation) on resizes or under reduced motion. Call after the shapes' hooks.
 *
 * Arguments: the shared `clock` and `{ play, ready, reduced, signature, version, entrance, change }`: start when `play` and `ready` are true, `signature` is a string that changes with the data (a resize leaves it alone), `version` changes with the drawn shapes, and `entrance` / `change` are the tween lengths in seconds. Returns a ref holding the running phase ("enter" or "change"). Not a component: no DOM, keyboard or screen-reader behaviour. Under reduced motion, or on a resize, the clock jumps to SETTLED.
 *
 * @example
 * ```tsx
 * import { useMotionValue } from "motion/react";
 * import { SETTLED, useMorphClock } from "./model";
 *
 * function Clock({ play, reduced, version }: { play: boolean; reduced: boolean; version: string }) {
 *   const clock = useMotionValue(SETTLED);
 *   const phase = useMorphClock(clock, { play, ready: true, reduced, signature: "", version, entrance: 0.8, change: 0.5 });
 *   return <p>{phase.current}</p>;
 * }
 * ```
 *
 * @see /charts/streamgraph
 */
export function useMorphClock(
  clock: MotionValue<number>,
  {
    play,
    ready,
    reduced,
    signature,
    version,
    entrance,
    change,
  }: {
    play: boolean;
    ready: boolean;
    reduced: boolean;
    /** A cheap string that changes when the data does (a resize leaves it alone). */
    signature: string;
    /** Anything that changes the drawn shapes (data, layout). */
    version: unknown;
    /** Total length of the entrance and of a data-change tween, in seconds. */
    entrance: number;
    change: number;
  },
) {
  const entered = useRef(false);
  const lastSignature = useRef(signature);
  /** Which tween the clock is running: shapes pick their delay and length from it. */
  const phase = useRef<"enter" | "change">("enter");
  useLayoutEffect(() => {
    // The data changed since the last run (a resize is not a change).
    const changed = lastSignature.current !== signature;
    lastSignature.current = signature;
    if (!play || !ready) return;
    if (reduced || (entered.current && !changed)) {
      entered.current = true;
      clock.jump(SETTLED);
      return;
    }
    phase.current = entered.current ? "change" : "enter";
    const total = entered.current ? change : entrance;
    entered.current = true;
    clock.jump(0);
    const controls = animate(clock, total, { duration: total, ease: "linear" });
    return () => controls.stop();
  }, [play, ready, reduced, version, signature, clock, entrance, change]);
  return phase;
}

/* ======================================================================
 * Stack layout
 * ====================================================================== */

/**
 * Inside-out order (Byron & Wattenberg): series that peak early and late go to the edges, the
 * ones peaking mid-way sit in the middle, balancing the two sides by total. Returns series
 * indices from the bottom layer up.
 *
 * @see /charts/streamgraph
 */
export function insideOutOrder(values: number[][]) {
  const peaks = values.map((v) => v.reduce((best, x, i) => (x > (v[best] ?? -Infinity) ? i : best), 0));
  const sums = values.map((v) => v.reduce((s, x) => s + x, 0));
  const byPeak = values.map((_, i) => i).sort((a, b) => (peaks[a] ?? 0) - (peaks[b] ?? 0) || a - b);
  let top = 0;
  let bottom = 0;
  const tops: number[] = [];
  const bottoms: number[] = [];
  for (const i of byPeak) {
    if (top < bottom) {
      top += sums[i] ?? 0;
      tops.push(i);
    } else {
      bottom += sums[i] ?? 0;
      bottoms.push(i);
    }
  }
  return [...bottoms.reverse(), ...tops];
}

/**
 * Baseline per x of a stream: "wiggle" minimises the layers' weighted slope (Byron &
 * Wattenberg's streamgraph, as d3's stackOffsetWiggle); "silhouette" centres the stack on zero.
 * `values` are in stacking order.
 *
 * @see /charts/streamgraph
 */
export function streamBaseline(values: number[][], offset: "wiggle" | "silhouette") {
  const m = values[0]?.length ?? 0;
  const total = (j: number) => values.reduce((s, v) => s + (v[j] ?? 0), 0);
  if (offset === "silhouette") return Array.from({ length: m }, (_, j) => -total(j) / 2);
  const g = new Array<number>(m).fill(0);
  for (let j = 1; j < m; j++) {
    let s1 = 0;
    let s2 = 0;
    let below = 0;
    for (const v of values) {
      const now = v[j] ?? 0;
      const dv = now - (v[j - 1] ?? 0);
      s1 += now;
      s2 += now * (below + dv / 2);
      below += dv;
    }
    g[j] = (g[j - 1] ?? 0) - (s1 ? s2 / s1 : 0);
  }
  // Centre the whole stream on zero, so its drift doesn't decide the axis.
  const mid = g.reduce((s, b, j) => s + b + total(j) / 2, 0) / Math.max(1, m);
  return g.map((b) => b - mid);
}

/* ======================================================================
 * Streamgraph
 * ====================================================================== */

/**
 * Every string Streamgraph speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type StreamgraphLabels = {
  instructions: ChartInstructions;
  /** Tooltip row for the sum of every layer. */
  total: string;
  /** Name of the layer that folds everything past the 8th series. */
  other: string;
  /** Touch screens: the hint in the readout band before anything is read. */
  touchHint: string;
  empty: string;
};

/**
 * The built-in English strings of Streamgraph; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultStreamgraphLabels: StreamgraphLabels = {
  instructions: "Use left and right arrow keys to move through time, up and down to pick a layer.",
  total: "Total",
  other: "Other",
  touchHint: "Tap or drag across the chart to read values",
  empty: "No data",
};

/**
 * Props of Streamgraph. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type StreamgraphProps = {
  /** One row per x value (e.g. per week). */
  data: readonly ChartRow[];
  /** Key of the x value in each row. */
  index: string;
  /** The layers. Up to 8 keep their colour slot; any more fold into “Other”. */
  series: readonly ChartSeries[];
  /** "wiggle" (default): the classic streamgraph, as flat as possible. "silhouette": mirrored around a centre line. */
  offset?: "wiggle" | "silhouette";
  /** "insideOut" (default) puts layers that peak mid-way in the middle; "none" keeps `series` order (bottom up). */
  order?: "insideOut" | "none";
  /** Name each layer inside its thickest stretch, when it fits. Default true. */
  inlineLabels?: boolean;
  /** Height of the chart in px; the width follows the container. Default 300. */
  height?: number;
  /** Formats a value for the tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats shares of the total. Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell layers apart without colour (hatch fills; the first layer stays solid). Default: on when the chart has more
   * than 3 layers.
   *
   * @default true when layers > 3
   */
  patterns?: boolean;
  /** Override the chart's strings (i18n). */
  labels?: Partial<StreamgraphLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The key of the folded other layer. @internal */
export const OTHER = "__other";
/** The average glyph width of the inline layer labels, in pixels. @internal */
export const CHAR_W = 6.8; // average glyph width of the 12px medium inline labels
/** The average glyph width of the x-axis labels, in pixels. @internal */
export const LABEL_CHAR_W = 6.2; // the 11px x-axis labels

/** Builds an easing function from four cubic-bezier numbers. @internal */
export const bezier = (e: readonly number[]) => cubicBezier(e[0] ?? 0, e[1] ?? 0, e[2] ?? 1, e[3] ?? 1);
/** The enter easing as a function. @internal */
export const enterCurve = bezier(enterEase);
/** The data-change easing as a function. @internal */
export const changeCurve = bezier(changeEase);

/**
 * One layer of the stream and its sheen. Both follow one morphing outline (top edge, then the
 * bottom edge), so a data change or the entrance never re-renders React per frame. The shape is
 * memoised apart from its emphasis: hovering another layer only flips data attributes on this
 * group (CSS dims the sheen and lights the glow), so no path is rebuilt on a hover.
 */
export const StreamLayer = memo(function StreamLayer({
  lit,
  dim,
  reduced,
  ...shape
}: StreamShapeProps & { lit: boolean; dim: boolean; reduced: boolean }) {
  return (
    <motion.g
      data-layer-lit={lit ? "" : undefined}
      data-layer-dim={dim ? "" : undefined}
      initial={{ opacity: 1 }}
      animate={{ opacity: dim ? 0.32 : 1 }}
      exit={{ opacity: 0, transition: reduced ? { duration: 0 } : exitTransition }}
      transition={{ opacity: { duration: reduced ? 0 : duration.fast } }}
    >
      <StreamShape {...shape} />
    </motion.g>
  );
});

/** The props of one stream layer shape. @internal */
export type StreamShapeProps = {
  top: readonly Pt[];
  bottom: readonly Pt[];
  mid: readonly Pt[];
  clock: MotionValue<number>;
  /** Timing of the layer at `order` (stable function; reads the chart's current phase). */
  timing: (order: number) => MorphTiming;
  order: number;
  color: string;
  /** Fill of the layer itself (a hatch pattern url); `color` when unset. */
  fill?: string;
  /** Fill of the sheen over the layer. */
  sheen: string;
  stroke: number;
};

/** One stream layer, drawn as an animated path. @internal */
export const StreamShape = memo(function StreamShape({
  top,
  bottom,
  mid,
  clock,
  timing,
  order,
  color,
  fill,
  sheen,
  stroke,
}: StreamShapeProps) {
  const target = useMemo(() => [...top, ...bottom], [top, bottom]);
  const enter = useMemo(() => [...mid, ...mid], [mid]);
  const pts = useMorphPoints(target, enter, clock, () => timing(order));
  const d = useTransform(pts, (p: readonly Pt[]) => {
    const half = p.length / 2;
    return bandArea(p.slice(0, half), p.slice(half));
  });
  return (
    <>
      <motion.path
        d={d}
        fill={fill ?? color}
        stroke="var(--sheen-chart-surface)"
        strokeWidth={stroke}
        strokeLinejoin="round"
        className="forced-colors:stroke-[CanvasText] in-data-layer-lit:[filter:var(--layer-glow)]"
        style={{ "--layer-glow": markGlow(color, 7) } as React.CSSProperties}
      />
      {/* The sheen sits over the layer as its own shape, so it never changes the colour key. */}
      <motion.path
        d={d}
        pointerEvents="none"
        fill={sheen}
        className="forced-colors:hidden in-data-layer-dim:opacity-0 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
      />
    </>
  );
});

/** Fold series past the 8th into one "Other" layer (neutral grey). Returns rows with its value added.
 *
 * @see /charts/streamgraph
 */
export function foldStreamSeries(
  data: readonly ChartRow[],
  series: readonly ChartSeries[],
  otherLabel = defaultStreamgraphLabels.other,
) {
  if (series.length <= MAX_SERIES) return { rows: data, series };
  const kept = series
    .slice(0, MAX_SERIES - 1)
    .map((s, i) => ({ ...s, color: s.color ?? ((i + 1) as ChartSeries["color"]) }));
  const rest = series.slice(MAX_SERIES - 1);
  const rows: ChartRow[] = data.map((row) => ({
    ...row,
    [OTHER]: rest.reduce((sum, s) => sum + Math.max(0, num(row[s.key])), 0),
  }));
  return { rows, series: [...kept, { key: OTHER, label: otherLabel }] };
}

/** The colour of a layer, with the other layer in the neutral slot. @internal */
export const layerColor = (s: ChartSeries, i: number) => (s.key === OTHER ? slotColor(0) : seriesColor(s, i));

/** Legend for a streamgraph: one swatch per layer, as folded.
 *
 * @see /charts/streamgraph
 */
export function streamgraphLegend(
  series: readonly ChartSeries[],
  otherLabel?: string,
  /** Hatch the swatches like the chart's `patterns` prop. Default: on from 4 layers, as in the chart. */
  patterns?: boolean,
): LegendItem[] {
  const layers = foldStreamSeries([], series, otherLabel).series;
  const hatched = resolvePatterns(patterns, layers.length);
  return layers.map((s, i) => ({
    label: s.label,
    color: layerColor(s, i),
    kind: "rect",
    pattern: hatched && i > 0 ? i : undefined,
  }));
}
