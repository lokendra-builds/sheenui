"use client";

import type { ComponentProps } from "react";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type Ref,
  type RefObject,
} from "react";
import { animate, useInView, useMotionValue, usePageInView } from "motion/react";

import { useControllable } from "../../hooks/use-controllable";
import { clamp } from "../../lib/math";
import { observeIntersection } from "../../hooks/use-intersection";
import { useSyncRef } from "../../hooks/use-latest";
import { duration as durationTokens, ease as easeTokens, follow as followToken } from "../../motion/tokens";

/** A categorical colour slot, 1–8. Give each series a fixed slot so filtering never repaints it. */
export type ChartColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The type of a chart's keyboard-instructions label (`labels.instructions`, plus `drillInstructions`
 * and similar): a plain string, or a function of a small layout context for languages whose wording
 * depends on it. LollipopChart and BoxPlot pass `{ horizontal }`, Beeswarm passes `{ rows }`; every
 * other chart calls the function with no argument.
 */
export type ChartInstructions<Context = void> = string | ((context: Context) => string);

/**
 * Turns a `labels.instructions` value into text: a string is returned as is, a function is called
 * with the chart's layout context. Pure, but exported from a client module: call it from client code, not from a Server Component.
 */
export function resolveInstructions<Context>(value: ChartInstructions<Context>, context: Context): string;
export function resolveInstructions(value: ChartInstructions): string;
export function resolveInstructions<Context>(value: ChartInstructions<Context>, context?: Context): string {
  return typeof value === "function" ? value(context as Context) : value;
}

/**
 * One series of a chart: the key of its value in each data row, its label and an optional palette
 * slot.
 */
export type ChartSeries = {
  /** Key of the value in each data row. */
  key: string;
  label: string;
  /** Colour slot. Defaults to the series' position (1, 2, 3...). */
  color?: ChartColor;
};

/**
 * One data row of a category chart: string and number values by key, e.g. `{ month: "Jan", sales: 120
 * }`.
 */
export type ChartRow = Record<string, string | number>;

/**
 * How many distinct palette slots a chart colours before folding the rest into "Other" or neutral grey
 * (8).
 */
export const MAX_SERIES = 8;

/** Colour for a series. Slots are never cycled: a 9th series is drawn in neutral grey (fold it into "Other"). */
export function seriesColor(series: ChartSeries, index: number) {
  return slotColor(series.color ?? index + 1);
}

/** Colour for a palette slot (1–8); anything past the palette is neutral grey. */
export function slotColor(slot: number) {
  if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SERIES) return "var(--sheen-fg-subtle)";
  return `var(--sheen-chart-${slot})`;
}

/** A row value as a finite number: missing, empty or non-numeric values read as 0 (never NaN). */
export function num(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : 0;
  return Number.isFinite(n) ? n : 0;
}

const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const fullFormatter = new Intl.NumberFormat("en");

/** Typographic minus (U+2212): the same width as "+", and read as "minus" by screen readers. */
const minus = (s: string) => s.replace("-", "\u2212");

/** 1,284 · 12.9K · 4.2M · −640 */
export function formatCompact(n: number) {
  if (!Number.isFinite(n)) return "–";
  return minus(Math.abs(n) < 10_000 ? fullFormatter.format(Math.round(n * 10) / 10) : compactFormatter.format(n));
}

/** Number of decimals needed to write `n` exactly (0.25 → 2, 2500 → 0). */
export function decimalsOf(n: number) {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  // toPrecision(12) drops float noise (0.1 + 0.2 → 0.3) before counting.
  const [mantissa = "", exponent = "0"] = Math.abs(n).toPrecision(12).split("e");
  const fraction = (mantissa.split(".")[1] ?? "").replace(/0+$/, "");
  return Math.min(20, Math.max(0, fraction.length - Number(exponent)));
}

const tickFormatters = new Map<string, Intl.NumberFormat>();
function tickFormatter(compact: boolean, digits: number) {
  const key = `${compact}-${digits}`;
  let f = tickFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en", {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: digits,
    });
    tickFormatters.set(key, f);
  }
  return f;
}

/**
 * Axis-tick formatter that never rounds a tick away from its value: a 0.25 step prints
 * 0.25 / 0.5 / 0.75 (not 0.3 / 0.5 / 0.8), and 12,500 prints 12.5K. Mirrors formatCompact
 * (compact notation from 10,000) so ticks and tooltips read the same.
 */
export function formatTick(n: number) {
  if (!Number.isFinite(n)) return "–";
  const abs = Math.abs(n);
  if (abs < 10_000) return minus(tickFormatter(false, decimalsOf(n)).format(n));
  const unit = abs >= 1e12 ? 1e12 : abs >= 1e9 ? 1e9 : abs >= 1e6 ? 1e6 : 1e3;
  return minus(tickFormatter(true, decimalsOf(n / unit)).format(n));
}

/** The formatter for axis ticks: the step-aware `formatTick` unless the chart was given its own `format`. */
export function axisFormat(format: ((n: number) => string) | undefined) {
  return format && format !== formatCompact ? format : formatTick;
}

/**
 * Round, human-friendly axis ticks covering [min, max]. Ticks are snapped to the step's
 * precision, so they never carry float noise (0.30000000000000004).
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    // All-zero data still gets a real axis; a flat non-zero series gets ±10% around its value.
    if (min === 0) return [0, 1];
    const pad = Math.abs(min) * 0.1;
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const rough = span / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= count) ?? magnitude * 10;
  const digits = decimalsOf(step);
  const snap = (v: number) => Number(v.toFixed(Math.min(20, digits + 1)));
  const start = Math.floor(min / step + 1e-9) * step;
  const end = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let i = 0, v = start; v <= end + step / 2 && i < 50; i++, v = start + i * step) ticks.push(snap(v) || 0);
  return ticks.length > 1 ? ticks : [snap(start), snap(start + step)];
}

/** Linear scale: maps the domain [d0, d1] onto the range [r0, r1]. */
export function linear(d0: number, d1: number, r0: number, r1: number) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}

/** Min and max of a list without spreading it into Math.min (safe for very long series). */
export function extent(values: number[]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return lo <= hi ? [lo, hi] : [0, 0];
}

/**
 * Which category labels to print along an axis so none collide: every n-th label, plus
 * the last one (the most recent value matters most); a regular label too close to the
 * last one is dropped instead.
 */
