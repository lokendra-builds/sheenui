/**
 * The analytics building blocks, split by concern under `./analytics/` and re-exported here so the public names
 * and this import path stay stable. Fixtures (the PRNG, `DEMO_NOW`, demo series and loaders) are NOT here: they
 * live in `../demo-data.ts`, which the package root does not export.
 */
export * from "./analytics/data";
export * from "./analytics/labels";
export * from "./analytics/hooks";
export * from "./analytics/glass";
export * from "./analytics/shell";
export * from "./analytics/panel";
export * from "./analytics/kpi";
export * from "./analytics/trend-chart";
export * from "./analytics/stacked-trend-chart";
export * from "./analytics/bar-trend-chart";
