"use client";

import { useContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useInView } from "motion/react";

import { cn } from "../../lib/cn";
import { ChartTooltip, LegendKey, type TooltipRow } from "./chart-parts";
import { TableLabelContext } from "./chart-parts/empty-table";
import { chartFocusClass, clamp } from "./chart-utils";

/**
 * The tooltip and the value table that every chart shares. They live here, away from the heatmap, so a chart that only
 * needs a tooltip does not install the whole heatmap with it. `heatmap.tsx` re-exports them.
 */

/**
 * Plays a chart's entrance once, when it first scrolls into view (instantly with reduced motion).
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useEntrance } from "./chart-tip";
 *
 * export function Example({ reducedMotion }: { reducedMotion: boolean }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const play = useEntrance(ref, reducedMotion);
 *   return <div ref={ref}>{play ? "in view" : "waiting"}</div>;
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function useEntrance(ref: RefObject<Element | null>, reduced: boolean) {
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return reduced || inView;
}

/** The mark a tooltip points at: its box (x, y, w, h) in px relative to the chart. */
export type ChartTipAnchor = { x: number; y: number; w: number; h: number };

/** A side of the anchor where a tooltip can sit: `right`, `left`, `below` or `above`. */
export type ChartTipSide = "right" | "left" | "below" | "above";

/**
 * Where a tooltip of `size` goes next to the `anchor` mark inside `bounds` (all in px, relative to
 * the chart box): the first side in `order` where it fits without covering the mark, kept inside
 * the box; centred over the mark only when no side has room. `minLeft` keeps a left-side tooltip
 * clear of a label column.
 */
export function placeChartTip(
  anchor: ChartTipAnchor,
  size: { w: number; h: number },
  bounds: { w: number; h: number },
  {
    gap = 10,
    order = ["right", "left", "below", "above"],
    minLeft = 0,
  }: { gap?: number; order?: readonly ChartTipSide[]; minLeft?: number } = {},
) {
  const M = 4;
  const maxX = bounds.w - size.w - M;
  const maxY = bounds.h - size.h - M;
  const cx = clamp(anchor.x + anchor.w / 2 - size.w / 2, M, Math.max(M, maxX));
  const cy = clamp(anchor.y + anchor.h / 2 - size.h / 2, M, Math.max(M, maxY));
  for (const side of order) {
    if (side === "right") {
      const x = anchor.x + anchor.w + gap;
      if (x <= maxX) return { x, y: cy, side };
    } else if (side === "left") {
      const x = anchor.x - gap - size.w;
      if (x >= Math.max(M, minLeft)) return { x, y: cy, side };
    } else if (side === "below") {
      const y = anchor.y + anchor.h + gap;
      if (y <= maxY) return { x: cx, y, side };
    } else {
      const y = anchor.y - gap - size.h;
      if (y >= M) return { x: cx, y, side };
    }
  }
  return { x: cx, y: cy, side: "over" as const };
}

/**
 * Props of ChartTip: title, rows, the anchor mark, the chart bounds, and optional side order and left
 * limit.
 */
export type ChartTipProps = {
  /** Sets the heading line of the tooltip. */
  title: string;
  /** One line per series: a swatch, a label and the formatted value. */
  rows: TooltipRow[];
  /** The mark being read, in px relative to the chart box. */
  anchor: ChartTipAnchor;
  /** Size of the chart box the tooltip must stay inside. */
  bounds: { w: number; h: number };
  /** The one-line readout pinned to the top of a narrow chart instead (see ChartTooltip). */
  docked?: boolean;
  /** Sides to try, in order, when placing the tooltip next to the anchor: "right", "left", "below" or "above". */
  order?: readonly ChartTipSide[];
  /** The tooltip never starts further left than this many px, so it does not cover the axis. */
  minLeft?: number;
};

