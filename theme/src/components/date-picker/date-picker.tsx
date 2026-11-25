"use client";

import { useId, useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Calendar, type CalendarLabels } from "../calendar/calendar";
import {
  differenceInDays,
  formatDate,
  formatDateRange,
  isSameDay,
  startOfDay,
  toISODate,
  type DateRange,
  type Weekday,
} from "../calendar/date-utils";
import { fieldHeight, type FieldSize } from "../../lib/field-size";
import { joinIds, type FormControlProps } from "../../lib/form";
import { CloseIcon, PICKER_SHEET_QUERY, PickerSurface, useMediaQuery, useViewportWidth } from "./picker-surface";
import { useControllable } from "../../hooks/use-controllable";

/* ---------- shared ---------- */

/** The roving day (selected, else today), not the "previous month" button. */
const DAY_FOCUS = '[data-day][tabindex="0"]';

type FieldShellProps = {
  label?: ReactNode;
  labelId: string;
  triggerId: string;
  description?: ReactNode;
  descriptionId: string;
  error?: ReactNode;
  errorId: string;
  required?: boolean;
  requiredId: string;
  requiredLabel: string;
  /** Accessible name when there is no visible label (read with the value). */
  ariaLabel?: string;
  ariaLabelId: string;
  className?: string;
  /** The root `data-slot`: the range picker passes its own. */
  slot?: string;
  children: ReactNode;
};

/** Label, field and helper text, laid out like Input / Select. */
function FieldShell({
  label,
  labelId,
  triggerId,
  description,
  descriptionId,
  error,
  errorId,
  required,
  requiredId,
  requiredLabel,
  ariaLabel,
  ariaLabelId,
  className,
  slot = "date-picker",
  children,
}: FieldShellProps) {
  return (
    <div data-slot={slot} className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label id={labelId} htmlFor={triggerId} className="w-fit text-sm font-medium text-sheen-fg">
          {label}
          {/* Visual marker; the word itself is in the field's description (aria-required isn't allowed on a button). */}
          {required && (
            <span aria-hidden className="ms-0.5 text-sheen-danger-text">
              *
            </span>
          )}
        </label>
      )}
      {!label && ariaLabel && (
        <span id={ariaLabelId} hidden>
          {ariaLabel}
        </span>
      )}
      {required && (
        <span id={requiredId} hidden>
          {requiredLabel}
        </span>
      )}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-sheen-danger-text">
          {error}
        </p>
      ) : (
        description && (
          <p id={descriptionId} className="text-xs text-sheen-fg-muted">
            {description}
          </p>
        )
      )}
    </div>
  );
}

const triggerBase = cn(
  "group/trigger glass-1 flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-sheen-md ps-3.5 pe-10 text-start text-sm select-none",
  "any-pointer-coarse:text-base touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "transition-[border-color] duration-(--sheen-duration-fast) ease-sheen-out",
  "focus-visible:border-sheen-accent focus-visible:shadow-[0_0_0_4px_var(--sheen-ring)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sheen-focus",
  "data-popup-open:border-sheen-accent",
  "disabled:cursor-not-allowed disabled:opacity-55",
);

/**
 * Name and description wiring for the field button. The name is the label (or aria-label)
 * plus the value, so "Check-in, Oct 31, 2026" is read either way.
 */
function triggerAria(
  ids: ReturnType<typeof useFieldIds>,
  {
    label,
    ariaLabel,
    error,
    description,
    required,
    describedBy: extraDescribedBy,
    invalid,
  }: {
    label?: ReactNode;
    ariaLabel?: string;
    error?: ReactNode;
    description?: ReactNode;
    required?: boolean;
    describedBy?: string;
    invalid?: boolean | "true" | "false";
  },
) {
  const nameId = label ? ids.label : ariaLabel ? ids.ariaLabel : null;
  const describedBy = joinIds(
    extraDescribedBy,
    required && ids.required,
    error ? ids.error : description && ids.description,
  );
  return {
    "aria-labelledby": nameId ? `${nameId} ${ids.value}` : undefined,
    "aria-describedby": describedBy,
    "aria-invalid": error || invalid === true || invalid === "true" ? true : undefined,
  } as const;
}

function ClearButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClear}
      className={cn(
        "absolute end-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
        "transition-[background-color,color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
        // 44px hit area on touch screens, same look.
        "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-1.5 any-pointer-coarse:after:content-['']",
      )}
    >
      <CloseIcon className="size-3.5" />
    </button>
  );
}

/** The × button unmounts with the value: hand focus back to the field button. */
function focusAfterClear(triggerId: string) {
  requestAnimationFrame(() => document.getElementById(triggerId)?.focus());
}

/* ---------- DatePicker ---------- */

/**
 * Every user-facing string of `DatePicker` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type DatePickerLabels = {
  placeholder: string;
  /** Accessible name of the × button in the field. */
  clear: string;
  /** Footer button that picks today. */
  today: string;
  /** Footer button that clears the date. */
  clearDate: string;
  /** Heading of the phone sheet when there is no string `label`. */
  title: string;
  /** Accessible name of the sheet's close button. */
  close: string;
  /** Read with the field when `required` (the label shows an asterisk). */
  required: string;
};

/**
 * Default English strings of `DatePickerLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultDatePickerLabels: DatePickerLabels = {
  placeholder: "Pick a date",
  clear: "Clear date",
  today: "Today",
  clearDate: "Clear",
  title: "Choose a date",
  close: "Close",
  required: "Required",
};

type PickerCommon = FormControlProps<HTMLButtonElement> & {
  /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
  size?: FieldSize;
  /** Text above the field, linked to it as its accessible name (the chosen value is read after it). */
  label?: ReactNode;
  /** Muted helper text under the field. Hidden while an `error` shows. */
  description?: ReactNode;
  /** Shows an error message under the field. Marks it invalid and is announced. */
  error?: ReactNode;
  /** BCP 47 locale for the field text and the calendar. Defaults to the browser's; pass one on prerendered pages. */
  locale?: string;
  /** What counts as "today" (highlighted day, Today button). Defaults to the current date; pass a fixed date on prerendered pages. */
  today?: Date;
  /** First day of the week: 0 is Sunday, 1 Monday. Defaults to the locale's. */
  weekStartsOn?: Weekday;
  /** The earliest day that can be selected. */
  min?: Date | null;
  /** The latest day that can be selected. */
  max?: Date | null;
  /** Return true for days that cannot be picked (holidays, booked days). */
  isDateDisabled?: (date: Date) => boolean;
  /** How the field shows the value. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Show the × button once there is a value. Default true. */
  clearable?: boolean;
  /** Close as soon as a date (or a full range) is picked. Default true. */
  closeOnSelect?: boolean;
  /** Whether the calendar is open (controlled). */
  open?: boolean;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the whole field and its picker. */
  disabled?: boolean;
  /** Mark the field as required (the label shows an asterisk and "Required" is read). */
  required?: boolean;
  /** Sets the id of the field button. */
  id?: string;
  /** Accessible name when there is no visible `label` (the value is read after it). */
  "aria-label"?: string;
  /** Calendar UI strings (month navigation, captions). */
  calendarLabels?: Partial<CalendarLabels>;
  /** Class for the outer wrapper (label + field + helper text). */
  className?: string;
  /** Adds extra classes to the field button. */
  triggerClassName?: string;
};

/**
 * Props of `DatePicker`: the options shared by both pickers (`label`, `locale`, `min`, `max`, `open`,
 * `disabled`, …) plus the single-date ones.
 */
