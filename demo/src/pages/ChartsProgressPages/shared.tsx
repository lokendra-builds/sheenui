import { seeded } from "../../demo-utils";

export const CHARTS = "theme/src/components/charts/";

/* ====================================================================== */
/* Demo data (deterministic, so screenshots match on every load)           */
/* ====================================================================== */

/** Normally distributed numbers (Box–Muller) from a seeded PRNG. */
export function gaussian(rand: () => number) {
  return () => {
    const u = Math.max(1e-9, rand());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
}

/** Formats with units for the demos: never more than one decimal, so sums like 81.6 + 46.4 never print 46.400000000000006. */
export const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

/** Days ending on a fixed date (so the demo never drifts), oldest first. */
export function days(count: number, end = Date.UTC(2026, 9, 30)) {
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * 86_400_000));
}

export { seeded };
