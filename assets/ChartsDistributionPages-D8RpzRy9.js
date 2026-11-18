import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./ExampleChartCard-ZE1sKvmi.js";import{i,n as a,o,r as s}from"./Page-BRuP8nt1.js";import{t as c}from"./Example-DaSezASZ.js";import{n as l,t as u}from"./box-plot-ZiAEx99E.js";import{t as d}from"./ShowcaseStage.chart.scene-BbwlviML.js";import{t as f}from"./Segmented-ByB5jpmQ.js";import{t as p}from"./demo-utils-DKtmFFFD.js";import{a as m,i as h,n as g,s as _,t as v}from"./shared-Dbp0f8HM.js";import{t as y}from"./lazy-block-BfzH_8EP.js";import{t as b}from"./preload-helper-BrmCrVM7.js";var x=[[`data`,`readonly BoxPlotGroup[]`,``,`One box per group, in order.`,!0],[`variant`,`"box" | "violin"`,`"box"`,`"box": box and whiskers. "violin": the density shape with a slim box inside.`,!1],[`orientation`,`"horizontal" | "vertical" | "auto"`,`"auto"`,`"auto" draws upright boxes, and turns them sideways on narrow charts or when group names wouldn't fit.`,!1],[`whisker`,`number | "minmax"`,`1.5`,`Whisker reach in IQRs (Tukey: 1.5): points beyond are outliers. "minmax" reaches the extremes.`,!1],[`showMean`,`boolean`,`false`,`Mark each group's mean with a small diamond.`,!1],[`includeZero`,`boolean`,`false`,`Keep 0 on the value axis.`,!1],[`bandwidth`,`number`,`Silverman's rule per group`,`KDE bandwidth of the violins, in data units.`,!1],[`color`,`ChartColor`,`1`,`Palette slot (1–8) of every box (groups can override).`,!1],[`height`,`number`,`300`,`Height of an upright chart. Sideways charts grow with the number of groups.`,!1],[`valueLabel`,`string`,``,`Names the value axis.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the axis, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<BoxPlotLabels>`,`defaultBoxPlotLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultBoxPlotLabels`. All 17 keys of `BoxPlotLabels` are listed in the key table under the props table.',!1,{type:`BoxPlotLabels`,const:`defaultBoxPlotLabels`,keys:[[`roleDescription`,`box plot`],[`instructions`,`({ horizontal }) => horizontal ? "Use the up and down arrow keys to move between groups, and left and right...`],[`hint`,`Tap a group to read it`],[`median`,`Median`],[`quartiles`,`Middle 50%`],[`whiskers`,`Whiskers`],[`mean`,`Mean`],[`count`,`Values`],[`outliers`,`Outliers`],[`outlier`,`Outlier`],[`min`,`Min`],[`max`,`Max`],[`q1`,`Q1`],[`q3`,`Q3`],[`group`,`Group`],[`between`,"(low, high) => `${low}–${high}`"],[`noData`,`No data`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],S=[[`data`,`readonly BoxPlotGroup[]`,``,`One box per group, in order.`,!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the axis, tooltips and data table: takes the number, returns the text shown.`,!1],[`labels`,`Partial<BoxPlotLabels>`,`defaultBoxPlotLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultBoxPlotLabels`. All 17 keys of `BoxPlotLabels` are listed in the key table under the props table.',!1,{type:`BoxPlotLabels`,const:`defaultBoxPlotLabels`,keys:[[`roleDescription`,`box plot`],[`instructions`,`({ horizontal }) => horizontal ? "Use the up and down arrow keys to move between groups, and left and right...`],[`hint`,`Tap a group to read it`],[`median`,`Median`],[`quartiles`,`Middle 50%`],[`whiskers`,`Whiskers`],[`mean`,`Mean`],[`count`,`Values`],[`outliers`,`Outliers`],[`outlier`,`Outlier`],[`min`,`Min`],[`max`,`Max`],[`q1`,`Q1`],[`q3`,`Q3`],[`group`,`Group`],[`between`,"(low, high) => `${low}–${high}`"],[`noData`,`No data`]]}],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`whisker`,`number | "minmax"`,`1.5`,`Whisker reach in IQRs (Tukey: 1.5): points beyond are outliers. "minmax" reaches the extremes.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],C=e(t(),1),w=n();function T(){return[[`Europe`,820,.28],[`North America`,760,.25],[`South America`,1180,.33],[`Asia Pacific`,1020,.36],[`Africa`,1390,.3]].map(([e,t,n],r)=>{let i=m(p(100+r));return{label:e,values:Array.from({length:240},()=>Math.round(t*Math.exp(n*i())))}})}function E(){let e=p(77),t=m(e),n=(e,t)=>Array.from({length:e},()=>Math.max(1,Math.round(t())));return[{label:`Free`,values:n(320,()=>e()<.7?24+9*t():92+16*t())},{label:`Pro`,values:n(260,()=>118+30*t())},{label:`Team`,values:n(200,()=>156+26*t())},{label:`Enterprise`,values:n(140,()=>190+40*t())}]}var D=[{label:`Parcelly`,summary:{low:1,q1:2,median:2.5,q3:3,high:4.5,mean:2.7,n:1840,outliers:[6,7,9]}},{label:`SwiftPost`,summary:{low:1,q1:1.5,median:2,q3:2.5,high:4,mean:2.1,n:2210,outliers:[5.5]}},{label:`RoadRunner`,summary:{low:2,q1:3,median:4,q3:5,high:7.5,mean:4.2,n:960,outliers:[10,11]},color:8},{label:`Postal`,summary:{low:2,q1:3,median:3.5,q3:4,high:5.5,mean:3.6,n:3120}}];function O(){let e=(0,C.useMemo)(()=>E(),[]),[t,n]=(0,C.useState)(`violin`);return(0,w.jsx)(c,{title:`Violin`,description:`variant="violin" draws each group's density around a slim box. The Free plan has two peaks, casual and power users, which a box alone would hide.`,variant:`bare`,controls:(0,w.jsx)(f,{label:`Shape`,size:`sm`,options:[{value:`violin`,label:`Violin`},{value:`box`,label:`Box`}],value:t,onValueChange:n}),code:`
import { BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Weekly active minutes per user (a sample; yours is the full list)
const plans: BoxPlotGroup[] = [
  { label: "Free", values: [12, 18, 22, 26, 31, 20, 88, 95, 102, 24, 28, 90] },
  { label: "Pro", values: [84, 102, 118, 126, 140, 111, 97, 133, 150, 121] },
  { label: "Team", values: [120, 138, 152, 160, 171, 144, 129, 165, 182, 156] },
  { label: "Enterprise", values: [130, 168, 190, 205, 232, 177, 150, 214, 248, 196] },
];

export function Example() {
  return (
    <BoxPlot
      variant="violin"
      data={plans}
      color={3}
      valueLabel="Minutes"
      aria-label="Weekly active minutes by plan"
    />
  );
}`,children:(0,w.jsx)(r,{className:v,title:`Weekly active minutes`,description:`By plan`,table:(0,w.jsx)(l,{data:e,caption:`Weekly active minutes by plan`}),children:(0,w.jsx)(u,{variant:t,data:e,color:3,valueLabel:`Minutes`,height:300,"aria-label":`Weekly active minutes by plan`})})})}function k(){let e=(0,C.useMemo)(()=>T(),[]),[t,n]=(0,C.useState)(`1.5`),i=t===`minmax`?`minmax`:1.5;return(0,w.jsx)(c,{title:`Box and whiskers`,description:`Page-load times in five regions, 240 visits each, with the mean as a diamond. Switch the whiskers to min–max and the outliers fold into them. Arrow between regions; up and down step through a region's outliers.`,variant:`bare`,controls:(0,w.jsx)(f,{label:`Whiskers`,size:`sm`,options:[{value:`1.5`,label:`1.5 × IQR`},{value:`minmax`,label:`Min–max`}],value:t,onValueChange:n}),code:`
import { ChartCard, BoxPlotTable, BoxPlot, type BoxPlotGroup } from "@sheenui/theme";

// Raw page-load samples in ms (a sample; yours has hundreds per region)
const regions: BoxPlotGroup[] = [
  { label: "Europe", values: [610, 702, 760, 815, 840, 905, 980, 1100, 1480] },
  { label: "North America", values: [580, 660, 720, 770, 810, 860, 930, 1020, 1390] },
  { label: "Asia Pacific", values: [700, 830, 940, 1010, 1090, 1180, 1300, 1560, 2100] },
  { label: "Africa", values: [900, 1080, 1210, 1350, 1420, 1530, 1700, 1990, 2600] },
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="Page load by region"
      table={<BoxPlotTable data={regions} whisker={1.5} format={ms} caption="Page load statistics by region" />}
    >
      <BoxPlot
        data={regions}
        whisker={1.5}
        showMean
        format={ms}
        valueLabel="Load time"
        aria-label="Page load times by region"
      />
    </ChartCard>
  );
}`,children:(0,w.jsx)(r,{className:`w-full ${v}`,title:`Page load by region`,description:`Last 7 days, 240 visits per region`,table:(0,w.jsx)(l,{data:e,whisker:i,format:_,caption:`Page load statistics by region`}),children:(0,w.jsx)(u,{data:e,whisker:i,showMean:!0,format:_,valueLabel:`Load time`,"aria-label":`Page load times by region`})})})}function A(e,{rootMargin:t=`150px 0px`,fallbackMs:n=2e4}={}){return new Promise(r=>{let i=typeof document>`u`?null:document.getElementById(e);if(!i||typeof IntersectionObserver>`u`){r();return}let a=()=>{o.disconnect(),window.clearTimeout(s),r()},o=new IntersectionObserver(e=>e.some(e=>e.isIntersecting)&&a(),{rootMargin:t}),s=window.setTimeout(a,n);o.observe(i)})}y(()=>A(`histogram-latency`).then(()=>b(()=>import(`./histogram-latency-Bk5djxqQ.js`),[])).then(e=>e.LatencyExample),{minHeight:`34rem`});function j(){let e=(0,C.useMemo)(()=>T(),[]);return(0,w.jsxs)(a,{eyebrow:`Chart`,title:`Box plot & violin`,description:`Compare distributions across groups. The box spans the middle 50% with the median as a gap, whiskers reach the furthest values within 1.5 IQR, and outliers sit beyond, dodged so none hides another. The violin variant shows the full shape, so two-peaked groups can't hide behind a tidy box.`,source:[`${g}box-plot.tsx`,`${g}histogram.tsx`],children:[(0,w.jsx)(d,{label:`Box plot demo`,title:`Page load by region`,hue:1,height:`18.75rem`,narrowHeight:`19.375rem`,children:(0,w.jsx)(u,{data:e,showMean:!0,format:_,valueLabel:`Load time`,"aria-label":`Page load times by region`})}),(0,w.jsx)(k,{}),(0,w.jsx)(O,{}),(0,w.jsx)(c,{title:`Precomputed, sideways, one group emphasized`,description:`Pass a summary when you only have the statistics. orientation="horizontal" lays groups out as rows; a group's own color picks it out from the rest.`,variant:`bare`,code:`
import { BoxPlot } from "@sheenui/theme";

<BoxPlot
  orientation="horizontal"
  color={7}
  data={[
    { label: "Parcelly", summary: { low: 1, q1: 2, median: 2.5, q3: 3, high: 4.5, n: 1840, outliers: [6, 7, 9] } },
    { label: "SwiftPost", summary: { low: 1, q1: 1.5, median: 2, q3: 2.5, high: 4, n: 2210, outliers: [5.5] } },
    { label: "RoadRunner", color: 8, summary: { low: 2, q1: 3, median: 4, q3: 5, high: 7.5, n: 960, outliers: [10, 11] } },
    { label: "Postal", summary: { low: 2, q1: 3, median: 3.5, q3: 4, high: 5.5, n: 3120 } },
  ]}
  format={(n) => \`\${n} d\`}
  includeZero
  aria-label="Delivery time by carrier"
/>`,children:(0,w.jsx)(r,{className:v,title:`Delivery time`,description:`Days from dispatch, by carrier`,table:(0,w.jsx)(l,{data:D,format:h,caption:`Delivery time by carrier`}),children:(0,w.jsx)(u,{orientation:`horizontal`,color:7,data:D,format:h,includeZero:!0,"aria-label":`Delivery time by carrier`})})}),(0,w.jsx)(s,{of:x}),(0,w.jsx)(s,{as:`h2`,title:`BoxPlotTable props`,of:S}),(0,w.jsx)(o,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`Arrow keys`,`Along the group axis: move between groups. Along the value axis: step through the focused group's outliers.`],[`Home / End`,`Jump to the first / last group.`],[`Escape`,`Clear the reading.`]]}),(0,w.jsx)(i,{notes:[`The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the group's statistics.`,`BoxPlotTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists n, quartiles, median, mean and outliers.`,`With reduced motion on, the boxes and whiskers start at their final values and a data change jumps straight to the new state.`]})]})}export{j as default};