export type DatePickerProps = PickerCommon & {
  /** Sets the chosen day when controlled. `null` means none. */
  value?: Date | null;
  /** Sets the starting day when uncontrolled. */
  defaultValue?: Date | null;
  /** Called with the picked day, or `null` when cleared. */
  onValueChange?: (value: Date | null) => void;
  /** Submits the day as YYYY-MM-DD with a form. */
  name?: string;
  /** Show the Today / Clear footer. Default true. */
  showFooter?: boolean;
  /** Override the strings (i18n). */
  labels?: Partial<DatePickerLabels>;
};

/**
 * DatePicker: a glass field that opens a `Calendar` to pick one day. Use `DateRangePicker` for a start and end, and `Calendar` on its own when the calendar should always be visible.
 *
 * - From 640px up it opens as a glass popover under the field. On phones it opens as a full-width bottom sheet you can swipe down to close (Base UI Drawer), with roomier, finger-sized days.
 * - Controlled with `value` + `onValueChange` (a `Date`, or `null`), or uncontrolled with `defaultValue`; `open`, `defaultOpen` and `onOpenChange` control the popup.
 * - `min`, `max`, `isDateDisabled` limit the days; `locale`, `weekStartsOn` and `formatOptions` localise the field and calendar; pass `today` a fixed date on prerendered pages (a changing "today" causes hydration mismatches).
 * - `clearable` shows a × once there is a value; `showFooter` adds Today / Clear; `closeOnSelect` closes after a pick; `name` submits the day as YYYY-MM-DD with a form; `labels` and `calendarLabels` translate the UI.
 * - Focus moves to the selected day (or today) on open and returns to the field on close (and after the × clear). Picking a day closes the picker.
 *
 * Keyboard: Enter, Space or ↓ on the field opens it; in the calendar the arrow keys move by day and week, Page Up / Page Down by month (Shift: year), Home / End to the week's ends, Enter or Space picks, Escape closes and returns focus to the field; Tab stays inside the popup.
 * Accessibility: the field button is named by the label plus the value ("Check-in, Oct 31, 2026"); the popup is a labelled dialog; the calendar is a labelled grid; an `error` is announced; targets are 44px on touch screens.
 * Glass and motion: a `glass-1` field and a `glass-3` popup. The popover springs in from the field and leaves faster without overshoot; the sheet springs up and follows your finger. Reduced motion: both fade.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { DatePicker } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [date, setDate] = useState<Date | null>(null);
 *
 *   return <DatePicker label="Check-in" value={date} onValueChange={setDate} min={new Date()} />;
 * }
 * ```
 *
 * @see /forms/date-picker
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  label,
  description,
  error,
  locale,
  today: todayProp,
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  formatOptions = { dateStyle: "medium" },
  clearable = true,
  closeOnSelect = true,
  showFooter = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  required,
  name,
  id,
  "aria-label": ariaLabel,
  labels: labelsProp,
  calendarLabels,
  className,
  triggerClassName,
  size = "md",
  ref,
  onBlur,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const labels = { ...defaultDatePickerLabels, ...labelsProp };
  const [value, setValue] = useControllable<Date | null>(valueProp, defaultValue, onValueChange);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const phone = useMediaQuery(PICKER_SHEET_QUERY);
  const ids = useFieldIds(id);

  const today = startOfDay(todayProp ?? new Date());
  const todayAvailable =
    !(min && today < startOfDay(min)) && !(max && today > startOfDay(max)) && !(isDateDisabled?.(today) ?? false);

  const display = value ? formatDate(value, locale, formatOptions) : null;

  const trigger = (
    <button
      type="button"
      id={ids.trigger}
      ref={ref}
      onBlur={onBlur}
      disabled={disabled}
      {...triggerAria(ids, {
        label,
        ariaLabel,
        error,
        description,
        required,
        describedBy: ariaDescribedBy,
        invalid: ariaInvalid,
      })}
      className={cn(
        triggerBase,
        fieldHeight[size],
        !(clearable && value) && "pe-3.5",
        (Boolean(error) || ariaInvalid === true || ariaInvalid === "true") &&
          "border-sheen-danger data-popup-open:border-sheen-danger",
        triggerClassName,
      )}
    >
      <CalendarIcon className="size-4 shrink-0 text-sheen-fg-muted" />
      <span id={ids.value} className={cn("min-w-0 flex-1 truncate", !display && "text-sheen-fg-subtle")}>
        {display ?? labels.placeholder}
      </span>
      {!(clearable && value) && <ChevronIcon className="size-4 shrink-0 text-sheen-fg-muted" />}
    </button>
  );

  return (
    <FieldShell
      label={label}
      labelId={ids.label}
      triggerId={ids.trigger}
      description={description}
      descriptionId={ids.description}
      error={error}
      errorId={ids.error}
      required={required}
      requiredId={ids.required}
      requiredLabel={labels.required}
      ariaLabel={ariaLabel}
      ariaLabelId={ids.ariaLabel}
      className={className}
    >
      <div className="relative">
        <PickerSurface
          phone={phone}
          open={open}
          onOpenChange={setOpen}
          trigger={trigger}
          triggerId={ids.trigger}
          title={typeof label === "string" ? label : (ariaLabel ?? labels.title)}
          closeLabel={labels.close}
          initialFocusSelector={DAY_FOCUS}
        >
          <Calendar
            mode="single"
            value={value}
            onValueChange={(next) => {
              setValue(next);
              if (closeOnSelect) setOpen(false);
            }}
            locale={locale}
            today={todayProp}
            weekStartsOn={weekStartsOn}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            fluid={phone}
            labels={calendarLabels}
          />
          {showFooter && (
            <div className="flex items-center justify-between gap-2 border-t border-sheen-border pt-3">
              <Button
                variant="ghost"
                size={phone ? "md" : "sm"}
                disabled={!todayAvailable}
                onClick={() => {
                  setValue(today);
                  setOpen(false);
                }}
              >
                {labels.today}
              </Button>
              <Button
                variant="ghost"
                size={phone ? "md" : "sm"}
                disabled={!value}
                onClick={() => {
                  setValue(null);
                  setOpen(false);
                }}
              >
                {labels.clearDate}
              </Button>
            </div>
          )}
        </PickerSurface>
        {clearable && value && !disabled && (
          <ClearButton
            label={labels.clear}
            onClear={() => {
              setValue(null);
              focusAfterClear(ids.trigger);
            }}
          />
        )}
      </div>
      {name && <input type="hidden" name={name} value={value ? toISODate(value) : ""} />}
    </FieldShell>
  );
}

/* ---------- DateRangePicker ---------- */

