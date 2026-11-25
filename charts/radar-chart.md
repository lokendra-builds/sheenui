Canonical: https://lokendra-builds.github.io/sheenui/charts/radar-chart

# Radar Chart for React (Spider Chart)

URL: https://lokendra-builds.github.io/sheenui/charts/radar-chart
Sidebar name: Radar chart

A React radar chart (spider chart) to compare a few profiles across the same measures, with collision-free axis labels and keyboard reading. Animated, MIT.

What it is: A React radar chart, also called a spider chart, compares a few profiles across the same set of measures. Pass data as readonly ChartRow[]: one row per axis (spoke), clockwise from the top.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/radar-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Radar chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{radar-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts, range-area-chart.tsx}`
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

Registry item: radar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { RadarChart } from "@/components/sheenui/charts/radar-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartSeries, ChartTable, RadarChart, seriesLegend } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per axis (spoke), clockwise from the top, e.g. { skill: "Speed", alice: 82, bob: 64 }. 3–10 axes read best. |
| index | string | required | Key of the axis name in each row. |
| series | readonly ChartSeries[] | required | The shapes to compare: 1–4 series, each with a fixed color slot. |
| max | number | a round number at or above the largest value | Value at the outer ring (e.g. 100 for scores). |
| grid | "circle" \| "polygon" | "polygon" | "polygon" rings follow the spokes; "circle" rings are round. |
| height | number | 320 | Largest height (px). When the width is the limit (a narrow card), the chart shrinks to the height its rings and labels need, so there is no empty band above and below the shape. |
| format | ((n: number) => string) | formatCompact | Formats values in the tooltip and the ring labels. Values below 0 are drawn at the centre. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills and dashed outlines; the first series stays solid). |
| labels | Partial<RadarChartLabels> | defaultRadarChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRadarChartLabels. All 2 keys of RadarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## RadarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and one number per series key. |
| index | string | required | The key in each row that names the row, such as "month". It becomes the first column. |
| series | readonly CompareSeries[] | required | Series to list as columns; one with a compareKey also gets a previous-period column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table cells. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<ChartTableLabels> | defaultChartTableLabels | Text for i18n (defaults come from the enclosing ChartCard's labels, else English). Every other string, for translation: labels={{ noData: "…" }}; omitted keys keep the English of defaultChartTableLabels. All 2 keys of ChartTableLabels are listed in the key table under the props table. |

## Example 1 of 3: Two series, morphing data

Two series on a 0–100 scale. Switch the quarter: the shapes morph to the new values instead of redrawing. Focus the chart and use the arrow keys to walk the axes.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { RadarChart } from "@/components/sheenui/charts/radar-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, seriesLegend, ChartTable, RadarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { metric: "Performance", previous: 84, current: 95 },
  { metric: "Accessibility", previous: 93, current: 97 },
  { metric: "Reliability", previous: 88, current: 93 },
  { metric: "Security", previous: 79, current: 86 },
  { metric: "Test coverage", previous: 71, current: 83 },
  { metric: "Docs", previous: 62, current: 80 },
];
const series: ChartSeries[] = [
  { key: "previous", label: "Last release", color: 2 },
  { key: "current", label: "This release", color: 1 },
];

<ChartCard
  title="Release scorecard"
  legend={seriesLegend(series, "rect")}
  table={<ChartTable data={data} index="metric" indexLabel="Measure" series={series} />}
>
  <RadarChart
    data={data}
    index="metric"
    series={series}
    max={100}
    aria-label="Release quality scores, this release against the last"
  />
</ChartCard>
```

## Example 2 of 3: Long axis names

Ten axes with long names in a half-width card. Names are measured in the chart's font, and long ones wrap onto two lines. Only when a name truly can't fit is it shortened, and only the ones that limit the shape, never below eight letters. On a small screen every other name may step back and reappear while its axis is active. Full names stay in the tooltip and the table.

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { RadarChart } from "@/components/sheenui/charts/radar-chart";
// Package build (after the first npm release, or a packed tarball): import { RadarChart, type ChartSeries } from "@sheenui/theme";

