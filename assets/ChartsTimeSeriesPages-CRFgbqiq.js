import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{i,n as a,o,r as s}from"./Page-DQ8sr8qt.js";import{t as c}from"./Example-DMEbQwm9.js";import{t as l}from"./lazy-block-BfzH_8EP.js";import{i as u,n as d,t as f}from"./streaming-chart-CmIn_bSu.js";import{i as p}from"./demo-clock-CoEY-AlH.js";import{Mt as m}from"./vendor-core-DFpXCaZU.js";import{t as h}from"./ExampleChartCard-DOQs1ydL.js";import{t as g}from"./shared-DRPI2QvD.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`data`,`readonly ChartRow[]`,``,"Samples so far, oldest first: `{ time, …values }`. Append rows as they arrive (or use useStreamingData).",!0],[`index`,`string`,`"time"`,`Key of the timestamp (ms) in each row.`,!1],[`series`,`readonly ChartSeries[]`,``,"Up to 4 lines, each with a fixed `color` slot.",!0],[`rate`,`number`,`1000`,`Expected ms between samples. The view trails the newest sample by this much, so points glide in.`,!1],[`window`,`number`,`60`,`How much time is in view, in samples.`,!1],[`paused`,`boolean`,``,`Pause the view (controlled). Data keeps arriving; resuming glides to the present.`,!1],[`defaultPaused`,`boolean`,`false`,`Starts in the paused state (uncontrolled).`,!1],[`onPausedChange`,`((paused: boolean) => void)`,``,"Called with the new paused state when the user pauses or resumes (controlled `paused`).",!1],[`area`,`boolean`,`true`,`Fill under each line with a fading wash.`,!1],[`zero`,`boolean`,`false`,`Keep zero on the value axis.`,!1],[`height`,`number`,`240`,`Sets the height of the plot in px.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the axis, tooltip and data table: takes the number, returns the text shown.`,!1],[`formatTime`,`((time: Date) => string)`,`"2:05:09 PM" (or "14:05:09") in locale`,`Formats a timestamp as text.`,!1],[`locale`,`string`,`the browser's`,`BCP 47 locale of the default formats.`,!1],[`timeZone`,`string`,`the viewer's`,`IANA time zone of the default time format, e.g. "UTC".`,!1],[`emptyState`,`ReactNode`,``,`Shown before the first sample arrives.`,!1],[`labels`,`Partial<StreamingChartLabels>`,`defaultStreamingChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultStreamingChartLabels`. All 8 keys of `StreamingChartLabels` are listed in the key table under the props table.',!1,{type:`StreamingChartLabels`,const:`defaultStreamingChartLabels`,keys:[[`instructions`,`Use left and right arrow keys to read recent values; the view holds still while you read.`],[`live`,`Live`],[`paused`,`Paused`],[`holding`,`Holding`],[`pause`,`Pause`],[`resume`,`Resume`],[`waiting`,`Waiting for data…`],[`time`,`Time`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`data`,`readonly ChartRow[]`,``,"Samples so far, oldest first: `{ time, …values }`. Append rows as they arrive (or use useStreamingData).",!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the axis, tooltip and data table: takes the number, returns the text shown.`,!1],[`labels`,`Partial<StreamingChartLabels>`,`defaultStreamingChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultStreamingChartLabels`. All 8 keys of `StreamingChartLabels` are listed in the key table under the props table.',!1,{type:`StreamingChartLabels`,const:`defaultStreamingChartLabels`,keys:[[`instructions`,`Use left and right arrow keys to read recent values; the view holds still while you read.`],[`live`,`Live`],[`paused`,`Paused`],[`holding`,`Holding`],[`pause`,`Pause`],[`resume`,`Resume`],[`waiting`,`Waiting for data…`],[`time`,`Time`]]}],[`locale`,`string`,`"en"`,`BCP 47 locale of the default formats.`,!1],[`index`,`string`,`"time"`,`Key of the timestamp (ms) in each row.`,!1],[`series`,`readonly ChartSeries[]`,``,"Up to 4 lines, each with a fixed `color` slot.",!0],[`timeZone`,`string`,`the viewer's`,`IANA time zone of the default time format, e.g. "UTC".`,!1],[`formatTime`,`((time: Date) => string)`,`"2:05:09 PM" (or "14:05:09") in locale`,`Formats a timestamp as text.`,!1],[`limit`,`number`,`20`,`Limits the rows shown, newest first.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1]],b=e(t(),1),x=n(),S=[{key:`cpu`,label:`CPU`,color:1},{key:`memory`,label:`Memory`,color:3}],C=e=>`${Math.round(e)}%`;function w(e){let t=e/1e3,n=Math.sin(t*12.9898)*43758.5453,r=n-Math.floor(n),i=Math.max(0,Math.sin(t/9))**6*30;return{cpu:Math.min(98,Math.max(4,34+Math.sin(t/23)*12+i+(r-.5)*9)),memory:52+t%90/90*18+(r-.5)*2}}function T(e){let t=e/500,n=Math.sin(t*78.233)*12543.123,r=n-Math.floor(n);return Math.round(1180+Math.sin(t/17)*260+Math.sin(t/5.3)*90+(r-.5)*140)}var E=[{key:`rps`,label:`Requests / s`,color:7}];function D(){let e=(0,b.useRef)(null),t=m(e,{margin:`200px`}),n=u(w,{rate:1e3,history:60,capacity:180,idle:!t,startAt:p}),[r,i]=(0,b.useState)(!1);return(0,x.jsx)(`div`,{ref:e,className:`w-full`,children:(0,x.jsx)(h,{className:`w-full`,title:`web-01`,description:`us-east-1 · last 60 seconds`,table:(0,x.jsx)(d,{data:n,series:S,format:C,locale:`en-US`,timeZone:`UTC`,caption:`Latest samples of web-01`}),children:(0,x.jsx)(f,{data:n,series:S,rate:1e3,window:60,format:C,locale:`en-US`,timeZone:`UTC`,paused:r,onPausedChange:i,"aria-label":`CPU and memory of web-01, last minute`})})})}function O(){let e=(0,b.useRef)(null),t=m(e,{margin:`200px`}),n=u(T,{rate:500,history:100,capacity:240,valueKey:`rps`,idle:!t,startAt:p});return(0,x.jsx)(`div`,{ref:e,className:`w-full`,children:(0,x.jsx)(h,{className:`w-full`,title:`Edge requests`,description:`All regions, requests per second`,table:(0,x.jsx)(d,{data:n,series:E,locale:`en-US`,timeZone:`UTC`,caption:`Latest request rates`}),children:(0,x.jsx)(f,{data:n,series:E,rate:500,window:80,zero:!0,height:200,locale:`en-US`,timeZone:`UTC`,"aria-label":`Requests per second`})})})}var k=[{key:`cpu`,label:`CPU`,color:1},{key:`memory`,label:`Memory`,color:3}],A=Array.from({length:60},(e,t)=>{let n=Math.max(0,Math.sin(t/9))**6*30;return{time:p-(59-t)*1e3,cpu:Math.round(34+Math.sin(t/7)*12+n+Math.sin(t*12.9)*4),memory:Math.round(52+t/60*18+Math.sin(t*3.1))}});l(()=>_(()=>import(`./CandlestickChartPageBody-BuoMVeHO.js`).then(e=>e.CandlestickChartPage),[]),{eager:!0,minHeight:`80vh`});function j(){return(0,x.jsxs)(a,{eyebrow:`Chart`,title:`Streaming chart`,description:`A live line chart: each new sample glides in from the right while the time axis slides under it, and a glowing head rides the line. It holds still while you read a value, has its own Pause button, and redraws in place (no sliding) under reduced motion.`,source:`${g}streaming-chart.tsx`,children:[(0,x.jsx)(r,{label:`Streaming chart demo`,title:`web-01`,hue:1,height:`17.75rem`,narrowHeight:`21.5rem`,children:(0,x.jsx)(f,{data:A,series:k,rate:1e3,window:60,format:e=>`${Math.round(e)}%`,locale:`en-US`,timeZone:`UTC`,"aria-label":`CPU and memory of web-01, last minute`})}),(0,x.jsx)(c,{title:`Two series, one sample a second`,description:`useStreamingData calls your function every second and keeps a rolling buffer; the chart and its table both read it. Call it in the small component that renders the card, so each sample re-renders only that card. Hover, tap or arrow through the line to hold the view and read values. Pause stops the view; data keeps arriving and Resume glides to the present.`,variant:`bare`,code:`
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
}`,children:(0,x.jsx)(D,{})}),(0,x.jsx)(c,{title:`Fast feed with a zero baseline`,description:`Two samples a second, 40 seconds in view, the axis anchored at zero. Push your own rows (from a socket, say) and the chart animates them the same way.`,variant:`bare`,code:`
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
}`,children:(0,x.jsx)(O,{})}),(0,x.jsx)(s,{of:v}),(0,x.jsx)(s,{title:`useStreamingData(source, options)`,as:`h3`,rows:[[`source`,`(time, index) => number | Record<string, number>`,``,"Called every `rate` ms for the next sample."],[`options.rate`,`number`,`1000`,`Sets the number of milliseconds between two samples.`],[`options.history`,`number`,`60`,`Samples generated for the past at mount, so the chart starts full.`],[`options.capacity`,`number`,`240`,`Keeps this many samples; older ones drop off.`],[`options.index / valueKey`,`string`,`"time" / "value"`,"Keys of the timestamp, and of the value when `source` returns a number."],[`options.enabled`,`boolean`,`true`,`Set it to false to stop sampling.`],[`options.startAt`,`number`,`Date.now()`,`Time of the newest sample on the first render. Pass a fixed time on prerendered pages (the server's and the browser's history must match); right after mount the history is rebuilt to end now.`],[`options.pauseWhenHidden`,`boolean`,`true`,`No timer while the tab is hidden; back on the tab the missed samples are filled in, so the line stays continuous.`],[`options.idle`,`boolean`,`false`,`Rest without losing time (e.g. pass !inView): no timer while true, then the missed samples are filled in.`]]}),(0,x.jsx)(s,{as:`h2`,title:`StreamingTable props`,of:y}),(0,x.jsx)(o,{rows:[[`Tab`,`Focus the chart, then the Pause button.`],[`← / →`,`Read the previous / next sample; the view holds still while you read.`],[`Home / End`,`Oldest / newest sample in view.`],[`Space / K`,`Pause or resume the view.`],[`Escape`,`Stop reading; the view catches up with the present.`]]}),(0,x.jsxs)(i,{children:[(0,x.jsx)(`li`,{children:`Anything that moves on its own can be paused (WCAG 2.2.2): the Pause button is built in, and Space or K toggles it from the chart.`}),(0,x.jsx)(`li`,{children:`New samples are never announced on their own (that would be a flood); a sample read by keyboard is announced once, with every series' value.`}),(0,x.jsx)(`li`,{children:`The status pill says Live, Holding or Paused in words, and the latest values in the header double as the legend.`}),(0,x.jsx)(`li`,{children:`Reduced motion: no sliding, no pulse and no rolling numbers; the chart redraws in place once per sample.`}),(0,x.jsx)(`li`,{children:"Off-screen or in a background tab the chart rests (no frame loop, no redraw, no pulse); useStreamingData stops its timer in a background tab (and off-screen with `idle`), then fills in the gap so the chart glides to the present."}),(0,x.jsx)(`li`,{children:`The table view lists the latest samples, newest first.`})]})]})}export{j as default};