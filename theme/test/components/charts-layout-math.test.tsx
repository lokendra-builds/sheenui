// Pure layout / statistics maths behind the charts: treemap, sankey, histogram, box plot, KDE, geo projection, waffle, pie, ...
import { describe, expect, it } from "vitest";

import { squarify, type TreemapRect } from "../../src/components/charts/treemap";
import { layoutSankey, sankeyLinkPath } from "../../src/components/charts/sankey-chart";
import { isolate, textWidth } from "../../src/components/charts/chart-pointer";
import { binEdgeFormat, edgeAnchor, insideTicks } from "../../src/components/charts/histogram/model";
import { chartMirror, fitText as histFitText, signedText } from "../../src/components/charts/kits/histogram-kit/kit";
import {
  distributionStats,
  histogramBins,
  kernelDensity,
  niceStep,
  quantileSorted,
  samplePoints,
  silvermanBandwidth,
  sortedValues,
  suggestedBinCount,
} from "../../src/components/charts/kits/histogram-kit/stats";
import { boxPlotStats } from "../../src/components/charts/box-plot";
import {
  kde,
  quantile,
  silvermanBandwidth as ridgeBandwidth,
  summarize,
} from "../../src/components/charts/ridgeline-chart";
import {
  divergingColor,
  projectWorld,
  worldCountryName,
  WORLD_FRAME_HEIGHT,
  WORLD_FRAME_WIDTH,
} from "../../src/components/charts/geo-map";
import { foldWaffleItems, waffleCells } from "../../src/components/charts/waffle-chart";
import { foldSlices, spreadLabels as pieSpread } from "../../src/components/charts/pie-chart";
import { foldScatterSeries, linearRegression, scatterLegend } from "../../src/components/charts/scatter-chart";
import { indexSeries } from "../../src/components/charts/combo-chart";
import { percentShares } from "../../src/components/charts/percent-bar-chart";
import { cohortModel, cohortPercent } from "../../src/components/charts/cohort-chart";
import { parseCandles } from "../../src/components/charts/candlestick-chart";
import { beeswarmOffsets } from "../../src/components/charts/beeswarm";
import { divergingLevels } from "../../src/components/charts/diverging-bar-chart";
import { foldPolarSeries } from "../../src/components/charts/polar-area-chart";
import {
  bandArea,
  curvePath,
  curveSegments,
  foldStreamSeries,
  insideOutOrder,
  streamBaseline,
} from "../../src/components/charts/streamgraph";
import { isoDate, localeWeekStart, toDayNumber } from "../../src/components/charts/calendar-heatmap";
import { ganttDay } from "../../src/components/charts/gantt-chart";
import { spreadLabels as dumbbellSpread, dumbbellColors } from "../../src/components/charts/dumbbell-chart";
import { annularSector, gaugeLegend } from "../../src/components/charts/gauge-chart";
import {
  estimateReadoutHeight,
  estimateTooltipHeight,
  estimateTooltipWidth,
  betweenDefault,
  longestOf,
  tooltipContainerWidth,
  tooltipSide,
} from "../../src/components/charts/range-area-chart";
import {
  chartNumberFormat,
  defaultCompact,
  defaultPercent,
  hueMix,
  scalePosition,
  sequentialColor,
} from "../../src/components/charts/heatmap";
import { dockSpace, fitTicks, withMinimum } from "../../src/components/charts/chart-fit";
import {
  fitText,
  mix,
  polar,
  r2,
  ringSector,
  roundedRectPath,
  slice,
  wrapText,
} from "../../src/components/charts/flow-utils";
import { formatCompact } from "../../src/components/charts/chart-utils";

const area = (r: TreemapRect) => r.w * r.h;
const overlap = (a: TreemapRect, b: TreemapRect) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 1e-6 && h > 1e-6 ? w * h : 0;
};

describe("squarify (treemap layout)", () => {
  const rect = { x: 10, y: 20, w: 400, h: 240 };
  it("tiles the rectangle exactly: area proportional to value, nothing overlaps, nothing escapes", () => {
    const values = [60, 25, 10, 8, 5, 5, 3, 1];
    const out = squarify(values, rect);
    const total = values.reduce((s, v) => s + v, 0);
    expect(out).toHaveLength(values.length);
    for (const [i, r] of out.entries()) {
      expect(area(r)).toBeCloseTo((values[i]! / total) * area(rect), 3);
      expect(r.x).toBeGreaterThanOrEqual(rect.x - 1e-6);
      expect(r.y).toBeGreaterThanOrEqual(rect.y - 1e-6);
      expect(r.x + r.w).toBeLessThanOrEqual(rect.x + rect.w + 1e-6);
      expect(r.y + r.h).toBeLessThanOrEqual(rect.y + rect.h + 1e-6);
    }
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) expect(overlap(out[i]!, out[j]!)).toBe(0);
    expect(out.reduce((s, r) => s + area(r), 0)).toBeCloseTo(area(rect), 3);
  });
  it("keeps tiles near square (worst aspect ratio under 4 for balanced values)", () => {
    const out = squarify([10, 10, 10, 10, 10, 10], rect);
    for (const r of out) expect(Math.max(r.w / r.h, r.h / r.w)).toBeLessThan(4);
  });
  it("works for portrait rectangles too", () => {
    const portrait = { x: 0, y: 0, w: 100, h: 300 };
    const out = squarify([5, 3, 2], portrait);
    expect(out.reduce((s, r) => s + area(r), 0)).toBeCloseTo(area(portrait), 3);
  });
  it("zero, negative and non-finite values get an empty tile at the origin", () => {
    const out = squarify([10, 0, -5, Number.NaN, 10], rect);
    for (const i of [1, 2, 3]) {
      expect(out[i]!.w).toBe(0);
      expect(out[i]!.h).toBe(0);
    }
    expect(area(out[0]!) + area(out[4]!)).toBeCloseTo(area(rect), 3);
  });
  it("degenerate input: empty, all-zero, empty rect", () => {
    expect(squarify([], rect)).toEqual([]);
    expect(squarify([0, 0], rect).every((r) => r.w === 0 && r.h === 0)).toBe(true);
    expect(squarify([1, 2], { x: 0, y: 0, w: 0, h: 100 }).every((r) => r.w === 0)).toBe(true);
    expect(squarify([1, 2], { x: 0, y: 0, w: 100, h: -1 }).every((r) => r.h === 0)).toBe(true);
    expect(squarify([5], rect)[0]).toEqual(rect);
  });
  it("is deterministic and handles hundreds of tiles", () => {
    const values = Array.from({ length: 400 }, (_, i) => ((i * 37) % 91) + 1);
    const a = squarify(values, rect);
    const b = squarify(values, rect);
    expect(a).toEqual(b);
    expect(a.reduce((s, r) => s + area(r), 0)).toBeCloseTo(area(rect), 2);
  });
});

