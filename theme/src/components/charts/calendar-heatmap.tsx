"use client";

import { useDockedReadout } from "./chart-fit";
import type { ChartRoot } from "./chart-utils";
import { useMergedRef } from "../../lib/form";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ChartAnnouncer } from "./chart-parts";
import {
  chartFocusClass,
  clamp,
  enterEase,
  TOOLTIP_DOCK_SPACE,
  useElementWidth,
  type ChartColor,
  type ChartInstructions,
  resolveInstructions,
} from "./chart-utils";
import {
  ChartDockHint,
  ChartTip,
  ChartValueTable,
  defaultCompact,
  hueMix,
  MissingValue,
  SequentialLegend,
  useEntrance,
  useMarksEntrance,
  useScrollFade,
} from "./heatmap";
import { ChartFigure } from "./chart-figure";

/* ---------- Calendar maths (whole days, no time zones) ---------- */

const DAY_MS = 86_400_000;

/** Days since 1970-01-01 for a calendar date. Integer day numbers make DST and time zones irrelevant. */
function dayNumber(y: number, m: number, d: number) {
  return Math.floor(Date.UTC(y, m, d) / DAY_MS);
}

/** A calendar day from "YYYY-MM-DD" (or an ISO timestamp: its date part), a Date (its local date) or a timestamp. */
export function toDayNumber(input: string | number | Date): number | null {
  if (typeof input === "string") {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(input.trim());
    return m ? dayNumber(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : dayNumber(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The UTC Date for a day number (read it with timeZone: "UTC" formatters). */
const dateOf = (day: number) => new Date(day * DAY_MS);
/** 0 = Sunday ... 6 = Saturday. 1970-01-01 was a Thursday. */
const weekdayOf = (day: number) => (((day + 4) % 7) + 7) % 7;
/** "YYYY-MM-DD" for a day number. */
export function isoDate(day: number) {
  return dateOf(day).toISOString().slice(0, 10);
}

/** The same day of the month `delta` months away, clamped to that month's length (Mar 31 − 1 month = Feb 28). */
function addMonths(day: number, delta: number) {
  const d = dateOf(day);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + delta;
  const daysInTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return dayNumber(y, m, Math.min(d.getUTCDate(), daysInTarget));
}

/** Regions whose week starts on Sunday / Saturday (CLDR); everywhere else starts on Monday. */
const SUNDAY_FIRST = new Set(
  "AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW".split(
    " ",
  ),
);
const SATURDAY_FIRST = new Set("AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".split(" "));

type WeekInfoLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };

/** First day of the week for a locale (0 = Sunday), from Intl when the browser has week info. */
export function localeWeekStart(locale?: string): number {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as WeekInfoLocale;
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info && info.firstDay >= 1 && info.firstDay <= 7) return info.firstDay % 7;
    const region = loc.maximize().region ?? "";
    return SUNDAY_FIRST.has(region) ? 0 : SATURDAY_FIRST.has(region) ? 6 : 1;
  } catch {
    return 1;
  }
}

/** One day of a CalendarHeatmap: its date (a Date or ISO string) and a value. */
export type CalendarDatum = { date: string | Date; value: number };

type Range = { start: number; end: number };

/** A dependency-friendly key for a date prop (Dates compare by time, not identity). */
/** An optional date prop as its day number (null when absent or unparseable). */
const optDay = (d: string | Date | undefined) => (d === undefined ? null : toDayNumber(d));

function resolveRange(
  data: readonly CalendarDatum[],
  year: number | undefined,
  startDay: number | null,
  endDay: number | null,
): Range {
  if (year !== undefined && Number.isInteger(year))
    return { start: dayNumber(year, 0, 1), end: dayNumber(year, 11, 31) };
  let last = endDay;
  if (last === null) {
    for (const d of data) {
      const n = toDayNumber(d.date);
      if (n !== null && (last === null || n > last)) last = n;
    }
  }
  last ??= toDayNumber(new Date()) ?? 0;
  let first = startDay;
  first ??= last - 364;
  return first <= last ? { start: first, end: last } : { start: last, end: first };
}

/** Sum of the values per day inside the range (several entries on one day add up). */
function dailyTotals(data: readonly CalendarDatum[], range: Range) {
  const totals = new Map<number, number>();
  for (const d of data) {
    const n = toDayNumber(d.date);
    const v = typeof d.value === "number" && Number.isFinite(d.value) ? d.value : 0;
    if (n === null || n < range.start || n > range.end) continue;
    totals.set(n, (totals.get(n) ?? 0) + v);
  }
  return totals;
}

/** The last day that has happened: `today` (default: now), or no limit for null. */
function todayNumber(today: string | Date | null | undefined) {
  if (today === null) return Infinity;
  return toDayNumber(today ?? new Date()) ?? Infinity;
}

/* ---------- Component ---------- */

/**
 * Every string CalendarHeatmap speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type CalendarHeatmapLabels = {
  less: string;
  more: string;
  /** Appended to the accessible name: how to read the days. */
  instructions: ChartInstructions;
  roleDescription: string;
  /** Shown in the readout band of a narrow calendar while no day is being read. */
  hint: string;
  /** Read for a day that hasn't happened yet (never as 0). */
  future: string;
};

