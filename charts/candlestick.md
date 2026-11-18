Canonical: https://lokendra-builds.github.io/sheenui/charts/candlestick

# Candlestick Chart for React (OHLC + Volume)

URL: https://lokendra-builds.github.io/sheenui/charts/candlestick
Sidebar name: Candlestick chart

A React candlestick chart with OHLC bars, a volume strip and moving average, pinch or Ctrl/⌘-scroll zoom and a readout that follows the crosshair. MIT.

What it is: A React candlestick chart shows prices over time as candles or OHLC bars, with a volume strip and a moving average. Pass data as readonly Candle[]: one candle per period, oldest first.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/candlestick-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Candlestick chart

Files to copy from `theme/src/`:

- `components/charts/{candlestick-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, flow-utils.tsx, heatmap.tsx}`
- `components/button/`
- `components/charts/candlestick-chart/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-resolved-scheme.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: candlestick-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { CandlestickChart } from "@/components/sheenui/charts/candlestick-chart";
import { type Candle } from "@/components/sheenui/charts/candlestick-chart/model";
import { CandlestickTable } from "@/components/sheenui/charts/candlestick-chart/table";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
```

These examples also use number-ticker: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/number-ticker.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type Candle, CandlestickChart, CandlestickTable, ChartCard, NumberTicker } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly Candle[] | required | One candle per period, oldest first. Candles with a missing price are skipped. |
| mode | "candle" \| "ohlc" | "candle" | "candle" (default): bodies and wicks. "ohlc": bars with an open tick (left) and a close tick (right). |
| volume | boolean | when any candle has a volume | Show the volume strip under the prices. |
| average | number | 0 | Overlay a simple moving average of the close over this many periods (e.g. 20). |
| height | number | 300 | Sets the height of the price panel in px. |
| volumeHeight | number | 64 | Sets the height of the volume strip in px. |
| upColor | ChartColor | green (rising), red (falling) | Palette slots for rising and falling candles: green and red that hold >= 3:1 on the chart surface in both themes (slot 6 / 8 in light, the status hues in dark). Rising candles are hollow, falling ones filled. |
| downColor | ChartColor | optional, no default | Sets the palette slot (1 to 8) of falling candles. |
| averageColor | ChartColor | 1 | Sets the palette slot of the moving average. |
| format | ((n: number) => string) | 2 decimals in locale | Formats a price for the axis, tooltip and data table: takes the number, returns the text shown. |
| formatVolume | ((n: number) => string) | compact in locale | Formats a volume figure as text. |
| formatDate | ((d: Date) => string) | "Thu, Oct 3, 2026" in locale | Formats dates (readout, table): "Thu, Oct 3, 2026" in locale, with the time for intraday data. |
| locale | string | "en" | Locale of the default number and date formats. |
| timeZone | string | the viewer's | IANA time zone of the default date formats, e.g. the exchange's "America/New_York". |
| zoom | boolean | true | Zoom (Ctrl/⌘ + scroll, pinch, + / −) and pan (drag, Shift + arrows). |
| defaultRange | [number, number] | every candle | Initial visible window, as candle indices [start, end). |
| onRangeChange | ((range: [number, number]) => void) | optional, no default | Called with the visible window [start, end) whenever it changes. |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| labels | Partial<CandlestickChartLabels> | defaultCandlestickChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultCandlestickChartLabels. All 23 keys of CandlestickChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## CandlestickTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly Candle[] | required | One candle per period, oldest first. Candles with a missing price are skipped. |
| format | ((n: number) => string) | 2 decimals in locale | Formats a price for the axis, tooltip and data table: takes the number, returns the text shown. |
| labels | Partial<CandlestickChartLabels> | defaultCandlestickChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultCandlestickChartLabels. All 23 keys of CandlestickChartLabels are listed in the key table under the props table. |
| locale | string | "en" | Locale of the default number and date formats. |
| formatVolume | ((n: number) => string) | compact in locale | Formats a volume figure as text. |
| formatDate | ((d: Date) => string) | "Thu, Oct 3, 2026" in locale | Formats dates (readout, table): "Thu, Oct 3, 2026" in locale, with the time for intraday data. |
| timeZone | string | the viewer's | IANA time zone of the default date formats, e.g. the exchange's "America/New_York". |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |
| order | "newest" \| "oldest" | "newest" | Sets the sort order: newest first (default), or oldest first. |
| limit | number | 30 | Rows shown before "Show all" (opening the table stays instant on long histories). |

## Example 1 of 2: Daily candles, volume and a 20-day average

Opens on the last 60 trading days of 160. Zoom out with the buttons or a pinch; drag to pan (two fingers on touch); hover, tap or arrow through the candles. Switch the symbol: the price axis eases to the new range.

```tsx
import { CandlestickChart } from "@/components/sheenui/charts/candlestick-chart";
import { type Candle } from "@/components/sheenui/charts/candlestick-chart/model";
import { CandlestickTable } from "@/components/sheenui/charts/candlestick-chart/table";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, NumberTicker, CandlestickTable, CandlestickChart, type Candle } from "@sheenui/theme";

const data: Candle[] = [
  { date: "2026-06-08", open: 182.4, high: 185.1, low: 181.9, close: 184.7, volume: 18_400_000 },
  { date: "2026-06-09", open: 184.7, high: 187.3, low: 183.2, close: 186.9, volume: 21_100_000 },
  { date: "2026-06-10", open: 186.9, high: 188.0, low: 184.1, close: 185.2, volume: 17_900_000 },
  { date: "2026-06-11", open: 185.2, high: 186.4, low: 182.8, close: 183.5, volume: 22_300_000 },
  { date: "2026-06-12", open: 183.5, high: 187.6, low: 183.1, close: 187.2, volume: 25_800_000 },
]; // one candle per trading day, oldest first
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function Example() {
  const last = data[data.length - 1];
  if (!last) return null;
  return (
    <ChartCard
      title="ACME Corp."
      aside={<NumberTicker value={last.close} locales="en-US" format={{ style: "currency", currency: "USD" }} />}
      table={<CandlestickTable data={data} format={(n) => usd.format(n)} caption="Daily prices" />}
    >
      <CandlestickChart
        data={data}
        average={20}
        format={(n) => usd.format(n)}
        aria-label="ACME daily prices, last 5 trading days"
      />
    </ChartCard>
  );
}
```

