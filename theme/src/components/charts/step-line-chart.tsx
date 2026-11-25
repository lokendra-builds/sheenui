"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartTooltip, type TooltipRow } from "./chart-parts";
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
  itemAt,
} from "./chart-utils";
import {
  estimateReadoutHeight,
  estimateTooltipWidth,
  longestOf,
  tooltipContainerWidth,
  tooltipNoWrapClass,
  tooltipSide,
} from "./range-area-chart";
import { ChartFigure } from "./chart-figure";

/**
 * Where each row's x label sits on its step. Every value holds flat for exactly one step, so
 * the line is the same for all three; the curve only moves the label, crosshair and dot:
 *
 * - "step-after": the value starts at its label and holds until the next one (prices, plan
 *   limits, interest rates: "changed on this date").
 * - "step-before": the value is reached at its label (end-of-period balances).
 * - "step": the label sits mid-step (binned counts).
 */
export type StepCurve = "step-after" | "step-before" | "step";

/** Every string the chart announces, for translation. */
export type StepLineChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
};

/**
 * The built-in English strings of StepLineChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultStepLineChartLabels: StepLineChartLabels = {
  instructions: "Use left and right arrow keys to read values.",
};

/**
 * Props of StepLineChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type StepLineChartProps = {
  /** One object per point: the `index` key plus one number per series key. */
  data: readonly ChartRow[];
  /** Key of the x value in each row (e.g. "month"). */
  index: string;
  /** The lines to draw. Give each a fixed `color` slot so filtering never repaints it. */
  series: readonly ChartSeries[];
  /** Where each value's label sits on its step. */
  curve?: StepCurve;
  /** Fill under each line with a soft 10% wash. */
  area?: boolean;
  /**
   * Keep zero on the value axis. Turn off for levels far from zero (prices, rates),
   * so the steps aren't squashed into the top of the plot. Always on with `area`.
   */
  zero?: boolean;
  /** Height of the chart in px; the width follows the container. Default 260. */
  height?: number;
  /** Formats values in the tooltip and labels, and on the axis (the default axis format follows the tick step). */
  format?: (n: number) => string;
  /** Label the end of each line (2–4 series, when the chart is wide enough and the labels don't collide). */
  endLabels?: boolean;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override any built-in string (i18n). */
  labels?: Partial<StepLineChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const CHAR_W = 6.2; // average glyph width of the 11px axis labels
const ANCHOR: Record<StepCurve, number> = { "step-after": 0, "step-before": 1, step: 0.5 };
const f = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "0");

/**
 * A step line across `count` equal steps: flat at each value for one step, then a vertical riser.
 * Every line with the same number of values shares one command structure, so Motion can morph it.
 */
function stepLine(ys: number[], step: number) {
  const [first, ...rest] = ys;
  if (first === undefined) return "";
  return `M0,${f(first)} H${f(step)}${rest.map((y, i) => ` V${f(y)} H${f((i + 2) * step)}`).join("")}`;
}

/**
 * A line chart whose lines hold their value until the next change. Use it for values that are set rather than measured: plan prices, inventory levels, status over time.
 *
 * Keyboard: Tab focuses the chart; Left/Right (Up/Down) arrows move the reading one point, Home and End jump, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the point and values. A table view is available through `ChartCard table`.
 * Glass and motion: the line draws in the first time the chart appears and tweens on data change; reduced motion makes it instant. Only the glass-3 tooltip uses backdrop blur.
 *
 * @example
 * ```tsx
 * import { StepLineChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <StepLineChart
 *       data={[
 *         { week: "W1", stock: 40 },
 *         { week: "W2", stock: 40 },
 *         { week: "W3", stock: 25 },
 *       ]}
 *       index="week"
 *       series={[{ key: "stock", label: "Units in stock" }]}
 *       aria-label="Stock level per week"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/step-line-chart
 */
