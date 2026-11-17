/**
 * Date helpers for Calendar and DatePicker: plain `Date` objects at local midnight, and
 * `Intl` for every locale-dependent bit (week start, month and weekday names, digits).
 * No dependencies.
 *
 * All arithmetic goes through `new Date(year, month, day)`, which normalises overflow
 * (day 32 → next month) and never lands on the wrong day around daylight-saving changes.
 */

export type DateRange = { start: Date | null; end: Date | null };

/** 0 = Sunday … 6 = Saturday, like Date.getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A new Date at local midnight of the same calendar day. Pure; uses the runtime's local time zone, no
 * DOM, so it is safe to call on the server.
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * A new Date moved by `days` calendar days (negative goes back), at local midnight; DST-safe. Pure, no
 * DOM: safe on the server (local time zone of the runtime).
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * Number of days in a month; `month` is 0-based like `Date#getMonth`. Pure, no DOM: safe on the
 * server.
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Adds months and clamps the day: Jan 31 + 1 month → Feb 28 (or 29). */
export function addMonths(date: Date, months: number): Date {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(date.getDate(), daysInMonth(first.getFullYear(), first.getMonth()));
  return new Date(first.getFullYear(), first.getMonth(), day);
}

/**
 * A new Date `years` years later (negative goes back); Feb 29 clamps to Feb 28 in non-leap years.
 * Pure, no DOM: safe on the server.
 */
export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

/**
 * A new Date on the first day of the month of `date`, at local midnight. Pure, no DOM: safe on the
 * server.
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * A new Date on the last day of the month of `date`, at local midnight. Pure, no DOM: safe on the
 * server.
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** A sortable number for a calendar day (YYYYMMDD). Time of day is ignored. */
export function dayKey(date: Date): number {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

/** The day a `dayKey` stands for, at local midnight. */
export function fromDayKey(key: number): Date {
  return new Date(Math.floor(key / 10000), Math.floor((key % 10000) / 100), key % 100);
}

/** A sortable number for a calendar month (YYYYMM). */
export function monthKey(date: Date): number {
  return date.getFullYear() * 100 + date.getMonth();
}

/**
 * True when both dates fall on the same local calendar day; false if either is null or undefined.
 * Pure, no DOM: safe on the server.
 */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && dayKey(a) === dayKey(b);
}

/** True when both dates fall in the same local year and month. Pure, no DOM: safe on the server. */
export function isSameMonth(a: Date, b: Date): boolean {
  return monthKey(a) === monthKey(b);
}

/** Negative when a is before b, 0 on the same day, positive after. */
export function compareDays(a: Date, b: Date): number {
  return dayKey(a) - dayKey(b);
}

/** Whole days from a to b (b - a), DST-safe. */
export function differenceInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

/**
 * True when the calendar day of `date` is between `start` and `end`, both ends included (time of day
 * ignored). Pure, no DOM: safe on the server.
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const key = dayKey(date);
  return key >= dayKey(start) && key <= dayKey(end);
}

/**
 * Pulls `date` into the optional `min` / `max` days: returns `min` or `max` (at local midnight) when
 * outside them, otherwise `date` itself. Pure, no DOM: safe on the server.
 */
export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return date;
}

/** First day of the week that contains `date`. */
export function startOfWeek(date: Date, weekStart: Weekday): Date {
  const offset = (date.getDay() - weekStart + 7) % 7;
  return addDays(date, -offset);
}

/**
 * The last day of the week that contains `date`, for a week starting on `weekStart` (0 = Sunday).
 * Pure, no DOM: safe on the server.
 */
export function endOfWeek(date: Date, weekStart: Weekday): Date {
  return addDays(startOfWeek(date, weekStart), 6);
}

/** "2026-10-29" for the local calendar day (what a form submits). */
export function toISODate(date: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, "0");
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses "YYYY-MM-DD" as a local date. Returns null for anything else or an impossible day. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(y, m, d);
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? date : null;
}

