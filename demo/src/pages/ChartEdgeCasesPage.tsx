import { seededLcg as seeded } from "../demo-utils";
import { useState, type ReactNode } from "react";
import {
  AreaChart,
  BarChart,
  Button,
  ChartTable,
  DonutChart,
  LineChart,
  RadialProgress,
  Sparkline,
  seriesLegend,
  type ChartRow,
  type ChartSeries,
} from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";

import { Page } from "../layout/Page";
import { ChartSyncProvider } from "@sheenui/theme";
import type { ChartAnnotation } from "@sheenui/theme";
import type { CompareSeries } from "@sheenui/theme";

/* Edge cases the charts must survive: empty, single point, negatives, duplicate labels,
   fractional ticks, flat lines, all-zero donuts, live data changes, and the chart-wide features
   (hidden series, short brushes, stray annotations, partial comparisons, sync mismatches, i18n). */

const one: ChartSeries[] = [{ key: "v", label: "Value", color: 1 }];
const two: ChartSeries[] = [
  { key: "a", label: "Alpha", color: 1 },
  { key: "b", label: "Beta", color: 2 },
];

const negative = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({ m, v: -1200 - i * 340 - (i % 2) * 260 }));
const mixed = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
  m,
  a: Math.round(Math.sin(i * 0.9) * 800),
  b: Math.round(Math.cos(i * 0.7) * 500 - 200),
}));
const fractional = ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({ q, v: [0.1, 0.4, 0.85, 0.6][i] ?? 0 }));
const duplicates: ChartRow[] = [
  { q: "Q1", a: 12, b: 8 },
  { q: "Q1", a: 15, b: 9 },
  { q: "Q2", a: 9, b: 14 },
  { q: "Q2", a: 18, b: 11 },
];
const profit = [
  { region: "North America", v: 4200 },
  { region: "Europe, Middle East and Africa", v: -1850 },
  { region: "Asia Pacific", v: 2600 },
  { region: "Latin America", v: -640 },
];
const diverging = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => ({
  d,
  a: 30 + i * 6,
  b: -(12 + ((i * 7) % 15)),
}));

const partialCompare: CompareSeries[] = [{ key: "v", label: "Value", color: 1, compareKey: "p" }];
// Previous-period values exist for only some rows; the dashed line and table column skip the rest.
const partial = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({
  m,
  v: 40 + i * 6,
  ...(i < 3 ? {} : { p: 30 + i * 5 }),
}));
const strayAnnotations: ChartAnnotation[] = [
  { type: "line", value: 140, label: "Way above the data" },
  { type: "event", at: "Nope", label: "Unknown x value (skipped)" },
  { type: "range", from: "Feb", to: "Zzz", label: "Open-ended range" },
  { type: "band", from: -20, to: 10, label: "Below zero" },
];
const short = [
  { m: "Jan", v: 4 },
  { m: "Feb", v: 7 },
  { m: "Mar", v: 5 },
];
const otherMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({ m, v: 20 + ((i * 7) % 11) }));

function Case({ title, note, children, wide }: { title: string; note?: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? "flex flex-col gap-2 lg:col-span-2" : "flex flex-col gap-2"}>
      <h2 className="text-base font-semibold">{title}</h2>
      {note && <p className="-mt-1 text-sm text-sheen-fg-muted">{note}</p>}
      {children}
    </section>
  );
}

