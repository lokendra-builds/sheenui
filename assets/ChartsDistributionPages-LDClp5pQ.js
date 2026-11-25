import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./ExampleChartCard-DOQs1ydL.js";import{i,n as a,o,r as s}from"./Page-DQ8sr8qt.js";import{t as c}from"./Example-DMEbQwm9.js";import{n as l,t as u}from"./gauge-chart-C9kdnk4a.js";import{t as d}from"./ShowcaseStage.chart.scene-wQ5_nSZl.js";import{t as f}from"./button-8i4LQrEk.js";import{t as p}from"./slider-BfRG-_iF.js";import{n as m,t as h}from"./shared-Dbp0f8HM.js";import{t as g}from"./lazy-block-BfzH_8EP.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`value`,`number`,``,`The number to show. Required.`,!0],[`min`,`number`,`0`,`Start of the scale.`,!1],[`max`,`number`,`100`,`End of the scale.`,!1],[`target`,`number`,`0`,`A goal, drawn as a tick across the arc.`,!1],[`bands`,`readonly GaugeBand[]`,``,`Coloured ranges, lowest first. The arc lights up to the needle in each band's colour.`,!1],[`shape`,`"semicircle" | "speedometer"`,`"semicircle"`,`Sets the sweep of the arc: "semicircle" (180°) or "speedometer" (270°).`,!1],[`label`,`ReactNode`,``,`Caption under the number, e.g. "Apdex" or "CPU".`,!1],[`color`,`ChartColor`,`1`,`Palette slot (1–8) of the arc when there are no bands.`,!1],[`ticks`,`boolean`,`true`,`Print the scale around the arc.`,!1],[`numberFormat`,`Intl.NumberFormatOptions`,``,`Intl options for every number (the big one rolls its digits). E.g. { style: "percent" } or { style: "unit", unit: "millisecond" }.`,!1],[`format`,`((n: number) => string)`,``,`Format numbers yourself instead (the big number then counts up instead of rolling its digits).`,!1],[`locale`,`string`,`the browser's`,`Locale of the number formats.`,!1],[`higherIsBetter`,`boolean`,`true`,`Is beating the target good (score) or bad (latency, cost)? Picks the tone of the delta.`,!1],[`height`,`number`,`260`,`Largest height (px). The gauge fits its card's width up to this.`,!1],[`labels`,`Partial<GaugeChartLabels>`,`defaultGaugeChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultGaugeChartLabels`. All 15 keys of `GaugeChartLabels` are listed in the key table under the props table.',!1,{type:`GaugeChartLabels`,const:`defaultGaugeChartLabels`,keys:[[`roleDescription`,`gauge`],[`instructions`,`Use the arrow keys to read the value, the target and each band.`],[`value`,`Value`],[`target`,`Target`],[`band`,`Band`],[`vsTarget`,"(delta) => `${delta} vs target`"],[`onTarget`,`On target`],[`scale`,"(min, max) => `Scale ${min} to ${max}`"],[`between`,"(low, high) => `${low}–${high}`"],[`current`,`Current band`],[`belowScale`,`Below the scale`],[`aboveScale`,`Above the scale`],[`measure`,`Measure`],[`range`,`Range`],[`noData`,`No data`]]}],[`aria-label`,`string`,``,`Names the gauge for assistive tech (required).`,!0],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],y=[[`max`,`number`,`100`,`End of the scale.`,!1],[`min`,`number`,`0`,`Start of the scale.`,!1],[`target`,`number`,``,`A goal, drawn as a tick across the arc.`,!1],[`format`,`((n: number) => string)`,``,`Format numbers yourself instead (the big number then counts up instead of rolling its digits).`,!1],[`value`,`number`,``,`The number to show. Required.`,!0],[`labels`,`Partial<GaugeChartLabels>`,`defaultGaugeChartLabels`,'Every other string, for translation: `labels={{ roleDescription: "…" }}`; omitted keys keep the English of `defaultGaugeChartLabels`. All 15 keys of `GaugeChartLabels` are listed in the key table under the props table.',!1,{type:`GaugeChartLabels`,const:`defaultGaugeChartLabels`,keys:[[`roleDescription`,`gauge`],[`instructions`,`Use the arrow keys to read the value, the target and each band.`],[`value`,`Value`],[`target`,`Target`],[`band`,`Band`],[`vsTarget`,"(delta) => `${delta} vs target`"],[`onTarget`,`On target`],[`scale`,"(min, max) => `Scale ${min} to ${max}`"],[`between`,"(low, high) => `${low}–${high}`"],[`current`,`Current band`],[`belowScale`,`Below the scale`],[`aboveScale`,`Above the scale`],[`measure`,`Measure`],[`range`,`Range`],[`noData`,`No data`]]}],[`locale`,`string`,`the browser's`,`Locale of the number formats.`,!1],[`bands`,`readonly GaugeBand[]`,``,`Coloured ranges, lowest first. The arc lights up to the needle in each band's colour.`,!1],[`numberFormat`,`Intl.NumberFormatOptions`,`{ maximumFractionDigits: 2 }`,`Intl options for every number (the big one rolls its digits). E.g. { style: "percent" } or { style: "unit", unit: "millisecond" }.`,!1],[`measure`,`string`,``,`Sets the name of the measure (first row).`,!1],[`caption`,`string`,``,`Hidden caption that names the table for screen readers.`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],b=e(t(),1),x=n(),S=e=>`$${Number(e.toFixed(1))}K`,C=[{to:.7,label:`Poor`,tone:`danger`},{to:.85,label:`Fair`,tone:`warning`},{to:1,label:`Good`,tone:`success`}],w=[{to:60,label:`Normal`,tone:`success`},{to:85,label:`Busy`,tone:`warning`},{to:100,label:`Overloaded`,tone:`danger`}],T=[.91,.78,.62,.95];function E(){let[e,t]=(0,b.useState)(72);return(0,x.jsx)(c,{title:`Speedometer`,description:`shape="speedometer" sweeps 270°. Drag the slider: the needle chases the value on a spring. higherIsBetter={false} turns a value above the target into a warning.`,variant:`bare`,controls:(0,x.jsx)(p,{label:`CPU load`,min:0,max:100,value:e,onValueChange:e=>t(e),className:`w-56`}),code:`
import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 60, label: "Normal", tone: "success" },
  { to: 85, label: "Busy", tone: "warning" },
  { to: 100, label: "Overloaded", tone: "danger" },
];

