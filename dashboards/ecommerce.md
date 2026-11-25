Canonical: https://lokendra-builds.github.io/sheenui/dashboards/ecommerce

# Ecommerce Sales Dashboard Template for React

URL: https://lokendra-builds.github.io/sheenui/dashboards/ecommerce
Sidebar name: E-commerce

A glass ecommerce dashboard for React: sales, orders, top products, funnel and regions with a time-range picker and animated KPIs. Free, Tailwind v4.

What it is: An ecommerce sales dashboard template for React with orders, top products, a conversion funnel and a regional map.

Install (with demo data):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-ecommerce.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Dashboards](https://lokendra-builds.github.io/sheenui/dashboards/) > E-commerce

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `blocks/{analytics-ecommerce.tsx, analytics-kit.ts, icons.tsx}`
- `components/button/`
- `components/charts/{bar-list.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, combo-chart.tsx, funnel-chart.tsx, heatmap.tsx, sparkline.tsx, treemap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/segmented/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `components/tabs/`
- `blocks/analytics/{bar-trend-chart.tsx, data.ts, glass.tsx, hooks.tsx, kpi.tsx, labels.ts, panel.tsx, shell.tsx, stacked-trend-chart.tsx, trend-chart.tsx, trend-frame.tsx}`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{beat.ts, gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, no-script-reveal.tsx, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

shadcn CLI (component only):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-ecommerce.json
```

Registry item: analytics-ecommerce. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { EcommerceDashboard } from "@/components/sheenui/blocks/analytics-ecommerce";
import { type AnalyticsRange } from "@/components/sheenui/blocks/analytics/data";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type AnalyticsRange, EcommerceDashboard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| load | AnalyticsLoader<EcommerceData> | required | Loads the data for a range + filters (sync or async). Required: no dashboard falls back to fake data. The demo loaders live in @sheenui/theme/demo-data, which the package root does not export. |
| liveStep | ((prev: EcommerceData, tick: number) => EcommerceData) | optional, no default | Evolves the data on each live tick (omit for no live updates). Return a new object; unchanged parts keep their identity. |
| range | AnalyticsRange | optional, no default | Sets the active range when controlled. Pair with onRangeChange. |
| defaultRange | AnalyticsRange | per dashboard | The range at first when range is not controlled (AnalyticsRange); each dashboard picks its own. |
| onRangeChange | ((range: AnalyticsRange) => void) | optional, no default | Called when the range changes. |
| activeFilters | string[] | optional, no default | Values of the active filter chips (controlled). |
| defaultFilters | string[] | none | The filters on at first when activeFilters is not controlled (string[], default none). |
| onFiltersChange | ((filters: string[]) => void) | optional, no default | Called when the filter chips change. |
| live | boolean | optional, no default | Simulated live updates. The Live toggle pauses them (WCAG 2.2.2). |
| defaultLive | boolean | per dashboard | Whether live updates are on at first when live is not controlled (boolean); each dashboard picks its own. |
| onLiveChange | ((live: boolean) => void) | optional, no default | Called when the Live toggle changes. |
| compare | boolean | optional, no default | Show the previous period (dashed lines, "vs" values). |
| defaultCompare | boolean | per dashboard | Whether the comparison is on at first when compare is not controlled (boolean); each dashboard picks its own. |
| onCompareChange | ((compare: boolean) => void) | optional, no default | Called when the Compare toggle changes. |
| status | AnalyticsStatus | "auto" | Pin a state (docs, tests); "auto" follows the loader. |
| store | string | "Lumen & Co." | Store shown as the title (also names the dashboard landmark). |
| currency | string | "USD" | Sets the ISO 4217 currency of every amount. |
| ranges | readonly AnalyticsRange[] | all five | Ranges offered in the header (readonly AnalyticsRange[], default all five). |
| filters | readonly AnalyticsFilter[] | optional, no default | Sales-channel filter chips. Their values reach load as filters. |
| onExport | ((data: EcommerceData) => void) | a CSV of revenue and orders | Called by Export (default: a CSV of revenue and orders). |
| headingLevel | HeadingLevelOption | 2 | Heading level of the title (1 to 6), or "none" for a paragraph with no heading role (panel titles follow). |
| locale | string | the runtime's | BCP 47 locale for every number and date (string, default the runtime's). |
| labels | Partial<EcommerceLabels> | defaultEcommerceLabels | Every other string, for translation: labels={{ range: "…" }}; omitted keys keep the English of defaultEcommerceLabels. All 49 keys of EcommerceLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## BarTrendChart props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | BarTrendDatum[] | required | Lists the bars, oldest first (BarTrendDatum[], required). |
| seriesLabel | string | required | Name of the bar series (string, required): tooltip and table. |
| lineLabel | string | optional, no default | Name of the line series (omit to hide the line). |
| color | ChartColor | 1 | Sets the palette slot (1–8) used for the bars. |
| lineColor | ChartColor | 2 | Sets the palette slot (1–8) used for the line. |
| compare | boolean | false | Draw the previous period as a dashed, muted line. |
| height | number | 300 | Sets the plot height in pixels (number, default 300). |
| format | ((n: number) => string) | formatCompact | Formats values in the axis and tooltip ((n: number) => string, default compact). |
| locale | string | the runtime's | BCP 47 locale for dates and numbers in announcements (string, default the runtime's). |
| labels | Partial<Pick<AnalyticsLabels, "noData" \| "previousPeriod" \| "changeLabel" \| "chartInstructions" \| "touchHint">> | defaultAnalyticsLabels | Every other string, for translation: labels={{ previousPeriod: "…" }}; omitted keys keep the English of defaultAnalyticsLabels. All 5 keys of AnalyticsLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (string, required). |
| className | string | optional, no default | Adds extra classes to the chart's wrapper (string). |

