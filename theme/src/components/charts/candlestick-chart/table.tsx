"use client";

import { useMemo } from "react";

import { cn } from "../../../lib/cn";
import { itemAt } from "../chart-utils";
import { ChartValueTable, defaultCompact } from "../heatmap";
import { safeNumberFormat, ShowAllRows, useTableRows } from "../category-bar";
import {
  defaultCandlestickChartLabels,
  type CandlestickChartProps,
  parseCandles,
  dateFormats,
  Triangle,
} from "./model";

/* ---------- Table view ---------- */

/**
 * Props of CandlestickTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type CandlestickTableProps = Pick<
  CandlestickChartProps,
  "data" | "format" | "formatVolume" | "formatDate" | "locale" | "timeZone" | "labels"
> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Sets the sort order: newest first (default), or oldest first. */
  order?: "newest" | "oldest";
  /** Rows shown before "Show all" (opening the table stays instant on long histories). Default 30. */
  limit?: number;
};

/**
 * Every candle: date, open, high, low, close, change against the previous close, and volume.
 *
 * Props: the chart's `data`, `format`, `formatVolume`, `formatDate`, `locale`, `timeZone` and `labels`, plus `caption` (hidden, names the table), `order` ("newest" first by default, or "oldest") and `limit` (rows before "Show all"). A real table: date, open, high, low, close, change and volume. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { CandlestickTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CandlestickTable data={[{ date: "2026-03-02", open: 100, high: 108, low: 97, close: 105, volume: 1200 }]} caption="ACME share price, March" />
 *   );
 * }
 * ```
 *
 * @see /charts/candlestick
 */
export function CandlestickTable({
  data,
  format: formatProp,
  formatVolume,
  formatDate,
  locale,
  timeZone,
  labels: labelOverrides,
  caption,
  order = "newest",
  limit = 30,
}: CandlestickTableProps) {
  const t = { ...defaultCandlestickChartLabels, ...labelOverrides };
  const candles = useMemo(() => parseCandles(data), [data]);
  const nf = useMemo(() => safeNumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const price = formatProp ?? ((n: number) => nf.format(n).replace("-", "−"));
  const vol = formatVolume ?? defaultCompact(locale);
  const pct = useMemo(
    () =>
      safeNumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: "exceptZero",
      }),
    [locale],
  );
  const intraday =
    candles.length > 1 && itemAt(candles, 1).date.getTime() - itemAt(candles, 0).date.getTime() < 20 * 3_600_000;
  const dates = useMemo(() => dateFormats(locale, intraday, timeZone), [locale, intraday, timeZone]);
  const hasVolume = candles.some((c) => c.v !== null);
  const ordered = useMemo(() => (order === "newest" ? [...candles].reverse() : candles), [candles, order]);
  const { rows, hidden, showAll } = useTableRows(ordered, { cap: limit });
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="flex flex-col gap-3">
      <ChartValueTable
        caption={caption}
        emptyState={t.empty}
        className="max-h-96 overflow-y-auto overscroll-contain"
        columns={[t.date, t.open, t.high, t.low, t.close, t.change, ...(hasVolume ? [t.volume] : [])].map((label) => ({
          label: cap(label),
        }))}
        rows={rows.map((c) => {
          const base = c.prev ?? c.o;
          const ratio = base !== 0 ? (c.c - base) / base : 0;
          return [
            Number.isNaN(c.date.getTime()) ? "" : formatDate ? formatDate(c.date) : dates.full.format(c.date),
            price(c.o),
            price(c.h),
            price(c.l),
            price(c.c),
            <span
              key="ch"
              className={cn(
                "inline-flex items-center gap-1",
                ratio > 0 ? "text-sheen-success-text" : ratio < 0 ? "text-sheen-danger-text" : "text-sheen-fg-muted",
              )}
            >
              {ratio !== 0 && <Triangle down={ratio < 0} />}
              {pct.format(ratio).replace("-", "−")}
            </span>,
            ...(hasVolume ? [c.v === null ? "–" : vol(c.v)] : []),
          ];
        })}
      />
      <ShowAllRows hidden={hidden} total={candles.length} label={t.showAll} onClick={showAll} />
    </div>
  );
}
