Canonical: https://lokendra-builds.github.io/sheenui/charts/streamgraph

# Streamgraph Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/streamgraph
Sidebar name: Streamgraph

A React streamgraph: stacked areas flowing around a moving center line, with a wiggle baseline, inside labels and a crosshair that reads every layer. MIT.

What it is: A React streamgraph shows how a mix swells and fades over time as stacked areas flowing around a moving center line. Pass data as readonly ChartRow[]: one row per x value.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/streamgraph.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Streamgraph

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{streamgraph.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/button/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/streamgraph/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: streamgraph. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { Streamgraph } from "@/components/sheenui/charts/streamgraph";
import { streamgraphLegend } from "@/components/sheenui/charts/streamgraph/model";
import { StreamgraphTable } from "@/components/sheenui/charts/streamgraph/parts";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartRow, type ChartSeries, Streamgraph, streamgraphLegend, StreamgraphTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per x value (e.g. per week). |
| index | string | required | Key of the x value in each row. |
| series | readonly ChartSeries[] | required | The layers. Up to 8 keep their colour slot; any more fold into “Other”. |
| offset | "wiggle" \| "silhouette" | "wiggle" | "wiggle" (default): the classic streamgraph, as flat as possible. "silhouette": mirrored around a centre line. |
| order | "none" \| "insideOut" | "insideOut" | "insideOut" (default) puts layers that peak mid-way in the middle; "none" keeps series order (bottom up). |
| inlineLabels | boolean | true | Name each layer inside its thickest stretch, when it fits. |
| height | number | 300 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats shares of the total. |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when layers > 3 | Tell layers apart without colour (hatch fills; the first layer stays solid). |
| labels | Partial<StreamgraphLabels> | defaultStreamgraphLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultStreamgraphLabels. All 5 keys of StreamgraphLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## StreamgraphTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per x value (e.g. per week). |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<StreamgraphLabels> | defaultStreamgraphLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultStreamgraphLabels. All 5 keys of StreamgraphLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| index | string | required | Key of the x value in each row. |
| series | readonly ChartSeries[] | required | The layers. Up to 8 keep their colour slot; any more fold into “Other”. |
| indexLabel | string | optional, no default | Sets the header of the first column. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |

## Example 1 of 2: A year of listening

Seven genres over 52 weeks. Hover a layer to bring it forward; use left / right to move through time and up / down to pick a layer. Switch the baseline to compare wiggle and silhouette.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { Streamgraph } from "@/components/sheenui/charts/streamgraph";
import { streamgraphLegend } from "@/components/sheenui/charts/streamgraph/model";
import { StreamgraphTable } from "@/components/sheenui/charts/streamgraph/parts";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, streamgraphLegend, StreamgraphTable, Streamgraph, type ChartRow, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "pop", label: "Pop", color: 5 },
  { key: "hiphop", label: "Hip-hop", color: 2 },
  { key: "rock", label: "Rock", color: 8 },
];
const data: ChartRow[] = [
  { week: "Nov 3", pop: 6.2, hiphop: 4.1, rock: 2.8 },
  { week: "Nov 10", pop: 6.8, hiphop: 4.4, rock: 2.5 },
  { week: "Nov 17", pop: 7.4, hiphop: 3.9, rock: 2.2 },
  { week: "Nov 24", pop: 7.0, hiphop: 4.8, rock: 2.6 },
  { week: "Dec 1", pop: 8.1, hiphop: 5.2, rock: 3.0 },
  { week: "Dec 8", pop: 7.6, hiphop: 4.6, rock: 3.4 },
];
const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const hours = (n: number) => oneDecimal.format(n) + " h";