## EcommerceData

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| points | { label, long?, revenue, orders, previousRevenue? }[] | optional, no default | Revenue and orders per point. |
| kpis / previousKpis | { revenue, orders, aov, conversion } | optional, no default | Takes headline numbers (conversion as a ratio). |
| trends | Record<metric, number[]> | optional, no default | Gives the sparkline values for each KPI, keyed by metric. |
| funnel | { stage: "sessions" \| "productViews" \| "addToCart" \| "checkout" \| "purchase", value }[] | optional, no default | Takes visitors at each checkout step. |
| categories | TreemapNode[] | optional, no default | Takes revenue by category → product type. |
| heatmap | { day, hours: number[24] }[] | optional, no default | Orders by weekday × hour, Monday first. |
| products | BarListItem[] | optional, no default | Lists the top products by revenue. |

## Example 1 of 3: Live demo

Filter by sales channel and the whole store re-shapes (the mobile app sells pricier baskets, social converts less). Bars grow from the baseline in a wave; Compare adds last period's revenue as a dashed line. Hover a bar to read revenue, the moving average and the change; click a category to zoom into it.

```tsx
import { EcommerceDashboard } from "@/components/sheenui/blocks/analytics-ecommerce";
// Package build (after the first npm release, or a packed tarball): import { EcommerceDashboard } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@/components/sheenui/blocks/analytics/demo-ecommerce";
// Package build (after the first npm release, or a packed tarball): import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";

<EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} store="Lumen & Co." currency="USD" />
```

## Example 2 of 3: A live store, controlled

range is controlled here (the buttons above and the header stay in sync), Live and Compare start on, amounts are in pounds for en-GB. Orders land every few seconds: revenue rolls, the current hour grows and the funnel counts up.

```tsx
import { EcommerceDashboard } from "@/components/sheenui/blocks/analytics-ecommerce";
import { type AnalyticsRange } from "@/components/sheenui/blocks/analytics/data";
// Package build (after the first npm release, or a packed tarball): import { EcommerceDashboard, type AnalyticsRange } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@/components/sheenui/blocks/analytics/demo-ecommerce";
// Package build (after the first npm release, or a packed tarball): import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";
import { useState } from "react";

const [range, setRange] = useState<AnalyticsRange>("24h");

<EcommerceDashboard
  load={ecommerceDemoLoader}
  liveStep={ecommerceLiveStep}
  store="Northwind Goods"
  currency="GBP"
  locale="en-GB"
  range={range}
  onRangeChange={setRange}
  ranges={["24h", "7d", "30d"]}
  defaultLive
  defaultCompare
/>
```

## Example 3 of 3: Loading, empty and error states

The frame never disappears: skeletons hold every panel's place on the first load, later loads dim the charts under a scan line, and an empty or failed load says so in words (with Retry when the loader threw). Pin a state with status for docs and tests.

