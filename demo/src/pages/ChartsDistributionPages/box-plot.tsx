import { useMemo, useState } from "react";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { BoxPlot, BoxPlotTable, type BoxPlotGroup } from "@sheenui/theme";
import { CARD, gaussian, ms, seeded } from "./shared";

/* ====================================================================== */
/* Box plot                                                               */
/* ====================================================================== */

/** Page-load times (ms) per region: log-normal samples with a few slow outliers. */
export function makeRegionLoads(): BoxPlotGroup[] {
  const regions: [string, number, number][] = [
    ["Europe", 820, 0.28],
    ["North America", 760, 0.25],
    ["South America", 1180, 0.33],
    ["Asia Pacific", 1020, 0.36],
    ["Africa", 1390, 0.3],
  ];
  return regions.map(([label, median, spread], i) => {
    const z = gaussian(seeded(100 + i));
    return { label, values: Array.from({ length: 240 }, () => Math.round(median * Math.exp(spread * z()))) };
  });
}

/** Weekly active minutes per plan: free users split into casual and power users. */
function makeSessions(): BoxPlotGroup[] {
  const random = seeded(77);
  const z = gaussian(random);
  const plan = (n: number, f: () => number) => Array.from({ length: n }, () => Math.max(1, Math.round(f())));
  return [
    { label: "Free", values: plan(320, () => (random() < 0.7 ? 24 + 9 * z() : 92 + 16 * z())) },
    { label: "Pro", values: plan(260, () => 118 + 30 * z()) },
    { label: "Team", values: plan(200, () => 156 + 26 * z()) },
    { label: "Enterprise", values: plan(140, () => 190 + 40 * z()) },
  ];
}

export const deliveries: BoxPlotGroup[] = [
  {
    label: "Parcelly",
    summary: { low: 1, q1: 2, median: 2.5, q3: 3, high: 4.5, mean: 2.7, n: 1840, outliers: [6, 7, 9] },
  },
  {
    label: "SwiftPost",
    summary: { low: 1, q1: 1.5, median: 2, q3: 2.5, high: 4, mean: 2.1, n: 2210, outliers: [5.5] },
  },
  {
    label: "RoadRunner",
    summary: { low: 2, q1: 3, median: 4, q3: 5, high: 7.5, mean: 4.2, n: 960, outliers: [10, 11] },
    color: 8,
  },
  { label: "Postal", summary: { low: 2, q1: 3, median: 3.5, q3: 4, high: 5.5, mean: 3.6, n: 3120 } },
];

/** Its own component, so switching the shape re-renders this example only. */
export function ViolinExample() {
  const sessions = useMemo(() => makeSessions(), []);
  const [variant, setVariant] = useState<"box" | "violin">("violin");
  return (
    <Example
      title="Violin"
      description='variant="violin" draws each group&apos;s density around a slim box. The Free plan has two peaks, casual and power users, which a box alone would hide.'
      variant="bare"
      controls={
        <Segmented
          label="Shape"
          size="sm"
          options={[
            { value: "violin", label: "Violin" },
            { value: "box", label: "Box" },
          ]}
          value={variant}
          onValueChange={setVariant}
        />
      }
      code={`
import { BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Weekly active minutes per user (a sample; yours is the full list)
const plans: BoxPlotGroup[] = [
  { label: "Free", values: [12, 18, 22, 26, 31, 20, 88, 95, 102, 24, 28, 90] },
  { label: "Pro", values: [84, 102, 118, 126, 140, 111, 97, 133, 150, 121] },
  { label: "Team", values: [120, 138, 152, 160, 171, 144, 129, 165, 182, 156] },
  { label: "Enterprise", values: [130, 168, 190, 205, 232, 177, 150, 214, 248, 196] },
];

export function Example() {
  return (
    <BoxPlot
      variant="violin"
      data={plans}
      color={3}
      valueLabel="Minutes"
      aria-label="Weekly active minutes by plan"
    />
  );
}`}
    >
      <ChartCard
        className={CARD}
        title="Weekly active minutes"
        description="By plan"
        table={<BoxPlotTable data={sessions} caption="Weekly active minutes by plan" />}
      >
        <BoxPlot
          variant={variant}
          data={sessions}
          color={3}
          valueLabel="Minutes"
          height={300}
          aria-label="Weekly active minutes by plan"
        />
      </ChartCard>
    </Example>
  );
}

/** Its own component, so switching the whiskers re-renders this example only. */
export function RegionLoadsExample() {
  const loads = useMemo(() => makeRegionLoads(), []);
  const [tukey, setTukey] = useState<"1.5" | "minmax">("1.5");
  const whisker = tukey === "minmax" ? "minmax" : 1.5;
  return (
    <Example
      title="Box and whiskers"
      description="Page-load times in five regions, 240 visits each, with the mean as a diamond. Switch the whiskers to min–max and the outliers fold into them. Arrow between regions; up and down step through a region's outliers."
      variant="bare"
      controls={
        <Segmented
          label="Whiskers"
          size="sm"
          options={[
            { value: "1.5", label: "1.5 × IQR" },
            { value: "minmax", label: "Min–max" },
          ]}
          value={tukey}
          onValueChange={setTukey}
        />
      }
      code={`
import { ChartCard, BoxPlotTable, BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Raw page-load samples in ms (a sample; yours has hundreds per region)
const regions: BoxPlotGroup[] = [
  { label: "Europe", values: [610, 702, 760, 815, 840, 905, 980, 1100, 1480] },
  { label: "North America", values: [580, 660, 720, 770, 810, 860, 930, 1020, 1390] },
  { label: "Asia Pacific", values: [700, 830, 940, 1010, 1090, 1180, 1300, 1560, 2100] },
  { label: "Africa", values: [900, 1080, 1210, 1350, 1420, 1530, 1700, 1990, 2600] },
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="Page load by region"
      table={<BoxPlotTable data={regions} whisker={1.5} format={ms} caption="Page load statistics by region" />}
    >
      <BoxPlot
        data={regions}
        whisker={1.5}
        showMean
        format={ms}
        valueLabel="Load time"
        aria-label="Page load times by region"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Page load by region"
        description="Last 7 days, 240 visits per region"
        table={<BoxPlotTable data={loads} whisker={whisker} format={ms} caption="Page load statistics by region" />}
      >
        <BoxPlot
          data={loads}
          whisker={whisker}
          showMean
          format={ms}
          valueLabel="Load time"
          aria-label="Page load times by region"
        />
      </ChartCard>
    </Example>
  );
}
