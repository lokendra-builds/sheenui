import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{l as r,n as i,t as a}from"./range-area-chart-8b3PQ8Mf.js";import{t as o}from"./ExampleChartCard-DOQs1ydL.js";import{i as s,n as c,o as l,r as u}from"./Page-DQ8sr8qt.js";import{t as d}from"./Example-DMEbQwm9.js";import{t as f}from"./Segmented-kx7yHseo.js";import{t as p}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{n as m,t as h}from"./shared-CwZXbVMJ.js";var g=[[`data`,`readonly ChartRow[]`,``,`One row per x value. Leave a value out (or null) to break the line or band there.`,!0],[`index`,`string`,``,`Key of the x value in each row (e.g. "month").`,!0],[`series`,`readonly RangeSeries[]`,``,"1–3 lines, each with its band. Give each a fixed `color` slot.",!0],[`curve`,`"linear" | "monotone"`,`"monotone"`,`"monotone" draws smooth curves that never overshoot a value; "linear" joins points with straight lines.`,!1],[`forecastFrom`,`string`,``,`The x value (e.g. "Jul") where the forecast starts: from there the line is dashed and the region is tinted and labelled.`,!1],[`zero`,`boolean`,`false`,`Keep zero on the value axis. Off by default: a band reads best when the axis hugs the data.`,!1],[`height`,`number`,`280`,`Height of the chart in px; the width follows the container.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats values in the tooltip and on the axis (the default axis format follows the tick step).`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<RangeAreaChartLabels>`,`defaultRangeAreaChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultRangeAreaChartLabels`. All 6 keys of `RangeAreaChartLabels` are listed in the key table under the props table.',!1,{type:`RangeAreaChartLabels`,const:`defaultRangeAreaChartLabels`,keys:[[`instructions`,`Use left and right arrow keys to read values.`],[`forecast`,`Forecast`],[`range`,"(label) => `${label} range`"],[`between`,"(low: string, high: string) => /^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`"],[`missing`,`–`],[`empty`,`No data`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],_=[[`data`,`readonly ChartRow[]`,``,"The rows to show: one object per row, holding the `index` key and the low and high keys of each series.",!0],[`index`,`string`,``,`The key in each row that names the row, such as "day". It becomes the first column.`,!0],[`series`,`readonly RangeSeries[]`,``,`The range series: each names the keys that hold its low and high values.`,!0],[`format`,`((n: number) => string)`,`formatCompact`,`Formats each number in the table.`,!1],[`indexLabel`,`string`,``,"Header of the first column; the `index` key when left out.",!1],[`caption`,`string`,``,`Visually hidden caption naming the table for screen readers.`,!1],[`labels`,`Partial<RangeAreaChartLabels>`,`defaultRangeAreaChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultRangeAreaChartLabels`. All 6 keys of `RangeAreaChartLabels` are listed in the key table under the props table.',!1,{type:`RangeAreaChartLabels`,const:`defaultRangeAreaChartLabels`,keys:[[`instructions`,`Use left and right arrow keys to read values.`],[`forecast`,`Forecast`],[`range`,"(label) => `${label} range`"],[`between`,"(low: string, high: string) => /^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`"],[`missing`,`–`],[`empty`,`No data`]]}],[`forecastFrom`,`string`,``,`Mark rows from this x value on as forecast.`,!1]],v=e(t()),y=n(),b=[`Nov`,`Dec`,`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`];b.map((e,t)=>({month:e,pro:t<3?42:t<7?45:48,team:t<4?50:t<9?54:57,enterprise:t<6?60:66})),b.map((e,t)=>({month:e,seats:[120,120,135,135,150,180,180,210,210,240,236,262][t]??0}));var x=[{month:`Jan`,revenue:42},{month:`Feb`,revenue:45},{month:`Mar`,revenue:44},{month:`Apr`,revenue:49},{month:`May`,revenue:53},{month:`Jun`,revenue:51},{month:`Jul`,revenue:56},{month:`Aug`,revenue:60,low:60,high:60},{month:`Sep`,revenue:63,low:59.5,high:66.5},{month:`Oct`,revenue:66,low:60,high:72.5},{month:`Nov`,revenue:70,low:61.5,high:79},{month:`Dec`,revenue:74,low:63,high:86}],S=[{key:`revenue`,label:`Revenue`,lower:`low`,upper:`high`,bandLabel:`80% interval`,color:1}];function C(e){let t=e===`jul`;return Array.from({length:14},(e,n)=>{let r=(t?24:15)+Math.sin(n*.8)*2.2+Math.cos(n*.31)*1.4,i=(t?17:2)+Math.sin(n*.6+1)*2.8+Math.cos(n*.47)*1.2,a=e=>Math.round(e*10)/10;return{day:`${n+1}`,lisbon:a(r),lisbonLow:a(r-4.2-Math.sin(n)*.8),lisbonHigh:a(r+4.8+Math.cos(n*1.3)*.9),oslo:a(i),osloLow:a(i-3.6-Math.cos(n*.9)),osloHigh:a(i+3.9+Math.sin(n*1.1))}})}var w=[{key:`lisbon`,label:`Lisbon`,lower:`lisbonLow`,upper:`lisbonHigh`,bandLabel:`Lisbon low–high`,color:2},{key:`oslo`,label:`Oslo`,lower:`osloLow`,upper:`osloHigh`,bandLabel:`Oslo low–high`,color:7}],T=e=>`${e.toLocaleString(`en`,{maximumFractionDigits:1}).replace(`-`,`−`)}°`;function E(){let[e,t]=(0,v.useState)(`jul`),n=C(e);return(0,y.jsxs)(c,{eyebrow:`Chart`,title:`Range area chart`,description:`A line with a min–max band around it: a forecast and its confidence interval, a daily low and high. The band is the line's own hue at low opacity, the legend names what it means, and gaps in the data stay gaps, never dips to zero.`,source:`${h}range-area-chart.tsx`,children:[(0,y.jsx)(p,{label:`Range area chart demo`,title:`Revenue forecast`,hue:1,height:`17.5rem`,children:(0,y.jsx)(a,{data:x,index:`month`,series:S,forecastFrom:`Sep`,format:m,"aria-label":`Monthly revenue with a forecast and its 80% interval`})}),(0,y.jsx)(d,{title:`Forecast with a confidence band`,description:`forecastFrom marks where actuals end: the line turns dashed, the region is tinted and tagged, and the band opens out from the last actual. The plot wipes in left to right; the band breathes open from its line.`,variant:`bare`,code:`
import { ChartCard, rangeAreaLegend, RangeAreaTable, RangeAreaChart, formatCompact, type ChartRow, type RangeSeries } from "@sheenui/theme";

const data: ChartRow[] = [
  { month: "Jun", revenue: 51 },
  { month: "Jul", revenue: 56 },
  { month: "Aug", revenue: 60, low: 60, high: 60 },
  { month: "Sep", revenue: 63, low: 59.5, high: 66.5 },
  { month: "Oct", revenue: 66, low: 60, high: 72.5 },
  { month: "Nov", revenue: 70, low: 61.5, high: 79 },
];
const series: RangeSeries[] = [{ key: "revenue", label: "Revenue", lower: "low", upper: "high", bandLabel: "80% interval" }];

export function Example() {
  return (
    <ChartCard
      title="Revenue forecast"
      legend={rangeAreaLegend(series)}
      table={<RangeAreaTable data={data} index="month" series={series} forecastFrom="Sep" />}
    >
      <RangeAreaChart
        data={data}
        index="month"
        series={series}
        forecastFrom="Sep"
        format={(n) => "$" + formatCompact(n) + "K"}
        aria-label="Monthly revenue with a forecast and its 80% interval"
      />
    </ChartCard>
  );
}`,children:(0,y.jsx)(o,{className:`w-full`,title:`Revenue forecast`,description:`Monthly, US$ thousands. Actuals to August.`,legend:r(S),table:(0,y.jsx)(i,{data:x,index:`month`,indexLabel:`Month`,series:S,format:m,forecastFrom:`Sep`,caption:`Revenue forecast`}),children:(0,y.jsx)(a,{data:x,index:`month`,series:S,forecastFrom:`Sep`,format:m,"aria-label":`Monthly revenue with a forecast and its 80% interval`})})}),(0,y.jsx)(d,{title:`Two series with bands`,description:`Overlapping bands stay light (14%) so both remain readable, and every band is drawn before any line. Switch the month: lines and bands morph to the new values.`,variant:`bare`,controls:(0,y.jsx)(f,{label:`Month`,size:`sm`,options:[{value:`mar`,label:`March`},{value:`jul`,label:`July`}],value:e,onValueChange:t}),code:`
import { RangeAreaChart, type ChartRow, type RangeSeries } from "@sheenui/theme";

const days: ChartRow[] = [
  { day: "1", lisbon: 15.2, lisbonLow: 11, lisbonHigh: 20, oslo: 2.4, osloLow: -1.2, osloHigh: 5.9 },
  { day: "2", lisbon: 16.1, lisbonLow: 12.3, lisbonHigh: 21.2, oslo: 3.1, osloLow: -0.4, osloHigh: 6.8 },
  { day: "3", lisbon: 14.8, lisbonLow: 10.5, lisbonHigh: 19.4, oslo: 1.7, osloLow: -2, osloHigh: 5 },
  { day: "4", lisbon: 15.9, lisbonLow: 11.8, lisbonHigh: 20.6, oslo: 2.9, osloLow: -0.9, osloHigh: 6.2 },
];

const series: RangeSeries[] = [
  { key: "lisbon", label: "Lisbon", lower: "lisbonLow", upper: "lisbonHigh", bandLabel: "Lisbon low–high", color: 2 },
  { key: "oslo", label: "Oslo", lower: "osloLow", upper: "osloHigh", bandLabel: "Oslo low–high", color: 7 },
];

export function Example() {
  return (
    <RangeAreaChart
      data={days}
      index="day"
      series={series}
      format={(n) => n + "°"}
      aria-label="Daily mean temperature with the low–high range"
    />
  );
}`,children:(0,y.jsx)(o,{className:`w-full`,title:`Daily temperature`,description:`First two weeks of ${e===`jul`?`July`:`March`}, °C`,legend:r(w),table:(0,y.jsx)(i,{data:n,index:`day`,indexLabel:`Day`,series:w,format:T,caption:`Daily temperature`}),children:(0,y.jsx)(a,{data:n,index:`day`,series:w,format:T,"aria-label":`Daily mean temperature with the low–high range`})})}),(0,y.jsx)(u,{of:g}),(0,y.jsx)(u,{as:`h3`,title:`rangeAreaLegend / RangeAreaTable`,of:_,rows:[[`rangeAreaLegend(series, labels?)`,`LegendItem[]`,``,`Legend items for ChartCard: each line, then its band, keyed as drawn.`]]}),(0,y.jsx)(l,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`← / → (↑ / ↓)`,`Previous / next point.`],[`Home / End`,`Jump to the first / last point.`],[`Escape`,`Clear the reading.`]]}),(0,y.jsx)(s,{notes:[`The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. Each move announces every line and its band as “low to high”; gaps are read as a dash, never as 0.`,`RangeAreaTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.`,`With reduced motion on, the band and its lines start at their final values and a data change jumps straight to the new state.`]})]})}export{E as default};