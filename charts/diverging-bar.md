Canonical: https://lokendra-builds.github.io/sheenui/charts/diverging-bar

# Diverging Bar Chart & Population Pyramid (React)

URL: https://lokendra-builds.github.io/sheenui/charts/diverging-bar
Sidebar name: Diverging bar chart

A React diverging bar chart for Likert survey answers around a neutral midpoint, plus a butterfly population pyramid on one shared scale. Accessible, MIT.

What it is: A React diverging bar chart centers survey answers on a neutral midpoint; the butterfly variant draws a population pyramid. Pass data as readonly ChartRow[]: one row per item (a question, a product, an age group).

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/diverging-bar-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Diverging bar chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{diverging-bar-chart.tsx, histogram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/diverging-bar-chart/`
- `components/charts/heatmap/`
- `components/charts/histogram/`
- `components/charts/kits/`
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

Registry item: diverging-bar-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { DivergingBarChart } from "@/components/sheenui/charts/diverging-bar-chart";
import { divergingLegend, type DivergingLevel } from "@/components/sheenui/charts/diverging-bar-chart/model";
import { DivergingBarTable } from "@/components/sheenui/charts/diverging-bar-chart/table";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, DivergingBarChart, DivergingBarTable, divergingLegend, type DivergingLevel } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per item (a question, a product, an age group). |
| index | string | required | Key of the row name in each data row. |
| levels | readonly DivergingLevel[] | required | Likert: the answer levels, most negative first ("Strongly disagree" … "Strongly agree"); with an odd count the middle one is neutral and straddles the centre line. Butterfly: exactly two levels, drawn to the left and right of the spine (e.g. Men / Women). |
| variant | "likert" \| "butterfly" | "likert" | "likert": stacked levels diverging from a neutral midpoint. "butterfly": two sides back to back (population pyramid). |
| neutral | string \| null | the middle level of an odd count | Likert: sets the key of the neutral level. |
| normalize | boolean | true for Likert, false for butterfly (follows mode) | Likert: draw shares (each row sums to 100%). Default true. Butterfly: draw each side's share of the grand total. Default false. |
| showNet | boolean | true | Likert: print the net score (positive minus negative) after each row. |
| showValues | boolean | true | Print values in (Likert) or past (butterfly) the bars where they fit. |
| negativeColor | ChartColor | 8 | Likert: palette slots of the negative and positive poles (a diverging pair). |
| positiveColor | ChartColor | 7 | Sets thepalette slot (1 to 8) of the positive arm. |
| colors | readonly [ChartColor, ChartColor] | [7, 5] | Butterfly: palette slots of the left and right sides. |
| height | number | 200 | Sets the height of the plot in px. |
| format | ((n: number) => string) | formatCompact in locale | Formats a response count for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share as text (0.42 → "42%"). |
| locale | string | "en" | Locale of the default number formats. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<DivergingBarChartLabels> | defaultDivergingBarChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultDivergingBarChartLabels. All 10 keys of DivergingBarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## DivergingBarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One row per item (a question, a product, an age group). |
| neutral | string \| null | the middle level of an odd count | Likert: sets the key of the neutral level. |
| format | ((n: number) => string) | formatCompact in locale | Formats a response count for the labels, tooltips and data table: takes the number, returns the text shown. |
| variant | "likert" \| "butterfly" | "likert" | "likert": stacked levels diverging from a neutral midpoint. "butterfly": two sides back to back (population pyramid). |
| labels | Partial<DivergingBarChartLabels> | defaultDivergingBarChartLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultDivergingBarChartLabels. All 10 keys of DivergingBarChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number formats. |
| index | string | required | Key of the row name in each data row. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share as text (0.42 → "42%"). |
| levels | readonly DivergingLevel[] | required | Likert: the answer levels, most negative first ("Strongly disagree" … "Strongly agree"); with an odd count the middle one is neutral and straddles the centre line. Butterfly: exactly two levels, drawn to the left and right of the spine (e.g. Men / Women). |
| showNet | boolean | true | Likert: print the net score (positive minus negative) after each row. |
| indexLabel | string | optional, no default | Sets the header of the row-name column. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Likert survey

Six statements, 460 answers each. Shares sit inside the segments where they fit (black or white ink, whichever reads better), and the net score follows each row. Switch the quarter and the segments morph. Up and down move between statements, left and right between answers.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { DivergingBarChart } from "@/components/sheenui/charts/diverging-bar-chart";
import { divergingLegend, type DivergingLevel } from "@/components/sheenui/charts/diverging-bar-chart/model";
import { DivergingBarTable } from "@/components/sheenui/charts/diverging-bar-chart/table";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, divergingLegend, DivergingBarTable, DivergingBarChart, type DivergingLevel } from "@sheenui/theme";

const levels: DivergingLevel[] = [
  { key: "sd", label: "Strongly disagree" },
  { key: "d", label: "Disagree" },
  { key: "n", label: "Neutral" },
  { key: "a", label: "Agree" },
  { key: "sa", label: "Strongly agree" },
];
const data = [
  { statement: "The product is easy to learn", sd: 12, d: 30, n: 64, a: 214, sa: 160 },
  { statement: "It saves me time every week", sd: 9, d: 24, n: 51, a: 222, sa: 174 },
  { statement: "Support answers quickly", sd: 22, d: 48, n: 90, a: 196, sa: 124 },
];

export function Example() {
  return (
    <ChartCard
      title="Customer survey"
      legend={divergingLegend(levels)}
      table={<DivergingBarTable data={data} index="statement" levels={levels} indexLabel="Statement" caption="Survey answers" />}
    >
      <DivergingBarChart data={data} index="statement" levels={levels} aria-label="Survey answers, from strongly disagree to strongly agree" />
    </ChartCard>
  );
}
```

## Example 2 of 2: Population pyramid

variant="butterfly" with two levels: men to the left, women to the right of the spine, the age groups in the middle. One scale for both sides, so the halves compare honestly.

```tsx
import { DivergingBarChart } from "@/components/sheenui/charts/diverging-bar-chart";
// Package build (after the first npm release, or a packed tarball): import { DivergingBarChart } from "@sheenui/theme";

const population = [
  { age: "60+", men: 3_400_000, women: 4_100_000 },
  { age: "40–59", men: 4_900_000, women: 5_000_000 },
  { age: "20–39", men: 5_200_000, women: 5_100_000 },
  { age: "0–19", men: 4_300_000, women: 4_100_000 },
];

export function Example() {
  return (
    <DivergingBarChart
      variant="butterfly"
      data={population}
      index="age"
      levels={[
        { key: "men", label: "Men" },
        { key: "women", label: "Women" },
      ]}
      aria-label="Population by age group and sex"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart. It is one tab stop; the arrow keys then read it. |
| ↑ / ↓ | Move between rows. |
| ← / → | Move between a row's segments. |
| Home / End | Jump to the first / last row. |
| Escape | Clear the reading. |

## Accessibility

- The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Shares are printed as text and every Likert row has a net score, so color never carries the reading; each move announces the row and segment.
- DivergingBarTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.
- Reduced motion: the bars appear at their final lengths on either side of zero and data changes jump instead of morphing.

## All exports on this page

- DivergingBarChart — Bars that diverge from a midpoint.
- DivergingBarTable — Every row's count and share per level (plus the net score of a Likert row).
- defaultDivergingBarChartLabels — The built-in English strings of DivergingBarChart; spread it into your own labels and change what you need.
- divergingLegend — Legend items for a diverging chart, in level order (or the two sides of a butterfly).
- divergingLevels — Each level's side and colour: equal steps per arm, strongest at the extremes, a grey neutral.


## When to use the diverging bar chart

- Use the likert variant as a Likert scale chart for survey results, such as strongly disagree through strongly agree per question, with each row summing to 100 percent and a net score after it.
- Use the butterfly variant for a population pyramid or an A/B comparison, drawing two groups back to back from a central spine on one shared scale with row names down the middle.
- Use it for sentiment by product feature or NPS-style breakdowns, where positive and negative answers should pull to opposite sides of a neutral midpoint.
- Skip it when the categories are not ordered or have no meaningful midpoint, because a Bar chart or Percent bar chart fits unordered parts of a whole better.
- Pair it with ChartCard and DivergingBarTable for a text view, ChartLegend to explain the answer levels, and a Select to switch the survey wave.


## Frequently asked questions

### How do I make a diverging bar chart for Likert data in React?

Pass data rows with an index key, then levels from most negative to most positive. With an odd count the middle level is neutral and straddles the center line, or set neutral to a key. negativeColor and positiveColor pick the two poles.

### How do I draw a population pyramid?

Set variant to butterfly and give exactly two levels, which draw left and right of the spine. colors takes a pair of palette slots, defaulting to 7 and 5. Set normalize to show each side's share of the grand total instead of raw counts.

### Does it rely on color to carry the meaning?

No. Shares are printed inside segments where they fit, and each Likert row ends with a net score of positive minus negative, controlled by showNet. The group is named by aria-label, and keyboard moves announce the row and segment.

### Which keys move between rows and segments?

Tab focuses the chart. Up and Down move between rows, Left and Right move between a row's segments, Home and End jump to the first and last row, and Escape clears. Under reduced motion segments draw and morph instantly rather than sweeping out from the center.


## Related pages

- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)
- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)
- [Dumbbell & slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
