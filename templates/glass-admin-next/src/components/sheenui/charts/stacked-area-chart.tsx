"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type TooltipRow } from "./chart-parts";
import { PercentBarTable } from "./percent-bar-chart";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import {
  chartFades,
  DockHint,
  dockHintHeight,
  dockSpace,
  FittedTooltip,
  fitTicks,
  SeriesTable,
  useDockedReadout,
  useInputSource,
} from "./chart-fit";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  clamp,
  dataSignature,
  enterEase,
  formatCompact,
  linear,
  num,
  rowKeys,
  seriesColor,
  thinLabels,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  type ChartRow,
  type ChartSeries,
  ORIGIN_PT,
  bandPath,
  curvePath as linePath,
  type Pt,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** Every string the chart shows or announces, for translation. */
export type StackedAreaChartLabels = {
  /** Last row of the tooltip: the sum of every series at that point. */
  total: string;
  /** Percent mode: a point whose values add up to 0 has no shares; it is drawn as a gap. */
  noData: string;
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a point is active. */
  touchHint: string;
};

/**
 * The built-in English strings of StackedAreaChart; spread it into your own `labels` and change what
 * you need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultStackedAreaChartLabels: StackedAreaChartLabels = {
  total: "Total",
  noData: "No data",
  instructions: "Use left and right arrow keys to read values.",
  touchHint: "Tap or drag across the chart to read values.",
};

/**
 * Props of StackedAreaChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type StackedAreaChartProps = {
  /** One object per point: the `index` key plus one number per series key. */
  data: readonly ChartRow[];
  /** Key of the x value in each row (e.g. "month"). */
  index: string;
  /** Bands from the bottom of the stack up. Give each a fixed `color` slot so filtering never repaints it. */
  series: readonly ChartSeries[];
  /**
   * "stacked": bands add up to the total.
   * "percent": every x position is scaled to 100%, so the bands show each series' share. A point
   * whose values add up to 0 has no shares: the bands break around it (a gap, marked with a
   * dashed "no data" column) instead of dipping to 0%.
   */
  mode?: "stacked" | "percent";
  /** "linear" joins points with straight lines; "monotone" with smooth curves that never overshoot a value. */
  curve?: "linear" | "monotone";
  /** Height of the chart in px; the width follows the container. Default 260. */
  height?: number;
  /** Formats values in the tooltip (and the axis in "stacked" mode). Negative values count as 0. */
  format?: (n: number) => string;
  /** Formats shares (0–100) in "percent" mode. */
  formatPercent?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell series apart without colour (hatch fills, dash styles, marker shapes). Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<StackedAreaChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP = 2; // surface gap between touching bands
const EDGE = 2; // stroke width of each band's top edge
const CHAR_W = 6.2; // average glyph width of the 11px axis labels
const percentFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
/**
 * Formats a number as a whole percent (`42%`) for StackedAreaChart's default share format. Pure, but
 * exported from a client module: call it from client code.
 */
export const formatPercentDefault = (n: number) => `${percentFormatter.format(n)}%`;

/* ---------- Curves ---------- */

/* ---------- Chart ---------- */

/**
 * Stacked areas that show how parts add up over time, in absolute values or as a share (`mode="percent"`). Use it for composition over time with up to about six series.
 *
 * Keyboard: Tab focuses the chart; Left/Right arrows move the reading one point, Home and End jump, Escape clears. Legend items (inside a ChartCard) toggle series.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce every series' value and the total. `StackedAreaTable` is the table view.
 * Glass and motion: areas draw in the first time the chart appears and tween on data change; reduced motion makes both instant. Only the glass-3 tooltip uses backdrop blur.
 *
 * @example
 * ```tsx
 * import { StackedAreaChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StackedAreaChart
 *       data={[
 *         { month: "Jan", web: 40, app: 22 },
 *         { month: "Feb", web: 46, app: 30 },
 *         { month: "Mar", web: 44, app: 35 },
 *       ]}
 *       index="month"
 *       series={[
 *         { key: "web", label: "Web" },
 *         { key: "app", label: "App" },
 *       ]}
 *       aria-label="Sessions by platform per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/stacked-area-chart
 */
