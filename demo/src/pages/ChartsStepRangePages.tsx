import { useState } from "react";
import {
  Button,
  ChartTable,
  GlassCard,
  formatCompact,
  seriesLegend,
  type ChartRow,
  type ChartSeries,
} from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { StepLineChart, type StepCurve } from "@sheenui/theme";
import { RangeAreaChart, RangeAreaTable, rangeAreaLegend, type RangeSeries } from "@sheenui/theme";
import { Sparkbar } from "@sheenui/theme";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import * as PROPS from "../generated/component-props";
import { CHARTS, usdK } from "./ChartsRadialPages/shared";

/* ====================================================================== */
/* Step line                                                              */
/* ====================================================================== */

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const pricing = months.map((month, i) => ({
  month,
  pro: i < 3 ? 42 : i < 7 ? 45 : 48,
  team: i < 4 ? 50 : i < 9 ? 54 : 57,
  enterprise: i < 6 ? 60 : 66,
}));

const pricingSeries: ChartSeries[] = [
  { key: "enterprise", label: "Enterprise", color: 3 },
  { key: "team", label: "Team", color: 2 },
  { key: "pro", label: "Pro", color: 1 },
];

const seats = months.map((month, i) => ({
  month,
  seats: [120, 120, 135, 135, 150, 180, 180, 210, 210, 240, 236, 262][i] ?? 0,
}));

const seatSeries: ChartSeries[] = [{ key: "seats", label: "Seats", color: 1 }];

const curves = [
  { value: "step-after", label: "After" },
  { value: "step", label: "Middle" },
  { value: "step-before", label: "Before" },
] as const;

