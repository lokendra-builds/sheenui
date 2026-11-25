Canonical: https://lokendra-builds.github.io/sheenui/charts/pie-chart

# React Pie Chart with Labels & Legend

URL: https://lokendra-builds.github.io/sheenui/charts/pie-chart
Sidebar name: Pie chart

A React pie chart for part-to-whole at a glance: up to 6 slices, leader-line labels that never collide and an always-complete legend. Animated, accessible.

What it is: A React pie chart for part-to-whole at a glance, folding the smallest slices into “Other” after six. Pass data as readonly PieSlice[]: part-to-whole only.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/pie-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Pie chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{pie-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: pie-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { PieChart, type PieSlice, PieTable } from "@/components/sheenui/charts/pie-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, formatCompact, PieChart, type PieSlice, PieTable } from "@sheenui/theme";
```

## PieChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly PieSlice[] | required | Part-to-whole only. Past maxSlices, the smallest slices fold into one "Other" slice. |
| maxSlices | number | 6 | At most this many slices are drawn (2–6). |
| height | number | 260 | Height of the pie area (the legend sits below it). |
| outerLabels | boolean | true | Name each slice outside the pie with a leader line, only where the label fits without colliding. |
| legend | boolean | true | Legend under the pie with each slice's share. |
| format | ((n: number) => string) | formatCompact | Formats values in the tooltip and legend. |
| formatPercent | ((n: number) => string) | defaultFormatPercent | Formats each share (a number from 0 to 100) for the labels and tooltip. |
| emptyState | ReactNode | labels.noData | Shown instead of the pie when there is nothing to plot. |
| patterns | boolean | true when data.length > 3 | Tell slices apart without colour (hatch fills). |
| labels | Partial<PieChartLabels> | defaultPieChartLabels | Every other string, for translation: labels={{ other: "…" }}; omitted keys keep the English of defaultPieChartLabels. All 10 keys of PieChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |
| PieTable | { data, maxSlices?, format?, formatPercent?, indexLabel?, caption?, labels? } | optional, no default | Table view: every row, its value and share, marking rows drawn inside “Other”. |
| foldSlices(data, maxSlices?) | FoldedSlice[] | optional, no default | The slices exactly as the chart draws them (id, label, value, share, color, slot, members). |

## PieTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly PieSlice[] | required | Takes the same slices as the chart. |
| maxSlices | number | 6 | Same as the chart's, so the table marks which rows the chart folds into "Other". |
| format | ((n: number) => string) | formatCompact | Formats a value for the data table cells: takes the number, returns the text shown. |
| formatPercent | ((n: number) => string) | defaultFormatPercent | Formats a share (0–100) for the data table cells: takes the share, returns the text shown. |
| indexLabel | string | labels.slice | Sets the header of the first column. |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |
| labels | Partial<PieChartLabels> | defaultPieChartLabels | Every other string, for translation: labels={{ other: "…" }}; omitted keys keep the English of defaultPieChartLabels. All 10 keys of PieChartLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Folding into “Other”

8 browsers, 6 slices: the top five keep their color slot and the rest fold into a neutral “Other”, whose tooltip lists what's inside. The table view keeps every row.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { PieTable, PieChart, type PieSlice } from "@/components/sheenui/charts/pie-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, PieTable, PieChart, type PieSlice } from "@sheenui/theme";

const data: PieSlice[] = [
  { label: "Chrome", value: 612000, color: 1 },
  { label: "Safari", value: 198000, color: 2 },
  { label: "Edge", value: 53000, color: 3 },
  { label: "Firefox", value: 34000, color: 4 },
  { label: "Other mobile", value: 26000, color: 5 },
  { label: "Opera", value: 22000, color: 6 },
  { label: "Brave", value: 11000, color: 7 },
  { label: "UC Browser", value: 9000, color: 8 },
]; // the smallest fold into "Other"

export function Example() {
  return (
    <ChartCard
      title="Visits by browser"
      table={<PieTable data={data} indexLabel="Browser" />}
    >
      <PieChart data={data} aria-label="Monthly visits by browser" />
    </ChartCard>
  );
}
```

## Example 2 of 3: Compact

In a narrow card the labels step aside for the legend, and the tooltip docks above the pie, clear of your finger.

```tsx
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { PieChart, type PieSlice } from "@/components/sheenui/charts/pie-chart";
// Package build (after the first npm release, or a packed tarball): import { formatCompact, PieChart, type PieSlice } from "@sheenui/theme";

const gb = (n: number) => formatCompact(n) + " GB";
const storage: PieSlice[] = [
  { label: "Photos", value: 182, color: 1 },
  { label: "Video", value: 96, color: 2 },
  { label: "Apps", value: 58, color: 3 },
  { label: "Documents", value: 21, color: 4 },
];

export function Example() {
  return (
    <>
      <PieChart data={storage} format={gb} outerLabels={false} height={200} aria-label="Storage used by type" />
      <PieChart data={[{ label: "Photos", value: 182 }]} format={gb} height={200} aria-label="Storage used by type (photos only)" /> {/* one slice: a full disc */}
      <PieChart data={[]} aria-label="Storage used by type" emptyState="Nothing stored yet" />
    </>
  );
}
```

## Example 3 of 3: Patterns

Hatch fills tell the slices apart without colour. They switch on by themselves above three slices; pass patterns to force them. The legend swatches carry the same hatch.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { PieChart, PieTable } from "@/components/sheenui/charts/pie-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, PieChart, PieTable } from "@sheenui/theme";

const browsers = [
  { label: "Chrome", value: 62 },
  { label: "Safari", value: 21 },
  { label: "Firefox", value: 9 },
];

export function Example() {
  return (
    <ChartCard title="Browser share" table={<PieTable data={browsers} indexLabel="Browser" caption="Browser share" />}>
      <PieChart patterns data={browsers} aria-label="Browser share, hatched" />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| → / ↓ | Next slice. |
| ← / ↑ | Previous slice. |
| Home / End | Jump to the first / last slice. |
| Escape | Clear the reading. |

## Accessibility

- The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the slice, its value and its share.
- PieTable is the table view and lists every original row, including slices folded into “Other”.
- Under reduced motion nothing morphs: the slices render at their final angles and new data replaces the old at once.

## When not to use a pie

To compare close values, or to show change over time, use bars or lines. Two slices read better as a single number or a meter.


## All exports on this page

- PieChart — A pie of the shares of a whole, with labels on the slices and a legend.
- PieTable — The table view of a pie: every original row (nothing folded away), its value and share.
- defaultPieChartLabels — The built-in English strings of PieChart; spread it into your own labels and change what you need.
- foldSlices — The slices as drawn: every positive value, at most maxSlices of them.


## When to use the pie chart

- Use it as a pie chart with labels for a browser or device share on an analytics dashboard, where there are a handful of parts and the point is that one of them is clearly the biggest.
- It suits a storage or budget breakdown in a settings page, where five or six categories add up to a whole and the legend lists each share under the pie.
- It works in a narrow card too: labels step aside for the legend, and the tooltip docks above the pie so a finger never covers the reading.
- Skip it when slices are close in size, there are many categories, or the data changes over time; BarChart compares values better, and DonutChart gives you a center slot for a total.
- Pair it with ChartCard for the title and Chart / Table tabs, PieTable so folded slices stay readable, and foldSlices when you need the exact grouping the chart draws; the legend under the pie is built in.


## Frequently asked questions

### What happens when my React pie chart has too many slices?

maxSlices defaults to 6 and accepts 2 to 6. Beyond that, the smallest slices fold into a neutral Other whose tooltip lists what is inside. PieTable keeps every original row and marks the ones drawn inside Other.

### How do I set slice colors?

Each item can carry color, a fixed palette slot from 1 to 8; by default the slot follows position, never rank. No two drawn slices ever share a color, so a slice keeps its hue when the data reorders.

### Is the pie chart accessible without a mouse?

It is a focusable figure named by its title, described by the keyboard hint, and one tab stop. Right or Down moves to the next slice, Left or Up to the previous one, Home and End jump to the ends, and Escape clears the reading. Each move announces slice, value and share.

### Can I localize the labels and number formats?

Yes. format and formatPercent control values and shares, and labels overrides strings such as other, inOther, noData and the keyboard instructions. emptyState replaces the No data message shown when every value is 0.


## Related pages

- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)

### Guides that cover it

- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
