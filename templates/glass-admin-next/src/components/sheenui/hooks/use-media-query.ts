"use client";

import { useCallback, useSyncExternalStore } from "react";

/** The one touch query SheenUI uses: any coarse pointer (a touch laptop with a mouse counts as touch-capable). */
export const COARSE_POINTER_QUERY = "(any-pointer: coarse)";
/** The OS dark colour scheme query. */
export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

/** True while the OS asks for solid surfaces: reduced transparency, more contrast or forced colours. */
export const SOLID_GLASS_QUERY =
  "(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)";
/** A phone-width viewport: just under Tailwind's `sm` (640px). Pickers, toasts and the chat widget switch to their phone layouts under it. */
export const PHONE_QUERY = "(max-width: 639.98px)";
/** A mouse or trackpad: hover and a fine pointer. */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
/** The OS asks for reduced motion. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const canMatch = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

/** One MediaQueryList per query: a snapshot read must not allocate a new list every call. */
const lists = new Map<string, MediaQueryList>();
let listsOwner: unknown = null;
function listFor(query: string) {
  // A replaced `window.matchMedia` (a test double, a polyfill) starts a fresh cache.
  const current: unknown = Reflect.get(window, "matchMedia");
  if (listsOwner !== current) {
    lists.clear();
    listsOwner = current;
  }
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

/**
 * Whether a CSS media query currently matches, kept live with `useSyncExternalStore`. It is `serverValue`
 * (default `false`) on the server and during hydration, so prerendered markup never mismatches.
 *
 * - `enabled: false` skips the subscription and returns `false`.
 *
 * @example
 * ```tsx
 * import { useMediaQuery } from "@sheenui/theme";
 *
 * function Layout() {
 *   const wide = useMediaQuery("(min-width: 768px)");
 *   return <p>{wide ? "Wide" : "Narrow"}</p>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useMediaQuery(query: string, options: { serverValue?: boolean; enabled?: boolean } = {}) {
  const { serverValue = false, enabled = true } = options;
  // Stable per query, so React does not unsubscribe and resubscribe on every render.
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!enabled || !canMatch()) return () => undefined;
      const list = listFor(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query, enabled],
  );
  return useSyncExternalStore(
    subscribe,
    () => enabled && canMatch() && listFor(query).matches,
    () => serverValue,
  );
}

/**
 * True on devices with a coarse pointer (touch). One query, `(any-pointer: coarse)`, everywhere in SheenUI, so a
 * chart, a carousel and a tooltip never disagree about what "touch" means. `false` on the server.
 *
 * @example
 * ```tsx
 * import { useCoarsePointer } from "@sheenui/theme";
 *
 * function Hint() {
 *   return <p>{useCoarsePointer() ? "Tap to select" : "Click to select"}</p>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useCoarsePointer() {
  return useMediaQuery(COARSE_POINTER_QUERY);
}

/**
 * True when the OS prefers a dark colour scheme. `false` on the server. To follow the app's own theme switch as well,
 * use `usePreferences` from the same package.
 *
 * @example
 * ```tsx
 * import { usePrefersDark } from "@sheenui/theme";
 *
 * function Mode() {
 *   return <p>{usePrefersDark() ? "Dark" : "Light"}</p>;
 * }
 * ```
 *
 * @see /foundations
 */
export function usePrefersDark() {
  return useMediaQuery(PREFERS_DARK_QUERY);
}

/**
 * True when the OS asks for solid surfaces (reduced transparency, more contrast or forced colours).
 * Live. Use it to skip decorative blur or canvas work that solid surfaces would hide anyway.
 *
 * Accessibility: This is the signal behind SheenUI's reduced-transparency and forced-colors fallbacks.
 * Glass: Mirrors the media queries `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors: active`.
 *
 * @example
 * ```tsx
 * import { useOsSolidGlass } from "@sheenui/theme";
 *
 * export function Sparkles() {
 *   const solid = useOsSolidGlass();
 *   return solid ? null : <div className="sparkles" />;
 * }
 * ```
 *
 * @see /foundations
 */
export function useOsSolidGlass() {
  return useMediaQuery(SOLID_GLASS_QUERY);
}
