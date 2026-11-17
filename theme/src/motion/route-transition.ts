"use client";

import { ease } from "./tokens";

/**
 * Route (page) transitions. Two parts that work together:
 *
 *   1. `startRouteTransition()` wraps a navigation in `document.startViewTransition`. The browser
 *      cross-fades the page as ONE flat snapshot (the blur of every glass surface is already baked
 *      in, so glass never flickers) while the header and sidebar, identical in both snapshots, stay
 *      visually still. The page title additionally rises 8 px (CSS in `styles/motion.css`, keyed on
 *      `[data-route-transition]` on `#main`, else on `<html>`).
 *   2. `riseIn()` is the fallback for browsers without View Transitions: a transform-only 8 px rise
 *      of the new page, run with Motion. Transform only, because an opacity fade on a wrapper would
 *      turn every glass surface inside it into a flat panel for the length of the fade.
 *
 * Both are skipped under reduced motion (`data-motion="reduced"` on `<html>`, or the OS setting):
 * the page swaps instantly. Neither blocks navigation: the update always runs, and the browser is
 * only held on the old frame until the update has committed or `timeoutMs` has passed.
 */

/** True when `document.startViewTransition` exists (Chrome/Edge 111+, Safari 18+, Firefox 144+). */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

/** True when motion is reduced, live: `data-motion="reduced"` on `<html>` or the OS setting. */
export function isMotionReduced(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.getAttribute("data-motion") === "reduced") return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Options for {@link startRouteTransition}. */
export type RouteTransitionOptions = {
  /** Longest time (ms) the old frame is held while waiting for `update` to commit. Default 150: a cold route
   *  commits later, on its own, and the pending progress bar shows meanwhile, so input is never held up. */
  timeoutMs?: number;
  /** Transition types (`"push"`, `"back"`, `"forward"`...): `:active-view-transition-type(back)` styles can react. */
  types?: string[];
  /** Force the instant swap (e.g. your own reduced-motion flag). Default: read from the document. */
  reduced?: boolean;
};

const ATTRIBUTE = "data-route-transition";
let running: ViewTransition | undefined;

/**
 * Run a navigation as a view transition when the browser supports it and motion is allowed, else
 * run it at once. `update` must start your state change and return a promise that resolves once
 * the new page is in the DOM (for React: resolve it from a layout effect). A page whose code is
 * still loading therefore never shows a half page, and `timeoutMs` keeps a slow chunk from freezing
 * the frame for ever.
 *
 * Returns `true` when a view transition was started, `false` when `update` ran directly.
 *
 * Accessibility: Move focus and announce the page after the transition as you would without it; the snapshot is visual only. Reduced motion swaps the page instantly.
 * Motion: Root cross-fade 150 ms out and in (same curve, plus-lighter) plus an 8 px title rise (`styles/motion.css`).
 *
 * @example
 * ```tsx
 * import { startTransition } from "react";
 * import { startRouteTransition } from "@sheenui/theme";
 *
 * let resolveCommit: (() => void) | undefined;
 *
 * export function go(next: string, setPath: (path: string) => void) {
 *   startRouteTransition(
 *     () =>
 *       new Promise<void>((resolve) => {
 *         resolveCommit = resolve;
 *         startTransition(() => setPath(next));
 *       }),
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function startRouteTransition(
  update: () => void | Promise<void>,
  options: RouteTransitionOptions = {},
): boolean {
  const { timeoutMs = 150, reduced = isMotionReduced(), types } = options;
  if (reduced || !supportsViewTransitions()) {
    void update();
    return false;
  }
  // The flag goes on the page's main region when there is one: an attribute flip on <html> restyles the whole document.
  const root = document.getElementById("main") ?? document.documentElement;
  // A newer navigation wins: a click during a running transition skips it (its end state is applied at once).
  running?.skipTransition();
  root.setAttribute(ATTRIBUTE, "");
  let transition: ViewTransition;
  const callback = async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limit = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });
    try {
      await Promise.race([Promise.resolve(update()), limit]);
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    transition = types?.length
      ? (
          document.startViewTransition as unknown as (
            this: Document,
            o: { update: () => Promise<void>; types: string[] },
          ) => ViewTransition
        ).call(document, { update: callback, types })
      : document.startViewTransition(callback);
    running = transition;
  } catch {
    root.removeAttribute(ATTRIBUTE);
    void update();
    return false;
  }
  const clear = () => {
    if (running === transition) running = undefined;
    if (!running) root.removeAttribute(ATTRIBUTE);
  };
  // A skipped transition (a newer navigation, a hidden tab) rejects these promises: that is fine.
  transition.ready.catch(() => undefined);
  transition.updateCallbackDone.catch(() => undefined);
  void transition.finished.then(clear, clear);
  return true;
}

let rise: { cancel: () => void } | undefined;

/**
 * Fallback page transition for browsers without View Transitions: lift `element` 8 px into place
 * over 220 ms (transform only, so the glass inside it keeps its blur). A no-op under reduced motion
 * and where View Transitions exist. Starting a new rise cancels the previous one. It uses the Web Animations API
 * directly, so it costs no library code.
 *
 * Accessibility: Purely visual; the element keeps its DOM position, focus and reading order.
 * Motion: `transform: translateY(8px) → 0`, 220 ms, `ease.out`; never `opacity`.
 *
 * @example
 * ```tsx
 * import { useLayoutEffect } from "react";
 * import { riseIn } from "@sheenui/theme";
 *
 * export function Outlet({ path }: { path: string }) {
 *   useLayoutEffect(() => {
 *     riseIn(document.getElementById("main"));
 *   }, [path]);
 *   return <main id="main" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function riseIn(element: HTMLElement | null, { distance = 8, duration = 0.22 } = {}): void {
  if (!element || supportsViewTransitions() || isMotionReduced()) return;
  rise?.cancel();
  if (typeof element.animate !== "function") return;
  const animation = element.animate(
    { transform: [`translateY(${distance}px)`, "translateY(0px)"] },
    { duration: duration * 1000, easing: `cubic-bezier(${ease.out.join(", ")})` },
  );
  rise = animation;
  animation.finished.then(
    () => element.style.removeProperty("transform"),
    () => undefined, // cancelled by a newer rise
  );
}