export function thinLabels(labels: string[], stepPx: number, charPx = 6.2): Set<number> {
  const count = labels.length;
  const longest = labels.reduce((n, l) => Math.max(n, l.length), 0);
  const minPx = Math.max(36, longest * charPx + 14);
  const every = Math.max(1, Math.ceil(minPx / Math.max(1e-6, stepPx)));
  const shown = new Set<number>();
  for (let i = 0; i < count; i += every) shown.add(i);
  const last = count - 1;
  if (last > 0 && !shown.has(last)) {
    const prev = Math.floor(last / every) * every;
    if ((last - prev) * stepPx < minPx) shown.delete(prev);
    shown.add(last);
  }
  return shown;
}

/** Limits a value to a range: the library's one `clamp` (lib/math), re-exported for the chart modules. */
export { clamp } from "../../lib/math";

/**
 * The item at `index`, for an index the caller has already established is in range (a loop bound,
 * a lookup built from the same array). It throws a RangeError instead of returning `undefined`, so
 * a broken assumption fails where it happens. Pure, but exported from a client module: call it from
 * client code, not from a Server Component.
 */
export function itemAt<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`No item at index ${String(index)} (length ${String(items.length)})`);
  return item;
}

/**
 * Separates a label from its occurrence count in a mark key. Never U+0000: marks carry their key in a `data-id` attribute that
 * a chart paints by, and the HTML parser turns NUL into U+FFFD, so a prerendered chart would no longer find its own marks.
 *
 * @internal Not part of the public barrel.
 */
export const KEY_SEP = "\u2063";

/**
 * Stable, unique React keys for category rows: the label plus its occurrence count,
 * so duplicate labels ("Q1", "Q1") never collide and a label keeps its key when the
 * data range changes (marks can then tween instead of remounting).
 */
export function rowKeys(data: readonly ChartRow[], index: string) {
  const seen = new Map<string, number>();
  return data.map((row) => {
    const label = String(row[index] ?? "");
    const n = seen.get(label) ?? 0;
    seen.set(label, n + 1);
    return `${label}${KEY_SEP}${n}`;
  });
}

/** A cheap signature of the plotted values, used to tell data changes apart from resizes. */
export function dataSignature(data: readonly ChartRow[], keys: readonly string[]) {
  return data.map((row) => keys.map((k) => String(row[k] ?? "")).join("\u0001")).join("\u0002");
}

