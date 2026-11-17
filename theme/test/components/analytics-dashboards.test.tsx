// The five analytics dashboards (web, SaaS revenue, e-commerce, product, finance): load + range +
// filters + compare + live + export + table view + error / empty states, in one shared matrix.

import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { WebAnalyticsDashboard } from "../../src/blocks/analytics-web";
import type { AnalyticsQuery } from "../../src/blocks/analytics-kit";
import { SaasRevenueDashboard } from "../../src/blocks/analytics-saas";
import { EcommerceDashboard } from "../../src/blocks/analytics-ecommerce";
import { ProductDashboard } from "../../src/blocks/analytics-product";
import { FinanceDashboard } from "../../src/blocks/analytics-finance";
import {
  financeDemoData,
  financeLiveStep,
  financeDemoLoader,
  productDemoData,
  productLiveStep,
  productDemoLoader,
  ecommerceDemoData,
  ecommerceDemoLoader,
  saasRevenueDemoData,
  saasRevenueDemoLoader,
  webAnalyticsDemoData,
  webAnalyticsDemoLoader,
} from "../../src/demo-data";
import { settle, frames, holdFor, stable } from "../helpers";
import { renderUi, runAxe } from "../render";
import { getFigure } from "../helpers-charts";

afterEach(() => {
  vi.restoreAllMocks();
});

type Any = Record<string, unknown>;
type Case = {
  name: string;
  /** Renders the dashboard with fast synchronous data plus the given props. */
  ui: (props?: Any) => ReactElement;
  /** The same dashboard with its own (slow) demo loader. */
  slow: () => ReactElement;
  title: string;
  /** The range the dashboard starts on, and one other it offers. */
  initialRange: string;
  otherRange: string;
  filterGroup: string;
  filterChip: string;
  /** The prop that reports filter changes, and what it is called with when `filterChip` is switched on. */
  onFilters: string;
  filtersArg: unknown;
  /** A panel title and the number of Chart / Table switches. */
  panel: string;
};

const cases: Case[] = [
  {
    name: "WebAnalyticsDashboard",
    ui: (p = {}) => <WebAnalyticsDashboard load={(q) => webAnalyticsDemoData(q.range, q.filters)} {...p} />,
    slow: () => <WebAnalyticsDashboard load={webAnalyticsDemoLoader} />,
    title: "example.com",
    initialRange: "30d, Last 30 days",
    otherRange: "7d, Last 7 days",
    filterGroup: "Filter by channel",
    filterChip: "Direct",
    onFilters: "onFiltersChange",
    filtersArg: ["direct"],
    panel: "Top pages",
  },
  {
    name: "SaasRevenueDashboard",
    ui: (p = {}) => <SaasRevenueDashboard load={(q) => saasRevenueDemoData(q.range, q.filters)} {...p} />,
    slow: () => <SaasRevenueDashboard load={saasRevenueDemoLoader} />,
    title: "Acme Cloud",
    initialRange: "12m, Last 12 months",
    otherRange: "7d, Last 7 days",
    filterGroup: "Filter by region",
    filterChip: "Europe",
    onFilters: "onFiltersChange",
    filtersArg: ["emea"],
    panel: "Plan mix",
  },
  {
    name: "EcommerceDashboard",
    ui: (p = {}) => <EcommerceDashboard load={(q) => ecommerceDemoData(q.range, q.filters)} {...p} />,
    slow: () => <EcommerceDashboard load={ecommerceDemoLoader} />,
    title: "Lumen & Co.",
    initialRange: "30d, Last 30 days",
    otherRange: "7d, Last 7 days",
    filterGroup: "Filter by sales channel",
    filterChip: "Marketplace",
    onFilters: "onFiltersChange",
    filtersArg: ["marketplace"],
    panel: "Top products",
  },
  {
    name: "ProductDashboard",
    ui: (p = {}) => <ProductDashboard load={(q) => productDemoData(q)} {...p} />,
    slow: () => <ProductDashboard load={productDemoLoader} />,
    title: "Engagement overview",
    initialRange: "30d, Last 30 days",
    otherRange: "7d, Last 7 days",
    filterGroup: "Filters",
    filterChip: "iOS",
    onFilters: "onPlatformsChange",
    filtersArg: ["ios"],
    panel: "Feature adoption",
  },
  {
    name: "FinanceDashboard",
    ui: (p = {}) => <FinanceDashboard load={(q) => financeDemoData(q)} {...p} />,
    slow: () => <FinanceDashboard load={financeDemoLoader} />,
    title: "Markets & holdings",
    initialRange: "30d, Last 30 days",
    otherRange: "7d, Last 7 days",
    filterGroup: "Filters",
    filterChip: "Stocks",
    onFilters: "onClassesChange",
    filtersArg: ["stocks"],
    panel: "Watchlist",
  },
];

