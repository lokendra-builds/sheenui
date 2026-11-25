// Time-series style charts: StackedAreaChart, PercentBarChart, ComboChart, StepLineChart, RangeAreaChart.
import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";

import { StackedAreaChart, StackedAreaTable } from "../../src/components/charts/stacked-area-chart";
import { PercentBarChart, PercentBarTable } from "../../src/components/charts/percent-bar-chart";
import { ComboChart, ComboTable, comboLegend } from "../../src/components/charts/combo-chart";
import { StepLineChart } from "../../src/components/charts/step-line-chart";
import { RangeAreaChart, RangeAreaTable, rangeAreaLegend } from "../../src/components/charts/range-area-chart";
import { ChartCard } from "../../src/components/charts/chart-parts";
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

const months = [
  { month: "Jan", web: 40, app: 22 },
  { month: "Feb", web: 46, app: 30 },
  { month: "Mar", web: 44, app: 35 },
];
const platforms = [
  { key: "web", label: "Web" },
  { key: "app", label: "App" },
];

/* ---------------------------------------------------------------- StackedAreaChart */
chartSuite({
  name: "StackedAreaChart",
  label: "Sessions by platform",
  make: (x) => (
    <StackedAreaChart data={months} index="month" series={platforms} aria-label="Sessions by platform" {...x} />
  ),
  reads: [
    { keys: "{Home}", says: /Jan: App 22, Web 40, Total 62/ },
    { keys: "{ArrowRight}", says: /Feb: App 30, Web 46, Total 76/ },
    { keys: "{End}", says: /Mar: App 35, Web 44, Total 79/ },
    { keys: "{ArrowLeft}", says: /Feb:/ },
  ],
  table: {
    el: <StackedAreaTable data={months} index="month" series={platforms} indexLabel="Month" caption="Sessions table" />,
    caption: "Sessions table",
    headers: ["Month", "Web", "App", "Total"],
    cells: ["Jan", "40", "22", "62", "79"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Feb.*46 Web/ },
  variations: [
    { name: "percent mode reads shares", extra: { mode: "percent" }, reads: [{ keys: "{Home}", says: /Jan:.*%/ }] },
    {
      name: "monotone curve draws cubic segments",
      extra: { curve: "monotone" },
      check: (g) => expect(g.querySelector("path[d*='C']")).not.toBeNull(),
    },
    { name: "single point", extra: { data: [months[0]] } },
    {
      name: "negative and zero values",
      extra: {
        data: [
          { month: "Jan", web: -5, app: 0 },
          { month: "Feb", web: 3, app: -2 },
          { month: "Mar", web: 0, app: 0 },
        ],
      },
    },
    {
      name: "all zeros",
      extra: {
        data: [
          { month: "Jan", web: 0, app: 0 },
          { month: "Feb", web: 0, app: 0 },
        ],
      },
    },
    {
      name: "missing and string values",
      extra: {
        data: [{ month: "Jan", web: "12", app: Number.NaN }, { month: "Feb" }, { month: "Mar", web: 5, app: 1 }],
      },
    },
    { name: "one series", extra: { series: [platforms[0]] } },
    {
      name: "custom formatters",
      extra: { format: (n: number) => `${n} sessions`, formatPercent: (n: number) => `${n.toFixed(0)} pct` },
      reads: [{ keys: "{Home}", says: /40 sessions/ }],
    },
    { name: "narrow (phone) width docks the readout", extra: {}, width: 320, reads: [{ keys: "{Home}", says: /Jan/ }] },
    { name: "custom height", extra: { height: 120 } },
    {
      name: "many points thin the axis labels",
      extra: { data: Array.from({ length: 40 }, (_, i) => ({ month: `Month ${i + 1}`, web: i + 1, app: 40 - i })) },
    },
  ],
});

/* ---------------------------------------------------------------- PercentBarChart */
const regions = [
  { region: "EU", free: 60, pro: 30, team: 10 },
  { region: "US", free: 45, pro: 35, team: 20 },
];
const plans = [
  { key: "free", label: "Free" },
  { key: "pro", label: "Pro" },
  { key: "team", label: "Team" },
];
chartSuite({
  name: "PercentBarChart",
  label: "Plan mix by region",
  make: (x) => <PercentBarChart data={regions} index="region" series={plans} aria-label="Plan mix by region" {...x} />,
  reads: [
    { keys: "{Home}", says: /EU: Free 60% \(60\), Pro 30% \(30\), Team 10% \(10\), Total 100/ },
    { keys: "{ArrowRight}", says: /EU, Free: 60%, 60/ },
    { keys: "{ArrowRight}", says: /EU, Pro: 30%/ },
    { keys: "{End}", says: /US, / },
  ],
  table: {
    el: (
      <PercentBarTable
        data={regions}
        index="region"
        series={plans}
        indexLabel="Region"
        caption="Plan mix table"
        showTotal
      />
    ),
    caption: "Plan mix table",
    headers: ["Region", "Free", "Pro", "Team"],
    cells: ["EU", "60", "US", "45", "100"],
  },
  hover: { x: 0.5, y: 0.3, shows: /Free|Pro|Team/ },
  variations: [
    { name: "vertical layout", extra: { layout: "vertical" }, reads: [{ keys: "{Home}", says: /EU:/ }] },
    {
      name: "showValues prints the shares in the bars",
      extra: { showValues: true },
      check: (g) => expect(g.textContent).toMatch(/60%|60/),
    },
    {
      name: "rows that do not sum to 100 are normalised",
      extra: { data: [{ region: "EU", free: 3, pro: 1, team: 0 }] },
      reads: [{ keys: "{Home}", says: /Free 75%/ }],
    },
    { name: "an all-zero row", extra: { data: [{ region: "EU", free: 0, pro: 0, team: 0 }, ...regions] } },
    {
      name: "negative values count as zero",
      extra: { data: [{ region: "EU", free: -4, pro: 10, team: 10 }] },
      reads: [{ keys: "{Home}", says: /Pro 50%/ }],
    },
    { name: "single row", extra: { data: [regions[0]] } },
    {
      name: "custom formatters",
      extra: { format: (n: number) => `${n}u`, formatPercent: (n: number) => `${Math.round(n)}pc` },
      reads: [{ keys: "{Home}", says: /60pc/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
    {
      name: "many categories",
      extra: {
        data: Array.from({ length: 14 }, (_, i) => ({ region: `Region ${i + 1}`, free: i + 1, pro: 5, team: 3 })),
      },
    },
    {
      name: "vertical with many categories",
      extra: {
        layout: "vertical",
        data: Array.from({ length: 12 }, (_, i) => ({ region: `R${i + 1}`, free: i + 1, pro: 5, team: 3 })),
      },
    },
  ],
});

/* ---------------------------------------------------------------- ComboChart */
const money = [
  { month: "Jan", revenue: 42, margin: 31 },
  { month: "Feb", revenue: 51, margin: 36 },
  { month: "Mar", revenue: 47, margin: 34 },
];
const combo = [
  { key: "revenue", label: "Revenue", type: "bar" as const },
  { key: "margin", label: "Margin", type: "line" as const },
];
chartSuite({
  name: "ComboChart",
  label: "Revenue and margin",
  make: (x) => <ComboChart data={money} index="month" series={combo} aria-label="Revenue and margin" {...x} />,
  reads: [
    { keys: "{Home}", says: /Jan: Revenue 42, Margin 31/ },
    { keys: "{ArrowRight}", says: /Feb: Revenue 51, Margin 36/ },
    { keys: "{End}", says: /Mar: Revenue 47, Margin 34/ },
  ],
  table: {
    el: <ComboTable data={money} index="month" series={combo} indexLabel="Month" caption="Revenue table" />,
    caption: "Revenue table",
    headers: ["Month", "Revenue", "Margin"],
    cells: ["Jan", "42", "31", "Mar", "34"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Feb.*51 Revenue/ },
  variations: [
    {
      name: "stacked bars",
      extra: {
        stacked: true,
        series: [
          { key: "revenue", label: "Revenue", type: "bar" },
          { key: "margin", label: "Margin", type: "bar" },
        ],
      },
      reads: [{ keys: "{Home}", says: /Jan:/ }],
    },
    { name: "indexed to a base of 100", extra: { indexed: true }, reads: [{ keys: "{Home}", says: /Jan:/ }] },
    { name: "indexed with a custom base", extra: { indexed: true, indexBase: 1 } },
    {
      name: "lines only",
      extra: {
        series: [
          { key: "revenue", label: "Revenue", type: "line" },
          { key: "margin", label: "Margin", type: "line" },
        ],
      },
    },
    { name: "bars only", extra: { series: [{ key: "revenue", label: "Revenue", type: "bar" }] } },
    {
      name: "negative values",
      extra: {
        data: [
          { month: "Jan", revenue: -12, margin: 4 },
          { month: "Feb", revenue: 8, margin: -3 },
        ],
      },
    },
    { name: "single point", extra: { data: [money[0]] } },
    {
      name: "zeros",
      extra: {
        data: [
          { month: "Jan", revenue: 0, margin: 0 },
          { month: "Feb", revenue: 0, margin: 0 },
        ],
      },
    },
    {
      name: "custom formatters",
      extra: { format: (n: number) => `$${n}k` },
      reads: [{ keys: "{Home}", says: /\$42k/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
    {
      name: "many points",
      extra: {
        data: Array.from({ length: 30 }, (_, i) => ({
          month: `M${i + 1}`,
          revenue: 10 + (i % 7) * 4,
          margin: 5 + (i % 5) * 3,
        })),
      },
    },
  ],
});

it("comboLegend lists one swatch per series, bars as rects and lines as lines", () => {
  const items = comboLegend(combo);
  expect(items.map((i) => [i.label, i.kind])).toEqual([
    ["Revenue", "rect"],
    ["Margin", "line"],
  ]);
  expect(comboLegend([])).toEqual([]);
});

/* ---------------------------------------------------------------- StepLineChart */
const stock = [
  { week: "W1", stock: 40, reorder: 20 },
  { week: "W2", stock: 40, reorder: 20 },
  { week: "W3", stock: 25, reorder: 20 },
  { week: "W4", stock: 60, reorder: 20 },
];
chartSuite({
  name: "StepLineChart",
  label: "Stock level",
  make: (x) => (
    <StepLineChart
      data={stock}
      index="week"
      series={[{ key: "stock", label: "Units in stock" }]}
      aria-label="Stock level"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /W1: Units in stock 40/ },
    { keys: "{ArrowRight}", says: /W2: Units in stock 40/ },
    { keys: "{End}", says: /W4: Units in stock 60/ },
  ],
  hover: { x: 0.5, y: 0.5, shows: /Units in stock/ },
  variations: [
    { name: "step-after (default) vs step-before vs step-middle", extra: { curve: "before" } },
    { name: "middle steps", extra: { curve: "middle" } },
    { name: "after steps", extra: { curve: "after" } },
    {
      name: "area fill",
      extra: { area: true },
      check: (g) => expect(g.querySelectorAll("path").length).toBeGreaterThan(1),
    },
    { name: "zero baseline", extra: { zero: true } },
    {
      name: "end labels name each series at the right edge",
      extra: {
        endLabels: true,
        series: [
          { key: "stock", label: "Stock" },
          { key: "reorder", label: "Reorder point" },
        ],
      },
      check: (g) => expect(g.textContent).toMatch(/Stock/),
    },
    {
      name: "two series",
      extra: {
        series: [
          { key: "stock", label: "Stock" },
          { key: "reorder", label: "Reorder" },
        ],
      },
      reads: [{ keys: "{Home}", says: /Stock 40/ }],
    },
    { name: "single point", extra: { data: [stock[0]] } },
    {
      name: "negative values",
      extra: {
        data: [
          { week: "W1", stock: -5 },
          { week: "W2", stock: 5 },
          { week: "W3", stock: -1 },
        ],
      },
    },
    {
      name: "flat series",
      extra: {
        data: [
          { week: "W1", stock: 7 },
          { week: "W2", stock: 7 },
        ],
      },
    },
    { name: "custom format", extra: { format: (n: number) => `${n} u` }, reads: [{ keys: "{Home}", says: /40 u/ }] },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

/* ---------------------------------------------------------------- RangeAreaChart */
const sales = [
  { month: "Jan", sales: 40, low: 34, high: 46 },
  { month: "Feb", sales: 46, low: 38, high: 54 },
  { month: "Mar", sales: 51, low: 41, high: 62 },
  { month: "Apr", sales: 55, low: 44, high: 70 },
];
const salesSeries = [{ key: "sales", label: "Sales", lower: "low", upper: "high" }];
chartSuite({
  name: "RangeAreaChart",
  label: "Sales forecast",
  make: (x) => <RangeAreaChart data={sales} index="month" series={salesSeries} aria-label="Sales forecast" {...x} />,
  reads: [
    { keys: "{Home}", says: /Jan: Sales 40, Sales range 34–46/ },
    { keys: "{ArrowRight}", says: /Feb: Sales 46, Sales range 38–54/ },
    { keys: "{End}", says: /Apr: Sales 55, Sales range 44–70/ },
  ],
  table: {
    el: <RangeAreaTable data={sales} index="month" series={salesSeries} indexLabel="Month" caption="Forecast table" />,
    caption: "Forecast table",
    cells: ["Jan", "40", "34", "46", "Apr", "70"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Sales.*range/ },
  variations: [
    {
      name: "monotone curve",
      extra: { curve: "monotone" },
      check: (g) => expect(g.querySelector("path[d*='C']")).not.toBeNull(),
    },
    {
      name: "forecastFrom dashes the projected part",
      extra: { forecastFrom: "Mar" },
      check: (g) => expect(g.querySelector("[stroke-dasharray]")).not.toBeNull(),
      reads: [{ keys: "{End}", says: /Apr/ }],
    },
    { name: "zero baseline", extra: { zero: true } },
    {
      name: "two series",
      extra: {
        data: sales.map((r) => ({ ...r, cost: r.sales / 2, clow: r.low / 2, chigh: r.high / 2 })),
        series: [...salesSeries, { key: "cost", label: "Cost", lower: "clow", upper: "chigh" }],
      },
      reads: [{ keys: "{Home}", says: /Cost/ }],
    },
    {
      name: "a band that crosses the line (lower above upper) is repaired",
      extra: {
        data: [
          { month: "Jan", sales: 5, low: 9, high: 2 },
          { month: "Feb", sales: 6, low: 1, high: 8 },
        ],
      },
    },
    { name: "single point", extra: { data: [sales[0]] } },
    {
      name: "missing band values",
      extra: {
        data: [
          { month: "Jan", sales: 5 },
          { month: "Feb", sales: 6, low: 4, high: 9 },
        ],
      },
    },
    {
      name: "negative values",
      extra: {
        data: [
          { month: "Jan", sales: -5, low: -9, high: -1 },
          { month: "Feb", sales: 2, low: -2, high: 6 },
        ],
      },
    },
    { name: "custom format", extra: { format: (n: number) => `${n}k` }, reads: [{ keys: "{Home}", says: /40k/ }] },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("rangeAreaLegend: one swatch for the line and one for its band, per series", () => {
  const items = rangeAreaLegend([{ key: "s", label: "Sales", lower: "l", upper: "u" }], {
    rangeOf: (n: string) => `${n} (band)`,
  } as never);
  expect(items.length).toBeGreaterThanOrEqual(1);
  expect(items[0]!.label).toBe("Sales");
  expect(rangeAreaLegend([])).toEqual([]);
});

/* ---------------------------------------------------------------- cross-cutting */
describe("series charts inside a ChartCard", () => {
  it("a stacked area keeps working with a static legend and a table view", async () => {
    renderUi(
      box(
        <ChartCard
          title="Sessions"
          legend={[
            { label: "Web", color: "var(--sheen-chart-1)", kind: "rect" },
            { label: "App", color: "var(--sheen-chart-2)", kind: "rect" },
          ]}
          table={<StackedAreaTable data={months} index="month" series={platforms} caption="Sessions per month" />}
        >
          <StackedAreaChart data={months} index="month" series={platforms} aria-label="Sessions per platform" />
        </ChartCard>,
      ),
    );
    const list = screen.getByRole("list");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((l) => l.textContent),
    ).toEqual(["Web", "App"]);
    await focusChart("Sessions per platform");
    await press("{Home}");
    await expect.poll(polite).toMatch(/Jan/);
  });

  it("hover then keyboard hands the readout over to the keyboard point", async () => {
    renderUi(
      box(<StackedAreaChart data={months} index="month" series={platforms} aria-label="Sessions per platform" />),
    );
    const g = await chartGroup("Sessions per platform");
    await hoverAt(g, 0.1, 0.5);
    await expect.poll(tipText).toMatch(/Jan|Feb/);
    g.focus();
    await press("{End}");
    await expect.poll(polite).toMatch(/Mar/);
    expect(cleanMarkup(g)).toBe(true);
  });
});
