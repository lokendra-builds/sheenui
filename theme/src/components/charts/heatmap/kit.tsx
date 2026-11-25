"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
} from "react";
import { motion } from "motion/react";

import { cn } from "../../../lib/cn";
import { duration, ease } from "../../../motion/tokens";
import { usePrefersDark } from "../../../hooks/use-media-query";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import {
  clamp,
  enterEase,
  formatCompact,
  slotColor,
  type ChartColor,
  type ChartRow,
  type ChartInstructions,
} from "../chart-utils";
export {
  useEntrance,
  placeChartTip,
  ChartTip,
  ChartValueTable,
  type ChartTipAnchor,
  type ChartTipSide,
  type ChartTipProps,
  type ChartValueTableColumn,
  type ChartValueTableProps,
} from "../chart-tip";

/* ======================================================================
 * Shared helpers for the heatmap, calendar heatmap, funnel, treemap,
 * waterfall and bar list: ramps, ink on fills, number formats, the
 * measured tooltip, scroll fades, the scale legend and value tables.
 * ====================================================================== */

/** Share of the hue in the lightest step of a sequential ramp (0 would be the bare surface). */
export const RAMP_FLOOR = 0.08;

/**
 * A palette hue mixed into a base colour in OKLab. `share` 1 is the pure slot colour.
 * The default base is the chart surface, so the same call gives the right step in both themes.
 */
export function hueMix(color: ChartColor, share: number, base = "var(--sheen-chart-surface)") {
  const pct = clamp(Number.isFinite(share) ? share : 0, 0, 1) * 100;
  return `color-mix(in oklab, ${slotColor(color)} ${pct.toFixed(1)}%, ${base})`;
}

/**
 * One step of a single-hue sequential ramp: `t` = 0 sits just off the chart surface, 1 is the
 * full palette hue. Light → dark on the light theme; on the dark theme low values recede into the
 * surface and high values glow, which is the dark-mode reading of "more".
 */
export function sequentialColor(t: number, color: ChartColor = 1, floor = RAMP_FLOOR) {
  return hueMix(color, floor + (1 - floor) * clamp(Number.isFinite(t) ? t : 0, 0, 1));
}

/** Position of `value` on a [min, max] scale, optionally snapped to `steps` classes (0–1). */
export function scalePosition(value: number, min: number, max: number, steps = 0) {
  let t = max === min ? (max === 0 ? 0 : 0.5) : clamp((value - min) / (max - min), 0, 1);
  if (steps >= 2) t = Math.min(steps - 1, Math.floor(t * steps)) / (steps - 1);
  return t;
}

/* ---------- Number formats (one locale for counts and percentages) ---------- */

/**
 * Number formatters for one locale (compact numbers and percentages), as the heatmap-family charts use
 * them.
 */
export type ChartNumberFormat = {
  /** 1,284 · 12.9K · −640: full numbers below 10,000, compact above (like formatCompact). */
  compact: (n: number) => string;
  /** 0.412 → 41.2%; non-finite ratios read "–". */
  percent: (ratio: number) => string;
};

/** A cache of number formatters by locale and options. @internal */
export const numberFormats = new Map<string, ChartNumberFormat>();

/**
 * The default number formatters of the charts, both in one locale (default "en", like
 * formatCompact), so a German reader never sees "21.9K" next to "45,4 %". Cached per locale.
 */
export function chartNumberFormat(locale = "en"): ChartNumberFormat {
  let f = numberFormats.get(locale);
  if (f) return f;
  let full: Intl.NumberFormat;
  let compact: Intl.NumberFormat;
  let percent: Intl.NumberFormat;
  try {
    full = new Intl.NumberFormat(locale);
    compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
    percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  } catch {
    // An invalid locale tag: fall back to the library default.
    if (locale !== "en") return chartNumberFormat("en");
    return { compact: formatCompact, percent: (r) => (Number.isFinite(r) ? `${Math.round(r * 1000) / 10}%` : "–") };
  }
  // Typographic minus (U+2212): the same width as "+", read as "minus" by screen readers.
  const minus = (s: string) => s.replace("-", "−");
  f = {
    compact: (n) =>
      Number.isFinite(n) ? minus(Math.abs(n) < 10_000 ? full.format(Math.round(n * 10) / 10) : compact.format(n)) : "–",
    percent: (ratio) => (Number.isFinite(ratio) ? minus(percent.format(ratio)) : "–"),
  };
  numberFormats.set(locale, f);
  return f;
}

/** 0.412 → "41.2%" (in "en", matching formatCompact); non-finite ratios read "–". */
export const formatPercent = (ratio: number) => chartNumberFormat("en").percent(ratio);

