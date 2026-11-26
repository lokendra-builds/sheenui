Canonical: https://lokendra-builds.github.io/sheenui/charts/marimekko

# Marimekko (Mekko) Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/marimekko
Sidebar name: Marimekko chart

A React Marimekko chart: a 100% stacked mosaic whose columns are as wide as their totals, showing market size and share in one picture. Accessible, MIT.

What it is: A React Marimekko chart is a 100% stacked mosaic whose columns are as wide as their totals. Pass data as readonly ChartRow[]: one row per column.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/marimekko-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Marimekko chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{marimekko-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts, use-resolved-scheme.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: marimekko-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { MarimekkoChart, MarimekkoTable } from "@/components/sheenui/charts/marimekko-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartSeries, MarimekkoChart, MarimekkoTable, seriesLegend } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per column, e.g. { segment: "Enterprise", us: 420, rivalA: 310, ... }. |
| index | string | required | Key of the column name in each row. |
| series | readonly ChartSeries[] | required | The stacked parts of every column, bottom up (≤ 8; colour slots stay fixed). Negative values count as 0. |
| height | number | 340 | Height of the chart in px; the width follows the container. |
| cellText | "none" \| "value" \| "share" | "share" | What each cell prints when it fits: its share of the column (default), its value, or nothing. |
| format | ((n: number) => string) | compact numbers in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills). |
| onCellClick | ((cell: MarimekkoCell) => void) | optional, no default | Called with { column, series, seriesLabel, value } when a cell is clicked, tapped, or activated with Enter. column is the row's index value and series the series key (the data keys); seriesLabel is its display label. Makes cells interactive. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<MarimekkoChartLabels> | defaultMarimekkoChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultMarimekkoChartLabels. All 6 keys of MarimekkoChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## MarimekkoTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per column, e.g. { segment: "Enterprise", us: 420, rivalA: 310, ... }. |
| format | ((n: number) => string) | compact numbers in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| index | string | required | Key of the column name in each row. |
| series | readonly ChartSeries[] | required | The stacked parts of every column, bottom up (≤ 8; colour slots stay fixed). Negative values count as 0. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. |
| indexLabel | string | optional, no default | Sets the header of the first column. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| labels | Partial<MarimekkoTableLabels> | defaultMarimekkoTableLabels | Column headers. Merged over defaultMarimekkoTableLabels. Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultMarimekkoTableLabels. All 2 keys of MarimekkoTableLabels are listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 2: Market map, year on year

Columns are segments sized by total spend; cells are vendors. Switch the year: every cell reshapes in place. Arrow keys move between segments (left / right) and vendors (up / down).

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { MarimekkoTable, MarimekkoChart } from "@/components/sheenui/charts/marimekko-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, seriesLegend, MarimekkoTable, MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "us", label: "Acme (us)", color: 1 },
  { key: "northwind", label: "Northwind", color: 3 },
  { key: "contoso", label: "Contoso", color: 2 },
  { key: "others", label: "Others", color: 7 },
];
const data = [
  { segment: "Enterprise", us: 910, northwind: 1420, contoso: 1150, others: 820 },
  { segment: "Mid-market", us: 760, northwind: 590, contoso: 700, others: 690 },
  { segment: "SMB", us: 520, northwind: 210, contoso: 350, others: 760 },
  { segment: "Startups", us: 340, northwind: 70, contoso: 80, others: 260 },
];

<ChartCard
  title="Market map"
  legend={seriesLegend(series, "rect")}
  table={<MarimekkoTable data={data} index="segment" indexLabel="Segment" series={series} caption="Spend by segment and vendor" />}
>
  <MarimekkoChart
    data={data}
    index="segment"
    series={series}
    format={(n) => `$${n}M`}
    aria-label="Market spend by segment and vendor, 2025"
  />
