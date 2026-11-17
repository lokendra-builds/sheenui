import { useState } from "react";
import { Button, ChartTable, formatCompact, seriesLegend, type ChartSeries } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { RadarChart } from "@sheenui/theme";
import { RadialBarChart, RadialBarTable, type RadialBarItem } from "@sheenui/theme";
import { BulletChart, BulletTable, bulletLegend, type BulletItem } from "@sheenui/theme";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import * as PROPS from "../generated/component-props";
import { CHARTS, usdK } from "./ChartsRadialPages/shared";

/* ====================================================================== */
/* Radar                                                                  */
/* ====================================================================== */

const scorecards = {
  q2: [
    { metric: "Performance", previous: 72, current: 84 },
    { metric: "Accessibility", previous: 81, current: 93 },
    { metric: "Reliability", previous: 90, current: 88 },
    { metric: "Security", previous: 66, current: 79 },
    { metric: "Test coverage", previous: 58, current: 71 },
    { metric: "Docs", previous: 70, current: 62 },
  ],
  q3: [
    { metric: "Performance", previous: 84, current: 95 },
    { metric: "Accessibility", previous: 93, current: 97 },
    { metric: "Reliability", previous: 88, current: 93 },
    { metric: "Security", previous: 79, current: 86 },
    { metric: "Test coverage", previous: 71, current: 83 },
    { metric: "Docs", previous: 62, current: 80 },
  ],
};

const releaseSeries: ChartSeries[] = [
  { key: "previous", label: "Last release", color: 2 },
  { key: "current", label: "This release", color: 1 },
];

const support = [
  { area: "First response time", team: 82, benchmark: 70 },
  { area: "Resolution time", team: 64, benchmark: 72 },
  { area: "Customer satisfaction", team: 91, benchmark: 80 },
  { area: "Reopened tickets", team: 58, benchmark: 66 },
  { area: "Self-service deflection", team: 47, benchmark: 55 },
  { area: "Escalation rate", team: 73, benchmark: 61 },
  { area: "Knowledge base coverage", team: 69, benchmark: 74 },
  { area: "Agent utilization", team: 77, benchmark: 70 },
  { area: "SLA attainment", team: 88, benchmark: 83 },
  { area: "Quality review score", team: 80, benchmark: 76 },
];

const supportSeries: ChartSeries[] = [
  { key: "team", label: "Our team", color: 1 },
  { key: "benchmark", label: "Industry benchmark", color: 3 },
];

const roasts = [
  { note: "Acidity", ethiopia: 8.5, colombia: 6, sumatra: 3.5 },
  { note: "Sweetness", ethiopia: 7, colombia: 7.5, sumatra: 5 },
  { note: "Body", ethiopia: 4.5, colombia: 6.5, sumatra: 8.5 },
  { note: "Bitterness", ethiopia: 3, colombia: 5, sumatra: 7 },
  { note: "Aroma", ethiopia: 9, colombia: 7, sumatra: 6.5 },
  { note: "Aftertaste", ethiopia: 7.5, colombia: 6.5, sumatra: 7.5 },
];

const roastSeries: ChartSeries[] = [
  { key: "ethiopia", label: "Ethiopia", color: 2 },
  { key: "colombia", label: "Colombia", color: 3 },
  { key: "sumatra", label: "Sumatra", color: 1 },
];

