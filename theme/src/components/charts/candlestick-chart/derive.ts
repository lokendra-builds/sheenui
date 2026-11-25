"use client";

import { useMemo } from "react";

import { itemAt } from "../chart-utils";
import { safeNumberFormat } from "../category-bar";
import { dateFormats, type Parsed } from "./model";

/** The price, percent and date formatters of a candlestick chart. @internal */
export function useCandleFormats(o: {
  formatProp: ((v: number) => string) | undefined;
  locale: string | undefined;
  candles: Parsed[];
  count: number;
  timeZone: string | undefined;
}) {
  const { formatProp, locale, candles, count, timeZone } = o;
  const priceFormat = useMemo(() => {
    if (formatProp) return formatProp;
    const nf = safeNumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n: number) => nf.format(n).replace("-", "−");
  }, [formatProp, locale]);
  const intraday = useMemo(() => {
    if (count < 2) return false;
    const gaps = candles
      .slice(1)
      .map((c, i) => c.date.getTime() - itemAt(candles, i).date.getTime())
      .sort((a, b) => a - b);
    return (gaps[Math.floor(gaps.length / 2)] ?? 0) < 20 * 3_600_000;
  }, [candles, count]);
  const dates = useMemo(() => dateFormats(locale, intraday, timeZone), [locale, intraday, timeZone]);
  const pctFormat = useMemo(
    () =>
      safeNumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: "exceptZero",
      }),
    [locale],
  );
  return { priceFormat, dates, pctFormat };
}

/**
 * The target price and volume ranges of the visible window, padded. The marks are drawn on them; while
 * the axes ease (and while a zoom glides), a transform maps them onto what is on screen.
 * @internal
 */
export function priceRange(candles: readonly Parsed[], view: { start: number; end: number }, count: number) {
  let lo = Infinity;
  let hi = -Infinity;
  let vmax = 0;
  for (let i = Math.max(0, Math.floor(view.start)); i < Math.min(count, Math.ceil(view.end)); i++) {
    const c = itemAt(candles, i);
    lo = Math.min(lo, c.l, c.ma ?? c.l);
    hi = Math.max(hi, c.h, c.ma ?? c.h);
    vmax = Math.max(vmax, c.v ?? 0);
  }
  if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.02 || 1;
  return { tLo: lo - pad, tHi: hi + pad, tV: vmax || 1 };
}