/**
 * The width (px) charts inside can assume before they have measured themselves, e.g. a gallery
 * tile or a grid cell of known size. Charts still measure and correct it; a good hint only saves
 * the synchronous measure-and-re-render on mount (the most expensive frame when many charts
 * mount at once).
 *   <ChartWidthHint.Provider value={488}>…charts…</ChartWidthHint.Provider>
 *
 * Defaults to 0 (no hint: charts measure themselves before paint). It only sets a starting width; the ResizeObserver still corrects it, so a wrong hint costs one extra render, never a wrong layout.
 * Accessibility and motion: a plain React context, so it adds no DOM, keyboard or screen-reader behaviour and does not change any animation.
 *
 * @example
 * ```tsx
 * import { ChartWidthHint, LineChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartWidthHint.Provider value={488}>
 *       <LineChart data={[{ month: "Jan", visits: 4 }, { month: "Feb", visits: 7 }]} index="month" series={[{ key: "visits", label: "Visits" }]} aria-label="Visits per month" />
 *     </ChartWidthHint.Provider>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export const ChartWidthHint = createContext(0);

/**
 * Width of an element, kept up to date as it resizes. Measured before paint, so there's no empty
 * first frame. Returns a callback ref, so it also works when the element mounts later
 * (e.g. after an empty state).
 *
 * Returns `[ref, width]`: attach `ref` to the element and read `width` in px (0 until it is measured, or the ChartWidthHint if one is set). While the element is hidden (`display: none`) the last real width is kept.
 * Not a component: it renders nothing, so it adds no keyboard or screen-reader behaviour. Resizes apply instantly (no tween), which keeps reduced motion and fast layouts safe.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useElementWidth } from "./chart-utils";
 *
 * function Plot() {
 *   const [ref, width] = useElementWidth<HTMLDivElement>();
 *   return (
 *     <div ref={ref} style={{ height: 160 }}>
 *       {width > 0 && <svg width={width} height={160} aria-hidden />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useElementWidth<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T only types the returned ref: callers choose the element it attaches to, e.g. useElementWidth<HTMLDivElement>()
  T extends HTMLElement,
>() {
  // A known width (ChartWidthHint) lets the first render draw the chart straight away, instead
  // of rendering empty, measuring, and re-rendering synchronously before paint.
  const hint = useContext(ChartWidthHint);
  const [width, setWidth] = useState(hint);
  const hinted = useRef(hint > 0);
  useSyncRef(hinted, hint > 0);
  // The callback ref measures and observes the node itself (cleanup on detach), instead of
  // keeping the element in state: that would re-render the whole chart synchronously inside the
  // commit that just mounted it (a second full render, in the same task).
  const [ref] = useState(() => (node: T | null) => {
    if (!node) return;
    // Measured in the commit, so there's no empty first frame. With a hint the first render has
    // already drawn the chart at that width: the observer confirms it after layout instead, so
    // mounting a hinted chart forces no layout at all.
    if (!hinted.current) setWidth(Math.floor(node.clientWidth));
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = Math.floor(entry.contentRect.width);
      // Hidden (display: none, e.g. an inactive tab panel) reads as 0 wide: keep the last real
      // width, so the chart isn't torn down and re-drawn every time its panel is switched away.
      if (next === 0 && node.getClientRects().length === 0) return;
      setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  });
  return [ref, width] as const;
}

/**
 * True for the render in which `signature` changed, and on every render after it until the
 * component next settles. Lets charts animate DATA changes while resizes apply instantly.
 *
 * Returns a boolean. Pass a cheap string that changes when the data does (e.g. the values joined); resizes and re-renders with the same signature return false.
 * Not a component: it renders nothing and has no keyboard or screen-reader behaviour. Charts use it to tween on data changes only, and reduced motion still makes those tweens instant.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useDataChanged } from "./chart-utils";
 *
 * function Bars({ values }: { values: number[] }) {
 *   const changed = useDataChanged(values.join(","));
 *   return <p data-animate={changed}>{values.length} bars</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useDataChanged(signature: string) {
  return useCommitted(signature) !== signature;
}

/**
 * The value this hook was given on the previous commit (the first render returns `value` itself).
 * Lets a chart compare the data it is about to draw with what is on screen, to animate data
 * changes but not resizes.
 *
 * State, not a ref read during render: an effect copies the value into state after the commit that used it, which
 * costs one extra render per change (a change that matters re-renders once more, a resize does not).
 * Returns the last committed value. Not a component: renders nothing and has no keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useCommitted } from "./chart-utils";
 *
 * function Delta({ total }: { total: number }) {
 *   const before = useCommitted(total);
 *   return <p>{total - before >= 0 ? "up" : "down"}</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useCommitted<T>(value: T) {
  const [committed, setCommitted] = useState(value);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the point of the hook: publish what this commit drew so the next render can compare against it
    if (!Object.is(committed, value)) setCommitted(value);
  }, [committed, value]);
  return committed;
}

/**
 * True once the chart has been painted with real content (`ready`): entrance choreography
 * (slow draw-in, stagger) runs only the first time; later data changes use quicker timings.
 *
 * `ready` (default true) says when the chart has real content to draw; pass false while it is still loading or measuring. Returns false for the render that draws the entrance, true after.
 * Not a component: no DOM, keyboard or screen-reader behaviour. It only picks slow (first draw) or quick (later changes) timings; reduced motion makes both instant.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useHasMounted } from "./chart-utils";
 *
 * function Bars({ ready }: { ready: boolean }) {
 *   const hasMounted = useHasMounted(ready);
 *   return <p>Draw-in takes {hasMounted ? 0.4 : 1.2}s</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useHasMounted(ready = true) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flips once, in the commit after the first real draw: the entrance renders with the slow timings, every later render with the quick ones
    if (ready) setMounted(true);
  }, [ready]);
  return mounted;
}

/**
 * True until a chart's entrance has played: slow entrance timings apply once, then the quick change
 * timings. State, not a ref, and no timer: a layout effect flips it in the commit where `play` is first true, so
 * the entrance starts with the slow timings (the commit's own props) and every later render uses the quick ones.
 *
 * Pass `play` (true once the entrance may start). Returns true for the renders before the entrance has played. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useFirstPlay } from "./chart-utils";
 *
 * function Bars({ play }: { play: boolean }) {
 *   const first = useFirstPlay(play);
 *   return <p>Grow takes {first ? 0.8 : 0.3}s</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useFirstPlay(play: boolean) {
  const [done, setDone] = useState(false);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the deterministic "first commit with real content" flag: it must change right after that commit's layout phase, before paint, so a render-phase update (which would skip the entrance) is not an option
    if (play) setDone(true);
  }, [play]);
  return !done;
}

/**
 * Tween an array of numbers toward `target` (ease-out) without re-rendering: the numbers live in a
 * MotionValue, so a consumer paints each frame straight onto its SVG attributes
 * (`useMotionValueEvent(tween.value, "change", paint)`) and React commits nothing per frame. New
 * entries start from `enterFrom(i)`. With `instant` (reduced motion) the target applies at once.
 *
 * Options: `instant` (jump, for reduced motion), `from` (values to start from on mount), `enterFrom(i)` (start value for entries that appear later) and `duration` (seconds, default the slower motion token).
 * Returns `{ value, read, settled }`: `value` is the MotionValue to subscribe to, `read()` the numbers now (the target itself when `instant`, so the very first render is right), and `settled` is false until the tween has reached the target (one state change per tween, not per frame).
 * Not a component: no DOM, no keyboard or screen-reader behaviour. Pass `instant: true` when `useSheenReducedMotion()` is true.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useMotionValueEvent } from "motion/react";
 * import { useRef } from "react";
 * import { useTweenedNumbers } from "./chart-utils";
 *
 * function Bar({ share, reduced }: { share: number; reduced: boolean }) {
 *   const tween = useTweenedNumbers([share], { instant: reduced, from: [0] });
 *   const bar = useRef<HTMLDivElement>(null);
 *   useMotionValueEvent(tween.value, "change", ([v = 0]) => {
 *     if (bar.current) bar.current.style.width = `${v * 100}%`;
 *   });
 *   return <div ref={bar} style={{ width: `${(tween.read()[0] ?? 0) * 100}%` }} />;
 * }
 * ```
 *
 * @see /charts
 */
export function useTweenedNumbers(
  target: number[],
  {
    instant,
    from,
    enterFrom,
    duration = durationTokens.slower,
  }: {
    instant: boolean;
    /** Starting values on mount (e.g. zeros for an entrance). Omit to start at the target. */
    from?: number[];
    enterFrom?: (i: number) => number;
    duration?: number;
  },
) {
  const value = useMotionValue<number[]>(instant || !from ? target : from);
  const [reached, setReached] = useState("");
  // The effect's real input is the numbers themselves, so it is keyed by their joined text and rebuilds the array from it.
  const key = target.join(",");
  const goal = useMemo(() => (key === "" ? [] : key.split(",").map(Number)), [key]);
  const startAt = useEffectEvent((i: number, fallback: number) => value.get()[i] ?? enterFrom?.(i) ?? fallback);
  useEffect(() => {
    const start = goal.map((v, i) => startAt(i, v));
    const same = value.get().length === goal.length && start.every((v, i) => v === goal[i]);
    if (same) return;
    if (instant) {
      value.set(goal);
      return;
    }
    const controls = animate(0, 1, {
      duration,
      ease: easeTokens.out,
      onUpdate: (k) => value.set(goal.map((v, i) => (start[i] ?? v) + (v - (start[i] ?? v)) * k)),
      onComplete: () => setReached(key),
    });
    return () => controls.stop();
  }, [goal, key, instant, duration, value]);
  return {
    value,
    /** The numbers now: the target itself when `instant`, so a reduced-motion render never lags a frame. */
    read: () => (instant ? target : value.get()),
    settled: instant || reached === key || value.get().join(",") === key,
  };
}

/**
 * Below this chart width (px) the tooltip docks in a band at the top of the chart instead of
 * floating next to the pointer: on a phone a floating tooltip sits under the finger.
 */
