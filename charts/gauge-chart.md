Canonical: https://lokendra-builds.github.io/sheenui/charts/gauge-chart

# Gauge Chart for React: Animated Speedometer

URL: https://lokendra-builds.github.io/sheenui/charts/gauge-chart
Sidebar name: Gauge

A React gauge chart: a semicircle or 270° speedometer whose needle springs to the value while bands light up, with icons and names, never color alone.

What it is: A React gauge chart shows one number against its scale as a semicircle or a speedometer whose needle springs into place. Pass one number as value, with optional min, max, target and colored bands.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/gauge-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Gauge

Files to copy from `theme/src/`:

- `components/charts/{gauge-chart.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts}`
- `components/charts/chart-parts/`
- `components/charts/gauge-chart/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/number-ticker/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{canvas-effects.ts, cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: gauge-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GaugeChart } from "@/components/sheenui/charts/gauge-chart";
import { type GaugeBand } from "@/components/sheenui/charts/gauge-chart/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type GaugeBand, GaugeChart } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | required | The number to show. Required. |
| min | number | 0 | Start of the scale. |
| max | number | 100 | End of the scale. |
| target | number | 0 | A goal, drawn as a tick across the arc. |
| bands | readonly GaugeBand[] | optional, no default | Coloured ranges, lowest first. The arc lights up to the needle in each band's colour. |
| shape | "semicircle" \| "speedometer" | "semicircle" | Sets the sweep of the arc: "semicircle" (180°) or "speedometer" (270°). |
| label | ReactNode | optional, no default | Caption under the number, e.g. "Apdex" or "CPU". |
| color | ChartColor | 1 | Palette slot (1–8) of the arc when there are no bands. |
| ticks | boolean | true | Print the scale around the arc. |
| numberFormat | Intl.NumberFormatOptions | optional, no default | Intl options for every number (the big one rolls its digits). E.g. { style: "percent" } or { style: "unit", unit: "millisecond" }. |
| format | ((n: number) => string) | optional, no default | Format numbers yourself instead (the big number then counts up instead of rolling its digits). |
| locale | string | the browser's | Locale of the number formats. |
| higherIsBetter | boolean | true | Is beating the target good (score) or bad (latency, cost)? Picks the tone of the delta. |
| height | number | 260 | Largest height (px). The gauge fits its card's width up to this. |
| labels | Partial<GaugeChartLabels> | defaultGaugeChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultGaugeChartLabels. All 15 keys of GaugeChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the gauge for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## GaugeTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| max | number | 100 | End of the scale. |
| min | number | 0 | Start of the scale. |
| target | number | optional, no default | A goal, drawn as a tick across the arc. |
| format | ((n: number) => string) | optional, no default | Format numbers yourself instead (the big number then counts up instead of rolling its digits). |
| value | number | required | The number to show. Required. |
| labels | Partial<GaugeChartLabels> | defaultGaugeChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultGaugeChartLabels. All 15 keys of GaugeChartLabels are listed in the key table under the props table. |
| locale | string | the browser's | Locale of the number formats. |
| bands | readonly GaugeBand[] | optional, no default | Coloured ranges, lowest first. The arc lights up to the needle in each band's colour. |
| numberFormat | Intl.NumberFormatOptions | { maximumFractionDigits: 2 } | Intl options for every number (the big one rolls its digits). E.g. { style: "percent" } or { style: "unit", unit: "millisecond" }. |
| measure | string | optional, no default | Sets the name of the measure (first row). |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 3: Semicircle with bands and a target

Apdex score. Take a new reading: the needle springs to it and the digits roll. Hover a band, the target or the needle, or focus the gauge and use the arrow keys.

```tsx
import { GaugeChart } from "@/components/sheenui/charts/gauge-chart";
import { type GaugeBand } from "@/components/sheenui/charts/gauge-chart/model";
// Package build (after the first npm release, or a packed tarball): import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 0.7, label: "Poor", tone: "danger" },
  { to: 0.85, label: "Fair", tone: "warning" },
  { to: 1, label: "Good", tone: "success" },
];

