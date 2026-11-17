// BumpChart, ErrorBarChart and PopulationPyramid (and their table views).
import { BumpChart, BumpTable, bumpLegend } from "../../src/components/charts/bump-chart";
import { ErrorBarChart, ErrorBarTable, errorBarLegend } from "../../src/components/charts/error-bar-chart";
import {
  PopulationPyramid,
  PopulationPyramidTable,
  populationPyramidLegend,
} from "../../src/components/charts/population-pyramid";
import { describe, expect, it } from "vitest";
import { useEffect, useRef, useState } from "react";
import { screen, within } from "@testing-library/react";
import { renderUi } from "../render";
import { useInViewSettled } from "../../src/components/charts/chart-utils";
import {
  BarTable,
  DonutTable,
  LineTable,
  RadarTable,
  StepLineTable,
} from "../../src/components/charts/chart-table-twins";
import { chartSuite } from "../helpers-charts";

/* ---------------------------------------------------------------- BumpChart */
const standings = [
  { year: "2022", ada: 82, bo: 77, cy: 64 },
  { year: "2023", ada: 74, bo: 90, cy: 70 },
  { year: "2024", ada: 69, bo: 88, cy: 91 },
];
const people = [
  { key: "ada", label: "Ada" },
  { key: "bo", label: "Bo" },
  { key: "cy", label: "Cy" },
];
chartSuite({
  name: "BumpChart",
  label: "Ranking by year",
  make: (x) => <BumpChart data={standings} index="year" series={people} aria-label="Ranking by year" {...x} />,
  reads: [
    { keys: "{Home}", says: /Ada · 2022: Rank 1 of 3, Value 82/ },
    { keys: "{ArrowRight}", says: /Ada · 2023: Rank 2 of 3, Value 74, Up 1|Down 1/ },
    { keys: "{End}", says: /Ada · 2024: Rank 3 of 3, Value 69, Down 1/ },
    { keys: "{ArrowUp}", says: /Bo · 2024: Rank 2 of 3/ },
    { keys: "{ArrowLeft}", says: /Bo · 2023: Rank 1 of 3, Value 90, Up 1/ },
  ],
  table: {
    el: <BumpTable data={standings} index="year" series={people} caption="Ranking table" />,
    caption: "Ranking table",
    headers: ["Period", "Ada", "Bo", "Cy"],
    cells: ["2022", "#1 (82)", "#2 (77)", "#3 (64)", "#1 (91)"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Rank 2 of 3/ },
  variations: [
    {
      name: "ready-made ranks",
      extra: {
        rankBy: "rank",
        data: [
          { y: "A", ada: 1, bo: 2 },
          { y: "B", ada: 2, bo: 1 },
        ],
        index: "y",
        series: people.slice(0, 2),
      },
      reads: [{ keys: "{Home}", says: /Ada · A: Rank 1 of 2/ }],
    },
    {
      name: "lower is better",
      extra: { higherIsBetter: false },
      reads: [{ keys: "{Home}", says: /Cy · 2022: Rank 1 of 3/ }],
    },
    { name: "a single period", extra: { data: [standings[0]] }, reads: [{ keys: "{Home}", says: /Ada · 2022/ }] },
    { name: "non-numeric values", extra: { data: [{ year: "x", ada: "n/a", bo: NaN, cy: null }] } },
    { name: "dash patterns and no labels", extra: { patterns: true, showLabels: false } },
    { name: "narrow", extra: {}, width: 240 },
  ],
});

describe("bumpLegend", () => {
  it("lists every series with its key", () => {
    expect(bumpLegend(people).map((l) => l.key)).toEqual(["ada", "bo", "cy"]);
  });
});

/* ---------------------------------------------------------------- ErrorBarChart */
const arms = [
  { label: "Control", value: 12.4, low: 11.1, high: 13.7 },
  { label: "Variant A", value: 14.2, low: 12.9, high: 15.5 },
  { label: "Variant B", value: 13.1, low: 11.4, high: 14.8 },
];
chartSuite({
  name: "ErrorBarChart",
  label: "Conversion by variant",
  make: (x) => <ErrorBarChart data={arms} aria-label="Conversion by variant" {...x} />,
  reads: [
    { keys: "{Home}", says: /Control: Estimate 12.4, Interval 11.1 to 13.7/ },
    { keys: "{ArrowDown}", says: /Variant A: Estimate 14.2/ },
    { keys: "{End}", says: /Variant B: Estimate 13.1, Interval 11.4 to 14.8/ },
    { keys: "{ArrowUp}", says: /Variant A/ },
  ],
  table: {
    el: <ErrorBarTable data={arms} intervalLabel="95% CI" caption="Interval table" />,
    caption: "Interval table",
    headers: ["Item", "Estimate", "Lower (95% CI)", "Upper (95% CI)"],
    cells: ["Control", "12.4", "11.1", "13.7"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Variant A/ },
  variations: [
    { name: "points with a reference line", extra: { variant: "point", reference: { value: 12, label: "Baseline" } } },
    {
      name: "band",
      extra: { variant: "band" },
      reads: [
        { keys: "{Home}", says: /Control/ },
        { keys: "{ArrowRight}", says: /Variant A/ },
      ],
    },
    { name: "intervals given the wrong way round", extra: { data: [{ label: "x", value: 5, low: 9, high: 1 }] } },
    { name: "negative values", extra: { data: [{ label: "x", value: -5, low: -9, high: -1 }] } },
    { name: "a single band point", extra: { variant: "band", data: [arms[0]] } },
    { name: "narrow", extra: {}, width: 240 },
  ],
});

describe("errorBarLegend", () => {
  it("names the estimate and the interval", () => {
    expect(errorBarLegend("Rate", "95% CI").map((l) => l.label)).toEqual(["Rate", "95% CI"]);
  });
});

/* ---------------------------------------------------------------- PopulationPyramid */
const ages = [
  { label: "0–19", start: 9.1, end: 8.7 },
  { label: "20–39", start: 10.4, end: 10.2 },
  { label: "40–59", start: 9.8, end: 10.1 },
  { label: "60+", start: 6.2, end: 7.9 },
];
chartSuite({
  name: "PopulationPyramid",
  label: "Population by age",
  make: (x) => <PopulationPyramid data={ages} aria-label="Population by age" {...x} />,
  reads: [
    { keys: "{Home}", says: /60\+: Male 6.2, Female 7.9, Total 14.1/ },
    { keys: "{ArrowDown}", says: /40–59: Male 9.8, Female 10.1/ },
    { keys: "{End}", says: /0–19: Male 9.1, Female 8.7/ },
    { keys: "{ArrowUp}", says: /20–39/ },
  ],
  table: {
    el: <PopulationPyramidTable data={ages} share caption="Population table" />,
    caption: "Population table",
    headers: ["Age group", "Male", "Female", "Total", "Share of total"],
    cells: ["0–19", "9.1", "8.7", "17.8"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Total/ },
  variations: [
    { name: "shares", extra: { share: true }, reads: [{ keys: "{Home}", says: /60\+: Male [\d.]+%/ }] },
    { name: "first group at the top", extra: { firstAt: "top" }, reads: [{ keys: "{Home}", says: /0–19/ }] },
    { name: "hatched end side", extra: { patterns: true } },
    { name: "an empty side", extra: { data: [{ label: "a", start: 0, end: 0 }] } },
    { name: "negative and non-numeric sizes", extra: { data: [{ label: "a", start: -4, end: Number.NaN }] } },
    { name: "narrow", extra: {}, width: 240 },
  ],
});

describe("populationPyramidLegend", () => {
  it("keys the two sides for the legend toggle", () => {
    expect(populationPyramidLegend("Men", "Women").map((l) => l.key)).toEqual(["start", "end"]);
  });
});

/* ---------------------------------------------------------------- table twins of the row-based charts */
const rowsData = [
  { k: "A", v: 1204 },
  { k: "B", v: 380 },
];
const rowsSeries = [{ key: "v", label: "Users" }];

describe("table twins", () => {
  it.each([
    ["BarTable", BarTable],
    ["LineTable", LineTable],
    ["StepLineTable", StepLineTable],
    ["RadarTable", RadarTable],
  ])("%s is a real table with a row per category", (_name, Twin) => {
    renderUi(<Twin data={rowsData} index="k" series={rowsSeries} caption="Users table" />);
    const table = screen.getByRole("table", { name: "Users table" });
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((h) => h.textContent),
    ).toEqual(["A", "B"]);
    expect(table.textContent).toContain("1,204");
  });

  it("DonutTable lists each slice with its value and share", () => {
    renderUi(
      <DonutTable
        data={[
          { label: "Organic", value: 75 },
          { label: "Direct", value: 25 },
        ]}
        caption="Sessions table"
      />,
    );
    const table = screen.getByRole("table", { name: "Sessions table" });
    expect(table.textContent).toContain("Organic");
    expect(table.textContent).toContain("75%");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Slice", "Value", "Share"]);
  });

  it("DonutTable shows the empty message and survives a zero total", () => {
    renderUi(<DonutTable data={[]} caption="Empty table" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    renderUi(<DonutTable data={[{ label: "x", value: 0 }]} caption="Zero table" />);
    expect(screen.getByRole("table", { name: "Zero table" }).textContent).toContain("–");
  });
});

/* ---------------------------------------------------------------- useInViewSettled with a late-mounting element */
function LateChart({ ready }: { ready: boolean }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Like a chart that waits for its width: the observed element appears one render after the first effect ran.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the test needs the element to mount after the first effect, like a chart that waits for its width
  useEffect(() => setMounted(true), []);
  const seen = useInViewSettled(ref, { amount: 0.3, ready: ready && mounted });
  return (
    <div>
      {mounted && (
        <div ref={ref} style={{ height: 40 }}>
          {seen ? "seen" : "waiting"}
        </div>
      )}
    </div>
  );
}

describe("useInViewSettled", () => {
  it("observes an element that mounts after the first render once `ready` flips", async () => {
    renderUi(<LateChart ready />);
    expect(await screen.findByText("seen")).toBeInTheDocument();
  });
});
