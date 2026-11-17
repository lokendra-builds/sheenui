import { useId, useState } from "react";
import { GlassCard } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { CategoryBar, CategoryBarTable, type CategoryBarItem } from "@sheenui/theme";
import { TrackerChart, TrackerTable } from "@sheenui/theme";
import { WaffleChart, WaffleTable, type WaffleItem } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { apiUptime, buildStatuses, builds, services } from "./ChartsProgressPages/tracker-chart";
import { CHARTS } from "./ChartsProgressPages/shared";
import { oneDecimal } from "./ChartsProgressPages/shared";

const gigabytes = (n: number) => `${oneDecimal.format(n)} GB`;

const millis = (n: number) => `${Math.round(n).toLocaleString("en")} ms`;

/* ====================================================================== */
/* Category bar                                                           */
/* ====================================================================== */

const creditBands: CategoryBarItem[] = [
  { label: "Poor", value: 280, color: 8 },
  { label: "Fair", value: 90, color: 2 },
  { label: "Good", value: 70, color: 4 },
  { label: "Very good", value: 60, color: 3 },
  { label: "Exceptional", value: 50, color: 6 },
];

const creditScores = { jan: 612, apr: 668, jul: 724 } as const;

const latencyBands: CategoryBarItem[] = [
  { label: "Fast", value: 200, color: 3 },
  { label: "Acceptable", value: 300, color: 4 },
  { label: "Slow", value: 500, color: 2 },
  { label: "Critical", value: 500, color: 8 },
];

const npsBands: CategoryBarItem[] = [
  { label: "Needs work", value: 100, color: 8 },
  { label: "Good", value: 30, color: 4 },
  { label: "Great", value: 40, color: 3 },
  { label: "Excellent", value: 30, color: 6 },
];

