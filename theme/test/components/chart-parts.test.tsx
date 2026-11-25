// The analytics chart parts and chart internals that otherwise render only inside a dashboard:
// AnalyticsPanel, TrendChart, BarTrendChart, StackedTrendChart, TrendTable, ChartAnnotationsLayer and ChartTip.

import { expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  AnalyticsPanel,
  BarTrendChart,
  StackedTrendChart,
  TrendChart,
  TrendTable,
  defaultAnalyticsLabels,
} from "../../src/blocks/analytics-kit";
import { ChartAnnotationsLayer } from "../../src/components/charts/chart-annotations";
import { ChartCard, ChartTable } from "../../src/components/charts/chart-parts";
import { LineChart } from "../../src/components/charts/line-chart";
import { ChartTip } from "../../src/components/charts/chart-tip";
import { settle } from "../helpers";
import { renderUi, runAxe } from "../render";
import { box, getFigure } from "../helpers-charts";

const days = [
  { label: "Mon", value: 120, previous: 100 },
  { label: "Tue", value: 180, previous: 150 },
  { label: "Wed", value: 160, previous: 170 },
  { label: "Thu", value: 210, previous: 160 },
];

it("AnalyticsPanel shows its title as a heading, its description, and a Chart / Table switch when it has a table", async () => {
  renderUi(
    box(
      <AnalyticsPanel
        title="Visitors"
        description="Unique visitors per day"
        minHeight={200}
        ready
        labels={defaultAnalyticsLabels}
        table={<TrendTable indexLabel="Day" seriesLabel="Visitors" caption="Visitors per day" data={days} />}
      >
        <p>chart body</p>
      </AnalyticsPanel>,
    ),
  );
  expect(screen.getByRole("heading", { name: "Visitors" })).toBeInTheDocument();
  expect(screen.getByText("Unique visitors per day")).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Visitors" })).toBeInTheDocument();
  const tabs = within(screen.getByRole("tablist", { name: defaultAnalyticsLabels.viewAs("Visitors") })).getAllByRole(
    "tab",
  );
  expect(tabs.map((t) => t.textContent)).toEqual([defaultAnalyticsLabels.chart, defaultAnalyticsLabels.table]);
  await waitFor(() => expect(screen.getByText("chart body")).toBeInTheDocument());
  expect((await runAxe()).violations).toEqual([]);
});

it("AnalyticsPanel keeps a skeleton instead of its chart until the data is ready", async () => {
  renderUi(
    <AnalyticsPanel title="Orders" minHeight={160} ready={false} labels={defaultAnalyticsLabels}>
      <p>orders chart</p>
    </AnalyticsPanel>,
  );
  expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
  await settle();
  expect(screen.queryByText("orders chart")).not.toBeInTheDocument();
});

it("TrendChart renders a named chart figure with its day labels on the axis and the keyboard hint", async () => {
  renderUi(box(<TrendChart seriesLabel="Visitors" aria-label="Visitors per day" data={days} compare />));
  const figure = await waitFor(() => getFigure(/Visitors per day/));
  expect(figure).toHaveAttribute("aria-label", "Visitors per day");
  expect(figure.tagName.toLowerCase()).not.toBe("table");
  for (const d of days) expect(within(figure).getByText(d.label)).toBeInTheDocument();
  expect((await runAxe()).violations).toEqual([]);
});

it("TrendChart shows the no-data text for an empty series", async () => {
  renderUi(box(<TrendChart seriesLabel="Visitors" aria-label="Visitors per day" data={[]} />));
  expect(await screen.findByText(defaultAnalyticsLabels.noData)).toBeInTheDocument();
});

it("BarTrendChart renders a named figure with one axis label per bar and the line series", async () => {
  const orders = [
    { label: "Mon", value: 42, line: 38 },
    { label: "Tue", value: 51, line: 40 },
    { label: "Wed", value: 47, line: 43 },
  ];
  renderUi(
    box(<BarTrendChart seriesLabel="Orders" lineLabel="7-day average" aria-label="Orders per day" data={orders} />),
  );
  const figure = await waitFor(() => getFigure(/Orders per day/));
  for (const o of orders) expect(within(figure).getByText(o.label)).toBeInTheDocument();
  expect((await runAxe()).violations).toEqual([]);
});

it("StackedTrendChart renders a named figure with every x position labelled", async () => {
  renderUi(
    box(
      <StackedTrendChart
        aria-label="Traffic by channel"
        series={[
          { key: "search", label: "Search", color: 1 },
          { key: "social", label: "Social", color: 2 },
        ]}
        data={[
          { label: "Mon", values: { search: 120, social: 40 } },
          { label: "Tue", values: { search: 150, social: 55 } },
          { label: "Wed", values: { search: 135, social: 60 } },
        ]}
      />,
    ),
  );
  const figure = await waitFor(() => getFigure(/Traffic by channel/));
  for (const label of ["Mon", "Tue", "Wed"]) expect(within(figure).getByText(label)).toBeInTheDocument();
  expect((await runAxe()).violations).toEqual([]);
});

it("TrendTable lists one row per point under its headers, with the previous-period and change columns when comparing", async () => {
  renderUi(<TrendTable indexLabel="Day" seriesLabel="Visitors" caption="Visitors per day" data={days} compare />);
  const table = screen.getByRole("table", { name: "Visitors per day" });
  expect(
    within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent),
  ).toEqual(["Day", "Visitors", defaultAnalyticsLabels.previousPeriod, defaultAnalyticsLabels.changeLabel]);
  const body = within(table).getAllByRole("row").slice(1);
  expect(body).toHaveLength(days.length);
  const first = within(body[0]!).getAllByRole("cell");
  expect(within(body[0]!).getByRole("rowheader")).toHaveTextContent("Mon");
  expect(first).toHaveLength(3); // value, previous, change (the day is the row header)
  expect(first[0]).toHaveTextContent("120");
  expect(first[1]).toHaveTextContent("100");
  expect(first[2]).toHaveTextContent("+20%");
  expect((await runAxe()).violations).toEqual([]);
});

