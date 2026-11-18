Canonical: https://lokendra-builds.github.io/sheenui/charts/polar-area

# Polar Area Chart (Nightingale Rose) for React

URL: https://lokendra-builds.github.io/sheenui/charts/polar-area
Sidebar name: Polar area chart

A React polar area chart, Nightingale's rose: one wedge per category with area proportional to value, stacking series outward. Hover, tap or keys. MIT.

What it is: A React polar area chart, Nightingale's rose, draws one wedge per category around a circle, its area proportional to the value. Pass data as readonly ChartRow[]: one row per wedge.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/polar-area-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Polar area chart

Files to copy from `theme/src/`:

- `components/charts/{polar-area-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/button/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
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

Registry item: polar-area-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { PolarAreaChart, polarAreaLegend, PolarAreaTable } from "@/components/sheenui/charts/polar-area-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartRow, type ChartSeries, PolarAreaChart, polarAreaLegend, PolarAreaTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per wedge (e.g. per month), clockwise from 12 o'clock. |
| index | string | required | Key of the wedge's name in each row. |
| series | readonly ChartSeries[] | required | One or more series; several stack outwards (Nightingale's rose). Up to 8, each with a fixed color slot. |
| scale | "area" \| "radius" | "area" | "area" (default): a wedge's AREA is proportional to its value, which is how a rose must be read. "radius": its length is, which exaggerates large values; only for familiar 0–100 scores. |
| height | number | 340 | Height in px; the rose is as large as fits. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<PolarAreaChartLabels> | defaultPolarAreaChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultPolarAreaChartLabels. All 5 keys of PolarAreaChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## PolarAreaTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per wedge (e.g. per month), clockwise from 12 o'clock. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<PolarAreaChartLabels> | defaultPolarAreaChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultPolarAreaChartLabels. All 5 keys of PolarAreaChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| index | string | required | Key of the wedge's name in each row. |
| series | readonly ChartSeries[] | required | One or more series; several stack outwards (Nightingale's rose). Up to 8, each with a fixed color slot. |
| indexLabel | string | optional, no default | Sets the header of the first column. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |

## Example 1 of 2: Nightingale's rose, 1854–55

Her own data: most soldiers died of preventable disease, not wounds. Areas are true to the values; switch to radius scaling to see how it would exaggerate the winter.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { polarAreaLegend, PolarAreaTable, PolarAreaChart } from "@/components/sheenui/charts/polar-area-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, polarAreaLegend, PolarAreaTable, PolarAreaChart, type ChartRow, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "disease", label: "Preventable disease", color: 7 },
  { key: "wounds", label: "Wounds", color: 8 },
  { key: "other", label: "Other causes", color: 4 },
];
const data: ChartRow[] = [
  { month: "Apr 1854", disease: 110, wounds: 0, other: 5 },
  { month: "May", disease: 95, wounds: 0, other: 9 },
  { month: "Jun", disease: 40, wounds: 0, other: 6 },
  { month: "Jul", disease: 140, wounds: 5, other: 9 },
  { month: "Aug", disease: 220, wounds: 9, other: 6 },
  { month: "Sep", disease: 360, wounds: 23, other: 14 },
];

export function Example() {
  return (
    <ChartCard
      title="Causes of mortality"
      legend={polarAreaLegend(series)}
      table={<PolarAreaTable data={data} index="month" series={series} />}
    >
      <PolarAreaChart data={data} index="month" series={series} scale="area" aria-label="Deaths by cause and month" />
    </ChartCard>
  );
}
```

## Example 2 of 2: 24 hours of traffic

One series, one hue: position and name tell the wedges apart. With 24 names around the rose, labels thin out on narrow screens instead of colliding.

```tsx
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { PolarAreaChart } from "@/components/sheenui/charts/polar-area-chart";
// Package build (after the first npm release, or a packed tarball): import { PolarAreaChart, type ChartRow } from "@sheenui/theme";

// Average sessions per hour of the day (every 4th hour shown here)
const hourly: ChartRow[] = [
  { hour: "00:00", sessions: 120 },
  { hour: "04:00", sessions: 95 },
  { hour: "08:00", sessions: 540 },
  { hour: "12:00", sessions: 610 },
  { hour: "16:00", sessions: 480 },
  { hour: "20:00", sessions: 1290 },
];

export function Example() {
  return (
    <PolarAreaChart
      data={hourly}
      index="hour"
      series={[{ key: "sessions", label: "Sessions", color: 7 }]}
      aria-label="Sessions by hour of day"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart (one tab stop). |
| → / ↓ | Next wedge, clockwise. |
| ← / ↑ | Previous wedge. |
| Home / End | First / last wedge. |
| Escape | Stop reading. |

## Accessibility

- The chart is one focusable figure; each wedge read by keyboard announces every series' value (and the total) once.
- Areas are true to the values by default, so the picture never exaggerates big wedges; the ring values give the scale.
- Names around the rose thin out instead of colliding, and every wedge is in the table view, so nothing depends on reading a crowded label.
- Forced colors outline every wedge in CanvasText; reduced motion draws the rose in place.

## All exports on this page

- PolarAreaChart — Nightingale's rose: one wedge per category around a circle (months, hours, compass points), each wedge's area proportional to its value.
- PolarAreaTable — One row per wedge, one column per series, plus the total when there are several.
- defaultPolarAreaChartLabels — The built-in English strings of PolarAreaChart; spread it into your own labels and change what you need.
- foldPolarSeries — More than 8 series: the first 7 keep their slots and the rest are summed into one "Other" series (neutral grey), so colour slots never repeat.
- polarAreaLegend — Legend for a rose: one swatch per series (skip it for a single series: the title names it).


## When to use the polar area chart

- Use it as a Nightingale rose (coxcomb) chart for cyclical categories such as months, hours of the day or compass points, where wedge position carries meaning and a circle makes the cycle obvious.
- It recreates Nightingale's rose: several series, such as causes of mortality per month, stack outward while each wedge's area stays proportional to its value.
- It suits a 24-hour traffic profile with one series and one hue, where wedge position and name identify the hour and labels thin out on narrow screens.
- Skip it when readers need to compare exact values across categories; a BarChart is easier to read, and RadarChart fits comparing profiles across several unrelated measures.
- Pair it with ChartCard for the title and Chart / Table tabs, PolarAreaTable for exact numbers, and polarAreaLegend when several series stack outward in the same wedge.


## Frequently asked questions

### What is the difference between area and radius scaling?

The scale prop defaults to area, where the radius grows with the square root so wedge area stays true to the value. Choose radius when your data is a familiar 0 to 100 score; it makes large values look bigger than they are.

### How many series can a polar area chart stack?

One or more; several stack outwards, each with a fixed color slot. Past eight, the first seven keep their slots and the rest fold into Other. Data rows are listed clockwise from 12 o'clock, with the index key naming each wedge such as the month.

### How do I read wedges with the keyboard?

Focus the chart, then Right or Down moves to the next wedge clockwise, Left or Up to the previous one, and Home and End go to the first or last wedge. Escape stops reading. Hover and tap read a wedge too.

### Why do some wedge names disappear on a phone?

Names never collide: with many wedges, like 24 hours, labels thin out on narrow screens instead of overlapping. Every wedge still has a tooltip and appears in PolarAreaTable, and reduced motion draws marks at final values.


## Related pages

- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)
- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
