"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cubicBezier } from "motion/react";

import { duration, ease } from "../../motion/tokens";
import { useResolvedScheme } from "../../hooks/use-resolved-scheme";
import { useSyncRef } from "../../hooks/use-latest";
import { LegendKey, type TooltipRow } from "./chart-parts";
import { ChartTip, placeChartTip, type ChartTipAnchor, type ChartTipSide } from "./heatmap";

/* ======================================================================
 * Shared by the flow & hierarchy charts (sankey, sunburst, chord, network
 * graph, marimekko): glow, text halo, text measuring, shapes, the theme
 * and pointer hooks, and a tooltip that follows a mark without re-rendering.
 * Copy this file along with any of those charts.
 * ====================================================================== */

/**
 * The dark-mode glow of an active mark: a soft drop-shadow in the mark's own colour, applied to
 * the mark itself (never to glass or a wrapper). In light mode the shadow colour is transparent,
 * so nothing is drawn.
 */
export function markGlow(color: string, blur = 6) {
  return `drop-shadow(0 0 ${blur}px light-dark(transparent, color-mix(in oklab, ${color} 70%, transparent)))`;
}

/**
 * SVG text drawn over marks keeps its contrast with a halo in the chart surface colour, painted
 * under the glyphs (paint-order: stroke). High Contrast swaps it for the Canvas colour.
 */
export const haloTextClass =
  "[paint-order:stroke] [stroke-linejoin:round] [stroke-width:6px] [stroke:var(--sheen-chart-surface)] forced-colors:[stroke:Canvas]";

/* ---------- Text ---------- */

let measureCtx: CanvasRenderingContext2D | null | undefined;
let measureFamily = "";
const measured = new Map<string, number>();

/**
 * Width in px of `text` set in the page's sans font (canvas measureText), so labels are fitted to
 * the real glyphs rather than an average. Cached; falls back to an estimate outside the browser.
 */
export function measureText(text: string, size = 12, weight = 400) {
  if (measureCtx === undefined) {
    measureCtx = typeof document === "undefined" ? null : (document.createElement("canvas").getContext("2d") ?? null);
    if (measureCtx && typeof getComputedStyle === "function")
      measureFamily = getComputedStyle(document.body).fontFamily;
  }
  if (!measureCtx) return text.length * size * 0.58;
  const key = `${weight}|${size}|${text}`;
  const hit = measured.get(key);
  if (hit !== undefined) return hit;
  measureCtx.font = `${weight} ${size}px ${measureFamily || "Inter, ui-sans-serif, system-ui, sans-serif"}`;
  // A little slack for fallback fonts that are wider than the one measured.
  const w = measureCtx.measureText(text).width * 1.04;
  // Measured before the web font arrived? Don't cache a fallback-font width.
  if (typeof document === "undefined" || !("fonts" in document) || document.fonts.status === "loaded") {
    if (measured.size > 4000) measured.clear();
    measured.set(key, w);
  }
  return w;
}

function subscribeFonts(onChange: () => void) {
  if (typeof document === "undefined" || !("fonts" in document)) return () => undefined;
  document.fonts.addEventListener("loadingdone", onChange);
  return () => document.fonts.removeEventListener("loadingdone", onChange);
}
const fontsLoaded = () => typeof document === "undefined" || !document.fonts || document.fonts.status === "loaded";

/**
 * True once the page's web fonts have loaded. A chart that fits labels with measureText calls it,
 * so labels measured with a fallback font are fitted again (once) when the real font arrives.
 *
 * Takes no arguments; returns true once the page's web fonts have loaded (and straight away where the Font Loading API is missing). Use it to re-fit labels measured with `measureText`. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useFontsLoaded } from "./flow-utils";
 *
 * function Labels() {
 *   const fontsReady = useFontsLoaded();
 *   return <p>{fontsReady ? "Labels fitted with the real font" : "Labels fitted with a fallback"}</p>;
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function useFontsLoaded() {
  return useSyncExternalStore(subscribeFonts, fontsLoaded, () => true);
}

/**
 * The longest prefix of `text` (with an ellipsis) that fits in `maxWidth` px, or "" when fewer
 * than `minChars` characters would fit (the label is then left out, never squeezed).
 */
