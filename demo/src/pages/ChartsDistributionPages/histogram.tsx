import { gaussian, seeded, whole } from "./shared";

/** Basket sizes with two peaks (single items vs. bundles), in dollars. */
export function makeOrderValues(seed = 21, count = 900) {
  const random = seeded(seed);
  const z = gaussian(random);
  return Array.from({ length: count }, () => {
    const bundle = random() < 0.35;
    return Math.max(4, Math.round(bundle ? 142 + 24 * z() : 46 + 14 * z()));
  });
}

export const usd = (n: number) => `$${whole.format(n)}`;
