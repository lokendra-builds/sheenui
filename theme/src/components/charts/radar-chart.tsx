"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useCoarsePointer } from "../../hooks/use-media-query";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, ChartTooltip, type TooltipRow } from "./chart-parts";
import {
  axisFormat,
  changeEase,
  chartFocusClass,
  chartKeyHandler,
  dataSignature,
  enterEase,
  exitTransition,
  formatCompact,
  niceTicks,
  num,
  rowKeys,
  seriesColor,
  clamp,
  TOOLTIP_DOCK_BELOW,
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
import {
  estimateReadoutHeight,
  estimateTooltipHeight,
  estimateTooltipWidth,
  tooltipContainerWidth,
  tooltipNoWrapClass,
  tooltipSide,
} from "./range-area-chart";
import { ChartFigure } from "./chart-figure";
import { ChartPatternDefs, dashFor, patternFill, resolvePatterns } from "./chart-patterns";

/** Every string the chart announces, for translation. */
export type RadarChartLabels = {
  /** Appended to the chart's accessible name. */
  instructions: ChartInstructions;
  /** Shown in the readout band of a narrow chart on a touch screen until an axis is tapped. */
  touchHint: string;
};

/**
 * The built-in English strings of RadarChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultRadarChartLabels: RadarChartLabels = {
  instructions: "Use arrow keys to read each axis.",
  touchHint: "Tap an axis to read its values",
};

/**
 * Props of RadarChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type RadarChartProps = {
  /** One row per axis (spoke), clockwise from the top, e.g. { skill: "Speed", alice: 82, bob: 64 }. 3–10 axes read best. */
  data: readonly ChartRow[];
  /** Key of the axis name in each row. */
  index: string;
  /** The shapes to compare: 1–4 series, each with a fixed `color` slot. */
  series: readonly ChartSeries[];
  /** Value at the outer ring (e.g. 100 for scores). Default: a round number at or above the largest value. */
  max?: number;
  /** "polygon" rings follow the spokes; "circle" rings are round. */
  grid?: "polygon" | "circle";
  /**
   * Largest height (px). When the width is the limit (a narrow card), the chart shrinks to the
   * height its rings and labels need, so there is no empty band above and below the shape.
   */
  height?: number;
  /** Formats values in the tooltip and the ring labels. Values below 0 are drawn at the centre. */
  format?: (n: number) => string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell series apart without colour (hatch fills and dashed outlines; the first series stays solid). Default: on when
   * the chart has more than 3 series.
   *
   * @default true when series.length > 3
   */
  patterns?: boolean;
  /** Override any built-in string (i18n). */
  labels?: Partial<RadarChartLabels>;
  /** Accessible summary of what the chart shows. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const CHAR_W = 6.6; // average glyph width of the 12px axis labels (only used before the font can be measured)
const LINE_H = 14; // line box of the 12px axis labels
const OFFSET = 10; // gap between the outer ring and an axis label
const PAD = 4; // breathing room at the edges of the chart
const MIN_LETTERS = 8; // a name keeps at least this many letters when shortened: past it, thinning reads better

type Measure = (text: string) => number;

let measureContext: CanvasRenderingContext2D | null | undefined;
// Measured widths by font and text, shared by every chart; dropped whenever web fonts finish loading.
let measureCache = new Map<string, number>();
let measureEpoch = 0;

/**
 * Measures axis-label text in the chart's own font family: 12px, at the medium weight of the active name
 * (the widest a name ever gets), so a layout made with it never overflows. `epoch` counts web-font loads:
 * widths measured in an earlier one are forgotten. Falls back to an average glyph width where there is no
 * canvas or font.
 */
function textMeasure(fontFamily: string | null, epoch: number): Measure {
  if (measureContext === undefined) {
    measureContext = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  }
  const context = measureContext;
  if (!context || !fontFamily) return (text) => text.length * CHAR_W;
  if (epoch !== measureEpoch) {
    measureEpoch = epoch;
    measureCache = new Map();
  }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const font = `500 ${rem * 0.75}px ${fontFamily}`;
  return (text) => {
    const key = `${font}\u0000${text}`;
    let w = measureCache.get(key);
    if (w === undefined) {
      context.font = font;
      w = context.measureText(text).width;
      measureCache.set(key, w);
    }
    return w;
  };
}

/** Bumps when web fonts finish loading, so text measured in a fallback font is measured again. */
function useFontEpoch() {
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    if (!fonts) return;
    let alive = true;
    const bump = () => {
      if (alive) setEpoch((e) => e + 1);
    };
    if (fonts.status !== "loaded") void fonts.ready.then(bump);
    fonts.addEventListener("loadingdone", bump);
    return () => {
      alive = false;
      fonts.removeEventListener("loadingdone", bump);
    };
  }, []);
  return epoch;
}

