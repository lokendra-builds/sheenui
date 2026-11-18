Canonical: https://lokendra-builds.github.io/sheenui/charts/world-map

# Choropleth World Map for React (No Map Library)

URL: https://lokendra-builds.github.io/sheenui/charts/world-map
Sidebar name: World map

A React choropleth world map and bubble map on Equal Earth, with Natural Earth outlines embedded as SVG and Intl country names. No map library. MIT.

What it is: A React choropleth world map and bubble map on the Equal Earth projection, with no map library. Pass data as readonly WorldMapDatum[]: values by country (choropleth), or bubble sizes at each country's centre (mode="bubble").

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/geo-map.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > World map

Files to copy from `theme/src/`:

- `components/charts/{geo-map.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx}`
- `components/charts/geo/`
- `components/charts/chart-parts/`
- `components/charts/geo-map/`
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

Registry item: geo-map. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { WorldMap } from "@/components/sheenui/charts/geo-map";
import { WorldMapTable } from "@/components/sheenui/charts/geo-map/table";
import { type WorldMapDatum } from "@/components/sheenui/charts/geo-map/types";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use number-ticker, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/number-ticker.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, NumberTicker, useToast, WorldMap, type WorldMapDatum, WorldMapTable } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WorldMapDatum[] | [] | Values by country (choropleth), or bubble sizes at each country's centre (mode="bubble"). |
| points | readonly WorldMapPoint[] | optional, no default | Bubbles at coordinates (cities, offices). Drawn in bubble mode. |
| mode | "choropleth" \| "bubble" | "choropleth" | Colour each country by its value, or size a bubble by it. |
| scale | "sequential" \| "diverging" | "sequential" | Choropleth scale: "sequential" (one hue, light → dark: counts, rates) or "diverging" (two hues around a neutral midpoint: growth, change, sentiment). |
| midpoint | number | 0 | Value at the neutral centre of a diverging scale. |
| scaleType | "log" \| "linear" \| "quantile" | "linear" | How values spread over a sequential scale: "linear" (default); "log" for skewed data where one market dwarfs the rest (revenue, population); "quantile" ranks the values, so each colour holds about the same number of countries. |
| color | ChartColor | 1 | Hue of the sequential scale and of bubbles: a palette slot 1–8. |
| divergingColors | [ChartColor, ChartColor] | [2, 7] | Hues below and above the midpoint of a diverging scale. |
| domain | [number, number] | the data's range (from 0 when every value is positive) | The [min, max] the color scale spans; values outside it take the end colors. |
| steps | number | 0 | Classes on the scale (e.g. 5); 0 = continuous. |
| format | ((n: number) => string) | compact numbers in locale | Formats a region's value for the tooltips, legend and data table: takes the number, returns the text shown. |
| locale | string | "en" | Locale of the number format and of country names (Intl). |
| valueLabel | string | optional, no default | Name of the measure (legend caption, tooltip), e.g. "Revenue". |
| legend | boolean | true | Show the colour (or size) key under the map. |
| zoomable | boolean | true | Allow zooming and panning (buttons, ⌘/Ctrl + scroll, pinch, drag, + / −). |
| maxZoom | number | 8 | Deepest zoom level: the map magnifies up to this many times its fitted size. |
| shapes | readonly WorldCountryShape[] | optional, no default | Your own outlines in the same frame (skips loading the bundled world). |
| onSelect | ((selection: WorldMapSelection) => void) | optional, no default | Called with a country (or bubble) on click, Enter or Space. |
| emptyState | ReactNode | labels.noData, applied from the labels object | Shown over the map when there is no data. Default "No data". |
| labels | Partial<WorldMapLabels> | defaultWorldMapLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultWorldMapLabels. All 20 keys of WorldMapLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## WorldMapTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly WorldMapDatum[] | [] | Values by country (choropleth), or bubble sizes at each country's centre (mode="bubble"). |
| format | ((n: number) => string) | compact numbers in locale | Formats a region's value for the tooltips, legend and data table: takes the number, returns the text shown. |
| mode | "choropleth" \| "bubble" | "choropleth" | Colour each country by its value, or size a bubble by it. |
| points | readonly WorldMapPoint[] | optional, no default | Bubbles at coordinates (cities, offices). Drawn in bubble mode. |
| labels | Partial<WorldMapLabels> | defaultWorldMapLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultWorldMapLabels. All 20 keys of WorldMapLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the number format and of country names (Intl). |
| valueLabel | string | optional, no default | Name of the measure (legend caption, tooltip), e.g. "Revenue". |
| shapes | readonly WorldCountryShape[] | optional, no default | Your own outlines in the same frame (skips loading the bundled world). |
| share | boolean | false | Add a share-of-total column (for additive measures: revenue, users). |
| caption | string | optional, no default | Sets a visually hidden caption that names the table. |
| emptyState | ReactNode | optional, no default | Shown when there are no rows. |

