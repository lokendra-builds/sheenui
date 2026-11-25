Canonical: https://lokendra-builds.github.io/sheenui/charts/sparkbar

# Sparkbar: Mini Bar Chart for React Tables

URL: https://lokendra-builds.github.io/sheenui/charts/sparkbar
Sidebar name: Sparkbar

A React sparkbar: a mini bar chart for stat tiles and table cells, with a win/loss mode and a spoken summary for screen readers. Glass style, Tailwind v4.

What it is: A React sparkbar is a mini bar chart for stat tiles and table cells, the bar twin of the sparkline. Pass values as a readonly number[], oldest first; a missing entry leaves a gap, never a zero.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/sparkbar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Sparkbar

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{sparkbar.tsx, chart-utils.ts}`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, math.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: sparkbar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Sparkbar } from "@/components/sheenui/charts/sparkbar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, Sparkbar } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| values | readonly (number \| null \| undefined)[] | required | Values, oldest first. A missing (non-numeric) entry leaves its slot empty: a gap, never a zero. |
| variant | "bar" \| "winloss" | "bar" | "bar": tiny columns, sized by value (negative values hang below a zero line). "winloss": only the sign counts: up for a win (> 0), down for a loss (< 0), a dash for a draw (0). |
| highlight | number \| "none" \| "last" | variant === "bar" ? "last" : "none" | Which bar to emphasise at full strength; the rest step back to a lighter step of the same hue. "last" (the latest value; default for "bar"), "none" (default for "winloss"), or an index into values (negative counts from the end: -1 is the last entry). An index outside values, or on a gap, emphasises nothing. |
| color | ChartColor | 1 | Colour slot of the bars ("bar"), or of wins ("winloss"). |
| negativeColor | ChartColor | 2 | Sets the colour slot of losses ("winloss"). |
| height | number | 32 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | formatCompact | Formats the low / high / latest values in the spoken summary. |
| aria-label | string | optional, no default | Name the trend, e.g. "Weekly signups". A summary of the values is appended. Without it the sparkbar is decorative. |
| labels | Partial<SparkbarLabels> | defaultSparkbarLabels | Every other string, for translation: labels={{ barSummary: "…" }}; omitted keys keep the English of defaultSparkbarLabels. All 3 keys of SparkbarLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: In stat tiles

The latest bar is drawn at full strength; earlier bars recede to a lighter tint. Values below zero hang from a zero line. Use highlight="none" when no period is special.

```tsx
import { Sparkbar } from "@/components/sheenui/charts/sparkbar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Sparkbar } from "@sheenui/theme";

const tiles = [
  {
    label: "Signups",
    value: "1,284",
    values: [62, 74, 70, 81, 77, 92, 88, 97, 104, 99, 112, 126],
    note: "Weekly, last 12 weeks",
  },
  {
    label: "Orders",
    value: "3,912",
    values: [210, 244, 236, 251, 290, 302, 287, 276, 318, 331, 309, 358, 362, 371],
    note: "Daily, last 14 days",
  },
  {
    label: "Net cash flow",
    value: "+$18.4K",
    values: [4.2, -1.8, 3.1, 5.6, -0.6, -2.4, 1.9, 6.8, 3.3, -1.1, 4.7, 2.5],
    note: "Weekly, US$ thousands",
    highlight: "none" as const,
  },
];

export function Example() {
  return (
    <>
      {tiles.map((tile) => (
        <GlassCard key={tile.label} className="flex min-w-0 flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{tile.label}</p>
          <p className="text-3xl font-semibold tracking-tight">{tile.value}</p>
          <Sparkbar
            values={tile.values}
            highlight={tile.highlight}
            aria-label={`${tile.label}, ${tile.note.toLowerCase()}`}
          />
          <p className="text-2xs text-sheen-fg-muted">{tile.note}</p>
        </GlassCard>
      ))}
    </>
  );
}
```

## Example 2 of 2: Win / loss in a table

Only the sign counts: up for a win, down for a loss, a short dash for a draw. Wins and losses use two distinct palette hues (not success and danger: a loss isn't an error).

```tsx
import { Sparkbar } from "@/components/sheenui/charts/sparkbar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Sparkbar } from "@sheenui/theme";