/** The longest start of `line` that fits in `room` px with an ellipsis (at least `min` letters). */
function fitText(line: string, room: number, measure: Measure, min = 4) {
  if (measure(line) <= room) return line;
  let k = line.length - 1;
  while (k > min && measure(`${line.slice(0, k).trimEnd()}…`) > room) k--;
  return `${line.slice(0, Math.max(1, k)).trimEnd()}…`;
}

type AxisLabel = {
  /** One or two lines. */
  lines: string[];
  /** Width of the widest line (px). */
  w: number;
  anchor: "start" | "middle" | "end";
  /** Centre of the label's first line, relative to the chart centre. */
  x: number;
  y: number;
  /** True when the name had to be shortened (the full name goes in a <title>). */
  shortened: boolean;
  shown: boolean;
};

/** Splits a name at the space that balances its two lines best: "Customer satisfaction" → ["Customer", "satisfaction"]. */
function wrapName(name: string): string[] {
  if (name.length < 12 || !name.includes(" ")) return [name];
  let best: string[] = [name];
  let widest = name.length;
  for (let i = name.indexOf(" "); i > 0; i = name.indexOf(" ", i + 1)) {
    const a = name.slice(0, i).trimEnd();
    const b = name.slice(i + 1).trimStart();
    const w = Math.max(a.length, b.length);
    if (a && b && w < widest) {
      best = [a, b];
      widest = w;
    }
  }
  return best;
}

/**
 * Lays out the axis labels around the plot so they never collide and never leave the chart.
 * The radius is as large as the labels allow:
 * 1. A long name that limits the radius wraps onto two lines.
 * 2. If the shape would still be small, only the names that limit the radius are shortened (the
 *    side ones, usually), one at a time and never below MIN_LETTERS letters.
 * 3. If that isn't enough, every other name steps back (and stops limiting the radius); it comes
 *    back, shortened to fit if need be, while its axis is active.
 * 4. Finally, if neighbours still overlap (many axes on a small chart), more names step back.
 * Widths are measured in the chart's font, so a name is only ever shortened when it truly can't fit.
 * Shortened and hidden names still show in full in the tooltip, the readout and the table.
 */
