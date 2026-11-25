// Chart chrome: annotations (reference lines, bands, event and range markers), the brush's drag gestures, and the
// ChartCard download menu (PNG / SVG / CSV, announcements, failure).
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  annotationColors,
  annotationValues,
  eventsAt,
  type ChartAnnotation,
} from "../../src/components/charts/chart-annotations";
import { LineChart } from "../../src/components/charts/line-chart";
import { BarChart } from "../../src/components/charts/bar-chart";
import { ChartCard, ChartTable, seriesLegend } from "../../src/components/charts/chart-parts";
import { clampBrushRange, defaultBrushRange } from "../../src/components/charts/chart-brush";
import { settle, holdFor } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
import {
  box,
  centerOf,
  chartGroup,
  cleanMarkup,
  dragPointer,
  firePointer,
  focusChart,
  mockPointerCapture,
  pointIn,
  polite,
  press,
} from "../helpers-charts";

afterEach(() => vi.restoreAllMocks());

const rows = [
  { month: "Jan", visits: 4200, signups: 310 },
  { month: "Feb", visits: 5100, signups: 420 },
  { month: "Mar", visits: 4800, signups: 390 },
  { month: "Apr", visits: 6100, signups: 520 },
  { month: "May", visits: 5600, signups: 480 },
  { month: "Jun", visits: 6900, signups: 610 },
];
const series = [
  { key: "visits", label: "Visits" },
  { key: "signups", label: "Signups" },
];

describe("annotation helpers", () => {
  it("annotationColors: one distinct stroke per tone, neutral by default", () => {
    const tones = ["neutral", "accent", "success", "warning", "danger"] as const;
    const strokes = tones.map((t) => annotationColors(t).stroke);
    expect(new Set(strokes).size).toBe(5);
    expect(annotationColors()).toEqual(annotationColors("neutral"));
    expect(annotationColors("danger").text).toContain("danger-text");
    expect(annotationColors("success").fill).toContain("success");
  });
  it("annotationValues lists the numbers that must stay inside the value axis", () => {
    const list: ChartAnnotation[] = [
      { type: "line", value: 7000 },
      { type: "line", value: Number.NaN },
      { type: "band", from: 100, to: 300 },
      { type: "band", from: Number.NaN, to: 50 },
      { type: "event", at: "Feb", label: "x" },
      { type: "range", from: "Jan", to: "Feb" },
    ];
    expect(annotationValues(list)).toEqual([7000, 100, 300, 50]);
    expect(annotationValues(undefined)).toEqual([]);
  });
  it("eventsAt finds the events pinned to a row, by label or by position", () => {
    const list: ChartAnnotation[] = [
      { type: "event", at: "Feb", label: "Launch" },
      { type: "event", at: 3, label: "Promo" },
      { type: "event", at: "Nowhere", label: "Ghost" },
      { type: "line", value: 1 },
    ];
    expect(eventsAt(list, rows, "month", 1).map((e) => e.label)).toEqual(["Launch"]);
    expect(eventsAt(list, rows, "month", 3).map((e) => e.label)).toEqual(["Promo"]);
    expect(eventsAt(list, rows, "month", 0)).toEqual([]);
    expect(eventsAt(undefined, rows, "month", 0)).toEqual([]);
  });
});

