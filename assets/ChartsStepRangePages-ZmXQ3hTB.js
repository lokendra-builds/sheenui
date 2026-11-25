import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{i as r}from"./chart-figure-BAmJknKz.js";import{C as i}from"./chart-utils-DvmgVWft.js";import{o as a}from"./legend-tooltip-B7LDwC_I.js";import{t as o}from"./step-line-chart-DK6Lurvn.js";import{t as s}from"./ExampleChartCard-DOQs1ydL.js";import{i as c,n as l,o as u,r as d}from"./Page-y_OVkLtr.js";import{t as f}from"./Example-B3x8pgFu.js";import{t as p}from"./Segmented-kx7yHseo.js";import{t as m}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{t as h}from"./shared-CwZXbVMJ.js";var g=[[`data`,`readonly ChartRow[]`,``,"One object per point: the `index` key plus one number per series key.",!0],[`index`,`string`,``,`Key of the x value in each row (e.g. "month").`,!0],[`series`,`readonly ChartSeries[]`,``,"The lines to draw. Give each a fixed `color` slot so filtering never repaints it.",!0],[`curve`,`StepCurve`,`"step-after"`,`Where each value's label sits on its step.`,!1],[`area`,`boolean`,`false`,`Fill under each line with a soft 10% wash.`,!1],[`zero`,`boolean`,`true`,"Keep zero on the value axis. Turn off for levels far from zero (prices, rates), so the steps aren't squashed into the top of the plot. Always on with `area`.",!1],[`height`,`number`,`260`,`Height of the chart in px; the width follows the container.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats values in the tooltip and labels, and on the axis (the default axis format follows the tick step).`,!1],[`endLabels`,`boolean`,`true`,`Label the end of each line (2–4 series, when the chart is wide enough and the labels don't collide).`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<StepLineChartLabels>`,`defaultStepLineChartLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultStepLineChartLabels`. Its only key is listed in the key table under the props table.',!1,{type:`StepLineChartLabels`,const:`defaultStepLineChartLabels`,keys:[[`instructions`,`Use left and right arrow keys to read values.`]]}],[`aria-label`,`string`,``,`Accessible summary of what the chart shows.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],_=[[`data`,`readonly ChartRow[]`,``,"The rows to show: one object per row, holding the `index` key and one number per series key.",!0],[`index`,`string`,``,`The key in each row that names the row, such as "month". It becomes the first column.`,!0],[`series`,`readonly CompareSeries[]`,``,"Series to list as columns; one with a `compareKey` also gets a previous-period column.",!0],[`format`,`((n: number) => string)`,`formatCompact`,`Formats each number in the table cells.`,!1],[`indexLabel`,`string`,``,"Header of the first column; the `index` key when left out.",!1],[`caption`,`string`,``,`Visually hidden caption naming the table for screen readers.`,!1],[`labels`,`Partial<ChartTableLabels>`,`defaultChartTableLabels`,'Text for i18n (defaults come from the enclosing ChartCard\'s labels, else English). Every other string, for translation: `labels={{ noData: "…" }}`; omitted keys keep the English of `defaultChartTableLabels`. All 2 keys of `ChartTableLabels` are listed in the key table under the props table.',!1,{type:`ChartTableLabels`,const:`defaultChartTableLabels`,keys:[[`noData`,`No data`],[`previous`,"(label: string) => `${label} (previous)`"]]}]],v=e(t()),y=n(),b=[`Nov`,`Dec`,`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`],x=b.map((e,t)=>({month:e,pro:t<3?42:t<7?45:48,team:t<4?50:t<9?54:57,enterprise:t<6?60:66})),S=[{key:`enterprise`,label:`Enterprise`,color:3},{key:`team`,label:`Team`,color:2},{key:`pro`,label:`Pro`,color:1}],C=b.map((e,t)=>({month:e,seats:[120,120,135,135,150,180,180,210,210,240,236,262][t]??0})),w=[{key:`seats`,label:`Seats`,color:1}],T=[{value:`step-after`,label:`After`},{value:`step`,label:`Middle`},{value:`step-before`,label:`Before`}];function E(){let[e,t]=(0,v.useState)(`step-after`),[n,b]=(0,v.useState)(`data`),E=e=>`$${i(e)}`;return(0,y.jsxs)(l,{eyebrow:`Chart`,title:`Step line chart`,description:`For values that hold, then jump: prices, plan limits, rates, headcount. Each value stays flat for exactly one step, so the hover band shows how long it held and the crosshair snaps to the step under the pointer.`,source:`${h}step-line-chart.tsx`,children:[(0,y.jsx)(m,{label:`Step line chart demo`,title:`Price per seat`,hue:3,height:`16.25rem`,legend:a(S,`line`),children:(0,y.jsx)(o,{curve:`step-after`,zero:!1,data:x,index:`month`,series:S,format:E,"aria-label":`Monthly price per seat, by plan`})}),(0,y.jsx)(f,{title:`Price changes`,description:`The curve sets where each label sits on its step: "step-after" (the value starts at its label), "step" (mid-step) or "step-before" (the value is reached at its label). The line is the same; only the anchors move. Prices sit far from zero, so zero={false} lets the axis hug them instead of squashing every step into the top of the plot.`,variant:`bare`,controls:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(p,{label:`Step position`,size:`sm`,options:T,value:e,onValueChange:t}),(0,y.jsx)(p,{label:`Value axis`,size:`sm`,options:[{value:`data`,label:`Hug the data`},{value:`zero`,label:`From zero`}],value:n,onValueChange:b})]}),code:`
import { StepLineChart, formatCompact, type ChartSeries } from "@sheenui/theme";

const pricing = [
  { month: "Jan", pro: 42, team: 50, enterprise: 60 },
  { month: "Feb", pro: 45, team: 50, enterprise: 60 },
  { month: "Mar", pro: 45, team: 54, enterprise: 60 },
  { month: "Apr", pro: 45, team: 54, enterprise: 66 },
  { month: "May", pro: 48, team: 57, enterprise: 66 },
];

const series: ChartSeries[] = [
  { key: "enterprise", label: "Enterprise", color: 3 },
  { key: "team", label: "Team", color: 2 },
  { key: "pro", label: "Pro", color: 1 },
];

export function Example() {
  return (
    <StepLineChart
      curve="step-after"
      zero={false}
      data={pricing}
      index="month"
      series={series}
      format={(n) => "$" + formatCompact(n)}
      aria-label="Monthly price per seat, by plan"
    />
  );
}`,children:(0,y.jsx)(s,{className:`w-full`,title:`Price per seat`,description:`Monthly list price by plan, US$`,legend:a(S,`line`),table:(0,y.jsx)(r,{data:x,index:`month`,indexLabel:`Month`,series:S,format:E}),children:(0,y.jsx)(o,{curve:e,zero:n===`zero`,data:x,index:`month`,series:S,format:E,"aria-label":`Monthly price per seat, by plan`})})}),(0,y.jsx)(f,{title:`With an area wash`,description:`One series, so no legend: the title names it. area keeps zero on the axis, so the wash fills to a real baseline.`,variant:`bare`,code:`
import { StepLineChart } from "@sheenui/theme";

const seats = [
  { month: "Jan", seats: 120 },
  { month: "Feb", seats: 135 },
  { month: "Mar", seats: 150 },
  { month: "Apr", seats: 180 },
  { month: "May", seats: 210 },
  { month: "Jun", seats: 262 },
];

export function Example() {
  return (
    <StepLineChart
      area
      curve="step-before"
      data={seats}
      index="month"
      series={[{ key: "seats", label: "Seats" }]}
      aria-label="Licensed seats at the end of each month"
    />
  );
}`,children:(0,y.jsx)(s,{className:`w-full`,title:`Licensed seats`,description:`At the end of each month`,aside:(0,y.jsxs)(`span`,{className:`text-2xl font-semibold tracking-tight`,children:[C[C.length-1]?.seats,` seats`]}),table:(0,y.jsx)(r,{data:C,index:`month`,indexLabel:`Month`,series:w}),children:(0,y.jsx)(o,{area:!0,curve:`step-before`,data:C,index:`month`,series:w,"aria-label":`Licensed seats at the end of each month`})})}),(0,y.jsx)(d,{of:g}),(0,y.jsx)(d,{as:`h2`,title:`StepLineTable props`,of:_}),(0,y.jsx)(u,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`← / → (↑ / ↓)`,`Previous / next point.`],[`Home / End`,`Jump to the first / last point.`],[`Escape`,`Clear the reading.`]]}),(0,y.jsx)(c,{notes:[`The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the point and its values.`,`StepLineTable is the table view (the same table as ChartTable): pass it as the ChartCard table prop. The Chart / Table tabs put every value in text, so none depends on color.`,`Reduced motion: the steps appear at their final values and data changes jump instead of morphing.`]})]})}export{E as default};