"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, useSpring } from "motion/react";

import { useMotionGate } from "../motion/gate";
import { distance, follow } from "../motion/tokens";

/** Options of {@link useMagnetic}. */
export type UseMagneticOptions = {
  /**
   * Turn the pull on or off (a disabled or loading button passes `false`).
   * @default true
   */
  enabled?: boolean;
  /**
   * How far outside the element's box (px) the pointer already pulls it.
   * @default 8
   */
  reach?: number;
  /**
   * Share of the pointer's offset from the element's centre that becomes movement (0 to 1); the result is capped at `distance.magneticMax`.
   * @default 0.25
   */
  strength?: number;
};

/**
 * Magnetic pull: the element leans toward the pointer while the pointer is
 * within `reach` px of its box, by at most `distance.magneticMax` px, on the `follow.magnetic` spring, and springs
 * home when the pointer leaves. Two MotionValues write `transform` straight to the element, so nothing re-renders
 * per frame; one passive document listener does the tracking, and a new target mid-flight keeps the spring's
 * velocity (interruptible). The element's own `translate` and `scale` (hover lift, press) are left alone.
 * Off for touch screens, for reduced motion (OS or in-app) and while `enabled` is false.
 *
 * Keyboard: None: pointer only; keyboard focus never moves the element.
 * Accessibility: The pull is at most 8 px and never moves the click target out from under the pointer; it is removed with reduced motion.
 * Motion: Spring `follow.magnetic`, cap `distance.magneticMax`; compositor `transform` only.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useMagnetic } from "@sheenui/theme";
 *
 * export function Pull() {
 *   const ref = useRef<HTMLAnchorElement>(null);
 *   useMagnetic(ref);
 *   return <a ref={ref} href="/start">Get started</a>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { enabled = true, reach = 8, strength = 0.25 }: UseMagneticOptions = {},
) {
  const { pointerFx } = useMotionGate();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const x = useSpring(pullX, follow.magnetic);
  const y = useSpring(pullY, follow.magnetic);
  const on = enabled && pointerFx;

  useEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    const write = () => {
      const px = x.get();
      const py = y.get();
      el.style.transform =
        Math.abs(px) < 0.05 && Math.abs(py) < 0.05 ? "" : `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)`;
    };
    const stopX = x.on("change", write);
    const stopY = y.on("change", write);

    const max = distance.magneticMax;
    // Symmetric about zero (`-max` to `max`), so it stays local rather than calling `lib/math`'s `clamp(n, lo, hi)`.
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    let box: DOMRect | null = null;
    let frame = 0;
    let last: { x: number; y: number } | null = null;
    const stale = () => {
      box = null;
    };
    const flush = () => {
      frame = 0;
      if (!last) return;
      // The box is read at most once per scroll / resize, never per move. It is the element's resting box:
      // the pull is a transform, so the cached rect is shifted by the current pull before use.
      box ??= el.getBoundingClientRect();
      const cx = box.left + box.width / 2 - x.get();
      const cy = box.top + box.height / 2 - y.get();
      const hw = box.width / 2 + reach;
      const hh = box.height / 2 + reach;
      const dx = last.x - cx;
      const dy = last.y - cy;
      if (Math.abs(dx) <= hw && Math.abs(dy) <= hh) {
        pullX.set(clamp(dx * strength));
        pullY.set(clamp(dy * strength));
      } else {
        pullX.set(0);
        pullY.set(0);
      }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      last = { x: event.clientX, y: event.clientY };
      frame ||= requestAnimationFrame(flush);
    };
    const leave = () => {
      last = null;
      pullX.set(0);
      pullY.set(0);
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", stale, { passive: true, capture: true });
    window.addEventListener("resize", stale, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", stale, { capture: true });
      window.removeEventListener("resize", stale);
      cancelAnimationFrame(frame);
      stopX();
      stopY();
      pullX.jump(0);
      pullY.jump(0);
      el.style.transform = "";
    };
  }, [ref, on, reach, strength, x, y, pullX, pullY]);
}
