// analytics-kit: the pure helpers (seeded randomness, range points, CSV, structural sharing), the data
// hooks (useDashboardData, useAnalyticsDashboard, useLiveTicker, useLoopPlayback,
// useCascade, useControllable), adaptive glass, and the small building blocks.

import { useControllable } from "../../src/hooks/use-controllable";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, renderHook, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  ANALYTICS_RANGES,
  AnalyticsShell,
  AnalyticsState,
  Cascade,
  DeltaBadge,
  KpiStrip,
  LiveDot,
  PanelSkeleton,
  RollingNumber,
  changeRatio,
  defaultAnalyticsLabels,
  exportCsv,
  formatChange,
  mergeLabels,
  mergeDashboardLabels,
  rangeLength,
  rangePoints,
  shareStructure,
  useAdaptiveGlass,
  useAnalyticsDashboard,
  useCascade,
  useDashboardData,
  useLiveTicker,
  type AnalyticsLoader,
  type AnalyticsQuery,
} from "../../src/blocks/analytics-kit";
import {
  DEMO_NOW,
  createRng,
  demoSeries,
  hashSeed,
  seededRandom,
  simulateLatency,
  withLatency,
} from "../../src/demo-data";
import { useLoopPlayback } from "../../src/motion/gate";
import { renderUi, runAxe } from "../render";
import { settle, frames, holdFor } from "../helpers";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  for (const key of ["deviceMemory", "hardwareConcurrency", "connection"]) Reflect.deleteProperty(navigator, key);
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("seeded randomness", () => {
  it("seededRandom is deterministic, in [0, 1) and differs by seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const first = Array.from({ length: 5 }, () => a());
    expect(first).toEqual(Array.from({ length: 5 }, () => b()));
    for (const v of first) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(seededRandom(43)()).not.toBe(first[0]);
  });

  it("hashSeed is stable, order-sensitive and handles numbers and strings", () => {
    expect(hashSeed("a", 1)).toBe(hashSeed("a", 1));
    expect(hashSeed("a", 1)).not.toBe(hashSeed(1, "a"));
    expect(hashSeed("ab", "c")).not.toBe(hashSeed("a", "bc"));
    expect(Number.isInteger(hashSeed())).toBe(true);
  });

  it("createRng gives uniform and normal draws", () => {
    const rng = createRng(7);
    const normals = Array.from({ length: 500 }, () => rng.normal());
    const mean = normals.reduce((a, b) => a + b, 0) / normals.length;
    expect(Math.abs(mean)).toBeLessThan(0.2);
    expect(rng.next()).toBeGreaterThanOrEqual(0);
  });
});

describe("range points + demo series", () => {
  it("each range has the right number of points, ending at the demo clock, with labels", () => {
    for (const range of ANALYTICS_RANGES) {
      const points = rangePoints(range, "en-US", DEMO_NOW);
      expect(points).toHaveLength(rangeLength(range));
      expect(points.at(-1)!.date.getTime()).toBeLessThanOrEqual(DEMO_NOW);
      expect(new Set(points.map((p) => p.key)).size).toBe(points.length);
      for (const p of points) {
        expect(p.label).toBeTruthy();
        expect(p.long).toBeTruthy();
      }
    }
    expect(rangeLength("90d")).toBe(90);
    expect(rangePoints("24h", "en-US", DEMO_NOW)[0]!.label).toMatch(/\d/);
    expect(rangePoints("7d", "en-US", DEMO_NOW).map((p) => p.label)).toHaveLength(7);
    expect(rangePoints("12m", "en-US", DEMO_NOW).at(-1)!.long).toMatch(/October 2026/);
    expect(rangePoints("30d", "en-US", Date.UTC(2026, 0, 31)).at(-1)!.label).toBe("Jan 31");
  });

  it("falls back to English for an invalid locale tag", () => {
    expect(rangePoints("7d", "not a locale!!", DEMO_NOW)).toHaveLength(7);
  });

  it("demoSeries is deterministic per seed, non-negative and follows growth", () => {
    const a = demoSeries("30d", { seed: 1, base: 1000 });
    expect(a).toEqual(demoSeries("30d", { seed: 1, base: 1000 }));
    expect(a).toHaveLength(30);
    expect(a.every((v) => v >= 0)).toBe(true);
    const growing = demoSeries("90d", { seed: 2, base: 1000, growth: 1, noise: 0, rhythm: 0 });
    expect(growing.at(-1)!).toBeGreaterThan(growing[0]!);
    for (const range of ANALYTICS_RANGES)
      expect(demoSeries(range, { seed: 3, base: 50 })).toHaveLength(rangeLength(range));
  });
});

