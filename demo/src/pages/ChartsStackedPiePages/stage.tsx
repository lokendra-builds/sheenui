import {
  PercentBarChart,
  PieChart,
  StackedAreaChart,
  seriesLegend,
  type ChartSeries,
  type PieSlice,
} from "@sheenui/theme";
import { ChartStage } from "../../layout/ShowcaseStage.chart.scene";
import { months, seeded } from "./shared";

const r = seeded(1);
const traffic = months.map((month, i) => ({
  month,
  organic: Math.round(38000 + i * 2600 + Math.sin(i * 1.1) * 3800 + r() * 2400),
  paid: Math.round(21000 + i * 1500 + Math.cos(i * 0.8) * 3000 + r() * 2000),
  referral: Math.round(9000 + i * 700 + Math.sin(i * 0.6 + 1) * 1600 + r() * 1200),
  social: Math.round(6000 + i * 900 + Math.cos(i * 1.3) * 1400 + r() * 1000),
}));
const trafficSeries: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "social", label: "Social", color: 4 },
];

const plans = [
  { region: "North America", free: 4200, pro: 2600, team: 1400 },
  { region: "Europe", free: 5100, pro: 2100, team: 900 },
  { region: "Asia Pacific", free: 7400, pro: 1500, team: 600 },
  { region: "Latin America", free: 2600, pro: 700, team: 180 },
  { region: "Middle East & Africa", free: 1900, pro: 420, team: 90 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

const browsers: PieSlice[] = [
  { label: "Chrome", value: 612_000, color: 1 },
  { label: "Safari", value: 198_000, color: 2 },
  { label: "Edge", value: 53_000, color: 3 },
  { label: "Firefox", value: 34_000, color: 4 },
  { label: "Other mobile", value: 26_000, color: 5 },
  { label: "Opera", value: 22_000, color: 6 },
  { label: "Brave", value: 11_000, color: 7 },
  { label: "UC Browser", value: 9_000, color: 8 },
];

export function StackedAreaStage() {
  return (
    <ChartStage
      label="Stacked area chart demo"
      title="Sessions by channel"
      hue={1}
      height="16.25rem"
      legend={seriesLegend(trafficSeries, "rect")}
    >
      <StackedAreaChart
        data={traffic}
        index="month"
        series={trafficSeries}
        aria-label="Monthly sessions by channel, stacked"
      />
    </ChartStage>
  );
}

export function PercentBarStage() {
  return (
    <ChartStage
      label="100% stacked bars demo"
      title="Plan mix by region"
      hue={1}
      height="14.75rem"
      legend={seriesLegend(planSeries, "rect")}
    >
      <PercentBarChart
        showValues
        data={plans}
        index="region"
        series={planSeries}
        aria-label="Share of customers on each plan, by region"
      />
    </ChartStage>
  );
}

export function PieStage() {
  return (
    <ChartStage label="Pie chart demo" title="Visits by browser" hue={1} height="20.875rem" narrowHeight="22.25rem">
      <PieChart data={browsers} maxSlices={4} height={280} aria-label="Visits by browser in the last 30 days" />
    </ChartStage>
  );
}

// Page.tsx finds a page's stage among its children by this mark: without it the export chips sit above the stage.
StackedAreaStage.isShowcaseStage = true;
PercentBarStage.isShowcaseStage = true;
PieStage.isShowcaseStage = true;
