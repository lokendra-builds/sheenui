"use client";

import {
  memo,
  startTransition,
  useContext,
  useId,
  useOptimistic,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

import { Sparkline } from "../../components/charts/sparkline";
import { useInViewSettled } from "../../components/charts/chart-utils";

import { ArrowDownIcon, ArrowUpIcon } from "../icons";
import { changeRatio, formatChange, resolveFormat } from "./data";
import { type AnalyticsLabels, defaultAnalyticsLabels } from "./labels";
import { useLoopPlayback } from "../../motion/gate";
import { GlassBudgetContext, flatCard } from "./glass";
import { isRtlAt } from "../../hooks/use-direction";

/** Props of `RollingNumber`. */
export type RollingNumberProps = {
  /** The number to show (`number`, required); a non-finite value prints an en dash. */
  value: number;
  /** A formatter, or Intl.NumberFormat options (currency, percent, compact…) for `locale`. */
  format?: ((n: number) => string) | Intl.NumberFormatOptions;
  /** BCP 47 locale for `format` when it is an options object (`string`, default the runtime's). */
  locale?: string;
  /** Hold the digits at 0 until true (e.g. until a card is in view). Default true. */
  play?: boolean;
  /** Roll in from zeros the first time the number is seen. Default true. Later changes roll from the previous value. */
  rollIn?: boolean;
  /** Seconds a roll takes. Default 0.6. */
  duration?: number;
  /** Adds extra classes to the outer `<span>` (`string`). */
  className?: string;
};

/**
 * Odometer number for dashboards that update all the time: each digit is ONE element (a 0–9
 * column) moved by a CSS transform transition, so a roll costs no JavaScript per frame and runs
 * on the compositor. Digits keep their place (units, tens…) as the number grows; higher places
 * settle a beat later, so a change reads as a wave. Screen readers get the formatted value once
 * (the wheels are aria-hidden). Reduced motion: the digits just change.
 *
 * Props (see `RollingNumberProps`): `value` (required), `format` (formatter or `Intl.NumberFormat`
 * options), `locale`, `play` (`true`), `rollIn` (`true`), `duration` (`0.6` seconds), `className`.
 * Keyboard: none (not interactive). Accessibility: the formatted value is read once as text; the
 * wheels are `aria-hidden`.
 * Motion: a CSS transform transition on the compositor; digits roll only while `play` is true and
 * the number has been on screen. Reduced motion: the digits just change.
 *
 * @example
 * ```tsx
 * import { RollingNumber } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RollingNumber value={48250} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} className="text-3xl font-semibold" />
 *   );
 * }
 * ```
 *
 * @see /dashboards/saas
 */
export function RollingNumber({
  value,
  format,
  locale,
  play = true,
  rollIn = true,
  duration = 0.6,
  className,
}: RollingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInViewSettled(ref, { amount: 0.5 });
  const text = Number.isFinite(value) ? resolveFormat(format, locale)(value) : "–";
  const chars = Array.from(text);
  const total = chars.reduce((n, c) => n + (c >= "0" && c <= "9" ? 1 : 0), 0);
  const hold = !play || (rollIn && !seen);
  let place = total;
  return (
    <span
      ref={ref}
      data-slot="rolling-number"
      className={cn("relative inline-flex whitespace-nowrap tabular-nums", className)}
    >
      {/* Visual only. Always laid out left to right (like a price), whatever the page direction. */}
      <span aria-hidden dir="ltr" className="inline-flex">
        {chars.map((c, i) => {
          if (c >= "0" && c <= "9") {
            place -= 1;
            const digit = hold ? 0 : Number(c);
            return (
              // Keyed by place from the right, so the units wheel stays the units wheel as the number grows.
              <span key={`d${place}`} className="inline-block h-[1lh] overflow-hidden align-top">
                <span
                  data-glyphs={"0\n1\n2\n3\n4\n5\n6\n7\n8\n9"}
                  className="block whitespace-pre before:content-[attr(data-glyphs)] motion-ok:transition-transform motion-ok:ease-sheen-out"
                  style={{
                    transform: `translateY(${-digit * 10}%)`,
                    transitionDuration: `${duration}s`,
                    transitionDelay: `${Math.min(place * 0.03, 0.24)}s`,
                  }}
                >
                  {/* Generated content, not text: the wheel adds no text node, so a crawler reading the page gets the value (the sr-only span below), not "0 1 2 3 4 5 6 7 8 9" per digit. */}
                </span>
              </span>
            );
          }
          return (
            <span key={`t${chars.length - 1 - i}`} className="inline-block whitespace-pre">
              {c}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ====================================================================================
 * Deltas + KPI strip
 * ==================================================================================== */

/** Props of `DeltaBadge`. */
export type DeltaBadgeProps = {
  /** Change ratio (0.124 = +12.4%). null: nothing to compare; the badge renders nothing unless it has children. */
  ratio?: number | null;
  /** Alias of `ratio`: the change as a fraction (0.124 = +12.4%); `ratio` wins when both are set. */
  change?: number | null;
  /** Which direction is good news. Default "up" ("down" for churn, costs, latency). */
  goodWhen?: "up" | "down";
  /** BCP 47 locale for the percentage (`string`, default the runtime's). */
  locale?: string;
  /** Visible text instead of the percentage (e.g. "+$1,204 (2.1%)"). */
  children?: ReactNode;
  /** Screen-reader sentences. Default: the kit's English ones. */
  labels?: Pick<AnalyticsLabels, "change" | "noChange">;
  /** Screen-reader sentence (direction + amount); overrides `labels`. */
  srLabel?: (direction: "up" | "down" | "flat", amount: string) => string;
  /** Adds extra classes to the pill (`string`). */
  className?: string;
};

/**
 * "▲ 12.4%" on a status tint: the arrow and the sign carry the direction, colour only supports it.
 *
 * Props (see `DeltaBadgeProps`): `ratio` (or its alias `change`; `0.124` is +12.4%, `null` hides the
 * badge), `goodWhen` (`"up"`), `locale`, `children` (custom visible text), `labels`, `srLabel`,
 * `className`. Good news is green and bad news red, whichever way the number moves.
 * Keyboard: none (not interactive). Accessibility: an arrow shape plus text, not colour alone; screen
 * readers get a sentence ("Up 12.4% vs previous period"); contrast is checked on the
 * solid surface colour. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { DeltaBadge } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <DeltaBadge ratio={0.124} />
 *       <DeltaBadge ratio={-0.03} goodWhen="down" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /dashboards/saas
 */
export function DeltaBadge({
  ratio: ratioProp,
  change,
  goodWhen = "up",
  locale,
  children,
  labels = defaultAnalyticsLabels,
  srLabel,
  className,
}: DeltaBadgeProps) {
  const ratio = ratioProp ?? change ?? null;
  if (ratio === null && children === undefined) return null;
  const direction = ratio === null ? "flat" : ratio > 0.0005 ? "up" : ratio < -0.0005 ? "down" : "flat";
  const text = ratio === null ? "–" : direction === "flat" ? formatChange(0, locale) : formatChange(ratio, locale);
  const good = direction === "flat" ? null : (direction === "up") === (goodWhen === "up");
  const sr = srLabel
    ? srLabel(direction, text)
    : direction === "flat"
      ? labels.noChange
      : labels.change(direction, text);
  return (
    <span
      data-slot="delta-badge"
      data-direction={direction}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-sheen-full px-2 text-xs font-semibold tabular-nums",
        good === null
          ? "bg-sheen-hover text-sheen-fg-muted"
          : good
            ? "bg-sheen-success-soft text-sheen-success-text"
            : "bg-sheen-danger-soft text-sheen-danger-text",
        "forced-colors:border forced-colors:border-[CanvasText]",
        className,
      )}
    >
      {direction === "up" ? (
        <ArrowUpIcon className="size-3" strokeWidth={2.4} />
      ) : direction === "down" ? (
        <ArrowDownIcon className="size-3" strokeWidth={2.4} />
      ) : null}
      {/* Isolated left to right, so a sign or currency never jumps to the other end in RTL pages. */}
      <span aria-hidden dir="ltr" className="[unicode-bidi:isolate]">
        {children ?? text}
      </span>
      <span className="sr-only">{sr}</span>
    </span>
  );
}

/** One cell of `KpiStrip`. */
export type KpiItem = {
  /** Stable key; also the tab value when the strip is used as tabs (`string`, required). */
  id: string;
  /** The metric's name (`string`, required). */
  label: string;
  /** A short note under the label, e.g. "DAU ÷ MAU". */
  hint?: string;
  /** The current figure (`number`, required). */
  value: number;
  /** The same metric over the previous period (delta + "vs" line). */
  previous?: number | null;
  /** Sparkline values, oldest first. */
  trend?: number[];
  /** A formatter, or Intl.NumberFormat options for `locale`. Default: the locale's plain number. */
  format?: ((n: number) => string) | Intl.NumberFormatOptions;
  /** Which direction is good news ("down" for churn, bounce rate, refunds). Default "up". */
  goodWhen?: "up" | "down";
};

/** Alias of KpiItem. */
export type Kpi = KpiItem;

/** Props of `KpiStrip`. */
export type KpiStripProps = {
  /** Shows skeleton cells while null (no data yet). */
  items: KpiItem[] | null;
  /** Show the previous value under each number. */
  compare?: boolean;
  /** Turns the strip into tabs that pick what `controls` (a chart panel) shows. */
  selected?: string;
  /** Called with the chosen KPI's id when the strip works as tabs (together with `selected`). */
  onSelect?: (id: string) => void;
  /** Sets the id of the element the tabs control. */
  controls?: string;
  /** BCP 47 locale for the figures (`string`, default the runtime's). */
  locale?: string;
  /** No data yet: skeleton cells (same as `items: null`). */
  loading?: boolean;
  /** New data on its way: the figures dim. (Inside an AnalyticsShell its `loading` does this already.) */
  busy?: boolean;
  /** Overrides for the strip's built-in English strings. */
  labels?: Pick<AnalyticsLabels, "change" | "noChange" | "vsPrevious" | "kpis">;
  /** Sets the accessible name of the KPI strip. Default `labels.kpis`. */
  "aria-label"?: string;
  /** Adds extra classes to the strip (`string`). */
  className?: string;
  /**
   * Extra classes for every cell, skeleton or loaded. Give them a `min-h-[…]` per container width (`@lg:min-h-[…]`) equal to the
   * loaded row height so the strip keeps its size when the figures arrive.
   */
  cellClassName?: string;
};

/**
 * One glass strip, four cells (2×2 on phones), hairlines between them. As tabs (`onSelect`), the
 * cells are a real tablist: arrow keys move, the chosen metric drives the chart it controls.
 *
 * Props (see `KpiStripProps`): `items` (`KpiItem[] | null`, required; `null` shows skeleton cells),
 * `compare` (`false`), `selected` / `onSelect` / `controls` (tab mode), `locale`, `loading`, `busy`,
 * `labels`, `aria-label` and `className`.
 * Keyboard: in tab mode (`onSelect` given) Tab enters the tab list, Left and Right (also Up and Down)
 * move between metrics, Home and End jump to the first and last, and the chosen metric drives the
 * chart named by `controls`. Without `onSelect` the cells are static text.
 * Accessibility: a `role="tablist"` in tab mode, otherwise a labelled group; every change is spoken as
 * a sentence, not just an arrow and a colour.
 * Glass and motion: one `glass-2` strip (one backdrop blur for all cells); the figures roll with
 * `RollingNumber` and the sparklines draw in once. Reduced motion shows final values.
 *
 * @example
 * ```tsx
 * import { KpiStrip } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <KpiStrip
 *       compare
 *       items={[
 *         { id: "visitors", label: "Visitors", value: 12840, previous: 11200, trend: [4, 6, 5, 8, 9, 12] },
 *         { id: "bounce", label: "Bounce rate", value: 0.41, previous: 0.46, goodWhen: "down", format: { style: "percent" } },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export const KpiStrip = memo(function KpiStrip({
  items: itemsProp,
  compare = false,
  selected,
  onSelect,
  controls,
  locale,
  loading = false,
  busy = false,
  labels = defaultAnalyticsLabels,
  "aria-label": ariaLabel = labels.kpis,
  className,
  cellClassName,
}: KpiStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const flat = useContext(GlassBudgetContext) === "flat";
  // Skeleton pulses only while the strip can be seen (off-screen examples, hidden tabs: parked).
  const visible = useLoopPlayback(ref, { respectReducedMotion: false });
  const reduced = useSheenReducedMotion();
  const barId = useId();
  const tabs = Boolean(onSelect);
  const items = loading ? null : itemsProp;
  const [shownSelected, setShownSelected] = useOptimistic(selected);
  const select = (id: string) =>
    startTransition(() => {
      setShownSelected(id);
      onSelect?.(id);
    });
  const count = items?.length ?? 4;
  const cols = count >= 4 ? "@3xl:grid-cols-4" : count === 3 ? "@3xl:grid-cols-3" : "";

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!items || !onSelect) return;
    const current = items.findIndex((it) => it.id === shownSelected);
    const rtl = isRtlAt(event.currentTarget);
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
    let next = -1;
    if (step !== undefined) next = (current + step + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const item = items[next];
    if (!item) return;
    select(item.id);
    event.currentTarget.querySelectorAll<HTMLElement>("[role='tab']")[next]?.focus();
  };

  return (
    <motion.div
      ref={ref}
      role={tabs ? "tablist" : "group"}
      aria-label={ariaLabel}
      aria-busy={busy || loading || undefined}
      data-busy={busy || undefined}
      data-slot="kpi-strip"
      data-sheen-reveal=""
      data-sheen-light={flat ? "off" : undefined}
      onKeyDown={tabs ? onKeyDown : undefined}
      className={cn("group/dash glass-2 grid grid-cols-2 overflow-hidden rounded-sheen-xl", flatCard, cols, className)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: duration.base } : { y: spring.gentle, opacity: { duration: duration.base } }}
    >
      {(items ?? Array.from({ length: 4 }, () => null)).map((item, i) => {
        const border = cn(
          i % 2 === 1 && "border-s",
          i >= 2 && "border-t @3xl:border-t-0",
          count >= 4 && i === 2 && "@3xl:border-s",
          count === 3 && i === 2 && "@3xl:border-s",
        );
        if (!item) return <KpiSkeleton key={i} pulse={visible} className={cn(border, cellClassName)} />;
        const isSelected = tabs && item.id === shownSelected;
        const ratio = changeRatio(item.value, item.previous);
        const format = resolveFormat(item.format, locale);
        const inner = (
          <>
            {isSelected && (
              <motion.span
                aria-hidden
                layoutId={`${barId}-kpi-bar`}
                transition={reduced ? { duration: 0 } : spring.snappy}
                className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-(image:--sheen-accent-gradient) forced-colors:bg-[Highlight]"
              />
            )}
            <span
              className={cn(
                "block text-sm [overflow-wrap:anywhere]",
                isSelected ? "text-sheen-fg" : "text-sheen-fg-muted",
              )}
            >
              {item.label}
            </span>
            {item.hint && (
              <span className="block text-2xs text-sheen-fg-subtle [overflow-wrap:anywhere]">{item.hint}</span>
            )}
            <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <span
                className={cn(
                  "text-2xl leading-tight font-semibold tracking-tight transition-opacity duration-(--sheen-duration-base) [[data-busy]_&]:opacity-60 @2xl:text-[1.75rem]",
                )}
              >
                <RollingNumber value={item.value} format={format} />
              </span>
              {/* A reserved width, so a live "+11.7%" to "+12%" tick can't resize the pill and re-wrap the row. */}
              <DeltaBadge
                ratio={ratio}
                goodWhen={item.goodWhen}
                locale={locale}
                labels={labels}
                className="min-w-[4.75rem] justify-center"
              />
            </span>
            <span
              className={cn(
                "mt-0.5 block min-h-4 text-xs text-sheen-fg-subtle tabular-nums [overflow-wrap:anywhere] transition-opacity duration-(--sheen-duration-fast)",
                compare && item.previous != null ? "opacity-100" : "opacity-0",
              )}
            >
              {item.previous != null ? labels.vsPrevious(format(item.previous)) : ""}
            </span>
            {item.trend && item.trend.length > 1 && (
              <Sparkline
                values={item.trend}
                height={34}
                variant={isSelected || !tabs ? "accent" : "muted"}
                className="mt-2"
              />
            )}
          </>
        );
        const cellClass = cn(
          "relative flex min-w-0 flex-col p-4 text-start @2xl:p-5",
          border,
          "border-sheen-border",
          cellClassName,
        );
        return tabs ? (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={controls}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(item.id)}
            className={cn(
              cellClass,
              "cursor-pointer transition-colors duration-(--sheen-duration-fast) outline-none",
              "focus-visible:z-10 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
              isSelected ? "bg-sheen-hover" : "hover:bg-sheen-hover",
              "forced-colors:aria-selected:outline-solid forced-colors:aria-selected:outline-2 forced-colors:aria-selected:-outline-offset-4 forced-colors:aria-selected:outline-[Highlight]",
            )}
          >
            {inner}
          </button>
        ) : (
          <div key={item.id} className={cellClass}>
            {inner}
          </div>
        );
      })}
    </motion.div>
  );
});

function KpiSkeleton({ pulse, className }: { pulse: boolean; className?: string }) {
  const play = { animationPlayState: pulse ? undefined : "paused" } as const;
  return (
    <div aria-hidden className={cn("flex flex-col gap-2.5 border-sheen-border p-4 @2xl:p-5", className)}>
      <span className="h-3.5 w-24 rounded-full bg-sheen-hover motion-ok:animate-pulse" style={play} />
      <span className="h-7 w-32 rounded-sheen-sm bg-sheen-hover motion-ok:animate-pulse" style={play} />
      <span className="mt-3 h-8 w-full rounded-sheen-sm bg-sheen-hover motion-ok:animate-pulse" style={play} />
    </div>
  );
}
