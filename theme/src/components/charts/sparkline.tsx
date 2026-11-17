"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import {
  areaPath,
  changeEase,
  chartGlow,
  compactFormat,
  enterEase,
  exitTransition,
  linePath,
  useChartFrame,
  useDataChanged,
  useElementInView,
  useHasMounted,
  type ChartCurve,
} from "./chart-utils";

/** What a sparkline's generated summary is built from. */
export type SparklineSummary = {
  /** How many numeric values were drawn. */
  count: number;
  min: number;
  max: number;
  /** The newest (last) value. */
  latest: number;
  /** Formats a number for the reader's locale (compact: 12.9K). */
  format: (n: number) => string;
};

/**
 * Every string Sparkline speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type SparklineLabels = {
  /** The spoken summary appended to the accessible name, e.g. "7 points, min 4, max 12, latest 12". */
  summary: (info: SparklineSummary) => string;
};

/**
 * The built-in English strings of Sparkline; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultSparklineLabels: SparklineLabels = {
  summary: ({ count, min, max, latest, format }) =>
    `${count} ${count === 1 ? "point" : "points"}, min ${format(min)}, max ${format(max)}, latest ${format(latest)}`,
};

/**
 * Props of Sparkline. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type SparklineProps = {
  /** Values, oldest first. Non-numeric entries are skipped. */
  values: readonly number[];
  /**
   * "muted" de-emphasises the trend; "accent" draws it in the first chart colour.
   * @default "accent"
   */
  variant?: "muted" | "accent";
  /**
   * Old name of `variant` (it is a visual form, not a semantic colour). Still honoured; `variant` wins.
   * @deprecated Use `variant`.
   * @default undefined
   */
  tone?: "muted" | "accent";
  /** Height of the chart in px; the width follows the container. Default 40. */
  height?: number;
  /** Soft fill under the line (a gradient that fades to transparent). */
  area?: boolean;
  /** "monotone" (default): a smooth curve that never overshoots. "linear": straight segments. */
  curve?: ChartCurve;
  /** Soft glow on the latest point in dark mode. Default true. */
  glow?: boolean;
  /** Shown when there are no values. Default "No data". */
  emptyState?: ReactNode;
  /** Locale for the numbers in the spoken summary (e.g. "de"). Default: the browser's. */
  locale?: string;
  /** Override the spoken summary (i18n or a different wording): `{ summary: ({ count, min, max, latest, format }) => string }`. */
  labels?: Partial<SparklineLabels>;
  /** Names the trend (e.g. "Weekly signups"); a summary of the values (count, min, max, latest) is appended. Without it the sparkline is decorative. */
  "aria-label"?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A tiny trend line for stat tiles. The latest point is marked with a dot once the line reaches it.
 *
 * Keyboard: not interactive, so it is not a tab stop.
 * Accessibility: with `aria-label` it is exposed as an image whose name is that label plus a generated summary of the values ("Weekly signups: 7 points, min 4, max 12, latest 12"; reword it with `labels.summary`); without it, it is decorative (`aria-hidden`). Put the real number next to it as text.
 * Glass and motion: the line draws in once when first seen; reduced motion draws it at once. No backdrop blur.
 *
 * @example
 * ```tsx
 * import { Sparkline } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sparkline values={[4, 6, 5, 8, 7, 10, 12]} aria-label="Weekly signups" />
 *   );
 * }
 * ```
 *
 * @see /charts/sparkline
 */