export function fitText(text: string, maxWidth: number, size = 12, weight = 400, minChars = 3) {
  if (maxWidth <= 0) return "";
  if (measureText(text, size, weight) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measureText(`${text.slice(0, mid).trimEnd()}…`, size, weight) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo >= Math.min(minChars, text.length) ? `${text.slice(0, lo).trimEnd()}…` : "";
}

/**
 * Splits `text` into at most two lines of `maxWidth` px at a space (the second line shortened
 * with an ellipsis if it must be). Returns null when even two lines can't hold the first word.
 */
export function wrapText(text: string, maxWidth: number, size = 12, weight = 400): [string, string] | [string] | null {
  if (measureText(text, size, weight) <= maxWidth) return [text];
  const words = text.split(/\s+/);
  if (words.length < 2) return null;
  let line = "";
  let k = 0;
  for (; k < words.length; k++) {
    const next = line ? `${line} ${words[k]}` : (words[k] ?? "");
    if (measureText(next, size, weight) > maxWidth) break;
    line = next;
  }
  if (!line) return null;
  const rest = fitText(words.slice(k).join(" "), maxWidth, size, weight, 3);
  return rest ? [line, rest] : null;
}

/* ---------- Shapes ---------- */

/**
 * Rounds to two decimals, and turns a non-finite number into 0. Pure, but exported from a client
 * module: call it from client code.
 */
export const r2 = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

/**
 * A rectangle with every corner rounded by `r` (clamped to fit), always with the same command
 * structure, so any of these paths can be tweened into any other.
 */
export function roundedRectPath(x: number, y: number, w: number, h: number, r = 4) {
  w = Math.max(0, Number.isFinite(w) ? w : 0);
  h = Math.max(0, Number.isFinite(h) ? h : 0);
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  const X = r2(x);
  const Y = r2(y);
  const R = r2(x + w);
  const B = r2(y + h);
  return (
    `M${X},${r2(y + k)} Q${X},${Y} ${r2(x + k)},${Y} H${r2(x + w - k)} Q${R},${Y} ${R},${r2(y + k)} ` +
    `V${r2(y + h - k)} Q${R},${B} ${r2(x + w - k)},${B} H${r2(x + k)} Q${X},${B} ${X},${r2(y + h - k)} Z`
  );
}

/** Point at `angle` (radians, 0 = 12 o'clock, clockwise) on a circle of radius r around (cx, cy). */
export function polar(cx: number, cy: number, r: number, angle: number) {
  return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)] as const;
}

const TURN = Math.PI * 2;

/**
 * An annular sector between radii r0 and r1 from angle a0 to a1 (0 = 12 o'clock, clockwise),
 * with a constant `gap` in px between it and its neighbours on every side (so the gaps are
 * parallel strips, like the 2px gaps between bars). Returns "" when nothing is left to draw.
 * A full ring (one sector, the whole turn) is drawn as an annulus (fill-rule evenodd).
 */
export function ringSector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, gap = 2) {
  const half = gap / 2;
  const ri = r0 > 0 ? r0 + half : 0;
  const ro = r1 - half;
  if (ro <= ri || !(a1 > a0)) return "";
  if (a1 - a0 >= TURN - 1e-6) {
    const ring = (r: number) => {
      const [x0, y0] = polar(cx, cy, r, 0);
      const [x1, y1] = polar(cx, cy, r, Math.PI);
      return `M${r2(x0)},${r2(y0)} A${r2(r)},${r2(r)} 0 1 1 ${r2(x1)},${r2(y1)} A${r2(r)},${r2(r)} 0 1 1 ${r2(x0)},${r2(y0)} Z`;
    };
    return ri > 0 ? `${ring(ro)} ${ring(ri)}` : ring(ro);
  }
  const po = Math.min(half / ro, (a1 - a0) / 2);
  const s0 = a0 + po;
  const e0 = a1 - po;
  if (e0 - s0 <= 1e-4) return "";
  const [ox0, oy0] = polar(cx, cy, ro, s0);
  const [ox1, oy1] = polar(cx, cy, ro, e0);
  const largeO = e0 - s0 > Math.PI ? 1 : 0;
  if (ri <= 0) {
    return `M${r2(cx)},${r2(cy)} L${r2(ox0)},${r2(oy0)} A${r2(ro)},${r2(ro)} 0 ${largeO} 1 ${r2(ox1)},${r2(oy1)} Z`;
  }
  const pi = half / ri;
  const s1 = a0 + pi;
  const e1 = a1 - pi;
  if (e1 - s1 <= 1e-4) {
    // Too thin at the inner edge for parallel gaps: taper to a point there.
    const mid = (a0 + a1) / 2;
    const [ix, iy] = polar(cx, cy, ri, mid);
    return `M${r2(ox0)},${r2(oy0)} A${r2(ro)},${r2(ro)} 0 ${largeO} 1 ${r2(ox1)},${r2(oy1)} L${r2(ix)},${r2(iy)} Z`;
  }
  const [ix1, iy1] = polar(cx, cy, ri, e1);
  const [ix0, iy0] = polar(cx, cy, ri, s1);
  const largeI = e1 - s1 > Math.PI ? 1 : 0;
  return (
    `M${r2(ox0)},${r2(oy0)} A${r2(ro)},${r2(ro)} 0 ${largeO} 1 ${r2(ox1)},${r2(oy1)} ` +
    `L${r2(ix1)},${r2(iy1)} A${r2(ri)},${r2(ri)} 0 ${largeI} 0 ${r2(ix0)},${r2(iy0)} Z`
  );
}

