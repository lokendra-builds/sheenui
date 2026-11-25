import { useState, type ReactNode } from "react";

import { EcommerceStage, SaasStage, WebAnalyticsStage } from "./DashboardStages";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, DemoDataNote, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { DEMO_NOW } from "../demo-clock";

import type { WebAnalyticsData, WebAnalyticsLabels } from "@sheenui/theme";
import type { SaasRevenueLabels } from "@sheenui/theme";
import type { AnalyticsLoader, AnalyticsRange, AnalyticsStatus } from "@sheenui/theme";
import { EcommerceDashboard, SaasRevenueDashboard, WebAnalyticsDashboard } from "./demo-dashboards";
import * as PROPS from "../generated/component-props";

// The dashboards are islands (see layout/lazy-block.tsx): this page's chunk holds the docs, each block is fetched when the browser is idle.
const loadWeb = () => import("../../../theme/src/blocks/analytics/demo-web");

const BLOCKS = "theme/src/blocks/";

/* ---------- Shared docs pieces ---------- */

function PerformanceNotes() {
  return (
    <section className="flex flex-col gap-3">
      <h2 id="performance" className="text-xl font-semibold tracking-tight">
        Performance
      </h2>
      <ul className="glass-1 flex max-w-3xl list-disc flex-col gap-2 rounded-sheen-lg py-4 ps-9 pe-5 text-sm text-pretty text-sheen-fg-muted marker:text-sheen-fg-subtle">
        <li>
          Charts below the fold mount when they come within 320px of the viewport; their frame is reserved first, so
          nothing shifts.
        </li>
        <li>
          New data lands in a React transition, one panel per frame: visible panels ripple in order, panels off-screen
          catch up in idle time or when you scroll to them.
        </li>
        <li>
          Controls answer instantly (optimistic state) while the dashboard re-renders in the background, so a click
          never blocks the next frame.
        </li>
        <li>
          Loading dims the panels through a data attribute (CSS only): starting or finishing a load re-renders no chart.
        </li>
        <li>
          Glass budget: the header, the KPI strip and at most two panels per row blur what's behind them; controls
          inside the header don't add their own blur. Phones get a lighter blur.
        </li>
        <li>
          Live updates, the realtime stream and every pulse stop while the dashboard is off-screen or the tab is hidden.
          Only transform and opacity animate.
        </li>
      </ul>
    </section>
  );
}

const sharedKeys: [string, string][] = [
  ["Tab / Shift+Tab", "Move through the header controls, the KPIs, each chart and its Chart / Table switch."],
  [
    "← / →",
    "Move the time range (Segmented control), the KPI tabs, the Chart / Table switch, or the point being read in a chart.",
  ],
  ["Home / End", "First / last KPI tab, or first / last point of a chart."],
  ["Enter / Space", "Toggle Live, Compare or a filter chip; press Export; sort a table column."],
  ["Esc", "Stop reading a chart (hides the crosshair and tooltip)."],
];

/* ====================================================================== */
/* Web analytics                                                          */
/* ====================================================================== */

