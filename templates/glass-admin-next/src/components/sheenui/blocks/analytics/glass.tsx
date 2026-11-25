"use client";

import type { ComponentProps } from "react";
import { createContext, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

import { observeIntersection } from "../../hooks/use-intersection";
import { cn } from "../../lib/cn";

/* ====================================================================================
 * Shell (header + controls)
 * ==================================================================================== */

/**
 * Heading level of the panels: one below the dashboard title (set by AnalyticsShell).
 *
 * @internal Not exported from the package barrel, so its example is not type-checked against `@sheenui/theme`.
 *
 * @example
 * ```tsx
 * import { useContext } from "react";
 * import { PanelHeadingContext } from "./glass";
 *
 * export function Example() {
 *   const level = useContext(PanelHeadingContext); // "h2" | "h3" | "h4" | "p"
 *   return <p>{level}</p>;
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export const PanelHeadingContext = createContext<"h2" | "h3" | "h4" | "p">("h3");

/** Controls inside a glass surface sit on its blur already: drop their own backdrop-filter. */
export const noBlur = "[-webkit-backdrop-filter:none] [backdrop-filter:none]";

/**
 * Frosted solid surface for a panel when the dashboard runs flat glass (`data-glass-budget`):
 * same rim, sheen and shadow, a denser fill, no backdrop-filter.
 */
export const flatCard =
  "[[data-glass-budget=flat]_&]:[backdrop-filter:none]! [[data-glass-budget=flat]_&]:[-webkit-backdrop-filter:none]! [[data-glass-budget=flat]_&]:bg-sheen-surface/85";

/** Glass budget of a dashboard: `"auto"` measures frames and goes flat when the device cannot keep up, `"full"` always uses real glass, `"flat"` always uses frosted solid panels. */
export type AnalyticsGlass = "auto" | "full" | "flat";

/**
 * The glass budget `AnalyticsShell` resolved (`"full"` or `"flat"`), for the surfaces inside it.
 * Read it with `useContext` to drop your own backdrop blur when the dashboard runs flat; the
 * default is `"full"` outside a shell.
 *
 * Accessibility and keyboard: none of its own. Glass: `"flat"` means frosted solid panels with no
 * `backdrop-filter` (weak device, Lite glass, Save-Data, or measured dropped frames).
 *
 * @example
 * ```tsx
 * import { useContext, type Context } from "react";
 * import { Badge } from "@sheenui/theme";
 *
 * // Placeholder: an internal context of the analytics kit, not part of the package entry.
 * declare const GlassBudgetContext: Context<"full" | "flat">;
 *
 * function Chip() {
 *   const budget = useContext(GlassBudgetContext);
 *   return <Badge className={budget === "flat" ? "bg-sheen-surface" : "backdrop-blur-md"}>chip</Badge>;
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export const GlassBudgetContext = createContext<"full" | "flat">("full");

const GLASS_KEY = "sheen:dashboard-glass";

type DeviceHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Weak device or a data saver: start with flat panels. */
function weakDevice() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as DeviceHints;
  return (
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true
  );
}

/** `useSyncExternalStore` subscribe for values that only change with a reload or a re-render. */
function subscribeNever() {
  return () => undefined;
}

function storedFlat() {
  try {
    return sessionStorage.getItem(GLASS_KEY) === "flat";
  } catch {
    return false;
  }
}

/** Whether the dashboard should start with flat panels (see `useAdaptiveGlass`). */
function startsFlat() {
  return weakDevice() || storedFlat() || document.documentElement.dataset.glass === "lite";
}

