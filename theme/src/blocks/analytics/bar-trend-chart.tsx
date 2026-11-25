"use client";

import { memo, useEffect, useId, useMemo, useRef } from "react";

import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";

import { ChartEmpty, type TooltipRow } from "../../components/charts/chart-parts";
import {
  axisFormat,
  barPath,
  chartGlow,
  clamp,
  formatCompact,
  linePath,
  slotColor,
  useDataChanged,
  type ChartColor,
} from "../../components/charts/chart-utils";

import { changeRatio, formatChange } from "./data";
import { type AnalyticsLabels, defaultAnalyticsLabels } from "./labels";
import {
  ChartReader,
  FrameAxes,
  type FrameGeometry,
  WipeClip,
  easeOutCubic,
  frameGeometry,
  trendSpring,
  useDashChart,
} from "./trend-frame";

/* ---------- BarTrendChart: bars + line on one axis ---------- */

/** One bar of a `BarTrendChart`. */
export type BarTrendDatum = {
  /** Short axis label. */
  label: string;
  /** Longer label for the tooltip and announcements (defaults to `label`). */
  long?: string;
  /** The bar's value (`number`). */
  value: number;
  /** The line (a moving average, a target… same unit as the bars). */
  line?: number | null;
  /** Same point of the previous period (dashed when `compare`). */
  previous?: number | null;
};

/** Props of `BarTrendChart`. */
export type BarTrendChartProps = {
  /** Lists the bars, oldest first (`BarTrendDatum[]`, required). */
  data: BarTrendDatum[];
  /** Name of the bar series (`string`, required): tooltip and table. */
  seriesLabel: string;
  /** Name of the line series (omit to hide the line). */
  lineLabel?: string;
  /** Sets the palette slot (1–8) used for the bars. Default 1. */
  color?: ChartColor;
  /** Sets the palette slot (1–8) used for the line. Default 2. */
  lineColor?: ChartColor;
  /** Draw the previous period as a dashed, muted line. */
  compare?: boolean;
  /** Sets the plot height in pixels (`number`, default 300). */
  height?: number;
  /** Formats values in the axis and tooltip (`(n: number) => string`, default compact). */
  format?: (n: number) => string;
  /** BCP 47 locale for dates and numbers in announcements (`string`, default the runtime's). */
  locale?: string;
  /** Overrides for the chart's strings. */
  labels?: Partial<
    Pick<AnalyticsLabels, "previousPeriod" | "changeLabel" | "chartInstructions" | "touchHint" | "noData">
  >;
  /** Names the chart for assistive tech (`string`, required). */
  "aria-label": string;
  /** Adds extra classes to the chart's wrapper (`string`). */
  className?: string;
};

/**
 * Bars (≤ 24px, rounded data-end, 2px gaps) with a line on the same axis and the previous
 * period dashed. All bars are ONE path driven by one progress value: they grow from the
 * baseline in a wave on first view and tween on new data, at the cost of a single element.
 *
 * Props (see `BarTrendChartProps`): `data`, `seriesLabel` and `aria-label` are required; `lineLabel`
 * (omit to hide the line), `color` (`1`), `lineColor` (`2`), `compare` (`false`), `height` (`300`),
 * `format`, `locale`, `labels`, `className`.
 * Keyboard: Tab focuses the chart; the arrow keys move between bars, Home and End jump to the ends,
 * Escape clears; each move announces the bar, the line value and the change.
 * Accessibility: `role="figure"` named by `aria-label`; the line and the previous period differ by
 * shape (solid or dashed), not just colour.
 * Glass and motion: no backdrop blur on the plot; the tooltip is the shared glass surface. Bars grow
 * in once; reduced motion draws them in place.
 *
 * @example
 * ```tsx
 * import { BarTrendChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BarTrendChart
 *       seriesLabel="Orders"
 *       lineLabel="7-day average"
 *       aria-label="Orders per day"
 *       data={[{ label: "Mon", value: 42, line: 38 }, { label: "Tue", value: 51, line: 40 }, { label: "Wed", value: 47, line: 43 }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /dashboards/ecommerce
 */
