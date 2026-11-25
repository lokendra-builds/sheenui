import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{n as i,r as a,t as o}from"./collapsible-DWuH_qZA.js";import{n as s,r as c}from"./Page-vzU90LKc.js";import{t as l}from"./ShowcaseStage-qzIATPiV.js";import{t as u}from"./Example-CmMsgUlK.js";import{t as d}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`contentClassName`,`string`,``,`Extra classes for the padded box inside the panel.`,!1]],h=[[`hideIcon`,`boolean`,`false`,"Hide the chevron (for a custom indicator; read `data-panel-open` on the trigger).",!1]],g=e(t()),_=n();function v({scene:e}){let[t,n]=d(e.open);return(0,_.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,_.jsxs)(o,{open:t,onOpenChange:n,className:`w-full text-start`,children:[(0,_.jsx)(a,{children:t?`Hide files`:`3 more files`}),(0,_.jsx)(i,{children:(0,_.jsxs)(`ul`,{className:`m-0 list-disc ps-5`,children:[(0,_.jsx)(`li`,{children:`report-q1.pdf`}),(0,_.jsx)(`li`,{children:`report-q2.pdf`}),(0,_.jsx)(`li`,{children:`report-q3.pdf`})]})})]})})}var y={eager:!0,minHeight:`80vh`};f(()=>p(()=>import(`./FieldControlsDemo-CjVBmCSG.js`).then(e=>e.FieldControlsDemo),[]),{minHeight:`6rem`}),f(()=>p(()=>import(`./FieldSizesDemo-ixSOxsBR.js`).then(e=>e.FieldSizesDemo),[]),{minHeight:`9rem`});var b=`
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Collapsible className="glass-2 max-w-md rounded-sheen-xl p-2">
      <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
      <CollapsiblePanel>
        Retry limit, request timeout and proxy settings live here. The panel animates its height and keeps
        closed content out of the page.
      </CollapsiblePanel>
    </Collapsible>
  );
}`,x=`
import { useState } from "react";
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Button variant="glass" size="sm" className="self-start" onClick={() => setOpen((o) => !o)}>
        {open ? "Collapse" : "Expand"} from outside
      </Button>
      <Collapsible open={open} onOpenChange={setOpen} className="glass-2 rounded-sheen-xl p-2">
        <CollapsibleTrigger>12 more files</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <ul className="list-disc ps-5">
            <li>report-q1.pdf</li>
            <li>report-q2.pdf</li>
            <li>report-q3.pdf</li>
          </ul>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}`;function S(){let[e,t]=(0,g.useState)(!1);return(0,_.jsxs)(s,{eyebrow:`Layout`,title:`Collapsible`,description:`One section that shows or hides its content: advanced options, a long list behind Show more, details under a row. The height animates, the chevron turns, and closed content leaves the tab order.`,source:`theme/src/components/collapsible/collapsible.tsx`,keyboard:[[`Tab`,`Focuses the trigger.`],[`Enter / Space`,`Opens or closes the panel.`]],a11y:[`The trigger is a real <button> with aria-expanded and aria-controls (Base UI Collapsible).`,`Closed content is removed from the page, so its links and fields are neither tabbable nor read. keepMounted keeps it in the DOM but hidden; hiddenUntilFound lets find-in-page open it.`,`The chevron is decorative. Triggers are 44px tall on touch screens and show a focus ring.`,`Under reduced motion the panel jumps to its open or closed height with no travel.`],children:[(0,_.jsx)(l,{label:`Collapsible demo`,story:()=>p(()=>import(`./ShowcaseStage.collapsible-DjnPnvIG.js`),[]),initial:{open:!1},minHeight:`15rem`,children:(e,t)=>(0,_.jsx)(v,{scene:e,ctx:t})}),(0,_.jsx)(u,{title:`Basic`,description:`Use Accordion when opening one section should close another.`,code:b,children:(0,_.jsxs)(o,{className:`glass-2 max-w-md rounded-sheen-xl p-2`,children:[(0,_.jsx)(a,{children:`Advanced options`}),(0,_.jsx)(i,{children:`Retry limit, request timeout and proxy settings live here. The panel animates its height and keeps closed content out of the page.`})]})}),(0,_.jsx)(u,{title:`Controlled`,description:`open and onOpenChange drive it from outside. keepMounted holds the content in the DOM (hidden) so form fields inside keep their values.`,code:x,children:(0,_.jsxs)(`div`,{className:`flex w-full max-w-md flex-col gap-3`,children:[(0,_.jsxs)(r,{variant:`glass`,size:`sm`,className:`self-start`,onClick:()=>t(e=>!e),children:[e?`Collapse`:`Expand`,` from outside`]}),(0,_.jsxs)(o,{open:e,onOpenChange:t,className:`glass-2 rounded-sheen-xl p-2`,children:[(0,_.jsx)(a,{children:`12 more files`}),(0,_.jsx)(i,{keepMounted:!0,children:(0,_.jsxs)(`ul`,{className:`list-disc ps-5`,children:[(0,_.jsx)(`li`,{children:`report-q1.pdf`}),(0,_.jsx)(`li`,{children:`report-q2.pdf`}),(0,_.jsx)(`li`,{children:`report-q3.pdf`})]})})]})]})}),(0,_.jsx)(c,{title:`Collapsible props`,rows:[[`open / defaultOpen`,`boolean`,`false`,`Controlled / uncontrolled open state.`],[`onOpenChange`,`(open: boolean) => void`,``,`Called when it opens or closes.`],[`disabled`,`boolean`,`false`,`Locks the section so it cannot be toggled.`],[`className`,`string`,``,`Adds extra classes to the root.`]]}),(0,_.jsx)(c,{title:`CollapsibleTrigger and CollapsiblePanel`,of:[h,m],rows:[[`render (Trigger)`,`ReactElement`,``,`Replaces the button with another element.`],[`keepMounted (Panel)`,`boolean`,`false`,`Keep closed content in the DOM, hidden.`],[`hiddenUntilFound (Panel)`,`boolean`,`false`,`Use hidden=until-found so find-in-page opens it.`]]})]})}f(()=>p(()=>import(`./NavigationMenuPageBody-CdkiwVT6.js`).then(e=>e.NavigationMenuPage),[]),y);export{S as default};