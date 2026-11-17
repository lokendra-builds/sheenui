"use client";

import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import { memo, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer, ChartEmpty, LegendKey, type LegendItem } from "./chart-parts";
import { useInputSource } from "./chart-fit";
import {
  chartFocusClass,
  MAX_SERIES,
  num,
  slotColor,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import { ChartValueTable, defaultCompact, defaultPercent, useEntrance } from "./heatmap";
import { AboveTip, markGlow, stepKeys, useDeferredDraw, useStaggerEntrance } from "./category-bar";
import { useChartDirection } from "./chart-pointer";
import { ChartFigure } from "./chart-figure";

/** One category of a WaffleChart: a label, a value and an optional palette slot. */
export type WaffleItem = {
  label: string;
  value: number;
  /** Palette slot (1–8). Defaults to the item's position; give each a fixed slot so filtering never repaints it. */
  color?: ChartColor;
};

/**
 * Every string WaffleChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type WaffleChartLabels = {
  instructions: ChartInstructions;
  /** Name of the folded remainder when there are more than 8 items. */
  other: string;
  /** Name of the empty cells when `total` is more than the items add up to. */
  rest: string;
  /** Read after a share, e.g. "62% (62 cells)". */
  cells: (n: number) => string;
  /** Table column headers. */
  item: string;
  value: string;
  share: string;
  cellCount: string;
  empty: string;
};

/**
 * The built-in English strings of WaffleChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultWaffleChartLabels: WaffleChartLabels = {
  instructions: "Use the arrow keys to read each part.",
  other: "Other",
  rest: "Remainder",
  cells: (n) => `${n} ${n === 1 ? "cell" : "cells"}`,
  item: "Item",
  value: "Value",
  share: "Share",
  cellCount: "Cells",
  empty: "No data",
};

/**
 * Props of WaffleChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type WaffleChartProps = {
  /** The parts of the whole. Negative values count as 0; more than 8 parts fold the smallest into "Other". */
  data: readonly WaffleItem[];
  /** The whole. Default: the sum of the values. When larger, the rest of the cells stay empty. */
  total?: number;
  /** Number of grid rows; with `columns` it sets the grid size (10 × 10 = one cell per percent). Default 10. */
  rows?: number;
  /** Number of cells in each row of the grid; with `rows` it sets the grid size. Default 10. */
  columns?: number;
  /** "grid": rounded squares. "pictogram": `icon` in every cell (people, devices…). */
  variant?: "grid" | "pictogram";
  /** The pictogram's icon. Use `currentColor`: it's drawn in the part's colour. Default: a person. */
  icon?: ReactNode;
  /** Fill row by row (default) or column by column, from the start corner. */
  fill?: "rows" | "columns";
  /** Sets the largest cell in px. Default 28 (grid) / 32 (pictogram). */
  maxCell?: number;
  /** Show each part's key, name and share beside (or under, when narrow) the grid. Default true. */
  showLegend?: boolean;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the whole for the labels, tooltips and data table: takes the share, returns the text shown. Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<WaffleChartLabels>;
  /** Names the chart for assistive tech. */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

type Part = { label: string; value: number; color: string; slot: number; cells: number };

/**
 * More than 8 parts: the 7 largest keep their place (in your order) and their colour slot, and
 * the smallest are summed into one "Other" part (neutral grey), so slots never repeat.
 */
export function foldWaffleItems(data: readonly WaffleItem[], otherLabel = defaultWaffleChartLabels.other) {
  const items = data.map((d) => ({ label: d.label, value: Math.max(0, num(d.value)), color: d.color }));
  if (items.length <= MAX_SERIES)
    return items.map((d, i) => ({ label: d.label, value: d.value, slot: d.color ?? i + 1 }));
  const largest = new Set(
    items
      .map((d, i) => [d.value, i] as const)
      .sort((a, b) => b[0] - a[0] || a[1] - b[1])
      .slice(0, MAX_SERIES - 1)
      .map(([, i]) => i),
  );
  const kept = items
    .filter((_, i) => largest.has(i))
    .map((d, k) => ({ label: d.label, value: d.value, slot: d.color ?? k + 1 }));
  const rest = items.reduce((s, d, i) => (largest.has(i) ? s : s + d.value), 0);
  return [...kept, { label: otherLabel, value: rest, slot: 0 }];
}

