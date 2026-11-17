"use client";

import { useEffect } from "react";

import { addFollower, isScrolling, markScrolling, wakeBeat } from "./beat";

/**
 * "Glass catches light" for every glass surface on the page.
 *
 * ONE pointer listener for the whole app. On every frame (see beat.ts) it lights the glass
 * surfaces nearest the pointer by writing, inline on each surface:
 *   --sheen-mx / --sheen-my   pointer position inside the surface (px): the rim's hot spot and the inner light
 *   --sheen-ra                angle from the surface's centre to the pointer: the rim's broad lit side
 *   --sheen-lit               0..1, how close the pointer is (the rim brightens as it nears)
 * and marks it [data-sheen-lit] (its rim layer gets its own compositor layer while lit).
 * The style presets draw the rim from these (glass.css + styles/presets/*.css).
 *
 * Cost rules:
 *   - No React state: plain DOM writes, batched on the beat (reads first, then writes).
 *   - The variables are registered `inherits: false`, so a write restyles the surface and its
 *     rim pseudo-element only, never the surface's whole subtree.
 *   - At most MAX_LIT surfaces within REACH px are lit; every other surface keeps no inline
 *     light at all (no restyle, no repaint).
 *   - Boxes are cached in PAGE coordinates, so scrolling the window never touches layout: the
 *     viewport box is the cached box minus the scroll offset. Only surfaces within REACH px of
 *     the viewport (an IntersectionObserver says which) are ever measured; a box is re-read when
 *     its surface is resized (ResizeObserver), enters the viewport band, the window resizes, a
 *     nested scroller scrolls, or every REFRESH_MS as a safety net (reflow above it). Sticky and
 *     fixed surfaces keep viewport coordinates and are re-read at most every PINNED_MS while the
 *     page scrolls (a sticky bar sticking or letting go).
 *   - Pointer moves never read layout. Fine pointer only and never with reduced motion: then
 *     every surface rests in the ambient light from the top-left (the CSS defaults).
 * Opt a surface out with data-sheen-light="off"; opt any element in with data-sheen-light.
 */

/** Pointer position, shared with backdrops (the aurora sky lifts under it). Viewport fractions. */
export const sheenPointer = { x: 0.62, y: 0.3, on: false };

const SELECTOR = ".glass-1, .glass-2, .glass-3, [data-sheen-light]";
const REACH = 260;
const MAX_LIT = 6;
/** Resting light: the sun at the top-left (matches the CSS defaults). */
const REST_ANGLE = -40;
const REST_LIT = 0.42;
const FLARE_SPEED = 2.4; // px per ms
/** The surface list is re-queried at most this often (ms), while the beat is awake. */
const DISCOVER_MS = 1000;
/** Safety-net re-read of the boxes in reach (ms), for reflow that resizes nothing. */
const REFRESH_MS = 1500;
/** A sticky / fixed surface is re-read at most this often (ms) while the window scrolls. */
const PINNED_MS = 120;

type LitState = { lit: number; ra: number };

type Surface = {
  el: HTMLElement;
  /** Box in page coordinates (viewport box + scroll offset at the time it was read). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Within REACH px of the viewport (IntersectionObserver); unknown (true) until it reports. */
  near: boolean;
  /** The box must be read again before it is used. */
  stale: boolean;
  /** Sticky / fixed (it or an ancestor): its box is kept in VIEWPORT coordinates (x / y above), not page ones. null = not yet known. */
  pinned: boolean | null;
  /** When the box was last read. */
  at: number;
};

function isPinned(el: HTMLElement) {
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "fixed" || position === "sticky") return true;
  }
  return false;
}

