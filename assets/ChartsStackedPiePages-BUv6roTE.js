import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{o as r}from"./legend-tooltip-B7LDwC_I.js";import{n as i,t as a}from"./percent-bar-chart-ChfDJbFY.js";import{t as o}from"./ExampleChartCard-DOQs1ydL.js";import{i as s,n as c,o as l,r as u}from"./Page-DQ8sr8qt.js";import{t as d}from"./Example-DMEbQwm9.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./stage-BOHXGlpC.js";import{r as m,t as h}from"./shared-C_d162MH.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`data`,`readonly ChartRow[]`,``,"One object per bar: the `index` key plus one number per series key (shares are worked out for you).",!0],[`index`,`string`,``,`Sets the key of the category in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,"Segments, from the baseline outwards. Give each a fixed `color` slot.",!0],[`layout`,`"horizontal" | "vertical"`,`"horizontal"`,`"horizontal" = bars from the left (best for long names); "vertical" = columns.`,!1],[`showValues`,`boolean`,`false`,`Print each share inside its segment, only where it fits with room to spare.`,!1],[`height`,`number`,`40px a row`,`Plot height. Horizontal bars default to 40px a row.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats raw values (tooltip, table). Negative values count as 0.`,!1],[`formatPercent`,`((n: number) => string)`,`defaultFormatPercent`,`Formats shares, 0–100 (axis, labels, tooltip).`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when series.length > 3`,`Tell series apart without colour (hatch fills).`,!1],[`labels`,`Partial<PercentBarChartLabels>`,`defaultPercentBarChartLabels`,'Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultPercentBarChartLabels`. All 4 keys of `PercentBarChartLabels` are listed in the key table under the props table.',!1,{type:`PercentBarChartLabels`,const:`defaultPercentBarChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`],[`instructions`,`Use arrow keys to move between bars and their segments.`],[`touchHint`,`Tap a bar to read its shares.`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],v=[[`data`,`readonly ChartRow[]`,``,`Takes the same rows as the chart.`,!0],[`index`,`string`,``,`Key of each row that names its bar.`,!0],[`series`,`readonly ChartSeries[]`,``,`Takes the same series as the chart.`,!0],[`format`,`((n: number) => string)`,`formatCompact`,`Formats a value for the data table cells: takes the number, returns the text shown.`,!1],[`formatPercent`,`((n: number) => string)`,`defaultFormatPercent`,`Formats a share of the total for the data table cells: takes the share, returns the text shown.`,!1],[`indexLabel`,`string`,``,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Sets a visually hidden caption that names the table.`,!1],[`showTotal`,`boolean`,`true`,`Show a Total column (default true).`,!1],[`labels`,`Partial<Pick<PercentBarChartLabels, "total" | "noData">>`,`defaultPercentBarChartLabels`,'Override the "Total" column header and the empty text. Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultPercentBarChartLabels`. All 2 keys of `PercentBarChartLabels` are listed in the key table under the props table.',!1,{type:`PercentBarChartLabels`,const:`defaultPercentBarChartLabels`,keys:[[`total`,`Total`],[`noData`,`No data`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=e(t()),b=n(),x=[`Q1 ’24`,`Q2 ’24`,`Q3 ’24`,`Q4 ’24`,`Q1 ’25`,`Q2 ’25`,`Q3 ’25`,`Q4 ’25`].map((e,t)=>({quarter:e,desktop:Math.round(52e3-t*3100+Math.sin(t)*1200),mobile:Math.round(31e3+t*3900+Math.cos(t*.7)*1500),tablet:Math.round(7e3-t*260+Math.sin(t*1.4)*400)})),S=[{key:`desktop`,label:`Desktop`,color:1},{key:`mobile`,label:`Mobile`,color:2},{key:`tablet`,label:`Tablet`,color:3}];x.find(e=>e.mobile>e.desktop)?.quarter;function C(e){let t=m(e);return[{region:`North America`,free:4200,pro:2600,team:1400},{region:`Europe`,free:5100,pro:2100,team:900},{region:`Asia Pacific`,free:7400,pro:1500,team:600},{region:`Latin America`,free:2600,pro:700,team:180},{region:`Middle East & Africa`,free:1900,pro:420,team:90}].map(e=>({...e,free:Math.round(e.free*(.7+t()*.6)),pro:Math.round(e.pro*(.7+t()*.6)),team:Math.round(e.team*(.7+t()*.6))}))}var w=[{key:`free`,label:`Free`,color:1},{key:`pro`,label:`Pro`,color:2},{key:`team`,label:`Team`,color:3}],T=[{name:`Platform infrastructure and reliability`,building:52,meetings:30,support:18},{name:`Design`,building:61,meetings:31,support:8},{name:`New team`,building:0,meetings:0,support:0}],E=[{key:`building`,label:`Building`,color:1},{key:`meetings`,label:`Meetings`,color:2},{key:`support`,label:`Support`,color:3}],D=e=>`${e} h`;function O(){let[e,t]=(0,y.useState)(1),n=C(e);return(0,b.jsxs)(c,{eyebrow:`Chart`,title:`100% stacked bars`,description:`Compare the mix inside each category, whatever its size: every bar is scaled to 100%. Hover a segment (or walk them with the arrow keys) to see its share and the value behind it.`,source:`theme/src/components/charts/percent-bar-chart.tsx`,children:[(0,b.jsx)(p,{}),(0,b.jsx)(d,{title:`Horizontal, with shares`,description:`showValues prints a share inside a segment only when it fits with room to spare, on a surface chip that passes contrast on any color. Up/Down move between regions, Left/Right between segments.`,variant:`bare`,controls:(0,b.jsx)(h,{onClick:()=>t(e=>e+1)}),code:`
import { ChartCard, seriesLegend, PercentBarTable, PercentBarChart, type ChartSeries } from "@sheenui/theme";

