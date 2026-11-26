import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./alert-A9ehVLbA.js";import{t as i}from"./button-8i4LQrEk.js";import{n as a,r as o}from"./Page-ClekXXh-.js";import{t as s}from"./ShowcaseStage-qzIATPiV.js";import{t as c}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as l}from"./Example-jva669kg.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`tone`,`"success" | "warning" | "danger" | "info"`,`"info"`,`Sets the colour role and the default icon of the alert.`,!1],[`title`,`ReactNode`,``,`A bold first line shown above the message.`,!1],[`icon`,`ReactNode`,``,"Replaces the tone's icon; `false` hides it.",!1],[`action`,`ReactNode`,``,`A button or link at the end, such as "Undo" or "Upgrade". Keep it a real control.`,!1],[`dismissible`,`boolean`,`false`,`Show a close button. The alert hides itself when it is pressed.`,!1],[`open`,`boolean`,``,"Whether the alert is shown (controlled). Pair with `onOpenChange`.",!1],[`defaultOpen`,`boolean`,`true`,`Whether the alert starts shown when uncontrolled.`,!1],[`onOpenChange`,`((open: boolean) => void)`,``,"Called with `false` when the dismiss button is pressed.",!1],[`labels`,`Partial<AlertLabels>`,`defaultAlertLabels`,'Every other string, for translation: `labels={{ dismiss: "…" }}`; omitted keys keep the English of `defaultAlertLabels`. Its only key is listed in the key table under the props table.',!1,{type:`AlertLabels`,const:`defaultAlertLabels`,keys:[[`dismiss`,`Dismiss`]]}]],p=e(t()),m=n(),h=[{tone:`info`,title:`Saving your draft`,text:`Syncing 3 changes to the cloud.`},{tone:`danger`,title:`Could not save`,text:`You are offline. Your changes are kept on this device.`},{tone:`success`,title:`All changes saved`,text:`Your draft is up to date everywhere.`}];function g({scene:e,ctx:t}){let[n,a]=c(e.phase),o=h[n];return(0,m.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,m.jsx)(r,{role:`none`,tone:o.tone,title:o.title,className:`w-full text-start`,action:n===1?(0,m.jsx)(i,{size:`sm`,variant:`glass`,onClick:()=>{a(2),t.setState(`success`)},children:`Retry`}):void 0,children:o.text},n)})}var _={eager:!0,minHeight:`80vh`};u(()=>d(()=>import(`./FieldControlsDemo-Bjgc0lwX.js`).then(e=>e.FieldControlsDemo),[]),{minHeight:`6rem`}),u(()=>d(()=>import(`./FieldSizesDemo-DICDmpLo.js`).then(e=>e.FieldSizesDemo),[]),{minHeight:`9rem`});var v=`
import { Alert } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert tone="info" title="A new version is available">Reload the page to get the latest features.</Alert>
      <Alert tone="success" title="Changes saved">Your profile is up to date.</Alert>
      <Alert tone="warning" title="Storage almost full">You have used 92% of your plan.</Alert>
      <Alert tone="danger" title="Payment failed">Your card was declined. Update it to keep your plan.</Alert>
    </div>
  );
}`,y=`
import { useState } from "react";
import { Alert, Button } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert
        tone="warning"
        title="Your trial ends in 3 days"
        action={<Button size="sm" variant="glass">Upgrade</Button>}
        dismissible
        open={open}
        onOpenChange={setOpen}
      >
        Add a payment method to keep your projects.
      </Alert>
      {!open && (
        <Button size="sm" variant="ghost" className="self-start" onClick={() => setOpen(true)}>
          Show the alert again
        </Button>
      )}
    </div>
  );
}`;function b(){let[e,t]=(0,p.useState)(!0);return(0,m.jsxs)(a,{eyebrow:`Component`,title:`Alert`,description:`An inline message that stays in the page flow: a form error, a saved confirmation, a plan limit. Four tones, an optional action and a dismiss button.`,source:`theme/src/components/alert/alert.tsx`,keyboard:[[`Tab`,`Moves to the action and the dismiss button; the alert itself is not a tab stop.`],[`Enter / Space`,`Activates the focused action or the dismiss button.`]],a11y:[`Warning and danger use role="alert" (announced at once); info and success use role="status" (announced politely). Pass role="none" for a message that is already on screen at page load: the live demos on this page do, so navigating here does not read out five alerts (the code samples show normal use).`,`The tone icon is decorative. The title and message carry the meaning, color is only a hint.`,`The dismiss button is named by labels.dismiss, is 44px on touch screens, and has a visible focus ring.`,`Text sits on a near-opaque tinted surface, so it keeps 4.5:1 over glass, photos and blobs in light and dark. Forced colors draw a CanvasText border.`],children:[(0,m.jsx)(s,{label:`Alert demo`,story:()=>d(()=>import(`./ShowcaseStage.alert-B-tPyT72.js`),[]),initial:{phase:0},children:(e,t)=>(0,m.jsx)(g,{scene:e,ctx:t})}),(0,m.jsx)(l,{title:`Four tones`,description:`Each tone has its own icon and tint. The words always say what happened.`,code:v,children:(0,m.jsxs)(`div`,{className:`flex w-full max-w-xl flex-col gap-3`,children:[(0,m.jsx)(r,{role:`none`,tone:`info`,title:`A new version is available`,children:`Reload the page to get the latest features.`}),(0,m.jsx)(r,{role:`none`,tone:`success`,title:`Changes saved`,children:`Your profile is up to date.`}),(0,m.jsx)(r,{role:`none`,tone:`warning`,title:`Storage almost full`,children:`You have used 92% of your plan.`}),(0,m.jsx)(r,{role:`none`,tone:`danger`,title:`Payment failed`,children:`Your card was declined. Update it to keep your plan.`})]})}),(0,m.jsx)(l,{title:`Action and dismiss`,description:`Put a real button or link in action. dismissible adds a close button; open and onOpenChange let you control it.`,code:y,children:(0,m.jsxs)(`div`,{className:`flex w-full max-w-xl flex-col gap-3`,children:[(0,m.jsx)(r,{role:`none`,tone:`warning`,title:`Your trial ends in 3 days`,action:(0,m.jsx)(i,{size:`sm`,variant:`glass`,children:`Upgrade`}),dismissible:!0,open:e,onOpenChange:t,children:`Add a payment method to keep your projects.`}),!e&&(0,m.jsx)(i,{size:`sm`,variant:`ghost`,className:`self-start`,onClick:()=>t(!0),children:`Show the alert again`})]})}),(0,m.jsx)(o,{of:f,rows:[[`role`,`"alert" | "status" | "none" | …`,"`alert` for warning and danger, otherwise `status`",`Sets the live-region role that announces the alert.`]]})]})}u(()=>d(()=>import(`./NavigationMenuPageBody-aZWzZp1R.js`).then(e=>e.NavigationMenuPage),[]),_);export{b as default};