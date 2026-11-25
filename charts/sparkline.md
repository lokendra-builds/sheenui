Canonical: https://lokendra-builds.github.io/sheenui/charts/sparkline

# Sparkline for React: Tiny Trend Charts

URL: https://lokendra-builds.github.io/sheenui/charts/sparkline
Sidebar name: Sparkline

A React sparkline for stat tiles and tables: a tiny animated trend line with a spoken summary for screen readers. Glass style, Tailwind CSS v4, free, MIT.

What it is: A React sparkline is a tiny trend line for stat tiles and table cells, summarized in words for screen readers. Pass values as a readonly number[], oldest first.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/sparkline.json
```

By Lokendra Singh Rathore. Published November 10, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Sparkline

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{sparkline.tsx, chart-utils.ts}`
- `hooks/{use-controllable.ts, use-intersection.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, math.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: sparkline. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Sparkline } from "@/components/sheenui/charts/sparkline";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, Sparkline } from "@sheenui/theme";
```

## Sparkline props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| values | readonly number[] | required | Values, oldest first. Non-numeric entries are skipped. |
| variant | "accent" \| "muted" | "accent" | "muted" de-emphasises the trend; "accent" draws it in the first chart colour. |
| tone | "accent" \| "muted" | undefined | Old name of variant (it is a visual form, not a semantic colour). Still honoured; variant wins. |
| height | number | 40 | Height of the chart in px; the width follows the container. |
| area | boolean | true | Soft fill under the line (a gradient that fades to transparent). |
| curve | ChartCurve | "monotone" | "monotone" (default): a smooth curve that never overshoots. "linear": straight segments. |
| glow | boolean | true | Soft glow on the latest point in dark mode. |
| emptyState | ReactNode | "No data" | Shown when there are no values. |
| locale | string | the browser's | Locale for the numbers in the spoken summary (e.g. "de"). |
| labels | Partial<SparklineLabels> | defaultSparklineLabels | Every other string, for translation: labels={{ summary: "…" }}; omitted keys keep the English of defaultSparklineLabels. Its only key is listed in the key table under the props table. |
| aria-label | string | optional, no default | Names the trend (e.g. "Weekly signups"); a summary of the values (count, min, max, latest) is appended. Without it the sparkline is decorative. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example: Sparklines in stat tiles

A small trend under a headline number.

```tsx
import { Sparkline } from "@/components/sheenui/charts/sparkline";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Sparkline } from "@sheenui/theme";

const tiles: [string, string, number[], string][] = [
  ["Revenue", "$12.4K", [12, 18, 15, 22, 28, 26, 34], "rising"],
  ["Sessions", "86.4K", [40, 44, 39, 47, 52, 50, 58], "rising"],
  ["Bounce rate", "38%", [48, 46, 47, 43, 41, 40, 38], "falling"],
];

export function Example() {
  return (
    <>
      {tiles.map(([label, value, values, direction]) => (
        <GlassCard key={label} className="flex flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <Sparkline values={values} aria-label={`${label} trend, ${direction}`} />
        </GlassCard>
      ))}
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | A sparkline is a static image: it takes no focus and has no keys. Read the number beside it, or open the full line chart. |

## Accessibility

- The sparkline is an image with a name: write the direction into the aria-label ("Revenue trend, rising").
- It never carries information a sighted reader could not also get from the number beside it.
- Reduced motion: the line is drawn at once, without the draw-in.

## When to use a sparkline

Use a React sparkline when there is no room for a full chart but the direction of a number matters: KPI tiles, table rows, list items. It answers one question, is this going up or down, at a glance.

Keep sparklines honest: use the same time range for every tile in a row, label the period near the number ("last 7 days"), and do not mix a rising line with a bad number without saying so in the label. Because the line has no axis, a sparkline can exaggerate small changes; the arrow and percent change next to the headline number give the scale.

Skip it when readers need exact values or a time axis: a sparkline has none and exaggerates small changes, so use a [React line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart). Skip it for a single data point, and for series with fewer than about five points, where the number alone is clearer. For counts per bucket use [the sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar), and for whole dashboards of tiles see [the web analytics dashboard](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics).


## Frequently asked questions

### What is a sparkline?

A sparkline is a tiny, axis-free line chart that shows the shape of a trend next to a number, in a stat tile or a table cell.

### How does a sparkline stay accessible?

It is an image with a spoken summary: pass an aria-label such as "Revenue trend, rising", because the line itself has no values a screen reader could read.

### What does the spoken summary say, and can I translate it?

With aria-label set, the name is that label plus a generated summary: "Weekly signups: 7 points, min 4, max 12, latest 12". Reword or translate it with labels.summary, and set locale for the number format. Without aria-label the sparkline is decorative and hidden from assistive tech.

### Sparkline or Sparkbar?

A sparkline is one line over many points, for the direction of a trend. The sparkbar draws one bar per period, with the latest bar at full strength and history in a lighter tint, which suits counts per bucket.

### How is the data shaped and sized?

Pass values as a number array, oldest first; non-numeric entries are skipped. The width follows the container and the height is 40 px unless you set height. area adds a soft fill under the line, curve="linear" swaps the default monotone curve for straight segments, and emptyState (default "No data") shows when there are no values.


## All exports on this page

- Sparkline — A tiny trend line for stat tiles.
- defaultSparklineLabels — The built-in English strings of Sparkline; spread it into your own labels and change what you need.


## Related pages

- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Web analytics](https://lokendra-builds.github.io/sheenui/dashboards/web-analytics)
- [100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart)
- [Bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list)
- [Beeswarm](https://lokendra-builds.github.io/sheenui/charts/beeswarm)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
