// Pure helpers behind every chart: ticks, scales, formatters, paths, keyboard handler, live data, CSV and SVG export.
import { useControllable } from "../../src/hooks/use-controllable";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { act, render, renderHook, screen } from "@testing-library/react";

import {
  ChartWidthHint,
  areaPath,
  axisFormat,
  barPath,
  budgetDelay,
  chartFocusClass,
  chartGlow,
  chartKeyHandler,
  clamp,
  compactFormat,
  dataSignature,
  decimalsOf,
  extent,
  fadeColor,
  formatCompact,
  formatTick,
  indexOfKey,
  linePath,
  linear,
  localeTickFormat,
  niceTicks,
  num,
  percentChange,
  rowKeys,
  seriesColor,
  slideShift,
  slotColor,
  thinLabels,
  tooltipDockSpace,
  truncate,
  useChartFrame,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  useLiveData,
  useTweenedNumbers,
} from "../../src/components/charts/chart-utils";
import {
  chartCsv,
  chartFileName,
  chartPngBlob,
  downloadBlob,
  exportChartImage,
  findChartSvg,
  resolveCssColor,
  serializeChartSvg,
  tableCsv,
} from "../../src/components/charts/chart-export";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("slotColor / seriesColor", () => {
  it("maps slots 1-8 to the chart tokens and anything else to neutral grey", () => {
    expect(slotColor(1)).toBe("var(--sheen-chart-1)");
    expect(slotColor(8)).toBe("var(--sheen-chart-8)");
    for (const bad of [0, 9, -1, 1.5, Number.NaN]) expect(slotColor(bad)).toBe("var(--sheen-fg-subtle)");
  });
  it("uses the explicit colour, else the position", () => {
    expect(seriesColor({ key: "a", label: "A" }, 2)).toBe("var(--sheen-chart-3)");
    expect(seriesColor({ key: "a", label: "A", color: 6 }, 0)).toBe("var(--sheen-chart-6)");
    expect(seriesColor({ key: "a", label: "A" }, 8)).toBe("var(--sheen-fg-subtle)");
  });
});

describe("num", () => {
  it.each([
    [5, 5],
    ["12.5", 12.5],
    [" 7 ", 7],
    ["", 0],
    ["  ", 0],
    ["abc", 0],
    [undefined, 0],
    [null, 0],
    [Number.NaN, 0],
    [Infinity, 0],
    [-Infinity, 0],
    [{}, 0],
    [true, 0],
    [-3, -3],
  ])("num(%j) = %j", (input, out) => expect(num(input)).toBe(out));
});

describe("formatCompact", () => {
  it.each([
    [0, "0"],
    [1284, "1,284"],
    [9999, "9,999"],
    [12900, "12.9K"],
    [4_200_000, "4.2M"],
    [-640, "−640"],
    [-12900, "−12.9K"],
    [0.25, "0.3"],
    [1.04, "1"],
    [Number.NaN, "–"],
    [Infinity, "–"],
  ])("formatCompact(%j) = %s", (n, out) => expect(formatCompact(n)).toBe(out));
});

describe("decimalsOf", () => {
  it.each([
    [0.25, 2],
    [2500, 0],
    [3, 0],
    [0.1 + 0.2, 1],
    [1e-7, 7],
    [0.5, 1],
    [Number.NaN, 0],
    [Infinity, 0],
    [-0.125, 3],
    [1.5e21, 0],
  ])("decimalsOf(%j) = %j", (n, out) => expect(decimalsOf(n)).toBe(out));
});

describe("formatTick / axisFormat / localeTickFormat", () => {
  it("never rounds a tick away from its value", () => {
    expect(formatTick(0.25)).toBe("0.25");
    expect(formatTick(0.5)).toBe("0.5");
    expect(formatTick(0)).toBe("0");
    expect(formatTick(12_500)).toBe("12.5K");
    expect(formatTick(-12_500)).toBe("−12.5K");
    expect(formatTick(2_000_000)).toBe("2M");
    expect(formatTick(3_500_000_000)).toBe("3.5B");
    expect(formatTick(1e12)).toBe("1T");
    expect(formatTick(-2.5)).toBe("−2.5");
    expect(formatTick(Number.NaN)).toBe("–");
  });
  it("axisFormat prefers a custom formatter but not formatCompact", () => {
    const own = (n: number) => `${n}!`;
    expect(axisFormat(own)).toBe(own);
    expect(axisFormat(undefined)).toBe(formatTick);
    expect(axisFormat(formatCompact)).toBe(formatTick);
  });
  it("localeTickFormat is formatTick without a locale and localised with one", () => {
    expect(localeTickFormat()).toBe(formatTick);
    const de = localeTickFormat("de");
    expect(de(0.25)).toBe("0,25");
    expect(de(1500)).toBe("1.500");
    expect(de(12_500)).toBe("12.500"); // German has no compact thousands form
    expect(de(-0.5)).toBe("−0,5");
    expect(de(Number.NaN)).toBe("–");
    expect(de(2_000_000)).toMatch(/2/);
  });
});

