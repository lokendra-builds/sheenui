"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { followPointer, seriesColor, type ChartSeries } from "../chart-utils";
import { ChartPatternDefs, patternFill, resolvePatterns } from "../chart-patterns";
import { EMPTY_SET } from "./state";

/* ---------- Legend ---------- */

/**
 * One entry of a ChartLegend: label, colour, key shape, an optional value and the series key it
 * toggles.
 */
export type LegendItem = {
  label: string;
  color: string;
  kind?: "line" | "rect";
  value?: ReactNode;
  /** The series key this item stands for. Needed for an interactive (toggle) legend. */
  key?: string;
  /** Draw the key dashed (a previous-period comparison series). */
  dashed?: boolean;
  /** Hatch pattern index (1 to 8, series position) drawn in the swatch, to match a chart's `patterns`. 0 or unset is solid. */
  pattern?: number;
};

/** Translatable announcements of a ChartLegend (the `labels` prop takes a `Partial` of it). */
export type ChartLegendLabels = {
  /** Name of the legend group when it is interactive. */
  legend: string;
  /** Announced after a series is shown / hidden. */
  shown: (label: string) => string;
  hidden: (label: string) => string;
};

/**
 * The built-in English strings of ChartLegend; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultChartLegendLabels: ChartLegendLabels = {
  legend: "Series: press to show or hide",
  shown: (label) => `${label} shown`,
  hidden: (label) => `${label} hidden`,
};

/**
 * Props of ChartLegend: the items, which keys are hidden, the toggle and highlight handlers, `labels`
 * and `className`.
 */
export type ChartLegendProps = {
  /** The legend keys: one per series, with its label, color and key shape. */
  items: readonly LegendItem[];
  className?: string;
  /** Lists the keys of hidden series (interactive legends). */
  hidden?: ReadonlySet<string> | readonly string[];
  /** Makes items with a `key` toggle buttons. */
  onToggle?: (key: string) => void;
  /** Called with the key under the pointer / focus (null when it leaves): charts dim the others. */
  onHighlight?: (key: string | null) => void;
  /** Overrides for the legend's built-in English strings. */
  labels?: Partial<ChartLegendLabels>;
};

