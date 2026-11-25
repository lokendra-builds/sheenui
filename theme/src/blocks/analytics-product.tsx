"use client";

import { cn } from "../lib/cn";
import { useControllable } from "../hooks/use-controllable";
import type { AnalyticsStatus } from "./analytics/data";
import type { HeadingLevelOption } from "../lib/heading";
import { memo, useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useLatest } from "../hooks/use-latest";

import { SankeyChart, SankeyTable, type SankeyLink, type SankeyNode } from "../components/charts/sankey-chart";
import { FunnelChart, FunnelTable, type FunnelStage } from "../components/charts/funnel-chart";
import { BarList, BarListTable, type BarListItem } from "../components/charts/bar-list";
import { CohortChart, CohortTable, type CohortRow } from "../components/charts/cohort-chart";
import { CalendarHeatmap, CalendarHeatmapTable, type CalendarDatum } from "../components/charts/calendar-heatmap";
import {
  AnalyticsGrid,
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  Cascade,
  DeltaBadge,
  KpiStrip,
  LiveDot,
  RollingNumber,
  changeRatio,
  defaultAnalyticsLabels,
  exportCsv,
  mergeLabels,
  useDashboardData,
  useLiveTicker,
  type AnalyticsGlass,
  type AnalyticsLabels,
  type AnalyticsRange,
  type KpiItem,
} from "./analytics-kit";

/* ======================================================================
 * Data
 * ====================================================================== */

/** A platform the product analytics dashboard can filter by: web, iOS or Android. */
export type ProductPlatform = "web" | "ios" | "android";

/** What the dashboard asks its loader for. */
export type ProductQuery = {
  range: AnalyticsRange;
  /** Selected platforms; empty = all of them. */
  platforms: ProductPlatform[];
  /** "Now" for the date axes (the last day shown). */
  now: Date;
  locale?: string;
};

/** A figure for the current period and the one before it, plus its trend (oldest first). */
export type ProductFigure = { value: number; previous: number; trend: number[] };

/** The data the product analytics dashboard shows for one query: DAU / WAU / MAU figures, the user-journey flow, activation funnels, feature adoption, retention cohorts, daily events and the live events-per-minute rate. */
export type ProductData = {
  dau: ProductFigure;
  wau: ProductFigure;
  mau: ProductFigure;
  /** User journey: where sign-ups come from and where they end up. */
  flow: { nodes: SankeyNode[]; links: SankeyLink[] };
  /** Activation funnel, this period and the previous one. */
  funnel: FunnelStage[];
  funnelPrevious: FunnelStage[];
  /** Share of active users (0–100) who used each feature. */
  adoption: BarListItem[];
  /** Retention cohorts (user counts per period). */
  cohorts: CohortRow[];
  cohortUnit: "week" | "month";
  /** Tracked events per day, and the days the calendar shows. */
  events: CalendarDatum[];
  eventsStart: string;
  eventsEnd: string;
  /** Events per minute right now (shown in live mode). */
  eventsPerMinute: number;
};

/** Each platform's share of the sample audience. Internal to the analytics kit and its demo data; safe to call on the server. */
export const PLATFORM_SHARE: Record<ProductPlatform, number> = { web: 0.56, ios: 0.27, android: 0.17 };
/** Formats a local date as `YYYY-MM-DD`. Internal to the analytics kit and its demo data; safe to call on the server. */
export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* ======================================================================
 * Labels
 * ====================================================================== */

