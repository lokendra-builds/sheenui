"use client";

import type { ChartRoot } from "./chart-utils";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease, spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { ChartAnnouncer, ChartLegend, LegendKey } from "./chart-parts";
import {
  chartFades,
  DockHint,
  dockHintHeight,
  dockSpace,
  FittedTooltip,
  TableScroll,
  useDockedReadout,
  useInputSource,
  withMinimum,
  type Readout,
} from "./chart-fit";
import {
  chartFocusClass,
  chartKeyHandler,
  clamp,
  formatCompact,
  MAX_SERIES,
  num,
  slotColor,
  truncate,
  useElementWidth,
  useTweenedNumbers,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";

/** One slice of a PieChart: a label, a value, an optional palette slot and a stable key. */
export type PieSlice = {
  label: string;
  /** Zero and negative values are not drawn (the table still lists them). */
  value: number;
  /** Colour slot 1–8. Defaults to the slice's position in `data` (never its rank). */
  color?: ChartColor;
};

/** Every string the chart shows or announces, for translation. */
export type PieChartLabels = {
  /** The slice that folds in everything past `maxSlices`. */
  other: string;
  /** Marks a table row that is drawn inside "Other". */
  inOther: string;
  /** Last row of the "Other" tooltip when it holds more slices than it lists: "+3 more". */
  more: string;
  /** Table headers and footer. */
  slice: string;
  value: string;
  share: string;
  total: string;
  /** Shown when every value is 0. */
  noData: string;
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a slice is active. */
  touchHint: string;
};

/**
 * The built-in English strings of PieChart; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultPieChartLabels: PieChartLabels = {
  other: "Other",
  inOther: "in Other",
  more: "more",
  slice: "Slice",
  value: "Value",
  share: "Share",
  total: "Total",
  noData: "No data",
  instructions: "Use arrow keys to read each slice.",
  touchHint: "Tap a slice to read it.",
};

/**
 * Props of PieChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type PieChartProps = {
  /** Part-to-whole only. Past `maxSlices`, the smallest slices fold into one "Other" slice. */
  data: readonly PieSlice[];
  /** At most this many slices are drawn (2–6). Default 6. */
  maxSlices?: number;
  /** Height of the pie area (the legend sits below it). */
  height?: number;
  /** Name each slice outside the pie with a leader line, only where the label fits without colliding. */
  outerLabels?: boolean;
  /** Legend under the pie with each slice's share. Default true. */
  legend?: boolean;
  /** Formats values in the tooltip and legend. Default compact numbers. */
  format?: (n: number) => string;
  /** Formats each share (a number from 0 to 100) for the labels and tooltip. */
  formatPercent?: (n: number) => string;
  /** Shown instead of the pie when there is nothing to plot. Defaults to labels.noData. */
  emptyState?: ReactNode;
  /**
   * Tell slices apart without colour (hatch fills). Default: on when the pie has more than 3 slices.
   *
   * @default true when data.length > 3
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<PieChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** A slice after small ones are folded into "Other": a stable id, label, value, share and colour. */
export type FoldedSlice = {
  /** Stable identity (label + occurrence; "Other" has its own), so a slice tweens as itself when the data changes. */
  id: string;
  label: string;
  value: number;
  /** 0–100. */
  share: number;
  color: string;
  /** The palette slot behind `color` (0 = neutral "Other"). */
  slot: number;
  other: boolean;
  /** For "Other": the slices folded into it. */
  members: PieSlice[];
  /** Positions in `data` this slice stands for (one, or every member of "Other"). */
  indexes: number[];
};

const MAX_PIE_SLICES = 6;
const MAX_MEMBERS = 5; // members of "Other" listed by name in its tooltip
const MAX_MEMBERS_DOCKED = 3; // ... and in the docked readout on touch screens, which has less room
const START = -Math.PI / 2;
const TURN = Math.PI * 2;
const GAP = 1; // half the 2px surface gap: each slice gives up 1px on each side
const POP = 6; // how far the active slice moves out
const MIN_ANGLE = 0.06; // ~3.4°: the smallest slice still draws a visible sliver after its gaps
const CHAR_W = 6.4;
const OTHER_ID = "\u0000other";
const percentFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const defaultFormatPercent = (n: number) => `${percentFormatter.format(n)}%`;

/**
 * Colour slots for the slices that are drawn, so no two ever share a colour:
 * 1. a slice's own `color`;
 * 2. else its position in `data` (slot i + 1), unless any item claims that slot as its own colour;
 * 3. else the first slot nobody claims (own colours of folded items are only borrowed last).
 * Never a duplicate, never by rank; 0 (neutral) only if all 8 are taken.
 */
function assignSlots(data: readonly PieSlice[], drawn: readonly number[]): Map<number, number> {
  const valid = (c: unknown): c is ChartColor =>
    typeof c === "number" && Number.isInteger(c) && c >= 1 && c <= MAX_SERIES;
  const claimed = new Set(data.map((d) => d.color).filter(valid));
  const taken = new Set<number>();
  const slots = new Map<number, number>();
  for (const i of drawn) {
    const own = data[i]?.color;
    if (valid(own)) {
      slots.set(i, own);
      taken.add(own);
    }
  }
  for (const i of drawn) {
    if (slots.has(i)) continue;
    const slot = i + 1;
    if (i < MAX_SERIES && !claimed.has(slot as ChartColor) && !taken.has(slot)) {
      slots.set(i, slot);
      taken.add(slot);
    }
  }
  const all = Array.from({ length: MAX_SERIES }, (_, k) => k + 1);
  const pool = [
    ...all.filter((s) => !claimed.has(s as ChartColor)),
    ...all.filter((s) => claimed.has(s as ChartColor)),
  ];
  for (const i of drawn) {
    if (slots.has(i)) continue;
    const slot = pool.find((s) => !taken.has(s)) ?? 0;
    slots.set(i, slot);
    if (slot) taken.add(slot);
  }
  return slots;
}

/**
 * The slices as drawn: every positive value, at most `maxSlices` of them. When there are more,
 * the largest `maxSlices - 1` keep their place and colour, and the rest fold into a neutral
 * "Other" slice at the end. Zero and negative values are not slices at all.
 */
export function foldSlices(
  data: readonly PieSlice[],
  maxSlices = MAX_PIE_SLICES,
  otherLabel = defaultPieChartLabels.other,
): FoldedSlice[] {
  const limit = clamp(Math.floor(maxSlices), 2, MAX_PIE_SLICES);
  const values = data.map((d) => Math.max(0, num(d.value)));
  const total = values.reduce((sum, v) => sum + v, 0);
  const share = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const seen = new Map<string, number>();
  const ids = data.map((d) => {
    const n = seen.get(d.label) ?? 0;
    seen.set(d.label, n + 1);
    return `${d.label}\u0001${n}`;
  });

  const positive = data.map((d, i) => ({ d, i, v: values[i] ?? 0 })).filter((x) => x.v > 0);
  const keep =
    positive.length <= limit
      ? new Set(positive.map((x) => x.i))
      : new Set(
          [...positive]
            .sort((a, b) => b.v - a.v || a.i - b.i)
            .slice(0, limit - 1)
            .map((x) => x.i),
        );
  const kept = positive.filter((x) => keep.has(x.i));
  const slots = assignSlots(
    data,
    kept.map((x) => x.i),
  );

  const slices: FoldedSlice[] = kept.map((x) => {
    const slot = slots.get(x.i) ?? 0;
    return {
      id: ids[x.i] ?? "",
      label: x.d.label,
      value: x.v,
      share: share(x.v),
      color: slotColor(slot),
      slot,
      other: false,
      members: [],
      indexes: [x.i],
    };
  });
  const rest = positive.filter((x) => !keep.has(x.i)).sort((a, b) => b.v - a.v || a.i - b.i);
  if (rest.length > 0) {
    const v = rest.reduce((sum, x) => sum + x.v, 0);
    slices.push({
      id: OTHER_ID,
      label: otherLabel,
      value: v,
      share: share(v),
      color: slotColor(0),
      slot: 0,
      other: true,
      members: rest.map((x) => x.d),
      indexes: rest.map((x) => x.i),
    });
  }
  return slices;
}

const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
const n2 = (v: number) => v.toFixed(2);

/**
 * A pie sector with a real (transparent) gap: each straight edge is moved GAP px into the
 * slice, parallel to itself, so neighbours sit exactly 2px apart all the way to the centre.
 */
function sectorPath(cx: number, cy: number, r: number, a0: number, a1: number, gap: number) {
  const theta = a1 - a0;
  if (theta <= 1e-4 || r <= 0) return "";
  if (theta >= TURN - 1e-4 || gap === 0) {
    if (theta >= TURN - 1e-4) {
      const [x0, y0] = pt(cx, cy, r, a0);
      const [x1, y1] = pt(cx, cy, r, a0 + Math.PI);
      return `M${n2(x0)},${n2(y0)} A${r},${r} 0 1 1 ${n2(x1)},${n2(y1)} A${r},${r} 0 1 1 ${n2(x0)},${n2(y0)} Z`;
    }
    const [sx, sy] = pt(cx, cy, r, a0);
    const [ex, ey] = pt(cx, cy, r, a1);
    return `M${n2(cx)},${n2(cy)} L${n2(sx)},${n2(sy)} A${r},${r} 0 ${theta > Math.PI ? 1 : 0} 1 ${n2(ex)},${n2(ey)} Z`;
  }
  const delta = Math.asin(Math.min(1, gap / r));
  const s = a0 + delta;
  const e = a1 - delta;
  if (e - s <= 1e-4) return "";
  const mid = (a0 + a1) / 2;
  const [sx, sy] = pt(cx, cy, r, s);
  const [ex, ey] = pt(cx, cy, r, e);
  const arc = `A${r},${r} 0 ${e - s > Math.PI ? 1 : 0} 1 ${n2(ex)},${n2(ey)}`;
  if (theta <= Math.PI) {
    // Convex slice: the two moved edges meet on the bisector.
    const apex = gap / Math.sin(theta / 2);
    if (apex >= r - 1) return "";
    const [ax, ay] = pt(cx, cy, apex, mid);
    return `M${n2(ax)},${n2(ay)} L${n2(sx)},${n2(sy)} ${arc} Z`;
  }
  // Reflex slice (> half): the moved edges are joined around the centre instead.
  const [q1x, q1y] = pt(cx, cy, gap, a1 - Math.PI / 2);
  const [mx, my] = pt(cx, cy, gap, mid);
  const [q0x, q0y] = pt(cx, cy, gap, a0 + Math.PI / 2);
  return `M${n2(sx)},${n2(sy)} ${arc} L${n2(q1x)},${n2(q1y)} L${n2(mx)},${n2(my)} L${n2(q0x)},${n2(q0y)} Z`;
}

type Label = {
  side: 1 | -1;
  y: number;
  anchor: readonly [number, number];
  elbow: readonly [number, number];
  endX: number;
  text: string;
  pct: string;
};

const LABEL_GAP = 16; // min distance between two outer labels on the same side
const MAX_NUDGE = 24; // how far a label may move off its slice to make room
const MIN_LEADER_SHARE = 5; // with a legend, slices under 5% are named there only

/**
 * Spread label positions (`wants`, any order) so neighbours are at least `gap` apart and all lie
 * within [lo, hi], moving each as little as possible. Null when they can't all fit.
 */
export function spreadLabels(wants: number[], gap: number, lo: number, hi: number): number[] | null {
  const order = wants.map((w, i) => ({ w, i })).sort((a, b) => a.w - b.w);
  const ys = order.map((o) => o.w);
  for (let k = 0; k < ys.length; k++) ys[k] = Math.max(ys[k] ?? 0, lo, k > 0 ? (ys[k - 1] ?? 0) + gap : -Infinity);
  for (let k = ys.length - 1; k >= 0; k--)
    ys[k] = Math.min(ys[k] ?? 0, hi, k < ys.length - 1 ? (ys[k + 1] ?? 0) - gap : Infinity);
  if (ys.length > 0 && (ys[0] ?? 0) < lo - 0.5) return null;
  const out = new Array<number>(wants.length);
  order.forEach((o, k) => (out[o.i] = ys[k] ?? 0));
  return out;
}

/* ---------- Identity tween ---------- */

type Span = { id: string; span: number; color: string };

/** One tween of the slices: which spans it starts from and ends at, and every slice drawn while it runs (leaving ones included). */
type SpanTween = {
  key: string;
  target: Span[];
  merged: Span[];
  from: Map<string, number>;
  to: Map<string, number>;
  moving: boolean;
};

function settledTween(target: Span[], key: string): SpanTween {
  return { key, target, merged: target, from: new Map(), to: new Map(), moving: false };
}

/** The spans at tween progress `k` (0..1): the target itself when nothing is moving. */
function spansAt(tween: SpanTween, k: number): Span[] {
  if (!tween.moving) return tween.target;
  return tween.merged.map((s) => {
    const a = tween.from.get(s.id) ?? 0;
    const b = tween.to.get(s.id) ?? 0;
    return { ...s, span: a + (b - a) * k };
  });
}

/** The tween from the spans on screen (`shown`) to `target`; settled at once when only colours changed or motion is reduced. */
function buildSpanTween(shown: Span[], target: Span[], key: string, instant: boolean): SpanTween {
  const sameShape =
    shown.length === target.length &&
    shown.every((s, i) => s.id === itemAt(target, i).id && Math.abs(s.span - itemAt(target, i).span) < 1e-6);
  if (instant || sameShape) return settledTween(target, key);
  // One sequence holding both: the new order, with each leaving slice kept after the
  // neighbour it followed before.
  const inTarget = new Set(target.map((s) => s.id));
  const merged: Span[] = [...target];
  shown.forEach((s, k) => {
    if (inTarget.has(s.id)) return;
    let p = k - 1;
    while (p >= 0 && !merged.some((m) => m.id === itemAt(shown, p).id)) p--;
    const at = p < 0 ? 0 : merged.findIndex((m) => m.id === itemAt(shown, p).id) + 1;
    merged.splice(at, 0, s);
  });
  return {
    key,
    target,
    merged,
    from: new Map(shown.map((s) => [s.id, s.span])),
    to: new Map(target.map((s) => [s.id, s.span])),
    moving: true,
  };
}

/**
 * Tween each slice's angular span BY IDENTITY: a slice that stays glides to its new size, a new
 * one grows from zero width in its place, a removed one shrinks away. Spans always add up to a
 * full turn, so slices never overlap or leave a hole mid-tween. Instant under reduced motion.
 *
 * The progress is a MotionValue: the chart paints each frame onto its paths and React commits only when a
 * tween starts or ends. `tween` says what is drawn (slices that are leaving included); `at(k)` gives the spans at a frame.
 */
function useTweenedSpans(target: Span[], instant: boolean) {
  const progress = useMotionValue(1);
  const key = target.map((s) => `${s.id}\u0001${s.span.toFixed(5)}\u0001${s.color}`).join("\u0002");
  const [tween, setTween] = useState(() => settledTween(target, key));
  // New target: derive the next tween from what is on screen now (adjusting state while rendering, no effect round-trip).
  let current = tween;
  if (tween.key !== key) {
    current = buildSpanTween(spansAt(tween, progress.get()), target, key, instant);
    setTween(current);
  }
  useLayoutEffect(() => {
    if (!current.moving) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: duration.slower,
      ease: ease.inOut,
      onComplete: () => setTween(settledTween(current.target, current.key)),
    });
    return () => controls.stop();
  }, [current, progress]);
  return { tween: current, progress };
}