it("TrendTable shows the no-data row for an empty series", () => {
  renderUi(<TrendTable indexLabel="Day" seriesLabel="Visitors" data={[]} />);
  expect(screen.getByRole("cell", { name: defaultAnalyticsLabels.noData })).toBeInTheDocument();
});

it("ChartAnnotationsLayer draws a labelled reference line behind nothing and an event marker with its label on the front layer", () => {
  const data = [
    { m: "Jan", v: 40 },
    { m: "Feb", v: 60 },
    { m: "Mar", v: 50 },
  ];
  const common = {
    data,
    index: "m",
    innerW: 300,
    innerH: 120,
    value: (v: number) => 120 - v,
    position: (i: number) => i * 100 + 50,
  };
  const annotations = [
    { type: "line", value: 50, label: "Target", tone: "success" },
    { type: "event", at: "Feb", label: "Launch" },
    { type: "band", from: 20, to: 40, label: "Danger zone", tone: "danger" },
  ] as const;
  renderUi(
    <svg width={300} height={120}>
      <ChartAnnotationsLayer {...common} annotations={annotations} layer="front" reduced />
      <ChartAnnotationsLayer {...common} annotations={annotations} layer="back" reduced />
    </svg>,
  );
  const front = document.querySelector("[data-slot=chart-annotations-front]")!;
  const back = document.querySelector("[data-slot=chart-annotations-back]")!;
  expect(within(front as HTMLElement).getByText("Target")).toBeInTheDocument();
  expect(within(front as HTMLElement).getByText("Launch")).toBeInTheDocument();
  expect(front.querySelectorAll("line")).toHaveLength(2); // the reference line and the event's dashed rule
  expect(front.querySelectorAll("path")).toHaveLength(1); // the event's diamond
  expect(within(back as HTMLElement).getByText("Danger zone")).toBeInTheDocument();
  expect(back.querySelectorAll("rect").length).toBeGreaterThan(0);
});

it("ChartAnnotationsLayer draws nothing for no annotations or an empty plot", () => {
  const props = {
    data: [{ m: "Jan", v: 1 }],
    index: "m",
    value: (v: number) => v,
    position: () => 0,
    layer: "front" as const,
  };
  renderUi(
    <svg>
      <ChartAnnotationsLayer {...props} annotations={[]} innerW={100} innerH={100} />
      <ChartAnnotationsLayer {...props} annotations={[{ type: "line", value: 1 }]} innerW={0} innerH={100} />
    </svg>,
  );
  expect(document.querySelector("[data-slot^=chart-annotations]")).toBeNull();
});

it("ChartTip shows its title and one row per series, and sits to the right of the mark inside the chart box", async () => {
  renderUi(
    <div style={{ position: "relative", width: 320, height: 200 }}>
      <ChartTip
        title="Mon"
        rows={[
          { label: "Visits", value: "1,284", color: "var(--sheen-chart-1)" },
          { label: "Signups", value: "96", color: "var(--sheen-chart-2)" },
        ]}
        anchor={{ x: 40, y: 20, w: 24, h: 24 }}
        bounds={{ w: 320, h: 200 }}
      />
    </div>,
  );
  const tip = await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-slot=chart-tooltip]")!;
    expect(el).not.toBeNull();
    expect(el.style.visibility).not.toBe("hidden");
    return el;
  });
  expect(within(tip).getByText("Mon")).toBeInTheDocument();
  expect(tip.querySelectorAll("li")).toHaveLength(2); // the tip is aria-hidden: the chart announces the values instead
  expect(tip).toHaveTextContent("1,284");
  expect(tip).toHaveTextContent("Signups");
  expect(parseFloat(tip.style.left)).toBeGreaterThanOrEqual(40 + 24); // right of the anchor
  expect(tip.offsetLeft + tip.offsetWidth).toBeLessThanOrEqual(320);
  expect(tip).toHaveAttribute("aria-hidden", "true");
});

it("ChartCard keeps its table twin in the accessibility tree while the Chart tab is active (aria-details never points at a hidden panel)", async () => {
  const rows = [
    { m: "Jan", a: 1 },
    { m: "Feb", a: 3 },
  ];
  const series = [{ key: "a", label: "Visits" }];
  renderUi(
    box(
      <ChartCard title="Visits" table={<ChartTable data={rows} index="m" series={series} caption="Visits per month" />}>
        <LineChart data={rows} index="m" series={series} aria-label="Visits per month" />
      </ChartCard>,
    ),
  );
  const figure = await waitFor(() => getFigure(/Visits per month/));
  await waitFor(() => {
    const target = document.getElementById(figure.getAttribute("aria-details") ?? "");
    expect(target).not.toBeNull();
    expect(target!.closest("[hidden]")).toBeNull();
    expect(target!.querySelector("table")).not.toBeNull();
  });
  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: "Table" }));
  await waitFor(() => {
    const target = document.getElementById(figure.getAttribute("aria-details") ?? "");
    expect(target).toHaveAttribute("role", "tabpanel");
    expect(target).not.toHaveAttribute("hidden");
  });
});
