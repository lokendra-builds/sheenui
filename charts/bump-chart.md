Canonical: https://lokendra-builds.github.io/sheenui/charts/bump-chart

# Bump Chart for React: Rank Over Time

URL: https://lokendra-builds.github.io/sheenui/charts/bump-chart
Sidebar name: Bump chart

A React bump chart that shows how a ranking changes over time, with the rank in every dot, end labels and dash patterns. Animated, accessible.

What it is: A React bump chart that shows how a ranking changes over time, one line per series with the rank in every dot. Pass data as readonly ChartRow[]: one row per point in time with a number per series, plus index and series.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bump-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Bump chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{bump-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/bump-chart/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
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

Registry item: bump-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BumpChart } from "@/components/sheenui/charts/bump-chart";
import { bumpLegend } from "@/components/sheenui/charts/bump-chart/model";
import { BumpTable } from "@/components/sheenui/charts/bump-chart/table";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BumpChart, bumpLegend, BumpTable, ChartCard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per point in time: the index key plus one number per series key, e.g. { year: "2022", ada: 82, bo: 77 }. |
| index | string | required | The key of each row that names the point in time (the x axis). |
| series | readonly ChartSeries[] | required | The competing series: { key, label, color? }. Ranks are computed per row across them. |
| rankBy | "value" \| "rank" | "value" | What the numbers are: "value" ranks them in each row, "rank" treats them as ready-made ranks (1 = best). |
| higherIsBetter | boolean | true | With rankBy="value": whether a larger value ranks higher. Set false for times or error rates. |
| highlight | string | optional, no default | Emphasise one series (by key); the others step back. Hovering or reading a series does this too. |
| showLabels | boolean | true | Print the series names at the end of the lines. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (dash styles). |
| height | number | max(220, ranks × row height + padding) | Sets the height of the plot in px. It grows with the number of ranks (at least 220). |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the tooltip and table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<BumpChartLabels> | defaultBumpChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBumpChartLabels. All 9 keys of BumpChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BumpTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per point in time: the index key plus one number per series key, e.g. { year: "2022", ada: 82, bo: 77 }. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the tooltip and table: takes the number, returns the text shown. |
| labels | Partial<BumpChartLabels> | defaultBumpChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBumpChartLabels. All 9 keys of BumpChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| index | string | required | The key of each row that names the point in time (the x axis). |
| series | readonly ChartSeries[] | required | The competing series: { key, label, color? }. Ranks are computed per row across them. |
| rankBy | "value" \| "rank" | "value" | What the numbers are: "value" ranks them in each row, "rank" treats them as ready-made ranks (1 = best). |
| higherIsBetter | boolean | true | With rankBy="value": whether a larger value ranks higher. Set false for times or error rates. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Rank by revenue

Revenue per region and quarter, ranked in each quarter. The lines draw in as the chart scrolls into view; hover a dot and the other lines step back. Pick a region to keep it in colour.

```tsx
import { BumpChart } from "@/components/sheenui/charts/bump-chart";
import { bumpLegend } from "@/components/sheenui/charts/bump-chart/model";
import { BumpTable } from "@/components/sheenui/charts/bump-chart/table";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { BumpChart, BumpTable, bumpLegend, ChartCard } from "@sheenui/theme";

const regions = [
  { key: "north", label: "North" },
  { key: "south", label: "South" },
  { key: "east", label: "East" },
];
const quarters = [
  { quarter: "Q1", north: 412, south: 388, east: 301 },
  { quarter: "Q2", north: 398, south: 421, east: 335 },
  { quarter: "Q3", north: 405, south: 447, east: 392 },
  { quarter: "Q4", north: 436, south: 430, east: 441 },
];

export function Example() {
  return (
    <ChartCard
      title="Regions by revenue"
      legend={bumpLegend(regions)}
      table={<BumpTable data={quarters} index="quarter" series={regions} caption="Revenue rank by quarter" />}
    >
      <BumpChart data={quarters} index="quarter" series={regions} highlight="east" aria-label="Regions ranked by revenue, by quarter" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Lower is better, with dash patterns

higherIsBetter={false} ranks the smallest number first, here the median response time per channel. patterns gives each line its own dash style, so the lines differ without colour; it turns on by itself from four series.

```tsx
import { BumpChart } from "@/components/sheenui/charts/bump-chart";
import { bumpLegend } from "@/components/sheenui/charts/bump-chart/model";
import { BumpTable } from "@/components/sheenui/charts/bump-chart/table";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { BumpChart, BumpTable, bumpLegend, ChartCard } from "@sheenui/theme";

