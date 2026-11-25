import { clamp, itemAt } from "../chart-utils";
import { enterCurve, r2, type FrameStore } from "../flow-utils";
import type { ChartTipAnchor } from "../heatmap";
import { SPREAD, circlePath, dotScale, nameOffset } from "./layout";
import type { Batches, Graph } from "./model";
import type { GraphRefs, PaintScope } from "./refs";

/** What a frame is painted from: the refs, the graph and its mark batches, the entrance order and the tooltip store. */
export type PaintContext = {
  R: GraphRefs;
  graph: Graph;
  batches: Batches;
  /** Entrance order of each node (breadth first from the most connected). */
  rank: number[];
  n: number;
  tip: FrameStore<ChartTipAnchor>;
};

/** The tooltip's anchor: the active dot, and its name when it has one (the tooltip never covers it). */
export function anchorOf(R: GraphRefs, graph: Graph, i: number): ChartTipAnchor {
  const v = R.viewRef.current;
  const D = R.drawnRef.current;
  const g = itemAt(graph.nodes, i);
  const r = g.r * dotScale(v.k);
  const sx = (D[i * 2] ?? 0) * v.k + v.tx;
  const sy = (D[i * 2 + 1] ?? 0) * v.k + v.ty;
  let x0 = sx - r;
  let x1 = sx + r;
  let y0 = sy - r;
  let y1 = sy + r;
  const nm = R.namesRef.current.find((m) => m.i === i);
  if (nm) {
    const [dx, dy] = nameOffset(nm.side, r);
    const nx = sx + dx;
    const ny = sy + dy;
    const nx0 = nm.side === "right" ? nx : nm.side === "left" ? nx - nm.w : nx - nm.w / 2;
    x0 = Math.min(x0, nx0);
    x1 = Math.max(x1, nx0 + nm.w);
    y0 = Math.min(y0, ny - 7);
    y1 = Math.max(y1, ny + 7);
  }
  return { x: x0, y: R.dockRef.current + y0, w: x1 - x0, h: y1 - y0 };
}

/** A circle mark (the active node's ring, a lit neighbour) placed on node `i`, or hidden when it has no node. */
function place(el: SVGCircleElement, i: number | undefined, r: number, D: Float64Array, U: Float64Array) {
  const u = i === undefined ? NaN : (U[i] ?? 0);
  if (i === undefined || !(u > 0)) {
    el.style.display = "none";
    return;
  }
  el.style.display = "";
  el.setAttribute("cx", String(r2(D[i * 2] ?? 0)));
  el.setAttribute("cy", String(r2(D[i * 2 + 1] ?? 0)));
  el.setAttribute("r", String(r2(r * u * 1e3) / 1e3));
}

/**
 * Paint one frame straight to the SVG: the view transform, the dots (one path per colour) and lines (one path per
 * width) when they move or the zoom changes, the names following their nodes, the active node's ring and the
 * reading's copies, and the tooltip's anchor. `what` says how much changed: everything ("all"), only the view
 * transform ("view") or only the names ("names").
 */
