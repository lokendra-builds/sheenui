"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import {
  barPath,
  changeEase,
  enterEase,
  exitTransition,
  extent,
  formatCompact,
  slotColor,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  type ChartColor,
} from "./chart-utils";

/** Every string the sparkbar shows or announces, for translation. */
export type SparkbarLabels = {
  /** Spoken after the accessible name for "bar": e.g. "low 12, high 34, latest 30". */
  barSummary: (low: string, high: string, latest: string) => string;
  /** Spoken after the accessible name for "winloss": e.g. "8 wins, 3 losses, 1 draw". */
  winLossSummary: (wins: number, losses: number, draws: number) => string;
  /** Shown when there are no values. */
  empty: string;
};

/**
 * The built-in English strings of Sparkbar; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultSparkbarLabels: SparkbarLabels = {
  barSummary: (low, high, latest) => `low ${low}, high ${high}, latest ${latest}`,
  winLossSummary: (wins, losses, draws) =>
    [
      `${wins} ${wins === 1 ? "win" : "wins"}`,
      `${losses} ${losses === 1 ? "loss" : "losses"}`,
      ...(draws ? [`${draws} ${draws === 1 ? "draw" : "draws"}`] : []),
    ].join(", "),
  empty: "No data",
};

/**
 * Props of Sparkbar. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type SparkbarProps = {
  /** Values, oldest first. A missing (non-numeric) entry leaves its slot empty: a gap, never a zero. */
  values: readonly (number | null | undefined)[];
  /**
   * "bar": tiny columns, sized by value (negative values hang below a zero line).
   * "winloss": only the sign counts: up for a win (> 0), down for a loss (< 0), a dash for a draw (0).
   */
  variant?: "bar" | "winloss";
  /**
   * Which bar to emphasise at full strength; the rest step back to a lighter step of the same hue.
   * "last" (the latest value; default for "bar"), "none" (default for "winloss"), or an index into
   * `values` (negative counts from the end: -1 is the last entry). An index outside `values`, or on
   * a gap, emphasises nothing.
   */
  highlight?: "last" | "none" | number;
  /** Colour slot of the bars ("bar"), or of wins ("winloss"). Default 1. */
  color?: ChartColor;
  /** Sets the colour slot of losses ("winloss"). Default 2: a distinct hue, not "danger", since a loss isn't an error. */
  negativeColor?: ChartColor;
  /** Height of the chart in px; the width follows the container. Default 32. */
  height?: number;
  /** Formats the low / high / latest values in the spoken summary. */
  format?: (n: number) => string;
  /** Name the trend, e.g. "Weekly signups". A summary of the values is appended. Without it the sparkbar is decorative. */
  "aria-label"?: string;
  /** Override any built-in string (i18n). */
  labels?: Partial<SparkbarLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP = 2; // surface gap between neighbouring bars
const MAX_BAR = 12;
/** Earlier bars are a lighter step of the same hue, so the highlighted one reads first. */
const RECEDE = 0.38;

/**
 * A tiny bar chart for stat tiles and table cells: magnitude ("bar") or wins and losses ("winloss").
 *
 * Keyboard: not interactive, so it is not a tab stop.
 * Accessibility: with `aria-label` it is an image named by that label plus a summary (or "No data"); without it, it is decorative. Put the real number next to it as text.
 * Glass and motion: bars draw in the first time it appears and tween on data change; reduced motion draws them at once. No backdrop blur. In the "bar" variant the last bar is highlighted and earlier bars are a lighter step of the same hue.
 *
 * @example
 * ```tsx
 * import { Sparkbar } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sparkbar values={[3, 5, 2, 8, 6, 9]} aria-label="Weekly orders" />
 *   );
 * }
 * ```
 *
 * @see /charts/sparkbar
 */
