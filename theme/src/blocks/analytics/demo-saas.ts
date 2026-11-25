import { type CohortRow } from "../../components/charts/cohort-chart";
import { type AnalyticsLoader, type AnalyticsRange } from "../analytics-kit";
import {
  PLANS,
  REGIONS,
  type SaasCustomer,
  type SaasPlan,
  type SaasRegion,
  type SaasRevenueData,
} from "../analytics-saas";
import { DEMO_NOW, hashSeed, seededRandom, simulateLatency } from "./demo";
import { rangePoints } from "./data";

const REGION_SHARE: Record<SaasRegion, number> = { na: 0.46, emea: 0.31, apac: 0.15, latam: 0.08 };

/** End-of-range MRR per plan (all regions) and price per seat-month. */
const PLAN_MRR: Record<SaasPlan, number> = { starter: 41_200, pro: 85_100, business: 62_800, enterprise: 70_300 };

const PLAN_ARPA: Record<SaasPlan, number> = { starter: 29, pro: 99, business: 299, enterprise: 1_850 };

/** Monthly MRR growth of each plan (compounding). */
const PLAN_GROWTH: Record<SaasPlan, number> = { starter: 0.012, pro: 0.024, business: 0.032, enterprise: 0.045 };

const RANGE_MONTHS: Record<AnalyticsRange, number> = { "24h": 1 / 30, "7d": 7 / 30, "30d": 1, "90d": 3, "12m": 12 };

const CUSTOMERS: {
  name: string;
  detail: string;
  plan: SaasPlan;
  mrr: number;
  seats: number;
  since: string;
  region: SaasRegion;
}[] = [
  {
    name: "Northwind Traders",
    detail: "northwind.example",
    plan: "enterprise",
    mrr: 9_800,
    seats: 420,
    since: "2023-03-14",
    region: "na",
  },
  {
    name: "Globex Systems",
    detail: "globex.example",
    plan: "enterprise",
    mrr: 7_450,
    seats: 310,
    since: "2022-11-02",
    region: "emea",
  },
  {
    name: "Initech Cloud",
    detail: "initech.example",
    plan: "enterprise",
    mrr: 6_120,
    seats: 260,
    since: "2024-01-22",
    region: "na",
  },
  {
    name: "Umbrella Health",
    detail: "umbrella.example",
    plan: "business",
    mrr: 4_780,
    seats: 160,
    since: "2024-06-09",
    region: "emea",
  },
  {
    name: "Kaiju Robotics",
    detail: "kaiju.example",
    plan: "enterprise",
    mrr: 4_420,
    seats: 180,
    since: "2025-02-17",
    region: "apac",
  },
  {
    name: "Soylent Foods",
    detail: "soylent.example",
    plan: "business",
    mrr: 3_590,
    seats: 120,
    since: "2023-08-30",
    region: "na",
  },
  {
    name: "Pampas Pay",
    detail: "pampas.example",
    plan: "business",
    mrr: 2_990,
    seats: 100,
    since: "2025-05-05",
    region: "latam",
  },
  {
    name: "Hooli Labs",
    detail: "hooli.example",
    plan: "business",
    mrr: 2_690,
    seats: 90,
    since: "2024-10-12",
    region: "na",
  },
  {
    name: "Sakura Studio",
    detail: "sakura.example",
    plan: "pro",
    mrr: 2_180,
    seats: 22,
    since: "2025-07-01",
    region: "apac",
  },
  {
    name: "Fjord Analytics",
    detail: "fjord.example",
    plan: "pro",
    mrr: 1_980,
    seats: 20,
    since: "2025-01-28",
    region: "emea",
  },
  {
    name: "Andes Mobility",
    detail: "andes.example",
    plan: "pro",
    mrr: 1_580,
    seats: 16,
    since: "2025-09-09",
    region: "latam",
  },
];

