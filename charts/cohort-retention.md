Canonical: https://lokendra-builds.github.io/sheenui/charts/cohort-retention

# Cohort Retention Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/cohort-retention
Sidebar name: Cohort retention

A React cohort retention chart: one row per cohort, colored light to dark by retention, with a weighted-average row and comparing tooltips. Accessible.

What it is: A React cohort retention chart shows how many people from each starting week or month are still around. Pass data as readonly CohortRow[]: takes one row per cohort, oldest first.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/cohort-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Cohort retention

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{cohort-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/cohort-chart/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/segmented/`
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

Registry item: cohort-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { CohortChart } from "@/components/sheenui/charts/cohort-chart";
import { type CohortRow } from "@/components/sheenui/charts/cohort-chart/parts";
import { CohortTable } from "@/components/sheenui/charts/cohort-chart/table";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
```

These examples also use number-ticker: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/number-ticker.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, CohortChart, type CohortRow, CohortTable, NumberTicker } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CohortRow[] | required | Takes one row per cohort, oldest first. |
| valuesAre | "counts" \| "ratios" | "counts" | How values are given: user counts (default) or retention ratios 0–1. |
| periods | number | the longest row | Sets the number of period columns. |
| view | CohortView | optional, no default | Show retention as percentages or user counts (controlled). |
| defaultView | CohortView | "percent" | Sets the starting view when uncontrolled. |
| onViewChange | ((view: CohortView) => void) | optional, no default | Called when the person switches between the percent and count views. |
| viewToggle | boolean | true | Show the % / users switch. |
| average | boolean | true | Add a weighted-average row on top. |
| color | ChartColor | 1 | Hue of the sequential scale: a palette slot 1–8. |
| domain | [number, number] | the lowest to the highest retention after period 0 | Retention range of the colour scale (0–1). |
| steps | number | 0 | Classes on the colour scale (e.g. 5); 0 = continuous. |
| maxHeight | number | optional, no default | Tallest the table gets before it scrolls inside (its header row stays put). |
| format | ((n: number) => string) | compact numbers in locale | Formats a cohort count for the cell labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages, one decimal | Formats ratios: percentages with one decimal in locale ("41.2%"; period 0 reads "100%"). |
| locale | string | "en" | Locale of the default formats. |
| legend | boolean | true | Show the colour key. |
| onCellClick | ((cell: CohortCell) => void) | optional, no default | Called with a cell on click, Enter or Space. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to show. |
| labels | Partial<CohortChartLabels> | defaultCohortChartLabels | Every other string, for translation: labels={{ period: "…" }}; omitted keys keep the English of defaultCohortChartLabels. All 14 keys of CohortChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible name of the chart; describe what it shows. |

## CohortTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CohortRow[] | required | Takes one row per cohort, oldest first. |
| format | ((n: number) => string) | compact numbers in locale | Formats a cohort count for the cell labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<CohortChartLabels> | defaultCohortChartLabels | Every other string, for translation: labels={{ period: "…" }}; omitted keys keep the English of defaultCohortChartLabels. All 14 keys of CohortChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default formats. |
| formatPercent | ((ratio: number) => string) | percentages, one decimal | Formats ratios: percentages with one decimal in locale ("41.2%"; period 0 reads "100%"). |
| average | boolean | true | Add a weighted-average row on top. |
| valuesAre | "counts" \| "ratios" | "counts" | How values are given: user counts (default) or retention ratios 0–1. |
| periods | number | the longest row | Sets the number of period columns. |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 2: Weekly cohorts

Twelve weekly signup cohorts. Switch between percentages and user counts: one glint sweeps the new numbers in, and the colors stay on retention so cohorts of different sizes stay comparable. Tab into the grid and use the arrow keys; Ctrl+Home / Ctrl+End jump to the corners.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { CohortChart } from "@/components/sheenui/charts/cohort-chart";
import { type CohortRow } from "@/components/sheenui/charts/cohort-chart/parts";
import { CohortTable } from "@/components/sheenui/charts/cohort-chart/table";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, NumberTicker, CohortTable, CohortChart, type CohortRow } from "@sheenui/theme";

const cohorts: CohortRow[] = [
  { cohort: "Jan 5", size: 1284, values: [1284, 560, 399, 356, 300, 257 /* … */] },
  { cohort: "Jan 12", size: 1342, values: [1342, 570, 442, 356, 337 /* … */] },
  // … later cohorts have fewer periods: they haven't reached them yet
];

// Weighted week-4 retention of the cohorts that have reached week 4
const reached = cohorts.filter((row) => typeof row.values[4] === "number");
const week4 =
  reached.reduce((sum, row) => sum + (row.values[4] ?? 0), 0) /
  reached.reduce((sum, row) => sum + row.size, 0);