export const TOOLTIP_DOCK_BELOW = 480;
/** Height (px) reserved above the plot for the docked readout (one 30px line + breathing room). */
export const TOOLTIP_DOCK_SPACE = 40;

/**
 * Space to reserve for the docked readout: as many lines as the widest readout the data can
 * produce wraps to (title, one item per series, any event notes). Based on the longest title
 * and values, so the plot never jumps while the user scrubs from point to point.
 */
export function tooltipDockSpace(
  width: number,
  data: readonly ChartRow[],
  index: string,
  rows: { label: string; values: string[] }[],
  notes: readonly string[] = [],
) {
  const longest = (list: readonly string[]) => list.reduce((n, s) => Math.max(n, s.length), 0);
  const ch = 6.5; // average glyph width of the 12px readout text
  const gap = 12; // gap-x-3 between items
  // Item widths at their widest: the title, then per series "key 14 + gap 6 + value + gap 6 + label",
  // then each note "mark 14 + gap 6 + text". The same flex-wrap packing the readout does.
  const items = [
    longest(data.map((row) => String(row[index] ?? ""))) * ch,
    ...rows.map((r) => 26 + (longest(r.values) + r.label.length) * ch),
    ...notes.map((n) => 20 + n.length * ch),
  ];
  const inner = Math.max(1, width - 24); // the readout's horizontal padding
  let lines = 1;
  let used = 0;
  for (const w of items) {
    if (used > 0 && used + gap + w > inner) {
      lines += 1;
      used = w;
    } else used += (used > 0 ? gap : 0) + w;
  }
  // 12px vertical padding + 16px text lines with a 2px gap (min-height 30), plus 10px of air.
  return Math.max(30, 10 + 18 * lines) + 10;
}

/** Exit timing for chart marks: shorter than entrances and never overshooting. */
export const exitTransition = { duration: durationTokens.exit, ease: easeTokens.exit };

/** Ease for value changes (bars growing, lines morphing). */
export const changeEase = easeTokens.inOut;
/**
 * The easing curve of first-view entrances (the `out` curve of the motion tokens), shared by every
 * chart.
 */
export const enterEase = easeTokens.out;

const f = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

/**
 * Bar path with a rounded data-end and a square base. Every bar shares ONE command structure
 * (four corners, each a Q curve; unrounded corners just have radius 0), so Motion can tween
 * any bar into any other: heights, positions, even flipping from positive to negative.
 *
 * `end` is the side that carries the value: "top"/"bottom" for columns (positive/negative),
 * "right"/"left" for horizontal bars, "none" for inner stack segments.
 */
export function barPath(
  x: number,
  y: number,
  w: number,
  h: number,
  end: "top" | "bottom" | "right" | "left" | "none",
  r = 4,
) {
  w = Math.max(0, Number.isFinite(w) ? w : 0);
  h = Math.max(0, Number.isFinite(h) ? h : 0);
  const vertical = end === "top" || end === "bottom";
  const rr = end === "none" ? 0 : Math.max(0, Math.min(r, vertical ? w / 2 : h / 2, vertical ? h : w));
  const tl = end === "top" || end === "left" ? rr : 0;
  const tr = end === "top" || end === "right" ? rr : 0;
  const br = end === "bottom" || end === "right" ? rr : 0;
  const bl = end === "bottom" || end === "left" ? rr : 0;
  const X = f(x);
  const Y = f(y);
  const R = f(x + w);
  const B = f(y + h);
  return (
    `M${X},${f(y + tl)} Q${X},${Y} ${f(x + tl)},${Y} H${f(x + w - tr)} Q${R},${Y} ${R},${f(y + tr)} ` +
    `V${f(y + h - br)} Q${R},${B} ${f(x + w - br)},${B} H${f(x + bl)} Q${X},${B} ${X},${f(y + h - bl)} Z`
  );
}

/** Keyboard support shared by charts: arrows move the active index, Home/End jump, Escape clears it. */
export function chartKeyHandler(count: number, active: number | null, setActive: (i: number | null) => void) {
  return (event: React.KeyboardEvent) => {
    if (count <= 0) return;
    const current = active === null || active >= count ? -1 : active;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") setActive(Math.min(count - 1, current + 1));
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") setActive(current <= 0 ? 0 : current - 1);
    else if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(count - 1);
    else if (event.key === "Escape" && active !== null) setActive(null);
    else return;
    event.preventDefault();
  };
}

/*
 * Touch scrubbing: a chart that follows a horizontal drag puts `touch-pan-y touch-pinch-zoom` on its <svg> root.
 * Browsers ignore `touch-action` on SVG shapes (a hit <rect>, a <path>), so on the shape alone the browser claims the
 * drag as a pan after one move and cancels the chart's pointer events. The root is a CSS box and does honour it:
 * vertical swipes still scroll the page, two fingers still pinch-zoom it, one horizontal finger scrubs the chart.
 */
/** Classes for a chart's focusable SVG: a solid focus outline (>= 3:1) in every theme. */
export const chartFocusClass =
  "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus";

/** Truncate a label to `max` characters with an ellipsis. */
export function truncate(label: string, max: number) {
  return label.length > max ? `${label.slice(0, Math.max(1, max - 1)).trimEnd()}…` : label;
}

/* ====================================================================================
 * Chart-wide upgrades (gradients, glow, curves, springs, comparison, locale, live data).
 * Everything below is additive: nothing above changed.
 * ==================================================================================== */

/** A series that can also draw its previous period (dashed, muted) from another key of each row. */
export type CompareSeries = ChartSeries & {
  /** Key of the previous-period value in each row (e.g. "revenuePrev"). */
  compareKey?: string;
};

/** "linear" joins points with straight lines; "monotone" with smooth curves that never overshoot a value. */
export type ChartCurve = "linear" | "monotone";

/** Springs from the motion playbook, defined by visualDuration + bounce. */
export const chartSpring = {
  /** Data changes, rescaled axes: critically damped, never overshoots. */
  smooth: { type: "spring", visualDuration: 0.3, bounce: 0 },
  /** Entrances (bars growing from the baseline): ~1% overshoot. */
  gentle: { type: "spring", visualDuration: 0.55, bounce: 0.18 },
  /** Small feedback (legend keys, handles). */
  snappy: { type: "spring", visualDuration: 0.22, bounce: 0.12 },
} as const;

