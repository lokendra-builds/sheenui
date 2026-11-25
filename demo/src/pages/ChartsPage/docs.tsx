import { useState } from "react";
import {
  AreaChart,
  BarChart,
  ChartCard,
  ChartTable,
  DonutChart,
  GlassCard,
  LineChart,
  RadialProgress,
  Sparkline,
  formatCompact,
  seriesLegend,
  type LegendItem,
} from "@sheenui/theme";
import { ChartSyncProvider } from "@sheenui/theme";
import { A11yNotes, KeyboardTable } from "../../layout/DocSections";
import { Example } from "../../layout/Example";
import { lazyBlock } from "../../layout/lazy-block";
import { Segmented } from "../../layout/Segmented";
import {
  type Range,
  countries,
  countrySeries,
  funnel,
  funnelSeries,
  planSeries,
  plans,
  previousLegend,
  ranges,
  revenue,
  revenueSeries,
  traffic,
  usd,
  users,
} from "./shared-data";
import {
  Anchor,
  LiveExample,
  SectionTitle,
  eur,
  germanCard,
  germanRevenue,
  germanSeries,
  signupAnnotations,
  visitSeries,
  visitsDaily,
} from "./docs-parts";

const ApiTables = lazyBlock(() => import("./api-tables").then((m) => m.default), { minHeight: "12rem" });

/**
 * The prop tables are reference material (about 16 000 px of them): one closed disclosure. Their HTML is prerendered (the
 * docs check and llms-full.txt need every prop row on the page), but the tables' code is a lazy island that hydrates once
 * the browser is idle.
 */
function ApiDetails() {
  return (
    <details className="charts-api-details glass-1 rounded-sheen-lg">
      <summary className="charts-api-details__summary">Show the prop tables for every chart, card and helper</summary>
      <ApiTables />
    </details>
  );
}

/**
 * The documented charts of the /charts page (line, area, bar, donut, the feature examples and the API tables).
 * ChartsPage loads this as an island (lazyBlock): the prerendered HTML has it, and the chart kits behind it
 * (line, bar, donut, sparkline, chart card...) stay out of the page's initial JavaScript.
 */
