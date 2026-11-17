import { useState } from "react";
import { formatCompact, seriesLegend, type ChartSeries } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import { Segmented } from "../layout/Segmented";
import { StackedAreaChart, StackedAreaTable } from "@sheenui/theme";
import { PercentBarChart, PercentBarTable } from "@sheenui/theme";
import { PieChart, PieTable, foldSlices, type PieSlice } from "@sheenui/theme";
import { StackedAreaStage, PercentBarStage, PieStage } from "./ChartsStackedPiePages/stage";
import * as PROPS from "../generated/component-props";
import { Shuffle, months, seeded } from "./ChartsStackedPiePages/shared";

function trafficData(seed: number) {
  const r = seeded(seed);
  return months.map((month, i) => ({
    month,
    organic: Math.round(38000 + i * 2600 + Math.sin(i * 1.1) * 3800 + r() * 2400),
    paid: Math.round(21000 + i * 1500 + Math.cos(i * 0.8) * 3000 + r() * 2000),
    referral: Math.round(9000 + i * 700 + Math.sin(i * 0.6 + 1) * 1600 + r() * 1200),
    social: Math.round(6000 + i * 900 + Math.cos(i * 1.3) * 1400 + r() * 1000),
  }));
}

const trafficSeries: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "social", label: "Social", color: 4 },
];

const quarters = ["Q1 ’24", "Q2 ’24", "Q3 ’24", "Q4 ’24", "Q1 ’25", "Q2 ’25", "Q3 ’25", "Q4 ’25"];

const devices = quarters.map((quarter, i) => ({
  quarter,
  desktop: Math.round(52000 - i * 3100 + Math.sin(i) * 1200),
  mobile: Math.round(31000 + i * 3900 + Math.cos(i * 0.7) * 1500),
  tablet: Math.round(7000 - i * 260 + Math.sin(i * 1.4) * 400),
}));

const deviceSeries: ChartSeries[] = [
  { key: "desktop", label: "Desktop", color: 1 },
  { key: "mobile", label: "Mobile", color: 2 },
  { key: "tablet", label: "Tablet", color: 3 },
];

/** The first quarter in which mobile passed desktop, read from the data (so the copy can't drift). */
const mobileOvertook = devices.find((d) => d.mobile > d.desktop)?.quarter;

/** Signups by plan, with a month where nothing came in: percent mode draws it as a gap, not a dip to 0%. */
const signups = [
  { month: "May", free: 420, pro: 160, team: 40 },
  { month: "Jun", free: 460, pro: 190, team: 55 },
  { month: "Jul", free: 0, pro: 0, team: 0 },
  { month: "Aug", free: 510, pro: 230, team: 70 },
  { month: "Sep", free: 540, pro: 260, team: 95 },
  { month: "Oct", free: 560, pro: 300, team: 120 },
];

function planMix(seed: number) {
  const r = seeded(seed);
  return [
    { region: "North America", free: 4200, pro: 2600, team: 1400 },
    { region: "Europe", free: 5100, pro: 2100, team: 900 },
    { region: "Asia Pacific", free: 7400, pro: 1500, team: 600 },
    { region: "Latin America", free: 2600, pro: 700, team: 180 },
    { region: "Middle East & Africa", free: 1900, pro: 420, team: 90 },
  ].map((row) => ({
    ...row,
    free: Math.round(row.free * (0.7 + r() * 0.6)),
    pro: Math.round(row.pro * (0.7 + r() * 0.6)),
    team: Math.round(row.team * (0.7 + r() * 0.6)),
  }));
}

const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

const oneMonth = [{ month: "Oct", organic: 41000, paid: 23000 }];

const timeByTeam = [
  { name: "Platform infrastructure and reliability", building: 52, meetings: 30, support: 18 },
  { name: "Design", building: 61, meetings: 31, support: 8 },
  { name: "New team", building: 0, meetings: 0, support: 0 },
];

const timeSeries: ChartSeries[] = [
  { key: "building", label: "Building", color: 1 },
  { key: "meetings", label: "Meetings", color: 2 },
  { key: "support", label: "Support", color: 3 },
];

const hours = (n: number) => `${n} h`;

