Canonical: https://lokendra-builds.github.io/sheenui/forms/calendar

# React Calendar Component, Localized with Intl

URL: https://lokendra-builds.github.io/sheenui/forms/calendar
Sidebar name: Calendar

A glass React calendar built on Intl: locale-aware week start, translated names, full keyboard navigation and a month/year jump. Tailwind CSS v4, MIT.

What it is: A glass React calendar built on Intl, so the week starts and the month names read the way the user's locale expects.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/calendar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Calendar

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/calendar/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: calendar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Calendar } from "@/components/sheenui/calendar/calendar";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Calendar, type DateRange, GlassCard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Field name, used for native form submission and by form libraries. |
| locale | string | the browser's | BCP 47 locale for names, digits and week start. When the page is prerendered or server-rendered, pass one (e.g. "en-US") so the HTML matches what the browser renders when it hydrates. |
| today | Date | the current date | What counts as "today" (the highlighted day, the default month, the Today shortcut). |
| weekStartsOn | Weekday | optional, no default | Override the locale's first day of the week (0 = Sunday). |
| min | Date \| null | optional, no default | The earliest day that can be selected. |
| max | Date \| null | optional, no default | The latest day that can be selected. |
| isDateDisabled | ((date: Date) => boolean) | optional, no default | Mark days unavailable (still focusable, never selectable), e.g. weekends or booked days. |
| month | Date | optional, no default | Sets the first visible month when controlled. |
| defaultMonth | Date | the selection, or today | The first visible month on mount (uncontrolled). |
| onMonthChange | ((month: Date) => void) | optional, no default | Called with the first visible month when the person pages to another month. |
| numberOfMonths | number | 1 | Months shown side by side (they wrap on narrow screens). |
| showOutsideDays | boolean | only with one month | Show the neighbouring months' days in the first and last rows. |
| fixedWeeks | boolean | true | Always 6 rows, so the height never jumps between months. |
| fluid | boolean | false | Stretch to the container's width (cells share it) instead of a fixed cell size. |
| autoFocus | boolean | false | Focus the selected day (or today) on mount. |
| aria-label | string | optional, no default | Sets the accessible name of the whole calendar. |
| labels | Partial<CalendarLabels> | defaultCalendarLabels | UI strings (translate these). Every other string, for translation: labels={{ previousMonth: "…" }}; omitted keys keep the English of defaultCalendarLabels. All 11 keys of CalendarLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |
| mode (= "single") | "single" | "single" | Selection mode: one date at a time, so value is a single Date and clicking a day replaces it. |
| mode (= "range") | "range" | required | Pick a start and an end date. |
| value (mode = "single") | Date \| null | optional, no default | The selected date (controlled). null is no selection. |
| value (mode = "range") | DateRange | optional, no default | { start, end }. While picking, end is null. |
| defaultValue (mode = "single") | Date \| null | optional, no default | The selected date on mount (uncontrolled). |
| defaultValue (mode = "range") | DateRange | optional, no default | The range on mount (uncontrolled). |
| onValueChange (mode = "single") | (value: Date \| null) => void | optional, no default | Called with the new date when one is picked. |
| onValueChange (mode = "range") | (value: DateRange) => void | optional, no default | Called with { start, end } as the range is picked; end is null until the second click. |
| allowUnavailableInRange (mode = "range") | boolean | false | Let a range span unavailable days. |

## Example 1 of 3: Single date

The selected-day pill glides to the new day; months slide in the direction you travel. Click the caption for the month and year grids.

```tsx
import { useState } from "react";
import { Calendar } from "@/components/sheenui/calendar/calendar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { Calendar, GlassCard } from "@sheenui/theme";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function Example() {
  const [date, setDate] = useState<Date | null>(startOfDay(new Date()));

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-3">
      <Calendar value={date} onValueChange={setDate} aria-label="Pick a date" />
    </GlassCard>
  );
}
```

## Example 2 of 3: Range, two months, unavailable days

Pick a start, then hover (or arrow) to preview the range; a range can't cross a booked day (every 9th and 10th here). Past days are off limits. Each caption opens the month grid for its own panel.

