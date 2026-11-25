import { formatCompact, type ChartSeries, type LegendItem } from "@sheenui/theme";
import type { ChartAnnotation } from "@sheenui/theme";
import { PREVIOUS_SERIES_KEY } from "@sheenui/theme";
import { type CompareSeries } from "@sheenui/theme";

/* ====================================================================================
 * Demo data (deterministic)
 * ==================================================================================== */

export const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const revenue = months.map((month, i) => ({
  month,
  organic: Math.round(42000 + i * 3100 + Math.sin(i * 1.3) * 4200),
  paid: Math.round(28000 + i * 1900 + Math.cos(i * 0.9) * 3600),
  referral: Math.round(12000 + i * 1300 + Math.sin(i * 0.7 + 1) * 2200),
  organicPrev: Math.round(36000 + i * 2500 + Math.sin(i * 1.1 + 0.6) * 3600),
}));

export const revenueSeries: CompareSeries[] = [
  { key: "organic", label: "Organic", color: 1, compareKey: "organicPrev" },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];

export const users = months.map((month, i) => ({ month, users: Math.round(8200 + i * 640 + Math.sin(i * 1.1) * 900) }));

export const funnel = months.map((month, i) => ({
  month,
  signups: Math.round(1800 + i * 120 + Math.sin(i) * 260),
  activated: Math.round(1100 + i * 90 + Math.cos(i * 1.4) * 180),
  signupsPrev: Math.round(1600 + i * 100 + Math.sin(i + 0.8) * 240),
}));

export const funnelSeries: CompareSeries[] = [
  { key: "signups", label: "Signups", color: 1, compareKey: "signupsPrev" },
  { key: "activated", label: "Activated", color: 3 },
];

export const plans = months.map((month, i) => ({
  month,
  free: Math.round(5200 + i * 260),
  pro: Math.round(1900 + i * 210 + Math.sin(i) * 120),
  team: Math.round(620 + i * 95),
}));

export const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 7 },
  { key: "pro", label: "Pro", color: 1 },
  { key: "team", label: "Team", color: 3 },
];

export const countries = [
  { country: "India", visitors: 48200 },
  { country: "United States", visitors: 31650 },
  { country: "Germany", visitors: 14980 },
  { country: "United Kingdom", visitors: 12400 },
  { country: "Brazil", visitors: 9300 },
  { country: "Japan", visitors: 7120 },
];

export const countrySeries: ChartSeries[] = [{ key: "visitors", label: "Visitors", color: 1 }];

export const traffic = [
  { label: "Organic search", value: 41200, color: 1 as const },
  { label: "Direct", value: 22800, color: 2 as const },
  { label: "Social", value: 15400, color: 3 as const },
  { label: "Referral", value: 9600, color: 4 as const },
  { label: "Email", value: 6100, color: 5 as const },
];

export const usd = (n: number) => `$${formatCompact(n)}`;

export const percent1 = (n: number) => `${n.toFixed(1)}%`;

export const ranges = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
] as const;

export type Range = (typeof ranges)[number]["value"];

/** Deterministic 0–1 noise (a sine hash). */
export function hash(i: number, seed = 1) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- 120 days of store data for the featured dashboard ---------- */

const DAY_MS = 86_400_000;

const FIRST_DAY = Date.UTC(2026, 5, 4);

const dayFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

export const DAILY = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(FIRST_DAY + i * DAY_MS);
  const weekday = date.getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 0.82 : 1;
  const sale = i >= 88 && i <= 94 ? 1.32 : 1; // the "Labor Day sale" week (inside the default brush window)
  const organic = Math.round((5200 + i * 22 + Math.sin(i / 6.5) * 640 + hash(i, 2) * 520) * weekend * sale);
  const paid = Math.round((3100 + i * 11 + Math.cos(i / 8) * 460 + hash(i, 3) * 380) * weekend * (sale > 1 ? 1.5 : 1));
  const organicPrev = Math.round((4500 + i * 16 + Math.sin(i / 7 + 0.6) * 560 + hash(i, 5) * 420) * weekend);
  const paidPrev = Math.round((2800 + i * 8 + Math.cos(i / 8.5 + 0.4) * 400 + hash(i, 6) * 300) * weekend);
  const orders = Math.round((organic + paid) / 48 + hash(i, 7) * 14);
  const ordersPrev = Math.round((organicPrev + paidPrev) / 50 + hash(i, 8) * 12);
  const conversion = Math.round((2.4 + Math.sin(i / 10) * 0.35 + hash(i, 9) * 0.3 + (sale > 1 ? 0.6 : 0)) * 100) / 100;
  return { day: dayFormat.format(date), organic, paid, organicPrev, paidPrev, orders, ordersPrev, conversion };
});

export const dailySeries: CompareSeries[] = [
  { key: "organic", label: "Organic", color: 1, compareKey: "organicPrev" },
  { key: "paid", label: "Paid", color: 7, compareKey: "paidPrev" },
];

export const orderSeries: CompareSeries[] = [{ key: "orders", label: "Orders", color: 3, compareKey: "ordersPrev" }];

export const conversionSeries: ChartSeries[] = [{ key: "conversion", label: "Conversion", color: 5 }];

export const heroAnnotations: ChartAnnotation[] = [
  { type: "line", value: 12000, label: "Daily target $12K", tone: "accent" },
  { type: "range", from: DAILY[88]?.day ?? "", to: DAILY[94]?.day ?? "", label: "Labor Day sale", tone: "success" },
  { type: "event", at: DAILY[96]?.day ?? "", label: "v3 launch", tone: "warning" },
];

export const conversionAnnotations: ChartAnnotation[] = [
  { type: "band", from: 2, to: 3, label: "Healthy", tone: "success" },
];

export const previousLegend: LegendItem = {
  label: "Previous period",
  color: "var(--sheen-fg-subtle)",
  kind: "line",
  dashed: true,
  key: PREVIOUS_SERIES_KEY,
};

// Stable format options for the KPI tickers (a new object per render would re-measure them).
export const usd0: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
};

export const plainFormat: Intl.NumberFormatOptions = {};

export const wholeUsdFormat: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
};

export const percentFormat: Intl.NumberFormatOptions = { style: "percent", maximumFractionDigits: 2 };

export const round = (n: number) => Math.round(n);
