Canonical: https://lokendra-builds.github.io/sheenui/charts/sunburst

# Sunburst Chart for React with Zoom

URL: https://lokendra-builds.github.io/sheenui/charts/sunburst
Sidebar name: Sunburst chart

A React sunburst chart: a hierarchy as rings with hover path tracing, rolling numbers and click-to-zoom with an animated sweep and breadcrumb. Accessible.

What it is: A React sunburst chart shows a hierarchy as rings around a center; click a group to zoom into it with an animated sweep. Pass data as readonly SunburstNode[]: the hierarchy: leaves carry a value; groups carry children (any depth).

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/sunburst-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Sunburst chart

Files to copy from `theme/src/`:

- `components/charts/{sunburst-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/sunburst-chart/`
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

Registry item: sunburst-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { SunburstChart } from "@/components/sheenui/charts/sunburst-chart";
import { sunburstLegend, type SunburstNode } from "@/components/sheenui/charts/sunburst-chart/model";
import { SunburstTable } from "@/components/sheenui/charts/sunburst-chart/parts";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, SunburstChart, sunburstLegend, type SunburstNode, SunburstTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly SunburstNode[] | required | The hierarchy: leaves carry a value; groups carry children (any depth). |
| height | number | 360 | Height in px; the chart is a circle that fits the smaller of width and height. |
| rings | number | 3 | Rings shown at once (deeper levels appear as you zoom in). |
| drillDown | boolean | true when there are groups | Click / Enter on a group zooms into it. |
| path | readonly string[] | optional, no default | The zoomed-in path (group labels from the top), controlled. |
| defaultPath | readonly string[] | [] | Labels of the group to start zoomed into (uncontrolled). |
| onPathChange | ((path: string[]) => void) | optional, no default | Called with the path of labels when the user zooms in or out (controlled path). |
| onNodeClick | ((node: { label: string; value: number; path: string[]; }) => void) | optional, no default | Called on click / Enter on a node that has nothing to zoom into. |
| format | ((n: number) => string) | compact numbers in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<SunburstChartLabels> | defaultSunburstChartLabels | Every other string, for translation: labels={{ root: "…" }}; omitted keys keep the English of defaultSunburstChartLabels. All 9 keys of SunburstChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## SunburstTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly SunburstNode[] | required | The hierarchy: leaves carry a value; groups carry children (any depth). |
| format | ((n: number) => string) | compact numbers in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ name: string; value: string; ofParent: string; ofTotal: string; }> | optional, no default | Override the column headers: { name, value, ofParent, ofTotal }. |
| labels | Partial<SunburstTableLabels> | defaultSunburstTableLabels | Strings for the cells that have no value. Merged over defaultSunburstTableLabels. Every other string, for translation: labels={{ notApplicable: "…" }}; omitted keys keep the English of defaultSunburstTableLabels. Its only key is listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 3: Zoomable cloud spend

Three levels of a monthly bill. Each service family has its own palette slot; its children share the hue in lighter steps outwards. Click Compute (or press Enter on it) to zoom in. The path can be controlled: the buttons below jump straight to a level.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { SunburstChart } from "@/components/sheenui/charts/sunburst-chart";
import { sunburstLegend, type SunburstNode } from "@/components/sheenui/charts/sunburst-chart/model";
import { SunburstTable } from "@/components/sheenui/charts/sunburst-chart/parts";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, sunburstLegend, SunburstTable, SunburstChart, type SunburstNode } from "@sheenui/theme";
import { useState } from "react";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatUsd = (n: number) => usd.format(n);

