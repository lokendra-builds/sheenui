"use client";

import { type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";

import { type LegendItem } from "../chart-parts";
import { clamp, slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";

/** The tone of a gauge band or value: `success`, `warning`, `danger` or `neutral`. */
export type GaugeTone = "success" | "warning" | "danger" | "neutral";

/**
 * One band of a GaugeChart: where it ends (`to`), what it is called and optionally its tone and colour
 * slot.
 */
export type GaugeBand = {
  /** Upper bound of the band. The first band starts at `min`; the last one stretches to `max`. */
  to: number;
  /** Names the band ("Good", "Needs work"). Shown with the value whenever the needle is in it. */
  label: string;
  /** A status tone. Always shown with an icon and the label, never by colour alone. */
  tone?: GaugeTone;
  /** A palette slot (1–8) instead of a tone. */
  color?: ChartColor;
};

/**
 * Every string GaugeChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type GaugeChartLabels = {
  roleDescription: string;
  /** Appended to the accessible name. */
  instructions: ChartInstructions;
  value: string;
  target: string;
  band: string;
  /** "{delta} vs target", e.g. "+4 vs target". */
  vsTarget: (delta: string) => string;
  onTarget: string;
  /** Spoken scale, e.g. "Scale 0 to 100". */
  scale: (min: string, max: string) => string;
  /** A band's range, e.g. "50–75". */
  between: (low: string, high: string) => string;
  /** Readout of a band that holds the value. */
  current: string;
  /** Values outside the scale. */
  belowScale: string;
  aboveScale: string;
  /** Table headers. */
  measure: string;
  range: string;
  noData: string;
};

/**
 * The built-in English strings of GaugeChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultGaugeChartLabels: GaugeChartLabels = {
  roleDescription: "gauge",
  instructions: "Use the arrow keys to read the value, the target and each band.",
  value: "Value",
  target: "Target",
  band: "Band",
  vsTarget: (delta) => `${delta} vs target`,
  onTarget: "On target",
  scale: (min, max) => `Scale ${min} to ${max}`,
  between: (low, high) => `${low}–${high}`,
  current: "Current band",
  belowScale: "Below the scale",
  aboveScale: "Above the scale",
  measure: "Measure",
  range: "Range",
  noData: "No data",
};

/**
 * Props of GaugeChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type GaugeChartProps = {
  /** The number to show. Required. */
  value: number;
  /** Start of the scale. Default 0. */
  min?: number;
  /** End of the scale. Default 100. */
  max?: number;
  /** A goal, drawn as a tick across the arc. */
  target?: number;
  /** Coloured ranges, lowest first. The arc lights up to the needle in each band's colour. */
  bands?: readonly GaugeBand[];
  /** Sets the sweep of the arc: "semicircle" (180°) or "speedometer" (270°). */
  shape?: "semicircle" | "speedometer";
  /** Caption under the number, e.g. "Apdex" or "CPU". */
  label?: ReactNode;
  /** Palette slot (1–8) of the arc when there are no bands. Default 1. */
  color?: ChartColor;
  /** Print the scale around the arc. Default true. */
  ticks?: boolean;
  /** Intl options for every number (the big one rolls its digits). E.g. { style: "percent" } or { style: "unit", unit: "millisecond" }. */
  numberFormat?: Intl.NumberFormatOptions;
  /** Format numbers yourself instead (the big number then counts up instead of rolling its digits). */
  format?: (n: number) => string;
  /** Locale of the number formats. Default: the browser's. */
  locale?: string;
  /** Is beating the target good (score) or bad (latency, cost)? Picks the tone of the delta. Default true. */
  higherIsBetter?: boolean;
  /** Largest height (px). The gauge fits its card's width up to this. Default 260. */
  height?: number;
  /** Override the chart's strings (i18n). */
  labels?: Partial<GaugeChartLabels>;
  /** Names the gauge for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Radians per degree. @internal */
export const DEG = Math.PI / 180;
/** The fill and text colours of each gauge tone. @internal */
export const TONES: Record<GaugeTone, { fill: string; text: string }> = {
  success: { fill: "var(--sheen-success)", text: "text-sheen-success-text" },
  warning: { fill: "var(--sheen-warning)", text: "text-sheen-warning-text" },
  danger: { fill: "var(--sheen-danger)", text: "text-sheen-danger-text" },
  neutral: { fill: "var(--sheen-fg-subtle)", text: "text-sheen-fg-muted" },
};
/** A soft, never-zero step of a fill: the unlit part of a band. */
export const unlit = (fill: string) =>
  `light-dark(color-mix(in oklab, ${fill} 22%, var(--sheen-chart-surface)), color-mix(in oklab, ${fill} 30%, var(--sheen-chart-surface)))`;
/** The empty track of a gauge without bands: a neutral step off the surface, so the lit arc stands out. */
export const TRACK =
  "light-dark(color-mix(in oklab, var(--sheen-fg) 9%, var(--sheen-chart-surface)), color-mix(in oklab, var(--sheen-fg) 13%, var(--sheen-chart-surface)))";
/** The needle's spring: a real needle overshoots a little and settles. */
export const NEEDLE_SPRING = { type: "spring", stiffness: 70, damping: 11, mass: 1 } as const;

/** Point at radius `r` and angle `a` (radians, 0 = 12 o'clock, clockwise) around (cx, cy). */
export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

/**
 * An annular sector from angle a0 to a1 between radii r0 < r1, with rounded corners (`rs` at the
 * start, `re` at the end). One fixed command structure, so it can be recomputed every frame.
 */
export function annularSector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, rs = 0, re = 0) {
  if (!(a1 > a0) || !(r1 > r0)) return "";
  const thick = r1 - r0;
  const span = a1 - a0;
  const cap = (r: number) => Math.max(0, Math.min(r, thick / 2, (span * r0) / 2));
  const s = cap(rs);
  const e = cap(re);
  const f = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const P = (r: number, a: number) => f(polar(cx, cy, r, a));
  const large = span - (s + e) / r1 > Math.PI ? 1 : 0;
  const largeIn = span - (s + e) / r0 > Math.PI ? 1 : 0;
  return (
    `M${P(r1 - s, a0)} Q${P(r1, a0)} ${P(r1, a0 + s / r1)} ` +
    `A${r1},${r1} 0 ${large} 1 ${P(r1, a1 - e / r1)} Q${P(r1, a1)} ${P(r1 - e, a1)} ` +
    `L${P(r0 + e, a1)} Q${P(r0, a1)} ${P(r0, a1 - e / r0)} ` +
    `A${r0},${r0} 0 ${largeIn} 0 ${P(r0, a0 + s / r0)} Q${P(r0, a0)} ${P(r0 + s, a0)} Z`
  );
}

