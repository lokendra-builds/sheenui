"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { GlassCard } from "../components/glass-card/glass-card";
import { Sparkline } from "../components/charts/sparkline";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/tabs/tabs";
import { ArrowDownIcon, ArrowUpIcon } from "./icons";
import { HEADING_TAGS, headingBelow, type HeadingTag, type HeadingLevelOption } from "../lib/heading";

/** One KPI card of `DashboardStats`. */
export type Stat = {
  /** The metric's name, shown as the card heading ("Revenue"). */
  label: string;
  /** The current figure. It counts up on first show (reduced motion: shown at once). */
  value: number;
  /** Percentage change vs the previous period, e.g. 12.5 or -3. */
  change: number;
  /** Values for the sparkline, oldest first. */
  trend: number[];
  /** How `value` is printed: `"number"` (default), `"currency"` (uses the block's `currency`) or `"percent"` (4.8 prints as 4.8%). */
  format?: "number" | "currency" | "percent";
  /** Which direction is good news. "down" suits metrics like churn or response time. Default "up". */
  goodWhen?: "up" | "down";
};

/** Every visible or screen-reader string of `DashboardStats`; pass a partial to translate. */
export type DashboardStatsLabels = {
  /** Accessible name for the period switcher. */
  period: string;
  /** Spoken long form of a period key, e.g. "7d" → "Last 7 days". The tab's name becomes "7d, Last 7 days" (the visible key stays part of it). */
  periodName: (key: string) => string;
  /** Screen-reader text for the change badge, e.g. "Up 12.4% vs previous period". */
  change: (direction: "up" | "down", amount: string) => string;
  /** Accessible name of a sparkline, e.g. "Revenue trend". */
  trend: (label: string) => string;
};

