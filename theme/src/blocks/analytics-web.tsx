"use client";

/**
 * WebAnalyticsDashboard: a full-page web analytics template (Plausible / Vercel style).
 *
 *   - Glass header: site, live visitors pill (rolling number + pulse), time range, channel
 *     filters, Live / Compare / Export.
 *   - KPI strip as tabs (unique visitors, pageviews, bounce rate, visit duration): rolling
 *     numbers, deltas, sparklines. The chosen metric drives the trend chart.
 *   - Trend: gradient area with the previous period dashed, crosshair, keyboard reading.
 *   - Realtime: visitors right now + a streaming mini chart + the pages they're on.
 *   - Top pages and referrers (bar lists), devices (donut), countries (world map).
 *
 * Plug in your data with `load` (required; sync or async, gets the range, the filters and an abort
 * signal). There is no built-in data: for demos use `webAnalyticsDemoLoader` and `webLiveStep` from
 * `@sheenui/theme/demo-data`.
 * Every string is in `labels`, every number is formatted with Intl in `locale`.
 */

import { memo, useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useLatest } from "../hooks/use-latest";

import { type HeadingLevelOption } from "../lib/heading";
import { cn } from "../lib/cn";
import { useControllable } from "../hooks/use-controllable";
import { compactFormat, useInViewSettled, type ChartColor } from "../components/charts/chart-utils";
import { BarList, BarListTable, type BarListItem } from "../components/charts/bar-list";
import { DonutChart, type DonutSlice } from "../components/charts/donut-chart";
import { PieTable } from "../components/charts/pie-chart";
import { WorldMap, WorldMapTable, type WorldMapDatum } from "../components/charts/geo-map";
import { StreamingChart, useStreamingData } from "../components/charts/streaming-chart";
import { useLoopPlayback } from "../motion/gate";
import {
  AnalyticsGrid,
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  KpiStrip,
  LiveDot,
  RollingNumber,
  TrendChart,
  TrendTable,
  defaultAnalyticsLabels,
  exportCsv,
  mergeLabels,
  trendLegend,
  useAnalyticsDashboard,
  type AnalyticsDashboardStateProps,
  type AnalyticsFilter,
  type AnalyticsLabels,
  type AnalyticsRange,
  type KpiItem,
  type TrendDatum,
} from "./analytics-kit";

/* ====================================================================================
 * Data
 * ==================================================================================== */

/** A headline number of the web analytics dashboard: visitors, pageviews, bounce rate or visit duration. */
export type WebMetric = "visitors" | "pageviews" | "bounceRate" | "duration";

/** A device class in the traffic split: desktop, mobile or tablet. */
export type WebDevice = "desktop" | "mobile" | "tablet";

/** One time point (an hour, a day or a month). */
export type WebAnalyticsPoint = {
  label: string;
  /** Tooltip / table label (defaults to `label`). */
  long?: string;
  /** Unique visitors, pageviews, bounce rate (0–1), average visit duration (seconds). */
  current: Record<WebMetric, number>;
  /** The same point one period earlier (for Compare). */
  previous?: Record<WebMetric, number>;
};

/** The data the web analytics dashboard shows for one query: per-point metrics, totals (with the previous period's), top pages, referrers, countries, devices, browsers and the realtime visitors. */
export type WebAnalyticsData = {
  points: WebAnalyticsPoint[];
  /** Headline numbers for the whole range (rates and durations are averages, not sums). */
  totals: Record<WebMetric, number>;
  previousTotals?: Partial<Record<WebMetric, number>>;
  pages: BarListItem[];
  referrers: BarListItem[];
  /** Visitors by country (ISO 3166-1 alpha-2, alpha-3 or numeric). */
  countries: WorldMapDatum[];
  devices: { device: WebDevice; value: number }[];
  browsers: BarListItem[];
  realtime: {
    /** Visitors on the site right now. */
    visitors: number;
    /** Pages they're on. */
    pages: BarListItem[];
    /**
     * Visitors online at each of the last samples, oldest first, one per 2 seconds and ending now. The realtime chart starts
     * from it. Leave it out when you have no history: the chart shows its empty state and fills in as live updates arrive.
     */
    history?: number[];
  };
};

/* ====================================================================================
 * Labels
 * ==================================================================================== */

