import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{C as r}from"./chart-utils-DvmgVWft.js";import{n as i,o as a,t as o}from"./scatter-chart-GwKXRAgJ.js";import{t as s}from"./ExampleChartCard-DOQs1ydL.js";import{t as c}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{i as l,n as u,o as d,r as f}from"./Page-y_OVkLtr.js";import{t as p}from"./Example-B3x8pgFu.js";import{t as m}from"./Segmented-kx7yHseo.js";import{n as h,r as g,t as _}from"./shared-C_d162MH.js";var v=[[`series`,`readonly ScatterSeries[]`,``,`Up to 3 series: in a scatter every colour sits next to every other, so a 4th would be hard to tell apart. Series past the third fold into one neutral "Other" series.`,!0],[`xLabel`,`string`,``,`Name of the x measure: titles the axis and the tooltip.`,!1],[`yLabel`,`string`,``,`Name of the y measure: titles the axis and the tooltip.`,!1],[`sizeLabel`,`string`,``,`Sets the name of the size measure (bubble charts).`,!1],[`bubble`,`boolean`,`false`,"Size each point by its `size` (a bubble chart).",!1],[`trendline`,`boolean`,`false`,`Draw a least-squares trend line through each series (needs 2+ points with different x).`,!1],[`includeZero`,`boolean`,`false`,`Keep 0 on the axes even when the data sits far from it.`,!1],[`height`,`number`,`300`,`Height of the chart in px; the width follows the container.`,!1],[`formatX`,`((n: number) => string)`,`formatCompact`,`Formats x values on the axis and in the tooltip.`,!1],[`formatY`,`((n: number) => string)`,`formatCompact`,`Formats y values on the axis and in the tooltip.`,!1],[`formatSize`,`((n: number) => string)`,`formatCompact`,`Formats bubble sizes in the tooltip.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<ScatterChartLabels>`,`defaultScatterChartLabels`,'Every other string, for translation: `labels={{ x: "…" }}`; omitted keys keep the English of `defaultScatterChartLabels`. All 10 keys of `ScatterChartLabels` are listed in the key table under the props table.',!1,{type:`ScatterChartLabels`,const:`defaultScatterChartLabels`,keys:[[`x`,`x`],[`y`,`y`],[`size`,`Size`],[`other`,`Other`],[`series`,`Series`],[`point`,`Point`],[`noData`,`No data`],[`instructions`,`Use the arrow keys to move between points: left and right follow x, up and down follow y.`],[`touchHint`,`Tap near a point to read it.`],[`trendSummary`,"(series, slope, r2) => `${series} trend: slope ${slope} per unit of x, R² ${r2}.`"]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`labels`,`Partial<ScatterChartLabels>`,`defaultScatterChartLabels`,'Every other string, for translation: `labels={{ x: "…" }}`; omitted keys keep the English of `defaultScatterChartLabels`. All 10 keys of `ScatterChartLabels` are listed in the key table under the props table.',!1,{type:`ScatterChartLabels`,const:`defaultScatterChartLabels`,keys:[[`x`,`x`],[`y`,`y`],[`size`,`Size`],[`other`,`Other`],[`series`,`Series`],[`point`,`Point`],[`noData`,`No data`],[`instructions`,`Use the arrow keys to move between points: left and right follow x, up and down follow y.`],[`touchHint`,`Tap near a point to read it.`],[`trendSummary`,"(series, slope, r2) => `${series} trend: slope ${slope} per unit of x, R² ${r2}.`"]]}],[`series`,`readonly ScatterSeries[]`,``,`Up to 3 series: in a scatter every colour sits next to every other, so a 4th would be hard to tell apart. Series past the third fold into one neutral "Other" series.`,!0],[`bubble`,`boolean`,`false`,"Size each point by its `size` (a bubble chart).",!1],[`xLabel`,`string`,``,`Name of the x measure: titles the axis and the tooltip.`,!1],[`yLabel`,`string`,``,`Name of the y measure: titles the axis and the tooltip.`,!1],[`sizeLabel`,`string`,``,`Sets the name of the size measure (bubble charts).`,!1],[`formatX`,`((n: number) => string)`,`formatCompact`,`Formats x values on the axis and in the tooltip.`,!1],[`formatY`,`((n: number) => string)`,`formatCompact`,`Formats y values on the axis and in the tooltip.`,!1],[`formatSize`,`((n: number) => string)`,`formatCompact`,`Formats bubble sizes in the tooltip.`,!1],[`caption`,`string`,``,`Sets a visually hidden caption that names the table.`,!1]],b=e(t()),x=n(),S=e=>`$${r(e)}`;h.map((e,t)=>({month:e,revenue:Math.round(184e3+t*9200+Math.sin(t*.9)*8e3),users:Math.round(8200+t*760+Math.cos(t*1.2)*300),tickets:Math.round(1300+t*30-Math.sin(t*.5)*120)})),h.slice(-8).map((e,t)=>({month:e,new:Math.round(420+t*38+Math.sin(t)*40),returning:Math.round(900+t*55+Math.cos(t*.8)*60),target:1500+t*70}));function C(e){let t=g(e),n=(e,n,r,i)=>({label:e,color:n,data:Array.from({length:16},(e,n)=>{let a=Math.round(2e3+n*1100+t()*900);return{x:a,y:Math.round(i+a*r+(t()-.5)*9e3),label:`Week ${n+1}`,id:`w${n}`}})});return[n(`Search`,1,3.1,4e3),n(`Social`,2,1.7,9e3)]}var w=[{label:`Europe`,color:1,data:[{label:`London`,x:3200,y:5400,size:9},{label:`Berlin`,x:1700,y:4300,size:3.7},{label:`Paris`,x:2300,y:4600,size:2.1},{label:`Madrid`,x:1400,y:3e3,size:3.3},{label:`Warsaw`,x:1050,y:2500,size:1.8}]},{label:`Asia`,color:2,data:[{label:`Tokyo`,x:1500,y:3800,size:14},{label:`Singapore`,x:3100,y:5200,size:5.9},{label:`Bengaluru`,x:520,y:1500,size:13.2},{label:`Seoul`,x:1150,y:3300,size:9.4},{label:`Jakarta`,x:600,y:1100,size:10.6}]},{label:`Americas`,color:3,data:[{label:`New York`,x:4200,y:7100,size:8.3},{label:`Toronto`,x:2200,y:4500,size:2.8},{label:`Mexico City`,x:900,y:1300,size:9.2},{label:`São Paulo`,x:850,y:1600,size:12.3},{label:`Austin`,x:1900,y:5600,size:1}]}],T=e=>`€${r(e)}`,E=[{label:`Today`,data:[{x:42,y:1280,label:`Today`}]}],D=[...w,{label:`Africa`,data:[{label:`Lagos`,x:700,y:900},{label:`Nairobi`,x:800,y:1200},{label:`Cape Town`,x:900,y:1700}]}],O=e=>`${r(e)}M`;function k(){let[e,t]=(0,b.useState)(1),[n,r]=(0,b.useState)(`on`),h=C(e);return(0,x.jsxs)(u,{eyebrow:`Chart`,title:`Scatter & bubble chart`,description:`How two measures relate, one dot per item. The pointer only has to be near a point (nearest-point hit testing), the arrow keys walk the points along x and y, and a least-squares trend line is one prop away.`,source:`theme/src/components/charts/scatter-chart.tsx`,children:[(0,x.jsx)(c,{label:`Scatter chart demo`,title:`Ad spend vs revenue`,hue:1,height:`18.75rem`,legend:a(C(1)),children:(0,x.jsx)(o,{trendline:!0,series:C(1),xLabel:`Weekly spend`,yLabel:`Weekly revenue`,formatX:S,formatY:S,"aria-label":`Weekly ad spend against revenue, by channel`})}),(0,x.jsx)(p,{title:`Scatter with trend lines`,description:`Two series, each with its own fitted trend (dotted, so it never reads as data). Their slope and R² are part of the chart's accessible name.`,variant:`bare`,controls:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(m,{label:`Trend lines`,size:`sm`,options:[{value:`on`,label:`Trend on`},{value:`off`,label:`Trend off`}],value:n,onValueChange:r}),(0,x.jsx)(_,{onClick:()=>t(e=>e+1)})]}),code:`
import { ChartCard, formatCompact, scatterLegend, ScatterTable, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Search",
    color: 1,
    data: [
      { x: 2400, y: 11800, label: "Week 1" },
      { x: 3600, y: 15200, label: "Week 2" },
      { x: 4800, y: 18900, label: "Week 3" },
      { x: 6100, y: 22100, label: "Week 4" },
    ],
  },
  {
    label: "Social",
    color: 2,
    data: [
      { x: 2100, y: 12800, label: "Week 1" },
      { x: 3300, y: 14600, label: "Week 2" },
      { x: 4500, y: 17900, label: "Week 3" },
      { x: 5900, y: 19400, label: "Week 4" },
    ],
  },
];

export function Example() {
  return (
    <ChartCard
      title="Ad spend vs revenue"
      legend={scatterLegend(series)}
      table={<ScatterTable series={series} xLabel="Spend" yLabel="Revenue" formatX={usd} formatY={usd} />}
    >
      <ScatterChart
        trendline
        series={series}
        xLabel="Weekly spend"
        yLabel="Weekly revenue"
        formatX={usd}
        formatY={usd}
        aria-label="Weekly ad spend against revenue, by channel"
      />
    </ChartCard>
  );
}`,children:(0,x.jsx)(s,{className:`w-full`,title:`Ad spend vs revenue`,description:`One dot per week`,legend:a(h),table:(0,x.jsx)(i,{series:h,xLabel:`Spend`,yLabel:`Revenue`,formatX:S,formatY:S,caption:`Weekly ad spend against revenue, by channel`}),children:(0,x.jsx)(o,{trendline:n===`on`,series:h,xLabel:`Weekly spend`,yLabel:`Weekly revenue`,formatX:S,formatY:S,"aria-label":`Weekly ad spend against revenue, by channel`})})}),(0,x.jsx)(p,{title:`Bubble chart`,description:`bubble sizes each point by area (4× the population is 4× the ink, not 16×). Big bubbles sit behind small ones, each with a surface ring, so every city stays visible and reachable.`,variant:`bare`,code:`
import { formatCompact, ScatterChart, type ScatterSeries } from "@sheenui/theme";

const eur = (n: number) => "€" + formatCompact(n);

const series: ScatterSeries[] = [
  {
    label: "Europe",
    color: 1,
    data: [
      { label: "London", x: 3200, y: 5400, size: 9.0 },
      { label: "Berlin", x: 1700, y: 4300, size: 3.7 },
      { label: "Paris", x: 2300, y: 4600, size: 2.1 },
    ],
  },
  {
    label: "Asia",
    color: 2,
    data: [
      { label: "Tokyo", x: 1500, y: 3800, size: 14.0 },
      { label: "Singapore", x: 3100, y: 5200, size: 5.9 },
      { label: "Bengaluru", x: 520, y: 1500, size: 13.2 },
    ],
  },
  {
    label: "Americas",
    color: 3,
    data: [
      { label: "New York", x: 4200, y: 7100, size: 8.3 },
      { label: "Toronto", x: 2200, y: 4500, size: 2.8 },
      { label: "São Paulo", x: 850, y: 1600, size: 12.3 },
    ],
  },
];

export function Example() {
  return (
    <ScatterChart
      bubble
      series={series}
      xLabel="Average rent"
      yLabel="Average net salary"
      sizeLabel="Population"
      formatX={eur}
      formatY={eur}
      formatSize={(n) => n + "M"}
      aria-label="Rent against salary in nine cities, sized by population"
    />
  );
}`,children:(0,x.jsx)(s,{className:`w-full`,title:`Rent vs salary`,description:`Monthly, in euros; bubble size is population`,legend:a(w),table:(0,x.jsx)(i,{bubble:!0,series:w,xLabel:`Rent`,yLabel:`Salary`,sizeLabel:`Population`,formatX:T,formatY:T,formatSize:O,caption:`Average rent, salary and population of 15 cities`}),children:(0,x.jsx)(o,{bubble:!0,series:w,xLabel:`Average rent`,yLabel:`Average net salary`,sizeLabel:`Population`,formatX:T,formatY:T,formatSize:O,height:340,"aria-label":`Average rent against average salary in 15 cities, sized by population`})})}),(0,x.jsxs)(p,{title:`Edge cases`,description:`A single point gets a padded axis around it; a fourth series folds into a neutral “Other” (in a scatter every color is compared with every other, so three is the limit).`,variant:`bare`,stageClassName:`grid gap-6 lg:grid-cols-2`,code:`
import { ScatterChart, type ScatterSeries } from "@sheenui/theme";

const fourSeries: ScatterSeries[] = [
  { label: "Europe", color: 1, data: [{ label: "London", x: 3200, y: 5400 }, { label: "Berlin", x: 1700, y: 4300 }] },
  { label: "Asia", color: 2, data: [{ label: "Tokyo", x: 1500, y: 3800 }, { label: "Seoul", x: 1150, y: 3300 }] },
  { label: "Americas", color: 3, data: [{ label: "New York", x: 4200, y: 7100 }, { label: "Austin", x: 1900, y: 5600 }] },
  { label: "Africa", data: [{ label: "Lagos", x: 700, y: 900 }, { label: "Nairobi", x: 800, y: 1200 }] },
];

export function Example() {
  return (
    <>
      <ScatterChart series={[{ label: "Today", data: [{ x: 42, y: 1280 }] }]} aria-label="Sessions against revenue today" />
      <ScatterChart series={fourSeries} aria-label="Rent against salary by region" /> {/* the 4th is drawn as "Other" */}
    </>
  );
}`,children:[(0,x.jsx)(s,{title:`One point`,table:(0,x.jsx)(i,{series:E,xLabel:`Sessions`,yLabel:`Revenue`,caption:`Sessions against revenue today`}),children:(0,x.jsx)(o,{series:E,xLabel:`Sessions`,yLabel:`Revenue`,height:220,"aria-label":`Sessions against revenue today`})}),(0,x.jsx)(s,{title:`Four series`,legend:a(D),table:(0,x.jsx)(i,{series:D,xLabel:`Rent`,yLabel:`Salary`,formatX:T,formatY:T,caption:`Rent against salary by region`}),children:(0,x.jsx)(o,{series:D,formatX:T,formatY:T,height:220,"aria-label":`Rent against salary by region`})})]}),(0,x.jsx)(f,{title:`ScatterChart props`,of:v,rows:[[`scatterLegend(series)`,`LegendItem[]`,``,`Returns legend items with the same “Other” fold.`],[`linearRegression(points)`,`{ slope, intercept, r2 } | null`,``,`The fit the trend line uses.`]]}),(0,x.jsx)(f,{as:`h2`,title:`ScatterTable props`,of:y}),(0,x.jsx)(d,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`→ / ←`,`Next / previous point in x order.`],[`↑ / ↓`,`Next / previous point in y order.`],[`Home / End`,`Jump to the first / last point in x order.`],[`Escape`,`Clear the reading.`]]}),(0,x.jsx)(l,{notes:[`The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces the point's x, y (and size, for bubbles).`,`ScatterTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.`,`With reduced motion on, the points start at their final positions and a data change jumps straight to the new state.`]})]})}export{k as default};