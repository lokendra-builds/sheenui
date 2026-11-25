"use client";

import { motion } from "motion/react";

import { duration, ease } from "../motion/tokens";
import { clamp, indexOfKey, type ChartRow } from "./chart-utils";

/**
 * Annotations: context drawn on top of (or behind) a chart's data.
 *   - "line":  a reference line at a value (target, average, threshold)
 *   - "band":  a band between two values (normal range, SLA window)
 *   - "event": a marker at one x value (a launch, an incident), with a label
 *   - "range": a band between two x values (a campaign, an outage)
 *
 * Labels are always text in text colours (never series colours), with a surface plate behind
 * them so lines never cut through the words. Events are also read out with the data point they
 * sit on (tooltip + screen-reader announcement), so nothing relies on seeing the marker.
 */

export type AnnotationTone = "neutral" | "accent" | "success" | "warning" | "danger";

/** A horizontal or vertical reference line at one value of the value axis, e.g. a target. */
export type ChartReferenceLine = {
  type: "line";
  /** Value on the value axis. */
  value: number;
  label?: string;
  tone?: AnnotationTone;
  /** Dashed (default) or solid. */
  dashed?: boolean;
};

/** A shaded band between two values of the value axis, e.g. an acceptable range. */
export type ChartReferenceBand = {
  type: "band";
  from: number;
  to: number;
  label?: string;
  tone?: AnnotationTone;
};

/** A marker on the index axis for something that happened at one point, e.g. a release. */
export type ChartEventMarker = {
  type: "event";
  /** The index value the event happened at (e.g. "Mar"), or a row position. */
  at: string | number;
  label: string;
  tone?: AnnotationTone;
};

/** A span on the index axis between two points, e.g. an incident or a campaign. */
export type ChartRangeMarker = {
  type: "range";
  /** First and last index values (or row positions) covered, inclusive. */
  from: string | number;
  to: string | number;
  label?: string;
  tone?: AnnotationTone;
};

/**
 * Anything a chart can annotate: a reference line, a band, an event marker or a range marker (told
 * apart by `type`).
 */
export type ChartAnnotation = ChartReferenceLine | ChartReferenceBand | ChartEventMarker | ChartRangeMarker;

/** Stroke / fill / text colours for a tone (tokens only). */
export function annotationColors(tone: AnnotationTone = "neutral") {
  switch (tone) {
    case "accent":
      return { stroke: "var(--sheen-accent)", fill: "var(--sheen-accent)", text: "var(--sheen-accent)" };
    case "success":
      return { stroke: "var(--sheen-success)", fill: "var(--sheen-success)", text: "var(--sheen-success-text)" };
    case "warning":
      return { stroke: "var(--sheen-warning)", fill: "var(--sheen-warning)", text: "var(--sheen-warning-text)" };
    case "danger":
      return { stroke: "var(--sheen-danger)", fill: "var(--sheen-danger)", text: "var(--sheen-danger-text)" };
    default:
      return { stroke: "var(--sheen-fg-subtle)", fill: "var(--sheen-fg-subtle)", text: "var(--sheen-fg-muted)" };
  }
}

/** Values the value axis should include so every reference line and band is on screen. */
export function annotationValues(annotations: readonly ChartAnnotation[] | undefined): number[] {
  const out: number[] = [];
  for (const a of annotations ?? []) {
    if (a.type === "line" && Number.isFinite(a.value)) out.push(a.value);
    else if (a.type === "band") {
      if (Number.isFinite(a.from)) out.push(a.from);
      if (Number.isFinite(a.to)) out.push(a.to);
    }
  }
  return out;
}

/** Event markers that sit on row `i` (read out with that row's values). */
export function eventsAt(
  annotations: readonly ChartAnnotation[] | undefined,
  data: readonly ChartRow[],
  index: string,
  i: number,
) {
  return (annotations ?? []).filter(
    (a): a is ChartEventMarker => a.type === "event" && indexOfKey(data, index, a.at) === i,
  );
}

const CHAR_W = 6.2; // average glyph width of the 11px labels
const PLATE_H = 16;

