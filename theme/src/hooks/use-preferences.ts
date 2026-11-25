"use client";

import { useCallback, useSyncExternalStore } from "react";

import { REDUCED_MOTION_QUERY, useMediaQuery } from "./use-media-query";

/**
 * User preferences, stored as data-attributes on <html> (so CSS can react)
 * and in localStorage (so they survive reloads and sync across tabs).
 *
 *   data-theme         "light" | "dark"          (absent = follow OS)
 *   data-motion        "reduced"                 (absent = full motion)
 *   data-transparency  "reduced"                 (absent = glass)
 *   data-glass         "lite" | "full"           (absent = full blur; "full" = the visitor turned
 *                                                 Lite off, so automatic Lite glass stays off)
 *   data-sheen-style   "liquid" | "aurora"       (absent = "liquid", the default style preset)
 *
 * Inline `sheenPreferenceScript` in <head> so the attributes are set before first paint.
 */

type Pref = "theme" | "motion" | "transparency" | "glass" | "style";

const PREFS: readonly Pref[] = ["theme", "motion", "transparency", "glass", "style"];
const STORAGE_PREFIX = "sheen:";

/** The attribute each preference lives in on <html>. */
const ATTR: Record<Pref, string> = {
  theme: "data-theme",
  motion: "data-motion",
  transparency: "data-transparency",
  glass: "data-glass",
  style: "data-sheen-style",
};

/* ---------- Style presets ---------- */

/**
 * SheenUI's style presets. Each one is a layer of tokens (backdrop, glass recipe, rim light,
 * accent palette, display type, motion intensity) over the same components:
 *   - "liquid"  Liquid Glass (default): thick clear glass over silk ribbons and glossy spheres.
 *   - "aurora"  Aurora Neon: frosted glass with glowing rims under a moving aurora sky.
 */
export const SHEEN_STYLES = ["liquid", "aurora"] as const;
/** The two style presets: `liquid` (Liquid Glass) and `aurora` (Aurora Neon). */
export type SheenStyle = (typeof SHEEN_STYLES)[number];
/** The style preset used when nothing is saved: `liquid`. */
export const DEFAULT_SHEEN_STYLE: SheenStyle = "liquid";

/**
 * Type guard: true when `value` is one of `SHEEN_STYLES`. Pure; no DOM access, so it is safe to call
 * on the server.
 */
export function isSheenStyle(value: unknown): value is SheenStyle {
  return typeof value === "string" && (SHEEN_STYLES as readonly string[]).includes(value);
}

/* ---------- Store ---------- */

function read(pref: Pref): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute(ATTR[pref]);
}

function apply(pref: Pref, value: string | null) {
  const root = document.documentElement;
  if (value === null) root.removeAttribute(ATTR[pref]);
  else root.setAttribute(ATTR[pref], value);
}

function write(pref: Pref, value: string | null) {
  apply(pref, value);
  try {
    if (value === null) localStorage.removeItem(STORAGE_PREFIX + pref);
    else localStorage.setItem(STORAGE_PREFIX + pref, value);
  } catch {
    /* storage can be blocked (private mode); the attribute still applies */
  }
}

/*
 * One store for every consumer: a single MutationObserver on <html> (plus one
 * `storage` listener for other tabs) fans out to a set of listeners. It is created
 * for the first subscriber and torn down after the last one leaves, so a page with
 * twenty preference-aware components still has exactly one observer.
 */
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function emit() {
  for (const listener of listeners) listener();
}

/** Another tab changed a preference: mirror it here. The observer then notifies listeners. */
function onStorage(event: StorageEvent) {
  if (!event.key?.startsWith(STORAGE_PREFIX)) return;
  const pref = event.key.slice(STORAGE_PREFIX.length) as Pref;
  if (!PREFS.includes(pref)) return;
  if (pref === "style") apply(pref, isSheenStyle(event.newValue) ? event.newValue : DEFAULT_SHEEN_STYLE);
  else apply(pref, event.newValue);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) {
    observer = new MutationObserver(emit);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: PREFS.map((pref) => ATTR[pref]),
    });
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Server snapshot: no attributes exist yet (SSR / prerender). */
const serverSnapshot = () => null;

function usePref(pref: Pref) {
  const value = useSyncExternalStore(subscribe, () => read(pref), serverSnapshot);
  const set = useCallback((next: string | null) => write(pref, next), [pref]);
  return [value, set] as const;
}

/** The theme a visitor can pick: `light`, `dark` or `system` (follow the OS). */
export type ThemeChoice = "light" | "dark" | "system";

