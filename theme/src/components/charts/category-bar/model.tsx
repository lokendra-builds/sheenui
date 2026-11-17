"use client";

import { startTransition, useDeferredValue, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";

import { cn } from "../../../lib/cn";
import { duration } from "../../../motion/tokens";
import { Button } from "../../button/button";
import { LegendKey, type TooltipRow } from "../chart-parts";
import { enterEase, type ChartColor, type ChartInstructions } from "../chart-utils";

/* ======================================================================
 * Shared by the HTML charts of this group (category bar, tracker, waffle)
 * ====================================================================== */

/**
 * @internal Whether a chart may build its marks yet: once it comes within 200px of the viewport,
 * switched on in a deferred render. The frame paints at once and the marks right after it (React
 * yields while it builds them), and charts further down a long page cost nothing until they come
 * close, so mounting a chart (a page load, a Chart tab coming back) never blocks input.
 *
 * Pass a ref to the chart's root; returns true once it is within 200px of the viewport (set in a deferred render, so the frame paints first). Build marks only when it is true. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useDeferredDraw } from "./model";
 *
 * function Marks() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const draw = useDeferredDraw(ref);
 *   return <div ref={ref}>{draw ? "Marks built" : "Placeholder"}</div>;
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function useDeferredDraw(ref: React.RefObject<Element | null>) {
  const near = useInView(ref, { once: true, margin: "200px" });
  return useDeferredValue(near, false);
}

/** @internal Soft glow on the active mark, dark theme only (light-dark() keeps light marks crisp). Never on glass. */
export const markGlow = (color: string, blur = 6) =>
  `drop-shadow(0 0 ${blur}px light-dark(transparent, color-mix(in oklab, ${color} 75%, transparent)))`;

/**
 * @internal The look of glass (lit rim, specular sheen, deep shadow) on a near-opaque surface,
 * without a backdrop-filter. For overlays that move with the pointer (tooltips, marker
 * bubbles): re-blurring the animated backdrop under them on every move costs frames, they are
 * too small for the blur to show, and they never count against the page's glass budget.
 */
export const solidOverlayClass =
  "border border-(--sheen-glass-border) bg-sheen-surface/95 bg-(image:--sheen-glass-specular) text-sheen-fg " +
  "shadow-[var(--sheen-glass-rim),var(--sheen-glass-2-shadow)] forced-colors:border-[CanvasText]";

/**
 * @internal On a chart's positioned container: the shared glass tooltips inside it (ChartTooltip,
 * ChartTip, the docked readout) render as solid overlays too, for the same reasons.
 */
export const solidTipsScope =
  "[&_.glass-3]:bg-sheen-surface/95! [&_.glass-3]:[backdrop-filter:none]! [&_.glass-3]:[-webkit-backdrop-filter:none]!";

/** A tooltip row of CategoryBar: the usual label, value and colour, plus an optional icon. */
export type TipRow = TooltipRow & { icon?: ReactNode };

/**
 * @internal A tooltip centred above (or below) an anchor, kept inside its positioned parent's
 * width. CSS does the fitting (percentages in the transform are the tooltip's own size), so it
 * never measures layout, however fast it moves; rows never wrap or run off the card edge.
 * Solid, not glass (see solidOverlayClass). Visual only: the chart announces the same values.
 *
 * Props: `title`, `rows` (label, value, colour, optional icon), `x` and `y` (anchor in px inside the positioned parent), `bounds` (that parent's width), `below` (open downwards; default false) and `children` (extra content under the rows).
 * Accessibility and glass: visual only (no pointer events); the chart announces the same values. A solid glass-look overlay with no backdrop blur, so it is cheap to move with the pointer.
 *
 * @example
 * ```tsx
 * import { AboveTip } from "./model";
 *
 * export function Example() {
 *   return (
 *     <div style={{ position: "relative", width: 320, height: 120 }}>
 *       <AboveTip title="Good" rows={[{ label: "Score", value: "640", color: "var(--sheen-chart-1)" }]} x={160} y={60} bounds={320} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function AboveTip({
  title,
  rows,
  x,
  y,
  bounds,
  below = false,
  children,
}: {
  title: string;
  rows: TipRow[];
  /** Anchor in px, relative to the positioned parent. */
  x: number;
  y: number;
  /** Width of the positioned parent. */
  bounds: number;
  /** Open downwards from `y` instead of upwards. */
  below?: boolean;
  /** Extra content under the rows (e.g. a detail line). */
  children?: ReactNode;
}) {
  // Centred on x, then clamped to [0, bounds − its width] (a tooltip wider than the parent sits at 0).
  const left = `clamp(0px, calc(${Math.round(x)}px - 50%), calc(${Math.round(bounds)}px - 100%))`;
  return (
    <div
      aria-hidden
      data-slot="chart-tooltip"
      className={cn(
        solidOverlayClass,
        "pointer-events-none absolute top-0 left-0 z-20 w-max max-w-[min(18rem,100%)] min-w-28 rounded-sheen-md px-3 py-2.5 text-xs",
      )}
      style={{
        transform: `translate(${left}, ${Math.round(y)}px) translateY(${below ? "10px" : "calc(-100% - 10px)"})`,
      }}
    >
      <p className="mb-1.5 font-medium text-sheen-fg-muted">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-2 whitespace-nowrap">
            {row.icon ? (
              <span
                aria-hidden
                className="flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5"
                style={{ color: row.color }}
              >
                {row.icon}
              </span>
            ) : row.color === "transparent" ? (
              <span aria-hidden className="w-3.5 shrink-0" />
            ) : (
              <LegendKey color={row.color} kind={row.kind ?? "rect"} />
            )}
            <span className="font-semibold text-sheen-fg tabular-nums">{row.value}</span>
            {row.label && <span className="text-sheen-fg-muted">{row.label}</span>}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/**
 * @internal First-view entrance of many small marks (tracker blocks, waffle cells, candles): one Web
 * Animation per `[data-delay]` element (transform + opacity only), started before the first
 * visible paint, so hundreds of marks cost no React renders. Runs once; nothing under reduced
 * motion, and turning reduced motion on mid-way finishes them.
 *
 * Arguments: `ref` (the container), `play` (start now), `reduced` (skip), `keyframes` (the Web Animation keyframes) and `ms` (duration; default the "slow" motion token). Mark each element to animate with a `data-delay` (seconds). Runs once. Not a component: no DOM, keyboard or screen-reader behaviour; with `reduced` nothing animates.
 *
 * @example
 * ```tsx
 * import { useRef } from "react";
 * import { useStaggerEntrance } from "./model";
 *
 * function Blocks({ play, reduced }: { play: boolean; reduced: boolean }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useStaggerEntrance(ref, play, reduced, [{ opacity: 0 }, { opacity: 1 }]);
 *   return (
 *     <div ref={ref}>
 *       <span data-delay="0">A</span>
 *       <span data-delay="0.05">B</span>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function useStaggerEntrance(
  ref: React.RefObject<HTMLElement | SVGElement | null>,
  play: boolean,
  reduced: boolean,
  keyframes: Keyframe[],
  ms = duration.slow * 1000,
) {
  const done = useRef(false);
  const running = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    if (!play || done.current) return;
    const root = ref.current;
    if (!root) return;
    const marks = root.querySelectorAll<HTMLElement | SVGElement>("[data-delay]");
    if (marks.length === 0) return;
    done.current = true;
    if (reduced || typeof root.animate !== "function") return;
    const easing = `cubic-bezier(${enterEaseCss})`;
    running.current = Array.from(marks, (el) =>
      el.animate(keyframes, { duration: ms, delay: Number(el.dataset.delay ?? 0) * 1000, easing, fill: "backwards" }),
    );
  });
  useEffect(() => {
    if (!reduced) return;
    for (const a of running.current) a.finish();
    running.current = [];
  }, [reduced]);
}

/** The enter easing as a CSS `cubic-bezier` argument list. @internal */
export const enterEaseCss = (enterEase as readonly number[]).join(",");

/** @internal Date formats that fall back to "en" when the locale (or an option such as a time zone) is invalid. */
export function safeDateFormat(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(locale ?? "en", options);
  } catch {
    const { timeZone: _ignored, ...rest } = options;
    return new Intl.DateTimeFormat("en", rest);
  }
}

/** @internal Number formats that fall back to "en" when the locale is invalid. */
export function safeNumberFormat(locale: string | undefined, options: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(locale ?? "en", options);
  } catch {
    return new Intl.NumberFormat("en", options);
  }
}

