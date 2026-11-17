import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import {
  ChartPatternDefs,
  dashFor,
  markerPath,
  patternFill,
  resolvePatterns,
} from "../../src/components/charts/chart-patterns";
import { BarChart } from "../../src/components/charts/bar-chart";
import { DonutChart } from "../../src/components/charts/donut-chart";
import { LineChart } from "../../src/components/charts/line-chart";
import { renderUi } from "../render";

const rows = [
  { m: "Jan", a: 1, b: 2, c: 3, d: 4 },
  { m: "Feb", a: 2, b: 3, c: 4, d: 5 },
];
const four = ["a", "b", "c", "d"].map((key) => ({ key, label: key.toUpperCase() }));
const two = four.slice(0, 2);

describe("chart patterns (non-colour cues)", () => {
  it("is automatic above three series and can be forced either way", () => {
    expect(resolvePatterns(undefined, 3)).toBe(false);
    expect(resolvePatterns(undefined, 4)).toBe(true);
    expect(resolvePatterns(false, 6)).toBe(false);
    expect(resolvePatterns(true, 2)).toBe(true);
  });
  it("keeps the first series solid and hatches the rest", () => {
    expect(patternFill(true, "x", 0, "red")).toBe("red");
    expect(patternFill(true, "x", 2, "red")).toBe("url(#x-pat2)");
    expect(patternFill(false, "x", 2, "red")).toBe("red");
    expect(markerPath(0, 4)).toBe("");
    expect(markerPath(2, 4)).toContain("L");
  });
  it("gives series 1 to 8 a distinct hatch and a distinct dash", () => {
    const entries = Array.from({ length: 8 }, (_, i) => ({ index: i + 1, color: "red" }));
    const { container } = renderUi(
      <svg>
        <ChartPatternDefs id="u" entries={entries} />
      </svg>,
    );
    const marks = [...container.querySelectorAll("pattern g")].map((g) => g.innerHTML);
    expect(marks).toHaveLength(8);
    expect(new Set(marks).size).toBe(8);
    const dashes = Array.from({ length: 8 }, (_, i) => dashFor(true, i));
    expect(new Set(dashes).size).toBe(8);
  });
  it("BarChart hatches series 2+ with 4 series, none with 2", () => {
    const { container, rerender } = renderUi(<BarChart data={rows} index="m" series={four} aria-label="Bars" />);
    expect(container.querySelectorAll("pattern").length).toBe(3);
    rerender(<BarChart data={rows} index="m" series={two} aria-label="Bars" />);
    expect(container.querySelectorAll("pattern").length).toBe(0);
    rerender(<BarChart data={rows} index="m" series={two} patterns aria-label="Bars" />);
    expect(container.querySelectorAll("pattern").length).toBe(1);
  });
  it("DonutChart hatches slices when there are more than 3", () => {
    const data = ["A", "B", "C", "D"].map((label, i) => ({ label, value: i + 1 }));
    const { container } = renderUi(<DonutChart data={data} aria-label="Donut" />);
    // Three in the ring and three in the legend swatches.
    expect(container.querySelectorAll("svg:not([data-slot='legend-key']) pattern").length).toBe(3);
    expect(container.querySelectorAll("[data-slot='legend-key'] pattern").length).toBe(3);
  });
  it("LineChart uses marker shapes for series 2+ when patterns are on", async () => {
    const { container } = renderUi(<LineChart data={rows} index="m" series={four} aria-label="Lines" />);
    await screen.findByLabelText("Lines");
    expect(container.querySelectorAll("path[d*='L'][stroke-width='2'][fill]").length).toBeGreaterThan(0);
  });
});
