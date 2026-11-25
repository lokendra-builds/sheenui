import { type ReactNode } from "react";

import { ChartValueTable, defaultCompact, MissingValue } from "../heatmap";
import { defaultCohortChartLabels, type CohortChartProps, cohortPercent, cohortModel } from "./parts";

/* ======================================================================
 * Table view
 * ====================================================================== */

/**
 * Props of CohortTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type CohortTableProps = Pick<
  CohortChartProps,
  "data" | "valuesAre" | "periods" | "average" | "format" | "formatPercent" | "locale" | "labels"
> & {
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every cohort as plain text: size, then "41.2% (529)" per period.
 *
 * @example
 * ```tsx
 * import { CohortTable } from "@sheenui/theme";
 *
 * const cohorts = [
 *   { cohort: "Jan 2026", size: 1200, values: [1200, 540, 410, 360] },
 *   { cohort: "Feb 2026", size: 1350, values: [1350, 600, 455, null] },
 * ];
 *
 * export function Example() {
 *   return (
 *     <CohortTable data={cohorts} caption="Retention table" />
 *   );
 * }
 * ```
 *
 * @see /charts/cohort-retention
 */
export function CohortTable({
  data,
  valuesAre,
  periods,
  average = true,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  labels: labelOverrides,
  caption,
  emptyState,
}: CohortTableProps) {
  const labels = { ...defaultCohortChartLabels, ...labelOverrides };
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? cohortPercent(locale);
  const { rows, periods: n } = cohortModel(data, valuesAre, periods, average);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: labels.cohort },
        { label: labels.count },
        ...Array.from({ length: n }, (_, p) => ({ label: labels.period(p) })),
      ]}
      rows={rows.map((row) => [
        row.average ? `${labels.average} (${labels.averageNote.toLocaleLowerCase()})` : row.name,
        format(row.size),
        ...row.cells.map((c) =>
          c.ratio === null ? <MissingValue label={labels.notYet} /> : `${pct(c.ratio)} (${format(c.count ?? 0)})`,
        ),
      ])}
    />
  );
}
