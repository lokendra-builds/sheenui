"use client";

import { type RefObject } from "react";
import { useInView, usePageInView, type UseInViewOptions } from "motion/react";

import { FINE_POINTER_QUERY, useMediaQuery } from "../hooks/use-media-query";
import { useGlassMode, useSheenReducedMotion } from "../hooks/use-preferences";

/**
 * True on a mouse or trackpad (`(hover: hover) and (pointer: fine)`), live; `false` on touch screens
 * and during server rendering.
 *
 * Accessibility: No UI of its own; never hide the only way to reach a function behind a hover.
 *
 * @example
 * ```tsx
 * import { useFinePointer } from "@sheenui/theme";
 *
 * export function Hint() {
 *   const fine = useFinePointer();
 *   return <p>{fine ? "Hover a card to see its light." : "Tap a card to open it."}</p>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useFinePointer() {
  return useMediaQuery(FINE_POINTER_QUERY);
}

/**
 * Which motion tiers are allowed right now. Read once per component, branch on the
 * flags: `reduced` (OS setting or in-app switch), `pointerFx` (mouse/trackpad and not reduced) and
 * `richFx` (not reduced and not Lite glass). `pointerFx` is `false` during server rendering.
 *
 * Accessibility: Respects `prefers-reduced-motion` and the in-app reduce-motion switch; off-by-default effects cost nothing.
 * Motion: Pointer effects need a fine pointer; text blur and many parallax layers need Lite glass off.
 *
 * @example
 * ```tsx
 * import { useMotionGate } from "@sheenui/theme";
 *
 * export function Badge() {
 *   const { reduced, richFx } = useMotionGate();
 *   return <span className={richFx && !reduced ? "animate-pulse" : ""}>New</span>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useMotionGate() {
  const reduced = useSheenReducedMotion();
  const [lite] = useGlassMode();
  const finePointer = useFinePointer();
  return {
    reduced,
    /** Pointer-driven effects (light, magnetic, tilt): mouse / trackpad only, never with reduced motion. */
    pointerFx: finePointer && !reduced,
    /** Costly extras (text blur, more than 2 parallax layers): off in lite glass mode. */
    richFx: !reduced && !lite,
  };
}

/** Options of {@link useLoopPlayback}. */
export type LoopPlaybackOptions = {
  /** The state of your own pause button: `true` stops the loop. Default `false`. */
  paused?: boolean;
  /** How far outside the viewport still counts as near, as a CSS margin string. Default `"100px"`. */
  margin?: UseInViewOptions["margin"];
  /** Share of the element that must be on screen instead of a margin (`"some"`, `"all"` or `0..1`). Overrides `margin`. */
  amount?: "some" | "all" | number;
  /** Stop the loop under reduced motion. Default `true`; pass `false` for a loop whose CSS already handles it. */
  respectReducedMotion?: boolean;
};

/**
 * Should a loop (ambient drift, beam, marquee, shimmer, typing dots, a live ticker) be playing?
 * Only when motion is allowed, the user has not paused it, it is near the viewport (100 px margin by default)
 * and the tab is visible. `ref` is the element the loop lives in; `options.paused` is your own pause button's
 * state. This is the one loop-visibility hook: every loop in the library, including the dashboards' live
 * tickers, asks it.
 *
 * Accessibility: Always offer a visible pause control for loops that run longer than 5 seconds (WCAG 2.2.2).
 * Motion: Pauses off-screen, in a hidden tab and under reduced motion.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useLoopPlayback } from "@sheenui/theme";
 *
 * export function Ticker() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const playing = useLoopPlayback(ref); // or useLoopPlayback(ref, { paused: userPaused })
 *   return <div ref={ref} className="overflow-hidden" data-playing={playing}>Breaking news</div>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useLoopPlayback(ref: RefObject<Element | null>, options: LoopPlaybackOptions = {}) {
  const { paused = false, margin = "100px", amount, respectReducedMotion = true } = options;
  const reduced = useSheenReducedMotion();
  const near = useInView(ref, amount === undefined ? { margin } : { amount });
  const pageVisible = usePageInView();
  return !(respectReducedMotion && reduced) && !paused && near && pageVisible;
}