describe("niceTicks", () => {
  it("covers the range with round ticks", () => {
    expect(niceTicks(0, 100)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(3, 97)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(-50, 50)).toEqual([-60, -40, -20, 0, 20, 40, 60]);
  });
  it("snaps fractional steps to their precision (no float noise)", () => {
    const t = niceTicks(0, 0.5);
    expect(t[0]).toBe(0);
    expect(t.every((v) => Number.isFinite(v) && String(v).length <= 6)).toBe(true);
    expect(niceTicks(0, 1)).toContain(0.2);
    expect(niceTicks(0.1, 0.3)).toEqual([0.1, 0.15, 0.2, 0.25, 0.3].filter((v) => niceTicks(0.1, 0.3).includes(v)));
  });
  it("handles degenerate input", () => {
    expect(niceTicks(0, 0)).toEqual([0, 1]);
    expect(niceTicks(Number.NaN, 4)).toEqual([0, 1]);
    expect(niceTicks(1, Infinity)).toEqual([0, 1]);
    const flat = niceTicks(50, 50);
    expect(flat.length).toBeGreaterThan(1);
    expect(flat[0]).toBeLessThanOrEqual(45);
    expect(flat[flat.length - 1]).toBeGreaterThanOrEqual(55);
    expect(niceTicks(100, 0)).toEqual(niceTicks(0, 100));
  });
  it("copes with huge and tiny magnitudes and never loops forever", () => {
    expect(niceTicks(0, 1e9).length).toBeLessThanOrEqual(12);
    expect(niceTicks(0, 1e-9).length).toBeGreaterThan(1);
    expect(niceTicks(0, 1e6, 50).length).toBeLessThanOrEqual(51);
    expect(niceTicks(0, 7, 1).length).toBeGreaterThan(1);
    expect(niceTicks(0, 7, 0).length).toBeGreaterThan(1);
  });
  it("is monotonic and contains the domain", () => {
    for (const [lo, hi] of [
      [0, 3],
      [-7, 13],
      [120, 980],
      [0.02, 0.9],
      [-1e5, 3e5],
    ] as const) {
      const t = niceTicks(lo, hi);
      expect(t[0]!).toBeLessThanOrEqual(lo);
      expect(t[t.length - 1]!).toBeGreaterThanOrEqual(hi);
      for (let i = 1; i < t.length; i++) expect(t[i]!).toBeGreaterThan(t[i - 1]!);
    }
  });
});

