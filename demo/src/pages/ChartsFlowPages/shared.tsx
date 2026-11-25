import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { ChartCard as ThemeChartCard, ease, useSheenReducedMotion, type ChartCardProps } from "@sheenui/theme";

export function ChartCard({ className, ...props }: ChartCardProps) {
  return (
    <ThemeChartCard headingLevel="none" className={[noNestedBlur, className].filter(Boolean).join(" ")} {...props} />
  );
}

/**
 * Headline number for a card's corner: counts up once it is seen (after the chart's entrance has
 * started), then rolls to each new value. The number is a MotionValue rendered as text, so React
 * never re-renders while it counts and nothing is measured for layout.
 */
export function Headline({ value, label, currency = false }: { value: number; label: string; currency?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useSheenReducedMotion();
  const fmt = currency ? usdCompact : compact;
  const n = useMotionValue(reduced ? value : 0);
  const text = useTransform(n, (v) => fmt.format(v));
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      n.jump(value);
      return;
    }
    const controls = animate(n, value, { duration: 1.1, ease: [...ease.out], delay: n.get() === 0 ? 0.35 : 0 });
    return () => controls.stop();
  }, [inView, reduced, value, n]);
  return (
    <div className="flex flex-col items-end leading-tight">
      <span ref={ref} className="text-lg font-semibold tracking-tight tabular-nums">
        <motion.span aria-hidden>{text}</motion.span>
        <span className="sr-only">{fmt.format(value)}</span>
      </span>
      <span className="text-2xs text-sheen-fg-muted">{label}</span>
    </div>
  );
}

export const formatUsd = (n: number) => usd.format(n).replace("-", "−");

/**
 * Inside a glass card, the Chart/Table switch needs no blur of its own (the card already blurs
 * the backdrop and the switch sits on the card's surface): dropping it keeps these pages within
 * the glass budget (≤ 8 blurred surfaces in view, tooltip included) at no visual cost.
 */
export const noNestedBlur = "[&_.glass-1]:[backdrop-filter:none] [&_.glass-1]:[-webkit-backdrop-filter:none]";

export const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
