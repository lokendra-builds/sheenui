"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState } from "react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, useInputSource, type Readout } from "./chart-fit";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { chartFocusClass, clamp, useElementWidth, resolveInstructions, itemAt } from "./chart-utils";
import { ChartTip, defaultCompact, defaultPercent, useEntrance } from "./heatmap";
import { isolate, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import {
  fitText,
  glowColor,
  GlowFilter,
  signedText,
  useDockFits,
  useMarkMotion,
  type MarkState,
} from "./kits/histogram-kit/kit";
import { ChartFigure } from "./chart-figure";

import {
  defaultDumbbellChartLabels,
  type DumbbellChartProps,
  dumbbellColors,
  FROM_R,
  TO_R,
  DIMMED,
  TIP,
  type Row,
  resolveRows,
  arrowOf,
  dotPath,
  barD,
  rowDimClass,
  centreOrigin,
} from "./dumbbell-chart/model";
import { dumbbellEntrance, writeDumbbellMark } from "./dumbbell-chart/motion";
import { DumbbellAxis } from "./dumbbell-chart/axis";
import { computeDumbbellLayout, computeSlopeLayout, dumbbellDomain } from "./dumbbell-chart/layout";
import { SLOPE_TIP, ChangeText, SlopeLabels } from "./dumbbell-chart/parts";

export {
  type DumbbellItem,
  type DumbbellChartLabels,
  defaultDumbbellChartLabels,
  type DumbbellChartProps,
  dumbbellColors,
  dumbbellLegend,
  spreadLabels,
} from "./dumbbell-chart/model";
export { type DumbbellTableProps, DumbbellTable } from "./dumbbell-chart/table";
/**
 * Before → after for each item. The dumbbell joins a light "before" dot to a full-colour "after"
 * dot with a bar that brightens in the direction of travel; the slope variant puts the two ends in
 * columns and joins them with lines, labels spread so none collide. Each change is printed with
 * ▲ / ▼ and, by `higherIsBetter`, a success or danger tone, so colour never carries it alone.
 *
 * Hover, tap (tap again to unpin) or arrow through the items. On first view the "after" dot travels
 * out from the "before" dot (slope lines draw left to right); new data glides; re-sorting slides
 * the rows. Instant under reduced motion.
 *
 * Fast: rows are plain SVG moved by one frame loop (useMarkMotion), and reading a row never
 * re-renders them (the others step back with one opacity change each; the row is redrawn on top).
 *
 * Keyboard: Tab focuses the chart; Up and Down move between items, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; every change is printed with an up or down arrow and a success or danger tone (by `higherIsBetter`), so colour never carries it alone. `DumbbellTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws, glides and re-sorts instantly.
 *
 * @example
 * ```tsx
 * import { DumbbellChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DumbbellChart
 *       data={[
 *         { label: "Checkout", from: 3.2, to: 4.1 },
 *         { label: "Search", from: 2.8, to: 3.5 },
 *         { label: "Onboarding", from: 3.9, to: 3.6 },
 *       ]}
 *       fromLabel="Q1"
 *       toLabel="Q2"
 *       aria-label="Satisfaction score, Q1 to Q2"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/dumbbell
 */
export function DumbbellChart({
  data: dataProp,
  variant = "dumbbell",
  fromLabel,
  toLabel,
  sort: sortProp = "none",
  higherIsBetter = true,
  change: changeProp = "absolute",
  highlight,
  color = 1,
  includeZero = false,
  height = 340,
  valueLabel,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<DumbbellChartProps>) {
  const t = useMemo(() => ({ ...defaultDumbbellChartLabels, ...labels }), [labels]);
  const id = useId();
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const layerRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const input = useInputSource();
  const coarse = useCoarsePointer();
  const [active, setActive] = useState<string | null>(null);
  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);
  const bounds = useHitBounds(width);
  // New data renders in the background (interruptible): the control that changed it answers at once.
  const data = useDeferredValue(dataProp);
  const sort = useDeferredValue(sortProp);
  const change = useDeferredValue(changeProp);
  const slope = variant === "slope";
  const fromName = fromLabel ?? t.from;
  const toName = toLabel ?? t.to;
  const highlightKey = highlight === undefined ? null : Array.isArray(highlight) ? highlight.join("\u0001") : highlight;
  const rows = useMemo(
    () => resolveRows(data, sort, highlightKey === null ? null : highlightKey.split("\u0001")),
    [data, sort, highlightKey],
  );
  const n = rows.length;
  const colors = useMemo(() => dumbbellColors(color), [color]);
  const colorsOf = useCallback((r: Pick<Row, "dimmed">) => (r.dimmed ? DIMMED : colors), [colors]);

  const signed = signedText;
  const changeText = useCallback(
    (r: Row) =>
      r.diff === 0
        ? t.noChange
        : change === "percent"
          ? Number.isFinite(r.ratio)
            ? signed(r.ratio, pct(r.ratio))
            : "–"
          : signed(r.diff, format(r.diff)),
    [t, change, pct, format, signed],
  );
  const tone = useCallback(
    (r: Row) =>
      r.diff === 0
        ? "fill-sheen-fg-muted"
        : r.diff > 0 === higherIsBetter
          ? "fill-sheen-success-text"
          : "fill-sheen-danger-text",
    [higherIsBetter],
  );

  const readoutFor = useCallback(
    (r: Row): Readout => {
      const c = colorsOf(r);
      const out: TooltipRow[] = [
        { label: toName, value: isolate(format(r.to)), color: c.to, kind: "rect" },
        { label: fromName, value: isolate(format(r.from)), color: c.from, kind: "rect" },
        {
          label: t.change,
          value: r.diff === 0 ? t.noChange : isolate(signed(r.diff, format(r.diff))),
          color: "transparent",
        },
      ];
      if (r.diff !== 0 && Number.isFinite(r.ratio))
        out.push({ label: t.percentChange, value: isolate(signed(r.ratio, pct(r.ratio))), color: "transparent" });
      return { title: r.label, rows: out };
    },
    [colorsOf, toName, fromName, format, pct, t, signed],
  );
  const rowH = coarse ? 44 : 36;
  // Touch screens dock the readout above the plot, unless the plot is too tall for that band to stay in view.
  const docked = useDockFits(width, slope ? height : n * rowH + 26);
  const dock = useMemo(() => (docked ? dockSpace(width, rows.map(readoutFor)) : 0), [docked, width, rows, readoutFor]);

  // Value domain.
  const [lo, hi] = useMemo(() => dumbbellDomain(rows, includeZero), [rows, includeZero]);

  const step = Math.min(0.06, 0.6 / Math.max(1, n));
  const act = active !== null ? rows.findIndex((r) => r.key === active) : -1;
  const actRow = act >= 0 ? rows[act] : undefined;
  const readout = actRow ? readoutFor(actRow) : undefined;

  /* ---------- Slope chart layout ---------- */
  const S = useMemo(
    () => (slope ? computeSlopeLayout({ rows, width, height, dock, valueLabel, lo, hi, format, rtl, n }) : null),
    [slope, width, dock, valueLabel, height, lo, hi, rows, format, rtl, n],
  );

  /* ---------- Dumbbell layout ---------- */
  const B = useMemo(
    () =>
      slope
        ? null
        : computeDumbbellLayout({
            rows,
            width,
            change,
            changeText,
            dock,
            n,
            rowH,
            valueLabel,
            formatProp,
            lo,
            hi,
            rtl,
          }),
    [slope, rows, width, change, changeText, dock, n, rowH, valueLabel, formatProp, lo, hi, rtl],
  );

  // Each row's numbers (where it sits and where its ends are), moved by one frame loop on data changes.
  const marks = useMemo(() => {
    const out = new Map<string, MarkState>();
    if (width <= 0) return out;
    rows.forEach((r, i) => {
      if (S) out.set(r.key, [S.sy(r.from), S.sy(r.to), S.leftY[i] ?? 0, S.rightY[i] ?? 0]);
      else if (B) out.set(r.key, [rowH * (i + 0.5), B.X(r.from), B.X(r.to)]);
    });
    return out;
  }, [rows, S, B, rowH, width]);
  const rowIndex = useMemo(() => new Map(rows.map((r, i) => [r.key, i])), [rows]);

  useMarkMotion(
    layerRef,
    ghostRef,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, s) => writeDumbbellMark(S, el, s),
      entrance: (s, key, el) => dumbbellEntrance(S, step, rowIndex.get(key) ?? 0, s, el),
      // Long lists (each row animates several parts) sweep in as one layer, in reading order.
      maxEntrance: slope ? 16 : 24,
      layerEntrance: () => ({
        keyframes: [
          { clipPath: rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", opacity: 0.4 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        delay: 0.1,
        duration: duration.slower * 1.4,
      }),
    },
  );

  // The rows, rendered once per data set and size: reading a row never re-renders them.
  const rowLayer = useMemo(() => {
    if (width <= 0) return null;
    if (S) {
      return rows.map((r, i) => {
        const c = colorsOf(r);
        const y1 = S.sy(r.from);
        const y2 = S.sy(r.to);
        const gid = `${id}-s${i}`;
        const strong = highlightKey !== null && !r.dimmed;
        const name = fitText(r.label, S.nameW, 12, true);
        const shown = S.spreadOk || !r.dimmed;
        return (
          <g key={r.key} data-k={r.key}>
            <defs>
              <linearGradient
                data-part="grad"
                id={gid}
                gradientUnits="userSpaceOnUse"
                x1={S.xL}
                x2={S.xR}
                y1={y1}
                y2={y2}
              >
                <stop offset="0%" stopColor={c.from} />
                <stop offset="100%" stopColor={c.to} />
              </linearGradient>
            </defs>
            <g className={rowDimClass}>
              <path
                data-part="line"
                d={`M${S.xL},${y1.toFixed(1)} L${S.xR},${y2.toFixed(1)}`}
                fill="none"
                stroke={`url(#${gid})`}
                strokeWidth={2}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                className="forced-color-adjust-none forced-colors:stroke-[CanvasText]"
              />
              <path
                data-part="from"
                d={dotPath(S.xL, y1, FROM_R)}
                fill={c.from}
                stroke="var(--sheen-chart-surface)"
                strokeWidth={2}
                style={centreOrigin}
                className="forced-color-adjust-none forced-colors:fill-[CanvasText]"
              />
              <path
                data-part="to"
                d={dotPath(S.xR, y2, TO_R)}
                fill={c.to}
                stroke="var(--sheen-chart-surface)"
                strokeWidth={2}
                style={centreOrigin}
                className="forced-color-adjust-none forced-colors:fill-[CanvasText]"
              />
              {shown && <SlopeLabels row={r} name={name} strong={strong} S={S} i={i} format={format} />}
            </g>
          </g>
        );
      });
    }
    if (!B) return null;
    return rows.map((r, i) => {
      const c = colorsOf(r);
      const xa = B.X(r.from);
      const xb = B.X(r.to);
      const strong = highlightKey !== null && !r.dimmed;
      const short = fitText(r.label, B.labelCol - 16, 12, true);
      return (
        <g key={r.key} data-k={r.key} transform={`translate(0 ${(rowH * (i + 0.5)).toFixed(1)})`}>
          <text
            x={rtl ? B.innerW + 12 : -12}
            dy="0.32em"
            textAnchor={rtl ? "start" : "end"}
            className={cn("text-xs", strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
          >
            {short !== r.label && <title>{r.label}</title>}
            {short}
          </text>
          <g className={cn("forced-color-adjust-none", rowDimClass)}>
            {/* The bar between the ends brightens in the direction of travel. */}
            <path
              data-part="bar"
              d={barD(xa, xb)}
              fill={`url(#${id}-${r.to >= r.from ? "up" : "down"}-${r.dimmed ? "d" : "c"})`}
              style={{ transformBox: "fill-box", transformOrigin: xa <= xb ? "left center" : "right center" }}
              className="forced-colors:fill-[CanvasText]"
            />
            <path
              data-part="from"
              d={dotPath(xa, 0, FROM_R)}
              fill={c.from}
              stroke="var(--sheen-chart-surface)"
              strokeWidth={2}
              style={centreOrigin}
              className="forced-colors:fill-[CanvasText]"
            />
            <path
              data-part="to"
              d={dotPath(xb, 0, TO_R)}
              fill={c.to}
              stroke="var(--sheen-chart-surface)"
              strokeWidth={2}
              style={centreOrigin}
              className="forced-colors:fill-[CanvasText]"
            />
            {change !== "none" && (
              <ChangeText
                data-part="chg"
                row={r}
                x={rtl ? -10 : B.innerW + 10}
                rtl={rtl}
                text={changeText(r)}
                arrow={arrowOf(r)}
                tone={tone(r)}
              />
            )}
          </g>
        </g>
      );
    });
  }, [rows, S, B, width, id, highlightKey, colorsOf, format, rtl, rowH, change, changeText, tone]);

  const grid = useMemo(
    () => (B ? <DumbbellAxis layout={B} valueLabel={valueLabel} reduced={reduced} /> : null),
    [B, valueLabel, reduced],
  );

  if (n === 0) {
    return (
      <ChartEmpty height={slope ? height : 160} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  function onKeyDown(event: React.KeyboardEvent, order: number[]) {
    const at = act >= 0 ? order.indexOf(act) : -1;
    let k: number | null | undefined;
    if (event.key === "ArrowDown") k = Math.min(n - 1, at + 1);
    else if (event.key === "ArrowUp") k = at < 0 ? 0 : Math.max(0, at - 1);
    else if (event.key === "Home") k = 0;
    else if (event.key === "End") k = n - 1;
    else if (event.key === "Escape" && act >= 0) k = null;
    if (k === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(k === null ? null : (rows[order[k] ?? 0]?.key ?? null));
  }

  const announcer = (
    <ChartAnnouncer
      text={input.announce(
        readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : "",
      )}
    />
  );
  const layer = (
    <g ref={layerRef} data-dim={act >= 0 ? "" : undefined} className="group" opacity={play ? undefined : 0}>
      {rowLayer}
    </g>
  );

  /* ---------------- Slope chart ---------------- */
  if (S) {
    const { top, innerH, xL, xR, sy, leftY, rightY, nameW } = S;

    function hitSlope(event: React.PointerEvent<SVGRectElement>, fresh = false) {
      const rect = bounds.rect(event.currentTarget, fresh);
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top - top;
      const k = clamp((px - Math.min(xL, xR)) / Math.max(1, Math.abs(xR - xL)), 0, 1);
      const kk = rtl ? 1 - k : k;
      let best = -1;
      let bestD = Infinity;
      rows.forEach((r, i) => {
        const y = sy(r.from) + (sy(r.to) - sy(r.from)) * kk;
        // Labels count too: a pointer on a name reads that line.
        const dy = Math.min(
          Math.abs(y - py),
          Math.abs((kk < 0.5 ? (leftY[i] ?? 0) : (rightY[i] ?? 0)) - py) +
            (px < Math.min(xL, xR) || px > Math.max(xL, xR) ? 0 : 6),
        );
        if (dy < bestD) {
          bestD = dy;
          best = i;
        }
      });
      return best >= 0 && bestD <= (event.pointerType === "mouse" ? 14 : 22) ? itemAt(rows, best).key : null;
    }

    const tipAnchor = actRow
      ? {
          x: Math.min(xL, xR),
          y: top + Math.min(sy(actRow.from), sy(actRow.to)) - 8,
          w: Math.abs(xR - xL),
          h: Math.abs(sy(actRow.to) - sy(actRow.from)) + 16,
        }
      : { x: 0, y: 0, w: 0, h: 0 };
    const ac = actRow ? colorsOf(actRow) : null;
    const ay1 = actRow ? sy(actRow.from) : 0;
    const ay2 = actRow ? sy(actRow.to) : 0;

    return (
      <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
        <div ref={measureRef} className="relative w-full" style={{ height }}>
          {width > 0 && (
            <ChartFigure
              as="svg"
              width={width}
              height={height}
              roleDescription={t.roleDescription(true)}
              label={ariaLabel}
              description={resolveInstructions(t.instructions)}
              tabIndex={0}
              direction="ltr"
              onKeyDown={(e) => onKeyDown(e, S.orderTopDown)}
              onBlur={() => setActive(null)}
              className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
            >
              <defs>
                <GlowFilter
                  id={`${id}-glow`}
                  blur={4}
                  region={
                    actRow
                      ? { x: Math.min(xL, xR), y: Math.min(ay1, ay2), w: Math.abs(xR - xL), h: Math.abs(ay2 - ay1) }
                      : null
                  }
                />
                {actRow && ac && (
                  <linearGradient id={`${id}-active`} gradientUnits="userSpaceOnUse" x1={xL} x2={xR} y1={ay1} y2={ay2}>
                    <stop offset="0%" stopColor={ac.from} />
                    <stop offset="100%" stopColor={ac.to} />
                  </linearGradient>
                )}
              </defs>
              <g aria-hidden>
                {/* Column heads and axes. */}
                {[
                  { x: xL, name: fromName },
                  { x: xR, name: toName },
                ].map((col) => (
                  <g key={col.name}>
                    <line x1={col.x} x2={col.x} y1={top - 8} y2={top + innerH + 8} stroke="var(--sheen-border)" />
                    <text x={col.x} y={dock + 14} textAnchor="middle" className="fill-sheen-fg text-xs font-semibold">
                      {col.name}
                    </text>
                  </g>
                ))}
                {valueLabel && (
                  <text
                    x={width / 2}
                    y={height - 4}
                    textAnchor="middle"
                    className="fill-sheen-fg-muted text-2xs font-medium"
                  >
                    {valueLabel}
                  </text>
                )}

                <g transform={`translate(0,${top})`}>
                  {layer}
                  <g ref={ghostRef} />
                  {/* The line being read, at full strength over the others. */}
                  {actRow && ac && (
                    <g pointerEvents="none" className="forced-color-adjust-none">
                      <path
                        d={`M${xL},${ay1} L${xR},${ay2}`}
                        fill="none"
                        strokeWidth={6}
                        strokeLinecap="round"
                        style={{ stroke: glowColor(ac.to) }}
                        filter={`url(#${id}-glow)`}
                        className="forced-colors:hidden"
                      />
                      <path
                        d={`M${xL},${ay1} L${xR},${ay2}`}
                        fill="none"
                        stroke={`url(#${id}-active)`}
                        strokeWidth={3}
                        strokeLinecap="round"
                        className="forced-colors:stroke-[Highlight]"
                      />
                      <path
                        d={dotPath(xL, ay1, FROM_R)}
                        fill={ac.from}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                        className="forced-colors:fill-[CanvasText]"
                      />
                      <path
                        d={dotPath(xR, ay2, TO_R * 1.2)}
                        fill={ac.to}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                        className="forced-colors:fill-[CanvasText]"
                      />
                      <SlopeLabels
                        row={actRow}
                        name={fitText(actRow.label, nameW, 12, true)}
                        strong
                        S={S}
                        i={act}
                        format={format}
                        at={[leftY[act] ?? 0, rightY[act] ?? 0]}
                      />
                    </g>
                  )}
                  <rect
                    x={0}
                    y={-top + dock}
                    width={width}
                    height={innerH + top - dock + 8}
                    fill="transparent"
                    style={{ touchAction: "pan-y pinch-zoom" }}
                    onPointerEnter={bounds.reset}
                    onPointerDown={(e) => pointer.down(e, hitSlope(e, true))}
                    onPointerMove={(e) => pointer.move(e, hitSlope(e))}
                    onPointerUp={pointer.up}
                    onPointerLeave={pointer.leave}
                  />
                </g>
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
              order={SLOPE_TIP}
            />
          )}
        </div>
        {announcer}
      </div>
    );
  }

  /* ---------------- Dumbbell ---------------- */
  // B is only null in the slope layout, which returned above.
  if (!B) return null;
  const { labelCol, top, chartH, innerH, M, innerW, X, originX } = B;
  const centre = (i: number) => rowH * (i + 0.5);

  function hitRow(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    return rows[clamp(Math.floor((event.clientY - rect.top) / rowH), 0, n - 1)]?.key ?? null;
  }

  let tipAnchor = { x: 0, y: 0, w: 0, h: 0 };
  if (actRow) {
    const a = Math.min(X(actRow.from), X(actRow.to)) - TO_R;
    const b = Math.max(X(actRow.from), X(actRow.to)) + TO_R;
    tipAnchor = { x: originX + a, y: top + centre(act) - rowH / 2 + 4, w: b - a, h: rowH - 8 };
  }
  const ac = actRow ? colorsOf(actRow) : null;
  const axa = actRow ? X(actRow.from) : 0;
  const axb = actRow ? X(actRow.to) : 0;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)}>
      <div ref={measureRef} className="relative w-full" style={{ height: chartH }}>
        {width > 0 && (
          <ChartFigure
            as="svg"
            width={width}
            height={chartH}
            roleDescription={t.roleDescription(false)}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            direction="ltr"
            onKeyDown={(e) =>
              onKeyDown(
                e,
                rows.map((_, i) => i),
              )
            }
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <defs>
              <GlowFilter
                id={`${id}-glow`}
                blur={4}
                region={
                  actRow ? { x: Math.min(axa, axb) - 4, y: centre(act) - 4, w: Math.abs(axb - axa) + 8, h: 8 } : null
                }
              />
              {(["up", "down"] as const).flatMap((dir) =>
                [false, true].map((dimmed) => {
                  const c = dimmed ? DIMMED : colors;
                  // Gradient runs from the "before" end to the "after" end on screen.
                  const rightward = (dir === "up") !== rtl;
                  return (
                    <linearGradient
                      key={`${dir}${dimmed}`}
                      id={`${id}-${dir}-${dimmed ? "d" : "c"}`}
                      x1={rightward ? 0 : 1}
                      x2={rightward ? 1 : 0}
                      y1={0}
                      y2={0}
                    >
                      <stop offset="0%" stopColor={c.from} />
                      <stop offset="100%" stopColor={c.to} />
                    </linearGradient>
                  );
                }),
              )}
            </defs>
            <g aria-hidden transform={`translate(${originX},${top})`}>
              {grid}

              {act >= 0 && (
                <rect
                  x={rtl ? -M.end + 4 : -M.start + 4}
                  y={centre(act) - rowH / 2 + 2}
                  width={width - 8}
                  height={rowH - 4}
                  rx={8}
                  fill="var(--sheen-hover)"
                  className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                />
              )}

              {layer}
              <g ref={ghostRef} />

              {/* The row being read, at full strength over the others. */}
              {actRow && ac && (
                <g pointerEvents="none" transform={`translate(0 ${centre(act)})`} className="forced-color-adjust-none">
                  <path
                    d={`M${axa},0 L${axb},0`}
                    fill="none"
                    strokeWidth={8}
                    strokeLinecap="round"
                    style={{ stroke: glowColor(ac.to) }}
                    filter={`url(#${id}-glow)`}
                    className="forced-colors:hidden"
                  />
                  <text
                    x={rtl ? innerW + 12 : -12}
                    dy="0.32em"
                    textAnchor={rtl ? "start" : "end"}
                    className={cn("text-xs fill-sheen-fg", highlightKey !== null && !actRow.dimmed && "font-medium")}
                  >
                    {fitText(actRow.label, labelCol - 16, 12, true)}
                  </text>
                  <path
                    d={barD(axa, axb)}
                    fill={`url(#${id}-${actRow.to >= actRow.from ? "up" : "down"}-${actRow.dimmed ? "d" : "c"})`}
                    className="forced-colors:fill-[CanvasText]"
                  />
                  <path
                    d={dotPath(axa, 0, FROM_R)}
                    fill={ac.from}
                    stroke="var(--sheen-chart-surface)"
                    strokeWidth={2}
                    className="forced-colors:fill-[CanvasText]"
                  />
                  <path
                    d={dotPath(axb, 0, TO_R * 1.2)}
                    fill={ac.to}
                    stroke="var(--sheen-chart-surface)"
                    strokeWidth={2}
                    className="forced-colors:fill-[CanvasText]"
                  />
                  {change !== "none" && (
                    <ChangeText
                      row={actRow}
                      x={rtl ? -10 : innerW + 10}
                      rtl={rtl}
                      text={changeText(actRow)}
                      arrow={arrowOf(actRow)}
                      tone={tone(actRow)}
                    />
                  )}
                </g>
              )}

              <rect
                x={rtl ? -M.end + 4 : -M.start + 4}
                y={0}
                width={width - 8}
                height={innerH}
                fill="transparent"
                style={{ touchAction: "pan-y pinch-zoom" }}
                onPointerEnter={bounds.reset}
                onPointerDown={(e) => pointer.down(e, hitRow(e, true))}
                onPointerMove={(e) => pointer.move(e, hitRow(e))}
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
            minLeft={rtl ? 0 : M.start}
          />
        )}
      </div>
      {announcer}
    </div>
  );
}
