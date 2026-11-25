"use client";

import { usePrefersDark } from "./use-media-query";
import { useTheme } from "./use-preferences";

/**
 * The ONE place the colour scheme actually on screen is resolved: the saved theme, or the OS setting while it is
 * "system". Live: it updates when the person switches theme or the OS flips. Server render returns "light" for
 * "system" until hydration. Public `useResolvedTheme` and the charts' `useDarkScheme` both read it.
 *
 * @internal Use it for effects CSS cannot switch by theme (blend modes, canvas colours); colours come from `--sheen-*` tokens.
 * @example
 * ```tsx
 * import { useResolvedScheme } from "./use-resolved-scheme";
 *
 * export function Label() {
 *   return <span>{useResolvedScheme() === "dark" ? "Night" : "Day"}</span>;
 * }
 * ```
 *
 * @see /foundations
 */
export function useResolvedScheme(): "light" | "dark" {
  const { theme } = useTheme();
  const osDark = usePrefersDark();
  return theme === "system" ? (osDark ? "dark" : "light") : theme;
}