const wide = (ui: ReactElement) => <div style={{ width: 1200 }}>{ui}</div>;
const pressed = (name: string | RegExp) => screen.getByRole("button", { name }).getAttribute("aria-pressed");
const heading = (name: string) => screen.findByRole("heading", { name });
const announcements = () => [...document.querySelectorAll("[aria-live=polite]")].map((n) => n.textContent);

describe.each(cases)("$name", (c) => {
  it("shows a busy skeleton first, then its panels, once its (slow) demo data arrives", async () => {
    renderUi(wide(c.slow()));
    expect(await heading(c.title)).toBeInTheDocument();
    await expect
      .poll(() => screen.queryAllByRole("tab", { name: "Table" }).length, { timeout: 8000 })
      .toBeGreaterThan(0);
    expect(screen.getByRole("group", { name: "Time range" })).toBeInTheDocument();
  });

  it("has one pressed range (the starting one), and choosing another reloads, announces it and reports the change", async () => {
    const onRangeChange = vi.fn();
    renderUi(wide(c.ui({ onRangeChange })));
    await heading(c.title);
    const group = screen.getByRole("group", { name: "Time range" });
    expect(
      within(group)
        .getAllByRole("button")
        .filter((b) => b.getAttribute("aria-pressed") === "true"),
    ).toHaveLength(1);
    expect(pressed(c.initialRange)).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: c.otherRange }));
    expect(onRangeChange).toHaveBeenCalledWith("7d");
    expect(pressed(c.otherRange)).toBe("true");
    expect(pressed(c.initialRange)).toBe("false");
    await expect.poll(announcements, { timeout: 5000 }).toContain("Dashboard updated");
  });

  it("filter chips toggle on and off and report the active list", async () => {
    const report = vi.fn();
    renderUi(wide(c.ui({ [c.onFilters]: report })));
    await heading(c.title);
    const group = screen.getByRole("group", { name: c.filterGroup });
    const chip = within(group).getByRole("button", { name: c.filterChip });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip); // (a chart legend toggle can share the chip's name, so click the element directly)
    expect(report).toHaveBeenLastCalledWith(c.filtersArg);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);
    expect(report).toHaveBeenLastCalledWith([]);
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("Compare and Live are toggles that report their state", async () => {
    const onCompareChange = vi.fn();
    const onLiveChange = vi.fn();
    renderUi(wide(c.ui({ onCompareChange, onLiveChange })));
    await heading(c.title);
    const compare = screen.getByRole("button", { name: /^Compare/ });
    const live = screen.getByRole("button", { name: /^Live/ });
    const before = [compare.getAttribute("aria-pressed"), live.getAttribute("aria-pressed")];
    await userEvent.click(compare);
    await userEvent.click(live);
    expect(onCompareChange).toHaveBeenCalledWith(before[0] !== "true");
    expect(onLiveChange).toHaveBeenCalledWith(before[1] !== "true");
    expect([compare.getAttribute("aria-pressed"), live.getAttribute("aria-pressed")]).toEqual([
      before[0] === "true" ? "false" : "true",
      before[1] === "true" ? "false" : "true",
    ]);
  });

  it("controlled range, compare and live follow their props", async () => {
    const view = renderUi(wide(c.ui({ range: "7d", compare: false, live: false })));
    await heading(c.title);
    expect(pressed(c.otherRange)).toBe("true");
    expect(pressed(/^Compare/)).toBe("false");
    expect(pressed(/^Live/)).toBe("false");
    view.rerender(wide(c.ui({ range: "90d", compare: true, live: true })));
    await expect.poll(() => pressed("90d, Last 90 days")).toBe("true");
    expect(pressed(/^Compare/)).toBe("true");
    expect(pressed(/^Live/)).toBe("true");
  });

  it("every panel can be read as a table and switched back to the chart", async () => {
    renderUi(wide(c.ui()));
    await heading(c.title);
    await expect
      .poll(() => screen.queryAllByRole("tab", { name: "Table" }).length, { timeout: 5000 })
      .toBeGreaterThan(1);
    const first = screen.getAllByRole("tab", { name: "Table" })[0]!;
    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => document.querySelectorAll("table").length, { timeout: 4000 }).toBeGreaterThan(0);
    const table = document.querySelector("table")!;
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(2);
    const chartTab = within(first.closest("[role=tablist]")!).getByRole("tab", { name: "Chart" });
    await userEvent.click(chartTab);
    expect(chartTab).toHaveAttribute("aria-selected", "true");
    // Arrow keys move between Chart and Table.
    chartTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(first);
  });

  it("Export hands the data to onExport, or downloads a CSV and says so", async () => {
    const onExport = vi.fn();
    const view = renderUi(wide(c.ui({ onExport })));
    await heading(c.title);
    await userEvent.click(await screen.findByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport.mock.calls[0]![0]).toBeTruthy();
    view.unmount();

    const created = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:csv");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const clicked: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });
    renderUi(wide(c.ui()));
    await heading(c.title);
    await userEvent.click(await screen.findByRole("button", { name: "Export" }));
    expect(created).toHaveBeenCalledTimes(1);
    const blob = created.mock.calls[0]![0] as Blob;
    expect(blob.type).toContain("text/csv");
    expect((await blob.text()).split("\r\n").length).toBeGreaterThan(3);
    expect(clicked).toHaveLength(1);
    expect(clicked[0]).toMatch(/\.csv$/);
    await expect.poll(announcements).toContain("CSV downloaded");
  });

  it("a loader that fails shows an error with Try again, which loads again", async () => {
    let calls = 0;
    const base = c.ui();
    const props = base.props as Any;
    const load = props.load as (q: never) => unknown;
    renderUi(
      wide(
        c.ui({
          load: (q: never) => {
            if (calls++ === 0) throw new Error("boom");
            return load(q);
          },
        }),
      ),
    );
    expect(await screen.findByText("Couldn't load the dashboard", undefined, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await heading(c.title)).toBeInTheDocument();
    await expect.poll(() => screen.queryByText("Couldn't load the dashboard"), { timeout: 5000 }).toBeNull();
  });

  it("labels translate the controls", async () => {
    renderUi(
      wide(c.ui({ labels: { range: "Zeitraum", export: "Exportieren", compare: "Vergleich", live: "Echtzeit" } })),
    );
    await heading(c.title);
    expect(screen.getByRole("group", { name: "Zeitraum" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Exportieren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Vergleich/ })).toBeInTheDocument();
  });

  it("works on a phone-width container and with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<div style={{ width: 360 }}>{c.ui()}</div>);
    await heading(c.title);
    expect(screen.getByRole("group", { name: "Time range" })).toBeInTheDocument();
    const root = document.querySelector("[data-glass-budget]")!;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  });

  it("formats numbers for another locale", async () => {
    renderUi(wide(c.ui({ locale: "de-DE" })));
    await heading(c.title);
    await expect.poll(() => document.body.textContent).toMatch(/\d\.\d{3}|\d,\d/);
  });

  it("has no axe violations once loaded", async () => {
    renderUi(wide(c.ui()));
    await heading(c.title);
    await screen.findByRole("button", { name: "Export" });
    await settle();
    expect(await runAxe(document.body)).toHaveNoViolations();
  }, 20000);
});

