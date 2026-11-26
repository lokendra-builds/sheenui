import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{r}from"./toast-PePh6sao.js";import{i,n as a,r as o,t as s}from"./ShowcaseStage.dock.scene-UGscyxpj.js";import{i as c,n as l,o as u,r as d}from"./Page-BAL5Idhy.js";import{t as f}from"./Example-BPfHvEYD.js";import{t as p}from"./lazy-block-BfzH_8EP.js";import{t as m}from"./shared-gkmG8m55.js";import{t as h}from"./ShowcaseStage-qzIATPiV.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`children`,`ReactNode`,``,`Holds the dock items and separators.`,!0],[`label`,`string`,`"Dock"`,`Sets the accessible name of the toolbar.`,!1],[`labels`,`Partial<DockLabels>`,`defaultDockLabels`,'Translatable strings: `labels.active` ("open") is added to the accessible name of active button items, e.g. "Finder, open". Links use aria-current instead. Every other string, for translation: `labels={{ active: "…" }}`; omitted keys keep the English of `defaultDockLabels`. Its only key is listed in the key table under the props table.',!1,{type:`DockLabels`,const:`defaultDockLabels`,keys:[[`active`,`open`]]}],[`size`,`"sm" | "md" | "lg"`,`"md"`,"Icon size at rest: `sm` 40px, `md` 48px or `lg` 56px (never below 44px on touch screens).",!1],[`magnification`,`number`,`1.6`,`How much the icon under the pointer grows: 1 (off) to 2. Reduced to fit when there is little room beside the dock.`,!1],[`distance`,`number`,`2.75 × size`,`How far the swell reaches either side of the pointer, in px.`,!1],[`side`,`DockSide`,`"bottom"`,`Which edge the dock sits on. Icons grow away from it, labels show on the far side.`,!1],[`notch`,`boolean`,`false`,"The active item lifts out of a round notch cut into the glass bar (the notch is part of the bar's own surface, not an overlay) and glides to the next active item with the snappy spring. Needs an `active` item; without one the bar is plain. Reduced motion: the notch and the lift jump.",!1],[`className`,`string`,``,`Adds extra classes to the dock bar.`,!1]],v=[[`label`,`string`,``,`Accessible name, and the label shown above the icon.`,!0],[`icon`,`ReactNode`,``,`The icon (an svg or an image). Sized to ~46% of the tile unless you size it.`,!0],[`href`,`string`,``,`Address to open on click: the tile then renders as a link (an anchor) instead of a button.`,!1],[`target`,`string`,``,`Link target, e.g. "_blank".`,!1],[`rel`,`string`,``,`Link relationship, e.g. "noopener".`,!1],[`render`,`ReactElement<unknown, string | JSXElementConstructor<any>>`,``,`Render the link as another element, e.g. your router's <Link to="…" />.`,!1],[`onClick`,`((event: MouseEvent<HTMLElement>) => void)`,``,`Called when the item is pressed or activated with Enter / Space.`,!1],[`active`,`boolean`,`false`,'Open app / current page: a dot under the icon. Links get aria-current="page"; buttons add `labels.active` of the Dock to their accessible name ("Finder, open").',!1],[`activeLabel`,`string`,``,"Overrides the Dock's `labels.active` for this item (i18n).",!1],[`badge`,`ReactNode`,``,`A count or short text on the corner of the icon.`,!1],[`badgeLabel`,`string`,`the badge text`,`What screen readers hear for the badge, e.g. "3 unread".`,!1],[`bounce`,`boolean`,`false`,`Bounce like a launching app when activated (never with reduced motion).`,!1],[`disabled`,`boolean`,`false`,`Disable the item. It stays focusable, as in any toolbar. A disabled link item renders as a disabled button (a link cannot be disabled).`,!1],[`className`,`string`,``,`Classes for the item's outer slot (layout, margins).`,!1],[`tileClassName`,`string`,``,`Adds extra classes to the icon tile (background, colour).`,!1]],y=[[`className`,`string`,``,`Adds extra classes to the separator slot.`,!1]],b=e(t()),x=n(),S=[{label:`Finder`,icon:(0,x.jsx)(D,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]`,active:!0},{label:`Mail`,icon:(0,x.jsx)(O,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]`,badge:3,badgeLabel:`3 unread`},{label:`Calendar`,icon:(0,x.jsx)(k,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]`},{label:`Music`,icon:(0,x.jsx)(A,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]`,active:!0},{label:`Photos`,icon:(0,x.jsx)(j,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]`},{label:`Messages`,icon:(0,x.jsx)(M,{}),tile:`[background:linear-gradient(160deg,var(--sheen-chart-3),var(--sheen-chart-6))]`},{label:`Settings`,icon:(0,x.jsx)(N,{}),tile:`[background:linear-gradient(160deg,var(--sheen-ink-500),var(--sheen-ink-700))]`}],C=`
import type { ReactNode } from "react";
import { Dock, DockItem, DockSeparator, useToast } from "@sheenui/theme";
import {
  Calendar as CalendarIcon,
  MessageCircle as ChatIcon,
  Download as DownloadIcon,
  Smile as FaceIcon,
  Flower as FlowerIcon,
  Mail as MailIcon,
  Music as MusicIcon,
  Settings as GearIcon,
  Trash2 as TrashIcon,
} from "lucide-react";

type App = { label: string; icon: ReactNode; tile: string; active?: boolean; badge?: number; badgeLabel?: string };

const apps: App[] = [
  { label: "Finder", icon: <FaceIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]", active: true },
  { label: "Mail", icon: <MailIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]", badge: 3, badgeLabel: "3 unread" },
  { label: "Calendar", icon: <CalendarIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]" },
  { label: "Music", icon: <MusicIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]", active: true },
  { label: "Photos", icon: <FlowerIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]" },
  { label: "Messages", icon: <ChatIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-3),var(--sheen-chart-6))]" },
  { label: "Settings", icon: <GearIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-ink-500),var(--sheen-ink-700))]" },
];

