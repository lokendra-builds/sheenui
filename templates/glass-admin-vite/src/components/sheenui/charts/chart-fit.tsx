"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useCoarsePointer } from "../hooks/use-media-query";
import { cn } from "../lib/cn";
import { ChartTooltip, LegendKey, type TooltipRow } from "./chart-parts";
import { TableLabelContext } from "./chart-parts/empty-table";
import { clamp, exitTransition, niceTicks, num, TOOLTIP_DOCK_BELOW, type ChartRow } from "./chart-utils";

/**
 * Helpers shared by the stacked-area, 100% bar, combo, scatter and pie charts.
 * (Candidates to fold into chart-parts / chart-utils.)
 */

/* ---------- Pointer ---------- */

/**
 * Whether a chart of this width docks its readout above the plot: only on touch screens
 * (a floating tooltip would sit under the finger) and only in narrow charts. Mouse and
 * keyboard users always get the floating tooltip, which flips and clamps to stay inside.
 *
 * Pass the chart's width in px; returns true when the readout should dock above the plot (touch screen and a narrow chart). Mouse and keyboard users always get the floating tooltip. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { useDockedReadout } from "./chart-fit";
 *
 * function Plot({ width }: { width: number }) {
 *   const docked = useDockedReadout(width);
 *   return <p>{docked ? "Readout above the plot" : "Floating tooltip"}</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useDockedReadout(width: number) {
  const coarse = useCoarsePointer();
  return coarse && width > 0 && width < TOOLTIP_DOCK_BELOW;
}

/**
 * Who moved the active point last. Only keyboard moves are announced (a live region that
 * chatters while the mouse sweeps over a chart is noise for screen-reader users); pointer
 * moves stay visual. `announce(text)` returns the text for ChartAnnouncer.
 *
 * Returns `{ fromKeyboard, fromPointer, announce }`. Call `fromKeyboard()` in `onKeyDown` and `fromPointer()` in `onPointerMove`; feed `announce(text)` to ChartAnnouncer so only keyboard moves are spoken.
 * Not a component: no DOM of its own.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ChartAnnouncer } from "./chart-parts";
 * import { useInputSource } from "./chart-fit";
 *
 * function Plot() {
 *   const input = useInputSource();
 *   return (
 *     <div tabIndex={0} onKeyDown={input.fromKeyboard} onPointerMove={input.fromPointer}>
 *       <ChartAnnouncer text={input.announce("March: 4.2k")} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function useInputSource() {
  const [source, setSource] = useState<"keyboard" | "pointer">("pointer");
  const fromKeyboard = useCallback(() => setSource("keyboard"), []);
  const fromPointer = useCallback(() => setSource("pointer"), []);
  const announce = (text: string) => (source === "keyboard" ? text : "");
  return { fromKeyboard, fromPointer, announce };
}

/* ---------- Tooltip ---------- */

const TOOLTIP_CHAR_W = 6.6; // average glyph width of the 12px tooltip text
const TOOLTIP_MAX_W = 288; // max-w-72
const TOOLTIP_OFFSET = 14; // ChartTooltip's gap from its anchor
const EDGE_PAD = 4; // keep a floating tooltip this far inside the chart

/**
 * Props of FittedTooltip: ChartTooltip's props plus the `reach` and `side` options that keep it inside
 * the chart.
 */
export type FittedTooltipProps = ComponentProps<typeof ChartTooltip> & {
  /** Half the size of the mark at `x` (e.g. a bubble's radius): the tooltip clears it on either side. */
  reach?: number;
  /** Open towards this side when it fits (e.g. away from a label); otherwise whichever side fits. */
  side?: "left" | "right";
};