describe("linear / extent / clamp", () => {
  it("maps domain onto range, also reversed", () => {
    const y = linear(0, 100, 200, 0);
    expect(y(0)).toBe(200);
    expect(y(100)).toBe(0);
    expect(y(50)).toBe(100);
    expect(y(150)).toBe(-100);
  });
  it("a zero-width domain collapses to the range start (no NaN)", () => {
    expect(linear(5, 5, 10, 90)(5)).toBe(10);
    expect(linear(5, 5, 10, 90)(99)).toBe(10);
  });
  it("extent / clamp", () => {
    expect(extent([3, -1, 8])).toEqual([-1, 8]);
    expect(extent([])).toEqual([0, 0]);
    expect(extent(Array.from({ length: 200_000 }, (_, i) => i))).toEqual([0, 199_999]);
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-5, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
});

describe("thinLabels", () => {
  it("keeps every label when there is room", () => {
    expect([...thinLabels(["a", "b", "c"], 100)]).toEqual([0, 1, 2]);
  });
  it("prints every n-th label plus the last, dropping the neighbour that would collide", () => {
    const labels = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
    const shown = thinLabels(labels, 20);
    expect(shown.has(0)).toBe(true);
    expect(shown.has(11)).toBe(true);
    expect(shown.size).toBeLessThan(12);
    const sorted = [...shown].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) expect((sorted[i]! - sorted[i - 1]!) * 20).toBeGreaterThanOrEqual(36);
  });
  it("handles empty and single label lists", () => {
    expect([...thinLabels([], 10)]).toEqual([]);
    expect([...thinLabels(["only"], 0)]).toEqual([0]);
  });
});

describe("rowKeys / dataSignature / indexOfKey / truncate", () => {
  it("keys are unique even for duplicate labels", () => {
    const keys = rowKeys([{ m: "Q1" }, { m: "Q1" }, { m: "Q2" }, {}], "m");
    expect(new Set(keys).size).toBe(4);
    expect(rowKeys([{ m: "Q1" }], "m")[0]).toBe(rowKeys([{ m: "Q1" }, { m: "Q2" }], "m")[0]);
  });
  it("dataSignature changes with values only", () => {
    const a = dataSignature([{ m: "a", v: 1 }], ["v"]);
    expect(dataSignature([{ m: "zzz", v: 1 }], ["v"])).toBe(a);
    expect(dataSignature([{ m: "a", v: 2 }], ["v"])).not.toBe(a);
    expect(dataSignature([], ["v"])).toBe("");
    expect(dataSignature([{ m: "a" }], ["v"])).toBe("");
  });
  it("indexOfKey finds by label or by position", () => {
    const data = [{ m: "Jan" }, { m: "Feb" }, { m: "Mar" }];
    expect(indexOfKey(data, "m", "Feb")).toBe(1);
    expect(indexOfKey(data, "m", 2)).toBe(2);
    expect(indexOfKey(data, "m", 7)).toBe(-1);
    expect(indexOfKey(data, "m", "Nope")).toBe(-1);
    expect(indexOfKey(data, "m", null)).toBe(-1);
    expect(indexOfKey(data, "m", undefined)).toBe(-1);
    // A numeric index column is matched by value, not by position.
    expect(indexOfKey([{ y: 2020 }, { y: 2021 }], "y", 2021)).toBe(1);
    expect(indexOfKey([{ y: 2020 }, { y: 2021 }], "y", 1)).toBe(-1);
  });
  it("truncate", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("a very long label", 8)).toBe("a very…");
    expect(truncate("abcdef", 1)).toBe("a…");
  });
});

describe("tooltipDockSpace", () => {
  const rows = [{ label: "Visits", values: ["4,200", "5,100"] }];
  it("reserves at least one line and grows when the readout must wrap", () => {
    const wide = tooltipDockSpace(900, [{ m: "Jan" }], "m", rows);
    const narrow = tooltipDockSpace(120, [{ m: "Jan" }], "m", rows, ["A long event note here"]);
    expect(wide).toBe(40);
    expect(narrow).toBeGreaterThan(wide);
  });
});

