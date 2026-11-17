"use client";

import type { ComponentProps } from "react";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useMotionValueEvent } from "motion/react";
import { useId, useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartLegend, LegendKey } from "./chart-parts";
import {
  chartKeyHandler,
  clamp,
  formatCompact,
  num,
  slotColor,
  truncate,
  useElementWidth,
  useTweenedNumbers,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, patternFill, resolvePatterns } from "./chart-patterns";
import { TableScroll } from "./chart-fit";

/** One ring of a RadialBarChart: a label, a value, the value of a full ring and a colour slot. */
export type RadialBarItem = {
  label: string;
  value: number;
  /** Value of a full ring (a goal or a capacity). Default: the chart's `max`. Values past it fill the ring. */
  max?: number;
  /** Colour slot 1–8. Default: the item's position. */
  color?: ChartColor;
};

/** Every string the chart shows or announces, for translation. */
export type RadialBarChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** "8,200 of 10,000" */
  ofMax: (value: string, max: string) => string;
  /** Table headers. */
  metric: string;
  value: string;
  max: string;
  percent: string;
  /** Shown when there is nothing to plot. */
  empty: string;
};

/**
 * The built-in English strings of RadialBarChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultRadialBarChartLabels: RadialBarChartLabels = {
  instructions: "Use arrow keys to read each ring.",
  ofMax: (value, max) => `${value} of ${max}`,
  metric: "Metric",
  value: "Value",
  max: "Goal",
  percent: "Progress",
  empty: "No data",
};

/**
 * Props of RadialBarChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type RadialBarChartProps = {
  /** Takes 2–5 measures, outermost ring first. */
  data: readonly RadialBarItem[];
  /** Value of a full ring for items without their own `max`. */
  max?: number;
  /**
   * "arc": three-quarter rings with their names in the open quarter (no legend needed).
   * "ring": full rings, with a legend beside them.
   */
  variant?: "arc" | "ring";
  /** What the ring labels and legend print: the share of the goal, or the value itself. */
  display?: "percent" | "value";
  /** Largest diameter (px). The chart shrinks to fit narrower containers. */
  diameter?: number;
  /** Formats values (tooltip centre, table). */
  format?: (n: number) => string;
  /** Formats each share (a number from 0 to 100) for the labels and tooltip. */
  formatPercent?: (n: number) => string;
  /** Shown in the centre while no ring is active, e.g. an overall score. */
  centerValue?: ReactNode;
  /** Shows the caption in the middle under `centerValue`. */
  centerLabel?: ReactNode;
  /**
   * Tell rings apart without colour (hatch fills). Default: on when the chart has more than 3 rings.
   *
   * @default true when data.length > 3
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<RadialBarChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const percentFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
/** "82%" / "\u221220%": a typographic minus, as formatCompact. */
const formatPercentDefault = (n: number) => `${percentFormatter.format(n).replace("-", "\u2212")}%`;
const fullFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
/** 8,240 · 10,000 · −20: whole numbers, so a value and its goal always read in the same notation. */
const formatFull = (n: number) => (Number.isFinite(n) ? fullFormatter.format(n).replace("-", "\u2212") : "–");
/**
 * The formatter for a value read next to its goal ("8,240 of 10,000"): the default compact format
 * would switch notation at 10K mid-sentence, so it becomes the full one. A custom format is kept.
 */
const pairFormat = (format: (n: number) => string) => (format === formatCompact ? formatFull : format);
const f = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0");
const START = -Math.PI / 2;
/** Track: a lighter step of the ring's own colour; a touch stronger on dark surfaces, where a faint tint sinks. */
const trackColor = (color: string) =>
  `light-dark(color-mix(in srgb, ${color} 16%, transparent), color-mix(in srgb, ${color} 24%, transparent))`;
const CHAR_W = 6.6; // average glyph width of 12px labels

/**
 * A ring segment (annular sector) from angle a0 to a1, clockwise. The start is square and the
 * data end gets `corner` px rounded corners: the radial twin of a bar's rounded tip.
 */
