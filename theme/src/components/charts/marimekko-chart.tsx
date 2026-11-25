"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { dockSpace, type Readout, useDockedReadout } from "./chart-fit";
import {
  chartFocusClass,
  dataSignature,
  num,
  rowKeys,
  seriesColor,
  useElementWidth,
  type ChartRow,
  type ChartSeries,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartDockHint, ChartValueTable, defaultCompact, defaultPercent, useContrastInk, useEntrance } from "./heatmap";
import {
  changeCurve,
  fadeOutLeaving,
  fitText,
  haloTextClass,
  FlowTip,
  markGlow,
  marksById,
  measureText,
  mix,
  r2,
  roundedRectPath,
  slice,
  useFontsLoaded,
  type TapState,
} from "./flow-utils";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";

/**
 * Every string MarimekkoChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type MarimekkoChartLabels = {
  roleDescription: string;
  instructions: ChartInstructions;
  hint: string;
  /** Tooltip rows: share of the column, share of everything. */
  ofColumn: (column: string) => string;
  ofTotal: string;
  /** Title of a cell: "Column · Series". */
  cellTitle: (column: string, series: string) => string;
};

/**
 * The built-in English strings of MarimekkoChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultMarimekkoChartLabels: MarimekkoChartLabels = {
  roleDescription: "marimekko chart",
  instructions:
    "Use the arrow keys to read it: left and right move between columns, up and down between the segments of a column.",
  hint: "Tap a cell for its value",
  ofColumn: (column) => `of ${column}`,
  ofTotal: "of total",
  cellTitle: (column, series) => `${column} · ${series}`,
};

/**
 * A cell as passed to `onCellClick`. `column` is the row's `index` value and `series` the series
 * `key` (the data keys, stable under translation); `seriesLabel` is the series' display label.
 */
export type MarimekkoCell = { column: string; series: string; seriesLabel: string; value: number };

/**
 * Props of MarimekkoChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type MarimekkoChartProps = {
  /** One row per column, e.g. { segment: "Enterprise", us: 420, rivalA: 310, ... }. */
  data: readonly ChartRow[];
  /** Key of the column name in each row. */
  index: string;
  /** The stacked parts of every column, bottom up (≤ 8; colour slots stay fixed). Negative values count as 0. */
  series: readonly ChartSeries[];
  /** Height of the chart in px; the width follows the container. Default 340. */
  height?: number;
  /** What each cell prints when it fits: its share of the column (default), its value, or nothing. */
  cellText?: "share" | "value" | "none";
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. Default percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /**
   * Tell series apart without colour (hatch fills). Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** Called with `{ column, series, seriesLabel, value }` when a cell is clicked, tapped, or activated with Enter. `column` is the row's `index` value and `series` the series `key` (the data keys); `seriesLabel` is its display label. Makes cells interactive. */
  onCellClick?: (cell: MarimekkoCell) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<MarimekkoChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

type Cell = {
  key: string;
  c: number;
  s: number;
  x: number;
  y: number;
  w: number;
  h: number;
  value: number;
  color: string;
  top: boolean;
};

const GAP = 2;
const MT = 8;
const MB = 42;
const ML = 46;
const MR = 2;

/* ---------- Geometry, painted straight to the DOM by one tween ---------- */

type Box = { x: number; y: number; w: number; h: number; order: number };
type MekkoGeo = {
  cells: Map<string, Box>;
  texts: Map<string, { x: number; y: number; order: number }>;
  columns: Map<string, { x: number }>;
};
type MekkoMarks = {
  cells: Map<string, SVGPathElement>;
  texts: Map<string, SVGTextElement>;
  columns: Map<string, SVGGElement>;
};

const columnDelay = (order: number) => Math.min(0.5, order * 0.07);

/**
 * Writes every mark for one moment. `t` is the eased progress of a data change from `from`;
 * `enter` the seconds since the first-view entrance began (null: none). On first view the
 * columns rise from the baseline, left to right, then their numbers fade in.
 */