export function Example() {
  const toast = useToast();

  return (
    <Dock label="Apps" labels={{ active: "open" }}>
      {apps.map((app) => (
        <DockItem
          key={app.label}
          label={app.label}
          icon={app.icon}
          active={app.active}
          badge={app.badge}
          badgeLabel={app.badgeLabel}
          bounce
          onClick={() => toast.info(\`Opening \${app.label}\`)}
          tileClassName={\`\${app.tile} text-sheen-accent-fg\`}
        />
      ))}
      <DockSeparator />
      <DockItem label="Downloads" icon={<DownloadIcon />} onClick={() => toast.info("Opening Downloads")} />
      <DockItem label="Trash" icon={<TrashIcon />} onClick={() => toast.info("Trash is empty")} />
    </Dock>
  );
}`,w=[{label:`Home`,icon:(0,x.jsx)(I,{})},{label:`Search`,icon:(0,x.jsx)(L,{})},{label:`Library`,icon:(0,x.jsx)(R,{})},{label:`Profile`,icon:(0,x.jsx)(z,{})}];function T(){let[e,t]=(0,b.useState)(`Home`);return(0,x.jsx)(a,{label:`Sections`,notch:!0,children:w.map(n=>(0,x.jsx)(o,{label:n.label,icon:n.icon,active:e===n.label,onClick:()=>t(n.label)},n.label))})}function E(){let e=r();return(0,x.jsxs)(l,{eyebrow:`Effect`,title:`Dock`,description:`A macOS-style launcher: icons near the pointer swell and push their neighbors apart, with labels riding on top. Transform-only, one frame callback, no React renders while the pointer moves. On touch screens and with reduced motion it is a plain bar.`,source:`theme/src/components/dock/dock.tsx`,children:[(0,x.jsx)(h,{label:`Dock demo`,story:()=>g(()=>import(`./ShowcaseStage.dock-Bx366qHr.js`),[]),initial:{at:null,opened:!1},minHeight:`17rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!`,children:(e,t)=>(0,x.jsx)(s,{scene:e,ctx:t})}),(0,x.jsx)(f,{title:`App dock`,description:`Move the pointer along it. Click an app to see it bounce. Keyboard: Tab into it, then arrow keys, Home and End; the focused app swells too, and Escape hides its label. Open apps (the dot) say so to screen readers: “Finder, open”. In a narrow window it turns into a plain bar that scrolls inside itself, with the label drawn above the bar.`,frame:`Desktop`,stageClassName:`min-h-80 items-end justify-center pt-28 pb-5 [background:radial-gradient(120%_90%_at_20%_0%,var(--sheen-blob-1),transparent_60%),radial-gradient(90%_80%_at_90%_100%,var(--sheen-blob-2),transparent_60%)]`,code:C,children:(0,x.jsxs)(a,{label:`Apps`,labels:{active:`open`},children:[S.map(t=>(0,x.jsx)(o,{label:t.label,icon:t.icon,active:t.active,badge:t.badge,badgeLabel:t.badgeLabel,bounce:!0,onClick:()=>e.info(`Opening ${t.label}`),tileClassName:`${t.tile} text-sheen-accent-fg`},t.label)),(0,x.jsx)(i,{}),(0,x.jsx)(o,{label:`Downloads`,icon:(0,x.jsx)(P,{}),onClick:()=>e.info(`Opening Downloads`)}),(0,x.jsx)(o,{label:`Trash`,icon:(0,x.jsx)(F,{}),onClick:()=>e.info(`Trash is empty`)})]})}),(0,x.jsx)(f,{title:`Navigation links, at the top`,description:`Items with href are links (aria-current marks the active one). side="top" grows the icons downward with labels underneath. Smaller icons, a gentler swell.`,stageClassName:`items-start pt-8 pb-28`,code:`
import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  return (
    <Dock label="Sections" side="top" size="sm" magnification={1.45}>
      <DockItem label="Home" icon={<HomeIcon />} href="#home" active />
      <DockItem label="Search" icon={<SearchIcon />} href="#search" />
      <DockItem label="Library" icon={<FolderIcon />} href="#library" />
      <DockItem label="Profile" icon={<UserIcon />} href="#profile" />
    </Dock>
  );
}`,children:(0,x.jsxs)(a,{label:`Sections`,side:`top`,size:`sm`,magnification:1.45,children:[(0,x.jsx)(o,{label:`Home`,icon:(0,x.jsx)(I,{}),href:`#home`,active:!0}),(0,x.jsx)(o,{label:`Search`,icon:(0,x.jsx)(L,{}),href:`#search`}),(0,x.jsx)(o,{label:`Library`,icon:(0,x.jsx)(R,{}),href:`#library`}),(0,x.jsx)(o,{label:`Profile`,icon:(0,x.jsx)(z,{}),href:`#profile`})]})}),(0,x.jsx)(f,{title:`Notch`,description:`With notch, the active item lifts out of a round notch cut into the glass bar and glides to the next active item. Click an icon to move it. Needs an active item.`,stageClassName:`items-start pt-12 pb-16`,code:`
import { useState } from "react";
import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [active, setActive] = useState("Home");
  const items = [
    { label: "Home", icon: <HomeIcon /> },
    { label: "Search", icon: <SearchIcon /> },
    { label: "Library", icon: <FolderIcon /> },
    { label: "Profile", icon: <UserIcon /> },
  ];

  return (
    <Dock label="Sections" notch>
      {items.map((item) => (
        <DockItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          active={active === item.label}
          onClick={() => setActive(item.label)}
        />
      ))}
    </Dock>
  );
}`,children:(0,x.jsx)(T,{})}),(0,x.jsx)(d,{title:`Dock props`,of:_}),(0,x.jsx)(d,{title:`DockItem props`,of:v}),(0,x.jsx)(d,{title:`DockSeparator props`,of:y}),(0,x.jsx)(u,{rows:[[`Tab / Shift + Tab`,`Enter or leave the dock once (one tab stop).`],[`Arrow Left / Arrow Right`,`Move between items; the focused item is magnified with its label above.`],[`Home / End`,`Jump to the first or last item.`],[`Enter / Space`,`Press the focused item.`],[`Escape`,`Hide the labels (WCAG 1.4.13); moving the pointer brings them back.`]]}),(0,x.jsx)(c,{items:[`A Base UI toolbar: roving focus, with aria-label on the dock and a name on each item (the label is also its accessible name).`,`Magnification is decorative.`,`Under reduced motion items do not scale; the label still shows on focus.`]})]})}p(()=>g(()=>import(`./ShowcaseStage.morphing-dialog.scene-C5LHzBGZ.js`).then(e=>e.MorphingDialogScene),[]),{eager:!0,minHeight:`9rem`}),p(()=>g(()=>import(`./MorphingGalleryDemo-Cp2j-l2T.js`).then(e=>e.MorphingGalleryDemo),[]),{eager:!0,minHeight:`22rem`}),p(()=>g(()=>import(`./MorphingCompactDemo-DdZcU_ns.js`).then(e=>e.MorphingCompactDemo),[]),{minHeight:`4.25rem`});function D(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`rect`,{x:`3`,y:`3`,width:`18`,height:`18`,rx:`4`}),(0,x.jsx)(`path`,{d:`M12 3c-1.5 3-2 6-1 9h2c0 3 0 6-1 9`}),(0,x.jsx)(`path`,{d:`M7 8v1.5M17 8v1.5M8 15.5c2.5 1.5 5.5 1.5 8 0`})]})}function O(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`rect`,{x:`3`,y:`5`,width:`18`,height:`14`,rx:`2.5`}),(0,x.jsx)(`path`,{d:`m4 7 8 6 8-6`})]})}function k(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`rect`,{x:`3`,y:`5`,width:`18`,height:`16`,rx:`2.5`}),(0,x.jsx)(`path`,{d:`M3 10h18M8 3v4M16 3v4`})]})}function A(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`path`,{d:`M9 18V5l11-2v13`}),(0,x.jsx)(`circle`,{cx:`6`,cy:`18`,r:`3`}),(0,x.jsx)(`circle`,{cx:`17`,cy:`16`,r:`3`})]})}function j(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`circle`,{cx:`12`,cy:`12`,r:`2.5`}),(0,x.jsx)(`path`,{d:`M12 9.5V4M12 20v-5.5M9.5 12H4M20 12h-5.5M10.2 10.2 6.3 6.3M17.7 17.7l-3.9-3.9M13.8 10.2l3.9-3.9M6.3 17.7l3.9-3.9`})]})}function M(){return(0,x.jsx)(m,{children:(0,x.jsx)(`path`,{d:`M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z`})})}function N(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`}),(0,x.jsx)(`path`,{d:`M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z`})]})}function P(){return(0,x.jsx)(m,{children:(0,x.jsx)(`path`,{d:`M12 3v12M7 10l5 5 5-5M5 21h14`})})}function F(){return(0,x.jsx)(m,{children:(0,x.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3`})})}function I(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`path`,{d:`m3 11 9-7 9 7`}),(0,x.jsx)(`path`,{d:`M5 10v10h14V10`})]})}function L(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,x.jsx)(`path`,{d:`m20 20-3.5-3.5`})]})}function R(){return(0,x.jsx)(m,{children:(0,x.jsx)(`path`,{d:`M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z`})})}function z(){return(0,x.jsxs)(m,{children:[(0,x.jsx)(`circle`,{cx:`12`,cy:`8`,r:`4`}),(0,x.jsx)(`path`,{d:`M4 21a8 8 0 0 1 16 0`})]})}export{E as default};