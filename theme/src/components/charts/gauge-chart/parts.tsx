"use client";

import { memo, useEffect, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { duration, ease } from "../../../motion/tokens";

import { NumberTicker } from "../../number-ticker/number-ticker";
import { ChartValueTable, type ChartTipSide } from "../chart-tip";
import { isolate } from "../chart-pointer";
import { defaultGaugeChartLabels, type GaugeChartProps, resolveBands, safeNumberFormat, withMinus } from "./model";

/** The tooltip side order. @internal */
export const TIP_ORDER: readonly ChartTipSide[] = ["right", "left", "above", "below"];
/** Bands step back while another band is read: a CSS opacity transition, instant under reduced motion. */
export const BAND_DIM =
  "transition-opacity duration-(--sheen-duration-fast) ease-sheen-out motion-reduced:transition-none data-dim:opacity-40";

/**
 * The big number under the hub. Memoised: reading a band or the target re-renders the gauge, and
 * the rolling digits (which measure their own layout) must not re-render with it.
 */
export const GaugeNumber = memo(function GaugeNumber({
  value,
  min,
  count,
  format,
  locale,
  intlOptions,
  play,
  reduced,
  fontSize,
}: {
  value: number;
  min: number;
  /** Count up through `format` instead of rolling Intl digits (own formats, and scales below zero: Intl prints an ASCII hyphen). */
  count: boolean;
  format: (n: number) => string;
  locale: string | undefined;
  intlOptions: Intl.NumberFormatOptions;
  play: boolean;
  reduced: boolean;
  fontSize: number;
}) {
  return (
    <span className="leading-none font-semibold tracking-tight text-sheen-fg tabular-nums" style={{ fontSize }}>
      {count ? (
        <CountUp value={value} from={min} play={play} reduced={reduced} format={format} />
      ) : (
        <NumberTicker
          value={value}
          from={min}
          locales={locale}
          format={intlOptions}
          live="off"
          delay={0.2}
          duration={1.1}
        />
      )}
    </span>
  );
});

/** A number that counts to its value (used when the gauge is given its own `format`). */
export function CountUp({
  value,
  from,
  play,
  reduced,
  format,
}: {
  value: number;
  from: number;
  play: boolean;
  reduced: boolean;
  format: (n: number) => string;
}) {
  // The server render and the hydrating render show the final value (crawlers, no-JS and reduced motion read the
  // number, not a frame of the count); the count starts from `from` only once the page is live.
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (!play) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    if (mv.get() === value) mv.set(from);
    const controls = animate(mv, value, { duration: duration.slower * 1.8, ease: ease.out, delay: 0.2 });
    return () => controls.stop();
  }, [play, reduced, value, from, mv]);
  return <motion.span>{text}</motion.span>;
}

/* ---------- Table view ---------- */

/**
 * Props of GaugeTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type GaugeTableProps = Pick<
  GaugeChartProps,
  "value" | "min" | "max" | "target" | "bands" | "numberFormat" | "format" | "locale" | "labels"
> & {
  /** Sets the name of the measure (first row). */
  measure?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The gauge in text: the value, the target, the scale and every band with its range.
 *
 * Props: the gauge's `value`, `min`, `max`, `target`, `bands`, `numberFormat`, `format`, `locale` and `labels`, plus `measure` (name of the measured thing), `caption` (hidden, names the table) and `className`. A real table: the value, the target, the scale and every band with its range. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { GaugeTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GaugeTable value={72} target={80} bands={[{ to: 50, label: "Low" }, { to: 100, label: "Healthy" }]} measure="CPU load" caption="CPU load, percent" />
 *   );
 * }
 * ```
 *
 * @see /charts/gauge-chart
 */
export function GaugeTable({
  value,
  min = 0,
  max = 100,
  target,
  bands,
  numberFormat,
  format: formatProp,
  locale,
  labels,
  measure,
  caption,
  className,
}: GaugeTableProps) {
  const t = { ...defaultGaugeChartLabels, ...labels };
  const intl = safeNumberFormat(locale, numberFormat ?? { maximumFractionDigits: 2 });
  // Numbers are isolated so right-to-left pages keep their sign in front ("−12", not "12−").
  const format = (n: number) => isolate(formatProp ? formatProp(n) : withMinus(intl.format(n)));
  const resolved = resolveBands(bands, Math.min(min, max), Math.max(min, max), 1);
  const current = resolved.find((b) => value <= b.to) ?? resolved[resolved.length - 1];
  const rows: ReactNode[][] = [[measure ?? t.value, format(value)]];
  if (target !== undefined) rows.push([t.target, format(target)]);
  rows.push([t.range, t.between(format(min), format(max))]);
  if (bands && bands.length > 0)
    resolved.forEach((b) =>
      rows.push([
        b.label,
        <span key="r">
          {t.between(format(b.from), format(b.to))}
          {b === current && <span className="ms-2 font-medium text-sheen-fg">({t.current})</span>}
        </span>,
      ]),
    );
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      columns={[{ label: t.measure }, { label: t.value }]}
      rows={rows}
    />
  );
}