function paintMekko(
  marks: MekkoMarks,
  to: MekkoGeo,
  from: MekkoGeo | null,
  t: number,
  enter: number | null,
  baseline: number,
) {
  for (const [id, el] of marks.cells) {
    const b = to.cells.get(id);
    if (!b) continue;
    const a = from?.cells.get(id) ?? (from ? { x: b.x, y: baseline, w: b.w, h: 0, order: b.order } : null);
    let g = b;
    if (enter !== null) {
      const p = slice(enter, columnDelay(b.order), duration.slower);
      g = { ...b, y: mix(baseline, b.y, p), h: b.h * p };
    } else if (a && t < 1)
      g = { ...b, x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t) };
    el.setAttribute("d", roundedRectPath(g.x, g.y, g.w, g.h, Math.min(3, g.w / 4, g.h / 4)));
  }
  for (const [id, el] of marks.texts) {
    const b = to.texts.get(id);
    if (!b) continue;
    const a = from?.texts.get(id);
    const x = a && t < 1 ? mix(a.x, b.x, t) : b.x;
    const y = a && t < 1 ? mix(a.y, b.y, t) : b.y;
    el.setAttribute("transform", `translate(${r2(x)},${r2(y)})`);
    const shown =
      enter !== null ? slice(enter, duration.slower * 0.8 + columnDelay(b.order), duration.base) : from && !a ? t : 1;
    el.style.opacity = shown >= 1 ? "" : String(r2(shown));
  }
  for (const [id, el] of marks.columns) {
    const b = to.columns.get(id);
    if (!b) continue;
    const a = from?.columns.get(id);
    const x = a && t < 1 ? mix(a.x, b.x, t) : b.x;
    el.setAttribute("transform", `translate(${r2(x)},0)`);
  }
}

function mixMekko(a: MekkoGeo, b: MekkoGeo, t: number): MekkoGeo {
  const cells = new Map<string, Box>();
  for (const [k, v] of b.cells) {
    const f = a.cells.get(k);
    cells.set(
      k,
      f ? { x: mix(f.x, v.x, t), y: mix(f.y, v.y, t), w: mix(f.w, v.w, t), h: mix(f.h, v.h, t), order: v.order } : v,
    );
  }
  const texts = new Map<string, { x: number; y: number; order: number }>();
  for (const [k, v] of b.texts) {
    const f = a.texts.get(k);
    texts.set(k, f ? { x: mix(f.x, v.x, t), y: mix(f.y, v.y, t), order: v.order } : v);
  }
  const columns = new Map<string, { x: number }>();
  for (const [k, v] of b.columns) {
    const f = a.columns.get(k);
    columns.set(k, f ? { x: mix(f.x, v.x, t) } : v);
  }
  return { cells, texts, columns };
}

/** Text measuring tools for one font-loading state: a new object once the web fonts have arrived (`ready`), so fits keyed on it are redone. */
function textMeasurer(ready: boolean) {
  return {
    ready,
    width: (t: string, size?: number, weight?: number) => measureText(t, size, weight),
    fit: fitText,
  };
}

/**
 * A 100% stacked mosaic whose columns are as wide as their totals: market size and share in one
 * picture (segment × vendor, region × product).
 *
 * - Column widths are each column's share of the grand total; cell heights the part's share of
 *   its column. Cells are separated by 2px gaps; each prints its share where it fits, in black or
 *   white, whichever contrasts more.
 * - Hover or tap a cell for its value and both shares; arrows move between columns and parts.
 * - First view: columns rise from the baseline, left to right. Data changes reshape every cell in
 *   place. One tween drives every mark, written straight to the SVG (no React render per frame).
 *   Instant with reduced motion.
 *
 * Keyboard: Tab focuses the chart; Left and Right move between columns, Up and Down between the segments of a column, Home and End jump to the first and last column, Escape clears. With `onCellClick`, Enter activates the cell being read.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the cell's value and both shares, and cells print their share as text where they fit. `MarimekkoTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and reshapes cells instantly.
 *
 * @example
 * ```tsx
 * import { MarimekkoChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MarimekkoChart
 *       data={[
 *         { segment: "SMB", acme: 40, globex: 25 },
 *         { segment: "Enterprise", acme: 90, globex: 60 },
 *       ]}
 *       index="segment"
 *       series={[
 *         { key: "acme", label: "Acme" },
 *         { key: "globex", label: "Globex" },
 *       ]}
 *       aria-label="Market share by segment"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/marimekko
 */