export function Example() {
  const cpu = 72; // percent, from your metrics
  return (
    <GaugeChart
      shape="speedometer"
      value={cpu}
      target={80}
      higherIsBetter={false}
      bands={bands}
      label="CPU load"
      numberFormat={{ style: "unit", unit: "percent" }}
      aria-label="CPU load"
    />
  );
}`,children:(0,x.jsx)(r,{className:h,title:`Cluster CPU`,description:`Average across 12 nodes`,table:(0,x.jsx)(l,{value:e,target:80,bands:w,measure:`CPU load`,numberFormat:{style:`unit`,unit:`percent`},caption:`CPU load`}),children:(0,x.jsx)(u,{shape:`speedometer`,value:e,target:80,higherIsBetter:!1,bands:w,label:`CPU load`,numberFormat:{style:`unit`,unit:`percent`},"aria-label":`CPU load`})})})}function D(){let[e,t]=(0,b.useState)(0),n=T[e%T.length]??.91;return(0,x.jsx)(c,{title:`Semicircle with bands and a target`,description:`Apdex score. Take a new reading: the needle springs to it and the digits roll. Hover a band, the target or the needle, or focus the gauge and use the arrow keys.`,variant:`bare`,controls:(0,x.jsx)(f,{variant:`ghost`,size:`sm`,onClick:()=>t(e=>e+1),className:`border border-sheen-control-border any-pointer-coarse:h-11`,children:`New reading`}),code:`
import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 0.7, label: "Poor", tone: "danger" },
  { to: 0.85, label: "Fair", tone: "warning" },
  { to: 1, label: "Good", tone: "success" },
];

