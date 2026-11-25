// Relationship and structure charts: SankeyChart, SunburstChart, ChordDiagram, NetworkGraph (+ force simulation),
// MarimekkoChart, WorldMap, CohortChart, GanttChart, TrackerChart, CategoryBar.
import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { SankeyChart, SankeyTable } from "../../src/components/charts/sankey-chart";
import { SunburstChart, SunburstTable, sunburstLegend } from "../../src/components/charts/sunburst-chart";
import { ChordDiagram, ChordTable, chordLegend } from "../../src/components/charts/chord-diagram";
import {
  NetworkGraph,
  NetworkTable,
  createForceSimulation,
  networkLegend,
} from "../../src/components/charts/network-graph";
import { MarimekkoChart, MarimekkoTable } from "../../src/components/charts/marimekko-chart";
import { WorldMap, WorldMapTable } from "../../src/components/charts/geo-map";
import { CohortChart, CohortTable } from "../../src/components/charts/cohort-chart";
import { GanttChart, GanttTable, ganttLegend } from "../../src/components/charts/gantt-chart";
import { TrackerChart, TrackerTable, trackerToneColor } from "../../src/components/charts/tracker-chart";
import { CategoryBar, CategoryBarTable } from "../../src/components/charts/category-bar";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";
import {
  box,
  chartGroup,
  chartSuite,
  cleanMarkup,
  focusChart,
  hoverAt,
  polite,
  press,
  tipText,
} from "../helpers-charts";