/**
 * The built-in English strings of CalendarHeatmap; spread it into your own `labels` and change what
 * you need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultCalendarHeatmapLabels: CalendarHeatmapLabels = {
  less: "Less",
  more: "More",
  instructions: "Use the arrow keys to move by day or week; Page Up and Page Down move by month.",
  roleDescription: "calendar heatmap",
  hint: "Tap or hover a day for its value",
  future: "No data yet",
};

/**
 * Props of CalendarHeatmap. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type CalendarHeatmapProps = {
  /** One entry per day: { date: "2026-03-04", value: 12 }. Days without an entry count as 0. */
  data: readonly CalendarDatum[];
  /** Show one calendar year (Jan 1 – Dec 31). Otherwise `start` – `end`. */
  year?: number;
  /** Sets the first day shown. Default: 364 days before `end`. */
  start?: string | Date;
  /** Last day shown, the right edge of the grid (a date string or a Date); days after it are left out. Default: the latest date in `data` (or today). */
  end?: string | Date;
  /**
   * Days after this one haven't happened: they're drawn as empty outlines and read "No data yet",
   * never as zero (unless `data` has a value for them). Default: the current date; null = no limit.
   */
  today?: string | Date | null;
  /** Sets the first day of the week, 0 = Sunday. Default: from `locale` (Monday in most of the world). */
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Locale for month / weekday names, the default week start and the default number format. Default: the browser's (numbers: "en"). */
  locale?: string;
  /** Sets the hue of the levels: a palette slot, 1–8. */
  color?: ChartColor;
  /** Sets the number of non-zero levels. */
  levels?: number;
  /** Values where levels 2, 3, ... start. Default: equal steps up to the busiest day. */
  thresholds?: readonly number[];
  /** Sets the cell size in px. Default fits the width (11–18); narrower screens scroll sideways. */
  cellSize?: number;
  /** Formats a day's value for the tooltips, announcements and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** What a value counts, e.g. "contributions". Shown in the tooltip and announcements. */
  valueLabel?: string;
  /** Show the Less / More legend. */
  legend?: boolean;
  /** Called with a day on click, Enter or Space. */
  onDayClick?: (day: { date: string; value: number }) => void;
  /** Overrides for the calendar's built-in English strings. */
  labels?: Partial<CalendarHeatmapLabels>;
  /** Accessible name of the chart; describe what it shows. */
  "aria-label": string;
  className?: string;
};

const MONTH_ROW = 20;
/** Room under the last row, so descenders of the bottom weekday name never clip. */
const BOTTOM_PAD = 4;
/** Level 0 ("nothing that day"): an opaque step off the chart surface, so it never takes on the backdrop's tint. */
const LEVEL_0 = "color-mix(in oklab, var(--sheen-fg-subtle) 27%, var(--sheen-chart-surface))";
/** Outline of a day that hasn't happened yet. */
const FUTURE_STROKE = "color-mix(in oklab, var(--sheen-fg-subtle) 55%, var(--sheen-chart-surface))";