## Example 1 of 4: Choropleth map in React

Revenue by country on a single-hue scale, light to dark. One market dwarfs the rest, so scaleType="log" spreads the others across the ramp. Switch the measure: the map cross-fades to the new colors and the headline rolls to the new total. Hover a country, or focus the map and use the arrow keys; ⌘/Ctrl + scroll, pinch or the buttons zoom.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { WorldMap } from "@/components/sheenui/charts/geo-map";
import { WorldMapTable } from "@/components/sheenui/charts/geo-map/table";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { useToast, ChartCard, NumberTicker, WorldMapTable, WorldMap } from "@sheenui/theme";

const revenue = [
  { id: "US", value: 4_820_000 },
  { id: "GB", value: 1_240_000 },
  { id: "DE", value: 948_000 },
  { id: "IN", value: 538_000 },
  // … any ISO 3166-1 code: "IN", "IND" or "356"
];
const total = revenue.reduce((sum, d) => sum + (d.value ?? 0), 0);
const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const toast = useToast(); // inside your component

<ChartCard
  title="Revenue by country"
  description="Last 12 months"
  aside={<NumberTicker value={total} format={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }} />}
  table={<WorldMapTable data={revenue} valueLabel="Revenue" format={usd.format} share />}
>
  <WorldMap
    data={revenue}
    scaleType="log" // one market dwarfs the rest: spread them on a log scale
    valueLabel="Revenue"
    format={usd.format}
    onSelect={(country) => toast.info(country.name, country.value === null ? "No data" : usd.format(country.value))}
    aria-label="Revenue by country, last 12 months"
  />
</ChartCard>
```

## Example 2 of 4: Diverging scale

Growth sits around a meaningful middle, so scale="diverging" uses two hues that meet at a neutral midpoint (0% here): orange for shrinking markets, blue for growing ones. The scale is symmetric, so equal changes get equally strong colors.

```tsx
import { WorldMap } from "@/components/sheenui/charts/geo-map";
import { type WorldMapDatum } from "@/components/sheenui/charts/geo-map/types";
// Package build (after the first npm release, or a packed tarball): import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

const signedPercent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
const formatGrowth = (n: number) => signedPercent.format(n).replace("-", "\u2212"); // a true minus sign

// Year-over-year change in active users, as a ratio
const growth: WorldMapDatum[] = [
  { id: "US", value: 0.08 },
  { id: "BR", value: 0.34 },
  { id: "AR", value: -0.12 },
  { id: "DE", value: -0.07 },
  { id: "NG", value: 0.61 },
  { id: "IN", value: 0.58 },
  { id: "VN", value: 0.52 },
  { id: "RU", value: -0.31 },
];

export function Example() {
  return (
    <WorldMap
      data={growth}
      scale="diverging"
      midpoint={0}
      divergingColors={[2, 7]}
      valueLabel="Change"
      format={formatGrowth}
      aria-label="Year-over-year change in active users by country"
    />
  );
}
```

## Example 3 of 4: Bubble map

Bubbles at coordinates: their area follows the value, they keep their size on screen when you zoom, and a surface ring keeps neighbors apart. The size key reads in the same units.

```tsx
import { WorldMap } from "@/components/sheenui/charts/geo-map";
// Package build (after the first npm release, or a packed tarball): import { WorldMap } from "@sheenui/theme";

const offices = [
  { label: "New York", lon: -74.0, lat: 40.71, value: 241_000 },
  { label: "San Francisco", lon: -122.42, lat: 37.77, value: 182_000 },
  { label: "London", lon: -0.13, lat: 51.51, value: 168_000 },
  // …
];

<WorldMap
  mode="bubble"
  points={offices}
  color={7}
  valueLabel="Active users"
  aria-label="Active users by city"
/>
```

## Example 4 of 4: Classed scale, any locale

steps={5} snaps colors to five classes, easier to match against the key. locale="de-DE" formats the numbers and names every country in German (Intl.DisplayNames).

```tsx
import { WorldMap } from "@/components/sheenui/charts/geo-map";
import { type WorldMapDatum } from "@/components/sheenui/charts/geo-map/types";
// Package build (after the first npm release, or a packed tarball): import { WorldMap, type WorldMapDatum } from "@sheenui/theme";