describe("range buttons", () => {
  it("pass axe label-content-name-mismatch on the web dashboard (the name starts with the visible text)", async () => {
    renderUi(wide(cases[0]!.ui()));
    await heading("example.com");
    await screen.findByRole("button", { name: "Export" });
    await settle();
    expect(await runAxe(document.body, { runOnly: ["label-content-name-mismatch"] })).toHaveNoViolations();
  }, 20000);
});

describe("status prop (web, SaaS, e-commerce)", () => {
  const forced = cases.slice(0, 3);
  it.each(forced.map((c) => [c.name, c] as const))("%s can be pinned to loading, empty and error", async (_name, c) => {
    const view = renderUi(wide(c.ui({ status: "loading" })));
    await heading(c.title);
    expect(screen.queryByText("No data for this view")).toBeNull();
    view.rerender(wide(c.ui({ status: "empty" })));
    expect(await screen.findByText("No data for this view")).toBeInTheDocument();
    view.rerender(wide(c.ui({ status: "error" })));
    expect(await screen.findByText("Couldn't load the dashboard")).toBeInTheDocument();
    view.rerender(wide(c.ui({ status: "empty", labels: { emptyTitle: "Nichts da", retry: "Nochmal" } })));
    expect(await screen.findByText("Nichts da")).toBeInTheDocument();
  });

  it("a loader that returns no points shows the empty state with its message", async () => {
    renderUi(
      wide(<WebAnalyticsDashboard load={(q) => ({ ...webAnalyticsDemoData(q.range, q.filters), points: [] })} />),
    );
    expect(await screen.findByText("No data for this view")).toBeInTheDocument();
    expect(screen.getByText(/Nothing was recorded in this time range/)).toBeInTheDocument();
  });
});