const support = [
  { area: "First response time", team: 82, benchmark: 70 },
  { area: "Resolution time", team: 64, benchmark: 72 },
  { area: "Customer satisfaction", team: 91, benchmark: 80 },
  { area: "Reopened tickets", team: 58, benchmark: 66 },
  { area: "Self-service deflection", team: 47, benchmark: 55 },
  { area: "Escalation rate", team: 73, benchmark: 61 },
];

const series: ChartSeries[] = [
  { key: "team", label: "Our team", color: 1 },
  { key: "benchmark", label: "Industry benchmark", color: 3 },
];

export function Example() {
  return (
    <RadarChart
      data={support}
      index="area"
      series={series}
      max={100}
      aria-label="Support quality against the industry benchmark"
    />
  );
}
```

## Example 3 of 3: Round grid, three series

grid="circle" draws round rings. The scale tops out at a round number above the largest value unless you pass max.

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { RadarChart } from "@/components/sheenui/charts/radar-chart";
// Package build (after the first npm release, or a packed tarball): import { RadarChart, type ChartSeries } from "@sheenui/theme";

const roasts = [
  { note: "Acidity", ethiopia: 8.5, colombia: 6, sumatra: 3.5 },
  { note: "Sweetness", ethiopia: 7, colombia: 7.5, sumatra: 5 },
  { note: "Body", ethiopia: 4.5, colombia: 6.5, sumatra: 8.5 },
  { note: "Bitterness", ethiopia: 3, colombia: 5, sumatra: 7 },
  { note: "Aroma", ethiopia: 9, colombia: 7, sumatra: 6.5 },
];

const series: ChartSeries[] = [
  { key: "ethiopia", label: "Ethiopia", color: 2 },
  { key: "colombia", label: "Colombia", color: 3 },
  { key: "sumatra", label: "Sumatra", color: 1 },
];

export function Example() {
  return (
    <RadarChart
      grid="circle"
      data={roasts}
      index="note"
      series={series}
      max={10}
      aria-label="Flavor profile of three single-origin coffees"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Move between axes. |
| Home / End | Jump to the first / last axis. |
| Escape | Clear the reading. |

## Accessibility

- Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the axis and every series' value.
- RadarTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.
- Reduced motion: the polygons appear at their final shape and data changes jump instead of morphing.

## All exports on this page

- RadarChart — A radar (spider) chart: one axis per category, one polygon per series.
- RadarTable — The table view of a RadarChart: one row per axis, one column per series.
- defaultRadarChartLabels — The built-in English strings of RadarChart; spread it into your own labels and change what you need.


## When to use the radar chart

- Use it as a spider chart for a release scorecard that compares two quarters across the same quality measures, such as reliability, performance and docs, on one 0 to 100 scale.
- It suits comparing candidate or product profiles across 3 to 10 attributes, like a flavor profile with cupping scores out of 10 for three coffees.
- It works in a half-width card with long axis names, because names are measured in the chart's font and wrap onto two lines before being shortened.
- Skip it when you have more than four series or axes on different scales; a grouped BarChart or a Heatmap compares many items more reliably.
- Pair it with ChartCard and its table prop, a RadarTable for the text view, and seriesLegend so each shape has a named color.


## Frequently asked questions

### How many axes and series work well in a radar chart?

Three to ten axes read best, and one or two axes draw dots. Compare one to four series, each with a palette slot from 1 to 8. Rows go clockwise from the top, with the index prop naming each axis.

### How do I fix the scale at 100?

Pass max, the value at the outer ring. Without it, the scale tops out at a round number at or above the largest value. Negative values sit at the center. Use grid circle for round rings instead of the default polygon rings.

### Does SheenUI ship a RadarTable for screen readers?

No. Pass a ChartTable as ChartCard's table prop; the Chart / Table tabs then put every value in text. The chart itself is one tab stop, and the arrow keys move between axes, announcing each series' value.

### How does it handle a phone screen?

The readout sits in its own band above the shape so a tap never hides data. The chart shrinks to what its rings and labels need, and on small screens some axis names step back and reappear while their axis is active.


## Related pages

- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)
- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
