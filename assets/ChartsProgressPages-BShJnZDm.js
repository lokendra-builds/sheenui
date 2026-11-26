import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./glass-card-OGQy5mxG.js";import{n as r,t as i}from"./tracker-chart-DUd1AlJT.js";import{t as a}from"./ExampleChartCard-DOQs1ydL.js";import{i as o,n as s,o as c,r as l}from"./Page-BAL5Idhy.js";import{t as u}from"./demo-utils-DKtmFFFD.js";import{t as d}from"./Example-BPfHvEYD.js";import{t as f}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{n as p,t as m}from"./shared-DRPI2QvD.js";var h=[[`data`,`readonly TrackerBlock[]`,``,`Takes one block per period, oldest first.`,!0],[`statuses`,`Record<string, TrackerStatus>`,`defaultTrackerStatuses`,`Sets the status definitions, keyed by status name.`,!1],[`height`,`number`,`32`,`Height of the blocks in px.`,!1],[`startLabel`,`ReactNode`,``,`Text under the first and last block, e.g. "90 days ago" / "Today".`,!1],[`endLabel`,`ReactNode`,``,`Caption under the right end of the strip, e.g. "Today".`,!1],[`showLegend`,`boolean`,`true`,`Show each status (icon, label and count) under the strip.`,!1],[`formatLabel`,`((label: Date) => string)`,`"Mar 3" in locale`,`Formats Date / number labels.`,!1],[`locale`,`string`,`"en"`,`Locale of the default formats.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no blocks.`,!1],[`labels`,`Partial<TrackerChartLabels>`,`defaultTrackerChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultTrackerChartLabels`. All 7 keys of `TrackerChartLabels` are listed in the key table under the props table.',!1,{type:`TrackerChartLabels`,const:`defaultTrackerChartLabels`,keys:[[`instructions`,`Use the arrow keys to read each block.`],[`count`,"(status, count) => `${status}: ${count}`"],[`period`,`Period`],[`status`,`Status`],[`detail`,`Detail`],[`empty`,`No data`],[`showAll`,"(rows) => `Show all ${rows} rows`"]]}],[`aria-label`,`string`,``,`Names the strip for assistive tech (e.g. "API uptime, last 90 days").`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],g=[[`data`,`readonly TrackerBlock[]`,``,`Takes one block per period, oldest first.`,!0],[`labels`,`Partial<TrackerChartLabels>`,`defaultTrackerChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultTrackerChartLabels`. All 7 keys of `TrackerChartLabels` are listed in the key table under the props table.',!1,{type:`TrackerChartLabels`,const:`defaultTrackerChartLabels`,keys:[[`instructions`,`Use the arrow keys to read each block.`],[`count`,"(status, count) => `${status}: ${count}`"],[`period`,`Period`],[`status`,`Status`],[`detail`,`Detail`],[`empty`,`No data`],[`showAll`,"(rows) => `Show all ${rows} rows`"]]}],[`locale`,`string`,`"en"`,`Locale of the default formats.`,!1],[`statuses`,`Record<string, TrackerStatus>`,`defaultTrackerStatuses`,`Sets the status definitions, keyed by status name.`,!1],[`formatLabel`,`((label: Date) => string)`,`"Mar 3" in locale`,`Formats Date / number labels.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`order`,`"newest" | "oldest"`,`"newest"`,`Sets the sort order: newest first (default), or oldest first.`,!1],[`limit`,`number`,`30`,`Rows shown before "Show all" (opening the table stays instant on long strips).`,!1]];e();var _=t();function v(e,t,n){let r=u(e);return p(t).map((t,i)=>{let a=n[i];return a?{label:t,status:a[0],detail:a[1]}:i<3&&e===7?{label:t,status:`none`,detail:`Monitoring not yet enabled`}:{label:t,status:`ok`,detail:r()>.85?`No incidents · 1 maintenance window`:`No incidents`}})}var y=v(7,90,{18:[`degraded`,`Elevated error rate on /v2/search for 22 min`],19:[`degraded`,`Slow responses in eu-west for 41 min`],47:[`down`,`Full outage for 14 min: expired TLS certificate`],71:[`degraded`,`Webhook delivery delayed by up to 6 min`],86:[`degraded`,`Partial outage of file uploads for 9 min`]}),b=[{name:`API`,uptime:`99.98%`,data:v(11,30,{9:[`degraded`,`Elevated latency for 18 min`]})},{name:`Dashboard`,uptime:`100%`,data:v(12,30,{})},{name:`Webhooks`,uptime:`99.71%`,data:v(13,30,{4:[`down`,`Delivery halted for 2 h 5 min`],5:[`degraded`,`Backlog drained over 3 h`],22:[`degraded`,`Retries delayed for 35 min`]})}],x={passed:{label:`Passed`,tone:7,icon:(0,_.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,_.jsx)(`path`,{d:`M3.5 8.5l3 3 6-7`})})},failed:{label:`Failed`,tone:8,flag:!0,icon:(0,_.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,children:(0,_.jsx)(`path`,{d:`M4 4l8 8M12 4l-8 8`})})},flaky:{label:`Passed on retry`,tone:4,striped:!0,icon:(0,_.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,_.jsx)(`path`,{d:`M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5`})})},none:{label:`Cancelled`,tone:`neutral`,icon:(0,_.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,children:(0,_.jsx)(`path`,{d:`M4 8h8`})})}},S=(()=>{let e=u(42);return Array.from({length:48},(t,n)=>{let r=e(),i=1203+n,a=r>.93?`failed`:r>.83?`flaky`:r>.79?`none`:`passed`,o=6+Math.round(e()*5);return{label:`Build #${i}`,status:a,detail:a===`failed`?`e2e: checkout.spec.ts timed out`:a===`none`?`Superseded by a newer push`:`${o} min ${Math.round(e()*59)} s`}})})();function C(){return(0,_.jsxs)(s,{eyebrow:`Chart`,title:`Tracker`,description:`A strip of status blocks, one per day, build or check: the status-page view of uptime. Every block has its own tooltip, color is never the only cue (stripes and carets mark the worst days, and every status has an icon and a name), and long strips scroll inside the card instead of squeezing blocks to nothing.`,source:`${m}tracker-chart.tsx`,children:[(0,_.jsx)(f,{label:`Tracker demo`,title:`API uptime, last 90 days`,hue:4,height:`6rem`,narrowHeight:`7.375rem`,children:(0,_.jsx)(i,{data:y,startLabel:`90 days ago`,endLabel:`Today`,"aria-label":`API uptime, last 90 days`})}),(0,_.jsx)(d,{title:`Uptime, last 90 days`,description:`Hover, tap and drag, or arrow through the days. Degraded days are striped, outages carry a caret, and the legend counts each status.`,variant:`bare`,code:`
import { ChartCard, TrackerTable, TrackerChart, type TrackerBlock } from "@sheenui/theme";

