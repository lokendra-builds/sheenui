"use client";

import { memo, type RefObject } from "react";
import { cn } from "../../../lib/cn";
import { itemAt } from "../chart-utils";
import { markGlow } from "../flow-utils";
import { ToolIcon } from "./layout";
import type { Batches, GNode, Graph } from "./model";
import type { NetworkGraphLabels } from "./types";

/**
 * Dots and lines: rendered once per data set and never restyled one by one. A reading dims each layer as a whole
 * (one opacity per layer) and draws its own copies of the active node's ties and neighbours on top (see
 * {@link LitLayers}), so a hover costs the same on a 20-node graph and a 500-node one. Memoised on the batches: the
 * painter positions the marks, React only creates them.
 */
export const GraphMarks = memo(function GraphMarks({
  batches,
  linkFade,
  linkLayer,
  nodeLayer,
}: {
  batches: Batches;
  linkFade: RefObject<SVGGElement | null>;
  linkLayer: RefObject<SVGGElement | null>;
  nodeLayer: RefObject<SVGGElement | null>;
}) {
  return (
    <>
      {/* Links: neutral hairlines (a constant screen width at any zoom). The outer group fades them in on first view. */}
      <g ref={linkFade}>
        <g
          ref={linkLayer}
          className="forced-color-adjust-none group-data-[dim]/net:opacity-20 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
        >
          {batches.links.map((b) => (
            <path
              key={b.w}
              data-id={String(b.w)}
              fill="none"
              strokeLinecap="round"
              strokeOpacity={0.34}
              strokeWidth={b.w}
              vectorEffect="non-scaling-stroke"
              className="stroke-sheen-fg-subtle forced-colors:stroke-[CanvasText]"
            />
          ))}
        </g>
      </g>

      {/* Nodes: dots in their group's colour with a 2px surface ring, one path per colour, drawn by the painter.
          Hit testing is done in JS (the nearest dot within reach), so no invisible hit circles are drawn. */}
      <g
        ref={nodeLayer}
        className="forced-color-adjust-none group-data-[dim]/net:opacity-25 motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
      >
        {batches.nodes.map((b) => (
          <path
            key={b.color}
            data-id={b.color}
            fill={b.color}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="stroke-(--sheen-chart-surface) forced-colors:stroke-[CanvasText]"
          />
        ))}
      </g>
    </>
  );
});

/** The reading's copies: the active node's ties in its colour, its neighbours and itself at full strength. */
export function LitLayers({
  graph,
  litNode,
  litLinkLayer,
  litNodeLayer,
}: {
  graph: Graph;
  litNode: GNode;
  litLinkLayer: RefObject<SVGGElement | null>;
  litNodeLayer: RefObject<SVGGElement | null>;
}) {
  return (
    <g className="forced-color-adjust-none">
      <g ref={litLinkLayer}>
        {graph.links
          .filter((l) => l.s === litNode.index || l.t === litNode.index)
          .map((l) => (
            <line
              key={l.id}
              data-id={l.id}
              stroke={litNode.color}
              strokeOpacity={0.95}
              strokeWidth={l.width + 0.75}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="forced-colors:stroke-[Highlight]"
            />
          ))}
      </g>
      <g ref={litNodeLayer}>
        {[...litNode.neighbours, litNode.index].map((i) => {
          const g = itemAt(graph.nodes, i);
          const on = i === litNode.index;
          return (
            <circle
              key={g.id}
              data-id={g.id}
              fill={g.color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className="stroke-(--sheen-chart-surface) forced-colors:stroke-[CanvasText]"
              style={on ? { filter: markGlow(g.color, 8) } : undefined}
            />
          );
        })}
      </g>
    </g>
  );
}

const toolButton = cn(
  "relative grid size-8 place-items-center rounded-sheen-sm text-sheen-fg-muted any-pointer-coarse:size-11",
  "hover:bg-sheen-hover hover:text-sheen-fg motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast)",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
);

/** Zoom controls: a small solid toolbar in the corner (no backdrop blur over a moving graph). */
export function ZoomToolbar({
  labels,
  top,
  zoomBy,
  fit,
}: {
  labels: Pick<NetworkGraphLabels, "zoomControls" | "zoomIn" | "zoomOut" | "fit">;
  /** Offset from the top of the plot box (below the docked readout). */
  top: number;
  zoomBy: (factor: number) => void;
  fit: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label={labels.zoomControls}
      className="absolute right-2 z-1 flex flex-col gap-0.5 rounded-sheen-md border border-sheen-border bg-sheen-surface p-0.5 shadow-[0_1px_2px_var(--sheen-shadow-near),0_6px_16px_-8px_var(--sheen-shadow-far)]"
      style={{ top }}
    >
      <button
        type="button"
        className={toolButton}
        aria-label={labels.zoomIn}
        title={labels.zoomIn}
        onClick={() => zoomBy(1.4)}
      >
        <ToolIcon d="M8 3.5v9M3.5 8h9" />
      </button>
      <button
        type="button"
        className={toolButton}
        aria-label={labels.zoomOut}
        title={labels.zoomOut}
        onClick={() => zoomBy(1 / 1.4)}
      >
        <ToolIcon d="M3.5 8h9" />
      </button>
      <button type="button" className={toolButton} aria-label={labels.fit} title={labels.fit} onClick={fit}>
        <ToolIcon d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3" />
      </button>
    </div>
  );
}