/**
 * A GitHub-style contribution calendar: one column per week, one row per weekday, a cell per day
 * coloured by level. The week starts where the locale's week starts.
 *
 * - Hover or tap a day for its tooltip. Focus the calendar and use the arrow keys (up / down a day,
 *   left / right a week), Page Up / Page Down (a month), Home / End (first / last day).
 * - Days that haven't happened yet are outlined, never painted as zero.
 * - On narrow screens the weeks scroll sideways inside the card (the weekday names stay put),
 *   opening on the latest week.
 * - The days bloom in, left to right, the first time it scrolls into view; new data cross-fades
 *   as one layer. Instant with reduced motion.
 *
 * @example
 * ```tsx
 * import { CalendarHeatmap } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CalendarHeatmap
 *       data={[{ date: "2026-03-02", value: 4 }, { date: "2026-03-03", value: 9 }]}
 *       year={2026}
 *       valueLabel="contributions"
 *       aria-label="Contributions in 2026"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/calendar-heatmap
 */
export function CalendarHeatmap({
  data,
  year,
  start,
  end,
  today,
  weekStart: weekStartProp,
  locale,
  color = 1,
  levels = 4,
  thresholds: thresholdsProp,
  cellSize,
  format: formatProp,
  valueLabel = "",
  legend = true,
  onDayClick,
  labels: labelOverrides,
  "aria-label": ariaLabel,
  className,
  ref: outerRef,
  ...rest
}: ChartRoot<CalendarHeatmapProps>) {
  const labels = { ...defaultCalendarHeatmapLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const [measureRef, width] = useElementWidth<HTMLDivElement>();
  const play = useEntrance(rootRef, reduced);
  const [active, setActive] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const weekStart = weekStartProp ?? localeWeekStart(locale);
  const startDay = optDay(start);
  const endDay = optDay(end);
  const range = useMemo(() => resolveRange(data, year, startDay, endDay), [data, year, startDay, endDay]);
  const totals = useMemo(() => dailyTotals(data, range), [data, range]);
  const todayN = todayNumber(today);
  const isFuture = useCallback((day: number) => day > todayN && !totals.has(day), [todayN, totals]);
  /** Where the keyboard starts: the latest day that has happened. */
  const lastPast = clamp(Math.min(range.end, todayN), range.start, range.end);

  // Levels: 0 = nothing that day, 1..L = equal steps up to the busiest day (or the given thresholds).
  const L = Math.max(1, Math.round(levels));
  const max = useMemo(() => Array.from(totals.values()).reduce((m, v) => Math.max(m, v), 0), [totals]);
  // The given thresholds are compared by content, so a fresh array each render does not rebuild the grid.
  const thresholdsKey = thresholdsProp?.join(",");
  const thresholds = useMemo(
    () =>
      thresholdsKey !== undefined
        ? thresholdsKey === ""
          ? []
          : thresholdsKey.split(",").map(Number)
        : Array.from({ length: L - 1 }, (_, i) => (max * (i + 1)) / L),
    [thresholdsKey, L, max],
  );
  const levelOf = useCallback(
    (v: number) => (v <= 0 ? 0 : Math.min(L, 1 + thresholds.filter((t) => v >= t).length)),
    [L, thresholds],
  );
  const levelColors = useMemo(
    () => [LEVEL_0, ...Array.from({ length: L }, (_, i) => hueMix(color, L === 1 ? 1 : 0.3 + (0.7 * i) / (L - 1)))],
    [L, color],
  );

  // Grid: column 0 holds the week that contains the first day.
  const firstCell = range.start - ((weekdayOf(range.start) - weekStart + 7) % 7);
  const weeks = Math.floor((range.end - firstCell) / 7) + 1;
  const rowOf = useCallback((day: number) => (weekdayOf(day) - weekStart + 7) % 7, [weekStart]);
  const colOf = useCallback((day: number) => Math.floor((day - firstCell) / 7), [firstCell]);

  const fmt = useMemo(() => {
    const opts = { timeZone: "UTC" } as const;
    return {
      month: new Intl.DateTimeFormat(locale, { ...opts, month: "short" }),
      weekday: new Intl.DateTimeFormat(locale, { ...opts, weekday: "short" }),
      day: new Intl.DateTimeFormat(locale, {
        ...opts,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }, [locale]);

  // Geometry: the weekday column, then weeks at a size that fits (or scrolls).
  const weekdayW = Math.max(
    24,
    Math.ceil(
      Array.from({ length: 7 }, (_, w) => fmt.weekday.format(dateOf(3 + w)).length).reduce(
        (a, b) => Math.max(a, b),
        0,
      ) * 6.2,
    ) + 10,
  );
  const docked = useDockedReadout(width);
  const dock = docked ? TOOLTIP_DOCK_SPACE : 0;
  const fit = Math.floor((width - weekdayW) / Math.max(1, weeks));
  const size = cellSize ?? clamp(fit, 11, 18);
  const gap = size >= 14 ? 3 : 2;
  const gridW = weeks * size;
  const plotH = MONTH_ROW + 7 * size + BOTTOM_PAD;

  // Month labels at the first full week of each month, dropped when they would collide.
  const monthLabels = useMemo(() => {
    const out: { col: number; text: string }[] = [];
    const d0 = dateOf(range.start);
    let y = d0.getUTCFullYear();
    let m = d0.getUTCMonth();
    for (let guard = 0; guard < 400; guard++) {
      const firstOfMonth = dayNumber(y, m, 1);
      if (firstOfMonth > range.end) break;
      const day = Math.max(firstOfMonth, range.start);
      // A month that starts late in a week is labelled from the next column.
      const col = colOf(day) + (rowOf(day) > 3 ? 1 : 0);
      if (col < weeks) out.push({ col, text: fmt.month.format(dateOf(firstOfMonth)) });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    const kept: typeof out = [];
    for (const label of out) {
      const prev = kept[kept.length - 1];
      const need = (prev ? prev.text.length * 6.4 + 8 : 0) / size;
      if (prev && label.col - prev.col < need) {
        // Keep the later month: a partial first month gives way to the full one after it.
        if (prev === kept[0] && prev.col === 0) kept[kept.length - 1] = label;
        continue;
      }
      kept.push(label);
    }
    return kept;
  }, [range, size, weeks, fmt, colOf, rowOf]);

  // Weekday names (day 3 = Sunday 1970-01-04). Every row when cells are tall enough, otherwise
  // every other row (GitHub style) so they never crowd.
  const weekdayNames = useMemo(
    () => Array.from({ length: 7 }, (_, r) => fmt.weekday.format(dateOf(3 + ((weekStart + r) % 7)))),
    [fmt, weekStart],
  );

  const days = useMemo(() => {
    const out: number[] = [];
    for (let d = range.start; d <= range.end; d++) out.push(d);
    return out;
  }, [range]);

  const valueOf = useCallback((day: number) => totals.get(day) ?? 0, [totals]);

  // Every day as a plain rect, in one layer. The entrance reads data-delay; a data change (or a
  // new week start, which moves every day) re-keys the layer, which fades in over the old one.
  const version = useMemo(
    () =>
      `${weekStart}:${range.start}#${levelColors.join("|")}#${days.map((d) => (isFuture(d) ? "f" : levelOf(valueOf(d)))).join("")}`,
    [days, isFuture, levelOf, valueOf, levelColors, weekStart, range.start],
  );
  const cells = useMemo(
    () =>
      days.map((day) => {
        const col = colOf(day);
        const row = rowOf(day);
        const x = col * size + gap / 2;
        const y = row * size + gap / 2;
        const s = size - gap;
        const rx = Math.min(3, s / 4);
        const delay = Math.min(col * 0.014 + row * 0.012, 0.9);
        const origin = { transformBox: "fill-box", transformOrigin: "center" } as const;
        if (isFuture(day)) {
          return (
            <rect
              key={day}
              data-delay={delay}
              x={x + 0.5}
              y={y + 0.5}
              width={Math.max(0, s - 1)}
              height={Math.max(0, s - 1)}
              rx={rx}
              fill="none"
              strokeWidth={1}
              style={{ stroke: FUTURE_STROKE, ...origin }}
              className="forced-colors:stroke-[GrayText]"
            />
          );
        }
        const level = levelOf(valueOf(day));
        return (
          <rect
            key={day}
            data-delay={delay}
            x={x}
            y={y}
            width={s}
            height={s}
            rx={rx}
            strokeWidth={level === 0 ? 0 : 0.5}
            style={{ fill: levelColors[level], ...origin }}
            className="forced-colors:stroke-[CanvasText]"
          />
        );
      }),
    [days, isFuture, levelOf, valueOf, levelColors, colOf, rowOf, size, gap],
  );

  useMarksEntrance(layerRef, play && width > 0, reduced, 0.3);
  useScrollFade(scrollRef, gridRef, weekdayW, width > 0 ? gridW : 0);

  // Open on the latest week that has happened when the calendar scrolls sideways.
  const hasWidth = width > 0;
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const view = scroller.clientWidth - weekdayW;
    if (gridW <= view) return;
    const target = (colOf(lastPast) + 1) * size + 16 - view;
    scroller.scrollLeft = clamp(target, 0, scroller.scrollWidth - scroller.clientWidth);
    setScrollLeft(scroller.scrollLeft);
  }, [hasWidth, range.start, range.end, size, weekdayW, gridW, lastPast, colOf]);

  const act = active !== null && active >= range.start && active <= range.end ? active : null;

  // Keep the active day visible inside the scroller (the sticky weekday names cover its start).
  useEffect(() => {
    const scroller = scrollRef.current;
    if (act === null || !scroller) return;
    const view = scroller.clientWidth - weekdayW;
    const left = colOf(act) * size;
    if (left < scroller.scrollLeft) scroller.scrollLeft = Math.max(0, left - 8);
    else if (left + size > scroller.scrollLeft + view) scroller.scrollLeft = left + size - view + 8;
  }, [act, size, weekdayW, colOf]);
  useLayoutEffect(() => {
    if (act !== null && scrollRef.current) setScrollLeft(scrollRef.current.scrollLeft);
  }, [act]);

  const dayInfo = (day: number) => ({ date: isoDate(day), value: valueOf(day) });
  const readout = (day: number) => {
    const title = fmt.day.format(dateOf(day));
    if (isFuture(day)) return { title, value: labels.future, text: `${title}: ${labels.future}`, future: true };
    const v = valueOf(day);
    return {
      title,
      value: format(v),
      text: `${title}: ${format(v)}${valueLabel ? ` ${valueLabel}` : ""}`,
      future: false,
    };
  };

  function onKeyDown(event: KeyboardEvent) {
    const cur = act ?? lastPast;
    let next: number | null;
    switch (event.key) {
      case "ArrowDown":
        next = act === null ? cur : cur + 1;
        break;
      case "ArrowUp":
        next = act === null ? cur : cur - 1;
        break;
      case "ArrowRight":
        next = act === null ? cur : cur + 7;
        break;
      case "ArrowLeft":
        next = act === null ? cur : cur - 7;
        break;
      case "PageDown":
        next = act === null ? cur : addMonths(cur, 1);
        break;
      case "PageUp":
        next = act === null ? cur : addMonths(cur, -1);
        break;
      case "Home":
        next = range.start;
        break;
      case "End":
        next = range.end;
        break;
      case "Escape":
        if (act === null) return;
        next = null;
        break;
      case "Enter":
      case " ":
        if (act === null || !onDayClick) return;
        event.preventDefault();
        onDayClick(dayInfo(act));
        return;
      default:
        return;
    }
    event.preventDefault();
    setActive(next === null ? null : clamp(next, range.start, range.end));
  }

  function dayFromPointer(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const c = Math.floor((event.clientX - rect.left) / size);
    const r = Math.floor((event.clientY - rect.top - MONTH_ROW) / size);
    if (c < 0 || c >= weeks || r < 0 || r > 6) return null;
    const day = firstCell + c * 7 + r;
    return day >= range.start && day <= range.end ? day : null;
  }

  let tooltip: ReactNode = null;
  const read = act === null ? null : readout(act);
  if (act !== null && read) {
    tooltip = (
      <ChartTip
        title={read.title}
        rows={[
          read.future
            ? { label: "", value: read.value, color: "transparent" }
            : {
                label: valueLabel,
                value: read.value,
                color: levelColors[levelOf(valueOf(act))] ?? "transparent",
                kind: "rect",
              },
        ]}
        anchor={{
          x: weekdayW + colOf(act) * size - scrollLeft,
          y: dock + MONTH_ROW + rowOf(act) * size,
          w: size,
          h: size,
        }}
        bounds={{ w: width, h: dock + plotH }}
        docked={docked}
      />
    );
  }

  return (
    <div {...rest} ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      <div ref={measureRef} className="relative w-full" style={{ paddingTop: dock }}>
        {width > 0 && (
          <>
            {/* The scroller is the focusable chart: arrow keys read days (and keep them in view). */}
            {}
            <ChartFigure
              as="div"
              ref={scrollRef}
              roleDescription={labels.roleDescription}
              label={ariaLabel}
              description={resolveInstructions(labels.instructions)}

              tabIndex={0}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
              onScroll={(e) => {
                // The offset only places the active day's tooltip (re-read when a day becomes active): no re-render per scroll event otherwise.
                if (active !== null) setScrollLeft(e.currentTarget.scrollLeft);
              }}
              className={cn(
                "overflow-x-auto overscroll-x-contain rounded-sheen-sm [scrollbar-width:thin]",
                chartFocusClass,
              )}
            >
              <div className="flex w-max min-w-full">
                {/* Weekday names stay put (sticky) while the weeks scroll under them. */}
                <svg aria-hidden width={weekdayW} height={plotH} className="sticky left-0 z-1 block shrink-0">
                  {weekdayNames.map((name, r) =>
                    size >= 15 || r % 2 === (weekStart === 0 ? 1 : 0) ? (
                      <text
                        key={r}
                        x={0}
                        y={MONTH_ROW + r * size + size / 2}
                        dy="0.32em"
                        className={cn(
                          "text-2xs",
                          act !== null && rowOf(act) === r ? "fill-sheen-fg font-semibold" : "fill-sheen-fg-muted",
                        )}
                      >
                        {name}
                      </text>
                    ) : null,
                  )}
                </svg>

                <svg
                  ref={gridRef}
                  aria-hidden
                  width={gridW}
                  height={plotH}
                  className={cn("block shrink-0", onDayClick && "cursor-pointer")}
                  onPointerMove={(e) => e.pointerType === "mouse" && setActive(dayFromPointer(e))}
                  onPointerDown={(e) => setActive(dayFromPointer(e))}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                  onClick={(e) => {
                    const day = onDayClick ? dayFromPointer(e) : null;
                    if (day !== null) onDayClick?.(dayInfo(day));
                  }}
                >
                  {monthLabels.map((label) => (
                    <text
                      key={`${label.col}-${label.text}`}
                      x={label.col * size}
                      y={MONTH_ROW - 8}
                      className="fill-sheen-fg-muted text-2xs"
                    >
                      {label.text}
                    </text>
                  ))}

                  <g
                    ref={layerRef}
                    transform={`translate(0,${MONTH_ROW})`}
                    opacity={play ? 1 : 0}
                    className="forced-color-adjust-none"
                  >
                    <AnimatePresence initial={false}>
                      <motion.g
                        key={version}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0, delay: reduced ? 0 : duration.base } }}
                        transition={{ duration: reduced ? 0 : duration.base, ease: enterEase }}
                      >
                        {cells}
                      </motion.g>
                    </AnimatePresence>
                    {act !== null && (
                      <rect
                        x={colOf(act) * size}
                        y={rowOf(act) * size}
                        width={size}
                        height={size}
                        rx={Math.min(4, size / 3)}
                        fill="none"
                        strokeWidth={2}
                        className="pointer-events-none stroke-sheen-fg forced-colors:stroke-[Highlight]"
                      />
                    )}
                  </g>
                </svg>
              </div>
            </ChartFigure>
            {tooltip ?? (docked && <ChartDockHint>{labels.hint}</ChartDockHint>)}
          </>
        )}
      </div>

      {legend && width > 0 && (
        <SequentialLegend
          className="justify-end"
          style={{ maxWidth: weekdayW + gridW }}
          min={0}
          max={max}
          swatches={levelColors}
          lowLabel={labels.less}
          highLabel={labels.more}
          marker={act === null || read?.future ? null : levelOf(valueOf(act)) / L}
        />
      )}
      <ChartAnnouncer text={read?.text ?? ""} />
    </div>
  );
}

