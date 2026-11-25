"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useSyncRef } from "../../../../hooks/use-latest";
import { animate, type ValueAnimationTransition } from "motion/react";

import { duration } from "../../../../motion/tokens";
import { useDockedReadout } from "../../chart-fit";
import { changeEase, enterEase } from "../../chart-utils";
import { textWidth } from "../../chart-pointer";

/* ======================================================================
 * Interaction kit shared by the distribution and comparison charts
 * (histogram, box plot, lollipop, dumbbell, diverging bars, beeswarm).
 * ====================================================================== */

/**
 * Mirror helpers for a plot `span` px wide: everything is laid out left to right, then flipped
 * here for right-to-left pages. Marks go in a group with `transform`; text is placed with `x`
 * and `anchor` (text itself is never mirrored).
 */
export function chartMirror(rtl: boolean, span: number) {
  return {
    rtl,
    x: (x: number) => (rtl ? span - x : x),
    /** Left edge of a box that is `w` wide and starts at `x` (logical). */
    left: (x: number, w: number) => (rtl ? span - x - w : x),
    anchor: (a: "start" | "middle" | "end"): "start" | "middle" | "end" =>
      rtl && a !== "middle" ? (a === "start" ? "end" : "start") : a,
    transform: rtl ? `matrix(-1 0 0 1 ${span} 0)` : undefined,
    /** Arrow keys that move "forward" along the plot. */
    next: rtl ? "ArrowLeft" : "ArrowRight",
    prev: rtl ? "ArrowRight" : "ArrowLeft",
  };
}

/**
 * A signed difference as text: "+12", "−4" (typographic minus, the width of "+" and read as
 * "minus"). Never "++12" when the format already signs its numbers.
 */
export function signedText(v: number, text: string) {
  const t = text.replace(/^-/, "−");
  return v > 0 && !/^[+−]/.test(t) ? `+${t}` : t;
}

/**
 * Fill for a mark's glow copy: invisible on light surfaces, a soft halo of the mark's own colour on
 * dark ones (where light-emitting marks read as "lit"). Drawn behind the crisp mark, blurred by
 * <GlowFilter>, never on glass.
 */
export function glowColor(color: string, strength = 70) {
  return `light-dark(transparent, color-mix(in oklab, ${color} ${strength}%, transparent))`;
}

/** `text`, cut with an ellipsis so it fits `maxPx` at `px` (see textWidth). Whole when it fits. */
export function fitText(text: string, maxPx: number, px = 12, bold = false): string {
  if (textWidth(text, px, bold) <= maxPx) return text;
  const chars = Array.from(text);
  let n = chars.length - 1;
  while (n > 1 && textWidth(`${chars.slice(0, n).join("").trimEnd()}…`, px, bold) > maxPx) n--;
  return `${chars.slice(0, n).join("").trimEnd()}…`;
}

/**
 * Ink of the context marks when some items are highlighted: a grey that steps back from the
 * highlighted series (lighter than it in light mode, dimmer in dark) yet keeps ≥ 3:1 against the
 * chart surface, so the marks stay readable.
 */
export const CONTEXT_GREY =
  "light-dark(color-mix(in oklab, var(--sheen-fg-subtle) 66%, var(--sheen-chart-surface)), color-mix(in oklab, var(--sheen-fg-subtle) 62%, var(--sheen-chart-surface)))";

/** A box in the user space of the element that uses a filter: x, y, width, height. */
export type GlowRegion = { x: number; y: number; w: number; h: number };