type Sector = Span & { a0: number; a1: number; mid: number; d: string };

/** The geometry of `spans` drawn up to the angle `cap` (the entrance sweep): one sector per span, in order. */
function sectors(spans: Span[], cx: number, cy: number, r: number, cap: number): Sector[] {
  const gap = spans.filter((s) => s.span > 1e-4).length > 1 ? GAP : 0;
  return spans.map((sp, i) => {
    const a0 = spans.slice(0, i).reduce((sum, p) => sum + p.span, START);
    const a1 = Math.min(a0 + sp.span, cap);
    return { ...sp, a0, a1, mid: (a0 + Math.max(a0, a1)) / 2, d: a1 > a0 ? sectorPath(cx, cy, r, a0, a1, gap) : "" };
  });
}

/* ---------- Chart ---------- */

/**
 * A pie of the shares of a whole, with labels on the slices and a legend. Small slices past `maxSlices` fold into "Other". Use it for a few parts of one total; for many categories use a bar chart.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between slices (Right/Down next, Left/Up previous), Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the slice, value and share. `PieTable` lists every original row (nothing folded away) as the table view.
 * Glass and motion: the plot has no backdrop blur; the tooltip is the shared glass surface. Reduced motion draws slices in place.
 *
 * @example
 * ```tsx
 * import { PieChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PieChart
 *       data={[
 *         { label: "Direct", value: 4200 },
 *         { label: "Search", value: 3100 },
 *         { label: "Referral", value: 1200 },
 *       ]}
 *       aria-label="Visits by channel, share"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/pie-chart
 */