const channels = [
  { key: "chat", label: "Chat" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "social", label: "Social" },
];
const responseTimes = [
  { month: "Jan", chat: 4, email: 190, phone: 22, social: 95 },
  { month: "Mar", chat: 7, email: 120, phone: 21, social: 61 },
  { month: "Jun", chat: 17, email: 33, phone: 23, social: 12 },
];

export function Example() {
  return (
    <ChartCard
      title="Response time by channel"
      legend={bumpLegend(channels)}
      table={<BumpTable data={responseTimes} index="month" series={channels} higherIsBetter={false} caption="Response time rank" />}
    >
      <BumpChart
        data={responseTimes}
        index="month"
        series={channels}
        higherIsBetter={false}
        patterns
        format={(n) => n + " min"}
        aria-label="Support channels ranked by response time"
      />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → | Move to the previous / next point in time (flipped in right-to-left text). |
| ↑ / ↓ | Move to the series ranked one place higher / lower at that point. |
| Home / End | Jump to the first / last point in time. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces the series, the period, its rank and how far it moved, politely, once.
- The rank is written in each dot and the series name at the end of its line, and from four series on every line gets its own dash style (patterns), so colour never identifies a series.
- BumpTable is the table view: one row per period, one column per series, each cell its rank and value.
- Reduced motion: the lines and dots appear at once and data changes jump instead of gliding.

## All exports on this page

- BumpChart — A bump chart: how the ranking of several series changes over time.
- BumpTable — Every point in time with each series' rank (and its value), one column per series.
- defaultBumpChartLabels — The built-in English strings of BumpChart; spread it into your own labels and change what you need.


## When to use the bump chart

- Use it for league tables and leaderboards over time, such as sales regions ranked by revenue each quarter, where who is ahead matters more than by how much.
- Use it for top-N lists that reshuffle: search rankings, product popularity, support channels by response time. Set higherIsBetter to false when a smaller number ranks higher.
- Pass ready-made ranks with rankBy="rank" when your data already holds positions, and highlight one series to tell the story of a single climber or faller.
- Skip it when the size of the values matters, where a Line chart shows the gap between series, or with more than about ten series, where the lines cross too often to follow.
- Pair it with ChartCard, bumpLegend and BumpTable for the legend, the Chart / Table tabs and a text version of every rank.


## Frequently asked questions

### How do I make a bump chart in React?

Pass data as one row per point in time with a number per series, index as the key that names the row, and series as { key, label } entries. Ranks are computed per row, so the highest value ranks first. aria-label is required.

### Can I use ranks I already have?

Yes. Set rankBy to rank and the numbers are taken as positions, 1 being the best. With rankBy value, higherIsBetter decides whether a larger number ranks higher; ties keep the series order, so every rank is used once.

### How are the lines told apart without colour?

The rank is written in each dot and the series name at the end of its line. From four series on, patterns gives every line its own dash style as well. Inside a ChartCard the legend hides a series and the rest are re-ranked.

### How does keyboard use work?

Tab focuses the chart. Left and Right move through time, Up and Down move to the series one rank higher or lower, Home and End jump to the first and last point, Escape clears. Each move announces the series, period, rank and how far it moved.


## Related pages

- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)
- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
