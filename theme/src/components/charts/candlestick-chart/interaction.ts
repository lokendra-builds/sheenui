"use client";

import { useRef } from "react";

import { clamp } from "../chart-utils";

/** What the candlestick's pointer and keyboard handlers read and change. @internal */
export type CandleInteraction = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  view: { start: number; end: number };
  span: number;
  count: number;
  zoom: boolean;
  zoomed: boolean;
  minSpan: number;
  innerW: number;
  priceH: number;
  margin: { top: number; left: number };
  active: number | null;
  setActive: (i: number | null) => void;
  setCrossY: (y: number | null) => void;
  setView: (start: number, end: number) => void;
  zoomBy: (factor: number, anchor: number) => void;
  glide: (start: number, end: number) => void;
  nudgeMoving: () => void;
  fromPointer: () => void;
  fromKeyboard: () => void;
};

/**
 * The candlestick's pointer (hover, drag-pan, two-finger pinch) and keyboard handlers. The pointer
 * and gesture bookkeeping lives in refs: they change on every move and never render by themselves.
 * @internal
 */
export function useCandleInteraction(o: CandleInteraction) {
  const { svgRef, view, span, count, zoom, zoomed, minSpan, innerW, priceH, margin: M, active: act } = o;
  const { setActive, setCrossY, setView, zoomBy, glide, nudgeMoving, fromPointer, fromKeyboard } = o;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    kind: "drag" | "pinch";
    x0: number;
    dist0: number;
    start: number;
    end: number;
    moved: boolean;
  } | null>(null);
  const indexAt = (px: number) => clamp(Math.floor(view.start + (px / Math.max(1, innerW)) * span), 0, count - 1);

  const local = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    return { x: e.clientX - rect.left - M.left, y: e.clientY - rect.top - M.top };
  };
  const scrub = (px: number, py: number) => {
    setActive(indexAt(px));
    setCrossY(py >= 0 && py <= priceH ? py : null);
  };
  function onPointerDown(e: React.PointerEvent<SVGRectElement>) {
    fromPointer();
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (typeof e.currentTarget.setPointerCapture === "function") e.currentTarget.setPointerCapture(e.pointerId);
    const [a, b] = [...pointers.current.values()];
    if (pointers.current.size === 2 && zoom && a && b) {
      gesture.current = {
        kind: "pinch",
        x0: (a.x + b.x) / 2,
        dist0: Math.max(10, Math.abs(a.x - b.x)),
        start: view.start,
        end: view.end,
        moved: true,
      };
      return;
    }
    if (e.pointerType === "mouse" && e.button === 0 && zoom && zoomed) {
      gesture.current = { kind: "drag", x0: p.x, dist0: 0, start: view.start, end: view.end, moved: false };
    }
    scrub(p.x, p.y);
  }
  function onPointerMove(e: React.PointerEvent<SVGRectElement>) {
    fromPointer();
    const p = local(e);
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    const [a, b] = [...pointers.current.values()];
    if (g?.kind === "pinch" && a && b) {
      const mid = (a.x + b.x) / 2;
      const dist = Math.max(10, Math.abs(a.x - b.x));
      const span0 = g.end - g.start;
      const nextSpan = clamp(span0 * (g.dist0 / dist), Math.max(1, minSpan), count);
      // Keep the candle under the fingers' midpoint under it, then follow the midpoint.
      const anchor = g.start + (g.x0 / Math.max(1, innerW)) * span0;
      const start = anchor - (mid / Math.max(1, innerW)) * nextSpan;
      nudgeMoving();
      setView(start, start + nextSpan);
      return;
    }
    if (g?.kind === "drag") {
      const dx = p.x - g.x0;
      if (Math.abs(dx) > 3) g.moved = true;
      if (g.moved) {
        const di = (-dx / Math.max(1, innerW)) * (g.end - g.start);
        nudgeMoving();
        setView(g.start + di, g.end + di);
      }
    }
    scrub(p.x, p.y);
  }
  function onPointerEnd(e: React.PointerEvent<SVGRectElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2 && gesture.current?.kind === "pinch") gesture.current = null;
    if (pointers.current.size === 0) gesture.current = null;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    fromKeyboard();
    const cur = act ?? Math.min(count - 1, Math.floor(view.end) - 1);
    const keep = (i: number) => {
      setActive(i);
      setCrossY(null);
      // Keep the active candle in view: the window follows it.
      if (i < view.start) setView(i, i + span);
      else if (i + 1 > view.end) setView(i + 1 - span, i + 1);
    };
    if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight") && zoom) {
      const di = (e.key === "ArrowLeft" ? -1 : 1) * Math.max(1, span * 0.15);
      setView(view.start + di, view.end + di);
    } else if (e.key === "ArrowLeft") keep(act === null ? cur : Math.max(0, cur - 1));
    else if (e.key === "ArrowRight") keep(act === null ? cur : Math.min(count - 1, cur + 1));
    else if (e.key === "Home") keep(0);
    else if (e.key === "End") keep(count - 1);
    else if ((e.key === "+" || e.key === "=") && zoom)
      zoomBy(0.7, act !== null ? act + 0.5 : (view.start + view.end) / 2);
    else if ((e.key === "-" || e.key === "_") && zoom)
      zoomBy(1 / 0.7, act !== null ? act + 0.5 : (view.start + view.end) / 2);
    else if (e.key === "0" && zoom) glide(0, count);
    else if (e.key === "Escape" && act !== null) setActive(null);
    else return;
    e.preventDefault();
  }

  return { onPointerDown, onPointerMove, onPointerEnd, onKeyDown, gesture };
}
