// The dumbbell chart's per-row motion: the mark writer (final geometry) and the first-view entrance plan.
import { describe, expect, it } from "vitest";

import { dumbbellEntrance, writeDumbbellMark } from "../../src/components/charts/dumbbell-chart/motion";
import { barD, dotPath, FROM_R, TO_R } from "../../src/components/charts/dumbbell-chart/model";

const NS = "http://www.w3.org/2000/svg";
function row(parts: string[]) {
  const g = document.createElementNS(NS, "g") as SVGElement;
  for (const p of parts) {
    const e = document.createElementNS(NS, "path");
    e.setAttribute("data-part", p);
    g.append(e);
  }
  return g;
}
const at = (g: SVGElement, p: string) => g.querySelector(`[data-part="${p}"]`)!;
type Plan = { target: SVGElement | null; keyframes: Record<string, unknown>[]; delay: number; duration: number };
const plan = (v: unknown) => v as Plan[];

describe("writeDumbbellMark", () => {
  it("dumbbell: moves the row to its y and draws the bar and both dots at their x", () => {
    const g = row(["bar", "from", "to"]);
    writeDumbbellMark(null, g, [42.26, 10, 80]);
    expect(g.getAttribute("transform")).toBe("translate(0 42.3)");
    expect(at(g, "bar").getAttribute("d")).toBe(barD(10, 80));
    expect(at(g, "from").getAttribute("d")).toBe(dotPath(10, 0, FROM_R));
    expect(at(g, "to").getAttribute("d")).toBe(dotPath(80, 0, TO_R));
  });

  it("dumbbell: tolerates missing parts and a short state", () => {
    const g = row([]);
    writeDumbbellMark(null, g, []);
    expect(g.getAttribute("transform")).toBe("translate(0 0.0)");
  });

  it("slope: draws the line between the columns, tilts the gradient and shifts the labels", () => {
    const g = row(["line", "grad", "from", "to", "lt", "rt"]);
    writeDumbbellMark({ xL: 20, xR: 120 }, g, [30.04, 90, 31, 88]);
    expect(at(g, "line").getAttribute("d")).toBe("M20,30.0 L120,90.0");
    expect(at(g, "grad").getAttribute("y1")).toBe("30.0");
    expect(at(g, "grad").getAttribute("y2")).toBe("90.0");
    expect(at(g, "from").getAttribute("d")).toBe(dotPath(20, 30.04, FROM_R));
    expect(at(g, "to").getAttribute("d")).toBe(dotPath(120, 90, TO_R));
    expect(at(g, "lt").getAttribute("transform")).toBe("translate(0 31.0)");
    expect(at(g, "rt").getAttribute("transform")).toBe("translate(0 88.0)");
  });

  it("slope: defaults missing numbers to 0", () => {
    const g = row(["line"]);
    writeDumbbellMark({ xL: 1, xR: 2 }, g, []);
    expect(at(g, "line").getAttribute("d")).toBe("M1,0.0 L2,0.0");
  });
});

describe("dumbbellEntrance", () => {
  it("dumbbell: the before dot pops, then the after dot travels out of it drawing the bar", () => {
    const g = row(["from", "bar", "to", "chg"]);
    const p = plan(dumbbellEntrance(null, 0.05, 2, [0, 10, 70], g));
    expect(p.map((x) => x.target)).toEqual([at(g, "from"), at(g, "bar"), at(g, "to"), at(g, "chg")]);
    // Rows stagger by their index.
    expect(p[0]!.delay).toBeCloseTo(0.05 + 2 * 0.05);
    expect(p[1]!.keyframes[0]).toEqual({ transform: "scaleX(0)" });
    // The after dot starts back at the before dot: travel = from - to.
    expect(p[2]!.keyframes[0]!.transform).toBe("translateX(-60.0px) scale(0)");
    expect(p[2]!.keyframes.at(-1)!.transform).toBe("translateX(0px) scale(1)");
    // The change label arrives last.
    expect(p[3]!.delay).toBeGreaterThan(p[2]!.delay);
  });

  it("slope: the line draws left to right, with the after dot and label landing late", () => {
    const g = row(["from", "lt", "line", "to", "rt"]);
    const p = plan(dumbbellEntrance({ xL: 0, xR: 100 }, 0.1, 1, [0, 0, 0, 0], g));
    expect(p.map((x) => x.target)).toEqual([at(g, "from"), at(g, "lt"), at(g, "line"), at(g, "to"), at(g, "rt")]);
    expect(p[2]!.keyframes).toEqual([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }]);
    expect(p[0]!.delay).toBeCloseTo(0.15);
    expect(p[3]!.delay).toBeGreaterThan(p[2]!.delay);
    expect(p[4]!.delay).toBe(p[3]!.delay);
    expect(p[0]!.delay).toBe(p[1]!.delay);
  });
});
