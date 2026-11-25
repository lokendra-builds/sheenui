"use client";

import { useControllable } from "../hooks/use-controllable";
import { startTransition, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  AnalyticsGrid,
  AnalyticsShell,
  AnalyticsState,
  Cascade,
  exportCsv,
  mergeLabels,
  useDashboardData,
  useLiveTicker,
} from "./analytics-kit";

import {
  type AssetClass,
  type FinanceQuery,
  CLASS_ORDER,
  type FinanceLabels,
  defaultFinanceLabels,
  type FinanceDashboardProps,
  NO_CLASSES,
  NO_CANDLES,
} from "./analytics-finance/model";
import { useSteadyAssets, useMoney } from "./analytics-finance/hooks";
import { BalanceCard } from "./analytics-finance/balance-card";
import { CandleCard, AllocationCard, WatchlistCard, CoinsIcon, TransactionsCard } from "./analytics-finance/cards";

export {
  type AssetClass,
  type FinanceAsset,
  type FinanceTransaction,
  type FinanceData,
  type FinanceQuery,
  type AssetSpec,
  CLASS_ORDER,
  type FinanceLabels,
  defaultFinanceLabels,
  type FinanceDashboardProps,
} from "./analytics-finance/model";

/**
 * A finance / crypto dashboard: portfolio balance with a scrub-and-measure area chart, candles
 * with volume for the selected asset, allocation (donut or treemap), a live watchlist and the
 * transactions of the range.
 *
 * - Hover (or drag on touch) the balance chart: the big number rolls to that moment. Drag across
 *   it (touch: hold, then drag; keyboard: Shift + arrows) to measure the move between two points.
 * - Live: two prices tick every ~1.6 s with rolling digits and a brief up / down flash; the balance,
 *   sparklines and last candle follow. Pauses off-screen and in background tabs.
 * - The time range re-loads every card under a veil; charts tween to the new data.
 *
 * Props (see `FinanceDashboardProps`): `load` (required), `liveStep`, `liveInterval`
 * (`1600` ms), `range` / `defaultRange` (`"30d"`) / `onRangeChange`, `classes` / `defaultClasses` /
 * `onClassesChange`, `asset` / `defaultAsset` (`"BTC"`) / `onAssetChange`, `live` / `defaultLive` /
 * `onLiveChange`, `compare` / `defaultCompare` / `onCompareChange`, `onExport`, `currency` (`"USD"`),
 * `now`, `locale`, `headingLevel` (`"h2"`), `glass` (`"auto"`), `labels`
 * (`Partial<FinanceLabels>`), `className`.
 * Keyboard: Tab walks the header controls (the range control moves with the arrow keys, filter chips
 * toggle with Space or Enter, then Live, Compare and Export), the KPI tabs (arrow keys, Home and End)
 * and each chart, which is one tab stop whose arrow keys read its points. Panels with a table have a
 * Chart / Table switch.
 * Accessibility: a labelled region named by the title; panels are sections with headings one level
 * below `headingLevel`; loading is announced once ("Loading new data…", "Dashboard updated"), never on
 * every live tick; the Live toggle pauses updates (WCAG 2.2.2); the main charts have a table view; state
 * is never colour alone.
 * Glass and motion: a glass header and glass panels under an adaptive glass budget (frosted solid on
 * weak devices or when frames drop); charts mount near the viewport and draw in once; live ticks pause
 * off-screen and in hidden tabs; reduced motion removes draw-in and rolling digits and reduced
 * transparency makes the glass solid.
 * The balance chart adds Shift + arrow keys to measure the move between two points; the watchlist
 * rows are buttons that pick the asset shown in the candlestick card.
 *
 * @example
 * ```tsx
 * import { FinanceDashboard } from "@sheenui/theme";
 * import { financeDemoLoader } from "@sheenui/theme/demo-data";
 *
 * export function Example() {
 *   return (
 *     <FinanceDashboard load={financeDemoLoader} currency="EUR" locale="de-DE" defaultRange="12m" defaultAsset="NWT" defaultLive={false} />
 *   );
 * }
 * ```
 *
 * @see /dashboards/crypto-dashboard
 */
