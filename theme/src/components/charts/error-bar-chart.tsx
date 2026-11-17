"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useDeferredValue, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { useInputSource, type Readout } from "./chart-fit";
import {
  changeEase,
  chartFocusClass,
  clamp,
  enterEase,
  linePath,
  linear,
  niceTicks,
  resolveInstructions,
  slotColor,
  thinLabels,
  truncate,
  useElementWidth,
} from "./chart-utils";
import { ChartTip, defaultCompact, useEntrance } from "./heatmap";
import { isolate, textWidth, useChartDirection, useHitBounds, usePointerReading } from "./chart-pointer";
import { ChartFigure } from "./chart-figure";
import { BarFlip } from "./bar-flip";
import { ChartPatternDefs, markerPath, patternFill, resolvePatterns } from "./chart-patterns";
import { defaultErrorBarChartLabels, resolveErrorRows, type ErrorBarChartProps } from "./error-bar-chart/model";

export {
  type ErrorBarItem,
  type ErrorBarChartLabels,
  type ErrorBarChartProps,
  defaultErrorBarChartLabels,
  errorBarLegend,
} from "./error-bar-chart/model";
export { type ErrorBarTableProps, ErrorBarTable } from "./error-bar-chart/table";

/** The stagger between two marks' entrances, in seconds. */
const STEP = duration.fast / 3;
const TOP = 20;
const AXIS = 36;
const CAP = 5;

/**
 * An error bar chart: an estimate for each item with the interval around it, drawn as a whisker. Use it
 * for survey results, A/B tests, model scores and measurements, where how sure the number is matters as
 * much as the number. `variant="bar"` draws bars from a baseline, `"point"` draws dots (the forest-plot
 * look, best with a reference line such as "no effect"), and `"band"` draws a line with a shaded
 * confidence band over ordered categories such as months. The data is one item per mark with `value`,
 * `low` and `high`.
 *
 * Hover, tap or arrow through the items. Bars grow from the baseline, whiskers draw outwards and values
 * glide when data changes. Instant under reduced motion.
 *
 * Keyboard: Tab focuses the chart; the arrow keys along the item axis (up and down for bars and points, left and right for a band) move between items, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable; the interval is a drawn whisker with caps (a shape, not a colour) and its ends are printed in the tooltip and read aloud with the estimate. `ErrorBarTable` is the table view.
 * Glass and motion: the plot has no backdrop blur. Reduced motion draws and updates instantly.
 *
 * @example
 * ```tsx
 * import { ErrorBarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ErrorBarChart
 *       data={[
 *         { label: "Control", value: 12.4, low: 11.1, high: 13.7 },
 *         { label: "Variant A", value: 14.2, low: 12.9, high: 15.5 },
 *         { label: "Variant B", value: 13.1, low: 11.4, high: 14.8 },
 *       ]}
 *       valueLabel="Conversion rate (%)"
 *       aria-label="Conversion rate by variant, with 95% intervals"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/error-bar-chart
 */
