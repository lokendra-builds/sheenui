"use client";

import { memo, useEffect, useRef, useState, type ReactNode, type RefObject, useLayoutEffect } from "react";

import { cn } from "../../../lib/cn";
import { duration, ease } from "../../../motion/tokens";
import { LegendKey } from "../chart-parts";
import { TOOLTIP_DOCK_SPACE, type ChartColor, type ChartInstructions, itemAt } from "../chart-utils";
import { ChartTip, type ChartTipAnchor } from "../heatmap";

/* ======================================================================
 * Types
 * ====================================================================== */

/**
 * One cohort of a CohortChart: its name, how many users it started with and the share or count still
 * active in each period.
 */
export type CohortRow = {
  /** Name of the cohort, e.g. "Jan 2026" or "Week of 3 Mar". */
  cohort: string;
  /** How many users started in this cohort. */
  size: number;
  /**
   * Users still active in each period, period 0 first (counts, or ratios with valuesAre="ratios").
   * null for periods the cohort hasn't reached yet: they stay blank, never 0%.
   */
  values: readonly (number | null)[];
};

/** A cell, as passed to `onCellClick`. `cohort` is null for the average row. */
export type CohortCell = {
  cohort: string | null;
  period: number;
  ratio: number | null;
  count: number | null;
  size: number;
};

/** How a CohortChart shows its cells: as `percent` of the cohort or as `count` of users. */
export type CohortView = "percent" | "count";

/**
 * Every string CohortChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type CohortChartLabels = {
  /** Column header for period `i`, e.g. "Week 3". */
  period: (i: number) => string;
  /** Header of the cohort column. */
  cohort: string;
  /** Second line under each cohort's name: its size. */
  size: (formattedSize: string) => string;
  /** Name of the weighted-average row, and its second line. */
  average: string;
  averageNote: string;
  /** Options of the view switch, and its accessible name. */
  percent: string;
  count: string;
  viewLabel: string;
  /** Legend caption. */
  retention: string;
  /** Read for a period a cohort hasn't reached yet. */
  notYet: string;
  /** "529 of 1,284 users". */
  retained: (count: string, size: string) => string;
  /** "3.2 pts above average" (`delta` is the formatted size of the gap, without a sign). */
  vsAverage: (delta: string, direction: "above" | "below" | "same") => string;
  /** Appended to the grid's accessible name. */
  instructions: ChartInstructions;
  /** Shown in the readout band of a narrow touch chart while nothing is being read. */
  hint: string;
};

/**
 * The built-in English strings of CohortChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultCohortChartLabels: CohortChartLabels = {
  period: (i) => `Week ${i}`,
  cohort: "Cohort",
  size: (n) => `${n} users`,
  average: "Average",
  averageNote: "All cohorts, weighted",
  percent: "%",
  count: "Users",
  viewLabel: "Show retention as",
  retention: "Retention",
  notYet: "Not yet reached",
  retained: (count, size) => `${count} of ${size} users`,
  vsAverage: (delta, direction) => (direction === "same" ? "Same as average" : `${delta} pts ${direction} average`),
  instructions:
    "Use the arrow keys to move between cells; Home and End jump along a row, Ctrl+Home and Ctrl+End to the corners.",
  hint: "Tap a cell for details",
};

/**
 * Props of CohortChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type CohortChartProps = {
  /** Takes one row per cohort, oldest first. */
  data: readonly CohortRow[];
  /** How `values` are given: user counts (default) or retention ratios 0–1. */
  valuesAre?: "counts" | "ratios";
  /** Sets the number of period columns. Default: the longest row. */
  periods?: number;
  /** Show retention as percentages or user counts (controlled). */
  view?: CohortView;
  /** Sets the starting view when uncontrolled. Default "percent". */
  defaultView?: CohortView;
  /** Called when the person switches between the percent and count views. */
  onViewChange?: (view: CohortView) => void;
  /** Show the % / users switch. Default true. */
  viewToggle?: boolean;
  /** Add a weighted-average row on top. Default true. */
  average?: boolean;
  /** Hue of the sequential scale: a palette slot 1–8. Default 1. */
  color?: ChartColor;
  /** Retention range of the colour scale (0–1). Default: the lowest to the highest retention after period 0. */
  domain?: [number, number];
  /** Classes on the colour scale (e.g. 5); 0 = continuous. */
  steps?: number;
  /** Tallest the table gets before it scrolls inside (its header row stays put). */
  maxHeight?: number;
  /** Formats a cohort count for the cell labels, tooltips and data table: takes the number, returns the text shown. Default: compact numbers in `locale`. */
  format?: (n: number) => string;
  /**
   * Formats ratios: percentages with one decimal in `locale` ("41.2%"; period 0 reads "100%").
   *
   * @default percentages, one decimal
   */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default formats. Default "en". */
  locale?: string;
  /** Show the colour key. Default true. */
  legend?: boolean;
  /** Called with a cell on click, Enter or Space. */
  onCellClick?: (cell: CohortCell) => void;
  /** Shown when there is nothing to show. */
  emptyState?: ReactNode;
  /** Overrides for the chart's built-in English strings. */
  labels?: Partial<CohortChartLabels>;
  /** Accessible name of the chart; describe what it shows. */
  "aria-label": string;
  className?: string;
};

