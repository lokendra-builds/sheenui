Canonical: https://lokendra-builds.github.io/sheenui/charts/range-area-chart

# Range Area Chart for React: Forecast Bands

URL: https://lokendra-builds.github.io/sheenui/charts/range-area-chart
Sidebar name: Range area chart

A React range area chart: a line with a min-max band, for forecasts with confidence intervals or daily lows and highs. Gaps stay gaps. Accessible, MIT.

What it is: A React range area chart draws a line inside a min-max band, such as a forecast and its confidence interval. Pass data as readonly ChartRow[]: one row per x value.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/range-area-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Range area chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{range-area-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: range-area-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, formatCompact } from "@/components/sheenui/charts/chart-utils";
import { RangeAreaChart, rangeAreaLegend, RangeAreaTable, type RangeSeries } from "@/components/sheenui/charts/range-area-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartRow, formatCompact, RangeAreaChart, rangeAreaLegend, RangeAreaTable, type RangeSeries } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per x value. Leave a value out (or null) to break the line or band there. |
| index | string | required | Key of the x value in each row (e.g. "month"). |
| series | readonly RangeSeries[] | required | 1–3 lines, each with its band. Give each a fixed color slot. |
| curve | "linear" \| "monotone" | "monotone" | "monotone" draws smooth curves that never overshoot a value; "linear" joins points with straight lines. |
| forecastFrom | string | optional, no default | The x value (e.g. "Jul") where the forecast starts: from there the line is dashed and the region is tinted and labelled. |
| zero | boolean | false | Keep zero on the value axis. Off by default: a band reads best when the axis hugs the data. |
| height | number | 280 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact | Formats values in the tooltip and on the axis (the default axis format follows the tick step). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<RangeAreaChartLabels> | defaultRangeAreaChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRangeAreaChartLabels. All 6 keys of RangeAreaChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## rangeAreaLegend / RangeAreaTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and the low and high keys of each series. |
| index | string | required | The key in each row that names the row, such as "day". It becomes the first column. |
| series | readonly RangeSeries[] | required | The range series: each names the keys that hold its low and high values. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<RangeAreaChartLabels> | defaultRangeAreaChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRangeAreaChartLabels. All 6 keys of RangeAreaChartLabels are listed in the key table under the props table. |
| forecastFrom | string | optional, no default | Mark rows from this x value on as forecast. |
| rangeAreaLegend(series, labels?) | LegendItem[] | optional, no default | Legend items for ChartCard: each line, then its band, keyed as drawn. |

## Example 1 of 2: Forecast with a confidence band

forecastFrom marks where actuals end: the line turns dashed, the region is tinted and tagged, and the band opens out from the last actual. The plot wipes in left to right; the band breathes open from its line.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact, type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { rangeAreaLegend, RangeAreaTable, RangeAreaChart, type RangeSeries } from "@/components/sheenui/charts/range-area-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, rangeAreaLegend, RangeAreaTable, RangeAreaChart, formatCompact, type ChartRow, type RangeSeries } from "@sheenui/theme";

const data: ChartRow[] = [
  { month: "Jun", revenue: 51 },
  { month: "Jul", revenue: 56 },
  { month: "Aug", revenue: 60, low: 60, high: 60 },
  { month: "Sep", revenue: 63, low: 59.5, high: 66.5 },
  { month: "Oct", revenue: 66, low: 60, high: 72.5 },
  { month: "Nov", revenue: 70, low: 61.5, high: 79 },
];
const series: RangeSeries[] = [{ key: "revenue", label: "Revenue", lower: "low", upper: "high", bandLabel: "80% interval" }];

