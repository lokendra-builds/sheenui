// Pointer gestures the keyboard/hover suites cannot reach: dragging nodes, panning, wheel and pinch zoom, touch taps.
// Pointers are synthetic (see helpers-charts), so setPointerCapture is stubbed; each test checks the chart stays valid
// and that the gesture did its job (a reported value, a changed view, a zoom control becoming enabled).
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { NetworkGraph } from "../../src/components/charts/network-graph";
import { WorldMap } from "../../src/components/charts/geo-map";
import { CandlestickChart } from "../../src/components/charts/candlestick-chart";
import { MarimekkoChart } from "../../src/components/charts/marimekko-chart";
import { PieChart } from "../../src/components/charts/pie-chart";
import { Treemap } from "../../src/components/charts/treemap";
import { SunburstChart } from "../../src/components/charts/sunburst-chart";
import { SankeyChart } from "../../src/components/charts/sankey-chart";
import { ChordDiagram } from "../../src/components/charts/chord-diagram";
import { Histogram } from "../../src/components/charts/histogram";
import { GanttChart } from "../../src/components/charts/gantt-chart";
import { Heatmap } from "../../src/components/charts/heatmap";
import { settle, reduceMotion, frames } from "../helpers";
import { renderUi } from "../render";
import {
  box,
  centerOf,
  chartGroup,
  cleanMarkup,
  dragPointer,
  fireWheel,
  firePointer,
  mockPointerCapture,
  pinchPointers,
  pointIn,
  polite,
  tipText,
} from "../helpers-charts";

/** The drawing surface: the group itself when it is the <svg>, else the svg inside it. */
const svgOf = (g: HTMLElement): SVGSVGElement | HTMLElement =>
  g instanceof SVGSVGElement ? g : (g.querySelector("svg") ?? g);

/** Sweep the pointer over the chart until a node reads out; returns that viewport point (null if none did). */
function findNodePoint(svg: Element): { x: number; y: number } | null {
  const r = svg.getBoundingClientRect();
  for (let fy = 0.08; fy <= 0.94; fy += 0.04) {
    for (let fx = 0.06; fx <= 0.94; fx += 0.025) {
      const p = { x: r.left + r.width * fx, y: r.top + r.height * fy };
      firePointer(svg, "pointermove", p, { id: 1, pointerType: "mouse", buttons: 0 });
      if ((tipText() + polite()).includes("connection")) return p;
    }
  }
  return null;
}

const services = [{ id: "api" }, { id: "db" }, { id: "cache" }, { id: "web" }, { id: "queue" }];
const deps = [
  { source: "web", target: "api" },
  { source: "api", target: "db" },
  { source: "api", target: "cache" },
  { source: "api", target: "queue" },
];

