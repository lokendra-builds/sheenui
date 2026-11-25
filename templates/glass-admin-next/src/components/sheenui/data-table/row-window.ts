"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Rows rendered above and below the visible ones, so a fast scroll never shows blank space. */
const OVERSCAN = 8;
/** Page length from which a table with a bounded height renders only the rows in view (`virtualize` "auto"). */
export const VIRTUALIZE_FROM = 50;

/** The slice of rows to render and the space the rest of them take up. */
export type RowWindow = {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
};

/**
 * Measured heights: `base` is the height every row not measured yet is assumed to have, `rows` and `details` are by
 * row id. `base` is set once, from the first plain row that renders, and never again: moving it on every later
 * measurement re-priced all the unmeasured rows and the scroll height drifted by thousands of pixels.
 */
type Sizes = { base: number; locked: boolean; rows: Map<string, number>; details: Map<string, number> };

/** What a rendered row reports about its size (`row` is the row itself, `detail` its expanded panel). */
export type ReportRowSize = (rowId: string, part: "row" | "detail", height: number) => void;

/**
 * Row windowing for a table whose scroll area has a bounded height: only the rows in view (plus a few more) are
 * rendered, and two spacer rows stand in for the others. Rows are measured as they render (an expanded panel
 * counts toward its row), and rows not seen yet take one stable estimate (the first row measured). When a row
 * above the viewport turns out taller or shorter than assumed, the scroll position moves by the difference, so
 * what you are looking at stays where it is. Scroll position is read from
 * the scroll area, never from `window`.
 *
 * Accessibility: Rows outside the window are not in the DOM, so Tab and find-in-page skip them; the table sets `aria-rowcount` and each row `aria-rowindex`.
 *
 * @internal DataTable's own windowing hook.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useRowWindow } from "./row-window";
 *
 * export function Rows({ ids }: { ids: string[] }) {
 *   const scroller = useRef<HTMLDivElement>(null);
 *   const { window } = useRowWindow(scroller, ids, true, 52);
 *   return <div ref={scroller}>{window ? `${window.start} to ${window.end}` : "all rows"}</div>;
 * }
 * ```
 *
 * @param scrollRef - The scroll area.
 * @param ids - Ids of the rows on the page, in order.
 * @param enabled - Window the rows (otherwise `null`: render them all).
 * @param estimate - Row height in px used until a row has been measured.
 * @returns The window (`null` when every row renders) and the callback rendered rows report their size to.
 * @see /components/data-table
 */
export function useRowWindow(
  scrollRef: RefObject<HTMLElement | null>,
  ids: readonly string[],
  enabled: boolean,
  estimate: number,
): { window: RowWindow | null; report: ReportRowSize } {
  const [range, setRange] = useState({ top: 0, height: 0 });
  const [sizes, setSizes] = useState<Sizes>({ base: estimate, locked: false, rows: new Map(), details: new Map() });
  const sizesRef = useRef(sizes);
  // Height change of the rows above the first visible one, applied to scrollTop after the render that uses it.
  const anchorDelta = useRef(0);
  const idsRef = useRef(ids);
  useLayoutEffect(() => {
    idsRef.current = ids;
  }, [ids]);
  // Sizes reported since the last frame; applied together, so a batch of rows re-renders the table once.
  const buffer = useRef<[string, "row" | "detail", number][]>([]);
  const frame = useRef(0);
  const pending = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    const read = () => {
      frame.current = 0;
      setRange((prev) =>
        prev.top === el.scrollTop && prev.height === el.clientHeight
          ? prev
          : { top: el.scrollTop, height: el.clientHeight },
      );
    };
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(read);
    };
    read();
    el.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", schedule);
      observer.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [scrollRef, enabled]);

  const report = useCallback<ReportRowSize>(
    (rowId, part, height) => {
      buffer.current.push([rowId, part, height]);
      if (pending.current) return;
      pending.current = requestAnimationFrame(() => {
        pending.current = 0;
        const batch = buffer.current;
        buffer.current = [];
        const prev = sizesRef.current;
        const rows = new Map(prev.rows);
        const details = new Map(prev.details);
        let { base, locked } = prev;
        let changed = false;
        let delta = 0;
        // Index of the first row in view, under the sizes as they were before this batch.
        const top = scrollRef.current?.scrollTop ?? 0;
        let firstIndex = 0;
        for (let offset = 0; firstIndex < idsRef.current.length - 1; firstIndex += 1) {
          const id = idsRef.current[firstIndex] ?? "";
          offset += (prev.rows.get(id) ?? prev.base) + (prev.details.get(id) ?? 0);
          if (offset > top) break;
        }
        for (const [id, kind, h] of batch) {
          const map = kind === "row" ? rows : details;
          const before = map.get(id);
          if (before !== undefined && Math.abs(before - h) < 0.5) continue;
          if (kind === "row" && h > 0 && !locked && !details.get(id)) {
            base = h;
            locked = true;
          }
          map.set(id, h);
          changed = true;
          // Rows above the visible one: remember how much their height moved.
          const index = idsRef.current.indexOf(id);
          if (index >= 0 && index < firstIndex) delta += h - (before ?? (kind === "row" ? prev.base : 0));
        }
        if (!changed) return;
        anchorDelta.current += delta;
        sizesRef.current = { base, locked, rows, details };
        setSizes(sizesRef.current);
      });
    },
    [scrollRef],
  );

  // The rows above the viewport changed height: keep the first visible row where it was.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const delta = anchorDelta.current;
    if (!el || !delta) return;
    anchorDelta.current = 0;
    el.scrollTop += delta;
  }, [sizes, scrollRef]);

  if (!enabled || ids.length === 0) return { window: null, report };
  const { base, rows, details } = sizes;
  const idAt = (i: number) => ids[i] ?? "";
  const heightOf = (id: string) => (rows.get(id) ?? base) + (details.get(id) ?? 0);
  const bottom = range.top + (range.height || base * 12);
  let offset = 0;
  let first = 0;
  while (first < ids.length - 1 && offset + heightOf(idAt(first)) <= range.top) {
    offset += heightOf(idAt(first));
    first += 1;
  }
  let last = first;
  let reach = offset;
  while (last < ids.length && reach < bottom) {
    reach += heightOf(idAt(last));
    last += 1;
  }
  const start = Math.max(0, first - OVERSCAN);
  const end = Math.min(ids.length, last + OVERSCAN);
  let padTop = 0;
  let padBottom = 0;
  for (let i = 0; i < start; i += 1) padTop += heightOf(idAt(i));
  for (let i = end; i < ids.length; i += 1) padBottom += heightOf(idAt(i));
  return { window: { start, end, padTop, padBottom }, report };
}
