import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./segmented-CFArq4bJ.js";import{i,n as a,o,r as s}from"./Page-BRuP8nt1.js";import{t as c}from"./Example-DaSezASZ.js";import{t as l}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as u}from"./ShowcaseStage-6bIrHuoy.js";import{n as d,r as f}from"./shared-B1uxrthV.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`aria-describedby`,`string`,``,`Ids of elements that describe the field, merged with the control's own description and error ids.`,!1],[`aria-invalid`,`boolean | "true" | "false"`,``,"Marks the field as invalid (also set automatically when `error` is shown).",!1],[`onBlur`,`FocusEventHandler<HTMLElement>`,``,`Called when focus leaves the control (not when it moves between the control's own parts).`,!1],[`name`,`string`,``,`Submits the chosen value with a form (a hidden input).`,!1],[`disabled`,`boolean`,`false`,`Disables every segment of the control.`,!1],[`items`,`SegmentedControlItem[]`,``,`The segments to show, in order.`,!0],[`value`,`string`,``,`Sets the chosen value when controlled.`,!1],[`defaultValue`,`string`,`the first enabled item`,`Sets the starting value when uncontrolled.`,!1],[`onValueChange`,`((value: string) => void)`,``,`Called with the new value when a different segment is chosen.`,!1],[`size`,`"sm" | "md" | "lg"`,`"md"`,`Height and text size: "sm" (28px), "md" (32px, default) or "lg" (40px).`,!1],[`fullWidth`,`boolean`,`false`,`Stretch to the container's width; segments share it equally.`,!1],[`iconOnly`,`boolean`,`false`,`Show only the icons. Each item's label (or aria-label) becomes its accessible name and tooltip.`,!1],[`adaptive`,`boolean`,`true`,`When the container is too narrow: tighten the padding, then (if every segment has an icon) show icons only, then truncate labels. Off: labels truncate straight away.`,!1],[`aria-label`,`string`,``,`Name of the control for screen readers, when no visible label points at it.`,!1],[`aria-labelledby`,`string`,``,`Id of an element that names the control.`,!1],[`className`,`string`,``,`Adds extra classes to the glass track.`,!1]],h=e(t()),g=n(),_=[{value:`list`,label:`List`},{value:`board`,label:`Board`},{value:`calendar`,label:`Calendar`}],v={list:[100,82,90,64],board:[34,34,34],calendar:[14,14,14,14,14,14,14]};function y({scene:e,ctx:t}){let[n,i]=l(e.view),a=v[n]??[];return(0,g.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,g.jsx)(r,{"aria-label":`View`,value:n,onValueChange:e=>{i(e),t.setState(`success`)},items:_}),(0,g.jsx)(`div`,{"aria-hidden":!0,className:`glass-1 flex h-20 w-full max-w-sm items-stretch gap-2 rounded-sheen-md p-3`,style:{flexDirection:n===`list`?`column`:`row`},children:a.map((e,t)=>(0,g.jsx)(`span`,{className:`rounded-sheen-sm bg-sheen-accent/25`,style:n===`list`?{width:`${e}%`,flex:1}:{flex:1}},`${n}-${t}`))}),(0,g.jsxs)(`p`,{className:`sheen-stage-sub`,children:[`Showing the `,(0,g.jsx)(`strong`,{className:`text-sheen-fg`,children:n}),` view`]})]})}f.sparkle,f.rocket,f.building;var b=[{value:`list`,label:`List`,icon:f.list},{value:`board`,label:`Board`,icon:f.board},{value:`calendar`,label:`Calendar`,icon:f.calendar}],x=[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}];function S(){let[e,t]=(0,h.useState)(`board`),[n,l]=(0,h.useState)(`week`),[_,v]=(0,h.useState)(`system`);return(0,g.jsxs)(a,{eyebrow:`Form`,title:`Segmented control`,description:`Pick one of a few views or modes. A glass pill slides to the chosen segment (it jumps with reduced motion) and the control never ends up empty. Tab enters it once; the arrow keys move between segments and Enter or Space picks one.`,source:`theme/src/components/segmented/segmented.tsx`,children:[(0,g.jsx)(u,{label:`Segmented control demo`,story:()=>p(()=>import(`./ShowcaseStage.segmented-control-CW_jnwBu.js`),[]),initial:{view:`list`},minHeight:`17rem`,onInterrupt:`keep`,children:(e,t)=>(0,g.jsx)(y,{scene:e,ctx:t})}),(0,g.jsx)(c,{title:`With icons`,description:`When its container gets narrow, the control tightens its padding, then shows icons only (each label stays the segment's accessible name and becomes its tooltip). Labels only truncate as a last resort. Resize the window to see it.`,code:`
import { useState } from "react";
import { SegmentedControl } from "@sheenui/theme";
import { LayoutDashboard as BoardIcon, Calendar as CalendarIcon, List as ListIcon } from "lucide-react";

export function Example() {
  const [view, setView] = useState("board");

  return (
    <SegmentedControl
      aria-label="View"
      value={view}
      onValueChange={setView}
      items={[
        { value: "list", label: "List", icon: <ListIcon /> },
        { value: "board", label: "Board", icon: <BoardIcon /> },
        { value: "calendar", label: "Calendar", icon: <CalendarIcon /> },
      ]}
    />
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex w-full min-w-0 flex-col items-center gap-3`,children:[(0,g.jsx)(r,{"aria-label":`View`,value:e,onValueChange:t,items:b}),(0,g.jsxs)(d,{children:[`Showing the `,(0,g.jsx)(`strong`,{children:e}),` view`]})]})}),(0,g.jsx)(c,{title:`Sizes`,description:`sm, md and lg. On touch screens every size is at least 44px tall.`,code:`
import { SegmentedControl } from "@sheenui/theme";

export function Example() {
  const ranges = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl key={size} size={size} aria-label={\`Range (\${size})\`} defaultValue="week" items={ranges} />
      ))}
    </div>
  );
}`,children:(0,g.jsx)(`div`,{className:`flex w-full min-w-0 flex-col items-center gap-4`,children:[`sm`,`md`,`lg`].map(e=>(0,g.jsx)(r,{size:e,"aria-label":`Range (${e})`,defaultValue:`week`,items:x},e))})}),(0,g.jsx)(c,{title:`Full width and icon only`,description:`fullWidth shares the row equally, which suits phones and narrow cards. iconOnly hides the labels; each one becomes the segment's accessible name and tooltip.`,code:`
import { useState } from "react";
import { SegmentedControl } from "@sheenui/theme";
import { Monitor as MonitorIcon, Moon as MoonIcon, Sun as SunIcon } from "lucide-react";

const ranges = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function Example() {
  const [range, setRange] = useState("week");
  const [theme, setTheme] = useState("system");

  return (
    <div className="glass-2 flex w-full max-w-sm flex-col gap-4 rounded-sheen-lg p-4">
      <SegmentedControl fullWidth aria-label="Range" value={range} onValueChange={setRange} items={ranges} />
      <div className="flex items-center justify-between gap-3">
        <span id="theme-label" className="text-sm font-medium">Theme</span>
        <SegmentedControl
          iconOnly
          size="sm"
          aria-labelledby="theme-label"
          value={theme}
          onValueChange={setTheme}
          items={[
            { value: "light", label: "Light", icon: <SunIcon /> },
            { value: "dark", label: "Dark", icon: <MoonIcon /> },
            { value: "system", label: "System", icon: <MonitorIcon /> },
          ]}
        />
      </div>
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{className:`glass-2 flex w-full max-w-sm flex-col gap-4 rounded-sheen-lg p-4`,children:[(0,g.jsx)(r,{fullWidth:!0,"aria-label":`Range`,value:n,onValueChange:l,items:x}),(0,g.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,g.jsx)(`span`,{id:`theme-label`,className:`text-sm font-medium`,children:`Theme`}),(0,g.jsx)(r,{iconOnly:!0,size:`sm`,"aria-labelledby":`theme-label`,value:_,onValueChange:v,items:[{value:`light`,label:`Light`,icon:f.sun},{value:`dark`,label:`Dark`,icon:f.moon},{value:`system`,label:`System`,icon:f.monitor}]})]})]})}),(0,g.jsx)(s,{of:m}),(0,g.jsx)(o,{rows:[[`Tab / Shift + Tab`,`Enter or leave the control once, on the chosen segment.`],[`Arrow Left / Arrow Right (or Up / Down)`,`Move between segments.`],[`Home / End`,`Jump to the first or last segment.`],[`Enter / Space`,`Pick the focused segment.`]]}),(0,g.jsx)(i,{items:[`A group of toggle buttons with aria-pressed: name the group with aria-label or aria-labelledby.`,`iconOnly segments keep their label as the accessible name. Segments are 44 px tall on touch screens.`,`In forced colors the chosen segment is outlined and underlined, since the pill's fill is dropped.`]})]})}export{S as default};