export function ErrorBarChart({
  data: dataProp,
  variant = "bar",
  baseline = 0,
  reference,
  showValues = true,
  color = 1,
  patterns,
  height = 300,
  valueLabel,
  intervalLabel,
  format: formatProp,
  locale,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<ErrorBarChartProps>) {
  const t = useMemo(() => ({ ...defaultErrorBarChartLabels, ...labels }), [labels]);
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
  const [active, setActive] = useState<string | null>(null);
  const data = useDeferredValue(dataProp);
  const rows = useMemo(() => resolveErrorRows(data, color), [data, color]);
  const n = rows.length;
  const band = variant === "band";
  const bars = variant === "bar";
  const refValue = reference?.value;
  const name = intervalLabel ?? t.intervalName;
  const ink = slotColor(color);
  const patternUid = useId();
  // One hatch (or marker shape) per distinct item colour, in order of first use; the first stays solid and round.
  const hatchOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) if (!m.has(r.color)) m.set(r.color, m.size);
    return m;
  }, [rows]);
  const hatched = resolvePatterns(patterns, hatchOf.size);

  const pointer = usePointerReading<string>(active, setActive, input.fromPointer);

  // Scale: the domain covers every interval, the baseline (bars) and the reference line.
  const ticks = useMemo(() => {
    const all = rows.flatMap((r) => [r.low, r.high, r.value]);
    if (bars) all.push(baseline);
    if (refValue !== undefined && Number.isFinite(refValue)) all.push(refValue);
    return all.length === 0 ? [0, 1] : niceTicks(Math.min(...all), Math.max(...all), band ? 4 : 5);
  }, [rows, bars, baseline, refValue, band]);
  const lo = ticks[0] ?? 0;
  const hi = ticks[ticks.length - 1] ?? 1;

  // Horizontal layout (bar, point): names on one side, the value axis along the bottom.
  const widest = rows.reduce((m, r) => Math.max(m, textWidth(r.label, 12)), 0);
  const nameW = band ? 0 : Math.min(widest + 14, Math.max(80, width * 0.36));
  const nameChars = Math.max(6, Math.floor((nameW - 10) / 6.4));
  const valueW = !band && showValues ? Math.max(...rows.map((r) => textWidth(format(r.value), 12, true)), 0) + 14 : 0;
  const edge = 16;
  const rowH = coarse ? 44 : 34;
  const chartH = band ? height : n * rowH + TOP + AXIS + (valueLabel ? 14 : 0);
  const plotTop = band ? 14 : TOP;
  const innerH = chartH - plotTop - (band ? 30 : AXIS + (valueLabel ? 14 : 0));
  // Band: the plot spans the whole width past a value-axis gutter.
  const gutter = band ? Math.max(...ticks.map((tk) => textWidth(format(tk), 11)), 0) + 14 : 0;
  const innerW = Math.max(1, width - (band ? gutter + edge : nameW + valueW + edge));
  const startX = band ? (rtl ? edge : gutter) : rtl ? valueW + edge : nameW;
  const vx = useMemo(() => {
    const f = linear(lo, hi, 0, innerW);
    return (v: number) => (rtl ? innerW - f(v) : f(v));
  }, [lo, hi, innerW, rtl]);
  const vy = useMemo(() => linear(lo, hi, innerH, 0), [lo, hi, innerH]);
  const slot = band ? (n > 1 ? innerW / (n - 1) : innerW) : rowH;
  const cx = useCallback(
    (i: number) => {
      const x = n > 1 ? (i / (n - 1)) * innerW : innerW / 2;
      return rtl ? innerW - x : x;
    },
    [n, innerW, rtl],
  );
  const shownNames = useMemo(
    () =>
      thinLabels(
        rows.map((r) => r.label),
        slot,
      ),
    [rows, slot],
  );

  const readoutFor = useCallback(
    (r: (typeof rows)[number]): Readout => {
      const out: TooltipRow[] = [
        { label: valueLabel ?? t.value, value: isolate(format(r.value)), color: r.color, kind: "rect" },
        {
          label: name,
          value: isolate(t.interval(format(r.low), format(r.high))),
          color: "var(--sheen-fg)",
          kind: "line",
        },
      ];
      return { title: r.label, rows: out };
    },
    [valueLabel, t, format, name],
  );

  if (n === 0) {
    return (
      <ChartEmpty height={band ? height : 160} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null ? rows.findIndex((r) => r.key === active) : -1;
  const actRow = act >= 0 ? rows[act] : undefined;
  const readout = actRow ? readoutFor(actRow) : null;

  function hitAt(event: React.PointerEvent<SVGRectElement>, fresh = false) {
    const rect = bounds.rect(event.currentTarget, fresh);
    if (!band) return rows[clamp(Math.floor((event.clientY - rect.top - TOP) / rowH), 0, n - 1)]?.key ?? null;
    let px = event.clientX - rect.left - startX;
    if (rtl) px = innerW - px;
    return rows[clamp(Math.round(n > 1 ? (px / innerW) * (n - 1) : 0), 0, n - 1)]?.key ?? null;
  }

  function onKeyDown(event: KeyboardEvent) {
    const next = band ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const prev = band ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
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

  const instant = { duration: 0 };
  const move = reduced ? instant : { duration: duration.slow, ease: changeEase };
  const grow = (i: number) =>
    reduced ? instant : { duration: duration.slower, ease: enterEase, delay: STEP + i * STEP };
  const fade = (i: number) => (reduced ? instant : { duration: duration.base, delay: duration.base + i * STEP });
  const refX = refValue !== undefined && Number.isFinite(refValue) ? (band ? vy(refValue) : vx(refValue)) : null;
  const halo = { stroke: "var(--sheen-chart-surface)", strokeWidth: 4.5, strokeLinecap: "round" } as const;

  // Band: the shaded area between the interval ends, and the line through the estimates.
  const bandShape = (() => {
    if (!band) return null;
    const high = rows.map((r, i) => [cx(i), vy(r.high)] as [number, number]);
    const low = rows.map((r, i) => [cx(i), vy(r.low)] as [number, number]).reverse();
    const line = rows.map((r, i) => [cx(i), vy(r.value)] as [number, number]);
    const curve = n > 2 ? "monotone" : "linear";
    return {
      area: `${linePath(high, curve)} ${linePath(low, curve).replace(/^M/, "L")} Z`,
      edgeHigh: linePath(high, curve),
      edgeLow: linePath([...low].reverse(), curve),
      line: linePath(line, curve),
    };
  })();

  const tipAnchor = actRow
    ? band
      ? {
          x: startX + cx(act) - 6,
          y: plotTop + vy(actRow.high),
          w: 12,
          h: Math.max(8, vy(actRow.low) - vy(actRow.high)),
        }
      : {
          x: startX + Math.min(vx(actRow.low), vx(actRow.high)),
          y: TOP + act * rowH + 4,
          w: Math.abs(vx(actRow.high) - vx(actRow.low)),
          h: rowH - 8,
        }
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
            description={resolveInstructions(t.instructions, { vertical: band })}
            tabIndex={0}
            direction="ltr"
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
          >
            <g aria-hidden transform={`translate(${startX},${plotTop})`}>
              {/* Grid and value axis. */}
              {ticks.map((tk) =>
                band ? (
                  <g key={tk}>
                    <line
                      x1={0}
                      x2={innerW}
                      y1={vy(tk)}
                      y2={vy(tk)}
                      stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"}
                    />
                    <text
                      x={rtl ? innerW + 8 : -8}
                      y={vy(tk)}
                      dy="0.32em"
                      textAnchor={rtl ? "start" : "end"}
                      className="fill-sheen-fg-muted text-2xs tabular-nums"
                    >
                      {format(tk)}
                    </text>
                  </g>
                ) : (
                  <g key={tk}>
                    <line
                      x1={vx(tk)}
                      x2={vx(tk)}
                      y1={-4}
                      y2={n * rowH}
                      stroke={tk === (bars ? baseline : 0) && bars ? "var(--sheen-border)" : "var(--sheen-chart-grid)"}
                    />
                    <text
                      x={vx(tk)}
                      y={n * rowH + 18}
                      textAnchor="middle"
                      className="fill-sheen-fg-muted text-2xs tabular-nums"
                    >
                      {format(tk)}
                    </text>
                  </g>
                ),
              )}
              {valueLabel && !band && (
                <text
                  x={innerW / 2}
                  y={n * rowH + 36}
                  textAnchor="middle"
                  className="fill-sheen-fg-muted text-2xs font-medium"
                >
                  {valueLabel}
                </text>
              )}

              {refX !== null && refValue !== undefined && reference && (
                <g>
                  {band ? (
                    <line
                      x1={0}
                      x2={innerW}
                      y1={refX}
                      y2={refX}
                      stroke="var(--sheen-fg)"
                      strokeOpacity={0.6}
                      strokeDasharray="3 3"
                    />
                  ) : (
                    <line
                      x1={refX}
                      x2={refX}
                      y1={-6}
                      y2={n * rowH}
                      stroke="var(--sheen-fg)"
                      strokeOpacity={0.6}
                      strokeDasharray="3 3"
                    />
                  )}
                  <text
                    x={band ? (rtl ? 4 : innerW - 4) : refX}
                    y={band ? refX - 6 : -10}
                    textAnchor={band ? (rtl ? "start" : "end") : "middle"}
                    className="text-2xs"
                  >
                    <tspan className="fill-sheen-fg-muted">{reference.label} </tspan>
                    <tspan className="fill-sheen-fg font-semibold tabular-nums">{format(refValue)}</tspan>
                  </text>
                </g>
              )}

              {/* Band: the shaded interval, its edges and the line of estimates. */}
              {bandShape && (
                <g className="forced-color-adjust-none">
                  <motion.path
                    d={bandShape.area}
                    fill={ink}
                    fillOpacity={0.2}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: play ? 1 : 0, d: bandShape.area }}
                    transition={{ d: move, opacity: reduced ? instant : { duration: duration.slow, delay: STEP } }}
                    className="forced-colors:fill-[CanvasText]/20"
                  />
                  {[bandShape.edgeHigh, bandShape.edgeLow].map((d, k) => (
                    <motion.path
                      key={k}
                      d={d}
                      fill="none"
                      stroke={ink}
                      strokeOpacity={0.55}
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: play ? 1 : 0, d }}
                      transition={{
                        d: move,
                        opacity: reduced ? instant : { duration: duration.slow, delay: STEP * 2 },
                      }}
                    />
                  ))}
                  <motion.path
                    d={bandShape.line}
                    fill="none"
                    stroke={ink}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: play ? 1 : 0, d: bandShape.line }}
                    transition={{ d: move, pathLength: grow(0) }}
                    className="forced-colors:stroke-[CanvasText]"
                  />
                </g>
              )}

              {hatched && bars && (
                <ChartPatternDefs id={patternUid} entries={[...hatchOf].map(([color, index]) => ({ index, color }))} />
              )}

              {rows.map((r, i) => {
                const dim = act >= 0 && act !== i;
                if (band) {
                  return (
                    <g
                      key={r.key}
                      opacity={dim ? 0.45 : 1}
                      className="transition-opacity duration-(--sheen-duration-fast) motion-reduced:transition-none"
                    >
                      {shownNames.has(i) && (
                        <text
                          x={cx(i)}
                          y={innerH + 20}
                          textAnchor="middle"
                          className={cn("text-2xs", act === i ? "fill-sheen-fg" : "fill-sheen-fg-muted")}
                        >
                          {r.label}
                        </text>
                      )}
                      {(() => {
                        const radius = act === i ? 5.5 : 4;
                        const shape = hatched ? markerPath(hatchOf.get(r.color) ?? 0, radius) : "";
                        return shape ? (
                          <motion.path
                            d={shape}
                            fill="var(--sheen-chart-surface)"
                            stroke={r.color}
                            strokeWidth={2.2}
                            strokeLinejoin="round"
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: play ? 1 : 0, x: cx(i), y: vy(r.value) }}
                            transition={{ x: move, y: move, opacity: fade(i) }}
                            className="forced-colors:stroke-[CanvasText]"
                          />
                        ) : (
                          <motion.circle
                            r={radius}
                            fill="var(--sheen-chart-surface)"
                            stroke={r.color}
                            strokeWidth={2.2}
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: play ? 1 : 0, cx: cx(i), cy: vy(r.value) }}
                            transition={{ cx: move, cy: move, opacity: fade(i) }}
                            className="forced-colors:stroke-[CanvasText]"
                          />
                        );
                      })()}
                    </g>
                  );
                }
                const y = i * rowH + rowH / 2;
                const x0 = vx(bars ? baseline : r.value);
                const xv = vx(r.value);
                const barX = Math.min(x0, xv);
                const label = truncate(r.label, nameChars);
                const nameX = rtl ? innerW + 10 : -10;
                const end = rtl ? Math.min(vx(r.low), vx(r.high)) : Math.max(vx(r.low), vx(r.high));
                return (
                  <g
                    key={r.key}
                    opacity={dim ? 0.45 : 1}
                    className="transition-opacity duration-(--sheen-duration-fast) motion-reduced:transition-none"
                  >
                    <text
                      x={nameX}
                      y={y}
                      dy="0.32em"
                      textAnchor={rtl ? "start" : "end"}
                      className={cn("text-xs", act === i ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
                    >
                      {label}
                      {label !== r.label && <title>{r.label}</title>}
                    </text>
                    {bars && (
                      <BarFlip x={barX} width={Math.max(1, Math.abs(xv - x0))} transition={move}>
                        <motion.rect
                          x={barX}
                          width={Math.max(1, Math.abs(xv - x0))}
                          height={16}
                          y={y - 8}
                          rx={3}
                          fill={patternFill(hatched, patternUid, hatchOf.get(r.color) ?? 0, r.color)}
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={{ scaleX: play ? 1 : 0 }}
                          transition={{ scaleX: grow(i) }}
                          style={{ transformBox: "fill-box", transformOrigin: xv >= x0 ? "0% 50%" : "100% 50%" }}
                          className="forced-color-adjust-none forced-colors:fill-[CanvasText]"
                        />
                      </BarFlip>
                    )}
                    {/* The whisker: ink over a surface halo, so it reads on the bar and off it. */}
                    <motion.g
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: play ? 1 : 0 }}
                      transition={{ opacity: fade(i) }}
                    >
                      <path
                        d={`M${vx(r.low)},${y}H${vx(r.high)}M${vx(r.low)},${y - CAP}V${y + CAP}M${vx(r.high)},${y - CAP}V${y + CAP}`}
                        fill="none"
                        {...halo}
                      />
                      <path
                        d={`M${vx(r.low)},${y}H${vx(r.high)}M${vx(r.low)},${y - CAP}V${y + CAP}M${vx(r.high)},${y - CAP}V${y + CAP}`}
                        fill="none"
                        stroke="var(--sheen-fg)"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                      />
                      {!bars &&
                        (() => {
                          const radius = act === i ? 7 : 5.5;
                          const shape = hatched ? markerPath(hatchOf.get(r.color) ?? 0, radius) : "";
                          return shape ? (
                            <path
                              d={shape}
                              transform={`translate(${xv},${y})`}
                              fill={r.color}
                              stroke="var(--sheen-chart-surface)"
                              strokeWidth={2}
                              strokeLinejoin="round"
                              className="forced-colors:fill-[CanvasText]"
                            />
                          ) : (
                            <circle
                              cx={xv}
                              cy={y}
                              r={radius}
                              fill={r.color}
                              stroke="var(--sheen-chart-surface)"
                              strokeWidth={2}
                              className="forced-colors:fill-[CanvasText]"
                            />
                          );
                        })()}
                    </motion.g>
                    {showValues && (
                      <text
                        x={end + (rtl ? -8 : 8)}
                        y={y}
                        dy="0.32em"
                        textAnchor={rtl ? "end" : "start"}
                        className="fill-sheen-fg text-xs font-medium tabular-nums"
                      >
                        {format(r.value)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Hit area: a whole row (or column) per item. */}
              <rect
                x={-startX}
                y={band ? -plotTop : -TOP}
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
            // Horizontal rows are short: let the tooltip hang below the last one rather than cover its own row.
            bounds={{ w: width, h: band ? chartH : chartH + 72 }}
            order={band ? ["right", "left", "above", "below"] : ["below", "above", "right", "left"]}
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
