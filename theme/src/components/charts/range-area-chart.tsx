"use client";

import type { ComponentProps } from "react";
import { TableScroll, useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartTooltip, LegendKey, type LegendItem, type TooltipRow } from "./chart-parts";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  clamp,
  dataSignature,
  enterEase,
  exitTransition,
  extent,
  formatCompact,
  linear,
  niceTicks,
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
  curveSegments,
  curvePath as linePath,
  type Pt,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/* ---------- Tooltip + readout geometry (also used by the step-line, bullet and radar charts) ---------- */

const TIP_CH = 6.8; // average glyph width of the 12px tooltip text (values are semibold)

/** @internal Width (px) of a floating ChartTooltip with this title and rows, estimated from its text. */
export function estimateTooltipWidth(title: string, rows: { label: string; value: string }[]) {
  // Each row: key (≤ 14) + gap 8 + value + gap 8 + label. Padding 24 + the 1px glass border on
  // each side; never under min-w-36.
  const row = rows.reduce((m, r) => Math.max(m, 30 + (r.value.length + r.label.length) * TIP_CH), 0);
  return Math.max(144, Math.max(title.length * TIP_CH, row) + 26);
}

/** @internal Height (px) of a floating ChartTooltip with this many rows (padding, title, rows, 1px border each side). */
export function estimateTooltipHeight(rowCount: number) {
  return 2 + 20 + 16 + 6 + rowCount * 16 + Math.max(0, rowCount - 1) * 4;
}

/**
 * @internal Which way a floating tooltip anchored at `x` opens: rightwards when it fits before
 * `limit`, else leftwards when it fits after 0, else towards the roomier side.
 */
export function tooltipSide(x: number, width: number, limit: number): "left" | "right" {
  if (x + 14 + width <= limit) return "right";
  if (x - 14 - width >= 0) return "left";
  return limit - x >= x ? "right" : "left";
}

/** @internal ChartTooltip opens leftwards when x is within 180px of its containerWidth: this forces a side. */
export const tooltipContainerWidth = (side: "left" | "right") => (side === "left" ? 0 : Number.POSITIVE_INFINITY);

/** @internal Classes for a wrapper (display: contents) that keeps a floating ChartTooltip on one line per row. */
export const tooltipNoWrapClass = "contents [&>div]:w-max";

/**
 * @internal Height (px) of a docked ChartTooltip readout at this chart width. Its items wrap as
 * whole units, so this packs them greedily into lines, as the browser will.
 */
export function estimateReadoutHeight(
  width: number,
  title: string,
  rows: { label: string; value: string; key?: boolean }[],
) {
  const inner = Math.max(1, width - 24);
  let lines = 1;
  let used = title.length * TIP_CH;
  for (const r of rows) {
    // Key 14 + 2 inner gaps of 6 (no key: one gap).
    const w = (r.key === false ? 6 : 26) + (r.value.length + r.label.length) * TIP_CH;
    if (used > 0 && used + 12 + w > inner) {
      lines++;
      used = w;
    } else used += (used > 0 ? 12 : 0) + w;
  }
  return Math.max(30, 12 + lines * 16 + (lines - 1) * 2);
}

/** @internal The longest string in a list (by characters). */
export const longestOf = (list: string[]) => list.reduce((m, s) => (s.length > m.length ? s : m), "");