describe("annotations on charts", () => {
  const all: ChartAnnotation[] = [
    { type: "line", value: 5000, label: "Target", tone: "success" },
    { type: "line", value: 3000, label: "Floor", tone: "danger", dashed: true },
    { type: "band", from: 5500, to: 6500, label: "Stretch", tone: "accent" },
    { type: "event", at: "Mar", label: "Launch", tone: "warning" },
    { type: "event", at: "Apr", label: "Promo" },
    { type: "range", from: "Feb", to: "Apr", label: "Campaign", tone: "accent" },
  ];

  it("LineChart draws every annotation kind with its label", async () => {
    renderUi(
      box(<LineChart data={rows} index="month" series={series.slice(0, 1)} annotations={all} aria-label="Visits" />),
    );
    const g = await chartGroup("Visits");
    await settle();
    for (const label of ["Target", "Floor", "Stretch", "Launch", "Promo", "Campaign"])
      expect(g.textContent).toContain(label);
    expect(cleanMarkup(g)).toBe(true);
  });

  it("an event is read out when the keyboard lands on its row", async () => {
    renderUi(
      box(<LineChart data={rows} index="month" series={series.slice(0, 1)} annotations={all} aria-label="Visits" />),
    );
    await focusChart("Visits");
    await press("{Home}");
    await press("{ArrowRight}");
    await press("{ArrowRight}");
    await expect.poll(polite).toMatch(/Mar/);
    await expect.poll(polite).toMatch(/Launch/);
  });

  it("a reference line beyond the data stretches the value axis", async () => {
    renderUi(
      box(
        <LineChart
          data={rows}
          index="month"
          series={series.slice(0, 1)}
          annotations={[{ type: "line", value: 20000, label: "Ceiling" }]}
          aria-label="Visits"
        />,
      ),
    );
    const g = await chartGroup("Visits");
    await settle();
    expect(g.textContent).toMatch(/20K|20,000|Ceiling/);
  });

  it("BarChart (vertical and horizontal) takes the same annotations", async () => {
    const { rerender } = renderUi(
      box(<BarChart data={rows} index="month" series={series} annotations={all} aria-label="Bars" />),
    );
    const g = await chartGroup("Bars");
    await settle();
    expect(g.textContent).toContain("Target");
    rerender(
      box(
        <BarChart data={rows} index="month" series={series} layout="horizontal" annotations={all} aria-label="Bars" />,
      ),
    );
    await settle();
    expect(cleanMarkup(await chartGroup("Bars"))).toBe(true);
  });

  it("annotations that point at nothing are ignored", async () => {
    renderUi(
      box(
        <LineChart
          data={rows}
          index="month"
          series={series.slice(0, 1)}
          annotations={[
            { type: "event", at: "Dec", label: "Ghost" },
            { type: "range", from: "Zzz", to: "Yyy", label: "Void" },
            { type: "band", from: 10, to: 10, label: "Zero" },
          ]}
          aria-label="Visits"
        />,
      ),
    );
    const g = await chartGroup("Visits");
    await settle();
    expect(cleanMarkup(g)).toBe(true);
    expect(g.textContent).not.toContain("Ghost");
  });

  it("many close events do not collide (two label rows)", async () => {
    const many: ChartAnnotation[] = rows.map((r) => ({ type: "event", at: r.month, label: `Event ${r.month}` }));
    renderUi(
      box(<LineChart data={rows} index="month" series={series.slice(0, 1)} annotations={many} aria-label="Visits" />),
    );
    const g = await chartGroup("Visits");
    await settle();
    expect(cleanMarkup(g)).toBe(true);
  });

  describeVariants((variant) => {
    it("has no axe violations with annotations", async () => {
      renderUi(
        box(<LineChart data={rows} index="month" series={series.slice(0, 1)} annotations={all} aria-label="Visits" />),
        variant,
      );
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

describe("brush helpers", () => {
  it("defaultBrushRange shows the last fraction of the data, at least minSpan points", () => {
    expect(defaultBrushRange(100)).toEqual([0, 99]);
    expect(defaultBrushRange(100, 0.25)).toEqual([75, 99]);
    expect(defaultBrushRange(10, 0.01)[1] - defaultBrushRange(10, 0.01)[0]).toBeGreaterThanOrEqual(1);
    expect(defaultBrushRange(1)).toEqual([0, 0]);
  });
  it("clampBrushRange keeps a range inside the data and at least minSpan wide", () => {
    expect(clampBrushRange([-5, 200], 50)).toEqual([0, 49]);
    expect(clampBrushRange([10, 10], 50, 2)[1] - clampBrushRange([10, 10], 50, 2)[0]).toBeGreaterThanOrEqual(1);
    expect(clampBrushRange([20, 10], 50)[0]).toBeLessThanOrEqual(clampBrushRange([20, 10], 50)[1]);
    expect(clampBrushRange([0, 49], 50, 10)).toEqual([0, 49]);
    const [a, b] = clampBrushRange([48, 49], 50, 5);
    expect(b).toBeLessThanOrEqual(49);
    expect(b - a).toBeGreaterThanOrEqual(3);
  });
});

describe("ChartBrush gestures", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ t: `D${i + 1}`, v: 10 + ((i * 7) % 13) }));

  it("dragging the start handle, the end handle and the window pans/resizes the range and reports it", async () => {
    mockPointerCapture();
    const onRangeChange = vi.fn();
    renderUi(
      box(
        <LineChart
          data={many}
          index="t"
          series={[{ key: "v", label: "V" }]}
          aria-label="Brushed"
          brush={{ defaultRange: [10, 30], onRangeChange, minSpan: 4 }}
        />,
      ),
    );
    const start = await screen.findByRole("slider", { name: "Start of range" });
    const end = screen.getByRole("slider", { name: "End of range" });
    await settle();
    // The window's edges glide on springs after each drag: let them rest before measuring the next.
    const rest = () => holdFor(900);
    const s = centerOf(start);
    await dragPointer(start, s, { x: s.x - 40, y: s.y });
    expect(onRangeChange).toHaveBeenCalled();
    const afterStart = onRangeChange.mock.lastCall![0] as [number, number];
    expect(afterStart[0]).toBeLessThan(10);
    await rest();
    const e = centerOf(end);
    await dragPointer(end, e, { x: e.x - 60, y: e.y });
    const afterEnd = onRangeChange.mock.lastCall![0] as [number, number];
    expect(afterEnd[1]).toBeLessThan(30);
    await rest();
    const win = document.querySelector<HTMLElement>("[data-slot=chart-brush-window]");
    expect(win).not.toBeNull();
    const w = centerOf(win!);
    await dragPointer(win!, w, { x: w.x + 60, y: w.y });
    const afterPan = onRangeChange.mock.lastCall![0] as [number, number];
    expect(afterPan[0]).toBeGreaterThan(afterEnd[0]);
    expect(afterPan[1] - afterPan[0]).toBeCloseTo(afterEnd[1] - afterEnd[0], 0);
  });

  it("clicking the track outside the window recentres it", async () => {
    mockPointerCapture();
    const onRangeChange = vi.fn();
    renderUi(
      box(
        <LineChart
          data={many}
          index="t"
          series={[{ key: "v", label: "V" }]}
          aria-label="Brushed"
          brush={{ defaultRange: [0, 10], onRangeChange }}
        />,
      ),
    );
    await screen.findByRole("slider", { name: "Start of range" });
    await settle();
    const root = document.querySelector<HTMLElement>("[data-slot=chart-brush]")!;
    const track = root.firstElementChild as HTMLElement;
    expect(track).not.toBeNull();
    const p = pointIn(root, 0.85, 0.5);
    firePointer(track, "pointerdown", p);
    firePointer(track, "pointerup", p);
    await expect.poll(() => onRangeChange.mock.calls.length).toBeGreaterThan(0);
    expect((onRangeChange.mock.lastCall![0] as [number, number])[0]).toBeGreaterThan(10);
  });

  it("the brush windows the chart's own keyboard readout", async () => {
    renderUi(
      box(
        <LineChart
          data={many}
          index="t"
          series={[{ key: "v", label: "V" }]}
          aria-label="Brushed"
          brush={{ defaultRange: [5, 15] }}
        />,
      ),
    );
    await focusChart("Brushed");
    await press("{Home}");
    await expect.poll(polite).toMatch(/D6:/);
    await press("{End}");
    await expect.poll(polite).toMatch(/D16:/);
  });
});

describe("ChartCard legend rules", () => {
  const one = [{ label: "Visits", color: "var(--sheen-chart-1)", kind: "line" as const }];
  const two = [...one, { label: "Signups", color: "var(--sheen-chart-2)", kind: "line" as const }];
  const chart = <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />;
  it("one series: no legend (the title already names it)", () => {
    renderUi(
      box(
        <ChartCard title="Traffic" legend={one}>
          {chart}
        </ChartCard>,
      ),
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("group", { name: "Series: press to show or hide" })).toBeNull();
  });
  it("two or more series: a legend that names each, static when it cannot toggle", () => {
    renderUi(
      box(
        <ChartCard title="Traffic" legend={two} legendToggle={false}>
          {chart}
        </ChartCard>,
      ),
    );
    const list = screen.getByRole("list");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Visits", "Signups"]);
  });
  it("a legend item with a value shows it", () => {
    renderUi(
      box(
        <ChartCard
          title="Traffic"
          legend={[
            { ...two[0]!, value: "12K" },
            { ...two[1]!, value: "3K" },
          ]}
          legendToggle={false}
        >
          {chart}
        </ChartCard>,
      ),
    );
    expect(screen.getByRole("list").textContent).toContain("12K");
  });
  it("no legend prop: no legend", () => {
    renderUi(box(<ChartCard title="Traffic">{chart}</ChartCard>));
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("ChartCard download menu", () => {
  const csvOptions = { data: rows, index: "month", series };
  const card = (props: Record<string, unknown> = {}) => (
    <ChartCard title="Traffic" legend={seriesLegend(series, "line")} exportable csv={csvOptions} {...props}>
      <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
    </ChartCard>
  );
  const names: string[] = [];
  const spyDownloads = () => {
    names.length = 0;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
  };
  const open = async () => {
    // The menu is lazy-loaded (its own chunk): a cold first import can take longer than the default 1 s.
    await userEvent.click(await screen.findByRole("button", { name: "Traffic: download" }, { timeout: 10000 }));
  };

  it("offers PNG, SVG and CSV, and announces each download", async () => {
    spyDownloads();
    renderUi(box(card()));
    await chartGroup("Visits and signups");
    await settle();
    await open();
    for (const item of ["Download PNG", "Download SVG", "Download CSV"])
      expect(await screen.findByRole("menuitem", { name: new RegExp(item) })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: /Download SVG/ }));
    await expect.poll(() => names).toContain("traffic.svg");
    await expect.poll(polite).toMatch(/traffic\.svg/);
    await open();
    await userEvent.click(await screen.findByRole("menuitem", { name: /Download CSV/ }));
    await expect.poll(() => names).toContain("traffic.csv");
    await open();
    await userEvent.click(await screen.findByRole("menuitem", { name: /Download PNG/ }));
    await expect.poll(() => names).toContain("traffic.png");
  });

  it("formats and filename can be restricted", async () => {
    spyDownloads();
    renderUi(box(card({ exportable: { formats: ["svg"], filename: "My Report" } })));
    await chartGroup("Visits and signups");
    await open();
    expect(await screen.findByRole("menuitem", { name: /Download SVG/ })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Download PNG/ })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /Download CSV/ })).toBeNull();
    await userEvent.click(screen.getByRole("menuitem", { name: /Download SVG/ }));
    await expect.poll(() => names).toContain("my-report.svg");
  });

  it("CSV comes from the table view when no csv options are given", async () => {
    spyDownloads();
    renderUi(
      box(
        <ChartCard
          title="Traffic"
          exportable
          table={<ChartTable data={rows} index="month" series={series} caption="Traffic table" />}
        >
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
    );
    await chartGroup("Visits and signups");
    await open();
    await userEvent.click(await screen.findByRole("menuitem", { name: /Download CSV/ }));
    await expect.poll(() => names).toContain("traffic.csv");
  });

  it("no csv source hides the CSV item", async () => {
    renderUi(
      box(
        <ChartCard title="Traffic" exportable>
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
    );
    await chartGroup("Visits and signups");
    await open();
    await screen.findByRole("menuitem", { name: /Download PNG/ });
    expect(screen.queryByRole("menuitem", { name: /Download CSV/ })).toBeNull();
  });

  it("a failing export announces the failure instead of throwing", async () => {
    renderUi(
      box(
        <ChartCard title="Traffic" exportable={{ formats: ["svg"] }} labels={{ exportFailed: "Fehler beim Download" }}>
          <p>No chart here, just text</p>
        </ChartCard>,
      ),
    );
    await open();
    await userEvent.click(await screen.findByRole("menuitem", { name: /Download SVG/ }));
    await expect.poll(() => document.body.textContent).toMatch(/Fehler beim Download/);
  });

  it("the menu is keyboard operable: Enter opens, arrows move, Escape closes", async () => {
    renderUi(box(card()));
    await chartGroup("Visits and signups");
    const trigger = await screen.findByRole("button", { name: "Traffic: download" }, { timeout: 10000 });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const first = await screen.findByRole("menuitem", { name: /Download PNG/ });
    expect(first).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("menuitem", { name: /Download PNG/ })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  describeVariants((variant) => {
    it("has no axe violations with the menu open", async () => {
      renderUi(box(card()), variant);
      await chartGroup("Visits and signups");
      await settle();
      await open();
      await screen.findByRole("menuitem", { name: /Download PNG/ });
      await settle();
      expect(await runAxe()).toHaveNoViolations();
      within(document.body);
    });
  });
});