/** Props of `DashboardStats`. */
export type DashboardStatsProps = {
  /** Stats per period (`Record<string, Stat[]>`). Keys become the period tabs. Default: built-in demo numbers for `7d`, `30d` and `90d`. The default is sample content for demos and prototypes: pass your own in production. */
  data?: Record<string, Stat[]>;
  /** The section heading (`string`, default `"Overview"`); it also names the section for screen readers. */
  title?: string;
  /** Level of the section heading (`1` to `5`, default `2`); the stat labels sit one level below. `"none"` renders paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** ISO 4217 currency for "currency" stats (`string`, default `"USD"`). */
  currency?: string;
  /** BCP 47 locale used to format every number (`string`, default `"en-US"`). */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<DashboardStatsLabels>`). */
  labels?: Partial<DashboardStatsLabels>;
  /** Adds extra classes to the outer `<section>` (`string`). */
  className?: string;
};

/** The tab shows "7d"; its name starts with that text and adds the long form ("7d, Last 7 days") so voice control and screen readers agree (WCAG 2.5.3). */
function periodTabName(key: string, spoken: string) {
  return spoken.toLowerCase().includes(key.toLowerCase()) ? spoken : `${key}, ${spoken}`;
}

/** The English {@link DashboardStatsLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultDashboardStatsLabels: DashboardStatsLabels = {
  period: "Period",
  periodName: (key) => {
    const match = /^(\d+)\s*([dwmy])$/i.exec(key);
    if (!match) return key;
    const n = Number(match[1]);
    const unit = { d: "day", w: "week", m: "month", y: "year" }[
      (match[2] ?? "d").toLowerCase() as "d" | "w" | "m" | "y"
    ];
    return `Last ${n} ${unit}${n === 1 ? "" : "s"}`;
  },
  change: (direction, amount) => `${direction === "up" ? "Up" : "Down"} ${amount} vs previous period`,
  trend: (label) => `${label} trend`,
};

const demoData: Record<string, Stat[]> = {
  "7d": [
    { label: "Revenue", value: 48250, change: 12.4, trend: [30, 34, 31, 38, 42, 40, 48], format: "currency" },
    { label: "Active users", value: 3842, change: 6.1, trend: [28, 30, 29, 33, 35, 36, 38] },
    { label: "Conversion", value: 4.8, change: -0.6, trend: [52, 50, 51, 49, 47, 49, 48], format: "percent" },
    { label: "New signups", value: 612, change: 18.9, trend: [20, 26, 24, 31, 35, 40, 46] },
  ],
  "30d": [
    {
      label: "Revenue",
      value: 192400,
      change: 9.2,
      trend: [120, 132, 128, 140, 151, 160, 172, 192],
      format: "currency",
    },
    { label: "Active users", value: 11230, change: 4.3, trend: [90, 94, 96, 99, 101, 105, 108, 112] },
    { label: "Conversion", value: 5.1, change: 0.4, trend: [47, 48, 50, 49, 51, 50, 52, 51], format: "percent" },
    { label: "New signups", value: 2380, change: 11.7, trend: [150, 160, 170, 182, 190, 205, 220, 238] },
  ],
  "90d": [
    {
      label: "Revenue",
      value: 548900,
      change: 21.8,
      trend: [300, 340, 360, 410, 430, 470, 500, 549],
      format: "currency",
    },
    { label: "Active users", value: 28710, change: 15.2, trend: [180, 200, 215, 230, 245, 260, 275, 287] },
    { label: "Conversion", value: 4.9, change: 1.1, trend: [44, 45, 47, 46, 48, 49, 50, 49], format: "percent" },
    { label: "New signups", value: 6905, change: 25.4, trend: [400, 450, 480, 530, 580, 610, 650, 690] },
  ],
};

type Formatters = {
  currency: Intl.NumberFormat;
  number: Intl.NumberFormat;
  percent: Intl.NumberFormat;
  change: Intl.NumberFormat;
};

function useFormatters(locale: string, currency: string): Formatters {
  return useMemo(
    () => ({
      currency: new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
      number: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      // Stat values are given as percentages (4.8 = 4.8%), Intl expects fractions.
      percent: new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      change: new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    }),
    [locale, currency],
  );
}

function formatValue(n: number, format: Stat["format"] = "number", f: Formatters) {
  if (format === "currency") return f.currency.format(n);
  if (format === "percent") return f.percent.format(n / 100);
  return f.number.format(Math.round(n));
}

/**
 * A row of KPI cards (value, change badge, sparkline) with a period switcher. Use it at the top
 * of an overview page; the cards follow the block's own width (1, 2 or 4 columns), not the viewport.
 *
 * Props (see `DashboardStatsProps`): `data` (`Record<string, Stat[]>`, demo numbers), `title`
 * (`string`, `"Overview"`), `headingLevel` (`2`), `currency` (`string`, `"USD"`), `locale` (`string`, `"en-US"`),
 * `labels` (`Partial<DashboardStatsLabels>`) and `className` (`string`).
 *
 * Keyboard: Tab reaches the period tabs; Left and Right move between periods and Home and End
 * jump to the first and last. Each tab shows "7d" and is named "7d, Last 7 days" (the visible text first, WCAG 2.5.3).
 * Accessibility: a labelled `<section>`; the change badge reads "Up 12.4% vs previous period"
 * and the animated count is hidden from screen readers, which get the final figure at once.
 * The sparkline has a text name.
 * Glass and motion: each card is a level-2 glass card (one backdrop blur per card). The figures
 * count up with a Motion value; reduced motion shows them at once.
 *
 * @example
 * ```tsx
 * import { DashboardStats } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DashboardStats
 *       title="Overview"
 *       currency="USD"
 *       data={{
 *         "7d": [{ label: "Revenue", value: 48250, change: 12.4, trend: [30, 34, 31, 38, 42, 40, 48], format: "currency" }],
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/dashboard-stats
 */
export function DashboardStats({
  data = demoData,
  title = "Overview",
  headingLevel = 2,
  currency = "USD",
  locale = "en-US",
  labels,
  className,
}: DashboardStatsProps) {
  const L = { ...defaultDashboardStatsLabels, ...labels };
  const headingId = useId();
  const Title = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const periods = Object.keys(data);
  const [period, setPeriod] = useState(periods[0] ?? "");
  const stats = data[period] ?? [];
  const formatters = useFormatters(locale, currency);

  return (
    // A size container: the KPI grid follows the space the block gets, not the viewport.
    <section
      role="group"
      aria-labelledby={headingId}
      data-slot="dashboard-stats"
      className={cn("@container w-full", className)}
    >
      <Tabs value={period} onValueChange={(v) => setPeriod(String(v))} className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Title id={headingId} className="text-xl font-semibold tracking-tight">
            {title}
          </Title>
          <TabsList aria-label={L.period}>
            {periods.map((p) => (
              <TabsTab key={p} value={p} aria-label={periodTabName(p, L.periodName(p))}>
                {p}
              </TabsTab>
            ))}
          </TabsList>
        </div>

        {/* One panel that always shows the active period, so each tab controls real content.
            Always 1, 2×2 or 4 across (never a 3 + 1 orphan row): 1 column, 2 from a 24rem
            container, 4 from 56rem (each card is then >= 13.25rem). */}
        <TabsPanel value={period} className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @4xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              stat={stat}
              period={period}
              formatters={formatters}
              labels={L}
              Label={HEADING_TAGS[headingBelow(headingLevel, 1)]}
            />
          ))}
        </TabsPanel>
      </Tabs>
    </section>
  );
}

