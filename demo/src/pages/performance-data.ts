/*
 * Numbers shown on /docs/performance. Each block says where it came from.
 *
 * Provenance:
 *   - BUDGET_CLASSES: the class budgets in demo/scripts/lib/budget-classes.mjs, which `pnpm budget` enforces (exit 0 only
 *     when every route is inside its class). The measured columns are the per-class min / median / max of a `pnpm budget`
 *     run on the 25 Nov 2026 build with 190 routes (gzip KB; the initial column from the module graph, the fetched column
 *     measured in Chromium 5 s after load). They were not re-run on the deployed build.
 *   - ROUTE_ROWS, LIGHTHOUSE_ROWS, INTERACTION_ROWS, OTHER_METRICS: measured on 25 Nov 2026 against the deployed site,
 *     median of 5 cold loads per route (Lighthouse: median of 3). Raw results are kept outside the repo as
 *     load.json (page loads), inter.json (interactions) and lighthouse-summary.json plus the 27 per-run reports.
 */

/** When the lab numbers below were recorded. */
export const MEASURED_ON = "25 Nov 2026";

/** The kind of machine, the build and the throttling the numbers came from. */
export const MEASURED_ON_MACHINE =
  "a Linux desktop (Ubuntu 24.04, AMD Ryzen 9 9950X, 32 threads, 60 GB RAM; load average 1.1 to 3.7 during the runs, none above 4) running Chromium 159.0.8154.6 (Playwright build, headless), against the deployed site at lokendra-builds.github.io/sheenui, which GitHub Pages serves through its CDN with gzip or brotli compression";

/** The throttling profile, applied through the Chrome DevTools Protocol. */
export const THROTTLING =
  "CPU slowed 4x (Emulation.setCPUThrottlingRate 4) and a slow-4G network (Network.emulateNetworkConditions: 150 ms latency, 1638.4 kbit/s down, 750 kbit/s up) on a 390 by 844 px phone viewport at 3x pixel ratio, a new browser context for every load";

export type BudgetClassRow = {
  name: string;
  routes: string;
  initialBudget: number;
  initial: string;
  fetchedBudget: string;
  fetched: string;
};

/** The enforced budgets (KB gzip) next to the last `pnpm budget` run (25 Nov 2026 build, 190 routes). */
export const BUDGET_CLASSES: BudgetClassRow[] = [
  { name: "Home", routes: "1", initialBudget: 135, initial: "133.0", fetchedBudget: "280", fetched: "270.3" },
  {
    name: "Plain docs, foundations and guides",
    routes: "22",
    initialBudget: 190,
    initial: "144.0 / 155.8 / 189.0",
    fetchedBudget: "270 (one page at 465)",
    fetched: "232.6 / 251.4 / 374.3",
  },
  {
    name: "Example, popup or form page",
    routes: "117",
    initialBudget: 210,
    initial: "131.8 / 194.2 / 207.7",
    fetchedBudget: "390 (six pages held between 425 and 490)",
    fetched: "231.8 / 280.8 / 475.8",
  },
  {
    name: "Chart page",
    routes: "50",
    initialBudget: 250,
    initial: "132.4 / 228.0 / 244.5",
    fetchedBudget: "360 (the gallery at 470)",
    fetched: "278.2 / 301.1 / 402.1",
  },
];

export type RouteRow = {
  route: string;
  lcp: string;
  cls: string;
  tbt: string;
  longest: string;
  jsInitial: string;
  jsTotal: string;
};

