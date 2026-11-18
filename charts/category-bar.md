Canonical: https://lokendra-builds.github.io/sheenui/charts/category-bar

# Category Bar: Segmented Score Bar for React

URL: https://lokendra-builds.github.io/sheenui/charts/category-bar
Sidebar name: Category bar

A React category bar: one bar split into named bands with a pin for the current value, for credit scores, latency budgets and NPS. Accessible, glass style.

What it is: A React category bar splits one bar into named bands and pins where a value sits, such as a credit score or an NPS. Pass data as readonly CategoryBarItem[]: the bands, start to end.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/category-bar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Category bar

Files to copy from `theme/src/`:

- `components/charts/{category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
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

Registry item: category-bar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { CategoryBar } from "@/components/sheenui/charts/category-bar";
import { type CategoryBarItem } from "@/components/sheenui/charts/category-bar/model";
import { CategoryBarTable } from "@/components/sheenui/charts/category-bar/parts";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { CategoryBar, type CategoryBarItem, CategoryBarTable, ChartCard } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CategoryBarItem[] | required | The bands, start to end. Their values are widths on one scale. |
| start | number | 0 | Where the scale starts (e.g. 300 for a credit score). |
| marker | number \| null | null | A value on the same scale to point at (e.g. the current score). A value past either end keeps its real number (bubble, announcement, table) while the pin waits at that end with an arrow. |
| markerLabel | string | optional, no default | Text in the marker's bubble, before its value (e.g. "Your score"). |
| showValues | boolean | true | Print the values at the band boundaries under the bar. |
| showLegend | boolean | false | Print each band's colour key and name under the bar. |
| size | "sm" \| "md" \| "lg" | "md" | Bar thickness: "sm" 6px, "md" 8px (default), "lg" 12px. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number format. |
| emptyState | ReactNode | optional, no default | Shown when there are no bands. |
| labels | Partial<CategoryBarLabels> | defaultCategoryBarLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultCategoryBarLabels. All 11 keys of CategoryBarLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the bar for assistive tech (e.g. "Credit score bands"). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## CategoryBarTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly CategoryBarItem[] | required | The bands, start to end. Their values are widths on one scale. |
| marker | number \| null | optional, no default | A value on the same scale to point at (e.g. the current score). A value past either end keeps its real number (bubble, announcement, table) while the pin waits at that end with an arrow. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| start | number | 0 | Where the scale starts (e.g. 300 for a credit score). |
| labels | Partial<CategoryBarLabels> | defaultCategoryBarLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultCategoryBarLabels. All 11 keys of CategoryBarLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number format. |
| markerLabel | string | optional, no default | Text in the marker's bubble, before its value (e.g. "Your score"). |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the data table cells: takes the share, returns the text shown. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |

## Example 1 of 2: Score with a marker

Bands on a 300–850 scale. Switch the month: the pin glides to the new score and its number rolls. Focus the bar and use the arrow keys to read each band.

```tsx
import { CategoryBar } from "@/components/sheenui/charts/category-bar";
import { type CategoryBarItem } from "@/components/sheenui/charts/category-bar/model";
import { CategoryBarTable } from "@/components/sheenui/charts/category-bar/parts";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, CategoryBarTable, CategoryBar, type CategoryBarItem } from "@sheenui/theme";

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
</ChartCard>
```

## Example 2 of 2: Budgets and scores

Custom formats, a scale that starts below zero, and the compact size. Long boundary values drop out before they could touch.

```tsx
import { CategoryBar } from "@/components/sheenui/charts/category-bar";
import { type CategoryBarItem } from "@/components/sheenui/charts/category-bar/model";
// Package build (after the first npm release, or a packed tarball): import { CategoryBar, type CategoryBarItem } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the bar (one tab stop). |
| → / ↓ | Next band (← in right-to-left layouts). |
| ← / ↑ | Previous band. |
| Home / End | First / last band. |
| Escape | Stop reading. |

## Accessibility

- The bar is one focusable figure with a role description of “chart”; its description is the keyboard hint, and its description lists every band and where the marker falls.
- Moving through the bands announces each span once through a polite live region; pointer hovers stay silent.
- Bands are named in the legend, the tooltip and the table: color is never the only cue. Boundary values thin out instead of overlapping.
- On touch screens the hit area grows to 44px without moving anything; forced colors outline every band and the pin.
- Reduced motion: bands, pin and number appear in place, with no slide or roll.

## All exports on this page

- CategoryBar — A single bar split into bands, with an optional marker: where a score, a reading or a forecast sits on a scale of named ranges (Tremor's CategoryBar).
- CategoryBarTable — Every band with its span and share of the scale, then where the marker falls.
- defaultCategoryBarLabels — The built-in English strings of CategoryBar; spread it into your own labels and change what you need.


## When to use the category bar chart

- Use it as a credit score bar to place a score, risk rating or health reading on a scale of named bands such as Poor, Fair, Good and Excellent, with the marker showing where the person sits now. Use it as a segmented bar chart when one total splits into a few named bands, such as a score ranging from low to high.
- Use it as a compact forecast bar inside a table row or settings card: bands sized to real values, boundary numbers underneath, and one pin with a label and value bubble.
- Set start when the scale does not begin at zero, for example 300 for a credit score, and marker to a value outside the scale to see it pinned to an end with an arrow.
- Skip it when the segments are parts of a whole that must sum to something, where a Percent bar chart or Donut chart fits, or when you rank many items, where Bar list is the better tool.
- Pair it with ChartCard and CategoryBarTable for a text view, plus a Badge next to it to name the current band in words for readers who skip charts.


## Frequently asked questions

### How do I make a category bar in React with a marker?

Pass data as bands whose values are widths on one scale, then marker with the number to point at and markerLabel such as Your score. The pin carries a glass bubble with the label and value, and its number rolls as the pin slides to a new value.

### What if the marker is outside the scale?

A value past either end keeps its real number in the bubble, the announcement and the table, while the pin waits at that end with an arrow. That way an out-of-range reading is never silently clamped to look like an in-range one.

### How can keyboard and screen reader users read the bands?

Tab focuses the bar, then the arrow keys move between bands (mirrored in right-to-left), Home and End jump to the ends, and Escape clears. Every band and the marker are in the chart's description, so nothing depends on color alone. aria-label is required.

### Can I change the thickness and the printed values?

size accepts sm for 6px, md for 8px (the default) or lg for 12px. showValues prints the boundary values under the bar, thinned so they never collide, and showLegend adds a color key with each band's name. Both are booleans, and showValues defaults to true.


## Related pages

- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)
- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