export function StackedAreaChart({
  data,
  index,
  series,
  mode = "stacked",
  curve = "linear",
  height = 260,
  format = formatCompact,
  formatPercent = formatPercentDefault,
  emptyState,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<StackedAreaChartProps>) {
  const id = useId();
  const hatched = resolvePatterns(patterns, series.length);
  const t = { ...defaultStackedAreaChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const { fade, exit } = chartFades(reduced);
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const mounted = useHasMounted(width > 0 && data.length > 0);
  const [active, setActive] = useState<number | null>(null);
  const input = useInputSource();
  const percent = mode === "percent";

  // Identity of the x-axis: a new set of categories (e.g. a new time range) re-grows the bands;
  // the same categories with new values morph them.
  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const version = keys.join("\u0001");
  const dataChanged = useDataChanged(dataSignature(data, [index, ...series.map((s) => s.key)]) + mode);

  // Cumulative boundaries per row: stack[r][k] is the top of series k-1 (stack[r][0] = 0).
  const { values, stack, totals } = useMemo(() => {
    const values = data.map((row) => series.map((s) => Math.max(0, num(row[s.key]))));
    const totals = values.map((vs) => vs.reduce((sum, v) => sum + v, 0));
    const stack = values.map((vs, r) => {
      const scale = percent ? ((totals[r] ?? 0) > 0 ? 100 / (totals[r] ?? 0) : 0) : 1;
      let acc = 0;
      return [0, ...vs.map((v) => (acc += v * scale))];
    });
    return { values, stack, totals };
  }, [data, series, percent]);

  const tickFormat = percent ? formatPercent : axisFormat(format);
  /** Percent mode: rows that add up to 0 have no shares to draw. */
  const gapAt = (r: number) => percent && (totals[r] ?? 0) <= 0;

  // Narrow charts on touch screens: the readout docks in a band above the plot, clear of the finger.
  const docked = useDockedReadout(width);

  /**
   * The readout for one x position, top band first (the stack's visual order). Percent mode
   * leads with the share and keeps the raw value beside the label; `spoken` is the same for
   * screen readers: "Organic 42.5% (12.4K)".
   */
  const readoutAt = (r: number) => {
    const vs = values[r] ?? [];
    const total = totals[r] ?? 0;
    const title = String(data[r]?.[index] ?? "");
    if (gapAt(r))
      return { title, rows: [{ label: t.noData, value: "–", color: "transparent" }] as TooltipRow[], spoken: t.noData };
    const rows: TooltipRow[] = [];
    const spoken: string[] = [];
    for (let si = series.length - 1; si >= 0; si--) {
      const s = itemAt(series, si);
      const v = vs[si] ?? 0;
      const share = total > 0 ? formatPercent((v / total) * 100) : "–";
      const color = seriesColor(s, si);
      // The docked readout (touch screens) keeps to the shares; the raw values are in the table.
      rows.push(
        percent
          ? { label: docked ? s.label : `${s.label} · ${format(v)}`, value: share, color, kind: "rect" }
          : { label: s.label, value: format(v), color, kind: "rect" },
      );
      spoken.push(percent ? `${s.label} ${share} (${format(v)})` : `${s.label} ${format(v)}`);
    }
    rows.push({ label: t.total, value: format(total), color: "transparent" });
    spoken.push(`${t.total} ${format(total)}`);
    return { title, rows, spoken: spoken.join(", ") };
  };

  const dock = docked
    ? dockSpace(
        width,
        data.map((_, r) => readoutAt(r)),
      )
    : 0;

  const hi = percent ? 100 : totals.reduce((m, v) => Math.max(m, v), 0);
  const top0 = 12 + dock;
  const bottom = 28;
  const innerH = Math.max(0, height - top0 - bottom);
  const ticks = percent ? [0, 25, 50, 75, 100] : fitTicks(0, hi, { length: innerH, axis: "y", format: tickFormat });
  const top = ticks[ticks.length - 1] ?? 1;
  const widestTick = ticks.reduce((n, tk) => Math.max(n, tickFormat(tk).length), 0);
  const xLabels = data.map((row) => String(row[index] ?? ""));
  const lastHalf = ((xLabels[xLabels.length - 1]?.length ?? 0) * CHAR_W) / 2;
  const M = {
    top: top0,
    bottom,
    left: clamp(Math.ceil(widestTick * CHAR_W) + 16, 32, 80),
    right: clamp(Math.ceil(lastHalf) + 4, 16, 64),
  };
  const innerW = Math.max(0, width - M.left - M.right);
  const single = data.length === 1;

  const y = linear(0, top, innerH, 0);
  const x = (i: number) => (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  // One point has no width: draw it as a flat band across the plot so it still reads.
  const xs = single ? [0, innerW] : data.map((_, i) => x(i));
  const rowOf = (pi: number) => (single ? 0 : pi);

  // Runs of drawable points: percent mode breaks the bands around rows that add up to 0. A run
  // of one point (between two gaps) is drawn as a short flat stub so it still reads.
  const runs: number[][] = [];
  let run: number[] = [];
  xs.forEach((_, pi) => {
    if (gapAt(rowOf(pi))) {
      if (run.length > 0) runs.push(run);
      run = [];
    } else run.push(pi);
  });
  if (run.length > 0) runs.push(run);
  const gapRows = percent ? data.map((_, r) => r).filter((r) => gapAt(r)) : [];
  const gapSig = gapRows.join(",");
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const stub = Math.min(10, step * 0.3);
  const pick = (pts: Pt[], ids: number[]): Pt[] => {
    const out = ids.map((pi) => pts[pi] ?? ORIGIN_PT);
    const only = out.length === 1 ? out[0] : undefined;
    return only
      ? [
          [clamp(only[0] - stub, 0, innerW), only[1]],
          [clamp(only[0] + stub, 0, innerW), only[1]],
        ]
      : out;
  };

  const bands = series.map((s, si) => {
    const last = si === series.length - 1;
    const topPts: Pt[] = [];
    const botPts: Pt[] = [];
    const edgePts: Pt[] = [];
    xs.forEach((px, pi) => {
      const b = stack[rowOf(pi)];
      let up = y(b?.[si + 1] ?? 0);
      let down = y(b?.[si] ?? 0);
      // Inset each band by half the gap on every side it shares with a neighbour.
      if (!last) up += GAP / 2;
      if (si > 0) down -= GAP / 2;
      if (up > down) up = down = (up + down) / 2;
      topPts.push([px, up]);
      botPts.push([px, down]);
      // The 2px top edge sits just inside its band (the topmost one straddles the boundary),
      // so the surface gap to the band above stays a full 2px.
      edgePts.push([px, last ? up : Math.min(up + EDGE / 2, Math.max(up, down))]);
    });
    const flat: Pt[] = xs.map((px) => [px, innerH]);
    const each = (fn: (ids: number[]) => string) => runs.map(fn).join(" ");
    return {
      s,
      color: seriesColor(s, si),
      area: each((ids) => bandPath(pick(topPts, ids), pick(botPts, ids), curve)),
      area0: each((ids) => bandPath(pick(flat, ids), pick(flat, ids), curve)),
      line: each((ids) => linePath(pick(edgePts, ids), curve)),
      line0: each((ids) => linePath(pick(flat, ids), curve)),
      edge: edgePts,
    };
  });

  if (data.length === 0 || series.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < data.length ? active : null;
  const actValues = act !== null ? values[act] : undefined;
  const readout = act !== null ? readoutAt(act) : null;

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const i = data.length <= 1 ? 0 : Math.round((px / Math.max(1, rect.width)) * (data.length - 1));
    input.fromPointer();
    setActive(clamp(i, 0, data.length - 1));
  }
  const onKey = chartKeyHandler(data.length, act, setActive);

  // Choreography: bands rise from the baseline one after another (bottom first), then settle.
  // Data changes morph; resizes snap.
  const move = reduced || !dataChanged ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const grow = (si: number) =>
    reduced
      ? { duration: 0 }
      : !mounted
        ? { duration: duration.slower * 1.2, ease: enterEase, delay: si * 0.07 }
        : move;
  const shownLabels = thinLabels(xLabels, data.length > 1 ? innerW / (data.length - 1) : innerW);
  const fillTop = series.length > 1 ? 0.5 : 0.32;
  const fillBottom = series.length > 1 ? 0.2 : 0.04;

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width}
          height={height}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={(e) => {
            input.fromKeyboard();
            onKey(e);
          }}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
        >
          {hatched && <ChartPatternDefs id={id} entries={bands.map((b, i) => ({ index: i, color: b.color }))} />}
          <defs>
            {bands.map((b, i) => (
              <linearGradient
                key={i}
                id={`${id}-band-${i}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
                className="forced-color-adjust-none"
              >
                <stop offset="0%" stopColor={b.color} stopOpacity={fillTop} />
                <stop offset="100%" stopColor={b.color} stopOpacity={fillBottom} />
              </linearGradient>
            ))}
          </defs>

          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            <AnimatePresence initial={false}>
              {ticks.map((tk) => (
                <motion.g
                  key={`${mode}-${tk}`}
                  initial={{ opacity: 0, y: y(tk) }}
                  animate={{ opacity: 1, y: y(tk) }}
                  exit={{ opacity: 0, transition: exit }}
                  transition={{ y: move, opacity: fade(duration.base) }}
                >
                  <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                    {tickFormat(tk)}
                  </text>
                </motion.g>
              ))}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {xLabels.map((label, i) =>
                shownLabels.has(i) ? (
                  <motion.text
                    key={keys[i]}
                    y={innerH + 20}
                    textAnchor="middle"
                    className="fill-sheen-fg-muted text-2xs"
                    initial={{ opacity: 0, x: x(i) }}
                    animate={{ opacity: 1, x: x(i) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, opacity: fade(duration.base) }}
                  >
                    {label}
                  </motion.text>
                ) : null,
              )}
            </AnimatePresence>

            {/* Percent mode: a dashed "no data" column where the values add up to 0 (the bands break around it). */}
            {gapRows.map((r) => {
              const w = Math.max(6, Math.min(16, step * 0.5));
              return (
                <rect
                  key={`gap-${keys[r]}`}
                  x={clamp(x(r) - w / 2, 0, Math.max(0, innerW - w))}
                  y={0}
                  width={w}
                  height={innerH}
                  rx={4}
                  fill="var(--sheen-hover)"
                  stroke="var(--sheen-border)"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Bands, then each band's 2px top edge. A real 2px gap separates neighbours. A change in
                where the gaps are changes the paths' shape, so it re-grows instead of morphing. */}
            <g className="forced-color-adjust-none">
              <AnimatePresence>
                {bands.map((b, i) =>
                  !b.area ? null : (
                    <motion.path
                      key={`a-${b.s.key}-${version}-${gapSig}`}
                      fill={patternFill(hatched, id, i, `url(#${id}-band-${i})`)}
                      initial={reduced ? { d: b.area, opacity: 1 } : { d: b.area0, opacity: 1 }}
                      animate={{ d: b.area, opacity: 1 }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ d: grow(i), opacity: fade(duration.fast) }}
                    />
                  ),
                )}
              </AnimatePresence>
              <AnimatePresence>
                {bands.map((b, i) =>
                  !b.line ? null : (
                    <motion.path
                      key={`l-${b.s.key}-${version}-${gapSig}`}
                      fill="none"
                      stroke={b.color}
                      strokeWidth={EDGE}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reduced ? { d: b.line, opacity: 1 } : { d: b.line0, opacity: 0 }}
                      animate={{ d: b.line, opacity: 1 }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ d: grow(i), opacity: fade(duration.base, reduced || mounted ? 0 : i * 0.07) }}
                    />
                  ),
                )}
              </AnimatePresence>
            </g>

            {/* Crosshair: snaps to the nearest x; a ringed dot marks the top of every band. */}
            {act !== null && (
              <g pointerEvents="none">
                <line x1={x(act)} x2={x(act)} y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
                <g className="forced-color-adjust-none">
                  {bands.map((b, i) => {
                    const pt = b.edge[single ? 0 : act];
                    return pt && (actValues?.[i] ?? 0) > 0 ? (
                      <circle
                        key={i}
                        cx={x(act)}
                        cy={pt[1]}
                        r={4}
                        fill={b.color}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                      />
                    ) : null;
                  })}
                </g>
              </g>
            )}

            {/* Hit area: the whole plot, so the pointer only has to be near an x. Horizontal drags scrub on touch. */}
            <rect
              width={innerW}
              height={innerH}
              fill="transparent"
              style={{ touchAction: "pan-y pinch-zoom" }}
              onPointerDown={onPointer}
              onPointerMove={onPointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </g>
        </ChartFigure>
      )}

      {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
      {readout && act !== null && (
        <FittedTooltip
          title={readout.title}
          rows={readout.rows}
          x={M.left + x(act)}
          y={M.top + innerH / 2}
          containerWidth={width}
          docked={docked}
        />
      )}
      <ChartAnnouncer text={input.announce(readout ? `${readout.title}: ${readout.spoken}` : "")} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of StackedAreaTable, the table view of the chart: the chart's data and formatting props
 * plus a hidden `caption` for screen readers.
 */
export type StackedAreaTableProps = {
  /** Takes the same rows as the chart. */
  data: readonly ChartRow[];
  /** Key of each row that names its position on the axis. */
  index: string;
  /** Takes the same series as the chart. */
  series: readonly ChartSeries[];
  /** Match the chart: "percent" shows each share beside the value it comes from. */
  mode?: "stacked" | "percent";
  /** Formats a value for the data table cells: takes the number, returns the text shown. Default compact numbers. */
  format?: (n: number) => string;
  /** Formats shares in percent mode. Default whole-percent format. */
  formatPercent?: (n: number) => string;
  /** Sets the header of the first column. Defaults to `index`. */
  indexLabel?: string;
  /** Visually hidden caption naming the table (also names its scroll region). */
  caption?: string;
  /** Override the "Total" column header and the empty text. */
  labels?: Partial<Pick<StackedAreaChartLabels, "total" | "noData">>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The table view of a stacked area chart: every value per x, plus the total the tooltip shows
 * (negative values count as 0, as in the chart). In percent mode, each cell gives the share and
 * its value. Scrolls inside the card when it's wider than it.
 *
 * Takes the same `data`, `index`, `series`, `mode`, `format` and `formatPercent` as StackedAreaChart, plus `indexLabel`, `caption` (hidden, names the table) and `labels`. A real table with a Total column; it scrolls in a region that is focusable only when it overflows. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { StackedAreaTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StackedAreaTable
 *       data={[{ month: "Jan", web: 40, app: 22 }]}
 *       index="month"
 *       series={[
 *         { key: "web", label: "Web" },
 *         { key: "app", label: "App" },
 *       ]}
 *       indexLabel="Month"
 *       caption="Sessions by platform per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/stacked-area-chart
 */
export function StackedAreaTable({
  data,
  index,
  series,
  mode = "stacked",
  format = formatCompact,
  formatPercent = formatPercentDefault,
  indexLabel,
  caption,
  labels,
  className,
}: StackedAreaTableProps) {
  const t = { ...defaultStackedAreaChartLabels, ...labels };
  if (mode === "percent") {
    return (
      <PercentBarTable
        data={data}
        index={index}
        series={series}
        format={format}
        formatPercent={formatPercent}
        indexLabel={indexLabel}
        caption={caption}
        labels={{ total: t.total, noData: t.noData }}
        className={className}
      />
    );
  }
  return (
    <SeriesTable
      data={data}
      index={index}
      columns={series.map((s, i) => ({ key: s.key, label: s.label, color: seriesColor(s, i) }))}
      format={format}
      indexLabel={indexLabel}
      caption={caption}
      total={{ label: t.total, keys: series.map((s) => s.key) }}
      noData={t.noData}
      plotted={(n) => Math.max(0, n)}
      className={className}
    />
  );
}
