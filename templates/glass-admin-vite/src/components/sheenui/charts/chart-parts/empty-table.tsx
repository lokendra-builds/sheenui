"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { formatCompact, num, seriesColor, type ChartRow, type CompareSeries } from "../chart-utils";
import { LegendKey } from "./legend-tooltip";

/* ---------- Shared labels (i18n) ---------- */

/** The labels every chart shares, such as the no-data text. @internal */
export type SharedLabels = { noData: ReactNode; previous: (label: string) => string };
/** Supplies shared chart labels to every chart below a provider. @internal */
export const LabelsContext = createContext<Partial<SharedLabels> | null>(null);

/**
 * Text a ChartCard hands down to its table and empty states (labels.noData, labels.previous).
 *
 * Returns `{ noData, previous }`, the strings a ChartCard's `labels` hand down (defaults "No data" and "<series> (previous)"). Use it in custom charts so they speak the card's language.
 * Not a component: no DOM, keyboard or screen-reader behaviour of its own.
 *
 * @example
 * ```tsx
 * import { useChartSharedLabels } from "@sheenui/theme";
 *
 * function Empty() {
 *   const { noData } = useChartSharedLabels();
 *   return <p>{noData}</p>;
 * }
 * ```
 *
 * @see /charts
 */
export function useChartSharedLabels(): SharedLabels {
  const ctx = useContext(LabelsContext);
  return {
    noData: ctx?.noData ?? defaultChartTableLabels.noData,
    previous: ctx?.previous ?? defaultChartTableLabels.previous,
  };
}

/* ---------- Empty state ---------- */

/**
 * Shown instead of a chart when there is nothing to plot. Keeps the chart's footprint (so
 * layouts don't jump) and stays readable to screen readers: "<label>: No data".
 * The default text comes from the enclosing ChartCard's `labels.noData` ("No data").
 *
 * Props: `height` (px, keeps the chart's footprint), `aria-label` (names the chart; required), `children` (message; default the card's "No data") and `className`.
 * Accessibility: a `role="group"` named like the chart, so screen readers hear "Revenue: No data". Static (no motion).
 *
 * @example
 * ```tsx
 * import { ChartEmpty } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartEmpty height={160} aria-label="Revenue per month">
 *       No sales yet
 *     </ChartEmpty>
 *   );
 * }
 * ```
 *
 * @see /charts/edge-cases
 */
export function ChartEmpty({
  height,
  "aria-label": ariaLabel,
  children,
  className,
}: {
  /** Height of the empty state in px, so the layout does not jump when data arrives. */
  height: number;
  /** Sets the accessible name of the empty chart. */
  "aria-label": string;
  children?: ReactNode;
  className?: string;
}) {
  const shared = useChartSharedLabels();
  return (
    <div
      role="group"
      aria-roledescription="chart"
      aria-label={ariaLabel}
      data-slot="chart-empty"
      className={cn("relative flex w-full items-center justify-center", className)}
      style={{ height }}
    >
      {/* Faint, decorative grid so the empty card still reads as a chart. */}
      <svg aria-hidden className="absolute inset-0 size-full" preserveAspectRatio="none">
        {[0.2, 0.45, 0.7].map((t) => (
          <line key={t} x1="0" x2="100%" y1={`${t * 100}%`} y2={`${t * 100}%`} stroke="var(--sheen-chart-grid)" />
        ))}
        <line x1="0" x2="100%" y1="92%" y2="92%" stroke="var(--sheen-border)" />
      </svg>
      <p className="relative text-sm text-sheen-fg-muted">{children ?? shared.noData}</p>
    </div>
  );
}

/* ---------- Table view ---------- */

/**
 * Translatable text of ChartTable (`noData`, `previous(label)`), usually handed down by the enclosing
 * ChartCard.
 */
export type ChartTableLabels = {
  /** Shown when there are no rows. */
  noData: ReactNode;
  /** Header of a previous-period column. */
  previous: (label: string) => string;
};

/** The English strings of `ChartTable` (and of the empty state); a `ChartCard`'s `labels` override them below it. */
export const defaultChartTableLabels: ChartTableLabels = {
  noData: "No data",
  previous: (label: string) => `${label} (previous)`,
};

/**
 * Set only inside a ChartCard's screen-reader twin (the visually hidden copy of the table view): the name of the
 * twin's table. Table scrollers read it to stay static named blocks there (TableOverflow, TableScroll, ChartValueTable).
 * @internal
 */