describe("layoutSankey", () => {
  const links = [
    { source: "Visits", target: "Signup", value: 60 },
    { source: "Visits", target: "Bounce", value: 40 },
    { source: "Signup", target: "Paid", value: 20 },
    { source: "Signup", target: "Free", value: 40 },
  ];
  const opts = { width: 600, height: 300 };

  it("assigns columns left-to-right and keeps flow conserved", () => {
    const l = layoutSankey(undefined, links, opts);
    const col = Object.fromEntries(l.nodes.map((n) => [n.id, n.column]));
    expect(col).toMatchObject({ Visits: 0, Signup: 1, Bounce: 2, Paid: 2, Free: 2 });
    expect(l.columns).toBe(3);
    expect(l.total).toBe(100);
    const signup = l.nodes.find((n) => n.id === "Signup")!;
    expect(signup.inflow).toBe(60);
    expect(signup.outflow).toBe(60);
    expect(signup.value).toBe(60);
    expect(l.links).toHaveLength(4);
  });
  it("keeps nodes inside the frame, in their column, without vertical overlap", () => {
    const l = layoutSankey(undefined, links, opts);
    for (const n of l.nodes) {
      expect(n.x0).toBeGreaterThanOrEqual(0);
      expect(n.x1).toBeLessThanOrEqual(opts.width + 1e-6);
      expect(n.y0).toBeGreaterThanOrEqual(-1e-6);
      expect(n.y1).toBeLessThanOrEqual(opts.height + 1e-6);
      expect(n.x1 - n.x0).toBeCloseTo(12);
    }
    for (const c of [0, 1, 2]) {
      const inCol = l.nodes.filter((n) => n.column === c).sort((a, b) => a.y0 - b.y0);
      for (let i = 1; i < inCol.length; i++) expect(inCol[i]!.y0).toBeGreaterThanOrEqual(inCol[i - 1]!.y1 - 1e-6);
    }
  });
  it("link thickness is proportional to its value, and links attach inside their nodes", () => {
    const l = layoutSankey(undefined, links, opts);
    const k = l.links[0]!.width / l.links[0]!.value;
    for (const link of l.links) {
      expect(link.width / link.value).toBeCloseTo(k, 3);
      expect(link.y0).toBeGreaterThanOrEqual(link.source.y0 - 1e-6);
      expect(link.y0).toBeLessThanOrEqual(link.source.y1 + 1e-6);
      expect(link.y1).toBeGreaterThanOrEqual(link.target.y0 - 1e-6);
      expect(link.y1).toBeLessThanOrEqual(link.target.y1 + 1e-6);
    }
  });
  it("drops self-links, non-positive values and cycle-closing back edges; sums duplicate pairs", () => {
    const l = layoutSankey(
      undefined,
      [
        { source: "A", target: "B", value: 5 },
        { source: "A", target: "B", value: 5 },
        { source: "B", target: "C", value: 4 },
        { source: "C", target: "A", value: 3 },
        { source: "A", target: "A", value: 9 },
        { source: "B", target: "D", value: 0 },
        { source: "B", target: "D", value: -2 },
        { source: "B", target: "D", value: Number.NaN },
      ],
      opts,
    );
    expect(l.links.map((x) => `${x.source.id}>${x.target.id}:${x.value}`).sort()).toEqual(["A>B:10", "B>C:4"]);
  });
  it("uses node specs (label, colour slot) and orders unspecified nodes after them", () => {
    const l = layoutSankey([{ id: "Paid", label: "Paying", color: 5 }, { id: "Visits" }], links, opts);
    const paid = l.nodes.find((n) => n.id === "Paid")!;
    expect(paid.label).toBe("Paying");
    expect(paid.slot).toBe(5);
    expect(paid.color).toContain("--sheen-chart-5");
    expect(l.nodes[0]!.id).toBe("Paid");
    expect(l.nodes.find((n) => n.id === "Signup")!.label).toBe("Signup");
  });
  it.each(["justify", "left", "right", "center"] as const)("align=%s stays inside the frame", (align) => {
    const l = layoutSankey(undefined, links, { ...opts, align });
    for (const n of l.nodes) {
      expect(Number.isFinite(n.x0) && Number.isFinite(n.y0) && Number.isFinite(n.y1)).toBe(true);
      expect(n.column).toBeGreaterThanOrEqual(0);
      expect(n.column).toBeLessThan(l.columns);
    }
  });
  it("empty and degenerate input never throws or yields NaN", () => {
    expect(layoutSankey(undefined, [], opts)).toMatchObject({ nodes: [], links: [], total: 0 });
    const tiny = layoutSankey(undefined, links, { width: 0, height: 0, nodePadding: 99 });
    for (const n of tiny.nodes) expect(Number.isNaN(n.y0)).toBe(false);
    const crowded = layoutSankey(
      undefined,
      Array.from({ length: 30 }, (_, i) => ({ source: "S", target: `T${i}`, value: i + 1 })),
      { width: 300, height: 120, nodePadding: 20 },
    );
    const last = crowded.nodes.filter((n) => n.column === 1).sort((a, b) => a.y0 - b.y0);
    expect(last[last.length - 1]!.y1).toBeLessThanOrEqual(120 + 1e-6);
    const one = layoutSankey(undefined, [{ source: "A", target: "B", value: 1 }], { ...opts, iterations: 0 });
    expect(one.links).toHaveLength(1);
  });
  it("sankeyLinkPath is a cubic ribbon centreline between the nodes", () => {
    const l = layoutSankey(undefined, links, opts);
    const d = sankeyLinkPath(l.links[0]!);
    expect(d).toMatch(/^M[\d.-]+,[\d.-]+ C[\d.-]+,[\d.-]+ [\d.-]+,[\d.-]+ [\d.-]+,[\d.-]+$/);
    expect(sankeyLinkPath(l.links[0]!, 0)).not.toBe(d);
  });
});

describe("distribution statistics (histogram / box plot / violin)", () => {
  it("sortedValues keeps finite numbers only, ascending", () => {
    expect(sortedValues([3, "x", 1, null, Number.NaN, Infinity, 2, undefined, "5"])).toEqual([1, 2, 3]);
    expect(sortedValues([])).toEqual([]);
  });
  it("quantileSorted interpolates linearly", () => {
    const s = [1, 2, 3, 4, 5];
    expect(quantileSorted(s, 0)).toBe(1);
    expect(quantileSorted(s, 1)).toBe(5);
    expect(quantileSorted(s, 0.5)).toBe(3);
    expect(quantileSorted(s, 0.25)).toBe(2);
    expect(quantileSorted([1, 2], 0.5)).toBe(1.5);
    expect(quantileSorted(s, -1)).toBe(1);
    expect(quantileSorted(s, 7)).toBe(5);
    expect(Number.isNaN(quantileSorted([], 0.5))).toBe(true);
    expect(quantileSorted([9], 0.3)).toBe(9);
  });
  it("distributionStats: five-number summary, mean, sd, outliers", () => {
    const s = distributionStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 100])!;
    expect(s.n).toBe(10);
    expect(s.median).toBe(5.5);
    expect(s.q1).toBeCloseTo(3.25);
    expect(s.q3).toBeCloseTo(7.75);
    expect(s.iqr).toBeCloseTo(4.5);
    expect(s.mean).toBeCloseTo(14.5);
    expect(s.outliers).toEqual([100]);
    expect(s.whiskerHigh).toBe(9);
    expect(s.whiskerLow).toBe(1);
    expect(s.max).toBe(100);
    expect(s.sd).toBeCloseTo(Math.sqrt([1, 2, 3, 4, 5, 6, 7, 8, 9, 100].reduce((a, v) => a + (v - 14.5) ** 2, 0) / 9));
  });
  it("whisker option: minmax reaches the extremes, 0 puts everything outside the box into outliers", () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];
    const mm = distributionStats(data, "minmax")!;
    expect([mm.whiskerLow, mm.whiskerHigh, mm.outliers.length]).toEqual([1, 100, 0]);
    const zero = distributionStats(data, 0)!;
    expect(zero.outliers.length).toBeGreaterThan(0);
    expect(zero.whiskerLow).toBeGreaterThanOrEqual(zero.q1 - 1e-9);
    const neg = distributionStats(data, -3)!;
    expect(neg.outliers.length).toBe(zero.outliers.length);
  });
  it("one value and no values", () => {
    expect(distributionStats([])).toBeNull();
    const one = distributionStats([7])!;
    expect(one).toMatchObject({ n: 1, sd: 0, median: 7, iqr: 0, whiskerLow: 7, whiskerHigh: 7, outliers: [] });
  });
  it("silvermanBandwidth is positive for spread data and 0 for degenerate data", () => {
    expect(silvermanBandwidth([])).toBe(0);
    expect(silvermanBandwidth([5])).toBe(0);
    expect(silvermanBandwidth([5, 5, 5, 5])).toBe(0);
    const h = silvermanBandwidth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(h).toBeGreaterThan(0.5);
    expect(h).toBeLessThan(3);
    // Falls back to range / 4 when the IQR is 0 but the sd is not: still positive.
    expect(silvermanBandwidth([1, 5, 5, 5, 5, 5, 5, 9])).toBeGreaterThan(0);
  });
  it("kernelDensity integrates to ~1 and is symmetric for symmetric data", () => {
    const data = [-2, -1, 0, 1, 2];
    const xs = samplePoints(-8, 8, 400);
    const d = kernelDensity(data, 0.8, xs);
    const dx = 16 / 399;
    expect(d.reduce((s, v) => s + v * dx, 0)).toBeCloseTo(1, 1);
    const i0 = xs.findIndex((x) => x >= 0);
    expect(d[i0]!).toBeGreaterThan(d[0]!);
    expect(kernelDensity(data, 0.8, [-1.5])[0]!).toBeCloseTo(kernelDensity(data, 0.8, [1.5])[0]!, 8);
    // Unsorted evaluation points fall back to a rescan.
    expect(kernelDensity(data, 0.8, [3, -3, 0])[2]!).toBeCloseTo(kernelDensity(data, 0.8, [0])[0]!, 10);
  });
  it("kernelDensity of nothing / a bad bandwidth is zeros", () => {
    expect(kernelDensity([], 1, [0, 1])).toEqual([0, 0]);
    expect(kernelDensity([1], 0, [0, 1])).toEqual([0, 0]);
    expect(kernelDensity([1], Number.NaN, [0])).toEqual([0]);
    expect(kernelDensity([1], -2, [0])).toEqual([0]);
  });
  it("samplePoints", () => {
    expect(samplePoints(0, 10, 3)).toEqual([0, 5, 10]);
    expect(samplePoints(0, 1, 1)).toEqual([0, 1]);
    expect(samplePoints(2, 2, 4)).toEqual([2, 2, 2, 2]);
  });
});