/** The "Radar chart" docs page (/charts/radar-chart): live examples, props and notes. */
export function RadarChartPage() {
  const [quarter, setQuarter] = useState<"q2" | "q3">("q3");
  const data = scorecards[quarter];
  return (
    <Page
      eyebrow="Chart"
      title="Radar chart"
      description="Compare a few profiles across the same set of measures. Rings follow the spokes, axis names are laid out so they never collide or leave the chart, and hovering, tapping or arrowing around the chart reads every series on one axis. On a phone the readout sits in its own band above the shape, so a tap never hides the data."
      source={`${CHARTS}radar-chart.tsx`}
    >
      <ChartStage
        label="Radar chart demo"
        title="Release quality scores"
        hue={2}
        height="20rem"
        narrowHeight="11.6875rem"
      >
        <RadarChart
          data={scorecards.q3}
          index="metric"
          series={releaseSeries}
          max={100}
          aria-label="Release quality scores, this release against the last"
        />
      </ChartStage>
      <Example
        title="Two series, morphing data"
        description="Two series on a 0–100 scale. Switch the quarter: the shapes morph to the new values instead of redrawing. Focus the chart and use the arrow keys to walk the axes."
        variant="bare"
        controls={
          <Segmented
            label="Quarter"
            size="sm"
            options={[
              { value: "q2", label: "Q2" },
              { value: "q3", label: "Q3" },
            ]}
            value={quarter}
            onValueChange={setQuarter}
          />
        }
        code={`
import { ChartCard, seriesLegend, ChartTable, RadarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { metric: "Performance", previous: 84, current: 95 },
  { metric: "Accessibility", previous: 93, current: 97 },
  { metric: "Reliability", previous: 88, current: 93 },
  { metric: "Security", previous: 79, current: 86 },
  { metric: "Test coverage", previous: 71, current: 83 },
  { metric: "Docs", previous: 62, current: 80 },
];
const series: ChartSeries[] = [
  { key: "previous", label: "Last release", color: 2 },
  { key: "current", label: "This release", color: 1 },
];

<ChartCard
  title="Release scorecard"
  legend={seriesLegend(series, "rect")}
  table={<ChartTable data={data} index="metric" indexLabel="Measure" series={series} />}
>
  <RadarChart
    data={data}
    index="metric"
    series={series}
    max={100}
    aria-label="Release quality scores, this release against the last"
  />
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="Release scorecard"
          description={`Quality audit, ${quarter.toUpperCase()}, out of 100 points`}
          legend={seriesLegend(releaseSeries, "rect")}
          table={<ChartTable data={data} index="metric" indexLabel="Measure" series={releaseSeries} />}
        >
          <RadarChart
            data={data}
            index="metric"
            series={releaseSeries}
            max={100}
            aria-label="Release quality scores, this release against the last"
          />
        </ChartCard>
      </Example>

      <div className="grid grid-cols-1 gap-6 *:min-w-0 xl:grid-cols-2">
        <Example
          title="Long axis names"
          description="Ten axes with long names in a half-width card. Names are measured in the chart's font, and long ones wrap onto two lines. Only when a name truly can't fit is it shortened, and only the ones that limit the shape, never below eight letters. On a small screen every other name may step back and reappear while its axis is active. Full names stay in the tooltip and the table."
          variant="bare"
          code={`
import { RadarChart, type ChartSeries } from "@sheenui/theme";

const support = [
  { area: "First response time", team: 82, benchmark: 70 },
  { area: "Resolution time", team: 64, benchmark: 72 },
  { area: "Customer satisfaction", team: 91, benchmark: 80 },
  { area: "Reopened tickets", team: 58, benchmark: 66 },
  { area: "Self-service deflection", team: 47, benchmark: 55 },
  { area: "Escalation rate", team: 73, benchmark: 61 },
];

const series: ChartSeries[] = [
  { key: "team", label: "Our team", color: 1 },
  { key: "benchmark", label: "Industry benchmark", color: 3 },
];

export function Example() {
  return (
    <RadarChart
      data={support}
      index="area"
      series={series}
      max={100}
      aria-label="Support quality against the industry benchmark"
    />
  );
}`}
        >
          <ChartCard
            title="Support quality"
            description="Percentile, last 90 days"
            legend={seriesLegend(supportSeries, "rect")}
            table={<ChartTable data={support} index="area" indexLabel="Measure" series={supportSeries} />}
          >
            <RadarChart
              data={support}
              index="area"
              series={supportSeries}
              max={100}
              aria-label="Support quality against the industry benchmark"
            />
          </ChartCard>
        </Example>

        <Example
          title="Round grid, three series"
          description='grid="circle" draws round rings. The scale tops out at a round number above the largest value unless you pass max.'
          variant="bare"
          code={`
import { RadarChart, type ChartSeries } from "@sheenui/theme";

const roasts = [
  { note: "Acidity", ethiopia: 8.5, colombia: 6, sumatra: 3.5 },
  { note: "Sweetness", ethiopia: 7, colombia: 7.5, sumatra: 5 },
  { note: "Body", ethiopia: 4.5, colombia: 6.5, sumatra: 8.5 },
  { note: "Bitterness", ethiopia: 3, colombia: 5, sumatra: 7 },
  { note: "Aroma", ethiopia: 9, colombia: 7, sumatra: 6.5 },
];

const series: ChartSeries[] = [
  { key: "ethiopia", label: "Ethiopia", color: 2 },
  { key: "colombia", label: "Colombia", color: 3 },
  { key: "sumatra", label: "Sumatra", color: 1 },
];

export function Example() {
  return (
    <RadarChart
      grid="circle"
      data={roasts}
      index="note"
      series={series}
      max={10}
      aria-label="Flavor profile of three single-origin coffees"
    />
  );
}`}
        >
          <ChartCard
            title="Flavor profile"
            description="Cupping scores out of 10"
            legend={seriesLegend(roastSeries, "rect")}
            table={<ChartTable data={roasts} index="note" indexLabel="Note" series={roastSeries} />}
          >
            <RadarChart
              grid="circle"
              data={roasts}
              index="note"
              series={roastSeries}
              max={10}
              aria-label="Flavor profile of three single-origin coffees"
            />
          </ChartCard>
        </Example>
      </div>

      <PropsTable of={PROPS.RadarChart} />
      <PropsTable as="h2" title="RadarTable props" of={PROPS.RadarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Move between axes."],
          ["Home / End", "Jump to the first / last axis."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the axis and every series' value.",
          "RadarTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.",
          "Reduced motion: the polygons appear at their final shape and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Radial bar                                                             */
/* ====================================================================== */

const goals: RadialBarItem[] = [
  { label: "New ARR", value: 82, color: 1 },
  { label: "Expansion", value: 64, color: 2 },
  { label: "Retention", value: 91, color: 3 },
  { label: "Pipeline", value: 47, color: 7 },
];

const activityDays: RadialBarItem[][] = [
  [
    { label: "Steps", value: 8240, max: 10000, color: 1 },
    { label: "Active minutes", value: 42, max: 60, color: 3 },
    { label: "Calories", value: 380, max: 500, color: 2 },
  ],
  [
    { label: "Steps", value: 10450, max: 10000, color: 1 },
    { label: "Active minutes", value: 25, max: 60, color: 3 },
    { label: "Calories", value: 455, max: 500, color: 2 },
  ],
];

/** The "Radial bar chart" docs page (/charts/radial-bar-chart): live examples, props and notes. */
export function RadialBarChartPage() {
  const [day, setDay] = useState(0);
  const activity = activityDays[day] ?? [];
  const average = Math.round(
    (activity.reduce((s, a) => s + Math.min(1, a.value / (a.max ?? 100)), 0) / Math.max(1, activity.length)) * 100,
  );
  return (
    <Page
      eyebrow="Chart"
      title="Radial bar chart"
      description="Concentric rings for 2–5 measures against their goals. Each ring sits on a track in a lighter step of its own color; the data end has the same 4px rounding as a bar. Hover a ring (or arrow through them) to read it in the center."
      source={`${CHARTS}radial-bar-chart.tsx`}
    >
      <ChartStage label="Radial bar chart demo" title="Quarterly goals" hue={1} height="16.25rem">
        <RadialBarChart
          data={goals}
          centerValue="71%"
          centerLabel="Overall"
          aria-label="Quarterly goals, percent reached"
        />
      </ChartStage>
      <div className="grid grid-cols-1 gap-6 *:min-w-0 lg:grid-cols-2">
        <Example
          title="Three-quarter arcs"
          description="The default. Each ring's name and value sit in the open quarter, right where the ring starts: no legend to cross-reference."
          variant="bare"
          code={`
import { RadialBarChart } from "@sheenui/theme";

<RadialBarChart
  data={[
    { label: "New ARR", value: 82, color: 1 },
    { label: "Expansion", value: 64, color: 2 },
    { label: "Retention", value: 91, color: 3 },
    { label: "Pipeline", value: 47, color: 7 },
  ]}
  centerValue="71%"
  centerLabel="Overall"
  aria-label="Quarterly goals, percent reached"
/>`}
        >
          <ChartCard
            title="Quarterly goals"
            description="Share of target reached, Q3"
            table={<RadialBarTable data={goals} caption="Quarterly goals" />}
          >
            <RadialBarChart
              data={goals}
              centerValue="71%"
              centerLabel="Overall"
              aria-label="Quarterly goals, percent reached"
            />
          </ChartCard>
        </Example>

        <Example
          title="Full rings with a legend"
          description='variant="ring" closes the rings (a 2px gap marks the seam) and lists the measures beside them. Each item can bring its own max; values past it fill the ring and still print in full.'
          variant="bare"
          controls={
            <Segmented
              label="Day"
              size="sm"
              options={[
                { value: "0", label: "Today" },
                { value: "1", label: "Yesterday" },
              ]}
              value={String(day) as "0" | "1"}
              onValueChange={(v) => setDay(Number(v))}
            />
          }
          code={`
import { RadialBarChart } from "@sheenui/theme";

<RadialBarChart
  variant="ring"
  display="value"
  diameter={220}
  data={[
    { label: "Steps", value: 8240, max: 10000, color: 1 },
    { label: "Active minutes", value: 42, max: 60, color: 3 },
    { label: "Calories", value: 380, max: 500, color: 2 },
  ]}
  centerValue="76%"
  centerLabel="Daily goals"
  aria-label="Activity against daily goals"
/>`}
        >
          <ChartCard
            title="Activity"
            description={day === 0 ? "Today" : "Yesterday"}
            table={<RadialBarTable data={activity} caption="Activity against daily goals" />}
          >
            <RadialBarChart
              variant="ring"
              display="value"
              diameter={220}
              data={activity}
              centerValue={`${average}%`}
              centerLabel="Daily goals"
              aria-label="Activity against daily goals"
            />
          </ChartCard>
        </Example>
      </div>

      <PropsTable of={PROPS.RadialBarChart} />
      <PropsTable as="h3" title="RadialBarTable" of={PROPS.RadialBarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Move between measures."],
          ["Home / End", "Jump to the first / last measure."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the measure, its value and its share.",
          "For a non-visual reading, give ChartCard's table prop a RadialBarTable; the Chart / Table tabs then expose each value as plain table cells.",
          "With reduced motion on, the rings start at their final lengths and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

const kpiRows: BulletItem[] = [
  { label: "Revenue", description: "US$, thousands", value: 270, target: 250, ranges: [150, 225, 300], format: usdK },
  { label: "Profit", description: "Margin, %", value: 22.5, target: 26, ranges: [20, 25, 30], format: (n) => `${n}%` },
  {
    label: "Order size",
    description: "US$, average",
    value: 320,
    target: 550,
    ranges: [350, 500, 600],
    format: (n) => `$${formatCompact(n)}`,
  },
  { label: "New customers", description: "This quarter", value: 1650, target: 2100, ranges: [1400, 2000, 2500] },
  { label: "Satisfaction", description: "Out of 5", value: 4.5, target: 4.2, ranges: [3.5, 4.25, 5], max: 5 },
];

const latencySnapshots: BulletItem[][] = [
  [
    { label: "p50", description: "Median request", value: 118, target: 150, ranges: [200, 400, 1000] },
    { label: "p90", description: "Slowest 10%", value: 342, target: 300, ranges: [200, 400, 1000] },
    { label: "p99", description: "Slowest 1%", value: 780, target: 900, ranges: [200, 400, 1000] },
  ],
  [
    { label: "p50", description: "Median request", value: 96, target: 150, ranges: [200, 400, 1000] },
    { label: "p90", description: "Slowest 10%", value: 268, target: 300, ranges: [200, 400, 1000] },
    { label: "p99", description: "Slowest 1%", value: 940, target: 900, ranges: [200, 400, 1000] },
  ],
];

const ms = (n: number) => `${formatCompact(n)} ms`;

const latencyLabels = { ranges: ["Fast", "Acceptable", "Slow"] };

/** The "Bullet chart" docs page (/charts/bullet-chart): live examples, props and notes. */
export function BulletChartPage() {
  const [snapshot, setSnapshot] = useState(0);
  const latency = (latencySnapshots[snapshot] ?? []).map((row) => ({
    ...row,
    higherIsBetter: false,
    color: 3 as const,
  }));
  return (
    <Page
      eyebrow="Chart"
      title="Bullet chart"
      description="Stephen Few's compact gauge: the measure as a thin bar, the target as an ink marker across it, and qualitative ranges as neutral shades behind. Many rows fit where one gauge would. Each value carries its delta against target, with an arrow and a sign so color is never the only signal."
      source={`${CHARTS}bullet-chart.tsx`}
    >
      <ChartStage label="Bullet chart demo" title="Q3 performance" hue={1} height="21.375rem" narrowHeight="35.125rem">
        <BulletChart data={kpiRows} aria-label="Q3 performance against targets" />
      </ChartStage>
      <Example
        title="KPI dashboard"
        description="Each row has its own scale (different units), ticked underneath. Rows can bring their own format. On phones the names move above each bullet."
        variant="bare"
        code={`
import { formatCompact, ChartCard, bulletLegend, BulletTable, BulletChart, type BulletItem } from "@sheenui/theme";

const usdK = (n: number) => (n === 0 ? "$0" : \`$\${formatCompact(n)}K\`);
const rows: BulletItem[] = [
  { label: "Revenue", description: "US$, thousands", value: 270, target: 250, ranges: [150, 225, 300], format: usdK },
  { label: "Profit", description: "Margin, %", value: 22.5, target: 26, ranges: [20, 25, 30], format: (n) => \`\${n}%\` },
  { label: "Order size", description: "US$, average", value: 320, target: 550, ranges: [350, 500, 600], format: (n) => \`$\${formatCompact(n)}\` },
  { label: "New customers", description: "This quarter", value: 1650, target: 2100, ranges: [1400, 2000, 2500] },
  { label: "Satisfaction", description: "Out of 5", value: 4.5, target: 4.2, ranges: [3.5, 4.25, 5], max: 5 },
];

<ChartCard
  title="Q3 performance"
  legend={bulletLegend()}
  table={<BulletTable data={rows} caption="Q3 performance against targets" />}
>
  <BulletChart data={rows} aria-label="Q3 performance against targets" />
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="Q3 performance"
          description="Actual against target, with poor / fair / good ranges"
          legend={bulletLegend()}
          table={<BulletTable data={kpiRows} caption="Q3 performance against targets" />}
        >
          <BulletChart data={kpiRows} aria-label="Q3 performance against targets" />
        </ChartCard>
      </Example>

      <Example
        title="Shared scale, lower is better"
        description='scale="shared" puts every row on one axis, so lengths compare across rows. With higherIsBetter: false, beating the target means coming in under it; the range names come from labels.'
        variant="bare"
        controls={
          <Button variant="glass" size="sm" onClick={() => setSnapshot((s) => 1 - s)}>
            {snapshot === 0 ? "Show after the fix" : "Show before the fix"}
          </Button>
        }
        code={`
import { BulletChart, formatCompact } from "@sheenui/theme";

<BulletChart
  scale="shared"
  format={(n) => \`\${formatCompact(n)} ms\`}
  labels={{ ranges: ["Fast", "Acceptable", "Slow"] }}
  data={[
    { label: "p50", value: 118, target: 150, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
    { label: "p90", value: 342, target: 300, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
    { label: "p99", value: 780, target: 900, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
  ]}
  aria-label="API latency against SLO targets"
/>`}
      >
        <ChartCard
          className="w-full"
          title="API latency"
          description={
            snapshot === 0 ? "Last 24 hours, against SLO targets" : "After the cache fix, against SLO targets"
          }
          legend={bulletLegend(latencyLabels, 3)}
          table={
            <BulletTable data={latency} format={ms} labels={latencyLabels} caption="API latency against SLO targets" />
          }
        >
          <BulletChart
            scale="shared"
            format={ms}
            labels={latencyLabels}
            data={latency}
            aria-label="API latency against SLO targets"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.BulletChart} />
      <PropsTable
        as="h3"
        title="BulletItem"
        rows={[
          ["label / description", "string", "", "Name, and an optional unit or context line under it."],
          ["value", "number", "", "Required. The measure, drawn as the bar."],
          ["target", "number", "", "Sets the comparative measure, drawn as the marker."],
          [
            "ranges",
            "number[]",
            "",
            "Upper bounds of the qualitative ranges, lowest first. The last stretches to the end of the scale.",
          ],
          ["rangeLabels", "string[]", "labels.ranges", "Names of this row's ranges, lowest first."],
          ["min / max", "number", "0 / nice max", "Ends of the row's scale."],
          [
            "higherIsBetter",
            "boolean",
            "true",
            "Whether beating the target is good (revenue) or bad (costs, latency).",
          ],
          ["color", "1–8", "1", "Sets the palette slot of the bar."],
          ["format", "(n) => string", "", "Formats the numbers of this row for labels and the tooltip."],
        ]}
      />
      <PropsTable
        as="h3"
        title="bulletLegend / BulletTable"
        of={PROPS.BulletTable}
        rows={[
          [
            "bulletLegend(labels?, color?, rangeCount?)",
            "LegendItem[]",
            "",
            "Legend items for ChartCard: actual, target and the range shades.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↑ / ↓ / ← / →", "Move between rows."],
          ["Home / End", "Jump to the first / last row."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the row's actual, target and delta.",
          "BulletTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "Under reduced motion nothing morphs: the bars and the target tick render at their final values and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
