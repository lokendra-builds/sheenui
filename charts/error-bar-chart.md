Canonical: https://lokendra-builds.github.io/sheenui/charts/error-bar-chart

# Error Bar Chart for React: Confidence Intervals

URL: https://lokendra-builds.github.io/sheenui/charts/error-bar-chart
Sidebar name: Error bars

A React error bar chart with bars, points or a shaded confidence band. Whiskers show the interval, with keyboard reading and a table view. Accessible.

What it is: A React error bar chart that draws an estimate with its confidence interval as bars, points or a shaded band. Pass data as readonly ErrorBarItem[]: one item per mark, { label, value, low, high }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/error-bar-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Error bars

Files to copy from `theme/src/`:

- `components/charts/{error-bar-chart.tsx, bar-flip.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/error-bar-chart/`
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

Registry item: error-bar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ErrorBarChart } from "@/components/sheenui/charts/error-bar-chart";
import { type ErrorBarItem, errorBarLegend } from "@/components/sheenui/charts/error-bar-chart/model";
import { ErrorBarTable } from "@/components/sheenui/charts/error-bar-chart/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, ErrorBarChart, type ErrorBarItem, errorBarLegend, ErrorBarTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ErrorBarItem[] | required | One item per mark: { label, value, low, high, color? }. |
| variant | "bar" \| "point" \| "band" | "bar" | "bar": bars from the baseline with a whisker; "point": a dot with a whisker (for estimates and effects); "band": a line with a shaded confidence band over ordered categories (a time series). |
| baseline | number | 0 | Where the bars start (variant "bar"). |
| reference | { value: number; label: string; } | optional, no default | A reference line, e.g. { value: 0, label: "No effect" }. |
| showValues | boolean | true | Print each estimate next to its mark (not on a band). |
| color | ChartColor | 1 | Sets the palette slot (1–8) used for the whole chart. |
| patterns | boolean | true when item colours > 3 | Tell items of different colours apart without colour: hatched bars, and different marker shapes for points and bands (the first colour stays solid and round). |
| height | number | 300 | Height of the plot in px. Bars and points grow with the number of rows; a band chart uses it as is. |
| valueLabel | string | optional, no default | Names the value axis. |
| intervalLabel | string | labels.intervalName | Names the interval in the legend, readout and table (e.g. "95% CI"). |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<ErrorBarChartLabels> | defaultErrorBarChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultErrorBarChartLabels. All 9 keys of ErrorBarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## ErrorBarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ErrorBarItem[] | required | One item per mark: { label, value, low, high, color? }. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<ErrorBarChartLabels> | defaultErrorBarChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultErrorBarChartLabels. All 9 keys of ErrorBarChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| valueLabel | string | optional, no default | Names the value axis. |
| intervalLabel | string | labels.intervalName | Names the interval in the legend, readout and table (e.g. "95% CI"). |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Bars and points

Conversion rate per variant with a 95% interval. Bars grow from the baseline and the whiskers draw outwards; switch to points when the baseline is not meaningful.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ErrorBarChart } from "@/components/sheenui/charts/error-bar-chart";
import { errorBarLegend, type ErrorBarItem } from "@/components/sheenui/charts/error-bar-chart/model";
import { ErrorBarTable } from "@/components/sheenui/charts/error-bar-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ErrorBarChart, ErrorBarTable, errorBarLegend, type ErrorBarItem } from "@sheenui/theme";

const variants: ErrorBarItem[] = [
  { label: "Control", value: 12.4, low: 11.1, high: 13.7 },
  { label: "Variant A", value: 14.2, low: 12.9, high: 15.5 },
  { label: "Variant B", value: 13.1, low: 11.4, high: 14.8 },
];