describe("latency + csv", () => {
  it("simulateLatency resolves with the made value, rejects when aborted (before or during), and rejects when make throws", async () => {
    const live = new AbortController();
    await expect(simulateLatency(live.signal, () => 5, 5)).resolves.toBe(5);
    const early = new AbortController();
    early.abort();
    await expect(simulateLatency(early.signal, () => 1, 5)).rejects.toMatchObject({ name: "AbortError" });
    const during = new AbortController();
    const pending = simulateLatency(during.signal, () => 1, 200);
    during.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await expect(
      simulateLatency(
        live.signal,
        () => {
          throw new Error("bad");
        },
        1,
      ),
    ).rejects.toThrow("bad");
    await expect(
      simulateLatency(
        live.signal,
        () => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error -- the test: a non-Error throw
          throw "text";
        },
        1,
      ),
    ).rejects.toThrow("text");
    await expect(withLatency("x", 1)).resolves.toBe("x");
  });

  it("exportCsv downloads an escaped, formula-safe UTF-8 CSV", async () => {
    const blobs: Blob[] = [];
    vi.spyOn(URL, "createObjectURL").mockImplementation((b) => (blobs.push(b as Blob), "blob:x"));
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    exportCsv(
      "report",
      ["Name", "Value"],
      [
        ["=SUM(A1)", 1],
        ['Say "hi", ok', null],
        ["plain", true],
      ],
    );
    exportCsv(
      "rows.csv",
      ["A", ""],
      [
        [1, 2],
        ["@x", "line\nbreak"],
      ],
    );
    expect(names).toEqual(["report.csv", "rows.csv"]);
    const first = await blobs[0]!.text();
    expect(first).toContain("'=SUM(A1)");
    expect(first).toContain('"Say ""hi"", ok"');
    expect(first).toContain("plain,true");
    const second = await blobs[1]!.text();
    expect(second.split("\r\n")[0]).toContain("A,");
    expect(second).toContain("'@x");
    expect(second).toContain('"line\nbreak"');
  });
});

