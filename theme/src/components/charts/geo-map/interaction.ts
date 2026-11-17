"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import { clamp, itemAt } from "../chart-utils";
import { WORLD_FRAME_HEIGHT, WORLD_FRAME_WIDTH } from "./projection";
import type { MapItem as Item } from "./data";
import type { useWorldMapView, MapView as View } from "./view";

type MapViewState = ReturnType<typeof useWorldMapView>;

/** What the map's pointer handling reads and changes. @internal */
export type WorldMapPointerInput = {
  svgRef: RefObject<SVGSVGElement | null>;
  mapRef: RefObject<HTMLDivElement | null>;
  view: MapViewState;
  items: Item[];
  mode: string;
  unit: number;
  zoomable: boolean;
  maxZoom: number;
  ready: boolean;
  fromPointer: () => void;
  setActive: (i: number | null) => void;
  select: (i: number) => void;
};

/**
 * The map's pointer handling: hover, tap-to-pin, drag to pan, two-finger pinch, double tap to zoom, and
 * the native wheel listener (⌘/Ctrl + wheel and trackpad pinch zoom; a plain wheel scrolls the page and
 * flashes a hint).
 * @internal
 */
export function useWorldMapPointer(o: WorldMapPointerInput) {
  const { svgRef, mapRef, items, mode, unit, zoomable, maxZoom, ready, fromPointer, setActive, select } = o;
  const { zk, zx, zy, setViewState, setMoving, clampView, setPointer, zoomAt } = o.view;
  const { target: targetRef, viewAnim: viewAnimRef } = o.view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
    view: View;
    dist: number;
    mid: [number, number];
  } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  /** Touch double taps are handled in endGesture: the browser's own dblclick that follows is ignored. */
  const lastPointerType = useRef("mouse");

  /** Client point → viewBox point (before the zoom transform) and frame point (after it). */
  const toFrame = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const vx = ((clientX - rect.left) / rect.width) * WORLD_FRAME_WIDTH;
    const vy = ((clientY - rect.top) / rect.height) * WORLD_FRAME_HEIGHT;
    const k = zk.get();
    return {
      vx,
      vy,
      fx: (vx - zx.get()) / k,
      fy: (vy - zy.get()) / k,
      px: clientX - rect.left,
      py: clientY - rect.top,
    };
  };

  /** The item under a pointer event: the country path it hit, or the bubble it's on / nearest to it. */
  const hitTest = (clientX: number, clientY: number): number | null => {
    if (mode === "bubble") {
      const p = toFrame(clientX, clientY);
      if (!p) return null;
      const k = zk.get();
      let best: number | null = null;
      let bestScore = Infinity;
      for (let i = 0; i < items.length; i++) {
        const it = itemAt(items, i);
        const d = Math.hypot(it.x - p.fx, it.y - p.fy) / (unit / k); // in screen px
        // Inside a bubble beats near one; among those, the smallest wins (it's drawn on top).
        const score = d <= it.r ? it.r - 1000 : d;
        if (d <= Math.max(it.r, 12) && score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      return best;
    }
    // Hit-test the real outlines (pointer capture retargets events, so not event.target).
    const hit = document.elementFromPoint(clientX, clientY)?.closest("[data-shape]");
    if (!hit || !mapRef.current?.contains(hit)) return null;
    const i = Number(hit.getAttribute("data-shape"));
    return Number.isInteger(i) ? i : null;
  };

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const view0 = { k: zk.get(), x: zx.get(), y: zy.get() };
    if (pointers.current.size === 2 && zoomable) {
      // Fingers take over from any zoom still gliding.
      viewAnimRef.current.forEach((a) => a.stop());
      viewAnimRef.current = [];
      const [a, b] = [...pointers.current.values()];
      if (a && b) {
        const p = toFrame((a.x + b.x) / 2, (a.y + b.y) / 2);
        gesture.current = {
          startX: 0,
          startY: 0,
          moved: true,
          view: view0,
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          mid: [p?.vx ?? 0, p?.vy ?? 0],
        };
        setPointer(null);
        setActive(null);
      }
    } else if (pointers.current.size === 1) {
      gesture.current = {
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        view: view0,
        dist: 0,
        mid: [0, 0],
      };
      // Capture only when a drag can pan; otherwise the browser keeps its own scrolling.
      if (view0.k > 1 && zoomable)
        if (typeof event.currentTarget.setPointerCapture === "function")
          event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (pointers.current.has(event.pointerId))
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = svgRef.current?.getBoundingClientRect();
    const toView = rect && rect.width > 0 ? WORLD_FRAME_WIDTH / rect.width : unit;

    // Pinch: zoom by the change in finger distance, around the starting midpoint, and pan with it.
    if (g && pointers.current.size === 2 && zoomable) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b || g.dist === 0) return;
      const factor = Math.hypot(a.x - b.x, a.y - b.y) / g.dist;
      const mid = toFrame((a.x + b.x) / 2, (a.y + b.y) / 2);
      if (!mid) return;
      const nk = clamp(g.view.k * factor, 1, maxZoom);
      const px = (g.mid[0] - g.view.x) / g.view.k;
      const py = (g.mid[1] - g.view.y) / g.view.k;
      const v = clampView({ k: nk, x: mid.vx - px * nk, y: mid.vy - py * nk });
      zk.set(v.k);
      zx.set(v.x);
      zy.set(v.y);
      return;
    }

    // Drag to pan (only when zoomed in).
    if (g && pointers.current.size === 1 && (event.buttons & 1 || event.pointerType === "touch")) {
      const dx = event.clientX - g.startX;
      const dy = event.clientY - g.startY;
      if (!g.moved && Math.hypot(dx, dy) > 4 && g.view.k > 1 && zoomable) {
        g.moved = true;
        // The drag takes over from any zoom still gliding, from where it is now.
        if (viewAnimRef.current.length) {
          viewAnimRef.current.forEach((a) => a.stop());
          viewAnimRef.current = [];
          g.view = { k: zk.get(), x: zx.get(), y: zy.get() };
          g.startX = event.clientX;
          g.startY = event.clientY;
        }
        setMoving(true);
        setPointer(null);
      }
      if (g.moved) {
        const v = clampView({ k: g.view.k, x: g.view.x + dx * toView, y: g.view.y + dy * toView });
        zx.set(v.x);
        zy.set(v.y);
        return;
      }
    }

    if (event.pointerType === "mouse" && !g?.moved) {
      const i = hitTest(event.clientX, event.clientY);
      fromPointer();
      setActive(i);
      const p = toFrame(event.clientX, event.clientY);
      setPointer(i === null || !p ? null : { x: p.px, y: p.py });
    }
  }

  function endGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) {
      // One finger left after a pinch: carry on as a pan from here.
      const rest = [...pointers.current.values()][0];
      if (rest)
        gesture.current = {
          startX: rest.x,
          startY: rest.y,
          moved: true,
          view: { k: zk.get(), x: zx.get(), y: zy.get() },
          dist: 0,
          mid: [0, 0],
        };
      return;
    }
    gesture.current = null;
    if (g?.moved) {
      const v = { k: zk.get(), x: zx.get(), y: zy.get() };
      targetRef.current = v;
      setViewState(v);
      setMoving(false);
      return;
    }
    if (event.type !== "pointerup") return;
    // A tap or click: pin the tooltip on what's under it (or clear it on the ocean).
    const i = hitTest(event.clientX, event.clientY);
    const p = toFrame(event.clientX, event.clientY);
    fromPointer();
    setActive(i);
    setPointer(i === null || !p ? null : { x: p.px, y: p.py });
    if (i !== null) select(i);
    // Double tap zooms in (touch), like double-click does with a mouse.
    if (event.pointerType === "touch" && zoomable && p) {
      const now = performance.now();
      const last = lastTap.current;
      if (last && now - last.t < 320 && Math.hypot(last.x - event.clientX, last.y - event.clientY) < 24) {
        zoomAt(2, p.vx, p.vy);
        lastTap.current = null;
      } else lastTap.current = { t: now, x: event.clientX, y: event.clientY };
    }
  }

  // ⌘/Ctrl + wheel (and trackpad pinch, which arrives as ctrl + wheel) zooms; a plain wheel scrolls
  // the page and flashes a hint. Native listener: React's wheel listener is passive.
  const [wheelHint, setWheelHint] = useState(false);
  const hintTimer = useRef(0);
  const onWheel = useEffectEvent((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const p = toFrame(e.clientX, e.clientY);
      if (!p) return;
      const factor = Math.exp(-clamp(e.deltaY, -60, 60) * (e.deltaMode === 1 ? 0.05 : 0.0035));
      zoomAt(factor, p.vx, p.vy, false);
      setWheelHint(false);
      return;
    }
    if (Math.abs(e.deltaY) < 4) return;
    setWheelHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWheelHint(false), 1400);
  });
  useEffect(() => {
    const el = mapRef.current;
    if (!el || !zoomable || !ready) return;
    const listener = (e: WheelEvent) => onWheel(e);
    el.addEventListener("wheel", listener, { passive: false });
    return () => {
      el.removeEventListener("wheel", listener);
      window.clearTimeout(hintTimer.current);
    };
  }, [zoomable, ready, mapRef]);
  return { gesture, lastPointerType, toFrame, onPointerDown, onPointerMove, endGesture, wheelHint };
}