/* ---------- Table view ---------- */

/** The text of `CalendarHeatmapTable` that is not a day number: two column headers and the stand-ins for cells without a value. */
export type CalendarHeatmapTableLabels = {
  /** Header of the month column. */
  month: string;
  /** Header of the total column. */
  total: string;
  /** Read for days that haven't happened yet. */
  future: string;
  /** Read for cells that aren't days of the range (Feb 30, days before the start...). */
  notApplicable: string;
};

/** English defaults of {@link CalendarHeatmapTableLabels}. */
export const defaultCalendarHeatmapTableLabels: CalendarHeatmapTableLabels = {
  month: "Month",
  total: "Total",
  future: defaultCalendarHeatmapLabels.future,
  notApplicable: "Not applicable",
};

/**
 * Props of CalendarHeatmapTable, the table view of the chart: the chart's data and formatting props
 * plus a hidden `caption` for screen readers.
 */
export type CalendarHeatmapTableProps = Pick<
  CalendarHeatmapProps,
  "data" | "year" | "start" | "end" | "today" | "locale" | "format"
> & {
  /** Visually hidden caption that names the table. */
  caption?: string;
  /** Strings of the table: `month` / `total` headers and the `future` / `notApplicable` cell text. Merged over {@link defaultCalendarHeatmapTableLabels}. */
  labels?: Partial<CalendarHeatmapTableLabels>;
  /** Shown when the range has no months (never, in practice). */
  emptyState?: ReactNode;
};

