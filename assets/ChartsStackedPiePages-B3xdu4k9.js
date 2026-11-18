import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{C as r}from"./chart-utils-BFWLftEL.js";import{i,n as a,t as o}from"./pie-chart-D5J0UDxT.js";import{t as s}from"./ExampleChartCard-ZE1sKvmi.js";import{i as c,n as l,o as u,r as d}from"./Page-BRuP8nt1.js";import{t as f}from"./Example-DaSezASZ.js";import{t as p}from"./lazy-block-BfzH_8EP.js";import{n as m}from"./stage-cYDMR3OY.js";import{r as h,t as g}from"./shared-C8b7HlDv.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`data`,`readonly PieSlice[]`,``,'Part-to-whole only. Past `maxSlices`, the smallest slices fold into one "Other" slice.',!0],[`maxSlices`,`number`,`6`,`At most this many slices are drawn (2–6).`,!1],[`height`,`number`,`260`,`Height of the pie area (the legend sits below it).`,!1],[`outerLabels`,`boolean`,`true`,`Name each slice outside the pie with a leader line, only where the label fits without colliding.`,!1],[`legend`,`boolean`,`true`,`Legend under the pie with each slice's share.`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats values in the tooltip and legend.`,!1],[`formatPercent`,`((n: number) => string)`,`defaultFormatPercent`,`Formats each share (a number from 0 to 100) for the labels and tooltip.`,!1],[`emptyState`,`ReactNode`,`labels.noData`,`Shown instead of the pie when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when data.length > 3`,`Tell slices apart without colour (hatch fills).`,!1],[`labels`,`Partial<PieChartLabels>`,`defaultPieChartLabels`,'Every other string, for translation: `labels={{ other: "…" }}`; omitted keys keep the English of `defaultPieChartLabels`. All 10 keys of `PieChartLabels` are listed in the key table under the props table.',!1,{type:`PieChartLabels`,const:`defaultPieChartLabels`,keys:[[`other`,`Other`],[`inOther`,`in Other`],[`more`,`more`],[`slice`,`Slice`],[`value`,`Value`],[`share`,`Share`],[`total`,`Total`],[`noData`,`No data`],[`instructions`,`Use arrow keys to read each slice.`],[`touchHint`,`Tap a slice to read it.`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`data`,`readonly PieSlice[]`,``,`Takes the same slices as the chart.`,!0],[`maxSlices`,`number`,`6`,`Same as the chart's, so the table marks which rows the chart folds into "Other".`,!1],[`format`,`((n: number) => string)`,`formatCompact`,`Formats a value for the data table cells: takes the number, returns the text shown.`,!1],[`formatPercent`,`((n: number) => string)`,`defaultFormatPercent`,`Formats a share (0–100) for the data table cells: takes the share, returns the text shown.`,!1],[`indexLabel`,`string`,`labels.slice`,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Sets a visually hidden caption that names the table.`,!1],[`labels`,`Partial<PieChartLabels>`,`defaultPieChartLabels`,'Every other string, for translation: `labels={{ other: "…" }}`; omitted keys keep the English of `defaultPieChartLabels`. All 10 keys of `PieChartLabels` are listed in the key table under the props table.',!1,{type:`PieChartLabels`,const:`defaultPieChartLabels`,keys:[[`other`,`Other`],[`inOther`,`in Other`],[`more`,`more`],[`slice`,`Slice`],[`value`,`Value`],[`share`,`Share`],[`total`,`Total`],[`noData`,`No data`],[`instructions`,`Use arrow keys to read each slice.`],[`touchHint`,`Tap a slice to read it.`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],b=e(t()),x=n();[`Q1 ’24`,`Q2 ’24`,`Q3 ’24`,`Q4 ’24`,`Q1 ’25`,`Q2 ’25`,`Q3 ’25`,`Q4 ’25`].map((e,t)=>({quarter:e,desktop:Math.round(52e3-t*3100+Math.sin(t)*1200),mobile:Math.round(31e3+t*3900+Math.cos(t*.7)*1500),tablet:Math.round(7e3-t*260+Math.sin(t*1.4)*400)})).find(e=>e.mobile>e.desktop)?.quarter;function S(e){let t=h(e),n=e=>Math.round(e*(.75+t()*.5));return[{label:`Chrome`,value:n(612e3),color:1},{label:`Safari`,value:n(198e3),color:2},{label:`Edge`,value:n(53e3),color:3},{label:`Firefox`,value:n(34e3),color:4},{label:`Other mobile`,value:n(26e3),color:5},{label:`Opera`,value:n(22e3),color:6},{label:`Brave`,value:n(11e3),color:7},{label:`UC Browser`,value:n(9e3),color:8}]}var C=[{label:`Photos`,value:182,color:1},{label:`Video`,value:96,color:2},{label:`Apps`,value:58,color:3},{label:`Documents`,value:21,color:4}],w=e=>`${r(e)} GB`,T=[{label:`Photos`,value:182}],E=p(()=>_(()=>import(`./ChartPatternsDemos-D9qpd_0b.js`).then(e=>e.PiePatternsDemo),[]),{minHeight:`22rem`});function D(){let[e,t]=(0,b.useState)(1),n=S(e),r=i(n);return(0,x.jsxs)(l,{eyebrow:`Chart`,title:`Pie chart`,description:`Part-to-whole at a glance, never more than 6 slices: past that, the smallest fold into “Other”. Names sit outside the pie on leader lines only where they fit without colliding; the legend always carries every slice.`,source:`theme/src/components/charts/pie-chart.tsx`,children:[(0,x.jsx)(m,{}),(0,x.jsx)(f,{title:`Folding into “Other”`,description:`8 browsers, ${r.length} slices: the top five keep their color slot and the rest fold into a neutral “Other”, whose tooltip lists what's inside. The table view keeps every row.`,variant:`bare`,controls:(0,x.jsx)(g,{onClick:()=>t(e=>e+1)}),code:`
import { ChartCard, PieTable, PieChart, type PieSlice } from "@sheenui/theme";

