"use client";

import { useEffect, type Dispatch, type PointerEvent, type SetStateAction } from "react";
import { useSyncRef } from "../../../hooks/use-latest";
import { clamp, itemAt } from "../chart-utils";
import { r2 } from "../flow-utils";
import { K_MAX, K_MIN, dotScale, type View } from "./layout";
import type { Graph } from "./model";
import type { GraphRefs } from "./refs";
import type { NetworkGraphProps } from "./types";

/** What the pointer handling needs: the refs, the graph, the reading state and the view's helpers. */
export type GesturesInput = {
  R: GraphRefs;
  graph: Graph;
  n: number;
  act: number | null;
  source: "keyboard" | "pointer";
  hasWidth: boolean;
  onNodeClick: NetworkGraphProps["onNodeClick"];
  setActive: Dispatch<SetStateAction<number | null>>;
  setSource: Dispatch<SetStateAction<"keyboard" | "pointer">>;
  setDragging: Dispatch<SetStateAction<number | null>>;
  setPanning: Dispatch<SetStateAction<boolean>>;
  settle: () => void;
  startLive: () => void;
  setView: (v: View) => void;
  zoomBy: (factor: number, at?: { x: number; y: number }, instant?: boolean) => void;
  screenOf: (i: number) => { x: number; y: number };
  toSim: (sx: number, sy: number) => { x: number; y: number };
};

/**
 * Pointer interaction: hover reads a node, a drag pulls it (the network follows through the live simulation), the
 * background pans on the compositor, two fingers pinch and Ctrl / ⌘ + wheel zooms. Hit testing is done in JS (the
 * nearest dot within reach), so the browser never walks every shape on a mouse move. Returns the SVG's pointer
 * handlers and `move`, which sets the active node and how it was chosen.
 */