function ringSegment(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, corner = 4) {
  const sweep = a1 - a0;
  if (!(sweep > 1e-4) || r1 <= r0) return "";
  const c = Math.min(corner, (r1 - r0) / 2, (sweep * r0) / 2);
  const P = (r: number, a: number) => `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  const outerEnd = a1 - c / r1;
  const innerEnd = a1 - c / r0;
  const large = (span: number) => (span > Math.PI ? 1 : 0);
  return (
    `M${P(r1, a0)} A${f(r1)},${f(r1)} 0 ${large(outerEnd - a0)} 1 ${P(r1, outerEnd)} ` +
    `Q${P(r1, a1)} ${P(r1 - c, a1)} L${P(r0 + c, a1)} Q${P(r0, a1)} ${P(r0, innerEnd)} ` +
    `A${f(r0)},${f(r0)} 0 ${large(innerEnd - a0)} 0 ${P(r0, a0)} Z`
  );
}

/**
 * The chart's table view: every measure with its value, goal and share.
 *
 * Props: the chart's `data`, `max`, `format`, `formatPercent` and `labels`, plus `caption` (hidden, names the table). A real table: each measure's value, goal and share. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { RadialBarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadialBarTable data={[{ label: "Move", value: 420, max: 600 }]} caption="Daily activity goals" />
 *   );
 * }
 * ```
 *
 * @see /charts/radial-bar-chart
 */
export function RadialBarTable({
  data,
  max = 100,
  format = formatCompact,
  formatPercent = formatPercentDefault,
  caption,
  labels,
}: Pick<RadialBarChartProps, "data" | "max" | "format" | "formatPercent" | "labels"> & {
  /** Visually hidden caption naming the table for screen readers. */
  caption?: string;
}) {
  const t = { ...defaultRadialBarChartLabels, ...labels };
  const exact = pairFormat(format);
  return (
    <TableScroll label={caption ?? t.metric}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-4 font-medium">
              {t.metric}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.value}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.max}
            </th>
            <th scope="col" className="py-2 pe-4 text-end font-medium">
              {t.percent}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-sheen-fg-muted">
                {t.empty}
              </td>
            </tr>
          ) : (
            data.map((item, i) => {
              const goal = item.max ?? max;
              const value = num(item.value);
              return (
                <tr key={i} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className="py-2 pe-4 font-normal text-sheen-fg-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <LegendKey color={slotColor(item.color ?? i + 1)} />
                      {item.label}
                    </span>
                  </th>
                  <td className="py-2 pe-4 text-end tabular-nums">{exact(value)}</td>
                  <td className="py-2 pe-4 text-end tabular-nums">{exact(goal)}</td>
                  <td className="py-2 pe-4 text-end tabular-nums">
                    {formatPercent(goal > 0 ? (value / goal) * 100 : 0)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}

/**
 * Concentric arcs or rings, one per measure, each filled to its share of a maximum. Use it for a few goals or quotas shown side by side (Apple-style activity rings).
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between measures, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the measure, value and share. `RadialBarTable` is the table view.
 * Glass and motion: no backdrop blur on the plot. Reduced motion draws the arcs in place.
 *
 * @example
 * ```tsx
 * import { RadialBarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadialBarChart
 *       data={[
 *         { label: "Move", value: 420, max: 600 },
 *         { label: "Exercise", value: 25, max: 30 },
 *         { label: "Stand", value: 9, max: 12 },
 *       ]}
 *       aria-label="Daily activity goals"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/radial-bar-chart
 */
export function RadialBarChart({
  data,
  max = 100,
  variant = "arc",
  display = "percent",
  diameter: size = 260,
  format = formatCompact,
  formatPercent = formatPercentDefault,
  centerValue,
  centerLabel,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<RadialBarChartProps>) {
  const t = { ...defaultRadialBarChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const rootMerged = useMergedRef(ref, outerRef);
  const [active, setActive] = useState<number | null>(null);

  const items = data.map((item, i) => {
    const goal = item.max ?? max;
    const value = num(item.value);
    const pct = goal > 0 ? (value / goal) * 100 : 0;
    return {
      label: item.label,
      value,
      goal,
      pct,
      color: slotColor(item.color ?? i + 1),
      text: display === "percent" ? formatPercent(pct) : format(value),
    };
  });
  const n = items.length;
  const patternId = useId();
  const hatched = resolvePatterns(patterns, n);

  // Values tween on change; on first paint the rings sweep in, outermost first.
  // The tweens are MotionValues: each frame is painted onto the fill paths below, so React commits nothing per frame.
  const sharesTween = useTweenedNumbers(
    items.map((it) => clamp(it.pct / 100, 0, 1)),
    { instant: reduced },
  );
  const entranceTween = useTweenedNumbers([1], { instant: reduced, from: [0], duration: duration.slower * 1.8 });
  const fills = useRef<(SVGPathElement | null)[]>([]);

  // Nothing is drawn until the container is measured: a fixed-size first frame would set the
  // layout's min-content width and stop the chart from ever shrinking below `size`.
  const S = width > 0 ? Math.max(0, Math.min(size, width)) : 0;
  const c = S / 2;
  const outer = S / 2 - 2;
  const hole = outer * 0.36;
  const pitch = n > 0 ? (outer - hole) / n : 0;
  const gap = clamp(pitch * 0.26, 3, 8);
  const thickness = Math.min(24, Math.max(2, pitch - gap));
  const full = variant === "arc" ? Math.PI * 1.5 : Math.PI * 2;
  const rings = items.map((it, k) => {
    const r1 = outer - k * pitch;
    const r0 = r1 - thickness;
    // A full ring keeps a 2px surface gap at its seam, so where it ends stays readable.
    const span = variant === "ring" ? full - 2 / r1 : full;
    return { ...it, r0, r1, mid: (r0 + r1) / 2, span };
  });

  // The d of ring k's fill at the current tween frame. Staggered entrance: each ring starts a beat after the one outside it.
  const fillPath = (k: number) => {
    const rg = rings[k];
    if (!rg) return "";
    const lag = Math.min(0.12, 0.5 / n);
    const entrance = entranceTween.read()[0] ?? 1;
    const local = clamp((entrance - k * lag) / Math.max(0.01, 1 - (n - 1) * lag), 0, 1);
    const share = (sharesTween.read()[k] ?? 0) * local;
    return ringSegment(c, c, rg.r0, rg.r1, START, START + rg.span * share);
  };
  const paint = () => {
    fills.current.forEach((el, k) => el?.setAttribute("d", fillPath(k)));
  };
  useMotionValueEvent(sharesTween.value, "change", paint);
  useMotionValueEvent(entranceTween.value, "change", paint);

  // Labels in the open quarter (arc): the name and value end just left of each ring's start.
  // They need ~14px per ring and room for at least a few characters, or the legend takes over.
  const labelSize = pitch >= 15 ? "text-xs" : "text-2xs";
  const labelRoom = c - 10 - 4;
  const valueChars = rings.reduce((m, rg) => Math.max(m, rg.text.length), 0);
  const nameChars = Math.floor(labelRoom / (labelSize === "text-xs" ? CHAR_W : CHAR_W * 0.92)) - valueChars - 1;
  const directLabels = variant === "arc" && pitch >= 12 && nameChars >= 4;

  if (n === 0) {
    return (
      <ChartEmpty height={Math.min(size, 200)} aria-label={ariaLabel} className={className}>
        {t.empty}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < n ? active : null;
  const focus = act !== null ? rings[act] : undefined;

  function onPointer(event: React.PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const d = Math.hypot(event.clientX - box.left - c, event.clientY - box.top - c);
    const k = rings.findIndex((rg) => d >= rg.r0 - gap / 2 && d <= rg.r1 + gap / 2);
    if (k >= 0) setActive(k);
    else if (event.pointerType === "mouse") setActive(null);
  }

  const centre = focus ? (
    <>
      <span className="font-semibold tracking-tight tabular-nums" style={{ fontSize: Math.max(16, hole * 0.42) }}>
        {display === "percent" ? formatPercent(focus.pct) : format(focus.value)}
      </span>
      <span className="max-w-full truncate text-2xs text-sheen-fg-muted">{focus.label}</span>
    </>
  ) : centerValue !== undefined || centerLabel !== undefined ? (
    <>
      {centerValue !== undefined && (
        <span className="font-semibold tracking-tight" style={{ fontSize: Math.max(16, hole * 0.42) }}>
          {centerValue}
        </span>
      )}
      {centerLabel !== undefined && (
        <span className="max-w-full truncate text-2xs text-sheen-fg-muted">{centerLabel}</span>
      )}
    </>
  ) : null;

  const exact = pairFormat(format);

  return (
    <div
      {...rest}
      ref={rootMerged}
      className={cn("flex w-full max-w-full min-w-0 flex-wrap items-center justify-center gap-6", className)}
    >
      {/* The focus ring is drawn on this square (rounded), not on the svg: WebKit clips a rounded svg's
          content to its corners, and the square encloses the ring labels too. In forced colours the
          theme already gives the focused svg (the same square) a Highlight outline, so this one steps
          aside instead of doubling it. */}
      <div
        className={cn(
          "relative max-w-full min-w-0 shrink-0 rounded-sheen-md",
          "has-[>svg:focus-visible]:outline-solid has-[>svg:focus-visible]:outline-2 has-[>svg:focus-visible]:outline-offset-2 has-[>svg:focus-visible]:outline-sheen-focus",
          "forced-colors:has-[>svg:focus-visible]:outline-none",
        )}
        style={{ width: S, height: S }}
      >
        {S > 0 && (
          <ChartFigure
            as="svg"
            width={S}
            height={S}
            label={ariaLabel}
            description={resolveInstructions(t.instructions)}
            tabIndex={0}
            onKeyDown={chartKeyHandler(n, act, setActive)}
            onBlur={() => setActive(null)}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            className="block overflow-visible outline-none"
          >
            {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
            <g aria-hidden className="forced-color-adjust-none">
              {hatched && (
                <ChartPatternDefs id={patternId} entries={rings.map((rg, k) => ({ index: k, color: rg.color }))} />
              )}
              {rings.map((rg, k) => {
                // While a ring is active the others step back (marks only: every label stays AA-legible).
                return (
                  <g
                    key={k}
                    className="motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)"
                    style={{ opacity: act === null || act === k ? 1 : 0.4 }}
                  >
                    {/* Track: a lighter step of the ring's own colour. */}
                    {variant === "ring" ? (
                      <circle
                        cx={c}
                        cy={c}
                        r={rg.mid}
                        fill="none"
                        style={{ stroke: trackColor(rg.color) }}
                        strokeWidth={thickness}
                      />
                    ) : (
                      <path
                        d={ringSegment(c, c, rg.r0, rg.r1, START, START + rg.span)}
                        style={{ fill: trackColor(rg.color) }}
                      />
                    )}
                    <path
                      ref={(el) => {
                        fills.current[k] = el;
                      }}
                      d={fillPath(k)}
                      fill={patternFill(hatched, patternId, k, rg.color)}
                    />
                  </g>
                );
              })}

              {directLabels &&
                rings.map((rg, k) => {
                  const name = truncate(rg.label, nameChars);
                  return (
                    <text key={`l-${k}`} x={c - 10} y={c - rg.mid} dy="0.32em" textAnchor="end" className={labelSize}>
                      {name !== rg.label && <title>{rg.label}</title>}
                      <tspan className={act === k ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted"}>{name}</tspan>
                      <tspan dx={6} className="fill-sheen-fg font-semibold tabular-nums">
                        {rg.text}
                      </tspan>
                    </text>
                  );
                })}
            </g>
          </ChartFigure>
        )}
        {centre && (
          <div
            aria-hidden={focus ? true : undefined}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-col items-center" style={{ maxWidth: hole * 1.6 }}>
              {centre}
            </div>
          </div>
        )}
      </div>

      {!directLabels && (
        <ChartLegend
          className="max-w-56 flex-col items-start gap-y-2"
          items={rings.map((rg, k) => ({
            label: rg.label,
            color: rg.color,
            kind: "rect",
            value: rg.text,
            pattern: hatched && k > 0 ? k : undefined,
          }))}
        />
      )}
      <ChartAnnouncer
        text={
          focus ? `${focus.label}: ${t.ofMax(exact(focus.value), exact(focus.goal))}, ${formatPercent(focus.pct)}` : ""
        }
      />
    </div>
  );
}

/** Props of {@link RadialBarTable}. The chart's table view: every measure with its value, goal and share. */
export type RadialBarTableProps = ComponentProps<typeof RadialBarTable>;