/** The "Chart edge cases" test bench (/charts/edge-cases, hidden from the nav): empty, single-point and extreme data. */
export function ChartEdgeCasesPage() {
  const [seed, setSeed] = useState(1);
  const rand = seeded(seed);
  const live = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
    d,
    a: Math.round(rand() * 900 - 150),
    b: Math.round(rand() * 600),
  }));
  const liveSpark = Array.from({ length: 8 }, () => Math.round(rand() * 100));

  return (
    <Page
      eyebrow="Chart"
      title="Chart edge cases"
      description="The awkward data every chart must handle: nothing at all, one point, negatives, duplicate labels, fractional ticks and live updates."
      source="theme/src/components/charts"
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
        <Case title="Live data" note="Same categories, new values: bars tween, lines morph, the axis slides." wide>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setSeed((s) => s + 1)}>Shuffle values</Button>
            <div className="w-40">
              <Sparkline values={liveSpark} aria-label="Live sparkline" />
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
            <ChartCard
              title="Grouped bars"
              legend={seriesLegend(two, "rect")}
              table={<ChartTable data={live} index="d" indexLabel="Day" series={two} />}
            >
              <BarChart data={live} index="d" series={two} aria-label="Live grouped bars" />
            </ChartCard>
            <ChartCard title="Lines" legend={seriesLegend(two, "line")}>
              <LineChart data={live} index="d" series={two} aria-label="Live lines" />
            </ChartCard>
          </div>
        </Case>

        <Case
          title="Every series hidden"
          note="The axis falls back to 0–1 and the chart stays focusable; the legend brings series back."
        >
          <ChartCard title="Hidden series" legend={seriesLegend(two, "line")} defaultHiddenSeries={["a", "b"]}>
            <LineChart data={mixed} index="m" series={two} aria-label="Two series, both hidden" />
          </ChartCard>
        </Case>

        <Case
          title="Brush on three rows"
          note="The window can't shrink below its minimum span; arrows and Home / End stay in range."
        >
          <ChartCard title="Short series">
            <AreaChart
              data={short}
              index="m"
              series={one}
              brush={{ minSpan: 2 }}
              aria-label="Three months with a brush"
            />
          </ChartCard>
        </Case>

        <Case
          title="Stray annotations"
          note="A line above the data stretches the axis; an unknown event is skipped; an open range runs to the end."
        >
          <ChartCard title="Annotations off the data">
            <LineChart
              data={partial}
              index="m"
              series={one}
              annotations={strayAnnotations}
              aria-label="Values with stray annotations"
            />
          </ChartCard>
        </Case>

        <Case
          title="Partial previous period"
          note="Rows without a previous value: no dashed segment, a dash in the table."
        >
          <ChartCard
            title="Partial comparison"
            table={<ChartTable data={partial} index="m" indexLabel="Month" series={partialCompare} />}
          >
            <BarChart
              data={partial}
              index="m"
              series={partialCompare}
              aria-label="Values with a partial previous period"
            />
          </ChartCard>
        </Case>

        <Case
          title="Synced charts that share no x values"
          note="Hovering one draws nothing in the other (no match), and never errors."
          wide
        >
          <ChartSyncProvider>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <ChartCard title="Jan – Jun">
                <LineChart data={partial} index="m" series={one} height={200} aria-label="January to June" />
              </ChartCard>
              <ChartCard title="Apr – Sep">
                <BarChart data={otherMonths} index="m" series={one} height={200} aria-label="April to September" />
              </ChartCard>
            </div>
          </ChartSyncProvider>
        </Case>

        <Case
          title="Labels and an empty table, in German"
          note="ChartCard labels reach the tabs, the empty table and the download menu."
        >
          <div lang="de" className="contents">
            <ChartCard
              title="Bestellungen"
              exportable
              labels={{
                chart: "Diagramm",
                table: "Tabelle",
                noData: "Keine Daten",
                options: (t) => `${t}: herunterladen`,
                downloadPng: "Als PNG",
                downloadSvg: "Als SVG",
                downloadCsv: "Als CSV",
              }}
              table={<ChartTable data={[]} index="m" series={one} />}
            >
              <BarChart data={[]} index="m" series={one} aria-label="Bestellungen pro Monat" />
            </ChartCard>
          </div>
        </Case>

        <Case
          title="Donut with every slice hidden"
          note="The center says No data; the legend keys still bring slices back."
        >
          <div className="glass-2 flex flex-wrap items-center justify-center gap-6 rounded-sheen-lg p-5">
            <DonutChart
              diameter={140}
              data={[
                { label: "A", value: 3 },
                { label: "B", value: 5 },
              ]}
              defaultHiddenSlices={["A", "B"]}
              aria-label="All slices hidden"
            />
          </div>
        </Case>

        <Case title="Empty line chart">
          <ChartCard title="Signups">
            <LineChart data={[]} index="m" series={one} aria-label="Signups per month" />
          </ChartCard>
        </Case>

        <Case title="Empty bar chart">
          <ChartCard title="Orders" table={<ChartTable data={[]} index="m" series={one} />}>
            <BarChart data={[]} index="m" series={one} aria-label="Orders per month" emptyState="Nothing sold yet" />
          </ChartCard>
        </Case>

        <Case title="Single data point" note="A lone point is drawn as a dot.">
          <ChartCard title="First month">
            <LineChart data={[{ m: "Jan", v: 1240 }]} index="m" series={one} aria-label="One month of revenue" />
          </ChartCard>
        </Case>

        <Case title="Fractional ticks" note="A 0.25 step prints 0.25 / 0.5 / 0.75, never 0.3 / 0.8.">
          <ChartCard title="Conversion rate">
            <AreaChart data={fractional} index="q" series={one} aria-label="Conversion rate per quarter" />
          </ChartCard>
        </Case>

        <Case title="All-negative area" note="Zero stays on the axis and the fill stays inside the plot.">
          <ChartCard title="Net burn">
            <AreaChart data={negative} index="m" series={one} aria-label="Net burn per month" />
          </ChartCard>
        </Case>

        <Case title="Mixed-sign lines">
          <ChartCard title="Deltas" legend={seriesLegend(two, "line")}>
            <AreaChart data={mixed} index="m" series={two} aria-label="Deltas per month" />
          </ChartCard>
        </Case>

        <Case title="Negative bars" note="Bars hang below a zero baseline, rounded at the negative end.">
          <ChartCard title="Deltas by month" legend={seriesLegend(two, "rect")}>
            <BarChart data={mixed} index="m" series={two} aria-label="Deltas per month" />
          </ChartCard>
        </Case>

        <Case title="Diverging stack">
          <ChartCard
            title="Gained vs lost"
            legend={seriesLegend(
              [
                { key: "a", label: "Gained", color: 3 },
                { key: "b", label: "Lost", color: 8 },
              ],
              "rect",
            )}
          >
            <BarChart
              stacked
              data={diverging}
              index="d"
              series={[
                { key: "a", label: "Gained", color: 3 },
                { key: "b", label: "Lost", color: 8 },
              ]}
              aria-label="Customers gained and lost per day"
            />
          </ChartCard>
        </Case>

        <Case title="Horizontal, negative, long names">
          <ChartCard title="Profit by region">
            <BarChart
              layout="horizontal"
              showValues
              data={profit}
              index="region"
              series={one}
              aria-label="Profit by region"
            />
          </ChartCard>
        </Case>

        <Case title="Duplicate labels" note="Two rows called Q1 and two called Q2: no key collisions.">
          <ChartCard
            title="Repeated quarters"
            legend={seriesLegend(two, "rect")}
            table={<ChartTable data={duplicates} index="q" indexLabel="Quarter" series={two} />}
          >
            <BarChart data={duplicates} index="q" series={two} aria-label="Repeated quarters" />
          </ChartCard>
        </Case>

        <Case title="Donuts: empty, all zero, one slice, duplicates">
          <div className="glass-2 flex flex-wrap items-center justify-center gap-6 rounded-sheen-lg p-5">
            <DonutChart diameter={140} data={[]} aria-label="Empty donut" />
            <DonutChart
              diameter={140}
              data={[
                { label: "A", value: 0 },
                { label: "B", value: 0 },
              ]}
              aria-label="All-zero donut"
            />
            <DonutChart diameter={140} data={[{ label: "Only", value: 42 }]} aria-label="One-slice donut" />
            <DonutChart
              diameter={140}
              data={[
                { label: "Same", value: 3 },
                { label: "Same", value: 5 },
              ]}
              aria-label="Duplicate-label donut"
            />
          </div>
        </Case>

        <Case title="Sparklines: empty, one value, flat">
          <div className="glass-2 grid grid-cols-3 gap-4 rounded-sheen-lg p-5">
            <Sparkline values={[]} aria-label="Empty trend" />
            <Sparkline values={[7]} aria-label="One value" />
            <Sparkline values={[5, 5, 5, 5]} aria-label="Flat trend" />
          </div>
        </Case>

        <Case title="Radial progress: 0 and not-a-number">
          <div className="glass-2 flex flex-wrap items-center justify-center gap-6 rounded-sheen-lg p-5">
            <RadialProgress diameter={120} value={0} label="Nothing yet" />
            <RadialProgress diameter={120} value={Number.NaN} label="Unknown" />
            <RadialProgress diameter={120} variant="gauge" coloring="severity" value={140} label="Over limit" />
          </div>
        </Case>
      </div>
    </Page>
  );
}
