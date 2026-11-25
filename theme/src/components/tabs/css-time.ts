/**
 * Converts a CSS `<time>` string from a custom property (`"100ms"`, `".1s"`, `" 0.25s "`) to milliseconds; returns
 * `NaN` for anything else, so a caller can fall back with `||`. `parseFloat` alone reads `".1s"` as 0.1 and loses the
 * unit. Kept next to Tabs (its only caller) so the docs' Preview/Code tabs on every page do not pull in a shared chunk.
 *
 * @internal Reads the motion duration tokens at run time.
 * @example
 * ```ts
 * import { cssTimeToMs } from "./css-time";
 *
 * export const instant = (el: Element) =>
 *   cssTimeToMs(getComputedStyle(el).getPropertyValue("--sheen-duration-instant")) || 100;
 * ```
 *
 * @see /components/tabs
 */
export function cssTimeToMs(value: string): number {
  const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/i.exec(value);
  if (!match) return Number.NaN;
  const [, amount = "", unit = ""] = match;
  const n = Number(amount);
  return unit.toLowerCase() === "s" ? n * 1000 : n;
}