/**
 * ChartTooltip sized to its content (long rows never wrap near the chart's edge), opened on
 * the side its MEASURED width fits, and clamped inside the chart when neither side fits
 * (narrow charts), so it never widens the page.
 *
 * Takes every ChartTooltip prop, plus `reach` (half the size of the mark at `x`, so the tooltip clears it; default 0) and `side` ("left" | "right": the side to prefer when it fits).
 * Accessibility and glass: same as ChartTooltip (visual only, `aria-hidden`; the chart announces the values; one glass-3 surface; reduced motion makes it jump instead of glide).
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { FittedTooltip } from "./chart-fit";
 *
 * export function Example() {
 *   return (
 *     <div style={{ position: "relative", width: 320, height: 160 }}>
 *       <FittedTooltip title="Mar" rows={[{ label: "Revenue", value: "$4.2k", color: "var(--sheen-chart-1)" }]} x={300} y={40} containerWidth={320} reach={6} side="left" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function FittedTooltip({ reach = 0, side, ...props }: FittedTooltipProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const signature = `${props.title}\u0001${props.rows.map((r) => `${r.label}\u0002${r.value}`).join("\u0003")}\u0001${props.containerWidth}`;
  useLayoutEffect(() => {
    const el = wrap.current?.firstElementChild;
    if (el instanceof HTMLElement) setMeasured(el.offsetWidth);
  }, [signature, props.docked]);

  if (props.docked) return <ChartTooltip {...props} />;

  const W = props.containerWidth;
  const chars = (s: string) => s.length * TOOLTIP_CHAR_W;
  const estimate = Math.min(
    TOOLTIP_MAX_W,
    24 + props.rows.reduce((w, r) => Math.max(w, 30 + chars(r.value) + chars(r.label)), chars(props.title)),
  );
  const est = Math.min(measured ?? estimate, Math.max(0, W - 2 * EDGE_PAD));
  const roomRight = W - (props.x + reach) - TOOLTIP_OFFSET - EDGE_PAD;
  const roomLeft = props.x - reach - TOOLTIP_OFFSET - EDGE_PAD;
  const fitsRight = roomRight >= est;
  const fitsLeft = roomLeft >= est;
  // Open right by default (and for side="right"); left when asked and it fits, or when only left fits.
  let flip = (side === "left" && fitsLeft) || (!fitsRight && fitsLeft);
  let anchor = flip ? props.x - reach : props.x + reach;
  if (!fitsRight && !fitsLeft) {
    // Neither side has room (a narrow chart): open towards the roomier side, slid back inside.
    flip = roomLeft > roomRight;
    anchor = flip
      ? clamp(props.x - reach, EDGE_PAD + TOOLTIP_OFFSET + est, W - EDGE_PAD + TOOLTIP_OFFSET)
      : clamp(props.x + reach, EDGE_PAD - TOOLTIP_OFFSET, W - EDGE_PAD - TOOLTIP_OFFSET - est);
  }
  // ChartTooltip flips when x > containerWidth - 180: 0 forces the flip, Infinity prevents it.
  return (
    <div
      ref={wrap}
      className="contents [&>div]:w-max [&>div]:max-w-[min(18rem,var(--tip-max))]"
      style={{ "--tip-max": `${Math.max(120, W - 2 * EDGE_PAD)}px` } as CSSProperties}
    >
      <ChartTooltip {...props} x={anchor} containerWidth={flip ? 0 : Number.POSITIVE_INFINITY} />
    </div>
  );
}

/**
 * Touch screens: an empty readout slot where the docked readout will appear, until a point is
 * active, so the reserved band reads as an affordance rather than a gap. Visual only: screen
 * readers get the chart's keyboard hint instead.
 *
 * Props: `children` (the hint text) and `height` (px of the reserved band, minus its breathing room). Visual only (`aria-hidden`): screen readers get the chart's keyboard instructions instead.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { DockHint } from "./chart-fit";
 *
 * export function Example() {
 *   return (
 *     <DockHint height={30}>Tap a bar to read it</DockHint>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function DockHint({
  children,
  height,
}: {
  children: ReactNode;
  /** Height of the reserved band, minus its breathing room. */ height?: number;
}) {
  return (
    <p
      aria-hidden
      data-slot="chart-dock-hint"
      style={height ? { height } : undefined}
      className="pointer-events-none absolute inset-x-0 top-0 flex min-h-7.5 items-center justify-center gap-2 rounded-sheen-md border border-dashed border-sheen-border px-3 text-center text-xs text-sheen-fg-muted"
    >
      <svg width={14} height={14} viewBox="0 0 14 14" className="shrink-0 text-sheen-fg-subtle">
        <circle cx={7} cy={7} r={2.5} fill="currentColor" />
        <circle cx={7} cy={7} r={5.75} fill="none" stroke="currentColor" strokeWidth={1.5} />
      </svg>
      {children}
    </p>
  );
}

/** What a chart shows for one active point: the tooltip's title and rows. */
export type Readout = { title: string; rows: TooltipRow[] };