/** Every user-facing string of the product analytics dashboard: the shared `AnalyticsLabels` plus its eyebrow, title and card texts. */
export type ProductLabels = AnalyticsLabels & {
  eyebrow: string;
  title: string;
  description: string;
  platform: string;
  platforms: Record<ProductPlatform, string>;
  dau: string;
  dauHint: string;
  wau: string;
  wauHint: string;
  mau: string;
  mauHint: string;
  stickiness: string;
  stickinessHint: string;
  /** Live figure in the header: "1,284 events/min". */
  eventsPerMinute: (value: ReactNode) => ReactNode;
  flowTitle: string;
  flowDescription: string;
  /** Sankey aside: "10,200 sign-ups". */
  signups: (value: string) => string;
  funnelTitle: string;
  funnelDescription: string;
  /** Funnel aside: "3.8% activated". */
  converted: (percent: string) => string;
  adoptionTitle: string;
  adoptionDescription: string;
  feature: string;
  users: string;
  retentionTitle: string;
  retentionDescription: (unit: "week" | "month") => string;
  periodWeek: (i: number) => string;
  periodMonth: (i: number) => string;
  eventsTitle: string;
  eventsDescription: string;
  /** What a calendar value counts. */
  eventsUnit: string;
  /** Calendar aside: "412K events in the last 30 days". */
  eventsTotal: (value: string, range: string) => string;
  /** Adoption footer: features used per active user, and the most used one. */
  featuresPerUser: string;
  mostUsed: string;
  /** File name of the CSV export (without extension). */
  exportFile: string;
};

/** The English `ProductLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultProductLabels: ProductLabels = {
  ...defaultAnalyticsLabels,
  eyebrow: "Product analytics",
  title: "Engagement overview",
  description: "Who's active, how they found you, where they drop off and what keeps them coming back.",
  platform: "Platform",
  platforms: { web: "Web", ios: "iOS", android: "Android" },
  dau: "Daily active users",
  dauHint: "DAU · average per day",
  wau: "Weekly active users",
  wauHint: "WAU · rolling 7 days",
  mau: "Monthly active users",
  mauHint: "MAU · rolling 30 days",
  stickiness: "Stickiness",
  stickinessHint: "DAU ÷ MAU",
  eventsPerMinute: (value) => <>{value} events/min</>,
  flowTitle: "User journey",
  flowDescription: "From first visit through onboarding to activation. Hover or tap a step to trace it.",
  signups: (value) => `${value} sign-ups`,
  funnelTitle: "Activation funnel",
  funnelDescription: "Visitors who reached each step.",
  converted: (percent) => `${percent} activated`,
  adoptionTitle: "Feature adoption",
  adoptionDescription: "Share of active users who used each feature.",
  feature: "Feature",
  users: "Active users",
  retentionTitle: "Retention",
  retentionDescription: (unit) => `Users still active, by the ${unit} they signed up.`,
  periodWeek: (i) => `Week ${i}`,
  periodMonth: (i) => `Month ${i}`,
  eventsTitle: "Event volume",
  eventsDescription: "Tracked events per day over the last 12 months.",
  eventsUnit: "events",
  eventsTotal: (value, range) => `${value} events · ${range.toLowerCase()}`,
  featuresPerUser: "Features per active user",
  mostUsed: "Most used",
  exportFile: "product-analytics",
};

/* ======================================================================
 * Component
 * ====================================================================== */

