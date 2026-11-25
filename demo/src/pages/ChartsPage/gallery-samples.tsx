import { type ReactNode } from "react";
import { round } from "./shared-data";

/* ====================================================================================
 * Gallery previews: small deterministic data + one lazy loader per chart.
 * ==================================================================================== */

type Slot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type Series = { key: string; label: string; color?: Slot };

type Tree = { label: string; value?: number; children?: Tree[]; color?: Slot };

/** Previews are laid out on a 520 × 260 stage (scaled to the tile): this is its inner height. */
export const H = 228;

/** Deterministic 0–1 noise (a sine hash): stable demo data without Math.random. */
function noise(i: number, seed = 1) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A roughly bell-shaped sample around `mean` (the sum of three noise values). */
function bell(n: number, mean: number, spread: number, seed: number) {
  return Array.from(
    { length: n },
    (_, i) => Math.round((mean + (noise(i, seed) + noise(i, seed + 7) + noise(i, seed + 13) - 1.5) * spread) * 10) / 10,
  );
}

/** Centers a preview that is smaller than its box (vertically; `row` lays several side by side). */
export function Middle({ children, row = false }: { children: ReactNode; row?: boolean }) {
  return (
    <div
      className={row ? "flex h-full items-center justify-center gap-4" : "flex h-full flex-col justify-center gap-4"}
    >
      {children}
    </div>
  );
}

/* ---------- Formatters (module level: stable identities) ---------- */

export const pct0 = (n: number) => `${Math.round(n)}%`;

export const price0 = (n: number) => n.toFixed(0);

const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

export const formatShortDate = (d: Date) => shortDate.format(d);

/* ======================================================================
 * Demo data: small and deterministic
 * ====================================================================== */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Line / area / step / polar: 12 months. */
export const TREND = MONTHS.map((m, i) => ({
  m,
  a: round(120 + 18 * Math.sin(i / 1.6) + i * 7),
  b: round(84 + 12 * Math.cos(i / 2) + i * 4),
}));

export const TREND_SERIES: Series[] = [
  { key: "a", label: "Revenue", color: 1 },
  { key: "b", label: "Costs", color: 2 },
];

export const AREA_SERIES: Series[] = [{ key: "a", label: "Sessions", color: 1 }];

/* Bar: 5 regions, two years. */
export const REGIONS = [
  { r: "NA", y25: 82, y26: 96 },
  { r: "EU", y25: 74, y26: 81 },
  { r: "APAC", y25: 58, y26: 77 },
  { r: "LATAM", y25: 31, y26: 38 },
  { r: "MEA", y25: 22, y26: 29 },
];

export const YEAR_SERIES: Series[] = [
  { key: "y25", label: "2025", color: 3 },
  { key: "y26", label: "2026", color: 1 },
];

/* Donut / pie. */
export const DONUT = [
  { label: "Web", value: 52 },
  { label: "iOS", value: 31 },
  { label: "Other", value: 17 },
];

export const PIE = [
  { label: "Search", value: 42 },
  { label: "Direct", value: 27 },
  { label: "Social", value: 18 },
  { label: "Email", value: 13 },
];

/* Sparkline / sparkbar. */
export const SPARK = Array.from({ length: 24 }, (_, i) =>
  round(40 + 12 * Math.sin(i / 2.2) + i * 1.4 + noise(i, 2) * 6),
);

export const SPARK_MUTED = Array.from({ length: 24 }, (_, i) =>
  round(60 - 8 * Math.cos(i / 3) - i * 0.8 + noise(i, 4) * 5),
);

export const SPARKBAR = Array.from({ length: 18 }, (_, i) => round(20 + 14 * Math.sin(i / 1.7) + noise(i, 6) * 8));

export const WINLOSS = Array.from({ length: 18 }, (_, i) => (noise(i, 9) > 0.62 ? -1 : noise(i, 11) > 0.9 ? 0 : 1));

/* Bar list. */
export const BAR_LIST = [
  { name: "Searchly", value: 4821 },
  { name: "Direct", value: 2310 },
  { name: "codehost.example", value: 1468 },
  { name: "Hacker News", value: 812 },
];

/* 100% bars: 4 plans, 3 segments. */
export const PLANS = [
  { p: "Free", web: 58, ios: 27, android: 15 },
  { p: "Pro", web: 44, ios: 36, android: 20 },
  { p: "Team", web: 61, ios: 22, android: 17 },
  { p: "Enterprise", web: 72, ios: 18, android: 10 },
];

