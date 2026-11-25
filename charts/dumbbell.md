Canonical: https://lokendra-builds.github.io/sheenui/charts/dumbbell

# Dumbbell & Slope Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/dumbbell
Sidebar name: Dumbbell & slope chart

React dumbbell and slope charts for before-and-after comparisons, with every change printed as ▲/▼ so it never depends on color. Animated, accessible.

What it is: A React dumbbell or slope chart shows before and after for each item, with every change printed in words and arrows. Pass data as readonly DumbbellItem[]: takes one item per row: { label, from, to }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dumbbell-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Dumbbell & slope chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{dumbbell-chart.tsx, histogram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/dumbbell-chart/`
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

Registry item: dumbbell-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { DumbbellChart } from "@/components/sheenui/charts/dumbbell-chart";
import { type DumbbellItem, dumbbellLegend } from "@/components/sheenui/charts/dumbbell-chart/model";
import { DumbbellTable } from "@/components/sheenui/charts/dumbbell-chart/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, DumbbellChart, type DumbbellItem, dumbbellLegend, DumbbellTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly DumbbellItem[] | required | Takes one item per row: { label, from, to }. |
| variant | "slope" \| "dumbbell" | "dumbbell" | "dumbbell": a row per item, a dot at each end. "slope": two columns joined by a line per item. |
| fromLabel | string | optional, no default | Sets the name of the "before" end, e.g. "2024". |
| toLabel | string | optional, no default | Sets the name of the "after" end, e.g. "2025". |
| sort | "none" \| "from" \| "to" \| "change" | "none" | Order of the items. "change" puts the biggest rise first. |
| higherIsBetter | boolean | true | Is a rise good (revenue) or bad (costs, churn)? Picks the status colour of the change. |
| change | "none" \| "percent" \| "absolute" | "absolute" | Show each item's change: "absolute" (+12), "percent" (+8%), or "none". |
| highlight | string \| string[] | optional, no default | Emphasise these items (by label); the rest step back to grey. |
| color | ChartColor | 1 | Palette slot (1–8): the "after" dot in full, the "before" dot a lighter shade of it. |
| includeZero | boolean | false | Keep 0 on the value axis. |
| height | number | 340 | Height of a slope chart. Dumbbell rows grow with the items. |
| valueLabel | string | optional, no default | Names the value axis. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats percent changes (0.08 → "8%"). |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<DumbbellChartLabels> | defaultDumbbellChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultDumbbellChartLabels. All 10 keys of DumbbellChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## DumbbellTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly DumbbellItem[] | required | Takes one item per row: { label, from, to }. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| sort | "none" \| "from" \| "to" \| "change" | "none" | Order of the items. "change" puts the biggest rise first. |
| labels | Partial<DumbbellChartLabels> | defaultDumbbellChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultDumbbellChartLabels. All 10 keys of DumbbellChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats percent changes (0.08 → "8%"). |
| fromLabel | string | optional, no default | Sets the name of the "before" end, e.g. "2024". |
| toLabel | string | optional, no default | Sets the name of the "after" end, e.g. "2025". |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Dumbbell

Median salary by department, 2024 to 2025. On first view each “after” dot travels out from its “before” dot. Sort by the change and the rows slide into their new order.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { DumbbellChart } from "@/components/sheenui/charts/dumbbell-chart";
import { dumbbellLegend, type DumbbellItem } from "@/components/sheenui/charts/dumbbell-chart/model";
import { DumbbellTable } from "@/components/sheenui/charts/dumbbell-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, dumbbellLegend, DumbbellTable, DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const salaries: DumbbellItem[] = [
  { label: "Engineering", from: 128, to: 141 },
  { label: "Design", from: 104, to: 112 },
  { label: "Product", from: 121, to: 133 },
  { label: "Marketing", from: 92, to: 96 },
  { label: "Sales", from: 98, to: 94 },
  { label: "Support", from: 61, to: 68 },
];
const thousands = (n: number) => (n < 0 ? "−" : "") + "$" + Math.abs(Math.round(n)) + "K";

export function Example() {
  return (
    <ChartCard
      title="Median salary"
      legend={dumbbellLegend("2024", "2025")}
      table={<DumbbellTable data={salaries} sort="change" fromLabel="2024" toLabel="2025" format={thousands} caption="Median salary by department" />}
    >
      <DumbbellChart
        data={salaries}
        fromLabel="2024"
        toLabel="2025"
        sort="change"
        change="percent"
        format={thousands}
        aria-label="Median salary by department, 2024 against 2025"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Slope chart

variant="slope": the two ends in columns, a line per channel. Labels spread apart so none collide, and highlight keeps the two channels the story is about in color.

```tsx
import { DumbbellChart } from "@/components/sheenui/charts/dumbbell-chart";
import { type DumbbellItem } from "@/components/sheenui/charts/dumbbell-chart/model";
// Package build (after the first npm release, or a packed tarball): import { DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const npsByChannel: DumbbellItem[] = [
  { label: "In-app chat", from: 38, to: 54 },
  { label: "Email", from: 31, to: 29 },
  { label: "Phone", from: 47, to: 44 },
  { label: "Help center", from: 22, to: 35 },
  { label: "Community", from: 41, to: 48 },
  { label: "Social", from: 12, to: 19 },
];