export function paintFrame({ R, graph, batches, rank, n, tip }: PaintContext, what: PaintScope) {
  const P = R.posRef.current;
  const v = R.viewRef.current;
  const m = R.marksRef.current;
  R.viewLayerRef.current?.setAttribute("transform", `translate(${r2(v.tx)},${r2(v.ty)}) scale(${r2(v.k * 1e4) / 1e4})`);
  R.nameLayerRef.current?.setAttribute("transform", `translate(${r2(v.tx)},${r2(v.ty)})`);
  const zoomed = v.k !== R.lastKRef.current;
  const s = dotScale(v.k);
  const D = R.drawnRef.current;
  const U = R.unitRef.current;
  // Dots move (layout, ripple, drag) or keep their screen size through a zoom: rewrite their paths.
  if (what === "all" || zoomed) {
    R.lastKRef.current = v.k;
    const it = R.introRef.current;
    const c = R.centreRef.current;
    for (let i = 0; i < n; i++) {
      const x = P?.[i * 2] ?? NaN;
      const y = P?.[i * 2 + 1] ?? NaN;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        D[i * 2] = NaN;
        D[i * 2 + 1] = NaN;
        U[i] = NaN;
        continue;
      }
      // Ripple: node i leaves the centre at its rank's delay.
      const p =
        it >= 1 ? 1 : enterCurve(clamp((it - ((rank[i] ?? 0) / Math.max(1, n - 1)) * SPREAD) / (1 - SPREAD), 0, 1));
      D[i * 2] = c.x + (x - c.x) * p;
      D[i * 2 + 1] = c.y + (y - c.y) * p;
      // Inside the zoomed layer a dot is scaled back to its screen size (times the zoom's growth).
      U[i] = (p * s) / v.k;
    }
    for (const b of batches.nodes) {
      const el = m.nodes.get(b.color);
      if (!el) continue;
      let d = "";
      for (const i of b.idx) d += circlePath(D[i * 2] ?? 0, D[i * 2 + 1] ?? 0, itemAt(graph.nodes, i).r * (U[i] ?? 0));
      el.setAttribute("d", d);
    }
    if (what === "all") {
      // Strokes are non-scaling (vector-effect): lines keep their screen width at any zoom, untouched by it.
      for (const b of batches.links) {
        const el = m.links.get(String(b.w));
        if (!el) continue;
        let d = "";
        for (const l of b.list) {
          const x1 = D[l.s * 2] ?? 0;
          const y1 = D[l.s * 2 + 1] ?? 0;
          const x2 = D[l.t * 2] ?? 0;
          const y2 = D[l.t * 2 + 1] ?? 0;
          if (Number.isFinite(x1 + y1 + x2 + y2)) d += `M${r2(x1)},${r2(y1)}L${r2(x2)},${r2(y2)}`;
        }
        el.setAttribute("d", d);
      }
      const linkIn = clamp((it - 0.55) / 0.45, 0, 1);
      const fade = R.linkFadeRef.current;
      if (fade) fade.style.opacity = linkIn >= 1 ? "" : String(r2(linkIn));
    }
  }
  // Names follow their nodes (screen px inside the panned layer). A pan alone moves only the layer.
  if (what !== "view" || zoomed) {
    for (const nm of R.namesRef.current) {
      const el = m.names.get(String(nm.i));
      const g = graph.nodes[nm.i];
      if (!el || !g) continue;
      const [dx, dy] = nameOffset(nm.side, g.r * s);
      el.setAttribute("x", String(r2((D[nm.i * 2] ?? 0) * v.k + dx)));
      el.setAttribute("y", String(r2((D[nm.i * 2 + 1] ?? 0) * v.k + dy)));
    }
  }
  // The active node's ring, and the reading's copies, sit on the marks they light up (a handful of elements).
  const on = R.activeRef.current;
  const ring = R.ringRef.current;
  if (ring)
    place(
      ring,
      on !== null && on < n ? on : undefined,
      on !== null && on < n ? itemAt(graph.nodes, on).r + 4.5 : 0,
      D,
      U,
    );
  for (const [id, el] of m.litNodes) {
    const i = graph.index.get(id);
    place(el, i, i === undefined ? 0 : itemAt(graph.nodes, i).r + (i === on ? 1.5 : 0), D, U);
  }
  for (const [id, el] of m.litLinks) {
    const l = batches.linkById.get(id);
    const x1 = l ? (D[l.s * 2] ?? 0) : NaN;
    const y1 = l ? (D[l.s * 2 + 1] ?? 0) : NaN;
    const x2 = l ? (D[l.t * 2] ?? 0) : NaN;
    const y2 = l ? (D[l.t * 2 + 1] ?? 0) : NaN;
    if (!Number.isFinite(x1 + y1 + x2 + y2)) {
      el.style.display = "none";
      continue;
    }
    el.style.display = "";
    el.setAttribute("x1", String(r2(x1)));
    el.setAttribute("y1", String(r2(y1)));
    el.setAttribute("x2", String(r2(x2)));
    el.setAttribute("y2", String(r2(y2)));
  }
  // The tooltip follows its node (one transform write, no render).
  const a = R.actRef.current;
  if (a !== null && a < n) tip.setNow(anchorOf(R, graph, a));
}