const germanWebLabels: Partial<WebAnalyticsLabels> = {
  subtitle: (range) => `Webanalyse · ${range}`,
  range: "Zeitraum",
  rangeNames: {
    "24h": "Letzte 24 Stunden",
    "7d": "Letzte 7 Tage",
    "30d": "Letzte 30 Tage",
    "90d": "Letzte 90 Tage",
    "12m": "Letzte 12 Monate",
  },
  ranges: { "24h": "24 Std.", "7d": "7 T.", "30d": "30 T.", "90d": "90 T.", "12m": "12 M." },
  filters: "Nach Kanal filtern",
  channels: { direct: "Direkt", organic: "Suche", referral: "Verweise", social: "Social", email: "E-Mail" },
  live: "Live",
  liveDescription: "Zahlen in Echtzeit aktualisieren",
  compare: "Vergleichen",
  compareDescription: "Mit dem Vorzeitraum vergleichen",
  export: "Export",
  exported: "CSV heruntergeladen",
  metrics: { visitors: "Besucher", pageviews: "Seitenaufrufe", bounceRate: "Absprungrate", duration: "Besuchsdauer" },
  kpis: "Kennzahlen: wählen, was das Diagramm zeigt",
  online: "online",
  realtime: "Echtzeit",
  realtimeDescription: "Besucher der letzten 60 Sekunden",
  visitorsNow: "Besucher gerade",
  activePages: "Aktive Seiten",
  onlineSeries: "Besucher online",
  topPages: "Top-Seiten",
  topPagesDescription: "Nach Besuchern",
  page: "Seite",
  referrers: "Top-Verweise",
  referrersDescription: "Woher die Besucher kamen",
  source: "Quelle",
  countries: "Länder",
  countriesDescription: "Besucher nach Land",
  devices: "Geräte",
  devicesDescription: "Anteil der Besucher",
  deviceNames: { desktop: "Desktop", mobile: "Mobil", tablet: "Tablet" },
  browsers: "Browser",
  browser: "Browser",
  date: "Datum",
  previousPeriod: "Vorzeitraum",
  changeLabel: "Veränderung",
  vsPrevious: (value) => `vorher ${value}`,
  change: (direction, amount) =>
    `${direction === "up" ? "Plus" : "Minus"} ${amount.replace(/^[+−-]/, "")} zum Vorzeitraum`,
  chart: "Diagramm",
  table: "Tabelle",
  viewAs: (title) => `${title}: Ansicht`,
  formatDuration: (s) => `${Math.floor(s / 60)} Min. ${String(Math.round(s % 60)).padStart(2, "0")} s`,
};

/** Stands in for your API in the preview: same contract, demo numbers after a 900 ms round-trip. */
const germanLoad: AnalyticsLoader<WebAnalyticsData> = async ({ range, filters }, signal) => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return (await loadWeb()).webAnalyticsDemoData(range, filters, "de-DE");
};

/** The pinned-state example every dashboard page shows (`status` prop). */
function StatesExample({
  code,
  children,
}: {
  code: (status: AnalyticsStatus) => string;
  children: (status: AnalyticsStatus) => ReactNode;
}) {
  const [status, setStatus] = useState<AnalyticsStatus>("loading");
  return (
    <Example
      title="Loading, empty and error states"
      description="The frame never disappears: skeletons hold every panel's place on the first load, later loads dim the charts under a scan line, and an empty or failed load says so in words (with Retry when the loader threw). Pin a state with status for docs and tests."
      variant="bare"
      controls={
        <Segmented
          label="State"
          size="sm"
          value={status}
          onValueChange={(v) => setStatus(v)}
          options={[
            { value: "loading", label: "Loading" },
            { value: "empty", label: "Empty" },
            { value: "error", label: "Error" },
          ]}
        />
      }
      {...{ code: code(status) }} // the sample comes from each page; the docs checker reads those call sites
    >
      {children(status)}
    </Example>
  );
}

