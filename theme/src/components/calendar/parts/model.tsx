import { type FormControlProps } from "../../../lib/form";
import { type DateRange, type Weekday } from "../date-utils";

/**
 * Calendar: a locale-aware month grid for picking one date or a date range.
 *
 *   - Week start, month and weekday names and even the digits come from Intl, so
 *     locale="ar-EG" starts on Saturday in Arabic numerals and "en-GB" on Monday.
 *   - Keyboard (WAI-ARIA date grid): arrows move by day / week, Home / End to the week's
 *     edges, Page Up / Down by month, Shift + Page Up / Down by year. One day is in the tab
 *     order (roving tabindex); RTL flips Left / Right.
 *   - Range mode previews the range under the pointer or keyboard focus, and won't let a
 *     range run across an unavailable day (unless allowUnavailableInRange).
 *   - The caption opens a month grid, and that a year grid, for long jumps.
 *
 * Motion: months slide in the direction you travel, the selected-day pill glides to the
 * new day, the month / year grids zoom in over the days. With reduced motion (OS or the
 * in-app toggle) everything cross-fades or jumps instead.
 */

/** Every UI string of {@link Calendar}; pass a partial through its `labels` prop to translate it. */
export type CalendarLabels = {
  /** Accessible name of the previous-month button. */
  previousMonth: string;
  /** Accessible name of the next-month button. */
  nextMonth: string;
  /** Accessible name of the previous-year button (month grid). */
  previousYear: string;
  /** Accessible name of the next-year button (month grid). */
  nextYear: string;
  /** Accessible name of the "previous 12 years" button (year grid). */
  previousYears: string;
  /** Accessible name of the "next 12 years" button (year grid). */
  nextYears: string;
  /** Accessible name of the month caption button. Keep the visible caption first (label in name). */
  chooseMonth: (caption: string) => string;
  /** Accessible name of the year caption button in the month grid. */
  chooseYear: (year: string) => string;
  /** Added to a day's name when it starts the selected range. */
  rangeStart: string;
  /** Added to a day's name when it ends the selected range. */
  rangeEnd: string;
  /** Spoken when the visible month changes, e.g. "October 2026". */
  monthChanged: (caption: string) => string;
};

/** The English strings of {@link Calendar}. Spread it to build your own set. */
export const defaultCalendarLabels: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousYear: "Previous year",
  nextYear: "Next year",
  previousYears: "Previous 12 years",
  nextYears: "Next 12 years",
  chooseMonth: (caption) => `${caption}, choose month and year`,
  chooseYear: (year) => `${year}, choose year`,
  rangeStart: "start of range",
  rangeEnd: "end of range",
  monthChanged: (caption) => caption,
};

/** The props the single, multiple and range calendars share. @internal */
export type CalendarCommonProps = Pick<
  FormControlProps<HTMLDivElement>,
  "ref" | "onBlur" | "name" | "aria-invalid" | "aria-describedby"
> & {
  /**
   * BCP 47 locale for names, digits and week start. Defaults to the browser's. When the page is
   * prerendered or server-rendered, pass one (e.g. `"en-US"`) so the HTML matches what the
   * browser renders when it hydrates.
   */
  locale?: string;
  /**
   * What counts as "today" (the highlighted day, the default month, the Today shortcut).
   * Defaults to the current date; pass a fixed date for prerendered pages, tests and screenshots.
   */
  today?: Date;
  /** Override the locale's first day of the week (0 = Sunday). */
  weekStartsOn?: Weekday;
  /** The earliest day that can be selected. */
  min?: Date | null;
  /** The latest day that can be selected. */
  max?: Date | null;
  /** Mark days unavailable (still focusable, never selectable), e.g. weekends or booked days. */
  isDateDisabled?: (date: Date) => boolean;
  /** Sets the first visible month when controlled. */
  month?: Date;
  /** The first visible month on mount (uncontrolled). Defaults to the selection, or today. */
  defaultMonth?: Date;
  /** Called with the first visible month when the person pages to another month. */
  onMonthChange?: (month: Date) => void;
  /**
   * Months shown side by side (they wrap on narrow screens).
   * @default 1
   */
  numberOfMonths?: number;
  /** Show the neighbouring months' days in the first and last rows. Default: only with one month. */
  showOutsideDays?: boolean;
  /**
   * Always 6 rows, so the height never jumps between months.
   * @default true
   */
  fixedWeeks?: boolean;
  /**
   * Stretch to the container's width (cells share it) instead of a fixed cell size.
   * @default false
   */
  fluid?: boolean;
  /**
   * Focus the selected day (or today) on mount.
   * @default false
   */
  autoFocus?: boolean;
  /** Sets the accessible name of the whole calendar. */
  "aria-label"?: string;
  /** UI strings (translate these). */
  labels?: Partial<CalendarLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Props of {@link Calendar} in single-date mode (the default). */
export type CalendarSingleProps = CalendarCommonProps & {
  /**
   * Selection mode: one date at a time, so `value` is a single Date and clicking a day replaces it.
   * @default "single"
   */
  mode?: "single";
  /** The selected date (controlled). `null` is no selection. */
  value?: Date | null;
  /** The selected date on mount (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the new date when one is picked. */
  onValueChange?: (value: Date | null) => void;
  /** Range mode only. */
  allowUnavailableInRange?: never;
};

/** Props of {@link Calendar} in range mode (`mode="range"`). */
export type CalendarRangeProps = CalendarCommonProps & {
  /** Pick a start and an end date. */
  mode: "range";
  /** `{ start, end }`. While picking, `end` is null. */
  value?: DateRange;
  /** The range on mount (uncontrolled). */
  defaultValue?: DateRange;
  /** Called with `{ start, end }` as the range is picked; `end` is null until the second click. */
  onValueChange?: (value: DateRange) => void;
  /**
   * Let a range span unavailable days.
   * @default false
   */
  allowUnavailableInRange?: boolean;
};

/** Props of {@link Calendar}. {@link CalendarSingleProps} or {@link CalendarRangeProps}, chosen by `mode`. */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/** The calendar view: days, months or years. @internal */
export type View = "days" | "months" | "years";

/** The empty date range, with both ends unset. @internal */
export const EMPTY_RANGE: DateRange = { start: null, end: null };
/** How far to look for the nearest unavailable day when limiting a range. */
export const RANGE_SCAN_DAYS = 800;

/* ---------- small hooks ---------- */

/* ---------- Calendar ---------- */
