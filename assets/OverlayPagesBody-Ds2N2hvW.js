import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./input-DALTA051.js";import{a,i as o,n as s,o as c,r as l,t as u}from"./popover-Dgmn7_c4.js";import{n as d,t as f}from"./tooltip-DqEYBdLi.js";import{i as p,n as m,o as h,r as g}from"./Page-vzU90LKc.js";import{a as _,i as v,n as y,r as b,t as x}from"./ShowcaseStage.popover.scene-BZoj0krw.js";import{t as S}from"./ShowcaseStage-qzIATPiV.js";import{t as C}from"./Example-CmMsgUlK.js";import{t as w}from"./preload-helper-BrmCrVM7.js";var T=e(t()),E=n(),D=e=>(0,E.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,E.jsx)(`path`,{d:e})});function O(){return(0,E.jsxs)(m,{eyebrow:`Component`,title:`Tooltip`,description:`A small glass label on hover or keyboard focus. Inside a TooltipProvider, moving between tooltips is instant.`,source:`theme/src/components/tooltip/tooltip.tsx`,children:[(0,E.jsx)(S,{label:`Tooltip demo`,story:()=>w(()=>import(`./ShowcaseStage.tooltip-D5ACw560.js`),[]),initial:{open:-1},minHeight:`19rem`,children:e=>(0,E.jsx)(y,{scene:e})}),(0,E.jsx)(C,{title:`Icon toolbar`,code:`
import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";
import { Bold as BoldIcon, Italic as ItalicIcon } from "lucide-react";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Bold">
        <Button variant="glass" size="icon" aria-label="Bold"><BoldIcon /></Button>
      </Tooltip>
      <Tooltip content="Italic" side="bottom">
        <Button variant="glass" size="icon" aria-label="Italic"><ItalicIcon /></Button>
      </Tooltip>
    </TooltipProvider>
  );
}`,children:(0,E.jsx)(d,{children:(0,E.jsxs)(`div`,{className:`glass-1 flex gap-1 rounded-sheen-full p-1`,children:[(0,E.jsx)(f,{content:`Bold`,children:(0,E.jsx)(r,{variant:`ghost`,size:`icon`,"aria-label":`Bold`,className:`rounded-sheen-full`,children:D(`M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z`)})}),(0,E.jsx)(f,{content:`Italic`,children:(0,E.jsx)(r,{variant:`ghost`,size:`icon`,"aria-label":`Italic`,className:`rounded-sheen-full`,children:D(`M14 5h-4M14 19h-4M14 5l-4 14`)})}),(0,E.jsx)(f,{content:`Underline`,side:`bottom`,children:(0,E.jsx)(r,{variant:`ghost`,size:`icon`,"aria-label":`Underline`,className:`rounded-sheen-full`,children:D(`M7 4v7a5 5 0 0 0 10 0V4M5 20h14`)})})]})})}),(0,E.jsx)(C,{title:`Sides and delay`,description:`side picks the edge it opens on. delay is how long the pointer must rest before it opens; 0 shows it at once. A TooltipProvider makes moving between tooltips instant.`,stageClassName:`min-h-56`,code:`
import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Opens above (the default)">
        <Button variant="glass">Top</Button>
      </Tooltip>
      <Tooltip content="Opens to the right" side="right">
        <Button variant="glass">Right</Button>
      </Tooltip>
      <Tooltip content="Opens at once" delay={0}>
        <Button variant="glass">No delay</Button>
      </Tooltip>
      <Tooltip content="Waits a full second" delay={1000} side="bottom">
        <Button variant="glass">Slow</Button>
      </Tooltip>
    </TooltipProvider>
  );
}`,children:(0,E.jsxs)(d,{children:[(0,E.jsx)(f,{content:`Opens above (the default)`,children:(0,E.jsx)(r,{variant:`glass`,children:`Top`})}),(0,E.jsx)(f,{content:`Opens to the right`,side:`right`,children:(0,E.jsx)(r,{variant:`glass`,children:`Right`})}),(0,E.jsx)(f,{content:`Opens at once`,delay:0,children:(0,E.jsx)(r,{variant:`glass`,children:`No delay`})}),(0,E.jsx)(f,{content:`Waits a full second`,delay:1e3,side:`bottom`,children:(0,E.jsx)(r,{variant:`glass`,children:`Slow`})})]})}),(0,E.jsx)(g,{of:b}),(0,E.jsx)(h,{rows:[[`Tab / Shift + Tab`,`Focusing the trigger shows the tooltip; leaving it hides it.`],[`Escape`,`Dismiss the tooltip while keeping focus on the trigger.`]]}),(0,E.jsx)(p,{items:[`Tooltip adds no tab stop of its own; the trigger keeps its own. The bubble has role=“tooltip” and, while it is open, the trigger points to it with aria-describedby (added to any description it already has), so the text is announced as its description. It describes, it does not name: an icon-only trigger still needs its own aria-label.`,`Keep it to a short label. Anything interactive belongs in a Popover; essential text must not live only in a tooltip.`,`The bubble stays open while the pointer moves onto it (so it can be read while magnified) but holds no controls. On touch screens a long press (about half a second) shows it for a couple of seconds, and lifting the finger does not activate the trigger; a plain tap never shows it, so never hide the only label of a control in a tooltip. Under reduced motion it only fades.`]})]})}function k(){let[e,t]=(0,T.useState)(!1),[n,d]=(0,T.useState)(`Q3 roadmap`);return(0,E.jsxs)(m,{eyebrow:`Component`,title:`Popover`,description:`A glass panel anchored to a button, for small forms and details. Escape or clicking outside closes it.`,source:`theme/src/components/popover/popover.tsx`,children:[(0,E.jsx)(S,{label:`Popover demo`,story:()=>w(()=>import(`./ShowcaseStage.popover-Do83Ljo9.js`),[]),initial:{open:!1,name:`Q3 roadmap`,draft:`Q3 roadmap`},minHeight:`20rem`,children:(e,t)=>(0,E.jsx)(x,{scene:e,ctx:t})}),(0,E.jsx)(C,{title:`Share link`,stageClassName:`min-h-80`,code:`
import {
  Button,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@sheenui/theme";

export function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="glass" />}>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
        <Input readOnly defaultValue="https://example.com/blocks" />
        <PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}`,children:(0,E.jsxs)(u,{children:[(0,E.jsx)(c,{render:(0,E.jsx)(r,{variant:`glass`}),children:`Share`}),(0,E.jsxs)(l,{className:`flex flex-col gap-3`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(a,{children:`Share this page`}),(0,E.jsx)(o,{children:`Anyone with the link can view it.`})]}),(0,E.jsx)(i,{readOnly:!0,"aria-label":`Link`,defaultValue:`https://example.com/blocks`}),(0,E.jsx)(`div`,{className:`flex justify-end`,children:(0,E.jsx)(s,{render:(0,E.jsx)(r,{size:`sm`}),children:`Done`})})]})]})}),(0,E.jsx)(C,{title:`Placement and a controlled panel`,description:`side and align place the panel; open and onOpenChange let your code close it after saving.`,stageClassName:`min-h-80`,code:`
