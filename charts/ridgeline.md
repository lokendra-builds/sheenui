Canonical: https://lokendra-builds.github.io/sheenui/charts/ridgeline

# Ridgeline Chart (Joy Plot) for React

URL: https://lokendra-builds.github.io/sheenui/charts/ridgeline
Sidebar name: Ridgeline chart

A React ridgeline chart: overlapping density ridges per group, computed with a Gaussian kernel and Silverman's bandwidth, with median ticks. Accessible.

What it is: A React ridgeline chart stacks overlapping density ridges, one per group, to show how a spread shifts between groups. Pass data as readonly RidgelineGroup[]: one group per ridge, top to bottom, each with its raw values.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/ridgeline-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Ridgeline chart

Files to copy from `theme/src/`:

- `components/charts/{ridgeline-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx, streamgraph.tsx}`
- `components/button/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/streamgraph/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: ridgeline-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { RidgelineChart, type RidgelineGroup, RidgelineTable } from "@/components/sheenui/charts/ridgeline-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, RidgelineChart, type RidgelineGroup, RidgelineTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly RidgelineGroup[] | required | One group per ridge, top to bottom, each with its raw values. |
| color | ChartColor | 1 | Palette slot for the ridges (one hue: position and name tell them apart). |
| fill | "series" \| "sequential" | "series" | "series": each ridge in its colour. "sequential": filled with a light → dark ramp along the value axis. |
| bandwidth | number | Silverman's rule, per group | Sets the kernel bandwidth in value units. |
| domain | [number, number] | the data, padded by the widest bandwidth | Sets the value axis range. |
| scale | "shared" \| "each" | "shared" | "shared" (default): one density scale, so a tight distribution stands taller. "each": every ridge peaks at the same height. |
| overlap | number | 2 | How far a ridge may rise into the rows above, in rows. |
| rowHeight | number | 34 | Sets the height of each row, in px. |
| showMedian | boolean | true | Draw a tick at each group's median. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<RidgelineChartLabels> | defaultRidgelineChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRidgelineChartLabels. All 14 keys of RidgelineChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## RidgelineTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly RidgelineGroup[] | required | One group per ridge, top to bottom, each with its raw values. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<RidgelineChartLabels> | defaultRidgelineChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRidgelineChartLabels. All 14 keys of RidgelineChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| caption | string | optional, no default | Visually hidden caption that names the table. |

## Example 1 of 2: Delivery times by month

220 orders a month. Deliveries got faster and more predictable, apart from the December rush. Hover, tap or arrow through the months; switch the scale to give every ridge the same peak.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { RidgelineTable, RidgelineChart, type RidgelineGroup } from "@/components/sheenui/charts/ridgeline-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, RidgelineTable, RidgelineChart, type RidgelineGroup } from "@sheenui/theme";

// Raw minutes, one value per order (shortened here)
const data: RidgelineGroup[] = [
  { label: "Nov", values: [44, 51, 38, 62, 47, 55, 41, 49, 58, 46, 52, 43] },
  { label: "Dec", values: [58, 71, 49, 66, 83, 62, 74, 57, 69, 90, 64, 61] },
  { label: "Jan", values: [40, 46, 36, 52, 43, 49, 38, 45, 41, 50, 44, 39] },
];
const minutes = (n: number) => Math.round(n) + " min";

export function Example() {
  return (
    <ChartCard title="Delivery time" table={<RidgelineTable data={data} format={minutes} />}>
      <RidgelineChart data={data} color={7} scale="shared" format={minutes} aria-label="Delivery time by month" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Sequential fill

fill="sequential" paints each ridge with a light → dark ramp along the value axis, so position and color agree: here, salary bands by role.

```tsx
import { RidgelineChart, type RidgelineGroup } from "@/components/sheenui/charts/ridgeline-chart";
// Package build (after the first npm release, or a packed tarball): import { RidgelineChart, type RidgelineGroup } from "@sheenui/theme";

// Raw base salaries in $, one value per person (shortened here)
const salaries: RidgelineGroup[] = [
  { label: "Engineering", values: [118000, 126000, 132000, 141000, 149000, 155000, 163000, 172000] },
  { label: "Design", values: [96000, 104000, 109000, 115000, 121000, 128000, 134000, 140000] },
  { label: "Data science", values: [124000, 133000, 140000, 151000, 158000, 166000, 174000, 185000] },
  { label: "Product", values: [110000, 119000, 128000, 138000, 146000, 153000, 161000, 170000] },
];
const thousands = (n: number) => "$" + Math.round(n / 1000) + "k";

export function Example() {
  return (
    <RidgelineChart
      data={salaries}
      fill="sequential"
      color={1}
      rowHeight={40}
      format={thousands}
      aria-label="Salary by role"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart (one tab stop). |
| ↓ / → | Next ridge. |
| ↑ / ← | Previous ridge. |
| Home / End | First / last ridge. |
| Escape | Stop reading. |

## Accessibility

- The chart is one focusable figure; each ridge read by keyboard announces its median, mean, middle 50%, range and count once.
- Group names sit in their own column, never under a curve, and the active name turns bold: the ridges never rely on color to be told apart.
- The table view gives each group's count, five-number summary and mean: the exact numbers behind every curve.
- Forced colors draw every outline and median tick in CanvasText; reduced motion draws the ridges in place.

## All exports on this page

- RidgelineChart — Distributions stacked as overlapping ridges (a joyplot): how a measure is spread in each group.
- RidgelineTable — Each group's count, five-number summary and mean.
- defaultRidgelineChartLabels — The built-in English strings of RidgelineChart; spread it into your own labels and change what you need.


## When to use the ridgeline chart

- Use it as a joy plot to compare how a measure is distributed across groups, such as monthly delivery times where you want to see both the typical time and how much spread there is.
- It suits showing change in spread over time, for example orders getting faster and more predictable month by month apart from a December rush.
- Try fill sequential for salary bands by role, where a light to dark ramp along the value axis means position and color say the same thing.
- Skip it when you have only a few observations per group or need exact quartiles; BoxPlot states them directly, and Histogram shows one distribution in detail with real bin counts.
- Pair it with ChartCard and its Chart / Table tabs, RidgelineTable for the count, median, mean and range as text, and a segmented control to switch between shared and each scale.


## Frequently asked questions

### What data does a ridgeline chart expect?

An array of groups, each with a label and raw values, top to bottom. The chart computes densities itself using a Gaussian kernel with Silverman's bandwidth per group, so you pass observations, not pre-binned counts.

### How do I make ridges spikier or smoother?

Use bandwidth, in value units; smaller is spikier. By default each group gets Silverman's bandwidth. overlap controls how many rows a ridge rises into, default 2, and rowHeight sets row height in px, default 34.

### What does the scale prop do?

With the default shared, one density scale is used so a tight group stands taller. Set each to give every ridge the same peak height, which helps compare shapes. showMedian draws a dashed tick at each median by default.

### What can a reader get from each ridge?

Hovering, tapping or arrowing reads a ridge's median, mean, middle 50%, range and count. Down or Right moves to the next ridge, Up or Left to the previous, Home and End to the first and last, and Escape stops reading.


## Related pages

- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)
- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