export function Example() {
  return (
    <ChartCard
      title="Listening by genre"
      legend={streamgraphLegend(series)}
      table={<StreamgraphTable data={data} index="week" series={series} format={hours} />}
    >
      <Streamgraph data={data} index="week" series={series} offset="wiggle" format={hours} aria-label="Weekly listening hours by genre" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Traffic sources around a launch

Thirty days of visits by source, with a launch spike in week three. Silhouette or wiggle, the total is always the stream's thickness.

```tsx
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { Streamgraph } from "@/components/sheenui/charts/streamgraph";
// Package build (after the first npm release, or a packed tarball): import { Streamgraph, type ChartRow, type ChartSeries } from "@sheenui/theme";

const sources: ChartSeries[] = [
  { key: "search", label: "Search", color: 1 },
  { key: "social", label: "Social", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "email", label: "Email", color: 7 },
];
const traffic: ChartRow[] = [
  { day: "Day 1", search: 1800, social: 640, referral: 1100, email: 420 },
  { day: "Day 8", search: 1850, social: 700, referral: 1150, email: 400 },
  { day: "Day 15", search: 2300, social: 1900, referral: 2600, email: 2400 },
  { day: "Day 22", search: 2100, social: 1200, referral: 1700, email: 450 },
  { day: "Day 30", search: 1950, social: 800, referral: 1300, email: 430 },
];

export function Example() {
  return <Streamgraph data={traffic} index="day" series={sources} height={260} aria-label="Daily visits by source" />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart (one tab stop). |
| ← / → | Move through time. |
| ↑ / ↓ | Pick a layer, top to bottom as stacked on screen. |
| Home / End | First / last point in time. |
| Escape | Clear the layer and the crosshair. |

## Accessibility

- The chart is one focusable figure; each step through time announces every layer's value and share, largest first, then the total. With a layer picked, only that layer is read.
- Layer names sit on solid tags of the chart surface, so they meet AA contrast on any layer color; layers that are too thin for a name rely on the legend and the tooltip.
- Color slots are fixed per series and never repeat: more than 8 layers fold into a gray “Other”.
- On phones the readout docks above the plot instead of covering it; vertical swipes keep scrolling the page.
- The table view lists every value with a total column. Reduced motion draws the layers in place.

## All exports on this page

- Streamgraph — Stacked areas flowing around a moving centre line: how a mix of categories swells and fades over time (genres, topics, traffic sources).
- StreamgraphTable — One row per x value, one column per layer, plus the total.
- defaultStreamgraphLabels — The built-in English strings of Streamgraph; spread it into your own labels and change what you need.
- foldStreamSeries — Fold series past the 8th into one "Other" layer (neutral grey).
- insideOutOrder — Inside-out order (Byron & Wattenberg): series that peak early and late go to the edges, the ones peaking mid-way sit in the middle.
- streamBaseline — Baseline per x of a stream: "wiggle" minimises the layers' weighted slope (Byron & Wattenberg's streamgraph, as d3's stackOffsetWiggle).
- streamgraphLegend — Legend for a streamgraph: one swatch per layer, as folded.


## When to use Streamgraph

- Use it as a stream chart for a year of listening hours by genre, where the shape of each layer shows how a mix swells and fades across 52 weeks.
- It suits traffic sources around a launch, with thirty days of visits by source and a spike in week three, where the stream's thickness is always the total.
- It works for any many-category time series where totals matter less than the rhythm of change, with layer names printed inside their thickest stretch when they fit.
- Skip it when readers must read exact values or compare layers against a common baseline; StackedAreaChart keeps a flat bottom, and LineChart compares individual series better.
- Pair it with ChartCard and its legend, StreamgraphTable for exact values as text, and a SegmentedControl to switch offset between wiggle and silhouette.


## Frequently asked questions

### What is the difference between wiggle and silhouette?

offset defaults to wiggle, Byron and Wattenberg's minimal-wiggle baseline, which keeps layers as flat as they can be. Silhouette mirrors the stream around a center line. In both, the total is the stream's thickness.

### How are layers ordered?

order defaults to insideOut, which puts layers that peak mid-way in the middle. Set none to keep your series order from bottom up. Each series has a fixed color slot, and series past eight fold into Other.

### How do I read a layer with the keyboard?

Left and Right move through time, Up and Down pick a layer top to bottom as stacked on screen, Home and End jump to the first or last point, and Escape clears the layer. Hovering a layer lights it and dims the rest, and the crosshair reads every layer with its share.

### Can I hide the inline layer names?

Set inlineLabels to false. By default each layer is named inside its thickest stretch, only when the name fits. The legend, tooltip and StreamgraphTable always carry every name, and height defaults to 300px.


## Related pages

- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)
- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
