Canonical: https://lokendra-builds.github.io/sheenui/forms/date-picker

# React Date Picker & Range Picker for Tailwind

URL: https://lokendra-builds.github.io/sheenui/forms/date-picker
Sidebar name: Date picker

A glass React date picker and range picker: popover on desktop, swipe-to-close bottom sheet on phones, locale-aware and keyboard-friendly. Free, MIT.

What it is: A glass React date picker that opens a calendar in a popover, or in a bottom sheet on phones, for single dates and ranges.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/date-picker.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Date picker

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/calendar/`
- `components/date-picker/`
- `components/button/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: date-picker. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { DatePicker, DateRangePicker, type DateRangePreset } from "@/components/sheenui/date-picker/date-picker";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, DatePicker, type DateRange, DateRangePicker, type DateRangePreset } from "@sheenui/theme";
```

## DatePicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the day as YYYY-MM-DD with a form. |
| required | boolean | optional, no default | Mark the field as required (the label shows an asterisk and "Required" is read). |
| disabled | boolean | optional, no default | Disables the whole field and its picker. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| label | ReactNode | optional, no default | Text above the field, linked to it as its accessible name (the chosen value is read after it). |
| description | ReactNode | optional, no default | Muted helper text under the field. Hidden while an error shows. |
| error | ReactNode | optional, no default | Shows an error message under the field. Marks it invalid and is announced. |
| locale | string | the browser's | BCP 47 locale for the field text and the calendar. |
| today | Date | the current date | What counts as "today" (highlighted day, Today button). |
| weekStartsOn | Weekday | the locale's | First day of the week: 0 is Sunday, 1 Monday. |
| min | Date \| null | optional, no default | The earliest day that can be selected. |
| max | Date \| null | optional, no default | The latest day that can be selected. |
| isDateDisabled | ((date: Date) => boolean) | optional, no default | Return true for days that cannot be picked (holidays, booked days). |
| formatOptions | Intl.DateTimeFormatOptions | { dateStyle: "medium" } | How the field shows the value. |
| clearable | boolean | true | Show the × button once there is a value. |
| closeOnSelect | boolean | true | Close as soon as a date (or a full range) is picked. |
| open | boolean | optional, no default | Whether the calendar is open (controlled). |
| defaultOpen | boolean | false | Open on first render (uncontrolled). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the calendar opens or closes. |
| id | string | optional, no default | Sets the id of the field button. |
| aria-label | string | optional, no default | Accessible name when there is no visible label (the value is read after it). |
| calendarLabels | Partial<CalendarLabels> | defaultCalendarLabels | Calendar UI strings (month navigation, captions). Every other string, for translation: calendarLabels={{ previousMonth: "…" }}; omitted keys keep the English of defaultCalendarLabels. All 11 keys of CalendarLabels are listed in the key table under the props table. |
| className | string | optional, no default | Class for the outer wrapper (label + field + helper text). |
| triggerClassName | string | optional, no default | Adds extra classes to the field button. |
| value | Date \| null | optional, no default | Sets the chosen day when controlled. null means none. |
| defaultValue | Date \| null | null | Sets the starting day when uncontrolled. |
| onValueChange | ((value: Date \| null) => void) | optional, no default | Called with the picked day, or null when cleared. |
| showFooter | boolean | true | Show the Today / Clear footer. |
| labels | Partial<DatePickerLabels> | defaultDatePickerLabels | Every other string, for translation: labels={{ placeholder: "…" }}; omitted keys keep the English of defaultDatePickerLabels. All 7 keys of DatePickerLabels are listed in the key table under the props table. |

## DateRangePicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Field name, used for native form submission and by form libraries. |
| required | boolean | optional, no default | Mark the field as required (the label shows an asterisk and "Required" is read). |
| disabled | boolean | optional, no default | Disables the whole field and its picker. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| size | FieldSize | "md" | Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. |
| label | ReactNode | optional, no default | Text above the field, linked to it as its accessible name (the chosen value is read after it). |
| description | ReactNode | optional, no default | Muted helper text under the field. Hidden while an error shows. |
| error | ReactNode | optional, no default | Shows an error message under the field. Marks it invalid and is announced. |
| locale | string | the browser's | BCP 47 locale for the field text and the calendar. |
| today | Date | the current date | What counts as "today" (highlighted day, Today button). |
| weekStartsOn | Weekday | the locale's | First day of the week: 0 is Sunday, 1 Monday. |
| min | Date \| null | optional, no default | The earliest day that can be selected. |
| max | Date \| null | optional, no default | The latest day that can be selected. |
| isDateDisabled | ((date: Date) => boolean) | optional, no default | Return true for days that cannot be picked (holidays, booked days). |
| formatOptions | Intl.DateTimeFormatOptions | { month: "short", day: "numeric", year: "numeric" } | How the field shows the value. |
| clearable | boolean | true | Show the × button once there is a value. |
| closeOnSelect | boolean | true | Close as soon as a date (or a full range) is picked. |
| open | boolean | optional, no default | Whether the calendar is open (controlled). |
| defaultOpen | boolean | false | Open on first render (uncontrolled). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the calendar opens or closes. |
| id | string | optional, no default | Sets the id of the field button. |
| aria-label | string | optional, no default | Accessible name when there is no visible label (the value is read after it). |
| calendarLabels | Partial<CalendarLabels> | defaultCalendarLabels | Calendar UI strings (month navigation, captions). Every other string, for translation: calendarLabels={{ previousMonth: "…" }}; omitted keys keep the English of defaultCalendarLabels. All 11 keys of CalendarLabels are listed in the key table under the props table. |
| className | string | optional, no default | Class for the outer wrapper (label + field + helper text). |
| triggerClassName | string | optional, no default | Adds extra classes to the field button. |
| value | DateRange \| null | optional, no default | The chosen range { start, end } (controlled). null means none. |
| defaultValue | DateRange \| null | null | Sets the starting range when uncontrolled. |
| onValueChange | ((value: DateRange \| null) => void) | optional, no default | Called with the range once both ends are picked, or null when cleared. |
| numberOfMonths | number | 2 | Months side by side when the screen has room (fewer on tablets, one on phones). |
| presets | DateRangePreset[] | [] | One-click ranges shown beside the calendar (above it on phones). |
| allowUnavailableInRange | boolean | false | Let a range run across unavailable days. |
| startName | string | optional, no default | Submit the start / end as YYYY-MM-DD with a form. |
| endName | string | optional, no default | Sets the form field name for the end day. |
| labels | Partial<DateRangePickerLabels> | defaultDateRangePickerLabels | Every other string, for translation: labels={{ placeholder: "…" }}; omitted keys keep the English of defaultDateRangePickerLabels. All 10 keys of DateRangePickerLabels are listed in the key table under the props table. |

## Example 1 of 4: Single date

Today / Clear in the footer, × in the field. Resize below 640px to get the bottom sheet.

```tsx
import { useState } from "react";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
// Package build (after the first npm release, or a packed tarball): import { DatePicker } from "@sheenui/theme";

