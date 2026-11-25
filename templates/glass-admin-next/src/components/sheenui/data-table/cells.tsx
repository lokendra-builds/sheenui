import type { ComponentProps } from "react";
import { Fragment, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { Avatar } from "../avatar/avatar";
import { Badge, type BadgeProps } from "../badge/badge";
import { Progress } from "../progress/progress";

/**
 * Cell helpers for DataTable columns. Each one is a plain component, so they also work
 * outside a table. Pass `highlight` from the cell context to keep search matches marked.
 */

export type Highlighter = (text: string | number | null | undefined) => ReactNode;

/* ---------- Search folding: case, accents and a few special letters ---------- */

const MARKS = /\p{M}/gu;
const SPECIAL: Record<string, string> = {
  ß: "ss",
  ẞ: "ss",
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ø: "o",
  Ø: "o",
  đ: "d",
  Đ: "d",
  ł: "l",
  Ł: "l",
  ı: "i",
};

function foldChar(char: string): string {
  const special = SPECIAL[char];
  if (special) return special;
  // "é" → "e", "İ" → "i", combining marks on their own → "".
  return char.normalize("NFD").replace(MARKS, "").toLowerCase();
}

/**
 * Text as the search compares it: lower case, accents removed, ß → ss, … so "cafe" finds
 * "Café", "istanbul" finds "İstanbul" and "strasse" finds "Straße".
 */
export function foldText(text: string): string {
  let out = "";
  for (const char of text) out += foldChar(char);
  return out;
}

/** Folded text plus, for each folded character, the index of the source character it came from. */
function foldWithMap(text: string) {
  let folded = "";
  const source: number[] = [];
  let index = 0;
  for (const char of text) {
    const f = foldChar(char);
    source.push(...Array.from({ length: f.length }, () => index));
    folded += f;
    index += char.length;
  }
  return { folded, source };
}

const markClass = cn(
  // A highlighter stroke: tinted fill plus an accent underline, readable in light and dark.
  "rounded-[0.2rem] bg-sheen-accent/20 text-sheen-fg [box-decoration-break:clone] [box-shadow:inset_0_-2px_0_var(--sheen-accent)]",
  "forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:[box-shadow:none]",
);

/** Wrap every match of `query` in a <mark>. Case- and accent-insensitive, like the table search. */
export function highlightText(text: string | number | null | undefined, query: string): ReactNode {
  if (text === null || text === undefined) return null;
  const value = String(text);
  const q = foldText(query.trim());
  if (!q) return value;
  const { folded, source } = foldWithMap(value);
  const parts: ReactNode[] = [];
  let cursor = 0; // index into `value`
  let from = folded.indexOf(q);
  while (from !== -1) {
    const start = source[from] ?? 0;
    let end = (source[from + q.length - 1] ?? start) + 1;
    // Take the whole source character (surrogate pairs) and any combining marks after it.
    while (end < value.length && (source[from + q.length] ?? value.length) > end) end++;
    if (start >= cursor) {
      if (start > cursor) parts.push(<Fragment key={`t${cursor}`}>{value.slice(cursor, start)}</Fragment>);
      parts.push(
        <mark key={`m${start}`} className={markClass}>
          {value.slice(start, end)}
        </mark>,
      );
      cursor = end;
    }
    from = folded.indexOf(q, from + q.length);
  }
  if (parts.length === 0) return value;
  if (cursor < value.length) parts.push(<Fragment key={`t${cursor}`}>{value.slice(cursor)}</Fragment>);
  return parts;
}

/**
 * Highlight as a component: wraps every match of `query` in a `<mark>`, ignoring case and
 * accents (the same matching as the table search). Props: `text` (string, number, null or
 * undefined) and `query`.
 *
 * Accessibility: Uses the native `<mark>` element, which screen readers can announce as highlighted; forced colors use the system `Mark` colours.
 *
 * @example
 * ```tsx
 * import { Highlight } from "@sheenui/theme";
 *
 * export const Match = () => <Highlight text="Café Lumière" query="cafe" />;
 * ```
 *
 * @see /components/data-table
 */
export function Highlight({
  text,
  query,
}: {
  /** The text to show. A number is shown as is; null or undefined renders nothing. */
  text: string | number | null | undefined;
  /** The search text to mark inside `text`, matched case-insensitively. An empty string marks nothing. */
  query: string;
}) {
  return <>{highlightText(text, query)}</>;
}

/* ---------- Person: avatar + name + email ---------- */

/** Props of {@link UserCell}. */
export type UserCellProps = {
  /** The person's full name; also the avatar's initials. */
  name: string;
  /** Shows the secondary line under the name. */
  email?: string;
  /** Avatar image URL; initials show without it. */
  src?: string;
  /** Shows the presence dot on the avatar. */
  status?: "online" | "away" | "offline";
  /** The `highlight` function from the cell context, so search matches stay marked. */
  highlight?: Highlighter;
  /** Adds extra classes to the cell. */
  className?: string;
};

/**
 * A table cell for a person: avatar, name and an optional email. Use it inside a DataTable
 * column's `cell`, or on its own.
 *
 * Accessibility: The name sits right next to the avatar, so the avatar is hidden from screen readers (no double reading). Long names and emails stay on one line and end in an ellipsis instead of widening the column or splitting mid-word; the full value is the hover title and the text stays in the DOM for assistive tech.
 *
 * @example
 * ```tsx
 * import { UserCell } from "@sheenui/theme";
 *
 * export const Person = () => <UserCell name="Ada Lovelace" email="ada@example.com" status="online" />;
 * ```
 *
 * @see /components/data-table
 */
export function UserCell({ name, email, src, status, highlight = (t) => t, className }: UserCellProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      {/* The name is right beside it: the avatar is decorative here. */}
      <span aria-hidden className="inline-flex shrink-0">
        <Avatar name={name} src={src} size="sm" status={status} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span data-slot="user-cell-name" title={name} className="truncate font-medium text-sheen-fg">
          {highlight(name)}
        </span>
        {email && (
          <span data-slot="user-cell-email" title={email} className="truncate text-xs text-sheen-fg-muted">
            {highlight(email)}
          </span>
        )}
      </span>
    </span>
  );
}