/**
 * The weeks of a month as rows of 7 days, starting on `weekStart`. Days from the
 * neighbouring months fill the first and last rows. With `fixedWeeks`, always 6 rows,
 * so the calendar never changes height between months.
 */
export function getMonthGrid(month: Date, weekStart: Weekday, fixedWeeks = true): Date[][] {
  const first = startOfMonth(month);
  const start = startOfWeek(first, weekStart);
  const lastDay = endOfMonth(month);
  const weekCount = fixedWeeks ? 6 : Math.ceil((differenceInDays(start, lastDay) + 1) / 7);
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  );
}

/* ---------- Intl ---------- */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

/** Cached Intl.DateTimeFormat: building one is far slower than formatting with it. */
export function getDateFormatter(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a date with `Intl.DateTimeFormat` for a locale and options, through the formatter cache. No
 * DOM, but the output depends on the runtime's ICU data and time zone, so pass an explicit locale when
 * server and browser must match.
 */
export function formatDate(date: Date, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
  return getDateFormatter(locale, options).format(date);
}

/**
 * "Oct 3 – 10, 2026": Intl's own range format, which drops the parts both ends share.
 * Newer ICU versions (Node 24) put thin spaces (U+2009) around the dash where browsers still use
 * plain ones, so server-rendered text would not match the browser's: they are normalised to plain spaces.
 */
export function formatDateRange(
  start: Date,
  end: Date,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const formatter = getDateFormatter(locale, options);
  if (typeof formatter.formatRange === "function") return formatter.formatRange(start, end).replace(/\u2009/g, " ");
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

/** A known Sunday, used to read weekday names in any locale. */
const SUNDAY = new Date(2024, 0, 7);

/** Weekday names in display order, starting on `weekStart`. */
export function getWeekdayNames(
  locale: string | undefined,
  weekStart: Weekday,
  style: "long" | "short" | "narrow",
): string[] {
  const formatter = getDateFormatter(locale, { weekday: style });
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(SUNDAY, (weekStart + i) % 7)));
}

/** Month names, January first. */
export function getMonthNames(locale: string | undefined, style: "long" | "short"): string[] {
  const formatter = getDateFormatter(locale, { month: style });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2024, i, 1)));
}

/*
 * First day of the week per region, from CLDR. Used only when the browser lacks
 * Intl.Locale#getWeekInfo (Firefox, older Safari). Everything else starts on Monday.
 */
const SUNDAY_FIRST = new Set(
  "AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW".split(
    " ",
  ),
);
const SATURDAY_FIRST = new Set("AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".split(" "));

type WeekInfo = { firstDay?: number };
type LocaleWithWeekInfo = Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };

/** The locale's first day of the week (0 = Sunday). "en-US" → 0, "en-GB" → 1, "ar-EG" → 6. */
export function getWeekStart(locale?: string): Weekday {
  try {
    const tag = locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
    const loc = new Intl.Locale(tag) as LocaleWithWeekInfo;
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info?.firstDay) return (info.firstDay % 7) as Weekday;
    const region = loc.maximize().region ?? "";
    if (SUNDAY_FIRST.has(region)) return 0;
    if (SATURDAY_FIRST.has(region)) return 6;
    if (region === "MV") return 5;
    return 1;
  } catch {
    return 0;
  }
}

/** Whether the locale is written right to left (for arrow-key direction when no `dir` is set). */
export function isRtlLocale(locale?: string): boolean {
  try {
    const loc = new Intl.Locale(
      locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US"),
    ) as Intl.Locale & {
      getTextInfo?: () => { direction?: string };
      textInfo?: { direction?: string };
    };
    const info = loc.getTextInfo?.() ?? loc.textInfo;
    if (info?.direction) return info.direction === "rtl";
    return ["ar", "he", "fa", "ur", "ps", "dv", "yi", "ckb"].includes(loc.language);
  } catch {
    return false;
  }
}