/**
 * The blur behind glowing marks. Give it the glowing mark's `region` (its box in the mark's own
 * coordinates; padded here by three blur radii): the blur then rasterises only around that mark,
 * which keeps hovering cheap even under glass tooltips. Without a region it covers the whole svg
 * (thin lines and dots glow too, but every repaint blurs the full chart).
 *
 * Props: `id` (reference it with `filter="url(#id)"`), `blur` (standard deviation in px; default 5) and `region` (the glowing mark's box in its own coordinates; padded by three blur radii). Place it in `<defs>`. Decorative: it has no DOM output of its own beyond the filter, and charts apply it only in dark mode and not under reduced motion.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { GlowFilter } from "./kit";
 *
 * export function Example() {
 *   return (
 *     <svg width={80} height={40} aria-hidden>
 *       <defs>
 *         <GlowFilter id="bar-glow" region={{ x: 10, y: 10, w: 20, h: 20 }} />
 *       </defs>
 *       <rect x={10} y={10} width={20} height={20} fill="var(--sheen-chart-1)" filter="url(#bar-glow)" />
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function GlowFilter({ id, blur = 5, region }: { id: string; blur?: number; region?: GlowRegion | null }) {
  if (region) {
    const pad = blur * 3;
    return (
      <filter
        id={id}
        filterUnits="userSpaceOnUse"
        x={region.x - pad}
        y={region.y - pad}
        width={Math.max(1, region.w) + 2 * pad}
        height={Math.max(1, region.h) + 2 * pad}
      >
        <feGaussianBlur stdDeviation={blur} />
      </filter>
    );
  }
  return (
    <filter id={id} filterUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={blur} />
    </filter>
  );
}

/* ---------- Performance kit: hover never re-renders the marks ---------- */

/**
 * Classes for the group that holds a chart's marks: while a mark is being read the whole layer
 * steps back with ONE opacity change (no per-mark animation or re-render), and an overlay redraws
 * the active mark at full strength on top. Instant under reduced motion.
 */
export const dimLayerClass =
  "transition-opacity duration-(--sheen-duration-fast) ease-sheen-out motion-reduced:transition-none data-dim:opacity-35 forced-colors:data-dim:opacity-50";

const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange, { passive: true });
  return () => window.removeEventListener("resize", onChange);
};

/**
 * Whether a chart docks its readout in the band above the plot (touch screens, narrow charts; see
 * useDockedReadout). A plot taller than 60% of the viewport floats its readout beside the tapped
 * mark instead: a band at the top of a tall chart is off screen while you tap its lower marks.
 *
 * Arguments: the chart's `width` and `plotHeight` in px. Returns true when the readout should dock above the plot (touch screen, narrow chart, and a plot no taller than 60% of the viewport). Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useDockFits } from "./kit";
 *
 * function Plot({ width }: { width: number }) {
 *   const docked = useDockFits(width, 280);
 *   return <p>{docked ? "Readout above the plot" : "Floating tooltip"}</p>;
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function useDockFits(width: number, plotHeight: number) {
  const docked = useDockedReadout(width);
  const viewport = useSyncExternalStore(
    subscribeViewport,
    () => window.innerHeight,
    () => 800,
  );
  return docked && plotHeight <= viewport * 0.6;
}

/** A mark's numeric state (geometry), which `write` turns into attributes. */
export type MarkState = readonly number[];

/** How a mark enters on first view: the element to animate and its Web Animation keyframes and timing. */
export type MarkEntrance = {
  /** The element to animate, when it isn't the mark itself (a part inside a mark that is a group). */
  target?: Element | null;
  /** Web Animation keyframes (opacity / transform only). The last one may leave out values to end on the mark's own. */
  keyframes: Keyframe[];
  /** Seconds. */
  delay?: number;
  /** Seconds. Default duration.slow. */
  duration?: number;
  /** Default: the theme's ease-out. */
  easing?: string;
};

/**
 * How one kind of mark moves: how to write its state into the element, how it enters and exits, and
 * its transition.
 */
export type MarkMotionSpec = {
  /** Writes a state into its mark's element (`d`, `transform`...). Called every frame of a change. */
  write: (el: SVGElement, state: MarkState) => void;
  /** The first-view entrance of one mark (or of several of its parts). Without it marks simply appear with the layer. */
  entrance?: (state: MarkState, key: string, el: SVGElement) => MarkEntrance | readonly MarkEntrance[] | null;
  /** Where a mark that arrives with new data starts; it fades in too. Default: its final state. */
  enterFrom?: (state: MarkState) => MarkState;
  /** Where a mark that leaves goes while it fades out. Default: it fades where it was. */
  exitTo?: (state: MarkState) => MarkState;
  /** Data-change timing (a Motion transition for a 0 → 1 progress). Default duration.slow on the change ease. */
  transition?: ValueAnimationTransition<number>;
  /** Above this many moving marks a change cross-fades the layer instead of moving each mark. */
  maxMoving?: number;
  /**
   * Above this many marks (default 150) the first view animates the layer as a whole instead of
   * each mark: hundreds of running per-mark animations would each become a compositor layer, and
   * committing those blocks the main thread.
   */
  maxEntrance?: number;
  /** The entrance of a dense layer: the layer as a whole, or a few groups inside it (opacity / transform / clip-path). Default: a fade. */
  layerEntrance?: (layer: SVGGElement) => MarkEntrance | readonly MarkEntrance[];
};

