Canonical: https://lokendra-builds.github.io/sheenui/charts/bullet-chart

# Bullet Chart for React: Actual vs Target

URL: https://lokendra-builds.github.io/sheenui/charts/bullet-chart
Sidebar name: Bullet chart

A React bullet chart, Stephen Few's compact gauge: actual as a bar, target as a marker and ranges behind, with deltas that never rely on color. MIT.

What it is: A React bullet chart shows actual against target with qualitative ranges behind, so many KPIs fit where one gauge would. Pass data as readonly BulletItem[]: the rows to draw, one per measure.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bullet-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Bullet chart

Files to copy from `theme/src/`:

- `components/charts/{bullet-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts, range-area-chart.tsx}`
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

Registry item: bullet-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BulletChart, type BulletItem, bulletLegend, BulletTable } from "@/components/sheenui/charts/bullet-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BulletChart, type BulletItem, bulletLegend, BulletTable, ChartCard, formatCompact } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BulletItem[] | required | The rows to draw, one per measure. |
| scale | "row" \| "shared" | "row" | "row": each row gets its own scale, ticked underneath (measures in different units). "shared": one scale for every row, ticked once at the bottom (same unit, comparable lengths). |
| ticks | boolean | true | Prints scale ticks along each bar. |
| showDelta | boolean | true | Show the delta against the target under each value. |
| format | ((n: number) => string) | formatCompact | Formats values (rows can override with their own format). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<BulletChartLabels> | defaultBulletChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultBulletChartLabels. All 12 keys of BulletChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BulletItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label / description | string | optional, no default | Name, and an optional unit or context line under it. |
| value | number | required | Required. The measure, drawn as the bar. |
| target | number | optional, no default | Sets the comparative measure, drawn as the marker. |
| ranges | number[] | optional, no default | Upper bounds of the qualitative ranges, lowest first. The last stretches to the end of the scale. |
| rangeLabels | string[] | labels.ranges | Names of this row's ranges, lowest first. |
| min / max | number | 0 / nice max | Ends of the row's scale. |
| higherIsBetter | boolean | true | Whether beating the target is good (revenue) or bad (costs, latency). |
| color | 1–8 | 1 | Sets the palette slot of the bar. |
| format | (n) => string | optional, no default | Formats the numbers of this row for labels and the tooltip. |

## bulletLegend / BulletTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BulletItem[] | required | The bullet rows to list, the same items the chart draws. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| labels | Partial<BulletChartLabels> | defaultBulletChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultBulletChartLabels. All 12 keys of BulletChartLabels are listed in the key table under the props table. |
| bulletLegend(labels?, color?, rangeCount?) | LegendItem[] | optional, no default | Legend items for ChartCard: actual, target and the range shades. |

## Example 1 of 2: KPI dashboard

Each row has its own scale (different units), ticked underneath. Rows can bring their own format. On phones the names move above each bullet.

```tsx
import { bulletLegend, BulletTable, BulletChart, type BulletItem } from "@/components/sheenui/charts/bullet-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { formatCompact, ChartCard, bulletLegend, BulletTable, BulletChart, type BulletItem } from "@sheenui/theme";

const usdK = (n: number) => (n === 0 ? "$0" : `$${formatCompact(n)}K`);
const rows: BulletItem[] = [
  { label: "Revenue", description: "US$, thousands", value: 270, target: 250, ranges: [150, 225, 300], format: usdK },
  { label: "Profit", description: "Margin, %", value: 22.5, target: 26, ranges: [20, 25, 30], format: (n) => `${n}%` },
  { label: "Order size", description: "US$, average", value: 320, target: 550, ranges: [350, 500, 600], format: (n) => `$${formatCompact(n)}` },
  { label: "New customers", description: "This quarter", value: 1650, target: 2100, ranges: [1400, 2000, 2500] },
  { label: "Satisfaction", description: "Out of 5", value: 4.5, target: 4.2, ranges: [3.5, 4.25, 5], max: 5 },
];

<ChartCard
  title="Q3 performance"
  legend={bulletLegend()}
  table={<BulletTable data={rows} caption="Q3 performance against targets" />}
>
  <BulletChart data={rows} aria-label="Q3 performance against targets" />
</ChartCard>
```

## Example 2 of 2: Shared scale, lower is better

scale="shared" puts every row on one axis, so lengths compare across rows. With higherIsBetter: false, beating the target means coming in under it; the range names come from labels.

```tsx
import { BulletChart } from "@/components/sheenui/charts/bullet-chart";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BulletChart, formatCompact } from "@sheenui/theme";

<BulletChart
  scale="shared"
  format={(n) => `${formatCompact(n)} ms`}
  labels={{ ranges: ["Fast", "Acceptable", "Slow"] }}
  data={[
    { label: "p50", value: 118, target: 150, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
    { label: "p90", value: 342, target: 300, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
    { label: "p99", value: 780, target: 900, ranges: [200, 400, 1000], higherIsBetter: false, color: 3 },
  ]}
  aria-label="API latency against SLO targets"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↑ / ↓ / ← / → | Move between rows. |
| Home / End | Jump to the first / last row. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the row's actual, target and delta.
- BulletTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- Under reduced motion nothing morphs: the bars and the target tick render at their final values and new data replaces the old at once.

## All exports on this page

- BulletChart — One bullet graph per row: a bar for the measure, a marker for its target and shaded ranges (poor, fair, good) behind it.
- BulletTable — The chart's table view: every row's actual, target, range and delta, in text.
- bulletLegend — Legend for a bullet chart: the measure, the target marker, and the range shades.
- defaultBulletChartLabels — The built-in English strings of BulletChart; spread it into your own labels and change what you need.


## When to use the bullet chart

- Use it as a KPI bullet graph for a scorecard where each row has an actual value, a target marker and poor, fair and good ranges, such as revenue against plan, NPS against goal or churn against ceiling.
- Use it when a gauge per metric would take too much space: one bullet graph fits in a single row, so a stack of KPIs stays compact on a dashboard.
- Set higherIsBetter to false on cost or churn rows so the delta under the value is colored by whether beating the target is good, and use scale shared when every row has the same unit.
- Skip it when you have one hero metric that deserves a big display, because a Gauge gives a single number its own room, or when you need history, where a Line chart is the better fit.
- Pair it with ChartCard and the BulletTable view for an accessible text view, plus a Badge next to the card title to flag how many KPIs missed their target.


## Frequently asked questions

### How do I make a bullet chart in React with a target and ranges?

Each data row takes a label, a value, an optional target and ranges as upper bounds, lowest first. ranges of 150, 225 and 300 draw poor, fair and good bands. The last range stretches to the end of the scale, and rangeLabels can rename the bands per row.

### Should rows share one scale?

Set scale to shared when all rows use the same unit, so lengths are directly comparable and ticks print once at the bottom. The default row scale gives each row its own scale and ticks underneath, which suits measures in different units. Each row also accepts its own min, max and format.

### How is it announced to assistive tech?

The chart is a figure named by its title, with the keyboard hint as its description and aria-details pointing at the table view in a ChartCard. Tab focuses it, arrow keys move between rows, Home and End jump to the ends, and Escape clears. Each move announces the row's actual, target and delta. BulletTable gives the same numbers as a real table.

### Can I hide the delta or the ticks?

Yes. showDelta controls the delta against the target under each value and ticks controls the printed scale ticks. Both are booleans on BulletChart. Under reduced motion the bars are drawn in place without animation, and labels lets you translate the range names and other built-in strings.


## Related pages

- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
