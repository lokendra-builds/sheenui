import { dateOf, type TaskRow } from "./model";
import type { GanttChartLabels } from "./types";
import type { ganttFormats } from "./ticks";

/** A whole-number percent formatter in the chart's locale (English when it is unknown). @internal */
export function ganttPercent(locale: string | undefined) {
  try {
    return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  } catch {
    return new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0 });
  }
}

/** The date range of a task: one date for a milestone, a formatted range otherwise. @internal */
export function ganttRangeText(row: TaskRow, fmt: ReturnType<typeof ganttFormats>) {
  if (row.milestone) return fmt.full.format(dateOf(row.start));
  const a = dateOf(row.start);
  const b = dateOf(row.end - 1);
  const f = fmt.full as Intl.DateTimeFormat & { formatRange?: (x: Date, y: Date) => string };
  return typeof f.formatRange === "function" ? f.formatRange(a, b) : `${f.format(a)} – ${f.format(b)}`;
}

/** The spoken and tooltip parts of a task: dates, duration, progress, predecessors and assignee. @internal */
export function describeGanttTask(
  row: TaskRow,
  o: {
    fmt: ReturnType<typeof ganttFormats>;
    labels: GanttChartLabels;
    pct: Intl.NumberFormat;
    byId: Map<string, TaskRow>;
  },
) {
  const { fmt, labels, pct, byId } = o;
  const parts = [ganttRangeText(row, fmt)];
  if (row.milestone) parts.push(labels.milestone);
  else parts.push(labels.duration(row.end - row.start));
  if (row.progress !== null && !row.milestone) parts.push(labels.progress(pct.format(row.progress)));
  const deps = (row.task.dependencies ?? []).map((id) => byId.get(id)?.task.label).filter((n): n is string => !!n);
  if (deps.length) parts.push(labels.after(deps.join(", ")));
  if (row.task.assignee) parts.push(row.task.assignee);
  return parts;
}
