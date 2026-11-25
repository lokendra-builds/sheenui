"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useLatest } from "./use-latest";

/** Lists longer than this are windowed on their own (`virtualized="auto"`): Select, Combobox and CommandPalette. */
export const VIRTUALIZE_THRESHOLD = 200;

/** Whether a long list is windowed: `true` / `false` force it, `"auto"` (the default) windows lists over {@link VIRTUALIZE_THRESHOLD} rows. */
export function shouldVirtualize(virtualized: boolean | "auto" | undefined, count: number) {
  return virtualized === true || ((virtualized ?? "auto") === "auto" && count > VIRTUALIZE_THRESHOLD);
}

/** Options of {@link useVirtualWindow}. */
export type UseVirtualWindowOptions = {
  /**
   * How many rows the list has (headings included).
   */
  count: number;
  /**
   * Turn the window off: every row is reported as visible (the list renders fully).
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Row height in px before the first row has been measured. Rows must all be this tall (give them a fixed height and
   * mark each with `data-vrow`); the real height is read from the first one, so touch sizes need no extra work.
   *
   * @default 40
   */
  estimateSize?: number;
  /**
   * Rows rendered beyond each edge of the viewport, so a fast scroll or a held arrow key never shows a gap.
   *
   * @default 8
   */
  overscan?: number;
  /**
   * Viewport height in px used while the scroll element has no layout yet (server rendering, a closed popup).
   *
   * @default 320
   */
  fallbackViewport?: number;
};

/** What {@link useVirtualWindow} returns. */
export type VirtualWindow = {
  /** Pass to the scroll container's `ref`. */
  ref: (element: HTMLElement | null) => void;
  /** The scroll container once it is mounted (a popup's list mounts when it opens), `null` before. */
  element: HTMLElement | null;
  /** First row to render (inclusive). */
  start: number;
  /** End of the rendered rows (exclusive). */
  end: number;
  /** Height of one row in px (measured). */
  size: number;
  /** Height of the whole list in px: spacers keep the scroll bar and the layout exactly as if every row existed. */
  totalSize: number;
  /** Space above the rendered rows, in px. */
  padStart: number;
  /** Space below the rendered rows, in px. */
  padEnd: number;
  /** Scrolls the row into view (`"nearest"` by default) and renders it in the same frame. */
  scrollToIndex: (index: number, align?: "nearest" | "start" | "center") => void;
};

/**
 * A small windowing hook for long lists of equally tall rows: it reports which rows are near the viewport so a list
 * of thousands renders only a few dozen elements. Select, Combobox and CommandPalette use it for `virtualized` lists.
 * Attach `ref` to the scrolling element, render rows `start` to `end` between two spacers of `padStart` and
 * `padEnd` px (or inside a box `totalSize` tall) and give each row a fixed height and a `data-vrow` attribute.
 *
 * Keyboard: none of its own; call `scrollToIndex` when your own keyboard handling moves the active row, and put
 * `aria-setsize` / `aria-posinset` on the rows so screen readers still hear "3 of 5000".
 * Accessibility: windowed rows are removed from the DOM, so the active row must be scrolled into view (and so
 * rendered) before something points at it with `aria-activedescendant`.
 *
 * @example
 * ```tsx
 * import { useVirtualWindow } from "@sheenui/theme";
 *
 * const rows = Array.from({ length: 5000 }, (_, i) => `Row ${i + 1}`);
 *
 * export function LongList() {
 *   const win = useVirtualWindow({ count: rows.length, estimateSize: 32 });
 *   return (
 *     <div ref={win.ref} className="h-64 overflow-y-auto">
 *       <div style={{ paddingTop: win.padStart, paddingBottom: win.padEnd }}>
 *         {rows.slice(win.start, win.end).map((row) => (
 *           <div key={row} data-vrow="" style={{ height: win.size }}>
 *             {row}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /components/select
 */
export function useVirtualWindow({
  count,
  enabled = true,
  estimateSize = 40,
  overscan = 8,
  fallbackViewport = 320,
}: UseVirtualWindowOptions): VirtualWindow {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(fallbackViewport);
  const [size, setSize] = useState(estimateSize);
  const elementRef = useRef<HTMLElement | null>(null);
  const sizeRef = useLatest(size);

  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element || !enabled) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrollTop(element.scrollTop);
      setViewport(element.clientHeight || fallbackViewport);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    element.addEventListener("scroll", schedule, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(element);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      element.removeEventListener("scroll", schedule);
      observer?.disconnect();
    };
  }, [element, enabled, fallbackViewport]);

  // The real row height (touch sizes, density) is read from the first rendered row.
  useLayoutEffect(() => {
    if (!element || !enabled) return;
    const row = element.querySelector<HTMLElement>("[data-vrow]");
    // Layout height, not the painted one: a popup that is scaling in would read 4% short.
    const height = row?.offsetHeight ?? 0;
    if (height > 0 && Math.abs(height - sizeRef.current) > 0.5) setSize(height);
  }, [element, enabled, count, sizeRef]);

  const total = Math.max(0, count);
  const rowSize = Math.max(1, size);
  let start = 0;
  let end = total;
  if (enabled) {
    start = Math.max(0, Math.floor(scrollTop / rowSize) - overscan);
    end = Math.min(total, Math.ceil((scrollTop + viewport) / rowSize) + overscan);
    if (end < start) end = start;
  }

  const scrollToIndex = useCallback(
    (index: number, align: "nearest" | "start" | "center" = "nearest") => {
      const node = elementRef.current;
      if (!node) return;
      const rowHeight = Math.max(1, sizeRef.current);
      const view = node.clientHeight || fallbackViewport;
      const top = index * rowHeight;
      const bottom = top + rowHeight;
      let next = node.scrollTop;
      if (align === "start") next = top;
      else if (align === "center") next = top - (view - rowHeight) / 2;
      else if (top < next) next = top;
      else if (bottom > next + view) next = bottom - view;
      next = Math.max(0, next);
      if (next !== node.scrollTop) node.scrollTop = next;
      setScrollTop(next);
      setViewport(view);
    },
    [fallbackViewport, sizeRef],
  );

  return {
    ref,
    element,
    start,
    end,
    size: rowSize,
    totalSize: total * rowSize,
    padStart: start * rowSize,
    padEnd: Math.max(0, total - end) * rowSize,
    scrollToIndex,
  };
}