/**
 * Legend keys mirror the mark: a short line for line charts, a swatch for bars/areas. Text stays
 * in text colours. With `onToggle`, each item is a toggle button (aria-pressed = shown):
 * click / Enter / Space hides or shows the series, hover and focus dim the others, and the
 * change is announced.
 *
 * Props: `items` (label, colour, `kind` "line" | "rect", optional `value`, `key`, `dashed`), `hidden` (keys of hidden series), `onToggle` (makes items with a `key` toggle buttons), `onHighlight` (key under the pointer or focus, null on leave), `labels` and `className`.
 * Keyboard: with `onToggle`, Tab moves between items; Enter or Space shows or hides a series. Each button has `aria-pressed`, and the change is announced in a polite live region. Without it the legend is a plain list.
 * Colour keys are SVG, so they survive forced colors; hidden series show a hollow key and struck-through text.
 *
 * @example
 * ```tsx
 * import { ChartLegend } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartLegend
 *       items={[
 *         { label: "Revenue", color: "var(--sheen-chart-1)", kind: "line" },
 *         { label: "Target", color: "var(--sheen-chart-2)", kind: "line", dashed: true },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartLegend({ items, className, hidden, onToggle, onHighlight, labels }: ChartLegendProps) {
  const t = { ...defaultChartLegendLabels, ...labels };
  const hiddenSet = useMemo(() => (hidden ? new Set(hidden) : EMPTY_SET), [hidden]);
  const [message, setMessage] = useState("");
  const interactive = Boolean(onToggle) && items.some((i) => i.key !== undefined);

  if (!interactive) {
    return (
      <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sheen-fg-muted", className)}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <LegendKey color={item.color} kind={item.kind} dashed={item.dashed} pattern={item.pattern} />
            <span>{item.label}</span>
            {item.value !== undefined && <span className="font-semibold text-sheen-fg tabular-nums">{item.value}</span>}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.legend}
      // Wrapped rows sit 46px apart on touch, so the 44px hit areas of stacked toggles never overlap.
      className={cn(
        "flex flex-wrap items-center gap-x-1 gap-y-1 any-pointer-coarse:gap-y-[1.125rem] text-xs text-sheen-fg-muted",
        className,
      )}
    >
      {items.map((item, i) => {
        const key = item.key;
        if (key === undefined) {
          return (
            <span key={i} className="flex items-center gap-1.5 px-2">
              <LegendKey color={item.color} kind={item.kind} dashed={item.dashed} pattern={item.pattern} />
              <span>{item.label}</span>
            </span>
          );
        }
        const off = hiddenSet.has(key);
        return (
          <button
            key={`${key}\u0000${i}`}
            type="button"
            aria-pressed={!off}
            data-slot="chart-legend-toggle"
            onClick={() => {
              onToggle?.(key);
              setMessage((off ? t.shown : t.hidden)(item.label));
            }}
            onPointerEnter={() => onHighlight?.(off ? null : key)}
            onPointerLeave={() => onHighlight?.(null)}
            onFocus={() => onHighlight?.(off ? null : key)}
            onBlur={() => onHighlight?.(null)}
            className={cn(
              "relative inline-flex h-7 items-center gap-1.5 rounded-sheen-full px-2 select-none",
              "transition-[color,background-color,opacity] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
              "touch-manipulation [-webkit-tap-highlight-color:transparent]",
              "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
              // 44px tall hit area on touch screens without growing the legend.
              "sheen-hit",
            )}
          >
            <LegendKey color={item.color} kind={item.kind} dashed={item.dashed} hollow={off} pattern={item.pattern} />
            <span className={cn(off && "line-through decoration-1")}>{item.label}</span>
            {item.value !== undefined && <span className="font-semibold text-sheen-fg tabular-nums">{item.value}</span>}
          </button>
        );
      })}
      <ChartAnnouncer text={message} />
    </div>
  );
}

/**
 * The colour key for a series, drawn as SVG (not a CSS background) so it survives
 * forced-colors / Windows High Contrast, where it also gains a CanvasText outline.
 * `hollow` draws an outline only (a hidden series); `dashed` a dashed line (previous period); `pattern` hatches the swatch like the chart's `patterns`.
 *
 * Props: `color` (any CSS colour), `kind` ("rect" swatch by default, or "line"), `dashed` (a dashed line, for a previous period), `hollow` (outline only, for a hidden series) and `pattern` (hatch index 1 to 8, so the swatch matches a hatched series). Decorative: it is `aria-hidden`, the label next to it carries the meaning.
 *
 * @example
 * ```tsx
 * import { LegendKey } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <LegendKey color="var(--sheen-chart-1)" kind="line" dashed />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function LegendKey({
  color,
  kind = "rect",
  dashed = false,
  hollow = false,
  pattern = 0,
}: {
  /** Any CSS color for the swatch, normally a `var(--sheen-chart-n)` token. */
  color: string;
  /** "line" draws a short stroke (line charts); "rect" draws a filled square (bars, areas). Default "rect". */
  kind?: "line" | "rect";
  /** Draw the stroke dashed, for a comparison or forecast series. */
  dashed?: boolean;
  /** Draw an outline only instead of a filled swatch. */
  hollow?: boolean;
  /** Hatch index (1 to 8) so the swatch matches a series drawn with `patterns`. Rect keys only. */
  pattern?: number;
}) {
  const patId = useId();
  const hatched = kind === "rect" && pattern > 0 && !hollow;
  return kind === "line" ? (
    <svg
      aria-hidden
      data-slot="legend-key"
      width={14}
      height={10}
      viewBox="0 0 14 10"
      className="shrink-0 forced-color-adjust-none"
    >
      <line
        x1={1}
        x2={13}
        y1={5}
        y2={5}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 3" : undefined}
        strokeOpacity={hollow ? 0.45 : 1}
      />
    </svg>
  ) : (
    <svg
      aria-hidden
      data-slot="legend-key"
      width={10}
      height={10}
      viewBox="0 0 10 10"
      className="shrink-0 forced-color-adjust-none"
    >
      {hatched && <ChartPatternDefs id={patId} entries={[{ index: pattern, color }]} />}
      <rect
        x={hollow ? 1 : 0.5}
        y={hollow ? 1 : 0.5}
        width={hollow ? 8 : 9}
        height={hollow ? 8 : 9}
        rx={2.5}
        fill={hollow ? "none" : patternFill(hatched, patId, pattern, color)}
        fillOpacity={dashed ? 0.45 : 1}
        stroke={hollow ? color : undefined}
        strokeWidth={hollow ? 1.5 : 1}
        className={hollow ? undefined : "stroke-transparent forced-colors:stroke-[CanvasText]"}
      />
    </svg>
  );
}

