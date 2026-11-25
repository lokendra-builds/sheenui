import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{a as r,i,n as a,o,s}from"./PrimitiveShowcases-BzHdElRo.js";import{a as c,i as l,n as u,o as d,r as f,t as p}from"./ShowcaseStage.sidebar.scene-xXEsGzJK.js";import{n as m,r as h}from"./Page-y_OVkLtr.js";import{t as g}from"./ShowcaseStage-qzIATPiV.js";import{t as _}from"./Example-B3x8pgFu.js";import{t as v}from"./preload-helper-BrmCrVM7.js";var y=e(t()),b=n(),x=`import { useState } from "react";
import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

function Dot() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

export function CurvedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-96">
      <Sidebar shape="curved" morph collapsed={collapsed} aria-label="Workspace">
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha" active icon={<Dot />}>
            Alpha
          </SidebarItem>
          <SidebarItem href="#beta" icon={<Dot />} badge="3">
            Beta
          </SidebarItem>
          <SidebarItem href="#gamma" icon={<Dot />}>
            Gamma
          </SidebarItem>
        </SidebarGroup>
        <SidebarItem onClick={() => setCollapsed((c) => !c)} icon={<Dot />}>
          {collapsed ? "Expand" : "Collapse"}
        </SidebarItem>
      </Sidebar>
    </div>
  );
}`;function S(){return(0,b.jsx)(`svg`,{"aria-hidden":!0,width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,children:(0,b.jsx)(`circle`,{cx:`8`,cy:`8`,r:`5.5`})})}function C(){let[e,t]=(0,y.useState)(!1);return(0,b.jsx)(`div`,{className:`h-96`,children:(0,b.jsxs)(r,{shape:`curved`,morph:!0,collapsed:e,"aria-label":`Workspace`,children:[(0,b.jsxs)(o,{label:`Projects`,children:[(0,b.jsx)(s,{href:`#alpha`,active:!0,icon:(0,b.jsx)(S,{}),children:`Alpha`}),(0,b.jsx)(s,{href:`#beta`,icon:(0,b.jsx)(S,{}),badge:`3`,children:`Beta`}),(0,b.jsx)(s,{href:`#gamma`,icon:(0,b.jsx)(S,{}),children:`Gamma`})]}),(0,b.jsx)(s,{onClick:()=>t(e=>!e),icon:(0,b.jsx)(S,{}),children:e?`Expand`:`Collapse`})]})})}function w(){return(0,b.jsxs)(m,{eyebrow:`Navigation`,title:`Sidebar`,description:`The app-shell sidebar: a glass column with a header, groups of links that fold open and shut, a footer, and an icon-rail mode.`,source:`theme/src/components/sidebar/sidebar.tsx`,keyboard:[[`Tab`,`Moves through group headings and items in order.`],[`Enter / Space`,`Opens or closes a focused group heading; follows a link or presses a button item.`]],a11y:[`A <nav> landmark (aria-label defaults to "Sidebar"; change it when a page has more than one).`,`Group headings are buttons with aria-expanded; closed items leave the tab order. The current page uses aria-current="page".`,`In the collapsed rail the labels stay as accessible names and as title tooltips; the icons are decorative.`,`Targets are 44px on touch screens. Under reduced motion the groups jump open and shut.`],children:[(0,b.jsx)(g,{label:`Sidebar demo`,story:()=>v(()=>import(`./ShowcaseStage.sidebar-BnhpG4Ez.js`),[]),initial:{active:`alpha`,collapsed:!1},minHeight:`26rem`,onInterrupt:`keep`,children:(e,t)=>(0,b.jsx)(p,{scene:e,ctx:t})}),(0,b.jsx)(_,{title:`A full app shell`,description:`Sidebar with groups and badges, a header with search and actions, stat cards and an activity list. Use Collapse to turn the sidebar into an icon rail; VerticalNav is the shorter choice for a flat list of sections.`,code:i,stageClassName:`items-start`,children:(0,b.jsx)(a,{})}),(0,b.jsx)(_,{title:`A curved glass sheet`,description:`shape="curved" bows the trailing edge outward (the inline-end edge, so it flips in right-to-left layouts). The curve is the glass element's own corner radii, so the blur, the lit rim and the shadow follow it, and a soft light sits on the apex. With morph and the collapse item the rail bows more gently. Reduced transparency, more contrast and forced colours fall back to a plain rectangle.`,code:x,children:(0,b.jsx)(C,{})}),(0,b.jsx)(h,{title:`Sidebar props`,of:d}),(0,b.jsx)(_,{title:`On phones`,description:`The sidebar is a column, so on a narrow screen put the same Sidebar inside a Drawer that opens from the left (side="start" follows the reading direction) and give the page a Menu button. Keep the in-layout Sidebar for lg and up.`,code:f,children:(0,b.jsx)(u,{})}),(0,b.jsx)(h,{of:c,title:`SidebarGroup props`,as:`h3`}),(0,b.jsx)(h,{of:l,title:`SidebarItem props`,as:`h3`}),(0,b.jsx)(h,{title:`Other parts`,as:`h3`,rows:[[`SidebarHeader / SidebarFooter`,`div props`,``,`Top and bottom areas; the footer is pushed down.`],[`useSidebar()`,`{ collapsed: boolean }`,``,`Read the collapsed state from custom header or footer content.`]]})]})}export{w as SidebarPage};