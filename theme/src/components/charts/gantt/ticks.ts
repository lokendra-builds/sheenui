import { DAY_MS, dateOf, monthStart, weekday, ymd } from "./model";
import type { Ticks } from "./layers";
import type { GanttScale } from "./types";

/** The `Intl.DateTimeFormat`s of the header tiers, in the chart's locale (English when it is unknown). @internal */
export function ganttFormats(locale: string | undefined) {
  const make = (o: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat(locale, o);
    } catch {
      return new Intl.DateTimeFormat("en", o);
    }
  };
  return {
    day: make({ day: "numeric" }),
    dayMonth: make({ day: "numeric", month: "short" }),
    monthShort: make({ month: "short" }),
    monthYear: make({ month: "long", year: "numeric" }),
    monthYearShort: make({ month: "short", year: "numeric" }),
    year: make({ year: "numeric" }),
    full: make({ day: "numeric", month: "short", year: "numeric" }),
  };
}

/**
 * The two header tiers of the timeline: months (or years at month zoom) on top, days, weeks or months
 * below, each as a `[a, b)` span of days with its label.
 * @internal
 */
export function buildTicks(
  rangeStart: number,
  rangeEnd: number,
  scale: GanttScale,
  fmt: ReturnType<typeof ganttFormats>,
  weekStart: number,
): Ticks {
  const top: Ticks["top"] = [];
  const bottom: Ticks["bottom"] = [];
  // Top tier: months (day / week zoom) or years (month zoom).
  let d = rangeStart;
  while (d < rangeEnd) {
    const { y, m } = ymd(d);
    if (scale === "month") {
      const next = Math.round(Date.UTC(y + 1, 0, 1) / DAY_MS);
      top.push({
        a: d,
        b: Math.min(next, rangeEnd),
        label: fmt.year.format(dateOf(d)),
        short: fmt.year.format(dateOf(d)),
      });
      d = next;
    } else {
      const next = monthStart(y, m + 1);
      top.push({
        a: d,
        b: Math.min(next, rangeEnd),
        label: fmt.monthYear.format(dateOf(d)),
        short: fmt.monthYearShort.format(dateOf(d)),
      });
      d = next;
    }
  }
  if (scale === "day") {
    for (let day = rangeStart; day < rangeEnd; day++) {
      const wd = weekday(day);
      bottom.push({ a: day, b: day + 1, label: fmt.day.format(dateOf(day)), weekend: wd === 0 || wd === 6 });
    }
  } else if (scale === "week") {
    let w = rangeStart - ((weekday(rangeStart) - weekStart + 7) % 7);
    while (w < rangeEnd) {
      bottom.push({
        a: Math.max(w, rangeStart),
        b: Math.min(w + 7, rangeEnd),
        label: fmt.dayMonth.format(dateOf(w)),
      });
      w += 7;
    }
  } else {
    let m = rangeStart;
    while (m < rangeEnd) {
      const { y, m: mo } = ymd(m);
      const next = monthStart(y, mo + 1);
      bottom.push({ a: m, b: Math.min(next, rangeEnd), label: fmt.monthShort.format(dateOf(m)) });
      m = next;
    }
  }
  return { top, bottom };
}
