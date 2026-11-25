"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState } from "react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, fitTicks, useInputSource, type Readout } from "./chart-fit";
import { useCoarsePointer } from "../../hooks/use-media-query";
import {
  barPath,
  chartFocusClass,
  clamp,
  linear,
  rowKeys,
  slotColor,
  truncate,
  useElementWidth,
  resolveInstructions,
  itemAt,
  useFirstPlay,
} from "./chart-utils";
import { ChartTip, defaultCompact, defaultPercent, useContrastInk, useEntrance } from "./heatmap";
import { useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { axisLabelsShown } from "./histogram/model";
import {
  chartMirror,
  dimLayerClass,
  glowColor,
  GlowFilter,
  useDockFits,
  useFadeIn,
  useMarkMotion,
  type MarkState,
} from "./kits/histogram-kit/kit";
import { ChartFigure } from "./chart-figure";

import {
  defaultDivergingBarChartLabels,
  type DivergingBarChartProps,
  divergingLevels,
  CHAR_W,
  MAX_BAR,
  TIP,
  wrapName,
  wholePercent,
  netText,
  type LevelInfo,
  type Segment,
  type Active,
  type DivRow,
  DEFAULT_SIDES,
  NO_FILLS,
  END_CODE,
  END_NAME,
  segKey,
  parseActive,
} from "./diverging-bar-chart/model";
import { buildDivergingRows, divergingReadout } from "./diverging-bar-chart/rows";
import { DivergingGrid } from "./diverging-bar-chart/grid";

export {
  type DivergingLevel,
  type DivergingBarChartLabels,
  defaultDivergingBarChartLabels,
  type DivergingBarChartProps,
  divergingLevels,
  divergingLegend,
} from "./diverging-bar-chart/model";
export { type DivergingBarTableProps, DivergingBarTable } from "./diverging-bar-chart/table";
/**
 * Bars that diverge from a midpoint.
 *
 * - "likert" (default): survey answers or sentiment, stacked from a neutral midpoint: negative
 *   levels to one side in the red arm, positive ones to the other in the blue arm, the neutral level
 *   in grey straddling the centre. Rows sum to 100% (normalize), shares are printed inside the
 *   segments where they fit (black or white ink by contrast) and a net score follows each row.
 * - "butterfly": two groups back to back from a spine (population pyramid, before / after, A / B),
 *   on one shared scale, the row names down the middle.
 *
 * Hover, tap (tap again to unpin) or use the arrow keys: up / down between rows, left / right
 * between segments. Segments sweep out from the centre the first time the chart scrolls into view;
 * new data morphs them. Instant under reduced motion.
 *
 * Keyboard: Tab focuses the chart; Up and Down move between rows, Left and Right move between a row's segments, Home and End jump to the first and last row, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; shares are printed as text and each Likert row has a net score, so colour never carries the reading. Keyboard moves announce the row and segment. `DivergingBarTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and morphs instantly.
 *
 * @example
 * ```tsx
 * import { DivergingBarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DivergingBarChart
 *       data={[
 *         { question: "Easy to use", no: 5, neutral: 15, yes: 80 },
 *         { question: "Fast", no: 12, neutral: 18, yes: 70 },
 *       ]}
 *       index="question"
 *       levels={[
 *         { key: "no", label: "Disagree" },
 *         { key: "neutral", label: "Neutral" },
 *         { key: "yes", label: "Agree" },
 *       ]}
 *       neutral="neutral"
 *       aria-label="Survey answers by question"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/diverging-bar
 */
export function DivergingBarChart({
  data: dataProp,
  index,
  levels,
  variant = "likert",
  neutral,
  normalize,
  showNet = true,
  showValues = true,
  negativeColor = 8,
  positiveColor = 7,
  colors = DEFAULT_SIDES,
  height,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<DivergingBarChartProps>) {
  const t = useMemo(() => ({ ...defaultDivergingBarChartLabels, ...labels }), [labels]);
  const id = useId();
  const butterfly = variant === "butterfly";
  const norm = normalize ?? !butterfly;
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const pctShort = useMemo(() => formatPercentProp ?? wholePercent(locale), [formatPercentProp, locale]);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const layerRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const valuesRef = useRef<SVGGElement>(null);
  const netRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const first = useFirstPlay(play && width > 0);
  const input = useInputSource();
  const coarse = useCoarsePointer();
  const [active, setActive] = useState<string | null>(null);
  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);
  const bounds = useHitBounds(width);
  const [colorA, colorB] = colors;
  // New data renders in the background (interruptible): the control that changed it answers at once.
  const data = useDeferredValue(dataProp);

  const info = useMemo(
    () =>
      butterfly
        ? levels.slice(0, 2).map((l, i): LevelInfo => ({
            ...l,
            side: i === 0 ? "negative" : "positive",
            color: slotColor(i === 0 ? colorA : colorB),
            order: i,
          }))
        : divergingLevels(levels, { neutral, negativeColor, positiveColor }),
    [butterfly, levels, neutral, negativeColor, positiveColor, colorA, colorB],
  );
  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const ink = useContrastInk(rootRef, showValues && !butterfly ? info.map((l) => l.color) : NO_FILLS);

  // Values: Likert rows as shares of their own total; butterfly sides as counts or shares of the grand total.
  const rows = useMemo(
    () => buildDivergingRows(data, info, keys, index, butterfly, norm),
    [data, info, keys, index, butterfly, norm],
  );
  const n = rows.length;

  const readoutFor = useCallback(
    (r: DivRow, s: number): Readout => divergingReadout(r, s, { butterfly, info, norm, t, pct, format }),
    [butterfly, info, norm, t, pct, format],
  );

  /* ---------- Layout: everything that doesn't depend on the segment being read ---------- */
  const longest = rows.reduce((m, r) => Math.max(m, r.label.length), 0);
  const rowH0 = butterfly ? (height ? 0 : coarse ? 30 : 24) : (coarse ? 44 : 38) + (width > 0 && width < 480 ? 16 : 0);
  const plotH = height ?? n * rowH0 + 48;
  const docked = useDockFits(width, plotH);
  // The docked band is sized once per data set, from every segment's readout.
  const dock = useMemo(
    () =>
      docked
        ? dockSpace(
            width,
            rows.flatMap((r) => info.map((_, s) => readoutFor(r, s))),
          )
        : 0,
    [docked, width, rows, info, readoutFor],
  );

  const L = useMemo(() => {
    const narrow = width > 0 && width < 480;
    // Likert on narrow charts: names above each bar. Butterfly: names in the middle column.
    const stackedNames = !butterfly && narrow;
    const midW = butterfly ? clamp(Math.ceil(longest * CHAR_W) + 20, 40, Math.floor(width * 0.3)) : 0;
    const labelCol =
      butterfly || stackedNames ? 0 : clamp(Math.ceil(longest * CHAR_W) + 16, 48, Math.floor(width * 0.34));
    const netW = !butterfly && showNet ? 52 : 0;
    const nameRow = stackedNames ? 16 : 0;
    const rowH = butterfly ? (height ? 0 : coarse ? 30 : 24) : (coarse ? 44 : 38) + nameRow;
    const headH = butterfly ? 20 : showNet ? 18 : 4;
    const top = 6 + dock + headH;
    const bottom = 24;
    const chartH = height ?? top + n * rowH + bottom;
    const innerH = Math.max(0, chartH - top - bottom);
    const band = innerH / Math.max(1, n);
    const thickness = Math.max(2, Math.min(MAX_BAR, (band - nameRow) * (butterfly ? 0.86 : 0.62), band - nameRow - 2));
    const innerW = Math.max(0, width - labelCol - netW);
    const mirror = chartMirror(rtl, innerW);
    const originX = rtl ? netW : labelCol;
    const rowCentre = (i: number) => band * i + nameRow + (band - nameRow) / 2;

    // Butterfly: two halves with one shared scale. Likert: one symmetric scale around the centre.
    const valuePad =
      butterfly && showValues
        ? rows.reduce((m, r) => Math.max(m, ...r.plotted.map((v) => (norm ? pctShort(v) : format(v)).length)), 0) *
            6.6 +
          8
        : 0;
    const half = butterfly ? Math.max(0, (innerW - midW) / 2) : innerW / 2;
    const maxExtent = butterfly
      ? rows.reduce((m, r) => Math.max(m, r.plotted[0] ?? 0, r.plotted[1] ?? 0), 0)
      : rows.reduce((m, r) => Math.max(m, r.negSum + r.neutralVal / 2, r.posSum + r.neutralVal / 2), 0);
    const tickFmt = (v: number) => (norm ? pctShort(Math.abs(v)) : format(Math.abs(v)));
    const halfTicks = fitTicks(0, maxExtent > 0 ? maxExtent : 1, {
      length: Math.max(1, half - valuePad),
      axis: "x",
      format: tickFmt,
      labelEvery: 1,
    });
    const top1 = halfTicks[halfTicks.length - 1] ?? 1;
    const reach = linear(0, top1, 0, Math.max(0, half - valuePad));
    const spineL = butterfly ? half : innerW / 2; // logical x of the left side's spine
    const spineR = butterfly ? half + midW : innerW / 2;

    // Segments in logical (left-to-right) coordinates.
    const segments: Segment[][] = rows.map((r) => {
      if (butterfly) {
        return info.map((level, i) => {
          const len = reach(r.plotted[i] ?? 0);
          return i === 0
            ? { level, value: r.raw[0] ?? 0, share: r.shares[0] ?? 0, x0: spineL - len, x1: spineL, end: "left" }
            : { level, value: r.raw[i] ?? 0, share: r.shares[i] ?? 0, x0: spineR, x1: spineR + len, end: "right" };
        });
      }
      const out: Segment[] = info.map((level, i) => ({
        level,
        value: r.raw[i] ?? 0,
        share: r.shares[i] ?? 0,
        x0: 0,
        x1: 0,
        end: "none",
      }));
      const c = innerW / 2;
      const halfNeutral = reach(r.neutralVal / 2);
      let left = c - halfNeutral;
      let right = c + halfNeutral;
      info.forEach((l, i) => {
        if (l.side === "neutral") out[i] = { ...itemAt(out, i), x0: c - halfNeutral, x1: c + halfNeutral };
      });
      for (let i = info.length - 1; i >= 0; i--) {
        if (itemAt(info, i).side !== "negative") continue;
        const len = reach(r.plotted[i] ?? 0);
        out[i] = { ...itemAt(out, i), x0: left - len, x1: left };
        left -= len;
      }
      for (let i = 0; i < info.length; i++) {
        if (itemAt(info, i).side !== "positive") continue;
        const len = reach(r.plotted[i] ?? 0);
        out[i] = { ...itemAt(out, i), x0: right, x1: right + len };
        right += len;
      }
      // The outermost non-empty segment on each side carries the rounded data end.
      const firstNeg = out.findIndex((s) => s.level.side === "negative" && s.x1 - s.x0 > 0.5);
      let lastPos = -1;
      out.forEach((s, i) => s.level.side === "positive" && s.x1 - s.x0 > 0.5 && (lastPos = i));
      if (firstNeg >= 0) itemAt(out, firstNeg).end = "left";
      if (lastPos >= 0) itemAt(out, lastPos).end = "right";
      return out;
    });

    /**
     * A segment as numbers: physical left and right edges (2px surface gaps between touching
     * segments), top, thickness, which end is rounded, and the line it sweeps out of (the centre or
     * its spine).
     */
    const segState = (s: Segment, cy: number): MarkState => {
      const gapL = s.end === "left" || butterfly ? 0 : 1;
      const gapR = s.end === "right" || butterfly ? 0 : 1;
      const x0 = s.x0 + gapL;
      const x1 = Math.max(x0, s.x1 - gapR);
      const l = mirror.left(x0, x1 - x0);
      // The rounded end swaps sides with the mirror.
      const end = rtl ? (s.end === "left" ? "right" : s.end === "right" ? "left" : "none") : s.end;
      const anchor = mirror.x(butterfly ? (s.end === "left" ? spineL : spineR) : innerW / 2);
      return [l, l + (x1 - x0), cy - thickness / 2, thickness, END_CODE[end], anchor];
    };

    // Axis ticks: mirrored around the centre (Likert) or out from each spine (butterfly).
    const axisTicks = halfTicks.flatMap((tk, group) => {
      const out: { key: string; x: number; text: string; group: number }[] = [];
      if (tk === 0 && !butterfly) out.push({ key: "c", x: innerW / 2, text: tickFmt(0), group });
      else {
        out.push({ key: `l${tk}`, x: (butterfly ? spineL : innerW / 2) - reach(tk), text: tickFmt(tk), group });
        out.push({ key: `r${tk}`, x: (butterfly ? spineR : innerW / 2) + reach(tk), text: tickFmt(tk), group });
      }
      return out;
    });
    // Labels thin out symmetrically: a value is labelled on both sides of the centre, or on neither.
    const tickLo = -originX;
    const tickHi = innerW + (rtl ? labelCol : netW);
    const tickShown = axisLabelsShown(
      axisTicks.map((tk) => ({ x: mirror.x(tk.x), text: tk.text, group: tk.group })),
      tickLo,
      tickHi,
    );
    return {
      narrow,
      stackedNames,
      midW,
      labelCol,
      netW,
      nameRow,
      chartH,
      innerH,
      top,
      band,
      thickness,
      innerW,
      mirror,
      originX,
      rowCentre,
      spineL,
      spineR,
      segments,
      segState,
      axisTicks,
      tickLo,
      tickHi,
      tickShown,
    };
  }, [
    width,
    rtl,
    butterfly,
    longest,
    showNet,
    showValues,
    height,
    coarse,
    dock,
    n,
    rows,
    info,
    norm,
    pctShort,
    format,
  ]);

  const {
    stackedNames,
    midW,
    labelCol,
    chartH,
    innerH,
    top,
    band,
    thickness,
    innerW,
    mirror,
    originX,
    rowCentre,
    spineL,
    spineR,
    segments,
    segState,
  } = L;
  const stepDelay = Math.min(0.06, 0.6 / Math.max(1, n));

  // The segments: plain paths, swept out on first view and moved by one frame loop on data changes.
  const { marks, markRow } = useMemo(() => {
    const out = new Map<string, MarkState>();
    const row = new Map<string, number>();
    if (width > 0)
      rows.forEach((r, ri) =>
        itemAt(segments, ri).forEach((s) => {
          out.set(segKey(r.key, s.level.key), segState(s, rowCentre(ri)));
          row.set(segKey(r.key, s.level.key), ri);
        }),
      );
    return { marks: out, markRow: row };
  }, [rows, segments, segState, rowCentre, width]);
  useMarkMotion(
    layerRef,
    ghostRef,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, [l = 0, r = 0, y = 0, h = 0, e = 0]) =>
        el.setAttribute("d", barPath(l, y, Math.max(0, r - l), h, END_NAME[Math.round(e)] ?? "none", 4)),
      // Sweep out of the centre line (or the spine): the left edge slides out while the width grows.
      entrance: ([l = 0, , , , , a = 0], key) => ({
        keyframes: [{ transform: `translateX(${(a - l).toFixed(1)}px) scaleX(0)` }, { transform: "none" }],
        delay: 0.08 + (markRow.get(key) ?? 0) * stepDelay,
        duration: duration.slower,
      }),
      enterFrom: ([, , y = 0, h = 0, e = 0, a = 0]) => [a, a, y, h, e, a],
      exitTo: ([, , y = 0, h = 0, e = 0, a = 0]) => [a, a, y, h, e, a],
    },
  );
  // Values and net scores fade in once the sweep has landed.
  useFadeIn(valuesRef, play && width > 0, reduced);
  useFadeIn(netRef, play && width > 0, reduced);
  const afterDelay = useCallback(
    (ri: number) => (first ? 0.08 + ri * stepDelay + duration.slower * 0.75 : 0),
    [first, stepDelay],
  );

  // Layers that don't change while a segment is read (so hovering never re-renders them).
  const grid = useMemo(
    () => (
      <DivergingGrid
        ticks={L.axisTicks}
        tickShown={L.tickShown}
        tickLo={L.tickLo}
        tickHi={L.tickHi}
        mirrorX={mirror.x}
        innerW={innerW}
        innerH={innerH}
        butterfly={butterfly}
        spineL={spineL}
        spineR={spineR}
        info={info}
        rtl={rtl}
        showNet={showNet}
        netLabel={t.net}
      />
    ),
    [L, mirror, innerH, innerW, butterfly, spineL, spineR, info, rtl, showNet, t.net],
  );

  const segmentLayer = useMemo(
    () => (
      <g ref={layerRef} opacity={play ? undefined : 0}>
        {width > 0 &&
          rows.map((r, ri) =>
            itemAt(segments, ri).map((s) => {
              const [l = 0, rr = 0, y = 0, h = 0, e = 0] = segState(s, rowCentre(ri));
              return (
                <path
                  key={segKey(r.key, s.level.key)}
                  data-k={segKey(r.key, s.level.key)}
                  d={barPath(l, y, Math.max(0, rr - l), h, END_NAME[e] ?? "none", 4)}
                  style={{ fill: s.level.color }}
                  className="origin-left [transform-box:fill-box] forced-colors:stroke-[CanvasText]"
                />
              );
            }),
          )}
      </g>
    ),
    [rows, segments, segState, rowCentre, play, width],
  );

  // In-segment shares (Likert) where they fit, values past the bar ends (butterfly), net scores.
  const valueLayer = useMemo(
    () => (
      <g ref={valuesRef} opacity={play ? undefined : 0} pointerEvents="none">
        {rows.map((r, ri) => {
          const cy = rowCentre(ri);
          const delay = afterDelay(ri);
          return (
            <g key={r.key}>
              {showValues &&
                !butterfly &&
                itemAt(segments, ri).map((s) => {
                  const text = pctShort(s.share);
                  if (s.x1 - s.x0 - 2 < text.length * 6.4 + 8) return null;
                  return (
                    <text
                      key={s.level.key}
                      data-delay={delay}
                      x={mirror.x((s.x0 + s.x1) / 2)}
                      y={cy}
                      dy="0.32em"
                      textAnchor="middle"
                      className={cn(
                        "text-2xs font-semibold tabular-nums forced-colors:fill-[CanvasText]",
                        ink(s.level.color) === "light" ? "fill-sheen-ink-on-dark" : "fill-sheen-ink-on-light",
                      )}
                    >
                      {text}
                    </text>
                  );
                })}
              {showValues &&
                butterfly &&
                itemAt(segments, ri).map((s, si) => (
                  <text
                    key={s.level.key}
                    data-delay={delay}
                    x={mirror.x(si === 0 ? s.x0 - 6 : s.x1 + 6)}
                    y={cy}
                    dy="0.32em"
                    textAnchor={(si === 0) !== rtl ? "end" : "start"}
                    className="fill-sheen-fg-muted text-2xs tabular-nums"
                  >
                    {norm ? pctShort(s.share) : format(s.value)}
                  </text>
                ))}
            </g>
          );
        })}
      </g>
    ),
    [rows, segments, rowCentre, mirror, showValues, butterfly, pctShort, ink, rtl, norm, format, play, afterDelay],
  );

  const netLayer = useMemo(
    () =>
      !butterfly && showNet ? (
        <g ref={netRef} opacity={play ? undefined : 0}>
          {rows.map((r, ri) => (
            <text
              key={r.key}
              data-delay={afterDelay(ri)}
              x={rtl ? -10 : innerW + 10}
              y={rowCentre(ri)}
              dy="0.32em"
              textAnchor={rtl ? "end" : "start"}
              className="fill-sheen-fg text-xs font-semibold tabular-nums"
            >
              {netText(r.net, pctShort)}
            </text>
          ))}
        </g>
      ) : null,
    [butterfly, showNet, rows, rowCentre, rtl, innerW, pctShort, play, afterDelay],
  );

  if (n === 0 || info.length === 0) {
    return (
      <ChartEmpty height={height ?? 200} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = parseActive(active, n, info.length);
  const actRow = act ? rows[act.r] : undefined;
  const readout = act && actRow ? readoutFor(actRow, act.s) : undefined;
  const actSeg = act ? segments[act.r]?.[act.s] : undefined;

  // Visual order of a row's segments (for left / right keys): non-empty ones, left to right on screen.
  const visualOrder = (ri: number) =>
    (segments[ri] ?? [])
      .map((s, i) => ({ i, x: mirror.x((s.x0 + s.x1) / 2), w: s.x1 - s.x0 }))
      .filter((s) => s.w > 0.5)
      .sort((a, b) => a.x - b.x)
      .map((s) => s.i);

  /** The segment under (or nearest to) the pointer. The hit rect starts `originX - 4` px before the plot. */
  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false): string | null {
    const rect = bounds.rect(event.currentTarget, fresh);
    const px = event.clientX - rect.left - (originX - 4);
    const py = event.clientY - rect.top;
    const ri = clamp(Math.floor(py / Math.max(1, band)), 0, n - 1);
    const segs = segments[ri] ?? [];
    let best = -1;
    let bestD = Infinity;
    segs.forEach((s, i) => {
      if (s.x1 - s.x0 <= 0.5) return;
      const a = mirror.x(s.x0);
      const b = mirror.x(s.x1);
      const d = px < Math.min(a, b) ? Math.min(a, b) - px : px > Math.max(a, b) ? px - Math.max(a, b) : 0;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best < 0) best = butterfly ? (mirror.x(px) < innerW / 2 ? 0 : 1) : (visualOrder(ri)[0] ?? 0);
    return `${ri}:${best}`;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    let next: Active | null | undefined;
    const ri = act?.r ?? -1;
    const pick = (r: number, prefer?: number) => {
      const order = visualOrder(r);
      if (order.length === 0) return 0;
      if (prefer !== undefined && order.includes(prefer)) return prefer;
      // Default: the first positive (Likert) or the left side (butterfly).
      return butterfly ? (order[0] ?? 0) : (order.find((i) => itemAt(info, i).side === "positive") ?? order[0] ?? 0);
    };
    if (event.key === "ArrowDown") next = { r: Math.min(n - 1, ri + 1), s: pick(Math.min(n - 1, ri + 1), act?.s) };
    else if (event.key === "ArrowUp")
      next = { r: ri < 0 ? 0 : Math.max(0, ri - 1), s: pick(ri < 0 ? 0 : Math.max(0, ri - 1), act?.s) };
    else if (event.key === "Home") next = { r: 0, s: pick(0, act?.s) };
    else if (event.key === "End") next = { r: n - 1, s: pick(n - 1, act?.s) };
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const r = act?.r ?? 0;
      const order = visualOrder(r);
      if (order.length === 0) return;
      const at = act ? order.indexOf(act.s) : -1;
      const k = event.key === "ArrowRight" ? Math.min(order.length - 1, at + 1) : at < 0 ? 0 : Math.max(0, at - 1);
      next = { r, s: order[k] ?? 0 };
    } else if (event.key === "Escape" && act) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next ? `${next.r}:${next.s}` : null);
  }

  // The active segment, redrawn at full strength over the dimmed layer.
  const actState = act && actSeg ? segState(actSeg, rowCentre(act.r)) : null;
  const actPath = actState
    ? barPath(
        actState[0] ?? 0,
        actState[2] ?? 0,
        Math.max(0, (actState[1] ?? 0) - (actState[0] ?? 0)),
        actState[3] ?? 0,
        END_NAME[actState[4] ?? 0] ?? "none",
        4,
      )
    : "";
  let tipAnchor = { x: 0, y: 0, w: 0, h: 0 };
  if (act && actSeg) {
    const x = mirror.left(actSeg.x0, Math.max(1, actSeg.x1 - actSeg.x0));
    tipAnchor = {
      x: originX + x,
      y: top + rowCentre(act.r) - thickness / 2 - 2,
      w: Math.max(1, actSeg.x1 - actSeg.x0),
      h: thickness + 4,
    };
  }
  const actText = act && actSeg && showValues && !butterfly ? pctShort(actSeg.share) : "";
  const actTextFits = actSeg ? actSeg.x1 - actSeg.x0 - 2 >= actText.length * 6.4 + 8 : false;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: chartH }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={chartH}
            roleDescription={t.roleDescription(butterfly)}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
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
                region={
                  actState
                    ? {
                        x: actState[0] ?? 0,
                        y: actState[2] ?? 0,
                        w: (actState[1] ?? 0) - (actState[0] ?? 0),
                        h: actState[3] ?? 0,
                      }
                    : null
                }
              />
            </defs>
            <g aria-hidden transform={`translate(${originX},${top})`}>
              {grid}

              {act && (
                <rect
                  x={-originX + 4}
                  y={band * act.r + 1}
                  width={width - 8}
                  height={band - 2}
                  rx={8}
                  fill="var(--sheen-hover)"
                  className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                />
              )}

              {/* Row names: left column (two lines when long), above the bar (narrow), or the middle column (butterfly). */}
              {rows.map((r, ri) => {
                const cy = rowCentre(ri);
                const lines =
                  butterfly || stackedNames
                    ? [
                        truncate(
                          r.label,
                          butterfly ? Math.max(3, Math.floor((midW - 12) / CHAR_W)) : Math.floor(width / CHAR_W),
                        ),
                      ]
                    : wrapName(r.label, Math.max(4, Math.floor((labelCol - 14) / CHAR_W)));
                return (
                  <text
                    key={r.key}
                    x={
                      butterfly
                        ? mirror.x((spineL + spineR) / 2)
                        : stackedNames
                          ? rtl
                            ? innerW
                            : 0
                          : rtl
                            ? innerW + 12
                            : -12
                    }
                    y={stackedNames ? band * ri + 12 : cy - (lines.length - 1) * 7}
                    dy={stackedNames || lines.length > 1 ? 0 : "0.32em"}
                    textAnchor={butterfly ? "middle" : stackedNames ? (rtl ? "end" : "start") : rtl ? "start" : "end"}
                    className={cn("text-xs", act?.r === ri ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
                  >
                    {lines.join(" ") !== r.label && <title>{r.label}</title>}
                    {lines.length === 1
                      ? lines[0]
                      : lines.map((line, k) => (
                          <tspan key={k} x={rtl ? innerW + 12 : -12} dy={k === 0 ? "0.32em" : 14}>
                            {line}
                          </tspan>
                        ))}
                  </text>
                );
              })}

              {/* Segments and their values step back as one layer while a segment is read. */}
              <g className="forced-color-adjust-none">
                {actPath && actSeg && (
                  <path
                    d={actPath}
                    style={{ fill: glowColor(actSeg.level.color) }}
                    filter={`url(#${id}-glow)`}
                    className="forced-colors:hidden"
                  />
                )}
                <g data-dim={act ? "" : undefined} className={cn(dimLayerClass, "data-dim:opacity-50")}>
                  {segmentLayer}
                  {valueLayer}
                </g>
                {/* Segments of rows that leave with a data change fade out here. */}
                <g ref={ghostRef} />
                {actPath && actSeg && act && (
                  <g pointerEvents="none">
                    <path
                      d={actPath}
                      style={{ fill: actSeg.level.color }}
                      className="forced-colors:stroke-[Highlight]"
                    />
                    {actText && actTextFits && (
                      <text
                        x={mirror.x((actSeg.x0 + actSeg.x1) / 2)}
                        y={rowCentre(act.r)}
                        dy="0.32em"
                        textAnchor="middle"
                        className={cn(
                          "text-2xs font-semibold tabular-nums forced-colors:fill-[CanvasText]",
                          ink(actSeg.level.color) === "light" ? "fill-sheen-ink-on-dark" : "fill-sheen-ink-on-light",
                        )}
                      >
                        {actText}
                      </text>
                    )}
                  </g>
                )}
              </g>
              {netLayer}

              <rect
                x={-originX + 4}
                y={0}
                width={width - 8}
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
