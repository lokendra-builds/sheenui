import { useMemo, useState } from "react";
import { type ChartRow, type ChartSeries } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { RidgelineChart, RidgelineTable, type RidgelineGroup } from "@sheenui/theme";
import { PolarAreaChart, PolarAreaTable, polarAreaLegend } from "@sheenui/theme";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import * as PROPS from "../generated/component-props";
import { CHARTS, gaussian, seeded } from "./ChartsProgressPages/shared";

/* ====================================================================== */
/* Ridgeline                                                              */
/* ====================================================================== */

/** Delivery times (minutes) per month: faster and tighter as the courier network grows. */
const deliveries: RidgelineGroup[] = [
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
].map((month, i) => {
  const rand = seeded(500 + i);
  const z = gaussian(rand);
  const mean = 46 - i * 1.6 + (i === 1 ? 9 : 0);
  const sd = 11 - i * 0.45 + (i === 1 ? 4 : 0);
  const values = Array.from({ length: 220 }, () => {
    // A long right tail: a few late orders every month.
    const late = rand() > 0.93 ? Math.abs(z()) * 12 : 0;
    return Math.max(8, Math.round(mean + z() * sd + late));
  });
  return { label: month, values };
});

const salaries: RidgelineGroup[] = [
  ["Support", 54, 10],
  ["Design", 96, 16],
  ["Marketing", 88, 18],
  ["Engineering", 142, 26],
  ["Data science", 151, 22],
  ["Product", 138, 20],
].map(([label, mean, sd], i) => {
  const z = gaussian(seeded(900 + i));
  return {
    label: String(label),
    values: Array.from({ length: 160 }, () => Math.round((Number(mean) + z() * Number(sd)) * 1000)),
  };
});