/** The crosshair and tooltip glide between points on this spring. */
export const followPointer = { type: "spring", ...followToken.pointer } as const;

/** A stagger delay that never spreads a group over more than 400 ms, however many marks. */
export function budgetDelay(i: number, total: number, step = 0.03) {
  return i * Math.min(step, 0.4 / Math.max(total - 1, 1));
}

/**
 * Soft glow for the ACTIVE mark (a hovered line, the dot being read). Dark theme only:
 * `light-dark()` makes it transparent in light mode, where marks stay crisp. Use it on SVG
 * marks, never on glass (a filter on a glass ancestor flattens the blur).
 */
export function chartGlow(color: string, blur = 6) {
  return `drop-shadow(0 0 ${blur}px light-dark(transparent, color-mix(in oklab, ${color} 70%, transparent)))`;
}

/** `color` at `percent` strength over transparent (tokens only: no hard-coded colours). */
export function fadeColor(color: string, percent: number) {
  return `color-mix(in oklab, ${color} ${clamp(percent, 0, 100)}%, transparent)`;
}

/** A point in px. */
export type Pt = readonly [number, number];

/** Stand-in point for a missing neighbour in the curve helpers (never reached for valid indices). */
export const ORIGIN_PT: Pt = [0, 0];

/** Tangents of a monotone cubic through the points (Fritsch–Carlson, as d3's curveMonotoneX). */
export function monotoneTangents(pts: readonly Pt[]) {
  const n = pts.length;
  const t = new Array<number>(n).fill(0);
  if (n < 2) return t;
  const slope = (a: Pt, b: Pt) => (b[0] - a[0] === 0 ? 0 : (b[1] - a[1]) / (b[0] - a[0]));
  if (n === 2) {
    const s = slope(pts[0] ?? ORIGIN_PT, pts[1] ?? ORIGIN_PT);
    return [s, s];
  }
  for (let i = 1; i < n - 1; i++) {
    const p0 = pts[i - 1] ?? ORIGIN_PT;
    const p1 = pts[i] ?? ORIGIN_PT;
    const p2 = pts[i + 1] ?? ORIGIN_PT;
    const h0 = p1[0] - p0[0];
    const h1 = p2[0] - p1[0];
    const s0 = slope(p0, p1);
    const s1 = slope(p1, p2);
    const p = h0 + h1 === 0 ? 0 : (s0 * h1 + s1 * h0) / (h0 + h1);
    t[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  const end = (a: Pt, b: Pt, tt: number) => {
    const h = b[0] - a[0];
    return h ? (3 * ((b[1] - a[1]) / h) - tt) / 2 : tt;
  };
  t[0] = end(pts[0] ?? ORIGIN_PT, pts[1] ?? ORIGIN_PT, t[1] ?? 0);
  t[n - 1] = end(pts[n - 2] ?? ORIGIN_PT, pts[n - 1] ?? ORIGIN_PT, t[n - 2] ?? 0);
  return t;
}
const p2 = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

/** Tangents of a monotone cubic through the points (Fritsch–Carlson, like d3's curveMonotoneX). */
function monotoneSlopes(pts: readonly Pt[]) {
  const n = pts.length;
  const t = new Array<number>(n).fill(0);
  if (n < 2) return t;
  const slope = (a: Pt, b: Pt) => (b[0] - a[0] === 0 ? 0 : (b[1] - a[1]) / (b[0] - a[0]));
  if (n === 2) {
    const s = slope(pts[0] ?? ORIGIN_PT, pts[1] ?? ORIGIN_PT);
    return [s, s];
  }
  for (let i = 1; i < n - 1; i++) {
    const a = pts[i - 1] ?? ORIGIN_PT;
    const b = pts[i] ?? ORIGIN_PT;
    const c = pts[i + 1] ?? ORIGIN_PT;
    const h0 = b[0] - a[0];
    const h1 = c[0] - b[0];
    const s0 = slope(a, b);
    const s1 = slope(b, c);
    const p = h0 + h1 === 0 ? 0 : (s0 * h1 + s1 * h0) / (h0 + h1);
    t[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  const end = (a: Pt, b: Pt, tt: number) => {
    const h = b[0] - a[0];
    return h ? (3 * ((b[1] - a[1]) / h) - tt) / 2 : tt;
  };
  t[0] = end(pts[0] ?? ORIGIN_PT, pts[1] ?? ORIGIN_PT, t[1] ?? 0);
  t[n - 1] = end(pts[n - 2] ?? ORIGIN_PT, pts[n - 1] ?? ORIGIN_PT, t[n - 2] ?? 0);
  return t;
}

/**
 * SVG path through `points`. Every call with the same number of points and the same curve
 * yields the same command structure, so Motion can tween one path into another.
 */
export function linePath(points: readonly Pt[], curve: ChartCurve = "linear"): string {
  if (points.length === 0) return "";
  const [x0, y0] = points[0] ?? ORIGIN_PT;
  let d = `M${p2(x0)},${p2(y0)}`;
  if (curve === "linear" || points.length < 3) {
    for (let i = 1; i < points.length; i++)
      d += ` L${p2((points[i] ?? ORIGIN_PT)[0])},${p2((points[i] ?? ORIGIN_PT)[1])}`;
    return d;
  }
  const t = monotoneSlopes(points);
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1] ?? ORIGIN_PT;
    const [bx, by] = points[i] ?? ORIGIN_PT;
    const dx = (bx - ax) / 3;
    d += ` C${p2(ax + dx)},${p2(ay + dx * (t[i - 1] ?? 0))} ${p2(bx - dx)},${p2(by - dx * (t[i] ?? 0))} ${p2(bx)},${p2(by)}`;
  }
  return d;
}

const p1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "0");

/**
 * One path command per pair of neighbouring points (without the initial move), at one decimal. The same point count
 * yields the same command structure, so Motion can morph one path into another. `reverse` walks the curve backwards
 * (for the lower edge of a band).
 * @internal
 */
export function curveSegments(pts: readonly Pt[], curve: ChartCurve, reverse = false): string[] {
  if (pts.length < 2) return [];
  if (curve === "linear") {
    const ordered = reverse ? [...pts].reverse() : pts;
    return ordered.slice(1).map(([x, y]) => `L${p1(x)},${p1(y)}`);
  }
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
        ? `C${p1(c2[0])},${p1(c2[1])} ${p1(c1[0])},${p1(c1[1])} ${p1(x0)},${p1(y0)}`
        : `C${p1(c1[0])},${p1(c1[1])} ${p1(c2[0])},${p1(c2[1])} ${p1(x1)},${p1(y1)}`,
    );
  }
  return reverse ? parts.reverse() : parts;
}

