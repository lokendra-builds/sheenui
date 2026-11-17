"use client";

import { useEffect, useEffectEvent } from "react";

import { COARSE_POINTER_QUERY } from "../hooks/use-media-query";

/**
 * THE BEAT: one frame clock for everything that changes BEHIND or ON glass. Ambient work runs at ~30 Hz; followers (pointer light) run every frame.
 *
 * A glass surface re-blurs its backdrop whenever anything under it changes. If the backdrop
 * drifts at 60 Hz, the pointer light at 60 Hz and a parallax layer on yet another frame, every
 * glass surface re-blurs on every frame. On the beat they all change on the SAME frames, at most
 * ~30 times a second (the Aurora prototype measured this as the difference between janky and
 * 60 fps pointer moves). Motion springs still smooth every frame; only DOM writes wait for a beat.
 *
 *   - ambient: backdrop loops (drift, aurora sky). They run while registered. Mid-scroll they get
 *     every 2nd beat (~15 fps; every 4th, ~7 fps, on touch screens, where a flick keeps the GPU
 *     and the main thread busy for seconds): the eye follows the content, not slow light. The
 *     beat owns one passive scroll listener for this (bound only while the loop runs), so every
 *     ambient loop is throttled on every scroller, with or without a pointer light or an aurora
 *     sky on the page.
 *   - followers: pointer-driven writes (rim light, parallax). They run while the beat is awake:
 *     `wakeBeat()` on every pointer move keeps it awake ~1.2 s (springs settling).
 *
 * The rAF loop stops itself when nothing is registered and nothing is awake (zero idle cost).
 */

type Tick = (now: number, dt: number) => void;

const beat = {
  raf: 0,
  slot: -1,
  periodMs: 1000 / 30,
  lastAmbient: 0,
  scrollingUntil: 0,
  wakeUntil: 0,
  ambient: new Set<Tick>(),
  follow: new Set<Tick>(),
};

const SCROLL_MS = 150;
let scrollBound = false;

/** Ambient beats skipped between two played ones while the page scrolls (touch screens skip more). */
let coarse: MediaQueryList | null = null;
function scrollStride() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 2;
  coarse ??= window.matchMedia(COARSE_POINTER_QUERY); // a live list: .matches is always current
  return coarse.matches ? 4 : 2;
}

function onScroll() {
  beat.scrollingUntil = performance.now() + SCROLL_MS;
}

/** One passive scroll listener (capture: nested scrollers too), alive only while the loop runs. */
function bindScroll(on: boolean) {
  if (on === scrollBound || typeof window === "undefined") return;
  scrollBound = on;
  if (on) window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  else window.removeEventListener("scroll", onScroll, { capture: true });
}

function loop(now: number) {
  if (beat.ambient.size === 0 && now >= beat.wakeUntil) {
    beat.raf = 0;
    beat.lastAmbient = 0;
    bindScroll(false);
    return;
  }
  beat.raf = requestAnimationFrame(loop);
  // Followers (pointer light) run on every frame: the light follows the cursor at display rate. They go first:
  // they read cached boxes and sometimes re-measure, and a measure placed after the ambient writes
  // (sky transforms, canvas size) would force a style/layout flush mid-frame.
  if (beat.follow.size > 0) beat.follow.forEach((fn) => fn(now, 0));
  // Ambient work is phase-locked to slots (every 2nd vsync at 60 Hz): one decision per frame for everyone.
  const slot = Math.floor(now / beat.periodMs);
  if (slot === beat.slot) return;
  beat.slot = slot;
  const scrolling = now < beat.scrollingUntil;
  if (beat.ambient.size > 0 && !(scrolling && slot % scrollStride() !== 0)) {
    const dt = beat.lastAmbient ? Math.min(0.1, (now - beat.lastAmbient) / 1000) : 0;
    beat.lastAmbient = now;
    beat.ambient.forEach((fn) => fn(now, dt));
  }
}

function start() {
  if (beat.raf || typeof requestAnimationFrame === "undefined") return;
  beat.raf = requestAnimationFrame(loop);
  bindScroll(true);
}

/** Run `fn` on every beat until the returned function is called (backdrop loops). */
export function addAmbient(fn: Tick) {
  beat.ambient.add(fn);
  start();
  return () => {
    beat.ambient.delete(fn);
  };
}

