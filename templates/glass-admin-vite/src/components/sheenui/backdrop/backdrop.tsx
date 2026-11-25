"use client";

import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useGlassMode, useReducedTransparency, useSheenStyle, type SheenStyle } from "../hooks/use-preferences";
import { cn } from "../lib/cn";
import { setBeatRate } from "../motion/beat";
import { useLoopPlayback, useMotionGate } from "../motion/gate";
import { useSheenPointerLight } from "../motion/pointer-light";
import { useAutoLiteGlass } from "./auto-lite";
import { useOsSolidGlass } from "../hooks/use-media-query";
import { observeIntersection } from "../hooks/use-intersection";
import { useResolvedScheme } from "../hooks/use-resolved-scheme";

export { useOsSolidGlass };

/*
 * <SheenBackdrop>: the page's live wallpaper, one per style preset.
 *
 *   Liquid Glass   silk ribbons, glossy spheres and daylight caustics drifting on the beat
 *   Aurora Neon    an opaque low-res canvas aurora with a dawn sweep and a floor reflection
 *
 * Rules it keeps:
 *   - a fixed sibling BEHIND the page (z-index -1): never a wrapper of glass, so every glass
 *     surface still blurs the real backdrop
 *   - static first paint in pure CSS (.sheen-sky__base); the moving layer is code-split per style
 *   - ambient motion runs only while the first viewport is on screen and the tab is visible,
 *     on ONE ~30 Hz beat shared with the pointer light (20 Hz in Lite glass)
 *   - Lite glass automatically on weak devices (useAutoLiteGlass) or by the visitor's toggle
 *   - reduced motion: a still sky; reduced transparency / forced colours: solid (CSS)
 *   - also mounts the pointer rim light for every glass surface (useSheenPointerLight)
 */

const LiquidSky = lazy(() => import("./liquid-sky"));
const AuroraSky = lazy(() => import("./aurora-sky"));

/** Props of {@link SheenBackdrop}. */
export type SheenBackdropProps = {
  /**
   * "hero": the home page look (brightest light behind the hero composition, caustics, a calm
   * veil under the copy; it settles into the page look as the first viewport scrolls away).
   * "page": the quieter docs look.
   * @default "page"
   */
  mode?: "hero" | "page";
  /** Force a style preset ("liquid" or "aurora"); defaults to the saved one (html[data-sheen-style]). */
  style?: SheenStyle;
  /**
   * Pause the ambient motion (e.g. a Pause button).
   * @default false
   */
  paused?: boolean;
  /** Adds extra classes to the fixed backdrop element. */
  className?: string;
};