/** One resolved band: range, label, fill and tone. @internal */
export type Band = { from: number; to: number; label: string; fill: string; tone: GaugeTone | null };

/** A band's tone; missing or unknown (an untyped caller) falls back to neutral instead of throwing. */
export function bandTone(tone: GaugeTone | undefined): GaugeTone {
  return tone !== undefined && Object.hasOwn(TONES, tone) ? tone : "neutral";
}

/** Resolves the band prop into ordered bands covering the scale. @internal */
export function resolveBands(
  bands: readonly GaugeBand[] | undefined,
  min: number,
  max: number,
  color: ChartColor,
): Band[] {
  if (!bands || bands.length === 0) return [{ from: min, to: max, label: "", fill: slotColor(color), tone: null }];
  const sorted = bands.filter((b) => Number.isFinite(b.to)).sort((a, b) => a.to - b.to);
  const out: Band[] = [];
  let from = min;
  sorted.forEach((b, i) => {
    const to = i === sorted.length - 1 ? max : clamp(b.to, min, max);
    if (to <= from) return;
    const tone = b.color === undefined ? bandTone(b.tone) : null;
    out.push({
      from,
      to,
      label: b.label,
      fill: b.color !== undefined ? slotColor(b.color) : TONES[bandTone(b.tone)].fill,
      tone,
    });
    from = to;
  });
  return out.length > 0 ? out : [{ from: min, to: max, label: "", fill: slotColor(color), tone: null }];
}

