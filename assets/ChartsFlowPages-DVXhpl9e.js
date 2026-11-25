import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,n,o as r,r as i}from"./Page-DQ8sr8qt.js";import{t as a}from"./Example-DMEbQwm9.js";import{t as o}from"./sankey-chart-baJOq5Ho.js";import{t as s}from"./table-DcNTBZy6.js";import{t as c}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{i as l,t as u}from"./vendor-react-D30i__oY.js";import{t as d}from"./Segmented-kx7yHseo.js";import{n as f,r as p,t as m}from"./shared-CYfc5WM4.js";var h=[[`links`,`readonly SankeyLink[]`,``,`Flows between nodes. A node named only here is created with its id as the label.`,!0],[`nodes`,`readonly SankeyNode[]`,``,`Names, colours and order of the nodes. Optional.`,!1],[`height`,`number`,`360`,`Sets the height of the diagram in px.`,!1],[`nodeWidth`,`number`,`12`,`Sets the width of a node bar in px (≤ 24).`,!1],[`nodePadding`,`number`,`16`,`Gap between the nodes of a column in px.`,!1],[`align`,`SankeyAlign`,`"justify"`,`Column of each node: "justify" (default: sinks go to the last column), "left" (by distance from a source), "right" (by distance to a sink) or "center".`,!1],[`linkColor`,`"source" | "target" | "gradient"`,`"gradient"`,`Ribbon colour: a gradient from the source's colour to the target's (default), or either one.`,!1],[`minColumnWidth`,`number`,`96`,`Narrowest space between two columns in px; a narrower card scrolls the diagram sideways.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share as text (0–1).`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`onNodeClick`,`((node: { id: string; label: string; inflow: number; outflow: number; }) => void)`,``,`Called on click / Enter on a node.`,!1],[`onLinkClick`,`((link: { source: string; target: string; value: number; }) => void)`,``,`Called on click / Enter on a flow.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`patterns`,`boolean`,`true when node colours > 3`,`Tell nodes apart without colour (hatch fills, one per node colour; the first colour stays solid). Ribbons keep their source-to-target gradient.`,!1],[`labels`,`Partial<SankeyChartLabels>`,`defaultSankeyChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultSankeyChartLabels`. All 10 keys of `SankeyChartLabels` are listed in the key table under the props table.',!1,{type:`SankeyChartLabels`,const:`defaultSankeyChartLabels`,keys:[[`roleDescription`,`sankey diagram`],[`instructions`,`Use the arrow keys to read it: up and down move between the nodes of a column, right and left follow the flows out of and into a node.`],[`hint`,`Tap a node or a flow to trace it`],[`inflow`,`in`],[`outflow`,`out`],[`ofTotal`,`of all flow`],[`ofSource`,"(source) => `of ${source} outflow`"],[`ofTarget`,"(target) => `of ${target} inflow`"],[`linkTitle`,"(source, target) => `${source} → ${target}`"],[`linkCount`,'(count) => `${count} ${count === 1 ? "flow" : "flows"}`']]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],g=[[`links`,`readonly SankeyLink[]`,``,`The same flows as the chart: { source, target, value }.`,!0],[`nodes`,`readonly SankeyNode[]`,``,`Optional node labels and colours, as in the chart.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a flow value for the table cells: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the table cells: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`headers`,`Partial<{ source: string; target: string; value: string; ofSource: string; ofTarget: string; }>`,``,`Override the column headers: { source, target, value, ofSource, ofTarget }.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no flows.`,!1]],_=e(l(),1),v=u(),y=[{id:`organic`,label:`Organic search`,color:1},{id:`paid`,label:`Paid ads`,color:2},{id:`social`,label:`Social`,color:5},{id:`referral`,label:`Referrals`,color:3},{id:`pricing`,label:`Pricing page`,color:7},{id:`docs`,label:`Docs`,color:4},{id:`trial`,label:`Started trial`,tone:`success`},{id:`left`,label:`Left`,tone:`danger`}],b={this:[{source:`organic`,target:`pricing`,value:4200},{source:`organic`,target:`docs`,value:3100},{source:`paid`,target:`pricing`,value:2600},{source:`paid`,target:`docs`,value:600},{source:`social`,target:`pricing`,value:900},{source:`social`,target:`docs`,value:1300},{source:`referral`,target:`pricing`,value:1500},{source:`referral`,target:`docs`,value:700},{source:`pricing`,target:`trial`,value:3800},{source:`pricing`,target:`left`,value:5400},{source:`docs`,target:`trial`,value:2100},{source:`docs`,target:`left`,value:3600}],last:[{source:`organic`,target:`pricing`,value:3600},{source:`organic`,target:`docs`,value:2900},{source:`paid`,target:`pricing`,value:3400},{source:`paid`,target:`docs`,value:800},{source:`social`,target:`pricing`,value:600},{source:`social`,target:`docs`,value:900},{source:`referral`,target:`pricing`,value:1100},{source:`referral`,target:`docs`,value:500},{source:`pricing`,target:`trial`,value:2900},{source:`pricing`,target:`left`,value:5800},{source:`docs`,target:`trial`,value:1500},{source:`docs`,target:`left`,value:3600}]},x=[{id:`subs`,label:`Subscriptions`,color:1},{id:`services`,label:`Services`,color:3},{id:`market`,label:`Marketplace`,color:7},{id:`revenue`,label:`Revenue`,color:1},{id:`gross`,label:`Gross profit`,tone:`success`},{id:`cogs`,label:`Cost of revenue`,tone:`danger`},{id:`op`,label:`Operating profit`,tone:`success`},{id:`rnd`,label:`R&D`,color:2},{id:`snm`,label:`Sales & marketing`,color:5},{id:`gna`,label:`G&A`,color:4}],S=[{source:`subs`,target:`revenue`,value:82e5},{source:`services`,target:`revenue`,value:16e5},{source:`market`,target:`revenue`,value:9e5},{source:`revenue`,target:`gross`,value:76e5},{source:`revenue`,target:`cogs`,value:31e5},{source:`gross`,target:`rnd`,value:26e5},{source:`gross`,target:`snm`,value:22e5},{source:`gross`,target:`gna`,value:7e5},{source:`gross`,target:`op`,value:21e5}],C=[{source:`Applied`,target:`Screened`,value:640},{source:`Applied`,target:`Not a fit`,value:1180},{source:`Screened`,target:`Interviewed`,value:260},{source:`Screened`,target:`Withdrew`,value:90},{source:`Screened`,target:`Not a fit `,value:290},{source:`Interviewed`,target:`Offer`,value:48},{source:`Interviewed`,target:`Rejected`,value:212},{source:`Offer`,target:`Hired`,value:41},{source:`Offer`,target:`Declined`,value:7}],w=[{id:`Applied`,color:1},{id:`Screened`,color:7},{id:`Interviewed`,color:3},{id:`Offer`,color:5},{id:`Hired`,tone:`success`},{id:`Not a fit`,tone:`danger`},{id:`Not a fit `,label:`Not a fit`,tone:`danger`},{id:`Withdrew`,color:4},{id:`Rejected`,color:8},{id:`Declined`,color:2}];function T(){let[e,t]=(0,_.useState)(`this`),n=b[e],r=n.filter(e=>e.target===`pricing`||e.target===`docs`).reduce((e,t)=>e+t.value,0);return(0,v.jsx)(a,{title:`Customer journey, morphing week to week`,description:`Ribbons fade from the source's color into the target's. Switch the week: nodes slide and ribbons reshape instead of redrawing. Focus the chart and use the arrow keys: up and down within a column, right to follow a node's flows out, right again to the next node.`,variant:`bare`,controls:(0,v.jsx)(d,{label:`Week`,size:`sm`,options:[{value:`last`,label:`Last week`},{value:`this`,label:`This week`}],value:e,onValueChange:e=>(0,_.startTransition)(()=>t(e))}),code:`
import { ChartCard, SankeyTable, SankeyChart, type SankeyNode, type SankeyLink } from "@sheenui/theme";

const nodes: SankeyNode[] = [
  { id: "organic", label: "Organic search", color: 1 },
  { id: "paid", label: "Paid ads", color: 2 },
  { id: "social", label: "Social", color: 5 },
  { id: "referral", label: "Referrals", color: 3 },
  { id: "pricing", label: "Pricing page", color: 7 },
  { id: "docs", label: "Docs", color: 4 },
  { id: "trial", label: "Started trial", tone: "success" },
  { id: "left", label: "Left", tone: "danger" },
];
const links: SankeyLink[] = [
  { source: "organic", target: "pricing", value: 4200 },
  { source: "organic", target: "docs", value: 3100 },
  { source: "paid", target: "pricing", value: 2600 },
  // ...
  { source: "pricing", target: "trial", value: 3800 },
  { source: "pricing", target: "left", value: 5400 },
  { source: "docs", target: "trial", value: 2100 },
  { source: "docs", target: "left", value: 3600 },
];

<ChartCard
  title="Customer journey"
  description="Visitors this week, by source and first page"
  table={<SankeyTable nodes={nodes} links={links} caption="Every flow" />}
>
  <SankeyChart nodes={nodes} links={links} aria-label="Where this week's visitors came from, and where they went" />
</ChartCard>`,children:(0,v.jsx)(m,{className:`w-full`,title:`Customer journey`,description:`Visitors ${e===`this`?`this`:`last`} week, by source and first page`,aside:(0,v.jsx)(f,{value:r,label:`visitors`}),table:(0,v.jsx)(s,{nodes:y,links:n,caption:`Every flow`}),children:(0,v.jsx)(o,{nodes:y,links:n,"aria-label":`Where ${e===`this`?`this`:`last`} week's visitors came from, and where they went`})})})}var E=`theme/src/components/charts/`;function D(){return(0,v.jsxs)(n,{eyebrow:`Chart`,title:`Sankey diagram`,description:`Flows between stages, drawn as ribbons whose thickness is the amount: where visitors come from and where they go, how revenue turns into profit. The layout is computed in the component (no dependency): columns first, then a few relaxation passes so ribbons run as straight as possible. Hover a node to trace every path through it, hover a ribbon to read one flow, or walk the graph with the arrow keys.`,source:`${E}sankey-chart.tsx`,children:[(0,v.jsx)(c,{label:`Sankey diagram demo`,title:`Where visitors came from, and where they went`,hue:1,height:`22.5rem`,children:(0,v.jsx)(o,{nodes:y,links:b.this,"aria-label":`Where this week's visitors came from, and where they went`})}),(0,v.jsx)(T,{}),(0,v.jsx)(a,{title:`Income statement, revenue to profit`,description:`Four columns from revenue streams to profit. Sinks line up in the last column (align justify, the default). Values use a currency format; labels move outside the diagram on wide cards and inside on narrow ones, and are only printed where they fit.`,variant:`bare`,code:`
import { SankeyChart } from "@sheenui/theme";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

<SankeyChart
  nodes={[
    { id: "subs", label: "Subscriptions", color: 1 },
    { id: "services", label: "Services", color: 3 },
    { id: "market", label: "Marketplace", color: 7 },
    { id: "revenue", label: "Revenue", color: 1 },
    { id: "gross", label: "Gross profit", tone: "success" },
    { id: "cogs", label: "Cost of revenue", tone: "danger" },
    { id: "op", label: "Operating profit", tone: "success" },
    { id: "rnd", label: "R&D", color: 2 },
    { id: "snm", label: "Sales & marketing", color: 5 },
    { id: "gna", label: "G&A", color: 4 },
  ]}
  links={[
    { source: "subs", target: "revenue", value: 8_200_000 },
    { source: "services", target: "revenue", value: 1_600_000 },
    { source: "market", target: "revenue", value: 900_000 },
    { source: "revenue", target: "gross", value: 7_600_000 },
    { source: "revenue", target: "cogs", value: 3_100_000 },
    { source: "gross", target: "rnd", value: 2_600_000 },
    { source: "gross", target: "snm", value: 2_200_000 },
    { source: "gross", target: "gna", value: 700_000 },
    { source: "gross", target: "op", value: 2_100_000 },
  ]}
  height={340}
  format={(n) => usd.format(n)}
  aria-label="Fiscal 2025 income statement, from revenue streams to operating profit"
/>`,children:(0,v.jsx)(m,{className:`w-full`,title:`Income statement`,description:`Fiscal 2025`,aside:(0,v.jsx)(f,{value:21e5,label:`operating profit`,currency:!0}),table:(0,v.jsx)(s,{nodes:x,links:S,format:p,caption:`Income statement flows`}),children:(0,v.jsx)(o,{nodes:x,links:S,height:340,format:p,"aria-label":`Fiscal 2025 income statement, from revenue streams to operating profit`})})}),(0,v.jsx)(a,{title:`Hiring pipeline, aligned left, colored by source`,description:`align="left" puts every node at its distance from the start, so candidates who drop out early stop early. linkColor="source" paints each ribbon in its source stage. Nodes named only in links take their id as the label. On a phone the five columns scroll sideways inside the card.`,variant:`bare`,code:`
import { SankeyChart } from "@sheenui/theme";

<SankeyChart
  align="left"
  linkColor="source"
  nodes={[
    { id: "Applied", color: 1 },
    { id: "Screened", color: 7 },
    { id: "Interviewed", color: 3 },
    { id: "Offer", color: 5 },
    { id: "Hired", tone: "success" },
    { id: "Not a fit", tone: "danger" },
    // Two nodes may share a label; give them different ids.
    { id: "Not a fit ", label: "Not a fit", tone: "danger" },
    { id: "Withdrew", color: 4 },
    { id: "Rejected", color: 8 },
    { id: "Declined", color: 2 },
  ]}
  links={[
    { source: "Applied", target: "Screened", value: 640 },
    { source: "Applied", target: "Not a fit", value: 1180 },
    { source: "Screened", target: "Interviewed", value: 260 },
    { source: "Screened", target: "Withdrew", value: 90 },
    { source: "Screened", target: "Not a fit ", value: 290 },
    { source: "Interviewed", target: "Offer", value: 48 },
    { source: "Interviewed", target: "Rejected", value: 212 },
    { source: "Offer", target: "Hired", value: 41 },
    { source: "Offer", target: "Declined", value: 7 },
  ]}
  aria-label="Engineering hiring pipeline, from application to hire"
/>`,children:(0,v.jsx)(m,{className:`w-full`,title:`Hiring pipeline`,description:`Engineering roles, first half`,aside:(0,v.jsx)(f,{value:41,label:`hired`}),table:(0,v.jsx)(s,{nodes:w,links:C,caption:`Pipeline flows`}),children:(0,v.jsx)(o,{align:`left`,linkColor:`source`,nodes:w,links:C,"aria-label":`Engineering hiring pipeline, from application to hire`})})}),(0,v.jsx)(i,{of:h}),(0,v.jsx)(i,{title:`SankeyTable`,as:`h3`,of:g}),(0,v.jsx)(r,{rows:[[`Tab`,`Focus the diagram (one stop; a narrow card scrolls it sideways to keep the active node in view).`],[`↑ / ↓`,`Previous / next node in the column; on a flow, the previous / next flow of the same node.`],[`→ / ←`,`Follow the node's first outgoing / incoming flow; on a flow, go on to its target / source node.`],[`Home / End`,`First node of the first column / last node of the last column.`],[`Enter / Space`,`Call onNodeClick or onLinkClick for the active node or flow.`],[`Escape`,`Clear the reading.`]]}),(0,v.jsxs)(t,{children:[(0,v.jsx)(`li`,{children:`The diagram is one focusable figure with the role description “sankey diagram”; its description is the keyboard instructions.`}),(0,v.jsx)(`li`,{children:`Keyboard moves are announced once through a polite live region (“Paid ads → Pricing page: 2.6K, 81% of Paid ads outflow, 28% of Pricing page inflow”); pointer hovers stay silent.`}),(0,v.jsx)(`li`,{children:`The Table view (SankeyTable) lists every flow with its share of both ends: the color-free way to read it.`}),(0,v.jsx)(`li`,{children:`On touch screens the first tap pins the readout in a band above the diagram; a second tap on the same mark activates it.`}),(0,v.jsx)(`li`,{children:`Reduced motion: the diagram appears complete and data changes jump. Forced colors: ribbons and nodes take system colors and the active node gets a Highlight ring.`})]})]})}export{D as default};