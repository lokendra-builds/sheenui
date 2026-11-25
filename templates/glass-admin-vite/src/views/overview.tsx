"use client";

import { DashboardStats } from "@/components/sheenui/blocks/dashboard-stats";
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { DonutChart } from "@/components/sheenui/charts/donut-chart";
import { AreaChart } from "@/components/sheenui/charts/line-chart";
import { StackedAreaChart } from "@/components/sheenui/charts/stacked-area-chart";
import { KPIS, planMix, revenueSeries, signupSeries, trafficSeries } from "@/data/overview";
import { ChartCard } from "./chart-card";
import { PageHeader } from "./page-header";

const thousands = (n: number) => `$${n}k`;

export function OverviewView() {
  return (
    <div className="grid gap-4 pb-2">
      <PageHeader title="Overview" description="How the workspace is doing this year. All figures are demo data." />
      <DashboardStats data={KPIS} title="Key metrics" headingLevel={2} currency="USD" locale="en-US" />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Revenue" description="Monthly revenue against last year, in thousands.">
          <AreaChart
            data={revenueSeries}
            index="month"
            series={[{ key: "revenue", label: "This year", compareKey: "previous" }]}
            format={thousands}
            height={260}
            aria-label="Monthly revenue this year against last year"
          />
        </ChartCard>
        <ChartCard title="New customers" description="Sign-ups and cancellations per month.">
          <BarChart
            data={signupSeries}
            index="month"
            series={[
              { key: "signups", label: "Sign-ups" },
              { key: "churned", label: "Cancellations" },
            ]}
            height={260}
            aria-label="Sign-ups and cancellations per month"
          />
        </ChartCard>
        <ChartCard title="Plan mix" description="Active customers by plan.">
          <DonutChart data={planMix} labels={{ center: "Customers" }} aria-label="Active customers by plan" />
        </ChartCard>
        <ChartCard title="Traffic sources" description="Visits per month by channel, in thousands.">
          <StackedAreaChart
            data={trafficSeries}
            index="month"
            series={[
              { key: "organic", label: "Organic", color: 1 },
              { key: "paid", label: "Paid", color: 2 },
              { key: "referral", label: "Referral", color: 3 },
            ]}
            height={260}
            aria-label="Visits per month by channel"
          />
        </ChartCard>
      </div>
    </div>
  );
}
