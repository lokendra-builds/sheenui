import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{n as r,r as i,t as a}from"./combo-chart-HYtmzhhz.js";import{t as o}from"./ExampleChartCard-ZE1sKvmi.js";import{t as s}from"./ShowcaseStage.chart.scene-BbwlviML.js";import{i as c,n as l,o as u,r as d}from"./Page-BRuP8nt1.js";import{t as f}from"./Example-DaSezASZ.js";import{n as p,r as m,t as h}from"./shared-C8b7HlDv.js";var g=[[`data`,`readonly ChartRow[]`,``,"One object per category: the `index` key plus one number per series key.",!0],[`index`,`string`,``,`Key of the category in each row (e.g. "month").`,!0],[`series`,`readonly ComboSeries[]`,``,"Bars and lines on ONE y-axis: they must share a unit (e.g. orders per day and their 7-day average). For measures with different units, set `indexed` instead of reaching for a second axis.",!0],[`stacked`,`boolean`,`false`,"Stack the bar series instead of grouping them side by side. Ignored when `indexed` (index values don't add up).",!1],[`indexed`,`boolean`,`false`,'Re-base every series to the same starting point (its first non-zero value = `indexBase`), so measures of different units share one honest axis: "how has each changed?". A series that starts negative is rebased on its absolute value, so up still means up.',!1],[`indexBase`,`number`,`100`,"The value every series starts from when `indexed`.",!1],[`height`,`number`,`280`,`Height of the chart in px; the width follows the container.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,"Formats raw values (tooltip; the axis too unless `indexed`).",!1],[`formatIndex`,`((n: number) => string)`,`defaultFormatIndex`,"Formats indexed values (axis and tooltip) when `indexed`.",!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when there are more than 3 bar series`,`Tell the bar series apart without colour (hatch fills; the first bar series stays solid).`,!1],[`labels`,`Partial<ComboChartLabels>`,`defaultComboChartLabels`,'Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultComboChartLabels`. All 5 keys of `ComboChartLabels` are listed in the key table under the props table.',!1,{type:`ComboChartLabels`,const:`defaultComboChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`],[`instructions`,`Use left and right arrow keys to read values.`],[`touchHint`,`Tap a column to read its values.`],[`indexedFrom`,`actual`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],_=[[`data`,`readonly ChartRow[]`,``,`Takes the same rows as the chart.`,!0],[`index`,`string`,``,`Key of each row that names its category.`,!0],[`series`,`readonly ComboSeries[]`,``,`The same series as the chart (bars and lines).`,!0],[`stacked`,`boolean`,`false`,`Match the chart: adds a Total column (the sum of the bar series).`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats the actual values (an indexed chart's table shows the real data, not the index).`,!1],[`indexLabel`,`string`,`index`,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Visually hidden caption naming the table (also names its scroll region).`,!1],[`labels`,`Partial<Pick<ComboChartLabels, "total" | "noData">>`,`defaultComboChartLabels`,'Override the "Total" column header and the empty text. Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultComboChartLabels`. All 2 keys of `ComboChartLabels` are listed in the key table under the props table.',!1,{type:`ComboChartLabels`,const:`defaultComboChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],v=e(t()),y=n(),b=[`Oct 1`,`Oct 2`,`Oct 3`,`Oct 4`,`Oct 5`,`Oct 6`,`Oct 7`,`Oct 8`,`Oct 9`,`Oct 10`,`Oct 11`,`Oct 12`,`Oct 13`,`Oct 14`];function x(e){let t=m(e),n=b.map((e,n)=>Math.round(340+n*9+(n%7>=5?-90:0)+t()*120));return b.map((e,t)=>{let r=n.slice(Math.max(0,t-6),t+1);return{day:e,orders:n[t]??0,average:Math.round(r.reduce((e,t)=>e+t,0)/r.length)}})}var S=[{key:`orders`,label:`Orders`,color:1,type:`bar`},{key:`average`,label:`7-day average`,color:2,type:`line`}],C=[{day:`Today`,orders:412,average:388}],w=p.map((e,t)=>({month:e,revenue:Math.round(184e3+t*9200+Math.sin(t*.9)*8e3),users:Math.round(8200+t*760+Math.cos(t*1.2)*300),tickets:Math.round(1300+t*30-Math.sin(t*.5)*120)})),T=[{key:`revenue`,label:`Revenue`,color:1,type:`bar`},{key:`users`,label:`Active users`,color:2,type:`line`},{key:`tickets`,label:`Support tickets`,color:3,type:`line`}],E=p.slice(-8).map((e,t)=>({month:e,new:Math.round(420+t*38+Math.sin(t)*40),returning:Math.round(900+t*55+Math.cos(t*.8)*60),target:1500+t*70})),D=[{key:`new`,label:`New`,color:1,type:`bar`},{key:`returning`,label:`Returning`,color:3,type:`bar`},{key:`target`,label:`Target`,color:2,type:`line`}];function O(){let[e,t]=(0,v.useState)(1),n=x(e);return(0,y.jsxs)(l,{eyebrow:`Chart`,title:`Combo chart`,description:`Bars and lines on ONE shared y-axis: a daily count and its rolling average, stacked parts and a target. Measures in different units are never given a second axis; index them to a common start instead.`,source:`theme/src/components/charts/combo-chart.tsx`,children:[(0,y.jsx)(s,{label:`Combo chart demo`,title:`Orders per day`,hue:1,height:`17.5rem`,legend:i(S),children:(0,y.jsx)(a,{data:x(1),index:`day`,series:S,"aria-label":`Orders per day with the 7-day average`})}),(0,y.jsx)(f,{title:`Bars and their average`,description:`Same unit, one axis. The line draws across the bars once they have grown, with a surface halo so it stays readable where it crosses them.`,variant:`bare`,controls:(0,y.jsx)(h,{onClick:()=>t(e=>e+1)}),code:`
import { ChartCard, comboLegend, ComboTable, ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { day: "Oct 8", orders: 402, average: 371 },
  { day: "Oct 9", orders: 388, average: 376 },
  { day: "Oct 10", orders: 431, average: 384 },
  { day: "Oct 11", orders: 455, average: 395 },
  { day: "Oct 12", orders: 301, average: 389 },
  { day: "Oct 13", orders: 296, average: 382 },
];
const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <ChartCard
      title="Orders per day"
      legend={comboLegend(series)}
      table={<ComboTable data={data} index="day" series={series} />}
    >
      <ComboChart data={data} index="day" series={series} aria-label="Orders per day with the 7-day average" />
    </ChartCard>
  );
}`,children:(0,y.jsx)(o,{className:`w-full`,title:`Orders per day`,description:`Last 14 days`,legend:i(S),table:(0,y.jsx)(r,{data:n,index:`day`,indexLabel:`Day`,series:S,caption:`Orders per day, last 14 days`}),children:(0,y.jsx)(a,{data:n,index:`day`,series:S,"aria-label":`Orders per day with the 7-day average`})})}),(0,y.jsx)(f,{title:`Indexed: different units, one axis`,description:`Revenue (dollars), users and tickets (counts) can't share a value axis, and two axes would let the chart say anything. indexed rebases every series to 100 at its first value, so the axis reads “how much has each grown?”. The tooltip keeps the actual values.`,variant:`bare`,code:`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "Nov", revenue: 184000, users: 8200, tickets: 1300 },
  { month: "Dec", revenue: 195000, users: 8900, tickets: 1340 },
  { month: "Jan", revenue: 201000, users: 9700, tickets: 1390 },
  { month: "Feb", revenue: 212000, users: 10200, tickets: 1360 },
  { month: "Mar", revenue: 224000, users: 11100, tickets: 1430 },
];
const series: ComboSeries[] = [
  { key: "revenue", label: "Revenue", color: 1, type: "bar" },
  { key: "users", label: "Active users", color: 2, type: "line" },
  { key: "tickets", label: "Support tickets", color: 3, type: "line" },
];

export function Example() {
  return <ComboChart indexed data={data} index="month" series={series} aria-label="Revenue, users and tickets, indexed to November = 100" />;
}`,children:(0,y.jsx)(o,{className:`w-full`,title:`Growth since November`,description:`Indexed to November = 100 for each series`,legend:i(T),table:(0,y.jsx)(r,{data:w,index:`month`,indexLabel:`Month`,series:T,caption:`Revenue, active users and support tickets per month (actual values)`}),children:(0,y.jsx)(a,{indexed:!0,data:w,index:`month`,series:T,"aria-label":`Revenue, active users and support tickets, indexed to November = 100`})})}),(0,y.jsx)(f,{title:`Stacked bars and a target`,description:`stacked stacks the bar series; the line is a target in the same unit. The tooltip adds the stack's total.`,variant:`bare`,code:`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const data = [
  { month: "May", new: 420, returning: 900, target: 1500 },
  { month: "Jun", new: 460, returning: 960, target: 1570 },
  { month: "Jul", new: 495, returning: 1010, target: 1640 },
  { month: "Aug", new: 530, returning: 1080, target: 1710 },
  { month: "Sep", new: 575, returning: 1150, target: 1780 },
];
const series: ComboSeries[] = [
  { key: "new", label: "New", color: 1, type: "bar" },
  { key: "returning", label: "Returning", color: 3, type: "bar" },
  { key: "target", label: "Target", color: 2, type: "line" },
];

export function Example() {
  return <ComboChart stacked data={data} index="month" series={series} aria-label="Customers per month against target" />;
}`,children:(0,y.jsx)(o,{className:`w-full`,title:`Customers vs target`,legend:i(D),table:(0,y.jsx)(r,{stacked:!0,data:E,index:`month`,indexLabel:`Month`,series:D,caption:`New and returning customers per month against target`}),children:(0,y.jsx)(a,{stacked:!0,data:E,index:`month`,series:D,"aria-label":`New and returning customers per month against target`})})}),(0,y.jsxs)(f,{title:`Edge cases`,description:`One category still gets a properly sized bar and a dot for the line (a line needs two points); no data keeps the chart's footprint.`,variant:`bare`,stageClassName:`grid gap-6 lg:grid-cols-2`,code:`
import { ComboChart, type ComboSeries } from "@sheenui/theme";

const series: ComboSeries[] = [
  { key: "orders", label: "Orders", color: 1, type: "bar" },
  { key: "average", label: "7-day average", color: 2, type: "line" },
];

export function Example() {
  return (
    <>
      <ComboChart data={[{ day: "Today", orders: 412, average: 388 }]} index="day" series={series} aria-label="Orders today" />
      <ComboChart data={[]} index="day" series={series} emptyState="No orders yet" aria-label="Orders per day" />
    </>
  );
}`,children:[(0,y.jsx)(o,{title:`One day`,legend:i(S),table:(0,y.jsx)(r,{data:C,index:`day`,indexLabel:`Day`,series:S,caption:`Orders today with the 7-day average`}),children:(0,y.jsx)(a,{data:C,index:`day`,series:S,height:220,"aria-label":`Orders today with the 7-day average`})}),(0,y.jsx)(o,{title:`No data`,table:(0,y.jsx)(r,{data:[],index:`day`,indexLabel:`Day`,series:S,caption:`Orders per day (no data)`}),children:(0,y.jsx)(a,{data:[],index:`day`,series:S,height:220,emptyState:`No orders yet`,"aria-label":`Orders per day`})})]}),(0,y.jsx)(d,{title:`ComboChart props`,of:g,rows:[[`comboLegend(series)`,`LegendItem[]`,``,`Legend items: swatches for bars, line keys for lines.`],[`indexSeries(data, keys, base?)`,`number[][]`,``,`The indexed values the chart plots.`]]}),(0,y.jsx)(d,{as:`h2`,title:`ComboTable props`,of:_}),(0,y.jsx)(u,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`← / →`,`Previous / next category.`],[`Home / End`,`Jump to the first / last category.`],[`Escape`,`Clear the reading.`]]}),(0,y.jsx)(c,{notes:[`The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces every series' value.`,`ComboTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.`,`Reduced motion: the bars and the line appear at their final values and data changes jump instead of morphing.`]})]})}export{O as default};