/**
 * @internal Rows for a table view that just mounted (the Table tab was opened). The first few
 * render with the tab switch, the rest in a transition right after it (React yields while it
 * renders them), so the tab paints at once. Long tables stop at `cap` rows until the viewer asks
 * for all of them, instead of building hundreds of rows on a click.
 *
 * Arguments: `rows` and `{ first, cap }` (rows shown with the tab switch, default 10; rows shown before "Show all", default 30). Returns `{ rows, hidden, showAll }`; pair `hidden` and `showAll` with ShowAllRows. Not a component: no DOM, keyboard or screen-reader behaviour.
 *
 * @example
 * ```tsx
 * import { useTableRows } from "./model";
 *
 * function Rows({ items }: { items: string[] }) {
 *   const { rows, hidden, showAll } = useTableRows(items);
 *   return (
 *     <>
 *       <ul>
 *         {rows.map((r) => (
 *           <li key={r}>{r}</li>
 *         ))}
 *       </ul>
 *       {hidden > 0 && (
 *         <button type="button" onClick={showAll}>
 *           Show all
 *         </button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function useTableRows<T>(rows: readonly T[], { first = 10, cap = 30 }: { first?: number; cap?: number } = {}) {
  const ready = useDeferredValue(true, false);
  const [all, setAll] = useState(false);
  const limit = all ? rows.length : Math.min(rows.length, cap);
  return {
    rows: rows.slice(0, ready ? limit : Math.min(first, limit)),
    /** Rows left out by the cap (0 while the deferred rows are still on their way). */
    hidden: ready ? rows.length - limit : 0,
    showAll: () => startTransition(() => setAll(true)),
  };
}

