"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, fitTicks, useInputSource, type Readout } from "./chart-fit";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  clamp,
  exitTransition,
  linear,
  resolveInstructions,
  useElementWidth,
  itemAt,
} from "./chart-utils";
import { ChartTip, defaultCompact, useEntrance } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { axisLabelsShown, edgeAnchor } from "./histogram/model";
import {
  chartMirror,
  dimLayerClass,
  fitText,
  glowColor,
  GlowFilter,
  useDockFits,
  useMarkMotion,
  type MarkState,
} from "./kits/histogram-kit/kit";
import { ChartFigure } from "./chart-figure";

import {
  defaultBoxPlotLabels,
  type BoxPlotProps,
  boxPlotStats,
  type Resolved,
  OUTLIER_R,
  TIP_V,
  TIP_H,
  INSTANT,
  dodgeOutliers,
  type Active,
  markD,
  type GroupMark,
} from "./box-plot/model";
import { markPaint } from "./box-plot/parts";

export {
  type BoxSummary,
  type BoxPlotGroup,
  type BoxPlotLabels,
  defaultBoxPlotLabels,
  type BoxPlotProps,
  boxPlotStats,
} from "./box-plot/model";
export { type BoxPlotTableProps, BoxPlotTable } from "./box-plot/parts";

/**
 * Box and whisker plots (or violins) for comparing distributions across groups: the box spans the
 * middle 50% (Q1–Q3), a surface-coloured gap marks the median, whiskers reach the most extreme
 * values within 1.5 IQR, and outliers are dots beyond them, dodged so none hide another. The violin
 * variant draws each group's kernel density as a mirrored shape around a slim box.
 *
 * Hover, tap (tap again to unpin) or arrow between groups; the value-axis arrows step through a
 * group's outliers. Boxes open from their median and whiskers draw out the first time the chart
 * scrolls into view; new data morphs everything in place. Instant under reduced motion.
 *
 * Fast with many groups: the marks are plain paths moved by one frame loop (useMarkMotion), and
 * reading a group never re-renders them (the plot steps back as one layer; the group is redrawn on top).
 *
 * Keyboard: Tab focuses the chart; the arrow keys along the group axis move between groups, the arrows along the value axis step through the focused group's outliers, Home and End jump to the first and last group, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the group's statistics. `BoxPlotTable` is the table view (n, quartiles, median, mean and outliers).
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and morphs instantly.
 *
 * @example
 * ```tsx
 * import { BoxPlot } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BoxPlot
 *       data={[
 *         { label: "Free", values: [2, 3, 3, 4, 5, 6, 9] },
 *         { label: "Pro", values: [4, 5, 6, 6, 7, 8, 12] },
 *       ]}
 *       valueLabel="Sessions per week"
 *       aria-label="Weekly sessions by plan"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/box-plot
 */
