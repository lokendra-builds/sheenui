// Comparison / ranking charts: Heatmap, FunnelChart, Treemap, WaterfallChart, BulletChart, GaugeChart,
// LollipopChart, DumbbellChart, DivergingBarChart (and their table views).
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Heatmap, HeatmapTable } from "../../src/components/charts/heatmap";
import { FunnelChart, FunnelTable } from "../../src/components/charts/funnel-chart";
import { Treemap, TreemapTable, treemapLegend } from "../../src/components/charts/treemap";
import { WaterfallChart, WaterfallTable, waterfallLegend } from "../../src/components/charts/waterfall-chart";
import { BulletChart, BulletTable, bulletLegend } from "../../src/components/charts/bullet-chart";
import { GaugeChart, GaugeTable } from "../../src/components/charts/gauge-chart";
import { LollipopChart, LollipopTable } from "../../src/components/charts/lollipop-chart";
import { DumbbellChart, DumbbellTable, dumbbellLegend } from "../../src/components/charts/dumbbell-chart";
import { DivergingBarChart, DivergingBarTable, divergingLegend } from "../../src/components/charts/diverging-bar-chart";
import { parkPointer } from "../helpers";
import { renderUi } from "../render";
import {
  box,
  chartGroup,
  chartSuite,
  cleanMarkup,
  focusChart,
  hoverAt,
  polite,
  press,
  tipText,
} from "../helpers-charts";

