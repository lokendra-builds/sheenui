Canonical: https://lokendra-builds.github.io/sheenui/charts/waterfall-chart

# Waterfall Chart for React (Bridge Chart)

URL: https://lokendra-builds.github.io/sheenui/charts/waterfall-chart
Sidebar name: Waterfall chart

A React waterfall chart: a running total split into increases and decreases, with subtotals, totals and hairline connectors. Animated, accessible, MIT.

What it is: A React waterfall chart, or bridge chart, breaks a running total into its increases and decreases. Pass data as readonly WaterfallStep[]: the steps in order: { label, value }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/waterfall-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Waterfall chart

Files to copy from `theme/src/`:

- `components/charts/{waterfall-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
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

Registry item: waterfall-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { WaterfallChart, waterfallLegend, type WaterfallStep, WaterfallTable } from "@/components/sheenui/charts/waterfall-chart";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, formatCompact, WaterfallChart, waterfallLegend, type WaterfallStep, WaterfallTable } from "@sheenui/theme";
```

## WaterfallChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WaterfallStep[] | required | The steps in order: { label, value?, kind? }. Kinds are "start", "delta", "subtotal" and "total". |
| layout | "horizontal" \| "vertical" \| "auto" | "auto" | "auto" draws columns, and switches to horizontal bars when the chart is narrow or a step name wouldn't fit whole. |
| increaseColor | ChartColor | 7 | The diverging pair: palette slots for increases and decreases (default blue / red). Totals are neutral. |
| decreaseColor | ChartColor | 8 | Sets the palette slot (1 to 8) of decreases. |
| height | number | 240 | Plot height (vertical layout). Horizontal grows with the number of steps. |
| format | ((n: number) => string) | formatCompact in locale | Formats values and ticks. |
| locale | string | "en" | Locale of the default number format. |
| showValues | boolean | true | Signed value labels on the bars ("+1.2K", "−400"), so colour is never the only cue. |
| showConnectors | boolean | true | Hairline steps joining each bar to the next at the running total. |
| emptyState | ReactNode | optional, no default | Shown when there are no steps. |
| labels | Partial<WaterfallChartLabels> | defaultWaterfallChartLabels | Every other string, for translation: labels={{ increase: "…" }}; omitted keys keep the English of defaultWaterfallChartLabels. All 7 keys of WaterfallChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## WaterfallTable props and waterfallLegend

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WaterfallStep[] | required | The steps in order: { label, value?, kind? }. Kinds are "start", "delta", "subtotal" and "total". |
| format | ((n: number) => string) | formatCompact in locale | Formats values and ticks. |
| locale | string | "en" | Locale of the default number format. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ step: string; change: string; runningTotal: string; }> | optional, no default | Override the column headers: { step, change, runningTotal }. |
| labels | Partial<WaterfallTableLabels> | defaultWaterfallTableLabels | Strings for the cells that have no value. Merged over defaultWaterfallTableLabels. Every other string, for translation: labels={{ notApplicable: "…" }}; omitted keys keep the English of defaultWaterfallTableLabels. Its only key is listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no steps. |
| waterfallLegend(labels?, colors?) | LegendItem[] | optional, no default | Returns the increase / decrease / total legend items for ChartCard. |

## Example 1 of 2: Annual results, step by step

Switch the year to see every bar morph to its new place. Below 480px, or as soon as a step name wouldn't fit whole under its column, it turns into horizontal bars. Hover, tap or use the arrow keys for each step's change and running total.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { waterfallLegend, WaterfallTable, WaterfallChart, type WaterfallStep } from "@/components/sheenui/charts/waterfall-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, formatCompact, waterfallLegend, WaterfallTable, WaterfallChart, type WaterfallStep } from "@sheenui/theme";

const usd = (n: number) => (n < 0 ? "−" : "") + "$" + formatCompact(Math.abs(n));

