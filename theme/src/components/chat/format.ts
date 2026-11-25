import { formatBytes } from "../file-upload/file-utils";
import type { ChatLabels } from "./labels";
import type { ChatConversation, ChatDateInput, ChatMessage, ChatParticipant } from "./types";

/**
 * Date, time and preview helpers for the chat components. Everything goes through Intl with
 * the component's `locale`, so "5m", "Yesterday", weekdays and dates follow the language.
 */

export function toDate(value: ChatDateInput | undefined): Date | undefined {
  // `== null` also catches a null from untyped callers.
  if (value == null) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Milliseconds since the epoch of a date input, or 0 when it is missing or unreadable (handy as a sort key). Pure, safe to call on the server. */
export function toTime(value: ChatDateInput | undefined): number {
  return toDate(value)?.getTime() ?? 0;
}

/** Whole calendar days from `date` to `now` (0 = same day, 1 = yesterday). */
export function calendarDayDiff(date: Date, now: Date): number {
  const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b - a) / 86_400_000);
}

/** A string that is equal for two dates on the same local calendar day (used to group messages by day). Pure, safe to call on the server. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/* Intl objects are slow to build: cache them per locale + options. */
const cache = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat | Intl.NumberFormat>();

function dtf(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `d|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as Intl.DateTimeFormat | undefined;
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

function rtf(locale: string | undefined, options: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
  const key = `r|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as Intl.RelativeTimeFormat | undefined;
  if (!f) {
    f = new Intl.RelativeTimeFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

function nf(locale: string | undefined, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `n|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as Intl.NumberFormat | undefined;
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

/** First letter upper case, in the locale's rules ("yesterday" → "Yesterday"). */
function capitalize(text: string, locale: string | undefined) {
  return text ? text.charAt(0).toLocaleUpperCase(locale) + text.slice(1) : text;
}

/** "14:05" / "2:05 PM". */
export function formatTime(date: Date, locale: string | undefined) {
  return dtf(locale, { hour: "numeric", minute: "2-digit" }).format(date);
}

/** Full date and time for tooltips and message info: "Thu, 30 Oct 2026, 14:05". */
export function formatDateTime(date: Date, locale: string | undefined) {
  return dtf(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/**
 * The conversation list's compact time: "now", "5m", "14:05", "Yesterday", "Mon", "12 Mar",
 * "12/03/2025". Also returns a spoken version ("5 minutes ago", "yesterday at 14:05").
 */
export function formatListTime(
  date: Date,
  now: Date,
  locale: string | undefined,
  justNow: string,
): { short: string; long: string } {
  const seconds = (now.getTime() - date.getTime()) / 1000;
  const days = calendarDayDiff(date, now);
  if (seconds < 60 && seconds > -60)
    return { short: justNow, long: rtf(locale, { numeric: "auto" }).format(0, "second") };
  if (seconds < 3600 && days === 0) {
    const minutes = Math.max(1, Math.floor(seconds / 60));
    return {
      short: nf(locale, { style: "unit", unit: "minute", unitDisplay: "narrow" }).format(minutes),
      long: rtf(locale, { numeric: "auto" }).format(-minutes, "minute"),
    };
  }
  const time = formatTime(date, locale);
  if (days === 0) return { short: time, long: time };
  if (days === 1) {
    const yesterday = capitalize(rtf(locale, { numeric: "auto" }).format(-1, "day"), locale);
    return { short: yesterday, long: `${yesterday}, ${time}` };
  }
  if (days > 1 && days < 7) {
    return {
      short: dtf(locale, { weekday: "short" }).format(date),
      long: dtf(locale, { weekday: "long", hour: "numeric", minute: "2-digit" }).format(date),
    };
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  return {
    short: sameYear
      ? dtf(locale, { day: "numeric", month: "short" }).format(date)
      : dtf(locale, { dateStyle: "short" }).format(date),
    long: dtf(locale, { dateStyle: "long" }).format(date),
  };
}

/** Day separator: "Today", "Yesterday", "Monday", "12 March", "12 March 2024". */
export function formatDayLabel(date: Date, now: Date, locale: string | undefined) {
  const days = calendarDayDiff(date, now);
  if (days === 0 || days === 1) return capitalize(rtf(locale, { numeric: "auto" }).format(-days, "day"), locale);
  if (days > 1 && days < 7) return dtf(locale, { weekday: "long" }).format(date);
  const sameYear = date.getFullYear() === now.getFullYear();
  return dtf(
    locale,
    sameYear ? { weekday: "short", day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" },
  ).format(date);
}

/** "5m ago", "2h ago", "yesterday", "3 days ago", or a date further back. */
export function formatRelative(date: Date, now: Date, locale: string | undefined) {
  const seconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);
  const narrow = rtf(locale, { numeric: "auto", style: "narrow" });
  if (seconds < 60) return rtf(locale, { numeric: "auto" }).format(0, "second");
  if (seconds < 3600) return narrow.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86_400) return narrow.format(-Math.floor(seconds / 3600), "hour");
  const days = calendarDayDiff(date, now);
  if (days < 7) return rtf(locale, { numeric: "auto" }).format(-days, "day");
  return dtf(locale, { day: "numeric", month: "short" }).format(date);
}

/* ---------- Text direction ---------- */

const RTL_SCRIPT =
  /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Adlam}]/u;

/**
 * The direction of a message from its first letter (the Unicode "first strong character" rule),
 * so an English message in an Arabic interface reads left to right, time and all. Undefined
 * when there are no letters (emoji, numbers): it then follows the page.
 */
export function textDirection(text: string | undefined): "ltr" | "rtl" | undefined {
  const first = text?.match(/\p{L}/u)?.[0];
  if (!first) return undefined;
  return RTL_SCRIPT.test(first) ? "rtl" : "ltr";
}

/* ---------- People and previews ---------- */

/** Participants indexed by id, for quick lookups while rendering. */
export type ParticipantMap = Map<string, ChatParticipant>;

/** Builds a `ParticipantMap` from a participant list (an empty map when it is missing). Pure, safe to call on the server. */
export function toParticipantMap(participants: readonly ChatParticipant[] | undefined): ParticipantMap {
  return new Map((participants ?? []).map((p) => [p.id, p]));
}

/** Everyone in the conversation except you. */
export function otherMembers(
  conversation: ChatConversation,
  people: ParticipantMap,
  currentUserId: string,
): ChatParticipant[] {
  return conversation.participantIds
    .filter((id) => id !== currentUserId)
    .flatMap((id) => {
      const p = people.get(id);
      return p ? [p] : [];
    });
}

/** True when the conversation is a group chat rather than a one-to-one chat. Pure, safe to call on the server. */
export function isGroup(conversation: ChatConversation) {
  return conversation.kind === "group";
}

/** The name to show for a conversation: its own `title`, otherwise the other members' names joined with commas, otherwise its id. Pure, safe to call on the server. */
export function conversationTitle(
  conversation: ChatConversation,
  people: ParticipantMap,
  currentUserId: string,
): string {
  if (conversation.title) return conversation.title;
  const others = otherMembers(conversation, people, currentUserId);
  return others.map((p) => p.name).join(", ") || conversation.id;
}

/** First name for compact group mentions ("Riya is typing…"). */
export function firstName(name: string) {
  return name.split(/\s+/)[0] ?? name;
}

/** A message as one line of plain text (previews, quotes, announcements). */
export function messageSummary(
  message: Pick<ChatMessage, "text" | "attachments" | "deleted">,
  labels: ChatLabels,
  own = false,
): string {
  if (message.deleted) return own ? labels.deletedOwnMessage : labels.deletedMessage;
  const text = message.text?.trim();
  if (text) return text.replace(/\s+/g, " ");
  const files = message.attachments ?? [];
  if (files.length === 0) return "";
  const images = files.filter((f) => f.kind === "image").length;
  return images === files.length
    ? labels.attachmentSummary("image", images)
    : labels.attachmentSummary("file", files.length);
}

/** "2 KB", "1.4 MB" via Intl: the file upload component's formatter, so sizes read the same everywhere. */
export const formatFileSize = formatBytes;

/** Formats a count with the locale's digits and grouping (undefined `locale` = the runtime default); the Intl formatter is cached. Safe to call on the server. */
export function formatCount(count: number, locale: string | undefined) {
  return nf(locale, {}).format(count);
}