</ChartCard>
```

## Example 2 of 2: Revenue by region and product, values in the cells

cellText="value" prints each cell’s value instead of its share. Narrow columns keep their name only while it fits; every value stays in the tooltip and the table.

```tsx
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { MarimekkoChart } from "@/components/sheenui/charts/marimekko-chart";
// Package build (after the first npm release, or a packed tarball): import { MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const regions = [
  { region: "North America", platform: 4.8, analytics: 2.1, services: 1.2 },
  { region: "Europe", platform: 3.1, analytics: 1.6, services: 0.9 },
  { region: "Asia Pacific", platform: 1.9, analytics: 1.4, services: 0.3 },
  { region: "Latin America", platform: 0.7, analytics: 0.2, services: 0.2 },
  { region: "Middle East", platform: 0.4, analytics: 0.1, services: 0.1 },
];

const products: ChartSeries[] = [
  { key: "platform", label: "Platform", color: 1 },
  { key: "analytics", label: "Analytics", color: 4 },
  { key: "services", label: "Services", color: 5 },
];

export function Example() {
  return (
    <MarimekkoChart
      data={regions}
      index="region"
      series={products}
      cellText="value"
      height={300}
      format={(n) => `$${n}M`}
      aria-label="Revenue by region and product line"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart (one stop). |
| ← / → | The same part in the previous / next column (or the nearest one by height). |
| ↑ / ↓ | The next part up / down the column. |
| Home / End | Bottom / top part of the column. |
| Enter / Space | Call onCellClick for the active cell. |
| Escape | Clear the reading. |

## Accessibility

- The chart is one focusable figure with the role description “marimekko chart”; a cell is announced with its value and both shares (“Enterprise · Acme (us): $910M, 21% of Enterprise, 9% of total”).
- Cell numbers are drawn in black or white, whichever contrasts more with the fill, and only where they fit; the Table view (MarimekkoTable) has every value.
- On touch screens the first tap pins the readout; a second tap activates the cell.
- Reduced motion: the columns appear at once and data changes jump.

## All exports on this page

- MarimekkoChart — A 100% stacked mosaic whose columns are as wide as their totals: market size and share in one picture (segment × vendor, region × product).
- MarimekkoTable — Every column with each part's value, the column total and its share of everything.
- defaultMarimekkoChartLabels — The built-in English strings of MarimekkoChart; spread it into your own labels and change what you need.
- defaultMarimekkoTableLabels — English defaults of MarimekkoTableLabels.


## When to use the marimekko chart

- Use it as a mosaic (mekko) chart for market maps, where each column is a customer segment sized by its revenue and the stacked cells show which product lines or competitors hold that segment.
- It works for a revenue-by-region and product breakdown in a board deck, because column width carries the region's size while cell height carries the product's share inside it.
- Try cellText value when readers want the numbers rather than percentages, for example fiscal revenue per product line printed inside each cell wherever it fits.
- Skip it when you have more than a handful of columns or need exact comparisons across categories; PercentBarChart or a plain BarChart reads more cleanly than narrow columns with clipped text.
- Pair it with ChartCard and its Chart / Table tabs, MarimekkoTable for a text version with totals and shares, and seriesLegend so each stacked part is named once, outside the cells.


## Frequently asked questions

### What does a Marimekko chart show that a stacked bar does not?

Column width is proportional to each column's total, so you see segment size and composition in one picture. A 100% stacked bar gives every category the same width, which hides how large each segment actually is.

### How do I make the cells print values instead of shares?

Set cellText to value; the default is share, and none turns labels off. Text appears only where it fits, column names and shares under the plot also print only where they fit, and every value stays available in the tooltip and the table.

### Can cells be clickable for drill-down?

Yes, pass onCellClick. It fires on click, Enter or Space, and on touch devices on the second tap, with column, series, seriesLabel and value. The arrow keys move between cells and Home and End reach the bottom or top part of a column.

### How many series can I stack in a column?

Up to eight, since colors come from fixed palette slots and negative values count as 0. Use the series array with key, label and optional color for each part, and the index prop to name the column key in every data row.


## Related pages

- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