/* ---------- Status badge ---------- */

/** The colour roles a status can map to: the {@link Badge} tones. */
export type StatusTone = NonNullable<BadgeProps["tone"]>;

/** Props of {@link StatusCell}. */
export type StatusCellProps = {
  /** The status text from your data, e.g. "active". */
  value: string;
  /** Tone per value, e.g. { active: "success", churned: "danger" }. Unknown values are neutral. */
  tones?: Record<string, StatusTone>;
  /** Display text (defaults to the value). */
  label?: ReactNode;
  /** Adds extra classes to the badge. */
  className?: string;
};

/**
 * A status as a dotted {@link Badge}. Map your values to tones with `tones`; anything unmapped
 * is neutral. The words are always shown, so colour is never the only signal.
 *
 * Accessibility: A badge with text; the dot is decorative.
 *
 * @example
 * ```tsx
 * import { StatusCell } from "@sheenui/theme";
 *
 * export const Status = () => <StatusCell value="active" tones={{ active: "success", churned: "danger" }} />;
 * ```
 *
 * @see /components/data-table
 */
export function StatusCell({ value, tones, label, className }: StatusCellProps) {
  const tone = tones?.[value] ?? "neutral";
  return (
    <Badge tone={tone} dot className={className}>
      {label ?? value}
    </Badge>
  );
}

/* ---------- Progress / usage ---------- */

/** Props of {@link ProgressCell}. */
export type ProgressCellProps = {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** Accessible name of the bar, e.g. "Usage". */
  label: string;
  /** Adds extra classes to the cell. */
  className?: string;
};

/**
 * A small progress bar with the percentage beside it, for usage or completion columns.
 *
 * Accessibility: A `progressbar` named by `label`; the visible percentage is hidden from screen readers because the bar already announces it.
 *
 * @example
 * ```tsx
 * import { ProgressCell } from "@sheenui/theme";
 *
 * export const Usage = () => <ProgressCell value={72} label="Storage used" />;
 * ```
 *
 * @see /components/data-table
 */
export function ProgressCell({ value, label, className }: ProgressCellProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <span data-slot="progress-cell" className={cn("flex min-w-32 items-center gap-3", className)}>
      <Progress
        value={pct}
        showValue={false}
        label={<span className="sr-only">{label}</span>}
        className="flex-1 gap-0"
      />
      <span aria-hidden className="w-9 text-end text-xs text-sheen-fg-muted tabular-nums">
        {pct}%
      </span>
    </span>
  );
}

/* ---------- Currency ---------- */

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/** `value` as money in `currency` (default "USD") for `locale` (default: the browser's), with `maximumFractionDigits` decimals (default 0). Formatters are cached. */
export function formatCurrency(value: number, currency = "USD", locale?: string, maximumFractionDigits = 0) {
  const key = `${locale ?? ""}|${currency}|${maximumFractionDigits}`;
  let format = currencyFormatters.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits });
    currencyFormatters.set(key, format);
  }
  return format.format(value);
}