function StatCard({
  Label,
  stat,
  period,
  formatters,
  labels,
}: {
  Label: HeadingTag;
  stat: Stat;
  period: string;
  formatters: Formatters;
  labels: DashboardStatsLabels;
}) {
  const up = stat.change >= 0;
  const good = (stat.goodWhen ?? "up") === "up" ? up : !up;
  const amount = formatters.change.format(Math.abs(stat.change) / 100);
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;

  return (
    <GlassCard level={2} className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <Label className="text-sm font-normal text-sheen-fg-muted">{stat.label}</Label>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-sheen-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            // The tint sits on the solid surface colour, so the text keeps >= 4.5:1 whatever drifts behind the glass.
            good
              ? "bg-[linear-gradient(var(--sheen-success-soft),var(--sheen-success-soft)),linear-gradient(var(--sheen-surface-solid),var(--sheen-surface-solid))] text-sheen-success-text"
              : "bg-[linear-gradient(var(--sheen-danger-soft),var(--sheen-danger-soft)),linear-gradient(var(--sheen-surface-solid),var(--sheen-surface-solid))] text-sheen-danger-text",
          )}
        >
          <Arrow className="size-3" />
          <span aria-hidden>{amount}</span>
          <span className="sr-only">{labels.change(up ? "up" : "down", amount)}</span>
        </span>
      </div>
      <CountUp value={stat.value} format={stat.format} formatters={formatters} />
      <Sparkline key={period} values={stat.trend} aria-label={labels.trend(stat.label)} />
    </GlassCard>
  );
}

function CountUp({ value, format, formatters }: { value: number; format: Stat["format"]; formatters: Formatters }) {
  const reduced = useSheenReducedMotion();
  // The server render and hydration show the final value (crawlers and readers without JavaScript get the real
  // number); before the first paint the count restarts from zero (reduced motion keeps the value).
  const mv = useMotionValue(value);
  const text = useTransform(mv, (n) => formatValue(n, format, formatters));
  const first = useRef(true);
  // The animated figure is CSS-generated content (`data-text`), so the DOM text holds the value once, in the visually
  // hidden copy below: a crawler, a Markdown twin or "select all" never reads "3,8423,842". The attribute starts as the final
  // value (the server HTML) and is then driven by the motion value; it is not a React prop that changes, so a re-render
  // never flashes the final value in the middle of a count.
  const figure = useRef<HTMLSpanElement>(null);
  const [initial] = useState(() => formatValue(value, format, formatters));
  useMotionValueEvent(text, "change", (latest) => figure.current?.setAttribute("data-text", latest));

  useLayoutEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    if (first.current) {
      first.current = false;
      mv.set(0);
    }
    const controls = animate(mv, value, { duration: duration.slower * 1.5, ease: ease.out });
    return () => controls.stop();
  }, [value, reduced, mv]);

  return (
    // Proportional figures read better at display size. The animated text is hidden from
    // screen readers, which get the final value straight away instead of intermediate counts.
    <p className="text-3xl font-semibold tracking-tight proportional-nums">
      <span ref={figure} aria-hidden data-text={initial} className="before:content-[attr(data-text)]" />
      <span className="sr-only">{formatValue(value, format, formatters)}</span>
    </p>
  );
}
