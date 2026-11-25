import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./otp-input-DmZK-cFt.js";import{t as a}from"./segmented-U7hR4LXs.js";import{i as o,n as s,o as c,r as l}from"./Page-y_OVkLtr.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{t as d}from"./ShowcaseStage.otp.scene-iikgNhEo.js";import{t as f}from"./Example-B3x8pgFu.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`onBlur`,`FocusEventHandler<HTMLElement>`,``,`Called when focus leaves the control (not when it moves between the control's own parts).`,!1],[`name`,`string`,``,`Form field name (the joined code is submitted under it).`,!1],[`required`,`boolean`,``,`Mark the field as required for form validation.`,!1],[`disabled`,`boolean`,``,`Disables every digit slot of the field.`,!1],[`aria-invalid`,`boolean | "true" | "false"`,``,"Marks the field as invalid (also set automatically when `error` is shown).",!1],[`aria-describedby`,`string`,``,`Ids of elements that describe the field, merged with the control's own description and error ids.`,!1],[`size`,`"sm" | "md" | "lg"`,`"md"`,`Slot size, in step with the other controls: "sm", "md" (default) or "lg".`,!1],[`length`,`number`,`6`,`Number of digits the code has.`,!1],[`value`,`string`,``,`Sets the code so far when controlled. Digits only.`,!1],[`defaultValue`,`string`,``,`Sets the starting code when uncontrolled.`,!1],[`onValueChange`,`((value: string) => void)`,``,`Called on every change with the digits entered so far.`,!1],[`onComplete`,`((value: string) => void)`,``,`Fires once every slot is filled.`,!1],[`status`,`OtpStatus`,`"idle"`,'"error" shakes the field and glows red; "success" plays `successEffect`. Set back to "idle" before re-triggering.',!1],[`successEffect`,`OtpSuccessEffect`,`"seal"`,`What "success" plays: "seal" (the slots fold into one glass seal with a drawn check), "ring" (a ring ripples round each slot) or "none" (colour only). Reduced motion fades the seal in and skips the rest.`,!1],[`stateLight`,`boolean`,`true`,'Lights the row by `status`: a red aura and lit edge for "error", green for "success" (`data-state` on the row, drawn on its own layer). The status is always written as text and border colour too.',!1],[`label`,`ReactNode`,``,`Visible text above the slots; it names the first slot.`,!1],[`labels`,`Partial<OtpInputLabels>`,`defaultOtpInputLabels`,'Every string, for translation: `{ name: "Verification code" }` (the default accessible name). Every other string, for translation: `labels={{ name: "…" }}`; omitted keys keep the English of `defaultOtpInputLabels`. Its only key is listed in the key table under the props table.',!1,{type:`OtpInputLabels`,const:`defaultOtpInputLabels`,keys:[[`name`,`Verification code`]]}],[`aria-label`,`string`,`labels?.name ?? defaultOtpInputLabels.name`,"Accessible name when no visible `label` is shown.",!1],[`aria-labelledby`,`string`,``,"Id of an element that names the field (instead of `label` / `aria-label`).",!1],[`description`,`ReactNode`,``,`Muted helper text under the slots.`,!1],[`errorMessage`,`ReactNode`,``,'Shown and announced while `status` is "error".',!1],[`successMessage`,`ReactNode`,``,'Shown and announced while `status` is "success".',!1],[`digitLabel`,`((position: number, length: number) => string)`,"(position, total) => `Digit ${position} of ${total}`",`Accessible name of slots 2…n. Translate it with the rest of your UI.`,!1],[`grouped`,`boolean`,`false`,`Visually split the slots into two groups (e.g. 3 + 3).`,!1],[`mask`,`boolean`,`false`,`Hide the digits like a password field.`,!1],[`autoFocus`,`boolean`,``,`Focus the first slot on mount. Use it only when the code is the one thing on the screen.`,!1],[`id`,`string`,`generated`,`Id of the first slot; a generated one is used when omitted.`,!1],[`className`,`string`,``,`Class for the outer wrapper (label + slots + messages).`,!1]],h=e(t()),g=n(),_=`px-3 sm:px-10`;function v(){let[e,t]=(0,h.useState)(``),[n,v]=(0,h.useState)(`idle`),[y,b]=(0,h.useState)(``),[x,S]=(0,h.useState)(`seal`),[C,w]=(0,h.useState)(``);return(0,g.jsxs)(s,{eyebrow:`Component`,title:`OTP input`,description:`One slot per digit, with paste, keyboard navigation and SMS autofill handled by Base UI's OTP field. Digits pop in, errors shake and glow red, and a correct code folds the slots into a glass seal.`,source:`theme/src/components/otp-input/otp-input.tsx`,children:[(0,g.jsx)(u,{label:`OTP input demo`,story:()=>p(()=>import(`./ShowcaseStage.otp-pa-pte2P.js`),[]),initial:{value:``,status:`idle`},minHeight:`21rem`,onInterrupt:`keep`,children:(e,t)=>(0,g.jsx)(d,{scene:e,ctx:t})}),(0,g.jsx)(f,{title:`Basic`,stageClassName:_,autoplay:()=>{let e=`482913`,t=e.split(``).map((t,n)=>window.setTimeout(()=>b(e.slice(0,n+1)),500+n*150));return t.push(window.setTimeout(()=>b(``),3200)),()=>{t.forEach(e=>window.clearTimeout(e)),b(``)}},code:`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={6} label="Verification code" description="Enter the code we sent you." />
  );
}`,children:(0,g.jsx)(i,{length:6,label:`Verification code`,description:`Enter the code we sent you.`,value:y,onValueChange:b})}),(0,g.jsx)(f,{title:`Status feedback`,stageClassName:_,description:`The correct code is 123456. Anything else shakes the field.`,code:`
import { useState } from "react";
import { OtpInput, type OtpStatus } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");

  return (
    <OtpInput
      grouped
      value={value}
      status={status}
      errorMessage="That code didn't match. Try 123456."
      successMessage="Code verified."
      // Only clear the status once the code is incomplete again: onValueChange also fires for the
      // last digit, and an unconditional reset there would undo onComplete's result.
      onValueChange={(v) => { setValue(v); if (v.length < 6) setStatus("idle"); }}
      onComplete={(v) => setStatus(v === "123456" ? "success" : "error")}
    />
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex max-w-full flex-col items-center gap-4`,children:[(0,g.jsx)(i,{grouped:!0,value:e,status:n,errorMessage:`That code didn't match. Try 123456.`,successMessage:`Code verified.`,onValueChange:e=>{t(e),e.length<6&&v(`idle`)},onComplete:e=>v(e===`123456`?`success`:`error`)}),(0,g.jsx)(r,{variant:`glass`,size:`sm`,onClick:()=>{t(``),v(`idle`)},children:`Reset`})]})}),(0,g.jsx)(f,{title:`Success effect`,stageClassName:_,description:`Type any 6 digits. "seal" (the default) scans the slots with light, folds them into one glass seal and draws a check; "ring" ripples a ring round each slot; "none" only recolours them. Reduced motion fades the seal in and skips the rest.`,code:`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput
      successEffect="seal" // "seal" (default) | "ring" | "none"
      status="success"
      defaultValue="123456"
      successMessage="Code verified."
    />
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex max-w-full flex-col items-center gap-4`,children:[(0,g.jsx)(a,{"aria-label":`Success effect`,size:`sm`,value:x,onValueChange:e=>{S(e),w(``)},items:[{value:`seal`,label:`Seal`},{value:`ring`,label:`Ring`},{value:`none`,label:`None`}]}),(0,g.jsx)(i,{"aria-label":`Verification code`,value:C,onValueChange:w,status:C.length===6?`success`:`idle`,successEffect:x,successMessage:`Code verified.`},x),(0,g.jsx)(r,{variant:`glass`,size:`sm`,onClick:()=>w(``),children:`Replay`})]})}),(0,g.jsx)(f,{title:`Masked, 4 digits`,stageClassName:_,code:`
import { OtpInput } from "@sheenui/theme";

export function Example() {
  return (
    <OtpInput length={4} mask label="PIN" />
  );
}`,children:(0,g.jsx)(i,{length:4,mask:!0,label:`PIN`})}),(0,g.jsx)(l,{of:m}),(0,g.jsx)(c,{rows:[[`Tab`,`Focus the first empty slot.`],[`0-9 (or letters, for alphanumeric)`,`Fill the slot and advance.`],[`Backspace`,`Clear the slot and move back.`],[`Arrow Left / Arrow Right`,`Move between slots.`],[`Paste`,`Fill every slot at once.`]]}),(0,g.jsx)(o,{items:[`The first slot is named by the label and the others "Digit n of N"; autoComplete="one-time-code" lets phones suggest the code.`,`The error and success messages sit in a polite live region; the seal and its sparks are decorative (aria-hidden), so the announcement is the same for every successEffect.`,`Slots are at least 44 px wide and 48 px tall with a 3:1 border (WCAG 1.4.11).`]})]})}export{v as default};