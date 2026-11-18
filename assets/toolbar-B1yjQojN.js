import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{En as r,O as i,an as a,ln as o}from"./vendor-docs-CuCbiIbi.js";import{xt as s}from"./vendor-core-D4q6uJEQ.js";import{n as c}from"./cn-Bb3VerOd.js";import{i as l}from"./use-preferences-CCoq5AYS.js";import{i as u}from"./form-Bep2DgOD.js";import{c as d}from"./tokens-u9Dgzdrd.js";import{t as f}from"./glass-card-h1PKw39E.js";import{n as p,r as m,s as h}from"./kbd-ByhO9O_W.js";import{n as g,t as _}from"./ToggleGroup-CiYAWHGu.js";import{n as v,t as y}from"./ToolbarGroupContext-JXc2eW1V.js";import{i as ee,n as b,r as x,t as S}from"./ToolbarLink-Dbcnxppq.js";import{t as te}from"./tooltip-Cg__3QQ3.js";import{h as ne,l as C,r as w,t as re,u as T}from"./menu-BpNwgTTS.js";import{r as E}from"./toast-CiFfCngf.js";import{t as D}from"./ShowcaseStage.follow-C3IvOXPy.js";import{i as O,n as k,t as A}from"./shared-DZrY_pcY.js";var j=e(t(),1),M=n(),N=j.forwardRef(function(e,t){let{className:n,disabled:r=!1,render:a,style:o,...c}=e,{orientation:l,disabled:u}=i(),d=u||r,f=j.useMemo(()=>({disabled:d}),[d]),p=s(`div`,e,{state:{disabled:d,orientation:l},ref:t,props:[{role:`group`},c]});return(0,M.jsx)(y.Provider,{value:f,children:p})}),P=j.forwardRef(function(e,t){let{className:n,focusableWhenDisabled:r=!0,render:s,disabled:c=!1,style:l,...u}=e,{disabled:d,orientation:f}=i(),p=v(),m=d||(p?.disabled??!1)||c,h=j.useMemo(()=>({disabled:m,focusableWhenDisabled:r}),[m,r]),{props:g}=o({composite:!0,disabled:m,focusableWhenDisabled:r,isNativeButton:!1}),_={disabled:m,orientation:f,focusable:r},y=e=>{m&&e.preventDefault()};return(0,M.jsx)(a,{tag:`input`,render:s,className:n,style:l,metadata:h,state:_,refs:[t],props:[{onClick:y,onPointerDown:y},u,g]})}),F=(0,j.createContext)({size:`md`,orientation:`horizontal`}),I=(0,j.createContext)(null),L={glass:`glass-1 rounded-sheen-lg`,floating:`glass-3 rounded-sheen-xl`,plain:``},R={glass:`p-1`,floating:`p-1.5`,plain:``};function z({variant:e=`glass`,size:t=`md`,overflow:n=`wrap`,orientation:r=`horizontal`,className:i,contentClassName:a,children:o,ref:s,onKeyDown:l,...d}){let f=r===`vertical`,p=n===`scroll`&&!f,m=(0,j.useMemo)(()=>({size:t,orientation:r}),[t,r]),h=(0,j.useRef)(null);V(h,!f&&!p);let g=u(h,s);return(0,M.jsx)(F,{value:m,children:(0,M.jsx)(x,{ref:g,"data-slot":`toolbar`,"data-variant":e,orientation:r,onKeyDown:e=>{let t=e.defaultPrevented&&e.target.matches(`[aria-disabled=true], [data-disabled]`);l?.(e),(!e.defaultPrevented||t)&&B(e,h.current)},className:c(`flex w-fit max-w-full min-w-0 items-center gap-0.5`,f?`flex-col`:p?`flex-nowrap`:`flex-wrap`,L[e],!p&&R[e],`data-disabled:opacity-60`,i),...d,children:p?(0,M.jsx)(H,{className:c(`flex min-w-0 flex-nowrap items-center gap-0.5`,R[e]||`p-1`,a),children:o}):o})})}function B(e,t){if(!t||e.key!==`Home`&&e.key!==`End`||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest(`input, textarea, select, [contenteditable]:not([contenteditable=false])`))return;let n=Array.from(t.querySelectorAll(`[tabindex]`)).filter(e=>e.closest(`[role=toolbar]`)===t&&!e.matches(`:disabled`)&&e.tabIndex>=-1),r=e.key===`Home`?n[0]:n[n.length-1];r&&(e.preventDefault(),r!==document.activeElement&&r.focus())}function V(e,t){(0,j.useLayoutEffect)(()=>{let n=e.current;if(!n||!t)return;let r=()=>{for(let e of Array.from(n.querySelectorAll(`[data-slot=toolbar-separator]`))){let t=e.getBoundingClientRect(),n=t.top+t.height/2,r=e=>{if(!e)return!0;let t=e.getBoundingClientRect();return n<t.top||n>t.bottom};r(e.previousElementSibling)||r(e.nextElementSibling)?e.setAttribute(`data-row-edge`,``):e.removeAttribute(`data-row-edge`)}};r();let i=new ResizeObserver(r);return i.observe(n),()=>i.disconnect()},[e,t])}function H({className:e,children:t}){let n=(0,j.useRef)(null),[r,i]=(0,j.useState)({start:!1,end:!1}),a=(0,j.useCallback)(()=>{let e=n.current;if(!e)return;let t=Math.abs(e.scrollLeft),r=e.scrollWidth-e.clientWidth,a={start:t>1,end:r-t>1};i(e=>e.start===a.start&&e.end===a.end?e:a)},[]);(0,j.useLayoutEffect)(()=>{let e=n.current;if(!e)return;a();let t=new ResizeObserver(a);t.observe(e);for(let n of Array.from(e.children))t.observe(n);return()=>t.disconnect()},[a]);let o=`1.5rem`,s=`linear-gradient(var(--sheen-toolbar-dir), ${r.start?`transparent, black ${o}`:`black, black`}, ${r.end?`black calc(100% - ${o}), transparent`:`black, black`})`;return(0,M.jsx)(`div`,{ref:n,onScroll:a,"data-slot":`toolbar-scroller`,className:c(`overflow-x-auto overscroll-x-contain rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`,`[--sheen-toolbar-dir:to_right] rtl:[--sheen-toolbar-dir:to_left]`,e),style:{maskImage:s,WebkitMaskImage:s},children:t})}var U={sm:`h-8 min-w-8 gap-1.5 px-2 text-xs [&_svg]:size-3.5`,md:`h-9 min-w-9 gap-2 px-2.5 text-sm [&_svg]:size-4`};function W(e,t){return c(`group/tb relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sheen-md font-medium whitespace-nowrap select-none`,`touch-manipulation [-webkit-tap-highlight-color:transparent] [&_svg]:shrink-0`,`text-sheen-fg-muted transition-[color] duration-(--sheen-duration-fast) hover:text-sheen-fg`,U[e],t&&`aspect-square px-0`,`before:pointer-events-none before:absolute before:inset-0 before:-z-20 before:rounded-[inherit] before:bg-sheen-hover before:opacity-0`,`before:transition-opacity before:duration-(--sheen-duration-fast) hover:before:opacity-100 data-popup-open:before:opacity-100`,`data-popup-open:text-sheen-fg`,`motion-ok:transition-[color,scale] motion-ok:active:not-data-disabled:scale-95`,`focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,`data-disabled:cursor-not-allowed data-disabled:opacity-45 data-disabled:hover:text-sheen-fg-muted data-disabled:hover:before:opacity-0`,`any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11`,`forced-colors:before:hidden`)}function G(e,{tooltip:t,shortcut:n,tooltipSide:r},i){return t?(0,M.jsx)(te,{side:r??(i===`vertical`?`right`:`top`),content:(0,M.jsxs)(`span`,{className:`inline-flex items-center gap-2`,children:[t,n&&(0,M.jsx)(p,{keys:n,announce:!1})]}),children:e}):e}function K(e){return(0,j.isValidElement)(e)&&(e.type===`svg`||typeof e.type!=`string`)}function q({tooltip:e,shortcut:t,tooltipSide:n,iconOnly:r,className:i,children:a,"aria-label":o,...s}){let{size:l,orientation:u}=(0,j.useContext)(F),d=r??K(a),f=J(t);return G((0,M.jsx)(b,{"data-slot":`toolbar-button`,"aria-label":o??(d&&typeof e==`string`?e:void 0),"aria-keyshortcuts":f,className:c(W(l,d),i),...s,children:a}),{tooltip:e,shortcut:t,tooltipSide:n},u)}function J(e){let t=m();return e?h(e,t):void 0}function Y({multiple:e=!1,required:t=!1,orientation:n,value:r,defaultValue:i,onValueChange:a,className:o,...s}){let l=(0,j.useId)(),u=(0,j.useContext)(F),[d,f]=(0,j.useState)(()=>i??[]),p=t&&!e?{value:r??d,onValueChange:(e,t)=>{e.length!==0&&(r===void 0&&f(e),a?.(e,t))}}:{value:r,defaultValue:i,onValueChange:a};return(0,M.jsx)(I,{value:e?null:l,children:(0,M.jsx)(_,{"data-slot":`toolbar-toggle-group`,multiple:e,orientation:n??u.orientation,className:c(`flex items-center gap-0.5 data-[orientation=vertical]:flex-col`,o),...p,...s})})}function X({tooltip:e,shortcut:t,tooltipSide:n,iconOnly:i,className:a,children:o,disabled:s,"aria-label":u,...f}){let{size:p,orientation:m}=(0,j.useContext)(F),h=(0,j.useContext)(I),_=l(),v=i??K(o),y=J(t);return G((0,M.jsx)(b,{"data-slot":`toolbar-toggle`,disabled:s,"aria-label":u??(v&&typeof e==`string`?e:void 0),"aria-keyshortcuts":y,className:c(W(p,v),`data-pressed:text-sheen-accent data-pressed:hover:text-sheen-accent`,`forced-colors:data-pressed:bg-[Highlight] forced-colors:data-pressed:text-[HighlightText] forced-colors:data-pressed:[forced-color-adjust:none]`,a),render:(0,M.jsx)(g,{disabled:s,...f,render:(e,t)=>(0,M.jsxs)(`button`,{type:`button`,...e,children:[h?t.pressed&&(0,M.jsx)(r.span,{"aria-hidden":!0,layoutId:h,transition:_?{duration:0}:d.snappy,className:`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden`}):(0,M.jsx)(`span`,{"aria-hidden":!0,className:c(`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden`,`opacity-0 transition-[opacity,scale] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:scale-75`,`group-data-pressed/tb:opacity-100 group-data-pressed/tb:duration-(--sheen-duration-snappy) group-data-pressed/tb:ease-sheen-snappy motion-ok:group-data-pressed/tb:scale-100`)}),e.children]})}),children:o}),{tooltip:e,shortcut:t,tooltipSide:n},m)}function Z({className:e,...t}){return(0,M.jsx)(N,{"data-slot":`toolbar-group`,className:c(`flex items-center gap-0.5 data-[orientation=vertical]:flex-col`,e),...t})}function Q({className:e,...t}){return(0,M.jsx)(ee,{"data-slot":`toolbar-separator`,className:c(`shrink-0 self-center border-sheen-fg-subtle/35`,`data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-5 data-[orientation=vertical]:border-s`,`data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:w-5 data-[orientation=horizontal]:border-t`,`data-row-edge:invisible`,e),...t})}function ie({className:e}){return(0,M.jsx)(`div`,{"aria-hidden":!0,"data-slot":`toolbar-spacer`,className:c(`min-w-2 flex-1`,e)})}function ae({className:e,...t}){let{size:n}=(0,j.useContext)(F);return(0,M.jsx)(S,{"data-slot":`toolbar-link`,className:c(`relative inline-flex shrink-0 items-center gap-1.5 rounded-sheen-sm px-2 whitespace-nowrap text-sheen-fg-muted`,n===`sm`?`h-8 text-xs`:`h-9 text-sm`,`underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-(--sheen-duration-fast)`,`hover:text-sheen-fg hover:decoration-sheen-fg-subtle`,`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,`any-pointer-coarse:min-h-11`,e),...t})}function oe({className:e,...t}){let{size:n}=(0,j.useContext)(F);return(0,M.jsx)(P,{"data-slot":`toolbar-input`,className:c(`min-w-0 rounded-sheen-sm border border-sheen-control-border bg-sheen-hover px-2.5 text-sheen-fg placeholder:text-sheen-fg-subtle`,`transition-[border-color] duration-(--sheen-duration-fast) hover:border-sheen-fg-muted`,n===`sm`?`h-8 w-32 text-xs`:`h-9 w-40 text-sm`,`any-pointer-coarse:min-h-11 any-pointer-coarse:text-base`,`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,`data-disabled:opacity-50`,e),...t})}var se=[[`orientation`,`"horizontal" | "vertical"`,`"horizontal"`,`Sets the layout direction of the toolbar and its arrow-key navigation.`,!1],[`variant`,`"glass" | "plain" | "floating"`,`"glass"`,`"glass" panel (default), "floating" pill for selection / canvas toolbars, or "plain" (no surface).`,!1],[`size`,`ToolbarSize`,`"md"`,`Control height: "sm" (32px) or "md" (36px, default).`,!1],[`overflow`,`"wrap" | "scroll"`,`"wrap"`,`Horizontal toolbars on narrow screens: wrap onto more rows (default), or scroll sideways in one row.`,!1],[`className`,`string`,``,`Adds a class name to the toolbar element.`,!1],[`contentClassName`,`string`,``,`overflow="scroll" only: the scrolling row inside the toolbar.`,!1]],ce=[[`tooltip`,`ReactNode`,``,`Tooltip text. For an icon-only control it also becomes the accessible name (unless aria-label is set).`,!1],[`shortcut`,`string`,``,'Keyboard shortcut shown in the tooltip, e.g. "mod+b". Also set as `aria-keyshortcuts`.',!1],[`tooltipSide`,`"top" | "bottom" | "left" | "right"`,`"top" ("right" in a vertical toolbar)`,`Which side the tooltip opens on.`,!1],[`iconOnly`,`boolean`,``,`Square button for a lone icon. Detected automatically for a single element child.`,!1],[`className`,`string`,``,`Adds extra classes to the button.`,!1]],le=[[`tooltip`,`ReactNode`,``,`Tooltip text. For an icon-only control it also becomes the accessible name (unless aria-label is set).`,!1],[`shortcut`,`string`,``,'Keyboard shortcut shown in the tooltip, e.g. "mod+b". Also set as `aria-keyshortcuts`.',!1],[`tooltipSide`,`"top" | "bottom" | "left" | "right"`,`"top" ("right" in a vertical toolbar)`,`Which side the tooltip opens on.`,!1],[`iconOnly`,`boolean`,``,`Square toggle for a lone icon. Detected automatically for a single element child.`,!1],[`className`,`string`,``,`Adds extra classes to the toggle.`,!1]],ue=[[`multiple`,`boolean`,`false`,"When `false` only one item in the group can be pressed. If any item in the group becomes pressed, the others will become unpressed. When `true` multiple items can be pressed.",!1],[`required`,`boolean`,`false`,`Single choice: one option always stays pressed (pressing the pressed one again does nothing), e.g. text alignment or the active tool.`,!1],[`className`,`string`,``,`Extra classes for the group.`,!1]];function de({scene:e}){let[t,n]=D(e.styles),r=t?t.split(`,`):[];return(0,M.jsxs)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:[(0,M.jsx)(z,{"aria-label":`Text formatting`,children:(0,M.jsxs)(Y,{multiple:!0,"aria-label":`Text style`,value:r,onValueChange:e=>n(e.map(String).join(`,`)),children:[(0,M.jsx)(X,{value:`bold`,tooltip:`Bold`,children:O(k.bold)}),(0,M.jsx)(X,{value:`italic`,tooltip:`Italic`,children:O(k.italic)}),(0,M.jsx)(X,{value:`underline`,tooltip:`Underline`,children:O(k.underline)})]})}),(0,M.jsx)(`p`,{className:`m-0 text-lg`,style:{fontWeight:r.includes(`bold`)?700:400,fontStyle:r.includes(`italic`)?`italic`:`normal`,textDecoration:r.includes(`underline`)?`underline`:`none`},children:`Glass catches the light.`})]})}var $={paragraph:`Paragraph`,h1:`Heading 1`,h2:`Heading 2`,quote:`Quote`},fe=`
import { useState } from "react";
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@sheenui/theme";
import { AlignCenter as AlignCenterIcon, AlignLeft as AlignLeftIcon, AlignRight as AlignRightIcon, Bold as BoldIcon, ChevronDown as ChevronIcon, Italic as ItalicIcon, Link as LinkIcon, Redo2 as RedoIcon, Underline as UnderlineIcon, Undo2 as UndoIcon } from "lucide-react";

type Block = "paragraph" | "h1";
const blockLabels: Record<Block, string> = { paragraph: "Paragraph", h1: "Heading 1" };

export function Example() {
  const [marks, setMarks] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string[]>(["left"]);
  const [block, setBlock] = useState<Block>("paragraph");

  return (
    <Toolbar aria-label="Formatting">
      <ToolbarGroup aria-label="History">
        <ToolbarButton tooltip="Undo" shortcut="mod+z"><UndoIcon /></ToolbarButton>
        <ToolbarButton tooltip="Redo" shortcut="shift+mod+z" disabled><RedoIcon /></ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <Menu>
        <ToolbarButton render={<MenuTrigger />}>{blockLabels[block]} <ChevronIcon /></ToolbarButton>
        <MenuContent>
          <MenuRadioGroup value={block} onValueChange={setBlock}>
            <MenuRadioItem value="paragraph">Paragraph</MenuRadioItem>
            <MenuRadioItem value="h1">Heading 1</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <ToolbarSeparator />
      <ToolbarToggleGroup multiple value={marks} onValueChange={setMarks} aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
        <ToolbarToggle value="underline" tooltip="Underline" shortcut="mod+u"><UnderlineIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      {/* Single choice: one accent pill glides between the options; required keeps one pressed. */}
      <ToolbarToggleGroup required value={align} onValueChange={setAlign} aria-label="Alignment">
        <ToolbarToggle value="left" tooltip="Align left"><AlignLeftIcon /></ToolbarToggle>
        <ToolbarToggle value="center" tooltip="Align center"><AlignCenterIcon /></ToolbarToggle>
        <ToolbarToggle value="right" tooltip="Align right"><AlignRightIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Insert link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarSpacer />
      <ToolbarLink href={"/history"}>Edited 2m ago</ToolbarLink>
    </Toolbar>
  );
}`;function pe(){let e=E(),[t,n]=(0,j.useState)([`bold`]),[r,i]=(0,j.useState)([`left`]),[a,o]=(0,j.useState)(`paragraph`),s=r[0]??`left`;return(0,M.jsxs)(`div`,{className:`flex w-full max-w-3xl flex-col gap-4`,children:[(0,M.jsxs)(z,{"aria-label":`Formatting`,children:[(0,M.jsxs)(Z,{"aria-label":`History`,children:[(0,M.jsx)(q,{tooltip:`Undo`,shortcut:`mod+z`,onClick:()=>e.info(`Undo`),children:O(k.undo)}),(0,M.jsx)(q,{tooltip:`Redo`,shortcut:`shift+mod+z`,disabled:!0,children:O(k.redo)})]}),(0,M.jsx)(Q,{}),(0,M.jsxs)(re,{children:[(0,M.jsxs)(q,{render:(0,M.jsx)(ne,{}),className:`min-w-28 justify-between`,children:[$[a],O(k.chevron)]}),(0,M.jsx)(w,{className:`w-44`,children:(0,M.jsx)(C,{value:a,onValueChange:e=>o(e),children:Object.keys($).map(e=>(0,M.jsx)(T,{value:e,children:$[e]},e))})})]}),(0,M.jsx)(Q,{}),(0,M.jsxs)(Y,{multiple:!0,value:t,onValueChange:n,"aria-label":`Text style`,children:[(0,M.jsx)(X,{value:`bold`,tooltip:`Bold`,shortcut:`mod+b`,children:O(k.bold)}),(0,M.jsx)(X,{value:`italic`,tooltip:`Italic`,shortcut:`mod+i`,children:O(k.italic)}),(0,M.jsx)(X,{value:`underline`,tooltip:`Underline`,shortcut:`mod+u`,children:O(k.underline)}),(0,M.jsx)(X,{value:`strike`,tooltip:`Strikethrough`,shortcut:`shift+mod+x`,children:O(k.strike)})]}),(0,M.jsx)(Q,{}),(0,M.jsxs)(Y,{required:!0,value:r,onValueChange:i,"aria-label":`Alignment`,children:[(0,M.jsx)(X,{value:`left`,tooltip:`Align left`,children:O(k.alignLeft)}),(0,M.jsx)(X,{value:`center`,tooltip:`Align center`,children:O(k.alignCenter)}),(0,M.jsx)(X,{value:`right`,tooltip:`Align right`,children:O(k.alignRight)}),(0,M.jsx)(X,{value:`justify`,tooltip:`Justify`,children:O(k.alignJustify)})]}),(0,M.jsx)(Q,{}),(0,M.jsxs)(Z,{"aria-label":`Insert`,children:[(0,M.jsx)(q,{tooltip:`Insert link`,shortcut:`mod+k`,onClick:()=>e.info(`Insert link`),children:O(k.link)}),(0,M.jsx)(q,{tooltip:`Insert image`,onClick:()=>e.info(`Insert image`),children:O(k.image)})]}),(0,M.jsx)(ie,{}),(0,M.jsx)(ae,{render:(0,M.jsx)(A,{to:`/history`}),children:`Edited 2m ago`})]}),(0,M.jsx)(f,{level:1,sheen:!1,className:`min-h-32 p-5`,children:(0,M.jsx)(`p`,{className:c(`text-pretty text-sheen-fg`,a===`h1`&&`text-2xl font-semibold tracking-tight`,a===`h2`&&`text-lg font-semibold`,a===`paragraph`&&`text-sm leading-relaxed`,a===`quote`&&`border-s-2 border-sheen-accent ps-4 text-base text-sheen-fg-muted italic`,t.includes(`bold`)&&`font-bold`,t.includes(`italic`)&&`italic`,t.includes(`underline`)&&`underline underline-offset-4`,t.includes(`strike`)&&`line-through`,s===`center`&&`text-center`,s===`right`&&`text-end`,s===`justify`&&`text-justify`),children:`Glass works when it stays readable: a blur strong enough to quiet the backdrop, a rim of light to give it an edge, and text that keeps its contrast whatever passes behind.`})})]})}var me=`
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Bold as BoldIcon, MessageSquare as CommentIcon, Italic as ItalicIcon, Link as LinkIcon, Sparkles as SparkleIcon } from "lucide-react";

export function Example() {
  return (
    <Toolbar variant="floating" size="sm" aria-label="Selection">
      <ToolbarToggleGroup multiple aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarButton tooltip="Link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarButton tooltip="Comment"><CommentIcon /></ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton><SparkleIcon /> Ask AI</ToolbarButton>
    </Toolbar>
  );
}`,he=`
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Hand as HandIcon, Minus as MinusIcon, Pen as PenIcon, Plus as PlusIcon, MousePointer2 as PointerIcon, Square as SquareIcon, Type as TypeIcon } from "lucide-react";

export function Example() {
  const [tool, setTool] = useState<string[]>(["select"]);

  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <ToolbarToggleGroup required value={tool} onValueChange={setTool} aria-label="Tool">
        <ToolbarToggle value="select" tooltip="Select" shortcut="v"><PointerIcon /></ToolbarToggle>
        <ToolbarToggle value="hand" tooltip="Hand" shortcut="h"><HandIcon /></ToolbarToggle>
        <ToolbarToggle value="pen" tooltip="Pen" shortcut="p"><PenIcon /></ToolbarToggle>
        <ToolbarToggle value="shape" tooltip="Rectangle" shortcut="r"><SquareIcon /></ToolbarToggle>
        <ToolbarToggle value="text" tooltip="Text" shortcut="t"><TypeIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Zoom in" shortcut="mod+="><PlusIcon /></ToolbarButton>
      <ToolbarButton tooltip="Zoom out" shortcut="mod+-"><MinusIcon /></ToolbarButton>
    </Toolbar>
  );
}`,ge=`
import { Toolbar, ToolbarButton, ToolbarInput } from "@sheenui/theme";

export function Example() {
  // One row that scrolls sideways on narrow screens, with fades on the edges that have more.

  return (
    <>
      <Toolbar overflow="scroll" aria-label="Formatting">
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>

      {/* A search field: at most one, and last (arrow keys move its caret). */}
      <ToolbarInput aria-label="Search in document" placeholder="Search" />
    </>
  );
}`;function _e(){let e=[{value:`select`,label:`Select`,key:`v`,d:k.pointer},{value:`hand`,label:`Hand`,key:`h`,d:k.hand},{value:`pen`,label:`Pen`,key:`p`,d:k.pen},{value:`shape`,label:`Rectangle`,key:`r`,d:k.square},{value:`text`,label:`Text`,key:`t`,d:k.type}],[t,n]=(0,j.useState)([`select`]),[r,i]=(0,j.useState)(100),a=e.find(e=>e.value===t[0]);return(0,M.jsxs)(`div`,{className:`flex w-full max-w-xl items-stretch gap-4`,children:[(0,M.jsxs)(z,{orientation:`vertical`,"aria-label":`Tools`,className:`self-start`,children:[(0,M.jsx)(Y,{required:!0,value:t,onValueChange:n,"aria-label":`Tool`,children:e.map(e=>(0,M.jsx)(X,{value:e.value,tooltip:e.label,shortcut:e.key,children:O(e.d)},e.value))}),(0,M.jsx)(Q,{}),(0,M.jsx)(q,{tooltip:`Zoom in`,shortcut:`mod+=`,onClick:()=>i(e=>Math.min(400,e+25)),children:O(k.plus)}),(0,M.jsx)(q,{tooltip:`Zoom out`,shortcut:`mod+-`,onClick:()=>i(e=>Math.max(25,e-25)),children:O(k.minus)})]}),(0,M.jsxs)(`div`,{className:`relative flex min-h-64 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sheen-lg border border-dashed border-sheen-fg-subtle/40 p-4 text-center`,children:[(0,M.jsx)(`p`,{className:`text-sm font-medium text-sheen-fg`,children:a?`${a.label} tool`:`No tool`}),(0,M.jsxs)(`p`,{className:`text-xs text-sheen-fg-muted tabular-nums`,children:[`Zoom `,r,`%`]})]})]})}export{Y as _,ge as a,ue as c,se as d,z as f,X as g,Q as h,me as i,le as l,oe as m,_e as n,he as o,q as p,fe as r,de as s,pe as t,ce as u};