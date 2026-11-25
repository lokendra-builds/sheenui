"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { DockHint, dockHintHeight, dockSpace, useInputSource, type Readout } from "./chart-fit";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { chartFocusClass, clamp, resolveInstructions, slotColor, useElementWidth, useFirstPlay } from "./chart-utils";
import { ChartTip, defaultCompact, useEntrance } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { edgeAnchor } from "./histogram/model";
import { LollipopAxis } from "./lollipop-chart/axis";
import {
  glowColor,
  GlowFilter,
  signedText,
  useDockFits,
  useMarkMotion,
  type MarkState,
} from "./kits/histogram-kit/kit";
import { ChartFigure } from "./chart-figure";

import {
  defaultLollipopChartLabels,
  type LollipopChartProps,
  HEAD_R,
  NEUTRAL,
  TIP_H,
  TIP_V,
  type Row,
  resolveRows,
  dotPath,
  CENTRE_ORIGIN,
  rowDimClass,
} from "./lollipop-chart/model";
import { computeLollipopLayout } from "./lollipop-chart/layout";

export {
  type LollipopItem,
  type LollipopChartLabels,
  defaultLollipopChartLabels,
  type LollipopChartProps,
} from "./lollipop-chart/model";
export { type LollipopTableProps, LollipopTable } from "./lollipop-chart/table";

/**
 * A lollipop chart: a thin stem from the baseline to a dot at each value. Lighter than a bar chart
 * for ranked lists, and it makes small differences between long values visible. Stems fade towards
 * the baseline; the head carries the value. Optional reference line (average, target) and emphasis
 * of one or more items.
 *
 * Hover, tap (tap again to unpin) or arrow through the items. Stems grow from the baseline in a
 * staggered sweep with their heads riding out on the tips; re-sorting slides each row to its new
 * place and new values glide. Instant under reduced motion.
 *
 * Reading an item never re-renders the rows: they step back with one opacity change each, and the
 * item is redrawn on top.
 *
 * Keyboard: Tab focuses the chart; the arrow keys along the item axis (up and down for horizontal, left and right for vertical) move between items, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the item, value and difference from the reference line. `LollipopTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and re-sorts instantly.
 *
 * @example
 * ```tsx
 * import { LollipopChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LollipopChart
 *       data={[
 *         { label: "Berlin", value: 82 },
 *         { label: "Paris", value: 74 },
 *         { label: "Madrid", value: 61 },
 *       ]}
 *       sort="descending"
 *       reference={{ value: 70, label: "Average" }}
 *       aria-label="Customer satisfaction by city"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/lollipop
 */
