Canonical: https://lokendra-builds.github.io/sheenui/charts/histogram

# Histogram Chart for React with Density Curve

URL: https://lokendra-builds.github.io/sheenui/charts/histogram
Sidebar name: Histogram

A React histogram with Freedman-Diaconis or Sturges bins, an optional density curve and median or percentile markers. Animated, accessible, Tailwind v4.

What it is: A React histogram shows how a measure is spread, with automatic bins, an optional density curve and percentile markers. Pass values as a readonly number[] of raw measurements: the chart bins them for you.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/histogram.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Histogram

Files to copy from `theme/src/`:

- `components/charts/{histogram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/histogram/`
- `components/charts/kits/`
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

Registry item: histogram. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { Histogram, HistogramTable } from "@/components/sheenui/charts/histogram";
import { histogramLegend } from "@/components/sheenui/charts/histogram/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, Histogram, histogramLegend, HistogramTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| values | readonly number[] | required | The raw sample, e.g. every request's latency. Non-finite values are ignored. |
| bins | number \| BinMethod | "auto" | A bin count, or a rule: "auto" (default), "sturges", "freedman-diaconis" or "scott". |
| domain | readonly [number, number] | the data's extent | Range to bin. Values outside it are left out. |
| niceBins | boolean | true | Snap bin edges to round numbers (the bin count lands near bins). |
| measure | "count" \| "percent" | "count" | Height of a bar: the number of values, or their share of the sample. |
| bars | boolean | true | Draw the bins. Turn off (with density) for a smooth density plot. |
| density | boolean | false | Overlay a smooth density curve (Gaussian kernel density estimate). |
| bandwidth | number | Silverman's rule | Sets the KDE bandwidth in data units. |
| markers | readonly HistogramMarker[] | [] | Reference lines: "median", "mean", "p90", "p95", "p99", or { value, label }. |
| color | ChartColor | 1 | Sets the palette slot (1–8) of the bars. |
| height | number | 280 | Height of the chart in px; the width follows the container. |
| xLabel | string | optional, no default | Names the value axis (shown under it and in the readout). |
| yLabel | string | optional, no default | Names the count axis (shown above it). |
| format | ((n: number) => string) | formatCompact in locale | Formats values (bin edges, markers). |
| formatCount | ((n: number) => string) | formatCompact in locale | Formats a bin count for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share as text (0.12 → "12%"). |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<HistogramLabels> | defaultHistogramLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultHistogramLabels. All 14 keys of HistogramLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## HistogramTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| format | ((n: number) => string) | formatCompact in locale | Formats values (bin edges, markers). |
| values | readonly number[] | required | The raw sample, e.g. every request's latency. Non-finite values are ignored. |
| labels | Partial<HistogramLabels> | defaultHistogramLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultHistogramLabels. All 14 keys of HistogramLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share as text (0.12 → "12%"). |
| domain | readonly [number, number] | the data's extent | Range to bin. Values outside it are left out. |
| bins | number \| BinMethod | "auto" | A bin count, or a rule: "auto" (default), "sturges", "freedman-diaconis" or "scott". |
| niceBins | boolean | true | Snap bin edges to round numbers (the bin count lands near bins). |
| xLabel | string | optional, no default | Names the value axis (shown under it and in the readout). |
| formatCount | ((n: number) => string) | formatCompact in locale | Formats a bin count for the labels, tooltips and data table: takes the number, returns the text shown. |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |

## Example 1 of 3: Latency with percentiles

1,200 API response times. Drag the slider to re-bin: bars morph to the new edges. The dashed lines mark the median, p95 and an SLO of 300 ms; hover, tap or arrow through the bins.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { HistogramTable, Histogram } from "@/components/sheenui/charts/histogram";
import { histogramLegend } from "@/components/sheenui/charts/histogram/model";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, histogramLegend, HistogramTable, Histogram } from "@sheenui/theme";

// Response times in ms (a sample; yours is the full list)
const latencies: number[] = [
  84, 92, 97, 101, 104, 108, 111, 113, 116, 118, 121, 124, 127, 131, 135, 140,
  146, 153, 161, 172, 188, 206, 233, 271, 342, 96, 109, 119, 129, 150,
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="API latency"
      description="Response times, this week"
      legend={histogramLegend({ density: true, labels: { bins: "Requests" } })}
      table={<HistogramTable values={latencies} bins="auto" format={ms} caption="API latency by range" />}
    >
      <Histogram
        values={latencies}
        bins="auto"
        density
        markers={["median", "p95", { value: 300, label: "SLO" }]}
        format={ms}
        xLabel="Response time"
        aria-label="Distribution of API response times"
      />
    </ChartCard>
  );
}
```

## Example 2 of 3: Density plot

bars={false} with density draws the smooth curve alone, on a gradient that fades to the baseline. Two peaks show at a glance: single items and bundles.

```tsx
import { Histogram } from "@/components/sheenui/charts/histogram";
// Package build (after the first npm release, or a packed tarball): import { Histogram } from "@sheenui/theme";

