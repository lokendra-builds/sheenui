Canonical: https://lokendra-builds.github.io/sheenui/charts/sankey-diagram

# Sankey Diagram for React: Flow Charts

URL: https://lokendra-builds.github.io/sheenui/charts/sankey-diagram
Sidebar name: Sankey diagram

A React Sankey diagram with no chart dependency: ribbons sized by flow for user journeys and revenue-to-profit, with a computed layout. Accessible.

What it is: A React Sankey diagram draws flows between stages as ribbons whose thickness is the amount, laid out without a chart library. Pass links as readonly SankeyLink[]: { source, target, value } objects, and optionally nodes with an id, a label and a color slot.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/sankey-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Sankey diagram

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{sankey-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/sankey-chart/`
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

Registry item: sankey-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { SankeyChart } from "@/components/sheenui/charts/sankey-chart";
import { type SankeyLink, type SankeyNode } from "@/components/sheenui/charts/sankey-chart/layout";
import { SankeyTable } from "@/components/sheenui/charts/sankey-chart/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, SankeyChart, type SankeyLink, type SankeyNode, SankeyTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| links | readonly SankeyLink[] | required | Flows between nodes. A node named only here is created with its id as the label. |
| nodes | readonly SankeyNode[] | optional, no default | Names, colours and order of the nodes. Optional. |
| height | number | 360 | Sets the height of the diagram in px. |
| nodeWidth | number | 12 | Sets the width of a node bar in px (≤ 24). |
| nodePadding | number | 16 | Gap between the nodes of a column in px. |
| align | SankeyAlign | "justify" | Column of each node: "justify" (default: sinks go to the last column), "left" (by distance from a source), "right" (by distance to a sink) or "center". |
| linkColor | "source" \| "target" \| "gradient" | "gradient" | Ribbon colour: a gradient from the source's colour to the target's (default), or either one. |
| minColumnWidth | number | 96 | Narrowest space between two columns in px; a narrower card scrolls the diagram sideways. |
| format | ((n: number) => string) | formatCompact in locale | Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share as text (0–1). |
| locale | string | "en" | Locale of the default number formats. |
| onNodeClick | ((node: { id: string; label: string; inflow: number; outflow: number; }) => void) | optional, no default | Called on click / Enter on a node. |
| onLinkClick | ((link: { source: string; target: string; value: number; }) => void) | optional, no default | Called on click / Enter on a flow. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when node colours > 3 | Tell nodes apart without colour (hatch fills, one per node colour; the first colour stays solid). Ribbons keep their source-to-target gradient. |
| labels | Partial<SankeyChartLabels> | defaultSankeyChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultSankeyChartLabels. All 10 keys of SankeyChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## SankeyTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| links | readonly SankeyLink[] | required | The same flows as the chart: { source, target, value }. |
| nodes | readonly SankeyNode[] | optional, no default | Optional node labels and colours, as in the chart. |
| format | ((n: number) => string) | compact numbers in locale | Formats a flow value for the table cells: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the table cells: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ source: string; target: string; value: string; ofSource: string; ofTarget: string; }> | optional, no default | Override the column headers: { source, target, value, ofSource, ofTarget }. |
| emptyState | ReactNode | optional, no default | Shown when there are no flows. |

## Example 1 of 3: Customer journey, morphing week to week

Ribbons fade from the source's color into the target's. Switch the week: nodes slide and ribbons reshape instead of redrawing. Focus the chart and use the arrow keys: up and down within a column, right to follow a node's flows out, right again to the next node.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { SankeyChart } from "@/components/sheenui/charts/sankey-chart";
import { type SankeyNode, type SankeyLink } from "@/components/sheenui/charts/sankey-chart/layout";
import { SankeyTable } from "@/components/sheenui/charts/sankey-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, SankeyTable, SankeyChart, type SankeyNode, type SankeyLink } from "@sheenui/theme";

const nodes: SankeyNode[] = [
  { id: "organic", label: "Organic search", color: 1 },
  { id: "paid", label: "Paid ads", color: 2 },
  { id: "social", label: "Social", color: 5 },
  { id: "referral", label: "Referrals", color: 3 },
  { id: "pricing", label: "Pricing page", color: 7 },
  { id: "docs", label: "Docs", color: 4 },
  { id: "trial", label: "Started trial", tone: "success" },
  { id: "left", label: "Left", tone: "danger" },
];
const links: SankeyLink[] = [
  { source: "organic", target: "pricing", value: 4200 },
  { source: "organic", target: "docs", value: 3100 },
  { source: "paid", target: "pricing", value: 2600 },
  // ...
  { source: "pricing", target: "trial", value: 3800 },
  { source: "pricing", target: "left", value: 5400 },
  { source: "docs", target: "trial", value: 2100 },
  { source: "docs", target: "left", value: 3600 },
];

<ChartCard
  title="Customer journey"
  description="Visitors this week, by source and first page"
  table={<SankeyTable nodes={nodes} links={links} caption="Every flow" />}
>
  <SankeyChart nodes={nodes} links={links} aria-label="Where this week's visitors came from, and where they went" />
</ChartCard>
```

## Example 2 of 3: Income statement, revenue to profit

Four columns from revenue streams to profit. Sinks line up in the last column (align justify, the default). Values use a currency format; labels move outside the diagram on wide cards and inside on narrow ones, and are only printed where they fit.

```tsx
import { SankeyChart } from "@/components/sheenui/charts/sankey-chart";
// Package build (after the first npm release, or a packed tarball): import { SankeyChart } from "@sheenui/theme";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

<SankeyChart
  nodes={[
    { id: "subs", label: "Subscriptions", color: 1 },
    { id: "services", label: "Services", color: 3 },
    { id: "market", label: "Marketplace", color: 7 },
    { id: "revenue", label: "Revenue", color: 1 },
    { id: "gross", label: "Gross profit", tone: "success" },
    { id: "cogs", label: "Cost of revenue", tone: "danger" },
    { id: "op", label: "Operating profit", tone: "success" },
    { id: "rnd", label: "R&D", color: 2 },
    { id: "snm", label: "Sales & marketing", color: 5 },
    { id: "gna", label: "G&A", color: 4 },
  ]}
  links={[
    { source: "subs", target: "revenue", value: 8_200_000 },
    { source: "services", target: "revenue", value: 1_600_000 },
    { source: "market", target: "revenue", value: 900_000 },
    { source: "revenue", target: "gross", value: 7_600_000 },
    { source: "revenue", target: "cogs", value: 3_100_000 },
    { source: "gross", target: "rnd", value: 2_600_000 },
    { source: "gross", target: "snm", value: 2_200_000 },
    { source: "gross", target: "gna", value: 700_000 },
    { source: "gross", target: "op", value: 2_100_000 },
  ]}
  height={340}
  format={(n) => usd.format(n)}
  aria-label="Fiscal 2025 income statement, from revenue streams to operating profit"
/>
```

## Example 3 of 3: Hiring pipeline, aligned left, colored by source

align="left" puts every node at its distance from the start, so candidates who drop out early stop early. linkColor="source" paints each ribbon in its source stage. Nodes named only in links take their id as the label. On a phone the five columns scroll sideways inside the card.

```tsx
import { SankeyChart } from "@/components/sheenui/charts/sankey-chart";
// Package build (after the first npm release, or a packed tarball): import { SankeyChart } from "@sheenui/theme";

<SankeyChart
  align="left"
  linkColor="source"
  nodes={[
    { id: "Applied", color: 1 },
    { id: "Screened", color: 7 },
    { id: "Interviewed", color: 3 },
    { id: "Offer", color: 5 },
    { id: "Hired", tone: "success" },
    { id: "Not a fit", tone: "danger" },
    // Two nodes may share a label; give them different ids.
    { id: "Not a fit ", label: "Not a fit", tone: "danger" },
    { id: "Withdrew", color: 4 },
    { id: "Rejected", color: 8 },
    { id: "Declined", color: 2 },
  ]}
  links={[
    { source: "Applied", target: "Screened", value: 640 },
    { source: "Applied", target: "Not a fit", value: 1180 },
    { source: "Screened", target: "Interviewed", value: 260 },
    { source: "Screened", target: "Withdrew", value: 90 },
    { source: "Screened", target: "Not a fit ", value: 290 },
    { source: "Interviewed", target: "Offer", value: 48 },
    { source: "Interviewed", target: "Rejected", value: 212 },
    { source: "Offer", target: "Hired", value: 41 },
    { source: "Offer", target: "Declined", value: 7 },
  ]}
  aria-label="Engineering hiring pipeline, from application to hire"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the diagram (one stop; a narrow card scrolls it sideways to keep the active node in view). |
| ↑ / ↓ | Previous / next node in the column; on a flow, the previous / next flow of the same node. |
| → / ← | Follow the node's first outgoing / incoming flow; on a flow, go on to its target / source node. |
| Home / End | First node of the first column / last node of the last column. |
| Enter / Space | Call onNodeClick or onLinkClick for the active node or flow. |
| Escape | Clear the reading. |

## Accessibility

- The diagram is one focusable figure with the role description “sankey diagram”; its description is the keyboard instructions.
- Keyboard moves are announced once through a polite live region (“Paid ads → Pricing page: 2.6K, 81% of Paid ads outflow, 28% of Pricing page inflow”); pointer hovers stay silent.
- The Table view (SankeyTable) lists every flow with its share of both ends: the color-free way to read it.
- On touch screens the first tap pins the readout in a band above the diagram; a second tap on the same mark activates it.
- Reduced motion: the diagram appears complete and data changes jump. Forced colors: ribbons and nodes take system colors and the active node gets a Highlight ring.

## All exports on this page

- SankeyChart — Flows between stages as ribbons whose thickness is the amount: where traffic comes from and where it goes, a budget split, energy in and out.
- SankeyTable — Every flow of a sankey as a table: from, to, amount, and its share of each end.
- defaultSankeyChartLabels — The built-in English strings of SankeyChart; spread it into your own labels and change what you need.
- layoutSankey — Lays out a sankey diagram in a width × height box: nodes in columns by their longest path from a source, sized by their flow.
- sankeyLinkPath — The ribbon of a link: a horizontal S-curve from the source's right edge to the target's left edge.


## When to use the sankey diagram

- Use it as a Sankey chart for an income statement, tracing revenue streams through costs to profit, with ribbon thickness showing how much of each stream ends up where.
- It fits a hiring pipeline or a signup funnel with drop-offs, where align left makes candidates who leave early stop early and linkColor source colors each ribbon by its source stage.
- It also works as a user flow chart for traffic, showing where visitors come from and which pages they go to, with hover tracing every path through a node.
- Skip it when flows are bidirectional or form cycles, since links that would close a cycle are left out; a ChordDiagram or NetworkGraph represents those, and FunnelChart suits a single linear sequence.
- Pair it with ChartCard for the title and Chart / Table tabs, SankeyTable as the text version, and onNodeClick or onLinkClick to filter a DataTable beside it.


## Frequently asked questions

### What data shape does a Sankey diagram need?

A links array of source, target and value, plus an optional nodes array giving each node an id, a label and a color slot from 1 to 8. A node named only in a link takes its id as its label. Repeated pairs are summed, and zero, negative or self links are dropped.

### Can I control how nodes line up in columns?

Yes, align takes justify, left, right or center. The default justify puts sinks in the last column. Left places nodes by distance from a source, right by distance to a sink. nodeWidth, nodePadding and linkColor refine the look.

### How does a Sankey diagram behave on a phone?

minColumnWidth sets the narrowest gap between columns, default 96px. A narrower card scrolls the diagram sideways inside its own container instead of squeezing ribbons. Labels move inside the diagram on narrow cards and print only where they fit.

### How do I explore a Sankey with the keyboard?

Up and Down move between nodes in a column, Right follows the first outgoing flow and Left the first incoming one. Home jumps to the first node and End to the last node of the final column. Enter or Space calls onNodeClick or onLinkClick for the active item.


## Related pages

- [Scatter & bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
