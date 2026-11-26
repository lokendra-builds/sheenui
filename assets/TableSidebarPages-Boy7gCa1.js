import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{t}from"./button-8i4LQrEk.js";import{n}from"./cn-CgB_fvgf.js";import{t as r}from"./field-size-DDo9wxLm.js";import{i,t as a}from"./vendor-react-D30i__oY.js";import{a as o,i as s,n as c,t as l}from"./field-V-2GzbMO.js";import{n as u,r as d}from"./Page-BAL5Idhy.js";import{t as f}from"./Example-BPfHvEYD.js";import{t as p}from"./ShowcaseStage-qzIATPiV.js";import{t as m}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as h}from"./lazy-block-BfzH_8EP.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=a();function v({size:e=`md`,invalid:t=!1,disabled:i=!1,className:a,children:o,...s}){return(0,_.jsx)(`div`,{role:`group`,"data-slot":`input-group`,"data-invalid":t?``:void 0,"data-disabled":i?``:void 0,className:n(`glass-1 flex w-full min-w-0 items-center overflow-hidden rounded-sheen-md border-sheen-control-border`,r[e],`transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out`,`focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]`,`has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus`,`data-invalid:border-sheen-danger-border data-invalid:focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]`,`data-disabled:cursor-not-allowed data-disabled:opacity-55`,a),...s,children:o})}function y({align:e=`start`,className:t,...r}){return(0,_.jsx)(`div`,{"data-slot":`input-group-addon`,"data-align":e,className:n(`flex h-full shrink-0 items-center gap-2 px-3 text-sm text-sheen-fg-muted [&_svg]:size-4`,e===`start`?`border-e border-sheen-border`:`border-s border-sheen-border`,t),...r})}function b({className:e,...t}){return(0,_.jsx)(`span`,{"data-slot":`input-group-text`,className:n(`whitespace-nowrap`,e),...t})}function x({className:e,...t}){return(0,_.jsx)(`input`,{"data-slot":`input-group-input`,className:n(`h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle`,`any-pointer-coarse:text-base disabled:cursor-not-allowed`,e),...t})}var S=[[`children`,`ReactNode`,``,"`InputGroupAddon`s and one `InputGroupInput`, in reading order.",!1],[`size`,`FieldSize`,`"md"`,'Height, the same scale as `Button` and every field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens).',!1],[`invalid`,`boolean`,`false`,"Mark the group invalid (danger edge). Pair it with `aria-invalid` on the input.",!1],[`disabled`,`boolean`,`false`,`Dim the group; disable the input yourself.`,!1]],C=[[`align`,`"end" | "start"`,`"start"`,`Which end of the field it sits on: "start" (before the input, default) or "end". It only changes the divider side: put the addon where you want it in the markup (DOM order is the reading order and the visual order).`,!1]],w=e(i());function T({scene:e,ctx:n}){let[r,i]=m(e.text),[a,o]=m(e.copied);return(0,_.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,_.jsx)(`p`,{className:`sheen-stage-title`,children:`Share your page`}),(0,_.jsxs)(v,{className:`sheen-stage-wide`,children:[(0,_.jsx)(y,{children:(0,_.jsx)(b,{children:`https://`})}),(0,_.jsx)(x,{"aria-label":`Page address`,placeholder:`your.site/name`,value:r,onChange:e=>{i(e.target.value),o(!1)}}),(0,_.jsx)(y,{align:`end`,children:(0,_.jsx)(t,{variant:`ghost`,size:`sm`,onClick:()=>{o(!0),n.setState(`success`)},children:a?`Copied`:`Copy`})})]}),(0,_.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:a?`Link copied to the clipboard.`:`Type an address, then copy it.`})]})}var E=`
import { useState } from "react";
import { Field, FieldControl, FieldError, FieldLabel, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  const [slug, setSlug] = useState("");
  const invalid = slug.length > 0 && !/^[a-z0-9-]+$/.test(slug);

  return (
    <Field invalid={invalid} className="max-w-sm">
      <FieldLabel>Workspace address</FieldLabel>
      <InputGroup invalid={invalid}>
        <InputGroupAddon>
          <InputGroupText>example.com/</InputGroupText>
        </InputGroupAddon>
        <FieldControl>
          <InputGroupInput value={slug} onChange={(event) => setSlug(event.target.value)} />
        </FieldControl>
      </InputGroup>
      <FieldError>Use lowercase letters, numbers and dashes.</FieldError>
    </Field>
  );
}`;function D(){let[e,t]=(0,w.useState)(``),n=e.length>0&&!/^[a-z0-9-]+$/.test(e);return(0,_.jsxs)(l,{invalid:n,className:`w-full max-w-sm`,children:[(0,_.jsx)(o,{children:`Workspace address`}),(0,_.jsxs)(v,{invalid:n,children:[(0,_.jsx)(y,{children:(0,_.jsx)(b,{children:`example.com/`})}),(0,_.jsx)(c,{children:(0,_.jsx)(x,{value:e,onChange:e=>t(e.target.value)})})]}),(0,_.jsx)(s,{children:`Use lowercase letters, numbers and dashes.`})]})}h(()=>g(()=>import(`./SidebarPageBody-D5mCRi3P.js`).then(e=>e.SidebarPage),[]),{eager:!0,minHeight:`80vh`});var O=`
import { Button, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" placeholder="example" />
        <InputGroupAddon align="end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupInput aria-label="Amount" inputMode="decimal" placeholder="0.00" />
        <InputGroupAddon align="end">USD</InputGroupAddon>
      </InputGroup>
      <InputGroup size="sm" invalid>
        <InputGroupInput aria-label="Coupon" aria-invalid defaultValue="SPRING" />
        <InputGroupAddon align="end">
          <Button variant="ghost" size="sm">Apply</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}`;function k(){return(0,_.jsxs)(u,{eyebrow:`Form`,title:`Input group`,description:`One field with things attached: a prefix, a suffix, a unit or a button, inside the same glass edge and sharing one focus ring.`,source:`theme/src/components/input-group/input-group.tsx`,keyboard:[[`Tab`,`Focuses the input, then any button inside an addon.`],[`Typing`,`Works as in any text input; the addons are not focusable text.`]],a11y:[`The group is role="group". Name the input with aria-label or a Field label: addon text is read as part of the page but is not the input's name unless you link it with aria-describedby.`,`invalid shows the danger edge; set aria-invalid on the input too, so the state is not carried by colour alone.`,`Icons in an addon should be aria-hidden; text such as https:// is read in order with the field.`,`Height follows the shared control scale (sm 32px, md 40px, lg 48px; 44px for sm and md on touch screens).`],children:[(0,_.jsx)(p,{label:`Input group demo`,story:()=>g(()=>import(`./ShowcaseStage.input-group-DNiDf6sA.js`),[]),initial:{text:``,copied:!1},minHeight:`14rem`,onInterrupt:`keep`,children:(e,t)=>(0,_.jsx)(T,{scene:e,ctx:t})}),(0,_.jsx)(f,{title:`Prefix, suffix, unit and button`,description:`Compose InputGroupAddon and InputGroupInput in reading order. Use Input's leading and trailing for a single icon.`,code:O,children:(0,_.jsxs)(`div`,{className:`flex w-full max-w-sm flex-col gap-4`,children:[(0,_.jsxs)(v,{children:[(0,_.jsx)(y,{children:(0,_.jsx)(b,{children:`https://`})}),(0,_.jsx)(x,{"aria-label":`Domain`,placeholder:`example`}),(0,_.jsx)(y,{align:`end`,children:(0,_.jsx)(b,{children:`.com`})})]}),(0,_.jsxs)(v,{size:`lg`,children:[(0,_.jsx)(x,{"aria-label":`Amount`,inputMode:`decimal`,placeholder:`0.00`}),(0,_.jsx)(y,{align:`end`,children:`USD`})]}),(0,_.jsxs)(v,{size:`sm`,invalid:!0,children:[(0,_.jsx)(x,{"aria-label":`Coupon`,"aria-invalid":!0,defaultValue:`SPRING`}),(0,_.jsx)(y,{align:`end`,children:(0,_.jsx)(t,{variant:`ghost`,size:`sm`,children:`Apply`})})]})]})}),(0,_.jsx)(f,{title:`Inside a Field`,description:`Field wires the label, the description and the error to the input: wrap the InputGroupInput in FieldControl, and set invalid on both the Field and the group so the danger edge and the message agree.`,code:E,children:(0,_.jsx)(D,{})}),(0,_.jsx)(d,{of:S,title:`InputGroup props`}),(0,_.jsx)(d,{of:C,title:`InputGroupAddon props`,as:`h3`}),(0,_.jsx)(d,{title:`Other parts`,as:`h3`,rows:[[`InputGroupText`,`span props`,``,`Shows plain text inside an addon.`],[`InputGroupInput`,`input props`,``,`The text field, as tall as the group, forwarding ref.`]]})]})}export{k as default};