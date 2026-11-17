"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useDeferredValue, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type LegendItem, type TooltipRow } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, fitTicks, useInputSource, type Readout } from "./chart-fit";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  clamp,
  exitTransition,
  linear,
  MAX_SERIES,
  resolveInstructions,
  slotColor,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  itemAt,
  useFirstPlay,
} from "./chart-utils";
import { ChartTip, ChartValueTable, defaultCompact, useEntrance, type ChartTipSide } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { axisLabelsShown, edgeAnchor } from "./histogram/model";
import {
  chartMirror,
  dimLayerClass,
  fitText,
  glowColor,
  GlowFilter,
  markMap,
  useDockFits,
  useMarkMotion,
} from "./kits/histogram-kit/kit";
import { quantileSorted, sortedValues } from "./kits/histogram-kit/stats";
import { ChartFigure } from "./chart-figure";

/**
 * One point of a Beeswarm: its value, and optionally a label, the row it belongs to (`group`), its
 * series and an id.
 */
export type BeeswarmPoint = {
  value: number;
  /** Names the point in the readout and the table (a company, a country, a team). */
  label?: string;
  /** Row the point belongs to. Points without a group share one row. */
  group?: string;
  /** Key of the series that colours the point (see `series`). */
  series?: string;
  /** Stable identity, so the point glides when the data changes. Defaults to label, then position. */
  id?: string;
};

/** A series of a Beeswarm: the key points refer to, its label and an optional palette slot. */
export type BeeswarmSeries = { key: string; label: string; color?: ChartColor };

/**
 * Every string Beeswarm speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type BeeswarmLabels = {
  roleDescription: string;
  /** Appended to the accessible name: a string, or a function of `{ rows }` (true when the swarm is split into rows) to word the keys. */
  instructions: ChartInstructions<{ rows: boolean }>;
  hint: string;
  value: string;
  median: string;
  /** Row caption under a group's name, e.g. "120 · median 42". */
  rowSummary: (count: string, median: string) => string;
  other: string;
  point: string;
  group: string;
  series: string;
  noData: string;
};

/**
 * The built-in English strings of Beeswarm; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultBeeswarmLabels: BeeswarmLabels = {
  roleDescription: "beeswarm chart",
  instructions: ({ rows }) =>
    rows
      ? "Use the left and right arrow keys to move along a row, and up and down to move between rows."
      : "Use the left and right arrow keys to move from point to point.",
  hint: "Tap a dot to read it",
  value: "Value",
  median: "Median",
  rowSummary: (count, median) => `${count} · median ${median}`,
  other: "Other",
  point: "Point",
  group: "Group",
  series: "Series",
  noData: "No data",
};

/**
 * Props of Beeswarm. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BeeswarmProps = {
  /** The observations to plot, each drawn as one dot. */
  data: readonly BeeswarmPoint[];
  /** Sets the order of the rows (by `group`). Default: the order groups first appear in. */
  groups?: readonly string[];
  /** Colour dots by series (fixed slots; up to 8, the rest fold into a grey "Other"). Without it every dot is `color`. */
  series?: readonly BeeswarmSeries[];
  /** Palette slot (1–8) when there are no series. Default 1. */
  color?: ChartColor;
  /** Dot radius in px; dense swarms shrink towards 3 to keep their rows from growing too tall. Default 4.5. */
  radius?: number;
  /** Mark each row's median with a line. Default true. */
  showMedian?: boolean;
  /** Keep 0 on the value axis. */
  includeZero?: boolean;
  /** Emphasise these points (by label or id); the rest step back. */
  highlight?: string | string[];
  /** Names the value axis. */
  valueLabel?: string;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<BeeswarmLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const MAX_ROW = 200; // tallest a swarm may grow before its dots shrink
const TIP: readonly ChartTipSide[] = ["right", "left", "above", "below"];

/** The zero-length transition used under reduced motion. */
const INSTANT = { duration: 0 };

