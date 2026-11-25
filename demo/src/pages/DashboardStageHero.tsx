import { KpiStrip, type KpiItem } from "../../../theme/src/blocks/analytics/kpi";
import { TrendChart, type TrendDatum } from "../../../theme/src/blocks/analytics/trend-chart";
import { useFollow } from "../layout/ShowcaseStage.follow";

/** What a dashboard's hero shows: four KPIs (the first is the hero) and the chart of the picked one. */
export type DashboardKind = "web" | "saas" | "ecommerce" | "product" | "finance";

type Metric = {
  id: string;
  label: string;
  base: number;
  /** The format of the figure, as Intl options. */
  format: Intl.NumberFormatOptions;
  goodWhen?: "up" | "down";
  /** The previous period was this much of the current one (1.08: up 8%, so previous = value / 1.08). */
  change: number;
};

const USD0: Intl.NumberFormatOptions = { style: "currency", currency: "USD", maximumFractionDigits: 0 };
const PCT1: Intl.NumberFormatOptions = { style: "percent", maximumFractionDigits: 1 };
const INT: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };
const ONE: Intl.NumberFormatOptions = { maximumFractionDigits: 1 };
const USD2: Intl.NumberFormatOptions = { style: "currency", currency: "USD" };

const CONFIG: Record<
  DashboardKind,
  { title: string; color: 1 | 2 | 3 | 4 | 5 | 6; metrics: [Metric, Metric, Metric, Metric] }
> = {
  web: {
    title: "Web analytics",
    color: 1,
    metrics: [
      { id: "visitors", label: "Visitors", base: 12640, format: INT, change: 1.09 },
      { id: "views", label: "Page views", base: 38200, format: INT, change: 1.12 },
      { id: "bounce", label: "Bounce rate", base: 0.41, format: PCT1, goodWhen: "down", change: 0.94 },
      { id: "session", label: "Pages per visit", base: 3.4, format: ONE, change: 1.05 },
    ],
  },
  saas: {
    title: "SaaS revenue",
    color: 2,
    metrics: [
      { id: "mrr", label: "MRR", base: 48250, format: USD0, change: 1.07 },
      { id: "customers", label: "Customers", base: 1284, format: INT, change: 1.04 },
      { id: "churn", label: "Churn", base: 0.021, format: PCT1, goodWhen: "down", change: 0.92 },
      { id: "arpa", label: "ARPA", base: 37.6, format: USD2, change: 1.03 },
    ],
  },
  ecommerce: {
    title: "E-commerce",
    color: 3,
    metrics: [
      { id: "revenue", label: "Revenue", base: 21480, format: USD0, change: 1.11 },
      { id: "orders", label: "Orders", base: 612, format: INT, change: 1.08 },
      { id: "conversion", label: "Conversion", base: 0.028, format: PCT1, change: 1.06 },
      { id: "aov", label: "Average order", base: 62.4, format: USD2, change: 1.02 },
    ],
  },
  product: {
    title: "Product usage",
    color: 4,
    metrics: [
      { id: "dau", label: "Daily active", base: 8420, format: INT, change: 1.1 },
      { id: "retention", label: "Week-4 retention", base: 0.38, format: PCT1, change: 1.04 },
      { id: "adoption", label: "Feature adoption", base: 0.57, format: PCT1, change: 1.08 },
      { id: "sessions", label: "Sessions per user", base: 4.6, format: ONE, change: 1.03 },
    ],
  },
  finance: {
    title: "Portfolio",
    color: 5,
    metrics: [
      { id: "value", label: "Portfolio value", base: 128400, format: USD0, change: 1.06 },
      { id: "pnl", label: "Day change", base: 1860, format: USD0, change: 1.2 },
      { id: "cash", label: "Cash", base: 14200, format: USD0, change: 0.97 },
      { id: "yield", label: "Yield", base: 0.043, format: PCT1, change: 1.02 },
    ],
  },
};

/** A smooth, deterministic series (a trend with two waves), so the demo never reads the clock or the random generator. */
const series = (base: number, n: number, seed: number, shift = 0) =>
  Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1);
    const wave = Math.sin(i * 0.9 + seed) * 0.05 + Math.sin(i * 0.31 + seed * 2) * 0.04;
    return base * (0.86 + 0.16 * t + wave + shift);
  });

const COMPACT = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The dashboard's hero as a stage shows it: the KPI strip (as tabs) over the trend chart, built from the dashboard's own
 * parts (`KpiStrip`, `TrendChart`). Step 1 switches to the last 30 days, step 2 picks the second KPI, step 3 turns on Compare.
 */
export function DashboardHero({ kind, step }: { kind: DashboardKind; step: number }) {
  const cfg = CONFIG[kind];
  const days = step >= 1 ? 30 : 7;
  const [picked, setPicked] = useFollow(step >= 2 ? 1 : 0);
  const metric = cfg.metrics[Math.min(3, Math.max(0, picked)) as 0 | 1 | 2 | 3];
  const items: KpiItem[] = cfg.metrics.map((m, k) => {
    const value = series(m.base, days, k + 1).at(-1) ?? m.base;
    return {
      id: m.id,
      label: m.label,
      value,
      previous: value / m.change,
      trend: series(m.base, 12, k + 1),
      format: m.format,
      goodWhen: m.goodWhen,
    };
  });
  const values = series(metric.base, days, picked + 1);
  const before = series(metric.base, days, picked + 1, -0.07);
  const data: TrendDatum[] = values.map((value, i) => ({
    label: days === 7 ? (WEEK[i] ?? String(i + 1)) : String(i + 1),
    long: `Day ${i + 1} of ${days}`,
    value,
    previous: before[i],
  }));
  const format = (n: number) =>
    metric.format.style === "percent"
      ? `${(n * 100).toFixed(1)}%`
      : metric.format.style === "currency"
        ? `$${COMPACT.format(n)}`
        : COMPACT.format(n);
  const range = days === 7 ? "last 7 days" : "last 30 days";
  return (
    <div className="flex w-full flex-col gap-3 p-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p className="text-sm font-semibold text-sheen-fg">{cfg.title}</p>
        <p className="text-xs text-sheen-fg-muted">{range}</p>
      </div>
      <KpiStrip
        items={items}
        compare={step >= 3}
        selected={metric.id}
        onSelect={(id) =>
          setPicked(
            Math.max(
              0,
              cfg.metrics.findIndex((m) => m.id === id),
            ),
          )
        }
      />
      <div className="glass-1 rounded-sheen-xl p-4">
        <TrendChart
          key={days}
          data={data}
          seriesLabel={metric.label}
          aria-label={`${metric.label}, ${range}`}
          color={cfg.color}
          compare={step >= 3}
          height={190}
          format={format}
          locale="en-US"
        />
      </div>
    </div>
  );
}