export function FinanceDashboard({
  load,
  status: statusProp = "auto",
  liveStep = null,
  liveInterval = 1600,
  range: rangeProp,
  defaultRange = "30d",
  onRangeChange,
  classes: classesProp,
  defaultClasses = NO_CLASSES,
  onClassesChange,
  asset: assetProp,
  defaultAsset = "BTC",
  onAssetChange,
  live: liveProp,
  defaultLive = true,
  onLiveChange,
  compare: compareProp,
  defaultCompare = false,
  onCompareChange,
  onExport,
  currency = "USD",
  now: nowProp,
  locale,
  headingLevel = 2,
  glass = "auto",
  labels: labelOverrides,
  className,
}: FinanceDashboardProps) {
  const L = useMemo<FinanceLabels>(
    () => ({
      ...mergeLabels(defaultFinanceLabels, labelOverrides),
      classes: { ...defaultFinanceLabels.classes, ...labelOverrides?.classes },
      pastRange: { ...defaultFinanceLabels.pastRange, ...labelOverrides?.pastRange },
      headers: { ...defaultFinanceLabels.headers, ...labelOverrides?.headers },
      types: { ...defaultFinanceLabels.types, ...labelOverrides?.types },
      statuses: { ...defaultFinanceLabels.statuses, ...labelOverrides?.statuses },
    }),
    [labelOverrides],
  );
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [range, setRange] = useControllable(rangeProp, defaultRange, onRangeChange);
  const [classes, setClasses] = useControllable(classesProp, defaultClasses, onClassesChange);
  const [asset, setAsset] = useControllable(assetProp, defaultAsset, onAssetChange);
  const [live, setLive] = useControllable(liveProp, defaultLive, onLiveChange);
  const [compare, setCompare] = useControllable(compareProp, defaultCompare, onCompareChange);

  const [mountNow] = useState(() => new Date());
  const now = nowProp ?? mountNow;
  // Keyed by value, not identity: `classes` is a fresh array and `now` a fresh Date on every parent render.
  const classesKey = classes.join(",");
  const nowMs = now.getTime();
  const query = useMemo<FinanceQuery>(
    () => ({ range, classes: classesKey ? (classesKey.split(",") as AssetClass[]) : [], now: new Date(nowMs) }),
    [range, classesKey, nowMs],
  );
  const {
    data,
    status: dataStatus,
    retry,
    update,
    query: dataQuery,
  } = useDashboardData(load, query, `${range}|${classesKey}|${nowMs}`);
  const status = statusProp === "error" ? "error" : dataStatus;

  const liveRunning = useLiveTicker(
    live && status === "ready" && liveStep !== null,
    (tick) => {
      if (liveStep) update((d) => liveStep(d, tick));
    },
    { ref: rootRef, interval: liveInterval },
  );

  const loading = data === null || statusProp === "loading";
  const busy = status === "loading" && !loading;
  const money = useMoney(locale, currency);
  // Cards label their data with the range it was loaded for (the control may already show the next one).
  const shownRange = dataQuery?.range ?? range;

  // The candlestick follows the selected asset; if a filter hides it, the first visible one.
  const selected = data?.assets.find((a) => a.symbol === asset) ?? data?.assets[0] ?? null;

  // Tuples memoised by their parts, so an unchanged card keeps its props across live ticks.
  const selectedCandles = selected ? data?.candles[selected.symbol] : undefined;
  const hasData = data !== null;
  const series = data?.series;
  const previousSeries = data?.previous;
  const transactionRows = data?.transactions;
  const heroNow = useMemo(
    () => (series && previousSeries ? ([series, previousSeries, shownRange] as const) : null),
    [series, previousSeries, shownRange],
  );
  const candleNow = useMemo(
    () => (hasData ? ([selected, selectedCandles ?? NO_CANDLES, shownRange] as const) : null),
    [hasData, selected, selectedCandles, shownRange],
  );
  const txNow = useMemo(
    () => (transactionRows ? ([transactionRows, shownRange] as const) : null),
    [transactionRows, shownRange],
  );
  const allocation = useSteadyAssets(data?.assets ?? null);

  // Stable handlers and props for the memoised header controls and panels.
  const filters = useMemo(() => CLASS_ORDER.map((c) => ({ value: c, label: L.classes[c] })), [L]);
  const onFilters = useCallback((next: string[]) => setClasses(next as AssetClass[]), [setClasses]);
  // Picking an asset re-renders rows and remounts the candles: a transition keeps the click responsive.
  const onSelect = useCallback((symbol: string) => startTransition(() => setAsset(symbol)), [setAsset]);
  const latest = useRef({ data, query, onExport, range });
  useLayoutEffect(() => {
    latest.current = { data, query, onExport, range };
  });
  const exportData = useCallback(() => {
    const { data: d, query: q, onExport: custom, range: r } = latest.current;
    if (!d) return;
    if (custom) {
      custom(d, q);
      return;
    }
    const rows: (string | number)[][] = [];
    for (const a of d.assets)
      rows.push([
        a.name,
        a.symbol,
        L.classes[a.class],
        a.quantity,
        a.price,
        Math.round(a.quantity * a.price * 100) / 100,
      ]);
    rows.push([]);
    rows.push([L.headers.date, L.headers.type, L.headers.asset, L.headers.amount, L.headers.value, L.headers.status]);
    for (const t of d.transactions)
      rows.push([t.date, L.types[t.type], t.symbol, t.quantity, t.value, L.statuses[t.status]]);
    exportCsv(`${L.exportFile}-${r}.csv`, ["Holding", "Symbol", "Class", "Quantity", "Price", "Value"], rows);
  }, [L]);

  // Panels' empty states: "no match" while filtering, "no holdings yet" for an empty account.
  const filtered = classes.length > 0;
  const C = useMemo<FinanceLabels>(() => (filtered ? L : { ...L, noAssets: L.noHoldings }), [L, filtered]);

  return (
    <AnalyticsShell
      ref={rootRef}
      headingId={titleId}
      headingLevel={headingLevel}
      title={L.title}
      subtitle={L.description}
      icon={<CoinsIcon />}
      range={range}
      onRangeChange={setRange}
      filters={filters}
      activeFilters={classes}
      onFiltersChange={onFilters}
      live={live}
      onLiveChange={setLive}
      compare={compare}
      onCompareChange={setCompare}
      onExport={exportData}
      exportDisabled={!data}
      loading={busy}
      glass={glass}
      labels={L}
      className={className}
    >
      {status === "error" && !busy ? (
        <AnalyticsState kind="error" labels={L} onRetry={retry} />
      ) : statusProp === "empty" ||
        (data && !busy && !filtered && data.assets.length === 0 && data.transactions.length === 0) ? (
        // An account with nothing in it: one message, not five empty panels. (Filters that hide everything keep the panels: "no match".)
        <AnalyticsState kind="empty" labels={L} />
      ) : (
        <AnalyticsGrid>
          {/* Each panel takes new data a beat after the one before (only its own wrapper re-renders). */}
          <Cascade value={heroNow} index={0}>
            {(set) => (
              <BalanceCard
                set={set}
                compare={compare}
                live={liveRunning}
                money={money}
                locale={locale}
                currency={currency}
                labels={C}
              />
            )}
          </Cascade>
          <Cascade value={candleNow} index={1}>
            {(set) => <CandleCard set={set} money={money} locale={locale} currency={currency} labels={C} />}
          </Cascade>
          <Cascade value={allocation} index={2}>
            {(assets) => <AllocationCard assets={assets} money={money} locale={locale} labels={C} />}
          </Cascade>
          <WatchlistCard
            assets={data?.assets ?? null}
            selected={selected?.symbol ?? null}
            onSelect={onSelect}
            locale={locale}
            currency={currency}
            labels={C}
          />
          <Cascade value={txNow} index={3}>
            {(set) => <TransactionsCard set={set} money={money} locale={locale} labels={C} />}
          </Cascade>
        </AnalyticsGrid>
      )}
    </AnalyticsShell>
  );
}
