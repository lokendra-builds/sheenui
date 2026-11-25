"use client";

import type { ComponentProps } from "react";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartTooltip, type LegendItem, type TooltipRow } from "./chart-parts";
import {
  axisFormat,
  barPath,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  clamp,
  enterEase,
  formatCompact,
  linear,
  niceTicks,
  num,
  slotColor,
  truncate,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import {
  betweenDefault,
  estimateReadoutHeight,
  estimateTooltipHeight,
  estimateTooltipWidth,
  tooltipContainerWidth,
  tooltipNoWrapClass,
  tooltipSide,
} from "./range-area-chart";
import { ChartFigure } from "./chart-figure";
import { TableScroll } from "./chart-fit";

/** One bullet of a BulletChart: a label, the measure, a target marker and the qualitative ranges. */
export type BulletItem = {
  label: string;
  /** Unit or context under the label, e.g. "US$, thousands". */
  description?: string;
  /** The measure (the bar). */
  value: number;
  /** The comparative measure (the marker), e.g. a goal or last year's value. */
  target?: number;
  /**
   * Upper bounds of the qualitative ranges, lowest first: [150, 225, 300] draws poor (0–150),
   * fair (150–225) and good (225–300). The last range stretches to the end of the scale.
   */
  ranges?: readonly number[];
  /** Names of this row's ranges, lowest first. Default: the chart's `labels.ranges`. */
  rangeLabels?: readonly string[];
  /** Start of the scale. Default 0. */
  min?: number;
  /** End of the scale. Default: a round number at or above the largest of value, target and ranges. */
  max?: number;
  /** Colour slot of the bar. Default 1. */
  color?: ChartColor;
  /** Is beating the target good (revenue) or bad (costs, churn)? Colours the delta. Default true. */
  higherIsBetter?: boolean;
  /** Formats this row's numbers (overrides the chart's `format`). */
  format?: (n: number) => string;
};

/** Every string the chart shows or announces, for translation. */
export type BulletChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  actual: string;
  target: string;
  /** Default names of the qualitative ranges, lowest first. */
  ranges: readonly string[];
  /** Delta against the target, e.g. "+8% vs target". */
  vsTarget: (delta: string) => string;
  onTarget: string;
  /** A low–high pair, e.g. "150–225" (or "−12 – 0" once a bound is negative). */
  between: (low: string, high: string) => string;
  /** Table headers. */
  measure: string;
  range: string;
  delta: string;
  /** Table cell for a missing value. */
  missing: string;
  /** Table text when there are no rows. */
  empty: string;
};

/**
 * The built-in English strings of BulletChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultBulletChartLabels: BulletChartLabels = {
  instructions: "Use up and down arrow keys to read each row.",
  actual: "Actual",
  target: "Target",
  ranges: ["Poor", "Fair", "Good", "Excellent", "Outstanding"],
  vsTarget: (delta) => `${delta} vs target`,
  onTarget: "On target",
  between: betweenDefault,
  measure: "Measure",
  range: "Range",
  delta: "vs target",
  missing: "–",
  empty: "No data",
};

/**
 * Props of BulletChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type BulletChartProps = {
  /** The rows to draw, one per measure. */
  data: readonly BulletItem[];
  /**
   * "row": each row gets its own scale, ticked underneath (measures in different units).
   * "shared": one scale for every row, ticked once at the bottom (same unit, comparable lengths).
   */
  scale?: "row" | "shared";
  /** Prints scale ticks along each bar. */
  ticks?: boolean;
  /** Show the delta against the target under each value. */
  showDelta?: boolean;
  /** Formats values (rows can override with their own `format`). */
  format?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override any built-in string (i18n). */
  labels?: Partial<BulletChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const TRACK = 24; // qualitative band height