describe("shareStructure", () => {
  it("returns the previous object when nothing changed, and shares unchanged branches", () => {
    const prev = { a: [1, 2, { x: 1 }], b: { c: "s" }, d: new Date(5) };
    const same = shareStructure(prev, { a: [1, 2, { x: 1 }], b: { c: "s" }, d: new Date(5) });
    expect(same).toBe(prev);
    const next = shareStructure(prev, { a: [1, 2, { x: 1 }], b: { c: "t" }, d: new Date(5) });
    expect(next).not.toBe(prev);
    expect(next.a).toBe(prev.a);
    expect(next.d).toBe(prev.d);
    expect(next.b).not.toBe(prev.b);
  });

  it("handles different lengths, new keys, primitives, nulls and class instances", () => {
    expect(shareStructure([1, 2], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(shareStructure({ a: 1 }, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
    expect(shareStructure(1, 2)).toBe(2);
    expect(shareStructure(null, { a: 1 })).toEqual({ a: 1 });
    expect(shareStructure(NaN, NaN)).toBeNaN();
    const date = new Date(9);
    expect(shareStructure(new Date(9), date)).not.toBe(date);
    expect(shareStructure(Object.create(null), Object.create(null))).toEqual({});
  });
});

describe("change formatting + labels", () => {
  it("changeRatio guards against missing, zero and non-finite baselines", () => {
    expect(changeRatio(120, 100)).toBeCloseTo(0.2);
    expect(changeRatio(80, 100)).toBeCloseTo(-0.2);
    expect(changeRatio(5, -10)).toBeCloseTo(1.5);
    for (const previous of [null, undefined, 0, NaN, Infinity]) expect(changeRatio(1, previous)).toBeNull();
    expect(changeRatio(NaN, 1)).toBeNull();
  });

  it("formatChange signs, uses a real minus, and follows the locale", () => {
    expect(formatChange(0.123, "en-US")).toBe("+12.3%");
    expect(formatChange(-0.05, "en-US")).toBe("−5%");
    expect(formatChange(0, "en-US")).toBe("0%");
    expect(formatChange(0.5, "de-DE")).toMatch(/50\s?%/);
    expect(formatChange(0.1)).toBe("+10%");
  });

  it("mergeLabels overrides strings and the range maps one level deep; no overrides returns the base", () => {
    expect(mergeLabels(defaultAnalyticsLabels)).toBe(defaultAnalyticsLabels);
    const merged = mergeLabels(defaultAnalyticsLabels, { export: "Exportieren", ranges: { "7d": "7T" } as never });
    expect(merged.export).toBe("Exportieren");
    expect(merged.ranges["7d"]).toBe("7T");
    expect(merged.ranges["30d"]).toBe("30d");
    expect(merged.rangeNames["7d"]).toBe("Last 7 days");
    expect(mergeDashboardLabels({ retry: "Nochmal" }).retry).toBe("Nochmal");
    expect(defaultAnalyticsLabels.viewAs("Revenue")).toBe("Revenue: view as");
    expect(defaultAnalyticsLabels.change("up", "+12%")).toContain("Up 12%");
    expect(defaultAnalyticsLabels.change("down", "−3%")).toContain("Down 3%");
    expect(defaultAnalyticsLabels.change("flat", "0%")).toContain("No change");
  });
});

describe("useControllable", () => {
  it("uncontrolled: holds its own state and reports changes; setting the same value is ignored", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(undefined, 1, onChange));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("controlled: only follows the value and just reports", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ v }) => useControllable<number>(v, 0, onChange), {
      initialProps: { v: 5 },
    });
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(9);
    rerender({ v: 9 });
    expect(result.current[0]).toBe(9);
  });
});

/** The range + filters query every ready-made dashboard asks `useDashboardData` for. */
const useAnalyticsData = <T,>(load: AnalyticsLoader<T>, query: AnalyticsQuery) =>
  useDashboardData(load, query, `${query.range}\u0002${query.filters.join("\u0001")}`);

describe("useDashboardData with range and filter queries", () => {
  const q = (range: AnalyticsQuery["range"] = "30d", filters: string[] = []): AnalyticsQuery => ({ range, filters });

  it("loads for a query, reloads when the range or filters change, and aborts the stale request", async () => {
    const seen: { range: string; filters: readonly string[]; signal: AbortSignal }[] = [];
    const load = vi.fn((query: AnalyticsQuery, signal: AbortSignal) => {
      seen.push({ ...query, signal });
      return Promise.resolve(`${query.range}|${query.filters.join(",")}`);
    });
    const { result, rerender } = renderHook(({ query }) => useAnalyticsData(load, query), {
      initialProps: { query: q() },
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await expect.poll(() => result.current.data).toBe("30d|");
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ range: "30d", filters: [] });

    rerender({ query: q("7d", ["a", "b"]) });
    expect(result.current.loading).toBe(true);
    expect(seen[0]!.signal.aborted).toBe(true);
    await expect.poll(() => result.current.data).toBe("7d|a,b");
    expect(seen.at(-1)!.filters).toEqual(["a", "b"]);
  });

  it("reports an error (a rejected promise or a thrown error), clears it on retry, and update patches the data", async () => {
    let fail = true;
    const load = vi.fn((): Promise<number> => {
      if (fail) return Promise.reject(new Error("down"));
      return Promise.resolve(10);
    });
    const { result } = renderHook(() => useAnalyticsData(load, q()));
    await expect.poll(() => result.current.error).toBeInstanceOf(Error);
    act(() => result.current.update((n) => n + 1)); // nothing to patch while there is an error
    fail = false;
    act(() => result.current.retry());
    expect(result.current.loading).toBe(true);
    await expect.poll(() => result.current.data).toBe(10);
    expect(result.current.error).toBeNull();
    act(() => result.current.update((n) => n + 5));
    await expect.poll(() => result.current.data).toBe(15);
  });

  it("a rejection with no reason still becomes an Error; an aborted load is ignored", async () => {
    const { result, unmount } = renderHook(() =>
      useAnalyticsData(
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the test: a rejection with no reason
        () => Promise.reject(undefined),
        q(),
      ),
    );
    await expect.poll(() => result.current.error).toBeInstanceOf(Error);
    unmount();
    let resolve!: (v: string) => void;
    const slow = renderHook(() => useAnalyticsData(() => new Promise<string>((r) => (resolve = r)), q()));
    await frames(2); // the load starts in a microtask after the effect
    slow.unmount();
    resolve("late");
    await frames(2);
  });
});

