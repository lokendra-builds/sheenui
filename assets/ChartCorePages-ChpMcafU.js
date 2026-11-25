import{t as e}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{t}from"./bar-chart-BnRpITIe.js";import{i as n}from"./chart-figure-BAmJknKz.js";import{o as r}from"./legend-tooltip-B7LDwC_I.js";import{t as i}from"./ExampleChartCard-DOQs1ydL.js";import{t as a}from"./Example-DMEbQwm9.js";import{t as o}from"./lazy-block-BfzH_8EP.js";import{t as s}from"./heading-ids-DIjAy6ga.js";import{n as c}from"./LazyAbout-B679Tom9.js";import{n as l,r as u}from"./Page-DQ8sr8qt.js";import{t as d}from"./router-gsYXKOBR.js";import{t as f}from"./BarChart-BQ9HSay_.js";import{t as p}from"./vendor-react-D30i__oY.js";import{t as m}from"./preload-helper-BrmCrVM7.js";var h=[[`data`,`readonly ChartRow[]`,``,"The rows to show: one object per row, holding the `index` key and one number per series key.",!0],[`index`,`string`,``,`The key in each row that names the row, such as "month". It becomes the first column.`,!0],[`series`,`readonly CompareSeries[]`,``,"Series to list as columns; one with a `compareKey` also gets a previous-period column.",!0],[`format`,`((n: number) => string)`,`formatCompact`,`Formats each number in the table cells.`,!1],[`indexLabel`,`string`,``,"Header of the first column; the `index` key when left out.",!1],[`caption`,`string`,``,`Visually hidden caption naming the table for screen readers.`,!1],[`labels`,`Partial<ChartTableLabels>`,`defaultChartTableLabels`,'Text for i18n (defaults come from the enclosing ChartCard\'s labels, else English). Every other string, for translation: `labels={{ noData: "…" }}`; omitted keys keep the English of `defaultChartTableLabels`. All 2 keys of `ChartTableLabels` are listed in the key table under the props table.',!1,{type:`ChartTableLabels`,const:`defaultChartTableLabels`,keys:[[`noData`,`No data`],[`previous`,"(label: string) => `${label} (previous)`"]]}]],g=p(),_=o(()=>m(()=>import(`./ChartPatternsDemos-BIHMCzGs.js`).then(e=>e.BarPatternsDemo),[]),{minHeight:`22rem`}),v=`theme/src/components/charts`,y=[`Nov`,`Dec`,`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`];y.map((e,t)=>({month:e,organic:Math.round(42e3+t*3100+Math.sin(t*1.3)*4200),paid:Math.round(28e3+t*1900+Math.cos(t*.9)*3600),referral:Math.round(12e3+t*1300+Math.sin(t*.7+1)*2200)})),y.map((e,t)=>({month:e,visits:Math.round(9e3+t*820+Math.sin(t*1.2)*1100)}));var b=y.slice(-6).map((e,t)=>({month:e,free:820-t*30,pro:310+t*48,team:90+t*21})),x=[{key:`free`,label:`Free`,color:1},{key:`pro`,label:`Pro`,color:2},{key:`team`,label:`Team`,color:3}],S=[{country:`United States`,visitors:48200},{country:`India`,visitors:31400},{country:`Germany`,visitors:22900},{country:`Brazil`,visitors:17600},{country:`Japan`,visitors:12100}],C=[{key:`visitors`,label:`Visitors`,color:1}],w=[[`Tab`,`Move through the Chart / Table tabs, then the legend keys, then the chart itself.`],[`← → (↑ ↓)`,`Read the previous or next point; the values are announced.`],[`Home / End`,`Jump to the first or last point.`],[`Escape`,`Clear the active point.`],[`Enter / Space on a legend key`,`Hide or show that series.`]],T=[`Tab focuses the chart as one stop; the arrow keys read one category at a time and announce each series value in it.`,`The Chart / Table tabs switch to a BarTable: one row per category, one column per series, with a caption and row headers; negative values keep their sign.`,`With more than three series (or patterns) the bars get hatch fills, so the legend works without color.`,`Reduced motion: bars appear at their final length and data changes jump.`];function E({children:e}){return(0,g.jsx)(`div`,{className:`flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty`,children:e})}function D({items:e}){return(0,g.jsx)(g.Fragment,{children:e.map(([t,n],r)=>(0,g.jsxs)(`span`,{children:[r>0&&(r===e.length-1?` and `:`, `),(0,g.jsx)(`a`,{href:d(t),className:`font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg`,children:n})]},t))})}function O({title:e,children:t}){return(0,g.jsxs)(`section`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(`h2`,{id:s(e),className:`text-xl font-semibold tracking-tight`,children:e}),(0,g.jsx)(E,{children:t})]})}function k(){return(0,g.jsxs)(l,{eyebrow:`Chart`,title:`Bar chart`,description:`Rounded bars that grow from the baseline, in grouped, stacked and horizontal layouts.`,source:`${v}/bar-chart.tsx`,keyboard:w,a11y:T,children:[(0,g.jsx)(e,{label:`Bar chart demo`,title:`Customers per plan`,hue:1,height:`16.25rem`,legend:r(x,`rect`),children:(0,g.jsx)(t,{stacked:!0,data:b,index:`month`,series:x,"aria-label":`Customers per plan, stacked`})}),(0,g.jsx)(a,{title:`Stacked bars: customers per plan`,description:`Stacked bars show the total and the split in one mark.`,variant:`bare`,code:`
import { BarChart, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
  { month: "Aug", free: 730, pro: 454, team: 153 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return <BarChart stacked data={plans} index="month" series={planSeries} aria-label="Customers per plan, stacked" />;
}`,children:(0,g.jsx)(i,{className:`w-full`,title:`Customers per plan`,description:`Last six months`,legend:r(x,`rect`),table:(0,g.jsx)(n,{data:b,index:`month`,indexLabel:`Month`,series:x}),children:(0,g.jsx)(t,{stacked:!0,data:b,index:`month`,series:x,"aria-label":`Customers per plan, stacked`})})}),(0,g.jsx)(a,{title:`Horizontal bars`,description:`Best for long category names. Values sit at the tip of each bar.`,variant:`bare`,code:`
import { BarChart, type ChartSeries } from "@sheenui/theme";

const countries = [
  { country: "United States", visitors: 48200 },
  { country: "Germany", visitors: 21400 },
  { country: "India", visitors: 18900 },
  { country: "United Kingdom", visitors: 15300 },
  { country: "Brazil", visitors: 9800 },
];
const series: ChartSeries[] = [{ key: "visitors", label: "Visitors", color: 1 }];

export function Example() {
  return <BarChart layout="horizontal" showValues data={countries} index="country" series={series} aria-label="Visitors by country" />;
}`,children:(0,g.jsx)(i,{className:`w-full`,title:`Top countries`,description:`Visitors this month`,table:(0,g.jsx)(n,{data:S,index:`country`,indexLabel:`Country`,series:C}),children:(0,g.jsx)(t,{layout:`horizontal`,showValues:!0,data:S,index:`country`,series:C,"aria-label":`Visitors by country`})})}),(0,g.jsx)(a,{title:`Patterns`,description:`Hatch fills tell the series apart without colour. They switch on by themselves above three series; pass patterns to force them, and give seriesLegend the same flag so the legend swatches match.`,variant:`bare`,code:`
import { BarChart, ChartCard, ChartTable, seriesLegend, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Customers per plan"
      legend={seriesLegend(planSeries, "rect", true)}
      table={<ChartTable data={plans} index="month" indexLabel="Month" series={planSeries} />}
    >
      <BarChart patterns data={plans} index="month" series={planSeries} aria-label="Customers per plan, hatched" />
    </ChartCard>
  );
}`,children:(0,g.jsx)(_,{})}),(0,g.jsx)(u,{of:f,title:`BarChart props`}),(0,g.jsx)(u,{of:h,title:`BarTable props`}),(0,g.jsxs)(O,{title:`When to use a bar chart`,children:[(0,g.jsx)(`p`,{children:`Use a React bar chart to compare values across categories: plans, countries, products or weeks. Bars start at zero, so their lengths compare honestly. Choose grouped bars to compare series side by side, stacked bars to show a total and its parts, and horizontal bars when the labels are long.`}),(0,g.jsxs)(`p`,{children:[`For a ranked list with inline values try `,(0,g.jsx)(D,{items:[[`/charts/bar-list`,`the bar list`]]}),`; for positive and negative values, `,(0,g.jsx)(D,{items:[[`/charts/diverging-bar`,`the diverging bar chart`]]}),`; for shares that always add up to 100 percent,`,` `,(0,g.jsx)(D,{items:[[`/charts/percent-stacked-bar-chart`,`the 100% stacked bars`]]}),`. A trend over time reads better in `,(0,g.jsx)(D,{items:[[`/charts/line-chart`,`a line chart`]]}),`.`]})]}),(0,g.jsx)(c,{items:[{q:`How do I make a stacked or horizontal bar chart in React?`,a:`Pass stacked for stacked bars and layout="horizontal" for horizontal ones; showValues prints the value at the tip of each bar.`},{q:`Are the bars readable by screen readers?`,a:`Yes. The chart is a focusable group, the arrow keys read one category at a time, and the Table tab holds the same data.`},{q:`Grouped, stacked or horizontal bars?`,a:`Grouped (the default) compares series within a category. Stacked compares totals, but only the bottom segment sits on a common baseline, so the upper ones are hard to compare. Horizontal (layout="horizontal") suits long category names and rankings.`},{q:`Can bars show the previous period?`,a:`Yes. Give a series a compareKey and each bar gets a mark at the previous value. This works for unstacked bars; stacked bars do not draw it.`},{q:`Does the value axis start at zero?`,a:`Yes. Bar length is the encoding, so the baseline stays at zero; a truncated bar axis misleads. For values far from zero use a line chart with zero set to false.`},{q:`How are negative values drawn?`,a:`Below the baseline. The Table tab shows the signed number, so the direction never depends on the bar alone.`},{q:`What does the Table tab contain?`,a:`A real table made with BarTable: one row per category, one column per series, a caption, column headers and row headers. With more than three series the bars also get hatch patterns, so the legend does not rely on color alone.`}]})]})}export{k as default};