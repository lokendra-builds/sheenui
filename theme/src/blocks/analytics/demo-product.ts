import { type SankeyLink, type SankeyNode } from "../../components/charts/sankey-chart";

import { type CohortRow } from "../../components/charts/cohort-chart";
import { type CalendarDatum } from "../../components/charts/calendar-heatmap";
import { type AnalyticsRange } from "../analytics-kit";
import {
  PLATFORM_SHARE,
  type ProductData,
  type ProductFigure,
  type ProductPlatform,
  type ProductQuery,
  isoDay,
} from "../analytics-product";
import { createRng, hashSeed, withLatency } from "./demo";

const RANGE_DAYS: Record<AnalyticsRange, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90, "12m": 365 };

/** Growth against the previous period, per range (so every range tells a slightly different story). */
const RANGE_GROWTH: Record<AnalyticsRange, number> = {
  "24h": 0.042,
  "7d": 0.068,
  "30d": 0.124,
  "90d": 0.181,
  "12m": 0.64,
};

const TREND_POINTS: Record<AnalyticsRange, number> = { "24h": 24, "7d": 7, "30d": 30, "90d": 13, "12m": 12 };

const FEATURES: { name: string; base: number; mobile: number }[] = [
  { name: "Dashboards", base: 72, mobile: 58 },
  { name: "Search", base: 64, mobile: 71 },
  { name: "Comments", base: 51, mobile: 47 },
  { name: "AI assist", base: 41, mobile: 36 },
  { name: "Integrations", base: 38, mobile: 12 },
  { name: "API keys", base: 22, mobile: 3 },
  { name: "Automations", base: 17, mobile: 9 },
  { name: "Home-screen widgets", base: 4, mobile: 29 },
];

const DAY_MS = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Realistic, deterministic demo data for a query: the same query always gives the same numbers,
 * so screenshots and tests are stable. Replace it with your own `load` (a fetch) in an app.
 */