/** A line through `pts` at one decimal (the compact sibling of `linePath`, used by the area charts). @internal */
export function curvePath(pts: readonly Pt[], curve: ChartCurve): string {
  const first = pts[0];
  return first ? `M${p1(first[0])},${p1(first[1])} ${curveSegments(pts, curve).join(" ")}` : "";
}

/** Closed band between an upper and a lower edge (same x positions); a one-point band is a short tick. @internal */
export function bandPath(top: readonly Pt[], bottom: readonly Pt[], curve: ChartCurve): string {
  const first = top[0];
  const last = bottom[bottom.length - 1];
  if (!first || !last) return "";
  const up = curveSegments(top, curve).join(" ");
  const down = curveSegments(bottom, curve, true).join(" ");
  return `M${p1(first[0])},${p1(first[1])} ${up} L${p1(last[0])},${p1(last[1])} ${down} Z`;
}

/** The area between `points` and a horizontal `baseline` (same structure rule as linePath). */
export function areaPath(points: readonly Pt[], baseline: number, curve: ChartCurve = "linear"): string {
  if (points.length === 0) return "";
  const first = points[0] ?? ORIGIN_PT;
  const last = points[points.length - 1] ?? ORIGIN_PT;
  return `${linePath(points, curve)} L${p2(last[0])},${p2(baseline)} L${p2(first[0])},${p2(baseline)} Z`;
}

const compactByLocale = new Map<string, Intl.NumberFormat>();
const fullByLocale = new Map<string, Intl.NumberFormat>();

/**
 * formatCompact for any locale: full digits under 10,000, compact notation above
 * (de: "12.900" / "4,2 Mio."), typographic minus. Without a locale it IS formatCompact.
 */
export function compactFormat(locale?: string): (n: number) => string {
  if (!locale) return formatCompact;
  let compact = compactByLocale.get(locale);
  let full = fullByLocale.get(locale);
  if (!compact || !full) {
    compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
    full = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    compactByLocale.set(locale, compact);
    fullByLocale.set(locale, full);
  }
  const c = compact;
  const f = full;
  return (n: number) => (Number.isFinite(n) ? minus(Math.abs(n) < 10_000 ? f.format(n) : c.format(n)) : "–");
}

/** Signed percent change from `previous` to `current` ("+12.4%", "−3%"), or null when undefined. */
export function percentChange(
  current: number,
  previous: number,
  locale?: string,
): { text: string; direction: "up" | "down" | "flat" } | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  const ratio = (current - previous) / Math.abs(previous);
  const text = new Intl.NumberFormat(locale ?? "en", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(ratio);
  return { text: minus(text), direction: ratio > 0.0005 ? "up" : ratio < -0.0005 ? "down" : "flat" };
}

/* ---------- Live data ---------- */

/**
 * Options of `useLiveData`: how to make the next row, how often (`interval`), how many rows to keep
 * (`max`) and the pause controls.
 */
export type UseLiveDataOptions<T> = {
  /** Make the next row from the rows so far (`tick` counts updates from 1). */
  next: (rows: readonly T[], tick: number) => T;
  /** Milliseconds between updates. Default 1500. */
  interval?: number;
  /** Keep at most this many rows: the oldest drops off as a new one arrives. Default: the initial length. */
  max?: number;
  /** Start paused. */
  defaultPaused?: boolean;
  /** Controlled pause state. */
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  /**
   * The element showing the data. Updates stop while it is off-screen (IntersectionObserver)
   * and while the tab is hidden, so a live chart costs nothing when nobody can see it.
   */
  ref?: RefObject<Element | null>;
};

/**
 * Live (streaming) rows for any chart: appends `next()` every `interval` ms into a sliding
 * window. Pauses off-screen, in hidden tabs and on demand (WCAG 2.2.2: give users a Pause
 * button wired to `setPaused`). Pair it with `<LineChart live />` so new points slide in.
 *
 * Returns `{ data, setData, paused, setPaused, running }`. Options: `next(rows, tick)` (required), `interval` ms (default 1500, minimum 100), `max` rows (default the initial length), `defaultPaused`, `paused` + `onPausedChange` (controlled), and `ref` (the element showing the data).
 * Accessibility: WCAG 2.2.2 asks for a way to pause moving content, so always wire `setPaused` to a button. Updates also stop while the element is off-screen and while the tab is hidden, so a live chart costs nothing when nobody can see it. The chart's table view shows the same rows.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { LineChart, useLiveData } from "@sheenui/theme";
 *
 * type Row = { t: number; users: number };
 *
 * function LiveUsers() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const live = useLiveData<Row>([{ t: 0, users: 120 }], {
 *     next: (_rows, tick) => ({ t: tick, users: 100 + ((tick * 7) % 40) }),
 *     interval: 1000,
 *     max: 30,
 *     ref,
 *   });
 *   return (
 *     <div ref={ref}>
 *       <LineChart live data={live.data} index="t" series={[{ key: "users", label: "Users" }]} aria-label="Users online, live" />
 *       <button type="button" onClick={() => live.setPaused(!live.paused)}>
 *         {live.paused ? "Resume" : "Pause"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts/realtime-chart
 */
export function useLiveData<T>(
  initial: readonly T[],
  { next, interval = 1500, max, defaultPaused = false, paused: pausedProp, onPausedChange, ref }: UseLiveDataOptions<T>,
) {
  const [rows, setRows] = useState<readonly T[]>(initial);
  const [paused, setPaused] = useControllable(pausedProp, defaultPaused, onPausedChange);
  const fallback = useRef<Element | null>(null);
  const inView = useInView(ref ?? fallback, { margin: "120px" });
  const pageVisible = usePageInView();
  // Without a ref there is nothing to watch: treat it as visible.
  const visible = (ref ? inView : true) && pageVisible;
  const running = !paused && visible;
  const tick = useRef(0);
  const nextRef = useRef(next);
  useSyncRef(nextRef, next);
  const limit = max ?? Math.max(1, initial.length);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => {
        // The counter is read here, not inside the updater: React may run updaters later (batched ticks).
        const n = (tick.current += 1);
        setRows((prev) => {
          const row = nextRef.current(prev, n);
          const out = [...prev, row];
          return out.length > limit ? out.slice(out.length - limit) : out;
        });
      },
      Math.max(100, interval),
    );
    return () => window.clearInterval(timer);
  }, [running, interval, limit]);

  return { data: rows, setData: setRows, paused, setPaused, running } as const;
}

