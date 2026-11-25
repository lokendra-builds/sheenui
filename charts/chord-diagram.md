Canonical: https://lokendra-builds.github.io/sheenui/charts/chord-diagram

# Chord Diagram for React

URL: https://lokendra-builds.github.io/sheenui/charts/chord-diagram
Sidebar name: Chord diagram

A React chord diagram for flows between a handful of groups (upgrades and downgrades, code reviews, trade) drawn as ribbons across a circle. Accessible.

What it is: A React chord diagram draws flows between a handful of groups as ribbons across a circle. Pass groups plus a square matrix: matrix[i][j] is the flow from group i to group j.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/chord-diagram.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Chord diagram

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{chord-diagram.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/charts/chart-parts/`
- `components/charts/chord-diagram/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts, use-resolved-scheme.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: chord-diagram. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChordDiagram } from "@/components/sheenui/charts/chord-diagram";
import { type ChordGroup, chordLegend } from "@/components/sheenui/charts/chord-diagram/model";
import { ChordTable } from "@/components/sheenui/charts/chord-diagram/parts";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, ChordDiagram, type ChordGroup, chordLegend, ChordTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| groups | readonly ChordGroup[] | required | The groups around the circle, in order (≤ 8; the rest fold into "Other"). |
| matrix | readonly (readonly number[])[] | required | matrix[i][j]: the flow from group i to group j (the ribbon's width at i). Missing and negative values read as 0. |
| height | number | 360 | Height in px; the circle fits the smaller of width and height. |
| padAngle | number | 0.04 | Gap between groups, in radians. |
| showLabels | boolean | true | Print each group's name outside the ring where it fits; names that don't fit are listed in a legend under the circle. |
| format | ((n: number) => string) | compact numbers in locale | Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| onGroupClick | ((group: { id: string; label: string; outflow: number; inflow: number; }) => void) | optional, no default | Called with { id, label, outflow, inflow } when a group is clicked, tapped, or activated with Enter. Makes groups interactive. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<ChordDiagramLabels> | defaultChordDiagramLabels | Every other string, for translation: labels={{ roleDescription: "…" }}; omitted keys keep the English of defaultChordDiagramLabels. All 10 keys of ChordDiagramLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## ChordTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| format | ((n: number) => string) | compact numbers in locale | Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| groups | readonly ChordGroup[] | required | The groups around the circle, in order (≤ 8; the rest fold into "Other"). |
| matrix | readonly (readonly number[])[] | required | matrix[i][j]: the flow from group i to group j (the ribbon's width at i). Missing and negative values read as 0. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| labels | Partial<ChordTableLabels> | defaultChordTableLabels | Column headers. Merged over defaultChordTableLabels. Every other string, for translation: labels={{ corner: "…" }}; omitted keys keep the English of defaultChordTableLabels. All 3 keys of ChordTableLabels are listed in the key table under the props table. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 2: Plan changes, quarter on quarter

Accounts that moved between plans. Hover a plan to light up its ribbons; hover a ribbon to read both directions. Switch the quarter: every arc and ribbon tweens to its new angle. With the keyboard, left and right go around the plans, down steps through a plan's ribbons.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChordDiagram } from "@/components/sheenui/charts/chord-diagram";
import { type ChordGroup } from "@/components/sheenui/charts/chord-diagram/model";
import { ChordTable } from "@/components/sheenui/charts/chord-diagram/parts";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const groups: ChordGroup[] = [
  { id: "free", label: "Free", color: 7 },
  { id: "starter", label: "Starter", color: 3 },
  { id: "pro", label: "Pro", color: 1 },
  { id: "team", label: "Team", color: 5 },
  { id: "enterprise", label: "Enterprise", color: 2 },
];
// matrix[from][to]: accounts that moved from one plan to another.
const matrix = [
  [0, 640, 410, 120, 16],
  [230, 0, 540, 190, 26],
  [130, 270, 0, 460, 95],
  [35, 80, 210, 0, 210],
  [4, 12, 45, 130, 0],
];

<ChartCard
  title="Plan changes"
  table={<ChordTable groups={groups} matrix={matrix} caption="Moves between plans" />}
>
  <ChordDiagram groups={groups} matrix={matrix} aria-label="Accounts moving between plans this quarter" />
</ChartCard>
```

## Example 2 of 2: Code review across teams, names in the legend

showLabels={false} leaves the names to the ChartCard legend (chordLegend), so the circle gets all the room. With the default showLabels, names that would not fit around the ring (a phone, a crowded side) move into a legend under the circle by themselves.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChordDiagram } from "@/components/sheenui/charts/chord-diagram";
import { chordLegend, type ChordGroup } from "@/components/sheenui/charts/chord-diagram/model";
import { ChordTable } from "@/components/sheenui/charts/chord-diagram/parts";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, chordLegend, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const teams: ChordGroup[] = [
  { id: "web", label: "Web", color: 1 },
  { id: "mobile", label: "Mobile", color: 2 },
  { id: "platform", label: "Platform", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "design", label: "Design system", color: 5 },
  { id: "infra", label: "Infrastructure", color: 7 },
];

// reviews[i][j]: pull requests team i reviewed from team j
const reviews = [
  [0, 46, 38, 12, 64, 9],
  [41, 0, 22, 8, 37, 6],
  [29, 18, 0, 44, 11, 57],
  [9, 6, 39, 0, 4, 31],
  [58, 33, 7, 3, 0, 2],
  [5, 4, 49, 27, 1, 0],
];

export function Example() {
  return (
    <ChartCard
      title="Who reviews whom"
      legend={chordLegend(teams)}
      table={<ChordTable groups={teams} matrix={reviews} caption="Reviews between teams" />}
    >
      <ChordDiagram
        groups={teams}
        matrix={reviews}
        showLabels={false}
        height={320}
        aria-label="Pull request reviews between six teams, last 90 days"
      />
    </ChartCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the diagram (one stop). |
| ← / → | Previous / next group around the circle; on a ribbon, back to its group / on to its other end. |
| ↓ / ↑ | Step through the active group's ribbons, largest first (↑ from the first ribbon returns to the group; ↑ on a group goes round to its last ribbon). |
| Home / End | First / last group. |
| Enter / Space | Call onGroupClick for the active group. |
| Escape | From a ribbon back to its group; then clear the reading. |

## Accessibility

- The diagram is one focusable figure with the role description “chord diagram”; keys never scroll the page while it has focus.
- A group is announced with its outflow, inflow and share (“Pro: 1,185 out, 1,235 in, 30% of all flow. 5 ribbons”); a ribbon reads both directions.
- Names that don't fit around the ring move into a legend under it by themselves; the Table view (ChordTable) is the full matrix.
- On the light theme, crowded diagrams (more than 5 groups) blend ribbons normally at a lower opacity, so crossings stay clean and readable.
- Reduced motion: the ring and ribbons appear at once and data changes jump.

## All exports on this page

- ChordDiagram — Flows between a handful of groups (≤ 8) as ribbons across a circle: who hands work to whom, plan upgrades and downgrades, trade between regions.
- ChordTable — The flow matrix as a table: one row per source group, one column per target, plus row totals.
- chordLegend — Legend items for a chord diagram (pass to ChartCard's legend, useful when names don't fit outside the ring).
- defaultChordDiagramLabels — The built-in English strings of ChordDiagram; spread it into your own labels and change what you need.
- defaultChordTableLabels — English defaults of ChordTableLabels.


## When to use the chord diagram

- Use it as a chord chart for flows between a handful of groups that go both ways: who hands tickets to whom across support tiers, plan upgrades and downgrades, or trade between regions.
- Use it to show migration between segments, such as customers moving among free, pro and enterprise plans, where each ribbon's width at an end is the flow leaving that group.
- Make groups clickable with onGroupClick, which receives the id, label, outflow and inflow, so a click can open a drill-down for that team or region.
- Skip it when flows run one way from sources to targets or you have more than eight groups, because a Sankey chart handles directed stages and the Chord folds the extras into Other.
- Pair it with ChartCard and ChordTable, which gives the whole flow matrix as text, and with a Select to switch the period the matrix covers.


## Frequently asked questions

### How do I build a chord diagram in React?

Pass groups, each with an id and label, and a matrix where matrix[i][j] is the flow from group i to group j. Missing and negative values read as 0. Each group's arc is its total outflow, and aria-label is required. Up to eight groups are shown.

### What happens with more than eight groups?

The chart is designed for eight groups or fewer, and the rest fold into an Other group. Choose the groups you care about and let the long tail collapse, or use a Sankey chart when the flows run one way from sources to targets.

### How do I read a ribbon with the keyboard?

Tab focuses the chart. Left and Right move around the groups, and Down and Up step through a group's ribbons. Left and Right on a ribbon jump between its two ends, and Escape clears. Moves announce flows in both directions, and Enter activates a group when onGroupClick is set.

### Can I tweak the ring size and labels?

height sets the chart height in px (default 360) and the circle fits the smaller of width and height. padAngle sets the gap between groups in radians (default 0.04). showLabels prints names outside the ring where they fit and lists the rest in a legend underneath.


## Related pages

- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)
- [Error bars](https://lokendra-builds.github.io/sheenui/charts/error-bar-chart)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/population-pyramid)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