const BAR = 8; // the measure: a third of the band, as Few's spec
const MARK_H = 16; // target marker: two thirds of the band
const MARK_W = 3;
const GAP = 2; // surface gap between ranges
const ROW_GAP = 22;
const TICK_H = 18;
const CHAR_W = 6.6; // 12px label glyph width
const CHAR_W_SM = 6.2; // 11px
const VALUE_CH = 8.4; // 14px semibold tabular value
const DELTA_CH = 6.4; // 11px medium delta
const NARROW_BELOW = 520;
/**
 * Room the svg keeps around the chart on every side, so the active-row highlight (which reaches
 * past the text) is drawn inside the svg's own box: WebKit clips a rounded svg to that box.
 */
const BLEED = 8;

const percentFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0, signDisplay: "exceptZero" });
/** "+8%" / "−8%": a typographic minus, as formatCompact. */
const signedPercent = (n: number) => `${percentFormatter.format(n).replace("-", "−")}%`;

/** A rectangle with independent left and right corner radii (for the ends of the range track). */
function track(x: number, y: number, w: number, h: number, left: number, right: number) {
  w = Math.max(0, w);
  const l = Math.min(left, w / 2, h / 2);
  const r = Math.min(right, w / 2 - l, h / 2);
  const F = (n: number) => n.toFixed(2);
  return (
    `M${F(x + l)},${F(y)} H${F(x + w - r)} Q${F(x + w)},${F(y)} ${F(x + w)},${F(y + r)} V${F(y + h - r)} ` +
    `Q${F(x + w)},${F(y + h)} ${F(x + w - r)},${F(y + h)} H${F(x + l)} Q${F(x)},${F(y + h)} ${F(x)},${F(y + h - l)} ` +
    `V${F(y + l)} Q${F(x)},${F(y)} ${F(x + l)},${F(y)} Z`
  );
}

/**
 * Range shades: one neutral hue, light (low) to dark (high), so the measure's colour stays the
 * loudest thing. The lightest step still reads against a light glass card; dark surfaces get
 * slightly stronger steps, where faint tints would sink.
 */
function rangeFill(j: number, count: number) {
  const k = count <= 1 ? 0.15 : j / (count - 1);
  // Light: 18% → 34% (the lightest still reads against a pale glass card). Dark: 14% → 28%, so the
  // measure bar keeps its contrast against the strongest step.
  const light = Math.round(18 + 16 * k);
  const dark = Math.round(14 + 14 * k);
  return `light-dark(color-mix(in srgb, var(--sheen-fg) ${light}%, transparent), color-mix(in srgb, var(--sheen-fg) ${dark}%, transparent))`;
}

type Resolved = ReturnType<typeof resolve>;

