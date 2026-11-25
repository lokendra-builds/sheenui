"use client";

import { useLayoutEffect } from "react";
import { useSyncRef } from "../../../hooks/use-latest";
import { marksById, type FrameStore } from "../flow-utils";
import type { ChartTipAnchor } from "../heatmap";
import type { Batches, Graph } from "./model";
import { anchorOf, paintFrame } from "./paint";
import type { GraphRefs } from "./refs";

/** What the painter needs: the refs, the graph and its mark batches, the entrance order and the tooltip store. */
export type PainterInput = {
  R: GraphRefs;
  graph: Graph;
  batches: Batches;
  /** Entrance order of each node (breadth first from the most connected). */
  rank: number[];
  n: number;
  ids: string[];
  tip: FrameStore<ChartTipAnchor>;
  act: number | null;
  dragging: number | null;
};

/**
 * Wires the painter (see `paint.ts`): keeps the latest frame painter in a ref for the tweens and handlers, re-indexes
 * what is on screen when the data changes, and after every render finds the marks React drew and paints them where
 * they are now. Returns `anchorOf`, the tooltip's anchor for a node.
 */
export function usePainter({ R, graph, batches, rank, n, ids, tip, act, dragging }: PainterInput) {
  const { posRef, posIdsRef, drawnRef, unitRef, marksRef, paintRef, lastKRef, actRef, activeRef, paintedGraphRef } = R;
  const { nodeLayerRef, linkLayerRef, nameLayerRef, litNodeLayerRef, litLinkLayerRef } = R;

  useSyncRef(actRef, dragging === null ? act : null);
  useSyncRef(activeRef, act);
  useSyncRef(paintRef, (what) => paintFrame({ R, graph, batches, rank, n, tip }, what));

  // A new data set: what is on screen is re-indexed to the new node order (known nodes keep their
  // place, new ones wait for the layout). Runs before the paint below.
  useLayoutEffect(() => {
    const P = posRef.current;
    if (P && posIdsRef.current !== ids) {
      const was = new Map(posIdsRef.current.map((id, i) => [id, i]));
      posRef.current = ids.flatMap((id) => {
        const i = was.get(id);
        return i === undefined ? [NaN, NaN] : [P[i * 2] ?? NaN, P[i * 2 + 1] ?? NaN];
      });
    }
    posIdsRef.current = ids;
    if (drawnRef.current.length !== n * 2) drawnRef.current = new Float64Array(n * 2);
    if (unitRef.current.length !== n) unitRef.current = new Float64Array(n).fill(NaN);
  }, [ids, n, posRef, posIdsRef, drawnRef, unitRef]);

  // After every render: find the marks React drew and paint them where they are now. The dots
  // and lines only change with the data; a reading re-renders the names and its few copies.
  useLayoutEffect(() => {
    const fresh = paintedGraphRef.current !== graph || marksRef.current.nodes.size !== batches.nodes.length;
    marksRef.current = {
      nodes: fresh ? marksById<SVGPathElement>(nodeLayerRef.current) : marksRef.current.nodes,
      links: fresh ? marksById<SVGPathElement>(linkLayerRef.current) : marksRef.current.links,
      names: marksById<SVGTextElement>(nameLayerRef.current),
      litNodes: marksById<SVGCircleElement>(litNodeLayerRef.current),
      litLinks: marksById<SVGLineElement>(litLinkLayerRef.current),
    };
    paintedGraphRef.current = graph;
    if (fresh) lastKRef.current = NaN;
    paintRef.current(fresh ? "all" : "names");
  });

  return { anchorOf: (i: number) => anchorOf(R, graph, i) };
}
