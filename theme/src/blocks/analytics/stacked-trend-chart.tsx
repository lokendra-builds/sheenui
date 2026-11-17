"use client";

import { memo, useId, useMemo } from "react";

import { motion } from "motion/react";
import { cn } from "../../lib/cn";

import { ChartEmpty, type TooltipRow } from "../../components/charts/chart-parts";
import {
  axisFormat,
  formatCompact,
  linePath,
  slotColor,
  useDataChanged,
  type ChartColor,
} from "../../components/charts/chart-utils";

import { type AnalyticsLabels, defaultAnalyticsLabels } from "./labels";
import {
  ChartReader,
  FrameAxes,
  type FrameGeometry,
  WipeClip,
  frameGeometry,
  trendSpring,
  useDashChart,
} from "./trend-frame";

/* ---------- StackedTrendChart ---------- */

/** One band of a `StackedTrendChart`: `key` indexes each datum's `values`, `color` is a palette slot. */
export type StackedTrendSeries = { key: string; label: string; color: ChartColor };

/** One x position of a `StackedTrendChart`: a `label`, an optional `long` form for tooltips, and a value per series `key`. */
export type StackedTrendDatum = { label: string; long?: string; values: Record<string, number> };

/** Strings of `StackedTrendChart`: the shared analytics chart strings plus `total`, the tooltip row of the stack total. */
export type StackedTrendChartLabels = Pick<AnalyticsLabels, "chartInstructions" | "touchHint" | "noData"> & {
  /** Tooltip row of the stack total. */
  total: string;
};

/** The English strings of `StackedTrendChart`; spread it into your own `labels` and change what you need. */
export const defaultStackedTrendChartLabels: StackedTrendChartLabels = {
  chartInstructions: defaultAnalyticsLabels.chartInstructions,
  touchHint: defaultAnalyticsLabels.touchHint,
  noData: defaultAnalyticsLabels.noData,
  total: "Total",
};

/** Props of `StackedTrendChart`. */
export type StackedTrendChartProps = {
  /** The x positions, oldest first (`StackedTrendDatum[]`, required). */
  data: StackedTrendDatum[];
  /** Bands from the bottom of the stack up, each with a fixed colour slot. */
  series: StackedTrendSeries[];
  /** Sets the plot height in pixels (`number`, default 280). */
  height?: number;
  /** Formats values in the axis and tooltip (`(n: number) => string`, default compact). */
  format?: (n: number) => string;
  /** Overrides for the chart's strings, including `total` (the tooltip row of the stack total, default "Total"). */
  labels?: Partial<StackedTrendChartLabels>;
  /** Names the chart for assistive tech (`string`, required). */
  "aria-label": string;
  /** Adds extra classes to the chart's wrapper (`string`). */
  className?: string;
};