/**
 * The pointer rim light for every glass surface (the work is described at the top of this file).
 * Call it once near the root (SheenBackdrop already does).
 *
 * Props: `enabled` (boolean, required): `false` turns the light off and leaves every surface in
 * the ambient light from the top-left.
 *
 * Accessibility: Decorative: no focus, no pointer capture, never with reduced motion or on touch.
 * Glass: Writes four custom properties on the nearest glass surfaces only; no layout reads on pointer moves or window scrolls.
 * Motion: Runs every frame as a beat follower and only while the pointer is moving or the light is easing.
 *
 * @example
 * ```tsx
 * import { type ReactNode } from "react";
 * import { useSheenPointerLight } from "@sheenui/theme";
 *
 * export function Root({ children }: { children: ReactNode }) {
 *   useSheenPointerLight(true);
 *   return <main>{children}</main>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useSheenPointerLight(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const root = document.documentElement;
    const state = new Map<HTMLElement, LitState>();
    const surfaces = new Map<HTMLElement, Surface>();
    let list: Surface[] = [];
    let discoveredAt = -1e9;
    let refreshedAt = -1e9;
    let allStale = true;
    let pinnedDirty = false;
    // The window scrolled since the offsets were cached; they are re-read on the beat, and only while a pointer is
    // there to light anything (touch and idle pages never read them: scrollX / scrollY flush style and layout).
    let scrollStale = false;
    // The scroll offset and the viewport size are cached from the scroll / resize events:
    // window.scrollX / scrollY / innerHeight can flush style and layout when read mid-frame.
    let sx = window.scrollX;
    let sy = window.scrollY;
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    let px = -1e5;
    let py = -1e5;
    let active = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let flareTimer = 0;
    // Work is done only while something changed (pointer, scroll, resize) or the light is still easing:
    // an idle pointer repaints nothing, and followers run at display rate only while dirty.
    let dirty = true;

    // Which surfaces are near the viewport, and which changed size: both reported by the browser
    // between frames, with no layout read from us.
    // Raw observer on purpose: one shared observer over many surfaces, reading every entry (observeIntersection
    // is the single-target helper).
    const visibility =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const s = surfaces.get(entry.target as HTMLElement);
                if (!s) continue;
                // A removed surface reports one last "not intersecting": let go of it now, so the page it came
                // from is not kept alive by this Map or the observer.
                if (!entry.target.isConnected) {
                  forget(s);
                  list = list.filter((x) => x !== s);
                  continue;
                }
                if (entry.isIntersecting && !s.near) s.stale = true;
                s.near = entry.isIntersecting;
              }
            },
            { rootMargin: `${REACH}px` },
          )
        : null;
    const resizes =
      typeof ResizeObserver === "function"
        ? new ResizeObserver((entries) => {
            for (const entry of entries) {
              const s = surfaces.get(entry.target as HTMLElement);
              if (s) s.stale = true;
            }
          })
        : null;

    const release = (el: HTMLElement) => {
      state.delete(el);
      el.removeAttribute("data-sheen-lit");
      for (const p of ["--sheen-mx", "--sheen-my", "--sheen-ra", "--sheen-lit"]) el.style.removeProperty(p);
    };

    const forget = (s: Surface) => {
      surfaces.delete(s.el);
      visibility?.unobserve(s.el);
      resizes?.unobserve(s.el);
    };

    /** Re-query the surfaces (a cheap selector match, no layout) and (un)observe the changes. */
    const discover = (now: number) => {
      discoveredAt = now;
      const found = new Set<HTMLElement>();
      for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
        if (el.dataset.sheenLight === "off" || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
          continue;
        found.add(el);
        if (surfaces.has(el)) continue;
        surfaces.set(el, { el, x: 0, y: 0, w: 0, h: 0, near: true, stale: true, pinned: null, at: 0 });
        visibility?.observe(el);
        resizes?.observe(el);
      }
      for (const s of surfaces.values()) if (!found.has(s.el)) forget(s);
      list = Array.from(surfaces.values());
    };

    /** Drop every surface (and lit state) whose element left the document: no layout, no queries. */
    const sweep = () => {
      let removed = false;
      for (const s of surfaces.values()) {
        if (s.el.isConnected) continue;
        forget(s);
        removed = true;
      }
      for (const el of state.keys()) if (!el.isConnected) state.delete(el);
      if (removed) list = Array.from(surfaces.values());
    };

    /**
     * Store a box. `viewportLeft` / `viewportTop` are viewport coordinates; the scroll offset when
     * they were taken turns them into page ones (pinned surfaces keep viewport coordinates).
     */
    const store = (s: Surface, left: number, top: number, width: number, height: number) => {
      s.pinned ??= isPinned(s.el);
      s.x = s.pinned ? left : left + sx;
      s.y = s.pinned ? top : top + sy;
      s.w = width;
      s.h = height;
    };

    /**
     * Boxes without a forced layout: a one-shot IntersectionObserver reports every target's
     * bounding box with its first callback, computed by the browser in its own rendering step
     * (a getBoundingClientRect here would flush style and layout in the middle of our frame).
     * The boxes land one frame later; until then the old box (or none) is used.
     */
    const measure = (due: Surface[]) => {
      if (!due.length) return;
      if (typeof IntersectionObserver !== "function") {
        for (const s of due) {
          const r = s.el.getBoundingClientRect();
          store(s, r.left, r.top, r.width, r.height);
        }
        return;
      }
      // Raw observer on purpose: a one-shot read of boundingClientRect for many surfaces, no layout read.
      const once = new IntersectionObserver((entries) => {
        once.disconnect();
        for (const entry of entries) {
          const s = surfaces.get(entry.target as HTMLElement);
          if (!s) continue;
          const r = entry.boundingClientRect;
          store(s, r.left, r.top, r.width, r.height);
        }
      });
      for (const s of due) once.observe(s.el);
    };

    /** READ phase: ask for the boxes of what is near the viewport and stale (no layout read here). */
    const read = (now: number) => {
      if (now - discoveredAt > DISCOVER_MS) discover(now);
      if (now - refreshedAt > REFRESH_MS) {
        refreshedAt = now;
        allStale = true;
      }
      let waiting = false;
      const due: Surface[] = [];
      for (const s of list) {
        if (!s.near) continue;
        const pinnedDue = pinnedDirty && s.pinned !== false;
        if (!(allStale || s.stale || pinnedDue)) continue;
        if (!allStale && !s.stale && now - s.at <= PINNED_MS) {
          waiting = true; // asked for on a later beat, so a sticky bar's last move still lands
          continue;
        }
        s.at = now;
        s.stale = false;
        due.push(s);
      }
      allStale = false;
      pinnedDirty = waiting;
      measure(due);
      // Boxes land one frame later, and a sticky bar may still be moving: look again next frame.
      if (due.length > 0 || waiting) dirty = true;
    };

    const update = (now: number) => {
      if (!dirty || (!active && state.size === 0)) return;
      // The light holds still while the page scrolls: under a resting pointer the surfaces sliding past it would each get
      // inline style writes on every frame (about 1,000 style invalidations per 2 s of scroll on the data table, one
      // frame in three over budget at 4x). It catches up 150 ms after the last scroll event.
      if (isScrolling()) {
        wakeBeat(200);
        return;
      }
      dirty = false;
      if (scrollStale) {
        scrollStale = false;
        sx = window.scrollX;
        sy = window.scrollY;
      }
      read(now);

      // Pick the nearest surfaces within reach (viewport box = cached page box minus the scroll).
      const near: { el: HTMLElement; left: number; top: number; w: number; h: number; d: number }[] = [];
      if (active) {
        for (const s of list) {
          if (!s.near || s.w < 2 || s.h < 2) continue;
          // Pinned surfaces hold viewport coordinates, the others page coordinates.
          const left = s.pinned ? s.x : s.x - sx;
          const top = s.pinned ? s.y : s.y - sy;
          if (top + s.h < 0 || top > vh) continue;
          const dx = Math.max(left - px, 0, px - (left + s.w));
          const dy = Math.max(top - py, 0, py - (top + s.h));
          const d = Math.hypot(dx, dy);
          if (d <= REACH) near.push({ el: s.el, left, top, w: s.w, h: s.h, d });
        }
        near.sort((a, b) => a.d - b.d || a.w * a.h - b.w * b.h);
        near.length = Math.min(near.length, MAX_LIT);
      }
      const keep = new Set(near.map((n) => n.el));

      // WRITE phase: light the near ones (eased on the beat, no CSS transition), fade the rest out.
      let easing = false;
      for (const { el, left, top, w, h, d } of near) {
        const prev = state.get(el) ?? { lit: REST_LIT, ra: REST_ANGLE };
        let a = (Math.atan2(px - (left + w / 2), -(py - (top + h / 2))) * 180) / Math.PI;
        // Continuous angle, so the light never spins the long way round.
        while (a - prev.ra > 180) a -= 360;
        while (a - prev.ra < -180) a += 360;
        const target = 1 - d / REACH;
        const next = { lit: prev.lit + (target - prev.lit) * 0.23, ra: prev.ra + (a - prev.ra) * 0.29 };
        if (Math.abs(target - next.lit) > 0.01 || Math.abs(a - next.ra) > 0.5) easing = true;
        if (!state.has(el)) el.setAttribute("data-sheen-lit", "");
        state.set(el, next);
        el.style.setProperty("--sheen-mx", `${(px - left).toFixed(1)}px`);
        el.style.setProperty("--sheen-my", `${(py - top).toFixed(1)}px`);
        el.style.setProperty("--sheen-ra", `${next.ra.toFixed(1)}deg`);
        el.style.setProperty("--sheen-lit", next.lit.toFixed(3));
      }
      for (const [el, s] of state) {
        if (keep.has(el)) continue;
        if (!el.isConnected) {
          state.delete(el);
          continue;
        }
        const lit = s.lit + (REST_LIT - s.lit) * 0.19;
        const ra = s.ra + (REST_ANGLE - s.ra) * 0.19;
        if (Math.abs(lit - REST_LIT) < 0.02 && Math.abs(ra - REST_ANGLE) < 2) {
          release(el);
          continue;
        }
        easing = true;
        state.set(el, { lit, ra });
        el.style.setProperty("--sheen-ra", `${ra.toFixed(1)}deg`);
        el.style.setProperty("--sheen-lit", lit.toFixed(3));
      }
      if (easing) {
        dirty = true;
        wakeBeat(120);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const dt = Math.max(1, event.timeStamp - lastT);
      const speed = Math.hypot(event.clientX - lastX, event.clientY - lastY) / dt;
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = event.timeStamp;
      if (speed > FLARE_SPEED && dt < 80) {
        // A fast flick: the reflection flares for a moment.
        root.setAttribute("data-sheen-flare", "");
        window.clearTimeout(flareTimer);
        flareTimer = window.setTimeout(() => root.removeAttribute("data-sheen-flare"), 180);
      }
      px = event.clientX;
      py = event.clientY;
      active = true;
      dirty = true;
      sheenPointer.x = px / vw;
      sheenPointer.y = py / vh;
      sheenPointer.on = true;
      wakeBeat();
    };
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      active = false;
      dirty = true;
      sheenPointer.on = false;
      px = py = -1e5;
      wakeBeat(400);
    };
    const onScroll = (event: Event) => {
      // The window scrolling needs no re-read (page boxes minus the offset); a nested scroller
      // moves its surfaces without the window knowing, so those boxes are read again.
      if (event.target === document || event.target === document.documentElement) {
        scrollStale = true; // the offsets are re-read on the next beat, not here (a read flushes style and layout)
        pinnedDirty = true; // sticky / fixed surfaces may have moved
      } else {
        allStale = true;
      }
      dirty = true;
      markScrolling();
      if (active) wakeBeat(300);
    };
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      scrollStale = true;
      allStale = true;
      dirty = true;
    };

    // Surfaces removed with their page (a route change) are released within a couple of seconds, even with the
    // pointer idle and the beat asleep; the IntersectionObserver report above usually gets there first.
    const sweepTimer = window.setInterval(sweep, 2000);
    const stopFollow = addFollower(update);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    return () => {
      stopFollow();
      window.clearInterval(sweepTimer);
      window.clearTimeout(flareTimer);
      root.removeAttribute("data-sheen-flare");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      visibility?.disconnect();
      resizes?.disconnect();
      surfaces.clear();
      list = [];
      for (const el of Array.from(state.keys())) release(el);
      sheenPointer.on = false;
    };
  }, [enabled]);
}
