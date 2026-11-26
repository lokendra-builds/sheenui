import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./select-Bt6c-Szl.js";import{i,n as a,o,r as s}from"./Page-ClekXXh-.js";import{t as c}from"./ShowcaseStage-qzIATPiV.js";import{n as l,t as u}from"./ShowcaseStage.select.scene-B9wQ4BHh.js";import{t as d}from"./Example-jva669kg.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=e(t()),m=n(),h=e=>(0,m.jsx)(`span`,{"aria-hidden":!0,className:`size-2.5 rounded-full`,style:{background:e}}),g=[{value:`react`,label:`React`,description:`UI library by Meta`,icon:h(`#58c4dc`)},{value:`vue`,label:`Vue`,description:`Progressive framework`,icon:h(`#42b883`)},{value:`svelte`,label:`Svelte`,description:`Compiles away`,icon:h(`#ff3e00`)},{value:`solid`,label:`Solid`,description:`Fine-grained reactivity`,icon:h(`#4f88c6`)},{value:`angular`,label:`Angular`,description:`Not available on your plan`,icon:h(`#dd0031`),disabled:!0}],_=[{value:`bom`,label:`Mumbai`,description:`ap-south-1`,group:`Asia Pacific`},{value:`sin`,label:`Singapore`,description:`ap-southeast-1`,group:`Asia Pacific`},{value:`tyo`,label:`Tokyo`,description:`ap-northeast-1`,group:`Asia Pacific`},{value:`fra`,label:`Frankfurt`,description:`eu-central-1`,group:`Europe`},{value:`lon`,label:`London`,description:`eu-west-2`,group:`Europe`},{value:`iad`,label:`Virginia`,description:`us-east-1`,group:`Americas`},{value:`sfo`,label:`San Francisco`,description:`us-west-1`,group:`Americas`}],v=Array.from({length:5e3},(e,t)=>({value:String(t+1),label:`Item ${String(t+1).padStart(4,`0`)}`}));function y(){let[e,t]=(0,p.useState)(`react`);return(0,m.jsxs)(a,{eyebrow:`Component`,title:`Select`,description:`A glass dropdown for picking one option. The chevron flips as it opens, items drift in one after another, and you can type to jump to an option. For search or multi-select, use Combobox.`,source:`theme/src/components/select/select.tsx`,children:[(0,m.jsx)(c,{label:`Select demo`,story:()=>f(()=>import(`./ShowcaseStage.select-B0Vn_VN4.js`),[]),initial:{open:!1,value:null},minHeight:`19rem`,children:(e,t)=>(0,m.jsx)(u,{scene:e,ctx:t})}),(0,m.jsx)(d,{title:`Icons and descriptions`,stageClassName:`min-h-80`,code:`
import { useState } from "react";
import { Select } from "@sheenui/theme";

const Dot = ({ color }: { color: string }) => <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />;

export function Example() {
  const [value, setValue] = useState<string | null>("react");

  return (
    <Select
      label="Framework"
      items={[
        { value: "react", label: "React", description: "UI library by Meta", icon: <Dot color="#58c4dc" /> },
        { value: "vue", label: "Vue", description: "Progressive framework", icon: <Dot color="#42b883" /> },
        { value: "angular", label: "Angular", description: "Not available on your plan", disabled: true },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
}`,children:(0,m.jsx)(`div`,{className:`w-72`,children:(0,m.jsx)(r,{label:`Framework`,items:g,value:e,onValueChange:t})})}),(0,m.jsx)(d,{title:`Grouped`,stageClassName:`min-h-96`,code:`
import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      placeholder="Choose a region"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1", group: "Asia Pacific" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1", group: "Europe" },
        { value: "iad", label: "Virginia", description: "us-east-1", group: "Americas" },
      ]}
    />
  );
}`,children:(0,m.jsx)(`div`,{className:`w-72`,children:(0,m.jsx)(r,{label:`Region`,placeholder:`Choose a region`,description:`Where your data is stored.`,items:_})})}),(0,m.jsx)(d,{title:`Thousands of options`,description:`Above 200 options the list is windowed on its own (virtualized defaults to auto); pass virtualized to force it. Only the rows near the viewport are in the DOM, yet Home, End, PageUp, PageDown and type-ahead reach every option and screen readers still hear 'item 3,000 of 5,000'. Press End, or type 'Item 4321'.`,stageClassName:`min-h-80`,code:`
import { Select } from "@sheenui/theme";

const items = Array.from({ length: 5000 }, (_, i) => ({
  value: String(i + 1),
  label: \`Item \${String(i + 1).padStart(4, "0")}\`,
}));

export function Example() {
  return <Select label="Item" items={items} virtualized />;
}`,children:(0,m.jsx)(`div`,{className:`w-72`,children:(0,m.jsx)(r,{label:`Item`,items:v,virtualized:!0})})}),(0,m.jsx)(d,{title:`Bottom sheet on phones`,phonePreview:!0,description:`mobile='sheet' opens the list as a bottom sheet under 640px wide: a drag handle you can swipe down, a scrolling body capped at 85dvh, safe-area padding and a dimmed scrim. The default, 'popup', keeps the floating list. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).`,stageClassName:`min-h-80`,code:`
import { Select } from "@sheenui/theme";

export function Example() {
  return (
    <Select
      label="Region"
      mobile="sheet"
      items={[
        { value: "bom", label: "Mumbai", description: "ap-south-1" },
        { value: "fra", label: "Frankfurt", description: "eu-central-1" },
        { value: "iad", label: "Virginia", description: "us-east-1" },
      ]}
    />
  );
}`,children:(0,m.jsx)(`div`,{className:`w-72`,children:(0,m.jsx)(r,{label:`Region`,mobile:`sheet`,items:_})})}),(0,m.jsx)(s,{of:l}),(0,m.jsx)(o,{rows:[[`Enter / Space / Arrow Down`,`Open the list from the trigger.`],[`Arrow Down / Arrow Up`,`Move through the options.`],[`Home / End`,`Jump to the first or last option.`],[`Type a letter`,`Jump to the next option that starts with it.`],[`Enter / Space`,`Pick the highlighted option.`],[`Escape`,`Close the list and return focus to the trigger.`]]}),(0,m.jsx)(i,{items:[`A Base UI Select: the trigger is a combobox-style button with aria-expanded, the popup a listbox of options.`,`label, description and error are linked to the trigger; the error is announced politely.`,`name submits the value with a form. Pass aria-label when there is no visible label.`]})]})}export{y as SelectPage};