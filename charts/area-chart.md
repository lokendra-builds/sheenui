Canonical: https://lokendra-builds.github.io/sheenui/charts/area-chart

# React Area Chart with Gradient Fill

URL: https://lokendra-builds.github.io/sheenui/charts/area-chart
Sidebar name: Area chart

An animated React area chart with gradient fills, a crosshair tooltip, keyboard reading and a table view, in a color-blind-safe palette. Tailwind v4, MIT.

What it is: An animated React area chart with soft gradient fills, a crosshair tooltip and keyboard reading. Each row of readonly ChartRow[] is one x value; every series key holds a number, and its fill runs down to the zero baseline.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/line-chart.json
```

By Lokendra Singh Rathore. Published November 10, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Area chart

Files to copy from `theme/src/`:

- `components/charts/{line-chart.tsx, chart-annotations.tsx, chart-brush.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-sync.tsx, chart-utils.ts}`
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

Registry item: line-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { AreaChart } from "@/components/sheenui/charts/line-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AreaChart, ChartCard, type ChartSeries, ChartTable } from "@sheenui/theme";
```

## AreaChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per point: the index key plus one number per series key, e.g. { month: "Jan", visits: 4200 }. |
| className | string | optional, no default | Adds extra classes to the outer element. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| height | number | 260 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | optional, no default | Format values in the tooltip, labels and on the axis. Without it, values use formatCompact (or the locale's compact format) and axis ticks get exactly as many decimals as their step needs. |
| labels | Partial<LineChartLabels> | defaultLineChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultLineChartLabels. All 3 keys of LineChartLabels are listed in the key table under the props table. |
| locale | string | optional, no default | Locale for the default number format (e.g. "de"). |
| index | string | required | Key of the x-axis value in each row (e.g. "month"). |
| series | readonly CompareSeries[] | required | The lines. color is a palette slot 1–8. Give a series a compareKey to draw its previous period from that key of each row as a dashed, muted line. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour: each series gets its own marker shape (circle, square, triangle, diamond). |
| gradient | boolean | true | Area fill fades from the line to transparent (default). false: a flat soft wash. |
| glow | boolean | true | Soft glow on the active line and point in dark mode. |
| hiddenSeries | readonly string[] | optional, no default | Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. |
| highlightedSeries | string \| null | optional, no default | Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. |
| annotations | readonly ChartAnnotation[] | optional, no default | Reference lines and bands, event markers and ranges. |
| sync | boolean | true | Inside a ChartSyncProvider: share the crosshair with the other charts. |
| tooltipSurface | TooltipSurface | "glass" | Tooltip surface: "glass" (default) or "opaque" for busy charts. |
| endLabels | boolean | true | Label the end of each line (only when labels don't collide; the legend always carries identity). |
| curve | ChartCurve | "monotone" | "monotone" (default): smooth curves that never overshoot a value. "linear": straight segments. |
| zero | boolean | true | Keep zero on the value axis (default). false fits the axis to the data, for values that live far from zero (rates, prices, temperatures). Areas then fill to the bottom of the plot. |
| brush | boolean \| LineChartBrush | optional, no default | A range selector under the chart for long series (drag, keyboard, touch). |
| live | boolean \| { duration?: number; } | off; an object's duration defaults to 0.6 inside the slide hook | Streaming data: when the rows slide by (oldest out, newest in), the lines slide left instead of morphing. Pair with useLiveData(). duration = seconds per slide (default 0.6). |

## Example: Area chart with a gradient fill

The fill fades to transparent. Drag across the chart or use the arrow keys to read a month.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { AreaChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { AreaChart, ChartCard, ChartTable, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jun", visits: 9400 },
  { month: "Jul", visits: 10100 },
  { month: "Aug", visits: 11300 },
  { month: "Sep", visits: 11900 },
  { month: "Oct", visits: 12800 },
];
const series: ChartSeries[] = [{ key: "visits", label: "Visits", color: 1 }];

export function Example() {
  return (
    <ChartCard title="Visits per month" table={<ChartTable data={data} index="month" series={series} />}>
      <AreaChart data={data} index="month" series={series} aria-label="Visits per month" />
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

- Tab focuses the chart as one stop; the arrow keys read each point and announce every series value at it.
- The Chart / Table tabs give the same numbers as a LineTable, so no value depends on the gradient fill, which is decoration.
- The brush under a long series is its own tab stop: arrows, Page Up and Page Down, Home and End move the range.
- Reduced motion: the fill and line appear at once and data changes jump.

## When to use an area chart

A React area chart suits totals that accumulate or fill a range, such as traffic, storage used or active users. The gradient adds weight to the line without hiding the grid, which makes one or two series look calm and readable on a glass card.

When you need several series, [the stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart) and [the range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart) keep them readable. For plain trends compare [the React line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart), and for tiny inline trends use [a sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline).


## How the fill behaves

The fill is drawn once per series from the line down to the baseline and fades with the gradient, so a lone series reads as a soft silhouette of its own total. Two overlapping series show through each other where the lower one is the smaller, but the upper fill hides the lower line where it is the larger, so keep to one or two series and let the legend toggle the rest off.

The line on top of the fill keeps the same crosshair and point markers as the line chart, so reading a month never depends on the shading. Because the fill grows from the baseline, a truncated value axis makes a small change look like a large block of colour: leave zero on unless the title says the axis is cut.


## Frequently asked questions

### What is the difference between an area chart and a line chart?

An area chart fills the space under the line, which stresses volume and totals. Use it for one or two series; with many series the fills overlap and a line chart reads better.

### Can the gradient fill be turned off?

Yes. Set gradient to false for a flat soft wash instead of the fade. The fill follows the series color from the theme either way.

### How do I make a stacked area chart in React?

Use StackedAreaChart, which has its own page: each series stacks on the running total, and it can show percent shares. AreaChart is a LineChart with the fill turned on, so its series overlap rather than stack.

### Does the area fill start at zero?

Yes by default: the value axis keeps zero and the fill runs to the baseline. Set zero to false to fit the axis to the data; the fill then runs to the bottom of the plot, which exaggerates change, so prefer a line chart for rates and prices.

### How do I zoom into a long series?

Set brush. A range selector appears under the chart; drag its handles, or focus it and use the arrow keys, Page Up and Page Down, and Home and End.

### How do I keep an area chart accessible?

The chart is one tab stop and the arrow keys read each point and announce every series value. The Chart / Table tabs give the same numbers as a real table, so no value depends on the gradient, which is decoration.


## Related pages

- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