/* ---------------------------------------------------------------- SankeyChart */
const flows = [
  { source: "Search", target: "Signup", value: 60 },
  { source: "Social", target: "Signup", value: 25 },
  { source: "Signup", target: "Paid", value: 30 },
  { source: "Signup", target: "Free", value: 55 },
];
chartSuite({
  name: "SankeyChart",
  label: "Traffic sources",
  emptyProps: { links: [] },
  make: (x) => <SankeyChart links={flows} aria-label="Traffic sources" {...x} />,
  reads: [
    { keys: "{Home}", says: /Search: 60 out, 70.6% of all flow\. 1 flow/ },
    { keys: "{ArrowRight}", says: /Search → Signup: 60, 100% of Search outflow, 70.6% of Signup inflow/ },
    { keys: "{ArrowRight}", says: /Signup: 85 in, 85 out/ },
    { keys: "{ArrowLeft}", says: /Search → Signup/ },
    { keys: "{ArrowDown}", says: /./ },
    { keys: "{End}", says: /Free: 55 in, 64.7% of all flow\. 1 flow/ },
    { keys: "{ArrowUp}", says: /Paid|Free/ },
  ],
  table: {
    el: <SankeyTable links={flows} caption="Flow table" />,
    caption: "Flow table",
    cells: ["Search", "Signup", "60", "Paid", "30"],
  },
  hover: { x: 0.5, y: 0.5, shows: /Signup|in|out/ },
  variations: [
    { name: "ribbons coloured by source", extra: { linkColor: "source" } },
    { name: "ribbons coloured by target", extra: { linkColor: "target" } },
    { name: "gradient ribbons", extra: { linkColor: "gradient" } },
    { name: "left alignment", extra: { align: "left" } },
    { name: "right alignment", extra: { align: "right" } },
    { name: "centre alignment", extra: { align: "center" } },
    { name: "justified", extra: { align: "justify" } },
    { name: "wide nodes and generous padding", extra: { nodeWidth: 24, nodePadding: 30 } },
    { name: "thin nodes, tight padding", extra: { nodeWidth: 4, nodePadding: 2 } },
    { name: "taller chart", extra: { height: 420 } },
    {
      name: "explicit nodes with labels and colours",
      extra: {
        nodes: [
          { id: "Search", label: "Organic search", color: 4 },
          { id: "Paid", label: "Paying", color: 6 },
        ],
      },
    },
    {
      name: "a cycle is broken, not looped",
      extra: {
        links: [
          { source: "A", target: "B", value: 5 },
          { source: "B", target: "C", value: 4 },
          { source: "C", target: "A", value: 3 },
        ],
      },
    },
    {
      name: "self-links and zero values are ignored",
      extra: {
        links: [
          { source: "A", target: "A", value: 5 },
          { source: "A", target: "B", value: 0 },
          { source: "A", target: "B", value: 7 },
        ],
      },
    },
    {
      name: "five columns deep",
      extra: {
        links: [
          { source: "A", target: "B", value: 9 },
          { source: "B", target: "C", value: 8 },
          { source: "C", target: "D", value: 7 },
          { source: "D", target: "E", value: 6 },
        ],
      },
    },
    { name: "a single link", extra: { links: [{ source: "A", target: "B", value: 5 }] } },
    {
      name: "many nodes in a column",
      extra: {
        links: Array.from({ length: 16 }, (_, i) => ({ source: "Root", target: `Leaf ${i + 1}`, value: i + 1 })),
      },
    },
    {
      name: "long node names",
      extra: {
        links: [
          { source: "A very long source name indeed", target: "An even longer target name that goes on", value: 10 },
        ],
      },
    },
    { name: "minimum column width on a narrow chart", extra: { minColumnWidth: 120 }, width: 320 },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} users`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
      reads: [{ keys: "{Home}", says: /60 users/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("SankeyChart clicks", () => {
  it("Enter on a node / ribbon reports it", async () => {
    const onNodeClick = vi.fn();
    const onLinkClick = vi.fn();
    renderUi(
      box(
        <SankeyChart links={flows} aria-label="Traffic sources" onNodeClick={onNodeClick} onLinkClick={onLinkClick} />,
      ),
    );
    await focusChart("Traffic sources");
    await press("{Home}");
    await press("{Enter}");
    expect(onNodeClick).toHaveBeenLastCalledWith({ id: "Search", label: "Search", inflow: 0, outflow: 60 });
    await press("{ArrowRight}");
    await press("{Enter}");
    expect(onLinkClick).toHaveBeenLastCalledWith({ source: "Search", target: "Signup", value: 60 });
  });
});

/* ---------------------------------------------------------------- SunburstChart */
const platform = [
  {
    label: "Web",
    children: [
      { label: "Search", value: 40 },
      { label: "Ads", value: 25 },
    ],
  },
  {
    label: "Mobile",
    children: [
      { label: "iOS", value: 35 },
      { label: "Android", value: 30 },
    ],
  },
];
chartSuite({
  name: "SunburstChart",
  label: "Sessions by platform",
  emptyProps: { data: [] },
  make: (x) => <SunburstChart data={platform} aria-label="Sessions by platform" {...x} />,
  reads: [
    { keys: "{Home}", says: /Web: 65, 50% of total/ },
    { keys: "{ArrowRight}", says: /Mobile: 65, 50% of total/ },
    { keys: "{ArrowDown}", says: /Mobile.*(iOS|Android)|iOS|Android/ },
    { keys: "{ArrowUp}", says: /Mobile: 65/ },
    { keys: "{ArrowLeft}", says: /Web: 65/ },
    { keys: "{End}", says: /Mobile|Android/ },
  ],
  table: {
    el: <SunburstTable data={platform} caption="Platform table" />,
    caption: "Platform table",
    cells: ["Web", "Search", "40", "Mobile", "Android", "30"],
  },
  variations: [
    { name: "drill down", extra: { drillDown: true } },
    {
      name: "starts zoomed into a group",
      extra: { drillDown: true, defaultPath: ["Web"] },
      reads: [{ keys: "{Home}", says: /Search|Web/ }],
    },
    { name: "a fixed number of rings", extra: { rings: 1 } },
    { name: "two rings", extra: { rings: 2 } },
    {
      name: "three levels deep",
      extra: {
        data: [
          {
            label: "World",
            children: [
              {
                label: "EU",
                children: [
                  { label: "DE", value: 5 },
                  { label: "FR", value: 4 },
                ],
              },
              { label: "NA", children: [{ label: "US", value: 9 }] },
            ],
          },
        ],
      },
    },
    {
      name: "flat data",
      extra: {
        data: [
          { label: "A", value: 5 },
          { label: "B", value: 3 },
        ],
      },
    },
    { name: "a single node", extra: { data: [{ label: "Only", value: 5 }] } },
    {
      name: "zero and negative leaves",
      extra: {
        data: [
          { label: "A", value: 0 },
          { label: "B", value: -3 },
          { label: "C", value: 4 },
        ],
      },
    },
    {
      name: "tiny slices next to a giant one",
      extra: {
        data: [
          { label: "Big", value: 10000 },
          { label: "Tiny", value: 1 },
          { label: "Tinier", value: 1 },
        ],
      },
    },
    { name: "taller", extra: { height: 420 } },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} s`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
      reads: [{ keys: "{Home}", says: /65 s/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("SunburstChart drill-down", () => {
  it("Enter zooms into a group, reports the path, Escape zooms back out", async () => {
    const onPathChange = vi.fn();
    renderUi(
      box(<SunburstChart data={platform} drillDown aria-label="Sessions by platform" onPathChange={onPathChange} />),
    );
    await focusChart("Sessions by platform");
    await press("{Home}");
    await press("{Enter}");
    await expect.poll(() => onPathChange.mock.lastCall?.[0] as string[] | undefined).toEqual(["Web"]);
    await press("{Escape}");
    await expect.poll(() => onPathChange.mock.lastCall?.[0] as string[] | undefined).toEqual([]);
  });
  it("a controlled path and leaf clicks", async () => {
    const onNodeClick = vi.fn();
    renderUi(
      box(
        <SunburstChart
          data={platform}
          drillDown
          path={["Mobile"]}
          aria-label="Sessions by platform"
          onNodeClick={onNodeClick}
        />,
      ),
    );
    const g = await chartGroup("Sessions by platform");
    await focusChart("Sessions by platform");
    await press("{Home}");
    await press("{Enter}");
    expect(cleanMarkup(g)).toBe(true);
  });
  it("sunburstLegend lists the top-level groups", () => {
    expect(sunburstLegend(platform).map((i) => i.label)).toEqual(["Web", "Mobile"]);
  });
});

/* ---------------------------------------------------------------- ChordDiagram */
const regions = [
  { id: "eu", label: "Europe" },
  { id: "us", label: "US" },
  { id: "asia", label: "Asia" },
];
const trade = [
  [0, 12, 7],
  [9, 0, 5],
  [4, 6, 0],
];
chartSuite({
  name: "ChordDiagram",
  label: "Trade flows",
  emptyProps: { groups: [], matrix: [] },
  make: (x) => <ChordDiagram groups={regions} matrix={trade} aria-label="Trade flows" {...x} />,
  reads: [
    { keys: "{Home}", says: /Europe: 19 out, 13 in, 44.2% of all flow\. 2 ribbons/ },
    { keys: "{ArrowRight}", says: /US: 14 out, 18 in, 32.6% of all flow\. 2 ribbons/ },
    { keys: "{ArrowDown}", says: /US.*(Europe|Asia)|Europe|Asia/ },
    { keys: "{ArrowRight}", says: /./ },
    { keys: "{End}", says: /Asia: 10 out, 12 in, 23.3% of all flow/ },
    { keys: "{ArrowLeft}", says: /US/ },
  ],
  table: {
    el: <ChordTable groups={regions} matrix={trade} caption="Trade table" />,
    caption: "Trade table",
    cells: ["Europe", "US", "Asia", "12", "9", "7"],
  },
  hover: { x: 0.5, y: 0.5, shows: /→/ },
  variations: [
    { name: "a wider pad angle", extra: { padAngle: 0.15 } },
    { name: "no pad angle", extra: { padAngle: 0 } },
    { name: "without labels", extra: { showLabels: false } },
    { name: "taller", extra: { height: 440 } },
    {
      name: "two groups",
      extra: {
        groups: regions.slice(0, 2),
        matrix: [
          [0, 5],
          [3, 0],
        ],
      },
    },
    {
      name: "self flows on the diagonal",
      extra: {
        matrix: [
          [4, 12, 7],
          [9, 6, 5],
          [4, 6, 8],
        ],
      },
    },
    {
      name: "a group without any flow",
      extra: {
        matrix: [
          [0, 12, 0],
          [9, 0, 0],
          [0, 0, 0],
        ],
      },
    },
    {
      name: "an all-zero matrix shows the empty state",
      extra: {
        matrix: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      },
      empty: true,
    },
    { name: "a ragged matrix", extra: { matrix: [[0, 12], [9]] } },
    {
      name: "negative and non-finite flows",
      extra: {
        matrix: [
          [0, -5, Number.NaN],
          [9, 0, 5],
          [4, 6, 0],
        ],
      },
    },
    {
      name: "colours per group",
      extra: {
        groups: [
          { id: "eu", label: "Europe", color: 3 },
          { id: "us", label: "US", color: 5 },
          { id: "asia", label: "Asia", color: 6 },
        ],
      },
    },
    {
      name: "twelve groups",
      extra: {
        groups: Array.from({ length: 12 }, (_, i) => ({ id: `g${i}`, label: `Group ${i + 1}` })),
        matrix: Array.from({ length: 12 }, (_, i) =>
          Array.from({ length: 12 }, (_, j) => (i === j ? 0 : ((i + 1) * (j + 2)) % 7)),
        ),
      },
    },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} t`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
      reads: [{ keys: "{Home}", says: /19 t/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("ChordDiagram: Enter on a group reports it", async () => {
  const onGroupClick = vi.fn();
  renderUi(box(<ChordDiagram groups={regions} matrix={trade} aria-label="Trade flows" onGroupClick={onGroupClick} />));
  await focusChart("Trade flows");
  await press("{Home}");
  await press("{Enter}");
  expect(onGroupClick).toHaveBeenLastCalledWith({ id: "eu", label: "Europe", outflow: 19, inflow: 13 });
});

it("chordLegend names the groups (and folds extras)", () => {
  expect(chordLegend(regions).map((i) => i.label)).toEqual(["Europe", "US", "Asia"]);
  const many = Array.from({ length: 11 }, (_, i) => ({ id: `g${i}`, label: `G${i}` }));
  expect(chordLegend(many, "More").pop()!.label).toBe("More");
});

/* ---------------------------------------------------------------- NetworkGraph */
const services = [{ id: "api" }, { id: "db" }, { id: "cache" }, { id: "web" }];
const deps = [
  { source: "web", target: "api" },
  { source: "api", target: "db" },
  { source: "api", target: "cache" },
];
chartSuite({
  name: "NetworkGraph",
  label: "Service dependencies",
  emptyProps: { nodes: [], links: [] },
  make: (x) => <NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" {...x} />,
  reads: [
    { keys: "{Home}", says: /api: 3 connections\. Connected to web, db, cache/ },
    { keys: "{ArrowRight}", says: /connection/ },
    { keys: "{PageDown}", says: /connection/ },
    { keys: "{PageUp}", says: /connection/ },
    { keys: "{ArrowDown}", says: /connection/ },
    { keys: "{ArrowLeft}", says: /connection/ },
    { keys: "{ArrowUp}", says: /connection/ },
  ],
  table: {
    el: <NetworkTable nodes={services} links={deps} caption="Dependency table" />,
    caption: "Dependency table",
    cells: ["api", "db", "cache", "web"],
  },
  variations: [
    { name: "all labels", extra: { showLabels: "all" } },
    { name: "no labels", extra: { showLabels: "none" } },
    { name: "auto labels", extra: { showLabels: "auto" } },
    {
      name: "groups colour the nodes",
      extra: {
        nodes: [
          { id: "api", group: "back" },
          { id: "db", group: "back" },
          { id: "cache", group: "back" },
          { id: "web", group: "front" },
        ],
        groups: [
          { id: "back", label: "Back end" },
          { id: "front", label: "Front end", color: 5 },
        ],
      },
    },
    {
      name: "node values size the nodes and link values weight them",
      extra: {
        nodes: services.map((n, i) => ({ ...n, value: (i + 1) * 10 })),
        links: deps.map((l, i) => ({ ...l, value: i + 1 })),
      },
    },
    { name: "custom force settings", extra: { forces: { linkDistance: 80, charge: -300, ticks: 50, gravity: 0.1 } } },
    { name: "a taller canvas", extra: { height: 480 } },
    {
      name: "nodes with labels",
      extra: { nodes: services.map((n) => ({ ...n, label: `Service ${n.id.toUpperCase()}` })) },
      reads: [{ keys: "{Home}", says: /Service API/ }],
    },
    { name: "an isolated node", extra: { nodes: [...services, { id: "lonely" }] } },
    { name: "a single node", extra: { nodes: [{ id: "only" }], links: [] } },
    {
      name: "links to unknown nodes and self links are ignored",
      extra: { links: [...deps, { source: "ghost", target: "api" }, { source: "api", target: "api" }] },
    },
    { name: "duplicate links", extra: { links: [...deps, ...deps] } },
    {
      name: "sixty nodes in a ring",
      extra: {
        nodes: Array.from({ length: 60 }, (_, i) => ({ id: `n${i}`, group: i % 3 ? "a" : "b" })),
        links: Array.from({ length: 60 }, (_, i) => ({ source: `n${i}`, target: `n${(i + 1) % 60}` })),
      },
    },
    { name: "format and locale", extra: { format: (n: number) => `${n} req`, locale: "de" } },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("NetworkGraph interactions", () => {
  it("the zoom toolbar has labelled buttons that work", async () => {
    renderUi(box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" />));
    await chartGroup("Service dependencies");
    const toolbar = screen.getByRole("toolbar");
    const buttons = within(toolbar).getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    for (const b of buttons) expect(b).toHaveAccessibleName();
    for (const b of buttons) await userEvent.click(b);
    expect(cleanMarkup()).toBe(true);
  });
  it("plus, minus and 0 zoom and fit from the keyboard; Enter reports the node", async () => {
    const onNodeClick = vi.fn();
    renderUi(
      box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" onNodeClick={onNodeClick} />),
    );
    await focusChart("Service dependencies");
    await press("{Home}");
    await press("+");
    await press("-");
    await press("0");
    await press("{Enter}");
    expect(onNodeClick).toHaveBeenCalledWith({
      id: "api",
      label: "api",
      group: null,
      connections: ["web", "db", "cache"],
    });
  });
  it("dragging a node moves it and the graph stays valid", async () => {
    renderUi(box(<NetworkGraph nodes={services} links={deps} aria-label="Service dependencies" />));
    const g = await chartGroup("Service dependencies");
    await settle();
    const r = g.getBoundingClientRect();
    await userEvent.hover(g, { position: { x: Math.round(r.width / 2), y: Math.round(r.height / 2) } });
    await userEvent.unhover(g);
    expect(cleanMarkup(g)).toBe(true);
  });
});

describe("createForceSimulation", () => {
  const radii = [8, 8, 8, 8];
  const links = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
  ];
  const settle = (sim: ReturnType<typeof createForceSimulation>) => {
    for (let i = 0; i < 400 && sim.alpha > sim.alphaMin; i++) sim.tick();
    return sim;
  };
  it("is deterministic: the same input gives the same layout", () => {
    const a = settle(createForceSimulation(radii, links, null, { ticks: 120 }));
    const b = settle(createForceSimulation(radii, links, null, { ticks: 120 }));
    expect(a.positions()).toEqual(b.positions());
  });
  it("starts from a spiral (no ticks yet), then cools down to a spread-out layout with linked nodes near each other", () => {
    const sim = createForceSimulation(radii, links, null);
    const start = sim.positions();
    expect(start).toHaveLength(8);
    expect(sim.alpha).toBe(1);
    settle(sim);
    expect(sim.alpha).toBeLessThanOrEqual(sim.alphaMin * 1.01);
    const p = sim.positions();
    expect(p.every(Number.isFinite)).toBe(true);
    expect(p).not.toEqual(start);
    const d = (i: number, j: number) => Math.hypot(p[2 * i]! - p[2 * j]!, p[2 * i + 1]! - p[2 * j + 1]!);
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(d(i, j)).toBeGreaterThan(16);
    // Linked nodes settle near the springs' rest length (38 + both radii = 54).
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 3],
    ] as const) {
      expect(d(a, b)).toBeGreaterThan(35);
      expect(d(a, b)).toBeLessThan(80);
    }
  });
  it("pinned nodes stay put, and a reheated simulation keeps ticking", () => {
    const sim = createForceSimulation(radii, links, [{ x: 100, y: 100 }, null, null, null], { ticks: 0 });
    sim.fx[0] = 100;
    sim.fy[0] = 100;
    sim.alpha = 1;
    for (let i = 0; i < 40; i++) sim.tick();
    expect(sim.x[0]).toBeCloseTo(100, 3);
    expect(sim.y[0]).toBeCloseTo(100, 3);
    expect(sim.alpha).toBeLessThan(1);
    sim.alphaTarget = 0.3;
    for (let i = 0; i < 200; i++) sim.tick();
    expect(sim.alpha).toBeGreaterThan(sim.alphaMin);
  });
  it("coincident nodes are separated without randomness; empty input is fine", () => {
    const sim = settle(
      createForceSimulation(
        [5, 5],
        [],
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        { ticks: 30 },
      ),
    );
    const p = sim.positions();
    expect(Math.hypot(p[0]! - p[2]!, p[1]! - p[3]!)).toBeGreaterThan(5);
    expect(createForceSimulation([], [], null).positions()).toEqual([]);
    expect(
      settle(createForceSimulation([4], [], null, { ticks: 10 }))
        .positions()
        .every(Number.isFinite),
    ).toBe(true);
  });
  it("many nodes use the Barnes-Hut approximation and stay finite", () => {
    const n = 300;
    const sim = createForceSimulation(
      Array.from({ length: n }, () => 4),
      Array.from({ length: n - 1 }, (_, i) => ({ source: i, target: i + 1 })),
      null,
      { ticks: 40, aspect: 2 },
    );
    for (let i = 0; i < 30; i++) sim.tick();
    expect(sim.positions().every(Number.isFinite)).toBe(true);
  });
  it("networkLegend lists groups", () => {
    expect(networkLegend([{ id: "a", label: "Alpha" }, { id: "b" }]).map((i) => i.label)).toEqual(["Alpha", "b"]);
  });
});

/* ---------------------------------------------------------------- MarimekkoChart */
const segments = [
  { segment: "SMB", acme: 40, globex: 25 },
  { segment: "Enterprise", acme: 90, globex: 60 },
];
const vendors = [
  { key: "acme", label: "Acme" },
  { key: "globex", label: "Globex" },
];
chartSuite({
  name: "MarimekkoChart",
  label: "Market share",
  make: (x) => <MarimekkoChart data={segments} index="segment" series={vendors} aria-label="Market share" {...x} />,
  reads: [
    { keys: "{Home}", says: /SMB · Acme: 40, 61.5% of SMB, 18.6% of total/ },
    { keys: "{ArrowRight}", says: /Enterprise · Acme: 90, 60% of Enterprise, 41.9% of total/ },
    { keys: "{ArrowUp}", says: /Enterprise · Globex: 60/ },
    { keys: "{ArrowDown}", says: /Enterprise · Acme: 90/ },
    { keys: "{End}", says: /Enterprise · Globex: 60, 40% of Enterprise, 27.9% of total/ },
    { keys: "{ArrowLeft}", says: /SMB/ },
  ],
  table: {
    el: <MarimekkoTable data={segments} index="segment" series={vendors} indexLabel="Segment" caption="Share table" />,
    caption: "Share table",
    cells: ["SMB", "Enterprise", "40", "90", "60"],
  },
  hover: { x: 0.7, y: 0.5, shows: /of total/ },
  variations: [
    { name: "values in the cells", extra: { cellText: "value" } },
    { name: "shares in the cells", extra: { cellText: "share" } },
    { name: "no cell text", extra: { cellText: "none" } },
    { name: "taller", extra: { height: 400 } },
    { name: "one series", extra: { series: [vendors[0]] } },
    { name: "a column of zeros is skipped", extra: { data: [{ segment: "Dead", acme: 0, globex: 0 }, ...segments] } },
    { name: "negative values are clamped", extra: { data: [{ segment: "Odd", acme: -5, globex: 10 }, ...segments] } },
    { name: "a single column", extra: { data: [segments[0]] } },
    {
      name: "a hairline column next to a giant one",
      extra: {
        data: [
          { segment: "Huge", acme: 100000, globex: 90000 },
          { segment: "Tiny", acme: 1, globex: 1 },
        ],
      },
    },
    {
      name: "ten columns",
      extra: {
        data: Array.from({ length: 10 }, (_, i) => ({ segment: `Seg ${i + 1}`, acme: 10 + i * 5, globex: 30 - i })),
      },
    },
    {
      name: "custom formatters and locale",
      extra: {
        format: (n: number) => `${n} M`,
        formatPercent: (n: number) => `${Math.round(n * 100)} pct`,
        locale: "de",
      },
      reads: [{ keys: "{Home}", says: /40 M/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("MarimekkoChart: clicking / Enter on a cell reports it", async () => {
  const onCellClick = vi.fn();
  renderUi(
    box(
      <MarimekkoChart
        data={segments}
        index="segment"
        series={vendors}
        aria-label="Market share"
        onCellClick={onCellClick}
      />,
    ),
  );
  await focusChart("Market share");
  await press("{Home}");
  await press("{Enter}");
  expect(onCellClick).toHaveBeenLastCalledWith({ column: "SMB", series: "acme", seriesLabel: "Acme", value: 40 });
});

/* ---------------------------------------------------------------- WorldMap */
const users = [
  { id: "USA", value: 4200 },
  { id: "DEU", value: 1800 },
  { id: "IND", value: 2600 },
];
chartSuite({
  name: "WorldMap",
  label: "Users by country",
  emptyProps: null,
  make: (x) => <WorldMap data={users} valueLabel="Users" aria-label="Users by country" {...x} />,
  reads: [
    { keys: "{Home}", says: /United States: 4,200, Rank 1 of 3/ },
    { keys: "{ArrowRight}", says: /./ },
    { keys: "{End}", says: /Germany: 1,800, Rank 3 of 3/ },
    { keys: "{PageUp}", says: /./ },
    { keys: "{PageDown}", says: /./ },
    { keys: "{ArrowLeft}", says: /./ },
    { keys: "{ArrowDown}", says: /./ },
    { keys: "{ArrowUp}", says: /./ },
  ],
  table: {
    el: <WorldMapTable data={users} valueLabel="Users" share caption="Users table" />,
    caption: "Users table",
    cells: ["United States", "4,200", "Germany", "1,800", "India"],
  },
  variations: [
    {
      name: "bubble mode with points",
      extra: {
        mode: "bubble",
        points: [
          { label: "London", lon: -0.12, lat: 51.5, value: 30 },
          { label: "Tokyo", lon: 139.7, lat: 35.7, value: 80 },
          { label: "Sydney", lon: 151.2, lat: -33.9, value: 10 },
        ],
        data: undefined,
      },
      reads: [{ keys: "{Home}", says: /./ }],
    },
    {
      name: "diverging scale around a midpoint",
      extra: {
        scale: "diverging",
        midpoint: 2000,
        data: [
          { id: "USA", value: 4200 },
          { id: "DEU", value: -1800 },
          { id: "IND", value: 2000 },
        ],
      },
    },
    {
      name: "diverging with custom colours",
      extra: {
        scale: "diverging",
        midpoint: 0,
        divergingColors: [3, 6],
        data: [
          { id: "USA", value: 5 },
          { id: "DEU", value: -5 },
        ],
      },
    },
    { name: "log scale", extra: { scaleType: "log" } },
    { name: "quantile scale", extra: { scaleType: "quantile", steps: 4 } },
    { name: "linear scale with steps", extra: { scaleType: "linear", steps: 5 } },
    { name: "explicit domain and colour", extra: { domain: [0, 10000], color: 4 } },
    { name: "no legend", extra: { legend: false } },
    { name: "not zoomable", extra: { zoomable: false } },
    { name: "zoomable with a max zoom", extra: { zoomable: true, maxZoom: 4 } },
    {
      name: "null values read as no data",
      extra: {
        data: [
          { id: "USA", value: null },
          { id: "DEU", value: 5 },
        ],
      },
    },
    {
      name: "unknown country ids are ignored",
      extra: {
        data: [
          { id: "ZZZ", value: 5 },
          { id: "USA", value: 1 },
        ],
      },
    },
    { name: "no data at all", extra: { data: [] } },
    { name: "German country names", extra: { locale: "de" }, reads: [{ keys: "{Home}", says: /Vereinigte Staaten/ }] },
    {
      name: "custom format",
      extra: { format: (n: number) => `${n} users` },
      reads: [{ keys: "{Home}", says: /4200 users/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("WorldMap interactions", () => {
  it("Enter selects the focused country and reports it", async () => {
    const onSelect = vi.fn();
    renderUi(box(<WorldMap data={users} valueLabel="Users" aria-label="Users by country" onSelect={onSelect} />));
    await focusChart("Users by country");
    await press("{Home}");
    await press("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "USA", kind: "country", value: 4200 }));
  });
  it("typing a name jumps to that country; plus / minus / 0 zoom", async () => {
    renderUi(box(<WorldMap data={users} valueLabel="Users" aria-label="Users by country" zoomable />));
    await focusChart("Users by country");
    await press("ger");
    await expect.poll(polite).toMatch(/Germany/);
    await press("+");
    await press("-");
    await press("0");
    expect(cleanMarkup()).toBe(true);
  });
  it("a choropleth with data never shows the empty state (regression: dangling else left `values` empty)", async () => {
    renderUi(box(<WorldMap data={users} valueLabel="Users" aria-label="Users by country" />));
    await chartGroup("Users by country");
    // The overlay is a <p>; the legend's "No data" key (countries without a value) is a <span> and is expected.
    await expect.poll(() => document.querySelector("[data-slot] path")).not.toBeNull();
    expect(screen.queryByText("No data", { selector: "p" })).toBeNull();
  });
  it("a map with no data shows the empty state", async () => {
    renderUi(box(<WorldMap data={[]} valueLabel="Users" aria-label="Users by country" />));
    await expect.poll(() => screen.queryByText("No data", { selector: "p" })).not.toBeNull();
  });
  it("hovering the map shows a country readout", async () => {
    renderUi(box(<WorldMap data={users} valueLabel="Users" aria-label="Users by country" />));
    const g = await chartGroup("Users by country");
    await hoverAt(g, 0.22, 0.38);
    await expect.poll(tipText).toMatch(/\S/);
  });
});

/* ---------------------------------------------------------------- CohortChart */
const cohorts = [
  { cohort: "Jan", size: 100, values: [100, 62, 48, 40] },
  { cohort: "Feb", size: 120, values: [120, 70, 55] },
  { cohort: "Mar", size: 90, values: [90, 50] },
];
describe("CohortChart", () => {
  it("is a read-only grid with an average row, cohort rows and a column per period", async () => {
    renderUi(box(<CohortChart data={cohorts} aria-label="Retention" />));
    const grid = await screen.findByRole("grid", { name: "Retention" });
    expect(grid).toHaveAttribute("aria-readonly", "true");
    const rows = within(grid).getAllByRole("row");
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(grid.textContent).toMatch(/Jan/);
    expect(grid.textContent).toMatch(/Average/);
    expect(grid.textContent).toMatch(/Week 3/);
    expect(grid.textContent).toMatch(/62\.0%/);
  });
  it("arrow keys move between cells and announce them; Home/End/Ctrl+Home/Ctrl+End jump", async () => {
    renderUi(box(<CohortChart data={cohorts} aria-label="Retention" />));
    const grid = await screen.findByRole("grid", { name: "Retention" });
    const entry = grid.querySelector<HTMLElement>('[tabindex="0"]');
    expect(entry).not.toBeNull();
    entry!.focus();
    expect(grid.contains(document.activeElement)).toBe(true);
    await press("{ArrowDown}");
    await press("{ArrowRight}");
    await press("{ArrowRight}");
    await press("{ArrowLeft}");
    await press("{ArrowUp}");
    await press("{End}");
    await press("{Home}");
    await press("{Control>}{End}{/Control}");
    await press("{Control>}{Home}{/Control}");
    expect(cleanMarkup()).toBe(true);
    expect(grid.contains(document.activeElement)).toBe(true);
  });
  it("the view toggle switches between percent and user counts (and reports it)", async () => {
    const onViewChange = vi.fn();
    renderUi(box(<CohortChart data={cohorts} aria-label="Retention" onViewChange={onViewChange} />));
    const grid = await screen.findByRole("grid", { name: "Retention" });
    expect(grid.textContent).toMatch(/%/);
    await userEvent.click(screen.getByRole("button", { name: "Users" }));
    expect(onViewChange).toHaveBeenLastCalledWith("count");
    await expect.poll(() => screen.getByRole("grid", { name: "Retention" }).textContent).toMatch(/62/);
    await userEvent.click(screen.getByRole("button", { name: "%" }));
    expect(onViewChange).toHaveBeenLastCalledWith("percent");
  });
  it("controlled view, defaultView and viewToggle={false}", () => {
    const { rerender } = renderUi(box(<CohortChart data={cohorts} aria-label="Retention" view="count" />));
    expect(screen.getByRole("button", { name: "Users" })).toHaveAttribute("aria-pressed", "true");
    rerender(box(<CohortChart data={cohorts} aria-label="Retention" defaultView="count" />));
    rerender(box(<CohortChart data={cohorts} aria-label="Retention" viewToggle={false} />));
    expect(screen.queryByRole("button", { name: "Users" })).toBeNull();
  });
  it("clicking a cell reports it; ratios; fixed periods; no average; colour, domain, steps, legend", async () => {
    const onCellClick = vi.fn();
    const { rerender } = renderUi(box(<CohortChart data={cohorts} aria-label="Retention" onCellClick={onCellClick} />));
    const grid = await screen.findByRole("grid", { name: "Retention" });
    const cell = within(grid).getAllByRole("gridcell")[5]!;
    await userEvent.click(cell);
    expect(onCellClick).toHaveBeenCalled();
    rerender(
      box(
        <CohortChart
          data={[{ cohort: "Jan", size: 100, values: [1, 0.5, 0.25] }]}
          valuesAre="ratios"
          aria-label="Retention"
        />,
      ),
    );
    rerender(box(<CohortChart data={cohorts} periods={6} average={false} aria-label="Retention" />));
    rerender(
      box(
        <CohortChart
          data={cohorts}
          color={4}
          domain={[0, 1]}
          steps={4}
          legend={false}
          aria-label="Retention"
          maxHeight={160}
        />,
      ),
    );
    rerender(
      box(
        <CohortChart
          data={cohorts}
          locale="de"
          format={(n) => `${n} u`}
          formatPercent={(n) => `${Math.round(n * 100)} pct`}
          aria-label="Retention"
        />,
      ),
    );
    expect(cleanMarkup()).toBe(true);
  });
  it("incomplete and odd data: nulls, zero size, a single cohort, no cohorts", async () => {
    const { rerender } = renderUi(
      box(
        <CohortChart
          data={[
            { cohort: "A", size: 0, values: [5, null, 2] },
            { cohort: "B", size: 10, values: [] },
          ]}
          aria-label="Odd"
        />,
      ),
    );
    expect(await screen.findByRole("grid", { name: "Odd" })).toBeInTheDocument();
    rerender(box(<CohortChart data={[cohorts[0]!]} aria-label="Odd" />));
    expect(screen.getByRole("grid", { name: "Odd" })).toBeInTheDocument();
    rerender(box(<CohortChart data={[]} aria-label="Odd" emptyState="No cohorts yet" />));
    expect(screen.getByText("No cohorts yet")).toBeInTheDocument();
  });
  it("labels translate headers", async () => {
    renderUi(
      box(
        <CohortChart
          data={cohorts}
          aria-label="Retention"
          labels={{ period: (i) => `Woche ${i}`, average: "Durchschnitt", cohort: "Kohorte" }}
        />,
      ),
    );
    const grid = await screen.findByRole("grid", { name: "Retention" });
    expect(grid.textContent).toMatch(/Woche 2/);
    expect(grid.textContent).toMatch(/Durchschnitt/);
  });
  it("table view has a row per cohort", () => {
    renderUi(<CohortTable data={cohorts} caption="Retention table" />);
    const table = screen.getByRole("table", { name: "Retention table" });
    expect(table.textContent).toContain("Jan");
    expect(table.textContent).toContain("Mar");
    expect(table.textContent).toMatch(/62/);
  });
  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div style={{ width: 640 }}>
          <CohortChart data={cohorts} aria-label="Retention" />
        </div>,
        variant,
      );
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------------------------------------------------------------- GanttChart */
const plan = [
  { id: "design", label: "Design", start: "2026-03-02", end: "2026-03-11", progress: 1 },
  { id: "build", label: "Build", start: "2026-03-12", end: "2026-03-27", progress: 0.6, dependencies: ["design"] },
  { id: "launch", label: "Launch", start: "2026-04-01", milestone: true, dependencies: ["build"] },
];
chartSuite({
  name: "GanttChart",
  label: "Project plan",
  emptyProps: { tasks: [] },
  make: (x) => <GanttChart tasks={plan} today="2026-03-15" aria-label="Project plan" {...x} />,
  reads: [
    { keys: "{Home}", says: /Design: Mar 2 – 11, 2026, 10 days, 100% done/ },
    { keys: "{ArrowDown}", says: /Build: Mar 12 – 27, 2026, 16 days, 60% done/ },
    { keys: "{ArrowDown}", says: /Launch: Apr 1, 2026, Milestone, After Build/ },
    { keys: "{ArrowUp}", says: /Build/ },
    { keys: "{End}", says: /Launch: Apr 1, 2026, Milestone/ },
    { keys: "{ArrowRight}", says: /./ },
    { keys: "{ArrowLeft}", says: /./ },
    { keys: "t", says: /./ },
    { keys: "+", says: /./ },
    { keys: "-", says: /./ },
  ],
  table: {
    el: <GanttTable tasks={plan} caption="Plan table" />,
    caption: "Plan table",
    cells: ["Design", "Build", "Launch", "10", "Mar"],
  },
  hover: { x: 0.5, y: 0.35, shows: /days|Milestone/ },
  variations: [
    { name: "day scale", extra: { scale: "day" } },
    { name: "week scale", extra: { scale: "week" } },
    { name: "month scale", extra: { scale: "month" } },
    { name: "automatic initial scale", extra: { defaultScale: "auto" } },
    { name: "a default scale", extra: { defaultScale: "week" } },
    { name: "no toolbar", extra: { toolbar: false } },
    { name: "no today marker", extra: { today: null } },
    { name: "today as a Date", extra: { today: new Date(2026, 2, 20) } },
    { name: "a narrow label column", extra: { labelWidth: 90 } },
    { name: "German locale", extra: { locale: "de" } },
    {
      name: "groups with collapsible rows",
      extra: {
        collapsible: true,
        tasks: [
          { id: "p1", label: "Phase 1", start: "2026-03-02", end: "2026-03-20", group: "Phases" },
          { id: "p2", label: "Phase 2", start: "2026-03-21", end: "2026-04-10", group: "Phases" },
          { id: "x", label: "Extra", start: "2026-03-05", end: "2026-03-09", group: "Other" },
        ],
      },
    },
    {
      name: "groups starting collapsed",
      extra: {
        collapsible: true,
        defaultCollapsed: ["Phases"],
        tasks: [
          { id: "p1", label: "Phase 1", start: "2026-03-02", end: "2026-03-20", group: "Phases" },
          { id: "x", label: "Extra", start: "2026-03-05", end: "2026-03-09", group: "Other" },
        ],
      },
    },
    {
      name: "assignees and colours",
      extra: {
        tasks: plan.map((t, i) => ({
          ...t,
          assignee: ["Ada", "Grace", "Linus"][i],
          color: ((i % 3) + 4) as 4 | 5 | 6,
        })),
      },
    },
    {
      name: "a task without an end is a one-day bar",
      extra: { tasks: [{ id: "a", label: "Open", start: "2026-03-02" }, plan[0]] },
    },
    {
      name: "an end before the start is repaired",
      extra: { tasks: [{ id: "a", label: "Backwards", start: "2026-03-10", end: "2026-03-02" }] },
    },
    {
      name: "progress outside 0-1 is clamped",
      extra: {
        tasks: [
          { id: "a", label: "Over", start: "2026-03-02", end: "2026-03-09", progress: 7 },
          { id: "b", label: "Under", start: "2026-03-02", end: "2026-03-09", progress: -3 },
        ],
      },
    },
    {
      name: "dependencies on unknown tasks are ignored",
      extra: { tasks: [{ id: "a", label: "A", start: "2026-03-02", end: "2026-03-09", dependencies: ["ghost", "a"] }] },
    },
    {
      name: "circular dependencies",
      extra: {
        tasks: [
          { id: "a", label: "A", start: "2026-03-02", end: "2026-03-09", dependencies: ["b"] },
          { id: "b", label: "B", start: "2026-03-10", end: "2026-03-12", dependencies: ["a"] },
        ],
      },
    },
    { name: "invalid dates are skipped", extra: { tasks: [{ id: "a", label: "Bad", start: "not a date" }, plan[0]] } },
    { name: "a single milestone", extra: { tasks: [plan[2]] } },
    {
      name: "a span of two years",
      extra: {
        tasks: [
          { id: "a", label: "Long", start: "2025-01-01", end: "2026-12-31" },
          { id: "b", label: "Short", start: "2026-03-01", end: "2026-03-03" },
        ],
      },
    },
    {
      name: "sixty tasks",
      extra: {
        tasks: Array.from({ length: 60 }, (_, i) => ({
          id: `t${i}`,
          label: `Task ${i + 1}`,
          start: new Date(Date.UTC(2026, 2, 1 + (i % 20))).toISOString().slice(0, 10),
          end: new Date(Date.UTC(2026, 2, 5 + (i % 20) + (i % 7))).toISOString().slice(0, 10),
          progress: (i % 10) / 10,
        })),
      },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

describe("GanttChart interactions", () => {
  it("the toolbar switches scale (aria-pressed) and reports it", async () => {
    const onScaleChange = vi.fn();
    renderUi(
      box(
        <GanttChart
          tasks={plan}
          today="2026-03-15"
          aria-label="Project plan"
          onScaleChange={onScaleChange}
          defaultScale="week"
        />,
      ),
    );
    await chartGroup("Project plan");
    const month = screen.getByRole("button", { name: /Month/ });
    await userEvent.click(month);
    expect(onScaleChange).toHaveBeenLastCalledWith("month");
    await userEvent.click(screen.getByRole("button", { name: /Day/ }));
    expect(onScaleChange).toHaveBeenLastCalledWith("day");
    await userEvent.click(screen.getByRole("button", { name: /Week/ }));
    expect(onScaleChange).toHaveBeenLastCalledWith("week");
    expect(cleanMarkup()).toBe(true);
  });
  it("controlled scale wins; Today and zoom buttons work", async () => {
    renderUi(box(<GanttChart tasks={plan} today="2026-03-15" scale="month" aria-label="Project plan" />));
    await chartGroup("Project plan");
    for (const b of within(document.body).queryAllByRole("button")) {
      if (/Today|Zoom|plus|minus|\+|−/i.test(b.getAttribute("aria-label") ?? b.textContent)) await userEvent.click(b);
    }
    expect(cleanMarkup()).toBe(true);
  });
  it("Enter on a task reports it", async () => {
    const onTaskClick = vi.fn();
    renderUi(box(<GanttChart tasks={plan} today="2026-03-15" aria-label="Project plan" onTaskClick={onTaskClick} />));
    await focusChart("Project plan");
    await press("{Home}");
    await press("{Enter}");
    expect(onTaskClick).toHaveBeenLastCalledWith(plan[0]);
  });
  it("collapsible groups: Left/Right or a button collapse and expand a group", async () => {
    const tasks = [
      { id: "p1", label: "Phase 1", start: "2026-03-02", end: "2026-03-20", group: "Phases" },
      { id: "p2", label: "Phase 2", start: "2026-03-21", end: "2026-04-10", group: "Phases" },
    ];
    renderUi(box(<GanttChart tasks={tasks} collapsible today="2026-03-15" aria-label="Project plan" />));
    await chartGroup("Project plan");
    const toggle = screen.queryAllByRole("button").find((b) => b.hasAttribute("aria-expanded"));
    expect(toggle).toBeDefined();
    const before = toggle!.getAttribute("aria-expanded");
    await userEvent.click(toggle!);
    await expect
      .poll(() =>
        screen
          .queryAllByRole("button")
          .find((b) => b.hasAttribute("aria-expanded"))
          ?.getAttribute("aria-expanded"),
      )
      .not.toBe(before);
  });
  it("the empty prop replaces the default message", () => {
    renderUi(box(<GanttChart tasks={[]} aria-label="Project plan" emptyState="No tasks yet" />));
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });
  it("ganttLegend lists the groups / colours used", () => {
    expect(Array.isArray(ganttLegend(plan))).toBe(true);
    expect(ganttLegend([])).toEqual([]);
  });
  it("hovering a bar shows a readout, and leaving clears it", async () => {
    renderUi(box(<GanttChart tasks={plan} today="2026-03-15" aria-label="Project plan" />));
    const g = await chartGroup("Project plan");
    await hoverAt(g, 0.5, 0.35);
    await expect.poll(tipText).toMatch(/\S/);
    await userEvent.unhover(g);
  });
});

/* ---------------------------------------------------------------- TrackerChart */
const uptime = [
  { label: "Mon", status: "up" },
  { label: "Tue", status: "up" },
  { label: "Wed", status: "down", detail: "API outage, 42 min" },
  { label: "Thu", status: "slow" },
];
const statuses = {
  up: { label: "Operational", tone: "success" as const },
  down: { label: "Outage", tone: "danger" as const, flag: true },
  slow: { label: "Degraded", tone: "warning" as const, striped: true },
};
chartSuite({
  name: "TrackerChart",
  label: "API uptime",
  make: (x) => <TrackerChart data={uptime} statuses={statuses} aria-label="API uptime" {...x} />,
  reads: [
    { keys: "{Home}", says: /Mon: Operational/ },
    { keys: "{ArrowRight}", says: /Tue: Operational/ },
    { keys: "{ArrowRight}", says: /Wed: Outage\. API outage, 42 min/ },
    { keys: "{End}", says: /Thu: Degraded/ },
    { keys: "{ArrowLeft}", says: /Wed: Outage/ },
  ],
  table: {
    el: <TrackerTable data={uptime} statuses={statuses} caption="Uptime table" />,
    caption: "Uptime table",
    cells: ["Mon", "Operational", "Wed", "Outage", "API outage, 42 min"],
  },
  hover: { x: 0.3, y: 0.5, shows: /Operational|Outage|Degraded/ },
  variations: [
    { name: "start and end labels", extra: { startLabel: "4 days ago", endLabel: "Today" } },
    { name: "no legend", extra: { showLegend: false } },
    { name: "taller blocks", extra: { height: 56 } },
    {
      name: "palette-colour tones",
      extra: {
        statuses: {
          up: { label: "Up", tone: 3 },
          down: { label: "Down", tone: 6 },
          slow: { label: "Slow", tone: "neutral" },
        },
      },
    },
    {
      name: "default statuses",
      extra: {
        statuses: undefined,
        data: [
          { label: "Mon", status: "operational" },
          { label: "Tue", status: "unknown" },
        ],
      },
    },
    {
      name: "date labels with a locale",
      extra: {
        data: [
          { label: new Date(Date.UTC(2026, 2, 2)), status: "up" },
          { label: new Date(Date.UTC(2026, 2, 3)), status: "down" },
        ],
        locale: "de",
      },
    },
    {
      name: "a custom label formatter",
      extra: {
        data: [
          { label: 1, status: "up" },
          { label: 2, status: "down" },
        ],
        formatLabel: (d: Date) => `d${d.getTime()}`,
      },
    },
    { name: "an unknown status", extra: { data: [{ label: "Mon", status: "mystery" }] } },
    { name: "a single block", extra: { data: [uptime[0]] } },
    {
      name: "ninety blocks",
      extra: {
        data: Array.from({ length: 90 }, (_, i) => ({ label: `Day ${i + 1}`, status: i % 13 === 0 ? "down" : "up" })),
      },
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});

it("trackerToneColor maps tones and palette slots to colours", () => {
  for (const tone of ["success", "warning", "danger", "neutral"] as const)
    expect(trackerToneColor(tone)).toMatch(/var\(--sheen-/);
  expect(trackerToneColor(3)).toBe("var(--sheen-chart-3)");
});

/* ---------------------------------------------------------------- CategoryBar */
const bands = [
  { label: "Poor", value: 300 },
  { label: "Fair", value: 200 },
  { label: "Good", value: 150 },
];
chartSuite({
  name: "CategoryBar",
  label: "Credit score",
  make: (x) => <CategoryBar data={bands} marker={420} aria-label="Credit score" {...x} />,
  reads: [
    { keys: "{Home}", says: /Poor: 0–300/ },
    { keys: "{ArrowRight}", says: /Fair: 300–500\. Marker: 420/ },
    { keys: "{End}", says: /Good: 500–650/ },
    { keys: "{ArrowLeft}", says: /Fair/ },
  ],
  table: {
    el: <CategoryBarTable data={bands} caption="Band table" />,
    caption: "Band table",
    cells: ["Poor", "300", "Fair", "500", "Good", "650"],
  },
  hover: { x: 0.4, y: 0.5, shows: /Fair|Poor|Good/ },
  variations: [
    { name: "small bar", extra: { size: "sm" } },
    { name: "large bar", extra: { size: "lg" } },
    { name: "values printed", extra: { showValues: true } },
    { name: "no legend", extra: { showLegend: false } },
    { name: "a start other than zero", extra: { start: 300, marker: 420 } },
    {
      name: "a named marker",
      extra: { markerLabel: "You are here" },
      check: () => expect(document.body.textContent).toMatch(/You are here|420/),
    },
    { name: "no marker", extra: { marker: null } },
    { name: "a marker beyond the end", extra: { marker: 9999 } },
    { name: "a marker before the start", extra: { marker: -50 } },
    {
      name: "per-band colours",
      extra: {
        data: [
          { label: "A", value: 1, color: 6 },
          { label: "B", value: 1, color: 3 },
        ],
      },
    },
    {
      name: "zero and negative bands",
      extra: {
        data: [
          { label: "A", value: 0 },
          { label: "B", value: -4 },
          { label: "C", value: 5 },
        ],
      },
    },
    { name: "a single band", extra: { data: [bands[0]] } },
    {
      name: "many bands",
      extra: { data: Array.from({ length: 12 }, (_, i) => ({ label: `Band ${i + 1}`, value: 10 + i })) },
    },
    {
      name: "custom format and locale",
      extra: { format: (n: number) => `${n} pts`, locale: "de" },
      reads: [{ keys: "{Home}", says: /0 pts–300 pts|0–300/ }],
    },
    { name: "phone width", extra: {}, width: 320 },
  ],
});
