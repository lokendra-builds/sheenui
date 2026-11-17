import { expect, it } from "vitest";
import { useState } from "react";
import { cleanup, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { BarChart } from "../../src/components/charts/bar-chart";
import { DonutChart, type DonutSlice } from "../../src/components/charts/donut-chart";
import { ChartCard, ChartTable, seriesLegend } from "../../src/components/charts/chart-parts";
import { TableScroll } from "../../src/components/charts/chart-fit";
import { ChartValueTable } from "../../src/components/charts/chart-tip";
import { parkPointer, reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
import { findFigure } from "../helpers-charts";

const rows = [
  { day: "Mon", orders: 12, refunds: 2 },
  { day: "Tue", orders: 18, refunds: 1 },
  { day: "Wed", orders: 9, refunds: 3 },
  { day: "Thu", orders: 22, refunds: 0 },
];
const series = [
  { key: "orders", label: "Orders" },
  { key: "refunds", label: "Refunds" },
];
const slices: DonutSlice[] = [
  { label: "Direct", value: 4200 },
  { label: "Search", value: 3100 },
  { label: "Referral", value: 1200 },
];

const box = (ui: React.ReactElement) => <div style={{ width: 640 }}>{ui}</div>;
const polite = () => [...document.querySelectorAll("[aria-live=polite]")].map((e) => e.textContent).join("|");

describeVariants((variant) => {
  /* ---------- BarChart ---------- */
  it("BarChart: a focusable chart group; arrow keys read each category with its values", async () => {
    renderUi(box(<BarChart data={rows} index="day" series={series} aria-label="Orders per day" />), variant);
    const g = await findFigure("Orders per day. Use arrow keys to read values.");
    expect(g).toHaveAttribute("aria-roledescription", "chart");
    expect(g).toHaveAttribute("tabindex", "0");
    await parkPointer();
    g.focus();
    // Home first: where the pointer last rested over the page may already have activated a bar.
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Mon");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.poll(polite).toContain("Wed");
    expect(polite()).toMatch(/Orders/);
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Mon");
    await userEvent.keyboard("{End}");
    await expect.poll(polite).toContain("Thu");
    await userEvent.keyboard("{Escape}");
  });

  it("BarChart: horizontal and stacked layouts render, and a stack announces its total", async () => {
    const { rerender } = renderUi(
      box(<BarChart data={rows} index="day" series={series} layout="horizontal" aria-label="Horizontal" />),
      variant,
    );
    expect(await findFigure(/Horizontal/)).toBeInTheDocument();
    rerender(box(<BarChart data={rows} index="day" series={series} stacked aria-label="Stacked" />));
    const g = await findFigure(/Stacked/);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Mon");
    await expect.poll(polite).toMatch(/Total/);
  });

  it("BarChart: hiddenSeries removes bars from the readout; labels translate; empty shows the empty state", async () => {
    const { rerender } = renderUi(
      box(
        <BarChart
          data={rows}
          index="day"
          series={series}
          hiddenSeries={["refunds"]}
          aria-label="Bestellungen"
          labels={{ instructions: "Pfeiltasten." }}
        />,
      ),
      variant,
    );
    const g = await findFigure("Bestellungen. Pfeiltasten.");
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{Home}");
    await expect.poll(polite).toContain("Orders");
    expect(polite()).not.toContain("Refunds");
    rerender(
      box(<BarChart data={[]} index="day" series={series} aria-label="Bestellungen" emptyState="Keine Bestellungen" />),
    );
    expect(screen.getByText("Keine Bestellungen")).toBeInTheDocument();
  });

  it("BarChart in a ChartCard: legend toggling hides a series and the table view lists every value", async () => {
    renderUi(
      box(
        <ChartCard
          title="Orders"
          legend={seriesLegend(series, "rect")}
          table={<ChartTable data={rows} index="day" series={series} indexLabel="Day" caption="Orders per day" />}
        >
          <BarChart data={rows} index="day" series={series} aria-label="Orders per day" />
        </ChartCard>,
      ),
      variant,
    );
    const refunds = screen.getByRole("button", { name: /Refunds/ });
    await userEvent.click(refunds);
    expect(refunds).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("tab", { name: "Table" }));
    const table = await screen.findByRole("table", { name: "Orders per day" });
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getByRole("cell", { name: "22" })).toBeInTheDocument();
  });

  /* ---------- DonutChart ---------- */
  it("DonutChart: named chart group, centre total, and a legend of toggle buttons", async () => {
    renderUi(box(<DonutChart data={slices} labels={{ center: "Visits" }} aria-label="Visits by channel" />), variant);
    const g = await findFigure("Visits by channel. Use arrow keys to read each slice.");
    expect(g).toHaveAttribute("aria-roledescription", "chart");
    expect(screen.getByText("Visits")).toBeInTheDocument();
    for (const name of ["Direct", "Search", "Referral"]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toHaveAttribute("aria-pressed", "true");
    }
  });

  it("DonutChart: arrow keys read slices with value and percentage", async () => {
    renderUi(box(<DonutChart data={slices} aria-label="Visits by channel" locale="en-US" />), variant);
    const g = await findFigure(/Visits by channel/);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Direct");
    expect(polite()).toMatch(/percent/);
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(polite).toContain("Search");
    await userEvent.keyboard("{End}");
    await expect.poll(polite).toContain("Referral");
  });

  it("DonutChart: toggling a slice hides it, updates the total and reports the hidden keys (also by keyboard)", async () => {
    const seen: string[][] = [];
    renderUi(
      box(
        <DonutChart
          data={slices}
          aria-label="Visits by channel"
          locale="en-US"
          onHiddenSlicesChange={(k) => seen.push(k)}
        />,
      ),
      variant,
    );
    const search = screen.getByRole("button", { name: /Search/ });
    await userEvent.click(search);
    expect(search).toHaveAttribute("aria-pressed", "false");
    expect(seen.at(-1)).toEqual(["Search"]);
    search.focus();
    await userEvent.keyboard("{Enter}");
    expect(search).toHaveAttribute("aria-pressed", "true");
    expect(seen.at(-1)).toEqual([]);
    await userEvent.keyboard(" ");
    expect(seen.at(-1)).toEqual(["Search"]);
  });

  it("DonutChart: defaultHiddenSlices, controlled hiddenSlices and legendToggle={false}", async () => {
    function Controlled() {
      const [hidden, setHidden] = useState<string[]>(["Direct"]);
      return (
        <DonutChart data={slices} aria-label="Controlled" hiddenSlices={hidden} onHiddenSlicesChange={setHidden} />
      );
    }
    const { rerender } = renderUi(box(<Controlled />), variant);
    expect(screen.getByRole("button", { name: /Direct/ })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: /Direct/ }));
    expect(screen.getByRole("button", { name: /Direct/ })).toHaveAttribute("aria-pressed", "true");
    rerender(box(<DonutChart data={slices} aria-label="Static" legendToggle={false} />));
    expect(screen.queryByRole("button", { name: /Direct/ })).toBeNull();
    cleanup();
    renderUi(box(<DonutChart data={slices} aria-label="Default hidden" defaultHiddenSlices={["Search"]} />), variant);
    expect(screen.getByRole("button", { name: /Search/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("DonutChart: all-zero or empty data says so (visibly and to assistive tech)", async () => {
    const { rerender } = renderUi(
      box(<DonutChart data={[{ label: "A", value: 0 }]} aria-label="Nothing" emptyState="No visits" />),
      variant,
    );
    expect(screen.getByText("No visits")).toBeInTheDocument();
    expect(await screen.findByRole("figure", { name: /Nothing: / })).toBeInTheDocument();
    rerender(box(<DonutChart data={[]} aria-label="Nothing" labels={{ noDataSuffix: "keine Daten" }} />));
    expect(screen.getByRole("figure", { name: "Nothing: keine Daten" })).toBeInTheDocument();
  });

  it("has no axe violations (bar, stacked, donut with a centre label, cards with a table view)", async () => {
    renderUi(
      <div className="grid gap-6" style={{ width: 640 }}>
        <BarChart data={rows} index="day" series={series} aria-label="Bars" />
        <BarChart data={rows} index="day" series={series} stacked layout="horizontal" aria-label="Stacked horizontal" />
        <DonutChart data={slices} labels={{ center: "Visits" }} aria-label="Donut" />
        <ChartCard
          title="Card"
          legend={seriesLegend(series, "rect")}
          table={<ChartTable data={rows} index="day" series={series} caption="Card table" />}
        >
          <BarChart data={rows} index="day" series={series} aria-label="Card bars" />
        </ChartCard>
      </div>,
      variant,
    );
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: bar and donut charts read out the same", async () => {
  reduceMotion();
  renderUi(
    box(
      <>
        <BarChart data={rows} index="day" series={series} aria-label="Orders per day" />
        <DonutChart data={slices} aria-label="Visits by channel" />
      </>,
    ),
  );
  const bars = await findFigure(/Orders per day/);
  await parkPointer();
  bars.focus();
  await userEvent.keyboard("{Home}");
  await expect.poll(polite).toContain("Mon");
});

it("a chart is a figure: named by its title, described by the keyboard hint, and details point at the ChartCard table", async () => {
  renderUi(
    box(
      <ChartCard title="Orders" table={<ChartTable data={rows} index="day" series={series} caption="Orders table" />}>
        <BarChart data={rows} index="day" series={series} aria-label="Orders per day" />
      </ChartCard>,
    ),
  );
  const fig = await findFigure(/Orders per day/);
  expect(fig).toHaveAttribute("role", "figure");
  expect(fig).toHaveAttribute("aria-label", "Orders per day");
  expect(fig).toHaveAttribute("tabindex", "0");
  const description = document.getElementById(fig.getAttribute("aria-describedby") ?? "");
  expect(description?.textContent).toMatch(/arrow keys/i);
  const twin = fig.getAttribute("aria-details");
  expect(twin).toBeTruthy();
  // The details target is the visually hidden copy of the table that stays in the accessibility tree while the chart
  // tab is showing (built after first paint), so it must exist, hold the table and never be hidden or inert.
  await expect.poll(() => document.getElementById(twin ?? "")?.querySelector("table")).toBeTruthy();
  const target = document.getElementById(twin ?? "");
  expect(target).not.toHaveAttribute("hidden");
  expect(target).not.toHaveAttribute("inert");
  expect(target?.textContent).toMatch(/Orders table/);
});

it("the hidden table copy behind every kind of table view has no tab stop and no scroller", async () => {
  // The copy is a 1 px box, so any table in it "overflows": a scroller there would become a focusable group nobody can
  // see (and axe flags an unfocusable one). TableOverflow, TableScroll and ChartValueTable must all stay static in it.
  const tables = {
    "Chart table": <ChartTable data={rows} index="day" series={series} caption="Chart table" />,
    "Scroll table": (
      <TableScroll label="Scroll table">
        <table>
          <caption>Scroll table</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.day}>
                <th scope="row">{row.day}</th>
                <td>{String(row.orders)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    ),
    "Value table": (
      <ChartValueTable
        caption="Value table"
        columns={[{ label: "Day" }, { label: "Orders" }]}
        rows={rows.map((row) => [row.day, String(row.orders)])}
      />
    ),
  };
  for (const [name, table] of Object.entries(tables)) {
    renderUi(
      box(
        <ChartCard title={name} table={table}>
          <BarChart data={rows} index="day" series={series} aria-label={`${name} chart`} />
        </ChartCard>,
      ),
    );
    const fig = await findFigure(new RegExp(`${name} chart`));
    const twinId = fig.getAttribute("aria-details") ?? "";
    await expect.poll(() => document.getElementById(twinId)?.querySelector("table")).toBeTruthy();
    const twin = document.getElementById(twinId);
    // Let the ResizeObservers report before checking.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(twin?.querySelectorAll("[tabindex]:not([tabindex='-1'])")).toHaveLength(0);
    const scrollers = [...(twin?.querySelectorAll("*") ?? [])].filter((el) =>
      ["auto", "scroll"].includes(getComputedStyle(el).overflowX),
    );
    expect(scrollers).toHaveLength(0);
    cleanup();
  }
});

it("outside a ChartCard with a table, the figure has no aria-details", async () => {
  renderUi(box(<BarChart data={rows} index="day" series={series} aria-label="Orders per day" />));
  const fig = await findFigure(/Orders per day/);
  expect(fig).not.toHaveAttribute("aria-details");
});
