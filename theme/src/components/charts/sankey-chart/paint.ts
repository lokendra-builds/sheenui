import { type PointerEvent } from "react";

import { duration } from "../../../motion/tokens";
import { mix, r2, roundedRectPath, slice } from "../flow-utils";
import { type SankeyLayoutLink, type SankeyLayout } from "./layout";

/** The hovered or focused part: a node or a link and the end it was reached from. @internal */
export type Active = { kind: "node"; id: string } | { kind: "link"; id: string; via: "source" | "target" };
/** The pointer and focus handlers the drawn nodes and links attach. @internal */
export type SankeyHandlers = {
  enterLink: (link: SankeyLayoutLink, event: PointerEvent) => void;
  moveLink: (event: PointerEvent) => void;
  leave: (event: PointerEvent) => void;
  downLink: (link: SankeyLayoutLink, event: PointerEvent) => void;
  clickLink: (link: SankeyLayoutLink) => void;
  enterNode: (id: string, event: PointerEvent) => void;
  downNode: (id: string, event: PointerEvent) => void;
  clickNode: (id: string) => void;
};
/** A node's label: one or two lines of name, then its value (beside the name, or on its own line). */
export type SankeyLabel = {
  id: string;
  x: number;
  y: number;
  anchor: "start" | "end";
  name: string[];
  value: string;
  inline: boolean;
  column: number;
};

/** The gap between a link and its node, in pixels. @internal */
export const LINK_GAP = 2;
/** The gap between a node and its label, in pixels. @internal */
export const LABEL_GAP = 8;
/** The node name font size, in pixels. @internal */
export const LABEL_SIZE = 12;
/** The node value font size, in pixels. @internal */
export const VALUE_SIZE = 11;
/** The node name line height, in pixels. @internal */
export const NAME_LINE = 14.5;
/** The node value line height, in pixels. @internal */
export const VALUE_LINE = 14;
/** The vertical padding of the plot, in pixels. @internal */
export const PAD_Y = 10;
/** The entrance delay between columns, in seconds. @internal */
export const COLUMN_STAGGER = 0.14;

/* ---------- Geometry, painted straight to the DOM by one tween ---------- */

/** The animated geometry of one link: ends, width and colour slot. @internal */
export type LinkGeo = { x0: number; x1: number; y0: number; y1: number; w: number; c: number };
/** The animated geometry of one node. @internal */
export type NodeGeo = { x: number; y: number; h: number; c: number };
/** The animated position of one label. @internal */
export type LabelGeo = { x: number; y: number; c: number };
/** The geometry of every link, node and label, keyed by id. @internal */
export type SankeyGeo = { links: Map<string, LinkGeo>; nodes: Map<string, NodeGeo>; labels: Map<string, LabelGeo> };
/** The DOM elements of the drawn links, nodes and labels, kept for animation. @internal */
export type SankeyMarks = {
  links: Map<string, SVGPathElement>;
  nodes: Map<string, SVGPathElement>;
  labels: Map<string, SVGTextElement>;
};

/** Reduces a layout and its placed labels to the geometry that can be morphed. @internal */
export function sankeyGeo(layout: SankeyLayout, placed: SankeyLabel[]): SankeyGeo {
  return {
    links: new Map(
      layout.links.map((l) => [
        l.id,
        {
          x0: l.source.x1 + LINK_GAP,
          x1: l.target.x0 - LINK_GAP,
          y0: l.y0,
          y1: l.y1,
          w: Math.max(1, l.width),
          c: l.source.column,
        },
      ]),
    ),
    nodes: new Map(layout.nodes.map((n) => [n.id, { x: n.x0, y: n.y0, h: Math.max(1, n.y1 - n.y0), c: n.column }])),
    labels: new Map(placed.map((lb) => [lb.id, { x: lb.x, y: lb.y, c: lb.column }])),
  };
}