export function Example() {
  const apdex = 0.91; // your latest reading
  return (
    <GaugeChart
      value={apdex}
      min={0}
      max={1}
      target={0.85}
      bands={bands}
      label="Apdex"
      numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      aria-label="Apdex score"
    />
  );
}`,children:(0,x.jsx)(r,{className:h,title:`Application health`,description:`Apdex, last 15 minutes`,table:(0,x.jsx)(l,{value:n,min:0,max:1,target:.85,bands:C,measure:`Apdex`,numberFormat:{minimumFractionDigits:2,maximumFractionDigits:2},caption:`Apdex score`}),children:(0,x.jsx)(u,{value:n,min:0,max:1,target:.85,bands:C,label:`Apdex`,numberFormat:{minimumFractionDigits:2,maximumFractionDigits:2},"aria-label":`Apdex score`})})})}function O(e,{rootMargin:t=`150px 0px`,fallbackMs:n=2e4}={}){return new Promise(r=>{let i=typeof document>`u`?null:document.getElementById(e);if(!i||typeof IntersectionObserver>`u`){r();return}let a=()=>{o.disconnect(),window.clearTimeout(s),r()},o=new IntersectionObserver(e=>e.some(e=>e.isIntersecting)&&a(),{rootMargin:t}),s=window.setTimeout(a,n);o.observe(i)})}function k(){return(0,x.jsxs)(a,{eyebrow:`Chart`,title:`Gauge`,description:`One number against its scale: a semicircle or a 270° speedometer whose needle springs to the value, overshoots a touch and settles, while the arc lights up band by band. The number rolls into place under the hub with its band (icon and name, never color alone) and its distance from the target.`,source:`${m}gauge-chart.tsx`,children:[(0,x.jsx)(d,{label:`Gauge demo`,title:`Application health`,hue:4,height:`16.3125rem`,narrowHeight:`13.9375rem`,children:(0,x.jsx)(u,{value:.91,min:0,max:1,target:.85,bands:C,label:`Apdex`,numberFormat:{minimumFractionDigits:2,maximumFractionDigits:2},"aria-label":`Apdex score`})}),(0,x.jsx)(D,{}),(0,x.jsx)(E,{}),(0,x.jsx)(c,{title:`Plain arc, custom format`,description:`Without bands the arc fills with one color, lighter at the start. With format the number counts up instead of rolling its digits.`,variant:`bare`,code:`
import { GaugeChart } from "@sheenui/theme";

<GaugeChart
  value={68.4}
  max={120}
  color={3}
  label="Monthly recurring revenue"
  format={(n) => \`$\${Number(n.toFixed(1))}K\`}
  aria-label="Monthly recurring revenue against a $120K goal"
/>`,children:(0,x.jsx)(r,{className:h,title:`Revenue goal`,description:`MRR against the $120K target for Q4`,table:(0,x.jsx)(l,{value:68.4,max:120,measure:`MRR`,format:S,caption:`Monthly recurring revenue`}),children:(0,x.jsx)(u,{value:68.4,max:120,color:3,label:`Monthly recurring revenue`,format:S,height:240,"aria-label":`Monthly recurring revenue against a $120K goal`})})}),(0,x.jsx)(s,{of:v}),(0,x.jsx)(s,{of:y,title:`GaugeTable props`,as:`h3`}),(0,x.jsx)(o,{rows:[[`Tab`,`Focus the chart. It is one tab stop; the arrow keys then read it.`],[`Arrow keys`,`Step through the value, the target and each band.`],[`Home / End`,`Jump to the first / last stop.`],[`Escape`,`Clear the reading.`]]}),(0,x.jsx)(i,{notes:[`The chart is one focusable figure: its aria-label is the chart title, a one-line hint describes how to read it, and in a ChartCard with a table view aria-details points at that table. Each move is announced politely, once. The value, its band (icon and name) and its distance from the target are text, so status never rests on color alone.`,`For a non-visual reading, give ChartCard's table prop a GaugeTable; the Chart / Table tabs then expose each value as plain table cells.`,`Under reduced motion nothing morphs: the arc and the needle render at the final value and new data replaces the old at once.`]})]})}g(()=>O(`histogram-latency`).then(()=>_(()=>import(`./histogram-latency-C0p1JJ9w.js`),[])).then(e=>e.LatencyExample),{minHeight:`34rem`});export{k as default};