function browserData(seed: number): PieSlice[] {
  const r = seeded(seed);
  // Monthly visits; a new seed nudges every browser by up to ±25%.
  const visits = (v: number) => Math.round(v * (0.75 + r() * 0.5));
  return [
    { label: "Chrome", value: visits(612_000), color: 1 },
    { label: "Safari", value: visits(198_000), color: 2 },
    { label: "Edge", value: visits(53_000), color: 3 },
    { label: "Firefox", value: visits(34_000), color: 4 },
    { label: "Other mobile", value: visits(26_000), color: 5 },
    { label: "Opera", value: visits(22_000), color: 6 },
    { label: "Brave", value: visits(11_000), color: 7 },
    { label: "UC Browser", value: visits(9_000), color: 8 },
  ];
}

const storage: PieSlice[] = [
  { label: "Photos", value: 182, color: 1 },
  { label: "Video", value: 96, color: 2 },
  { label: "Apps", value: 58, color: 3 },
  { label: "Documents", value: 21, color: 4 },
];

const gb = (n: number) => `${formatCompact(n)} GB`;

const oneSlice: PieSlice[] = [{ label: "Photos", value: 182 }];

/* ====================================================================== */
/* Stacked area                                                            */
/* ====================================================================== */

export function StackedAreaChartPage() {
  const [seed, setSeed] = useState(1);
  const [mode, setMode] = useState<"stacked" | "percent">("stacked");
  const [curve, setCurve] = useState<"linear" | "monotone">("linear");
  const [range, setRange] = useState<"6" | "12">("12");
  const traffic = trafficData(seed).slice(-Number(range));

  return (
    <Page
      eyebrow="Chart"
      title="Stacked area chart"
      description="How a total builds up from its parts over time, or (in percent mode) how the mix shifts. Bands are separated by a real 2px gap, the crosshair lists every series plus the total, and bands rise from the baseline on entry and morph when the data changes."
      source={[
        "theme/src/components/charts/stacked-area-chart.tsx",
        "theme/src/components/charts/percent-bar-chart.tsx",
      ]}
    >
      <StackedAreaStage />
      <Example
        title="Stacked and 100% stacked"
        description="Switch the mode, the curve and the range: the bands morph between them. Hover, tap, or focus the chart and use the arrow keys."
        variant="bare"
        controls={
          <>
            <Segmented
              label="Mode"
              size="sm"
              options={
                [
                  { value: "stacked", label: "Stacked" },
                  { value: "percent", label: "100%" },
                ] as const
              }
              value={mode}
              onValueChange={setMode}
            />
            <Segmented
              label="Curve"
              size="sm"
              options={
                [
                  { value: "linear", label: "Linear" },
                  { value: "monotone", label: "Monotone" },
                ] as const
              }
              value={curve}
              onValueChange={setCurve}
            />
            <Segmented
              label="Range"
              size="sm"
              options={
                [
                  { value: "6", label: "6 months" },
                  { value: "12", label: "12 months" },
                ] as const
              }
              value={range}
              onValueChange={setRange}
            />
            <Shuffle onClick={() => setSeed((s) => s + 1)} />
          </>
        }
        code={`
import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jun", organic: 41000, paid: 23000, referral: 9800, social: 6400 },
  { month: "Jul", organic: 44200, paid: 24100, referral: 10300, social: 7100 },
  { month: "Aug", organic: 46900, paid: 26800, referral: 11200, social: 7600 },
  { month: "Sep", organic: 49100, paid: 27500, referral: 11900, social: 8800 },
  { month: "Oct", organic: 52300, paid: 29400, referral: 12600, social: 9300 },
];
const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "social", label: "Social", color: 4 },
];

export function Example() {
  return (
    <ChartCard
      title="Sessions by channel"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable data={data} index="month" series={series} mode="stacked" />}
    >
      <StackedAreaChart
        data={data}
        index="month"
        mode="stacked" // or "percent"
        curve="linear" // or "monotone"
        series={series}
        aria-label="Monthly sessions by channel, stacked"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by channel"
          description={mode === "percent" ? "Share of monthly sessions" : "Monthly sessions"}
          legend={seriesLegend(trafficSeries, "rect")}
          table={
            <StackedAreaTable
              data={traffic}
              index="month"
              indexLabel="Month"
              series={trafficSeries}
              mode={mode}
              caption={mode === "percent" ? "Share of monthly sessions by channel" : "Monthly sessions by channel"}
            />
          }
        >
          <StackedAreaChart
            data={traffic}
            index="month"
            series={trafficSeries}
            mode={mode}
            curve={curve}
            aria-label={
              mode === "percent" ? "Share of monthly sessions by channel" : "Monthly sessions by channel, stacked"
            }
          />
        </ChartCard>
      </Example>

      <Example
        title="Share of a whole"
        description='mode="percent" scales every quarter to 100%. The tooltip leads with the share and keeps the raw value beside it; the table view shows both.'
        variant="bare"
        code={`
import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { quarter: "Q1 ’25", desktop: 41000, mobile: 39000, tablet: 5800 },
  { quarter: "Q2 ’25", desktop: 38500, mobile: 43500, tablet: 5500 },
  { quarter: "Q3 ’25", desktop: 36200, mobile: 47800, tablet: 5300 },
  { quarter: "Q4 ’25", desktop: 33800, mobile: 52400, tablet: 5000 },
];
const series: ChartSeries[] = [
  { key: "desktop", label: "Desktop", color: 1 },
  { key: "mobile", label: "Mobile", color: 2 },
  { key: "tablet", label: "Tablet", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Sessions by device"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable mode="percent" data={data} index="quarter" series={series} />}
    >
      <StackedAreaChart mode="percent" curve="monotone" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by device"
          description={
            mobileOvertook ? `Mobile overtook desktop in ${mobileOvertook}` : "Share of sessions per quarter"
          }
          legend={seriesLegend(deviceSeries, "rect")}
          table={
            <StackedAreaTable
              mode="percent"
              data={devices}
              index="quarter"
              indexLabel="Quarter"
              series={deviceSeries}
              caption="Share of sessions by device, per quarter (area chart)"
            />
          }
        >
          <StackedAreaChart
            mode="percent"
            curve="monotone"
            data={devices}
            index="quarter"
            series={deviceSeries}
            height={240}
            aria-label="Share of sessions by device, per quarter"
          />
        </ChartCard>
      </Example>

      <Example
        title="Edge cases"
        description="One data point draws a flat band across the plot; a month with no values breaks a 100% chart around a dashed “no data” column instead of dipping to 0%; no data keeps the chart's footprint."
        variant="bare"
        stageClassName="grid gap-6 lg:grid-cols-2"
        code={`
import { StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const plans: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];
const signups = [
  { month: "May", free: 420, pro: 160, team: 40 },
  { month: "Jun", free: 460, pro: 190, team: 55 },
  { month: "Jul", free: 0, pro: 0, team: 0 },
  { month: "Aug", free: 510, pro: 230, team: 70 },
];

export function Example() {
  return (
    <>
      <StackedAreaChart data={[{ month: "Oct", organic: 41000, paid: 23000 }]} index="month" series={series} aria-label="Sessions in October" />
      <StackedAreaChart mode="percent" data={signups} index="month" series={plans} aria-label="Share of signups by plan" /> {/* July adds up to 0: a gap */}
      <StackedAreaChart data={[]} index="month" series={series} emptyState="No sessions yet" aria-label="Sessions" />
    </>
  );
}`}
      >
        <ChartCard
          title="One month"
          legend={seriesLegend(trafficSeries.slice(0, 2), "rect")}
          table={
            <StackedAreaTable
              data={oneMonth}
              index="month"
              indexLabel="Month"
              series={trafficSeries.slice(0, 2)}
              caption="Sessions in October by channel"
            />
          }
        >
          <StackedAreaChart
            data={oneMonth}
            index="month"
            series={trafficSeries.slice(0, 2)}
            height={200}
            aria-label="Sessions in October by channel"
          />
        </ChartCard>
        <ChartCard
          title="A month with no signups"
          legend={seriesLegend(planSeries, "rect")}
          table={
            <StackedAreaTable
              mode="percent"
              data={signups}
              index="month"
              indexLabel="Month"
              series={planSeries}
              caption="Share of monthly signups by plan"
            />
          }
        >
          <StackedAreaChart
            mode="percent"
            data={signups}
            index="month"
            series={planSeries}
            height={200}
            aria-label="Share of monthly signups by plan; July had none"
          />
        </ChartCard>
        <ChartCard
          className="lg:col-span-2"
          title="No data"
          table={
            <StackedAreaTable
              data={[]}
              index="month"
              indexLabel="Month"
              series={trafficSeries}
              caption="Sessions by channel (no data)"
            />
          }
        >
          <StackedAreaChart
            data={[]}
            index="month"
            series={trafficSeries}
            height={200}
            emptyState="No sessions yet"
            aria-label="Sessions by channel"
          />
        </ChartCard>
      </Example>

      <PropsTable title="StackedAreaChart props" of={PROPS.StackedAreaChart} />
      <PropsTable as="h2" title="StackedAreaTable props" of={PROPS.StackedAreaTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / →", "Previous / next point."],
          ["Home / End", "Jump to the first / last point."],
          ["Escape", "Clear the reading."],
          ["Enter / Space on a legend key", "Hide or show that series (inside a ChartCard)."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every series' value and the total.",
          "StackedAreaTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "Reduced motion: the stacked areas appear at their final values and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* 100% bars                                                               */
/* ====================================================================== */

export function PercentBarChartPage() {
  const [seed, setSeed] = useState(1);
  const plans = planMix(seed);

  return (
    <Page
      eyebrow="Chart"
      title="100% stacked bars"
      description="Compare the mix inside each category, whatever its size: every bar is scaled to 100%. Hover a segment (or walk them with the arrow keys) to see its share and the value behind it."
      source="theme/src/components/charts/percent-bar-chart.tsx"
    >
      <PercentBarStage />
      <Example
        title="Horizontal, with shares"
        description="showValues prints a share inside a segment only when it fits with room to spare, on a surface chip that passes contrast on any color. Up/Down move between regions, Left/Right between segments."
        variant="bare"
        controls={<Shuffle onClick={() => setSeed((s) => s + 1)} />}
        code={`
import { ChartCard, seriesLegend, PercentBarTable, PercentBarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { region: "North America", free: 4200, pro: 2600, team: 1400 },
  { region: "Europe", free: 5100, pro: 2100, team: 900 },
  { region: "Asia Pacific", free: 7400, pro: 1500, team: 600 },
  { region: "Latin America", free: 2600, pro: 700, team: 180 },
];
const series: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Plan mix by region"
      legend={seriesLegend(series, "rect")}
      table={<PercentBarTable data={data} index="region" series={series} />}
    >
      <PercentBarChart showValues data={data} index="region" series={series} aria-label="Share of customers on each plan, by region" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Plan mix by region"
          description="Customers on each plan"
          legend={seriesLegend(planSeries, "rect")}
          table={
            <PercentBarTable
              data={plans}
              index="region"
              indexLabel="Region"
              series={planSeries}
              caption="Customers on each plan by region"
            />
          }
        >
          <PercentBarChart
            showValues
            data={plans}
            index="region"
            series={planSeries}
            aria-label="Share of customers on each plan, by region"
          />
        </ChartCard>
      </Example>

      <Example
        title="Vertical columns"
        description='layout="vertical". Left/Right move between quarters, Up/Down climb the stack.'
        variant="bare"
        code={`
import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { quarter: "Q1 ’25", desktop: 41000, mobile: 39000, tablet: 5800 },
  { quarter: "Q2 ’25", desktop: 38500, mobile: 43500, tablet: 5500 },
  { quarter: "Q3 ’25", desktop: 36200, mobile: 47800, tablet: 5300 },
  { quarter: "Q4 ’25", desktop: 33800, mobile: 52400, tablet: 5000 },
];
const series: ChartSeries[] = [
  { key: "desktop", label: "Desktop", color: 1 },
  { key: "mobile", label: "Mobile", color: 2 },
  { key: "tablet", label: "Tablet", color: 3 },
];

export function Example() {
  return <PercentBarChart layout="vertical" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by device"
          legend={seriesLegend(deviceSeries, "rect")}
          table={
            <PercentBarTable
              data={devices}
              index="quarter"
              indexLabel="Quarter"
              series={deviceSeries}
              caption="Share of sessions by device, per quarter (columns)"
            />
          }
        >
          <PercentBarChart
            layout="vertical"
            data={devices}
            index="quarter"
            series={deviceSeries}
            aria-label="Share of sessions by device, per quarter"
          />
        </ChartCard>
      </Example>

      <Example
        title="Zero rows and long names"
        description="A category whose values add up to 0 gets an empty track instead of a misleading bar; long names truncate (the full name is in the tooltip and the table)."
        variant="bare"
        code={`
import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "building", label: "Building", color: 1 },
  { key: "meetings", label: "Meetings", color: 2 },
  { key: "support", label: "Support", color: 3 },
];

export function Example() {
  return (
    <PercentBarChart
      showValues
      data={[
        { name: "Platform infrastructure and reliability", building: 52, meetings: 30, support: 18 },
        { name: "Design", building: 61, meetings: 31, support: 8 },
        { name: "New team", building: 0, meetings: 0, support: 0 }, // drawn as an empty track
      ]}
      index="name"
      series={series}
      format={(n) => n + " h"}
      aria-label="Share of time by activity, per team"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Time spent by team"
          legend={seriesLegend(timeSeries, "rect")}
          table={
            <PercentBarTable
              data={timeByTeam}
              index="name"
              indexLabel="Team"
              series={timeSeries}
              format={hours}
              caption="Time spent by team, by activity"
            />
          }
        >
          <PercentBarChart
            showValues
            data={timeByTeam}
            index="name"
            series={timeSeries}
            format={hours}
            aria-label="Share of time by activity, per team"
          />
        </ChartCard>
      </Example>

      <PropsTable title="PercentBarChart props" of={PROPS.PercentBarChart} />
      <PropsTable as="h2" title="PercentBarTable props" of={PROPS.PercentBarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / →", "Vertical layout: previous / next bar. Horizontal layout: previous / next segment of the bar."],
          ["↑ / ↓", "Vertical layout: previous / next segment of the bar. Horizontal layout: previous / next bar."],
          ["Home / End", "Jump to the first / last bar."],
          ["Escape", "Step out of a segment to the whole bar; press again to clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the segment's value and its share.",
          "For a non-visual reading, give ChartCard's table prop a PercentBarTable; the Chart / Table tabs then expose each value as plain table cells.",
          "With reduced motion on, the segments start at their final shares and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Pie                                                                     */
/* ====================================================================== */

const PiePatterns = lazyBlock(() => import("./ChartPatternsDemos").then((m) => m.PiePatternsDemo), {
  minHeight: "22rem",
});

export function PieChartPage() {
  const [seed, setSeed] = useState(1);
  const browsers = browserData(seed);
  const shown = foldSlices(browsers);

  return (
    <Page
      eyebrow="Chart"
      title="Pie chart"
      description={`Part-to-whole at a glance, never more than 6 slices: past that, the smallest fold into “Other”. Names sit outside the pie on leader lines only where they fit without colliding; the legend always carries every slice.`}
      source="theme/src/components/charts/pie-chart.tsx"
    >
      <PieStage />
      <Example
        title="Folding into “Other”"
        description={`8 browsers, ${shown.length} slices: the top five keep their color slot and the rest fold into a neutral “Other”, whose tooltip lists what's inside. The table view keeps every row.`}
        variant="bare"
        controls={<Shuffle onClick={() => setSeed((s) => s + 1)} />}
        code={`
import { ChartCard, PieTable, PieChart, type PieSlice } from "@sheenui/theme";

const data: PieSlice[] = [
  { label: "Chrome", value: 612000, color: 1 },
  { label: "Safari", value: 198000, color: 2 },
  { label: "Edge", value: 53000, color: 3 },
  { label: "Firefox", value: 34000, color: 4 },
  { label: "Other mobile", value: 26000, color: 5 },
  { label: "Opera", value: 22000, color: 6 },
  { label: "Brave", value: 11000, color: 7 },
  { label: "UC Browser", value: 9000, color: 8 },
]; // the smallest fold into "Other"

export function Example() {
  return (
    <ChartCard
      title="Visits by browser"
      table={<PieTable data={data} indexLabel="Browser" />}
    >
      <PieChart data={data} aria-label="Monthly visits by browser" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Visits by browser"
          description="Last 30 days"
          table={<PieTable data={browsers} indexLabel="Browser" caption="Visits by browser, last 30 days" />}
        >
          <PieChart data={browsers} height={280} aria-label="Visits by browser in the last 30 days" />
        </ChartCard>
      </Example>

      <Example
        title="Compact"
        description="In a narrow card the labels step aside for the legend, and the tooltip docks above the pie, clear of your finger."
        variant="bare"
        stageClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        code={`
import { formatCompact, PieChart, type PieSlice } from "@sheenui/theme";

const gb = (n: number) => formatCompact(n) + " GB";
const storage: PieSlice[] = [
  { label: "Photos", value: 182, color: 1 },
  { label: "Video", value: 96, color: 2 },
  { label: "Apps", value: 58, color: 3 },
  { label: "Documents", value: 21, color: 4 },
];

export function Example() {
  return (
    <>
      <PieChart data={storage} format={gb} outerLabels={false} height={200} aria-label="Storage used by type" />
      <PieChart data={[{ label: "Photos", value: 182 }]} format={gb} height={200} aria-label="Storage used by type (photos only)" /> {/* one slice: a full disc */}
      <PieChart data={[]} aria-label="Storage used by type" emptyState="Nothing stored yet" />
    </>
  );
}`}
      >
        <ChartCard
          title="Storage"
          description="236 GB of 512 GB"
          table={<PieTable data={storage} format={gb} indexLabel="Type" caption="Storage used by type" />}
        >
          <PieChart data={storage} format={gb} outerLabels={false} height={200} aria-label="Storage used by type" />
        </ChartCard>
        <ChartCard
          title="One slice"
          description="Only photos so far"
          table={
            <PieTable data={oneSlice} format={gb} indexLabel="Type" caption="Storage used by type (photos only)" />
          }
        >
          <PieChart data={oneSlice} format={gb} height={200} aria-label="Storage used by type" />
        </ChartCard>
        <ChartCard
          title="Empty"
          table={<PieTable data={[]} indexLabel="Type" caption="Storage used by type (empty)" />}
        >
          <PieChart data={[]} height={200} emptyState="Nothing stored yet" aria-label="Storage used by type" />
        </ChartCard>
      </Example>

      <Example
        title="Patterns"
        description="Hatch fills tell the slices apart without colour. They switch on by themselves above three slices; pass patterns to force them. The legend swatches carry the same hatch."
        variant="bare"
        code={`
import { ChartCard, PieChart, PieTable } from "@sheenui/theme";

const browsers = [
  { label: "Chrome", value: 62 },
  { label: "Safari", value: 21 },
  { label: "Firefox", value: 9 },
];

export function Example() {
  return (
    <ChartCard title="Browser share" table={<PieTable data={browsers} indexLabel="Browser" caption="Browser share" />}>
      <PieChart patterns data={browsers} aria-label="Browser share, hatched" />
    </ChartCard>
  );
}`}
      >
        <PiePatterns />
      </Example>

      <PropsTable
        title="PieChart props"
        of={PROPS.PieChart}
        rows={[
          [
            "PieTable",
            "{ data, maxSlices?, format?, formatPercent?, indexLabel?, caption?, labels? }",
            "",
            "Table view: every row, its value and share, marking rows drawn inside “Other”.",
          ],
          [
            "foldSlices(data, maxSlices?)",
            "FoldedSlice[]",
            "",
            "The slices exactly as the chart draws them (id, label, value, share, color, slot, members).",
          ],
        ]}
      />
      <PropsTable as="h2" title="PieTable props" of={PROPS.PieTable} />
      <section aria-labelledby="pie-when-not" className="flex flex-col gap-2">
        <h2 id="pie-when-not" className="text-xl font-semibold tracking-tight">
          When not to use a pie
        </h2>
        <p className="max-w-3xl text-sm text-pretty text-sheen-fg-muted">
          To compare close values, or to show change over time, use bars or lines. Two slices read better as a single
          number or a meter.
        </p>
      </section>
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["→ / ↓", "Next slice."],
          ["← / ↑", "Previous slice."],
          ["Home / End", "Jump to the first / last slice."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the slice, its value and its share.",
          "PieTable is the table view and lists every original row, including slices folded into “Other”.",
          "Under reduced motion nothing morphs: the slices render at their final angles and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