const steps: WaterfallStep[] = [
  { label: "Revenue", value: 4200000, kind: "start" },
  { label: "Cost of sales", value: -1640000 },
  { label: "Gross profit", kind: "subtotal" },
  { label: "Marketing", value: -620000 },
  { label: "R&D", value: -910000 },
  { label: "Net income", kind: "total" },
];

export function Example() {
  return (
    <ChartCard title="Profit and loss" legend={waterfallLegend()} table={<WaterfallTable data={steps} format={usd} />}>
      <WaterfallChart data={steps} format={usd} aria-label="Profit and loss, FY26" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Cash flow, horizontal

Horizontal at every width, for long step names. The running total dips below its start mid-month; the zero line firms up only when values cross it.

```tsx
import { formatCompact } from "@/components/sheenui/charts/chart-utils";
import { WaterfallChart, type WaterfallStep } from "@/components/sheenui/charts/waterfall-chart";
// Package build (after the first npm release, or a packed tarball): import { WaterfallChart, formatCompact, type WaterfallStep } from "@sheenui/theme";

const usd = (n: number) => (n < 0 ? "−" : "") + "$" + formatCompact(Math.abs(n));

const cash: WaterfallStep[] = [
  { label: "Opening cash", value: 180000, kind: "start" },
  { label: "Customer receipts", value: 96000 },
  { label: "Payroll", value: -168000 },
  { label: "Suppliers", value: -74000 },
  { label: "Closing cash", kind: "total" },
];

export function Example() {
  return (
    <WaterfallChart
      data={cash}
      layout="horizontal"
      format={usd}
      labels={{ increase: "Inflow", decrease: "Outflow", total: "Balance" }}
      aria-label="Cash flow in October"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Move between steps. |
| Home / End | Jump to the first / last step. |
| Escape | Clear the reading. |

## Accessibility

- Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Every change carries a signed label (+ or −) and bars grow in their own direction, so color is never the only signal.
- WaterfallTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.
- With reduced motion on, the bars start at their final values and a data change jumps straight to the new state.

## All exports on this page

- WaterfallChart — A running total broken into its steps: a start, increases and decreases floating from the previous level, subtotals and a total from zero.
- WaterfallTable — Every step with its signed change and the running total after it.
- defaultWaterfallChartLabels — The built-in English strings of WaterfallChart; spread it into your own labels and change what you need.
- defaultWaterfallTableLabels — English defaults of WaterfallTableLabels.
- waterfallLegend — Legend items for a waterfall's three kinds of bar (pass to ChartCard's legend).


## When to use the waterfall chart

- Use it as a profit and loss chart, from revenue through costs to net income, with increases and decreases floating from the previous level and a total drawn from zero.
- It fits a monthly cash flow with long step names, set to horizontal layout, where the running total dips below its start mid-month and the zero line firms up.
- It works for explaining a variance between two periods, such as budget to actual, with subtotals marking checkpoints along the way.
- Skip it when steps are not additive or have no meaningful order; use BarChart for plain comparison, and FunnelChart when each stage is a subset of the one before.
- Pair it with ChartCard, waterfallLegend for increase, decrease and total keys, and WaterfallTable to list each step's change and running total as text.


## Frequently asked questions

### How do I define steps in a waterfall chart?

Pass data as steps with label, value and kind. The kind start sets the opening total, delta (the default) adds its value, and subtotal or total draw the running total from zero. Steps go in order.

### Is it readable without color?

Yes. Increases and decreases use the diverging pair, by default colors 7 and 8, and totals are neutral gray, but every step also carries a signed label such as +1.2K or -400 and bars grow in their own direction.

### When does it switch to horizontal bars?

layout defaults to auto: below 480px, when the chart is crowded, or when a step name would not fit whole under its column, it turns into horizontal bars. Set vertical or horizontal to force one layout.

### Can I hide the connectors or value labels?

Yes. showValues and showConnectors both default to true; set either to false. Arrow keys move between steps, Home and End jump to the ends, and each step reads its change and running total.


## Related pages

- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
