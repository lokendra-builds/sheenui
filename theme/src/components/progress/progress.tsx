"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";

import { cn } from "../../lib/cn";

/** Props of `Progress`; each option is documented on its field. */
export type ProgressProps = {
  /** A number from 0 to `max`. Pass null for an indeterminate (loading) bar. */
  value: number | null;
  /** The value that means "done" (`value` is read against it). Default 100, so `value` is a percentage. */
  max?: number;
  /** Text above the bar, also its accessible name. */
  label?: ReactNode;
  /** Show the percentage on the right. Default true. */
  showValue?: boolean;
  /**
   * Sets the BCP 47 locale of the percentage ("18%" or "18 %"). Default: the browser's; pass one on prerendered
   * pages.
   */
  locale?: Intl.LocalesArgument;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Progress bar. The fill is a full-width bar slid in with translateX (transform only,
 * so the rounded leading edge never distorts); the track clips it. Use it for a task with a known
 * length (an upload, a setup wizard); pass `value={null}` while the length is unknown. For a
 * measurement against a range (disk used, password strength) use `Meter`.
 *
 * Keyboard: not focusable (it is a read-out). Accessibility: Base UI renders `role="progressbar"` with
 * `aria-valuenow/min/max`, and none of them for the indeterminate state; `label` names it. The
 * percentage is formatted in `locale`. Forced colors keep the fill visible.
 * Glass and motion: `glass-1` track with an accent fill. A light sweeps across the fill a few times after
 * each change. With reduced motion the fill jumps to each new value and the indeterminate bar becomes a
 * static, half-tone full-width bar instead of sliding.
 *
 * @example
 * ```tsx
 * import { Progress } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Progress value={64} label="Uploading photos" />
 *       <Progress value={null} label="Preparing export" showValue={false} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /components/progress
 */
export function Progress({ value, max = 100, label, showValue = true, locale, className }: ProgressProps) {
  const labelId = useId();
  const pct = value === null ? null : Math.min(100, Math.max(0, (value / (max > 0 ? max : 100)) * 100));

  return (
    <BaseProgress.Root
      data-slot="progress"
      value={value}
      max={max}
      locale={locale}
      // Named from the first render (server and client), not after Base UI registers the label.
      aria-labelledby={label ? labelId : undefined}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      {(Boolean(label) || showValue) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label && (
            <BaseProgress.Label id={labelId} data-slot="progress-label" className="font-medium">
              {label}
            </BaseProgress.Label>
          )}
          {showValue && value !== null && (
            <BaseProgress.Value className="text-sheen-fg-muted tabular-nums">
              {max === 100
                ? undefined
                : () => new Intl.NumberFormat(locale, { style: "percent" }).format((pct ?? 0) / 100)}
            </BaseProgress.Value>
          )}
        </div>
      )}
      <BaseProgress.Track
        data-slot="progress-track"
        className="glass-1 relative h-2.5 overflow-hidden rounded-sheen-full"
      >
        <BaseProgress.Indicator
          data-slot="progress-indicator"
          // Override Base UI's inline width: always full width, positioned with a transform.
          style={pct === null ? undefined : { width: "100%", transform: `translateX(${pct - 100}%)` }}
          className={cn(
            "sheen-fill relative block h-full overflow-hidden rounded-sheen-full [background-image:var(--sheen-accent-fill)]",
            "rtl:scale-x-[-1]",
            "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-slower) motion-ok:ease-sheen-out",
            // Indeterminate: a sliding segment; with reduced motion, a still half-tone bar.
            "data-indeterminate:w-full data-indeterminate:opacity-50",
            "motion-ok:data-indeterminate:w-1/3 motion-ok:data-indeterminate:opacity-100 motion-ok:data-indeterminate:animate-[sheen-indeterminate_var(--sheen-duration-loop-steady)_var(--sheen-ease-in-out)_infinite]",
          )}
        >
          {/* Light sweeping across the visible fill: a few passes after each change, then it rests off-screen. */}
          {pct !== null && pct > 0 && pct < 100 && (
            <span
              key={pct}
              aria-hidden
              style={{ left: `${100 - pct}%`, width: `${pct / 2}%` }}
              className="absolute inset-y-0 bg-gradient-to-r from-transparent via-sheen-accent-fg/40 to-transparent opacity-0 motion-ok:animate-[sheen-shine_var(--sheen-duration-loop-calm)_var(--sheen-ease-in-out)_3_both] motion-ok:opacity-100"
            />
          )}
        </BaseProgress.Indicator>
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