const data = [
  { region: "North America", free: 4200, pro: 2600, team: 1400 },
  { region: "Europe", free: 5100, pro: 2100, team: 900 },
  { region: "Asia Pacific", free: 7400, pro: 1500, team: 600 },
  { region: "Latin America", free: 2600, pro: 700, team: 180 },
];
const series: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Plan mix by region"
      legend={seriesLegend(series, "rect")}
      table={<PercentBarTable data={data} index="region" series={series} />}
    >
      <PercentBarChart showValues data={data} index="region" series={series} aria-label="Share of customers on each plan, by region" />
    </ChartCard>
  );
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`Plan mix by region`,description:`Customers on each plan`,legend:r(w,`rect`),table:(0,b.jsx)(i,{data:n,index:`region`,indexLabel:`Region`,series:w,caption:`Customers on each plan by region`}),children:(0,b.jsx)(a,{showValues:!0,data:n,index:`region`,series:w,"aria-label":`Share of customers on each plan, by region`})})}),(0,b.jsx)(d,{title:`Vertical columns`,description:`layout="vertical". Left/Right move between quarters, Up/Down climb the stack.`,variant:`bare`,code:`
import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

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
  return <PercentBarChart layout="vertical" data={data} index="quarter" series={series} aria-label="Share of sessions by device" />;
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`Sessions by device`,legend:r(S,`rect`),table:(0,b.jsx)(i,{data:x,index:`quarter`,indexLabel:`Quarter`,series:S,caption:`Share of sessions by device, per quarter (columns)`}),children:(0,b.jsx)(a,{layout:`vertical`,data:x,index:`quarter`,series:S,"aria-label":`Share of sessions by device, per quarter`})})}),(0,b.jsx)(d,{title:`Zero rows and long names`,description:`A category whose values add up to 0 gets an empty track instead of a misleading bar; long names truncate (the full name is in the tooltip and the table).`,variant:`bare`,code:`
import { PercentBarChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "building", label: "Building", color: 1 },
  { key: "meetings", label: "Meetings", color: 2 },
  { key: "support", label: "Support", color: 3 },
];

export function Example() {
  return (
    <PercentBarChart
      showValues
      data={[
        { name: "Platform infrastructure and reliability", building: 52, meetings: 30, support: 18 },
        { name: "Design", building: 61, meetings: 31, support: 8 },
        { name: "New team", building: 0, meetings: 0, support: 0 }, // drawn as an empty track
      ]}
      index="name"
      series={series}
      format={(n) => n + " h"}
      aria-label="Share of time by activity, per team"
    />
  );
}`,children:(0,b.jsx)(o,{className:`w-full`,title:`Time spent by team`,legend:r(E,`rect`),table:(0,b.jsx)(i,{data:T,index:`name`,indexLabel:`Team`,series:E,format:D,caption:`Time spent by team, by activity`}),children:(0,b.jsx)(a,{showValues:!0,data:T,index:`name`,series:E,format:D,"aria-label":`Share of time by activity, per team`})})}),(0,b.jsx)(u,{title:`PercentBarChart props`,of:_}),(0,b.jsx)(u,{as:`h2`,title:`PercentBarTable props`,of:v}),(0,b.jsx)(l,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`← / →`,`Vertical layout: previous / next bar. Horizontal layout: previous / next segment of the bar.`],[`↑ / ↓`,`Vertical layout: previous / next segment of the bar. Horizontal layout: previous / next bar.`],[`Home / End`,`Jump to the first / last bar.`],[`Escape`,`Step out of a segment to the whole bar; press again to clear the reading.`]]}),(0,b.jsx)(s,{notes:[`Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Each move announces the segment's value and its share.`,`For a non-visual reading, give ChartCard's table prop a PercentBarTable; the Chart / Table tabs then expose each value as plain table cells.`,`With reduced motion on, the segments start at their final shares and a data change jumps straight to the new state.`]})]})}f(()=>g(()=>import(`./ChartPatternsDemos-CMHs8Ys9.js`).then(e=>e.PiePatternsDemo),[]),{minHeight:`22rem`});export{O as default};