export function Example() {
  return (
    <ChartCard
      title="Revenue forecast"
      legend={rangeAreaLegend(series)}
      table={<RangeAreaTable data={data} index="month" series={series} forecastFrom="Sep" />}
    >
      <RangeAreaChart
        data={data}
        index="month"
        series={series}
        forecastFrom="Sep"
        format={(n) => "$" + formatCompact(n) + "K"}
        aria-label="Monthly revenue with a forecast and its 80% interval"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Two series with bands

Overlapping bands stay light (14%) so both remain readable, and every band is drawn before any line. Switch the month: lines and bands morph to the new values.

```tsx
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { RangeAreaChart, type RangeSeries } from "@/components/sheenui/charts/range-area-chart";
// Package build (after the first npm release, or a packed tarball): import { RangeAreaChart, type ChartRow, type RangeSeries } from "@sheenui/theme";

const days: ChartRow[] = [
  { day: "1", lisbon: 15.2, lisbonLow: 11, lisbonHigh: 20, oslo: 2.4, osloLow: -1.2, osloHigh: 5.9 },
  { day: "2", lisbon: 16.1, lisbonLow: 12.3, lisbonHigh: 21.2, oslo: 3.1, osloLow: -0.4, osloHigh: 6.8 },
  { day: "3", lisbon: 14.8, lisbonLow: 10.5, lisbonHigh: 19.4, oslo: 1.7, osloLow: -2, osloHigh: 5 },
  { day: "4", lisbon: 15.9, lisbonLow: 11.8, lisbonHigh: 20.6, oslo: 2.9, osloLow: -0.9, osloHigh: 6.2 },
];

const series: RangeSeries[] = [
  { key: "lisbon", label: "Lisbon", lower: "lisbonLow", upper: "lisbonHigh", bandLabel: "Lisbon low–high", color: 2 },
  { key: "oslo", label: "Oslo", lower: "osloLow", upper: "osloHigh", bandLabel: "Oslo low–high", color: 7 },
];

export function Example() {
  return (
    <RangeAreaChart
      data={days}
      index="day"
      series={series}
      format={(n) => n + "°"}
      aria-label="Daily mean temperature with the low–high range"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → (↑ / ↓) | Previous / next point. |
| Home / End | Jump to the first / last point. |
| Escape | Clear the reading. |

## Accessibility

- The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every line and its band as “low to high”; gaps are read as a dash, never as 0.
- RangeAreaTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- With reduced motion on, the band and its lines start at their final values and a data change jumps straight to the new state.

## All exports on this page

- RangeAreaChart — Lines with a shaded band around each (low to high): a forecast with its uncertainty, a min/max range, a confidence interval.
- RangeAreaTable — The chart's table view: each line's value and its band as "low–high"; gaps read as a dash, never 0.
- defaultRangeAreaChartLabels — The built-in English strings of RangeAreaChart; spread it into your own labels and change what you need.
- rangeAreaLegend — Legend for a range chart: each line, then the band it carries, keyed exactly as drawn.


## When to use the range area chart

- Use it as a confidence interval chart for a revenue forecast, where forecastFrom marks the month actuals end and a dashed line and tinted region take over from the last actual value.
- It suits daily temperature or price ranges, where each point has a low and a high and the line in the middle shows the typical value.
- It also handles up to three lines with bands, such as two cities across the same two weeks, with overlapping bands kept lighter so both stay readable.
- Skip it when you only have a single value per point, where LineChart is simpler, or when you need stacked parts of a total, where StackedAreaChart is the right shape.
- Pair it with ChartCard and rangeAreaLegend so the legend names both the line and its band, and RangeAreaTable to show each value with its low to high range as text.


## Frequently asked questions

### How do I define the band around the line?

Each series object takes key, lower and upper, the data keys of its band's bounds, plus an optional bandLabel and color. The series prop is meant for one to three lines. The band uses the line's own hue at low opacity.

### How do I mark where the forecast starts?

Pass forecastFrom with the x value where actuals end. From the last actual the line turns dashed and the region is tinted and tagged with a Forecast label. Strings such as that tag can be overridden through labels.

### What happens when some data points are missing?

Leave the value out of the row. Gaps in the data stay gaps, so the line and band break there instead of dipping to zero. RangeAreaTable prints a dash for a missing value so the gap is also visible in text.

### Should the y-axis start at zero?

By default no: zero is false because a band reads best when the axis hugs the data. Set zero to keep it on the axis. curve defaults to monotone, smooth lines that never overshoot a value, or linear for straight segments.


## Related pages

- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)
- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
