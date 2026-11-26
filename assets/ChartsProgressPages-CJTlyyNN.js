import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{i as r,t as i}from"./category-bar-BQa3DUx-.js";import{j as a}from"./chart-utils-DvmgVWft.js";import{n as o}from"./chart-tip-C3pjTuq3.js";import{c as s,o as c}from"./heatmap-CfSLIzN2.js";import{t as l}from"./ExampleChartCard-DOQs1ydL.js";import{i as u,n as d,o as f,r as p}from"./Page-ClekXXh-.js";import{t as m}from"./Example-jva669kg.js";import{t as h}from"./Segmented-kx7yHseo.js";import{t as g}from"./ShowcaseStage.chart.scene-CXVExGyR.js";import{t as _}from"./shared-DRPI2QvD.js";var v=n();function y({data:e,start:t=0,format:n,formatPercent:i,locale:l,marker:u,markerLabel:d,labels:f,caption:p}){let m={...r,...f},h=n??c(l),g=i??s(l),_=e.map(e=>Math.max(0,a(e.value))),y=e.map((e,n)=>{let r=_[n]??0,i=_.slice(0,n).reduce((e,t)=>e+t,t);return{label:e.label,from:i,to:i+r,value:r}}),b=_.reduce((e,t)=>e+t,t),x=b-t,S=u!=null&&Number.isFinite(u)&&x>0,C=S?u:t,w=S&&C>=t&&C<=b?y.find((e,t)=>C<e.to||t===y.length-1):void 0,T=S?C>b?m.markerAbove(h(C)):C<t?m.markerBelow(h(C)):w?m.markerIn(h(C),w.label):h(C):``;return(0,v.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,v.jsx)(o,{caption:p,emptyState:m.empty,columns:[{label:m.band},{label:m.from},{label:m.to},{label:m.share}],rows:y.map(e=>[e.label,h(e.from),h(e.to),g(x>0?e.value/x:NaN)])}),S&&(0,v.jsxs)(`p`,{className:`text-sm text-sheen-fg-muted`,children:[d??m.marker,`: `,(0,v.jsx)(`span`,{className:`font-semibold text-sheen-fg tabular-nums`,children:T})]})]})}var b=[[`data`,`readonly CategoryBarItem[]`,``,`The bands, start to end. Their values are widths on one scale.`,!0],[`start`,`number`,`0`,`Where the scale starts (e.g. 300 for a credit score).`,!1],[`marker`,`number | null`,`null`,`A value on the same scale to point at (e.g. the current score). A value past either end keeps its real number (bubble, announcement, table) while the pin waits at that end with an arrow.`,!1],[`markerLabel`,`string`,``,`Text in the marker's bubble, before its value (e.g. "Your score").`,!1],[`showValues`,`boolean`,`true`,`Print the values at the band boundaries under the bar.`,!1],[`showLegend`,`boolean`,`false`,`Print each band's colour key and name under the bar.`,!1],[`size`,`"sm" | "md" | "lg"`,`"md"`,`Bar thickness: "sm" 6px, "md" 8px (default), "lg" 12px.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there are no bands.`,!1],[`labels`,`Partial<CategoryBarLabels>`,`defaultCategoryBarLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultCategoryBarLabels`. All 11 keys of `CategoryBarLabels` are listed in the key table under the props table.',!1,{type:`CategoryBarLabels`,const:`defaultCategoryBarLabels`,keys:[[`instructions`,`Use the arrow keys to read each band.`],[`range`,"(low, high) => (/^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`)"],[`marker`,`Marker`],[`markerIn`,"(value, band) => `${value}, in ${band}`"],[`markerAbove`,"(value) => `${value}, above the scale`"],[`markerBelow`,"(value) => `${value}, below the scale`"],[`band`,`Band`],[`from`,`From`],[`to`,`To`],[`share`,`Share`],[`empty`,`No data`]]}],[`aria-label`,`string`,``,`Names the bar for assistive tech (e.g. "Credit score bands").`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],x=[[`data`,`readonly CategoryBarItem[]`,``,`The bands, start to end. Their values are widths on one scale.`,!0],[`marker`,`number | null`,``,`A value on the same scale to point at (e.g. the current score). A value past either end keeps its real number (bubble, announcement, table) while the pin waits at that end with an arrow.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`start`,`number`,`0`,`Where the scale starts (e.g. 300 for a credit score).`,!1],[`labels`,`Partial<CategoryBarLabels>`,`defaultCategoryBarLabels`,'Every other string, for translation: `labels={{ instructions: "…" }}`; omitted keys keep the English of `defaultCategoryBarLabels`. All 11 keys of `CategoryBarLabels` are listed in the key table under the props table.',!1,{type:`CategoryBarLabels`,const:`defaultCategoryBarLabels`,keys:[[`instructions`,`Use the arrow keys to read each band.`],[`range`,"(low, high) => (/^[-−]/.test(low) || /^[-−]/.test(high) ? `${low} – ${high}` : `${low}–${high}`)"],[`marker`,`Marker`],[`markerIn`,"(value, band) => `${value}, in ${band}`"],[`markerAbove`,"(value) => `${value}, above the scale`"],[`markerBelow`,"(value) => `${value}, below the scale`"],[`band`,`Band`],[`from`,`From`],[`to`,`To`],[`share`,`Share`],[`empty`,`No data`]]}],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`markerLabel`,`string`,``,`Text in the marker's bubble, before its value (e.g. "Your score").`,!1],[`formatPercent`,`((ratio: number) => string)`,`percentages in locale`,`Formats a share of the total for the data table cells: takes the share, returns the text shown.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1]],S=e(t()),C=e=>`${Math.round(e).toLocaleString(`en`)} ms`,w=[{label:`Poor`,value:280,color:8},{label:`Fair`,value:90,color:2},{label:`Good`,value:70,color:4},{label:`Very good`,value:60,color:3},{label:`Exceptional`,value:50,color:6}],T={jan:612,apr:668,jul:724},E=[{label:`Fast`,value:200,color:3},{label:`Acceptable`,value:300,color:4},{label:`Slow`,value:500,color:2},{label:`Critical`,value:500,color:8}],D=[{label:`Needs work`,value:100,color:8},{label:`Good`,value:30,color:4},{label:`Great`,value:40,color:3},{label:`Excellent`,value:30,color:6}];function O(){let[e,t]=(0,S.useState)(`jul`),n=(0,S.useId)();return(0,v.jsxs)(d,{eyebrow:`Chart`,title:`Category bar`,description:`One bar split into named bands, with a pin for where a value sits: a credit score, a latency budget, an NPS. Boundary values are thinned so they never collide, the pin's bubble never leaves the bar, and every band can be read by hover, tap or arrow keys.`,source:`${_}category-bar.tsx`,children:[(0,v.jsx)(g,{label:`Category bar demo`,title:`Credit score`,hue:8,height:`6.5rem`,narrowHeight:`7.875rem`,children:(0,v.jsx)(i,{data:w,start:300,marker:724,markerLabel:`Your score`,showLegend:!0,"aria-label":`Credit score bands, 300 to 850`})}),(0,v.jsx)(m,{title:`Score with a marker`,description:`Bands on a 300–850 scale. Switch the month: the pin glides to the new score and its number rolls. Focus the bar and use the arrow keys to read each band.`,variant:`bare`,controls:(0,v.jsx)(h,{label:`Month`,size:`sm`,options:[{value:`jan`,label:`Jan`},{value:`apr`,label:`Apr`},{value:`jul`,label:`Jul`}],value:e,onValueChange:t}),code:`
import { ChartCard, CategoryBarTable, CategoryBar, type CategoryBarItem } from "@sheenui/theme";

const bands: CategoryBarItem[] = [
  { label: "Poor", value: 280, color: 8 },
  { label: "Fair", value: 90, color: 2 },
  { label: "Good", value: 70, color: 4 },
  { label: "Very good", value: 60, color: 3 },
  { label: "Exceptional", value: 50, color: 6 },
];

<ChartCard
  title="Credit score"
  table={<CategoryBarTable data={bands} start={300} marker={724} markerLabel="Your score" />}
>
  <CategoryBar
    data={bands}
    start={300}
    marker={724}
    markerLabel="Your score"
    showLegend
    aria-label="Credit score bands, 300 to 850"
  />
</ChartCard>`,children:(0,v.jsx)(l,{className:`w-full`,title:`Credit score`,description:`FICO® bands on the 300–850 scale`,table:(0,v.jsx)(y,{data:w,start:300,marker:T[e],markerLabel:`Your score`,caption:`Credit score bands`}),children:(0,v.jsx)(i,{data:w,start:300,marker:T[e],markerLabel:`Your score`,showLegend:!0,"aria-label":`Credit score bands, 300 to 850`})})}),(0,v.jsx)(m,{title:`Budgets and scores`,description:`Custom formats, a scale that starts below zero, and the compact size. Long boundary values drop out before they could touch.`,variant:`bare`,code:`
import { CategoryBar, type CategoryBarItem } from "@sheenui/theme";

const npsBands: CategoryBarItem[] = [
  { label: "Needs work", value: 100, color: 8 },
  { label: "Good", value: 30, color: 4 },
  { label: "Great", value: 40, color: 3 },
  { label: "Excellent", value: 30, color: 6 },
];

export function Example() {
  return (
    <>
      <CategoryBar
        data={[
          { label: "Fast", value: 200, color: 3 },
          { label: "Acceptable", value: 300, color: 4 },
          { label: "Slow", value: 500, color: 2 },
          { label: "Critical", value: 500, color: 8 },
        ]}
        marker={342}
        markerLabel="p95"
        format={(n) => Math.round(n).toLocaleString("en") + " ms"}
        aria-label="Checkout latency budget"
      />

      <CategoryBar
        data={npsBands}
        start={-100}
        marker={46}
        markerLabel="NPS"
        size="sm"
        showLegend
        aria-label="Net promoter score bands"
      />
    </>
  );
}`,children:(0,v.jsxs)(`div`,{className:`glass-2 grid w-full gap-x-8 gap-y-6 rounded-sheen-lg p-5 md:grid-cols-2`,children:[(0,v.jsxs)(`section`,{"aria-labelledby":`${n}-latency`,className:`flex min-w-0 flex-col gap-4`,children:[(0,v.jsxs)(`header`,{children:[(0,v.jsx)(`h3`,{id:`${n}-latency`,className:`font-semibold`,children:`Checkout latency`}),(0,v.jsx)(`p`,{className:`mt-0.5 text-sm text-sheen-fg-muted`,children:`p95 over the last hour`})]}),(0,v.jsx)(i,{data:E,marker:342,markerLabel:`p95`,format:C,"aria-label":`Checkout latency budget`})]}),(0,v.jsxs)(`section`,{"aria-labelledby":`${n}-nps`,className:`flex min-w-0 flex-col gap-4`,children:[(0,v.jsxs)(`header`,{children:[(0,v.jsx)(`h3`,{id:`${n}-nps`,className:`font-semibold`,children:`Net promoter score`}),(0,v.jsx)(`p`,{className:`mt-0.5 text-sm text-sheen-fg-muted`,children:`Q3 survey, 1,284 replies`})]}),(0,v.jsx)(i,{data:D,start:-100,marker:46,markerLabel:`NPS`,size:`sm`,showLegend:!0,"aria-label":`Net promoter score bands`})]})]})}),(0,v.jsx)(p,{of:b}),(0,v.jsx)(p,{as:`h2`,title:`CategoryBarTable props`,of:x}),(0,v.jsx)(f,{rows:[[`Tab`,`Focus the bar (one tab stop).`],[`→ / ↓`,`Next band (← in right-to-left layouts).`],[`← / ↑`,`Previous band.`],[`Home / End`,`First / last band.`],[`Escape`,`Stop reading.`]]}),(0,v.jsxs)(u,{children:[(0,v.jsx)(`li`,{children:`The bar is one focusable figure with a role description of “chart”; its description is the keyboard hint, and its description lists every band and where the marker falls.`}),(0,v.jsx)(`li`,{children:`Moving through the bands announces each span once through a polite live region; pointer hovers stay silent.`}),(0,v.jsx)(`li`,{children:`Bands are named in the legend, the tooltip and the table: color is never the only cue. Boundary values thin out instead of overlapping.`}),(0,v.jsx)(`li`,{children:`On touch screens the hit area grows to 44px without moving anything; forced colors outline every band and the pin.`}),(0,v.jsx)(`li`,{children:`Reduced motion: bands, pin and number appear in place, with no slide or roll.`})]})]})}export{O as default,y as t};