/** "1.2K–1.6K", but "−3 – 4" once a bound is negative, so the minus never reads as part of the dash. */
export const betweenDefault = (low: string, high: string) =>
  /^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`;

/** A line with a min–max band around it (a forecast and its confidence interval, a daily low–high). */
export type RangeSeries = ChartSeries & {
  /** Key of the band's lower bound in each row. Rows without it get no band. */
  lower: string;
  /** Key of the band's upper bound in each row. */
  upper: string;
  /** What the band means, for the legend and tooltip (e.g. "80% interval"). Default "<label> range". */
  bandLabel?: string;
};

/** Every string the chart shows or announces, for translation. */
export type RangeAreaChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Marks the forecast region (and its tooltip titles). */
  forecast: string;
  /** Band name when a series has no `bandLabel`. */
  range: (seriesLabel: string) => string;
  /** A low–high pair, e.g. "1.2K–1.6K". */
  between: (low: string, high: string) => string;
  /** Table cell for a missing value. */
  missing: string;
  /** Table text when there are no rows. */
  empty: string;
};

/**
 * The built-in English strings of RangeAreaChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultRangeAreaChartLabels: RangeAreaChartLabels = {
  instructions: "Use left and right arrow keys to read values.",
  forecast: "Forecast",
  range: (label) => `${label} range`,
  between: betweenDefault,
  missing: "–",
  empty: "No data",
};

/**
 * Props of RangeAreaChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type RangeAreaChartProps = {
  /** One row per x value. Leave a value out (or null) to break the line or band there. */
  data: readonly ChartRow[];
  /** Key of the x value in each row (e.g. "month"). */
  index: string;
  /** 1–3 lines, each with its band. Give each a fixed `color` slot. */
  series: readonly RangeSeries[];
  /** "monotone" draws smooth curves that never overshoot a value; "linear" joins points with straight lines. */
  curve?: "linear" | "monotone";
  /**
   * The x value (e.g. "Jul") where the forecast starts: from there the line is dashed and the
   * region is tinted and labelled.
   */
  forecastFrom?: string;
  /** Keep zero on the value axis. Off by default: a band reads best when the axis hugs the data. */
  zero?: boolean;
  /** Height of the chart in px; the width follows the container. Default 280. */
  height?: number;
  /** Formats values in the tooltip and on the axis (the default axis format follows the tick step). */
  format?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override any built-in string (i18n). */
  labels?: Partial<RangeAreaChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const CHAR_W = 6.2; // average glyph width of the 11px axis labels

/**
 * Band fill: the line's own hue at low opacity. One band reads at 20%; overlapping bands stay
 * lighter so both remain visible. Dark surfaces get a stronger tint, where a faint one would sink.
 */
function bandFill(color: string, count: number) {
  const [light, dark] = count > 1 ? [14, 24] : [20, 30];
  return `light-dark(color-mix(in srgb, ${color} ${light}%, transparent), color-mix(in srgb, ${color} ${dark}%, transparent))`;
}

/** A row value as a number, or null when it's missing (unlike `num`, a gap is not a zero). */
function maybe(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/* ---------- Curves ---------- */

const f = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "0");

/** Index runs [start, end] over which `has(i)` holds. */
function runs(count: number, has: (i: number) => boolean) {
  const out: [number, number][] = [];
  let start = -1;
  for (let i = 0; i <= count; i++) {
    if (i < count && has(i)) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      out.push([start, i - 1]);
      start = -1;
    }
  }
  return out;
}

/* ---------- Legend + table ---------- */

/** Legend for a range chart: each line, then the band it carries, keyed exactly as drawn. */
export function rangeAreaLegend(series: readonly RangeSeries[], labels?: Partial<RangeAreaChartLabels>): LegendItem[] {
  const t = { ...defaultRangeAreaChartLabels, ...labels };
  return series.flatMap((s, i) => {
    const color = seriesColor(s, i);
    return [
      { label: s.label, color, kind: "line" as const },
      { label: s.bandLabel ?? t.range(s.label), color: bandFill(color, series.length), kind: "rect" as const },
    ];
  });
}

/**
 * The chart's table view: each line's value and its band as "low–high"; gaps read as a dash, never 0.
 *
 * Takes the chart's data props, plus `indexLabel`, `caption` (hidden, names the table) and `className`. A real table: each line's value and its band as "low to high"; a gap reads as a dash, never 0. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { RangeAreaTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RangeAreaTable
 *       data={[{ month: "Jan", sales: 40, low: 34, high: 46 }]}
 *       index="month"
 *       series={[{ key: "sales", label: "Sales", lower: "low", upper: "high" }]}
 *       indexLabel="Month"
 *       caption="Sales forecast with range"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/range-area-chart
 */
export function RangeAreaTable({
  data,
  index,
  series,
  format = formatCompact,
  indexLabel,
  caption,
  labels,
  forecastFrom,
}: {
  /** The rows to show: one object per row, holding the `index` key and the low and high keys of each series. */
  data: readonly ChartRow[];
  /** The key in each row that names the row, such as "day". It becomes the first column. */
  index: string;
  /** The range series: each names the keys that hold its low and high values. */
  series: readonly RangeSeries[];
  /** Formats each number in the table. */
  format?: (n: number) => string;
  /** Header of the first column; the `index` key when left out. */
  indexLabel?: string;
  /** Visually hidden caption naming the table for screen readers. */
  caption?: string;
  /** Overrides for the table's built-in English strings. */
  labels?: Partial<RangeAreaChartLabels>;
  /** Mark rows from this x value on as forecast. */
  forecastFrom?: string;
}) {
  const t = { ...defaultRangeAreaChartLabels, ...labels };
  const forecastAt =
    forecastFrom === undefined ? -1 : data.findIndex((row) => String(row[index] ?? "") === forecastFrom);
  const cell = (v: number | null) => (v === null ? t.missing : format(v));
  return (
    <TableScroll label={caption ?? indexLabel ?? index}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-4 font-medium">
              {indexLabel ?? index}
            </th>
            {series.map((s, i) => (
              <th key={`v-${s.key}`} scope="col" className="py-2 pe-4 text-end font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <LegendKey color={seriesColor(s, i)} kind="line" />
                  {s.label}
                </span>
              </th>
            ))}
            {series.map((s) => (
              <th key={`b-${s.key}`} scope="col" className="py-2 pe-4 text-end font-medium">
                {s.bandLabel ?? t.range(s.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={series.length * 2 + 1} className="py-6 text-center text-sheen-fg-muted">
                {t.empty}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="border-b border-sheen-border last:border-0">
                <th scope="row" className="py-2 pe-4 font-normal whitespace-nowrap text-sheen-fg-muted">
                  {String(row[index] ?? "")}
                  {forecastAt >= 0 && ri >= forecastAt && <span className="ms-1.5 text-2xs">({t.forecast})</span>}
                </th>
                {series.map((s) => (
                  <td key={`v-${s.key}`} className="py-2 pe-4 text-end tabular-nums">
                    {cell(maybe(row[s.key]))}
                  </td>
                ))}
                {series.map((s) => {
                  const lo = maybe(row[s.lower]);
                  const hi = maybe(row[s.upper]);
                  return (
                    <td key={`b-${s.key}`} className="py-2 pe-4 text-end whitespace-nowrap tabular-nums">
                      {lo === null || hi === null
                        ? t.missing
                        : t.between(format(Math.min(lo, hi)), format(Math.max(lo, hi)))}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}

/* ---------- Chart ---------- */

/**
 * Lines with a shaded band around each (low to high): a forecast with its uncertainty, a min/max range, a confidence interval. `forecastFrom` marks where actual values end and the forecast begins.
 *
 * Keyboard: Tab focuses the chart; Left/Right (Up/Down) arrows move the reading one point, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce each line and its band as "low to high"; gaps are read as a dash, never as 0. `RangeAreaTable` is the table view.
 * Glass and motion: the plot has no backdrop blur; the tooltip is the shared glass surface. Reduced motion draws bands in place.
 *
 * @example
 * ```tsx
 * import { RangeAreaChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RangeAreaChart
 *       data={[
 *         { month: "Jan", sales: 40, low: 34, high: 46 },
 *         { month: "Feb", sales: 46, low: 38, high: 54 },
 *         { month: "Mar", sales: 51, low: 41, high: 62 },
 *       ]}
 *       index="month"
 *       series={[{ key: "sales", label: "Sales", lower: "low", upper: "high" }]}
 *       aria-label="Sales forecast with range"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/range-area-chart
 */
export function RangeAreaChart({
  data,
  index,
  series,
  curve = "monotone",
  forecastFrom,
  zero = false,
  height = 280,
  format = formatCompact,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<RangeAreaChartProps>) {
  const id = useId();
  const t = { ...defaultRangeAreaChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const count = data.length;
  const mounted = useHasMounted(width > 0 && count > 0);
  const [active, setActive] = useState<number | null>(null);

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const version = keys.join("\u0001");
  const dataChanged = useDataChanged(
    dataSignature(data, [index, ...series.flatMap((s) => [s.key, s.lower, s.upper])]) + curve + (forecastFrom ?? ""),
  );

  // Missing values stay missing (null): a gap in the data is a gap in the line, never a dip to 0.
  const values = useMemo(
    () =>
      series.map((s) =>
        data.map((row) => {
          const lo = maybe(row[s.lower]);
          const hi = maybe(row[s.upper]);
          return {
            mid: maybe(row[s.key]),
            lo: lo === null || hi === null ? null : Math.min(lo, hi),
            hi: lo === null || hi === null ? null : Math.max(lo, hi),
          };
        }),
      ),
    [data, series],
  );
  const plotted = useMemo(
    () =>
      values
        .flat()
        .flatMap((v) => [v.mid, v.lo, v.hi])
        .filter((v): v is number => v !== null),
    [values],
  );
  const isEmpty = count === 0 || series.length === 0 || plotted.length === 0;

  // A taller plot affords one more gridline, so the axis hugs the bands more closely.
  const tickCount = height >= 240 ? 5 : 4;
  const ticks = useMemo(() => {
    const [min, max] = extent(plotted);
    return niceTicks(zero ? Math.min(0, min) : min, zero ? Math.max(0, max) : max, tickCount);
  }, [plotted, zero, tickCount]);
  const tickFormat = axisFormat(format);

  const forecastAt =
    forecastFrom === undefined ? -1 : data.findIndex((row) => String(row[index] ?? "") === forecastFrom);

  // Narrow charts (phones): the readout docks in a band above the plot, clear of the finger. The band
  // is sized for the widest readout the data can produce (wrapped to as many lines as it needs), so
  // it never covers the plot and doesn't jump while the user scrubs.
  const docked = useDockedReadout(width);
  const dock = docked
    ? estimateReadoutHeight(
        width,
        longestOf(
          data.map((row, i) => `${row[index] ?? ""}${forecastAt >= 0 && i >= forecastAt ? ` · ${t.forecast}` : ""}`),
        ),
        series.flatMap((s, si) => [
          {
            label: s.label,
            value: longestOf((values[si] ?? []).map((v) => (v.mid === null ? t.missing : format(v.mid)))),
          },
          {
            label: s.bandLabel ?? t.range(s.label),
            value: longestOf(
              (values[si] ?? []).map((v) =>
                v.lo === null || v.hi === null ? t.missing : t.between(format(v.lo), format(v.hi)),
              ),
            ),
          },
        ]),
      ) + 10
    : 0;

  const xLabels = data.map((row) => String(row[index] ?? ""));
  const widestTick = ticks.reduce((n, tk) => Math.max(n, tickFormat(tk).length), 0);
  const lastHalf = ((xLabels[count - 1]?.length ?? 0) * CHAR_W) / 2;
  const M = {
    // Room above the plot for the "Forecast" tag.
    top: (forecastAt >= 0 ? 24 : 12) + dock,
    bottom: 28,
    left: clamp(Math.ceil(widestTick * CHAR_W) + 16, 36, 80),
    right: clamp(Math.ceil(lastHalf) + 6, 16, 64),
  };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  const lo = ticks[0] ?? 0;
  const hi = ticks[ticks.length - 1] ?? 0;
  const yScale = linear(lo, hi, innerH, 0);
  const y = (v: number) => clamp(yScale(v), 0, innerH);
  const x = (i: number) => (count <= 1 ? innerW / 2 : (i / (count - 1)) * innerW);

  const marks = series.map((s, si) => {
    const vs = values[si] ?? [];
    const color = seriesColor(s, si);
    // Bands: one closed shape per run of rows that have both bounds. They open out from the line.
    const bands = runs(count, (i) => vs[i]?.lo !== null && vs[i]?.lo !== undefined).map(([a, b]) => {
      const idx = Array.from({ length: b - a + 1 }, (_, k) => a + k);
      // A single-row band still needs width to be seen: a short 12px slab.
      const xsOf = (i: number) => (a === b ? [x(i) - 6, x(i) + 6] : [x(i)]);
      const top: Pt[] = idx.flatMap((i) => xsOf(i).map((px) => [px, y(itemAt(vs, i).hi ?? 0)] as const));
      const bottom: Pt[] = idx.flatMap((i) => xsOf(i).map((px) => [px, y(itemAt(vs, i).lo ?? 0)] as const));
      const centre: Pt[] = idx.flatMap((i) =>
        xsOf(i).map(
          (px) => [px, y(itemAt(vs, i).mid ?? ((itemAt(vs, i).lo ?? 0) + (itemAt(vs, i).hi ?? 0)) / 2)] as const,
        ),
      );
      return { key: `${a}-${b}`, d: bandPath(top, bottom, curve), d0: bandPath(centre, centre, curve) };
    });
    // Lines: one path per run of rows with a value, split into solid (actual) and dashed (forecast).
    const lineRuns = runs(count, (i) => vs[i]?.mid !== null && vs[i]?.mid !== undefined).flatMap(([a, b]) => {
      const pts = (from: number, to: number): Pt[] =>
        Array.from({ length: to - from + 1 }, (_, k) => [x(from + k), y(itemAt(vs, from + k).mid ?? 0)] as const);
      if (forecastAt <= a || forecastAt < 0 || forecastAt > b) {
        const dashed = forecastAt >= 0 && forecastAt <= a;
        return [{ key: `${a}-${b}`, d: linePath(pts(a, b), curve), dashed }];
      }
      // The run crosses into the forecast: solid up to the last actual, dashed from there on.
      // Both halves come from ONE curve through the whole run, so there is no kink at the seam.
      const all = pts(a, b);
      const segs = curveSegments(all, curve);
      const seam = forecastAt - 1 - a;
      const moveTo = (p: Pt) => `M${f(p[0])},${f(p[1])} `;
      return [
        {
          key: `${a}-${forecastAt - 1}`,
          d: moveTo(all[0] ?? ORIGIN_PT) + segs.slice(0, seam).join(" "),
          dashed: false,
        },
        { key: `${forecastAt - 1}-${b}`, d: moveTo(all[seam] ?? ORIGIN_PT) + segs.slice(seam).join(" "), dashed: true },
      ];
    });
    // Isolated points have no line to draw: they get a dot instead.
    const singles = runs(count, (i) => vs[i]?.mid !== null && vs[i]?.mid !== undefined)
      .filter(([a, b]) => a === b)
      .map(([a]) => a);
    let lastIndex = -1;
    for (let i = count - 1; i >= 0; i--) {
      if (vs[i]?.mid !== null && vs[i]?.mid !== undefined) {
        lastIndex = i;
        break;
      }
    }
    return { s, color, vs, bands, lineRuns, singles, lastIndex };
  });

  if (isEmpty) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.empty}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < count ? active : null;
  const activeRow = act !== null ? data[act] : undefined;
  const inForecast = act !== null && forecastAt >= 0 && act >= forecastAt;
  const tooltipTitle = activeRow ? `${activeRow[index] ?? ""}${inForecast ? ` · ${t.forecast}` : ""}` : "";
  const tooltipRows: TooltipRow[] = [];
  if (act !== null) {
    for (const m of marks) {
      const v = m.vs[act];
      if (!v) continue;
      tooltipRows.push({
        label: m.s.label,
        value: v.mid === null ? t.missing : format(v.mid),
        color: m.color,
        kind: "line",
      });
      if (v.lo !== null && v.hi !== null) {
        tooltipRows.push({
          label: m.s.bandLabel ?? t.range(m.s.label),
          value: t.between(format(v.lo), format(v.hi)),
          color: bandFill(m.color, series.length),
          kind: "rect",
        });
      }
    }
  }

  // Choreography: the plot wipes in left to right (lines, bands and the dashed forecast alike),
  // then the bands breathe open from their lines. Data changes morph; resizes snap.
  // Under reduced motion every change (geometry, fades, exits) is instant.
  const instant = { duration: 0 };
  const reveal = reduced ? 0 : mounted ? duration.slower : duration.slower * 1.2;
  const move = reduced || !dataChanged ? instant : { duration: duration.slow, ease: changeEase };
  const fade = reduced ? instant : { duration: duration.base };
  const exit = reduced ? instant : exitTransition;
  const open = (si: number) =>
    reduced
      ? instant
      : !mounted
        ? { duration: duration.slower, ease: enterEase, delay: reveal * 0.5 + si * 0.08 }
        : move;
  const shownLabels = thinLabels(xLabels, count > 1 ? innerW / (count - 1) : innerW);
  // The clip reaches 8px past the plot so line caps and end dots are never cut off.
  const clipTo = (w: number) => `M-8,-8 H${f(w)} V${f(innerH + 8)} H-8 Z`;
  // The forecast region starts at the last actual, where the dashed line takes over (or at the
  // start of the plot when every row is a forecast).
  const forecastX = forecastAt > 0 ? x(forecastAt - 1) : forecastAt === 0 ? 0 : null;
  const tagRight = forecastX !== null && innerW - forecastX >= t.forecast.length * CHAR_W + 12;

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const i = count <= 1 ? 0 : Math.round(((event.clientX - rect.left) / Math.max(1, rect.width)) * (count - 1));
    setActive(clamp(i, 0, count - 1));
  }

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
          onKeyDown={chartKeyHandler(count, act, setActive)}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
        >
          <defs>
            <clipPath id={`${id}-reveal`}>
              <motion.path
                initial={{ d: reduced ? clipTo(innerW + 8) : clipTo(-8) }}
                animate={{ d: clipTo(innerW + 8) }}
                transition={{ d: mounted || reduced ? { duration: 0 } : { duration: reveal, ease: enterEase } }}
              />
            </clipPath>
          </defs>

          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {/* Forecast region: a faint tint and a tag, so the dashed line explains itself. */}
            {forecastX !== null && (
              <g>
                <rect
                  x={forecastX}
                  width={Math.max(0, innerW - forecastX)}
                  height={innerH}
                  fill="var(--sheen-hover)"
                  fillOpacity={0.6}
                />
                <line x1={forecastX} x2={forecastX} y1={-14} y2={innerH} stroke="var(--sheen-border)" />
                <text
                  x={tagRight ? forecastX + 6 : forecastX - 6}
                  y={-6}
                  textAnchor={tagRight ? "start" : "end"}
                  className="fill-sheen-fg-muted text-2xs font-medium"
                >
                  {t.forecast}
                </text>
              </g>
            )}

            <AnimatePresence initial={false}>
              {ticks.map((tk) => (
                <motion.g
                  key={tk}
                  initial={reduced ? false : { opacity: 0, y: y(tk) }}
                  animate={{ opacity: 1, y: y(tk) }}
                  exit={{ opacity: 0, transition: exit }}
                  transition={{ y: move, opacity: fade }}
                >
                  <line x2={innerW} stroke={tk === 0 && lo < 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
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
                    initial={reduced ? false : { opacity: 0, x: x(i) }}
                    animate={{ opacity: 1, x: x(i) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, opacity: fade }}
                  >
                    {label}
                  </motion.text>
                ) : null,
              )}
            </AnimatePresence>

            <g clipPath={`url(#${id}-reveal)`} className="forced-color-adjust-none">
              {/* Bands first (all series), so no band ever covers another series' line. */}
              <AnimatePresence>
                {marks.flatMap((m, si) =>
                  m.bands.map((b) => (
                    <motion.path
                      key={`b-${m.s.key}-${b.key}-${version}`}
                      style={{ fill: bandFill(m.color, series.length) }}
                      initial={reduced ? { d: b.d, opacity: 1 } : { d: b.d0, opacity: 1 }}
                      animate={{ d: b.d, opacity: 1 }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ d: open(si), opacity: reduced ? instant : { duration: duration.fast } }}
                    />
                  )),
                )}
              </AnimatePresence>
              <AnimatePresence>
                {marks.flatMap((m) =>
                  m.lineRuns.map((l) => (
                    <motion.path
                      key={`l-${m.s.key}-${l.key}-${version}`}
                      fill="none"
                      stroke={m.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={l.dashed ? "5 5" : undefined}
                      initial={{ d: l.d, opacity: 1 }}
                      animate={{ d: l.d, opacity: 1 }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ d: move, opacity: instant }}
                    />
                  )),
                )}
              </AnimatePresence>
              {marks.flatMap((m) =>
                m.singles
                  .filter((i) => i !== m.lastIndex)
                  .map((i) => (
                    <circle
                      key={`s-${m.s.key}-${i}`}
                      cx={x(i)}
                      cy={y(itemAt(m.vs, i).mid ?? 0)}
                      r={4}
                      fill={m.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                    />
                  )),
              )}
              {/* End dot on each line's latest value. */}
              <AnimatePresence>
                {marks.map((m) =>
                  m.lastIndex < 0 ? null : (
                    <motion.circle
                      key={`e-${m.s.key}-${version}`}
                      r={4}
                      fill={m.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      initial={{ cx: x(m.lastIndex), cy: y(itemAt(m.vs, m.lastIndex).mid ?? 0) }}
                      animate={{ cx: x(m.lastIndex), cy: y(itemAt(m.vs, m.lastIndex).mid ?? 0) }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ cx: move, cy: move }}
                    />
                  ),
                )}
              </AnimatePresence>
            </g>

            {/* Crosshair: a ringed dot on each line, short caps marking each band's low and high. */}
            {act !== null && (
              <g pointerEvents="none">
                <line x1={x(act)} x2={x(act)} y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
                <g className="forced-color-adjust-none">
                  {marks.map((m, i) => {
                    const v = m.vs[act];
                    if (!v) return null;
                    return (
                      <g key={i}>
                        {v.lo !== null && v.hi !== null && (
                          <>
                            <line
                              x1={x(act) - 5}
                              x2={x(act) + 5}
                              y1={y(v.hi)}
                              y2={y(v.hi)}
                              stroke={m.color}
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                            <line
                              x1={x(act) - 5}
                              x2={x(act) + 5}
                              y1={y(v.lo)}
                              y2={y(v.lo)}
                              stroke={m.color}
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </>
                        )}
                        {v.mid !== null && (
                          <circle
                            cx={x(act)}
                            cy={y(v.mid)}
                            r={4.5}
                            fill={m.color}
                            stroke="var(--sheen-chart-surface)"
                            strokeWidth={2}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>
            )}

            {/* Hit area: the whole plot. Horizontal drags scrub on touch; vertical ones still scroll the page. */}
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

      {activeRow &&
        act !== null &&
        (docked ? (
          <ChartTooltip title={tooltipTitle} rows={tooltipRows} x={0} y={0} containerWidth={width} docked />
        ) : (
          // One line per row (band rows are long): it opens on whichever side has room for its full width.
          <div className={tooltipNoWrapClass}>
            <ChartTooltip
              title={tooltipTitle}
              rows={tooltipRows}
              x={M.left + x(act)}
              y={M.top + innerH / 2}
              containerWidth={tooltipContainerWidth(
                tooltipSide(M.left + x(act), estimateTooltipWidth(tooltipTitle, tooltipRows), width),
              )}
            />
          </div>
        ))}
      <ChartAnnouncer
        text={activeRow ? `${tooltipTitle}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}` : ""}
      />
    </div>
  );
}

/** Props of {@link RangeAreaTable}. The chart's table view: each line's value and its band as "low–high"; gaps read as a dash, never 0. */
export type RangeAreaTableProps = ComponentProps<typeof RangeAreaTable>;
