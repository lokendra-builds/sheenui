Canonical: https://lokendra-builds.github.io/sheenui/dashboards/saas

# SaaS Revenue Dashboard (MRR & Churn) for React

URL: https://lokendra-builds.github.io/sheenui/dashboards/saas
Sidebar name: SaaS revenue

A glass SaaS revenue dashboard for React: MRR, churn, cohort retention and plan movement with animated charts and rolling KPI tiles. Tailwind v4, MIT.

What it is: A SaaS dashboard template for React that tracks MRR, churn and cohort retention in glass charts. Use it as a revenue dashboard for the revenue page of a subscription product, showing MRR, ARR, churn rate and ARPU as rolling numbers with deltas and sparklines.

Install (with demo data):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-saas.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Dashboards](https://lokendra-builds.github.io/sheenui/dashboards/) > SaaS revenue

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `blocks/{analytics-saas.tsx, analytics-kit.ts, icons.tsx}`
- `components/button/`
- `components/charts/{chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, cohort-chart.tsx, donut-chart.tsx, heatmap.tsx, percent-bar-chart.tsx, pie-chart.tsx, sparkline.tsx, stacked-area-chart.tsx, waterfall-chart.tsx}`
- `components/charts/chart-parts/`
- `components/charts/cohort-chart/`
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
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, initials.ts, math.ts, no-script-reveal.tsx, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

shadcn CLI (component only):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-saas.json
```

Registry item: analytics-saas. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { SaasRevenueDashboard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| load | AnalyticsLoader<SaasRevenueData> | required | Loads the data for a range + filters (sync or async). Required: no dashboard falls back to fake data. The demo loaders live in @sheenui/theme/demo-data, which the package root does not export. |
| liveStep | ((prev: SaasRevenueData, tick: number) => SaasRevenueData) | optional, no default | Evolves the data on each live tick (omit for no live updates). Return a new object; unchanged parts keep their identity. |
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
| product | string | "Acme Cloud" | Product shown as the title (string, default "Acme Cloud"). |
| currency | string | "USD" | Sets the ISO 4217 currency of every amount. |
| ranges | readonly AnalyticsRange[] | ["7d", "30d", "90d", "12m"] | Lists the ranges offered in the header. |
| filters | readonly AnalyticsFilter[] | optional, no default | Region filter chips. Their values reach load as filters. |
| onExport | ((data: SaasRevenueData) => void) | a CSV of MRR by plan | Called by Export (default: a CSV of MRR by plan). |
| headingLevel | HeadingLevelOption | 2 | Heading level of the title (1 to 6), or "none" for a paragraph with no heading role (panel titles follow). |
| locale | string | the runtime's | BCP 47 locale for every number and date (string, default the runtime's). |
| labels | Partial<SaasRevenueLabels> | defaultSaasRevenueLabels | Every other string, for translation: labels={{ range: "…" }}; omitted keys keep the English of defaultSaasRevenueLabels. All 49 keys of SaasRevenueLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## SaasRevenueData

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| points | { label, long?, mrr: Record<plan, number> }[] | optional, no default | MRR by plan at each point (Starter, Pro, Business, Enterprise). |
| kpis / previousKpis | { mrr, arr, churnRate, arpu } | optional, no default | Headline numbers; churn is a monthly ratio (0.022 = 2.2%). |
| trends | Record<metric, number[]> | optional, no default | Gives the sparkline values for each KPI, keyed by metric. |
| movement | { starting, newBusiness, expansion, reactivation, contraction, churn } | optional, no default | The waterfall (contraction and churn as positive amounts). |
| cohorts / cohortPeriod | CohortRow[] / "month" \| "week" | optional, no default | Takes retention cohorts (customers still paying). |
| customers | { id, name, detail?, plan, mrr, previousMrr?, seats, since }[] | optional, no default | Fills the top-customers table with these rows. |

## DeltaBadge props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| ratio | number \| null | optional, no default | Change ratio (0.124 = +12.4%). null: nothing to compare; the badge renders nothing unless it has children. |
| change | number \| null | optional, no default | Alias of ratio: the change as a fraction (0.124 = +12.4%); ratio wins when both are set. |
| goodWhen | "up" \| "down" | "up" | Which direction is good news. |
| locale | string | the runtime's | BCP 47 locale for the percentage (string, default the runtime's). |
| children | ReactNode | optional, no default | Visible text instead of the percentage (e.g. "+$1,204 (2.1%)"). |
| labels | Pick<AnalyticsLabels, "change" \| "noChange"> | defaultAnalyticsLabels | Screen-reader sentences. Spread defaultAnalyticsLabels and override single keys, e.g. labels={{ ...defaultAnalyticsLabels, change: "…" }}. All 2 keys of AnalyticsLabels are listed in the key table under the props table. |
| srLabel | ((direction: "up" \| "down" \| "flat", amount: string) => string) | optional, no default | Screen-reader sentence (direction + amount); overrides labels. |
| className | string | optional, no default | Adds extra classes to the pill (string). |

## RollingNumber props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | required | The number to show (number, required); a non-finite value prints an en dash. |
| format | Intl.NumberFormatOptions \| ((n: number) => string) | optional, no default | A formatter, or Intl.NumberFormat options (currency, percent, compact…) for locale. |
| locale | string | the runtime's | BCP 47 locale for format when it is an options object (string, default the runtime's). |
| play | boolean | true | Hold the digits at 0 until true (e.g. until a card is in view). |
| rollIn | boolean | true | Roll in from zeros the first time the number is seen. Later changes roll from the previous value. |
| duration | number | 0.6 | Seconds a roll takes. |
| className | string | optional, no default | Adds extra classes to the outer <span> (string). |

## Example 1 of 3: Live demo

Twelve months of MRR by default. Turn on Live to watch upgrades land on the latest point; switch regions and every chart, the cohorts and the customer list follow. Sort the customers by MRR, seats, change or tenure.

```tsx
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
// Package build (after the first npm release, or a packed tarball): import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@/components/sheenui/blocks/analytics/demo-saas";
// Package build (after the first npm release, or a packed tarball): import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" currency="USD" />
```

## Example 2 of 3: Euros, German, Europe only

currency and locale format every amount in euros, German style; defaultFilters starts on one region; labels translate every string, including the cohort columns ("Monat 3").

```tsx
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
// Package build (after the first npm release, or a packed tarball): import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@/components/sheenui/blocks/analytics/demo-saas";
// Package build (after the first npm release, or a packed tarball): import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard
  load={saasRevenueDemoLoader}
  liveStep={saasLiveStep}
  product="Nordlicht Software"
  currency="EUR"
  locale="de-DE"
  defaultRange="90d"
  defaultFilters={["emea"]}
  labels={{
    metrics: { mrr: "MRR", arr: "ARR", churnRate: "Kündigungsrate", arpu: "ARPU" },
    cohortPeriodName: (period, i) => `${period === "month" ? "Monat" : "Woche"} ${i}`,
    // … every string is in SaasRevenueLabels
  }}
/>
```

## Example 3 of 3: Loading, empty and error states

The frame never disappears: skeletons hold every panel's place on the first load, later loads dim the charts under a scan line, and an empty or failed load says so in words (with Retry when the loader threw). Pin a state with status for docs and tests.

```tsx
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
// Package build (after the first npm release, or a packed tarball): import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@/components/sheenui/blocks/analytics/demo-saas";
// Package build (after the first npm release, or a packed tarball): import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} product="Acme Cloud" status="loading" defaultLive={false} />
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift+Tab | Move through the header controls, the KPIs, each chart and its Chart / Table switch. |
| ← / → | Move the time range (Segmented control), the KPI tabs, the Chart / Table switch, or the point being read in a chart. |
| Home / End | First / last KPI tab, or first / last point of a chart. |
| Enter / Space | Toggle Live, Compare or a filter chip; press Export; sort a table column. |
| Esc | Stop reading a chart (hides the crosshair and tooltip). |
| Enter / Space (table header) | Sort the customers by that column; again to reverse (aria-sort is announced). |

## Accessibility

- KPI deltas read in words and know which way is good: a falling churn rate is good news (green, “Down 9.9%”), a falling ARPU is not.
- The waterfall labels every step with its signed value and shows increases and decreases with different shapes and colors; its table lists each step and the running total.
- The cohort grid is navigable cell by cell with the arrow keys and has a % / users switch; cohorts that haven't reached a period read “not yet”, never 0%.
- The customers table is a real table with sortable column buttons (aria-sort). On narrow screens the plan and start date fold under the name, so MRR and change stay visible without scrolling.
- Reduced motion: values and charts jump, no draw-ins; the busy scan line becomes a still bar.

## Data

load is required: SaasRevenueDashboard never invents numbers. Return your own data (or a promise of it) from load. For demos and prototypes use the sample loader and live step from the separate @sheenui/theme/demo-data module:

```tsx
import { SaasRevenueDashboard } from "@sheenui/theme";
import { saasRevenueDemoLoader, saasLiveStep } from "@sheenui/theme/demo-data";

<SaasRevenueDashboard load={saasRevenueDemoLoader} liveStep={saasLiveStep} />
```

With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the “with demo data” command at the top of this page): npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-saas.json. The “component only” command under Files to copy leaves the sample data out, which is what a production build wants.