/**
 * Every day's value as a month × day-of-month table (with a total per month). Wide, so it
 * scrolls inside its own focusable region. Cells without a day read "Not applicable"
 * (`labels.notApplicable`), days still to come read "No data yet" (`labels.future`); `labels.month`
 * ("Month") and `labels.total` ("Total") are the column headers.
 *
 * @example
 * ```tsx
 * import { CalendarHeatmapTable } from "@sheenui/theme";
 *
 * const days = [
 *   { date: "2026-01-02", value: 3 },
 *   { date: "2026-01-03", value: 8 },
 *   { date: "2026-02-14", value: 5 },
 * ];
 *
 * export function Example() {
 *   return (
 *     <CalendarHeatmapTable data={days} year={2026} caption="Contributions table" />
 *   );
 * }
 * ```
 *
 * @see /charts/calendar-heatmap
 */
export function CalendarHeatmapTable({
  data,
  year,
  start,
  end,
  today,
  locale,
  format: formatProp,
  caption,
  labels,
  emptyState,
}: CalendarHeatmapTableProps) {
  const {
    month: monthLabel,
    total: totalLabel,
    future: futureLabel,
    notApplicable: notApplicableLabel,
  } = { ...defaultCalendarHeatmapTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const range = resolveRange(data, year, optDay(start), optDay(end));
  const totals = dailyTotals(data, range);
  const todayN = todayNumber(today);
  const monthFmt = new Intl.DateTimeFormat(locale, { timeZone: "UTC", month: "short", year: "numeric" });
  const rows: ReactNode[][] = [];
  const d0 = dateOf(range.start);
  let y = d0.getUTCFullYear();
  let m = d0.getUTCMonth();
  for (let guard = 0; guard < 400 && dayNumber(y, m, 1) <= range.end; guard++) {
    const cells: ReactNode[] = [monthFmt.format(dateOf(dayNumber(y, m, 1)))];
    let sum = 0;
    let past = 0;
    for (let d = 1; d <= 31; d++) {
      const n = dayNumber(y, m, d);
      const inMonth = dateOf(n).getUTCMonth() === m;
      if (!inMonth || n < range.start || n > range.end) {
        cells.push(<MissingValue label={notApplicableLabel} />);
        continue;
      }
      if (n > todayN && !totals.has(n)) {
        cells.push(<MissingValue label={futureLabel} />);
        continue;
      }
      const v = totals.get(n) ?? 0;
      sum += v;
      past++;
      cells.push(format(v));
    }
    cells.push(
      past === 0 ? <MissingValue label={futureLabel} /> : <strong className="font-semibold">{format(sum)}</strong>,
    );
    rows.push(cells);
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: monthLabel },
        ...Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1) })),
        { label: totalLabel },
      ]}
      rows={rows}
    />
  );
}
