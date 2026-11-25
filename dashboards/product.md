Canonical: https://lokendra-builds.github.io/sheenui/dashboards/product

# Product Analytics Dashboard for React

URL: https://lokendra-builds.github.io/sheenui/dashboards/product
Sidebar name: Product analytics

A glass product analytics dashboard for React: funnels, retention cohorts and Sankey user flows with synced crosshairs and filters. Tailwind CSS v4, MIT.

What it is: A product analytics dashboard for React with funnels, retention cohorts and Sankey user flows. Use it as a funnel and retention dashboard for a product analytics screen that tracks daily, weekly and monthly active users and stickiness (DAU divided by MAU) for web, iOS and Android.

Install (with demo data):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-product.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Dashboards](https://lokendra-builds.github.io/sheenui/dashboards/) > Product analytics

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `blocks/{analytics-product.tsx, analytics-kit.ts, icons.tsx}`
- `components/button/`
- `components/charts/{bar-list.tsx, calendar-heatmap.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, cohort-chart.tsx, flow-utils.tsx, funnel-chart.tsx, heatmap.tsx, sankey-chart.tsx, sparkline.tsx}`
- `components/charts/chart-parts/`
- `components/charts/cohort-chart/`
- `components/charts/heatmap/`
- `components/charts/sankey-chart/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/segmented/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `components/tabs/`
- `blocks/analytics/{bar-trend-chart.tsx, data.ts, glass.tsx, hooks.tsx, kpi.tsx, labels.ts, panel.tsx, shell.tsx, stacked-trend-chart.tsx, trend-chart.tsx, trend-frame.tsx}`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-resolved-scheme.ts}`
- `motion/{beat.ts, gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, no-script-reveal.tsx, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

shadcn CLI (component only):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-product.json
```

Registry item: analytics-product. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ProductDashboard, type ProductQuery } from "@/components/sheenui/blocks/analytics-product";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ProductDashboard, type ProductQuery } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| load | (query: ProductQuery, signal: AbortSignal) => ProductData \| Promise<ProductData> | required | Loads the data for a query: return it, or a promise of it. Required: there is no built-in demo data (see @sheenui/theme/demo-data). |
| status | AnalyticsStatus | "auto" | Force a state for demos and tests: "loading", "empty" or "error". "auto" (default) follows the data. |
| liveStep | ((data: ProductData, tick: number) => ProductData) \| null | null | Evolves the data while Live is on. |
| liveInterval | number | 2000 | Milliseconds between live updates. |
| range | AnalyticsRange | optional, no default | Sets the active range when controlled. |
| defaultRange | AnalyticsRange | "30d" | The range at first when range is not controlled (AnalyticsRange, default "30d"). |
| onRangeChange | ((range: AnalyticsRange) => void) | optional, no default | Called when the range changes. |
| platforms | ProductPlatform[] | optional, no default | The platform chips that are on (controlled); none selected means all platforms. |
| defaultPlatforms | ProductPlatform[] | [] | The platforms on at first when platforms is not controlled (default none, i.e. all). |
| onPlatformsChange | ((platforms: ProductPlatform[]) => void) | optional, no default | Called when the platform chips change. |
| live | boolean | optional, no default | Whether live updates run (controlled). |
| defaultLive | boolean | true | Whether live updates are on at first (boolean, default true). |
| onLiveChange | ((live: boolean) => void) | optional, no default | Called when the Live toggle changes. |
| compare | boolean | optional, no default | Whether the previous period is shown (controlled). |
| defaultCompare | boolean | false | Whether the comparison is on at first (boolean, default false). |
| onCompareChange | ((compare: boolean) => void) | optional, no default | Called when the Compare toggle changes. |
| onExport | ((data: ProductData, query: ProductQuery) => void) | downloads the figures as CSV | Called by the Export button. |
| now | Date | the current date | "Now" for the date axes. On a prerendered page pass a fixed date, so the server's and the browser's first render print the same axes. |
| locale | string | the runtime's | BCP 47 locale for every number and date (string, default the runtime's). |
| headingLevel | HeadingLevelOption | 2 | Heading level of the title (1 to 6, default 2), or "none" for a paragraph with no heading role (panel titles follow). |
| glass | AnalyticsGlass | "auto" | Glass on the cards: "auto" (default) keeps real glass while the device keeps up and falls back to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one. |
| labels | Partial<ProductLabels> | defaultProductLabels | Every other string, for translation: labels={{ range: "…" }}; omitted keys keep the English of defaultProductLabels. All 64 keys of ProductLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## Data: ProductData

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| dau / wau / mau | { value: number; previous: number; trend: number[] } | optional, no default | Active users now, in the previous period and along the range (oldest first). Stickiness is DAU ÷ MAU. |
| flow | { nodes: SankeyNode[]; links: SankeyLink[] } | optional, no default | The user journey for the sankey (sources → sign-up → onboarding → outcome). |
| funnel / funnelPrevious | FunnelStage[] | optional, no default | Activation funnel stages for this and the previous period. |
| adoption | BarListItem[] | optional, no default | Sets the share of active users (0–100) per feature. |
| cohorts / cohortUnit | CohortRow[] / "week" \| "month" | optional, no default | Retention cohorts as user counts per period. |
| events / eventsStart / eventsEnd | CalendarDatum[] / ISO dates | optional, no default | Events per day for the calendar heatmap and the days it shows. |
| eventsPerMinute | number | optional, no default | Shown beside the Live pill. |

