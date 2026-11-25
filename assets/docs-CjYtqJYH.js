import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{n as r,t as i}from"./line-chart-5QLFpluA.js";import{t as a}from"./bar-chart-BnRpITIe.js";import{t as o}from"./chart-card-LroRwhnq.js";import{i as s}from"./chart-figure-BAmJknKz.js";import{t as c}from"./donut-chart-ChRGpCr_.js";import{t as l}from"./glass-card-OGQy5mxG.js";import{t as u}from"./radial-progress-DzpolCx9.js";import{t as d}from"./sparkline-6d6F0Cl1.js";import{C as f,Y as p}from"./chart-utils-DvmgVWft.js";import{o as m}from"./legend-tooltip-B7LDwC_I.js";import{t as h}from"./chart-sync-B_0PT-QT.js";import{i as g,o as _}from"./Page-DQ8sr8qt.js";import{t as v}from"./Example-DMEbQwm9.js";import{t as y}from"./lazy-block-BfzH_8EP.js";import{t as b}from"./Segmented-kx7yHseo.js";import{C as x,E as S,_ as C,a as w,b as T,c as E,d as D,g as O,i as k,l as A,s as j,t as M,v as N,w as P,x as F,y as I}from"./shared-data-BeNh4dSz.js";import{t as L}from"./button-8i4LQrEk.js";import{i as R,n as z,r as B}from"./featured-De_0O_HY.js";import{t as V}from"./preload-helper-BrmCrVM7.js";var H=e(t(),1),U=n(),W=Array.from({length:120},(e,t)=>({day:M[t]?.day??``,visits:Math.round(1800+t*9+Math.sin(t/5)*260+A(t,21)*220)})),G=[{key:`visits`,label:`Visits`,color:7}],K=[{type:`band`,from:6e4,to:75e3,label:`Forecast range`},{type:`line`,value:8e4,label:`Goal $80K`,tone:`accent`},{type:`range`,from:`Jan`,to:`Feb`,label:`Holiday freeze`},{type:`event`,at:`Jun`,label:`Pricing change`,tone:`warning`}],q={chart:`Diagramm`,table:`Tabelle`,viewAs:e=>`${e}: Ansicht`,noData:`Keine Daten`,previous:e=>`${e} (Vorperiode)`,options:e=>`${e}: herunterladen`,downloadPng:`Als PNG herunterladen`,downloadSvg:`Als SVG herunterladen`,downloadCsv:`Als CSV herunterladen`,pngHint:`Bild, doppelte Auflösung`,svgHint:`Vektor, für Folien`,csvHint:`Die Daten, für Tabellen`,downloaded:e=>`${e} heruntergeladen`,exportFailed:`Download fehlgeschlagen`,legend:`Reihen: zum Ein- und Ausblenden drücken`,shown:e=>`${e} eingeblendet`,hidden:e=>`${e} ausgeblendet`},J=D.map((e,t)=>({month:e,umsatz:(T[t]?.organic??0)*.92,vorjahr:(T[t]?.organicPrev??0)*.92})),Y=[{key:`umsatz`,label:`Umsatz`,color:1,compareKey:`vorjahr`}],X=new Intl.NumberFormat(`de`,{style:`currency`,currency:`EUR`,notation:`compact`,maximumFractionDigits:1});function Z(){let e=(0,H.useRef)(null),t=p(z.slice(-16),{next:(e,t)=>({t:B(t+100),v:Math.round(Math.max(500,(e[e.length-1]?.v??800)+(A(t,31)-.5)*140))}),interval:1500,max:16,ref:e});return(0,U.jsx)(o,{className:`w-full`,title:`Requests per second`,aside:(0,U.jsx)(L,{variant:`ghost`,size:`sm`,"aria-pressed":t.paused,onClick:()=>t.setPaused(!t.paused),children:t.paused?`Resume`:`Pause`}),children:(0,U.jsx)(`div`,{ref:e,children:(0,U.jsx)(r,{live:!0,data:t.data,index:`t`,series:R,height:200,zero:!1,endLabels:!1,"aria-label":`Requests per second, live`})})})}function Q({id:e,title:t,children:n}){return(0,U.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,U.jsx)(`h2`,{id:e,className:`text-2xl font-semibold tracking-tight`,children:t}),n&&(0,U.jsx)(`p`,{className:`max-w-3xl text-sm text-pretty text-sheen-fg-muted`,children:n})]})}function $({id:e,children:t}){return(0,U.jsx)(`div`,{id:e,tabIndex:-1,className:`flex scroll-mt-28 flex-col gap-6 rounded-sheen-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheen-focus`,children:t})}var ee=y(()=>V(()=>import(`./api-tables-CZ5bP-db.js`).then(e=>e.default),[]),{minHeight:`12rem`});function te(){return(0,U.jsxs)(`details`,{className:`charts-api-details glass-1 rounded-sheen-lg`,children:[(0,U.jsx)(`summary`,{className:`charts-api-details__summary`,children:`Show the prop tables for every chart, card and helper`}),(0,U.jsx)(ee,{})]})}function ne(){let[e,t]=(0,H.useState)(`12`),n=t=>t.slice(-Number(e)),p=[...m(F,`line`),N],y=[...m(E,`rect`),{...N,label:`Signups, previous period`}];return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsxs)(`section`,{"aria-labelledby":`core-charts`,className:`flex flex-col gap-12`,children:[(0,U.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,U.jsx)(Q,{id:`core-charts`,title:`Line, area, bar and donut`,children:`The everyday charts, documented here. Smooth curves, gradient fills, draw-in and grow-from-baseline entrances, previous-period comparison, clickable legends, annotations, a brush, synced crosshairs and PNG / SVG / CSV export. As a shadcn charts alternative, each chart has a table view.`}),(0,U.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,U.jsx)(`span`,{"aria-hidden":!0,className:`text-sm text-sheen-fg-muted`,children:`Showing the last`}),(0,U.jsx)(b,{label:`Time range for the charts below`,options:I,value:e,onValueChange:t})]})]}),(0,U.jsx)($,{id:`chart-line`,children:(0,U.jsx)(v,{title:`Line chart`,replayable:!0,description:`Click a legend key to hide a series (the axis re-fits); hover one to dim the others. The dashed line is the previous period. Download it from the card's menu.`,variant:`bare`,code:`
import { ChartCard, ChartTable, LineChart, PREVIOUS_SERIES_KEY, formatCompact, seriesLegend, type CompareSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{className:`w-full`,title:`Monthly revenue by channel`,description:`In US dollars, with last year dashed`,legend:p,exportable:!0,table:(0,U.jsx)(s,{data:n(T),index:`month`,indexLabel:`Month`,series:F,format:P}),children:(0,U.jsx)(r,{data:n(T),index:`month`,series:F,format:P,"aria-label":`Monthly revenue by channel`})})})}),(0,U.jsx)($,{id:`chart-area`,children:(0,U.jsx)(v,{title:`Area chart with a brush`,replayable:!0,description:`A gradient wash that fades to transparent. The brush under a long series zooms it: drag the window, drag its edges, or use the arrow keys on them.`,variant:`bare`,code:`
import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{className:`w-full`,title:`Visits`,description:`Daily, last 120 days`,aside:(0,U.jsx)(`span`,{className:`text-2xl font-semibold tracking-tight`,children:f(S[S.length-1]?.users??0)}),table:(0,U.jsx)(s,{data:W,index:`day`,indexLabel:`Day`,series:G}),children:(0,U.jsx)(i,{data:W,index:`day`,series:G,brush:{defaultRange:[90,119],minSpan:7},"aria-label":`Daily visits`})})})}),(0,U.jsxs)($,{id:`chart-bar`,children:[(0,U.jsxs)(`div`,{className:`grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2`,children:[(0,U.jsx)(v,{title:`Bar chart`,description:`Bars grow from the baseline. The dashed tick on each Signups bar is last year's value.`,variant:`bare`,code:`
import { BarChart, type CompareSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{title:`Signups vs activations`,legend:y,table:(0,U.jsx)(s,{data:n(j),index:`month`,indexLabel:`Month`,series:E}),children:(0,U.jsx)(a,{data:n(j),index:`month`,series:E,"aria-label":`Signups and activations per month`})})}),(0,U.jsx)(v,{title:`Stacked bars`,lazyPreview:!0,variant:`bare`,code:`
import { BarChart, type ChartSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{title:`Customers by plan`,legend:m(O,`rect`),table:(0,U.jsx)(s,{data:n(C),index:`month`,indexLabel:`Month`,series:O}),children:(0,U.jsx)(a,{stacked:!0,data:n(C),index:`month`,series:O,"aria-label":`Customers per plan, stacked`})})})]}),(0,U.jsx)(v,{title:`Horizontal bars`,lazyPreview:!0,description:`Best for long category names. Values sit at the tip of each bar.`,variant:`bare`,code:`
import { BarChart } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{className:`w-full`,title:`Top countries`,description:`Visitors this month`,table:(0,U.jsx)(s,{data:k,index:`country`,indexLabel:`Country`,series:w}),children:(0,U.jsx)(a,{layout:`horizontal`,showValues:!0,data:k,index:`country`,series:w,"aria-label":`Visitors by country`})})})]}),(0,U.jsx)($,{id:`chart-donut`,children:(0,U.jsx)(v,{title:`Donut chart`,lazyPreview:!0,description:`Part-to-whole at a glance, at most 6 slices. Hover a slice to read it in the center; click a legend key to leave a slice out (the ring re-flows and the total re-counts).`,variant:`bare`,code:`
import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{title:`Traffic sources`,description:`Sessions this month`,table:(0,U.jsx)(s,{data:x.map(e=>({source:e.label,sessions:e.value})),index:`source`,indexLabel:`Source`,series:[{key:`sessions`,label:`Sessions`,color:1}]}),children:(0,U.jsx)(c,{data:x,labels:{center:`Sessions`},"aria-label":`Sessions by traffic source`})})})}),(0,U.jsx)($,{id:`chart-radial-progress`,children:(0,U.jsxs)(v,{title:`Radial progress & gauge`,lazyPreview:!0,description:`A single ratio against a limit; the number rolls with the arc. With coloring="severity" the color turns warning and critical, always with a status word too.`,stageClassName:`gap-10`,code:`
import { RadialProgress } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <RadialProgress value={64} label="Quarterly goal" />
      <RadialProgress variant="gauge" coloring="severity" value={82} label="Storage used" />
      <RadialProgress variant="gauge" coloring="severity" value={96} label="CPU" />
    </>
  );
}`,children:[(0,U.jsx)(u,{value:64,label:`Quarterly goal`}),(0,U.jsx)(u,{variant:`gauge`,coloring:`severity`,value:82,label:`Storage used`}),(0,U.jsx)(u,{variant:`gauge`,coloring:`severity`,value:96,label:`CPU`})]})}),(0,U.jsx)($,{id:`chart-sparkline`,children:(0,U.jsx)(v,{title:`Sparklines in stat tiles`,lazyPreview:!0,description:`A small trend under a headline number; it draws in when the tile scrolls into view and the latest point gets a dot.`,stageClassName:`grid grid-cols-1 gap-4 sm:grid-cols-3`,code:`
import { GlassCard, Sparkline } from "@sheenui/theme";

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
          <Sparkline values={values} aria-label={\`\${label} trend, \${direction}\`} />
        </GlassCard>
      ))}
    </>
  );
}`,children:[[`Revenue`,`$12.4K`,[12,18,15,22,28,26,34],`rising`],[`Sessions`,`86.4K`,[40,44,39,47,52,50,58],`rising`],[`Bounce rate`,`38%`,[48,46,47,43,41,40,38],`falling`]].map(([e,t,n,r])=>(0,U.jsxs)(l,{className:`flex flex-col gap-2 p-5`,children:[(0,U.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:e}),(0,U.jsx)(`p`,{className:`text-3xl font-semibold tracking-tight`,children:t}),(0,U.jsx)(d,{values:n,"aria-label":`${e} trend, ${r}`})]},e))})})]}),(0,U.jsxs)(`section`,{"aria-labelledby":`chart-features`,className:`flex flex-col gap-12`,children:[(0,U.jsx)(Q,{id:`chart-features`,title:`Chart-wide features`,children:`The same building blocks power every chart above and the dashboards: synced crosshairs, annotations, export, live data and i18n.`}),(0,U.jsx)(v,{title:`Synced crosshairs`,lazyPreview:!0,description:`Charts inside one ChartSyncProvider share the point being read, matched by x value: hover the line and the bars follow (and the other way round).`,variant:`bare`,code:`
import { ChartSyncProvider, LineChart, BarChart, type ChartSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(h,{children:(0,U.jsxs)(`div`,{className:`grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2`,children:[(0,U.jsx)(o,{title:`Revenue`,legend:p,children:(0,U.jsx)(r,{data:n(T),index:`month`,series:F,format:P,height:220,"aria-label":`Monthly revenue by channel`})}),(0,U.jsx)(o,{title:`Signups`,legend:m(E,`rect`),children:(0,U.jsx)(a,{data:n(j),index:`month`,series:E,height:220,"aria-label":`Signups and activations per month`})})]})})}),(0,U.jsx)(v,{title:`Annotations`,lazyPreview:!0,description:`Reference lines and bands on the value axis, event markers and ranges on the x axis. Labels sit on a surface plate, in text colors; events are also read out with their data point.`,variant:`bare`,code:`
import { LineChart } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(o,{className:`w-full`,title:`Organic revenue`,description:`With goal, forecast range and events`,children:(0,U.jsx)(i,{data:T,index:`month`,series:F.slice(0,1),format:P,annotations:K,"aria-label":`Organic revenue with goal and events`})})}),(0,U.jsx)(v,{title:`Export, locale and labels`,lazyPreview:!0,description:`exportable adds a download menu: PNG and SVG keep the exact colors of the current theme, CSV has the raw numbers. Every string is a label, and numbers follow the locale (German here).`,variant:`bare`,code:`
import { ChartCard, ChartTable, AreaChart, type ChartSeries } from "@sheenui/theme";

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
}`,children:(0,U.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,U.jsx)(o,{className:`w-full`,title:`Umsatz`,description:`Monatlich, in Euro, mit Vorperiode`,labels:q,exportable:!0,legend:[...m(Y,`line`),{...N,label:`Vorperiode`}],table:(0,U.jsx)(s,{data:J,index:`month`,indexLabel:`Monat`,series:Y,format:e=>X.format(e)}),children:(0,U.jsx)(i,{data:J,index:`month`,series:Y,locale:`de`,format:e=>X.format(e),labels:{previous:q.previous,instructions:`Mit den Pfeiltasten links und rechts die Werte lesen.`},"aria-label":`Umsatz pro Monat`})})})}),(0,U.jsx)(v,{title:`Live data`,lazyPreview:!0,description:`useLiveData appends a row on an interval into a sliding window and pauses off-screen, in hidden tabs and on Pause. With live, new points slide in from the right instead of morphing.`,variant:`bare`,code:`
import { Button, LineChart, useLiveData, type ChartRow, type ChartSeries } from "@sheenui/theme";
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
}`,children:(0,U.jsx)(Z,{})})]}),(0,U.jsxs)(`section`,{"aria-labelledby":`charts-api`,className:`flex flex-col gap-8`,children:[(0,U.jsx)(Q,{id:`charts-api`,title:`API`,children:`Series take a color slot from 1 to 8 (the validated palette, assigned in order when omitted, never re-ranked when a series is hidden). Every chart needs an aria-label; pair it with a ChartTable so every value can be read without color.`}),(0,U.jsx)(te,{}),(0,U.jsx)(_,{as:`h3`,rows:[[`Tab`,`Move through the card's tabs and menu, then the legend keys, then the chart and its brush handles.`],[`← → (↑ ↓)`,`Read the previous / next point (the crosshair moves and the values are announced).`],[`Home / End`,`First / last point.`],[`Escape`,`Clear the active point.`],[`Enter / Space on a legend key`,`Hide or show that series (announced).`],[`← → on a brush handle`,`Move that edge one step; Page Up / Page Down move ten percent; Home / End go to the ends.`],[`Shift + ← → on a brush handle`,`Pan the whole window.`],[`← → on Chart / Table`,`Switch between the chart and its table.`]]}),(0,U.jsx)(g,{as:`h3`,notes:["Every interactive chart is a focusable figure named by its title and described by the reading instructions (the same key on every chart, `labels.instructions`, a string or a function); inside a ChartCard with a table, `aria-details` points at the table view. The active values are announced once, politely.",`Every chart has a table view (Chart / Table tabs), so no value depends on color or on seeing the marks.`,`Legend keys are toggle buttons (pressed = shown); hiding or showing a series is announced.`,`Event markers are read out with the data point they sit on; status colors always come with a word or an icon.`,`Reduced motion: charts appear at their final values, data changes jump, and live charts stop sliding.`,`Windows High Contrast: legend keys gain outlines, the active tab and brush window use system colors.`]})]})]})}export{ne as ChartsDocs};