export function StepLineChart({
  data,
  index,
  series,
  curve = "step-after",
  area = false,
  zero = true,
  height = 260,
  format = formatCompact,
  endLabels = true,
  emptyState,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<StepLineChartProps>) {
  const id = useId();
  const t = { ...defaultStepLineChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const mounted = useHasMounted(width > 0 && data.length > 0);
  const [active, setActive] = useState<number | null>(null);
  const count = data.length;

  // Identity of the x-axis: new categories re-draw the lines; the same categories with new values morph them.
  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const version = keys.join("\u0001");
  const dataChanged = useDataChanged(dataSignature(data, [index, ...series.map((s) => s.key)]) + curve);

  const ticks = useMemo(() => {
    const [min, max] = extent(data.flatMap((row) => series.map((s) => num(row[s.key]))));
    const withZero = zero || area;
    return niceTicks(withZero ? Math.min(0, min) : min, withZero ? Math.max(0, max) : max, 4);
  }, [data, series, zero, area]);
  const tickFormat = axisFormat(format);

  // Narrow charts (phones): the readout docks in a band above the plot, clear of the finger. The band
  // fits the widest readout the data can produce, wrapped to as many lines as it needs.
  const docked = useDockedReadout(width);
  const dock = docked
    ? estimateReadoutHeight(
        width,
        longestOf(data.map((row) => String(row[index] ?? ""))),
        series.map((s) => ({ label: s.label, value: longestOf(data.map((row) => format(num(row[s.key])))) })),
      ) + 10
    : 0;

  const xLabels = data.map((row) => String(row[index] ?? ""));
  const anchor = ANCHOR[curve];
  // End labels cost ~76px of plot: on narrow screens the legend carries identity instead.
  const showEndLabels = endLabels && series.length > 1 && series.length <= 4 && width >= 440;
  const widestTick = ticks.reduce((n, tk) => Math.max(n, tickFormat(tk).length), 0);
  // A label anchored on the plot's right edge ("step-before") needs half its width of margin.
  const lastHalf = anchor === 1 ? ((xLabels[count - 1]?.length ?? 0) * CHAR_W) / 2 + 4 : 0;
  const M = {
    top: 12 + dock,
    bottom: 28,
    left: clamp(Math.ceil(widestTick * CHAR_W) + 16, 36, 80),
    right: showEndLabels ? 76 : clamp(Math.ceil(lastHalf), 16, 64),
  };
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  const step = innerW / Math.max(1, count);
  const lo = ticks[0] ?? 0;
  const hi = ticks[ticks.length - 1] ?? 0;
  const yScale = linear(lo, hi, innerH, 0);
  const y = (v: number) => clamp(yScale(v), 0, innerH);
  const baseline = y(clamp(0, lo, hi));
  /** x of row i's label, crosshair and dot. */
  const ax = (i: number) => (i + anchor) * step;

  const lines = series.map((s, si) => {
    const ys = data.map((row) => y(num(row[s.key])));
    const line = stepLine(ys, step);
    return {
      s,
      color: seriesColor(s, si),
      ys,
      line,
      fill: line ? `${line} V${f(baseline)} H0 Z` : "",
      // Negative-only series: the wash is strongest at the line (bottom) and fades up to zero.
      negative: data.length > 0 && data.every((row) => num(row[s.key]) <= 0) && data.some((row) => num(row[s.key]) < 0),
    };
  });

  if (count === 0 || series.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < count ? active : null;
  const activeRow = act !== null ? data[act] : undefined;
  const tooltipRows: TooltipRow[] = activeRow
    ? lines
        .map((l) => ({
          label: l.s.label,
          value: format(num(activeRow[l.s.key])),
          color: l.color,
          raw: num(activeRow[l.s.key]),
        }))
        .sort((a, b) => b.raw - a.raw)
    : [];

  // End labels only when every pair sits at least 14px apart; otherwise the legend carries identity.
  const ends = lines.map((l) => ({ label: l.s.label, y: l.ys[l.ys.length - 1] ?? 0 })).sort((a, b) => a.y - b.y);
  const labelsFit = ends.every((e, i) => i === 0 || e.y - itemAt(ends, i - 1).y >= 14);

  // Choreography: each line draws left to right, THEN its end dot and label appear where it lands.
  // Under reduced motion every change (geometry, fades, exits) is instant.
  const instant = { duration: 0 };
  const draw = reduced ? 0 : mounted ? duration.slower * 1.15 : duration.slower * 1.2;
  const endDelay = reduced ? 0 : draw * 0.8;
  const move = reduced || !dataChanged ? instant : { duration: duration.slow, ease: changeEase };
  const fade = reduced ? instant : { duration: duration.base };
  const exit = reduced ? instant : exitTransition;
  const land = reduced ? instant : { duration: duration.base, delay: endDelay };
  const shownLabels = thinLabels(xLabels, step);

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    // Every value owns exactly one step, so the step under the pointer is the value it reads.
    const i = Math.floor(((event.clientX - rect.left) / Math.max(1, rect.width)) * count);
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
          {area && (
            <defs>
              {lines.map((l, i) => (
                <linearGradient
                  key={i}
                  id={`${id}-fill-${i}`}
                  x1="0"
                  x2="0"
                  y1={l.negative ? "1" : "0"}
                  y2={l.negative ? "0" : "1"}
                >
                  <stop offset="0%" stopColor={l.color} stopOpacity={series.length > 1 ? 0.1 : 0.16} />
                  <stop offset="100%" stopColor={l.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
          )}

          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden transform={`translate(${M.left},${M.top})`}>
            {/* Grid + y ticks: hairline, solid, recessive. They slide when the scale changes. */}
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

            {/* Hover band: the whole step the value holds for. */}
            {act !== null && <rect x={act * step} width={step} height={innerH} fill="var(--sheen-hover)" />}

            <AnimatePresence initial={false}>
              {xLabels.map((label, i) =>
                shownLabels.has(i) ? (
                  <motion.text
                    key={keys[i]}
                    y={innerH + 20}
                    textAnchor="middle"
                    className="fill-sheen-fg-muted text-2xs"
                    initial={reduced ? false : { opacity: 0, x: ax(i) }}
                    animate={{ opacity: 1, x: ax(i) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ x: move, opacity: fade }}
                  >
                    {label}
                  </motion.text>
                ) : null,
              )}
            </AnimatePresence>

            <g className="forced-color-adjust-none">
              {area && (
                <AnimatePresence>
                  {lines.map((l, i) => (
                    <motion.path
                      key={`a-${l.s.key}-${version}`}
                      fill={`url(#${id}-fill-${i})`}
                      initial={reduced ? false : { opacity: 0, d: l.fill }}
                      animate={{ opacity: 1, d: l.fill }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{
                        d: move,
                        opacity: reduced ? instant : { duration: duration.slow, delay: draw * 0.35 },
                      }}
                    />
                  ))}
                </AnimatePresence>
              )}

              <AnimatePresence>
                {lines.map((l) => (
                  <motion.path
                    key={`l-${l.s.key}-${version}`}
                    fill="none"
                    stroke={l.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: reduced ? 1 : 0, opacity: 1, d: l.line }}
                    animate={{ pathLength: 1, opacity: 1, d: l.line }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{
                      pathLength: reduced ? instant : { duration: draw, ease: enterEase },
                      d: move,
                      opacity: instant,
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* End dots (2px surface ring) appear as each line lands. */}
              <AnimatePresence>
                {lines.map((l) => {
                  const last = l.ys[l.ys.length - 1];
                  return last === undefined ? null : (
                    <motion.circle
                      key={`e-${l.s.key}-${version}`}
                      r={4}
                      fill={l.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                      initial={reduced ? false : { opacity: 0, cx: innerW, cy: last }}
                      animate={{ opacity: 1, cx: innerW, cy: last }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ cx: move, cy: move, opacity: land }}
                    />
                  );
                })}
              </AnimatePresence>
            </g>

            <AnimatePresence>
              {showEndLabels &&
                labelsFit &&
                lines.map((l) => {
                  const last = l.ys[l.ys.length - 1];
                  return last === undefined ? null : (
                    <motion.text
                      key={`t-${l.s.key}-${version}`}
                      dy="0.32em"
                      className="fill-sheen-fg-muted text-2xs"
                      initial={reduced ? false : { opacity: 0, x: innerW + 10, y: last }}
                      animate={{ opacity: 1, x: innerW + 10, y: last }}
                      exit={{ opacity: 0, transition: exit }}
                      transition={{ x: move, y: move, opacity: land }}
                    >
                      {l.s.label}
                    </motion.text>
                  );
                })}
            </AnimatePresence>

            {/* Crosshair at the row's label, with a ringed dot where each line holds that value. */}
            {act !== null && (
              <g pointerEvents="none">
                <line x1={ax(act)} x2={ax(act)} y2={innerH} stroke="var(--sheen-fg-subtle)" strokeWidth={1} />
                <g className="forced-color-adjust-none">
                  {lines.map((l, i) => {
                    const py = l.ys[act];
                    return py === undefined ? null : (
                      <circle
                        key={i}
                        cx={ax(act)}
                        cy={py}
                        r={4.5}
                        fill={l.color}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                      />
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
          <ChartTooltip
            title={String(activeRow[index] ?? "")}
            rows={tooltipRows}
            x={0}
            y={0}
            containerWidth={width}
            docked
          />
        ) : (
          // One line per row; it opens on whichever side has room for its full width.
          <div className={tooltipNoWrapClass}>
            <ChartTooltip
              title={String(activeRow[index] ?? "")}
              rows={tooltipRows}
              x={M.left + ax(act)}
              y={M.top + innerH / 2}
              containerWidth={tooltipContainerWidth(
                tooltipSide(M.left + ax(act), estimateTooltipWidth(String(activeRow[index] ?? ""), tooltipRows), width),
              )}
            />
          </div>
        ))}
      <ChartAnnouncer
        text={activeRow ? `${activeRow[index]}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(", ")}` : ""}
      />
    </div>
  );
}
