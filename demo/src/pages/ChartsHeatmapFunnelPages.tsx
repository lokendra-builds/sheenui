import { seeded } from "../demo-utils";
import { useMemo, useState } from "react";
import { formatCompact, useToast, type ChartRow } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import { Segmented } from "../layout/Segmented";
import { Heatmap, HeatmapTable, type HeatmapColumn } from "@sheenui/theme";
import { CalendarHeatmap, CalendarHeatmapTable, type CalendarDatum } from "@sheenui/theme";
import { FunnelChart, FunnelTable, type FunnelStage } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ControlLabel, Controls } from "./ChartsHeatmapFunnelPages/shared";

/* ====================================================================== */
/* Demo data (deterministic, so screenshots and SSR match)                 */
/* ====================================================================== */

const pct = (n: number) => `${Math.round(n)}%`;

/* ---------- Heatmap ---------- */

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hourColumns: HeatmapColumn[] = Array.from({ length: 24 }, (_, h) => ({
  key: `h${h}`,
  label: String(h).padStart(2, "0"),
}));

function sessionsByHour(seed: number): ChartRow[] {
  const rand = seeded(seed);
  return weekdays.map((day, d) => {
    const row: ChartRow = { day };
    const weekend = d >= 5;
    for (let h = 0; h < 24; h++) {
      // Two daily peaks (late morning, mid afternoon); quieter weekends and nights.
      const curve =
        Math.exp(-((h - 10.5) ** 2) / 8) * 0.9 +
        Math.exp(-((h - 15) ** 2) / 10) +
        Math.exp(-((h - 21) ** 2) / 6) * (weekend ? 0.9 : 0.35);
      row[`h${h}`] = Math.round((curve * (weekend ? 520 : 1180) + 40) * (0.82 + rand() * 0.36));
    }
    return row;
  });
}

const cohortColumns: HeatmapColumn[] = Array.from({ length: 6 }, (_, m) => ({ key: `m${m}`, label: `Month ${m}` }));

const cohorts: ChartRow[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => {
  const rand = seeded(40 + i);
  const row: ChartRow = { cohort: `${month} 2026` };
  let kept = 100;
  for (let m = 0; m < 6 - i; m++) {
    row[`m${m}`] = Math.round(kept);
    kept *= m === 0 ? 0.52 + rand() * 0.1 : 0.78 + rand() * 0.1;
  }
  return row; // later months are missing (not yet happened): drawn hatched, never as 0
});

/* ---------- Calendar ---------- */

function contributions(year: number, seed: number): CalendarDatum[] {
  const rand = seeded(seed);
  const out: CalendarDatum[] = [];
  const start = Date.UTC(year, 0, 1);
  // Up to "yesterday" in the demo's timeline (2026-10-28), so the calendar never shows future activity.
  const days = Math.min(Date.UTC(year + 1, 0, 1), Date.UTC(2026, 9, 29)) / 86_400_000 - start / 86_400_000;
  let streak = 0;
  for (let i = 0; i < days; i++) {
    const date = new Date(start + i * 86_400_000);
    const weekday = date.getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    // Bursty activity: streaks of busy days, quiet weekends, a holiday lull in August.
    streak = rand() < 0.12 ? Math.floor(rand() * 9) : Math.max(0, streak - 1);
    const lull = date.getUTCMonth() === 7 && date.getUTCDate() > 8 && date.getUTCDate() < 24;
    const base = lull ? 0.08 : weekend ? 0.3 : 0.78;
    const value = rand() < base ? Math.round((1 + rand() * 6 + streak * 1.6) * (weekend ? 0.6 : 1)) : 0;
    if (value > 0) out.push({ date: date.toISOString().slice(0, 10), value });
  }
  return out;
}

/** The demo's "today": data runs up to here, and the days after it are drawn as not yet happened. */
const DEMO_TODAY = "2026-10-28";

/* ====================================================================== */
/* Heatmap                                                                 */
/* ====================================================================== */

