"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, fitTicks, useInputSource } from "./chart-fit";
import {
  axisFormat,
  barPath,
  changeEase,
  chartFocusClass,
  clamp,
  enterEase,
  exitTransition,
  linear,
  slotColor,
  useElementWidth,
  resolveInstructions,
  itemAt,
  useFirstPlay,
  curvePath,
} from "./chart-utils";
import { ChartTip, ChartValueTable, defaultCompact, defaultPercent, useEntrance } from "./heatmap";
import { useChartDirection, textWidth, usePointerReading, useHitBounds, isolate } from "./chart-pointer";
import { ChartFigure } from "./chart-figure";
import {
  sortedValues,
  distributionStats,
  silvermanBandwidth,
  kernelDensity,
  samplePoints,
  histogramBins,
} from "./kits/histogram-kit/stats";
import {
  chartMirror,
  glowColor,
  GlowFilter,
  dimLayerClass,
  useDockFits,
  useMarkMotion,
  markMap,
} from "./kits/histogram-kit/kit";
import {
  KDE_SAMPLES,
  TIP_ORDER,
  resolveMarkers,
  INSTANT,
  markersFromKey,
  NO_MARKERS,
  NO_MARKS,
  binReadout,
  edgeAnchor,
  axisLabelsShown,
  insideTicks,
  binEdgeFormat,
  defaultHistogramLabels,
  type HistogramProps,
  type MarkerLine,
  type BinReadoutContext,
} from "./histogram/model";

// The package's public statistics and label API: the shared kit (`kits/histogram-kit`) and the chart modules are
// imported from where they live, so this file re-exports only what the barrel publishes.
export {
  quantileSorted,
  distributionStats,
  kernelDensity,
  sortedValues,
  suggestedBinCount,
  histogramBins,
  type DistributionStats,
  type BinMethod,
  type HistogramBin,
  type HistogramBinOptions,
} from "./kits/histogram-kit/stats";
export {
  defaultHistogramLabels,
  histogramLegend,
  type HistogramMarker,
  type HistogramLabels,
  type HistogramProps,
  type AxisLabelSlot,
} from "./histogram/model";

