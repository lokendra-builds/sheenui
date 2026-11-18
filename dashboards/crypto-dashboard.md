Canonical: https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard

# Crypto & Finance Dashboard Template for React

URL: https://lokendra-builds.github.io/sheenui/dashboards/crypto-dashboard
Sidebar name: Crypto dashboard

A glass crypto and finance dashboard for React: candlesticks with volume, live streaming prices and portfolio allocation. Tailwind CSS v4 + Motion. MIT.

What it is: A crypto and finance dashboard template for React with candlesticks, live prices and a portfolio breakdown. Use it as a portfolio dashboard for a crypto or brokerage screen where the balance chart can be scrubbed to roll the big number to any moment or dragged to measure a move.

Install (with demo data):

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-finance.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Dashboards](https://lokendra-builds.github.io/sheenui/dashboards/) > Crypto dashboard

Files to copy from `theme/src/`:

- `blocks/{analytics-finance.tsx, analytics-kit.ts, icons.tsx}`
- `components/button/`
- `components/charts/{candlestick-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, donut-chart.tsx, flow-utils.tsx, heatmap.tsx, sparkline.tsx, treemap.tsx}`
- `components/charts/candlestick-chart/`
- `components/charts/category-bar/`
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
- `blocks/analytics-finance/`
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
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-finance.json
```

Registry item: analytics-finance. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { FinanceDashboard } from "@/components/sheenui/blocks/analytics-finance";
import { type FinanceQuery } from "@/components/sheenui/blocks/analytics-finance/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { FinanceDashboard, type FinanceQuery } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| load | (query: FinanceQuery, signal: AbortSignal) => FinanceData \| Promise<FinanceData> | required | Loads the data for a query: return it, or a promise of it. Required: there is no built-in demo data (see @sheenui/theme/demo-data). |
| status | AnalyticsStatus | "auto" | Force a state for demos and tests: "loading", "empty" or "error". "auto" (default) follows the data. |
| liveStep | ((data: FinanceData, tick: number) => FinanceData) \| null | null | Evolves the data while Live is on. |
| liveInterval | number | 1600 | Milliseconds between live updates. |
| range | AnalyticsRange | optional, no default | Sets the active range when controlled. |
| defaultRange | AnalyticsRange | "30d" | The range at first when range is not controlled (AnalyticsRange, default "30d"). |
| onRangeChange | ((range: AnalyticsRange) => void) | optional, no default | Called when the range changes. |
| classes | AssetClass[] | optional, no default | The asset-class chips that are on (controlled); none selected means all classes. |
| defaultClasses | AssetClass[] | [] | The classes on at first when classes is not controlled (default none, i.e. all). |
| onClassesChange | ((classes: AssetClass[]) => void) | optional, no default | Called when the class chips change. |
| asset | string | optional, no default | The asset shown in the candlestick card (controlled / initial). |
| defaultAsset | string | "BTC" | The asset shown first when asset is not controlled (string, default "BTC"). |
| onAssetChange | ((symbol: string) => void) | optional, no default | Called when another asset is picked in the watchlist. |
| live | boolean | optional, no default | Whether live updates run (controlled). |
| defaultLive | boolean | true | Whether live updates are on at first (boolean, default true). |
| onLiveChange | ((live: boolean) => void) | optional, no default | Called when the Live toggle changes. |
| compare | boolean | optional, no default | Whether the previous period is shown (controlled). |
| defaultCompare | boolean | false | Whether the comparison is on at first (boolean, default false). |
| onCompareChange | ((compare: boolean) => void) | optional, no default | Called when the Compare toggle changes. |
| onExport | ((data: FinanceData, query: FinanceQuery) => void) | downloads holdings and transactions as CSV | Called by the Export button. |
| currency | string | "USD" | Sets the ISO 4217 currency of every value. |
| now | Date | the current time | "Now": the end of every range. On a prerendered page pass a fixed date, so the server's and the browser's first render print the same axes. |
| locale | string | the runtime's | BCP 47 locale for every number and date (string, default the runtime's). |
| headingLevel | HeadingLevelOption | 2 | Heading level of the title (1 to 6, default 2), or "none" for a paragraph with no heading role (panel titles follow). |
| glass | AnalyticsGlass | "auto" | Glass on the cards: "auto" (default) keeps real glass while the device keeps up and falls back to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one. |
| labels | Partial<FinanceLabels> | defaultFinanceLabels | Every other string, for translation: labels={{ range: "…" }}; omitted keys keep the English of defaultFinanceLabels. All 60 keys of FinanceLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the root <section> (string). |

## Data: FinanceData

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| assets | FinanceAsset[] | optional, no default | { symbol, name, class, quantity, price, open24h, spark } per holding or watched asset. |
| series | { time: number; value: number }[] | optional, no default | Portfolio value over the range, evenly spaced (keep the same count across ranges and the line morphs point for point). |
| previous | number[] | optional, no default | The previous period's values, one per point of series (the dashed Compare line). |
| candles | Record<string, Candle[]> | optional, no default | Candles over the range per symbol: { date, open, high, low, close, volume }. |
| transactions | FinanceTransaction[] | optional, no default | { id, date, type, symbol, quantity, value, status }, newest first. |

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

## Cascade props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | T | required | The data to hand to the children; panel number index receives it a beat after the one before. |
| index | number | required | Position of this panel in the cascade (0 is first). |
| step | number | 45 | Milliseconds between one panel receiving new data and the next. |

## Example 1 of 3: Live portfolio

Hover the balance chart and the big number rolls to that moment; drag across it to measure a move (on touch: hold, then drag). Pick an asset in the watchlist to load its candles. Prices tick live with rolling digits.

```tsx
import { FinanceDashboard } from "@/components/sheenui/blocks/analytics-finance";
// Package build (after the first npm release, or a packed tarball): import { FinanceDashboard } from "@sheenui/theme";
import { financeDemoLoader, financeLiveStep } from "@/components/sheenui/blocks/analytics/demo-finance";
// Package build (after the first npm release, or a packed tarball): import { financeDemoLoader, financeLiveStep } from "@sheenui/theme/demo-data";

export function Portfolio() {
  return <FinanceDashboard load={financeDemoLoader} liveStep={financeLiveStep} headingLevel={3} />;
}
```

## Example 2 of 3: Euro, German formatting, stocks only

Every number and date follows the locale and currency; filters, the asset and Compare can start pre-set.

```tsx
import { FinanceDashboard } from "@/components/sheenui/blocks/analytics-finance";
// Package build (after the first npm release, or a packed tarball): import { FinanceDashboard } from "@sheenui/theme";
import { financeDemoLoader, financeLiveStep } from "@/components/sheenui/blocks/analytics/demo-finance";
// Package build (after the first npm release, or a packed tarball): import { financeDemoLoader, financeLiveStep } from "@sheenui/theme/demo-data";

<FinanceDashboard
  load={financeDemoLoader}
  liveStep={financeLiveStep}
  locale="de-DE"
  currency="EUR"
  defaultRange="12m"
  defaultClasses={["stocks", "etf"]}
  defaultAsset="NWT"
  defaultCompare
  labels={{ title: "Aktien & ETFs", description: "Kurse, Verlauf und Käufe der letzten 12 Monate." }}
/>
```

## Example 3 of 3: Loading, empty and error states

Your own `load` drives the dashboard. Try a slow network, an empty account and a failed request.

```tsx
import { FinanceDashboard } from "@/components/sheenui/blocks/analytics-finance";
import { type FinanceQuery } from "@/components/sheenui/blocks/analytics-finance/model";
// Package build (after the first npm release, or a packed tarball): import { FinanceDashboard, type FinanceQuery } from "@sheenui/theme";

// `load` receives { range, classes, now }; return the data or a promise of it.
async function load(query: FinanceQuery) {
  const res = await fetch(`/api/portfolio?range=${query.range}&classes=${query.classes.join(",")}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

<FinanceDashboard load={load} defaultLive={false} labels={{ title: "Portfolio from your API" }} />
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves through the header controls, then the balance chart, candles, allocation, each watchlist row and the transactions table. |
| ← / → | Balance chart: read the value at each point (the big number follows). Alt moves 10 points. |
| Shift + ← / → | Balance chart: measure the move from where you started to the current point. |
| Home / End | Balance chart: first / latest point. |
| Escape | Clears the reading or measurement. |
| Enter / Space | Watchlist row: show that asset's candles. |
| + / − , Shift + ← / → | Candlestick chart: zoom and pan. |

## Accessibility

- The balance chart is keyboard-readable and announces each value (and the start and end of a measurement); the Table tab lists every point.
- Watchlist rows are toggle buttons (aria-pressed) whose name says the asset, its price and its 24-hour change; the price flash is decorative.
- Up / down is never color alone: candles are hollow or filled, badges carry arrows and signs, statuses carry icons and words.
- Prices tick visually only (no announcement per tick); the Live switch pauses them, and they stop off-screen and in background tabs.
- Reduced motion: no rolling digits, flashes, draw-ins or pings; data changes appear at once.
- The transactions table scrolls inside its own focusable region with a sticky header, so the page never scrolls sideways on phones.

## Data

load is required: FinanceDashboard never invents numbers. Return your own data (or a promise of it) from load. For demos and prototypes use the sample loader and live step from the separate @sheenui/theme/demo-data module:

```tsx
import { FinanceDashboard } from "@sheenui/theme";
import { financeDemoLoader, financeLiveStep } from "@sheenui/theme/demo-data";

<FinanceDashboard load={financeDemoLoader} liveStep={financeLiveStep} />
```

With the shadcn CLI the sample data is its own optional item, which also installs the dashboard (the “with demo data” command at the top of this page): npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/analytics-demo-finance.json. The “component only” command under Files to copy leaves the sample data out, which is what a production build wants.


## All exports on this page

- Cascade — Render-prop form of useCascade: only this wrapper re-renders when its turn comes, so the parent (and its other panels) stay untouched.
- FinanceDashboard — A finance / crypto dashboard: portfolio balance with a scrub-and-measure area chart, candles with volume for the selected asset.
- defaultFinanceLabels — The English FinanceLabels used when labels is omitted; a partial labels prop is merged over them.
- useCascade — Hands value on after index × step ms, in a transition: when a dashboard's data changes, its panels take the new data one after another.


## When to use the crypto dashboard

- Use it for the home screen of a trading or wallet app, where the balance chart is scrubbed to read the figure at any moment, or dragged to measure the gain between two points.
- Use it for a trading watchlist with live ticking prices, candles with volume for the selected asset, and allocation as a donut or treemap beside a transactions table.
- Use currency, locale, defaultClasses and defaultAsset to start on euros in German formatting with stocks and ETFs only and a chosen symbol like NWT.
- Skip it when you need order entry or exchange-grade depth charts; this block is read-only analytics, so build trading forms with Input and Button, and use another chart for order books.
- Pair it with CandlestickChart, DonutChart and Sparkline for custom panels, SegmentedControl for the range, and NumberTicker for any extra price figures you add.


## Frequently asked questions

### How do I build a crypto dashboard in React with FinanceDashboard?

Pass load, which returns FinanceData: assets, a portfolio value series with previous values, candles per symbol and transactions. defaultAsset (default BTC) picks the candle asset, and classes filter crypto, stocks, ETFs or cash. liveInterval defaults to 1600 ms.

### How do I read or measure the balance chart by keyboard?

Left and Right arrows read the value at each point and the big number follows; Alt moves 10 points. Shift plus arrows measures the move from where you started, Home and End jump to first and latest, and Escape clears the reading.

### How are gains and losses shown without relying on color?

Candles are hollow or filled, badges carry arrows and signs, and transaction statuses carry icons and words. Watchlist rows are toggle buttons whose names say the asset, price and 24-hour change. Price ticks are visual only and are not announced.

### How do live prices and reduced motion behave?

Prices tick with rolling digits only while Live is on, and they stop off screen and in background tabs. Reduced motion removes rolling digits, flashes, draw-ins and pings; data changes appear at once. The transactions table scrolls in its own focusable region.


## Related pages

- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics)
- [SaaS revenue](https://lokendra-builds.github.io/sheenui/dashboards/saas)
- [E-commerce](https://lokendra-builds.github.io/sheenui/dashboards/ecommerce)
- [Product analytics](https://lokendra-builds.github.io/sheenui/dashboards/product)

5 dashboards pages in all: browse them on [All dashboards](https://lokendra-builds.github.io/sheenui/dashboards/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
