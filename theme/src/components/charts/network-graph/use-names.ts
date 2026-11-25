"use client";

import { useEffectEvent, useLayoutEffect, useState } from "react";
import { itemAt } from "../chart-utils";
import { measureText, type FrameStore } from "../flow-utils";
import type { ChartTipAnchor } from "../heatmap";
import { dotScale, nameOffset, type Name } from "./layout";
import type { Graph } from "./model";
import type { GraphRefs } from "./refs";
import type { NetworkGraphProps } from "./types";

/** What the names need: the refs, the graph, the reading, the box, and the triggers that place them again. */
export type NamesInput = {
  R: GraphRefs;
  graph: Graph;
  act: number | null;
  /** The active node and its neighbours. */
  lit: Set<number>;
  dragging: number | null;
  introDone: boolean;
  showLabels: NonNullable<NetworkGraphProps["showLabels"]>;
  width: number;
  height: number;
  /** Height of the docked readout above the plot. */
  dock: number;
  coarse: boolean;
  /** Re-place triggers: motion settled, a layout landed, web fonts arrived (widths change). */
  settled: number;
  layoutVersion: number;
  fonts: boolean;
  tip: FrameStore<ChartTipAnchor>;
  screenOf: (i: number) => { x: number; y: number };
  anchorOf: (i: number) => ChartTipAnchor;
};

/**
 * Names: placed when the view settles (the active node and its neighbours first, then the best connected; none may
 * collide with a dot, another name or the zoom toolbar), from the node positions and view held in refs, and stored
 * in state so the chart draws them. Also moves the tooltip to its node after each commit. Returns the placed names.
 */
export function useGraphNames({
  R,
  graph,
  act,
  lit,
  dragging,
  introDone,
  showLabels,
  width,
  height,
  dock,
  coarse,
  settled,
  layoutVersion,
  fonts,
  tip,
  screenOf,
  anchorOf,
}: NamesInput) {
  const { posRef, viewRef, namesRef } = R;
  // The labels are placed after the commit, from the node positions and view held in refs (a render
  // never reads them), and stored in state so the chart draws them in a layout effect pass.
  const [names, setNames] = useState<Name[]>([]);
  // `fonts`, `layoutVersion` and `settled` are re-place triggers: widths change when web fonts load and layouts advance.
  // The tooltip follows its node: the anchor comes from the simulation's positions (held in refs), so it is
  // written to the tooltip's store after the commit, never read during render.
  const moveTip = useEffectEvent((node: number) => tip.setNow(anchorOf(node)));
  useLayoutEffect(() => {
    if (act !== null && dragging === null) moveTip(act);
  }, [act, dragging, width, height, dock, introDone, settled, layoutVersion, names]);
  useLayoutEffect(() => {
    const next = (() => {
      const placed: Name[] = [];
      if (!introDone || showLabels === "none" || width === 0 || !posRef.current) return placed;
      const v = viewRef.current;
      const s = dotScale(v.k);
      const boxes: { x0: number; y0: number; x1: number; y1: number }[] = [];
      const circles = graph.nodes.map((g, i) => ({ ...screenOf(i), r: g.r * s }));
      const order = [...graph.nodes].sort((a, b) => {
        const pa = a.index === act ? 0 : lit.has(a.index) ? 1 : 2;
        const pb = b.index === act ? 0 : lit.has(b.index) ? 1 : 2;
        return (
          pa - pb || b.neighbours.length - a.neighbours.length || (b.value ?? 0) - (a.value ?? 0) || a.index - b.index
        );
      });
      // The zoom toolbar in the top right corner: no name goes under it.
      const tool = coarse ? 48 : 36;
      const toolbar = { x0: width - 8 - tool - 4, y0: 4, x1: width, y1: 8 + tool * 3 - 8 + 4 };
      const free = (box: { x0: number; y0: number; x1: number; y1: number }, own: number) =>
        box.x0 >= 0 &&
        box.x1 <= width - 2 &&
        box.y0 >= 0 &&
        box.y1 <= height &&
        !(box.x0 < toolbar.x1 && box.x1 > toolbar.x0 && box.y0 < toolbar.y1 && box.y1 > toolbar.y0) &&
        (showLabels === "all" ||
          (!boxes.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0) &&
            !circles.some(
              (o, j) =>
                j !== own && o.x + o.r > box.x0 && o.x - o.r < box.x1 && o.y + o.r > box.y0 && o.y - o.r < box.y1,
            )));
      for (const g of order) {
        const c = itemAt(circles, g.index);
        if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) continue;
        const w = measureText(g.label, 11, 500);
        // Right of the dot, then left, below and above: the first spot that's free.
        for (const side of ["right", "left", "below", "above"] as const) {
          const [dx, dy] = nameOffset(side, c.r);
          const x = c.x + dx;
          const y = c.y + dy;
          const x0 = side === "right" ? x - 1 : side === "left" ? x - w - 1 : x - w / 2 - 1;
          const box = { x0, y0: y - 7, x1: x0 + w + 2, y1: y + 7 };
          if (!free(box, g.index)) continue;
          boxes.push(box);
          placed.push({ i: g.index, side, text: g.label, w });
          break;
        }
      }
      return placed;
    })();
    setNames((prev) =>
      prev.length === next.length &&
      prev.every((p, k) => p.i === itemAt(next, k).i && p.side === itemAt(next, k).side && p.w === itemAt(next, k).w)
        ? prev
        : next,
    );
    // `screenOf` is a fresh closure every render over the same refs; the placement re-runs on the triggers below, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- names are re-placed when the entrance, labels mode, box, data, reading, pointer type, settle, layout or fonts change, not for a new render's `screenOf`
  }, [introDone, showLabels, width, height, graph, act, lit, coarse, settled, layoutVersion, fonts, posRef, viewRef]);
  // The painter's own layout effect (declared first) ran before this commit's names reached the ref, so the new <text>
  // marks would sit at the origin (piled in the middle) until the next layout frame: hand them over, then paint them.
  useLayoutEffect(() => {
    namesRef.current = names;
    R.paintRef.current("names");
  }, [names, namesRef, R.paintRef]);

  return names;
}
