Canonical: https://lokendra-builds.github.io/sheenui/charts/gantt

# Gantt Chart for React with Dependencies

URL: https://lokendra-builds.github.io/sheenui/charts/gantt
Sidebar name: Gantt chart

A React Gantt chart with progress bars, finish-to-start dependency arrows, milestones, collapsible phases, a today line and day/week/month zoom. Free, MIT.

What it is: A React Gantt chart puts a plan on a timeline, with progress, dependency arrows, milestones and a today line. Pass tasks as a readonly GanttTask[]: an id, a label, a start and an end day, plus optional progress and dependencies.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/gantt-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Gantt chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{gantt-chart.tsx, calendar-heatmap.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/gantt/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/segmented/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: gantt-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { GanttChart } from "@/components/sheenui/charts/gantt-chart";
import { ganttLegend } from "@/components/sheenui/charts/gantt/model";
import { GanttTable } from "@/components/sheenui/charts/gantt/table";
import { type GanttTask } from "@/components/sheenui/charts/gantt/types";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, GanttChart, ganttLegend, GanttTable, type GanttTask, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | readonly GanttTask[] | required | The tasks: { id, label, start, end?, progress?, dependencies?, milestone?, group?, color?, assignee? }. end is the last day, inclusive; milestone: true marks a single day (and ignores end). |
| scale | GanttScale | optional, no default | Current zoom level of the time axis; pass it with onScaleChange to control it. |
| defaultScale | "auto" \| GanttScale | "auto" | Sets the starting zoom when uncontrolled. |
| onScaleChange | ((scale: GanttScale) => void) | optional, no default | Called with "day", "week" or "month" when the zoom changes (controlled scale). |
| toolbar | boolean | true | Show the Day / Week / Month switch and the Today button. |
| today | string \| Date \| null | the current date | Sets where the today line goes. |
| locale | string | the browser's | Locale of dates, numbers and the first day of the week. |
| labelWidth | number | fits the names, up to a third of the chart | Width of the task-name column in px. |
| collapsible | boolean | true | Lets the person collapse and expand groups. |
| defaultCollapsed | readonly string[] | [] | Groups that start collapsed. |
| onTaskClick | ((task: GanttTask) => void) | optional, no default | Called with a task on click, Enter or Space. |
| emptyState | ReactNode | optional, no default | Shown when there are no tasks. |
| labels | Partial<GanttChartLabels> | defaultGanttChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultGanttChartLabels. All 22 keys of GanttChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## GanttTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<GanttChartLabels> | defaultGanttChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultGanttChartLabels. All 22 keys of GanttChartLabels are listed in the key table under the props table. |
| locale | string | the browser's | Locale of dates, numbers and the first day of the week. |
| tasks | readonly GanttTask[] | required | The tasks: { id, label, start, end?, progress?, dependencies?, milestone?, group?, color?, assignee? }. end is the last day, inclusive; milestone: true marks a single day (and ignores end). |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |
| emptyState | ReactNode | optional, no default | Shown when there are no tasks. |

## Example 1 of 2: Product launch plan

Four phases, twelve tasks. Hover a bar: its arrows light up and the tooltip lists dates, progress and what it waits for. Collapse a phase and the rows below glide up. It opens at the zoom that fits the whole plan; switch the zoom and the timeline glides around the date in the middle, and an edge fades while there is more plan beyond it.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { GanttChart } from "@/components/sheenui/charts/gantt-chart";
import { ganttLegend } from "@/components/sheenui/charts/gantt/model";
import { GanttTable } from "@/components/sheenui/charts/gantt/table";
import { type GanttTask } from "@/components/sheenui/charts/gantt/types";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ganttLegend, GanttTable, GanttChart, type GanttTask } from "@sheenui/theme";

const plan: GanttTask[] = [
  { id: "research", label: "User research", group: "Discovery", start: "2026-02-02", end: "2026-02-13", progress: 1 },
  { id: "scope", label: "Scope sign-off", group: "Discovery", start: "2026-02-20", milestone: true, dependencies: ["research"] },
  { id: "ui", label: "UI design", group: "Design", start: "2026-03-02", end: "2026-03-20", progress: 0.8, dependencies: ["scope"] },
  // …
];

<ChartCard
  title="Launch plan"
  legend={ganttLegend(plan)}
  table={<GanttTable tasks={plan} />}
>
  <GanttChart tasks={plan} today="2026-03-18" aria-label="Product launch plan" />