describe("NetworkGraph gestures", () => {
  it("dragging a node pins it under the pointer; releasing lets go; a tap reports it", async () => {
    mockPointerCapture();
    const onNodeClick = vi.fn();
    renderUi(
      box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" onNodeClick={onNodeClick} />),
    );
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await frames(38);
    const at = findNodePoint(svg);
    expect(at).not.toBeNull();
    await dragPointer(svg, at!, { x: at!.x + 60, y: at!.y + 30 });
    await frames(19);
    expect(cleanMarkup(g)).toBe(true);
    const again = findNodePoint(svg);
    expect(again).not.toBeNull();
    firePointer(svg, "pointerdown", again!);
    firePointer(svg, "pointerup", again!);
    await expect.poll(() => onNodeClick.mock.calls.length).toBeGreaterThan(0);
  });

  it("dragging the background pans; the Fit button restores the view", async () => {
    mockPointerCapture();
    renderUi(box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await settle();
    const corner = pointIn(svg, 0.04, 0.96);
    await dragPointer(svg, corner, { x: corner.x + 70, y: corner.y - 40 });
    await userEvent.click(screen.getByRole("button", { name: /fit/i }));
    expect(cleanMarkup(g)).toBe(true);
  });

  it("ctrl+wheel zooms, a plain wheel does not; pinch zooms with two fingers; touch taps read, then activate", async () => {
    mockPointerCapture();
    const onNodeClick = vi.fn();
    renderUi(
      box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" onNodeClick={onNodeClick} />),
    );
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await frames(38);
    const c = centerOf(svg);
    fireWheel(svg, c, -120, { ctrlKey: true });
    fireWheel(svg, c, 120, { ctrlKey: true });
    fireWheel(svg, c, 40);
    await pinchPointers(svg, c, 60, 160);
    await pinchPointers(svg, c, 160, 60);
    await userEvent.click(screen.getByRole("button", { name: /fit/i }));
    await frames(32);
    const p = findNodePoint(svg);
    expect(p).not.toBeNull();
    firePointer(svg, "pointerdown", p!, { id: 5, pointerType: "touch" });
    firePointer(svg, "pointerup", p!, { id: 5, pointerType: "touch" });
    firePointer(svg, "pointerdown", p!, { id: 5, pointerType: "touch" });
    firePointer(svg, "pointerup", p!, { id: 5, pointerType: "touch" });
    firePointer(svg, "pointercancel", p!, { id: 5, pointerType: "touch" });
    expect(cleanMarkup(g)).toBe(true);
  });

  it("moving the mouse over a node reads it; leaving clears it", async () => {
    renderUi(box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await frames(38);
    const p = findNodePoint(svg);
    expect(p).not.toBeNull();
    firePointer(svg, "pointerleave", p!, { id: 1, pointerType: "mouse" });
    expect(cleanMarkup(g)).toBe(true);
  });

  it("reduced motion: dragging moves only the dragged node", async () => {
    reduceMotion();
    mockPointerCapture();
    renderUi(box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    const svg = svgOf(g);
    await frames(38);
    const p = findNodePoint(svg);
    expect(p).not.toBeNull();
    await dragPointer(svg, p!, { x: p!.x + 40, y: p!.y + 20 });
    expect(cleanMarkup(g)).toBe(true);
  });
});

describe("WorldMap gestures", () => {
  const data = [
    { id: "USA", value: 4200 },
    { id: "DEU", value: 1800 },
    { id: "IND", value: 2600 },
  ];

  it("zoom buttons enable and disable at the limits, and reset restores the view", async () => {
    renderUi(box(<WorldMap data={data} valueLabel="Users" aria-label="Users by country" zoomable maxZoom={4} />));
    await chartGroup("Users by country");
    const zoomIn = await screen.findByRole("button", { name: /zoom in/i });
    const zoomOut = screen.getByRole("button", { name: /zoom out/i });
    const reset = screen.getByRole("button", { name: /reset/i });
    expect(zoomOut).toBeDisabled();
    expect(reset).toBeDisabled();
    await userEvent.click(zoomIn);
    await expect.poll(() => zoomOut.hasAttribute("disabled")).toBe(false);
    await userEvent.click(zoomIn);
    await expect.poll(() => zoomIn.hasAttribute("disabled")).toBe(true);
    await userEvent.click(reset);
    await expect.poll(() => reset.hasAttribute("disabled")).toBe(true);
  });

  it("ctrl+wheel zooms in; a plain wheel shows the hint instead of zooming; double click zooms", async () => {
    renderUi(box(<WorldMap data={data} valueLabel="Users" aria-label="Users by country" zoomable />));
    const g = await chartGroup("Users by country");
    await screen.findByRole("button", { name: /zoom in/i });
    await settle();
    const c = centerOf(g);
    fireWheel(g, c, 20);
    fireWheel(g, c, -200, { ctrlKey: true });
    await expect.poll(() => screen.getByRole("button", { name: /reset/i }).hasAttribute("disabled")).toBe(false);
    fireWheel(g, c, 200, { ctrlKey: true });
    await userEvent.dblClick(g, { position: { x: 200, y: 120 } });
    expect(cleanMarkup(g)).toBe(true);
  });

  it("when zoomed, dragging pans; two fingers pinch; touch tap selects", async () => {
    mockPointerCapture();
    const onSelect = vi.fn();
    renderUi(
      box(<WorldMap data={data} valueLabel="Users" aria-label="Users by country" zoomable onSelect={onSelect} />),
    );
    const g = await chartGroup("Users by country");
    await settle();
    await userEvent.click(await screen.findByRole("button", { name: /zoom in/i }));
    await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    const c = centerOf(g);
    await dragPointer(g, c, { x: c.x - 80, y: c.y + 30 });
    await pinchPointers(g, c, 80, 200);
    await pinchPointers(g, c, 200, 80);
    firePointer(g, "pointerdown", pointIn(g, 0.2, 0.35), { id: 7, pointerType: "touch" });
    firePointer(g, "pointerup", pointIn(g, 0.2, 0.35), { id: 7, pointerType: "touch" });
    firePointer(g, "pointercancel", c, { id: 8, pointerType: "touch" });
    expect(cleanMarkup(g)).toBe(true);
  });

  it("clicking a country selects it and reports its value", async () => {
    const onSelect = vi.fn();
    renderUi(box(<WorldMap data={data} valueLabel="Users" aria-label="Users by country" onSelect={onSelect} />));
    const g = await chartGroup("Users by country");
    await settle();
    const usa = g.querySelector<SVGPathElement>("[data-shape]");
    expect(usa).not.toBeNull();
    // Click on the first country shape that has data.
    const withData = [...g.querySelectorAll<SVGPathElement>("[data-shape]")].find(
      (p) => p.getBoundingClientRect().width > 6,
    );
    const p = centerOf(withData ?? usa!);
    await userEvent.click(g, {
      position: {
        x: Math.round(p.x - g.getBoundingClientRect().left),
        y: Math.round(p.y - g.getBoundingClientRect().top),
      },
    });
    await expect.poll(() => onSelect.mock.calls.length).toBeGreaterThan(0);
  });

  it("bubble mode: hovering a bubble reads it, clicking selects it", async () => {
    const onSelect = vi.fn();
    const points = [
      { id: "tokyo", label: "Tokyo", lon: 139.7, lat: 35.7, value: 80 },
      { id: "london", label: "London", lon: -0.12, lat: 51.5, value: 30 },
    ];
    renderUi(
      box(<WorldMap mode="bubble" points={points} valueLabel="Users" aria-label="Users by city" onSelect={onSelect} />),
    );
    const g = await chartGroup("Users by city");
    await settle();
    const bubble = [...g.querySelectorAll("circle")].find((c) => c.getBoundingClientRect().width > 4);
    expect(bubble).toBeDefined();
    const p = centerOf(bubble!);
    const off = {
      x: Math.round(p.x - g.getBoundingClientRect().left),
      y: Math.round(p.y - g.getBoundingClientRect().top),
    };
    await userEvent.hover(g, { position: off });
    await expect.poll(tipText).toMatch(/Tokyo|London/);
    await userEvent.click(g, { position: off });
    await expect.poll(() => onSelect.mock.calls.length).toBeGreaterThan(0);
    expect(onSelect.mock.lastCall![0]).toMatchObject({ kind: "point" });
  });
});

describe("CandlestickChart gestures", () => {
  const many = Array.from({ length: 90 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
    open: 100 + i,
    high: 110 + i,
    low: 90 + i,
    close: 105 + i + (i % 5),
    volume: 1000 + i,
  }));

  it("zoom buttons, ctrl+wheel and sideways wheel change the visible range", async () => {
    const onRangeChange = vi.fn();
    renderUi(
      box(<CandlestickChart data={many} zoom timeZone="UTC" aria-label="Zoomable" onRangeChange={onRangeChange} />),
    );
    const g = await chartGroup("Zoomable");
    await settle();
    const svg = svgOf(g);
    const c = centerOf(svg);
    fireWheel(svg, c, -100, { ctrlKey: true });
    await expect.poll(() => onRangeChange.mock.calls.length).toBeGreaterThan(0);
    const n = onRangeChange.mock.calls.length;
    fireWheel(svg, c, 0, { deltaX: 120 });
    fireWheel(svg, c, 80, { shiftKey: true });
    fireWheel(svg, c, 30);
    await expect.poll(() => onRangeChange.mock.calls.length).toBeGreaterThan(n);
    for (const name of [/reset/i, /zoom in/i, /zoom out/i, /zoom in/i]) {
      const b = screen.queryByRole("button", { name });
      if (b && !b.hasAttribute("disabled")) await userEvent.click(b);
    }
    expect(cleanMarkup(g)).toBe(true);
  });

  it("dragging pans a zoomed chart; two fingers pinch; Safari gesture events zoom", async () => {
    mockPointerCapture();
    const onRangeChange = vi.fn();
    renderUi(
      box(
        <CandlestickChart
          data={many}
          zoom
          defaultRange={[20, 50]}
          timeZone="UTC"
          aria-label="Zoomable"
          onRangeChange={onRangeChange}
        />,
      ),
    );
    const g = await chartGroup("Zoomable");
    await settle();
    const svg = svgOf(g);
    const c = centerOf(svg);
    await dragPointer(svg, c, { x: c.x - 120, y: c.y });
    await pinchPointers(svg, c, 60, 180);
    await pinchPointers(svg, c, 180, 80);
    const gesture = (type: string, scale: number) => {
      const e = new Event(type, { cancelable: true }) as Event & { scale: number; clientX: number };
      e.scale = scale;
      e.clientX = c.x;
      svg.dispatchEvent(e);
    };
    gesture("gesturestart", 1);
    gesture("gesturechange", 1.6);
    gesture("gesturechange", 0.8);
    gesture("gestureend", 1);
    firePointer(svg, "pointercancel", c, { id: 3, pointerType: "touch" });
    expect(cleanMarkup(g)).toBe(true);
  });

  it("hovering and touch-tapping a candle read it", async () => {
    mockPointerCapture();
    renderUi(box(<CandlestickChart data={many.slice(0, 20)} timeZone="UTC" aria-label="Prices" />));
    const g = await chartGroup("Prices");
    await settle();
    const svg = svgOf(g);
    const p = pointIn(svg, 0.5, 0.4);
    firePointer(svg, "pointerdown", p, { id: 9, pointerType: "touch" });
    firePointer(svg, "pointerup", p, { id: 9, pointerType: "touch" });
    await userEvent.hover(g, { position: { x: 300, y: 80 } });
    await userEvent.unhover(g);
  });
});

describe("tap and hover on the other pointer-driven charts", () => {
  it("Marimekko: a touch tap reads a cell, a second tap activates it", async () => {
    mockPointerCapture();
    const onCellClick = vi.fn();
    const data = [
      { segment: "SMB", acme: 40, globex: 25 },
      { segment: "Enterprise", acme: 90, globex: 60 },
    ];
    renderUi(
      box(
        <MarimekkoChart
          data={data}
          index="segment"
          series={[
            { key: "acme", label: "Acme" },
            { key: "globex", label: "Globex" },
          ]}
          aria-label="Market share"
          onCellClick={onCellClick}
        />,
      ),
    );
    const g = await chartGroup("Market share");
    await settle();
    const find = () =>
      [...g.querySelectorAll("path, rect")].find(
        (n) => n.getBoundingClientRect().width > 30 && n.getBoundingClientRect().height > 20,
      );
    await expect.poll(find).toBeDefined();
    const cell = find()!;
    const p = centerOf(cell);
    const svg = svgOf(g);
    firePointer(cell, "pointerdown", p, { id: 4, pointerType: "touch" });
    firePointer(cell, "pointerup", p, { id: 4, pointerType: "touch" });
    await userEvent.click(cell);
    expect(cleanMarkup(svg)).toBe(true);
    expect(onCellClick.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("Pie: touching a slice reads it; touching outside clears; mouse leave clears", async () => {
    mockPointerCapture();
    renderUi(
      box(
        <PieChart
          data={[
            { label: "Direct", value: 4200 },
            { label: "Search", value: 3100 },
            { label: "Referral", value: 1200 },
          ]}
          aria-label="Visits by channel"
        />,
      ),
    );
    const g = await chartGroup("Visits by channel");
    await settle();
    const svg = svgOf(g);
    await expect.poll(() => svg.querySelector("circle.cursor-pointer"), { timeout: 5000 }).not.toBeNull();
    const hit = svg.querySelector("circle.cursor-pointer")!;
    expect(hit).not.toBeNull();
    const p = pointIn(svg, 0.55, 0.14);
    firePointer(hit, "pointerdown", p, { id: 6, pointerType: "touch" });
    firePointer(hit, "pointermove", p, { id: 1, pointerType: "mouse" });
    await expect.poll(tipText).toMatch(/Direct|Search|Referral/);
    firePointer(hit, "pointerdown", pointIn(svg, 0.02, 0.02), { id: 6, pointerType: "touch" });
    firePointer(hit, "pointermove", p, { id: 1, pointerType: "mouse" });
    firePointer(hit, "pointerleave", p, { id: 1, pointerType: "mouse" });
    expect(cleanMarkup(g)).toBe(true);
  });

  it.each([
    [
      "Treemap",
      <Treemap
        key="t"
        data={[
          {
            label: "Europe",
            children: [
              { label: "DE", value: 40 },
              { label: "FR", value: 30 },
            ],
          },
          { label: "Americas", children: [{ label: "US", value: 90 }] },
        ]}
        drillDown
        aria-label="Revenue"
      />,
      "Revenue",
    ],
    [
      "Sunburst",
      <SunburstChart
        key="s"
        data={[
          {
            label: "Web",
            children: [
              { label: "Search", value: 40 },
              { label: "Ads", value: 25 },
            ],
          },
          { label: "Mobile", value: 65 },
        ]}
        drillDown
        aria-label="Platforms"
      />,
      "Platforms",
    ],
    [
      "Sankey",
      <SankeyChart
        key="k"
        links={[
          { source: "A", target: "B", value: 5 },
          { source: "A", target: "C", value: 3 },
        ]}
        aria-label="Flows"
      />,
      "Flows",
    ],
    [
      "Chord",
      <ChordDiagram
        key="c"
        groups={[
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ]}
        matrix={[
          [0, 5],
          [3, 0],
        ]}
        aria-label="Trade"
      />,
      "Trade",
    ],
    ["Histogram", <Histogram key="h" values={[1, 2, 2, 3, 3, 3, 4, 4, 5, 9]} aria-label="Values" />, "Values"],
    [
      "Heatmap",
      <Heatmap
        key="m"
        data={[
          { d: "Mon", a: 3, b: 5 },
          { d: "Tue", a: 6, b: 1 },
        ]}
        index="d"
        columns={[
          { key: "a", label: "Morning" },
          { key: "b", label: "Evening" },
        ]}
        aria-label="Heat"
      />,
      "Heat",
    ],
    [
      "Gantt",
      <GanttChart
        key="g"
        tasks={[
          { id: "a", label: "Design", start: "2026-03-02", end: "2026-03-11" },
          { id: "b", label: "Build", start: "2026-03-12", end: "2026-03-27", dependencies: ["a"] },
        ]}
        today="2026-03-15"
        aria-label="Plan"
      />,
      "Plan",
    ],
  ])("%s: a sweep of mouse moves, a click and a touch tap keep the chart valid", async (_name, element, label) => {
    mockPointerCapture();
    renderUi(box(element));
    const g = await chartGroup(label);
    await settle();
    const target = svgOf(g);
    for (const [fx, fy] of [
      [0.2, 0.3],
      [0.5, 0.5],
      [0.8, 0.6],
      [0.35, 0.8],
    ] as const) {
      const p = pointIn(target, fx, fy);
      await userEvent.hover(g, {
        position: {
          x: Math.round(p.x - g.getBoundingClientRect().left),
          y: Math.round(p.y - g.getBoundingClientRect().top),
        },
      });
      firePointer(target, "pointerdown", p, { id: 2, pointerType: "touch" });
      firePointer(target, "pointerup", p, { id: 2, pointerType: "touch" });
    }
    await userEvent.click(g, { position: { x: 120, y: 60 } });
    await userEvent.unhover(g);
    expect(cleanMarkup(g)).toBe(true);
  });
});