/** Per-route median of 5 cold loads on the deployed site (390 px, 4x CPU, slow 4G); longest task shows median (worst run). */
export const ROUTE_ROWS: RouteRow[] = [
  { route: "Home", lcp: "0.98", cls: "0.0006", tbt: "5", longest: "64 (85)", jsInitial: "141", jsTotal: "319" },
  {
    route: "Button (component)",
    lcp: "0.86",
    cls: "0.0008",
    tbt: "0",
    longest: "59 (77)",
    jsInitial: "200",
    jsTotal: "307",
  },
  { route: "Data table", lcp: "1.34", cls: "0", tbt: "33", longest: "83 (145)", jsInitial: "210", jsTotal: "443" },
  { route: "Line chart", lcp: "0.96", cls: "0", tbt: "0", longest: "61 (89)", jsInitial: "238", jsTotal: "345" },
  { route: "Chart gallery", lcp: "1.10", cls: "0", tbt: "67", longest: "74 (87)", jsInitial: "228", jsTotal: "441" },
  { route: "Chat thread", lcp: "1.22", cls: "0", tbt: "63", longest: "116 (146)", jsInitial: "213", jsTotal: "461" },
  {
    route: "Guide (backdrop-filter performance)",
    lcp: "0.78",
    cls: "0.0001",
    tbt: "0",
    longest: "64 (78)",
    jsInitial: "166",
    jsTotal: "295",
  },
  {
    route: "Web analytics dashboard",
    lcp: "1.45",
    cls: "0",
    tbt: "0",
    longest: "132 (180)",
    jsInitial: "215",
    jsTotal: "420",
  },
  { route: "SaaS dashboard", lcp: "1.22", cls: "0", tbt: "0", longest: "124 (144)", jsInitial: "211", jsTotal: "399" },
];

export type LighthouseRow = { route: string; score: string; tbt: string };

/** Lighthouse 13.6.0 mobile Performance score and Total Blocking Time, median of 3 runs on the default look. */
export const LIGHTHOUSE_ROWS: LighthouseRow[] = [
  { route: "Home", score: "100", tbt: "9" },
  { route: "Button (component)", score: "100", tbt: "10" },
  { route: "Data table", score: "99", tbt: "109" },
  { route: "Line chart", score: "100", tbt: "4" },
  { route: "Chart gallery", score: "100", tbt: "9" },
  { route: "Chat thread", score: "100", tbt: "72" },
  { route: "Guide (backdrop-filter performance)", score: "94", tbt: "10" },
  { route: "Web analytics dashboard", score: "99", tbt: "88" },
  { route: "SaaS dashboard", score: "100", tbt: "26" },
];

export type InteractionRow = { interaction: string; route: string; median: string; runs: string };

/** Event to the first frame that shows the opened popup, 1440 px viewport, 4x CPU, median of 5 (the 5 runs listed). */
export const INTERACTION_ROWS: InteractionRow[] = [
  { interaction: "Open a dropdown menu", route: "/overlays/dropdown-menu", median: "91", runs: "87 to 121" },
  { interaction: "Open a popover", route: "/components/popover", median: "60", runs: "59 to 65" },
  { interaction: "Open a dialog", route: "/components/dialog", median: "51", runs: "49 to 62" },
  { interaction: "Open the side drawer", route: "/overlays/drawer", median: "57", runs: "53 to 70" },
];

export type MetricRow = { metric: string; target: string; result: string; met: string };

/** The other lab metrics, with the target each is held to and whether the run met it. */
export const OTHER_METRICS: MetricRow[] = [
  {
    metric: "Largest Contentful Paint (4x CPU, slow 4G)",
    target: "2.5 s or less",
    result: "Medians 0.78 to 1.45 s across the 9 routes; the slowest single load was 2.39 s",
    met: "Yes",
  },
  {
    metric: "Lighthouse Largest Contentful Paint, guide page",
    target: "2.5 s or less",
    result: "Median 2.9 s (runs 2.0, 2.9 and 3.1 s), which gives the 94 score; the other 8 routes score 99 or 100",
    met: "No",
  },
  {
    metric: "Cumulative Layout Shift (load plus 5 s)",
    target: "0.05 or less",
    result: "0 to 0.0008 in every median; the largest single load was 0.0008",
    met: "Yes",
  },
  {
    metric: "Interaction latency at 4x CPU",
    target: "under 200 ms",
    result: "Medians 51 to 91 ms; the slowest single interaction was 121 ms (dropdown menu)",
    met: "Yes",
  },
  {
    metric: "Longest task while loading (4x CPU, 390 px)",
    target: "50 ms or less where achievable",
    result:
      "All 9 routes still show a task over 50 ms. The median longest task ranges from 59 to 132 ms; 3 routes (chat thread, SaaS dashboard, web analytics dashboard) are over 100 ms; the worst single load was 180 ms",
    met: "No",
  },
];