export function Example() {
  return (
    <ChartCard
      title="Weekly retention"
      aside={<NumberTicker value={week4} format={{ style: "percent", maximumFractionDigits: 1 }} />}
      table={<CohortTable data={cohorts} labels={{ period: (i) => `Week ${i}` }} />}
    >
      <CohortChart
        data={cohorts}
        aria-label="Weekly retention by signup cohort"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Monthly cohorts from ratios, sticky headers

valuesAre="ratios" takes retention shares (0–1) straight from your warehouse. maxHeight makes the table scroll inside its card: the header row and the cohort column stay put. steps={5} classes the colors; labels.period names the columns.

```tsx
import { CohortChart } from "@/components/sheenui/charts/cohort-chart";
// Package build (after the first npm release, or a packed tarball): import { CohortChart } from "@sheenui/theme";

<CohortChart
  data={[
    { cohort: "Jul 2025", size: 8420, values: [1, 0.366, 0.29, 0.251 /* … */] },
    // …
  ]}
  valuesAre="ratios"
  color={3}
  steps={5}
  maxHeight={300}
  average={false}
  labels={{ period: (i) => `M${i}` }}
  aria-label="Monthly retention by signup cohort"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move into the grid (one stop, on the last cell you read). |
| ← / → / ↑ / ↓ | Move between cells (mirrored on right-to-left pages). |
| Home / End | First / last reached period of the row. |
| Ctrl+Home / Ctrl+End | First / last cell of the grid. |
| Page Up / Page Down | Top / bottom row of the column. |
| Enter / Space | Call onCellClick for the cell. |
| Escape | Hide the tooltip. |

## Accessibility

- A real table with role=“grid”: screen readers hear the cohort and the period with every cell, plus the other measure (“41.2%, 529 of 1,284 users”).
- Cells not reached yet stay blank and read “Not yet reached”, never 0%.
- Text inside each cell is black or white, whichever contrasts more with its fill (at least 4.5:1).
- The view switch is a toggle group; the change is visible in every cell and in the grid's reading.
- Touch: rows are 44px tall, a tap pins the tooltip; on narrow screens it docks above the grid.

## All exports on this page

- CohortChart — Retention cohort table: one row per cohort, one column per period since it started.
- CohortTable — Every cohort as plain text: size, then "41.2% (529)" per period.
- cohortModel — Ratios and counts for every cohort, plus the weighted average of each period.
- cohortPercent — Retention as a percentage with one fixed decimal ("18.0%", never "18%" beside "18.5%"), so a column of them lines up.
- defaultCohortChartLabels — The built-in English strings of CohortChart; spread it into your own labels and change what you need.


## When to use the cohort retention chart

- Use it as a retention heatmap (a cohort analysis table) where each row is a signup month and each column is periods since signup, with the cell color showing the share of the cohort still active.
- Use it to judge whether a product change helped: the weighted-average row on top gives a baseline, and each cell tooltip compares its retention with that average.
- Show user counts as well as percentages with the built-in switch, since the color always follows retention and cohorts of different sizes stay comparable.
- Skip it when you track one population over time, where a Line chart of a single retention curve is clearer, or when the rows are not cohorts, where a Heatmap is the generic grid.
- Pair it with ChartCard for the title and export, a Select to change the cohort granularity, and onCellClick to open a user list for the clicked cell in a Drawer or Dialog.


## Frequently asked questions

### What data shape does a React cohort retention chart expect?

data is one row per cohort, oldest first, each with a cohort name, a size and values: the users still active in each period, period 0 first, with null for periods not reached yet. Set valuesAre to ratios if you pass retention as 0 to 1 instead. periods defaults to the longest row, and the first period reads 100 percent.

### Is the cohort table keyboard accessible?

It is a real ARIA grid. Tab lands on one cell, arrow keys move between cells, Home and End go along a row, and Ctrl+Home or Ctrl+End go to the corners. Enter or Space calls onCellClick, and screen readers hear the cohort and period with every cell.

### Can I control whether it shows percent or users?

Yes. view and onViewChange control it, defaultView sets the starting choice (percent by default), and viewToggle hides the switch entirely. Switching views sweeps the new numbers in with one glint across the grid, or changes instantly under reduced motion.

### How does it behave with many cohorts on a phone?

Wide or long tables scroll inside their own container, and the header row and cohort column stay put. maxHeight sets how tall the table gets before it scrolls. steps and domain let you bucket the color scale and fix its range, and color picks the hue.


## Related pages

- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)
- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)
- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