describe("histogram binning", () => {
  it("suggestedBinCount by rule", () => {
    const s = Array.from({ length: 100 }, (_, i) => i);
    expect(suggestedBinCount(s, "sturges")).toBe(8);
    expect(suggestedBinCount(s, "freedman-diaconis")).toBeGreaterThan(3);
    expect(suggestedBinCount(s, "scott")).toBeGreaterThan(3);
    expect(suggestedBinCount(s)).toBeGreaterThanOrEqual(8);
    expect(suggestedBinCount([], "auto")).toBe(1);
    expect(suggestedBinCount([4], "auto")).toBe(1);
    expect(suggestedBinCount([4, 4, 4], "auto")).toBe(1);
    expect(
      suggestedBinCount(
        Array.from({ length: 1e5 }, (_, i) => i),
        "sturges",
      ),
    ).toBeLessThanOrEqual(120);
    // An IQR of 0 falls back to Sturges.
    expect(suggestedBinCount([1, 1, 1, 1, 1, 1, 1, 1, 50], "freedman-diaconis")).toBe(Math.ceil(Math.log2(9)) + 1);
  });
  it("niceStep snaps to 1/2/2.5/5 x 10^k", () => {
    expect(niceStep(0.7)).toBe(0.5);
    expect(niceStep(1.1)).toBe(1);
    expect(niceStep(3.9)).toBe(5);
    expect(niceStep(180)).toBe(200);
    expect(niceStep(23)).toBe(25);
    expect(niceStep(0)).toBe(1);
    expect(niceStep(-3)).toBe(1);
    expect(niceStep(Number.NaN)).toBe(1);
    expect(niceStep(Infinity)).toBe(1);
  });
  it("bins cover every value exactly once, edges are contiguous and round", () => {
    const values = Array.from({ length: 200 }, (_, i) => (i * 7) % 83);
    const sorted = [...values].sort((a, b) => a - b);
    const bins = histogramBins(sorted);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(200);
    for (let i = 1; i < bins.length; i++) expect(bins[i]!.x0).toBeCloseTo(bins[i - 1]!.x1, 8);
    expect(bins[0]!.x0).toBeLessThanOrEqual(0);
    expect(bins[bins.length - 1]!.x1).toBeGreaterThanOrEqual(82);
    const step = bins[0]!.x1 - bins[0]!.x0;
    expect(
      [1, 2, 2.5, 5].some(
        (m) => Math.abs(Math.log10(step / m) % 1) < 1e-6 || Math.abs((Math.log10(step / m) % 1) - 1) < 1e-6,
      ),
    ).toBe(true);
  });
  it("a value on the top edge belongs to the last bin", () => {
    const bins = histogramBins([0, 5, 10], { bins: 2, nice: false });
    expect(bins).toEqual([
      { x0: 0, x1: 5, count: 1 },
      { x0: 5, x1: 10, count: 2 },
    ]);
  });
  it("explicit bin count (clamped), nice=false keeps the exact count", () => {
    const sorted = Array.from({ length: 50 }, (_, i) => i);
    expect(histogramBins(sorted, { bins: 5, nice: false })).toHaveLength(5);
    expect(histogramBins(sorted, { bins: 0, nice: false })).toHaveLength(1);
    expect(histogramBins(sorted, { bins: 9999, nice: false })).toHaveLength(500);
    expect(histogramBins(sorted, { bins: "sturges", nice: false }).length).toBe(suggestedBinCount(sorted, "sturges"));
  });
  it("domain leaves outside values out and swaps reversed bounds", () => {
    const sorted = [1, 2, 3, 4, 50];
    const bins = histogramBins(sorted, { domain: [0, 10], bins: 5, nice: false });
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(4);
    expect(histogramBins(sorted, { domain: [10, 0], bins: 5, nice: false })).toEqual(bins);
    expect(histogramBins(sorted, { domain: [Number.NaN, 10] })).toEqual([]);
  });
  it("a single distinct value gets one bin around it", () => {
    const nice = histogramBins([4, 4, 4]);
    expect(nice.reduce((s, b) => s + b.count, 0)).toBe(3);
    expect(nice[0]!.x0).toBeLessThan(4);
    expect(nice[nice.length - 1]!.x1).toBeGreaterThan(4);
    const raw = histogramBins([0, 0], { nice: false, bins: 3 });
    expect(raw.reduce((s, b) => s + b.count, 0)).toBe(2);
    expect(histogramBins([])).toEqual([]);
  });
  it("negative and fractional data", () => {
    const sorted = [-3.5, -1.25, 0, 0.75, 2.5];
    const bins = histogramBins(sorted, { bins: 4 });
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(5);
    expect(bins[0]!.x0).toBeLessThanOrEqual(-3.5);
    for (const b of bins) expect(String(b.x0).length).toBeLessThan(10);
  });
  it("binEdgeFormat adds decimals only when needed to keep edges distinct", () => {
    const wide = [
      { x0: 0, x1: 10, count: 1 },
      { x0: 10, x1: 20, count: 1 },
    ];
    expect(binEdgeFormat(wide)(10)).toBe("10");
    const fine = [
      { x0: 0, x1: 0.04, count: 1 },
      { x0: 0.04, x1: 0.08, count: 1 },
    ];
    const f = binEdgeFormat(fine);
    expect(new Set([0, 0.04, 0.08].map(f)).size).toBe(3);
    expect(binEdgeFormat([])(5)).toBe("5");
    expect(binEdgeFormat(wide, "de")(1500)).toBe("1.500");
  });
});

describe("histogram text + layout helpers", () => {
  it("edgeAnchor flips near the plot edges", () => {
    expect(edgeAnchor(50, 20, 0, 100)).toBe("middle");
    expect(edgeAnchor(95, 20, 0, 100)).toBe("end");
    expect(edgeAnchor(5, 20, 0, 100)).toBe("start");
  });
  it("signedText", () => {
    expect(signedText(5, "5")).toBe("+5");
    expect(signedText(-5, "-5")).toBe("−5");
    expect(signedText(5, "+5")).toBe("+5");
    expect(signedText(0, "0")).toBe("0");
    expect(signedText(3, "−3")).toBe("−3");
  });
  it("chartMirror mirrors x and keys in RTL only", () => {
    const ltr = chartMirror(false, 200);
    const rtl = chartMirror(true, 200);
    expect(ltr.x(30)).toBe(30);
    expect(rtl.x(30)).toBe(170);
    expect(ltr.left(30, 20)).toBe(30);
    expect(rtl.left(30, 20)).toBe(150);
    expect(ltr.anchor("start")).toBe("start");
    expect(rtl.anchor("start")).toBe("end");
    expect(rtl.anchor("end")).toBe("start");
    expect(rtl.anchor("middle")).toBe("middle");
    expect(ltr.transform).toBeUndefined();
    expect(rtl.transform).toBe("matrix(-1 0 0 1 200 0)");
    expect([ltr.next, ltr.prev, rtl.next, rtl.prev]).toEqual(["ArrowRight", "ArrowLeft", "ArrowLeft", "ArrowRight"]);
  });
  it("isolate wraps text in bidi isolates", () => expect(isolate("abc")).toBe("⁨abc⁩"));
  it("textWidth scales with size and bold, and glyph class", () => {
    expect(textWidth("")).toBe(0);
    expect(textWidth("abc", 20)).toBeCloseTo(textWidth("abc", 10) * 2);
    expect(textWidth("abc", 10, true)).toBeGreaterThan(textWidth("abc", 10));
    expect(textWidth("ABC")).toBeGreaterThan(textWidth("abc"));
    expect(textWidth("1")).toBeGreaterThan(0);
  });
  it("fitText truncates with an ellipsis", () => {
    expect(histFitText("short", 500)).toBe("short");
    const out = histFitText("a really quite long label indeed", 60);
    expect(out.endsWith("…")).toBe(true);
    expect(textWidth(out)).toBeLessThanOrEqual(60 + textWidth("…"));
    expect(histFitText("abc", 0)).toBe("a…");
  });
  it("insideTicks stays within the domain and yields at least two ticks when it can", () => {
    const t = insideTicks(0, 100, { length: 300, axis: "x", format: formatCompact });
    expect(t.length).toBeGreaterThanOrEqual(2);
    expect(Math.min(...t)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...t)).toBeLessThanOrEqual(100);
    expect(insideTicks(3, 3, { length: 100, axis: "y", format: formatCompact }).length).toBeGreaterThanOrEqual(0);
    expect(insideTicks(0.2, 0.9, { length: 40, axis: "y", format: formatCompact }).length).toBeGreaterThanOrEqual(2);
  });
});

