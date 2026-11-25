import { type ReactNode } from "react";
import { ChartValueTable, MissingValue } from "../heatmap";
import { defaultGanttChartLabels, type GanttChartProps } from "./types";
import { dateOf, buildModel } from "./model";

/* ======================================================================
 * Table view
 * ====================================================================== */

/**
 * Props of GanttTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type GanttTableProps = Pick<GanttChartProps, "tasks" | "locale" | "labels"> & {
  /** Sets a visually hidden caption that names the table. */
  caption?: string;
  /** Shown when there are no tasks. */
  emptyState?: ReactNode;
};

/**
 * Every task as a row: phase, start, end, duration, progress, owner and what it waits for.
 *
 * Props: the chart's `tasks`, `locale` and `labels`, plus `caption` (hidden, names the table) and `emptyState`. A real table: each task's phase, start, end, duration, progress, owner and what it waits for. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { GanttTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <GanttTable tasks={[{ id: "design", label: "Design", start: "2026-03-02", end: "2026-03-11", progress: 1 }]} caption="Project plan" />
 *   );
 * }
 * ```
 *
 * @see /charts/gantt
 */
export function GanttTable({ tasks, locale, labels: labelOverrides, caption, emptyState }: GanttTableProps) {
  const labels = { ...defaultGanttChartLabels, ...labelOverrides };
  const { taskRows, groups } = buildModel(tasks);
  const byId = new Map(taskRows.map((t) => [t.task.id, t.task.label]));
  let date: Intl.DateTimeFormat;
  let pct: Intl.NumberFormat;
  try {
    date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
    pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  } catch {
    date = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });
    pct = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0 });
  }
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: labels.task },
        ...(groups.length ? [{ label: labels.group, align: "start" as const }] : []),
        { label: labels.start, align: "start" },
        { label: labels.end, align: "start" },
        { label: labels.days },
        { label: labels.done },
        { label: labels.owner, align: "start" },
        { label: labels.dependsOn, align: "start" },
      ]}
      rows={taskRows.map((t) => [
        t.task.label,
        ...(groups.length ? [t.group ?? <MissingValue label={labels.none} />] : []),
        date.format(dateOf(t.start)),
        t.milestone ? labels.milestone : date.format(dateOf(t.end - 1)),
        t.milestone ? "0" : String(t.end - t.start),
        t.progress === null || t.milestone ? <MissingValue label={labels.none} /> : pct.format(t.progress),
        t.task.assignee ?? <MissingValue label={labels.none} />,
        (t.task.dependencies ?? [])
          .map((id) => byId.get(id))
          .filter(Boolean)
          .join(", ") || <MissingValue label={labels.none} />,
      ])}
    />
  );
}