export function Example() {
  return (
    <ChartCard
      title="Conversion rate"
      legend={errorBarLegend("Rate", "95% interval")}
      table={<ErrorBarTable data={variants} valueLabel="Rate (%)" intervalLabel="95% interval" caption="Conversion rate by variant" />}
    >
      <ErrorBarChart
        data={variants}
        variant="bar"
        valueLabel="Conversion rate (%)"
        aria-label="Conversion rate by variant, with 95% intervals"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Effects against a reference line

variant="point" with a reference line at 0: an effect whose whisker crosses the line is not clearly different from "no change". Values and ends are printed in the tooltip and the table.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ErrorBarChart } from "@/components/sheenui/charts/error-bar-chart";
import { type ErrorBarItem } from "@/components/sheenui/charts/error-bar-chart/model";
import { ErrorBarTable } from "@/components/sheenui/charts/error-bar-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ErrorBarChart, ErrorBarTable, type ErrorBarItem } from "@sheenui/theme";

const effects: ErrorBarItem[] = [
  { label: "New onboarding", value: 4.2, low: 1.8, high: 6.6 },
  { label: "Social proof", value: 0.8, low: -1.5, high: 3.1 },
  { label: "Price anchor", value: -3.4, low: -6.2, high: -0.6 },
];

export function Example() {
  return (
    <ChartCard
      title="Change in sign-ups"
      table={<ErrorBarTable data={effects} valueLabel="Change (pp)" caption="Change in sign-up rate" />}
    >
      <ErrorBarChart
        data={effects}
        variant="point"
        reference={{ value: 0, label: "No change" }}
        valueLabel="Change in sign-up rate (percentage points)"
        aria-label="Change in sign-up rate by experiment"
      />
    </ChartCard>
  );
}
```

## Example 3 of 3: Confidence band

variant="band": a line through the estimates with the interval shaded around it, widening as the forecast looks further ahead. The band fades in, the line draws on.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ErrorBarChart } from "@/components/sheenui/charts/error-bar-chart";
import { type ErrorBarItem } from "@/components/sheenui/charts/error-bar-chart/model";
import { ErrorBarTable } from "@/components/sheenui/charts/error-bar-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ErrorBarChart, ErrorBarTable, type ErrorBarItem } from "@sheenui/theme";

const forecast: ErrorBarItem[] = [
  { label: "Jan", value: 120, low: 114, high: 126 },
  { label: "Feb", value: 133, low: 125, high: 141 },
  { label: "Mar", value: 146, low: 136, high: 156 },
  { label: "Apr", value: 151, low: 139, high: 163 },
];

export function Example() {
  return (
    <ChartCard
      title="Revenue forecast"
      table={<ErrorBarTable data={forecast} valueLabel="Revenue ($K)" caption="Revenue forecast" />}
    >
      <ErrorBarChart data={forecast} variant="band" height={260} aria-label="Revenue forecast with a confidence band" />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↑ / ↓ | Bars and points: move between items. |
| ← / → | Band: move between points (flipped in right-to-left text). |
| Home / End | Jump to the first / last item. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces each item, its estimate and both ends of its interval.
- The interval is a drawn whisker with end caps (or a dashed-edged band), a shape rather than a colour, and its ends are printed as numbers in the tooltip and in ErrorBarTable.
- Reduced motion: bars, whiskers and the band appear at once and data changes jump instead of gliding.

## All exports on this page

- ErrorBarChart — An error bar chart: an estimate for each item with the interval around it, drawn as a whisker.
- ErrorBarTable — Every item with its estimate and the lower and upper end of its interval.
- defaultErrorBarChartLabels — The built-in English strings of ErrorBarChart; spread it into your own labels and change what you need.


## When to use the error bar chart

- Use it for A/B test results, survey estimates and model scores, where how sure a number is matters as much as the number: each bar or dot carries a whisker from the low to the high end of its interval.
- Use variant="point" with a reference line for effect sizes in the forest-plot style, so any whisker that crosses the line reads as no clear difference.
- Use variant="band" for a forecast or a measurement over time: a line of estimates with the confidence interval shaded around it, widening as the future gets less certain.
- Skip it when you have the raw observations, where a Box plot or Beeswarm shows the whole distribution, or when every value is exact and there is no interval to draw.
- Pair it with ChartCard, errorBarLegend and ErrorBarTable so the card gets a legend, a Chart / Table switch and a text version of every interval.


## Frequently asked questions

### How do I add confidence intervals to a bar chart in React?

Pass data as items with label, value, low and high. Each bar gets a whisker with end caps from low to high, and the tooltip and table print both ends. Name the interval with intervalLabel, for example 95% CI. aria-label is required.

### How do I draw a confidence band on a line?

Set variant to band. The items become the points of a line through value, with the area between low and high shaded and dashed at its edges. Use height to size it; categories sit evenly along the x axis, so keep them in order.

### Can I show a no-effect line?

Yes. reference takes { value, label } and draws a dashed line with its label, for example 0 for no change. baseline sets where bars start, and the scale always covers every interval, the baseline and the reference.

### How does keyboard use work?

Tab focuses the chart. Up and Down move between bars and points, Left and Right between the points of a band, Home and End jump to the first and last, Escape clears. Each move announces the estimate and both ends of the interval.


## Related pages

- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)
- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
