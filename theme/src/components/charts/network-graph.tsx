"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useSyncRef } from "../../hooks/use-latest";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { dockSpace, useDockedReadout } from "./chart-fit";
import { chartFocusClass, clamp, useElementWidth, resolveInstructions, itemAt } from "./chart-utils";
import { ChartDockHint, defaultCompact, useEntrance, type ChartTipAnchor } from "./heatmap";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { FlowTip, haloTextClass, useFontsLoaded, useFrameStore } from "./flow-utils";
import { ChartFigure } from "./chart-figure";
import { batchMarks, buildGraph, entranceOrder } from "./network-graph/model";
import { defaultNetworkGraphLabels, type NetworkGraphProps } from "./network-graph/types";
import { NO_ANCHOR, nameAnchor, nodeReadout } from "./network-graph/layout";
import { useGraphRefs } from "./network-graph/refs";
import { usePainter } from "./network-graph/use-painter";
import { useSimulationLayout } from "./network-graph/use-simulation";
import { useGraphView } from "./network-graph/use-view";
import { useGraphEntrance } from "./network-graph/use-entrance";
import { useGraphGestures } from "./network-graph/use-gestures";
import { graphKeyDown } from "./network-graph/keyboard";
import { useGraphNames } from "./network-graph/use-names";
import { GraphMarks, LitLayers, ZoomToolbar } from "./network-graph/layers";

export { type ForceSimulationOptions, type ForceSimulation, createForceSimulation } from "./network-graph/simulation";
export { type NetworkNode, type NetworkLink, type NetworkGroup } from "./network-graph/model";
export {
  type NetworkGraphLabels,
  defaultNetworkGraphLabels,
  type NetworkGraphProps,
  networkLegend,
} from "./network-graph/types";
export { type NetworkTableProps, NetworkTable } from "./network-graph/table";

/**
 * Who is connected to whom: services and their dependencies, people who work together, linked
 * pages. Laid out by a force simulation written here (link springs, charge, gravity, collision),
 * deterministic for the same data; graphs over 100 nodes use Barnes–Hut charge and grid collision.
 *
 * - The layout is computed in small chunks between frames, then nodes ripple out from the centre
 *   (the most connected first) and the links draw in. Data changes glide nodes to their new places.
 * - Hover or tap a node to light up its connections; drag it to pull the network along (it
 *   settles back with the simulation). Ctrl/⌘ + scroll, a pinch or the buttons zoom; drag the
 *   background to pan. Names are printed where they fit, more as you zoom in.
 * - Every moving frame (layout, ripple, glide, drag, pan, zoom) is written straight to the SVG:
 *   pan and zoom are one transform on the graph's layer, every dot of a colour is one path and
 *   every line of a width another (a frame rewrites a dozen paths, whatever the size of the
 *   graph), and React renders only when what is shown changes (a reading, a settled view).
 * - A reading dims each layer as a whole and draws the active node's ties and neighbours again
 *   on top, so a hover costs the same on 20 nodes or 500.
 * - Keyboard: arrows move to the nearest node in that direction, Page Up / Page Down step through
 *   every node in order, + / − zoom and 0 fits. The table view (NetworkTable) lists every node's
 *   connections.
 * - Reduced motion: the precomputed layout appears in place; dragging moves only that node.
 *
 * The pieces live in `network-graph/`: the data model and mark batches (`model.ts`), the force simulation
 * (`simulation.ts`), the refs that hold what is on screen (`refs.ts`), the painter (`use-painter.ts`), the chunked
 * layout (`use-simulation.ts`), the view (`use-view.ts`), the entrance (`use-entrance.ts`), pointer gestures
 * (`use-gestures.ts`), the keyboard model (`keyboard.ts`), name placement (`use-names.ts`) and the SVG layers
 * (`layers.tsx`).
 *
 * Keyboard: Tab focuses the graph; the arrow keys move to the nearest node in that direction, Page Up and Page Down step through every node in order, + and - zoom, 0 fits the view, Escape clears. With `onNodeClick`, Enter activates the node being read. The zoom buttons form a toolbar and are also tab stops.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the node with its group and connections. `NetworkTable` lists every node and its links as the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion lays the graph out and moves it instantly.
 *
 * @example
 * ```tsx
 * import { NetworkGraph } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NetworkGraph
 *       nodes={[{ id: "api" }, { id: "db" }, { id: "cache" }, { id: "web" }]}
 *       links={[
 *         { source: "web", target: "api" },
 *         { source: "api", target: "db" },
 *         { source: "api", target: "cache" },
 *       ]}
 *       aria-label="Service dependencies"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/network-graph
 */