/** Every user-facing string of the web analytics dashboard: the shared `AnalyticsLabels` plus its subtitle, metric names and KPI group name. */
export type WebAnalyticsLabels = AnalyticsLabels & {
  /** Under the site name. */
  subtitle: (range: string) => string;
  metrics: Record<WebMetric, string>;
  /** Accessible name of the KPI tabs. */
  kpis: string;
  /** The live pill next to the title: "128 online". */
  online: string;
  realtime: string;
  realtimeDescription: string;
  visitorsNow: string;
  activePages: string;
  topPages: string;
  topPagesDescription: string;
  page: string;
  referrers: string;
  referrersDescription: string;
  source: string;
  countries: string;
  countriesDescription: string;
  devices: string;
  devicesDescription: string;
  browsers: string;
  browser: string;
  /** Series of the realtime stream. */
  onlineSeries: string;
  deviceNames: Record<WebDevice, string>;
  channels: Record<WebChannel, string>;
  /** Column header of the time points (table, CSV). */
  date: string;
  /** Visit duration, e.g. 161 → "2m 41s". */
  formatDuration: (seconds: number) => string;
};

/** A traffic channel the dashboard can filter by: direct, organic, referral, social or email. */
export type WebChannel = "direct" | "organic" | "referral" | "social" | "email";

/** The English `WebAnalyticsLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultWebAnalyticsLabels: WebAnalyticsLabels = {
  ...defaultAnalyticsLabels,
  filters: "Filter by channel",
  subtitle: (range) => `Web analytics · ${range}`,
  metrics: {
    visitors: "Unique visitors",
    pageviews: "Pageviews",
    bounceRate: "Bounce rate",
    duration: "Visit duration",
  },
  kpis: "Key metrics: choose what the chart shows",
  online: "online",
  realtime: "Realtime",
  realtimeDescription: "Visitors in the last 60 seconds",
  visitorsNow: "visitors right now",
  activePages: "Active pages",
  topPages: "Top pages",
  topPagesDescription: "By unique visitors",
  page: "Page",
  referrers: "Top referrers",
  referrersDescription: "Where visitors came from",
  source: "Source",
  countries: "Countries",
  countriesDescription: "Unique visitors by country",
  devices: "Devices",
  devicesDescription: "Share of visitors",
  browsers: "Browsers",
  browser: "Browser",
  onlineSeries: "Visitors online",
  deviceNames: { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" },
  channels: { direct: "Direct", organic: "Organic search", referral: "Referral", social: "Social", email: "Email" },
  date: "Date",
  formatDuration: (seconds) => {
    const s = Math.max(0, Math.round(seconds));
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
  },
};

/* ====================================================================================
 * Demo data (deterministic)
 * ==================================================================================== */

/** The traffic channels, in display order. Internal to the analytics kit and its demo data; safe to call on the server. */
export const CHANNELS: readonly WebChannel[] = ["direct", "organic", "referral", "social", "email"];

/* ====================================================================================
 * Component
 * ==================================================================================== */

