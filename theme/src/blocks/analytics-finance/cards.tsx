"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease } from "../../motion/tokens";
import { SegmentedControl } from "../../components/segmented/segmented";
import { Sparkline } from "../../components/charts/sparkline";
import { DonutChart } from "../../components/charts/donut-chart";
import { Treemap, TreemapTable, type TreemapNode } from "../../components/charts/treemap";
import { CandlestickChart, CandlestickTable, type Candle } from "../../components/charts/candlestick-chart";
import { chartFocusClass } from "../../components/charts/chart-utils";
import { AlertIcon, CheckIcon } from "../icons";
import { AnalyticsPanel, DeltaBadge, RollingNumber, changeRatio, type AnalyticsRange } from "../analytics-kit";
import {
  type FinanceAsset,
  type FinanceTransaction,
  CLASS_ORDER,
  type FinanceLabels,
  CLASS_SLOT,
  NO_CANDLES,
} from "./model";
import { type Money, timeFormats } from "./hooks";
import { type CardBase } from "./balance-card";

/* ---------- Candles ---------- */

/** The candlestick card of the finance dashboard, with its range controls. @internal */
export const CandleCard = memo(function CandleCard({
  set,
  money,
  locale,
  currency,
  labels: L,
}: CardBase & {
  set: readonly [FinanceAsset | null, Candle[], AnalyticsRange] | null;
  money: Money;
  currency: string;
}) {
  const [asset, candles, range] = set ?? [null, NO_CANDLES, "30d" as const];
  const first = candles[0];
  const change = asset && first ? changeRatio(asset.price, first.open) : null;
  const fmt = useMemo(() => timeFormats(range, locale), [range, locale]);
  const symbol = asset?.symbol;
  const name = asset?.name ?? "";
  const price = asset?.price ?? 0;
  // Keyed by symbol: another asset shows its own price at once (no roll from one asset's price to another's).
  const priceTicker = useMemo(
    () => (
      <RollingNumber
        key={symbol}
        value={price}
        locale={locale}
        format={money.options(price)}
        rollIn={false}
        duration={0.5}
      />
    ),
    [symbol, price, locale, money],
  );
  const chart = useMemo(
    () =>
      symbol ? (
        <CandlestickChart
          key={symbol}
          data={candles}
          average={7}
          height={280}
          volumeHeight={56}
          format={money.price}
          formatDate={(d) => fmt.point.format(d)}
          locale={locale}
          aria-label={`${L.candleTitle(symbol, name)} (${currency})`}
        />
      ) : null,
    [symbol, name, candles, money, fmt, locale, currency, L],
  );
  const table = useMemo(
    () =>
      symbol ? (
        <CandlestickTable
          data={candles}
          format={money.price}
          formatDate={(d) => fmt.point.format(d)}
          locale={locale}
          caption={L.candleTitle(symbol, name)}
        />
      ) : null,
    [symbol, name, candles, money, fmt, locale, L],
  );
  return (
    <AnalyticsPanel
      index={1}
      title={asset ? L.candleTitle(asset.symbol, asset.name) : L.priceHistory}
      description={L.candleDescription}
      aside={
        asset ? (
          <span className="flex items-center gap-2 text-sm font-semibold tabular-nums">
            {priceTicker}
            <DeltaBadge change={change} locale={locale} srLabel={L.change} />
          </span>
        ) : (
          // The price and change arrive with the data: keep their room so the header does not wrap later.
          <span aria-hidden className="invisible flex items-center gap-2 text-sm font-semibold tabular-nums">
            $00,000.00 <span>+0.00%</span>
          </span>
        )
      }
      table={table}
      // The chart's own height (candles + volume + its readout row), reserved before it mounts; the readout wraps
      // to more lines in a narrow dashboard, which the container-query class covers.
      minHeight={448}
      bodyClassName="min-h-[512px]! @md:min-h-[448px]!"
      ready={set !== null}
      labels={L}
      span={{ md: 2, lg: 3 }}
    >
      {set && !asset && (
        <p className="flex min-h-72 items-center justify-center text-sm text-sheen-fg-muted">{L.noAssets}</p>
      )}
      {chart}
    </AnalyticsPanel>
  );
});

/* ---------- Allocation ---------- */