/** Props of `ProductDashboard`. Each controllable value comes as a trio: `x`, `defaultX`, `onXChange`. */
export type ProductDashboardProps = {
  /** Loads the data for a query: return it, or a promise of it. Required: there is no built-in demo data (see `@sheenui/theme/demo-data`). */
  load: (query: ProductQuery, signal: AbortSignal) => ProductData | Promise<ProductData>;
  /** Force a state for demos and tests: "loading", "empty" or "error". "auto" (default) follows the data. */
  status?: AnalyticsStatus;
  /** Evolves the data while Live is on. Default: none (Live does nothing until you pass one). */
  liveStep?: ((data: ProductData, tick: number) => ProductData) | null;
  /** Milliseconds between live updates. Default 2000. */
  liveInterval?: number;
  /** Sets the active range when controlled. */
  range?: AnalyticsRange;
  /** The range at first when `range` is not controlled (`AnalyticsRange`, default `"30d"`). */
  defaultRange?: AnalyticsRange;
  /** Called when the range changes. */
  onRangeChange?: (range: AnalyticsRange) => void;
  /** The platform chips that are on (controlled); none selected means all platforms. */
  platforms?: ProductPlatform[];
  /** The platforms on at first when `platforms` is not controlled (default none, i.e. all). */
  defaultPlatforms?: ProductPlatform[];
  /** Called when the platform chips change. */
  onPlatformsChange?: (platforms: ProductPlatform[]) => void;
  /** Whether live updates run (controlled). */
  live?: boolean;
  /** Whether live updates are on at first (`boolean`, default `true`). */
  defaultLive?: boolean;
  /** Called when the Live toggle changes. */
  onLiveChange?: (live: boolean) => void;
  /** Whether the previous period is shown (controlled). */
  compare?: boolean;
  /** Whether the comparison is on at first (`boolean`, default `false`). */
  defaultCompare?: boolean;
  /** Called when the Compare toggle changes. */
  onCompareChange?: (compare: boolean) => void;
  /** Called by the Export button. Default: downloads the figures as CSV. */
  onExport?: (data: ProductData, query: ProductQuery) => void;
  /** "Now" for the date axes. Default: the current date. On a prerendered page pass a fixed date, so the server's and the browser's first render print the same axes. */
  now?: Date;
  /** BCP 47 locale for every number and date (`string`, default the runtime's). */
  locale?: string;
  /** Heading level of the title (1 to 6, default 2), or `"none"` for a paragraph with no heading role (panel titles follow). */
  headingLevel?: HeadingLevelOption;
  /**
   * Glass on the cards: "auto" (default) keeps real glass while the device keeps up and falls back
   * to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one.
   */
  glass?: AnalyticsGlass;
  /** Overrides for the built-in English strings (`Partial<ProductLabels>`). */
  labels?: Partial<ProductLabels>;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

const NO_PLATFORMS: ProductPlatform[] = [];

/**
 * A full product-analytics dashboard: active users and stickiness, the sign-up journey (sankey),
 * the activation funnel, feature adoption, retention cohorts and daily event volume.
 *
 * - The time range re-loads every chart; old data stays on screen under a veil until the new data
 *   lands, then every chart tweens to it (cards take it one after another).
 * - Live: figures drift every couple of seconds with rolling numbers. It pauses off-screen and in
 *   background tabs, and the switch is the pause button (WCAG 2.2.2).
 * - Compare shows the previous period beside every figure and the funnel's conversion.
 * - Every chart has a table view (Chart / Table tabs), and every string is in `labels`.
 *
 * Props (see `ProductDashboardProps`): `load` (required), `liveStep`, `liveInterval`
 * (`2000` ms), `range` / `defaultRange` (`"30d"`) / `onRangeChange`, `platforms` / `defaultPlatforms` /
 * `onPlatformsChange`, `live` / `defaultLive` (`true`) / `onLiveChange`, `compare` / `defaultCompare`
 * (`false`) / `onCompareChange`, `onExport`, `now`, `locale`, `headingLevel` (`"h2"`), `glass` (`"auto"`),
 * `labels` (`Partial<ProductLabels>`), `className`.
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
 *
 * @example
 * ```tsx
 * import { ProductDashboard, type ProductData, type ProductQuery } from "@sheenui/theme";
 *
 * async function load(query: ProductQuery): Promise<ProductData> {
 *   const res = await fetch(`/api/product?range=${query.range}`);
 *   return (await res.json()) as ProductData;
 * }
 *
 * export function Example() {
 *   return <ProductDashboard load={load} defaultLive={false} />;
 * }
 * ```
 *
 * @see /dashboards/product
 */
export function ProductDashboard({
  load,
  status: statusProp = "auto",
  liveStep = null,
  liveInterval = 2000,
  range: rangeProp,
  defaultRange = "30d",
  onRangeChange,
  platforms: platformsProp,
  defaultPlatforms = NO_PLATFORMS,
  onPlatformsChange,
  live: liveProp,
  defaultLive = true,
  onLiveChange,
  compare: compareProp,
  defaultCompare = false,
  onCompareChange,
  onExport,
  now: nowProp,
  locale,
  headingLevel = 2,
  glass = "auto",
  labels: labelOverrides,
  className,
}: ProductDashboardProps) {
  const L = useMemo<ProductLabels>(
    () => ({
      ...mergeLabels(defaultProductLabels, labelOverrides),
      platforms: { ...defaultProductLabels.platforms, ...labelOverrides?.platforms },
    }),
    [labelOverrides],
  );
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [range, setRange] = useControllable(rangeProp, defaultRange, onRangeChange);
  const [platforms, setPlatforms] = useControllable(platformsProp, defaultPlatforms, onPlatformsChange);
  const [live, setLive] = useControllable(liveProp, defaultLive, onLiveChange);
  const [compare, setCompare] = useControllable(compareProp, defaultCompare, onCompareChange);

  // "Now" is fixed for the life of the dashboard (a new day doesn't silently re-load it).
  const [mountNow] = useState(() => new Date());
  const now = nowProp ?? mountNow;
  const nowKey = isoDay(now);
  const platformsKey = platforms.join(",");
  // Not memoised: the loader reads the newest query through a ref and a request starts only when the key below changes.
  const query: ProductQuery = { range, platforms, now, locale };
  const {
    data,
    status: dataStatus,
    retry,
    update,
    query: dataQuery,
  } = useDashboardData(load, query, `${range}|${platformsKey}|${nowKey}|${locale ?? ""}`);
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
  const shownRange = dataQuery?.range ?? range;

  const kpis = useMemo<KpiItem[]>(() => {
    const blank: ProductFigure = { value: 0, previous: 0, trend: [] };
    const dau = data?.dau ?? blank;
    const wau = data?.wau ?? blank;
    const mau = data?.mau ?? blank;
    const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);
    const count = { maximumFractionDigits: 0 } satisfies Intl.NumberFormatOptions;
    return [
      {
        id: "dau",
        label: L.dau,
        hint: L.dauHint,
        value: dau.value,
        previous: dau.previous,
        trend: dau.trend,
        format: count,
      },
      {
        id: "wau",
        label: L.wau,
        hint: L.wauHint,
        value: wau.value,
        previous: wau.previous,
        trend: wau.trend,
        format: count,
      },
      {
        id: "mau",
        label: L.mau,
        hint: L.mauHint,
        value: mau.value,
        previous: mau.previous,
        trend: mau.trend,
        format: count,
      },
      {
        id: "stickiness",
        label: L.stickiness,
        hint: L.stickinessHint,
        value: ratio(dau.value, mau.value),
        previous: ratio(dau.previous, mau.previous),
        // DAU / MAU along the trend (MAU's trend is the matching rolling window).
        trend: dau.trend.map((d, i) => Math.round(ratio(d, mau.trend[i] ?? mau.value) * 1000) / 10),
        format: { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 },
      },
    ];
  }, [data?.dau, data?.wau, data?.mau, L]);

  // Stable handlers and props: the memoised header controls and panels skip every render that
  // doesn't concern them (live ticks touch the KPI strip only).
  const filters = useMemo(
    () => (Object.keys(PLATFORM_SHARE) as ProductPlatform[]).map((p) => ({ value: p, label: L.platforms[p] })),
    [L],
  );
  const onFilters = useCallback((next: string[]) => setPlatforms(next as ProductPlatform[]), [setPlatforms]);
  const latestRef = useLatest({ data, query, kpis, onExport, range });
  const exportData = useCallback(() => {
    const { data: d, query: q, kpis: k, onExport: custom, range: r } = latestRef.current;
    if (!d) return;
    if (custom) {
      custom(d, q);
      return;
    }
    const rows: (string | number)[][] = [];
    for (const item of k) rows.push(["Metrics", item.label, item.value, item.previous ?? ""]);
    d.funnel.forEach((s, i) => rows.push([L.funnelTitle, s.label, s.value, d.funnelPrevious[i]?.value ?? ""]));
    for (const a of d.adoption) rows.push([L.adoptionTitle, a.name, `${a.value}%`, ""]);
    for (const l of d.flow.links) rows.push([L.flowTitle, `${l.source} → ${l.target}`, l.value, ""]);
    for (const e of d.events) rows.push([L.eventsTitle, String(e.date), e.value, ""]);
    exportCsv(`${L.exportFile}-${r}.csv`, ["Section", "Item", "Value", "Previous period"], rows);
  }, [L, latestRef]);

  // Tuples memoised by their parts, so a live tick that leaves them alone keeps their identity.
  const funnel = data?.funnel;
  const funnelPrevious = data?.funnelPrevious;
  const cohorts = data?.cohorts;
  const cohortUnit = data?.cohortUnit;
  const events = data?.events;
  const eventsStart = data?.eventsStart;
  const eventsEnd = data?.eventsEnd;
  const funnelNow = useMemo(
    () => (funnel && funnelPrevious ? ([funnel, funnelPrevious] as const) : null),
    [funnel, funnelPrevious],
  );
  const cohortNow = useMemo(
    () => (cohorts && cohortUnit !== undefined ? ([cohorts, cohortUnit] as const) : null),
    [cohorts, cohortUnit],
  );
  const eventsNow = useMemo(
    () =>
      events && eventsStart !== undefined && eventsEnd !== undefined
        ? ([events, eventsStart, eventsEnd, shownRange] as const)
        : null,
    [events, eventsStart, eventsEnd, shownRange],
  );

  // Laid out from the first paint (invisible until the data arrives, with a three-digit stand-in), so the pill's
  // arrival never wraps the title row and pushes the header down.
  const statusPill = live ? (
    <span
      aria-hidden={data ? undefined : true}
      className={`inline-flex h-7 items-center gap-2 rounded-sheen-full bg-sheen-success-soft px-2.5 text-xs font-medium text-sheen-success-text tabular-nums${data ? "" : " invisible"}`}
    >
      <LiveDot on={liveRunning} />
      {L.eventsPerMinute(
        <RollingNumber
          key={data ? "data" : "stand-in"}
          value={data?.eventsPerMinute ?? 888}
          locale={locale}
          rollIn={false}
          duration={0.5}
          className="font-semibold"
        />,
      )}
    </span>
  ) : null;

  return (
    <AnalyticsShell
      ref={rootRef}
      headingId={titleId}
      headingLevel={headingLevel}
      title={L.title}
      subtitle={L.description}
      icon={<PulseIcon />}
      status={statusPill}
      range={range}
      onRangeChange={setRange}
      filters={filters}
      activeFilters={platforms}
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
      ) : statusProp === "empty" || (data && !busy && isProductEmpty(data)) ? (
        <AnalyticsState kind="empty" labels={L} />
      ) : (
        <>
          <KpiStrip
            items={kpis}
            compare={compare}
            locale={locale}
            loading={loading}
            labels={L}
            aria-label={L.kpis}
            cellClassName="min-h-[193.5px] @lg:min-h-[165.5px] @2xl:min-h-[178.5px] @3xl:min-h-[207px] @5xl:min-h-[179px]"
          />
          <AnalyticsGrid>
            {/* Each panel takes new data a beat after the one before (only its own wrapper re-renders). */}
            <Cascade value={data?.flow ?? null} index={1}>
              {(flow) => <FlowCard flow={flow} locale={locale} labels={L} />}
            </Cascade>
            <Cascade value={funnelNow} index={2}>
              {(pair) => <FunnelCard pair={pair} compare={compare} locale={locale} labels={L} />}
            </Cascade>
            <Cascade value={data?.adoption ?? null} index={3}>
              {(items) => <AdoptionCard items={items} locale={locale} labels={L} />}
            </Cascade>
            <Cascade value={cohortNow} index={4}>
              {(pair) => <RetentionCard pair={pair} locale={locale} labels={L} />}
            </Cascade>
            <Cascade value={eventsNow} index={5}>
              {(set) => <EventsCard set={set} locale={locale} labels={L} />}
            </Cascade>
          </AnalyticsGrid>
        </>
      )}
    </AnalyticsShell>
  );
}