describe("barPath", () => {
  it("rounds only the data end", () => {
    const d = barPath(10, 20, 30, 40, "top", 6);
    expect(d.startsWith("M10,26 Q10,20 16,20 H34")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    // The square base has radius 0, so its corner control point equals the corner.
    expect(d).toContain("Q40,60 40,60");
  });
  it("shares one command structure for every end", () => {
    const shape = (d: string) => d.replace(/[-\d.]+/g, "#");
    const ends = ["top", "bottom", "left", "right", "none"] as const;
    const shapes = new Set(ends.map((e) => shape(barPath(0, 0, 20, 20, e))));
    expect(shapes.size).toBe(1);
  });
  it("clamps the radius and survives zero / non-finite sizes", () => {
    expect(barPath(0, 0, 4, 100, "top", 10)).toContain("Q0,0 2,0");
    expect(barPath(0, 0, 0, 0, "right")).toMatch(/^M0,0/);
    expect(barPath(0, 0, Number.NaN, -5, "left")).not.toContain("NaN");
    expect(barPath(0, 0, 10, 10, "none", 5)).toBe(barPath(0, 0, 10, 10, "none", 0));
  });
});

describe("chartKeyHandler", () => {
  const press = (count: number, active: number | null, key: string) => {
    const set = vi.fn();
    const prevent = vi.fn();
    chartKeyHandler(count, active, set)({ key, preventDefault: prevent } as never);
    return { set, prevent };
  };
  it("arrows step, Home/End jump, Escape clears", () => {
    expect(press(4, null, "ArrowRight").set).toHaveBeenCalledWith(0);
    expect(press(4, 1, "ArrowRight").set).toHaveBeenCalledWith(2);
    expect(press(4, 3, "ArrowRight").set).toHaveBeenCalledWith(3);
    expect(press(4, 3, "ArrowDown").set).toHaveBeenCalledWith(3);
    expect(press(4, 2, "ArrowLeft").set).toHaveBeenCalledWith(1);
    expect(press(4, 0, "ArrowLeft").set).toHaveBeenCalledWith(0);
    expect(press(4, null, "ArrowLeft").set).toHaveBeenCalledWith(0);
    expect(press(4, 2, "ArrowUp").set).toHaveBeenCalledWith(1);
    expect(press(4, 2, "Home").set).toHaveBeenCalledWith(0);
    expect(press(4, 2, "End").set).toHaveBeenCalledWith(3);
    expect(press(4, 2, "Escape").set).toHaveBeenCalledWith(null);
    expect(press(4, 9, "ArrowRight").set).toHaveBeenCalledWith(0);
  });
  it("ignores other keys, an idle Escape and empty charts, and only prevents default when it acted", () => {
    expect(press(4, null, "Escape").set).not.toHaveBeenCalled();
    expect(press(4, 1, "a").prevent).not.toHaveBeenCalled();
    expect(press(0, null, "Home").set).not.toHaveBeenCalled();
    expect(press(4, 1, "End").prevent).toHaveBeenCalled();
  });
  it("exports a focus-ring class", () => expect(chartFocusClass).toContain("focus-visible"));
});

describe("small style helpers", () => {
  it("budgetDelay never spreads a group over 400 ms", () => {
    expect(budgetDelay(0, 10)).toBe(0);
    expect(budgetDelay(2, 3)).toBeCloseTo(0.06);
    expect(budgetDelay(99, 100)).toBeLessThanOrEqual(0.4 + 1e-9);
    expect(budgetDelay(1, 1)).toBeCloseTo(0.03);
  });
  it("chartGlow / fadeColor", () => {
    expect(chartGlow("red")).toContain("drop-shadow(0 0 6px");
    expect(chartGlow("red", 3)).toContain("3px");
    expect(fadeColor("red", 30)).toBe("color-mix(in oklab, red 30%, transparent)");
    expect(fadeColor("red", 300)).toContain("100%");
    expect(fadeColor("red", -5)).toContain(" 0%");
  });
});

describe("linePath / areaPath", () => {
  it("empty input is empty", () => {
    expect(linePath([])).toBe("");
    expect(areaPath([], 0)).toBe("");
  });
  it("linear paths use L commands", () => {
    expect(
      linePath([
        [0, 0],
        [10, 5],
        [20, 0],
      ]),
    ).toBe("M0,0 L10,5 L20,0");
    expect(linePath([[1.234, 5.678]])).toBe("M1.23,5.68");
  });
  it("monotone paths use cubic commands, and two points fall back to a straight line", () => {
    const d = linePath(
      [
        [0, 0],
        [10, 10],
        [20, 5],
        [30, 20],
      ],
      "monotone",
    );
    expect(d.match(/C/g)).toHaveLength(3);
    expect(
      linePath(
        [
          [0, 0],
          [10, 10],
        ],
        "monotone",
      ),
    ).toBe("M0,0 L10,10");
  });
  it("a monotone curve never overshoots a flat run", () => {
    const d = linePath(
      [
        [0, 10],
        [10, 10],
        [20, 10],
      ],
      "monotone",
    );
    expect(d).not.toContain("NaN");
    const ys = [...d.matchAll(/[CM]?[\d.-]+,([\d.-]+)/g)].map((m) => Number(m[1]));
    expect(ys.every((y) => y === 10)).toBe(true);
  });
  it("same point count + curve gives the same command structure (tweenable)", () => {
    const shape = (d: string) => d.replace(/[-\d.]+/g, "#");
    expect(
      shape(
        linePath(
          [
            [0, 0],
            [5, 5],
            [9, 1],
          ],
          "monotone",
        ),
      ),
    ).toBe(
      shape(
        linePath(
          [
            [0, 3],
            [4, 9],
            [9, 9],
          ],
          "monotone",
        ),
      ),
    );
  });
  it("handles duplicate x (zero-width segments) without NaN", () => {
    expect(
      linePath(
        [
          [0, 0],
          [0, 5],
          [0, 9],
          [3, 3],
        ],
        "monotone",
      ),
    ).not.toContain("NaN");
  });
  it("areaPath closes to the baseline", () => {
    expect(
      areaPath(
        [
          [0, 0],
          [10, 5],
        ],
        20,
      ),
    ).toBe("M0,0 L10,5 L10,20 L0,20 Z");
    expect(
      areaPath(
        [
          [0, 0],
          [10, 5],
          [20, 2],
        ],
        20,
        "monotone",
      ).endsWith("L20,20 L0,20 Z"),
    ).toBe(true);
  });
});

describe("compactFormat / percentChange", () => {
  it("without a locale it is formatCompact", () => expect(compactFormat()).toBe(formatCompact));
  it("localises", () => {
    const de = compactFormat("de");
    expect(de(1284.5)).toBe("1.284,5");
    expect(de(-1284)).toBe("−1.284");
    expect(de(12_900)).toBe("12.900");
    expect(de(4_200_000)).toMatch(/4,2/);
    expect(de(Number.NaN)).toBe("–");
    expect(compactFormat("de")(5)).toBe("5");
  });
  it("percentChange", () => {
    expect(percentChange(112.4, 100)).toEqual({ text: "+12.4%", direction: "up" });
    expect(percentChange(97, 100)).toEqual({ text: "−3%", direction: "down" });
    expect(percentChange(100, 100)).toEqual({ text: "0%", direction: "flat" });
    expect(percentChange(100.01, 100)?.direction).toBe("flat");
    expect(percentChange(5, 0)).toBeNull();
    expect(percentChange(Number.NaN, 4)).toBeNull();
    expect(percentChange(5, Infinity)).toBeNull();
    expect(percentChange(50, -100)?.direction).toBe("up");
    expect(percentChange(112.4, 100, "de")?.text).toBe("+12,4 %");
  });
});

describe("slideShift", () => {
  it("detects a window that slid by k", () => {
    expect(slideShift(["a", "b", "c", "d"], ["b", "c", "d", "e"])).toBe(1);
    expect(slideShift(["a", "b", "c", "d"], ["c", "d", "e", "f"])).toBe(2);
  });
  it("is 0 for anything else", () => {
    expect(slideShift([], [])).toBe(0);
    expect(slideShift(["a", "b"], ["a", "b", "c"])).toBe(0);
    expect(slideShift(["a", "b", "c"], ["a", "b", "c"])).toBe(0);
    expect(slideShift(["a", "b", "c"], ["x", "y", "z"])).toBe(0);
    // A shift of more than 8 is not a slide.
    const prev = Array.from({ length: 20 }, (_, i) => String(i));
    expect(
      slideShift(
        prev,
        prev.map((_, i) => String(i + 9)),
      ),
    ).toBe(0);
  });
});

describe("hooks", () => {
  it("useControllable: uncontrolled, controlled, and onChange in both", () => {
    const onChange = vi.fn();
    const un = renderHook(() => useControllable<number>(undefined, 1, onChange));
    expect(un.result.current[0]).toBe(1);
    act(() => un.result.current[1](2));
    expect(un.result.current[0]).toBe(2);
    expect(onChange).toHaveBeenLastCalledWith(2);
    act(() => un.result.current[1](2));
    expect(onChange).toHaveBeenCalledTimes(1);
    const setter = un.result.current[1];
    act(() => setter((p) => p + 5));
    expect(un.result.current[0]).toBe(7);

    const onChange2 = vi.fn();
    const con = renderHook(() => useControllable<number>(10, 1, onChange2));
    act(() => con.result.current[1](11));
    expect(con.result.current[0]).toBe(10);
    expect(onChange2).toHaveBeenCalledWith(11);
  });

  it("useDataChanged / useHasMounted", () => {
    // The hooks publish what a commit drew through state, so the render that sees a change is followed by a
    // second one: record every render to see both.
    const seen: boolean[] = [];
    const { result, rerender } = renderHook(
      ({ sig }) => {
        const changed = useDataChanged(sig);
        seen.push(changed);
        return changed;
      },
      { initialProps: { sig: "a" } },
    );
    expect(result.current).toBe(false);
    seen.length = 0;
    rerender({ sig: "b" });
    expect(seen).toEqual([true, false]); // the render with the new data reports the change, then it settles
    expect(result.current).toBe(false);
    rerender({ sig: "b" });
    expect(result.current).toBe(false);
    const flags: boolean[] = [];
    renderHook(() => {
      const mounted = useHasMounted();
      flags.push(mounted);
      return mounted;
    });
    expect(flags[0]).toBe(false); // the first draw gets the slow entrance timings
    expect(flags.at(-1)).toBe(true); // every later render the quick ones
    const notReady = renderHook(() => useHasMounted(false));
    notReady.rerender();
    expect(notReady.result.current).toBe(false);
  });

  it("useLiveData appends rows, caps at max, and honours pause", async () => {
    vi.useFakeTimers();
    const next = vi.fn((_rows: readonly number[], tick: number) => tick * 10);
    const { result } = renderHook(() => useLiveData<number>([1, 2], { next, interval: 200, max: 3 }));
    expect(result.current.data).toEqual([1, 2]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(210);
    });
    expect(result.current.data).toEqual([1, 2, 10]);
    // One tick per act: React flushes the state updater between ticks, as it does with real 200 ms gaps.
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
    }
    expect(result.current.data).toEqual([10, 20, 30]);
    act(() => result.current.setPaused(true));
    expect(result.current.running).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.data).toEqual([10, 20, 30]);
    act(() => result.current.setData([7]));
    expect(result.current.data).toEqual([7]);
  });

  it("useLiveData: ticks that land in one batch each get their own counter ([10, 20, 30], not [10, 30, 30])", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useLiveData<number>([1, 2], { next: (_rows, tick) => tick * 10, interval: 200, max: 3 }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(610);
    });
    expect(result.current.data).toEqual([10, 20, 30]);
  });

  it("useLiveData: defaultPaused, controlled paused, onPausedChange, interval floor of 100 ms", async () => {
    vi.useFakeTimers();
    const onPausedChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ paused }) => useLiveData<number>([0], { next: (_r, t) => t, interval: 1, paused, onPausedChange }),
      {
        initialProps: { paused: true },
      },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(result.current.data).toEqual([0]);
    act(() => result.current.setPaused(false));
    expect(onPausedChange).toHaveBeenCalledWith(false);
    rerender({ paused: false });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    // 100 ms floor: two ticks in 250 ms, window length 1.
    expect(result.current.data).toEqual([2]);
    const dp = renderHook(() => useLiveData<number>([0], { next: (_r, t) => t, defaultPaused: true }));
    expect(dp.result.current.paused).toBe(true);
  });

  it("useTweenedNumbers: instant jumps straight to the target", () => {
    const { result, rerender } = renderHook(({ t }) => useTweenedNumbers(t, { instant: true, from: [0, 0] }), {
      initialProps: { t: [1, 2] },
    });
    expect(result.current.read()).toEqual([1, 2]);
    rerender({ t: [5, 6] });
    expect(result.current.read()).toEqual([5, 6]);
  });

  it("useTweenedNumbers: animates from `from` to the target", async () => {
    const { result } = renderHook(() => useTweenedNumbers([10, 20], { instant: false, from: [0, 0], duration: 0.15 }));
    expect(result.current.read()).toEqual([0, 0]);
    expect(result.current.settled).toBe(false);
    await vi.waitFor(() => expect(result.current.read().map(Math.round)).toEqual([10, 20]), { timeout: 3000 });
    await vi.waitFor(() => expect(result.current.settled).toBe(true));
  });

  it("useElementWidth / useChartFrame measure the element, and ChartWidthHint seeds the first render", async () => {
    function Probe() {
      const [ref, width] = useElementWidth<HTMLDivElement>();
      return (
        <div ref={ref} style={{ width: 321 }} data-testid="probe">
          {width}
        </div>
      );
    }
    const { unmount } = render(<Probe />);
    await vi.waitFor(() => expect(screen.getByTestId("probe").textContent).toBe("321"));
    unmount();

    function Framed() {
      const { ref, element, width } = useChartFrame<HTMLDivElement>();
      const seen = useRef(0);
      seen.current += 1;
      return (
        <div ref={ref} style={{ width: 200 }} data-testid="framed" data-has-el={String(Boolean(element))}>
          {width}
        </div>
      );
    }
    render(<Framed />);
    await vi.waitFor(() => expect(screen.getByTestId("framed").textContent).toBe("200"));
    await vi.waitFor(() => expect(screen.getByTestId("framed")).toHaveAttribute("data-has-el", "true"));

    function Hinted() {
      const [ref, width] = useElementWidth<HTMLDivElement>();
      return (
        <div ref={ref} style={{ width: 100 }} data-testid="hinted">
          {width}
        </div>
      );
    }
    render(
      <ChartWidthHint.Provider value={488}>
        <Hinted />
      </ChartWidthHint.Provider>,
    );
    // The hint is the starting width; the observer then corrects it to the real one.
    await vi.waitFor(() => expect(screen.getByTestId("hinted").textContent).toBe("100"));
  });
});