describe("useDashboardData", () => {
  it("loads, keeps old data while reloading, retries after an error, and update patches ready data only", async () => {
    let calls = 0;
    const { result, rerender } = renderHook(
      ({ key }) =>
        useDashboardData(
          (n: number) => {
            calls += 1;
            if (n < 0) throw new Error("neg");
            return Promise.resolve({ n });
          },
          Number(key),
          key,
        ),
      { initialProps: { key: "1" } },
    );
    expect(result.current.status).toBe("loading");
    act(() => result.current.update((d) => d)); // not ready yet: ignored
    await expect.poll(() => result.current.status).toBe("ready");
    expect(result.current.data).toEqual({ n: 1 });
    rerender({ key: "2" });
    expect(result.current.data).toEqual({ n: 1 }); // old data stays while loading
    await expect.poll(() => result.current.data).toEqual({ n: 2 });
    act(() => result.current.update((d) => ({ n: d.n + 10 })));
    await expect.poll(() => result.current.data).toEqual({ n: 12 });

    rerender({ key: "-1" });
    await expect.poll(() => result.current.status).toBe("error");
    expect(result.current.error).toBeInstanceOf(Error);
    rerender({ key: "3" });
    await expect.poll(() => result.current.status).toBe("ready");
    const before = calls;
    act(() => result.current.retry());
    await expect.poll(() => calls).toBeGreaterThan(before);
  });
});

describe("useCascade + Cascade", () => {
  it("shows a new value after index * step ms", async () => {
    const { result, rerender } = renderHook(({ v }) => useCascade(v, 2, 30), { initialProps: { v: "a" } });
    expect(result.current).toBe("a");
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    await expect.poll(() => result.current).toBe("b");
  });

  it("Cascade renders children with the delayed value", async () => {
    const view = render(
      <Cascade value={1} index={1} step={20}>
        {(v) => <p>value {v}</p>}
      </Cascade>,
    );
    expect(screen.getByText("value 1")).toBeInTheDocument();
    view.rerender(
      <Cascade value={2} index={1} step={20}>
        {(v) => <p>value {v}</p>}
      </Cascade>,
    );
    expect(await screen.findByText("value 2")).toBeInTheDocument();
  });
});

describe("useLiveTicker + useLoopPlayback", () => {
  function Host({ enabled, onTick, interval }: { enabled: boolean; onTick: (n: number) => void; interval?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const running = useLiveTicker(enabled, onTick, { ref, interval });
    const near = useLoopPlayback(ref, { respectReducedMotion: false });
    return (
      <div
        ref={ref}
        data-testid="host"
        data-running={String(running)}
        data-near={String(near)}
        style={{ height: 20 }}
      />
    );
  }

  it("ticks (1, 2, 3...) at the interval (never faster than 250 ms) only while enabled, on screen and the tab visible", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const onTick = vi.fn<(tick: number) => void>();
    const view = render(<Host enabled onTick={onTick} interval={100} />);
    await vi.waitFor(() => expect(screen.getByTestId("host").dataset.running).toBe("true"));
    expect(screen.getByTestId("host").dataset.near).toBe("true");
    vi.advanceTimersByTime(260);
    expect(onTick.mock.calls.map((c) => c[0])).toEqual([1]); // 100 ms is raised to 250
    vi.advanceTimersByTime(500);
    expect(onTick.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);

    view.rerender(<Host enabled={false} onTick={onTick} interval={100} />);
    await vi.waitFor(() => expect(screen.getByTestId("host").dataset.running).toBe("false"));
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(3);

    view.rerender(<Host enabled onTick={onTick} interval={2400} />);
    await vi.waitFor(() => expect(screen.getByTestId("host").dataset.running).toBe("true"));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.waitFor(() => expect(screen.getByTestId("host").dataset.running).toBe("false"));
    expect(screen.getByTestId("host").dataset.near).toBe("false");
  });

  it("does not run for an element far off screen", async () => {
    render(
      <div>
        <div style={{ height: 6000 }} />
        <Host enabled onTick={vi.fn()} />
      </div>,
    );
    await frames(10);
    expect(screen.getByTestId("host").dataset.running).toBe("false");
  });
});

