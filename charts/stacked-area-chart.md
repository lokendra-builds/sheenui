Canonical: https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart

# Stacked Area Chart for React (100% Mode)

URL: https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart
Sidebar name: Stacked area chart

A React stacked area chart that shows how a total builds from its parts, with a 100% mode, a crosshair listing every series and morphing data. Accessible.

What it is: A React stacked area chart shows how a total builds from its parts over time, or in 100% mode how the mix shifts. Pass data as readonly ChartRow[]: one object per point: the index key plus one number per series key.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/stacked-area-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Stacked area chart

Files to copy from `theme/src/`:

- `components/charts/{percent-bar-chart.tsx, stacked-area-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: stacked-area-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StackedAreaChart, StackedAreaTable } from "@/components/sheenui/charts/stacked-area-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartSeries, seriesLegend, StackedAreaChart, StackedAreaTable } from "@sheenui/theme";
```

## StackedAreaChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per point: the index key plus one number per series key. |
| index | string | required | Key of the x value in each row (e.g. "month"). |
| series | readonly ChartSeries[] | required | Bands from the bottom of the stack up. Give each a fixed color slot so filtering never repaints it. |
| mode | "stacked" \| "percent" | "stacked" | "stacked": bands add up to the total. "percent": every x position is scaled to 100%, so the bands show each series' share. A point whose values add up to 0 has no shares: the bands break around it (a gap, marked with a dashed "no data" column) instead of dipping to 0%. |
| curve | "linear" \| "monotone" | "linear" | "linear" joins points with straight lines; "monotone" with smooth curves that never overshoot a value. |
| height | number | 260 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact | Formats values in the tooltip (and the axis in "stacked" mode). Negative values count as 0. |
| formatPercent | ((n: number) => string) | formatPercentDefault | Formats shares (0–100) in "percent" mode. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills, dash styles, marker shapes). |
| labels | Partial<StackedAreaChartLabels> | defaultStackedAreaChartLabels | Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultStackedAreaChartLabels. All 4 keys of StackedAreaChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## StackedAreaTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | Takes the same rows as the chart. |
| index | string | required | Key of each row that names its position on the axis. |
| series | readonly ChartSeries[] | required | Takes the same series as the chart. |
| mode | "stacked" \| "percent" | "stacked" | Match the chart: "percent" shows each share beside the value it comes from. |
| format | ((n: number) => string) | formatCompact | Formats a value for the data table cells: takes the number, returns the text shown. |
| formatPercent | ((n: number) => string) | formatPercentDefault | Formats shares in percent mode. |
| indexLabel | string | index | Sets the header of the first column. |
| caption | string | optional, no default | Visually hidden caption naming the table (also names its scroll region). |
| labels | Partial<Pick<StackedAreaChartLabels, "total" \| "noData">> | defaultStackedAreaChartLabels | Override the "Total" column header and the empty text. Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultStackedAreaChartLabels. All 2 keys of StackedAreaChartLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Stacked and 100% stacked

Switch the mode, the curve and the range: the bands morph between them. Hover, tap, or focus the chart and use the arrow keys.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StackedAreaTable, StackedAreaChart } from "@/components/sheenui/charts/stacked-area-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jun", organic: 41000, paid: 23000, referral: 9800, social: 6400 },
  { month: "Jul", organic: 44200, paid: 24100, referral: 10300, social: 7100 },
  { month: "Aug", organic: 46900, paid: 26800, referral: 11200, social: 7600 },
  { month: "Sep", organic: 49100, paid: 27500, referral: 11900, social: 8800 },
  { month: "Oct", organic: 52300, paid: 29400, referral: 12600, social: 9300 },
];
const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "social", label: "Social", color: 4 },
];