describe("chartFileName", () => {
  it.each([
    ["Traffic per month", "traffic-per-month"],
    ["  Über Größe!! ", "uber-grosse"],
    ["Straße & Æsir – Łódź, Ørsted, Đồng", "strasse-aesir-lodz-orsted-dong"],
    ["Café – 2026/Q1", "cafe-2026-q1"],
    ["日本語", "chart"],
    ["", "chart"],
    ["---", "chart"],
  ])("%j -> %s", (name, slug) => expect(chartFileName(name)).toBe(slug));
});

describe("chartCsv / tableCsv", () => {
  const data: Record<string, string | number>[] = [
    { m: "Jan", a: 1, b: 2.5, prev: 7 },
    { m: "Feb, 2026", a: "3", b: "x" },
    { m: 'Mar "q"' },
  ];
  it("writes headers, rows, compare columns, escapes quotes/commas and zero-fills missing numbers", () => {
    const csv = chartCsv({
      data,
      index: "m",
      series: [
        { key: "a", label: "A", compareKey: "prev" },
        { key: "b", label: "B" },
      ],
      indexLabel: "Month",
    });
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Month,A,A (previous),B");
    expect(lines[1]).toBe("Jan,1,7,2.5");
    expect(lines[2]).toBe('"Feb, 2026",3,,0');
    expect(lines[3]).toBe('"Mar ""q""",0,,0');
  });
  it("defaults the first header to the index key and the previous suffix is configurable", () => {
    const csv = chartCsv({
      data: [{ k: "x", a: 1, p: 2 }],
      index: "k",
      series: [{ key: "a", label: "A", compareKey: "p" }],
      labels: { previous: " (vorher)" },
    });
    expect(csv.split("\r\n")[0]).toBe("k,A,A (vorher)");
  });
  it("no data is just headers", () => {
    expect(chartCsv({ data: [], index: "k", series: [{ key: "a", label: "A" }] })).toBe("k,A");
  });
  it("tableCsv reads a real table, collapsing whitespace", () => {
    document.body.innerHTML = `<table id="t"><thead><tr><th>Month</th><th>Visits</th></tr></thead><tbody><tr><th>Jan</th><td>  4,200
      </td></tr><tr><th>Feb</th><td>5,100</td></tr></tbody></table>`;
    const csv = tableCsv(document.getElementById("t") as HTMLTableElement);
    expect(csv).toBe('Month,Visits\r\nJan,"4,200"\r\nFeb,"5,100"');
    document.body.innerHTML = "";
    document.body.innerHTML = `<table id="e"></table>`;
    expect(tableCsv(document.getElementById("e") as HTMLTableElement)).toBe("");
    document.body.innerHTML = "";
  });
});

