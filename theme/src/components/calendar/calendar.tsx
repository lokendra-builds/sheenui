"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, type Variants } from "motion/react";

import { cn } from "../../lib/cn";
import { groupBlur, joinIds, useFocusProxyRef, useMergedRef } from "../../lib/form";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  dayKey,
  fromDayKey,
  endOfMonth,
  endOfWeek,
  formatDate,
  getMonthGrid,
  getWeekStart,
  getWeekdayNames,
  isSameDay,
  isWithinRange,
  monthKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  type DateRange,
  type Weekday,
} from "./date-utils";
import { useControllable } from "../../hooks/use-controllable";
import { isRtlAt, useResolvedDirection } from "../../hooks/use-direction";

import { defaultCalendarLabels, type CalendarProps, type View, EMPTY_RANGE, RANGE_SCAN_DAYS } from "./parts/model";
import { type DayState, MonthGrid, MonthYearPicker, NavButton, CaptionButton } from "./parts/grid";

export {
  type CalendarLabels,
  defaultCalendarLabels,
  type CalendarSingleProps,
  type CalendarRangeProps,
  type CalendarProps,
} from "./parts/model";
/**
 * A locale-aware month grid for picking one date or a date range. Week start, month and weekday
 * names and even the digits come from Intl (`locale="ar-EG"` starts on Saturday in Arabic
 * numerals). The caption opens a month grid and then a year grid for long jumps.
 *
 * Props: see {@link CalendarProps}. Common: `locale`, `today` (pass a fixed date for prerender
 * and tests), `weekStartsOn`, `min`, `max`, `isDateDisabled`, `month` / `defaultMonth` /
 * `onMonthChange`, `numberOfMonths` (1), `showOutsideDays`, `fixedWeeks` (true), `fluid`
 * (false), `autoFocus` (false), `labels`, `className`. Single mode: `value`, `defaultValue`,
 * `onValueChange`. Range mode (`mode="range"`): the same with `{ start, end }`, plus
 * `allowUnavailableInRange`.
 *
 * Keyboard: WAI-ARIA date grid: arrows move by day or week, Home / End go to the week's edges, Page Up / Down change month, Shift + Page Up / Down change year. One day is in the tab order (roving tabindex); right-to-left flips Left and Right. Enter or Space selects.
 * Accessibility: A `role="grid"` per month with named days (date, today, selected, range start and end, unavailable); unavailable days stay focusable but cannot be selected. A polite live region announces month changes. Selection never relies on colour alone.
 * Glass: Flat cells on the parent surface; the selected-day pill is a gradient with no blur.
 * Motion: Months slide in the direction of travel, the selected pill glides between days and the month and year grids zoom in. Reduced motion cross-fades or jumps instead.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Calendar } from "@sheenui/theme";
 *
 * export function Picker() {
 *   const [date, setDate] = useState<Date | null>(null);
 *   return <Calendar value={date} onValueChange={setDate} min={new Date()} aria-label="Pick a date" />;
 * }
 * ```
 *
 * @see /forms/calendar
 */