describe("boxPlotStats / ridgeline stats", () => {
  it("computes a Tukey box from raw values, with outliers", () => {
    const [g] = boxPlotStats([{ label: "A", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] }]);
    expect(g).toMatchObject({ label: "A", n: 10, median: 5.5, low: 1, high: 9, min: 1, max: 100, outliers: [100] });
    expect(g!.q1).toBeCloseTo(3.25);
    expect(g!.q3).toBeCloseTo(7.75);
    expect(g!.mean).toBeCloseTo(14.5);
    expect(g!.density).toBeNull();
    expect(g!.color).toContain("--sheen-chart-1");
  });
  it("prefers explicit summaries and orders mixed-up quartiles", () => {
    const [g] = boxPlotStats([
      {
        label: "S",
        summary: { low: 1, q1: 8, median: 6, q3: 4, high: 9, mean: 5, n: 40, outliers: [30, 20, Number.NaN] },
      },
    ]);
    expect(g).toMatchObject({ q1: 4, q3: 8, median: 6, n: 40, mean: 5 });
    expect(g!.outliers).toEqual([20, 30]);
    expect(g!.max).toBe(30);
    expect(g!.high).toBe(9);
  });
  it("skips groups with no usable numbers, keeps the rest, disambiguates duplicate labels, honours colour", () => {
    const out = boxPlotStats(
      [
        { label: "empty", values: [] },
        { label: "bad", summary: { low: Number.NaN, q1: 1, median: 2, q3: 3, high: 4 } },
        { label: "dup", values: [1, 2, 3], color: 4 },
        { label: "dup", values: [4, 5, 6] },
      ],
      1.5,
      undefined,
      2,
    );
    expect(out.map((g) => g.label)).toEqual(["dup", "dup"]);
    expect(new Set(out.map((g) => g.key)).size).toBe(2);
    expect(out[0]!.color).toContain("--sheen-chart-4");
    expect(out[1]!.color).toContain("--sheen-chart-2");
  });
  it("violin mode adds a density outline from 3+ values (not for fewer or constant data)", () => {
    const [v] = boxPlotStats([{ label: "V", values: [1, 2, 2, 3, 3, 3, 4, 4, 5] }], 1.5, undefined, 1, true);
    expect(v!.density).toHaveLength(56);
    expect(v!.density!.every(([x, d]) => Number.isFinite(x) && d >= 0)).toBe(true);
    expect(boxPlotStats([{ label: "V", values: [1, 2] }], 1.5, undefined, 1, true)[0]!.density).toBeNull();
    expect(boxPlotStats([{ label: "V", values: [4, 4, 4, 4] }], 1.5, undefined, 1, true)[0]!.density).toBeNull();
    const custom = boxPlotStats([{ label: "V", values: [1, 2, 2, 3, 3, 3, 4, 4, 5] }], 1.5, 0.3, 1, true)[0]!.density!;
    expect(Math.max(...custom.map((p) => p[1]))).toBeGreaterThan(Math.max(...v!.density!.map((p) => p[1])));
  });
  it("whisker minmax removes outliers", () => {
    const [g] = boxPlotStats([{ label: "A", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] }], "minmax");
    expect(g!.outliers).toEqual([]);
    expect(g!.high).toBe(100);
  });

  it("ridgeline quantile / summarize / bandwidth / kde", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, 2, 3, 4], 2)).toBe(4);
    expect(Number.isNaN(quantile([], 0.5))).toBe(true);
    const s = summarize([4, 1, Number.NaN, 3, 2]);
    expect(s).toMatchObject({ n: 4, min: 1, max: 4, median: 2.5, mean: 2.5 });
    expect(summarize([]).n).toBe(0);
    expect(Number.isNaN(summarize([]).mean)).toBe(true);
    expect(ridgeBandwidth([1], 10)).toBeCloseTo(0.5);
    expect(ridgeBandwidth([])).toBeGreaterThan(0);
    expect(ridgeBandwidth([5, 5, 5], 2)).toBeCloseTo(0.1);
    expect(ridgeBandwidth([1, 2, 3, 4, 5, 6, 7, 8])).toBeGreaterThan(0.3);
    const d = kde([0], [-1, 0, 1], 1);
    expect(d[1]!).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
    expect(d[0]).toBeCloseTo(d[2]!, 10);
    expect(kde([], [0], 1)).toEqual([0]);
    expect(kde([1], [0], 0)).toEqual([0]);
    expect(kde([0], [100], 1)).toEqual([0]);
  });
});

describe("geo projection", () => {
  it("Equal Earth: the centre maps to the frame centre, east is right and north is up", () => {
    const [cx, cy] = projectWorld(0, 0);
    expect(cx).toBeCloseTo(WORLD_FRAME_WIDTH / 2, 3);
    expect(cy).toBeGreaterThan(0);
    expect(cy).toBeLessThan(WORLD_FRAME_HEIGHT);
    expect(projectWorld(90, 0)[0]).toBeGreaterThan(cx);
    expect(projectWorld(-90, 0)[0]).toBeLessThan(cx);
    expect(projectWorld(0, 60)[1]).toBeLessThan(cy);
    expect(projectWorld(0, -40)[1]).toBeGreaterThan(cy);
  });
  it("is symmetric about the meridian and the equator-ish centre line", () => {
    const [a] = projectWorld(30, 20);
    const [b] = projectWorld(-30, 20);
    expect(a - WORLD_FRAME_WIDTH / 2).toBeCloseTo(WORLD_FRAME_WIDTH / 2 - b, 6);
  });
  it("stays inside the frame for the whole globe and clamps out-of-range input", () => {
    for (const lon of [-180, -90, 0, 90, 180]) {
      for (const lat of [-90, -45, 0, 45, 90]) {
        const [x, y] = projectWorld(lon, lat);
        expect(x).toBeGreaterThanOrEqual(-1);
        expect(x).toBeLessThanOrEqual(WORLD_FRAME_WIDTH + 1);
        expect(y).toBeGreaterThanOrEqual(-1);
        expect(y).toBeLessThanOrEqual(WORLD_FRAME_HEIGHT + 1);
      }
    }
    expect(projectWorld(540, 0)).toEqual(projectWorld(180, 0));
    expect(projectWorld(0, 200)).toEqual(projectWorld(0, 90));
    expect(projectWorld(0, -200)).toEqual(projectWorld(0, -90));
  });
  it("known places land in the right hemisphere of the frame", () => {
    const london = projectWorld(-0.12, 51.5);
    const tokyo = projectWorld(139.7, 35.7);
    const sydney = projectWorld(151.2, -33.9);
    const nyc = projectWorld(-74, 40.7);
    expect(nyc[0]).toBeLessThan(london[0]);
    expect(london[0]).toBeLessThan(tokyo[0]);
    expect(sydney[1]).toBeGreaterThan(tokyo[1]);
  });
  it("divergingColor", () => {
    expect(divergingColor(0)).toBe(divergingColor(Number.NaN));
    expect(divergingColor(-1)).toContain("--sheen-chart-2");
    expect(divergingColor(1)).toContain("--sheen-chart-7");
    expect(divergingColor(-5)).toBe(divergingColor(-1));
    expect(divergingColor(0.5, [3, 4])).toContain("--sheen-chart-4");
  });
  it("worldCountryName localises with Intl and falls back to the shape name", () => {
    expect(worldCountryName({ a2: "DE", name: "Germany" })).toBe("Germany");
    expect(worldCountryName({ a2: "DE", name: "Germany" }, "de")).toBe("Deutschland");
    expect(worldCountryName({ a2: "", name: "Somewhere" })).toBe("Somewhere");
    expect(worldCountryName({ a2: "ZZ", name: "Nowhere" }, "en")).toMatch(/Nowhere|Unknown/);
    expect(worldCountryName({ a2: "FR", name: "France" }, "not a locale!!")).toBe("France");
  });
});

