Canonical: https://lokendra-builds.github.io/sheenui/charts/combo-chart

# Combo Chart for React: Bar + Line on One Axis

URL: https://lokendra-builds.github.io/sheenui/charts/combo-chart
Sidebar name: Combo chart

A React combo chart with bars and lines on one shared y-axis: a daily count with its rolling average, or parts against a target. No dual axis. Accessible.

What it is: A React combo chart that draws bars and lines on one shared y-axis, such as a daily count with its rolling average. Pass data as readonly ChartRow[]: one object per category: the index key plus one number per series key.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/combo-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Combo chart

Files to copy from `theme/src/`:

- `components/charts/{combo-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: combo-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ComboChart, comboLegend, type ComboSeries, ComboTable } from "@/components/sheenui/charts/combo-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, ComboChart, comboLegend, type ComboSeries, ComboTable } from "@sheenui/theme";
```

## ComboChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per category: the index key plus one number per series key. |
| index | string | required | Key of the category in each row (e.g. "month"). |
| series | readonly ComboSeries[] | required | Bars and lines on ONE y-axis: they must share a unit (e.g. orders per day and their 7-day average). For measures with different units, set indexed instead of reaching for a second axis. |
| stacked | boolean | false | Stack the bar series instead of grouping them side by side. Ignored when indexed (index values don't add up). |
| indexed | boolean | false | Re-base every series to the same starting point (its first non-zero value = indexBase), so measures of different units share one honest axis: "how has each changed?". A series that starts negative is rebased on its absolute value, so up still means up. |
| indexBase | number | 100 | The value every series starts from when indexed. |
| height | number | 280 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact | Formats raw values (tooltip; the axis too unless indexed). |
| formatIndex | ((n: number) => string) | defaultFormatIndex | Formats indexed values (axis and tooltip) when indexed. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when there are more than 3 bar series | Tell the bar series apart without colour (hatch fills; the first bar series stays solid). |
| labels | Partial<ComboChartLabels> | defaultComboChartLabels | Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultComboChartLabels. All 5 keys of ComboChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |
| comboLegend(series) | LegendItem[] | optional, no default | Legend items: swatches for bars, line keys for lines. |
| indexSeries(data, keys, base?) | number[][] | optional, no default | The indexed values the chart plots. |

## ComboTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | Takes the same rows as the chart. |
| index | string | required | Key of each row that names its category. |
| series | readonly ComboSeries[] | required | The same series as the chart (bars and lines). |
| stacked | boolean | false | Match the chart: adds a Total column (the sum of the bar series). |
| format | ((n: number) => string) | formatCompact | Formats the actual values (an indexed chart's table shows the real data, not the index). |
| indexLabel | string | index | Sets the header of the first column. |
| caption | string | optional, no default | Visually hidden caption naming the table (also names its scroll region). |
| labels | Partial<Pick<ComboChartLabels, "total" \| "noData">> | defaultComboChartLabels | Override the "Total" column header and the empty text. Every other string, for translation: labels={{ total: "…" }}; omitted keys keep the English of defaultComboChartLabels. All 2 keys of ComboChartLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 4: Bars and their average

Same unit, one axis. The line draws across the bars once they have grown, with a surface halo so it stays readable where it crosses them.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { comboLegend, ComboTable, ComboChart, type ComboSeries } from "@/components/sheenui/charts/combo-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, comboLegend, ComboTable, ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { day: "Oct 8", orders: 402, average: 371 },
  { day: "Oct 9", orders: 388, average: 376 },
  { day: "Oct 10", orders: 431, average: 384 },
  { day: "Oct 11", orders: 455, average: 395 },
  { day: "Oct 12", orders: 301, average: 389 },
  { day: "Oct 13", orders: 296, average: 382 },
];
const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <ChartCard
      title="Orders per day"
      legend={comboLegend(series)}
      table={<ComboTable data={data} index="day" series={series} />}
    >
      <ComboChart data={data} index="day" series={series} aria-label="Orders per day with the 7-day average" />
    </ChartCard>
  );
}
```

## Example 2 of 4: Indexed: different units, one axis

Revenue (dollars), users and tickets (counts) can't share a value axis, and two axes would let the chart say anything. indexed rebases every series to 100 at its first value, so the axis reads “how much has each grown?”. The tooltip keeps the actual values.

```tsx
import { ComboChart, type ComboSeries } from "@/components/sheenui/charts/combo-chart";
// Package build (after the first npm release, or a packed tarball): import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "Nov", revenue: 184000, users: 8200, tickets: 1300 },
  { month: "Dec", revenue: 195000, users: 8900, tickets: 1340 },
  { month: "Jan", revenue: 201000, users: 9700, tickets: 1390 },
  { month: "Feb", revenue: 212000, users: 10200, tickets: 1360 },
  { month: "Mar", revenue: 224000, users: 11100, tickets: 1430 },
];
const series: ComboSeries[] = [
  { key: "revenue", label: "Revenue", color: 1, type: "bar" },
  { key: "users", label: "Active users", color: 2, type: "line" },
  { key: "tickets", label: "Support tickets", color: 3, type: "line" },
];

