"use client";

import { createRef, useState, type RefObject } from "react";
import type { Name, View } from "./layout";
import type { ForceSimulation } from "./simulation";

/** What a paint rewrites: every mark ("all"), only the view transform ("view"), or the names ("names"). */
export type PaintScope = "all" | "view" | "names";

/** The pointer gesture in progress: a node being dragged, or the background being panned. */
export type Gesture = {
  kind: "node" | "pan";
  i: number;
  pointerId: number;
  x: number;
  y: number;
  moved: boolean;
  wasActive: boolean;
  touch: boolean;
  view: View;
};

/** A two-finger pinch: the fingers' distance and midpoint when it began, and the view then. */
export type Pinch = { d: number; mx: number; my: number; view: View };

/** The SVG marks the painter writes to, found by `data-id` after each render. */
export type Marks = {
  /** One path per colour holds every dot of that colour; one path per stroke width every line of that width. */
  nodes: Map<string, SVGPathElement>;
  links: Map<string, SVGPathElement>;
  names: Map<string, SVGTextElement>;
  /** The reading's own copies of the active node's ties and neighbours, drawn over the dimmed graph. */
  litNodes: Map<string, SVGCircleElement>;
  litLinks: Map<string, SVGLineElement>;
};

/**
 * What is on screen, kept outside React: the simulation, node positions, the view transform, the running tweens
 * and the SVG layers the painter writes to. One ref each, shared by the hooks in this folder; the object itself
 * never changes, so it is safe in a dependency list.
 */
export type GraphRefs = {
  svgRef: RefObject<SVGSVGElement | null>;
  viewLayerRef: RefObject<SVGGElement | null>;
  linkFadeRef: RefObject<SVGGElement | null>;
  linkLayerRef: RefObject<SVGGElement | null>;
  nodeLayerRef: RefObject<SVGGElement | null>;
  litLinkLayerRef: RefObject<SVGGElement | null>;
  litNodeLayerRef: RefObject<SVGGElement | null>;
  nameLayerRef: RefObject<SVGGElement | null>;
  /** The active node's ring (placed by the painter). */
  ringRef: RefObject<SVGCircleElement | null>;
  reducedRef: RefObject<boolean>;
  simRef: RefObject<ForceSimulation | null>;
  /** Node positions (simulation units) in graph order; NaN = not placed yet (a node new in this data). */
  posRef: RefObject<number[] | null>;
  posIdsRef: RefObject<string[]>;
  /**
   * Where each node is drawn right now (the entrance ripple included), and the scale of its dot inside the zoomed
   * layer (its radius there is r × unit; NaN = not drawn).
   */
  drawnRef: RefObject<Float64Array>;
  unitRef: RefObject<Float64Array>;
  /** Where the layout settled (the glide's target). */
  finalRef: RefObject<number[] | null>;
  centreRef: RefObject<{ x: number; y: number }>;
  viewRef: RefObject<View>;
  /** Entrance progress, 0 to 1. */
  introRef: RefObject<number>;
  glideRef: RefObject<{ stop: () => void } | null>;
  viewTweenRef: RefObject<{ stop: () => void } | null>;
  liveRafRef: RefObject<number>;
  /** The reader has zoomed or panned: a new layout or resize no longer re-fits the view. */
  userMovedRef: RefObject<boolean>;
  marksRef: RefObject<Marks>;
  settleTimerRef: RefObject<number>;
  /** Names placed at the last settle, read by the painter (they follow their nodes while things move). */
  namesRef: RefObject<Name[]>;
  paintRef: RefObject<(what: PaintScope) => void>;
  lastKRef: RefObject<number>;
  /** The reading being drawn (null while a node is dragged), and the active node. */
  actRef: RefObject<number | null>;
  activeRef: RefObject<number | null>;
  dockRef: RefObject<number>;
  paintedGraphRef: RefObject<unknown>;
  fittedForRef: RefObject<string>;
  panOffsetRef: RefObject<{ dx: number; dy: number } | null>;
  gestureRef: RefObject<Gesture | null>;
  touchesRef: RefObject<Map<number, { x: number; y: number }>>;
  pinchRef: RefObject<Pinch | null>;
  /** The latest zoom and hit-test functions, for the non-passive wheel and touch listeners. */
  zoomRef: RefObject<(factor: number, at?: { x: number; y: number }, instant?: boolean) => void>;
  hitRef: RefObject<(x: number, y: number) => boolean>;
};

function createGraphRefs(reduced: boolean): GraphRefs {
  return {
    svgRef: createRef<SVGSVGElement>(),
    viewLayerRef: createRef<SVGGElement>(),
    linkFadeRef: createRef<SVGGElement>(),
    linkLayerRef: createRef<SVGGElement>(),
    nodeLayerRef: createRef<SVGGElement>(),
    litLinkLayerRef: createRef<SVGGElement>(),
    litNodeLayerRef: createRef<SVGGElement>(),
    nameLayerRef: createRef<SVGGElement>(),
    ringRef: createRef<SVGCircleElement>(),
    reducedRef: { current: reduced },
    simRef: { current: null },
    posRef: { current: null },
    posIdsRef: { current: [] },
    drawnRef: { current: new Float64Array(0) },
    unitRef: { current: new Float64Array(0) },
    finalRef: { current: null },
    centreRef: { current: { x: 0, y: 0 } },
    viewRef: { current: { k: 1, tx: 0, ty: 0 } },
    introRef: { current: reduced ? 1 : 0 },
    glideRef: { current: null },
    viewTweenRef: { current: null },
    liveRafRef: { current: 0 },
    userMovedRef: { current: false },
    marksRef: {
      current: { nodes: new Map(), links: new Map(), names: new Map(), litNodes: new Map(), litLinks: new Map() },
    },
    settleTimerRef: { current: 0 },
    namesRef: { current: [] },
    paintRef: { current: () => undefined },
    lastKRef: { current: NaN },
    actRef: { current: null },
    activeRef: { current: null },
    dockRef: { current: 0 },
    paintedGraphRef: { current: null },
    fittedForRef: { current: "" },
    panOffsetRef: { current: null },
    gestureRef: { current: null },
    touchesRef: { current: new Map() },
    pinchRef: { current: null },
    zoomRef: { current: () => undefined },
    hitRef: { current: () => false },
  };
}

/** One stable set of refs per graph instance: created on the first render, the same object after. */
export function useGraphRefs(reduced: boolean): GraphRefs {
  const [refs] = useState(() => createGraphRefs(reduced));
  return refs;
}
