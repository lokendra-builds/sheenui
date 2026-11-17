import { useMemo } from "react";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Histogram, HistogramTable } from "@sheenui/theme";
import { BoxPlot, BoxPlotTable } from "@sheenui/theme";
import { LollipopChart, LollipopTable } from "@sheenui/theme";
import { GaugeChart, GaugeTable } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { ApdexExample, CpuExample, apdexBands, kusd } from "./ChartsDistributionPages/gauge-chart";
import { makeOrderValues, usd } from "./ChartsDistributionPages/histogram";
import { RegionLoadsExample, ViolinExample, deliveries, makeRegionLoads } from "./ChartsDistributionPages/box-plot";
import { AdoptionExample, adoption, pct0, signedPct, signupChange } from "./ChartsDistributionPages/lollipop-chart";
import { lazyBlock } from "../layout/lazy-block";
import { whenNear } from "./when-near";
import { CARD, CHARTS } from "./ChartsDistributionPages/shared";
import { days, makeLatencies, ms } from "./ChartsDistributionPages/shared";

/** The "Gauge" docs page (/charts/gauge-chart): live examples, props and notes. */
export function GaugeChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Gauge"
      description="One number against its scale: a semicircle or a 270° speedometer whose needle springs to the value, overshoots a touch and settles, while the arc lights up band by band. The number rolls into place under the hub with its band (icon and name, never color alone) and its distance from the target."
      source={`${CHARTS}gauge-chart.tsx`}
    >
      <ChartStage label="Gauge demo" title="Application health" hue={4} height="16.3125rem" narrowHeight="13.9375rem">
        <GaugeChart
          value={0.91}
          min={0}
          max={1}
          target={0.85}
          bands={apdexBands}
          label="Apdex"
          numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          aria-label="Apdex score"
        />
      </ChartStage>

      <ApdexExample />

      <CpuExample />

      <Example
        title="Plain arc, custom format"
        description="Without bands the arc fills with one color, lighter at the start. With format the number counts up instead of rolling its digits."
        variant="bare"
        code={`
import { GaugeChart } from "@sheenui/theme";

<GaugeChart
  value={68.4}
  max={120}
  color={3}
  label="Monthly recurring revenue"
  format={(n) => \`$\${Number(n.toFixed(1))}K\`}
  aria-label="Monthly recurring revenue against a $120K goal"
/>`}
      >
        <ChartCard
          className={CARD}
          title="Revenue goal"
          description="MRR against the $120K target for Q4"
          table={<GaugeTable value={68.4} max={120} measure="MRR" format={kusd} caption="Monthly recurring revenue" />}
        >
          <GaugeChart
            value={68.4}
            max={120}
            color={3}
            label="Monthly recurring revenue"
            format={kusd}
            height={240}
            aria-label="Monthly recurring revenue against a $120K goal"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.GaugeChart} />
      <PropsTable of={PROPS.GaugeTable} title="GaugeTable props" as="h3" />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Step through the value, the target and each band."],
          ["Home / End", "Jump to the first / last stop."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. The value, its band (icon and name) and its distance from the target are text, so status never rests on color alone.",
          "For a non-visual reading, give ChartCard's table prop a GaugeTable; the Chart / Table tabs then expose each value as plain table cells.",
          "Under reduced motion nothing morphs: the arc and the needle render at the final value and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}

// The bins example (Slider, Switch, Segmented and their Field code) is an island fetched when it is about to scroll
// into view; its server HTML stays on screen at full size meanwhile.
const LatencyExample = lazyBlock(
  () =>
    whenNear("histogram-latency")
      .then(() => import("./ChartsDistributionPages/histogram-latency"))
      .then((m) => m.LatencyExample),
  { minHeight: "34rem" },
);

/* ====================================================================== */
/* Histogram                                                              */
/* ====================================================================== */

export function HistogramPage() {
  const orders = useMemo(() => makeOrderValues(), []);
  const stageLatencies = useMemo(() => makeLatencies(), []);

  return (
    <Page
      eyebrow="Chart"
      title="Histogram"
      description="How a measure is spread: latencies, order values, scores. Bins come from the Freedman–Diaconis or Sturges rule, snapped to round edges, or from a count you choose. Overlay a smooth density curve and mark the median, mean or a percentile; every bin reads its count, share and the share at or below it."
      source={`${CHARTS}histogram.tsx`}
    >
      <ChartStage label="Histogram demo" title="API latency" hue={1} height="19rem">
        <Histogram
          values={stageLatencies}
          bins="auto"
          density
          markers={["median", "p95", { value: 300, label: "SLO" }]}
          format={ms}
          xLabel="Response time"
          aria-label="Distribution of API response times"
        />
      </ChartStage>

      <div id="histogram-latency">
        <LatencyExample />
      </div>

      <Example
        title="Density plot"
        description="bars={false} with density draws the smooth curve alone, on a gradient that fades to the baseline. Two peaks show at a glance: single items and bundles."
        variant="bare"
        code={`
import { Histogram } from "@sheenui/theme";

// Basket sizes in $ (a sample; yours is the full list)
const orderValues: number[] = [
  38, 42, 45, 47, 51, 36, 58, 44, 49, 62, 33, 54, 41, 46, 139, 148, 126, 155, 171, 133,
  144, 118, 162, 150, 52, 40, 143, 137, 48, 56,
];
const usd = (n: number) => "$" + Math.round(n);

export function Example() {
  return (
    <Histogram
      values={orderValues}
      bars={false}
      density
      measure="percent"
      markers={["median"]}
      format={usd}
      color={3}
      aria-label="Distribution of order values"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="Order value"
          description="Share of orders, last 30 days"
          table={<HistogramTable values={orders} format={usd} caption="Orders by value" />}
        >
          <Histogram
            values={orders}
            bars={false}
            density
            measure="percent"
            markers={["median"]}
            format={usd}
            color={3}
            height={240}
            aria-label="Distribution of order values"
          />
        </ChartCard>
      </Example>

      <Example
        title="Shares, fixed bins"
        description='measure="percent" sizes bars by their share of the sample; bins={8} asks for about eight bins; snapped to round $25 edges, that makes ten.'
        variant="bare"
        code={`
import { Histogram } from "@sheenui/theme";

// Basket sizes in $ (a sample; yours is the full list)
const orderValues: number[] = [
  38, 42, 45, 47, 51, 36, 58, 44, 49, 62, 33, 54, 41, 46, 139, 148, 126, 155, 171, 133,
  144, 118, 162, 150, 52, 40, 143, 137, 48, 56,
];
const usd = (n: number) => "$" + Math.round(n);

export function Example() {
  return (
    <Histogram
      values={orderValues}
      bins={8}
      measure="percent"
      markers={["mean"]}
      format={usd}
      color={7}
      aria-label="Orders by value, in $25 bins"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="Order value, binned"
          description="Share of orders in $25 bins"
          table={<HistogramTable values={orders} bins={8} format={usd} caption="Orders by value, in $25 bins" />}
        >
          <Histogram
            values={orders}
            bins={8}
            measure="percent"
            markers={["mean"]}
            format={usd}
            color={7}
            height={240}
            aria-label="Orders by value, in $25 bins"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.Histogram} />
      <PropsTable as="h2" title="HistogramTable props" of={PROPS.HistogramTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / → or ↓ / ↑", "Previous / next bin (← / → are mirrored in right-to-left)."],
          ["Home / End", "Jump to the first / last bin."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the bin's range, count, share and cumulative share.",
          "HistogramTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "Reduced motion: the bins appear at their final heights and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/** The "Box plot & violin" docs page (/charts/box-plot): live examples, props and notes. */
export function BoxPlotPage() {
  const stageLoads = useMemo(() => makeRegionLoads(), []);
  return (
    <Page
      eyebrow="Chart"
      title="Box plot & violin"
      description="Compare distributions across groups. The box spans the middle 50% with the median as a gap, whiskers reach the furthest values within 1.5 IQR, and outliers sit beyond, dodged so none hides another. The violin variant shows the full shape, so two-peaked groups can't hide behind a tidy box."
      source={[`${CHARTS}box-plot.tsx`, `${CHARTS}histogram.tsx`]}
    >
      <ChartStage label="Box plot demo" title="Page load by region" hue={1} height="18.75rem" narrowHeight="19.375rem">
        <BoxPlot data={stageLoads} showMean format={ms} valueLabel="Load time" aria-label="Page load times by region" />
      </ChartStage>

      <RegionLoadsExample />

      <ViolinExample />

      <Example
        title="Precomputed, sideways, one group emphasized"
        description='Pass a summary when you only have the statistics. orientation="horizontal" lays groups out as rows; a group&apos;s own color picks it out from the rest.'
        variant="bare"
        code={`
import { BoxPlot } from "@sheenui/theme";

<BoxPlot
  orientation="horizontal"
  color={7}
  data={[
    { label: "Parcelly", summary: { low: 1, q1: 2, median: 2.5, q3: 3, high: 4.5, n: 1840, outliers: [6, 7, 9] } },
    { label: "SwiftPost", summary: { low: 1, q1: 1.5, median: 2, q3: 2.5, high: 4, n: 2210, outliers: [5.5] } },
    { label: "RoadRunner", color: 8, summary: { low: 2, q1: 3, median: 4, q3: 5, high: 7.5, n: 960, outliers: [10, 11] } },
    { label: "Postal", summary: { low: 2, q1: 3, median: 3.5, q3: 4, high: 5.5, n: 3120 } },
  ]}
  format={(n) => \`\${n} d\`}
  includeZero
  aria-label="Delivery time by carrier"
/>`}
      >
        <ChartCard
          className={CARD}
          title="Delivery time"
          description="Days from dispatch, by carrier"
          table={<BoxPlotTable data={deliveries} format={days} caption="Delivery time by carrier" />}
        >
          <BoxPlot
            orientation="horizontal"
            color={7}
            data={deliveries}
            format={days}
            includeZero
            aria-label="Delivery time by carrier"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.BoxPlot} />
      <PropsTable as="h2" title="BoxPlotTable props" of={PROPS.BoxPlotTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          [
            "Arrow keys",
            "Along the group axis: move between groups. Along the value axis: step through the focused group's outliers.",
          ],
          ["Home / End", "Jump to the first / last group."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the group's statistics.",
          "BoxPlotTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists n, quartiles, median, mean and outliers.",
          "With reduced motion on, the boxes and whiskers start at their final values and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

/** The "Lollipop chart" docs page (/charts/lollipop): live examples, props and notes. */
export function LollipopChartPage() {
  // Inside the page, not at module scope: a top-level call on `adoption` kept the lollipop example module (and its chart) in every sibling route.
  const adoptionAverage = Math.round(adoption.reduce((s, d) => s + d.value, 0) / adoption.length);
  return (
    <Page
      eyebrow="Chart"
      title="Lollipop chart"
      description="A thin stem and a dot for each value: all the reading of a bar chart with a fraction of the ink, so a long ranked list stays calm. Stems fade towards the baseline, a reference line marks the average or target, and highlight picks out the items the story is about."
      source={[`${CHARTS}lollipop-chart.tsx`, `${CHARTS}histogram.tsx`]}
    >
      <ChartStage label="Lollipop chart demo" title="Feature adoption" hue={1} height="24.25rem">
        <LollipopChart
          data={adoption}
          sort="descending"
          reference={{ value: adoptionAverage, label: "Average" }}
          highlight={["Alerts", "Scheduled reports"]}
          format={pct0}
          aria-label="Share of accounts using each feature"
        />
      </ChartStage>

      <AdoptionExample />

      <Example
        title="Upright, around a baseline"
        description="Month-on-month change in signups. Values below the baseline reach down, so growth and decline read at a glance; the sign is in every label, never only in the direction."
        variant="bare"
        code={`
import { LollipopChart, type LollipopItem } from "@sheenui/theme";

const signupChange: LollipopItem[] = [
  { label: "Jan", value: 12 },
  { label: "Feb", value: 8 },
  { label: "Mar", value: -4 },
  { label: "Apr", value: 15 },
  { label: "May", value: 21 },
  { label: "Jun", value: -9 },
];
const signed = (n: number) => (n > 0 ? "+" : "") + n + "%";

export function Example() {
  return (
    <LollipopChart
      layout="vertical"
      data={signupChange}
      color={7}
      format={signed}
      valueLabel="Change in signups"
      aria-label="Month-on-month change in signups"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="Signup growth"
          description="In 2025, the change on the previous month"
          table={
            <LollipopTable
              data={signupChange}
              format={signedPct}
              valueLabel="Change"
              caption="Month-on-month change in signups"
            />
          }
        >
          <LollipopChart
            layout="vertical"
            data={signupChange}
            color={7}
            format={signedPct}
            valueLabel="Change in signups"
            height={280}
            aria-label="Month-on-month change in signups"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.LollipopChart} />
      <PropsTable as="h2" title="LollipopTable props" of={PROPS.LollipopTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Along the item axis (↑ / ↓ for horizontal, ← / → for vertical): previous / next item."],
          ["Home / End", "Jump to the first / last item."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the item, its value and its difference from the reference line.",
          "LollipopTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "Under reduced motion nothing morphs: the stems and dots render at their final values and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