/* ---------- Motion outside React ---------- */

/**
 * The motion tokens' curves as functions, for the staggered pieces of one 0→1 progress value:
 * a chart runs ONE tween and each mark reads its own slice of it, instead of
 * starting an animation per mark.
 */
export const enterCurve = cubicBezier(...ease.out);
/**
 * The easing curve used when a flow chart reshapes after a data change (the `inOut` curve of the
 * motion tokens).
 */
export const changeCurve = cubicBezier(...ease.inOut);

/** 0→1 progress of a piece that starts `delay` s into a tween and lasts `length` s, eased. */
export function slice(elapsed: number, delay: number, length: number, curve: (t: number) => number = enterCurve) {
  const t = (elapsed - delay) / Math.max(1e-6, length);
  return t <= 0 ? 0 : t >= 1 ? 1 : curve(t);
}

/**
 * Linear interpolation: `a` at `t = 0`, `b` at `t = 1`. Pure, but exported from a client module: call
 * it from client code.
 */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Marks that just left the data: React has already removed them, so they are moved into a layer
 * React doesn't manage (`layer` renders no children of its own), faded out with one compositor
 * opacity animation each, then dropped. Elements still in the chart are left alone.
 */
export function fadeOutLeaving(layer: SVGGElement | null, elements: Iterable<SVGElement>) {
  if (!layer) return;
  for (const el of elements) {
    if (el.isConnected || typeof el.animate !== "function") continue;
    el.style.pointerEvents = "none";
    // A ribbon painted with a gradient that left with it falls back to a plain colour.
    if (el.dataset.stroke) el.setAttribute("stroke", el.dataset.stroke);
    layer.appendChild(el);
    const from = Number(el.style.opacity || getComputedStyle(el).opacity || 1);
    const animation = el.animate([{ opacity: from }, { opacity: 0 }], {
      duration: duration.exit * 1000,
      easing: `cubic-bezier(${ease.exit.join(",")})`,
      fill: "forwards",
    });
    animation.onfinish = () => el.remove();
    animation.oncancel = () => el.remove();
  }
}

/** Children of an SVG layer by their `data-id`, so a chart can paint its marks directly. */
export function marksById<T extends SVGElement>(layer: Element | null) {
  const map = new Map<string, T>();
  if (!layer) return map;
  for (const el of Array.from(layer.children) as T[]) {
    const id = el.dataset.id;
    if (id !== undefined) map.set(id, el);
  }
  return map;
}

/* ---------- Media hooks (the shared stores live in src/hooks/use-media-query.ts) ---------- */

/**
 * True when the page renders dark: a forced `data-theme="dark"`, or no forced theme and a dark
 * OS. For effects CSS can't switch by theme (blend modes, mark opacity), never for colours.
 *
 * Takes no arguments; returns true when the page renders dark (a forced `data-theme="dark"`, or no forced theme and a dark OS). Use it for effects CSS cannot switch by theme (blend modes, mark opacity), never for colours: colours come from the `--sheen-*` tokens. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useDarkScheme } from "./flow-utils";
 *
 * function Ribbon() {
 *   const dark = useDarkScheme();
 *   return <path d="M0 0H10V10H0Z" fill="var(--sheen-chart-1)" fillOpacity={dark ? 0.7 : 0.55} />;
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function useDarkScheme() {
  return useResolvedScheme() === "dark";
}

/**
 * How translucent ribbons overlap: like ink on the light theme (multiply: crossings get richer),
 * like light on the dark theme (screen: crossings glow). With many crossing ribbons (`count` > 5
 * groups) the light theme blends normally at a lower opacity, so dense knots stay clean instead
 * of turning near-black. Plain under forced colours.
 */