function layoutLabels(names: string[], width: number, plotH: number, measure: Measure) {
  const n = names.length;
  const angles = names.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, n));
  const halfW = width / 2;
  const halfH = plotH / 2;
  const half = Math.min(halfW, halfH);
  // The radius worth shortening names for (a full name beats a few px of radius on a small chart),
  // and the one below which wrapping a long name onto two lines pays.
  const want = clamp(half * 0.45, Math.min(40, half * 0.6), 64);
  const goodR = half * 0.7;

  const longestLine = (lines: string[]) => lines.reduce((m, l) => Math.max(m, l.length), 0);
  const widthOf = (lines: string[]) => lines.reduce((m, l) => Math.max(m, measure(l)), 0);

  /** The largest radius at which label i, as these lines, still fits inside the chart. */
  const limit = (i: number, lines: string[], horizontal = true) => {
    const ac = Math.abs(Math.cos(angles[i] ?? 0));
    const as = Math.abs(Math.sin(angles[i] ?? 0));
    let r = half - PAD;
    if (horizontal) {
      // Side labels run outward from their point; top and bottom labels are centred on it.
      const room = halfW - PAD - (ac < 0.2 ? widthOf(lines) / 2 : widthOf(lines));
      if (room < 0) r = 0;
      else if (ac > 1e-6) r = Math.min(r, room / ac - OFFSET);
    }
    const h = lines.length * LINE_H;
    const room = halfH - (as > 0.2 ? h : h / 2);
    if (room < 0) r = 0;
    else if (as > 1e-6) r = Math.min(r, room / as - OFFSET);
    return Math.max(0, r);
  };
  // A hidden label only needs vertical room (it's shortened to fit the width when it shows).
  const radiusOf = (lines: string[][], shown: boolean[]) =>
    lines.reduce((r, l, i) => Math.min(r, limit(i, l, shown[i])), half - PAD);

  const base = names.map((name, i) => {
    const one = [name];
    const two = wrapName(name);
    return two.length > 1 && limit(i, one) < goodR && limit(i, two) > limit(i, one) + 4 ? two : one;
  });

  /** Shortens the label that limits the radius, then the next, until the shape is big enough. */
  const fit = (shown: boolean[]) => {
    const lines = base.map((l) => [...l]);
    let r = radiusOf(lines, shown);
    for (let guard = 0; r < want && guard < 400; guard++) {
      let k = -1;
      let kr = Infinity;
      lines.forEach((l, i) => {
        const li = limit(i, l, shown[i]);
        if (shown[i] && li < kr) {
          kr = li;
          k = i;
        }
      });
      const len = k < 0 ? 0 : longestLine(itemAt(lines, k));
      // truncate(line, m) keeps m − 1 letters and adds an ellipsis.
      if (k < 0 || kr > r + 0.5 || len <= MIN_LETTERS + 1) break;
      const next = Math.max(MIN_LETTERS + 1, Math.min(len - 1, Math.floor(len * 0.85)));
      const shorter = itemAt(lines, k).map((line) => truncate(line, next));
      // Height-bound labels (top and bottom) don't get any room back from shortening.
      if (limit(k, shorter) <= kr + 0.5) break;
      lines[k] = shorter;
      r = radiusOf(lines, shown);
    }
    return { lines, r };
  };

  let { lines, r } = fit(names.map(() => true));
  let thinned = false;
  // Hiding names is the last resort: only when, even shortened, they'd leave a tiny shape.
  const floor = clamp(half * 0.35, Math.min(32, half * 0.5), 48);
  if (r < floor && n > 4) {
    const alternate = fit(names.map((_, i) => i % 2 === 0));
    if (alternate.r > r + 4) {
      ({ lines, r } = alternate);
      thinned = true;
    }
  }
  const radius = Math.max(r, Math.min(want, 24));

  const boxes = lines.map((ls, i) => {
    const c = Math.cos(angles[i] ?? 0);
    const s = Math.sin(angles[i] ?? 0);
    const ac = Math.abs(c);
    // Every name fits the width left beside its point (a hidden one, too, for when it shows).
    const room = (ac < 0.2 ? 2 : 1) * (halfW - PAD - (radius + OFFSET) * ac);
    const fitted = ls.map((line) => fitText(line, room, measure));
    const px = (radius + OFFSET) * c;
    const py = (radius + OFFSET) * s;
    const w = widthOf(fitted);
    const h = fitted.length * LINE_H;
    const anchor: AxisLabel["anchor"] = c > 0.2 ? "start" : c < -0.2 ? "end" : "middle";
    const left = anchor === "start" ? px : anchor === "end" ? px - w : px - w / 2;
    // Above the ring at the top, below it at the bottom, centred on the spoke at the sides.
    const top = s < -0.2 ? py - h : s > 0.2 ? py : py - h / 2;
    return {
      lines: fitted,
      w,
      anchor,
      x: px,
      y: top + LINE_H / 2,
      shortened: fitted.join(" ") !== names[i],
      left,
      top,
      right: left + w,
      bottom: top + h,
    };
  });

  // Thin the labels until no two shown labels touch (4px of air between them).
  const overlaps = (a: (typeof boxes)[number], b: (typeof boxes)[number]) =>
    a.left < b.right + 4 && b.left < a.right + 4 && a.top < b.bottom + 2 && b.top < a.bottom + 2;
  const clash = (k: number) => {
    const shown = boxes.filter((_, i) => i % k === 0);
    return shown.some((a, i) => shown.some((b, j) => j > i && overlaps(a, b)));
  };
  let every = thinned ? 2 : 1;
  while (every < n && clash(every)) every++;

  const labels: AxisLabel[] = boxes.map((b, i) => ({
    lines: b.lines,
    w: b.right - b.left,
    anchor: b.anchor,
    x: b.x,
    y: b.y,
    shortened: b.shortened,
    shown: i % every === 0,
  }));
  // Vertical extent of rings + every label (hidden ones show while active), so the chart can shrink to fit it.
  const above = boxes.reduce((m, b) => Math.max(m, -b.top), radius);
  const below = boxes.reduce((m, b) => Math.max(m, b.bottom), radius);
  return { angles, radius, labels, above, below };
}

