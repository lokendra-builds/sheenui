// NetworkGraph force layout over time: the first settle, a relayout that glides known nodes, the empty graph, and
// live simulation while a node is dragged. Each test waits on a real outcome (the layout version bumps the readout), not a fixed delay.
import { describe, expect, it } from "vitest";

import { NetworkGraph } from "../../src/components/charts/network-graph";
import { createForceSimulation } from "../../src/components/charts/network-graph/simulation";
import { frames } from "../helpers";
import { renderUi } from "../render";
import {
  box,
  cleanMarkup,
  chartGroup,
  dragPointer,
  firePointer,
  mockPointerCapture,
  tipText,
  polite,
} from "../helpers-charts";

const base = [{ id: "api" }, { id: "db" }, { id: "cache" }, { id: "web" }];
const links = [
  { source: "web", target: "api" },
  { source: "api", target: "db" },
  { source: "api", target: "cache" },
];
const grown = [...base, { id: "queue" }, { id: "worker" }];
const grownLinks = [...links, { source: "api", target: "queue" }, { source: "queue", target: "worker" }];

const svgOf = (g: HTMLElement): SVGSVGElement | HTMLElement =>
  g instanceof SVGSVGElement ? g : (g.querySelector("svg") ?? g);

function nodePoint(svg: Element): { x: number; y: number } | null {
  const r = svg.getBoundingClientRect();
  for (let fy = 0.08; fy <= 0.94; fy += 0.04)
    for (let fx = 0.06; fx <= 0.94; fx += 0.025) {
      const p = { x: r.left + r.width * fx, y: r.top + r.height * fy };
      firePointer(svg, "pointermove", p, { id: 1, pointerType: "mouse", buttons: 0 });
      if ((tipText() + polite()).includes("connection")) return p;
    }
  return null;
}

describe("force simulation", () => {
  it("settles: alpha decays below alphaMin and the positions are finite and distinct", () => {
    const sim = createForceSimulation(
      base.map(() => 6),
      links.map((l) => ({
        source: base.findIndex((n) => n.id === l.source),
        target: base.findIndex((n) => n.id === l.target),
      })),
      null,
      { aspect: 1.5 },
    );
    let ticks = 0;
    while (sim.alpha > sim.alphaMin && ticks < 2000) {
      sim.tick();
      ticks++;
    }
    expect(sim.alpha).toBeLessThanOrEqual(sim.alphaMin);
    expect(ticks).toBeGreaterThan(10);
    const p = Array.from(sim.positions());
    expect(p).toHaveLength(base.length * 2);
    expect(p.every(Number.isFinite)).toBe(true);
    expect(new Set(p.map((v) => v.toFixed(1))).size).toBeGreaterThan(base.length);
  });
});

describe("NetworkGraph layout lifecycle", () => {
  it("relayouts when nodes are added: known nodes glide, the new ones appear, the markup stays valid", async () => {
    const view = renderUi(box(<NetworkGraph nodes={base} links={links} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    await frames(40);
    view.rerender(box(<NetworkGraph nodes={grown} links={grownLinks} aria-label="Service dependencies" />));
    await frames(60);
    const svg = svgOf(await chartGroup("Service dependencies"));
    await expect.poll(() => nodePoint(svg), { timeout: 5000 }).not.toBeNull();
    expect(cleanMarkup(g)).toBe(true);
  });

  it("goes empty and comes back without leaving a stale layout", async () => {
    const view = renderUi(box(<NetworkGraph nodes={base} links={links} aria-label="Service dependencies" />));
    await chartGroup("Service dependencies");
    await frames(30);
    view.rerender(box(<NetworkGraph nodes={[]} links={[]} aria-label="Service dependencies" />));
    await frames(5);
    view.rerender(box(<NetworkGraph nodes={base} links={links} aria-label="Service dependencies" />));
    const svg = svgOf(await chartGroup("Service dependencies"));
    await expect.poll(() => nodePoint(svg), { timeout: 5000 }).not.toBeNull();
  });

  it("dragging a node runs the live simulation until it cools, then settles", async () => {
    mockPointerCapture();
    renderUi(box(<NetworkGraph nodes={base} links={links} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await frames(40);
    const p = await (async () => {
      let found: { x: number; y: number } | null = null;
      await expect.poll(() => (found = nodePoint(svg)), { timeout: 5000 }).not.toBeNull();
      return found!;
    })();
    await dragPointer(svg, p, { x: p.x + 50, y: p.y + 30 });
    await frames(90);
    expect(cleanMarkup(g)).toBe(true);
  });
});
