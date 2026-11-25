Canonical: https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart

# 100% Stacked Bar Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart
Sidebar name: 100% stacked bars

A 100% stacked bar chart for React that compares the mix inside each category. Hover or arrow through segments for share and value. Animated, accessible.

What it is: A React 100% stacked bar chart that scales every bar to 100%, so you can compare the mix inside each category whatever its size. Pass data as readonly ChartRow[]: one object per bar: the index key plus one number per series key (shares are worked out for you).

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/percent-bar-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > 100% stacked bars

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{percent-bar-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
- `components/charts/chart-parts/`
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

Registry item: percent-bar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { PercentBarChart, PercentBarTable } from "@/components/sheenui/charts/percent-bar-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartSeries, PercentBarChart, PercentBarTable, seriesLegend } from "@sheenui/theme";
```

## PercentBarChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per bar: the index key plus one number per series key (shares are worked out for you). |
| index | string | required | Sets the key of the category in each row. |
| series | readonly ChartSeries[] | required | Segments, from the baseline outwards. Give each a fixed color slot. |
| layout | "horizontal" \| "vertical" | "horizontal" | "horizontal" = bars from the left (best for long names); "vertical" = columns. |
| showValues | boolean | false | Print each share inside its segment, only where it fits with room to spare. |
| height | number | 40px a row | Plot height. Horizontal bars default to 40px a row. |
| format | ((n: number) => string) | formatCompact | Formats raw values (tooltip, table). Negative values count as 0. |
| formatPercent | ((n: number) => string) | defaultFormatPercent | Formats shares, 0–100 (axis, labels, tooltip). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills). |
| labels | Partial<PercentBarChartLabels> | defaultPercentBarChartLabels | Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultPercentBarChartLabels. All 4 keys of PercentBarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## PercentBarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | Takes the same rows as the chart. |
| index | string | required | Key of each row that names its bar. |
| series | readonly ChartSeries[] | required | Takes the same series as the chart. |
| format | ((n: number) => string) | formatCompact | Formats a value for the data table cells: takes the number, returns the text shown. |
| formatPercent | ((n: number) => string) | defaultFormatPercent | Formats a share of the total for the data table cells: takes the share, returns the text shown. |
| indexLabel | string | optional, no default | Sets the header of the first column. |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |
| showTotal | boolean | true | Show a Total column (default true). |
| labels | Partial<Pick<PercentBarChartLabels, "total" \| "noData">> | defaultPercentBarChartLabels | Override the "Total" column header and the empty text. Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultPercentBarChartLabels. All 2 keys of PercentBarChartLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Horizontal, with shares

showValues prints a share inside a segment only when it fits with room to spare, on a surface chip that passes contrast on any color. Up/Down move between regions, Left/Right between segments.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { PercentBarTable, PercentBarChart } from "@/components/sheenui/charts/percent-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, seriesLegend, PercentBarTable, PercentBarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { region: "North America", free: 4200, pro: 2600, team: 1400 },
  { region: "Europe", free: 5100, pro: 2100, team: 900 },
  { region: "Asia Pacific", free: 7400, pro: 1500, team: 600 },
  { region: "Latin America", free: 2600, pro: 700, team: 180 },
];
const series: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Plan mix by region"
      legend={seriesLegend(series, "rect")}
      table={<PercentBarTable data={data} index="region" series={series} />}
    >
      <PercentBarChart showValues data={data} index="region" series={series} aria-label="Share of customers on each plan, by region" />
    </ChartCard>
  );
}
```

## Example 2 of 3: Vertical columns

layout="vertical". Left/Right move between quarters, Up/Down climb the stack.

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { PercentBarChart } from "@/components/sheenui/charts/percent-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { quarter: "Q1 ’25", desktop: 41000, mobile: 39000, tablet: 5800 },
  { quarter: "Q2 ’25", desktop: 38500, mobile: 43500, tablet: 5500 },
  { quarter: "Q3 ’25", desktop: 36200, mobile: 47800, tablet: 5300 },
  { quarter: "Q4 ’25", desktop: 33800, mobile: 52400, tablet: 5000 },
];
const series: ChartSeries[] = [
  { key: "desktop", label: "Desktop", color: 1 },
  { key: "mobile", label: "Mobile", color: 2 },
  { key: "tablet", label: "Tablet", color: 3 },
];

