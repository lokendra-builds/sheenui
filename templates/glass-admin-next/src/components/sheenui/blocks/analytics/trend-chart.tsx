"use client";

import type { ComponentProps } from "react";
import { memo, useId, useMemo } from "react";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";

import { ChartEmpty, type TooltipRow } from "../../charts/chart-parts";
import {
  areaPath,
  axisFormat,
  chartGlow,
  formatCompact,
  linePath,
  slotColor,
  useDataChanged,
  type ChartColor,
} from "../../charts/chart-utils";

import { changeRatio, formatChange } from "./data";
import { type AnalyticsLabels, defaultAnalyticsLabels } from "./labels";
import { type PanelLegendItem } from "./panel";
import {
  ChartReader,
  FrameAxes,
  type FrameGeometry,
  type Pt,
  WipeClip,
  frameGeometry,
  trendSpring,
  useDashChart,
} from "./trend-frame";

/* ====================================================================================
 * Trend chart: area + dashed previous period
 * ==================================================================================== */

/** One point of a `TrendChart` or `TrendTable`. */
export type TrendDatum = {
  /** Short axis label ("Mon", "14:00"). */
  label: string;
  /** Tooltip / announcement label (defaults to `label`). */
  long?: string;
  /** The measured value (`number`). */
  value: number;
  /** Same point of the previous period. */
  previous?: number | null;
};

/** Props of `TrendChart`. */
export type TrendChartProps = {
  /** The points, oldest first (`TrendDatum[]`, required). */
  data: TrendDatum[];
  /** Sets the name of the series (tooltip, table). */
  seriesLabel: string;
  /** Palette slot (1–8) of the series line and its area. Default 1. */
  color?: ChartColor;
  /** Draw the previous period as a dashed, muted line. */
  compare?: boolean;
  /** Pulse the latest point (live data). */
  live?: boolean;
  /** Sets the plot height in pixels (`number`, default 280). */
  height?: number;
  /** Formats values in the axis and tooltip (`(n: number) => string`, default compact: 12.8K). */
  format?: (n: number) => string;
  /** BCP 47 locale for dates and numbers in announcements (`string`, default the runtime's). */
  locale?: string;
  /** Overrides for the chart's strings (`Partial<Pick<AnalyticsLabels, …>>`). */
  labels?: Partial<
    Pick<AnalyticsLabels, "previousPeriod" | "changeLabel" | "chartInstructions" | "touchHint" | "noData">
  >;
  /** Names the chart for assistive tech (`string`, required). */
  "aria-label": string;
  /** Adds extra classes to the chart's wrapper (`string`). */
  className?: string;
};

/* ---------- TrendChart ---------- */

