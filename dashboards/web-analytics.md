Canonical: https://lokendra-builds.github.io/sheenui/dashboards/web-analytics

# Web Analytics Dashboard Template for React

URL: https://lokendra-builds.github.io/sheenui/dashboards/web-analytics
Sidebar name: Web analytics

A glass web analytics dashboard template for React: visitors, sources, pages and countries with a time-range picker, rolling KPIs and a live mode. MIT.

What it is: A web analytics dashboard template for React in the style of Plausible and Vercel Analytics, built from SheenUI charts. Use it as a Plausible style dashboard for a traffic screen in a SaaS app, with visitors, pageviews, bounce rate and visit duration in a KPI strip.

Install (with demo data):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-web.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Dashboards](https://lokendra-builds.github.io/sheenui/dashboards/) > Web analytics

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `blocks/{analytics-web.tsx, analytics-kit.ts, icons.tsx}`
- `components/button/`
- `components/charts/{bar-list.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, donut-chart.tsx, geo-map.tsx, heatmap.tsx, pie-chart.tsx, sparkline.tsx, streamgraph.tsx, streaming-chart.tsx}`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/geo-map/`
- `components/charts/geo/`
- `components/charts/heatmap/`
- `components/charts/streamgraph/`
- `components/charts/streaming-chart/`
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
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-web.json
```

Registry item: analytics-web. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { WebAnalyticsDashboard, type WebAnalyticsData } from "@/components/sheenui/blocks/analytics-web";
import { type AnalyticsLoader } from "@/components/sheenui/blocks/analytics/data";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type AnalyticsLoader, WebAnalyticsDashboard, type WebAnalyticsData } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| load | AnalyticsLoader<WebAnalyticsData> | required | Loads the data for a range + filters (sync or async). Required: no dashboard falls back to fake data. The demo loaders live in @sheenui/theme/demo-data, which the package root does not export. |
| liveStep | ((prev: WebAnalyticsData, tick: number) => WebAnalyticsData) | optional, no default | Evolves the data on each live tick (omit for no live updates). Return a new object; unchanged parts keep their identity. |
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
| site | string | "example.com" | Site shown as the title (string, default "example.com"). |
| ranges | readonly AnalyticsRange[] | all five | Ranges offered in the header (readonly AnalyticsRange[], default all five). |
| filters | readonly AnalyticsFilter[] | the five web channels | Channel filter chips. Their values reach load as filters. |
| metric | WebMetric | optional, no default | Metric shown by the trend chart (the selected KPI tab). |
| defaultMetric | WebMetric | "visitors" | The metric shown first when metric is not controlled (WebMetric, default "visitors"). |
| onMetricChange | ((metric: WebMetric) => void) | optional, no default | Called when another KPI tab is picked. |
| onExport | ((data: WebAnalyticsData) => void) | downloads a CSV of the time series | Called by Export (default: downloads a CSV of the time series). |
| headingLevel | HeadingLevelOption | 2 | Heading level of the title (1 to 6), or "none" for a paragraph with no heading role (panel titles follow). |
| now | Date | the current time | Where the realtime chart's history starts (Date, default: the current time). On a prerendered page pass a fixed date, so the server's and the browser's first render print the same axis. |
| locale | string | the runtime's | BCP 47 locale for every number and date (string, default the runtime's). |
| labels | Partial<WebAnalyticsLabels> | defaultWebAnalyticsLabels | Every other string, for translation: labels={{ range: "…" }}; omitted keys keep the English of defaultWebAnalyticsLabels. All 53 keys of WebAnalyticsLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## WebAnalyticsData

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| points | { label, long?, current, previous? }[] | optional, no default | One row per hour / day / month; current and previous hold visitors, pageviews, bounceRate (0–1) and duration (seconds). |
| totals / previousTotals | Record<WebMetric, number> | optional, no default | Headline numbers for the range (rates and durations are averages). |
| pages / referrers / browsers | { name, value, href?, icon? }[] | optional, no default | Each one is a bar list of BarListItem rows. |
| countries | { id, value }[] | optional, no default | Visitors by ISO 3166-1 code (alpha-2, alpha-3 or numeric). |
| devices | { device: "desktop" \| "mobile" \| "tablet", value }[] | optional, no default | Fills the donut chart with one value per device type. |
| realtime | { visitors, pages } | optional, no default | Visitors on the site right now and the pages they're on. |