describe("waffle, pie, scatter, combo, percent folding", () => {
  it("waffleCells uses largest remainders so cells always add up", () => {
    expect(waffleCells([50, 30, 20], 100, 100)).toEqual([50, 30, 20]);
    expect(waffleCells([1, 1, 1], 3, 10).reduce((s, n) => s + n, 0)).toBe(10);
    expect(waffleCells([33, 33, 34], 100, 10).reduce((s, n) => s + n, 0)).toBe(10);
    // A partial fill leaves cells empty.
    expect(waffleCells([25], 100, 100)).toEqual([25]);
    // The component passes whole = max(total, sum), so cells never exceed the grid.
    expect(waffleCells([80, 80], 160, 100).reduce((s, n) => s + n, 0)).toBe(100);
  });
  it("waffleCells keeps tiny positive values visible (at least one cell) by taking from the largest", () => {
    const out = waffleCells([99.6, 0.2, 0.2], 100, 100);
    expect(out[1]).toBe(1);
    expect(out[2]).toBe(1);
    expect(out.reduce((s, n) => s + n, 0)).toBe(100);
  });
  it("waffleCells degenerate input", () => {
    expect(waffleCells([1, 2], 0, 100)).toEqual([0, 0]);
    expect(waffleCells([1, 2], -3, 100)).toEqual([0, 0]);
    expect(waffleCells([1, 2], 10, 0)).toEqual([0, 0]);
    expect(waffleCells([], 10, 100)).toEqual([]);
    expect(waffleCells([0, 0], 10, 100)).toEqual([0, 0]);
  });
  it("foldWaffleItems keeps up to 8 items and folds the rest into Other", () => {
    const small = foldWaffleItems([
      { label: "a", value: 3 },
      { label: "b", value: -2 },
      { label: "c", value: Number.NaN, color: 5 },
    ]);
    expect(small).toEqual([
      { label: "a", value: 3, slot: 1 },
      { label: "b", value: 0, slot: 2 },
      { label: "c", value: 0, slot: 5 },
    ]);
    const many = foldWaffleItems(
      Array.from({ length: 11 }, (_, i) => ({ label: `i${i}`, value: i + 1 })),
      "Rest",
    );
    expect(many).toHaveLength(8);
    expect(many[7]).toEqual({ label: "Rest", value: 1 + 2 + 3 + 4, slot: 0 });
    expect(many.map((m) => m.label)).not.toContain("i0");
  });
  it("foldSlices folds the smallest slices into a single Other, with shares summing to 100", () => {
    const data = Array.from({ length: 12 }, (_, i) => ({ label: `s${i}`, value: 12 - i }));
    const out = foldSlices(data, 5, "Misc");
    expect(out).toHaveLength(5);
    expect(out[4]).toMatchObject({ label: "Misc", other: true, slot: 0 });
    expect(out[4]!.members).toHaveLength(8);
    expect(out.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100, 6);
    expect(out[0]!.label).toBe("s0");
  });
  it("foldSlices leaves few slices alone, drops zero / negative / NaN, handles duplicate labels and all-zero input", () => {
    const out = foldSlices([
      { label: "a", value: 5 },
      { label: "a", value: 5 },
      { label: "z", value: 0 },
      { label: "n", value: -4 },
      { label: "x", value: Number.NaN },
    ]);
    expect(out.map((s) => s.label)).toEqual(["a", "a"]);
    expect(new Set(out.map((s) => s.id)).size).toBe(2);
    expect(out[0]!.share).toBe(50);
    expect(foldSlices([{ label: "a", value: 0 }])).toEqual([]);
    expect(foldSlices([])).toEqual([]);
    // maxSlices is clamped to at least 2.
    expect(
      foldSlices(
        [
          { label: "a", value: 3 },
          { label: "b", value: 2 },
          { label: "c", value: 1 },
        ],
        0,
      ),
    ).toHaveLength(2);
  });
  it("pie spreadLabels keeps a minimum gap, within bounds, or gives up", () => {
    const out = pieSpread([10, 12, 14, 80], 16, 0, 200)!;
    for (let i = 1; i < out.length; i++) expect(out[i]!).toBeGreaterThanOrEqual(out[i - 1]! + 16 - 1e-6);
    expect(Math.min(...out)).toBeGreaterThanOrEqual(0);
    expect(pieSpread([0, 1, 2, 3, 4], 30, 0, 50)).toBeNull();
    expect(pieSpread([], 10, 0, 10)).toEqual([]);
    // Original order is preserved for the results.
    const shuffled = pieSpread([80, 10, 12], 16, 0, 200)!;
    expect(shuffled[0]).toBe(80);
    expect(shuffled[2]! - shuffled[1]!).toBeGreaterThanOrEqual(16 - 1e-6);
  });
  it("linearRegression", () => {
    const r = linearRegression([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ])!;
    expect(r.slope).toBeCloseTo(2);
    expect(r.intercept).toBeCloseTo(1);
    expect(r.r2).toBeCloseTo(1);
    const noisy = linearRegression([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 4 },
    ])!;
    expect(noisy.r2).toBeGreaterThan(0.3);
    expect(noisy.r2).toBeLessThan(1);
    expect(
      linearRegression([
        { x: 0, y: 4 },
        { x: 5, y: 4 },
      ])!.r2,
    ).toBe(1);
    expect(linearRegression([{ x: 1, y: 1 }])).toBeNull();
    expect(
      linearRegression([
        { x: 2, y: 1 },
        { x: 2, y: 9 },
      ]),
    ).toBeNull();
    expect(
      linearRegression([
        { x: Number.NaN, y: 1 },
        { x: 1, y: Infinity },
        { x: 0, y: 0 },
      ]),
    ).toBeNull();
    expect(linearRegression([])).toBeNull();
  });
  it("foldScatterSeries keeps 3 series and folds the rest into Other", () => {
    const mk = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ label: `s${i}`, data: [{ x: i, y: i }], color: undefined }));
    expect(foldScatterSeries(mk(3))).toHaveLength(3);
    const folded = foldScatterSeries(mk(6), "More");
    expect(folded).toHaveLength(4);
    expect(folded[3]).toMatchObject({ label: "More", other: true, slot: 0 });
    expect(folded[3]!.data).toHaveLength(3);
    expect(scatterLegend(mk(5), "More").map((l) => l.label)).toEqual(["s0", "s1", "s2", "More"]);
    expect(foldScatterSeries([{ label: "x", data: [], color: 6 }])[0]!.slot).toBe(6);
  });
  it("indexSeries rebases to 100 on the first non-zero value", () => {
    const rows = [
      { a: 50, b: 0 },
      { a: 75, b: 10 },
      { a: 25, b: 20 },
    ];
    const out = indexSeries(rows, ["a", "b"]);
    expect(out.map((r) => r[0])).toEqual([100, 150, 50]);
    expect(out.map((r) => r[1])).toEqual([0, 100, 200]);
    expect(indexSeries(rows, ["a"], 1).map((r) => r[0])).toEqual([1, 1.5, 0.5]);
    expect(indexSeries([{ a: 0 }, { a: 0 }], ["a"])).toEqual([[0], [0]]);
    expect(indexSeries([{ a: -50 }, { a: -25 }], ["a"]).map((r) => r[0])).toEqual([100, 150]);
    expect(indexSeries([], ["a"])).toEqual([]);
    expect(indexSeries([{ a: "x" }, { a: 5 }], ["a"]).map((r) => r[0])).toEqual([0, 100]);
  });
  it("percentShares sums to 100 per row, treats negatives and junk as 0", () => {
    const out = percentShares(
      [
        { a: 1, b: 3 },
        { a: 0, b: 0 },
        { a: -5, b: "10" },
        { b: Number.NaN, a: 2 },
      ],
      [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
      ],
    );
    expect(out[0]!.shares).toEqual([25, 75]);
    expect(out[0]!.total).toBe(4);
    expect(out[1]!.shares).toEqual([0, 0]);
    expect(out[2]!.shares).toEqual([0, 100]);
    expect(out[3]!.shares).toEqual([100, 0]);
    expect(percentShares([], [])).toEqual([]);
  });
  it("foldPolarSeries / foldStreamSeries fold the 8th+ series into Other", () => {
    const series = Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `K${i}` }));
    const data = [{ m: "a", ...Object.fromEntries(series.map((s, i) => [s.key, i + 1])) }];
    const polar = foldPolarSeries(data, series, "Others");
    expect(polar.series).toHaveLength(8);
    expect(polar.series[7]!.label).toBe("Others");
    expect(polar.rows[0]!.__other).toBe(8 + 9 + 10);
    const keep = foldPolarSeries(data, series.slice(0, 4));
    expect(keep.rows).toBe(data);
    const stream = foldStreamSeries(data, series, "Others");
    expect(stream.series).toHaveLength(8);
    expect(stream.series[7]!.label).toBe("Others");
    expect(Object.values(stream.rows[0]!).filter((v) => typeof v === "number")).toContain(8 + 9 + 10);
    expect(foldStreamSeries(data, series.slice(0, 3)).rows).toBe(data);
  });
});

