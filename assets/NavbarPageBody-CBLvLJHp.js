import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./navbar-lHGAjZKJ.js";import{n as a}from"./cn-CgB_fvgf.js";import{i as o,n as s,o as c,r as l}from"./Page-BAL5Idhy.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{t as d}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as f}from"./Example-BPfHvEYD.js";import{t as p}from"./Segmented-kx7yHseo.js";import{t as m}from"./preload-helper-BrmCrVM7.js";var h=[[`items`,`NavbarItem[]`,``,`Takes the navigation items, in order.`,!0],[`value`,`string`,``,"Sets the `value` of the active item when controlled.",!0],[`onValueChange`,`((value: string) => void)`,``,"Called with an item's `value` when it is chosen (a plain left click on a link also calls it).",!1],[`brand`,`ReactNode`,``,`Shows the logo or product name on the left.`,!1],[`actions`,`ReactNode`,``,`Buttons on the right (theme toggle, sign in, ...).`,!1],[`renderLink`,`((props: NavLinkProps, item: NavbarItem) => ReactElement)`,`a plain <a>`,"Render items that have an `href` through your router's link component. See `NavLinkProps`.",!1],[`shrinkOnScroll`,`number | false`,`24`,"Once the page scrolls past this many px, the bar tightens and turns more opaque (the floating pill also shrinks a touch). `false` turns it off.",!1],[`hideOnScroll`,`number | boolean`,`false`,"Slide the bar out of view while scrolling down and bring it back on any scroll up. `true` starts hiding after 64px; pass a number for a different distance. Make the navbar `sticky` or `fixed` for this to make sense.",!1],[`scrollContainer`,`RefObject<HTMLElement | null>`,``,`Track this element's scroll instead of the window's (e.g. an app shell's scrolling <main>).`,!1],[`variant`,`"floating" | "bar"`,`"floating"`,`"floating" = centred glass pill, highlight morphs between items (Apple style). "bar" = full-width top bar, a sliding underline marks the active item.`,!1],[`collapsible`,`boolean`,`true`,"When the items don't fit next to the brand and actions (phones, narrow containers), fold them into a menu button that opens a glass popover. `false` lets them scroll sideways instead.",!1],[`labels`,`Partial<NavbarLabels>`,`defaultNavbarLabels`,'Every string, for translation: `{ menu: "Menu", name: "Main" }` (accessible name of the menu button shown when the items are folded away, and the default landmark name). Every other string, for translation: `labels={{ menu: "…" }}`; omitted keys keep the English of `defaultNavbarLabels`. All 2 keys of `NavbarLabels` are listed in the key table under the props table.',!1,{type:`NavbarLabels`,const:`defaultNavbarLabels`,keys:[[`menu`,`Menu`],[`name`,`Main`]]}],[`aria-label`,`string`,`labels.name`,`Landmark name. Give each navigation on a page its own, e.g. "Main" and "Account".`,!1],[`className`,`string`,``,"Extra classes for the `<nav>` (position it with `sticky`, `fixed` or margins).",!1]],g=e(t()),_=n(),v=[{value:`home`,label:`Home`},{value:`work`,label:`Work`},{value:`pricing`,label:`Pricing`}],y={home:`Interfaces that feel like glass.`,work:`Six case studies from 2025.`,pricing:`Free for open source. $24 a seat.`};function b({scene:e}){let[t,n]=d(e.page);return(0,_.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,_.jsx)(i,{"aria-label":`Studio navigation`,items:v,value:t,onValueChange:n,shrinkOnScroll:!1,className:`w-full`}),(0,_.jsx)(`p`,{className:`sheen-stage-sub sheen-stage-slot`,children:y[t]})]})}var x=[{value:`home`,label:`Home`},{value:`work`,label:`Work`},{value:`pricing`,label:`Pricing`},{value:`blog`,label:`Blog`}],S=[...x,{value:`docs`,label:`Docs`},{value:`changelog`,label:`Changelog`}],C=[{value:`sm`,label:`Phone`},{value:`md`,label:`Tablet`},{value:`full`,label:`Full`}],w={sm:`max-w-80`,md:`max-w-2xl`,full:`max-w-full`},T=(0,_.jsx)(`span`,{className:`bg-clip-text text-transparent [background-image:var(--sheen-accent-gradient)]`,children:`Sheen`});function E(){let[e,t]=(0,g.useState)(`home`),[n,d]=(0,g.useState)(`home`),[v,y]=(0,g.useState)(`sm`);return(0,_.jsxs)(s,{eyebrow:`Navigation`,title:`Horizontal nav`,description:`Two styles: a floating Apple-style pill whose highlight morphs between items, and a full-width top bar with a sliding underline. Both tighten as the page scrolls, and fold their items into a menu when they run out of room.`,source:`theme/src/components/navbar/navbar.tsx`,children:[(0,_.jsx)(u,{label:`Horizontal nav demo`,story:()=>m(()=>import(`./ShowcaseStage.horizontal-BWNPKzQc.js`),[]),initial:{page:`home`},minHeight:`19rem`,onInterrupt:`keep`,children:(e,t)=>(0,_.jsx)(b,{scene:e,ctx:t})}),(0,_.jsx)(f,{title:`Floating pill`,description:`Click the items to watch the highlight morph.`,stageClassName:`min-h-48`,code:`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={[
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
        { value: "pricing", label: "Pricing" },
        { value: "blog", label: "Blog" },
      ]}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
    />
  );
}`,children:(0,_.jsx)(i,{"aria-label":`Example navigation (floating)`,brand:T,items:x,value:e,onValueChange:t,shrinkOnScroll:!1,actions:(0,_.jsx)(r,{size:`sm`,className:`hidden sm:inline-flex`,children:`Sign in`})})}),(0,_.jsx)(f,{title:`Full-width bar`,description:`variant="bar": for app headers. The underline slides to the active item.`,stageClassName:`min-h-40`,code:`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      variant="bar"
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm" variant="glass">Sign in</Button>}
    />
  );
}`,children:(0,_.jsx)(i,{variant:`bar`,"aria-label":`Example navigation (bar)`,brand:T,items:x,value:e,onValueChange:t,shrinkOnScroll:!1,actions:(0,_.jsx)(r,{size:`sm`,variant:`glass`,className:`hidden sm:inline-flex`,children:`Sign in`})})}),(0,_.jsx)(f,{title:`Folds into a menu`,description:`When the items don't fit next to the brand and actions, they fold into a menu button. It opens a glass popover listing every item, with the current one checked; choosing one closes it and returns focus to the button. Pick a width to watch it fold and unfold.`,stageClassName:`min-h-72 items-start`,controls:(0,_.jsx)(p,{label:`Container width`,options:C,value:v,onValueChange:y}),code:`
import { useState } from "react";
import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
  { value: "docs", label: "Docs" },
  { value: "changelog", label: "Changelog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  // Nothing to set up: the nav measures itself and folds when it must.

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
      labels={{ menu: "Menu" }} // the menu button's name; collapsible={false} scrolls instead
    />
  );
}`,children:(0,_.jsx)(`div`,{className:a(`flex w-full justify-center`,w[v]),children:(0,_.jsx)(i,{"aria-label":`Example navigation (folding)`,brand:T,items:S,value:n,onValueChange:d,shrinkOnScroll:!1,actions:(0,_.jsx)(r,{size:`sm`,children:`Sign in`})})})}),(0,_.jsx)(l,{of:h}),(0,_.jsx)(c,{rows:[[`Tab / Shift + Tab`,`Move through the brand, items and actions.`],[`Enter`,`Follow a link or select an item.`],[`Arrow Down / Arrow Up / Home / End`,`In the folded menu: move between items.`],[`Escape`,`Close the folded menu and return focus to the menu button.`]]}),(0,_.jsx)(o,{items:[`A <nav> landmark: pass aria-label ("Main") and give a second bar a different name. The current item has aria-current="page".`,`A bar hidden by hideOnScroll comes back when focus enters it, so keyboard users never tab into an off-screen bar.`,`The folded menu button reports aria-expanded and is named by labels.menu. Targets are 44 px on touch screens.`]})]})}export{E as NavbarPage};