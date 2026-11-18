import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{t}from"./ExampleChartCard-ZE1sKvmi.js";import{i as n,n as r,o as i,r as a}from"./Page-BRuP8nt1.js";import{t as o}from"./Example-DaSezASZ.js";import{n as s,r as c,t as l}from"./beeswarm-B0pCfSEW.js";import{t as u}from"./ShowcaseStage.chart.scene-BbwlviML.js";import{t as d}from"./demo-utils-DKtmFFFD.js";import{i as f,t as p}from"./vendor-react-D30i__oY.js";import{t as m}from"./Segmented-ByB5jpmQ.js";import{a as h,i as g,n as _,t as v}from"./shared-Dbp0f8HM.js";var y=[[`data`,`readonly BeeswarmPoint[]`,``,`The observations to plot, each drawn as one dot.`,!0],[`groups`,`readonly string[]`,`the order groups first appear in`,"Sets the order of the rows (by `group`).",!1],[`series`,`readonly BeeswarmSeries[]`,`[]`,'Colour dots by series (fixed slots; up to 8, the rest fold into a grey "Other"). Without it every dot is `color`.',!1],[`color`,`ChartColor`,`1`,`Palette slot (1–8) when there are no series.`,!1],[`radius`,`number`,`4.5`,`Dot radius in px; dense swarms shrink towards 3 to keep their rows from growing too tall.`,!1],[`showMedian`,`boolean`,`true`,`Mark each row's median with a line.`,!1],[`includeZero`,`boolean`,`false`,`Keep 0 on the value axis.`,!1],[`highlight`,`string | string[]`,``,`Emphasise these points (by label or id); the rest step back.`,!1],[`valueLabel`,`string`,``,`Names the value axis.`,!1],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`emptyState`,`ReactNode`,``,`Shown when there is nothing to plot.`,!1],[`labels`,`Partial<BeeswarmLabels>`,`defaultBeeswarmLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultBeeswarmLabels`. All 11 keys of `BeeswarmLabels` are listed in the key table under the props table.',!1,{type:`BeeswarmLabels`,const:`defaultBeeswarmLabels`,keys:[[`roleDescription`,`beeswarm chart`],[`instructions`,`({ rows }) => rows ? "Use the left and right arrow keys to move along a row, and up and down to move betwee...`],[`hint`,`Tap a dot to read it`],[`value`,`Value`],[`median`,`Median`],[`rowSummary`,"(count, median) => `${count} · median ${median}`"],[`other`,`Other`],[`point`,`Point`],[`group`,`Group`],[`series`,`Series`],[`noData`,`No data`]]}],[`aria-label`,`string`,``,`Names the chart for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],b=[[`data`,`readonly BeeswarmPoint[]`,``,`The observations to plot, each drawn as one dot.`,!0],[`format`,`((n: number) => string)`,`formatCompact in locale`,`Formats a value for the labels, tooltips and data table: takes the number, returns the text shown.`,!1],[`labels`,`Partial<BeeswarmLabels>`,`defaultBeeswarmLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultBeeswarmLabels`. All 11 keys of `BeeswarmLabels` are listed in the key table under the props table.',!1,{type:`BeeswarmLabels`,const:`defaultBeeswarmLabels`,keys:[[`roleDescription`,`beeswarm chart`],[`instructions`,`({ rows }) => rows ? "Use the left and right arrow keys to move along a row, and up and down to move betwee...`],[`hint`,`Tap a dot to read it`],[`value`,`Value`],[`median`,`Median`],[`rowSummary`,"(count, median) => `${count} · median ${median}`"],[`other`,`Other`],[`point`,`Point`],[`group`,`Group`],[`series`,`Series`],[`noData`,`No data`]]}],[`locale`,`string`,`"en"`,`Locale of the default number format.`,!1],[`series`,`readonly BeeswarmSeries[]`,`[]`,'Colour dots by series (fixed slots; up to 8, the rest fold into a grey "Other"). Without it every dot is `color`.',!1],[`groups`,`readonly string[]`,`[]`,"Sets the order of the rows (by `group`).",!1],[`valueLabel`,`string`,``,`Names the value axis.`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],x=e(f(),1),S=p();function C(e=0){return[[`Free`,9.5,.55,70],[`Pro`,5.2,.45,60],[`Team`,3.4,.4,48]].flatMap(([t,n,r,i],a)=>{let o=h(d(300+a+e*10));return Array.from({length:i},(i,s)=>({id:`${t}-${s}`,label:`${t} account #${1e3+a*100+s}`,group:t,value:Math.round(n*(1-e*.12)*Math.exp(r*o())*10)/10}))})}var w=e=>`${e>0?`+`:e<0?`−`:``}${Math.abs(e)}`,T=[{key:`eng`,label:`Engineering`,color:1},{key:`gtm`,label:`Sales & marketing`,color:2},{key:`ops`,label:`Operations`,color:3},{key:`g&a`,label:`G&A`,color:7}],E=(()=>{let e=d(808),t=h(e),n=[[`Platform`,`eng`],[`Payments`,`eng`],[`Mobile`,`eng`],[`Data`,`eng`],[`Search`,`eng`],[`Infra`,`eng`],[`Growth eng`,`eng`],[`Security`,`eng`],[`Design systems`,`eng`],[`API`,`eng`],[`Field sales`,`gtm`],[`Inside sales`,`gtm`],[`Brand`,`gtm`],[`Lifecycle`,`gtm`],[`Partnerships`,`gtm`],[`Content`,`gtm`],[`Events`,`gtm`],[`Solutions`,`gtm`],[`Support EMEA`,`ops`],[`Support AMER`,`ops`],[`Onboarding`,`ops`],[`Logistics`,`ops`],[`Trust & safety`,`ops`],[`Billing ops`,`ops`],[`Finance`,`g&a`],[`People`,`g&a`],[`Legal`,`g&a`],[`IT`,`g&a`],[`Workplace`,`g&a`]],r={eng:34,gtm:18,ops:6,"g&a":22};return n.map(([e,n])=>({label:e,series:n,value:Math.round((r[n]??20)+16*t())}))})();function D(){let[e,n]=(0,x.useState)(`after`),r=(0,x.useMemo)(()=>C(+(e===`after`)),[e]);return(0,S.jsx)(o,{title:`One swarm per group`,description:`Days from sign-up to first value for 178 accounts, by plan, with each plan's median. Switch the cohort and every account glides to its new value. Left and right move along a plan; up and down jump to the nearest value in the next plan.`,variant:`bare`,controls:(0,S.jsx)(m,{label:`Cohort`,size:`sm`,options:[{value:`before`,label:`Old onboarding`},{value:`after`,label:`New onboarding`}],value:e,onValueChange:n}),code:`
import { ChartCard, BeeswarmTable, Beeswarm, type BeeswarmPoint } from "@sheenui/theme";

const accounts: BeeswarmPoint[] = [
  { id: "free-1", label: "Free account #1", group: "Free", value: 11.2 },
  { id: "free-2", label: "Free account #2", group: "Free", value: 7.9 },
  { id: "free-3", label: "Free account #3", group: "Free", value: 15.4 },
  { id: "pro-1", label: "Pro account #1", group: "Pro", value: 4.2 },
  { id: "pro-2", label: "Pro account #2", group: "Pro", value: 5.8 },
  { id: "pro-3", label: "Pro account #3", group: "Pro", value: 3.1 },
  { id: "team-1", label: "Team account #1", group: "Team", value: 2.6 },
  { id: "team-2", label: "Team account #2", group: "Team", value: 3.9 },
];
const days = (n: number) => n + " d";

export function Example() {
  return (
    <ChartCard
      title="Time to first value"
      table={<BeeswarmTable data={accounts} groups={["Free", "Pro", "Team"]} format={days} caption="Days to first value per account" />}
    >
      <Beeswarm
        data={accounts}
        groups={["Free", "Pro", "Team"]}
        format={days}
        valueLabel="Days from sign-up"
        aria-label="Days from sign-up to first value, per account and plan"
      />
    </ChartCard>
  );
}`,children:(0,S.jsx)(t,{className:`w-full ${v}`,title:`Time to first value`,description:e===`after`?`Accounts that joined after the new onboarding`:`Accounts that joined before the new onboarding`,table:(0,S.jsx)(s,{data:r,groups:[`Free`,`Pro`,`Team`],format:g,caption:`Days to first value per account`}),children:(0,S.jsx)(l,{data:r,groups:[`Free`,`Pro`,`Team`],format:g,valueLabel:`Days from sign-up`,"aria-label":`Days from sign-up to first value, per account and plan`})})})}function O(){return(0,S.jsxs)(r,{eyebrow:`Chart`,title:`Beeswarm`,description:`Every observation as its own dot along one axis, nudged sideways just enough that none overlap. The shape of the distribution shows like a histogram's, yet every account, team or country stays individually readable, hoverable and named.`,source:[`${_}beeswarm.tsx`,`${_}histogram.tsx`],children:[(0,S.jsx)(u,{label:`Beeswarm demo`,title:`Time to first value`,hue:1,height:`34.125rem`,narrowHeight:`39.5rem`,children:(0,S.jsx)(l,{data:C(1),groups:[`Free`,`Pro`,`Team`],format:g,valueLabel:`Days from sign-up`,"aria-label":`Days from sign-up to first value, per account and plan`})}),(0,S.jsx)(D,{}),(0,S.jsx)(o,{title:`Colored by series`,description:`Employee NPS of 29 teams in one swarm, colored by department (fixed slots, with a legend). highlight keeps two teams in focus; hover any dot for its name.`,variant:`bare`,code:`
import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries } from "@sheenui/theme";

const departments: BeeswarmSeries[] = [
  { key: "eng", label: "Engineering", color: 1 },
  { key: "gtm", label: "Sales & marketing", color: 2 },
  { key: "ops", label: "Operations", color: 3 },
  { key: "g&a", label: "G&A", color: 7 },
];

const teams: BeeswarmPoint[] = [
  { label: "Payments", series: "eng", value: 41 },
  { label: "Platform", series: "eng", value: 33 },
  { label: "Growth", series: "gtm", value: 18 },
  { label: "Support EMEA", series: "gtm", value: -12 },
  { label: "Support AMER", series: "gtm", value: 4 },
  { label: "Logistics", series: "ops", value: 9 },
  { label: "Finance", series: "g&a", value: 22 },
  { label: "People", series: "g&a", value: 27 },
];
const enps = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);

export function Example() {
  return (
    <Beeswarm
      data={teams}
      series={departments}
      highlight={["Support EMEA", "Support AMER"]}
      includeZero
      radius={6}
      format={enps}
      valueLabel="eNPS"
      labels={{ series: "Department" }}
      aria-label="Employee NPS by team, colored by department"
    />
  );
}`,children:(0,S.jsx)(t,{className:v,title:`Employee NPS by team`,description:`Spring pulse survey. Highlighted: the two support teams.`,legend:c(T),table:(0,S.jsx)(s,{data:E,series:T,format:w,valueLabel:`eNPS`,labels:{series:`Department`,point:`Team`},caption:`Employee NPS per team and department`}),children:(0,S.jsx)(l,{data:E,series:T,highlight:[`Support EMEA`,`Support AMER`],includeZero:!0,radius:6,format:w,valueLabel:`eNPS`,labels:{series:`Department`},"aria-label":`Employee NPS by team, colored by department`})})}),(0,S.jsx)(a,{of:y}),(0,S.jsx)(a,{as:`h2`,title:`BeeswarmTable props`,of:b}),(0,S.jsx)(i,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`Arrow keys`,`Along the value axis: step between dots in value order. Across groups (when there are several): jump to the nearest value in the next or previous group.`],[`Home / End`,`Jump to the first / last dot.`],[`Escape`,`Clear the reading.`]]}),(0,S.jsx)(n,{notes:[`The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the dot's value and group; every group's count and median are available as text.`,`BeeswarmTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.`,`With reduced motion on, the dots start at their final positions and a data change jumps straight to the new state.`]})]})}export{O as default};