export function LollipopChart({
  data: dataProp,
  layout = "auto",
  sort: sortProp = "none",
  baseline = 0,
  reference,
  highlight,
  showValues = true,
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
}: ChartRoot<LollipopChartProps>) {
  const t = useMemo(() => ({ ...defaultLollipopChartLabels, ...labels }), [labels]);
  const id = useId();
  const format = formatProp ?? defaultCompact(locale);
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
  const coarse = useCoarsePointer();
  const [active, setActive] = useState<string | null>(null);
  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);
  const bounds = useHitBounds(width);
  // New data renders in the background (interruptible): the control that changed it answers at once.
  const data = useDeferredValue(dataProp);
  const sort = useDeferredValue(sortProp);
  const highlightKey = highlight === undefined ? null : Array.isArray(highlight) ? highlight.join("\u0001") : highlight;
  const rows = useMemo(
    () => resolveRows(data, sort, color, highlightKey === null ? null : highlightKey.split("\u0001")),
    [data, sort, color, highlightKey],
  );
  const n = rows.length;
  const refValue = reference?.value;
  const refLabel = reference?.label;
  const hasRef = refValue !== undefined && refLabel !== undefined;

  const widestName = rows.reduce((m, r) => Math.max(m, textWidth(r.label, 12, true)), 0);
  const horizontal =
    layout === "horizontal" ||
    (layout === "auto" && width > 0 && (width < 560 || n > 16 || widestName + 6 > (width - 64) / Math.max(1, n)));

  const readoutFor = useCallback(
    (r: Row): Readout => {
      const rowsOut: TooltipRow[] = [
        { label: valueLabel ?? t.value, value: isolate(format(r.value)), color: r.color, kind: "rect" },
      ];
      if (hasRef) {
        const diff = r.value - refValue;
        rowsOut.push({
          label: t.versus(refLabel),
          value: isolate(signedText(diff, format(diff))),
          color: "transparent",
        });
      }
      if (n > 1) rowsOut.push({ label: "", value: t.rank(r.rank, n), color: "transparent" });
      return { title: r.label, rows: rowsOut };
    },
    [valueLabel, t, format, hasRef, refValue, refLabel, n],
  );
  const rowH = coarse ? 44 : 34;
  // Touch screens dock the readout above the plot, unless the plot is too tall for that band to stay in view.
  const docked = useDockFits(width, horizontal ? n * rowH + 30 : height);
  const dock = useMemo(() => (docked ? dockSpace(width, rows.map(readoutFor)) : 0), [docked, width, rows, readoutFor]);

  // Layout: everything that doesn't depend on which item is being read.
  const L = useMemo(
    () =>
      computeLollipopLayout({
        baseline,
        rows,
        hasRef,
        refValue,
        formatProp,
        showValues,
        format,
        horizontal,
        widestName,
        width,
        n,
        rowH,
        dock,
        valueLabel,
        height,
        rtl,
      }),
    [
      baseline,
      rows,
      hasRef,
      refValue,
      formatProp,
      showValues,
      format,
      horizontal,
      widestName,
      width,
      n,
      rowH,
      dock,
      valueLabel,
      height,
      rtl,
    ],
  );

  const {
    hi,
    refRow,
    chartH,
    top,
    innerH,
    M,
    innerW,
    sv,
    band,
    mirror,
    originX,
    vBase,
    X,
    edgeLo,
    edgeHi,
    valuesFit,
    centre,
    shownCategories,
    place,
    fromPixels,
    startPad,
  } = L;
  const step = Math.min(0.06, 0.6 / Math.max(1, n));
  const gradientId = useCallback((slot: number, towards: "end" | "start") => `${id}-g${slot}-${towards}`, [id]);
  const slots = Array.from(new Set(rows.map((r) => r.slot)));

  // Grid, reference line and rows: rendered once per data set and size; reading an item never re-renders them.
  const title = {
    x: horizontal ? (startPad + innerW) / 2 : rtl ? innerW + M.start - 2 : -M.start + 2,
    y: horizontal ? innerH + 38 : -12 - (showValues && hi > baseline ? 16 : 0) - refRow,
    anchor: horizontal ? ("middle" as const) : rtl ? ("end" as const) : ("start" as const),
  };
  const grid = useMemo(
    () => (
      <LollipopAxis
        layout={L}
        horizontal={horizontal}
        baseline={baseline}
        valueLabel={valueLabel}
        title={title}
        rtl={rtl}
        reduced={reduced}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `title` is derived from the other deps.
    [L, horizontal, baseline, valueLabel, title.x, title.y, title.anchor, rtl, reduced],
  );

  const refLayer = useMemo(() => {
    if (!hasRef || !Number.isFinite(refValue)) return null;
    const p = sv(refValue);
    return (
      <motion.g
        initial={reduced ? false : { opacity: 0 }}
        animate={play ? { opacity: 1 } : undefined}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: duration.base, delay: first ? 0.08 + n * step + duration.slower * 0.6 : 0 }
        }
      >
        {horizontal ? (
          <>
            <line
              x1={X(p)}
              x2={X(p)}
              y1={-6}
              y2={innerH}
              stroke="var(--sheen-fg)"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              className="forced-colors:stroke-[CanvasText]"
            />
            <text
              x={X(p)}
              y={-10}
              textAnchor={edgeAnchor(
                X(p),
                textWidth(`${refLabel} `) + textWidth(format(refValue), 11, true),
                edgeLo,
                edgeHi,
              )}
              className="text-2xs"
            >
              <tspan className="fill-sheen-fg-muted">{refLabel} </tspan>
              <tspan className="fill-sheen-fg font-semibold tabular-nums">{format(refValue)}</tspan>
            </text>
          </>
        ) : (
          <>
            <line
              x1={0}
              x2={innerW}
              y1={p}
              y2={p}
              stroke="var(--sheen-fg)"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              className="forced-colors:stroke-[CanvasText]"
            />
            <text x={rtl ? 4 : innerW - 4} y={p - 6} textAnchor={rtl ? "start" : "end"} className="text-2xs">
              <tspan className="fill-sheen-fg-muted">{refLabel} </tspan>
              <tspan className="fill-sheen-fg font-semibold tabular-nums">{format(refValue)}</tspan>
            </text>
          </>
        )}
      </motion.g>
    );
  }, [
    hasRef,
    refValue,
    refLabel,
    sv,
    horizontal,
    X,
    innerH,
    innerW,
    edgeLo,
    edgeHi,
    format,
    rtl,
    reduced,
    play,
    first,
    n,
    step,
  ]);

  // Each row's numbers: where the row sits, its value's pixel and the baseline's (moved by one frame loop on data changes).
  const marks = useMemo(() => {
    const out = new Map<string, MarkState>();
    if (width > 0) rows.forEach((r, i) => out.set(r.key, [place(r, i).at.x, place(r, i).at.y, sv(r.value), vBase]));
    return out;
  }, [rows, place, sv, vBase, width]);
  const rowIndex = useMemo(() => new Map(rows.map((r, i) => [r.key, i])), [rows]);
  useMarkMotion(
    layerRef,
    ghostRef,
    marks,
    { play: play && width > 0, reduced, resetKey: width },
    {
      write: (el, [ax = 0, ay = 0, vh = 0, vb = 0]) => {
        const g = fromPixels(vh, vb);
        el.setAttribute("transform", `translate(${ax.toFixed(1)} ${ay.toFixed(1)})`);
        el.querySelector('[data-part="stem"]')?.setAttribute("d", g.stem);
        el.querySelector('[data-part="head"]')?.setAttribute("d", dotPath(g.hx, g.hy, HEAD_R));
        el.querySelector('[data-part="val"]')?.setAttribute(
          "transform",
          `translate(${g.vx.toFixed(1)} ${g.vy.toFixed(1)})`,
        );
      },
      // Stems grow out of the baseline with their heads riding out on the tips; values land after.
      entrance: ([, , vh = 0, vb = 0], key, el) => {
        const i = rowIndex.get(key) ?? 0;
        const g = fromPixels(vh, vb);
        const base = fromPixels(vb, vb);
        const delay = 0.08 + i * step;
        return [
          {
            target: el.querySelector('[data-part="stem"]'),
            keyframes: [{ transform: horizontal ? "scaleX(0)" : "scaleY(0)" }, { transform: "none" }],
            delay,
            duration: duration.slower,
          },
          {
            target: el.querySelector('[data-part="head"]'),
            keyframes: [
              { transform: `translate(${(base.hx - g.hx).toFixed(1)}px, ${(base.hy - g.hy).toFixed(1)}px) scale(0.4)` },
              { transform: "none" },
            ],
            delay,
            duration: duration.slower,
          },
          {
            target: el.querySelector('[data-part="val"]'),
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
            delay: delay + duration.slower * 0.75,
            duration: duration.base,
          },
        ];
      },
      // Long lists sweep in as one layer, in reading order.
      maxEntrance: 24,
      layerEntrance: () => ({
        keyframes: [
          { clipPath: rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", opacity: 0.4 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        delay: 0.08,
        duration: duration.slower * 1.4,
      }),
    },
  );

  const rowLayer = useMemo(
    () =>
      width > 0 &&
      rows.map((r, i) => {
        const p = place(r, i);
        const g = fromPixels(sv(r.value), vBase);
        const strong = highlightKey !== null && !r.dimmed;
        return (
          <g key={r.key} data-k={r.key} transform={`translate(${p.at.x.toFixed(1)} ${p.at.y.toFixed(1)})`}>
            {/* Category name (upright charts thin them out so none collide). */}
            {(horizontal || shownCategories?.has(i)) && (
              <text
                x={p.nameX}
                y={p.nameY}
                dy={horizontal ? "0.32em" : 0}
                textAnchor={p.nameAnchor}
                className={cn("text-xs", strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
              >
                {p.name !== r.label && <title>{r.label}</title>}
                {p.name}
              </text>
            )}
            <g className={rowDimClass}>
              <g className="forced-color-adjust-none">
                {/* Stem: grows out of the baseline. */}
                <path
                  data-part="stem"
                  d={g.stem}
                  fill={`url(#${gradientId(r.slot, p.towards)})`}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: horizontal ? `${p.s.origin * 100}% 50%` : `50% ${p.s.origin * 100}%`,
                  }}
                  className="forced-colors:fill-[CanvasText]"
                />
                {/* Head: rides out on the tip of its stem. */}
                <path
                  data-part="head"
                  d={dotPath(g.hx, g.hy, HEAD_R)}
                  fill={r.color}
                  stroke="var(--sheen-chart-surface)"
                  strokeWidth={2}
                  style={CENTRE_ORIGIN}
                  className="forced-colors:fill-[CanvasText]"
                />
              </g>
              {/* The value, past the head (text colour, never the series colour). */}
              {showValues && valuesFit && (
                <text
                  data-part="val"
                  transform={`translate(${g.vx.toFixed(1)} ${g.vy.toFixed(1)})`}
                  dy={horizontal ? "0.32em" : 0}
                  textAnchor={p.valueAnchor}
                  className={cn(
                    "text-xs font-medium tabular-nums [paint-order:stroke] [stroke-linejoin:round] forced-colors:stroke-[Canvas]",
                    r.dimmed ? "fill-sheen-fg-muted" : "fill-sheen-fg",
                  )}
                  // A surface halo, so a gridline or the reference line never cuts through the number.
                  stroke="var(--sheen-chart-surface)"
                  strokeWidth={5}
                >
                  {format(r.value)}
                </text>
              )}
            </g>
          </g>
        );
      }),
    [
      rows,
      place,
      fromPixels,
      sv,
      vBase,
      width,
      highlightKey,
      horizontal,
      shownCategories,
      showValues,
      valuesFit,
      format,
      gradientId,
    ],
  );

  if (n === 0) {
    return (
      <ChartEmpty height={horizontal ? 160 : height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null ? rows.findIndex((r) => r.key === active) : -1;
  const actRow = act >= 0 ? rows[act] : undefined;
  const readout = actRow ? readoutFor(actRow) : undefined;
  const ap = actRow ? place(actRow, act) : null;

  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    let px = event.clientX - rect.left;
    if (rtl) px = rect.width - px;
    const along = horizontal ? event.clientY - rect.top : px;
    return rows[clamp(Math.floor(along / Math.max(1, band)), 0, n - 1)]?.key ?? null;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const next = horizontal ? "ArrowDown" : mirror.next;
    const prev = horizontal ? "ArrowUp" : mirror.prev;
    let i: number | null | undefined;
    if (event.key === next) i = Math.min(n - 1, act + 1);
    else if (event.key === prev) i = act < 0 ? 0 : Math.max(0, act - 1);
    else if (event.key === "Home") i = 0;
    else if (event.key === "End") i = n - 1;
    else if (event.key === "Escape" && act >= 0) i = null;
    if (i === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(i === null ? null : (rows[i]?.key ?? null));
  }

  let tipAnchor = { x: 0, y: 0, w: 0, h: 0 };
  if (actRow) {
    const vh = sv(actRow.value);
    const a = Math.min(vh, vBase) - HEAD_R;
    const b = Math.max(vh, vBase) + HEAD_R;
    tipAnchor = horizontal
      ? { x: originX + mirror.left(a, b - a), y: top + centre(act) - rowH / 2 + 4, w: b - a, h: rowH - 8 }
      : { x: originX + X(centre(act)) - HEAD_R - 2, y: top + a, w: HEAD_R * 2 + 4, h: b - a };
  }

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
              <GlowFilter
                id={`${id}-glow`}
                blur={4}
                region={
                  ap
                    ? {
                        x: ap.at.x + ap.headX - HEAD_R - 5,
                        y: ap.at.y + ap.headY - HEAD_R - 5,
                        w: 2 * HEAD_R + 10,
                        h: 2 * HEAD_R + 10,
                      }
                    : null
                }
              />
              {/* Stems fade towards the baseline: full colour at the head. */}
              {slots.flatMap((slot) =>
                (["end", "start"] as const).map((towards) => {
                  const c = slot === 0 ? NEUTRAL : slotColor(slot);
                  const [x1, x2, y1, y2] = horizontal
                    ? towards === "end"
                      ? [0, 1, 0, 0]
                      : [1, 0, 0, 0]
                    : towards === "end"
                      ? [0, 0, 1, 0]
                      : [0, 0, 0, 1];
                  return (
                    <linearGradient
                      key={`${slot}${towards}`}
                      id={gradientId(slot, towards)}
                      x1={x1}
                      x2={x2}
                      y1={y1}
                      y2={y2}
                    >
                      <stop offset="0%" stopColor={c} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={c} />
                    </linearGradient>
                  );
                }),
              )}
            </defs>
            <g aria-hidden transform={`translate(${originX},${top})`}>
              {grid}

              {/* Hover band behind the active row. */}
              {act >= 0 &&
                (horizontal ? (
                  <rect
                    x={rtl ? -M.end + 4 : -M.start + 4}
                    y={centre(act) - band / 2 + 1}
                    width={width - 8}
                    height={band - 2}
                    rx={8}
                    fill="var(--sheen-hover)"
                    className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                  />
                ) : (
                  <rect
                    x={X(centre(act)) - band / 2 + 2}
                    y={-top + dock + 4}
                    width={band - 4}
                    height={innerH + top - dock + 20}
                    rx={8}
                    fill="var(--sheen-hover)"
                    className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                  />
                ))}

              {refLayer}

              {/* The rows: each slides to its place when the order changes. */}
              <g ref={layerRef} data-dim={act >= 0 ? "" : undefined} className="group" opacity={play ? undefined : 0}>
                {rowLayer}
              </g>
              {/* Rows that leave with a data change fade out here. */}
              <g ref={ghostRef} />

              {/* The item being read, at full strength over the others. */}
              {actRow && ap && (
                <g pointerEvents="none" transform={`translate(${ap.at.x},${ap.at.y})`}>
                  {/* Its name in full ink (drawn exactly over the resting one; upright charts show it even where names thin out). */}
                  <text
                    x={ap.nameX}
                    y={ap.nameY}
                    dy={horizontal ? "0.32em" : 0}
                    textAnchor={ap.nameAnchor}
                    className={cn("fill-sheen-fg text-xs", highlightKey !== null && !actRow.dimmed && "font-medium")}
                  >
                    {ap.name}
                  </text>
                  <g className="forced-color-adjust-none">
                    <path
                      d={ap.s.d}
                      fill={`url(#${gradientId(actRow.slot, ap.towards)})`}
                      className="forced-colors:fill-[CanvasText]"
                    />
                    <circle
                      cx={ap.headX}
                      cy={ap.headY}
                      r={HEAD_R + 5}
                      style={{ fill: glowColor(actRow.color) }}
                      filter={`url(#${id}-glow)`}
                      className="forced-colors:hidden"
                    />
                    <circle
                      cx={ap.headX}
                      cy={ap.headY}
                      r={HEAD_R * 1.25}
                      fill={actRow.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      className="forced-colors:fill-[CanvasText]"
                    />
                    <circle
                      cx={ap.headX}
                      cy={ap.headY}
                      r={HEAD_R + 5}
                      fill="none"
                      stroke={actRow.color}
                      strokeWidth={1.5}
                      className="forced-colors:stroke-[Highlight]"
                    />
                  </g>
                  {showValues && (
                    <text
                      x={ap.valueX}
                      y={ap.valueY}
                      dy={horizontal ? "0.32em" : 0}
                      textAnchor={ap.valueAnchor}
                      className={cn(
                        "text-xs font-medium tabular-nums [paint-order:stroke] [stroke-linejoin:round] forced-colors:stroke-[Canvas]",
                        actRow.dimmed ? "fill-sheen-fg-muted" : "fill-sheen-fg",
                      )}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={5}
                    >
                      {format(actRow.value)}
                    </text>
                  )}
                </g>
              )}

              {/* Hit area: a whole row (or column) per item. */}
              <rect
                x={horizontal ? (rtl ? 0 : -M.start + 4) : 0}
                y={0}
                width={horizontal ? innerW + M.start - 4 : innerW}
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
            minLeft={horizontal && !rtl ? M.start : 0}
          />
        )}
      </div>
      <ChartAnnouncer
        text={input.announce(
          readout ? `${readout.title}: ${readout.rows.map((r) => `${r.label} ${r.value}`.trim()).join(", ")}` : "",
        )}
      />
    </div>
  );
}
