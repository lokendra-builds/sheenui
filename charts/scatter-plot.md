Canonical: https://lokendra-builds.github.io/sheenui/charts/scatter-plot

# Scatter Plot & Bubble Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/scatter-plot
Sidebar name: Scatter & bubble chart

A React scatter plot and bubble chart with nearest-point hover, arrow-key navigation and a least-squares trend line in one prop. Animated, accessible, MIT.

What it is: A React scatter plot and bubble chart that shows how two measures relate, one dot per item, with an optional trend line. Pass series as readonly ScatterSeries[]: each a label plus a data array of { x, y } points, with an optional size for bubbles.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/scatter-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Scatter & bubble chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{scatter-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: scatter-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { ScatterChart, scatterLegend, type ScatterSeries, ScatterTable } from "@/components/sheenui/charts/scatter-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, formatCompact, ScatterChart, scatterLegend, type ScatterSeries, ScatterTable } from "@sheenui/theme";
```

## ScatterChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| series | readonly ScatterSeries[] | required | Up to 3 series: in a scatter every colour sits next to every other, so a 4th would be hard to tell apart. Series past the third fold into one neutral "Other" series. |
| xLabel | string | optional, no default | Name of the x measure: titles the axis and the tooltip. |
| yLabel | string | optional, no default | Name of the y measure: titles the axis and the tooltip. |
| sizeLabel | string | optional, no default | Sets the name of the size measure (bubble charts). |
| bubble | boolean | false | Size each point by its size (a bubble chart). |
| trendline | boolean | false | Draw a least-squares trend line through each series (needs 2+ points with different x). |
| includeZero | boolean | false | Keep 0 on the axes even when the data sits far from it. |
| height | number | 300 | Height of the chart in px; the width follows the container. |
| formatX | ((n: number) => string) | formatCompact | Formats x values on the axis and in the tooltip. |
| formatY | ((n: number) => string) | formatCompact | Formats y values on the axis and in the tooltip. |
| formatSize | ((n: number) => string) | formatCompact | Formats bubble sizes in the tooltip. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<ScatterChartLabels> | defaultScatterChartLabels | Every other string, for translation: labels={{ x: "…" }}; omitted keys keep the English of defaultScatterChartLabels. All 10 keys of ScatterChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |
| scatterLegend(series) | LegendItem[] | optional, no default | Returns legend items with the same “Other” fold. |
| linearRegression(points) | { slope, intercept, r2 } \| null | optional, no default | The fit the trend line uses. |

## ScatterTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<ScatterChartLabels> | defaultScatterChartLabels | Every other string, for translation: labels={{ x: "…" }}; omitted keys keep the English of defaultScatterChartLabels. All 10 keys of ScatterChartLabels are listed in the key table under the props table. |
| series | readonly ScatterSeries[] | required | Up to 3 series: in a scatter every colour sits next to every other, so a 4th would be hard to tell apart. Series past the third fold into one neutral "Other" series. |
| bubble | boolean | false | Size each point by its size (a bubble chart). |
| xLabel | string | optional, no default | Name of the x measure: titles the axis and the tooltip. |
| yLabel | string | optional, no default | Name of the y measure: titles the axis and the tooltip. |
| sizeLabel | string | optional, no default | Sets the name of the size measure (bubble charts). |
| formatX | ((n: number) => string) | formatCompact | Formats x values on the axis and in the tooltip. |
| formatY | ((n: number) => string) | formatCompact | Formats y values on the axis and in the tooltip. |
| formatSize | ((n: number) => string) | formatCompact | Formats bubble sizes in the tooltip. |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |

## Example 1 of 3: Scatter with trend lines

Two series, each with its own fitted trend (dotted, so it never reads as data). Their slope and R² are part of the chart's accessible name.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { scatterLegend, ScatterTable, ScatterChart, type ScatterSeries } from "@/components/sheenui/charts/scatter-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, formatCompact, scatterLegend, ScatterTable, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Search",
    color: 1,
    data: [
      { x: 2400, y: 11800, label: "Week 1" },
      { x: 3600, y: 15200, label: "Week 2" },
      { x: 4800, y: 18900, label: "Week 3" },
      { x: 6100, y: 22100, label: "Week 4" },
    ],
  },
  {
    label: "Social",
    color: 2,
    data: [
      { x: 2100, y: 12800, label: "Week 1" },
      { x: 3300, y: 14600, label: "Week 2" },
      { x: 4500, y: 17900, label: "Week 3" },
      { x: 5900, y: 19400, label: "Week 4" },
    ],
  },
];

export function Example() {
  return (
    <ChartCard
      title="Ad spend vs revenue"
      legend={scatterLegend(series)}
      table={<ScatterTable series={series} xLabel="Spend" yLabel="Revenue" formatX={usd} formatY={usd} />}
    >
      <ScatterChart
        trendline
        series={series}
        xLabel="Weekly spend"
        yLabel="Weekly revenue"
        formatX={usd}
        formatY={usd}
        aria-label="Weekly ad spend against revenue, by channel"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Bubble chart

bubble sizes each point by area (4× the population is 4× the ink, not 16×). Big bubbles sit behind small ones, each with a surface ring, so every city stays visible and reachable.

```tsx
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { ScatterChart, type ScatterSeries } from "@/components/sheenui/charts/scatter-chart";
// Package build (after the first npm release, or a packed tarball): import { formatCompact, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const eur = (n: number) => "€" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Europe",
    color: 1,
    data: [
      { label: "London", x: 3200, y: 5400, size: 9.0 },
      { label: "Berlin", x: 1700, y: 4300, size: 3.7 },
      { label: "Paris", x: 2300, y: 4600, size: 2.1 },
    ],
  },
  {
    label: "Asia",
    color: 2,
    data: [
      { label: "Tokyo", x: 1500, y: 3800, size: 14.0 },
      { label: "Singapore", x: 3100, y: 5200, size: 5.9 },
      { label: "Bengaluru", x: 520, y: 1500, size: 13.2 },
    ],
  },
  {
    label: "Americas",
    color: 3,
    data: [
      { label: "New York", x: 4200, y: 7100, size: 8.3 },
      { label: "Toronto", x: 2200, y: 4500, size: 2.8 },
      { label: "São Paulo", x: 850, y: 1600, size: 12.3 },
    ],
  },
];