/** Demo data for a range and region filters: the same query always gives the same numbers. */
export function saasRevenueDemoData(
  range: AnalyticsRange,
  filters: readonly string[] = [],
  locale?: string,
): SaasRevenueData {
  const active = REGIONS.filter((r) => filters.includes(r));
  const share = active.length ? active.reduce((s, r) => s + REGION_SHARE[r], 0) : 1;
  const seed = hashSeed("saas", range, active.join(","));
  const rand = seededRandom(seed);
  const months = RANGE_MONTHS[range];
  const points = rangePoints(range, locale, DEMO_NOW);
  const n = points.length;

  // Compounding monthly growth per plan, a little texture, ending exactly on today's MRR.
  const series = Object.fromEntries(
    PLANS.map((plan, pi) => {
      const end = PLAN_MRR[plan] * share * (0.97 + rand() * 0.06);
      const r = seededRandom(seed + pi * 31);
      return [
        plan,
        points.map((_, i) => {
          const monthsBack = n <= 1 ? 0 : ((n - 1 - i) / (n - 1)) * months;
          const noise = i === n - 1 ? 1 : 1 + (r() - 0.5) * 0.008;
          return (end / (1 + PLAN_GROWTH[plan]) ** monthsBack) * noise;
        }),
      ];
    }),
  ) as Record<SaasPlan, number[]>;

  const pts = points.map((p, i) => ({
    label: p.label,
    long: p.long,
    mrr: Object.fromEntries(PLANS.map((plan) => [plan, Math.round(series[plan][i] ?? 0)])) as Record<SaasPlan, number>,
  }));
  const total = (i: number) => PLANS.reduce((s, plan) => s + (pts[i]?.mrr[plan] ?? 0), 0);
  const mrrTrend = pts.map((_, i) => total(i));
  const endMrr = mrrTrend[n - 1] ?? 0;
  const startMrr = mrrTrend[0] ?? 0;
  const customersOf = (i: number) => PLANS.reduce((s, plan) => s + (pts[i]?.mrr[plan] ?? 0) / PLAN_ARPA[plan], 0);
  const arpuTrend = pts.map((_, i) => total(i) / Math.max(1, customersOf(i)));
  const churnTrend = pts.map(() => 0.019 + rand() * 0.006);

  const churnRate = churnTrend.reduce((s, v) => s + v, 0) / Math.max(1, n);
  const kpis = { mrr: endMrr, arr: endMrr * 12, churnRate, arpu: arpuTrend[n - 1] ?? 0 };
  const previousKpis = { mrr: startMrr, arr: startMrr * 12, churnRate: churnRate + 0.0024, arpu: arpuTrend[0] ?? 0 };

  // MRR movement: gross churn and contraction come off the starting MRR; new + expansion make up the rest.
  const churn = Math.round(startMrr * churnRate * Math.max(months, 0.25));
  const contraction = Math.round(startMrr * 0.006 * Math.max(months, 0.25));
  const reactivation = Math.round(startMrr * 0.0025 * Math.max(months, 0.25));
  const gained = Math.max(0, endMrr - startMrr + churn + contraction - reactivation);
  const newBusiness = Math.round(gained * 0.61);
  const expansion = Math.round(gained - newBusiness);

  const cohortPeriod: "month" | "week" = range === "12m" || range === "90d" ? "month" : "week";
  const cohortCount = 9;
  const cohorts: CohortRow[] = Array.from({ length: cohortCount }, (_, c) => {
    const date = new Date(points[n - 1]?.date ?? DEMO_NOW);
    if (cohortPeriod === "month") date.setUTCMonth(date.getUTCMonth() - (cohortCount - 1 - c));
    else date.setUTCDate(date.getUTCDate() - 7 * (cohortCount - 1 - c));
    const name = new Intl.DateTimeFormat(
      locale,
      cohortPeriod === "month"
        ? { month: "short", year: "2-digit", timeZone: "UTC" }
        : { month: "short", day: "numeric", timeZone: "UTC" },
    ).format(date);
    const size = Math.round((180 + c * 14 + rand() * 40) * share);
    const periods = cohortCount - c;
    const quality = 0.94 + rand() * 0.1;
    return {
      cohort: name,
      size,
      values: Array.from({ length: periods }, (_, p) =>
        p === 0
          ? size
          : Math.round(size * Math.min(1, (0.52 + 0.48 * Math.exp(-p / 1.9)) * quality * (0.97 + rand() * 0.05))),
      ),
    };
  });

  const customers: SaasCustomer[] = CUSTOMERS.filter((c) => !active.length || active.includes(c.region)).map((c, i) => {
    const mrr = Math.round(c.mrr * (0.96 + rand() * 0.08));
    return {
      id: `c${i}`,
      name: c.name,
      detail: c.detail,
      plan: c.plan,
      mrr,
      previousMrr: Math.round(mrr / (1 + (rand() - 0.25) * 0.18 * Math.min(1, months))),
      seats: c.seats,
      since: c.since,
    };
  });

  return {
    points: pts,
    kpis,
    previousKpis,
    trends: { mrr: mrrTrend, arr: mrrTrend.map((v) => v * 12), churnRate: churnTrend, arpu: arpuTrend },
    movement: { starting: startMrr, newBusiness, expansion, reactivation, contraction, churn },
    cohorts,
    cohortPeriod,
    customers,
  };
}

/** A live tick: a few upgrades and new sign-ups land on the latest point. */
export function saasLiveStep(prev: SaasRevenueData, tick: number): SaasRevenueData {
  const rand = seededRandom(hashSeed("saas-live", tick));
  const plan = PLANS[Math.floor(rand() * PLANS.length)] ?? "pro";
  const added = Math.round(PLAN_ARPA[plan] * (1 + Math.floor(rand() * 3)));
  const points = prev.points.slice();
  const last = points[points.length - 1];
  if (last) points[points.length - 1] = { ...last, mrr: { ...last.mrr, [plan]: last.mrr[plan] + added } };
  const mrr = prev.kpis.mrr + added;
  const trend = (values: number[], value: number) => [...values.slice(0, -1), value];
  return {
    ...prev,
    points,
    kpis: { ...prev.kpis, mrr, arr: mrr * 12, arpu: prev.kpis.arpu * (1 + added / Math.max(1, prev.kpis.mrr) / 4) },
    trends: { ...prev.trends, mrr: trend(prev.trends.mrr, mrr), arr: trend(prev.trends.arr, mrr * 12) },
    movement: { ...prev.movement, newBusiness: prev.movement.newBusiness + added },
  };
}

/** A demo `AnalyticsLoader` that returns `saasRevenueDemoData` for the query after a simulated delay (aborts with the signal); swap it for your own loader. */
export const saasRevenueDemoLoader: AnalyticsLoader<SaasRevenueData> = (query, signal) =>
  simulateLatency(signal, () => saasRevenueDemoData(query.range, query.filters));