/**
 * @internal "Show all N rows" under a capped table view.
 *
 * Props: `hidden` (rows left out; renders nothing at 0), `total`, `label(total)` (button text, e.g. "Show all 120 rows") and `onClick`. Keyboard: a normal ghost button (Tab, Enter or Space) with a 44px hit area on touch.
 *
 * @example
 * ```tsx
 * import { ShowAllRows } from "./model";
 *
 * export function Example() {
 *   return <ShowAllRows hidden={90} total={120} label={(n) => `Show all ${n} rows`} onClick={() => {}} />;
 * }
 * ```
 *
 * @see /charts/category-bar
 */
export function ShowAllRows({
  hidden,
  total,
  label,
  onClick,
}: {
  hidden: number;
  total: number;
  label: (n: number) => string;
  onClick: () => void;
}) {
  if (hidden <= 0) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="self-start border border-sheen-control-border any-pointer-coarse:h-11"
      onClick={onClick}
    >
      {label(total)}
    </Button>
  );
}

/** @internal Arrow-key handler over `count` items that follows the reading direction. */
export function stepKeys(
  count: number,
  active: number | null,
  rtl: boolean,
  set: (i: number | null) => void,
  { rowSize = 0 }: { rowSize?: number } = {},
) {
  return (e: React.KeyboardEvent) => {
    if (count <= 0) return;
    const cur = active === null || active >= count ? -1 : active;
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let next: number | null | undefined;
    if (e.key === forward) next = Math.min(count - 1, cur + 1);
    else if (e.key === back) next = cur <= 0 ? 0 : cur - 1;
    else if (e.key === "ArrowDown")
      next = rowSize > 0 && cur >= 0 ? Math.min(count - 1, cur + rowSize) : Math.min(count - 1, cur + 1);
    else if (e.key === "ArrowUp") next = rowSize > 0 && cur >= 0 ? Math.max(0, cur - rowSize) : cur <= 0 ? 0 : cur - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else if (e.key === "Escape" && active !== null) next = null;
    if (next === undefined) return;
    e.preventDefault();
    set(next);
  };
}

/* ======================================================================
 * Category bar
 * ====================================================================== */