```tsx
import { useState } from "react";
import { Calendar } from "@/components/sheenui/calendar/calendar";
import { type DateRange } from "@/components/sheenui/calendar/date-utils";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { Calendar, GlassCard, type DateRange } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const booked = (d: Date) => d.getDate() % 9 === 0 || d.getDate() % 10 === 0;

  return (
    <GlassCard className="max-w-full rounded-sheen-xl p-2 sm:p-4">
      <Calendar
        mode="range"
        numberOfMonths={2}
        min={today}
        isDateDisabled={booked}
        value={range}
        onValueChange={setRange}
        aria-label="Stay dates"
      />
    </GlassCard>
  );
}
```

## Example 3 of 3: Locales

Same component, different locale: week start, names and digits all change. Arabic also runs right to left (arrow keys follow).

```tsx
import { useState } from "react";
import { Calendar } from "@/components/sheenui/calendar/calendar";
// Package build (after the first npm release, or a packed tarball): import { Calendar } from "@sheenui/theme";

export function Example() {
  const today = new Date();
  const [locale, setLocale] = useState("ar-EG");
  const rtl = ["ar", "he", "fa"].includes(locale.split("-")[0] ?? locale);

  return (
    <div dir={rtl ? "rtl" : undefined} lang={locale}>
      <button onClick={() => setLocale(locale === "ar-EG" ? "de-DE" : "ar-EG")}>Switch language</button>
      <Calendar key={locale} locale={locale} defaultValue={today} aria-label="Localised calendar" />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Arrow keys | Move by one day (left, right) or one week (up, down); right-to-left flips left and right. |
| Home / End | Jump to the start or end of the week. |
| Page Up / Page Down | Previous or next month. |
| Shift + Page Up / Page Down | Previous or next year. |
| Enter / Space | Select the focused day (in range mode, the first press sets the start and the second the end). |

## Accessibility

- A WAI-ARIA date grid: role="grid" per month, one day in the tab order (roving tabindex), each day named with its full date.
- Today, selected, range start and end, and unavailable days are all in the name. Unavailable days stay focusable but cannot be selected.
- A polite live region announces month changes. Selection never relies on color alone.

## When to use Calendar

- Use it as an accessible calendar for a booking page where the month grid stays on screen, such as picking a check-in and check-out range for a rental, with range mode previewing the span as the pointer or keyboard focus moves.
- Use it inside an admin scheduler or a reporting filter where people jump between months and years often, since the caption opens a month grid and then a year grid for long jumps.
- Use it for a localized product: week start, month names, weekday names and even digits come from Intl, so locale="ar-EG" or "en-GB" needs no extra configuration or translation files for the grid itself.
- Skip it when the calendar should hide behind a field in a compact form; DatePicker wraps the same grid in a popover on desktop and a bottom sheet on phones, so it fits better there.
- Pair it with Popover to build your own trigger, with Field and Label for naming the grid in a form, and with Badge or Button to show the chosen range and a clear action beside it.


## Frequently asked questions

### How do I select a date range in a React calendar?

Pass mode="range" and read value or onValueChange as an object with start and end. While the person is picking, end is null until the second click. By default a range cannot cross an unavailable day; set allowUnavailableInRange to let it span booked or disabled days.

### Which keys work inside the Calendar?

It follows the WAI-ARIA date grid: arrows move by day or week, Home and End go to the week's edges, Page Up and Page Down change the month, and Shift with them changes the year. Enter or Space selects. Only one day is in the tab order, and right-to-left flips Left and Right.

### How do I block weekends or already booked days?

Give isDateDisabled a function that returns true for those dates, and use min and max for outer limits. Unavailable days stay focusable so keyboard users can still land on them, and they are named as unavailable for screen readers, but they can never be selected.

### Why does my server-rendered Calendar cause a hydration mismatch?

Both locale and today default to the browser's values, which differ between server and client. Pass an explicit locale such as en-US and a fixed today date on prerendered pages, tests and screenshots, and the HTML will match what hydrates. The component is marked use client.


## Related pages

- [Color picker](https://lokendra-builds.github.io/sheenui/forms/color-picker)
- [Date picker](https://lokendra-builds.github.io/sheenui/forms/date-picker)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [File upload](https://lokendra-builds.github.io/sheenui/forms/file-upload)
- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