const data: TrackerBlock[] = [
  { label: new Date("2026-08-02"), status: "ok", detail: "No incidents" },
  { label: new Date("2026-08-03"), status: "degraded", detail: "Elevated error rate on /v2/search for 22 min" },
  // … one block per day
];

<ChartCard
  title="api.example.com"
  aside={<span className="text-sm font-semibold tabular-nums">99.94% uptime</span>}
  table={<TrackerTable data={data} caption="Daily status" />}
>
  <TrackerChart data={data} startLabel="90 days ago" endLabel="Today" aria-label="API uptime, last 90 days" />
</ChartCard>`,children:(0,_.jsx)(a,{className:`w-full`,title:`api.example.com`,description:`All regions`,aside:(0,_.jsxs)(`span`,{className:`text-sm font-semibold tabular-nums`,children:[`99.94% `,(0,_.jsx)(`span`,{className:`font-normal text-sheen-fg-muted`,children:`uptime`})]}),table:(0,_.jsx)(r,{data:y,caption:`Daily status of api.example.com`}),children:(0,_.jsx)(i,{data:y,startLabel:`90 days ago`,endLabel:`Today`,"aria-label":`API uptime, last 90 days`})})}),(0,_.jsx)(d,{title:`A status page`,description:`One compact tracker per service, without legends, in a single glass card.`,variant:`bare`,code:`
import { TrackerChart, type TrackerBlock } from "@sheenui/theme";

type Service = { name: string; uptime: string; data: TrackerBlock[] };