describe("combination / cohort / candle / beeswarm / diverging", () => {
  it("cohortModel from counts: ratios, size, weighted average row", () => {
    const m = cohortModel([
      { cohort: "Jan", size: 100, values: [100, 50, 25] },
      { cohort: "Feb", size: 200, values: [200, 100] },
    ]);
    expect(m.periods).toBe(3);
    expect(m.rows[0]).toMatchObject({ average: true, size: 300 });
    expect(m.rows[1]!.cells.map((c) => c.ratio)).toEqual([1, 0.5, 0.25]);
    expect(m.rows[2]!.cells[2]).toEqual({ ratio: null, count: null });
    // Weighted average: (50 + 100) / (100 + 200) in period 1; only Jan reached period 2.
    expect(m.rows[0]!.cells[1]!.ratio).toBeCloseTo(0.5);
    expect(m.rows[0]!.cells[2]).toEqual({ ratio: 0.25, count: 25 });
  });
  it("cohortModel from ratios, with a fixed period count, without the average row", () => {
    const m = cohortModel([{ cohort: "Jan", size: 200, values: [1, 0.5] }], "ratios", 4, true);
    expect(m.rows).toHaveLength(1);
    expect(m.periods).toBe(4);
    expect(m.rows[0]!.cells[1]).toEqual({ ratio: 0.5, count: 100 });
    expect(m.rows[0]!.cells[3]).toEqual({ ratio: null, count: null });
    const two = cohortModel(
      [
        { cohort: "A", size: 10, values: [10] },
        { cohort: "B", size: 10, values: [5] },
      ],
      "counts",
      undefined,
      false,
    );
    expect(two.rows).toHaveLength(2);
  });
  it("cohortModel handles zero size, junk, and empty data", () => {
    const m = cohortModel([
      { cohort: "Z", size: 0, values: [5, Number.NaN] },
      { cohort: "Y", size: Number.NaN, values: [] },
    ]);
    expect(m.rows[1]!.cells[0]).toEqual({ ratio: null, count: 5 });
    expect(m.rows[1]!.cells[1]).toEqual({ ratio: null, count: null });
    expect(cohortModel([])).toEqual({ rows: [], periods: 0 });
    expect(cohortModel([], "counts", -3)).toEqual({ rows: [], periods: 0 });
  });
  it("cohortPercent writes 100% without decimals, otherwise one", () => {
    const p = cohortPercent();
    expect(p(1)).toBe("100%");
    expect(p(0.5)).toBe("50.0%");
    expect(p(0.1234)).toBe("12.3%");
    expect(cohortPercent("de")(0.5)).toMatch(/50,0\s?%/);
    expect(cohortPercent("???invalid???")(0.5)).toBe("50.0%");
    expect(cohortPercent()).toBe(p);
  });
  it("parseCandles normalises OHLC, drops junk rows, computes the moving average and previous close", () => {
    const out = parseCandles(
      [
        { date: "2026-01-01", open: 10, high: 12, low: 9, close: 11, volume: 100 },
        { date: "2026-01-02", open: 11, high: 8, low: 13, close: 12 },
        { date: new Date(2026, 0, 3), open: 12, high: 14, low: 11, close: 10, volume: Number.NaN },
        { date: "2026-01-04", open: Number.NaN, high: 1, low: 1, close: 1 },
        { date: "2026-01-05", open: 10, high: 11, low: 9, close: 13, volume: -4 },
      ],
      2,
    );
    expect(out).toHaveLength(4);
    // high/low are repaired when the row is inverted or the body sticks out.
    expect(out[1]).toMatchObject({ h: 13, l: 8 });
    expect(out[0]).toMatchObject({ v: 100, prev: null, ma: null });
    expect(out[1]!.prev).toBe(11);
    expect(out[1]!.ma).toBeCloseTo(11.5);
    expect(out[2]!.ma).toBeCloseTo(11);
    expect(out[2]!.v).toBeNull();
    expect(out[3]!.v).toBe(0);
    expect(out[3]!.ma).toBeCloseTo(11.5);
    expect(parseCandles([])).toEqual([]);
    expect(parseCandles([{ date: "2026-01-01", open: 1, high: 2, low: 0, close: 1 }], 0)[0]!.ma).toBeNull();
  });
  it("beeswarmOffsets keeps dots at least `gap` apart and centred on the axis when alone", () => {
    expect(beeswarmOffsets([], 8)).toEqual([]);
    expect(beeswarmOffsets([5], 8)).toEqual([0]);
    const xs = [10, 10, 10, 11, 11, 30, 30.5, 31, 100];
    const gap = 8;
    const ys = beeswarmOffsets(xs, gap);
    expect(ys).toHaveLength(xs.length);
    for (let i = 0; i < xs.length; i++) {
      for (let j = i + 1; j < xs.length; j++) {
        expect(Math.hypot(xs[i]! - xs[j]!, ys[i]! - ys[j]!)).toBeGreaterThanOrEqual(gap - 0.75);
      }
    }
    expect(ys[8]).toBe(0);
    // Order of results follows the input order, not the sorted order.
    expect(beeswarmOffsets([50, 0], 4)).toEqual([0, 0]);
    expect(
      beeswarmOffsets(
        Array.from({ length: 300 }, (_, i) => (i % 20) * 1.1),
        6,
      ).every(Number.isFinite),
    ).toBe(true);
  });
  it("divergingLevels splits negative / neutral / positive around the middle", () => {
    const lv = (keys: string[]) => keys.map((key) => ({ key, label: key }));
    const five = divergingLevels(lv(["a", "b", "c", "d", "e"]));
    expect(five.map((l) => l.side)).toEqual(["negative", "negative", "neutral", "positive", "positive"]);
    const four = divergingLevels(lv(["a", "b", "c", "d"]));
    expect(four.map((l) => l.side)).toEqual(["negative", "negative", "positive", "positive"]);
    const none = divergingLevels(lv(["a", "b", "c"]), { neutral: null });
    expect(none.map((l) => l.side)).toEqual(["negative", "positive", "positive"]);
    const named = divergingLevels(lv(["a", "b", "c", "d"]), { neutral: "b" });
    expect(named.map((l) => l.side)).toEqual(["negative", "neutral", "positive", "positive"]);
    const colours = divergingLevels(lv(["a", "b", "c", "d", "e"]), { negativeColor: 3, positiveColor: 4 });
    expect(colours[0]!.color).toContain("--sheen-chart-3");
    expect(colours[4]!.color).toContain("--sheen-chart-4");
    // The extremes are the strongest hue.
    expect(five[0]!.color).toBe("var(--sheen-chart-8)");
    expect(five[1]!.color).toContain("color-mix");
    expect(divergingLevels(lv(["a"]))[0]!.side).toBe("neutral");
    expect(divergingLevels([])).toEqual([]);
  });
});