/** The asset-allocation donut card, one slice per asset class. @internal */
export const AllocationCard = memo(function AllocationCard({
  assets,
  money,
  locale,
  labels: L,
}: CardBase & { assets: FinanceAsset[] | null; money: Money }) {
  const [view, setView] = useState<"donut" | "treemap">("donut");
  const byClass = useMemo(
    () =>
      CLASS_ORDER.map((c) => ({
        cls: c,
        holdings: (assets ?? [])
          .filter((a) => a.class === c && a.quantity > 0)
          .map((a) => ({ label: a.symbol, value: Math.round(a.quantity * a.price * 100) / 100 })),
      })).filter((g) => g.holdings.length > 0),
    [assets],
  );
  const tree = useMemo<TreemapNode[]>(
    () => byClass.map((g) => ({ label: L.classes[g.cls], color: CLASS_SLOT[g.cls], children: g.holdings })),
    [byClass, L],
  );
  const chart = useMemo(() => {
    if (!assets) return null;
    if (view === "treemap")
      return (
        <Treemap
          data={tree}
          height={300}
          format={(v) => money.compact.format(v)}
          locale={locale}
          emptyState={L.noAssets}
          aria-label={L.allocationTitle}
        />
      );
    const donut = byClass.map((g) => ({
      label: L.classes[g.cls],
      value: g.holdings.reduce((s, h) => s + h.value, 0),
      color: CLASS_SLOT[g.cls],
    }));
    return (
      <DonutChart
        data={donut}
        diameter={196}
        labels={{ center: L.total }}
        format={(v) => money.compact.format(v)}
        emptyState={L.noAssets}
        aria-label={L.allocationTitle}
        className="h-full content-center"
      />
    );
  }, [assets, view, tree, byClass, money, locale, L]);
  const table = useMemo(
    () =>
      assets && (
        <TreemapTable data={tree} format={(v) => money.full.format(v)} locale={locale} caption={L.allocationTitle} />
      ),
    [assets, tree, money, locale, L],
  );
  return (
    <AnalyticsPanel
      index={2}
      title={L.allocationTitle}
      aside={
        <SegmentedControl
          size="sm"
          aria-label={L.allocationView}
          items={[
            { value: "donut", label: L.donut },
            { value: "treemap", label: L.treemap },
          ]}
          value={view}
          onValueChange={(v) => setView(v as "donut" | "treemap")}
        />
      }
      table={table}
      // A legend of four classes wraps to a second line in the narrow column: always reserve it (the donut is centred),
      // so neither the data arriving nor a filter that hides a class moves the cards below.
      minHeight={view === "donut" ? 344 : 300}
      ready={assets !== null}
      labels={L}
      className="@5xl:col-start-4 @5xl:row-start-1"
    >
      {chart}
    </AnalyticsPanel>
  );
});

/* ---------- Watchlist ---------- */

/** The watchlist card: tracked symbols with price and change. @internal */
export const WatchlistCard = memo(function WatchlistCard({
  assets,
  selected,
  onSelect,
  locale,
  currency,
  labels: L,
}: CardBase & {
  assets: FinanceAsset[] | null;
  selected: string | null;
  onSelect: (symbol: string) => void;
  currency: string;
}) {
  // The rows reserved: the default eight until the first data is in, and still eight when that data is shorter (a
  // pre-set filter), so the cards below never move when it arrives. The list may shrink once the count changes later.
  const count = assets?.length ?? null;
  const [firstCount, setFirstCount] = useState<number | null>(null);
  if (count !== null && firstCount === null) setFirstCount(count);
  const rows = count === null || count === firstCount ? Math.max(8, count ?? 0) : count;
  return (
    <AnalyticsPanel
      index={3}
      title={L.watchlistTitle}
      description={L.watchlistDescription}
      // Eight 62 px rows is the list's final height (the default watchlist): reserve it while the symbols load too.
      minHeight={Math.max(360, rows * 62 + 2)}
      ready={assets !== null}
      labels={L}
      className="@5xl:col-start-4 @5xl:row-start-2"
    >
      {assets?.length === 0 ? (
        <p className="py-10 text-center text-sm text-sheen-fg-muted">{L.noAssets}</p>
      ) : (
        <ul className="@container -mx-2 flex flex-col">
          {(assets ?? []).map((a) => (
            <WatchRow
              key={a.symbol}
              asset={a}
              selected={a.symbol === selected}
              onSelect={onSelect}
              locale={locale}
              currency={currency}
              labels={L}
            />
          ))}
        </ul>
      )}
    </AnalyticsPanel>
  );
});