describe("useAnalyticsDashboard", () => {
  type Data = { items: number[] };
  const load = (q: AnalyticsQuery): Data => ({ items: Array.from({ length: q.range === "7d" ? 7 : 30 }, (_, i) => i) });

  function Dash(props: Partial<Parameters<typeof useAnalyticsDashboard<Data>>[0]> & { step?: boolean }) {
    const { rootRef, ...dash } = useAnalyticsDashboard<Data>(
      { load, ...props },
      {
        liveStep: props.step ? (prev, tick) => ({ items: [...prev.items, 1000 + tick] }) : undefined,
        liveInterval: 250,
        defaults: { range: "30d", live: true, compare: false },
        isEmpty: (d) => d.items.length === 0,
      },
    );
    return (
      <div
        ref={rootRef}
        data-testid="dash"
        data-status={dash.status}
        data-range={dash.range}
        data-live={String(dash.live)}
        data-compare={String(dash.compare)}
        data-filters={dash.filters.join(",")}
        data-running={String(dash.running)}
        data-count={dash.data?.items.length ?? 0}
        data-busy={String(dash.busy)}
      >
        <button onClick={() => dash.setRange("7d")}>range</button>
        <button onClick={() => dash.setLive(!dash.live)}>live</button>
        <button onClick={() => dash.setCompare(!dash.compare)}>compare</button>
        <button onClick={() => dash.setFilters(["x"])}>filters</button>
      </div>
    );
  }
  const dash = () => screen.getByTestId("dash").dataset;

  it("loads with the defaults, reports ready, and changes range / live / compare / filters", async () => {
    const onRangeChange = vi.fn();
    render(<Dash onRangeChange={onRangeChange} />);
    expect(dash().status).toBe("loading");
    await expect.poll(() => dash().status).toBe("ready");
    expect([dash().range, dash().live, dash().compare, dash().count]).toEqual(["30d", "true", "false", "30"]);
    await userEvent.click(screen.getByRole("button", { name: "range" }));
    expect(onRangeChange).toHaveBeenCalledWith("7d");
    await expect.poll(() => dash().count).toBe("7");
    await userEvent.click(screen.getByRole("button", { name: "live" }));
    await userEvent.click(screen.getByRole("button", { name: "compare" }));
    await userEvent.click(screen.getByRole("button", { name: "filters" }));
    expect([dash().live, dash().compare, dash().filters]).toEqual(["false", "true", "x"]);
  });

  it("pins the status (loading / empty / error) whatever the data says, and detects empty data", async () => {
    const view = render(<Dash status="empty" />);
    expect(dash().status).toBe("empty");
    view.rerender(<Dash status="error" />);
    expect(dash().status).toBe("error");
    view.rerender(<Dash status="loading" />);
    expect(dash().status).toBe("loading");
    view.rerender(<Dash load={() => ({ items: [] })} />);
    await expect.poll(() => dash().status).toBe("empty");
    view.rerender(<Dash load={() => Promise.reject(new Error("x"))} defaultRange="90d" activeFilters={["z"]} />);
    await expect.poll(() => dash().status).toBe("error");
  });

  it("a live step feeds new data while running and stops when turned off", async () => {
    render(<Dash step />);
    await expect.poll(() => dash().status).toBe("ready");
    await expect.poll(() => Number(dash().count), { timeout: 4000 }).toBeGreaterThan(30);
    expect(dash().running).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "live" }));
    await expect.poll(() => dash().running).toBe("false");
    await frames(4);
    const stopped = dash().count;
    await holdFor(600);
    expect(dash().count).toBe(stopped);
  });
});

