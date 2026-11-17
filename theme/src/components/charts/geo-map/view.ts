"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { animate, useMotionValue } from "motion/react";

import { duration, ease } from "../../../motion/tokens";
import { clamp } from "../chart-utils";
import { WORLD_FRAME_HEIGHT, WORLD_FRAME_WIDTH } from "./projection";

/** The map's zoom and pan: a scale `k` and a translation, in frame units. @internal */
export type MapView = { k: number; x: number; y: number };
type View = MapView;

/** What the map's view (zoom / pan) reads. @internal */
export type WorldMapViewInput = {
  /** Frame units per screen px. */
  unit: number;
  ready: boolean;
  mode: string;
  maxZoom: number;
  reduced: boolean;
  /** The zoom groups whose transform is written every frame. */
  zoomRef: RefObject<SVGGElement | null>;
  zoom1Ref: RefObject<SVGGElement | null>;
  zoom2Ref: RefObject<SVGGElement | null>;
};

/**
 * The map's view: motion values written straight to the DOM on every frame (no React render per frame),
 * the committed view, and the animated `setView` / `zoomAt` / `resetView` / `revealPoint` that move it.
 * @internal
 */
export function useWorldMapView(o: WorldMapViewInput) {
  const { unit, ready, mode, maxZoom, reduced, zoomRef, zoom1Ref, zoom2Ref } = o;
  const zk = useMotionValue(1);
  const zx = useMotionValue(0);
  const zy = useMotionValue(0);
  const [view, setViewState] = useState<View>({ k: 1, x: 0, y: 0 });
  /** Where the view is going (equal to the motion values once they settle): zooms chain from here. */
  const target = useRef<View>({ k: 1, x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const viewAnim = useRef<{ stop: () => void }[]>([]);
  const hatchRef = useRef<SVGPatternElement>(null);
  const bubblesRef = useRef<SVGGElement>(null);

  // Write the view straight to the DOM on every frame (no React render per frame): the zoom
  // group's transform, the hatch's counter-scale and the bubbles' counter-scale (one variable).
  useLayoutEffect(() => {
    const write = () => {
      const k = zk.get();
      const transform = `translate(${zx.get()} ${zy.get()}) scale(${k})`;
      for (const g of [zoomRef, zoom1Ref, zoom2Ref]) g.current?.setAttribute("transform", transform);
      // The "no data" hatch stays the same fine texture on screen at any zoom.
      hatchRef.current?.setAttribute("patternTransform", `rotate(45) scale(${(unit * 0.8) / k})`);
      bubblesRef.current?.style.setProperty("--geo-bz", String(1 / k));
    };
    write();
    const offs = [zk.on("change", write), zx.on("change", write), zy.on("change", write)];
    return () => offs.forEach((off) => off());
  }, [unit, ready, mode, zk, zx, zy, zoomRef, zoom1Ref, zoom2Ref]);

  const clampView = useCallback(
    (v: View): View => {
      const k = clamp(v.k, 1, Math.max(1, maxZoom));
      return { k, x: clamp(v.x, WORLD_FRAME_WIDTH * (1 - k), 0), y: clamp(v.y, WORLD_FRAME_HEIGHT * (1 - k), 0) };
    },
    [maxZoom],
  );

  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const setView = useCallback(
    (next: View, animated = true) => {
      const v = clampView(next);
      target.current = v;
      // A tap's point no longer sits on its place once the view moves: anchor the tooltip to the place.
      setPointer(null);
      viewAnim.current.forEach((a) => a.stop());
      viewAnim.current = [];
      if (!animated || reduced) {
        zk.set(v.k);
        zx.set(v.x);
        zy.set(v.y);
        setViewState(v);
        setMoving(false);
        return;
      }
      setMoving(true);
      const t = { duration: duration.slow, ease: ease.out };
      const done = animate(zk, v.k, t);
      viewAnim.current = [done, animate(zx, v.x, t), animate(zy, v.y, t)];
      void done.then(() => {
        if (target.current !== v) return; // a newer move took over
        setViewState(v);
        setMoving(false);
      });
    },
    [clampView, reduced, zk, zx, zy],
  );

  /**
   * Zoom by `factor`, keeping the frame point under (vx, vy) — in viewBox units — still. It chains
   * from where the view is going, so two quick zooms always land on an exact level (2, 4, 8…).
   */
  const zoomAt = useCallback(
    (factor: number, vx = WORLD_FRAME_WIDTH / 2, vy = WORLD_FRAME_HEIGHT / 2, animated = true) => {
      const { k, x, y } = target.current;
      const nk = clamp(k * factor, 1, maxZoom);
      const px = (vx - x) / k;
      const py = (vy - y) / k;
      setView({ k: nk, x: vx - px * nk, y: vy - py * nk }, animated);
    },
    [maxZoom, setView],
  );

  const resetView = useCallback(() => setView({ k: 1, x: 0, y: 0 }), [setView]);

  /** Pan (animated) so the frame point (x, y) sits in view, centring it if it's off-screen. */
  const revealPoint = useCallback(
    (x: number, y: number) => {
      const { k, x: tx, y: ty } = target.current;
      if (k <= 1) return;
      const sx = x * k + tx;
      const sy = y * k + ty;
      const mx = WORLD_FRAME_WIDTH * 0.12;
      const my = WORLD_FRAME_HEIGHT * 0.12;
      if (sx > mx && sx < WORLD_FRAME_WIDTH - mx && sy > my && sy < WORLD_FRAME_HEIGHT - my) return;
      setView({ k, x: WORLD_FRAME_WIDTH / 2 - x * k, y: WORLD_FRAME_HEIGHT / 2 - y * k });
    },
    [setView],
  );
  return {
    zk,
    zx,
    zy,
    view,
    target,
    moving,
    setMoving,
    setViewState,
    viewAnim,
    hatchRef,
    bubblesRef,
    clampView,
    pointer,
    setPointer,
    zoomAt,
    resetView,
    revealPoint,
  };
}
