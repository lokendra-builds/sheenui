import { cn } from "../../../lib/cn";
import { dayKey, formatDayLabel, toDate, toTime } from "../format";
import type { ChatMessage } from "../types";

/** One message of the log with its run position: first and last of its run, whether its name shows, and whether the unread divider sits above it. */
export type Row = { message: ChatMessage; first: boolean; last: boolean; showName: boolean; unreadBefore: boolean };
/** One day of the log: its key, the day label and its rows. */
export type Day = { key: string; label: string; rows: Row[] };

/**
 * The log's rows: messages grouped into days, and within a day into runs (the same sender within `RUN_GAP`, so the
 * avatar and name show once per run). The first unread message always starts a run, so its divider can sit above it.
 */
export function buildDays(
  shown: readonly ChatMessage[],
  {
    firstUnreadId,
    now,
    locale,
    group,
    currentUserId,
  }: {
    firstUnreadId: string | null | undefined;
    now: Date;
    locale: string | undefined;
    group: boolean;
    currentUserId: string;
  },
): Day[] {
  const out: Day[] = [];
  let day: Day | undefined;
  let prev: ChatMessage | undefined;
  let prevRow: Row | undefined;
  for (const m of shown) {
    const date = toDate(m.createdAt) ?? new Date(0);
    const key = dayKey(date);
    if (day?.key !== key) {
      day = { key, label: formatDayLabel(date, now, locale), rows: [] };
      out.push(day);
      prev = undefined;
    }
    const unreadBefore = m.id === firstUnreadId;
    const continues =
      !unreadBefore &&
      prev !== undefined &&
      prev.kind !== "system" &&
      m.kind !== "system" &&
      prev.senderId === m.senderId &&
      toTime(m.createdAt) - toTime(prev.createdAt) < RUN_GAP;
    if (continues && prevRow) prevRow.last = false;
    const row: Row = {
      message: m,
      first: !continues,
      last: true,
      showName: group && m.senderId !== currentUserId && !continues && m.kind !== "system",
      unreadBefore,
    };
    day.rows.push(row);
    prev = m;
    prevRow = row;
  }
  return out;
}

/** Classes of a day label in the log: the incoming-bubble lift, with no blur of its own (one blurred pill would float while scrolling). */
export const dayLabelClass = cn(
  "glass-1 [-webkit-backdrop-filter:none] [backdrop-filter:none] bg-(--sheen-chat-in-fill)",
  "rounded-full px-3 py-1 text-xs font-medium text-sheen-fg-muted shadow-sm",
);

/** Earlier messages added to the page per frame (see `prepend`). */
export const PREPEND_STEP = 10;

/** Messages further apart than this start a new run (avatar and name again). */
export const RUN_GAP = 5 * 60_000;
/** How close to the bottom (px) the log counts as scrolled to the end. */
export const BOTTOM_SLACK = 48;