// One block per day (shortened here); status keys: "ok", "degraded", "down"
const services: Service[] = [
  {
    name: "API",
    uptime: "99.98%",
    data: [
      { label: new Date("2026-08-02"), status: "ok", detail: "No incidents" },
      { label: new Date("2026-08-03"), status: "degraded", detail: "Elevated error rate for 22 min" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
  {
    name: "Dashboard",
    uptime: "100%",
    data: [
      { label: new Date("2026-08-02"), status: "ok" },
      { label: new Date("2026-08-03"), status: "ok" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
  {
    name: "Webhooks",
    uptime: "99.71%",
    data: [
      { label: new Date("2026-08-02"), status: "ok" },
      { label: new Date("2026-08-03"), status: "down", detail: "Delivery outage, 41 min" },
      { label: new Date("2026-08-04"), status: "ok" },
    ],
  },
];

export function Example() {
  return (
    <div className="flex flex-col gap-5">
      {services.map((s) => (
        <div key={s.name}>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{s.name}</span>
            <span className="text-sheen-fg-muted tabular-nums">{s.uptime}</span>
          </div>
          <TrackerChart
            data={s.data}
            height={28}
            showLegend={false}
            startLabel="30 days ago"
            endLabel="Today"
            aria-label={s.name + " uptime, last 30 days"}
          />
        </div>
      ))}
    </div>
  );
}`,children:(0,_.jsx)(n,{sheen:!1,className:`flex w-full flex-col gap-5 p-5`,children:b.map(e=>(0,_.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,_.jsxs)(`div`,{className:`flex items-baseline justify-between gap-3 text-sm`,children:[(0,_.jsx)(`span`,{className:`font-medium`,children:e.name}),(0,_.jsx)(`span`,{className:`text-sheen-fg-muted tabular-nums`,children:e.uptime})]}),(0,_.jsx)(i,{data:e.data,height:28,showLegend:!1,startLabel:`30 days ago`,endLabel:`Today`,"aria-label":`${e.name} uptime, last 30 days`})]},e.name))})}),(0,_.jsx)(d,{title:`Custom statuses: CI builds`,description:`Any set of statuses, each with a palette slot or a status tone, an icon, and stripes or a caret as a second cue.`,variant:`bare`,code:`
import { TrackerChart, type TrackerBlock, type TrackerStatus } from "@sheenui/theme";

// Any 14px SVG works as a status icon; these are stand-ins.
const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CheckIcon = () => icon("M3 8.5l3.2 3.2L13 4.8");
const CrossIcon = () => icon("M4 4l8 8M12 4l-8 8");
const RetryIcon = () => icon("M13 8a5 5 0 1 1-1.6-3.7M13 3v3h-3");
const DashIcon = () => icon("M4 8h8");

const statuses: Record<string, TrackerStatus> = {
  passed: { label: "Passed", tone: 7, icon: <CheckIcon /> },
  failed: { label: "Failed", tone: 8, flag: true, icon: <CrossIcon /> },
  flaky: { label: "Passed on retry", tone: 4, striped: true, icon: <RetryIcon /> },
  none: { label: "Cancelled", tone: "neutral", icon: <DashIcon /> },
};

// One block per build (shortened here)
const builds: TrackerBlock[] = [
  { label: "#1203", status: "passed" },
  { label: "#1204", status: "passed" },
  { label: "#1205", status: "flaky", detail: "Passed on the second attempt" },
  { label: "#1206", status: "failed", detail: "3 tests failed" },
  { label: "#1207", status: "none", detail: "Cancelled by a newer push" },
  { label: "#1208", status: "passed" },
];

export function Example() {
  return <TrackerChart data={builds} statuses={statuses} startLabel="#1203" endLabel="#1208" aria-label="Last builds on main" />;
}`,children:(0,_.jsx)(a,{className:`w-full`,title:`main · last 48 builds`,table:(0,_.jsx)(r,{data:S,statuses:x,caption:`Builds on main`,labels:{period:`Build`}}),children:(0,_.jsx)(i,{data:S,statuses:x,startLabel:`#1203`,endLabel:`#1250`,"aria-label":`Last 48 builds on main`})})}),(0,_.jsx)(l,{of:h}),(0,_.jsx)(l,{as:`h2`,title:`TrackerTable props`,of:g}),(0,_.jsx)(c,{rows:[[`Tab`,`Focus the strip (one tab stop).`],[`→ / ↓`,`Next block (← in right-to-left layouts); a scrolling strip follows it.`],[`← / ↑`,`Previous block.`],[`Home / End`,`Oldest / newest block.`],[`Escape`,`Stop reading.`]]}),(0,_.jsxs)(o,{children:[(0,_.jsx)(`li`,{children:`The strip is one focusable figure; its description counts each status (“Operational: 82, Degraded: 4…”), so the summary needs no hovering.`}),(0,_.jsx)(`li`,{children:`Each block read by keyboard is announced once: period, status and detail.`}),(0,_.jsx)(`li`,{children:`Color is never the only cue: every status has an icon and a name, degraded blocks are striped and outages carry a caret.`}),(0,_.jsx)(`li`,{children:`Strips too long for the width scroll inside their own container, opened at the latest end, instead of squeezing blocks below 3px.`}),(0,_.jsx)(`li`,{children:`Forced colors give every block a CanvasText border; reduced motion draws the strip in place.`})]})]})}export{C as default};