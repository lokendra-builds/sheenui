"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useResolvedDirection } from "../../hooks/use-direction";

/**
 * Small helpers every chart shares: text measuring, bidi isolation, pointer reading and hit-test bounds. They live here,
 * away from the histogram, so a chart that needs one of them does not install the whole histogram with it.
 * `histogram.tsx` re-exports them.
 */

/**
 * True when the chart sits in a right-to-left context (dir="rtl" on it or an ancestor).
 *
 * Arguments: `ref` (the chart's root or any element inside it) and `width` (the chart's width: the direction is re-read when it changes). Returns true for right to left. Not a component: no DOM, keyboard or screen-reader behaviour; use it with `chartMirror` to flip px layouts.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useChartDirection } from "./chart-pointer";
 *
 * function Plot() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const rtl = useChartDirection(ref);
 *   return <div ref={ref}>{rtl ? "Right to left" : "Left to right"}</div>;
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function useChartDirection(ref: RefObject<Element | null>) {
  return useResolvedDirection(undefined, ref) === "rtl";
}

/** Em advances of the glyphs that differ most from the defaults (lowercase 0.6, capitals 0.7, digits and the rest 0.65). */
const GLYPH_EM: Record<string, number> = {
  i: 0.27,
  j: 0.27,
  l: 0.27,
  I: 0.29,
  f: 0.36,
  t: 0.36,
  r: 0.41,
  "1": 0.65,
  m: 0.89,
  w: 0.84,
  M: 0.92,
  W: 1.03,
  " ": 0.28,
  ".": 0.31,
  ",": 0.31,
  ":": 0.31,
  ";": 0.31,
  "'": 0.27,
  "·": 0.31,
  "|": 0.27,
  "!": 0.3,
  "(": 0.37,
  ")": 0.37,
  "/": 0.37,
  "-": 0.47,
  "–": 0.5,
  "%": 0.99,
  "…": 0.91,
  "▲": 0.78,
  "▼": 0.78,
};

/**
 * Approximate rendered width (px) of chart label text in the theme's UI font (Inter, tabular
 * figures), from per-glyph em widths measured in the browser. Slightly generous for narrow letters,
 * so layouts sized with it leave room instead of clipping. `px`: 11 for text-2xs, 12 for text-xs;
 * `bold` for medium / semibold weights.
 */
export function textWidth(text: string, px = 11, bold = false): number {
  let em = 0;
  for (const ch of text) em += GLYPH_EM[ch] ?? (ch >= "a" && ch <= "z" ? 0.6 : ch >= "A" && ch <= "Z" ? 0.7 : 0.65);
  return em * px * (bold ? 1.02 : 1);
}

/**
 * Pointer reading with touch tap-to-pin: a mouse reads what it hovers; a tap pins a mark (tap it
 * again, or empty space, to unpin) and a sideways drag scrubs. Pointer moves are never announced.
 *
 * Arguments: the `active` mark, `setActive`, and `fromPointer()` (tell the chart that the pointer, not the keyboard, moved). Returns `{ down, move, up, leave }`: wire them to the matching pointer events with the mark under the pointer (or null). Pointer moves are never announced to screen readers; keyboard users have their own path. Not a component.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { usePointerReading } from "./chart-pointer";
 *
 * function Plot() {
 *   const [active, setActive] = useState<number | null>(null);
 *   const reading = usePointerReading<number>(active, setActive, () => {});
 *   return (
 *     <svg
 *       width={120}
 *       height={60}
 *       onPointerDown={(e) => reading.down(e, 0)}
 *       onPointerMove={(e) => reading.move(e, 0)}
 *       onPointerUp={() => reading.up()}
 *       onPointerLeave={(e) => reading.leave(e)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function usePointerReading<T>(active: T | null, setActive: (next: T | null) => void, fromPointer: () => void) {
  const down = useRef<{ x: number; y: number } | null>(null);
  // Whether the mark being read was pinned by a tap (a second tap unpins it) rather than hovered:
  // a tap on a mark a mouse happens to hover (hybrid devices, a pointer left resting after a
  // scroll) pins it instead of toggling it off.
  const pinned = useRef(false);
  return {
    down: (event: React.PointerEvent, hit: T | null) => {
      fromPointer();
      if (event.pointerType === "mouse") {
        pinned.current = false;
        setActive(hit);
        return;
      }
      down.current = { x: event.clientX, y: event.clientY };
      const unpin = hit === null || (hit === active && pinned.current);
      pinned.current = !unpin;
      setActive(unpin ? null : hit);
    },
    move: (event: React.PointerEvent, hit: T | null) => {
      if (event.pointerType === "mouse") {
        fromPointer();
        pinned.current = false;
        setActive(hit);
        return;
      }
      const d = down.current;
      // Touch: only a real drag scrubs (a tap's jitter must not undo an unpin).
      if (!d || Math.hypot(event.clientX - d.x, event.clientY - d.y) < 8 || hit === null) return;
      pinned.current = true;
      setActive(hit);
    },
    up: () => {
      down.current = null;
    },
    leave: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setActive(null);
    },
  };
}

/**
 * The hit area's box, read once per pointer visit instead of on every move (a layout read right
 * after each hover re-render forces a synchronous layout.5). Read again on pointer
 * enter / down, after any scroll or resize, and when `deps` (the chart's size) change.
 *
 * Arguments: `width` and `height` (the chart's size), which clear the cached box when they change. Returns `{ rect(el, fresh?), reset() }`: `rect` gives the element's client rect without re-measuring on every move; call `reset()` on pointer enter. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useHitBounds } from "./chart-pointer";
 *
 * function Plot({ width }: { width: number }) {
 *   const bounds = useHitBounds(width);
 *   return (
 *     <div
 *       style={{ width }}
 *       onPointerEnter={() => bounds.reset()}
 *       onPointerMove={(e) => console.log(e.clientX - bounds.rect(e.currentTarget).left)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function useHitBounds(width = 0, height = 0) {
  const cache = useRef<{ el: Element; rect: DOMRect } | null>(null);
  useEffect(() => {
    const drop = () => {
      cache.current = null;
    };
    window.addEventListener("scroll", drop, { capture: true, passive: true });
    window.addEventListener("resize", drop, { passive: true });
    return () => {
      window.removeEventListener("scroll", drop, { capture: true });
      window.removeEventListener("resize", drop);
    };
  }, []);
  useEffect(() => {
    cache.current = null;
  }, [width, height]);
  return useMemo(
    () => ({
      /** The element's client rect; `fresh` reads it again (pointer down). */
      rect: (el: Element, fresh = false): DOMRect => {
        const c = cache.current;
        if (!fresh && c?.el === el) return c.rect;
        const rect = el.getBoundingClientRect();
        cache.current = { el, rect };
        return rect;
      },
      /** Forget the box (pointer enter: the page may have moved under a resting pointer). */
      reset: () => {
        cache.current = null;
      },
    }),
    [],
  );
}

/**
 * `text` wrapped in Unicode first-strong isolates, so a signed or formatted number keeps its order
 * ("+0.06", "−8%") inside right-to-left text, where bidi would otherwise move the sign to its end.
 * For HTML strings (readouts, status lines); SVG text in these charts is laid out left to right.
 */
export function isolate(text: string) {
  return `⁨${text}⁩`;
}
