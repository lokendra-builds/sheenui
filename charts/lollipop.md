Canonical: https://lokendra-builds.github.io/sheenui/charts/lollipop

# Lollipop Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/lollipop
Sidebar name: Lollipop chart

A React lollipop chart: a thin stem and a dot per value, so long ranked lists stay calm, with reference lines and highlights. Animated, accessible, MIT.

What it is: A React lollipop chart gives all the reading of a bar chart with a fraction of the ink: a thin stem and a dot per value. Pass data as readonly LollipopItem[]: takes one item per stem: { label, value }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/lollipop-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Lollipop chart

Files to copy from `theme/src/`:

- `components/charts/{histogram.tsx, lollipop-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/histogram/`
- `components/charts/kits/`
- `components/charts/lollipop-chart/`
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

Registry item: lollipop-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { LollipopChart } from "@/components/sheenui/charts/lollipop-chart";
import { type LollipopItem } from "@/components/sheenui/charts/lollipop-chart/model";
import { LollipopTable } from "@/components/sheenui/charts/lollipop-chart/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, LollipopChart, type LollipopItem, LollipopTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly LollipopItem[] | required | Takes one item per stem: { label, value, color? }. |
| layout | "horizontal" \| "vertical" \| "auto" | "auto" | "auto": sideways rows (best for ranked lists and long names), upright on wide charts with short names. |
| sort | "none" \| "ascending" \| "descending" | "none" | Order of the items. "none" keeps the order of data. Re-sorting slides the rows to their new places. |
| baseline | number | 0 | Where the stems start. Values below it reach the other way (a diverging lollipop). |
| reference | { value: number; label: string; } | optional, no default | A reference line, e.g. { value: 72, label: "Average" }. |
| highlight | string \| string[] | optional, no default | Emphasise these items (by label); the rest step back to a neutral grey. |
| showValues | boolean | true | Print each value next to its head. |
| color | ChartColor | 1 | Sets the palette slot (1–8) used for the whole chart. |
| height | number | 300 | Height of an upright chart. Sideways charts grow with the number of rows. |
| valueLabel | string | optional, no default | Names the value axis. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<LollipopChartLabels> | defaultLollipopChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultLollipopChartLabels. All 8 keys of LollipopChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## LollipopTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly LollipopItem[] | required | Takes one item per stem: { label, value, color? }. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| sort | "none" \| "ascending" \| "descending" | "none" | Order of the items. "none" keeps the order of data. Re-sorting slides the rows to their new places. |
| labels | Partial<LollipopChartLabels> | defaultLollipopChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultLollipopChartLabels. All 8 keys of LollipopChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| valueLabel | string | optional, no default | Names the value axis. |
| reference | { value: number; label: string; } | optional, no default | A reference line, e.g. { value: 72, label: "Average" }. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Ranked, with an average

Feature adoption across accounts. Change the order and every row slides to its new place; the dashed line marks the average. Hover, tap or arrow through the rows.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { LollipopChart } from "@/components/sheenui/charts/lollipop-chart";
import { type LollipopItem } from "@/components/sheenui/charts/lollipop-chart/model";
import { LollipopTable } from "@/components/sheenui/charts/lollipop-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, LollipopTable, LollipopChart, type LollipopItem } from "@sheenui/theme";

const adoption: LollipopItem[] = [
  { label: "Dashboards", value: 78 },
  { label: "Saved filters", value: 64 },
  { label: "Scheduled reports", value: 37 },
  { label: "Alerts", value: 52 },
  { label: "CSV export", value: 71 },
  { label: "API access", value: 23 },
];
const pct = (n: number) => Math.round(n) + "%";
const average = Math.round(adoption.reduce((sum, d) => sum + d.value, 0) / adoption.length);

export function Example() {
  return (
    <ChartCard
      title="Feature adoption"
      table={<LollipopTable data={adoption} sort="descending" reference={{ value: average, label: "Average" }} format={pct} caption="Feature adoption by share of accounts" />}
    >
      <LollipopChart
        data={adoption}
        sort="descending"
        reference={{ value: average, label: "Average" }}
        highlight={["Alerts", "Scheduled reports"]}
        format={pct}
        aria-label="Share of accounts using each feature"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Upright, around a baseline

Month-on-month change in signups. Values below the baseline reach down, so growth and decline read at a glance; the sign is in every label, never only in the direction.

```tsx
import { LollipopChart } from "@/components/sheenui/charts/lollipop-chart";
import { type LollipopItem } from "@/components/sheenui/charts/lollipop-chart/model";
// Package build (after the first npm release, or a packed tarball): import { LollipopChart, type LollipopItem } from "@sheenui/theme";

const signupChange: LollipopItem[] = [
  { label: "Jan", value: 12 },
  { label: "Feb", value: 8 },
  { label: "Mar", value: -4 },
  { label: "Apr", value: 15 },
  { label: "May", value: 21 },
  { label: "Jun", value: -9 },
];
const signed = (n: number) => (n > 0 ? "+" : "") + n + "%";

export function Example() {
  return (
    <LollipopChart
      layout="vertical"
      data={signupChange}
      color={7}
      format={signed}
      valueLabel="Change in signups"
      aria-label="Month-on-month change in signups"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Along the item axis (↑ / ↓ for horizontal, ← / → for vertical): previous / next item. |
| Home / End | Jump to the first / last item. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the item, its value and its difference from the reference line.
- LollipopTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- Under reduced motion nothing morphs: the stems and dots render at their final values and new data replaces the old at once.

## All exports on this page

- LollipopChart — A lollipop chart: a thin stem from the baseline to a dot at each value.
- LollipopTable — Every item with its value (and its difference from the reference line), in the chart's order.
- defaultLollipopChartLabels — The built-in English strings of LollipopChart; spread it into your own labels and change what you need.


## When to use the lollipop chart

- Use it as a ranked chart when a bar chart would feel heavy, such as top customers by revenue or countries by NPS, since thin stems make small differences between long values visible.
- Use reference to draw an average or target line, and highlight to emphasize the items that matter while the rest step back to neutral gray.
- Set baseline when the stems should not start at zero; values below it reach the other way, which gives a diverging lollipop around a midpoint.
- Skip it when you have only two or three items, where a plain Bar chart is clearer, or when each item has a before and after value, where a Dumbbell chart shows the change.
- Pair it with ChartCard and LollipopTable for a text view, plus SegmentedControl to flip sort between descending and ascending, and Badge to label the reference value.


## Frequently asked questions

### How do I make a lollipop chart in React?

Pass data as items with a label and a value, and an optional color, plus aria-label. A thin stem runs from the baseline to a dot, and showValues prints each value next to its head. valueLabel names the value axis.

### Horizontal or vertical?

layout auto draws sideways rows, best for ranked lists and long names, and goes upright on wide charts with short names. You can force horizontal or vertical. Sideways charts grow with the number of rows, while height applies to upright ones.

### Does sorting animate?

Yes. sort takes none, descending or ascending, and changing it slides each row to its new place, while new values glide. On first view stems grow from the baseline in a staggered sweep. Under reduced motion, drawing and re-sorting are instant.

### How are items announced to assistive tech?

The chart is a figure named by its title, with the keyboard hint as its description and aria-details pointing at the table view in a ChartCard. Tab focuses it, arrow keys along the item axis move between items, Home and End jump to the ends, and Escape clears. Each move announces the item, its value and the difference from the reference line.


## Related pages

- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
