import type { ComponentType } from "react";

import { lazyBlock } from "../layout/lazy-block";

/**
 * The docs' dashboards: each template with the demo loader (and live step) from `@sheenui/theme/demo-data` already
 * wired in, as a lazy island. The library's dashboards have no built-in data, so a page that wants sample data says so
 * here, in one place. A page can still pass its own `load` to override the demo one.
 */
function withDemo<P extends { load: unknown }>(
  Dashboard: ComponentType<P>,
  demo: Partial<P>,
): ComponentType<Omit<P, "load"> & Partial<P>> {
  return function DemoDashboard(props) {
    return <Dashboard {...(demo as P)} {...(props as unknown as P)} />;
  };
}

export const WebAnalyticsDashboard = lazyBlock(
  () =>
    Promise.all([
      import("../../../theme/src/blocks/analytics-web"),
      import("../../../theme/src/blocks/analytics/demo-web"),
    ]).then(([m, d]) => withDemo(m.WebAnalyticsDashboard, { load: d.webAnalyticsDemoLoader, liveStep: d.webLiveStep })),
  // Each dashboard is the subject of its page: fetched while the page hydrates, not one idle period later (lazy-block.tsx).
  { minHeight: "60rem", eager: true },
);
export const SaasRevenueDashboard = lazyBlock(
  () =>
    Promise.all([
      import("../../../theme/src/blocks/analytics-saas"),
      import("../../../theme/src/blocks/analytics/demo-saas"),
    ]).then(([m, d]) => withDemo(m.SaasRevenueDashboard, { load: d.saasRevenueDemoLoader, liveStep: d.saasLiveStep })),
  { minHeight: "60rem", eager: true },
);
export const EcommerceDashboard = lazyBlock(
  () =>
    Promise.all([
      import("../../../theme/src/blocks/analytics-ecommerce"),
      import("../../../theme/src/blocks/analytics/demo-ecommerce"),
    ]).then(([m, d]) => withDemo(m.EcommerceDashboard, { load: d.ecommerceDemoLoader, liveStep: d.ecommerceLiveStep })),
  { minHeight: "60rem", eager: true },
);
export const ProductDashboard = lazyBlock(
  () =>
    Promise.all([
      import("../../../theme/src/blocks/analytics-product"),
      import("../../../theme/src/blocks/analytics/demo-product"),
    ]).then(([m, d]) => withDemo(m.ProductDashboard, { load: d.productDemoLoader, liveStep: d.productLiveStep })),
  { minHeight: "60rem", eager: true },
);
export const FinanceDashboard = lazyBlock(
  () =>
    Promise.all([
      import("../../../theme/src/blocks/analytics-finance"),
      import("../../../theme/src/blocks/analytics/demo-finance"),
    ]).then(([m, d]) => withDemo(m.FinanceDashboard, { load: d.financeDemoLoader, liveStep: d.financeLiveStep })),
  { minHeight: "60rem", eager: true },
);
