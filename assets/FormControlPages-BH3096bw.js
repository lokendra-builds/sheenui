import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./checkbox-CSneMXUa.js";import{i as a,n as o,o as s,r as c}from"./Page-ClekXXh-.js";import{t as l}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{t as d}from"./Example-jva669kg.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`className`,`string`,``,"Classes for the outer element: the `<label>` (or the wrapper holding an `error`); the control itself when there is neither.",!1],[`controlClassName`,`string | ((state: CheckboxRootState) => string | undefined)`,``,`Classes for the checkbox box itself. Base UI's state function form works here.`,!1],[`label`,`ReactNode`,``,"Text next to the box. Clicking it toggles the checkbox. Without a label, give the checkbox an `aria-label`.",!1],[`description`,`ReactNode`,``,"Secondary line under the label. It sits inside the same `<label>`, so screen readers read it with the label.",!1],[`error`,`ReactNode`,``,"Error message under the control. Marks it invalid (`aria-invalid`, danger border) and is announced; linked with `aria-describedby`.",!1]],h=e(t()),g=n(),_=[`Design`,`Build`,`Ship`];function v({scene:e,ctx:t}){let[n,r]=l(e.done),a=n.every(Boolean),o=n.some(Boolean),s=e=>{r(e),t.setState(e.every(Boolean)?`success`:`idle`)};return(0,g.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(i,{label:`All tasks`,checked:a,indeterminate:o&&!a,onCheckedChange:e=>s([e,e,e])}),(0,g.jsx)(`div`,{className:`ms-8 flex flex-col gap-3`,children:_.map((e,t)=>(0,g.jsx)(i,{label:e,checked:n[t]??!1,onCheckedChange:e=>s(n.map((n,r)=>r===t?e:n))},e))})]})}var y={eager:!0,minHeight:`80vh`};function b(){let[e,t]=(0,h.useState)(!1),[n,l]=(0,h.useState)({design:!0,code:!1,ship:!1}),f=Object.values(n).every(Boolean),_=Object.values(n).some(Boolean);return(0,g.jsxs)(o,{eyebrow:`Component`,title:`Checkbox`,description:`A glass checkbox; the check pops in. Supports an indeterminate state for “select all”.`,source:`theme/src/components/checkbox/checkbox.tsx`,children:[(0,g.jsx)(u,{label:`Checkbox demo`,story:()=>p(()=>import(`./ShowcaseStage.checkbox-CllJfhPw.js`),[]),initial:{done:[!1,!1,!1]},children:(e,t)=>(0,g.jsx)(v,{scene:e,ctx:t})}),(0,g.jsx)(d,{title:`Select all (indeterminate)`,autoplay:()=>{l({design:!1,code:!1,ship:!1});let e=[`design`,`code`,`ship`].map((e,t)=>window.setTimeout(()=>l(t=>({...t,[e]:!0})),500+t*380));return e.push(window.setTimeout(()=>l({design:!0,code:!1,ship:!1}),2800)),()=>e.forEach(e=>window.clearTimeout(e))},code:`
import { useState } from "react";
import { Checkbox } from "@sheenui/theme";

export function Example() {
  const [items, setItems] = useState({ design: true, code: false, ship: false });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All tasks"
        checked={all}
        indeterminate={some && !all}
        onCheckedChange={(v) => setItems({ design: v, code: v, ship: v })}
      />
      <div className="ms-8 flex flex-col gap-3">
        {(["design", "code", "ship"] as const).map((key) => (
          <Checkbox
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            checked={items[key]}
            onCheckedChange={(v) => setItems({ ...items, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(i,{label:`All tasks`,checked:f,indeterminate:_&&!f,onCheckedChange:e=>l({design:e,code:e,ship:e})}),(0,g.jsx)(`div`,{className:`ms-8 flex flex-col gap-3`,children:[`design`,`code`,`ship`].map(e=>(0,g.jsx)(i,{label:e.charAt(0).toUpperCase()+e.slice(1),checked:n[e],onCheckedChange:t=>l({...n,[e]:t})},e))})]})}),(0,g.jsx)(d,{title:`In a form`,description:`Checkboxes submit with the form through name. Here the button stays disabled until the terms are accepted.`,code:`
import { useState } from "react";
import { Button, Checkbox } from "@sheenui/theme";

export function Example() {
  const [terms, setTerms] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(Object.fromEntries(new FormData(event.currentTarget)));
      }}
      className="flex flex-col items-start gap-4"
    >
      <Checkbox name="updates" label="Send me product updates" description="One email a month. Unsubscribe any time." defaultChecked />
      <Checkbox name="terms" label="I accept the terms" checked={terms} onCheckedChange={setTerms} />
      <Checkbox disabled label="Single sign-on" description="Managed by your administrator." />
      <Button type="submit" disabled={!terms}>Create account</Button>
    </form>
  );
}`,children:(0,g.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),console.log(Object.fromEntries(new FormData(e.currentTarget)))},className:`flex flex-col items-start gap-4`,children:[(0,g.jsx)(i,{name:`updates`,label:`Send me product updates`,description:`One email a month. Unsubscribe any time.`,defaultChecked:!0}),(0,g.jsx)(i,{name:`terms`,label:`I accept the terms`,checked:e,onCheckedChange:t}),(0,g.jsx)(i,{disabled:!0,label:`Single sign-on`,description:`Managed by your administrator.`}),(0,g.jsx)(r,{type:`submit`,disabled:!e,children:`Create account`})]})}),(0,g.jsx)(c,{of:m,rows:[[`checked / defaultChecked`,`boolean`,`false`,`Controlled or uncontrolled state.`],[`indeterminate`,`boolean`,`false`,`Shows a dash: some, but not all, children are checked.`],[`onCheckedChange`,`(checked) => void`,``,`Called with the new checked state when the control is toggled.`],[`disabled`,`boolean`,`false`,`Makes the control non-interactive.`]]}),(0,g.jsx)(s,{rows:[[`Tab / Shift + Tab`,`Move focus to or from the checkbox.`],[`Space`,`Toggle it (Enter does not, as with a native checkbox).`]]}),(0,g.jsx)(a,{items:[`A real checkbox role; indeterminate sets aria-checked="mixed".`,`The label and description share one <label>, so clicking either toggles it.`,`The unchecked border keeps 3:1 contrast; forced colors fill the box with Highlight. The touch hit area is 44 x 44 px.`]})]})}f(()=>p(()=>import(`./SelectPageBody-eAlz_JDc.js`).then(e=>e.SelectPage),[]),y);export{b as default};