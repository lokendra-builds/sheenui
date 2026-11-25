/**
 * Limits `n` to the range from `lo` to `hi`. The one clamp helper in the library: pure, with no directive,
 * so server and client modules can both import it.
 *
 * @internal Re-exported by the charts' `chart-utils` for the chart modules.
 * @example
 * ```ts
 * import { clamp } from "./math";
 *
 * export const percent = (n: number) => clamp(n, 0, 100);
 * ```
 *
 * @see /components
 */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
