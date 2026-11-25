// The `patterns` prop (non-colour hatch cues) on every chart whose series are told apart by fill:
// pattern defs are drawn when it is on, none when it is off, and legend swatches follow.
import { expect, it } from "vitest";

import { BarChart } from "../../src/components/charts/bar-chart";
import { BumpChart } from "../../src/components/charts/bump-chart";
import { ComboChart } from "../../src/components/charts/combo-chart";
import { DonutChart } from "../../src/components/charts/donut-chart";
import { FunnelChart } from "../../src/components/charts/funnel-chart";
import { MarimekkoChart } from "../../src/components/charts/marimekko-chart";
import { PercentBarChart } from "../../src/components/charts/percent-bar-chart";
import { RadarChart } from "../../src/components/charts/radar-chart";
import { SankeyChart } from "../../src/components/charts/sankey-chart";
import { Streamgraph } from "../../src/components/charts/streamgraph";
import { ErrorBarChart } from "../../src/components/charts/error-bar-chart";
import { PieChart } from "../../src/components/charts/pie-chart";
import { PopulationPyramid } from "../../src/components/charts/population-pyramid";
import { RadialBarChart } from "../../src/components/charts/radial-bar-chart";
import { StackedAreaChart } from "../../src/components/charts/stacked-area-chart";
import { Treemap, treemapLegend } from "../../src/components/charts/treemap";
import { ChartLegend, seriesLegend } from "../../src/components/charts/chart-parts";
import { box } from "../helpers-charts";
import { renderUi } from "../render";

const keys = ["a", "b", "c"];
const series = keys.map((key) => ({ key, label: key.toUpperCase() }));
const rows = ["Q1", "Q2", "Q3"].map((q, i) => ({ q, a: 3 + i, b: 5 - i, c: 2 + i }));
const slices = ["A", "B", "C"].map((label, i) => ({ label, value: 5 + i }));
const groups = ["A", "B", "C"].map((label, i) => ({
  label,
  children: [
    { label: `${label}1`, value: 10 + i },
    { label: `${label}2`, value: 6 },
  ],
}));

/** Counts the plot's `<pattern>` elements (not the legend swatches') once the chart has measured itself and drawn. */
async function patternsOf(el: HTMLElement, expected: number) {
  await expect
    .poll(() => [...el.querySelectorAll("pattern")].filter((p) => !p.closest("[data-slot='legend-key']")).length)
    .toBe(expected);
}

const cases: { name: string; make: (patterns: boolean) => React.ReactElement; on: number }[] = [
  {
    name: "BarChart (grouped)",
    make: (patterns) => <BarChart data={rows} index="q" series={series} patterns={patterns} aria-label="Bars" />,
    on: 2,
  },
  {
    name: "BarChart (stacked)",
    make: (patterns) => (
      <BarChart data={rows} index="q" series={series} stacked patterns={patterns} aria-label="Bars" />
    ),
    on: 2,
  },
  {
    name: "StackedAreaChart",
    make: (patterns) => (
      <StackedAreaChart data={rows} index="q" series={series} patterns={patterns} aria-label="Areas" />
    ),
    on: 2,
  },
  {
    name: "DonutChart",
    make: (patterns) => <DonutChart data={slices} patterns={patterns} aria-label="Donut" />,
    on: 2,
  },
  {
    name: "PieChart",
    make: (patterns) => <PieChart data={slices} patterns={patterns} aria-label="Pie" />,
    on: 2,
  },
  {
    name: "RadialBarChart",
    make: (patterns) => <RadialBarChart data={slices} max={10} patterns={patterns} aria-label="Rings" />,
    on: 2,
  },
  {
    name: "FunnelChart",
    make: (patterns) => <FunnelChart data={slices} patterns={patterns} aria-label="Funnel" />,
    on: 2,
  },
  {
    name: "Treemap",
    make: (patterns) => <Treemap data={groups} patterns={patterns} aria-label="Treemap" />,
    on: 2,
  },
  {
    name: "ComboChart (bar series hatched, line left alone)",
    make: (patterns) => (
      <ComboChart
        data={rows}
        index="q"
        series={[
          { key: "a", label: "A", type: "bar" },
          { key: "b", label: "B", type: "bar" },
          { key: "c", label: "C", type: "line" },
        ]}
        patterns={patterns}
        aria-label="Combo"
      />
    ),
    on: 1,
  },
  {
    name: "RadarChart",
    make: (patterns) => (
      <RadarChart data={rows} index="q" series={series} max={10} patterns={patterns} aria-label="Radar" />
    ),
    on: 2,
  },
  {
    name: "Streamgraph",
    make: (patterns) => <Streamgraph data={rows} index="q" series={series} patterns={patterns} aria-label="Stream" />,
    on: 2,
  },
  {
    name: "SankeyChart (one hatch per node colour)",
    make: (patterns) => (
      <SankeyChart
        nodes={[
          { id: "a", label: "A", color: 1 },
          { id: "b", label: "B", color: 2 },
          { id: "c", label: "C", color: 3 },
        ]}
        links={[
          { source: "a", target: "b", value: 4 },
          { source: "a", target: "c", value: 3 },
        ]}
        patterns={patterns}
        aria-label="Flow"
      />
    ),
    on: 2,
  },
  {
    name: "ErrorBarChart (bars hatched per item colour)",
    make: (patterns) => (
      <ErrorBarChart
        data={[
          { label: "A", value: 5, low: 4, high: 6, color: 1 },
          { label: "B", value: 6, low: 5, high: 7, color: 2 },
          { label: "C", value: 4, low: 3, high: 5, color: 3 },
        ]}
        patterns={patterns}
        aria-label="Intervals"
      />
    ),
    on: 2,
  },
  {
    name: "MarimekkoChart",
    make: (patterns) => (
      <MarimekkoChart data={rows} index="q" series={series} patterns={patterns} aria-label="Mosaic" />
    ),
    on: 2,
  },
  {
    name: "PercentBarChart",
    make: (patterns) => (
      <PercentBarChart data={rows} index="q" series={series} patterns={patterns} aria-label="Shares" />
    ),
    on: 2,
  },
  {
    name: "PopulationPyramid",
    make: (patterns) => (
      <PopulationPyramid
        data={[
          { label: "0-19", start: 9, end: 8 },
          { label: "20-39", start: 10, end: 11 },
        ]}
        patterns={patterns}
        aria-label="Pyramid"
      />
    ),
    on: 1,
  },
];