export function Example() {
  const [due, setDue] = useState<Date | null>(null);

  return (
    <DatePicker label="Due date" value={due} onValueChange={setDue} description="We'll remind you the day before." />
  );
}
```

## Example 2 of 4: Bounds and unavailable days

Weekdays in the next 60 days only. The month arrows stop at the bounds.

```tsx
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
// Package build (after the first npm release, or a packed tarball): import { DatePicker } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function Example() {
  const today = startOfDay(new Date());

  return (
    <DatePicker
      label="Delivery date"
      min={today}
      max={addDays(today, 60)}
      isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      formatOptions={{ weekday: "short", day: "numeric", month: "long" }}
    />
  );
}
```

## Example 3 of 4: Date range with presets

Two months side by side where they fit beside the presets, one on tablets and phones (there the presets become a swipeable row). Hover previews the range; nothing after today.

```tsx
import { useState } from "react";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { DateRangePicker, type DateRangePreset } from "@/components/sheenui/date-picker/date-picker";
// Package build (after the first npm release, or a packed tarball): import { DateRangePicker, type DateRange, type DateRangePreset } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => startOfDay(new Date());

const PRESETS: DateRangePreset[] = [
  { label: "Today", range: () => ({ start: today(), end: today() }) },
  { label: "Last 7 days", range: () => ({ start: addDays(today(), -6), end: today() }) },
  { label: "Last 30 days", range: () => ({ start: addDays(today(), -29), end: today() }) },
  { label: "This month so far", range: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: today() }) },
];

