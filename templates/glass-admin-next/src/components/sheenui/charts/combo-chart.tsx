"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../lib/form";
import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../lib/cn";
import { duration } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, type LegendItem, type TooltipRow } from "./chart-parts";
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
  type Readout,
} from "./chart-fit";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import {
  axisFormat,
  barPath,
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
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** A series of a combo chart: drawn as bars or as a line, always against the one shared axis. */
export type ComboSeries = ChartSeries & { type: "bar" | "line" };

/** Every string the chart shows or announces, for translation. */
export type ComboChartLabels = {
  /** Tooltip row (and table column) for the sum of stacked bars. */
  total: string;
  /** Shown when there is nothing to plot, and in an empty table. */
  noData: string;
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a column is active. */
  touchHint: string;
  /** Prefix of the raw value when the chart is indexed, e.g. "Revenue (was $4.2K)". */
  indexedFrom: string;
};

/**
 * The built-in English strings of ComboChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultComboChartLabels: ComboChartLabels = {
  total: "Total",
  noData: "No data",
  instructions: "Use left and right arrow keys to read values.",
  touchHint: "Tap a column to read its values.",
  indexedFrom: "actual",
};

/**
 * Props of ComboChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type ComboChartProps = {
  /** One object per category: the `index` key plus one number per series key. */
  data: readonly ChartRow[];
  /** Key of the category in each row (e.g. "month"). */
  index: string;
  /**
   * Bars and lines on ONE y-axis: they must share a unit (e.g. orders per day and their
   * 7-day average). For measures with different units, set `indexed` instead of reaching for
   * a second axis.
   */
  series: readonly ComboSeries[];
  /** Stack the bar series instead of grouping them side by side. Ignored when `indexed` (index values don't add up). */
  stacked?: boolean;
  /**
   * Re-base every series to the same starting point (its first non-zero value = `indexBase`),
   * so measures of different units share one honest axis: "how has each changed?". A series
   * that starts negative is rebased on its absolute value, so up still means up.
   */
  indexed?: boolean;
  /** The value every series starts from when `indexed`. Default 100. */
  indexBase?: number;
  /** Height of the chart in px; the width follows the container. Default 280. */
  height?: number;
  /** Formats raw values (tooltip; the axis too unless `indexed`). */
  format?: (n: number) => string;
  /** Formats indexed values (axis and tooltip) when `indexed`. */
  formatIndex?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell the bar series apart without colour (hatch fills; the first bar series stays solid). Default: on when the
   * chart has more than 3 bar series.
   *
   * @default true when there are more than 3 bar series
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<ComboChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP = 2;
const MAX_THICKNESS = 24;
const CHAR_W = 6.2;
const indexFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const defaultFormatIndex = (n: number) => indexFormatter.format(n).replace("-", "−");

/** Legend items for a combo chart: a swatch for bar series, a line key for line series. */
export function comboLegend(
  series: readonly ComboSeries[],
  /** Hatch the bar swatches like the chart's `patterns` prop. Default: on from 4 bar series, as in the chart. */
  patterns?: boolean,
): LegendItem[] {
  const hatched = resolvePatterns(patterns, series.filter((s) => s.type !== "line").length);
  let bar = -1;
  return series.map((s, i) => {
    const isLine = s.type === "line";
    if (!isLine) bar += 1;
    return {
      label: s.label,
      color: seriesColor(s, i),
      kind: isLine ? "line" : "rect",
      pattern: !isLine && hatched && bar > 0 ? bar : undefined,
    };
  });
}

/**
 * Rebase each series so its first non-zero value equals `base`: base + change / |first| x base.
 * For a positive start that is value / first x base; a negative start is rebased on its absolute
 * value, so a value falling further below zero reads as a fall, never as growth. A series of
 * only zeros has nothing to index and stays at 0.
 */
export function indexSeries(data: readonly ChartRow[], keys: readonly string[], base = 100) {
  const firsts = keys.map((k) => data.map((row) => num(row[k])).find((v) => v !== 0) ?? 0);
  return data.map((row) =>
    keys.map((k, i) => {
      const first = firsts[i] ?? 0;
      return first ? base + ((num(row[k]) - first) / Math.abs(first)) * base : 0;
    }),
  );
}

/**
 * Bars and lines on one chart: give each series `type: "bar"` or `type: "line"`. Use it for a volume next to a rate or total (orders as bars, conversion as a line), or with `indexed` to compare series on different scales.
 *
 * Keyboard: Tab focuses the chart; Left/Right arrows move the reading one category, Home and End jump, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce every series' value. `ComboTable` is the table view.
 * Glass and motion: marks draw in the first time the chart appears and tween on data change; reduced motion makes both instant. Only the glass-3 tooltip uses backdrop blur.
 *
 * @example
 * ```tsx
 * import { ComboChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ComboChart
 *       data={[
 *         { month: "Jan", revenue: 42, margin: 31 },
 *         { month: "Feb", revenue: 51, margin: 36 },
 *         { month: "Mar", revenue: 47, margin: 34 },
 *       ]}
 *       index="month"
 *       series={[
 *         { key: "revenue", label: "Revenue", type: "bar" },
 *         { key: "margin", label: "Margin", type: "line" },
 *       ]}
 *       aria-label="Revenue and margin per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/combo-chart
 */
export function ComboChart({
  data,
  index,
  series,
  stacked = false,
  indexed = false,
  indexBase = 100,
  height = 280,
  format = formatCompact,
  formatIndex = defaultFormatIndex,
  emptyState,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<ComboChartProps>) {
  const t = { ...defaultComboChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const { fade, exit } = chartFades(reduced);
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const mounted = useHasMounted(width > 0 && data.length > 0);
  const [active, setActive] = useState<number | null>(null);
  const input = useInputSource();

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const version = keys.join("\u0001");
  const dataChanged = useDataChanged(dataSignature(data, [index, ...series.map((s) => s.key)]) + String(indexed));

  // Plotted values (indexed or raw), one array per row in series order.
  const plotted = useMemo(
    () =>
      indexed
        ? indexSeries(
            data,
            series.map((s) => s.key),
            indexBase,
          )
        : data.map((row) => series.map((s) => num(row[s.key]))),
    [data, series, indexed, indexBase],
  );
  const barSeries = series.map((s, si) => ({ s, si })).filter(({ s }) => s.type !== "line");
  const lineSeries = series.map((s, si) => ({ s, si })).filter(({ s }) => s.type === "line");
  // Indexed values don't add up (100 + 100 is not "200% of the start"), so an indexed chart groups its bars.
  const stackBars = stacked && !indexed && barSeries.length > 1;
  const patternUid = useId();
  const hatched = resolvePatterns(patterns, barSeries.length);
  const valueFormat = indexed ? formatIndex : format;
  const tickFormat = indexed ? formatIndex : axisFormat(format);

  // One shared extent. Bars always start at zero; stacks sum positives and negatives separately.
  const { lo, hi } = useMemo(() => {
    let lo = 0;
    let hi = 0;
    for (const vs of plotted) {
      let pos = 0;
      let neg = 0;
      series.forEach((s, si) => {
        const v = vs[si] ?? 0;
        if (s.type !== "line" && stackBars) {
          if (v >= 0) pos += v;
          else neg += v;
        } else {
          hi = Math.max(hi, v);
          lo = Math.min(lo, v);
        }
      });
      hi = Math.max(hi, pos);
      lo = Math.min(lo, neg);
    }
    return { lo, hi };
  }, [plotted, series, stackBars]);

  const rowTotal = (ri: number) => barSeries.reduce((sum, { si }) => sum + (plotted[ri]?.[si] ?? 0), 0);
  const rawValue = (ri: number, si: number) => num(data[ri]?.[series[si]?.key ?? ""]);

  // Narrow charts on touch screens: the readout docks in a band above the plot.
  const docked = useDockedReadout(width);

  // The readout for one category: the bars (a stack top-down, matching what's drawn), their
  // total, then the lines. Indexed charts keep each actual value beside its label.
  // The docked readout (touch screens) keeps to the index to save room; the announcement keeps it all.
  const rowFor = (ri: number, s: ComboSeries, si: number, full: boolean): TooltipRow => ({
    label: indexed && full ? `${s.label} (${t.indexedFrom} ${format(rawValue(ri, si))})` : s.label,
    value: valueFormat(plotted[ri]?.[si] ?? 0),
    color: seriesColor(s, si),
    kind: s.type === "line" ? "line" : "rect",
  });
  const readoutAt = (ri: number, full = !docked): Readout => ({
    title: String(data[ri]?.[index] ?? ""),
    rows: [
      ...(stackBars ? [...barSeries].reverse() : barSeries).map(({ s, si }) => rowFor(ri, s, si, full)),
      ...(stackBars ? [{ label: t.total, value: valueFormat(rowTotal(ri)), color: "transparent" }] : []),
      ...lineSeries.map(({ s, si }) => rowFor(ri, s, si, full)),
    ],
  });

  const dock = docked
    ? dockSpace(
        width,
        data.map((_, ri) => readoutAt(ri)),
      )
    : 0;

  const top0 = 12 + dock;
  const bottom = 28;
  const innerH = Math.max(0, height - top0 - bottom);
  const ticks = fitTicks(lo, hi, { length: innerH, axis: "y", format: tickFormat });
  const t0 = ticks[0] ?? 0;
  const t1 = ticks[ticks.length - 1] ?? 1;
  const widestTick = ticks.reduce((n, tk) => Math.max(n, tickFormat(tk).length), 0);
  const M = { top: top0, bottom, left: clamp(Math.ceil(widestTick * CHAR_W) + 16, 32, 80), right: 12 };
  const innerW = Math.max(0, width - M.left - M.right);
  const y = linear(t0, t1, innerH, 0);
  const zero = y(0);
  const band = innerW / Math.max(1, data.length);
  const cx = (ci: number) => ci * band + band / 2;

  const groupSize = stackBars ? 1 : Math.max(1, barSeries.length);
  const thickness = Math.max(2, Math.min(MAX_THICKNESS, (band * 0.62 - GAP * (groupSize - 1)) / groupSize));
  const groupWidth = thickness * groupSize + GAP * (groupSize - 1);

  // Bars: one shared path structure (barPath), so any bar tweens into any other.
  const bars: { key: string; d: string; d0: string; color: string; fill: string; ci: number }[] = [];
  if (barSeries.length > 0) {
    plotted.forEach((vs, ci) => {
      const start = ci * band + (band - groupWidth) / 2;
      let lastPos = -1;
      let lastNeg = -1;
      barSeries.forEach(({ si }, bi) => {
        const v = vs[si] ?? 0;
        if (v > 0) lastPos = bi;
        else if (v < 0) lastNeg = bi;
      });
      // A stack with segments on both sides of zero: both sides give up 1px at the zero line,
      // so they meet with the same 2px surface gap as every other join.
      const split = stackBars && lastPos >= 0 && lastNeg >= 0;
      let pos = 0;
      let neg = 0;
      barSeries.forEach(({ s, si }, bi) => {
        const v = vs[si] ?? 0;
        const positive = v >= 0;
        let from = 0;
        let to = v;
        if (stackBars) {
          from = positive ? pos : neg;
          to = from + v;
          if (positive) pos = to;
          else neg = to;
        }
        const isEnd = !stackBars || bi === (positive ? lastPos : lastNeg);
        let a = y(from);
        let b = y(to);
        const dir = Math.sign(b - a) || -1;
        if (stackBars && (from !== 0 || (split && v !== 0))) a += (dir * GAP) / 2;
        if (stackBars && !isEnd) b -= (dir * GAP) / 2;
        const len = Math.max(0, (b - a) * dir);
        const x0 = start + (stackBars ? 0 : bi * (thickness + GAP));
        const end = !isEnd ? "none" : positive ? "top" : "bottom";
        bars.push({
          key: `${keys[ci]}|${s.key}`,
          d: barPath(x0, dir < 0 ? a - len : a, thickness, len, end),
          d0: barPath(x0, zero, thickness, 0, end),
          color: seriesColor(s, si),
          fill: patternFill(hatched, patternUid, bi, seriesColor(s, si)),
          ci,
        });
      });
    });
  }

  // Lines run through the centre of each category band.
  const lines = lineSeries.map(({ s, si }) => {
    const points = plotted.map((vs, ci) => [cx(ci), y(vs[si] ?? 0)] as const);
    const d = points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
    return { s, si, color: seriesColor(s, si), points, d };
  });

  if (data.length === 0 || series.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < data.length ? active : null;
  const readout = act !== null ? readoutAt(act) : null;
  const spoken = act !== null ? readoutAt(act, true) : null;

  const onKey = chartKeyHandler(data.length, act, setActive);

  // Choreography: bars grow (staggered), then each line draws across them and its end dot lands.
  const move = reduced || !dataChanged ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const grow = (ci: number) =>
    reduced
      ? { duration: 0 }
      : !mounted
        ? { duration: duration.slower, ease: enterEase, delay: Math.min(ci * 0.04, 0.4) }
        : move;
  const lineDelay = reduced || mounted || bars.length === 0 ? 0 : duration.slower * 0.6;
  const draw = reduced ? 0 : mounted ? duration.slower : duration.slower * 1.5;
  const endDelay = reduced || data.length === 1 ? 0 : lineDelay + draw * 0.8;
  const shownLabels = thinLabels(
    data.map((row) => String(row[index] ?? "")),
    band,
  );
  const baseLine = indexed && indexBase >= t0 && indexBase <= t1 ? y(indexBase) : null;

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
          className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
        >
          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            <AnimatePresence initial={false}>
              {ticks.map((tk) => (
                <motion.g
                  key={`${indexed}-${tk}`}
                  initial={{ opacity: 0, y: y(tk) }}
                  animate={{ opacity: 1, y: y(tk) }}
                  exit={{ opacity: 0, transition: exit }}
                  transition={{ y: move, opacity: fade(duration.base) }}
                >
                  <line x2={innerW} stroke={tk === 0 && t0 < 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                    {tickFormat(tk)}
                  </text>
                </motion.g>
              ))}
            </AnimatePresence>

            {/* Indexed: a firmer line at the common starting value. */}
            {baseLine !== null && (
              <line x2={innerW} y1={baseLine} y2={baseLine} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
            )}

            <AnimatePresence initial={false}>
              {data.map((row, ci) =>
                shownLabels.has(ci) ? (
                  <motion.text
                    key={keys[ci]}
                    y={innerH + 20}
                    textAnchor="middle"
                    className="fill-sheen-fg-muted text-2xs"
                    initial={{ opacity: 0, x: cx(ci) }}
                    animate={{ opacity: 1, x: cx(ci) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, opacity: fade(duration.base) }}
                  >
                    {String(row[index] ?? "")}
                  </motion.text>
                ) : null,
              )}
            </AnimatePresence>

            {act !== null && (
              <rect
                x={act * band + 2}
                y={-4}
                width={Math.max(0, band - 4)}
                height={innerH + 4}
                rx={8}
                fill="var(--sheen-hover)"
              />
            )}

            {hatched && (
              <ChartPatternDefs
                id={patternUid}
                entries={barSeries.map(({ s, si }, bi) => ({ index: bi, color: seriesColor(s, si) }))}
              />
            )}

            <g className="forced-color-adjust-none">
              <AnimatePresence>
                {bars.map((b) => (
                  <motion.path
                    key={b.key}
                    fill={b.fill}
                    initial={reduced ? false : { d: b.d0, opacity: 1 }}
                    animate={{ d: b.d, opacity: act === null || act === b.ci ? 1 : 0.45 }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ d: grow(b.ci), opacity: fade(duration.fast) }}
                  />
                ))}
              </AnimatePresence>

              {/* Lines over bars: a 6px surface halo underneath keeps them legible where they cross a bar. */}
              <AnimatePresence>
                {lines.map((l) => (
                  <motion.g key={`l-${l.s.key}-${version}`} exit={{ opacity: 0, transition: exit }}>
                    {bars.length > 0 && (
                      <motion.path
                        fill="none"
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: reduced ? 1 : 0, d: l.d }}
                        animate={{ pathLength: 1, d: l.d }}
                        transition={{ pathLength: { duration: draw, ease: enterEase, delay: lineDelay }, d: move }}
                      />
                    )}
                    <motion.path
                      fill="none"
                      stroke={l.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduced ? 1 : 0, d: l.d }}
                      animate={{ pathLength: 1, d: l.d }}
                      transition={{ pathLength: { duration: draw, ease: enterEase, delay: lineDelay }, d: move }}
                    />
                  </motion.g>
                ))}
              </AnimatePresence>

              {/* End dots (2px surface ring) land as each line arrives. */}
              <AnimatePresence>
                {lines.map((l) => {
                  const last = l.points[l.points.length - 1];
                  return last ? (
                    <motion.circle
                      key={`e-${l.s.key}-${version}`}
                      r={4}
                      fill={l.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      initial={{ opacity: 0, cx: last[0], cy: last[1] }}
                      animate={{ opacity: 1, cx: last[0], cy: last[1] }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ cx: move, cy: move, opacity: fade(duration.base, endDelay) }}
                    />
                  ) : null;
                })}
              </AnimatePresence>

              {act !== null &&
                lines.map((l) => {
                  const pt = l.points[act];
                  return pt ? (
                    <circle
                      key={`a-${l.s.key}`}
                      cx={pt[0]}
                      cy={pt[1]}
                      r={4.5}
                      fill={l.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  ) : null;
                })}
            </g>

            {/* Hit areas: one per category, the full plot height. */}
            {data.map((_, ci) => (
              <rect
                key={`hit-${keys[ci]}`}
                x={ci * band}
                width={band}
                height={innerH}
                fill="transparent"
                onPointerEnter={() => {
                  input.fromPointer();
                  setActive(ci);
                }}
                onPointerDown={() => {
                  input.fromPointer();
                  setActive(ci);
                }}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              />
            ))}
          </g>
        </ChartFigure>
      )}

      {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
      {readout && act !== null && (
        <FittedTooltip
          title={readout.title}
          rows={readout.rows}
          x={M.left + cx(act)}
          y={M.top + innerH / 2}
          containerWidth={width}
          docked={docked}
        />
      )}
      <ChartAnnouncer
        text={input.announce(
          spoken ? `${spoken.title}: ${spoken.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : "",
        )}
      />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of ComboTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type ComboTableProps = {
  /** Takes the same rows as the chart. */
  data: readonly ChartRow[];
  /** Key of each row that names its category. */
  index: string;
  /** The same series as the chart (bars and lines). */
  series: readonly ComboSeries[];
  /** Match the chart: adds a Total column (the sum of the bar series). */
  stacked?: boolean;
  /** Formats the actual values (an indexed chart's table shows the real data, not the index). */
  format?: (n: number) => string;
  /** Sets the header of the first column. Defaults to `index`. */
  indexLabel?: string;
  /** Visually hidden caption naming the table (also names its scroll region). */
  caption?: string;
  /** Override the "Total" column header and the empty text. */
  labels?: Partial<Pick<ComboChartLabels, "total" | "noData">>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The table view of a combo chart: the actual values of every series (headed by a swatch for
 * bars, a line key for lines), plus the stack's total when `stacked`. Scrolls inside the card
 * when it's wider than it.
 *
 * Takes the same `data`, `index`, `series` and `stacked` props as ComboChart, plus `indexLabel` (first column header), `caption` (hidden, names the table) and `labels`. A real table in a scroll region that is focusable only when it overflows. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { ComboTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ComboTable
 *       data={[{ month: "Jan", revenue: 42, margin: 31 }]}
 *       index="month"
 *       series={[
 *         { key: "revenue", label: "Revenue", type: "bar" },
 *         { key: "margin", label: "Margin", type: "line" },
 *       ]}
 *       indexLabel="Month"
 *       caption="Revenue and margin per month"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/combo-chart
 */
export function ComboTable({
  data,
  index,
  series,
  stacked = false,
  format = formatCompact,
  indexLabel,
  caption,
  labels,
  className,
}: ComboTableProps) {
  const t = { ...defaultComboChartLabels, ...labels };
  const bars = series.filter((s) => s.type !== "line");
  return (
    <SeriesTable
      data={data}
      index={index}
      columns={series.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: seriesColor(s, i),
        kind: s.type === "line" ? "line" : "rect",
      }))}
      format={format}
      indexLabel={indexLabel}
      caption={caption}
      total={stacked && bars.length > 1 ? { label: t.total, keys: bars.map((s) => s.key) } : undefined}
      noData={t.noData}
      className={className}
    />
  );
}