/** Legend items for a gauge's bands (a tone's colour always travels with its label).
 *
 * @see /charts/gauge-chart
 */
export function gaugeLegend(bands: readonly GaugeBand[]): LegendItem[] {
  return bands.map((b) => ({
    label: b.label,
    color: b.color !== undefined ? slotColor(b.color) : TONES[bandTone(b.tone)].fill,
    kind: "rect",
  }));
}

/** The icon of a band tone, so tone is not told by colour alone. @internal */
export function ToneIcon({ tone }: { tone: GaugeTone | null }) {
  const common = { width: 14, height: 14, viewBox: "0 0 16 16", "aria-hidden": true, className: "shrink-0" } as const;
  if (tone === "success")
    return (
      <svg {...common}>
        <circle cx={8} cy={8} r={6.5} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <path
          d="M5 8.2 7.1 10.3 11 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (tone === "warning")
    return (
      <svg {...common}>
        <path d="M8 2.2 14.3 13.3H1.7Z" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M8 6.5v3.2M8 11.6v.1" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );
  if (tone === "danger")
    return (
      <svg {...common}>
        <path
          d="M5.3 1.8h5.4l3.5 3.5v5.4l-3.5 3.5H5.3l-3.5-3.5V5.3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx={8} cy={8} r={4} fill="currentColor" />
    </svg>
  );
}

/** The lit part of one band: from its start to the needle (recomputed from the needle's angle every frame). */
export function LitBand({
  angle,
  a0,
  a1,
  cx,
  cy,
  r0,
  r1,
  fill,
  glow,
  roundStart,
  roundEnd,
  glowId,
}: {
  angle: MotionValue<number>;
  a0: number;
  a1: number;
  cx: number;
  cy: number;
  r0: number;
  r1: number;
  fill: string;
  /** A plain colour for the dark-mode glow (the fill may be a gradient). */
  glow: string;
  roundStart: boolean;
  roundEnd: boolean;
  glowId?: string;
}) {
  const d = useTransform(angle, (a) => {
    const end = Math.min(a1, a);
    if (end <= a0 + 0.002) return "";
    return annularSector(cx, cy, r0, r1, a0, end, roundStart ? 4 : 0, end >= a1 - 1e-6 ? (roundEnd ? 4 : 0) : 3);
  });
  return (
    <>
      {glowId && (
        <motion.path
          d={d}
          style={{ fill: `light-dark(transparent, color-mix(in oklab, ${glow} 65%, transparent))` }}
          filter={`url(#${glowId})`}
          className="forced-colors:hidden"
        />
      )}
      <motion.path d={d} style={{ fill }} className="forced-colors:fill-[CanvasText]" />
    </>
  );
}

/** A gauge part: the value arc, the target tick or a band. @internal */
export type Part = { kind: "value" } | { kind: "target" } | { kind: "band"; index: number };

/** A part as a string key ("value", "target", "band:2"), so the shared pointer reading can compare parts. */
export const partKey = (p: Part | null) => (p === null ? null : p.kind === "band" ? `band:${p.index}` : p.kind);
/** Parses a part key such as `band:2` back into a part. @internal */
export function parsePart(key: string | null): Part | null {
  if (key === null) return null;
  if (key === "value" || key === "target") return { kind: key };
  const index = Number(key.slice(5));
  return Number.isInteger(index) ? { kind: "band", index } : null;
}

/** An Intl number format that never throws: a malformed locale falls back to the browser's. */
export function safeNumberFormat(locale: string | undefined, options: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    try {
      return new Intl.NumberFormat(undefined, options);
    } catch {
      return new Intl.NumberFormat();
    }
  }
}

/** A number as text with the typographic minus ("−12", the width of "+" and read as "minus"). */
export const withMinus = (text: string) => text.replace(/-/g, "−");
