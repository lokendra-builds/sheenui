import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./switch-BETATXZg.js";import{i,n as a,o,r as s}from"./Page-vzU90LKc.js";import{t as c}from"./ShowcaseStage-qzIATPiV.js";import{t as l}from"./ShowcaseStage.switch.scene-Gjn47m7u.js";import{t as u}from"./Example-CmMsgUlK.js";import{t as d}from"./lazy-block-BfzH_8EP.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=[[`className`,`string`,``,"Classes for the outer element: the `<label>` (or the wrapper holding an `error`); the control itself when there is neither.",!1],[`controlClassName`,`string | ((state: SwitchRootState) => string | undefined)`,``,`Classes for the switch track itself. Base UI's state function form works here.`,!1],[`label`,`ReactNode`,``,`Text next to the switch. Clicking it toggles the switch.`,!1],[`description`,`ReactNode`,``,"Muted helper text under the label. Only shown together with `label`.",!1],[`error`,`ReactNode`,``,"Error message under the control. Marks it invalid (`aria-invalid`, danger border) and is announced; linked with `aria-describedby`.",!1],[`stateLight`,`boolean`,`false`,'A calm accent light round the track while it is on (`data-state="on"`, an aura on its own layer). The checked fill already says "on": this is the glow only. Off with reduced transparency and forced colours.',!1]],m=e(t()),h=n(),g=[{key:`email`,label:`Email`,description:`Receipts and weekly summaries.`},{key:`push`,label:`Push notifications`,description:`Mentions and replies.`},{key:`sms`,label:`Text messages`,description:`Security alerts only.`}],_={eager:!0,minHeight:`80vh`};function v(){let[e,t]=(0,m.useState)(!0),[n,d]=(0,m.useState)({email:!0,push:!0,sms:!1});return(0,h.jsxs)(a,{eyebrow:`Component`,title:`Switch`,description:`An on/off toggle whose thumb springs across a glass track that fills with the accent when on.`,source:`theme/src/components/switch/switch.tsx`,children:[(0,h.jsx)(c,{label:`Switch demo`,story:()=>f(()=>import(`./ShowcaseStage.switch-C50rQXiA.js`),[]),initial:{on:!1},initialState:`off`,onInterrupt:`keep`,children:(e,t)=>(0,h.jsx)(l,{scene:e,ctx:t})}),(0,h.jsx)(u,{title:`With label and description`,autoplay:()=>{t(!1);let e=window.setTimeout(()=>t(!0),700);return()=>{window.clearTimeout(e),t(!0)}},code:`
import { useState } from "react";
import { Switch } from "@sheenui/theme";

export function Example() {
  const [on, setOn] = useState(true);

  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label="Email notifications"
      description="Get a summary every Monday."
    />
  );
}`,children:(0,h.jsxs)(`div`,{className:`flex flex-col gap-5`,children:[(0,h.jsx)(r,{checked:e,onCheckedChange:t,label:`Email notifications`,description:`Get a summary every Monday.`}),(0,h.jsx)(r,{defaultChecked:!1,label:`Product updates`}),(0,h.jsx)(r,{disabled:!0,label:`Beta features`,description:`Not available on your plan.`})]})}),(0,h.jsx)(u,{title:`A settings list`,description:`One piece of state for a group of switches, each with its own name.`,code:`
import { useState } from "react";
import { Switch } from "@sheenui/theme";

const channels = [
  { key: "email", label: "Email", description: "Receipts and weekly summaries." },
  { key: "push", label: "Push notifications", description: "Mentions and replies." },
  { key: "sms", label: "Text messages", description: "Security alerts only." },
] as const;

export function Example() {
  const [enabled, setEnabled] = useState({ email: true, push: true, sms: false });

  return (
    <div className="flex flex-col gap-5">
      {channels.map(({ key, label, description }) => (
        <Switch
          key={key}
          label={label}
          description={description}
          checked={enabled[key]}
          onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [key]: checked }))}
        />
      ))}
    </div>
  );
}`,children:(0,h.jsx)(`div`,{className:`flex flex-col gap-5`,children:g.map(({key:e,label:t,description:i})=>(0,h.jsx)(r,{label:t,description:i,checked:n[e],onCheckedChange:t=>d(n=>({...n,[e]:t}))},e))})}),(0,h.jsx)(s,{of:p,rows:[[`checked / defaultChecked`,`boolean`,`false`,`Controlled or uncontrolled state.`],[`onCheckedChange`,`(checked) => void`,``,`Called with the new checked state when the control is toggled.`],[`disabled`,`boolean`,`false`,`Makes the control non-interactive.`]]}),(0,h.jsx)(o,{rows:[[`Tab / Shift + Tab`,`Move focus to or from the switch.`],[`Space / Enter`,`Toggle it.`]]}),(0,h.jsx)(i,{items:[`role="switch" with aria-checked; the label and description share one <label>.`,`On and off differ by thumb position as well as color; forced colors outline the track.`,`The touch hit area is 44 px; under reduced motion the thumb jumps instead of sliding.`]})]})}d(()=>f(()=>import(`./SelectPageBody-alBylYbz.js`).then(e=>e.SelectPage),[]),_);export{v as default};