export function ChartsDocs() {
  const [range, setRange] = useState<Range>("12");
  const slice = <T,>(rows: T[]) => rows.slice(-Number(range));

  const lineLegend: LegendItem[] = [...seriesLegend(revenueSeries, "line"), previousLegend];
  const barLegend: LegendItem[] = [
    ...seriesLegend(funnelSeries, "rect"),
    { ...previousLegend, label: "Signups, previous period" },
  ];

  return (
    <>
      <section aria-labelledby="core-charts" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <SectionTitle id="core-charts" title="Line, area, bar and donut">
            The everyday charts, documented here. Smooth curves, gradient fills, draw-in and grow-from-baseline
            entrances, previous-period comparison, clickable legends, annotations, a brush, synced crosshairs and PNG /
            SVG / CSV export. As a shadcn charts alternative, each chart has a table view.
          </SectionTitle>
          {/* One filter row scopes every monthly chart below it. A radio group, not tabs: it filters, it has no panels. */}
          <div className="flex flex-wrap items-center gap-3">
            <span aria-hidden className="text-sm text-sheen-fg-muted">
              Showing the last
            </span>
            <Segmented
              label="Time range for the charts below"
              options={ranges}
              value={range}
              onValueChange={setRange}
            />
          </div>
        </div>

        <Anchor id="chart-line">
          <Example
            title="Line chart"
            replayable
            description="Click a legend key to hide a series (the axis re-fits); hover one to dim the others. The dashed line is the previous period. Download it from the card's menu."
            variant="bare"
            code={`
import { ChartCard, ChartTable, LineChart, PREVIOUS_SERIES_KEY, formatCompact, seriesLegend, type CompareSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const data = [
  { month: "Jan", organic: 61000, organicPrev: 52000, paid: 34000, referral: 15000 },
  { month: "Feb", organic: 64500, organicPrev: 54500, paid: 36500, referral: 15800 },
  { month: "Mar", organic: 69000, organicPrev: 56000, paid: 38200, referral: 17100 },
  { month: "Apr", organic: 72800, organicPrev: 59500, paid: 41000, referral: 17600 },
  { month: "May", organic: 78100, organicPrev: 61000, paid: 43600, referral: 18900 },
  { month: "Jun", organic: 83400, organicPrev: 63800, paid: 45200, referral: 19700 },
];

// color is a palette slot (1–8); compareKey names the previous-period value in each row.
const series: CompareSeries[] = [
  { key: "organic", label: "Organic", color: 1, compareKey: "organicPrev" },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Monthly revenue by channel"
      legend={[
        ...seriesLegend(series, "line"),
        { label: "Previous period", color: "var(--sheen-fg-subtle)", kind: "line", dashed: true, key: PREVIOUS_SERIES_KEY },
      ]}
      exportable
      table={<ChartTable data={data} index="month" series={series} format={usd} />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel" />
    </ChartCard>
  );
}`}
          >
            <ChartCard
              className="w-full"
              title="Monthly revenue by channel"
              description="In US dollars, with last year dashed"
              legend={lineLegend}
              exportable
              table={
                <ChartTable
                  data={slice(revenue)}
                  index="month"
                  indexLabel="Month"
                  series={revenueSeries}
                  format={usd}
                />
              }
            >
              <LineChart
                data={slice(revenue)}
                index="month"
                series={revenueSeries}
                format={usd}
                aria-label="Monthly revenue by channel"
              />
            </ChartCard>
          </Example>
        </Anchor>

        <Anchor id="chart-area">
          <Example
            title="Area chart with a brush"
            replayable
            description="A gradient wash that fades to transparent. The brush under a long series zooms it: drag the window, drag its edges, or use the arrow keys on them."
            variant="bare"
            code={`
import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

// 120 days of visits
const days = Array.from({ length: 120 }, (_, i) => ({
  day: "Day " + (i + 1),
  visits: Math.round(9000 + i * 55 + Math.sin(i / 4) * 900),
}));
const series: ChartSeries[] = [{ key: "visits", label: "Visits", color: 7 }];

export function Example() {
  return (
    <ChartCard title="Visits" table={<ChartTable data={days} index="day" series={series} />}>
      <AreaChart
        data={days}
        index="day"
        series={series}
        brush={{ defaultRange: [90, 119], minSpan: 7 }}
        aria-label="Daily visits"
      />
    </ChartCard>
  );
}`}
          >
            <ChartCard
              className="w-full"
              title="Visits"
              description="Daily, last 120 days"
              aside={
                <span className="text-2xl font-semibold tracking-tight">
                  {formatCompact(users[users.length - 1]?.users ?? 0)}
                </span>
              }
              table={<ChartTable data={visitsDaily} index="day" indexLabel="Day" series={visitSeries} />}
            >
              <AreaChart
                data={visitsDaily}
                index="day"
                series={visitSeries}
                brush={{ defaultRange: [90, 119], minSpan: 7 }}
                aria-label="Daily visits"
              />
            </ChartCard>
          </Example>
        </Anchor>

        <Anchor id="chart-bar">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
            <Example
              title="Bar chart"
              description="Bars grow from the baseline. The dashed tick on each Signups bar is last year's value."
              variant="bare"
              code={`
import { BarChart, type CompareSeries } from "@sheenui/theme";

const data = [
  { month: "Jan", signups: 1240, signupsPrev: 1010, activated: 780 },
  { month: "Feb", signups: 1310, signupsPrev: 1090, activated: 820 },
  { month: "Mar", signups: 1490, signupsPrev: 1150, activated: 930 },
  { month: "Apr", signups: 1420, signupsPrev: 1230, activated: 900 },
  { month: "May", signups: 1650, signupsPrev: 1300, activated: 1040 },
];
const series: CompareSeries[] = [
  { key: "signups", label: "Signups", color: 1, compareKey: "signupsPrev" },
  { key: "activated", label: "Activated", color: 3 },
];

export function Example() {
  return <BarChart data={data} index="month" series={series} aria-label="Signups and activations per month" />;
}`}
            >
              <ChartCard
                title="Signups vs activations"
                legend={barLegend}
                table={<ChartTable data={slice(funnel)} index="month" indexLabel="Month" series={funnelSeries} />}
              >
                <BarChart
                  data={slice(funnel)}
                  index="month"
                  series={funnelSeries}
                  aria-label="Signups and activations per month"
                />
              </ChartCard>
            </Example>

            <Example
              title="Stacked bars"
              lazyPreview
              variant="bare"
              code={`
import { BarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jan", free: 820, pro: 310, team: 90 },
  { month: "Feb", free: 790, pro: 358, team: 111 },
  { month: "Mar", free: 760, pro: 406, team: 132 },
  { month: "Apr", free: 730, pro: 454, team: 153 },
];
const series: ChartSeries[] = [
  { key: "free", label: "Free", color: 7 },
  { key: "pro", label: "Pro", color: 1 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return <BarChart stacked data={data} index="month" series={series} aria-label="Customers per plan" />;
}`}
            >
              <ChartCard
                title="Customers by plan"
                legend={seriesLegend(planSeries, "rect")}
                table={<ChartTable data={slice(plans)} index="month" indexLabel="Month" series={planSeries} />}
              >
                <BarChart
                  stacked
                  data={slice(plans)}
                  index="month"
                  series={planSeries}
                  aria-label="Customers per plan, stacked"
                />
              </ChartCard>
            </Example>
          </div>

          <Example
            title="Horizontal bars"
            lazyPreview
            description="Best for long category names. Values sit at the tip of each bar."
            variant="bare"
            code={`
import { BarChart } from "@sheenui/theme";

const countries = [
  { country: "United States", visitors: 48200 },
  { country: "Germany", visitors: 21400 },
  { country: "India", visitors: 18900 },
  { country: "United Kingdom", visitors: 15300 },
  { country: "Brazil", visitors: 9800 },
];

export function Example() {
  return (
    <BarChart
      layout="horizontal"
      showValues
      data={countries}
      index="country"
      series={[{ key: "visitors", label: "Visitors" }]}
      aria-label="Visitors by country"
    />
  );
}`}
          >
            <ChartCard
              className="w-full"
              title="Top countries"
              description="Visitors this month"
              table={<ChartTable data={countries} index="country" indexLabel="Country" series={countrySeries} />}
            >
              <BarChart
                layout="horizontal"
                showValues
                data={countries}
                index="country"
                series={countrySeries}
                aria-label="Visitors by country"
              />
            </ChartCard>
          </Example>
        </Anchor>

        <Anchor id="chart-donut">
          <Example
            title="Donut chart"
            lazyPreview
            description="Part-to-whole at a glance, at most 6 slices. Hover a slice to read it in the center; click a legend key to leave a slice out (the ring re-flows and the total re-counts)."
            variant="bare"
            code={`
import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";

const traffic = [
  { label: "Organic search", value: 41200 },
  { label: "Direct", value: 22800 },
  { label: "Social", value: 15400 },
  { label: "Referral", value: 9600 },
  { label: "Email", value: 6100 },
];

export function Example() {
  return (
    <ChartCard
      title="Traffic sources"
      description="Sessions this month"
      table={
        <ChartTable
          data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
          index="source"
          indexLabel="Source"
          series={[{ key: "sessions", label: "Sessions", color: 1 }]}
        />
      }
    >
      <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
    </ChartCard>
  );
}`}
          >
            <ChartCard
              title="Traffic sources"
              description="Sessions this month"
              table={
                <ChartTable
                  data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
                  index="source"
                  indexLabel="Source"
                  series={[{ key: "sessions", label: "Sessions", color: 1 }]}
                />
              }
            >
              <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
            </ChartCard>
          </Example>
        </Anchor>

        <Anchor id="chart-radial-progress">
          <Example
            title="Radial progress & gauge"
            lazyPreview
            description='A single ratio against a limit; the number rolls with the arc. With coloring="severity" the color turns warning and critical, always with a status word too.'
            stageClassName="gap-10"
            code={`
import { RadialProgress } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <RadialProgress value={64} label="Quarterly goal" />
      <RadialProgress variant="gauge" coloring="severity" value={82} label="Storage used" />
      <RadialProgress variant="gauge" coloring="severity" value={96} label="CPU" />
    </>
  );
}`}
          >
            <RadialProgress value={64} label="Quarterly goal" />
            <RadialProgress variant="gauge" coloring="severity" value={82} label="Storage used" />
            <RadialProgress variant="gauge" coloring="severity" value={96} label="CPU" />
          </Example>
        </Anchor>

        <Anchor id="chart-sparkline">
          <Example
            title="Sparklines in stat tiles"
            lazyPreview
            description="A small trend under a headline number; it draws in when the tile scrolls into view and the latest point gets a dot."
            stageClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
            code={`
import { GlassCard, Sparkline } from "@sheenui/theme";

const tiles: [string, string, number[], string][] = [
  ["Revenue", "$12.4K", [12, 18, 15, 22, 28, 26, 34], "rising"],
  ["Sessions", "86.4K", [40, 44, 39, 47, 52, 50, 58], "rising"],
  ["Bounce rate", "38%", [48, 46, 47, 43, 41, 40, 38], "falling"],
];

export function Example() {
  return (
    <>
      {tiles.map(([label, value, values, direction]) => (
        <GlassCard key={label} className="flex flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <Sparkline values={values} aria-label={\`\${label} trend, \${direction}\`} />
        </GlassCard>
      ))}
    </>
  );
}`}
          >
            {[
              ["Revenue", "$12.4K", [12, 18, 15, 22, 28, 26, 34], "rising"],
              ["Sessions", "86.4K", [40, 44, 39, 47, 52, 50, 58], "rising"],
              ["Bounce rate", "38%", [48, 46, 47, 43, 41, 40, 38], "falling"],
            ].map(([label, value, values, direction]) => (
              <GlassCard key={label as string} className="flex flex-col gap-2 p-5">
                <p className="text-sm text-sheen-fg-muted">{label as string}</p>
                <p className="text-3xl font-semibold tracking-tight">{value as string}</p>
                <Sparkline
                  values={values as number[]}
                  aria-label={`${label as string} trend, ${direction as string}`}
                />
              </GlassCard>
            ))}
          </Example>
        </Anchor>
      </section>

      <section aria-labelledby="chart-features" className="flex flex-col gap-12">
        <SectionTitle id="chart-features" title="Chart-wide features">
          The same building blocks power every chart above and the dashboards: synced crosshairs, annotations, export,
          live data and i18n.
        </SectionTitle>

        <Example
          title="Synced crosshairs"
          lazyPreview
          description="Charts inside one ChartSyncProvider share the point being read, matched by x value: hover the line and the bars follow (and the other way round)."
          variant="bare"
          code={`
import { ChartSyncProvider, LineChart, BarChart, type ChartSeries } from "@sheenui/theme";

const revenue = [
  { month: "Jan", organic: 61000, paid: 34000 },
  { month: "Feb", organic: 64500, paid: 36500 },
  { month: "Mar", organic: 69000, paid: 38200 },
  { month: "Apr", organic: 72800, paid: 41000 },
];
const revenueSeries: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const signups = [
  { month: "Jan", signups: 1240, activated: 780 },
  { month: "Feb", signups: 1310, activated: 820 },
  { month: "Mar", signups: 1490, activated: 930 },
  { month: "Apr", signups: 1420, activated: 900 },
];
const signupSeries: ChartSeries[] = [
  { key: "signups", label: "Signups", color: 1 },
  { key: "activated", label: "Activated", color: 3 },
];

export function Example() {
  return (
    <ChartSyncProvider>
      <LineChart data={revenue} index="month" series={revenueSeries} aria-label="Revenue" />
      <BarChart data={signups} index="month" series={signupSeries} aria-label="Signups" />
    </ChartSyncProvider>
  );
}`}
        >
          <ChartSyncProvider>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              {/* Organic carries a previous period, so the legend names that dashed line too. */}
              <ChartCard title="Revenue" legend={lineLegend}>
                <LineChart
                  data={slice(revenue)}
                  index="month"
                  series={revenueSeries}
                  format={usd}
                  height={220}
                  aria-label="Monthly revenue by channel"
                />
              </ChartCard>
              <ChartCard title="Signups" legend={seriesLegend(funnelSeries, "rect")}>
                <BarChart
                  data={slice(funnel)}
                  index="month"
                  series={funnelSeries}
                  height={220}
                  aria-label="Signups and activations per month"
                />
              </ChartCard>
            </div>
          </ChartSyncProvider>
        </Example>

        <Example
          title="Annotations"
          lazyPreview
          description="Reference lines and bands on the value axis, event markers and ranges on the x axis. Labels sit on a surface plate, in text colors; events are also read out with their data point."
          variant="bare"
          code={`
import { LineChart } from "@sheenui/theme";

const data = [
  { month: "Jan", organic: 61000 },
  { month: "Feb", organic: 64500 },
  { month: "Mar", organic: 69000 },
  { month: "Apr", organic: 72800 },
  { month: "May", organic: 78100 },
  { month: "Jun", organic: 83400 },
];

export function Example() {
  return (
    <LineChart
      data={data}
      index="month"
      series={[{ key: "organic", label: "Organic" }]}
      annotations={[
        { type: "band", from: 60000, to: 75000, label: "Forecast range" },
        { type: "line", value: 80000, label: "Goal $80K", tone: "accent" },
        { type: "range", from: "Jan", to: "Feb", label: "Holiday freeze" },
        { type: "event", at: "Jun", label: "Pricing change", tone: "warning" },
      ]}
      aria-label="Organic revenue with goal and events"
    />
  );
}`}
        >
          <ChartCard className="w-full" title="Organic revenue" description="With goal, forecast range and events">
            <AreaChart
              data={revenue}
              index="month"
              series={revenueSeries.slice(0, 1)}
              format={usd}
              annotations={signupAnnotations}
              aria-label="Organic revenue with goal and events"
            />
          </ChartCard>
        </Example>

        <Example
          title="Export, locale and labels"
          lazyPreview
          description="exportable adds a download menu: PNG and SVG keep the exact colors of the current theme, CSV has the raw numbers. Every string is a label, and numbers follow the locale (German here)."
          variant="bare"
          code={`
import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const data = [
  { month: "Jan", revenue: 61000 },
  { month: "Feb", revenue: 64500 },
  { month: "Mär", revenue: 69000 },
  { month: "Apr", revenue: 72800 },
];
const series: ChartSeries[] = [{ key: "revenue", label: "Umsatz", color: 1 }];

export function Example() {
  return (
    <ChartCard
      title="Umsatz"
      exportable
      labels={{ chart: "Diagramm", table: "Tabelle", downloadPng: "Als PNG herunterladen", noData: "Keine Daten" }}
      table={<ChartTable data={data} index="month" series={series} format={(n) => eur.format(n)} />}
    >
      <AreaChart data={data} index="month" series={series} locale="de" format={(n) => eur.format(n)} labels={{ previous: (l) => l + " (Vorperiode)" }} aria-label="Umsatz pro Monat" />
    </ChartCard>
  );
}`}
        >
          <div lang="de" className="contents">
            <ChartCard
              className="w-full"
              title="Umsatz"
              description="Monatlich, in Euro, mit Vorperiode"
              labels={germanCard}
              exportable
              legend={[...seriesLegend(germanSeries, "line"), { ...previousLegend, label: "Vorperiode" }]}
              table={
                <ChartTable
                  data={germanRevenue}
                  index="month"
                  indexLabel="Monat"
                  series={germanSeries}
                  format={(n) => eur.format(n)}
                />
              }
            >
              <AreaChart
                data={germanRevenue}
                index="month"
                series={germanSeries}
                locale="de"
                format={(n) => eur.format(n)}
                labels={{
                  previous: germanCard.previous,
                  instructions: "Mit den Pfeiltasten links und rechts die Werte lesen.",
                }}
                aria-label="Umsatz pro Monat"
              />
            </ChartCard>
          </div>
        </Example>

        <Example
          title="Live data"
          lazyPreview
          description="useLiveData appends a row on an interval into a sliding window and pauses off-screen, in hidden tabs and on Pause. With live, new points slide in from the right instead of morphing."
          variant="bare"
          code={`
import { Button, LineChart, useLiveData, type ChartRow, type ChartSeries } from "@sheenui/theme";
import { useRef } from "react";

const initial: ChartRow[] = [
  { t: "0s", v: 800 },
  { t: "2s", v: 830 },
];
const series: ChartSeries[] = [{ key: "v", label: "Requests" }];

export function RequestsPerSecond() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, paused, setPaused } = useLiveData(initial, {
    next: (rows, tick) => ({ t: tick * 2 + "s", v: Math.round(Number(rows[rows.length - 1]?.v ?? 800) + (Math.random() - 0.5) * 140) }),
    interval: 1500,
    max: 16,
    ref, // pauses while this element is off-screen
  });

  return (
    <>
      <div ref={ref}>
        {/* data takes a mutable array: spread the hook's read-only window */}
        <LineChart live data={data} index="t" series={series} aria-label="Requests per second" />
      </div>
      <Button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Button>
    </>
  );
}`}
        >
          <LiveExample />
        </Example>
      </section>

      <section aria-labelledby="charts-api" className="flex flex-col gap-8">
        <SectionTitle id="charts-api" title="API">
          Series take a color slot from 1 to 8 (the validated palette, assigned in order when omitted, never re-ranked
          when a series is hidden). Every chart needs an aria-label; pair it with a ChartTable so every value can be
          read without color.
        </SectionTitle>

        <ApiDetails />

        <KeyboardTable
          as="h3"
          rows={[
            [
              "Tab",
              "Move through the card's tabs and menu, then the legend keys, then the chart and its brush handles.",
            ],
            ["← → (↑ ↓)", "Read the previous / next point (the crosshair moves and the values are announced)."],
            ["Home / End", "First / last point."],
            ["Escape", "Clear the active point."],
            ["Enter / Space on a legend key", "Hide or show that series (announced)."],
            [
              "← → on a brush handle",
              "Move that edge one step; Page Up / Page Down move ten percent; Home / End go to the ends.",
            ],
            ["Shift + ← → on a brush handle", "Pan the whole window."],
            ["← → on Chart / Table", "Switch between the chart and its table."],
          ]}
        />

        <A11yNotes
          as="h3"
          notes={[
            "Every interactive chart is a focusable figure named by its title and described by the reading instructions (the same key on every chart, `labels.instructions`, a string or a function); inside a ChartCard with a table, `aria-details` points at the table view. The active values are announced once, politely.",
            "Every chart has a table view (Chart / Table tabs), so no value depends on color or on seeing the marks.",
            "Legend keys are toggle buttons (pressed = shown); hiding or showing a series is announced.",
            "Event markers are read out with the data point they sit on; status colors always come with a word or an icon.",
            "Reduced motion: charts appear at their final values, data changes jump, and live charts stop sliding.",
            "Windows High Contrast: legend keys gain outlines, the active tab and brush window use system colors.",
          ]}
        />
      </section>
    </>
  );
}