## AnalyticsShell props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | The dashboard's title (ReactNode, required), rendered as the heading headingLevel. |
| subtitle | ReactNode | optional, no default | Shows a line under the title (ReactNode). |
| icon | ReactNode | optional, no default | A small mark before the title. |
| status | ReactNode | optional, no default | Shown beside the title (e.g. a live visitors pill). |
| headingId | string | required | The id of the title heading (string, required): the section is aria-labelledby it. |
| headingLevel | HeadingLevelOption | 2 | Heading level of the dashboard title (1 to 6), to fit the page outline, or "none" for a paragraph with no heading role (panel titles follow). |
| range | AnalyticsRange | required | Sets the selected range (AnalyticsRange, required). |
| onRangeChange | (range: AnalyticsRange) => void | required | Called when another range is picked (required). |
| ranges | readonly AnalyticsRange[] | ANALYTICS_RANGES | The ranges offered (readonly AnalyticsRange[], default all five: 24h, 7d, 30d, 90d, 12m). |
| filters | readonly AnalyticsFilter[] | optional, no default | Filter chips shown next to the range control; none when omitted or empty. |
| activeFilters | readonly string[] | required | The values of the chips that are on (required). |
| onFiltersChange | (filters: string[]) => void | required | Called with the new list of active chip values (required). |
| live | boolean | required | Whether live updates run (required); the Live toggle must stay (WCAG 2.2.2). |
| onLiveChange | (live: boolean) => void | required | Called when the Live toggle is pressed (required). |
| compare | boolean | required | Whether the previous period is drawn (required). |
| onCompareChange | (compare: boolean) => void | required | Called when the Compare toggle is pressed (required). |
| onExport | (() => void) | optional, no default | Called by the Export button. Omit to hide it. |
| exportDisabled | boolean | false | Keep Export disabled (boolean, default false), e.g. until the first data arrives: the button is always there, so the toolbar never shifts. |
| loading | boolean | false | New data is on its way (boolean, default false): panels dim and scan, aria-busy is set, and "Loading" / "Updated" are announced once each. |
| glass | AnalyticsGlass | "auto" | Glass on the panels: "auto" (default) keeps real glass while the device keeps up and falls back to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one. |
| backdrop | boolean | true | Draws a soft colour light behind the dashboard. |
| labels | AnalyticsLabels | defaultAnalyticsLabels | Every string of the shell and its panels (AnalyticsLabels, required): start from defaultAnalyticsLabels. Spread defaultAnalyticsLabels and override single keys, e.g. labels={{ ...defaultAnalyticsLabels, range: "…" }}. All 29 keys of AnalyticsLabels are listed in the key table under the props table. |
| children | ReactNode | required | The dashboard body, usually an AnalyticsGrid of AnalyticsPanels. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## AnalyticsState props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| kind | "error" \| "empty" | required | "empty" when the query returned nothing, "error" when loading failed (it then offers Retry). |
| labels | AnalyticsLabels | defaultAnalyticsLabels | The dashboard's strings (the state's title, description and Retry label). Spread defaultAnalyticsLabels and override single keys, e.g. labels={{ ...defaultAnalyticsLabels, range: "…" }}. All 29 keys of AnalyticsLabels are listed in the key table under the props table. |
| onRetry | (() => void) | optional, no default | Called by the Retry button of the error state. Without it no Retry button shows. |

## LiveDot props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| on | boolean | required | Whether the dot pulses: true while live updates are running. |

## PanelSkeleton props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| height | number | required | Height of the placeholder in px, matching the panel body it stands in for. |
| pulse | boolean | true | Sweep a light band across the placeholder while it is on screen. |

## TrendTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | TrendDatum[] | required | The time series to list: one object per point, with the current and optional previous value of each series. |
| seriesLabel | string | required | Header of the value column, for example "Visitors". |
| compare | boolean | optional, no default | Add a previous-period column and a change column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table. |
| indexLabel | string | required | Header of the first column, for example "Day". |
| locale | string | the runtime's locale | BCP 47 locale for dates and numbers; defaults to the runtime's locale. |
| labels | Partial<Pick<AnalyticsLabels, "noData" \| "previousPeriod" \| "changeLabel">> | defaultAnalyticsLabels | Every other string, for translation: labels={{ previousPeriod: "…" }}; omitted keys keep the English of defaultAnalyticsLabels. All 3 keys of AnalyticsLabels are listed in the key table under the props table. |
| caption | string | optional, no default | Visually hidden caption that names the table and its scroll region. |

## useAnalyticsDashboard(props, options)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| options.load | AnalyticsLoader<T> | optional, no default | The loader to use when the props have none. |
| options.liveStep | (prev: T, tick: number) => T | optional, no default | Applies one simulated live update (omit for no live mode). |
| options.defaults | { range, live, compare } | optional, no default | Sets the starting state when uncontrolled. |
| options.isEmpty | (data: T) => boolean | optional, no default | When to show the empty state. |
| returns | { data, query, status, ready, busy, range, setRange, filters, setFilters, live, setLive, compare, setCompare, running, retry, rootRef } | optional, no default | Everything a template wires into AnalyticsShell and its panels; attach rootRef to the root (live updates pause when it's off-screen). |

## AnalyticsPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | string | required | The panel's heading (string, required); it also names the chart / table views. |
| description | ReactNode | optional, no default | A line under the title (ReactNode): what is shown, its unit. |
| aside | ReactNode | optional, no default | Top right, before the Chart / Table switch (a headline number, a small control). |
| legend | PanelLegendItem[] | optional, no default | Legend under the header (two or more series only). kind: "dashed" keys a dashed line. |
| table | ReactNode | optional, no default | The table view of the chart. When given, the panel gets a Chart / Table switch. |
| span | PanelSpan | one column everywhere | Columns the panel spans (PanelSpan, default one column everywhere): md in the 2-column layout, lg in the 4-column one. |
| minHeight | number | required | Height reserved for the body before its chart mounts, so nothing shifts. |
| ready | boolean | required | Data is present. While false the body is a skeleton. |
| index | number | optional, no default | Entrance order (staggered, at most 400 ms across the dashboard). |
| count | number | optional, no default | How many panels share the entrance (for the stagger budget). |
| id | string | optional, no default | id of the panel's root (e.g. for aria-controls). |
| deps | readonly unknown[] | optional, no default | What the chart depends on. With it, the chart re-renders only when one of these changes (not when the panel turns busy), and a change lands one frame after the panel before it: new data ripples across the dashboard instead of landing in one long task. |
| labels | Pick<AnalyticsLabels, "table" \| "chart" \| "viewAs"> | defaultAnalyticsLabels | Strings of the Chart / Table switch (Pick<AnalyticsLabels, "chart" \| "table" \| "viewAs">, required). Spread defaultAnalyticsLabels and override single keys, e.g. labels={{ ...defaultAnalyticsLabels, chart: "…" }}. All 3 keys of AnalyticsLabels are listed in the key table under the props table. |
| children | ReactNode \| (() => ReactNode) | required | The chart. A function is only called once the panel is near the viewport. |
| className | string | optional, no default | Adds extra classes to the glass card (string). |
| bodyClassName | string | optional, no default | Classes for the body under the header (string). |

## KpiStrip

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | KpiItem[] \| null | required | Shows skeleton cells while null (no data yet). |
| compare | boolean | false | Show the previous value under each number. |
| selected | string | optional, no default | Turns the strip into tabs that pick what controls (a chart panel) shows. |
| onSelect | ((id: string) => void) | optional, no default | Called with the chosen KPI's id when the strip works as tabs (together with selected). |
| controls | string | optional, no default | Sets the id of the element the tabs control. |
| locale | string | the runtime's | BCP 47 locale for the figures (string, default the runtime's). |
| loading | boolean | false | No data yet: skeleton cells (same as items: null). |
| busy | boolean | false | New data on its way: the figures dim. (Inside an AnalyticsShell its loading does this already.) |
| labels | Pick<AnalyticsLabels, "change" \| "noChange" \| "vsPrevious" \| "kpis"> | defaultAnalyticsLabels | Spread defaultAnalyticsLabels and override single keys, e.g. labels={{ ...defaultAnalyticsLabels, change: "…" }}. All 4 keys of AnalyticsLabels are listed in the key table under the props table. |
| aria-label | string | labels.kpis | Sets the accessible name of the KPI strip. |
| className | string | optional, no default | Adds extra classes to the strip (string). |
| cellClassName | string | optional, no default | Extra classes for every cell, skeleton or loaded. Give them a min-h-[…] per container width (@lg:min-h-[…]) equal to the loaded row height so the strip keeps its size when the figures arrive. |

