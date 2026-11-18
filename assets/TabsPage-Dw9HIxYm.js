import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./glass-card-h1PKw39E.js";import{i,n as a,r as o,t as s}from"./tabs-CI6iTZUH.js";import{i as c,n as l,o as u,r as d}from"./Page-BRuP8nt1.js";import{t as f}from"./ShowcaseStage-6bIrHuoy.js";import{t as p}from"./ShowcaseStage.tabs.scene-DWVuVzQu.js";import{t as m}from"./Example-DaSezASZ.js";import{t as h}from"./shared-gkmG8m55.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=e(t()),v=n(),y=[[`overview`,`Overview`,`Workspace stats and recent activity.`],[`projects`,`Projects`,`Milestones, owners and deadlines.`],[`settings`,`Settings`,`Profile, billing and preferences.`]],b=[`Overview`,`Projects`,`Members`,`Billing`,`Integrations`,`Security`,`Settings`],x=()=>(0,v.jsxs)(h,{children:[(0,v.jsx)(`path`,{d:`m3 11 9-7 9 7`}),(0,v.jsx)(`path`,{d:`M5 10v10h14V10`})]}),S=()=>(0,v.jsx)(h,{children:(0,v.jsx)(`path`,{d:`M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z`})}),C=()=>(0,v.jsxs)(h,{children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`}),(0,v.jsx)(`path`,{d:`M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2`})]});function w(){let[e,t]=(0,_.useState)(`overview`);return(0,v.jsxs)(l,{eyebrow:`Component`,title:`Tabs`,description:`A glass track with a pill that slides to the active tab. The slide is pure CSS, driven by Base UI's indicator variables. Arrow keys move between tabs, and a track that runs out of room scrolls instead of clipping.`,source:`theme/src/components/tabs/tabs.tsx`,children:[(0,v.jsx)(f,{label:`Tabs demo`,story:()=>g(()=>import(`./ShowcaseStage.tabs-DP_dN-2w.js`),[]),initial:{tab:`overview`,count:2},minHeight:`23rem`,onInterrupt:`keep`,children:(e,t)=>(0,v.jsx)(p,{scene:e,ctx:t})}),(0,v.jsx)(m,{title:`Basic`,stageClassName:`min-h-64 items-start`,autoplay:()=>{let e=[`projects`,`settings`,`overview`].map((e,n)=>window.setTimeout(()=>t(e),700+n*850));return()=>{e.forEach(e=>window.clearTimeout(e)),t(`overview`)}},code:`
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        {panels.map(([value, label]) => (
          <TabsTab key={value} value={value}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`,children:(0,v.jsxs)(s,{value:e,onValueChange:e=>t(String(e)),className:`w-full max-w-md`,children:[(0,v.jsx)(a,{children:y.map(([e,t])=>(0,v.jsx)(i,{value:e,children:t},e))}),y.map(([e,t,n])=>(0,v.jsx)(o,{value:e,children:(0,v.jsxs)(r,{level:2,className:`p-5`,children:[(0,v.jsx)(`h3`,{className:`font-semibold`,children:t}),(0,v.jsx)(`p`,{className:`mt-1 text-sm text-sheen-fg-muted`,children:n})]})},e))]})}),(0,v.jsx)(m,{title:`More tabs than room`,description:`When the tabs don't fit, the track scrolls sideways instead of clipping: swipe or shift-scroll it, and tabs snap into place. The edges fade only where more tabs are hiding, and choosing a tab (or arrowing to it) scrolls it fully into view. The pill stays on its tab while the track scrolls.`,stageClassName:`min-h-56 items-start`,code:`
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const manyTabs = ["Overview", "Projects", "Members", "Billing", "Integrations", "Security", "Settings"];

export function Example() {
  // Nothing to configure: TabsList scrolls on its own when it overflows.

  return (
    <Tabs defaultValue="billing" className="w-full max-w-xs">
      <TabsList aria-label="Workspace">
        {manyTabs.map((label) => (
          <TabsTab key={label} value={label.toLowerCase()}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {manyTabs.map((label) => (
        <TabsPanel key={label} value={label.toLowerCase()}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">The {label.toLowerCase()} panel.</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`,children:(0,v.jsxs)(s,{defaultValue:`billing`,className:`w-full max-w-xs`,children:[(0,v.jsx)(a,{"aria-label":`Workspace`,children:b.map(e=>(0,v.jsx)(i,{value:e.toLowerCase(),children:e},e))}),b.map(e=>(0,v.jsx)(o,{value:e.toLowerCase(),children:(0,v.jsxs)(r,{level:2,className:`p-5`,children:[(0,v.jsx)(`h3`,{className:`font-semibold`,children:e}),(0,v.jsxs)(`p`,{className:`mt-1 text-sm text-sheen-fg-muted`,children:[`The `,e.toLowerCase(),` panel.`]})]})},e))]})}),(0,v.jsx)(m,{title:`Morphing tabs`,description:`With morph on TabsList, tabs that carry an icon collapse to just the icon, and the active tab grows to reveal its label as the pill glides over. Tabs without an icon keep their label.`,stageClassName:`min-h-48 items-start`,code:`
import { Folder as FolderIcon, House as HomeIcon, Settings as GearIcon } from "lucide-react";
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList morph aria-label="Workspace">
        <TabsTab value="overview" icon={<HomeIcon />}>
          Overview
        </TabsTab>
        <TabsTab value="projects" icon={<FolderIcon />}>
          Projects
        </TabsTab>
        <TabsTab value="settings" icon={<GearIcon />}>
          Settings
        </TabsTab>
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}`,children:(0,v.jsxs)(s,{defaultValue:`overview`,className:`w-full max-w-md`,children:[(0,v.jsxs)(a,{morph:!0,"aria-label":`Workspace`,children:[(0,v.jsx)(i,{value:`overview`,icon:(0,v.jsx)(x,{}),children:`Overview`}),(0,v.jsx)(i,{value:`projects`,icon:(0,v.jsx)(S,{}),children:`Projects`}),(0,v.jsx)(i,{value:`settings`,icon:(0,v.jsx)(C,{}),children:`Settings`})]}),y.map(([e,t,n])=>(0,v.jsx)(o,{value:e,children:(0,v.jsxs)(r,{level:2,className:`p-5`,children:[(0,v.jsx)(`h3`,{className:`font-semibold`,children:t}),(0,v.jsx)(`p`,{className:`mt-1 text-sm text-sheen-fg-muted`,children:n})]})},e))]})}),(0,v.jsx)(d,{rows:[[`Tabs value / defaultValue`,`string`,``,`Sets the active tab (controlled or uncontrolled).`],[`Tabs onValueChange`,`(value) => void`,``,`Called when the active tab changes.`],[`TabsList className`,`string`,``,`Styles the glass track. Other props (aria-label, activateOnFocus, ...) go to the tablist itself.`],[`TabsList activateOnFocus`,`boolean`,`false`,`Activate tabs as arrow keys move focus (otherwise Enter / Space).`],[`TabsList morph`,`boolean`,`false`,`Tabs with an icon collapse to just the icon; the active tab grows to show its label.`],[`TabsTab value`,`string`,``,`Matches a TabsPanel value.`],[`TabsTab icon`,`ReactNode`,``,`A decorative glyph before the label (aria-hidden). With morph on the list, the label shows only while the tab is active.`],[`TabsTab disabled`,`boolean`,`false`,`Disables this tab so it cannot be selected.`],[`TabsPanel value`,`string`,``,`Shown when its tab is active.`],[`Tabs ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example orientation, style, className, render).`],[`TabsList ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example style, render, loopFocus).`],[`TabsTab ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example style, className, render, nativeButton).`],[`TabsPanel ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example style, className, render, keepMounted).`]]}),(0,v.jsx)(u,{rows:[[`Tab`,`Enter the tab list once (on the active tab); the next Tab moves to the panel.`],[`Arrow Left / Arrow Right`,`Move focus between tabs (Arrow Up / Down when vertical).`],[`Home / End`,`Jump to the first or last tab.`],[`Enter / Space`,`Activate the focused tab (set activateOnFocus on TabsList to activate as focus moves).`]]}),(0,v.jsx)(c,{items:[`role="tablist", tab and tabpanel with aria-selected and aria-controls from Base UI; name the list with aria-label.`,`When the tabs do not fit, the list scrolls sideways and a focused tab is scrolled into view.`,`The gliding pill is decorative: the active tab is announced through aria-selected. Under reduced motion the pill jumps instead of sliding.`]})]})}export{w as default};