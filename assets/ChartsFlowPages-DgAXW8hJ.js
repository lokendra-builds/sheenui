import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,n,o as r,r as i}from"./Page-vzU90LKc.js";import{t as a}from"./Example-CmMsgUlK.js";import{n as o,t as s}from"./marimekko-chart-BR-ycMsa.js";import{o as c}from"./legend-tooltip-B7LDwC_I.js";import{t as l}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{i as u,t as d}from"./vendor-react-D30i__oY.js";import{t as f}from"./Segmented-kx7yHseo.js";import{n as p,t as m}from"./shared-CYfc5WM4.js";var h=[[`data`,`readonly ChartRow[]`,``,`One row per column, e.g. { segment: "Enterprise", us: 420, rivalA: 310, ... }.`,!0],[`index`,`string`,``,`Key of the column name in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,`The stacked parts of every column, bottom up (≤ 8; colour slots stay fixed). Negative values count as 0.`,!0],[`height`,`number`,`340`,`Height of the chart in px; the width follows the container.`,!1],[`cellText`,`"none" | "value" | "share"`,`"share"`,`What each cell prints when it fits: its share of the column (default), its value, or nothing.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the tooltips and data table: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`patterns`,`boolean`,`true when series.length > 3`,`Tell series apart without colour (hatch fills).`,!1],[`onCellClick`,`((cell: MarimekkoCell) => void)`,``,"Called with `{ column, series, seriesLabel, value }` when a cell is clicked, tapped, or activated with Enter. `column` is the row's `index` value and `series` the series `key` (the data keys); `seriesLabel` is its display label. Makes cells interactive.",!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<MarimekkoChartLabels>`,`defaultMarimekkoChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultMarimekkoChartLabels`. All 6 keys of `MarimekkoChartLabels` are listed in the key table under the props table.',!1,{type:`MarimekkoChartLabels`,const:`defaultMarimekkoChartLabels`,keys:[[`roleDescription`,`marimekko chart`],[`instructions`,`Use the arrow keys to read it: left and right move between columns, up and down between the segments of a column.`],[`hint`,`Tap a cell for its value`],[`ofColumn`,"(column) => `of ${column}`"],[`ofTotal`,`of total`],[`cellTitle`,"(column, series) => `${column} · ${series}`"]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],g=[[`data`,`readonly ChartRow[]`,``,`One row per column, e.g. { segment: "Enterprise", us: 420, rivalA: 310, ... }.`,!0],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`index`,`string`,``,`Key of the column name in each row.`,!0],[`series`,`readonly ChartSeries[]`,``,`The stacked parts of every column, bottom up (≤ 8; colour slots stay fixed). Negative values count as 0.`,!0],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the tooltips and data table: takes the share, returns the text shown.`,!1],[`indexLabel`,`string`,``,`Sets the header of the first column.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`labels`,`Partial<MarimekkoTableLabels>`,`defaultMarimekkoTableLabels`,'Column headers. Merged over `defaultMarimekkoTableLabels`. Every other string, for translation: `labels={{ total: "…" }}`; omitted keys keep the English of `defaultMarimekkoTableLabels`. All 2 keys of `MarimekkoTableLabels` are listed in the key table under the props table.',!1,{type:`MarimekkoTableLabels`,const:`defaultMarimekkoTableLabels`,keys:[[`total`,`Total`],[`share`,`% of total`]]}],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],_=e(u(),1),v=d(),y=[{key:`us`,label:`Acme (us)`,color:1},{key:`northwind`,label:`Northwind`,color:3},{key:`contoso`,label:`Contoso`,color:2},{key:`others`,label:`Others`,color:7}],b={y2024:[{segment:`Enterprise`,us:640,northwind:1480,contoso:1210,others:870},{segment:`Mid-market`,us:520,northwind:610,contoso:740,others:730},{segment:`SMB`,us:410,northwind:220,contoso:380,others:790},{segment:`Startups`,us:260,northwind:60,contoso:90,others:290}],y2025:[{segment:`Enterprise`,us:910,northwind:1420,contoso:1150,others:820},{segment:`Mid-market`,us:760,northwind:590,contoso:700,others:690},{segment:`SMB`,us:520,northwind:210,contoso:350,others:760},{segment:`Startups`,us:340,northwind:70,contoso:80,others:260}]},x=e=>`$${e}M`,S=[{key:`platform`,label:`Platform`,color:1},{key:`analytics`,label:`Analytics`,color:4},{key:`services`,label:`Services`,color:5}],C=[{region:`North America`,platform:4.8,analytics:2.1,services:1.2},{region:`Europe`,platform:3.1,analytics:1.6,services:.9},{region:`Asia Pacific`,platform:1.9,analytics:1.4,services:.3},{region:`Latin America`,platform:.7,analytics:.2,services:.2},{region:`Middle East`,platform:.4,analytics:.1,services:.1}];function w(){let[e,t]=(0,_.useState)(`y2025`),n=b[e],r=n.reduce((e,t)=>e+t.us,0)*1e6;return(0,v.jsx)(a,{title:`Market map, year on year`,description:`Columns are segments sized by total spend; cells are vendors. Switch the year: every cell reshapes in place. Arrow keys move between segments (left / right) and vendors (up / down).`,variant:`bare`,controls:(0,v.jsx)(f,{label:`Year`,size:`sm`,options:[{value:`y2024`,label:`2024`},{value:`y2025`,label:`2025`}],value:e,onValueChange:e=>(0,_.startTransition)(()=>t(e))}),code:`
import { ChartCard, seriesLegend, MarimekkoTable, MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const series: ChartSeries[] = [
  { key: "us", label: "Acme (us)", color: 1 },
  { key: "northwind", label: "Northwind", color: 3 },
  { key: "contoso", label: "Contoso", color: 2 },
  { key: "others", label: "Others", color: 7 },
];
const data = [
  { segment: "Enterprise", us: 910, northwind: 1420, contoso: 1150, others: 820 },
  { segment: "Mid-market", us: 760, northwind: 590, contoso: 700, others: 690 },
  { segment: "SMB", us: 520, northwind: 210, contoso: 350, others: 760 },
  { segment: "Startups", us: 340, northwind: 70, contoso: 80, others: 260 },
];

<ChartCard
  title="Market map"
  legend={seriesLegend(series, "rect")}
  table={<MarimekkoTable data={data} index="segment" indexLabel="Segment" series={series} caption="Spend by segment and vendor" />}
>
  <MarimekkoChart
    data={data}
    index="segment"
    series={series}
    format={(n) => \`$\${n}M\`}
    aria-label="Market spend by segment and vendor, 2025"
  />
</ChartCard>`,children:(0,v.jsx)(m,{className:`w-full`,title:`Market map`,description:`Spend by segment and vendor, ${e===`y2024`?`2024`:`2025`} ($M)`,aside:(0,v.jsx)(p,{value:r,label:`our revenue`,currency:!0}),legend:c(y,`rect`),table:(0,v.jsx)(o,{data:n,index:`segment`,indexLabel:`Segment`,series:y,format:e=>`$${e}M`,caption:`Spend by segment and vendor`}),children:(0,v.jsx)(s,{data:n,index:`segment`,series:y,format:x,"aria-label":`Market spend by segment and vendor, ${e===`y2024`?`2024`:`2025`}`})})})}var T=`theme/src/components/charts/`;function E(){return(0,v.jsxs)(n,{eyebrow:`Chart`,title:`Marimekko chart`,description:`A 100% stacked mosaic whose columns are as wide as their totals: how big each market segment is, and who holds it, in one picture. Each cell prints its share of the column where it fits; hover or tap one for its value and both shares.`,source:`${T}marimekko-chart.tsx`,children:[(0,v.jsx)(l,{label:`Marimekko chart demo`,title:`Spend by segment and vendor`,hue:1,height:`21.25rem`,legend:c(y,`rect`),children:(0,v.jsx)(s,{data:b.y2025,index:`segment`,series:y,format:x,"aria-label":`Market spend by segment and vendor, 2025`})}),(0,v.jsx)(w,{}),(0,v.jsx)(a,{title:`Revenue by region and product, values in the cells`,description:`cellText="value" prints each cell’s value instead of its share. Narrow columns keep their name only while it fits; every value stays in the tooltip and the table.`,variant:`bare`,code:`
import { MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const regions = [
  { region: "North America", platform: 4.8, analytics: 2.1, services: 1.2 },
  { region: "Europe", platform: 3.1, analytics: 1.6, services: 0.9 },
  { region: "Asia Pacific", platform: 1.9, analytics: 1.4, services: 0.3 },
  { region: "Latin America", platform: 0.7, analytics: 0.2, services: 0.2 },
  { region: "Middle East", platform: 0.4, analytics: 0.1, services: 0.1 },
];

const products: ChartSeries[] = [
  { key: "platform", label: "Platform", color: 1 },
  { key: "analytics", label: "Analytics", color: 4 },
  { key: "services", label: "Services", color: 5 },
];

export function Example() {
  return (
    <MarimekkoChart
      data={regions}
      index="region"
      series={products}
      cellText="value"
      height={300}
      format={(n) => \`$\${n}M\`}
      aria-label="Revenue by region and product line"
    />
  );
}`,children:(0,v.jsx)(m,{className:`w-full`,title:`Revenue by region`,description:`By product line, fiscal 2025 totals`,legend:c(S,`rect`),table:(0,v.jsx)(o,{data:C,index:`region`,indexLabel:`Region`,series:S,format:e=>`$${e}M`,caption:`Revenue by region and product`}),children:(0,v.jsx)(s,{data:C,index:`region`,series:S,cellText:`value`,height:300,format:e=>`$${e}M`,"aria-label":`Revenue by region and product line`})})}),(0,v.jsx)(i,{of:h}),(0,v.jsx)(i,{as:`h2`,title:`MarimekkoTable props`,of:g}),(0,v.jsx)(r,{rows:[[`Tab`,`Focus the chart (one stop).`],[`← / →`,`The same part in the previous / next column (or the nearest one by height).`],[`↑ / ↓`,`The next part up / down the column.`],[`Home / End`,`Bottom / top part of the column.`],[`Enter / Space`,`Call onCellClick for the active cell.`],[`Escape`,`Clear the reading.`]]}),(0,v.jsxs)(t,{children:[(0,v.jsx)(`li`,{children:`The chart is one focusable figure with the role description “marimekko chart”; a cell is announced with its value and both shares (“Enterprise · Acme (us): $910M, 21% of Enterprise, 9% of total”).`}),(0,v.jsx)(`li`,{children:`Cell numbers are drawn in black or white, whichever contrasts more with the fill, and only where they fit; the Table view (MarimekkoTable) has every value.`}),(0,v.jsx)(`li`,{children:`On touch screens the first tap pins the readout; a second tap activates the cell.`}),(0,v.jsx)(`li`,{children:`Reduced motion: the columns appear at once and data changes jump.`})]})]})}export{E as default};