/** The SVG path of a link ribbon from its end geometry. @internal */
export const ribbonPath = (g: Omit<LinkGeo, "c" | "w">) => {
  const xm = (g.x0 + g.x1) / 2;
  return `M${r2(g.x0)},${r2(g.y0)} C${r2(xm)},${r2(g.y0)} ${r2(xm)},${r2(g.y1)} ${r2(g.x1)},${r2(g.y1)}`;
};

/** Interpolates two link geometries. @internal */
export const mixLink = (a: LinkGeo, b: LinkGeo, t: number): LinkGeo => ({
  x0: mix(a.x0, b.x0, t),
  x1: mix(a.x1, b.x1, t),
  y0: mix(a.y0, b.y0, t),
  y1: mix(a.y1, b.y1, t),
  w: mix(a.w, b.w, t),
  c: b.c,
});
/** Interpolates two node geometries. @internal */
export const mixNode = (a: NodeGeo, b: NodeGeo, t: number): NodeGeo => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  h: mix(a.h, b.h, t),
  c: b.c,
});
/** Interpolates two label positions. @internal */
export const mixLabel = (a: LabelGeo, b: LabelGeo, t: number): LabelGeo => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  c: b.c,
});

/** The geometry on screen part-way through a data change (an interrupted tween restarts from here). */
export function mixGeo(a: SankeyGeo, b: SankeyGeo, t: number): SankeyGeo {
  const each = <G>(to: Map<string, G>, from: Map<string, G>, f: (x: G, y: G, t: number) => G) =>
    new Map(
      [...to].map(([id, g]) => {
        const was = from.get(id);
        return [id, was ? f(was, g, t) : g] as const;
      }),
    );
  return {
    links: each(b.links, a.links, mixLink),
    nodes: each(b.nodes, a.nodes, mixNode),
    labels: each(b.labels, a.labels, mixLabel),
  };
}

/**
 * Writes every mark's geometry for one moment. `t` is the eased progress of a data change from
 * `from` to `to`; `enter` the seconds since the first-view entrance began (null: no entrance).
 * Columns grow in from left to right, ribbons draw across behind them, then the labels fade in.
 */
export function paintSankey(
  marks: SankeyMarks,
  to: SankeyGeo,
  from: SankeyGeo | null,
  t: number,
  enter: number | null,
  nodeWidth: number,
) {
  for (const [id, el] of marks.links) {
    const b = to.links.get(id);
    if (!b) continue;
    const a = from?.links.get(id);
    const g = a && t < 1 ? mixLink(a, b, t) : b;
    el.setAttribute("d", ribbonPath(g));
    el.setAttribute("stroke-width", String(r2(g.w)));
    // Drawn across with a stroke dash (the path's length is 1): on first view, and for new flows.
    const drawn = enter !== null ? slice(enter, b.c * COLUMN_STAGGER + 0.12, duration.slower) : from && !a ? t : 1;
    el.style.strokeDasharray = drawn >= 1 ? "" : `${r2(drawn * 1000) / 1000} 1`;
  }
  for (const [id, el] of marks.nodes) {
    const b = to.nodes.get(id);
    if (!b) continue;
    const a = from?.nodes.get(id);
    const g = a && t < 1 ? mixNode(a, b, t) : b;
    el.setAttribute("d", roundedRectPath(g.x, g.y, nodeWidth, g.h, 3));
    const grow = enter !== null ? slice(enter, b.c * COLUMN_STAGGER, duration.slow) : from && !a ? t : 1;
    el.style.transform = grow >= 1 ? "" : `scaleY(${r2(grow * 1000) / 1000})`;
  }
  for (const [id, el] of marks.labels) {
    const b = to.labels.get(id);
    if (!b) continue;
    const a = from?.labels.get(id);
    const g = a && t < 1 ? mixLabel(a, b, t) : b;
    el.setAttribute("transform", `translate(${r2(g.x)},${r2(g.y)})`);
    const shown = enter !== null ? slice(enter, b.c * COLUMN_STAGGER + 0.25, duration.base) : from && !a ? t : 1;
    el.style.opacity = shown >= 1 ? "" : String(r2(shown));
  }
}
