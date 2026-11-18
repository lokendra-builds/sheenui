import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./input-Cq43qqb2.js";import{i,n as a,o,r as s}from"./Page-BRuP8nt1.js";import{t as c}from"./ShowcaseStage-6bIrHuoy.js";import{t as l}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as u}from"./Example-DaSezASZ.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`className`,`string`,``,`Class for the outer wrapper (label + field + messages), same as Select and Combobox.`,!1],[`onBlur`,`FocusEventHandler<HTMLInputElement>`,``,"Called when the field loses focus (native `onBlur`; also the point where a form library marks the field touched).",!1],[`size`,`FieldSize`,`"md"`,'Height and padding, the same scale as `Button` and every other field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens).',!1],[`label`,`ReactNode`,``,`Text above the field, linked to the input as its accessible name.`,!1],[`description`,`ReactNode`,``,"Muted helper text under the field. Hidden while an `error` shows.",!1],[`error`,`ReactNode`,``,`Error message; marks the field invalid and is announced to screen readers.`,!1],[`leading`,`ReactNode`,``,`Icon or text shown inside the field, on the left.`,!1],[`trailing`,`ReactNode`,``,`Icon, text or button shown inside the field, on the right.`,!1],[`loading`,`boolean`,`false`,"Shows a spinner at the field's trailing edge and sets `aria-busy` (a lookup or validation is running). The field stays editable.",!1],[`name`,`string`,``,"Field name for form submission and for matching an `error` from a form library.",!1],[`readOnly`,`boolean`,`false`,`The value can be selected and copied but not edited; the field stays focusable and is submitted with the form.`,!1],[`required`,`boolean`,`false`,`The field must be filled before the form can be submitted.`,!1],[`autoComplete`,`string`,`"email" for type="email"`,'Autofill hint (the HTML `autocomplete` token, for example "email" or "one-time-code").',!1],[`enterKeyHint`,`"search" | "enter" | "done" | "go" | "next" | "previous" | "send"`,`"search" for type="search"`,`Label of the on-screen keyboard's Enter key.`,!1],[`inputClassName`,`string`,``,`Adds extra classes to the native <input> element.`,!1]],p=e(t()),m=n(),h=e=>/^\S+@\S+\.\S+$/.test(e);function g({scene:e,ctx:t}){let[n,i]=l(e.value),[a,o]=l(e.touched),s=h(n);return(0,m.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,m.jsx)(r,{type:`email`,label:`Email`,placeholder:`you@example.com`,description:`We only use it for receipts.`,autoComplete:`off`,value:n,error:a&&!s?`Enter a full address, like maya@example.com`:void 0,onChange:e=>{i(e.target.value),a&&t.setState(h(e.target.value)?`success`:`error`)},onBlur:()=>{o(!0),t.setState(h(n)?`success`:`error`)},className:`w-full text-start`})})}var _=()=>(0,m.jsxs)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,children:[(0,m.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,m.jsx)(`path`,{d:`m20 20-3.5-3.5`})]});function v(){let[e,t]=(0,p.useState)(`hello@`);return(0,m.jsxs)(a,{eyebrow:`Component`,title:`Input`,description:`A glass text field with label, description and error message wired up for screen readers by Base UI's Field. Focus brings a soft accent glow.`,source:`theme/src/components/input/input.tsx`,children:[(0,m.jsx)(c,{label:`Input demo`,story:()=>d(()=>import(`./ShowcaseStage.input-DCrSnF-E.js`),[]),initial:{value:``,touched:!1},children:(e,t)=>(0,m.jsx)(g,{scene:e,ctx:t})}),(0,m.jsx)(u,{title:`Label, description and icon`,code:`
import { Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <Input
      label="Search"
      placeholder="Find components…"
      description="Press / to focus from anywhere."
      leading={<SearchIcon />}
    />
  );
}`,children:(0,m.jsx)(`div`,{className:`w-full max-w-sm`,children:(0,m.jsx)(r,{label:`Search`,placeholder:`Find components…`,description:`Press / to focus from anywhere.`,leading:(0,m.jsx)(_,{})})})}),(0,m.jsx)(u,{title:`Validation`,description:`Pass error to mark the field invalid; the message is linked to the input and announced.`,code:`
import { useState } from "react";
import { Input } from "@sheenui/theme";

export function Example() {
  const [email, setEmail] = useState("hello@");
  const error = /^\\S+@\\S+\\.\\S+$/.test(email) ? undefined : "Enter a valid email address.";

  return (
    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
  );
}`,children:(0,m.jsx)(`div`,{className:`w-full max-w-sm`,children:(0,m.jsx)(r,{label:`Email`,type:`email`,value:e,onChange:e=>t(e.target.value),error:/^\S+@\S+\.\S+$/.test(e)?void 0:`Enter a valid email address.`})})}),(0,m.jsx)(u,{title:`Sizes`,description:`sm (32px), md (40px, default) and lg (48px): the same scale as Button, so a button beside an input lines up. On touch screens sm and md are 44px.`,code:`
import { Input } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="md" placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  );
}`,children:(0,m.jsxs)(`div`,{className:`flex w-full max-w-sm flex-col gap-3`,children:[(0,m.jsx)(r,{size:`sm`,placeholder:`Small`,"aria-label":`Small`}),(0,m.jsx)(r,{size:`md`,placeholder:`Medium`,"aria-label":`Medium`}),(0,m.jsx)(r,{size:`lg`,placeholder:`Large`,"aria-label":`Large`})]})}),(0,m.jsx)(s,{of:f}),(0,m.jsx)(o,{rows:[[`Tab / Shift + Tab`,`Move focus to or from the input.`],[`Type, select, paste`,`Everything the native input does works, including autofill and undo.`]]}),(0,m.jsx)(i,{items:[`label, description and error are linked with aria-labelledby and aria-describedby; an error is announced politely.`,`Icons and affixes are decorative (aria-hidden); the input keeps its own name.`,`Text is 16 px on touch screens so iOS does not zoom on focus; the border keeps 3:1 contrast.`]})]})}export{v as default};