"use client";

import { useEffect, useMemo, useState } from "react";
import { useControllable } from "../../hooks/use-controllable";

import { type NotificationItem, type NotificationCenterLabels } from "./model";

/* ---------- Dates ---------- */

/** One day in milliseconds. @internal */
export const DAY = 86_400_000;

/** The item's time as a Date, or null when it can't be read (one bad API value must not break the inbox). */
export function toDate(time: NotificationItem["time"]): Date | null {
  const date = time instanceof Date ? time : new Date(time);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Newest first; undated items last, in their original order. */
export function byNewest(dates: Map<string, Date | null>) {
  return (a: NotificationItem, b: NotificationItem) => {
    const ta = dates.get(a.id)?.getTime();
    const tb = dates.get(b.id)?.getTime();
    if (ta === undefined || tb === undefined) return ta === tb ? 0 : ta === undefined ? 1 : -1;
    return tb - ta;
  };
}

/** The local midnight of a date. @internal */
export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days between `date` and `now` (0 = today). Rounded, so DST shifts don't matter. */
export function daysAgo(date: Date, now: Date) {
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY);
}

/** Builds the memoised date and number formatters of a locale. @internal */
export function useFormatters(locale: string | undefined) {
  return useMemo(
    () => ({
      relative: new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "narrow" }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      day: new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }),
      dayYear: new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", year: "numeric" }),
      clock: new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }),
      full: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }),
    }),
    [locale],
  );
}

/** The formatter set that `useFormatters` returns. @internal */
export type Formatters = ReturnType<typeof useFormatters>;

/** The group heading of a date: Today, Yesterday, a weekday or a full date. @internal */
export function groupLabel(date: Date | null, now: Date, f: Formatters, L: NotificationCenterLabels) {
  if (!date) return L.undated;
  const days = daysAgo(date, now);
  if (days <= 0) return L.today;
  if (days === 1) return L.yesterday;
  if (days < 7) return f.weekday.format(date);
  return (date.getFullYear() === now.getFullYear() ? f.day : f.dayYear).format(date);
}

/** The relative or absolute timestamp text of a notification. @internal */
export function timeLabel(date: Date, now: Date, f: Formatters, L: NotificationCenterLabels) {
  if (daysAgo(date, now) > 0) return f.clock.format(date);
  const seconds = (now.getTime() - date.getTime()) / 1000;
  if (seconds < 60) return L.justNow;
  if (seconds < 3600) return f.relative.format(-Math.floor(seconds / 60), "minute");
  return f.relative.format(-Math.floor(seconds / 3600), "hour");
}

/**
 * Turns the blur of glass nested inside `root` off (true) or back on (false): .glass-* and
 * anything marked data-sheen-blur. A fading element must never contain a backdrop-filter, so
 * this runs while the panel around them fades.
 */
export function settleNestedGlass(root: HTMLElement | null, on: boolean) {
  root?.querySelectorAll<HTMLElement>(".glass-1, .glass-2, .glass-3, [data-sheen-blur]").forEach((el) => {
    if (on) {
      el.style.setProperty("backdrop-filter", "none");
      el.style.setProperty("-webkit-backdrop-filter", "none");
    } else {
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    }
  });
}

/** The current time, refreshed every 30s so "5m ago" keeps up. A `fixed` time (prerendering, tests) is used as is. */
export function useNow(fixed?: Date) {
  const [now, setNow] = useState(() => new Date());
  const fixedTime = fixed?.getTime();
  useEffect(() => {
    if (fixedTime !== undefined) return;
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [fixedTime]);
  return useMemo(() => (fixedTime === undefined ? now : new Date(fixedTime)), [fixedTime, now]);
}

/* ---------- State ---------- */

/** A state updater that takes the previous notification list and returns the next. @internal */
export type Update = (fn: (previous: NotificationItem[]) => NotificationItem[]) => void;
/** A stable empty notification list, so a default never changes identity. @internal */
export const NO_NOTIFICATIONS: NotificationItem[] = [];

/** Controlled or uncontrolled list, with functional updates that never read a stale list. */
export function useNotificationList(
  value: NotificationItem[] | undefined,
  defaultValue: NotificationItem[] | undefined,
  onChange?: (next: NotificationItem[]) => void,
) {
  const [items, update] = useControllable<NotificationItem[]>(value, defaultValue ?? NO_NOTIFICATIONS, onChange);
  return [items, update as Update] as const;
}

/** True when a notification mentions the user. @internal */
export const isMention = (item: NotificationItem) => item.mention ?? item.kind === "mention";
