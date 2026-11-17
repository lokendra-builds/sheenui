"use client";

import {
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";

import { cn } from "../../../lib/cn";
import { duration, ease, spring } from "../../../motion/tokens";
import { endOfMonth, formatDate, getMonthNames, monthKey, toISODate } from "../date-utils";
import { isRtlAt } from "../../../hooks/use-direction";
import { type CalendarLabels, type View } from "./model";

/* ---------- Month grid ---------- */

/** The computed state of one day cell: in month, today, unavailable, selected and range flags. @internal */
export type DayState = {
  inMonth: boolean;
  today: boolean;
  unavailable: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  inPreview: boolean;
  previewStart: boolean;
  previewEnd: boolean;
  /** The day under the pointer / focus that would end the range. */
  previewCap: boolean;
  focusTarget: boolean;
};

/** The props of the month grid. @internal */
export type MonthGridProps = {
  caption: string;
  weeks: Date[][];
  month: Date;
  range: boolean;
  fluid: boolean;
  outsideDays: boolean;
  weekdaysShort: string[];
  weekdaysLong: string[];
  dayState: (date: Date, inMonth: boolean) => DayState;
  formatNumber: (date: Date) => string;
  formatName: (date: Date, state: DayState) => string;
  pillId: string | undefined;
  onSelect: (date: Date) => void;
  onFocusDay: (date: Date) => void;
  onHoverDay: (date: Date) => void;
  onLeave: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTableElement>) => void;
};