// Internet users per 100 people
const internetUsers: WorldMapDatum[] = [
  { id: "DE", value: 92 },
  { id: "FR", value: 86 },
  { id: "NO", value: 99 },
  { id: "BR", value: 81 },
  { id: "IN", value: 46 },
  { id: "NG", value: 55 },
  { id: "ET", value: 19 },
];

export function Example() {
  return (
    <WorldMap
      data={internetUsers}
      steps={5}
      color={3}
      domain={[0, 100]}
      locale="de-DE"
      valueLabel="Je 100"
      labels={{
        instructions: "Pfeiltasten wechseln zum Nachbarland, Bild auf und Bild ab nach Wert …",
        noData: "Keine Daten",
        zoomIn: "Vergrößern",
        zoomControls: (name) => `${name}: Zoom`,
        // … every string is in WorldMapLabels
      }}
      aria-label="Internetnutzer je 100 Einwohner"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the map (one stop), then the zoom buttons. |
| ← / → / ↑ / ↓ | Move to the neighboring country (or bubble) in that direction; it pans into view when zoomed. |
| Page Down / Page Up | Next / previous place by value (rank order). |
| Home / End | Highest / lowest value. |
| Letters | Type a name to jump to it (type-ahead). |
| + / − | Zoom in / out around the active place. |
| 0 | Reset the zoom. |
| Enter / Space | Call onSelect for the active place. |
| Escape | Clear the active place; again to reset the zoom. |

## Accessibility

- The map is one focusable figure with a role description of “map”; its accessible name ends with the keyboard instructions.
- Keyboard moves are announced once through a polite live region (“India: 912K, Rank 2 of 45”); pointer hovers stay silent.
- Missing values are hatched, never painted as the lowest color; the key includes a “No data” swatch.
- The Table view lists every value ranked, with an optional share column: the color-free way to read the map.
- Zoom buttons are real buttons (44px on touch), disabled at the limits; a plain scroll never hijacks the page.
- Forced colors: borders become CanvasText and the active country gets a Highlight outline.

## All exports on this page

- WorldMap — World map: a choropleth (each country coloured on a sequential or diverging scale) or a bubble map (circles sized by value at each country's centre, or at any longitude / latitude).
- WorldMapTable — Every value on the map as a ranked table: rank, country (or place), value and optional share.
- defaultWorldMapLabels — The built-in English strings of WorldMap; spread it into your own labels and change what you need.


## When to use the world map

- Use it as a world map chart for a choropleth of year-over-year user growth by country, where equal changes get equally strong colors and the area of every country stays true to scale.
- It fits a bubble map of active users by city, placing bubbles at longitude and latitude, with area following the value and a size key under the map. It is a React map without a map library: the bundled outlines are drawn by the chart itself, so Leaflet or Mapbox are not needed.
- It also suits localized dashboards: pass locale, such as de-DE, and it formats the numbers and names every country with Intl.DisplayNames in that language.
- Skip it when you need sub-country detail such as states, streets or routes; the bundled outlines are countries only, so reach for a dedicated mapping tool.
- Pair it with ChartCard for the legend and Chart / Table tabs, WorldMapTable for a text table, and onSelect to show a country's detail in a Drawer or Popover.


## Frequently asked questions

### How do I make a choropleth map in React with SheenUI?

Pass data as id and value pairs, where id is any ISO 3166-1 code (alpha-2, alpha-3 or numeric). Use scale sequential, or diverging with a midpoint. A country with no value reads No data, hatched, never 0.

### Is there a separate ChoroplethMap component?

No: WorldMap is the choropleth. Its default mode, choropleth, colors each country by its value, and mode bubble switches to sized circles. It covers a choropleth map for React with a legend, a hatched No data state, a table view and keyboard reading.

### Does the map add a lot to my bundle?

The outlines come from Natural Earth, public domain, and load on demand in their own chunk of about 19 KB gzipped. Pass your own shapes to skip loading the bundled world. The projection is Equal Earth, which keeps country areas true to scale.

### How do I handle skewed data?

scaleType takes linear, log or quantile for sequential scales: log when one market dwarfs the rest, quantile for equal-count classes. steps snaps colors to a number of classes, and domain sets the range yourself.

### How do I zoom and navigate by keyboard?

zoomable is on by default, with buttons, Ctrl or Cmd plus scroll, pinch, double-click and plus or minus. Arrows move to the neighboring place, Page Down and Up step by rank, Home and End jump to highest or lowest value, typing a name jumps to it, and 0 resets.


## Related pages

- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline)
- [100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
