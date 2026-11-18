Canonical: https://lokendra-builds.github.io/sheenui/charts/funnel-chart

# Funnel Chart for React: Conversion Drop-Off

URL: https://lokendra-builds.github.io/sheenui/charts/funnel-chart
Sidebar name: Funnel chart

A React funnel chart for conversion: bars narrow by stage and every step shows how many continued and dropped off. Animated, accessible, Tailwind v4.

What it is: A React funnel chart that shows conversion stage by stage, printing how many continued and how many dropped off at every step. Pass data as readonly FunnelStage[]: the stages in order.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/funnel-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Funnel chart

Files to copy from `theme/src/`:

- `components/charts/{funnel-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: funnel-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { FunnelChart, type FunnelStage, FunnelTable } from "@/components/sheenui/charts/funnel-chart";
import { formatPercent } from "@/components/sheenui/charts/heatmap/kit";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, formatPercent, FunnelChart, type FunnelStage, FunnelTable, useToast } from "@sheenui/theme";
```

## FunnelChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly FunnelStage[] | required | The stages in order, e.g. [{ label: "Visited", value: 48200 }, ...]. Negative values count as 0. |
| align | "center" \| "start" | "center" | "center": a classic funnel, bars centred; "start": bars from a shared left edge (easier to compare). |
| color | ChartColor | 1 | Hue: stages step from the full slot colour (first) to lighter (last), an ordinal ramp. |
| format | ((n: number) => string) | formatCompact in locale | Formats a stage count for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a ratio (0.412 → "41.2%"). |
| locale | string | "en" | Locale of the default number formats. |
| patterns | boolean | true when data.length > 3 | Tell stages apart without colour (hatch fills). |
| showDropOff | boolean | true | Show the "continued / dropped off" line between stages. |
| onStageClick | ((stage: FunnelStage, index: number) => void) | optional, no default | Called with the stage and its index when it is clicked, tapped, or activated with Enter or Space. Makes stages interactive. |
| emptyState | ReactNode | optional, no default | Shown when there are no stages. |
| labels | Partial<FunnelChartLabels> | defaultFunnelChartLabels | Every other string, for translation: labels={{ continued: "…" }}; omitted keys keep the English of defaultFunnelChartLabels. All 7 keys of FunnelChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## FunnelTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly FunnelStage[] | required | The stages in order, e.g. [{ label: "Visited", value: 48200 }, ...]. Negative values count as 0. |
| format | ((n: number) => string) | formatCompact in locale | Formats a stage count for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a ratio (0.412 → "41.2%"). |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ stage: string; count: string; ofFirst: string; ofPrevious: string; dropped: string; }> | optional, no default | Text of the table's column headers (stage, count, share of first, share of previous, dropped); pass only the ones you translate. |
| labels | Partial<FunnelTableLabels> | defaultFunnelTableLabels | Strings for the cells that have no value. Merged over defaultFunnelTableLabels. Every other string, for translation: labels={{ notApplicable: "…" }}; omitted keys keep the English of defaultFunnelTableLabels. All 2 keys of FunnelTableLabels are listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no stages. |

## Example 1 of 3: Conversion, stage by stage

Centered bars read as a funnel; start-aligned bars are easier to compare by length. Switch the month to see the bars resize with a transform-only layout animation while the steps morph with them. Focus the chart and use the up and down arrow keys; on a phone the reading docks above the stages.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { FunnelTable, FunnelChart, type FunnelStage } from "@/components/sheenui/charts/funnel-chart";
import { formatPercent } from "@/components/sheenui/charts/heatmap/kit";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, formatPercent, FunnelTable, FunnelChart, type FunnelStage } from "@sheenui/theme";

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
}
```

## Example 2 of 3: Checkout, clickable stages

Start-aligned, in another hue, with stage clicks (pointer, Enter or Space) wired to a handler. Without the drop-off lines it becomes a compact ranked view.

```tsx
import { FunnelChart, type FunnelStage } from "@/components/sheenui/charts/funnel-chart";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { FunnelChart, useToast, type FunnelStage } from "@sheenui/theme";

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
}
```

## Example 3 of 3: Patterns

Hatch fills tell the stages apart without colour (the counts are text already). They switch on by themselves above three stages; pass patterns to force them.

```tsx
import { FunnelChart } from "@/components/sheenui/charts/funnel-chart";
// Package build (after the first npm release, or a packed tarball): import { FunnelChart } from "@sheenui/theme";

const stages = [
  { label: "Visited", value: 12000 },
  { label: "Signed up", value: 3400 },
  { label: "Subscribed", value: 820 },
];

export function Example() {
  return <FunnelChart patterns data={stages} aria-label="Conversion from visit to subscription, hatched" />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↓ / → | Next stage. |
| ↑ / ← | Previous stage. |
| Home / End | Jump to the first / last stage. |
| Enter / Space | Activate the stage being read, when onStageClick is set. |
| Escape | Clear the reading. |

## Accessibility

- The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Counts and conversion are text, so color never carries the reading; each move announces the stage.
- FunnelTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- Under reduced motion nothing morphs: the stages render at their final widths and new data replaces the old at once.

## All exports on this page

- FunnelChart — Stages as horizontal bars with the conversion between each pair.
- FunnelTable — Every stage with its count, conversion and drop-off.
- defaultFunnelChartLabels — The built-in English strings of FunnelChart; spread it into your own labels and change what you need.
- defaultFunnelTableLabels — English defaults of FunnelTableLabels.


## When to use the funnel chart

- Use it as a conversion funnel chart for a signup or checkout funnel: visited, signed up, activated, paid, with each stage showing its count and share of the first stage.
- Keep showDropOff on (it is the default) to print how many continued and how many dropped between stages, so the biggest leak in an onboarding or sales pipeline stands out without hovering.
- Use onStageClick to turn stages into drill-downs, for example opening the list of accounts lost between Trial and Paid in a side panel.
- Skip it when the steps are not sequential or users can skip stages, because a Sankey chart shows branching paths, and a plain Bar chart handles independent categories.
- Pair it with ChartCard and FunnelTable for a text twin, SegmentedControl to flip between weekly and monthly data, and Badge to flag the stage with the worst conversion.


## Frequently asked questions

### How do I make a funnel chart in React?

Pass data as stages in order, each with a label and value, plus an aria-label. Every stage shows its count and its share of the first stage, and negative values count as 0. Stages step from the full color of color to a lighter shade.

### Should I use center or start alignment?

align center draws the classic funnel with centered bars, while start aligns bars to a shared left edge, which makes lengths easier to compare. Switching alignment or data glides the bars to their new size and place instead of snapping, unless reduced motion is on.

### What does the layout do on narrow cards?

It uses a container-query layout. On wide cards each stage is label, bar and value on one row. On narrow ones the label and value sit above the bar, and the tooltip docks in a band above the stages, so nothing overflows on a phone.

### How is the funnel read with a keyboard?

Tab focuses the chart, then Down or Right and Up or Left move between stages, Home and End jump to the ends, and Escape clears. With onStageClick, Enter or Space activates the stage being read. Counts and conversion are text, so color never carries the reading.


## Related pages

- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