## Dashboard kit (analytics-kit.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| AnalyticsShell | component | optional, no default | The frame: a container-query root with the glass header (title, status pill, time-range control, filter chips, Live and Compare toggles, Export), loading announcements and the adaptive glass budget. |
| AnalyticsGrid | component | optional, no default | Container-query grid: 1 column under 42rem, 2 up to 64rem, 4 above. Give each panel a span so rows always fill. |
| AnalyticsPanel | component | optional, no default | Glass panel: header, Chart / Table tabs, a body that mounts near the viewport, a skeleton until ready and a dim veil (not a flash) while new data loads. |
| AnalyticsState | component | optional, no default | The empty and error states (with Retry), at the panel heading level. |
| KpiStrip | component | optional, no default | KPI cells in one glass strip: rolling numbers, change badges with arrows, sparklines and previous-period figures. With onSelect it is a tablist that drives a chart. |
| RollingNumber / DeltaBadge | component | optional, no default | An odometer number (one CSS transform per digit) and an up / down badge with an arrow and a signed number (color is never the only signal). |
| useDashboardData(load, query, key) | hook | optional, no default | Loads data (sync or a promise), keeps the old data on screen while the next arrives, drops stale responses, retries, and updates in place for live mode. |
| useLiveTicker(enabled, onTick, { ref, interval }) | hook | optional, no default | An interval that only runs while ref is on screen and the tab is visible. |
| useCascade(value, index) | hook | optional, no default | Hands new data to panel number index a beat after the previous one: a visible cascade, and no single long render task. |
| useAdaptiveGlass(ref, mode) | hook | optional, no default | The glass budget behind the glass prop: flat panels on weak devices, with lite glass, or once frames drop. |

## Example 1 of 3: Live dashboard

Switch the range or tap a platform chip: old data stays under a soft veil, then every card tweens to the new numbers, one after another. Live mode drifts the figures every two seconds with rolling digits (it pauses when scrolled away).

```tsx
import { ProductDashboard } from "@/components/sheenui/blocks/analytics-product";
// Package build (after the first npm release, or a packed tarball): import { ProductDashboard } from "@sheenui/theme";
import { productDemoLoader, productLiveStep } from "@/components/sheenui/blocks/analytics/demo-product";
// Package build (after the first npm release, or a packed tarball): import { productDemoLoader, productLiveStep } from "@sheenui/theme/demo-data";

// Demo data out of the box. Plug in your own loader with `load`.
export function Analytics() {
  return <ProductDashboard load={productDemoLoader} liveStep={productLiveStep} />;
}
```

## Example 2 of 3: Compare with the previous period

Pre-set the range, filters and Compare. Every KPI shows its previous value, the funnel shows the change in conversion.

```tsx
import { ProductDashboard } from "@/components/sheenui/blocks/analytics-product";
// Package build (after the first npm release, or a packed tarball): import { ProductDashboard } from "@sheenui/theme";
import { productDemoLoader, productLiveStep } from "@/components/sheenui/blocks/analytics/demo-product";
// Package build (after the first npm release, or a packed tarball): import { productDemoLoader, productLiveStep } from "@sheenui/theme/demo-data";

<ProductDashboard
  load={productDemoLoader}
  liveStep={productLiveStep}
  defaultRange="90d"
  defaultPlatforms={["ios", "android"]}
  defaultCompare
  defaultLive={false}
  labels={{ title: "Mobile engagement", description: "iOS and Android, against the 90 days before." }}
/>
```

## Example 3 of 3: Loading, empty and error states

Bring your own data with `load`. Try a slow network (skeletons, then the veil on later changes), an empty account and a failed request.

```tsx
import { ProductDashboard, type ProductQuery } from "@/components/sheenui/blocks/analytics-product";
// Package build (after the first npm release, or a packed tarball): import { ProductDashboard, type ProductQuery } from "@sheenui/theme";

// `load` receives { range, platforms, now, locale } and returns the data (or a promise of it).
// While it runs, the cards keep their frame and old data under a veil; if it rejects,
// the dashboard shows an error with a Retry button.
async function load(query: ProductQuery) {
  const res = await fetch(`/api/analytics?range=${query.range}&platforms=${query.platforms.join(",")}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