const spend: SunburstNode[] = [
  {
    label: "Compute",
    children: [
      { label: "Kubernetes", children: [{ label: "Web", value: 18400 }, { label: "Workers", value: 9600 }, { label: "Cron jobs", value: 2100 }] },
      { label: "VMs", children: [{ label: "Build agents", value: 7200 }, { label: "Bastion", value: 600 }] },
      { label: "Serverless", value: 3900 },
    ],
  },
  {
    label: "Storage",
    children: [
      { label: "Object storage", children: [{ label: "Media", value: 6800 }, { label: "Backups", value: 4100 }, { label: "Logs", value: 2700 }] },
      { label: "Block storage", value: 5200 },
    ],
  },
  // ... Databases, Network, Observability
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={sunburstLegend(spend)}
      table={<SunburstTable data={spend} format={formatUsd} caption="Spend by service" />}
    >
      <SunburstChart
        data={spend}
        path={path}
        onPathChange={setPath}
        format={formatUsd}
        aria-label="Monthly cloud spend by service"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Bundle size, two rings

rings={2} shows two levels at a time; deeper ones appear as you zoom in. Arcs too thin for a name stay unlabelled and are read in the center, the tooltip and the table.

```tsx
import { SunburstChart } from "@/components/sheenui/charts/sunburst-chart";
import { type SunburstNode } from "@/components/sheenui/charts/sunburst-chart/model";
// Package build (after the first npm release, or a packed tarball): import { SunburstChart, type SunburstNode } from "@sheenui/theme";

const bundle: SunburstNode[] = [
  {
    label: "node_modules",
    children: [
      { label: "react-dom", value: 132 },
      { label: "motion", value: 58 },
      { label: "@base-ui", children: [{ label: "dialog", value: 14 }, { label: "menu", value: 18 }, { label: "tabs", value: 9 }, { label: "utils", value: 22 }] },
      { label: "tailwind-merge", value: 21 },
      { label: "react", value: 8 },
    ],
  },
  {
    label: "src",
    children: [
      { label: "components", children: [{ label: "charts", value: 96 }, { label: "data-table", value: 41 }, { label: "forms", value: 37 }, { label: "overlays", value: 29 }] },
      { label: "pages", value: 64 },
      { label: "hooks", value: 9 },
    ],
  },
  { label: "styles", value: 31 },
];

export function Example() {
  return (
    <SunburstChart
      data={bundle}
      rings={2}
      height={300}
      format={(kb) => `${kb} kB`}
      aria-label="Production bundle size by package and folder"
    />
  );
}
```

## Example 3 of 3: Flat data: one ring

Without children a sunburst is a single ring, like a donut; every arc gets its own slot. Values below a sliver still get a hairline arc.

```tsx
import { SunburstChart } from "@/components/sheenui/charts/sunburst-chart";
// Package build (after the first npm release, or a packed tarball): import { SunburstChart } from "@sheenui/theme";

<SunburstChart
  data={[
    { label: "Chrome", value: 64.8 },
    { label: "Safari", value: 18.6 },
    { label: "Edge", value: 5.3 },
    { label: "Firefox", value: 2.7 },
    { label: "Mobile", value: 2.4 },
    { label: "Other", value: 6.2 },
  ]}
  height={300}
  format={(n) => `${n.toFixed(1)}%`}
  aria-label="Browser share of sessions"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the breadcrumb buttons, then the chart (one stop). |
| ← / → | Previous / next arc in the ring (wraps around). |
| ↓ | Out to the arc's first child. |
| ↑ | Back in to its parent. |
| Home / End | First / last arc of the ring. |
| Enter / Space | Zoom into the group (onNodeClick for an arc with nothing to zoom into). |
| Escape / Backspace | Zoom out one level; at the top, Escape clears the reading. |

## Accessibility

- The chart is one focusable figure with the role description “sunburst chart”; the breadcrumb is a nav landmark named after the chart, with aria-current on the level shown.
- Moves and zooms are announced through a polite live region (“Compute, Kubernetes: $30.1K, 63% of Compute, 29% of total”, “Compute: 3 items”).
- The center always reads the active arc (or the level shown); the Table view (SunburstTable) lists every node, indented by depth.
- Arc names are drawn in black or white, whichever contrasts more with the fill, and only where they fit.
- Reduced motion: no sweep and no zoom animation; the number in the center jumps.

## All exports on this page

- SunburstChart — A hierarchy as rings around a centre: each ring is a level, each arc's angle its share.
- SunburstTable — Every node, depth first (groups in bold, children indented), with its value and shares.
- defaultSunburstChartLabels — The built-in English strings of SunburstChart; spread it into your own labels and change what you need.
- defaultSunburstTableLabels — English defaults of SunburstTableLabels.
- sunburstLegend — Legend items for a sunburst's top-level groups (pass to ChartCard's legend).


## When to use the sunburst chart

- Use it as a hierarchical pie chart for a bundle size breakdown, where packages sit in rings by folder and you need to see which branch of the hierarchy owns the weight.
- It fits cloud spend by team and service, or disk usage by folder, where clicking a group zooms into it with an animated sweep.
- It works for flat data too: without children it becomes a single ring like a donut, with every arc taking its own slot and tiny values still getting a hairline arc.
- Skip it when the hierarchy has many tiny leaves or readers must compare sizes precisely; Treemap uses area more efficiently, and a BarChart is better for exact comparison.
- Pair it with ChartCard for the title, SunburstTable for the nested text view with percent of parent and total, and onNodeClick to open details for a leaf.


## Frequently asked questions

### How do I make a sunburst chart in React?

Pass nested data: leaves carry a value, groups carry children to any depth and add them up. Each node has a label and an optional color. Height defaults to 360 and the chart is a circle fitting the smaller of width and height.

### How many rings are shown, and how do I zoom?

rings defaults to 3 levels at a time; deeper ones appear as you zoom. Click or press Enter on a group to zoom into it; the breadcrumb, the center, or Escape zoom back out. Use path, defaultPath and onPathChange to control the zoom.

### How do I move around with the keyboard?

Left and Right move around the ring and wrap, Down goes out to the first child, Up back to the parent, and Home and End reach the first or last arc of the ring. Enter or Space zooms in, and Escape or Backspace zooms out one level.

### Why are some arcs unlabeled?

Arcs too thin to hold a name stay unlabeled. Hover one to read it in the center, where the number rolls to its value, or find it in the tooltip and the SunburstTable. Reduced motion skips the sweep and the number roll.


## Related pages

- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