/**
 * Collision-free swarm offsets ("dodge"): each point, in order of `x`, takes the offset closest to
 * the centre line where it doesn't overlap any point already placed. Points are `gap` px apart
 * centre to centre. Returns offsets in the input order.
 */
export function beeswarmOffsets(xs: readonly number[], gap: number): number[] {
  const order = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x || a.i - b.i);
  const out = new Array<number>(xs.length).fill(0);
  const placed: { x: number; y: number }[] = [];
  let windowStart = 0;
  const g2 = gap * gap;
  for (const { x, i } of order) {
    while (windowStart < placed.length && itemAt(placed, windowStart).x < x - gap) windowStart++;
    const near = placed.slice(windowStart);
    const candidates = [0];
    for (const p of near) {
      const dx = x - p.x;
      const dy = Math.sqrt(Math.max(0, g2 - dx * dx));
      candidates.push(p.y + dy + 0.01, p.y - dy - 0.01);
    }
    candidates.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    let y = 0;
    for (const c of candidates) {
      if (near.every((p) => (p.x - x) ** 2 + (p.y - c) ** 2 >= g2 - 0.5)) {
        y = c;
        break;
      }
    }
    placed.push({ x, y });
    out[i] = y;
  }
  return out;
}

type Dot = {
  key: string;
  point: BeeswarmPoint;
  row: number;
  color: string;
  slot: number;
  px: number;
  py: number;
  dim: boolean;
};

const NO_DOTS: Dot[] = [];
const NO_ROWS: Dot[][] = [];
const ROW_ORIGIN = { transformBox: "fill-box", transformOrigin: "center" } as const;
/** Above this many moving dots a data change cross-fades the swarm instead of gliding every dot. */
const MAX_GLIDING = 400;

/**
 * A beeswarm: every observation as its own dot along one value axis, nudged sideways just enough
 * that no two overlap, so the shape of the distribution shows and every individual stays readable
 * and hoverable. One swarm per group, a median line each, dots coloured by series (with the usual
 * fixed slots and "Other" fold).
 *
 * Hover (the nearest dot), tap (tap again to unpin) or arrow along a row; up / down jump to the
 * nearest value in the next row. On first view the dots drop out of the centre line into the
 * swarm in a sweep; new data glides them to their new places (dense swarms cross-fade). Instant
 * under reduced motion.
 *
 * Fast with hundreds of dots: dots are plain circles animated by one frame loop (useMarkMotion);
 * reading a dot never re-renders them (the swarm dims as one layer and the active dot is redrawn
 * on top), and new data lays out in the background without blocking input.
 *
 * Keyboard: Tab focuses the chart; the arrow keys along the value axis step between dots in value order, Up and Down jump to the nearest value in the next group when there are several, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the dot's value and group, and each group's count and median are available as text. `BeeswarmTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and moves dots instantly.
 *
 * @example
 * ```tsx
 * import { Beeswarm } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Beeswarm
 *       data={[
 *         { value: 12, group: "EU" },
 *         { value: 14, group: "EU" },
 *         { value: 30, group: "US" },
 *         { value: 33, group: "US" },
 *       ]}
 *       valueLabel="Order value"
 *       aria-label="Order value by region"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/beeswarm
 */