## Performance

- Charts below the fold mount when they come within 320px of the viewport; their frame is reserved first, so nothing shifts.
- New data lands in a React transition, one panel per frame: visible panels ripple in order, panels off-screen catch up in idle time or when you scroll to them.
- Controls answer instantly (optimistic state) while the dashboard re-renders in the background, so a click never blocks the next frame.
- Loading dims the panels through a data attribute (CSS only): starting or finishing a load re-renders no chart.
- Glass budget: the header, the KPI strip and at most two panels per row blur what's behind them; controls inside the header don't add their own blur. Phones get a lighter blur.
- Live updates, the realtime stream and every pulse stop while the dashboard is off-screen or the tab is hidden. Only transform and opacity animate.


## All exports on this page

- DeltaBadge — "▲ 12.4%" on a status tint: the arrow and the sign carry the direction, colour only supports it.
- RollingNumber — Odometer number for dashboards that update all the time: each digit is ONE element (a 0–9 column) moved by a CSS transform transition.
- SaasRevenueDashboard — Props (see SaasRevenueDashboardProps): product ("Acme Cloud"), currency ("USD"), ranges (7d, 30d, 90d, 12m).
- defaultSaasRevenueLabels — The English SaasRevenueLabels used when labels is omitted; a partial labels prop is merged over them.