/**
 * The hero chart of a dashboard: gradient area, 2px line, dashed previous period. It draws in
 * on first view; a new range (another number of points) re-draws; new values on the same points
 * (live ticks, filters, Compare) morph on a spring. Pointer and keyboard read any point.
 *
 * Props (see `TrendChartProps`): `data`, `seriesLabel` and `aria-label` are required; `color` (slot
 * `1`), `compare` (`false`), `live` (`false`), `height` (`280`), `format`, `locale`, `labels`,
 * `className`. Pair it with `TrendTable` for the data table.
 * Keyboard: Tab focuses the chart; Left and Right (or Up and Down) move the crosshair between points,
 * Home and End jump to the first and last, Escape clears. Each move is announced as value, date and
 * change. Touch: press and drag; a hint explains it once.
 * Accessibility: `role="figure"` named by `aria-label`; the instructions are its description; the
 * previous period is a dashed line (a shape cue), not only a lighter colour.
 * Glass and motion: the plot has no backdrop blur; the tooltip is the shared glass surface. The line
 * draws in once; the latest point pulses only while `live` is true and on screen. Reduced motion draws
 * it in place.
 *
 * @example
 * ```tsx
 * import { TrendChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TrendChart
 *       seriesLabel="Visitors"
 *       aria-label="Visitors per day"
 *       data={[{ label: "Mon", value: 120 }, { label: "Tue", value: 180, previous: 150 }, { label: "Wed", value: 160 }]}
 *       compare
 *     />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function TrendChart({
  data,
  seriesLabel,
  color = 1,
  compare = false,
  live = false,
  height = 280,
  format = formatCompact,
  locale,
  labels: labelsProp,
  "aria-label": ariaLabel,
  className,
}: TrendChartProps) {
  const t = { ...defaultAnalyticsLabels, ...labelsProp };
  const id = useId().replace(/:/g, "");
  const { ref: chartRef, svgRef, ...c } = useDashChart(height);
  const n = data.length;
  const stroke = slotColor(color);
  const hasPrev = compare && data.some((d) => d.previous !== null && d.previous !== undefined);
  const tickFormat = axisFormat(format === formatCompact ? undefined : format);
  const signature = data.map((d) => `${d.value}|${d.previous ?? ""}`).join(",") + (hasPrev ? "c" : "");

  const geo = useMemo(() => {
    let max = 0;
    for (const d of data) {
      max = Math.max(max, d.value);
      if (hasPrev && d.previous != null) max = Math.max(max, d.previous);
    }
    const g = frameGeometry(
      data.map((d) => d.label),
      max,
      c.width,
      height,
      c.docked,
      tickFormat,
    );
    const points = data.map((d, i) => [g.xs[i] ?? 0, g.y(d.value)] as const);
    const prevPoints = data.map((d, i) => [g.xs[i] ?? 0, g.y(d.previous ?? 0)] as const);
    return {
      g,
      points,
      prevPoints,
      line: linePath(points, "monotone"),
      area: areaPath(points, g.innerH, "monotone"),
      prevLine: linePath(prevPoints, "monotone"),
    };
  }, [data, hasPrev, c.width, height, c.docked, tickFormat]);

  // The layers compare the data signature with the last commit themselves; a later render
  // (reading a point) keeps the same element, so React skips the layers entirely.
  const layers = useMemo(
    () => (
      <TrendLayers
        geo={geo}
        labels={data}
        id={id}
        stroke={stroke}
        hasPrev={hasPrev}
        live={live}
        pulse={c.pulse}
        shown={c.shown}
        reduced={c.reduced}
        signature={signature}
        tickFormat={tickFormat}
      />
    ),
    [geo, data, id, signature, stroke, hasPrev, live, c.pulse, c.shown, c.reduced, tickFormat],
  );

  if (n === 0) {
    return (
      <div className={className}>
        <ChartEmpty height={height} aria-label={ariaLabel}>
          {t.noData}
        </ChartEmpty>
      </div>
    );
  }

  const rows = (i: number): TooltipRow[] => {
    const d = data[i];
    if (!d) return [];
    const out: TooltipRow[] = [{ label: seriesLabel, value: format(d.value), color: stroke }];
    if (hasPrev && d.previous != null) {
      out.push({ label: t.previousPeriod, value: format(d.previous), color: "var(--sheen-fg-subtle)" });
      const r = changeRatio(d.value, d.previous);
      if (r !== null) out.push({ label: t.changeLabel, value: formatChange(r, locale), color: "transparent" });
    }
    return out;
  };
  const marks = (i: number) => (
    <>
      {hasPrev && data[i]?.previous != null && (
        <circle
          cy={geo.prevPoints[i]?.[1]}
          r={3.5}
          fill="var(--sheen-chart-surface)"
          stroke="var(--sheen-fg-subtle)"
          strokeWidth={1.5}
        />
      )}
      <circle
        cy={geo.points[i]?.[1]}
        r={5}
        fill={stroke}
        stroke="var(--sheen-chart-surface)"
        strokeWidth={2}
        style={{ filter: chartGlow(stroke, 8) }}
      />
    </>
  );

  return (
    <div ref={chartRef} className={cn("relative w-full", className)} style={{ height }}>
      {c.width > 0 && (
        <ChartReader
          width={c.width}
          height={height}
          geo={geo.g}
          docked={c.docked}
          items={data}
          layers={layers}
          marks={marks}
          rows={rows}
          reduced={c.reduced}
          svgRef={svgRef}
          ariaLabel={ariaLabel}
          instructions={t.chartInstructions}
          touchHint={t.touchHint}
        />
      )}
    </div>
  );
}

const TrendLayers = memo(function TrendLayers({
  geo,
  labels,
  id,
  stroke,
  hasPrev,
  live,
  pulse,
  shown,
  reduced,
  signature,
  tickFormat,
}: {
  geo: { g: FrameGeometry; points: Pt[]; line: string; area: string; prevLine: string };
  labels: TrendDatum[];
  id: string;
  stroke: string;
  hasPrev: boolean;
  live: boolean;
  pulse: boolean;
  shown: boolean;
  reduced: boolean;
  /** What the data looks like; compared with the last commit to tell new data (morph) from a resize (no morph). */
  signature: string;
  tickFormat: (n: number) => string;
}) {
  const changed = useDataChanged(signature);
  const { g, points, line, area, prevLine } = geo;
  const n = points.length;
  // Same number of points → morph; a new count (another range) → re-draw.
  const structure = String(n);
  const morph = reduced || !changed ? { duration: 0 } : trendSpring;
  const last = points[n - 1] ?? ([0, 0] as const);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
          <stop offset="55%" stopColor={stroke} stopOpacity={0.09} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
        <WipeClip
          id={`${id}-wipe`}
          structure={structure}
          innerW={g.innerW}
          innerH={g.innerH}
          shown={shown}
          reduced={reduced}
        />
      </defs>

      <g aria-hidden transform={`translate(${g.left},${g.top})`}>
        <FrameAxes
          geo={g}
          labels={labels.map((d) => d.label)}
          structure={structure}
          morph={morph}
          tickFormat={tickFormat}
        />

        <g clipPath={`url(#${id}-wipe)`}>
          <motion.path
            key={`a-${structure}`}
            fill={`url(#${id}-fill)`}
            initial={{ d: area }}
            animate={{ d: area }}
            transition={{ d: morph }}
          />
          <AnimatePresence>
            {hasPrev && (
              <motion.path
                key={`p-${structure}`}
                fill="none"
                stroke="var(--sheen-fg-subtle)"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                strokeLinecap="round"
                initial={{ opacity: 0, d: prevLine }}
                animate={{ opacity: 1, d: prevLine }}
                exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
                transition={{ d: morph, opacity: { duration: duration.slow } }}
              />
            )}
          </AnimatePresence>
        </g>

        <motion.path
          key={`l-${structure}`}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduced ? 1 : 0, d: line }}
          animate={{ pathLength: shown ? 1 : 0, d: line }}
          transition={{ pathLength: { duration: reduced ? 0 : duration.slower, ease: ease.out }, d: morph }}
        />

        {/* Latest point: a dot with a surface ring, pinging while live (paused off-screen). */}
        {live && (
          <motion.circle
            r={4}
            fill={stroke}
            className="[transform-box:fill-box] [transform-origin:center] motion-ok:animate-ping"
            style={{ animationPlayState: pulse ? "running" : "paused" }}
            initial={false}
            animate={{ cx: last[0], cy: last[1] }}
            transition={morph}
          />
        )}
        <motion.circle
          r={4}
          fill={stroke}
          stroke="var(--sheen-chart-surface)"
          strokeWidth={2}
          initial={{ opacity: 0, cx: last[0], cy: last[1] }}
          animate={{ opacity: shown ? 1 : 0, cx: last[0], cy: last[1] }}
          transition={{ cx: morph, cy: morph, opacity: { duration: duration.base, delay: reduced ? 0 : 0.8 } }}
        />
      </g>
    </>
  );
});