export function ribbonBlend(dark: boolean, count = 0) {
  if (dark) return { opacity: 0.6, blend: "screen" as const };
  return count > 5 ? { opacity: 0.42, blend: "normal" as const } : { opacity: 0.5, blend: "multiply" as const };
}

/** Pointer + keyboard "who's active" bookkeeping shared by these charts: a tap pins, a second tap on the same mark activates it. */
export type TapState = { id: string | null; wasActive: boolean; touch: boolean };

/* ---------- A value that changes every frame, outside React ---------- */

/**
 * A value that changes on every pointer move or animation frame (where the pointer is, where a
 * moving mark is), kept out of React state: `set` is cheap and subscribers hear about it at most
 * once per frame (`setNow` tells them at once, for callers already inside a frame).
 */
export type FrameStore<T> = {
  set: (value: T | null) => void;
  setNow: (value: T | null) => void;
  get: () => T | null;
  subscribe: (onChange: () => void) => () => void;
};

/**
 * Creates a store that holds one value and tells its subscribers at most once per animation frame, for
 * charts that draw without React renders. Browser-only (uses `requestAnimationFrame`); call it from
 * client code.
 */
export function createFrameStore<T>(): FrameStore<T> {
  let value: T | null = null;
  let raf = 0;
  const subs = new Set<() => void>();
  const notify = () => {
    raf = 0;
    for (const fn of subs) fn();
  };
  return {
    set: (next) => {
      if (next === value) return;
      value = next;
      if (subs.size === 0) return;
      if (typeof requestAnimationFrame === "undefined") notify();
      else if (!raf) raf = requestAnimationFrame(notify);
    },
    setNow: (next) => {
      value = next;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      notify();
    },
    get: () => value,
    subscribe: (onChange) => {
      subs.add(onChange);
      return () => {
        subs.delete(onChange);
        if (subs.size === 0 && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
    },
  };
}

/**
 * A FrameStore that lives as long as the component.
 *
 * Returns a store with `set(value)` (notifies once per animation frame), `setNow(value)`, `get()` and `subscribe(fn)`, kept for the component's lifetime. Use it for values that change every frame (a dragged anchor), read through `useSyncExternalStore` or a transform write, so React does not re-render per frame. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useFrameStore } from "./flow-utils";
 *
 * function Drag() {
 *   const store = useFrameStore<{ x: number; y: number }>();
 *   return <div onPointerMove={(e) => store.set({ x: e.clientX, y: e.clientY })}>Drag over me</div>;
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function useFrameStore<T>(): FrameStore<T> {
  const [store] = useState(() => createFrameStore<T>());
  return store;
}

type Point = { x: number; y: number };

/** Where the pointer is, for a tooltip that follows it along a long mark (a ribbon). */
export type PointerStore = FrameStore<Point>;

/**
 * A frame-batched store for the pointer position over a long mark (a ribbon), so a tooltip can follow it without re-rendering the chart. Pair it with FlowTip's `store` prop or PointerFollow.
 *
 * Returns a FrameStore of `{ x, y }` in px: write it with `set` from pointer events and clear it with `set(null)` on leave. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { usePointerStore } from "./flow-utils";
 *
 * function Ribbon() {
 *   const pointer = usePointerStore();
 *   return <path d="M0 0H100V20H0Z" onPointerMove={(e) => pointer.set({ x: e.clientX, y: e.clientY })} onPointerLeave={() => pointer.set(null)} />;
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function usePointerStore(): PointerStore {
  return useFrameStore<Point>();
}

/**
 * Renders `children(point)`; only this re-renders when the pointer moves. Prefer FollowTip, which doesn't re-render at all.
 *
 * Props: `store` (a PointerStore) and `children(point)` (a render function that gets `{ x, y }` or null). Only this component re-renders when the pointer moves. Prefer FlowTip with a `store`, which does not re-render at all. Renders no DOM of its own; accessibility and motion come from what you render.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { PointerFollow, usePointerStore } from "./flow-utils";
 *
 * function Readout() {
 *   const pointer = usePointerStore();
 *   return <PointerFollow store={pointer}>{(point) => (point ? <p aria-hidden>{`${point.x}, ${point.y}`}</p> : null)}</PointerFollow>;
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function PointerFollow({
  store,
  children,
}: {
  store: PointerStore;
  children: (point: Point | null) => ReactNode;
}) {
  const point = useSyncExternalStore(store.subscribe, store.get, () => null);
  return <>{children(point)}</>;
}

/* ---------- Tooltip: measured without forcing a layout, moved without re-rendering ---------- */

/**
 * Props of FlowTip, the tooltip of the flow charts: title, rows, the anchor mark (or a frame store
 * holding it), the chart bounds and `docked`.
 */
export type FlowTipProps = {
  /** The heading of the tooltip (what is being read). */
  title: string;
  /** The values to list: { label, value, color, kind?, dashed? }. */
  rows: TooltipRow[];
  /** The mark being read, in px relative to the chart box. */
  anchor: ChartTipAnchor;
  /** Size of the chart box the tooltip must stay inside. */
  bounds: { w: number; h: number };
  /**
   * Where the anchor is right now, when it keeps moving (the pointer along a ribbon, a node being
   * dragged or panned): each change moves the tooltip with one transform write, no React render.
   */
  store?: FrameStore<ChartTipAnchor>;
  /** The one-line readout pinned to the top of a narrow chart instead. */
  docked?: boolean;
  /** Sides to try first, in order: "right", "left", "below", "above". */
  order?: readonly ChartTipSide[];
};

/**
 * The glass tooltip of the flow charts (the same look as ChartTip). It never forces a layout: its
 * size comes from a ResizeObserver, which the browser runs after its own layout of the frame
 * (before paint), and it is placed with a transform. So a new reading costs no synchronous
 * style/layout pass, and a moving anchor costs one transform write per frame. Visual only: the
 * chart announces the same values (ChartAnnouncer).
 *
 * Props: `title`, `rows` ({ label, value, color }), `anchor` ({ x, y, w, h }: the mark being read, in px inside the chart box), `bounds` ({ w, h }: the box it must stay inside), `store` (a FrameStore of anchors for a moving mark), `docked` (the one-line readout pinned to the top of a narrow chart; default false) and `order` (sides to try first).
 * Accessibility and glass: visual only (`aria-hidden`); the chart announces the same values through ChartAnnouncer. A single glass-look surface placed with a transform, no layout reads, and no backdrop blur on the plot.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { FlowTip } from "./flow-utils";
 *
 * export function Example() {
 *   return (
 *     <div style={{ position: "relative", width: 320, height: 160 }}>
 *       <FlowTip title="Search to Signup" rows={[{ label: "Visits", value: "60", color: "var(--sheen-chart-1)" }]} anchor={{ x: 120, y: 60, w: 40, h: 20 }} bounds={{ w: 320, h: 160 }} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function FlowTip({ title, rows, anchor, bounds, store, docked = false, order }: FlowTipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useRef<{ w: number; h: number } | null>(null);
  const latest = useRef({ anchor, bounds, order, store });
  useSyncRef(latest, { anchor, bounds, order, store });
  const place = useRef(() => undefined);
  useSyncRef(place, () => {
    const el = ref.current;
    const sz = size.current;
    if (!el || !sz) return;
    const { anchor: a, bounds: b, order: o, store: st } = latest.current;
    const { x, y } = placeChartTip(st?.get() ?? a, sz, b, { order: o });
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    el.style.visibility = "";
  });

  // Size: from the browser's own layout (ResizeObserver), never read synchronously.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      // Older WebKit lacks borderBoxSize: the type says it is always there.
      const sizes: readonly ResizeObserverSize[] | undefined = entries[0]?.borderBoxSize;
      const box = sizes?.[0];
      size.current = box ? { w: box.inlineSize, h: box.blockSize } : { w: el.offsetWidth, h: el.offsetHeight };
      place.current();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [docked]);
  // A moving anchor: follow it.
  useLayoutEffect(() => store?.subscribe(() => place.current()), [store]);
  // Another mark, or a resized chart: place again with the size already known.
  useLayoutEffect(() => place.current(), [anchor.x, anchor.y, anchor.w, anchor.h, bounds.w, bounds.h]);

  if (docked) return <ChartTip title={title} rows={rows} anchor={anchor} bounds={bounds} docked />;
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="chart-tooltip"
      className="glass-3 pointer-events-none absolute top-0 left-0 z-10 w-max max-w-[min(18rem,calc(100%-8px))] min-w-28 rounded-sheen-md px-3 py-2.5 text-xs text-sheen-fg"
      style={{ visibility: "hidden" }}
    >
      <p className="mb-1.5 font-medium text-sheen-fg-muted">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-2 whitespace-nowrap">
            {row.color === "transparent" ? (
              <span aria-hidden className="w-3.5 shrink-0" />
            ) : (
              <LegendKey color={row.color} kind={row.kind ?? "line"} />
            )}
            <span className="font-semibold text-sheen-fg tabular-nums">{row.value}</span>
            {row.label && <span className="text-sheen-fg-muted">{row.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
