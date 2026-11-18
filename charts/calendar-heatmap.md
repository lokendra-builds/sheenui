Canonical: https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap

# Calendar Heatmap for React (GitHub-Style Graph)

URL: https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap
Sidebar name: Calendar heatmap

A GitHub-style contribution graph for React: a calendar heatmap with locale-aware weeks, Intl month names and time-zone-safe dates. Accessible, MIT.

What it is: A React calendar heatmap that draws a GitHub-style contribution graph: one cell per day on sequential color steps. Pass data as readonly CalendarDatum[]: one entry per day: { date: "2026-03-04", value: 12 }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/calendar-heatmap.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Calendar heatmap

Files to copy from `theme/src/`:

- `components/charts/{calendar-heatmap.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: calendar-heatmap. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { type CalendarDatum, CalendarHeatmap, CalendarHeatmapTable } from "@/components/sheenui/charts/calendar-heatmap";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type CalendarDatum, CalendarHeatmap, CalendarHeatmapTable, ChartCard, formatCompact } from "@sheenui/theme";
```

## CalendarHeatmap

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CalendarDatum[] | required | One entry per day: { date: "2026-03-04", value: 12 }. Days without an entry count as 0. |
| year | number | optional, no default | Show one calendar year (Jan 1 – Dec 31). Otherwise start – end. |
| start | string \| Date | 364 days before end | Sets the first day shown. |
| end | string \| Date | the latest date in data (or today) | Last day shown, the right edge of the grid (a date string or a Date); days after it are left out. |
| today | string \| Date \| null | the current date | Days after this one haven't happened: they're drawn as empty outlines and read "No data yet", never as zero (unless data has a value for them). |
| weekStart | 0 \| 2 \| 1 \| 3 \| 4 \| 5 \| 6 | from locale (Monday in most of the world) | Sets the first day of the week, 0 = Sunday. |
| locale | string | "en" | Locale for month / weekday names, the default week start and the default number format. |
| color | ChartColor | 1 | Sets the hue of the levels: a palette slot, 1–8. |
| levels | number | 4 | Sets the number of non-zero levels. |
| thresholds | readonly number[] | equal steps up to the busiest day | Values where levels 2, 3, ... start. |
| cellSize | number | fits the width (11–18) | Sets the cell size in px. |
| format | ((n: number) => string) | formatCompact in locale | Formats a day's value for the tooltips, announcements and data table: takes the number, returns the text shown. |
| valueLabel | string | "" | What a value counts, e.g. "contributions". Shown in the tooltip and announcements. |
| legend | boolean | true | Show the Less / More legend. |
| onDayClick | ((day: { date: string; value: number; }) => void) | optional, no default | Called with a day on click, Enter or Space. |
| labels | Partial<CalendarHeatmapLabels> | defaultCalendarHeatmapLabels | Every other string, for translation: labels={{ less: "…" }}; omitted keys keep the English of defaultCalendarHeatmapLabels. All 6 keys of CalendarHeatmapLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible name of the chart; describe what it shows. |

## CalendarHeatmapTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CalendarDatum[] | required | One entry per day: { date: "2026-03-04", value: 12 }. Days without an entry count as 0. |
| end | string \| Date | the latest date in data (or today) | Last day shown, the right edge of the grid (a date string or a Date); days after it are left out. |
| format | ((n: number) => string) | formatCompact in locale | Formats a day's value for the tooltips, announcements and data table: takes the number, returns the text shown. |
| start | string \| Date | 364 days before end | Sets the first day shown. |
| locale | string | "en" | Locale for month / weekday names, the default week start and the default number format. |
| year | number | optional, no default | Show one calendar year (Jan 1 – Dec 31). Otherwise start – end. |
| today | string \| Date \| null | the current date | Days after this one haven't happened: they're drawn as empty outlines and read "No data yet", never as zero (unless data has a value for them). |
| caption | string | optional, no default | Visually hidden caption that names the table. |
| labels | Partial<CalendarHeatmapTableLabels> | defaultCalendarHeatmapTableLabels | Strings of the table: month / total headers and the future / notApplicable cell text. Merged over defaultCalendarHeatmapTableLabels. Every other string, for translation: labels={{ month: "…" }}; omitted keys keep the English of defaultCalendarHeatmapTableLabels. All 4 keys of CalendarHeatmapTableLabels are listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when the range has no months (never, in practice). |

## Example 1 of 2: Contributions in a year

Switch the year to see the days cross-fade to their new levels. Days after today are outlined, never painted as zero. On a phone the weeks scroll sideways inside the card (the weekday names stay put), opening on the latest week. Arrow keys move by day and week, Page Up / Page Down by month.