export const PLATFORM_SERIES: Series[] = [
  { key: "web", label: "Web", color: 1 },
  { key: "ios", label: "iOS", color: 3 },
  { key: "android", label: "Android", color: 5 },
];

/* Stacked area: 12 months, 3 platforms. */
export const STACK = MONTHS.map((m, i) => ({
  m,
  web: round(60 + 10 * Math.sin(i / 2) + i * 3),
  ios: round(30 + 8 * Math.cos(i / 2.4) + i * 2),
  android: round(18 + 6 * Math.sin(i / 1.4 + 1) + i * 1.5),
}));

/* Combo: 10 weeks of orders and their 3-week average. */
const ORDERS = Array.from({ length: 10 }, (_, i) => round(42 + 14 * Math.sin(i / 1.3) + noise(i, 3) * 12));

export const COMBO = ORDERS.map((o, i) => {
  const win = ORDERS.slice(Math.max(0, i - 2), i + 1);
  return { w: `W${i + 1}`, orders: o, avg: round(win.reduce((s, v) => s + v, 0) / win.length) };
});

export const COMBO_SERIES: (Series & { type: "bar" | "line" })[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "avg", label: "3-week avg", color: 2, type: "line" },
];

/* Step line: a price that changes in steps. */
export const STEPS = MONTHS.map((m, i) => ({ m, price: [12, 12, 12, 15, 15, 15, 15, 19, 19, 17, 17, 21][i] ?? 12 }));

export const STEP_SERIES: Series[] = [{ key: "price", label: "Price", color: 4 }];

/* Range area: a forecast with its band from September. */
export const RANGE = MONTHS.map((m, i) => {
  const v = round(100 + 14 * Math.sin(i / 1.8) + i * 4);
  const spread = i < 8 ? 6 : 6 + (i - 7) * 6;
  return { m, v, lo: v - spread, hi: v + spread };
});

export const RANGE_SERIES: (Series & { lower: string; upper: string })[] = [
  { key: "v", label: "Demand", color: 7, lower: "lo", upper: "hi" },
];

/* Scatter / bubble. */
export const SCATTER: { label: string; color: Slot; data: { x: number; y: number }[] }[] = [
  {
    label: "Team A",
    color: 1,
    data: Array.from({ length: 10 }, (_, i) => ({ x: 10 + i * 8 + noise(i, 1) * 6, y: 20 + i * 5 + noise(i, 2) * 14 })),
  },
  {
    label: "Team B",
    color: 2,
    data: Array.from({ length: 10 }, (_, i) => ({ x: 14 + i * 8 + noise(i, 3) * 6, y: 46 + i * 2 + noise(i, 4) * 14 })),
  },
];

export const BUBBLES: { label: string; color: Slot; data: { x: number; y: number; size: number; label: string }[] }[] =
  [
    {
      label: "Markets",
      color: 7,
      data: ["US", "DE", "JP", "BR", "IN", "FR", "MX", "KR"].map((label, i) => ({
        label,
        x: 20 + noise(i, 5) * 70,
        y: 10 + noise(i, 6) * 40,
        size: 4 + noise(i, 7) * 40,
      })),
    },
  ];

/* Waterfall. */
export const WATERFALL: { label: string; value?: number; kind?: "start" | "delta" | "subtotal" | "total" }[] = [
  { label: "Start", value: 120, kind: "start" },
  { label: "New", value: 45 },
  { label: "Upsell", value: 20 },
  { label: "Churn", value: -32 },
  { label: "End", kind: "total" },
];

/* Funnel. */
export const FUNNEL = [
  { label: "Visited", value: 48210 },
  { label: "Signed up", value: 12880 },
  { label: "Paid", value: 3120 },
];

/* Heatmap: weekdays × two-hour slots. */
export const HOURS = Array.from({ length: 12 }, (_, c) => ({ key: `h${c * 2}`, label: String(c * 2) }));

export const HEAT = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, r) => {
  const row: Record<string, string | number> = { day };
  HOURS.forEach((h, c) => {
    row[h.key] = round(6 + 44 * Math.sin((Math.PI * c) / 11) ** 2 * (1 - r * 0.08) + noise(r * 12 + c, 8) * 10);
  });
  return row;
});

/* Calendar heatmap: 18 weeks, Jun 1 – Oct 4 2026. */
export const CAL_START = "2026-06-01";

export const CAL_END = "2026-08-30";