</ChartCard>
```

## Example 2 of 2: Sprint, by day

defaultScale="day" for a two-week sprint: weekends are shaded, today’s date is highlighted in the header and the plan stretches to fill the width. Click a bar (or press Enter on it) to open the task.

```tsx
import { GanttChart } from "@/components/sheenui/charts/gantt-chart";
import { type GanttTask } from "@/components/sheenui/charts/gantt/types";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { GanttChart, useToast, type GanttTask } from "@sheenui/theme";

const sprint: GanttTask[] = [
  { id: "a", label: "Audit chart tokens", start: "2026-03-16", end: "2026-03-17", progress: 1, assignee: "Ravi" },
  { id: "b", label: "Token cleanup", start: "2026-03-17", end: "2026-03-19", progress: 1, dependencies: ["a"], assignee: "Ravi" },
  { id: "c", label: "Gantt zoom levels", start: "2026-03-18", end: "2026-03-23", progress: 0.5, assignee: "Leo" },
  { id: "d", label: "Cohort grid keyboard", start: "2026-03-19", end: "2026-03-24", progress: 0.3, dependencies: ["b"], assignee: "Aiko" },
  { id: "f", label: "Sprint review", start: "2026-03-26", milestone: true, dependencies: ["c", "d"] },
];

export function Example() {
  const toast = useToast();
  return (
    <GanttChart
      tasks={sprint}
      defaultScale="day"
      today="2026-03-20"
      onTaskClick={(task) => toast.info(task.label)}
      aria-label="Sprint 14 plan"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The toolbar (Today, then the zoom switch), then the phase toggles, then the timeline (one stop). |
| ↑ / ↓ | Previous / next task; it scrolls into view. |
| Home / End | First / last task. |
| ← / → | Scroll the timeline by one column (a day, a week or a month). |
| T | Jump to today. |
| + / − | Zoom in / out (month → week → day). |
| Enter / Space | Call onTaskClick for the active task. |
| Escape | Clear the active task. |

## Accessibility

- The timeline is one focusable figure (role description “Gantt chart”); each keyboard move is announced once: name, dates, duration, progress, dependencies and owner.
- Phase rows are disclosure buttons with aria-expanded.
- Colors follow the phase in a fixed slot; the phase also shows as a dot and a label, never by color alone.
- The Table view lists every task with start, end, duration, progress, owner and dependencies.
- Right-to-left pages mirror the timeline: time runs leftwards and the names sit on the right.
- Reduced motion: no cascade, no glides; zoom and scrolling jump.

## All exports on this page

- GanttChart — Gantt chart: tasks as bars on a timeline, with progress, finish-to-start dependency arrows, milestones, collapsible phases and a today line.
- GanttTable — Every task as a row: phase, start, end, duration, progress, owner and what it waits for.
- defaultGanttChartLabels — The built-in English strings of GanttChart; spread it into your own labels and change what you need.


## When to use the gantt chart

- Use it as a project timeline chart: a plan with tasks as bars on a timeline, progress fills, finish-to-start dependency arrows, milestones and a today line, such as a product launch schedule.
- Group tasks by phase or team: groups become collapsible rows and set the bar color, so a long plan can fold down to its phases for a status meeting.
- Switch between day, week and month zoom with the toolbar, and use scale with onScaleChange when your own control should drive it; it opens at the most detailed zoom that fits the plan.
- Skip it when you only need to show one task's completion, where Progress is enough, or when you need only a due date, where a Calendar or a plain Badge is lighter.
- Pair it with ChartCard and GanttTable for a text view, plus Dialog or Drawer opened from onTaskClick to edit a task.


## Frequently asked questions

### How do I build a Gantt chart in React with dependencies?

Pass tasks, each with a unique id, label and start, plus optional end, progress from 0 to 1, group and assignee. dependencies lists the ids that must finish first, drawn as finish-to-start arrows. A milestone true task marks a single day as a diamond.

### Is the end date inclusive?

Yes. end is the last day, so a task from the 2nd to the 6th covers five days. Date strings like 2026-03-02 are read as local dates and never shifted by time zones. For milestones, end is ignored.

### Which keys work on the timeline?

Tab focuses it. Up and Down move between tasks, Left and Right scroll, mirrored in right-to-left, Home and End jump to the first and last task, T jumps to today, plus and minus zoom, and Escape clears. Enter calls onTaskClick, and toolbar buttons are normal tab stops.

### Does a long plan widen the page on a phone?

No. The task names stay put while the timeline scrolls sideways inside its own container, with an edge fade while more plan lies beyond it. Short plans stretch to fill the width. labelWidth sets the name column width, and today moves or hides the today line.


## Related pages

- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