/**
 * True once the chart's root has scrolled into view (or straight away under reduced motion):
 * entrances (draw-in, grow-from-baseline) start when someone can actually see them.
 *
 * Returns true once at least 15% of the element has been seen (and stays true), or straight away when `reduced` is true.
 * Not a component: no DOM, no keyboard or screen-reader behaviour. Under reduced motion the entrance is skipped, so content never waits for a scroll.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useChartInView } from "./chart-utils";
 *
 * function Bars({ reduced }: { reduced: boolean }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const play = useChartInView(ref, reduced);
 *   return <div ref={ref} data-play={play} style={{ height: 120 }} />;
 * }
 * ```
 *
 * @see /charts
 */
export function useChartInView(ref: RefObject<Element | null>, reduced: boolean) {
  const seen = useInViewSettled(ref, { amount: 0.15 });
  return reduced || seen;
}

/**
 * True once `ref`'s element has been seen (and stays true), like motion's `useInView(ref, { once: true })`, except that
 * the flip waits for a scroll to settle and a fling's entrances start one per frame (see `whenScrollSettled`): a
 * dashboard of a dozen panels no longer renders them all in one task while the page is moving.
 * `ready` (default true): pass false while the observed element is not mounted yet (a chart that waits for its width), so the observer is attached once it is.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useInViewSettled } from "./chart-utils";
 *
 * function Panel() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const seen = useInViewSettled(ref, { amount: 0.5, margin: "320px 0px" });
 *   return <div ref={ref}>{seen ? "Drawn" : "Waiting"}</div>;
 * }
 * ```
 *
 * @see /charts
 */
export function useInViewSettled(
  ref: RefObject<Element | null>,
  { amount = 0, margin = "0px", ready = true }: { amount?: number; margin?: string; ready?: boolean } = {},
) {
  const [seen, setSeen] = useState(false);
  // Without IntersectionObserver (old browser, test environment) a mounted element counts as seen.
  const noObserver = typeof IntersectionObserver === "undefined";
  useEffect(() => {
    const element = ref.current;
    if (!element || !ready || seen || noObserver) return;
    let cancelSettle: (() => void) | undefined;
    const stop = observeIntersection(
      element,
      (entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < amount * 0.999) return;
        stop();
        cancelSettle = whenScrollSettled(() => setSeen(true));
      },
      { rootMargin: margin, threshold: amount },
    );
    return () => {
      stop();
      cancelSettle?.();
    };
  }, [ref, amount, margin, ready, seen, noObserver]);
  return seen || noObserver;
}

/**
 * Index positions of a window that slid by whole steps: when `next` is `prev` minus its first
 * k items plus k new ones, returns k (1–8), else 0. Live charts use it to slide instead of morph.
 */