/**
 * A distribution in bins: bars that touch (a 2px surface gap between neighbours: the bins are
 * adjacent intervals, not categories), an optional KDE density curve, and reference lines for the
 * median, mean and percentiles. Bins come from Freedman–Diaconis / Sturges ("auto") or a count you
 * pass, snapped to round edges.
 *
 * Hover, tap (tap again to unpin; drag to scrub) or arrow through the bins: each reads its range,
 * count, share and the cumulative share at or below it. Bars grow from the baseline in a sweep the
 * first time the chart scrolls into view, then the density curve draws in; new data or a new bin
 * count morphs the bars. Instant under reduced motion.
 *
 * Fast with many bins: the bars are plain paths animated by one frame loop (useMarkMotion), and
 * reading a bin never re-renders them (the layer dims as a whole; the active bar is redrawn on top).
 *
 * Keyboard: Tab focuses the chart; Left and Right (mirrored in right-to-left), or Down and Up, move between bins, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce each bin's range, count, share and cumulative share. `HistogramTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and morphs bars instantly.
 *
 * @example
 * ```tsx
 * import { Histogram } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Histogram
 *       values={[12, 15, 18, 18, 21, 22, 22, 24, 27, 30, 31, 35, 41]}
 *       xLabel="Response time (ms)"
 *       markers={["median"]}
 *       aria-label="Response time distribution"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function Histogram({
  values: valuesProp,
  bins: binsProp = "auto",
  domain,
  niceBins: niceProp = true,
  measure: measureProp = "count",
  bars = true,
  density: densityProp = false,
  bandwidth: bandwidthProp,
  markers = NO_MARKERS,
  color = 1,
  height = 280,
  xLabel,
  yLabel,
  format: formatProp,
  formatCount: formatCountProp,
  formatPercent: formatPercentProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<HistogramProps>) {
  const t = useMemo(() => ({ ...defaultHistogramLabels, ...labels }), [labels]);
  const id = useId();
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const layerRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const first = useFirstPlay(play && width > 0);
  const input = useInputSource();
  const docked = useDockFits(width, height);
  const [active, setActive] = useState<number | null>(null);
  const pointer = usePointerReading(active, setActive, input.fromPointer);
  const bounds = useHitBounds(width, height);

  // New data renders in the background (interruptible, in small slices): a control that changes
  // the data answers at once, and the chart follows a frame later.
  const values = useDeferredValue(valuesProp);
  const bins = useDeferredValue(binsProp);
  const niceBins = useDeferredValue(niceProp);
  const measure = useDeferredValue(measureProp);
  const density = useDeferredValue(densityProp);
  const bandwidth = useDeferredValue(bandwidthProp);
  const lo = useDeferredValue(domain?.[0]);
  const hi = useDeferredValue(domain?.[1]);
  const sorted = useMemo(() => sortedValues(values), [values]);
  const binList = useMemo(
    () =>
      histogramBins(sorted, {
        bins,
        domain: lo !== undefined && hi !== undefined ? [lo, hi] : undefined,
        nice: niceBins,
      }),
    [sorted, bins, lo, hi, niceBins],
  );
  const format = useMemo(() => formatProp ?? binEdgeFormat(binList, locale), [formatProp, binList, locale]);
  const formatCount = formatCountProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const first0 = binList[0]?.x0 ?? 0;
  const last1 = binList[binList.length - 1]?.x1 ?? 1;
  const inside = useMemo(
    () => (lo === undefined ? sorted : sorted.filter((v) => v >= first0 && v <= last1)),
    [sorted, lo, first0, last1],
  );
  const below = useMemo(() => {
    let running = 0;
    return binList.map((b) => (running += b.count));
  }, [binList]);
  const total = below[below.length - 1] ?? 0;
  const n = binList.length;

  // Density curve in the bars' units: expected count (or share) per bin width.
  const binWidth = n > 0 ? (last1 - first0) / n : 1;
  const curve = useMemo(() => {
    if (!density || inside.length < 2) return null;
    const bw = bandwidth && bandwidth > 0 ? bandwidth : silvermanBandwidth(inside);
    if (!(bw > 0)) return null;
    const xs = samplePoints(first0, last1, KDE_SAMPLES);
    const d = kernelDensity(inside, bw, xs);
    const k = measure === "percent" ? binWidth : inside.length * binWidth;
    return xs.map((x, i) => [x, (d[i] ?? 0) * k] as const);
  }, [density, inside, bandwidth, first0, last1, binWidth, measure]);

  const stats = useMemo(() => distributionStats(inside, "minmax"), [inside]);
  // Markers are often written inline (markers={["median"]}): compare them by content, so a parent's
  // re-render doesn't lay the chart out again.
  const markerKey = markers.map((m) => (typeof m === "object" ? `${m.value}\u0001${m.label}` : m)).join("\u0002");
  const markerLines = useMemo(
    () =>
      resolveMarkers(markersFromKey(markerKey), inside, t, format).filter((m) => m.value >= first0 && m.value <= last1),
    [markerKey, inside, t, format, first0, last1],
  );
  const fill = slotColor(color);
  const readoutContext: BinReadoutContext = {
    binList,
    below,
    total,
    measure,
    t,
    format,
    formatCount,
    pct,
    xLabel,
    fill,
  };

  // The docked band is sized once per data set, from every bin's readout.
  const dock = useMemo(
    () =>
      docked
        ? dockSpace(
            width,
            binList.flatMap(
              (_, i) =>
                binReadout(i, { binList, below, total, measure, t, format, formatCount, pct, xLabel, fill }) ?? [],
            ),
          )
        : 0,
    [docked, width, binList, below, total, measure, t, format, formatCount, pct, xLabel, fill],
  );

  // Layout: everything that doesn't depend on which bin is being read.
  const model = useMemo(() => {
    const share = (count: number) => (total > 0 ? count / total : 0);
    const yOf = (count: number) => (measure === "percent" ? share(count) : count);
    // Marker labels sit in one row above the plot.
    const markerRows = markerLines.length === 0 ? 0 : 1;
    const top = 8 + dock + (yLabel ? 20 : 0) + markerRows * 18;
    const bottom = 24 + (xLabel ? 20 : 0);
    const innerH = Math.max(0, height - top - bottom);
    const peak = Math.max(
      binList.reduce((m, b) => Math.max(m, yOf(b.count)), 0),
      curve ? curve.reduce((m, [, y]) => Math.max(m, y), 0) : 0,
    );
    const yFmt = measure === "percent" ? pct : axisFormat(formatCountProp ?? formatCount);
    const yTicks = fitTicks(0, peak > 0 ? peak : 1, { length: innerH, axis: "y", format: yFmt });
    const widestY = yTicks.reduce((w, tk) => Math.max(w, textWidth(yFmt(tk))), 0);
    const axisW = clamp(Math.ceil(widestY) + 14, 28, 84);
    const M = { top, bottom, start: axisW, end: 14 };
    const innerW = Math.max(0, width - M.start - M.end);
    const xFmt = axisFormat(formatProp);
    // Round ticks inside the binned range only (nice ticks may reach past the last edge).
    const xTicks = insideTicks(first0, last1, { length: innerW, axis: "x", format: xFmt });
    const sx = linear(first0, last1, 0, innerW);
    const yTop = yTicks[yTicks.length - 1] ?? 1;
    const sy = linear(0, yTop, innerH, 0);
    const mirror = chartMirror(rtl, innerW);
    const originX = rtl ? M.end : M.start;
    // Physical edges of the svg in plot coordinates (the margins swap sides right to left).
    const edgeLo = -originX;
    const edgeHi = width - originX;
    const xShown = axisLabelsShown(
      xTicks.map((tk) => ({ x: mirror.x(sx(tk)), text: xFmt(tk) })),
      edgeLo,
      edgeHi,
    );
    const geometry = binList.map((b) => {
      const x0 = sx(b.x0);
      const x1 = sx(b.x1);
      const gap = x1 - x0 >= 6 ? 2 : x1 - x0 >= 3 ? 1 : 0;
      const w = Math.max(0.5, x1 - x0 - gap);
      const y = sy(yOf(b.count));
      const h = Math.max(0, innerH - y);
      return { x: x0 + gap / 2, w, y, h, d: barPath(x0 + gap / 2, y, w, h, "top", Math.min(4, w / 2)) };
    });
    // Marker labels: one row above the plot, each at its line and kept inside the chart. A label
    // that would collide is listed under the chart instead (its line stays).
    const markerLabels: { m: MarkerLine; x: number }[] = [];
    let end = -Infinity;
    for (const m of [...markerLines].sort((a, b) => mirror.x(sx(a.value)) - mirror.x(sx(b.value)))) {
      const w = textWidth(`${m.name} `) + textWidth(m.text, 11, true);
      const left = clamp(mirror.x(sx(m.value)) - w / 2, edgeLo + 4, edgeHi - 4 - w);
      if (left < end + 10) continue;
      end = left + w;
      markerLabels.push({ m, x: left });
    }
    const hiddenMarkers = markerLines.filter((m) => !markerLabels.some((p) => p.m.key === m.key));
    const linePath = curve
      ? curvePath(
          curve.map(([x, y]) => [sx(x), clamp(sy(y), 0, innerH)] as const),
          "linear",
        )
      : "";
    const areaPath = curve
      ? `${linePath} L${sx(last1).toFixed(1)},${innerH} L${sx(first0).toFixed(1)},${innerH} Z`
      : "";
    return {
      markerRows,
      M,
      innerW,
      innerH,
      yFmt,
      yTicks,
      xFmt,
      xTicks,
      xShown,
      sx,
      sy,
      mirror,
      originX,
      edgeLo,
      edgeHi,
      geometry,
      markerLabels,
      hiddenMarkers,
      linePath,
      areaPath,
    };
  }, [
    width,
    height,
    dock,
    binList,
    total,
    measure,
    markerLines,
    yLabel,
    xLabel,
    curve,
    pct,
    formatCountProp,
    formatCount,
    formatProp,
    first0,
    last1,
    rtl,
  ]);

  const { M, innerW, innerH, mirror, originX, geometry } = model;
  const stepDelay = Math.min(0.03, 0.45 / Math.max(1, n));

  // The bars: plain paths, moved by one frame loop on data changes.
  const marks = useMemo(
    () =>
      bars
        ? markMap(
            geometry,
            (_, i) => `b${i}`,
            (g) => [g.x, g.y, g.w, g.h],
          )
        : NO_MARKS,
    [bars, geometry],
  );
  useMarkMotion(
    layerRef,
    ghostRef,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, [x = 0, y = 0, w = 0, h = 0]) => el.setAttribute("d", barPath(x, y, w, h, "top", Math.min(4, w / 2))),
      entrance: (_, key) => ({
        keyframes: [{ transform: "scaleY(0)" }, { transform: "none" }],
        delay: 0.05 + Number(key.slice(1)) * stepDelay,
      }),
      // Hundreds of bins grow as one layer from the baseline.
      layerEntrance: () => ({
        keyframes: [{ transform: "scaleY(0)" }, { transform: "none" }],
        delay: 0.05,
        duration: duration.slower,
      }),
      enterFrom: ([x = 0, , w = 0]) => [x, innerH, w, 0],
      exitTo: ([x = 0, , w = 0]) => [x, innerH, w, 0],
    },
  );

  const morph = useMemo(() => (reduced ? INSTANT : { duration: duration.slow, ease: changeEase }), [reduced]);
  const curveDelay = reduced || !first ? 0 : 0.15 + n * stepDelay;
  const markerDelay = reduced || !first ? 0 : curveDelay + (curve ? duration.slower * 0.6 : 0.2);
  const hasCurve = curve !== null;

  // Layers that don't change while a bin is read (so hovering never re-renders them).
  const grid = useMemo(
    () => (
      <>
        {yLabel && (
          <text
            x={rtl ? innerW + M.start - 2 : -M.start + 2}
            y={-12 - model.markerRows * 18}
            textAnchor={rtl ? "end" : "start"}
            className="fill-sheen-fg-muted text-2xs font-medium"
          >
            {yLabel}
          </text>
        )}
        {xLabel && (
          <text x={innerW / 2} y={innerH + 38} textAnchor="middle" className="fill-sheen-fg-muted text-2xs font-medium">
            {xLabel}
          </text>
        )}
        {/* Count grid: hairline, solid, recessive. Ticks slide when the scale changes. */}
        <AnimatePresence initial={false}>
          {model.yTicks.map((tk) => (
            <motion.g
              key={`y${tk}`}
              initial={{ opacity: 0, y: model.sy(tk) }}
              animate={{ opacity: 1, y: model.sy(tk) }}
              exit={{ opacity: 0, transition: reduced ? INSTANT : exitTransition }}
              transition={{ y: morph, opacity: reduced ? INSTANT : { duration: duration.base } }}
            >
              <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
              <text
                x={rtl ? innerW + 10 : -10}
                dy="0.32em"
                textAnchor={rtl ? "start" : "end"}
                className="fill-sheen-fg-muted text-2xs tabular-nums"
              >
                {model.yFmt(tk)}
              </text>
            </motion.g>
          ))}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {model.xTicks
            .filter((_, i) => model.xShown.has(i))
            .map((tk) => (
              <motion.text
                key={`x${tk}`}
                y={innerH + 18}
                textAnchor={edgeAnchor(mirror.x(model.sx(tk)), textWidth(model.xFmt(tk)), model.edgeLo, model.edgeHi)}
                className="fill-sheen-fg-muted text-2xs tabular-nums"
                initial={{ opacity: 0, x: mirror.x(model.sx(tk)) }}
                animate={{ opacity: 1, x: mirror.x(model.sx(tk)) }}
                exit={{ opacity: 0, transition: reduced ? INSTANT : exitTransition }}
                transition={{ x: morph, opacity: reduced ? INSTANT : { duration: duration.base } }}
              >
                {model.xFmt(tk)}
              </motion.text>
            ))}
        </AnimatePresence>
      </>
    ),
    [model, yLabel, xLabel, rtl, reduced, morph, M.start, innerH, innerW, mirror],
  );

  const barLayer = useMemo(
    () =>
      bars ? (
        <g ref={layerRef} opacity={play ? undefined : 0} className="origin-bottom [transform-box:fill-box]">
          {geometry.map((g, i) => (
            <path
              key={`b${i}`}
              data-k={`b${i}`}
              d={g.d}
              fill={`url(#${id}-bar)`}
              className="origin-bottom [transform-box:fill-box] forced-colors:stroke-[CanvasText]"
            />
          ))}
        </g>
      ) : null,
    [bars, geometry, play, id],
  );

  const curveLayer = useMemo(
    () =>
      hasCurve ? (
        <>
          {!bars && (
            <motion.path
              d={model.areaPath}
              fill={`url(#${id}-area)`}
              initial={reduced ? false : { opacity: 0, d: model.areaPath }}
              animate={play ? { opacity: 1, d: model.areaPath } : undefined}
              transition={{ d: morph, opacity: reduced ? INSTANT : { duration: duration.slower, delay: curveDelay } }}
            />
          )}
          {!bars && (
            <path
              d={model.linePath}
              fill="none"
              strokeWidth={6}
              style={{ stroke: glowColor(fill, 55) }}
              filter={`url(#${id}-glow)`}
              className="forced-colors:hidden"
            />
          )}
          {/* Over bars the curve gets a surface halo, so it never melts into them. */}
          {bars && (
            <motion.path
              fill="none"
              stroke="var(--sheen-chart-surface)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0, d: model.linePath }}
              animate={play ? { pathLength: 1, d: model.linePath } : undefined}
              transition={{
                d: morph,
                pathLength: reduced ? INSTANT : { duration: duration.slower * 1.4, ease: enterEase, delay: curveDelay },
              }}
            />
          )}
          <motion.path
            fill="none"
            stroke={bars ? "var(--sheen-fg-muted)" : fill}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="forced-colors:stroke-[CanvasText]"
            initial={reduced ? false : { pathLength: 0, d: model.linePath }}
            animate={play ? { pathLength: 1, d: model.linePath } : undefined}
            transition={{
              d: morph,
              pathLength: reduced ? INSTANT : { duration: duration.slower * 1.4, ease: enterEase, delay: curveDelay },
            }}
          />
        </>
      ) : null,
    [hasCurve, bars, model, play, reduced, morph, curveDelay, id, fill],
  );

  const markerLayer = useMemo(
    () => (
      <>
        {/* Reference lines (median, mean, percentiles, your own). */}
        {markerLines.map((m) => {
          const px = mirror.x(model.sx(m.value));
          return (
            <motion.line
              key={m.key}
              x1={px}
              x2={px}
              y1={-4}
              y2={innerH}
              stroke="var(--sheen-fg)"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              initial={reduced ? false : { opacity: 0 }}
              animate={play ? { opacity: 1 } : undefined}
              transition={reduced ? INSTANT : { duration: duration.base, delay: markerDelay }}
              className="forced-colors:stroke-[CanvasText]"
            />
          );
        })}
        {model.markerLabels.map(({ m, x }) => (
          <motion.text
            key={`l${m.key}`}
            x={x}
            y={-10}
            className="text-2xs"
            initial={reduced ? false : { opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={reduced ? INSTANT : { duration: duration.base, delay: markerDelay }}
          >
            <tspan className="fill-sheen-fg-muted">{m.name} </tspan>
            <tspan className="fill-sheen-fg font-semibold tabular-nums">{m.text}</tspan>
          </motion.text>
        ))}
      </>
    ),
    [markerLines, model, play, reduced, markerDelay, innerH, mirror],
  );

  if (n === 0 || total === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < n ? active : null;
  const readout = act !== null ? binReadout(act, readoutContext) : undefined;
  const g = act !== null ? geometry[act] : undefined;

  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    let px = event.clientX - rect.left;
    if (rtl) px = rect.width - px;
    return clamp(Math.floor((px / Math.max(1, rect.width)) * n), 0, n - 1);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const cur = act ?? -1;
    let next: number | null | undefined;
    if (event.key === mirror.next || event.key === "ArrowDown") next = Math.min(n - 1, cur + 1);
    else if (event.key === mirror.prev || event.key === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, cur - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else if (event.key === "Escape" && act !== null) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next);
  }

  const tipAnchor = g
    ? { x: originX + mirror.left(g.x, g.w), y: M.top + (bars ? g.y : 0), w: g.w, h: bars ? Math.max(1, g.h) : innerH }
    : { x: 0, y: 0, w: 0, h: 0 };
  const summary =
    stats && Number.isFinite(stats.median)
      ? t.summary(formatCount(stats.n), format(stats.median), format(stats.mean))
      : "";
  // Density-only plots: the active bin is a crosshair with a dot on the curve.
  const curvePoint = (() => {
    if (bars || !curve || act === null) return undefined;
    const b = itemAt(binList, act);
    const j = Math.round((((b.x0 + b.x1) / 2 - first0) / (last1 - first0)) * (KDE_SAMPLES - 1));
    return curve[clamp(j, 0, KDE_SAMPLES - 1)];
  })();

  // The glow only blurs around what is lit: the active bar, or the dot on a density-only curve.
  const glowRegion = curvePoint
    ? { x: model.sx(curvePoint[0]) - 9, y: model.sy(curvePoint[1]) - 9, w: 18, h: 18 }
    : g && bars
      ? { x: g.x, y: g.y, w: g.w, h: g.h }
      : !bars && hasCurve
        ? { x: 0, y: 0, w: innerW, h: innerH }
        : null;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full flex-col gap-2", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            roleDescription={t.roleDescription}
            width={width}
            height={height}
            label={ariaLabel}
            description={`${summary} ${resolveInstructions(t.instructions)}`}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <defs>
              <linearGradient id={`${id}-bar`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={fill} />
                <stop offset="100%" stopColor={fill} stopOpacity={0.72} />
              </linearGradient>
              <linearGradient id={`${id}-area`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2={innerH}>
                <stop offset="0%" stopColor={fill} stopOpacity={0.34} />
                <stop offset="100%" stopColor={fill} stopOpacity={0.02} />
              </linearGradient>
              <GlowFilter id={`${id}-glow`} region={glowRegion} />
            </defs>

            {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
            <g aria-hidden transform={`translate(${originX},${M.top})`}>
              {grid}

              {/* Hover column behind the active bin. */}
              {g && (
                <rect
                  x={mirror.left(g.x - 3, g.w + 6)}
                  y={-4}
                  width={g.w + 6}
                  height={innerH + 4}
                  rx={6}
                  fill="var(--sheen-hover)"
                  className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                />
              )}

              <g transform={mirror.transform} className="forced-color-adjust-none">
                {/* Dark mode: the active bar glows (a blurred copy behind it). */}
                {g && bars && (
                  <path
                    d={g.d}
                    style={{ fill: glowColor(fill) }}
                    filter={`url(#${id}-glow)`}
                    className="forced-colors:hidden"
                  />
                )}
                <g data-dim={g && bars ? "" : undefined} className={cn(dimLayerClass, "data-dim:opacity-50")}>
                  {barLayer}
                </g>
                {/* Bars leaving with a data change fade out here. */}
                <g ref={ghostRef} />
                {g && bars && (
                  <path
                    d={g.d}
                    fill={`url(#${id}-bar)`}
                    pointerEvents="none"
                    className="forced-colors:stroke-[Highlight]"
                  />
                )}
                {curveLayer}
                {g && curvePoint && (
                  <g pointerEvents="none">
                    <line x1={g.x + g.w / 2} x2={g.x + g.w / 2} y1={0} y2={innerH} stroke="var(--sheen-fg-subtle)" />
                    <circle
                      cx={model.sx(curvePoint[0])}
                      cy={model.sy(curvePoint[1])}
                      r={9}
                      style={{ fill: glowColor(fill) }}
                      filter={`url(#${id}-glow)`}
                      className="forced-colors:hidden"
                    />
                    <circle
                      cx={model.sx(curvePoint[0])}
                      cy={model.sy(curvePoint[1])}
                      r={4.5}
                      fill={fill}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                    />
                  </g>
                )}
              </g>

              {markerLayer}

              {/* Hit area: the whole plot; the pointer only needs to be over a bin's column. */}
              <rect
                x={0}
                y={-4}
                width={innerW}
                height={innerH + 4}
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
            bounds={{ w: width, h: height }}
            docked={docked}
            order={TIP_ORDER}
          />
        )}
      </div>
      {model.hiddenMarkers.length > 0 && (
        <p
          className="flex flex-wrap gap-x-3 gap-y-1 text-2xs text-sheen-fg-muted"
          style={{ paddingInlineStart: M.start }}
        >
          {model.hiddenMarkers.map((m) => (
            <span key={m.key}>
              {m.name} <span className="font-semibold text-sheen-fg tabular-nums">{m.text}</span>
            </span>
          ))}
        </p>
      )}
      <ChartAnnouncer
        text={input.announce(
          readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : "",
        )}
      />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of HistogramTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type HistogramTableProps = Pick<
  HistogramProps,
  | "values"
  | "bins"
  | "domain"
  | "niceBins"
  | "format"
  | "formatCount"
  | "formatPercent"
  | "locale"
  | "labels"
  | "xLabel"
> & {
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  className?: string;
};

/**
 * Every bin with its count, share and cumulative share: the colour-free twin of a Histogram.
 *
 * Props: the chart's `values`, `bins`, `domain`, `niceBins`, `format`, `formatCount`, `formatPercent`, `locale`, `labels` and `xLabel`, plus `caption` (hidden, names the table) and `className`. A real table: every bin with its count, share and cumulative share. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { HistogramTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <HistogramTable values={[12, 15, 18, 18, 21, 22, 22, 24, 27, 30, 31, 35, 41]} xLabel="Response time (ms)" caption="Response time distribution" />
 *   );
 * }
 * ```
 *
 * @see /charts/histogram
 */
export function HistogramTable({
  values,
  bins = "auto",
  domain,
  niceBins = true,
  format: formatProp,
  formatCount: formatCountProp,
  formatPercent: formatPercentProp,
  locale,
  labels,
  xLabel,
  caption,
  className,
}: HistogramTableProps) {
  const t = { ...defaultHistogramLabels, ...labels };
  const formatCount = formatCountProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const sorted = useMemo(() => sortedValues(values), [values]);
  const binList = histogramBins(sorted, { bins, domain, nice: niceBins });
  const format = formatProp ?? binEdgeFormat(binList, locale);
  const total = binList.reduce((s, b) => s + b.count, 0);
  let running = 0;
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[{ label: xLabel ?? t.bin }, { label: t.count }, { label: t.share }, { label: t.cumulativeHeader }]}
      rows={
        total === 0
          ? []
          : binList.map((b) => {
              running += b.count;
              const f = (text: string) => isolate(text);
              return [
                t.range(f(format(b.x0)), f(format(b.x1))),
                f(formatCount(b.count)),
                f(pct(b.count / total)),
                f(pct(running / total)),
              ];
            })
      }
    />
  );
}