/** The "Step line chart" docs page (/charts/step-line-chart): live examples, props and notes. */
export function StepLineChartPage() {
  const [curve, setCurve] = useState<StepCurve>("step-after");
  const [axis, setAxis] = useState<"data" | "zero">("data");
  const usd = (n: number) => `$${formatCompact(n)}`;
  return (
    <Page
      eyebrow="Chart"
      title="Step line chart"
      description="For values that hold, then jump: prices, plan limits, rates, headcount. Each value stays flat for exactly one step, so the hover band shows how long it held and the crosshair snaps to the step under the pointer."
      source={`${CHARTS}step-line-chart.tsx`}
    >
      <ChartStage
        label="Step line chart demo"
        title="Price per seat"
        hue={3}
        height="16.25rem"
        legend={seriesLegend(pricingSeries, "line")}
      >
        <StepLineChart
          curve="step-after"
          zero={false}
          data={pricing}
          index="month"
          series={pricingSeries}
          format={usd}
          aria-label="Monthly price per seat, by plan"
        />
      </ChartStage>
      <Example
        title="Price changes"
        description='The curve sets where each label sits on its step: "step-after" (the value starts at its label), "step" (mid-step) or "step-before" (the value is reached at its label). The line is the same; only the anchors move. Prices sit far from zero, so zero={false} lets the axis hug them instead of squashing every step into the top of the plot.'
        variant="bare"
        controls={
          <>
            <Segmented label="Step position" size="sm" options={curves} value={curve} onValueChange={setCurve} />
            <Segmented
              label="Value axis"
              size="sm"
              options={[
                { value: "data", label: "Hug the data" },
                { value: "zero", label: "From zero" },
              ]}
              value={axis}
              onValueChange={setAxis}
            />
          </>
        }
        code={`
import { StepLineChart, formatCompact, type ChartSeries } from "@sheenui/theme";

const pricing = [
  { month: "Jan", pro: 42, team: 50, enterprise: 60 },
  { month: "Feb", pro: 45, team: 50, enterprise: 60 },
  { month: "Mar", pro: 45, team: 54, enterprise: 60 },
  { month: "Apr", pro: 45, team: 54, enterprise: 66 },
  { month: "May", pro: 48, team: 57, enterprise: 66 },
];

const series: ChartSeries[] = [
  { key: "enterprise", label: "Enterprise", color: 3 },
  { key: "team", label: "Team", color: 2 },
  { key: "pro", label: "Pro", color: 1 },
];

export function Example() {
  return (
    <StepLineChart
      curve="step-after"
      zero={false}
      data={pricing}
      index="month"
      series={series}
      format={(n) => "$" + formatCompact(n)}
      aria-label="Monthly price per seat, by plan"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Price per seat"
          description="Monthly list price by plan, US$"
          legend={seriesLegend(pricingSeries, "line")}
          table={<ChartTable data={pricing} index="month" indexLabel="Month" series={pricingSeries} format={usd} />}
        >
          <StepLineChart
            curve={curve}
            zero={axis === "zero"}
            data={pricing}
            index="month"
            series={pricingSeries}
            format={usd}
            aria-label="Monthly price per seat, by plan"
          />
        </ChartCard>
      </Example>

      <Example
        title="With an area wash"
        description="One series, so no legend: the title names it. area keeps zero on the axis, so the wash fills to a real baseline."
        variant="bare"
        code={`
import { StepLineChart } from "@sheenui/theme";

const seats = [
  { month: "Jan", seats: 120 },
  { month: "Feb", seats: 135 },
  { month: "Mar", seats: 150 },
  { month: "Apr", seats: 180 },
  { month: "May", seats: 210 },
  { month: "Jun", seats: 262 },
];

export function Example() {
  return (
    <StepLineChart
      area
      curve="step-before"
      data={seats}
      index="month"
      series={[{ key: "seats", label: "Seats" }]}
      aria-label="Licensed seats at the end of each month"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Licensed seats"
          description="At the end of each month"
          aside={<span className="text-2xl font-semibold tracking-tight">{seats[seats.length - 1]?.seats} seats</span>}
          table={<ChartTable data={seats} index="month" indexLabel="Month" series={seatSeries} />}
        >
          <StepLineChart
            area
            curve="step-before"
            data={seats}
            index="month"
            series={seatSeries}
            aria-label="Licensed seats at the end of each month"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.StepLineChart} />
      <PropsTable as="h2" title="StepLineTable props" of={PROPS.StepLineTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / → (↑ / ↓)", "Previous / next point."],
          ["Home / End", "Jump to the first / last point."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the point and its values.",
          "StepLineTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.",
          "Reduced motion: the steps appear at their final values and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Range area                                                             */
/* ====================================================================== */

const forecast: ChartRow[] = [
  { month: "Jan", revenue: 42 },
  { month: "Feb", revenue: 45 },
  { month: "Mar", revenue: 44 },
  { month: "Apr", revenue: 49 },
  { month: "May", revenue: 53 },
  { month: "Jun", revenue: 51 },
  { month: "Jul", revenue: 56 },
  { month: "Aug", revenue: 60, low: 60, high: 60 },
  { month: "Sep", revenue: 63, low: 59.5, high: 66.5 },
  { month: "Oct", revenue: 66, low: 60, high: 72.5 },
  { month: "Nov", revenue: 70, low: 61.5, high: 79 },
  { month: "Dec", revenue: 74, low: 63, high: 86 },
];

const forecastSeries: RangeSeries[] = [
  { key: "revenue", label: "Revenue", lower: "low", upper: "high", bandLabel: "80% interval", color: 1 },
];

function weather(month: "mar" | "jul") {
  const warm = month === "jul";
  return Array.from({ length: 14 }, (_, i) => {
    const lis = (warm ? 24 : 15) + Math.sin(i * 0.8) * 2.2 + Math.cos(i * 0.31) * 1.4;
    const osl = (warm ? 17 : 2) + Math.sin(i * 0.6 + 1) * 2.8 + Math.cos(i * 0.47) * 1.2;
    const r = (n: number) => Math.round(n * 10) / 10;
    return {
      day: `${i + 1}`,
      lisbon: r(lis),
      lisbonLow: r(lis - 4.2 - Math.sin(i) * 0.8),
      lisbonHigh: r(lis + 4.8 + Math.cos(i * 1.3) * 0.9),
      oslo: r(osl),
      osloLow: r(osl - 3.6 - Math.cos(i * 0.9)),
      osloHigh: r(osl + 3.9 + Math.sin(i * 1.1)),
    };
  });
}

const weatherSeries: RangeSeries[] = [
  { key: "lisbon", label: "Lisbon", lower: "lisbonLow", upper: "lisbonHigh", bandLabel: "Lisbon low–high", color: 2 },
  { key: "oslo", label: "Oslo", lower: "osloLow", upper: "osloHigh", bandLabel: "Oslo low–high", color: 7 },
];

const degrees = (n: number) => `${n.toLocaleString("en", { maximumFractionDigits: 1 }).replace("-", "−")}°`;

/** The "Range area chart" docs page (/charts/range-area-chart): live examples, props and notes. */
export function RangeAreaChartPage() {
  const [month, setMonth] = useState<"mar" | "jul">("jul");
  const days = weather(month);
  return (
    <Page
      eyebrow="Chart"
      title="Range area chart"
      description="A line with a min–max band around it: a forecast and its confidence interval, a daily low and high. The band is the line's own hue at low opacity, the legend names what it means, and gaps in the data stay gaps, never dips to zero."
      source={`${CHARTS}range-area-chart.tsx`}
    >
      <ChartStage label="Range area chart demo" title="Revenue forecast" hue={1} height="17.5rem">
        <RangeAreaChart
          data={forecast}
          index="month"
          series={forecastSeries}
          forecastFrom="Sep"
          format={usdK}
          aria-label="Monthly revenue with a forecast and its 80% interval"
        />
      </ChartStage>
      <Example
        title="Forecast with a confidence band"
        description="forecastFrom marks where actuals end: the line turns dashed, the region is tinted and tagged, and the band opens out from the last actual. The plot wipes in left to right; the band breathes open from its line."
        variant="bare"
        code={`
import { ChartCard, rangeAreaLegend, RangeAreaTable, RangeAreaChart, formatCompact, type ChartRow, type RangeSeries } from "@sheenui/theme";

const data: ChartRow[] = [
  { month: "Jun", revenue: 51 },
  { month: "Jul", revenue: 56 },
  { month: "Aug", revenue: 60, low: 60, high: 60 },
  { month: "Sep", revenue: 63, low: 59.5, high: 66.5 },
  { month: "Oct", revenue: 66, low: 60, high: 72.5 },
  { month: "Nov", revenue: 70, low: 61.5, high: 79 },
];
const series: RangeSeries[] = [{ key: "revenue", label: "Revenue", lower: "low", upper: "high", bandLabel: "80% interval" }];

export function Example() {
  return (
    <ChartCard
      title="Revenue forecast"
      legend={rangeAreaLegend(series)}
      table={<RangeAreaTable data={data} index="month" series={series} forecastFrom="Sep" />}
    >
      <RangeAreaChart
        data={data}
        index="month"
        series={series}
        forecastFrom="Sep"
        format={(n) => "$" + formatCompact(n) + "K"}
        aria-label="Monthly revenue with a forecast and its 80% interval"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Revenue forecast"
          description="Monthly, US$ thousands. Actuals to August."
          legend={rangeAreaLegend(forecastSeries)}
          table={
            <RangeAreaTable
              data={forecast}
              index="month"
              indexLabel="Month"
              series={forecastSeries}
              format={usdK}
              forecastFrom="Sep"
              caption="Revenue forecast"
            />
          }
        >
          <RangeAreaChart
            data={forecast}
            index="month"
            series={forecastSeries}
            forecastFrom="Sep"
            format={usdK}
            aria-label="Monthly revenue with a forecast and its 80% interval"
          />
        </ChartCard>
      </Example>

      <Example
        title="Two series with bands"
        description="Overlapping bands stay light (14%) so both remain readable, and every band is drawn before any line. Switch the month: lines and bands morph to the new values."
        variant="bare"
        controls={
          <Segmented
            label="Month"
            size="sm"
            options={[
              { value: "mar", label: "March" },
              { value: "jul", label: "July" },
            ]}
            value={month}
            onValueChange={setMonth}
          />
        }
        code={`
import { RangeAreaChart, type ChartRow, type RangeSeries } from "@sheenui/theme";

const days: ChartRow[] = [
  { day: "1", lisbon: 15.2, lisbonLow: 11, lisbonHigh: 20, oslo: 2.4, osloLow: -1.2, osloHigh: 5.9 },
  { day: "2", lisbon: 16.1, lisbonLow: 12.3, lisbonHigh: 21.2, oslo: 3.1, osloLow: -0.4, osloHigh: 6.8 },
  { day: "3", lisbon: 14.8, lisbonLow: 10.5, lisbonHigh: 19.4, oslo: 1.7, osloLow: -2, osloHigh: 5 },
  { day: "4", lisbon: 15.9, lisbonLow: 11.8, lisbonHigh: 20.6, oslo: 2.9, osloLow: -0.9, osloHigh: 6.2 },
];

const series: RangeSeries[] = [
  { key: "lisbon", label: "Lisbon", lower: "lisbonLow", upper: "lisbonHigh", bandLabel: "Lisbon low–high", color: 2 },
  { key: "oslo", label: "Oslo", lower: "osloLow", upper: "osloHigh", bandLabel: "Oslo low–high", color: 7 },
];

export function Example() {
  return (
    <RangeAreaChart
      data={days}
      index="day"
      series={series}
      format={(n) => n + "°"}
      aria-label="Daily mean temperature with the low–high range"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Daily temperature"
          description={`First two weeks of ${month === "jul" ? "July" : "March"}, °C`}
          legend={rangeAreaLegend(weatherSeries)}
          table={
            <RangeAreaTable
              data={days}
              index="day"
              indexLabel="Day"
              series={weatherSeries}
              format={degrees}
              caption="Daily temperature"
            />
          }
        >
          <RangeAreaChart
            data={days}
            index="day"
            series={weatherSeries}
            format={degrees}
            aria-label="Daily mean temperature with the low–high range"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.RangeAreaChart} />
      <PropsTable
        as="h3"
        title="rangeAreaLegend / RangeAreaTable"
        of={PROPS.RangeAreaTable}
        rows={[
          [
            "rangeAreaLegend(series, labels?)",
            "LegendItem[]",
            "",
            "Legend items for ChartCard: each line, then its band, keyed as drawn.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / → (↑ / ↓)", "Previous / next point."],
          ["Home / End", "Jump to the first / last point."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every line and its band as “low to high”; gaps are read as a dash, never as 0.",
          "RangeAreaTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "With reduced motion on, the band and its lines start at their final values and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Sparkbar                                                               */
/* ====================================================================== */

const tiles = [
  {
    label: "Signups",
    value: "1,284",
    values: [62, 74, 70, 81, 77, 92, 88, 97, 104, 99, 112, 126],
    note: "Weekly, last 12 weeks",
  },
  {
    label: "Orders",
    value: "3,912",
    values: [210, 244, 236, 251, 290, 302, 287, 276, 318, 331, 309, 358, 362, 371],
    note: "Daily, last 14 days",
  },
  {
    label: "Net cash flow",
    value: "+$18.4K",
    values: [4.2, -1.8, 3.1, 5.6, -0.6, -2.4, 1.9, 6.8, 3.3, -1.1, 4.7, 2.5],
    note: "Weekly, US$ thousands",
    highlight: "none" as const,
  },
];

const standings = [
  { team: "Harbour City", results: [1, 1, -1, 1, 1, 0, 1, 1, -1, 1, 1, 1] },
  { team: "Northfield Rovers", results: [1, -1, 1, 0, 1, -1, 1, 1, 0, -1, 1, 1] },
  { team: "Ashdown Athletic", results: [-1, 1, 0, -1, 1, -1, -1, 1, 1, 0, -1, 1] },
  { team: "Kestrel Town", results: [-1, -1, 1, -1, 0, -1, 1, -1, -1, 1, -1, 0] },
];

/** The "Sparkbar" docs page (/charts/sparkbar): live examples, props and notes. */
export function SparkbarPage() {
  const [orders, setOrders] = useState(tiles[1]?.values ?? []);
  return (
    <Page
      eyebrow="Chart"
      title="Sparkbar"
      description="The bar twin of Sparkline, for stat tiles and table cells. Bar mode shows magnitude with the current period at full strength and history a lighter step of the same hue; win/loss mode shows only the sign. Screen readers hear a summary (low, high and latest, or the record), not a list of numbers."
      source={`${CHARTS}sparkbar.tsx`}
    >
      <ChartStage label="Sparkbar demo" title="Signups, weekly" hue={1} height="9rem">
        <div className="flex flex-col gap-3">
          <p className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-sheen-fg tabular-nums">1,186</span>
            <span className="text-sm font-medium text-sheen-success-text">▲ 12.7% vs last week</span>
          </p>
          <Sparkbar
            height={96}
            values={[62, 74, 70, 81, 77, 92, 88, 97, 104, 99, 112, 126]}
            aria-label="Weekly signups"
          />
        </div>
      </ChartStage>
      <Example
        title="In stat tiles"
        description='The latest bar is drawn at full strength; earlier bars recede to a lighter tint. Values below zero hang from a zero line. Use highlight="none" when no period is special.'
        stageClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
        controls={
          <Button
            variant="glass"
            size="sm"
            onClick={() => setOrders((v) => [...v.slice(1), Math.round(300 + Math.random() * 90)])}
          >
            Add a day of orders
          </Button>
        }
        code={`
import { GlassCard, Sparkbar } from "@sheenui/theme";

const tiles = [
  {
    label: "Signups",
    value: "1,284",
    values: [62, 74, 70, 81, 77, 92, 88, 97, 104, 99, 112, 126],
    note: "Weekly, last 12 weeks",
  },
  {
    label: "Orders",
    value: "3,912",
    values: [210, 244, 236, 251, 290, 302, 287, 276, 318, 331, 309, 358, 362, 371],
    note: "Daily, last 14 days",
  },
  {
    label: "Net cash flow",
    value: "+$18.4K",
    values: [4.2, -1.8, 3.1, 5.6, -0.6, -2.4, 1.9, 6.8, 3.3, -1.1, 4.7, 2.5],
    note: "Weekly, US$ thousands",
    highlight: "none" as const,
  },
];

export function Example() {
  return (
    <>
      {tiles.map((tile) => (
        <GlassCard key={tile.label} className="flex min-w-0 flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{tile.label}</p>
          <p className="text-3xl font-semibold tracking-tight">{tile.value}</p>
          <Sparkbar
            values={tile.values}
            highlight={tile.highlight}
            aria-label={\`\${tile.label}, \${tile.note.toLowerCase()}\`}
          />
          <p className="text-2xs text-sheen-fg-muted">{tile.note}</p>
        </GlassCard>
      ))}
    </>
  );
}`}
      >
        {tiles.map((tile) => (
          <GlassCard key={tile.label} className="flex min-w-0 flex-col gap-2 p-5">
            <p className="text-sm text-sheen-fg-muted">{tile.label}</p>
            <p className="text-3xl font-semibold tracking-tight">{tile.value}</p>
            <Sparkbar
              values={tile.label === "Orders" ? orders : tile.values}
              highlight={tile.highlight}
              aria-label={`${tile.label}, ${tile.note.toLowerCase()}`}
            />
            <p className="text-2xs text-sheen-fg-muted">{tile.note}</p>
          </GlassCard>
        ))}
      </Example>

      <Example
        title="Win / loss in a table"
        description="Only the sign counts: up for a win, down for a loss, a short dash for a draw. Wins and losses use two distinct palette hues (not success and danger: a loss isn't an error)."
        variant="bare"
        code={`
import { GlassCard, Sparkbar } from "@sheenui/theme";

const standings = [
  { team: "Harbour City", results: [1, 1, -1, 1, 1, 0, 1, 1, -1, 1, 1, 1] },
  { team: "Northfield Rovers", results: [1, -1, 1, 0, 1, -1, 1, 1, 0, -1, 1, 1] },
  { team: "Ashdown Athletic", results: [-1, 1, 0, -1, 1, -1, -1, 1, 1, 0, -1, 1] },
  { team: "Kestrel Town", results: [-1, -1, 1, -1, 0, -1, 1, -1, -1, 1, -1, 0] },
];

export function Example() {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div role="region" aria-label="League form" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-start text-sm">
          <caption className="sr-only">League form, last 12 matches</caption>
          <thead className="text-xs text-sheen-fg-muted">
            <tr className="border-b border-sheen-border">
              <th scope="col" className="px-5 py-3 font-medium">Team</th>
              <th scope="col" className="px-5 py-3 font-medium">Last 12</th>
              <th scope="col" className="px-5 py-3 text-end font-medium">W–D–L</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const w = row.results.filter((r) => r > 0).length;
              const l = row.results.filter((r) => r < 0).length;
              return (
                <tr key={row.team} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className="px-5 py-3 font-medium whitespace-nowrap">{row.team}</th>
                  <td className="w-56 px-5 py-3">
                    <Sparkbar
                      variant="winloss"
                      height={24}
                      values={row.results}
                      aria-label={\`\${row.team}, last 12 matches\`}
                    />
                  </td>
                  <td className="px-5 py-3 text-end whitespace-nowrap tabular-nums">
                    {w}–{row.results.length - w - l}–{l}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="overflow-hidden p-0">
          <div
            role="region"
            aria-label="League form"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse
            tabIndex={0}
            className="overflow-x-auto rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
          >
            <table className="w-full min-w-[30rem] text-start [:where(&)_th]:text-start text-sm">
              <caption className="sr-only">League form, last 12 matches</caption>
              <thead className="text-xs text-sheen-fg-muted">
                <tr className="border-b border-sheen-border">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Team
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Last 12
                  </th>
                  <th scope="col" className="px-5 py-3 text-end font-medium">
                    W–D–L
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => {
                  const w = row.results.filter((r) => r > 0).length;
                  const l = row.results.filter((r) => r < 0).length;
                  return (
                    <tr key={row.team} className="border-b border-sheen-border last:border-0">
                      <th scope="row" className="px-5 py-3 font-medium whitespace-nowrap">
                        {row.team}
                      </th>
                      <td className="w-56 px-5 py-3">
                        <Sparkbar
                          variant="winloss"
                          height={24}
                          values={row.results}
                          aria-label={`${row.team}, last 12 matches`}
                        />
                      </td>
                      <td className="px-5 py-3 text-end whitespace-nowrap tabular-nums">
                        {w}–{row.results.length - w - l}–{l}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Example>

      <PropsTable of={PROPS.Sparkbar} />
      <KeyboardTable rows={[["Tab", "Not applicable: the sparkbar is not interactive, so it is not a tab stop."]]} />
      <A11yNotes
        notes={[
          "With an aria-label it is an image named by that label plus a short summary (or “No data”); without one it is decorative.",
          "Put the number it summarizes next to it as text: the bars are a glanceable hint, not the only source of the value.",
          "Under reduced motion nothing morphs: the bars render at their final values and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