/**
 * Glass budget for a whole dashboard. Large panels are the most expensive glass on a page (each
 * re-blurs its backdrop on every scrolled frame), so in "auto" they stay real glass only while the
 * device keeps up: on a weak device (memory, cores, Save-Data), with lite glass on, or once frames
 * drop while the dashboard scrolls or animates, they switch to a frosted solid surface (no
 * backdrop-filter) for the rest of the session. The header keeps its blur.
 *
 * Parameters: `ref` (`RefObject<HTMLElement | null>`, the dashboard root whose frames are watched) and
 * `mode` (`"auto" | "full" | "flat"`, default `"auto"`; the other two force a budget). Returns
 * `"full"` or `"flat"`: put it in `data-glass-budget` on the root and in `GlassBudgetContext`.
 * Keyboard and accessibility: none of its own; flat panels keep the same contrast and structure.
 * Motion and glass: it only samples frames while the pointer moves or the page scrolls over the
 * dashboard, so an idle dashboard costs nothing; the choice sticks for the session.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useAdaptiveGlass } from "@sheenui/theme";
 *
 * function Frame({ children }: { children: React.ReactNode }) {
 *   const ref = useRef<HTMLElement>(null);
 *   const budget = useAdaptiveGlass(ref); // "full" until frames drop
 *   return <section ref={ref} data-glass-budget={budget}>{children}</section>;
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function useAdaptiveGlass(ref: RefObject<HTMLElement | null>, mode: AnalyticsGlass = "auto") {
  const [flat, setFlat] = useState(false);
  // Known before any frame is measured: a weak device, a data saver, Lite glass, or a flat verdict from earlier in the session.
  const flatFromStart = useSyncExternalStore(subscribeNever, startsFlat, () => false);
  useEffect(() => {
    if (mode !== "auto" || flatFromStart) return;
    const root = ref.current;
    if (!root) return;
    // Watch frames only while something is moving: a scroll, the pointer over the dashboard.
    let raf = 0;
    let until = 0;
    let last = 0;
    let frames = 0;
    let slow = 0;
    let badWindows = 0;
    let windowStart = 0;
    const tick = (t: number) => {
      if (last) {
        frames += 1;
        if (t - last > 25) slow += 1;
      } else windowStart = t;
      last = t;
      if (t - windowStart >= 1000) {
        // A window where more than 1 in 8 frames missed its slot: the device isn't keeping up.
        badWindows = frames >= 20 && slow / frames > 0.125 ? badWindows + 1 : 0;
        frames = slow = 0;
        windowStart = t;
        if (badWindows >= 2) {
          try {
            sessionStorage.setItem(GLASS_KEY, "flat");
          } catch {
            /* storage blocked: flat for this page only */
          }
          setFlat(true);
          return;
        }
      }
      if (t < until) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
      }
    };
    const wake = () => {
      until = performance.now() + 1500;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stopObserving = observeIntersection(root, (entry) => {
      if (entry.isIntersecting) window.addEventListener("scroll", wake, { passive: true });
      else window.removeEventListener("scroll", wake);
    });
    root.addEventListener("pointermove", wake, { passive: true });
    return () => {
      stopObserving();
      window.removeEventListener("scroll", wake);
      root.removeEventListener("pointermove", wake);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, mode, flatFromStart]);
  return mode === "flat" || (mode === "auto" && (flat || flatFromStart)) ? "flat" : "full";
}

/**
 * Soft, static colour light behind a dashboard so its glass always has something to refract.
 * Plain gradients: no animation, no filter, painted once. AnalyticsShell renders it by default.
 *
 * Props: `className` (`string`, extra classes for the absolutely positioned layer).
 * Accessibility: `aria-hidden`, purely decorative; hidden in forced-colors mode. Keyboard: none.
 * Glass and motion: four static radial gradients from the `--sheen-blob-*` tokens (so the Style
 * presets and dark mode recolour it); no animation, no filter, painted once.
 *
 * @example
 * ```tsx
 * import { DashboardBackdrop } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <div className="relative isolate rounded-3xl p-6">
 *       <DashboardBackdrop />
 *       <h2>Glass sits on this light</h2>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function DashboardBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-slot="dashboard-backdrop"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[background:radial-gradient(42%_36%_at_12%_6%,color-mix(in_oklab,var(--sheen-blob-1)_70%,transparent),transparent_72%),radial-gradient(36%_30%_at_92%_28%,color-mix(in_oklab,var(--sheen-blob-2)_60%,transparent),transparent_72%),radial-gradient(40%_32%_at_28%_72%,color-mix(in_oklab,var(--sheen-blob-3)_55%,transparent),transparent_72%),radial-gradient(34%_28%_at_84%_92%,color-mix(in_oklab,var(--sheen-blob-4)_55%,transparent),transparent_72%)]",
        "forced-colors:hidden",
        className,
      )}
    />
  );
}

/** Alias of `AnalyticsGlass`. */
export type DashboardGlass = AnalyticsGlass;

/** Props of {@link DashboardBackdrop}. Soft, static colour light behind a dashboard so its glass always has something to refract. */
export type DashboardBackdropProps = ComponentProps<typeof DashboardBackdrop>;