describe("streamgraph maths", () => {
  const pts = [
    [0, 0],
    [10, 8],
    [20, 3],
    [30, 9],
  ] as const;
  it("curve helpers produce tweenable cubic paths", () => {
    expect(curvePath([])).toBe("");
    expect(curvePath(pts)).toMatch(/^M0.0,0.0 (C[\d.\- ,]+ ?){3}$/);
    expect(curveSegments([[0, 0]])).toBe("");
    expect(curveSegments(pts).match(/C/g)).toHaveLength(3);
    expect(curveSegments(pts, true)).toMatch(/^C/);
    expect(curveSegments(pts, true).endsWith("0.0,0.0")).toBe(true);
  });
  it("bandArea closes between the top and the bottom edge; a single point becomes a short bar", () => {
    const bottom = pts.map(([x, y]) => [x, y + 5] as const);
    const d = bandArea(pts, bottom);
    expect(d.startsWith("M0.0,0.0")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(bandArea([], [])).toBe("");
    expect(bandArea([[5, 5]], [[5, 9]])).toBe("M-1.0,5.0 L11.0,5.0 L11.0,9.0 L-1.0,9.0 Z");
  });
  it("insideOutOrder puts the biggest streams in the middle and returns a permutation", () => {
    const values = [
      [1, 1, 1],
      [9, 9, 9],
      [3, 3, 3],
      [5, 5, 5],
    ];
    const order = insideOutOrder(values);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(insideOutOrder([])).toEqual([]);
    expect(insideOutOrder([[1, 2]])).toEqual([0]);
    const peaked = insideOutOrder([
      [0, 0, 9],
      [9, 0, 0],
      [0, 9, 0],
    ]);
    expect([...peaked].sort()).toEqual([0, 1, 2]);
  });
  it("streamBaseline: silhouette centres on zero; wiggle is centred and finite", () => {
    const values = [
      [1, 2, 3],
      [1, 2, 3],
    ];
    expect(streamBaseline(values, "silhouette")).toEqual([-1, -2, -3]);
    const w = streamBaseline(values, "wiggle");
    expect(w).toHaveLength(3);
    expect(w.every(Number.isFinite)).toBe(true);
    const mid = w.reduce((s, b, j) => s + b + (values[0]![j]! + values[1]![j]!) / 2, 0) / 3;
    expect(mid).toBeCloseTo(0, 8);
    expect(streamBaseline([], "wiggle")).toEqual([]);
    expect(streamBaseline([[0, 0, 0]], "wiggle").every((v) => v === 0)).toBe(true);
  });
});

describe("dates: calendar heatmap + gantt", () => {
  it("toDayNumber / isoDate round-trip ISO dates, Dates and timestamps", () => {
    const d = toDayNumber("2026-03-05")!;
    expect(isoDate(d)).toBe("2026-03-05");
    expect(toDayNumber("2026-03-05T23:59:00")).toBe(d);
    expect(toDayNumber(new Date(2026, 2, 5, 18))).toBe(d);
    expect(toDayNumber(new Date(2026, 2, 5).getTime())).toBe(d);
    expect(toDayNumber("2026-3-5")).toBe(d);
    expect(toDayNumber("2026-03-06")! - d).toBe(1);
    expect(toDayNumber("2026-12-31")! - toDayNumber("2026-01-01")!).toBe(364);
    expect(toDayNumber("2028-03-01")! - toDayNumber("2028-02-28")!).toBe(2);
    expect(toDayNumber("not a date")).toBeNull();
    expect(toDayNumber("")).toBeNull();
    expect(toDayNumber(new Date("nope"))).toBeNull();
    expect(toDayNumber(Number.NaN)).toBeNull();
  });
  it("localeWeekStart: Sunday for en-US, Monday for de, Saturday for ar-EG, falls back sanely", () => {
    expect(localeWeekStart("en-US")).toBe(0);
    expect(localeWeekStart("de")).toBe(1);
    expect(localeWeekStart("en-GB")).toBe(1);
    expect(localeWeekStart("ar-EG")).toBe(6);
    expect(localeWeekStart("fr-FR")).toBe(1);
    expect(localeWeekStart("???")).toBe(1);
    expect([0, 1, 6]).toContain(localeWeekStart());
  });
  it("ganttDay counts whole UTC days and tolerates junk", () => {
    const a = ganttDay("2026-03-01")!;
    expect(ganttDay("2026-03-02")! - a).toBe(1);
    expect(ganttDay(new Date(2026, 2, 1, 23, 30))).toBe(a);
    expect(ganttDay(" 2026-03-01 ")).toBe(a);
    expect(ganttDay("March 1, 2026")).toBe(a);
    expect(ganttDay("2026-02-29x")).toBeNull();
    // An impossible but well-formed date rolls over (UTC), it does not throw.
    expect(ganttDay("2026-02-30")).toBe(ganttDay("2026-03-02"));
    expect(ganttDay(undefined)).toBeNull();
    expect(ganttDay(null)).toBeNull();
    expect(ganttDay("garbage")).toBeNull();
    expect(ganttDay(new Date("garbage"))).toBeNull();
  });
});

describe("geometry helpers (flow-utils, gauge, dumbbell, chart-fit, heatmap colour)", () => {
  it("r2 rounds to 2 decimals and zeroes non-finite", () => {
    expect(r2(1.2345)).toBe(1.23);
    expect(r2(-0.005)).toBe(-0);
    expect(r2(Number.NaN)).toBe(0);
    expect(r2(Infinity)).toBe(0);
  });
  it("polar: 0 rad is straight up, pi/2 is right", () => {
    const [x0, y0] = polar(100, 100, 50, 0);
    expect(x0).toBeCloseTo(100);
    expect(y0).toBeCloseTo(50);
    const [x1, y1] = polar(100, 100, 50, Math.PI / 2);
    expect(x1).toBeCloseTo(150);
    expect(y1).toBeCloseTo(100);
  });
  it("roundedRectPath clamps its radius and tolerates bad sizes", () => {
    expect(roundedRectPath(0, 0, 10, 10, 4)).toBe("M0,4 Q0,0 4,0 H6 Q10,0 10,4 V6 Q10,10 6,10 H4 Q0,10 0,6 Z");
    expect(roundedRectPath(0, 0, 4, 40, 10)).toContain("Q0,0 2,0");
    expect(roundedRectPath(0, 0, -5, Number.NaN)).toMatch(/^M0,0 Q0,0 0,0/);
  });
  it("ringSector builds donut slices, a full ring, and nothing for empty sectors", () => {
    const slice1 = ringSector(100, 100, 40, 80, 0, Math.PI / 2);
    expect(slice1.startsWith("M")).toBe(true);
    expect(slice1.endsWith("Z")).toBe(true);
    expect(slice1.match(/A/g)).toHaveLength(2);
    const pie = ringSector(100, 100, 0, 80, 0, Math.PI / 2);
    expect(pie).toMatch(/ L/);
    expect(pie.match(/A/g)).toHaveLength(1);
    const full = ringSector(100, 100, 40, 80, 0, Math.PI * 2);
    expect(full.match(/A/g)).toHaveLength(4);
    expect(ringSector(100, 100, 0, 80, 0, Math.PI * 2).match(/A/g)).toHaveLength(2);
    expect(ringSector(100, 100, 40, 80, 1, 1)).toBe("");
    expect(ringSector(100, 100, 40, 80, 2, 1)).toBe("");
    expect(ringSector(100, 100, 79, 80, 0, 1)).toBe("");
    expect(ringSector(100, 100, 40, 80, 0, 0.0001, 4)).toBe("");
    // Big arcs set the large-arc flag.
    expect(ringSector(100, 100, 40, 80, 0, Math.PI * 1.5)).toMatch(/ 0 1 1 /);
    // Thin at the inner edge: tapers to a point.
    expect(ringSector(100, 100, 3, 80, 0, 0.2, 6)).toMatch(/Z$/);
  });
  it("slice / mix", () => {
    expect(slice(0, 0.2, 1)).toBe(0);
    expect(slice(0.2, 0.2, 1)).toBe(0);
    expect(slice(5, 0.2, 1)).toBe(1);
    const mid = slice(0.7, 0.2, 1);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(slice(0.5, 0, 1, (t) => t)).toBeCloseTo(0.5);
    expect(slice(1, 0, 0, (t) => t)).toBe(1);
    expect(mix(10, 20, 0.25)).toBe(12.5);
    expect(mix(5, 5, 0.9)).toBe(5);
  });
  it("fitText / wrapText measure real text", () => {
    expect(fitText("Hi", 200)).toBe("Hi");
    expect(fitText("Hi", 0)).toBe("");
    const cut = fitText("A very long category name here", 70);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut.length).toBeLessThan(30);
    expect(fitText("Wide label", 8)).toBe("");
    expect(wrapText("short", 200)).toEqual(["short"]);
    expect(wrapText("oneverylongwordwithnospaces", 40)).toBeNull();
    const two = wrapText("Customer acquisition cost", 110);
    expect(two).not.toBeNull();
    expect(two!.length).toBe(2);
    expect(two![0]).toMatch(/^Customer/);
    expect(wrapText("Supercalifragilistic expialidocious", 30)).toBeNull();
  });
  it("annularSector: arc between radii, empty when degenerate, caps clamp", () => {
    const d = annularSector(100, 100, 40, 80, 0, Math.PI, 6, 6);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(d.match(/A/g)).toHaveLength(2);
    expect(annularSector(100, 100, 40, 80, 1, 1)).toBe("");
    expect(annularSector(100, 100, 80, 40, 0, 1)).toBe("");
    expect(annularSector(100, 100, 40, 80, 0, 0.1, 99, 99)).not.toContain("NaN");
    expect(annularSector(100, 100, 40, 80, 0, Math.PI * 1.9)).toMatch(/ 0 1 1 /);
  });
  it("gaugeLegend maps bands to swatches", () => {
    const items = gaugeLegend([
      { to: 50, label: "Low", color: 3 },
      { to: 100, label: "High", tone: "success" },
      { to: 1, label: "Plain" },
    ]);
    expect(items.map((i) => i.label)).toEqual(["Low", "High", "Plain"]);
    expect(items[0]!.color).toBe("var(--sheen-chart-3)");
    expect(items.every((i) => i.kind === "rect")).toBe(true);
  });
  it("gaugeLegend and band resolution fall back to neutral for an unknown tone (untyped callers) instead of throwing", () => {
    const bad = [{ to: 100, label: "X", tone: "positive" }] as unknown as Parameters<typeof gaugeLegend>[0];
    const [item] = gaugeLegend(bad);
    expect(item!.label).toBe("X");
    expect(item!.color).toBe(gaugeLegend([{ to: 100, label: "N", tone: "neutral" }])[0]!.color);
  });
  it("dumbbell: label spreading keeps the order and spacing, colours derive from the slot", () => {
    const out = dumbbellSpread([10, 12, 14, 100], 16, 0, 200);
    expect(out).toHaveLength(4);
    for (let i = 1; i < 3; i++) expect(out[i]! - out[i - 1]!).toBeGreaterThanOrEqual(16 - 1e-6);
    expect(out[3]).toBe(100);
    expect(Math.min(...out)).toBeGreaterThanOrEqual(0);
    const squeezed = dumbbellSpread([0, 1, 2], 20, 0, 30);
    expect(squeezed[2]! - squeezed[0]!).toBeGreaterThanOrEqual(40 - 1e-6);
    expect(Math.max(...dumbbellSpread([190, 195, 200], 20, 0, 200))).toBeLessThanOrEqual(200);
    expect(dumbbellSpread([], 10, 0, 10)).toEqual([]);
    expect(dumbbellSpread([30, 5], 10, 0, 100)).toEqual([30, 5]);
    expect(dumbbellColors().to).toBe("var(--sheen-chart-1)");
    expect(dumbbellColors(4).to).toBe("var(--sheen-chart-4)");
    expect(dumbbellColors(4).from).toContain("light-dark(");
  });
  it("range-area estimates grow with content and the tooltip flips sides near the edge", () => {
    const small = estimateTooltipWidth("Jan", [{ label: "a", value: "1" }]);
    const big = estimateTooltipWidth("January 2026 overview", [{ label: "Forecast range", value: "1,000 – 2,000" }]);
    expect(small).toBe(144);
    expect(big).toBeGreaterThan(small);
    expect(estimateTooltipHeight(0)).toBe(44);
    expect(estimateTooltipHeight(3)).toBe(44 + 3 * 16 + 2 * 4);
    expect(tooltipSide(10, 100, 500)).toBe("right");
    expect(tooltipSide(450, 100, 500)).toBe("left");
    expect(tooltipSide(200, 400, 500)).toBe("right");
    expect(tooltipSide(300, 400, 500)).toBe("left");
    expect(tooltipContainerWidth("left")).toBe(0);
    expect(tooltipContainerWidth("right")).toBe(Number.POSITIVE_INFINITY);
    expect(estimateReadoutHeight(600, "Jan", [{ label: "x", value: "1" }])).toBe(30);
    expect(
      estimateReadoutHeight(100, "A long title here", [
        { label: "Series one", value: "12,345" },
        { label: "Series two", value: "98,765", key: false },
      ]),
    ).toBeGreaterThan(30);
    expect(longestOf(["a", "ccc", "bb"])).toBe("ccc");
    expect(longestOf([])).toBe("");
    expect(betweenDefault("1", "2")).toBe("1–2");
    expect(betweenDefault("−1", "2")).toBe("−1 – 2");
  });
  it("hueMix / sequentialColor / scalePosition", () => {
    expect(hueMix(2, 0.5)).toBe("color-mix(in oklab, var(--sheen-chart-2) 50.0%, var(--sheen-chart-surface))");
    expect(hueMix(2, 5)).toContain("100.0%");
    expect(hueMix(2, -1)).toContain(" 0.0%");
    expect(hueMix(2, Number.NaN, "red")).toBe("color-mix(in oklab, var(--sheen-chart-2) 0.0%, red)");
    expect(sequentialColor(0)).not.toBe(sequentialColor(1));
    expect(sequentialColor(Number.NaN)).toBe(sequentialColor(0));
    expect(sequentialColor(7)).toBe(sequentialColor(1));
    expect(scalePosition(5, 0, 10)).toBe(0.5);
    expect(scalePosition(-5, 0, 10)).toBe(0);
    expect(scalePosition(50, 0, 10)).toBe(1);
    expect(scalePosition(3, 3, 3)).toBe(0.5);
    expect(scalePosition(0, 0, 0)).toBe(0);
    expect(scalePosition(4.9, 0, 10, 5)).toBe(0.5);
    expect(scalePosition(10, 0, 10, 5)).toBe(1);
    expect(scalePosition(0, 0, 10, 5)).toBe(0);
  });
  it("chartNumberFormat / defaultCompact / defaultPercent", () => {
    const en = chartNumberFormat();
    expect(en.compact(1284)).toBe("1,284");
    expect(en.compact(12_900)).toBe("12.9K");
    expect(en.compact(-3)).toBe("−3");
    expect(en.compact(Number.NaN)).toBe("–");
    expect(en.percent(0.256)).toBe("25.6%");
    expect(en.percent(-0.1)).toBe("−10%");
    expect(en.percent(Infinity)).toBe("–");
    expect(chartNumberFormat("de").percent(0.5)).toMatch(/50\s?%/);
    expect(chartNumberFormat("!!bad!!").compact(5)).toBe("5");
    expect(chartNumberFormat("en")).toBe(en);
    expect(defaultCompact(undefined)).toBe(formatCompact);
    expect(defaultCompact("de")(1500)).toBe("1.500");
    expect(defaultPercent(undefined)(0.5)).toBe("50%");
    expect(defaultPercent("de")(0.5)).toMatch(/50\s?%/);
  });
  it("withMinimum redistributes so every positive length is at least `min` and the total is kept", () => {
    const out = withMinimum([100, 1, 2, 0], 10);
    expect(out[3]).toBe(0);
    expect(out[1]).toBe(10);
    expect(out[2]).toBe(10);
    expect(out.reduce((s, n) => s + n, 0)).toBeCloseTo(103);
    expect(withMinimum([50, 50], 10)).toEqual([50, 50]);
    expect(withMinimum([1, 1, 1], 10)).toEqual([1, 1, 1]);
    expect(withMinimum([5, -3, 7], 0)).toEqual([5, 0, 7]);
    expect(withMinimum([], 3)).toEqual([]);
    expect(withMinimum([0, 0], 3)).toEqual([0, 0]);
  });
  it("fitTicks picks round ticks that fit the axis length", () => {
    const x = fitTicks(0, 100, { length: 600, axis: "x", format: formatCompact });
    const tight = fitTicks(0, 100, { length: 80, axis: "x", format: formatCompact });
    expect(x.length).toBeGreaterThan(tight.length);
    expect(x[0]).toBeLessThanOrEqual(0);
    expect(x[x.length - 1]).toBeGreaterThanOrEqual(100);
    const y = fitTicks(0, 1000, { length: 300, axis: "y", format: formatCompact });
    expect(y.length).toBeGreaterThanOrEqual(3);
    expect(y.length).toBeLessThanOrEqual(8);
    expect(
      fitTicks(0, 100, { length: 5, axis: "y", format: formatCompact, minGap: 100 }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      fitTicks(0, 100, { length: 600, axis: "x", format: formatCompact, labelEvery: 3 }).length,
    ).toBeLessThanOrEqual(x.length);
    expect(fitTicks(5, 5, { length: 200, axis: "y", format: formatCompact }).length).toBeGreaterThanOrEqual(2);
    expect(
      fitTicks(0, 100, { length: 600, axis: "x", format: formatCompact, idealGap: 60 }).length,
    ).toBeGreaterThanOrEqual(x.length);
  });
  it("dockSpace grows with the number of lines the readout wraps to and respects maxLines", () => {
    const one = dockSpace(900, [{ title: "Jan", rows: [{ label: "A", value: "1", color: "red" }] }]);
    const wrapped = dockSpace(160, [
      {
        title: "January",
        rows: [
          { label: "Series one", value: "12,345", color: "red" },
          { label: "Series two", value: "98,765", color: "blue" },
          { label: "Three", value: "5", color: "transparent" },
        ],
      },
    ]);
    expect(wrapped).toBeGreaterThan(one);
    const capped = dockSpace(
      60,
      [
        {
          title: "January",
          rows: Array.from({ length: 8 }, (_, i) => ({ label: `Long series ${i}`, value: "123,456", color: "red" })),
        },
      ],
      1,
    );
    expect(capped).toBe(dockSpace(900, [{ title: "J", rows: [] }], 1));
    expect(dockSpace(900, [])).toBe(one);
  });
});
