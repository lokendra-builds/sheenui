"use client";

import { useEffect } from "react";

/**
 * Looping CSS animations (skeleton shimmer, indeterminate bars, floating blobs, equalizer bars,
 * spinners) pause while their element is off-screen and resume when it comes back. Chrome keeps ticking, and restyling, an animation that
 * nobody can see; on a page with a dozen of them that is steady main-thread and compositor work.
 *
 * ONE hook for the whole app, no per-component wiring:
 *   - an `animationstart` listener (capture, so it sees every CSS animation as it begins) plus a
 *     single sweep of `document.getAnimations()` at mount find the infinite CSS animations;
 *   - one shared IntersectionObserver (100 px margin) watches their elements and pauses /
 *     resumes only the animations it paused itself.
 * Web Animations started from script (Motion) are never touched: only `CSSAnimation`s are.
 * Reduced motion needs nothing here: it already turns loops into a single 1 ms pass.
 */

function isInfiniteCss(animation: Animation): animation is CSSAnimation {
  return (
    typeof CSSAnimation === "function" &&
    animation instanceof CSSAnimation &&
    animation.effect?.getComputedTiming().iterations === Infinity
  );
}

function targetOf(animation: Animation) {
  const effect = animation.effect as KeyframeEffect | null;
  // Pseudo-element animations (::before / ::after) report their originating element as target.
  return effect ? effect.target : null;
}

/**
 * The animations an element owns, its own pseudo-elements (::before / ::after / ...) included.
 * Plain `element.getAnimations()` omits the pseudo-element ones, so a loop drawn on a pseudo-element
 * would never pause; `{ subtree: true }` lists them (and the descendants', filtered out here).
 */
function ownAnimations(element: Element) {
  return element.getAnimations({ subtree: true }).filter((a) => targetOf(a) === element);
}

/** What one mounted `useOffscreenLoops` can report about itself (after sweeping out anything that left the document). */
type LoopRegistry = { stats: () => { anchors: number; elements: number } };
const registries = new Set<LoopRegistry>();

/**
 * How many anchors and animated elements the mounted `useOffscreenLoops` hooks still hold. A sweep runs first, so this
 * is the number of loops that are really in the document (0 after every spinner is gone).
 *
 * @internal Test and debugging aid, not part of the public barrel.
 */
export function offscreenLoopStats() {
  let anchors = 0;
  let elements = 0;
  for (const registry of registries) {
    const stats = registry.stats();
    anchors += stats.anchors;
    elements += stats.elements;
  }
  return { anchors, elements };
}

