Canonical: https://lokendra-builds.github.io/sheenui/charts/network-graph

# Network Graph for React (Force-Directed)

URL: https://lokendra-builds.github.io/sheenui/charts/network-graph
Sidebar name: Network graph

A force-directed network graph for React with no dependency: springs, charge and collision computed between frames. For dependencies, teams and links. MIT.

What it is: A force-directed React network graph shows who is connected to whom, laid out by a simulation written in the component. Pass nodes (an id, with an optional group and value) and links (a source and a target id).

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/network-graph.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Network graph

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{network-graph.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/network-graph/`
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

Registry item: network-graph. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { NetworkGraph } from "@/components/sheenui/charts/network-graph";
import { type NetworkGroup, type NetworkLink, type NetworkNode } from "@/components/sheenui/charts/network-graph/model";
import { NetworkTable } from "@/components/sheenui/charts/network-graph/table";
import { networkLegend } from "@/components/sheenui/charts/network-graph/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, NetworkGraph, type NetworkGroup, networkLegend, type NetworkLink, type NetworkNode, NetworkTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| nodes | readonly NetworkNode[] | required | The nodes: { id, label?, group?, value? }. value sizes the dot. |
| links | readonly NetworkLink[] | required | Ties between nodes (undirected). Repeated pairs add up; links to unknown ids are left out. |
| groups | readonly NetworkGroup[] | optional, no default | Names and colour slots of the groups. Groups only named on nodes get the next free slot. |
| height | number | 420 | Height of the chart in px; the width follows the container. |
| showLabels | "none" \| "auto" \| "all" | "auto" | Which names to print: where they fit without colliding ("auto", default), all, or none. |
| forces | ForceSimulationOptions | {} | Sets the tuning of the force layout. |
| format | ((n: number) => string) | compact numbers in locale | Formats node values. |
| locale | string | "en" | Locale of the default number format. |
| onNodeClick | ((node: { id: string; label: string; group: string \| null; connections: string[]; }) => void) | optional, no default | Called with { id, label, group, connections } when a node is clicked, tapped, or activated with Enter. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<NetworkGraphLabels> | defaultNetworkGraphLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultNetworkGraphLabels. All 10 keys of NetworkGraphLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## NetworkTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| format | ((n: number) => string) | compact numbers in locale | Formats node values. |
| locale | string | "en" | Locale of the default number format. |
| groups | readonly NetworkGroup[] | optional, no default | Names and colour slots of the groups. Groups only named on nodes get the next free slot. |
| nodes | readonly NetworkNode[] | required | The nodes: { id, label?, group?, value? }. value sizes the dot. |
| links | readonly NetworkLink[] | required | Ties between nodes (undirected). Repeated pairs add up; links to unknown ids are left out. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ node: string; group: string; connections: string; value: string; linked: string; }> | optional, no default | Override the column headers: { node, group, connections, value, linked }. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 2: Service dependency map

Hover a service to light up what it talks to; drag it and the rest of the graph follows, then settles. Ctrl or ⌘ + scroll, a pinch or the buttons zoom; drag the background to pan. Remove the search services: the rest glide to their new places. Node size is the service's traffic.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { NetworkGraph } from "@/components/sheenui/charts/network-graph";
import { type NetworkGroup, type NetworkNode, type NetworkLink } from "@/components/sheenui/charts/network-graph/model";
import { NetworkTable } from "@/components/sheenui/charts/network-graph/table";
import { networkLegend } from "@/components/sheenui/charts/network-graph/types";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, networkLegend, NetworkTable, NetworkGraph, type NetworkGroup, type NetworkNode, type NetworkLink } from "@sheenui/theme";

const groups: NetworkGroup[] = [
  { id: "edge", label: "Edge", color: 7 },
  { id: "core", label: "Core services", color: 1 },
  { id: "data", label: "Data stores", color: 3 },
  { id: "external", label: "Third party", color: 2 },
];
const nodes: NetworkNode[] = [
  { id: "gateway", label: "API gateway", group: "edge", value: 14 },
  { id: "auth", label: "Auth", group: "core", value: 12 },
  { id: "pg", label: "Postgres", group: "data", value: 13 },
  // ...
];
const links: NetworkLink[] = [
  { source: "gateway", target: "auth" },
  { source: "auth", target: "redis" },
  // ...
];

<ChartCard
  title="Service dependencies"
  legend={networkLegend(groups)}
  table={<NetworkTable nodes={nodes} links={links} groups={groups} caption="Every service and what it calls" />}
>
  <NetworkGraph nodes={nodes} links={links} groups={groups} aria-label="Dependencies between production services" />
</ChartCard>
```

## Example 2 of 2: Collaboration network, weighted ties

Forty people in five teams; a tie's weight is how often two people worked together, and it sets the line's thickness. Names are printed only where they fit without colliding; zoom in and more appear.

```tsx
import { NetworkGraph } from "@/components/sheenui/charts/network-graph";
import { type NetworkGroup, type NetworkLink, type NetworkNode } from "@/components/sheenui/charts/network-graph/model";
// Package build (after the first npm release, or a packed tarball): import { NetworkGraph, type NetworkGroup, type NetworkLink, type NetworkNode } from "@sheenui/theme";

const teams: NetworkGroup[] = [
  { id: "product", label: "Product", color: 1 },
  { id: "design", label: "Design", color: 5 },
  { id: "eng", label: "Engineering", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "ops", label: "Operations", color: 7 },
];

const people: NetworkNode[] = [
  { id: "Ada", group: "product" },
  { id: "Ben", group: "design" },
  { id: "Cleo", group: "eng" },
  { id: "Dev", group: "data" },
  { id: "Eli", group: "ops" },
  { id: "Fay", group: "product" },
  { id: "Gus", group: "design" },
  { id: "Hana", group: "eng" },
];

// value: how often two people worked together; it sets the line's thickness
const ties: NetworkLink[] = [
  { source: "Ada", target: "Fay", value: 6 },
  { source: "Ben", target: "Gus", value: 4 },
  { source: "Cleo", target: "Hana", value: 8 },
  { source: "Ada", target: "Ben", value: 2 },
  { source: "Cleo", target: "Dev", value: 3 },
  { source: "Dev", target: "Eli", value: 5 },
  { source: "Fay", target: "Hana", value: 1 },
];

export function Example() {
  return (
    <NetworkGraph
      nodes={people}
      links={ties}
      groups={teams}
      height={460}
      forces={{ charge: -140, linkDistance: 30 }}
      aria-label="Who worked with whom this quarter, across five teams"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the graph, then the zoom buttons. |
| ← / → / ↑ / ↓ | Move to the nearest node in that direction (the view pans to keep it in sight). |
| Page Down / Page Up | Next / previous node in data order. |
| Home / End | First / last node. |
| + / − | Zoom in / out. |
| 0 | Fit the whole graph. |
| Enter / Space | Call onNodeClick for the active node. |
| Escape | Clear the reading. |

## Accessibility

- The graph is one focusable figure with the role description “network graph”; a node is announced with its group, its connections and up to eight neighbor names.
- The Table view (NetworkTable) is the keyboard list of every node and who it connects to.
- Zoom buttons are real buttons (44px on touch). A plain scroll never hijacks the page: zoom needs Ctrl/⌘, a pinch or the buttons; one finger on the background still scrolls.
- Every moving frame (layout, entrance, drag, pan, zoom) is written straight to the SVG, so the page stays smooth while you drag on a phone.
- Reduced motion: the precomputed layout appears in place, and dragging moves only that node.

## All exports on this page

- NetworkGraph — Who is connected to whom: services and their dependencies, people who work together, linked pages.
- NetworkTable — Every node with its group, its number of connections and who it connects to.
- defaultNetworkGraphLabels — The built-in English strings of NetworkGraph; spread it into your own labels and change what you need.


## When to use the network graph

- Use it as a node graph to map service dependencies, where each node is a microservice sized by traffic and a link shows that two services are connected (links are undirected), so you can see which service everything depends on.
- It fits a collaboration or org network, such as forty people in five teams, with link value as how often two people worked together and group colors showing the team.
- It also works for a site's internal link structure or a social graph, where clusters and bridge nodes matter more than precise numbers, and where a user can click a node to open details.
- Skip it when the connections have direction and quantity that must be compared; a Sankey diagram handles weighted flows, and ChordDiagram suits a dense matrix of relationships between a few groups.
- Pair it with ChartCard for the legend and Chart / Table tabs, NetworkTable as the text twin listing each node's connections, and onNodeClick to open a detail Drawer.


## Frequently asked questions

### Do I need d3-force for a network graph in React?

No. The force layout (link springs, charge, gravity and collision) is written inside the component and computed in small chunks between frames. It gives the same layout on every load. You can tune it through the forces prop.

### How are node sizes and link weights set?

A node's value sets its area, and a link's value sets its line weight. Repeated source and target pairs add up, links to unknown ids are left out, and nodes can carry a group that maps to a named palette slot through groups.

### How do I navigate the graph with a keyboard?

Arrow keys move to the nearest node in that direction, Page Down and Page Up step through every node in order, and Home and End go to the first or last node. Plus and minus zoom, 0 fits the whole graph, Escape clears the reading, and Enter or Space calls onNodeClick.

### Why are some node names missing?

With showLabels set to auto, the default, names print only where they fit without colliding, and more appear as you zoom in. Use all to print every name or none to hide them; the tooltip and NetworkTable still carry the full names.


## Related pages

- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
