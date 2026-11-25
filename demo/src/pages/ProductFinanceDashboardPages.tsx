import { useMemo, useState, type ReactNode } from "react";

import { slugify } from "../layout/heading-ids";
import { FinanceStage, ProductStage } from "./DashboardStages";
import { Page, PropsTable, type PropRow } from "../layout/Page";
import { A11yNotes, DemoDataNote, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { DEMO_NOW } from "../demo-clock";

import type { ProductData, ProductQuery } from "@sheenui/theme";
import type { FinanceData, FinanceQuery } from "@sheenui/theme";
import { FinanceDashboard, ProductDashboard } from "./demo-dashboards";
import * as PROPS from "../generated/component-props";

// The dashboards are islands (see layout/lazy-block.tsx): this page's chunk holds the docs, each block is fetched when the browser is idle.
const loadProduct = () => import("../../../theme/src/blocks/analytics/demo-product");
const loadFinance = () => import("../../../theme/src/blocks/analytics/demo-finance");

const BLOCKS = "theme/src/blocks/";

/* ---------- Shared docs pieces ---------- */

function Notes({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 id={slugify(title)} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="glass-1 flex max-w-3xl list-disc flex-col gap-2 rounded-sheen-lg py-4 ps-9 pe-5 text-sm text-pretty text-sheen-fg-muted marker:text-sheen-fg-subtle">
        {children}
      </ul>
    </section>
  );
}

type DemoState = "normal" | "slow" | "empty" | "error";
const stateOptions = [
  { value: "normal", label: "Normal" },
  { value: "slow", label: "Slow network" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
] as const;

const kitRows: PropRow[] = [
  [
    "AnalyticsShell",
    "component",
    "",
    "The frame: a container-query root with the glass header (title, status pill, time-range control, filter chips, Live and Compare toggles, Export), loading announcements and the adaptive glass budget.",
  ],
  [
    "AnalyticsGrid",
    "component",
    "",
    "Container-query grid: 1 column under 42rem, 2 up to 64rem, 4 above. Give each panel a span so rows always fill.",
  ],
  [
    "AnalyticsPanel",
    "component",
    "",
    "Glass panel: header, Chart / Table tabs, a body that mounts near the viewport, a skeleton until ready and a dim veil (not a flash) while new data loads.",
  ],
  ["AnalyticsState", "component", "", "The empty and error states (with Retry), at the panel heading level."],
  [
    "KpiStrip",
    "component",
    "",
    "KPI cells in one glass strip: rolling numbers, change badges with arrows, sparklines and previous-period figures. With onSelect it is a tablist that drives a chart.",
  ],
  [
    "RollingNumber / DeltaBadge",
    "component",
    "",
    "An odometer number (one CSS transform per digit) and an up / down badge with an arrow and a signed number (color is never the only signal).",
  ],
  [
    "useDashboardData(load, query, key)",
    "hook",
    "",
    "Loads data (sync or a promise), keeps the old data on screen while the next arrives, drops stale responses, retries, and updates in place for live mode.",
  ],
  [
    "useLiveTicker(enabled, onTick, { ref, interval })",
    "hook",
    "",
    "An interval that only runs while `ref` is on screen and the tab is visible.",
  ],
  [
    "useCascade(value, index)",
    "hook",
    "",
    "Hands new data to panel number `index` a beat after the previous one: a visible cascade, and no single long render task.",
  ],
  [
    "useAdaptiveGlass(ref, mode)",
    "hook",
    "",
    "The glass budget behind the `glass` prop: flat panels on weak devices, with lite glass, or once frames drop.",
  ],
];

/* ====================================================================== */
/* Product analytics                                                      */
/* ====================================================================== */

async function emptyProductData(query: ProductQuery): Promise<ProductData> {
  const blank = { value: 0, previous: 0, trend: [] };
  const end = (await loadProduct()).productDemoData(query).eventsEnd;
  return {
    dau: blank,
    wau: blank,
    mau: blank,
    flow: { nodes: [], links: [] },
    funnel: [],
    funnelPrevious: [],
    adoption: [],
    cohorts: [],
    cohortUnit: "week",
    events: [],
    eventsStart: end,
    eventsEnd: end,
    eventsPerMinute: 0,
  };
}

const productLoaders: Record<DemoState, (q: ProductQuery) => Promise<ProductData>> = {
  normal: (q) => loadProduct().then((m) => m.productDemoLoader(q)),
  slow: (q) =>
    loadProduct().then((m) => new Promise((resolve) => window.setTimeout(() => resolve(m.productDemoData(q)), 2400))),
  empty: (q) => emptyProductData(q),
  error: () => new Promise((_, reject) => window.setTimeout(() => reject(new Error("503 Service Unavailable")), 600)),
};

const productBasicCode = `import { ProductDashboard } from "@sheenui/theme";
import { productDemoLoader, productLiveStep } from "@sheenui/theme/demo-data";

// Demo data out of the box. Plug in your own loader with \`load\`.
export function Analytics() {
  return <ProductDashboard load={productDemoLoader} liveStep={productLiveStep} />;
}`;

const productCompareCode = `import { ProductDashboard } from "@sheenui/theme";
import { productDemoLoader, productLiveStep } from "@sheenui/theme/demo-data";

<ProductDashboard
  load={productDemoLoader}
  liveStep={productLiveStep}
  defaultRange="90d"
  defaultPlatforms={["ios", "android"]}
  defaultCompare
  defaultLive={false}
  labels={{ title: "Mobile engagement", description: "iOS and Android, against the 90 days before." }}
/>`;

const productStatesCode = `import { ProductDashboard, type ProductQuery } from "@sheenui/theme";

// \`load\` receives { range, platforms, now, locale } and returns the data (or a promise of it).
// While it runs, the cards keep their frame and old data under a veil; if it rejects,
// the dashboard shows an error with a Retry button.
async function load(query: ProductQuery) {
  const res = await fetch(\`/api/analytics?range=\${query.range}&platforms=\${query.platforms.join(",")}\`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

<ProductDashboard load={load} defaultLive={false} labels={{ title: "Engagement from your API" }} />`;

/** The "Product analytics" docs page (/dashboards/product): live examples, props and notes. */
export function ProductDashboardPage() {
  const [state, setState] = useState<DemoState>("normal");
  const compareLabels = useMemo(
    () => ({ title: "Mobile engagement", description: "iOS and Android, against the 90 days before." }),
    [],
  );
  const statesLabels = useMemo(() => ({ title: "Engagement from your API" }), []);
  return (
    <Page
      eyebrow="Dashboard"
      title="Product analytics dashboard"
      description="Active users and stickiness, the sign-up journey as a sankey, the activation funnel, feature adoption, retention cohorts and daily event volume, all in one glass dashboard that re-animates as you change the range."
      source={[`${BLOCKS}analytics-product.tsx`, `${BLOCKS}analytics-kit.tsx`]}
    >
      <ProductStage />
      <Example
        title="Live dashboard"
        description="Switch the range or tap a platform chip: old data stays under a soft veil, then every card tweens to the new numbers, one after another. Live mode drifts the figures every two seconds with rolling digits (it pauses when scrolled away)."
        code={productBasicCode}
        variant="bare"
      >
        <ProductDashboard now={DEMO_NOW} headingLevel="none" />
      </Example>

      <Example
        title="Compare with the previous period"
        description="Pre-set the range, filters and Compare. Every KPI shows its previous value, the funnel shows the change in conversion."
        code={productCompareCode}
        variant="bare"
      >
        <ProductDashboard
          headingLevel="none"
          defaultRange="90d"
          defaultPlatforms={["ios", "android"]}
          defaultCompare
          defaultLive={false}
          labels={compareLabels}
          now={DEMO_NOW}
        />
      </Example>

      <Example
        title="Loading, empty and error states"
        description="Bring your own data with `load`. Try a slow network (skeletons, then the veil on later changes), an empty account and a failed request."
        code={productStatesCode}
        variant="bare"
        controls={
          <Segmented label="Data state" size="sm" options={stateOptions} value={state} onValueChange={setState} />
        }
      >
        <ProductDashboard
          headingLevel="none"
          key={state}
          load={productLoaders[state]}
          defaultLive={false}
          labels={statesLabels}
          now={DEMO_NOW}
        />
      </Example>

      <DemoDataNote
        component="ProductDashboard"
        item="analytics-demo-product"
        names={["productDemoLoader", "productLiveStep"]}
      />
      <PropsTable of={PROPS.ProductDashboard} />

      <PropsTable
        title="Data: ProductData"
        rows={[
          [
            "dau / wau / mau",
            "{ value: number; previous: number; trend: number[] }",
            "",
            "Active users now, in the previous period and along the range (oldest first). Stickiness is DAU ÷ MAU.",
          ],
          [
            "flow",
            "{ nodes: SankeyNode[]; links: SankeyLink[] }",
            "",
            "The user journey for the sankey (sources → sign-up → onboarding → outcome).",
          ],
          [
            "funnel / funnelPrevious",
            "FunnelStage[]",
            "",
            "Activation funnel stages for this and the previous period.",
          ],
          ["adoption", "BarListItem[]", "", "Sets the share of active users (0–100) per feature."],
          [
            "cohorts / cohortUnit",
            'CohortRow[] / "week" | "month"',
            "",
            "Retention cohorts as user counts per period.",
          ],
          [
            "events / eventsStart / eventsEnd",
            "CalendarDatum[] / ISO dates",
            "",
            "Events per day for the calendar heatmap and the days it shows.",
          ],
          ["eventsPerMinute", "number", "", "Shown beside the Live pill."],
        ]}
      />

      <PropsTable title="Dashboard kit (analytics-kit.tsx)" rows={kitRows} />

      <KeyboardTable
        rows={[
          [
            "Tab",
            "Moves through Live, Compare, Export, the time range and the filter chips, then each panel's Chart / Table tabs and chart.",
          ],
          ["← / →", "In the time range: picks the previous / next range."],
          ["Enter / Space", "Toggles a filter chip, Live or Compare, presses Export, or picks the Chart / Table view."],
          [
            "Arrow keys",
            "Inside a chart: read its values (sankey: walk the flows; funnel: stages; cohort: cells; calendar: days).",
          ],
          ["Escape", "Clears the value being read."],
        ]}
      />

      <A11yNotes>
        <li>
          The dashboard is a labeled region; a polite live region says “Loading new data…” and “Dashboard updated” when
          you change the range or filters, and “CSV downloaded” after an export (never on live ticks).
        </li>
        <li>
          Every chart has a table view behind its Chart / Table tabs, so every value can be read without color or a
          pointer.
        </li>
        <li>
          Change badges carry an arrow and a signed number, and a screen-reader sentence (“Up 12.4% vs previous
          period”); green never stands alone.
        </li>
        <li>
          Rolling numbers are visual only: the final value is in the text for assistive tech, and live ticks are not
          announced (no chatter every two seconds).
        </li>
        <li>
          Live updates stop on their own off-screen and in background tabs; the Live toggle is the pause control (WCAG
          2.2.2).
        </li>
        <li>
          Reduced motion: no rolling, no draw-in, no panel rise; values and data changes appear at once (short fades
          only).
        </li>
        <li>
          Filter chips, Live and Compare are toggle buttons (aria-pressed) with a check mark or dot when on; every
          control has a 44px hit area on touch screens.
        </li>
      </A11yNotes>

      <Notes title="Performance">
        <li>
          Glass budget: only the header, the KPI strip, the cards and one tooltip blur what is behind them; controls
          inside them drop their own blur.
        </li>
        <li>
          Charts below the fold mount only when they come near the viewport; live updates and loops pause off-screen and
          in hidden tabs.
        </li>
        <li>
          New data reaches the cards one after another, inside React transitions, so no single task re-renders every
          chart. Live ticks re-render the KPI strip only.
        </li>
      </Notes>
    </Page>
  );
}

/* ====================================================================== */
/* Finance                                                                */
/* ====================================================================== */

function emptyFinanceData(): FinanceData {
  return { assets: [], series: [], previous: [], candles: {}, transactions: [] };
}

const financeLoaders: Record<DemoState, (q: FinanceQuery) => Promise<FinanceData>> = {
  normal: (q) => loadFinance().then((m) => m.financeDemoLoader(q)),
  slow: (q) =>
    loadFinance().then((m) => new Promise((resolve) => window.setTimeout(() => resolve(m.financeDemoData(q)), 2400))),
  empty: () => Promise.resolve(emptyFinanceData()),
  error: () => new Promise((_, reject) => window.setTimeout(() => reject(new Error("503 Service Unavailable")), 600)),
};

const financeBasicCode = `import { FinanceDashboard } from "@sheenui/theme";
import { financeDemoLoader, financeLiveStep } from "@sheenui/theme/demo-data";

export function Portfolio() {
  return <FinanceDashboard load={financeDemoLoader} liveStep={financeLiveStep} headingLevel={3} />;
}`;

const financeLocaleCode = `import { FinanceDashboard } from "@sheenui/theme";
import { financeDemoLoader, financeLiveStep } from "@sheenui/theme/demo-data";

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
/>`;

const financeStatesCode = `import { FinanceDashboard, type FinanceQuery } from "@sheenui/theme";

// \`load\` receives { range, classes, now }; return the data or a promise of it.
async function load(query: FinanceQuery) {
  const res = await fetch(\`/api/portfolio?range=\${query.range}&classes=\${query.classes.join(",")}\`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

<FinanceDashboard load={load} defaultLive={false} labels={{ title: "Portfolio from your API" }} />`;

/** The "Finance" docs page (/dashboards/crypto-dashboard): live examples, props and notes. */
export function FinanceDashboardPage() {
  const [state, setState] = useState<DemoState>("normal");
  const deLabels = useMemo(
    () => ({ title: "Aktien & ETFs", description: "Kurse, Verlauf und Käufe der letzten 12 Monate." }),
    [],
  );
  const statesLabels = useMemo(() => ({ title: "Portfolio from your API" }), []);
  return (
    <Page
      eyebrow="Dashboard"
      title="Finance & crypto dashboard"
      description="A portfolio balance you can scrub and measure, candles with volume for any holding, allocation as a donut or treemap, a watchlist with live ticking prices, and every transaction in the range."
      source={[`${BLOCKS}analytics-finance.tsx`, `${BLOCKS}analytics-kit.tsx`]}
    >
      <FinanceStage />
      <Example
        title="Live portfolio"
        description="Hover the balance chart and the big number rolls to that moment; drag across it to measure a move (on touch: hold, then drag). Pick an asset in the watchlist to load its candles. Prices tick live with rolling digits."
        code={financeBasicCode}
        variant="bare"
      >
        <FinanceDashboard now={DEMO_NOW} headingLevel="none" />
      </Example>

      <Example
        title="Euro, German formatting, stocks only"
        description="Every number and date follows the locale and currency; filters, the asset and Compare can start pre-set."
        code={financeLocaleCode}
        variant="bare"
      >
        <div lang="de" className="contents">
          <FinanceDashboard
            headingLevel="none"
            locale="de-DE"
            currency="EUR"
            defaultRange="12m"
            defaultClasses={["stocks", "etf"]}
            defaultAsset="NWT"
            defaultCompare
            labels={deLabels}
            now={DEMO_NOW}
          />
        </div>
      </Example>

      <Example
        title="Loading, empty and error states"
        description="Your own `load` drives the dashboard. Try a slow network, an empty account and a failed request."
        code={financeStatesCode}
        variant="bare"
        controls={
          <Segmented label="Data state" size="sm" options={stateOptions} value={state} onValueChange={setState} />
        }
      >
        <FinanceDashboard
          headingLevel="none"
          key={state}
          load={financeLoaders[state]}
          defaultLive={false}
          labels={statesLabels}
          now={DEMO_NOW}
        />
      </Example>

      <DemoDataNote
        component="FinanceDashboard"
        item="analytics-demo-finance"
        names={["financeDemoLoader", "financeLiveStep"]}
      />
      <PropsTable of={PROPS.FinanceDashboard} />

      <PropsTable
        title="Data: FinanceData"
        rows={[
          [
            "assets",
            "FinanceAsset[]",
            "",
            "{ symbol, name, class, quantity, price, open24h, spark } per holding or watched asset.",
          ],
          [
            "series",
            "{ time: number; value: number }[]",
            "",
            "Portfolio value over the range, evenly spaced (keep the same count across ranges and the line morphs point for point).",
          ],
          [
            "previous",
            "number[]",
            "",
            "The previous period's values, one per point of series (the dashed Compare line).",
          ],
          [
            "candles",
            "Record<string, Candle[]>",
            "",
            "Candles over the range per symbol: { date, open, high, low, close, volume }.",
          ],
          [
            "transactions",
            "FinanceTransaction[]",
            "",
            "{ id, date, type, symbol, quantity, value, status }, newest first.",
          ],
        ]}
      />

      <KeyboardTable
        rows={[
          [
            "Tab",
            "Moves through the header controls, then the balance chart, candles, allocation, each watchlist row and the transactions table.",
          ],
          ["← / →", "Balance chart: read the value at each point (the big number follows). Alt moves 10 points."],
          ["Shift + ← / →", "Balance chart: measure the move from where you started to the current point."],
          ["Home / End", "Balance chart: first / latest point."],
          ["Escape", "Clears the reading or measurement."],
          ["Enter / Space", "Watchlist row: show that asset's candles."],
          ["+ / − , Shift + ← / →", "Candlestick chart: zoom and pan."],
        ]}
      />

      <A11yNotes>
        <li>
          The balance chart is keyboard-readable and announces each value (and the start and end of a measurement); the
          Table tab lists every point.
        </li>
        <li>
          Watchlist rows are toggle buttons (aria-pressed) whose name says the asset, its price and its 24-hour change;
          the price flash is decorative.
        </li>
        <li>
          Up / down is never color alone: candles are hollow or filled, badges carry arrows and signs, statuses carry
          icons and words.
        </li>
        <li>
          Prices tick visually only (no announcement per tick); the Live switch pauses them, and they stop off-screen
          and in background tabs.
        </li>
        <li>Reduced motion: no rolling digits, flashes, draw-ins or pings; data changes appear at once.</li>
        <li>
          The transactions table scrolls inside its own focusable region with a sticky header, so the page never scrolls
          sideways on phones.
        </li>
      </A11yNotes>

      <PropsTable title="Dashboard kit (analytics-kit.tsx)" rows={kitRows} />
      <PropsTable of={PROPS.Cascade} title="Cascade props" as="h3" />
    </Page>
  );
}