/**
 * A money amount, right-aligned digits (tabular figures) formatted with Intl for the locale.
 * Props: `value` (number), `currency` (default "USD"), `locale` (default: the browser's),
 * `highlight` (the cell context's search highlighter).
 *
 * Accessibility: Plain text, so screen readers read the formatted amount. Pass `locale` for prerendered pages so the server and browser text match.
 *
 * @example
 * ```tsx
 * import { CurrencyCell } from "@sheenui/theme";
 *
 * export const Price = () => <CurrencyCell value={1299} currency="EUR" locale="de-DE" />;
 * ```
 *
 * @see /components/data-table
 */
export function CurrencyCell({
  value,
  currency = "USD",
  locale,
  highlight = (t) => t,
}: {
  /** The amount, in major units (12.5 is 12.50). */
  value: number;
  /** Sets the ISO 4217 currency code, for example "USD". */
  currency?: string;
  /** BCP 47 locale used to format the amount; defaults to the runtime's locale. */
  locale?: string;
  /** Highlights the part of the formatted amount that matches the table's search text. */
  highlight?: Highlighter;
}) {
  return (
    <span data-slot="currency-cell" className="tabular-nums">
      {highlight(formatCurrency(value, currency, locale))}
    </span>
  );
}

/* ---------- Relative date ---------- */

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

// One Intl formatter per locale (constructing them is the costly part of a date cell; a page of 100 rows made 300 of them).
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

/** "3 days ago", "in 2 hours". `now` is injectable for deterministic output. */
export function formatRelativeDate(date: Date | string | number, now: Date | number = Date.now(), locale?: string) {
  const then = new Date(date).getTime();
  const seconds = Math.round((then - new Date(now).getTime()) / 1000);
  let format = relativeFormatters.get(locale ?? "");
  if (!format)
    relativeFormatters.set(locale ?? "", (format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })));
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "second");
}

/**
 * A date as relative text ("3 days ago", "in 2 hours") inside a `<time>`. The absolute date is
 * in the hover title and in the accessible name. Props: `value` (Date, ISO string or ms),
 * `now` (inject a fixed "now" for prerendered pages and tests; default: the current time),
 * `locale` (default: the browser's).
 *
 * Accessibility: Uses `<time dateTime>`; screen readers hear the relative text followed by the full date, while the visible text is the relative one only.
 *
 * @example
 * ```tsx
 * import { RelativeDateCell } from "@sheenui/theme";
 *
 * export const Updated = () => <RelativeDateCell value="2026-11-01T09:00:00Z" now={new Date("2026-11-08T09:00:00Z")} locale="en-US" />;
 * ```
 *
 * @see /components/data-table
 */
export function RelativeDateCell({
  value,
  now,
  locale,
}: {
  /** The moment to describe: a Date, an ISO string or a timestamp in ms. */
  value: Date | string | number;
  /** The reference time for "3 hours ago". Pass a fixed value on a prerendered page so the server and browser agree. */
  now?: Date | number;
  /** BCP 47 locale for the relative phrase; defaults to the runtime's locale. */
  locale?: string;
}) {
  const date = new Date(value);
  let dateFormat = dateFormatters.get(locale ?? "");
  if (!dateFormat)
    dateFormatters.set(locale ?? "", (dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" })));
  const full = dateFormat.format(date);
  const relative = formatRelativeDate(date, now, locale);
  return (
    // The absolute date is in the title (hover) and in the accessible name.
    <time dateTime={date.toISOString()} title={full} className="whitespace-nowrap text-sheen-fg-muted">
      <span aria-hidden>{relative}</span>
      <span className="sr-only">
        {relative}, {full}
      </span>
    </time>
  );
}

/** Props of {@link CurrencyCell}. A money amount, right-aligned digits (tabular figures) formatted with Intl for the locale. */
export type CurrencyCellProps = ComponentProps<typeof CurrencyCell>;

/** Props of {@link RelativeDateCell}. A date as relative text ("3 days ago", "in 2 hours") inside a `<time>`. */
export type RelativeDateCellProps = ComponentProps<typeof RelativeDateCell>;

/** Props of {@link Highlight}. Text with the part that matches a query wrapped in `<mark>`. */
export type HighlightProps = ComponentProps<typeof Highlight>;
