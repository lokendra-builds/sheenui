Canonical: https://lokendra-builds.github.io/sheenui/charts/realtime-chart

# Real-Time Streaming Line Chart for React

URL: https://lokendra-builds.github.io/sheenui/charts/realtime-chart
Sidebar name: Real-time chart

A live, real-time line chart for React: new samples glide in while the time axis slides, with a Pause button and a still mode for reduced motion. MIT.

What it is: A real-time React line chart: each new sample glides in from the right while the time axis slides under it. Pass data as readonly ChartRow[]: samples so far, oldest first: { time, …values }.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/streaming-chart.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Charts](https://lokendra-builds.github.io/sheenui/charts/) > Real-time chart

Next.js: samples here pass functions (formatters, seriesLegend, a dashboard's load), so put them in a file that starts with "use client".

Files to copy from `theme/src/`:

- `components/charts/{streaming-chart.tsx, category-bar.tsx, chart-export-menu.tsx, chart-export.ts, chart-figure.tsx, chart-fit.tsx, chart-icons.tsx, chart-parts.tsx, chart-patterns.tsx, chart-pointer.tsx, chart-tip.tsx, chart-utils.ts, heatmap.tsx, streamgraph.tsx}`
- `components/button/`
- `components/charts/category-bar/`
- `components/charts/chart-parts/`
- `components/charts/heatmap/`
- `components/charts/streamgraph/`
- `components/charts/streaming-chart/`
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

Registry item: streaming-chart. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartRow, type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StreamingChart } from "@/components/sheenui/charts/streaming-chart";
import { useStreamingData } from "@/components/sheenui/charts/streaming-chart/model";
import { StreamingTable } from "@/components/sheenui/charts/streaming-chart/parts";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChartCard, type ChartRow, type ChartSeries, StreamingChart, StreamingTable, useStreamingData } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | Samples so far, oldest first: { time, …values }. Append rows as they arrive (or use useStreamingData). |
| index | string | "time" | Key of the timestamp (ms) in each row. |
| series | readonly ChartSeries[] | required | Up to 4 lines, each with a fixed color slot. |
| rate | number | 1000 | Expected ms between samples. The view trails the newest sample by this much, so points glide in. |
| window | number | 60 | How much time is in view, in samples. |
| paused | boolean | optional, no default | Pause the view (controlled). Data keeps arriving; resuming glides to the present. |
| defaultPaused | boolean | false | Starts in the paused state (uncontrolled). |
| onPausedChange | ((paused: boolean) => void) | optional, no default | Called with the new paused state when the user pauses or resumes (controlled paused). |
| area | boolean | true | Fill under each line with a fading wash. |
| zero | boolean | false | Keep zero on the value axis. |
| height | number | 240 | Sets the height of the plot in px. |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the axis, tooltip and data table: takes the number, returns the text shown. |
| formatTime | ((time: Date) => string) | "2:05:09 PM" (or "14:05:09") in locale | Formats a timestamp as text. |
| locale | string | the browser's | BCP 47 locale of the default formats. |
| timeZone | string | the viewer's | IANA time zone of the default time format, e.g. "UTC". |
| emptyState | ReactNode | optional, no default | Shown before the first sample arrives. |
| labels | Partial<StreamingChartLabels> | defaultStreamingChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultStreamingChartLabels. All 8 keys of StreamingChartLabels are listed in the key table under the props table. |
| aria-label | string | required | Accessible summary of what the chart shows. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## useStreamingData(source, options)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| source | (time, index) => number \| Record<string, number> | optional, no default | Called every rate ms for the next sample. |
| options.rate | number | 1000 | Sets the number of milliseconds between two samples. |
| options.history | number | 60 | Samples generated for the past at mount, so the chart starts full. |
| options.capacity | number | 240 | Keeps this many samples; older ones drop off. |
| options.index / valueKey | string | "time" / "value" | Keys of the timestamp, and of the value when source returns a number. |
| options.enabled | boolean | true | Set it to false to stop sampling. |
| options.startAt | number | Date.now() | Time of the newest sample on the first render. Pass a fixed time on prerendered pages (the server's and the browser's history must match); right after mount the history is rebuilt to end now. |
| options.pauseWhenHidden | boolean | true | No timer while the tab is hidden; back on the tab the missed samples are filled in, so the line stays continuous. |
| options.idle | boolean | false | Rest without losing time (e.g. pass !inView): no timer while true, then the missed samples are filled in. |

