import { BarChart, ChartTable, FunnelChart, PieChart, PieTable, seriesLegend, type ChartSeries } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";

/*
 * The "Patterns" examples of the bar, pie and funnel pages. Each page loads its demo as a lazy island
 * (lazyBlock), so the charts' hatch code and the data stay out of the page chunk.
 */

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

/** Grouped bars with `patterns` on, so the three series differ by hatch as well as by colour. */
export function BarPatternsDemo() {
  return (
    <ChartCard
      className="w-full"
      title="Customers per plan"
      description="Hatched, so it survives greyscale print"
      legend={seriesLegend(planSeries, "rect", true)}
      table={<ChartTable data={plans} index="month" indexLabel="Month" series={planSeries} />}
    >
      <BarChart patterns data={plans} index="month" series={planSeries} aria-label="Customers per plan, hatched" />
    </ChartCard>
  );
}

const browsers = [
  { label: "Chrome", value: 62 },
  { label: "Safari", value: 21 },
  { label: "Firefox", value: 9 },
];

/** A pie with `patterns` on: the legend swatches carry the same hatch as the slices. */
export function PiePatternsDemo() {
  return (
    <ChartCard
      className="w-full"
      title="Browser share"
      description="Hatched slices"
      table={<PieTable data={browsers} indexLabel="Browser" caption="Browser share" />}
    >
      <PieChart patterns data={browsers} aria-label="Browser share, hatched" />
    </ChartCard>
  );
}

const stages = [
  { label: "Visited", value: 12000 },
  { label: "Signed up", value: 3400 },
  { label: "Subscribed", value: 820 },
];

/** A funnel with `patterns` on: each stage after the first gets its own hatch. */
export function FunnelPatternsDemo() {
  return <FunnelChart patterns data={stages} aria-label="Conversion from visit to subscription, hatched" />;
}
