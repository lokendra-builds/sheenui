import { type AnalyticsRange, RANGE_POINTS, rangePoints } from "./data";

/** The fixed "now" of the demo data (UTC), so every render and screenshot is the same. */
export const DEMO_NOW = Date.UTC(2026, 9, 31, 23, 0, 0);

/** Small, fast, seedable PRNG (mulberry32): the same seed always yields the same demo data. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A 32-bit seed from any parts (FNV-1a). */
export function hashSeed(...parts: (string | number)[]) {
  let h = 0x811c9dc5;
  for (const char of parts.join("\u0001")) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A realistic metric series for demos: a base level, a trend over the range, a weekly or daily
 * rhythm and some noise, all from a seed. Values never go below zero.
 */
export function demoSeries(
  range: AnalyticsRange,
  {
    seed,
    base,
    growth = 0.18,
    noise = 0.07,
    rhythm = 0.16,
  }: { seed: number; base: number; growth?: number; noise?: number; rhythm?: number },
) {
  const n = RANGE_POINTS[range];
  const rand = seededRandom(seed);
  const points = rangePoints(range, undefined, DEMO_NOW);
  return points.map((p, i) => {
    const t = n <= 1 ? 1 : i / (n - 1);
    const cycle =
      range === "24h"
        ? // Quiet at night, peaks mid-afternoon (UTC demo clock).
          Math.sin(((p.date.getUTCHours() - 9) / 24) * Math.PI * 2) * rhythm * 2.2
        : range === "12m"
          ? Math.sin((i / 12) * Math.PI * 2 + 1.3) * rhythm * 0.6
          : // Weekends dip.
            p.date.getUTCDay() === 0 || p.date.getUTCDay() === 6
            ? -rhythm
            : rhythm * 0.35;
    const v = base * (1 - growth / 2 + growth * t) * (1 + cycle) * (1 + (rand() - 0.5) * 2 * noise);
    return Math.max(0, v);
  });
}

/** Resolves `make()` after `ms` (a simulated network round-trip), or rejects when aborted. */
export function simulateLatency<T>(signal: AbortSignal, make: () => T, ms = 420): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        resolve(make());
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/** A seedable PRNG with a normal() draw (Box–Muller), for richer demo data. */
export function createRng(seed: number) {
  const next = seededRandom(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return { next, normal };
}

/** Resolve after `ms` with `value`: a stand-in for a network round trip in demos. */
export function withLatency<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}
