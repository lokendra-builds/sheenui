Canonical: https://lokendra-builds.github.io/sheenui/charts/donut-chart

# Donut Chart for React with Center Label

URL: https://lokendra-builds.github.io/sheenui/charts/donut-chart
Sidebar name: Donut chart

An animated React donut chart with a center total, hover and keyboard tooltips, a full legend and a table view. Color-blind-safe palette. Free, MIT.

What it is: An animated React donut chart with the total in the center, a full legend and keyboard-readable slices. Pass data as readonly DonutSlice[]: part-to-whole only, at most 6 slices: fold the rest into "Other".

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/donut-chart.json
```

By Lokendra Singh Rathore. Published November 10, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Donut chart

Files to copy from `theme/src/`:

- `components/charts/{donut-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: donut-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { DonutChart } from "@/components/sheenui/charts/donut-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";
```

## DonutChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly DonutSlice[] | required | Part-to-whole only, at most 6 slices: fold the rest into "Other". Negative values count as 0. |
| diameter | number | 200 | Outer diameter of the ring in px; the chart is a circle of this width and height. |
| format | ((n: number) => string) | compact numbers in locale | Formats values in the tooltip and legend. |
| locale | string | "en" | Locale for the default number format and percentages (e.g. "de"). |
| emptyState | ReactNode | optional, no default | Shown in the centre when there is nothing to plot (no slices, or every value is 0). |
| legendToggle | boolean | true | Legend items toggle slices (the ring re-flows, the total updates). |
| hiddenSlices | readonly string[] | optional, no default | Slice keys (or labels) to hide (controlled). |
| defaultHiddenSlices | readonly string[] | [] | Slice keys (or labels) hidden at first (uncontrolled). |
| onHiddenSlicesChange | ((keys: string[]) => void) | optional, no default | Called with the keys of the hidden slices whenever the legend toggles one. |
| glow | boolean | true | Soft glow on the active slice in dark mode. |
| patterns | boolean | true when data.length > 3 | Tell slices apart without colour (hatch fills). |
| labels | Partial<DonutChartLabels> | defaultDonutChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ legend: "…" }}; omitted keys keep the English of defaultDonutChartLabels. All 7 keys of DonutChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## DonutTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly DonutSlice[] | required | Part-to-whole only, at most 6 slices: fold the rest into "Other". Negative values count as 0. |
| format | ((n: number) => string) | compact numbers in locale | Formats values in the tooltip and legend. |
| locale | string | "en" | Locale for the default number format and percentages (e.g. "de"). |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share (0.412 → "41.2%"). |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| labels | Partial<DonutTableLabels> | defaultDonutTableLabels | Header and empty-state text; pass only the keys you translate. Every other string, for translation: labels={{ slice: "…" }}; omitted keys keep the English of defaultDonutTableLabels. All 4 keys of DonutTableLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example: Donut chart with a center total

Hover a slice to read it in the center. Click a legend key to leave a slice out; the ring re-flows and the total re-counts.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { DonutChart } from "@/components/sheenui/charts/donut-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";

const traffic = [
  { label: "Organic search", value: 41200 },
  { label: "Direct", value: 22800 },
];

export function Example() {
  return (
    <ChartCard
      title="Traffic sources"
      description="Sessions this month"
      table={
        <ChartTable
          data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
          index="source"
          indexLabel="Source"
          series={[{ key: "sessions", label: "Sessions", color: 1 }]}
        />
      }
    >
      <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move through the Chart / Table tabs, then the legend keys, then the chart itself. |
| ← → (↑ ↓) | Read the previous or next point; the values are announced. |
| Home / End | Jump to the first or last point. |
| Escape | Clear the active point. |
| Enter / Space on a legend key | Hide or show that series. |

## Accessibility

- Tab focuses the ring as one stop; the arrow keys step slice by slice and announce the label, the value and its share of the total.
- The center total is text, not an image, and the Chart / Table tabs switch to a DonutTable with slice, value and share columns.
- Legend entries are toggle buttons (Enter or Space) that hide a slice; with more than three slices each gets its own hatch (patterns).
- Reduced motion: the ring appears at its final angles and data changes jump.

## When to use a donut chart

A React donut chart, which some teams call a doughnut chart, shows how one total divides into a few parts, such as traffic sources, plan mix or storage by file type. The hole in the middle holds the total, which a plain pie chart has no room for, and the ring stays legible on a glass card.

If the parts are close in size or there are many, a bar chart is easier to compare. See [the pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart), [the radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart) and [the gauge chart](https://lokendra-builds.github.io/sheenui/charts/gauge-chart) for related shapes, or [the React bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart) for an exact comparison.


## Frequently asked questions

### How many slices should a donut chart have?

At most six. Beyond that the slices are too thin to compare; group the small ones into an Other slice or switch to a bar chart.

### What does the center show?

The total by default, and the label and value of the hovered or focused slice. Pass labels.center to name the total.

### Donut chart or pie chart?

Use the donut when the total matters: the center carries it as text. Use the pie chart (its own page) when only the shares matter and you want the whole disc. Both take a list of labelled values.

### How do screen readers read a donut chart?

Tab focuses the ring and the arrow keys step slice by slice, announcing the label, the value and its percentage of the total. The center total is text, not an image, and the Table tab (DonutTable) lists slice, value and share.

### Can people hide slices?

Yes. Legend entries are toggle buttons (Enter or Space) and the percentages and center total update for the slices left. Control it with hiddenSlices and onHiddenSlicesChange, or start with defaultHiddenSlices.

### How do slices stay apart without color?

With patterns: with more than three slices each slice after the first gets its own hatch (or set patterns yourself), and the legend and table name every slice, so the chart never depends on hue.

### What data shape does it take?

An array of slices, each with a label and a value, plus an optional color and a key for legend toggling. Pass format and locale to change the number text. When there is nothing to plot, emptyState is shown instead of an empty ring.


## All exports on this page

- DonutChart — A donut for the share of a whole, with a centre label (labels.center, default "Total") and a legend that can hide slices.
- DonutTable — The table view of a DonutChart: every slice with its value and its share of the total.
- defaultDonutChartLabels — The built-in English strings of DonutChart; spread it into your own labels and change what you need.
- defaultDonutTableLabels — English defaults of DonutTableLabels.


## Related pages

- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)
- [100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart)
- [Bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
