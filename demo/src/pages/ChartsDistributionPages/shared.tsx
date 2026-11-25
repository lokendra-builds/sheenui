import { seeded } from "../../demo-utils";
import type { DivergingLevel } from "@sheenui/theme";

export const CHARTS = "theme/src/components/charts/";

/**
 * Chart cards on these pages: the card is the glass, so the small glass inside it (its Chart / Table
 * tabs) skips its own backdrop blur. A blur nested in a blurred card only blurs the card itself, yet
 * costs a surface of the glass budget (at most 8 in view).
 */
export const CARD = "[&_.glass-1]:[backdrop-filter:none] [&_.glass-1]:[-webkit-backdrop-filter:none]";

/* ---------- Deterministic sample data ---------- */

/** Normally distributed numbers (Box–Muller) from a seeded generator. */
export function gaussian(random: () => number) {
  return () => {
    const u = Math.max(1e-12, random());
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

/** 1,200 API response times (ms): log-normal around 120 ms with a long tail. */
export function makeLatencies(seed = 7, count = 1200) {
  const z = gaussian(seeded(seed));
  return Array.from({ length: count }, () => Math.round(Math.exp(Math.log(118) + 0.42 * z())));
}

/* ====================================================================== */
/* Diverging bars                                                         */
/* ====================================================================== */

export const agreement: DivergingLevel[] = [
  { key: "sd", label: "Strongly disagree" },
  { key: "d", label: "Disagree" },
  { key: "n", label: "Neutral" },
  { key: "a", label: "Agree" },
  { key: "sa", label: "Strongly agree" },
];

// Formatters are built once: a chart may format hundreds of values per render.
export const whole = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

export const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export const ms = (n: number) => `${whole.format(n)} ms`;

/** Days with at most one decimal: 4.2 d. */
export const days = (n: number) => `${oneDecimal.format(n)} d`;

export { seeded };
