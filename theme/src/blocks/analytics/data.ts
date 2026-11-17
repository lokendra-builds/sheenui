/* ====================================================================================
 * Ranges, demo data helpers
 * ==================================================================================== */

/** A dashboard time range: the last 24 hours, 7, 30 or 90 days, or 12 months. */
export type AnalyticsRange = "24h" | "7d" | "30d" | "90d" | "12m";

/** Every `AnalyticsRange`, shortest first (the order of the range picker). */
export const ANALYTICS_RANGES: readonly AnalyticsRange[] = ["24h", "7d", "30d", "90d", "12m"];

/** What a dashboard asks its loader for. */
export type AnalyticsQuery = {
  range: AnalyticsRange;
  /** Values of the active filter chips (empty = everything). */
  filters: readonly string[];
};

/**
 * Loads a dashboard's data. Return the data, or a promise of it (fetch from your API). The
 * signal aborts when the query changes before it settles. Throw (or reject) to show the error
 * state with a Retry button.
 */
export type AnalyticsLoader<T> = (query: AnalyticsQuery, signal: AbortSignal) => T | Promise<T>;

/** "auto" follows the loader; the others pin a state (handy for docs, tests and storybooks). */
export type AnalyticsStatus = "auto" | "loading" | "empty" | "error";

/** One point of a generated range: a stable `key`, its `Date`, a short axis `label` and a `long` tooltip label. */
export type RangePoint = {
  /** Stable identity of the point (ISO date or hour). */
  key: string;
  date: Date;
  /** Short axis label: "14:00", "Mon", "Oct 3", "Oct". */
  label: string;
  /** Long label for tooltips and tables: "Sat, Oct 31, 2:00 PM". */
  long: string;
};

/** How many points each range shows. Internal to the analytics kit and its demo data; safe to call on the server. */
export const RANGE_POINTS: Record<AnalyticsRange, number> = { "24h": 24, "7d": 7, "30d": 30, "90d": 90, "12m": 12 };

const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

function dateFormat(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let f = dateFormatCache.get(key);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options });
    } catch {
      f = new Intl.DateTimeFormat("en", { timeZone: "UTC", ...options });
    }
    dateFormatCache.set(key, f);
  }
  return f;
}

/**
 * The time points of a range that ends at `end` (UTC ms): 24 hours, 7/30/90 days or 12 months. `end` is required, so a
 * chart never silently shows a hard-coded date: pass `Date.now()` for live data, or a fixed clock in tests and docs.
 */
export function rangePoints(range: AnalyticsRange, locale: string | undefined, end: number): RangePoint[] {
  const n = RANGE_POINTS[range];
  const out: RangePoint[] = [];
  const last = new Date(end);
  for (let i = n - 1; i >= 0; i--) {
    let date: Date;
    if (range === "24h") date = new Date(end - i * 3_600_000);
    else if (range === "12m") date = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() - i, 1));
    else date = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() - i));
    const label =
      range === "24h"
        ? dateFormat(locale, { hour: "numeric" }).format(date)
        : range === "7d"
          ? dateFormat(locale, { weekday: "short" }).format(date)
          : range === "12m"
            ? dateFormat(locale, { month: "short" }).format(date)
            : dateFormat(locale, { month: "short", day: "numeric" }).format(date);
    const long =
      range === "24h"
        ? dateFormat(locale, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(date)
        : range === "12m"
          ? dateFormat(locale, { month: "long", year: "numeric" }).format(date)
          : dateFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date);
    out.push({ key: date.toISOString(), date, label, long });
  }
  return out;
}

/** How many points a range has. */
export const rangeLength = (range: AnalyticsRange) => RANGE_POINTS[range];

export { exportCsv } from "../../lib/csv";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" &&
  v !== null &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/**
 * Structural sharing: returns `next`, but every part of it that deeply equals the same part of
 * `prev` is `prev`'s object. Memoised panels then skip whatever a new response didn't change.
 */
export function shareStructure<T>(prev: unknown, next: T): T {
  if (Object.is(prev, next)) return next;
  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) return next;
    let same = true;
    const out: unknown[] = [];
    // A loop (not map): `same` is assigned inside it, which flow analysis can follow.
    for (let i = 0; i < next.length; i++) {
      const shared = shareStructure<unknown>(prev[i], next[i]);
      if (shared !== prev[i]) same = false;
      out.push(shared);
    }
    return (same ? prev : out) as T;
  }
  if (isPlainObject(prev) && isPlainObject(next)) {
    const keys = Object.keys(next);
    let same = keys.length === Object.keys(prev).length;
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      const shared = shareStructure(prev[key], next[key]);
      if (shared !== prev[key]) same = false;
      out[key] = shared;
    }
    return (same ? prev : out) as T;
  }
  if (prev instanceof Date && next instanceof Date && prev.getTime() === next.getTime()) return prev as T;
  return next;
}

/** Signed percent change from `previous` to `current`, as a ratio; null when undefined. */
export function changeRatio(current: number, previous: number | null | undefined) {
  if (
    previous === null ||
    previous === undefined ||
    !Number.isFinite(previous) ||
    previous === 0 ||
    !Number.isFinite(current)
  )
    return null;
  return (current - previous) / Math.abs(previous);
}

const percentCache = new Map<string, Intl.NumberFormat>();

/** "+12.4%", "−3%" in a locale (typographic minus). */
export function formatChange(ratio: number, locale?: string) {
  const key = locale ?? "";
  let f = percentCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale ?? "en", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    });
    percentCache.set(key, f);
  }
  return f.format(ratio).replace("-", "−");
}

/* ====================================================================================
 * Rolling numbers
 * ==================================================================================== */

const numberFormats = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string | undefined, options: Intl.NumberFormatOptions | undefined) {
  const key = `${locale ?? ""}|${JSON.stringify(options ?? {})}`;
  let f = numberFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    numberFormats.set(key, f);
  }
  return f;
}

/** A number formatter from either form `format` takes. */
export function resolveFormat(
  format: ((n: number) => string) | Intl.NumberFormatOptions | undefined,
  locale?: string,
): (n: number) => string {
  if (typeof format === "function") return format;
  const f = numberFormat(locale, format);
  return (n) => f.format(n);
}
