import{t as e}from"./lazy-block-BfzH_8EP.js";import{i as t,n,o as r,r as i}from"./Page-DQ8sr8qt.js";import{t as a}from"./Example-DMEbQwm9.js";import{t as o}from"./BlockStages.forms-CZ1yRCeX.js";import{t as s}from"./vendor-react-D30i__oY.js";import{t as c}from"./preload-helper-BrmCrVM7.js";var l=[[`data`,`Record<string, Stat[]>`,`demoData`,"Stats per period (`Record<string, Stat[]>`). Keys become the period tabs. Default: built-in demo numbers for `7d`, `30d` and `90d`. The default is sample content for demos and prototypes: pass your own in production.",!1],[`title`,`string`,`"Overview"`,'The section heading (`string`, default `"Overview"`); it also names the section for screen readers.',!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the section heading (`1` to `5`, default `2`); the stat labels sit one level below. `"none"` renders paragraphs with no heading role (for an example).',!1],[`currency`,`string`,`"USD"`,'ISO 4217 currency for "currency" stats (`string`, default `"USD"`).',!1],[`locale`,`string`,`"en-US"`,'BCP 47 locale used to format every number (`string`, default `"en-US"`).',!1],[`labels`,`Partial<DashboardStatsLabels>`,`defaultDashboardStatsLabels`,'Every other string, for translation: `labels={{ period: "…" }}`; omitted keys keep the English of `defaultDashboardStatsLabels`. All 4 keys of `DashboardStatsLabels` are listed in the key table under the props table.',!1,{type:`DashboardStatsLabels`,const:`defaultDashboardStatsLabels`,keys:[[`period`,`Period`],[`periodName`,`(key) => { const match = /^(\\d+)\\s*([dwmy])$/i.exec(key); if (!match) return key; const n = Number(match[1]...`],[`change`,'(direction, amount) => `${direction === "up" ? "Up" : "Down"} ${amount} vs previous period`'],[`trend`,"(label) => `${label} trend`"]]}],[`className`,`string`,``,"Adds extra classes to the outer `<section>` (`string`).",!1]],u=s(),d=e(()=>c(()=>import(`./dashboard-stats-CF8TzT6c.js`).then(e=>e.DashboardStats),[]),{minHeight:`24rem`});e(()=>c(()=>import(`./glass-login-D-ovMPE7.js`).then(e=>e.GlassLogin),[]),{minHeight:`24rem`}),e(()=>c(()=>import(`./lamp-login-DTPTcjCc.js`).then(e=>e.LampLogin),[]),{minHeight:`24rem`}),e(()=>c(()=>import(`./otp-verification-Biqt-IFN.js`).then(e=>e.OtpVerification),[]),{minHeight:`24rem`}),e(()=>c(()=>import(`./payment-checkout-4ttxUhN8.js`).then(e=>e.PaymentCheckout),[]),{minHeight:`24rem`});function f(){return(0,u.jsxs)(n,{eyebrow:`Block`,title:`Dashboard stats`,description:`Stat cards that count up, draw their sparklines and switch periods with the sliding tab pill.`,source:`theme/src/blocks/dashboard-stats.tsx`,children:[(0,u.jsx)(o,{}),(0,u.jsx)(a,{title:`Stat cards`,stageClassName:`p-3 sm:p-8`,code:`
import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Overview"
  currency="USD"
  data={{
    "7d":  [{ label: "Revenue", value: 48250, change: 12.4, trend: [30, 34, 31, 38, 42, 40, 48], format: "currency" } /* … */],
    "30d": [/* … */],
  }}
/>`,children:(0,u.jsx)(d,{headingLevel:`none`})}),(0,u.jsx)(a,{title:`Your numbers, periods and currency`,stageClassName:`p-3 sm:p-8`,description:`The keys of data become the period tabs (“4w” reads as “Last 4 weeks”). goodWhen: “down” turns a falling churn rate green; currency and locale format every figure.`,code:`
import { DashboardStats } from "@sheenui/theme";

<DashboardStats
  title="Team health"
  currency="EUR"
  locale="de-DE"
  data={{
    "4w": [
      { label: "Revenue", value: 18400, change: 6.2, trend: [11, 12, 14, 13, 16, 18], format: "currency" },
      { label: "Churn", value: 2.1, change: -0.4, trend: [3, 2.8, 2.6, 2.4, 2.2, 2.1], format: "percent", goodWhen: "down" },
    ],
    "12m": [
      { label: "Revenue", value: 212000, change: 18.9, trend: [90, 110, 130, 160, 190, 212], format: "currency" },
      { label: "Churn", value: 2.4, change: 0.3, trend: [2.1, 2.0, 2.2, 2.3, 2.3, 2.4], format: "percent", goodWhen: "down" },
    ],
  }}
/>`,children:(0,u.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,u.jsx)(d,{headingLevel:`none`,title:`Team health`,currency:`EUR`,locale:`de-DE`,className:`docs-flat`,data:{"4w":[{label:`Revenue`,value:18400,change:6.2,trend:[11,12,14,13,16,18],format:`currency`},{label:`Churn`,value:2.1,change:-.4,trend:[3,2.8,2.6,2.4,2.2,2.1],format:`percent`,goodWhen:`down`}],"12m":[{label:`Revenue`,value:212e3,change:18.9,trend:[90,110,130,160,190,212],format:`currency`},{label:`Churn`,value:2.4,change:.3,trend:[2.1,2,2.2,2.3,2.3,2.4],format:`percent`,goodWhen:`down`}]}})})}),(0,u.jsx)(i,{of:l,rows:[[`Stat`,`{ label, value, change, trend, format?, goodWhen? }`,``,`change is a % vs the previous period; goodWhen: "down" suits churn or response time.`]]}),(0,u.jsx)(r,{rows:[[`Tab`,`Reach the period tabs.`],[`← / →`,`Previous / next period.`],[`Home / End`,`First / last period.`]]}),(0,u.jsx)(t,{notes:[`A labeled <section>; each period tab shows “7d” and is named “7d, Last 7 days”, so the visible text is part of the name.`,`The change badge reads “Up 12.4% vs previous period”, and the animated count is hidden from screen readers, which get the final figure at once.`,`Each sparkline has a text name.`]})]})}export{f as default};