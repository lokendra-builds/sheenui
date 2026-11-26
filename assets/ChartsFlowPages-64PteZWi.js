import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,n,o as r,r as i}from"./Page-BAL5Idhy.js";import{t as a}from"./Example-BPfHvEYD.js";import{i as o,n as s,t as c}from"./chord-diagram-JCqTrSh7.js";import{i as l,t as u}from"./vendor-react-D30i__oY.js";import{n as d}from"./chart-tip-C3pjTuq3.js";import{o as f}from"./heatmap-CfSLIzN2.js";import{t as p}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{t as m}from"./Segmented-kx7yHseo.js";import{n as h,t as g}from"./shared-CYfc5WM4.js";var _=e(l(),1),v=u(),y={corner:`From \\ To`,total:`Total out`,other:`Other`};function b({groups:e,matrix:t,format:n,locale:r,caption:i,labels:a,emptyState:s}){let{corner:c,total:l,other:u}={...y,...a},p=n??f(r),{groups:m,matrix:h}=o(e,t,u);return(0,v.jsx)(d,{caption:i,emptyState:s,columns:[{label:c},...m.map(e=>({label:e.label})),{label:l}],rows:m.map((e,t)=>[e.label,...m.map((e,n)=>p(h[t]?.[n]??0)),(0,v.jsx)(`strong`,{className:`font-semibold`,children:p((h[t]??[]).reduce((e,t)=>e+t,0))})])})}var x=[[`groups`,`readonly ChordGroup[]`,``,`The groups around the circle, in order (≤ 8; the rest fold into "Other").`,!0],[`matrix`,`readonly (readonly number[])[]`,``,`matrix[i][j]: the flow from group i to group j (the ribbon's width at i). Missing and negative values read as 0.`,!0],[`height`,`number`,`360`,`Height in px; the circle fits the smaller of width and height.`,!1],[`padAngle`,`number`,`0.04`,`Gap between groups, in radians.`,!1],[`showLabels`,`boolean`,`true`,`Print each group's name outside the ring where it fits; names that don't fit are listed in a legend under the circle.`,!1],[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the tooltips and data table: takes the share, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`onGroupClick`,`((group: { id: string; label: string; outflow: number; inflow: number; }) => void)`,``,`Called with { id, label, outflow, inflow } when a group is clicked, tapped, or activated with Enter. Makes groups interactive.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<ChordDiagramLabels>`,`defaultChordDiagramLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultChordDiagramLabels`. All 10 keys of `ChordDiagramLabels` are listed in the key table under the props table.',!1,{type:`ChordDiagramLabels`,const:`defaultChordDiagramLabels`,keys:[[`roleDescription`,`chord diagram`],[`instructions`,`Use the arrow keys to read it: left and right move around the groups, down steps through a group's ribbons, right and left on a ribbon jump between its two ends.`],[`hint`,`Tap a group or a ribbon to read it`],[`other`,`Other`],[`outflow`,`out`],[`inflow`,`in`],[`ofTotal`,`of all flow`],[`ribbonTitle`,"(a, b) => `${a} and ${b}`"],[`direction`,"(from, to) => `${from} → ${to}`"],[`ribbonCount`,'(count) => `${count} ${count === 1 ? "ribbon" : "ribbons"}`']]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],S=[[`format`,`((n: number) => string)`,`compact numbers in locale`,`Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number formats.`,!1],[`groups`,`readonly ChordGroup[]`,``,`The groups around the circle, in order (≤ 8; the rest fold into "Other").`,!0],[`matrix`,`readonly (readonly number[])[]`,``,`matrix[i][j]: the flow from group i to group j (the ribbon's width at i). Missing and negative values read as 0.`,!0],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`labels`,`Partial<ChordTableLabels>`,`defaultChordTableLabels`,'Column headers. Merged over `defaultChordTableLabels`. Every other string, for translation: `labels={{ corner: "…" }}`; omitted keys keep the English of `defaultChordTableLabels`. All 3 keys of `ChordTableLabels` are listed in the key table under the props table.',!1,{type:`ChordTableLabels`,const:`defaultChordTableLabels`,keys:[[`corner`,`From \\ To`],[`total`,`Total out`],[`other`,`Other`]]}],[`emptyState`,`ReactNode`,``,`Shown when there are no rows.`,!1]],C=[{id:`free`,label:`Free`,color:7},{id:`starter`,label:`Starter`,color:3},{id:`pro`,label:`Pro`,color:1},{id:`team`,label:`Team`,color:5},{id:`enterprise`,label:`Enterprise`,color:2}],w={q2:[[0,520,340,90,12],[210,0,460,150,18],[150,240,0,380,70],[40,90,230,0,160],[6,14,60,110,0]],q3:[[0,640,410,120,16],[230,0,540,190,26],[130,270,0,460,95],[35,80,210,0,210],[4,12,45,130,0]]},T=[{id:`web`,label:`Web`,color:1},{id:`mobile`,label:`Mobile`,color:2},{id:`platform`,label:`Platform`,color:3},{id:`data`,label:`Data`,color:4},{id:`design`,label:`Design system`,color:5},{id:`infra`,label:`Infrastructure`,color:7}],E=[[0,46,38,12,64,9],[41,0,22,8,37,6],[29,18,0,44,11,57],[9,6,39,0,4,31],[58,33,7,3,0,2],[5,4,49,27,1,0]];function D(){let[e,t]=(0,_.useState)(`q3`),n=w[e],r=n.reduce((e,t)=>e+t.reduce((e,t)=>e+t,0),0);return(0,v.jsx)(a,{title:`Plan changes, quarter on quarter`,description:`Accounts that moved between plans. Hover a plan to light up its ribbons; hover a ribbon to read both directions. Switch the quarter: every arc and ribbon tweens to its new angle. With the keyboard, left and right go around the plans, down steps through a plan's ribbons.`,variant:`bare`,controls:(0,v.jsx)(m,{label:`Quarter`,size:`sm`,options:[{value:`q2`,label:`Q2`},{value:`q3`,label:`Q3`}],value:e,onValueChange:e=>(0,_.startTransition)(()=>t(e))}),code:`
import { ChartCard, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const groups: ChordGroup[] = [
  { id: "free", label: "Free", color: 7 },
  { id: "starter", label: "Starter", color: 3 },
  { id: "pro", label: "Pro", color: 1 },
  { id: "team", label: "Team", color: 5 },
  { id: "enterprise", label: "Enterprise", color: 2 },
];
// matrix[from][to]: accounts that moved from one plan to another.
const matrix = [
  [0, 640, 410, 120, 16],
  [230, 0, 540, 190, 26],
  [130, 270, 0, 460, 95],
  [35, 80, 210, 0, 210],
  [4, 12, 45, 130, 0],
];

<ChartCard
  title="Plan changes"
  table={<ChordTable groups={groups} matrix={matrix} caption="Moves between plans" />}
>
  <ChordDiagram groups={groups} matrix={matrix} aria-label="Accounts moving between plans this quarter" />
</ChartCard>`,children:(0,v.jsx)(g,{className:`w-full`,title:`Plan changes`,description:`Accounts that changed plan in ${e.toUpperCase()}`,aside:(0,v.jsx)(h,{value:r,label:`accounts moved`}),table:(0,v.jsx)(b,{groups:C,matrix:n,caption:`Moves between plans`}),children:(0,v.jsx)(c,{groups:C,matrix:n,"aria-label":`Accounts moving between plans in ${e.toUpperCase()}`})})})}var O=`theme/src/components/charts/`;function k(){return(0,v.jsxs)(n,{eyebrow:`Chart`,title:`Chord diagram`,description:`Flows between a handful of groups as ribbons across a circle: plan upgrades and downgrades, who reviews whose code, trade between regions. Each group's arc is everything it sends; a ribbon's width at each end is the flow from that end to the other, and it blends from one group's color into the other's.`,source:`${O}chord-diagram.tsx`,children:[(0,v.jsx)(p,{label:`Chord diagram demo`,title:`Plan changes, quarter on quarter`,hue:7,height:`22.5rem`,narrowHeight:`20.375rem`,children:(0,v.jsx)(c,{groups:C,matrix:w.q3,"aria-label":`Accounts moving between plans in Q3`})}),(0,v.jsx)(D,{}),(0,v.jsx)(a,{title:`Code review across teams, names in the legend`,description:`showLabels={false} leaves the names to the ChartCard legend (chordLegend), so the circle gets all the room. With the default showLabels, names that would not fit around the ring (a phone, a crowded side) move into a legend under the circle by themselves.`,variant:`bare`,code:`
import { ChartCard, chordLegend, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const teams: ChordGroup[] = [
  { id: "web", label: "Web", color: 1 },
  { id: "mobile", label: "Mobile", color: 2 },
  { id: "platform", label: "Platform", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "design", label: "Design system", color: 5 },
  { id: "infra", label: "Infrastructure", color: 7 },
];

// reviews[i][j]: pull requests team i reviewed from team j
const reviews = [
  [0, 46, 38, 12, 64, 9],
  [41, 0, 22, 8, 37, 6],
  [29, 18, 0, 44, 11, 57],
  [9, 6, 39, 0, 4, 31],
  [58, 33, 7, 3, 0, 2],
  [5, 4, 49, 27, 1, 0],
];

export function Example() {
  return (
    <ChartCard
      title="Who reviews whom"
      legend={chordLegend(teams)}
      table={<ChordTable groups={teams} matrix={reviews} caption="Reviews between teams" />}
    >
      <ChordDiagram
        groups={teams}
        matrix={reviews}
        showLabels={false}
        height={320}
        aria-label="Pull request reviews between six teams, last 90 days"
      />
    </ChartCard>
  );
}`,children:(0,v.jsx)(g,{className:`w-full`,title:`Who reviews whom`,description:`Pull request reviews, last 90 days`,legend:s(T),table:(0,v.jsx)(b,{groups:T,matrix:E,caption:`Reviews between teams`}),children:(0,v.jsx)(c,{groups:T,matrix:E,showLabels:!1,height:320,"aria-label":`Pull request reviews between six teams, last 90 days`})})}),(0,v.jsx)(i,{of:x}),(0,v.jsx)(i,{as:`h2`,title:`ChordTable props`,of:S}),(0,v.jsx)(r,{rows:[[`Tab`,`Focus the diagram (one stop).`],[`← / →`,`Previous / next group around the circle; on a ribbon, back to its group / on to its other end.`],[`↓ / ↑`,`Step through the active group's ribbons, largest first (↑ from the first ribbon returns to the group; ↑ on a group goes round to its last ribbon).`],[`Home / End`,`First / last group.`],[`Enter / Space`,`Call onGroupClick for the active group.`],[`Escape`,`From a ribbon back to its group; then clear the reading.`]]}),(0,v.jsxs)(t,{children:[(0,v.jsx)(`li`,{children:`The diagram is one focusable figure with the role description “chord diagram”; keys never scroll the page while it has focus.`}),(0,v.jsx)(`li`,{children:`A group is announced with its outflow, inflow and share (“Pro: 1,185 out, 1,235 in, 30% of all flow. 5 ribbons”); a ribbon reads both directions.`}),(0,v.jsx)(`li`,{children:`Names that don't fit around the ring move into a legend under it by themselves; the Table view (ChordTable) is the full matrix.`}),(0,v.jsx)(`li`,{children:`On the light theme, crowded diagrams (more than 5 groups) blend ribbons normally at a lower opacity, so crossings stay clean and readable.`}),(0,v.jsx)(`li`,{children:`Reduced motion: the ring and ribbons appear at once and data changes jump.`})]})]})}export{k as default,y as n,b as t};