/**
 * Pause every looping CSS animation while its element (its parent, for loops that move their own element) is off-screen, resume it when it returns.
 * `SheenMotionProvider` already calls it once for the whole app; call it yourself only without the provider. It finds the loops itself, so no
 * component needs wiring. Elements are tracked weakly and forgotten (unobserved) as soon as they leave the
 * document, so a long-lived app that mounts and unmounts spinners and skeletons does not accumulate them.
 *
 * Props: `enabled` (boolean, default `true`): turn the pausing off, e.g. while debugging.
 *
 * Accessibility: No UI of its own. A paused loop is off-screen, so nothing visible changes; motion that Motion starts from script is never touched, and reduced motion needs nothing from it.
 * Motion: Pauses `CSSAnimation`s with infinite iterations through one shared IntersectionObserver (100 px margin).
 *
 * @example
 * ```tsx
 * import { type ReactNode } from "react";
 * import { useOffscreenLoops } from "@sheenui/theme";
 *
 * export function Root({ children }: { children: ReactNode }) {
 *   useOffscreenLoops();
 *   return <main>{children}</main>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useOffscreenLoops(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof IntersectionObserver !== "function") return;
    // A loop usually moves its own element (a shimmer sweeping inside an overflow-hidden skeleton):
    // while it is out of its own clip the element reports "not intersecting" although the loop is
    // on screen, and a paused loop could never come back. So the observer watches the element's
    // parent, which stays put, and pauses or resumes every loop that hangs off it.
    const groups = new WeakMap<Element, Set<WeakRef<Element>>>(); // observed anchor -> animated elements
    const anchorRefs = new Set<WeakRef<Element>>(); // weak handles of the observed anchors (iteration and unobserve)
    const anchorOf = new WeakMap<Element, Element>();
    const inspected = new WeakSet<Element>(); // elements whose animations were listed once (a restart needs no second listing)
    const away = new WeakSet<Element>(); // anchors currently off-screen
    const paused = new WeakMap<Element, Animation[]>(); // animated element -> loops this hook paused
    const pausedElements = new Set<WeakRef<Element>>(); // iteration handle for `paused`, pruned with the rest
    const handles = new WeakMap<Element, WeakRef<Element>>();
    const refOf = (element: Element) => {
      let ref = handles.get(element);
      if (!ref) handles.set(element, (ref = new WeakRef(element)));
      return ref;
    };

    const pauseLoops = (element: Element) => {
      const running = ownAnimations(element).filter((a) => a.playState === "running" && isInfiniteCss(a));
      for (const animation of running) animation.pause();
      if (running.length) {
        paused.set(element, [...(paused.get(element) ?? []), ...running]);
        pausedElements.add(refOf(element));
      }
    };
    const resumeLoops = (element: Element) => {
      // A hidden tab keeps its loops paused: play() would override the CSS pause of html[data-page-hidden].
      // They come back on visibilitychange (resumeVisible).
      if (document.visibilityState === "hidden") return;
      for (const animation of paused.get(element) ?? []) if (animation.playState === "paused") animation.play();
      paused.delete(element);
      pausedElements.delete(refOf(element));
    };

    const forget = (anchor: Element) => {
      observer.unobserve(anchor);
      groups.delete(anchor);
      away.delete(anchor);
      anchorRefs.delete(refOf(anchor));
    };

    // Drop every element that left the document and every anchor that has nothing left to pause.
    const sweep = () => {
      for (const anchorRef of anchorRefs) {
        const anchor = anchorRef.deref();
        if (!anchor) {
          anchorRefs.delete(anchorRef);
          continue;
        }
        const group = groups.get(anchor);
        if (group) {
          for (const ref of group) {
            const element = ref.deref();
            if (element?.isConnected) continue;
            group.delete(ref);
            if (element) {
              paused.delete(element);
              anchorOf.delete(element);
            }
          }
        }
        // A detached anchor is forgotten even if its children linger: they left the document with it.
        if (!group?.size || !anchor.isConnected) forget(anchor);
      }
      for (const ref of pausedElements) if (!ref.deref()?.isConnected) pausedElements.delete(ref);
    };
    let sweepQueued = false;
    const queueSweep = () => {
      if (sweepQueued) return;
      sweepQueued = true;
      queueMicrotask(() => {
        sweepQueued = false;
        sweep();
      });
    };

    // Raw observer on purpose: one shared observer over every registered loop anchor, with its own sweep.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target: anchor, isIntersecting } of entries) {
          // A detached anchor reports one last "not intersecting": that is the cue to forget it.
          if (!anchor.isConnected) {
            sweep();
            continue;
          }
          const group = groups.get(anchor);
          if (!group) continue;
          if (isIntersecting) away.delete(anchor);
          else away.add(anchor);
          for (const ref of group) {
            const element = ref.deref();
            if (!element) continue;
            if (isIntersecting) resumeLoops(element);
            else pauseLoops(element);
          }
        }
      },
      { rootMargin: "100px" },
    );

    const consider = (animation: Animation) => {
      if (!isInfiniteCss(animation)) return;
      const target = targetOf(animation);
      if (!target || anchorOf.has(target)) return;
      const anchor = target.parentElement ?? target;
      anchorOf.set(target, anchor);
      const group = groups.get(anchor);
      if (group) group.add(refOf(target));
      else {
        groups.set(anchor, new Set([refOf(target)]));
        anchorRefs.add(refOf(anchor));
        observer.observe(anchor);
      }
    };
    // Inspect one animated element: list its animations once (a restart needs no second listing) and pause its loops
    // when it started off-screen. getAnimations() flushes style, so it never runs inside the animationstart event itself.
    const inspect = (target: Element) => {
      if (!target.isConnected) return;
      if (!inspected.has(target)) {
        inspected.add(target);
        ownAnimations(target).forEach(consider);
      }
      // A loop (re)started while its element is off-screen waits for it to come back.
      const anchor = anchorOf.get(target);
      if (anchor && away.has(anchor)) pauseLoops(target);
    };
    // Started elements queue up and are inspected together in idle time: the load phase (dozens of entrance animations
    // starting while the page hydrates) never pays for a style flush per element.
    const queue = new Set<Element>();
    let scheduled = false;
    let disposed = false;
    let first = false;
    const drain = () => {
      scheduled = false;
      if (disposed) return;
      if (first) document.documentElement.getAnimations({ subtree: true }).forEach(consider);
      first = false;
      for (const target of queue) inspect(target);
      queue.clear();
      queueSweep();
    };
    // Safari has no requestIdleCallback: a short timer stands in.
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const ric = (window as { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback;
      if (ric) ric(drain, { timeout: 500 });
      else setTimeout(drain, 120);
    };
    const onStart = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      queue.add(target);
      schedule();
    };

    // A hidden tab: script-played loops (resumed after a scroll) ignore the CSS pause, so every running
    // infinite CSS loop is paused here, and the ones whose anchor is on screen play again when the tab returns.
    const hiddenPaused = new Set<Animation>();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        for (const animation of document.getAnimations()) {
          if (animation.playState === "running" && isInfiniteCss(animation)) {
            animation.pause();
            hiddenPaused.add(animation);
          }
        }
        return;
      }
      for (const animation of hiddenPaused) {
        const target = targetOf(animation);
        const anchor = target && anchorOf.get(target);
        const stillAway = anchor ? away.has(anchor) : false;
        if (animation.playState === "paused" && !stillAway && !(target && paused.get(target)?.includes(animation))) {
          animation.play();
        }
      }
      hiddenPaused.clear();
      for (const ref of [...pausedElements]) {
        const element = ref.deref();
        const anchor = element && anchorOf.get(element);
        if (element && anchor && !away.has(anchor)) resumeLoops(element);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const registry: LoopRegistry = {
      stats: () => {
        sweep();
        let elements = 0;
        for (const anchorRef of anchorRefs) {
          const anchor = anchorRef.deref();
          elements += (anchor ? groups.get(anchor)?.size : 0) ?? 0;
        }
        return { anchors: anchorRefs.size, elements };
      },
    };
    registries.add(registry);

    // The first listing of the loops already running waits for idle time after the page has loaded: the whole-document
    // getAnimations() forces a full style flush, which used to land inside the hydration tasks.
    const startFirst = () => {
      first = true;
      schedule();
    };
    if (document.readyState === "complete") startFirst();
    else window.addEventListener("load", startFirst, { once: true });
    document.addEventListener("animationstart", onStart, true);
    document.addEventListener("animationcancel", queueSweep, true);
    return () => {
      registries.delete(registry);
      document.removeEventListener("visibilitychange", onVisibility);
      hiddenPaused.clear();
      document.removeEventListener("animationstart", onStart, true);
      document.removeEventListener("animationcancel", queueSweep, true);
      window.removeEventListener("load", startFirst);
      disposed = true;
      queue.clear();
      observer.disconnect();
      for (const ref of pausedElements) {
        const element = ref.deref();
        for (const animation of (element ? paused.get(element) : undefined) ?? [])
          if (animation.playState === "paused") animation.play();
      }
      pausedElements.clear();
      anchorRefs.clear();
    };
  }, [enabled]);
}