export function Example() {
  return (
    <ChartCard
      title="Sessions by channel"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable data={data} index="month" series={series} mode="stacked" />}
    >
      <StackedAreaChart
        data={data}
        index="month"
        mode="stacked" // or "percent"
        curve="linear" // or "monotone"
        series={series}
        aria-label="Monthly sessions by channel, stacked"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Share of a whole

mode="percent" scales every quarter to 100%. The tooltip leads with the share and keeps the raw value beside it; the table view shows both.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StackedAreaTable, StackedAreaChart } from "@/components/sheenui/charts/stacked-area-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

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
  return (
    <ChartCard
      title="Sessions by device"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable mode="percent" data={data} index="quarter" series={series} />}
    >
      <StackedAreaChart mode="percent" curve="monotone" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />
    </ChartCard>
  );
}
```

## Example 3 of 3: Edge cases

One data point draws a flat band across the plot; a month with no values breaks a 100% chart around a dashed “no data” column instead of dipping to 0%; no data keeps the chart's footprint.

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StackedAreaChart } from "@/components/sheenui/charts/stacked-area-chart";
// Package build (after the first npm release, or a packed tarball): import { StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const plans: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];
const signups = [
  { month: "May", free: 420, pro: 160, team: 40 },
  { month: "Jun", free: 460, pro: 190, team: 55 },
  { month: "Jul", free: 0, pro: 0, team: 0 },
  { month: "Aug", free: 510, pro: 230, team: 70 },
];

export function Example() {
  return (
    <>
      <StackedAreaChart data={[{ month: "Oct", organic: 41000, paid: 23000 }]} index="month" series={series} aria-label="Sessions in October" />
      <StackedAreaChart mode="percent" data={signups} index="month" series={plans} aria-label="Share of signups by plan" /> {/* July adds up to 0: a gap */}
      <StackedAreaChart data={[]} index="month" series={series} emptyState="No sessions yet" aria-label="Sessions" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → | Previous / next point. |
| Home / End | Jump to the first / last point. |
| Escape | Clear the reading. |
| Enter / Space on a legend key | Hide or show that series (inside a ChartCard). |

## Accessibility

- The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every series' value and the total.
- StackedAreaTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- Reduced motion: the stacked areas appear at their final values and data changes jump instead of morphing.

## All exports on this page

- StackedAreaChart — Stacked areas that show how parts add up over time, in absolute values or as a share (mode="percent").
- StackedAreaTable — The table view of a stacked area chart: every value per x, plus the total the tooltip shows (negative values count as 0, as in the chart).
- defaultStackedAreaChartLabels — The built-in English strings of StackedAreaChart; spread it into your own labels and change what you need.


## When to use the stacked area chart

- Use it as a stacked area graph for sessions by channel over a year, where the total and the contribution of organic, paid and referral traffic matter as the totals build up.
- It suits a 100% stacked area chart with mode percent, such as quarterly sessions by device, to show when mobile overtook desktop without the total distorting the view.
- It also handles gaps honestly: in percent mode, a month with no signups breaks the chart around a dashed no data column instead of dipping to 0%.
- Skip it when the series should be compared against each other, since stacked bands share baselines; LineChart or a grouped BarChart makes that easier, and Streamgraph suits a flowing, symmetric view.
- Pair it with ChartCard for a legend where Enter or Space on a key hides a series, StackedAreaTable for exact values, and a segmented control to switch stacked and percent modes.


## Frequently asked questions

### How do I build a stacked area chart in React with SheenUI?

Pass data rows, the index key for x, and series listed from the bottom band up, each with key, label and an optional color slot from 1 to 8. A required aria-label names the chart. Height defaults to 260 and the width follows the container.

### How do I switch to a 100% stacked area chart?

Set mode to percent. Every x is scaled to 100% so bands show shares, the tooltip leads with the share and keeps the raw value beside it, and an x whose values add up to 0 is drawn as a gap. formatPercent changes the format.

### Which curve types are available?

curve defaults to linear for straight segments, or monotone for smooth curves that never overshoot a data point. Bands are separated by a real 2px gap, draw in on first view and tween when data changes.

### How do I read it with a keyboard or toggle series?

Focus the chart, then Left and Right move between points, Home and End jump to the ends, and Escape clears the reading. Inside a ChartCard, Enter or Space on a legend key hides or shows that series. Reduced motion makes the animations instant.


## Related pages

- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)
- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