export function Example() {
  const [period, setPeriod] = useState<DateRange | null>(null);

  return (
    <DateRangePicker label="Reporting period" value={period} onValueChange={setPeriod} max={today()} presets={PRESETS} />
  );
}
```

## Example 4 of 4: In a form

name submits YYYY-MM-DD; a range submits startName / endName. Errors show under the field.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { DatePicker } from "@/components/sheenui/date-picker/date-picker";
// Package build (after the first npm release, or a packed tarball): import { Button, DatePicker } from "@sheenui/theme";

export function Example() {
  const missing = false; // set from your validation

  return (
      <form onSubmit={(event) => { event.preventDefault(); /* validate, then submit */ }}>
        <DatePicker name="checkIn" label="Check-in" required error={missing && "Pick a check-in date."} />
        <Button type="submit">Book</Button>
      </form>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space / Arrow Down | Open the calendar from the field; focus moves to the selected day. |
| Arrow keys, Page Up / Page Down | Move inside the calendar (see the Calendar page). |
| Enter / Space | Select the focused day. A range commits only after both ends are picked. |
| Escape | Close the calendar and return focus to the field. |

## Accessibility

- The trigger is a labeled button showing the chosen date; the calendar opens in a popover, or as a swipe-to-close bottom sheet on phones.
- Focus lands on the selected day (or today) and returns to the field on close; the sheet keeps the field above the software keyboard.
- name submits an ISO date with a form; error is announced politely. Pass locale and today on prerendered pages so server and browser text match.

## All exports on this page

- DatePicker — DatePicker: a glass field that opens a Calendar to pick one day.
- DateRangePicker — DateRangePicker: a glass field that opens a Calendar to pick a start and an end day (bookings, reports).
- defaultDatePickerLabels — Default English strings of DatePickerLabels; spread it and override single keys to reword.
- defaultDateRangePickerLabels — Default English strings of DateRangePickerLabels; spread it and override single keys to reword.


## When to use the date picker

- Use it as a mobile-friendly date picker, a popover on desktop and a bottom sheet on phones, for a check-in field on a hotel or rental form where people type nothing and instead open a calendar from a labeled button, with min set to today so past dates are unavailable.
- Use DateRangePicker when you need a start and an end, for example a reporting period, where its presets such as Next 7 days let people skip the grid entirely.
- Use it in a form posted to a server: the name prop submits the chosen day as YYYY-MM-DD, so a plain form action or FormData read gets a predictable string.
- Skip it when the calendar should be permanently visible on the page, as in a scheduling sidebar; Calendar on its own does that, without the field, popover or sheet around it.
- Pair it with its own description and error props for helper text and the message, Button for a custom reset action beside it, and the calendarLabels prop when translating the grid inside the popup.


## Frequently asked questions

### How does the React date picker behave on a phone?

From 640px up it opens as a glass popover under the field. On phones it becomes a full-width bottom sheet built on Base UI Drawer that you can swipe down to close, with larger finger-sized days. Both fade instead of springing when reduced motion is on.

### Which keys open the date picker and move around it?

Enter, Space or the Down arrow on the field opens it. Inside, arrows move by day and week, Page Up and Page Down change month, and Shift with them changes year. Enter or Space picks, Escape closes and returns focus to the field, and Tab stays inside the popup.

### How do I control the open state or keep the popup open after picking?

Use open, defaultOpen and onOpenChange for the popup. By default it closes when a date is picked; set closeOnSelect={false} to keep it open. clearable (on by default) shows a clear button once there is a value, and showFooter (also on by default) controls the Today and Clear buttons.

### Why does my prerendered date picker mismatch on hydration?

A changing today causes hydration mismatches, so pass today a fixed date on prerendered pages. Also set locale explicitly so server and browser format the field the same way. formatOptions takes Intl.DateTimeFormatOptions to control how the chosen date is displayed in the field.


## Related pages

- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)
- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Rating](https://lokendra-builds.github.io/sheenui/forms/rating)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
