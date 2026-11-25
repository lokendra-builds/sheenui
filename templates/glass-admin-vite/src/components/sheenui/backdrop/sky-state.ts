"use client";

import { useEffect } from "react";

import { useLatest } from "../hooks/use-latest";

/**
 * Shared, module-level state of the Aurora sky, so a theme switch or a remount never makes the
 * light jump, and so page content can hang off the sky's clock:
 *   - `clock`      seconds on the sky's own clock (46 s is a good-looking moment of the loop: also
 *                  the reduced-motion still)
 *   - `lift`       0..1, the aurora rises and brightens as the first viewport scrolls away
 *   - `reflection` a canvas the sky paints its mirror image into (a hero's glossy floor), see
 *                  registerAuroraFloor
 *   - `tick`       ambient movers called on every sky frame (never under reduced motion)
 */
export const auroraSky = {
  clock: 46,
  dawnStart: null as number | null,
  lift: 0,
  reflection: null as HTMLCanvasElement | null,
  /** The floor's top edge in document px and its height; kept fresh by `measureFloor`. */
  floorTop: 0,
  floorH: 0,
  measureFloor: null as (() => void) | null,
  tick: new Set<(t: number) => void>(),
  /** Paint one still frame now (set by the sky; a no-op without one). */
  redraw: (): void => undefined,
};

/**
 * Give the sky a floor to reflect in. `measure` is called by the sky at most twice a second
 * while the floor is near the viewport; it should set `auroraSky.floorTop` / `floorH` (document
 * px) and size the canvas. Returns the unregister function.
 */
export function registerAuroraFloor(canvas: HTMLCanvasElement, measure: () => void) {
  auroraSky.reflection = canvas;
  auroraSky.measureFloor = measure;
  measure();
  auroraSky.redraw();
  return () => {
    if (auroraSky.reflection === canvas) {
      auroraSky.reflection = null;
      auroraSky.measureFloor = null;
    }
  };
}

/**
 * Run `cb(skyClockSeconds)` on every Aurora sky frame while mounted (pass null to stop). Use it to
 * hang page content off the sky's clock (a glow that breathes with the aurora). The latest `cb`
 * is always used, so an inline function is fine. Never called under reduced motion.
 *
 * Accessibility: No UI of its own; keep what you animate decorative.
 * Motion: Ticks only while the Aurora sky is playing (first viewport visible, tab visible, motion allowed).
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { Badge } from "@sheenui/theme";
 *
 * // Placeholder: an internal hook of the style engine, not part of the package entry.
 * declare function useSkyTick(cb: ((t: number) => void) | null): void;
 *
 * export function Glow() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useSkyTick((t) => {
 *     if (ref.current) ref.current.style.opacity = String(0.6 + 0.4 * Math.sin(t));
 *   });
 *   return <div ref={ref} className="glow"><Badge>Aurora</Badge></div>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useSkyTick(cb: ((t: number) => void) | null) {
  const latestRef = useLatest(cb);
  const on = cb !== null;
  useEffect(() => {
    if (!on) return;
    const fn = (t: number) => latestRef.current?.(t);
    auroraSky.tick.add(fn);
    return () => {
      auroraSky.tick.delete(fn);
    };
  }, [on, latestRef]);
}