export function Beeswarm({
  data: dataProp,
  groups: groupOrder,
  series,
  color = 1,
  radius = 4.5,
  showMedian = true,
  includeZero = false,
  highlight,
  valueLabel,
  format: formatProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BeeswarmProps>) {
  const t = useMemo(() => ({ ...defaultBeeswarmLabels, ...labels }), [labels]);
  const id = useId();
  const format = formatProp ?? defaultCompact(locale);
  const count = defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const layerRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const first = useFirstPlay(play && width > 0);
  const input = useInputSource();
  const [active, setActive] = useState<string | null>(null);
  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);
  const bounds = useHitBounds(width);

  // New data lays out in the background (interruptible): the control that changed it answers at once.
  const data = useDeferredValue(dataProp);
  // Arrays written inline (groups={[...]}, highlight={[...]}) are compared by content.
  const groupKey = groupOrder?.join("\u0001") ?? "";
  const highlightKey = highlight === undefined ? null : Array.isArray(highlight) ? highlight.join("\u0001") : highlight;

  const points = useMemo(() => data.filter((p) => Number.isFinite(p.value)), [data]);
  const rowNames = useMemo(() => {
    const order = groupKey ? groupKey.split("\u0001") : [];
    const present = new Set(points.map((p) => p.group ?? ""));
    const out = order.filter((g) => present.has(g));
    const seen = new Set(out);
    for (const p of points) {
      const g = p.group ?? "";
      if (!seen.has(g)) {
        seen.add(g);
        out.push(g);
      }
    }
    return out;
  }, [points, groupKey]);
  const grouped = rowNames.length > 1 || (rowNames[0] ?? "") !== "";

  // Series → colour slots: the first eight keep their slot, the rest fold into grey "Other".
  const seriesInfo = useMemo(() => {
    const map = new Map<string, { label: string; color: string; slot: number }>();
    (series ?? []).forEach((s, i) => {
      const slot = i < MAX_SERIES ? (s.color ?? i + 1) : 0;
      map.set(s.key, { label: i < MAX_SERIES ? s.label : t.other, color: slotColor(slot), slot });
    });
    return map;
  }, [series, t.other]);

  // Each row's members, value range and summary.
  const rows = useMemo(() => {
    const index = new Map(rowNames.map((g, i) => [g, i]));
    const members: BeeswarmPoint[][] = rowNames.map(() => []);
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of points) {
      members[index.get(p.group ?? "") ?? 0]?.push(p);
      lo = Math.min(lo, p.value);
      hi = Math.max(hi, p.value);
    }
    if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
    if (includeZero) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    const stats = rowNames.map((name, i) => {
      const vals = sortedValues(itemAt(members, i).map((p) => p.value));
      const median = quantileSorted(vals, 0.5);
      return { name, n: vals.length, median, summary: t.rowSummary(count(vals.length), format(median)) };
    });
    return { members, stats, lo, hi };
  }, [points, rowNames, includeZero, t, count, format]);

  const fmtAxis = axisFormat(formatProp);
  const narrow = width > 0 && width < 480;
  // Narrow charts: group names sit above their swarm instead of in a column.
  const labelCol = useMemo(() => {
    if (!grouped || narrow) return 0;
    // Widest row caption: the group's name (12px medium) or its summary line (11px).
    const widest = rows.stats.reduce((m, r) => Math.max(m, textWidth(r.name, 12, true), textWidth(r.summary)), 0);
    return clamp(Math.ceil(widest) + 18, 56, Math.max(56, Math.floor(width * 0.3)));
  }, [grouped, narrow, rows, width]);
  const innerW = Math.max(0, width - labelCol - 14);

  // Layout every row's swarm; dense rows shrink their dots (down to 3px) before growing past MAX_ROW.
  const layout = useMemo(() => {
    const ticks = fitTicks(rows.lo, rows.hi, { length: Math.max(0, innerW - 12), axis: "x", format: fmtAxis });
    const t0 = ticks[0] ?? rows.lo;
    const t1 = ticks[ticks.length - 1] ?? rows.hi;
    const sx = linear(t0, t1, 6, Math.max(6, innerW - 6));
    if (width <= 0) return { ticks, sx, r: radius, swarms: [] as { offsets: number[]; extent: number }[] };
    const build = (r: number) => {
      const gap = 2 * r + 1.5;
      return rows.members.map((members) => {
        const offsets = beeswarmOffsets(
          members.map((p) => sx(p.value)),
          gap,
        );
        const extent = offsets.reduce((m, o) => Math.max(m, Math.abs(o)), 0) + r + 2;
        return { offsets, extent };
      });
    };
    // Shrink the dots (never below 3px) until the tallest swarm fits MAX_ROW; past that the row just grows.
    let r = radius;
    let swarms = build(r);
    for (let pass = 0; pass < 4 && r > 3; pass++) {
      const tallest = swarms.reduce((m, row) => Math.max(m, row.extent * 2), 0);
      if (tallest <= MAX_ROW) break;
      r = Math.max(3, r * Math.sqrt(MAX_ROW / tallest));
      swarms = build(r);
    }
    return { ticks, sx, r, swarms };
  }, [rows, innerW, width, radius, fmtAxis]);
  const R = layout.r;
  const { sx, ticks } = layout;

  const nameH = grouped && narrow ? 30 : 0;
  const rowHeights = useMemo(
    () => layout.swarms.map((row) => Math.max(grouped ? 40 : 96, row.extent * 2 + 10) + nameH),
    [layout, grouped, nameH],
  );
  const innerH = rowHeights.reduce((a, b) => a + b, 0);
  // Touch screens dock the readout above the plot, unless the swarm is too tall for that band to stay in view.
  const docked = useDockFits(width, innerH);
  const dock = useMemo(() => {
    if (!docked) return 0;
    // A sample of readouts is enough to size the band (they all share one shape).
    const step = Math.max(1, Math.floor(points.length / 40));
    const probe: Readout[] = [];
    for (let i = 0; i < points.length; i += step) {
      const p = itemAt(points, i);
      probe.push({
        title: p.label ?? p.group ?? "",
        rows: [{ label: valueLabel ?? t.value, value: format(p.value), color: "currentColor" }],
      });
    }
    return dockSpace(width, probe);
  }, [docked, points, width, valueLabel, t, format]);
  const top = 6 + dock;
  const bottom = 24 + (valueLabel ? 20 : 0);
  const chartH = top + innerH + bottom;
  const mirror = useMemo(() => chartMirror(rtl, innerW), [rtl, innerW]);
  const originX = rtl ? 14 : labelCol;

  const geometry = useMemo(() => {
    const rowTop: number[] = [];
    let y = 0;
    for (const h of rowHeights) {
      rowTop.push(y);
      y += h;
    }
    const rowMid = rowHeights.map((h, i) => (rowTop[i] ?? 0) + nameH + (h - nameH) / 2);
    const highlightSet = highlightKey === null ? null : new Set(highlightKey.split("\u0001"));
    const dots: Dot[] = [];
    layout.swarms.forEach((swarm, ri) => {
      const seen = new Map<string, number>();
      itemAt(rows.members, ri).forEach((p, k) => {
        const base = p.id ?? p.label ?? String(k);
        const dup = seen.get(base) ?? 0;
        seen.set(base, dup + 1);
        const s = p.series !== undefined ? seriesInfo.get(p.series) : undefined;
        const slot = s ? s.slot : series ? 0 : color;
        dots.push({
          key: `${rowNames[ri]}\u0000${base}\u0000${dup}`,
          point: p,
          row: ri,
          color: slotColor(slot),
          slot,
          px: mirror.x(sx(p.value)),
          py: (rowMid[ri] ?? 0) + (swarm.offsets[k] ?? 0),
          dim: highlightSet !== null && !highlightSet.has(p.label ?? "") && !highlightSet.has(p.id ?? ""),
        });
      });
    });
    // Keyboard order within each row: by value.
    const rowOrder = rowNames.map(() => [] as Dot[]);
    for (const d of dots) itemAt(rowOrder, d.row).push(d);
    for (const list of rowOrder) list.sort((a, b) => a.point.value - b.point.value || a.py - b.py);
    const byKey = new Map(dots.map((d) => [d.key, d]));
    return { rowTop, rowMid, dots, rowOrder, byKey };
  }, [rowHeights, nameH, highlightKey, layout, rows, seriesInfo, series, color, rowNames, mirror, sx]);
  const { rowTop, rowMid, dots, rowOrder } = geometry;

  // The dots: plain circles, moved by one frame loop.
  const marks = useMemo(
    () =>
      markMap(
        width > 0 ? dots : NO_DOTS,
        (d) => d.key,
        (d) => [d.px, d.py],
      ),
    [dots, width],
  );
  useMarkMotion(
    layerRef,
    null,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, [x = 0, y = 0]) => el.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`),
      // Dots drop out of their row's centre line into the swarm, sweeping along the axis.
      entrance: ([x = 0, y = 0], key) => {
        const d = geometry.byKey.get(key);
        if (!d) return null;
        return {
          keyframes: [
            { transform: `translate(${x}px, ${rowMid[d.row] ?? 0}px) scale(0)`, opacity: 0 },
            { transform: `translate(${x}px, ${y}px)` },
          ],
          delay: 0.1 + (sx(d.point.value) / Math.max(1, innerW)) * 0.55 + d.row * 0.08,
          duration: duration.slower * 0.85,
        };
      },
      maxMoving: MAX_GLIDING,
      // Dense swarms (where one animation per dot would cost a compositor layer each) bloom out of
      // their centre lines row by row while a wipe sweeps along the axis in reading order.
      maxEntrance: 60,
      layerEntrance: (layer) => [
        {
          keyframes: [{ clipPath: rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
          delay: 0.1,
          duration: duration.slower * 1.4,
        },
        ...Array.from(layer.querySelectorAll<SVGGElement>(":scope > [data-row]"), (row, ri) => ({
          target: row,
          keyframes: [
            { transform: "scaleY(0)", opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          delay: 0.1 + ri * 0.08,
          duration: duration.slower * 1.2,
        })),
      ],
    },
  );

  const morph = useMemo(() => (reduced ? INSTANT : { duration: duration.slow, ease: changeEase }), [reduced]);
  // Physical edges of the svg in plot coordinates (the margins swap sides right to left).
  const edgeLo = -originX;
  const edgeHi = width - originX;

  const grid = useMemo(() => {
    const xShown = axisLabelsShown(
      ticks.map((tk) => ({ x: mirror.x(sx(tk)), text: fmtAxis(tk) })),
      edgeLo,
      edgeHi,
    );
    return (
      <>
        {valueLabel && (
          <text x={innerW / 2} y={innerH + 38} textAnchor="middle" className="fill-sheen-fg-muted text-2xs font-medium">
            {valueLabel}
          </text>
        )}
        <AnimatePresence initial={false}>
          {ticks.map((tk, ti) => {
            const p = mirror.x(sx(tk));
            const text = fmtAxis(tk);
            return (
              <motion.g
                key={`t${tk}`}
                initial={{ opacity: 0, x: p }}
                animate={{ opacity: 1, x: p }}
                exit={{ opacity: 0, transition: reduced ? INSTANT : exitTransition }}
                transition={{ x: morph, opacity: reduced ? INSTANT : { duration: duration.base } }}
              >
                <line y1={0} y2={innerH} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                {xShown.has(ti) && (
                  <text
                    y={innerH + 18}
                    textAnchor={edgeAnchor(p, textWidth(text), edgeLo, edgeHi)}
                    className="fill-sheen-fg-muted text-2xs tabular-nums"
                  >
                    {text}
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
        {/* Median per row: a dashed line that slides (transform) when the data changes. */}
        {showMedian &&
          rows.stats.map((r, ri) =>
            Number.isFinite(r.median) ? (
              <motion.line
                key={`med${r.name}`}
                x1={0}
                x2={0}
                y1={(rowTop[ri] ?? 0) + nameH + 4}
                y2={(rowTop[ri] ?? 0) + (rowHeights[ri] ?? 0) - 4}
                stroke="var(--sheen-fg)"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                className="forced-colors:stroke-[CanvasText]"
                initial={reduced ? false : { opacity: 0, x: mirror.x(sx(r.median)) }}
                animate={{ opacity: play ? 1 : 0, x: mirror.x(sx(r.median)) }}
                transition={{
                  opacity: reduced ? INSTANT : { duration: duration.base, delay: first ? 0.75 + ri * 0.08 : 0 },
                  x: morph,
                }}
              />
            ) : null,
          )}
      </>
    );
  }, [
    ticks,
    sx,
    mirror,
    fmtAxis,
    edgeLo,
    edgeHi,
    valueLabel,
    innerW,
    innerH,
    reduced,
    showMedian,
    rows,
    rowTop,
    rowHeights,
    nameH,
    play,
    first,
    morph,
  ]);

  const strokeW = Math.min(2, R * 0.45);
  const dotLayer = useMemo(
    () => (
      <g ref={layerRef} opacity={play ? undefined : 0}>
        {/* One group per row: a dense swarm's entrance animates the rows, not every dot. */}
        {(width > 0 ? rowOrder : NO_ROWS).map((list, ri) => (
          <g key={rowNames[ri] ?? ri} data-row={ri} style={ROW_ORIGIN}>
            {list.map((d) => (
              <circle
                key={d.key}
                data-k={d.key}
                r={R}
                fill={d.color}
                stroke="var(--sheen-chart-surface)"
                strokeWidth={strokeW}
                transform={`translate(${d.px.toFixed(1)} ${d.py.toFixed(1)})`}
                opacity={d.dim ? 0.42 : undefined}
                className="forced-colors:fill-[CanvasText]"
              />
            ))}
          </g>
        ))}
      </g>
    ),
    [rowOrder, rowNames, width, play, R, strokeW],
  );

  // Empty means no data (not "not laid out yet": the first render has no width to lay out with).
  if (points.length === 0) {
    return (
      <ChartEmpty height={200} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null ? geometry.byKey.get(active) : undefined;
  const readoutFor = (d: Dot): Readout => {
    const rowsOut: TooltipRow[] = [
      { label: valueLabel ?? t.value, value: isolate(format(d.point.value)), color: d.color, kind: "rect" },
    ];
    const s = d.point.series !== undefined ? seriesInfo.get(d.point.series) : undefined;
    if (s) rowsOut.push({ label: t.series, value: s.label, color: "transparent" });
    if (grouped && d.point.label) rowsOut.push({ label: t.group, value: rowNames[d.row] ?? "", color: "transparent" });
    return { title: d.point.label ?? (grouped ? (rowNames[d.row] ?? "") : t.point), rows: rowsOut };
  };
  const readout = act ? readoutFor(act) : undefined;

  /** The nearest dot to the pointer, within reach (the hit rect starts 6px before the plot). */
  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    const mx = event.clientX - rect.left - 6;
    const my = event.clientY - rect.top;
    const reach = event.pointerType === "mouse" ? 18 : 28;
    let best: Dot | undefined;
    let bestD = reach * reach;
    for (const d of dots) {
      const dx = d.px - mx;
      const dy = d.py - my;
      const dist = dx * dx + dy * dy;
      if (dist <= bestD) {
        bestD = dist;
        best = d;
      }
    }
    return best ? best.key : null;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const ri = act?.row ?? 0;
    const order = rowOrder[ri] ?? [];
    const at = act ? order.indexOf(act) : -1;
    let next: Dot | null | undefined;
    if (event.key === mirror.next) next = order[Math.min(order.length - 1, at + 1)] ?? null;
    else if (event.key === mirror.prev) next = order[at < 0 ? 0 : Math.max(0, at - 1)] ?? null;
    else if (event.key === "Home") next = order[0] ?? null;
    else if (event.key === "End") next = order[order.length - 1] ?? null;
    else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && grouped) {
      const target = clamp(ri + (event.key === "ArrowDown" ? 1 : -1), 0, rowNames.length - 1);
      if (!act) next = rowOrder[target]?.[0] ?? null;
      else {
        // The dot in the next row with the nearest value.
        const v = act.point.value;
        next =
          (rowOrder[target] ?? []).reduce<Dot | null>(
            (b, d) => (b === null || Math.abs(d.point.value - v) < Math.abs(b.point.value - v) ? d : b),
            null,
          ) ?? act;
      }
    } else if (event.key === "Escape" && act) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next ? next.key : null);
  }

  const tipAnchor = act
    ? { x: originX + act.px - R - 3, y: top + act.py - R - 3, w: 2 * R + 6, h: 2 * R + 6 }
    : { x: 0, y: 0, w: 0, h: 0 };

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: chartH }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={chartH}
            roleDescription={t.roleDescription}
            label={ariaLabel}
            description={resolveInstructions(t.instructions, { rows: grouped && rowNames.length > 1 })}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <defs>
              <GlowFilter
                id={`${id}-glow`}
                blur={4}
                region={act ? { x: act.px - R - 5, y: act.py - R - 5, w: 2 * R + 10, h: 2 * R + 10 } : null}
              />
            </defs>
            <g aria-hidden transform={`translate(${originX},${top})`}>
              {grid}

              {/* Rows: a hairline between groups, the group name and its summary. */}
              {grouped &&
                rows.stats.map((r, ri) => {
                  // Narrow: name and summary share a line above the swarm; the name gives way first.
                  const name = fitText(
                    r.name,
                    narrow ? Math.max(48, width - textWidth(r.summary) - 12) : labelCol - 16,
                    12,
                    true,
                  );
                  const tx = narrow ? (rtl ? innerW : 0) : rtl ? innerW + 12 : -12;
                  const anchor = narrow ? (rtl ? "end" : "start") : rtl ? "start" : "end";
                  const on = act?.row === ri;
                  return (
                    <g key={`row${r.name}`}>
                      {ri > 0 && (
                        <line
                          x1={narrow ? 0 : -labelCol + 6}
                          x2={innerW}
                          y1={rowTop[ri]}
                          y2={rowTop[ri]}
                          stroke="var(--sheen-chart-grid)"
                        />
                      )}
                      <text
                        x={tx}
                        y={narrow ? (rowTop[ri] ?? 0) + 14 : (rowMid[ri] ?? 0) - 6}
                        textAnchor={anchor}
                        className={cn("fill-sheen-fg text-xs", on && "font-medium")}
                      >
                        {name !== r.name && <title>{r.name}</title>}
                        {name}
                      </text>
                      <text
                        x={narrow ? tx + (rtl ? -1 : 1) * (textWidth(name, 12, true) + 8) : tx}
                        y={narrow ? (rowTop[ri] ?? 0) + 14 : (rowMid[ri] ?? 0) + 9}
                        textAnchor={anchor}
                        className="fill-sheen-fg-muted text-2xs tabular-nums"
                      >
                        {r.summary}
                      </text>
                    </g>
                  );
                })}

              {/* Dots: a 2px surface ring keeps neighbours apart. The swarm steps back while one is read. */}
              <g className="forced-color-adjust-none">
                <g data-dim={act ? "" : undefined} className={cn(dimLayerClass, "data-dim:opacity-30")}>
                  {dotLayer}
                </g>
                {act && (
                  <g pointerEvents="none">
                    <circle
                      cx={act.px}
                      cy={act.py}
                      r={R + 5}
                      style={{ fill: glowColor(act.color) }}
                      filter={`url(#${id}-glow)`}
                      className="forced-colors:hidden"
                    />
                    <circle
                      cx={act.px}
                      cy={act.py}
                      r={R + 1}
                      fill={act.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      className="forced-colors:fill-[CanvasText]"
                    />
                    <circle
                      cx={act.px}
                      cy={act.py}
                      r={R + 4.5}
                      fill="none"
                      stroke={act.color}
                      strokeWidth={2}
                      className="forced-colors:stroke-[Highlight]"
                    />
                  </g>
                )}
              </g>

              <rect
                x={-6}
                y={0}
                width={innerW + 12}
                height={innerH}
                fill="transparent"
                style={{ touchAction: "pan-y pinch-zoom" }}
                onPointerEnter={bounds.reset}
                onPointerDown={(e) => pointer.down(e, hitAt(e, true))}
                onPointerMove={(e) => pointer.move(e, hitAt(e))}
                onPointerUp={pointer.up}
                onPointerLeave={pointer.leave}
              />
            </g>
          </ChartFigure>
        )}
        {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.hint}</DockHint>}
        {readout && (
          <ChartTip
            title={readout.title}
            rows={readout.rows}
            anchor={tipAnchor}
            bounds={{ w: width, h: chartH }}
            docked={docked}
            order={TIP}
          />
        )}
      </div>
      <ChartAnnouncer
        text={input.announce(
          readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : "",
        )}
      />
    </div>
  );
}

