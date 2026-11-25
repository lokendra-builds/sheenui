Canonical: https://lokendra-builds.github.io/sheenui/charts/population-pyramid

# Population Pyramid Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/population-pyramid
Sidebar name: Population pyramid

A React population pyramid: mirrored horizontal bars by age group on one scale, with counts or shares, hatching and keyboard reading. Animated, accessible.

What it is: A React population pyramid: two sets of horizontal bars mirrored around a centre line, one row per age group. Pass data as readonly PyramidGroup[]: one item per group, { label, start, end }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/population-pyramid.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Population pyramid

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{population-pyramid.tsx, bar-flip.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/population-pyramid/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
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

Registry item: population-pyramid. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { PopulationPyramid } from "@/components/sheenui/charts/population-pyramid";
import { populationPyramidLegend, type PyramidGroup } from "@/components/sheenui/charts/population-pyramid/model";
import { PopulationPyramidTable } from "@/components/sheenui/charts/population-pyramid/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, PopulationPyramid, populationPyramidLegend, PopulationPyramidTable, type PyramidGroup } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly PyramidGroup[] | required | One item per age group: { label, start, end }, from the first group to the last, e.g. 0–4 up to 85+. |
| share | boolean | false | Show each bar as a share of the whole population (%) instead of a count. |
| firstAt | "top" \| "bottom" | "bottom" | Which end of data sits at the bottom. "bottom" puts the first group at the bottom, so the youngest are at the base. |
| colors | readonly [ChartColor, ChartColor] | [1, 2] | Palette slots (1–8) of the start and the end side. |
| patterns | boolean | false | Tell the two sides apart without colour (hatch fills on the end side). Off by default: only two sides, and they sit on opposite sides of the centre line. |
| showValues | boolean | true | Print each bar's value past its end where it fits. |
| format | ((n: number) => string) | formatCompact in locale | Formats a count for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share (0.082 → "8.2%"). |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<PopulationPyramidLabels> | defaultPopulationPyramidLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultPopulationPyramidLabels. All 8 keys of PopulationPyramidLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## PopulationPyramidTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly PyramidGroup[] | required | One item per age group: { label, start, end }, from the first group to the last, e.g. 0–4 up to 85+. |
| format | ((n: number) => string) | formatCompact in locale | Formats a count for the labels, tooltips and data table: takes the number, returns the text shown. |
| labels | Partial<PopulationPyramidLabels> | defaultPopulationPyramidLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultPopulationPyramidLabels. All 8 keys of PopulationPyramidLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share (0.082 → "8.2%"). |
| share | boolean | false | Show each bar as a share of the whole population (%) instead of a count. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Counts or shares

A fictional country by age and sex, in millions. Both halves share one scale, so they compare honestly. Show each bar as a share of the whole population, and hatch one side so the two differ without colour.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { PopulationPyramid } from "@/components/sheenui/charts/population-pyramid";
import { populationPyramidLegend, type PyramidGroup } from "@/components/sheenui/charts/population-pyramid/model";
import { PopulationPyramidTable } from "@/components/sheenui/charts/population-pyramid/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, PopulationPyramid, PopulationPyramidTable, populationPyramidLegend, type PyramidGroup } from "@sheenui/theme";

const ages: PyramidGroup[] = [
  { label: "0–19", start: 13.3, end: 12.5 },
  { label: "20–39", start: 16.8, end: 16.3 },
  { label: "40–59", start: 17.4, end: 18.1 },
  { label: "60–79", start: 12.2, end: 14.4 },
  { label: "80+", start: 2.0, end: 3.7 },
];

export function Example() {
  return (
    <ChartCard
      title="Population by age"
      legend={populationPyramidLegend("Male", "Female")}
      table={<PopulationPyramidTable data={ages} caption="Population by age group, in millions" />}
    >
      <PopulationPyramid data={ages} patterns aria-label="Population by age group and sex, in millions" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Beyond demographics

Any ordered bands with two sides work: here customers by tenure on two plans, with the labels renamed through the legend and labels prop. firstAt="top" puts the first band at the top.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { PopulationPyramid } from "@/components/sheenui/charts/population-pyramid";
import { populationPyramidLegend, type PyramidGroup } from "@/components/sheenui/charts/population-pyramid/model";
import { PopulationPyramidTable } from "@/components/sheenui/charts/population-pyramid/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, PopulationPyramid, PopulationPyramidTable, populationPyramidLegend, type PyramidGroup } from "@sheenui/theme";

const tenure: PyramidGroup[] = [
  { label: "< 1 year", start: 5200, end: 3900 },
  { label: "1–2 years", start: 4100, end: 3800 },
  { label: "2–3 years", start: 3300, end: 3100 },
  { label: "3–5 years", start: 2400, end: 2600 },
];
const labels = { start: "Pro", end: "Team", group: "Tenure" };

export function Example() {
  return (
    <ChartCard
      title="Customers by tenure"
      legend={populationPyramidLegend("Pro", "Team", [3, 4])}
      table={<PopulationPyramidTable data={tenure} labels={labels} caption="Customers by tenure and plan" />}
    >
      <PopulationPyramid data={tenure} firstAt="top" colors={[3, 4]} labels={labels} aria-label="Customers by tenure and plan" />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↑ / ↓ | Move between groups, top to bottom. |
| Home / End | Jump to the top / bottom group. |
| Escape | Clear the reading. |

## Accessibility

- The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces the group, both sides, the total and its share of the population.
- The two sides sit on opposite sides of the centre line and patterns hatches one of them, so colour never separates them; every bar's value is printed where it fits and always in the tooltip and table.
- In a ChartCard the legend toggles a side on and off; the scale follows the sides that remain.
- Reduced motion: the bars appear at once and data changes jump instead of gliding. In right-to-left text the sides swap.

## All exports on this page

- PopulationPyramid — A population pyramid: two sets of horizontal bars mirrored around a centre line, one row per age group.
- PopulationPyramidTable — Every group with the size of each side and the total, and (with share) its share of the population.
- defaultPopulationPyramidLabels — The built-in English strings of PopulationPyramid; spread it into your own labels and change what you need.


## When to use the population pyramid

- Use it for demographics: a country, city or customer base by age group and sex, where the two halves sit back to back on one scale so their shapes compare honestly.
- Use it for any two-sided split across ordered bands, such as customers by tenure on two plans, survey answers by age, or applicants against hires by seniority.
- Set share to read each bar as a part of the whole population instead of a count, and firstAt to choose whether the first group sits at the base or at the top.
- Skip it for more than two sides or for unordered categories, where a grouped Bar chart is clearer, and for a single series, where a Bar chart needs no mirror.
- Pair it with ChartCard, populationPyramidLegend and PopulationPyramidTable for a legend that toggles a side, Chart / Table tabs and a text table.


## Frequently asked questions

### How do I make a population pyramid in React?

Pass data as one item per age group with a label and the size of each side, start and end, from the first group to the last. The first group sits at the base. Rename the sides with the labels prop and set aria-label.

### Which side is on the left?

start sits at the inline start, so on the left in left-to-right text and on the right in right-to-left text. Both halves share one scale. colors takes a palette slot for each side, and patterns hatches the end side for a non-colour cue.

### Can it show shares instead of counts?

Yes. share shows every bar as a percentage of the whole population, with formatPercent and locale for the text. The tooltip and PopulationPyramidTable still give the group's total and, in count mode, its share of the whole.

### How does keyboard use work?

Tab focuses the chart. Up and Down move between groups from top to bottom, Home and End jump to the top and bottom group, Escape clears. Each move announces the group, both sides, the total and its share.


## Related pages

- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
