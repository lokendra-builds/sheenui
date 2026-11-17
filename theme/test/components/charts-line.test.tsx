import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { BarChart } from "../../src/components/charts/bar-chart";
import type { ChartRow, CompareSeries } from "../../src/components/charts/chart-utils";
import { AreaChart, LineChart } from "../../src/components/charts/line-chart";
import { ChartCard, ChartTable, seriesLegend } from "../../src/components/charts/chart-parts";
import { parkPointer, reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
import { findFigure, getFigure, queryChartGroup } from "../helpers-charts";

const rows = [
  { month: "Jan", visits: 4200, signups: 310, prev: 3900 },
  { month: "Feb", visits: 5100, signups: 420, prev: 4100 },
  { month: "Mar", visits: 4800, signups: 390, prev: 4600 },
  { month: "Apr", visits: 6100, signups: 520, prev: 5000 },
];
const series = [
  { key: "visits", label: "Visits" },
  { key: "signups", label: "Signups" },
];

const box = (ui: React.ReactElement) => <div style={{ width: 640 }}>{ui}</div>;
const polite = () => [...document.querySelectorAll("[aria-live=polite]")].map((e) => e.textContent).join("|");

describeVariants((variant) => {
  it("is a focusable chart group named by its aria-label plus the keyboard hint", async () => {
    renderUi(box(<LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />), variant);
    const g = await findFigure(/Visits and signups\. Use left and right arrow keys to read values\./);
    expect(g).toHaveAttribute("aria-roledescription", "chart");
    expect(g).toHaveAttribute("tabindex", "0");
  });

  it("arrow keys read each point and announce its values; Home/End jump; Escape clears", async () => {
    renderUi(box(<LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />), variant);
    const g = await findFigure(/Visits and signups/);
    await parkPointer();
    g.focus();
    // Home first: where the pointer last rested over the page may already have activated a point.
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Jan");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Feb");
    expect(polite()).toMatch(/Visits/);
    await userEvent.keyboard("{End}");
    await expect.poll(polite).toContain("Apr");
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Jan");
    await userEvent.keyboard("{Escape}");
    // A tooltip is shown while a point is active and removed again on Escape.
    await expect.poll(() => document.querySelector("[data-slot=chart-tooltip]")).toBeNull();
  });

  it("labels translate the instructions; format applies to values", async () => {
    renderUi(
      box(
        <LineChart
          data={rows}
          index="month"
          series={series}
          aria-label="Besuche"
          labels={{ instructions: "Pfeiltasten benutzen." }}
          format={(n) => `${n} Stk.`}
        />,
      ),
      variant,
    );
    const g = await findFigure(/Besuche\. Pfeiltasten benutzen\./);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Stk.");
  });

  it("no data shows the empty state instead of a chart", () => {
    renderUi(
      box(<LineChart data={[]} index="month" series={series} aria-label="Visits" emptyState="Nothing yet" />),
      variant,
    );
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(queryChartGroup("", /Visits\./) ?? null).toBeNull();
  });

  it("hiddenSeries removes a line from the plot and from the keyboard readout", async () => {
    const { rerender } = renderUi(
      box(<LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />),
      variant,
    );
    const g = await findFigure(/Visits and signups/);
    const lines = () => g.querySelectorAll("path[data-series], path[stroke]").length;
    const before = lines();
    rerender(
      box(
        <LineChart
          data={rows}
          index="month"
          series={series}
          hiddenSeries={["signups"]}
          aria-label="Visits and signups"
        />,
      ),
    );
    await expect.poll(lines).toBeLessThan(before);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Visits");
    expect(polite()).not.toContain("Signups");
  });

  it("compareKey adds a muted previous-period series (named in the table)", () => {
    renderUi(
      box(
        <ChartTable
          data={rows}
          index="month"
          series={[{ key: "visits", label: "Visits", compareKey: "prev" }]}
          caption="Visits vs previous"
          labels={{ previous: (l) => `${l} (vorher)` }}
        />,
      ),
      variant,
    );
    const table = screen.getByRole("table", { name: "Visits vs previous" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent)
        .slice(1),
    ).toEqual(["Visits", "Visits (vorher)"]);
  });

  it("a brush adds a range selector; the window can be changed by keyboard", async () => {
    const onRangeChange = vi.fn();
    renderUi(
      box(
        <LineChart
          data={rows}
          index="month"
          series={series}
          aria-label="Visits and signups"
          brush={{ defaultRange: [0, 3], onRangeChange, minSpan: 2 }}
        />,
      ),
      variant,
    );
    const start = await screen.findByRole("slider", { name: "Start of range" });
    expect(start).toHaveAttribute("aria-valuetext", "Jan");
    expect(screen.getByRole("slider", { name: "End of range" })).toHaveAttribute("aria-valuetext", "Apr");
    start.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onRangeChange).toHaveBeenLastCalledWith([1, 3]);
    await expect.poll(() => start.getAttribute("aria-valuetext")).toBe("Feb");
  });

  it("AreaChart is the same chart with area fill", async () => {
    renderUi(box(<AreaChart data={rows} index="month" series={[series[0]!]} aria-label="Visits area" />), variant);
    expect(await findFigure(/Visits area/)).toBeInTheDocument();
  });

  it("ChartCard: the legend toggles series (aria-pressed), announces it, and the chart follows", async () => {
    renderUi(
      box(
        <ChartCard title="Traffic" description="Last 4 months" legend={seriesLegend(series, "line")}>
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
      variant,
    );
    const legend = screen.getByRole("group", { name: "Series: press to show or hide" });
    const visits = within(legend).getByRole("button", { name: /Visits/ });
    const signups = within(legend).getByRole("button", { name: /Signups/ });
    expect(visits).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(signups);
    expect(signups).toHaveAttribute("aria-pressed", "false");
    await expect.poll(polite).toContain("Signups hidden");
    // The chart's keyboard readout no longer includes the hidden series.
    const g = await findFigure(/Visits and signups/);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Visits");
    await userEvent.click(signups);
    expect(signups).toHaveAttribute("aria-pressed", "true");
    await expect.poll(polite).toContain("Signups shown");
  });

  it("ChartCard: legend buttons work from the keyboard", async () => {
    renderUi(
      box(
        <ChartCard title="Traffic" legend={seriesLegend(series, "line")}>
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
      variant,
    );
    const signups = screen.getByRole("button", { name: /Signups/ });
    signups.focus();
    await userEvent.keyboard("{Enter}");
    expect(signups).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    expect(signups).toHaveAttribute("aria-pressed", "true");
  });

  it("ChartCard: defaultHiddenSeries starts hidden, legendToggle={false} makes the legend static", () => {
    const { rerender } = renderUi(
      box(
        <ChartCard title="Traffic" legend={seriesLegend(series, "line")} defaultHiddenSeries={["signups"]}>
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
      variant,
    );
    expect(screen.getByRole("button", { name: /Signups/ })).toHaveAttribute("aria-pressed", "false");
    rerender(
      box(
        <ChartCard title="Traffic" legend={seriesLegend(series, "line")} legendToggle={false}>
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
    );
    expect(screen.queryByRole("button", { name: /Signups/ })).toBeNull();
  });

  it("ChartCard table view: Chart / Table tabs show a real table with every value", async () => {
    renderUi(
      box(
        <ChartCard
          title="Traffic"
          legend={seriesLegend(series, "line")}
          table={
            <ChartTable data={rows} index="month" series={series} indexLabel="Month" caption="Traffic per month" />
          }
        >
          <LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />
        </ChartCard>,
      ),
      variant,
    );
    const tabs = screen.getByRole("tablist", { name: "Traffic: view as" });
    expect(within(tabs).getByRole("tab", { name: "Chart" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(tabs).getByRole("tab", { name: "Table" }));
    const table = await screen.findByRole("table", { name: "Traffic per month" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Month", "Visits", "Signups"]);
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getByRole("rowheader", { name: "Feb" })).toBeInTheDocument();
    // Keyboard: arrow keys move between the tabs.
    within(tabs).getByRole("tab", { name: "Table" }).focus();
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    await expect
      .poll(() => within(tabs).getByRole("tab", { name: "Chart" }).getAttribute("aria-selected"))
      .toBe("true");
  });

  it("ChartTable with no rows shows the no-data text", () => {
    renderUi(
      <ChartTable data={[]} index="month" series={series} caption="Empty table" labels={{ noData: "Keine Daten" }} />,
      variant,
    );
    expect(screen.getByText("Keine Daten")).toBeInTheDocument();
  });

  it("controlled hiddenSeries from a parent toggle", async () => {
    function Host() {
      const [hidden, setHidden] = useState<string[]>([]);
      return (
        <>
          {box(
            <LineChart
              data={rows}
              index="month"
              series={series}
              hiddenSeries={hidden}
              aria-label="Visits and signups"
            />,
          )}
          <button onClick={() => setHidden(["visits"])}>hide visits</button>
        </>
      );
    }
    renderUi(<Host />, variant);
    await userEvent.click(screen.getByRole("button", { name: "hide visits" }));
    const g = await findFigure(/Visits and signups/);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Signups");
    expect(polite()).not.toContain("Visits");
  });

  it("has no axe violations (chart, card with legend + table, brush, empty)", async () => {
    renderUi(
      <div className="grid gap-6" style={{ width: 640 }}>
        <LineChart data={rows} index="month" series={series} aria-label="Plain line" />
        <ChartCard
          title="Card"
          legend={seriesLegend(series, "line")}
          table={<ChartTable data={rows} index="month" series={series} caption="Card table" />}
        >
          <AreaChart data={rows} index="month" series={series} aria-label="Card area" brush />
        </ChartCard>
        <LineChart data={[]} index="month" series={series} aria-label="Empty line" />
      </div>,
      variant,
    );
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the chart renders and reads out the same", async () => {
  reduceMotion();
  renderUi(box(<LineChart data={rows} index="month" series={series} aria-label="Visits and signups" />));
  const g = await findFigure(/Visits and signups/);
  await parkPointer();
  g.focus();
  await userEvent.keyboard("{Home}");
  await expect.poll(polite).toContain("Jan");
});

// Compile check (pnpm typecheck): data and series that are readonly arrays, like what useLiveData
// returns or an `as const` literal, go straight into the charts without a [...spread] copy.
it("accepts readonly arrays for data and series (LineChart, AreaChart, BarChart, ChartTable)", async () => {
  const frozenRows: readonly ChartRow[] = Object.freeze(rows.map((r) => Object.freeze({ ...r })));
  const frozenSeries: readonly CompareSeries[] = Object.freeze([
    { key: "visits", label: "Visits", compareKey: "prev" },
  ] as const);
  renderUi(
    box(
      <>
        <LineChart
          data={frozenRows}
          index="month"
          series={frozenSeries}
          aria-label="Line"
          hiddenSeries={["signups"] as const}
        />
        <AreaChart data={frozenRows} index="month" series={frozenSeries} aria-label="Area" />
        <BarChart data={frozenRows} index="month" series={frozenSeries} aria-label="Bars" />
        <ChartTable data={frozenRows} index="month" series={frozenSeries} caption="Frozen table" />
      </>,
    ),
  );
  expect(await findFigure(/^Line\./)).toBeInTheDocument();
  expect(getFigure(/^Bars\./)).toBeInTheDocument();
  expect(screen.getByRole("table", { name: "Frozen table" })).toBeInTheDocument();
});