/**
 * The visitor's colour theme and a setter that saves it (`data-theme` on `<html>` plus localStorage,
 * synced across tabs). `"system"` removes the attribute so the OS preference wins.
 * Returns `{ theme, setTheme }`; `theme` is `"light" | "dark" | "system"` and is `"system"` on the server.
 *
 * Accessibility: Pair the control with a visible label or `aria-pressed`; the hook has no UI.
 *
 * @example
 * ```tsx
 * import { useTheme } from "@sheenui/theme";
 *
 * export function ThemeButton() {
 *   const { theme, setTheme } = useTheme();
 *   return <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme: {theme}</button>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useTheme() {
  const [value, set] = usePref("theme");
  const theme: ThemeChoice = value === "light" || value === "dark" ? value : "system";
  const setTheme = useCallback((t: ThemeChoice) => set(t === "system" ? null : t), [set]);
  return { theme, setTheme };
}

/**
 * The in-app "reduce transparency" switch: `[on, setOn]`. When on (`data-transparency="reduced"` on
 * `<html>`), glass surfaces turn solid. Saved in localStorage and synced across tabs; `false` on the server.
 *
 * Accessibility: Honours the OS "reduce transparency" setting in CSS as well; this is the manual override.
 *
 * @example
 * ```tsx
 * import { useReducedTransparency } from "@sheenui/theme";
 *
 * export function SolidToggle() {
 *   const [solid, setSolid] = useReducedTransparency();
 *   return <label><input type="checkbox" checked={solid} onChange={(e) => setSolid(e.target.checked)} /> Solid surfaces</label>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useReducedTransparency() {
  const [value, set] = usePref("transparency");
  const setReduced = useCallback((on: boolean) => set(on ? "reduced" : null), [set]);
  return [value === "reduced", setReduced] as const;
}

/**
 * The in-app "reduce motion" switch: `[on, setOn]` (`data-motion="reduced"` on `<html>`, saved in
 * localStorage, synced across tabs; `false` on the server). It is the manual switch only: use
 * `useSheenReducedMotion` for "OS setting OR this switch".
 *
 * Accessibility: Reduced motion keeps opacity feedback and drops movement, scaling and loops.
 *
 * @example
 * ```tsx
 * import { useMotionPreference } from "@sheenui/theme";
 *
 * export function MotionToggle() {
 *   const [reduced, setReduced] = useMotionPreference();
 *   return <button aria-pressed={reduced} onClick={() => setReduced(!reduced)}>Reduce motion</button>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useMotionPreference() {
  const [value, set] = usePref("motion");
  const setReduced = useCallback((on: boolean) => set(on ? "reduced" : null), [set]);
  return [value === "reduced", setReduced] as const;
}

/**
 * Lite glass: cheaper blur and a calmer backdrop for weak devices. Turned on automatically
 * (see useAutoLiteGlass in the backdrop) unless the visitor made a choice; turning it off saves
 * "full", so it stays off on the next visit. Returns `[lite, setLite]`; `false` on the server.
 *
 * Accessibility: Lite glass changes blur and backdrop only; contrast and layout stay the same.
 *
 * @example
 * ```tsx
 * import { useGlassMode } from "@sheenui/theme";
 *
 * export function LiteToggle() {
 *   const [lite, setLite] = useGlassMode();
 *   return <button aria-pressed={lite} onClick={() => setLite(!lite)}>Lite glass</button>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useGlassMode() {
  const [value, set] = usePref("glass");
  const setLite = useCallback((on: boolean) => set(on ? "lite" : "full"), [set]);
  return [value === "lite", setLite] as const;
}

/**
 * The active style preset (`"liquid"` by default, or `"aurora"`) and a setter that saves it
 * (`data-sheen-style` on `<html>` plus localStorage, synced across tabs). `"liquid"` on the server.
 * Returns `{ style, setStyle }`.
 *
 * Accessibility: The presets share the same contrast targets; this hook has no UI of its own.
 *
 * @example
 * ```tsx
 * import { useSheenStyle } from "@sheenui/theme";
 *
 * export function StyleSwitch() {
 *   const { style, setStyle } = useSheenStyle();
 *   return <button onClick={() => setStyle(style === "liquid" ? "aurora" : "liquid")}>Style: {style}</button>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useSheenStyle() {
  const [value, set] = usePref("style");
  const style: SheenStyle = isSheenStyle(value) ? value : DEFAULT_SHEEN_STYLE;
  const setStyle = useCallback((next: SheenStyle) => set(next), [set]);
  return { style, setStyle };
}

/** The active style preset outside React (reads <html>; "liquid" on the server). */
export function readSheenStyle(): SheenStyle {
  const value = read("style");
  return isSheenStyle(value) ? value : DEFAULT_SHEEN_STYLE;
}

/* ---------- Reduced motion (live) ---------- */

/**
 * True when the OS asks for reduced motion OR the in-app toggle is on.
 * Live: it subscribes to the media query (Motion's useReducedMotion reads the OS setting
 * once per mount, so a change in system settings would be missed until a reload).
 * `false` on the server.
 *
 * Accessibility: Follows `prefers-reduced-motion` live and the in-app switch; branch every non-essential animation on it.
 *
 * @example
 * ```tsx
 * import { useSheenReducedMotion } from "@sheenui/theme";
 *
 * export function Pulse() {
 *   const reduced = useSheenReducedMotion();
 *   return <span className={reduced ? "" : "animate-pulse"}>Live</span>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useSheenReducedMotion() {
  const os = useMediaQuery(REDUCED_MOTION_QUERY);
  const [app] = useMotionPreference();
  return os || app;
}

/**
 * Inline this in <head> (before your CSS) to apply saved preferences with no flash.
 * The style preset is always set (the saved one, or "liquid"), so CSS can rely on it.
 */
export const sheenPreferenceScript = `(function(){try{var r=document.documentElement;${JSON.stringify(PREFS.filter((pref) => pref !== "style"))}.forEach(function(k){var v=localStorage.getItem("${STORAGE_PREFIX}"+k);if(v)r.setAttribute("data-"+k,v);});var s=localStorage.getItem("${STORAGE_PREFIX}style");r.setAttribute("data-sheen-style",${SHEEN_STYLES.map((style) => `s===${JSON.stringify(style)}`).join("||")}?s:${JSON.stringify(DEFAULT_SHEEN_STYLE)});}catch(e){document.documentElement.setAttribute("data-sheen-style",${JSON.stringify(DEFAULT_SHEEN_STYLE)});}})();`;