/** Nothing to chart at all (an account with no events): the dashboard says so once, instead of five empty panels. */
function isProductEmpty(data: ProductData) {
  return (
    data.flow.links.length === 0 &&
    data.funnel.length === 0 &&
    data.adoption.length === 0 &&
    data.cohorts.length === 0 &&
    data.events.length === 0
  );
}

/* ---------- Cards ----------
 * Memoised, and each memoises its chart and table elements on the data: a loading veil (busy)
 * re-renders the card frame only, never the chart inside it.
 */

type CardBase = { locale?: string; labels: ProductLabels };

const FlowCard = memo(function FlowCard({ flow, locale, labels: L }: CardBase & { flow: ProductData["flow"] | null }) {
  const fmt = useNumber(locale);
  const signups = flow?.links.filter((l) => l.target === "signup").reduce((s, l) => s + l.value, 0) ?? 0;
  const chart = useMemo(
    () =>
      flow && (
        <SankeyChart
          links={flow.links}
          nodes={flow.nodes}
          height={340}
          locale={locale}
          aria-label={`${L.flowTitle}: ${L.flowDescription}`}
        />
      ),
    [flow, locale, L],
  );
  const table = useMemo(
    () => flow && <SankeyTable links={flow.links} nodes={flow.nodes} locale={locale} caption={L.flowTitle} />,
    [flow, locale, L],
  );
  return (
    <AnalyticsPanel
      index={1}
      title={L.flowTitle}
      description={L.flowDescription}
      // Always laid out (invisible until the data arrives, with a wide stand-in number), so the header wraps the same way
      // before and after the load and the card never grows by a line when the figure appears.
      aside={
        <span className={cn("text-sm font-medium text-sheen-fg-muted tabular-nums", !flow && "invisible")}>
          {L.signups(fmt.format(flow ? signups : 888_888))}
        </span>
      }
      table={table}
      minHeight={340}
      ready={flow !== null}
      labels={L}
      span={{ md: 2, lg: 4 }}
    >
      {() => chart}
    </AnalyticsPanel>
  );
});

