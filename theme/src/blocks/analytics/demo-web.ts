import { type AnalyticsLoader, type AnalyticsRange } from "../analytics-kit";
import { CHANNELS, type WebAnalyticsData, type WebAnalyticsPoint, type WebChannel } from "../analytics-web";
import { DEMO_NOW, demoSeries, hashSeed, seededRandom, simulateLatency } from "./demo";
import { rangePoints } from "./data";

const CHANNEL_SHARE: Record<WebChannel, number> = {
  direct: 0.31,
  organic: 0.38,
  referral: 0.14,
  social: 0.11,
  email: 0.06,
};

const BASE_VISITORS: Record<AnalyticsRange, number> = {
  "24h": 540,
  "7d": 12_600,
  "30d": 11_900,
  "90d": 10_800,
  "12m": 318_000,
};

const PAGES: [string, number][] = [
  ["/", 1],
  ["/pricing", 0.44],
  ["/docs/getting-started", 0.37],
  ["/blog/glass-ui-in-2026", 0.3],
  ["/components/charts", 0.25],
  ["/changelog", 0.17],
  ["/docs/theming", 0.13],
  ["/about", 0.08],
  ["/careers", 0.05],
];

const REFERRERS: { name: string; channel: WebChannel; weight: number }[] = [
  { name: "Searchly", channel: "organic", weight: 0.8 },
  { name: "Lookup", channel: "organic", weight: 0.11 },
  { name: "Private search", channel: "organic", weight: 0.09 },
  { name: "news.ycombinator.com", channel: "referral", weight: 0.46 },
  { name: "codehost.example", channel: "referral", weight: 0.37 },
  { name: "producthunt.com", channel: "referral", weight: 0.17 },
  { name: "Short posts", channel: "social", weight: 0.44 },
  { name: "Career network", channel: "social", weight: 0.31 },
  { name: "Forums", channel: "social", weight: 0.25 },
  { name: "Newsletter", channel: "email", weight: 1 },
  { name: "Direct / none", channel: "direct", weight: 1 },
];

const COUNTRIES: [string, number][] = [
  ["US", 0.29],
  ["IN", 0.11],
  ["DE", 0.08],
  ["GB", 0.07],
  ["FR", 0.05],
  ["BR", 0.045],
  ["CA", 0.04],
  ["JP", 0.035],
  ["NL", 0.03],
  ["ES", 0.028],
  ["AU", 0.025],
  ["PL", 0.022],
  ["IT", 0.02],
  ["SE", 0.016],
  ["KR", 0.015],
  ["MX", 0.014],
  ["ID", 0.013],
  ["TR", 0.012],
  ["SG", 0.011],
  ["ZA", 0.009],
  ["NG", 0.008],
  ["AR", 0.008],
  ["CH", 0.008],
  ["IE", 0.007],
  ["NO", 0.006],
  ["DK", 0.006],
  ["FI", 0.005],
  ["AT", 0.006],
  ["BE", 0.007],
  ["PT", 0.006],
  ["CZ", 0.005],
  ["IL", 0.006],
  ["AE", 0.006],
  ["PH", 0.007],
  ["VN", 0.007],
  ["EG", 0.004],
  ["KE", 0.003],
  ["CO", 0.005],
  ["CL", 0.004],
  ["NZ", 0.004],
  ["TH", 0.005],
  ["MY", 0.004],
  ["UA", 0.004],
  ["RO", 0.004],
  ["CN", 0.006],
  ["RU", 0.005],
  ["SA", 0.004],
  ["PK", 0.004],
  ["BD", 0.003],
  ["KZ", 0.002],
  ["IR", 0.002],
  ["DZ", 0.002],
  ["ET", 0.0015],
  ["GH", 0.002],
  ["TZ", 0.0012],
  ["MA", 0.002],
  ["PE", 0.003],
  ["VE", 0.0015],
  ["EC", 0.0015],
  ["BO", 0.001],
  ["GR", 0.003],
  ["HU", 0.003],
  ["BG", 0.002],
  ["RS", 0.002],
  ["HR", 0.0015],
  ["SK", 0.002],
  ["LT", 0.0012],
  ["LV", 0.001],
  ["EE", 0.0012],
  ["IS", 0.0008],
  ["TW", 0.005],
  ["HK", 0.004],
  ["LK", 0.0015],
  ["NP", 0.001],
  ["MM", 0.0008],
  ["KH", 0.0008],
  ["UZ", 0.001],
  ["AO", 0.0008],
  ["CM", 0.0008],
  ["SN", 0.0008],
  ["CI", 0.0008],
  ["UG", 0.0008],
  ["ZM", 0.0006],
  ["MZ", 0.0006],
  ["MN", 0.0004],
  ["PY", 0.0008],
  ["UY", 0.001],
  ["CR", 0.0012],
  ["GT", 0.001],
  ["DO", 0.001],
  ["PA", 0.0008],
  ["CU", 0.0004],
  ["IQ", 0.001],
  ["JO", 0.001],
  ["LB", 0.0008],
  ["QA", 0.0012],
  ["KW", 0.001],
  ["OM", 0.0008],
  ["TN", 0.001],
  ["LY", 0.0004],
  ["SD", 0.0004],
  ["BY", 0.001],
  ["MD", 0.0006],
  ["GE", 0.0008],
  ["AM", 0.0006],
  ["AZ", 0.0008],
  ["MG", 0.0004],
  ["NA", 0.0004],
  ["BW", 0.0004],
  ["ZW", 0.0004],
  ["PG", 0.0003],
  ["AF", 0.0003],
];

