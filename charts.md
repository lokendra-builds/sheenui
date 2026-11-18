Canonical: https://lokendra-builds.github.io/sheenui/charts/

# Animated React Charts: 48 Chart Types

URL: https://lokendra-builds.github.io/sheenui/charts/
Sidebar name: Charts

48 animated React chart components in glass, from line and pie to heatmap and Sankey, with tooltips, keyboard reading and table view. MIT.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Charts

Animated React charts with tooltips, keyboard reading and a table view for every one.

Files to copy from `theme/src/`:

- `components/charts/`
- `components/button/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/menu/`
- `components/number-ticker/`
- `components/segmented/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-resolved-scheme.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{canvas-effects.ts, cn.ts, csv.ts, form.ts, glide-highlight.tsx, heading.ts, math.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

shadcn CLI:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bar-chart.json
```

Registry items: bar-chart, bar-list, beeswarm, box-plot, bullet-chart, bump-chart, candlestick-chart, chart-table-twins, chord-diagram, cohort-chart, combo-chart, diverging-bar-chart, dumbbell-chart, error-bar-chart, funnel-chart, gantt-chart, gauge-chart, geo-map, line-chart, lollipop-chart, marimekko-chart, network-graph, pie-chart, polar-area-chart, population-pyramid, radar-chart, radial-bar-chart, radial-progress, ridgeline-chart, sankey-chart, scatter-chart, sparkbar, sparkline, stacked-area-chart, step-line-chart, streaming-chart, sunburst-chart, tracker-chart, treemap, waffle-chart, waterfall-chart. The command installs the first; swap the name in the URL for any other. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { ChartSyncProvider } from "@/components/sheenui/charts/chart-sync";
import { type ChartRow, type ChartSeries, type CompareSeries, formatCompact, useLiveData } from "@/components/sheenui/charts/chart-utils";
import { DonutChart } from "@/components/sheenui/charts/donut-chart";
import { AreaChart, LineChart, PREVIOUS_SERIES_KEY } from "@/components/sheenui/charts/line-chart";
import { RadialProgress } from "@/components/sheenui/charts/radial-progress";
import { Sparkline } from "@/components/sheenui/charts/sparkline";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AreaChart, BarChart, Button, ChartCard, type ChartRow, type ChartSeries, ChartSyncProvider, ChartTable, type CompareSeries, DonutChart, formatCompact, GlassCard, LineChart, PREVIOUS_SERIES_KEY, RadialProgress, seriesLegend, Sparkline, useLiveData } from "@sheenui/theme";
```

## LineChart / AreaChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per point: the index key plus one number per series key, e.g. { month: "Jan", visits: 4200 }. |
| index | string | required | Key of the x-axis value in each row (e.g. "month"). |
| series | readonly CompareSeries[] | required | The lines. color is a palette slot 1–8. Give a series a compareKey to draw its previous period from that key of each row as a dashed, muted line. |
| area | boolean | false | Fill the area under each line with a gradient that fades to transparent. |
| height | number | 260 | Height of the chart in px; the width follows the container. |
| format | ((n: number) => string) | optional, no default | Format values in the tooltip, labels and on the axis. Without it, values use formatCompact (or the locale's compact format) and axis ticks get exactly as many decimals as their step needs. |
| locale | string | optional, no default | Locale for the default number format (e.g. "de"). |
| endLabels | boolean | true | Label the end of each line (only when labels don't collide; the legend always carries identity). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| curve | ChartCurve | "monotone" | "monotone" (default): smooth curves that never overshoot a value. "linear": straight segments. |
| gradient | boolean | true | Area fill fades from the line to transparent (default). false: a flat soft wash. |
| zero | boolean | true | Keep zero on the value axis (default). false fits the axis to the data, for values that live far from zero (rates, prices, temperatures). Areas then fill to the bottom of the plot. |
| glow | boolean | true | Soft glow on the active line and point in dark mode. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour: each series gets its own marker shape (circle, square, triangle, diamond). |
| hiddenSeries | readonly string[] | optional, no default | Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. |
| highlightedSeries | string \| null | optional, no default | Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. |
| annotations | readonly ChartAnnotation[] | [] | Reference lines and bands, event markers and ranges. |
| brush | boolean \| LineChartBrush | optional, no default | A range selector under the chart for long series (drag, keyboard, touch). |
| sync | boolean | true | Inside a ChartSyncProvider: share the crosshair with the other charts. |
| live | boolean \| { duration?: number; } | off; an object's duration defaults to 0.6 inside the slide hook | Streaming data: when the rows slide by (oldest out, newest in), the lines slide left instead of morphing. Pair with useLiveData(). duration = seconds per slide (default 0.6). |
| tooltipSurface | TooltipSurface | "glass" | Tooltip surface: "glass" (default) or "opaque" for busy charts. |
| labels | Partial<LineChartLabels> | defaultLineChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultLineChartLabels. All 3 keys of LineChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BarChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | One object per category: the index key plus one number per series key, e.g. { day: "Mon", orders: 12 }. |
| index | string | required | Key of each row that names its category (the axis label), e.g. "day". |
| series | readonly CompareSeries[] | required | The bars. Give a series a compareKey to mark its previous period on each bar (unstacked). |
| layout | "horizontal" \| "vertical" | "vertical" | "vertical" = columns rising from the x-axis; "horizontal" = bars from the left (best for long category names). |
| stacked | boolean | false | Stack series on top of each other instead of side by side. Negative values stack downwards from zero (a diverging stack). |
| showValues | boolean | false | Print the value at the end of each bar (single, unstacked series only). |
| height | number | 260 for columns | Chart height in px, axes and labels included. |
| format | ((n: number) => string) | optional, no default | Format values in the tooltip and labels, and on the axis (the default axis format follows the tick step). |
| locale | string | optional, no default | Locale for the default number format (e.g. "de"). |
| emptyState | ReactNode | optional, no default | Shown when there is nothing to plot. |
| patterns | boolean | true when series.length > 3 | Tell series apart without colour (hatch fills). |
| gradient | boolean | true | A soft sheen down each bar (strongest at the value end). |
| glow | boolean | true | Soft glow on the bars being read, in dark mode. |
| hiddenSeries | readonly string[] | optional, no default | Series keys to hide (controlled). Inside a ChartCard the card's legend controls this. |
| highlightedSeries | string \| null | optional, no default | Series key to emphasise (the others dim). Inside a ChartCard, legend hover controls this. |
| annotations | readonly ChartAnnotation[] | [] | Reference lines / bands on the value axis, event markers and ranges on the categories. |
| sync | boolean | true | Inside a ChartSyncProvider: share the active category with the other charts. |
| tooltipSurface | TooltipSurface | "glass" | Tooltip surface style: "glass" (default) or "opaque" for busy charts. |
| labels | Partial<BarChartLabels> | defaultBarChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultBarChartLabels. All 3 keys of BarChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required): say what is plotted, e.g. "Orders per day". |
| className | string | optional, no default | Adds extra classes to the outer element. |

## DonutChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly DonutSlice[] | required | Part-to-whole only, at most 6 slices: fold the rest into "Other". Negative values count as 0. |
| diameter | number | 200 | Outer diameter of the ring in px; the chart is a circle of this width and height. |
| format | ((n: number) => string) | compact numbers in locale | Formats values in the tooltip and legend. |
| locale | string | "en" | Locale for the default number format and percentages (e.g. "de"). |
| emptyState | ReactNode | optional, no default | Shown in the centre when there is nothing to plot (no slices, or every value is 0). |
| legendToggle | boolean | true | Legend items toggle slices (the ring re-flows, the total updates). |
| hiddenSlices | readonly string[] | optional, no default | Slice keys (or labels) to hide (controlled). |
| defaultHiddenSlices | readonly string[] | [] | Slice keys (or labels) hidden at first (uncontrolled). |
| onHiddenSlicesChange | ((keys: string[]) => void) | optional, no default | Called with the keys of the hidden slices whenever the legend toggles one. |
| glow | boolean | true | Soft glow on the active slice in dark mode. |
| patterns | boolean | true when data.length > 3 | Tell slices apart without colour (hatch fills). |
| labels | Partial<DonutChartLabels> | defaultDonutChartLabels | The chart's built-in strings (empty state, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ legend: "…" }}; omitted keys keep the English of defaultDonutChartLabels. All 7 keys of DonutChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Names the chart for assistive tech (required). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## RadialProgress

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number \| null \| undefined | required | 0–100. Values outside the range are clamped. null, undefined or NaN (no value yet) show an empty ring with a "–" and "No data", not 0%. |
| label | ReactNode | optional, no default | Visible caption under the percentage; also the accessible name unless aria-label is given. |
| aria-label | string | optional, no default | Accessible name when label isn't plain text. |
| variant | "ring" \| "gauge" | "ring" | "ring" = full circle, "gauge" = 3/4 arc like a speedometer. |
| coloring | "accent" \| "severity" | "accent" | "accent" always uses the accent colour. "severity" turns warning at warnAt and danger at dangerAt (e.g. storage nearly full) and adds a status word, so colour is never the only signal. |
| tone | "accent" \| "severity" | undefined | Old name of coloring (it picks how the arc is coloured, it is not a semantic tone). Still honoured; coloring wins. |
| warnAt | number | 75 | Percentage where the "severity" coloring turns to warning. |
| dangerAt | number | 90 | Percentage where the "severity" coloring turns to danger. |
| diameter | number | 160 | Diameter in px (the width of the ring; a gauge is a little shorter). |
| gradient | boolean | true | The arc brightens along its length (a soft gradient). |
| glow | boolean | true | Soft glow on the arc in dark mode. |
| locale | string | "en" | Sets the locale for the percentage (e.g. "de" → "64 %"). |
| labels | Partial<RadialProgressLabels> | defaultRadialProgressLabels | The ring's built-in strings (accessible names, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ high: "…" }}; omitted keys keep the English of defaultRadialProgressLabels. All 4 keys of RadialProgressLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Sparkline

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

## ChartCard / ChartTable / ChartLegend

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | string | required | Sets the card's heading text. |
| description | ReactNode | optional, no default | A line of context under the title (period, unit, source). |
| aside | ReactNode | optional, no default | Shown at the top right, e.g. a headline number. |
| legend | readonly LegendItem[] | optional, no default | Legend shown under the header. Omit for single-series charts (the title names the series). |
| table | ReactNode | optional, no default | Table view of the same data. When given, the card gets Chart / Table tabs. |
| headingLevel | HeadingLevelOption | 3 | Heading level of the title (1 to 6, default 3), to fit the page outline, or "none" for a paragraph with no heading role (for an example). |
| children | ReactNode | required | The chart (or table) the card frames; it fills the card body under the title and description. |
| className | string | optional, no default | Adds extra classes to the card's outer element. |
| legendToggle | boolean | true | Interactive legend: when the chart inside supports it (Line, Area, Bar, Donut), legend items become toggle buttons that hide / show a series. |
| defaultHiddenSeries | readonly string[] | [] | Hides these series at first (interactive legends). |
| exportable | boolean \| { formats?: ChartExportFormat[]; filename?: string; } | false | A download menu: PNG / SVG of the chart (colours resolved, exactly as shown) and CSV of the data. true offers every format; or pick some, and name the file (default: the title). |
| csv | ChartCsvOptions | optional, no default | Data for the CSV download. Without it the CSV is read from the table view. |
| labels | Partial<ChartCardLabels> | defaultChartCardLabels | The card's built-in strings (tab names, CSV button, table text); a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ chart: "…" }}; omitted keys keep the English of defaultChartCardLabels. All 19 keys of ChartCardLabels are listed in the key table under the props table. |
| surface | "glass" \| "plain" | "glass" | "glass" (default): a glass-2 card. "plain": the same card without backdrop blur, for cards nested inside another glass panel or many cards in view at once (the glass budget). |
| loading | boolean | false | Show a skeleton placeholder instead of the chart (and the table) while data is on its way. |
| data | readonly ChartRow[] | required | The rows to show: one object per row, holding the index key and one number per series key. |
| index | string | required | The key in each row that names the row, such as "month". It becomes the first column. |
| series | readonly CompareSeries[] | required | Series to list as columns; one with a compareKey also gets a previous-period column. |
| format | ((n: number) => string) | formatCompact | Formats each number in the table cells. |
| indexLabel | string | optional, no default | Header of the first column; the index key when left out. |
| caption | string | optional, no default | Visually hidden caption naming the table for screen readers. |
| items | readonly LegendItem[] | required | The legend keys: one per series, with its label, color and key shape. |
| hidden | readonly string[] \| ReadonlySet<string> | optional, no default | Lists the keys of hidden series (interactive legends). |
| onToggle | ((key: string) => void) | optional, no default | Makes items with a key toggle buttons. |
| onHighlight | ((key: string \| null) => void) | optional, no default | Called with the key under the pointer / focus (null when it leaves): charts dim the others. |
| ChartTooltip docked / glide / notes | boolean / boolean / string[] | false / true | docked pins a one-line readout to the top of the chart (narrow charts); glide eases it between points on a spring; notes adds lines under the values (e.g. an event marker). Visual only: the chart announces the same values. |

## Sync, brush, annotations, export, live data

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| <ChartSyncProvider store?> | component | optional, no default | Charts inside share their crosshair by x value. createChartSyncStore() syncs charts that don't share a parent. |
| useChartSync(enabled?) | hook | optional, no default | For chart authors: { synced, external, publish(key \| null) }. |
| <ChartBrush count labelOf range onRangeChange values? minSpan? height? labels?> | component | optional, no default | The range selector on its own, for custom charts. Two sliders: arrows, Page Up / Down, Home / End, Shift + arrows pan. |
| ChartAnnotation | { type: "line" \| "band" \| "event" \| "range", … , label?, tone? } | optional, no default | tone: neutral, accent, success, warning, danger. Lines and bands are included in the axis range. |
| exportChartImage(el, "png" \| "svg", name) | function | optional, no default | Downloads the chart inside el. serializeChartSvg / chartPngBlob / chartCsv / tableCsv are exported too. |
| useLiveData(initial, { next, interval?, max?, ref?, paused?, onPausedChange? }) | hook | optional, no default | { data, setData, paused, setPaused, running }: a sliding window that pauses off-screen and in hidden tabs. |

## ChartAnnotationsLayer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| annotations | readonly ChartAnnotation[] | required | The reference lines, bands, events and ranges to draw. |
| data | readonly ChartRow[] | required | The chart's rows, used to place annotations that name an index value. |
| index | string | required | The key that names each row in data. |
| innerW | number | required | Sets the width of the plot area in px. |
| innerH | number | required | Sets the height of the plot area in px. |
| value | (v: number) => number | required | Value → pixel along the value axis (y for columns and lines, x for horizontal bars). |
| position | (i: number) => number | required | Returns the pixel (centre) of a row along the index axis. |
| band | number | 0 | Width of one category band (bar charts): ranges cover whole bands. 0 for line charts. |
| horizontal | boolean | false | The value axis runs horizontally (horizontal bar charts). |
| layer | "back" \| "front" | required | "back" draws bands and ranges (behind the data); "front" draws lines and events. |
| show | boolean | true | Fade in once the data has drawn. |
| delay | number | 0 | Seconds to wait before fading in (after the draw-in). |
| reduced | boolean | false | Skip the fade-in because the person prefers reduced motion. |
| avoid | readonly AnnotationObstacle[] | optional, no default | The series as polylines in plot px: band and line labels move to the corner or side where they cross them least. |

## ChartAnnouncer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| text | string | required | The message for the polite live region; screen readers read it when it changes. |

## ChartBrush props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| count | number | required | Sets the number of rows in the full series. |
| labelOf | (i: number) => string | required | Label of row i (e.g. "Mar 4"), read out by screen readers. |
| values | readonly number[] | optional, no default | The values drawn in the miniature (one series, all rows). |
| range | ChartBrushRange | required | Selected rows, inclusive [start, end]. |
| onRangeChange | (range: ChartBrushRange) => void | required | Called with the selected window as [start, end] (inclusive row indexes) while the handles move. |
| onScrubChange | ((scrubbing: boolean) => void) | optional, no default | True while a drag is in progress (charts skip their tweens while scrubbing). |
| minSpan | number | 2 | Fewest rows the window can show. |
| height | number | 44 | Height of the chart in px; the width follows the container. |
| color | string | "var(--sheen-chart-1)" | Sets the colour used for the miniature chart. |
| labels | Partial<ChartBrushLabels> | defaultChartBrushLabels | Every other string, for translation: labels={{ group: "…" }}; omitted keys keep the English of defaultChartBrushLabels. All 4 keys of ChartBrushLabels are listed in the key table under the props table. |

## ChartSyncProvider props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| store | ChartSyncStore | optional, no default | Share an existing store (e.g. one made with createChartSyncStore) instead of a new one. |

## ChartTooltip props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | string | required | The heading line: usually the category or date being read. |
| rows | TooltipRow[] | required | One line per series: a swatch, a label and the formatted value. |
| x | number | required | Horizontal position of the pointer, in px from the left of the chart box. |
| y | number | required | Vertical position of the pointer, in px from the top of the chart box. |
| containerWidth | number | required | Width of the chart box in px, so the tooltip flips to stay inside it. |
| docked | boolean | false | Pin the readout to the top of the chart as one line instead of following the pointer (used on narrow charts). |
| surface | TooltipSurface | "glass" | Surface style of the tooltip: glass or opaque. |
| glide | boolean | true | Glide between points on the pointer spring (default) instead of jumping. |
| notes | readonly string[] | optional, no default | Extra lines under the values (e.g. an event marker at this point). |

## LegendKey props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| color | string | required | Any CSS color for the swatch, normally a var(--sheen-chart-n) token. |
| kind | "line" \| "rect" | "rect" | "line" draws a short stroke (line charts); "rect" draws a filled square (bars, areas). |
| dashed | boolean | false | Draw the stroke dashed, for a comparison or forecast series. |
| hollow | boolean | false | Draw an outline only instead of a filled swatch. |
| pattern | number | 0 | Hatch index (1 to 8) so the swatch matches a series drawn with patterns. Rect keys only. |

## TableScroll props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | optional, no default | Accessible name of the scroll region around the table. |

## Example 1 of 12: Line chart

Click a legend key to hide a series (the axis re-fits); hover one to dim the others. The dashed line is the previous period. Download it from the card's menu.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { formatCompact, type CompareSeries } from "@/components/sheenui/charts/chart-utils";
import { LineChart, PREVIOUS_SERIES_KEY } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, LineChart, PREVIOUS_SERIES_KEY, formatCompact, seriesLegend, type CompareSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const data = [
  { month: "Jan", organic: 61000, organicPrev: 52000, paid: 34000, referral: 15000 },
  { month: "Feb", organic: 64500, organicPrev: 54500, paid: 36500, referral: 15800 },
  { month: "Mar", organic: 69000, organicPrev: 56000, paid: 38200, referral: 17100 },
  { month: "Apr", organic: 72800, organicPrev: 59500, paid: 41000, referral: 17600 },
  { month: "May", organic: 78100, organicPrev: 61000, paid: 43600, referral: 18900 },
  { month: "Jun", organic: 83400, organicPrev: 63800, paid: 45200, referral: 19700 },
];

// color is a palette slot (1–8); compareKey names the previous-period value in each row.
const series: CompareSeries[] = [
  { key: "organic", label: "Organic", color: 1, compareKey: "organicPrev" },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Monthly revenue by channel"
      legend={[
        ...seriesLegend(series, "line"),
        { label: "Previous period", color: "var(--sheen-fg-subtle)", kind: "line", dashed: true, key: PREVIOUS_SERIES_KEY },
      ]}
      exportable
      table={<ChartTable data={data} index="month" series={series} format={usd} />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel" />
    </ChartCard>
  );
}
```