const FunnelCard = memo(function FunnelCard({
  pair,
  compare,
  locale,
  labels: L,
}: CardBase & { pair: readonly [FunnelStage[], FunnelStage[]] | null; compare: boolean }) {
  const pct = usePercent(locale);
  const rate = (s: readonly FunnelStage[]) =>
    s.length > 1 && (s[0]?.value ?? 0) > 0 ? (s[s.length - 1]?.value ?? 0) / (s[0]?.value ?? 1) : 0;
  const now = pair ? rate(pair[0]) : 0;
  const before = pair ? rate(pair[1]) : 0;
  const chart = useMemo(
    () => pair && <FunnelChart data={pair[0]} color={2} locale={locale} aria-label={L.funnelTitle} />,
    [pair, locale, L],
  );
  const table = useMemo(
    () => pair && <FunnelTable data={pair[0]} locale={locale} caption={L.funnelTitle} />,
    [pair, locale, L],
  );
  return (
    <AnalyticsPanel
      index={2}
      title={L.funnelTitle}
      description={L.funnelDescription}
      // Laid out before the data too (invisible, stand-in figures): the header wraps the same way either side of the load.
      aside={
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-medium text-sheen-fg-muted tabular-nums",
            !pair && "invisible",
          )}
        >
          {L.converted(pct.format(pair ? now : 0.888))}
          {compare && (
            <DeltaBadge change={pair ? changeRatio(now, before) : 0.088} locale={locale} srLabel={L.change} />
          )}
        </span>
      }
      table={table}
      minHeight={498}
      ready={pair !== null}
      labels={L}
      span={{ lg: 2 }}
    >
      {() => chart}
    </AnalyticsPanel>
  );
});