/** Domain, bands and delta for one row. */
function resolve(item: BulletItem, t: BulletChartLabels, fallbackFormat: (n: number) => string, tickCount: number) {
  const format = item.format ?? fallbackFormat;
  // Range bounds print at the precision of the data (4.25, not 4.3) unless the row brings its own format.
  const exact = axisFormat(format);
  const value = num(item.value);
  const target = item.target === undefined ? null : num(item.target);
  const ranges = (item.ranges ?? [])
    .map(num)
    .filter((r) => Number.isFinite(r))
    .sort((a, b) => a - b);
  const min = item.min === undefined ? Math.min(0, value) : num(item.min);
  const largest = Math.max(value, target ?? -Infinity, ...ranges, min);
  const hi = item.max === undefined ? largest : num(item.max);
  // Prefer a step that lands on both ends of a given scale (0–5 in ones, not 0, 2, 4).
  const onEnds = (list: number[]) =>
    list.some((tk) => Math.abs(tk - min) < 1e-9) &&
    (item.max === undefined || list.some((tk) => Math.abs(tk - hi) < 1e-9));
  let ticks = niceTicks(min, hi, tickCount);
  for (let extra = 1; extra <= 2 && !onEnds(ticks); extra++) {
    const denser = niceTicks(min, hi, tickCount + extra);
    if (onEnds(denser)) ticks = denser;
  }
  const max = item.max === undefined ? (ticks[ticks.length - 1] ?? largest) : hi;
  const names = item.rangeLabels ?? t.ranges;
  // Without ranges the track is one neutral band across the scale. It has no name and no
  // meaning, so the tooltip, announcer and table don't mention it.
  const synthetic = ranges.length === 0;
  const bands = (synthetic ? [max] : ranges).map((upper, j, all) => ({
    from: j === 0 ? min : (all[j - 1] ?? min),
    to: j === all.length - 1 ? Math.max(upper, max) : upper,
    name: synthetic ? "" : (names[j] ?? ""),
  }));
  // Both ends of the scale are always labelled: added as ticks, or replacing a tick that sits too close.
  const scaleTicks = ticks.filter((tk) => tk >= min - 1e-9 && tk <= max + 1e-9);
  const step = (ticks[1] ?? max) - (ticks[0] ?? min);
  const first = scaleTicks[0];
  if (first === undefined || first - min > 1e-9) {
    if (first !== undefined && first - min < step * 0.6) scaleTicks.shift();
    scaleTicks.unshift(min);
  }
  const last = scaleTicks[scaleTicks.length - 1] ?? 0;
  if (max - last > 1e-9) {
    if (max - last < step * 0.6 && scaleTicks.length > 1) scaleTicks.pop();
    scaleTicks.push(max);
  }
  const band = synthetic ? undefined : (bands.find((b) => value <= b.to) ?? bands[bands.length - 1]);
  const delta = target !== null && target !== 0 ? ((value - target) / Math.abs(target)) * 100 : null;
  const good = delta === null || Math.round(delta) === 0 ? null : delta > 0 === (item.higherIsBetter ?? true);
  return {
    item,
    format,
    exact,
    value,
    target,
    min,
    max,
    ticks: scaleTicks,
    bands,
    band,
    delta,
    good,
    deltaText: delta === null ? "" : Math.round(delta) === 0 ? t.onTarget : t.vsTarget(signedPercent(delta)),
  };
}

/**
 * The ticks whose labels fit side by side (8px apart): every n-th one, always with both ends of
 * the scale (the one before the last steps back when it crowds it). End labels on narrow charts
 * hug the plot's edges.
 */
function fittingTicks(
  ticks: number[],
  x: (v: number) => number,
  text: (v: number) => string,
  plotX: number,
  plotW: number,
  narrow: boolean,
) {
  const span = (v: number): [number, number] => {
    const w = text(v).length * CHAR_W_SM;
    const px = x(v);
    if (narrow && px <= plotX + 1) return [px, px + w];
    if (narrow && px >= plotX + plotW - 1) return [px - w, px];
    return [px - w / 2, px + w / 2];
  };
  const fits = (list: number[]) => list.every((v, i) => i === 0 || span(list[i - 1] ?? 0)[1] + 8 <= span(v)[0]);
  const last = ticks.length - 1;
  for (let every = 1; every <= last; every++) {
    const kept = ticks.filter((_, i) => i % every === 0 && i !== last);
    kept.push(ticks[last] ?? 0);
    if (kept.length > 2 && !fits(kept.slice(-2))) kept.splice(-2, 1);
    if (fits(kept)) return kept;
  }
  return ticks.length > 1 && fits([ticks[0] ?? 0, ticks[last] ?? 0])
    ? [ticks[0] ?? 0, ticks[last] ?? 0]
    : ticks.slice(0, 1);
}

/** "▲ " / "▼ " before a delta, so its direction never depends on colour alone. */
const arrow = (r: Resolved) => (r.delta === null || Math.round(r.delta) === 0 ? "" : r.delta > 0 ? "▲ " : "▼ ");

/** The bounds of a row's band ("225–300"), at the precision of the data. */
const bandText = (r: Resolved, t: BulletChartLabels) =>
  r.band ? t.between(r.exact(r.band.from), r.exact(r.band.to)) : "";

