"use client";

/**
 * EcommerceDashboard: a full-page store analytics template (Shopify / Stripe style).
 *
 *   - Glass header: store, time range, sales-channel filters, Live / Compare / Export.
 *   - KPI strip: revenue, orders, average order value, conversion rate.
 *   - Revenue: bars per period with the previous period (Compare) or a moving average as a line
 *     on the same axis, the checkout funnel, sales by category (treemap), sales by hour × weekday
 *     (heatmap) and the top products (bar list).
 *
 * Plug in your data with `load` (required; sync or async). There is no built-in data: for demos use
 * `ecommerceDemoLoader` and `ecommerceLiveStep` from `@sheenui/theme/demo-data`. Money is formatted with Intl in `locale` and `currency`; every string is in `labels`.
 */

import { useId, useMemo, type ReactNode } from "react";

import { type HeadingLevelOption } from "../lib/heading";
import { cn } from "../lib/cn";
import { ComboTable, type ComboSeries } from "../components/charts/combo-chart";
import { FunnelChart, FunnelTable, type FunnelStage } from "../components/charts/funnel-chart";
import { Treemap, TreemapTable, type TreemapNode } from "../components/charts/treemap";
import { Heatmap, HeatmapTable, type HeatmapColumn } from "../components/charts/heatmap";
import { BarList, BarListTable, type BarListItem } from "../components/charts/bar-list";
import {
  AnalyticsGrid,
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  BarTrendChart,
  KpiStrip,
  trendLegend,
  defaultAnalyticsLabels,
  exportCsv,
  mergeLabels,
  useAnalyticsDashboard,
  type AnalyticsDashboardStateProps,
  type AnalyticsFilter,
  type AnalyticsLabels,
  type AnalyticsRange,
  type KpiItem,
} from "./analytics-kit";

/* ====================================================================================
 * Data
 * ==================================================================================== */

/** A headline number of the e-commerce dashboard: revenue, orders, average order value (`aov`) or conversion rate. */
export type EcommerceMetric = "revenue" | "orders" | "aov" | "conversion";
/** A step of the checkout funnel, from sessions through product views, add to cart and checkout to purchase. */
export type EcommerceStage = "sessions" | "productViews" | "addToCart" | "checkout" | "purchase";

/** The data the e-commerce dashboard shows for one query: revenue and orders per point, KPIs with trends, the checkout funnel, revenue by category, an orders heatmap (weekday by hour) and top products. */
export type EcommerceData = {
  /** Revenue and orders per time point (with the previous period's revenue for Compare). */
  points: { label: string; long?: string; revenue: number; orders: number; previousRevenue?: number }[];
  kpis: Record<EcommerceMetric, number>;
  previousKpis?: Partial<Record<EcommerceMetric, number>>;
  trends: Record<EcommerceMetric, number[]>;
  /** Visitors at each checkout step, in order. */
  funnel: { stage: EcommerceStage; value: number }[];
  /** Revenue by category (groups → products), for the treemap. */
  categories: TreemapNode[];
  /** Orders by weekday (rows, Monday first) × hour (24 columns). */
  heatmap: { day: string; hours: number[] }[];
  /** Top products by revenue. */
  products: BarListItem[];
};

/* ====================================================================================
 * Labels
 * ==================================================================================== */

/** A sales channel the dashboard can filter by: store, marketplace, app or social. */
export type EcommerceChannel = "store" | "marketplace" | "app" | "social";

/** Every user-facing string of the e-commerce dashboard: the shared `AnalyticsLabels` plus its subtitle, metric names and KPI group name. */
export type EcommerceLabels = AnalyticsLabels & {
  subtitle: (range: string) => string;
  metrics: Record<EcommerceMetric, string>;
  kpis: string;
  channels: Record<EcommerceChannel, string>;
  revenue: string;
  revenueDescription: string;
  /** Line series when Compare is off. */
  movingAverage: string;
  funnel: string;
  funnelDescription: string;
  stages: Record<EcommerceStage, string>;
  categories: string;
  categoriesDescription: string;
  /** Accessible name of the category breadcrumb (zoom levels). */
  categoryLevels: string;
  heatmap: string;
  heatmapDescription: string;
  hour: string;
  weekday: string;
  products: string;
  productsDescription: string;
  product: string;
  date: string;
};

