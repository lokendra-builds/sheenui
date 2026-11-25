import { useState } from "react";
import { formatCompact } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { ComboChart, ComboTable, comboLegend, type ComboSeries } from "@sheenui/theme";
import { ScatterChart, ScatterTable, scatterLegend, type ScatterSeries } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { Shuffle, months, seeded } from "./ChartsStackedPiePages/shared";

const usd = (n: number) => `$${formatCompact(n)}`;

const days = [
  "Oct 1",
  "Oct 2",
  "Oct 3",
  "Oct 4",
  "Oct 5",
  "Oct 6",
  "Oct 7",
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

function ordersData(seed: number) {
  const r = seeded(seed);
  const raw = days.map((_, i) => Math.round(340 + i * 9 + (i % 7 >= 5 ? -90 : 0) + r() * 120));
  return days.map((day, i) => {
    const window = raw.slice(Math.max(0, i - 6), i + 1);
    return { day, orders: raw[i] ?? 0, average: Math.round(window.reduce((a, b) => a + b, 0) / window.length) };
  });
}

const orderSeries: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

const oneDay = [{ day: "Today", orders: 412, average: 388 }];

const growth = months.map((month, i) => ({
  month,
  revenue: Math.round(184000 + i * 9200 + Math.sin(i * 0.9) * 8000),
  users: Math.round(8200 + i * 760 + Math.cos(i * 1.2) * 300),
  tickets: Math.round(1300 + i * 30 - Math.sin(i * 0.5) * 120),
}));

const growthSeries: ComboSeries[] = [
  { key: "revenue", label: "Revenue", color: 1, type: "bar" },
  { key: "users", label: "Active users", color: 2, type: "line" },
  { key: "tickets", label: "Support tickets", color: 3, type: "line" },
];

const customers = months.slice(-8).map((month, i) => ({
  month,
  new: Math.round(420 + i * 38 + Math.sin(i) * 40),
  returning: Math.round(900 + i * 55 + Math.cos(i * 0.8) * 60),
  target: 1500 + i * 70,
}));

const customerSeries: ComboSeries[] = [
  { key: "new", label: "New", color: 1, type: "bar" },
  { key: "returning", label: "Returning", color: 3, type: "bar" },
  { key: "target", label: "Target", color: 2, type: "line" },
];

function spendData(seed: number): ScatterSeries[] {
  const r = seeded(seed);
  const series = (label: string, color: 1 | 2, slope: number, base: number) => ({
    label,
    color,
    data: Array.from({ length: 16 }, (_, i) => {
      const x = Math.round(2000 + i * 1100 + r() * 900);
      return { x, y: Math.round(base + x * slope + (r() - 0.5) * 9000), label: `Week ${i + 1}`, id: `w${i}` };
    }),
  });
  return [series("Search", 1, 3.1, 4000), series("Social", 2, 1.7, 9000)];
}

const cities: ScatterSeries[] = [
  {
    label: "Europe",
    color: 1,
    data: [
      { label: "London", x: 3200, y: 5400, size: 9.0 },
      { label: "Berlin", x: 1700, y: 4300, size: 3.7 },
      { label: "Paris", x: 2300, y: 4600, size: 2.1 },
      { label: "Madrid", x: 1400, y: 3000, size: 3.3 },
      { label: "Warsaw", x: 1050, y: 2500, size: 1.8 },
    ],
  },
  {
    label: "Asia",
    color: 2,
    data: [
      { label: "Tokyo", x: 1500, y: 3800, size: 14.0 },
      { label: "Singapore", x: 3100, y: 5200, size: 5.9 },
      { label: "Bengaluru", x: 520, y: 1500, size: 13.2 },
      { label: "Seoul", x: 1150, y: 3300, size: 9.4 },
      { label: "Jakarta", x: 600, y: 1100, size: 10.6 },
    ],
  },
  {
    label: "Americas",
    color: 3,
    data: [
      { label: "New York", x: 4200, y: 7100, size: 8.3 },
      { label: "Toronto", x: 2200, y: 4500, size: 2.8 },
      { label: "Mexico City", x: 900, y: 1300, size: 9.2 },
      { label: "São Paulo", x: 850, y: 1600, size: 12.3 },
      { label: "Austin", x: 1900, y: 5600, size: 1.0 },
    ],
  },
];

const eur = (n: number) => `€${formatCompact(n)}`;

const onePoint: ScatterSeries[] = [{ label: "Today", data: [{ x: 42, y: 1280, label: "Today" }] }];

const fourRegions: ScatterSeries[] = [
  ...cities,
  {
    label: "Africa",
    data: [
      { label: "Lagos", x: 700, y: 900 },
      { label: "Nairobi", x: 800, y: 1200 },
      { label: "Cape Town", x: 900, y: 1700 },
    ],
  },
];

const millions = (n: number) => `${formatCompact(n)}M`;

/* ====================================================================== */
/* Combo                                                                   */
/* ====================================================================== */

export function ComboChartPage() {
  const [seed, setSeed] = useState(1);
  const orders = ordersData(seed);

  return (
    <Page
      eyebrow="Chart"
      title="Combo chart"
      description="Bars and lines on ONE shared y-axis: a daily count and its rolling average, stacked parts and a target. Measures in different units are never given a second axis; index them to a common start instead."
      source="theme/src/components/charts/combo-chart.tsx"
    >
      <ChartStage
        label="Combo chart demo"
        title="Orders per day"
        hue={1}
        height="17.5rem"
        legend={comboLegend(orderSeries)}
      >
        <ComboChart
          data={ordersData(1)}
          index="day"
          series={orderSeries}
          aria-label="Orders per day with the 7-day average"
        />
      </ChartStage>
      <Example
        title="Bars and their average"
        description="Same unit, one axis. The line draws across the bars once they have grown, with a surface halo so it stays readable where it crosses them."
        variant="bare"
        controls={<Shuffle onClick={() => setSeed((s) => s + 1)} />}
        code={`
import { ChartCard, comboLegend, ComboTable, ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { day: "Oct 8", orders: 402, average: 371 },
  { day: "Oct 9", orders: 388, average: 376 },
  { day: "Oct 10", orders: 431, average: 384 },
  { day: "Oct 11", orders: 455, average: 395 },
  { day: "Oct 12", orders: 301, average: 389 },
  { day: "Oct 13", orders: 296, average: 382 },
];
const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <ChartCard
      title="Orders per day"
      legend={comboLegend(series)}
      table={<ComboTable data={data} index="day" series={series} />}
    >
      <ComboChart data={data} index="day" series={series} aria-label="Orders per day with the 7-day average" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Orders per day"
          description="Last 14 days"
          legend={comboLegend(orderSeries)}
          table={
            <ComboTable
              data={orders}
              index="day"
              indexLabel="Day"
              series={orderSeries}
              caption="Orders per day, last 14 days"
            />
          }
        >
          <ComboChart
            data={orders}
            index="day"
            series={orderSeries}
            aria-label="Orders per day with the 7-day average"
          />
        </ChartCard>
      </Example>

      <Example
        title="Indexed: different units, one axis"
        description="Revenue (dollars), users and tickets (counts) can't share a value axis, and two axes would let the chart say anything. indexed rebases every series to 100 at its first value, so the axis reads “how much has each grown?”. The tooltip keeps the actual values."
        variant="bare"
        code={`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "Nov", revenue: 184000, users: 8200, tickets: 1300 },
  { month: "Dec", revenue: 195000, users: 8900, tickets: 1340 },
  { month: "Jan", revenue: 201000, users: 9700, tickets: 1390 },
  { month: "Feb", revenue: 212000, users: 10200, tickets: 1360 },
  { month: "Mar", revenue: 224000, users: 11100, tickets: 1430 },
];
const series: ComboSeries[] = [
  { key: "revenue", label: "Revenue", color: 1, type: "bar" },
  { key: "users", label: "Active users", color: 2, type: "line" },
  { key: "tickets", label: "Support tickets", color: 3, type: "line" },
];

export function Example() {
  return <ComboChart indexed data={data} index="month" series={series} aria-label="Revenue, users and tickets, indexed to November = 100" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Growth since November"
          description="Indexed to November = 100 for each series"
          legend={comboLegend(growthSeries)}
          table={
            <ComboTable
              data={growth}
              index="month"
              indexLabel="Month"
              series={growthSeries}
              caption="Revenue, active users and support tickets per month (actual values)"
            />
          }
        >
          <ComboChart
            indexed
            data={growth}
            index="month"
            series={growthSeries}
            aria-label="Revenue, active users and support tickets, indexed to November = 100"
          />
        </ChartCard>
      </Example>

      <Example
        title="Stacked bars and a target"
        description="stacked stacks the bar series; the line is a target in the same unit. The tooltip adds the stack's total."
        variant="bare"
        code={`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "May", new: 420, returning: 900, target: 1500 },
  { month: "Jun", new: 460, returning: 960, target: 1570 },
  { month: "Jul", new: 495, returning: 1010, target: 1640 },
  { month: "Aug", new: 530, returning: 1080, target: 1710 },
  { month: "Sep", new: 575, returning: 1150, target: 1780 },
];
const series: ComboSeries[] = [
  { key: "new", label: "New", color: 1, type: "bar" },
  { key: "returning", label: "Returning", color: 3, type: "bar" },
  { key: "target", label: "Target", color: 2, type: "line" },
];

export function Example() {
  return <ComboChart stacked data={data} index="month" series={series} aria-label="Customers per month against target" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Customers vs target"
          legend={comboLegend(customerSeries)}
          table={
            <ComboTable
              stacked
              data={customers}
              index="month"
              indexLabel="Month"
              series={customerSeries}
              caption="New and returning customers per month against target"
            />
          }
        >
          <ComboChart
            stacked
            data={customers}
            index="month"
            series={customerSeries}
            aria-label="New and returning customers per month against target"
          />
        </ChartCard>
      </Example>

      <Example
        title="Edge cases"
        description="One category still gets a properly sized bar and a dot for the line (a line needs two points); no data keeps the chart's footprint."
        variant="bare"
        stageClassName="grid gap-6 lg:grid-cols-2"
        code={`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <>
      <ComboChart data={[{ day: "Today", orders: 412, average: 388 }]} index="day" series={series} aria-label="Orders today" />
      <ComboChart data={[]} index="day" series={series} emptyState="No orders yet" aria-label="Orders per day" />
    </>
  );
}`}
      >
        <ChartCard
          title="One day"
          legend={comboLegend(orderSeries)}
          table={
            <ComboTable
              data={oneDay}
              index="day"
              indexLabel="Day"
              series={orderSeries}
              caption="Orders today with the 7-day average"
            />
          }
        >
          <ComboChart
            data={oneDay}
            index="day"
            series={orderSeries}
            height={220}
            aria-label="Orders today with the 7-day average"
          />
        </ChartCard>
        <ChartCard
          title="No data"
          table={
            <ComboTable
              data={[]}
              index="day"
              indexLabel="Day"
              series={orderSeries}
              caption="Orders per day (no data)"
            />
          }
        >
          <ComboChart
            data={[]}
            index="day"
            series={orderSeries}
            height={220}
            emptyState="No orders yet"
            aria-label="Orders per day"
          />
        </ChartCard>
      </Example>

      <PropsTable
        title="ComboChart props"
        of={PROPS.ComboChart}
        rows={[
          ["comboLegend(series)", "LegendItem[]", "", "Legend items: swatches for bars, line keys for lines."],
          ["indexSeries(data, keys, base?)", "number[][]", "", "The indexed values the chart plots."],
        ]}
      />
      <PropsTable as="h2" title="ComboTable props" of={PROPS.ComboTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / →", "Previous / next category."],
          ["Home / End", "Jump to the first / last category."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces every series' value.",
          "ComboTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "Reduced motion: the bars and the line appear at their final values and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Scatter                                                                 */
/* ====================================================================== */

export function ScatterChartPage() {
  const [seed, setSeed] = useState(1);
  const [trend, setTrend] = useState<"on" | "off">("on");
  const spend = spendData(seed);

  return (
    <Page
      eyebrow="Chart"
      title="Scatter & bubble chart"
      description="How two measures relate, one dot per item. The pointer only has to be near a point (nearest-point hit testing), the arrow keys walk the points along x and y, and a least-squares trend line is one prop away."
      source="theme/src/components/charts/scatter-chart.tsx"
    >
      <ChartStage
        label="Scatter chart demo"
        title="Ad spend vs revenue"
        hue={1}
        height="18.75rem"
        legend={scatterLegend(spendData(1))}
      >
        <ScatterChart
          trendline
          series={spendData(1)}
          xLabel="Weekly spend"
          yLabel="Weekly revenue"
          formatX={usd}
          formatY={usd}
          aria-label="Weekly ad spend against revenue, by channel"
        />
      </ChartStage>
      <Example
        title="Scatter with trend lines"
        description="Two series, each with its own fitted trend (dotted, so it never reads as data). Their slope and R² are part of the chart's accessible name."
        variant="bare"
        controls={
          <>
            <Segmented
              label="Trend lines"
              size="sm"
              options={
                [
                  { value: "on", label: "Trend on" },
                  { value: "off", label: "Trend off" },
                ] as const
              }
              value={trend}
              onValueChange={setTrend}
            />
            <Shuffle onClick={() => setSeed((s) => s + 1)} />
          </>
        }
        code={`
import { ChartCard, formatCompact, scatterLegend, ScatterTable, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Search",
    color: 1,
    data: [
      { x: 2400, y: 11800, label: "Week 1" },
      { x: 3600, y: 15200, label: "Week 2" },
      { x: 4800, y: 18900, label: "Week 3" },
      { x: 6100, y: 22100, label: "Week 4" },
    ],
  },
  {
    label: "Social",
    color: 2,
    data: [
      { x: 2100, y: 12800, label: "Week 1" },
      { x: 3300, y: 14600, label: "Week 2" },
      { x: 4500, y: 17900, label: "Week 3" },
      { x: 5900, y: 19400, label: "Week 4" },
    ],
  },
];

export function Example() {
  return (
    <ChartCard
      title="Ad spend vs revenue"
      legend={scatterLegend(series)}
      table={<ScatterTable series={series} xLabel="Spend" yLabel="Revenue" formatX={usd} formatY={usd} />}
    >
      <ScatterChart
        trendline
        series={series}
        xLabel="Weekly spend"
        yLabel="Weekly revenue"
        formatX={usd}
        formatY={usd}
        aria-label="Weekly ad spend against revenue, by channel"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Ad spend vs revenue"
          description="One dot per week"
          legend={scatterLegend(spend)}
          table={
            <ScatterTable
              series={spend}
              xLabel="Spend"
              yLabel="Revenue"
              formatX={usd}
              formatY={usd}
              caption="Weekly ad spend against revenue, by channel"
            />
          }
        >
          <ScatterChart
            trendline={trend === "on"}
            series={spend}
            xLabel="Weekly spend"
            yLabel="Weekly revenue"
            formatX={usd}
            formatY={usd}
            aria-label="Weekly ad spend against revenue, by channel"
          />
        </ChartCard>
      </Example>

      <Example
        title="Bubble chart"
        description="bubble sizes each point by area (4× the population is 4× the ink, not 16×). Big bubbles sit behind small ones, each with a surface ring, so every city stays visible and reachable."
        variant="bare"
        code={`
import { formatCompact, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const eur = (n: number) => "€" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Europe",
    color: 1,
    data: [
      { label: "London", x: 3200, y: 5400, size: 9.0 },
      { label: "Berlin", x: 1700, y: 4300, size: 3.7 },
      { label: "Paris", x: 2300, y: 4600, size: 2.1 },
    ],
  },
  {
    label: "Asia",
    color: 2,
    data: [
      { label: "Tokyo", x: 1500, y: 3800, size: 14.0 },
      { label: "Singapore", x: 3100, y: 5200, size: 5.9 },
      { label: "Bengaluru", x: 520, y: 1500, size: 13.2 },
    ],
  },
  {
    label: "Americas",
    color: 3,
    data: [
      { label: "New York", x: 4200, y: 7100, size: 8.3 },
      { label: "Toronto", x: 2200, y: 4500, size: 2.8 },
      { label: "São Paulo", x: 850, y: 1600, size: 12.3 },
    ],
  },
];

export function Example() {
  return (
    <ScatterChart
      bubble
      series={series}
      xLabel="Average rent"
      yLabel="Average net salary"
      sizeLabel="Population"
      formatX={eur}
      formatY={eur}
      formatSize={(n) => n + "M"}
      aria-label="Rent against salary in nine cities, sized by population"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Rent vs salary"
          description="Monthly, in euros; bubble size is population"
          legend={scatterLegend(cities)}
          table={
            <ScatterTable
              bubble
              series={cities}
              xLabel="Rent"
              yLabel="Salary"
              sizeLabel="Population"
              formatX={eur}
              formatY={eur}
              formatSize={millions}
              caption="Average rent, salary and population of 15 cities"
            />
          }
        >
          <ScatterChart
            bubble
            series={cities}
            xLabel="Average rent"
            yLabel="Average net salary"
            sizeLabel="Population"
            formatX={eur}
            formatY={eur}
            formatSize={millions}
            height={340}
            aria-label="Average rent against average salary in 15 cities, sized by population"
          />
        </ChartCard>
      </Example>

      <Example
        title="Edge cases"
        description="A single point gets a padded axis around it; a fourth series folds into a neutral “Other” (in a scatter every color is compared with every other, so three is the limit)."
        variant="bare"
        stageClassName="grid gap-6 lg:grid-cols-2"
        code={`
import { ScatterChart, type ScatterSeries } from "@sheenui/theme";

const fourSeries: ScatterSeries[] = [
  { label: "Europe", color: 1, data: [{ label: "London", x: 3200, y: 5400 }, { label: "Berlin", x: 1700, y: 4300 }] },
  { label: "Asia", color: 2, data: [{ label: "Tokyo", x: 1500, y: 3800 }, { label: "Seoul", x: 1150, y: 3300 }] },
  { label: "Americas", color: 3, data: [{ label: "New York", x: 4200, y: 7100 }, { label: "Austin", x: 1900, y: 5600 }] },
  { label: "Africa", data: [{ label: "Lagos", x: 700, y: 900 }, { label: "Nairobi", x: 800, y: 1200 }] },
];

export function Example() {
  return (
    <>
      <ScatterChart series={[{ label: "Today", data: [{ x: 42, y: 1280 }] }]} aria-label="Sessions against revenue today" />
      <ScatterChart series={fourSeries} aria-label="Rent against salary by region" /> {/* the 4th is drawn as "Other" */}
    </>
  );
}`}
      >
        <ChartCard
          title="One point"
          table={
            <ScatterTable
              series={onePoint}
              xLabel="Sessions"
              yLabel="Revenue"
              caption="Sessions against revenue today"
            />
          }
        >
          <ScatterChart
            series={onePoint}
            xLabel="Sessions"
            yLabel="Revenue"
            height={220}
            aria-label="Sessions against revenue today"
          />
        </ChartCard>
        <ChartCard
          title="Four series"
          legend={scatterLegend(fourRegions)}
          table={
            <ScatterTable
              series={fourRegions}
              xLabel="Rent"
              yLabel="Salary"
              formatX={eur}
              formatY={eur}
              caption="Rent against salary by region"
            />
          }
        >
          <ScatterChart
            series={fourRegions}
            formatX={eur}
            formatY={eur}
            height={220}
            aria-label="Rent against salary by region"
          />
        </ChartCard>
      </Example>

      <PropsTable
        title="ScatterChart props"
        of={PROPS.ScatterChart}
        rows={[
          ["scatterLegend(series)", "LegendItem[]", "", "Returns legend items with the same “Other” fold."],
          ["linearRegression(points)", "{ slope, intercept, r2 } | null", "", "The fit the trend line uses."],
        ]}
      />
      <PropsTable as="h2" title="ScatterTable props" of={PROPS.ScatterTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["→ / ←", "Next / previous point in x order."],
          ["↑ / ↓", "Next / previous point in y order."],
          ["Home / End", "Jump to the first / last point in x order."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces the point's x, y (and size, for bubbles).",
          "ScatterTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "With reduced motion on, the points start at their final positions and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}