/**
 * Builds the ChartLegend items for a list of series (colour by position, key shape `line` or `rect`).
 * Pure, but exported from a client module: call it from client code.
 */
export function seriesLegend(
  series: readonly ChartSeries[],
  kind: "line" | "rect",
  /** Hatch the swatches like the chart's `patterns` prop. Default: on from 4 series, as in the charts. */
  patterns?: boolean,
): LegendItem[] {
  const hatched = kind === "rect" && resolvePatterns(patterns, series.length);
  return series.map((s, i) => ({
    label: s.label,
    color: seriesColor(s, i),
    kind,
    key: s.key,
    pattern: hatched && i > 0 ? i : undefined,
  }));
}

/* ---------- Tooltip ---------- */

/** One row of a chart tooltip: label, formatted value, colour, key shape and whether the key is dashed. */
export type TooltipRow = { label: string; value: string; color: string; kind?: "line" | "rect"; dashed?: boolean };

/**
 * "glass": the standard glass-3 tooltip. "opaque": the same glass, but a near-solid fill so
 * dense chart text behind it never shows through (busy charts, small screens).
 */
export type TooltipSurface = "glass" | "opaque";

/** Classes + style for a chart tooltip surface (for charts that build their own tooltip). */
export function chartTooltipSurface(surface: TooltipSurface = "glass") {
  return {
    className: "glass-3",
    style:
      surface === "opaque"
        ? { backgroundColor: "color-mix(in oklab, var(--sheen-surface-solid) 94%, transparent)" }
        : undefined,
  } as const;
}

/**
 * Props of ChartTooltip: title, rows, the pointer position and container width, plus the `docked`,
 * surface and glide options.
 */
export type ChartTooltipProps = {
  /** The heading line: usually the category or date being read. */
  title: string;
  /** One line per series: a swatch, a label and the formatted value. */
  rows: TooltipRow[];
  /** Horizontal position of the pointer, in px from the left of the chart box. */
  x: number;
  /** Vertical position of the pointer, in px from the top of the chart box. */
  y: number;
  /** Width of the chart box in px, so the tooltip flips to stay inside it. */
  containerWidth: number;
  /** Pin the readout to the top of the chart as one line instead of following the pointer (used on narrow charts). */
  docked?: boolean;
  /** Surface style of the tooltip: glass or opaque. Default "glass". */
  surface?: TooltipSurface;
  /** Glide between points on the pointer spring (default) instead of jumping. */
  glide?: boolean;
  /** Extra lines under the values (e.g. an event marker at this point). */
  notes?: readonly string[];
};

/**
 * The event-marker diamond in front of a tooltip note. A rotated square, not a "◆" glyph: a
 * symbol the UI font lacks makes the browser search its fallback fonts the first time it is
 * laid out, a one-off stall that would land in the middle of the first hover.
 */
export function NoteMark() {
  return <span aria-hidden className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-current forced-color-adjust-none" />;
}