const AdoptionCard = memo(function AdoptionCard({
  items,
  locale,
  labels: L,
}: CardBase & { items: BarListItem[] | null }) {
  const pct = usePercent(locale, 0);
  const perUser = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    [locale],
  );
  const body = useMemo(() => {
    if (!items) return null;
    const format = (n: number) => pct.format(n / 100);
    const top = [...items].sort((a, b) => b.value - a.value)[0];
    return (
      <div className="flex h-full flex-col gap-4">
        <BarList
          data={items}
          color={3}
          format={format}
          locale={locale}
          nameHeader={L.feature}
          valueHeader={L.users}
          aria-label={L.adoptionTitle}
        />
        {items.length > 0 && (
          <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-sheen-border pt-4 text-sm">
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="truncate text-xs text-sheen-fg-muted">{L.featuresPerUser}</dt>
              {/* Expected features per user: the sum of the adoption shares. */}
              <dd className="text-lg font-semibold tabular-nums">
                {perUser.format(items.reduce((s, i) => s + i.value, 0) / 100)}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="truncate text-xs text-sheen-fg-muted">{L.mostUsed}</dt>
              <dd className="truncate text-lg font-semibold">{top?.name}</dd>
            </div>
          </dl>
        )}
      </div>
    );
  }, [items, locale, L, pct, perUser]);
  const table = useMemo(
    () =>
      items && (
        <BarListTable
          data={items}
          format={(n) => pct.format(n / 100)}
          locale={locale}
          caption={L.adoptionTitle}
          headers={{ name: L.feature, value: L.users }}
        />
      ),
    [items, locale, L, pct],
  );
  return (
    <AnalyticsPanel
      index={3}
      title={L.adoptionTitle}
      description={L.adoptionDescription}
      table={table}
      minHeight={387}
      ready={items !== null}
      labels={L}
      span={{ lg: 2 }}
      bodyClassName="flex flex-col"
    >
      {() => body}
    </AnalyticsPanel>
  );
});