// Basket sizes in $ (a sample; yours is the full list)
const orderValues: number[] = [
  38, 42, 45, 47, 51, 36, 58, 44, 49, 62, 33, 54, 41, 46, 139, 148, 126, 155, 171, 133,
  144, 118, 162, 150, 52, 40, 143, 137, 48, 56,
];
const usd = (n: number) => "$" + Math.round(n);

export function Example() {
  return (
    <Histogram
      values={orderValues}
      bars={false}
      density
      measure="percent"
      markers={["median"]}
      format={usd}
      color={3}
      aria-label="Distribution of order values"
    />
  );
}
```

## Example 3 of 3: Shares, fixed bins

measure="percent" sizes bars by their share of the sample; bins={8} asks for about eight bins; snapped to round $25 edges, that makes ten.

```tsx
import { Histogram } from "@/components/sheenui/charts/histogram";
// Package build (after the first npm release, or a packed tarball): import { Histogram } from "@sheenui/theme";

// Basket sizes in $ (a sample; yours is the full list)
const orderValues: number[] = [
  38, 42, 45, 47, 51, 36, 58, 44, 49, 62, 33, 54, 41, 46, 139, 148, 126, 155, 171, 133,
  144, 118, 162, 150, 52, 40, 143, 137, 48, 56,
];
const usd = (n: number) => "$" + Math.round(n);

export function Example() {
  return (
    <Histogram
      values={orderValues}
      bins={8}
      measure="percent"
      markers={["mean"]}
      format={usd}
      color={7}
      aria-label="Orders by value, in $25 bins"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ← / → or ↓ / ↑ | Previous / next bin (← / → are mirrored in right-to-left). |
| Home / End | Jump to the first / last bin. |
| Escape | Clear the reading. |

## Accessibility

- Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the bin's range, count, share and cumulative share.
- HistogramTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- Reduced motion: the bins appear at their final heights and data changes jump instead of morphing.

## All exports on this page

- Histogram — A distribution in bins: bars that touch (a 2px surface gap between neighbours: the bins are adjacent intervals, not categories).
- HistogramTable — Every bin with its count, share and cumulative share: the colour-free twin of a Histogram.
- defaultHistogramLabels — The built-in English strings of Histogram; spread it into your own labels and change what you need.
- distributionStats — Summary of SORTED values for a box plot.
- histogramBins — Bins SORTED values into equal-width intervals.
- histogramLegend — Legend items for a histogram: the bins, plus the density curve when it is drawn over them.
- kernelDensity — Gaussian kernel density of SORTED values, evaluated at each of at.
- quantileSorted — The p-quantile (0–1) of SORTED values, linearly interpolated (R type 7, Excel PERCENTILE.INC).
- sortedValues — The finite numbers of a list, sorted ascending (a new array; the input is untouched).
- suggestedBinCount — How many bins a rule suggests for SORTED values.


## When to use Histogram

- Use it as a distribution chart for a raw sample, such as every request's latency or order value, with reference lines for the median, mean and p95 or p99.
- Use density for a smooth kernel estimate over the bars, or turn bars off to get a pure density plot when you compare the shape of the sample with a theoretical curve.
- Use measure percent when samples of different sizes sit side by side, so bar height is a share of the sample rather than a count.
- Skip it when you have a few named categories rather than continuous numbers, where a Bar chart is right, or when you compare distributions across groups, where a Box plot fits better.
- Pair it with ChartCard and HistogramTable for a text twin, a Slider to adjust the bin count, and Select to switch which metric is binned.


## Frequently asked questions

### How do I make a histogram in React from raw values?

Pass values as the raw numbers, such as every latency, plus aria-label. Non-finite values are ignored. Bins default to auto, picked by Freedman-Diaconis or Sturges, and niceBins snaps the edges to round numbers so the bin count lands near what you asked for.

### Can I set my own bin count or rule?

bins takes a number or one of auto, sturges, freedman-diaconis or scott. domain limits the range that is binned, and values outside it are left out. New data or a new bin count morphs the bars rather than redrawing them.

### How do I add percentile lines?

markers takes median, mean, p90, p95, p99 or an object with a value and a label. Each draws a reference line on the chart. density overlays a Gaussian kernel density curve, and bandwidth overrides its default, which follows Silverman's rule.

### How do keyboard users read the bins?

Tab focuses the chart, then Left and Right (mirrored in right-to-left) or Down and Up move between bins. Home and End jump to the ends and Escape clears. Each move announces the bin's range, count, share and cumulative share at or below it.


## Related pages

- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