export const TableLabelContext = createContext<string | null>(null);

/** A horizontally scrolling wrapper that becomes a focusable group only while it overflows. */
export function TableOverflow({ label: ownLabel, children }: { label?: string; children: ReactNode }) {
  const twinLabel = useContext(TableLabelContext);
  const label = twinLabel ?? ownLabel;
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    if (!el) return;
    // Measured from the ResizeObserver's own (post-layout) notifications, including the first
    // one: reading scrollWidth here would force a layout inside the table's commit.
    const update = () => setOverflow(el.scrollWidth - el.clientWidth > 1);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [el]);
  // In the twin (a 1 px hidden box) every table "overflows": a static named block there, never an invisible tab stop.
  if (twinLabel !== null)
    return (
      <div role="group" aria-label={label}>
        {children}
      </div>
    );
  return (
    <div
      ref={setEl}
      // A named group, not a region landmark: it would repeat the name of the chart card around it (see TableScroll).
      role={overflow ? "group" : undefined}
      aria-label={overflow ? label : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region that can overflow must be keyboard-focusable (WCAG 2.1.1 keyboard)
      tabIndex={overflow ? 0 : undefined}
      className="overflow-x-auto rounded-sheen-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
    >
      {children}
    </div>
  );
}

/**
 * Every chart has a table view: the accessible, colour-free way to read every value.
 * Series with a `compareKey` get a previous-period column too.
 *
 * Props: `data`, `index` (the row key), `series`, `format` (default compact numbers), `indexLabel` (first column header), `caption` (hidden, names the table) and `labels` ({ noData, previous }).
 * Accessibility: a real `<table>` with a caption and header cells, so values are readable without colour or pointer. It scrolls inside its own focusable region when wider than the card. Static (no motion).
 *
 * @example
 * ```tsx
 * import { ChartTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ChartTable data={[{ m: "Jan", v: 4 }, { m: "Feb", v: 7 }]} index="m" series={[{ key: "v", label: "Visits" }]} indexLabel="Month" caption="Visits per month" />
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartTable({
  data,
  index,
  series,
  format = formatCompact,
  indexLabel,
  caption,
  labels,
}: {
  /** The rows to show: one object per row, holding the `index` key and one number per series key. */
  data: readonly ChartRow[];
  /** The key in each row that names the row, such as "month". It becomes the first column. */
  index: string;
  /** Series to list as columns; one with a `compareKey` also gets a previous-period column. */
  series: readonly CompareSeries[];
  /** Formats each number in the table cells. */
  format?: (n: number) => string;
  /** Header of the first column; the `index` key when left out. */
  indexLabel?: string;
  /** Visually hidden caption naming the table for screen readers. */
  caption?: string;
  /** Text for i18n (defaults come from the enclosing ChartCard's labels, else English). */
  labels?: Partial<ChartTableLabels>;
}) {
  const shared = useChartSharedLabels();
  const t = { noData: labels?.noData ?? shared.noData, previous: labels?.previous ?? shared.previous };
  const columns = series.flatMap((s, i) => {
    const color = seriesColor(s, i);
    const { compareKey } = s;
    const own = { key: s.key, label: s.label, color, dashed: false };
    return compareKey ? [own, { key: compareKey, label: t.previous(s.label), color, dashed: true }] : [own];
  });
  return (
    <TableOverflow label={caption ?? indexLabel ?? index}>
      <table className="w-full text-start [:where(&)_th]:text-start text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="text-xs text-sheen-fg-muted">
          <tr className="border-b border-sheen-border">
            <th scope="col" className="py-2 pe-4 font-medium">
              {indexLabel ?? index}
            </th>
            {columns.map((c, i) => (
              <th key={i} scope="col" className="py-2 pe-4 text-end font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <LegendKey color={c.color} dashed={c.dashed} />
                  {c.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="py-6 text-center text-sheen-fg-muted">
                {t.noData}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="border-b border-sheen-border last:border-0">
                <th scope="row" className="py-2 pe-4 font-normal text-sheen-fg-muted">
                  {row[index]}
                </th>
                {columns.map((c, ci) => (
                  <td key={ci} className="py-2 pe-4 text-end tabular-nums">
                    {c.dashed && row[c.key] === undefined ? "–" : format(num(row[c.key]))}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableOverflow>
  );
}
