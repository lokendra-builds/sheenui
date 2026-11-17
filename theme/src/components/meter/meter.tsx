"use client";

import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

import { cn } from "../../lib/cn";
import { clamp } from "../../lib/math";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";

/** Quality band of a meter reading, from best to worst: `optimum`, `suboptimal` or `critical`. */
export type MeterLevel = "optimum" | "suboptimal" | "critical";

/**
 * Default words for each `MeterLevel` (Good, Warning, Critical). Plain data in a `"use client"`
 * module: safe to read while prerendering, but a React Server Component receives a client reference,
 * so read it from a client component.
 */
export const defaultMeterLevelLabels: Record<MeterLevel, string> = {
  optimum: "Good",
  suboptimal: "Warning",
  critical: "Critical",
};

type Ranges = { min: number; max: number; low?: number; high?: number; optimum?: number };

/**
 * Which region the value falls in, by the HTML <meter> algorithm. Returns null when
 * neither `low` nor `high` is set (no regions: plain accent fill).
 */
export function getMeterLevel(value: number, { min, max, low, high, optimum }: Ranges): MeterLevel | null {
  if (low === undefined && high === undefined) return null;
  const lo = clamp(low ?? min, min, max);
  const hi = clamp(high ?? max, lo, max);
  const opt = clamp(optimum ?? (min + max) / 2, min, max);
  const v = clamp(value, min, max);
  const region = v < lo ? "low" : v > hi ? "high" : "middle";
  // Optimum below `low`: low is best, middle so-so, high worst. Mirrored above `high`.
  if (opt < lo) return region === "low" ? "optimum" : region === "middle" ? "suboptimal" : "critical";
  if (opt > hi) return region === "high" ? "optimum" : region === "middle" ? "suboptimal" : "critical";
  return region === "middle" ? "optimum" : "suboptimal";
}

/*
 * Status fills. The fill IS the information, so its edge needs >= 3:1 against the empty track
 * (WCAG 1.4.11). The light-mode status base colours are bright (green is ~2.6:1 on a light
 * track), so each is pulled towards its own -text shade. In dark mode the two tokens are the
 * same colour, so the mix changes nothing there (already 4.9:1 and up).
 */
const fills: Record<MeterLevel | "none", string> = {
  none: "sheen-fill [background-image:linear-gradient(to_bottom,var(--sheen-glass-lowlight),transparent),var(--sheen-accent-fill)]",
  optimum: "bg-[color-mix(in_oklab,var(--sheen-success)_55%,var(--sheen-success-text))]",
  suboptimal: "bg-[color-mix(in_oklab,var(--sheen-warning)_70%,var(--sheen-warning-text))]",
  critical: "bg-[color-mix(in_oklab,var(--sheen-danger)_80%,var(--sheen-danger-text))]",
};

const levelText: Record<MeterLevel, string> = {
  optimum: "text-sheen-success-text",
  suboptimal: "text-sheen-warning-text",
  critical: "text-sheen-danger-text",
};

const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" } as const;

/**
 * Props of `Meter`: the Base UI `Meter.Root` props plus SheenUI's own options, each documented on its
 * field.
 */