export function Calendar(props: CalendarProps) {
  const {
    locale,
    today: todayProp,
    weekStartsOn,
    min: minProp,
    max: maxProp,
    isDateDisabled,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    showOutsideDays,
    fixedWeeks = true,
    fluid = false,
    autoFocus = false,
    "aria-label": ariaLabel,
    labels: labelsProp,
    className,
    name,
    ref,
    onBlur,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  } = props;
  const labels = { ...defaultCalendarLabels, ...labelsProp };
  const range = props.mode === "range";
  const monthCount = Math.max(1, Math.floor(numberOfMonths));
  const outsideDays = showOutsideDays ?? monthCount === 1;
  const reduced = useSheenReducedMotion();
  const id = useId();

  const min = minProp ? startOfDay(minProp) : null;
  const max = maxProp ? startOfDay(maxProp) : null;
  const localeWeekStart = useMemo(() => getWeekStart(locale), [locale]);
  const weekStart: Weekday = weekStartsOn ?? localeWeekStart;
  const today = startOfDay(todayProp ?? new Date());

  // ---- value ----
  const [single, setSingle] = useControllable<Date | null>(
    range ? undefined : props.value,
    () => (range ? null : (props.defaultValue ?? null)),
    range ? undefined : props.onValueChange,
  );
  const [rangeValue, setRange] = useControllable<DateRange>(
    range ? props.value : undefined,
    () => (range ? (props.defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE),
    range ? props.onValueChange : undefined,
  );
  const selectedAnchor = range ? (rangeValue.start ?? null) : single;

  // ---- visible month ----
  const [month, setMonthState] = useControllable<Date>(
    monthProp ? startOfMonth(monthProp) : undefined,
    () => startOfMonth(clampDate(defaultMonth ?? selectedAnchor ?? today, min, max)),
    onMonthChange,
  );
  const [direction, setDirection] = useState(1);
  const firstVisible = startOfMonth(month);
  const lastVisible = endOfMonth(addMonths(firstVisible, monthCount - 1));
  const isVisible = (date: Date) => isWithinRange(date, firstVisible, lastVisible);

  // min / max are compared by day, so their keys are all the callbacks below depend on.
  const minKey = min ? dayKey(min) : null;
  const maxKey = max ? dayKey(max) : null;
  const isUnavailable = useCallback(
    (date: Date) =>
      (minKey !== null && dayKey(date) < minKey) ||
      (maxKey !== null && dayKey(date) > maxKey) ||
      (isDateDisabled?.(date) ?? false),
    [minKey, maxKey, isDateDisabled],
  );

  // ---- focus (roving tabindex) ----
  const [focusedDate, setFocusedDate] = useState<Date>(() => clampDate(selectedAnchor ?? today, min, max));
  const focusTarget = isVisible(focusedDate)
    ? focusedDate
    : selectedAnchor && isVisible(selectedAnchor)
      ? selectedAnchor
      : isVisible(today)
        ? today
        : firstVisible;
  const pendingFocus = useRef(autoFocus);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusRef = useFocusProxyRef(ref, "[data-day][tabindex='0']:not(:disabled)", "[data-day]:not(:disabled)");
  const mergedRootRef = useMergedRef(rootRef, focusRef);
  // Right-to-left layouts slide months the other way (the nearest `dir` ancestor counts).
  const rtl = useResolvedDirection(undefined, rootRef) === "rtl";
  const slideDir = rtl ? -direction : direction;

  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current?.querySelector<HTMLElement>(`[data-present] [data-day="${toISODate(focusTarget)}"]`)?.focus();
  });

  // ---- view: days / months / years ----
  const [view, setView] = useState<View>("days");
  /** Which month panel the month / year picker covers (the one whose caption was clicked). */
  const [pickerPanel, setPickerPanel] = useState(0);
  const [pickerYear, setPickerYear] = useState(() => firstVisible.getFullYear());
  // If the panel count shrinks while the picker is open (a resize), keep it on a panel that exists.
  const activePanel = Math.min(pickerPanel, monthCount - 1);

  // ---- range preview ----
  const [preview, setPreview] = useState<Date | null>(null);
  const picking = range && rangeValue.start !== null && rangeValue.end === null;
  const anchor = picking ? rangeValue.start : null;

  const anchorKey = anchor ? dayKey(anchor) : null;
  const crossesUnavailable = range && props.allowUnavailableInRange;
  /** Nearest unavailable days around the anchor: a range can't cross them. */
  const limits = useMemo(() => {
    if (anchorKey === null || crossesUnavailable) return null;
    // Rebuilt from the day keys: a new Date for the same day must not rescan up to RANGE_SCAN_DAYS days.
    const anchor = fromDayKey(anchorKey);
    const min = minKey === null ? null : fromDayKey(minKey);
    const max = maxKey === null ? null : fromDayKey(maxKey);
    let before: Date | null = null;
    let after: Date | null = null;
    for (let i = 1; i <= RANGE_SCAN_DAYS && !before; i++) {
      const d = addDays(anchor, -i);
      if (min && compareDays(d, min) < 0) break;
      if (isUnavailable(d)) before = d;
    }
    for (let i = 1; i <= RANGE_SCAN_DAYS && !after; i++) {
      const d = addDays(anchor, i);
      if (max && compareDays(d, max) > 0) break;
      if (isUnavailable(d)) after = d;
    }
    return { before, after };
  }, [anchorKey, minKey, maxKey, isUnavailable, crossesUnavailable]);

  const isBlocked = (date: Date) => {
    if (isUnavailable(date)) return true;
    if (!limits) return false;
    return (
      (limits.before !== null && compareDays(date, limits.before) <= 0) ||
      (limits.after !== null && compareDays(date, limits.after) >= 0)
    );
  };

  // ---- announcements ----
  const [announcement, setAnnouncement] = useState("");
  const captionFormat = { month: "long", year: "numeric" } as const;
  const visibleCaption = Array.from({ length: monthCount }, (_, i) =>
    formatDate(addMonths(firstVisible, i), locale, captionFormat),
  ).join(" – ");
  const lastCaption = useRef(visibleCaption);
  const monthChanged = labels.monthChanged;
  useEffect(() => {
    if (lastCaption.current === visibleCaption) return;
    lastCaption.current = visibleCaption;
    setAnnouncement(monthChanged(visibleCaption));
  }, [visibleCaption, monthChanged]);

  // ---- navigation ----
  const prevDisabled = min !== null && monthKey(addMonths(firstVisible, -1)) < monthKey(min);
  const nextDisabled = max !== null && monthKey(addMonths(firstVisible, monthCount)) > monthKey(max);

  function goToMonth(next: Date, dir: number) {
    const target = startOfMonth(next);
    if (monthKey(target) === monthKey(firstVisible)) return;
    setDirection(dir);
    setMonthState(target);
  }

  function step(delta: number) {
    if ((delta < 0 && prevDisabled) || (delta > 0 && nextDisabled)) return;
    goToMonth(addMonths(firstVisible, delta), delta);
    // The roving day follows, so Tab back into the grid lands on the same day of the new month.
    setFocusedDate((d) => clampDate(addMonths(isVisible(d) ? d : focusTarget, delta), min, max));
  }

  function moveFocus(date: Date) {
    const next = clampDate(date, min, max);
    if (compareDays(next, firstVisible) < 0) goToMonth(next, -1);
    else if (compareDays(next, lastVisible) > 0) goToMonth(addMonths(startOfMonth(next), -(monthCount - 1)), 1);
    setFocusedDate(next);
    if (picking) setPreview(next);
    pendingFocus.current = true;
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const rtl = isRtlAt(event.currentTarget);
    const d = focusTarget;
    let next: Date;
    switch (event.key) {
      case "ArrowLeft":
        next = addDays(d, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        next = addDays(d, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        next = addDays(d, -7);
        break;
      case "ArrowDown":
        next = addDays(d, 7);
        break;
      case "Home":
        next = startOfWeek(d, weekStart);
        break;
      case "End":
        next = endOfWeek(d, weekStart);
        break;
      case "PageUp":
        next = event.shiftKey ? addYears(d, -1) : addMonths(d, -1);
        break;
      case "PageDown":
        next = event.shiftKey ? addYears(d, 1) : addMonths(d, 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(next);
  }

  function select(date: Date) {
    setFocusedDate(date);
    if (!range) {
      if (isUnavailable(date)) return;
      setSingle(date);
      return;
    }
    if (isBlocked(date)) return;
    if (!picking || !rangeValue.start) {
      setRange({ start: date, end: null });
      setPreview(date);
      return;
    }
    const start = rangeValue.start;
    setRange(compareDays(date, start) < 0 ? { start: date, end: start } : { start, end: date });
    setPreview(null);
  }

  // ---- per-day state ----
  const rangeStart = range ? rangeValue.start : null;
  const rangeEnd = range ? rangeValue.end : null;
  const previewEnd = picking && preview && !isBlocked(preview) ? preview : null;
  const [previewFrom, previewTo] =
    anchor && previewEnd
      ? compareDays(previewEnd, anchor) < 0
        ? [previewEnd, anchor]
        : [anchor, previewEnd]
      : [null, null];

  const dayState = (date: Date, inMonth: boolean): DayState => {
    const selectedSingle = !range && isSameDay(date, single);
    const isStart = isSameDay(date, rangeStart);
    const isEnd = isSameDay(date, rangeEnd);
    const inRange = !!rangeStart && !!rangeEnd && isWithinRange(date, rangeStart, rangeEnd);
    const inPreview = !!previewFrom && isWithinRange(date, previewFrom, previewTo);
    return {
      inMonth,
      today: isSameDay(date, today),
      unavailable: range ? isBlocked(date) : isUnavailable(date),
      selected: selectedSingle || isStart || isEnd,
      rangeStart: isStart && !!rangeEnd ? !isSameDay(rangeStart, rangeEnd) : false,
      rangeEnd: isEnd && !!rangeStart ? !isSameDay(rangeStart, rangeEnd) : false,
      inRange: inRange && !isStart && !isEnd,
      previewStart: inPreview && isSameDay(date, previewFrom),
      previewEnd: inPreview && isSameDay(date, previewTo),
      inPreview,
      previewCap: !!previewEnd && isSameDay(date, previewEnd) && !isSameDay(date, anchor),
      focusTarget: isSameDay(date, focusTarget),
    };
  };

  // Some locales' "short" weekdays are whole words (Arabic): use the narrow form there.
  const shortNames = getWeekdayNames(locale, weekStart, "short");
  const weekdaysShort = shortNames.some((n) => n.length > 5)
    ? getWeekdayNames(locale, weekStart, "narrow")
    : shortNames;
  const weekdaysLong = getWeekdayNames(locale, weekStart, "long");
  const dayNumber = { day: "numeric" } as const;
  const dayName = { weekday: "long", year: "numeric", month: "long", day: "numeric" } as const;

  function openMonths(panel: number) {
    setPickerPanel(panel);
    setPickerYear(addMonths(firstVisible, panel).getFullYear());
    setView("months");
  }

  function closePicker(focusDays: boolean) {
    setView("days");
    if (focusDays) pendingFocus.current = true;
  }

  const slide: Variants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: { duration: duration.fast } },
        exit: { opacity: 0, transition: { duration: duration.exit, ease: ease.exit } },
      }
    : {
        enter: (dir: number) => ({ x: dir * 32, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { x: spring.snappy, opacity: { duration: duration.fast } } },
        exit: (dir: number) => ({ x: dir * -32, opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }),
      };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- onBlur only reports focus leaving the calendar to a form library
    <div
      ref={mergedRootRef}
      onBlur={groupBlur(onBlur)}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
      aria-describedby={joinIds(ariaDescribedBy)}
      data-invalid={ariaInvalid === true || ariaInvalid === "true" ? "" : undefined}
      data-slot="calendar"
      className={cn("relative flex max-w-full flex-col", fluid ? "w-full" : "w-fit", className)}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Month panels. The month / year picker opens over the panel whose caption was clicked;
          the days stay mounted under it (inert), so the size never jumps, and other panels dim. */}
      <div className={cn("flex flex-wrap gap-x-6 gap-y-5", fluid && "w-full")}>
        <LayoutGroup id={id}>
          {Array.from({ length: monthCount }, (_, index) => {
            const m = addMonths(firstVisible, index);
            const caption = formatDate(m, locale, captionFormat);
            const covered = view !== "days" && activePanel === index;
            const dimmed = view !== "days" && activePanel !== index;
            return (
              <div key={index} className={cn("relative flex min-w-0 flex-col", fluid ? "w-full flex-1" : "")}>
                <motion.div
                  inert={view !== "days"}
                  initial={false}
                  animate={
                    covered ? { opacity: 0, scale: reduced ? 1 : 0.96 } : { opacity: dimmed ? 0.35 : 1, scale: 1 }
                  }
                  transition={
                    view === "days"
                      ? { opacity: { duration: duration.base }, scale: spring.snappy }
                      : { duration: duration.exit, ease: ease.exit }
                  }
                  className="flex min-w-0 flex-col gap-2"
                >
                  <div className="flex h-10 items-center gap-1 any-pointer-coarse:h-11">
                    {index === 0 ? (
                      <NavButton
                        label={labels.previousMonth}
                        disabled={prevDisabled}
                        onClick={() => step(-1)}
                        dir="prev"
                      />
                    ) : (
                      <span aria-hidden className="size-8 shrink-0 any-pointer-coarse:size-11" />
                    )}
                    <CaptionButton
                      label={labels.chooseMonth(caption)}
                      expanded={false}
                      onClick={() => openMonths(index)}
                      motionKey={monthKey(m)}
                      direction={direction}
                      reduced={reduced}
                    >
                      {caption}
                    </CaptionButton>
                    {index === monthCount - 1 ? (
                      <NavButton label={labels.nextMonth} disabled={nextDisabled} onClick={() => step(1)} dir="next" />
                    ) : (
                      <span aria-hidden className="size-8 shrink-0 any-pointer-coarse:size-11" />
                    )}
                  </div>

                  {/* popLayout: the leaving month is lifted out of the flow, so both slide at once. */}
                  <div className="relative">
                    <AnimatePresence initial={false} mode="popLayout" custom={slideDir}>
                      <motion.div
                        key={monthKey(m)}
                        custom={slideDir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                      >
                        <MonthGrid
                          caption={caption}
                          weeks={getMonthGrid(m, weekStart, fixedWeeks)}
                          month={m}
                          range={range}
                          fluid={fluid}
                          outsideDays={outsideDays}
                          weekdaysShort={weekdaysShort}
                          weekdaysLong={weekdaysLong}
                          dayState={dayState}
                          formatNumber={(d) => formatDate(d, locale, dayNumber)}
                          formatName={(d, s) =>
                            [
                              formatDate(d, locale, dayName),
                              s.rangeStart && labels.rangeStart,
                              s.rangeEnd && labels.rangeEnd,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          }
                          pillId={reduced || range ? undefined : `${id}-pill`}
                          onSelect={select}
                          onFocusDay={(d) => {
                            setFocusedDate(d);
                            if (picking) setPreview(d);
                          }}
                          onHoverDay={(d) => picking && setPreview(d)}
                          onLeave={() => setPreview(null)}
                          onKeyDown={onGridKeyDown}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {covered && (
                    <MonthYearPicker
                      key="picker"
                      view={view}
                      year={pickerYear}
                      visibleMonth={m}
                      today={today}
                      min={min}
                      max={max}
                      locale={locale}
                      labels={labels}
                      reduced={reduced}
                      onYearChange={setPickerYear}
                      onShowYears={() => setView("years")}
                      onPickYear={(y) => {
                        setPickerYear(y);
                        setView("months");
                      }}
                      onPickMonth={(monthIndex) => {
                        // The picked month lands in the panel it was picked from.
                        const target = new Date(pickerYear, monthIndex, 1);
                        const first = addMonths(target, -index);
                        goToMonth(first, monthKey(first) < monthKey(firstVisible) ? -1 : 1);
                        setFocusedDate(
                          clampDate(
                            new Date(
                              pickerYear,
                              monthIndex,
                              Math.min(focusTarget.getDate(), endOfMonth(target).getDate()),
                            ),
                            min,
                            max,
                          ),
                        );
                        closePicker(true);
                      }}
                      onClose={() => closePicker(true)}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </LayoutGroup>
      </div>
      {name && !range && <input type="hidden" name={name} value={single ? toISODate(single) : ""} />}
      {name && range && (
        <input type="hidden" name={`${name}-start`} value={rangeValue.start ? toISODate(rangeValue.start) : ""} />
      )}
      {name && range && (
        <input type="hidden" name={`${name}-end`} value={rangeValue.end ? toISODate(rangeValue.end) : ""} />
      )}
    </div>
  );
}