## When to use the SaaS revenue dashboard

- Use it for the finance or growth screen of a subscription product, where MRR, ARR, churn rate and ARPU roll up as headline numbers with deltas and a sparkline beside each.
- Use it for investor updates or an internal finance review, where MRR stacked by plan, the plan mix donut, an MRR movement waterfall and retention cohorts explain why revenue changed.
- Use currency, locale and labels to render a non-US dashboard, for example amounts in euros formatted German style with translated cohort columns.
- Skip it when you need traffic or conversion data: WebAnalyticsDashboard covers visitors and sources, and EcommerceDashboard covers orders and checkout, so use this one only for subscription metrics.
- Pair it with DonutChart and WaterfallChart for custom panels, SegmentedControl for switching views, and AnalyticsShell with AnalyticsPanel when you adapt the layout.


## Frequently asked questions

### How do I build a SaaS dashboard in React with SheenUI?

Render SaasRevenueDashboard with a load function that returns SaasRevenueData: MRR by plan per point, kpis, trends, movement, cohorts and customers. product sets the title and currency the ISO code. The default ranges are 7d, 30d, 90d and 12m, since MRR is a slow metric.

### What does the MRR movement waterfall show?

It breaks the change in MRR over the range into a starting amount plus new business, expansion, reactivation, contraction and churn, so you can see which movement drove the change. Churn is passed as a monthly ratio, while MRR, ARR and ARPU are in currency units.

### How do region filters and the customer table work?

Pass filters as region chips; their values reach load as filters, so your API returns the matching data. defaultFilters starts with one region on. The top-customers table is sortable by MRR, seats, change or tenure, and each chart has a table view.

### Can I translate it or change the headline numbers?

Yes, through the labels prop, a Partial of SaasRevenueLabels that covers every string including cohort columns. locale formats numbers and dates through Intl, and onExport replaces the default CSV of MRR by plan. headingLevel sets the heading level.


## Related pages

- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [E-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce)
- [Product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product)
- [Crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard)

### Guides that cover it

- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts)

5 dashboards pages in all: browse them on [All dashboards](https://lokendra-builds.github.io/sheenui/dashboards/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