/** Demo data for a range and channel filters: the same query always gives the same numbers. */
export function webAnalyticsDemoData(
  range: AnalyticsRange,
  filters: readonly string[] = [],
  locale?: string,
): WebAnalyticsData {
  const active = CHANNELS.filter((c) => filters.includes(c));
  const share = active.length ? active.reduce((s, c) => s + CHANNEL_SHARE[c], 0) : 1;
  const seed = hashSeed("web", range, active.join(","));
  const rand = seededRandom(seed);
  const base = BASE_VISITORS[range] * share;
  const points = rangePoints(range, locale, DEMO_NOW);
  const visitors = demoSeries(range, { seed, base });
  const prevVisitors = demoSeries(range, { seed: seed + 7, base: base * 0.87, growth: 0.1 });
  const ppv = 2.6 + (active.includes("organic") ? 0.5 : 0) - (active.includes("social") ? 0.4 : 0);

  const rows: WebAnalyticsPoint[] = points.map((p, i) => {
    const v = Math.round(visitors[i] ?? 0);
    const pv = Math.round(prevVisitors[i] ?? 0);
    const bounce = 0.36 + rand() * 0.1 + (active.includes("social") ? 0.08 : 0);
    const dur = 150 + rand() * 50 - (active.includes("social") ? 30 : 0);
    return {
      label: p.label,
      long: p.long,
      current: {
        visitors: v,
        pageviews: Math.round(v * (ppv + (rand() - 0.5) * 0.4)),
        bounceRate: bounce,
        duration: dur,
      },
      previous: {
        visitors: pv,
        pageviews: Math.round(pv * (ppv - 0.15 + (rand() - 0.5) * 0.4)),
        bounceRate: bounce + 0.025 + (rand() - 0.5) * 0.03,
        duration: dur - 9 + (rand() - 0.5) * 16,
      },
    };
  });

  const sum = (pick: (r: WebAnalyticsPoint) => number) => rows.reduce((s, r) => s + pick(r), 0);
  const avg = (pick: (r: WebAnalyticsPoint) => number) => (rows.length ? sum(pick) / rows.length : 0);
  // Unique visitors don't add up across days: some come back. Pageviews do.
  const unique = range === "24h" ? 0.92 : range === "7d" ? 0.84 : 0.78;
  const totals = {
    visitors: Math.round(sum((r) => r.current.visitors) * unique),
    pageviews: sum((r) => r.current.pageviews),
    bounceRate: avg((r) => r.current.bounceRate),
    duration: avg((r) => r.current.duration),
  };
  const previousTotals = {
    visitors: Math.round(sum((r) => r.previous?.visitors ?? 0) * unique),
    pageviews: sum((r) => r.previous?.pageviews ?? 0),
    bounceRate: avg((r) => r.previous?.bounceRate ?? 0),
    duration: avg((r) => r.previous?.duration ?? 0),
  };

  const pages = PAGES.map(([name, w]) => ({
    name,
    value: Math.round(totals.visitors * w * 0.62 * (0.92 + rand() * 0.16)),
  }));
  const referrers = REFERRERS.filter((r) => !active.length || active.includes(r.channel)).map((r) => ({
    name: r.name,
    value: Math.round(
      totals.visitors *
        (active.length ? CHANNEL_SHARE[r.channel] / share : CHANNEL_SHARE[r.channel]) *
        r.weight *
        (0.9 + rand() * 0.2),
    ),
  }));
  const countries = COUNTRIES.map(([id, w]) => ({
    id,
    value: Math.round(totals.visitors * w * (0.85 + rand() * 0.3)),
  }));
  const mobile = 0.36 + (active.includes("social") ? 0.18 : 0) + (rand() - 0.5) * 0.04;
  const tablet = 0.05 + rand() * 0.015;
  const devices = [
    { device: "desktop" as const, value: Math.round(totals.visitors * (1 - mobile - tablet)) },
    { device: "mobile" as const, value: Math.round(totals.visitors * mobile) },
    { device: "tablet" as const, value: Math.round(totals.visitors * tablet) },
  ];
  const browsers = [
    ["Chrome", 0.61],
    ["Safari", 0.22],
    ["Edge", 0.07],
    ["Firefox", 0.06],
    ["Arc", 0.025],
    ["Other", 0.015],
  ].map(([name, w]) => ({
    name: name as string,
    value: Math.round(totals.visitors * (w as number) * (0.92 + rand() * 0.16)),
  }));
  const now = Math.round(96 + 64 * share + rand() * 20);
  const realtime = {
    visitors: now,
    pages: PAGES.slice(0, 5).map(([name, w]) => ({ name, value: Math.max(1, Math.round(now * w * 0.45)) })),
    // One minute of past samples at 2 s, wobbling around the live count (fixture texture; real data comes from your API).
    history: Array.from({ length: 30 }, (_, i) =>
      Math.max(
        0,
        Math.round(
          now * (1 + 0.05 * Math.sin(i / 2.6 + (DEMO_NOW - (30 - i) * 2000) / 60_000)) +
            (seededRandom(hashSeed("rt", i))() - 0.5) * 6,
        ),
      ),
    ),
  };
  return { points: rows, totals, previousTotals, pages, referrers, countries, devices, browsers, realtime };
}