/** One watchlist row: symbol, price, change and a mini trend line. @internal */
export const WatchRow = memo(function WatchRow({
  asset,
  selected,
  onSelect,
  locale,
  currency,
  labels: L,
}: {
  asset: FinanceAsset;
  selected: boolean;
  onSelect: (symbol: string) => void;
  locale?: string;
  currency: string;
  labels: FinanceLabels;
}) {
  const reduced = useSheenReducedMotion();
  const change = changeRatio(asset.price, asset.open24h);
  const whole = Math.abs(asset.price) >= 1;
  const options = useMemo<Intl.NumberFormatOptions>(
    () => (whole ? { style: "currency", currency } : { style: "currency", currency, maximumFractionDigits: 4 }),
    [whole, currency],
  );
  // Selecting a row re-renders it: the rolling price only re-renders when the price changes.
  const ticker = useMemo(
    () => <RollingNumber value={asset.price} locale={locale} format={options} rollIn={false} duration={0.5} />,
    [asset.price, locale, options],
  );
  const priceText = new Intl.NumberFormat(locale, options).format(asset.price);
  const changeText =
    change === null
      ? ""
      : new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2, signDisplay: "exceptZero" }).format(
          change,
        );
  // A brief tint behind the price when it ticks: up or down (the arrow badge says it in words).
  const prev = useRef(asset.price);
  const [flash, setFlash] = useState<{ dir: "up" | "down"; key: number } | null>(null);
  useEffect(() => {
    if (asset.price !== prev.current) {
      const dir = asset.price > prev.current ? "up" : "down";
      prev.current = asset.price;
      if (!reduced) setFlash((f) => ({ dir, key: (f?.key ?? 0) + 1 }));
    }
  }, [asset.price, reduced]);

  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(asset.symbol)}
        className={cn(
          "grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-sheen-lg px-2 py-2 text-start @[17rem]:grid-cols-[2rem_minmax(0,1fr)_3.5rem_auto]",
          "min-h-12 touch-manipulation transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover",
          "focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
          selected &&
            "bg-sheen-hover shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:outline-2 forced-colors:outline-[Highlight] forced-colors:outline-solid",
        )}
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full text-2xs font-bold text-sheen-fg"
          style={{
            background: `color-mix(in oklab, var(--sheen-chart-${CLASS_SLOT[asset.class]}) 22%, var(--sheen-chart-surface))`,
          }}
        >
          {asset.symbol.slice(0, 3)}
        </span>
        {/* The name is made from the content (not an aria-label), so it always contains the visible text (WCAG 2.5.3). */}
        <span className="sr-only">{L.watchRow(asset.name, asset.symbol, priceText, changeText)}</span>
        <span aria-hidden className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{asset.symbol}</span>
          <span className="truncate text-xs text-sheen-fg-muted">{asset.name}</span>
        </span>
        <span aria-hidden className="hidden @[17rem]:block">
          <Sparkline values={asset.spark} height={28} area={false} variant="accent" />
        </span>
        <span aria-hidden className="relative flex flex-col items-end gap-0.5">
          {flash && (
            <motion.span
              key={flash.key}
              className={cn(
                "absolute -inset-x-1.5 -inset-y-0.5 rounded-sheen-sm",
                flash.dir === "up" ? "bg-sheen-success-soft" : "bg-sheen-danger-soft",
              )}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: duration.slower, ease: ease.out }}
            />
          )}
          <span className="relative text-sm font-semibold tabular-nums">{ticker}</span>
          <span className="relative">
            <DeltaBadge change={change} locale={locale} srLabel={L.change} />
          </span>
        </span>
      </button>
    </li>
  );
});

/* ---------- Transactions ---------- */

/** The badge classes of each transaction status. @internal */
export const STATUS_STYLE: Record<FinanceTransaction["status"], string> = {
  completed: "text-sheen-success-text [--tint:var(--sheen-success-soft)]",
  pending: "text-sheen-warning-text [--tint:var(--sheen-warning-soft)]",
  failed: "text-sheen-danger-text [--tint:var(--sheen-danger-soft)]",
};

/** The clock icon of a pending transaction. @internal */
export function ClockIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** The coins icon of the transactions card header. @internal */
export function CoinsIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="9" cy="7" rx="6" ry="2.6" />
      <path d="M3 7v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V7" />
      <path d="M3 12v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-5" />
      <path d="M15 9.6c3.4 0 6 1.2 6 2.6v5c0 1.4-2.6 2.6-6 2.6" />
    </svg>
  );
}

/** Money coming into the portfolio's cash (shown with a plus sign). */
export const inflow = (t: FinanceTransaction) =>
  t.type === "deposit" || t.type === "reward" || t.type === "dividend" || t.type === "sell";

