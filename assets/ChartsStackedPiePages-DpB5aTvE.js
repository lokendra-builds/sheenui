import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{o as r}from"./legend-tooltip-B7LDwC_I.js";import{n as i,t as a}from"./stacked-area-chart-DaKlRrtK.js";import{t as o}from"./ExampleChartCard-DOQs1ydL.js";import{i as s,n as c,o as l,r as u}from"./Page-BAL5Idhy.js";import{t as d}from"./Example-BPfHvEYD.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./Segmented-kx7yHseo.js";import{r as m}from"./stage-C6L2FhMX.js";import{n as h,r as g,t as _}from"./shared-C_d162MH.js";import{t as v}from"./preload-helper-BrmCrVM7.js";var y=[[`data`,`readonly ChartRow[]`,``,"One object per point: the `index` key plus one number per series key.",!0],[`index`,`string`,``,`Key of the x value in each row (e.g. "month").`,!0],[`series`,`readonly ChartSeries[]`,``,"Bands from the bottom of the stack up. Give each a fixed `color` slot so filtering never repaints it.",!0],[`mode`,`"stacked" | "percent"`,`"stacked"`,`"stacked": bands add up to the total. "percent": every x position is scaled to 100%, so the bands show each series' share. A point whose values add up to 0 has no shares: the bands break around it (a gap, marked with a dashed "no data" column) instead of dipping to 0%.`,!1],[`curve`,`"linear" | "monotone"`,`"linear"`,`"linear" joins points with straight lines; "monotone" with smooth curves that never overshoot a value.`,!1],[`height`,`number`,`260`,`Height of the chart in px; the width follows the container.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats values in the tooltip (and the axis in "stacked" mode). Negative values count as 0.`,!1],[`formatPercent`,`((n: number) => string)`,`formatPercentDefault`,`Formats shares (0–100) in "percent" mode.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when series.length > 3`,`Tell series apart without colour (hatch fills, dash styles, marker shapes).`,!1],[`labels`,`Partial<StackedAreaChartLabels>`,`defaultStackedAreaChartLabels`,'Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultStackedAreaChartLabels`. All 4 keys of `StackedAreaChartLabels` are listed in the key table under the props table.',!1,{type:`StackedAreaChartLabels`,const:`defaultStackedAreaChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`],[`instructions`,`Use left and right arrow keys to read values.`],[`touchHint`,`Tap or drag across the chart to read values.`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],b=[[`data`,`readonly ChartRow[]`,``,`Takes the same rows as the chart.`,!0],[`index`,`string`,``,`Key of each row that names its position on the axis.`,!0],[`series`,`readonly ChartSeries[]`,``,`Takes the same series as the chart.`,!0],[`mode`,`"stacked" | "percent"`,`"stacked"`,`Match the chart: "percent" shows each share beside the value it comes from.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats a value for the data table cells: takes the number, returns the text shown.`,!1],[`formatPercent`,`((n: number) => string)`,`formatPercentDefault`,`Formats shares in percent mode.`,!1],[`indexLabel`,`string`,`index`,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Visually hidden caption naming the table (also names its scroll region).`,!1],[`labels`,`Partial<Pick<StackedAreaChartLabels, "total" | "noData">>`,`defaultStackedAreaChartLabels`,'Override the "Total" column header and the empty text. Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultStackedAreaChartLabels`. All 2 keys of `StackedAreaChartLabels` are listed in the key table under the props table.',!1,{type:`StackedAreaChartLabels`,const:`defaultStackedAreaChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],x=e(t()),S=n();function C(e){let t=g(e);return h.map((e,n)=>({month:e,organic:Math.round(38e3+n*2600+Math.sin(n*1.1)*3800+t()*2400),paid:Math.round(21e3+n*1500+Math.cos(n*.8)*3e3+t()*2e3),referral:Math.round(9e3+n*700+Math.sin(n*.6+1)*1600+t()*1200),social:Math.round(6e3+n*900+Math.cos(n*1.3)*1400+t()*1e3)}))}var w=[{key:`organic`,label:`Organic`,color:1},{key:`paid`,label:`Paid`,color:2},{key:`referral`,label:`Referral`,color:3},{key:`social`,label:`Social`,color:4}],T=[`Q1 ’24`,`Q2 ’24`,`Q3 ’24`,`Q4 ’24`,`Q1 ’25`,`Q2 ’25`,`Q3 ’25`,`Q4 ’25`].map((e,t)=>({quarter:e,desktop:Math.round(52e3-t*3100+Math.sin(t)*1200),mobile:Math.round(31e3+t*3900+Math.cos(t*.7)*1500),tablet:Math.round(7e3-t*260+Math.sin(t*1.4)*400)})),E=[{key:`desktop`,label:`Desktop`,color:1},{key:`mobile`,label:`Mobile`,color:2},{key:`tablet`,label:`Tablet`,color:3}],D=T.find(e=>e.mobile>e.desktop)?.quarter,O=[{month:`May`,free:420,pro:160,team:40},{month:`Jun`,free:460,pro:190,team:55},{month:`Jul`,free:0,pro:0,team:0},{month:`Aug`,free:510,pro:230,team:70},{month:`Sep`,free:540,pro:260,team:95},{month:`Oct`,free:560,pro:300,team:120}],k=[{key:`free`,label:`Free`,color:1},{key:`pro`,label:`Pro`,color:2},{key:`team`,label:`Team`,color:3}],A=[{month:`Oct`,organic:41e3,paid:23e3}];function j(){let[e,t]=(0,x.useState)(1),[n,f]=(0,x.useState)(`stacked`),[h,g]=(0,x.useState)(`linear`),[v,j]=(0,x.useState)(`12`),M=C(e).slice(-Number(v));return(0,S.jsxs)(c,{eyebrow:`Chart`,title:`Stacked area chart`,description:`How a total builds up from its parts over time, or (in percent mode) how the mix shifts. Bands are separated by a real 2px gap, the crosshair lists every series plus the total, and bands rise from the baseline on entry and morph when the data changes.`,source:[`theme/src/components/charts/stacked-area-chart.tsx`,`theme/src/components/charts/percent-bar-chart.tsx`],children:[(0,S.jsx)(m,{}),(0,S.jsx)(d,{title:`Stacked and 100% stacked`,description:`Switch the mode, the curve and the range: the bands morph between them. Hover, tap, or focus the chart and use the arrow keys.`,variant:`bare`,controls:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(p,{label:`Mode`,size:`sm`,options:[{value:`stacked`,label:`Stacked`},{value:`percent`,label:`100%`}],value:n,onValueChange:f}),(0,S.jsx)(p,{label:`Curve`,size:`sm`,options:[{value:`linear`,label:`Linear`},{value:`monotone`,label:`Monotone`}],value:h,onValueChange:g}),(0,S.jsx)(p,{label:`Range`,size:`sm`,options:[{value:`6`,label:`6 months`},{value:`12`,label:`12 months`}],value:v,onValueChange:j}),(0,S.jsx)(_,{onClick:()=>t(e=>e+1)})]}),code:`
import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jun", organic: 41000, paid: 23000, referral: 9800, social: 6400 },
  { month: "Jul", organic: 44200, paid: 24100, referral: 10300, social: 7100 },
  { month: "Aug", organic: 46900, paid: 26800, referral: 11200, social: 7600 },
  { month: "Sep", organic: 49100, paid: 27500, referral: 11900, social: 8800 },
  { month: "Oct", organic: 52300, paid: 29400, referral: 12600, social: 9300 },
];
const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
  { key: "social", label: "Social", color: 4 },
];

export function Example() {
  return (
    <ChartCard
      title="Sessions by channel"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable data={data} index="month" series={series} mode="stacked" />}
    >
      <StackedAreaChart
        data={data}
        index="month"
        mode="stacked" // or "percent"
        curve="linear" // or "monotone"
        series={series}
        aria-label="Monthly sessions by channel, stacked"
      />
    </ChartCard>
  );
}`,children:(0,S.jsx)(o,{className:`w-full`,title:`Sessions by channel`,description:n===`percent`?`Share of monthly sessions`:`Monthly sessions`,legend:r(w,`rect`),table:(0,S.jsx)(i,{data:M,index:`month`,indexLabel:`Month`,series:w,mode:n,caption:n===`percent`?`Share of monthly sessions by channel`:`Monthly sessions by channel`}),children:(0,S.jsx)(a,{data:M,index:`month`,series:w,mode:n,curve:h,"aria-label":n===`percent`?`Share of monthly sessions by channel`:`Monthly sessions by channel, stacked`})})}),(0,S.jsx)(d,{title:`Share of a whole`,description:`mode="percent" scales every quarter to 100%. The tooltip leads with the share and keeps the raw value beside it; the table view shows both.`,variant:`bare`,code:`
import { ChartCard, seriesLegend, StackedAreaTable, StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { quarter: "Q1 ’25", desktop: 41000, mobile: 39000, tablet: 5800 },
  { quarter: "Q2 ’25", desktop: 38500, mobile: 43500, tablet: 5500 },
  { quarter: "Q3 ’25", desktop: 36200, mobile: 47800, tablet: 5300 },
  { quarter: "Q4 ’25", desktop: 33800, mobile: 52400, tablet: 5000 },
];
const series: ChartSeries[] = [
  { key: "desktop", label: "Desktop", color: 1 },
  { key: "mobile", label: "Mobile", color: 2 },
  { key: "tablet", label: "Tablet", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Sessions by device"
      legend={seriesLegend(series, "rect")}
      table={<StackedAreaTable mode="percent" data={data} index="quarter" series={series} />}
    >
      <StackedAreaChart mode="percent" curve="monotone" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />
    </ChartCard>
  );
}`,children:(0,S.jsx)(o,{className:`w-full`,title:`Sessions by device`,description:D?`Mobile overtook desktop in ${D}`:`Share of sessions per quarter`,legend:r(E,`rect`),table:(0,S.jsx)(i,{mode:`percent`,data:T,index:`quarter`,indexLabel:`Quarter`,series:E,caption:`Share of sessions by device, per quarter (area chart)`}),children:(0,S.jsx)(a,{mode:`percent`,curve:`monotone`,data:T,index:`quarter`,series:E,height:240,"aria-label":`Share of sessions by device, per quarter`})})}),(0,S.jsxs)(d,{title:`Edge cases`,description:`One data point draws a flat band across the plot; a month with no values breaks a 100% chart around a dashed “no data” column instead of dipping to 0%; no data keeps the chart's footprint.`,variant:`bare`,stageClassName:`grid gap-6 lg:grid-cols-2`,code:`
import { StackedAreaChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const plans: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];
const signups = [
  { month: "May", free: 420, pro: 160, team: 40 },
  { month: "Jun", free: 460, pro: 190, team: 55 },
  { month: "Jul", free: 0, pro: 0, team: 0 },
  { month: "Aug", free: 510, pro: 230, team: 70 },
];

export function Example() {
  return (
    <>
      <StackedAreaChart data={[{ month: "Oct", organic: 41000, paid: 23000 }]} index="month" series={series} aria-label="Sessions in October" />
      <StackedAreaChart mode="percent" data={signups} index="month" series={plans} aria-label="Share of signups by plan" /> {/* July adds up to 0: a gap */}
      <StackedAreaChart data={[]} index="month" series={series} emptyState="No sessions yet" aria-label="Sessions" />
    </>
  );
}`,children:[(0,S.jsx)(o,{title:`One month`,legend:r(w.slice(0,2),`rect`),table:(0,S.jsx)(i,{data:A,index:`month`,indexLabel:`Month`,series:w.slice(0,2),caption:`Sessions in October by channel`}),children:(0,S.jsx)(a,{data:A,index:`month`,series:w.slice(0,2),height:200,"aria-label":`Sessions in October by channel`})}),(0,S.jsx)(o,{title:`A month with no signups`,legend:r(k,`rect`),table:(0,S.jsx)(i,{mode:`percent`,data:O,index:`month`,indexLabel:`Month`,series:k,caption:`Share of monthly signups by plan`}),children:(0,S.jsx)(a,{mode:`percent`,data:O,index:`month`,series:k,height:200,"aria-label":`Share of monthly signups by plan; July had none`})}),(0,S.jsx)(o,{className:`lg:col-span-2`,title:`No data`,table:(0,S.jsx)(i,{data:[],index:`month`,indexLabel:`Month`,series:w,caption:`Sessions by channel (no data)`}),children:(0,S.jsx)(a,{data:[],index:`month`,series:w,height:200,emptyState:`No sessions yet`,"aria-label":`Sessions by channel`})})]}),(0,S.jsx)(u,{title:`StackedAreaChart props`,of:y}),(0,S.jsx)(u,{as:`h2`,title:`StackedAreaTable props`,of:b}),(0,S.jsx)(l,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`← / →`,`Previous / next point.`],[`Home / End`,`Jump to the first / last point.`],[`Escape`,`Clear the reading.`],[`Enter / Space on a legend key`,`Hide or show that series (inside a ChartCard).`]]}),(0,S.jsx)(s,{notes:[`The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every series' value and the total.`,`StackedAreaTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.`,`Reduced motion: the stacked areas appear at their final values and data changes jump instead of morphing.`]})]})}f(()=>v(()=>import(`./ChartPatternsDemos-D5RUOnG1.js`).then(e=>e.PiePatternsDemo),[]),{minHeight:`22rem`});export{j as default};