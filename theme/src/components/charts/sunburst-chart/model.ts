import { type ReactNode } from "react";

import { type LegendItem } from "../chart-parts";
import { KEY_SEP, clamp, num, slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";

/* ======================================================================
 * Partition layout
 * ====================================================================== */

/** A node of a SunburstChart: a label, a value (leaves) or children, and an optional palette slot. */
export type SunburstNode = {
  label: string;
  /** Size of a leaf. A node with `children` is the sum of its children (its own value is ignored). */
  value?: number;
  children?: SunburstNode[];
  /**
   * Colour slot (1–8). Top-level nodes take their position by default and their descendants share
   * the hue, in lighter steps outwards. A node's own `color` wins. Past slot 8: neutral grey.
   */
  color?: ChartColor;
};

/** One node of the partition tree with its value, depth and angles. @internal */
export type Arc = {
  id: string;
  label: string;
  value: number;
  depth: number;
  /** Start and end as fractions of the whole turn. */
  x0: number;
  x1: number;
  slot: number;
  fill: string;
  children: Arc[];
  parent: Arc | null;
};

/** Lighter steps of the group hue outwards (a single-hue sequential ramp by depth). */
export const DEPTH_SHARE = [1, 0.7, 0.55, 0.42, 0.33, 0.27];

/** The fill colour of a ring from its colour slot and depth. @internal */
export function depthFill(slot: number, depth: number) {
  const share = DEPTH_SHARE[Math.min(DEPTH_SHARE.length - 1, Math.max(0, depth - 1))] ?? 0.27;
  return `color-mix(in oklab, ${slotColor(slot)} ${(share * 100).toFixed(0)}%, var(--sheen-chart-surface))`;
}

/** A sum without float noise (64.8 + 18.6 + ... reads 100, not 100.00000000000001). */
export const clean = (n: number) => Number(n.toPrecision(12));

/** Builds the partition tree of the data, with angles proportional to value. @internal */
export function partition(data: readonly SunburstNode[]): Arc {
  const root: Arc = {
    id: "",
    label: "",
    value: 0,
    depth: 0,
    x0: 0,
    x1: 1,
    slot: 0,
    fill: "",
    children: [],
    parent: null,
  };
  const build = (nodes: readonly SunburstNode[], parent: Arc) => {
    const seen = new Map<string, number>();
    nodes.forEach((node, i) => {
      const n = seen.get(node.label) ?? 0;
      seen.set(node.label, n + 1);
      const slot = node.color ?? (parent.depth === 0 ? (i < 8 ? i + 1 : 0) : parent.slot);
      const arc: Arc = {
        id: `${parent.id}/${node.label}${KEY_SEP}${n}`,
        label: node.label,
        value: 0,
        depth: parent.depth + 1,
        x0: 0,
        x1: 0,
        slot,
        fill: depthFill(slot, parent.depth + 1),
        children: [],
        parent,
      };
      if (node.children && node.children.length > 0) {
        build(node.children, arc);
        arc.value = clean(arc.children.reduce((s, c) => s + c.value, 0));
      } else arc.value = Math.max(0, num(node.value));
      parent.children.push(arc);
    });
  };
  build(data, root);
  root.value = clean(root.children.reduce((s, c) => s + c.value, 0));
  const place = (arc: Arc) => {
    let x = arc.x0;
    const k = arc.value > 0 ? (arc.x1 - arc.x0) / arc.value : 0;
    for (const c of arc.children) {
      c.x0 = x;
      c.x1 = x + c.value * k;
      x = c.x1;
      place(c);
    }
  };
  place(root);
  return root;
}

/** The id path from the root to an arc. @internal */
export const pathOf = (arc: Arc) => {
  const out: Arc[] = [];
  for (let a: Arc = arc; a.parent; a = a.parent) out.unshift(a);
  return out;
};

/** Finds the arc at an id path below a root, or null. @internal */
export function find(root: Arc, path: readonly string[]) {
  let arc = root;
  for (const label of path) {
    const next = arc.children.find((c) => c.label === label && c.children.length > 0);
    if (!next) break;
    arc = next;
  }
  return arc;
}

/** The number of rings below an arc. @internal */
export function heightOf(arc: Arc): number {
  return arc.children.reduce((m, c) => Math.max(m, 1 + heightOf(c)), 0);
}

/* ======================================================================
 * Component
 * ====================================================================== */

/**
 * Every string SunburstChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type SunburstChartLabels = {
  /** First breadcrumb and the centre's caption at the top level. */
  root: string;
  /** Accessible name of the breadcrumb (followed by the chart's aria-label, so every one on a page is unique). */
  breadcrumb: string;
  /** Tooltip / centre: share of the parent, e.g. "of Engineering". */
  ofParent: (parent: string) => string;
  ofTotal: string;
  instructions: ChartInstructions;
  drillInstructions: ChartInstructions;
  /** Announced after zooming. */
  zoomedTo: (label: string, count: number) => string;
  roleDescription: string;
  /** Title of the centre when zoomed in: clicking it zooms out. */
  zoomOut: string;
};