for (const c of cases) {
  it(`${c.name}: hatch patterns are drawn with patterns on and absent with it off`, async () => {
    const { container, rerender } = renderUi(box(c.make(true)));
    await patternsOf(container, c.on);
    rerender(box(c.make(false)));
    await patternsOf(container, 0);
  });
}

it("BumpChart: lines get dash styles with patterns on and stay solid with it off", async () => {
  const standings = ["2022", "2023"].map((year, i) => ({ year, a: 3 + i, b: 5 - i, c: 4 }));
  const make = (patterns: boolean) => (
    <BumpChart data={standings} index="year" series={series} patterns={patterns} aria-label="Ranks" />
  );
  // Solid lines animate their own `stroke-dasharray` (draw-on); a pattern dash is a fixed rhythm like "8 4".
  const rhythm = (el: HTMLElement) =>
    [...el.querySelectorAll("path[stroke-dasharray]")].some((p) => p.getAttribute("stroke-dasharray") === "8 4");
  const { container, rerender } = renderUi(box(make(true)));
  await expect.poll(() => rhythm(container)).toBe(true);
  rerender(box(make(false)));
  await expect.poll(() => rhythm(container)).toBe(false);
});

it("legend swatches show the hatch: seriesLegend, treemapLegend and a chart's own legend", () => {
  const { container } = renderUi(<ChartLegend items={seriesLegend(series, "rect", true)} />);
  // Series 0 stays solid; the others carry a pattern each.
  expect(container.querySelectorAll("[data-slot='legend-key'] pattern").length).toBe(2);
  expect(seriesLegend(series, "rect", false).every((i) => i.pattern === undefined)).toBe(true);
  expect(seriesLegend(series, "line", true).every((i) => i.pattern === undefined)).toBe(true);
  expect(seriesLegend(series.concat(series), "rect").map((i) => i.pattern)).toEqual([undefined, 1, 2, 3, 4, 5]);
  expect(treemapLegend(groups, true).map((i) => i.pattern)).toEqual([undefined, 1, 2]);
});

it("ErrorBarChart points switch marker shape per colour with patterns on, and stay round with it off", async () => {
  const items = [1, 2, 3].map((c) => ({
    label: `P${c}`,
    value: 4 + c,
    low: 3 + c,
    high: 5 + c,
    color: c as 1 | 2 | 3,
  }));
  const make = (patterns: boolean) => (
    <ErrorBarChart data={items} variant="point" patterns={patterns} aria-label="Points" />
  );
  // Round points are circles; the second and third colour draw a square and a triangle outline instead.
  const shapes = (el: HTMLElement) => el.querySelectorAll("path[transform^='translate(']").length;
  const { container, rerender } = renderUi(box(make(true)));
  await expect.poll(() => shapes(container)).toBe(2);
  rerender(box(make(false)));
  await expect.poll(() => shapes(container)).toBe(0);
});