/** Props of `WebAnalyticsDashboard`: the shared dashboard state props plus the ones below. */
export type WebAnalyticsDashboardProps = AnalyticsDashboardStateProps<WebAnalyticsData> & {
  /** Site shown as the title (`string`, default `"example.com"`). */
  site?: string;
  /** Ranges offered in the header (`readonly AnalyticsRange[]`, default all five). */
  ranges?: readonly AnalyticsRange[];
  /** Channel filter chips. Their values reach `load` as `filters`. Default: the five web channels. */
  filters?: readonly AnalyticsFilter[];
  /** Metric shown by the trend chart (the selected KPI tab). */
  metric?: WebMetric;
  /** The metric shown first when `metric` is not controlled (`WebMetric`, default `"visitors"`). */
  defaultMetric?: WebMetric;
  /** Called when another KPI tab is picked. */
  onMetricChange?: (metric: WebMetric) => void;
  /** Called by Export (default: downloads a CSV of the time series). */
  onExport?: (data: WebAnalyticsData) => void;
  /**
   * Heading level of the title (1 to 6), or `"none"` for a paragraph with no heading role (panel titles follow).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /**
   * Where the realtime chart's history starts (`Date`, default: the current time). On a prerendered
   * page pass a fixed date, so the server's and the browser's first render print the same axis.
   */
  now?: Date;
  /** BCP 47 locale for every number and date (`string`, default the runtime's). */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<WebAnalyticsLabels>`). */
  labels?: Partial<WebAnalyticsLabels>;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

const DEVICE_COLOR: Record<WebDevice, ChartColor> = { desktop: 1, mobile: 3, tablet: 4 };
const REALTIME_SERIES = { key: "value", label: "Visitors", color: 3 as ChartColor };
const WEB_METRICS = ["visitors", "pageviews", "bounceRate", "duration"] as const;

/**
 * Props (see `WebAnalyticsDashboardProps`): `site` (`"example.com"`), `ranges`, `filters` (the five web
 * channels), `metric` / `defaultMetric` (`"visitors"`) / `onMetricChange`, `onExport`, `headingLevel`
 * (`"h2"`), `now`, `locale`, `labels` (`Partial<WebAnalyticsLabels>`), `className`, and the shared
 * state props: `load`, `range` / `defaultRange` / `onRangeChange`, `activeFilters` / `defaultFilters` / `onFiltersChange`, `live` / `defaultLive` / `onLiveChange`, `compare` / `defaultCompare` / `onCompareChange` and `status` (`AnalyticsDashboardStateProps`; defaults: range `30d`, Live on, Compare on).
 * Keyboard: Tab walks the header controls (the range control moves with the arrow keys, filter chips
 * toggle with Space or Enter, then Live, Compare and Export), the KPI tabs (arrow keys, Home and End)
 * and each chart, which is one tab stop whose arrow keys read its points. Panels with a table have a
 * Chart / Table switch.
 * Accessibility: a labelled region named by the title; panels are sections with headings one level
 * below `headingLevel`; loading is announced once ("Loading new data…", "Dashboard updated"), never on
 * every live tick; the Live toggle (and the realtime chart's own Pause button) pauses updates (WCAG 2.2.2); the main charts have a table view; state
 * is never colour alone.
 * Glass and motion: a glass header and glass panels under an adaptive glass budget (frosted solid on
 * weak devices or when frames drop); charts mount near the viewport and draw in once; live ticks pause
 * off-screen and in hidden tabs; reduced motion removes draw-in and rolling digits and reduced
 * transparency makes the glass solid.
 *
 * @example
 * ```tsx
 * import { WebAnalyticsDashboard, type AnalyticsLoader, type WebAnalyticsData } from "@sheenui/theme";
 *
 * const load: AnalyticsLoader<WebAnalyticsData> = async ({ range, filters }, signal) => {
 *   const res = await fetch(`/api/web?range=${range}&channels=${filters.join(",")}`, { signal });
 *   if (!res.ok) throw new Error("Analytics API failed"); // shows the error state with Retry
 *   return (await res.json()) as WebAnalyticsData;
 * };
 *
 * export function Example() {
 *   return <WebAnalyticsDashboard site="example.com" load={load} defaultRange="7d" />;
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function WebAnalyticsDashboard(props: WebAnalyticsDashboardProps) {
  const {
    site = "example.com",
    ranges,
    filters: filtersProp,
    metric: metricProp,
    defaultMetric = "visitors",
    onMetricChange,
    onExport,
    headingLevel,
    now,
    locale,
    labels: labelsProp,
    className,
  } = props;
  const t = useMemo(() => mergeLabels(defaultWebAnalyticsLabels, labelsProp), [labelsProp]);
  const dash = useAnalyticsDashboard(props, {
    defaults: { range: "30d", live: true, compare: true },
    isEmpty: (d) => d.points.length === 0,
  });
  const { data, query: loaded, range, compare, live, running, ready, busy, rootRef } = dash;
  const [metric, setMetric] = useControllable(metricProp, defaultMetric, onMetricChange);
  const headingId = useId();
  const trendId = useId();
  const pinned = props.status !== undefined && props.status !== "auto";

  const filters = useMemo(
    () => filtersProp ?? CHANNELS.map((c) => ({ value: c, label: t.channels[c] })),
    [filtersProp, t],
  );

  const fmt = useMemo(() => {
    const compact = compactFormat(locale);
    const full = new Intl.NumberFormat(locale ?? "en");
    const percent = new Intl.NumberFormat(locale ?? "en", { style: "percent", maximumFractionDigits: 1 });
    return {
      compact,
      full: (n: number) => full.format(Math.round(n)),
      metric: {
        visitors: compact,
        pageviews: compact,
        bounceRate: (n: number) => percent.format(n),
        duration: t.formatDuration,
      } satisfies Record<WebMetric, (n: number) => string>,
    };
  }, [locale, t]);

  const kpis: KpiItem[] | null = useMemo(() => {
    if (!data || !ready) return null;
    return WEB_METRICS.map((m) => ({
      id: m,
      label: t.metrics[m],
      value: data.totals[m],
      previous: data.previousTotals?.[m] ?? null,
      trend: data.points.map((p) => p.current[m]),
      format: fmt.metric[m],
      goodWhen: m === "bounceRate" ? "down" : "up",
    }));
  }, [data, ready, t, fmt]);

  const trend: TrendDatum[] = useMemo(
    () =>
      data
        ? data.points.map((p) => ({
            label: p.label,
            long: p.long,
            value: p.current[metric],
            previous: p.previous?.[metric] ?? null,
          }))
        : [],
    [data, metric],
  );

  const handleExport = () => {
    if (!data) return;
    if (onExport) {
      onExport(data);
      return;
    }
    exportCsv(
      `${site}-${loaded?.range ?? range}.csv`,
      [
        t.date,
        ...WEB_METRICS.map((m) => t.metrics[m]),
        ...WEB_METRICS.map((m) => `${t.metrics[m]} (${t.previousPeriod})`),
      ],
      data.points.map((p) => [
        p.long ?? p.label,
        ...WEB_METRICS.map((m) => round2(p.current[m])),
        ...WEB_METRICS.map((m) => (p.previous ? round2(p.previous[m]) : null)),
      ]),
    );
  };

  // Labels follow the data on screen (the header's control already shows the range being loaded).
  const rangeName = t.rangeNames[loaded?.range ?? range];
  // Laid out from the first paint (invisible until the data arrives, with a three-digit stand-in), so the pill's
  // arrival never shifts the header.
  const pillShown = Boolean(data && ready);
  const statusPill = (
    <span
      aria-hidden={pillShown ? undefined : true}
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-sheen-full bg-sheen-success-soft px-2.5 text-xs font-medium text-sheen-success-text",
        !pillShown && "invisible",
      )}
    >
      <LiveDot on={running} />
      <RollingNumber
        key={pillShown ? "data" : "stand-in"}
        value={data?.realtime.visitors ?? 888}
        format={fmt.full}
        className="font-semibold"
      />
      <span>{t.online}</span>
    </span>
  );

  return (
    <div ref={rootRef} data-slot="web-analytics-dashboard" className={cn("w-full min-w-0", className)}>
      <AnalyticsShell
        title={site}
        subtitle={t.subtitle(rangeName)}
        icon={<GlobeIcon />}
        status={statusPill}
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
              selected={metric}
              onSelect={(id) => setMetric(id as WebMetric)}
              controls={trendId}
              locale={locale}
              labels={t}
              aria-label={t.kpis}
              cellClassName="min-h-[177.5px] @lg:min-h-[149.5px] @2xl:min-h-[162.5px] @3xl:min-h-[191px] @5xl:min-h-[163px]"
            />
            <AnalyticsGrid>
              <AnalyticsPanel
                id={trendId}
                title={t.metrics[metric]}
                description={rangeName}
                legend={trendLegend(t.metrics[metric], 1, compare, t.previousPeriod)}
                span={{ md: 2, lg: 3 }}
                minHeight={328}
                ready={ready}
                deps={[trend, compare, running, metric, fmt, t, locale]}
                index={0}
                count={6}
                labels={t}
                table={
                  <TrendTable
                    data={trend}
                    seriesLabel={t.metrics[metric]}
                    compare={compare}
                    format={fmt.metric[metric]}
                    indexLabel={t.date}
                    locale={locale}
                    labels={t}
                    caption={`${t.metrics[metric]}, ${rangeName}`}
                  />
                }
              >
                {() => (
                  <TrendChart
                    data={trend}
                    seriesLabel={t.metrics[metric]}
                    compare={compare}
                    live={running && (metric === "visitors" || metric === "pageviews")}
                    height={300}
                    format={fmt.metric[metric]}
                    locale={locale}
                    labels={t}
                    aria-label={`${t.metrics[metric]}, ${rangeName}`}
                  />
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.realtime}
                description={t.realtimeDescription}
                span={{ md: 2, lg: 1 }}
                minHeight={300}
                ready={ready}
                deps={[data?.realtime, live, pinned, fmt, t, locale]}
                index={1}
                count={6}
                labels={t}
                bodyClassName="@container min-h-[372px]! @lg:min-h-[300px]! @5xl:min-h-[400px]!"
              >
                {() =>
                  data && (
                    <Realtime
                      visitors={data.realtime.visitors}
                      pages={data.realtime.pages}
                      history={data.realtime.history}
                      live={live && !pinned}
                      onLiveChange={dash.setLive}
                      locale={locale}
                      labels={t}
                      format={fmt.compact}
                      startAt={now?.getTime()}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.topPages}
                description={t.topPagesDescription}
                span={{ md: 1, lg: 2 }}
                minHeight={300}
                ready={ready}
                deps={[data?.pages, t, locale]}
                index={2}
                count={6}
                labels={t}
                table={
                  data && (
                    <BarListTable
                      data={data.pages}
                      locale={locale}
                      caption={`${t.topPages}, ${t.topPagesDescription}`}
                      headers={{ name: t.page, value: t.metrics.visitors }}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <BarList
                      data={data.pages}
                      limit={6}
                      color={1}
                      locale={locale}
                      nameHeader={t.page}
                      valueHeader={t.metrics.visitors}
                      aria-label={t.topPages}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.referrers}
                description={t.referrersDescription}
                span={{ md: 1, lg: 2 }}
                minHeight={300}
                ready={ready}
                deps={[data?.referrers, t, locale]}
                index={3}
                count={6}
                labels={t}
                table={
                  data && (
                    <BarListTable
                      data={data.referrers}
                      locale={locale}
                      caption={`${t.referrers}, ${t.referrersDescription}`}
                      headers={{ name: t.source, value: t.metrics.visitors }}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <BarList
                      data={data.referrers}
                      limit={6}
                      color={7}
                      locale={locale}
                      showShare
                      nameHeader={t.source}
                      valueHeader={t.metrics.visitors}
                      aria-label={t.referrers}
                    />
                  )
                }
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.devices}
                description={t.devicesDescription}
                span={{ md: 2, lg: 1 }}
                minHeight={260}
                ready={ready}
                deps={[data?.devices, data?.browsers, fmt, t, locale]}
                index={4}
                count={6}
                labels={t}
                table={
                  data && (
                    <div className="flex flex-col gap-5">
                      <PieTable
                        data={deviceSlices(data, t)}
                        format={fmt.full}
                        caption={`${t.devices}, ${t.devicesDescription}`}
                        indexLabel={t.devices}
                      />
                      <BarListTable
                        data={data.browsers}
                        sortOrder="none"
                        locale={locale}
                        caption={t.browsers}
                        headers={{ name: t.browser, value: t.metrics.visitors }}
                      />
                    </div>
                  )
                }
                bodyClassName="@container min-h-[396px]! @lg:min-h-[284px]! @min-[700px]:min-h-[260px]! @5xl:min-h-[512px]!"
              >
                {() => data && <Devices data={data} labels={t} format={fmt.compact} locale={locale} />}
              </AnalyticsPanel>

              <AnalyticsPanel
                title={t.countries}
                description={t.countriesDescription}
                span={{ md: 2, lg: 3 }}
                minHeight={300}
                bodyClassName="min-h-[max(300px,calc((100cqw-42px)*0.4375+54px))]! @5xl:min-h-[calc((75cqw-46px)*0.4375+54px)]!"
                ready={ready}
                deps={[data?.countries, t, locale]}
                index={5}
                count={6}
                labels={t}
                table={
                  data && (
                    <WorldMapTable
                      data={data.countries}
                      locale={locale}
                      valueLabel={t.metrics.visitors}
                      share
                      caption={`${t.countries}, ${t.countriesDescription}`}
                    />
                  )
                }
              >
                {() =>
                  data && (
                    <WorldMap
                      data={data.countries}
                      scaleType="log"
                      color={1}
                      locale={locale}
                      valueLabel={t.metrics.visitors}
                      aria-label={t.countriesDescription}
                    />
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

const round2 = (n: number) => Math.round(n * 100) / 100;

function deviceSlices(data: WebAnalyticsData, t: WebAnalyticsLabels): DonutSlice[] {
  return data.devices.map((d) => ({ label: t.deviceNames[d.device], value: d.value, color: DEVICE_COLOR[d.device] }));
}

const Devices = memo(function Devices({
  data,
  labels,
  format,
  locale,
}: {
  data: WebAnalyticsData;
  labels: WebAnalyticsLabels;
  format: (n: number) => string;
  locale?: string;
}) {
  const slices = useMemo(() => deviceSlices(data, labels), [data, labels]);
  return (
    <div className="flex min-w-0 flex-col gap-6 @lg:flex-row @lg:items-center">
      <DonutChart
        data={slices}
        diameter={168}
        labels={{ center: labels.metrics.visitors }}
        format={format}
        aria-label={`${labels.devices}: ${labels.devicesDescription}`}
        className="@lg:flex-1"
      />
      <div className="min-w-0 @lg:flex-1">
        <p className="mb-2 text-xs font-medium text-sheen-fg-muted">{labels.browsers}</p>
        <BarList
          data={data.browsers}
          limit={4}
          color={3}
          locale={locale}
          sortOrder="none"
          aria-label={labels.browsers}
        />
      </div>
    </div>
  );
});

/* ---------- Realtime: number + stream + active pages ---------- */

/**
 * Its own small component: the stream re-renders only this panel, once per sample. The stream
 * rests while Live is off, off-screen or in a hidden tab (StreamingChart / useStreamingData).
 */
const Realtime = memo(function Realtime({
  visitors,
  pages,
  history,
  live,
  onLiveChange,
  locale,
  labels,
  format,
  startAt,
}: {
  visitors: number;
  pages: BarListItem[];
  /** Past samples from the data (`realtime.history`); the chart is empty until live updates arrive when there are none. */
  history?: number[];
  live: boolean;
  /** The chart's own Pause / Resume button turns the dashboard's Live toggle off / on. */
  onLiveChange: (live: boolean) => void;
  locale?: string;
  labels: WebAnalyticsLabels;
  format: (n: number) => string;
  /** Where the stream's history starts, in epoch ms (a fixed value keeps prerendered HTML and hydration identical). */
  startAt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useLoopPlayback(ref, { respectReducedMotion: false });
  const play = useInViewSettled(ref, { amount: 0.5 });
  const full = useMemo(() => {
    const f = new Intl.NumberFormat(locale ?? "en");
    return (n: number) => f.format(Math.round(n));
  }, [locale]);
  const latestRef = useLatest(visitors);
  // The history is read once, when the stream is created; later samples are the live count itself, so the
  // newest value always matches the big number.
  const [past] = useState(() => history ?? []);
  const source = useCallback((_time: number, i: number) => past[i] ?? latestRef.current, [past, latestRef]);
  const stream = useStreamingData(source, {
    rate: 2000,
    capacity: 90,
    history: past.length,
    enabled: live,
    idle: !live || !visible,
    startAt,
  });
  const series = useMemo(() => [{ ...REALTIME_SERIES, label: labels.onlineSeries }], [labels]);

  return (
    <div ref={ref} className="flex min-w-0 flex-col gap-4 @lg:flex-row @lg:items-stretch @lg:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <RollingNumber
            value={visitors}
            format={full}
            play={play}
            className="text-4xl leading-none font-semibold tracking-tight"
          />
          <span className="text-sm text-sheen-fg-muted">{labels.visitorsNow}</span>
        </div>
        <StreamingChart
          data={stream}
          series={series}
          rate={2000}
          window={30}
          height={110}
          paused={!live}
          onPausedChange={(paused) => onLiveChange(!paused)}
          format={format}
          locale={locale}
          aria-label={labels.realtimeDescription}
        />
      </div>
      <div className="min-w-0 @lg:w-56">
        <p className="mb-2 text-xs font-medium text-sheen-fg-muted">{labels.activePages}</p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {pages.slice(0, 4).map((p) => (
            <li key={p.name} className="flex min-w-0 items-center justify-between gap-3">
              <span className="truncate font-sheen-mono text-xs">{p.name}</span>
              <span className="font-semibold tabular-nums">{format(p.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

function GlobeIcon(): ReactNode {
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5S14.4 18.1 12 20.5M12 3.5C9.6 5.9 8.4 8.7 8.4 12s1.2 6.1 3.6 8.5" />
    </svg>
  );
}