/** The month grid with roving keyboard focus across its days. @internal */
export function MonthGrid({
  caption,
  weeks,
  month,
  range,
  fluid,
  outsideDays,
  weekdaysShort,
  weekdaysLong,
  dayState,
  formatNumber,
  formatName,
  pillId,
  onSelect,
  onFocusDay,
  onHoverDay,
  onLeave,
  onKeyDown,
}: MonthGridProps) {
  const present = useIsPresent();

  function onBlur(event: FocusEvent<HTMLTableElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) onLeave();
  }

  return (
    <table
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- the WAI-ARIA date-grid pattern: a <table role="grid"> keeps row/column semantics while arrow keys move between days
      role="grid"
      aria-label={caption}
      aria-multiselectable={range || undefined}
      data-present={present ? "" : undefined}
      aria-hidden={present ? undefined : true}
      onKeyDown={onKeyDown}
      onPointerLeave={onLeave}
      onBlur={onBlur}
      className={cn(
        // Cells share the width: 40px days (44px on touch) that shrink to fit narrow screens.
        "table-fixed border-collapse select-none",
        fluid ? "w-full" : "w-70 max-w-full any-pointer-coarse:w-77",
        !present && "pointer-events-none",
      )}
    >
      <thead>
        <tr>
          {weekdaysShort.map((day, i) => (
            <th
              key={i}
              scope="col"
              abbr={weekdaysLong[i]}
              className="h-8 overflow-hidden p-0 text-center text-2xs font-semibold tracking-wide text-ellipsis whitespace-nowrap text-sheen-fg-muted uppercase"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, row) => (
          <tr key={row}>
            {week.map((date, col) => {
              const inMonth = date.getMonth() === month.getMonth();
              if (!inMonth) {
                return (
                  <td key={col} className="p-0">
                    {/* Hidden outside days still hold the row's height, so fixedWeeks keeps six rows. */}
                    <span
                      aria-hidden
                      className={cn(
                        "mx-auto flex aspect-square w-full items-center justify-center text-sm text-sheen-fg-subtle tabular-nums",
                        fluid ? "max-w-11" : "max-w-10 any-pointer-coarse:max-w-11",
                        !outsideDays && "invisible",
                      )}
                    >
                      {outsideDays ? formatNumber(date) : ""}
                    </span>
                  </td>
                );
              }
              const s = dayState(date, inMonth);
              const first = date.getDate() === 1;
              const last = date.getDate() === endOfMonth(date).getDate();
              const band =
                s.inRange ||
                s.rangeStart ||
                s.rangeEnd ||
                (s.inPreview && !s.selected) ||
                s.previewStart ||
                s.previewEnd;
              const startsBand = s.rangeStart || (s.previewStart && !s.rangeEnd);
              const endsBand = s.rangeEnd || (s.previewEnd && !s.rangeStart);
              return (
                <td
                  key={col}
                  aria-selected={s.selected || s.inRange || undefined}
                  aria-disabled={s.unavailable || undefined}
                  className={cn(
                    "relative p-0 text-center",
                    // Range band behind the day circles: rounded where it starts and ends,
                    // and at the edges of each week row and of the month.
                    band && [
                      "before:absolute before:inset-y-0 before:content-['']",
                      s.inRange || (s.rangeStart && s.rangeEnd) || s.rangeStart || s.rangeEnd
                        ? "before:bg-sheen-accent-soft"
                        : "before:border-y before:border-dashed before:border-sheen-accent-border before:bg-sheen-hover",
                      startsBand
                        ? "before:start-1/2 before:end-0"
                        : endsBand
                          ? "before:start-0 before:end-1/2"
                          : "before:inset-x-0",
                      (col === 0 || first) && !startsBand && "before:rounded-s-full",
                      (col === 6 || last) && !endsBand && "before:rounded-e-full",
                      startsBand && endsBand && "before:hidden",
                      "forced-colors:before:border-y forced-colors:before:border-solid forced-colors:before:border-[Highlight]",
                    ],
                  )}
                >
                  <DayButton
                    date={date}
                    state={s}
                    number={formatNumber(date)}
                    name={formatName(date, s)}
                    fluid={fluid}
                    pillId={pillId}
                    onSelect={onSelect}
                    onFocusDay={onFocusDay}
                    onHoverDay={onHoverDay}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** One day cell button. @internal */
export function DayButton({
  date,
  state: s,
  number,
  name,
  fluid,
  pillId,
  onSelect,
  onFocusDay,
  onHoverDay,
}: {
  date: Date;
  state: DayState;
  number: string;
  name: string;
  fluid: boolean;
  pillId: string | undefined;
  onSelect: (date: Date) => void;
  onFocusDay: (date: Date) => void;
  onHoverDay: (date: Date) => void;
}) {
  return (
    <button
      type="button"
      data-day={toISODate(date)}
      data-selected={s.selected ? "" : undefined}
      data-today={s.today ? "" : undefined}
      tabIndex={s.focusTarget ? 0 : -1}
      aria-label={name}
      aria-current={s.today ? "date" : undefined}
      aria-disabled={s.unavailable || undefined}
      onClick={() => onSelect(date)}
      onFocus={() => onFocusDay(date)}
      onPointerEnter={(e) => e.pointerType !== "touch" && onHoverDay(date)}
      className={cn(
        "sheen-hit group/day relative z-10 mx-auto flex aspect-square w-full items-center justify-center rounded-full text-sm text-sheen-fg tabular-nums",
        fluid ? "max-w-11" : "max-w-10 any-pointer-coarse:max-w-11",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
        !s.selected && !s.unavailable && "hover:bg-sheen-hover motion-ok:active:scale-90",
        s.today && !s.selected && "font-semibold text-sheen-accent",
        s.unavailable && "cursor-not-allowed text-sheen-fg-subtle line-through decoration-sheen-fg-subtle/70",
        s.previewCap && !s.selected && "shadow-[inset_0_0_0_2px_var(--sheen-accent-border)]",
        s.selected && [
          "font-semibold text-sheen-accent-fg",
          // Range ends have no gliding pill: fill the button itself.
          !pillId && "sheen-fill [background-image:var(--sheen-accent-fill)] shadow-(--sheen-accent-fill-shadow)",
          "forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
        ],
      )}
    >
      {s.selected && pillId && (
        // Single mode: one pill that glides from the old day to the new one.
        <motion.span
          aria-hidden
          layoutId={pillId}
          transition={spring.snappy}
          className="sheen-fill absolute inset-0 rounded-full [background-image:var(--sheen-accent-fill)] shadow-(--sheen-accent-fill-shadow) forced-colors:hidden"
        />
      )}
      <span className="relative">{number}</span>
      {s.today && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full",
            s.selected
              ? "bg-sheen-accent-fg forced-colors:bg-[HighlightText]"
              : "bg-sheen-accent forced-colors:bg-[CanvasText]",
          )}
        />
      )}
    </button>
  );
}

/* ---------- Month / year picker ---------- */

/** The props of the month and year picker. @internal */
export type MonthYearPickerProps = {
  view: View;
  year: number;
  visibleMonth: Date;
  today: Date;
  min: Date | null;
  max: Date | null;
  locale: string | undefined;
  labels: CalendarLabels;
  reduced: boolean;
  onYearChange: (year: number) => void;
  onShowYears: () => void;
  onPickYear: (year: number) => void;
  onPickMonth: (month: number) => void;
  onClose: () => void;
};

/** The month and year picker that replaces the day grid. @internal */
export function MonthYearPicker({
  view,
  year,
  visibleMonth,
  today,
  min,
  max,
  locale,
  labels,
  reduced,
  onYearChange,
  onShowYears,
  onPickYear,
  onPickMonth,
  onClose,
}: MonthYearPickerProps) {
  const months = view === "months";
  const yearFormat = { year: "numeric" } as const;
  const fmtYear = (y: number) => formatDate(new Date(y, 0, 1), locale, yearFormat);
  const pageStart = Math.floor(year / 12) * 12;
  const monthNamesShort = getMonthNames(locale, "short");

  const minYear = min?.getFullYear() ?? -Infinity;
  const maxYear = max?.getFullYear() ?? Infinity;
  const prevDisabled = months ? year - 1 < minYear : pageStart - 1 < minYear;
  const nextDisabled = months ? year + 1 > maxYear : pageStart + 12 > maxYear;

  const items = months
    ? monthNamesShort.map((short, i) => {
        const key = year * 100 + i;
        return {
          key,
          text: short,
          label: formatDate(new Date(year, i, 1), locale, { month: "long", year: "numeric" }),
          current: key === monthKey(visibleMonth),
          today: key === monthKey(today),
          disabled: (min !== null && key < monthKey(min)) || (max !== null && key > monthKey(max)),
          value: i,
        };
      })
    : Array.from({ length: 12 }, (_, i) => {
        const y = pageStart + i;
        return {
          key: y,
          text: fmtYear(y),
          label: fmtYear(y),
          current: y === visibleMonth.getFullYear(),
          today: y === today.getFullYear(),
          disabled: y < minYear || y > maxYear,
          value: y,
        };
      });

  // The visible month / year, or (in another year) the same month, so focus stays put visually.
  const found = items.findIndex((it) => it.current);
  const currentIndex = found >= 0 ? found : months ? visibleMonth.getMonth() : -1;
  const [focusIndex, setFocusIndex] = useState(Math.max(0, currentIndex));
  const gridRef = useRef<HTMLDivElement>(null);
  // Focus moves into the grid on open and on every view switch; paging with the header
  // buttons leaves focus on the button, paging with the keyboard keeps it in the grid.
  // Bumped whenever focus must (re)enter the grid; starts at 1 so it enters on open.
  const [focusRequest, setFocusRequest] = useState(1);
  const pageKey = months ? year : pageStart;
  const [seen, setSeen] = useState({ view, pageKey, request: focusRequest });
  if (seen.view !== view) {
    setSeen({ view, pageKey, request: focusRequest + 1 });
    setFocusRequest(focusRequest + 1);
    const next = Math.max(0, currentIndex);
    if (next !== focusIndex) setFocusIndex(next);
  } else if (seen.pageKey !== pageKey) {
    setSeen({ view, pageKey, request: focusRequest });
    // Is focus about to enter the grid (keyboard paging bumped the request)? Then the roving index is already right.
    if (seen.request === focusRequest && currentIndex >= 0 && currentIndex !== focusIndex) setFocusIndex(currentIndex);
  }

  // The roving index is read when focus enters, not watched: moving the index alone must not steal focus.
  const focusCell = useEffectEvent(() => {
    gridRef.current?.querySelector<HTMLElement>(`[data-index="${focusIndex}"]`)?.focus();
  });
  useLayoutEffect(() => {
    focusCell();
  }, [focusRequest]);

  function move(index: number) {
    // Inline, not `lib/math`'s `clamp`: the lower bound wins here, so an empty list resolves to 0 rather than -1.
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    setFocusIndex(clamped);
    setFocusRequest((n) => n + 1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const rtl = isRtlAt(event.currentTarget);
    const cols = 3;
    const map: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -cols,
      ArrowDown: cols,
    };
    if (event.key === "Escape") {
      event.preventDefault();
      // Keep a surrounding popover open: Escape here only leaves the picker.
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key in map) {
      event.preventDefault();
      const next = focusIndex + (map[event.key] ?? 0);
      if (next < 0 && !prevDisabled) {
        if (months) onYearChange(year - 1);
        else onYearChange(year - 12);
        move(next + items.length);
        return;
      }
      if (next >= items.length && !nextDisabled) {
        if (months) onYearChange(year + 1);
        else onYearChange(year + 12);
        move(next - items.length);
        return;
      }
      move(next);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(items.length - 1);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const dir = event.key === "PageUp" ? -1 : 1;
      if ((dir < 0 && prevDisabled) || (dir > 0 && nextDisabled)) return;
      onYearChange(months ? year + dir : year + dir * 12);
      setFocusRequest((n) => n + 1);
    }
  }

  const heading = months ? fmtYear(year) : `${fmtYear(pageStart)} – ${fmtYear(pageStart + 11)}`;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: reduced
          ? { duration: duration.fast }
          : { opacity: { duration: duration.base }, scale: spring.snappy },
      }}
      exit={{ opacity: 0, scale: reduced ? 1 : 1.02, transition: { duration: duration.exit, ease: ease.exit } }}
      className="absolute inset-0 flex flex-col gap-2"
    >
      <div className="flex h-10 items-center gap-1 any-pointer-coarse:h-11">
        <NavButton
          label={months ? labels.previousYear : labels.previousYears}
          disabled={prevDisabled}
          onClick={() => onYearChange(months ? year - 1 : year - 12)}
          dir="prev"
        />
        {months ? (
          <CaptionButton
            label={labels.chooseYear(fmtYear(year))}
            expanded
            onClick={onShowYears}
            motionKey={year}
            direction={1}
            reduced={reduced}
          >
            {heading}
          </CaptionButton>
        ) : (
          <span
            className="flex min-w-0 flex-1 items-center justify-center text-sm font-semibold tabular-nums"
            aria-live="polite"
          >
            {heading}
          </span>
        )}
        <NavButton
          label={months ? labels.nextYear : labels.nextYears}
          disabled={nextDisabled}
          onClick={() => onYearChange(months ? year + 1 : year + 12)}
          dir="next"
        />
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow-key navigation delegated from the focusable cells inside; the group is not a control itself */}
      <div
        ref={gridRef}
        role="group"
        aria-label={heading}
        onKeyDown={onKeyDown}
        className="grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-1.5 p-0.5"
      >
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            data-index={i}
            tabIndex={i === focusIndex ? 0 : -1}
            aria-label={item.label}
            aria-pressed={item.current}
            aria-disabled={item.disabled || undefined}
            onFocus={() => setFocusIndex(i)}
            onClick={() => {
              if (item.disabled) return;
              if (months) onPickMonth(item.value);
              else onPickYear(item.value);
            }}
            className={cn(
              "relative flex items-center justify-center rounded-sheen-md text-sm font-medium tabular-nums",
              "touch-manipulation transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
              item.current
                ? "sheen-fill text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-(--sheen-accent-fill-shadow)"
                : "text-sheen-fg hover:bg-sheen-hover motion-ok:active:scale-95",
              item.today && !item.current && "text-sheen-accent ring-1 ring-sheen-accent-border ring-inset",
              item.disabled && "cursor-not-allowed text-sheen-fg-subtle line-through hover:bg-transparent",
            )}
          >
            {item.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ---------- Header parts ---------- */

/** The previous and next month button. @internal */
export function NavButton({
  label,
  disabled,
  onClick,
  dir,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  dir: "prev" | "next";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // aria-disabled, not disabled: a button that disables itself under focus would drop focus to <body>.
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onClick()}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
        "any-pointer-coarse:size-11 touch-manipulation",
        "transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-sheen-hover hover:text-sheen-fg motion-ok:active:scale-90",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4 rtl:-scale-x-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={dir === "prev" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}

/** The caption button that toggles the month and year picker. @internal */
export function CaptionButton({
  label,
  expanded,
  onClick,
  children,
  motionKey,
  direction,
  reduced,
}: {
  label: string;
  expanded: boolean;
  onClick: () => void;
  children: ReactNode;
  motionKey: number;
  direction: number;
  reduced: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        "group/caption relative flex h-8 min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden rounded-sheen-sm px-2 text-sm font-semibold",
        "any-pointer-coarse:h-11 touch-manipulation",
        "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
      )}
    >
      <span className="relative grid min-w-0">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.span
            key={motionKey}
            custom={direction}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: direction * 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: reduced
                ? { duration: duration.fast }
                : { y: spring.snappy, opacity: { duration: duration.fast } },
            }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: duration.exit } }
                : { opacity: 0, y: direction * -8, transition: { duration: duration.exit, ease: ease.exit } }
            }
            className="truncate tabular-nums"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn(
          "size-3.5 shrink-0 text-sheen-fg-muted motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
          expanded && "rotate-180",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