## TrendChart · StackedTrendChart · BarTrendChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | TrendDatum[] | required | The points, oldest first (TrendDatum[], required). |
| seriesLabel | string | required | Sets the name of the series (tooltip, table). |
| color | ChartColor | 1 | Palette slot (1–8) of the series line and its area. |
| compare | boolean | false | Draw the previous period as a dashed, muted line. |
| live | boolean | false | Pulse the latest point (live data). |
| height | number | 280 | Sets the plot height in pixels (number, default 280). |
| format | ((n: number) => string) | formatCompact | Formats values in the axis and tooltip ((n: number) => string, default compact: 12.8K). |
| locale | string | the runtime's | BCP 47 locale for dates and numbers in announcements (string, default the runtime's). |
| labels | Partial<Pick<AnalyticsLabels, "noData" \| "previousPeriod" \| "changeLabel" \| "chartInstructions" \| "touchHint">> | defaultAnalyticsLabels | Every other string, for translation: labels={{ previousPeriod: "…" }}; omitted keys keep the English of defaultAnalyticsLabels. All 5 keys of AnalyticsLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (string, required). |
| className | string | optional, no default | Adds extra classes to the chart's wrapper (string). |
| series | StackedTrendSeries[] | required | Bands from the bottom of the stack up, each with a fixed colour slot. |
| lineLabel | string | optional, no default | Name of the line series (omit to hide the line). |
| lineColor | ChartColor | 2 | Sets the palette slot (1–8) used for the line. |

## Example 1 of 3: Live demo

Switch the range, toggle channels, pick a KPI: charts tween to the new data one after another while the frame stays put. Live is on: the online count rolls, the current day grows and the latest point pulses. Hover or arrow through the trend to read any day against the previous period.

```tsx
import { WebAnalyticsDashboard } from "@/components/sheenui/blocks/analytics-web";
// Package build (after the first npm release, or a packed tarball): import { WebAnalyticsDashboard } from "@sheenui/theme";
import { webAnalyticsDemoLoader, webLiveStep } from "@/components/sheenui/blocks/analytics/demo-web";
// Package build (after the first npm release, or a packed tarball): import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";

export function Analytics() {
  return <WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} site="example.com" />;
}
```

## Example 2 of 3: Your data, your language

load() receives the range, the active filters and an abort signal; return the data (or a promise). This preview stands in for an API with a 900 ms delay, formats everything for de-DE and translates the labels.

```tsx
import { WebAnalyticsDashboard, type WebAnalyticsData } from "@/components/sheenui/blocks/analytics-web";
import { type AnalyticsLoader } from "@/components/sheenui/blocks/analytics/data";
// Package build (after the first npm release, or a packed tarball): import { WebAnalyticsDashboard, type AnalyticsLoader, type WebAnalyticsData } from "@sheenui/theme";

const load: AnalyticsLoader<WebAnalyticsData> = async ({ range, filters }, signal) => {
  const res = await fetch(`/api/analytics?range=${range}&channels=${filters.join(",")}`, { signal });
  if (!res.ok) throw new Error("Analytics API failed"); // shows the error state with Retry
  return res.json();
};

<WebAnalyticsDashboard
  site="docs.example.com"
  load={load}
  locale="de-DE"
  defaultRange="7d"
  defaultMetric="pageviews"
  defaultLive={false}
  labels={{
    metrics: { visitors: "Besucher", pageviews: "Seitenaufrufe", bounceRate: "Absprungrate", duration: "Besuchsdauer" },
    rangeNames: { "24h": "Letzte 24 Stunden", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "90d": "Letzte 90 Tage", "12m": "Letzte 12 Monate" },
    // … every string is in WebAnalyticsLabels
  }}
/>
```

