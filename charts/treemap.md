Canonical: https://lokendra-builds.github.io/sheenui/charts/treemap

# React Treemap Chart: Animated & Accessible

URL: https://lokendra-builds.github.io/sheenui/charts/treemap
Sidebar name: Treemap

A squarified React treemap with zoomable groups, labels only where they fit and black or white text chosen by contrast. No chart dependency. Free, MIT.

What it is: A React treemap shows part-to-whole as nested rectangles, laid out by the squarified algorithm so tiles stay easy to compare. Pass data as readonly TreemapNode[]: nodes: leaves carry a value; groups carry children (any depth).

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/treemap.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Treemap

Files to copy from `theme/src/`:

- `components/charts/{treemap.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
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

Registry item: treemap. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { Treemap, treemapLegend, type TreemapNode, TreemapTable } from "@/components/sheenui/charts/treemap";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, formatCompact, Treemap, treemapLegend, type TreemapNode, TreemapTable, useToast } from "@sheenui/theme";
```

## Treemap

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly TreemapNode[] | required | Nodes: leaves carry a value; groups carry children (any depth). |
| height | number | 320 | Height of the treemap in px; the width follows the container. |
| color | ChartColor | 1 | Hue for tiles that don't get a group colour (flat data: one series, one hue). Hierarchies colour each top-level group by its own slot instead. |
| patterns | boolean | true when there are more than 3 top-level groups | Tell groups apart without colour (hatch fills). Default: on when the chart has more than 3 groups. A flat treemap is one hue, so it has no groups to tell apart. |
| nested | boolean | true | Show each group's children inside it, under a header. |
| drillDown | boolean | true when there are groups | Click / Enter on a group zooms into it, with a breadcrumb to zoom back out. |
| path | readonly string[] | optional, no default | The zoomed-in path (group labels from the top), controlled. |
| defaultPath | readonly string[] | [] | Path of the node the chart starts zoomed into (uncontrolled). |
| onPathChange | ((path: string[]) => void) | optional, no default | Called with the path of labels when the user zooms in or out (controlled path). |
| onNodeClick | ((node: { label: string; value: number; path: string[]; }) => void) | optional, no default | Called on click / Enter on a tile that has nothing to zoom into. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<TreemapLabels> | defaultTreemapLabels | Every other string, for translation: labels={{ root: "…" }}; omitted keys keep the English of defaultTreemapLabels. All 10 keys of TreemapLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## TreemapTable props, treemapLegend and squarify

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly TreemapNode[] | required | Nodes: leaves carry a value; groups carry children (any depth). |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ name: string; value: string; ofParent: string; ofTotal: string; }> | optional, no default | Override the column headers: { name, value, ofParent, ofTotal }. |
| labels | Partial<TreemapTableLabels> | defaultTreemapTableLabels | Strings for the cells that have no value. Merged over defaultTreemapTableLabels. Every other string, for translation: labels={{ notApplicable: "…" }}; omitted keys keep the English of defaultTreemapTableLabels. Its only key is listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no nodes. |
| treemapLegend(data) | LegendItem[] | optional, no default | Legend items for the top-level groups, for ChartCard's legend. |
| squarify(values, rect) | TreemapRect[] | optional, no default | The layout on its own: one rect per value, in input order. |

## Example 1 of 2: Cloud spend, zoomable

Each team keeps one palette slot and its services share the hue. Click a team (or focus the chart, move with the arrow keys and press Enter) to zoom in; the breadcrumb or Escape zooms back out. Switching the quarter re-flows the tiles.