describe("useAdaptiveGlass", () => {
  const def = (key: string, value: unknown) => Object.defineProperty(navigator, key, { value, configurable: true });
  function Host({ mode }: { mode?: "auto" | "full" | "flat" }) {
    const ref = useRef<HTMLDivElement>(null);
    const budget = useAdaptiveGlass(ref, mode);
    return <div ref={ref} data-testid="g" data-budget={budget} style={{ height: 50 }} />;
  }
  const budget = () => screen.getByTestId("g").dataset.budget;

  it("full on a capable device; flat or full when forced", () => {
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    const view = render(<Host />);
    expect(budget()).toBe("full");
    view.rerender(<Host mode="flat" />);
    expect(budget()).toBe("flat");
    view.rerender(<Host mode="full" />);
    expect(budget()).toBe("full");
  });

  it("flat on a weak device, with Lite glass, with a remembered flat decision, or Save-Data", () => {
    def("deviceMemory", 2);
    const weak = render(<Host />);
    expect(budget()).toBe("flat");
    weak.unmount();
    Reflect.deleteProperty(navigator, "deviceMemory");
    def("hardwareConcurrency", 12);
    document.documentElement.setAttribute("data-glass", "lite");
    const lite = render(<Host />);
    expect(budget()).toBe("flat");
    lite.unmount();
    document.documentElement.removeAttribute("data-glass");
    sessionStorage.setItem("sheen:dashboard-glass", "flat");
    const stored = render(<Host />);
    expect(budget()).toBe("flat");
    stored.unmount();
    sessionStorage.clear();
    def("connection", { saveData: true });
    render(<Host />);
    expect(budget()).toBe("flat");
  });

  it("an unreadable session store counts as 'not flat'", () => {
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render(<Host />);
    expect(budget()).toBe("full");
  });

  it("measures frames while it scrolls and goes flat (remembered) after two slow seconds", async () => {
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    let clock = 50_000;
    vi.spyOn(performance, "now").mockImplementation(() => clock);
    let queue: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => queue.push(cb));
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      queue = [];
    });
    render(<Host />);
    // requestAnimationFrame is stubbed here, so wait on the real signal: the observer's first report (the hook's
    // own observer was created first, so its callback has run by the time this one fires).
    await new Promise<void>((done) => {
      const io = new IntersectionObserver(() => {
        io.disconnect();
        done();
      });
      io.observe(screen.getByTestId("g"));
    });
    const second = () => {
      window.dispatchEvent(new Event("scroll"));
      for (let i = 0; i < 28; i++) {
        clock += 40; // 25 fps: every frame is late
        queue.shift()?.(clock);
        if (queue.length === 0 && i < 27) queue.push(() => undefined);
      }
    };
    second();
    expect(budget()).toBe("full");
    // Each call is one more slow second on the injected clock; under load the first may land before the hook is
    // watching, so keep feeding slow seconds until it decides (it needs two consecutive bad ones).
    await expect
      .poll(() => {
        second();
        return budget();
      })
      .toBe("flat");
    expect(sessionStorage.getItem("sheen:dashboard-glass")).toBe("flat");
  });

  it("pointer movement over the dashboard wakes the frame watcher", () => {
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    render(<Host />);
    screen.getByTestId("g").dispatchEvent(new Event("pointermove"));
    expect(raf).toHaveBeenCalled();
  });
});

