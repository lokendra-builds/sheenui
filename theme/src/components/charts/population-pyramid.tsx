"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
  niceTicks,
  resolveInstructions,
  slotColor,
  useElementWidth,
} from "./chart-utils";
import { ChartTip, defaultCompact, defaultPercent, useEntrance } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import { ChartFigure } from "./chart-figure";
import { BarFlip, MIN_BAR } from "./bar-flip";
import {
  defaultPopulationPyramidLabels,
  resolvePyramidRows,
  type PopulationPyramidProps,
} from "./population-pyramid/model";

export {
  type PyramidGroup,
  type PopulationPyramidLabels,
  type PopulationPyramidProps,
  defaultPopulationPyramidLabels,
  populationPyramidLegend,
} from "./population-pyramid/model";
export { type PopulationPyramidTableProps, PopulationPyramidTable } from "./population-pyramid/table";

/** The stagger between two rows' entrances, in seconds. */
const STEP = duration.fast / 4;
const TOP = 6;
const AXIS = 28;
const EDGE = 12;

/**
 * A population pyramid: two sets of horizontal bars mirrored around a centre line, one row per age
 * group, on one shared scale so the two halves compare honestly. Use it for demographics, and for any
 * "before and after" or "us and them" split across ordered bands (a survey by age, customers by tenure).
 * The data is one item per group with the size of each side: `{ label, start, end }`. The first group
 * sits at the base by default.
 *
 * Hover, tap or arrow through the groups; the others step back. Bars grow outwards from the centre line
 * in a staggered sweep and glide when data changes. Instant under reduced motion. The legend toggles a
 * side inside a `ChartCard`.
 *
 * Keyboard: Tab focuses the chart; Up and Down move between groups (top to bottom), Home and End jump to the top and bottom group, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable; the two sides sit on opposite sides of the centre line and `patterns` hatches one of them, so colour never carries the reading; keyboard moves announce the group, both sides, the total and its share. `PopulationPyramidTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and updates instantly.
 *
 * @example
 * ```tsx
 * import { PopulationPyramid } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PopulationPyramid
 *       data={[
 *         { label: "0–19", start: 9.1, end: 8.7 },
 *         { label: "20–39", start: 10.4, end: 10.2 },
 *         { label: "40–59", start: 9.8, end: 10.1 },
 *         { label: "60+", start: 6.2, end: 7.9 },
 *       ]}
 *       aria-label="Population by age group, in millions"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/population-pyramid
 */
