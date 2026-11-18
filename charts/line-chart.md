Canonical: https://lokendra-builds.github.io/sheenui/charts/line-chart

# React Line Chart: Animated & Accessible

URL: https://lokendra-builds.github.io/sheenui/charts/line-chart
Sidebar name: Line chart

An animated React line chart with end labels, hover and arrow-key tooltips, a legend and a table view. Color-blind-safe palette in glass style. Free, MIT.

What it is: An animated React line chart with end labels, a crosshair tooltip you can drive with the arrow keys, and a table view of the same data. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/line-chart.json
```

By Lokendra Singh Rathore. Published November 10, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Line chart

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
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries, formatCompact } from "@/components/sheenui/charts/chart-utils";
import { LineChart } from "@/components/sheenui/charts/line-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartSeries, ChartTable, formatCompact, LineChart, seriesLegend } from "@sheenui/theme";
```

## LineChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per point: the index key plus one number per series key, e.g. { month: "Jan", visits: 4200 }. |
| index | string | required | Key of the x-axis value in each row (e.g. "month"). |
| series | readonly CompareSeries[] | required | The lines. color is a palette slot 1–8. Give a series a compareKey to draw its previous period from that key of each row as a dashed, muted line. |
| area | boolean | false | Fill the area under each line with a gradient that fades to transparent. |
| height | number | 260 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | optional, no default | Format values in the tooltip, labels and on the axis. Without it, values use formatCompact (or the locale's compact format) and axis ticks get exactly as many decimals as their step needs. |
| locale | string | optional, no default | Locale for the default number format (e.g. "de"). |
| endLabels | boolean | true | Label the end of each line (only when labels don't collide; the legend always carries identity). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| curve | ChartCurve | "monotone" | "monotone" (default): smooth curves that never overshoot a value. "linear": straight segments. |
| gradient | boolean | true | Area fill fades from the line to transparent (default). false: a flat soft wash. |
| zero | boolean | true | Keep zero on the value axis (default). false fits the axis to the data, for values that live far from zero (rates, prices, temperatures). Areas then fill to the bottom of the plot. |
| glow | boolean | true | Soft glow on the active line and point in dark mode. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour: each series gets its own marker shape (circle, square, triangle, diamond). |
| hiddenSeries | readonly string[] | optional, no default | Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. |
| highlightedSeries | string \| null | optional, no default | Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. |
| annotations | readonly ChartAnnotation[] | [] | Reference lines and bands, event markers and ranges. |
| brush | boolean \| LineChartBrush | optional, no default | A range selector under the chart for long series (drag, keyboard, touch). |
| sync | boolean | true | Inside a ChartSyncProvider: share the crosshair with the other charts. |
| live | boolean \| { duration?: number; } | off; an object's duration defaults to 0.6 inside the slide hook | Streaming data: when the rows slide by (oldest out, newest in), the lines slide left instead of morphing. Pair with useLiveData(). duration = seconds per slide (default 0.6). |
| tooltipSurface | TooltipSurface | "glass" | Tooltip surface: "glass" (default) or "opaque" for busy charts. |
| labels | Partial<LineChartLabels> | defaultLineChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultLineChartLabels. All 3 keys of LineChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## LineTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and one number per series key. |
| index | string | required | The key in each row that names the row, such as "month". It becomes the first column. |
| series | readonly CompareSeries[] | required | Series to list as columns; one with a compareKey also gets a previous-period column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table cells. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<ChartTableLabels> | defaultChartTableLabels | Text for i18n (defaults come from the enclosing ChartCard's labels, else English). Every other string, for translation: labels={{ noData: "…" }}; omitted keys keep the English of defaultChartTableLabels. All 2 keys of ChartTableLabels are listed in the key table under the props table. |

## Example: Line chart with three series

Hover or press the arrow keys to read a month. Click a legend key to hide a series; the axis re-fits.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { formatCompact, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { LineChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, LineChart, formatCompact, seriesLegend, type ChartSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const data = [
  { month: "Jan", organic: 4200, paid: 2100, referral: 900 },
  { month: "Feb", organic: 4800, paid: 2300, referral: 1100 },
  { month: "Mar", organic: 5600, paid: 2200, referral: 1250 },
];

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Monthly revenue by channel"
      legend={seriesLegend(series, "line")}
      table={<ChartTable data={data} index="month" series={series} format={usd} />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel" />
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

- Tab focuses the chart as one stop; the arrow keys move a crosshair one point at a time and announce the x value with every series value.
- The Chart / Table tabs switch to a LineTable: one row per x value, one column per series, with a caption and row headers.
- With more than three series (or patterns), each line gets its own dash rhythm and marker shape, so no series depends on hue.
- Reduced motion: lines appear at their final shape and data changes jump; live data stops sliding.

## When to use a line chart

Use a React line chart when the question is how a number changes over time: revenue by month, requests per second, sign-ups per week. The eye follows the slope, so a line makes trends, turning points and seasonality easy to read, and several series can share one axis without hiding each other. If you are weighing a shadcn line chart alternative, this one adds a keyboard-readable data table, a legend and the same glass styling as the other charts.

Prefer a bar chart when you compare separate categories, and an area chart when the filled volume matters. For a continuous feed, the streaming chart slides new points in. A line chart in a stat tile can shrink to a sparkline. See also [the React area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart), [the React bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart) and [the real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart), or browse [all animated React charts](https://lokendra-builds.github.io/sheenui/charts/).


## Frequently asked questions

### How do I make a React line chart accessible?

Give it an aria-label and a table view. SheenUI's line chart is a focusable group: the arrow keys move a crosshair along the data, the values are announced, and the Table tab shows the same numbers.

### Does it work with Tailwind CSS v4?

Yes. The chart reads its colors from the same design tokens as the rest of SheenUI, so it follows the light and dark theme and both style presets without extra classes.

### Can I compare with the previous period?

Yes. Give a series a compareKey and the previous value is drawn as a dashed line, with its own legend key.

### How many series can a line chart show?

Eight. The palette has eight slots and they are never cycled: a ninth series is drawn in neutral grey, so fold the smallest into an Other series instead. With more than three series, each line also gets its own dash rhythm and marker shape (patterns), so lines stay apart without color.

### Does the value axis start at zero?

Yes by default. Set zero to false to fit the axis to the data, which suits rates, prices and temperatures that live far from zero. A truncated axis exaggerates change, so say so in the chart title.

### Smooth or straight lines?

The default curve is monotone: smooth, and it never overshoots a real value, so a peak is never drawn higher than the data. Use curve="linear" when you want straight segments between readings, such as sparse measurements.

### What does the Table tab contain?

A real table made with LineTable: one row per x value, one column per series, a caption, column headers and row headers. A previous-period series gets its own column, labelled with the series name and (previous).

### Can it show live or streaming data?

Yes. Set live and pair it with useLiveData: when rows slide by, the lines slide left instead of morphing. Give people a pause control, because moving values are hard to read.


## All exports on this page

- LineChart — A multi-series line chart for trends over time or any ordered axis, with optional area wash, previous-period lines, annotations.
- LineTable — The table view of a LineChart or an AreaChart: one row per point on the x axis.
- PREVIOUS_SERIES_KEY — Legend key that hides / shows every previous-period (comparison) line at once.
- defaultLineChartLabels — The built-in English strings of LineChart; spread it into your own labels and change what you need.


## Related pages

- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
