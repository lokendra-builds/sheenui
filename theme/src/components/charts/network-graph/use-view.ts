"use client";

import { useEffect, useEffectEvent } from "react";
import { animate } from "motion/react";
import { duration } from "../../../motion/tokens";
import { clamp } from "../chart-utils";
import { enterCurve } from "../flow-utils";
import { K_MAX, K_MIN, type View } from "./layout";
import type { Graph } from "./model";
import type { GraphRefs } from "./refs";

/** What the view needs: the refs, the graph, the box and the layout's version (a new layout re-fits the view). */
export type ViewInput = {
  R: GraphRefs;
  graph: Graph;
  n: number;
  width: number;
  height: number;
  layoutVersion: number;
  /** The active node and how it was chosen: a keyboard move keeps its node in view. */
  act: number | null;
  source: "keyboard" | "pointer";
  settle: () => void;
};

/**
 * The view (zoom and pan): one transform on the graph's layer. Fits the graph when a layout lands or the box
 * resizes (unless the reader has zoomed or panned), tweens zooms and keeps the keyboard's node in view. Returns the
 * view setters and the screen / simulation coordinate helpers.
 */
export function useGraphView({ R, graph, n, width, height, layoutVersion, act, source, settle }: ViewInput) {
  const { viewRef, viewTweenRef, reducedRef, paintRef, finalRef, userMovedRef, fittedForRef, drawnRef } = R;

  const setView = (v: View) => {
    viewRef.current = v;
    paintRef.current("view");
  };
  const animateView = (to: View, instant = reducedRef.current) => {
    viewTweenRef.current?.stop();
    if (instant) {
      setView(to);
      settle();
      return;
    }
    const from = viewRef.current;
    viewTweenRef.current = animate(0, 1, {
      duration: duration.slow,
      ease: "linear",
      onUpdate: (t) => {
        const e = enterCurve(t);
        setView({
          k: from.k + (to.k - from.k) * e,
          tx: from.tx + (to.tx - from.tx) * e,
          ty: from.ty + (to.ty - from.ty) * e,
        });
      },
      onComplete: settle,
    });
  };

  const fitView = (P: number[] | null): View => {
    if (!P || n === 0 || width === 0) return { k: 1, tx: width / 2, ty: height / 2 };
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    graph.nodes.forEach((g, i) => {
      const x = P[i * 2] ?? 0;
      const y = P[i * 2 + 1] ?? 0;
      x0 = Math.min(x0, x - g.r);
      x1 = Math.max(x1, x + g.r);
      y0 = Math.min(y0, y - g.r);
      y1 = Math.max(y1, y + g.r);
    });
    // Room for names on the right and the zoom buttons at the top.
    const padX = 28;
    const padY = 26;
    const k = clamp(
      Math.min((width - padX * 2 - 40) / Math.max(1, x1 - x0), (height - padY * 2) / Math.max(1, y1 - y0)),
      K_MIN,
      2,
    );
    return { k, tx: width / 2 - ((x0 + x1) / 2) * k - 20, ty: height / 2 - ((y0 + y1) / 2) * k };
  };

  // Fit when a layout lands or the box resizes (unless the reader has zoomed or panned).
  const fitTo = useEffectEvent((P: number[], instant: boolean) => animateView(fitView(P), instant));
  useEffect(() => {
    const final = finalRef.current;
    if (!final || width === 0) return;
    const key = `${layoutVersion}|${width}|${height}`;
    const prevKey = fittedForRef.current;
    if (prevKey === key) return;
    fittedForRef.current = key;
    if (userMovedRef.current) return;
    // The first fit and resizes are instant; a new layout glides there.
    fitTo(final, prevKey === "" || prevKey.startsWith(`${layoutVersion}|`) || reducedRef.current);
  }, [layoutVersion, width, height, finalRef, fittedForRef, userMovedRef, reducedRef]);

  /** Zoom by `factor` around a point (default: the centre of the box). */
  function zoomBy(factor: number, at?: { x: number; y: number }, instant = false) {
    const v = viewRef.current;
    const k = clamp(v.k * factor, K_MIN, K_MAX);
    const ax = at?.x ?? width / 2;
    const ay = at?.y ?? height / 2;
    const cx = (ax - v.tx) / v.k;
    const cy = (ay - v.ty) / v.k;
    userMovedRef.current = true;
    animateView({ k, tx: ax - cx * k, ty: ay - cy * k }, instant || reducedRef.current);
  }
  function fit() {
    userMovedRef.current = false;
    animateView(fitView(finalRef.current));
  }

  /* ---------- Screen px and simulation units ---------- */

  const screenOf = (i: number) => {
    const v = viewRef.current;
    return { x: (drawnRef.current[i * 2] ?? NaN) * v.k + v.tx, y: (drawnRef.current[i * 2 + 1] ?? NaN) * v.k + v.ty };
  };
  const toSim = (sx: number, sy: number) => ({
    x: (sx - viewRef.current.tx) / viewRef.current.k,
    y: (sy - viewRef.current.ty) / viewRef.current.k,
  });

  // Keep the keyboard's node in view (the view and size are read when the node changes, not watched).
  const keepInView = useEffectEvent((node: number) => {
    const v = viewRef.current;
    const { x: sx, y: sy } = screenOf(node);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
    const m = 40;
    let dx = 0;
    let dy = 0;
    if (sx < m) dx = m - sx;
    else if (sx > width - m - 60) dx = width - m - 60 - sx;
    if (sy < m) dy = m - sy;
    else if (sy > height - m) dy = height - m - sy;
    if (dx || dy) animateView({ k: v.k, tx: v.tx + dx, ty: v.ty + dy });
  });
  useEffect(() => {
    if (act !== null && source === "keyboard") keepInView(act);
  }, [act, source]);

  return { setView, animateView, fitView, zoomBy, fit, screenOf, toSim };
}