/** The "Ridgeline chart" docs page (/charts/ridgeline): live examples, props and notes. */
export function RidgelineChartPage() {
  const [scale, setScale] = useState<"shared" | "each">("shared");
  return (
    <Page
      eyebrow="Chart"
      title="Ridgeline chart"
      description="Distributions stacked as overlapping ridges: how a measure is spread in each group, and how that spread shifts. Densities are computed from the raw values (a Gaussian kernel with Silverman's bandwidth), a dashed tick marks each median, and every ridge reads out its median, mean, middle 50% and range."
      source={`${CHARTS}ridgeline-chart.tsx`}
    >
      <ChartStage label="Ridgeline chart demo" title="Delivery time by month" hue={7} height="29.625rem">
        <RidgelineChart
          data={deliveries}
          color={7}
          scale="shared"
          format={(n) => `${Math.round(n)} min`}
          aria-label="Delivery time by month"
        />
      </ChartStage>
      <Example
        title="Delivery times by month"
        description="220 orders a month. Deliveries got faster and more predictable, apart from the December rush. Hover, tap or arrow through the months; switch the scale to give every ridge the same peak."
        variant="bare"
        controls={
          <Segmented
            label="Scale"
            size="sm"
            options={[
              { value: "shared", label: "Shared" },
              { value: "each", label: "Each" },
            ]}
            value={scale}
            onValueChange={setScale}
          />
        }
        code={`
import { ChartCard, RidgelineTable, RidgelineChart, type RidgelineGroup } from "@sheenui/theme";

// Raw minutes, one value per order (shortened here)
const data: RidgelineGroup[] = [
  { label: "Nov", values: [44, 51, 38, 62, 47, 55, 41, 49, 58, 46, 52, 43] },
  { label: "Dec", values: [58, 71, 49, 66, 83, 62, 74, 57, 69, 90, 64, 61] },
  { label: "Jan", values: [40, 46, 36, 52, 43, 49, 38, 45, 41, 50, 44, 39] },
];
const minutes = (n: number) => Math.round(n) + " min";

export function Example() {
  return (
    <ChartCard title="Delivery time" table={<RidgelineTable data={data} format={minutes} />}>
      <RidgelineChart data={data} color={7} scale="shared" format={minutes} aria-label="Delivery time by month" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Delivery time"
          description="Minutes from order to door, Nov 2025 to Oct 2026, by month"
          table={
            <RidgelineTable data={deliveries} format={(n) => `${Math.round(n)} min`} caption="Delivery time by month" />
          }
        >
          <RidgelineChart
            data={deliveries}
            color={7}
            scale={scale}
            format={(n) => `${Math.round(n)} min`}
            aria-label="Delivery time by month"
          />
        </ChartCard>
      </Example>

      <Example
        title="Sequential fill"
        description='fill="sequential" paints each ridge with a light → dark ramp along the value axis, so position and color agree: here, salary bands by role.'
        variant="bare"
        code={`
import { RidgelineChart, type RidgelineGroup } from "@sheenui/theme";

// Raw base salaries in $, one value per person (shortened here)
const salaries: RidgelineGroup[] = [
  { label: "Engineering", values: [118000, 126000, 132000, 141000, 149000, 155000, 163000, 172000] },
  { label: "Design", values: [96000, 104000, 109000, 115000, 121000, 128000, 134000, 140000] },
  { label: "Data science", values: [124000, 133000, 140000, 151000, 158000, 166000, 174000, 185000] },
  { label: "Product", values: [110000, 119000, 128000, 138000, 146000, 153000, 161000, 170000] },
];
const thousands = (n: number) => "$" + Math.round(n / 1000) + "k";

export function Example() {
  return (
    <RidgelineChart
      data={salaries}
      fill="sequential"
      color={1}
      rowHeight={40}
      format={thousands}
      aria-label="Salary by role"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Salary by role"
          description="Base salary, 160 people per role"
          table={
            <RidgelineTable
              data={salaries}
              format={(n) => `$${Math.round(n / 1000)}k`}
              caption="Salary statistics per role"
            />
          }
        >
          <RidgelineChart
            data={salaries}
            fill="sequential"
            color={1}
            rowHeight={40}
            format={(n) => `$${Math.round(n / 1000)}k`}
            aria-label="Salary by role"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.RidgelineChart} />
      <PropsTable as="h2" title="RidgelineTable props" of={PROPS.RidgelineTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart (one tab stop)."],
          ["↓ / →", "Next ridge."],
          ["↑ / ←", "Previous ridge."],
          ["Home / End", "First / last ridge."],
          ["Escape", "Stop reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure; each ridge read by keyboard announces its median, mean, middle 50%, range
          and count once.
        </li>
        <li>
          Group names sit in their own column, never under a curve, and the active name turns bold: the ridges never
          rely on color to be told apart.
        </li>
        <li>
          The table view gives each group's count, five-number summary and mean: the exact numbers behind every curve.
        </li>
        <li>
          Forced colors draw every outline and median tick in CanvasText; reduced motion draws the ridges in place.
        </li>
      </A11yNotes>
    </Page>
  );
}

/* ====================================================================== */
/* Polar area                                                             */
/* ====================================================================== */

/** Florence Nightingale's data: deaths in the army in the East, April 1854 – March 1855. */
const nightingale: ChartRow[] = [
  { month: "Apr", disease: 1, wounds: 0, other: 5 },
  { month: "May", disease: 12, wounds: 0, other: 9 },
  { month: "Jun", disease: 11, wounds: 0, other: 6 },
  { month: "Jul", disease: 359, wounds: 0, other: 23 },
  { month: "Aug", disease: 828, wounds: 1, other: 30 },
  { month: "Sep", disease: 788, wounds: 81, other: 70 },
  { month: "Oct", disease: 503, wounds: 132, other: 128 },
  { month: "Nov", disease: 844, wounds: 287, other: 106 },
  { month: "Dec", disease: 1725, wounds: 114, other: 131 },
  { month: "Jan", disease: 2761, wounds: 83, other: 324 },
  { month: "Feb", disease: 2120, wounds: 42, other: 361 },
  { month: "Mar", disease: 1205, wounds: 32, other: 172 },
];

const causes: ChartSeries[] = [
  { key: "disease", label: "Preventable disease", color: 7 },
  { key: "wounds", label: "Wounds", color: 8 },
  { key: "other", label: "Other causes", color: 4 },
];

const hourly: ChartRow[] = Array.from({ length: 24 }, (_, h) => {
  const rand = seeded(700 + h);
  const morning = Math.exp(-((h - 10) ** 2) / 8) * 820;
  const evening = Math.exp(-((h - 20.5) ** 2) / 6) * 1240;
  return { hour: `${String(h).padStart(2, "0")}:00`, sessions: Math.round(90 + morning + evening + rand() * 60) };
});

/** The "Polar area chart" docs page (/charts/polar-area): live examples, props and notes. */
export function PolarAreaChartPage() {
  const [scale, setScale] = useState<"area" | "radius">("area");
  const single = useMemo<ChartSeries[]>(() => [{ key: "sessions", label: "Sessions", color: 7 }], []);
  return (
    <Page
      eyebrow="Chart"
      title="Polar area chart"
      description="Nightingale's rose: one wedge per category around a circle (months, hours, compass points), each wedge's area proportional to its value. Several series stack outwards. Rings mark round values, names never collide, and every wedge can be read by hover, tap or arrow keys."
      source={`${CHARTS}polar-area-chart.tsx`}
    >
      <ChartStage
        label="Polar area chart demo"
        title="Causes of mortality, 1854–55"
        hue={7}
        height="23.75rem"
        legend={polarAreaLegend(causes)}
      >
        <PolarAreaChart
          data={nightingale}
          index="month"
          series={causes}
          scale="area"
          height={380}
          aria-label="Deaths in the army in the East by cause and month"
        />
      </ChartStage>
      <Example
        title="Nightingale's rose, 1854–55"
        description="Her own data: most soldiers died of preventable disease, not wounds. Areas are true to the values; switch to radius scaling to see how it would exaggerate the winter."
        variant="bare"
        controls={
          <Segmented
            label="Scale"
            size="sm"
            options={[
              { value: "area", label: "Area (true)" },
              { value: "radius", label: "Radius" },
            ]}
            value={scale}
            onValueChange={setScale}
          />
        }
        code={`
import { ChartCard, polarAreaLegend, PolarAreaTable, PolarAreaChart, type ChartRow, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "disease", label: "Preventable disease", color: 7 },
  { key: "wounds", label: "Wounds", color: 8 },
  { key: "other", label: "Other causes", color: 4 },
];
const data: ChartRow[] = [
  { month: "Apr 1854", disease: 110, wounds: 0, other: 5 },
  { month: "May", disease: 95, wounds: 0, other: 9 },
  { month: "Jun", disease: 40, wounds: 0, other: 6 },
  { month: "Jul", disease: 140, wounds: 5, other: 9 },
  { month: "Aug", disease: 220, wounds: 9, other: 6 },
  { month: "Sep", disease: 360, wounds: 23, other: 14 },
];

export function Example() {
  return (
    <ChartCard
      title="Causes of mortality"
      legend={polarAreaLegend(series)}
      table={<PolarAreaTable data={data} index="month" series={series} />}
    >
      <PolarAreaChart data={data} index="month" series={series} scale="area" aria-label="Deaths by cause and month" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Causes of mortality in the army in the East"
          description="Deaths per month from April 1854 to March 1855, by cause"
          legend={polarAreaLegend(causes)}
          table={
            <PolarAreaTable
              data={nightingale}
              index="month"
              indexLabel="Month"
              series={causes}
              caption="Deaths by cause and month"
            />
          }
        >
          <PolarAreaChart
            data={nightingale}
            index="month"
            series={causes}
            scale={scale}
            height={380}
            aria-label="Deaths in the army in the East by cause and month"
          />
        </ChartCard>
      </Example>

      <Example
        title="24 hours of traffic"
        description="One series, one hue: position and name tell the wedges apart. With 24 names around the rose, labels thin out on narrow screens instead of colliding."
        variant="bare"
        code={`
import { PolarAreaChart, type ChartRow } from "@sheenui/theme";

// Average sessions per hour of the day (every 4th hour shown here)
const hourly: ChartRow[] = [
  { hour: "00:00", sessions: 120 },
  { hour: "04:00", sessions: 95 },
  { hour: "08:00", sessions: 540 },
  { hour: "12:00", sessions: 610 },
  { hour: "16:00", sessions: 480 },
  { hour: "20:00", sessions: 1290 },
];

export function Example() {
  return (
    <PolarAreaChart
      data={hourly}
      index="hour"
      series={[{ key: "sessions", label: "Sessions", color: 7 }]}
      aria-label="Sessions by hour of day"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by hour"
          description="Average weekday, local time"
          table={
            <PolarAreaTable
              data={hourly}
              index="hour"
              indexLabel="Hour"
              series={single}
              caption="Average sessions per hour"
            />
          }
        >
          <PolarAreaChart
            data={hourly}
            index="hour"
            series={single}
            height={340}
            aria-label="Sessions by hour of day"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.PolarAreaChart} />
      <PropsTable as="h2" title="PolarAreaTable props" of={PROPS.PolarAreaTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart (one tab stop)."],
          ["→ / ↓", "Next wedge, clockwise."],
          ["← / ↑", "Previous wedge."],
          ["Home / End", "First / last wedge."],
          ["Escape", "Stop reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure; each wedge read by keyboard announces every series' value (and the total)
          once.
        </li>
        <li>
          Areas are true to the values by default, so the picture never exaggerates big wedges; the ring values give the
          scale.
        </li>
        <li>
          Names around the rose thin out instead of colliding, and every wedge is in the table view, so nothing depends
          on reading a crowded label.
        </li>
        <li>Forced colors outline every wedge in CanvasText; reduced motion draws the rose in place.</li>
      </A11yNotes>
    </Page>
  );
}