export function BoxPlot({
  data: dataProp,
  variant: variantProp = "box",
  orientation = "auto",
  whisker: whiskerProp = 1.5,
  showMean = false,
  includeZero = false,
  bandwidth,
  color = 1,
  height = 300,
  valueLabel,
  format: formatProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BoxPlotProps>) {
  const t = useMemo(() => ({ ...defaultBoxPlotLabels, ...labels }), [labels]);
  const id = useId();
  const format = formatProp ?? defaultCompact(locale);
  const count = defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const layerRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const input = useInputSource();
  const [active, setActive] = useState<Active | null>(null);
  const bounds = useHitBounds(width);
  // New data renders in the background (interruptible): the control that changed it answers at once.
  const data = useDeferredValue(dataProp);
  const whisker = useDeferredValue(whiskerProp);
  const violin = useDeferredValue(variantProp) === "violin";
  const groups = useMemo(
    () => boxPlotStats(data, whisker, bandwidth, color, violin),
    [data, whisker, bandwidth, color, violin],
  );
  const n = groups.length;
  const sameActive = (a: Active | null, b: Active | null) => a?.g === b?.g && a?.o === b?.o;
  // The pointer kit compares hits by value: a group or outlier is encoded as "group:outlier".
  const keyOf = (a: Active | null) => (a ? `${a.g}:${a.o ?? ""}` : null);
  const parse = (k: string | null): Active | null => {
    if (k === null) return null;
    const [g = "0", o = ""] = k.split(":");
    return { g: Number(g), o: o === "" ? null : Number(o) };
  };
  const pointer = usePointerReading<string>(keyOf(active), (k) => setActive(parse(k)), input.fromPointer);

  // Orientation: upright unless the chart is narrow or a group name wouldn't fit under its box.
  const widestName = groups.reduce((m, g) => Math.max(m, textWidth(g.label, 12, true)), 0);
  const horizontal =
    orientation === "horizontal" ||
    (orientation === "auto" && width > 0 && (width < 480 || widestName + 8 > (width - 60) / Math.max(1, n)));

  const readoutFor = useCallback(
    (g: Resolved, o: number | null): Readout => {
      // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
      const f = (n: number) => isolate(format(n));
      const c = (n: number) => isolate(count(n));
      if (o !== null)
        return {
          title: g.label,
          rows: [{ label: t.outlier, value: f(g.outliers[o] ?? NaN), color: g.color, kind: "rect" }],
        };
      const rows: TooltipRow[] = [
        { label: t.median, value: f(g.median), color: g.color, kind: "rect" },
        { label: t.quartiles, value: t.between(f(g.q1), f(g.q3)), color: "transparent" },
        { label: t.whiskers, value: t.between(f(g.low), f(g.high)), color: "transparent" },
      ];
      if (g.mean !== null) rows.push({ label: t.mean, value: f(g.mean), color: "transparent" });
      if (g.n !== null) rows.push({ label: t.count, value: c(g.n), color: "transparent" });
      if (g.outliers.length > 0) rows.push({ label: t.outliers, value: c(g.outliers.length), color: "transparent" });
      return { title: g.label, rows };
    },
    [t, format, count],
  );
  const rowH = violin ? 72 : 52;
  // Touch screens dock the readout above the plot, unless the plot is too tall for that band to stay in view.
  const docked = useDockFits(width, horizontal ? n * rowH + 30 : height);
  const dock = useMemo(
    () =>
      docked
        ? dockSpace(
            width,
            groups.map((g) => readoutFor(g, null)),
          )
        : 0,
    [docked, width, groups, readoutFor],
  );

  // Layout: everything that doesn't depend on which group is being read.
  const L = useMemo(() => {
    // Value domain: whiskers, outliers and violins; optionally zero.
    let lo = Infinity;
    let hi = -Infinity;
    for (const g of groups) {
      lo = Math.min(lo, g.low, ...g.outliers, g.density ? g.min : Infinity);
      hi = Math.max(hi, g.high, ...g.outliers, g.density ? g.max : -Infinity);
    }
    if (includeZero) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    if (!Number.isFinite(lo)) [lo, hi] = [0, 1];

    const fmtAxis = axisFormat(formatProp);
    // Sideways: a name column as wide as the widest name, up to a third of the chart (40% on narrow ones; longer names are cut to fit).
    const labelCol = horizontal
      ? clamp(Math.ceil(widestName) + 16, 48, Math.max(48, Math.floor(width * (width < 400 ? 0.4 : 0.34))))
      : 0;
    const chartH = horizontal ? n * rowH + dock + 30 + (valueLabel ? 20 : 0) : height;
    const top = 10 + dock + (!horizontal && valueLabel ? 20 : 0);
    const bottom = horizontal ? 26 + (valueLabel ? 20 : 0) : 30;
    const innerH = Math.max(0, chartH - top - bottom);

    // Upright: the value axis is vertical and its tick labels decide the start margin.
    const yTicksV = horizontal ? [] : fitTicks(lo, hi, { length: innerH, axis: "y", format: fmtAxis });
    const axisW = horizontal
      ? labelCol
      : clamp(Math.ceil(yTicksV.reduce((m, tk) => Math.max(m, textWidth(fmtAxis(tk))), 0)) + 14, 28, 84);
    const M = { start: axisW, end: horizontal ? 16 : 12 };
    const innerW = Math.max(0, width - M.start - M.end);
    const ticks = horizontal ? fitTicks(lo, hi, { length: innerW, axis: "x", format: fmtAxis }) : yTicksV;
    const t0 = ticks[0] ?? lo;
    const t1 = ticks[ticks.length - 1] ?? hi;
    const sv = horizontal ? linear(t0, t1, 0, innerW) : linear(t0, t1, innerH, 0);
    const band = (horizontal ? innerH : innerW) / Math.max(1, n);
    const boxW = Math.min(24, band * 0.5);
    const slimW = 8;
    const halfMax = violin ? Math.min(band * 0.42, 64) : 0;
    const densityMax = groups.reduce((m, g) => Math.max(m, ...(g.density ?? []).map(([, d]) => d)), 0);
    const mirror = chartMirror(rtl, innerW);
    const originX = rtl ? M.end : M.start;
    // Sideways: the value labels sit side by side along the bottom, thinned so none collide.
    // Value labels stay off the group-name column (it swaps sides right to left).
    const axisLo = rtl ? -M.end : -8;
    const axisHi = rtl ? innerW + 8 : innerW + M.end;
    const xShown = horizontal
      ? axisLabelsShown(
          ticks.map((tk) => ({ x: mirror.x(sv(tk)), text: fmtAxis(tk) })),
          axisLo,
          axisHi,
        )
      : null;

    /** [x, y] of a point at category position `c` (px across the bands) and value pixel `v`. */
    const pt = (c: number, v: number): [number, number] => (horizontal ? [v, c] : [c, v]);
    /** A box across [c0, c1] × [v0, v1] as x, y, w, h. */
    const box = (c0: number, c1: number, v0: number, v1: number) => {
      const [x0, y0] = pt(Math.min(c0, c1), Math.min(v0, v1));
      const [x1, y1] = pt(Math.max(c0, c1), Math.max(v0, v1));
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    };

    const geometry = groups.map((g, i) => {
      const c = band * (i + 0.5);
      const hasViolin = Boolean(g.density && densityMax > 0);
      const w = violin && g.density ? slimW : boxW;
      const vq1 = sv(g.q1);
      const vq3 = sv(g.q3);
      const vMed = sv(g.median);
      const rect = box(c - w / 2, c + w / 2, vq1, vq3);
      const span = Math.abs(vq3 - vq1);
      // Where the box opens from: its median, as a fraction of the box along the value axis.
      const fromMedian = span > 0 ? Math.abs(vMed - Math.min(vq1, vq3)) / span : 0.5;
      const capW = Math.max(6, w * 0.5);
      const marks: GroupMark[] = [];
      if (hasViolin) {
        const side = (sign: number) =>
          (g.density ?? []).map(([v, dens]) => pt(c + sign * (dens / densityMax) * halfMax, sv(v)));
        const points = [...side(1), ...side(-1).reverse()].flat();
        marks.push({ id: "violin", kind: "poly", role: "violin", state: points, origin: "50% 50%" });
      }
      // Whiskers and caps: the upper one from Q3 to the high end, the lower one from Q1 to the low end.
      const ends = [
        { from: vq3, to: sv(g.high) },
        { from: vq1, to: sv(g.low) },
      ];
      ends.forEach((e, k) => {
        const [x1, y1] = pt(c, e.from);
        const [x2, y2] = pt(c, e.to);
        // The whisker grows out of the box: its origin is the end that touches the box.
        const atBox = horizontal ? (e.to >= e.from ? "0% 50%" : "100% 50%") : e.to >= e.from ? "50% 0%" : "50% 100%";
        marks.push({ id: `w${k}`, kind: "line", role: "whisker", state: [x1, y1, x2, y2], origin: atBox });
        if (!hasViolin) {
          const [cx1, cy1] = pt(c - capW / 2, e.to);
          const [cx2, cy2] = pt(c + capW / 2, e.to);
          marks.push({ id: `c${k}`, kind: "line", role: "cap", state: [cx1, cy1, cx2, cy2] });
        }
      });
      marks.push({
        id: "box",
        kind: "rect",
        role: "box",
        state: [rect.x, rect.y, rect.w, Math.max(rect.h, 0), hasViolin ? 3 : 4],
        origin: horizontal ? `${fromMedian * 100}% 50%` : `50% ${(1 - fromMedian) * 100}%`,
      });
      if (hasViolin) {
        const [x, y] = pt(c, vMed);
        marks.push({ id: "med", kind: "dot", role: "median", state: [x, y, 3.5] });
      } else {
        // Median gap: across the box, plus a hair beyond it.
        const [x1, y1] = pt(c - w / 2 - 1, vMed);
        const [x2, y2] = pt(c + w / 2 + 1, vMed);
        marks.push({ id: "med", kind: "line", role: "median", state: [x1, y1, x2, y2] });
      }
      if (showMean && g.mean !== null) {
        const [x, y] = pt(c, sv(g.mean));
        marks.push({ id: "mean", kind: "diamond", role: "mean", state: [x, y] });
      }
      // Outliers: dots with a surface ring, dodged sideways when they'd overlap.
      const outPx = g.outliers.map((v) => sv(v));
      const outC = dodgeOutliers(outPx, c, Math.max(boxW, band * 0.4));
      const outliers = outPx.map((v, k) => pt(outC[k] ?? 0, v));
      outliers.forEach(([x, y], k) =>
        marks.push({
          id: `o${k}`,
          kind: "dot",
          role: "outlier",
          state: [x, y, OUTLIER_R],
          origin: "50% 50%",
          outlier: k,
        }),
      );
      const reachW = Math.max(w, violin ? halfMax * 0.6 : w);
      const extentRect = box(c - reachW / 2, c + reachW / 2, sv(g.low), sv(g.high));
      return { c, marks, outliers, extentRect, hasViolin };
    });
    return {
      fmtAxis,
      labelCol,
      chartH,
      top,
      innerH,
      M,
      innerW,
      ticks,
      sv,
      band,
      mirror,
      originX,
      axisLo,
      axisHi,
      xShown,
      box,
      geometry,
    };
  }, [
    groups,
    includeZero,
    formatProp,
    horizontal,
    widestName,
    width,
    rowH,
    n,
    dock,
    valueLabel,
    height,
    violin,
    showMean,
    rtl,
  ]);

  const {
    fmtAxis,
    chartH,
    top,
    innerH,
    M,
    innerW,
    ticks,
    sv,
    band,
    mirror,
    originX,
    axisLo,
    axisHi,
    xShown,
    box,
    geometry,
  } = L;
  const delayOf = (i: number) => 0.1 + i * Math.min(0.09, 0.5 / Math.max(1, n));

  // Every mark, keyed by group and part; their numbers move in one frame loop on data changes.
  const marks = useMemo(() => {
    const out = new Map<string, MarkState>();
    if (width > 0)
      groups.forEach((g, i) => itemAt(geometry, i).marks.forEach((m) => out.set(`${g.key}\u0001${m.id}`, m.state)));
    return out;
  }, [groups, geometry, width]);
  useMarkMotion(
    layerRef,
    ghostRef,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, state) => el.setAttribute("d", markD(el.dataset.m, state)),
      entrance: (_, __, el) => {
        const role = el.dataset.role;
        const delay = delayOf(Number(el.dataset.g ?? 0));
        const valueScale = horizontal ? "scaleX(0)" : "scaleY(0)";
        const crossScale = horizontal ? "scaleY(0)" : "scaleX(0)";
        if (role === "box")
          return { keyframes: [{ transform: valueScale }, { transform: "none" }], delay, duration: duration.slow };
        if (role === "violin")
          return { keyframes: [{ transform: crossScale }, { transform: "none" }], delay, duration: duration.slow };
        if (role === "whisker")
          return {
            keyframes: [{ transform: valueScale }, { transform: "none" }],
            delay: delay + duration.slow * 0.6,
            duration: duration.base,
          };
        if (role === "cap")
          return {
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
            delay: delay + duration.slow * 0.6 + duration.base * 0.7,
            duration: duration.base,
          };
        if (role === "median")
          return {
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
            delay: delay + duration.slow * 0.5,
            duration: duration.base,
          };
        if (role === "mean")
          return { keyframes: [{ opacity: 0 }, { opacity: 1 }], delay: delay + duration.slow, duration: duration.base };
        const k = Number(el.dataset.o ?? 0);
        return {
          keyframes: [
            { opacity: 0, transform: "scale(0)" },
            { opacity: 1, transform: "none" },
          ],
          delay: delay + duration.slow + k * 0.03,
          duration: duration.base,
        };
      },
    },
  );

  const morph = useMemo(() => (reduced ? INSTANT : { duration: duration.slow, ease: changeEase }), [reduced]);

  // Layers that don't change while a group is read (so hovering never re-renders them).
  const grid = useMemo(
    () => (
      <>
        {valueLabel && (
          <text
            x={horizontal ? innerW / 2 : rtl ? innerW + M.start - 2 : -M.start + 2}
            y={horizontal ? innerH + 38 : -12}
            textAnchor={horizontal ? "middle" : rtl ? "end" : "start"}
            className="fill-sheen-fg-muted text-2xs font-medium"
          >
            {valueLabel}
          </text>
        )}
        {/* Value grid. */}
        <AnimatePresence initial={false}>
          {ticks.map((tk, ti) => {
            const p = horizontal ? mirror.x(sv(tk)) : sv(tk);
            const text = fmtAxis(tk);
            const labelled = !xShown || xShown.has(ti);
            return (
              <motion.g
                key={`t${tk}`}
                initial={horizontal ? { opacity: 0, x: p } : { opacity: 0, y: p }}
                animate={horizontal ? { opacity: 1, x: p } : { opacity: 1, y: p }}
                exit={{ opacity: 0, transition: reduced ? INSTANT : exitTransition }}
                transition={{ x: morph, y: morph, opacity: reduced ? INSTANT : { duration: duration.base } }}
              >
                {horizontal ? (
                  <>
                    <line y1={-4} y2={innerH} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                    {labelled && (
                      <text
                        y={innerH + 18}
                        textAnchor={edgeAnchor(p, textWidth(text), axisLo, axisHi)}
                        className="fill-sheen-fg-muted text-2xs tabular-nums"
                      >
                        {text}
                      </text>
                    )}
                  </>
                ) : (
                  <>
                    <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                    <text
                      x={rtl ? innerW + 10 : -10}
                      dy="0.32em"
                      textAnchor={rtl ? "start" : "end"}
                      className="fill-sheen-fg-muted text-2xs tabular-nums"
                    >
                      {text}
                    </text>
                  </>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </>
    ),
    [
      valueLabel,
      horizontal,
      innerW,
      innerH,
      rtl,
      M,
      ticks,
      mirror,
      sv,
      fmtAxis,
      xShown,
      axisLo,
      axisHi,
      reduced,
      morph,
    ],
  );

  const markLayer = useMemo(
    () => (
      <g ref={layerRef} opacity={play ? undefined : 0}>
        {width > 0 &&
          groups.map((g, i) =>
            itemAt(geometry, i).marks.map((m) => {
              const paint = markPaint(m, g.color, itemAt(geometry, i).hasViolin);
              return (
                <path
                  key={`${g.key}\u0001${m.id}`}
                  data-k={`${g.key}\u0001${m.id}`}
                  data-m={m.kind}
                  data-role={m.role}
                  data-g={i}
                  data-o={m.outlier}
                  d={markD(m.kind, m.state)}
                  {...paint}
                  // The entrance scales each mark from its own origin (the median, the box end, its centre).
                  style={
                    m.origin ? { ...paint.style, transformBox: "fill-box", transformOrigin: m.origin } : paint.style
                  }
                />
              );
            }),
          )}
      </g>
    ),
    [groups, geometry, play, width],
  );

  if (n === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active && active.g < n ? active : null;
  const actGroup = act ? groups[act.g] : undefined;
  const actGeo = act ? geometry[act.g] : undefined;
  const actOutlier = act && actGroup && act.o !== null && act.o < actGroup.outliers.length ? act.o : null;
  const readout = act && actGroup ? readoutFor(actGroup, actOutlier) : undefined;

  // Pointer: the band under the pointer; an outlier when the pointer is on it.
  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false): string | null {
    const rect = bounds.rect(event.currentTarget, fresh);
    let px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    if (rtl) px = rect.width - px;
    const along = horizontal ? py : px;
    const gi = clamp(Math.floor(along / Math.max(1, band)), 0, n - 1);
    const geo = itemAt(geometry, gi);
    const reach = event.pointerType === "mouse" ? OUTLIER_R + 3 : OUTLIER_R + 10;
    let best = -1;
    let bestD = Infinity;
    geo.outliers.forEach(([ox, oy], k) => {
      const dd = Math.hypot(ox - px, oy - py);
      if (dd < bestD) {
        bestD = dd;
        best = k;
      }
    });
    return `${gi}:${best >= 0 && bestD <= reach ? best : ""}`;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const nextGroup = horizontal ? "ArrowDown" : mirror.next;
    const prevGroup = horizontal ? "ArrowUp" : mirror.prev;
    const upValue = horizontal ? mirror.next : "ArrowUp";
    const downValue = horizontal ? mirror.prev : "ArrowDown";
    let next: Active | null | undefined;
    const g = act?.g ?? -1;
    if (event.key === nextGroup) next = { g: Math.min(n - 1, g + 1), o: null };
    else if (event.key === prevGroup) next = { g: g < 0 ? 0 : Math.max(0, g - 1), o: null };
    else if (event.key === "Home") next = { g: 0, o: null };
    else if (event.key === "End") next = { g: n - 1, o: null };
    else if ((event.key === upValue || event.key === downValue) && act) {
      const total = groups[act.g]?.outliers.length ?? 0;
      if (total === 0) {
        event.preventDefault();
        return;
      }
      const up = event.key === upValue;
      // Outliers are sorted ascending; "up" walks towards higher values, back to the box past the end.
      const o = act.o === null ? (up ? 0 : total - 1) : act.o + (up ? 1 : -1);
      next = { g: act.g, o: o < 0 || o >= total ? null : o };
    } else if (event.key === "Escape" && act) next = act.o !== null ? { g: act.g, o: null } : null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    if (!sameActive(next, act)) setActive(next);
  }

  // Tooltip anchor: the whole group (whiskers included), or the outlier.
  let tipAnchor = { x: 0, y: 0, w: 0, h: 0 };
  if (act && actGeo) {
    const o = actOutlier !== null ? actGeo.outliers[actOutlier] : undefined;
    const r = o
      ? { x: o[0] - OUTLIER_R - 2, y: o[1] - OUTLIER_R - 2, w: OUTLIER_R * 2 + 4, h: OUTLIER_R * 2 + 4 }
      : actGeo.extentRect;
    tipAnchor = { x: originX + mirror.left(r.x, r.w), y: top + r.y, w: r.w, h: r.h };
  }

  const nameRoom = horizontal ? L.labelCol - 16 : band - 6;
  const pinned = actGeo && actOutlier !== null ? actGeo.outliers[actOutlier] : undefined;
  const glowD =
    actGeo && actOutlier === null
      ? actGeo.marks.find((m) => m.role === (actGeo.hasViolin ? "violin" : "box"))
      : undefined;

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
            description={resolveInstructions(t.instructions, { horizontal })}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <defs>
              <GlowFilter id={`${id}-glow`} region={actGeo ? actGeo.extentRect : null} />
            </defs>
            <g aria-hidden transform={`translate(${originX},${top})`}>
              {grid}

              {/* Group names. */}
              {groups.map((g, i) => {
                const short = fitText(g.label, nameRoom, 12, true);
                const strong = act?.g === i;
                const c = itemAt(geometry, i).c;
                return (
                  <text
                    key={`n${g.key}`}
                    x={horizontal ? (rtl ? innerW + 12 : -12) : mirror.x(c)}
                    y={horizontal ? c : innerH + 20}
                    dy={horizontal ? "0.32em" : undefined}
                    textAnchor={horizontal ? (rtl ? "start" : "end") : "middle"}
                    className={cn("text-xs", strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
                  >
                    {short !== g.label && <title>{g.label}</title>}
                    {short}
                  </text>
                );
              })}

              {/* Hover band behind the active group. */}
              {actGeo &&
                (() => {
                  const r = box(actGeo.c - band / 2 + 3, actGeo.c + band / 2 - 3, -4, horizontal ? innerW + 4 : innerH);
                  return (
                    <rect
                      x={mirror.left(r.x, r.w)}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      rx={8}
                      fill="var(--sheen-hover)"
                      className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                    />
                  );
                })()}

              <g transform={mirror.transform} className="forced-color-adjust-none">
                {/* Dark mode: the active group glows. */}
                {glowD && actGroup && (
                  <path
                    d={markD(glowD.kind, glowD.state)}
                    style={{ fill: glowColor(actGroup.color) }}
                    filter={`url(#${id}-glow)`}
                    className="forced-colors:hidden"
                  />
                )}
                <g data-dim={act ? "" : undefined} className={dimLayerClass}>
                  {markLayer}
                </g>
                {/* Marks that leave with a data change fade out here. */}
                <g ref={ghostRef} />
                {/* The group being read, at full strength over the dimmed plot. */}
                {actGeo && actGroup && (
                  <g pointerEvents="none">
                    {actGeo.marks.map((m) => (
                      <path
                        key={m.id}
                        d={markD(
                          m.kind,
                          m.outlier !== undefined && m.outlier === actOutlier
                            ? [m.state[0] ?? 0, m.state[1] ?? 0, OUTLIER_R * 1.35]
                            : m.state,
                        )}
                        {...markPaint(m, actGroup.color, actGeo.hasViolin)}
                      />
                    ))}
                    {pinned && (
                      <>
                        <circle
                          cx={pinned[0]}
                          cy={pinned[1]}
                          r={OUTLIER_R + 5}
                          style={{ fill: glowColor(actGroup.color) }}
                          filter={`url(#${id}-glow)`}
                          className="forced-colors:hidden"
                        />
                        <circle
                          cx={pinned[0]}
                          cy={pinned[1]}
                          r={OUTLIER_R + 4}
                          fill="none"
                          stroke={actGroup.color}
                          strokeWidth={2}
                          className="forced-colors:stroke-[Highlight]"
                        />
                      </>
                    )}
                  </g>
                )}
              </g>

              {/* Hit area: the whole plot; the band under the pointer is read. */}
              <rect
                x={0}
                y={0}
                width={innerW}
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
            order={horizontal ? TIP_H : TIP_V}
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
