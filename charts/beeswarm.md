Canonical: https://lokendra-builds.github.io/sheenui/charts/beeswarm

# Beeswarm Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/beeswarm
Sidebar name: Beeswarm

A React beeswarm chart: every observation as its own dot, nudged so none overlap, so the distribution shows and each item stays hoverable and named. MIT.

What it is: A React beeswarm chart plots every observation as its own dot along one axis, nudged just enough that none overlap. Pass data as readonly BeeswarmPoint[]: the observations to plot, each drawn as one dot.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/beeswarm.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Beeswarm

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{beeswarm.tsx, histogram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/histogram/`
- `components/charts/kits/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: beeswarm. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries, BeeswarmTable } from "@/components/sheenui/charts/beeswarm";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries, BeeswarmTable, ChartCard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BeeswarmPoint[] | required | The observations to plot, each drawn as one dot. |
| groups | readonly string[] | the order groups first appear in | Sets the order of the rows (by group). |
| series | readonly BeeswarmSeries[] | [] | Colour dots by series (fixed slots; up to 8, the rest fold into a grey "Other"). Without it every dot is color. |
| color | ChartColor | 1 | Palette slot (1–8) when there are no series. |
| radius | number | 4.5 | Dot radius in px; dense swarms shrink towards 3 to keep their rows from growing too tall. |
| showMedian | boolean | true | Mark each row's median with a line. |
| includeZero | boolean | false | Keep 0 on the value axis. |
| highlight | string \| string[] | optional, no default | Emphasise these points (by label or id); the rest step back. |
| valueLabel | string | optional, no default | Names the value axis. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<BeeswarmLabels> | defaultBeeswarmLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBeeswarmLabels. All 11 keys of BeeswarmLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BeeswarmTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BeeswarmPoint[] | required | The observations to plot, each drawn as one dot. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<BeeswarmLabels> | defaultBeeswarmLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBeeswarmLabels. All 11 keys of BeeswarmLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| series | readonly BeeswarmSeries[] | [] | Colour dots by series (fixed slots; up to 8, the rest fold into a grey "Other"). Without it every dot is color. |
| groups | readonly string[] | [] | Sets the order of the rows (by group). |
| valueLabel | string | optional, no default | Names the value axis. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: One swarm per group

Days from sign-up to first value for 178 accounts, by plan, with each plan's median. Switch the cohort and every account glides to its new value. Left and right move along a plan; up and down jump to the nearest value in the next plan.

```tsx
import { BeeswarmTable, Beeswarm, type BeeswarmPoint } from "@/components/sheenui/charts/beeswarm";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, BeeswarmTable, Beeswarm, type BeeswarmPoint } from "@sheenui/theme";

const accounts: BeeswarmPoint[] = [
  { id: "free-1", label: "Free account #1", group: "Free", value: 11.2 },
  { id: "free-2", label: "Free account #2", group: "Free", value: 7.9 },
  { id: "free-3", label: "Free account #3", group: "Free", value: 15.4 },
  { id: "pro-1", label: "Pro account #1", group: "Pro", value: 4.2 },
  { id: "pro-2", label: "Pro account #2", group: "Pro", value: 5.8 },
  { id: "pro-3", label: "Pro account #3", group: "Pro", value: 3.1 },
  { id: "team-1", label: "Team account #1", group: "Team", value: 2.6 },
  { id: "team-2", label: "Team account #2", group: "Team", value: 3.9 },
];
const days = (n: number) => n + " d";

export function Example() {
  return (
    <ChartCard
      title="Time to first value"
      table={<BeeswarmTable data={accounts} groups={["Free", "Pro", "Team"]} format={days} caption="Days to first value per account" />}
    >
      <Beeswarm
        data={accounts}
        groups={["Free", "Pro", "Team"]}
        format={days}
        valueLabel="Days from sign-up"
        aria-label="Days from sign-up to first value, per account and plan"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Colored by series

Employee NPS of 29 teams in one swarm, colored by department (fixed slots, with a legend). highlight keeps two teams in focus; hover any dot for its name.

```tsx
import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries } from "@/components/sheenui/charts/beeswarm";
// Package build (after the first npm release, or a packed tarball): import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries } from "@sheenui/theme";