export const CALENDAR = Array.from({ length: 91 }, (_, d) => {
  const date = new Date(Date.UTC(2026, 5, 1 + d));
  const weekday = date.getUTCDay();
  const busy = weekday === 0 || weekday === 6 ? 0.35 : 1;
  return { date: date.toISOString().slice(0, 10), value: round(noise(d, 3) * 9 * busy) };
});

/* Treemap: flat tiles, each in its own slot. */
export const TREEMAP: Tree[] = [
  { label: "Search", value: 42, color: 1 },
  { label: "Direct", value: 27, color: 2 },
  { label: "Social", value: 18, color: 3 },
  { label: "Email", value: 12, color: 4 },
  { label: "Referral", value: 9, color: 5 },
  { label: "Ads", value: 7, color: 6 },
  { label: "Other", value: 4, color: 7 },
];

/* Bullet: one measure against its target and ranges. */
export const BULLET = [
  { label: "Revenue", value: 268, target: 250, ranges: [150, 225, 300] },
  { label: "Profit", value: 22, target: 26, ranges: [15, 22, 30] },
];

/* Radar. */
export const RADAR = [
  { axis: "Speed", a: 82, b: 64 },
  { axis: "Power", a: 70, b: 88 },
  { axis: "Range", a: 58, b: 76 },
  { axis: "Comfort", a: 90, b: 60 },
  { axis: "Safety", a: 76, b: 82 },
  { axis: "Price", a: 64, b: 52 },
];

export const RADAR_SERIES: Series[] = [
  { key: "a", label: "Model A", color: 1 },
  { key: "b", label: "Model B", color: 2 },
];

/*
 * Radial bar: three goals. At size 132 the open quarter holds 4 characters of name next to a
 * 3-character value, so keep names to 4 letters and values under 100% (or the names truncate).
 */
export const RADIAL = [
  { label: "Run", value: 82 },
  { label: "Swim", value: 64 },
  { label: "Bike", value: 45 },
];

/* Gauge bands. */
export const GAUGE_BANDS: { to: number; label: string; tone: "success" | "warning" | "danger" }[] = [
  { to: 50, label: "Poor", tone: "danger" },
  { to: 75, label: "Fair", tone: "warning" },
  { to: 100, label: "Good", tone: "success" },
];

/* Beeswarm: 30 observations in one row, colored by series. */
export const SWARM = bell(30, 48, 46, 21).map((value, i) => ({
  value,
  label: `#${i + 1}`,
  series: i % 3 === 0 ? "b" : "a",
}));

export const SWARM_SERIES: Series[] = [
  { key: "a", label: "Organic", color: 1 },
  { key: "b", label: "Paid", color: 2 },
];

/* Box plot / violin: four groups of 18 values. */
export const BOXES = ["Q1", "Q2", "Q3", "Q4"].map((label, g) => ({
  label,
  values: bell(18, 40 + g * 6, 30 + g * 4, 30 + g),
}));

/* Histogram: 160 latencies. */
export const LATENCIES = bell(160, 220, 180, 41);

/* Ridgeline: four groups of 40 values. */
export const RIDGES = ["Mon", "Tue", "Wed", "Thu"].map((label, g) => ({
  label,
  values: bell(40, 30 + g * 5, 24 + g * 3, 50 + g),
}));

/* Lollipop. */
export const LOLLIPOP = [
  { label: "Oslo", value: 82 },
  { label: "Lima", value: 74 },
  { label: "Pune", value: 69 },
  { label: "Kyiv", value: 57 },
  { label: "Doha", value: 49 },
  { label: "Cork", value: 41 },
];

/* Dumbbell / slope. */
export const DUMBBELL = [
  { label: "Sales", from: 42, to: 61 },
  { label: "Support", from: 58, to: 51 },
  { label: "Product", from: 36, to: 49 },
];

export const SLOPE = [
  { label: "Sales", from: 42, to: 61 },
  { label: "Support", from: 58, to: 51 },
  { label: "Product", from: 36, to: 49 },
  { label: "Ops", from: 50, to: 44 },
];

/* Diverging: a Likert survey and a population pyramid. */
export const LIKERT_LEVELS = [
  { key: "sd", label: "Strongly disagree" },
  { key: "d", label: "Disagree" },
  { key: "n", label: "Neutral" },
  { key: "a", label: "Agree" },
  { key: "sa", label: "Strongly agree" },
];

export const LIKERT = [
  { q: "Easy to use", sd: 6, d: 12, n: 18, a: 40, sa: 24 },
  { q: "Fast", sd: 10, d: 18, n: 24, a: 32, sa: 16 },
  { q: "Good value", sd: 16, d: 22, n: 26, a: 24, sa: 12 },
];

