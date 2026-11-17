"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { ChartAnnouncer, ChartEmpty, useChartSeriesVisibility, type TooltipRow } from "./chart-parts";
import { useInputSource, type Readout } from "./chart-fit";
import {
  changeEase,
  chartFocusClass,
  clamp,
  enterEase,
  linePath,
  resolveInstructions,
  thinLabels,
  truncate,
  useElementWidth,
} from "./chart-utils";
import { ChartTip, defaultCompact, useEntrance } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { dashFor, resolvePatterns } from "./chart-patterns";
import { ChartFigure } from "./chart-figure";
import { bumpModel, defaultBumpChartLabels, type BumpChartProps } from "./bump-chart/model";

export { type BumpChartLabels, type BumpChartProps, defaultBumpChartLabels, bumpLegend } from "./bump-chart/model";
export { type BumpTableProps, BumpTable } from "./bump-chart/table";

/** The padding around the plot, in px: top, bottom (x labels), and the edge past the first dot. */
/** The stagger between two series' entrances, in seconds. */
const STEP = duration.fast / 3;
const PAD = { top: 16, bottom: 30, edge: 18 } as const;
type Reading = { t: number; s: number };

/**
 * A bump chart: how the ranking of several series changes over time. Each series is a line that rises
 * and falls between rank positions, with the rank written in every dot and the name at the end of the
 * line. Use it for league tables, "top N" lists and any ordering whose changes matter more than the
 * values behind them. The data is one row per point in time with a number per series; ranks are
 * computed for you (or pass ready-made ranks with `rankBy="rank"`).
 *
 * Hover, tap or arrow through the dots; the rest of the chart steps back so one series reads clearly.
 * Lines draw in once as the chart scrolls into view and glide when data changes. Instant under reduced
 * motion.
 *
 * Keyboard: Tab focuses the chart; Left and Right move through time, Up and Down move between ranks, Home and End jump to the first and last point, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable; ranks are written as text in the dots and the series names at the line ends, and from four series on each line also gets its own dash style, so colour never carries the reading. Keyboard moves announce the series, the period, its rank and how far it moved. `BumpTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and updates instantly.
 *
 * @example
 * ```tsx
 * import { BumpChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BumpChart
 *       data={[
 *         { year: "2022", ada: 82, bo: 77, cy: 64 },
 *         { year: "2023", ada: 74, bo: 90, cy: 70 },
 *         { year: "2024", ada: 69, bo: 88, cy: 91 },
 *       ]}
 *       index="year"
 *       series={[
 *         { key: "ada", label: "Ada" },
 *         { key: "bo", label: "Bo" },
 *         { key: "cy", label: "Cy" },
 *       ]}
 *       aria-label="Ranking by year"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bump-chart
 */
