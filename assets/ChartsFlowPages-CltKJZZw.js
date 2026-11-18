import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,n,o as r,r as i}from"./Page-BRuP8nt1.js";import{t as a}from"./Example-DaSezASZ.js";import{a as o,n as s,t as c}from"./sunburst-chart--y4SBXd0.js";import{t as l}from"./ShowcaseStage.chart.scene-BbwlviML.js";import{i as u,t as d}from"./vendor-react-D30i__oY.js";import{t as f}from"./Segmented-ByB5jpmQ.js";import{n as p,r as m,t as h}from"./shared-rEDlD8UI.js";var g=[[`data`,`readonly SunburstNode[]`,``,"The hierarchy: leaves carry a `value`; groups carry `children` (any depth).",!0],[`height`,`number`,`360`,`Height in px; the chart is a circle that fits the smaller of width and height.`,!1],[`rings`,`number`,`3`,`Rings shown at once (deeper levels appear as you zoom in).`,!1],[`drillDown`,`boolean`,`true when there are groups`,`Click / Enter on a group zooms into it.`,!1],[`path`,`readonly string[]`,``,`The zoomed-in path (group labels from the top), controlled.`,!1],[`defaultPath`,`readonly string[]`,`[]`,`Labels of the group to start zoomed into (uncontrolled).`,!1],[`onPathChange`,`((path: string[]) => void)`,``,"Called with the path of labels when the user zooms in or out (controlled `path`).",!1],[`onNodeClick`,`((node: { label: string; value: number; path: string[]; }) => void)`,``,`Called on click / Enter on a node that has nothing to zoom into.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the tooltips and data table: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<SunburstChartLabels>`,`defaultSunburstChartLabels`,'Every other string, for translation: `labels={{ root: "…" }}`; omitted keys keep the English of `defaultSunburstChartLabels`. All 9 keys of `SunburstChartLabels` are listed in the key table under the props table.',!1,{type:`SunburstChartLabels`,const:`defaultSunburstChartLabels`,keys:[[`root`,`Total`],[`breadcrumb`,`Sunburst level`],[`ofParent`,"(parent) => `of ${parent}`"],[`ofTotal`,`of total`],[`instructions`,`Use the arrow keys to read it: left and right go around a ring, down moves out to the children, up moves back in.`],[`drillInstructions`,`Press Enter to zoom into a group and Escape to zoom out.`],[`zoomedTo`,'(label, count) => `${label}: ${count} ${count === 1 ? "item" : "items"}`'],[`roleDescription`,`sunburst chart`],[`zoomOut`,`Zoom out`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],_=[[`data`,`readonly SunburstNode[]`,``,"The hierarchy: leaves carry a `value`; groups carry `children` (any depth).",!0],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the tooltips and data table: takes the share, returns the text shown.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`headers`,`Partial<{ name: string; value: string; ofParent: string; ofTotal: string; }>`,``,`Override the column headers: { name, value, ofParent, ofTotal }.`,!1],[`labels`,`Partial<SunburstTableLabels>`,`defaultSunburstTableLabels`,'Strings for the cells that have no value. Merged over `defaultSunburstTableLabels`. Every other string, for translation: `labels={{ notApplicable: "…" }}`; omitted keys keep the English of `defaultSunburstTableLabels`. Its only key is listed in the key table under the props table.',!1,{type:`SunburstTableLabels`,const:`defaultSunburstTableLabels`,keys:[[`notApplicable`,`Not applicable`]]}],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],v=e(u(),1),y=d(),b=[{label:`Compute`,children:[{label:`Kubernetes`,children:[{label:`Web`,value:18400},{label:`Workers`,value:9600},{label:`Cron jobs`,value:2100}]},{label:`VMs`,children:[{label:`Build agents`,value:7200},{label:`Bastion`,value:600}]},{label:`Serverless`,value:3900}]},{label:`Storage`,children:[{label:`Object storage`,children:[{label:`Media`,value:6800},{label:`Backups`,value:4100},{label:`Logs`,value:2700}]},{label:`Block storage`,value:5200}]},{label:`Databases`,children:[{label:`Postgres`,children:[{label:`Primary`,value:9800},{label:`Replicas`,value:6200}]},{label:`Redis`,value:3100},{label:`Search`,value:4400}]},{label:`Network`,children:[{label:`CDN`,value:5600},{label:`Egress`,value:3800},{label:`Load balancers`,value:1900}]},{label:`Observability`,children:[{label:`Metrics`,value:2600},{label:`Tracing`,value:1700},{label:`Logs`,value:2900}]}],x=[{label:`node_modules`,children:[{label:`react-dom`,value:132},{label:`motion`,value:58},{label:`@base-ui`,children:[{label:`dialog`,value:14},{label:`menu`,value:18},{label:`tabs`,value:9},{label:`utils`,value:22}]},{label:`tailwind-merge`,value:21},{label:`react`,value:8}]},{label:`src`,children:[{label:`components`,children:[{label:`charts`,value:96},{label:`data-table`,value:41},{label:`forms`,value:37},{label:`overlays`,value:29}]},{label:`pages`,value:64},{label:`hooks`,value:9}]},{label:`styles`,value:31}],S=[`Compute`,`Databases`,`Storage`],C=e=>e.reduce((e,t)=>e+(t.children?C(t.children):t.value??0),0),w=e=>`${e.toFixed(1)}%`,T=C(b);function E(){let[e,t]=(0,v.useState)([]);return(0,y.jsx)(a,{title:`Zoomable cloud spend`,description:`Three levels of a monthly bill. Each service family has its own palette slot; its children share the hue in lighter steps outwards. Click Compute (or press Enter on it) to zoom in. The path can be controlled: the buttons below jump straight to a level.`,variant:`bare`,controls:(0,y.jsx)(f,{label:`Zoom to`,size:`sm`,options:[{value:``,label:`All`},...S.map(e=>({value:e,label:e}))],value:e[0]??``,onValueChange:e=>(0,v.startTransition)(()=>t(e?[e]:[]))}),code:`
import { ChartCard, sunburstLegend, SunburstTable, SunburstChart, type SunburstNode } from "@sheenui/theme";
import { useState } from "react";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatUsd = (n: number) => usd.format(n);

const spend: SunburstNode[] = [
  {
    label: "Compute",
    children: [
      { label: "Kubernetes", children: [{ label: "Web", value: 18400 }, { label: "Workers", value: 9600 }, { label: "Cron jobs", value: 2100 }] },
      { label: "VMs", children: [{ label: "Build agents", value: 7200 }, { label: "Bastion", value: 600 }] },
      { label: "Serverless", value: 3900 },
    ],
  },
  {
    label: "Storage",
    children: [
      { label: "Object storage", children: [{ label: "Media", value: 6800 }, { label: "Backups", value: 4100 }, { label: "Logs", value: 2700 }] },
      { label: "Block storage", value: 5200 },
    ],
  },
  // ... Databases, Network, Observability
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={sunburstLegend(spend)}
      table={<SunburstTable data={spend} format={formatUsd} caption="Spend by service" />}
    >
      <SunburstChart
        data={spend}
        path={path}
        onPathChange={setPath}
        format={formatUsd}
        aria-label="Monthly cloud spend by service"
      />
    </ChartCard>
  );
}`,children:(0,y.jsx)(h,{className:`w-full`,title:`Cloud spend`,description:`October, by service`,aside:(0,y.jsx)(p,{value:T,label:`this month`,currency:!0}),legend:o(b),table:(0,y.jsx)(s,{data:b,format:m,caption:`Spend by service`}),children:(0,y.jsx)(c,{data:b,path:e,onPathChange:t,format:m,"aria-label":`Monthly cloud spend by service`})})})}var D=[{label:`Chrome`,value:64.8},{label:`Safari`,value:18.6},{label:`Edge`,value:5.3},{label:`Firefox`,value:2.7},{label:`Mobile`,value:2.4},{label:`Other`,value:6.2}],O=`theme/src/components/charts/`;function k(){return(0,y.jsxs)(n,{eyebrow:`Chart`,title:`Sunburst chart`,description:`A hierarchy as rings around a center: each ring is one level, each arc's angle its share. Hover an arc to trace its path from the center and read it there, where the number rolls to the new value. Click a group to zoom into it with an animated sweep; the breadcrumb, the center or Escape zoom back out.`,source:`${O}sunburst-chart.tsx`,children:[(0,y.jsx)(l,{label:`Sunburst chart demo`,title:`Cloud spend by service`,hue:1,height:`24.5rem`,narrowHeight:`19.25rem`,children:(0,y.jsx)(c,{data:b,format:m,"aria-label":`Monthly cloud spend by service, hero demo`})}),(0,y.jsx)(E,{}),(0,y.jsxs)(`div`,{className:`grid grid-cols-1 gap-6 *:min-w-0`,children:[(0,y.jsx)(a,{title:`Bundle size, two rings`,description:`rings={2} shows two levels at a time; deeper ones appear as you zoom in. Arcs too thin for a name stay unlabelled and are read in the center, the tooltip and the table.`,variant:`bare`,code:`
import { SunburstChart, type SunburstNode } from "@sheenui/theme";

const bundle: SunburstNode[] = [
  {
    label: "node_modules",
    children: [
      { label: "react-dom", value: 132 },
      { label: "motion", value: 58 },
      { label: "@base-ui", children: [{ label: "dialog", value: 14 }, { label: "menu", value: 18 }, { label: "tabs", value: 9 }, { label: "utils", value: 22 }] },
      { label: "tailwind-merge", value: 21 },
      { label: "react", value: 8 },
    ],
  },
  {
    label: "src",
    children: [
      { label: "components", children: [{ label: "charts", value: 96 }, { label: "data-table", value: 41 }, { label: "forms", value: 37 }, { label: "overlays", value: 29 }] },
      { label: "pages", value: 64 },
      { label: "hooks", value: 9 },
    ],
  },
  { label: "styles", value: 31 },
];

export function Example() {
  return (
    <SunburstChart
      data={bundle}
      rings={2}
      height={300}
      format={(kb) => \`\${kb} kB\`}
      aria-label="Production bundle size by package and folder"
    />
  );
}`,children:(0,y.jsx)(h,{title:`Bundle size`,description:`Production build, gzip kB`,legend:o(x),table:(0,y.jsx)(s,{data:x,format:e=>`${e} kB`,caption:`Bundle size by module`}),children:(0,y.jsx)(c,{data:x,rings:2,height:300,format:e=>`${e} kB`,"aria-label":`Production bundle size by package and folder`})})}),(0,y.jsx)(a,{title:`Flat data: one ring`,description:`Without children a sunburst is a single ring, like a donut; every arc gets its own slot. Values below a sliver still get a hairline arc.`,variant:`bare`,code:`
import { SunburstChart } from "@sheenui/theme";

<SunburstChart
  data={[
    { label: "Chrome", value: 64.8 },
    { label: "Safari", value: 18.6 },
    { label: "Edge", value: 5.3 },
    { label: "Firefox", value: 2.7 },
    { label: "Mobile", value: 2.4 },
    { label: "Other", value: 6.2 },
  ]}
  height={300}
  format={(n) => \`\${n.toFixed(1)}%\`}
  aria-label="Browser share of sessions"
/>`,children:(0,y.jsx)(h,{title:`Browser share`,description:`Sessions, last 30 days`,legend:o(D),table:(0,y.jsx)(s,{data:D,format:w,caption:`Sessions by browser`}),children:(0,y.jsx)(c,{data:D,height:300,format:w,"aria-label":`Browser share of sessions`})})})]}),(0,y.jsx)(i,{of:g}),(0,y.jsx)(i,{as:`h2`,title:`SunburstTable props`,of:_}),(0,y.jsx)(r,{rows:[[`Tab`,`Focus the breadcrumb buttons, then the chart (one stop).`],[`← / →`,`Previous / next arc in the ring (wraps around).`],[`↓`,`Out to the arc's first child.`],[`↑`,`Back in to its parent.`],[`Home / End`,`First / last arc of the ring.`],[`Enter / Space`,`Zoom into the group (onNodeClick for an arc with nothing to zoom into).`],[`Escape / Backspace`,`Zoom out one level; at the top, Escape clears the reading.`]]}),(0,y.jsxs)(t,{children:[(0,y.jsx)(`li`,{children:`The chart is one focusable figure with the role description “sunburst chart”; the breadcrumb is a nav landmark named after the chart, with aria-current on the level shown.`}),(0,y.jsx)(`li`,{children:`Moves and zooms are announced through a polite live region (“Compute, Kubernetes: $30.1K, 63% of Compute, 29% of total”, “Compute: 3 items”).`}),(0,y.jsx)(`li`,{children:`The center always reads the active arc (or the level shown); the Table view (SunburstTable) lists every node, indented by depth.`}),(0,y.jsx)(`li`,{children:`Arc names are drawn in black or white, whichever contrasts more with the fill, and only where they fit.`}),(0,y.jsx)(`li`,{children:`Reduced motion: no sweep and no zoom animation; the number in the center jumps.`})]})]})}export{k as default};