const DOCK_LINE = 16;
const DOCK_LINE_GAP = 2;
const DOCK_PAD = 12; // py-1.5
const DOCK_BREATHE = 10; // space between the readout and the plot

/**
 * Height to reserve above the plot for the docked readout (touch screens): the lines the widest
 * readout ANY point produces, laid out the way the readout's flex-wrap does, capped at
 * `maxLines` (default 2). The plot then never jumps while the user scrubs; a rare longer
 * readout overlays the plot's top padding (it is glass, so it stays legible) instead of
 * leaving a tall empty band above every chart.
 */
export function dockSpace(width: number, readouts: Iterable<Readout>, maxLines = 2) {
  const avail = Math.max(1, width - 24); // px-3 on each side
  let lines = 1;
  for (const { title, rows } of readouts) {
    // Title, then per row: [key 14 + gap 6] + value (semibold, tabular) + gap 6 + label.
    const items = [
      title.length * TOOLTIP_CHAR_W,
      ...rows.map((r) => (r.color === "transparent" ? 0 : 20) + r.value.length * 7.2 + 6 + r.label.length * 6.4),
    ];
    let n = 1;
    let x = 0;
    for (const w of items) {
      const next = x === 0 ? w : x + 12 + w; // gap-x-3
      if (next > avail && x > 0) {
        n += 1;
        x = w;
      } else x = next;
    }
    lines = Math.max(lines, n);
    if (lines >= maxLines) break;
  }
  lines = Math.min(lines, Math.max(1, maxLines));
  return DOCK_PAD + lines * DOCK_LINE + (lines - 1) * DOCK_LINE_GAP + DOCK_BREATHE;
}

/** Height of the DockHint for a reserved band of `dock` px. */
export const dockHintHeight = (dock: number) => Math.max(30, dock - DOCK_BREATHE);

/* ---------- Minimum mark size ---------- */

/**
 * Give every non-zero length at least `min` (so a 0.1% share still draws a visible mark), taking
 * the room from the larger ones in proportion; the total is unchanged. Zero stays zero. When
 * the minimums alone would exceed the total, the lengths are returned as they are.
 */
export function withMinimum(lengths: number[], min: number): number[] {
  const total = lengths.reduce((s, l) => s + Math.max(0, l), 0);
  const positive = lengths.map((l) => l > 0);
  const count = positive.filter(Boolean).length;
  if (min <= 0 || count === 0 || count * min >= total) return lengths.map((l) => Math.max(0, l));
  const fixed = new Set<number>();
  for (let pass = 0; pass <= lengths.length; pass++) {
    const free = lengths.reduce((s, l, i) => s + (positive[i] && !fixed.has(i) ? l : 0), 0);
    const k = free > 0 ? (total - fixed.size * min) / free : 0;
    let grew = false;
    for (const [i, l] of lengths.entries()) {
      if (positive[i] && !fixed.has(i) && l * k < min) {
        fixed.add(i);
        grew = true;
      }
    }
    if (!grew) return lengths.map((l, i) => (!positive[i] ? 0 : fixed.has(i) ? min : l * k));
  }
  return lengths.map((l) => Math.max(0, l));
}

/* ---------- Tables ---------- */

