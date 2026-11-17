"use client";

import { useMemo, useState } from "react";

import { type AnalyticsRange } from "../analytics-kit";
import { type FinanceAsset } from "./model";

/**
 * The assets for the allocation chart, kept as they were while live ticks only nudge the mix:
 * a new array (and a re-drawn donut) only when a holding's share moved by half a point or more,
 * or the set of assets changed.
 */
export function useSteadyAssets(assets: FinanceAsset[] | null) {
  const [kept, setKept] = useState(assets);
  if (assets === kept) return kept;
  if (assets && kept) {
    const share = (list: FinanceAsset[]) => {
      const total = list.reduce((s, a) => s + a.quantity * a.price, 0) || 1;
      return new Map(list.map((a) => [a.symbol, (a.quantity * a.price) / total]));
    };
    const moved =
      assets.length !== kept.length ||
      (() => {
        const a = share(assets);
        const b = share(kept);
        for (const [symbol, v] of a) if (!b.has(symbol) || Math.abs(v - (b.get(symbol) ?? 0)) >= 0.005) return true;
        return false;
      })();
    if (!moved) return kept;
  }
  // The mix moved (or the set of holdings changed): adopt the new array, re-rendering at once.
  setKept(assets);
  return assets;
}

/* ---------- Formatting ---------- */

/** The money formatters (full, compact, signed) for one locale and currency. @internal */
export type Money = {
  full: Intl.NumberFormat;
  compact: Intl.NumberFormat;
  price: (n: number) => string;
  options: (n: number) => Intl.NumberFormatOptions;
};

/** Builds memoised money formatters for a locale and currency. @internal */
export function useMoney(locale: string | undefined, currency: string): Money {
  return useMemo(() => {
    const full = new Intl.NumberFormat(locale, { style: "currency", currency });
    // Compact figures (axis ticks, the donut's centre) use the narrow symbol: "$177.4K", not "US$177.4K".
    const compact = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      notation: "compact",
      maximumFractionDigits: 1,
    });
    const small = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 4 });
    /** Prices: cents for anything over 1, more digits under it. */
    const options = (n: number): Intl.NumberFormatOptions =>
      Math.abs(n) >= 1 ? { style: "currency", currency } : { style: "currency", currency, maximumFractionDigits: 4 };
    return { full, compact, price: (n) => (Math.abs(n) >= 1 ? full.format(n) : small.format(n)), options };
  }, [locale, currency]);
}

/** The axis and tooltip date formatters that suit an analytics range. @internal */
export function timeFormats(range: AnalyticsRange, locale?: string) {
  // Points closer than a day apart (60 points over 24h / 7d / 30d) need the time as well.
  const intraday = range === "24h" || range === "7d" || range === "30d";
  return {
    axis: new Intl.DateTimeFormat(
      locale,
      range === "24h" ? { hour: "numeric" } : range === "12m" ? { month: "short" } : { month: "short", day: "numeric" },
    ),
    point: new Intl.DateTimeFormat(
      locale,
      intraday
        ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" },
    ),
  };
}