export function slideShift(prev: readonly string[], next: readonly string[]) {
  if (prev.length === 0 || prev.length !== next.length) return 0;
  const n = next.length;
  for (let k = 1; k <= Math.min(8, n - 1); k++) {
    let ok = true;
    for (let i = 0; i + k < n; i++) {
      if (prev[i + k] !== next[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return k;
  }
  return 0;
}

/* ---------- Measuring + visibility for callback-ref charts ---------- */

/**
 * useElementWidth that also hands back the element itself (for in-view checks, exports and
 * pointer maths). Same measuring rules: before paint, kept while the element is hidden.
 *
 * Returns `{ ref, element, width }`: attach `ref` to the chart's root, then use `element` for in-view checks, exports and pointer maths, and `width` (px) for layout. A callback ref, so it also follows an element that mounts later (after an empty state).
 * Not a component: no DOM, no keyboard or screen-reader behaviour.
 *
 * @example
 * ```tsx
 * import { useChartFrame, useElementInView } from "@sheenui/theme";
 *
 * function Plot() {
 *   const { ref, element, width } = useChartFrame<HTMLDivElement>();
 *   const visible = useElementInView(element, { once: true });
 *   return (
 *     <div ref={ref} style={{ height: 160 }}>
 *       {width > 0 && visible && <svg width={width} height={160} aria-hidden />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useChartFrame<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [widthRef, width] = useElementWidth<T>();
  const hint = useContext(ChartWidthHint);
  const hinted = useRef(hint > 0);
  useSyncRef(hinted, hint > 0);
  const [ref] = useState(() => (node: T | null) => {
    const stop = widthRef(node);
    // The element is state (in-view checks follow it, even after an empty state). A chart with a
    // width hint (one of many in a gallery) takes it in a transition: a sync update here would
    // re-render the whole chart inside the commit that just mounted it.
    if (hinted.current) startTransition(() => setElement(node));
    else setElement(node);
    return () => {
      stop?.();
      setElement(null);
    };
  });
  return { ref, element, width } as const;
}

/* ---------- Scroll settle (entrances wait for a fling to end) ---------- */

const SCROLL_SETTLE_MS = 140;
let scrollingUntil = 0;
let settleTimer: number | undefined;
let listening = false;
const settleWaiters = new Set<() => void>();

function armSettleTimer() {
  settleTimer = window.setTimeout(() => {
    settleTimer = undefined;
    if (performance.now() < scrollingUntil) {
      armSettleTimer();
      return;
    }
    drainSettleWaiters();
  }, SCROLL_SETTLE_MS);
}

/**
 * Releases the waiting entrances one per frame, not all in one task: a fling over a dashboard collects a dozen
 * entrances, and starting them together is one long render at the moment the page comes to rest. A scroll that
 * resumes mid-way pauses the release.
 */
function drainSettleWaiters() {
  const next = settleWaiters.values().next();
  if (next.done) return;
  settleWaiters.delete(next.value);
  next.value();
  if (settleWaiters.size === 0) return;
  requestAnimationFrame(() => {
    if (performance.now() < scrollingUntil) armSettleTimer();
    else drainSettleWaiters();
  });
}

/**
 * Runs `run` now when the page is not scrolling, else once no scroll event has arrived for a moment. One passive,
 * capturing scroll listener for the whole page (installed on first use). Returns a cancel function.
 */
function whenScrollSettled(run: () => void): () => void {
  if (typeof window === "undefined") {
    run();
    return () => undefined;
  }
  if (!listening) {
    listening = true;
    window.addEventListener(
      "scroll",
      () => {
        scrollingUntil = performance.now() + SCROLL_SETTLE_MS;
      },
      { passive: true, capture: true },
    );
  }
  if (performance.now() >= scrollingUntil) {
    run();
    return () => undefined;
  }
  settleWaiters.add(run);
  if (settleTimer === undefined) armSettleTimer();
  return () => {
    settleWaiters.delete(run);
  };
}

/**
 * Options of `useElementInView`: stay true once seen (`once`), grow the viewport (`margin`) and how
 * much must show (`amount`).
 */
export type ElementInViewOptions = {
  /** Stay true after the first time the element is seen (entrances). Default false (live). */
  once?: boolean;
  /** Grow (or shrink) the viewport, e.g. "200px" to start just before the element arrives. */
  margin?: string;
  /** Fraction of the element that must be visible, 0–1. Default 0. */
  amount?: number;
};

/**
 * Whether `element` is in the viewport (IntersectionObserver). Works with callback refs, so it
 * follows elements that mount later. Without IntersectionObserver (SSR, old engines) it is true.
 *
 * Options: `once` (stay true after the first sighting; default false, so it follows scrolling), `margin` (grow the viewport, e.g. "200px"; default "0px") and `amount` (fraction that must be visible, 0 to 1; default 0). Pass the element itself, or null before it mounts.
 * Used by every chart to pause ambient work off-screen. Not a component: no DOM, no keyboard or screen-reader behaviour.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { useElementInView } from "@sheenui/theme";
 *
 * function Ticker() {
 *   const [el, setEl] = useState<HTMLDivElement | null>(null);
 *   const visible = useElementInView(el, { margin: "120px" });
 *   return <div ref={setEl}>{visible ? "Running" : "Paused off-screen"}</div>;
 * }
 * ```
 *
 * @see /charts
 */
export function useElementInView(
  element: Element | null,
  { once = false, margin = "0px", amount = 0 }: ElementInViewOptions = {},
) {
  const [inView, setInView] = useState(false);
  // Without IntersectionObserver (old browser, test environment) a mounted element counts as in view.
  const noObserver = typeof IntersectionObserver === "undefined";
  useEffect(() => {
    if (!element) return;
    if (noObserver) return;
    let cancelSettle: (() => void) | undefined;
    const stop = observeIntersection(
      element,
      (entry) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= amount * 0.999;
        if (once && !visible) return;
        if (visible && once) {
          stop();
          // An entrance (a chart drawing in, a tile mounting) that is reached during a fling would run while the page
          // is scrolling and cost the frames of the scroll itself; it starts when the scroll settles instead.
          cancelSettle = whenScrollSettled(() => setInView(true));
          return;
        }
        setInView(visible);
      },
      { rootMargin: margin, threshold: amount },
    );
    // Safety net for an entrance: if the observer never reported (a throttled or odd embedder) but the
    // element is on screen a moment later, it plays anyway, so a chart is never stuck undrawn.
    const net = once
      ? window.setTimeout(() => {
          const r = element.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight && r.height > 0) {
            stop();
            cancelSettle = whenScrollSettled(() => setInView(true));
          }
        }, 2500)
      : undefined;
    return () => {
      stop();
      cancelSettle?.();
      window.clearTimeout(net);
    };
  }, [element, once, margin, amount, noObserver]);
  return noObserver ? element !== null : inView;
}

/** Index of the row whose `index` value equals `key` (synced crosshairs, event markers). -1 when absent. */
export function indexOfKey(data: readonly ChartRow[], index: string, key: string | number | null | undefined) {
  if (key === null || key === undefined) return -1;
  if (
    typeof key === "number" &&
    Number.isInteger(key) &&
    key >= 0 &&
    key < data.length &&
    typeof data[key]?.[index] !== "number"
  ) {
    // A plain row position (annotations may point at rows by position).
    return key;
  }
  const want = String(key);
  for (let i = 0; i < data.length; i++) if (String(data[i]?.[index] ?? "") === want) return i;
  return -1;
}

const localeTickFormatters = new Map<string, Intl.NumberFormat>();

/**
 * formatTick for any locale: ticks keep exactly the decimals their step needs (0.25 stays
 * 0,25 in German), compact from 10,000. Without a locale it IS formatTick.
 */
export function localeTickFormat(locale?: string): (n: number) => string {
  if (!locale) return formatTick;
  const get = (compact: boolean, digits: number) => {
    const key = `${locale}|${compact}|${digits}`;
    let f = localeTickFormatters.get(key);
    if (!f) {
      f = new Intl.NumberFormat(locale, { notation: compact ? "compact" : "standard", maximumFractionDigits: digits });
      localeTickFormatters.set(key, f);
    }
    return f;
  };
  return (n: number) => {
    if (!Number.isFinite(n)) return "–";
    const abs = Math.abs(n);
    if (abs < 10_000) return minus(get(false, decimalsOf(n)).format(n));
    const unit = abs >= 1e12 ? 1e12 : abs >= 1e9 ? 1e9 : abs >= 1e6 ? 1e6 : 1e3;
    return minus(get(true, decimalsOf(n / unit)).format(n));
  };
}

/**
 * A chart's own props plus the `ref` and the remaining attributes of its root element (`id`, `data-*`, `aria-*`, event
 * handlers, ...), which every chart forwards to that element. `className` stays the chart's own prop and `style` is not
 * accepted (the chart sizes itself); a prop the chart already declares wins over the same attribute of the element.
 */
export type ChartRoot<P> = P &
  Omit<HTMLAttributes<HTMLDivElement>, keyof P | "children" | "style"> & { ref?: Ref<HTMLDivElement> };

/** Props of {@link ChartWidthHint}. The width (px) charts inside can assume before they have measured themselves, e.g. */
export type ChartWidthHintProps = ComponentProps<typeof ChartWidthHint>;
