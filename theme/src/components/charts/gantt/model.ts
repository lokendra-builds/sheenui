import { type LegendItem } from "../chart-parts";
import { clamp, slotColor, type ChartColor, itemAt } from "../chart-utils";
import { type GanttTask, type GanttScale } from "./types";

/* ======================================================================
 * Dates as day numbers (UTC days since 1970), so time zones never shift a task.
 * ====================================================================== */

/** Milliseconds in one day. */
export const DAY_MS = 86_400_000;

/** A date (Date or "YYYY-MM-DD" string, read as a local date) as a day number; null if invalid. */
export function ganttDay(d: Date | string | undefined | null): number | null {
  if (d === undefined || d === null) return null;
  if (d instanceof Date)
    return Number.isNaN(d.getTime()) ? null : Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.trim());
  if (m) return Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS);
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : ganttDay(t);
}

/** The local Date (midnight) of a day number, for Intl formatting. */
export function dateOf(day: number) {
  const u = new Date(day * DAY_MS);
  return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
}

/** The day of the week of a day number (0 is Sunday); 1970-01-01 was a Thursday. */
export const weekday = (day: number) => ((day % 7) + 7 + 4) % 7; // 1970-01-01 was a Thursday
/** The UTC year, month (0-11) and day of the month of a day number. */
export const ymd = (day: number) => {
  const u = new Date(day * DAY_MS);
  return { y: u.getUTCFullYear(), m: u.getUTCMonth(), d: u.getUTCDate() };
};
/** The day number of the first day of month `m` (0-11) of year `y`. */
export const monthStart = (y: number, m: number) => Math.round(Date.UTC(y, m, 1) / DAY_MS);

/** Pixels per day at each zoom (before stretching to fill the width). */
export const PX_PER_DAY: Record<GanttScale, number> = { day: 34, week: 14, month: 4.5 };
/** The zoom levels from the coarsest to the finest. */
export const ORDER: GanttScale[] = ["month", "week", "day"];

/* ======================================================================
 * Model
 * ====================================================================== */

/** A task as a row of the timeline: its dates (day numbers, end exclusive), milestone flag, progress, colour slot and group. */
export type TaskRow = {
  kind: "task";
  key: string;
  index: number;
  task: GanttTask;
  start: number;
  /** Exclusive end day. */
  end: number;
  milestone: boolean;
  progress: number | null;
  color: ChartColor | 0;
  group: string | null;
};
/** A group heading row: the span of its tasks, how many there are and its colour slot. */
export type GroupRow = {
  kind: "group";
  key: string;
  name: string;
  start: number;
  end: number;
  count: number;
  color: ChartColor | 0;
};
/** One row of the timeline: a task or a group. */
export type Row = TaskRow | GroupRow;

/** The colour slot (1-8) of the group at position `i`; 0 (neutral) past the eighth. */
export function slotOf(i: number): ChartColor | 0 {
  return i >= 0 && i < 8 ? ((i + 1) as ChartColor) : 0;
}

/** Turns the tasks of the props into the rows and the dates of the timeline (pure, safe to call on the server). */
export function buildModel(tasks: readonly GanttTask[]) {
  const groups: string[] = [];
  for (const t of tasks) if (t.group && !groups.includes(t.group)) groups.push(t.group);
  const taskRows: TaskRow[] = [];
  tasks.forEach((task, index) => {
    const s = ganttDay(task.start);
    if (s === null) return;
    const milestone = !!task.milestone;
    let e = milestone ? s : (ganttDay(task.end) ?? s);
    let start = s;
    if (e < start) [start, e] = [e, start];
    const groupIndex = task.group ? groups.indexOf(task.group) : -1;
    taskRows.push({
      kind: "task",
      key: task.id,
      index,
      task,
      start,
      end: e + 1,
      milestone,
      progress: typeof task.progress === "number" && Number.isFinite(task.progress) ? clamp(task.progress, 0, 1) : null,
      color: task.color ?? (groupIndex >= 0 ? slotOf(groupIndex) : 1),
      group: task.group ?? null,
    });
  });
  return { taskRows, groups };
}

/** Rounded orthogonal path through `pts` (corner radius r). */
export function roundedPath(pts: [number, number][], r = 5) {
  if (pts.length < 2) return "";
  let d = `M${itemAt(pts, 0)[0]},${itemAt(pts, 0)[1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = itemAt(pts, i - 1);
    const [x, y] = itemAt(pts, i);
    const [nx, ny] = itemAt(pts, i + 1);
    const l1 = Math.hypot(x - px, y - py);
    const l2 = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (rr < 0.5) {
      d += `L${x},${y}`;
      continue;
    }
    const ax = x - ((x - px) / l1) * rr;
    const ay = y - ((y - py) / l1) * rr;
    const bx = x + ((nx - x) / l2) * rr;
    const by = y + ((ny - y) / l2) * rr;
    d += `L${ax.toFixed(1)},${ay.toFixed(1)}Q${x},${y} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const last = itemAt(pts, pts.length - 1);
  return `${d}L${last[0]},${last[1]}`;
}

/** Legend items for a ChartCard: one per group (phase), in its fixed colour slot. */
export function ganttLegend(tasks: readonly GanttTask[]): LegendItem[] {
  const { groups } = buildModel(tasks);
  return groups.map((g, i) => ({ label: g, color: slotColor(slotOf(i)), kind: "rect" as const }));
}
