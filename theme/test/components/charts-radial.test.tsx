// Part-to-whole and radial charts: PieChart, RadarChart, PolarAreaChart, RadialBarChart, WaffleChart, ScatterChart,
// plus the group-less ones: Sparkbar, BarList, RadialProgress.
import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { PieChart, PieTable } from "../../src/components/charts/pie-chart";
import { RadarChart } from "../../src/components/charts/radar-chart";
import { PolarAreaChart, PolarAreaTable, polarAreaLegend } from "../../src/components/charts/polar-area-chart";
import { RadialBarChart, RadialBarTable } from "../../src/components/charts/radial-bar-chart";
import { WaffleChart, WaffleTable, waffleLegend } from "../../src/components/charts/waffle-chart";
import { ScatterChart, ScatterTable } from "../../src/components/charts/scatter-chart";
import { Sparkbar } from "../../src/components/charts/sparkbar";
import { BarList, BarListTable } from "../../src/components/charts/bar-list";
import { RadialProgress } from "../../src/components/charts/radial-progress";
import { ChartCard } from "../../src/components/charts/chart-parts";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
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
  findFigure,
} from "../helpers-charts";

/* ---------------------------------------------------------------- PieChart */
const channels = [
  { label: "Direct", value: 4200 },
  { label: "Search", value: 3100 },
  { label: "Referral", value: 1200 },
];
chartSuite({
  name: "PieChart",
  label: "Visits by channel",
  make: (x) => <PieChart data={channels} aria-label="Visits by channel" {...x} />,
  reads: [
    { keys: "{Home}", says: /Direct: 49.4%, 4,200/ },
    { keys: "{ArrowRight}", says: /Search: 36.5%, 3,100/ },
    { keys: "{End}", says: /Referral: 14.1%, 1,200/ },
    { keys: "{ArrowLeft}", says: /Search/ },
  ],
  table: {
    el: <PieTable data={channels} indexLabel="Channel" caption="Channel table" />,
    caption: "Channel table",
    cells: ["Direct", "4,200", "49.4%", "Referral", "1,200"],
  },
  hover: { x: 0.55, y: 0.14, shows: /Direct.*49.4%/ },
  variations: [
    { name: "outer labels", extra: { outerLabels: true } },
    {
      name: "outer labels off with a legend",
      extra: { outerLabels: false, legend: true },
      check: () => expect(document.body.textContent).toMatch(/Direct/),
    },
    { name: "no legend", extra: { legend: false } },
    {
      name: "maxSlices folds the smallest into Other",
      extra: { maxSlices: 2 },
      reads: [{ keys: "{End}", says: /Other/ }],
    },
    {
      name: "many slices fold automatically",
      extra: { data: Array.from({ length: 14 }, (_, i) => ({ label: `Slice ${i + 1}`, value: 100 - i * 5 })) },
      reads: [{ keys: "{End}", says: /Other/ }],
    },
    { name: "a single slice is a full ring", extra: { data: [channels[0]] } },
    {
      name: "tiny slices next to a giant one",
      extra: {
        data: [
          { label: "Big", value: 100000 },
          { label: "Tiny A", value: 3 },
          { label: "Tiny B", value: 2 },
        ],
      },
    },
    {
      name: "zero and negative slices are dropped",
      extra: { data: [...channels, { label: "Zero", value: 0 }, { label: "Neg", value: -5 }] },
    },
    {
      name: "per-slice colours",
      extra: {
        data: [
          { label: "A", value: 3, color: 5 },
          { label: "B", value: 2, color: 6 },
        ],
      },
    },
    {
      name: "all zeros show the empty state",
      extra: {
        data: [
          { label: "A", value: 0 },
          { label: "B", value: 0 },
        ],
      },
      empty: true,
    },
    {
      name: "custom formatters",
      extra: { format: (n: number) => `${n} visits`, formatPercent: (n: number) => `${Math.round(n)} pct` },
      reads: [{ keys: "{Home}", says: /4200 visits/ }],
    },
    { name: "taller", extra: { height: 340 } },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("PieChart: the legend (when on) names every slice with its share", async () => {
  renderUi(box(<PieChart data={channels} legend aria-label="Visits by channel" />));
  await chartGroup("Visits by channel");
  const lists = screen.queryAllByRole("list");
  const text = lists.map((l) => l.textContent).join(" ");
  expect(text).toMatch(/Direct/);
  expect(text).toMatch(/Search/);
});

/* ---------------------------------------------------------------- RadarChart */
const skills = [
  { skill: "Speed", a: 80, b: 60 },
  { skill: "Power", a: 65, b: 85 },
  { skill: "Range", a: 70, b: 75 },
  { skill: "Armor", a: 50, b: 90 },
  { skill: "Stealth", a: 90, b: 40 },
];
const units = [
  { key: "a", label: "Unit A" },
  { key: "b", label: "Unit B" },
];
chartSuite({
  name: "RadarChart",
  label: "Units compared",
  make: (x) => <RadarChart data={skills} index="skill" series={units} aria-label="Units compared" {...x} />,
  reads: [
    { keys: "{Home}", says: /Speed: Unit A 80, Unit B 60/ },
    { keys: "{ArrowRight}", says: /Power: Unit B 85, Unit A 65/ },
    { keys: "{End}", says: /Stealth: Unit A 90, Unit B 40/ },
    { keys: "{ArrowLeft}", says: /Armor/ },
  ],
  hover: { x: 0.5, y: 0.35, shows: /Unit A/ },
  variations: [
    { name: "circular grid", extra: { grid: "circle" } },
    { name: "polygon grid", extra: { grid: "polygon" } },
    { name: "fixed max", extra: { max: 100 } },
    { name: "one series", extra: { series: [units[0]] } },
    { name: "three axes (a triangle)", extra: { data: skills.slice(0, 3) } },
    { name: "two axes degrade gracefully", extra: { data: skills.slice(0, 2) } },
    { name: "one axis", extra: { data: skills.slice(0, 1) } },
    {
      name: "zeros and negatives",
      extra: {
        data: [
          { skill: "A", a: 0, b: -4 },
          { skill: "B", a: 10, b: 0 },
          { skill: "C", a: 0, b: 0 },
        ],
      },
    },
    {
      name: "many axes",
      extra: {
        data: Array.from({ length: 14 }, (_, i) => ({
          skill: `Axis ${i + 1}`,
          a: 20 + ((i * 17) % 60),
          b: 30 + ((i * 11) % 50),
        })),
      },
    },
    { name: "values beyond max are clamped", extra: { max: 50 } },
    { name: "custom format", extra: { format: (n: number) => `${n}%` }, reads: [{ keys: "{Home}", says: /80%/ }] },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

/* ---------------------------------------------------------------- PolarAreaChart */
const rain = [
  { month: "Jan", rain: 80 },
  { month: "Feb", rain: 55 },
  { month: "Mar", rain: 62 },
  { month: "Apr", rain: 40 },
];
const rainSeries = [{ key: "rain", label: "Rainfall (mm)" }];
chartSuite({
  name: "PolarAreaChart",
  label: "Rainfall by month",
  make: (x) => <PolarAreaChart data={rain} index="month" series={rainSeries} aria-label="Rainfall by month" {...x} />,
  reads: [
    { keys: "{Home}", says: /Jan: Rainfall \(mm\) 80/ },
    { keys: "{ArrowRight}", says: /Feb: Rainfall \(mm\) 55/ },
    { keys: "{End}", says: /Apr: Rainfall \(mm\) 40/ },
  ],
  table: {
    el: <PolarAreaTable data={rain} index="month" series={rainSeries} indexLabel="Month" caption="Rain table" />,
    caption: "Rain table",
    cells: ["Jan", "80", "Apr", "40"],
  },
  hover: { x: 0.5, y: 0.35, shows: /Rainfall/ },
  variations: [
    { name: "radius scale", extra: { scale: "radius" } },
    { name: "area scale", extra: { scale: "area" } },
    {
      name: "two series stack in each wedge",
      extra: { data: rain.map((r) => ({ ...r, snow: 5 })), series: [...rainSeries, { key: "snow", label: "Snow" }] },
      reads: [{ keys: "{Home}", says: /Snow/ }],
    },
    {
      name: "ten series fold into Other",
      extra: {
        data: [
          { m: "A", ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, i + 1])) },
          { m: "B", ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, 3])) },
        ],
        index: "m",
        series: Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `K${i}` })),
      },
      reads: [{ keys: "{Home}", says: /Other/ }],
    },
    {
      name: "zero and negative",
      extra: {
        data: [
          { month: "Jan", rain: 0 },
          { month: "Feb", rain: -5 },
          { month: "Mar", rain: 10 },
        ],
      },
    },
    { name: "a single wedge", extra: { data: [rain[0]] } },
    {
      name: "twelve months",
      extra: { data: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, rain: 10 + ((i * 13) % 50) })) },
    },
    {
      name: "locale and format",
      extra: { locale: "de", format: (n: number) => `${n} mm` },
      reads: [{ keys: "{Home}", says: /80 mm/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("polarAreaLegend: one swatch per series", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `K${i}` }));
  expect(polarAreaLegend(rainSeries).map((i) => i.label)).toEqual(["Rainfall (mm)"]);
  expect(polarAreaLegend(many, "More")).toHaveLength(8);
  expect(polarAreaLegend(many, "More").pop()!.label).toBe("More");
});