/** A polyline in plot px: a series the labels should keep clear of. */
export type AnnotationObstacle = readonly (readonly [number, number])[];

/** How many sampled points of `lines` fall inside the plate at (`left`, `y`) of width `w`. */
function crossings(lines: readonly AnnotationObstacle[], left: number, y: number, w: number) {
  const x0 = left - 2;
  const x1 = left + w + 2;
  const y0 = y - PLATE_H / 2 - 2;
  const y1 = y + PLATE_H / 2 + 2;
  let n = 0;
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, ay] = line[i] ?? [0, 0];
      const [bx, by] = line[i + 1] ?? [0, 0];
      if (Math.max(ax, bx) < x0 || Math.min(ax, bx) > x1) continue;
      const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 3));
      for (let k = 0; k <= steps; k++) {
        const x = ax + ((bx - ax) * k) / steps;
        const yy = ay + ((by - ay) * k) / steps;
        if (x >= x0 && x <= x1 && yy >= y0 && yy <= y1) n++;
      }
    }
  }
  return n;
}

/** The candidate whose plate crosses the data the least (the first one wins a tie): label collision avoidance. */
function leastCrossed<T extends { x: number; y: number; anchor: "start" | "end" }>(
  first: T,
  rest: readonly T[],
  text: string,
  lines: readonly AnnotationObstacle[] | undefined,
): T {
  const candidates = [first, ...rest];
  if (!lines || lines.length === 0) return first;
  const w = Math.ceil(text.length * CHAR_W) + 10;
  let best = first;
  let bestN = Infinity;
  for (const c of candidates) {
    const n = crossings(lines, c.anchor === "end" ? c.x - w : c.x, c.y, w);
    if (n < bestN) {
      best = c;
      bestN = n;
    }
    if (n === 0) break;
  }
  return best;
}

type LabelProps = { x: number; y: number; text: string; color: string; anchor: "start" | "end" };

/** A label on a surface plate, so marks behind it never cut through the words. */
function PlateLabel({ x, y, text, color, anchor }: LabelProps) {
  const w = Math.ceil(text.length * CHAR_W) + 10;
  const left = anchor === "end" ? x - w : x;
  return (
    <g>
      <rect
        x={left}
        y={y - PLATE_H / 2}
        width={w}
        height={PLATE_H}
        rx={5}
        fill="var(--sheen-chart-surface)"
        fillOpacity={0.88}
      />
      <text x={left + 5} y={y} dy="0.33em" className="text-2xs font-medium" style={{ fill: color }}>
        {text}
      </text>
    </g>
  );
}

/**
 * Props of ChartAnnotationsLayer: the annotations, the chart's data and index key, the plot size and
 * the scale functions that place them.
 */
export type ChartAnnotationsLayerProps = {
  /** The reference lines, bands, events and ranges to draw. */
  annotations: readonly ChartAnnotation[];
  /** The chart's rows, used to place annotations that name an index value. */
  data: readonly ChartRow[];
  /** The key that names each row in `data`. */
  index: string;
  /** Sets the width of the plot area in px. */
  innerW: number;
  /** Sets the height of the plot area in px. */
  innerH: number;
  /** Value → pixel along the value axis (y for columns and lines, x for horizontal bars). */
  value: (v: number) => number;
  /** Returns the pixel (centre) of a row along the index axis. */
  position: (i: number) => number;
  /** Width of one category band (bar charts): ranges cover whole bands. 0 for line charts. */
  band?: number;
  /** The value axis runs horizontally (horizontal bar charts). */
  horizontal?: boolean;
  /** "back" draws bands and ranges (behind the data); "front" draws lines and events. */
  layer: "back" | "front";
  /** Fade in once the data has drawn. */
  show?: boolean;
  /** Seconds to wait before fading in (after the draw-in). */
  delay?: number;
  /** Skip the fade-in because the person prefers reduced motion. */
  reduced?: boolean;
  /** The series as polylines in plot px: band and line labels move to the corner or side where they cross them least. */
  avoid?: readonly AnnotationObstacle[];
};