<ProductDashboard load={load} defaultLive={false} labels={{ title: "Engagement from your API" }} />
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves through Live, Compare, Export, the time range and the filter chips, then each panel's Chart / Table tabs and chart. |
| ← / → | In the time range: picks the previous / next range. |
| Enter / Space | Toggles a filter chip, Live or Compare, presses Export, or picks the Chart / Table view. |
| Arrow keys | Inside a chart: read its values (sankey: walk the flows; funnel: stages; cohort: cells; calendar: days). |
| Escape | Clears the value being read. |

## Accessibility

- The dashboard is a labeled region; a polite live region says “Loading new data…” and “Dashboard updated” when you change the range or filters, and “CSV downloaded” after an export (never on live ticks).
- Every chart has a table view behind its Chart / Table tabs, so every value can be read without color or a pointer.
- Change badges carry an arrow and a signed number, and a screen-reader sentence (“Up 12.4% vs previous period”); green never stands alone.
- Rolling numbers are visual only: the final value is in the text for assistive tech, and live ticks are not announced (no chatter every two seconds).
- Live updates stop on their own off-screen and in background tabs; the Live toggle is the pause control (WCAG 2.2.2).
- Reduced motion: no rolling, no draw-in, no panel rise; values and data changes appear at once (short fades only).
- Filter chips, Live and Compare are toggle buttons (aria-pressed) with a check mark or dot when on; every control has a 44px hit area on touch screens.

## Data

load is required: ProductDashboard never invents numbers. Return your own data (or a promise of it) from load. For demos and prototypes use the sample loader and live step from the separate @sheenui/theme/demo-data module:

```tsx
import { ProductDashboard } from "@sheenui/theme";
import { productDemoLoader, productLiveStep } from "@sheenui/theme/demo-data";

<ProductDashboard load={productDemoLoader} liveStep={productLiveStep} />
```

With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the “with demo data” command at the top of this page): npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-product.json. The “component only” command under Files to copy leaves the sample data out, which is what a production build wants.


## Performance

- Glass budget: only the header, the KPI strip, the cards and one tooltip blur what is behind them; controls inside them drop their own blur.
- Charts below the fold mount only when they come near the viewport; live updates and loops pause off-screen and in hidden tabs.
- New data reaches the cards one after another, inside React transitions, so no single task re-renders every chart. Live ticks re-render the KPI strip only.


## All exports on this page

- ProductDashboard — A full product-analytics dashboard: active users and stickiness, the sign-up journey (sankey), the activation funnel, feature adoption.
- defaultProductLabels — The English ProductLabels used when labels is omitted; a partial labels prop is merged over them.
- useDashboardData — The one data-loading hook of every dashboard.
- useLiveTicker — Calls onTick every interval ms while enabled, but only while ref is on screen and the tab is visible.


## When to use the product analytics dashboard

- Use it for a product team's weekly review, where the funnel, the retention cohorts and the Sankey user flows show where people drop off, and daily, weekly and monthly active users show whether they come back across web, iOS and Android.
- Use it for a growth review, where a sankey shows how sign-ups flow from sources to onboarding and outcomes, an activation funnel shows drop-off, and cohorts show retention.
- Use platforms chips to filter by web, iOS and Android, and Compare to show the previous period beside every figure and the funnel's conversion.
- Skip it when you need revenue metrics or site traffic: SaasRevenueDashboard covers MRR and churn, and WebAnalyticsDashboard covers page views and referrers, so use this one for in-product behavior.
- Pair it with SankeyChart, FunnelChart and CohortChart when assembling custom panels, and useDashboardData with useLiveTicker if you build your own live panels.


## Frequently asked questions

### How do I use this product analytics dashboard with my data?

Pass load to ProductDashboard; it is required, and receives range, platforms, now and locale, and returns ProductData: dau, wau, mau, flow, funnel, adoption, cohorts, events and eventsPerMinute. Demo loaders and liveStep helpers come from the demo-data export.

### What charts does it include?

Active-user KPIs with sparklines, a sankey of the sign-up journey, the activation funnel with the previous period, feature adoption as a bar list, retention cohorts and a calendar heatmap of daily events. Each chart has a Chart and Table tab.

### How do filters, live mode and keyboard control work?

The range control moves with the arrow keys, and platform chips toggle with Space or Enter, then Live, Compare and Export. Inside a chart, arrow keys read points and Escape clears the reading. Live pauses off screen and in background tabs, and liveInterval defaults to 2000 ms.

### How do I handle loading, empty and error states?

The load function can return data or a promise. The first load shows skeletons, later loads keep old data under a veil, and an empty or failed load shows a message, with Retry after a thrown error. The glass prop auto-falls back to solid cards on weak devices.


## Related pages

- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard)
- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics)
- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas)
- [E-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce)

5 dashboards pages in all: browse them on [All dashboards](https://lokendra-builds.github.io/sheenui/dashboards/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