type MarkJob = { key: string; el: SVGElement; from: MarkState; to: MarkState; cur: number[] };

const SVG_NS = "http://www.w3.org/2000/svg";
const EASE_OUT_CSS = `cubic-bezier(${enterEase.join(",")})`;

/** One entrance or several as a list (`Array.isArray` does not narrow a readonly array). */
function entranceList(e: MarkEntrance | readonly MarkEntrance[]): readonly MarkEntrance[] {
  return "keyframes" in e ? [e] : e;
}

let springCss: string | null = null;
/**
 * The theme's snappy spring as a CSS easing (--sheen-ease-snappy, a linear() curve), for Web
 * Animations that pop a mark in. Read once; the ease-out curve where it isn't available.
 */
export function springEasing() {
  if (springCss === null) {
    const v =
      typeof document === "undefined"
        ? ""
        : getComputedStyle(document.documentElement).getPropertyValue("--sheen-ease-snappy").trim();
    springCss = v && typeof CSS !== "undefined" && CSS.supports("transition-timing-function", v) ? v : EASE_OUT_CSS;
  }
  return springCss;
}

/**
 * Animates a layer of many plain SVG marks without a React or Motion component per mark (the cost
 * that made hover and data changes slow with hundreds of marks):
 *
 * - React renders every mark in its FINAL state, with `data-k` = its key.
 * - Entrance: when `play` first turns true, each mark gets one Web Animation (opacity / transform,
 *   compositor-friendly, started before the first visible paint). Hide the layer until then.
 * - Data change: one Motion progress animation interpolates every moved mark from where it was
 *   (mid-flight if a change was running) to its new state through `write`, in a single frame loop.
 *   Arriving marks fade in from `enterFrom`; leaving marks fade out in `ghostRef` (their old
 *   elements are re-used, so nothing is re-rendered for them).
 * - `resetKey` changes (the chart's width): marks jump, no animation. Reduced motion: no animation.
 *
 * Arguments: `layerRef` (the `<g>` holding the marks), `ghostRef` (a `<g>` for marks that are leaving, or null), `marks` (a Map of key to numeric state, e.g. from `markMap`), `{ play, reduced, resetKey }` and a `spec` ({ write, entrance?, enterFrom?, exitTo?, transition?, maxMoving?, maxEntrance?, layerEntrance? }). Render each mark in its final state with `data-k` set to its key. Not a component: no DOM of its own. With `reduced`, marks jump with no animation.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { markMap, useMarkMotion } from "./kit";
 *
 * function Bars({ values, play, reduced }: { values: number[]; play: boolean; reduced: boolean }) {
 *   const layer = useRef<SVGGElement>(null);
 *   const ghost = useRef<SVGGElement>(null);
 *   const marks = markMap(
 *     values,
 *     (_v, i) => String(i),
 *     (v) => [v],
 *   );
 *   useMarkMotion(layer, ghost, marks, { play, reduced }, { write: (el, [h = 0]) => el.setAttribute("height", String(h)) });
 *   return (
 *     <svg width={120} height={60} aria-hidden>
 *       <g ref={layer}>
 *         {values.map((v, i) => (
 *           <rect key={i} data-k={String(i)} x={i * 12} width={10} height={v} />
 *         ))}
 *       </g>
 *       <g ref={ghost} />
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function useMarkMotion(
  layerRef: RefObject<SVGGElement | null>,
  ghostRef: RefObject<SVGGElement | null> | null,
  marks: ReadonlyMap<string, MarkState>,
  { play, reduced, resetKey }: { play: boolean; reduced: boolean; resetKey?: unknown },
  spec: MarkMotionSpec,
) {
  const specRef = useRef(spec);
  const prev = useRef<{
    marks: ReadonlyMap<string, MarkState>;
    els: Map<string, SVGElement>;
    resetKey: unknown;
  } | null>(null);
  const running = useRef<{ stop: () => void; jobs: MarkJob[] } | null>(null);
  const entered = useRef(false);
  const entrances = useRef<Animation[]>([]);

  useSyncRef(specRef, spec);

  // Data changes.
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) {
      prev.current = null;
      return;
    }
    const s = specRef.current;
    const els = new Map<string, SVGElement>();
    for (const el of layer.querySelectorAll<SVGElement>("[data-k]")) els.set(el.dataset.k ?? "", el);
    const before = prev.current;
    prev.current = { marks, els, resetKey };

    // A change that is still running continues from where its marks are now.
    const now = new Map<string, MarkState>();
    const interrupted = running.current;
    if (interrupted) {
      interrupted.stop();
      for (const j of interrupted.jobs) now.set(j.key, j.cur.slice());
      running.current = null;
    }
    const settle = () => {
      if (!interrupted) return;
      for (const j of interrupted.jobs) {
        const final = marks.get(j.key);
        if (final && j.el.isConnected) s.write(j.el, final);
      }
    };
    if (!before || !entered.current || reduced || before.resetKey !== resetKey) {
      settle();
      return;
    }

    const seconds = typeof s.transition?.duration === "number" ? s.transition.duration : duration.slow;
    const jobs: MarkJob[] = [];
    const arriving: SVGElement[] = [];
    for (const [key, to] of marks) {
      const el = els.get(key);
      if (!el) continue;
      const from = now.get(key) ?? before.marks.get(key);
      if (!from) {
        arriving.push(el);
        if (s.enterFrom) jobs.push({ key, el, from: s.enterFrom(to), to, cur: [...to] });
        continue;
      }
      if (from.length === to.length && from.every((v, i) => v === to[i])) {
        if (now.has(key)) s.write(el, to);
        continue;
      }
      jobs.push({ key, el, from, to, cur: [...from] });
    }

    // Marks that left: their old elements (already detached by React) fade out in the ghost layer.
    const ghost = ghostRef?.current;
    const leaving: SVGElement[] = [];
    for (const [key, el] of before.els) {
      if (marks.has(key) || el.isConnected) continue;
      leaving.push(el);
      const from = now.get(key) ?? before.marks.get(key);
      if (ghost && from && s.exitTo) jobs.push({ key, el, from, to: s.exitTo(from), cur: [...from] });
    }
    if (ghost && leaving.length > 0 && typeof ghost.animate === "function") {
      const g = document.createElementNS(SVG_NS, "g");
      g.append(...leaving);
      ghost.append(g);
      g.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: Math.min(seconds, duration.base) * 1000,
        easing: "linear",
        fill: "forwards",
      }).onfinish = () => g.remove();
    }

    if (jobs.length > (s.maxMoving ?? Infinity)) {
      // Dense layers: one cross-fade instead of hundreds of moving marks.
      for (const j of jobs) if (j.el.isConnected) s.write(j.el, j.to);
      if (typeof layer.animate === "function")
        layer.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: duration.base * 1000, easing: EASE_OUT_CSS });
      return;
    }
    for (const el of arriving)
      if (typeof el.animate === "function")
        el.animate([{ opacity: 0 }, {}], { duration: seconds * 1000, easing: EASE_OUT_CSS });
    if (jobs.length === 0) {
      settle();
      return;
    }
    for (const j of jobs) s.write(j.el, j.from);
    const controls = animate(0, 1, {
      ...(s.transition ?? { duration: duration.slow, ease: changeEase }),
      onUpdate: (p) => {
        for (const j of jobs) {
          for (let i = 0; i < j.to.length; i++) j.cur[i] = (j.from[i] ?? 0) + ((j.to[i] ?? 0) - (j.from[i] ?? 0)) * p;
          s.write(j.el, j.cur);
        }
      },
    });
    running.current = { stop: () => controls.stop(), jobs };
  }, [marks, resetKey, reduced, layerRef, ghostRef]);

  // The entrance, once, when the chart first scrolls into view.
  useLayoutEffect(() => {
    if (!play || entered.current) return;
    const layer = layerRef.current;
    if (!layer || marks.size === 0) return;
    entered.current = true;
    const s = specRef.current;
    if (reduced || !s.entrance || typeof layer.animate !== "function") return;
    const list: Animation[] = [];
    if (marks.size > (s.maxEntrance ?? 150)) {
      // Dense layers: a few animations for the layer (or groups of marks), never one per mark.
      const e = s.layerEntrance?.(layer) ?? { keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: duration.slower };
      for (const part of entranceList(e)) {
        const target = part.target === undefined ? layer : part.target;
        if (!target) continue;
        list.push(
          target.animate(part.keyframes, {
            duration: (part.duration ?? duration.slow) * 1000,
            delay: (part.delay ?? 0) * 1000,
            easing: part.easing ?? EASE_OUT_CSS,
            fill: "backwards",
          }),
        );
      }
      entrances.current = list;
      return;
    }
    const els = prev.current?.els ?? new Map<string, SVGElement>();
    for (const [key, state] of marks) {
      const el = els.get(key);
      const e = el ? s.entrance(state, key, el) : null;
      if (!el || !e) continue;
      for (const part of entranceList(e)) {
        const target = part.target === undefined ? el : part.target;
        if (!target) continue;
        list.push(
          target.animate(part.keyframes, {
            duration: (part.duration ?? duration.slow) * 1000,
            delay: (part.delay ?? 0) * 1000,
            easing: part.easing ?? EASE_OUT_CSS,
            fill: "backwards",
          }),
        );
      }
    }
    entrances.current = list;
  }, [play, marks, reduced, layerRef]);

  // Reduced motion switched on mid-way: everything lands at once.
  useEffect(() => {
    if (!reduced) return;
    for (const a of entrances.current) a.finish();
    entrances.current = [];
  }, [reduced]);

  useEffect(
    () => () => {
      running.current?.stop();
      running.current = null;
    },
    [],
  );

  return entered;
}

/**
 * Fades in a layer's `[data-delay]` elements (labels, values) once, when the chart first plays:
 * one opacity-only Web Animation each, delayed by its `data-delay` (seconds). No React state or
 * Motion component per label, so a re-render never restarts them. Instant under reduced motion.
 *
 * Arguments: `layerRef` (the `<g>`), `play`, `reduced` and `seconds` (fade length; default the "base" motion token). Mark each label to fade with `data-delay` (seconds). Runs once; under reduced motion the labels appear at once. Not a component: no DOM of its own.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useFadeIn } from "./kit";
 *
 * function Labels({ play, reduced }: { play: boolean; reduced: boolean }) {
 *   const layer = useRef<SVGGElement>(null);
 *   useFadeIn(layer, play, reduced);
 *   return (
 *     <svg width={120} height={30} aria-hidden>
 *       <g ref={layer}>
 *         <text data-delay="0.1" x={4} y={20}>
 *           10
 *         </text>
 *         <text data-delay="0.2" x={44} y={20}>
 *           20
 *         </text>
 *       </g>
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function useFadeIn(
  layerRef: RefObject<SVGGElement | null>,
  play: boolean,
  reduced: boolean,
  seconds = duration.base,
) {
  const done = useRef(false);
  const running = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    if (!play || done.current) return;
    const layer = layerRef.current;
    if (!layer) return;
    done.current = true;
    if (reduced || typeof layer.animate !== "function") return;
    running.current = Array.from(layer.querySelectorAll<SVGElement>("[data-delay]"), (el) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: seconds * 1000,
        delay: Number(el.dataset.delay ?? 0) * 1000,
        easing: "linear",
        fill: "backwards",
      }),
    );
  }, [play, layerRef, reduced, seconds]);
  useEffect(() => {
    if (!reduced) return;
    for (const a of running.current) a.finish();
    running.current = [];
  }, [reduced]);
}

/** A Map of mark states, keyed in drawing order. */
export function markMap<T>(
  items: readonly T[],
  key: (item: T, i: number) => string,
  state: (item: T, i: number) => MarkState,
) {
  const out = new Map<string, MarkState>();
  items.forEach((item, i) => out.set(key(item, i), state(item, i)));
  return out;
}
