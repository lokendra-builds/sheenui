import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{r as i}from"./toast-PePh6sao.js";import{t as a}from"./textarea-CFpEEz9-.js";import{i as o,n as s,o as c,r as l}from"./Page-ClekXXh-.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./Example-jva669kg.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./ShowcaseStage.follow-C3IvOXPy.js";import{r as m}from"./shared-BIVNUCsv.js";import{t as h}from"./preload-helper-BrmCrVM7.js";var g=[[`className`,`string`,``,`Class for the outer wrapper (label + field + messages).`,!1],[`maxLength`,`number`,``,`Character limit; shows the counter.`,!1],[`size`,`FieldSize`,`"md"`,'Padding that matches `Input` at the same size: "sm" (one line is 32px tall), "md" (40px) or "lg" (48px); sm and md are 44px on touch screens.',!1],[`label`,`ReactNode`,``,`Text above the field, linked to the textarea as its accessible name.`,!1],[`description`,`ReactNode`,``,`Muted helper text under the field.`,!1],[`error`,`ReactNode`,``,`Error message; marks the field invalid and is announced politely to screen readers when it appears.`,!1],[`autoResize`,`boolean`,`true`,`Grow with the content between minRows and maxRows.`,!1],[`minRows`,`number`,`3`,`Height in lines when empty (and the fixed height when autoResize is off).`,!1],[`maxRows`,`number`,`10`,`Sets how tall it grows before scrolling, in lines.`,!1],[`limit`,`"block" | "warn"`,`"block"`,`"block" (default) stops typing at maxLength; "warn" allows more but marks the field invalid.`,!1],[`showCount`,`boolean`,`on when maxLength is set`,`Show the counter. Without maxLength it counts up.`,!1],[`footer`,`ReactNode`,``,`Content for the bottom row inside the field, left of the counter (e.g. buttons).`,!1],[`labels`,`Partial<TextareaLabels>`,`defaultTextareaLabels`,'Screen-reader strings for the counter (i18n). Every other string, for translation: `labels={{ count: "…" }}`; omitted keys keep the English of `defaultTextareaLabels`. All 4 keys of `TextareaLabels` are listed in the key table under the props table.',!1,{type:`TextareaLabels`,const:`defaultTextareaLabels`,keys:[[`count`,"(count, max) => (max === undefined ? characters(count) : `${count} of ${characters(max)} used`)"],[`remaining`,"(left) => `${characters(left)} left`"],[`reached`,`Character limit reached`],[`over`,"(over) => `${characters(over)} over the limit`"]]}],[`textareaClassName`,`string`,``,`Adds extra classes to the native <textarea>.`,!1]],_=e(t()),v=n();function y({scene:e,ctx:t}){let[n,r]=p(e.text);return(0,v.jsx)(`div`,{className:`sheen-stage-col`,children:(0,v.jsx)(a,{label:`Leave a note`,placeholder:`Tell us about your stay…`,value:n,onChange:e=>{r(e.target.value),t.setState(`idle`)},maxLength:120,showCount:!0,minRows:2,maxRows:5,className:`sheen-stage-wide text-start`})})}function b(){let[e,t]=(0,_.useState)(`Shipping glass components that stay readable is mostly about contrast budgets.`),[n,u]=(0,_.useState)(`Designer and front-end developer in Lisbon. I care about motion that helps, contrast that holds up, and calm UI.`),p=i(),b=n.length>120;return(0,v.jsxs)(s,{eyebrow:`Form`,title:`Textarea`,description:`A glass multi-line field that grows with its content, with an optional character counter whose ring fills as you type. Label, description and error are wired up for screen readers, like Input.`,source:`theme/src/components/textarea/textarea.tsx`,children:[(0,v.jsx)(f,{label:`Textarea demo`,story:()=>h(()=>import(`./ShowcaseStage.textarea-TRvCOyi5.js`),[]),initial:{text:``},minHeight:`18rem`,onInterrupt:`keep`,children:(e,t)=>(0,v.jsx)(y,{scene:e,ctx:t})}),(0,v.jsx)(d,{title:`Auto-resize`,description:`Grows between minRows and maxRows, then scrolls. Measured off-screen, so the page never jumps while you type.`,code:`
import { Textarea } from "@sheenui/theme";

export function Example() {
  return (
    <Textarea
      label="Notes"
      placeholder="Write as much as you like…"
      description="Grows from 2 up to 8 lines."
      minRows={2}
      maxRows={8}
    />
  );
}`,children:(0,v.jsx)(`div`,{className:`w-full max-w-md`,children:(0,v.jsx)(a,{label:`Notes`,placeholder:`Write as much as you like…`,description:`Grows from 2 up to 8 lines.`,minRows:2,maxRows:8})})}),(0,v.jsx)(d,{title:`Character limit`,description:`The counter turns amber near the limit and red at it; typing past the limit is blocked with a little shake. Screen readers hear the count with the field and a polite note at 20 and 10 characters left.`,code:`
import { useState } from "react";
import { Button, Textarea, useToast } from "@sheenui/theme";
import { Paperclip as PaperclipIcon, Smile as SmileIcon } from "lucide-react";

export function Example() {
  const [post, setPost] = useState("Shipping glass components that stay readable is mostly about contrast budgets.");
  const toast = useToast();

  return (
    <form
      className="flex w-full max-w-md flex-col items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Posted", \`\${post.length} characters\`);
      }}
    >
      <Textarea
        label="Post"
        value={post}
        onChange={(e) => setPost(e.target.value)}
        maxLength={140}
        minRows={2}
        footer={
          <>
            <Button variant="ghost" size="icon" type="button" aria-label="Attach a file" className="size-8 any-pointer-coarse:size-11">
              <PaperclipIcon />
            </Button>
            <Button variant="ghost" size="icon" type="button" aria-label="Add an emoji" className="size-8 any-pointer-coarse:size-11">
              <SmileIcon />
            </Button>
          </>
        }
      />
      <Button type="submit" disabled={post.trim() === ""}>
        Post
      </Button>
    </form>
  );
}`,children:(0,v.jsxs)(`form`,{className:`flex w-full max-w-md flex-col items-end gap-3`,onSubmit:t=>{t.preventDefault(),p.success(`Posted`,`${e.length} characters`)},children:[(0,v.jsx)(a,{label:`Post`,value:e,onChange:e=>t(e.target.value),maxLength:140,minRows:2,footer:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r,{variant:`ghost`,size:`icon`,type:`button`,"aria-label":`Attach a file`,className:`size-8 any-pointer-coarse:size-11`,children:m.paperclip}),(0,v.jsx)(r,{variant:`ghost`,size:`icon`,type:`button`,"aria-label":`Add an emoji`,className:`size-8 any-pointer-coarse:size-11`,children:m.smile})]})}),(0,v.jsx)(r,{type:`submit`,disabled:e.trim()===``,children:`Post`})]})}),(0,v.jsx)(d,{title:`Soft limit`,description:`limit="warn" lets people keep typing and trim later: the field turns invalid and the counter shows how far over it is. This bio is a few characters short of the limit; keep typing.`,code:`
import { useState } from "react";
import { Textarea } from "@sheenui/theme";

export function Example() {
  const [bio, setBio] = useState("Designer and front-end developer in Lisbon. I care about motion that helps, contrast that holds up, and calm UI.");

  return (
    <Textarea
      label="Bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      maxLength={120}
      limit="warn"
      error={bio.length > 120 ? "Keep your bio to 120 characters." : undefined}
      description="Shown on your public profile."
    />
  );
}`,children:(0,v.jsx)(`div`,{className:`w-full max-w-md`,children:(0,v.jsx)(a,{label:`Bio`,value:n,onChange:e=>u(e.target.value),maxLength:120,limit:`warn`,error:b?`Keep your bio to 120 characters.`:void 0,description:`Shown on your public profile.`})})}),(0,v.jsx)(l,{of:g}),(0,v.jsx)(c,{rows:[[`Tab / Shift + Tab`,`Move focus to or from the textarea.`],[`Type, select, undo`,`Everything the native control does works.`]]}),(0,v.jsx)(o,{items:[`label, description, error and the character count are linked with aria-labelledby and aria-describedby; an error is announced politely.`,`The character count sits in a polite live region. Text is 16 px on touch screens so iOS does not zoom.`,`autoResize grows the field with its content and keeps the caret and scroll position.`]})]})}u(()=>h(()=>import(`./NumberFieldExamples-CaQofGHP.js`).then(e=>e.NumberFieldExamples),[]),{minHeight:`70rem`});export{b as default};