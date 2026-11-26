import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{C as r}from"./chart-utils-DvmgVWft.js";import{r as i}from"./toast-PePh6sao.js";import{n as a,o,t as s}from"./treemap-9a1gq2pt.js";import{t as c}from"./ExampleChartCard-DOQs1ydL.js";import{t as l}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{i as u,n as d,o as f,r as p}from"./Page-ClekXXh-.js";import{t as m}from"./Example-jva669kg.js";import"./router-KJTTT7HX.js";import{t as h}from"./Segmented-kx7yHseo.js";import{n as g,t as _}from"./shared-DWDy5hdV.js";var v=[[`data`,`readonly TreemapNode[]`,``,"Nodes: leaves carry a `value`; groups carry `children` (any depth).",!0],[`height`,`number`,`320`,`Height of the treemap in px; the width follows the container.`,!1],[`color`,`ChartColor`,`1`,`Hue for tiles that don't get a group colour (flat data: one series, one hue). Hierarchies colour each top-level group by its own slot instead.`,!1],[`patterns`,`boolean`,`true when there are more than 3 top-level groups`,`Tell groups apart without colour (hatch fills). Default: on when the chart has more than 3 groups. A flat treemap is one hue, so it has no groups to tell apart.`,!1],[`nested`,`boolean`,`true`,`Show each group's children inside it, under a header.`,!1],[`drillDown`,`boolean`,`true when there are groups`,`Click / Enter on a group zooms into it, with a breadcrumb to zoom back out.`,!1],[`path`,`readonly string[]`,``,`The zoomed-in path (group labels from the top), controlled.`,!1],[`defaultPath`,`readonly string[]`,`[]`,`Path of the node the chart starts zoomed into (uncontrolled).`,!1],[`onPathChange`,`((path: string[]) => void)`,``,"Called with the path of labels when the user zooms in or out (controlled `path`).",!1],[`onNodeClick`,`((node: { label: string; value: number; path: string[]; }) => void)`,``,`Called on click / Enter on a tile that has nothing to zoom into.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<TreemapLabels>`,`defaultTreemapLabels`,'Every other string, for translation: `labels={{ root: "…" }}`; omitted keys keep the English of `defaultTreemapLabels`. All 10 keys of `TreemapLabels` are listed in the key table under the props table.',!1,{type:`TreemapLabels`,const:`defaultTreemapLabels`,keys:[[`root`,`All`],[`breadcrumb`,`Treemap level`],[`ofParent`,"(parent) => `of ${parent}`"],[`ofTotal`,`of total`],[`instructions`,`Use the arrow keys to move between tiles.`],[`drillInstructions`,`Press Enter to zoom into a group and Escape to zoom out.`],[`zoomedTo`,'(label, count) => `${label}: ${count} ${count === 1 ? "item" : "items"}`'],[`roleDescription`,`treemap`],[`hint`,`Tap or hover a tile for its value`],[`drillHint`,`Tap a tile for its value, again to zoom in`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`data`,`readonly TreemapNode[]`,``,"Nodes: leaves carry a `value`; groups carry `children` (any depth).",!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the labels, tooltips and data table: takes the share, returns the text shown.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`headers`,`Partial<{ name: string; value: string; ofParent: string; ofTotal: string; }>`,``,`Override the column headers: { name, value, ofParent, ofTotal }.`,!1],[`labels`,`Partial<TreemapTableLabels>`,`defaultTreemapTableLabels`,'Strings for the cells that have no value. Merged over `defaultTreemapTableLabels`. Every other string, for translation: `labels={{ notApplicable: "…" }}`; omitted keys keep the English of `defaultTreemapTableLabels`. Its only key is listed in the key table under the props table.',!1,{type:`TreemapTableLabels`,const:`defaultTreemapTableLabels`,keys:[[`notApplicable`,`Not applicable`]]}],[`emptyState`,`ReactNode`,``,`Shown when there are no nodes.`,!1]],b=e(t()),x=n(),S={q3:[{label:`Engineering`,color:1,children:[{label:`Compute`,value:182e3},{label:`Databases`,value:96e3},{label:`Storage`,value:64e3},{label:`CI / CD`,value:41e3},{label:`Observability`,value:28e3},{label:`Dev boxes`,value:12e3}]},{label:`Data`,color:7,children:[{label:`Warehouse`,value:118e3},{label:`ML training`,value:87e3},{label:`Pipelines`,value:52e3},{label:`Notebooks`,value:9e3}]},{label:`Product`,color:3,children:[{label:`CDN`,value:39e3},{label:`Search`,value:22e3},{label:`Media`,value:17e3},{label:`Email`,value:9e3}]},{label:`Security`,color:2,children:[{label:`SIEM`,value:31e3},{label:`WAF`,value:14e3},{label:`Secrets`,value:4e3}]}],q4:[{label:`Engineering`,color:1,children:[{label:`Compute`,value:158e3},{label:`Databases`,value:104e3},{label:`Storage`,value:71e3},{label:`CI / CD`,value:33e3},{label:`Observability`,value:36e3},{label:`Dev boxes`,value:15e3}]},{label:`Data`,color:7,children:[{label:`Warehouse`,value:126e3},{label:`ML training`,value:142e3},{label:`Pipelines`,value:48e3},{label:`Notebooks`,value:11e3}]},{label:`Product`,color:3,children:[{label:`CDN`,value:44e3},{label:`Search`,value:26e3},{label:`Media`,value:21e3},{label:`Email`,value:8e3}]},{label:`Security`,color:2,children:[{label:`SIEM`,value:34e3},{label:`WAF`,value:15e3},{label:`Secrets`,value:5e3}]}]},C=[{label:`react-dom`,value:132},{label:`motion`,value:58},{label:`@base-ui/react`,value:46},{label:`app code`,value:41},{label:`router`,value:18},{label:`intl polyfills`,value:14},{label:`react`,value:8},{label:`clsx`,value:1},{label:`tailwind-merge`,value:9},{label:`date utils`,value:6}],w=e=>`${e<0?`−`:``}$${r(Math.abs(e))}`,T=e=>`${Math.round(e)} kB`;function E(){let e=i(),[t,n]=(0,b.useState)(`q4`),[r,E]=(0,b.useState)([]),D=S[t];return(0,x.jsxs)(d,{eyebrow:`Chart`,title:`Treemap`,description:`Part-to-whole as nested rectangles. The layout is the squarified algorithm (implemented in the file, no dependency), so tiles stay close to square and can be compared. Labels appear only where they fit, in black or white by contrast, and groups zoom open with a transform-only layout animation.`,source:`theme/src/components/charts/treemap.tsx`,children:[(0,x.jsx)(l,{label:`Treemap demo`,title:`Cloud spend`,hue:1,height:`22rem`,children:(0,x.jsx)(s,{data:S.q4,format:w,"aria-label":`Cloud spend by team and service`,labels:{breadcrumb:`Treemap level, hero demo`}})}),(0,x.jsx)(m,{title:`Cloud spend, zoomable`,description:`Each team keeps one palette slot and its services share the hue. Click a team (or focus the chart, move with the arrow keys and press Enter) to zoom in; the breadcrumb or Escape zooms back out. Switching the quarter re-flows the tiles.`,variant:`bare`,controls:(0,x.jsxs)(g,{children:[(0,x.jsx)(_,{children:`Quarter`}),(0,x.jsx)(h,{label:`Quarter shown in the treemap`,size:`sm`,options:[{value:`q3`,label:`Q3`},{value:`q4`,label:`Q4`}],value:t,onValueChange:n})]}),code:`
import { useState } from "react";
import { ChartCard, formatCompact, treemapLegend, TreemapTable, Treemap, type TreemapNode } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const spend: TreemapNode[] = [
  {
    label: "Engineering",
    color: 1,
    children: [
      { label: "Compute", value: 158000 },
      { label: "Storage", value: 64000 },
      { label: "CDN", value: 21000 },
    ],
  },
  {
    label: "Data",
    color: 7,
    children: [
      { label: "Warehouse", value: 92000 },
      { label: "Streaming", value: 37000 },
    ],
  },
  {
    label: "Support",
    color: 3,
    children: [
      { label: "Tooling", value: 18000 },
      { label: "Telephony", value: 12000 },
    ],
  },
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={treemapLegend(spend)}
      table={<TreemapTable data={spend} format={usd} />}
    >
      <Treemap
        data={spend}
        format={usd}
        path={path} // optional: control the zoom level
        onPathChange={setPath}
        aria-label="Cloud spend by team and service"
      />
    </ChartCard>
  );
}`,children:(0,x.jsx)(c,{className:`w-full`,title:`Cloud spend`,description:`${t.toUpperCase()} 2026, by team and service`,aside:(0,x.jsx)(`span`,{className:`text-2xl font-semibold tracking-tight tabular-nums`,children:w(D.reduce((e,t)=>e+(t.children??[]).reduce((e,t)=>e+(t.value??0),0),0))}),legend:o(D),table:(0,x.jsx)(a,{data:D,format:w,caption:`Cloud spend by team and service`,headers:{ofParent:`% of team`}}),children:(0,x.jsx)(s,{data:D,format:w,path:r,onPathChange:E,height:340,labels:{root:`All teams`,ofParent:e=>`of ${e}`},"aria-label":`Cloud spend by team and service, ${t.toUpperCase()}`})})}),(0,x.jsx)(m,{title:`Flat data, one hue`,description:`Without groups every tile is the same series, so it takes one hue and needs no legend; size alone carries the value. Tiny tiles stay unlabelled rather than overflow, and the tooltip and table still read them. Click a tile to handle it.`,variant:`bare`,code:`
import { Treemap, useToast, type TreemapNode } from "@sheenui/theme";

const bundle: TreemapNode[] = [
  { label: "react-dom", value: 132 },
  { label: "motion", value: 58 },
  { label: "lucide-react", value: 34 },
  { label: "date-fns", value: 21 },
  { label: "zod", value: 14 },
];

export function Example() {
  const toast = useToast();
  return (
    <Treemap
      data={bundle}
      color={7}
      format={(n) => \`\${n} kB\`}
      onNodeClick={(node) => toast.info(node.label)}
      aria-label="JavaScript bundle size by package"
    />
  );
}`,children:(0,x.jsx)(c,{className:`w-full`,title:`Bundle size`,description:`Gzipped kB by package`,table:(0,x.jsx)(a,{data:C,format:T,caption:`Bundle size by package`}),children:(0,x.jsx)(s,{data:C,color:7,height:260,format:T,onNodeClick:t=>e.info(t.label,`${T(t.value)} gzipped`),"aria-label":`JavaScript bundle size by package`})})}),(0,x.jsx)(p,{title:`Treemap`,of:v}),(0,x.jsx)(p,{as:`h2`,title:`TreemapTable props, treemapLegend and squarify`,of:y,rows:[[`treemapLegend(data)`,`LegendItem[]`,``,`Legend items for the top-level groups, for ChartCard's legend.`],[`squarify(values, rect)`,`TreemapRect[]`,``,`The layout on its own: one rect per value, in input order.`]]}),(0,x.jsx)(f,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`Arrow keys`,`Move spatially between tiles.`],[`Home / End`,`Largest / smallest tile.`],[`Enter`,`Zoom into the group (with drillDown).`],[`Escape / Backspace`,`Zoom back out.`]]}),(0,x.jsx)(u,{notes:[`The chart is a focusable figure named by its aria-label and described by the reading hint (and the drill-down hint when it is on); zooming is announced, and the breadcrumb is real buttons.`,`TreemapTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists every node.`,`Reduced motion: the tiles appear at their final sizes and data changes jump instead of morphing.`]})]})}export{E as default};