Canonical: https://lokendra-builds.github.io/sheenui/charts/bar-list

# React Bar List: Ranked Top-N Chart

URL: https://lokendra-builds.github.io/sheenui/charts/bar-list
Sidebar name: Bar list

A React bar list: a ranked top-N chart with a soft bar behind each name, compact in cards and a plain list to screen readers. A Tremor-style bar list. MIT.

What it is: A React bar list draws each value as a soft bar behind its name: the most compact way to rank many named values in a card. Pass data as readonly BarListItem[]: one row per item: { name: "Google", value: 4821 }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bar-list.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Bar list

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{bar-list.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/button/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: bar-list. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BarList, type BarListItem, BarListTable } from "@/components/sheenui/charts/bar-list";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BarList, type BarListItem, BarListTable, ChartCard } from "@sheenui/theme";
```

## BarList

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BarListItem[] | required | One row per item: { name: "Searchly", value: 4821 }. Negative values draw no bar. |
| color | ChartColor | 1 | Hue of the bars: a palette slot (1–8). One list, one hue. |
| sortOrder | "none" \| "ascending" \| "descending" | "descending" | Row order. "none" keeps the order of data. |
| limit | number | optional, no default | Rows shown before "Show more". Omit to show every row. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| showShare | boolean | false | Print each row's share of the total after its value. |
| nameHeader | ReactNode | optional, no default | Column captions above the rows, e.g. "Source" / "Visits". |
| valueHeader | ReactNode | optional, no default | Column caption above the values, e.g. "Visits". |
| onValueChange | ((item: BarListItem) => void) | optional, no default | Makes every row a button. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |
| labels | Partial<BarListLabels> | defaultBarListLabels | Override the "Show more", "Show less" and "of total" strings (i18n). Every other string, for translation: labels={{ showMore: "…" }}; omitted keys keep the English of defaultBarListLabels. All 3 keys of BarListLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the list for assistive tech. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BarListTable

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly BarListItem[] | required | One row per item: { name: "Searchly", value: 4821 }. Negative values draw no bar. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the default number formats. |
| sortOrder | "none" \| "ascending" \| "descending" | "descending" | Row order. "none" keeps the order of data. |
| formatPercent | ((ratio: number) => string) | percentages in locale | Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| headers | Partial<{ name: string; value: string; share: string; }> | optional, no default | Override the column headers: { name, value, share }. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 2: Top referrers, top 5

Shows the top five; “Show more” reveals the rest without rescaling the bars, since every bar shares the list's largest value. Rows are buttons here: click or press Enter to filter by a source.

```tsx
import { useState } from "react";
import { BarListTable, BarList, type BarListItem } from "@/components/sheenui/charts/bar-list";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, BarListTable, BarList, type BarListItem } from "@sheenui/theme";

const referrers: BarListItem[] = [
  { name: "Searchly", value: 4821 },
  { name: "Direct", value: 3207 },
  { name: "codehost.example", value: 1342 },
  { name: "Hacker News", value: 655 },
  { name: "Lookup", value: 287 },
  { name: "Newsletter", value: 214 },
];