const RetentionCard = memo(function RetentionCard({
  pair,
  locale,
  labels: L,
}: CardBase & { pair: readonly [CohortRow[], "week" | "month"] | null }) {
  const unit = pair?.[1] ?? "week";
  const cohortLabels = useMemo(() => ({ period: unit === "month" ? L.periodMonth : L.periodWeek }), [unit, L]);
  const chart = useMemo(
    () =>
      pair && (
        <CohortChart
          data={pair[0]}
          color={1}
          locale={locale}
          labels={cohortLabels}
          maxHeight={420}
          aria-label={L.retentionTitle}
        />
      ),
    [pair, locale, cohortLabels, L],
  );
  const table = useMemo(
    () => pair && <CohortTable data={pair[0]} locale={locale} labels={cohortLabels} caption={L.retentionTitle} />,
    [pair, locale, cohortLabels, L],
  );
  return (
    <AnalyticsPanel
      index={4}
      title={L.retentionTitle}
      description={L.retentionDescription(unit)}
      table={table}
      minHeight={494} // the tallest cohort set (monthly rows); the weekly set is a little shorter, so it never grows
      ready={pair !== null}
      labels={L}
      span={{ md: 2, lg: 4 }}
    >
      {() => chart}
    </AnalyticsPanel>
  );
});

const RANGE_DAYS_SHOWN: Record<AnalyticsRange, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90, "12m": 365 };

const EventsCard = memo(function EventsCard({
  set,
  locale,
  labels: L,
}: CardBase & { set: readonly [CalendarDatum[], string, string, AnalyticsRange] | null }) {
  const compact = useMemo(
    () => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
    [locale],
  );
  // The calendar shows a year; the headline counts the range the data was loaded for.
  const total = set ? set[0].slice(-RANGE_DAYS_SHOWN[set[3]]).reduce((s, e) => s + e.value, 0) : 0;
  const [days, start, end] = set ?? [];
  const chart = useMemo(
    () =>
      days && start !== undefined && end !== undefined ? (
        <CalendarHeatmap
          data={days}
          start={start}
          end={end}
          today={end}
          locale={locale}
          color={4}
          valueLabel={L.eventsUnit}
          aria-label={L.eventsTitle}
        />
      ) : null,
    [days, start, end, locale, L],
  );
  const table = useMemo(
    () =>
      days && start !== undefined && end !== undefined ? (
        <CalendarHeatmapTable data={days} start={start} end={end} today={end} locale={locale} caption={L.eventsTitle} />
      ) : null,
    [days, start, end, locale, L],
  );
  return (
    <AnalyticsPanel
      index={5}
      title={L.eventsTitle}
      description={L.eventsDescription}
      // Laid out before the data too (invisible, stand-in figure): the header wraps the same way either side of the load.
      aside={
        <span className={cn("text-sm font-medium text-sheen-fg-muted tabular-nums", !set && "invisible")}>
          {L.eventsTotal(compact.format(set ? total : 400_000), L.rangeNames[set?.[3] ?? "30d"])}
        </span>
      }
      table={table}
      minHeight={190}
      ready={set !== null}
      labels={L}
      span={{ md: 2, lg: 4 }}
    >
      {() => chart}
    </AnalyticsPanel>
  );
});

/* ---------- Formatting ---------- */

function useNumber(locale?: string) {
  return useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
}

function usePercent(locale?: string, digits = 1) {
  return useMemo(
    () =>
      new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }),
    [locale, digits],
  );
}

function PulseIcon(): ReactNode {
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
      <path d="M3 12h4l2.5-6 4 12 2.5-6h5" />
    </svg>
  );
}