/** A part's share, where a part too small to round to 0.1% reads "<0.1%" (it still owns a cell). */
function shareLabel(value: number, whole: number, pct: (ratio: number) => string) {
  if (!(whole > 0)) return pct(NaN);
  const ratio = value / whole;
  return value > 0 && ratio < 0.0005 ? `<${pct(0.001)}` : pct(ratio);
}

/**
 * Cells per part, by largest remainder so they add up exactly. Any part with a value gets at
 * least one cell (taken from the largest), so a 0.4% slice never vanishes.
 */
export function waffleCells(values: number[], whole: number, cells: number) {
  if (!(whole > 0) || cells <= 0) return values.map(() => 0);
  const exact = values.map((v) => (v / whole) * cells);
  const out = exact.map(Math.floor);
  const target = Math.min(cells, Math.round((values.reduce((s, v) => s + v, 0) / whole) * cells));
  let left = target - out.reduce((s, n) => s + n, 0);
  const order = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    out[i] = (out[i] ?? 0) + 1;
    left -= 1;
  }
  for (let i = 0; i < out.length; i++) {
    if ((values[i] ?? 0) > 0 && out[i] === 0) {
      const donor = out.reduce((best, n, j) => (n > (out[best] ?? 0) ? j : best), 0);
      if ((out[donor] ?? 0) > 1) {
        out[donor] = (out[donor] ?? 0) - 1;
        out[i] = 1;
      }
    }
  }
  return out;
}

/** Empty cells (the remainder of a larger whole): a quiet neutral that still reads as a slot. */
const EMPTY = "color-mix(in oklab, var(--sheen-fg-subtle) 24%, transparent)";
const EMPTY_ICON = "color-mix(in oklab, var(--sheen-fg-subtle) 32%, transparent)";

const PERSON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="6.5" r="3.75" />
    <path d="M4.75 21a7.25 7.25 0 0 1 14.5 0z" />
  </svg>
);

/** Legend for a waffle: each part's key, name and share, as the chart shows them. */
export function waffleLegend(
  data: readonly WaffleItem[],
  { total, locale, labels }: { total?: number; locale?: string; labels?: Partial<WaffleChartLabels> } = {},
): LegendItem[] {
  const t = { ...defaultWaffleChartLabels, ...labels };
  const pct = defaultPercent(locale);
  const parts = foldWaffleItems(data, t.other);
  const whole = Math.max(
    total ?? 0,
    parts.reduce((s, p) => s + p.value, 0),
  );
  return parts.map((p) => ({
    label: p.label,
    color: slotColor(p.slot),
    kind: "rect",
    value: shareLabel(p.value, whole, pct),
  }));
}

/**
 * One cell. Memoised, so a hover re-renders only the cells whose part or glow changes; the other
 * parts step back through the grid's data attribute (one CSS rule), not by restyling each cell.
 */
const Cell = memo(function Cell({
  index,
  color,
  on,
  glow,
  size,
  radius,
  pictogram,
  icon,
}: {
  index: number;
  /** Fill (grid) or icon colour (pictogram). */
  color: string;
  /** Belongs to the part being read. */
  on: boolean;
  glow: string | undefined;
  size: number;
  radius: number | undefined;
  pictogram: boolean;
  icon: ReactNode;
}) {
  return (
    <div
      data-cell={index}
      data-on={on ? "" : undefined}
      className={cn(
        "flex shrink-0 items-center justify-center",
        "motion-ok:transition-[opacity,transform] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
        "in-data-waffle-active:not-data-on:opacity-30 motion-ok:data-on:scale-[1.06]",
        !pictogram && "forced-colors:border forced-colors:border-[CanvasText]",
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: pictogram ? undefined : color,
        color: pictogram ? color : undefined,
        // Only the cell under the pointer glows: a glow on every lit cell would bleed into the gaps.
        filter: glow,
      }}
    >
      {pictogram && <span className="flex size-full items-center justify-center [&>svg]:size-[88%]">{icon}</span>}
    </div>
  );
});