/** Legend items for a beeswarm's series (with the same "Other" fold as the chart). */
export function beeswarmLegend(
  series: readonly BeeswarmSeries[],
  otherLabel = defaultBeeswarmLabels.other,
): LegendItem[] {
  const kept = series
    .slice(0, MAX_SERIES)
    .map((s, i) => ({ label: s.label, color: slotColor(s.color ?? i + 1), kind: "rect" as const }));
  return series.length > MAX_SERIES ? [...kept, { label: otherLabel, color: slotColor(0), kind: "rect" }] : kept;
}

/* ---------- Table view ---------- */

/**
 * Props of BeeswarmTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type BeeswarmTableProps = Pick<
  BeeswarmProps,
  "data" | "groups" | "series" | "format" | "locale" | "labels" | "valueLabel"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every point with its group, series and value, grouped by row and sorted by value.
 *
 * Props: the chart's `data`, `groups`, `series`, `format`, `locale`, `labels` and `valueLabel`, plus `caption` (hidden, names the table) and `className`. A real table: every point with its group, series and value, grouped by row and sorted by value. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { BeeswarmTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BeeswarmTable data={[{ value: 12, group: "EU" }, { value: 30, group: "US" }]} valueLabel="Order value" caption="Order value by region" />
 *   );
 * }
 * ```
 *
 * @see /charts/beeswarm
 */