/** The English `EcommerceLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultEcommerceLabels: EcommerceLabels = {
  ...defaultAnalyticsLabels,
  filters: "Filter by sales channel",
  subtitle: (range) => `Sales · ${range}`,
  metrics: { revenue: "Revenue", orders: "Orders", aov: "Avg. order value", conversion: "Conversion rate" },
  kpis: "Sales metrics",
  channels: { store: "Online store", marketplace: "Marketplace", app: "Mobile app", social: "Social" },
  revenue: "Revenue",
  revenueDescription: "Net sales after discounts and refunds",
  movingAverage: "Moving average",
  funnel: "Checkout funnel",
  funnelDescription: "Sessions to purchase",
  stages: {
    sessions: "Sessions",
    productViews: "Viewed a product",
    addToCart: "Added to cart",
    checkout: "Reached checkout",
    purchase: "Purchased",
  },
  categories: "Sales by category",
  categoriesDescription: "Revenue share; select a category to zoom in",
  categoryLevels: "Category level",
  heatmap: "When people buy",
  heatmapDescription: "Orders by hour and weekday",
  hour: "Hour",
  weekday: "Day",
  products: "Top products",
  productsDescription: "By revenue",
  product: "Product",
  date: "Date",
};

/* ====================================================================================
 * Demo data (deterministic)
 * ==================================================================================== */

/** The sales channels, in display order. Internal to the analytics kit and its demo data; safe to call on the server. */
export const CHANNELS: readonly EcommerceChannel[] = ["store", "marketplace", "app", "social"];

/* ====================================================================================
 * Component
 * ==================================================================================== */

