"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { chartGlow, fadeColor, useElementInView, useHasMounted } from "./chart-utils";

/**
 * Every string RadialProgress speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type RadialProgressLabels = {
  /** Status words added in "severity" coloring (colour is never the only signal). */
  high: string;
  critical: string;
  /** Shown (and announced) instead of a percentage when there is no value yet. */
  noData: string;
  /** Accessible name when there is no plain-text label. */
  fallbackName: string;
};

/**
 * The built-in English strings of RadialProgress; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultRadialProgressLabels: RadialProgressLabels = {
  high: "High",
  critical: "Critical",
  noData: "No data",
  fallbackName: "Progress",
};

/**
 * Props of RadialProgress. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type RadialProgressProps = {
  /** 0–100. Values outside the range are clamped. `null`, `undefined` or NaN (no value yet) show an empty ring with a "–" and "No data", not 0%. */
  value: number | null | undefined;
  /** Visible caption under the percentage; also the accessible name unless `aria-label` is given. */
  label?: ReactNode;
  /** Accessible name when `label` isn't plain text. */
  "aria-label"?: string;
  /** "ring" = full circle, "gauge" = 3/4 arc like a speedometer. */
  variant?: "ring" | "gauge";
  /**
   * "accent" always uses the accent colour. "severity" turns warning at `warnAt`
   * and danger at `dangerAt` (e.g. storage nearly full) and adds a status word, so colour is never the only signal.
   * @default "accent"
   */
  coloring?: "accent" | "severity";
  /**
   * Old name of `coloring` (it picks how the arc is coloured, it is not a semantic tone). Still honoured; `coloring` wins.
   * @deprecated Use `coloring`.
   * @default undefined
   */
  tone?: "accent" | "severity";
  /** Percentage where the "severity" coloring turns to warning. Default 75. */
  warnAt?: number;
  /** Percentage where the "severity" coloring turns to danger. Default 90. */
  dangerAt?: number;
  /** Diameter in px (the width of the ring; a gauge is a little shorter). Default 160. */
  diameter?: number;
  /** The arc brightens along its length (a soft gradient). Default true. */
  gradient?: boolean;
  /** Soft glow on the arc in dark mode. Default true. */
  glow?: boolean;
  /** Sets the locale for the percentage (e.g. "de" → "64 %"). */
  locale?: string;
  /** The ring's built-in strings (accessible names, table text); a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<RadialProgressLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A single ratio against a limit. The unfilled track is a lighter step of the same colour.
 *
 * Keyboard: not interactive, so it is not a tab stop.
 * Accessibility: `role="meter"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow` and a percentage `aria-valuetext` (with the severity word when `coloring="severity"`), named by `aria-label` or the visible `label`.
 * Glass and motion: the arc fills once when first seen and tweens on change; reduced motion jumps.
 *
 * @example
 * ```tsx
 * import { RadialProgress } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadialProgress value={72} label="Storage used" coloring="severity" />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function RadialProgress({
  value,
  label,
  "aria-label": ariaLabel,
  variant = "ring",
  coloring: coloringProp,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated alias is still honoured for one release
  tone,
  warnAt = 75,
  dangerAt = 90,
  diameter: size = 160,
  gradient = true,
  glow = true,
  locale,
  labels,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<RadialProgressProps>) {
  if (tone !== undefined) warnOnce("RadialProgress: `tone` is deprecated, use `coloring`.");
  const coloring = coloringProp ?? tone ?? "accent";
  const t = { ...defaultRadialProgressLabels, ...labels };
  const id = useId();
  const reduced = useSheenReducedMotion();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const rootMerged = useMergedRef(setRoot, outerRef);
  const seen = useElementInView(root, { once: true, amount: 0.4 }) || reduced;
  const mounted = useHasMounted(seen);
  const empty = typeof value !== "number" || !Number.isFinite(value);
  const v = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const thickness = size * 0.085;
  const r = size / 2 - thickness / 2 - 2;
  const c = size / 2;
  const pct = useMemo(
    () => new Intl.NumberFormat(locale ?? "en", { style: "percent", maximumFractionDigits: 0 }),
    [locale],
  );

  const level = coloring === "severity" ? (v >= dangerAt ? "danger" : v >= warnAt ? "warning" : "ok") : "ok";
  const color =
    level === "danger" ? "var(--sheen-danger)" : level === "warning" ? "var(--sheen-warning)" : "var(--sheen-chart-1)";
  const status = level === "danger" ? t.critical : level === "warning" ? t.high : undefined;

  // Gauge: 270° arc opening at the bottom.
  const sweep = variant === "gauge" ? 0.75 : 1;
  const start = variant === "gauge" ? Math.PI * 0.75 : -Math.PI / 2;
  const end = start + Math.PI * 2 * sweep - (variant === "ring" ? 0.0001 : 0);
  const pt = (a: number) => `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`;
  const arc = `M${pt(start)} A${r},${r} 0 ${sweep > 0.5 ? 1 : 0} 1 ${pt(end)}`;
  const h = variant === "gauge" ? size * 0.86 : size;
  const name = ariaLabel ?? (typeof label === "string" ? label : t.fallbackName);

  // The number rolls with the arc (a MotionValue child: no re-render per frame).
  const shown = useMotionValue(reduced ? v : 0);
  const text = useTransform(shown, (n) => (empty ? "–" : pct.format(Math.round(n) / 100)));
  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      shown.jump(v);
      return;
    }
    const controls = animate(
      shown,
      v,
      mounted ? { duration: duration.slow, ease: ease.inOut } : { duration: duration.slower * 1.6, ease: ease.out },
    );
    return () => controls.stop();
  }, [v, seen, reduced, mounted, shown]);

  return (
    <div
      data-slot="radial-progress"
      {...rest}
      ref={rootMerged}
      className={cn("relative inline-flex flex-col items-center", className)}
      style={{ width: size }}
    >
      <svg
        width={size}
        height={h}
        viewBox={`0 0 ${size} ${h}`}
        role={empty ? "img" : "meter"}
        aria-valuemin={empty ? undefined : 0}
        aria-valuemax={empty ? undefined : 100}
        aria-valuenow={empty ? undefined : Math.round(v)}
        aria-valuetext={
          empty ? undefined : status ? `${pct.format(Math.round(v) / 100)}, ${status}` : pct.format(Math.round(v) / 100)
        }
        aria-label={empty ? `${name}: ${t.noData}` : name}
        className="overflow-visible forced-color-adjust-none"
      >
        {gradient && (
          <defs>
            {/* A diagonal sheen: softer at the lower left, full strength toward the upper right. */}
            <linearGradient id={`${id}-arc`} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.62} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>
        )}
        <path d={arc} fill="none" stroke={fadeColor(color, 16)} strokeWidth={thickness} strokeLinecap="round" />
        {/* At 0 a round cap would still paint a dot, so the indicator fades out instead. */}
        <motion.path
          d={arc}
          fill="none"
          stroke={gradient ? `url(#${id}-arc)` : color}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{ filter: glow && !reduced && v > 0 ? chartGlow(color, 7) : undefined }}
          initial={{ pathLength: reduced ? v / 100 : 0, opacity: v > 0 ? 1 : 0 }}
          animate={{ pathLength: seen ? v / 100 : 0, opacity: v > 0 ? 1 : 0 }}
          transition={{
            pathLength: reduced
              ? { duration: 0 }
              : { duration: mounted ? duration.slow : duration.slower * 1.6, ease: mounted ? ease.inOut : ease.out },
            opacity: { duration: duration.fast },
          }}
        />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{ top: variant === "gauge" ? size * 0.32 : size * 0.34 }}
      >
        <motion.span className="font-semibold tracking-tight tabular-nums" style={{ fontSize: size * 0.2 }}>
          {text}
        </motion.span>
        {label && <span className="text-xs text-sheen-fg-muted">{label}</span>}
        {empty && !label && <span className="text-xs text-sheen-fg-muted">{t.noData}</span>}
        {status && (
          <span
            className={cn(
              "mt-0.5 text-xs font-medium",
              level === "danger" ? "text-sheen-danger-text" : "text-sheen-warning-text",
            )}
          >
            {level === "danger" ? "⚠" : "▲"} {status}
          </span>
        )}
      </div>
    </div>
  );
}