## Example 2 of 12: Area chart with a brush

A gradient wash that fades to transparent. The brush under a long series zooms it: drag the window, drag its edges, or use the arrow keys on them.

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { AreaChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

// 120 days of visits
const days = Array.from({ length: 120 }, (_, i) => ({
  day: "Day " + (i + 1),
  visits: Math.round(9000 + i * 55 + Math.sin(i / 4) * 900),
}));
const series: ChartSeries[] = [{ key: "visits", label: "Visits", color: 7 }];

export function Example() {
  return (
    <ChartCard title="Visits" table={<ChartTable data={days} index="day" series={series} />}>
      <AreaChart
        data={days}
        index="day"
        series={series}
        brush={{ defaultRange: [90, 119], minSpan: 7 }}
        aria-label="Daily visits"
      />
    </ChartCard>
  );
}
```

## Example 3 of 12: Bar chart

Bars grow from the baseline. The dashed tick on each Signups bar is last year's value.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type CompareSeries } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BarChart, type CompareSeries } from "@sheenui/theme";

const data = [
  { month: "Jan", signups: 1240, signupsPrev: 1010, activated: 780 },
  { month: "Feb", signups: 1310, signupsPrev: 1090, activated: 820 },
  { month: "Mar", signups: 1490, signupsPrev: 1150, activated: 930 },
  { month: "Apr", signups: 1420, signupsPrev: 1230, activated: 900 },
  { month: "May", signups: 1650, signupsPrev: 1300, activated: 1040 },
];
const series: CompareSeries[] = [
  { key: "signups", label: "Signups", color: 1, compareKey: "signupsPrev" },
  { key: "activated", label: "Activated", color: 3 },
];

export function Example() {
  return <BarChart data={data} index="month" series={series} aria-label="Signups and activations per month" />;
}
```

## Example 4 of 12: Stacked bars

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
// Package build (after the first npm release, or a packed tarball): import { BarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jan", free: 820, pro: 310, team: 90 },
  { month: "Feb", free: 790, pro: 358, team: 111 },
  { month: "Mar", free: 760, pro: 406, team: 132 },
  { month: "Apr", free: 730, pro: 454, team: 153 },
];
const series: ChartSeries[] = [
  { key: "free", label: "Free", color: 7 },
  { key: "pro", label: "Pro", color: 1 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return <BarChart stacked data={data} index="month" series={series} aria-label="Customers per plan" />;
}
```

## Example 5 of 12: Horizontal bars

Best for long category names. Values sit at the tip of each bar.

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
// Package build (after the first npm release, or a packed tarball): import { BarChart } from "@sheenui/theme";

const countries = [
  { country: "United States", visitors: 48200 },
  { country: "Germany", visitors: 21400 },
  { country: "India", visitors: 18900 },
  { country: "United Kingdom", visitors: 15300 },
  { country: "Brazil", visitors: 9800 },
];

export function Example() {
  return (
    <BarChart
      layout="horizontal"
      showValues
      data={countries}
      index="country"
      series={[{ key: "visitors", label: "Visitors" }]}
      aria-label="Visitors by country"
    />
  );
}
```

## Example 6 of 12: Donut chart

Part-to-whole at a glance, at most 6 slices. Hover a slice to read it in the center; click a legend key to leave a slice out (the ring re-flows and the total re-counts).

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { DonutChart } from "@/components/sheenui/charts/donut-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";

const traffic = [
  { label: "Organic search", value: 41200 },
  { label: "Direct", value: 22800 },
  { label: "Social", value: 15400 },
  { label: "Referral", value: 9600 },
  { label: "Email", value: 6100 },
];

export function Example() {
  return (
    <ChartCard
      title="Traffic sources"
      description="Sessions this month"
      table={
        <ChartTable
          data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
          index="source"
          indexLabel="Source"
          series={[{ key: "sessions", label: "Sessions", color: 1 }]}
        />
      }
    >
      <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
    </ChartCard>
  );
}
```

## Example 7 of 12: Radial progress & gauge

A single ratio against a limit; the number rolls with the arc. With coloring="severity" the color turns warning and critical, always with a status word too.

```tsx
import { RadialProgress } from "@/components/sheenui/charts/radial-progress";
// Package build (after the first npm release, or a packed tarball): import { RadialProgress } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <RadialProgress value={64} label="Quarterly goal" />
      <RadialProgress variant="gauge" coloring="severity" value={82} label="Storage used" />
      <RadialProgress variant="gauge" coloring="severity" value={96} label="CPU" />
    </>
  );
}
```

## Example 8 of 12: Sparklines in stat tiles

A small trend under a headline number; it draws in when the tile scrolls into view and the latest point gets a dot.

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

## Example 9 of 12: Synced crosshairs

Charts inside one ChartSyncProvider share the point being read, matched by x value: hover the line and the bars follow (and the other way round).

```tsx
import { BarChart } from "@/components/sheenui/charts/bar-chart";
import { ChartSyncProvider } from "@/components/sheenui/charts/chart-sync";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { LineChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartSyncProvider, LineChart, BarChart, type ChartSeries } from "@sheenui/theme";