## Example 2 of 2: OHLC bars, intraday

Five-minute bars for one session. OHLC bars put the open tick on the left and the close tick on the right; times replace dates on the axis automatically.

```tsx
import { CandlestickChart } from "@/components/sheenui/charts/candlestick-chart";
import { type Candle } from "@/components/sheenui/charts/candlestick-chart/model";
// Package build (after the first npm release, or a packed tarball): import { CandlestickChart, type Candle } from "@sheenui/theme";

// Five-minute bars for one session (shortened); timestamps in UTC
const fiveMinuteBars: Candle[] = [
  { date: "2026-10-30T13:30:00Z", open: 118.2, high: 118.9, low: 117.8, close: 118.6, volume: 412_000 },
  { date: "2026-10-30T13:35:00Z", open: 118.6, high: 119.3, low: 118.4, close: 119.1, volume: 358_000 },
  { date: "2026-10-30T13:40:00Z", open: 119.1, high: 119.4, low: 118.2, close: 118.5, volume: 297_000 },
  { date: "2026-10-30T13:45:00Z", open: 118.5, high: 118.8, low: 117.9, close: 118.0, volume: 336_000 },
  { date: "2026-10-30T13:50:00Z", open: 118.0, high: 118.7, low: 117.7, close: 118.4, volume: 281_000 },
  { date: "2026-10-30T13:55:00Z", open: 118.4, high: 119.2, low: 118.3, close: 119.0, volume: 305_000 },
];

export function Example() {
  return (
    <CandlestickChart
      data={fiveMinuteBars}
      mode="ohlc"
      height={240}
      volumeHeight={52}
      timeZone="America/New_York"
      aria-label="NVLX, five-minute bars, Oct 30"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart, then the zoom buttons. |
| ← / → | Previous / next candle; the window follows the active candle. |
| Home / End | First / last candle. |
| Shift + ← / Shift + → | Pan the window. |
| + / − | Zoom in / out around the active candle. |
| 0 | Show every candle. |
| Escape | Clear the crosshair (the readout returns to the latest candle). |

## Accessibility

- The chart is one focusable figure; its description is the keyboard hint. Each candle read by keyboard is announced once: date, open, high, low, close, the move in words (“down 1.68%”), volume and the average.
- Rising candles are hollow and falling ones filled, and the readout carries an arrow and a sign: color is never the only cue. The default green and red keep 3:1 against the chart in both themes.
- Volume has its own strip under the prices, on the same time axis: there is never a second y-axis on the price plot.
- A plain scroll never hijacks the page; Ctrl/⌘ + scroll (or a pinch) zooms, and a hint says so. Zoom buttons are real buttons, 44px on touch.
- The table view lists every candle with its change, newest first. Reduced motion draws everything in place.

## All exports on this page

- CandlestickChart — Candlesticks (or OHLC bars) for prices over time, with a volume strip, a moving average and a crosshair readout: the chart traders expect.
- CandlestickTable — Every candle: date, open, high, low, close, change against the previous close, and volume.
- defaultCandlestickChartLabels — The built-in English strings of CandlestickChart; spread it into your own labels and change what you need.
- parseCandles — Valid candles with their previous close and the moving average (when asked).


## When to use the candlestick chart

- Use it as a stock chart or crypto price chart (FX works too) where each period has open, high, low and close, plus an optional volume strip and a moving average for trend context.
- Use ohlc mode for dense daily series where traders prefer bars with open and close ticks over candle bodies, and set timeZone to the exchange's IANA zone so dates read correctly.
- Let readers explore long histories: zoom with Ctrl or Cmd plus scroll, a pinch, or the plus and minus keys, pan by dragging, and use onRangeChange to sync a range label elsewhere.
- Skip it when you only have one price per period, such as a closing price series, where a Line chart or Sparkline is simpler and does not imply data you lack.
- Pair it with ChartCard for the export and table tabs, CandlestickTable for a text view, and SegmentedControl buttons to switch the interval or the visible window.


## Frequently asked questions

### What data does a React candlestick chart need?

An array of candles ordered oldest first, each with date (a Date, ISO string or timestamp), open, high, low and close, and an optional volume. Candles with a missing price are skipped. The volume strip appears when any candle has a volume, or when you set volume.

### Does color carry the up or down signal alone?

No. Rising candles are hollow and falling ones are filled, and the readout names each move with an arrow, a sign and a percentage. Defaults for upColor and downColor hold at least 3:1 contrast on the chart surface in both themes, and you can override either palette slot.

### Which keys work on the chart?

Tab focuses it, Left and Right read the previous and next candle, Home and End jump to the first and last, and Escape clears. With zoom on, plus and minus zoom, 0 resets, and Shift with Left or Right pans. Zoom is on by default and zoom={false} disables it.

### How do I add a moving average?

Set average to a period count such as 20 and the chart overlays a simple moving average of the close over that many periods, drawn in after the candles. averageColor picks its palette slot, defaulting to 1. height and volumeHeight set the panel sizes.


## Related pages

- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar)
- [Bump chart](https://lokendra-builds.github.io/sheenui/charts/bump-chart)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
