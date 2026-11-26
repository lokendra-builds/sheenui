import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{t}from"./ExampleChartCard-DOQs1ydL.js";import{i as n,n as r,o as i,r as a}from"./Page-BAL5Idhy.js";import{t as o}from"./Example-BPfHvEYD.js";import{a as s,i as c,n as l,t as u}from"./dumbbell-chart-4nmHaRy5.js";import{n as d}from"./chart-tip-C3pjTuq3.js";import{c as f,o as p}from"./heatmap-CfSLIzN2.js";import{t as m}from"./chart-pointer-aVQSKRmx.js";import{c as h}from"./kit-B2GyabAB.js";import{i as g,t as _}from"./vendor-react-D30i__oY.js";import{t as v}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{t as y}from"./Segmented-kx7yHseo.js";import{n as b,t as x}from"./shared-Dbp0f8HM.js";var S=_();function C({data:e,sort:t=`none`,fromLabel:n,toLabel:r,format:i,formatPercent:a,locale:o,labels:c,caption:u,className:g}){let _={...l,...c},v=i??p(o),y=a??f(o),b=s(e,t,null),x=h;return(0,S.jsx)(d,{caption:u,className:g,emptyState:_.noData,columns:[{label:_.item},{label:n??_.from},{label:r??_.to},{label:_.change},{label:_.percentChange}],rows:b.map(e=>[e.label,m(v(e.from)),m(v(e.to)),e.diff===0?_.noChange:m(x(e.diff,v(e.diff))),Number.isFinite(e.ratio)&&e.diff!==0?m(x(e.ratio,y(e.ratio))):`–`])})}var w=[[`data`,`readonly DumbbellItem[]`,``,`Takes one item per row: { label, from, to }.`,!0],[`variant`,`"slope" | "dumbbell"`,`"dumbbell"`,`"dumbbell": a row per item, a dot at each end. "slope": two columns joined by a line per item.`,!1],[`fromLabel`,`string`,``,`Sets the name of the "before" end, e.g. "2024".`,!1],[`toLabel`,`string`,``,`Sets the name of the "after" end, e.g. "2025".`,!1],[`sort`,`"none" | "from" | "to" | "change"`,`"none"`,`Order of the items. "change" puts the biggest rise first.`,!1],[`higherIsBetter`,`boolean`,`true`,`Is a rise good (revenue) or bad (costs, churn)? Picks the status colour of the change.`,!1],[`change`,`"none" | "percent" | "absolute"`,`"absolute"`,`Show each item's change: "absolute" (+12), "percent" (+8%), or "none".`,!1],[`highlight`,`string | string[]`,``,`Emphasise these items (by label); the rest step back to grey.`,!1],[`color`,`ChartColor`,`1`,`Palette slot (1–8): the "after" dot in full, the "before" dot a lighter shade of it.`,!1],[`includeZero`,`boolean`,`false`,`Keep 0 on the value axis.`,!1],[`height`,`number`,`340`,`Height of a slope chart. Dumbbell rows grow with the items.`,!1],[`valueLabel`,`string`,``,`Names the value axis.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats percent changes (0.08 → "8%").`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<DumbbellChartLabels>`,`defaultDumbbellChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultDumbbellChartLabels`. All 10 keys of `DumbbellChartLabels` are listed in the key table under the props table.',!1,{type:`DumbbellChartLabels`,const:`defaultDumbbellChartLabels`,keys:[[`roleDescription`,`(slope) => (slope ? "slope chart" : "dumbbell chart")`],[`instructions`,`Use the up and down arrow keys to read each item.`],[`hint`,`Tap a row to read it`],[`from`,`Before`],[`to`,`After`],[`change`,`Change`],[`percentChange`,`% change`],[`noChange`,`No change`],[`item`,`Item`],[`noData`,`No data`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],T=[[`data`,`readonly DumbbellItem[]`,``,`Takes one item per row: { label, from, to }.`,!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`sort`,`"none" | "from" | "to" | "change"`,`"none"`,`Order of the items. "change" puts the biggest rise first.`,!1],[`labels`,`Partial<DumbbellChartLabels>`,`defaultDumbbellChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultDumbbellChartLabels`. All 10 keys of `DumbbellChartLabels` are listed in the key table under the props table.',!1,{type:`DumbbellChartLabels`,const:`defaultDumbbellChartLabels`,keys:[[`roleDescription`,`(slope) => (slope ? "slope chart" : "dumbbell chart")`],[`instructions`,`Use the up and down arrow keys to read each item.`],[`hint`,`Tap a row to read it`],[`from`,`Before`],[`to`,`After`],[`change`,`Change`],[`percentChange`,`% change`],[`noChange`,`No change`],[`item`,`Item`],[`noData`,`No data`]]}],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats percent changes (0.08 → "8%").`,!1],[`fromLabel`,`string`,``,`Sets the name of the "before" end, e.g. "2024".`,!1],[`toLabel`,`string`,``,`Sets the name of the "after" end, e.g. "2025".`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],E=e(g(),1),D=[{label:`Engineering`,from:128,to:141},{label:`Design`,from:104,to:112},{label:`Product`,from:121,to:133},{label:`Marketing`,from:92,to:96},{label:`Sales`,from:98,to:94},{label:`Support`,from:61,to:68},{label:`Finance`,from:101,to:108},{label:`People`,from:84,to:83}],O=[{label:`In-app chat`,from:38,to:54},{label:`Email`,from:31,to:29},{label:`Phone`,from:47,to:44},{label:`Help center`,from:22,to:35},{label:`Community`,from:41,to:48},{label:`Social`,from:12,to:19}],k=e=>`${e<0?`−`:``}$${Math.abs(Math.round(e))}K`;function A(){let[e,n]=(0,E.useState)(`change`),[r,i]=(0,E.useState)(`percent`);return(0,S.jsx)(o,{title:`Dumbbell`,description:`Median salary by department, 2024 to 2025. On first view each “after” dot travels out from its “before” dot. Sort by the change and the rows slide into their new order.`,variant:`bare`,controls:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(y,{label:`Order`,size:`sm`,options:[{value:`change`,label:`Biggest rise`},{value:`to`,label:`Highest`},{value:`none`,label:`As given`}],value:e,onValueChange:n}),(0,S.jsx)(y,{label:`Change as`,size:`sm`,options:[{value:`percent`,label:`%`},{value:`absolute`,label:`$`}],value:r,onValueChange:i})]}),code:`
import { ChartCard, dumbbellLegend, DumbbellTable, DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const salaries: DumbbellItem[] = [
  { label: "Engineering", from: 128, to: 141 },
  { label: "Design", from: 104, to: 112 },
  { label: "Product", from: 121, to: 133 },
  { label: "Marketing", from: 92, to: 96 },
  { label: "Sales", from: 98, to: 94 },
  { label: "Support", from: 61, to: 68 },
];
const thousands = (n: number) => (n < 0 ? "−" : "") + "$" + Math.abs(Math.round(n)) + "K";

export function Example() {
  return (
    <ChartCard
      title="Median salary"
      legend={dumbbellLegend("2024", "2025")}
      table={<DumbbellTable data={salaries} sort="change" fromLabel="2024" toLabel="2025" format={thousands} caption="Median salary by department" />}
    >
      <DumbbellChart
        data={salaries}
        fromLabel="2024"
        toLabel="2025"
        sort="change"
        change="percent"
        format={thousands}
        aria-label="Median salary by department, 2024 against 2025"
      />
    </ChartCard>
  );
}`,children:(0,S.jsx)(t,{className:`w-full ${x}`,title:`Median salary`,description:`By department, in thousands of US dollars`,legend:c(`2024`,`2025`),table:(0,S.jsx)(C,{data:D,sort:e,fromLabel:`2024`,toLabel:`2025`,format:k,caption:`Median salary by department`}),children:(0,S.jsx)(u,{data:D,fromLabel:`2024`,toLabel:`2025`,sort:e,change:r,format:k,"aria-label":`Median salary by department, 2024 against 2025`})})})}function j(){return(0,S.jsxs)(r,{eyebrow:`Chart`,title:`Dumbbell & slope chart`,description:`Before and after for each item. A dumbbell joins a light “before” dot to a full-color “after” dot; the slope variant puts the two ends in columns, so rises and falls read as the angle of each line. Every change is printed with ▲ / ▼ and a success or danger tone you set with higherIsBetter.`,source:[`${b}dumbbell-chart.tsx`,`${b}histogram.tsx`],children:[(0,S.jsx)(v,{label:`Dumbbell chart demo`,title:`Median salary`,hue:1,height:`20.125rem`,children:(0,S.jsx)(u,{data:D,fromLabel:`2024`,toLabel:`2025`,sort:`change`,change:`percent`,format:k,"aria-label":`Median salary by department, 2024 against 2025`})}),(0,S.jsx)(A,{}),(0,S.jsx)(o,{title:`Slope chart`,description:`variant="slope": the two ends in columns, a line per channel. Labels spread apart so none collide, and highlight keeps the two channels the story is about in color.`,variant:`bare`,code:`
import { DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const npsByChannel: DumbbellItem[] = [
  { label: "In-app chat", from: 38, to: 54 },
  { label: "Email", from: 31, to: 29 },
  { label: "Phone", from: 47, to: 44 },
  { label: "Help center", from: 22, to: 35 },
  { label: "Community", from: 41, to: 48 },
  { label: "Social", from: 12, to: 19 },
];

export function Example() {
  return (
    <DumbbellChart
      variant="slope"
      data={npsByChannel}
      fromLabel="Q1"
      toLabel="Q2"
      highlight={["In-app chat", "Help center"]}
      color={3}
      aria-label="Net Promoter Score by support channel, Q1 against Q2"
    />
  );
}`,children:(0,S.jsx)(t,{className:x,title:`NPS by support channel`,description:`Q1 against Q2`,legend:c(`Q1`,`Q2`,3),table:(0,S.jsx)(C,{data:O,fromLabel:`Q1`,toLabel:`Q2`,caption:`Net Promoter Score by support channel`}),children:(0,S.jsx)(u,{variant:`slope`,data:O,fromLabel:`Q1`,toLabel:`Q2`,highlight:[`In-app chat`,`Help center`],color:3,"aria-label":`Net Promoter Score by support channel, Q1 against Q2`})})}),(0,S.jsx)(a,{of:w}),(0,S.jsx)(a,{as:`h2`,title:`DumbbellTable props`,of:T}),(0,S.jsx)(i,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`↑ / ↓`,`Move between items.`],[`Home / End`,`Jump to the first / last item.`],[`Escape`,`Clear the reading.`]]}),(0,S.jsx)(n,{notes:[`Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Every change is printed with an up or down arrow and a success or danger tone (set by higherIsBetter), so color never carries it alone.`,`For a non-visual reading, give ChartCard's table prop a DumbbellTable; the Chart / Table tabs then expose each value as plain table cells.`,`Under reduced motion nothing morphs: the dots and the connecting bars render at their final values and new data replaces the old at once.`]})]})}export{j as default,C as t};