describe("small building blocks", () => {
  it("DeltaBadge: up / down / flat / missing, which direction is good, custom text and label", () => {
    const { container, rerender } = render(<DeltaBadge ratio={0.124} locale="en-US" />);
    const badge = () => container.querySelector<HTMLElement>("[data-slot=delta-badge]");
    expect(badge()).toHaveAttribute("data-direction", "up");
    expect(badge()).toHaveTextContent("+12.4%");
    expect(badge()!.className).toContain("success");
    rerender(<DeltaBadge ratio={0.124} goodWhen="down" />);
    expect(badge()!.className).toContain("danger");
    rerender(<DeltaBadge change={-0.2} />);
    expect(badge()).toHaveAttribute("data-direction", "down");
    expect(badge()).toHaveTextContent("Down 20%");
    rerender(<DeltaBadge ratio={0.0001} />);
    expect(badge()).toHaveAttribute("data-direction", "flat");
    expect(badge()).toHaveTextContent("No change");
    rerender(<DeltaBadge ratio={null} />);
    expect(badge()).toBeNull();
    rerender(<DeltaBadge ratio={null}>n/a</DeltaBadge>);
    expect(badge()).toHaveTextContent("n/a");
    rerender(<DeltaBadge ratio={0.5} srLabel={(d, t) => `${d}: ${t}`} />);
    expect(badge()).toHaveTextContent("up: +50%");
  });

  it("RollingNumber formats with a function or Intl options and shows the final value when not playing", () => {
    const { container, rerender } = render(
      <RollingNumber value={1234.5} format={(n) => `#${Math.round(n)}`} play={false} />,
    );
    expect(container).toHaveTextContent("#1235");
    rerender(
      <RollingNumber
        value={1234.5}
        format={{ maximumFractionDigits: 0 }}
        locale="en-US"
        play={false}
        className="big"
      />,
    );
    expect(container).toHaveTextContent("1,235");
    rerender(<RollingNumber value={7} play={false} />);
    expect(container).toHaveTextContent("7");
  });

  it("RollingNumber rolls to a new value when played", async () => {
    const { container, rerender } = render(<RollingNumber value={10} play rollIn={false} />);
    rerender(<RollingNumber value={20} play duration={0.1} />);
    await expect.poll(() => container.textContent).toContain("20");
  });

  it("KpiStrip: loading skeleton, items with compare, selection (click and keyboard) and trends", async () => {
    const onSelect = vi.fn();
    const items = [
      { id: "a", label: "Visitors", value: 1200, previous: 1000, trend: [1, 3, 2, 5] },
      {
        id: "b",
        label: "Bounce",
        value: 0.4,
        previous: 0.5,
        format: { style: "percent" as const },
        goodWhen: "down" as const,
      },
      { id: "c", label: "Plain", value: 5, previous: null, hint: "A hint" },
    ];
    const view = render(<KpiStrip items={null} loading />);
    expect(view.container.querySelector("[aria-busy=true], [data-loading]")).not.toBeNull();
    function Strip() {
      const [selected, setSelected] = useState("a");
      return (
        <KpiStrip
          items={items}
          compare
          selected={selected}
          onSelect={(id) => {
            onSelect(id);
            setSelected(id);
          }}
          controls="panel"
          locale="en-US"
        />
      );
    }
    view.unmount();
    render(<Strip />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-controls", "panel");
    expect(screen.getAllByText(/^vs .+ before$/).length).toBeGreaterThan(0);
    await userEvent.click(tabs[1]!);
    expect(onSelect).toHaveBeenLastCalledWith("b");
    await expect.poll(() => tabs[1]!.getAttribute("aria-selected")).toBe("true");
    tabs[1]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenLastCalledWith("c");
    await expect.poll(() => document.activeElement).toBe(tabs[2]);
    await userEvent.keyboard("{ArrowRight}"); // wraps
    expect(onSelect).toHaveBeenLastCalledWith("a");
    await userEvent.keyboard("{End}");
    expect(onSelect).toHaveBeenLastCalledWith("c");
    await userEvent.keyboard("{Home}");
    expect(onSelect).toHaveBeenLastCalledWith("a");
    await userEvent.keyboard("{ArrowLeft}");
    expect(onSelect).toHaveBeenLastCalledWith("c");
    await userEvent.keyboard("x"); // other keys do nothing
    cleanup();
    render(<KpiStrip items={items} locale="en-US" busy aria-label="Numbers" />);
    expect(screen.getByRole("group", { name: "Numbers" })).toBeTruthy();
  });

  it("AnalyticsState shows empty and error messages; error offers Try again only with a handler", async () => {
    const onRetry = vi.fn();
    const view = render(<AnalyticsState kind="error" labels={defaultAnalyticsLabels} onRetry={onRetry} />);
    expect(screen.getByText("Couldn't load the dashboard")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    view.rerender(<AnalyticsState kind="error" labels={defaultAnalyticsLabels} />);
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    view.rerender(<AnalyticsState kind="empty" labels={defaultAnalyticsLabels} />);
    expect(screen.getByText("No data for this view")).toBeInTheDocument();
    expect(screen.getByText(/Nothing was recorded/)).toBeInTheDocument();
  });

  it("PanelSkeleton and LiveDot render decoratively", () => {
    const { container } = render(
      <>
        <PanelSkeleton height={120} className="sk" />
        <PanelSkeleton height={60} pulse={false} />
        <LiveDot on className="dot" />
        <LiveDot on={false} />
      </>,
    );
    expect(container.querySelector(".sk")).toHaveStyle({ height: "120px" });
    expect(container.querySelector(".dot")).toBeTruthy();
  });
});

describe("AnalyticsShell", () => {
  function Shell(props: Partial<React.ComponentProps<typeof AnalyticsShell>>) {
    const [range, setRange] = useState<"7d" | "30d">("30d");
    const [filters, setFilters] = useState<string[]>([]);
    return (
      <AnalyticsShell
        title="Acme"
        subtitle="Overview"
        icon={<i data-testid="icon" />}
        status={<span>Live</span>}
        headingId="h"
        range={range}
        onRangeChange={(r) => setRange(r as "7d" | "30d")}
        ranges={["7d", "30d"]}
        filters={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
        activeFilters={filters}
        onFiltersChange={setFilters}
        live
        onLiveChange={vi.fn()}
        compare={false}
        onCompareChange={vi.fn()}
        labels={defaultAnalyticsLabels}
        glass="full"
        {...props}
      >
        <p>content</p>
      </AnalyticsShell>
    );
  }

  it("is a named group with a heading, range buttons, filter chips and the content", async () => {
    renderUi(<Shell headingLevel={2} backdrop />);
    expect(screen.getByRole("group", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Acme" })).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^\d+[dhm], Last / })).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "7d, Last 7 days" }));
    expect(screen.getByRole("button", { name: "7d, Last 7 days" })).toHaveAttribute("aria-pressed", "true");
    const group = screen.getByRole("group", { name: "Filters" });
    await userEvent.click(within(group).getByRole("button", { name: "Alpha" }));
    await userEvent.click(within(group).getByRole("button", { name: "Beta" }));
    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-pressed")),
    ).toEqual(["true", "true"]);
    await userEvent.click(within(group).getByRole("button", { name: "Alpha" }));
    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-pressed")),
    ).toEqual(["false", "true"]);
  });

  it("Export (when given) is disabled while loading, then calls back and confirms in a live region for a moment", async () => {
    const onExport = vi.fn();
    const view = renderUi(<Shell onExport={onExport} loading />);
    expect(document.querySelector("[data-busy]")).not.toBeNull();
    // The button is present from the first paint (no layout shift when data arrives) but disabled until it has.
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
    view.rerender(<Shell onExport={onExport} loading={false} />);
    expect(document.querySelector("[data-busy]")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent))
      .toContain("CSV downloaded");
    view.rerender(<Shell />);
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(document.querySelector("[data-busy]")).toBeNull();
  });

  it("announces loading and loaded as data arrives", async () => {
    const view = renderUi(<Shell loading={false} />);
    view.rerender(<Shell loading />);
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent))
      .toContain("Loading new data…");
    view.rerender(<Shell loading={false} />);
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent))
      .toContain("Dashboard updated");
  });

  it("the glass budget follows the glass prop", () => {
    const view = renderUi(<Shell glass="flat" />);
    expect(document.querySelector("[data-glass-budget]")).toHaveAttribute("data-glass-budget", "flat");
    view.rerender(<Shell glass="full" />);
    expect(document.querySelector("[data-glass-budget]")).toHaveAttribute("data-glass-budget", "full");
  });

  it("has no axe violations", async () => {
    renderUi(<Shell onExport={vi.fn()} />);
    await settle();
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
