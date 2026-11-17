"use client";

import { useEffect, type RefObject } from "react";

import { clamp } from "../chart-utils";

/** The latest view, size and actions the native listeners read, so they are bound once. @internal */
export type LiveView = {
  view: { start: number; end: number };
  innerW: number;
  count: number;
  zoom: boolean;
  left: number;
  setView: (start: number, end: number) => void;
  zoomBy: (factor: number, anchor: number) => void;
  nudgeMoving: () => void;
};

/**
 * Wheel and Safari's trackpad gestures on the chart (non-passive, so a zoom never scrolls the page).
 * Bound once the svg exists; everything else is read from `live`. A plain scroll calls `onScrollHint`.
 * @internal
 */
export function useWheelZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  live: RefObject<LiveView>,
  onScrollHint: (shown: boolean) => void,
  rebind: readonly unknown[],
) {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let hintTimer = 0;
    const plotX = (clientX: number) => clientX - svg.getBoundingClientRect().left - live.current.left;
    const anchorAt = (clientX: number) => {
      const { view: v, innerW: w } = live.current;
      return v.start + (clamp(plotX(clientX), 0, w) / Math.max(1, w)) * (v.end - v.start);
    };
    const onWheel = (e: WheelEvent) => {
      if (!live.current.zoom || live.current.count < 2) return;
      const { view: v, innerW: w, count: n } = live.current;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = clamp(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY, -60, 60);
        live.current.nudgeMoving();
        live.current.zoomBy(Math.exp(delta * 0.01), anchorAt(e.clientX));
        return;
      }
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (sideways !== 0) {
        if (v.end - v.start >= n - 0.01) return;
        e.preventDefault();
        const di = (sideways / Math.max(1, w)) * (v.end - v.start);
        live.current.nudgeMoving();
        live.current.setView(v.start + di, v.end + di);
        return;
      }
      // A plain scroll keeps scrolling the page; say how to zoom instead.
      onScrollHint(true);
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(() => onScrollHint(false), 1400);
    };
    type GestureLike = Event & { scale: number; clientX: number };
    let gestureStart: { span: number; scale: number } | null = null;
    const onGestureStart = (e: Event) => {
      if (!live.current.zoom) return;
      e.preventDefault();
      const v = live.current.view;
      gestureStart = { span: v.end - v.start, scale: (e as GestureLike).scale || 1 };
    };
    const onGestureChange = (e: Event) => {
      if (!gestureStart || !live.current.zoom) return;
      e.preventDefault();
      const g = e as GestureLike;
      const v = live.current.view;
      const nextSpan = gestureStart.span / Math.max(0.05, g.scale / gestureStart.scale);
      live.current.nudgeMoving();
      live.current.zoomBy(nextSpan / (v.end - v.start), anchorAt(g.clientX));
    };
    const onGestureEnd = () => (gestureStart = null);
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("gesturestart", onGestureStart);
    svg.addEventListener("gesturechange", onGestureChange);
    svg.addEventListener("gestureend", onGestureEnd);
    return () => {
      window.clearTimeout(hintTimer);
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("gesturestart", onGestureStart);
      svg.removeEventListener("gesturechange", onGestureChange);
      svg.removeEventListener("gestureend", onGestureEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bound again only when the svg appears or disappears
  }, rebind);
}