/** The "Web analytics" docs page (/dashboards/web-analytics): live examples, props and notes. */
export function WebAnalyticsPage() {
  return (
    <Page
      eyebrow="Dashboard"
      title="Web analytics dashboard"
      description="A Plausible-style traffic dashboard you can paste in: live visitors with a pulse and rolling numbers, KPI tabs that drive a trend chart with the previous period dashed, a realtime stream, top pages and referrers, devices and browsers, and a world map. Every chart has a table view; every string and number is localisable."
      source={[`${BLOCKS}analytics-web.tsx`, `${BLOCKS}analytics-kit.tsx`]}
    >
      <WebAnalyticsStage />
      <Example
        title="Live demo"
        description="Switch the range, toggle channels, pick a KPI: charts tween to the new data one after another while the frame stays put. Live is on: the online count rolls, the current day grows and the latest point pulses. Hover or arrow through the trend to read any day against the previous period."
        variant="bare"
        code={`
import { WebAnalyticsDashboard } from "@sheenui/theme";
import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";

export function Analytics() {
  return <WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} site="example.com" />;
}`}
      >
        <WebAnalyticsDashboard site="example.com" headingLevel="none" now={DEMO_NOW} />
      </Example>

      <Example
        title="Your data, your language"
        description="load() receives the range, the active filters and an abort signal; return the data (or a promise). This preview stands in for an API with a 900 ms delay, formats everything for de-DE and translates the labels."
        variant="bare"
        code={`
import { WebAnalyticsDashboard, type AnalyticsLoader, type WebAnalyticsData } from "@sheenui/theme";

const load: AnalyticsLoader<WebAnalyticsData> = async ({ range, filters }, signal) => {
  const res = await fetch(\`/api/analytics?range=\${range}&channels=\${filters.join(",")}\`, { signal });
  if (!res.ok) throw new Error("Analytics API failed"); // shows the error state with Retry
  return res.json();
};

<WebAnalyticsDashboard
  site="docs.example.com"
  load={load}
  locale="de-DE"
  defaultRange="7d"
  defaultMetric="pageviews"
  defaultLive={false}
  labels={{
    metrics: { visitors: "Besucher", pageviews: "Seitenaufrufe", bounceRate: "Absprungrate", duration: "Besuchsdauer" },
    rangeNames: { "24h": "Letzte 24 Stunden", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "90d": "Letzte 90 Tage", "12m": "Letzte 12 Monate" },
    // … every string is in WebAnalyticsLabels
  }}
/>`}
      >
        <div lang="de" className="contents">
          <WebAnalyticsDashboard
            site="docs.example.com"
            load={germanLoad}
            locale="de-DE"
            defaultRange="7d"
            defaultMetric="pageviews"
            defaultLive={false}
            labels={germanWebLabels}
            headingLevel="none"
            now={DEMO_NOW}
          />
        </div>
      </Example>

      <StatesExample
        code={(status) => `
import { WebAnalyticsDashboard } from "@sheenui/theme";
import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";

<WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} site="staging.example.com" status="${status}" defaultLive={false} />`}
      >
        {(status) => (
          <WebAnalyticsDashboard
            key={status}
            site="staging.example.com"
            status={status}
            defaultLive={false}
            headingLevel="none"
            now={DEMO_NOW}
          />
        )}
      </StatesExample>

      <DemoDataNote
        component="WebAnalyticsDashboard"
        item="analytics-demo-web"
        names={["webAnalyticsDemoLoader", "webLiveStep"]}
      />
      <PropsTable of={PROPS.WebAnalyticsDashboard} />
      <PropsTable
        title="WebAnalyticsData"
        rows={[
          [
            "points",
            "{ label, long?, current, previous? }[]",
            "",
            "One row per hour / day / month; current and previous hold visitors, pageviews, bounceRate (0–1) and duration (seconds).",
          ],
          [
            "totals / previousTotals",
            "Record<WebMetric, number>",
            "",
            "Headline numbers for the range (rates and durations are averages).",
          ],
          [
            "pages / referrers / browsers",
            "{ name, value, href?, icon? }[]",
            "",
            "Each one is a bar list of `BarListItem` rows.",
          ],
          ["countries", "{ id, value }[]", "", "Visitors by ISO 3166-1 code (alpha-2, alpha-3 or numeric)."],
          [
            "devices",
            '{ device: "desktop" | "mobile" | "tablet", value }[]',
            "",
            "Fills the donut chart with one value per device type.",
          ],
          ["realtime", "{ visitors, pages }", "", "Visitors on the site right now and the pages they're on."],
        ]}
      />
      <PropsTable of={PROPS.AnalyticsShell} title="AnalyticsShell props" as="h3" />
      <PropsTable of={PROPS.AnalyticsState} title="AnalyticsState props" as="h3" />
      <PropsTable of={PROPS.LiveDot} title="LiveDot props" as="h3" />
      <PropsTable of={PROPS.PanelSkeleton} title="PanelSkeleton props" as="h3" />
      <PropsTable of={PROPS.TrendTable} title="TrendTable props" as="h3" />
      <KitDocs />
      <KeyboardTable rows={sharedKeys} />
      <A11yNotes>
        <li>
          The dashboard is a labeled region (its title); panels are sections named by their headings; loading sets
          aria-busy and is announced once (“Loading new data…”, then “Dashboard updated”), never on every live tick.
        </li>
        <li>
          The KPI strip is a real tablist that controls the trend panel: “Unique visitors, tab, selected, 1 of 4”. Each
          delta reads in words (“Up 12.3% vs previous period”), with an arrow and a sign, so color is never the only
          signal.
        </li>
        <li>
          Rolling numbers are visual only: screen readers get the final value once. The online pill doesn't announce
          every change.
        </li>
        <li>
          Every chart has a Table view with the same numbers; charts are focusable and read point by point with the
          arrow keys (announced politely).
        </li>
        <li>
          Live and Compare are toggle buttons (aria-pressed) with descriptions; filter chips show a ✓ and are underlined
          in forced colors when pressed.
        </li>
        <li>
          Reduced motion: no draw-ins, glides, pulses or scans; numbers and charts jump to their values, fades stay
          short.
        </li>
      </A11yNotes>
      <PerformanceNotes />
    </Page>
  );
}

