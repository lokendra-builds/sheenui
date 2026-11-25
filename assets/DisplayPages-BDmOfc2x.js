import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./progress-D-tp19pQ.js";import{t as a}from"./gate-DV0C6GhI.js";import{i as o,n as s,o as c,r as l}from"./Page-DQ8sr8qt.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{t as d}from"./Example-DMEbQwm9.js";import{t as f}from"./demo-clock-CoEY-AlH.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`value`,`number | null`,``,"A number from 0 to `max`. Pass null for an indeterminate (loading) bar.",!0],[`max`,`number`,`100`,'The value that means "done" (`value` is read against it).',!1],[`label`,`ReactNode`,``,`Text above the bar, also its accessible name.`,!1],[`showValue`,`boolean`,`true`,`Show the percentage on the right.`,!1],[`locale`,`Intl.LocalesArgument`,`the browser's`,`Sets the BCP 47 locale of the percentage ("18%" or "18 %").`,!1],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]],h=e(t()),g=n();function _({scene:e}){return(0,g.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,g.jsx)(i,{value:e.value,label:e.value>=100?`Upload complete`:`Uploading report.pdf`,className:`w-full text-start`})})}function v(){let[e,t]=(0,h.useState)(18),n=(0,h.useRef)(null),v=a(n,{respectReducedMotion:!1});return(0,h.useEffect)(()=>{if(!v)return;let e=setInterval(()=>t(e=>e>=100?8:Math.min(100,e+9)),900);return()=>clearInterval(e)},[v]),(0,g.jsxs)(s,{eyebrow:`Component`,title:`Progress`,description:`A glass track with an accent fill and a slow sweep of light. Pass null for an indeterminate loading bar.`,source:`theme/src/components/progress/progress.tsx`,children:[(0,g.jsx)(u,{label:`Progress demo`,story:()=>p(()=>import(`./ShowcaseStage.progress-BU8M_o0H.js`),[]),initial:{value:0},children:e=>(0,g.jsx)(_,{scene:e})}),(0,g.jsx)(d,{title:`Determinate and indeterminate`,code:`
import { Progress } from "@sheenui/theme";

export function Example() {
  const value = 64; // 0 to 100

  return (
    <>
      <Progress label="Uploading design.fig" value={value} />
      <Progress label="Preparing export" value={null} />
    </>
  );
}`,children:(0,g.jsxs)(`div`,{ref:n,className:`flex w-full max-w-md flex-col gap-6`,children:[(0,g.jsx)(i,{locale:f,label:`Uploading design.fig`,value:e}),(0,g.jsx)(i,{locale:f,label:`Preparing export`,value:null}),(0,g.jsx)(r,{variant:`glass`,size:`sm`,className:`self-start`,onClick:()=>t(8),children:`Restart`})]})}),(0,g.jsx)(d,{title:`Several tasks with labels`,description:`Each bar has its own name. The value is read to screen readers; showValue also prints it.`,code:`
import { Progress } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Progress label="Photos" value={100} />
      <Progress label="Videos" value={42} />
      <Progress label="Documents" value={7} showValue={false} />
      <Progress label="Waiting for the server" value={null} />
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex w-full max-w-sm flex-col gap-5`,children:[(0,g.jsx)(i,{label:`Photos`,value:100}),(0,g.jsx)(i,{label:`Videos`,value:42}),(0,g.jsx)(i,{label:`Documents`,value:7,showValue:!1}),(0,g.jsx)(i,{label:`Waiting for the server`,value:null})]})}),(0,g.jsx)(l,{of:m}),(0,g.jsx)(c,{rows:[[`Tab`,`Not focusable: Progress is a read-out, not a control.`]]}),(0,g.jsx)(o,{items:[`Base UI renders role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax; label names it.`,`value={null} is indeterminate: no aria-valuenow, so it is announced as busy rather than as a percentage.`,`The track and fill keep 3:1 contrast against the surface. Under reduced motion the fill jumps to each new value and the indeterminate bar becomes a still, half-tone bar.`]})]})}export{v as default};