/* ---------------------------------------------------------------- Heatmap */
const heat = [
  { day: "Mon", am: 3, pm: 8, eve: 5 },
  { day: "Tue", am: 6, pm: 2, eve: 9 },
  { day: "Wed", am: 1, pm: 7, eve: 4 },
];
const heatCols = [
  { key: "am", label: "Morning" },
  { key: "pm", label: "Afternoon" },
  { key: "eve", label: "Evening" },
];
chartSuite({
  name: "Heatmap",
  label: "Traffic by time of day",
  make: (x) => <Heatmap data={heat} index="day" columns={heatCols} aria-label="Traffic by time of day" {...x} />,
  reads: [
    { keys: "{Home}", says: /Mon · Morning: 3/ },
    { keys: "{ArrowRight}", says: /Mon · Afternoon: 8/ },
    { keys: "{End}", says: /Mon · Evening: 5/ },
    { keys: "{ArrowDown}", says: /Tue · Evening: 9/ },
    { keys: "{ArrowLeft}", says: /Tue · Afternoon: 2/ },
    { keys: "{ArrowUp}", says: /Mon · Afternoon: 8/ },
  ],
  table: {
    el: <HeatmapTable data={heat} index="day" columns={heatCols} indexLabel="Day" caption="Traffic table" />,
    caption: "Traffic table",
    headers: ["Day", "Morning", "Afternoon", "Evening"],
    cells: ["Mon", "3", "8", "Wed", "4"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Afternoon/ },
  variations: [
    {
      name: "showValues prints numbers in the cells",
      extra: { showValues: true },
      check: (g) => expect(g.textContent).toMatch(/8/),
    },
    { name: "stepped colour scale", extra: { steps: 4 } },
    { name: "explicit domain", extra: { domain: [0, 20] } },
    { name: "another colour and taller cells", extra: { color: 3, cellHeight: 44, minCellWidth: 60 } },
    { name: "no legend", extra: { legend: false } },
    { name: "custom legend label", extra: { legendLabel: "Visits" } },
    {
      name: "missing and negative values",
      extra: {
        data: [
          { day: "Mon", am: null, pm: -4, eve: 5 },
          { day: "Tue", am: 6, pm: Number.NaN, eve: 9 },
        ],
      },
    },
    { name: "a single cell", extra: { data: [{ day: "Mon", am: 3 }], columns: [heatCols[0]] } },
    { name: "all equal values", extra: { data: [{ day: "Mon", am: 5, pm: 5, eve: 5 }] } },
    {
      name: "many columns scroll horizontally",
      extra: {
        columns: Array.from({ length: 24 }, (_, i) => ({ key: `h${i}`, label: `${i}:00` })),
        data: heat.map((r) => ({
          day: r.day,
          ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`h${i}`, (i * 3) % 10])),
        })),
      },
    },
    {
      name: "custom format and locale",
      extra: { format: (n: number) => `${n} hits`, locale: "de" },
      reads: [{ keys: "{Home}", says: /3 hits/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("Heatmap interactions", () => {
  it("clicking a cell reports it; Enter and Space activate the focused cell", async () => {
    const onCellClick = vi.fn();
    renderUi(
      box(<Heatmap data={heat} index="day" columns={heatCols} aria-label="Traffic" onCellClick={onCellClick} />),
    );
    await focusChart("Traffic");
    await press("{Home}");
    await press("{Enter}");
    expect(onCellClick).toHaveBeenLastCalledWith({ row: "Mon", column: "am", columnLabel: "Morning", value: 3 });
    await press("{ArrowRight}");
    await press(" ");
    expect(onCellClick).toHaveBeenLastCalledWith({ row: "Mon", column: "pm", columnLabel: "Afternoon", value: 8 });
  });
  it("renders the empty state for no rows", async () => {
    renderUi(
      box(<Heatmap data={[]} index="day" columns={heatCols} aria-label="Traffic" emptyState="Nothing logged" />),
    );
    expect(await screen.findByText("Nothing logged")).toBeInTheDocument();
  });
});

/* ---------------------------------------------------------------- FunnelChart */
const funnel = [
  { label: "Visited", value: 1200 },
  { label: "Signed up", value: 340 },
  { label: "Subscribed", value: 82 },
];
chartSuite({
  name: "FunnelChart",
  label: "Conversion",
  make: (x) => <FunnelChart data={funnel} aria-label="Conversion" {...x} />,
  reads: [
    { keys: "{Home}", says: /Visited: 1,200/ },
    { keys: "{ArrowRight}", says: /Signed up: 340, 28.3% of first stage, 28.3% of previous stage, 860 dropped off/ },
    { keys: "{End}", says: /Subscribed: 82, 6.8% of first stage, 24.1% of previous stage, 258 dropped off/ },
    { keys: "{ArrowUp}", says: /Signed up/ },
  ],
  table: {
    el: <FunnelTable data={funnel} caption="Funnel table" />,
    caption: "Funnel table",
    cells: ["Visited", "1,200", "Signed up", "340", "28.3%", "82"],
  },
  hover: { x: 0.5, y: 0.5, shows: /of first stage/ },
  variations: [
    { name: "start-aligned", extra: { align: "start" } },
    { name: "another colour, without drop-off", extra: { color: 4, showDropOff: false } },
    {
      name: "a stage bigger than the previous one",
      extra: {
        data: [
          { label: "A", value: 10 },
          { label: "B", value: 25 },
          { label: "C", value: 5 },
        ],
      },
    },
    {
      name: "zero stage",
      extra: {
        data: [
          { label: "A", value: 10 },
          { label: "B", value: 0 },
          { label: "C", value: 0 },
        ],
      },
    },
    {
      name: "negative values",
      extra: {
        data: [
          { label: "A", value: -3 },
          { label: "B", value: 5 },
        ],
      },
    },
    { name: "a single stage", extra: { data: [{ label: "Only", value: 5 }] } },
    {
      name: "first stage zero (no percentages)",
      extra: {
        data: [
          { label: "A", value: 0 },
          { label: "B", value: 0 },
        ],
      },
    },
    {
      name: "German locale and formatters",
      extra: { locale: "de", format: (n: number) => `${n} Pers.` },
      reads: [{ keys: "{Home}", says: /1200 Pers\./ }],
    },
    {
      name: "long stage names",
      extra: {
        data: [
          { label: "A very long stage name that cannot fit anywhere near the bar", value: 100 },
          { label: "Another extremely long label here", value: 40 },
        ],
      },
    },
    {
      name: "many stages",
      extra: { data: Array.from({ length: 9 }, (_, i) => ({ label: `Stage ${i + 1}`, value: 1000 - i * 100 })) },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("FunnelChart: clicking or pressing Enter on a stage reports it", async () => {
  const onStageClick = vi.fn();
  renderUi(box(<FunnelChart data={funnel} aria-label="Conversion" onStageClick={onStageClick} />));
  await focusChart("Conversion");
  await press("{Home}");
  await press("{ArrowRight}");
  await press("{Enter}");
  expect(onStageClick).toHaveBeenLastCalledWith(funnel[1], 1);
  expect(cleanMarkup()).toBe(true);
});

/* ---------------------------------------------------------------- Treemap */
const regions = [
  {
    label: "Europe",
    children: [
      { label: "DE", value: 40 },
      { label: "FR", value: 30 },
    ],
  },
  {
    label: "Americas",
    children: [
      { label: "US", value: 90 },
      { label: "BR", value: 25 },
    ],
  },
];
chartSuite({
  name: "Treemap",
  label: "Revenue by region",
  make: (x) => <Treemap data={regions} aria-label="Revenue by region" {...x} />,
  reads: [
    { keys: "{Home}", says: /Europe, DE: 40, 57.1% of Europe, 21.6% of total/ },
    { keys: "{ArrowDown}", says: /: \d+, [\d.]+% of/ },
    { keys: "{End}", says: /Americas, BR: 25, 21.7% of Americas, 13.5% of total/ },
  ],
  table: {
    el: <TreemapTable data={regions} caption="Revenue table" />,
    caption: "Revenue table",
    cells: ["Europe", "DE", "40", "Americas", "US", "90"],
  },
  hover: { x: 0.2, y: 0.5, shows: /of total/ },
  variations: [
    {
      name: "flat data",
      extra: {
        data: [
          { label: "A", value: 5 },
          { label: "B", value: 3 },
          { label: "C", value: 1 },
        ],
      },
    },
    { name: "nested boundaries", extra: { nested: true } },
    { name: "drill down shows group tiles first", extra: { drillDown: true } },
    {
      name: "starts inside a group",
      extra: { drillDown: true, defaultPath: ["Europe"] },
      reads: [{ keys: "{Home}", says: /DE/ }],
    },
    { name: "a colour and a height", extra: { color: 5, height: 200 } },
    {
      name: "three levels deep",
      extra: {
        drillDown: true,
        data: [
          {
            label: "World",
            children: [
              {
                label: "EU",
                children: [
                  { label: "DE", value: 4 },
                  { label: "FR", value: 3 },
                ],
              },
              { label: "NA", children: [{ label: "US", value: 9 }] },
            ],
          },
        ],
      },
    },
    {
      name: "zero and negative leaves are skipped",
      extra: {
        data: [
          { label: "A", value: 5 },
          { label: "B", value: 0 },
          { label: "C", value: -4 },
          { label: "D", value: Number.NaN },
        ],
      },
    },
    { name: "a single node", extra: { data: [{ label: "Only", value: 7 }] } },
    {
      name: "per-node colour override",
      extra: {
        data: [
          { label: "A", value: 5, color: 6 },
          { label: "B", value: 3 },
        ],
      },
    },
    {
      name: "sixty tiles",
      extra: { data: Array.from({ length: 60 }, (_, i) => ({ label: `Tile ${i + 1}`, value: i + 1 })) },
    },
    {
      name: "custom formatters and locale",
      extra: { format: (n: number) => `${n} EUR`, locale: "de" },
      reads: [{ keys: "{Home}", says: /40 EUR/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("Treemap drill-down", () => {
  it("Enter zooms into a group, reports the path, and Escape zooms back out", async () => {
    const onPathChange = vi.fn();
    renderUi(box(<Treemap data={regions} drillDown aria-label="Revenue by region" onPathChange={onPathChange} />));
    await focusChart("Revenue by region");
    await press("{Home}");
    await expect.poll(polite).toMatch(/Europe/);
    await press("{Enter}");
    await expect.poll(() => onPathChange.mock.lastCall?.[0] as string[] | undefined).toEqual(["Europe"]);
    await press("{Escape}");
    await expect.poll(() => onPathChange.mock.lastCall?.[0] as string[] | undefined).toEqual([]);
  });
  it("a controlled path wins, and a leaf click reports the node", async () => {
    const onNodeClick = vi.fn();
    renderUi(
      box(
        <Treemap
          data={regions}
          drillDown
          path={["Americas"]}
          aria-label="Revenue by region"
          onNodeClick={onNodeClick}
        />,
      ),
    );
    const g = await chartGroup("Revenue by region");
    expect(g.textContent).toContain("US");
    await hoverAt(g, 0.25, 0.5);
    await userEvent.click(g, { position: { x: 80, y: 80 } });
    expect(cleanMarkup(g)).toBe(true);
  });
  it("treemapLegend lists the top-level groups", () => {
    expect(treemapLegend(regions).map((i) => i.label)).toEqual(["Europe", "Americas"]);
    expect(treemapLegend([])).toEqual([]);
  });
});

/* ---------------------------------------------------------------- WaterfallChart */
const bridge = [
  { label: "Opening", value: 120, kind: "start" as const },
  { label: "New", value: 45, kind: "delta" as const },
  { label: "Churn", value: -30, kind: "delta" as const },
  { label: "Closing", kind: "total" as const },
];
chartSuite({
  name: "WaterfallChart",
  label: "MRR bridge",
  make: (x) => <WaterfallChart data={bridge} aria-label="MRR bridge" {...x} />,
  reads: [
    { keys: "{Home}", says: /Opening: Total 120/ },
    { keys: "{ArrowRight}", says: /New: Increase \+45, Running total 165/ },
    { keys: "{ArrowRight}", says: /Churn: Decrease −30, Running total 135/ },
    { keys: "{End}", says: /Closing: Total 135/ },
  ],
  table: {
    el: <WaterfallTable data={bridge} caption="Bridge table" />,
    caption: "Bridge table",
    cells: ["Opening", "120", "New", "45", "Churn", "Closing", "135"],
  },
  hover: { x: 0.4, y: 0.5, shows: /Running total|Total/ },
  variations: [
    { name: "vertical layout", extra: { layout: "vertical" } },
    { name: "horizontal layout", extra: { layout: "horizontal" }, reads: [{ keys: "{Home}", says: /Opening/ }] },
    { name: "custom colours", extra: { increaseColor: 3, decreaseColor: 6 } },
    { name: "no value labels, no connectors", extra: { showValues: false, showConnectors: false } },
    {
      name: "a subtotal in the middle",
      extra: {
        data: [
          { label: "Start", value: 50, kind: "start" },
          { label: "Up", value: 20, kind: "delta" },
          { label: "Sub", kind: "subtotal" },
          { label: "Down", value: -10, kind: "delta" },
          { label: "End", kind: "total" },
        ],
      },
      reads: [{ keys: "{End}", says: /End: Total 60/ }],
    },
    {
      name: "the running total dips below zero",
      extra: {
        data: [
          { label: "Start", value: 10, kind: "start" },
          { label: "Big loss", value: -40, kind: "delta" },
          { label: "Gain", value: 15, kind: "delta" },
          { label: "End", kind: "total" },
        ],
      },
    },
    {
      name: "a total that disagrees with the running sum",
      extra: {
        data: [
          { label: "Start", value: 10, kind: "start" },
          { label: "Gain", value: 15, kind: "delta" },
          { label: "Stated total", value: 99, kind: "total" },
        ],
      },
    },
    {
      name: "only deltas",
      extra: {
        data: [
          { label: "A", value: 3 },
          { label: "B", value: -1 },
        ],
      },
    },
    {
      name: "zero delta and missing values",
      extra: { data: [{ label: "A", value: 3 }, { label: "Z", value: 0 }, { label: "M" }] },
    },
    { name: "a single step", extra: { data: [{ label: "Only", value: 5, kind: "start" }] } },
    {
      name: "custom formatter and locale",
      extra: { format: (n: number) => `$${n}k`, locale: "de" },
      reads: [{ keys: "{Home}", says: /\$120k/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("waterfallLegend names increase, decrease and total", () => {
  const items = waterfallLegend();
  expect(items.map((i) => i.label)).toEqual(["Increase", "Decrease", "Total"]);
  expect(items.every((i) => i.kind === "rect")).toBe(true);
  expect(waterfallLegend({ increase: "Plus" }).map((i) => i.label)[0]).toBe("Plus");
});

/* ---------------------------------------------------------------- BulletChart */
const kpis = [
  { label: "Revenue", description: "US$, thousands", value: 270, target: 250, ranges: [150, 225, 300] },
  { label: "Profit", description: "%", value: 22, target: 26, ranges: [15, 22, 30] },
];
chartSuite({
  name: "BulletChart",
  label: "Q3 results",
  make: (x) => <BulletChart data={kpis} aria-label="Q3 results" {...x} />,
  reads: [
    { keys: "{Home}", says: /Revenue: Actual 270, Target 250, Good 225–300, vs target \+8%/ },
    { keys: "{ArrowDown}", says: /Profit: Actual 22, Target 26, Fair 15–22, vs target −15%/ },
    { keys: "{ArrowUp}", says: /Revenue/ },
    { keys: "{End}", says: /Profit/ },
  ],
  table: {
    el: <BulletTable data={kpis} caption="Results table" />,
    caption: "Results table",
    cells: ["Revenue", "270", "250", "Profit", "22", "26"],
  },
  hover: { x: 0.5, y: 0.2, shows: /Actual/ },
  variations: [
    { name: "shared scale", extra: { scale: "shared" } },
    { name: "no ticks, no delta", extra: { ticks: false, showDelta: false } },
    {
      name: "lower is better",
      extra: { data: [{ label: "Latency", value: 120, target: 150, ranges: [100, 200, 300], higherIsBetter: false }] },
      reads: [{ keys: "{Home}", says: /Latency/ }],
    },
    { name: "no target, no ranges", extra: { data: [{ label: "Raw", value: 5 }] } },
    {
      name: "value beyond the scale",
      extra: { data: [{ label: "Over", value: 500, target: 100, ranges: [50, 100, 200] }] },
    },
    {
      name: "negative value and min/max",
      extra: { data: [{ label: "Net", value: -20, target: -10, min: -50, max: 50, ranges: [-30, 0, 50] }] },
    },
    {
      name: "custom range labels and colour",
      extra: { data: [{ label: "X", value: 5, ranges: [3, 6, 10], rangeLabels: ["Poor", "OK", "Great"], color: 4 }] },
      reads: [{ keys: "{Home}", says: /OK|Great|Poor/ }],
    },
    { name: "custom format", extra: { format: (n: number) => `${n}u` }, reads: [{ keys: "{Home}", says: /270u/ }] },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("bulletLegend lists the qualitative ranges, the value and the target", () => {
  const items = bulletLegend();
  expect(items.length).toBeGreaterThanOrEqual(4);
  expect(items.map((i) => i.label)).toContain("Target");
  expect(bulletLegend({}, 3, 2).length).toBeLessThan(items.length);
});

/* ---------------------------------------------------------------- GaugeChart */
const gaugeBands = [
  { to: 50, label: "Low" },
  { to: 80, label: "Healthy" },
  { to: 100, label: "High" },
];
chartSuite({
  name: "GaugeChart",
  label: "CPU load, percent",
  nameRe: /CPU load, percent: .*\.\s\S/,
  emptyProps: null,
  make: (x) => (
    <GaugeChart value={72} target={80} bands={gaugeBands} label="CPU load" aria-label="CPU load, percent" {...x} />
  ),
  reads: [
    { keys: "{Home}", says: /72/ },
    { keys: "{ArrowRight}", says: /./ },
    { keys: "{End}", says: /./ },
  ],
  table: {
    el: <GaugeTable value={72} target={80} bands={gaugeBands} measure="CPU load" caption="CPU table" />,
    caption: "CPU table",
    cells: ["72", "80", "Healthy"],
  },
  variations: [
    { name: "speedometer shape", extra: { shape: "speedometer" } },
    { name: "ticks and a colour", extra: { ticks: true, color: 4 } },
    {
      name: "tones instead of palette slots",
      extra: {
        bands: [
          { to: 50, label: "OK", tone: "success" },
          { to: 80, label: "Warn", tone: "warning" },
          { to: 100, label: "Bad", tone: "danger" },
        ],
      },
    },
    {
      name: "palette slots per band",
      extra: {
        bands: [
          { to: 50, label: "A", color: 2 },
          { to: 100, label: "B", color: 5 },
        ],
      },
    },
    { name: "lower is better", extra: { higherIsBetter: false } },
    { name: "no bands, no target", extra: { bands: undefined, target: undefined } },
    { name: "value at the minimum", extra: { value: 0 } },
    { name: "value at the maximum", extra: { value: 100 } },
    { name: "value above the scale", extra: { value: 140 } },
    { name: "value below the scale", extra: { value: -20 } },
    {
      name: "custom scale",
      extra: {
        min: 200,
        max: 800,
        value: 450,
        target: 600,
        bands: [
          { to: 400, label: "Low" },
          { to: 800, label: "High" },
        ],
      },
    },
    {
      name: "number format options",
      extra: {
        numberFormat: { style: "percent", maximumFractionDigits: 0 },
        min: 0,
        max: 1,
        value: 0.72,
        target: 0.8,
        bands: undefined,
      },
    },
    { name: "custom formatter and locale", extra: { format: (n: number) => `${n} pct`, locale: "de" } },
    { name: "a taller gauge", extra: { height: 260 } },
    { name: "phone width", extra: {}, width: 320 },
    { name: "NaN value shows no data", extra: { value: Number.NaN }, empty: true },
  ],
});

/* ---------------------------------------------------------------- LollipopChart */
const cities = [
  { label: "Berlin", value: 82 },
  { label: "Paris", value: 74 },
  { label: "Madrid", value: 61 },
];
chartSuite({
  name: "LollipopChart",
  label: "Satisfaction by city",
  make: (x) => (
    <LollipopChart
      data={cities}
      sort="descending"
      reference={{ value: 70, label: "Average" }}
      aria-label="Satisfaction by city"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /Berlin: Value 82, vs Average \+12, #1 of 3/ },
    { keys: "{ArrowRight}", says: /Paris: Value 74, vs Average \+4, #2 of 3/ },
    { keys: "{End}", says: /Madrid: Value 61, vs Average −9, #3 of 3/ },
  ],
  table: {
    el: <LollipopTable data={cities} reference={{ value: 70, label: "Average" }} caption="City table" />,
    caption: "City table",
    cells: ["Berlin", "82", "Madrid", "61"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Value/ },
  variations: [
    { name: "vertical layout", extra: { layout: "vertical" } },
    { name: "horizontal layout", extra: { layout: "horizontal" } },
    {
      name: "ascending sort puts the smallest first",
      extra: { sort: "ascending" },
      reads: [{ keys: "{Home}", says: /Madrid/ }],
    },
    {
      name: "no sort keeps the data order",
      extra: { sort: "none", data: [cities[2], cities[0], cities[1]] },
      reads: [{ keys: "{Home}", says: /Madrid/ }],
    },
    { name: "a baseline other than zero", extra: { baseline: 50 } },
    { name: "highlight one or several items", extra: { highlight: "Paris" } },
    { name: "highlight a list", extra: { highlight: ["Paris", "Berlin"] } },
    { name: "values shown on the marks", extra: { showValues: true } },
    { name: "no reference line", extra: { reference: undefined } },
    {
      name: "per-item colour and a chart colour",
      extra: {
        color: 4,
        data: [
          { label: "A", value: 3, color: 6 },
          { label: "B", value: 5 },
        ],
      },
    },
    {
      name: "negative values",
      extra: {
        data: [
          { label: "A", value: -3 },
          { label: "B", value: 5 },
          { label: "C", value: 0 },
        ],
      },
    },
    { name: "a single item", extra: { data: [cities[0]] } },
    {
      name: "many items",
      extra: { data: Array.from({ length: 30 }, (_, i) => ({ label: `City ${i + 1}`, value: 100 - i * 2 })) },
    },
    {
      name: "custom value axis label and format",
      extra: { valueLabel: "Score", format: (n: number) => `${n} pts`, locale: "de" },
      reads: [{ keys: "{Home}", says: /82 pts/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

/* ---------------------------------------------------------------- DumbbellChart */
const scores = [
  { label: "Checkout", from: 3.2, to: 4.1 },
  { label: "Search", from: 2.8, to: 3.5 },
  { label: "Onboarding", from: 3.9, to: 3.6 },
];
chartSuite({
  name: "DumbbellChart",
  label: "Score, Q1 to Q2",
  make: (x) => <DumbbellChart data={scores} fromLabel="Q1" toLabel="Q2" aria-label="Score, Q1 to Q2" {...x} />,
  reads: [
    { keys: "{Home}", says: /Checkout: Q2 4.1, Q1 3.2, Change \+0.9, % change \+28.1%/ },
    { keys: "{ArrowDown}", says: /Search: Q2 3.5, Q1 2.8, Change \+0.7/ },
    { keys: "{End}", says: /Onboarding: Q2 3.6, Q1 3.9, Change −0.3, % change −7.7%/ },
    { keys: "{ArrowUp}", says: /Search/ },
  ],
  table: {
    el: <DumbbellTable data={scores} fromLabel="Q1" toLabel="Q2" caption="Score table" />,
    caption: "Score table",
    cells: ["Checkout", "3.2", "4.1", "Onboarding"],
  },
  hover: { x: 0.5, y: 0.3, shows: /Q1/ },
  variations: [
    { name: "slope variant", extra: { variant: "slope" }, reads: [{ keys: "{Home}", says: /Checkout/ }] },
    { name: "sorted by the end value", extra: { sort: "to" }, reads: [{ keys: "{Home}", says: /Checkout/ }] },
    { name: "sorted by the start value", extra: { sort: "from" }, reads: [{ keys: "{Home}", says: /Onboarding/ }] },
    { name: "sorted by change", extra: { sort: "change" }, reads: [{ keys: "{Home}", says: /Checkout/ }] },
    { name: "lower is better flips the good/bad colouring", extra: { higherIsBetter: false } },
    { name: "percent change", extra: { change: "percent" } },
    { name: "absolute change", extra: { change: "absolute" } },
    { name: "no change column", extra: { change: "none" } },
    { name: "highlighting", extra: { highlight: "Search" } },
    { name: "include zero", extra: { includeZero: true } },
    {
      name: "from = 0 gives no percentage",
      extra: {
        data: [
          { label: "New", from: 0, to: 5 },
          { label: "Gone", from: 5, to: 0 },
        ],
      },
    },
    { name: "equal values", extra: { data: [{ label: "Same", from: 2, to: 2 }] } },
    {
      name: "negative values",
      extra: {
        data: [
          { label: "A", from: -3, to: 2 },
          { label: "B", from: -1, to: -4 },
        ],
      },
    },
    { name: "a single item", extra: { data: [scores[0]] } },
    {
      name: "many items",
      extra: {
        data: Array.from({ length: 24 }, (_, i) => ({
          label: `Team ${i + 1}`,
          from: 2 + (i % 5),
          to: 3 + ((i * 3) % 7),
        })),
      },
    },
    {
      name: "custom labels, formatters, axis label",
      extra: {
        valueLabel: "Score",
        format: (n: number) => `${n} pts`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
      reads: [{ keys: "{Home}", says: /4.1 pts/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("dumbbellLegend names the two measurements", () => {
  expect(dumbbellLegend("Q1", "Q2").map((i) => i.label)).toEqual(["Q1", "Q2"]);
  expect(dumbbellLegend().length).toBe(2);
});

/* ---------------------------------------------------------------- DivergingBarChart */
const survey = [
  { question: "Easy to use", no: 5, neutral: 15, yes: 80 },
  { question: "Fast", no: 12, neutral: 18, yes: 70 },
];
const levels = [
  { key: "no", label: "Disagree" },
  { key: "neutral", label: "Neutral" },
  { key: "yes", label: "Agree" },
];
chartSuite({
  name: "DivergingBarChart",
  label: "Survey answers",
  make: (x) => (
    <DivergingBarChart
      data={survey}
      index="question"
      levels={levels}
      neutral="neutral"
      aria-label="Survey answers"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /Easy to use: Agree 80% \(80\), All positive 80%, Net \+75%/ },
    { keys: "{ArrowDown}", says: /Fast:/ },
    { keys: "{End}", says: /Fast: Agree 70% \(70\)/ },
    { keys: "{ArrowLeft}", says: /Fast:/ },
    { keys: "{ArrowUp}", says: /Easy to use/ },
  ],
  table: {
    el: (
      <DivergingBarTable
        data={survey}
        index="question"
        levels={levels}
        neutral="neutral"
        indexLabel="Question"
        caption="Survey table"
      />
    ),
    caption: "Survey table",
    cells: ["Easy to use", "80", "Fast", "70"],
  },
  hover: { x: 0.5, y: 0.7, shows: /Net/ },
  variations: [
    {
      name: "butterfly variant",
      extra: {
        variant: "butterfly",
        levels: [
          { key: "no", label: "Against" },
          { key: "yes", label: "For" },
        ],
        neutral: null,
      },
      reads: [{ keys: "{Home}", says: /Easy to use/ }],
    },
    { name: "no neutral level", extra: { neutral: null, levels: [levels[0], levels[2]] } },
    { name: "raw counts instead of normalised shares", extra: { normalize: false } },
    { name: "net score hidden", extra: { showNet: false } },
    { name: "segment values shown", extra: { showValues: true } },
    { name: "custom pole colours", extra: { negativeColor: 3, positiveColor: 4 } },
    {
      name: "five-level Likert scale",
      extra: {
        data: [{ question: "Q", sd: 5, d: 10, n: 20, a: 30, sa: 35 }],
        index: "question",
        neutral: "n",
        levels: [
          { key: "sd", label: "Strongly disagree" },
          { key: "d", label: "Disagree" },
          { key: "n", label: "Neutral" },
          { key: "a", label: "Agree" },
          { key: "sa", label: "Strongly agree" },
        ],
      },
      reads: [{ keys: "{Home}", says: /Q:/ }],
    },
    { name: "rows with all zeros", extra: { data: [{ question: "Empty", no: 0, neutral: 0, yes: 0 }, ...survey] } },
    { name: "a single row", extra: { data: [survey[0]] } },
    {
      name: "many rows",
      extra: {
        data: Array.from({ length: 16 }, (_, i) => ({
          question: `Question ${i + 1}`,
          no: i + 1,
          neutral: 10,
          yes: 50 - i,
        })),
      },
    },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} votes`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("divergingLegend labels each level", () => {
  const items = divergingLegend(levels, { neutral: "neutral" });
  expect(items.map((i) => i.label)).toEqual(expect.arrayContaining(["Disagree", "Agree"]));
});

it("a hover then Escape-free leave clears every chart tooltip", async () => {
  renderUi(box(<LollipopChart data={cities} aria-label="Satisfaction by city" />));
  const g = await chartGroup("Satisfaction by city");
  await hoverAt(g, 0.4, 0.5);
  await parkPointer();
  await expect.poll(tipText).toBe("");
});