/**
 * A quick-pick button of `DateRangePicker` ("Last 7 days"): a label plus a range, or a function that
 * builds the range when clicked.
 */
export type DateRangePreset = {
  /** The preset button's text, e.g. "Last 7 days". */
  label: string;
  /** The range, or a function that builds it when clicked (so "Last 7 days" stays current). */
  range: DateRange | (() => DateRange);
};

/**
 * Every user-facing string of `DateRangePicker` (accessible names, announcements, placeholders); pass
 * a partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type DateRangePickerLabels = {
  /** Text in the field while no range is chosen. */
  placeholder: string;
  /** Accessible name of the × button in the field. */
  clear: string;
  /** Footer button that clears the range. */
  clearRange: string;
  /** Heading of the phone sheet when there is no string `label`. */
  title: string;
  /** Accessible name of the sheet's close button. */
  close: string;
  /** Accessible name of the presets list. */
  presets: string;
  /** Footer hint before the first click. */
  pickStart: string;
  /** Footer hint after the first click. */
  pickEnd: string;
  /** Footer summary of a full range, e.g. "8 days". */
  summary: (days: number) => string;
  /** Read with the field when `required` (the label shows an asterisk). */
  required: string;
};

/**
 * Default English strings of `DateRangePickerLabels`; spread it and override single keys to reword.
 * Plain data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a
 * React Server Component receives a client reference instead of the object: read it from a client
 * component.
 */