export function BeeswarmTable({
  data,
  groups,
  series,
  format: formatProp,
  locale,
  labels,
  valueLabel,
  caption,
  className,
}: BeeswarmTableProps) {
  const t = { ...defaultBeeswarmLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const order = new Map((groups ?? []).map((g, i) => [g, i]));
  const names = new Map((series ?? []).map((s) => [s.key, s.label]));
  const points = data
    .filter((p) => Number.isFinite(p.value))
    .slice()
    .sort(
      (a, b) =>
        (order.get(a.group ?? "") ?? 1e9) - (order.get(b.group ?? "") ?? 1e9) ||
        (a.group ?? "").localeCompare(b.group ?? "") ||
        b.value - a.value,
    );
  const hasGroups = points.some((p) => p.group);
  const hasSeries = points.some((p) => p.series !== undefined);
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: t.point },
        ...(hasGroups ? [{ label: t.group, align: "start" as const }] : []),
        ...(hasSeries ? [{ label: t.series, align: "start" as const }] : []),
        { label: valueLabel ?? t.value },
      ]}
      rows={points.map((p, i) => [
        p.label ?? `${t.point} ${i + 1}`,
        ...(hasGroups ? [p.group ?? "–"] : []),
        ...(hasSeries ? [names.get(p.series ?? "") ?? p.series ?? "–"] : []),
        // Isolated so right-to-left pages keep the number whole ("−4", not "4−").
        isolate(format(p.value)),
      ])}
    />
  );
}