export function Example() {
  return <ComboChart indexed data={data} index="month" series={series} aria-label="Revenue, users and tickets, indexed to November = 100" />;
}
```

## Example 3 of 4: Stacked bars and a target

stacked stacks the bar series; the line is a target in the same unit. The tooltip adds the stack's total.

```tsx
import { ComboChart, type ComboSeries } from "@/components/sheenui/charts/combo-chart";
// Package build (after the first npm release, or a packed tarball): import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "May", new: 420, returning: 900, target: 1500 },
  { month: "Jun", new: 460, returning: 960, target: 1570 },
  { month: "Jul", new: 495, returning: 1010, target: 1640 },
  { month: "Aug", new: 530, returning: 1080, target: 1710 },
  { month: "Sep", new: 575, returning: 1150, target: 1780 },
];
const series: ComboSeries[] = [
  { key: "new", label: "New", color: 1, type: "bar" },
  { key: "returning", label: "Returning", color: 3, type: "bar" },
  { key: "target", label: "Target", color: 2, type: "line" },
];

export function Example() {
  return <ComboChart stacked data={data} index="month" series={series} aria-label="Customers per month against target" />;
}
```

## Example 4 of 4: Edge cases

One category still gets a properly sized bar and a dot for the line (a line needs two points); no data keeps the chart's footprint.

```tsx
import { ComboChart, type ComboSeries } from "@/components/sheenui/charts/combo-chart";
// Package build (after the first npm release, or a packed tarball): import { ComboChart, type ComboSeries } from "@sheenui/theme";

const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <>
      <ComboChart data={[{ day: "Today", orders: 412, average: 388 }]} index="day" series={series} aria-label="Orders today" />
      <ComboChart data={[]} index="day" series={series} emptyState="No orders yet" aria-label="Orders per day" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → | Previous / next category. |
| Home / End | Jump to the first / last category. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces every series' value.
- ComboTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- Reduced motion: the bars and the line appear at their final values and data changes jump instead of morphing.

## All exports on this page

- ComboChart — Bars and lines on one chart: give each series type: "bar" or type: "line".
- ComboTable — The table view of a combo chart: the actual values of every series (headed by a swatch for bars, a line key for lines).
- comboLegend — Legend items for a combo chart: a swatch for bar series, a line key for line series.
- defaultComboChartLabels — The built-in English strings of ComboChart; spread it into your own labels and change what you need.
- indexSeries — Rebase each series so its first non-zero value equals base: base + change / |first| x base.


## When to use the combo chart

- Use it as a bar and line chart when a volume and a rate belong on one chart, such as orders as bars with a conversion line, or daily signups as bars with their 7-day average as a line.
- Use stacked to stack the bar series, for example revenue split by plan with a target line over it, while the line series keeps its own mark type per series.
- Use indexed when the series have different units, like revenue and sessions: each is rebased to indexBase (default 100) so the chart answers how much each has changed.
- Skip it when every series is the same mark type, where Bar chart or Line chart is simpler, or when you are tempted to add a second y-axis, which this chart deliberately does not offer.
- Pair it with ChartCard and ComboTable, a ChartLegend built with comboLegend to name the bar and line series, and a SegmentedControl that flips indexed on and off.


## Frequently asked questions

### How do I mix bars and lines in a React combo chart?

Give data rows an index key such as month plus one number per series, then list series, each with type set to bar or line. Bars and lines share one y-axis, so the series must use the same unit. aria-label is required.

### Does it support a secondary y-axis?

No, on purpose. For measures with different units set indexed, which re-bases every series to the same starting point so they share one honest axis. A series that starts negative is rebased on its absolute value, so up still means up. formatIndex formats the indexed axis.

### How do I read values with the keyboard?

Tab focuses the chart, Left and Right move the reading one category, Home and End jump to the ends, and Escape clears. Each move announces every series' value for that category. ComboTable offers the same data as a real table.

### What does reduced motion change?

Marks normally draw in the first time the chart appears and tween when data changes. With reduced motion both become instant. Only the tooltip uses backdrop blur. height sets the chart height in px, defaulting to 280.


## Related pages

- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)
- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)
- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