/**
 * The built-in English strings of SunburstChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultSunburstChartLabels: SunburstChartLabels = {
  root: "Total",
  breadcrumb: "Sunburst level",
  ofParent: (parent) => `of ${parent}`,
  ofTotal: "of total",
  instructions:
    "Use the arrow keys to read it: left and right go around a ring, down moves out to the children, up moves back in.",
  drillInstructions: "Press Enter to zoom into a group and Escape to zoom out.",
  zoomedTo: (label, count) => `${label}: ${count} ${count === 1 ? "item" : "items"}`,
  roleDescription: "sunburst chart",
  zoomOut: "Zoom out",
};

/**
 * Props of SunburstChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type SunburstChartProps = {
  /** The hierarchy: leaves carry a `value`; groups carry `children` (any depth). */
  data: readonly SunburstNode[];
  /** Height in px; the chart is a circle that fits the smaller of width and height. Default 360. */
  height?: number;
  /** Rings shown at once (deeper levels appear as you zoom in). Default 3. */
  rings?: number;
  /** Click / Enter on a group zooms into it. Default true when there are groups. */
  drillDown?: boolean;
  /** The zoomed-in path (group labels from the top), controlled. */
  path?: readonly string[];
  /** Labels of the group to start zoomed into (uncontrolled). Default [] (the whole tree). */
  defaultPath?: readonly string[];
  /** Called with the path of labels when the user zooms in or out (controlled `path`). */
  onPathChange?: (path: string[]) => void;
  /** Called on click / Enter on a node that has nothing to zoom into. */
  onNodeClick?: (node: { label: string; value: number; path: string[] }) => void;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. Default percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<SunburstChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Legend items for a sunburst's top-level groups (pass to ChartCard's `legend`).
 *
 * @see /charts/sunburst
 */
export function sunburstLegend(data: readonly SunburstNode[]): LegendItem[] {
  return data.map((node, i) => ({
    label: node.label,
    color: slotColor(node.color ?? (i < 8 ? i + 1 : 0)),
    kind: "rect" as const,
  }));
}

/** An arc with its SVG path and polar extents. @internal */
export type Drawn = { arc: Arc; d: string; a0: number; a1: number; r0: number; r1: number };
/** The zoom shown: the span of the turn (v0–v1), the depth at the centre and how many rings show. */
export type SunView = { v0: number; v1: number; vd: number; vr: number };

/** Size steps of the centre number: [px, class]. */
export const VALUE_STEPS: [number, string][] = [
  [24, "text-2xl"],
  [20, "text-xl"],
  [18, "text-lg"],
  [16, "text-base"],
  [14, "text-sm"],
  [12, "text-xs"],
];

/** The corner rounding of an arc, in pixels. @internal */
export const ROUND = 1.5; // corner rounding (stroke-linejoin round, in the fill's colour)
/** The gap between rings, in pixels. @internal */
export const GAP = 2;
/** The share of the radius the centre hole takes. @internal */
export const HOLE = 0.34; // share of the radius taken by the centre
/** The entrance delay between rings, in seconds. @internal */
export const RING_STAGGER = 0.14;
/** A full turn in radians. @internal */
export const TAU = Math.PI * 2;

/** The centre, radius, hole and ring count of the sunburst. @internal */
export type Geometry = { cx: number; cy: number; R: number; hole: number; rings: number };

/** An arc's place at a zoom `v` and entrance progress `intro` (1 = done), or null when it isn't drawn. */
export function arcGeometry(arc: Arc, v: SunView, intro: number, g: Geometry): Omit<Drawn, "arc" | "d"> | null {
  const span = Math.max(1e-9, v.v1 - v.v0);
  const s = clamp((arc.x0 - v.v0) / span, 0, 1);
  const e = clamp((arc.x1 - v.v0) / span, 0, 1);
  if (e - s < 1e-6) return null;
  const ri = arc.depth - v.vd;
  if (ri <= 0 || ri > v.vr + 1) return null;
  const thick = (g.R - g.hole) / Math.max(1, v.vr);
  const r0 = Math.max(g.hole, g.hole + (ri - 1) * thick);
  const r1 = Math.min(g.R, g.hole + ri * thick);
  if (r1 - r0 < 1) return null;
  // Entrance: each ring sweeps clockwise, the inner one first.
  const ring = Math.max(1, Math.ceil(ri - 1e-6));
  const sweep =
    intro >= 1 ? 1 : clamp((intro - (ring - 1) * RING_STAGGER) / Math.max(0.3, 1 - (g.rings - 1) * RING_STAGGER), 0, 1);
  const a0 = s * TAU;
  const a1 = Math.min(e * TAU, sweep * TAU);
  if (a1 - a0 < 1e-5) return null;
  return { a0, a1, r0, r1 };
}

/** Arcs that show at zoom `v` (depth first, clockwise). Outside the view, so are an arc's children. */
export function visibleArcs(tree: Arc, v: SunView, g: Geometry, into: Set<Arc>) {
  const stack = [...tree.children];
  while (stack.length > 0) {
    const arc = stack.pop();
    if (!arc) break;
    const span = Math.max(1e-9, v.v1 - v.v0);
    if (Math.min(1, (arc.x1 - v.v0) / span) - Math.max(0, (arc.x0 - v.v0) / span) < 1e-6) continue;
    const ri = arc.depth - v.vd;
    if (ri < v.vr + 1) stack.push(...arc.children);
    if (arcGeometry(arc, v, 1, g)) into.add(arc);
  }
}

/** True when two zoom views show the same root and depth. @internal */
export const sameView = (a: SunView, b: SunView) =>
  Math.abs(a.v0 - b.v0) < 1e-6 &&
  Math.abs(a.v1 - b.v1) < 1e-6 &&
  Math.abs(a.vd - b.vd) < 1e-6 &&
  Math.abs(a.vr - b.vr) < 1e-6;