/** One band of a CategoryBar: its label, its width on the scale and an optional colour slot. */
export type CategoryBarItem = {
  /** Name of the band, e.g. "Good". */
  label: string;
  /** Width of the band on the scale (e.g. 580 → 670 is 90). Negative values count as 0. */
  value: number;
  /** Palette slot (1–8). Defaults to the band's position. Status bands (poor → good) still carry their label. */
  color?: ChartColor;
};

/**
 * Every string CategoryBar speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type CategoryBarLabels = {
  /** Appended to the accessible name. */
  instructions: ChartInstructions;
  /** A band's span, e.g. "580–670". */
  range: (low: string, high: string) => string;
  /** Shown in the marker's bubble and spoken when there's no `markerLabel`. */
  marker: string;
  /** Where the marker falls, e.g. "712, in Good". */
  markerIn: (value: string, band: string) => string;
  /** A marker past either end of the scale, e.g. "99, above the scale". The pin waits at that end. */
  markerAbove: (value: string) => string;
  markerBelow: (value: string) => string;
  /** Table column headers. */
  band: string;
  from: string;
  to: string;
  share: string;
  empty: string;
};

/**
 * The built-in English strings of CategoryBar; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultCategoryBarLabels: CategoryBarLabels = {
  instructions: "Use the arrow keys to read each band.",
  range: (low, high) => (/^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`),
  marker: "Marker",
  markerIn: (value, band) => `${value}, in ${band}`,
  markerAbove: (value) => `${value}, above the scale`,
  markerBelow: (value) => `${value}, below the scale`,
  band: "Band",
  from: "From",
  to: "To",
  share: "Share",
  empty: "No data",
};

/**
 * Props of CategoryBar. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type CategoryBarProps = {
  /** The bands, start to end. Their values are widths on one scale. */
  data: readonly CategoryBarItem[];
  /** Where the scale starts (e.g. 300 for a credit score). Default 0. */
  start?: number;
  /**
   * A value on the same scale to point at (e.g. the current score). A value past either end
   * keeps its real number (bubble, announcement, table) while the pin waits at that end with
   * an arrow.
   */
  marker?: number | null;
  /** Text in the marker's bubble, before its value (e.g. "Your score"). */
  markerLabel?: string;
  /** Print the values at the band boundaries under the bar. Default true. */
  showValues?: boolean;
  /** Print each band's colour key and name under the bar. Default false. */
  showLegend?: boolean;
  /** Bar thickness: "sm" 6px, "md" 8px (default), "lg" 12px. */
  size?: "sm" | "md" | "lg";
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there are no bands. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<CategoryBarLabels>;
  /** Names the bar for assistive tech (e.g. "Credit score bands"). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The bar thickness of each size, in pixels. @internal */
export const THICKNESS = { sm: 6, md: 8, lg: 12 } as const;

/** The average glyph width of the 11px boundary labels, in pixels. @internal */
export const CHAR_W = 6.2; // average glyph width of the 11px boundary labels

/**
 * Which boundary labels fit without colliding: always the two ends, then every boundary whose
 * label clears its neighbours by 8px (in reading order). `xs` are boundary offsets from the start.
 */
export function fitBoundaryLabels(xs: number[], widths: number[], total: number) {
  const n = xs.length;
  const shown = new Set<number>();
  if (n === 0) return shown;
  const box = (i: number) => {
    const w = widths[i] ?? 0;
    // Ends are anchored to the bar's edges; the rest are centred on their boundary.
    const left = i === 0 ? 0 : i === n - 1 ? total - w : (xs[i] ?? 0) - w / 2;
    return [left, left + w] as const;
  };
  shown.add(0);
  if (n > 1 && box(0)[1] + 8 <= box(n - 1)[0]) shown.add(n - 1);
  const endLeft = shown.has(n - 1) ? box(n - 1)[0] : total;
  let prevRight = box(0)[1];
  for (let i = 1; i < n - 1; i++) {
    const [l, r] = box(i);
    if (l >= prevRight + 8 && r <= endLeft - 8) {
      shown.add(i);
      prevRight = r;
    }
  }
  return shown;
}