export function Example() {
  const [filter, setFilter] = useState<string | null>(null);
  return (
    <ChartCard title="Top referrers" description={filter ? "Filtered by " + filter : "All sources"} table={<BarListTable data={referrers} />}>
      <BarList
        data={referrers}
        limit={5}
        showShare
        nameHeader="Source"
        valueHeader="Visitors"
        onValueChange={(item) => setFilter(item.name)}
        aria-label="Visitors by referrer"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: Top pages, linked and re-ranked

Each row is a link (the whole row is its hit area) with an icon. Switch the range: rows glide to their new rank and bars resize, with transform-only animation that's instant under reduced motion. Where a short bar would end inside a name, its solid end becomes two ticks above and below the text.

```tsx
import { BarList, type BarListItem } from "@/components/sheenui/charts/bar-list";
// Package build (after the first npm release, or a packed tarball): import { BarList, type BarListItem } from "@sheenui/theme";

const pageIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M4 1.75h5.25L12.5 5v9.25H4z" />
    <path d="M9 1.75V5.25h3.5" />
  </svg>
);

const pages: BarListItem[] = [
  { name: "/docs/getting-started", value: 2140, href: "/docs/getting-started", icon: pageIcon },
  { name: "/components/button", value: 1380, href: "/components/button", icon: pageIcon },
  { name: "/charts", value: 920, href: "/charts", icon: pageIcon },
  { name: "/foundations", value: 480, href: "/foundations", icon: pageIcon },
];

export function Example() {
  return <BarList data={pages} color={3} nameHeader="Page" valueHeader="Views" aria-label="Most viewed pages" />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move to each row that is a button (onValueChange) or a link (href), and to “Show more”. A plain list has no tab stops. |
| Enter / Space on a button row | Activate it (for example, filter by that row). |
| Enter on a link row | Follow the link. |
| Enter / Space on Show more | Reveal the remaining rows. |

## Accessibility

- The list is a real <ul>, so screen readers read each row's name, value and (with showShare) share as text. aria-label names the list and is required.
- Interactive rows have a solid inset focus ring and are ordinary tab stops.
- For a non-visual reading, give ChartCard's table prop a BarListTable; the Chart / Table tabs then expose each value as plain table cells.
- Under reduced motion nothing morphs: the bars render at their final lengths and new data replaces the old at once.

## All exports on this page

- BarList — A ranked list with each value drawn as a soft bar behind its label (Tremor style): the most compact way to compare many named values.
- BarListTable — Every row with its value and share of the total, in the list's order.
- defaultBarListLabels — The built-in English strings of BarList; spread it into your own labels and change what you need.


## When to use the bar list

- Use it as a ranked list chart for a top-referrers or top-pages card in an analytics dashboard, where five to ten named rows need a visible size comparison but a full bar chart would eat the whole card. It works as a tremor bar list alternative: ranked horizontal bars with a text table behind them.
- Use it for ranked leaderboards such as best-selling products, busiest API endpoints or support tickets by team, with a Show more button once you set limit so the card stays short.
- Make rows interactive when the list doubles as a filter: onValueChange turns each row into a button that sets a dashboard filter, while an item with an href becomes a link (onValueChange wins if you set both).
- Skip it when the values change over time or the categories have no natural ranking, because a Bar chart or Line chart shows trends and groups far better than a sorted list does.
- Pair it with ChartCard and BarListTable so the card gets a chart and table switch, and with SegmentedControl to flip the same list between a 7-day and 30-day range.


## Frequently asked questions

### How do I build a react bar list with only the top 5 rows?

Pass limit={5}. BarList renders the first five rows after sorting and adds a Show more button for the rest. All bars share one scale, the largest value in the whole list, so revealing hidden rows never rescales the bars you already see.

### Is the bar list accessible to screen readers?

It renders a real ul of rows, so assistive tech reads name, value and, with showShare, the share of the total as plain text. aria-label is required. Rows that are buttons or links are normal tab stops: Enter or Space activates a button, Enter follows a link.

### Can I change the number format, locale or button text?

Yes. format and formatPercent replace the defaults, which are compact numbers and percentages in locale (default en). The labels prop overrides the Show more, Show less and of total strings, and you can spread defaultBarListLabels into your own object for translation.

### What happens with negative values and reduced motion?

Negative values draw no bar. With prefers-reduced-motion the grow-in on first scroll into view and the glide when new data re-ranks the rows are both skipped, so bars and rows change instantly.


## Related pages

- [Beeswarm](https://lokendra-builds.github.io/sheenui/charts/beeswarm)
- [Box plot & violin](https://lokendra-builds.github.io/sheenui/charts/box-plot)
- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart)
- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