/**
 * A 10 × 10 grid where each cell is one percent of a whole: shares people grasp at a glance
 * ("62 in 100"). Cells are split by largest remainder, so they always add up.
 *
 * - "pictogram" draws an icon per cell instead (people, phones, trees); the icon is any SVG
 *   that uses currentColor.
 * - Hover a cell (or a legend row), tap it, or arrow through the parts: that part lights up and
 *   its value, share and cell count are shown and announced.
 * - Cells pop in along a diagonal wave the first time the chart scrolls into view; when the data
 *   changes, only the cells that change part pop again. Reduced motion: drawn in place.
 *
 * Keyboard: Tab focuses the grid; the arrow keys move between parts (mirrored in right-to-left), Home and End jump to the first and last, Escape clears.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; a hidden summary lists every part's value, share and cell count, and keyboard moves announce the part. `WaffleTable` is the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Reduced motion draws the cells in place.
 *
 * @example
 * ```tsx
 * import { WaffleChart } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WaffleChart
 *       data={[
 *         { label: "Mobile", value: 62 },
 *         { label: "Desktop", value: 31 },
 *         { label: "Tablet", value: 7 },
 *       ]}
 *       aria-label="Sessions by device, out of 100"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/waffle
 */
export function WaffleChart({
  data,
  total,
  rows = 10,
  columns = 10,
  variant = "grid",
  icon = PERSON,
  fill = "rows",
  maxCell,
  showLegend = true,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  emptyState,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<WaffleChartProps>) {
  const t = { ...defaultWaffleChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const reduced = useSheenReducedMotion();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const gridRef = useRef<HTMLDivElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const rtl = useChartDirection(rootRef);
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const { fromKeyboard, fromPointer, announce } = useInputSource();
  // Marks are built once the chart nears the viewport, in a deferred render (see useDeferredDraw):
  // a page load or a ChartCard's Chart tab coming back paints the frame at once, the marks right after.
  const drawn = useDeferredDraw(rootRef);

  const R = Math.max(1, Math.floor(rows));
  const C = Math.max(1, Math.floor(columns));
  const N = R * C;

  const parts: Part[] = useMemo(() => {
    const folded = foldWaffleItems(data, t.other);
    const sum = folded.reduce((s, p) => s + p.value, 0);
    const whole = Math.max(num(total ?? 0), sum);
    const cells = waffleCells(
      folded.map((p) => p.value),
      whole,
      N,
    );
    return folded.map((p, i) => ({
      label: p.label,
      value: p.value,
      slot: p.slot,
      color: slotColor(p.slot),
      cells: cells[i] ?? 0,
    }));
  }, [data, total, N, t.other]);
  const sum = parts.reduce((s, p) => s + p.value, 0);
  const whole = Math.max(num(total ?? 0), sum);

  // Which part owns each cell, in fill order (row by row, or column by column).
  const owner = useMemo(() => {
    const o: number[] = new Array<number>(N).fill(-1);
    let k = 0;
    parts.forEach((p, pi) => {
      for (let n = 0; n < p.cells && k < N; n++, k++) {
        const r = fill === "rows" ? Math.floor(k / C) : k % R;
        const c = fill === "rows" ? k % C : Math.floor(k / R);
        o[r * C + c] = pi;
      }
    });
    return o;
  }, [parts, N, C, R, fill]);

  // Changed cells pop again on a data change (transform + opacity only).
  const previous = useRef<number[] | null>(null);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const before = previous.current;
    previous.current = owner;
    if (!grid || !before || reduced || typeof grid.animate !== "function") return;
    const cells = grid.querySelectorAll<HTMLElement>("[data-cell]");
    let n = 0;
    owner.forEach((o, i) => {
      if (before[i] === o) return;
      const el = cells[i];
      if (el) {
        el.animate(
          [
            { transform: "scale(0.55)", opacity: 0.4 },
            { transform: "none", opacity: 1 },
          ],
          {
            duration: duration.slow * 1000,
            delay: Math.min(n++ * 6, 360),
            easing: `cubic-bezier(${ease.out.join(",")})`,
            fill: "backwards",
          },
        );
      }
    });
  }, [owner, reduced]);

  // First view: the rows rise in one after another (one animation per row, not per cell).
  useStaggerEntrance(gridRef, play && width > 0 && drawn, reduced, [
    { transform: "translateY(10px) scale(0.92)", opacity: 0 },
    { transform: "none", opacity: 1 },
  ]);

  if (parts.length === 0 || !(whole > 0)) {
    return (
      <ChartEmpty height={200} aria-label={ariaLabel} className={className}>
        {emptyState ?? t.empty}
      </ChartEmpty>
    );
  }

  // Grid size: as large as fits (legend beside it from 520px, under it below), capped per cell.
  const pictogram = variant === "pictogram";
  const side = showLegend && width >= 520;
  const cap = maxCell ?? (variant === "pictogram" ? 32 : 28);
  const gap = variant === "pictogram" ? 2 : Math.max(2, Math.min(4, Math.round(width / 160)));
  const avail = side ? Math.min(width * 0.58, width - 200) : width;
  const cell = Math.max(6, Math.min(cap, Math.floor((avail - (C - 1) * gap) / C)));
  const gridW = C * cell + (C - 1) * gap;

  const act = active !== null && active < parts.length ? active : null;
  const activePart = act !== null ? parts[act] : undefined;
  const shareText = (p: Part) => shareLabel(p.value, whole, pct);
  const announceText = activePart
    ? `${activePart.label}: ${format(activePart.value)}, ${shareText(activePart)} (${t.cells(activePart.cells)})`
    : "";
  const restCells = N - parts.reduce((s, p) => s + p.cells, 0);
  const summary = [
    ...parts.map((p) => `${p.label} ${shareText(p)}`),
    whole > sum ? `${t.rest} ${pct((whole - sum) / whole)}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  // Tooltip anchor: the hovered cell, or (keyboard) the part's first cell.
  const anchorCell =
    hoverCell !== null && owner[hoverCell] === act ? hoverCell : act !== null ? owner.indexOf(act) : -1;
  const anchorRow = anchorCell >= 0 ? Math.floor(anchorCell / C) : 0;
  const anchorCol = anchorCell >= 0 ? anchorCell % C : 0;
  const anchorX = (rtl ? C - 1 - anchorCol : anchorCol) * (cell + gap) + cell / 2;
  const below = anchorRow < R / 2;
  const anchorY = below ? anchorRow * (cell + gap) + cell : anchorRow * (cell + gap);

  const pick = (i: number | null, cellIndex: number | null = null) => {
    setActive(i);
    setHoverCell(cellIndex);
  };
  // Hit-test by position, so the gaps between cells belong to the nearest cell (a tap never misses).
  const onGridPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    fromPointer();
    const rect = e.currentTarget.getBoundingClientRect();
    const pitch = cell + gap;
    let px = e.clientX - rect.left;
    if (rtl) px = rect.width - px;
    const c = Math.min(C - 1, Math.max(0, Math.floor((px + gap / 2) / pitch)));
    const r = Math.min(R - 1, Math.max(0, Math.floor((e.clientY - rect.top + gap / 2) / pitch)));
    const i = r * C + c;
    const o = owner[i] ?? -1;
    pick(o >= 0 ? o : null, o >= 0 ? i : null);
  };

  return (
    <div {...rest} ref={rootMerged} className={cn("w-full min-w-0", className)}>
      <div ref={measureRef} className={cn("flex w-full gap-6", side ? "flex-row items-center" : "flex-col")}>
        {}
        <ChartFigure
          as="div"
          label={ariaLabel}
          description={resolveInstructions(t.instructions)}
          aria-describedby={descId}

          tabIndex={0}
          className={cn("relative shrink-0 rounded-sheen-sm", chartFocusClass, !side && "self-center")}
          style={{ width: gridW }}
          onKeyDown={(e) => {
            fromKeyboard();
            stepKeys(parts.length, act, rtl, (i) => pick(i))(e);
          }}
          onBlur={() => pick(null)}
        >
          <p id={descId} className="sr-only">
            {summary}
          </p>
          <div
            ref={gridRef}
            aria-hidden
            data-waffle-active={act !== null ? "" : undefined}
            className="flex touch-pan-y touch-pinch-zoom flex-col forced-color-adjust-none"
            style={{ gap, height: R * cell + (R - 1) * gap }}
            onPointerMove={onGridPointer}
            onPointerDown={onGridPointer}
            onPointerLeave={(e) => e.pointerType === "mouse" && pick(null)}
          >
            {drawn &&
              Array.from({ length: R }, (_, r) => (
                <div key={r} className="flex" style={{ gap }} data-delay={reduced ? undefined : (r * 0.045).toFixed(3)}>
                  {owner.slice(r * C, r * C + C).map((o, c) => {
                    const i = r * C + c;
                    const part = o >= 0 ? parts[o] : undefined;
                    const lit = act !== null && o === act;
                    const color = part?.color ?? (pictogram ? EMPTY_ICON : EMPTY);
                    return (
                      <Cell
                        key={i}
                        index={i}
                        color={color}
                        on={lit}
                        glow={lit && i === hoverCell ? markGlow(color, 6) : undefined}
                        size={cell}
                        radius={pictogram ? undefined : Math.max(2, Math.round(cell * 0.24))}
                        pictogram={pictogram}
                        icon={icon}
                      />
                    );
                  })}
                </div>
              ))}
          </div>

          {activePart && anchorCell >= 0 && (
            <AboveTip
              title={activePart.label}
              rows={[
                {
                  label: format(activePart.value),
                  value: shareText(activePart),
                  color: activePart.color,
                  kind: "rect",
                },
                { label: "", value: t.cells(activePart.cells), color: "transparent" },
              ]}
              x={anchorX}
              y={anchorY}
              bounds={gridW}
              below={below}
            />
          )}
        </ChartFigure>

        {showLegend && (
          <ul
            aria-hidden
            className={cn("flex min-w-0 flex-1", side ? "max-w-xs flex-col gap-1" : "flex-wrap gap-x-5 gap-y-2")}
          >
            {parts.map((p, i) => (
              <li
                key={i}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-sheen-sm text-sm",
                  side && "px-2 py-1.5",
                  "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)",
                  act !== null && act !== i && "opacity-45",
                  act === i && side && "bg-sheen-hover",
                )}
                onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && pick(null)}
              >
                <LegendKey color={p.color} />
                <span className="min-w-0 truncate text-sheen-fg-muted">{p.label}</span>
                <span className={cn("font-semibold text-sheen-fg tabular-nums", side && "ms-auto text-base")}>
                  {shareText(p)}
                </span>
              </li>
            ))}
            {restCells > 0 && whole > sum && (
              <li className={cn("flex items-center gap-2 text-sm", side && "px-2 py-1.5")}>
                <LegendKey color={EMPTY} />
                <span className="text-sheen-fg-muted">{t.rest}</span>
                <span className={cn("font-semibold text-sheen-fg tabular-nums", side && "ms-auto")}>
                  {pct((whole - sum) / whole)}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
      <ChartAnnouncer text={announce(announceText)} />
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Props of WaffleTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type WaffleTableProps = Pick<
  WaffleChartProps,
  "data" | "total" | "rows" | "columns" | "format" | "formatPercent" | "locale" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
};

/**
 * Every part with its value, share and cell count (plus the empty remainder, if any).
 *
 * Props: the chart's `data`, `total`, `rows`, `columns`, `format`, `formatPercent`, `locale` and `labels`, plus `caption` (hidden, names the table). A real table: each part's value, share and cell count. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { WaffleTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <WaffleTable data={[{ label: "Mobile", value: 62 }, { label: "Desktop", value: 38 }]} caption="Sessions by device" />
 *   );
 * }
 * ```
 *
 * @see /charts/waffle
 */
export function WaffleTable({
  data,
  total,
  rows = 10,
  columns = 10,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  labels: labelOverrides,
  caption,
}: WaffleTableProps) {
  const t = { ...defaultWaffleChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const parts = foldWaffleItems(data, t.other);
  const sum = parts.reduce((s, p) => s + p.value, 0);
  const whole = Math.max(num(total ?? 0), sum);
  const N = Math.max(1, Math.floor(rows)) * Math.max(1, Math.floor(columns));
  const cells = waffleCells(
    parts.map((p) => p.value),
    whole,
    N,
  );
  const out = parts.map((p, i) => [
    <span key="k" className="inline-flex items-center gap-1.5">
      <LegendKey color={slotColor(p.slot)} />
      {p.label}
    </span>,
    format(p.value),
    shareLabel(p.value, whole, pct),
    String(cells[i] ?? 0),
  ]);
  if (whole > sum && parts.length > 0)
    out.push([t.rest, format(whole - sum), pct((whole - sum) / whole), String(N - cells.reduce((s, n) => s + n, 0))]);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={t.empty}
      columns={[{ label: t.item }, { label: t.value }, { label: t.share }, { label: t.cellCount }]}
      rows={out}
    />
  );
}