const departments: BeeswarmSeries[] = [
  { key: "eng", label: "Engineering", color: 1 },
  { key: "gtm", label: "Sales & marketing", color: 2 },
  { key: "ops", label: "Operations", color: 3 },
  { key: "g&a", label: "G&A", color: 7 },
];

const teams: BeeswarmPoint[] = [
  { label: "Payments", series: "eng", value: 41 },
  { label: "Platform", series: "eng", value: 33 },
  { label: "Growth", series: "gtm", value: 18 },
  { label: "Support EMEA", series: "gtm", value: -12 },
  { label: "Support AMER", series: "gtm", value: 4 },
  { label: "Logistics", series: "ops", value: 9 },
  { label: "Finance", series: "g&a", value: 22 },
  { label: "People", series: "g&a", value: 27 },
];
const enps = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);

export function Example() {
  return (
    <Beeswarm
      data={teams}
      series={departments}
      highlight={["Support EMEA", "Support AMER"]}
      includeZero
      radius={6}
      format={enps}
      valueLabel="eNPS"
      labels={{ series: "Department" }}
      aria-label="Employee NPS by team, colored by department"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Along the value axis: step between dots in value order. Across groups (when there are several): jump to the nearest value in the next or previous group. |
| Home / End | Jump to the first / last dot. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the dot's value and group; every group's count and median are available as text.
- BeeswarmTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- With reduced motion on, the dots start at their final positions and a data change jumps straight to the new state.

## All exports on this page

- Beeswarm — A beeswarm: every observation as its own dot along one value axis, nudged sideways just enough that no two overlap.
- BeeswarmTable — Every point with its group, series and value, grouped by row and sorted by value.
- beeswarmLegend — Legend items for a beeswarm's series (with the same "Other" fold as the chart).
- beeswarmOffsets — Collision-free swarm offsets ("dodge"): each point, in order of x.
- defaultBeeswarmLabels — The built-in English strings of Beeswarm; spread it into your own labels and change what you need.


## When to use the beeswarm chart

- Use it as a swarm plot to show how every order value, response time or salary is distributed per group, when a box plot would hide the individual points that explain a long tail.
- Use it for a few hundred observations split by region or plan, with each row getting its own swarm and a median line, so readers can spot clusters and outliers in one glance.
- Color dots by series when a second category matters, for example plan tier inside each region; up to eight series keep their own palette slot and the rest fold into a gray Other.
- Skip it when you have thousands of points or only need summary statistics, because a Histogram or Box plot summarizes large samples without relying on individual dots being readable.
- Pair it with ChartCard and BeeswarmTable for a table view, ChartLegend to explain the series colors, and a Select to switch which grouping drives the rows.


## Frequently asked questions

### How do I make a beeswarm chart in React with grouped rows?

Pass data as an array of points, each with a value and an optional group, label and series key, plus an aria-label. Points sharing a group share a row; points without one share a single row. Use the groups prop to set row order.

### How do keyboard users read individual dots?

Tab focuses the chart, then the arrow keys along the value axis step between dots in value order. Up and Down jump to the nearest value in the next row when there are several groups, Home and End jump to the ends, and Escape clears the readout.

### Does it stay fast with many dots?

Dots are plain SVG circles moved by one frame loop, and reading a dot does not re-render them. New data lays out in the background. Dense swarms shrink the radius toward 3px, and very dense swarms cross-fade on a data change rather than gliding every dot.

### Can I highlight a few points and hide the median line?

Yes. highlight takes labels or ids of the points to emphasize while the rest step back, and showMedian (default true) can be set to false to remove the per-row median line. Give points a stable id so they glide to new positions when data changes.


## Related pages

- [Box plot & violin](https://lokendra-builds.github.io/sheenui/charts/box-plot)
- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart)
- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