/**
 * The glass tooltip of these charts. It measures itself and sits beside the mark it describes
 * (never on top of it), inside the chart box, so it can't be clipped by the card or run off the
 * edge; its rows never wrap. Visual only: the chart announces the same values (ChartAnnouncer).
 *
 * @example
 * ```tsx
 * import { ChartTip } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartTip
 *       title="Mon"
 *       rows={[{ label: "Visits", value: "1,284", color: "var(--sheen-chart-1)" }]}
 *       anchor={{ x: 40, y: 20, w: 24, h: 24 }}
 *       bounds={{ w: 320, h: 200 }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function ChartTip({ title, rows, anchor, bounds, docked = false, order, minLeft }: ChartTipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // The tooltip measures itself through a ResizeObserver: its callback runs after layout, in the
  // frame's own rendering step, so no render forces a synchronous layout (the old layout effect
  // read offsetWidth / offsetHeight after every pointer move). The tooltip stays hidden until the
  // first size arrives, which is the same frame.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [docked]);

  if (docked) return <ChartTooltip title={title} rows={rows} x={0} y={0} containerWidth={bounds.w} docked />;

  const { x, y } = placeChartTip(anchor, size, bounds, { order, minLeft });
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="chart-tooltip"
      className="glass-3 pointer-events-none absolute top-0 left-0 z-10 w-max max-w-[min(18rem,calc(100%-8px))] min-w-28 rounded-sheen-md px-3 py-2.5 text-xs text-sheen-fg"
      style={{ left: Math.round(x), top: Math.round(y), visibility: size.w === 0 ? "hidden" : undefined }}
    >
      <p className="mb-1.5 font-medium text-sheen-fg-muted">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-2 whitespace-nowrap">
            {row.color === "transparent" ? (
              <span aria-hidden className="w-3.5 shrink-0" />
            ) : (
              <LegendKey color={row.color} kind={row.kind ?? "line"} />
            )}
            <span className="font-semibold text-sheen-fg tabular-nums">{row.value}</span>
            {row.label && <span className="text-sheen-fg-muted">{row.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A column of ChartValueTable: its header and whether its cells align to the start or end. */
export type ChartValueTableColumn = {
  label: ReactNode;
  /** Numbers align to the end. Default "end" for every column but the first. */
  align?: "start" | "end";
};

/** Props of ChartValueTable: columns, rows of cells, a hidden caption and the empty state. */
export type ChartValueTableProps = {
  /** The column headers; the first column holds the row headers. Numbers align to the end unless a column says otherwise. */
  columns: ChartValueTableColumn[];
  /** One array of cells per row; the first cell is the row header. */
  rows: ReactNode[][];
  /** Visually hidden caption naming the table (also names its scroll region). */
  caption?: string;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
  className?: string;
};

/**
 * A plain table in the ChartTable style for charts whose data isn't one row per category.
 * Wide tables scroll inside their own focusable region (keyboard-scrollable), never the page.
 *
 * @example
 * ```tsx
 * import { ChartValueTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartValueTable
 *       caption="Sales by region"
 *       columns={[{ label: "Region" }, { label: "Sales" }]}
 *       rows={[["North", "1,204"], ["South", "980"]]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function ChartValueTable({ columns, rows, caption, emptyState = "No data", className }: ChartValueTableProps) {
  // In a ChartCard's screen-reader twin (visually hidden) it is a static named block, not a scroller or a tab stop.
  const twinLabel = useContext(TableLabelContext);
  return (
    <div
      // A named group, not a region landmark: it would repeat the name of the chart card around it (see TableScroll).
      role="group"
      aria-label={twinLabel ?? caption}
      data-slot="chart-value-table"
      // A scrollable table that can overflow must be keyboard-focusable (WCAG 2.1.1 keyboard).
      tabIndex={twinLabel === null ? 0 : undefined}
      className={
        twinLabel === null
          ? cn("overflow-x-auto rounded-sheen-sm [scrollbar-width:thin]", chartFocusClass, className)
          : undefined
      }
    >
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  "py-2 pe-4 font-medium whitespace-nowrap last:pe-0",
                  (col.align ?? (i === 0 ? "start" : "end")) === "end" && "text-end",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(1, columns.length)} className="py-6 text-center text-sheen-fg-muted">
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((cells, ri) => (
              <tr key={ri} className="border-b border-sheen-border last:border-0">
                {cells.map((cell, ci) => {
                  const end = (columns[ci]?.align ?? (ci === 0 ? "start" : "end")) === "end";
                  return ci === 0 ? (
                    <th key={ci} scope="row" className="py-2 pe-4 font-normal whitespace-nowrap text-sheen-fg-muted">
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={ci}
                      className={cn("py-2 pe-4 whitespace-nowrap tabular-nums last:pe-0", end && "text-end")}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