/**
 * The theme actually on screen: the saved choice, or the OS setting when it is "system". Live: it
 * updates when the person switches theme or the OS flips between light and dark.
 *
 * Accessibility: No UI of its own. Server render returns "light" for "system" until hydration.
 *
 * @example
 * ```tsx
 * import { useResolvedTheme } from "@sheenui/theme";
 *
 * export function ThemeLabel() {
 *   const theme = useResolvedTheme(); // "light" | "dark"
 *   return <span>{theme === "dark" ? "Night" : "Day"}</span>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useResolvedTheme(): "light" | "dark" {
  return useResolvedScheme();
}

/**
 * The page's live wallpaper, one per style preset: silk ribbons and spheres for Liquid Glass, a
 * canvas aurora for Aurora Neon. Mount it once near the root, as a sibling before your content
 * (never a wrapper), so every glass surface blurs the real backdrop. It also mounts the pointer
 * rim light for glass surfaces.
 *
 * Props (see {@link SheenBackdropProps}): `mode` ("hero" | "page", default "page"), `style`
 * (force "liquid" or "aurora"; default the saved style), `paused` (default false), `className`.
 *
 * Accessibility: Decorative (`aria-hidden`), not focusable, and never blocks pointer events. Contrast is designed against the static base layer, so text stays readable when motion is off.
 * Glass: A fixed layer behind the page (z-index -1) with a static CSS first paint; the moving layer is code-split per style. Under reduced transparency, more contrast or forced colors it renders solid and skips the canvas work.
 * Motion: Runs on one shared ~30 Hz beat (20 Hz in Lite glass) only while the first viewport is on screen and the tab is visible. Reduced motion shows a still sky.
 *
 * @example
 * ```tsx
 * import type { ReactNode } from "react";
 * import { SheenBackdrop } from "@sheenui/theme";
 *
 * export function App({ children }: { children: ReactNode }) {
 *   return (
 *     <>
 *       <SheenBackdrop mode="page" />
 *       <main>{children}</main>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function SheenBackdrop({ mode = "page", style: styleProp, paused = false, className }: SheenBackdropProps) {
  const { style: savedStyle } = useSheenStyle();
  const style = styleProp ?? savedStyle;
  const theme = useResolvedTheme();
  const { reduced, pointerFx } = useMotionGate();
  const [lite] = useGlassMode();
  const [reducedTransparency] = useReducedTransparency();
  const osSolid = useOsSolidGlass();
  const solid = reducedTransparency || osSolid;
  const skyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLElement>(null);
  // Ambient light plays only while the first viewport is on screen and the tab is visible.
  const playing = useLoopPlayback(sentinelRef, { paused });
  const active = playing && !solid;

  // Hero <-> page: the Liquid sky changes mode by cross-fading, never by moving. The outgoing look stays on screen as a
  // ghost layer (the previous mode, opacity-only fade-out in backdrop.css) while the incoming one sits beneath it, so the
  // orbs never change box (the live layer is keyed by mode: new nodes, no layout shift) and there is no hard cut. Reduced motion swaps instantly, without a ghost.
  const [ghost, setGhost] = useState<"hero" | "page" | null>(null);
  const lastMode = useRef(mode);
  useLayoutEffect(() => {
    const previous = lastMode.current;
    lastMode.current = mode;
    if (previous === mode) return;
    setGhost(style === "liquid" && !reduced && !solid ? previous : null);
  }, [mode, style, reduced, solid]);
  useEffect(() => {
    if (!ghost) return;
    const timer = window.setTimeout(() => setGhost(null), 420);
    return () => window.clearTimeout(timer);
  }, [ghost]);

  useAutoLiteGlass();
  useSheenPointerLight(pointerFx && !solid);

  useEffect(() => {
    setBeatRate(lite ? 20 : 30);
  }, [lite]);

  // Hero sky below the fold: once the first viewport has mostly scrolled away (the top 40 % of it is
  // gone), a veil of the page tint calms it (backdrop.css, `[data-away]`). The vivid ribbons and orbs
  // belong to the hero; the text below it (the stat cards' links, the long copy) sits on the sky
  // between the panels and needs AA over it. The veil fades in, so it is never a jump.
  useEffect(() => {
    const el = sentinelRef.current;
    const sky = skyRef.current;
    if (!el || !sky) return;
    return observeIntersection(el, (entry) => sky.toggleAttribute("data-away", !entry.isIntersecting), {
      rootMargin: "-40% 0px 0px 0px",
    });
  }, []);

  // The body's CSS blobs (backgrounds.css) would only be painted under the live sky.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-sheen-backdrop", style);
    return () => root.removeAttribute("data-sheen-backdrop");
  }, [style]);

  return (
    <>
      <div
        ref={skyRef}
        data-slot="backdrop"
        className={cn("sheen-sky", className)}
        data-style={style}
        data-mode={mode}
        data-live={active ? "" : undefined}
        aria-hidden
      >
        <div className="sheen-sky__base" />
        {!solid && (
          <Suspense fallback={null}>
            {style === "aurora" ? (
              <AuroraSky theme={theme} reduced={reduced} active={active} lite={lite} mode={mode} />
            ) : (
              <LiquidSky key={mode} mode={mode} active={active} lite={lite} />
            )}
          </Suspense>
        )}
        <div className="sheen-sky__grain" />
      </div>
      {ghost && (
        <div
          data-slot="backdrop"
          className={cn("sheen-sky sheen-sky--ghost", className)}
          data-style="liquid"
          data-mode={ghost}
          aria-hidden
        >
          <div className="sheen-sky__base" />
          <Suspense fallback={null}>
            <LiquidSky mode={ghost} active={false} lite={lite} />
          </Suspense>
        </div>
      )}
      <i ref={sentinelRef} className="sheen-sky-sentinel" aria-hidden />
    </>
  );
}
