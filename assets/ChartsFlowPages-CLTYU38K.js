import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,n,o as r,r as i}from"./Page-BAL5Idhy.js";import{t as a}from"./Example-BPfHvEYD.js";import{a as o,r as s,t as c}from"./network-graph-B_DW4WIv.js";import{i as l,t as u}from"./vendor-react-D30i__oY.js";import{T as d}from"./chart-utils-DvmgVWft.js";import{n as f}from"./chart-tip-C3pjTuq3.js";import{o as p}from"./heatmap-CfSLIzN2.js";import{t as m}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{t as h}from"./demo-utils-DKtmFFFD.js";import{t as g}from"./Segmented-kx7yHseo.js";import{n as _,t as v}from"./shared-CYfc5WM4.js";var y=e(l(),1),b=u();function x({nodes:e,links:t,groups:n,format:r,locale:i,caption:a,headers:s,emptyState:c}){let l=r??p(i),u={node:`Node`,group:`Group`,connections:`Connections`,value:`Value`,linked:`Connected to`,...s},m=o(e,t,n),h=m.nodes.some(e=>e.groupLabel),g=m.nodes.some(e=>e.value!==null);return(0,b.jsx)(f,{caption:a,emptyState:c,columns:[{label:u.node},...h?[{label:u.group,align:`start`}]:[],{label:u.connections},...g?[{label:u.value}]:[],{label:u.linked,align:`start`}],rows:m.nodes.map(e=>[e.label,...h?[e.groupLabel??``]:[],l(e.neighbours.length),...g?[e.value===null?``:l(e.value)]:[],(0,b.jsx)(`span`,{className:`inline-block min-w-48 whitespace-normal text-sheen-fg-muted`,children:e.neighbours.map(e=>d(m.nodes,e).label).join(`, `)})])})}var S=[[`nodes`,`readonly NetworkNode[]`,``,"The nodes: { id, label?, group?, value? }. `value` sizes the dot.",!0],[`links`,`readonly NetworkLink[]`,``,`Ties between nodes (undirected). Repeated pairs add up; links to unknown ids are left out.`,!0],[`groups`,`readonly NetworkGroup[]`,``,`Names and colour slots of the groups. Groups only named on nodes get the next free slot.`,!1],[`height`,`number`,`420`,`Height of the chart in px; the width follows the container.`,!1],[`showLabels`,`"none" | "auto" | "all"`,`"auto"`,`Which names to print: where they fit without colliding ("auto", default), all, or none.`,!1],[`forces`,`ForceSimulationOptions`,`{}`,`Sets the tuning of the force layout.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats node values.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`onNodeClick`,`((node: { id: string; label: string; group: string | null; connections: string[]; }) => void)`,``,`Called with { id, label, group, connections } when a node is clicked, tapped, or activated with Enter.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<NetworkGraphLabels>`,`defaultNetworkGraphLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultNetworkGraphLabels`. All 10 keys of `NetworkGraphLabels` are listed in the key table under the props table.',!1,{type:`NetworkGraphLabels`,const:`defaultNetworkGraphLabels`,keys:[[`roleDescription`,`network graph`],[`instructions`,`Use the arrow keys to move to the nearest node in that direction, Page Up and Page Down to step through every node in order, plus and minus to zoom and 0 to fit. Drag a node to move it; Ctrl or Command and scroll to zoom.`],[`hint`,`Tap a node to see its connections`],[`connections`,`(count) => (count === 1 ? "connection" : "connections")`],[`value`,`value`],[`connectedTo`,'(names, more) => `Connected to ${names.join(", ")}${more > 0 ? ` and ${more} more` : ""}`'],[`zoomIn`,`Zoom in`],[`zoomOut`,`Zoom out`],[`fit`,`Fit to view`],[`zoomControls`,`Zoom`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],C=[[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats node values.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`groups`,`readonly NetworkGroup[]`,``,`Names and colour slots of the groups. Groups only named on nodes get the next free slot.`,!1],[`nodes`,`readonly NetworkNode[]`,``,"The nodes: { id, label?, group?, value? }. `value` sizes the dot.",!0],[`links`,`readonly NetworkLink[]`,``,`Ties between nodes (undirected). Repeated pairs add up; links to unknown ids are left out.`,!0],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`headers`,`Partial<{ node: string; group: string; connections: string; value: string; linked: string; }>`,``,`Override the column headers: { node, group, connections, value, linked }.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],w=[{id:`edge`,label:`Edge`,color:7},{id:`core`,label:`Core services`,color:1},{id:`data`,label:`Data stores`,color:3},{id:`external`,label:`Third party`,color:2}],T=[{id:`cdn`,label:`CDN`,group:`edge`,value:9},{id:`gateway`,label:`API gateway`,group:`edge`,value:14},{id:`web`,label:`Web app`,group:`edge`,value:8},{id:`auth`,label:`Auth`,group:`core`,value:12},{id:`users`,label:`Users`,group:`core`,value:9},{id:`billing`,label:`Billing`,group:`core`,value:7},{id:`orders`,label:`Orders`,group:`core`,value:11},{id:`catalog`,label:`Catalog`,group:`core`,value:8},{id:`search`,label:`Search`,group:`core`,value:7},{id:`notify`,label:`Notifications`,group:`core`,value:5},{id:`inventory`,label:`Inventory`,group:`core`,value:6},{id:`shipping`,label:`Shipping`,group:`core`,value:5},{id:`pg`,label:`Postgres`,group:`data`,value:13},{id:`redis`,label:`Redis`,group:`data`,value:8},{id:`elastic`,label:`Elasticsearch`,group:`data`,value:6},{id:`kafka`,label:`Kafka`,group:`data`,value:10},{id:`s3`,label:`Object store`,group:`data`,value:5},{id:`payments-api`,label:`Payments API`,group:`external`,value:4},{id:`sms-gateway`,label:`SMS gateway`,group:`external`,value:3},{id:`carrier`,label:`Carrier API`,group:`external`,value:3}],E=[[`cdn`,`web`],[`web`,`gateway`],[`gateway`,`auth`],[`gateway`,`users`],[`gateway`,`orders`],[`gateway`,`catalog`],[`gateway`,`search`],[`auth`,`users`],[`auth`,`redis`],[`users`,`pg`],[`billing`,`pg`],[`billing`,`payments-api`],[`orders`,`billing`],[`orders`,`inventory`],[`orders`,`pg`],[`orders`,`kafka`],[`orders`,`shipping`],[`catalog`,`pg`],[`catalog`,`s3`],[`catalog`,`kafka`],[`search`,`elastic`],[`kafka`,`search`],[`kafka`,`notify`],[`notify`,`sms-gateway`],[`inventory`,`pg`],[`inventory`,`kafka`],[`shipping`,`carrier`],[`shipping`,`kafka`],[`users`,`notify`],[`cdn`,`s3`]].map(([e=``,t=``])=>({source:e,target:t})),D=`Ada.Ben.Cleo.Dev.Eli.Fay.Gus.Hana.Ivo.Jun.Kai.Lea.Mo.Nia.Oz.Pia.Quin.Rae.Sol.Tia.Uma.Vik.Wes.Xia.Yan.Zoe.Abe.Bea.Cal.Dot.Ed.Flo.Gia.Hal.Ida.Jay.Kim.Lu.Max.Ned`.split(`.`),O=[{id:`product`,label:`Product`,color:1},{id:`design`,label:`Design`,color:5},{id:`eng`,label:`Engineering`,color:3},{id:`data`,label:`Data`,color:4},{id:`ops`,label:`Operations`,color:7}],k=(()=>{let e=h(7),t=D.map((e,t)=>({id:e,group:O[t%O.length]?.id??``})),n=[],r=new Set,i=(e,t,i)=>{let a=e<t?`${e}-${t}`:`${t}-${e}`;e===t||r.has(a)||(r.add(a),n.push({source:D[e]??``,target:D[t]??``,value:i}))};for(let t=0;t<D.length;t++){for(let n=0;n<2+Math.floor(e()*2);n++)i(t,(t+O.length*(1+Math.floor(e()*4)))%D.length,1+Math.floor(e()*9));e()<.45&&i(t,Math.floor(e()*D.length),1+Math.floor(e()*4))}return{nodes:t,links:n}})(),A=T.filter(e=>e.id!==`search`&&e.id!==`elastic`),j=E.filter(e=>![`search`,`elastic`].includes(e.source)&&![`search`,`elastic`].includes(e.target));function M(){let[e,t]=(0,y.useState)(!0),n=e?T:A,r=e?E:j;return(0,b.jsx)(a,{title:`Service dependency map`,description:`Hover a service to light up what it talks to; drag it and the rest of the graph follows, then settles. Ctrl or ⌘ + scroll, a pinch or the buttons zoom; drag the background to pan. Remove the search services: the rest glide to their new places. Node size is the service's traffic.`,variant:`bare`,controls:(0,b.jsx)(g,{label:`Services`,size:`sm`,options:[{value:`all`,label:`All services`},{value:`nosearch`,label:`Without search`}],value:e?`all`:`nosearch`,onValueChange:e=>(0,y.startTransition)(()=>t(e===`all`))}),code:`
import { ChartCard, networkLegend, NetworkTable, NetworkGraph, type NetworkGroup, type NetworkNode, type NetworkLink } from "@sheenui/theme";

const groups: NetworkGroup[] = [
  { id: "edge", label: "Edge", color: 7 },
  { id: "core", label: "Core services", color: 1 },
  { id: "data", label: "Data stores", color: 3 },
  { id: "external", label: "Third party", color: 2 },
];
const nodes: NetworkNode[] = [
  { id: "gateway", label: "API gateway", group: "edge", value: 14 },
  { id: "auth", label: "Auth", group: "core", value: 12 },
  { id: "pg", label: "Postgres", group: "data", value: 13 },
  // ...
];
const links: NetworkLink[] = [
  { source: "gateway", target: "auth" },
  { source: "auth", target: "redis" },
  // ...
];

<ChartCard
  title="Service dependencies"
  legend={networkLegend(groups)}
  table={<NetworkTable nodes={nodes} links={links} groups={groups} caption="Every service and what it calls" />}
>
  <NetworkGraph nodes={nodes} links={links} groups={groups} aria-label="Dependencies between production services" />
</ChartCard>`,children:(0,b.jsx)(v,{className:`w-full`,title:`Service dependencies`,description:`Production, calls in the last hour`,aside:(0,b.jsx)(_,{value:r.length,label:`dependencies`}),legend:s(w),table:(0,b.jsx)(x,{nodes:n,links:r,groups:w,caption:`Every service and what it calls`}),children:(0,b.jsx)(c,{nodes:n,links:r,groups:w,"aria-label":`Dependencies between production services`})})})}var N=`theme/src/components/charts/`;function P(){return(0,b.jsxs)(n,{eyebrow:`Chart`,title:`Network graph`,description:`Who is connected to whom: services and their dependencies, people who work together, pages that link to each other. Laid out by a force simulation written in the component (link springs, charge, gravity, collision), computed in small chunks between frames and the same on every load. Nodes ripple out from the best connected one, then the links draw in.`,source:`${N}network-graph.tsx`,children:[(0,b.jsx)(m,{label:`Network graph demo`,title:`Service dependencies`,hue:7,height:`26.25rem`,children:(0,b.jsx)(c,{nodes:T,links:E,groups:w,"aria-label":`Dependencies between production services`})}),(0,b.jsx)(M,{}),(0,b.jsx)(a,{title:`Collaboration network, weighted ties`,description:`Forty people in five teams; a tie's weight is how often two people worked together, and it sets the line's thickness. Names are printed only where they fit without colliding; zoom in and more appear.`,variant:`bare`,code:`
import { NetworkGraph, type NetworkGroup, type NetworkLink, type NetworkNode } from "@sheenui/theme";

const teams: NetworkGroup[] = [
  { id: "product", label: "Product", color: 1 },
  { id: "design", label: "Design", color: 5 },
  { id: "eng", label: "Engineering", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "ops", label: "Operations", color: 7 },
];

const people: NetworkNode[] = [
  { id: "Ada", group: "product" },
  { id: "Ben", group: "design" },
  { id: "Cleo", group: "eng" },
  { id: "Dev", group: "data" },
  { id: "Eli", group: "ops" },
  { id: "Fay", group: "product" },
  { id: "Gus", group: "design" },
  { id: "Hana", group: "eng" },
];

// value: how often two people worked together; it sets the line's thickness
const ties: NetworkLink[] = [
  { source: "Ada", target: "Fay", value: 6 },
  { source: "Ben", target: "Gus", value: 4 },
  { source: "Cleo", target: "Hana", value: 8 },
  { source: "Ada", target: "Ben", value: 2 },
  { source: "Cleo", target: "Dev", value: 3 },
  { source: "Dev", target: "Eli", value: 5 },
  { source: "Fay", target: "Hana", value: 1 },
];

export function Example() {
  return (
    <NetworkGraph
      nodes={people}
      links={ties}
      groups={teams}
      height={460}
      forces={{ charge: -140, linkDistance: 30 }}
      aria-label="Who worked with whom this quarter, across five teams"
    />
  );
}`,children:(0,b.jsx)(v,{className:`w-full`,title:`Collaboration`,description:`Shared projects this quarter`,legend:s(O),table:(0,b.jsx)(x,{nodes:k.nodes,links:k.links,groups:O,caption:`Every person and who they worked with`}),children:(0,b.jsx)(c,{nodes:k.nodes,links:k.links,groups:O,height:460,forces:{charge:-140,linkDistance:30},"aria-label":`Who worked with whom this quarter, across five teams`})})}),(0,b.jsx)(i,{of:S}),(0,b.jsx)(i,{as:`h2`,title:`NetworkTable props`,of:C}),(0,b.jsx)(r,{rows:[[`Tab`,`Focus the graph, then the zoom buttons.`],[`← / → / ↑ / ↓`,`Move to the nearest node in that direction (the view pans to keep it in sight).`],[`Page Down / Page Up`,`Next / previous node in data order.`],[`Home / End`,`First / last node.`],[`+ / −`,`Zoom in / out.`],[`0`,`Fit the whole graph.`],[`Enter / Space`,`Call onNodeClick for the active node.`],[`Escape`,`Clear the reading.`]]}),(0,b.jsxs)(t,{children:[(0,b.jsx)(`li`,{children:`The graph is one focusable figure with the role description “network graph”; a node is announced with its group, its connections and up to eight neighbor names.`}),(0,b.jsx)(`li`,{children:`The Table view (NetworkTable) is the keyboard list of every node and who it connects to.`}),(0,b.jsx)(`li`,{children:`Zoom buttons are real buttons (44px on touch). A plain scroll never hijacks the page: zoom needs Ctrl/⌘, a pinch or the buttons; one finger on the background still scrolls.`}),(0,b.jsx)(`li`,{children:`Every moving frame (layout, entrance, drag, pan, zoom) is written straight to the SVG, so the page stays smooth while you drag on a phone.`}),(0,b.jsx)(`li`,{children:`Reduced motion: the precomputed layout appears in place, and dragging moves only that node.`})]})]})}export{P as default,x as t};