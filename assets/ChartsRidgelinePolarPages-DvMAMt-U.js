import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{a as r,n as i,t as a}from"./polar-area-chart-B9F2d6-L.js";import{t as o}from"./ExampleChartCard-ZE1sKvmi.js";import{i as s,n as c,o as l,r as u}from"./Page-BRuP8nt1.js";import{t as d}from"./Example-DaSezASZ.js";import{t as f}from"./demo-utils-DKtmFFFD.js";import{t as p}from"./Segmented-ByB5jpmQ.js";import{t as m}from"./ShowcaseStage.chart.scene-BbwlviML.js";import{r as h,t as g}from"./shared-DRPI2QvD.js";var _=[[`data`,`readonly ChartRow[]`,``,`One row per wedge (e.g. per month), clockwise from 12 o'clock.`,!0],[`index`,`string`,``,`Key of the wedge's name in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,"One or more series; several stack outwards (Nightingale's rose). Up to 8, each with a fixed `color` slot.",!0],[`scale`,`"area" | "radius"`,`"area"`,`"area" (default): a wedge's AREA is proportional to its value, which is how a rose must be read. "radius": its length is, which exaggerates large values; only for familiar 0–100 scores.`,!1],[`height`,`number`,`340`,`Height in px; the rose is as large as fits.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<PolarAreaChartLabels>`,`defaultPolarAreaChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultPolarAreaChartLabels`. All 5 keys of `PolarAreaChartLabels` are listed in the key table under the props table.',!1,{type:`PolarAreaChartLabels`,const:`defaultPolarAreaChartLabels`,keys:[[`instructions`,`Use the arrow keys to read each wedge.`],[`total`,`Total`],[`other`,`Other`],[`touchHint`,`Tap or drag around the chart to read values`],[`empty`,`No data`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],v=[[`data`,`readonly ChartRow[]`,``,`One row per wedge (e.g. per month), clockwise from 12 o'clock.`,!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`labels`,`Partial<PolarAreaChartLabels>`,`defaultPolarAreaChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultPolarAreaChartLabels`. All 5 keys of `PolarAreaChartLabels` are listed in the key table under the props table.',!1,{type:`PolarAreaChartLabels`,const:`defaultPolarAreaChartLabels`,keys:[[`instructions`,`Use the arrow keys to read each wedge.`],[`total`,`Total`],[`other`,`Other`],[`touchHint`,`Tap or drag around the chart to read values`],[`empty`,`No data`]]}],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`index`,`string`,``,`Key of the wedge's name in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,"One or more series; several stack outwards (Nightingale's rose). Up to 8, each with a fixed `color` slot.",!0],[`indexLabel`,`string`,``,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1]],y=e(t()),b=n();[`Nov`,`Dec`,`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`].map((e,t)=>{let n=f(500+t),r=h(n),i=46-t*1.6+(t===1?9:0),a=11-t*.45+(t===1?4:0);return{label:e,values:Array.from({length:220},()=>{let e=n()>.93?Math.abs(r())*12:0;return Math.max(8,Math.round(i+r()*a+e))})}}),[[`Support`,54,10],[`Design`,96,16],[`Marketing`,88,18],[`Engineering`,142,26],[`Data science`,151,22],[`Product`,138,20]].map(([e,t,n],r)=>{let i=h(f(900+r));return{label:String(e),values:Array.from({length:160},()=>Math.round((Number(t)+i()*Number(n))*1e3))}});var x=[{month:`Apr`,disease:1,wounds:0,other:5},{month:`May`,disease:12,wounds:0,other:9},{month:`Jun`,disease:11,wounds:0,other:6},{month:`Jul`,disease:359,wounds:0,other:23},{month:`Aug`,disease:828,wounds:1,other:30},{month:`Sep`,disease:788,wounds:81,other:70},{month:`Oct`,disease:503,wounds:132,other:128},{month:`Nov`,disease:844,wounds:287,other:106},{month:`Dec`,disease:1725,wounds:114,other:131},{month:`Jan`,disease:2761,wounds:83,other:324},{month:`Feb`,disease:2120,wounds:42,other:361},{month:`Mar`,disease:1205,wounds:32,other:172}],S=[{key:`disease`,label:`Preventable disease`,color:7},{key:`wounds`,label:`Wounds`,color:8},{key:`other`,label:`Other causes`,color:4}],C=Array.from({length:24},(e,t)=>{let n=f(700+t),r=Math.exp(-((t-10)**2)/8)*820,i=Math.exp(-((t-20.5)**2)/6)*1240;return{hour:`${String(t).padStart(2,`0`)}:00`,sessions:Math.round(90+r+i+n()*60)}});function w(){let[e,t]=(0,y.useState)(`area`),n=(0,y.useMemo)(()=>[{key:`sessions`,label:`Sessions`,color:7}],[]);return(0,b.jsxs)(c,{eyebrow:`Chart`,title:`Polar area chart`,description:`Nightingale's rose: one wedge per category around a circle (months, hours, compass points), each wedge's area proportional to its value. Several series stack outwards. Rings mark round values, names never collide, and every wedge can be read by hover, tap or arrow keys.`,source:`${g}polar-area-chart.tsx`,children:[(0,b.jsx)(m,{label:`Polar area chart demo`,title:`Causes of mortality, 1854–55`,hue:7,height:`23.75rem`,legend:r(S),children:(0,b.jsx)(a,{data:x,index:`month`,series:S,scale:`area`,height:380,"aria-label":`Deaths in the army in the East by cause and month`})}),(0,b.jsx)(d,{title:`Nightingale's rose, 1854–55`,description:`Her own data: most soldiers died of preventable disease, not wounds. Areas are true to the values; switch to radius scaling to see how it would exaggerate the winter.`,variant:`bare`,controls:(0,b.jsx)(p,{label:`Scale`,size:`sm`,options:[{value:`area`,label:`Area (true)`},{value:`radius`,label:`Radius`}],value:e,onValueChange:t}),code:`
import { ChartCard, polarAreaLegend, PolarAreaTable, PolarAreaChart, type ChartRow, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "disease", label: "Preventable disease", color: 7 },
  { key: "wounds", label: "Wounds", color: 8 },
  { key: "other", label: "Other causes", color: 4 },
];
const data: ChartRow[] = [
  { month: "Apr 1854", disease: 110, wounds: 0, other: 5 },
  { month: "May", disease: 95, wounds: 0, other: 9 },
  { month: "Jun", disease: 40, wounds: 0, other: 6 },
  { month: "Jul", disease: 140, wounds: 5, other: 9 },
  { month: "Aug", disease: 220, wounds: 9, other: 6 },
  { month: "Sep", disease: 360, wounds: 23, other: 14 },
];

export function Example() {
  return (
    <ChartCard
      title="Causes of mortality"
      legend={polarAreaLegend(series)}
      table={<PolarAreaTable data={data} index="month" series={series} />}
    >
      <PolarAreaChart data={data} index="month" series={series} scale="area" aria-label="Deaths by cause and month" />
    </ChartCard>
  );
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`Causes of mortality in the army in the East`,description:`Deaths per month from April 1854 to March 1855, by cause`,legend:r(S),table:(0,b.jsx)(i,{data:x,index:`month`,indexLabel:`Month`,series:S,caption:`Deaths by cause and month`}),children:(0,b.jsx)(a,{data:x,index:`month`,series:S,scale:e,height:380,"aria-label":`Deaths in the army in the East by cause and month`})})}),(0,b.jsx)(d,{title:`24 hours of traffic`,description:`One series, one hue: position and name tell the wedges apart. With 24 names around the rose, labels thin out on narrow screens instead of colliding.`,variant:`bare`,code:`
import { PolarAreaChart, type ChartRow } from "@sheenui/theme";

// Average sessions per hour of the day (every 4th hour shown here)
const hourly: ChartRow[] = [
  { hour: "00:00", sessions: 120 },
  { hour: "04:00", sessions: 95 },
  { hour: "08:00", sessions: 540 },
  { hour: "12:00", sessions: 610 },
  { hour: "16:00", sessions: 480 },
  { hour: "20:00", sessions: 1290 },
];

export function Example() {
  return (
    <PolarAreaChart
      data={hourly}
      index="hour"
      series={[{ key: "sessions", label: "Sessions", color: 7 }]}
      aria-label="Sessions by hour of day"
    />
  );
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`Sessions by hour`,description:`Average weekday, local time`,table:(0,b.jsx)(i,{data:C,index:`hour`,indexLabel:`Hour`,series:n,caption:`Average sessions per hour`}),children:(0,b.jsx)(a,{data:C,index:`hour`,series:n,height:340,"aria-label":`Sessions by hour of day`})})}),(0,b.jsx)(u,{of:_}),(0,b.jsx)(u,{as:`h2`,title:`PolarAreaTable props`,of:v}),(0,b.jsx)(l,{rows:[[`Tab`,`Focus the chart (one tab stop).`],[`→ / ↓`,`Next wedge, clockwise.`],[`← / ↑`,`Previous wedge.`],[`Home / End`,`First / last wedge.`],[`Escape`,`Stop reading.`]]}),(0,b.jsxs)(s,{children:[(0,b.jsx)(`li`,{children:`The chart is one focusable figure; each wedge read by keyboard announces every series' value (and the total) once.`}),(0,b.jsx)(`li`,{children:`Areas are true to the values by default, so the picture never exaggerates big wedges; the ring values give the scale.`}),(0,b.jsx)(`li`,{children:`Names around the rose thin out instead of colliding, and every wedge is in the table view, so nothing depends on reading a crowded label.`}),(0,b.jsx)(`li`,{children:`Forced colors outline every wedge in CanvasText; reduced motion draws the rose in place.`})]})]})}export{w as default};