```tsx
import { EcommerceDashboard } from "@/components/sheenui/blocks/analytics-ecommerce";
// Package build (after the first npm release, or a packed tarball): import { EcommerceDashboard } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@/components/sheenui/blocks/analytics/demo-ecommerce";
// Package build (after the first npm release, or a packed tarball): import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";

<EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} store="Lumen & Co." status="loading" defaultLive={false} />
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift+Tab | Move through the header controls, the KPIs, each chart and its Chart / Table switch. |
| ← / → | Move the time range (Segmented control), the KPI tabs, the Chart / Table switch, or the point being read in a chart. |
| Home / End | First / last KPI tab, or first / last point of a chart. |
| Enter / Space | Toggle Live, Compare or a filter chip; press Export; sort a table column. |
| Esc | Stop reading a chart (hides the crosshair and tooltip). |
| Enter (treemap) | Zoom into a category; the breadcrumb zooms back out. |

## Accessibility

- The revenue chart keeps bars and the line on one axis (they share a unit); the legend names both and the Table view lists revenue and the line per period.
- The funnel reads each stage with its share of the first and of the previous stage, and how many dropped off between them.
- The heatmap is a keyboard grid with a sequential, single-hue scale and a legend; every cell reads its weekday, hour and number of orders. On phones it scrolls inside its own panel.
- Reduced motion: no grow-from-baseline, no tile glides, no pulses.

## Data

load is required: EcommerceDashboard never invents numbers. Return your own data (or a promise of it) from load. For demos and prototypes use the sample loader and live step from the separate @sheenui/theme/demo-data module:

```tsx
import { EcommerceDashboard } from "@sheenui/theme";
import { ecommerceDemoLoader, ecommerceLiveStep } from "@sheenui/theme/demo-data";

<EcommerceDashboard load={ecommerceDemoLoader} liveStep={ecommerceLiveStep} />
```

With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the “with demo data” command at the top of this page): npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-ecommerce.json. The “component only” command under Files to copy leaves the sample data out, which is what a production build wants.


## Performance

- Charts below the fold mount when they come within 320px of the viewport; their frame is reserved first, so nothing shifts.
- New data lands in a React transition, one panel per frame: visible panels ripple in order, panels off-screen catch up in idle time or when you scroll to them.
- Controls answer instantly (optimistic state) while the dashboard re-renders in the background, so a click never blocks the next frame.
- Loading dims the panels through a data attribute (CSS only): starting or finishing a load re-renders no chart.
- Glass budget: the header, the KPI strip and at most two panels per row blur what's behind them; controls inside the header don't add their own blur. Phones get a lighter blur.
- Live updates, the realtime stream and every pulse stop while the dashboard is off-screen or the tab is hidden. Only transform and opacity animate.


## All exports on this page

- BarTrendChart — Bars (≤ 24px, rounded data-end, 2px gaps) with a line on the same axis and the previous period dashed.
- EcommerceDashboard — Props (see EcommerceDashboardProps): store ("Lumen & Co."), currency ("USD"), ranges, filters (sales-channel chips), onExport.
- defaultEcommerceLabels — The English EcommerceLabels used when labels is omitted; a partial labels prop is merged over them.


## When to use the e-commerce dashboard

- Use it as a sales dashboard template for a store admin home screen that shows revenue, orders, average order value and conversion rate for a chosen period with rolling numbers and deltas.
- Use it for a weekly sales review where revenue bars sit beside the previous period or a moving average, with a checkout funnel from sessions to purchase and a category treemap.
- Use the filters prop for sales channels like store, marketplace, app and social, then return the matching channel data from load.
- Skip it when you sell subscriptions, where SaasRevenueDashboard handles MRR and churn, or when you only need a single tile; the stat cards block fits better for one headline number.
- Pair it with Treemap, Heatmap and FunnelChart when you build custom panels, plus Badge and Button for order status and actions around the dashboard.


## Frequently asked questions

### How do I build an ecommerce dashboard in React with this block?

Render EcommerceDashboard with load returning EcommerceData: points with revenue and orders, kpis, trends, funnel, categories, an hour-by-weekday heatmap and top products. store sets the title, currency the ISO code, and defaultRange the first range.

### What does Compare do on the revenue chart?

With Compare on, last period's revenue is drawn as a dashed line on the same axis as the bars, and KPIs show previous values. With it off, the line is a moving average. Points can carry previousRevenue for that comparison.

### How do I handle live orders and exports?

Pass liveStep to evolve the data on each tick; the Live toggle pauses it, and updates stop off screen and in hidden tabs. Export downloads a CSV of revenue and orders unless you pass onExport. range can be controlled with onRangeChange.

### Is every chart readable without a mouse or color?

Most panels switch between the chart and a data table. Each chart is one tab stop whose arrow keys read its points, and the treemap has a breadcrumb for zoom levels. Reduced motion removes draw-in and rolling digits, and reduced transparency makes the glass solid.


## Related pages

- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product)
- [Crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard)
- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics)
- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas)

5 dashboards pages in all: browse them on [All dashboards](https://lokendra-builds.github.io/sheenui/dashboards/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