```tsx
import { CalendarHeatmapTable, CalendarHeatmap, type CalendarDatum } from "@/components/sheenui/charts/calendar-heatmap";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, formatCompact, CalendarHeatmapTable, CalendarHeatmap, type CalendarDatum } from "@sheenui/theme";

const data: CalendarDatum[] = [
  { date: "2026-03-04", value: 12 },
  { date: "2026-03-05", value: 4 },
  { date: "2026-03-09", value: 7 },
  { date: "2026-06-18", value: 15 },
  { date: "2026-09-02", value: 2 },
];
const total = data.reduce((sum, d) => sum + d.value, 0);

export function Example() {
  return (
    <ChartCard
      title="Contributions"
      aside={<span className="text-2xl font-semibold">{formatCompact(total)}</span>}
      table={<CalendarHeatmapTable data={data} year={2026} />}
    >
      <CalendarHeatmap
        data={data}
        year={2026}
        today="2026-10-28" // default: the current date; later days are outlined
        locale="en-GB" // week starts on Monday; month & weekday names from Intl
        valueLabel="contributions"
        aria-label="Contributions per day in 2026"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Rolling year, own levels

Without a year it shows the 365 days up to the latest entry. Thresholds set where each level starts; a different hue keeps a second calendar on the page distinct.

```tsx
import { CalendarHeatmap, type CalendarDatum } from "@/components/sheenui/charts/calendar-heatmap";
// Package build (after the first npm release, or a packed tarball): import { CalendarHeatmap, type CalendarDatum } from "@sheenui/theme";

const workouts: CalendarDatum[] = [
  { date: "2026-01-06", value: 5 },
  { date: "2026-02-14", value: 10 },
  { date: "2026-05-21", value: 3 },
  { date: "2026-08-09", value: 8 },
  { date: "2026-10-02", value: 6 },
];

export function Example() {
  return (
    <CalendarHeatmap
      data={workouts}
      color={3}
      levels={3}
      thresholds={[4, 8]} // level 1: 1–3, level 2: 4–7, level 3: 8+
      valueLabel="km"
      aria-label="Kilometres run per day, last 12 months"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the calendar (the scroller is the focusable chart). |
| ↑ / ↓ | Previous / next day. |
| ← / → | Previous / next week. |
| Page Up / Page Down | Previous / next month. |
| Home / End | Jump to the first / last day. |
| Enter / Space | Activate the day being read, when onDayClick is set. |
| Escape | Clear the reading. |

## Accessibility

- The calendar is a focusable figure named by its aria-label and described by the reading hint; the keyboard keeps the day being read in view while the weeks scroll sideways on narrow screens.
- Days that have not happened yet are outlined, never painted as zero, and every day has a text value in its tooltip and in the table view.
- CalendarHeatmapTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- With reduced motion on, the day cells start at their final colors and a data change jumps straight to the new state.

## All exports on this page

- CalendarHeatmap — A GitHub-style contribution calendar: one column per week, one row per weekday, a cell per day coloured by level.
- CalendarHeatmapTable — Every day's value as a month × day-of-month table (with a total per month).
- defaultCalendarHeatmapLabels — The built-in English strings of CalendarHeatmap; spread it into your own labels and change what you need.
- defaultCalendarHeatmapTableLabels — English defaults of CalendarHeatmapTableLabels.
- defaultCalendarLabels — The English strings of Calendar.
- isoDate — "YYYY-MM-DD" for a day number.
- localeWeekStart — First day of the week for a locale (0 = Sunday), from Intl when the browser has week info.
- toDayNumber — A calendar day from "YYYY-MM-DD" (or an ISO timestamp: its date part), a Date (its local date) or a timestamp.


## When to use the calendar heatmap

- Use it as a GitHub contribution graph for commits, workouts, check-ins or support replies per day across a year, where streaks and quiet weeks are what readers look for.
- Use it to show seasonality in daily counts, such as orders by day over twelve months, with year set to one calendar year or start and end for a rolling window.
- Make days actionable with onDayClick, for example opening that day's activity log in a side panel, while the tooltip and keyboard readout name the value using valueLabel.
- Skip it when you need to compare exact values or show a trend line, because a Bar chart or Line chart reads numbers better than five or so color levels do.
- Pair it with ChartCard for the title and a Select for the year, or with DateRangePicker when the window is arbitrary, since start and end accept any range.


## Frequently asked questions

### How do I build a calendar heatmap in React?

Pass data as entries like date 2026-03-04 and value 12, then set year or a start and end range, plus aria-label. Days without an entry count as 0. The week starts where the locale's week starts, and weekStart overrides it with 0 for Sunday through 6.

### How are future days handled?

Days after the today prop have not happened, so they are drawn as empty outlines and read No data yet instead of zero, unless data has a value for them. today defaults to the current date, and null removes the limit entirely.

### Can keyboard users move through the days?

Focus the calendar, then Up and Down move a day, Left and Right move a week, Page Up and Page Down move a month, and Home and End jump to the first and last day. Enter or Space calls onDayClick for the focused day.

### How do I control the color levels?

levels sets the number of non-zero levels and thresholds sets the values where level 2 and above begin; by default steps are equal up to the busiest day. color picks a palette slot from 1 to 8, and cellSize overrides the 11 to 18 px fit-to-width size.


## Related pages

- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
