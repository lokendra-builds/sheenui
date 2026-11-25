Canonical: https://lokendra-builds.github.io/sheenui/dashboards/

# React Glass Dashboard Template Pack (Free)

URL: https://lokendra-builds.github.io/sheenui/dashboards/
Sidebar name: All dashboards

Free glassmorphism dashboard templates for React: web analytics, SaaS revenue, e-commerce, product analytics and crypto, with animated charts. Tailwind v4.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > All dashboards

React glass dashboard templates: five full pages of glass charts and KPI tiles, each fed by a typed load prop so it shows your data, never fake numbers.

A React glass dashboard template is a full analytics screen you copy into your app: frosted KPI tiles, animated charts and filters, with the data left to you. These 5 templates (web analytics, SaaS revenue, e-commerce, product analytics and crypto) install with one shadcn command each. MIT licence, no account or email gate: run one shadcn command and keep the source.

## Dashboards (5)

- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics): A web analytics dashboard template for React in the style of Plausible and Vercel Analytics, built from SheenUI charts.
- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas): A SaaS dashboard template for React that tracks MRR, churn and cohort retention in glass charts.
- [E-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce): An ecommerce sales dashboard template for React with orders, top products, a conversion funnel and a regional map.
- [Product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product): A product analytics dashboard for React with funnels, retention cohorts and Sankey user flows.
- [Crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard): A crypto and finance dashboard template for React with candlesticks, live prices and a portfolio breakdown.


## Which glass dashboard template to pick

Pick Web analytics for traffic and live visitors, SaaS revenue for MRR and churn, E-commerce for orders and conversion, Product analytics for funnels and Sankey flows, Crypto for candlesticks and streaming prices. All five are one component built on the same kit: a glass header (time range, filters, Live, Compare and CSV export), a KPI strip with rolling numbers and sparklines, then panels that each have a chart and a table view. They differ in the charts they draw and in the shape of the data they take.

The five React glass dashboard templates: component, charts and data shape

| Template | Charts | Data fields | Registry items (component, with demo data) |
| --- | --- | --- | --- |
| Web analytics WebAnalyticsDashboard | Area trend with the previous period, streaming realtime chart, bar lists, donut, world map | points, totals, pages, referrers, countries, devices, realtime | analytics-web analytics-demo-web |
| SaaS revenue SaasRevenueDashboard | Stacked area (MRR by plan), donut, waterfall (MRR movement), retention cohorts, sortable table | points per plan, kpis, movement, cohorts, customers | analytics-saas analytics-demo-saas |
| E-commerce EcommerceDashboard | Revenue bars with a comparison line, checkout funnel, treemap, hour-by-weekday heatmap, bar list | points, kpis, funnel, categories, heatmap, products | analytics-ecommerce analytics-demo-ecommerce |
| Product analytics ProductDashboard | Sankey user journey, activation funnel, feature adoption bars, cohorts, calendar heatmap | dau, wau, mau, flow, funnel, adoption, cohorts, events | analytics-product analytics-demo-product |
| Crypto FinanceDashboard | Scrub-and-measure area chart, candlesticks with volume, allocation donut or treemap, live watchlist | assets, series, previous, candles, transactions | analytics-finance analytics-demo-finance |

## Install a dashboard template with the shadcn registry

Each template is a registry item, and its sample data is a second item named analytics-demo-<name> that also installs the dashboard. Run the add command with the demo item, for example the SaaS one, and the shadcn CLI copies the dashboard, the dashboard kit, the charts it uses and the sample data into components/sheenui/:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-saas.json
```

For production, where load returns your own data, install the component only: analytics-saas instead of analytics-demo-saas. Your app needs React 19.2 and Tailwind CSS v4; the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) covers the two CSS imports, and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) lists the rest.


## Swap the demo data for your own

A template ships with no data. You pass load, a function that gets the date range, the active filters and an abort signal and returns the object in the table above, synchronously or as a promise. The demos use saasRevenueDemoLoader from @sheenui/theme/demo-data; replace it with a function that calls your API and maps the response to the same fields:

```tsx
import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";

export function Revenue() {
  return (
    <SaasRevenueDashboard
      currency="EUR"
      locale="de-DE"
      load={async ({ range, signal }) => {
        const res = await fetch(`/api/revenue?range=${range}`, { signal });
        return res.json(); // { points, kpis, movement, cohorts, customers, ... }
      }}
    />
  );
}
```

Money and dates go through Intl from the locale and currency props, every string is in a labels object, and the live ticker (liveStep) is optional: leave it out for a static report. The [chart gallery](https://lokendra-builds.github.io/sheenui/charts/) shows what each chart takes if you want to build a screen of your own from the same pieces.


## About dashboards

### Overview

A glassy dashboard, or glassmorphism dashboard, puts KPI tiles, charts and filters on frosted panels over a soft background, and it only works when contrast, density and speed stay under control. The 5 React dashboard templates below do that work for you: each is a full page you can copy, with animated charts, sparklines, date filters and a table view for every chart.

Pick the one closest to your product. [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics) shows traffic, sources and a live visitor count; [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas) follows MRR, churn and plans; [e-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce) tracks orders and conversion; [product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product) adds funnels and cohorts; and the [crypto dashboard](https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard) has candlesticks and a streaming price.

The charts come from the [animated React charts gallery](https://lokendra-builds.github.io/sheenui/charts/), where you can read about each type, and the surrounding parts from the [glass UI components](https://lokendra-builds.github.io/sheenui/components/). For smaller pieces, see the [dashboard stat cards](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats). Dashboards draw many surfaces at once, so read [backdrop-filter performance](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) to keep them fast, and [accessible React charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts) for the reading model.

Each template is one component with a required load prop: a function (sync or async) that receives the date range and the active filters and returns the numbers and rows to draw. The templates ship no data of their own; the demo loaders in @sheenui/theme/demo-data are only for trying them out. Header controls (range, Live, Compare) are props too, so you can control them from your router or a store. Every label is in a labels object and every number goes through Intl, so a dashboard in another language or currency needs props, not edits.

Want a whole admin app around a dashboard? The [Glass Admin starter template](https://lokendra-builds.github.io/sheenui/docs/installation#starter-template) (Vite or Next.js) wires the SaaS revenue dashboard into an app shell with a customers table, settings and sign-in.

### Frequently asked questions

### Are these dashboard templates really free?

Yes. SheenUI is MIT licensed, so you can use the dashboards in personal and commercial projects.

### What do the dashboards use for charts?

SheenUI's own animated React charts: line, area, bar, donut, funnel, heatmap and more, each with keyboard reading and a table view.

### Is the data real?

No. The numbers are deterministic demo data, so the screens look the same every time. Replace the arrays with your own API.

### How do I connect my own data to a dashboard?

Pass the required load prop, a function that returns the data for the current date range and filters, synchronously or as a promise. The demo loaders in @sheenui/theme/demo-data show the shape, and money and dates are formatted with Intl from the locale and currency props.


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
