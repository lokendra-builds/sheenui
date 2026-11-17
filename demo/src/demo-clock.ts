import { useMemo, useSyncExternalStore } from "react";

/*
 * The demo site is prerendered at build time and then hydrated in the visitor's browser, and
 * React needs both renders to print the same text. So the demos never read the real clock,
 * the runtime locale or Math.random while rendering. They share one fixed "today", one locale
 * and seeded random data instead.
 *
 * The fixed instant is built from local-time parts, so every machine (the build host, a
 * visitor in another time zone) prints the same clock times and calendar dates.
 */

/** The demos' locale: dates, numbers and lists are formatted with it, whatever the browser's language is. */
export const DEMO_LOCALE = "en-US";

/** The demos' fixed "now": Saturday 7 Nov 2026, 12:00 (local time). */
export const DEMO_NOW = new Date(2026, 10, 7, 12, 0, 0, 0);

/** `DEMO_NOW` as milliseconds since the epoch. */
export const DEMO_NOW_MS = DEMO_NOW.getTime();

/** The same moment in UTC (7 Nov 2026, 12:00Z): for data that is formatted in UTC, whatever the viewer's zone. */
export const DEMO_NOW_UTC_MS = Date.UTC(2026, 10, 7, 12, 0, 0);

/** The demos' fixed "today" at midnight, for calendars and date pickers. */
export const DEMO_TODAY = new Date(2026, 10, 7);

/* ---------- A clock that starts at DEMO_NOW and then runs ---------- */

/*
 * Live demos (a chat that receives messages, a notification feed) still need time to pass.
 * This clock reads DEMO_NOW while the page hydrates and moves forward from there with real
 * elapsed time once a component subscribes, so "Just now" turns into "1m" the way it should.
 */
const TICK_MS = 15_000;
let startedAt = 0;
let current = DEMO_NOW_MS;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

/** The demo clock in milliseconds: `DEMO_NOW_MS` until the first subscriber, then running. */
export function demoNowMs(): number {
  return startedAt ? DEMO_NOW_MS + (performance.now() - startedAt) : DEMO_NOW_MS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    if (startedAt) current = Math.round(demoNowMs());
    startedAt ||= performance.now();
    timer = setInterval(() => {
      current = Math.round(demoNowMs());
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/**
 * The demo clock as a `Date`, refreshed every 15 seconds. Hydration sees `DEMO_NOW`; after
 * that it moves on. Pass it as the `now` prop of the chat and notification components.
 */
export function useDemoNow(): Date {
  const ms = useSyncExternalStore(
    subscribe,
    () => current,
    () => DEMO_NOW_MS,
  );
  return useMemo(() => new Date(ms), [ms]);
}