/** The kit the three templates are built from: documented once, on the first page. */
function KitDocs() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 id="build-your-own-dashboard" className="text-xl font-semibold tracking-tight">
          Build your own dashboard
        </h2>
        <p className="max-w-3xl text-sm text-pretty text-sheen-fg-muted">
          The templates are made from <code className="font-sheen-mono text-xs">analytics-kit.tsx</code>: copy one
          template and swap its panels, or compose a new one from the same parts.
        </p>
      </div>
      <PropsTable
        as="h3"
        title="useAnalyticsDashboard(props, options)"
        rows={[
          ["options.load", "AnalyticsLoader<T>", "", "The loader to use when the props have none."],
          [
            "options.liveStep",
            "(prev: T, tick: number) => T",
            "",
            "Applies one simulated live update (omit for no live mode).",
          ],
          ["options.defaults", "{ range, live, compare }", "", "Sets the starting state when uncontrolled."],
          ["options.isEmpty", "(data: T) => boolean", "", "When to show the empty state."],
          [
            "returns",
            "{ data, query, status, ready, busy, range, setRange, filters, setFilters, live, setLive, compare, setCompare, running, retry, rootRef }",
            "",
            "Everything a template wires into AnalyticsShell and its panels; attach rootRef to the root (live updates pause when it's off-screen).",
          ],
        ]}
      />
      <PropsTable as="h3" title="AnalyticsPanel" of={PROPS.AnalyticsPanel} />
      <PropsTable as="h3" title="KpiStrip" of={PROPS.KpiStrip} />
      <PropsTable
        as="h3"
        title="TrendChart · StackedTrendChart · BarTrendChart"
        of={[PROPS.TrendChart, PROPS.StackedTrendChart, PROPS.BarTrendChart]}
      />
    </section>
  );
}

/* ====================================================================== */
/* SaaS revenue                                                           */
/* ====================================================================== */