/** What the map's keyboard handling reads and changes. @internal */
export type WorldMapKeyboardInput = {
  view: MapViewState;
  items: Item[];
  ranked: number[];
  act: number | null;
  activeItem: Item | null;
  zoomable: boolean;
  locale: string;
  fromKeyboard: () => void;
  setActive: (i: number | null) => void;
  select: (i: number) => void;
  onSelect: unknown;
};

/**
 * The map's keyboard handling: arrows move to the neighbouring place, Page Up / Down step by rank, Home /
 * End jump, typing a name jumps to it, + - 0 zoom, Enter selects, Escape clears. Also the zoom buttons'
 * handler, which zooms around the place being read.
 * @internal
 */
export function useWorldMapKeyboard(o: WorldMapKeyboardInput) {
  const { items, ranked, act, activeItem, zoomable, locale, fromKeyboard, setActive, select, onSelect } = o;
  const { zk, zx, zy, setPointer, zoomAt, resetView, revealPoint } = o.view;
  const typeahead = useRef({ text: "", at: 0 });

  function move(next: number | null) {
    fromKeyboard();
    setPointer(null);
    setActive(next);
    const it = next === null ? null : items[next];
    if (it) revealPoint(it.x, it.y);
  }

  function neighbour(from: number, dir: "left" | "right" | "up" | "down"): number | null {
    const o = items[from];
    if (!o) return null;
    let best: number | null = null;
    let bestScore = Infinity;
    const horizontal = dir === "left" || dir === "right";
    for (let i = 0; i < items.length; i++) {
      const it = itemAt(items, i);
      if (i === from) continue;
      const dx = it.x - o.x;
      const dy = it.y - o.y;
      const along = dir === "right" ? dx : dir === "left" ? -dx : dir === "down" ? dy : -dy;
      const across = horizontal ? Math.abs(dy) : Math.abs(dx);
      if (along <= 1) continue;
      // Nearest along the arrow, strongly preferring places within a 60° cone of it.
      const score = along + across * 2.2 + (across > along * 1.7 ? WORLD_FRAME_WIDTH : 0);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return;
    const first = ranked[0] ?? 0;
    const cur = act;
    const key = event.key;
    let handled = true;
    switch (key) {
      case "ArrowRight":
      case "ArrowLeft":
      case "ArrowUp":
      case "ArrowDown": {
        const dir = key === "ArrowRight" ? "right" : key === "ArrowLeft" ? "left" : key === "ArrowUp" ? "up" : "down";
        move(cur === null ? first : (neighbour(cur, dir) ?? cur));
        break;
      }
      case "PageDown":
      case "PageUp": {
        if (!ranked.length) break;
        const r = cur === null ? -1 : ranked.indexOf(cur);
        const next = key === "PageDown" ? (r < 0 ? 0 : Math.min(ranked.length - 1, r + 1)) : r <= 0 ? 0 : r - 1;
        move(ranked[next] ?? first);
        break;
      }
      case "Home":
        move(ranked[0] ?? 0);
        break;
      case "End":
        move(ranked[ranked.length - 1] ?? items.length - 1);
        break;
      case "Enter":
      case " ":
        if (cur === null || !onSelect) return;
        select(cur);
        break;
      case "+":
      case "=":
      case "-":
      case "_": {
        if (!zoomable) return;
        // Zoom around the active place, else the middle of the view.
        const at = activeItem ? viewPoint(activeItem) : undefined;
        zoomAt(key === "+" || key === "=" ? 2 : 0.5, at?.[0], at?.[1]);
        break;
      }
      case "0":
        if (!zoomable) return;
        resetView();
        break;
      case "Escape":
        if (cur === null) {
          if (zk.get() > 1) resetView();
          else handled = false;
        } else move(null);
        break;
      default:
        handled = false;
    }
    if (!handled && key.length === 1 && /\p{L}/u.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type-ahead: jump to the next place whose name starts with what was typed.
      const now = event.timeStamp; // the same clock as performance.now(), stamped when the key arrived
      const ta = typeahead.current;
      ta.text = now - ta.at < 800 ? ta.text + key.toLowerCase() : key.toLowerCase();
      ta.at = now;
      const startAt = cur === null ? 0 : ta.text.length === 1 ? cur + 1 : cur;
      for (let n = 0; n < items.length; n++) {
        const i = (startAt + n) % items.length;
        if (items[i]?.name.toLocaleLowerCase(locale).startsWith(ta.text)) {
          move(i);
          break;
        }
      }
      handled = true;
    }
    if (handled) event.preventDefault();
  }

  /** An item's position in viewBox units (after the zoom transform). */
  const viewPoint = (it: Item): [number, number] => [it.x * zk.get() + zx.get(), it.y * zk.get() + zy.get()];

  /** The zoom buttons zoom around the place being read (a tapped country stays put), else the middle. */
  const zoomButton = (factor: number) => {
    const at = activeItem ? viewPoint(activeItem) : undefined;
    zoomAt(factor, at?.[0], at?.[1]);
  };
  return { onKeyDown, zoomButton };
}
