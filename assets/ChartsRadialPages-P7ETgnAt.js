import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{i as r}from"./chart-figure-BAmJknKz.js";import{o as i}from"./legend-tooltip-B7LDwC_I.js";import{t as a}from"./radar-chart-DdJjM6Du.js";import{t as o}from"./ExampleChartCard-DOQs1ydL.js";import{i as s,n as c,o as l,r as u}from"./Page-vzU90LKc.js";import{t as d}from"./Example-CmMsgUlK.js";import{t as f}from"./Segmented-kx7yHseo.js";import{t as p}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{t as m}from"./shared-CwZXbVMJ.js";var h=[[`data`,`readonly ChartRow[]`,``,`One row per axis (spoke), clockwise from the top, e.g. { skill: "Speed", alice: 82, bob: 64 }. 3–10 axes read best.`,!0],[`index`,`string`,``,`Key of the axis name in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,"The shapes to compare: 1–4 series, each with a fixed `color` slot.",!0],[`max`,`number`,`a round number at or above the largest value`,`Value at the outer ring (e.g. 100 for scores).`,!1],[`grid`,`"circle" | "polygon"`,`"polygon"`,`"polygon" rings follow the spokes; "circle" rings are round.`,!1],[`height`,`number`,`320`,`Largest height (px). When the width is the limit (a narrow card), the chart shrinks to the height its rings and labels need, so there is no empty band above and below the shape.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats values in the tooltip and the ring labels. Values below 0 are drawn at the centre.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when series.length > 3`,`Tell series apart without colour (hatch fills and dashed outlines; the first series stays solid).`,!1],[`labels`,`Partial<RadarChartLabels>`,`defaultRadarChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultRadarChartLabels`. All 2 keys of `RadarChartLabels` are listed in the key table under the props table.',!1,{type:`RadarChartLabels`,const:`defaultRadarChartLabels`,keys:[[`instructions`,`Use arrow keys to read each axis.`],[`touchHint`,`Tap an axis to read its values`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],g=[[`data`,`readonly ChartRow[]`,``,"The rows to show: one object per row, holding the `index` key and one number per series key.",!0],[`index`,`string`,``,`The key in each row that names the row, such as "month". It becomes the first column.`,!0],[`series`,`readonly CompareSeries[]`,``,"Series to list as columns; one with a `compareKey` also gets a previous-period column.",!0],[`format`,`((n: number) => string)`,`formatCompact`,`Formats each number in the table cells.`,!1],[`indexLabel`,`string`,``,"Header of the first column; the `index` key when left out.",!1],[`caption`,`string`,``,`Visually hidden caption naming the table for screen readers.`,!1],[`labels`,`Partial<ChartTableLabels>`,`defaultChartTableLabels`,'Text for i18n (defaults come from the enclosing ChartCard\'s labels, else English). Every other string, for translation: `labels={{ noData: "…" }}`; omitted keys keep the English of `defaultChartTableLabels`. All 2 keys of `ChartTableLabels` are listed in the key table under the props table.',!1,{type:`ChartTableLabels`,const:`defaultChartTableLabels`,keys:[[`noData`,`No data`],[`previous`,"(label: string) => `${label} (previous)`"]]}]],_=e(t()),v=n(),y={q2:[{metric:`Performance`,previous:72,current:84},{metric:`Accessibility`,previous:81,current:93},{metric:`Reliability`,previous:90,current:88},{metric:`Security`,previous:66,current:79},{metric:`Test coverage`,previous:58,current:71},{metric:`Docs`,previous:70,current:62}],q3:[{metric:`Performance`,previous:84,current:95},{metric:`Accessibility`,previous:93,current:97},{metric:`Reliability`,previous:88,current:93},{metric:`Security`,previous:79,current:86},{metric:`Test coverage`,previous:71,current:83},{metric:`Docs`,previous:62,current:80}]},b=[{key:`previous`,label:`Last release`,color:2},{key:`current`,label:`This release`,color:1}],x=[{area:`First response time`,team:82,benchmark:70},{area:`Resolution time`,team:64,benchmark:72},{area:`Customer satisfaction`,team:91,benchmark:80},{area:`Reopened tickets`,team:58,benchmark:66},{area:`Self-service deflection`,team:47,benchmark:55},{area:`Escalation rate`,team:73,benchmark:61},{area:`Knowledge base coverage`,team:69,benchmark:74},{area:`Agent utilization`,team:77,benchmark:70},{area:`SLA attainment`,team:88,benchmark:83},{area:`Quality review score`,team:80,benchmark:76}],S=[{key:`team`,label:`Our team`,color:1},{key:`benchmark`,label:`Industry benchmark`,color:3}],C=[{note:`Acidity`,ethiopia:8.5,colombia:6,sumatra:3.5},{note:`Sweetness`,ethiopia:7,colombia:7.5,sumatra:5},{note:`Body`,ethiopia:4.5,colombia:6.5,sumatra:8.5},{note:`Bitterness`,ethiopia:3,colombia:5,sumatra:7},{note:`Aroma`,ethiopia:9,colombia:7,sumatra:6.5},{note:`Aftertaste`,ethiopia:7.5,colombia:6.5,sumatra:7.5}],w=[{key:`ethiopia`,label:`Ethiopia`,color:2},{key:`colombia`,label:`Colombia`,color:3},{key:`sumatra`,label:`Sumatra`,color:1}];function T(){let[e,t]=(0,_.useState)(`q3`),n=y[e];return(0,v.jsxs)(c,{eyebrow:`Chart`,title:`Radar chart`,description:`Compare a few profiles across the same set of measures. Rings follow the spokes, axis names are laid out so they never collide or leave the chart, and hovering, tapping or arrowing around the chart reads every series on one axis. On a phone the readout sits in its own band above the shape, so a tap never hides the data.`,source:`${m}radar-chart.tsx`,children:[(0,v.jsx)(p,{label:`Radar chart demo`,title:`Release quality scores`,hue:2,height:`20rem`,narrowHeight:`11.6875rem`,children:(0,v.jsx)(a,{data:y.q3,index:`metric`,series:b,max:100,"aria-label":`Release quality scores, this release against the last`})}),(0,v.jsx)(d,{title:`Two series, morphing data`,description:`Two series on a 0–100 scale. Switch the quarter: the shapes morph to the new values instead of redrawing. Focus the chart and use the arrow keys to walk the axes.`,variant:`bare`,controls:(0,v.jsx)(f,{label:`Quarter`,size:`sm`,options:[{value:`q2`,label:`Q2`},{value:`q3`,label:`Q3`}],value:e,onValueChange:t}),code:`
import { ChartCard, seriesLegend, ChartTable, RadarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { metric: "Performance", previous: 84, current: 95 },
  { metric: "Accessibility", previous: 93, current: 97 },
  { metric: "Reliability", previous: 88, current: 93 },
  { metric: "Security", previous: 79, current: 86 },
  { metric: "Test coverage", previous: 71, current: 83 },
  { metric: "Docs", previous: 62, current: 80 },
];
const series: ChartSeries[] = [
  { key: "previous", label: "Last release", color: 2 },
  { key: "current", label: "This release", color: 1 },
];

<ChartCard
  title="Release scorecard"
  legend={seriesLegend(series, "rect")}
  table={<ChartTable data={data} index="metric" indexLabel="Measure" series={series} />}
>
  <RadarChart
    data={data}
    index="metric"
    series={series}
    max={100}
    aria-label="Release quality scores, this release against the last"
  />
</ChartCard>`,children:(0,v.jsx)(o,{className:`w-full`,title:`Release scorecard`,description:`Quality audit, ${e.toUpperCase()}, out of 100 points`,legend:i(b,`rect`),table:(0,v.jsx)(r,{data:n,index:`metric`,indexLabel:`Measure`,series:b}),children:(0,v.jsx)(a,{data:n,index:`metric`,series:b,max:100,"aria-label":`Release quality scores, this release against the last`})})}),(0,v.jsxs)(`div`,{className:`grid grid-cols-1 gap-6 *:min-w-0 xl:grid-cols-2`,children:[(0,v.jsx)(d,{title:`Long axis names`,description:`Ten axes with long names in a half-width card. Names are measured in the chart's font, and long ones wrap onto two lines. Only when a name truly can't fit is it shortened, and only the ones that limit the shape, never below eight letters. On a small screen every other name may step back and reappear while its axis is active. Full names stay in the tooltip and the table.`,variant:`bare`,code:`
import { RadarChart, type ChartSeries } from "@sheenui/theme";

const support = [
  { area: "First response time", team: 82, benchmark: 70 },
  { area: "Resolution time", team: 64, benchmark: 72 },
  { area: "Customer satisfaction", team: 91, benchmark: 80 },
  { area: "Reopened tickets", team: 58, benchmark: 66 },
  { area: "Self-service deflection", team: 47, benchmark: 55 },
  { area: "Escalation rate", team: 73, benchmark: 61 },
];

const series: ChartSeries[] = [
  { key: "team", label: "Our team", color: 1 },
  { key: "benchmark", label: "Industry benchmark", color: 3 },
];

export function Example() {
  return (
    <RadarChart
      data={support}
      index="area"
      series={series}
      max={100}
      aria-label="Support quality against the industry benchmark"
    />
  );
}`,children:(0,v.jsx)(o,{title:`Support quality`,description:`Percentile, last 90 days`,legend:i(S,`rect`),table:(0,v.jsx)(r,{data:x,index:`area`,indexLabel:`Measure`,series:S}),children:(0,v.jsx)(a,{data:x,index:`area`,series:S,max:100,"aria-label":`Support quality against the industry benchmark`})})}),(0,v.jsx)(d,{title:`Round grid, three series`,description:`grid="circle" draws round rings. The scale tops out at a round number above the largest value unless you pass max.`,variant:`bare`,code:`
import { RadarChart, type ChartSeries } from "@sheenui/theme";

const roasts = [
  { note: "Acidity", ethiopia: 8.5, colombia: 6, sumatra: 3.5 },
  { note: "Sweetness", ethiopia: 7, colombia: 7.5, sumatra: 5 },
  { note: "Body", ethiopia: 4.5, colombia: 6.5, sumatra: 8.5 },
  { note: "Bitterness", ethiopia: 3, colombia: 5, sumatra: 7 },
  { note: "Aroma", ethiopia: 9, colombia: 7, sumatra: 6.5 },
];

const series: ChartSeries[] = [
  { key: "ethiopia", label: "Ethiopia", color: 2 },
  { key: "colombia", label: "Colombia", color: 3 },
  { key: "sumatra", label: "Sumatra", color: 1 },
];

export function Example() {
  return (
    <RadarChart
      grid="circle"
      data={roasts}
      index="note"
      series={series}
      max={10}
      aria-label="Flavor profile of three single-origin coffees"
    />
  );
}`,children:(0,v.jsx)(o,{title:`Flavor profile`,description:`Cupping scores out of 10`,legend:i(w,`rect`),table:(0,v.jsx)(r,{data:C,index:`note`,indexLabel:`Note`,series:w}),children:(0,v.jsx)(a,{grid:`circle`,data:C,index:`note`,series:w,max:10,"aria-label":`Flavor profile of three single-origin coffees`})})})]}),(0,v.jsx)(u,{of:h}),(0,v.jsx)(u,{as:`h2`,title:`RadarTable props`,of:g}),(0,v.jsx)(l,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`Arrow keys`,`Move between axes.`],[`Home / End`,`Jump to the first / last axis.`],[`Escape`,`Clear the reading.`]]}),(0,v.jsx)(s,{notes:[`Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the axis and every series' value.`,`RadarTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.`,`Reduced motion: the polygons appear at their final shape and data changes jump instead of morphing.`]})]})}export{T as default};