const germanSaasLabels: Partial<SaasRevenueLabels> = {
  subtitle: (range) => `Umsatz · ${range}`,
  rangeNames: {
    "24h": "Letzte 24 Stunden",
    "7d": "Letzte 7 Tage",
    "30d": "Letzte 30 Tage",
    "90d": "Letzte 90 Tage",
    "12m": "Letzte 12 Monate",
  },
  ranges: { "24h": "24 Std.", "7d": "7 T.", "30d": "30 T.", "90d": "90 T.", "12m": "12 M." },
  range: "Zeitraum",
  filters: "Nach Region filtern",
  regions: { na: "Nordamerika", emea: "Europa", apac: "Asien-Pazifik", latam: "Lateinamerika" },
  compare: "Vergleichen",
  export: "Export",
  metrics: { mrr: "MRR", arr: "ARR", churnRate: "Kündigungsrate", arpu: "ARPU" },
  kpis: "Umsatzkennzahlen",
  mrrByPlan: "MRR nach Tarif",
  mrrByPlanDescription: "Monatlich wiederkehrender Umsatz, gestapelt",
  planMix: "Tarifmix",
  planMixDescription: "Anteil am MRR",
  movement: "MRR-Bewegung",
  movementDescription: "Vom Anfang bis zum Ende des Zeitraums",
  movementSteps: {
    starting: "MRR Anfang",
    newBusiness: "Neu",
    expansion: "Ausbau",
    reactivation: "Reaktiviert",
    contraction: "Reduziert",
    churn: "Gekündigt",
    ending: "MRR Ende",
  },
  cohorts: "Bindung",
  cohortsDescription: (p) => `Zahlende Kunden nach ${p === "month" ? "Monats" : "Wochen"}kohorte`,
  cohortPeriodName: (p, i) => `${p === "month" ? "Monat" : "Woche"} ${i}`,
  cohortSize: (size) => `${size} Kunden`,
  customers: "Top-Kunden",
  customersDescription: "Nach monatlichem Umsatz",
  columns: {
    customer: "Kunde",
    plan: "Tarif",
    mrr: "MRR",
    seats: "Plätze",
    change: "Veränderung",
    since: "Kunde seit",
  },
  sortBy: (c) => `Nach ${c} sortieren`,
  previousPeriod: "Vorzeitraum",
  vsPrevious: (value) => `vorher ${value}`,
  chart: "Diagramm",
  table: "Tabelle",
  date: "Datum",
};