/** The count formatter a chart uses: its `format`, else formatCompact in its `locale`. */
export function defaultCompact(locale: string | undefined) {
  return locale ? chartNumberFormat(locale).compact : formatCompact;
}

/** The percent formatter a chart uses: its `formatPercent`, else percentages in its `locale`. */
export function defaultPercent(locale: string | undefined) {
  return locale ? chartNumberFormat(locale).percent : formatPercent;
}

/* ---------- Ink on fills ---------- */

/** Ink for text drawn inside a coloured fill: "light" (white) or "dark" (black). */
export type Ink = "light" | "dark";

let inkCanvas: CanvasRenderingContext2D | null | undefined;

/** sRGB bytes of any CSS colour string (oklab(), color-mix results...), via a 1px canvas. */
export function rgbaOf(color: string): [number, number, number, number] | null {
  if (inkCanvas === undefined) {
    const canvas = typeof document === "undefined" ? null : document.createElement("canvas");
    if (canvas) canvas.width = canvas.height = 1;
    inkCanvas = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;
  }
  const ctx = inkCanvas;
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "transparent";
  ctx.fillStyle = color; // ignored when unparsable: the pixel then stays transparent
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 0 ? null : [r, g, b, a];
}

/** The WCAG relative luminance of an RGBA colour. @internal */
export function relativeLuminance([r, g, b]: [number, number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The resolved ink per fill string for one theme state: repainting hundreds of cells never asks the browser twice. */
export const inkCache = new Map<string, Ink>();
let inkCacheTheme = "";
/** A string that changes whenever the theme does, so cached colours refresh. @internal */
export function themeSignature(osDark: boolean) {
  const root = document.documentElement;
  return `${root.dataset.theme ?? ""}|${root.dataset.sheenStyle ?? ""}|${root.className}|${root.getAttribute("style") ?? ""}|${osDark}`;
}

/**
 * Picks black or white text for each fill: whichever contrasts more, which is never below
 * 4.58:1 for any opaque colour. Fills are resolved by the browser (CSS variables, light-dark(),
 * color-mix()), so it follows theme overrides; it re-checks when the theme changes.
 * The returned function only changes identity when the inks do.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useContrastInk } from "./kit";
 *
 * const fills = ["var(--sheen-chart-1)", "var(--sheen-chart-2)"];
 *
 * export function Example() {
 *   const gridRef = useRef<HTMLDivElement>(null);
 *   const inkFor = useContrastInk(gridRef, fills);
 *   return <div ref={gridRef}>{String(inkFor(fills[0] ?? ""))}</div>;
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function useContrastInk(ref: RefObject<HTMLElement | null>, fills: readonly string[]) {
  const key = Array.from(new Set(fills)).join("\u0001");
  const [scheme, setScheme] = useState(0);
  const [inks, setInks] = useState<ReadonlyMap<string, Ink>>(() => new Map());

  useEffect(() => {
    const bump = () => setScheme((n) => n + 1);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-sheen-style", "class", "style"],
    });
    return () => observer.disconnect();
  }, []);
  const osDark = usePrefersDark();

  // Passive: the server HTML (and the first client paint) already use the default ink; resolving
  // the fills here forces a style recalculation of the whole new subtree, which a layout effect
  // would do inside the commit, before the first paint of the chart.
  useEffect(() => {
    const host = ref.current;
    if (!host || !key) return;
    const theme = themeSignature(osDark);
    if (theme !== inkCacheTheme) {
      inkCache.clear();
      inkCacheTheme = theme;
    }
    const fills = key.split("\u0001");
    const next = new Map<string, Ink>();
    const missing = fills.filter((f) => !inkCache.has(f));
    if (missing.length > 0) {
      const probe = document.createElement("span");
      probe.style.display = "none";
      // Read the real fill, not the system colour High Contrast would force onto the probe.
      probe.style.forcedColorAdjust = "none";
      host.appendChild(probe);
      for (const fill of missing) {
        probe.style.color = "";
        probe.style.color = fill;
        const rgba = rgbaOf(getComputedStyle(probe).color);
        // Black wins from relative luminance 0.179 up: (L + 0.05)² = 0.05 × 1.05.
        inkCache.set(fill, rgba && relativeLuminance(rgba) < 0.179 ? "light" : "dark");
      }
      probe.remove();
    }
    for (const fill of fills) next.set(fill, inkCache.get(fill) ?? "dark");
    setInks((prev) => (prev.size === next.size && [...next].every(([k, v]) => prev.get(k) === v) ? prev : next));
  }, [ref, key, scheme, osDark]);

  return useCallback((fill: string): Ink => inks.get(fill) ?? "dark", [inks]);
}

/* ---------- Motion helpers ---------- */

/**
 * The first-view entrance of many small marks (heatmap cells, calendar days): one Web Animation
 * per mark (opacity + scale, compositor-friendly), started before the first visible paint, with
 * each mark's delay read from its `data-delay` attribute (seconds). No per-mark React state, so
 * hundreds of cells cost almost nothing; later data changes are left to a single layer fade.
 * Nothing runs with reduced motion, and switching it on mid-way finishes the animations.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useMarksEntrance } from "./kit";
 *
 * export function Example({ play, reducedMotion }: { play: boolean; reducedMotion: boolean }) {
 *   const layerRef = useRef<SVGGElement>(null);
 *   useMarksEntrance(layerRef, play, reducedMotion);
 *   return <svg aria-hidden><g ref={layerRef} /></svg>;
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function useMarksEntrance(layerRef: RefObject<SVGGElement | null>, play: boolean, reduced: boolean, from = 0.6) {
  const done = useRef(false);
  const running = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    if (!play || done.current) return;
    const layer = layerRef.current;
    if (!layer) return;
    done.current = true;
    if (reduced || typeof layer.animate !== "function") return;
    const easing = `cubic-bezier(${ease.out.join(",")})`;
    running.current = Array.from(layer.querySelectorAll<SVGElement>("[data-delay]"), (el) =>
      el.animate(
        [
          { opacity: 0, transform: `scale(${from})` },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: duration.slow * 1000,
          delay: Number(el.dataset.delay ?? 0) * 1000,
          easing,
          fill: "backwards",
        },
      ),
    );
  }, [play, layerRef, reduced, from]);
  useEffect(() => {
    if (!reduced) return;
    for (const a of running.current) a.finish();
    running.current = [];
  }, [reduced]);
}

/* ---------- Tooltip that measures itself ---------- */

/**
 * Muted hint in the band a narrow chart reserves for its docked readout, shown while nothing is
 * being read, so the band is never just empty space. Decorative: the chart's accessible name
 * carries the real instructions.
 *
 * @example
 * ```tsx
 * import { ChartDockHint } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartDockHint>Tap a cell to read it</ChartDockHint>
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function ChartDockHint({ children }: { children: ReactNode }) {
  return (
    <p
      aria-hidden
      data-slot="chart-dock-hint"
      className="pointer-events-none absolute inset-x-0 top-0 flex h-7.5 items-center gap-1.5 px-1 text-xs text-sheen-fg-muted"
    >
      <svg aria-hidden width={14} height={14} viewBox="0 0 16 16" className="shrink-0 text-sheen-fg-subtle">
        <path
          d="M6.5 8.5V3.25a1.25 1.25 0 0 1 2.5 0V7.5l3.1.6a1.5 1.5 0 0 1 1.2 1.7l-.6 3.4a1.5 1.5 0 0 1-1.5 1.3H8.1a1.5 1.5 0 0 1-1.2-.6L4.3 10.6a1.1 1.1 0 0 1 1.6-1.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
      </svg>
      <span className="truncate">{children}</span>
    </p>
  );
}

/* ---------- Sideways scroller with a sticky label column ---------- */

/**
 * Soft edge fades for a sideways scroller whose first `offset` px are a sticky label column.
 * The mask goes on the scrolling content (`targetRef`), not the scroller, so the labels and the
 * scroller's own focus ring stay crisp; the part of the content that slides under the sticky
 * labels is masked out too, so the labels need no background of their own. Updated on scroll
 * and resize without re-rendering the chart. `remeasure` is any number that changes when the
 * content's width does (the grid width): the observers are re-attached when it changes.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useScrollFade } from "./kit";
 *
 * export function Example() {
 *   const scrollRef = useRef<HTMLDivElement>(null);
 *
 *   const gridRef = useRef<SVGSVGElement>(null);
 *
 *   useScrollFade(scrollRef, gridRef, 56);
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function useScrollFade(
  scrollRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<SVGSVGElement | HTMLElement | null>,
  offset: number,
  remeasure = 0,
  size = 20,
) {
  // A passive effect: the ResizeObserver below delivers the first update after layout, in the
  // same frame, so mounting a wide grid no longer forces a layout of the whole new subtree.
  useEffect(() => {
    const scroller = scrollRef.current;
    const target = targetRef.current;
    if (!scroller || !target) return;
    const update = () => {
      const s = scroller.scrollLeft;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const start = s > 1;
      const end = s < max - 1;
      const style = target.style;
      if (!start && !end) {
        style.maskImage = "";
        style.setProperty("-webkit-mask-image", "");
        return;
      }
      const view = scroller.clientWidth - offset;
      const mask =
        `linear-gradient(to right, transparent ${s}px, black ${s + (start ? size : 0)}px, ` +
        `black ${s + view - (end ? size : 0)}px, transparent ${s + view}px)`;
      style.maskImage = mask;
      style.setProperty("-webkit-mask-image", mask);
    };
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(target);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [scrollRef, targetRef, offset, remeasure, size]);
}

/* ---------- Sequential scale legend ---------- */

/**
 * Props of SequentialLegend: the min and max of the scale, the colour slot, classes or swatches, and
 * captions.
 */
export type SequentialLegendProps = {
  /** Lowest and highest value of the scale. */
  min: number;
  /** The highest value of the scale, at the right end of the ramp. */
  max: number;
  /** The chart color slot (1 to 8) the ramp fades toward. */
  color?: ChartColor;
  /** Number of classes; 0 draws a continuous ramp. */
  steps?: number;
  /** Formats the min and max shown at the ends of the ramp. */
  format?: (n: number) => string;
  /** Shows a caption before the ramp, e.g. "Sessions". */
  label?: ReactNode;
  /** Text at the low / high end instead of the formatted min / max (e.g. "Less" / "More"). */
  lowLabel?: ReactNode;
  /** Text at the high end instead of the formatted max (for example "More"). */
  highLabel?: ReactNode;
  /** Position (0–1) of the value being read, drawn as a marker on the ramp. */
  marker?: number | null;
  /** Explicit swatch colours (e.g. a calendar's levels) instead of `steps` of `color`. */
  swatches?: readonly string[];
  /**
   * Share of the hue in the lightest step (nearly the surface). A map raises it so data reads against its no-data land.
   * @default 0.08
   */
  floor?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * The key to a sequential colour scale: a ramp (or classed swatches) between its end values.
 * Decorative for assistive tech, which reads exact values through the chart's announcer and table.
 *
 * @example
 * ```tsx
 * import { SequentialLegend } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SequentialLegend min={0} max={120} color={2} steps={5} label="Sessions" />
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function SequentialLegend({
  min,
  max,
  color = 1,
  steps = 0,
  format = formatCompact,
  label,
  lowLabel,
  highLabel,
  marker = null,
  swatches,
  floor,
  className,
  style,
}: SequentialLegendProps) {
  const id = useId();
  const reduced = useSheenReducedMotion();
  const W = swatches ? swatches.length * 12 + (swatches.length - 1) * 2 : 128;
  const H = 10;
  const classes =
    swatches ??
    (steps >= 2 ? Array.from({ length: steps }, (_, i) => sequentialColor(i / (steps - 1), color, floor)) : null);
  const cell = classes ? (W - (classes.length - 1) * 2) / classes.length : 0;

  return (
    <div
      aria-hidden
      data-slot="sequential-legend"
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-sheen-fg-muted", className)}
      style={style}
    >
      {label && <span className="me-1 font-medium text-sheen-fg-muted">{label}</span>}
      <span className="tabular-nums">{lowLabel ?? format(min)}</span>
      <svg
        width={W}
        height={H + 6}
        viewBox={`0 -6 ${W} ${H + 6}`}
        className="shrink-0 overflow-visible forced-color-adjust-none"
      >
        {classes ? (
          classes.map((fill, i) => (
            <rect
              key={i}
              x={i * (cell + 2)}
              y={0}
              width={cell}
              height={H}
              rx={2}
              style={{ fill }}
              className="forced-colors:stroke-[CanvasText]"
            />
          ))
        ) : (
          <>
            <defs>
              <linearGradient id={`${id}-ramp`} x1="0" x2="1" y1="0" y2="0">
                {/* Several stops so the SVG (sRGB) gradient follows the OKLab ramp closely. */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <stop key={t} offset={t} style={{ stopColor: sequentialColor(t, color, floor) }} />
                ))}
              </linearGradient>
            </defs>
            <rect width={W} height={H} rx={3} fill={`url(#${id}-ramp)`} className="forced-colors:stroke-[CanvasText]" />
          </>
        )}
        {marker !== null && Number.isFinite(marker) && (
          <motion.path
            d="M-4,-6 L4,-6 L0,-1 Z"
            className="fill-sheen-fg forced-colors:fill-[CanvasText]"
            initial={false}
            animate={{ x: classes ? clamp(marker, 0, 1) * (W - cell) + cell / 2 : clamp(marker, 0, 1) * W }}
            transition={reduced ? { duration: 0 } : { duration: duration.fast, ease: enterEase }}
          />
        )}
      </svg>
      <span className="tabular-nums">{highLabel ?? format(max)}</span>
    </div>
  );
}

