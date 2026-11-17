import { NumberTicker, useToast } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { GanttChart, GanttTable, ganttLegend } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { CHARTS } from "./ChartsMapGanttPages/shared";
import { launchPlan, sprint } from "./ChartsMapGanttPages/gantt-chart";

/** The "Gantt chart" docs page (/charts/gantt): live examples, props and notes. */
export function GanttChartPage() {
  const toast = useToast();
  const done =
    launchPlan.filter((t) => !t.milestone).reduce((s, t) => s + (t.progress ?? 0), 0) /
    launchPlan.filter((t) => !t.milestone).length;
  return (
    <Page
      eyebrow="Chart"
      title="Gantt chart"
      description="A plan on a timeline: bars with progress, finish-to-start dependency arrows, milestones, collapsible phases and a today line. Zoom between days, weeks and months; the timeline scrolls inside its own container, so even a month of days never widens a phone screen."
      source={`${CHARTS}gantt-chart.tsx`}
    >
      <ChartStage label="Gantt chart demo" title="Sprint 14" hue={1} height="21.75rem">
        <GanttChart tasks={sprint} defaultScale="week" today="2026-03-20" aria-label="Sprint 14 plan" />
      </ChartStage>
      <Example
        title="Product launch plan"
        description="Four phases, twelve tasks. Hover a bar: its arrows light up and the tooltip lists dates, progress and what it waits for. Collapse a phase and the rows below glide up. It opens at the zoom that fits the whole plan; switch the zoom and the timeline glides around the date in the middle, and an edge fades while there is more plan beyond it."
        variant="bare"
        code={`
import { ChartCard, ganttLegend, GanttTable, GanttChart, type GanttTask } from "@sheenui/theme";

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
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="Sheen 2.0 launch plan"
          description="Feb – Apr 2026"
          aside={
            <span className="flex flex-col items-end">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                <NumberTicker value={done} format={{ style: "percent", maximumFractionDigits: 0 }} locales="en" />
              </span>
              <span className="text-xs text-sheen-fg-muted">done</span>
            </span>
          }
          legend={ganttLegend(launchPlan)}
          table={<GanttTable tasks={launchPlan} caption="Launch plan tasks" />}
        >
          <GanttChart
            tasks={launchPlan}
            today="2026-03-18"
            aria-label="Sheen 2.0 launch plan, February to April 2026"
          />
        </ChartCard>
      </Example>

      <Example
        title="Sprint, by day"
        description='defaultScale="day" for a two-week sprint: weekends are shaded, today’s date is highlighted in the header and the plan stretches to fill the width. Click a bar (or press Enter on it) to open the task.'
        variant="bare"
        code={`
import { GanttChart, useToast, type GanttTask } from "@sheenui/theme";

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
}`}
      >
        <ChartCard
          title="Sprint 14"
          description="Mar 16 – 27, 2026 (two weeks)"
          table={<GanttTable tasks={sprint} caption="Sprint 14 tasks" />}
        >
          <GanttChart
            tasks={sprint}
            defaultScale="day"
            today="2026-03-20"
            onTaskClick={(task) => toast.info(task.label, task.assignee ? `Owner: ${task.assignee}` : undefined)}
            aria-label="Sprint 14 plan"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.GanttChart} />
      <PropsTable as="h2" title="GanttTable props" of={PROPS.GanttTable} />
      <KeyboardTable
        rows={[
          ["Tab", "The toolbar (Today, then the zoom switch), then the phase toggles, then the timeline (one stop)."],
          ["↑ / ↓", "Previous / next task; it scrolls into view."],
          ["Home / End", "First / last task."],
          ["← / →", "Scroll the timeline by one column (a day, a week or a month)."],
          ["T", "Jump to today."],
          ["+ / −", "Zoom in / out (month → week → day)."],
          ["Enter / Space", "Call onTaskClick for the active task."],
          ["Escape", "Clear the active task."],
        ]}
      />
      <A11yNotes>
        <li>
          The timeline is one focusable figure (role description “Gantt chart”); each keyboard move is announced once:
          name, dates, duration, progress, dependencies and owner.
        </li>
        <li>Phase rows are disclosure buttons with aria-expanded.</li>
        <li>
          Colors follow the phase in a fixed slot; the phase also shows as a dot and a label, never by color alone.
        </li>
        <li>The Table view lists every task with start, end, duration, progress, owner and dependencies.</li>
        <li>Right-to-left pages mirror the timeline: time runs leftwards and the names sit on the right.</li>
        <li>Reduced motion: no cascade, no glides; zoom and scrolling jump.</li>
      </A11yNotes>
    </Page>
  );
}
