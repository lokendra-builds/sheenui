import { useState } from "react";
import { ChartCard } from "../layout/ExampleChartCard";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import { lazyBlock } from "../layout/lazy-block";
import { Streamgraph, StreamgraphTable, streamgraphLegend } from "@sheenui/theme";
import { StreamingChart, type ChartRow, type ChartSeries } from "@sheenui/theme";
import { DEMO_NOW_UTC_MS } from "../demo-clock";
import * as PROPS from "../generated/component-props";
import { EdgeRequestsCard, ServerLoadCard } from "./ChartsProgressPages/streaming-chart";
import { genres, hours, listening, sources, traffic } from "./ChartsProgressPages/streamgraph";
import { CHARTS } from "./ChartsProgressPages/shared";

/** A fixed minute of web-01 load for the stage: a static snapshot, no live feed. */
const snapshotSeries: ChartSeries[] = [
  { key: "cpu", label: "CPU", color: 1 },
  { key: "memory", label: "Memory", color: 3 },
];
const snapshotRows: ChartRow[] = Array.from({ length: 60 }, (_, i) => {
  const burst = Math.max(0, Math.sin(i / 9)) ** 6 * 30;
  return {
    time: DEMO_NOW_UTC_MS - (59 - i) * 1000,
    cpu: Math.round(34 + Math.sin(i / 7) * 12 + burst + Math.sin(i * 12.9) * 4),
    memory: Math.round(52 + (i / 60) * 18 + Math.sin(i * 3.1)),
  };
});

/**
 * The "Candlestick chart" docs page (/charts/candlestick): its body is its own chunk, fetched while the page hydrates, so
 * the chart, its helpers and the sample data stay out of the route's initial JavaScript (the prerendered HTML holds it).
 */
export const CandlestickChartPage = lazyBlock(
  () => import("./CandlestickChartPageBody").then((m) => m.CandlestickChartPage),
  {
    eager: true,
    minHeight: "80vh",
  },
);