/** Run `fn` on every beat while the beat is awake (see wakeBeat). */
export function addFollower(fn: Tick) {
  beat.follow.add(fn);
  return () => {
    beat.follow.delete(fn);
  };
}

/** Keep followers running for `ms` (call on every pointer move). */
export function wakeBeat(ms = 1200) {
  if (typeof performance === "undefined") return;
  beat.wakeUntil = Math.max(beat.wakeUntil, performance.now() + ms);
  start();
}

/**
 * The page is scrolling: ambient loops drop to every 2nd beat for `ms`. The beat already listens
 * to every scroll event itself; call this for scrolling it cannot see (a programmatic pan, a
 * canvas drag) or to hold the throttle longer.
 */
export function markScrolling(ms = SCROLL_MS) {
  if (typeof performance === "undefined") return;
  beat.scrollingUntil = performance.now() + ms;
}

/**
 * True while any scroller is scrolling (the beat's own passive scroll listener saw an event in the last 150 ms; it is bound only
 * while a beat loop runs, so `markScrolling()` callers keep it accurate elsewhere). Live data uses it to skip a tick mid-scroll.
 */
export function isScrolling() {
  return typeof performance !== "undefined" && performance.now() < beat.scrollingUntil;
}

/** Beat rate in frames per second (30 by default; Lite glass uses 20). */
export function setBeatRate(fps: number) {
  beat.periodMs = 1000 / Math.max(1, Math.min(60, fps));
}

/**
 * Run `cb(now, dt)` on every ambient beat (~30 Hz, fewer while the page scrolls) while mounted and
 * `on`. The latest `cb` is always the one called, so it may close over fresh props and state.
 * `now` is a `requestAnimationFrame` timestamp in ms, `dt` the seconds since the last ambient beat (capped at 0.1).
 *
 * Accessibility: No UI of its own; gate decorative loops with `useMotionGate()` so reduced motion keeps them off.
 * Motion: One shared rAF clock for every ambient loop; it stops itself when nothing is registered.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useAmbientBeat } from "@sheenui/theme";
 *
 * export function Drift() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useAmbientBeat((now) => {
 *     if (ref.current) ref.current.style.transform = `translateX(${Math.sin(now / 2000) * 20}px)`;
 *   });
 *   return <div ref={ref} aria-hidden="true" className="size-8 rounded-full bg-sheen-accent" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function useAmbientBeat(cb: Tick, on = true) {
  const onBeat = useEffectEvent((now: number, dt: number) => {
    cb(now, dt);
  });
  useEffect(() => {
    if (!on) return;
    return addAmbient((now, dt) => {
      onBeat(now, dt);
    });
  }, [on]);
}

/**
 * Run `cb(now)` on every beat while the beat is awake (see `wakeBeat`), while mounted and `on`.
 * For pointer-driven DOM writes (rim light, parallax) that must change on the same frames as the
 * backdrop. The latest `cb` is always the one called.
 *
 * Accessibility: No UI of its own; pointer effects belong behind `useMotionGate().pointerFx`.
 * Motion: Followers run only while the beat is awake (about 1.2 s after the last `wakeBeat()`), then cost nothing.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useBeatFollower } from "@sheenui/theme";
 *
 * // Placeholder: an internal helper of the motion engine, not part of the package entry.
 * declare function wakeBeat(): void;
 *
 * export function Follow() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const target = useRef({ x: 0, y: 0 });
 *   useBeatFollower(() => {
 *     if (ref.current) ref.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
 *   });
 *   return (
 *     <div
 *       onPointerMove={(e) => {
 *         target.current = { x: e.clientX % 40, y: e.clientY % 40 };
 *         wakeBeat();
 *       }}
 *     >
 *       <div ref={ref} aria-hidden="true" className="size-6 rounded-full bg-sheen-accent" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function useBeatFollower(cb: Tick, on = true) {
  const onBeat = useEffectEvent((now: number, dt: number) => {
    cb(now, dt);
  });
  useEffect(() => {
    if (!on) return;
    return addFollower((now, dt) => {
      onBeat(now, dt);
    });
  }, [on]);
}