const revenue = [
  { month: "Jan", organic: 61000, paid: 34000 },
  { month: "Feb", organic: 64500, paid: 36500 },
  { month: "Mar", organic: 69000, paid: 38200 },
  { month: "Apr", organic: 72800, paid: 41000 },
];
const revenueSeries: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const signups = [
  { month: "Jan", signups: 1240, activated: 780 },
  { month: "Feb", signups: 1310, activated: 820 },
  { month: "Mar", signups: 1490, activated: 930 },
  { month: "Apr", signups: 1420, activated: 900 },
];
const signupSeries: ChartSeries[] = [
  { key: "signups", label: "Signups", color: 1 },
  { key: "activated", label: "Activated", color: 3 },
];

export function Example() {
  return (
    <ChartSyncProvider>
      <LineChart data={revenue} index="month" series={revenueSeries} aria-label="Revenue" />
      <BarChart data={signups} index="month" series={signupSeries} aria-label="Signups" />
    </ChartSyncProvider>
  );
}
```

## Example 10 of 12: Annotations

Reference lines and bands on the value axis, event markers and ranges on the x axis. Labels sit on a surface plate, in text colors; events are also read out with their data point.

```tsx
import { LineChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { LineChart } from "@sheenui/theme";

const data = [
  { month: "Jan", organic: 61000 },
  { month: "Feb", organic: 64500 },
  { month: "Mar", organic: 69000 },
  { month: "Apr", organic: 72800 },
  { month: "May", organic: 78100 },
  { month: "Jun", organic: 83400 },
];

export function Example() {
  return (
    <LineChart
      data={data}
      index="month"
      series={[{ key: "organic", label: "Organic" }]}
      annotations={[
        { type: "band", from: 60000, to: 75000, label: "Forecast range" },
        { type: "line", value: 80000, label: "Goal $80K", tone: "accent" },
        { type: "range", from: "Jan", to: "Feb", label: "Holiday freeze" },
        { type: "event", at: "Jun", label: "Pricing change", tone: "warning" },
      ]}
      aria-label="Organic revenue with goal and events"
    />
  );
}
```

## Example 11 of 12: Export, locale and labels

exportable adds a download menu: PNG and SVG keep the exact colors of the current theme, CSV has the raw numbers. Every string is a label, and numbers follow the locale (German here).

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { AreaChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const data = [
  { month: "Jan", revenue: 61000 },
  { month: "Feb", revenue: 64500 },
  { month: "Mär", revenue: 69000 },
  { month: "Apr", revenue: 72800 },
];
const series: ChartSeries[] = [{ key: "revenue", label: "Umsatz", color: 1 }];

export function Example() {
  return (
    <ChartCard
      title="Umsatz"
      exportable
      labels={{ chart: "Diagramm", table: "Tabelle", downloadPng: "Als PNG herunterladen", noData: "Keine Daten" }}
      table={<ChartTable data={data} index="month" series={series} format={(n) => eur.format(n)} />}
    >
      <AreaChart data={data} index="month" series={series} locale="de" format={(n) => eur.format(n)} labels={{ previous: (l) => l + " (Vorperiode)" }} aria-label="Umsatz pro Monat" />
    </ChartCard>
  );
}
```

## Example 12 of 12: Live data

useLiveData appends a row on an interval into a sliding window and pauses off-screen, in hidden tabs and on Pause. With live, new points slide in from the right instead of morphing.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { useLiveData, type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { LineChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { Button, LineChart, useLiveData, type ChartRow, type ChartSeries } from "@sheenui/theme";
import { useRef } from "react";

const initial: ChartRow[] = [
  { t: "0s", v: 800 },
  { t: "2s", v: 830 },
];
const series: ChartSeries[] = [{ key: "v", label: "Requests" }];

export function RequestsPerSecond() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, paused, setPaused } = useLiveData(initial, {
    next: (rows, tick) => ({ t: tick * 2 + "s", v: Math.round(Number(rows[rows.length - 1]?.v ?? 800) + (Math.random() - 0.5) * 140) }),
    interval: 1500,
    max: 16,
    ref, // pauses while this element is off-screen
  });

  return (
    <>
      <div ref={ref}>
        {/* data takes a mutable array: spread the hook's read-only window */}
        <LineChart live data={data} index="t" series={series} aria-label="Requests per second" />
      </div>
      <Button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Button>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move through the card's tabs and menu, then the legend keys, then the chart and its brush handles. |
| ← → (↑ ↓) | Read the previous / next point (the crosshair moves and the values are announced). |
| Home / End | First / last point. |
| Escape | Clear the active point. |
| Enter / Space on a legend key | Hide or show that series (announced). |
| ← → on a brush handle | Move that edge one step; Page Up / Page Down move ten percent; Home / End go to the ends. |
| Shift + ← → on a brush handle | Pan the whole window. |
| ← → on Chart / Table | Switch between the chart and its table. |

## Accessibility

- Every interactive chart is a focusable figure named by its title and described by the reading instructions (the same key on every chart, `labels.instructions`, a string or a function); inside a ChartCard with a table, `aria-details` points at the table view. The active values are announced once, politely.
- Every chart has a table view (Chart / Table tabs), so no value depends on color or on seeing the marks.
- Legend keys are toggle buttons (pressed = shown); hiding or showing a series is announced.
- Event markers are read out with the data point they sit on; status colors always come with a word or an icon.
- Reduced motion: charts appear at their final values, data changes jump, and live charts stop sliding.
- Windows High Contrast: legend keys gain outlines, the active tab and brush window use system colors.

## Every chart, live

52 live previews of the 48 chart components: some charts appear more than once, as variants. Each one is the real component with its own data, loaded as you scroll. Open one for its docs, props and keyboard map.

- [Line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart): Change over time for a few series (Trend)
- [Area chart](https://lokendra-builds.github.io/sheenui/charts/area-chart): Volume over time with a soft fill (Trend)
- [Bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart): Compare values across categories (Comparison)
- [Donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart): Part-to-whole with the total in the center (Composition, KPI)
- [Radial progress](https://lokendra-builds.github.io/sheenui/charts/#chart-radial-progress): One percentage on the way to a goal (KPI)
- [Sparkline](https://lokendra-builds.github.io/sheenui/charts/sparkline): A word-sized trend for tables and KPI tiles (KPI, Trend)
- [Bar list](https://lokendra-builds.github.io/sheenui/charts/bar-list): Ranked rows with a bar behind each name (Comparison)
- [Lollipop chart](https://lokendra-builds.github.io/sheenui/charts/lollipop): Ranked values with less ink than bars (Comparison)
- [Dumbbell chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell): Before and after for each item (Comparison)
- [Slope chart](https://lokendra-builds.github.io/sheenui/charts/dumbbell): Change between two points in time (Comparison, Trend)
- [Radar chart](https://lokendra-builds.github.io/sheenui/charts/radar-chart): Profiles compared across several axes (Comparison)
- [Polar area chart](https://lokendra-builds.github.io/sheenui/charts/polar-area): Cyclic categories as wedges, e.g. months (Comparison, Trend)
- [Diverging bar chart](https://lokendra-builds.github.io/sheenui/charts/diverging-bar): Survey answers around a neutral midpoint (Comparison, Distribution)
- [Population pyramid](https://lokendra-builds.github.io/sheenui/charts/diverging-bar): Two groups back to back, row by row (Comparison, Distribution)
- [Stacked area chart](https://lokendra-builds.github.io/sheenui/charts/stacked-area-chart): A total over time, split into its parts (Trend, Composition)
- [Combo chart](https://lokendra-builds.github.io/sheenui/charts/combo-chart): Bars and a line that share one axis (Trend, Comparison)
- [Step line chart](https://lokendra-builds.github.io/sheenui/charts/step-line-chart): Values that change in discrete steps (Trend)
- [Range area chart](https://lokendra-builds.github.io/sheenui/charts/range-area-chart): A line with its low–high band or forecast (Trend, Distribution)
- [Streamgraph](https://lokendra-builds.github.io/sheenui/charts/streamgraph): Flowing layers that swell and shrink (Trend, Composition)
- [Streaming chart](https://lokendra-builds.github.io/sheenui/charts/realtime-chart): Live samples sliding in, like a monitor (Trend, KPI)
- [Calendar heatmap](https://lokendra-builds.github.io/sheenui/charts/calendar-heatmap): Daily activity laid out week by week (Trend, Distribution)
- [Cohort retention](https://lokendra-builds.github.io/sheenui/charts/cohort-retention): How many users each signup cohort keeps (Trend, Comparison)
- [Pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart): A few slices of one whole (Composition)
- [100% stacked bars](https://lokendra-builds.github.io/sheenui/charts/percent-stacked-bar-chart): Shares within each category, side by side (Composition, Comparison)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle): Shares as a 10 × 10 grid, one cell a percent (Composition, KPI)
- [Pictogram](https://lokendra-builds.github.io/sheenui/charts/waffle): Shares as icons, e.g. 23 of 30 people (Composition, KPI)
- [Marimekko chart](https://lokendra-builds.github.io/sheenui/charts/marimekko): Segment size and share in one mosaic (Composition, Comparison)
- [Scatter chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot): How two measures relate, point by point (Distribution, Comparison)
- [Bubble chart](https://lokendra-builds.github.io/sheenui/charts/scatter-plot): Three measures at once: x, y and size (Comparison, Distribution)
- [Heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap): Values across two categorical axes (Distribution)
- [Histogram](https://lokendra-builds.github.io/sheenui/charts/histogram): How values spread across bins (Distribution)
- [Box plot](https://lokendra-builds.github.io/sheenui/charts/box-plot): Median, quartiles and outliers per group (Distribution, Comparison)
- [Violin plot](https://lokendra-builds.github.io/sheenui/charts/box-plot): The full shape of each group's values (Distribution)
- [Beeswarm](https://lokendra-builds.github.io/sheenui/charts/beeswarm): Every observation as a dot, none hidden (Distribution)
- [Ridgeline chart](https://lokendra-builds.github.io/sheenui/charts/ridgeline): Distributions stacked as overlapping ridges (Distribution, Comparison)
- [Funnel chart](https://lokendra-builds.github.io/sheenui/charts/funnel-chart): Conversion through ordered stages (Flow, Comparison)
- [Sankey diagram](https://lokendra-builds.github.io/sheenui/charts/sankey-diagram): Flows between stages, sized by volume (Flow)
- [Chord diagram](https://lokendra-builds.github.io/sheenui/charts/chord-diagram): Two-way flows between a few groups (Flow)
- [Network graph](https://lokendra-builds.github.io/sheenui/charts/network-graph): Connections between entities (Flow, Hierarchy)
- [Gantt chart](https://lokendra-builds.github.io/sheenui/charts/gantt): Tasks on a timeline, with dependencies (Flow)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap): Part-to-whole as nested tiles (Hierarchy, Composition)
- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst): A hierarchy as nested rings (Hierarchy, Composition)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map): Values by country on a world map (Geo)
- [Candlestick chart](https://lokendra-builds.github.io/sheenui/charts/candlestick): Open, high, low and close per period (Finance, Trend)
- [OHLC bars](https://lokendra-builds.github.io/sheenui/charts/candlestick): Price bars with open and close ticks (Finance)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart): How a total builds up step by step (Finance, Composition)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar): Tiny columns or win/loss marks in a tile (KPI, Trend)
- [Gauge](https://lokendra-builds.github.io/sheenui/charts/gauge-chart): One value on a scale with colored bands (KPI)
- [Radial bar chart](https://lokendra-builds.github.io/sheenui/charts/radial-bar-chart): A few goals as concentric rings (KPI, Comparison)
- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart): A measure against its target and ranges (KPI, Comparison)
- [Category bar](https://lokendra-builds.github.io/sheenui/charts/category-bar): Where one value falls among bands (KPI)
- [Tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker): Status per period, e.g. 30 days of uptime (KPI, Trend)


## About charts

### Overview

SheenUI's React charts are animated, accessible chart components for Tailwind CSS v4: smooth curves, gradient fills, draw-in entrances, previous-period comparison, clickable legends, annotations, a brush, synced crosshairs and PNG, SVG and CSV export. As a shadcn charts alternative, each chart has a table view of the same data.

Open any card above for its live demo, props and keyboard map, or start with the [line chart](https://lokendra-builds.github.io/sheenui/charts/line-chart), the [bar chart](https://lokendra-builds.github.io/sheenui/charts/bar-chart) and the [donut chart](https://lokendra-builds.github.io/sheenui/charts/donut-chart).

### Frequently asked questions

### What chart types does SheenUI include?

Line, area, bar, donut and sparkline charts, plus funnels, heatmaps, treemaps, sankey diagrams, candlesticks, maps and more, all drawn with the same glass tooltip, legend and table view.

### Are the charts accessible?

Yes. Every chart can be read with the arrow keys, announces the point it is on, and has a table view of the same data. Status colors always come with a word or an icon, and reduced motion shows final values.

### Can I use them with my own data?

Each chart takes plain arrays of objects. Pass the rows and the series, and the axes, legend, tooltip and table view are built from them.


## Line, area, bar and donut

The everyday charts, documented here. Smooth curves, gradient fills, draw-in and grow-from-baseline entrances, previous-period comparison, clickable legends, annotations, a brush, synced crosshairs and PNG / SVG / CSV export. As a shadcn charts alternative, each chart has a table view.

## Chart-wide features

The same building blocks power every chart above and the dashboards: synced crosshairs, annotations, export, live data and i18n.

## API

Series take a color slot from 1 to 8 (the validated palette, assigned in order when omitted, never re-ranked when a series is hidden). Every chart needs an aria-label; pair it with a ChartTable so every value can be read without color.

### Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move through the card's tabs and menu, then the legend keys, then the chart and its brush handles. |
| ← → (↑ ↓) | Read the previous / next point (the crosshair moves and the values are announced). |
| Home/End | First / last point. |
| Escape | Clear the active point. |
| Enter/Spaceon a legend key | Hide or show that series (announced). |
| ← →on a brush handle | Move that edge one step; Page Up / Page Down move ten percent; Home / End go to the ends. |
| Shift + ← →on a brush handle | Pan the whole window. |
| ← →on Chart / Table | Switch between the chart and its table. |

### Accessibility

- Every interactive chart is a focusable figure named by its title and described by the reading instructions (the same key on every chart, `labels.instructions`, a string or a function); inside a ChartCard with a table, `aria-details` points at the table view. The active values are announced once, politely.
- Every chart has a table view (Chart / Table tabs), so no value depends on color or on seeing the marks.
- Legend keys are toggle buttons (pressed = shown); hiding or showing a series is announced.
- Event markers are read out with the data point they sit on; status colors always come with a word or an icon.
- Reduced motion: charts appear at their final values, data changes jump, and live charts stop sliding.
- Windows High Contrast: legend keys gain outlines, the active tab and brush window use system colors.


## All exports on this page

- ChartAnnotationsLayer — Draws annotations inside a chart's plot group (already translated to the plot origin).
- ChartAnnouncer — Screen-reader announcement of the active data point (charts are keyboard-navigable).
- ChartBrush — Memoised: the chart above re-renders on every pointer move, the brush only when its range does.
- ChartCard — A glass card with header, legend and (when table is given) Chart / Table tabs.
- ChartLegend — Legend keys mirror the mark: a short line for line charts, a swatch for bars/areas.
- ChartSyncProvider — Groups charts so one reading drives all of them.
- ChartTable — Every chart has a table view: the accessible, colour-free way to read every value.
- ChartTooltip — Glass tooltip positioned inside the chart container.
- ChartWidthHint — The width (px) charts inside can assume before they have measured themselves, e.g.
- LegendKey — The colour key for a series, drawn as SVG (not a CSS background) so it survives forced-colors / Windows High Contrast.
- RadialProgress — A single ratio against a limit.
- TableScroll — Horizontal scroll container for a table view: when the table is wider than the card, it scrolls inside (never the page).
- annotationColors — Stroke / fill / text colours for a tone (tokens only).
- annotationValues — Values the value axis should include so every reference line and band is on screen.
- chartTooltipSurface — Classes + style for a chart tooltip surface (for charts that build their own tooltip).
- clampBrushRange — Keep a range inside [0, count - 1] with at least minSpan rows.
- createChartSyncStore — A standalone sync store, for syncing charts that don't share a parent (pass it as store).
- defaultBrushRange — A sensible starting window: the last fraction of count rows (at least minSpan).
- defaultChartBrushLabels — The built-in English strings of ChartBrush; spread it into your own labels and change what you need.
- defaultChartCardLabels — The built-in English strings of ChartCard; spread it into your own labels and change what you need.
- defaultChartLegendLabels — The built-in English strings of ChartLegend; spread it into your own labels and change what you need.
- defaultChartTableLabels — The English strings of ChartTable (and of the empty state); a ChartCard's labels override them below it.
- defaultRadialProgressLabels — The built-in English strings of RadialProgress; spread it into your own labels and change what you need.
- dockSpace — Height to reserve above the plot for the docked readout (touch screens): the lines the widest readout ANY point produces.
- eventsAt — Event markers that sit on row i (read out with that row's values).
- fitTicks — Round ticks that hug the data AND fit the axis.
- formatCompact — 1,284 · 12.9K · 4.2M · −640
- localeTickFormat — formatTick for any locale: ticks keep exactly the decimals their step needs (0.25 stays 0,25 in German), compact from 10,000.
- percentChange — Signed percent change from previous to current ("+12.4%", "−3%"), or null when undefined.
- seriesLegend — Builds the ChartLegend items for a list of series (colour by position, key shape line or rect).
- useChartFrame — useElementWidth that also hands back the element itself (for in-view checks, exports and pointer maths).
- useChartSeriesState — Hidden / highlighted series state for building your own interactive legend + chart pair.
- useChartSeriesVisibility — For chart authors: the series visibility to draw with.
- useChartSharedLabels — Text a ChartCard hands down to its table and empty states (labels.noData, labels.previous).
- useChartSync — For chart authors.
- useElementInView — Whether element is in the viewport (IntersectionObserver).
- withMinimum — Give every non-zero length at least min (so a 0.1% share still draws a visible mark), taking the room from the larger ones in proportion.


## Related pages

### Guides that cover it

- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)
- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts)
- [shadcn Alternatives with Animation: Nine Libraries Compared (2026)](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