/**
 * Draws annotations inside a chart's plot group (already translated to the plot origin).
 *
 * For chart authors. Pass the `annotations`, the chart's `data` and `index`, the plot size (`innerW`, `innerH`), a `value` scale (value to px) and a `position` function (row to px), then render it twice: `layer="back"` for bands and ranges, `layer="front"` for lines and events. Optional: `band`, `horizontal`, `show`, `delay`, `reduced`.
 * Accessibility: the layer is decorative (`aria-hidden`); labels are text in text colours on a surface plate, and event markers are also read out with their data point by the chart's tooltip and announcer. With `reduced` the fade-in is skipped.
 *
 * @example
 * ```tsx
 * import { ChartAnnotationsLayer, type ChartAnnotation } from "@sheenui/theme";
 *
 * const annotations: ChartAnnotation[] = [{ type: "line", value: 50, label: "Target", tone: "success" }];
 * const data = [{ m: "Jan", v: 40 }, { m: "Feb", v: 60 }];
 *
 * export function Example() {
 *   return (
 *     <svg width={300} height={120}>
 *       <g>
 *         <ChartAnnotationsLayer annotations={annotations} data={data} index="m" innerW={300} innerH={120} value={(v) => 120 - v} position={(i) => i * 150 + 75} layer="front" />
 *       </g>
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartAnnotationsLayer({
  annotations,
  data,
  index,
  innerW,
  innerH,
  value,
  position,
  band = 0,
  horizontal = false,
  layer,
  show = true,
  delay = 0,
  reduced = false,
  avoid,
}: ChartAnnotationsLayerProps) {
  if (annotations.length === 0 || innerW <= 0 || innerH <= 0) return null;
  const along = horizontal ? innerH : innerW; // length of the index axis
  const across = horizontal ? innerW : innerH; // length of the value axis
  const clampV = (px: number) => clamp(px, 0, across);
  const items: React.ReactNode[] = [];
  // Event labels take turns between two rows so neighbours never collide.
  const rowEnds = [-Infinity, -Infinity];

  annotations.forEach((a, k) => {
    const c = annotationColors(a.tone);
    if (layer === "back" && a.type === "band") {
      const p0 = clampV(value(a.from));
      const p1 = clampV(value(a.to));
      const lo = Math.min(p0, p1);
      const size = Math.abs(p1 - p0);
      items.push(
        <g key={k}>
          {horizontal ? (
            <rect x={lo} y={0} width={size} height={innerH} fill={c.fill} fillOpacity={0.08} />
          ) : (
            <rect x={0} y={lo} width={innerW} height={size} fill={c.fill} fillOpacity={0.08} />
          )}
          {a.label &&
            size >= 14 &&
            (() => {
              const at = horizontal
                ? { x: lo + 4, y: 10, anchor: "start" as const }
                : leastCrossed(
                    { x: 4, y: lo + 10, anchor: "start" as const },
                    [
                      { x: innerW - 4, y: lo + 10, anchor: "end" as const },
                      { x: 4, y: lo + size - 10, anchor: "start" as const },
                      { x: innerW - 4, y: lo + size - 10, anchor: "end" as const },
                    ],
                    a.label,
                    avoid,
                  );
              return <PlateLabel x={at.x} y={at.y} text={a.label} color={c.text} anchor={at.anchor} />;
            })()}
        </g>,
      );
    } else if (layer === "back" && a.type === "range") {
      let i0 = indexOfKey(data, index, a.from);
      let i1 = indexOfKey(data, index, a.to);
      if (i0 < 0 && i1 < 0) return;
      if (i0 < 0) i0 = 0;
      if (i1 < 0) i1 = data.length - 1;
      if (i1 < i0) [i0, i1] = [i1, i0];
      const half = band > 0 ? band / 2 : 0;
      const start = Math.max(0, position(i0) - half);
      const end = Math.min(along, position(i1) + half);
      const size = Math.max(band > 0 ? 0 : 2, end - start);
      items.push(
        <g key={k}>
          {horizontal ? (
            <rect x={0} y={start} width={innerW} height={size} fill={c.fill} fillOpacity={0.07} />
          ) : (
            <rect x={start} y={0} width={size} height={innerH} fill={c.fill} fillOpacity={0.07} />
          )}
          {a.label && !horizontal && size >= a.label.length * CHAR_W * 0.6 && (
            <PlateLabel x={start + 4} y={10} text={a.label} color={c.text} anchor="start" />
          )}
        </g>,
      );
    } else if (layer === "front" && a.type === "line") {
      if (!Number.isFinite(a.value)) return;
      const p = clampV(value(a.value));
      const dash = a.dashed === false ? undefined : "4 4";
      items.push(
        <g key={k}>
          {horizontal ? (
            <line x1={p} x2={p} y1={0} y2={innerH} stroke={c.stroke} strokeWidth={1.5} strokeDasharray={dash} />
          ) : (
            <line x1={0} x2={innerW} y1={p} y2={p} stroke={c.stroke} strokeWidth={1.5} strokeDasharray={dash} />
          )}
          {a.label &&
            (horizontal ? (
              <PlateLabel x={p + 4} y={8} text={a.label} color={c.text} anchor="start" />
            ) : (
              // Above the line, at the far end (away from the y-axis labels); below it near the top; or at the near end where the data crosses the plate least.
              (() => {
                const up = p - 10 < 8 ? p + 10 : p - 10;
                const down = p + 10 > innerH - 8 ? p - 10 : p + 10;
                const at = leastCrossed(
                  { x: innerW, y: up, anchor: "end" as const },
                  [
                    { x: innerW, y: down, anchor: "end" as const },
                    { x: 4, y: up, anchor: "start" as const },
                    { x: 4, y: down, anchor: "start" as const },
                  ],
                  a.label,
                  avoid,
                );
                return <PlateLabel x={at.x} y={at.y} text={a.label} color={c.text} anchor={at.anchor} />;
              })()
            ))}
        </g>,
      );
    } else if (layer === "front" && a.type === "event") {
      const i = indexOfKey(data, index, a.at);
      if (i < 0) return;
      const p = position(i);
      const w = Math.ceil(a.label.length * CHAR_W) + 10;
      // Label to the right of the marker, flipped left near the end; two rows max.
      const flip = !horizontal && p + 8 + w > innerW;
      const left = flip ? p - 8 - w : p + 8;
      let row = rowEnds.findIndex((end) => left > end + 4);
      const fits = row >= 0;
      if (!fits) row = 0;
      if (fits) rowEnds[row] = left + w;
      const y = 9 + row * (PLATE_H + 3);
      items.push(
        <g key={k}>
          {horizontal ? (
            <line x1={0} x2={innerW} y1={p} y2={p} stroke={c.stroke} strokeWidth={1} strokeDasharray="2 3" />
          ) : (
            <line x1={p} x2={p} y1={0} y2={innerH} stroke={c.stroke} strokeWidth={1} strokeDasharray="2 3" />
          )}
          {/* A small diamond on the axis: the marker itself (works without colour). */}
          <path
            d={
              horizontal
                ? `M0,${p - 5} L5,${p} L0,${p + 5} L-5,${p} Z`
                : `M${p},${innerH - 5} L${p + 5},${innerH} L${p},${innerH + 5} L${p - 5},${innerH} Z`
            }
            fill={c.fill}
            stroke="var(--sheen-chart-surface)"
            strokeWidth={1.5}
          />
          {!horizontal && fits && (
            <PlateLabel x={flip ? p - 8 : p + 8} y={y} text={a.label} color={c.text} anchor={flip ? "end" : "start"} />
          )}
        </g>,
      );
    }
  });

  if (items.length === 0) return null;
  return (
    <motion.g
      data-slot={`chart-annotations-${layer}`}
      pointerEvents="none"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{
        duration: reduced ? duration.fast : duration.slow,
        ease: ease.out,
        delay: show && !reduced ? delay : 0,
      }}
    >
      {items}
    </motion.g>
  );
}