/**
 * A radar (spider) chart: one axis per category, one polygon per series. Use it to compare a few items across the same 5 to 8 measures.
 *
 * Keyboard: Tab focuses the chart; the arrow keys move between axes, Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; keyboard moves announce the axis and each series' value. `RadarTable` is the table view (the same table as `ChartTable`): pass it to `ChartCard table`.
 * Glass and motion: the plot has no backdrop blur; the tooltip is the shared glass surface. Reduced motion draws the polygons in place.
 *
 * @example
 * ```tsx
 * import { RadarChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadarChart
 *       data={[
 *         { skill: "Speed", a: 80, b: 60 },
 *         { skill: "Power", a: 65, b: 85 },
 *         { skill: "Range", a: 70, b: 75 },
 *         { skill: "Armor", a: 50, b: 90 },
 *         { skill: "Stealth", a: 90, b: 40 },
 *       ]}
 *       index="skill"
 *       series={[
 *         { key: "a", label: "Unit A" },
 *         { key: "b", label: "Unit B" },
 *       ]}
 *       aria-label="Unit A and B compared across five skills"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/radar-chart
 */
export function RadarChart({
  data,
  index,
  series,
  max,
  grid = "polygon",
  height = 320,
  format = formatCompact,
  emptyState,
  patterns,
  labels,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<RadarChartProps>) {
  const patternUid = useId();
  const hatched = resolvePatterns(patterns, series.length);
  const t = { ...defaultRadarChartLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  // The chart's own font family, read once the node is in the page (axis labels are measured in it).
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const setRoot = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) setFontFamily(getComputedStyle(element).fontFamily);
      ref(element);
    },
    [ref],
  );
  const rootMerged = useMergedRef(setRoot, outerRef);
  const fontEpoch = useFontEpoch();
  const measured = width > 0;
  // Label widths in the chart's own font, once it is in the page (and again when web fonts load).
  const measure = useMemo(
    () => textMeasure(measured ? fontFamily : null, fontEpoch),
    [measured, fontFamily, fontEpoch],
  );
  const count = data.length;
  const mounted = useHasMounted(width > 0 && count > 0);
  const [active, setActive] = useState<number | null>(null);
  const coarse = useCoarsePointer();

  const keys = useMemo(() => rowKeys(data, index), [data, index]);
  const version = keys.join("\u0001");
  const dataChanged = useDataChanged(`${dataSignature(data, [index, ...series.map((s) => s.key)])}${max ?? ""}`);
  const names = useMemo(() => data.map((row) => String(row[index] ?? "")), [data, index]);

  // Scale: rings at round values from 0 to the top; the outer ring is always the top.
  const { rings, top } = useMemo(() => {
    const largest = data.reduce((m, row) => Math.max(m, ...series.map((s) => num(row[s.key]))), 0);
    const ceiling = max !== undefined && max > 0 ? max : largest;
    const ticks = niceTicks(0, ceiling, 4);
    const top = max !== undefined && max > 0 ? max : (ticks[ticks.length - 1] ?? 1);
    const rings = ticks.filter((tk) => tk > 0 && tk < top - 1e-9);
    rings.push(top);
    return { rings, top };
  }, [data, series, max]);
  const ringFormat = axisFormat(format);

  // Narrow charts on touch screens: the readout docks in a band above the plot, clear of the finger,
  // so it never covers the shapes. The band fits the tallest readout any axis can produce (no jump
  // while the user taps around) and shows a hint until then. Mouse and keyboard get a floating
  // tooltip instead, so a narrow chart on a desktop reserves nothing.
  const docked = coarse && width > 0 && width < TOOLTIP_DOCK_BELOW;
  const band = useMemo(() => {
    if (!docked) return 0;
    const tallest = data.reduce(
      (m, row) =>
        Math.max(
          m,
          estimateReadoutHeight(
            width,
            String(row[index] ?? ""),
            series.map((s) => ({ label: s.label, value: format(num(row[s.key])) })),
          ),
        ),
      0,
    );
    return tallest + 8;
  }, [docked, data, index, series, format, width]);
  const plotTop = PAD + band;
  const plotH = Math.max(0, height - plotTop - PAD);
  const layout = useMemo(() => layoutLabels(names, width, plotH, measure), [names, width, plotH, measure]);
  const { angles, radius: R } = layout;
  const cx = width / 2;
  // Shrink to the content when the width is the limit; centre it when the height is.
  const usedH = Math.min(plotH, Math.ceil(layout.above + layout.below));
  const chartH = width > 0 ? Math.min(height, plotTop + usedH + PAD) : height;
  const cy = plotTop + layout.above + Math.max(0, (Math.min(plotH, chartH - plotTop - PAD) - usedH) / 2);
  const r = (v: number) => (top > 0 ? Math.max(0, Math.min(1, v / top)) * R : 0);
  const at = (i: number, rad: number) =>
    [cx + rad * Math.cos(angles[i] ?? 0), cy + rad * Math.sin(angles[i] ?? 0)] as const;
  const polygon = (radii: number[]) =>
    radii.length
      ? `${radii
          .map((rad, i) => {
            const [px, py] = at(i, rad);
            return `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;
          })
          .join(" ")} Z`
      : "";
  const roundGrid = grid === "circle" || count < 3;

  const shapes = series.map((s, si) => {
    const radii = data.map((row) => r(num(row[s.key])));
    return { s, color: seriesColor(s, si), radii, d: polygon(radii), d0: polygon(radii.map(() => 0)) };
  });

  if (count === 0 || series.length === 0) {
    return (
      <ChartEmpty height={height} aria-label={ariaLabel} className={className}>
        {emptyState}
      </ChartEmpty>
    );
  }

  const act = active !== null && active < count ? active : null;
  const actHidden = act !== null && layout.labels[act]?.shown === false;
  const activeRow = act !== null ? data[act] : undefined;
  const tooltipRows: TooltipRow[] = activeRow
    ? shapes
        .map((sh) => ({
          label: sh.s.label,
          value: format(num(activeRow[sh.s.key])),
          color: sh.color,
          kind: "rect" as const,
          raw: num(activeRow[sh.s.key]),
        }))
        .sort((a, b) => b.raw - a.raw)
    : [];

  // Choreography: rings settle in, then each shape unfolds from the centre, one after another.
  // Under reduced motion every change (geometry, fades, exits) is instant.
  const instant = { duration: 0 };
  const move = reduced || !dataChanged ? instant : { duration: duration.slow, ease: changeEase };
  const fade = reduced ? instant : { duration: duration.base };
  const exit = reduced ? instant : exitTransition;
  const unfold = (si: number) =>
    reduced ? instant : !mounted ? { duration: duration.slower * 1.2, ease: enterEase, delay: 0.12 + si * 0.09 } : move;
  const fill = series.length > 1 ? 0.12 : 0.2;
  // Ring values print along the top spoke; on a small chart only every other one.
  const ringGap = rings.length > 1 ? r(rings[1] ?? 0) - r(rings[0] ?? 0) : R;
  const ringLabelEvery = ringGap < 16 ? 2 : 1;

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    const dx = event.clientX - box.left - cx;
    const dy = event.clientY - box.top - cy;
    // Nearest spoke by angle: clockwise from the top.
    const turn = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    setActive(Math.round(turn / ((Math.PI * 2) / count)) % count);
  }

  const title = activeRow ? String(activeRow[index] ?? "") : "";

  // Names drawn right now: shown ones, plus a thinned-out active one (its neighbours step aside).
  const yieldsTo = (i: number) => actHidden && (Math.abs(i - act) === 1 || Math.abs(i - act) === count - 1);
  const drawn = (i: number) => act === i || (layout.labels[i]?.shown === true && !yieldsTo(i));

  // Otherwise the tooltip floats as close to the active axis' name as it can without covering that
  // name or the dots being read, inside the chart, preferring spots that cover no other name.
  const tip = (() => {
    const label = act !== null ? layout.labels[act] : undefined;
    if (act === null || !label || docked) return null;
    const tw = estimateTooltipWidth(title, tooltipRows);
    const th = estimateTooltipHeight(tooltipRows.length);
    const [px, py] = at(act, R);
    // A chart smaller than the tooltip: open from the spoke's tip towards the roomier side.
    const fallback = {
      x: px,
      y: chartH >= th ? clamp(py, th / 2, chartH - th / 2) : chartH / 2,
      side: tooltipSide(px, tw, width),
    };
    if (width < tw || chartH < th) return fallback;

    type Box = readonly [number, number, number, number];
    const boxOf = (l: AxisLabel): Box => {
      const left = cx + l.x - (l.anchor === "end" ? l.w : l.anchor === "middle" ? l.w / 2 : 0);
      const top = cy + l.y - LINE_H / 2;
      return [left, top, left + l.w, top + l.lines.length * LINE_H];
    };
    const area = (a: Box, b: Box) =>
      Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) *
      Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    const gap = (a: Box, b: Box) =>
      Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]));
    const own = boxOf(label);
    const keepOut: Box = [own[0] - 4, own[1] - 4, own[2] + 4, own[3] + 4];
    // The ringed dots being read are off limits too.
    const dots = shapes.map((sh) => at(act, sh.radii[act] ?? 0));
    const marks: Box = [
      Math.min(...dots.map((d) => d[0])) - 8,
      Math.min(...dots.map((d) => d[1])) - 8,
      Math.max(...dots.map((d) => d[0])) + 8,
      Math.max(...dots.map((d) => d[1])) + 8,
    ];
    // Other names (with 3px of air, so "just touching" counts as covering).
    const others = layout.labels.flatMap((l, i) => {
      if (i === act || !drawn(i)) return [];
      const b = boxOf(l);
      return [[b[0] - 3, b[1] - 3, b[2] + 3, b[3] + 3] as const];
    });
    // The shapes themselves: covering them hides the comparison, so it costs a little too.
    const plot: Box = [cx - R, cy - R, cx + R, cy + R];
    const ox = (own[0] + own[2]) / 2;
    const oy = (own[1] + own[3]) / 2;
    // Every position on a 6px grid (plus the far edges). Cost: the gap to the name, the area of other
    // names it covers (a px² of a hidden name costs as much as moving 2.5px further away, so even a
    // sliver sends it to clear space when there is some nearby), the area of the plot it covers,
    // and a hair for distance from the name's centre to break ties.
    const steps = (span: number) => [...Array.from({ length: Math.floor(span / 6) + 1 }, (_, k) => k * 6), span];
    let best: [number, number] | null = null;
    let bestCost = Infinity;
    for (const left of steps(width - tw)) {
      for (const top of steps(chartH - th)) {
        const box: Box = [left, top, left + tw, top + th];
        if (area(box, keepOut) > 0 || area(box, marks) > 0) continue;
        const cover = others.reduce((sum, o) => sum + area(box, o), 0);
        const cost =
          gap(box, own) +
          2.5 * cover +
          0.01 * area(box, plot) +
          0.05 * Math.hypot(left + tw / 2 - ox, top + th / 2 - oy);
        if (cost < bestCost) {
          best = [left, top];
          bestCost = cost;
        }
      }
    }
    // ChartTooltip sits 14px right of its anchor (forced open to the right) and centres on y.
    return best ? { x: best[0] - 14, y: best[1] + th / 2, side: "right" as const } : fallback;
  })();

  return (
    <div {...rest} ref={rootMerged} className={cn("relative w-full", className)} style={{ height: chartH }}>
      {width > 0 && (
        <ChartFigure
          as="svg"
          width={width}
          height={chartH}
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          tabIndex={0}
          onKeyDown={chartKeyHandler(count, act, setActive)}
          onBlur={() => setActive(null)}
          className={cn("overflow-visible rounded-sheen-sm touch-pan-y touch-pinch-zoom", chartFocusClass)}
        >
          {/* Visual only: values reach assistive tech through the arrow keys + announcer, and the table view. */}
          <g aria-hidden>
            {/* Rings: hairline, solid, recessive. */}
            <AnimatePresence initial={false}>
              {rings.map((tk) =>
                roundGrid ? (
                  <motion.circle
                    key={`c-${tk}`}
                    cx={cx}
                    cy={cy}
                    fill="none"
                    stroke={tk === top ? "var(--sheen-border)" : "var(--sheen-chart-grid)"}
                    initial={reduced ? false : { opacity: 0, r: r(tk) }}
                    animate={{ opacity: 1, r: r(tk) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ r: move, opacity: fade }}
                  />
                ) : (
                  <motion.path
                    key={`p-${tk}`}
                    fill="none"
                    stroke={tk === top ? "var(--sheen-border)" : "var(--sheen-chart-grid)"}
                    strokeLinejoin="round"
                    initial={reduced ? false : { opacity: 0, d: polygon(names.map(() => r(tk))) }}
                    animate={{ opacity: 1, d: polygon(names.map(() => r(tk))) }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ d: move, opacity: fade }}
                  />
                ),
              )}
            </AnimatePresence>

            {/* Spokes; the active one darkens. */}
            {names.map((_, i) => {
              const [px, py] = at(i, R);
              return (
                <line
                  key={`s-${keys[i]}`}
                  x1={cx}
                  y1={cy}
                  x2={px}
                  y2={py}
                  stroke={act === i ? "var(--sheen-fg-subtle)" : "var(--sheen-chart-grid)"}
                />
              );
            })}

            {hatched && (
              <ChartPatternDefs
                id={patternUid}
                entries={series.map((s, i) => ({ index: i, color: seriesColor(s, i) }))}
              />
            )}

            {/* Shapes: a soft wash and a 2px outline. They share one structure, so values morph. */}
            <g className="forced-color-adjust-none">
              <AnimatePresence>
                {shapes.map((sh, si) => (
                  <motion.path
                    key={`${sh.s.key}-${version}`}
                    fill={patternFill(hatched, patternUid, si, sh.color)}
                    fillOpacity={hatched && si > 0 ? Math.max(fill, 0.4) : fill}
                    stroke={sh.color}
                    strokeDasharray={dashFor(hatched, si)}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    initial={reduced ? { d: sh.d, opacity: 1 } : { d: sh.d0, opacity: 1 }}
                    animate={{ d: sh.d, opacity: 1 }}
                    exit={{ opacity: 0, transition: exit }}
                    transition={{ d: unfold(si), opacity: reduced ? instant : { duration: duration.fast } }}
                  />
                ))}
              </AnimatePresence>
              {/* A shape with every value at zero collapses to the centre: mark it with a dot so it isn't lost. */}
              {count >= 3 &&
                shapes
                  .filter((sh) => sh.radii.every((rad) => rad < 0.5))
                  .map((sh) => (
                    <circle
                      key={`z-${sh.s.key}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={sh.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                    />
                  ))}
              {/* Fewer than 3 axes make no area: mark each value with a dot. */}
              {count < 3 &&
                shapes.flatMap((sh) =>
                  sh.radii.map((rad, i) => {
                    const [px, py] = at(i, rad);
                    return (
                      <circle
                        key={`${sh.s.key}-${i}`}
                        cx={px}
                        cy={py}
                        r={4}
                        fill={sh.color}
                        stroke="var(--sheen-chart-surface)"
                        strokeWidth={2}
                      />
                    );
                  }),
                )}
            </g>

            {/* Ring values along the top spoke, haloed so they stay legible over the shapes. */}
            {rings.map((tk, i) =>
              (rings.length - 1 - i) % ringLabelEvery === 0 ? (
                <text
                  key={`v-${tk}`}
                  x={cx + 5}
                  y={cy - r(tk)}
                  dy="0.32em"
                  stroke="var(--sheen-chart-surface)"
                  strokeWidth={5}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  className="fill-sheen-fg-muted text-2xs tabular-nums"
                >
                  {ringFormat(tk)}
                </text>
              ) : null,
            )}

            {/* Axis names, laid out so they never collide. The active one is emphasised; a thinned-out
                name appears while its axis is active, and its shown neighbours step aside for it. */}
            {layout.labels.map((label, i) => {
              if (!drawn(i)) return null;
              return (
                <text
                  key={`n-${keys[i]}`}
                  textAnchor={label.anchor}
                  className={cn("text-xs", act === i ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted")}
                >
                  {label.shortened && <title>{names[i]}</title>}
                  {label.lines.map((line, k) => (
                    <tspan key={k} x={cx + label.x} y={cy + label.y + k * LINE_H} dy="0.32em">
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}

            {/* Active axis: a ringed dot where each shape crosses it. */}
            {act !== null && (
              <g pointerEvents="none" className="forced-color-adjust-none">
                {shapes.map((sh, i) => {
                  const [px, py] = at(act, sh.radii[act] ?? 0);
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r={4.5}
                      fill={sh.color}
                      stroke="var(--sheen-chart-surface)"
                      strokeWidth={2}
                    />
                  );
                })}
              </g>
            )}

            {/* Hit area: the whole chart; the pointer picks the nearest spoke by angle. Taps work on touch. */}
            <rect
              y={plotTop}
              width={width}
              height={Math.max(0, chartH - plotTop - PAD)}
              fill="transparent"
              style={{ touchAction: "pan-y pinch-zoom" }}
              onPointerDown={onPointer}
              onPointerMove={onPointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </g>
        </ChartFigure>
      )}

      {docked && !activeRow && (
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center rounded-sheen-md border border-dashed border-sheen-border px-3 text-center text-2xs text-sheen-fg-muted"
          style={{ height: Math.max(0, band - 8) }}
        >
          {t.touchHint}
        </p>
      )}
      {activeRow &&
        (docked ? (
          <ChartTooltip title={title} rows={tooltipRows} x={0} y={0} containerWidth={width} docked />
        ) : (
          tip && (
            <div className={tooltipNoWrapClass}>
              <ChartTooltip
                title={title}
                rows={tooltipRows}
                x={tip.x}
                y={tip.y}
                containerWidth={tooltipContainerWidth(tip.side)}
              />
            </div>
          )
        ))}
      <ChartAnnouncer
        text={
          activeRow ? `${activeRow[index]}: ${tooltipRows.map((row) => `${row.label} ${row.value}`).join(", ")}` : ""
        }
      />
    </div>
  );
}
