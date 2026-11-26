import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{C as r}from"./chart-utils-DvmgVWft.js";import{r as i}from"./toast-PePh6sao.js";import{n as a,t as o}from"./bar-list-CaUQMA_k.js";import{t as s}from"./ExampleChartCard-DOQs1ydL.js";import{t as c}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{i as l,n as u,o as d,r as f}from"./Page-BAL5Idhy.js";import{t as p}from"./Example-BPfHvEYD.js";import{t as m}from"./router-KJTTT7HX.js";import{t as h}from"./Segmented-kx7yHseo.js";import{n as g,t as _}from"./shared-DWDy5hdV.js";var v=[[`data`,`readonly BarListItem[]`,``,`One row per item: { name: "Searchly", value: 4821 }. Negative values draw no bar.`,!0],[`color`,`ChartColor`,`1`,`Hue of the bars: a palette slot (1–8). One list, one hue.`,!1],[`sortOrder`,`"none" | "ascending" | "descending"`,`"descending"`,'Row order. "none" keeps the order of `data`.',!1],[`limit`,`number`,``,`Rows shown before "Show more". Omit to show every row.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`showShare`,`boolean`,`false`,`Print each row's share of the total after its value.`,!1],[`nameHeader`,`ReactNode`,``,`Column captions above the rows, e.g. "Source" / "Visits".`,!1],[`valueHeader`,`ReactNode`,``,`Column caption above the values, e.g. "Visits".`,!1],[`onValueChange`,`((item: BarListItem) => void)`,``,`Makes every row a button.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1],[`labels`,`Partial<BarListLabels>`,`defaultBarListLabels`,'Override the "Show more", "Show less" and "of total" strings (i18n). Every other string, for translation: `labels={{ showMore: "…" }}`; omitted keys keep the English of `defaultBarListLabels`. All 3 keys of `BarListLabels` are listed in the key table under the props table.',!1,{type:`BarListLabels`,const:`defaultBarListLabels`,keys:[[`showMore`,"(hidden) => `Show ${hidden} more`"],[`showLess`,`Show less`],[`ofTotal`,`of total`]]}],[`aria-label`,`string`,``,`Names the list for assistive tech.`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`data`,`readonly BarListItem[]`,``,`One row per item: { name: "Searchly", value: 4821 }. Negative values draw no bar.`,!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`sortOrder`,`"none" | "ascending" | "descending"`,`"descending"`,'Row order. "none" keeps the order of `data`.',!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`headers`,`Partial<{ name: string; value: string; share: string; }>`,``,`Override the column headers: { name, value, share }.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],b=e(t()),x=n(),S=[{name:`Searchly`,value:4821},{name:`Direct`,value:3407},{name:`codehost.example`,value:2118},{name:`Hacker News`,value:1640},{name:`Short posts`,value:912},{name:`Forums`,value:704},{name:`Career network`,value:498},{name:`Private search`,value:341},{name:`Lookup`,value:287},{name:`Newsletter`,value:214},{name:`Product Hunt`,value:166},{name:`dev.to`,value:98}];function C(e){return[[`/effects/liquid-glass`,2140,9210],[`/components/button`,1380,4120],[`/charts`,920,5840],[`/blocks/dashboard-stats`,610,2210],[`/components/data-table`,1240,3890],[`/foundations`,480,1720]].map(([t,n,r])=>({name:t,value:e===`7d`?n:r,href:m(t)}))}var w=(0,x.jsxs)(`svg`,{viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:1.4,strokeLinejoin:`round`,children:[(0,x.jsx)(`path`,{d:`M4 1.75h5.25L12.5 5v9.25H4z`}),(0,x.jsx)(`path`,{d:`M9 1.75V5.25h3.5`})]});function T(){let e=i(),[t,n]=(0,b.useState)(`7d`),m=(0,b.useMemo)(()=>C(t).map(e=>({...e,icon:w})),[t]);return(0,x.jsxs)(u,{eyebrow:`Chart`,title:`Bar list`,description:`A ranked list with each value drawn as a soft bar behind its name: the most compact way to compare many named values, and a plain list to screen readers. One hue for the whole list (the names are categories of one measure), a solid data end on each bar, and text in text colors.`,source:`theme/src/components/charts/bar-list.tsx`,children:[(0,x.jsx)(c,{label:`Bar list demo`,title:`Top referrers`,hue:1,height:`15rem`,children:(0,x.jsx)(o,{data:S,limit:5,showShare:!0,nameHeader:`Source`,valueHeader:`Visitors`,"aria-label":`Visitors by referrer`})}),(0,x.jsx)(p,{title:`Top referrers, top 5`,description:`Shows the top five; “Show more” reveals the rest without rescaling the bars, since every bar shares the list's largest value. Rows are buttons here: click or press Enter to filter by a source.`,variant:`bare`,code:`
import { useState } from "react";
import { ChartCard, BarListTable, BarList, type BarListItem } from "@sheenui/theme";

const referrers: BarListItem[] = [
  { name: "Searchly", value: 4821 },
  { name: "Direct", value: 3207 },
  { name: "codehost.example", value: 1342 },
  { name: "Hacker News", value: 655 },
  { name: "Lookup", value: 287 },
  { name: "Newsletter", value: 214 },
];

export function Example() {
  const [filter, setFilter] = useState<string | null>(null);
  return (
    <ChartCard title="Top referrers" description={filter ? "Filtered by " + filter : "All sources"} table={<BarListTable data={referrers} />}>
      <BarList
        data={referrers}
        limit={5}
        showShare
        nameHeader="Source"
        valueHeader="Visitors"
        onValueChange={(item) => setFilter(item.name)}
        aria-label="Visitors by referrer"
      />
    </ChartCard>
  );
}`,children:(0,x.jsx)(s,{className:`w-full`,title:`Top referrers`,description:`Visitors, last 7 days`,table:(0,x.jsx)(a,{data:S,caption:`Visitors by referrer`,headers:{name:`Source`,value:`Visitors`}}),children:(0,x.jsx)(o,{data:S,limit:5,showShare:!0,nameHeader:`Source`,valueHeader:`Visitors`,onValueChange:t=>e.info(`Filtered by ${t.name}`,`${r(t.value)} visitors`),"aria-label":`Visitors by referrer`})})}),(0,x.jsx)(p,{title:`Top pages, linked and re-ranked`,description:`Each row is a link (the whole row is its hit area) with an icon. Switch the range: rows glide to their new rank and bars resize, with transform-only animation that's instant under reduced motion. Where a short bar would end inside a name, its solid end becomes two ticks above and below the text.`,variant:`bare`,controls:(0,x.jsxs)(g,{children:[(0,x.jsx)(_,{children:`Range`}),(0,x.jsx)(h,{label:`Date range of the list`,size:`sm`,options:[{value:`7d`,label:`7 days`},{value:`30d`,label:`30 days`}],value:t,onValueChange:n})]}),code:`
import { BarList, type BarListItem } from "@sheenui/theme";

const pageIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M4 1.75h5.25L12.5 5v9.25H4z" />
    <path d="M9 1.75V5.25h3.5" />
  </svg>
);

const pages: BarListItem[] = [
  { name: "/docs/getting-started", value: 2140, href: "/docs/getting-started", icon: pageIcon },
  { name: "/components/button", value: 1380, href: "/components/button", icon: pageIcon },
  { name: "/charts", value: 920, href: "/charts", icon: pageIcon },
  { name: "/foundations", value: 480, href: "/foundations", icon: pageIcon },
];

export function Example() {
  return <BarList data={pages} color={3} nameHeader="Page" valueHeader="Views" aria-label="Most viewed pages" />;
}`,children:(0,x.jsx)(s,{className:`w-full`,title:`Top pages`,description:t===`7d`?`Views, last 7 days`:`Views, last 30 days`,table:(0,x.jsx)(a,{data:m,caption:`Most viewed pages`,headers:{name:`Page`,value:`Views`}}),children:(0,x.jsx)(o,{data:m,color:3,nameHeader:`Page`,valueHeader:`Views`,"aria-label":`Most viewed pages`})})}),(0,x.jsx)(f,{title:`BarList`,of:v}),(0,x.jsx)(f,{as:`h3`,title:`BarListTable`,of:y}),(0,x.jsx)(d,{rows:[[`Tab`,`Move to each row that is a button (onValueChange) or a link (href), and to “Show more”. A plain list has no tab stops.`],[`Enter / Space on a button row`,`Activate it (for example, filter by that row).`],[`Enter on a link row`,`Follow the link.`],[`Enter / Space on Show more`,`Reveal the remaining rows.`]]}),(0,x.jsx)(l,{notes:[`The list is a real <ul>, so screen readers read each row's name, value and (with showShare) share as text. aria-label names the list and is required.`,`Interactive rows have a solid inset focus ring and are ordinary tab stops.`,`For a non-visual reading, give ChartCard's table prop a BarListTable; the Chart / Table tabs then expose each value as plain table cells.`,`Under reduced motion nothing morphs: the bars render at their final lengths and new data replaces the old at once.`]})]})}export{T as default};