export function Example() {
  return (
    <ScatterChart
      bubble
      series={series}
      xLabel="Average rent"
      yLabel="Average net salary"
      sizeLabel="Population"
      formatX={eur}
      formatY={eur}
      formatSize={(n) => n + "M"}
      aria-label="Rent against salary in nine cities, sized by population"
    />
  );
}
```

## Example 3 of 3: Edge cases

A single point gets a padded axis around it; a fourth series folds into a neutral “Other” (in a scatter every color is compared with every other, so three is the limit).

```tsx
import { ScatterChart, type ScatterSeries } from "@/components/sheenui/charts/scatter-chart";
// Package build (after the first npm release, or a packed tarball): import { ScatterChart, type ScatterSeries } from "@sheenui/theme";

const fourSeries: ScatterSeries[] = [
  { label: "Europe", color: 1, data: [{ label: "London", x: 3200, y: 5400 }, { label: "Berlin", x: 1700, y: 4300 }] },
  { label: "Asia", color: 2, data: [{ label: "Tokyo", x: 1500, y: 3800 }, { label: "Seoul", x: 1150, y: 3300 }] },
  { label: "Americas", color: 3, data: [{ label: "New York", x: 4200, y: 7100 }, { label: "Austin", x: 1900, y: 5600 }] },
  { label: "Africa", data: [{ label: "Lagos", x: 700, y: 900 }, { label: "Nairobi", x: 800, y: 1200 }] },
];

export function Example() {
  return (
    <>
      <ScatterChart series={[{ label: "Today", data: [{ x: 42, y: 1280 }] }]} aria-label="Sessions against revenue today" />
      <ScatterChart series={fourSeries} aria-label="Rent against salary by region" /> {/* the 4th is drawn as "Other" */}
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| → / ← | Next / previous point in x order. |
| ↑ / ↓ | Next / previous point in y order. |
| Home / End | Jump to the first / last point in x order. |
| Escape | Clear the reading. |

## Accessibility

- The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces the point's x, y (and size, for bubbles).
- ScatterTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- With reduced motion on, the points start at their final positions and a data change jumps straight to the new state.

## All exports on this page

- MAX_SCATTER_SERIES — In a scatter every colour is compared with every other ("all pairs"): three is the safe limit.
- ScatterChart — A scatter plot of x against y, with optional bubble sizes and trendline.
- ScatterTable — The table view of a scatter chart: one row per point, grouped by series (with the same "Other" fold).
- defaultScatterChartLabels — The built-in English strings of ScatterChart; spread it into your own labels and change what you need.
- foldScatterSeries — The series as drawn: the first three keep their colour slot, the rest fold into a neutral "Other".
- linearRegression — Least-squares fit y = slope * x + intercept, with R².
- scatterLegend — Legend items for a scatter chart, with the same "Other" fold as the chart.


## When to use the scatter plot and bubble chart

- Use it as a scatter chart with a trend line for ad spend against revenue per week, where you want to see whether two measures move together and quantify the relationship with a fitted line.
- It suits a bubble chart of cities, plotting rent against salary with bubble area showing population so a small number of large points stays visible.
- It works for comparing up to three groups, such as two campaigns, each with its own series color and its own trend line with slope and R squared.
- Skip it when one axis is categorical or time, where LineChart or BarChart fit better; for thousands of points of one variable, Beeswarm or Histogram shows the distribution more clearly.
- Pair it with ChartCard for the title, legend and Chart / Table tabs, ScatterTable for the text twin, and scatterLegend so a folded Other series is labeled the same way.


## Frequently asked questions

### How do I add a trend line to a scatter plot in React?

Set trendline on ScatterChart. It fits a least-squares line per series, drawn dotted and clipped to the plot so it never reads as data. The slope and R squared are part of the chart's accessible name. linearRegression is exported too.

### How do I turn it into a bubble chart?

Set bubble and give each point a size. Bubbles are sized by area, so four times the population is four times the ink, with a minimum of 8px across. Big bubbles sit behind small ones, each with a surface ring.

### How many series can I plot?

Up to three; series past the third fold into one neutral Other series, because in a scatter every color sits beside every other. Each series is a label, optional color and a data array of x, y, optional size, label and id.

### How do the keyboard and pointer find points?

The pointer only has to be near a point, since hit testing finds the nearest one. With the keyboard, Left and Right move through points in x order, Up and Down in y order, Home and End to the first and last in x order, and Escape clears the reading.


## Related pages

- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
