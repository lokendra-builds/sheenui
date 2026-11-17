import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  ChartBrush,
  clampBrushRange,
  defaultBrushRange,
  type ChartBrushRange,
} from "../../src/components/charts/chart-brush";
import { ChartSyncProvider, createChartSyncStore, useChartSync } from "../../src/components/charts/chart-sync";
import { BarChart } from "../../src/components/charts/bar-chart";
import { LineChart } from "../../src/components/charts/line-chart";
import { Sparkline } from "../../src/components/charts/sparkline";
import { parkPointer, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
import { findFigure } from "../helpers-charts";

const rows = [
  { month: "Jan", revenue: 4, orders: 12 },
  { month: "Feb", revenue: 7, orders: 15 },
  { month: "Mar", revenue: 6, orders: 11 },
  { month: "Apr", revenue: 9, orders: 18 },
];
const box = (ui: React.ReactElement) => <div style={{ width: 600 }}>{ui}</div>;
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2", "Wed2"];

function Probe({ id, keys }: { id: string; keys: string[] }) {
  const { synced, external, publish } = useChartSync();
  return (
    <div>
      <output data-testid={`${id}-state`}>{`${synced ? "synced" : "alone"}:${external ?? "none"}`}</output>
      {keys.map((k) => (
        <button key={k} onClick={() => publish(k)}>{`${id} read ${k}`}</button>
      ))}
      <button onClick={() => publish(null)}>{`${id} leave`}</button>
    </div>
  );
}

describeVariants((variant) => {
  /* ---------- Sparkline ---------- */
  it("Sparkline with a label is an image named by it", () => {
    renderUi(<Sparkline values={[4, 6, 5, 8, 7, 10, 12]} aria-label="Weekly signups" />, variant);
    expect(screen.getByRole("img", { name: /^Weekly signups/ })).toBeInTheDocument();
  });

  it("Sparkline without a label is decorative (hidden from assistive tech)", () => {
    renderUi(<Sparkline values={[1, 2, 3]} />, variant);
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector("svg[aria-hidden=true]")).toBeInTheDocument();
  });

  it("Sparkline: no values show the empty label; one value and a flat series still draw", () => {
    const { rerender } = renderUi(<Sparkline values={[]} aria-label="Trend" emptyState="Keine Daten" />, variant);
    expect(screen.getByText("Keine Daten")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Trend: no data" })).toBeInTheDocument();
    rerender(<Sparkline values={[5]} aria-label="One" />);
    expect(screen.getByRole("img", { name: /^One/ })).toBeInTheDocument();
    rerender(<Sparkline values={[3, 3, 3]} aria-label="Flat" variant="accent" area curve="linear" />);
    expect(screen.getByRole("img", { name: /^Flat/ })).toBeInTheDocument();
    rerender(<Sparkline values={[1, Number.NaN, 3, "x" as unknown as number]} aria-label="Dirty" />);
    expect(screen.getByRole("img", { name: /^Dirty/ })).toBeInTheDocument();
  });

  /* ---------- ChartSyncProvider ---------- */
  it("useChartSync outside a provider is inert; inside, one probe's reading is the other's external key", async () => {
    const { unmount } = renderUi(<Probe id="solo" keys={["Jan"]} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "solo read Jan" }));
    expect(screen.getByTestId("solo-state")).toHaveTextContent("alone:none");
    unmount();

    renderUi(
      <ChartSyncProvider>
        <Probe id="a" keys={["Jan", "Feb"]} />
        <Probe id="b" keys={["Mar"]} />
      </ChartSyncProvider>,
      variant,
    );
    expect(screen.getByTestId("a-state")).toHaveTextContent("synced:none");
    await userEvent.click(screen.getByRole("button", { name: "a read Feb" }));
    await expect.poll(() => screen.getByTestId("b-state").textContent).toBe("synced:Feb");
    // The reader itself sees no external key.
    expect(screen.getByTestId("a-state")).toHaveTextContent("synced:none");
    // Only the chart being read can clear the group.
    await userEvent.click(screen.getByRole("button", { name: "b leave" }));
    expect(screen.getByTestId("b-state")).toHaveTextContent("synced:Feb");
    await userEvent.click(screen.getByRole("button", { name: "a leave" }));
    await expect.poll(() => screen.getByTestId("b-state").textContent).toBe("synced:none");
  });

  it("createChartSyncStore: get / set / subscribe, and a shared store drives two real charts", async () => {
    const store = createChartSyncStore();
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.set({ key: "Jan", source: "x" });
    expect(store.get()).toEqual({ key: "Jan", source: "x" });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.set(null);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get()).toBeNull();

    renderUi(
      <ChartSyncProvider store={store}>
        {box(
          <LineChart
            data={rows}
            index="month"
            series={[{ key: "revenue", label: "Revenue" }]}
            aria-label="Revenue per month"
          />,
        )}
        {box(
          <BarChart
            data={rows}
            index="month"
            series={[{ key: "orders", label: "Orders" }]}
            aria-label="Orders per month"
          />,
        )}
      </ChartSyncProvider>,
      variant,
    );
    const line = await findFigure(/Revenue per month/);
    await parkPointer();
    line.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.poll(() => store.get()?.key).toBe("Feb");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => store.get()).toBeNull();
  });

  it("sync={false} keeps a chart out of the group", async () => {
    const store = createChartSyncStore();
    renderUi(
      <ChartSyncProvider store={store}>
        {box(
          <LineChart
            data={rows}
            index="month"
            series={[{ key: "revenue", label: "Revenue" }]}
            sync={false}
            aria-label="Private"
          />,
        )}
      </ChartSyncProvider>,
      variant,
    );
    const g = await findFigure(/Private/);
    await parkPointer();
    g.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(store.get()).toBeNull();
  });

  /* ---------- ChartBrush ---------- */
  function Brush(props: Partial<React.ComponentProps<typeof ChartBrush>> & { start?: ChartBrushRange }) {
    const [range, setRange] = useState<ChartBrushRange>(props.start ?? [2, 6]);
    return (
      <>
        {box(
          <ChartBrush
            count={days.length}
            labelOf={(i) => days[i]!}
            values={[3, 5, 4, 8, 6, 9, 7, 5, 6, 8]}
            range={range}
            onRangeChange={setRange}
            {...props}
          />,
        )}
        <output>{range.join("-")}</output>
      </>
    );
  }
  const startHandle = () => screen.getByRole("slider", { name: "Start of range" });
  const endHandle = () => screen.getByRole("slider", { name: "End of range" });
  const range = () => document.querySelector("output")!.textContent;

  it("ChartBrush: a named group of two slider handles with the row labels as their values", async () => {
    renderUi(<Brush />, variant);
    expect(screen.getByRole("group", { name: "Visible range" })).toBeInTheDocument();
    await expect.poll(() => startHandle().getAttribute("aria-valuetext")).toBe("Wed");
    expect(startHandle()).toHaveAttribute("aria-valuenow", "2");
    expect(startHandle()).toHaveAttribute("aria-valuemax", String(days.length - 1));
    expect(endHandle()).toHaveAttribute("aria-valuetext", "Sun");
  });

  it("ChartBrush keyboard: arrows move an edge, Page keys move by a tenth, Home/End jump, Shift+arrows pan", async () => {
    renderUi(<Brush />, variant);
    startHandle().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(range).toBe("1-6");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.poll(range).toBe("3-6");
    await userEvent.keyboard("{Home}");
    await expect.poll(range).toBe("0-6");
    endHandle().focus();
    await userEvent.keyboard("{End}");
    await expect.poll(range).toBe("0-9");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(range).toBe("0-8");
    await userEvent.keyboard("{PageDown}");
    await expect.poll(range).toBe("0-7");
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await expect.poll(range).toBe("1-8");
  });

  it("ChartBrush never lets the handles cross: minSpan holds the window open", async () => {
    renderUi(<Brush start={[3, 5]} minSpan={3} />, variant);
    startHandle().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    const [s, e] = range().split("-").map(Number) as [number, number];
    expect(e - s).toBeGreaterThanOrEqual(2);
  });

  it("ChartBrush labels translate the control (i18n)", () => {
    renderUi(
      <Brush labels={{ group: "Sichtbarer Bereich", start: "Anfang", end: "Ende", value: (l) => `Tag ${l}` }} />,
      variant,
    );
    expect(screen.getByRole("group", { name: "Sichtbarer Bereich" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Anfang" })).toHaveAttribute("aria-valuetext", "Tag Wed");
    expect(screen.getByRole("slider", { name: "Ende" })).toBeInTheDocument();
  });

  it("ChartBrush reports scrubbing only while a drag is in progress (not for key presses)", async () => {
    const onScrubChange = vi.fn();
    renderUi(<Brush onScrubChange={onScrubChange} />, variant);
    startHandle().focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onScrubChange).not.toHaveBeenCalledWith(true);
  });

  it("has no axe violations (sparklines, synced charts, brush)", async () => {
    renderUi(
      <div className="grid gap-6" style={{ width: 600 }}>
        <Sparkline values={[4, 6, 5, 8]} aria-label="Signups" />
        <Sparkline values={[4, 6, 5, 8]} />
        <Sparkline values={[]} aria-label="Empty" />
        <ChartSyncProvider>
          <LineChart data={rows} index="month" series={[{ key: "revenue", label: "Revenue" }]} aria-label="Revenue" />
          <BarChart data={rows} index="month" series={[{ key: "orders", label: "Orders" }]} aria-label="Orders" />
        </ChartSyncProvider>
        <ChartBrush
          count={days.length}
          labelOf={(i) => days[i]!}
          values={[3, 5, 4, 8, 6, 9, 7, 5, 6, 8]}
          range={[2, 6]}
          onRangeChange={() => undefined}
        />
      </div>,
      variant,
    );
    await findFigure(/Revenue/);
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the sparkline and brush still render", () => {
  reduceMotion();
  renderUi(
    <>
      <Sparkline values={[1, 3, 2]} aria-label="Trend" />
      {box(<ChartBrush count={4} labelOf={(i) => String(i)} range={[0, 3]} onRangeChange={() => undefined} />)}
    </>,
  );
  expect(screen.getByRole("img", { name: /^Trend/ })).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Start of range" })).toBeInTheDocument();
});

it("defaultBrushRange and clampBrushRange keep a valid, ordered window", () => {
  expect(defaultBrushRange(10)).toEqual([0, 9]);
  expect(defaultBrushRange(10, 0.5)).toEqual([5, 9]);
  expect(defaultBrushRange(10, 0.01)).toEqual([8, 9]);
  expect(defaultBrushRange(1)).toEqual([0, 0]);
  expect(defaultBrushRange(0)).toEqual([0, 0]);
  expect(clampBrushRange([8, 2], 10)).toEqual([2, 8]);
  expect(clampBrushRange([-5, 99], 10)).toEqual([0, 9]);
  expect(clampBrushRange([4, 4], 10, 3)).toEqual([4, 6]);
  expect(clampBrushRange([9, 9], 10, 3)).toEqual([7, 9]);
});

it("Sparkline's accessible name carries a summary of the values, as documented", () => {
  renderUi(<Sparkline values={[4, 6, 5, 8, 7, 10, 12]} aria-label="Weekly signups" />);
  expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Weekly signups: 7 points, min 4, max 12, latest 12");
});

it("Sparkline's summary uses singular for one point, formats numbers for the locale and skips non-numbers", () => {
  const { unmount } = renderUi(<Sparkline values={[12900]} aria-label="Revenue" locale="de" />);
  expect(screen.getByRole("img")).toHaveAttribute(
    "aria-label",
    "Revenue: 1 point, min 12.900, max 12.900, latest 12.900",
  );
  unmount();
  renderUi(<Sparkline values={[1, Number.NaN, 3]} aria-label="Mixed" />);
  expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Mixed: 2 points, min 1, max 3, latest 3");
});

it("Sparkline's summary can be reworded with labels.summary", () => {
  renderUi(
    <Sparkline
      values={[2, 9, 5]}
      aria-label="Trend"
      labels={{
        summary: ({ min, max, latest, format }) => `von ${format(min)} bis ${format(max)}, zuletzt ${format(latest)}`,
      }}
    />,
  );
  expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Trend: von 2 bis 9, zuletzt 5");
});
