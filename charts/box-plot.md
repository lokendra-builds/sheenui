Canonical: https://lokendra-builds.github.io/sheenui/charts/box-plot

# Box Plot & Violin Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/box-plot
Sidebar name: Box plot & violin

A React box plot and violin chart to compare distributions: median, IQR whiskers, dodged outliers and full density shapes. Animated and accessible. MIT.

What it is: A React box plot compares distributions across groups; the violin variant shows the full shape, so two-peaked groups stand out. Pass data as readonly BoxPlotGroup[]: one box per group, in order.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/box-plot.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Box plot & violin

Files to copy from `theme/src/`:

- `components/charts/{box-plot.tsx, histogram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/box-plot/`
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

Registry item: box-plot. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BoxPlot } from "@/components/sheenui/charts/box-plot";
import { type BoxPlotGroup } from "@/components/sheenui/charts/box-plot/model";
import { BoxPlotTable } from "@/components/sheenui/charts/box-plot/parts";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BoxPlot, type BoxPlotGroup, BoxPlotTable, ChartCard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BoxPlotGroup[] | required | One box per group, in order. |
| variant | "box" \| "violin" | "box" | "box": box and whiskers. "violin": the density shape with a slim box inside. |
| orientation | "horizontal" \| "vertical" \| "auto" | "auto" | "auto" draws upright boxes, and turns them sideways on narrow charts or when group names wouldn't fit. |
| whisker | number \| "minmax" | 1.5 | Whisker reach in IQRs (Tukey: 1.5): points beyond are outliers. "minmax" reaches the extremes. |
| showMean | boolean | false | Mark each group's mean with a small diamond. |
| includeZero | boolean | false | Keep 0 on the value axis. |
| bandwidth | number | Silverman's rule per group | KDE bandwidth of the violins, in data units. |
| color | ChartColor | 1 | Palette slot (1–8) of every box (groups can override). |
| height | number | 300 | Height of an upright chart. Sideways charts grow with the number of groups. |
| valueLabel | string | optional, no default | Names the value axis. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the axis, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<BoxPlotLabels> | defaultBoxPlotLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBoxPlotLabels. All 17 keys of BoxPlotLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BoxPlotTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BoxPlotGroup[] | required | One box per group, in order. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the axis, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<BoxPlotLabels> | defaultBoxPlotLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultBoxPlotLabels. All 17 keys of BoxPlotLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| whisker | number \| "minmax" | 1.5 | Whisker reach in IQRs (Tukey: 1.5): points beyond are outliers. "minmax" reaches the extremes. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Box and whiskers

Page-load times in five regions, 240 visits each, with the mean as a diamond. Switch the whiskers to min–max and the outliers fold into them. Arrow between regions; up and down step through a region's outliers.

```tsx
import { BoxPlot } from "@/components/sheenui/charts/box-plot";
import { type BoxPlotGroup } from "@/components/sheenui/charts/box-plot/model";
import { BoxPlotTable } from "@/components/sheenui/charts/box-plot/parts";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, BoxPlotTable, BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Raw page-load samples in ms (a sample; yours has hundreds per region)
const regions: BoxPlotGroup[] = [
  { label: "Europe", values: [610, 702, 760, 815, 840, 905, 980, 1100, 1480] },
  { label: "North America", values: [580, 660, 720, 770, 810, 860, 930, 1020, 1390] },
  { label: "Asia Pacific", values: [700, 830, 940, 1010, 1090, 1180, 1300, 1560, 2100] },
  { label: "Africa", values: [900, 1080, 1210, 1350, 1420, 1530, 1700, 1990, 2600] },
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="Page load by region"
      table={<BoxPlotTable data={regions} whisker={1.5} format={ms} caption="Page load statistics by region" />}
    >
      <BoxPlot
        data={regions}
        whisker={1.5}
        showMean
        format={ms}
        valueLabel="Load time"
        aria-label="Page load times by region"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Violin

variant="violin" draws each group's density around a slim box. The Free plan has two peaks, casual and power users, which a box alone would hide.

```tsx
import { BoxPlot } from "@/components/sheenui/charts/box-plot";
import { type BoxPlotGroup } from "@/components/sheenui/charts/box-plot/model";
// Package build (after the first npm release, or a packed tarball): import { BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Weekly active minutes per user (a sample; yours is the full list)
const plans: BoxPlotGroup[] = [
  { label: "Free", values: [12, 18, 22, 26, 31, 20, 88, 95, 102, 24, 28, 90] },
  { label: "Pro", values: [84, 102, 118, 126, 140, 111, 97, 133, 150, 121] },
  { label: "Team", values: [120, 138, 152, 160, 171, 144, 129, 165, 182, 156] },
  { label: "Enterprise", values: [130, 168, 190, 205, 232, 177, 150, 214, 248, 196] },
];