export function BumpChart({
  data: dataProp,
  index,
  series,
  rankBy = "value",
  higherIsBetter = true,
  highlight,
  showLabels = true,
  patterns,
  height,
  format: formatProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BumpChartProps>) {
  const t = useMemo(() => ({ ...defaultBumpChartLabels, ...labels }), [labels]);
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const input = useInputSource();
  const coarse = useCoarsePointer();
  const bounds = useHitBounds(width);
  const [active, setActive] = useState<Reading | null>(null);
  const visibility = useChartSeriesVisibility({});
  const data = useDeferredValue(dataProp);

  const model = useMemo(
    () => bumpModel(data, index, series, rankBy, higherIsBetter, visibility.hidden),
    [data, index, series, rankBy, higherIsBetter, visibility.hidden],
  );
  const n = model.count;
  const T = model.periods.length;
  const hatched = resolvePatterns(patterns, series.length);

  // Geometry.
  const rowStep = coarse ? 42 : 36;
  const chartH = height ?? Math.max(220, n * rowStep + PAD.top + PAD.bottom);
  const innerH = chartH - PAD.top - PAD.bottom;
  const labelChars = Math.max(6, Math.floor((width * 0.3) / 6.4));
  const widest = showLabels
    ? model.series.reduce((m, s) => Math.max(m, textWidth(truncate(s.label, labelChars), 12)), 0)
    : 0;
  const endPad = showLabels ? widest + 16 : 0;
  const innerW = Math.max(1, width - PAD.edge * 2 - endPad);
  const startX = PAD.edge + (rtl ? endPad : 0);
  const stepY = n > 1 ? (innerH - 2 * 14) / (n - 1) : 0;
  const Y = useCallback((rank: number) => (n > 1 ? 14 + (rank - 1) * stepY : innerH / 2), [n, stepY, innerH]);
  const X = useCallback(
    (i: number) => {
      const x = T > 1 ? (i / (T - 1)) * innerW : innerW / 2;
      return rtl ? innerW - x : x;
    },
    [T, innerW, rtl],
  );
  const dotR = clamp(stepY / 2 - 3, 6, 12);
  const numbered = dotR >= 9;
  const shownPeriods = useMemo(
    () => thinLabels(model.periods, T > 1 ? innerW / (T - 1) : innerW),
    [model.periods, T, innerW],
  );

  const readoutFor = useCallback(
    (r: Reading): Readout | null => {
      const s = model.series[r.s];
      if (!s) return null;
      const rank = s.ranks[r.t] ?? 0;
      const before = r.t > 0 ? (s.ranks[r.t - 1] ?? rank) : rank;
      const moved = before - rank;
      const rows: TooltipRow[] = [
        { label: "", value: t.rank(rank, n), color: s.color, kind: "line" },
        ...(rankBy === "value"
          ? [{ label: t.value, value: isolate(format(s.values[r.t] ?? 0)), color: "transparent" }]
          : []),
        ...(r.t > 0
          ? [
              {
                label: "",
                value: moved === 0 ? t.unchanged : moved > 0 ? t.movedUp(moved) : t.movedDown(-moved),
                color: "transparent",
              },
            ]
          : []),
      ];
      return { title: `${s.label} · ${model.periods[r.t] ?? ""}`, rows };
    },
    [model, t, n, rankBy, format],
  );

  const pointer = usePointerReading<string>(
    active ? `${active.t}:${active.s}` : null,
    (next) => {
      if (next === null) {
        setActive(null);
        return;
      }
      const [a, b] = next.split(":").map(Number);
      setActive({ t: a ?? 0, s: b ?? 0 });
    },
    input.fromPointer,
  );

  if (n === 0 || T === 0) {
    return (
      <ChartEmpty height={height ?? 220} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active && active.t < T && active.s < n ? active : null;
  const readout = act ? readoutFor(act) : null;
  const actSeries = act ? model.series[act.s] : undefined;
  const emphasised = actSeries?.key ?? visibility.highlighted ?? highlight ?? null;
  // Dimmed lines are drawn first so the emphasised one ends up on top.
  const ordered = [...model.series].sort((a, b) => Number(a.key === emphasised) - Number(b.key === emphasised));

  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false): string | null {
    const rect = bounds.rect(event.currentTarget, fresh);
    let px = event.clientX - rect.left - startX;
    if (rtl) px = innerW - px;
    const col = T > 1 ? clamp(Math.round((px / innerW) * (T - 1)), 0, T - 1) : 0;
    const rank = n > 1 ? clamp(Math.round((event.clientY - rect.top - PAD.top - 14) / stepY) + 1, 1, n) : 1;
    const si = model.series.findIndex((s) => s.ranks[col] === rank);
    return si < 0 ? null : `${col}:${si}`;
  }

  function seriesAt(col: number, rank: number) {
    return Math.max(
      0,
      model.series.findIndex((s) => s.ranks[col] === rank),
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const cur = act ?? { t: 0, s: seriesAt(0, 1) };
    const rank = model.series[cur.s]?.ranks[cur.t] ?? 1;
    let next: Reading | null | undefined;
    if (event.key === forward) next = act ? { t: Math.min(T - 1, cur.t + 1), s: cur.s } : cur;
    else if (event.key === back) next = act ? { t: Math.max(0, cur.t - 1), s: cur.s } : cur;
    else if (event.key === "ArrowDown") next = act ? { t: cur.t, s: seriesAt(cur.t, Math.min(n, rank + 1)) } : cur;
    else if (event.key === "ArrowUp") next = act ? { t: cur.t, s: seriesAt(cur.t, Math.max(1, rank - 1)) } : cur;
    else if (event.key === "Home") next = { t: 0, s: cur.s };
    else if (event.key === "End") next = { t: T - 1, s: cur.s };
    else if (event.key === "Escape" && act) next = null;
    if (next === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(next);
  }

  const instant = { duration: 0 };
  const move = reduced ? instant : { duration: duration.slow, ease: changeEase };
  const tipAnchor =
    act && actSeries
      ? { x: startX + X(act.t) - dotR, y: PAD.top + Y(actSeries.ranks[act.t] ?? 1) - dotR, w: dotR * 2, h: dotR * 2 }
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
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <g aria-hidden transform={`translate(${startX},${PAD.top})`}>
              {/* One faint guide per rank. */}
              {Array.from({ length: n }, (_, k) => (
                <line
                  key={k}
                  x1={-PAD.edge / 2}
                  x2={innerW + PAD.edge / 2}
                  y1={Y(k + 1)}
                  y2={Y(k + 1)}
                  stroke="var(--sheen-chart-grid)"
                />
              ))}
              {/* The active point's column. */}
              {act && (
                <line
                  x1={X(act.t)}
                  x2={X(act.t)}
                  y1={0}
                  y2={innerH}
                  stroke="var(--sheen-border)"
                  strokeDasharray="3 3"
                />
              )}
              {model.periods.map((p, i) =>
                shownPeriods.has(i) ? (
                  <text
                    key={i}
                    x={X(i)}
                    y={innerH + 20}
                    textAnchor="middle"
                    className={cn("text-2xs tabular-nums", act?.t === i ? "fill-sheen-fg" : "fill-sheen-fg-muted")}
                  >
                    {p}
                  </text>
                ) : null,
              )}

              {ordered.map((s) => {
                const dim = emphasised !== null && s.key !== emphasised;
                const d = linePath(
                  s.ranks.map((r, i) => [X(i), Y(r)] as [number, number]),
                  "monotone",
                );
                const dash = dashFor(hatched, s.index);
                const last = s.ranks.length - 1;
                const endX = X(last);
                const endY = Y(s.ranks[last] ?? 1);
                const labelOnEnd = !rtl;
                return (
                  <g
                    key={s.key}
                    className="transition-opacity duration-(--sheen-duration-fast) motion-reduced:transition-none"
                    opacity={dim ? 0.3 : 1}
                  >
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={emphasised === s.key ? 4 : 3}
                      strokeLinecap="round"
                      strokeDasharray={dash}
                      className="forced-colors:stroke-[CanvasText]"
                      // A dashed line fades in: the draw-on animation owns `stroke-dasharray` and would erase the dashes.
                      initial={reduced ? false : dash ? { opacity: 0, d } : { pathLength: 0, d }}
                      animate={dash ? { opacity: play ? 1 : 0, d } : { pathLength: play ? 1 : 0, d }}
                      transition={{
                        d: move,
                        pathLength: reduced
                          ? instant
                          : { duration: duration.slower, ease: enterEase, delay: s.index * STEP },
                        opacity: reduced ? instant : { duration: duration.slow, delay: s.index * STEP },
                      }}
                    />
                    {s.ranks.map((r, i) => (
                      <motion.g
                        key={i}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: play ? 1 : 0, x: X(i), y: Y(r) }}
                        transition={{
                          x: move,
                          y: move,
                          opacity: reduced
                            ? instant
                            : { duration: duration.base, delay: duration.base + s.index * STEP },
                        }}
                      >
                        <circle
                          r={act?.t === i && actSeries?.key === s.key ? dotR + 2 : dotR}
                          fill="var(--sheen-chart-surface)"
                          stroke={s.color}
                          strokeWidth={2.5}
                          className="forced-colors:stroke-[CanvasText]"
                        />
                        {numbered && (
                          <text
                            dy="0.34em"
                            textAnchor="middle"
                            className="fill-sheen-fg text-2xs font-semibold tabular-nums"
                          >
                            {r}
                          </text>
                        )}
                      </motion.g>
                    ))}
                    {showLabels && (
                      <text
                        x={endX + (labelOnEnd ? dotR + 8 : -dotR - 8)}
                        y={endY}
                        dy="0.34em"
                        textAnchor={labelOnEnd ? "start" : "end"}
                        className={cn(
                          "text-xs",
                          emphasised === s.key ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted",
                        )}
                      >
                        {truncate(s.label, labelChars)}
                        {truncate(s.label, labelChars) !== s.label && <title>{s.label}</title>}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Hit area: the whole plot; the nearest dot is read. */}
              <rect
                x={-startX}
                y={-PAD.top}
                width={width}
                height={chartH}
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
        {readout && (
          <ChartTip
            title={readout.title}
            rows={readout.rows}
            anchor={tipAnchor}
            bounds={{ w: width, h: chartH }}
            order={["above", "below", "right", "left"]}
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
