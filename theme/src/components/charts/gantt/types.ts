import { type ReactNode } from "react";
import { type ChartColor, type ChartInstructions } from "../chart-utils";

/* ======================================================================
 * Types
 * ====================================================================== */

/**
 * One task of a GanttChart: id, label, start and end, and optionally progress, dependencies,
 * milestone, group, colour and assignee.
 */
export type GanttTask = {
  /** Unique id, used by `dependencies`. */
  id: string;
  label: string;
  /** First day ("2026-03-02" is read as a local date, never shifted by time zones). */
  start: Date | string;
  /** Last day, inclusive (a task from the 2nd to the 6th covers 5 days). Ignored for milestones. */
  end?: Date | string;
  /** Share done, 0–1. */
  progress?: number;
  /** Ids of the tasks that must finish first (finish-to-start arrows). */
  dependencies?: readonly string[];
  /** A single-day marker (a diamond) instead of a bar. */
  milestone?: boolean;
  /** Phase or team: tasks are grouped under it (collapsible), and coloured by it. */
  group?: string;
  /** Colour slot 1–8. Default: the group's slot (in order of first appearance), else 1. */
  color?: ChartColor;
  /** Owner, shown in the tooltip and the table. */
  assignee?: string;
};

/** The time scale of a GanttChart: `day`, `week` or `month`. */
export type GanttScale = "day" | "week" | "month";

/**
 * Every string GanttChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type GanttChartLabels = {
  /** Appended to the timeline's accessible name. */
  instructions: ChartInstructions;
  roleDescription: string;
  /** The today line's label and the "jump to today" button. */
  today: string;
  /** Accessible name of the zoom switch, and its options. */
  scaleLabel: string;
  day: string;
  week: string;
  month: string;
  /** Header of the task-name column. */
  task: string;
  duration: (days: number) => string;
  /** Tooltip line for progress; `percent` is pre-formatted. */
  progress: (percent: string) => string;
  /** Tooltip line listing the tasks this one waits for. */
  after: (names: string) => string;
  milestone: string;
  /** Second part of a group row: how many tasks it holds. */
  tasks: (n: number) => string;
  /** Shown in the readout band of a narrow touch chart while nothing is being read. */
  hint: string;
  /** Table headers. */
  group: string;
  start: string;
  end: string;
  days: string;
  owner: string;
  dependsOn: string;
  done: string;
  /** Read for an empty table cell (no phase, owner, progress or dependency). */
  none: string;
};

/**
 * The built-in English strings of GanttChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultGanttChartLabels: GanttChartLabels = {
  instructions:
    "Use the up and down arrow keys to move between tasks, left and right to scroll the timeline, Home and End for the first and last task, T for today, plus and minus to zoom.",
  roleDescription: "Gantt chart",
  today: "Today",
  scaleLabel: "Timeline zoom",
  day: "Day",
  week: "Week",
  month: "Month",
  task: "Task",
  duration: (n) => (n === 1 ? "1 day" : `${n} days`),
  progress: (p) => `${p} done`,
  after: (names) => `After ${names}`,
  milestone: "Milestone",
  tasks: (n) => (n === 1 ? "1 task" : `${n} tasks`),
  hint: "Tap a bar for details",
  group: "Phase",
  start: "Start",
  end: "End",
  days: "Days",
  owner: "Owner",
  dependsOn: "Depends on",
  done: "Done",
  none: "None",
};

/**
 * Props of GanttChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type GanttChartProps = {
  /** The tasks: { id, label, start, end?, progress?, dependencies?, milestone?, group?, color?, assignee? }. `end` is the last day, inclusive; `milestone: true` marks a single day (and ignores `end`). */
  tasks: readonly GanttTask[];
  /** Current zoom level of the time axis; pass it with `onScaleChange` to control it. */
  scale?: GanttScale;
  /**
   * Sets the starting zoom when uncontrolled. Default "auto": the most detailed zoom at which the whole plan
   * fits the width (month when none does), so the first view never hides part of the plan.
   */
  defaultScale?: GanttScale | "auto";
  /** Called with "day", "week" or "month" when the zoom changes (controlled `scale`). */
  onScaleChange?: (scale: GanttScale) => void;
  /** Show the Day / Week / Month switch and the Today button. Default true. */
  toolbar?: boolean;
  /** Sets where the today line goes. Default: the current date; null hides it. */
  today?: Date | string | null;
  /** Locale of dates, numbers and the first day of the week. Default: the browser's. */
  locale?: string;
  /** Width of the task-name column in px. Default: fits the names, up to a third of the chart. */
  labelWidth?: number;
  /** Lets the person collapse and expand groups. Default true. */
  collapsible?: boolean;
  /** Groups that start collapsed. */
  defaultCollapsed?: readonly string[];
  /** Called with a task on click, Enter or Space. */
  onTaskClick?: (task: GanttTask) => void;
  /** Shown when there are no tasks. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<GanttChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};