/* ---------------------------------------------------------------- RadialBarChart */
const goals = [
  { label: "Move", value: 420, max: 600 },
  { label: "Exercise", value: 25, max: 30 },
  { label: "Stand", value: 9, max: 12 },
];
chartSuite({
  name: "RadialBarChart",
  label: "Daily goals",
  emptyProps: null,
  make: (x) => <RadialBarChart data={goals} aria-label="Daily goals" {...x} />,
  reads: [
    { keys: "{Home}", says: /Move: 420 of 600, 70%/ },
    { keys: "{ArrowRight}", says: /Exercise: 25 of 30, 83%/ },
    { keys: "{End}", says: /Stand: 9 of 12, 75%/ },
  ],
  table: {
    el: <RadialBarTable data={goals} caption="Goals table" />,
    caption: "Goals table",
    cells: ["Move", "420", "600", "Stand", "9", "12"],
  },
  variations: [
    { name: "ring variant", extra: { variant: "ring" } },
    { name: "arc variant", extra: { variant: "arc" } },
    { name: "values in the centre instead of percent", extra: { display: "value" } },
    {
      name: "centre text in the ring variant",
      extra: { variant: "ring", centerValue: "1,234", centerLabel: "kcal" },
      check: () => expect(document.body.textContent).toMatch(/1,234/),
    },
    {
      name: "a shared max",
      extra: {
        max: 100,
        data: [
          { label: "A", value: 30 },
          { label: "B", value: 80 },
        ],
      },
    },
    { name: "values above max are clamped", extra: { data: [{ label: "Over", value: 900, max: 600 }] } },
    {
      name: "zero and negative",
      extra: {
        data: [
          { label: "Zero", value: 0, max: 10 },
          { label: "Neg", value: -3, max: 10 },
        ],
      },
    },
    { name: "a single ring", extra: { data: [goals[0]] } },
    { name: "custom size and colour", extra: { size: 160, data: [{ label: "A", value: 5, max: 10, color: 6 }] } },
    {
      name: "custom formatters",
      extra: { format: (n: number) => `${n}u`, formatPercent: (n: number) => `${Math.round(n * 100)} pct` },
    },
    {
      name: "many rings",
      extra: { data: Array.from({ length: 8 }, (_, i) => ({ label: `Ring ${i + 1}`, value: i + 1, max: 10 })) },
    },
  ],
});