export function Example() {
  return <PercentBarChart layout="vertical" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />;
}
```

## Example 3 of 3: Zero rows and long names

A category whose values add up to 0 gets an empty track instead of a misleading bar; long names truncate (the full name is in the tooltip and the table).

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { PercentBarChart } from "@/components/sheenui/charts/percent-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "building", label: "Building", color: 1 },
  { key: "meetings", label: "Meetings", color: 2 },
  { key: "support", label: "Support", color: 3 },
];

export function Example() {
  return (
    <PercentBarChart
      showValues
      data={[
        { name: "Platform infrastructure and reliability", building: 52, meetings: 30, support: 18 },
        { name: "Design", building: 61, meetings: 31, support: 8 },
        { name: "New team", building: 0, meetings: 0, support: 0 }, // drawn as an empty track
      ]}
      index="name"
      series={series}
      format={(n) => n + " h"}
      aria-label="Share of time by activity, per team"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → | Vertical layout: previous / next bar. Horizontal layout: previous / next segment of the bar. |
| ↑ / ↓ | Vertical layout: previous / next segment of the bar. Horizontal layout: previous / next bar. |
| Home / End | Jump to the first / last bar. |
| Escape | Step out of a segment to the whole bar; press again to clear the reading. |

## Accessibility

- Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the segment's value and its share.
- For a non-visual reading, give ChartCard's table prop a PercentBarTable; the Chart / Table tabs then expose each value as plain table cells.
- With reduced motion on, the segments start at their final shares and a data change jumps straight to the new state.

## All exports on this page

- PercentBarChart — Bars that all add up to 100%, so each bar shows the mix rather than the size.
- PercentBarTable — The table view of a part-to-whole chart (PercentBarChart, or StackedAreaChart in percent mode).
- defaultPercentBarChartLabels — The built-in English strings of PercentBarChart; spread it into your own labels and change what you need.
- percentShares — Shares (0–100) of each series in each row.


## When to use the 100% stacked bar chart

- Use it as a percentage bar chart for a plan mix by region, where Free, Pro and Team customers are counted in very different volumes and you care about each region's proportions rather than its size.
- It suits time-spent breakdowns by team, such as building, meetings and support, where every row must be read as a share of 100% and long team names truncate inside a horizontal layout.
- Choose layout vertical for a quarterly device mix, where columns line up like a time series and the arrow keys climb each stack, with showValues printing a share only where a segment has room.
- Skip it when the absolute totals matter as much as the split; a regular BarChart keeps the size of each category visible, and Marimekko chart shows both width and share together.
- Pair it with ChartCard for the title, legend and Chart / Table tabs, seriesLegend for the swatches, and PercentBarTable so every share can be read as text without relying on color.


## Frequently asked questions

### How do I build a 100% stacked bar chart in React with SheenUI?

Pass data rows, an index key such as region, and a series array with key, label and a fixed color slot from 1 to 8 to PercentBarChart, plus a required aria-label. Every row is scaled to 100%, and negative values count as 0.

### What happens to a category whose values are all zero?

It gets an empty track instead of a misleading bar, so a new team with no data yet does not look like a full or broken bar. The page demo shows a row named New team with every value at 0, drawn as an empty track.

### Which keys move between segments with the keyboard?

The chart is one tab stop. In the horizontal layout, Up and Down move between bars and Left and Right between segments; in the vertical layout the pairs swap. Home and End jump to the first or last bar, and Escape clears the readout.

### Can I show the percentage inside each segment?

Set showValues. A share is printed only when it fits with room to spare, on a surface chip that keeps contrast on any segment color. Use formatPercent to change the format, and the tooltip still gives the raw value and the share.


## Related pages

- [Bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list)
- [Beeswarm](https://lokendra-builds.github.io/sheenui/charts/beeswarm)
- [Box plot & violin](https://lokendra-builds.github.io/sheenui/charts/box-plot)
- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart)
- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
