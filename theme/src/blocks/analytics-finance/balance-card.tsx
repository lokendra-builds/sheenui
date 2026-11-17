"use client";

import { memo, useMemo, useState } from "react";

import { cn } from "../../lib/cn";
import { ChartTable } from "../../components/charts/chart-parts";
import { clamp } from "../../components/charts/chart-utils";
import { AnalyticsPanel, DeltaBadge, RollingNumber, changeRatio, type AnalyticsRange } from "../analytics-kit";
import { type FinanceData, type FinanceLabels, NO_SERIES, NO_NUMBERS } from "./model";
import { type Money, timeFormats } from "./hooks";
import { PortfolioChart } from "./portfolio-chart";

/* ---------- Balance (hero) ---------- */

/** The locale and label props every finance card shares. @internal */
export type CardBase = { locale?: string; labels: FinanceLabels };

/** The balance card: the total balance, its change and the portfolio chart. @internal */
export const BalanceCard = memo(function BalanceCard({
  set,
  compare,
  live,
  money,
  locale,
  currency,
  labels: L,
}: CardBase & {
  set: readonly [FinanceData["series"], number[], AnalyticsRange] | null;
  compare: boolean;
  live: boolean;
  money: Money;
  currency: string;
}) {
  const [series, previous, range] = set ?? [NO_SERIES, NO_NUMBERS, "30d" as const];
  const [active, setActive] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  const fmt = useMemo(() => timeFormats(range, locale), [range, locale]);
  const n = series.length;
  const at = (i: number | null) => (i === null ? undefined : series[clamp(i, 0, n - 1)]);
  const last = series[n - 1];
  const first = series[0];
  const shown = at(active) ?? last;
  const base = anchor !== null ? at(anchor) : first;
  const delta = shown && base ? shown.value - base.value : 0;
  const change = shown && base ? changeRatio(shown.value, base.value) : null;
  // Built once: this card re-renders on every scrub move, and an Intl.NumberFormat costs ~0.5 ms to construct.
  const signed = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, signDisplay: "exceptZero" }),
    [locale, currency],
  );
  const caption =
    anchor !== null && active !== null && base && shown
      ? L.between(fmt.point.format(Math.min(base.time, shown.time)), fmt.point.format(Math.max(base.time, shown.time)))
      : active !== null && shown
        ? fmt.point.format(shown.time)
        : L.pastRange[range];
  const prevLast = previous[previous.length - 1];
  const heroValue = shown?.value ?? 0;
  const scrubbing = active !== null;
  // Before the data arrives the (invisible) row shows wide stand-in figures, so it wraps on a phone as the real one will.
  const shownDelta = n === 0 ? 88_888.88 : delta;
  const shownChange = n === 0 ? 0.1234 : change;
  // A rolling number is many small motion elements: re-render it only when its value changes.
  const heroTicker = useMemo(
    () => (
      <RollingNumber
        value={heroValue}
        locale={locale}
        format={{ style: "currency", currency }}
        duration={scrubbing ? 0.3 : 0.8}
      />
    ),
    [heroValue, locale, currency, scrubbing],
  );

  const table = useMemo(() => {
    if (!set) return null;
    const rows = series.map((p, i) => ({
      time: fmt.point.format(p.time),
      value: Math.round(p.value * 100) / 100,
      previous: Math.round((previous[i] ?? 0) * 100) / 100,
    }));
    return (
      <ChartTable
        data={rows}
        index="time"
        indexLabel={L.headers.date}
        series={
          compare
            ? [
                { key: "value", label: L.portfolio },
                { key: "previous", label: L.previousPeriod },
              ]
            : [{ key: "value", label: L.portfolio }]
        }
        format={(v) => money.full.format(v)}
        caption={L.balance}
      />
    );
  }, [set, series, previous, compare, fmt, money, L]);

  return (
    <AnalyticsPanel
      index={0}
      title={L.balance}
      table={table}
      minHeight={349} // hero number + delta row + 236 px chart: the final height, reserved before the chart mounts
      ready={set !== null}
      labels={L}
      span={{ md: 2, lg: 3 }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-4xl leading-tight font-semibold tracking-tight text-sheen-fg tabular-nums sm:text-5xl">
          {heroTicker}
        </p>
        <div className={cn("flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-sm", n === 0 && "invisible")}>
          <DeltaBadge change={shownChange} locale={locale} srLabel={L.change}>
            {signed.format(shownDelta).replace("-", "\u2212")} (
            {shownChange === null
              ? "–"
              : new Intl.NumberFormat(locale, {
                  style: "percent",
                  maximumFractionDigits: 2,
                  signDisplay: "never",
                }).format(Math.abs(shownChange))}
            )
          </DeltaBadge>
          <span className="text-sheen-fg-muted">{caption}</span>
          {/* Before the data arrives the row is invisible but laid out with a stand-in, so it wraps the same way. */}
          {compare && anchor === null && active === null && (
            <span className="flex items-center gap-1.5 text-sheen-fg-muted">
              · {L.vsPrevious(money.full.format(prevLast ?? 888_888.88))}
              <DeltaBadge
                change={last && prevLast !== undefined ? changeRatio(last.value, prevLast) : 0.1234}
                locale={locale}
                srLabel={L.change}
              />
            </span>
          )}
        </div>
      </div>
      <PortfolioChart
        series={series}
        previous={compare ? previous : null}
        active={active}
        anchor={anchor}
        onActive={setActive}
        onAnchor={setAnchor}
        live={live}
        formatValue={(v) => money.full.format(v)}
        formatAxisValue={(v) => money.compact.format(v)}
        formatAxisTime={(t) => fmt.axis.format(t)}
        formatPointTime={(t) => fmt.point.format(t)}
        labels={L}
      />
    </AnalyticsPanel>
  );
});
