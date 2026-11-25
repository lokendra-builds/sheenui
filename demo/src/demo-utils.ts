// Tiny helpers shared by many demo pages. Keep this file free of imports so it never drags page code into a shared chunk.

/** Resolves after `ms` milliseconds: stands in for a network call in the demos. */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Seeded PRNG (mulberry32): the same "random" data on every load. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded linear congruential PRNG: a different sequence from `seeded`, kept because some pages' data was tuned to it. */
export function seededLcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
