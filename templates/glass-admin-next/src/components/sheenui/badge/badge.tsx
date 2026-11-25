import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * Status tones: the soft tint (--tint) is layered over a near-opaque surface, so the
 * tone's text colour keeps >= 4.5:1 whatever sits behind the badge (glass, photos, blobs).
 * Badges carry words; colour is never the only signal.
 */
const tinted = "bg-sheen-surface/85 [background-image:linear-gradient(var(--tint),var(--tint))]";

const tones = {
  neutral: "glass-1 text-sheen-fg",
  accent: `${tinted} [--tint:var(--sheen-accent-soft)] text-sheen-accent border-sheen-accent-border`,
  success: `${tinted} [--tint:var(--sheen-success-soft)] text-sheen-success-text border-sheen-success-text/25`,
  warning: `${tinted} [--tint:var(--sheen-warning-soft)] text-sheen-warning-text border-sheen-warning-text/25`,
  danger: `${tinted} [--tint:var(--sheen-danger-soft)] text-sheen-danger-text border-sheen-danger-text/25`,
  solid: "sheen-fill border-transparent text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]",
} as const;

/** Props of {@link Badge}. The attributes of a `span` plus the ones below. */
export type BadgeProps = ComponentProps<"span"> & {
  /**
   * Colour role: "neutral" (glass), "accent", "success", "warning", "danger" or "solid" (filled accent).
   * @default "neutral"
   */
  tone?: keyof typeof tones;
  /**
   * Small dot before the text, e.g. for statuses.
   * @default false
   */
  dot?: boolean;
  /**
   * Pulsing dot for live states. Pings a few times, then rests; still with reduced motion.
   * @default false
   */
  pulse?: boolean;
};

/**
 * A small pill for a status, count or label ("Beta", "Paid", "3 new"). Use it for short words;
 * for anything interactive use a Button.
 *
 * Keyboard: Not interactive; it takes no focus.
 * Accessibility: It always carries words, so colour is never the only signal. The tint sits on a near-opaque surface (text stays at 4.5:1 over glass or photos). The dot is `aria-hidden`. The pulse stops after four pings (WCAG 2.2.2).
 * Glass: The neutral tone uses one `glass-1` surface; the coloured tones are flat tints with no blur.
 * Motion: The pulse ping is skipped under reduced motion; the solid dot stays.
 *
 * @example
 * ```tsx
 * import { Badge } from "@sheenui/theme";
 *
 * export const Live = () => <Badge tone="success" pulse>Live</Badge>;
 * ```
 *
 * @see /components/badge
 */
export function Badge({ tone = "neutral", dot = false, pulse = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-sheen-full border px-2.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    >
      {(dot || pulse) && (
        <span aria-hidden className="relative flex size-1.5">
          {pulse && (
            <span
              className="absolute inset-0 rounded-full bg-current opacity-60 motion-ok:animate-ping"
              // Limited to a few pings (WCAG 2.2.2: no endless motion); the solid dot stays.
              style={{ animationIterationCount: 4 }}
            />
          )}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