## Example 3 of 3: Loading, empty and error states

The frame never disappears: skeletons hold every panel's place on the first load, later loads dim the charts under a scan line, and an empty or failed load says so in words (with Retry when the loader threw). Pin a state with status for docs and tests.

```tsx
import { WebAnalyticsDashboard } from "@/components/sheenui/blocks/analytics-web";
// Package build (after the first npm release, or a packed tarball): import { WebAnalyticsDashboard } from "@sheenui/theme";
import { webAnalyticsDemoLoader, webLiveStep } from "@/components/sheenui/blocks/analytics/demo-web";
// Package build (after the first npm release, or a packed tarball): import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";

<WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} site="staging.example.com" status="loading" defaultLive={false} />
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift+Tab | Move through the header controls, the KPIs, each chart and its Chart / Table switch. |
| ← / → | Move the time range (Segmented control), the KPI tabs, the Chart / Table switch, or the point being read in a chart. |
| Home / End | First / last KPI tab, or first / last point of a chart. |
| Enter / Space | Toggle Live, Compare or a filter chip; press Export; sort a table column. |
| Esc | Stop reading a chart (hides the crosshair and tooltip). |

## Accessibility

- The dashboard is a labeled region (its title); panels are sections named by their headings; loading sets aria-busy and is announced once (“Loading new data…”, then “Dashboard updated”), never on every live tick.
- The KPI strip is a real tablist that controls the trend panel: “Unique visitors, tab, selected, 1 of 4”. Each delta reads in words (“Up 12.3% vs previous period”), with an arrow and a sign, so color is never the only signal.
- Rolling numbers are visual only: screen readers get the final value once. The online pill doesn't announce every change.
- Every chart has a Table view with the same numbers; charts are focusable and read point by point with the arrow keys (announced politely).
- Live and Compare are toggle buttons (aria-pressed) with descriptions; filter chips show a ✓ and are underlined in forced colors when pressed.
- Reduced motion: no draw-ins, glides, pulses or scans; numbers and charts jump to their values, fades stay short.

## Data

load is required: WebAnalyticsDashboard never invents numbers. Return your own data (or a promise of it) from load. For demos and prototypes use the sample loader and live step from the separate @sheenui/theme/demo-data module:

```tsx
import { WebAnalyticsDashboard } from "@sheenui/theme";
import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";

<WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} />
```

With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the “with demo data” command at the top of this page): npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-web.json. The “component only” command under Files to copy leaves the sample data out, which is what a production build wants.


## Build your own dashboard

The templates are made from analytics-kit.tsx: copy one template and swap its panels, or compose a new one from the same parts.

### useAnalyticsDashboard(props, options)

### AnalyticsPanel

### KpiStrip

### TrendChart · StackedTrendChart · BarTrendChart


## Performance

- Charts below the fold mount when they come within 320px of the viewport; their frame is reserved first, so nothing shifts.
- New data lands in a React transition, one panel per frame: visible panels ripple in order, panels off-screen catch up in idle time or when you scroll to them.
- Controls answer instantly (optimistic state) while the dashboard re-renders in the background, so a click never blocks the next frame.
- Loading dims the panels through a data attribute (CSS only): starting or finishing a load re-renders no chart.
- Glass budget: the header, the KPI strip and at most two panels per row blur what's behind them; controls inside the header don't add their own blur. Phones get a lighter blur.
- Live updates, the realtime stream and every pulse stop while the dashboard is off-screen or the tab is hidden. Only transform and opacity animate.


## All exports on this page

- AnalyticsGrid — 1 column below 42rem of container width, 2 up to 64rem, then 4.
- AnalyticsPanel — A glass card for one chart.
- AnalyticsShell — The frame of a dashboard: a container-query root (the grid adapts to the space it gets, not to the window) with a glass header.
- AnalyticsState — Whole-dashboard state under the header: no data, or the loader failed (with Retry).
- DashboardBackdrop — Soft, static colour light behind a dashboard so its glass always has something to refract.
- KpiStrip — One glass strip, four cells (2×2 on phones), hairlines between them.
- LiveDot — The live indicator: a ring that pings while live (paused off-screen and in hidden tabs).
- PanelSkeleton — Placeholder body: faint bars where the chart will be (opacity pulse only; still under reduced motion).
- StackedTrendChart — Stacked areas (e.g.
- TrendChart — The hero chart of a dashboard: gradient area, 2px line, dashed previous period.
- TrendTable — Table view of a TrendChart.
- WebAnalyticsDashboard — Props (see WebAnalyticsDashboardProps): site ("example.com"), ranges, filters (the five web channels).
- defaultAnalyticsLabels — The English AnalyticsLabels every dashboard starts from; spread it and override the strings you translate.
- defaultStackedTrendChartLabels — The English strings of StackedTrendChart; spread it into your own labels and change what you need.
- defaultWebAnalyticsLabels — The English WebAnalyticsLabels used when labels is omitted; a partial labels prop is merged over them.
- trendLegend — Legend items for a trend chart (series + dashed previous period when comparing).
- useAdaptiveGlass — Glass budget for a whole dashboard.
- useAnalyticsDashboard — Wires a dashboard: controllable range / filters / live / compare, the loader.


## When to use the web analytics dashboard

- Use it for the traffic or site-stats screen of a SaaS app, where a strip of KPI tiles (visitors, pageviews, bounce rate, visit duration) sits above the charts that explain them.
- Use it for a client-facing site report where the trend chart shows the previous period dashed, a realtime panel streams the current visitors and active pages, while top pages, referrers, devices and a country map sit below.
- Connect it to your own API through load, which receives the range, the active filters and an abort signal, then set locale and labels to translate every number and string.
- Skip it when you need funnels and retention, or revenue figures: ProductDashboard covers user journeys and cohorts, and SaasRevenueDashboard handles MRR and churn, so pick the block that matches your data.
- Pair it with SegmentedControl for your own filters beside it, Switch for toggles in surrounding settings, and useAnalyticsDashboard if you build a custom dashboard from the same kit.


## Frequently asked questions

### How do I use this web analytics dashboard template with my own data?

Pass load to WebAnalyticsDashboard. It receives the range, the active filters and an abort signal, and returns a WebAnalyticsData object, synchronously or as a promise: points, totals, pages, referrers, countries, devices, browsers and realtime. There is no fake data fallback; demo loaders live in the demo-data export.

### What props control the header, filters and live mode?

site sets the title, ranges and filters set the range options and channel chips, and range, defaultRange and onRangeChange control the time range. Live and Compare use live, compare and their defaults and callbacks. liveStep evolves data each tick, and onExport replaces the CSV download.

### Is the dashboard accessible to keyboard and screen reader users?

It is a labeled region, and a polite live region announces loading and updates, but never live ticks. Charts are single tab stops read with arrow keys, and the main charts have a table view behind a Chart and Table switch. Change badges carry arrows and signed numbers, not color alone.

### How does it behave while loading, on errors and with reduced motion?

The frame stays while skeletons hold each panel on first load, later loads keep the old data on screen, dimmed under a thin scan line, and empty or failed loads say so in words, with Retry when the loader threw. Reduced motion removes rolling digits, draw-in and panel rise.


## Related pages

- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Dashboard stats](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats)
- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas)
- [E-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce)
- [Product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product)
- [Crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard)

### Guides that cover it

- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)
- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)

5 dashboards pages in all: browse them on [All dashboards](https://lokendra-builds.github.io/sheenui/dashboards/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