/** The "Category bar" docs page (/charts/category-bar): live examples, props and notes. */
export function CategoryBarPage() {
  const [month, setMonth] = useState<keyof typeof creditScores>("jul");
  const headingId = useId();
  return (
    <Page
      eyebrow="Chart"
      title="Category bar"
      description="One bar split into named bands, with a pin for where a value sits: a credit score, a latency budget, an NPS. Boundary values are thinned so they never collide, the pin's bubble never leaves the bar, and every band can be read by hover, tap or arrow keys."
      source={`${CHARTS}category-bar.tsx`}
    >
      <ChartStage label="Category bar demo" title="Credit score" hue={8} height="6.5rem" narrowHeight="7.875rem">
        <CategoryBar
          data={creditBands}
          start={300}
          marker={724}
          markerLabel="Your score"
          showLegend
          aria-label="Credit score bands, 300 to 850"
        />
      </ChartStage>

      <Example
        title="Score with a marker"
        description="Bands on a 300–850 scale. Switch the month: the pin glides to the new score and its number rolls. Focus the bar and use the arrow keys to read each band."
        variant="bare"
        controls={
          <Segmented
            label="Month"
            size="sm"
            options={[
              { value: "jan", label: "Jan" },
              { value: "apr", label: "Apr" },
              { value: "jul", label: "Jul" },
            ]}
            value={month}
            onValueChange={setMonth}
          />
        }
        code={`
import { ChartCard, CategoryBarTable, CategoryBar, type CategoryBarItem } from "@sheenui/theme";

const bands: CategoryBarItem[] = [
  { label: "Poor", value: 280, color: 8 },
  { label: "Fair", value: 90, color: 2 },
  { label: "Good", value: 70, color: 4 },
  { label: "Very good", value: 60, color: 3 },
  { label: "Exceptional", value: 50, color: 6 },
];

<ChartCard
  title="Credit score"
  table={<CategoryBarTable data={bands} start={300} marker={724} markerLabel="Your score" />}
>
  <CategoryBar
    data={bands}
    start={300}
    marker={724}
    markerLabel="Your score"
    showLegend
    aria-label="Credit score bands, 300 to 850"
  />
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="Credit score"
          description="FICO® bands on the 300–850 scale"
          table={
            <CategoryBarTable
              data={creditBands}
              start={300}
              marker={creditScores[month]}
              markerLabel="Your score"
              caption="Credit score bands"
            />
          }
        >
          <CategoryBar
            data={creditBands}
            start={300}
            marker={creditScores[month]}
            markerLabel="Your score"
            showLegend
            aria-label="Credit score bands, 300 to 850"
          />
        </ChartCard>
      </Example>

      <Example
        title="Budgets and scores"
        description="Custom formats, a scale that starts below zero, and the compact size. Long boundary values drop out before they could touch."
        variant="bare"
        code={`
import { CategoryBar, type CategoryBarItem } from "@sheenui/theme";

const npsBands: CategoryBarItem[] = [
  { label: "Needs work", value: 100, color: 8 },
  { label: "Good", value: 30, color: 4 },
  { label: "Great", value: 40, color: 3 },
  { label: "Excellent", value: 30, color: 6 },
];

export function Example() {
  return (
    <>
      <CategoryBar
        data={[
          { label: "Fast", value: 200, color: 3 },
          { label: "Acceptable", value: 300, color: 4 },
          { label: "Slow", value: 500, color: 2 },
          { label: "Critical", value: 500, color: 8 },
        ]}
        marker={342}
        markerLabel="p95"
        format={(n) => Math.round(n).toLocaleString("en") + " ms"}
        aria-label="Checkout latency budget"
      />

      <CategoryBar
        data={npsBands}
        start={-100}
        marker={46}
        markerLabel="NPS"
        size="sm"
        showLegend
        aria-label="Net promoter score bands"
      />
    </>
  );
}`}
      >
        {/* Two compact bars share one glass card (one blur instead of two). */}
        <div className="glass-2 grid w-full gap-x-8 gap-y-6 rounded-sheen-lg p-5 md:grid-cols-2">
          <section aria-labelledby={`${headingId}-latency`} className="flex min-w-0 flex-col gap-4">
            <header>
              <h3 id={`${headingId}-latency`} className="font-semibold">
                Checkout latency
              </h3>
              <p className="mt-0.5 text-sm text-sheen-fg-muted">p95 over the last hour</p>
            </header>
            <CategoryBar
              data={latencyBands}
              marker={342}
              markerLabel="p95"
              format={millis}
              aria-label="Checkout latency budget"
            />
          </section>
          <section aria-labelledby={`${headingId}-nps`} className="flex min-w-0 flex-col gap-4">
            <header>
              <h3 id={`${headingId}-nps`} className="font-semibold">
                Net promoter score
              </h3>
              <p className="mt-0.5 text-sm text-sheen-fg-muted">Q3 survey, 1,284 replies</p>
            </header>
            <CategoryBar
              data={npsBands}
              start={-100}
              marker={46}
              markerLabel="NPS"
              size="sm"
              showLegend
              aria-label="Net promoter score bands"
            />
          </section>
        </div>
      </Example>

      <PropsTable of={PROPS.CategoryBar} />
      <PropsTable as="h2" title="CategoryBarTable props" of={PROPS.CategoryBarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the bar (one tab stop)."],
          ["→ / ↓", "Next band (← in right-to-left layouts)."],
          ["← / ↑", "Previous band."],
          ["Home / End", "First / last band."],
          ["Escape", "Stop reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The bar is one focusable figure with a role description of “chart”; its description is the keyboard hint, and
          its description lists every band and where the marker falls.
        </li>
        <li>
          Moving through the bands announces each span once through a polite live region; pointer hovers stay silent.
        </li>
        <li>
          Bands are named in the legend, the tooltip and the table: color is never the only cue. Boundary values thin
          out instead of overlapping.
        </li>
        <li>
          On touch screens the hit area grows to 44px without moving anything; forced colors outline every band and the
          pin.
        </li>
        <li>Reduced motion: bands, pin and number appear in place, with no slide or roll.</li>
      </A11yNotes>
    </Page>
  );
}

/** The "Tracker" docs page (/charts/uptime-tracker): live examples, props and notes. */
export function TrackerChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Tracker"
      description="A strip of status blocks, one per day, build or check: the status-page view of uptime. Every block has its own tooltip, color is never the only cue (stripes and carets mark the worst days, and every status has an icon and a name), and long strips scroll inside the card instead of squeezing blocks to nothing."
      source={`${CHARTS}tracker-chart.tsx`}
    >
      <ChartStage label="Tracker demo" title="API uptime, last 90 days" hue={4} height="6rem" narrowHeight="7.375rem">
        <TrackerChart
          data={apiUptime}
          startLabel="90 days ago"
          endLabel="Today"
          aria-label="API uptime, last 90 days"
        />
      </ChartStage>

      <Example
        title="Uptime, last 90 days"
        description="Hover, tap and drag, or arrow through the days. Degraded days are striped, outages carry a caret, and the legend counts each status."
        variant="bare"
        code={`
import { ChartCard, TrackerTable, TrackerChart, type TrackerBlock } from "@sheenui/theme";

const data: TrackerBlock[] = [
  { label: new Date("2026-08-02"), status: "ok", detail: "No incidents" },
  { label: new Date("2026-08-03"), status: "degraded", detail: "Elevated error rate on /v2/search for 22 min" },
  // … one block per day
];

<ChartCard
  title="api.example.com"
  aside={<span className="text-sm font-semibold tabular-nums">99.94% uptime</span>}
  table={<TrackerTable data={data} caption="Daily status" />}
>
  <TrackerChart data={data} startLabel="90 days ago" endLabel="Today" aria-label="API uptime, last 90 days" />
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="api.example.com"
          description="All regions"
          aside={
            <span className="text-sm font-semibold tabular-nums">
              99.94% <span className="font-normal text-sheen-fg-muted">uptime</span>
            </span>
          }
          table={<TrackerTable data={apiUptime} caption="Daily status of api.example.com" />}
        >
          <TrackerChart
            data={apiUptime}
            startLabel="90 days ago"
            endLabel="Today"
            aria-label="API uptime, last 90 days"
          />
        </ChartCard>
      </Example>

      <Example
        title="A status page"
        description="One compact tracker per service, without legends, in a single glass card."
        variant="bare"
        code={`
import { TrackerChart, type TrackerBlock } from "@sheenui/theme";

type Service = { name: string; uptime: string; data: TrackerBlock[] };

// One block per day (shortened here); status keys: "ok", "degraded", "down"
const services: Service[] = [
  {
    name: "API",
    uptime: "99.98%",
    data: [
      { label: new Date("2026-08-02"), status: "ok", detail: "No incidents" },
      { label: new Date("2026-08-03"), status: "degraded", detail: "Elevated error rate for 22 min" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
  {
    name: "Dashboard",
    uptime: "100%",
    data: [
      { label: new Date("2026-08-02"), status: "ok" },
      { label: new Date("2026-08-03"), status: "ok" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
  {
    name: "Webhooks",
    uptime: "99.71%",
    data: [
      { label: new Date("2026-08-02"), status: "ok" },
      { label: new Date("2026-08-03"), status: "down", detail: "Delivery outage, 41 min" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
];

export function Example() {
  return (
    <div className="flex flex-col gap-5">
      {services.map((s) => (
        <div key={s.name}>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{s.name}</span>
            <span className="text-sheen-fg-muted tabular-nums">{s.uptime}</span>
          </div>
          <TrackerChart
            data={s.data}
            height={28}
            showLegend={false}
            startLabel="30 days ago"
            endLabel="Today"
            aria-label={s.name + " uptime, last 30 days"}
          />
        </div>
      ))}
    </div>
  );
}`}
      >
        {/* No pointer sheen: it restyles the whole card on every move, under three live strips. */}
        <GlassCard sheen={false} className="flex w-full flex-col gap-5 p-5">
          {services.map((s) => (
            <div key={s.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-sheen-fg-muted tabular-nums">{s.uptime}</span>
              </div>
              <TrackerChart
                data={s.data}
                height={28}
                showLegend={false}
                startLabel="30 days ago"
                endLabel="Today"
                aria-label={`${s.name} uptime, last 30 days`}
              />
            </div>
          ))}
        </GlassCard>
      </Example>

      <Example
        title="Custom statuses: CI builds"
        description="Any set of statuses, each with a palette slot or a status tone, an icon, and stripes or a caret as a second cue."
        variant="bare"
        code={`
import { TrackerChart, type TrackerBlock, type TrackerStatus } from "@sheenui/theme";

// Any 14px SVG works as a status icon; these are stand-ins.
const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CheckIcon = () => icon("M3 8.5l3.2 3.2L13 4.8");
const CrossIcon = () => icon("M4 4l8 8M12 4l-8 8");
const RetryIcon = () => icon("M13 8a5 5 0 1 1-1.6-3.7M13 3v3h-3");
const DashIcon = () => icon("M4 8h8");

const statuses: Record<string, TrackerStatus> = {
  passed: { label: "Passed", tone: 7, icon: <CheckIcon /> },
  failed: { label: "Failed", tone: 8, flag: true, icon: <CrossIcon /> },
  flaky: { label: "Passed on retry", tone: 4, striped: true, icon: <RetryIcon /> },
  none: { label: "Cancelled", tone: "neutral", icon: <DashIcon /> },
};

// One block per build (shortened here)
const builds: TrackerBlock[] = [
  { label: "#1203", status: "passed" },
  { label: "#1204", status: "passed" },
  { label: "#1205", status: "flaky", detail: "Passed on the second attempt" },
  { label: "#1206", status: "failed", detail: "3 tests failed" },
  { label: "#1207", status: "none", detail: "Cancelled by a newer push" },
  { label: "#1208", status: "passed" },
];

export function Example() {
  return <TrackerChart data={builds} statuses={statuses} startLabel="#1203" endLabel="#1208" aria-label="Last builds on main" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="main · last 48 builds"
          table={
            <TrackerTable
              data={builds}
              statuses={buildStatuses}
              caption="Builds on main"
              labels={{ period: "Build" }}
            />
          }
        >
          <TrackerChart
            data={builds}
            statuses={buildStatuses}
            startLabel="#1203"
            endLabel="#1250"
            aria-label="Last 48 builds on main"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.TrackerChart} />
      <PropsTable as="h2" title="TrackerTable props" of={PROPS.TrackerTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the strip (one tab stop)."],
          ["→ / ↓", "Next block (← in right-to-left layouts); a scrolling strip follows it."],
          ["← / ↑", "Previous block."],
          ["Home / End", "Oldest / newest block."],
          ["Escape", "Stop reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The strip is one focusable figure; its description counts each status (“Operational: 82, Degraded: 4…”), so
          the summary needs no hovering.
        </li>
        <li>Each block read by keyboard is announced once: period, status and detail.</li>
        <li>
          Color is never the only cue: every status has an icon and a name, degraded blocks are striped and outages
          carry a caret.
        </li>
        <li>
          Strips too long for the width scroll inside their own container, opened at the latest end, instead of
          squeezing blocks below 3px.
        </li>
        <li>Forced colors give every block a CanvasText border; reduced motion draws the strip in place.</li>
      </A11yNotes>
    </Page>
  );
}

/* ====================================================================== */
/* Waffle                                                                 */
/* ====================================================================== */

const devices: Record<"q2" | "q3", WaffleItem[]> = {
  q2: [
    { label: "Mobile", value: 48_210, color: 1 },
    { label: "Desktop", value: 33_940, color: 7 },
    { label: "Tablet", value: 7_860, color: 3 },
  ],
  q3: [
    { label: "Mobile", value: 61_380, color: 1 },
    { label: "Desktop", value: 31_020, color: 7 },
    { label: "Tablet", value: 6_510, color: 3 },
  ],
};

const commute: WaffleItem[] = [
  { label: "Public transport", value: 41, color: 7 },
  { label: "Cycle or walk", value: 27, color: 3 },
  { label: "Car", value: 24, color: 2 },
  { label: "Work from home", value: 8, color: 1 },
];

const storage: WaffleItem[] = [
  { label: "Photos", value: 38.4, color: 5 },
  { label: "Apps", value: 22.1, color: 7 },
  { label: "Documents", value: 9.3, color: 4 },
  { label: "System", value: 11.8, color: 1 },
];

/** The "Waffle chart" docs page (/charts/waffle): live examples, props and notes. */
export function WaffleChartPage() {
  const [quarter, setQuarter] = useState<"q2" | "q3">("q3");
  return (
    <Page
      eyebrow="Chart"
      title="Waffle chart"
      description="A 10 × 10 grid where every cell is one percent: “61 in 100” lands faster than any pie. Cells are split by largest remainder so they always add up, a pictogram variant draws any icon per cell, and hovering a cell or a legend row lights up its whole part."
      source={`${CHARTS}waffle-chart.tsx`}
    >
      <ChartStage
        label="Waffle chart demo"
        title="Sessions by device"
        hue={1}
        height="19.75rem"
        narrowHeight="21.25rem"
      >
        <WaffleChart data={devices.q3} aria-label="Sessions by device" />
      </ChartStage>

      <Example
        title="Share of a whole"
        description="Switch the quarter: only the cells that change hands pop. Hover a cell or a legend row, tap, or arrow through the parts."
        variant="bare"
        controls={
          <Segmented
            label="Quarter"
            size="sm"
            options={[
              { value: "q2", label: "Q2" },
              { value: "q3", label: "Q3" },
            ]}
            value={quarter}
            onValueChange={setQuarter}
          />
        }
        code={`
import { ChartCard, WaffleTable, WaffleChart, type WaffleItem } from "@sheenui/theme";

const data: WaffleItem[] = [
  { label: "Mobile", value: 61380, color: 1 },
  { label: "Desktop", value: 31020, color: 7 },
  { label: "Tablet", value: 6510, color: 3 },
];

<ChartCard title="Sessions by device" table={<WaffleTable data={data} caption="Sessions by device" />}>
  <WaffleChart data={data} aria-label="Sessions by device" />
</ChartCard>`}
      >
        <ChartCard
          className="w-full"
          title="Sessions by device"
          description={`${quarter.toUpperCase()} 2026 · one cell = 1%`}
          table={
            <WaffleTable data={devices[quarter]} caption={`Device share of sessions, ${quarter.toUpperCase()} 2026`} />
          }
        >
          <WaffleChart data={devices[quarter]} aria-label="Sessions by device" />
        </ChartCard>
      </Example>

      <Example
        title="Pictogram"
        description="Any icon that uses currentColor, one per cell. Here: how 100 employees get to work."
        variant="bare"
        code={`
import { WaffleChart } from "@sheenui/theme";

<WaffleChart
  variant="pictogram"
  data={[
    { label: "Public transport", value: 41, color: 7 },
    { label: "Cycle or walk", value: 27, color: 3 },
    { label: "Car", value: 24, color: 2 },
    { label: "Work from home", value: 8, color: 1 },
  ]}
  aria-label="How employees commute"
/>`}
      >
        <ChartCard
          className="w-full"
          title="How 100 employees commute"
          table={<WaffleTable data={commute} caption="Commute mode" />}
        >
          <WaffleChart variant="pictogram" data={commute} aria-label="How employees commute" />
        </ChartCard>
      </Example>

      <Example
        title="Part of a larger whole"
        description="With a `total` above the sum, the rest of the cells stay empty. Any grid size works: here 20 × 5."
        variant="bare"
        code={`
import { WaffleChart, type WaffleItem } from "@sheenui/theme";

const storage: WaffleItem[] = [
  { label: "Photos", value: 38.4, color: 5 },
  { label: "Apps", value: 22.1, color: 7 },
  { label: "Documents", value: 9.3, color: 4 },
  { label: "System", value: 11.8, color: 1 },
];
const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

<WaffleChart
  data={storage}
  total={128}
  rows={5}
  columns={20}
  format={(n) => \`\${oneDecimal.format(n)} GB\`}
  aria-label="iPhone storage, 128 GB"
/>`}
      >
        <ChartCard
          className="w-full"
          title="iPhone storage"
          description="81.6 GB of 128 GB used"
          table={
            <WaffleTable
              data={storage}
              total={128}
              rows={5}
              columns={20}
              format={gigabytes}
              caption="Storage by type"
            />
          }
        >
          <WaffleChart
            data={storage}
            total={128}
            rows={5}
            columns={20}
            format={gigabytes}
            aria-label="iPhone storage, 128 GB"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.WaffleChart} />
      <PropsTable as="h2" title="WaffleTable props" of={PROPS.WaffleTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the grid (one tab stop)."],
          ["→ / ↓", "Next part (← in right-to-left layouts)."],
          ["← / ↑", "Previous part."],
          ["Home / End", "First / last part."],
          ["Escape", "Stop reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The grid is one focusable figure whose description lists every part's share; the cells themselves are hidden
          from assistive tech, so nobody has to step through 100 of them.
        </li>
        <li>Reading a part announces its value, share and cell count once.</li>
        <li>
          The legend names every part next to its share, and the table view lists values, shares and cells: color is
          never the only cue.
        </li>
        <li>Cells are split by largest remainder, so the cell counts always add up to the grid.</li>
        <li>Reduced motion: no wave, no pop on change; the grid is drawn in place.</li>
      </A11yNotes>
    </Page>
  );
}