```tsx
import { useState } from "react";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { treemapLegend, TreemapTable, Treemap, type TreemapNode } from "@/components/sheenui/charts/treemap";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, formatCompact, treemapLegend, TreemapTable, Treemap, type TreemapNode } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const spend: TreemapNode[] = [
  {
    label: "Engineering",
    color: 1,
    children: [
      { label: "Compute", value: 158000 },
      { label: "Storage", value: 64000 },
      { label: "CDN", value: 21000 },
    ],
  },
  {
    label: "Data",
    color: 7,
    children: [
      { label: "Warehouse", value: 92000 },
      { label: "Streaming", value: 37000 },
    ],
  },
  {
    label: "Support",
    color: 3,
    children: [
      { label: "Tooling", value: 18000 },
      { label: "Telephony", value: 12000 },
    ],
  },
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={treemapLegend(spend)}
      table={<TreemapTable data={spend} format={usd} />}
    >
      <Treemap
        data={spend}
        format={usd}
        path={path} // optional: control the zoom level
        onPathChange={setPath}
        aria-label="Cloud spend by team and service"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Flat data, one hue

Without groups every tile is the same series, so it takes one hue and needs no legend; size alone carries the value. Tiny tiles stay unlabelled rather than overflow, and the tooltip and table still read them. Click a tile to handle it.

```tsx
import { Treemap, type TreemapNode } from "@/components/sheenui/charts/treemap";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Treemap, useToast, type TreemapNode } from "@sheenui/theme";

const bundle: TreemapNode[] = [
  { label: "react-dom", value: 132 },
  { label: "motion", value: 58 },
  { label: "lucide-react", value: 34 },
  { label: "date-fns", value: 21 },
  { label: "zod", value: 14 },
];

export function Example() {
  const toast = useToast();
  return (
    <Treemap
      data={bundle}
      color={7}
      format={(n) => `${n} kB`}
      onNodeClick={(node) => toast.info(node.label)}
      aria-label="JavaScript bundle size by package"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Move spatially between tiles. |
| Home / End | Largest / smallest tile. |
| Enter | Zoom into the group (with drillDown). |
| Escape / Backspace | Zoom back out. |

## Accessibility

- The chart is a focusable figure named by its aria-label and described by the reading hint (and the drill-down hint when it is on); zooming is announced, and the breadcrumb is real buttons.
- TreemapTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists every node.
- Reduced motion: the tiles appear at their final sizes and data changes jump instead of morphing.

## All exports on this page

- Treemap — Part-to-whole as nested rectangles, laid out with the squarified algorithm so tiles stay close to square (and comparable).
- TreemapTable — Every node, depth first (groups in bold, children indented), with its value and shares.
- defaultTreemapLabels — The built-in English strings of Treemap; spread it into your own labels and change what you need.
- defaultTreemapTableLabels — English defaults of TreemapTableLabels.
- squarify — Lays values out inside rect as rectangles whose areas are proportional to the values.
- treemapLegend — Legend items for a hierarchical treemap's top-level groups (pass to ChartCard's legend).


## When to use Treemap

- Use it as a treemap chart in React for cloud spend by team and service, where each team keeps one hue, services share it, and tile area shows where the money goes.
- It fits a portfolio or inventory with a natural hierarchy, such as product categories and SKUs, where clicking a group zooms in and the breadcrumb or Escape zooms back.
- Flat data also works: without groups every tile uses one hue and needs no legend, so size alone carries the value.
- Skip it when exact comparison or time trends matter, since area is hard to judge; use BarChart for comparisons, and SunburstChart when the path through the hierarchy matters more than area.
- Pair it with ChartCard for the title, treemapLegend for the top-level group legend, and TreemapTable for every node as text with percent of group and total.


## Frequently asked questions

### Do I need a library for a treemap in React?

No. The squarified layout is implemented in the file with no dependency, so tiles stay close to square. The layout is also exported as squarify(values, rect) if you want rectangles for your own rendering.

### How do I enable drill-down?

With groups, drillDown is on by default: click a team, or focus the chart, move with arrow keys and press Enter. The breadcrumb, Escape or Backspace zooms out. Control the zoom with path, defaultPath and onPathChange.

### Why are small tiles unlabeled?

Labels appear only where they fit, in black or white by contrast. Tiny tiles stay unlabeled rather than overflow, while the tooltip and TreemapTable still read them. Use onNodeClick for tiles with nothing to zoom into.

### How are colors assigned?

In a hierarchy, each top-level group takes its own palette slot from node.color or position, and its children share the hue. For flat data, the color prop picks one slot from 1 to 8, default 1.


## Related pages

- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
