// Distribution and time-based charts: Histogram, BoxPlot, RidgelineChart, Beeswarm, CalendarHeatmap,
// CandlestickChart, StreamingChart (+ useStreamingData), Streamgraph.
import { describe, expect, it, vi } from "vitest";
import { act, renderHook, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Histogram, HistogramTable, histogramLegend } from "../../src/components/charts/histogram";
import { BoxPlot, BoxPlotTable } from "../../src/components/charts/box-plot";
import { RidgelineChart, RidgelineTable } from "../../src/components/charts/ridgeline-chart";
import { Beeswarm, BeeswarmTable, beeswarmLegend } from "../../src/components/charts/beeswarm";
import { CalendarHeatmap, CalendarHeatmapTable } from "../../src/components/charts/calendar-heatmap";
import { CandlestickChart, CandlestickTable } from "../../src/components/charts/candlestick-chart";
import { StreamingChart, StreamingTable, useStreamingData } from "../../src/components/charts/streaming-chart";
import { Streamgraph, StreamgraphTable, streamgraphLegend } from "../../src/components/charts/streamgraph";
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

/* ---------------------------------------------------------------- Histogram */
const times = [12, 15, 18, 22, 22, 25, 28, 30, 31, 35, 41, 44, 52, 60, 75];
chartSuite({
  name: "Histogram",
  label: "Response times",
  emptyProps: { values: [] },
  make: (x) => <Histogram values={times} xLabel="ms" aria-label="Response times" {...x} />,
  reads: [
    { keys: "{Home}", says: /ms 10–20: Count 3, Share 20%, at or below 20 20%/ },
    { keys: "{ArrowRight}", says: /ms 20–30: Count 4, Share 26.7%/ },
    { keys: "{End}", says: /ms 70–80: Count 1, Share 6.7%, at or below 80 100%/ },
    { keys: "{ArrowLeft}", says: /ms 60–70/ },
  ],
  table: {
    el: <HistogramTable values={times} xLabel="ms" caption="Response table" />,
    caption: "Response table",
    cells: ["10", "20", "3", "20%"],
  },
  hover: { x: 0.45, y: 0.6, shows: /Count/ },
  variations: [
    { name: "fixed bin count", extra: { bins: 5 }, reads: [{ keys: "{Home}", says: /Count/ }] },
    { name: "Sturges rule", extra: { bins: "sturges" } },
    { name: "Freedman-Diaconis rule", extra: { bins: "freedman-diaconis" } },
    { name: "Scott rule", extra: { bins: "scott" } },
    { name: "an explicit domain leaves values out", extra: { domain: [0, 50] } },
    { name: "raw (not nice) bin edges", extra: { niceBins: false, bins: 7 } },
    { name: "percent instead of counts", extra: { measure: "percent" } },
    { name: "density curve over bars", extra: { density: true } },
    { name: "density curve alone", extra: { density: true, bars: false } },
    { name: "density with a custom bandwidth", extra: { density: true, bandwidth: 4 } },
    { name: "mean, median and percentile markers", extra: { markers: ["mean", "median", "p90", "p95", "p99"] } },
    {
      name: "a custom marker",
      extra: { markers: [{ value: 40, label: "SLO" }] },
      check: (g) => expect(g.textContent).toMatch(/SLO/),
    },
    { name: "colour, height and axis titles", extra: { color: 4, height: 300, yLabel: "Requests" } },
    { name: "one value", extra: { values: [5] } },
    { name: "identical values", extra: { values: [3, 3, 3, 3] } },
    { name: "two values", extra: { values: [1, 100] } },
    { name: "negative and fractional values", extra: { values: [-3.5, -1.25, 0, 0.75, 2.5, 2.6, 2.75] } },
    { name: "non-finite values are ignored", extra: { values: [1, 2, Number.NaN, Infinity, 3, 4, 5] } },
    { name: "a thousand values", extra: { values: Array.from({ length: 1000 }, (_, i) => Math.sin(i) * 20 + 50) } },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n}ms`,
        formatCount: (n: number) => `${n}x`,
        formatPercent: (n: number) => `${Math.round(n * 100)}pc`,
        locale: "de",
      },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("histogramLegend names the bars and optional density / markers", () => {
  const items = histogramLegend({ color: 1, bars: true, density: true, markers: ["mean"], labels: {} } as never);
  expect(items.length).toBeGreaterThanOrEqual(1);
});

/* ---------------------------------------------------------------- BoxPlot */
const plans = [
  { label: "Free", values: [2, 3, 3, 4, 5, 6, 9] },
  { label: "Pro", values: [4, 5, 6, 6, 7, 8, 12] },
];
chartSuite({
  name: "BoxPlot",
  label: "Weekly sessions",
  make: (x) => <BoxPlot data={plans} valueLabel="Sessions" aria-label="Weekly sessions" {...x} />,
  reads: [
    { keys: "{Home}", says: /Free: Median 4, Middle 50% 3–5.5, Whiskers 2–9, Mean 4.6, Values 7/ },
    { keys: "{ArrowRight}", says: /Pro: Median 6, Middle 50% 5.5–7.5, Whiskers 4–8, Mean 6.9, Values 7, Outliers 1/ },
    { keys: "{ArrowDown}", says: /Pro.*(Outlier|12)/ },
    { keys: "{End}", says: /Pro/ },
    { keys: "{ArrowLeft}", says: /Free/ },
  ],
  table: {
    el: <BoxPlotTable data={plans} caption="Plan table" />,
    caption: "Plan table",
    cells: ["Free", "Pro", "4", "6"],
  },
  hover: { x: 0.3, y: 0.5, shows: /Median/ },
  variations: [
    { name: "violin variant", extra: { variant: "violin" } },
    { name: "violin with a bandwidth", extra: { variant: "violin", bandwidth: 1 } },
    { name: "horizontal", extra: { orientation: "horizontal" } },
    { name: "vertical", extra: { orientation: "vertical" } },
    { name: "mean marker", extra: { showMean: true } },
    { name: "min-max whiskers", extra: { whisker: "minmax" } },
    { name: "a tighter whisker reach makes more outliers", extra: { whisker: 0.5 } },
    { name: "include zero", extra: { includeZero: true } },
    { name: "colour and height", extra: { color: 5, height: 340 } },
    {
      name: "pre-computed summaries",
      extra: {
        data: [
          { label: "S", summary: { low: 1, q1: 3, median: 5, q3: 7, high: 9, mean: 5, n: 100, outliers: [14, -3] } },
        ],
      },
      reads: [{ keys: "{Home}", says: /S: Median 5/ }],
    },
    { name: "groups without data are skipped", extra: { data: [{ label: "Empty", values: [] }, ...plans] } },
    { name: "a group of one value", extra: { data: [{ label: "One", values: [5] }] } },
    { name: "identical values", extra: { data: [{ label: "Same", values: [4, 4, 4, 4, 4] }] } },
    { name: "negative values", extra: { data: [{ label: "Neg", values: [-9, -4, -3, -2, 0, 5] }] } },
    {
      name: "many groups turn the chart sideways",
      extra: {
        data: Array.from({ length: 14 }, (_, i) => ({
          label: `Group number ${i + 1}`,
          values: [1 + i, 3 + i, 4 + i, 6 + i, 9 + i],
        })),
      },
    },
    {
      name: "custom format and locale",
      extra: { format: (n: number) => `${n} s`, locale: "de" },
      reads: [{ keys: "{Home}", says: /4 s/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

/* ---------------------------------------------------------------- RidgelineChart */
const delivery = [
  { label: "Jan", values: [3, 4, 4, 5, 6, 6, 7, 9] },
  { label: "Feb", values: [4, 5, 5, 6, 7, 8, 8, 10] },
  { label: "Mar", values: [5, 6, 7, 7, 8, 9, 10, 12] },
];
chartSuite({
  name: "RidgelineChart",
  label: "Delivery time",
  make: (x) => <RidgelineChart data={delivery} aria-label="Delivery time" {...x} />,
  reads: [
    { keys: "{Home}", says: /Jan: median 5.5, mean 5.5, middle 50% 4–6.3, range 3–9, values 8/ },
    { keys: "{ArrowRight}", says: /Feb: median 6.5, mean 6.6, middle 50% 5–8, range 4–10, values 8/ },
    { keys: "{End}", says: /Mar: median 7.5, mean 8, middle 50% 6.8–9.3, range 5–12, values 8/ },
    { keys: "{ArrowUp}", says: /Feb/ },
  ],
  table: {
    el: <RidgelineTable data={delivery} caption="Delivery table" />,
    caption: "Delivery table",
    cells: ["Jan", "Feb", "Mar", "5.5", "8"],
  },
  hover: { x: 0.5, y: 0.6, shows: /median/ },
  variations: [
    { name: "sequential fill", extra: { fill: "sequential" } },
    { name: "series fill", extra: { fill: "series" } },
    { name: "colour", extra: { color: 3 } },
    { name: "shared scale vs each", extra: { scale: "each" } },
    { name: "shared scale", extra: { scale: "shared" } },
    { name: "an explicit domain", extra: { domain: [0, 20] } },
    { name: "a bandwidth", extra: { bandwidth: 1.5 } },
    { name: "more overlap, taller rows", extra: { overlap: 0.8, rowHeight: 80 } },
    { name: "no overlap", extra: { overlap: 0 } },
    { name: "median markers", extra: { showMedian: true } },
    { name: "a ridge with one value", extra: { data: [{ label: "One", values: [5] }, ...delivery] } },
    { name: "a ridge without values is skipped", extra: { data: [{ label: "None", values: [] }, ...delivery] } },
    { name: "identical values", extra: { data: [{ label: "Same", values: [4, 4, 4, 4] }] } },
    {
      name: "non-finite values are ignored",
      extra: { data: [{ label: "Odd", values: [1, Number.NaN, 3, Infinity, 4] }] },
    },
    {
      name: "many ridges",
      extra: {
        data: Array.from({ length: 16 }, (_, i) => ({
          label: `Week ${i + 1}`,
          values: Array.from({ length: 20 }, (_, k) => 5 + ((k * (i + 3)) % 9)),
        })),
      },
    },
    {
      name: "custom format and locale",
      extra: { format: (n: number) => `${n}d`, locale: "de" },
      reads: [{ keys: "{Home}", says: /5.5d/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

/* ---------------------------------------------------------------- Beeswarm */
const orders = [
  { value: 12, group: "EU" },
  { value: 14, group: "EU" },
  { value: 15, group: "EU" },
  { value: 30, group: "US" },
  { value: 33, group: "US" },
  { value: 90, group: "US" },
];
chartSuite({
  name: "Beeswarm",
  label: "Order value by region",
  make: (x) => <Beeswarm data={orders} valueLabel="Order value" aria-label="Order value by region" {...x} />,
  reads: [
    { keys: "{Home}", says: /EU: Order value 12/ },
    { keys: "{ArrowRight}", says: /EU: Order value 14/ },
    { keys: "{End}", says: /EU: Order value 15/ },
    { keys: "{ArrowDown}", says: /US:/ },
    { keys: "{ArrowUp}", says: /EU:/ },
  ],
  table: {
    el: <BeeswarmTable data={orders} valueLabel="Order value" caption="Order table" />,
    caption: "Order table",
    cells: ["EU", "US", "12", "90"],
  },
  variations: [
    { name: "median markers", extra: { showMedian: true } },
    { name: "include zero", extra: { includeZero: true } },
    { name: "a larger dot radius", extra: { radius: 7 } },
    { name: "colour", extra: { color: 4 } },
    { name: "highlight one id", extra: { data: orders.map((o, i) => ({ ...o, id: `o${i}` })), highlight: "o2" } },
    {
      name: "highlight several",
      extra: { data: orders.map((o, i) => ({ ...o, id: `o${i}` })), highlight: ["o0", "o3"] },
    },
    { name: "an explicit group order", extra: { groups: ["US", "EU"] }, reads: [{ keys: "{Home}", says: /US:/ }] },
    {
      name: "series colour the dots",
      extra: {
        data: orders.map((o, i) => ({ ...o, series: i % 2 ? "Mobile" : "Desktop" })),
        series: [
          { key: "Desktop", label: "Desktop" },
          { key: "Mobile", label: "Mobile" },
        ],
      },
    },
    {
      name: "labelled points",
      extra: { data: orders.map((o, i) => ({ ...o, label: `Order ${i + 1}` })) },
      reads: [{ keys: "{Home}", says: /Order 1|EU/ }],
    },
    { name: "no groups at all (one swarm)", extra: { data: orders.map((o) => ({ value: o.value })) } },
    { name: "a single point", extra: { data: [orders[0]] } },
    {
      name: "identical values stack into a swarm",
      extra: { data: Array.from({ length: 40 }, () => ({ value: 10, group: "A" })) },
    },
    {
      name: "negative values",
      extra: {
        data: [
          { value: -5, group: "A" },
          { value: 3, group: "A" },
          { value: 0, group: "B" },
        ],
      },
    },
    {
      name: "four hundred points",
      extra: { data: Array.from({ length: 400 }, (_, i) => ({ value: (i * 37) % 101, group: i % 3 ? "A" : "B" })) },
    },
    {
      name: "custom format and locale",
      extra: { format: (n: number) => `${n} EUR`, locale: "de" },
      reads: [{ keys: "{Home}", says: /12 EUR/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("beeswarmLegend names each series (and folds extras into Other)", () => {
  const series = Array.from({ length: 10 }, (_, i) => ({ key: `s${i}`, label: `S${i}` }));
  expect(beeswarmLegend(series.slice(0, 3)).map((i) => i.label)).toEqual(["S0", "S1", "S2"]);
  expect(beeswarmLegend(series, "More").pop()!.label).toBe("More");
  expect(beeswarmLegend([])).toEqual([]);
});

/* ---------------------------------------------------------------- CalendarHeatmap */
const days = Array.from({ length: 60 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
  value: (i * 7) % 11,
}));
chartSuite({
  name: "CalendarHeatmap",
  label: "Commits in 2026",
  emptyProps: null,
  make: (x) => (
    <CalendarHeatmap
      data={days}
      year={2026}
      today="2026-03-15"
      valueLabel="commits"
      aria-label="Commits in 2026"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /Thu, Jan 1, 2026: 0/ },
    { keys: "{ArrowRight}", says: /Thu, Jan 8, 2026: 5/ },
    { keys: "{ArrowDown}", says: /Fri, Jan 9, 2026/ },
    { keys: "{ArrowUp}", says: /Thu, Jan 8, 2026/ },
    { keys: "{ArrowLeft}", says: /Thu, Jan 1, 2026/ },
    { keys: "{PageDown}", says: /Feb/ },
    { keys: "{PageUp}", says: /Jan/ },
    { keys: "{End}", says: /Dec 31, 2026/ },
  ],
  table: {
    el: <CalendarHeatmapTable data={days} year={2026} today="2026-03-15" caption="Commit table" />,
    caption: "Commit table",
    cells: ["Jan", "Feb"],
  },
  hover: { x: 0.15, y: 0.4, shows: /2026/ },
  variations: [
    { name: "weeks start on Monday", extra: { weekStart: 1 } },
    { name: "weeks start on Saturday", extra: { weekStart: 6 } },
    { name: "German locale", extra: { locale: "de" } },
    { name: "Arabic locale", extra: { locale: "ar-EG" } },
    { name: "a start and end instead of a year", extra: { year: undefined, start: "2026-01-10", end: "2026-02-20" } },
    {
      name: "start and end as Dates",
      extra: { year: undefined, start: new Date(2026, 0, 10), end: new Date(2026, 1, 20) },
    },
    { name: "range inferred from the data", extra: { year: undefined } },
    { name: "no today marker", extra: { today: null } },
    { name: "colour, levels and cell size", extra: { color: 3, levels: 7, cellSize: 18 } },
    { name: "explicit thresholds", extra: { thresholds: [1, 3, 6, 9] } },
    { name: "no legend", extra: { legend: false } },
    {
      name: "custom value format",
      extra: { format: (n: number) => `${n} c` },
      reads: [{ keys: "{Home}", says: /0 c/ }],
    },
    {
      name: "duplicate dates add up and invalid dates are skipped",
      extra: {
        data: [
          { date: "2026-01-02", value: 3 },
          { date: "2026-01-02", value: 4 },
          { date: "nonsense", value: 5 },
          { date: new Date(2026, 0, 3), value: -2 },
        ],
      },
    },
    { name: "a single day of data", extra: { data: [{ date: "2026-05-05", value: 9 }], year: undefined } },
    { name: "all zeros", extra: { data: days.map((d) => ({ ...d, value: 0 })) } },
    {
      name: "a leap year",
      extra: { year: 2028, data: [{ date: "2028-02-29", value: 7 }] },
      reads: [{ keys: "{Home}", says: /2028/ }],
    },
    { name: "phone width scrolls horizontally", extra: {}, width: 320 },
  ],
});

describe("CalendarHeatmap interactions", () => {
  it("no data still draws the (empty) calendar for the year without NaN", async () => {
    renderUi(box(<CalendarHeatmap data={[]} year={2026} today="2026-03-15" aria-label="Commits" />));
    await chartGroup("Commits");
    expect(cleanMarkup()).toBe(true);
  });
  it("clicking a day / pressing Enter reports it", async () => {
    const onDayClick = vi.fn();
    renderUi(
      box(<CalendarHeatmap data={days} year={2026} today="2026-03-15" aria-label="Commits" onDayClick={onDayClick} />),
    );
    await focusChart("Commits");
    await press("{Home}");
    await press("{Enter}");
    expect(onDayClick).toHaveBeenLastCalledWith({ date: "2026-01-01", value: 0 });
    await press("{ArrowRight}");
    await press(" ");
    expect(onDayClick).toHaveBeenLastCalledWith({ date: "2026-01-08", value: 5 });
  });
});

/* ---------------------------------------------------------------- CandlestickChart */
const candles = [
  { date: "2026-03-02", open: 100, high: 108, low: 97, close: 105, volume: 1200 },
  { date: "2026-03-03", open: 105, high: 110, low: 101, close: 103, volume: 980 },
  { date: "2026-03-04", open: 103, high: 112, low: 102, close: 111, volume: 1500 },
  { date: "2026-03-05", open: 111, high: 115, low: 108, close: 109, volume: 700 },
  { date: "2026-03-06", open: 109, high: 118, low: 107, close: 117, volume: 1900 },
];
chartSuite({
  name: "CandlestickChart",
  label: "ACME share price",
  make: (x) => <CandlestickChart data={candles} timeZone="UTC" locale="en-US" aria-label="ACME share price" {...x} />,
  reads: [
    {
      keys: "{Home}",
      says: /Mon, Mar 2, 2026: open 100.00, high 108.00, low 97.00, close 105.00, up 5.00%, volume 1,200/,
    },
    { keys: "{ArrowRight}", says: /Tue, Mar 3, 2026: open 105.00, high 110.00, low 101.00, close 103.00, down 1.90%/ },
    { keys: "{End}", says: /Fri, Mar 6, 2026: open 109.00, high 118.00, low 107.00, close 117.00, up 7.34%/ },
    { keys: "{ArrowLeft}", says: /Thu, Mar 5, 2026/ },
  ],
  table: {
    el: <CandlestickTable data={candles} timeZone="UTC" caption="Price table" />,
    caption: "Price table",
    cells: ["100", "108", "97", "105", "1,200"],
  },
  variations: [
    { name: "OHLC bars", extra: { mode: "ohlc" } },
    { name: "without the volume strip", extra: { volume: false } },
    { name: "a taller chart and volume strip", extra: { height: 360, volumeHeight: 100 } },
    { name: "moving average", extra: { average: 3 } },
    { name: "custom colours", extra: { upColor: 3, downColor: 6, averageColor: 4, average: 2 } },
    {
      name: "zoom with plus and minus",
      extra: { zoom: true },
      reads: [
        { keys: "+", says: /^/ },
        { keys: "{Home}", says: /Mar 2/ },
      ],
    },
    {
      name: "a starting range",
      extra: { zoom: true, defaultRange: [1, 3] },
      reads: [{ keys: "{Home}", says: /Mar \d, 2026/ }],
    },
    {
      name: "without volume data",
      extra: { data: candles.map((c) => ({ date: c.date, open: c.open, high: c.high, low: c.low, close: c.close })) },
    },
    {
      name: "a flat candle (open = close = high = low)",
      extra: { data: [{ date: "2026-03-02", open: 5, high: 5, low: 5, close: 5 }, ...candles.slice(0, 2)] },
    },
    { name: "a single candle", extra: { data: [candles[0]] } },
    {
      name: "timestamps and Dates",
      extra: {
        data: [
          { date: Date.UTC(2026, 2, 2), open: 1, high: 2, low: 0.5, close: 1.5 },
          { date: new Date(Date.UTC(2026, 2, 3)), open: 1.5, high: 3, low: 1, close: 2 },
        ],
      },
    },
    {
      name: "rows with junk numbers are dropped",
      extra: { data: [...candles, { date: "2026-03-09", open: Number.NaN, high: 1, low: 1, close: 1 }] },
    },
    {
      name: "two hundred candles",
      extra: {
        data: Array.from({ length: 200 }, (_, i) => ({
          date: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10),
          open: 100 + i * 0.2,
          high: 105 + i * 0.2 + (i % 7),
          low: 95 + i * 0.2 - (i % 5),
          close: 100 + i * 0.2 + ((i % 9) - 4),
          volume: 1000 + i * 3,
        })),
      },
    },
    {
      name: "custom formatters",
      extra: {
        format: (n: number) => `$${n}`,
        formatVolume: (n: number) => `${n} sh`,
        formatDate: (d: Date) => d.toISOString().slice(0, 10),
      },
      reads: [{ keys: "{Home}", says: /2026-03-02/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("CandlestickChart zoom", () => {
  it("plus zooms in, minus zooms out, shift+arrows pan, and the range is reported", async () => {
    const onRangeChange = vi.fn();
    const many = Array.from({ length: 60 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
      open: 100 + i,
      high: 110 + i,
      low: 90 + i,
      close: 105 + i,
      volume: 1000,
    }));
    renderUi(
      box(<CandlestickChart data={many} zoom timeZone="UTC" aria-label="Zoomable" onRangeChange={onRangeChange} />),
    );
    await focusChart("Zoomable");
    await press("{Home}");
    await press("+");
    await expect.poll(() => onRangeChange.mock.calls.length).toBeGreaterThan(0);
    const [a, b] = onRangeChange.mock.lastCall![0] as [number, number];
    expect(b - a).toBeLessThan(59);
    await press("{Shift>}{ArrowRight}{/Shift}");
    await press("-");
    await expect
      .poll(
        () =>
          (onRangeChange.mock.lastCall![0] as [number, number])[1] -
          (onRangeChange.mock.lastCall![0] as [number, number])[0],
      )
      .toBeGreaterThan(b - a);
    expect(cleanMarkup()).toBe(true);
  });
});

/* ---------------------------------------------------------------- StreamingChart */
const samples = Array.from({ length: 12 }, (_, i) => ({ time: 1_700_000_000_000 + i * 1000, value: 40 + i }));
const cpu = [{ key: "value", label: "CPU load" }];
chartSuite({
  name: "StreamingChart",
  label: "CPU load, live",
  emptyText: /Waiting for data/,
  make: (x) => (
    <StreamingChart
      data={samples}
      series={cpu}
      timeZone="UTC"
      locale="en-US"
      defaultPaused
      aria-label="CPU load, live"
      {...x}
    />
  ),
  reads: [
    { keys: "{Home}", says: /10:13:20 PM: CPU load 40/ },
    { keys: "{ArrowRight}", says: /10:13:21 PM: CPU load 41/ },
    { keys: "{End}", says: /10:13:31 PM: CPU load 51/ },
    { keys: "{ArrowLeft}", says: /10:13:30 PM: CPU load 50/ },
  ],
  table: {
    el: <StreamingTable data={samples} series={cpu} timeZone="UTC" locale="en-US" caption="CPU samples" />,
    caption: "CPU samples",
    cells: ["10:13:20 PM", "40", "51"],
  },
  hover: { x: 0.5, y: 0.5, shows: /CPU load/ },
  variations: [
    { name: "area fill", extra: { area: true } },
    { name: "zero baseline", extra: { zero: true } },
    { name: "a window of fewer samples", extra: { window: 6 } },
    {
      name: "two series",
      extra: {
        data: samples.map((s) => ({ ...s, mem: 60 - s.value / 4 })),
        series: [...cpu, { key: "mem", label: "Memory" }],
      },
      reads: [{ keys: "{Home}", says: /Memory/ }],
    },
    { name: "a single sample", extra: { data: [samples[0]] } },
    { name: "negative values", extra: { data: samples.map((s, i) => ({ ...s, value: i - 6 })) } },
    { name: "flat line", extra: { data: samples.map((s) => ({ ...s, value: 5 })) } },
    {
      name: "custom time and value formats",
      extra: { formatTime: (d: Date) => `t${d.getUTCSeconds()}`, format: (n: number) => `${n}%` },
      reads: [{ keys: "{Home}", says: /t20: CPU load 40%/ }],
    },
    { name: "another index key", extra: { index: "at", data: samples.map((s) => ({ at: s.time, value: s.value })) } },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("StreamingChart controls", () => {
  it("a Pause / Resume button toggles the view and reports it", async () => {
    const onPausedChange = vi.fn();
    renderUi(
      box(
        <StreamingChart
          data={samples}
          series={cpu}
          timeZone="UTC"
          aria-label="CPU load, live"
          onPausedChange={onPausedChange}
        />,
      ),
    );
    const pause = await screen.findByRole("button", { name: /Pause/ });
    await userEvent.click(pause);
    expect(onPausedChange).toHaveBeenLastCalledWith(true);
    const resume = await screen.findByRole("button", { name: /Resume/ });
    await userEvent.click(resume);
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
  });
  it("controlled `paused` wins and labels translate the button", async () => {
    renderUi(
      box(
        <StreamingChart
          data={samples}
          series={cpu}
          timeZone="UTC"
          paused
          aria-label="CPU load, live"
          labels={{ resume: "Fortsetzen", paused: "Pausiert" }}
        />,
      ),
    );
    expect(await screen.findByRole("button", { name: /Fortsetzen/ })).toBeInTheDocument();
    expect(document.body.textContent).toMatch(/Pausiert/);
  });
  it("reading a value holds the view still (status says so)", async () => {
    renderUi(box(<StreamingChart data={samples} series={cpu} timeZone="UTC" aria-label="CPU load, live" />));
    await focusChart("CPU load, live");
    await press("{Home}");
    await expect.poll(polite).toMatch(/CPU load 40/);
    await press("{Escape}");
    expect(cleanMarkup()).toBe(true);
  });
  it("no data shows the empty state", () => {
    renderUi(box(<StreamingChart data={[]} series={cpu} aria-label="CPU load, live" emptyState="Waiting for data" />));
    expect(screen.getByText("Waiting for data")).toBeInTheDocument();
  });
});

describe("useStreamingData", () => {
  it("starts with history, newest last, one interval apart, ending just before now", () => {
    const before = Date.now();
    const { result } = renderHook(() =>
      useStreamingData((_t, i) => 10 + i, { rate: 1000, history: 5, enabled: false }),
    );
    expect(result.current).toHaveLength(5);
    expect(result.current.map((r) => r.value)).toEqual([10, 11, 12, 13, 14]);
    const times = result.current.map((r) => r.time as number);
    expect(times[4]! - times[3]!).toBe(1000);
    expect(times[4]!).toBeGreaterThanOrEqual(before - 1000);
    expect(times[4]!).toBeLessThanOrEqual(Date.now() - 1000);
  });
  it("a fixed startAt is for the first (server) render only: once mounted the history ends at the real now", () => {
    const { result } = renderHook(() =>
      useStreamingData(() => 1, { rate: 1000, history: 3, startAt: 1_000_000, enabled: false }),
    );
    expect(result.current).toHaveLength(3);
    expect(result.current[2]!.time as number).toBeGreaterThan(1_000_000);
  });
  it("history is clamped to capacity and to zero", () => {
    expect(
      renderHook(() => useStreamingData(() => 1, { history: 500, capacity: 10, enabled: false })).result.current,
    ).toHaveLength(10);
    expect(renderHook(() => useStreamingData(() => 1, { history: -3, enabled: false })).result.current).toHaveLength(0);
  });
  it("record-valued sources, custom index and value keys", () => {
    const { result } = renderHook(() =>
      useStreamingData((_t, i) => ({ cpu: i, mem: i * 2 }), { history: 3, index: "at", enabled: false }),
    );
    expect(Object.keys(result.current[0]!).sort()).toEqual(["at", "cpu", "mem"]);
    const single = renderHook(() => useStreamingData((_t, i) => i, { history: 2, valueKey: "v", enabled: false }));
    expect(single.result.current[0]).toHaveProperty("v", 0);
  });
  it("appends a sample per interval and keeps at most `capacity` rows", async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useStreamingData((_t, i) => i, { rate: 500, history: 2, capacity: 3 }));
      expect(result.current).toHaveLength(2);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      expect(result.current).toHaveLength(3);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(result.current).toHaveLength(3);
      expect(result.current[2]!.value).toBeGreaterThanOrEqual(3);
    } finally {
      vi.useRealTimers();
    }
  });
  it("idle stops sampling and resuming fills the gap", async () => {
    vi.useFakeTimers({ now: 1_700_000_000_000 });
    try {
      const { result, rerender } = renderHook(
        ({ idle }) => useStreamingData((_t, i) => i, { rate: 1000, history: 1, capacity: 20, idle }),
        { initialProps: { idle: false } },
      );
      rerender({ idle: true });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      const frozen = result.current.length;
      rerender({ idle: false });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(result.current.length).toBeGreaterThan(frozen);
    } finally {
      vi.useRealTimers();
    }
  });
});

/* ---------------------------------------------------------------- Streamgraph */
const genres = [
  { year: "2022", rock: 30, pop: 45, jazz: 10 },
  { year: "2023", rock: 25, pop: 50, jazz: 14 },
  { year: "2024", rock: 22, pop: 52, jazz: 18 },
];
const genreSeries = [
  { key: "rock", label: "Rock" },
  { key: "pop", label: "Pop" },
  { key: "jazz", label: "Jazz" },
];
chartSuite({
  name: "Streamgraph",
  label: "Listening share",
  make: (x) => <Streamgraph data={genres} index="year" series={genreSeries} aria-label="Listening share" {...x} />,
  reads: [
    { keys: "{Home}", says: /2022: Pop 45 \(52.9%\), Rock 30 \(35.3%\), Jazz 10 \(11.8%\)\. Total 85/ },
    { keys: "{ArrowRight}", says: /2023: Pop 50 \(56.2%\), Rock 25 \(28.1%\), Jazz 14 \(15.7%\)\. Total 89/ },
    { keys: "{End}", says: /2024: Pop 52 \(56.5%\), Rock 22 \(23.9%\), Jazz 18 \(19.6%\)\. Total 92/ },
    { keys: "{ArrowDown}", says: /./ },
    { keys: "{ArrowUp}", says: /./ },
  ],
  table: {
    el: <StreamgraphTable data={genres} index="year" series={genreSeries} indexLabel="Year" caption="Genre table" />,
    caption: "Genre table",
    cells: ["2022", "30", "45", "2024", "18"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Total/ },
  variations: [
    { name: "silhouette baseline", extra: { offset: "silhouette" } },
    { name: "wiggle baseline", extra: { offset: "wiggle" } },
    { name: "layers kept in data order", extra: { order: "none" } },
    { name: "inside-out order", extra: { order: "insideOut" } },
    { name: "labels inside the layers", extra: { inlineLabels: true } },
    { name: "a taller chart", extra: { height: 360 } },
    { name: "two time points", extra: { data: genres.slice(0, 2) } },
    { name: "a single time point", extra: { data: [genres[0]] } },
    { name: "one series", extra: { series: [genreSeries[0]] } },
    {
      name: "negative and zero values are clamped",
      extra: {
        data: [
          { year: "2022", rock: -5, pop: 0, jazz: 4 },
          { year: "2023", rock: 3, pop: 0, jazz: 0 },
          { year: "2024", rock: 0, pop: 0, jazz: 0 },
        ],
      },
    },
    {
      name: "ten series fold into Other",
      extra: {
        data: [
          { year: "A", ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, i + 1])) },
          { year: "B", ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, 10 - i])) },
        ],
        series: Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `K${i}` })),
      },
      reads: [{ keys: "{Home}", says: /Other/ }],
    },
    {
      name: "forty years",
      extra: {
        data: Array.from({ length: 40 }, (_, i) => ({
          year: String(1985 + i),
          rock: 30 + ((i * 7) % 20),
          pop: 20 + ((i * 11) % 30),
          jazz: 10 + ((i * 3) % 12),
        })),
      },
    },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} h`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("streamgraphLegend: one swatch per series and Other for the surplus", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `K${i}` }));
  expect(streamgraphLegend(genreSeries).map((i) => i.label)).toEqual(["Rock", "Pop", "Jazz"]);
  expect(streamgraphLegend(many, "More")).toHaveLength(8);
  expect(streamgraphLegend(many, "More").pop()!.label).toBe("More");
});

it("hover on a distribution chart reads the group; leaving clears it", async () => {
  renderUi(box(<BoxPlot data={plans} aria-label="Weekly sessions" />));
  const g = await chartGroup("Weekly sessions");
  await hoverAt(g, 0.3, 0.5);
  await expect.poll(tipText).toMatch(/Median/);
  await userEvent.unhover(g);
  expect(within(document.body).queryAllByRole("table")).toHaveLength(0);
});