/**
 * Stacked areas (e.g. MRR by plan): bands separated by a 2px surface line, a crisp top edge,
 * wiped in on first view, morphing on new values. Reading a point shows every band and the total.
 *
 * Props (see `StackedTrendChartProps`): `data`, `series` and `aria-label` are required; `height`
 * (`280`), `format`, `labels` (`labels.total` is the stack-total row, `"Total"`), `className`.
 * Keyboard: Tab focuses the chart; the arrow keys move between x positions, Home and End jump to the
 * ends, Escape clears; each move announces every band and the total.
 * Accessibility: `role="figure"` named by `aria-label`; the bands are told apart by order and the
 * tooltip lists them by name, not by colour alone.
 * Glass and motion: no backdrop blur on the plot; the tooltip is the shared glass surface. Bands draw
 * in once; reduced motion draws them in place.
 *
 * @example
 * ```tsx
 * import { StackedTrendChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StackedTrendChart
 *       aria-label="Traffic by channel"
 *       series={[{ key: "search", label: "Search", color: 1 }, { key: "social", label: "Social", color: 2 }]}
 *       data={[{ label: "Mon", values: { search: 120, social: 40 } }, { label: "Tue", values: { search: 150, social: 55 } }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function StackedTrendChart({
  data,
  series,
  height = 280,
  format = formatCompact,
  labels: labelsProp,
  "aria-label": ariaLabel,
  className,
}: StackedTrendChartProps) {
  const t = { ...defaultStackedTrendChartLabels, ...labelsProp };
  const id = useId().replace(/:/g, "");
  const { ref: chartRef, svgRef, ...c } = useDashChart(height);
  const tickFormat = axisFormat(format === formatCompact ? undefined : format);
  const signature = data.map((d) => series.map((s) => d.values[s.key] ?? 0).join("|")).join(",");

  const geo = useMemo(() => {
    const totals = data.map((d) => series.reduce((sum, s) => sum + Math.max(0, d.values[s.key] ?? 0), 0));
    const g = frameGeometry(
      data.map((d) => d.label),
      Math.max(0, ...totals),
      c.width,
      height,
      c.docked,
      tickFormat,
    );
    // Each band sits on top of the one before it: its `lower` edge is the previous band's `upper`.
    const bands: {
      s: (typeof series)[number];
      color: string;
      edge: string;
      area: string;
      tops: (readonly [number, number])[];
    }[] = [];
    let lower = data.map(() => 0);
    for (const s of series) {
      const upper = data.map((d, i) => (lower[i] ?? 0) + Math.max(0, d.values[s.key] ?? 0));
      const top = upper.map((v, i) => [g.xs[i] ?? 0, g.y(v)] as const);
      const bottom = lower.map((v, i) => [g.xs[i] ?? 0, g.y(v)] as const).reverse();
      const edge = linePath(top, "monotone");
      const back = linePath(bottom, "monotone").replace(/^M/, "L");
      lower = upper;
      bands.push({ s, color: slotColor(s.color), edge, area: `${edge} ${back} Z`, tops: top });
    }
    return { g, bands };
  }, [data, series, c.width, height, c.docked, tickFormat]);

  const layers = useMemo(
    () => (
      <StackedLayers
        geo={geo}
        labels={data}
        id={id}
        shown={c.shown}
        reduced={c.reduced}
        signature={signature}
        tickFormat={tickFormat}
      />
    ),
    [geo, data, id, signature, c.shown, c.reduced, tickFormat],
  );

  if (data.length === 0 || series.length === 0) {
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
    const out = [...series].reverse().map((s) => ({
      label: s.label,
      value: format(d.values[s.key] ?? 0),
      color: slotColor(s.color),
      kind: "rect" as const,
    }));
    out.push({
      label: t.total,
      value: format(series.reduce((sum, s) => sum + Math.max(0, d.values[s.key] ?? 0), 0)),
      color: "transparent",
      kind: "rect",
    });
    return out;
  };
  const marks = (i: number) => (
    <>
      {geo.bands.map((b) => (
        <circle
          key={b.s.key}
          cy={b.tops[i]?.[1] ?? 0}
          r={4}
          fill={b.color}
          stroke="var(--sheen-chart-surface)"
          strokeWidth={2}
        />
      ))}
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

const StackedLayers = memo(function StackedLayers({
  geo,
  labels,
  id,
  shown,
  reduced,
  signature,
  tickFormat,
}: {
  geo: { g: FrameGeometry; bands: { s: StackedTrendSeries; color: string; edge: string; area: string }[] };
  labels: StackedTrendDatum[];
  id: string;
  shown: boolean;
  reduced: boolean;
  /** What the data looks like; compared with the last commit to tell new data (morph) from a resize (no morph). */
  signature: string;
  tickFormat: (n: number) => string;
}) {
  const changed = useDataChanged(signature);
  const { g, bands } = geo;
  const structure = `${labels.length}-${bands.length}`;
  const morph = reduced || !changed ? { duration: 0 } : trendSpring;
  return (
    <>
      <defs>
        {bands.map((b, i) => (
          <linearGradient key={b.s.key} id={`${id}-band-${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={b.color} stopOpacity={0.95} />
            <stop offset="100%" stopColor={b.color} stopOpacity={0.62} />
          </linearGradient>
        ))}
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
          {bands.map((b, i) => (
            <motion.path
              key={`${b.s.key}-${structure}`}
              fill={`url(#${id}-band-${i})`}
              initial={{ d: b.area }}
              animate={{ d: b.area }}
              transition={{ d: morph }}
            />
          ))}
          {/* 2px surface gap on each band's top edge; the top of the stack gets a crisp line in its colour. */}
          {bands.map((b, i) => (
            <motion.path
              key={`e-${b.s.key}-${structure}`}
              fill="none"
              stroke={i === bands.length - 1 ? b.color : "var(--sheen-chart-surface)"}
              strokeWidth={2}
              strokeLinejoin="round"
              initial={{ d: b.edge }}
              animate={{ d: b.edge }}
              transition={{ d: morph }}
            />
          ))}
        </g>
      </g>
    </>
  );
});