export const defaultDateRangePickerLabels: DateRangePickerLabels = {
  placeholder: "Pick a date range",
  clear: "Clear dates",
  clearRange: "Clear",
  title: "Choose dates",
  close: "Close",
  presets: "Quick ranges",
  pickStart: "Pick a start date",
  pickEnd: "Now pick an end date",
  summary: (days) => `${days} ${days === 1 ? "day" : "days"}`,
  required: "Required",
};

/** Props of `DateRangePicker`: the options shared by both pickers plus the range, presets and labels. */
export type DateRangePickerProps = PickerCommon & {
  /** The chosen range `{ start, end }` (controlled). `null` means none. */
  value?: DateRange | null;
  /** Sets the starting range when uncontrolled. */
  defaultValue?: DateRange | null;
  /** Called with the range once both ends are picked, or `null` when cleared. */
  onValueChange?: (value: DateRange | null) => void;
  /** Months side by side when the screen has room (fewer on tablets, one on phones). Default 2. */
  numberOfMonths?: number;
  /** One-click ranges shown beside the calendar (above it on phones). */
  presets?: DateRangePreset[];
  /**
   * Let a range run across unavailable days.
   * @default false
   */
  allowUnavailableInRange?: boolean;
  /** Submit the start / end as YYYY-MM-DD with a form. */
  startName?: string;
  /** Sets the form field name for the end day. */
  endName?: string;
  /** Override the strings (i18n). */
  labels?: Partial<DateRangePickerLabels>;
};

const EMPTY: DateRange = { start: null, end: null };