export function Sparkline({
  values,
  variant: variantProp,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated alias is still honoured for one release
  tone,
  height = 40,
  area = true,
  curve = "monotone",
  glow = true,
  emptyState = "No data",
  locale,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<SparklineProps>) {
  if (tone !== undefined) warnOnce("Sparkline: `tone` is deprecated, use `variant`.");
  const variant = variantProp ?? tone ?? "accent";
  const id = useId();
  const reduced = useSheenReducedMotion();
  // Draw at the real pixel width so the end dot stays round (no stretched viewBox).
  const { ref, element, width } = useChartFrame<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  // The line draws in when the tile scrolls into view, not while nobody can see it.
  const seen = useElementInView(element, { once: true, amount: 0.5 }) || reduced;
  const clean = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  const mounted = useHasMounted(seen && width > 0 && clean.length > 0);
  const dataChanged = useDataChanged(clean.join(","));

  if (clean.length === 0) {
    return (
      <div
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel ? `${ariaLabel}: no data` : undefined}
        className={cn("flex w-full items-center gap-2", className)}
        style={{ height }}
      >
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-sheen-border" />
        <span aria-hidden={ariaLabel ? true : undefined} className="text-2xs text-sheen-fg-muted">
          {emptyState}
        </span>
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-sheen-border" />
      </div>
    );
  }

  const pad = 5;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const summary = ariaLabel
    ? `${ariaLabel}: ${(labels?.summary ?? defaultSparklineLabels.summary)({ count: clean.length, min, max, latest: clean[clean.length - 1] ?? 0, format: compactFormat(locale) })}`
    : undefined;
  const flat = max === min;
  const pts = clean.map(
    (v, i) =>
      [
        clean.length === 1 ? width / 2 : (i / (clean.length - 1)) * (width - pad * 2) + pad,
        // A flat series sits in the middle rather than on the floor.
        flat ? height / 2 : height - pad - ((v - min) / (max - min)) * (height - pad * 2),
      ] as const,
  );
  const last = pts[pts.length - 1] ?? ([0, 0] as const);
  const line = linePath(pts, curve);
  const fill = areaPath(pts, height, curve);
  const color = variant === "accent" ? "var(--sheen-chart-1)" : "var(--sheen-fg-subtle)";

  // Same length: the line morphs to the new values. New length: it re-draws.
  const version = String(clean.length);
  const draw = reduced ? 0 : mounted ? duration.slower : duration.slower * 1.4;
  const move = reduced || !dataChanged ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const dotDelay = reduced || clean.length === 1 ? 0 : draw * 0.8;

  return (
    <div {...rest} ref={rootMerged} className={cn("w-full", className)} style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role={ariaLabel ? "img" : undefined}
          aria-label={summary}
          aria-hidden={ariaLabel ? undefined : true}
          className="overflow-visible forced-color-adjust-none"
        >
          {area && (
            <defs>
              <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.26} />
                <stop offset="60%" stopColor={color} stopOpacity={0.07} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          <AnimatePresence>
            {area && (
              <motion.path
                key={`a-${version}`}
                fill={`url(#${id}-g)`}
                initial={{ opacity: 0, d: fill }}
                animate={{ opacity: seen ? 1 : 0, d: fill }}
                exit={{ opacity: 0, transition: exitTransition }}
                transition={{
                  d: move,
                  opacity: { duration: reduced ? duration.fast : duration.slow, delay: reduced ? 0 : draw * 0.3 },
                }}
              />
            )}
            <motion.path
              key={`l-${version}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduced ? 1 : 0, d: line }}
              animate={{ pathLength: seen ? 1 : 0, d: line }}
              exit={{ opacity: 0, transition: exitTransition }}
              transition={{ pathLength: { duration: draw, ease: enterEase }, d: move }}
            />
            <motion.circle
              key={`e-${version}`}
              r={3.5}
              fill={color}
              stroke="var(--sheen-chart-surface)"
              strokeWidth={2}
              style={{ filter: glow && !reduced && variant === "accent" ? chartGlow(color, 5) : undefined }}
              initial={{ opacity: 0, cx: last[0], cy: last[1] }}
              animate={{ opacity: seen ? 1 : 0, cx: last[0], cy: last[1] }}
              exit={{ opacity: 0, transition: exitTransition }}
              transition={{ cx: move, cy: move, opacity: { duration: duration.base, delay: dotDelay } }}
            />
          </AnimatePresence>
        </svg>
      )}
    </div>
  );
}