/** Props of `EcommerceDashboard`: the shared dashboard state props plus the ones below. */
export type EcommerceDashboardProps = AnalyticsDashboardStateProps<EcommerceData> & {
  /** Store shown as the title (also names the dashboard landmark). Default `"Lumen & Co."`. */
  store?: string;
  /** Sets the ISO 4217 currency of every amount. Default "USD". */
  currency?: string;
  /** Ranges offered in the header (`readonly AnalyticsRange[]`, default all five). */
  ranges?: readonly AnalyticsRange[];
  /** Sales-channel filter chips. Their values reach `load` as `filters`. */
  filters?: readonly AnalyticsFilter[];
  /** Called by Export (default: a CSV of revenue and orders). */
  onExport?: (data: EcommerceData) => void;
  /**
   * Heading level of the title (1 to 6), or `"none"` for a paragraph with no heading role (panel titles follow).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** BCP 47 locale for every number and date (`string`, default the runtime's). */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<EcommerceLabels>`). */
  labels?: Partial<EcommerceLabels>;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

const ECOM_METRICS = ["revenue", "orders", "aov", "conversion"] as const;

/**
 * Props (see `EcommerceDashboardProps`): `store` (`"Lumen & Co."`), `currency` (`"USD"`), `ranges`,
 * `filters` (sales-channel chips), `onExport`, `headingLevel` (`"h2"`), `locale`, `labels`
 * (`Partial<EcommerceLabels>`), `className`, and the shared state props: `load`, `range` / `defaultRange` / `onRangeChange`, `activeFilters` / `defaultFilters` / `onFiltersChange`, `live` / `defaultLive` / `onLiveChange`, `compare` / `defaultCompare` / `onCompareChange` and `status` (`AnalyticsDashboardStateProps`; defaults: range `30d`, Live off, Compare off).
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
 * Most panels switch between the chart and a data table.
 *
 * @example
 * ```tsx
 * import { EcommerceDashboard } from "@sheenui/theme";
 * import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";
 *
 * export function Example() {
 *   return (
 *     <EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} store="Lumen & Co." currency="USD" defaultRange="7d" />
 *   );
 * }
 * ```
 *
 * @see /dashboards/ecommerce
 */
export function EcommerceDashboard(props: EcommerceDashboardProps) {
  const {
    store = "Lumen & Co.",
    currency = "USD",
    ranges,
    filters: filtersProp,
    onExport,
    headingLevel,
    locale,
    labels: labelsProp,
    className,
  } = props;
  const t = useMemo(() => mergeLabels(defaultEcommerceLabels, labelsProp), [labelsProp]);
  const dash = useAnalyticsDashboard(props, {
    liveInterval: 2800,
    defaults: { range: "30d", live: false, compare: false },
    isEmpty: (d) => d.points.length === 0,
  });
  const { data, query: loaded, range, compare, live, ready, busy, rootRef } = dash;
  const headingId = useId();
  const pinned = props.status !== undefined && props.status !== "auto";
  const filters = useMemo(
    () => filtersProp ?? CHANNELS.map((c) => ({ value: c, label: t.channels[c] })),
    [filtersProp, t],
  );

  const fmt = useMemo(() => {
    const money = new Intl.NumberFormat(locale ?? "en", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    const moneyFull = new Intl.NumberFormat(locale ?? "en", { style: "currency", currency, maximumFractionDigits: 0 });
    const moneyCents = new Intl.NumberFormat(locale ?? "en", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const percent = new Intl.NumberFormat(locale ?? "en", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const ratio = new Intl.NumberFormat(locale ?? "en", { style: "percent", maximumFractionDigits: 1 });
    const count = new Intl.NumberFormat(locale ?? "en");
    const compactCount = new Intl.NumberFormat(locale ?? "en", { notation: "compact", maximumFractionDigits: 1 });
    return {
      money: (n: number) => money.format(n).replace("-", "−"),
      moneyFull: (n: number) => moneyFull.format(n).replace("-", "−"),
      moneyCents: (n: number) => moneyCents.format(n),
      percent: (n: number) => percent.format(n),
      ratio: (n: number) => ratio.format(n),
      count: (n: number) => count.format(Math.round(n)),
      compactCount: (n: number) => (Math.abs(n) < 10_000 ? count.format(Math.round(n)) : compactCount.format(n)),
    };
  }, [locale, currency]);
  const metricFormat = useMemo(
    () =>
      ({ revenue: fmt.money, orders: fmt.compactCount, aov: fmt.moneyCents, conversion: fmt.percent }) satisfies Record<
        EcommerceMetric,
        (n: number) => string
      >,
    [fmt],
  );

  const kpis: KpiItem[] | null = useMemo(() => {
    if (!data || !ready) return null;
    return ECOM_METRICS.map((m) => ({
      id: m,
      label: t.metrics[m],
      value: data.kpis[m],
      previous: data.previousKpis?.[m] ?? null,
      trend: data.trends[m],
      format: metricFormat[m],
    }));
  }, [data, ready, t, metricFormat]);

  // Bars: revenue. Line (same unit, same axis): a moving average. Compare adds last period, dashed.
  const tableSeries: ComboSeries[] = useMemo(
    () => [
      { key: "revenue", label: t.revenue, type: "bar", color: 1 },
      { key: "avg", label: t.movingAverage, type: "line", color: 2 },
      ...(compare ? [{ key: "previous", label: t.previousPeriod, type: "line" as const, color: 8 as const }] : []),
    ],
    [t, compare],
  );
  const revenueRows = useMemo(() => {
    if (!data) return [];
    const span = data.points.length > 40 ? 7 : data.points.length > 12 ? 5 : 3;
    return data.points.map((p, i) => {
      const window = data.points.slice(Math.max(0, i - span + 1), i + 1);
      const avg = Math.round(window.reduce((s, w) => s + w.revenue, 0) / Math.max(1, window.length));
      return {
        label: p.label,
        long: p.long,
        date: p.long ?? p.label,
        value: p.revenue,
        revenue: p.revenue,
        line: avg,
        avg,
        previous: p.previousRevenue ?? null,
      };
    });
  }, [data]);
  const tableRows = useMemo(
    () => revenueRows.map((r) => ({ date: r.date, revenue: r.revenue, avg: r.avg, previous: r.previous ?? "" })),
    [revenueRows],
  );
  const revenueLegend = useMemo(
    () => [
      { label: t.revenue, color: "var(--sheen-chart-1)", kind: "rect" as const },
      { label: t.movingAverage, color: "var(--sheen-chart-2)", kind: "line" as const },
      ...(compare ? trendLegend(t.revenue, 1, true, t.previousPeriod).slice(1) : []),
    ],
    [t, compare],
  );
  const stages: FunnelStage[] = useMemo(
    () => (data ? data.funnel.map((f) => ({ label: t.stages[f.stage], value: f.value })) : []),
    [data, t],
  );
  const hourColumns: HeatmapColumn[] = useMemo(() => {
    const hour = new Intl.DateTimeFormat(locale, { hour: "numeric", timeZone: "UTC" });
    return Array.from({ length: 24 }, (_, h) => ({
      key: `h${h}`,
      label: hour.format(new Date(Date.UTC(2026, 0, 1, h))),
    }));
  }, [locale]);
  const heatRows = useMemo(
    () =>
      data ? data.heatmap.map((r) => ({ day: r.day, ...Object.fromEntries(r.hours.map((v, h) => [`h${h}`, v])) })) : [],
    [data],
  );

  const handleExport = () => {
    if (!data) return;
    if (onExport) {
      onExport(data);
      return;
    }
    exportCsv(
      `${store.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-sales-${loaded?.range ?? range}.csv`,
      [t.date, t.metrics.revenue, t.metrics.orders, `${t.metrics.revenue} (${t.previousPeriod})`],
      data.points.map((p) => [p.long ?? p.label, p.revenue, p.orders, p.previousRevenue ?? null]),
    );
  };

  const rangeName = t.rangeNames[loaded?.range ?? range];

  return (
    <div ref={rootRef} data-slot="ecommerce-dashboard" className={cn("w-full min-w-0", className)}>
      <AnalyticsShell
        title={store}
        subtitle={t.subtitle(rangeName)}
        icon={<BagIcon />}
        headingId={headingId}
        headingLevel={headingLevel}
        range={range}
        onRangeChange={dash.setRange}
        ranges={ranges}
        filters={filters}
        activeFilters={dash.filters}
        onFiltersChange={dash.setFilters}
        live={live}
        onLiveChange={dash.setLive}
        compare={compare}
        onCompareChange={dash.setCompare}
        onExport={handleExport}
        exportDisabled={!ready}
        loading={busy}
        labels={t}
      >
        {dash.status === "error" || dash.status === "empty" ? (
          <AnalyticsState kind={dash.status} labels={t} onRetry={pinned ? undefined : dash.retry} />
        ) : (
          <>
            <KpiStrip
              items={kpis}
              compare={compare}
              locale={locale}
              labels={t}
              aria-label={t.kpis}
              cellClassName="min-h-[177.5px] @lg:min-h-[149.5px] @2xl:min-h-[162.5px] @3xl:min-h-[191px] @5xl:min-h-[163px]"
            />
            <AnalyticsGrid>
              <AnalyticsPanel
                title={t.revenue}
                description={`${t.revenueDescription} · ${rangeName}`}
                legend={revenueLegend}
                span={{ md: 2, lg: 3 }}
                minHeight={388} // the chart's final height, reserved before it mounts
                ready={ready}
                deps={[revenueRows, tableRows, compare, revenueLegend, tableSeries, fmt, t, locale]}
                index={0}
                count={5}
                labels={t}
                table={
                  <ComboTable
                    data={tableRows}
                    index="date"
                    series={tableSeries}
                    format={fmt.moneyFull}
                    indexLabel={t.date}
                    caption={`${t.revenue}, ${t.revenueDescription}`}
                  />
                }
              >
                {() => (
                  <BarTrendChart
                    data={revenueRows}
                    seriesLabel={t.revenue}
                    lineLabel={t.movingAverage}
                    compare={compare}
                    height={360}
                    format={fmt.money}
                    locale={locale}
                    labels={t}
                    aria-label={`${t.revenue}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.funnel}
                description={t.funnelDescription}
                span={{ md: 2, lg: 1 }}
                minHeight={328}
                bodyClassName="min-h-[410px]! @2xl:min-h-[328px]! @5xl:min-h-[450px]!" // the funnel grows with its column
                ready={ready}
                deps={[stages, fmt, locale]}
                index={1}
                count={5}
                labels={t}
                table={
                  <FunnelTable
                    data={stages}
                    format={fmt.count}
                    formatPercent={fmt.ratio}
                    locale={locale}
                    caption={`${t.funnel}, ${t.funnelDescription}`}
                  />
                }
              >
                {() => (
                  <FunnelChart
                    data={stages}
                    align="start"
                    color={7}
                    format={fmt.compactCount}
                    formatPercent={fmt.ratio}
                    locale={locale}
                    showDropOff
                    aria-label={`${t.funnel}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.categories}
                description={t.categoriesDescription}
                span={{ md: 1, lg: 2 }}
                minHeight={352}
                ready={ready}
                deps={[data?.categories, fmt, locale]}
                index={2}
                count={5}
                labels={t}
                table={
                  data && (
                    <TreemapTable
                      data={data.categories}
                      format={fmt.moneyFull}
                      locale={locale}
                      caption={`${t.categories}, ${t.categoriesDescription}`}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <Treemap
                      data={data.categories}
                      height={320}
                      format={fmt.money}
                      locale={locale}
                      labels={{ breadcrumb: `${store}: ${t.categoryLevels}` }}
                      aria-label={`${t.categories}, ${rangeName}`}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.products}
                description={t.productsDescription}
                span={{ md: 1, lg: 2 }}
                minHeight={320}
                ready={ready}
                deps={[data?.products, fmt, t, locale]}
                index={3}
                count={5}
                labels={t}
                table={
                  data && (
                    <BarListTable
                      data={data.products}
                      format={fmt.moneyFull}
                      locale={locale}
                      caption={`${t.products}, ${t.productsDescription}`}
                      headers={{ name: t.product, value: t.metrics.revenue }}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <BarList
                      data={data.products}
                      color={2}
                      format={fmt.money}
                      locale={locale}
                      showShare
                      nameHeader={t.product}
                      valueHeader={t.metrics.revenue}
                      aria-label={t.products}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.heatmap}
                description={t.heatmapDescription}
                span={{ md: 2, lg: 4 }}
                minHeight={300}
                bodyClassName="@5xl:min-h-[330px]!"
                ready={ready}
                deps={[heatRows, hourColumns, fmt, t, locale]}
                index={4}
                count={5}
                labels={t}
                table={
                  <HeatmapTable
                    data={heatRows}
                    index="day"
                    columns={hourColumns}
                    format={fmt.count}
                    locale={locale}
                    indexLabel={t.weekday}
                    caption={t.heatmapDescription}
                  />
                }
              >
                {() => (
                  <Heatmap
                    data={heatRows}
                    index="day"
                    columns={hourColumns}
                    color={1}
                    steps={6}
                    minCellWidth={26}
                    format={fmt.count}
                    locale={locale}
                    legend
                    legendLabel={t.metrics.orders}
                    aria-label={`${t.heatmapDescription}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>
            </AnalyticsGrid>
          </>
        )}
      </AnalyticsShell>
    </div>
  );
}

function BagIcon(): ReactNode {
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
      <path d="M5 8.5h14l-1.2 11a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8.5Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </svg>
  );
}