/** The "SaaS revenue" docs page (/dashboards/saas): live examples, props and notes. */
export function SaasRevenuePage() {
  return (
    <Page
      eyebrow="Dashboard"
      title="SaaS revenue dashboard"
      description="The numbers a subscription business runs on: MRR, ARR, churn and ARPU with rolling numbers and sparklines, MRR stacked by plan, the plan mix, an MRR movement waterfall (new, expansion, reactivation, contraction, churn), retention cohorts and a sortable top-customers table."
      source={[`${BLOCKS}analytics-saas.tsx`, `${BLOCKS}analytics-kit.tsx`]}
    >
      <SaasStage />
      <Example
        title="Live demo"
        description="Twelve months of MRR by default. Turn on Live to watch upgrades land on the latest point; switch regions and every chart, the cohorts and the customer list follow. Sort the customers by MRR, seats, change or tenure."
        variant="bare"
        code={`
import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" currency="USD" />`}
      >
        <SaasRevenueDashboard product="Acme Cloud" currency="USD" headingLevel="none" />
      </Example>

      <Example
        title="Euros, German, Europe only"
        description='currency and locale format every amount in euros, German style; defaultFilters starts on one region; labels translate every string, including the cohort columns ("Monat 3").'
        variant="bare"
        code={`
import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard
  load={saasRevenueDemoLoader}
  liveStep={saasLiveStep}
  product="Nordlicht Software"
  currency="EUR"
  locale="de-DE"
  defaultRange="90d"
  defaultFilters={["emea"]}
  labels={{
    metrics: { mrr: "MRR", arr: "ARR", churnRate: "Kündigungsrate", arpu: "ARPU" },
    cohortPeriodName: (period, i) => \`\${period === "month" ? "Monat" : "Woche"} \${i}\`,
    // … every string is in SaasRevenueLabels
  }}
/>`}
      >
        <div lang="de" className="contents">
          <SaasRevenueDashboard
            product="Nordlicht Software"
            currency="EUR"
            locale="de-DE"
            defaultRange="90d"
            defaultFilters={["emea"]}
            labels={germanSaasLabels}
            headingLevel="none"
          />
        </div>
      </Example>

      <StatesExample
        code={(status) => `
import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" status="${status}" defaultLive={false} />`}
      >
        {(status) => (
          <SaasRevenueDashboard
            key={status}
            product="Acme Cloud (status demo)"
            status={status}
            defaultLive={false}
            headingLevel="none"
          />
        )}
      </StatesExample>

      <DemoDataNote
        component="SaasRevenueDashboard"
        item="analytics-demo-saas"
        names={["saasRevenueDemoLoader", "saasLiveStep"]}
      />
      <PropsTable of={PROPS.SaasRevenueDashboard} />
      <PropsTable
        title="SaasRevenueData"
        rows={[
          [
            "points",
            "{ label, long?, mrr: Record<plan, number> }[]",
            "",
            "MRR by plan at each point (Starter, Pro, Business, Enterprise).",
          ],
          [
            "kpis / previousKpis",
            "{ mrr, arr, churnRate, arpu }",
            "",
            "Headline numbers; churn is a monthly ratio (0.022 = 2.2%).",
          ],
          ["trends", "Record<metric, number[]>", "", "Gives the sparkline values for each KPI, keyed by metric."],
          [
            "movement",
            "{ starting, newBusiness, expansion, reactivation, contraction, churn }",
            "",
            "The waterfall (contraction and churn as positive amounts).",
          ],
          [
            "cohorts / cohortPeriod",
            'CohortRow[] / "month" | "week"',
            "",
            "Takes retention cohorts (customers still paying).",
          ],
          [
            "customers",
            "{ id, name, detail?, plan, mrr, previousMrr?, seats, since }[]",
            "",
            "Fills the top-customers table with these rows.",
          ],
        ]}
      />
      <PropsTable of={PROPS.DeltaBadge} title="DeltaBadge props" as="h3" />
      <PropsTable of={PROPS.RollingNumber} title="RollingNumber props" as="h3" />
      <KeyboardTable
        rows={[
          ...sharedKeys,
          [
            "Enter / Space (table header)",
            "Sort the customers by that column; again to reverse (aria-sort is announced).",
          ],
        ]}
      />
      <A11yNotes>
        <li>
          KPI deltas read in words and know which way is good: a falling churn rate is good news (green, “Down 9.9%”), a
          falling ARPU is not.
        </li>
        <li>
          The waterfall labels every step with its signed value and shows increases and decreases with different shapes
          and colors; its table lists each step and the running total.
        </li>
        <li>
          The cohort grid is navigable cell by cell with the arrow keys and has a % / users switch; cohorts that haven't
          reached a period read “not yet”, never 0%.
        </li>
        <li>
          The customers table is a real table with sortable column buttons (aria-sort). On narrow screens the plan and
          start date fold under the name, so MRR and change stay visible without scrolling.
        </li>
        <li>Reduced motion: values and charts jump, no draw-ins; the busy scan line becomes a still bar.</li>
      </A11yNotes>
      <PerformanceNotes />
    </Page>
  );
}

/* ====================================================================== */
/* E-commerce                                                             */
/* ====================================================================== */

function ControlledEcommerce() {
  const [range, setRange] = useState<AnalyticsRange>("24h");
  return (
    <Example
      title="A live store, controlled"
      description="range is controlled here (the buttons above and the header stay in sync), Live and Compare start on, amounts are in pounds for en-GB. Orders land every few seconds: revenue rolls, the current hour grows and the funnel counts up."
      variant="bare"
      controls={
        <Segmented
          label="Range (outside the dashboard)"
          size="sm"
          value={range}
          onValueChange={(v) => setRange(v)}
          options={[
            { value: "24h", label: "Today" },
            { value: "7d", label: "This week" },
            { value: "30d", label: "This month" },
          ]}
        />
      }
      code={`
import { EcommerceDashboard, type AnalyticsRange } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";
import { useState } from "react";

const [range, setRange] = useState<AnalyticsRange>("24h");

<EcommerceDashboard
  load={ecommerceDemoLoader}
  liveStep={ecommerceLiveStep}
  store="Northwind Goods"
  currency="GBP"
  locale="en-GB"
  range={range}
  onRangeChange={setRange}
  ranges={["24h", "7d", "30d"]}
  defaultLive
  defaultCompare
/>`}
    >
      <EcommerceDashboard
        store="Northwind Goods"
        currency="GBP"
        locale="en-GB"
        range={range}
        onRangeChange={setRange}
        ranges={["24h", "7d", "30d"]}
        defaultLive
        defaultCompare
        headingLevel="none"
      />
    </Example>
  );
}