describe("svg export", () => {
  function mountSvg(extra = "") {
    const host = document.createElement("div");
    host.innerHTML = `<svg role="img" aria-roledescription="chart" width="200" height="100" viewBox="0 0 200 100" class="x" tabindex="0" data-slot="chart">
      <defs><linearGradient id="g"><stop offset="0" style="stop-color: red; stop-opacity: .5"/></linearGradient></defs>
      <g opacity=".8"><rect x="10" y="10" width="50" height="40" fill="blue" class="bar"/><path d="M0,0 L10,10" stroke="green" stroke-width="2" stroke-dasharray="3 2"/></g>
      <text x="5" y="90" font-size="12" fill="var(--sheen-fg)">Label</text>
      <circle cx="50" cy="50" r="4" style="display:none"/>
      <rect x="1" y="1" width="3" height="3" style="visibility:hidden;filter:drop-shadow(0 0 4px red)"/>
      ${extra}
    </svg>`;
    document.body.appendChild(host);
    return { host, svg: host.querySelector("svg")! };
  }
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("resolveCssColor resolves a var() to a concrete colour and cleans up", () => {
    const before = document.body.childElementCount;
    expect(resolveCssColor("red")).toBe("rgb(255, 0, 0)");
    expect(resolveCssColor("var(--sheen-fg)")).toMatch(/^(rgb|color|oklab|lab|oklch)/);
    expect(document.body.childElementCount).toBe(before);
  });

  it("findChartSvg: null, an svg itself, a marked svg, else the largest one", () => {
    expect(findChartSvg(null)).toBeNull();
    const { host, svg } = mountSvg();
    expect(findChartSvg(svg)).toBe(svg);
    expect(findChartSvg(host)).toBe(svg);
    const other = document.createElement("div");
    other.innerHTML = '<svg width="10" height="10"></svg><svg width="150" height="90" id="big"></svg>';
    document.body.appendChild(other);
    expect(findChartSvg(other)?.id).toBe("big");
    const none = document.createElement("div");
    expect(findChartSvg(none)).toBeNull();
  });

  it("serializeChartSvg inlines styles, strips interaction attributes, adds background and title", () => {
    const { svg } = mountSvg();
    const { markup, width, height } = serializeChartSvg(svg, { title: "Visits", padding: 10, background: "#ffffff" });
    expect(width).toBe(220);
    expect(height).toBe(100 + 20 + 30);
    expect(markup.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(markup).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(markup).toContain('viewBox="-10 -40 220 150"');
    expect(markup).toContain(">Visits</text>");
    expect(markup).toContain('fill="#ffffff"');
    expect(markup).not.toContain("var(--");
    expect(markup).not.toContain("tabindex");
    expect(markup).not.toContain("data-slot");
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain("aria-roledescription");
    expect(markup).toContain('display="none"');
    expect(markup).toContain('visibility="hidden"');
    expect(markup).toContain("stroke-dasharray");
    const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.getAttribute("width")).toBe("220");
  });

  it("serializeChartSvg: background null is transparent, default is the solid surface, no title adds no text row", () => {
    const { svg } = mountSvg();
    const transparent = serializeChartSvg(svg, { background: null });
    expect(transparent.markup).not.toMatch(/<rect x="-16"/);
    const withBg = serializeChartSvg(svg);
    expect(withBg.markup).toMatch(/<rect x="-16" y="-16"/);
    expect(withBg.height).toBe(100 + 32);
  });

  it("serializeChartSvg falls back to the width/height attributes when the svg is not laid out", () => {
    const { host, svg } = mountSvg();
    host.style.display = "none";
    const out = serializeChartSvg(svg, { padding: 0 });
    expect(out.width).toBe(200);
    expect(out.height).toBe(100);
  });

  it("downloadBlob clicks a temporary link, then revokes the URL", () => {
    vi.useFakeTimers();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("file.txt");
      expect(this.href.startsWith("blob:")).toBe(true);
    });
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    downloadBlob(new Blob(["x"]), "file.txt");
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a[download]")).toBeNull();
    vi.advanceTimersByTime(1100);
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("exportChartImage: svg downloads <slug>.svg; no svg returns false", async () => {
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    const { host } = mountSvg();
    expect(await exportChartImage(host, "svg", "Traffic per month!")).toBe(true);
    expect(names).toEqual(["traffic-per-month.svg"]);
    expect(await exportChartImage(document.createElement("div"), "svg", "x")).toBe(false);
    expect(await exportChartImage(null, "png", "x")).toBe(false);
  });

  it("chartPngBlob / exportChartImage png produce a real PNG", async () => {
    const { svg, host } = mountSvg();
    const blob = await chartPngBlob(svg, { scale: 1, background: "#fff" });
    expect(blob.type).toBe("image/png");
    const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    expect([...header]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    expect(await exportChartImage(host, "png", "Chart one", { scale: 1 })).toBe(true);
    expect(names).toEqual(["chart-one.png"]);
  });
});

it("chartGlow output is a valid CSS filter", () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.style.filter = chartGlow("red");
  expect(el.style.filter).toContain("drop-shadow");
  el.remove();
});