export const PYRAMID_LEVELS = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
];

export const PYRAMID = ["65+", "55–64", "45–54", "35–44", "25–34", "18–24"].map((age, i) => ({
  age,
  men: round(8 + i * 2.4 + noise(i, 12) * 3),
  women: round(9 + i * 2.1 + noise(i, 13) * 3),
}));

/* Candles: 30 daily periods (no volume, so no volume strip). */
export const CANDLES = (() => {
  let prev = 100;
  return Array.from({ length: 30 }, (_, i) => {
    const open = prev;
    const close = Math.round((100 + 8 * Math.sin(i / 4) + i * 0.6 + (noise(i, 14) - 0.5) * 4) * 100) / 100;
    const high = Math.round((Math.max(open, close) + noise(i, 15) * 2.5) * 100) / 100;
    const low = Math.round((Math.min(open, close) - noise(i, 16) * 2.5) * 100) / 100;
    prev = close;
    return { date: Date.UTC(2026, 8, 1 + i), open, high, low, close };
  });
})();

/* Category bar: credit score bands, 300–850. */
export const SCORE_BANDS: { label: string; value: number; color: Slot }[] = [
  { label: "Poor", value: 280, color: 8 },
  { label: "Fair", value: 90, color: 2 },
  { label: "Good", value: 70, color: 4 },
  { label: "Excellent", value: 110, color: 6 },
];

/* Tracker: 30 days of uptime (default statuses: ok / degraded / down). */
export const TRACKER = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  status: i === 11 ? "down" : i === 4 || i === 23 ? "degraded" : "ok",
}));

/* Waffle / pictogram. */
export const WAFFLE = [
  { label: "Mobile", value: 58 },
  { label: "Desktop", value: 31 },
  { label: "Tablet", value: 11 },
];

export const PICTOGRAM = [{ label: "Vaccinated", value: 23 }];

/* Polar area: one series by month. */
export const POLAR_SERIES: Series[] = [{ key: "a", label: "Visits", color: 3 }];

/* Streamgraph: 16 weeks, 4 layers. */
export const STREAM = Array.from({ length: 16 }, (_, i) => ({
  w: `W${i + 1}`,
  rock: round(20 + 12 * Math.sin(i / 2.5)),
  pop: round(26 + 14 * Math.sin(i / 3 + 1.5)),
  jazz: round(12 + 8 * Math.cos(i / 2)),
  folk: round(10 + 9 * Math.sin(i / 1.8 + 3)),
}));

export const STREAM_SERIES: Series[] = [
  { key: "rock", label: "Rock", color: 1 },
  { key: "pop", label: "Pop", color: 2 },
  { key: "jazz", label: "Jazz", color: 3 },
  { key: "folk", label: "Folk", color: 4 },
];

/* Streaming: one live line, sampled from the clock (deterministic for a given time). */
export const CPU_SERIES: Series[] = [{ key: "cpu", label: "CPU", color: 1 }];

export const cpuSource = (time: number) =>
  Math.round((42 + 14 * Math.sin(time / 7000) + 6 * Math.sin(time / 1900)) * 10) / 10;

/* Chord: flows between five regions. */
export const CHORD_GROUPS = [{ id: "EU" }, { id: "US" }, { id: "Asia" }, { id: "LatAm" }, { id: "Africa" }];

export const CHORD_MATRIX = [
  [0, 42, 30, 8, 12],
  [38, 0, 46, 22, 6],
  [26, 40, 0, 10, 9],
  [9, 24, 8, 0, 4],
  [14, 5, 10, 3, 0],
];

/* Sankey: 7 nodes in 3 columns. */
export const SANKEY_NODES = [
  { id: "Search" },
  { id: "Social" },
  { id: "Direct" },
  { id: "Trial" },
  { id: "Bounce", tone: "danger" as const },
  { id: "Paid", tone: "success" as const },
  { id: "Free" },
];

export const SANKEY_LINKS = [
  { source: "Search", target: "Trial", value: 40 },
  { source: "Search", target: "Bounce", value: 25 },
  { source: "Social", target: "Trial", value: 15 },
  { source: "Social", target: "Bounce", value: 20 },
  { source: "Direct", target: "Trial", value: 22 },
  { source: "Direct", target: "Bounce", value: 8 },
  { source: "Trial", target: "Paid", value: 30 },
  { source: "Trial", target: "Free", value: 47 },
];