const standings = [
  { team: "Harbour City", results: [1, 1, -1, 1, 1, 0, 1, 1, -1, 1, 1, 1] },
  { team: "Northfield Rovers", results: [1, -1, 1, 0, 1, -1, 1, 1, 0, -1, 1, 1] },
  { team: "Ashdown Athletic", results: [-1, 1, 0, -1, 1, -1, -1, 1, 1, 0, -1, 1] },
  { team: "Kestrel Town", results: [-1, -1, 1, -1, 0, -1, 1, -1, -1, 1, -1, 0] },
];

export function Example() {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div role="region" aria-label="League form" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-start text-sm">
          <caption className="sr-only">League form, last 12 matches</caption>
          <thead className="text-xs text-sheen-fg-muted">
            <tr className="border-b border-sheen-border">
              <th scope="col" className="px-5 py-3 font-medium">Team</th>
              <th scope="col" className="px-5 py-3 font-medium">Last 12</th>
              <th scope="col" className="px-5 py-3 text-end font-medium">W–D–L</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const w = row.results.filter((r) => r > 0).length;
              const l = row.results.filter((r) => r < 0).length;
              return (
                <tr key={row.team} className="border-b border-sheen-border last:border-0">
                  <th scope="row" className="px-5 py-3 font-medium whitespace-nowrap">{row.team}</th>
                  <td className="w-56 px-5 py-3">
                    <Sparkbar
                      variant="winloss"
                      height={24}
                      values={row.results}
                      aria-label={`${row.team}, last 12 matches`}
                    />
                  </td>
                  <td className="px-5 py-3 text-end whitespace-nowrap tabular-nums">
                    {w}–{row.results.length - w - l}–{l}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not applicable: the sparkbar is not interactive, so it is not a tab stop. |

## Accessibility

- With an aria-label it is an image named by that label plus a short summary (or “No data”); without one it is decorative.
- Put the number it summarizes next to it as text: the bars are a glanceable hint, not the only source of the value.
- Under reduced motion nothing morphs: the bars render at their final values and new data replaces the old at once.

## All exports on this page

- Sparkbar — A tiny bar chart for stat tiles and table cells: magnitude ("bar") or wins and losses ("winloss").
- defaultSparkbarLabels — The built-in English strings of Sparkbar; spread it into your own labels and change what you need.


## When to use the sparkbar chart

- Use it as a sparkline bar chart inside a stat tile to show the last twelve periods of a metric beside the current number, with the latest bar at full strength and history in a lighter tint.
- It fits a table cell showing a team's recent record, using variant winloss so only the sign of each result is drawn: up for a win, down for a loss, a short dash for a draw.
- It works for tiny trend hints in a list of accounts or projects, where hundreds of rows need a glanceable shape and not a full chart with axes.
- Skip it when readers need to hover for values or compare axes, since a sparkbar is not interactive; use BarChart for that, or Sparkline when the series is a continuous line rather than discrete periods.
- Pair it with Sparkline for continuous trends, Badge or a plain number for the headline value next to it, and DataTable to place a sparkbar in a column.


## Frequently asked questions

### How is a mini bar chart in React different from a sparkline?

Sparkbar is the bar twin of Sparkline: each value is a discrete period drawn as its own bar, sized by value, with negative values hanging from a zero line. Use it for counts per day, week or month.

### How do I highlight a specific bar?

highlight defaults to last in bar mode and none in win/loss mode. Pass a number to index values, with negatives counting from the end, or none when no period is special. The other bars step back to a lighter tint of the same hue.

### What does a screen reader hear?

With an aria-label, the sparkbar is an image named by that label plus a summary: low, high and latest, or the win/loss record, or No data. Without a label it is decorative, so put the number it summarizes beside it as text.

### How are missing values handled?

values accepts numbers, null or undefined, oldest first. A missing entry leaves its slot empty, so there is a gap and never a zero. Bars never grow wider than 12px, height defaults to 32, and the width follows the container.


## Related pages

- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph)
- [Real-time chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)
- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