/* ---------- Value table (the colour-free twin of a chart) ---------- */

/**
 * A table cell without a value: a dash, read as `label` ("No data", "Not applicable"...).
 *
 * @example
 * ```tsx
 * import { MissingValue } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <td><MissingValue label="Not applicable" /></td>
 *   );
 * }
 * ```
 *
 * @see /charts/heatmap
 */
export function MissingValue({
  label,
  labels,
}: {
  /** Text shown and announced for this cell, e.g. "Not applicable". Default: `labels.noData`. */
  label?: string;
  /** Overrides for the built-in English string (`noData`). Merged over {@link defaultHeatmapLabels}. */
  labels?: Partial<Pick<HeatmapLabels, "noData">>;
}) {
  const text = label ?? labels?.noData ?? defaultHeatmapLabels.noData;
  return (
    <>
      <span aria-hidden data-slot="missing-value" className="text-sheen-fg-subtle">
        –
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

/* ======================================================================
 * Heatmap
 * ====================================================================== */

/** A column of a Heatmap: the key of its value in each data row and its display label. */
export type HeatmapColumn = { key: string; label: string };

/**
 * A cell as passed to `onCellClick`. `row` is the row's `index` value and `column` is the column's
 * `key` (the data keys, stable under translation); `columnLabel` is the column's display label.
 */
export type HeatmapCell = { row: string; column: string; columnLabel: string; value: number | null };

/**
 * Every string Heatmap speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type HeatmapLabels = {
  /** Appended to the accessible name: how to read the cells. */
  instructions: ChartInstructions;
  /** Tooltip / announcement for a cell without a value. */
  noData: string;
  /** Role description announced for the chart. */
  roleDescription: string;
  /** Shown in the readout band of a narrow heatmap while no cell is being read. */
  hint: string;
};

/**
 * The built-in English strings of Heatmap; spread it into your own `labels` and change what you need.
 * This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultHeatmapLabels: HeatmapLabels = {
  instructions: "Use the arrow keys to move between cells; Home and End jump along a row.",
  noData: "No data",
  roleDescription: "heatmap",
  hint: "Tap or hover a cell for its value",
};

/**
 * Props of Heatmap. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type HeatmapProps = {
  /** One object per row, e.g. { day: "Mon", h0: 12, h1: 4, ... }. */
  data: readonly ChartRow[];
  /** Key of the row label in each object. */
  index: string;
  /** The columns, in order: the key of each value and its label. */
  columns: readonly HeatmapColumn[];
  /** Hue of the sequential ramp: a palette slot, 1–8. */
  color?: ChartColor;
  /** The [min, max] the color scale spans; values outside it take the end colors. Default: 0 (or the minimum, if negative) to the maximum. */
  domain?: [number, number];
  /** Classes on the scale (e.g. 5); 0 = continuous. */
  steps?: number;
  /** Print each value inside its cell when it fits. */
  showValues?: boolean;
  /** Sets the row height in px. Default follows the cell width (24–40). */
  cellHeight?: number;
  /** Narrowest a column may get before the grid scrolls sideways inside its own container. */
  minCellWidth?: number;
  /** Formats a cell value for the tooltips, legend and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Show the scale legend under the grid. */
  legend?: boolean;
  /** Sets the caption for the legend, e.g. "Sessions". */
  legendLabel?: ReactNode;
  /** Called with `{ row, column, columnLabel, value }` on click, Enter or Space: `row` is the row's `index` value, `column` the column's `key`, `columnLabel` its display label. */
  onCellClick?: (cell: HeatmapCell) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Overrides for the heatmap's built-in English strings. */
  labels?: Partial<HeatmapLabels>;
  /** Accessible name of the chart; describe what it shows. */
  "aria-label": string;
  className?: string;
};

/** The glyph width used to size the row labels, in pixels. @internal */
export const ROW_LABEL_CHAR = 7.2; // generous glyph width of the 12px labels (capitals and digits run wide)
/** The glyph width used to fit in-cell values, in pixels. @internal */
export const VALUE_CHAR = 7.2; // the same for the medium-weight, tabular in-cell values
/** The height of the column label band, in pixels. @internal */
export const COL_LABEL_H = 22;
/** The gap between cells, in pixels. @internal */
export const GAP = 2;

/** A value as a finite number, or null when it is missing (so it never reads as 0). */
export function valueOrNull(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