/* Network: 12 nodes in 3 groups. */
export const NETWORK_GROUPS: { id: string; label: string; color: Slot }[] = [
  { id: "core", label: "Core", color: 1 },
  { id: "web", label: "Web", color: 2 },
  { id: "data", label: "Data", color: 3 },
];

export const NETWORK_NODES = [
  { id: "api", group: "core", value: 8 },
  { id: "auth", group: "core", value: 5 },
  { id: "billing", group: "core", value: 4 },
  { id: "app", group: "web", value: 6 },
  { id: "site", group: "web", value: 3 },
  { id: "docs", group: "web", value: 2 },
  { id: "admin", group: "web", value: 3 },
  { id: "db", group: "data", value: 7 },
  { id: "cache", group: "data", value: 4 },
  { id: "queue", group: "data", value: 4 },
  { id: "search", group: "data", value: 3 },
  { id: "etl", group: "data", value: 2 },
];

export const NETWORK_LINKS = [
  { source: "api", target: "auth" },
  { source: "api", target: "billing" },
  { source: "api", target: "db" },
  { source: "api", target: "cache" },
  { source: "api", target: "queue" },
  { source: "app", target: "api" },
  { source: "site", target: "api" },
  { source: "admin", target: "api" },
  { source: "docs", target: "site" },
  { source: "auth", target: "db" },
  { source: "billing", target: "db" },
  { source: "queue", target: "etl" },
  { source: "etl", target: "search" },
  { source: "search", target: "api" },
  { source: "cache", target: "db" },
];

/* Marimekko: 4 segments × 3 vendors. */
export const MEKKO = [
  { seg: "Enterprise", us: 420, rivalA: 310, rivalB: 120 },
  { seg: "Mid-market", us: 260, rivalA: 180, rivalB: 160 },
  { seg: "SMB", us: 120, rivalA: 90, rivalB: 140 },
  { seg: "Consumer", us: 60, rivalA: 110, rivalB: 70 },
];

export const MEKKO_SERIES: Series[] = [
  { key: "us", label: "Us", color: 1 },
  { key: "rivalA", label: "Rival A", color: 2 },
  { key: "rivalB", label: "Rival B", color: 3 },
];

/* Sunburst: two rings. */
export const SUNBURST: Tree[] = [
  {
    label: "Engineering",
    children: [
      { label: "Platform", value: 14 },
      { label: "Product", value: 22 },
      { label: "Infra", value: 9 },
    ],
  },
  {
    label: "Sales",
    children: [
      { label: "EMEA", value: 12 },
      { label: "Americas", value: 16 },
    ],
  },
  {
    label: "Ops",
    children: [
      { label: "Support", value: 10 },
      { label: "Finance", value: 6 },
      { label: "People", value: 5 },
    ],
  },
];

/* Cohort retention: 5 cohorts × 5 weeks (null = not reached yet). */
export const COHORTS = [
  { cohort: "Jul", size: 980, values: [980, 520, 410, 352, 318] },
  { cohort: "Aug", size: 1120, values: [1120, 610, 470, 402, null] },
  { cohort: "Sep", size: 1200, values: [1200, 640, 470, null, null] },
  { cohort: "Oct", size: 1350, values: [1350, 760, null, null, null] },
  { cohort: "Nov", size: 1100, values: [1100, null, null, null, null] },
];

export const cohortPeriod = (i: number) => `W${i}`;

/* Gantt: four tasks with dependencies. */
export const GANTT = [
  { id: "design", label: "Design", start: "2026-03-02", end: "2026-03-11", progress: 1 },
  { id: "build", label: "Build", start: "2026-03-12", end: "2026-03-27", progress: 0.6, dependencies: ["design"] },
  { id: "test", label: "Test", start: "2026-03-23", end: "2026-04-03", progress: 0.2, dependencies: ["build"] },
  { id: "launch", label: "Launch", start: "2026-04-06", end: "2026-04-08", progress: 0, dependencies: ["test"] },
];

/* World map: 15 countries (alpha-3). */
export const WORLD = [
  { id: "USA", value: 4200 },
  { id: "CAN", value: 820 },
  { id: "MEX", value: 610 },
  { id: "BRA", value: 1300 },
  { id: "ARG", value: 380 },
  { id: "GBR", value: 1500 },
  { id: "DEU", value: 1700 },
  { id: "FRA", value: 1200 },
  { id: "ESP", value: 640 },
  { id: "NGA", value: 290 },
  { id: "ZAF", value: 340 },
  { id: "IND", value: 2100 },
  { id: "CHN", value: 2600 },
  { id: "JPN", value: 1400 },
  { id: "AUS", value: 720 },
];