export function productDemoData({ range, platforms, now, locale }: ProductQuery): ProductData {
  const chosen = platforms.length ? platforms : (Object.keys(PLATFORM_SHARE) as ProductPlatform[]);
  const share = chosen.reduce((s, p) => s + PLATFORM_SHARE[p], 0);
  const mobileShare = chosen.reduce((s, p) => s + (p === "web" ? 0 : PLATFORM_SHARE[p]), 0) / share;
  const rng = createRng(hashSeed(`${range}|${chosen.join(",")}`));
  const jitter = (amount: number) => 1 + rng.normal() * amount;
  const days = RANGE_DAYS[range];
  const growth = RANGE_GROWTH[range] * jitter(0.08);

  // Active users. A 24h range trends by hour (a daily rhythm), the rest by day / week / month.
  const points = TREND_POINTS[range];
  const dauNow = Math.round(12_840 * share * jitter(0.015));
  const trendOf = (end: number, swing: number) =>
    Array.from({ length: points }, (_, i) => {
      const t = points === 1 ? 1 : i / (points - 1);
      const rhythm =
        range === "24h"
          ? 0.55 + 0.45 * Math.sin(((i - 6) / 24) * Math.PI * 2) ** 2
          : range === "7d" || range === "30d"
            ? i % 7 === 5 || i % 7 === 6
              ? 0.82
              : 1
            : 1;
      return Math.round((end / (1 + growth)) * (1 + growth * t) * rhythm * jitter(swing));
    });
  const figure = (value: number, swing: number): ProductFigure => {
    const trend = trendOf(value, swing);
    trend[trend.length - 1] = value;
    return { value, previous: Math.round(value / (1 + growth * jitter(0.1))), trend };
  };
  const dau = figure(dauNow, 0.03);
  const wau = figure(Math.round(dauNow * 2.86 * jitter(0.01)), 0.02);
  const mau = figure(Math.round(dauNow * 7.18 * jitter(0.01)), 0.012);

  // Journey (sankey): sign-ups per period, by source, then through onboarding to activation.
  const scale = (days / 30) * share;
  const v = (base: number) => Math.max(1, Math.round(base * scale * jitter(0.06)));
  const signups = { organic: v(5200), paid: v(3100), referral: v(1900) };
  const total = signups.organic + signups.paid + signups.referral;
  const onboarding = Math.round(total * 0.63 * jitter(0.03));
  const templates = Math.round(total * 0.25 * jitter(0.04));
  const lost = Math.max(1, total - onboarding - templates);
  const onboardActive = Math.round(onboarding * 0.67 * jitter(0.03));
  const templateActive = Math.round(templates * 0.65 * jitter(0.04));
  const nodes: SankeyNode[] = [
    { id: "organic", label: "Organic search", color: 1 },
    { id: "paid", label: "Paid ads", color: 2 },
    { id: "referral", label: "Referral", color: 3 },
    { id: "signup", label: "Signed up", color: 4 },
    { id: "onboarding", label: "Onboarding", color: 5 },
    { id: "templates", label: "Template gallery", color: 6 },
    { id: "activated", label: "Activated", color: 7 },
    { id: "dropped", label: "Dropped off", color: 8 },
  ];
  const links: SankeyLink[] = [
    { source: "organic", target: "signup", value: signups.organic },
    { source: "paid", target: "signup", value: signups.paid },
    { source: "referral", target: "signup", value: signups.referral },
    { source: "signup", target: "onboarding", value: onboarding },
    { source: "signup", target: "templates", value: templates },
    { source: "signup", target: "dropped", value: lost },
    { source: "onboarding", target: "activated", value: onboardActive },
    { source: "onboarding", target: "dropped", value: Math.max(1, onboarding - onboardActive) },
    { source: "templates", target: "activated", value: templateActive },
    { source: "templates", target: "dropped", value: Math.max(1, templates - templateActive) },
  ];

  // Activation funnel: the previous period converts a little worse at each step.
  const visited = v(48_200);
  const steps: [string, number][] = [
    ["Visited the site", 1],
    ["Signed up", 0.212],
    ["Finished onboarding", 0.63],
    ["Created a project", 0.76],
    ["Invited a teammate", 0.47],
    ["Active 3+ days", 0.8],
  ];
  const funnelOf = (start: number, penalty: number) => {
    let n = start;
    return steps.map(([label, rate], i) => {
      n = i === 0 ? n : Math.round(n * Math.min(0.98, rate * (1 - penalty) * jitter(0.025)));
      return { label, value: n };
    });
  };
  const funnel = funnelOf(visited, 0);
  const funnelPrevious = funnelOf(Math.round(visited / (1 + growth * 0.6)), 0.045);

  // Feature adoption: mobile platforms use widgets more and the API far less.
  const adoption = FEATURES.map((f) => ({
    name: f.name,
    value: Math.max(1, Math.min(99, Math.round((f.base * (1 - mobileShare) + f.mobile * mobileShare) * jitter(0.04)))),
  }));

  // Retention cohorts: weekly, or monthly for the 12-month range. Newer cohorts retain a bit better.
  const monthly = range === "12m";
  const cohortCount = range === "90d" || monthly ? 12 : 8;
  const today = startOfDay(now);
  const cohortName = new Intl.DateTimeFormat(
    locale,
    monthly ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" },
  );
  const cohorts: CohortRow[] = Array.from({ length: cohortCount }, (_, c) => {
    const age = cohortCount - 1 - c; // periods this cohort has lived through
    const start = monthly
      ? new Date(today.getFullYear(), today.getMonth() - age, 1)
      : new Date(today.getTime() - (age * 7 + today.getDay()) * DAY_MS);
    const size = Math.round((monthly ? 9_800 : 2_350) * share * (1 + 0.03 * c) * jitter(0.05));
    const floor = (monthly ? 0.21 : 0.18) + 0.004 * c;
    const values = Array.from({ length: age + 1 }, (_, p) =>
      p === 0
        ? size
        : Math.round(size * Math.min(1, (floor + (1 - floor) * Math.exp(-p / (monthly ? 1.4 : 1.7))) * jitter(0.035))),
    );
    return { cohort: cohortName.format(start), size, values };
  });

  // Event volume per day over the last year (whatever the range: a calendar needs a year to show
  // its weekly rhythm): weekday rhythm, a growth trend and three launch-day spikes. Seeded by the
  // platforms only, so switching the range never reshuffles history.
  const calendarDays = 364;
  const eventRng = createRng(hashSeed(`events|${chosen.join(",")}`));
  const events: CalendarDatum[] = Array.from({ length: calendarDays }, (_, i) => {
    const ago = calendarDays - 1 - i;
    const day = new Date(today.getTime() - ago * DAY_MS);
    const weekday = day.getDay();
    const rhythm = weekday === 0 ? 0.5 : weekday === 6 ? 0.56 : 1;
    const trend = 1 - 0.38 * (ago / 365);
    const spike = ago === 11 || ago === 74 || ago === 203 ? 1.7 : 1;
    return {
      date: isoDay(day),
      value: Math.round(18_400 * share * rhythm * trend * spike * (1 + eventRng.normal() * 0.12)),
    };
  });

  return {
    dau,
    wau,
    mau,
    flow: { nodes, links },
    funnel,
    funnelPrevious,
    adoption,
    cohorts,
    cohortUnit: monthly ? "month" : "week",
    events,
    eventsStart: events[0]?.date as string,
    eventsEnd: isoDay(today),
    eventsPerMinute: Math.round(1_284 * share * jitter(0.03)),
  };
}

/** The demo loader: demo data after a short, realistic network delay (so you see the loading states). */
export function productDemoLoader(query: ProductQuery) {
  return withLatency(productDemoData(query), 380);
}

/**
 * One live step: one of the active-user figures and the event rate drift a little (a random walk),
 * the sparkline's last point follows. Only the figures change, so only the KPI strip re-renders.
 */
export function productLiveStep(data: ProductData, tick: number): ProductData {
  const rng = createRng(hashSeed(`live-${tick}-${data.dau.value}`));
  const drift = (f: ProductFigure, amount: number): ProductFigure => {
    const value = Math.max(0, Math.round(f.value * (1 + rng.normal() * amount + amount * 0.35)));
    const trend = f.trend.length ? [...f.trend.slice(0, -1), value] : f.trend;
    return { ...f, value, trend };
  };
  // One figure per tick, in turn (DAU most often): fewer simultaneous rolls, and only the tiles
  // that changed re-render.
  const which = tick % 4;
  return {
    ...data,
    dau: which === 0 || which === 2 ? drift(data.dau, 0.004) : data.dau,
    wau: which === 1 ? drift(data.wau, 0.0015) : data.wau,
    mau: which === 3 ? drift(data.mau, 0.0006) : data.mau,
    eventsPerMinute: Math.max(0, Math.round(data.eventsPerMinute * (1 + rng.normal() * 0.05))),
  };
}
