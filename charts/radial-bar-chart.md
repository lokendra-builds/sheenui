Canonical: https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart

# Radial Bar Chart for React: KPI Rings

URL: https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart
Sidebar name: Radial bar chart

A React radial bar chart: 2 to 5 concentric KPI rings against their goals, each on its own track. Hover or arrow through rings to read them. Animated, MIT.

What it is: A React radial bar chart draws 2 to 5 measures as concentric rings against their goals, like activity rings. Pass data as readonly RadialBarItem[]: takes 2–5 measures, outermost ring first.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/radial-bar-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Radial bar chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{radial-bar-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-utils.ts}`
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

Registry item: radial-bar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { RadialBarChart } from "@/components/sheenui/charts/radial-bar-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { RadialBarChart } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly RadialBarItem[] | required | Takes 2–5 measures, outermost ring first. |
| max | number | 100 | Value of a full ring for items without their own max. |
| variant | "ring" \| "arc" | "arc" | "arc": three-quarter rings with their names in the open quarter (no legend needed). "ring": full rings, with a legend beside them. |
| display | "value" \| "percent" | "percent" | What the ring labels and legend print: the share of the goal, or the value itself. |
| diameter | number | 260 | Largest diameter (px). The chart shrinks to fit narrower containers. |
| format | ((n: number) => string) | formatCompact | Formats values (tooltip centre, table). |
| formatPercent | ((n: number) => string) | formatPercentDefault ("82%" / "\u221220%": a typographic minus, as formatCompact) | Formats each share (a number from 0 to 100) for the labels and tooltip. |
| centerValue | ReactNode | optional, no default | Shown in the centre while no ring is active, e.g. an overall score. |
| centerLabel | ReactNode | optional, no default | Shows the caption in the middle under centerValue. |
| patterns | boolean | true when data.length > 3 | Tell rings apart without colour (hatch fills). |
| labels | Partial<RadialBarChartLabels> | defaultRadialBarChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRadialBarChartLabels. All 7 keys of RadialBarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## RadialBarTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly RadialBarItem[] | required | Takes 2–5 measures, outermost ring first. |
| max | number | 100 | Value of a full ring for items without their own max. |
| format | ((n: number) => string) | formatCompact | Formats values (tooltip centre, table). |
| labels | Partial<RadialBarChartLabels> | defaultRadialBarChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultRadialBarChartLabels. All 7 keys of RadialBarChartLabels are listed in the key table under the props table. |
| formatPercent | ((n: number) => string) | formatPercentDefault ("82%" / "\u221220%": a typographic minus, as formatCompact) | Formats each share (a number from 0 to 100) for the labels and tooltip. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |

## Example 1 of 2: Three-quarter arcs

The default. Each ring's name and value sit in the open quarter, right where the ring starts: no legend to cross-reference.

```tsx
import { RadialBarChart } from "@/components/sheenui/charts/radial-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { RadialBarChart } from "@sheenui/theme";

<RadialBarChart
  data={[
    { label: "New ARR", value: 82, color: 1 },
    { label: "Expansion", value: 64, color: 2 },
    { label: "Retention", value: 91, color: 3 },
    { label: "Pipeline", value: 47, color: 7 },
  ]}
  centerValue="71%"
  centerLabel="Overall"
  aria-label="Quarterly goals, percent reached"
/>
```

## Example 2 of 2: Full rings with a legend

variant="ring" closes the rings (a 2px gap marks the seam) and lists the measures beside them. Each item can bring its own max; values past it fill the ring and still print in full.

```tsx
import { RadialBarChart } from "@/components/sheenui/charts/radial-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { RadialBarChart } from "@sheenui/theme";

<RadialBarChart
  variant="ring"
  display="value"
  diameter={220}
  data={[
    { label: "Steps", value: 8240, max: 10000, color: 1 },
    { label: "Active minutes", value: 42, max: 60, color: 3 },
    { label: "Calories", value: 380, max: 500, color: 2 },
  ]}
  centerValue="76%"
  centerLabel="Daily goals"
  aria-label="Activity against daily goals"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Move between measures. |
| Home / End | Jump to the first / last measure. |
| Escape | Clear the reading. |

## Accessibility

- The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the measure, its value and its share.
- For a non-visual reading, give ChartCard's table prop a RadialBarTable; the Chart / Table tabs then expose each value as plain table cells.
- With reduced motion on, the rings start at their final lengths and a data change jumps straight to the new state.

## All exports on this page

- RadialBarChart — Concentric arcs or rings, one per measure, each filled to its share of a maximum.
- RadialBarTable — The chart's table view: every measure with its value, goal and share.
- defaultRadialBarChartLabels — The built-in English strings of RadialBarChart; spread it into your own labels and change what you need.


## When to use the radial bar chart

- Use it as progress rings for quarterly goals, where two to five measures each show progress against a target as concentric rings with the share printed right where each ring starts.
- It fits an activity-ring style summary, such as move, exercise and stand today versus yesterday, with variant ring closing the rings and a legend beside them.
- It works when items have different targets, since each datum can bring its own max and values past it still fill the ring and print in full.
- Skip it when there is only one measure or you need a single value on a dial; use GaugeChart or RadialProgress, and use BarChart for more than five items or exact comparison.
- Pair it with ChartCard for the title, RadialBarTable for the Chart / Table tabs, and centerValue and centerLabel to show an overall figure while no ring is active.


## Frequently asked questions

### How many rings can a radial bar chart have?

Two to five measures, outermost ring first. Each datum is label, value, an optional max and optional color. Items without their own max use the chart-level max, which defaults to 100, so a ring represents progress toward a goal.

### What is the difference between arc and ring variants?

The default arc draws three-quarter arcs and prints each name and value in the open quarter. Variant ring closes the rings, marks the seam with a 2px gap and lists the measures beside them, so you do not need a separate legend.

### Can the labels show values instead of percentages?

Yes. display defaults to percent, the share of the goal, and value prints the number. Use format and formatPercent to change either one. The labels prop overrides strings including the table headers.

### How is it navigated with the keyboard?

The chart is one tab stop. Arrow keys move between measures, Home and End jump to the first or last one, and Escape clears the reading. Each move announces the measure, its value and its share, and hover reads a ring in the center.


## Related pages

- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram)
- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