/**
 * Horizontal scroll container for a table view: when the table is wider than the card, it
 * scrolls inside (never the page), fades at the edge that has more to show (no wider than the
 * hidden part, 10–24px), and becomes a focusable region named by `label` (the caption) so
 * keyboard users can scroll it too. Give it a name that differs from the card's title.
 *
 * Props: `label` (accessible name of the scroll region, different from the card's title), `className` and `children` (the table).
 * Keyboard: when the table is wider than the card, the container becomes a focusable region (Tab to it, arrow keys scroll). Static (no motion).
 *
 * @example
 * ```tsx
 * import { TableScroll } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TableScroll label="Visits table">
 *       <table>
 *         <caption className="sr-only">Visits per month</caption>
 *         <thead>
 *           <tr>
 *             <th scope="col">Month</th>
 *             <th scope="col">Visits</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           <tr>
 *             <th scope="row">Jan</th>
 *             <td>4</td>
 *           </tr>
 *         </tbody>
 *       </table>
 *     </TableScroll>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function TableScroll({
  label,
  className,
  children,
}: {
  /** Accessible name of the scroll region around the table. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const twinLabel = useContext(TableLabelContext);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState({ overflow: false, start: false, end: false, fade: 24 });
  // Passive, and the first update comes from the ResizeObserver (after layout, same frame):
  // no synchronous scrollWidth read while the table is being inserted.
  useEffect(() => {
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const next = {
        overflow: max > 1,
        start: el.scrollLeft > 1,
        end: el.scrollLeft < max - 1,
        fade: Math.round(clamp(max, 10, 24)),
      };
      setState((s) =>
        s.overflow === next.overflow && s.start === next.start && s.end === next.end && s.fade === next.fade ? s : next,
      );
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [el]);
  const fade = state.overflow
    ? `linear-gradient(to right, ${state.start ? `transparent, black ${state.fade}px` : "black"}, ${state.end ? `black calc(100% - ${state.fade}px), transparent` : "black"})`
    : undefined;
  // In a ChartCard's screen-reader twin (a visually hidden 1 px box) every table "overflows": stay a named, static
  // block there, never a scroller or a tab stop that nobody can see.
  if (twinLabel !== null)
    return (
      <div data-slot="table-scroll" role="group" aria-label={twinLabel}>
        {children}
      </div>
    );
  return (
    <div
      ref={setEl}
      data-slot="table-scroll"
      // A named group, not a region landmark: the card around a chart is usually a region with the same name as the
      // table's caption, and two landmarks with one name break landmark navigation (axe landmark-unique).
      role={state.overflow ? "group" : undefined}
      aria-label={state.overflow ? label : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region that can overflow must be keyboard-focusable (WCAG 2.1.1 keyboard)
      tabIndex={state.overflow ? 0 : undefined}
      style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
      className={cn(
        "overflow-x-auto rounded-sheen-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A column of SeriesTable: the series key, its label and the colour key shown in the header. */
export type SeriesTableColumn = { key: string; label: string; color: string; kind?: "line" | "rect" };