export type MeterProps = Omit<ComponentProps<typeof BaseMeter.Root>, "children" | "className" | "render"> & {
  /** Smallest value of the scale; a `value` below it is clamped. */
  min?: number;
  /** Largest value of the scale; a `value` above it is clamped. */
  max?: number;
  /** Visible label (also the meter's accessible name). Without it, pass aria-label. */
  label?: ReactNode;
  /** Help text under the bar, e.g. "4.2 GB of 16 GB used". Linked with aria-describedby. */
  description?: ReactNode;
  /** Upper bound of the low region. With `high`, enables good / warning / critical colouring. */
  low?: number;
  /** Sets the lower bound of the high region. */
  high?: number;
  /** Sets where the best value lies. Defaults to the middle of the range (HTML <meter> rules). */
  optimum?: number;
  /**
   * The value text on the right: Base UI's formatted value (percentage of the range, or `format` applied to the
   * value). A function receives (formatted, value). false hides it.
   *
   * @default Base UI's formatted value
   */
  valueText?: ReactNode | ((formatted: string, value: number) => ReactNode) | false;
  /** Write the level ("Good", "Warning", "Critical") next to the value. Default false. */
  showLevel?: boolean;
  /** Words for each level (spoken in aria-valuetext, shown with showLevel). */
  levelLabels?: Partial<Record<MeterLevel, string>>;
  /** bar (default): one continuous fill. segmented: a row of cells, like a battery or signal meter. */
  variant?: "bar" | "segmented";
  /** Sets the number of cells for the segmented variant. Default 10. */
  segments?: number;
  /** Thickness of the bar: "sm" (6px), "md" (10px, default) or "lg" (16px). */
  size?: keyof typeof heights;
  /** Small ruler ticks under the bar at `low` and `high`. Defaults to on for the bar variant. */
  showThresholds?: boolean;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Meter: a measurement within a known range (disk usage, battery, password strength, CPU load), built on Base UI's
 * Meter (`role="meter"`, `aria-valuenow/min/max/text`). Use `Progress` for a task that finishes; use Meter for a level that just *is*.
 *
 * - `value` (clamped to [min, max]; NaN falls back to min), `min` (0) and `max` (100); `format` and `locale` format the number,
 *   `getAriaValueText` customises the spoken value.
 * - Colouring follows the HTML `<meter>` element. Give `low` / `high` (and optionally `optimum`) and the fill turns green in the
 *   optimum region, amber in a suboptimal one and red in the worst one; without them it is the accent fill. The level is also spoken
 *   (aria-valuetext) and, with `showLevel`, written next to the value, so colour is never the only signal.
 * - `variant="segmented"` draws a row of `segments` cells (battery, signal); `size`, `showThresholds`, `valueText`, `levelLabels`,
 *   `label` and `description` complete it.
 *
 * Keyboard: not focusable (it is a read-out). Accessibility: `role="meter"` named by `label` (or `aria-label`), described by `description`;
 * the status fills keep a 3:1 edge against the track (WCAG 1.4.11); forced colors keep the fill visible.
 * Glass and motion: a `glass-1` track (one backdrop surface). The fill slides in with a spring (transform only) and the number counts up with it;
 * a level change cross-fades the colour. Reduced motion: everything is simply at the value.
 *
 * @example
 * ```tsx
 * import { Meter } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Meter label="Disk usage" value={72} low={50} high={85} optimum={0} showLevel description="72 GB of 100 GB used" />
 *       <Meter label="Battery" value={64} variant="segmented" segments={5} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /components/meter
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  description,
  valueText,
  showLevel = false,
  levelLabels,
  variant = "bar",
  segments = 10,
  size = "md",
  showThresholds,
  format,
  locale,
  getAriaValueText,
  className,
  ...props
}: MeterProps) {
  const reduced = useSheenReducedMotion();
  const descriptionId = useId();
  const range = max - min || 1;
  // Clamped to [min, max] (NaN → min): the bar, the counted number and aria-valuenow agree.
  const safe = Math.min(Math.max(min, max), Math.max(min, Number.isFinite(value) ? value : min));
  const pct = Math.min(100, Math.max(0, ((safe - min) / range) * 100));
  const barShift = useFill(pct - 100, -100, 0, reduced);
  const barX = useTransform(barShift, (v) => `${v}%`);
  const level = getMeterLevel(safe, { min, max, low, high, optimum });
  const labels = { ...defaultMeterLevelLabels, ...levelLabels };
  const levelLabel = level ? labels[level] : undefined;

  const ariaValueText = (formatted: string, raw: number) => {
    if (getAriaValueText) return getAriaValueText(formatted, raw);
    // Speak what is shown: a custom value text that is plain text replaces the number.
    const shown = typeof valueText === "function" ? valueText(formatted, raw) : valueText;
    const text = typeof shown === "string" || typeof shown === "number" ? String(shown) : formatted;
    return levelLabel ? `${text}, ${levelLabel}` : text;
  };

  // Threshold ticks, as % of the track (only those strictly inside it; low === high is one tick).
  const thresholds =
    (showThresholds ?? variant === "bar")
      ? [...new Set([low, high])]
          .filter((t): t is number => t !== undefined && t > min && t < max)
          .map((t) => ((t - min) / range) * 100)
      : [];

  const showValue = valueText !== false;

  return (
    <BaseMeter.Root
      data-slot="meter"
      value={safe}
      min={min}
      max={max}
      format={format}
      locale={locale}
      getAriaValueText={ariaValueText}
      aria-describedby={description ? descriptionId : undefined}
      data-level={level ?? undefined}
      className={cn(
        "grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2",
        // Leave room for the ticks under the bar.
        thresholds.length > 0 && "pb-2",
        thresholds.length > 0 && description && "pb-0 [&>p]:mt-1.5",
        className,
      )}
      {...props}
    >
      {label && (
        <BaseMeter.Label data-slot="meter-label" className="min-w-0 text-sm font-medium text-sheen-fg">
          {label}
        </BaseMeter.Label>
      )}
      {showValue || (showLevel && levelLabel) ? (
        <span className={cn("flex items-baseline gap-2 text-sm", !label && "col-start-2")}>
          {showLevel && levelLabel && level && (
            // Already part of aria-valuetext: hidden here so it isn't read twice.
            <span aria-hidden className={cn("text-xs font-semibold", levelText[level])}>
              {levelLabel}
            </span>
          )}
          {showValue && (
            <BaseMeter.Value className="text-sheen-fg-muted tabular-nums">
              {(formatted, raw) =>
                typeof valueText === "function" ? (
                  valueText(formatted, raw)
                ) : valueText !== undefined && valueText !== true ? (
                  valueText
                ) : (
                  <CountUp
                    value={safe}
                    min={min}
                    max={max}
                    format={format}
                    locale={locale}
                    fallback={formatted}
                    reduced={reduced}
                  />
                )
              }
            </BaseMeter.Value>
          )}
        </span>
      ) : null}

      <div className="relative col-span-2">
        <BaseMeter.Track
          data-slot="meter-track"
          className={cn(
            "relative w-full",
            variant === "bar" && ["glass-1 overflow-hidden rounded-sheen-full", heights[size]],
            variant === "segmented" && ["flex gap-1", heights[size]],
          )}
        >
          {variant === "bar" ? (
            <BaseMeter.Indicator
              // Base UI sizes the indicator by width; ours is always full width and slid with a
              // transform (the rounded end never squashes, and only transform animates).
              style={{ width: "100%", height: "100%", position: "absolute", insetInlineStart: 0, top: 0 }}
              className="overflow-hidden rounded-[inherit]"
            >
              <motion.div
                style={{ x: barX }}
                className={cn(
                  "h-full w-full rounded-[inherit] motion-ok:transition-colors motion-ok:duration-(--sheen-duration-slow) rtl:-scale-x-100",
                  fills[level ?? "none"],
                  // High contrast drops fills: draw it in the system highlight colour.
                  "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
                )}
              />
            </BaseMeter.Indicator>
          ) : (
            <Segments
              count={Math.max(2, Math.floor(segments))}
              pct={pct}
              fill={fills[level ?? "none"]}
              reduced={reduced}
            />
          )}
        </BaseMeter.Track>
        {/* Region boundaries as ruler ticks just under the bar, clear of the fill. */}
        {thresholds.map((t) => (
          <span
            key={t}
            aria-hidden
            style={{ insetInlineStart: `${t}%` }}
            className="pointer-events-none absolute top-full mt-1 h-1.5 w-0.5 -translate-x-1/2 rounded-full bg-sheen-fg-subtle/60 rtl:translate-x-1/2 forced-colors:bg-[CanvasText]"
          />
        ))}
      </div>

      {description && (
        <p id={descriptionId} className="col-span-2 text-xs text-sheen-fg-subtle">
          {description}
        </p>
      )}
    </BaseMeter.Root>
  );
}

/**
 * A fill value that is the final one in the server HTML and while hydrating (no-JS, crawlers and the first client render
 * show the real reading), grows in from `from` once on the first live render and then follows `target` with a spring.
 */
function useFill(target: number, from: number, delay: number, reduced: boolean): MotionValue<number> {
  const value = useMotionValue(target);
  const entered = useRef(false);
  useEffect(() => {
    if (reduced) {
      value.set(target);
      entered.current = true;
      return;
    }
    if (!entered.current) {
      entered.current = true;
      value.set(from);
    }
    const controls = animate(value, target, { ...spring.gentle, bounce: 0.1, delay });
    return () => controls.stop();
  }, [value, target, from, delay, reduced]);
  return value;
}

/** One cell of a segmented meter: its fill scales from the start edge. */
function SegmentFill({
  amount,
  delay,
  reduced,
  className,
}: {
  amount: number;
  delay: number;
  reduced: boolean;
  className: string;
}) {
  const scaleX = useFill(amount, 0, delay, reduced);
  return <motion.span style={{ scaleX }} className={className} />;
}

/** Battery / signal style: each cell fills in turn (scaleX), with a short stagger on entry. */
function Segments({ count, pct, fill, reduced }: { count: number; pct: number; fill: string; reduced: boolean }) {
  const per = 100 / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const amount = Math.min(1, Math.max(0, (pct - i * per) / per));
        return (
          <span
            key={i}
            className="glass-1 relative h-full min-w-0 flex-1 overflow-hidden rounded-[3px] first:rounded-s-sheen-full last:rounded-e-sheen-full"
          >
            <SegmentFill
              amount={amount}
              delay={i * 0.03}
              reduced={reduced}
              className={cn(
                "absolute inset-0 origin-left motion-ok:transition-colors motion-ok:duration-(--sheen-duration-slow) rtl:origin-right",
                fill,
                "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
              )}
            />
          </span>
        );
      })}
    </>
  );
}

/**
 * The visible number, counting from its last value to the new one alongside the fill.
 * Writes text directly (no re-render per frame). Base UI hides Meter.Value from assistive
 * tech (aria-valuetext carries the value), so the ticking is visual only.
 */
function CountUp({
  value,
  min,
  max,
  format,
  locale,
  fallback,
  reduced,
}: {
  value: number;
  min: number;
  max: number;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  fallback: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // The number on screen right now (null before the first run: count from `min`).
  const shown = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const formatter = format
      ? new Intl.NumberFormat(locale, format)
      : new Intl.NumberFormat(locale, { style: "percent" });
    const render = (v: number) => {
      shown.current = v;
      el.textContent = format ? formatter.format(v) : formatter.format((v - min) / (max - min || 1));
    };
    const start = shown.current ?? min;
    const settle = () => {
      shown.current = value;
      el.textContent = fallback;
    };
    if (reduced || start === value) {
      settle();
      return;
    }
    const controls = animate(start, value, {
      duration: duration.slower,
      ease: ease.out,
      onUpdate: render,
      onComplete: settle,
    });
    return () => controls.stop();
  }, [value, min, max, format, locale, fallback, reduced]);

  return <span ref={ref}>{fallback}</span>;
}