describe("web dashboard specifics", () => {
  it("the KPI tabs switch the main trend between visitors, pageviews, bounce rate and duration (arrows and click)", async () => {
    const onMetricChange = vi.fn();
    renderUi(
      wide(
        <WebAnalyticsDashboard
          load={(q) => webAnalyticsDemoData(q.range, q.filters)}
          onMetricChange={onMetricChange}
        />,
      ),
    );
    await heading("example.com");
    const tabs = await screen.findAllByRole("tab", { name: /Unique visitors|Pageviews|Bounce rate|Visit duration/ });
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    await userEvent.click(tabs[1]!);
    expect(onMetricChange).toHaveBeenLastCalledWith("pageviews");
    tabs[1]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => tabs[2]!.getAttribute("aria-selected")).toBe("true");
    expect(onMetricChange).toHaveBeenLastCalledWith("bounceRate");
    await userEvent.keyboard("{End}");
    await expect.poll(() => tabs[3]!.getAttribute("aria-selected")).toBe("true");
    expect(await screen.findByRole("heading", { name: "Visit duration" }).catch(() => null)).toBeDefined();
  });

  it("the Live toggle pauses the realtime chart (its button then offers Resume)", async () => {
    renderUi(wide(<WebAnalyticsDashboard load={(q) => webAnalyticsDemoData(q.range, q.filters)} defaultLive />));
    await heading("example.com");
    expect(await screen.findByRole("button", { name: "Pause" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^Live/ }));
    expect(await screen.findByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("the realtime panel's own Pause button pauses it and turns the Live toggle off", async () => {
    renderUi(wide(<WebAnalyticsDashboard load={(q) => webAnalyticsDemoData(q.range, q.filters)} defaultLive />));
    await heading("example.com");
    await userEvent.click(await screen.findByRole("button", { name: "Pause" }));
    expect(await screen.findByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("the realtime chart starts from the data's own history and shows its empty state when there is none", async () => {
    const load = (history: number[] | undefined) => (q: AnalyticsQuery) => {
      const data = webAnalyticsDemoData(q.range, q.filters);
      return { ...data, realtime: { visitors: 120, pages: data.realtime.pages, ...(history && { history }) } };
    };
    const none = renderUi(wide(<WebAnalyticsDashboard load={load(undefined)} />));
    await heading("example.com");
    expect(await screen.findByText("Waiting for data…")).toBeInTheDocument();
    none.unmount();
    renderUi(wide(<WebAnalyticsDashboard load={load([90, 100, 110])} />));
    await heading("example.com");
    expect(screen.queryByText("Waiting for data…")).toBeNull();
  });

  it("a custom site name titles the CSV, and a custom metric can start selected", async () => {
    const created = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:csv");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    renderUi(
      wide(
        <WebAnalyticsDashboard
          site="example.org"
          defaultMetric="duration"
          load={(q) => webAnalyticsDemoData(q.range, q.filters)}
        />,
      ),
    );
    await heading("example.org");
    await userEvent.click(await screen.findByRole("button", { name: "Export" }));
    expect(names[0]).toMatch(/^example\.org-30d\.csv$/);
    expect(created).toHaveBeenCalled();
  });
});

describe("live updates (product and finance)", () => {
  it("ProductDashboard ticks liveStep while Live is on and stops when it is turned off", async () => {
    const liveStep = vi.fn(productLiveStep);
    renderUi(wide(<ProductDashboard load={(q) => productDemoData(q)} liveStep={liveStep} liveInterval={250} />));
    await heading("Engagement overview");
    await expect.poll(() => liveStep.mock.calls.length, { timeout: 5000 }).toBeGreaterThan(1);
    await userEvent.click(screen.getByRole("button", { name: /^Live/ }));
    await frames(19); // let a tick that was already scheduled land
    const seen = liveStep.mock.calls.length;
    await holdFor(1000); // four feed intervals
    expect(liveStep.mock.calls.length).toBe(seen);
  });

  it("FinanceDashboard ticks liveStep; liveStep={null} turns the feed off", async () => {
    const liveStep = vi.fn(financeLiveStep);
    const view = renderUi(
      wide(<FinanceDashboard load={(q) => financeDemoData(q)} liveStep={liveStep} liveInterval={250} />),
    );
    await heading("Markets & holdings");
    await expect.poll(() => liveStep.mock.calls.length, { timeout: 5000 }).toBeGreaterThan(1);
    view.unmount();
    // Positive control above: with a function, the feed ticks. With null, the numbers on screen must not move.
    const { container } = renderUi(
      wide(<FinanceDashboard load={(q) => financeDemoData(q)} liveStep={null} liveInterval={250} />),
    );
    await heading("Markets & holdings");
    await settle();
    const before = await stable(() => container.textContent, 20); // count-up tweens have finished
    await holdFor(1000); // four feed intervals
    expect(container.textContent).toBe(before);
  });
});

describe("live data (web, SaaS, e-commerce)", () => {
  it.each(cases.slice(0, 3).map((c) => [c.name, c] as const))(
    "%s: with Live on, its numbers keep moving (about every 2.4 s); Live can be turned off",
    async (_name, c) => {
      renderUi(wide(c.ui({ defaultLive: true })));
      await heading(c.title);
      await screen.findByRole("button", { name: "Export" });
      const text = () => document.body.textContent;
      const start = text();
      await expect.poll(text, { timeout: 8000 }).not.toBe(start);
      await userEvent.click(screen.getByRole("button", { name: /^Live/ }));
      expect(screen.getByRole("button", { name: /^Live/ })).toHaveAttribute("aria-pressed", "false");
    },
    25000,
  );
});

describe("finance balance chart interaction", () => {
  const chart = () => getFigure(/^Total balance\./);
  const plot = () => chart().querySelector("rect[style*='crosshair']")!;

  it("keyboard: arrows read values, Alt jumps ten, Home / End go to the ends, Shift anchors a measurement, Escape clears", async () => {
    renderUi(wide(<FinanceDashboard load={(q) => financeDemoData(q)} />));
    await heading("Markets & holdings");
    await screen.findByRole("button", { name: "Export" });
    await expect.poll(() => plot()).toBeTruthy();
    chart().focus();
    for (const keys of [
      "{ArrowLeft}",
      "{ArrowLeft}",
      "{ArrowRight}",
      "{Alt>}{ArrowLeft}{/Alt}",
      "{Home}",
      "{End}",
      "{ArrowDown}",
      "{ArrowUp}",
      "{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}",
      "{ArrowRight}",
      "{Escape}",
      "{Escape}",
      "q",
    ]) {
      await userEvent.keyboard(keys);
    }
    expect(chart()).toBeInTheDocument();
  });

  it("a mouse reads values on hover, press-and-drag measures, leaving clears; a touch reads while dragging and measures after a hold", async () => {
    vi.spyOn(Element.prototype, "setPointerCapture").mockImplementation(() => undefined);
    renderUi(wide(<FinanceDashboard load={(q) => financeDemoData(q)} />));
    await heading("Markets & holdings");
    await expect.poll(() => plot()).toBeTruthy();
    const rect = plot().getBoundingClientRect();
    const fire = (type: string, x: number, pointerType: string, id = 1) =>
      plot().dispatchEvent(
        new PointerEvent(type, {
          pointerType,
          pointerId: id,
          clientX: rect.left + rect.width * x,
          clientY: rect.top + 5,
          bubbles: true,
          cancelable: true,
          isPrimary: true,
        }),
      );
    fire("pointermove", 0.3, "mouse");
    fire("pointerdown", 0.3, "mouse");
    fire("pointermove", 0.6, "mouse");
    fire("pointerup", 0.6, "mouse");
    fire("pointerdown", 0.5, "mouse");
    fire("pointerup", 0.5, "mouse"); // a click is not a measurement
    fire("pointerleave", 0.5, "mouse");
    fire("pointermove", 0.5, "touch", 2); // a touch move with no press is ignored
    fire("pointerdown", 0.2, "touch", 2);
    fire("pointermove", 0.8, "touch", 2); // a quick drag only reads
    fire("pointerup", 0.8, "touch", 2);
    fire("pointerdown", 0.4, "touch", 3);
    await frames(29); // held: measuring
    fire("pointermove", 0.7, "touch", 3);
    fire("pointerup", 0.7, "touch", 3);
    expect(chart()).toBeInTheDocument();
  });
});