export function Sparkbar({
  values,
  variant = "bar",
  highlight = variant === "bar" ? "last" : "none",
  color = 1,
  negativeColor = 2,
  height = 32,
  format = formatCompact,
  "aria-label": ariaLabel,
  labels,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<SparkbarProps>) {
  const t = { ...defaultSparkbarLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  // Missing entries keep their slot, so every bar stays at its own position in time.
  const slots = values.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  const clean = slots.filter((v): v is number => v !== null);
  const n = clean.length;
  const mounted = useHasMounted(width > 0 && n > 0);
  const dataChanged = useDataChanged(`${variant}:${slots.join(",")}`);

  if (n === 0) {
    return (
      <div
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel ? `${ariaLabel}: ${t.empty}` : undefined}
        className={cn("flex w-full items-center gap-2", className)}
        style={{ height }}
      >
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-sheen-border" />
        <span aria-hidden={ariaLabel ? true : undefined} className="text-2xs text-sheen-fg-muted">
          {t.empty}
        </span>
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-sheen-border" />
      </div>
    );
  }

  const winloss = variant === "winloss";
  // Bars spread across the width, about two thirds bar to one third air, but never get fat:
  // past MAX_BAR the leftover is air. Neighbours always keep a 2px surface gap.
  const slot = width / slots.length;
  const barW = Math.max(1, Math.min(MAX_BAR, slot - GAP, Math.max(slot * 0.66, slot - 6)));
  const [low, high] = extent(clean);
  const lo = winloss ? -1 : Math.min(0, low);
  const allZero = clean.every((v) => v === 0);
  // All zeros: a zero line along the bottom, as if every bar were flat.
  const hi = winloss ? 1 : allZero ? 1 : Math.max(0, high);
  const span = hi - lo || 1;
  const pad = 1;
  const y = (v: number) => pad + ((hi - v) / span) * (height - pad * 2);
  const zero = y(0);
  let lastIndex = slots.length - 1;
  while (lastIndex > 0 && slots[lastIndex] === null) lastIndex--;
  const wanted =
    highlight === "last"
      ? lastIndex
      : highlight === "none" || !Number.isInteger(highlight)
        ? -1
        : highlight < 0
          ? slots.length + highlight
          : highlight;
  const emphasis = wanted >= 0 && wanted < slots.length && slots[wanted] !== null ? wanted : -1;

  const bars = slots.flatMap((v, i) => {
    if (v === null) return [];
    const x = i * slot + (slot - barW) / 2;
    if (winloss) {
      const sign = Math.sign(v);
      // Wins and losses: equal half-height bars (1px clear of the midline); a draw is a short dash.
      const half = height / 2 - pad - 1;
      if (sign === 0) {
        const dash = barPath(x, height / 2 - 1, barW, 2, "none");
        return [{ d: dash, d0: dash, fill: "var(--sheen-fg-subtle)", key: i }];
      }
      const top = sign > 0 ? height / 2 - 1 - half : height / 2 + 1;
      const end = sign > 0 ? "top" : "bottom";
      const base = sign > 0 ? height / 2 - 1 : height / 2 + 1;
      return [
        {
          d: barPath(x, top, barW, half, end),
          d0: barPath(x, base, barW, 0, end),
          fill: slotColor(sign > 0 ? color : negativeColor),
          key: i,
        },
      ];
    }
    const end = v >= 0 ? "top" : "bottom";
    const len = Math.abs(y(v) - zero);
    const top = v >= 0 ? zero - len : zero;
    return [{ d: barPath(x, top, barW, len, end), d0: barPath(x, zero, barW, 0, end), fill: slotColor(color), key: i }];
  });

  const wins = clean.filter((v) => v > 0).length;
  const losses = clean.filter((v) => v < 0).length;
  const summary = winloss
    ? t.winLossSummary(wins, losses, n - wins - losses)
    : t.barSummary(format(low), format(high), format(slots[lastIndex] ?? 0));

  // Bars rise from the baseline left to right on first paint, tween on change, snap on resize.
  const stagger = Math.min(0.03, 0.45 / slots.length);
  const instant = { duration: 0 };
  const grow = (i: number) =>
    reduced
      ? instant
      : !mounted
        ? { duration: duration.slow, ease: enterEase, delay: i * stagger }
        : dataChanged
          ? { duration: duration.slow, ease: changeEase }
          : instant;

  return (
    <div {...rest} ref={rootMerged} className={cn("w-full", className)} style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role={ariaLabel ? "img" : undefined}
          aria-label={ariaLabel ? `${ariaLabel}: ${summary}` : undefined}
          aria-hidden={ariaLabel ? undefined : true}
          className="overflow-visible forced-color-adjust-none"
        >
          {winloss && <line x1={0} x2={width} y1={height / 2} y2={height / 2} stroke="var(--sheen-chart-grid)" />}
          {/* Zero line: where negative bars hang from, and the only mark when every value is 0. */}
          {!winloss && (lo < 0 || allZero) && (
            <line x1={0} x2={width} y1={zero} y2={zero} stroke="var(--sheen-border)" />
          )}
          <AnimatePresence>
            {bars.map((b) => (
              <motion.path
                key={b.key}
                fill={b.fill}
                fillOpacity={emphasis >= 0 && b.key !== emphasis ? RECEDE : 1}
                initial={reduced ? false : { d: b.d0, opacity: 1 }}
                animate={{ d: b.d, opacity: 1 }}
                exit={{ opacity: 0, transition: reduced ? instant : exitTransition }}
                transition={{ d: grow(b.key), opacity: instant }}
              />
            ))}
          </AnimatePresence>
        </svg>
      )}
    </div>
  );
}
