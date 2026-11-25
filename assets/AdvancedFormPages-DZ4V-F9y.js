import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./rating-D4JvxTO_.js";import{i,n as a,o,r as s}from"./Page-DQ8sr8qt.js";import{t as c}from"./Example-DMEbQwm9.js";import{t as l}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{t as d}from"./demo-clock-CoEY-AlH.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=e(t()),h=n();function g({scene:e,ctx:t}){let[n,i]=l(e.value);return(0,h.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,h.jsx)(`p`,{className:`sheen-stage-title`,children:`How was your stay?`}),(0,h.jsx)(r,{"aria-label":`Rate your stay`,value:n,onValueChange:e=>{i(e),t.setState(e?`success`:`idle`)},size:`lg`}),(0,h.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:n?`Thanks! You gave ${n} ${n===1?`star`:`stars`}.`:`Tap a star to rate.`})]})}var _=[[`onBlur`,`FocusEventHandler<HTMLElement>`,``,`Called when focus leaves the control (not when it moves between the control's own parts).`,!1],[`name`,`string`,``,`Submits the value with a form.`,!1],[`required`,`boolean`,``,`Marks the field as required for form validation.`,!1],[`disabled`,`boolean`,`false`,`Disables the rating so it cannot be changed.`,!1],[`aria-invalid`,`boolean | "true" | "false"`,``,"Marks the field as invalid (also set automatically when `error` is shown).",!1],[`aria-describedby`,`string`,``,`Ids of elements that describe the field, merged with the control's own description and error ids.`,!1],[`value`,`number | null`,``,"The rating (controlled): a number from 0 to `max`, or null for none.",!1],[`defaultValue`,`number | null`,`null`,`Sets the starting rating when uncontrolled.`,!1],[`onValueChange`,`((value: number | null) => void)`,``,`Called with the new value, or null when cleared.`,!1],[`max`,`number`,`5`,`Number of icons the rating shows.`,!1],[`allowHalf`,`boolean`,`false`,`Allows half-star steps (0.5, 1, 1.5 …).`,!1],[`clearable`,`boolean`,`true`,`Click the current value (or press Backspace / Delete) to clear it.`,!1],[`readOnly`,`boolean`,`false`,`Show the value as an image only: not focusable, no hover.`,!1],[`size`,`"sm" | "md" | "lg"`,`"md"`,`Icon size: "sm" (16px), "md" (24px, default) or "lg" (32px).`,!1],[`tone`,`"accent" | "success" | "warning" | "danger"`,`"warning"`,`Colour of the filled icons: "warning" (gold, default), "accent", "danger" or "success".`,!1],[`icon`,`ReactNode`,`a star`,`Sets a custom filled icon (an SVG using currentColor).`,!1],[`emptyIcon`,`ReactNode`,`icon drawn as a faint outline`,`Sets a custom empty icon.`,!1],[`valueLabels`,`string[]`,``,`Words for each whole value, shown next to the icons, e.g. ["Poor", …, "Excellent"].`,!1],[`showValue`,`boolean`,`false`,`Show the number (e.g. "4.5") next to the icons.`,!1],[`locale`,`string`,``,`Locale used to format the number.`,!1],[`label`,`ReactNode`,``,`Visible text above the icons; it names the group.`,!1],[`description`,`ReactNode`,``,`Muted helper text under the icons.`,!1],[`aria-label`,`string`,``,"Accessible name when there is no visible `label`.",!1],[`aria-labelledby`,`string`,``,`Id of an element that names the rating.`,!1],[`labels`,`Partial<RatingLabels>`,`defaultRatingLabels`,'Every other string, for translation: `labels={{ item: "…" }}`; omitted keys keep the English of `defaultRatingLabels`. All 3 keys of `RatingLabels` are listed in the key table under the props table.',!1,{type:`RatingLabels`,const:`defaultRatingLabels`,keys:[[`item`,'(value) => `${value} ${value === 1 ? "star" : "stars"}`'],[`readOnly`,"(value, max) => `Rated ${value} out of ${max}`"],[`clearHint`,`Press Backspace to clear`]]}],[`className`,`string`,``,`Adds extra classes to the outer element.`,!1]];f(()=>p(()=>import(`./TagsInputPageBody-C1t0d_Vv.js`).then(e=>e.TagsInputPage),[]),{eager:!0,minHeight:`80vh`});var v=[`Poor`,`Fair`,`Good`,`Great`,`Excellent`];function y(){return(0,h.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-full`,fill:`currentColor`,stroke:`currentColor`,strokeWidth:`1.2`,strokeLinejoin:`round`,children:(0,h.jsx)(`path`,{d:`M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.5 3.4 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z`})})}function b(){return(0,h.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-full`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinejoin:`round`,children:(0,h.jsx)(`path`,{d:`M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.5 3.4 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z`})})}function x(){let[e,t]=(0,m.useState)(3.5),[n,l]=(0,m.useState)(4);return(0,h.jsxs)(a,{eyebrow:`Form`,title:`Rating`,description:`Stars (or any icon) with hover preview, half steps and a little cascade when the value changes. It's a radio group underneath, so arrow keys work and screen readers hear “4 stars, 4 of 5”.`,source:`theme/src/components/rating/rating.tsx`,children:[(0,h.jsx)(u,{label:`Rating demo`,story:()=>p(()=>import(`./ShowcaseStage.rating-Bijic2GH.js`),[]),initial:{value:null},minHeight:`14rem`,onInterrupt:`keep`,children:(e,t)=>(0,h.jsx)(g,{scene:e,ctx:t})}),(0,h.jsx)(c,{title:`Basic`,description:`Hover to preview, click to rate, click the same star again to clear (or press Backspace).`,autoplay:()=>{l(null);let e=[1,2,3,4,5].map((e,t)=>window.setTimeout(()=>l(e),500+t*160));return e.push(window.setTimeout(()=>l(4),2200)),()=>{e.forEach(e=>window.clearTimeout(e)),l(4)}},code:`
import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <Rating label="Rate your stay" defaultValue={4} />
  );
}`,children:(0,h.jsx)(r,{label:`Rate your stay`,value:n,onValueChange:l})}),(0,h.jsx)(c,{title:`Half stars with words`,description:`allowHalf gives every star a left and a right half (on touch screens, tap a star again for its half). valueLabels and showValue echo the hovered or chosen value.`,code:`
import { useState } from "react";
import { Rating } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState<number | null>(3.5);

  return (
    <Rating
      label="Overall"
      allowHalf
      value={value}
      onValueChange={setValue}
      valueLabels={["Poor", "Fair", "Good", "Great", "Excellent"]}
      showValue
      size="lg"
    />
  );
}`,children:(0,h.jsx)(r,{locale:d,label:`Overall`,allowHalf:!0,value:e,onValueChange:t,valueLabels:v,showValue:!0,size:`lg`})}),(0,h.jsx)(c,{title:`Read-only and sizes`,description:`Read-only ratings are one image with a full label (“Rated 4.5 out of 5”), not a set of controls.`,code:`
import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Rating readOnly value={4.5} size="sm" showValue />
      <Rating readOnly value={4.5} size="md" showValue />
      <Rating readOnly value={4.5} size="lg" showValue />
    </>
  );
}`,children:(0,h.jsxs)(`div`,{className:`flex flex-col items-center gap-3`,children:[(0,h.jsx)(r,{locale:d,readOnly:!0,value:4.5,size:`sm`,showValue:!0}),(0,h.jsx)(r,{locale:d,readOnly:!0,value:4.5,size:`md`,showValue:!0}),(0,h.jsx)(r,{locale:d,readOnly:!0,value:4.5,size:`lg`,showValue:!0})]})}),(0,h.jsx)(c,{title:`Custom icon and tone`,description:`Any SVG that uses currentColor. Labels are yours to translate.`,code:`
import { Rating } from "@sheenui/theme";
import { Heart as HeartIcon } from "lucide-react";

export function Example() {
  return (
    <Rating
      aria-label="Favorite level"
      icon={<HeartIcon fill="currentColor" />}
      emptyIcon={<HeartIcon />}
      tone="danger"
      max={6}
      defaultValue={3}
      labels={{ item: (v) => \`\${v} \${v === 1 ? "heart" : "hearts"}\` }}
    />
  );
}`,children:(0,h.jsx)(r,{locale:d,"aria-label":`Favorite level`,icon:(0,h.jsx)(y,{}),emptyIcon:(0,h.jsx)(b,{}),tone:`danger`,max:6,defaultValue:3,labels:{item:e=>`${e} ${e===1?`heart`:`hearts`}`}})}),(0,h.jsx)(s,{of:_}),(0,h.jsx)(o,{rows:[[`Tab / Shift + Tab`,`Enter or leave the group once.`],[`Arrow keys`,`Change the value (and select it).`],[`Backspace / Delete`,`Clear the value.`]]}),(0,h.jsx)(i,{items:[`A radiogroup of stars named by aria-label; each item has a spoken name ("3 of 5 stars", customisable through labels).`,`readOnly shows a score as an image (role="img") whose label states the value (translate it with labels.readOnly).`,`Pointer, touch and keyboard all select; the group announces how to clear the value.`]})]})}export{x as default};