it("RadialBarChart: no rings shows labels.empty", () => {
  renderUi(box(<RadialBarChart data={[]} aria-label="Daily goals" labels={{ empty: "Keine Ziele" }} />));
  expect(screen.getByText("Keine Ziele")).toBeInTheDocument();
});

/* ---------------------------------------------------------------- WaffleChart */
const devices = [
  { label: "Mobile", value: 62 },
  { label: "Desktop", value: 31 },
  { label: "Tablet", value: 7 },
];
chartSuite({
  name: "WaffleChart",
  label: "Sessions by device",
  make: (x) => <WaffleChart data={devices} aria-label="Sessions by device" {...x} />,
  reads: [
    { keys: "{Home}", says: /Mobile: 62, 62% \(62 cells\)/ },
    { keys: "{ArrowRight}", says: /Desktop: 31, 31% \(31 cells\)/ },
    { keys: "{End}", says: /Tablet: 7, 7% \(7 cells\)/ },
  ],
  table: {
    el: <WaffleTable data={devices} caption="Device table" />,
    caption: "Device table",
    cells: ["Mobile", "62", "Tablet", "7"],
  },
  hover: { x: 0.2, y: 0.3, shows: /Mobile|Desktop|Tablet/ },
  variations: [
    { name: "a total larger than the sum leaves empty cells", extra: { total: 200 } },
    { name: "custom grid", extra: { rows: 5, columns: 20 } },
    { name: "a tiny grid", extra: { rows: 2, columns: 3 } },
    { name: "pictogram", extra: { variant: "pictogram", icon: <span aria-hidden>●</span> } },
    { name: "fill by columns", extra: { fill: "columns" } },
    { name: "fill by rows", extra: { fill: "rows" } },
    { name: "a max cell size", extra: { maxCell: 14 } },
    { name: "no legend", extra: { showLegend: false } },
    {
      name: "tiny share still gets a cell",
      extra: {
        data: [
          { label: "Big", value: 999 },
          { label: "Tiny", value: 1 },
        ],
      },
    },
    {
      name: "more than eight items fold into Other",
      extra: { data: Array.from({ length: 11 }, (_, i) => ({ label: `Item ${i + 1}`, value: i + 1 })) },
      reads: [{ keys: "{End}", says: /Other/ }],
    },
    {
      name: "zero and negative",
      extra: {
        data: [
          { label: "A", value: 0 },
          { label: "B", value: -3 },
          { label: "C", value: 5 },
        ],
      },
    },
    {
      name: "locale and formatters",
      extra: { locale: "de", format: (n: number) => `${n} Stk.` },
      reads: [{ keys: "{Home}", says: /62 Stk\./ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("waffleLegend names each part with its share", () => {
  const items = waffleLegend(devices, {});
  expect(items.map((i) => i.label)).toEqual(["Mobile", "Desktop", "Tablet"]);
  expect(items[0]!.value).toMatch(/62/);
  expect(waffleLegend(devices, { total: 200 })[0]!.value).toMatch(/31/);
});

/* ---------------------------------------------------------------- ScatterChart */
const accounts = [
  {
    label: "Accounts",
    data: [
      { x: 12, y: 340, label: "Acme" },
      { x: 30, y: 910, label: "Globex" },
      { x: 55, y: 1480, label: "Initech" },
    ],
  },
];
chartSuite({
  name: "ScatterChart",
  label: "Sessions vs revenue",
  emptyProps: { series: [] },
  make: (x) => (
    <ScatterChart
      series={accounts}
      xLabel="Sessions"
      yLabel="Revenue"
      trendline
      aria-label="Sessions vs revenue"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /Acme: Revenue 340, Sessions 12/ },
    { keys: "{ArrowRight}", says: /Globex: Revenue 910, Sessions 30/ },
    { keys: "{End}", says: /Initech: Revenue 1,480, Sessions 55/ },
    { keys: "{ArrowLeft}", says: /Revenue 910/ },
  ],
  table: {
    el: <ScatterTable series={accounts} xLabel="Sessions" yLabel="Revenue" caption="Accounts table" />,
    caption: "Accounts table",
    cells: ["12", "340", "55", "1,480"],
  },
  variations: [
    { name: "without a trendline", extra: { trendline: false } },
    {
      name: "bubble sizes",
      extra: {
        bubble: true,
        sizeLabel: "Seats",
        series: [
          {
            label: "Accounts",
            data: [
              { x: 1, y: 2, size: 10 },
              { x: 2, y: 4, size: 50 },
              { x: 3, y: 3, size: 200 },
            ],
          },
        ],
      },
    },
    { name: "include zero", extra: { includeZero: true } },
    {
      name: "two and four series (the fourth folds into Other)",
      extra: {
        series: Array.from({ length: 5 }, (_, i) => ({
          label: `S${i}`,
          data: [
            { x: i, y: i * 2 },
            { x: i + 1, y: i },
          ],
        })),
      },
    },
    { name: "a single point", extra: { series: [{ label: "One", data: [{ x: 5, y: 5 }] }] } },
    {
      name: "identical x values (no trendline possible)",
      extra: {
        series: [
          {
            label: "Same x",
            data: [
              { x: 5, y: 1 },
              { x: 5, y: 9 },
            ],
          },
        ],
      },
    },
    {
      name: "negative coordinates",
      extra: {
        series: [
          {
            label: "Neg",
            data: [
              { x: -5, y: -3 },
              { x: 4, y: 8 },
              { x: 0, y: 0 },
            ],
          },
        ],
      },
    },
    {
      name: "a few hundred points",
      extra: {
        series: [
          { label: "Many", data: Array.from({ length: 300 }, (_, i) => ({ x: (i * 37) % 101, y: (i * 53) % 97 })) },
        ],
      },
    },
    {
      name: "custom formatters",
      extra: { formatX: (n: number) => `${n} s`, formatY: (n: number) => `$${n}` },
      reads: [{ keys: "{Home}", says: /\$340/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("ScatterChart hover", () => {
  it("hovering a mark reads its values", async () => {
    renderUi(
      box(<ScatterChart series={accounts} xLabel="Sessions" yLabel="Revenue" aria-label="Sessions vs revenue" />),
    );
    const g = await findFigure(/Sessions vs revenue/);
    const marks = [...g.querySelectorAll("circle, path[data-point], [data-mark]")];
    expect(marks.length).toBeGreaterThan(0);
    const mark = marks[1]!;
    const r = mark.getBoundingClientRect();
    const gr = g.getBoundingClientRect();
    await userEvent.hover(g, {
      position: { x: Math.round(r.left + r.width / 2 - gr.left), y: Math.round(r.top + r.height / 2 - gr.top) },
    });
    await expect.poll(tipText).toMatch(/Revenue|Sessions/);
  });
});

/* ---------------------------------------------------------------- Sparkbar */
describe("Sparkbar", () => {
  it("is an image named by its label plus a summary, and draws one bar per value", async () => {
    renderUi(<Sparkbar values={[3, 5, 2, 8, 6, 9]} aria-label="Weekly orders" />);
    const img = await screen.findByRole("img", { name: /^Weekly orders: / });
    expect(img.getAttribute("aria-label")).toMatch(/9/);
    expect(cleanMarkup(img.parentElement ?? document.body)).toBe(true);
  });
  it("without a label it is decorative", () => {
    renderUi(<Sparkbar values={[1, 2, 3]} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector("svg[aria-hidden=true]")).not.toBeNull();
  });
  it("win/loss variant, highlights and negative colour", () => {
    const { rerender } = renderUi(<Sparkbar values={[1, -1, 1, 1, -1]} variant="winloss" aria-label="Results" />);
    expect(screen.getByRole("img", { name: /^Results: / })).toBeInTheDocument();
    rerender(<Sparkbar values={[1, -1, 1]} variant="winloss" negativeColor={6} color={3} aria-label="Results" />);
    rerender(<Sparkbar values={[3, 5, 2]} highlight="none" aria-label="Results" />);
    rerender(<Sparkbar values={[3, 5, 2]} highlight={1} aria-label="Results" />);
    rerender(<Sparkbar values={[3, 5, 2]} highlight="last" height={48} format={(n) => `${n}u`} aria-label="Results" />);
    expect(screen.getByRole("img", { name: /2u/ })).toBeInTheDocument();
    expect(cleanMarkup()).toBe(true);
  });
  it("gaps (null / undefined), negatives, zeros and a single value do not break", () => {
    const { rerender } = renderUi(<Sparkbar values={[3, null, undefined, -2, 0, 5]} aria-label="Gappy" />);
    expect(cleanMarkup()).toBe(true);
    rerender(<Sparkbar values={[0, 0, 0]} aria-label="Gappy" />);
    rerender(<Sparkbar values={[7]} aria-label="Gappy" />);
    expect(cleanMarkup()).toBe(true);
  });
  it("no values shows the empty text", () => {
    renderUi(<Sparkbar values={[]} aria-label="Weekly orders" labels={{ empty: "Keine Daten" }} />);
    expect(screen.getByRole("img", { name: /Weekly orders: Keine Daten/ })).toBeInTheDocument();
    expect(screen.getByText("Keine Daten")).toBeInTheDocument();
  });
  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="grid gap-3">
          <Sparkbar values={[3, 5, 2, 8]} aria-label="Orders" />
          <Sparkbar values={[1, -1, 1]} variant="winloss" aria-label="Results" />
          <Sparkbar values={[]} aria-label="Nothing" />
        </div>,
        variant,
      );
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------------------------------------------------------------- BarList */
const sources = [
  { name: "Google", value: 4821 },
  { name: "Direct", value: 3102 },
  { name: "GitHub", value: 960, href: "https://github.com" },
];
describe("BarList", () => {
  it("is a labelled list with name, value and share per row, widest first", () => {
    renderUi(
      box(<BarList data={sources} showShare nameHeader="Source" valueHeader="Visits" aria-label="Visits by source" />),
    );
    const list = screen.getByRole("list", { name: "Visits by source" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]!.textContent).toMatch(/Google.*4,821.*54\.3%/);
    expect(rows[2]!.textContent).toMatch(/GitHub.*960/);
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Visits")).toBeInTheDocument();
  });
  it("a row with an href is a link", () => {
    renderUi(box(<BarList data={sources} aria-label="Visits by source" />));
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com");
  });
  it("sortOrder ascending / none, and limit", async () => {
    const { rerender } = renderUi(box(<BarList data={sources} sortOrder="ascending" aria-label="Visits" />));
    const names = () =>
      within(screen.getByRole("list", { name: "Visits" }))
        .getAllByRole("listitem")
        .map((li) => li.textContent);
    expect(names()[0]).toMatch(/GitHub/);
    rerender(box(<BarList data={[sources[2]!, sources[0]!, sources[1]!]} sortOrder="none" aria-label="Visits" />));
    expect(names()[0]).toMatch(/GitHub/);
    rerender(box(<BarList data={sources} limit={2} aria-label="Visits" />));
    await expect.poll(names).toHaveLength(2);
  });
  it("formats values and shares, in a locale", () => {
    renderUi(box(<BarList data={sources} showShare locale="de" format={(n) => `${n} Besuche`} aria-label="Besuche" />));
    expect(screen.getByRole("list", { name: "Besuche" }).textContent).toMatch(/4821 Besuche/);
  });
  it("handles zeros, negatives, duplicates and a single row", () => {
    renderUi(
      box(
        <BarList
          data={[
            { name: "A", value: 0 },
            { name: "A", value: -4 },
            { name: "B", value: 5 },
          ]}
          showShare
          aria-label="Odd data"
        />,
      ),
    );
    const rows = within(screen.getByRole("list", { name: "Odd data" })).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(cleanMarkup()).toBe(true);
  });
  it("empty data shows the empty text", () => {
    renderUi(box(<BarList data={[]} aria-label="Visits" emptyState="No visits yet" />));
    expect(screen.getByText("No visits yet")).toBeInTheDocument();
  });
  it("table view lists every row", () => {
    renderUi(<BarListTable data={sources} caption="Visits table" />);
    const table = screen.getByRole("table", { name: "Visits table" });
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(table.textContent).toContain("4,821");
  });
  it("onValueChange turns rows into buttons", async () => {
    const onValueChange = vi.fn();
    renderUi(box(<BarList data={sources} aria-label="Visits" onValueChange={onValueChange} />));
    expect(cleanMarkup()).toBe(true);
    const button = screen.getByRole("button", { name: /GitHub/ });
    await userEvent.click(button);
    expect(onValueChange).toHaveBeenCalledWith(sources[2]);
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });
  it("limit hides extra rows behind a Show more button that reveals and collapses them", async () => {
    renderUi(box(<BarList data={sources} limit={1} aria-label="Visits" />));
    const rows = () => within(screen.getByRole("list", { name: "Visits" })).getAllByRole("listitem").length;
    await expect.poll(rows).toBe(1);
    await userEvent.click(screen.getByRole("button", { name: "Show 2 more" }));
    await expect.poll(rows).toBe(3);
    await userEvent.click(screen.getByRole("button", { name: "Show less" }));
    await expect.poll(rows).toBe(1);
  });
  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        box(
          <BarList data={sources} showShare nameHeader="Source" valueHeader="Visits" aria-label="Visits by source" />,
        ),
        variant,
      );
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------------------------------------------------------------- RadialProgress */
describe("RadialProgress", () => {
  it("is a meter with value, range and a name", async () => {
    renderUi(<RadialProgress value={72} label="Storage used" />);
    const meter = screen.getByRole("meter", { name: /Storage used/ });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    await expect.poll(() => meter.getAttribute("aria-valuenow")).toBe("72");
    expect(meter.getAttribute("aria-valuetext")).toMatch(/72%/);
  });
  it("severity tone names the state in the value text (not by colour alone)", async () => {
    const { rerender } = renderUi(<RadialProgress value={96} label="Disk" coloring="severity" />);
    const meter = screen.getByRole("meter", { name: /Disk/ });
    await expect.poll(() => meter.getAttribute("aria-valuetext")).toMatch(/96%, \S/);
    rerender(<RadialProgress value={85} label="Disk" coloring="severity" warnAt={80} dangerAt={95} />);
    await expect.poll(() => screen.getByRole("meter").getAttribute("aria-valuetext")).toMatch(/85%, \S/);
    rerender(<RadialProgress value={10} label="Disk" coloring="severity" />);
    await expect.poll(() => screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("10");
  });
  it("clamps out-of-range and non-finite values", async () => {
    const { rerender } = renderUi(<RadialProgress value={250} label="Over" />);
    await expect.poll(() => screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("100");
    rerender(<RadialProgress value={-40} label="Under" />);
    await expect.poll(() => screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("0");
    expect(cleanMarkup()).toBe(true);
  });
  it("shows an empty state, not 0%, when there is no value yet", () => {
    const { rerender } = renderUi(<RadialProgress value={Number.NaN} label="Nan" />);
    expect(screen.queryByRole("meter")).toBeNull();
    expect(screen.getByRole("img", { name: "Nan: No data" })).toBeInTheDocument();
    rerender(<RadialProgress value={null} aria-label="Disk" labels={{ noData: "Keine Daten" }} />);
    expect(screen.getByRole("img", { name: "Disk: Keine Daten" })).toBeInTheDocument();
    rerender(<RadialProgress value={undefined} label="Gone" />);
    expect(screen.getByRole("img", { name: "Gone: No data" })).toBeInTheDocument();
    expect(cleanMarkup()).toBe(true);
  });
  it("gauge variant, size, gradient and glow options render", () => {
    const { rerender } = renderUi(<RadialProgress value={40} label="A" variant="gauge" />);
    expect(screen.getByRole("meter")).toBeInTheDocument();
    rerender(<RadialProgress value={40} label="A" variant="ring" diameter={160} gradient glow />);
    rerender(
      <RadialProgress value={40} label="A" gradient={false} glow={false} labels={{ complete: "Fertig" } as never} />,
    );
    expect(cleanMarkup()).toBe(true);
  });
  it("reduced motion shows the final value immediately", () => {
    reduceMotion();
    renderUi(<RadialProgress value={64} label="Fast" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "64");
  });
  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="flex gap-4">
          <RadialProgress value={72} label="Storage used" coloring="severity" />
          <RadialProgress value={30} label="Quota" variant="gauge" />
        </div>,
        variant,
      );
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------------------------------------------------------------- cross-cutting */
describe("charts keyboard + pointer hand-over", () => {
  it("Pie: hovering a slice, then using the keyboard, then leaving", async () => {
    renderUi(box(<PieChart data={channels} aria-label="Visits by channel" />));
    const g = await chartGroup("Visits by channel");
    await expect
      .poll(
        async () => {
          await hoverAt(g, 0.55, 0.14);
          return tipText();
        },
        { timeout: 8000, interval: 250 },
      )
      .toMatch(/Direct|Search|Referral/);
    await focusChart("Visits by channel");
    await press("{Home}");
    await expect.poll(polite).toMatch(/Direct/);
    await press("{Escape}");
    await expect.poll(polite).not.toMatch(/Direct: 49/);
  });
  it("inside a ChartCard with a static legend", () => {
    renderUi(
      box(
        <ChartCard
          title="Channels"
          legend={[{ label: "Direct", color: "var(--sheen-chart-1)", kind: "rect" }]}
          table={<PieTable data={channels} caption="Channels table" />}
        >
          <PieChart data={channels} aria-label="Visits by channel" />
        </ChartCard>,
      ),
    );
    expect(screen.getByRole("tab", { name: "Table" })).toBeInTheDocument();
    expect(screen.getByRole("list").textContent).toContain("Direct");
  });
});