/**
 * Table view of a TrendChart.
 *
 * Props: `data` (`TrendDatum[]`), `seriesLabel` (`string`) and `indexLabel` (`string`, the first
 * column's heading) are required; `compare` (`boolean`, adds previous-period and change columns),
 * `format` (default compact), `locale`, `labels` (`Partial<Pick<AnalyticsLabels, "previousPeriod" |
 * "changeLabel" | "noData">>`) and `caption` (`string`, hidden caption that also names the region).
 * Pass it to `AnalyticsPanel`'s `table` prop.
 * Keyboard: the table sits in a scrollable region that is itself a tab stop, so keyboard users can
 * scroll it with the arrow keys; the header row stays pinned.
 * Accessibility: a real `<table>` with column headers; the region is labelled by `caption`.
 * Glass and motion: a solid header over the panel's glass; static (no motion).
 *
 * @example
 * ```tsx
 * import { TrendTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TrendTable
 *       indexLabel="Day"
 *       seriesLabel="Visitors"
 *       caption="Visitors per day"
 *       data={[{ label: "Mon", value: 120 }, { label: "Tue", value: 180 }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function TrendTable({
  data,
  seriesLabel,
  compare,
  format = formatCompact,
  indexLabel,
  locale,
  labels: labelsProp,
  caption,
}: {
  /** The time series to list: one object per point, with the current and optional previous value of each series. */
  data: TrendDatum[];
  /** Header of the value column, for example "Visitors". */
  seriesLabel: string;
  /** Add a previous-period column and a change column. */
  compare?: boolean;
  /** Formats each number in the table. */
  format?: (n: number) => string;
  /** Header of the first column, for example "Day". */
  indexLabel: string;
  /** BCP 47 locale for dates and numbers; defaults to the runtime's locale. */
  locale?: string;
  /** Overrides for the table's built-in English strings. */
  labels?: Partial<Pick<AnalyticsLabels, "previousPeriod" | "changeLabel" | "noData">>;
  /** Visually hidden caption that names the table and its scroll region. */
  caption?: string;
}) {
  const t = { ...defaultAnalyticsLabels, ...labelsProp };
  return (
    <div
      role="group"
      aria-label={caption ?? seriesLabel}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so the table can be scrolled without a mouse (WCAG 2.1.1, axe scrollable-region-focusable)
      tabIndex={0}
      className="relative max-h-80 overflow-auto overscroll-contain rounded-sheen-sm [scrollbar-width:thin]"
    >
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="sticky top-0 text-xs text-sheen-fg-muted [background:var(--sheen-surface-solid)]">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-4 font-medium">
              {indexLabel}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {seriesLabel}
            </th>
            {compare && (
              <>
                <th scope="col" className="py-2 pe-4 text-end font-medium">
                  {t.previousPeriod}
                </th>
                <th scope="col" className="py-2 pe-4 text-end font-medium">
                  {t.changeLabel}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={compare ? 4 : 2} className="py-6 text-center text-sheen-fg-muted">
                {t.noData}
              </td>
            </tr>
          ) : (
            data.map((d, i) => {
              const r = changeRatio(d.value, d.previous);
              return (
                <tr key={i} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className="py-2 pe-4 font-normal whitespace-nowrap text-sheen-fg-muted">
                    {d.long ?? d.label}
                  </th>
                  <td className="py-2 pe-4 text-end tabular-nums">{format(d.value)}</td>
                  {compare && (
                    <>
                      <td className="py-2 pe-4 text-end text-sheen-fg-muted tabular-nums">
                        {d.previous != null ? format(d.previous) : "–"}
                      </td>
                      <td className="py-2 pe-4 text-end tabular-nums">{r !== null ? formatChange(r, locale) : "–"}</td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Legend items for a trend chart (series + dashed previous period when comparing). */
export function trendLegend(
  seriesLabel: string,
  color: ChartColor,
  compare: boolean,
  previousLabel: string,
): PanelLegendItem[] {
  return compare
    ? [
        { label: seriesLabel, color: slotColor(color), kind: "line" },
        { label: previousLabel, color: "var(--sheen-fg-subtle)", kind: "dashed" },
      ]
    : [];
}

/** Props of {@link TrendTable}. Table view of a TrendChart. */
export type TrendTableProps = ComponentProps<typeof TrendTable>;