/** The "E-commerce" docs page (/dashboards/ecommerce): live examples, props and notes. */
export function EcommercePage() {
  return (
    <Page
      eyebrow="Dashboard"
      title="E-commerce dashboard"
      description="Store analytics at a glance: revenue, orders, average order value and conversion; revenue as bars with the previous period (or a moving average) on the same axis; the checkout funnel; sales by category as a zoomable treemap; when people buy (hour × weekday heatmap); and the top products."
      source={[`${BLOCKS}analytics-ecommerce.tsx`, `${BLOCKS}analytics-kit.tsx`]}
    >
      <EcommerceStage />
      <Example
        title="Live demo"
        description="Filter by sales channel and the whole store re-shapes (the mobile app sells pricier baskets, social converts less). Bars grow from the baseline in a wave; Compare adds last period's revenue as a dashed line. Hover a bar to read revenue, the moving average and the change; click a category to zoom into it."
        variant="bare"
        code={`
import { EcommerceDashboard } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";

<EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} store="Lumen & Co." currency="USD" />`}
      >
        <EcommerceDashboard store="Lumen & Co." currency="USD" headingLevel="none" />
      </Example>

      <ControlledEcommerce />

      <StatesExample
        code={(status) => `
import { EcommerceDashboard } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";

<EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} store="Lumen & Co." status="${status}" defaultLive={false} />`}
      >
        {(status) => (
          <EcommerceDashboard
            key={status}
            store="Lumen & Co. (status demo)"
            status={status}
            defaultLive={false}
            headingLevel="none"
          />
        )}
      </StatesExample>

      <DemoDataNote
        component="EcommerceDashboard"
        item="analytics-demo-ecommerce"
        names={["ecommerceDemoLoader", "ecommerceLiveStep"]}
      />
      <PropsTable of={PROPS.EcommerceDashboard} />
      <PropsTable of={PROPS.BarTrendChart} title="BarTrendChart props" as="h3" />
      <PropsTable
        title="EcommerceData"
        rows={[
          ["points", "{ label, long?, revenue, orders, previousRevenue? }[]", "", "Revenue and orders per point."],
          [
            "kpis / previousKpis",
            "{ revenue, orders, aov, conversion }",
            "",
            "Takes headline numbers (conversion as a ratio).",
          ],
          ["trends", "Record<metric, number[]>", "", "Gives the sparkline values for each KPI, keyed by metric."],
          [
            "funnel",
            '{ stage: "sessions" | "productViews" | "addToCart" | "checkout" | "purchase", value }[]',
            "",
            "Takes visitors at each checkout step.",
          ],
          ["categories", "TreemapNode[]", "", "Takes revenue by category → product type."],
          ["heatmap", "{ day, hours: number[24] }[]", "", "Orders by weekday × hour, Monday first."],
          ["products", "BarListItem[]", "", "Lists the top products by revenue."],
        ]}
      />
      <KeyboardTable
        rows={[...sharedKeys, ["Enter (treemap)", "Zoom into a category; the breadcrumb zooms back out."]]}
      />
      <A11yNotes>
        <li>
          The revenue chart keeps bars and the line on one axis (they share a unit); the legend names both and the Table
          view lists revenue and the line per period.
        </li>
        <li>
          The funnel reads each stage with its share of the first and of the previous stage, and how many dropped off
          between them.
        </li>
        <li>
          The heatmap is a keyboard grid with a sequential, single-hue scale and a legend; every cell reads its weekday,
          hour and number of orders. On phones it scrolls inside its own panel.
        </li>
        <li>Reduced motion: no grow-from-baseline, no tile glides, no pulses.</li>
      </A11yNotes>
      <PerformanceNotes />
    </Page>
  );
}
