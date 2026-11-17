"use client";

import { useRef } from "react";

import { useAmbientBeat } from "./beat";

/**
 * Drives paused Web Animations from the shared ambient beat (~30 Hz) instead of letting them free-run at the display rate.
 * Effects that sit behind glass use it: every glass surface above re-blurs when its backdrop changes, so the backdrop
 * must change only on the beat. Create the animations paused, move them in `seek(ms)`, and `on` is false while the
 * effect is off-screen, hidden or paused (the clock stops and so does the beat's cost). Returns the clock, in ms, so a
 * rebuilt animation can start in phase with `anim.currentTime = clock.current`.
 *
 * Accessibility: No UI of its own; gate it with `useLoopPlayback` so reduced motion, hidden tabs and off-screen keep it off.
 * Motion: Rides the shared beat, so it costs nothing while `on` is false.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useBeatAnimations } from "@sheenui/theme";
 *
 * export function Glow() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const animation = useRef<Animation | null>(null);
 *   useBeatAnimations((ms) => {
 *     if (animation.current) animation.current.currentTime = ms;
 *   }, true);
 *   return <div ref={ref} aria-hidden="true" className="size-8 rounded-full bg-sheen-accent" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function useBeatAnimations(seek: (ms: number) => void, on: boolean) {
  const clock = useRef(0);
  useAmbientBeat((_now, dt) => {
    clock.current += dt * 1000;
    seek(clock.current);
  }, on);
  return clock;
}