const data: PieSlice[] = [
  { label: "Chrome", value: 612000, color: 1 },
  { label: "Safari", value: 198000, color: 2 },
  { label: "Edge", value: 53000, color: 3 },
  { label: "Firefox", value: 34000, color: 4 },
  { label: "Other mobile", value: 26000, color: 5 },
  { label: "Opera", value: 22000, color: 6 },
  { label: "Brave", value: 11000, color: 7 },
  { label: "UC Browser", value: 9000, color: 8 },
]; // the smallest fold into "Other"

export function Example() {
  return (
    <ChartCard
      title="Visits by browser"
      table={<PieTable data={data} indexLabel="Browser" />}
    >
      <PieChart data={data} aria-label="Monthly visits by browser" />
    </ChartCard>
  );
}`,children:(0,x.jsx)(s,{className:`w-full`,title:`Visits by browser`,description:`Last 30 days`,table:(0,x.jsx)(a,{data:n,indexLabel:`Browser`,caption:`Visits by browser, last 30 days`}),children:(0,x.jsx)(o,{data:n,height:280,"aria-label":`Visits by browser in the last 30 days`})})}),(0,x.jsxs)(f,{title:`Compact`,description:`In a narrow card the labels step aside for the legend, and the tooltip docks above the pie, clear of your finger.`,variant:`bare`,stageClassName:`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`,code:`
import { formatCompact, PieChart, type PieSlice } from "@sheenui/theme";

const gb = (n: number) => formatCompact(n) + " GB";
const storage: PieSlice[] = [
  { label: "Photos", value: 182, color: 1 },
  { label: "Video", value: 96, color: 2 },
  { label: "Apps", value: 58, color: 3 },
  { label: "Documents", value: 21, color: 4 },
];

export function Example() {
  return (
    <>
      <PieChart data={storage} format={gb} outerLabels={false} height={200} aria-label="Storage used by type" />
      <PieChart data={[{ label: "Photos", value: 182 }]} format={gb} height={200} aria-label="Storage used by type (photos only)" /> {/* one slice: a full disc */}
      <PieChart data={[]} aria-label="Storage used by type" emptyState="Nothing stored yet" />
    </>
  );
}`,children:[(0,x.jsx)(s,{title:`Storage`,description:`236 GB of 512 GB`,table:(0,x.jsx)(a,{data:C,format:w,indexLabel:`Type`,caption:`Storage used by type`}),children:(0,x.jsx)(o,{data:C,format:w,outerLabels:!1,height:200,"aria-label":`Storage used by type`})}),(0,x.jsx)(s,{title:`One slice`,description:`Only photos so far`,table:(0,x.jsx)(a,{data:T,format:w,indexLabel:`Type`,caption:`Storage used by type (photos only)`}),children:(0,x.jsx)(o,{data:T,format:w,height:200,"aria-label":`Storage used by type`})}),(0,x.jsx)(s,{title:`Empty`,table:(0,x.jsx)(a,{data:[],indexLabel:`Type`,caption:`Storage used by type (empty)`}),children:(0,x.jsx)(o,{data:[],height:200,emptyState:`Nothing stored yet`,"aria-label":`Storage used by type`})})]}),(0,x.jsx)(f,{title:`Patterns`,description:`Hatch fills tell the slices apart without colour. They switch on by themselves above three slices; pass patterns to force them. The legend swatches carry the same hatch.`,variant:`bare`,code:`
import { ChartCard, PieChart, PieTable } from "@sheenui/theme";

const browsers = [
  { label: "Chrome", value: 62 },
  { label: "Safari", value: 21 },
  { label: "Firefox", value: 9 },
];

export function Example() {
  return (
    <ChartCard title="Browser share" table={<PieTable data={browsers} indexLabel="Browser" caption="Browser share" />}>
      <PieChart patterns data={browsers} aria-label="Browser share, hatched" />
    </ChartCard>
  );
}`,children:(0,x.jsx)(E,{})}),(0,x.jsx)(d,{title:`PieChart props`,of:v,rows:[[`PieTable`,`{ data, maxSlices?, format?, formatPercent?, indexLabel?, caption?, labels? }`,``,`Table view: every row, its value and share, marking rows drawn inside “Other”.`],[`foldSlices(data, maxSlices?)`,`FoldedSlice[]`,``,`The slices exactly as the chart draws them (id, label, value, share, color, slot, members).`]]}),(0,x.jsx)(d,{as:`h2`,title:`PieTable props`,of:y}),(0,x.jsxs)(`section`,{"aria-labelledby":`pie-when-not`,className:`flex flex-col gap-2`,children:[(0,x.jsx)(`h2`,{id:`pie-when-not`,className:`text-xl font-semibold tracking-tight`,children:`When not to use a pie`}),(0,x.jsx)(`p`,{className:`max-w-3xl text-sm text-pretty text-sheen-fg-muted`,children:`To compare close values, or to show change over time, use bars or lines. Two slices read better as a single number or a meter.`})]}),(0,x.jsx)(u,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`→ / ↓`,`Next slice.`],[`← / ↑`,`Previous slice.`],[`Home / End`,`Jump to the first / last slice.`],[`Escape`,`Clear the reading.`]]}),(0,x.jsx)(c,{notes:[`The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Each move announces the slice, its value and its share.`,`PieTable is the table view and lists every original row, including slices folded into “Other”.`,`Under reduced motion nothing morphs: the slices render at their final angles and new data replaces the old at once.`]})]})}export{D as default};