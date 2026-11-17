import { startTransition, useState } from "react";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { MarimekkoChart, MarimekkoTable } from "@sheenui/theme";
import { seriesLegend } from "@sheenui/theme";
import type { ChartSeries } from "@sheenui/theme";
import { ChartCard, Headline } from "./shared";

/* ====================================================================== */
/* Marimekko                                                              */
/* ====================================================================== */

export const vendors: ChartSeries[] = [
  { key: "us", label: "Acme (us)", color: 1 },
  { key: "northwind", label: "Northwind", color: 3 },
  { key: "contoso", label: "Contoso", color: 2 },
  { key: "others", label: "Others", color: 7 },
];

export const markets = {
  y2024: [
    { segment: "Enterprise", us: 640, northwind: 1480, contoso: 1210, others: 870 },
    { segment: "Mid-market", us: 520, northwind: 610, contoso: 740, others: 730 },
    { segment: "SMB", us: 410, northwind: 220, contoso: 380, others: 790 },
    { segment: "Startups", us: 260, northwind: 60, contoso: 90, others: 290 },
  ],
  y2025: [
    { segment: "Enterprise", us: 910, northwind: 1420, contoso: 1150, others: 820 },
    { segment: "Mid-market", us: 760, northwind: 590, contoso: 700, others: 690 },
    { segment: "SMB", us: 520, northwind: 210, contoso: 350, others: 760 },
    { segment: "Startups", us: 340, northwind: 70, contoso: 80, others: 260 },
  ],
};

export const formatMillions = (n: number) => `$${n}M`;

export const products: ChartSeries[] = [
  { key: "platform", label: "Platform", color: 1 },
  { key: "analytics", label: "Analytics", color: 4 },
  { key: "services", label: "Services", color: 5 },
];

export const regions = [
  { region: "North America", platform: 4.8, analytics: 2.1, services: 1.2 },
  { region: "Europe", platform: 3.1, analytics: 1.6, services: 0.9 },
  { region: "Asia Pacific", platform: 1.9, analytics: 1.4, services: 0.3 },
  { region: "Latin America", platform: 0.7, analytics: 0.2, services: 0.2 },
  { region: "Middle East", platform: 0.4, analytics: 0.1, services: 0.1 },
];

export function MarketMapExample() {
  const [year, setYear] = useState<"y2024" | "y2025">("y2025");
  const data = markets[year];
  const ours = data.reduce((s, r) => s + r.us, 0) * 1_000_000;
  return (
    <Example
      title="Market map, year on year"
      description="Columns are segments sized by total spend; cells are vendors. Switch the year: every cell reshapes in place. Arrow keys move between segments (left / right) and vendors (up / down)."
      variant="bare"
      controls={
        <Segmented
          label="Year"
          size="sm"
          options={[
            { value: "y2024", label: "2024" },
            { value: "y2025", label: "2025" },
          ]}
          value={year}
          // A data switch re-renders the whole chart: as a transition, React renders it in slices (the click never blocks).
          onValueChange={(v) => startTransition(() => setYear(v))}
        />
      }
      code={`
import { ChartCard, seriesLegend, MarimekkoTable, MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "us", label: "Acme (us)", color: 1 },
  { key: "northwind", label: "Northwind", color: 3 },
  { key: "contoso", label: "Contoso", color: 2 },
  { key: "others", label: "Others", color: 7 },
];
const data = [
  { segment: "Enterprise", us: 910, northwind: 1420, contoso: 1150, others: 820 },
  { segment: "Mid-market", us: 760, northwind: 590, contoso: 700, others: 690 },
  { segment: "SMB", us: 520, northwind: 210, contoso: 350, others: 760 },
  { segment: "Startups", us: 340, northwind: 70, contoso: 80, others: 260 },
];

<ChartCard
  title="Market map"
  legend={seriesLegend(series, "rect")}
  table={<MarimekkoTable data={data} index="segment" indexLabel="Segment" series={series} caption="Spend by segment and vendor" />}
>
  <MarimekkoChart
    data={data}
    index="segment"
    series={series}
    format={(n) => \`$\${n}M\`}
    aria-label="Market spend by segment and vendor, 2025"
  />
</ChartCard>`}
    >
      <ChartCard
        className="w-full"
        title="Market map"
        description={`Spend by segment and vendor, ${year === "y2024" ? "2024" : "2025"} ($M)`}
        aside={<Headline value={ours} label="our revenue" currency />}
        legend={seriesLegend(vendors, "rect")}
        table={
          <MarimekkoTable
            data={data}
            index="segment"
            indexLabel="Segment"
            series={vendors}
            format={(n) => `$${n}M`}
            caption="Spend by segment and vendor"
          />
        }
      >
        <MarimekkoChart
          data={data}
          index="segment"
          series={vendors}
          format={formatMillions}
          aria-label={`Market spend by segment and vendor, ${year === "y2024" ? "2024" : "2025"}`}
        />
      </ChartCard>
    </Example>
  );
}