export function Example() {
  return (
    <DumbbellChart
      variant="slope"
      data={npsByChannel}
      fromLabel="Q1"
      toLabel="Q2"
      highlight={["In-app chat", "Help center"]}
      color={3}
      aria-label="Net Promoter Score by support channel, Q1 against Q2"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↑ / ↓ | Move between items. |
| Home / End | Jump to the first / last item. |
| Escape | Clear the reading. |

## Accessibility

- Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Every change is printed with an up or down arrow and a success or danger tone (set by higherIsBetter), so color never carries it alone.
- For a non-visual reading, give ChartCard's table prop a DumbbellTable; the Chart / Table tabs then expose each value as plain table cells.
- Under reduced motion nothing morphs: the dots and the connecting bars render at their final values and new data replaces the old at once.

## All exports on this page

- DumbbellChart — Before → after for each item.
- DumbbellTable — Every item's two values, its change and its percent change.
- defaultDumbbellChartLabels — The built-in English strings of DumbbellChart; spread it into your own labels and change what you need.
- dumbbellColors — The two shades of a dumbbell: the "before" end is a paler step of the "after" hue.
- dumbbellLegend — Legend items for a dumbbell or slope chart: the two ends.


## When to use the dumbbell and slope chart

- Use it as a before and after chart for year-over-year comparisons across named items, such as revenue per product in 2024 against 2025, where the size and direction of each change is the story.
- Use the slope variant for ranking shifts between two points in time, with the two ends in columns, lines joining them and labels spread so none collide.
- Sort by change to put the biggest rise first, and set higherIsBetter to false for costs or churn so the status color of each change is not misleading.
- Skip it when you have more than two time points per item, where a Line chart shows the whole path, or when you compare totals rather than change, where a Bar chart is enough.
- Pair it with ChartCard and DumbbellTable for a text view, plus a SegmentedControl to switch between the dumbbell and slope variants or between absolute and percent change.


## Frequently asked questions

### How do I build a React dumbbell chart?

Pass data as items with label, from and to, then fromLabel and toLabel such as 2024 and 2025. A light before dot and a full-color after dot are joined by a bar that brightens in the direction of travel. aria-label is required.

### How are increases and decreases shown without color alone?

Each change is printed with an up or down arrow and a success or danger tone chosen by higherIsBetter. The change prop picks absolute, percent or none. So a rise in churn reads as bad both by tone and by the arrow and sign text.

### Can I switch to a slope chart or re-sort the items?

Set variant to slope for two columns joined by lines. sort takes none, to, from or change, and re-sorting slides the rows to their new places. highlight takes one label or several and grays out the others. height applies to the slope variant only.

### How does keyboard use work?

Tab focuses the chart, Up and Down move between items, Home and End jump to the first and last, and Escape clears. Rows are plain SVG moved by one frame loop, and reading a row never re-renders the others. Reduced motion draws, glides and re-sorts instantly.


## Related pages

- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