export function NetworkGraph({
  nodes,
  links,
  groups,
  height = 420,
  showLabels = "auto",
  forces,
  format: formatProp,
  locale,
  onNodeClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<NetworkGraphProps>) {
  const labels = useMemo(() => ({ ...defaultNetworkGraphLabels, ...labelOverrides }), [labelOverrides]);
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const fonts = useFontsLoaded(); // names are placed with measureText: place them again once the font arrives
  const tip = useFrameStore<ChartTipAnchor>();

  const graph = useMemo(() => buildGraph(nodes, links, groups), [nodes, links, groups]);
  const n = graph.nodes.length;
  const ids = useMemo(() => graph.nodes.map((g) => g.id), [graph]);
  const forcesKey = JSON.stringify(forces ?? {});
  // The layout follows the box's shape (in coarse steps, so a resize doesn't re-run it every pixel).
  const aspect = width > 0 ? clamp(Math.round(((width - 60) / Math.max(1, height)) * 4) / 4, 0.5, 3) : 0;
  const docked = useDockedReadout(width);

  /* ---------- What is on screen, kept outside React (see network-graph/refs.ts) ---------- */

  const R = useGraphRefs(reduced);
  const { reducedRef, dockRef, settleTimerRef, gestureRef, posRef, svgRef, viewLayerRef, nameLayerRef, ringRef } = R;
  const { linkFadeRef, linkLayerRef, nodeLayerRef, litLinkLayerRef, litNodeLayerRef } = R;
  useSyncRef(reducedRef, reduced);

  // A moving frame rewrites a dozen paths, not one element per dot and per line: the browser
  // restyles and re-lays-out a handful of elements whatever the size of the graph.
  const batches = useMemo(() => batchMarks(graph), [graph]);

  const [layoutVersion, setLayoutVersion] = useState(0);
  const [introPlayed, setIntroDone] = useState(false);
  const introDone = introPlayed || reduced;
  // Bumped once motion stops (a drag, pan, zoom or glide settled): the names are placed again.
  const [settled, setSettled] = useState(0);
  const settle = () => {
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => setSettled((v) => v + 1), 90);
  };
  useEffect(() => () => window.clearTimeout(settleTimerRef.current), [settleTimerRef]);

  /* ---------- Entrance order: breadth first from the most connected node ---------- */

  const rank = useMemo(() => entranceOrder(graph), [graph]);

  /* ---------- Interaction state (React renders on these, not per frame) ---------- */

  const [active, setActive] = useState<number | null>(null);
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  const [dragging, setDragging] = useState<number | null>(null);
  const [panning, setPanning] = useState(false);
  const act = active !== null && active < n ? active : null;

  /* ---------- Painting, layout, view, entrance, gestures, keyboard (see network-graph/) ---------- */

  const { anchorOf } = usePainter({ R, graph, batches, rank, n, ids, tip, act, dragging });
  const { startLive } = useSimulationLayout({ R, graph, n, aspect, forcesKey, settle, setLayoutVersion });
  const { setView, zoomBy, fit, screenOf, toSim } = useGraphView({
    R,
    graph,
    n,
    width,
    height,
    layoutVersion,
    act,
    source,
    settle,
  });
  const hasLayout = layoutVersion > 0;
  useGraphEntrance({ R, play, hasLayout, introDone, reduced, setIntroDone });
  const gestures = useGraphGestures({
    R,
    graph,
    n,
    act,
    source,
    hasWidth: width > 0,
    onNodeClick,
    setActive,
    setSource,
    setDragging,
    setPanning,
    settle,
    startLive,
    setView,
    zoomBy,
    screenOf,
    toSim,
  });
  const onKeyDown = (event: KeyboardEvent) =>
    graphKeyDown(event, { graph, n, act, rank, pos: posRef.current, onNodeClick, zoomBy, fit, move: gestures.move });

  /* ---------- Readouts ---------- */

  const connectionsLabel = labels.connections;
  const valueLabel = labels.value;
  const readoutOf = (i: number) => nodeReadout(itemAt(graph.nodes, i), connectionsLabel, valueLabel, format);
  const dock = useMemo(
    () =>
      docked
        ? dockSpace(
            width,
            graph.nodes.map((node) => nodeReadout(node, connectionsLabel, valueLabel, format)),
          )
        : 0,
    [docked, width, graph, connectionsLabel, valueLabel, format],
  );
  useSyncRef(dockRef, dock);

  const lit = useMemo(() => {
    const set = new Set<number>();
    if (act !== null) {
      set.add(act);
      for (const j of itemAt(graph.nodes, act).neighbours) set.add(j);
    }
    return set;
  }, [act, graph]);
  const any = act !== null;

  /* ---------- Names: placed when the view settles (see network-graph/use-names.ts) ---------- */

  const names = useGraphNames({
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
  });

  // The reading's copies: the active node's ties in its colour, its neighbours and itself at full strength.
  const litNode = act !== null ? itemAt(graph.nodes, act) : null;

  if (n === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  let tooltip: ReactNode = null;
  let announcement = "";
  if (act !== null) {
    const r = readoutOf(act);
    if (dragging === null) {
      tooltip = (
        <FlowTip
          title={r.title}
          rows={r.rows}
          anchor={NO_ANCHOR}
          bounds={{ w: width, h: height + dock }}
          docked={docked}
          store={tip}
        />
      );
    }
    const neighbourNames = itemAt(graph.nodes, act).neighbours.map((j) => itemAt(graph.nodes, j).label);
    // The value row reads label first ("value 14"); the others value first ("6 connections").
    announcement = `${r.title}: ${r.rows.map((row) => (row.label === labels.value ? `${row.label} ${row.value}` : `${row.value} ${row.label}`).trim()).join(", ")}. ${
      neighbourNames.length > 0
        ? labels.connectedTo(neighbourNames.slice(0, 8), Math.max(0, neighbourNames.length - 8))
        : ""
    }`;
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: height + dock, paddingTop: dock }}>
        <ChartFigure
          as="div"
          roleDescription={labels.roleDescription}
          label={ariaLabel}
          description={resolveInstructions(labels.instructions)}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          className={cn("relative h-full w-full overflow-hidden rounded-sheen-sm", chartFocusClass)}
          style={{ height }}
        >
          {width > 0 && (
            <svg
              ref={svgRef}
              aria-hidden
              // Drawn left to right in every writing direction: text anchors stay physical under dir="rtl".
              direction="ltr"
              width={width}
              height={height}
              className={cn(
                "block overflow-visible select-none",
                panning || dragging !== null ? "cursor-grabbing" : act !== null ? "cursor-grab" : "cursor-default",
              )}
              style={{ touchAction: "pan-x pan-y" }}
              onPointerDown={gestures.onPointerDown}
              onPointerMove={gestures.onPointerMove}
              onPointerUp={gestures.onPointerUp}
              onPointerCancel={gestures.onPointerCancel}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse" && !gestureRef.current) setActive(null);
              }}
            >
              {/* The graph in simulation units: pan and zoom are this layer's one transform. */}
              {/* pointer-events none: the graph hit-tests in JS (nearest dot), so the browser never walks every shape on a mouse move. */}
              <g ref={viewLayerRef} data-dim={act !== null ? "" : undefined} className="group/net pointer-events-none">
                <GraphMarks
                  batches={batches}
                  linkFade={linkFadeRef}
                  linkLayer={linkLayerRef}
                  nodeLayer={nodeLayerRef}
                />
                {litNode && (
                  <LitLayers
                    graph={graph}
                    litNode={litNode}
                    litLinkLayer={litLinkLayerRef}
                    litNodeLayer={litNodeLayerRef}
                  />
                )}
                {/* The active node's ring (placed by the painter). */}
                <circle
                  ref={ringRef}
                  fill="none"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  className="stroke-sheen-fg forced-colors:stroke-[Highlight]"
                  style={{ display: "none" }}
                />
              </g>

              {/* Names (screen px, moved with the pan; they fade in once the entrance is done). */}
              <g
                ref={nameLayerRef}
                className="pointer-events-none motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-slow)"
                style={{ opacity: introDone ? 1 : 0 }}
              >
                {names.map((nm) => (
                  <text
                    key={nm.i}
                    data-id={nm.i}
                    dy="0.35em"
                    textAnchor={nameAnchor(nm.side)}
                    className={cn(
                      "text-2xs font-medium",
                      haloTextClass,
                      any && !lit.has(nm.i)
                        ? "fill-sheen-fg-subtle forced-colors:fill-[GrayText]"
                        : "fill-sheen-fg forced-colors:fill-[CanvasText]",
                      act === nm.i && "font-semibold",
                    )}
                  >
                    {nm.text}
                  </text>
                ))}
              </g>
            </svg>
          )}
        </ChartFigure>

        <ZoomToolbar labels={labels} top={dock + 8} zoomBy={zoomBy} fit={fit} />
        {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
      </div>
      <ChartAnnouncer text={source === "keyboard" ? announcement : ""} />
    </div>
  );
}