/**
 * A chart's data as a table: one row per category, one column per series (each headed by its
 * colour key, a line key for line series), plus an optional total. Scrolls inside TableScroll
 * when it's wider than the card. Shared by the StackedAreaChart and ComboChart table views.
 *
 * Props: `data`, `index`, `columns` ({ key, label, color, kind? }), `format`, `indexLabel`, `caption`, `total` ({ label, keys }), `noData` (required empty text), `plotted` (what the chart draws for a raw value, so the table agrees) and `className`.
 * Accessibility: a real table with a caption and column headers, inside TableScroll. Static (no motion).
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { SeriesTable } from "./chart-fit";
 *
 * export function Example() {
 *   return (
 *     <SeriesTable
 *       data={[{ m: "Jan", a: 4, b: 2 }]}
 *       index="m"
 *       columns={[
 *         { key: "a", label: "Organic", color: "var(--sheen-chart-1)" },
 *         { key: "b", label: "Paid", color: "var(--sheen-chart-2)" },
 *       ]}
 *       format={(n) => String(n)}
 *       indexLabel="Month"
 *       caption="Visits by channel"
 *       total={{ label: "Total", keys: ["a", "b"] }}
 *       noData="No data"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function SeriesTable({
  data,
  index,
  columns,
  format,
  indexLabel,
  caption,
  total,
  noData,
  plotted = (n: number) => n,
  className,
}: {
  data: readonly ChartRow[];
  index: string;
  columns: SeriesTableColumn[];
  format: (n: number) => string;
  indexLabel?: string;
  caption?: string;
  /** Adds a last column with each row's sum of `total.keys`. */
  total?: { label: string; keys: string[] };
  noData: string;
  /** What the chart plots for a raw value (e.g. negatives as 0), so the table says the same. */
  plotted?: (n: number) => number;
  className?: string;
}) {
  const cell = "py-2 pe-3 sm:pe-4 last:pe-0";
  return (
    <TableScroll label={caption ?? indexLabel ?? index} className={className}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className={cn(cell, "font-medium")}>
              {indexLabel ?? index}
            </th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn(cell, "text-end font-medium whitespace-nowrap")}>
                <span className="inline-flex items-center gap-1.5">
                  <LegendKey color={c.color} kind={c.kind} />
                  {c.label}
                </span>
              </th>
            ))}
            {total && (
              <th scope="col" className={cn(cell, "text-end font-medium")}>
                {total.label}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (total ? 2 : 1)} className="py-6 text-center text-sheen-fg-muted">
                {noData}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="border-b border-sheen-border last:border-0">
                <th scope="row" className={cn(cell, "min-w-16 font-normal text-sheen-fg-muted")}>
                  {row[index]}
                </th>
                {columns.map((c) => (
                  <td key={c.key} className={cn(cell, "text-end whitespace-nowrap tabular-nums")}>
                    {format(plotted(num(row[c.key])))}
                  </td>
                ))}
                {total && (
                  <td className={cn(cell, "text-end font-medium whitespace-nowrap tabular-nums")}>
                    {format(total.keys.reduce((sum, k) => sum + plotted(num(row[k])), 0))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableScroll>
  );
}

/* ---------- Motion ---------- */

/**
 * Opacity timings for chart marks, ticks and labels. Under reduced motion every fade and exit
 * is instant too, not just the movement.
 */
export function chartFades(reduced: boolean) {
  return {
    fade: (duration: number, delay = 0) => (reduced ? { duration: 0 } : { duration, delay }),
    exit: reduced ? { duration: 0 } : exitTransition,
  };
}

/* ---------- Axis ticks ---------- */

/**
 * Options of `fitTicks`: the axis length and direction, the tick formatter and the spacing each label
 * needs.
 */
export type FitTicksOptions = {
  /** Length of the axis in px. */
  length: number;
  /** "x": labels sit side by side, so each needs its own width; "y": labels stack, so each needs `minGap`. */
  axis: "x" | "y";
  /** Formats a tick (x axes measure the widest label). */
  format: (n: number) => string;
  /** Smallest distance between two y ticks. Default 34px. */
  minGap?: number;
  /** Preferred distance between ticks. Default 140px (x) / 60px (y). */
  idealGap?: number;
  /** Average glyph width of the tick labels. Default 6.2px (11px text). */
  charPx?: number;
  /** x axes: the chart prints every n-th label, so ticks may sit closer than one label. Default 1. */
  labelEvery?: number;
};

/**
 * Round ticks that hug the data AND fit the axis. Of every distinct "nice" tick set for
 * [lo, hi], keep those whose labels don't collide, then take the one wasting the least of the
 * axis (within 10%), breaking ties by the density closest to `idealGap`. Plain niceTicks with a
 * fixed count can stretch 0–2,050 to 0–3,000, or give a 1,000px axis only three ticks.
 */
export function fitTicks(
  lo: number,
  hi: number,
  { length, axis, format, minGap = 34, idealGap, charPx = 6.2, labelEvery = 1 }: FitTicksOptions,
) {
  const span = hi - lo;
  const seen = new Set<string>();
  const candidates: { ticks: number[]; n: number; waste: number; fits: boolean }[] = [];
  for (let count = 2; count <= 12; count++) {
    const ticks = niceTicks(lo, hi, count);
    const key = ticks.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    const n = Math.max(1, ticks.length - 1);
    const range = (ticks[ticks.length - 1] ?? 1) - (ticks[0] ?? 0);
    const waste = range > 0 && span > 0 ? 1 - span / range : 0;
    const need = axis === "x" ? ticks.reduce((w, tk) => Math.max(w, format(tk).length), 0) * charPx + 14 : minGap;
    candidates.push({ ticks, n, waste, fits: (length / n) * (axis === "x" ? labelEvery : 1) >= need });
  }
  const fitting = candidates.filter((c) => c.fits);
  // Nothing fits (a tiny axis): the sparsest set.
  const pool = fitting.length > 0 ? fitting : [...candidates].sort((a, b) => a.n - b.n).slice(0, 1);
  const leastWaste = pool.reduce((w, c) => Math.min(w, c.waste), Infinity);
  const target = Math.max(2, length / (idealGap ?? (axis === "x" ? 140 : 60)));
  const best = pool
    .filter((c) => c.waste <= leastWaste + 0.1)
    .sort((a, b) => Math.abs(a.n - target) - Math.abs(b.n - target) || a.waste - b.waste)[0];
  return best?.ticks ?? niceTicks(lo, hi, 4);
}

/** Props of {@link TableScroll}. The scrollable, keyboard-focusable wrapper around a chart's data table. */
export type TableScrollProps = ComponentProps<typeof TableScroll>;
