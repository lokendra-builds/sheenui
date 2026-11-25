import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./avatar-CpgGSsX5.js";import{t as i}from"./glass-card-OGQy5mxG.js";import{t as a}from"./logo-CyQJOwhp.js";import{t as o}from"./switch-BETATXZg.js";import{t as s}from"./vertical-nav-DQZnIKV3.js";import{i as c,n as l,o as u,r as d}from"./Page-DQ8sr8qt.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as m}from"./Example-DMEbQwm9.js";import{t as h}from"./preload-helper-BrmCrVM7.js";var g=[[`sections`,`VerticalNavSection[]`,``,`Groups of items, each with an optional heading.`,!0],[`value`,`string`,``,"Sets the `value` of the active item when controlled.",!0],[`onValueChange`,`((value: string) => void)`,``,"Called with an item's `value` when it is chosen (a plain left click on a link also calls it).",!1],[`renderLink`,`((props: NavLinkProps, item: VerticalNavItem) => ReactElement)`,`a plain <a>`,"Render items that have an `href` through your router's link component. Same contract as Navbar's `renderLink` (see `NavLinkProps`).",!1],[`header`,`ReactNode`,``,`Logo / product name at the top. Left-aligned; a 28px mark sits centred on the rail.`,!1],[`footer`,`ReactNode`,``,`Pinned to the bottom, e.g. a user card or settings. Clipped (not reflowed) on the rail.`,!1],[`collapsed`,`boolean`,`false`,`Icon-only rail; labels appear as tooltips.`,!1],[`labels`,`Partial<VerticalNavLabels>`,`defaultVerticalNavLabels`,'Every string, for translation: `{ name: "Sidebar" }` (the default landmark name). Every other string, for translation: `labels={{ name: "…" }}`; omitted keys keep the English of `defaultVerticalNavLabels`. Its only key is listed in the key table under the props table.',!1,{type:`VerticalNavLabels`,const:`defaultVerticalNavLabels`,keys:[[`name`,`Sidebar`]]}],[`aria-label`,`string`,`labels.name ("Sidebar")`,`Landmark name. Give each navigation on a page its own.`,!1],[`landmark`,`boolean`,`true`,'Whether the `<nav>` is a navigation landmark (`boolean`). Set `false` (a named `role="group"`) for a nav inside a block that can appear twice on one page, so landmark names stay unique.',!1],[`className`,`string`,``,"Extra classes for the `<nav>` (set its height; it fills its parent by default).",!1]],_=e(t()),v=n(),y=e=>(0,v.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-[1.1rem]`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`path`,{d:e})}),b={home:`3 reviews waiting.`,inbox:`All caught up.`,projects:`4 active projects.`};function x({scene:e}){let[t,n]=p(e.page),[r]=p(e.unread),i=[{items:[{value:`home`,label:`Home`,icon:y(`M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z`)},{value:`inbox`,label:`Inbox`,icon:y(`M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z`),badge:r||void 0},{value:`projects`,label:`Projects`,icon:y(`M3 7h7l2 2h9v10H3z`)}]}];return(0,v.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,v.jsx)(s,{"aria-label":`Workspace`,sections:i,value:t,onValueChange:n,className:`w-full`}),(0,v.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:t===`inbox`&&r===0?`Inbox zero.`:b[t]})]})}var S=e=>(0,v.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-[1.1rem]`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`path`,{d:e})}),C=[{title:`Workspace`,items:[{value:`home`,label:`Home`,icon:S(`M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z`)},{value:`inbox`,label:`Inbox`,icon:S(`M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z`),badge:12},{value:`projects`,label:`Projects`,icon:S(`M3 7h7l2 2h9v10H3z`)},{value:`analytics`,label:`Analytics`,icon:S(`M4 20V10M10 20V4M16 20v-7M22 20H2`)}]},{title:`Account`,items:[{value:`team`,label:`Team`,icon:S(`M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-3-3M17 5.5a3 3 0 0 1 0 5`)},{value:`billing`,label:`Billing`,icon:S(`M3 6h18v12H3zM3 10h18`)},{value:`settings`,label:`Settings`,icon:S(`M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-2-4-2 .5-1.5-1.5.5-2-4-2-1 2h-2l-1-2-4 2 .5 2L5 6.5 3 7l-2 4 2 1v2l-2 1 2 4 2-.5 1.5 1.5-.5 2 4 2 1-2h2l1 2 4-2-.5-2 1.5-1.5 2 .5 2-4-2-1z`)}]}],w=Object.fromEntries(C.flatMap(e=>e.items.map(e=>[e.value,e.label])));function T({title:e}){return(0,v.jsx)(i,{level:2,sheen:!1,className:`min-w-0 flex-1 self-start px-5 py-4`,children:(0,v.jsx)(`h3`,{className:`text-lg font-semibold tracking-tight`,children:e})})}function E(){let[e,t]=(0,_.useState)(`inbox`),[n,i]=(0,_.useState)(!1),[p,y]=(0,_.useState)(`profile`);return(0,v.jsxs)(l,{eyebrow:`Navigation`,title:`Vertical nav`,description:`A glass sidebar with grouped items, icons and counts. The active highlight slides between items, and collapsed mode turns it into an icon rail with tooltips.`,source:`theme/src/components/vertical-nav/vertical-nav.tsx`,children:[(0,v.jsx)(f,{label:`Vertical nav demo`,story:()=>h(()=>import(`./ShowcaseStage.vertical-CKLS6Tif.js`),[]),initial:{page:`home`,unread:12},minHeight:`22rem`,onInterrupt:`keep`,children:(e,t)=>(0,v.jsx)(x,{scene:e,ctx:t})}),(0,v.jsxs)(m,{title:`Sidebar and icon rail`,description:`Click items to watch the highlight slide; toggle the rail. On a phone, collapse it to see the page beside it.`,frame:`example.com/${e}`,stageClassName:`h-[34rem] gap-3 sm:gap-4`,controls:(0,v.jsx)(o,{checked:n,onCheckedChange:i,label:`Icon rail`,description:`Collapse to icons; labels become tooltips.`}),code:`
import { useState } from "react";
import { Avatar, GlassCard, SheenLogo, VerticalNav, type VerticalNavSection } from "@sheenui/theme";

// Inline 24px line icons: use any icon set (for example lucide-react) instead.
const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const sections: VerticalNavSection[] = [
  {
    title: "Workspace",
    items: [
      { value: "home", label: "Home", icon: icon("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
      { value: "inbox", label: "Inbox", icon: icon("M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z"), badge: 12 },
      { value: "projects", label: "Projects", icon: icon("M3 7h7l2 2h9v10H3z") },
      { value: "analytics", label: "Analytics", icon: icon("M4 20V10M10 20V4M16 20v-7M22 20H2") },
    ],
  },
  {
    title: "Account",
    items: [
      { value: "team", label: "Team", icon: icon("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-3-3M17 5.5a3 3 0 0 1 0 5") },
      { value: "billing", label: "Billing", icon: icon("M3 6h18v12H3zM3 10h18") },
      { value: "settings", label: "Settings", icon: icon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-2-4-2 .5-1.5-1.5.5-2-4-2-1 2h-2l-1-2-4 2 .5 2L5 6.5 3 7l-2 4 2 1v2l-2 1 2 4 2-.5 1.5 1.5-.5 2 4 2 1-2h2l1 2 4-2-.5-2 1.5-1.5 2 .5 2-4-2-1z") },
    ],
  },
];

const labels = Object.fromEntries(sections.flatMap((s) => s.items.map((item) => [item.value, item.label])));

export function Example() {
  const [value, setValue] = useState("inbox");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex gap-4">
      <VerticalNav
        aria-label="Workspace"
        collapsed={collapsed}
        header={<SheenLogo px={28} variant={collapsed ? "mark" : "full"} glow={false} />}
        sections={sections}
        value={value}
        onValueChange={setValue}
        footer={
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name="Ada Lovelace" size="sm" status="online" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">Ada</span>
                <span className="block truncate text-xs text-sheen-fg-muted">Pro plan</span>
              </span>
            )}
          </div>
        }
      />
      <GlassCard level={2} sheen={false} className="min-w-0 flex-1 self-start px-5 py-4">
        <h3 className="text-lg font-semibold tracking-tight">{labels[value]}</h3>
        <button onClick={() => setCollapsed((c) => !c)}>Toggle icon rail</button>
      </GlassCard>
    </div>
  );
}`,children:[(0,v.jsx)(s,{"aria-label":`Example sidebar`,collapsed:n,className:`shrink-0`,header:(0,v.jsx)(a,{px:28,variant:n?`mark`:`full`,glow:!1}),sections:C,value:e,onValueChange:t,footer:(0,v.jsxs)(`div`,{className:`flex items-center gap-2.5 px-1`,children:[(0,v.jsx)(r,{name:`Ada Lovelace`,size:`sm`,status:`online`}),!n&&(0,v.jsxs)(`span`,{className:`min-w-0`,children:[(0,v.jsx)(`span`,{className:`block truncate text-sm font-medium`,children:`Ada`}),(0,v.jsx)(`span`,{className:`block truncate text-xs text-sheen-fg-muted`,children:`Pro plan`})]})]})}),(0,v.jsx)(T,{title:w[e]})]}),(0,v.jsx)(m,{title:`Text only, for settings`,description:`Icons, titles and the header are all optional. A badge still counts things to look at.`,stageClassName:`min-h-72`,code:`
import { useState } from "react";
import { VerticalNav } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("profile");

  return (
    <VerticalNav
      aria-label="Settings"
      value={value}
      onValueChange={setValue}
      sections={[
        {
          items: [
            { value: "profile", label: "Profile" },
            { value: "security", label: "Security" },
            { value: "notifications", label: "Notifications", badge: 3 },
            { value: "billing", label: "Billing" },
          ],
        },
      ]}
    />
  );
}`,children:(0,v.jsx)(s,{"aria-label":`Settings`,value:p,onValueChange:y,sections:[{items:[{value:`profile`,label:`Profile`},{value:`security`,label:`Security`},{value:`notifications`,label:`Notifications`,badge:3},{value:`billing`,label:`Billing`}]}]})}),(0,v.jsx)(d,{of:g}),(0,v.jsx)(u,{rows:[[`Tab / Shift + Tab`,`Move between items; a normal list of links and buttons.`],[`Enter / Space`,`Follow a link or select an item.`]]}),(0,v.jsx)(c,{items:[`A <nav> with a list; the current item has aria-current="page". Name the nav with aria-label.`,`In the icon rail every item keeps its text as an accessible name and shows it in a tooltip on hover and focus.`,`Under reduced motion the rail snaps open and shut in one frame.`]})]})}export{E as VerticalNavPage};