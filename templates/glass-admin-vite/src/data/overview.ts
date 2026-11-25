import type { Stat } from "@/components/sheenui/blocks/dashboard-stats";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const REVENUE = [38, 41, 40, 46, 52, 55, 54, 61, 66, 70, 74, 82];
const PREVIOUS = [30, 31, 34, 35, 38, 41, 42, 45, 47, 51, 53, 56];
const SIGNUPS = [120, 138, 131, 164, 190, 176, 205, 228, 219, 251, 273, 301];
const CHURN = [14, 12, 15, 13, 11, 12, 10, 11, 9, 10, 8, 9];

/** Revenue in thousands, this year against last year. */
export const revenueSeries = MONTHS.map((month, i) => ({
  month,
  revenue: REVENUE[i] ?? 0,
  previous: PREVIOUS[i] ?? 0,
}));

export const signupSeries = MONTHS.map((month, i) => ({
  month,
  signups: SIGNUPS[i] ?? 0,
  churned: CHURN[i] ?? 0,
}));

export const planMix = [
  { label: "Starter", value: 1840 },
  { label: "Pro", value: 1260 },
  { label: "Business", value: 540 },
  { label: "Enterprise", value: 120 },
];

export const trafficSeries = MONTHS.slice(6).map((month, i) => ({
  month,
  organic: [21, 24, 26, 29, 33, 36][i] ?? 0,
  paid: [12, 13, 15, 14, 16, 18][i] ?? 0,
  referral: [6, 7, 7, 9, 10, 12][i] ?? 0,
}));

const trend = (values: number[]) => values.slice(-9);

/** KPI cards per period; the tabs of DashboardStats switch between them. */
export const KPIS: Record<string, Stat[]> = {
  "30d": [
    { label: "Revenue", value: 82400, change: 11.4, trend: trend(REVENUE), format: "currency" },
    { label: "New customers", value: 301, change: 10.2, trend: trend(SIGNUPS) },
    { label: "Active seats", value: 18240, change: 6.8, trend: [15, 15.4, 15.9, 16.3, 16.8, 17.2, 17.6, 17.9, 18.2] },
    { label: "Churn rate", value: 1.9, change: -8.5, trend: trend(CHURN), format: "percent", goodWhen: "down" },
  ],
  "90d": [
    { label: "Revenue", value: 226000, change: 18.9, trend: trend(REVENUE), format: "currency" },
    { label: "New customers", value: 825, change: 14.1, trend: trend(SIGNUPS) },
    { label: "Active seats", value: 18240, change: 12.3, trend: [13, 13.8, 14.5, 15.2, 16, 16.7, 17.4, 17.9, 18.2] },
    { label: "Churn rate", value: 2.1, change: -4.2, trend: trend(CHURN), format: "percent", goodWhen: "down" },
  ],
};