export function BarTrendChart({
  data,
  seriesLabel,
  lineLabel,
  color = 1,
  lineColor = 2,
  compare = false,
  height = 300,
  format = formatCompact,
  locale,
  labels: labelsProp,
  "aria-label": ariaLabel,
  className,
}: BarTrendChartProps) {
  const t = { ...defaultAnalyticsLabels, ...labelsProp };
  const id = useId().replace(/:/g, "");
  const { ref: chartRef, svgRef, ...c } = useDashChart(height);
  const fill = slotColor(color);
  const lineStroke = slotColor(lineColor);
  const hasLine = Boolean(lineLabel) && data.some((d) => d.line != null);
  const hasPrev = compare && data.some((d) => d.previous != null);
  const tickFormat = axisFormat(format === formatCompact ? undefined : format);
  const signature = data.map((d) => `${d.value}|${d.line ?? ""}|${d.previous ?? ""}`).join(",") + (hasPrev ? "c" : "");

  const geo = useMemo(() => {
    let max = 0;
    for (const d of data) {
      max = Math.max(max, d.value, hasLine ? (d.line ?? 0) : 0, hasPrev ? (d.previous ?? 0) : 0);
    }
    const g = frameGeometry(
      data.map((d) => d.label),
      max,
      c.width,
      height,
      c.docked,
      tickFormat,
      true,
    );
    const barW = clamp(Math.min(24, g.step - 2), 1, 24);
    const heights = data.map((d) => g.innerH - g.y(d.value));
    const linePoints = data.map((d, i) => [g.xs[i] ?? 0, g.y(d.line ?? 0)] as const);
    const prevPoints = data.map((d, i) => [g.xs[i] ?? 0, g.y(d.previous ?? 0)] as const);
    return {
      g,
      barW,
      heights,
      linePoints,
      prevPoints,
      line: linePath(linePoints, "monotone"),
      prevLine: linePath(prevPoints, "monotone"),
    };
  }, [data, hasLine, hasPrev, c.width, height, c.docked, tickFormat]);

  const layers = useMemo(
    () => (
      <BarLayers
        geo={geo}
        labels={data}
        id={id}
        fill={fill}
        lineStroke={lineStroke}
        hasLine={hasLine}
        hasPrev={hasPrev}
        shown={c.shown}
        reduced={c.reduced}
        signature={signature}
        tickFormat={tickFormat}
      />
    ),
    [geo, data, id, signature, fill, lineStroke, hasLine, hasPrev, c.shown, c.reduced, tickFormat],
  );

  if (data.length === 0) {
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
    const out: TooltipRow[] = [{ label: seriesLabel, value: format(d.value), color: fill, kind: "rect" }];
    if (hasLine && d.line != null && lineLabel)
      out.push({ label: lineLabel, value: format(d.line), color: lineStroke });
    if (hasPrev && d.previous != null) {
      out.push({ label: t.previousPeriod, value: format(d.previous), color: "var(--sheen-fg-subtle)" });
      const r = changeRatio(d.value, d.previous);
      if (r !== null) out.push({ label: t.changeLabel, value: formatChange(r, locale), color: "transparent" });
    }
    return out;
  };
  const marks = (i: number) => {
    const h = geo.heights[i] ?? 0;
    const w = geo.barW;
    return (
      <>
        {/* The bar being read: a ring in the text colour (shape, not only colour) with a soft glow. */}
        <path
          d={barPath(-w / 2 - 1.5, geo.g.innerH - h - 1.5, w + 3, h + 1.5, "top", Math.min(5.5, w / 2 + 1.5))}
          fill="none"
          stroke="var(--sheen-fg)"
          strokeWidth={1.5}
          style={{ filter: chartGlow(fill, 8) }}
        />
        {hasLine && data[i]?.line != null && (
          <circle
            cy={geo.linePoints[i]?.[1]}
            r={4}
            fill={lineStroke}
            stroke="var(--sheen-chart-surface)"
            strokeWidth={2}
          />
        )}
        {hasPrev && data[i]?.previous != null && (
          <circle
            cy={geo.prevPoints[i]?.[1]}
            r={3.5}
            fill="var(--sheen-chart-surface)"
            stroke="var(--sheen-fg-subtle)"
            strokeWidth={1.5}
          />
        )}
      </>
    );
  };

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

const BarLayers = memo(function BarLayers({
  geo,
  labels,
  id,
  fill,
  lineStroke,
  hasLine,
  hasPrev,
  shown,
  reduced,
  signature,
  tickFormat,
}: {
  geo: { g: FrameGeometry; barW: number; heights: number[]; line: string; prevLine: string };
  labels: BarTrendDatum[];
  id: string;
  fill: string;
  lineStroke: string;
  hasLine: boolean;
  hasPrev: boolean;
  shown: boolean;
  reduced: boolean;
  /** What the data looks like; compared with the last commit to tell new data (morph) from a resize (no morph). */
  signature: string;
  tickFormat: (n: number) => string;
}) {
  const changed = useDataChanged(signature);
  const { g, barW, heights, line, prevLine } = geo;
  const n = heights.length;
  const structure = String(n);
  const morph = reduced || !changed ? { duration: 0 } : trendSpring;

  // One progress value drives every bar: bar i runs over its own slice of it (a wave from the start).
  const progress = useMotionValue(reduced ? 1 : 0);
  const d = useMotionValue("");
  const anim = useRef({ from: heights.map(() => 0), to: heights, spread: 0.35, structure: "", played: false });
  const build = (p: number) => {
    const a = anim.current;
    const count = a.to.length;
    const r = Math.min(4, barW / 2);
    let out = "";
    for (let i = 0; i < count; i++) {
      const delay = count > 1 ? (i / (count - 1)) * a.spread : 0;
      const local = easeOutCubic(clamp((p - delay) / Math.max(0.0001, 1 - a.spread), 0, 1));
      const from = a.from[i] ?? 0;
      const h = Math.max(0, from + ((a.to[i] ?? 0) - from) * local);
      if (h > 0.25) out += barPath((g.xs[i] ?? 0) - barW / 2, g.innerH - h, barW, h, "top", r) + " ";
    }
    return out;
  };
  useMotionValueEvent(progress, "change", (p) => d.set(build(p)));

  useEffect(() => {
    const a = anim.current;
    // A new range, or bars that have not grown in yet (mounted off-screen): grow from the baseline.
    const fresh = a.structure !== structure || !a.played;
    // Start from what is on screen now (a tween can be interrupted), or from the baseline.
    const current = a.to.map((v, i) => {
      const delay = a.to.length > 1 ? (i / (a.to.length - 1)) * a.spread : 0;
      const local = easeOutCubic(clamp((progress.get() - delay) / Math.max(0.0001, 1 - a.spread), 0, 1));
      return (a.from[i] ?? 0) + (v - (a.from[i] ?? 0)) * local;
    });
    anim.current = {
      from: fresh ? heights.map(() => 0) : current,
      to: heights,
      spread: fresh ? 0.35 : 0.12,
      structure,
      played: true,
    };
    if (reduced || (!fresh && !changed)) {
      progress.jump(1);
      d.set(build(1));
      return;
    }
    if (!shown) {
      anim.current.played = false;
      progress.jump(0);
      d.set(build(0));
      return;
    }
    progress.jump(0);
    const controls = animate(progress, 1, { duration: fresh ? duration.slower : duration.slow, ease: ease.out });
    return () => controls.stop();
    // `build` reads the latest geometry through the closure of this render; `changed`, `d` and `progress` are read only when the geometry or visibility moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the tween restarts only when the bars, their structure, visibility, motion preference or geometry change: `build` is a new function every render, and `changed` (a boolean) is read as it was when the geometry last moved, on purpose, so it settling back to false does not restart the tween.
  }, [heights, structure, shown, reduced, barW, g.innerH, g.xs]);

  return (
    <>
      <defs>
        <linearGradient id={`${id}-bar`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={1} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.72} />
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
          labels={labels.map((dd) => dd.label)}
          structure={structure}
          morph={morph}
          tickFormat={tickFormat}
        />
        <motion.path d={d} fill={`url(#${id}-bar)`} />
        <g clipPath={`url(#${id}-wipe)`}>
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
        {hasLine && (
          <motion.path
            key={`l-${structure}`}
            fill="none"
            stroke={lineStroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduced ? 1 : 0, d: line }}
            animate={{ pathLength: shown ? 1 : 0, d: line }}
            transition={{
              pathLength: {
                duration: reduced ? 0 : duration.slower,
                ease: ease.out,
                delay: reduced ? 0 : duration.base,
              },
              d: morph,
            }}
          />
        )}
      </g>
    </>
  );
});
