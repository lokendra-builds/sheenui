Canonical: https://lokendra-builds.github.io/sheenui/charts/heatmap

# React Heatmap Chart with Scale Legend

URL: https://lokendra-builds.github.io/sheenui/charts/heatmap
Sidebar name: Heatmap

A React heatmap chart on a single-hue sequential scale, with tooltips on hover, tap and keyboard, a live scale legend and hatched missing values. MIT.

What it is: A React heatmap chart that colors a category-by-category grid from light to dark, with a tooltip on every cell. Pass data as readonly ChartRow[]: one object per row.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/heatmap.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Heatmap

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{heatmap.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
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

Registry item: heatmap. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { Heatmap } from "@/components/sheenui/charts/heatmap";
import { type HeatmapColumn } from "@/components/sheenui/charts/heatmap/kit";
import { HeatmapTable } from "@/components/sheenui/charts/heatmap/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartRow, Heatmap, type HeatmapColumn, HeatmapTable } from "@sheenui/theme";
```

## Heatmap

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per row, e.g. { day: "Mon", h0: 12, h1: 4, ... }. |
| index | string | required | Key of the row label in each object. |
| columns | readonly HeatmapColumn[] | required | The columns, in order: the key of each value and its label. |
| color | ChartColor | 1 | Hue of the sequential ramp: a palette slot, 1–8. |
| domain | [number, number] | 0 (or the minimum, if negative) to the maximum | The [min, max] the color scale spans; values outside it take the end colors. |
| steps | number | 0 | Classes on the scale (e.g. 5); 0 = continuous. |
| showValues | boolean | false | Print each value inside its cell when it fits. |
| cellHeight | number | follows the cell width (24–40) | Sets the row height in px. |
| minCellWidth | number | 12 | Narrowest a column may get before the grid scrolls sideways inside its own container. |
| format | ((n: number) => string) | formatCompact in locale | Formats a cell value for the tooltips, legend and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| legend | boolean | true | Show the scale legend under the grid. |
| legendLabel | ReactNode | optional, no default | Sets the caption for the legend, e.g. "Sessions". |
| onCellClick | ((cell: HeatmapCell) => void) | optional, no default | Called with { row, column, columnLabel, value } on click, Enter or Space: row is the row's index value, column the column's key, columnLabel its display label. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<HeatmapLabels> | defaultHeatmapLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultHeatmapLabels. All 4 keys of HeatmapLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible name of the chart; describe what it shows. |

## HeatmapTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per row, e.g. { day: "Mon", h0: 12, h1: 4, ... }. |
| format | ((n: number) => string) | formatCompact in locale | Formats a cell value for the tooltips, legend and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| index | string | required | Key of the row label in each object. |
| columns | readonly HeatmapColumn[] | required | The columns, in order: the key of each value and its label. |
| indexLabel | string | optional, no default | Sets the header of the row-label column. |
| caption | string | optional, no default | Visually hidden caption that names the table. |
| noDataLabel | string | optional, no default | Text for a cell that has no value. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## ChartTip props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | string | required | Sets the heading line of the tooltip. |
| rows | TooltipRow[] | required | One line per series: a swatch, a label and the formatted value. |
| anchor | ChartTipAnchor | required | The mark being read, in px relative to the chart box. |
| bounds | { w: number; h: number; } | required | Size of the chart box the tooltip must stay inside. |
| docked | boolean | false | The one-line readout pinned to the top of a narrow chart instead (see ChartTooltip). |
| order | readonly ChartTipSide[] | optional, no default | Sides to try, in order, when placing the tooltip next to the anchor: "right", "left", "below" or "above". |
| minLeft | number | optional, no default | The tooltip never starts further left than this many px, so it does not cover the axis. |

## ChartValueTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| columns | ChartValueTableColumn[] | required | The column headers; the first column holds the row headers. Numbers align to the end unless a column says otherwise. |
| rows | ReactNode[][] | required | One array of cells per row; the first cell is the row header. |
| caption | string | optional, no default | Visually hidden caption naming the table (also names its scroll region). |
| emptyState | ReactNode | "No data" | Shown when there are no rows. |

## MissingValue props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | labels.noData | Text shown and announced for this cell, e.g. "Not applicable". |
| labels | Partial<Pick<HeatmapLabels, "noData">> | defaultHeatmapLabels | Overrides for the built-in English string (noData). Merged over defaultHeatmapLabels. Every other string, for translation: labels={{ noData: "…" }}; omitted keys keep the English of defaultHeatmapLabels. Its only key is listed in the key table under the props table. |

## SequentialLegend props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| min | number | required | Lowest and highest value of the scale. |
| max | number | required | The highest value of the scale, at the right end of the ramp. |
| color | ChartColor | 1 | The chart color slot (1 to 8) the ramp fades toward. |
| steps | number | 0 | Number of classes; 0 draws a continuous ramp. |
| format | ((n: number) => string) | formatCompact | Formats the min and max shown at the ends of the ramp. |
| label | ReactNode | optional, no default | Shows a caption before the ramp, e.g. "Sessions". |
| lowLabel | ReactNode | optional, no default | Text at the low / high end instead of the formatted min / max (e.g. "Less" / "More"). |
| highLabel | ReactNode | optional, no default | Text at the high end instead of the formatted max (for example "More"). |
| marker | number \| null | null | Position (0–1) of the value being read, drawn as a marker on the ramp. |
| swatches | readonly string[] | optional, no default | Explicit swatch colours (e.g. a calendar's levels) instead of steps of color. |
| floor | number | 0.08 | Share of the hue in the lightest step (nearly the surface). A map raises it so data reads against its no-data land. |

## Example 1 of 2: Activity by hour

24 columns stay readable on a phone: columns shrink to 12px, then the grid scrolls sideways inside the card while the day labels stay put. Focus the grid and use the arrow keys; Home and End jump along a row.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { Heatmap } from "@/components/sheenui/charts/heatmap";
import { type HeatmapColumn } from "@/components/sheenui/charts/heatmap/kit";
import { HeatmapTable } from "@/components/sheenui/charts/heatmap/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, HeatmapTable, Heatmap, type ChartRow, type HeatmapColumn } from "@sheenui/theme";

const hours: HeatmapColumn[] = Array.from({ length: 24 }, (_, h) => ({ key: `h${h}`, label: String(h).padStart(2, "0") }));

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const data: ChartRow[] = days.map((day, d) => {
  const row: ChartRow = { day };
  for (let h = 0; h < 24; h++) row[`h${h}`] = Math.round(40 + 600 * Math.exp(-((h - 11) ** 2) / 14) * (d >= 5 ? 0.5 : 1));
  return row;
});

export function Example() {
  return (
    <ChartCard
      title="Sessions by hour"
      description="Local time"
      table={<HeatmapTable data={data} index="day" indexLabel="Day" columns={hours} />}
    >
      <Heatmap
        data={data}
        index="day"
        columns={hours}
        legendLabel="Sessions"
        aria-label="Sessions by weekday and hour"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Cohort retention, classed

Five classes instead of a continuous ramp, with values printed inside the cells that fit them: black or white, whichever contrasts more with that cell. Months that haven't happened yet are missing, so they're hatched.

```tsx
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { Heatmap } from "@/components/sheenui/charts/heatmap";
import { type HeatmapColumn } from "@/components/sheenui/charts/heatmap/kit";
// Package build (after the first npm release, or a packed tarball): import { Heatmap, type ChartRow, type HeatmapColumn } from "@sheenui/theme";

const months: HeatmapColumn[] = [0, 1, 2, 3].map((m) => ({ key: `m${m}`, label: `Month ${m}` }));

// Later months are missing (not yet happened): drawn hatched, never as 0.
const cohorts: ChartRow[] = [
  { cohort: "Jan 2026", m0: 100, m1: 57, m2: 44, m3: 36 },
  { cohort: "Feb 2026", m0: 100, m1: 54, m2: 41 },
  { cohort: "Mar 2026", m0: 100, m1: 59 },
  { cohort: "Apr 2026", m0: 100 },
];

export function Example() {
  return (
    <Heatmap
      data={cohorts}
      index="cohort"
      columns={months}
      domain={[0, 100]}
      steps={5}
      showValues
      color={7}
      format={(n) => `${n}%`}
      legendLabel="Retained"
      aria-label="Share of each signup cohort still active, by month"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the grid. |
| ↑ / ↓ / ← / → | Move between cells. |
| Home / End | First / last cell of the row. |
| Ctrl + Home / Ctrl + End | Top-left / bottom-right corner. |
| Page Up / Page Down | Top / bottom of the column. |
| Enter / Space | Activate the cell being read, when onCellClick is set. |
| Escape | Clear the reading. |

## Accessibility

- The grid is a focusable figure named by its aria-label and described by the reading hint (“Use the arrow keys to move between cells; Home and End jump along a row.”).
- Missing values are hatched, never painted as zero, and every cell's value is in the tooltip and the table view.
- On narrow screens the grid scrolls sideways inside its own focusable container while the row labels stay put.
- For a non-visual reading, give ChartCard's table prop a HeatmapTable; the Chart / Table tabs then expose each value as plain table cells.
- Reduced motion: the cells appear at their final colors and data changes jump instead of morphing.

## All exports on this page

- ChartDockHint — Muted hint in the band a narrow chart reserves for its docked readout, shown while nothing is being read, so the band is never just empty space.
- ChartTip — The glass tooltip of these charts.
- ChartValueTable — A plain table in the ChartTable style for charts whose data isn't one row per category.
- Heatmap — A category × category grid coloured on a single-hue sequential scale.
- HeatmapTable — Every heatmap value as a table: rows × columns, missing cells read "No data".
- MissingValue — A table cell without a value: a dash, read as label ("No data", "Not applicable"...).
- SequentialLegend — The key to a sequential colour scale: a ramp (or classed swatches) between its end values.
- chartNumberFormat — The default number formatters of the charts, both in one locale (default "en", like formatCompact).
- defaultHeatmapLabels — The built-in English strings of Heatmap; spread it into your own labels and change what you need.
- formatPercent — 0.412 → "41.2%" (in "en", matching formatCompact); non-finite ratios read "–".
- hueMix — A palette hue mixed into a base colour in OKLab.
- placeChartTip — Where a tooltip of size goes next to the anchor mark inside bounds (all in px, relative to the chart box).
- scalePosition — Position of value on a [min, max] scale, optionally snapped to steps classes (0–1).
- sequentialColor — One step of a single-hue sequential ramp: t = 0 sits just off the chart surface, 1 is the full palette hue.


## When to use Heatmap

- Use it as a matrix heatmap for a category-by-category grid, such as traffic by weekday and time of day, error counts by service and hour, or feature usage by plan, where color encodes the value. Use it for a correlation heatmap by putting the variables on both axes and the coefficient in each cell.
- Use onCellClick to make cells drill into detail: it receives the row, the column key, its label and the value, so a click can filter a table below the grid.
- Use it when some cells have no data: missing values are hatched, never painted as zero, so a gap in a metric is not mistaken for a real low reading.
- Skip it when the axes are calendar days over a year, where Calendar heatmap lays them out as weeks, or when the rows are retention cohorts, where Cohort retention adds the average row.
- Pair it with ChartCard and HeatmapTable for a text view, a Select to switch the metric, and the legend with legendLabel so the color scale is named.


## Frequently asked questions

### How do I build a react heatmap from rows and columns?

Pass data as one object per row, index with the key of the row label, and columns listing each value key and label. Add aria-label. The color prop picks a palette slot from 1 to 8 for the single-hue ramp, and domain overrides the scale range.

### How are missing values shown?

Cells with a missing or non-numeric value are hatched and read No data, never painted as zero. Values given as numeric strings are parsed. Set showValues to print each value inside its cell when the cell is big enough to fit it.

### What happens on narrow screens?

Columns shrink down to minCellWidth, 12px by default. Past that, the grid scrolls sideways inside its own focusable container while the row labels stay put. cellHeight overrides the row height, which otherwise follows the cell width between 24 and 40 px.

### Which keys move between cells?

Focus the grid and use the arrow keys. Home and End move along a row, Ctrl+Home and Ctrl+End go to the corners, Escape clears, and Enter or Space calls onCellClick. The bloom-in wave and the cross-fade on new data are instant with reduced motion.


## Related pages

- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)

### Guides that cover it

- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