export function Example() {
  const apdex = 0.91; // your latest reading
  return (
    <GaugeChart
      value={apdex}
      min={0}
      max={1}
      target={0.85}
      bands={bands}
      label="Apdex"
      numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      aria-label="Apdex score"
    />
  );
}
```

## Example 2 of 3: Speedometer

shape="speedometer" sweeps 270°. Drag the slider: the needle chases the value on a spring. higherIsBetter={false} turns a value above the target into a warning.

```tsx
import { GaugeChart } from "@/components/sheenui/charts/gauge-chart";
import { type GaugeBand } from "@/components/sheenui/charts/gauge-chart/model";
// Package build (after the first npm release, or a packed tarball): import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 60, label: "Normal", tone: "success" },
  { to: 85, label: "Busy", tone: "warning" },
  { to: 100, label: "Overloaded", tone: "danger" },
];

export function Example() {
  const cpu = 72; // percent, from your metrics
  return (
    <GaugeChart
      shape="speedometer"
      value={cpu}
      target={80}
      higherIsBetter={false}
      bands={bands}
      label="CPU load"
      numberFormat={{ style: "unit", unit: "percent" }}
      aria-label="CPU load"
    />
  );
}
```

## Example 3 of 3: Plain arc, custom format

Without bands the arc fills with one color, lighter at the start. With format the number counts up instead of rolling its digits.

```tsx
import { GaugeChart } from "@/components/sheenui/charts/gauge-chart";
// Package build (after the first npm release, or a packed tarball): import { GaugeChart } from "@sheenui/theme";

<GaugeChart
  value={68.4}
  max={120}
  color={3}
  label="Monthly recurring revenue"
  format={(n) => `$${Number(n.toFixed(1))}K`}
  aria-label="Monthly recurring revenue against a $120K goal"
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| Arrow keys | Step through the value, the target and each band. |
| Home / End | Jump to the first / last stop. |
| Escape | Clear the reading. |

## Accessibility

- The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. The value, its band (icon and name) and its distance from the target are text, so status never rests on color alone.
- For a non-visual reading, give ChartCard's table prop a GaugeTable; the Chart / Table tabs then expose each value as plain table cells.
- Under reduced motion nothing morphs: the arc and the needle render at the final value and new data replaces the old at once.

## All exports on this page

- GaugeChart — A gauge for one number against its scale: a semicircle or a 270° speedometer whose needle springs to the value (a touch of overshoot, then it settles).
- GaugeTable — The gauge in text: the value, the target, the scale and every band with its range.
- defaultGaugeChartLabels — The built-in English strings of GaugeChart; spread it into your own labels and change what you need.
- gaugeLegend — Legend items for a gauge's bands (a tone's colour always travels with its label).


## When to use the gauge chart

- Use it as a speedometer chart for a single health number against its scale, such as an Apdex score, CPU load or a quality rating, with colored bands that name the range the needle sits in.
- Add a target when the number has a goal: a tick crosses the arc and the readout states the distance from it, with higherIsBetter set to false for latency or cost.
- Pick the speedometer shape for dashboards that want a dial look and the semicircle for a flatter card, and format the number with numberFormat for percent or unit styles.
- Skip it when you show many KPIs in a list, because a Bullet chart fits a row each, or when the value needs history, where a Sparkline or Line chart is the right tool.
- Pair it with ChartCard and GaugeTable for a text view, a Badge to repeat the band name, and Skeleton while the value loads.


## Frequently asked questions

### How do I make a gauge chart in React with colored bands?

Pass value, optionally min and max (default 0 to 100), and bands, each with a to bound and a label. Bands run lowest first, the first starting at min and the last stretching to max. Give a band a tone or a palette slot, and set aria-label.

### Does status rely on color?

No. The readout under the number shows the band's icon and name, and its distance from the target, all as text, so status never rests on color alone. Hover or tap a band, the target or the needle to read it.

### How does the number format work?

numberFormat takes Intl.NumberFormat options, such as style percent or style unit with unit millisecond, and the big number rolls its digits. If you pass format as a function instead, the number counts up rather than rolling digit by digit. locale defaults to the browser's.

### How do I read it with the keyboard and with reduced motion?

Tab focuses the gauge and the arrow keys step through the value, the target and each band. Home and End jump to the first and last, and Escape clears. The needle normally springs to each value with a little overshoot; under reduced motion it is set instantly.


## Related pages

- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