/**
 * DateRangePicker: a glass field that opens a `Calendar` to pick a start and an end day (bookings, reports). Same popover on desktop and bottom sheet on phones as `DatePicker`.
 *
 * - Controlled with `value` + `onValueChange` (`{ start, end }`, or `null`), or uncontrolled with `defaultValue`. The picker closes once both ends are picked (`closeOnSelect`), and a half-picked range is discarded if the picker closes first.
 * - `numberOfMonths` shows months side by side when the screen has room (fewer on tablets, one on phones); `presets` adds one-click ranges ("Last 7 days") beside the calendar (above it on phones);
 *   `allowUnavailableInRange` lets a range run across disabled days.
 * - `startName` / `endName` submit the two days as YYYY-MM-DD with a form (or give one `name` and get `<name>-start` and `<name>-end`); form-library props (`ref`, `onBlur`, `aria-invalid`, `aria-describedby`) go to the trigger; everything else (`min`, `max`, `isDateDisabled`, `locale`, `today`, `labels`) works as on `DatePicker`.
 *
 * Keyboard: as `DatePicker`; the first Enter picks the start, the second the end; the footer says which is next. Accessibility: the field is named by the label plus the range; the calendar marks the range with `aria-selected`; presets are a labelled list of buttons.
 * Glass and motion: the same glass surfaces and spring motion as `DatePicker`; reduced motion fades.
 *
 * @example
 * ```tsx
 * import { DateRangePicker } from "@sheenui/theme";
 *
 * const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
 *
 * export function Example() {
 *   return (
 *     <DateRangePicker
 *       label="Stay"
 *       presets={[{ label: "Next 7 days", range: () => ({ start: new Date(), end: addDays(new Date(), 6) }) }]}
 *       onValueChange={(range) => console.log(range)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /forms/date-picker
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  label,
  description,
  error,
  locale,
  today: todayProp,
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  formatOptions = { month: "short", day: "numeric", year: "numeric" },
  clearable = true,
  closeOnSelect = true,
  numberOfMonths = 2,
  presets,
  allowUnavailableInRange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  required,
  startName,
  endName,
  id,
  "aria-label": ariaLabel,
  labels: labelsProp,
  calendarLabels,
  className,
  triggerClassName,
  size = "md",
  name,
  ref,
  onBlur,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DateRangePickerProps) {
  const labels = { ...defaultDateRangePickerLabels, ...labelsProp };
  const [value, setValue] = useControllable<DateRange | null>(valueProp, defaultValue, onValueChange);
  const [open, setOpenState] = useControllable(openProp, defaultOpen, onOpenChange);
  // What the calendar shows while open; only a full range is committed.
  const [draft, setDraft] = useState<DateRange>(value ?? EMPTY);
  const phone = useMediaQuery(PICKER_SHEET_QUERY);
  const viewport = useViewportWidth();
  const ids = useFieldIds(id);
  const bodyRef = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (next) setDraft(value ?? EMPTY);
    setOpenState(next);
  }

  const complete = value?.start && value.end ? value : null;
  const display =
    complete?.start && complete.end ? formatDateRange(complete.start, complete.end, locale, formatOptions) : null;

  const days = draft.start && draft.end ? differenceInDays(draft.start, draft.end) + 1 : 0;
  const hint = draft.start && draft.end ? labels.summary(days) : draft.start ? labels.pickEnd : labels.pickStart;

  const resolvedPresets = (presets ?? []).map((p) => ({
    label: p.label,
    range: typeof p.range === "function" ? p.range() : p.range,
  }));
  const isActive = (r: DateRange) => isSameDay(r.start, draft.start) && isSameDay(r.end, draft.end);
  // As many months side by side as fit the screen next to the presets (tablets get one, not
  // two stacked in a half-empty popover).
  const months = phone
    ? 1
    : monthsThatFit(Math.max(1, Math.floor(numberOfMonths)), resolvedPresets.length > 0, viewport);

  const trigger = (
    <button
      type="button"
      id={ids.trigger}
      ref={ref}
      onBlur={onBlur}
      disabled={disabled}
      {...triggerAria(ids, {
        label,
        ariaLabel,
        error,
        description,
        required,
        describedBy: ariaDescribedBy,
        invalid: ariaInvalid,
      })}
      className={cn(
        triggerBase,
        fieldHeight[size],
        !(clearable && complete) && "pe-3.5",
        (Boolean(error) || ariaInvalid === true || ariaInvalid === "true") &&
          "border-sheen-danger data-popup-open:border-sheen-danger",
        triggerClassName,
      )}
    >
      <CalendarIcon className="size-4 shrink-0 text-sheen-fg-muted" />
      <span id={ids.value} className={cn("min-w-0 flex-1 truncate", !display && "text-sheen-fg-subtle")}>
        {display ?? labels.placeholder}
      </span>
      {!(clearable && complete) && <ChevronIcon className="size-4 shrink-0 text-sheen-fg-muted" />}
    </button>
  );

  return (
    <FieldShell
      slot="date-range-picker"
      label={label}
      labelId={ids.label}
      triggerId={ids.trigger}
      description={description}
      descriptionId={ids.description}
      error={error}
      errorId={ids.error}
      required={required}
      requiredId={ids.required}
      requiredLabel={labels.required}
      ariaLabel={ariaLabel}
      ariaLabelId={ids.ariaLabel}
      className={className}
    >
      <div className="relative">
        <PickerSurface
          phone={phone}
          open={open}
          onOpenChange={setOpen}
          trigger={trigger}
          triggerId={ids.trigger}
          title={typeof label === "string" ? label : (ariaLabel ?? labels.title)}
          closeLabel={labels.close}
          initialFocusSelector={DAY_FOCUS}
        >
          <div ref={bodyRef} className={cn("flex gap-3", phone ? "flex-col" : "flex-row")}>
            {resolvedPresets.length > 0 && (
              <ul
                aria-label={labels.presets}
                className={cn(
                  "flex shrink-0 gap-1",
                  phone
                    ? // Bleeds to the sheet's edges: matches its padding (px-3, px-4 from 360px).
                      "-mx-3 snap-x scroll-px-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] min-[360px]:-mx-4 min-[360px]:scroll-px-4 min-[360px]:px-4"
                    : "w-36 flex-col border-e border-sheen-border pe-3",
                )}
              >
                {resolvedPresets.map((preset) => {
                  const active = isActive(preset.range);
                  return (
                    <li key={preset.label} className={phone ? "snap-start" : undefined}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setDraft(preset.range);
                          setValue(preset.range);
                          if (closeOnSelect) setOpenState(false);
                        }}
                        className={cn(
                          "flex w-full items-center rounded-sheen-sm px-2.5 text-start text-sm whitespace-nowrap",
                          "h-8 any-pointer-coarse:h-11 touch-manipulation",
                          "transition-[background-color,color] duration-(--sheen-duration-fast) ease-sheen-out",
                          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                          phone && "glass-1 rounded-sheen-full px-3.5",
                          active
                            ? "bg-sheen-accent-soft font-medium text-sheen-accent"
                            : "text-sheen-fg hover:bg-sheen-hover",
                          // Windows High Contrast drops the tint: ring the active preset instead.
                          "forced-colors:aria-pressed:outline-2 forced-colors:aria-pressed:-outline-offset-2 forced-colors:aria-pressed:outline-[Highlight]",
                        )}
                      >
                        {preset.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Calendar
              mode="range"
              value={draft}
              onValueChange={(next) => {
                setDraft(next);
                if (next.start && next.end) {
                  setValue(next);
                  if (closeOnSelect) setOpenState(false);
                }
              }}
              numberOfMonths={months}
              locale={locale}
              today={todayProp}
              weekStartsOn={weekStartsOn}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              allowUnavailableInRange={allowUnavailableInRange}
              fluid={phone}
              labels={calendarLabels}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-sheen-border pt-3">
            <p aria-live="polite" className="min-w-0 truncate text-sm text-sheen-fg-muted tabular-nums">
              {hint}
            </p>
            <Button
              variant="ghost"
              size={phone ? "md" : "sm"}
              disabled={!draft.start}
              onClick={() => {
                setDraft(EMPTY);
                setValue(null);
                // This button disables itself: keep focus in the picker, on the calendar.
                requestAnimationFrame(() => bodyRef.current?.querySelector<HTMLElement>(DAY_FOCUS)?.focus());
              }}
            >
              {labels.clearRange}
            </Button>
          </div>
        </PickerSurface>
        {clearable && complete && !disabled && (
          <ClearButton
            label={labels.clear}
            onClear={() => {
              setValue(null);
              focusAfterClear(ids.trigger);
            }}
          />
        )}
      </div>
      {(startName ?? (name && `${name}-start`)) && (
        <input
          type="hidden"
          name={startName ?? `${name}-start`}
          value={complete?.start ? toISODate(complete.start) : ""}
        />
      )}
      {(endName ?? (name && `${name}-end`)) && (
        <input type="hidden" name={endName ?? `${name}-end`} value={complete?.end ? toISODate(complete.end) : ""} />
      )}
    </FieldShell>
  );
}

/* ---------- bits ---------- */

function useFieldIds(id?: string) {
  const auto = useId();
  return {
    trigger: id ?? `${auto}-trigger`,
    label: `${auto}-label`,
    ariaLabel: `${auto}-aria-label`,
    value: `${auto}-value`,
    description: `${auto}-description`,
    error: `${auto}-error`,
    required: `${auto}-required`,
  };
}

/* Widths behind monthsThatFit: a month is 280px (308px on touch screens), 24px apart;
   the popover adds 24px padding and the presets column 156px; 40px keeps it off the edges. */
const MONTH_WIDTH = 308;
const MONTH_GAP = 24;

/** The most months (up to `wanted`) that fit side by side in the viewport. */
function monthsThatFit(wanted: number, withPresets: boolean, viewport: number) {
  for (let n = wanted; n > 1; n--) {
    const need = n * MONTH_WIDTH + (n - 1) * MONTH_GAP + 24 + (withPresets ? 156 : 0) + 40;
    if (need <= viewport) return n;
  }
  return 1;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn(
        className,
        "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out group-data-popup-open/trigger:rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
