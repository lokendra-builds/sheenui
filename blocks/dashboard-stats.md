Canonical: https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats

# Dashboard Stat Cards for React with Sparklines

URL: https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats
Sidebar name: Dashboard stats

Glass KPI stat cards for React dashboards: numbers count up, sparklines draw in and periods switch with a sliding pill. Tailwind CSS v4 + Motion. MIT.

What it is: Dashboard stat cards for React are glass KPI cards whose numbers count up, sparklines draw in and periods switch with a sliding pill.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dashboard-stats.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Dashboard stats

Files to copy from `theme/src/`:

- `blocks/{dashboard-stats.tsx, icons.tsx}`
- `components/charts/{chart-utils.ts, sparkline.tsx}`
- `components/glass-card/`
- `components/status-icons/`
- `components/tabs/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{light-follower.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, math.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: dashboard-stats. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { DashboardStats } from "@/components/sheenui/blocks/dashboard-stats";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { DashboardStats } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, Stat[]> | demoData | Stats per period (Record<string, Stat[]>). Keys become the period tabs. Default: built-in demo numbers for 7d, 30d and 90d. The default is sample content for demos and prototypes: pass your own in production. |
| title | string | "Overview" | The section heading (string, default "Overview"); it also names the section for screen readers. |
| headingLevel | HeadingLevelOption | 2 | Level of the section heading (1 to 5, default 2); the stat labels sit one level below. "none" renders paragraphs with no heading role (for an example). |
| currency | string | "USD" | ISO 4217 currency for "currency" stats (string, default "USD"). |
| locale | string | "en-US" | BCP 47 locale used to format every number (string, default "en-US"). |
| labels | Partial<DashboardStatsLabels> | defaultDashboardStatsLabels | Every other string, for translation: labels={{ period: "…" }}; omitted keys keep the English of defaultDashboardStatsLabels. All 4 keys of DashboardStatsLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer <section> (string). |
| Stat | { label, value, change, trend, format?, goodWhen? } | optional, no default | change is a % vs the previous period; goodWhen: "down" suits churn or response time. |

## Example 1 of 2: Stat cards

Overview

```tsx
import { DashboardStats } from "@/components/sheenui/blocks/dashboard-stats";
// Package build (after the first npm release, or a packed tarball): import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Overview"
  currency="USD"
  data={{
    "7d":  [{ label: "Revenue", value: 48250, change: 12.4, trend: [30, 34, 31, 38, 42, 40, 48], format: "currency" } /* … */],
    "30d": [/* … */],
  }}
/>
```

## Example 2 of 2: Your numbers, periods and currency

The keys of data become the period tabs (“4w” reads as “Last 4 weeks”). goodWhen: “down” turns a falling churn rate green; currency and locale format every figure.

```tsx
import { DashboardStats } from "@/components/sheenui/blocks/dashboard-stats";
// Package build (after the first npm release, or a packed tarball): import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Team health"
  currency="EUR"
  locale="de-DE"
  data={{
    "4w": [
      { label: "Revenue", value: 18400, change: 6.2, trend: [11, 12, 14, 13, 16, 18], format: "currency" },
      { label: "Churn", value: 2.1, change: -0.4, trend: [3, 2.8, 2.6, 2.4, 2.2, 2.1], format: "percent", goodWhen: "down" },
    ],
    "12m": [
      { label: "Revenue", value: 212000, change: 18.9, trend: [90, 110, 130, 160, 190, 212], format: "currency" },
      { label: "Churn", value: 2.4, change: 0.3, trend: [2.1, 2.0, 2.2, 2.3, 2.3, 2.4], format: "percent", goodWhen: "down" },
    ],
  }}
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Reach the period tabs. |
| ← / → | Previous / next period. |
| Home / End | First / last period. |

## Accessibility

- A labeled <section>; each period tab shows “7d” and is named “7d, Last 7 days”, so the visible text is part of the name.
- The change badge reads “Up 12.4% vs previous period”, and the animated count is hidden from screen readers, which get the final figure at once.
- Each sparkline has a text name.

## All exports on this page

- DashboardStats — A row of KPI cards (value, change badge, sparkline) with a period switcher.
- defaultDashboardStatsLabels — The English DashboardStatsLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the dashboard stat cards

- Use DashboardStats as a row of KPI cards with sparklines at the top of an analytics overview, where four cards for revenue, active users, conversion and signups each show a value, change badge and sparkline.
- Use it for a product or ops dashboard with a 7d, 30d and 90d switcher, passing one Stat array per period key in the data prop and letting the keys become tabs.
- Use it for metrics where lower is better, such as churn or response time, by setting goodWhen to "down" so a falling number reads as good news.
- Skip it when you need to explore one metric in depth with axes, tooltips and a legend; a full chart component fits better than a KPI card with a sparkline.
- Pair it with Sparkline for custom trend visuals, Tabs if you want a second switcher elsewhere, and the chart components lower on the page for the detail behind each figure.


## Frequently asked questions

### How do I add React dashboard stat cards with period tabs?

Pass data as a Record where each key (like 7d or 30d) maps to an array of Stat objects with label, value, change and trend. The keys become the period tabs. Set currency and locale for number formatting, and use format: "currency" or "percent" on a stat when needed.

### How do the values count up, and what about reduced motion?

The figure animates from zero on first show using a Motion value. With reduced motion enabled it appears immediately. Screen readers do not hear the animated count; they receive the final figure at once, and the change badge reads as "Up 12.4% vs previous period".

### Why is the period tab named "7d, Last 7 days"?

The visible text is 7d, and the accessible name begins with that same text before adding the long form. That keeps voice control working (WCAG 2.5.3) while screen readers get a clearer description. Override periodName in labels to change the spoken form, and use arrow, Home and End keys to move between tabs.

### How many columns do the cards use, and how do I theme them?

The grid follows the block's own width rather than the viewport, using 1, 2 or 4 columns, so it behaves inside a narrow sidebar layout too. Each card is a level-2 glass card. Add className to the outer section, and use the title prop to rename the heading from Overview.


## Related pages

- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [AI chat](https://lokendra-builds.github.io/sheenui/blocks/ai-chat)
- [Sign-up page](https://lokendra-builds.github.io/sheenui/blocks/signup-page)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
