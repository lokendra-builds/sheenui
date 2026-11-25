"use client";

import { SaasRevenueDashboard } from "@/components/sheenui/blocks/analytics-saas";
import { saasLiveStep, saasRevenueDemoLoader } from "@/components/sheenui/blocks/analytics/demo-saas";

/**
 * SheenUI's own SaaS revenue dashboard, as it is on the docs site. It loads its numbers through
 * `load`; swap `saasRevenueDemoLoader` for a function that calls your API and returns a
 * `SaasRevenueData`.
 */
export function AnalyticsView() {
  return (
    <div className="pb-2">
      <SaasRevenueDashboard
        load={saasRevenueDemoLoader}
        liveStep={saasLiveStep}
        product="Lumen Console"
        headingLevel={1}
        defaultRange="12m"
      />
    </div>
  );
}
