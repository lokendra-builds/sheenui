Canonical: https://lokendra-builds.github.io/sheenui/charts/step-line-chart

# Step Line Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/step-line-chart
Sidebar name: Step line chart

A React step line chart for values that hold, then jump: prices, plan limits, rates and headcount. Snapping crosshair and hover bands. Animated, MIT.

What it is: A React step line chart for values that hold and then jump, such as prices, plan limits and headcount. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/step-line-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Step line chart

Files to copy from `theme/src/`:

- `components/charts/{step-line-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts, range-area-chart.tsx}`
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

Registry item: step-line-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { type ChartSeries, formatCompact } from "@/components/sheenui/charts/chart-utils";
import { StepLineChart } from "@/components/sheenui/charts/step-line-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type ChartSeries, formatCompact, StepLineChart } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per point: the index key plus one number per series key. |
| index | string | required | Key of the x value in each row (e.g. "month"). |
| series | readonly ChartSeries[] | required | The lines to draw. Give each a fixed color slot so filtering never repaints it. |
| curve | StepCurve | "step-after" | Where each value's label sits on its step. |
| area | boolean | false | Fill under each line with a soft 10% wash. |
| zero | boolean | true | Keep zero on the value axis. Turn off for levels far from zero (prices, rates), so the steps aren't squashed into the top of the plot. Always on with area. |
| height | number | 260 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact | Formats values in the tooltip and labels, and on the axis (the default axis format follows the tick step). |
| endLabels | boolean | true | Label the end of each line (2–4 series, when the chart is wide enough and the labels don't collide). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<StepLineChartLabels> | defaultStepLineChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultStepLineChartLabels. Its only key is listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## StepLineTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and one number per series key. |
| index | string | required | The key in each row that names the row, such as "month". It becomes the first column. |
| series | readonly CompareSeries[] | required | Series to list as columns; one with a compareKey also gets a previous-period column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table cells. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<ChartTableLabels> | defaultChartTableLabels | Text for i18n (defaults come from the enclosing ChartCard's labels, else English). Every other string, for translation: labels={{ noData: "…" }}; omitted keys keep the English of defaultChartTableLabels. All 2 keys of ChartTableLabels are listed in the key table under the props table. |

## Example 1 of 2: Price changes

The curve sets where each label sits on its step: "step-after" (the value starts at its label), "step" (mid-step) or "step-before" (the value is reached at its label). The line is the same; only the anchors move. Prices sit far from zero, so zero={false} lets the axis hug them instead of squashing every step into the top of the plot.

```tsx
import { formatCompact, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StepLineChart } from "@/components/sheenui/charts/step-line-chart";
// Package build (after the first npm release, or a packed tarball): import { StepLineChart, formatCompact, type ChartSeries } from "@sheenui/theme";

const pricing = [
  { month: "Jan", pro: 42, team: 50, enterprise: 60 },
  { month: "Feb", pro: 45, team: 50, enterprise: 60 },
  { month: "Mar", pro: 45, team: 54, enterprise: 60 },
  { month: "Apr", pro: 45, team: 54, enterprise: 66 },
  { month: "May", pro: 48, team: 57, enterprise: 66 },
];

const series: ChartSeries[] = [
  { key: "enterprise", label: "Enterprise", color: 3 },
  { key: "team", label: "Team", color: 2 },
  { key: "pro", label: "Pro", color: 1 },
];

export function Example() {
  return (
    <StepLineChart
      curve="step-after"
      zero={false}
      data={pricing}
      index="month"
      series={series}
      format={(n) => "$" + formatCompact(n)}
      aria-label="Monthly price per seat, by plan"
    />
  );
}
```

## Example 2 of 2: With an area wash

One series, so no legend: the title names it. area keeps zero on the axis, so the wash fills to a real baseline.

```tsx
import { StepLineChart } from "@/components/sheenui/charts/step-line-chart";
// Package build (after the first npm release, or a packed tarball): import { StepLineChart } from "@sheenui/theme";

const seats = [
  { month: "Jan", seats: 120 },
  { month: "Feb", seats: 135 },
  { month: "Mar", seats: 150 },
  { month: "Apr", seats: 180 },
  { month: "May", seats: 210 },
  { month: "Jun", seats: 262 },
];

export function Example() {
  return (
    <StepLineChart
      area
      curve="step-before"
      data={seats}
      index="month"
      series={[{ key: "seats", label: "Seats" }]}
      aria-label="Licensed seats at the end of each month"
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

- The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the point and its values.
- StepLineTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.
- Reduced motion: the steps appear at their final values and data changes jump instead of morphing.

## All exports on this page

- StepLineChart — A line chart whose lines hold their value until the next change.
- StepLineTable — The table view of a StepLineChart: one row per step on the x axis, one column per series.
- defaultStepLineChartLabels — The built-in English strings of StepLineChart; spread it into your own labels and change what you need.


## When to use the step line chart

- Use it as a step chart for plan pricing over time, where a price holds flat until the next change, and the hover band marks the step each price holds for.
- It fits licensed seats at the end of each month or headcount, where values hold between events and a smooth line would invent in-between numbers.
- It also suits interest rates, quota limits or feature thresholds, with area adding a soft wash under a single series that keeps zero on the axis.
- Skip it when the value changes continuously, such as temperature or traffic; LineChart is the honest shape, and RangeAreaChart fits when each point has a low and a high.
- Pair it with ChartCard for the title and legend, a StepLineTable as the Chart / Table tab, and a segmented control to switch plans or ranges.


## Frequently asked questions

### What does the curve prop change on a step line chart?

It sets where each value's label, crosshair and dot sit on its step: step-after (the default, value starts at its label), step (mid-step) or step-before (value is reached at its label). The line itself is the same, only the anchors move.

### Why does my step chart look squashed against the top?

Zero is kept on the value axis by default. For levels far from zero, such as prices, set zero to false so the axis hugs the data. With area on, zero stays on the axis so the wash fills to a real baseline.

### Can I plot several series?

Yes. With two to four series on a wide chart, endLabels (on by default) names each line at its end when labels do not collide. With one series, no legend is needed and the card title names it.

### How do I read it without a mouse?

Focus the chart, then Left and Right (or Up and Down) move to the previous or next point, and Home and End jump to the ends. The hover band and crosshair snap to the step under the pointer, and the tooltip lists each series' value there.


## Related pages

- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)
- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