/** What the tooltip, the phone readout and the announcer say about a row. */
function readout(r: Resolved, t: BulletChartLabels): TooltipRow[] {
  const rows: TooltipRow[] = [
    { label: t.actual, value: r.format(r.value), color: slotColor(r.item.color ?? 1), kind: "rect" },
  ];
  if (r.target !== null)
    rows.push({ label: t.target, value: r.format(r.target), color: "var(--sheen-fg)", kind: "line" });
  if (r.band) rows.push({ label: r.band.name || t.range, value: bandText(r, t), color: "transparent" });
  if (r.delta !== null) {
    const level = Math.round(r.delta) === 0;
    rows.push({
      label: level ? "" : t.delta,
      value: level ? t.onTarget : signedPercent(r.delta),
      color: "transparent",
    });
  }
  return rows;
}

/** Legend for a bullet chart: the measure, the target marker, and the range shades. */
export function bulletLegend(labels?: Partial<BulletChartLabels>, color: ChartColor = 1, rangeCount = 3): LegendItem[] {
  const t = { ...defaultBulletChartLabels, ...labels };
  return [
    { label: t.actual, color: slotColor(color), kind: "rect" },
    { label: t.target, color: "var(--sheen-fg)", kind: "line" },
    ...t.ranges.slice(0, rangeCount).map((name, j) => ({
      label: name,
      color: rangeFill(j, rangeCount),
      kind: "rect" as const,
    })),
  ];
}

/**
 * The chart's table view: every row's actual, target, range and delta, in text.
 *
 * Props: the chart's `data`, `format`, `labels` and `emptyState`, plus `caption` (hidden, names the table) and `className`. A real table: each row's actual, target, range and delta. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { BulletTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BulletTable data={[{ label: "Revenue", value: 270, target: 250, ranges: [150, 225, 300] }]} caption="Q3 results against targets" />
 *   );
 * }
 * ```
 *
 * @see /charts/bullet-chart
 */
