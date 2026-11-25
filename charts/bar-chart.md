Canonical: https://lokendra-builds.github.io/sheenui/charts/bar-chart

# React Bar Chart: Grouped, Stacked & Horizontal

URL: https://lokendra-builds.github.io/sheenui/charts/bar-chart
Sidebar name: Bar chart

Animated React bar charts, grouped, stacked or horizontal, with rounded thin bars, tooltips, keyboard reading and a table view. Accessible, Tailwind v4.

What it is: A React bar chart compares values as animated bars in grouped, stacked or horizontal layouts, each with tooltips, keyboard reading and a table view. Pass data as readonly ChartRow[]: one object per category: the index key plus one number per series key.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bar-chart.json
```

By Lokendra Singh Rathore. Published November 10, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Bar chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{bar-chart.tsx, chart-annotations.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-sync.tsx, chart-utils.ts}`
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

Registry item: bar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BarChart, ChartCard, type ChartSeries, ChartTable, seriesLegend } from "@sheenui/theme";
```

## BarChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per category: the index key plus one number per series key, e.g. { day: "Mon", orders: 12 }. |
| index | string | required | Key of each row that names its category (the axis label), e.g. "day". |
| series | readonly CompareSeries[] | required | The bars. Give a series a compareKey to mark its previous period on each bar (unstacked). |
| layout | "horizontal" \| "vertical" | "vertical" | "vertical" = columns rising from the x-axis; "horizontal" = bars from the left (best for long category names). |
| stacked | boolean | false | Stack series on top of each other instead of side by side. Negative values stack downwards from zero (a diverging stack). |
| showValues | boolean | false | Print the value at the end of each bar (single, unstacked series only). |
| height | number | 260 for columns | Chart height in px, axes and labels included. |
| format | ((n: number) => string) | optional, no default | Format values in the tooltip and labels, and on the axis (the default axis format follows the tick step). |
| locale | string | optional, no default | Locale for the default number format (e.g. "de"). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills). |
| gradient | boolean | true | A soft sheen down each bar (strongest at the value end). |
| glow | boolean | true | Soft glow on the bars being read, in dark mode. |
| hiddenSeries | readonly string[] | optional, no default | Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. |
| highlightedSeries | string \| null | optional, no default | Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. |
| annotations | readonly ChartAnnotation[] | [] | Reference lines / bands on the value axis, event markers and ranges on the categories. |
| sync | boolean | true | Inside a ChartSyncProvider: share the active category with the other charts. |
| tooltipSurface | TooltipSurface | "glass" | Tooltip surface style: "glass" (default) or "opaque" for busy charts. |
| labels | Partial<BarChartLabels> | defaultBarChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultBarChartLabels. All 3 keys of BarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required): say what is plotted, e.g. "Orders per day". |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and one number per series key. |
| index | string | required | The key in each row that names the row, such as "month". It becomes the first column. |
| series | readonly CompareSeries[] | required | Series to list as columns; one with a compareKey also gets a previous-period column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table cells. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<ChartTableLabels> | defaultChartTableLabels | Text for i18n (defaults come from the enclosing ChartCard's labels, else English). Every other string, for translation: labels={{ noData: "…" }}; omitted keys keep the English of defaultChartTableLabels. All 2 keys of ChartTableLabels are listed in the key table under the props table. |

## Example 1 of 3: Stacked bars: customers per plan

Stacked bars show the total and the split in one mark.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BarChart, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
  { month: "Aug", free: 730, pro: 454, team: 153 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return <BarChart stacked data={plans} index="month" series={planSeries} aria-label="Customers per plan, stacked" />;
}
```

## Example 2 of 3: Horizontal bars

Best for long category names. Values sit at the tip of each bar.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BarChart, type ChartSeries } from "@sheenui/theme";

const countries = [
  { country: "United States", visitors: 48200 },
  { country: "Germany", visitors: 21400 },
  { country: "India", visitors: 18900 },
  { country: "United Kingdom", visitors: 15300 },
  { country: "Brazil", visitors: 9800 },
];
const series: ChartSeries[] = [{ key: "visitors", label: "Visitors", color: 1 }];

export function Example() {
  return <BarChart layout="horizontal" showValues data={countries} index="country" series={series} aria-label="Visitors by country" />;
}
```

## Example 3 of 3: Patterns

Hatch fills tell the series apart without colour. They switch on by themselves above three series; pass patterns to force them, and give seriesLegend the same flag so the legend swatches match.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BarChart, ChartCard, ChartTable, seriesLegend, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Customers per plan"
      legend={seriesLegend(planSeries, "rect", true)}
      table={<ChartTable data={plans} index="month" indexLabel="Month" series={planSeries} />}
    >
      <BarChart patterns data={plans} index="month" series={planSeries} aria-label="Customers per plan, hatched" />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move through the Chart / Table tabs, then the legend keys, then the chart itself. |
| ← → (↑ ↓) | Read the previous or next point; the values are announced. |
| Home / End | Jump to the first or last point. |
| Escape | Clear the active point. |
| Enter / Space on a legend key | Hide or show that series. |

## Accessibility

- Tab focuses the chart as one stop; the arrow keys read one category at a time and announce each series value in it.
- The Chart / Table tabs switch to a BarTable: one row per category, one column per series, with a caption and row headers; negative values keep their sign.
- With more than three series (or patterns) the bars get hatch fills, so the legend works without color.
- Reduced motion: bars appear at their final length and data changes jump.

## When to use a bar chart

Use a React bar chart to compare values across categories: plans, countries, products or weeks. Bars start at zero, so their lengths compare honestly. Choose grouped bars to compare series side by side, stacked bars to show a total and its parts, and horizontal bars when the labels are long.

For a ranked list with inline values try [the bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list); for positive and negative values, [the diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar); for shares that always add up to 100 percent, [the 100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart). A trend over time reads better in [a line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart).


## Frequently asked questions

### How do I make a stacked or horizontal bar chart in React?

Pass stacked for stacked bars and layout="horizontal" for horizontal ones; showValues prints the value at the tip of each bar.

### Are the bars readable by screen readers?

Yes. The chart is a focusable group, the arrow keys read one category at a time, and the Table tab holds the same data.

### Grouped, stacked or horizontal bars?

Grouped (the default) compares series within a category. Stacked compares totals, but only the bottom segment sits on a common baseline, so the upper ones are hard to compare. Horizontal (layout="horizontal") suits long category names and rankings.

### Can bars show the previous period?

Yes. Give a series a compareKey and each bar gets a mark at the previous value. This works for unstacked bars; stacked bars do not draw it.

### Does the value axis start at zero?

Yes. Bar length is the encoding, so the baseline stays at zero; a truncated bar axis misleads. For values far from zero use a line chart with zero set to false.

### How are negative values drawn?

Below the baseline. The Table tab shows the signed number, so the direction never depends on the bar alone.

### What does the Table tab contain?

A real table made with BarTable: one row per category, one column per series, a caption, column headers and row headers. With more than three series the bars also get hatch patterns, so the legend does not rely on color alone.


## All exports on this page

- BarChart — A column or bar chart for comparing values across categories, grouped or stacked, with optional previous-period marks.
- BarTable — The table view of a BarChart: one row per category, one column per series.
- defaultBarChartLabels — The built-in English strings of BarChart; spread it into your own labels and change what you need.


## Related pages

- [Bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