/* ======================================================================
 * Model
 * ====================================================================== */

/** One cohort cell: retention ratio and count, or null when absent. @internal */
export type Cell = { ratio: number | null; count: number | null };
/** The cohort rows, each with its cells, and the period count. @internal */
export type Model = { rows: { name: string; size: number; cells: Cell[]; average: boolean }[]; periods: number };

/** Returns a value only when it is a finite number, otherwise null. @internal */
export function finite(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** A cache of percent formatters by locale. @internal */
export const cohortPercents = new Map<string, (ratio: number) => string>();

/**
 * Retention as a percentage with one fixed decimal ("18.0%", never "18%" beside "18.5%"), so a
 * column of them lines up; exactly 100% (period 0) stays "100%".
 *
 * @see /charts/cohort-retention
 */
export function cohortPercent(locale = "en") {
  let fn = cohortPercents.get(locale);
  if (!fn) {
    const make = (digits: number) => {
      const o: Intl.NumberFormatOptions = {
        style: "percent",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      };
      try {
        return new Intl.NumberFormat(locale, o);
      } catch {
        return new Intl.NumberFormat("en", o);
      }
    };
    const one = make(1);
    const whole = make(0);
    fn = (ratio) => (Math.abs(ratio - 1) < 5e-5 ? whole.format(1) : one.format(ratio));
    cohortPercents.set(locale, fn);
  }
  return fn;
}

/** Ratios and counts for every cohort, plus the weighted average of each period.
 *
 * @see /charts/cohort-retention
 */
export function cohortModel(
  data: readonly CohortRow[],
  valuesAre: "counts" | "ratios" = "counts",
  periods?: number,
  withAverage = true,
): Model {
  const n = Math.max(0, periods ?? data.reduce((m, row) => Math.max(m, row.values.length), 0));
  const rows = data.map((row) => {
    const size = Math.max(0, finite(row.size) ?? 0);
    const cells: Cell[] = Array.from({ length: n }, (_, p) => {
      const v = finite(row.values[p]);
      if (v === null) return { ratio: null, count: null };
      if (valuesAre === "ratios") return { ratio: v, count: Math.round(v * size) };
      return { ratio: size > 0 ? v / size : null, count: v };
    });
    return { name: row.cohort, size, cells, average: false };
  });
  if (!withAverage || rows.length < 2) return { rows, periods: n };
  // Weighted average: retained users over starting users, among the cohorts that reached the period.
  const avg: Cell[] = Array.from({ length: n }, (_, p) => {
    let kept = 0;
    let base = 0;
    for (const r of rows) {
      const c = r.cells[p];
      if (c?.count == null || r.size <= 0) continue;
      kept += c.count;
      base += r.size;
    }
    return base > 0 ? { ratio: kept / base, count: kept } : { ratio: null, count: null };
  });
  const total = rows.reduce((s, r) => s + r.size, 0);
  return { rows: [{ name: "", size: total, cells: avg, average: true }, ...rows], periods: n };
}

/** Height of the band a narrow touch chart reserves above the grid for the docked readout (two lines). */
export const DOCK_BAND = TOOLTIP_DOCK_SPACE + 18;

/** Wraps text in a first-strong isolate, so numbers and dates never reorder inside right-to-left text. */
export const isolate = (text: string) => (text ? `⁨${text}⁩` : text);
/** An easing curve as a CSS `cubic-bezier` string. @internal */
export const cssEase = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;

/**
 * The reading on a narrow touch chart, pinned in the band above the grid: two fixed lines (the
 * cell and its retention, then the users and the comparison with the average), each truncated, so
 * it never spills over the cells. Every part is bidi-isolated, so figures keep their order on
 * right-to-left pages. Visual only: screen readers read the focused cell itself.
 */
export function DockedReadout({
  title,
  value,
  color,
  details,
}: {
  title: string;
  value: string;
  color: string | null;
  details: string[];
}) {
  return (
    <div
      aria-hidden
      data-slot="chart-readout"
      className="glass-3 pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 flex-col justify-center gap-0.5 rounded-sheen-md px-3 text-xs"
    >
      <p className="flex min-w-0 items-center gap-2">
        {color && <LegendKey color={color} />}
        <span dir="auto" className="min-w-0 truncate font-medium text-sheen-fg">
          {title}
        </span>
        <bdi className="ms-auto shrink-0 font-semibold text-sheen-fg tabular-nums">{value}</bdi>
      </p>
      <p dir="auto" className="truncate text-sheen-fg-muted">
        {details.map((part, i) => (
          <span key={i}>
            {i > 0 && " · "}
            <bdi>{part}</bdi>
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * First-view entrance of the cells: a diagonal wave (WAAPI on each fill, transform + opacity only).
 * The animations are created diagonal by diagonal, just before each one's turn, instead of all in
 * the first frame, so even a big grid never spends one long task setting the wave up. Until its
 * turn, a cell is held invisible by `data-entering` on the root.
 */
export function useCellsEntrance(ref: RefObject<HTMLElement | null>, play: boolean, reduced: boolean) {
  const done = useRef(false);
  const running = useRef<Animation[]>([]);
  const stop = useRef<() => void>(() => undefined);
  useLayoutEffect(() => {
    if (!play || done.current) return;
    const root = ref.current;
    if (!root) return;
    done.current = true;
    if (reduced || typeof root.animate !== "function") return;
    // Cells grouped by their delay (one group per diagonal), earliest first.
    const groups = new Map<number, HTMLElement[]>();
    for (const el of root.querySelectorAll<HTMLElement>("[data-delay]")) {
      const d = Number(el.dataset.delay ?? 0);
      const group = groups.get(d);
      if (group) group.push(el);
      else groups.set(d, [el]);
    }
    const queue = [...groups.entries()].sort((a, b) => a[0] - b[0]);
    if (!queue.length) return;
    root.toggleAttribute("data-entering", true);
    const easing = cssEase(ease.out);
    const t0 = performance.now();
    let next = 0;
    let raf = 0;
    const finish = () => {
      // Hand the cells back to their own (visible) style, then drop the held animations.
      root.toggleAttribute("data-entering", false);
      for (const a of running.current) a.cancel();
      running.current = [];
    };
    const tick = () => {
      const elapsed = (performance.now() - t0) / 1000;
      // Start every diagonal due within the next two frames.
      while (next < queue.length && itemAt(queue, next)[0] <= elapsed + 0.034) {
        const [delay, els] = itemAt(queue, next++);
        for (const el of els)
          running.current.push(
            el.animate(
              [
                { opacity: 0, transform: "scale(0.82)" },
                { opacity: 1, transform: "none" },
              ],
              {
                duration: duration.slow * 1000,
                delay: Math.max(0, delay - elapsed) * 1000,
                easing,
                fill: "both",
              },
            ),
          );
      }
      if (next < queue.length) raf = requestAnimationFrame(tick);
      else running.current.at(-1)?.finished.then(finish, () => undefined);
    };
    tick();
    stop.current = () => {
      cancelAnimationFrame(raf);
      finish();
    };
  }, [play, reduced, ref]);
  // Reduced motion switched on mid-way, or unmounting: everything shows at once.
  useEffect(() => {
    if (reduced) stop.current();
  }, [reduced]);
  useEffect(() => () => stop.current(), []);
}

/**
 * The glass tooltip beside a cell. It measures the cell after layout, and again (once per frame)
 * while the grid scrolls, so the chart never reads layout during render and never re-renders on
 * scroll: only this small component does.
 */
export function CellTip({
  rootRef,
  scrollRef,
  tableRef,
  r,
  c,
  layoutKey,
  title,
  rows,
}: {
  rootRef: RefObject<HTMLElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  tableRef: RefObject<HTMLElement | null>;
  r: number;
  c: number;
  /** Anything that moves the cells (the view, the width): measure again when it changes. */
  layoutKey: string;
  title: string;
  rows: { label: string; value: string; color: string; kind: "rect" }[];
}) {
  const [box, setBox] = useState<{ anchor: ChartTipAnchor; w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const cell = tableRef.current?.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${c}"]`);
      const rb = root.getBoundingClientRect();
      const b = cell?.getBoundingClientRect();
      setBox(
        b
          ? { anchor: { x: b.left - rb.left, y: b.top - rb.top, w: b.width, h: b.height }, w: rb.width, h: rb.height }
          : null,
      );
    };
    measure();
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller?.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [r, c, layoutKey, rootRef, scrollRef, tableRef]);
  if (!box) return null;
  return (
    <ChartTip
      title={title}
      rows={rows}
      anchor={box.anchor}
      bounds={{ w: box.w, h: box.h }}
      order={["below", "above", "right", "left"]}
    />
  );
}

/** The drawn state of one cell: fill, text and readability. @internal */
export type CellView = {
  fill: string | null;
  light: boolean;
  text: string;
  sr: string;
  delay: string | undefined;
  reached: boolean;
};
/** The drawn state of one cohort row. @internal */
export type RowView = { key: string; name: string; sub: string; average: boolean; cells: CellView[] };

/** One cohort's row. Memoised: reading a cell re-renders only its row (and the row it left). */
export const CohortRowView = memo(function CohortRowView({
  row,
  r,
  activeC,
  focusC,
  stickyBg,
  nameMax,
  clickable,
  onActivate,
  onFocusCell,
  onClickCell,
}: {
  row: RowView;
  r: number;
  /** The column being read in this row (-1: none). */
  activeC: number;
  /** The column holding the grid's tab stop in this row (-1: none). */
  focusC: number;
  stickyBg: string | undefined;
  nameMax: number | undefined;
  clickable: boolean;
  onActivate: (r: number, c: number, from: "pointer" | "keyboard") => void;
  onFocusCell: (r: number, c: number) => void;
  onClickCell: (r: number, c: number) => void;
}) {
  return (
    <tr className={cn(row.average && "[&>*]:pb-1.5")}>
      <th
        scope="row"
        className={cn(
          "sticky start-0 z-1 py-px ps-2 pe-3 text-start align-middle font-normal whitespace-nowrap",
          stickyBg,
        )}
      >
        <span
          dir="auto"
          style={nameMax === undefined ? undefined : { width: nameMax }}
          className={cn(
            "block leading-tight transition-colors duration-(--sheen-duration-fast)",
            nameMax !== undefined && "whitespace-normal [overflow-wrap:anywhere]",
            activeC >= 0 ? "font-semibold text-sheen-fg" : row.average ? "font-medium text-sheen-fg" : "text-sheen-fg",
          )}
        >
          {row.name}
        </span>
        <span
          dir="auto"
          style={nameMax === undefined ? undefined : { width: nameMax }}
          className={cn(
            "block text-2xs leading-tight text-sheen-fg-muted tabular-nums",
            nameMax !== undefined && "whitespace-normal",
          )}
        >
          {row.sub}
        </span>
      </th>
      {row.cells.map((cell, c) => (
        <td
          key={c}
          role="gridcell"
          data-r={r}
          data-c={c}
          tabIndex={focusC === c ? 0 : -1}
          onFocus={() => onFocusCell(r, c)}
          onPointerEnter={(e) => e.pointerType === "mouse" && onActivate(r, c, "pointer")}
          onPointerDown={(e) => e.pointerType !== "mouse" && onActivate(r, c, "pointer")}
          onClick={() => onClickCell(r, c)}
          className={cn("group/cell p-px outline-none", clickable && cell.reached && "cursor-pointer")}
        >
          <div
            data-delay={cell.delay}
            className={cn(
              // Not positioned (and the hidden reading isn't either): hundreds of cells must not
              // each become a paint layer, or scrolling and hit-testing slow down.
              "grid h-9 min-w-13 place-items-center rounded-[4px] px-1.5 font-medium tabular-nums any-pointer-coarse:h-11",
              "forced-color-adjust-none forced-colors:border forced-colors:border-[CanvasText]",
              // Ring for the cell being read (pointer) and a focus ring for the keyboard.
              activeC === c && "ring-2 ring-sheen-fg ring-inset forced-colors:ring-[Highlight]",
              "group-focus-visible/cell:outline-solid group-focus-visible/cell:outline-2 group-focus-visible/cell:outline-offset-1 group-focus-visible/cell:outline-sheen-focus",
              !cell.fill && "bg-transparent",
              cell.fill && (cell.light ? "text-sheen-ink-on-dark" : "text-sheen-ink-on-light"),
            )}
            style={cell.fill ? { backgroundColor: cell.fill } : undefined}
          >
            <span aria-hidden={cell.reached ? true : undefined} className="[grid-area:1/1]">
              {cell.text}
            </span>
            {/* Visually hidden, in the same grid cell as the number (no absolute positioning). */}
            <span className="[grid-area:1/1] size-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]">
              {cell.sr}
            </span>
          </div>
        </td>
      ))}
    </tr>
  );
});
