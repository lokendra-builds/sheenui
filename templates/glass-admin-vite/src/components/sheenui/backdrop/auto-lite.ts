"use client";

import { useEffect } from "react";

type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/**
 * A device that should get Lite glass straight away: little memory, few
 * cores, or the visitor asked to save data.
 */
export function isWeakDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorHints;
  return (
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true
  );
}

const SETTLE_MS = 2600;
/** One verdict needs this much measured time (a first look at load, then only while the visitor scrolls or moves the pointer). */
const WINDOW_MS = 1200;
/** Below this many frames a second, in a window, the page gets Lite glass. */
const MIN_FPS = 45;
/** After this many healthy windows the probe is done: its listeners are removed and it never runs again. */
const HEALTHY_WINDOWS = 3;
/** An interaction burst ends when no scroll / pointer event has come for this long (no frame is requested while idle). */
const IDLE_MS = 160;
/** The probe gives up (never engages, never runs) this long after mount, whatever it saw. */
const GIVE_UP_MS = 60_000;

/**
 * Lite glass, automatically, on weak devices: low memory, few cores, Save-Data, or measured
 * dropped frames (under 45 fps over a 1.2 s window, measured once at load and then only while the visitor scrolls or
 * moves the pointer, up to three healthy windows or one minute).
 * Sets html[data-glass="lite"] for this visit only; a visitor's own saved choice always wins
 * (useGlassMode saves "lite" or "full").
 *
 * Call it once near the root (SheenBackdrop already does). No arguments, returns nothing.
 *
 * Accessibility: No UI of its own. Lite glass lowers blur cost only; contrast and focus rings are unchanged.
 * Glass: Switches `html[data-glass]` to "lite" (smaller blur, no refraction) for weak devices; a saved visitor choice always wins.
 * Motion: Measures frames after the entrance settles (2.6 s), then only during scroll and pointer activity; requests no frame while the page is idle or the tab is hidden, and stops after three healthy windows or one minute.
 *
 * @example
 * ```tsx
 * import type { ReactNode } from "react";
 * import { useAutoLiteGlass } from "@sheenui/theme";
 *
 * export function Root({ children }: { children: ReactNode }) {
 *   useAutoLiteGlass();
 *   return <main>{children}</main>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useAutoLiteGlass() {
  useEffect(() => {
    const root = document.documentElement;
    try {
      if (localStorage.getItem("sheen:glass")) return;
    } catch {
      /* storage blocked: decide anyway */
    }
    if (root.getAttribute("data-glass") === "full") return;
    if (isWeakDevice()) {
      root.setAttribute("data-glass", "lite");
      return;
    }
    let raf = 0;
    let timer = 0;
    let idle = 0;
    let measuring = false;
    let windows = 0;
    let start = 0;
    let frames = 0;
    let last = 0;
    let measured = 0;

    const done = () => {
      window.clearTimeout(timer);
      window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      measuring = false;
      removeEventListener("scroll", wake, true);
      removeEventListener("pointermove", wake, true);
      removeEventListener("wheel", wake, true);
      removeEventListener("touchmove", wake, true);
      document.removeEventListener("visibilitychange", onHidden);
    };
    const tick = (t: number) => {
      if (!measuring) return;
      if (document.visibilityState !== "visible") {
        // Hidden: nothing counts (a browser fires no frames here anyway); the window starts over on return.
        start = frames = measured = 0;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!start) start = last = t;
      frames++;
      measured += t - last;
      last = t;
      if (measured >= WINDOW_MS) {
        const fps = ((frames - 1) * 1000) / (t - start);
        if (fps < MIN_FPS) {
          root.setAttribute("data-glass", "lite");
          done();
          return;
        }
        if (++windows >= HEALTHY_WINDOWS) {
          done();
          return;
        }
        start = last = t;
        frames = measured = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      // The visitor stopped: no more frames are requested; the partial window is dropped, not judged.
      measuring = false;
      cancelAnimationFrame(raf);
      start = frames = measured = 0;
    };
    function wake() {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(idle);
      idle = window.setTimeout(pause, IDLE_MS);
      if (measuring) return;
      measuring = true;
      raf = requestAnimationFrame(tick);
    }
    function onHidden() {
      if (document.visibilityState !== "visible") pause();
    }
    // One look at load, once the entrance has settled (the page is moving by itself: the intro, the sky): a short window.
    timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        measuring = true;
        raf = requestAnimationFrame(tick);
        idle = window.setTimeout(pause, WINDOW_MS * 2);
      }
      addEventListener("scroll", wake, { capture: true, passive: true });
      addEventListener("pointermove", wake, { capture: true, passive: true });
      addEventListener("wheel", wake, { capture: true, passive: true });
      addEventListener("touchmove", wake, { capture: true, passive: true });
      document.addEventListener("visibilitychange", onHidden);
      timer = window.setTimeout(done, GIVE_UP_MS);
    }, SETTLE_MS);
    return done;
  }, []);
}
