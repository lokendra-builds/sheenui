"use client";

/**
 * SaasRevenueDashboard: a full-page SaaS revenue template (Stripe / ChartMogul / Baremetrics style).
 *
 *   - Glass header: product, time range, region filters, Live / Compare / Export.
 *   - KPI strip: MRR, ARR, churn rate, ARPU with rolling numbers, deltas and sparklines.
 *   - MRR by plan (stacked area), plan mix (donut), MRR movement (waterfall: new, expansion,
 *     reactivation, contraction, churn), retention cohorts, and a sortable top-customers table.
 *
 * Plug in your data with `load` (required; sync or async). There is no built-in data: for demos use
 * `saasRevenueDemoLoader` and `saasLiveStep` from `@sheenui/theme/demo-data`. Money is formatted with Intl in `locale` and `currency`; every string is in `labels`.
 */

import { memo, useId, useMemo, useState, type ReactNode } from "react";

import { type HeadingLevelOption } from "../lib/heading";
import { cn } from "../lib/cn";
import { type ChartColor } from "../charts/chart-utils";
import { StackedAreaTable } from "../charts/stacked-area-chart";
import { DonutChart, type DonutSlice } from "../charts/donut-chart";
import { PieTable } from "../charts/pie-chart";
import { WaterfallChart, WaterfallTable, type WaterfallStep } from "../charts/waterfall-chart";
import { CohortChart, CohortTable, type CohortRow } from "../charts/cohort-chart";
import {
  AnalyticsGrid,
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  DeltaBadge,
  KpiStrip,
  StackedTrendChart,
  changeRatio,
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
import { initials } from "../lib/initials";

/* ====================================================================================
 * Data
 * ==================================================================================== */

/** A subscription plan tier: starter, pro, business or enterprise. */
export type SaasPlan = "starter" | "pro" | "business" | "enterprise";
/** A headline number of the SaaS revenue dashboard: MRR, ARR, churn rate or ARPU. */
export type SaasMetric = "mrr" | "arr" | "churnRate" | "arpu";

/** A customer row: id, name, optional detail line, plan, MRR (with the previous period's for the change column), seats and the ISO date they started paying. */
export type SaasCustomer = {
  id: string;
  name: string;
  /** Shown under the name (a domain, an account id). */
  detail?: string;
  plan: SaasPlan;
  mrr: number;
  /** MRR one period earlier (for the change column). */
  previousMrr?: number;
  seats: number;
  /** ISO date the customer started paying. */
  since: string;
};

/** The data the SaaS revenue dashboard shows for one query: MRR by plan per point, KPIs with trends, MRR movement, retention cohorts and the customer table. */
export type SaasRevenueData = {
  /** MRR by plan at each time point. */
  points: { label: string; long?: string; mrr: Record<SaasPlan, number> }[];
  /** Headline numbers (MRR, ARR and ARPU in currency units; churn as a monthly ratio). */
  kpis: Record<SaasMetric, number>;
  previousKpis?: Partial<Record<SaasMetric, number>>;
  /** One value per point for each KPI sparkline. */
  trends: Record<SaasMetric, number[]>;
  /** MRR movement over the range. */
  movement: {
    starting: number;
    newBusiness: number;
    expansion: number;
    reactivation: number;
    contraction: number;
    churn: number;
  };
  /** Retention cohorts (customers still paying per period). */
  cohorts: CohortRow[];
  /** "month" or "week": names the cohort periods. */
  cohortPeriod: "month" | "week";
  customers: SaasCustomer[];
};

/* ====================================================================================
 * Labels
 * ==================================================================================== */

/** A region the dashboard can filter by: North America, EMEA, APAC or Latin America. */
export type SaasRegion = "na" | "emea" | "apac" | "latam";

/** Every user-facing string of the SaaS revenue dashboard: the shared `AnalyticsLabels` plus its subtitle and metric names. */
export type SaasRevenueLabels = AnalyticsLabels & {
  subtitle: (range: string) => string;
  metrics: Record<SaasMetric, string>;
  kpis: string;
  plans: Record<SaasPlan, string>;
  regions: Record<SaasRegion, string>;
  mrrByPlan: string;
  mrrByPlanDescription: string;
  planMix: string;
  planMixDescription: string;
  movement: string;
  movementDescription: string;
  movementSteps: {
    starting: string;
    newBusiness: string;
    expansion: string;
    reactivation: string;
    contraction: string;
    churn: string;
    ending: string;
  };
  cohorts: string;
  cohortsDescription: (period: "month" | "week") => string;
  /** Column header of cohort period `i`: "Month 3", "Week 3". */
  cohortPeriodName: (period: "month" | "week", i: number) => string;
  /** Second line under each cohort: "196 customers". */
  cohortSize: (size: string) => string;
  customers: string;
  customersDescription: string;
  columns: { customer: string; plan: string; mrr: string; seats: string; change: string; since: string };
  /** Accessible name of a sortable header button: "Sort by MRR". */
  sortBy: (column: string) => string;
  date: string;
};

/** The English `SaasRevenueLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultSaasRevenueLabels: SaasRevenueLabels = {
  ...defaultAnalyticsLabels,
  filters: "Filter by region",
  subtitle: (range) => `Revenue · ${range}`,
  metrics: { mrr: "MRR", arr: "ARR", churnRate: "Churn rate", arpu: "ARPU" },
  kpis: "Revenue metrics",
  plans: { starter: "Starter", pro: "Pro", business: "Business", enterprise: "Enterprise" },
  regions: { na: "North America", emea: "Europe", apac: "Asia-Pacific", latam: "Latin America" },
  mrrByPlan: "MRR by plan",
  mrrByPlanDescription: "Monthly recurring revenue, stacked",
  planMix: "Plan mix",
  planMixDescription: "Share of MRR",
  movement: "MRR movement",
  movementDescription: "From the start to the end of the range",
  movementSteps: {
    starting: "Starting MRR",
    newBusiness: "New",
    expansion: "Expansion",
    reactivation: "Reactivation",
    contraction: "Contraction",
    churn: "Churn",
    ending: "Ending MRR",
  },
  cohorts: "Retention",
  cohortsDescription: (period) => `Customers still paying, by ${period === "month" ? "monthly" : "weekly"} cohort`,
  cohortPeriodName: (period, i) => `${period === "month" ? "Month" : "Week"} ${i}`,
  cohortSize: (size) => `${size} customers`,
  customers: "Top customers",
  customersDescription: "By monthly recurring revenue",
  columns: {
    customer: "Customer",
    plan: "Plan",
    mrr: "MRR",
    seats: "Seats",
    change: "Change",
    since: "Customer since",
  },
  sortBy: (column) => `Sort by ${column}`,
  date: "Date",
};

/* ====================================================================================
 * Demo data (deterministic)
 * ==================================================================================== */

/** The plan tiers, in display order. Internal to the analytics kit and its demo data; safe to call on the server. */
export const PLANS: readonly SaasPlan[] = ["starter", "pro", "business", "enterprise"];
const PLAN_COLOR: Record<SaasPlan, ChartColor> = { starter: 1, pro: 2, business: 3, enterprise: 4 };
/** The sales regions, in display order. Internal to the analytics kit and its demo data; safe to call on the server. */
export const REGIONS: readonly SaasRegion[] = ["na", "emea", "apac", "latam"];

/* ====================================================================================
 * Component
 * ==================================================================================== */

/** Props of `SaasRevenueDashboard`: the shared dashboard state props plus the ones below. */
export type SaasRevenueDashboardProps = AnalyticsDashboardStateProps<SaasRevenueData> & {
  /** Product shown as the title (`string`, default `"Acme Cloud"`). */
  product?: string;
  /** Sets the ISO 4217 currency of every amount. Default "USD". */
  currency?: string;
  /** Lists the ranges offered in the header. Default: 7d, 30d, 90d, 12m (MRR is a slow metric). */
  ranges?: readonly AnalyticsRange[];
  /** Region filter chips. Their values reach `load` as `filters`. */
  filters?: readonly AnalyticsFilter[];
  /** Called by Export (default: a CSV of MRR by plan). */
  onExport?: (data: SaasRevenueData) => void;
  /**
   * Heading level of the title (1 to 6), or `"none"` for a paragraph with no heading role (panel titles follow).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** BCP 47 locale for every number and date (`string`, default the runtime's). */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<SaasRevenueLabels>`). */
  labels?: Partial<SaasRevenueLabels>;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

const SAAS_RANGES: readonly AnalyticsRange[] = ["7d", "30d", "90d", "12m"];
const SAAS_METRICS = ["mrr", "arr", "churnRate", "arpu"] as const;

/**
 * Props (see `SaasRevenueDashboardProps`): `product` (`"Acme Cloud"`), `currency` (`"USD"`), `ranges`
 * (`7d`, `30d`, `90d`, `12m`), `filters` (region chips), `onExport`, `headingLevel` (`"h2"`), `locale`,
 * `labels` (`Partial<SaasRevenueLabels>`), `className`, and the shared state props: `load`, `range` / `defaultRange` / `onRangeChange`, `activeFilters` / `defaultFilters` / `onFiltersChange`, `live` / `defaultLive` / `onLiveChange`, `compare` / `defaultCompare` / `onCompareChange` and `status` (`AnalyticsDashboardStateProps`; defaults: range `12m`, Live off, Compare on).
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
 * The top-customers table is a scrollable region that is a tab stop, with sortable column buttons.
 *
 * @example
 * ```tsx
 * import { SaasRevenueDashboard } from "@sheenui/theme";
 * import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";
 *
 * export function Example() {
 *   return (
 *     <SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" currency="EUR" locale="de-DE" defaultFilters={["emea"]} />
 *   );
 * }
 * ```
 *
 * @see /dashboards/saas
 */
export function SaasRevenueDashboard(props: SaasRevenueDashboardProps) {
  const {
    product = "Acme Cloud",
    currency = "USD",
    ranges = SAAS_RANGES,
    filters: filtersProp,
    onExport,
    headingLevel,
    locale,
    labels: labelsProp,
    className,
  } = props;
  const t = useMemo(() => mergeLabels(defaultSaasRevenueLabels, labelsProp), [labelsProp]);
  const dash = useAnalyticsDashboard(props, {
    liveInterval: 3200,
    defaults: { range: "12m", live: false, compare: true },
    isEmpty: (d) => d.points.length === 0,
  });
  const { data, query: loaded, range, compare, live, ready, busy, rootRef } = dash;
  const headingId = useId();
  const pinned = props.status !== undefined && props.status !== "auto";
  const filters = useMemo(
    () => filtersProp ?? REGIONS.map((r) => ({ value: r, label: t.regions[r] })),
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
    const percent = new Intl.NumberFormat(locale ?? "en", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const count = new Intl.NumberFormat(locale ?? "en");
    const date = new Intl.DateTimeFormat(locale ?? "en", { month: "short", year: "numeric", timeZone: "UTC" });
    return {
      money: (n: number) => money.format(n).replace("-", "−"),
      moneyFull: (n: number) => moneyFull.format(n).replace("-", "−"),
      percent: (n: number) => percent.format(n),
      count: (n: number) => count.format(Math.round(n)),
      date: (iso: string) => date.format(new Date(iso)),
    };
  }, [locale, currency]);
  const metricFormat = useMemo(
    () =>
      ({ mrr: fmt.money, arr: fmt.money, churnRate: fmt.percent, arpu: fmt.moneyFull }) satisfies Record<
        SaasMetric,
        (n: number) => string
      >,
    [fmt],
  );

  const kpis: KpiItem[] | null = useMemo(() => {
    if (!data || !ready) return null;
    return SAAS_METRICS.map((m) => ({
      id: m,
      label: t.metrics[m],
      value: data.kpis[m],
      previous: data.previousKpis?.[m] ?? null,
      trend: data.trends[m],
      format: metricFormat[m],
      goodWhen: m === "churnRate" ? "down" : "up",
    }));
  }, [data, ready, t, metricFormat]);

  const series = useMemo(() => PLANS.map((p) => ({ key: p, label: t.plans[p], color: PLAN_COLOR[p] })), [t]);
  const rows = useMemo(
    () => (data ? data.points.map((p) => ({ date: p.long ?? p.label, label: p.label, ...p.mrr })) : []),
    [data],
  );
  const stacked = useMemo(
    () => (data ? data.points.map((p) => ({ label: p.label, long: p.long, values: p.mrr })) : []),
    [data],
  );
  const planMix: DonutSlice[] = useMemo(() => {
    const last = data?.points[data.points.length - 1];
    return last ? PLANS.map((p) => ({ label: t.plans[p], value: last.mrr[p], color: PLAN_COLOR[p] })) : [];
  }, [data, t]);
  const steps: WaterfallStep[] = useMemo(() => {
    if (!data) return [];
    const m = data.movement;
    const s = t.movementSteps;
    return [
      { label: s.starting, value: m.starting, kind: "start" },
      { label: s.newBusiness, value: m.newBusiness },
      { label: s.expansion, value: m.expansion },
      { label: s.reactivation, value: m.reactivation },
      { label: s.contraction, value: -m.contraction },
      { label: s.churn, value: -m.churn },
      { label: s.ending, kind: "total" },
    ];
  }, [data, t]);

  const handleExport = () => {
    if (!data) return;
    if (onExport) {
      onExport(data);
      return;
    }
    exportCsv(
      `${product.toLowerCase().replace(/\s+/g, "-")}-mrr-${loaded?.range ?? range}.csv`,
      [t.date, ...PLANS.map((p) => t.plans[p]), t.metrics.mrr],
      data.points.map((p) => [
        p.long ?? p.label,
        ...PLANS.map((plan) => p.mrr[plan]),
        PLANS.reduce((sum, plan) => sum + p.mrr[plan], 0),
      ]),
    );
  };

  const rangeName = t.rangeNames[loaded?.range ?? range];
  const cohortPeriod = data?.cohortPeriod ?? "month";
  const cohortLabels = useMemo(
    () => ({ period: (i: number) => t.cohortPeriodName(cohortPeriod, i), size: t.cohortSize }),
    [t, cohortPeriod],
  );

  return (
    <div ref={rootRef} data-slot="saas-revenue-dashboard" className={cn("w-full min-w-0", className)}>
      <AnalyticsShell
        title={product}
        subtitle={t.subtitle(rangeName)}
        icon={<RevenueIcon />}
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
                title={t.mrrByPlan}
                description={`${t.mrrByPlanDescription} · ${rangeName}`}
                legend={series.map((s) => ({
                  label: s.label,
                  color: `var(--sheen-chart-${s.color})`,
                  kind: "rect" as const,
                }))}
                span={{ md: 2, lg: 3 }}
                minHeight={328}
                ready={ready}
                deps={[stacked, rows, series, fmt, t]}
                index={0}
                count={5}
                labels={t}
                table={
                  <StackedAreaTable
                    data={rows}
                    index="date"
                    series={series}
                    format={fmt.moneyFull}
                    indexLabel={t.date}
                    caption={`${t.mrrByPlan}, ${t.mrrByPlanDescription}`}
                  />
                }
              >
                {() => (
                  <StackedTrendChart
                    data={stacked}
                    series={series}
                    height={300}
                    format={fmt.money}
                    labels={{ ...t, total: t.metrics.mrr }}
                    aria-label={`${t.mrrByPlan}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.planMix}
                description={t.planMixDescription}
                span={{ md: 1, lg: 1 }}
                minHeight={332}
                ready={ready}
                deps={[planMix, fmt, t]}
                index={1}
                count={5}
                labels={t}
                table={
                  <PieTable
                    data={planMix}
                    format={fmt.moneyFull}
                    caption={`${t.planMix}, ${t.planMixDescription}`}
                    indexLabel={t.columns.plan}
                  />
                }
                bodyClassName="flex items-center justify-center"
              >
                {() => (
                  <DonutChart
                    data={planMix}
                    diameter={184}
                    labels={{ center: t.metrics.mrr }}
                    format={fmt.money}
                    aria-label={`${t.planMix}: ${t.planMixDescription}`}
                    className="flex-col"
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.movement}
                description={t.movementDescription}
                span={{ md: 1, lg: 2 }}
                minHeight={340}
                ready={ready}
                deps={[steps, fmt, t, locale]}
                index={2}
                count={5}
                labels={t}
                table={
                  <WaterfallTable
                    data={steps}
                    format={fmt.moneyFull}
                    locale={locale}
                    caption={`${t.movement}, ${t.movementDescription}`}
                  />
                }
              >
                {() => (
                  <WaterfallChart
                    data={steps}
                    height={340}
                    format={fmt.money}
                    locale={locale}
                    showValues
                    showConnectors
                    aria-label={`${t.movement}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.cohorts}
                description={t.cohortsDescription(cohortPeriod)}
                span={{ md: 2, lg: 2 }}
                minHeight={394}
                ready={ready}
                deps={[data?.cohorts, cohortLabels, t, locale]}
                index={3}
                count={5}
                labels={t}
                table={
                  data && (
                    <CohortTable
                      data={data.cohorts}
                      locale={locale}
                      labels={cohortLabels}
                      caption={`${t.cohorts}, ${t.cohortsDescription(data.cohortPeriod)}`}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <CohortChart
                      data={data.cohorts}
                      maxHeight={320}
                      color={1}
                      steps={5}
                      locale={locale}
                      labels={cohortLabels}
                      aria-label={`${t.cohorts}: ${t.cohortsDescription(data.cohortPeriod)}`}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.customers}
                description={t.customersDescription}
                span={{ md: 2, lg: 4 }}
                minHeight={280}
                ready={ready}
                deps={[data?.customers, compare, fmt, t, locale]}
                index={4}
                count={5}
                labels={t}
                bodyClassName="@container min-h-[921px]! @min-[742px]:min-h-[745px]!" // the table's final height, so mounting it never moves what is below (the body is the table's container, so this query sees the dashboard, 42 px wider: the table goes compact below a 700 px body)
              >
                {() =>
                  data && (
                    <CustomersTable customers={data.customers} compare={compare} fmt={fmt} labels={t} locale={locale} />
                  )
                }
              </AnalyticsPanel>
            </AnalyticsGrid>
          </>
        )}
      </AnalyticsShell>
    </div>
  );
}

/* ---------- Top customers: a sortable table (it is the data itself, so no chart twin) ---------- */

type SortKey = "mrr" | "seats" | "change" | "since";

const CustomersTable = memo(function CustomersTable({
  customers,
  compare,
  fmt,
  labels,
  locale,
}: {
  customers: SaasCustomer[];
  compare: boolean;
  fmt: {
    money: (n: number) => string;
    moneyFull: (n: number) => string;
    count: (n: number) => string;
    date: (iso: string) => string;
  };
  labels: SaasRevenueLabels;
  locale?: string;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "mrr", dir: "desc" });
  const sorted = useMemo(() => {
    const value = (c: SaasCustomer) =>
      sort.key === "mrr"
        ? c.mrr
        : sort.key === "seats"
          ? c.seats
          : sort.key === "since"
            ? Date.parse(c.since)
            : (changeRatio(c.mrr, c.previousMrr) ?? 0);
    return [...customers].sort((a, b) => (sort.dir === "desc" ? value(b) - value(a) : value(a) - value(b)));
  }, [customers, sort]);
  const c = labels.columns;

  // Narrow panels (container < 36rem): plan and dates fold under the name, seats hide; MRR and change stay.
  const wide = "hidden @xl:table-cell";
  const header = (key: SortKey | null, text: string, align: "start" | "end" = "end", className?: string) => {
    const active = key !== null && sort.key === key;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
        className={cn(
          "px-3 py-2.5 font-medium whitespace-nowrap",
          align === "end" ? "text-end" : "text-start",
          className,
        )}
      >
        {key ? (
          <button
            type="button"
            aria-label={labels.sortBy(text)}
            onClick={() =>
              setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }))
            }
            className={cn(
              "-mx-1.5 inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-sheen-sm px-1.5 hover:text-sheen-fg any-pointer-coarse:min-h-11",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
              active && "text-sheen-fg",
            )}
          >
            {text}
            <SortIcon dir={active ? sort.dir : null} />
          </button>
        ) : (
          text
        )}
      </th>
    );
  };

  return (
    // relative: the sr-only text in the cells is positioned against the region, so it is clipped with the table.
    <div
      role="group"
      aria-label={labels.customers}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so the table can be scrolled without a mouse (WCAG 2.1.1, axe scrollable-region-focusable)
      tabIndex={0}
      className="relative overflow-x-auto rounded-sheen-sm [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
    >
      <table className="w-full text-sm @xl:min-w-[40rem]">
        <caption className="sr-only">{labels.customers}</caption>
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            {header(null, c.customer, "start")}
            {header(null, c.plan, "start", wide)}
            {header("mrr", c.mrr)}
            {header("seats", c.seats, "end", wide)}
            {header("change", c.change)}
            {header("since", c.since, "end", wide)}
          </tr>
        </thead>
        <tbody>
          {sorted.map((cust) => {
            const ratio = changeRatio(cust.mrr, cust.previousMrr);
            return (
              <tr
                key={cust.id}
                className="border-b border-sheen-border transition-colors duration-(--sheen-duration-fast) last:border-0 hover:bg-sheen-hover"
              >
                <th scope="row" className="px-3 py-2.5 text-start font-normal">
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-sheen-accent-soft text-xs font-semibold text-sheen-accent"
                    >
                      {initials(cust.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-sheen-fg">{cust.name}</span>
                      {cust.detail && (
                        <span className="hidden truncate text-xs text-sheen-fg-muted @xl:block">{cust.detail}</span>
                      )}
                      <span className="block truncate text-xs text-sheen-fg-muted @xl:hidden">
                        {labels.plans[cust.plan]} · {fmt.date(cust.since)}
                      </span>
                    </span>
                  </span>
                </th>
                <td className={cn("px-3 py-2.5", wide)}>
                  <span className="inline-flex items-center gap-1.5 text-sheen-fg-muted">
                    <svg aria-hidden width={8} height={8} className="shrink-0 forced-color-adjust-none">
                      <rect width={8} height={8} rx={2} fill={`var(--sheen-chart-${PLAN_COLOR[cust.plan]})`} />
                    </svg>
                    {labels.plans[cust.plan]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-end font-semibold tabular-nums">{fmt.moneyFull(cust.mrr)}</td>
                <td className={cn("px-3 py-2.5 text-end text-sheen-fg-muted tabular-nums", wide)}>
                  {fmt.count(cust.seats)}
                </td>
                <td className="px-3 py-2.5 text-end">
                  {ratio !== null ? (
                    <span className="inline-flex flex-col items-end gap-0.5">
                      <DeltaBadge ratio={ratio} locale={locale} labels={labels} />
                      {compare && cust.previousMrr != null && (
                        <span className="text-2xs text-sheen-fg-subtle tabular-nums">
                          {labels.vsPrevious(fmt.moneyFull(cust.previousMrr))}
                        </span>
                      )}
                    </span>
                  ) : (
                    "–"
                  )}
                </td>
                <td className={cn("px-3 py-2.5 text-end whitespace-nowrap text-sheen-fg-muted", wide)}>
                  {fmt.date(cust.since)}
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-sheen-fg-muted">
                {labels.noData}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 4.5 6 2l2.5 2.5" opacity={dir === "desc" ? 0.35 : 1} />
      <path d="M3.5 7.5 6 10l2.5-2.5" opacity={dir === "asc" ? 0.35 : 1} />
    </svg>
  );
}

function RevenueIcon(): ReactNode {
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
      <path d="M4 19.5h16" />
      <path d="M5.5 15.5 10 11l3 3 5.5-6.5" />
      <path d="M15 7.5h3.5V11" />
    </svg>
  );
}
