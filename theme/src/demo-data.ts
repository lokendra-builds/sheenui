/**
 * Fixtures for demos, docs and tests: seeded random data, the fixed `DEMO_NOW` clock and a ready-made `load`
 * function for every dashboard template. They are NOT part of the package root (`@sheenui/theme`), so a production
 * bundle only contains them if you import this module on purpose:
 *
 * ```tsx
 * import { WebAnalyticsDashboard } from "@sheenui/theme";
 * import { webAnalyticsDemoLoader, webLiveStep } from "@sheenui/theme/demo-data";
 *
 * <WebAnalyticsDashboard load={webAnalyticsDemoLoader} liveStep={webLiveStep} />;
 * ```
 */
export {
  DEMO_NOW,
  seededRandom,
  hashSeed,
  createRng,
  demoSeries,
  simulateLatency,
  withLatency,
} from "./blocks/analytics/demo";
export { webAnalyticsDemoData, webAnalyticsDemoLoader, webLiveStep } from "./blocks/analytics/demo-web";
export { saasRevenueDemoData, saasRevenueDemoLoader, saasLiveStep } from "./blocks/analytics/demo-saas";
export { ecommerceDemoData, ecommerceDemoLoader, ecommerceLiveStep } from "./blocks/analytics/demo-ecommerce";
export { productDemoData, productDemoLoader, productLiveStep } from "./blocks/analytics/demo-product";
export { financeDemoData, financeDemoLoader, financeLiveStep } from "./blocks/analytics/demo-finance";