import { useState } from "react";
import { Button, Input, Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Q3 roadmap");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="glass" />}>{name}</PopoverTrigger>
      <PopoverContent side="right" align="start" className="flex w-72 flex-col gap-3">
        <PopoverTitle>Rename</PopoverTitle>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
      </PopoverContent>
    </Popover>
  );
}`,children:(0,E.jsxs)(u,{open:e,onOpenChange:t,children:[(0,E.jsx)(c,{render:(0,E.jsx)(r,{variant:`glass`}),children:n}),(0,E.jsxs)(l,{side:`right`,align:`start`,className:`flex w-72 flex-col gap-3`,children:[(0,E.jsx)(a,{children:`Rename`}),(0,E.jsx)(i,{label:`Name`,value:n,onChange:e=>d(e.target.value)}),(0,E.jsx)(r,{size:`sm`,onClick:()=>t(!1),children:`Save`})]})]})}),(0,E.jsx)(C,{title:`Bottom sheet on phones`,phonePreview:!0,description:`mobile='sheet' presents the panel as a bottom sheet under 640px wide, modal with a drag handle and swipe-to-dismiss. The default, 'popup', keeps the anchored panel. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).`,code:`
import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Popover mobile="sheet">
      <PopoverTrigger render={<Button variant="glass">Details</Button>} />
      <PopoverContent>
        <PopoverTitle>Billing</PopoverTitle>
        <PopoverDescription>Next invoice on 1 Dec.</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}`,children:(0,E.jsxs)(u,{mobile:`sheet`,children:[(0,E.jsx)(c,{render:(0,E.jsx)(r,{variant:`glass`,children:`Details`})}),(0,E.jsxs)(l,{children:[(0,E.jsx)(a,{children:`Billing`}),(0,E.jsx)(o,{children:`Next invoice on 1 Dec.`})]})]})}),(0,E.jsx)(g,{of:_,rows:[[`Popover open / defaultOpen`,`boolean`,`false`,"Controls whether the popover is open (`open`), or sets its initial state (`defaultOpen`)."],[`PopoverTrigger render`,`ReactElement`,``,`Render as your own element, e.g. render={<Button />}.`],[`PopoverContent side`,`"top" | "bottom" | "left" | "right"`,`"bottom"`,`Side of the trigger it opens on.`],[`PopoverContent align`,`"start" | "center" | "end"`,`"center"`,`Sets the alignment along that side.`],[`PopoverContent sideOffset`,`number (px)`,`8`,`Gap between the trigger and the popover.`],[`Popover ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example onOpenChange, onOpenChangeComplete, actionsRef, modal, triggerId, defaultTriggerId).`],[`PopoverTrigger ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example nativeButton, id, className, style, handle, payload).`],[`PopoverContent ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example style, className, render, initialFocus, finalFocus).`]]}),(0,E.jsx)(g,{of:v,title:`PopoverContent props`,as:`h3`}),(0,E.jsx)(h,{rows:[[`Enter / Space`,`Open or close it from the trigger; focus moves into the panel.`],[`Tab / Shift + Tab`,`Cycle inside the panel.`],[`Escape`,`Close it and return focus to the trigger.`]]}),(0,E.jsx)(p,{items:[`The trigger gets aria-expanded and aria-haspopup; the panel is labeled by PopoverTitle when you render one.`,`Use a Popover for interactive content; use a Tooltip for a short label and a HoverCard for a preview.`,`Under reduced motion the panel only fades.`]})]})}export{k as PopoverPage,O as TooltipPage};