export function MarimekkoChart({
  data,
  index,
  series,
  height = 340,
  cellText = "share",
  format: formatProp,
  formatPercent: pctProp,
  locale,
  patterns,
  onCellClick,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<MarimekkoChartProps>) {
  const labels = { ...defaultMarimekkoChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const patternUid = useId();
  const hatched = resolvePatterns(patterns, series.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const cellLayer = useRef<SVGGElement>(null);
  const textLayer = useRef<SVGGElement>(null);
  const columnLayer = useRef<SVGGElement>(null);
  const leavingLayer = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const fonts = useFontsLoaded(); // labels are fitted with measureText: fit them again once the font arrives
  // A measurer that is a new object when the web fonts arrive, so label fits that depend on it are redone.
  const text = useMemo(() => textMeasurer(fonts), [fonts]);
  const [active, setActive] = useState<{ c: number; s: number } | null>(null);
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  const tapRef = useRef<TapState>({ id: null, wasActive: false, touch: false });

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const signature = dataSignature(
    data,
    series.map((s) => s.key),
  );
  const lastSignature = useRef(signature);

  const docked = useDockedReadout(width);
  const innerW = Math.max(0, width - ML - MR);
  const innerH = Math.max(0, height - MT - MB);

  // Geometry: columns as wide as their totals, cells as tall as their shares (once per data or size, not per hover).
  const { totals, grand, names, columns, cells } = useMemo(() => {
    const values = data.map((row) => series.map((s) => Math.max(0, num(row[s.key]))));
    const totals = values.map((row) => row.reduce((a, v) => a + v, 0));
    const grand = totals.reduce((a, v) => a + v, 0);
    const names = data.map((row) => String(row[index] ?? ""));
    const live = totals.filter((t) => t > 0).length;
    const plotW = Math.max(0, innerW - GAP * Math.max(0, live - 1));
    const columns: { c: number; x: number; w: number }[] = [];
    const cells: Cell[] = [];
    let x = 0;
    totals.forEach((total, c) => {
      if (total <= 0 || grand <= 0) return;
      const w = (total / grand) * plotW;
      columns.push({ c, x, w });
      const parts = itemAt(values, c)
        .map((v, s) => ({ v, s }))
        .filter((p) => p.v > 0);
      const plotH = Math.max(0, innerH - GAP * (parts.length - 1));
      let y = innerH;
      parts.forEach((p, k) => {
        const h = (p.v / total) * plotH;
        y -= h;
        cells.push({
          key: `${keys[c]}|${itemAt(series, p.s).key}`,
          c,
          s: p.s,
          x,
          y,
          w,
          h,
          value: p.v,
          color: seriesColor(itemAt(series, p.s), p.s),
          top: k === parts.length - 1,
        });
        y -= GAP;
      });
      x += w + GAP;
    });
    return { totals, grand, names, columns, cells };
  }, [data, series, index, keys, innerW, innerH]);
  const ink = useContrastInk(rootRef, cellText === "none" ? [] : Array.from(new Set(cells.map((c) => c.color))));

  // Which cells print their number, and which columns their name and share (where they fit).
  const cellTexts = useMemo(
    () =>
      cellText === "none"
        ? []
        : cells.flatMap((cell) => {
            const label = cellText === "share" ? pct(cell.value / ((totals[cell.c] ?? 0) || 1)) : format(cell.value);
            return cell.h < 20 || text.width(label, 11, 500) + 10 > cell.w ? [] : [{ cell, text: label }];
          }),
    [cells, cellText, totals, format, pct, text],
  );
  const columnLabels = useMemo(() => {
    // Left to right. A name that doesn't fit whole under its column is set flush with the column's right (then left)
    // edge, spilling into the room its neighbour leaves free, before it is cut short (the full name stays in <title>).
    const out: {
      col: (typeof columns)[number];
      key: string;
      name: string;
      anchor: "middle" | "end" | "start";
      dx: number;
      share: string;
    }[] = [];
    let freeFrom = -Infinity;
    for (const [k, col] of columns.entries()) {
      const full = names[col.c] ?? "";
      const w = text.width(full, 11, 500);
      const next = columns[k + 1];
      const nextW = next ? Math.min(text.width(names[next.c] ?? "", 11, 500), next.w - 4) : 0;
      const limit = next ? next.x + next.w / 2 - nextW / 2 - 6 : Infinity;
      const mid = col.x + col.w / 2;
      const spots = [
        { anchor: "middle" as const, from: mid - w / 2, to: mid + w / 2, at: mid },
        { anchor: "end" as const, from: col.x + col.w - w, to: col.x + col.w, at: col.x + col.w },
        { anchor: "start" as const, from: col.x, to: col.x + w, at: col.x },
      ];
      const spot = spots.find((c) => c.from >= freeFrom + 6 && c.to <= Math.min(limit, innerW));
      const name = spot ? full : text.fit(full, col.w - 4, 11, 500, 3);
      if (name) freeFrom = spot ? spot.to : mid + text.width(name, 11, 500) / 2;
      const share = pct((totals[col.c] ?? 0) / grand);
      const showShare = text.width(share, 11) + 4 <= col.w;
      if (name || showShare)
        out.push({
          col,
          key: keys[col.c] ?? "",
          name,
          anchor: spot?.anchor ?? "middle",
          dx: spot ? spot.at - mid : 0,
          share: showShare ? share : "",
        });
    }
    return out;
  }, [columns, names, totals, grand, keys, pct, text, innerW]);

  const cellTitle = labelOverrides?.cellTitle ?? defaultMarimekkoChartLabels.cellTitle;
  const ofColumn = labelOverrides?.ofColumn ?? defaultMarimekkoChartLabels.ofColumn;
  const ofTotal = labelOverrides?.ofTotal ?? defaultMarimekkoChartLabels.ofTotal;
  const readoutOf = useCallback(
    (cell: Cell): Readout => {
      const column = names[cell.c] ?? "";
      const s = itemAt(series, cell.s);
      return {
        title: cellTitle(column, s.label),
        rows: [
          { label: "", value: format(cell.value), color: cell.color, kind: "rect" },
          {
            label: ofColumn(column),
            value: pct(cell.value / ((totals[cell.c] ?? 0) || 1)),
            color: "transparent",
            kind: "rect",
          },
          { label: ofTotal, value: pct(cell.value / (grand || 1)), color: "transparent", kind: "rect" },
        ],
      };
    },
    [names, series, cellTitle, ofColumn, ofTotal, format, pct, totals, grand],
  );
  const dock = useMemo(() => (docked ? dockSpace(width, cells.map(readoutOf)) : 0), [docked, width, cells, readoutOf]);

  /* ---------- Painting ---------- */

  const geo = useMemo<MekkoGeo>(() => {
    const order = new Map(columns.map((col, i) => [col.c, i]));
    return {
      cells: new Map(
        cells.map((cell) => [cell.key, { x: cell.x, y: cell.y, w: cell.w, h: cell.h, order: order.get(cell.c) ?? 0 }]),
      ),
      texts: new Map(
        cellTexts.map(({ cell }) => [
          cell.key,
          { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2, order: order.get(cell.c) ?? 0 },
        ]),
      ),
      columns: new Map(columnLabels.map(({ col, key }) => [key, { x: col.x + col.w / 2 }])),
    };
  }, [cells, columns, cellTexts, columnLabels]);
  const marksRef = useRef<MekkoMarks | null>(null);
  const shownRef = useRef<MekkoGeo | null>(null);
  const runRef = useRef<{ now: () => MekkoGeo } | null>(null);
  const enterAt = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (width === 0) return;
    // Data changes tween; a resize (same signature, new geometry) applies at once.
    const dataChanged = lastSignature.current !== signature;
    lastSignature.current = signature;
    const prev = marksRef.current;
    const marks: MekkoMarks = {
      cells: marksById(cellLayer.current),
      texts: marksById(textLayer.current),
      columns: marksById(columnLayer.current),
    };
    marksRef.current = marks;
    const from = runRef.current?.now() ?? shownRef.current;
    runRef.current = null;
    shownRef.current = geo;
    const paint = (t: number, enter: number | null, base: MekkoGeo | null = null) =>
      paintMekko(marks, geo, base, t, enter, innerH);
    if (reduced) {
      enterAt.current ??= -Infinity;
      paint(1, null);
      return;
    }
    if (!play) {
      paint(1, 0); // waiting for the first view: flat on the baseline
      return;
    }
    const total = columnDelay(columns.length - 1) + duration.slower * 0.8 + duration.base;
    enterAt.current ??= performance.now();
    const elapsed = (performance.now() - enterAt.current) / 1000;
    if (elapsed < total) {
      paint(1, elapsed);
      const controls = animate(elapsed, total, {
        duration: total - elapsed,
        ease: "linear",
        onUpdate: (e) => paint(1, e),
      });
      return () => controls.stop();
    }
    if (prev)
      fadeOutLeaving(leavingLayer.current, [...prev.cells.values(), ...prev.texts.values(), ...prev.columns.values()]);
    if (!dataChanged || !from) {
      paint(1, null); // a resize: straight to the new geometry
      return;
    }
    let t = 0;
    paint(0, null, from);
    const controls = animate(0, 1, {
      duration: duration.slow,
      ease: "linear",
      onUpdate: (k) => {
        t = changeCurve(k);
        paint(t, null, from);
      },
      onComplete: () => {
        runRef.current = null;
      },
    });
    runRef.current = { now: () => (t >= 1 ? geo : mixMekko(from, geo, t)) };
    return () => controls.stop();
  }, [geo, play, reduced, width, signature, columns.length, innerH]);

  if (data.length === 0 || series.length === 0 || grand <= 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const act = active ? (cells.find((c) => c.c === active.c && c.s === active.s) ?? null) : null;
  const cellsOf = (c: number) => cells.filter((x) => x.c === c);

  function move(next: { c: number; s: number } | null, from: "keyboard" | "pointer") {
    setSource(from);
    setActive(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    const firstCell = cells[0];
    if (!firstCell) return;
    let next: Cell | null | undefined;
    const colIdx = act ? columns.findIndex((col) => col.c === act.c) : -1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        if (!act) {
          next = firstCell;
          break;
        }
        const col = columns[colIdx + (event.key === "ArrowRight" ? 1 : -1)];
        if (!col) {
          next = act;
          break;
        }
        // Same part in the neighbouring column, else the nearest part by height.
        const there = cellsOf(col.c);
        next =
          there.find((x) => x.s === act.s) ??
          there.reduce(
            (b, x) =>
              Math.abs(x.y + x.h / 2 - (act.y + act.h / 2)) < Math.abs(b.y + b.h / 2 - (act.y + act.h / 2)) ? x : b,
            itemAt(there, 0),
          );
        break;
      }
      case "ArrowUp":
      case "ArrowDown": {
        if (!act) {
          next = firstCell;
          break;
        }
        const list = cellsOf(act.c);
        const k = list.indexOf(act);
        // Cells are listed bottom up, so "up" is the next one.
        next = list[Math.max(0, Math.min(list.length - 1, k + (event.key === "ArrowUp" ? 1 : -1)))] ?? act;
        break;
      }
      case "Home":
        next = act ? cellsOf(act.c)[0] : firstCell;
        break;
      case "End": {
        const list = act ? cellsOf(act.c) : cells;
        next = list[list.length - 1];
        break;
      }
      case "Enter":
      case " ":
        if (!act || !onCellClick) return;
        onCellClick({
          column: names[act.c] ?? "",
          series: itemAt(series, act.s).key,
          seriesLabel: itemAt(series, act.s).label,
          value: act.value,
        });
        event.preventDefault();
        return;
      case "Escape":
        if (!act) return;
        next = null;
        break;
      default:
        return;
    }
    event.preventDefault();
    move(next ? { c: next.c, s: next.s } : null, "keyboard");
  }

  function onCellDown(cell: Cell, event: PointerEvent) {
    tapRef.current = { id: cell.key, wasActive: act?.key === cell.key, touch: event.pointerType !== "mouse" };
    if (event.pointerType !== "mouse") move({ c: cell.c, s: cell.s }, "pointer");
  }
  function onCellClickInner(cell: Cell) {
    const t = tapRef.current;
    if (!onCellClick || (t.touch && t.id === cell.key && !t.wasActive)) return;
    onCellClick({
      column: names[cell.c] ?? "",
      series: itemAt(series, cell.s).key,
      seriesLabel: itemAt(series, cell.s).label,
      value: cell.value,
    });
  }

  let tooltip: ReactNode = null;
  let announcement = "";
  if (act) {
    const r = readoutOf(act);
    tooltip = (
      <FlowTip
        title={r.title}
        rows={r.rows}
        anchor={{ x: ML + act.x, y: dock + MT + act.y, w: act.w, h: act.h }}
        bounds={{ w: width, h: height + dock }}
        docked={docked}
      />
    );
    announcement = `${r.title}: ${r.rows.map((row) => `${row.value} ${row.label}`.trim()).join(", ")}`;
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col", className)}>
      {}
      <ChartFigure
        as="div"
        ref={measureRef}
        roleDescription={labels.roleDescription}
        label={ariaLabel}
        description={resolveInstructions(labels.instructions)}

        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        className={cn("relative w-full rounded-sheen-sm", chartFocusClass)}
        style={{ height: height + dock, paddingTop: dock }}
      >
        {width > 0 && (
          <svg
            aria-hidden
            // Drawn left to right in every writing direction: text anchors stay physical under dir="rtl".
            direction="ltr"
            width={width}
            height={height}
            className="block"
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setActive(null);
            }}
          >
            {hatched && (
              <ChartPatternDefs
                id={patternUid}
                entries={series.map((s, i) => ({ index: i, color: seriesColor(s, i) }))}
              />
            )}
            <g transform={`translate(${ML},${MT})`}>
              {/* Share axis: hairlines behind the mosaic (seen in its gaps) and their labels. */}
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={-4}
                    x2={innerW}
                    y1={innerH - t * innerH}
                    y2={innerH - t * innerH}
                    stroke="var(--sheen-chart-grid)"
                  />
                  <text
                    x={-8}
                    y={innerH - t * innerH}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-sheen-fg-muted text-2xs tabular-nums forced-colors:fill-[CanvasText]"
                  >
                    {pct(t)}
                  </text>
                </g>
              ))}

              {/* Marks that left the data fade out here (filled by fadeOutLeaving, never by React). */}
              <g ref={leavingLayer} className="pointer-events-none forced-color-adjust-none" />

              {/* Cells (their shapes are painted by the tween; hover dimming is a CSS transition). */}
              <g ref={cellLayer} className="forced-color-adjust-none">
                {cells.map((cell) => {
                  const on = act?.key === cell.key;
                  return (
                    <path
                      key={cell.key}
                      data-id={cell.key}
                      fill={patternFill(hatched, patternUid, cell.s, cell.color)}
                      style={{
                        opacity: !act || act.c === cell.c || act.s === cell.s ? 1 : 0.55,
                        filter: on ? markGlow(cell.color) : undefined,
                      }}
                      className={cn(
                        "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast) forced-colors:stroke-[CanvasText]",
                        onCellClick && "cursor-pointer",
                      )}
                      onPointerEnter={(e) => e.pointerType === "mouse" && move({ c: cell.c, s: cell.s }, "pointer")}
                      onPointerDown={(e) => onCellDown(cell, e)}
                      onClick={() => onCellClickInner(cell)}
                    />
                  );
                })}
              </g>

              {/* Cell text, where it fits, in black or white (whichever contrasts more with the fill). */}
              <g ref={textLayer} className="pointer-events-none">
                {cellTexts.map(({ cell, text }) => (
                  <text
                    key={cell.key}
                    data-id={cell.key}
                    textAnchor="middle"
                    dy="0.35em"
                    // The halo as an attribute too: it is the label's own backing (the pixel contrast checker keeps it).
                    stroke={hatched ? "var(--sheen-chart-surface)" : undefined}
                    className={cn(
                      "text-2xs font-medium tabular-nums",
                      hatched
                        ? // Over a hatch the digits sit in a surface-colour halo: legible whatever the stripes do.
                          cn("fill-sheen-fg font-semibold", haloTextClass)
                        : ink(cell.color) === "light"
                          ? "fill-sheen-ink-on-dark"
                          : "fill-sheen-ink-on-light",
                      "forced-colors:fill-[CanvasText]",
                    )}
                  >
                    {text}
                  </text>
                ))}
              </g>

              {/* The active cell lifts with a ring (the rest of its row and column stay readable). */}
              {act && (
                <path
                  d={roundedRectPath(act.x - 1.5, act.y - 1.5, act.w + 3, act.h + 3, Math.min(4, act.w / 3, act.h / 3))}
                  fill="none"
                  strokeWidth={2}
                  className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
                />
              )}

              {/* Column names and their share of the total, only where they fit. */}
              <g ref={columnLayer}>
                {columnLabels.map(({ col, key, name, anchor, dx, share }) => {
                  const on = act?.c === col.c;
                  return (
                    <g key={key} data-id={key}>
                      {name && (
                        <text
                          x={dx}
                          y={innerH + 16}
                          textAnchor={anchor}
                          className={cn(
                            "text-2xs forced-colors:fill-[CanvasText]",
                            on ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted",
                          )}
                        >
                          {name !== names[col.c] && <title>{names[col.c]}</title>}
                          {name}
                        </text>
                      )}
                      {share && (
                        <text
                          y={innerH + 31}
                          textAnchor="middle"
                          className="fill-sheen-fg-subtle text-2xs tabular-nums forced-colors:fill-[CanvasText]"
                        >
                          {share}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        )}
        {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
      </ChartFigure>
      <ChartAnnouncer text={source === "keyboard" ? announcement : ""} />
    </div>
  );
}

/* ---------- Table view ---------- */

/** The text of `MarimekkoTable` that is not the first column's header: the column-total and share-of-everything headers. */
export type MarimekkoTableLabels = {
  /** Header of the column total. */
  total: string;
  /** Header of the share-of-everything column. */
  share: string;
};

/** English defaults of {@link MarimekkoTableLabels}. */
export const defaultMarimekkoTableLabels: MarimekkoTableLabels = {
  total: "Total",
  share: "% of total",
};

/**
 * Props of MarimekkoTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type MarimekkoTableProps = Pick<
  MarimekkoChartProps,
  "data" | "index" | "series" | "format" | "formatPercent" | "locale"
> & {
  /** Sets the header of the first column. */
  indexLabel?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Column headers. Merged over {@link defaultMarimekkoTableLabels}. */
  labels?: Partial<MarimekkoTableLabels>;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every column with each part's value, the column total and its share of everything.
 *
 * Props: the chart's `data`, `index`, `series`, `format`, `formatPercent` and `locale`, plus `indexLabel`, `caption` (hidden, names the table), `labels` (`total` "Total" and `share` "% of total" headers) and `emptyState`. A real table: each column with every part's value, the column total and its share of everything. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { MarimekkoTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <MarimekkoTable
 *       data={[{ segment: "SMB", acme: 40, globex: 25 }]}
 *       index="segment"
 *       series={[
 *         { key: "acme", label: "Acme" },
 *         { key: "globex", label: "Globex" },
 *       ]}
 *       indexLabel="Segment"
 *       caption="Market share by segment"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/marimekko
 */
export function MarimekkoTable({
  data,
  index,
  series,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  indexLabel,
  caption,
  labels,
  emptyState,
}: MarimekkoTableProps) {
  const { total: totalLabel, share: shareLabel } = { ...defaultMarimekkoTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const totals = data.map((row) => series.reduce((a, s) => a + Math.max(0, num(row[s.key])), 0));
  const grand = totals.reduce((a, v) => a + v, 0);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: indexLabel ?? index },
        ...series.map((s) => ({ label: s.label })),
        { label: totalLabel },
        { label: shareLabel },
      ]}
      rows={data.map((row, i) => [
        String(row[index] ?? ""),
        ...series.map((s) => format(Math.max(0, num(row[s.key])))),
        <strong className="font-semibold">{format(totals[i] ?? 0)}</strong>,
        pct(grand > 0 ? (totals[i] ?? 0) / grand : NaN),
      ])}
    />
  );
}