/** A live tick: visitors come and go, the current period grows a little. */
export function webLiveStep(prev: WebAnalyticsData, tick: number): WebAnalyticsData {
  const rand = seededRandom(hashSeed("web-live", tick, prev.realtime.visitors));
  const drift = Math.round((rand() - 0.45) * 14);
  const visitors = Math.max(12, prev.realtime.visitors + drift);
  const arrived = Math.max(0, Math.round(visitors * (0.05 + rand() * 0.05)));
  const views = Math.round(arrived * (2.2 + rand()));
  const points = prev.points.slice();
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    points[points.length - 1] = {
      ...lastPoint,
      current: {
        ...lastPoint.current,
        visitors: lastPoint.current.visitors + arrived,
        pageviews: lastPoint.current.pageviews + views,
      },
    };
  }
  const pages = prev.pages.map((p, i) =>
    i < 4 && rand() > 0.45 ? { ...p, value: p.value + Math.round(arrived * (0.5 - i * 0.1) + 1) } : p,
  );
  return {
    ...prev,
    points,
    pages,
    totals: { ...prev.totals, visitors: prev.totals.visitors + arrived, pageviews: prev.totals.pageviews + views },
    realtime: {
      ...prev.realtime,
      visitors,
      pages: prev.realtime.pages.map((p) => ({
        ...p,
        value: Math.max(1, Math.round((p.value * visitors) / Math.max(1, prev.realtime.visitors) + (rand() - 0.5) * 3)),
      })),
    },
  };
}

/** The default loader: demo data after a simulated round-trip. */
export const webAnalyticsDemoLoader: AnalyticsLoader<WebAnalyticsData> = (query, signal) =>
  simulateLatency(signal, () => webAnalyticsDemoData(query.range, query.filters));