## StreamingTable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | readonly ChartRow[] | required | Samples so far, oldest first: { time, …values }. Append rows as they arrive (or use useStreamingData). |
| format | ((n: number) => string) | formatCompact in locale | Formats a value for the axis, tooltip and data table: takes the number, returns the text shown. |
| labels | Partial<StreamingChartLabels> | defaultStreamingChartLabels | Every other string, for translation: labels={{ instructions: "…" }}; omitted keys keep the English of defaultStreamingChartLabels. All 8 keys of StreamingChartLabels are listed in the key table under the props table. |
| locale | string | "en" | BCP 47 locale of the default formats. |
| index | string | "time" | Key of the timestamp (ms) in each row. |
| series | readonly ChartSeries[] | required | Up to 4 lines, each with a fixed color slot. |
| timeZone | string | the viewer's | IANA time zone of the default time format, e.g. "UTC". |
| formatTime | ((time: Date) => string) | "2:05:09 PM" (or "14:05:09") in locale | Formats a timestamp as text. |
| limit | number | 20 | Limits the rows shown, newest first. |
| caption | string | optional, no default | Hidden caption that names the table for screen readers. |

## Example 1 of 2: Two series, one sample a second

useStreamingData calls your function every second and keeps a rolling buffer; the chart and its table both read it. Call it in the small component that renders the card, so each sample re-renders only that card. Hover, tap or arrow through the line to hold the view and read values. Pause stops the view; data keeps arriving and Resume glides to the present.

```tsx
import { useEffect, useRef, useState } from "react";
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { type ChartSeries } from "@/components/sheenui/charts/chart-utils";
import { StreamingChart } from "@/components/sheenui/charts/streaming-chart";
import { useStreamingData } from "@/components/sheenui/charts/streaming-chart/model";
import { StreamingTable } from "@/components/sheenui/charts/streaming-chart/parts";
// Package build (after the first npm release, or a packed tarball): import { useStreamingData, ChartCard, StreamingTable, StreamingChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "cpu", label: "CPU", color: 1 },
  { key: "memory", label: "Memory", color: 3 },
];
const percent = (n: number) => Math.round(n) + "%";

// Stand-ins for your metrics source: replace them with a real reading.
const readCpu = () => 35 + Math.random() * 30;
const readMemory = () => 55 + Math.random() * 10;

// The hook lives in the card's own component: a sample re-renders this card, not the page.
// Off-screen the feed rests (idle) and the missed samples are filled in when it's back.
export function Example() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry?.isIntersecting ?? true), { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const data = useStreamingData(
    () => ({ cpu: readCpu(), memory: readMemory() }),
    { rate: 1000, history: 60, idle: !near },
  );
  return (
    <div ref={ref}>
      <ChartCard title="web-01" table={<StreamingTable data={data} series={series} format={percent} />}>
        <StreamingChart
          data={data}
          series={series}
          rate={1000}
          window={60}
          format={percent}
          aria-label="CPU and memory of web-01, last minute"
        />
      </ChartCard>
    </div>
  );
}
```

## Example 2 of 2: Fast feed with a zero baseline

Two samples a second, 40 seconds in view, the axis anchored at zero. Push your own rows (from a socket, say) and the chart animates them the same way.