export function HeatmapPage() {
  const [week, setWeek] = useState<"this" | "last">("this");
  const sessions = useMemo(() => sessionsByHour(week === "this" ? 7 : 11), [week]);

  return (
    <Page
      eyebrow="Chart"
      title="Heatmap"
      description="A category × category grid on a single-hue sequential scale: light to dark for more. Every cell has a tooltip on hover, tap and keyboard focus, the scale legend marks the value you're reading, and missing values are hatched instead of passing for zero."
      source="theme/src/components/charts/heatmap.tsx"
    >
      <ChartStage label="Heatmap demo" title="Sessions by hour" hue={1} height="14.9375rem" narrowHeight="13.625rem">
        <div className="overflow-x-auto">
          <Heatmap
            data={sessionsByHour(7)}
            index="day"
            columns={hourColumns}
            legendLabel="Sessions"
            aria-label="Sessions by weekday and hour"
          />
        </div>
      </ChartStage>
      <Example
        title="Activity by hour"
        description="24 columns stay readable on a phone: columns shrink to 12px, then the grid scrolls sideways inside the card while the day labels stay put. Focus the grid and use the arrow keys; Home and End jump along a row."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Week</ControlLabel>
            <Segmented
              label="Week shown in the heatmap"
              size="sm"
              options={[
                { value: "this", label: "This week" },
                { value: "last", label: "Last week" },
              ]}
              value={week}
              onValueChange={setWeek}
            />
          </Controls>
        }
        code={`
import { ChartCard, HeatmapTable, Heatmap, type ChartRow, type HeatmapColumn } from "@sheenui/theme";

const hours: HeatmapColumn[] = Array.from({ length: 24 }, (_, h) => ({ key: \`h\${h}\`, label: String(h).padStart(2, "0") }));

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const data: ChartRow[] = days.map((day, d) => {
  const row: ChartRow = { day };
  for (let h = 0; h < 24; h++) row[\`h\${h}\`] = Math.round(40 + 600 * Math.exp(-((h - 11) ** 2) / 14) * (d >= 5 ? 0.5 : 1));
  return row;
});

export function Example() {
  return (
    <ChartCard
      title="Sessions by hour"
      description="Local time"
      table={<HeatmapTable data={data} index="day" indexLabel="Day" columns={hours} />}
    >
      <Heatmap
        data={data}
        index="day"
        columns={hours}
        legendLabel="Sessions"
        aria-label="Sessions by weekday and hour"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by hour"
          description="Local time, per weekday"
          table={
            <HeatmapTable
              data={sessions}
              index="day"
              indexLabel="Day"
              columns={hourColumns}
              caption="Sessions by weekday and hour"
            />
          }
        >
          <Heatmap
            data={sessions}
            index="day"
            columns={hourColumns}
            legendLabel="Sessions"
            aria-label="Sessions by weekday and hour"
          />
        </ChartCard>
      </Example>

      <Example
        title="Cohort retention, classed"
        description="Five classes instead of a continuous ramp, with values printed inside the cells that fit them: black or white, whichever contrasts more with that cell. Months that haven't happened yet are missing, so they're hatched."
        variant="bare"
        code={`
import { Heatmap, type ChartRow, type HeatmapColumn } from "@sheenui/theme";

const months: HeatmapColumn[] = [0, 1, 2, 3].map((m) => ({ key: \`m\${m}\`, label: \`Month \${m}\` }));

// Later months are missing (not yet happened): drawn hatched, never as 0.
const cohorts: ChartRow[] = [
  { cohort: "Jan 2026", m0: 100, m1: 57, m2: 44, m3: 36 },
  { cohort: "Feb 2026", m0: 100, m1: 54, m2: 41 },
  { cohort: "Mar 2026", m0: 100, m1: 59 },
  { cohort: "Apr 2026", m0: 100 },
];

export function Example() {
  return (
    <Heatmap
      data={cohorts}
      index="cohort"
      columns={months}
      domain={[0, 100]}
      steps={5}
      showValues
      color={7}
      format={(n) => \`\${n}%\`}
      legendLabel="Retained"
      aria-label="Share of each signup cohort still active, by month"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Cohort retention"
          description="Share of each signup cohort still active"
          table={
            <HeatmapTable
              data={cohorts}
              index="cohort"
              indexLabel="Cohort"
              columns={cohortColumns}
              format={pct}
              caption="Cohort retention table"
            />
          }
        >
          <Heatmap
            data={cohorts}
            index="cohort"
            columns={cohortColumns}
            domain={[0, 100]}
            steps={5}
            showValues
            color={7}
            format={pct}
            legendLabel="Retained"
            aria-label="Share of each signup cohort still active, by month"
          />
        </ChartCard>
      </Example>

      <PropsTable title="Heatmap" of={PROPS.Heatmap} />
      <PropsTable as="h3" title="HeatmapTable" of={PROPS.HeatmapTable} />
      <PropsTable of={PROPS.ChartTip} title="ChartTip props" as="h3" />
      <PropsTable of={PROPS.ChartValueTable} title="ChartValueTable props" as="h3" />
      <PropsTable of={PROPS.MissingValue} title="MissingValue props" as="h3" />
      <PropsTable of={PROPS.SequentialLegend} title="SequentialLegend props" as="h3" />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the grid."],
          ["↑ / ↓ / ← / →", "Move between cells."],
          ["Home / End", "First / last cell of the row."],
          ["Ctrl + Home / Ctrl + End", "Top-left / bottom-right corner."],
          ["Page Up / Page Down", "Top / bottom of the column."],
          ["Enter / Space", "Activate the cell being read, when onCellClick is set."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The grid is a focusable figure named by its aria-label and described by the reading hint (“Use the arrow keys to move between cells; Home and End jump along a row.”).",
          "Missing values are hatched, never painted as zero, and every cell's value is in the tooltip and the table view.",
          "On narrow screens the grid scrolls sideways inside its own focusable container while the row labels stay put.",
          "For a non-visual reading, give ChartCard's table prop a HeatmapTable; the Chart / Table tabs then expose each value as plain table cells.",
          "Reduced motion: the cells appear at their final colors and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Calendar heatmap                                                        */
/* ====================================================================== */

export function CalendarHeatmapPage() {
  const [year, setYear] = useState<"2025" | "2026">("2026");
  const [locale, setLocale] = useState<"en-US" | "en-GB" | "ar-EG">("en-US");
  const data = useMemo(() => contributions(Number(year), Number(year)), [year]);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Page
      eyebrow="Chart"
      title="Calendar heatmap"
      description="A GitHub-style contribution calendar: a column per week, a row per weekday and a cell per day on sequential steps. The week starts where the reader's locale starts it, month and weekday names come from Intl, and all date maths is done in whole days, so time zones and daylight saving never shift a day."
      source="theme/src/components/charts/calendar-heatmap.tsx"
    >
      <ChartStage
        label="Calendar heatmap demo"
        title="Contributions"
        hue={1}
        height="11.125rem"
        narrowHeight="8.0625rem"
      >
        <div className="overflow-x-auto">
          <CalendarHeatmap
            data={contributions(2026, 2026)}
            cellSize={20}
            start="2026-05-01"
            end="2026-10-31"
            today={DEMO_TODAY}
            locale="en-US"
            valueLabel="contributions"
            aria-label="Contributions per day, May to October 2026"
          />
        </div>
      </ChartStage>
      <Example
        title="Contributions in a year"
        description="Switch the year to see the days cross-fade to their new levels. Days after today are outlined, never painted as zero. On a phone the weeks scroll sideways inside the card (the weekday names stay put), opening on the latest week. Arrow keys move by day and week, Page Up / Page Down by month."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Year</ControlLabel>
            <Segmented
              label="Year shown in the calendar"
              size="sm"
              options={[
                { value: "2025", label: "2025" },
                { value: "2026", label: "2026" },
              ]}
              value={year}
              onValueChange={setYear}
            />
            <ControlLabel>Week starts</ControlLabel>
            <Segmented
              label="Locale of the calendar"
              size="sm"
              options={[
                { value: "en-US", label: "en-US (Sun)" },
                { value: "en-GB", label: "en-GB (Mon)" },
                { value: "ar-EG", label: "ar-EG (Sat)" },
              ]}
              value={locale}
              onValueChange={setLocale}
            />
          </Controls>
        }
        code={`
import { ChartCard, formatCompact, CalendarHeatmapTable, CalendarHeatmap, type CalendarDatum } from "@sheenui/theme";

const data: CalendarDatum[] = [
  { date: "2026-03-04", value: 12 },
  { date: "2026-03-05", value: 4 },
  { date: "2026-03-09", value: 7 },
  { date: "2026-06-18", value: 15 },
  { date: "2026-09-02", value: 2 },
];
const total = data.reduce((sum, d) => sum + d.value, 0);

export function Example() {
  return (
    <ChartCard
      title="Contributions"
      aside={<span className="text-2xl font-semibold">{formatCompact(total)}</span>}
      table={<CalendarHeatmapTable data={data} year={2026} />}
    >
      <CalendarHeatmap
        data={data}
        year={2026}
        today="2026-10-28" // default: the current date; later days are outlined
        locale="en-GB" // week starts on Monday; month & weekday names from Intl
        valueLabel="contributions"
        aria-label="Contributions per day in 2026"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Contributions"
          description={`${year}, ${locale}`}
          aside={
            <span className="text-2xl font-semibold tracking-tight">
              {formatCompact(total)} <span className="text-sm font-normal">in total</span>
            </span>
          }
          table={
            <CalendarHeatmapTable
              data={data}
              year={Number(year)}
              today={DEMO_TODAY}
              locale={locale}
              caption={`Contributions per day in ${year}`}
            />
          }
        >
          <CalendarHeatmap
            data={data}
            year={Number(year)}
            today={DEMO_TODAY}
            locale={locale}
            valueLabel="contributions"
            aria-label={`Contributions per day in ${year}`}
          />
        </ChartCard>
      </Example>

      <Example
        title="Rolling year, own levels"
        description="Without a year it shows the 365 days up to the latest entry. Thresholds set where each level starts; a different hue keeps a second calendar on the page distinct."
        variant="bare"
        code={`
import { CalendarHeatmap, type CalendarDatum } from "@sheenui/theme";

const workouts: CalendarDatum[] = [
  { date: "2026-01-06", value: 5 },
  { date: "2026-02-14", value: 10 },
  { date: "2026-05-21", value: 3 },
  { date: "2026-08-09", value: 8 },
  { date: "2026-10-02", value: 6 },
];

export function Example() {
  return (
    <CalendarHeatmap
      data={workouts}
      color={3}
      levels={3}
      thresholds={[4, 8]} // level 1: 1–3, level 2: 4–7, level 3: 8+
      valueLabel="km"
      aria-label="Kilometres run per day, last 12 months"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Running"
          description="Kilometres per day, last 12 months"
          table={<CalendarHeatmapTable data={runs} today={DEMO_TODAY} caption="Kilometres run per day" />}
        >
          <CalendarHeatmap
            data={runs}
            today={DEMO_TODAY}
            color={3}
            levels={3}
            thresholds={[4, 8]}
            valueLabel="km"
            aria-label="Kilometres run per day, last 12 months"
          />
        </ChartCard>
      </Example>

      <PropsTable title="CalendarHeatmap" of={PROPS.CalendarHeatmap} />
      <PropsTable as="h3" title="CalendarHeatmapTable" of={PROPS.CalendarHeatmapTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the calendar (the scroller is the focusable chart)."],
          ["↑ / ↓", "Previous / next day."],
          ["← / →", "Previous / next week."],
          ["Page Up / Page Down", "Previous / next month."],
          ["Home / End", "Jump to the first / last day."],
          ["Enter / Space", "Activate the day being read, when onDayClick is set."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The calendar is a focusable figure named by its aria-label and described by the reading hint; the keyboard keeps the day being read in view while the weeks scroll sideways on narrow screens.",
          "Days that have not happened yet are outlined, never painted as zero, and every day has a text value in its tooltip and in the table view.",
          "CalendarHeatmapTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "With reduced motion on, the day cells start at their final colors and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

const runs: CalendarDatum[] = (() => {
  const rand = seeded(99);
  const out: CalendarDatum[] = [];
  const end = Date.UTC(2026, 9, 28);
  for (let i = 0; i < 365; i++) {
    const date = new Date(end - i * 86_400_000);
    const weekday = date.getUTCDay();
    if (rand() < (weekday === 0 ? 0.85 : weekday === 3 || weekday === 5 ? 0.6 : 0.2)) {
      out.push({ date: date.toISOString().slice(0, 10), value: Math.round((weekday === 0 ? 9 : 3) + rand() * 6) });
    }
  }
  return out;
})();

/* ====================================================================== */
/* Funnel                                                                  */
/* ====================================================================== */

const funnels: Record<"oct" | "sep", FunnelStage[]> = {
  oct: [
    { label: "Visited site", value: 48210 },
    { label: "Viewed pricing", value: 21904 },
    { label: "Started trial", value: 8412 },
    { label: "Activated", value: 5108 },
    { label: "Subscribed", value: 1964 },
  ],
  sep: [
    { label: "Visited site", value: 41380 },
    { label: "Viewed pricing", value: 16021 },
    { label: "Started trial", value: 6930 },
    { label: "Activated", value: 3517 },
    { label: "Subscribed", value: 1402 },
  ],
};

const checkout: FunnelStage[] = [
  { label: "Cart", value: 9240 },
  { label: "Shipping details", value: 6875 },
  { label: "Payment", value: 5012 },
  { label: "Order placed", value: 4386 },
];

/** The "Funnel chart" docs page (/charts/funnel-chart): live examples, props and notes. */
const FunnelPatterns = lazyBlock(() => import("./ChartPatternsDemos").then((m) => m.FunnelPatternsDemo), {
  minHeight: "14rem",
});

export function FunnelChartPage() {
  const toast = useToast();
  const [month, setMonth] = useState<"oct" | "sep">("oct");
  const [align, setAlign] = useState<"center" | "start">("center");
  const data = funnels[month];
  const rate = (data[data.length - 1]?.value ?? 0) / ((data[0]?.value ?? 0) || 1);

  return (
    <Page
      eyebrow="Chart"
      title="Funnel chart"
      description="Stages of a process as bars that narrow with each step. Between every pair of stages it says how many continued and how many dropped off, so the reading never depends on bar width or color alone. Stages step through one hue, an ordinal ramp, because their order is the point."
      source="theme/src/components/charts/funnel-chart.tsx"
    >
      <ChartStage label="Funnel chart demo" title="Signup funnel" hue={1} height="20.5rem" narrowHeight="25.625rem">
        <FunnelChart data={funnels.oct} aria-label="Signup funnel, October" />
      </ChartStage>
      <Example
        title="Conversion, stage by stage"
        description="Centered bars read as a funnel; start-aligned bars are easier to compare by length. Switch the month to see the bars resize with a transform-only layout animation while the steps morph with them. Focus the chart and use the up and down arrow keys; on a phone the reading docks above the stages."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Month</ControlLabel>
            <Segmented
              label="Month shown in the funnel"
              size="sm"
              options={[
                { value: "oct", label: "October" },
                { value: "sep", label: "September" },
              ]}
              value={month}
              onValueChange={setMonth}
            />
            <ControlLabel>Align</ControlLabel>
            <Segmented
              label="Bar alignment"
              size="sm"
              options={[
                { value: "center", label: "Center" },
                { value: "start", label: "Start" },
              ]}
              value={align}
              onValueChange={setAlign}
            />
          </Controls>
        }
        code={`
import { ChartCard, formatPercent, FunnelTable, FunnelChart, type FunnelStage } from "@sheenui/theme";

const stages: FunnelStage[] = [
  { label: "Visited site", value: 48210 },
  { label: "Viewed pricing", value: 21904 },
  { label: "Started trial", value: 8412 },
  { label: "Activated", value: 5108 },
  { label: "Subscribed", value: 1964 },
];
const rate = (stages[stages.length - 1]?.value ?? 0) / (stages[0]?.value || 1);

export function Example() {
  return (
    <ChartCard
      title="Signup funnel"
      aside={<span className="text-2xl font-semibold">{formatPercent(rate)}</span>}
      table={<FunnelTable data={stages} />}
    >
      <FunnelChart data={stages} align="center" aria-label="Signup funnel, October" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Signup funnel"
          description={month === "oct" ? "October 2026, all channels" : "September 2026, all channels"}
          aside={
            <span className="flex flex-col items-end leading-tight">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">{(rate * 100).toFixed(1)}%</span>
              <span className="text-xs text-sheen-fg-muted">visit to paid</span>
            </span>
          }
          table={<FunnelTable data={data} caption="Signup funnel table" />}
        >
          <FunnelChart
            data={data}
            align={align}
            aria-label={`Signup funnel, ${month === "oct" ? "October" : "September"}`}
          />
        </ChartCard>
      </Example>

      <Example
        title="Checkout, clickable stages"
        description="Start-aligned, in another hue, with stage clicks (pointer, Enter or Space) wired to a handler. Without the drop-off lines it becomes a compact ranked view."
        variant="bare"
        code={`
import { FunnelChart, useToast, type FunnelStage } from "@sheenui/theme";

const checkout: FunnelStage[] = [
  { label: "Cart", value: 9240 },
  { label: "Shipping details", value: 6875 },
  { label: "Payment", value: 5012 },
  { label: "Order placed", value: 4386 },
];

export function Example() {
  const toast = useToast();
  return (
    <FunnelChart
      data={checkout}
      align="start"
      color={7}
      onStageClick={(stage) => toast.info(stage.label)}
      aria-label="Checkout funnel"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Checkout"
          description="Last 30 days"
          table={<FunnelTable data={checkout} caption="Checkout funnel" />}
        >
          <FunnelChart
            data={checkout}
            align="start"
            color={7}
            onStageClick={(stage) =>
              toast.info(stage.label, `${formatCompact(stage.value)} sessions reached this step.`)
            }
            aria-label="Checkout funnel, last 30 days"
          />
        </ChartCard>
      </Example>

      <Example
        title="Patterns"
        description="Hatch fills tell the stages apart without colour (the counts are text already). They switch on by themselves above three stages; pass patterns to force them."
        variant="bare"
        code={`
import { FunnelChart } from "@sheenui/theme";

const stages = [
  { label: "Visited", value: 12000 },
  { label: "Signed up", value: 3400 },
  { label: "Subscribed", value: 820 },
];

export function Example() {
  return <FunnelChart patterns data={stages} aria-label="Conversion from visit to subscription, hatched" />;
}`}
      >
        <FunnelPatterns />
      </Example>

      <PropsTable title="FunnelChart" of={PROPS.FunnelChart} />
      <PropsTable as="h3" title="FunnelTable" of={PROPS.FunnelTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↓ / →", "Next stage."],
          ["↑ / ←", "Previous stage."],
          ["Home / End", "Jump to the first / last stage."],
          ["Enter / Space", "Activate the stage being read, when onStageClick is set."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Counts and conversion are text, so color never carries the reading; each move announces the stage.",
          "FunnelTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "Under reduced motion nothing morphs: the stages render at their final widths and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