export function useGraphGestures({
  R,
  graph,
  n,
  act,
  source,
  hasWidth,
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
}: GesturesInput) {
  const {
    svgRef,
    viewRef,
    viewTweenRef,
    userMovedRef,
    panOffsetRef,
    paintRef,
    gestureRef,
    touchesRef,
    pinchRef,
    simRef,
    posRef,
    finalRef,
    glideRef,
  } = R;
  const { reducedRef, zoomRef, hitRef } = R;

  // Relative to the svg's (never moved) parent: while a pan slides the svg itself, this box stays put.
  const local = (e: { clientX: number; clientY: number }) => {
    const box = svgRef.current?.parentElement?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  /* ---------- Panning on the compositor ---------- */

  // While the background is dragged the drawing itself doesn't change: the svg slides as one
  // composited layer (a CSS translate, no repaint, no re-raster), and the offset is folded into
  // the view when the pan ends. Big graphs pan as smoothly as small ones, on phones too.
  function panTo(dx: number, dy: number) {
    const svg = svgRef.current;
    if (!svg) return;
    if (!panOffsetRef.current) svg.style.willChange = "transform";
    panOffsetRef.current = { dx, dy };
    svg.style.transform = `translate3d(${r2(dx)}px, ${r2(dy)}px, 0)`;
  }
  function endPan() {
    const o = panOffsetRef.current;
    const svg = svgRef.current;
    panOffsetRef.current = null;
    if (!o || !svg) return;
    const v = viewRef.current;
    viewRef.current = { k: v.k, tx: v.tx + o.dx, ty: v.ty + o.dy };
    svg.style.transform = "";
    svg.style.willChange = "";
    paintRef.current("view");
  }
  const nearest = (x: number, y: number, max: number) => {
    let best: number | null = null;
    let bestD = max * max;
    const s = dotScale(viewRef.current.k);
    for (let i = 0; i < n; i++) {
      const p = screenOf(i);
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
      const r = itemAt(graph.nodes, i).r * s;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2 - r * r;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  /* ---------- Interaction ---------- */

  function move(i: number | null, from: "keyboard" | "pointer") {
    setSource(from);
    setActive(i);
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const p = local(event);
    const touch = event.pointerType !== "mouse";
    if (touch) touchesRef.current.set(event.pointerId, p);
    if (touch && touchesRef.current.size === 2) {
      // Second finger: a pinch replaces whatever the first finger started.
      const [a, b] = [...touchesRef.current.values()];
      if (a && b)
        pinchRef.current = {
          d: Math.hypot(a.x - b.x, a.y - b.y),
          mx: (a.x + b.x) / 2,
          my: (a.y + b.y) / 2,
          view: viewRef.current,
        };
      gestureRef.current = null;
      setDragging(null);
      return;
    }
    const hit = nearest(p.x, p.y, touch ? 26 : 14);
    if (hit !== null) {
      gestureRef.current = {
        kind: "node",
        i: hit,
        pointerId: event.pointerId,
        x: p.x,
        y: p.y,
        moved: false,
        wasActive: act === hit,
        touch,
        view: viewRef.current,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      if (touch) move(hit, "pointer");
    } else {
      // One finger on the background scrolls the page; tapping it clears the reading.
      setActive(null);
      if (touch) return;
      gestureRef.current = {
        kind: "pan",
        i: -1,
        pointerId: event.pointerId,
        x: p.x,
        y: p.y,
        moved: false,
        wasActive: false,
        touch,
        view: viewRef.current,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const p = local(event);
    if (event.pointerType !== "mouse" && touchesRef.current.has(event.pointerId))
      touchesRef.current.set(event.pointerId, p);
    if (pinchRef.current && touchesRef.current.size >= 2) {
      const [a, b] = [...touchesRef.current.values()];
      if (!a || !b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const s = pinchRef.current;
      const k = clamp((s.view.k * d) / Math.max(1, s.d), K_MIN, K_MAX);
      // Keep the point under the fingers' midpoint there, and follow the midpoint.
      const cx = (s.mx - s.view.tx) / s.view.k;
      const cy = (s.my - s.view.ty) / s.view.k;
      userMovedRef.current = true;
      viewTweenRef.current?.stop();
      setView({ k, tx: mx - cx * k, ty: my - cy * k });
      settle();
      return;
    }
    const g = gestureRef.current;
    if (!g) {
      if (event.pointerType === "mouse") {
        const hit = nearest(p.x, p.y, 14);
        if (hit !== act || source !== "pointer") move(hit, "pointer");
      }
      return;
    }
    if (g.pointerId !== event.pointerId) return;
    const dist = Math.hypot(p.x - g.x, p.y - g.y);
    if (!g.moved && dist < 3) return;
    const firstMove = !g.moved;
    g.moved = true;
    if (g.kind === "pan") {
      if (firstMove) {
        setPanning(true);
        viewTweenRef.current?.stop();
      }
      userMovedRef.current = true;
      panTo(p.x - g.x, p.y - g.y);
      return;
    }
    // Dragging a node: pin it under the pointer and let the network follow.
    const sim = simRef.current;
    const P = posRef.current;
    if (!sim || !P) return;
    if (firstMove) {
      glideRef.current?.stop();
      setDragging(g.i);
      if (act !== g.i) move(g.i, "pointer");
    }
    const q = toSim(p.x, p.y);
    if (reducedRef.current) {
      // No simulation: only this node moves.
      sim.x[g.i] = q.x;
      sim.y[g.i] = q.y;
      const next = [...P];
      next[g.i * 2] = q.x;
      next[g.i * 2 + 1] = q.y;
      finalRef.current = next;
      posRef.current = next;
      paintRef.current("all");
      return;
    }
    sim.fx[g.i] = q.x;
    sim.fy[g.i] = q.y;
    sim.alphaTarget = 0.3;
    if (sim.alpha < 0.3) sim.alpha = 0.3;
    startLive();
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    touchesRef.current.delete(event.pointerId);
    if (touchesRef.current.size < 2) pinchRef.current = null;
    const g = gestureRef.current;
    if (g?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    if (g.kind === "pan") {
      if (g.moved) {
        endPan();
        setPanning(false);
        settle();
      }
      return;
    }
    const sim = simRef.current;
    if (g.moved) {
      if (sim) {
        sim.fx[g.i] = null;
        sim.fy[g.i] = null;
        sim.alphaTarget = 0;
      }
      setDragging(null);
      if (reducedRef.current) settle();
      return;
    }
    // A tap: the first one on touch reads the node, the next one activates it.
    if (g.touch && !g.wasActive) return;
    const node = itemAt(graph.nodes, g.i);
    onNodeClick?.({
      id: node.id,
      label: node.label,
      group: node.group,
      connections: node.neighbours.map((j) => itemAt(graph.nodes, j).id),
    });
  }

  function onPointerCancel(event: PointerEvent<SVGSVGElement>) {
    touchesRef.current.delete(event.pointerId);
    pinchRef.current = null;
    endPan();
    const g = gestureRef.current;
    if (g?.kind === "node" && g.moved && simRef.current) {
      simRef.current.fx[g.i] = null;
      simRef.current.fy[g.i] = null;
      simRef.current.alphaTarget = 0;
    }
    gestureRef.current = null;
    setDragging(null);
    setPanning(false);
    settle();
  }

  // Ctrl / ⌘ + wheel (and trackpad pinch) zooms; a plain wheel keeps scrolling the page.
  // Touch: a finger that lands on a node drags it, two fingers pinch; one finger on the
  // background still scrolls the page. (touch-action isn't honoured on SVG children, so the
  // touchstart that begins a drag or a pinch is cancelled instead.)
  useSyncRef(zoomRef, zoomBy);
  useSyncRef(hitRef, (x, y) => nearest(x, y, 26) !== null);
  const hasNodes = n > 0;
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const box = (svg.parentElement ?? svg).getBoundingClientRect();
      zoomRef.current(Math.exp(-e.deltaY * 0.01), { x: e.clientX - box.left, y: e.clientY - box.top }, true);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (!e.cancelable) return;
      const t = e.touches[0];
      if (e.touches.length >= 2) e.preventDefault();
      else if (t) {
        const box = (svg.parentElement ?? svg).getBoundingClientRect();
        if (hitRef.current(t.clientX - box.left, t.clientY - box.top)) e.preventDefault();
      }
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => {
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("touchstart", onTouchStart);
    };
  }, [hasWidth, hasNodes, svgRef, zoomRef, hitRef]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, move };
}