/** The "Streaming chart" docs page (/charts/realtime-chart): live examples, props and notes. */
export function StreamingChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Streaming chart"
      description="A live line chart: each new sample glides in from the right while the time axis slides under it, and a glowing head rides the line. It holds still while you read a value, has its own Pause button, and redraws in place (no sliding) under reduced motion."
      source={`${CHARTS}streaming-chart.tsx`}
    >
      <ChartStage label="Streaming chart demo" title="web-01" hue={1} height="17.75rem" narrowHeight="21.5rem">
        <StreamingChart
          data={snapshotRows}
          series={snapshotSeries}
          rate={1000}
          window={60}
          format={(n) => `${Math.round(n)}%`}
          locale="en-US"
          timeZone="UTC"
          aria-label="CPU and memory of web-01, last minute"
        />
      </ChartStage>
      <Example
        title="Two series, one sample a second"
        description="useStreamingData calls your function every second and keeps a rolling buffer; the chart and its table both read it. Call it in the small component that renders the card, so each sample re-renders only that card. Hover, tap or arrow through the line to hold the view and read values. Pause stops the view; data keeps arriving and Resume glides to the present."
        variant="bare"
        code={`
import { useEffect, useRef, useState } from "react";
import { useStreamingData, ChartCard, StreamingTable, StreamingChart, type ChartSeries } from "@sheenui/theme";

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
}`}
      >
        <ServerLoadCard />
      </Example>

      <Example
        title="Fast feed with a zero baseline"
        description="Two samples a second, 40 seconds in view, the axis anchored at zero. Push your own rows (from a socket, say) and the chart animates them the same way."
        variant="bare"
        code={`
import { useEffect, useState } from "react";
import { StreamingChart, type ChartRow } from "@sheenui/theme";

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
}`}
      >
        <EdgeRequestsCard />
      </Example>

      <PropsTable of={PROPS.StreamingChart} />
      <PropsTable
        title="useStreamingData(source, options)"
        as="h3"
        rows={[
          [
            "source",
            "(time, index) => number | Record<string, number>",
            "",
            "Called every `rate` ms for the next sample.",
          ],
          ["options.rate", "number", "1000", "Sets the number of milliseconds between two samples."],
          ["options.history", "number", "60", "Samples generated for the past at mount, so the chart starts full."],
          ["options.capacity", "number", "240", "Keeps this many samples; older ones drop off."],
          [
            "options.index / valueKey",
            "string",
            '"time" / "value"',
            "Keys of the timestamp, and of the value when `source` returns a number.",
          ],
          ["options.enabled", "boolean", "true", "Set it to false to stop sampling."],
          [
            "options.startAt",
            "number",
            "Date.now()",
            "Time of the newest sample on the first render. Pass a fixed time on prerendered pages (the server's and the browser's history must match); right after mount the history is rebuilt to end now.",
          ],
          [
            "options.pauseWhenHidden",
            "boolean",
            "true",
            "No timer while the tab is hidden; back on the tab the missed samples are filled in, so the line stays continuous.",
          ],
          [
            "options.idle",
            "boolean",
            "false",
            "Rest without losing time (e.g. pass !inView): no timer while true, then the missed samples are filled in.",
          ],
        ]}
      />
      <PropsTable as="h2" title="StreamingTable props" of={PROPS.StreamingTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart, then the Pause button."],
          ["← / →", "Read the previous / next sample; the view holds still while you read."],
          ["Home / End", "Oldest / newest sample in view."],
          ["Space / K", "Pause or resume the view."],
          ["Escape", "Stop reading; the view catches up with the present."],
        ]}
      />
      <A11yNotes>
        <li>
          Anything that moves on its own can be paused (WCAG 2.2.2): the Pause button is built in, and Space or K
          toggles it from the chart.
        </li>
        <li>
          New samples are never announced on their own (that would be a flood); a sample read by keyboard is announced
          once, with every series' value.
        </li>
        <li>
          The status pill says Live, Holding or Paused in words, and the latest values in the header double as the
          legend.
        </li>
        <li>
          Reduced motion: no sliding, no pulse and no rolling numbers; the chart redraws in place once per sample.
        </li>
        <li>
          Off-screen or in a background tab the chart rests (no frame loop, no redraw, no pulse); useStreamingData stops
          its timer in a background tab (and off-screen with `idle`), then fills in the gap so the chart glides to the
          present.
        </li>
        <li>The table view lists the latest samples, newest first.</li>
      </A11yNotes>
    </Page>
  );
}