/**
 * Glass tooltip positioned inside the chart container. Values lead (strong), labels follow (muted).
 * `x` / `y` are in px relative to the container; it flips to stay inside, and glides from point
 * to point with a spring (transform only: it never triggers layout).
 * `docked`: a one-line readout pinned to the top of the chart instead (narrow charts, where a
 * floating tooltip would sit under the finger). The chart reserves TOOLTIP_DOCK_SPACE for it.
 * It is visual only: the chart announces the same values through ChartAnnouncer.
 *
 * Props: `title`, `rows` ({ label, value, color, kind?, dashed? }), `x` and `y` (px inside the chart container), `containerWidth`, `docked` (default false), `surface` ("glass" default or "opaque"), `glide` (default true) and `notes` (extra lines, e.g. event markers).
 * Accessibility: visual only (`aria-hidden`, no pointer events). The chart announces the same values through ChartAnnouncer, so keyboard and screen-reader users get them without the tooltip.
 * Glass and motion: one glass-3 surface; it glides on a spring, or jumps under reduced motion. Place it inside a `position: relative` container.
 *
 * @example
 * ```tsx
 * import { ChartTooltip } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <div style={{ position: "relative", width: 480, height: 160 }}>
 *       <ChartTooltip title="Mar" rows={[{ label: "Revenue", value: "$4.2k", color: "var(--sheen-chart-1)", kind: "line" }]} x={120} y={40} containerWidth={480} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartTooltip({
  title,
  rows,
  x,
  y,
  containerWidth,
  docked = false,
  surface = "glass",
  glide = true,
  notes,
}: ChartTooltipProps) {
  const reduced = useSheenReducedMotion();
  const springX = useSpring(x, followPointer);
  const springY = useSpring(y, followPointer);
  const still = reduced || !glide;
  useEffect(() => {
    if (still) {
      springX.jump(x);
      springY.jump(y);
    } else {
      springX.set(x);
      springY.set(y);
    }
  }, [x, y, still, springX, springY]);
  const look = chartTooltipSurface(surface);

  if (docked) {
    return (
      <div
        aria-hidden
        data-slot="chart-readout"
        className={cn(
          look.className,
          "pointer-events-none absolute inset-x-0 top-0 z-10 flex min-h-7.5 flex-wrap items-center gap-x-3 gap-y-0.5 rounded-sheen-md px-3 py-1.5 text-xs text-sheen-fg",
        )}
        style={look.style}
      >
        <span className="font-medium text-sheen-fg-muted">{title}</span>
        {rows.map((row, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {row.color === "transparent" ? null : (
              <LegendKey color={row.color} kind={row.kind ?? "line"} dashed={row.dashed} />
            )}
            <span className="font-semibold text-sheen-fg tabular-nums">{row.value}</span>
            <span className="text-sheen-fg-muted">{row.label}</span>
          </span>
        ))}
        {notes?.map((n, i) => (
          <span key={`n${i}`} className="flex items-center gap-1.5 whitespace-nowrap text-sheen-fg-muted">
            <NoteMark />
            {n}
          </span>
        ))}
      </div>
    );
  }

  const flip = x > containerWidth - 180;
  return (
    <motion.div
      aria-hidden
      data-slot="chart-tooltip"
      className="pointer-events-none absolute top-0 left-0 z-10"
      style={{ x: still ? x : springX, y: still ? y : springY }}
    >
      <div
        className={cn(look.className, "min-w-36 rounded-sheen-md px-3 py-2.5 text-xs text-sheen-fg")}
        // The side flip glides (transform transition on the inner box) instead of jumping ~190px in one frame.
        style={{
          ...look.style,
          transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, -50%)`,
          transition: "transform var(--sheen-duration-base) var(--sheen-ease-out)",
        }}
      >
        <p className="mb-1.5 font-medium text-sheen-fg-muted">{title}</p>
        <ul className="flex flex-col gap-1">
          {rows.map((row, i) => (
            <li key={i} className="flex items-center gap-2">
              {row.color === "transparent" ? (
                <span aria-hidden className="w-3.5 shrink-0" />
              ) : (
                <LegendKey color={row.color} kind={row.kind ?? "line"} dashed={row.dashed} />
              )}
              <span className="font-semibold text-sheen-fg tabular-nums">{row.value}</span>
              <span className="text-sheen-fg-muted">{row.label}</span>
            </li>
          ))}
        </ul>
        {notes && notes.length > 0 && (
          <ul className="mt-1.5 flex flex-col gap-0.5 border-t border-sheen-border pt-1.5 text-sheen-fg-muted">
            {notes.map((n, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <NoteMark />
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Screen-reader announcement of the active data point (charts are keyboard-navigable).
 *
 * Prop: `text` (the sentence to read; an empty string is silent). Renders a visually hidden `aria-live="polite"` region, so changes are read without moving focus. Charts feed it the active point when the keyboard moves it.
 *
 * @example
 * ```tsx
 * import { ChartAnnouncer } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartAnnouncer text="March: revenue $4.2k" />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartAnnouncer({
  text,
}: {
  /** The message for the polite live region; screen readers read it when it changes. */
  text: string;
}) {
  return (
    <p data-slot="chart-announcer" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </p>
  );
}
