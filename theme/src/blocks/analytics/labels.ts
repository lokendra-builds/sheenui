import { type AnalyticsRange } from "./data";

/* ====================================================================================
 * Labels
 * ==================================================================================== */

/** Every string the shared frame shows or announces (each dashboard extends it). */
export type AnalyticsLabels = {
  /** Accessible name of the time-range control. */
  range: string;
  /** Short text on each range segment. */
  ranges: Record<AnalyticsRange, string>;
  /** Accessible name of each range segment, announced after its short text ("7d, Last 7 days"; a name that already contains the short text is used as is). */
  rangeNames: Record<AnalyticsRange, string>;
  /** Accessible name of the filter chips group. */
  filters: string;
  /** Pressed state of a chip, appended for screen readers in forced colours (also a ✓). */
  live: string;
  /** Accessible description of the Live toggle. */
  liveDescription: string;
  compare: string;
  compareDescription: string;
  export: string;
  /** Announced (and shown briefly) after an export. */
  exported: string;
  /** Announced while new data loads. */
  loading: string;
  /** Announced when new data has arrived. */
  loaded: string;
  /** Chart / Table switch on every panel. */
  chart: string;
  table: string;
  viewAs: (title: string) => string;
  /** KPI delta for screen readers: "Up 12.4% vs previous period" ("flat": no change). */
  change: (direction: "up" | "down" | "flat", amount: string) => string;
  noChange: string;
  /** Sets the accessible name of the KPI strip. */
  kpis: string;
  /** Under a KPI when Compare is on: "vs 42.9K". */
  vsPrevious: (value: string) => string;
  /** Tooltip / table name of the previous-period series. */
  previousPeriod: string;
  /** Tooltip row of the change between the periods. */
  changeLabel: string;
  /** Appended to a chart's accessible name. */
  chartInstructions: string;
  /** Docked readout hint on touch screens. */
  touchHint: string;
  noData: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  emptyTitle: string;
  emptyDescription: string;
};

/** The English `AnalyticsLabels` every dashboard starts from; spread it and override the strings you translate. */
export const defaultAnalyticsLabels: AnalyticsLabels = {
  range: "Time range",
  ranges: { "24h": "24h", "7d": "7d", "30d": "30d", "90d": "90d", "12m": "12m" },
  rangeNames: {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "12m": "Last 12 months",
  },
  filters: "Filters",
  live: "Live",
  liveDescription: "Update the numbers in real time",
  compare: "Compare",
  compareDescription: "Compare with the previous period",
  export: "Export",
  exported: "CSV downloaded",
  loading: "Loading new data…",
  loaded: "Dashboard updated",
  chart: "Chart",
  table: "Table",
  viewAs: (title) => `${title}: view as`,
  change: (direction, amount) =>
    direction === "flat"
      ? "No change vs previous period"
      : `${direction === "up" ? "Up" : "Down"} ${amount.replace(/^[+−-]/, "")} vs previous period`,
  noChange: "No change vs previous period",
  kpis: "Key metrics",
  vsPrevious: (value) => `vs ${value} before`,
  previousPeriod: "Previous period",
  changeLabel: "Change",
  chartInstructions: "Use the left and right arrow keys to read values.",
  touchHint: "Touch and drag to read values",
  noData: "No data",
  errorTitle: "Couldn't load the dashboard",
  errorDescription: "The data source didn't answer. Check your connection and try again.",
  retry: "Try again",
  emptyTitle: "No data for this view",
  emptyDescription:
    "Nothing was recorded in this time range with these filters. Try a longer range or clear the filters.",
};

/** Merge partial labels over defaults (one level deep for the range maps). */
export function mergeLabels<T extends AnalyticsLabels>(base: T, partial?: Partial<T>): T {
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    ranges: { ...base.ranges, ...partial.ranges },
    rangeNames: { ...base.rangeNames, ...partial.rangeNames },
  };
}

/* ====================================================================================
 * Aliases (the names the product and finance dashboards were first written against)
 * ==================================================================================== */

/** Alias of `AnalyticsLabels`, the name the product and finance dashboards were first written against. */
export type DashboardLabels = AnalyticsLabels;

/** Alias of `defaultAnalyticsLabels`. */
export const defaultDashboardLabels: DashboardLabels = defaultAnalyticsLabels;

/** Merge partial label overrides over the defaults. */
export const mergeDashboardLabels = (overrides?: Partial<DashboardLabels>) =>
  mergeLabels(defaultAnalyticsLabels, overrides);