/** The "Streamgraph" docs page (/charts/streamgraph): live examples, props and notes. */
export function StreamgraphPage() {
  const [offset, setOffset] = useState<"wiggle" | "silhouette">("wiggle");
  return (
    <Page
      eyebrow="Chart"
      title="Streamgraph"
      description="Stacked areas flowing around a moving center line: how a mix swells and fades over time. The wiggle baseline and inside-out order keep layers as flat as they can be, names sit inside the layers where they fit, and the crosshair reads every layer with its share."
      source={`${CHARTS}streamgraph.tsx`}
    >
      <ChartStage label="Streamgraph demo" title="Listening by genre" hue={5} height="20rem">
        <Streamgraph
          data={listening}
          index="week"
          series={genres}
          format={hours}
          height={320}
          aria-label="Weekly listening hours by genre"
        />
      </ChartStage>
      <Example
        title="A year of listening"
        description="Seven genres over 52 weeks. Hover a layer to bring it forward; use left / right to move through time and up / down to pick a layer. Switch the baseline to compare wiggle and silhouette."
        variant="bare"
        controls={
          <Segmented
            label="Baseline"
            size="sm"
            options={[
              { value: "wiggle", label: "Wiggle" },
              { value: "silhouette", label: "Silhouette" },
            ]}
            value={offset}
            onValueChange={setOffset}
          />
        }
        code={`
import { ChartCard, streamgraphLegend, StreamgraphTable, Streamgraph, type ChartRow, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "pop", label: "Pop", color: 5 },
  { key: "hiphop", label: "Hip-hop", color: 2 },
  { key: "rock", label: "Rock", color: 8 },
];
const data: ChartRow[] = [
  { week: "Nov 3", pop: 6.2, hiphop: 4.1, rock: 2.8 },
  { week: "Nov 10", pop: 6.8, hiphop: 4.4, rock: 2.5 },
  { week: "Nov 17", pop: 7.4, hiphop: 3.9, rock: 2.2 },
  { week: "Nov 24", pop: 7.0, hiphop: 4.8, rock: 2.6 },
  { week: "Dec 1", pop: 8.1, hiphop: 5.2, rock: 3.0 },
  { week: "Dec 8", pop: 7.6, hiphop: 4.6, rock: 3.4 },
];
const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const hours = (n: number) => oneDecimal.format(n) + " h";

export function Example() {
  return (
    <ChartCard
      title="Listening by genre"
      legend={streamgraphLegend(series)}
      table={<StreamgraphTable data={data} index="week" series={series} format={hours} />}
    >
      <Streamgraph data={data} index="week" series={series} offset="wiggle" format={hours} aria-label="Weekly listening hours by genre" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Listening by genre"
          description="Hours per week, Nov 2025 to Oct 2026, by genre"
          legend={streamgraphLegend(genres)}
          table={
            <StreamgraphTable
              data={listening}
              index="week"
              indexLabel="Week of"
              series={genres}
              format={hours}
              caption="Weekly listening hours by genre"
            />
          }
        >
          <Streamgraph
            data={listening}
            index="week"
            series={genres}
            offset={offset}
            format={hours}
            height={320}
            aria-label="Weekly listening hours by genre"
          />
        </ChartCard>
      </Example>

      <Example
        title="Traffic sources around a launch"
        description="Thirty days of visits by source, with a launch spike in week three. Silhouette or wiggle, the total is always the stream's thickness."
        variant="bare"
        code={`
import { Streamgraph, type ChartRow, type ChartSeries } from "@sheenui/theme";

const sources: ChartSeries[] = [
  { key: "search", label: "Search", color: 1 },
  { key: "social", label: "Social", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "email", label: "Email", color: 7 },
];
const traffic: ChartRow[] = [
  { day: "Day 1", search: 1800, social: 640, referral: 1100, email: 420 },
  { day: "Day 8", search: 1850, social: 700, referral: 1150, email: 400 },
  { day: "Day 15", search: 2300, social: 1900, referral: 2600, email: 2400 },
  { day: "Day 22", search: 2100, social: 1200, referral: 1700, email: 450 },
  { day: "Day 30", search: 1950, social: 800, referral: 1300, email: 430 },
];

export function Example() {
  return <Streamgraph data={traffic} index="day" series={sources} height={260} aria-label="Daily visits by source" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Visits by source"
          description="Last 30 days"
          legend={streamgraphLegend(sources)}
          table={
            <StreamgraphTable
              data={traffic}
              index="day"
              indexLabel="Day"
              series={sources}
              caption="Daily visits by source"
            />
          }
        >
          <Streamgraph data={traffic} index="day" series={sources} height={260} aria-label="Daily visits by source" />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.Streamgraph} />
      <PropsTable as="h2" title="StreamgraphTable props" of={PROPS.StreamgraphTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart (one tab stop)."],
          ["← / →", "Move through time."],
          ["↑ / ↓", "Pick a layer, top to bottom as stacked on screen."],
          ["Home / End", "First / last point in time."],
          ["Escape", "Clear the layer and the crosshair."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure; each step through time announces every layer's value and share, largest
          first, then the total. With a layer picked, only that layer is read.
        </li>
        <li>
          Layer names sit on solid tags of the chart surface, so they meet AA contrast on any layer color; layers that
          are too thin for a name rely on the legend and the tooltip.
        </li>
        <li>Color slots are fixed per series and never repeat: more than 8 layers fold into a gray “Other”.</li>
        <li>
          On phones the readout docks above the plot instead of covering it; vertical swipes keep scrolling the page.
        </li>
        <li>The table view lists every value with a total column. Reduced motion draws the layers in place.</li>
      </A11yNotes>
    </Page>
  );
}