export function BulletTable({
  data,
  format = formatCompact,
  caption,
  labels,
}: {
  /** The bullet rows to list, the same items the chart draws. */
  data: readonly BulletItem[];
  /** Formats each number in the table. */
  format?: (n: number) => string;
  /** Visually hidden caption naming the table for screen readers. */
  caption?: string;
  /** Overrides for the table's built-in English strings. */
  labels?: Partial<BulletChartLabels>;
}) {
  const t = { ...defaultBulletChartLabels, ...labels };
  const rows = data.map((item) => resolve(item, t, format, 4));
  return (
    <TableScroll label={caption ?? t.measure}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-4 font-medium">
              {t.measure}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.actual}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.target}
            </th>
            <th scope="col" className="py-2 pe-4 font-medium">
              {t.range}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.delta}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sheen-fg-muted">
                {t.empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-sheen-border last:border-0">
              <th scope="row" className="py-2 pe-4 font-normal text-sheen-fg-muted">
                {r.item.label}
                {r.item.description && <span className="block text-2xs">{r.item.description}</span>}
              </th>
              <td className="py-2 pe-4 text-end tabular-nums">{r.format(r.value)}</td>
              <td className="py-2 pe-4 text-end tabular-nums">{r.target === null ? t.missing : r.format(r.target)}</td>
              <td className="py-2 pe-4 whitespace-nowrap">
                {!r.band ? t.missing : r.band.name ? `${r.band.name} (${bandText(r, t)})` : bandText(r, t)}
              </td>
              <td className="py-2 pe-4 text-end whitespace-nowrap tabular-nums">
                {r.delta === null ? t.missing : signedPercent(r.delta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

/**
 * One bullet graph per row: a bar for the measure, a marker for its target and shaded ranges (poor, fair, good) behind it. Use it for KPIs against goals when a gauge per metric would take too much room.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between rows, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce each row's actual, target and delta. `BulletTable` is the table view.
 * Glass and motion: the plot has no backdrop blur; the tooltip is the shared glass surface. Reduced motion draws bars in place.
 *
 * @example
 * ```tsx
 * import { BulletChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BulletChart
 *       data={[
 *         { label: "Revenue", description: "US$, thousands", value: 270, target: 250, ranges: [150, 225, 300] },
 *         { label: "Profit", description: "%", value: 22, target: 26, ranges: [15, 22, 30] },
 *       ]}
 *       aria-label="Q3 results against targets"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/bullet-chart
 */
export function BulletChart({
  data,
  scale = "row",
  ticks = true,
  showDelta = true,
  format = formatCompact,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<BulletChartProps>) {
  const t = { ...defaultBulletChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const mounted = useHasMounted(width > 0 && data.length > 0);
  const [active, setActive] = useState<number | null>(null);
  const dataChanged = useDataChanged(
    JSON.stringify(data.map((d) => [d.label, d.value, d.target, d.ranges, d.min, d.max])) + scale,
  );

  const narrow = width > 0 && width < NARROW_BELOW;
  const hasDesc = data.some((d) => d.description);

  // Columns (wide): right-aligned names | the bullet | value + delta. Narrow: names above the bullet.
  // The value column fits the widest value and delta (translated deltas can be long), up to 35%.
  const draft = data.map((item) => resolve(item, t, format, 4));
  const widestValue = draft.reduce(
    (m, r) =>
      Math.max(
        m,
        r.format(r.value).length * VALUE_CH,
        showDelta && r.deltaText ? (arrow(r) + r.deltaText).length * DELTA_CH : 0,
      ),
    0,
  );
  const longest = data.reduce(
    (m, d) => Math.max(m, d.label.length, Math.ceil(((d.description?.length ?? 0) * CHAR_W_SM) / CHAR_W)),
    0,
  );
  const labelCol = narrow ? 0 : clamp(Math.ceil(longest * CHAR_W) + 20, 72, Math.floor(width * 0.3));
  const valueCol = narrow ? 0 : clamp(Math.ceil(widestValue) + 8, 48, Math.floor(width * 0.35));
  const plotX = labelCol;
  const plotW = Math.max(0, width - labelCol - valueCol - (narrow ? 0 : 20));
  const tickCount = clamp(Math.floor(plotW / 72), 2, 6);
  const tickFormat = axisFormat(format);

  let rows = data.map((item) => resolve(item, t, format, tickCount));
  if (scale === "shared" && rows.length) {
    const lo = Math.min(...rows.map((r) => r.min));
    const hi = Math.max(
      ...rows.map((r) =>
        r.item.max === undefined ? Math.max(r.value, r.target ?? -Infinity, ...(r.item.ranges ?? []).map(num)) : r.max,
      ),
    );
    rows = data.map((item) =>
      resolve({ ...item, min: lo, max: niceTicks(lo, hi, tickCount).pop() ?? hi }, t, format, tickCount),
    );
  }
  const rowTicks = ticks && scale === "row";

  // Narrow charts (phones): the readout replaces the active row's own name and value line (it
  // repeats them, then adds the target and range), growing up into the gap above the row. Rows sit
  // far enough apart, and the first starts low enough, that it never reaches the row above or the
  // legend. Sized for the longest readout, so nothing moves while the user taps from row to row.
  const docked = narrow;
  const readoutH = docked
    ? rows.reduce(
        (m, r) =>
          Math.max(
            m,
            estimateReadoutHeight(
              width,
              r.item.label,
              readout(r, t).map((row) => ({ label: row.label, value: row.value, key: row.color !== "transparent" })),
            ),
          ),
        0,
      )
    : 0;

  // Vertical rhythm.
  const head = narrow ? 18 + (hasDesc || showDelta ? 14 : 0) + 6 : 0;
  const bodyH = narrow ? TRACK : Math.max(TRACK, hasDesc ? 32 : 18);
  const rowH = head + bodyH + (rowTicks ? TICK_H : 0);
  const rowGap = docked ? Math.max(ROW_GAP, readoutH + 6 - head) : ROW_GAP;
  const topPad = docked ? Math.max(0, readoutH + 4 - head) : 0;
  const sharedAxis = ticks && scale === "shared" ? TICK_H + 4 : 0;
  const height = topPad + rows.length * rowH + Math.max(0, rows.length - 1) * rowGap + sharedAxis + 4;
  const nameChars = narrow ? Math.floor((width * 0.62) / CHAR_W) : Math.floor((labelCol - 16) / CHAR_W);

  if (data.length === 0) {
    return (
      <ChartEmpty height={120} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.empty}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < rows.length ? active : null;
  const actRow = act !== null ? rows[act] : undefined;
  const tooltipRows = actRow ? readout(actRow, t) : [];

  const rowTop = (i: number) => topPad + i * (rowH + rowGap);
  const trackTop = (i: number) => rowTop(i) + head + (bodyH - TRACK) / 2;
  const instant = { duration: 0 };
  const move = reduced || !dataChanged ? instant : { duration: duration.slow, ease: changeEase };
  const grow = (i: number) =>
    reduced ? instant : !mounted ? { duration: duration.slower, ease: enterEase, delay: 0.1 + i * 0.07 } : move;
  const pop = (i: number) =>
    reduced || mounted
      ? instant
      : { duration: duration.base, ease: enterEase, delay: 0.1 + duration.slower * 0.8 + i * 0.07 };
  /** A row's tick labels: the step-aware axis format, or the row's own format. */
  const rowTickText = (r: Resolved) => (r.format === format ? tickFormat : r.format);
  const statusClass = (good: boolean | null) =>
    good === null ? "fill-sheen-fg-muted" : good ? "fill-sheen-success-text" : "fill-sheen-danger-text";

  // Wide charts: the tooltip opens under the active row (over the rows beneath it), or above it when
  // there's no room below, so it never covers the bar, target, value or delta it describes; one edge
  // lines up with the bar tip or the target, whichever reaches further. A chart too short for either
  // gets it beside that tip instead, centred on the row. Either way it never crosses into the value
  // column and stays within the chart's height.
  const tip = (() => {
    if (!actRow || act === null || docked) return null;
    const end = clamp(
      linear(actRow.min, actRow.max, plotX, plotX + plotW)(Math.max(actRow.value, actRow.target ?? -Infinity)),
      plotX,
      plotX + plotW,
    );
    const tw = estimateTooltipWidth(actRow.item.label, tooltipRows);
    const th = estimateTooltipHeight(tooltipRows.length);
    const room = width - valueCol;
    const below = rowTop(act) + rowH + 2;
    const above = rowTop(act) - 2 - th;
    if (below + th <= height || above >= 0) {
      const side = end + tw <= room ? "right" : end - tw >= 0 ? "left" : room - end >= end ? "right" : "left";
      // ChartTooltip sits 14px off its anchor: shift the anchor so the box edge lands on `end`.
      return {
        x: side === "right" ? end - 14 : end + 14,
        y: (below + th <= height ? below : above) + th / 2,
        side,
      } as const;
    }
    const cy = trackTop(act) + TRACK / 2;
    return {
      x: end,
      y: height >= th ? clamp(cy, th / 2, height - th / 2) : height / 2,
      side: tooltipSide(end, tw, room),
    } as const;
  })();

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width + BLEED * 2}
          height={height + BLEED * 2}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={chartKeyHandler(rows.length, act, setActive)}
          onBlur={() => setActive(null)}
          className={cn("absolute overflow-visible rounded-sheen-sm", chartFocusClass)}
          style={{ top: -BLEED, left: -BLEED }}
        >
          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${BLEED},${BLEED})`}>
            {rows.map((r, i) => {
              const x = linear(r.min, r.max, plotX, plotX + plotW);
              const sx = (v: number) => clamp(x(v), plotX, plotX + plotW);
              const top = trackTop(i);
              const barY = top + (TRACK - BAR) / 2;
              // The bar grows from zero (or the start of the scale when zero isn't on it): a negative value reaches left.
              const zero = clamp(0, r.min, r.max);
              const base = sx(zero);
              const barX = Math.min(base, sx(r.value));
              const barLen = Math.abs(sx(r.value) - base);
              const barEnd = r.value < zero ? "left" : "right";
              const color = slotColor(r.item.color ?? 1);
              const name = truncate(r.item.label, nameChars);
              const desc = r.item.description
                ? truncate(r.item.description, Math.floor((narrow ? width * 0.62 : labelCol - 16) / CHAR_W_SM))
                : "";
              const nameY = narrow ? rowTop(i) + 12 : top + TRACK / 2 - (desc ? 7 : 0);
              const valueY = narrow ? rowTop(i) + 12 : top + TRACK / 2 - (showDelta && r.deltaText ? 7 : 0);
              // On phones the readout stands in for the active row's name and value line.
              const showHead = !(docked && act === i);
              return (
                <g key={i}>
                  {act === i && (
                    <rect
                      x={-BLEED}
                      y={rowTop(i) - BLEED}
                      width={width + BLEED * 2}
                      height={rowH + 12}
                      rx={10}
                      fill="var(--sheen-hover)"
                    />
                  )}

                  {showHead && (
                    <>
                      {/* Name (and unit) */}
                      <text
                        x={narrow ? 0 : labelCol - 16}
                        y={nameY}
                        dy="0.32em"
                        textAnchor={narrow ? "start" : "end"}
                        className="fill-sheen-fg text-xs font-medium"
                      >
                        {name !== r.item.label && <title>{r.item.label}</title>}
                        {name}
                      </text>
                      {desc && (
                        <text
                          x={narrow ? 0 : labelCol - 16}
                          y={nameY + 14}
                          dy="0.32em"
                          textAnchor={narrow ? "start" : "end"}
                          className="fill-sheen-fg-muted text-2xs"
                        >
                          {desc}
                        </text>
                      )}

                      {/* Value, then the delta against the target (arrow + sign, so colour is never the only signal). */}
                      <text
                        x={width}
                        y={valueY}
                        dy="0.32em"
                        textAnchor="end"
                        className="fill-sheen-fg text-sm font-semibold tabular-nums"
                      >
                        {r.format(r.value)}
                      </text>
                      {showDelta && r.deltaText && (
                        <text
                          x={width}
                          y={valueY + 15}
                          dy="0.32em"
                          textAnchor="end"
                          className={cn("text-2xs font-medium tabular-nums", statusClass(r.good))}
                        >
                          {arrow(r)}
                          {r.deltaText}
                        </text>
                      )}
                    </>
                  )}

                  <g className="forced-color-adjust-none">
                    {/* Qualitative ranges: neutral shades, light (low) to dark (high), 2px apart. */}
                    {r.bands.map((b, j) => {
                      const x0 = sx(b.from) + (j > 0 ? GAP / 2 : 0);
                      const x1 = sx(b.to) - (j < r.bands.length - 1 ? GAP / 2 : 0);
                      return (
                        <motion.path
                          key={j}
                          d={track(x0, top, x1 - x0, TRACK, j === 0 ? 4 : 0, j === r.bands.length - 1 ? 4 : 0)}
                          style={{ fill: rangeFill(j, r.bands.length) }}
                          className="forced-colors:stroke-[CanvasText]"
                          initial={reduced ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={reduced ? instant : { duration: duration.base, delay: mounted ? 0 : i * 0.07 }}
                        />
                      );
                    })}

                    {/* A zero line when the scale spans negative and positive values. */}
                    {r.min < 0 && r.max > 0 && (
                      <line x1={base} x2={base} y1={top - 3} y2={top + TRACK + 3} stroke="var(--sheen-fg-subtle)" />
                    )}

                    {/* The measure: a thin bar with a rounded data end, growing from zero. */}
                    <motion.path
                      fill={color}
                      initial={reduced ? false : { d: barPath(base, barY, 0, BAR, barEnd) }}
                      animate={{ d: barPath(barX, barY, barLen, BAR, barEnd) }}
                      transition={{ d: grow(i) }}
                    />

                    {/* The target: an ink marker across the bar, ringed in the surface colour. */}
                    {r.target !== null && (
                      <motion.g initial={false} animate={{ x: sx(r.target) }} transition={{ x: move }}>
                        <motion.rect
                          x={-MARK_W / 2}
                          y={top + (TRACK - MARK_H) / 2}
                          width={MARK_W}
                          height={MARK_H}
                          rx={1}
                          fill="var(--sheen-fg)"
                          stroke="var(--sheen-chart-surface)"
                          strokeWidth={4}
                          paintOrder="stroke"
                          initial={reduced ? false : { scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={pop(i)}
                        />
                      </motion.g>
                    )}
                  </g>

                  {/* Per-row scale, thinned so long labels never collide */}
                  {rowTicks &&
                    fittingTicks(r.ticks, sx, rowTickText(r), plotX, plotW, narrow).map((tk) => (
                      <text
                        key={tk}
                        x={sx(tk)}
                        y={top + TRACK + 13}
                        textAnchor={
                          sx(tk) <= plotX + 1 && narrow
                            ? "start"
                            : sx(tk) >= plotX + plotW - 1 && narrow
                              ? "end"
                              : "middle"
                        }
                        className="fill-sheen-fg-muted text-2xs tabular-nums"
                      >
                        {rowTickText(r)(tk)}
                      </text>
                    ))}

                  {/* Hit area: the whole row. */}
                  <rect
                    x={0}
                    y={rowTop(i) - rowGap / 2}
                    width={width}
                    height={rowH + rowGap}
                    fill="transparent"
                    onPointerEnter={() => setActive(i)}
                    onPointerDown={() => setActive(i)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                  />
                </g>
              );
            })}

            {/* Shared scale: ticked once, under the last row. */}
            {sharedAxis > 0 &&
              rows[0] &&
              fittingTicks(
                rows[0].ticks,
                (v) =>
                  clamp(
                    linear(itemAt(rows, 0).min, itemAt(rows, 0).max, plotX, plotX + plotW)(v),
                    plotX,
                    plotX + plotW,
                  ),
                tickFormat,
                plotX,
                plotW,
                narrow,
              ).map((tk) => {
                const r = itemAt(rows, 0);
                const x = clamp(linear(r.min, r.max, plotX, plotX + plotW)(tk), plotX, plotX + plotW);
                return (
                  <text
                    key={tk}
                    x={x}
                    y={height - 6}
                    textAnchor={
                      narrow && x <= plotX + 1 ? "start" : narrow && x >= plotX + plotW - 1 ? "end" : "middle"
                    }
                    className="fill-sheen-fg-muted text-2xs tabular-nums"
                  >
                    {tickFormat(tk)}
                  </text>
                );
              })}
          </g>
        </ChartFigure>
      )}

      {actRow && act !== null && docked && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 [&>[data-slot=chart-readout]]:relative"
          style={{ bottom: height - trackTop(act) + 4 }}
        >
          <ChartTooltip title={actRow.item.label} rows={tooltipRows} x={0} y={0} containerWidth={width} docked />
        </div>
      )}
      {actRow && tip && (
        <div className={tooltipNoWrapClass}>
          <ChartTooltip
            title={actRow.item.label}
            rows={tooltipRows}
            x={tip.x}
            y={tip.y}
            containerWidth={tooltipContainerWidth(tip.side)}
          />
        </div>
      )}
      <ChartAnnouncer
        text={
          actRow
            ? `${actRow.item.label}: ${tooltipRows.map((row) => `${row.label} ${row.value}`.trim()).join(", ")}`
            : ""
        }
      />
    </div>
  );
}

/** Props of {@link BulletTable}. The chart's table view: every row's actual, target, range and delta, in text. */
export type BulletTableProps = ComponentProps<typeof BulletTable>;