export function PieChart({
  data,
  maxSlices = MAX_PIE_SLICES,
  height = 260,
  outerLabels = true,
  legend = true,
  format = formatCompact,
  formatPercent = defaultFormatPercent,
  emptyState,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<PieChartProps>) {
  const t = { ...defaultPieChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const { fade } = chartFades(reduced);
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const input = useInputSource();

  const slices = foldSlices(data, maxSlices, t.other);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const isEmpty = total <= 0;
  const patternId = useId();
  const hatched = resolvePatterns(patterns, slices.length);

  // Every slice gets at least MIN_ANGLE, so a 0.1% share still draws (its label stays true).
  const angles = withMinimum(
    slices.map((s) => (total > 0 ? (s.value / total) * TURN : 0)),
    MIN_ANGLE,
  );
  const { tween, progress } = useTweenedSpans(
    slices.map((s, i) => ({ id: s.id, span: angles[i] ?? 0, color: s.color })),
    reduced,
  );
  // Entrance: one clockwise sweep reveals the slices in order.
  const sweep = useTweenedNumbers([width > 0 ? 1 : 0], {
    instant: reduced,
    from: [0],
    duration: duration.slower * 1.3,
  });
  const paths = useRef(new Map<string, SVGPathElement>());

  const docked = useDockedReadout(width);
  /** The readout for one slice: its share and value; "Other" also lists (some of) its members. */
  const readoutAt = (i: number): Readout => {
    const sl = slices[i];
    if (!sl) return { title: "", rows: [] };
    const listed = docked ? MAX_MEMBERS_DOCKED : MAX_MEMBERS;
    const extra = sl.members.length - listed;
    return {
      title: sl.label,
      rows: [
        { label: format(sl.value), value: formatPercent(sl.share), color: sl.color, kind: "rect" },
        ...sl.members.slice(0, listed).map((m) => ({
          label: m.label,
          value: formatPercent(total > 0 ? (Math.max(0, num(m.value)) / total) * 100 : 0),
          color: "transparent",
        })),
        ...(extra > 0 ? [{ label: t.more, value: `+${extra}`, color: "transparent" }] : []),
      ],
    };
  };

  // Layout. Touch screens dock the readout above the pie, clear of the finger.
  const dock = docked
    ? dockSpace(
        width,
        slices.map((_, i) => readoutAt(i)),
      )
    : 0;
  const svgH = height + dock;
  // What the dock needs on a typical phone width, for the min-height above.
  const reserve = dockSpace(
    360,
    slices.map((_, i) => readoutAt(i)),
  );
  const cx = width / 2;
  const cy = dock + height / 2;
  const longest = slices.reduce((n, s) => Math.max(n, s.label.length + formatPercent(s.share).length + 1), 0);
  const labelRoom = Math.min(longest * CHAR_W + 34, width * 0.32);
  const rFull = Math.max(0, Math.min(height / 2 - POP - 4, width / 2 - POP - 4, 150));
  const rLabelled = Math.max(0, Math.min(height / 2 - POP - 10, (width - 2 * labelRoom) / 2, 140));
  const withLabels = outerLabels && !isEmpty && rLabelled >= 64;
  const r = withLabels ? rLabelled : rFull;
  // Layout (labels, readout, hit testing) follows the settled slices; the paths follow the tween frame by frame (see `paint`).
  const settled = sectors(tween.target, cx, cy, r, START + TURN);
  const geoOf = (id: string) => settled.find((g) => g.id === id);
  const frame = (): Sector[] =>
    sectors(spansAt(tween, progress.get()), cx, cy, r, START + (sweep.read()[0] ?? 1) * TURN);
  const paint = () => {
    for (const g of frame()) paths.current.get(g.id)?.setAttribute("d", g.d);
  };
  useMotionValueEvent(progress, "change", paint);
  useMotionValueEvent(sweep.value, "change", paint);

  // Outer labels: biggest slices first. Labels on one side keep LABEL_GAP apart: one that would
  // collide is nudged along its side (at most MAX_NUDGE, so its leader line still points at its
  // slice); one that can't fit at all is left to the legend, which always names every slice.
  const placed = new Map<string, Label>();
  if (withLabels && sweep.settled && !tween.moving) {
    const order = [...slices].sort((a, b) => b.value - a.value);
    const sides: Record<1 | -1, (Label & { id: string; want: number })[]> = { 1: [], [-1]: [] };
    for (const s of order) {
      const g = geoOf(s.id);
      if (!g?.d) continue; // nothing drawn (yet): no leader line pointing at nothing
      const side: 1 | -1 = Math.cos(g.mid) >= 0 ? 1 : -1;
      const anchor = pt(cx, cy, r + 3, g.mid);
      const elbow = pt(cx, cy, r + 14, g.mid);
      const endX = cx + side * (r + 24);
      // With a legend (it names every slice), a sliver doesn't also get a leader line: five tiny labels in a stack are noise.
      if (legend && s.share < MIN_LEADER_SHARE) continue;
      const pct = formatPercent(s.share);
      const maxChars = Math.floor((side > 0 ? width - endX - 6 : endX - 6) / CHAR_W) - pct.length - 1;
      if (maxChars < 4) continue;
      const trial = [
        ...sides[side],
        { id: s.id, want: elbow[1], side, y: elbow[1], anchor, elbow, endX, text: truncate(s.label, maxChars), pct },
      ];
      const ys = spreadLabels(
        trial.map((l) => l.want),
        LABEL_GAP,
        8,
        svgH - 8,
      );
      if (!ys || ys.some((y, k) => Math.abs(y - itemAt(trial, k).want) > MAX_NUDGE)) continue;
      trial.forEach((l, k) => (l.y = ys[k] ?? 0));
      sides[side] = trial;
    }
    for (const l of [...sides[1], ...sides[-1]]) placed.set(l.id, l);
  }

  const act = activeId !== null ? slices.findIndex((s) => s.id === activeId) : -1;
  const focus = act >= 0 ? slices[act] : undefined;
  const focusGeo = focus ? geoOf(focus.id) : undefined;
  const readout = focus ? readoutAt(act) : null;
  const tip = focusGeo ? pt(cx, cy, r * 0.62, focusGeo.mid) : ([cx, cy] as const);

  function onPointer(event: React.PointerEvent<SVGCircleElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const dx = event.clientX - box.left - cx;
    const dy = event.clientY - box.top - cy;
    // Angle measured from 12 o'clock, clockwise, in [START, START + TURN).
    let a = Math.atan2(dy, dx);
    while (a < START) a += TURN;
    while (a >= START + TURN) a -= TURN;
    const swept = START + (sweep.read()[0] ?? 1) * TURN;
    const hit = settled.find((g) => g.a1 > g.a0 && a >= g.a0 && a < Math.min(g.a1, swept));
    input.fromPointer();
    setActiveId(hit ? hit.id : null);
  }

  if (isEmpty) {
    return (
      <div {...rest} ref={outerRef} className={cn("flex w-full flex-col items-center gap-4", className)}>
        <div
          ref={ref}
          role="group"
          aria-roledescription="chart"
          aria-label={`${ariaLabel}: ${t.noData}`}
          className="relative w-full"
          style={{ height }}
        >
          {width > 0 && (
            <svg aria-hidden width={width} height={height} className="absolute inset-0">
              <circle
                cx={cx}
                cy={height / 2}
                r={Math.max(0, rFull)}
                fill="var(--sheen-hover)"
                stroke="var(--sheen-chart-grid)"
                strokeWidth={1}
              />
            </svg>
          )}
          <p className="absolute inset-0 flex items-center justify-center text-sm text-sheen-fg-muted">
            {emptyState ?? t.noData}
          </p>
        </div>
      </div>
    );
  }

  const onKey = chartKeyHandler(slices.length, act >= 0 ? act : null, (i) =>
    setActiveId(i === null ? null : (slices[i]?.id ?? null)),
  );

  return (
    <div {...rest} ref={outerRef} className={cn("flex w-full flex-col items-center gap-4", className)}>
      {/* On a phone the readout docks above the pie once the width is known: hold that band from the first paint (CSS only, so SSR and hydration agree) so the page below does not jump. */}
      <div
        ref={ref}
        className="relative w-full [@media(pointer:coarse)_and_(max-width:480px)]:min-h-(--sheen-pie-reserve)"
        style={{ height: svgH, ["--sheen-pie-reserve" as string]: `${height + reserve}px` }}
      >
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={svgH}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            onKeyDown={(e) => {
              input.fromKeyboard();
              onKey(e);
            }}
            onBlur={() => setActiveId(null)}
            className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
          >
            <g aria-hidden>
              {hatched && (
                <ChartPatternDefs id={patternId} entries={slices.map((s, i) => ({ index: i, color: s.color }))} />
              )}
              <g className="forced-color-adjust-none">
                {frame().map((g) => {
                  const mid = geoOf(g.id)?.mid ?? g.mid;
                  return (
                    <motion.path
                      key={g.id}
                      ref={(el) => {
                        if (el) paths.current.set(g.id, el);
                        else paths.current.delete(g.id);
                      }}
                      d={g.d}
                      fill={patternFill(
                        hatched,
                        patternId,
                        Math.max(
                          0,
                          slices.findIndex((s) => s.id === g.id),
                        ),
                        g.color,
                      )}
                      initial={false}
                      animate={{
                        x: activeId === g.id ? Math.cos(mid) * POP : 0,
                        y: activeId === g.id ? Math.sin(mid) * POP : 0,
                        opacity: !focus || activeId === g.id ? 1 : 0.45,
                      }}
                      transition={
                        reduced ? { duration: 0 } : { x: spring.snappy, y: spring.snappy, opacity: fade(duration.fast) }
                      }
                    />
                  );
                })}
              </g>

              {/* Hit layer: the slice under the pointer's ANGLE, out to 24px past the rim, so even a
                  thin slice is easy to hit (the 2px gaps included). */}
              <circle
                cx={cx}
                cy={cy}
                r={r + 24}
                fill="transparent"
                className="cursor-pointer"
                onPointerDown={onPointer}
                onPointerMove={onPointer}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActiveId(null)}
              />

              {/* Leader lines + labels fade in once the sweep has finished. */}
              {[...placed.entries()].map(([id, l]) => (
                <motion.g
                  key={`label-${id}`}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduced ? 0 : duration.base }}
                >
                  <polyline
                    points={`${n2(l.anchor[0])},${n2(l.anchor[1])} ${n2(l.elbow[0])},${n2(l.elbow[1])} ${n2(l.endX)},${n2(l.y)}`}
                    fill="none"
                    stroke="var(--sheen-fg-subtle)"
                    strokeWidth={1}
                  />
                  <text
                    x={l.endX + l.side * 5}
                    y={l.y}
                    dy="0.32em"
                    textAnchor={l.side > 0 ? "start" : "end"}
                    className="text-xs"
                  >
                    <tspan className="fill-sheen-fg-muted">{l.text}</tspan>
                    <tspan dx={5} className="fill-sheen-fg font-semibold tabular-nums">
                      {l.pct}
                    </tspan>
                  </text>
                </motion.g>
              ))}
            </g>
          </ChartFigure>
        )}

        {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
        {focus && readout && (
          <FittedTooltip
            title={readout.title}
            rows={readout.rows}
            x={tip[0]}
            y={tip[1]}
            // Open towards the centre, away from the slice's own outer label.
            side={focusGeo && Math.cos(focusGeo.mid) >= 0 ? "left" : "right"}
            containerWidth={width}
            docked={docked}
          />
        )}
        <ChartAnnouncer
          text={input.announce(
            focus
              ? `${focus.label}: ${formatPercent(focus.share)}, ${format(focus.value)}${focus.members.length ? ` (${focus.members.map((m) => m.label).join(", ")})` : ""}`
              : "",
          )}
        />
      </div>

      {legend && slices.length > 1 && (
        <ChartLegend
          className="justify-center"
          items={slices.map((s, i) => ({
            label: s.label,
            color: s.color,
            kind: "rect",
            value: formatPercent(s.share),
            pattern: hatched && i > 0 ? i : undefined,
          }))}
        />
      )}
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of PieTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type PieTableProps = {
  /** Takes the same slices as the chart. */
  data: readonly PieSlice[];
  /** Same as the chart's, so the table marks which rows the chart folds into "Other". */
  maxSlices?: number;
  /** Formats a value for the data table cells: takes the number, returns the text shown. Default compact numbers. */
  format?: (n: number) => string;
  /** Formats a share (0–100) for the data table cells: takes the share, returns the text shown. Default whole-percent format. */
  formatPercent?: (n: number) => string;
  /** Sets the header of the first column. Defaults to labels.slice. */
  indexLabel?: string;
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  /** Override the chart's strings (i18n). */
  labels?: Partial<PieChartLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const cell = "py-2 pe-2 sm:pe-4 last:pe-0";

/**
 * The table view of a pie: every original row (nothing folded away), its value and share.
 *
 * Props: the chart's `data`, `maxSlices`, `format`, `formatPercent` and `labels`, plus `indexLabel` (first column header), `caption` (hidden, names the table) and `className`. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { PieTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PieTable data={[{ label: "Direct", value: 4200 }, { label: "Search", value: 3100 }]} indexLabel="Channel" caption="Visits by channel" />
 *   );
 * }
 * ```
 *
 * @see /charts/pie-chart
 */
export function PieTable({
  data,
  maxSlices = MAX_PIE_SLICES,
  format = formatCompact,
  formatPercent = defaultFormatPercent,
  indexLabel,
  caption,
  labels,
  className,
}: PieTableProps) {
  const t = { ...defaultPieChartLabels, ...labels };
  const sliceOf = new Map<number, FoldedSlice>();
  for (const s of foldSlices(data, maxSlices, t.other)) for (const i of s.indexes) sliceOf.set(i, s);
  const total = data.reduce((sum, d) => sum + Math.max(0, num(d.value)), 0);
  return (
    <TableScroll label={caption ?? indexLabel ?? t.slice} className={className}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className={cn(cell, "font-medium")}>
              {indexLabel ?? t.slice}
            </th>
            <th scope="col" className={cn(cell, "text-end font-medium")}>
              {t.value}
            </th>
            <th scope="col" className={cn(cell, "text-end font-medium")}>
              {t.share}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 text-center text-sheen-fg-muted">
                {t.noData}
              </td>
            </tr>
          ) : (
            data.map((d, i) => {
              const v = Math.max(0, num(d.value));
              const slice = sliceOf.get(i);
              return (
                <tr key={i} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className={cn(cell, "font-normal")}>
                    <span className="inline-flex items-center gap-1.5">
                      {/* Rows that aren't drawn (0 or less) get an empty key, so names stay aligned. */}
                      <LegendKey color={slice?.color ?? "transparent"} />
                      <span>
                        {d.label}
                        {slice?.other && (
                          <span className="ms-1.5 text-xs whitespace-nowrap text-sheen-fg-muted">({t.inOther})</span>
                        )}
                      </span>
                    </span>
                  </th>
                  <td className={cn(cell, "text-end tabular-nums")}>{format(v)}</td>
                  <td className={cn(cell, "text-end tabular-nums")}>
                    {formatPercent(total > 0 ? (v / total) * 100 : 0)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        {data.length > 0 && (
          <tfoot>
            <tr className="border-t border-sheen-border font-medium">
              <th scope="row" className={cn(cell, "text-start")}>
                {t.total}
              </th>
              <td className={cn(cell, "text-end tabular-nums")}>{format(total)}</td>
              <td className={cn(cell, "text-end tabular-nums")}>{formatPercent(total > 0 ? 100 : 0)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </TableScroll>
  );
}