export function PopulationPyramid({
  data: dataProp,
  share = false,
  firstAt = "bottom",
  colors = [1, 2],
  patterns,
  showValues = true,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<PopulationPyramidProps>) {
  const t = useMemo(() => ({ ...defaultPopulationPyramidLabels, ...labels }), [labels]);
  const id = useId();
  const countFormat = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const input = useInputSource();
  const coarse = useCoarsePointer();
  const bounds = useHitBounds(width);
  const [active, setActive] = useState<string | null>(null);
  const visibility = useChartSeriesVisibility({});
  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);
  const dataD = useDeferredValue(dataProp);
  const grouped = useMemo(() => resolvePyramidRows(dataD), [dataD]);
  // Drawn top to bottom.
  const rows = useMemo(() => (firstAt === "bottom" ? [...grouped].reverse() : grouped), [grouped, firstAt]);
  const n = rows.length;
  const hideStart = visibility.hidden.has("start");
  const hideEnd = visibility.hidden.has("end");
  const hatched = resolvePatterns(patterns, 2);
  const startColor = slotColor(colors[0]);
  const endColor = slotColor(colors[1]);
  const endFill = patternFill(hatched, id, 1, endColor);

  const shown = useCallback((v: number, total: number) => (share ? (total > 0 ? v / total : NaN) : v), [share]);
  const grand = useMemo(() => rows.reduce((s, r) => s + r.total, 0), [rows]);
  const fmt = share ? pct : countFormat;
  const value = useCallback((v: number) => shown(v, grand), [shown, grand]);

  const peak = useMemo(
    () => rows.reduce((m, r) => Math.max(m, hideStart ? 0 : value(r.start), hideEnd ? 0 : value(r.end)), 0),
    [rows, hideStart, hideEnd, value],
  );
  const ticks = useMemo(() => niceTicks(0, peak > 0 ? peak : 1, width < 420 ? 2 : 4), [peak, width]);
  const top = ticks[ticks.length - 1] ?? 1;
  const hi = top > 0 ? top : 1;

  const rowH = coarse ? 34 : 26;
  const chartH = n * rowH + TOP + AXIS;
  const spine = rows.reduce((m, r) => Math.max(m, textWidth(r.label, 11, true)), 0) + 20;
  const innerW = Math.max(1, width - EDGE * 2);
  const side = Math.max(1, (innerW - spine) / 2);
  const len = (v: number) => (hi > 0 ? (value(v) / hi) * side : 0);
  // The start side sits at the inline start: on the left in left-to-right text, on the right in right-to-left text.
  const startOnLeft = !rtl;

  const readoutFor = useCallback(
    (r: (typeof rows)[number]): Readout => {
      const out: TooltipRow[] = [
        {
          label: hideStart ? "" : t.start,
          value: isolate(hideStart ? "–" : fmt(value(r.start))),
          color: startColor,
          kind: "rect",
        },
        { label: t.end, value: isolate(hideEnd ? "–" : fmt(value(r.end))), color: endColor, kind: "rect" },
        { label: t.total, value: isolate(fmt(value(r.total))), color: "transparent" },
      ];
      if (!share) out.push({ label: t.shareOfTotal, value: isolate(pct(r.share)), color: "transparent" });
      return { title: r.label, rows: out };
    },
    [t, fmt, value, hideStart, hideEnd, startColor, endColor, share, pct],
  );

  if (n === 0) {
    return (
      <ChartEmpty height={200} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null ? rows.findIndex((r) => r.key === active) : -1;
  const actRow = act >= 0 ? rows[act] : undefined;
  const readout = actRow ? readoutFor(actRow) : null;

  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    return rows[clamp(Math.floor((event.clientY - rect.top - TOP) / rowH), 0, n - 1)]?.key ?? null;
  }

  function onKeyDown(event: KeyboardEvent) {
    let i: number | null | undefined;
    if (event.key === "ArrowDown") i = Math.min(n - 1, act + 1);
    else if (event.key === "ArrowUp") i = act < 0 ? 0 : Math.max(0, act - 1);
    else if (event.key === "Home") i = 0;
    else if (event.key === "End") i = n - 1;
    else if (event.key === "Escape" && act >= 0) i = null;
    if (i === undefined) return;
    event.preventDefault();
    input.fromKeyboard();
    setActive(i === null ? null : (rows[i]?.key ?? null));
  }

  const instant = { duration: 0 };
  const move = reduced ? instant : { duration: duration.slow, ease: changeEase };
  const grow = (i: number) =>
    reduced ? instant : { duration: duration.slower, ease: enterEase, delay: STEP + i * STEP };
  const edgeLeft = EDGE;

  const bar = (r: (typeof rows)[number], i: number, which: "start" | "end") => {
    const hidden = which === "start" ? hideStart : hideEnd;
    const v = which === "start" ? r.start : r.end;
    const w = hidden ? 0 : len(v);
    // Distances from the centre line, outwards: the start side is on the left in left-to-right text.
    const onLeft = (which === "start") === startOnLeft;
    const x0 = onLeft ? side - w : side + spine;
    const y = i * rowH + 3;
    const fill = which === "start" ? startColor : endFill;
    return (
      <BarFlip key={which} x={x0} width={Math.max(w, MIN_BAR)} transition={move}>
        <motion.rect
          x={x0}
          width={Math.max(w, MIN_BAR)}
          height={rowH - 6}
          y={y}
          rx={3}
          fill={fill}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: play ? 1 : 0 }}
          transition={{ scaleX: grow(i) }}
          style={{ transformBox: "fill-box", transformOrigin: onLeft ? "100% 50%" : "0% 50%" }}
          className="forced-color-adjust-none forced-colors:fill-[CanvasText]"
        />
      </BarFlip>
    );
  };

  const tipAnchor = actRow ? { x: edgeLeft, y: TOP + act * rowH, w: innerW, h: rowH } : { x: 0, y: 0, w: 0, h: 0 };

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
            {hatched && <ChartPatternDefs id={id} entries={[{ index: 1, color: endColor }]} />}
            <g aria-hidden transform={`translate(${edgeLeft},${TOP})`}>
              {/* Grid and axis: the same ticks on both halves. */}
              {ticks.map((tk) => {
                const d = (tk / hi) * side;
                return [side - d, side + spine + d].map((gx, k) => {
                  return (
                    <g key={`${tk}-${k}`}>
                      <line x1={gx} x2={gx} y1={0} y2={n * rowH} stroke="var(--sheen-chart-grid)" />
                      {(tk > 0 || k === 0) && (
                        <text
                          x={gx}
                          y={n * rowH + 18}
                          textAnchor="middle"
                          className="fill-sheen-fg-muted text-2xs tabular-nums"
                        >
                          {fmt(tk)}
                        </text>
                      )}
                    </g>
                  );
                });
              })}

              {actRow && (
                <rect
                  x={-EDGE + 2}
                  y={act * rowH}
                  width={width - 4}
                  height={rowH}
                  rx={6}
                  fill="var(--sheen-hover)"
                  className="forced-colors:fill-none forced-colors:stroke-[Highlight]"
                />
              )}

              {rows.map((r, i) => {
                const dim = act >= 0 && act !== i;
                const cy = i * rowH + rowH / 2;
                return (
                  <g
                    key={r.key}
                    opacity={dim ? 0.45 : 1}
                    className="transition-opacity duration-(--sheen-duration-fast) motion-reduced:transition-none"
                  >
                    {bar(r, i, "start")}
                    {bar(r, i, "end")}
                    <text
                      x={side + spine / 2}
                      y={cy}
                      dy="0.34em"
                      textAnchor="middle"
                      className={cn(
                        "text-2xs tabular-nums",
                        act === i ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted",
                      )}
                    >
                      {r.label}
                    </text>
                    {showValues &&
                      (["start", "end"] as const).map((which) => {
                        const hidden = which === "start" ? hideStart : hideEnd;
                        const w = len(which === "start" ? r.start : r.end);
                        const text = fmt(value(which === "start" ? r.start : r.end));
                        if (hidden || w + textWidth(text, 11) + 8 > side) return null;
                        const onLeft = (which === "start") === startOnLeft;
                        const lx = onLeft ? side - w - 5 : side + spine + w + 5;
                        return (
                          <text
                            key={which}
                            x={lx}
                            y={cy}
                            dy="0.34em"
                            textAnchor={onLeft ? "end" : "start"}
                            className="fill-sheen-fg-muted text-2xs tabular-nums"
                          >
                            {text}
                          </text>
                        );
                      })}
                  </g>
                );
              })}

              {/* Hit area: a whole row per group. */}
              <rect
                x={-EDGE}
                y={-TOP}
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
            order={["below", "above"]}
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