/** The recent-transactions card: a list with a status badge per row. @internal */
export const TransactionsCard = memo(function TransactionsCard({
  set,
  money,
  locale,
  labels: L,
}: CardBase & { set: readonly [FinanceTransaction[], AnalyticsRange] | null; money: Money }) {
  const transactions = set?.[0] ?? null;
  const range = set?.[1] ?? "30d";
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    [locale],
  );
  const qty = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);
  const signed = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: money.full.resolvedOptions().currency,
        signDisplay: "always",
      }),
    [locale, money],
  );
  const captionId = useId();
  const body = useMemo(
    () =>
      transactions?.length === 0 ? (
        <p className="flex min-h-40 items-center justify-center rounded-sheen-lg border border-dashed border-sheen-border text-sm text-sheen-fg-muted">
          {L.noTransactions(L.rangeNames[range])}
        </p>
      ) : (
        <div
          role="group"
          aria-labelledby={captionId}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so the table can be scrolled without a mouse (WCAG 2.1.1, axe scrollable-region-focusable)
          tabIndex={0}
          className={cn(
            "-mx-1 max-h-[26rem] overflow-auto overscroll-contain rounded-sheen-md px-1 [scrollbar-width:thin]",
            chartFocusClass,
          )}
        >
          <table className="w-full min-w-[40rem] text-start [:where(&)_th]:text-start text-sm">
            <caption id={captionId} className="sr-only">
              {L.transactionsTitle}, {L.rangeNames[range]}
            </caption>
            <thead className="sticky top-0 z-10 bg-[color-mix(in_oklab,var(--sheen-chart-surface)_92%,transparent)] text-xs text-sheen-fg-muted">
              <tr className="border-b border-sheen-border">
                <th scope="col" className="py-2.5 pe-4 font-medium">
                  {L.headers.date}
                </th>
                <th scope="col" className="py-2.5 pe-4 font-medium">
                  {L.headers.type}
                </th>
                <th scope="col" className="py-2.5 pe-4 font-medium">
                  {L.headers.asset}
                </th>
                <th scope="col" className="py-2.5 pe-4 text-end font-medium">
                  {L.headers.amount}
                </th>
                <th scope="col" className="py-2.5 pe-4 text-end font-medium">
                  {L.headers.value}
                </th>
                <th scope="col" className="py-2.5 font-medium">
                  {L.headers.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {(transactions ?? []).map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-sheen-border transition-colors duration-(--sheen-duration-fast) last:border-0 hover:bg-sheen-hover"
                >
                  <td className="py-2.5 pe-4 whitespace-nowrap text-sheen-fg-muted tabular-nums">
                    {date.format(new Date(t.date))}
                  </td>
                  <td className="py-2.5 pe-4 whitespace-nowrap">{L.types[t.type]}</td>
                  <td className="py-2.5 pe-4 font-medium whitespace-nowrap">{t.symbol}</td>
                  <td className="py-2.5 pe-4 text-end whitespace-nowrap tabular-nums">{qty.format(t.quantity)}</td>
                  <td className="py-2.5 pe-4 text-end font-medium whitespace-nowrap tabular-nums">
                    {signed.format(inflow(t) ? t.value : -t.value).replace("-", "−")}
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex h-6 items-center gap-1 rounded-sheen-full px-2 text-xs font-medium",
                        "bg-sheen-surface/85 [background-image:linear-gradient(var(--tint),var(--tint))]",
                        STATUS_STYLE[t.status],
                      )}
                    >
                      {t.status === "completed" ? (
                        <CheckIcon className="size-3.5" />
                      ) : t.status === "pending" ? (
                        <ClockIcon className="size-3.5" />
                      ) : (
                        <AlertIcon className="size-3.5" />
                      )}
                      {L.statuses[t.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    [transactions, range, date, qty, signed, captionId, L],
  );
  return (
    <AnalyticsPanel
      index={4}
      title={L.transactionsTitle}
      description={L.transactionsDescription}
      // The table scrolls inside a 26 rem region: reserve its final height (header + rows, capped) up front.
      minHeight={
        transactions?.length === 0
          ? 240
          : Math.max(240, Math.min(416, Math.round(37 + 44.5 * (transactions?.length ?? 9))))
      }
      ready={transactions !== null}
      labels={L}
      span={{ md: 2, lg: 4 }}
    >
      {body}
    </AnalyticsPanel>
  );
});
