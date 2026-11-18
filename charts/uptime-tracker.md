Canonical: https://lokendra-builds.github.io/sheenui/charts/uptime-tracker

# Uptime Tracker for React Status Pages

URL: https://lokendra-builds.github.io/sheenui/charts/uptime-tracker
Sidebar name: Uptime tracker

A React uptime tracker: one status block per day, build or check, each with its own tooltip, plus icons and patterns so color is never the only cue.

What it is: A React uptime tracker draws the status-page view of uptime: one block per day, build or check, each with its own tooltip. Pass data as readonly TrackerBlock[]: takes one block per period, oldest first.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/tracker-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Uptime tracker

Files to copy from `theme/src/`:

- `components/charts/{tracker-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/button/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: tracker-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type TrackerBlock, TrackerChart, type TrackerStatus, TrackerTable } from "@/components/sheenui/charts/tracker-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type TrackerBlock, TrackerChart, type TrackerStatus, TrackerTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly TrackerBlock[] | required | Takes one block per period, oldest first. |
| statuses | Record<string, TrackerStatus> | defaultTrackerStatuses | Sets the status definitions, keyed by status name. |
| height | number | 32 | Height of the blocks in px. |
| startLabel | ReactNode | optional, no default | Text under the first and last block, e.g. "90 days ago" / "Today". |
| endLabel | ReactNode | optional, no default | Caption under the right end of the strip, e.g. "Today". |
| showLegend | boolean | true | Show each status (icon, label and count) under the strip. |
| formatLabel | ((label: Date) => string) | "Mar 3" in locale | Formats Date / number labels. |
| locale | string | "en" | Locale of the default formats. |
| emptyState | ReactNode | optional, no default | Shown when there are no blocks. |
| labels | Partial<TrackerChartLabels> | defaultTrackerChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultTrackerChartLabels. All 7 keys of TrackerChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the strip for assistive tech (e.g. "API uptime, last 90 days"). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## TrackerTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly TrackerBlock[] | required | Takes one block per period, oldest first. |
| labels | Partial<TrackerChartLabels> | defaultTrackerChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultTrackerChartLabels. All 7 keys of TrackerChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default formats. |
| statuses | Record<string, TrackerStatus> | defaultTrackerStatuses | Sets the status definitions, keyed by status name. |
| formatLabel | ((label: Date) => string) | "Mar 3" in locale | Formats Date / number labels. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| order | "newest" \| "oldest" | "newest" | Sets the sort order: newest first (default), or oldest first. |
| limit | number | 30 | Rows shown before "Show all" (opening the table stays instant on long strips). |

## Example 1 of 3: Uptime, last 90 days

Hover, tap and drag, or arrow through the days. Degraded days are striped, outages carry a caret, and the legend counts each status.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { TrackerTable, TrackerChart, type TrackerBlock } from "@/components/sheenui/charts/tracker-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, TrackerTable, TrackerChart, type TrackerBlock } from "@sheenui/theme";

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
</ChartCard>
```

## Example 2 of 3: A status page

One compact tracker per service, without legends, in a single glass card.

```tsx
import { TrackerChart, type TrackerBlock } from "@/components/sheenui/charts/tracker-chart";
// Package build (after the first npm release, or a packed tarball): import { TrackerChart, type TrackerBlock } from "@sheenui/theme";

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
}
```

## Example 3 of 3: Custom statuses: CI builds

Any set of statuses, each with a palette slot or a status tone, an icon, and stripes or a caret as a second cue.

```tsx
import { TrackerChart, type TrackerBlock, type TrackerStatus } from "@/components/sheenui/charts/tracker-chart";
// Package build (after the first npm release, or a packed tarball): import { TrackerChart, type TrackerBlock, type TrackerStatus } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the strip (one tab stop). |
| → / ↓ | Next block (← in right-to-left layouts); a scrolling strip follows it. |
| ← / ↑ | Previous block. |
| Home / End | Oldest / newest block. |
| Escape | Stop reading. |

## Accessibility

- The strip is one focusable figure; its description counts each status (“Operational: 82, Degraded: 4…”), so the summary needs no hovering.
- Each block read by keyboard is announced once: period, status and detail.
- Color is never the only cue: every status has an icon and a name, degraded blocks are striped and outages carry a caret.
- Strips too long for the width scroll inside their own container, opened at the latest end, instead of squeezing blocks below 3px.
- Forced colors give every block a CanvasText border; reduced motion draws the strip in place.

## All exports on this page

- TrackerChart — A strip of status blocks, one per period (Tremor's Tracker): uptime, build health, SLA days.
- TrackerTable — Every block: its period, status (icon + label) and detail.
- defaultTrackerChartLabels — The built-in English strings of TrackerChart; spread it into your own labels and change what you need.
- defaultTrackerStatuses — The default statuses: "ok", "degraded", "down" and "none" (no data).
- trackerToneColor — CSS colour of a status tone.


## When to use the uptime tracker

- Use it as a status page uptime bar for the last 90 days, where each block is a day with its own tooltip and the legend counts each status.
- It fits a compact status page with one strip per service in a single glass card, without legends, so a dozen services fit in one view.
- It works for CI history, such as the last 48 builds on main, using custom statuses with their own palette slot or tone, an icon and optional stripes or a caret.
- Skip it when you need the magnitude of a value over time; use LineChart or Sparkbar, and use CalendarHeatmap for a year of daily intensity in a week by weekday grid.
- Pair it with ChartCard for the title and legend, Badge to show the current status, and TrackerTable to give screen reader users every period as a table row.


## Frequently asked questions

### How do I build an uptime tracker in React with SheenUI?

Pass data as blocks, oldest first, each with label, status and optional detail. The default statuses are ok, degraded, down and none. startLabel and endLabel add text under the two ends, such as 90 days ago and Today.

### Is color the only way to tell statuses apart?

No. Every status has an icon and a name, degraded days are striped, and outages carry a caret. You can define your own statuses with a label, tone, icon, striped and flag, so a second cue exists beyond color.

### What happens with a long strip on a narrow screen?

Blocks never get thinner than 3px: a longer strip scrolls inside the card, opened at its latest end, and the keyboard focus follows the active block. Block height defaults to 32px, and Date labels are formatted with formatLabel or locale.

### How do I use it with a keyboard?

The tracker is one tab stop. Right or Down moves to the next block (in right-to-left layouts Left takes Right's place), Left or Up to the previous, Home to the oldest and End to the newest, and Escape stops reading. Touch can tap and drag.


## Related pages

- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