```tsx
import { useEffect, useState } from "react";
import { type ChartRow } from "@/components/sheenui/charts/chart-utils";
import { StreamingChart } from "@/components/sheenui/charts/streaming-chart";
// Package build (after the first npm release, or a packed tarball): import { StreamingChart, type ChartRow } from "@sheenui/theme";

export function Example() {
  const [rows, setRows] = useState<ChartRow[]>([]);
  useEffect(() => {
    // Your feed: one message per sample, e.g. { "rps": 812 }
    const socket = new WebSocket("wss://example.com/metrics");
    socket.onmessage = (event) => {
      const rps = Number(JSON.parse(String(event.data)).rps);
      setRows((r) => [...r.slice(-200), { time: Date.now(), rps }]);
    };
    return () => socket.close();
  }, []);
  return (
    <StreamingChart
      data={rows}
      series={[{ key: "rps", label: "Requests / s", color: 7 }]}
      rate={500}
      window={80}
      zero
      aria-label="Requests per second"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the chart, then the Pause button. |
| ← / → | Read the previous / next sample; the view holds still while you read. |
| Home / End | Oldest / newest sample in view. |
| Space / K | Pause or resume the view. |
| Escape | Stop reading; the view catches up with the present. |

## Accessibility

- Anything that moves on its own can be paused (WCAG 2.2.2): the Pause button is built in, and Space or K toggles it from the chart.
- New samples are never announced on their own (that would be a flood); a sample read by keyboard is announced once, with every series' value.
- The status pill says Live, Holding or Paused in words, and the latest values in the header double as the legend.
- Reduced motion: no sliding, no pulse and no rolling numbers; the chart redraws in place once per sample.
- Off-screen or in a background tab the chart rests (no frame loop, no redraw, no pulse); useStreamingData stops its timer in a background tab (and off-screen with `idle`), then fills in the gap so the chart glides to the present.
- The table view lists the latest samples, newest first.

## All exports on this page

- StreamingChart — A live line chart: new samples glide in from the right as the time axis slides smoothly under them, like a heart-rate monitor.
- StreamingTable — The latest samples, newest first: time and each series' value.
- defaultStreamingChartLabels — The built-in English strings of StreamingChart; spread it into your own labels and change what you need.
- useLiveData — Live (streaming) rows for any chart: appends next() every interval ms into a sliding window.
- useStreamingData — A rolling buffer of samples: calls source(time, index) every rate ms and keeps the last capacity rows, { time, ...values }.


## When to use the real-time chart

- Use it as a live chart in React for an ops wall or a status page, such as requests per second and error rate over the last minute, where samples keep arriving and the line should glide along instead of redrawing.
- It fits a monitoring panel fed by a WebSocket, because you can append your own rows to data and the chart animates them the same way as generated ones.
- It also works as a fast feed with the axis anchored at zero, such as two samples a second with 40 seconds in view.
- Skip it when data arrives rarely or the history is the point; LineChart handles a static range better, and Tracker fits status-by-day history.
- Pair it with ChartCard for the title, useStreamingData to generate and buffer samples, and StreamingTable for the latest rows as text; the chart brings its own Live status and Pause button.


## Frequently asked questions

### How do I build a real time chart in React with SheenUI?

Call useStreamingData(source, options) in the small component that renders the card; it calls source every rate ms, 1000 by default, and keeps a rolling buffer. Pass the rows and series to StreamingChart. Each sample then re-renders only that card.

### Can users pause the chart to read a value?

Yes. Hovering, tapping or arrowing holds the view still, and there is a built-in Pause button; Space or K toggles it from the chart. Data keeps arriving while paused, and Resume glides to the present. Use paused or defaultPaused to control it.

### What does it do on prerendered pages?

Timestamps depend on the clock and the viewer's time zone, so pass timeZone and locale, and a fixed options.startAt, so server and browser histories match. Right after mount the history is rebuilt to end now.

### How does it save work in the background?

With pauseWhenHidden on by default, no timer runs while the tab is hidden, and the missed samples are filled in when you return so the line stays continuous. Under reduced motion the chart redraws in place, with no sliding.


## Related pages

- [Sunburst chart](https://lokendra-builds.github.io/sheenui/charts/sunburst)
- [Uptime tracker](https://lokendra-builds.github.io/sheenui/charts/uptime-tracker)
- [Treemap](https://lokendra-builds.github.io/sheenui/charts/treemap)
- [Waffle chart](https://lokendra-builds.github.io/sheenui/charts/waffle)
- [Waterfall chart](https://lokendra-builds.github.io/sheenui/charts/waterfall-chart)
- [World map](https://lokendra-builds.github.io/sheenui/charts/world-map)

48 charts pages in all: browse them on [Charts](https://lokendra-builds.github.io/sheenui/charts/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