export function Example() {
  return (
    <BoxPlot
      variant="violin"
      data={plans}
      color={3}
      valueLabel="Minutes"
      aria-label="Weekly active minutes by plan"
    />
  );
}
```

## Example 3 of 3: Precomputed, sideways, one group emphasized

Pass a summary when you only have the statistics. orientation="horizontal" lays groups out as rows; a group's own color picks it out from the rest.

```tsx
import { BoxPlot } from "@/components/sheenui/charts/box-plot";
// Package build (after the first npm release, or a packed tarball): import { BoxPlot } from "@sheenui/theme";

<BoxPlot
  orientation="horizontal"
  color={7}
  data={[
    { label: "Parcelly", summary: { low: 1, q1: 2, median: 2.5, q3: 3, high: 4.5, n: 1840, outliers: [6, 7, 9] } },
    { label: "SwiftPost", summary: { low: 1, q1: 1.5, median: 2, q3: 2.5, high: 4, n: 2210, outliers: [5.5] } },
    { label: "RoadRunner", color: 8, summary: { low: 2, q1: 3, median: 4, q3: 5, high: 7.5, n: 960, outliers: [10, 11] } },
    { label: "Postal", summary: { low: 2, q1: 3, median: 3.5, q3: 4, high: 5.5, n: 3120 } },
  ]}
  format={(n) => `${n} d`}
  includeZero
  aria-label="Delivery time by carrier"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Along the group axis: move between groups. Along the value axis: step through the focused group's outliers. |
| Home / End | Jump to the first / last group. |
| Escape | Clear the reading. |

## Accessibility

- The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the group's statistics.
- BoxPlotTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists n, quartiles, median, mean and outliers.
- With reduced motion on, the boxes and whiskers start at their final values and a data change jumps straight to the new state.

## All exports on this page

- BoxPlot — Box and whisker plots (or violins) for comparing distributions across groups: the box spans the middle 50% (Q1–Q3).
- BoxPlotTable — Every group's statistics in text: n, min, quartiles, median, max, mean and the outliers.
- boxPlotStats — Statistics for every group: computed from raw values, or taken from summary.
- defaultBoxPlotLabels — The built-in English strings of BoxPlot; spread it into your own labels and change what you need.


## When to use the box plot and violin chart

- Use it as a box and whisker chart to compare latency, session length or delivery time across plans or regions, where the middle 50 percent, the median and the outliers matter more than any single average.
- Use the violin variant when the shape of each distribution matters, such as a bimodal response-time pattern, since it draws a kernel density around a slim box instead of just five numbers.
- Feed it precomputed statistics through the summary field when your backend already returns quartiles, whiskers and sample size, so the browser does not need the raw sample.
- Skip it when you have a single group, where a Histogram shows the distribution directly, or when every individual observation should stay visible, which a Beeswarm handles better.
- Pair it with ChartCard and BoxPlotTable, which lists n, quartiles, median, mean and outliers as text, and with a SegmentedControl to switch between the box and violin variants.


## Frequently asked questions

### How do I draw a box plot in React from raw values?

Give each group a label and a values array, then set aria-label. BoxPlot computes the quartiles, whiskers and outliers for you. The whisker reaches 1.5 IQR by default, following Tukey, and points beyond it become outlier dots; set whisker to minmax to reach the extremes.

### What is the difference between the box and violin variants?

variant box draws the box and whiskers. variant violin draws each group's kernel density as a mirrored shape around a slim box and needs raw values, not summaries. The bandwidth prop overrides the default, which follows Silverman's rule per group.

### How does keyboard navigation work?

Tab focuses the chart. Arrow keys along the group axis move between groups, and arrows along the value axis step through the focused group's outliers. Home and End jump to the first and last group, Escape clears, and each move announces the group's statistics.

### Will the chart rotate on small screens?

With orientation auto it draws upright boxes and turns them sideways when the chart is narrow or the group names would not fit under the boxes. Sideways charts grow in height with the number of groups, while height only controls the upright layout.


## Related pages

- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart)
- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
