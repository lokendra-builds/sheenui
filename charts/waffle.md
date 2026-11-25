Canonical: https://lokendra-builds.github.io/sheenui/charts/waffle

# Waffle Chart & Pictogram for React

URL: https://lokendra-builds.github.io/sheenui/charts/waffle
Sidebar name: Waffle chart

A React waffle chart: a 10×10 grid where each cell is one percent, split by largest remainder, plus a pictogram variant with any icon. Accessible, MIT.

What it is: A React waffle chart is a 10 × 10 grid where every cell is one percent, so “61 in 100” lands faster than any pie. Pass data as readonly WaffleItem[]: the parts of the whole.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/waffle-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Waffle chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{waffle-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
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

Registry item: waffle-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { WaffleChart, type WaffleItem, WaffleTable } from "@/components/sheenui/charts/waffle-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, WaffleChart, type WaffleItem, WaffleTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WaffleItem[] | required | The parts of the whole. Negative values count as 0; more than 8 parts fold the smallest into "Other". |
| total | number | 0 | The whole. Default: the sum of the values. When larger, the rest of the cells stay empty. |
| rows | number | 10 | Number of grid rows; with columns it sets the grid size (10 × 10 = one cell per percent). |
| columns | number | 10 | Number of cells in each row of the grid; with rows it sets the grid size. |
| variant | "grid" \| "pictogram" | "grid" | "grid": rounded squares. "pictogram": icon in every cell (people, devices…). |
| icon | ReactNode | PERSON | The pictogram's icon. Use currentColor: it's drawn in the part's colour. |
| fill | "rows" \| "columns" | "rows" | Fill row by row (default) or column by column, from the start corner. |
| maxCell | number | 28 (grid) / 32 (pictogram) | Sets the largest cell in px. |
| showLegend | boolean | true | Show each part's key, name and share beside (or under, when narrow) the grid. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the whole for the labels, tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<WaffleChartLabels> | defaultWaffleChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultWaffleChartLabels. All 9 keys of WaffleChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## WaffleTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WaffleItem[] | required | The parts of the whole. Negative values count as 0; more than 8 parts fold the smallest into "Other". |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<WaffleChartLabels> | defaultWaffleChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultWaffleChartLabels. All 9 keys of WaffleChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| rows | number | 10 | Number of grid rows; with columns it sets the grid size (10 × 10 = one cell per percent). |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the whole for the labels, tooltips and data table: takes the share, returns the text shown. |
| total | number | 0 | The whole. Default: the sum of the values. When larger, the rest of the cells stay empty. |
| columns | number | 10 | Number of cells in each row of the grid; with rows it sets the grid size. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |

## Example 1 of 3: Share of a whole

Switch the quarter: only the cells that change hands pop. Hover a cell or a legend row, tap, or arrow through the parts.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { WaffleTable, WaffleChart, type WaffleItem } from "@/components/sheenui/charts/waffle-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, WaffleTable, WaffleChart, type WaffleItem } from "@sheenui/theme";

const data: WaffleItem[] = [
  { label: "Mobile", value: 61380, color: 1 },
  { label: "Desktop", value: 31020, color: 7 },
  { label: "Tablet", value: 6510, color: 3 },
];

<ChartCard title="Sessions by device" table={<WaffleTable data={data} caption="Sessions by device" />}>
  <WaffleChart data={data} aria-label="Sessions by device" />
</ChartCard>
```

## Example 2 of 3: Pictogram

Any icon that uses currentColor, one per cell. Here: how 100 employees get to work.

```tsx
import { WaffleChart } from "@/components/sheenui/charts/waffle-chart";
// Package build (after the first npm release, or a packed tarball): import { WaffleChart } from "@sheenui/theme";

<WaffleChart
  variant="pictogram"
  data={[
    { label: "Public transport", value: 41, color: 7 },
    { label: "Cycle or walk", value: 27, color: 3 },
    { label: "Car", value: 24, color: 2 },
    { label: "Work from home", value: 8, color: 1 },
  ]}
  aria-label="How employees commute"
/>
```

## Example 3 of 3: Part of a larger whole

With a `total` above the sum, the rest of the cells stay empty. Any grid size works: here 20 × 5.

```tsx
import { WaffleChart, type WaffleItem } from "@/components/sheenui/charts/waffle-chart";
// Package build (after the first npm release, or a packed tarball): import { WaffleChart, type WaffleItem } from "@sheenui/theme";

const storage: WaffleItem[] = [
  { label: "Photos", value: 38.4, color: 5 },
  { label: "Apps", value: 22.1, color: 7 },
  { label: "Documents", value: 9.3, color: 4 },
  { label: "System", value: 11.8, color: 1 },
];
const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

<WaffleChart
  data={storage}
  total={128}
  rows={5}
  columns={20}
  format={(n) => `${oneDecimal.format(n)} GB`}
  aria-label="iPhone storage, 128 GB"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the grid (one tab stop). |
| → / ↓ | Next part (← in right-to-left layouts). |
| ← / ↑ | Previous part. |
| Home / End | First / last part. |
| Escape | Stop reading. |

## Accessibility

- The grid is one focusable figure whose description lists every part's share; the cells themselves are hidden from assistive tech, so nobody has to step through 100 of them.
- Reading a part announces its value, share and cell count once.
- The legend names every part next to its share, and the table view lists values, shares and cells: color is never the only cue.
- Cells are split by largest remainder, so the cell counts always add up to the grid.
- Reduced motion: no wave, no pop on change; the grid is drawn in place.

## All exports on this page

- WaffleChart — A 10 × 10 grid where each cell is one percent of a whole: shares people grasp at a glance ("62 in 100").
- WaffleTable — Every part with its value, share and cell count (plus the empty remainder, if any).
- defaultWaffleChartLabels — The built-in English strings of WaffleChart; spread it into your own labels and change what you need.
- foldWaffleItems — More than 8 parts: the 7 largest keep their place (in your order) and their colour slot.
- waffleCells — Cells per part, by largest remainder so they add up exactly.
- waffleLegend — Legend for a waffle: each part's key, name and share, as the chart shows them.


## When to use the waffle chart

- Use it as a percentage grid chart to make a share land fast, such as sessions by device on a 10 by 10 grid where every cell is exactly one percent.
- It fits storage or quota displays on a part of a larger whole, such as 81.6 GB of 128 GB used, with total above the sum leaving the rest of the cells empty.
- The pictogram variant suits human-scale statistics, such as how 100 employees get to work, drawing any currentColor icon in each cell.
- Skip it when precision matters or there are more than a handful of parts; BarChart is more accurate, and Meter or Progress fits a single completion value.
- Pair it with ChartCard for the title and Chart / Table tabs, WaffleTable for the text twin, and NumberTicker to show the headline figure beside the grid.


## Frequently asked questions

### How are cells assigned so they always add up?

Cells are split by largest remainder, so the counts always sum to the grid size even when percentages round awkwardly, and any part with a value keeps at least one cell. Negative values count as 0, and with more than eight parts the seven largest stay and the rest fold into Other.

### Can I use a grid that is not 10 by 10?

Yes. rows and columns both default to 10, and any size works, such as 20 columns by 5 rows for a storage bar. fill chooses rows or columns order, and maxCell caps the cell size in px.

### How do I make a pictogram waffle chart?

Set variant to pictogram and pass an icon, any ReactNode that draws with currentColor; the default is a person. Each cell shows the icon in its part's color, and hovering a cell or legend row lights up the whole part.

### How do I navigate it without a mouse?

Focus the grid, then Right or Down moves to the next part (in right-to-left layouts Left takes Right's place), Left or Up to the previous, Home and End to the first or last part, and Escape stops reading. Changed data pops only the cells that change.


## Related pages

- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
