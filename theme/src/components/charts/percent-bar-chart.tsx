"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, LegendKey, type TooltipRow } from "./chart-parts";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import {
  chartFades,
  DockHint,
  dockHintHeight,
  dockSpace,
  FittedTooltip,
  TableScroll,
  useDockedReadout,
  useInputSource,
  withMinimum,
} from "./chart-fit";
import {
  barPath,
  changeEase,
  chartFocusClass,
  clamp,
  dataSignature,
  enterEase,
  formatCompact,
  linear,
  num,
  rowKeys,
  seriesColor,
  thinLabels,
  truncate,
  useDataChanged,
  useElementWidth,
  useHasMounted,
  type ChartRow,
  type ChartSeries,
  type ChartInstructions,
  resolveInstructions,
  itemAt,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";

/** Every string the chart shows or announces, for translation. */
export type PercentBarChartLabels = {
  /** Last row of the tooltip and the table: the category's sum. */
  total: string;
  /** Shown in a bar whose values are all 0, and in an empty table. */
  noData: string;
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Touch screens: shown where the readout docks, until a bar is active. */
  touchHint: string;
};

/**
 * The built-in English strings of PercentBarChart; spread it into your own `labels` and change what
 * you need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultPercentBarChartLabels: PercentBarChartLabels = {
  total: "Total",
  noData: "No data",
  instructions: "Use arrow keys to move between bars and their segments.",
  touchHint: "Tap a bar to read its shares.",
};

/**
 * Props of PercentBarChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type PercentBarChartProps = {
  /** One object per bar: the `index` key plus one number per series key (shares are worked out for you). */
  data: readonly ChartRow[];
  /** Sets the key of the category in each row. */
  index: string;
  /** Segments, from the baseline outwards. Give each a fixed `color` slot. */
  series: readonly ChartSeries[];
  /** "horizontal" = bars from the left (best for long names); "vertical" = columns. */
  layout?: "horizontal" | "vertical";
  /** Print each share inside its segment, only where it fits with room to spare. */
  showValues?: boolean;
  /** Plot height. Horizontal bars default to 40px a row. */
  height?: number;
  /** Formats raw values (tooltip, table). Negative values count as 0. */
  format?: (n: number) => string;
  /** Formats shares, 0–100 (axis, labels, tooltip). */
  formatPercent?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell series apart without colour (hatch fills). Default: on when the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<PercentBarChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const GAP = 2;
const MIN_SEG = GAP + 2; // a non-zero share still draws at least 2px after its gap
const MAX_THICKNESS = 24;
const CHAR_W = 6.6; // average glyph width of 12px labels
const TICK_W = 6.2; // ... of the 11px tick labels
const percentFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const defaultFormatPercent = (n: number) => `${percentFormatter.format(n)}%`;

/** Shares (0–100) of each series in each row. Rows that add up to 0 get all-zero shares. */
export function percentShares(data: readonly ChartRow[], series: readonly ChartSeries[]) {
  return data.map((row) => {
    const values = series.map((s) => Math.max(0, num(row[s.key])));
    const total = values.reduce((sum, v) => sum + v, 0);
    return { values, total, shares: values.map((v) => (total > 0 ? (v / total) * 100 : 0)) };
  });
}

type Active = { ci: number; si: number | null };

type Segment = {
  key: string;
  d: string;
  d0: string;
  color: string;
  ci: number;
  si: number;
  /** Hit area along the value axis (raw boundaries, so the gap is covered too). */
  from: number;
  to: number;
  /** Centre of the segment, for the tooltip and value chip. */
  cx: number;
  cy: number;
  chip?: { text: string; w: number };
};

/**
 * Bars that all add up to 100%, so each bar shows the mix rather than the size. Use it to compare composition across categories (traffic sources per month, plan mix per region).
 *
 * Keyboard: Tab focuses the chart; in the vertical layout Left/Right move between bars and Up/Down between the segments of a bar (the horizontal layout swaps them), Home and End jump to the first and last bar, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce each segment's value and share. `PercentBarTable` is the table view.
 * Glass and motion: segments grow in the first time the chart appears and tween on data change; reduced motion makes both instant. Only the glass-3 tooltip uses backdrop blur.
 *
 * @example
 * ```tsx
 * import { PercentBarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PercentBarChart
 *       data={[
 *         { region: "EU", free: 60, pro: 30, team: 10 },
 *         { region: "US", free: 45, pro: 35, team: 20 },
 *       ]}
 *       index="region"
 *       series={[
 *         { key: "free", label: "Free" },
 *         { key: "pro", label: "Pro" },
 *         { key: "team", label: "Team" },
 *       ]}
 *       aria-label="Plan mix by region"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/percent-stacked-bar-chart
 */
export function PercentBarChart({
  data,
  index,
  series,
  layout = "horizontal",
  showValues = false,
  height,
  format = formatCompact,
  formatPercent = defaultFormatPercent,
  emptyState,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<PercentBarChartProps>) {
  const patternUid = useId();
  const hatched = resolvePatterns(patterns, series.length);
  const t = { ...defaultPercentBarChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const { fade, exit } = chartFades(reduced);
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const mounted = useHasMounted(width > 0 && data.length > 0);
  const [active, setActive] = useState<Active | null>(null);
  const input = useInputSource();
  const horizontal = layout === "horizontal";

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const dataChanged = useDataChanged(dataSignature(data, [index, ...series.map((s) => s.key)]));
  const rows = useMemo(() => percentShares(data, series), [data, series]);

  const catLabel = (ci: number) => String(data[ci]?.[index] ?? "");
  // Narrow charts on touch screens: the readout docks in a band above the plot.
  const docked = useDockedReadout(width);
  /**
   * The readout for one category: each share (leading) with the value behind it, then the total.
   * Rows follow the drawing: left to right for bars, top down for columns. With `si`, just that
   * segment (the mark under the pointer) and the category's total. The docked readout keeps
   * to the shares; the raw values are in the table.
   */
  const readoutAt = (ci: number, si: number | null = null) => {
    const row = rows[ci];
    const order = series.map((s, k) => ({ s, si: k })).filter((o) => si === null || o.si === si);
    if (!horizontal) order.reverse();
    const share = (k: number) => (row && row.total > 0 ? formatPercent(row.shares[k] ?? 0) : "–");
    const raw = (k: number) => format(row?.values[k] ?? 0);
    const readoutRows: TooltipRow[] = [
      ...order.map(({ s, si: k }) => ({
        label: docked && si === null ? s.label : `${s.label} · ${raw(k)}`,
        value: share(k),
        color: seriesColor(s, k),
        kind: "rect" as const,
      })),
      { label: t.total, value: format(row?.total ?? 0), color: "transparent" },
    ];
    const spoken = [
      ...order.map(({ s, si: k }) => `${s.label} ${share(k)} (${raw(k)})`),
      `${t.total} ${format(row?.total ?? 0)}`,
    ];
    return { title: catLabel(ci), rows: readoutRows, spoken: spoken.join(", "), share, raw };
  };

  const dock = docked
    ? dockSpace(
        width,
        data.map((_, ci) => readoutAt(ci)),
      )
    : 0;

  const longest = horizontal ? data.reduce((n, row) => Math.max(n, String(row[index] ?? "").length), 0) : 0;
  const labelCol = horizontal ? clamp(Math.ceil(longest * CHAR_W) + 20, 56, Math.max(56, Math.floor(width * 0.38))) : 0;
  const maxChars = Math.max(3, Math.floor((labelCol - 20) / CHAR_W));
  const ticks = [0, 25, 50, 75, 100];
  const widestTick = Math.max(...ticks.map((tk) => formatPercent(tk).length)) * TICK_W;
  const h = height ?? (horizontal ? Math.max(140, data.length * 40 + 36) + dock : 260);
  const M = horizontal
    ? { top: 4 + dock, bottom: 26, left: labelCol, right: Math.ceil(widestTick / 2) + 6 }
    : { top: 12 + dock, bottom: 28, left: Math.ceil(widestTick) + 16, right: 12 };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, h - M.top - M.bottom);
  const scale = horizontal ? linear(0, 100, 0, innerW) : linear(0, 100, innerH, 0);
  // Fewer tick labels when they'd touch (narrow horizontal charts).
  const tickGap = Math.abs(scale(25) - scale(0));
  const tickEvery = horizontal && tickGap < widestTick + 10 ? 2 : 1;

  const band = (horizontal ? innerH : innerW) / Math.max(1, data.length);
  const thickness = Math.max(2, Math.min(MAX_THICKNESS, band * 0.62));

  const axisLen = horizontal ? innerW : innerH;
  // px along the value axis (0 = the baseline) -> plot coordinate.
  const at = (px: number) => (horizontal ? px : innerH - px);
  const segments: Segment[] = [];
  rows.forEach((row, ci) => {
    const start = ci * band + (band - thickness) / 2;
    let lastNonZero = -1;
    row.shares.forEach((p, si) => {
      if (p > 0) lastNonZero = si;
    });
    // Every non-zero share gets at least MIN_SEG px, so a 0.1% sliver still shows (and can be hovered).
    const lens = withMinimum(
      row.shares.map((p) => (p / 100) * axisLen),
      MIN_SEG,
    );
    let acc = 0;
    row.shares.forEach((p, si) => {
      const s = itemAt(series, si);
      const from = acc;
      const to = (acc += lens[si] ?? 0);
      if (p <= 0) return;
      const isEnd = si === lastNonZero;
      let a = at(from);
      let b = at(to);
      const dir = horizontal ? 1 : -1;
      if (from > 0) a += (dir * GAP) / 2;
      if (!isEnd) b -= (dir * GAP) / 2;
      const len = Math.max(0, (b - a) * dir);
      const end = isEnd ? (horizontal ? "right" : "top") : "none";
      // Same precision as the tooltip: 99.9% never prints as "100%" beside other segments.
      const text = formatPercent(p);
      const textW = text.length * TICK_W + 10;
      const fits = horizontal ? len >= textW + 6 && thickness >= 16 : thickness >= textW + 2 && len >= 22;
      segments.push({
        key: `${keys[ci]}|${s.key}`,
        d: horizontal ? barPath(a, start, len, thickness, end) : barPath(start, a - len, thickness, len, end),
        d0: horizontal ? barPath(0, start, 0, thickness, end) : barPath(start, innerH, thickness, 0, end),
        color: seriesColor(s, si),
        ci,
        si,
        from: at(from),
        to: at(to),
        cx: horizontal ? a + len / 2 : start + thickness / 2,
        cy: horizontal ? start + thickness / 2 : a - len / 2,
        chip: showValues && fits ? { text, w: textW } : undefined,
      });
    });
  });

  if (data.length === 0 || series.length === 0) {
    return (
      <ChartEmpty height={h} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.noData}
      </ChartEmpty>
    );
  }

  const act = active && active.ci < data.length ? active : null;
  const actSi = act && act.si !== null && act.si < series.length ? act.si : null;
  const readout = act ? readoutAt(act.ci, actSi) : null;
  const actSeg = act && actSi !== null ? segments.find((sg) => sg.ci === act.ci && sg.si === actSi) : undefined;
  const tooltipPos = !act
    ? { x: 0, y: 0 }
    : actSeg
      ? { x: M.left + actSeg.cx, y: M.top + actSeg.cy }
      : horizontal
        ? { x: M.left + innerW / 2, y: M.top + act.ci * band + band / 2 }
        : { x: M.left + act.ci * band + band / 2, y: M.top + innerH / 2 };
  // A segment announces itself; a whole category announces every share.
  const announce =
    !act || !readout
      ? ""
      : actSi !== null
        ? `${readout.title}, ${itemAt(series, actSi).label}: ${readout.share(actSi)}, ${readout.raw(actSi)}`
        : `${readout.title}: ${readout.spoken}`;

  // Keyboard: one axis walks the categories, the other walks the segments of the current one.
  function onKeyDown(event: React.KeyboardEvent) {
    const n = data.length;
    const m = series.length;
    input.fromKeyboard();
    const ci = act?.ci ?? -1;
    const si = actSi;
    const [nextCat, prevCat, nextSeg, prevSeg] = horizontal
      ? ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]
      : ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
    let next: Active | null | undefined;
    if (event.key === nextCat) next = { ci: Math.min(n - 1, ci + 1), si };
    else if (event.key === prevCat) next = { ci: Math.max(0, ci - 1), si };
    else if (event.key === nextSeg) next = { ci: Math.max(0, ci), si: si === null ? 0 : Math.min(m - 1, si + 1) };
    else if (event.key === prevSeg) next = { ci: Math.max(0, ci), si: si === null || si === 0 ? null : si - 1 };
    else if (event.key === "Home") next = { ci: 0, si };
    else if (event.key === "End") next = { ci: n - 1, si };
    else if (event.key === "Escape" && act) next = null; // one press clears the readout, like every other chart
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
  }

  const move = reduced || !dataChanged ? { duration: 0 } : { duration: duration.slow, ease: changeEase };
  const grow = (ci: number) =>
    reduced
      ? { duration: 0 }
      : !mounted
        ? { duration: duration.slower, ease: enterEase, delay: Math.min(ci * 0.05, 0.4) }
        : move;
  const chipDelay = (ci: number) => (reduced ? 0 : !mounted ? duration.slower * 0.85 + Math.min(ci * 0.05, 0.4) : 0);
  const shownLabels = horizontal
    ? null
    : thinLabels(
        data.map((_, ci) => catLabel(ci)),
        band,
      );
  const dimmed = (sg: Segment) => act !== null && (sg.ci !== act.ci || (actSi !== null && sg.si !== actSi));

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height: h }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width}
          height={h}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm", chartFocusClass)}
        >
          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {hatched && (
              <ChartPatternDefs
                id={patternUid}
                entries={series.map((s, i) => ({ index: i, color: seriesColor(s, i) }))}
              />
            )}
            {ticks.map((tk, ti) => {
              const p = scale(tk);
              const showLabel = ti % tickEvery === 0 || tk === 100;
              return horizontal ? (
                <g key={tk} transform={`translate(${p},0)`}>
                  <line y2={innerH} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  {showLabel && (
                    <text y={innerH + 18} textAnchor="middle" className="fill-sheen-fg-muted text-2xs tabular-nums">
                      {formatPercent(tk)}
                    </text>
                  )}
                </g>
              ) : (
                <g key={tk} transform={`translate(0,${p})`}>
                  <line x2={innerW} stroke={tk === 0 ? "var(--sheen-border)" : "var(--sheen-chart-grid)"} />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-sheen-fg-muted text-2xs tabular-nums">
                    {formatPercent(tk)}
                  </text>
                </g>
              );
            })}

            {/* Category labels: truncated (full name in a <title>) beside horizontal bars, thinned under columns. */}
            <AnimatePresence initial={false}>
              {data.map((_, ci) => {
                if (shownLabels && !shownLabels.has(ci)) return null;
                const label = catLabel(ci);
                const short = horizontal ? truncate(label, maxChars) : label;
                const pos = ci * band + band / 2;
                return (
                  <motion.text
                    key={keys[ci]}
                    x={horizontal ? -12 : undefined}
                    y={horizontal ? undefined : innerH + 20}
                    dy={horizontal ? "0.32em" : undefined}
                    textAnchor={horizontal ? "end" : "middle"}
                    className={cn("fill-sheen-fg-muted", horizontal ? "text-xs" : "text-2xs")}
                    initial={horizontal ? { opacity: 0, y: pos } : { opacity: 0, x: pos }}
                    animate={horizontal ? { opacity: 1, y: pos } : { opacity: 1, x: pos }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, y: move, opacity: fade(duration.base) }}
                  >
                    {short !== label && <title>{label}</title>}
                    {short}
                  </motion.text>
                );
              })}
            </AnimatePresence>

            {/* Hover band behind the active category. */}
            {act !== null && (
              <rect
                x={horizontal ? -8 : act.ci * band + 2}
                y={horizontal ? act.ci * band + 2 : -4}
                width={horizontal ? innerW + 16 : Math.max(0, band - 4)}
                height={horizontal ? Math.max(0, band - 4) : innerH + 4}
                rx={8}
                fill="var(--sheen-hover)"
              />
            )}

            {/* Categories that add up to 0: an empty track, so the row still reads. */}
            {rows.map((row, ci) => {
              if (row.total > 0) return null;
              const start = ci * band + (band - thickness) / 2;
              return (
                <g key={`empty-${keys[ci]}`}>
                  <rect
                    x={horizontal ? 0 : start}
                    y={horizontal ? start : 0}
                    width={horizontal ? innerW : thickness}
                    height={horizontal ? thickness : innerH}
                    rx={4}
                    fill="none"
                    stroke="var(--sheen-border)"
                    strokeDasharray="3 3"
                  />
                  {horizontal && (
                    <text
                      x={innerW / 2}
                      y={start + thickness / 2}
                      dy="0.32em"
                      textAnchor="middle"
                      className="fill-sheen-fg-muted text-2xs"
                    >
                      {t.noData}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Segments share one path structure, so they tween from any shape to any other. */}
            <g className="forced-color-adjust-none">
              <AnimatePresence>
                {segments.map((sg) => (
                  <motion.path
                    key={sg.key}
                    fill={patternFill(hatched, patternUid, sg.si, sg.color)}
                    initial={reduced ? false : { d: sg.d0, opacity: 1 }}
                    animate={{ d: sg.d, opacity: dimmed(sg) ? 0.4 : 1 }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ d: grow(sg.ci), opacity: fade(duration.fast) }}
                  />
                ))}
              </AnimatePresence>
            </g>

            {/* Share chips: surface-coloured pills with body text, so they pass contrast on any fill. */}
            <AnimatePresence>
              {segments.map((sg) =>
                sg.chip ? (
                  <motion.g
                    key={`chip-${sg.key}`}
                    initial={{ opacity: 0, x: sg.cx, y: sg.cy }}
                    animate={{ opacity: dimmed(sg) ? 0.5 : 1, x: sg.cx, y: sg.cy }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, y: move, opacity: fade(duration.base, chipDelay(sg.ci)) }}
                  >
                    <rect
                      x={-sg.chip.w / 2}
                      y={-8}
                      width={sg.chip.w}
                      height={16}
                      rx={8}
                      fill="var(--sheen-chart-surface)"
                      opacity={0.92}
                    />
                    <text dy="0.32em" textAnchor="middle" className="fill-sheen-fg text-2xs font-semibold tabular-nums">
                      {sg.chip.text}
                    </text>
                  </motion.g>
                ) : null,
              )}
            </AnimatePresence>

            {/* Hit areas: the whole category band (label included), then each segment on top of it. */}
            {data.map((_, ci) => (
              <rect
                key={`hit-${keys[ci]}`}
                x={horizontal ? -labelCol : ci * band}
                y={horizontal ? ci * band : 0}
                width={horizontal ? innerW + labelCol : band}
                height={horizontal ? band : innerH}
                fill="transparent"
                onPointerEnter={() => {
                  input.fromPointer();
                  setActive({ ci, si: null });
                }}
                onPointerDown={() => {
                  input.fromPointer();
                  setActive({ ci, si: null });
                }}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              />
            ))}
            {segments.map((sg) => {
              const lo = Math.min(sg.from, sg.to);
              const len = Math.abs(sg.to - sg.from);
              const select = () => {
                input.fromPointer();
                setActive({ ci: sg.ci, si: sg.si });
              };
              return (
                <rect
                  key={`hit-${sg.key}`}
                  x={horizontal ? lo : sg.ci * band}
                  y={horizontal ? sg.ci * band : lo}
                  width={horizontal ? len : band}
                  height={horizontal ? band : len}
                  fill="transparent"
                  onPointerEnter={select}
                  onPointerDown={select}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                />
              );
            })}
          </g>
        </ChartFigure>
      )}

      {docked && !readout && <DockHint height={dockHintHeight(dock)}>{t.touchHint}</DockHint>}
      {readout && (
        <FittedTooltip
          title={readout.title}
          rows={readout.rows}
          x={tooltipPos.x}
          y={tooltipPos.y}
          containerWidth={width}
          docked={docked}
        />
      )}
      <ChartAnnouncer text={input.announce(announce)} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of PercentBarTable, the table view of the chart: the chart's data and formatting props
 * plus a hidden `caption` for screen readers.
 */
export type PercentBarTableProps = {
  /** Takes the same rows as the chart. */
  data: readonly ChartRow[];
  /** Key of each row that names its bar. */
  index: string;
  /** Takes the same series as the chart. */
  series: readonly ChartSeries[];
  /** Formats a value for the data table cells: takes the number, returns the text shown. Default compact numbers. */
  format?: (n: number) => string;
  /** Formats a share of the total for the data table cells: takes the share, returns the text shown. Default whole-percent format. */
  formatPercent?: (n: number) => string;
  /** Sets the header of the first column. */
  indexLabel?: string;
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  /** Show a Total column (default true). */
  showTotal?: boolean;
  /** Override the "Total" column header and the empty text. */
  labels?: Partial<Pick<PercentBarChartLabels, "total" | "noData">>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The table view of a part-to-whole chart (PercentBarChart, or StackedAreaChart in percent
 * mode): every cell gives the share AND the value it comes from.
 *
 * Takes the same `data`, `index`, `series`, `format` and `formatPercent` as PercentBarChart, plus `indexLabel`, `caption` (hidden, names the table), `showTotal` and `labels`. A real table giving each value and its share; it scrolls in a region that is focusable only when it overflows. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { PercentBarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PercentBarTable
 *       data={[{ region: "EU", free: 60, pro: 30, team: 10 }]}
 *       index="region"
 *       series={[
 *         { key: "free", label: "Free" },
 *         { key: "pro", label: "Pro" },
 *         { key: "team", label: "Team" },
 *       ]}
 *       indexLabel="Region"
 *       caption="Plan mix by region"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/percent-stacked-bar-chart
 */
export function PercentBarTable({
  data,
  index,
  series,
  format = formatCompact,
  formatPercent = defaultFormatPercent,
  indexLabel,
  caption,
  showTotal = true,
  labels,
  className,
}: PercentBarTableProps) {
  const t = { ...defaultPercentBarChartLabels, ...labels };
  const rows = percentShares(data, series);
  return (
    <TableScroll label={caption ?? indexLabel ?? index} className={className}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 font-medium">
              {indexLabel ?? index}
            </th>
            {series.map((s, i) => (
              <th key={s.key} scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 text-end font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <LegendKey color={seriesColor(s, i)} />
                  {s.label}
                </span>
              </th>
            ))}
            {showTotal && (
              <th scope="col" className="py-2 pe-3 sm:pe-4 last:pe-0 text-end font-medium">
                {t.total}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={series.length + (showTotal ? 2 : 1)} className="py-6 text-center text-sheen-fg-muted">
                {t.noData}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri} className="border-b border-sheen-border last:border-0">
                <th scope="row" className="min-w-20 py-2 pe-3 sm:pe-4 last:pe-0 font-normal text-sheen-fg-muted">
                  {data[ri]?.[index]}
                </th>
                {series.map((s, si) => (
                  <td key={s.key} className="py-2 pe-3 sm:pe-4 last:pe-0 text-end whitespace-nowrap tabular-nums">
                    <span className="font-medium">{row.total > 0 ? formatPercent(row.shares[si] ?? 0) : "–"}</span>
                    <span className="ms-1.5 text-xs text-sheen-fg-muted">{format(row.values[si] ?? 0)}</span>
                  </td>
                ))}
                {showTotal && (
                  <td className="py-2 pe-3 sm:pe-4 last:pe-0 text-end tabular-nums">{format(row.total)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}
