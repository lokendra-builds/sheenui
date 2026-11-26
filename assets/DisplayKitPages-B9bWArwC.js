import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{t as i}from"./empty-state-C0L5o_pW.js";import{i as a,n as o,o as s,r as c}from"./Page-ClekXXh-.js";import{t as l}from"./Example-jva669kg.js";import{t as u}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as d}from"./ShowcaseStage-qzIATPiV.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=[[`icon`,`ReactNode`,``,`An icon (24px, currentColor) shown in the glass orb (full) or tile (compact).`,!1],[`illustration`,`ReactNode`,``,`Your own artwork, shown instead of the orb (an SVG or image, sized by you).`,!1],[`title`,`ReactNode`,``,`The heading: say what is missing ("No messages yet").`,!0],[`description`,`ReactNode`,``,`One sentence on why it is empty and what to do.`,!1],[`action`,`ReactNode`,``,`The main next step, usually a primary Button.`,!1],[`secondaryAction`,`ReactNode`,``,`A lower-emphasis alternative, usually a ghost or glass Button / link.`,!1],[`variant`,`"full" | "compact"`,`"full"`,`full (default): centred, for pages and panels. compact: one row, for tables and small cards.`,!1],[`surface`,`"glass" | "none" | "dashed"`,`"none"`,`none (default), glass (its own card) or dashed (a drop-zone-like outline).`,!1],[`tone`,`"neutral" | "accent" | "success" | "warning" | "danger"`,`"accent"`,`Colour of the icon and its tint (default "accent"). Words carry the meaning; colour only supports it.`,!1],[`headingLevel`,`false | HeadingLevelOption`,`3`,'Heading level of the title (1 to 6, default 3), to fit the page outline. `"none"` renders a paragraph with no heading role. `false` is the deprecated spelling of `"none"` (still accepted, removed in 1.0).',!1],[`animated`,`boolean`,`true`,`Entrance animation (off under reduced motion either way).`,!1],[`announce`,`string | boolean`,``,`Announce the empty state to screen readers when it appears (e.g. a search with no results): true speaks the title and description (when they are text), a string speaks that. Uses one persistent polite region, so it is read reliably.`,!1]],m=e(t()),h=n(),g=(0,h.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,h.jsx)(`path`,{d:`M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`})});function _({scene:e}){let[t,n]=u(e.added);return(0,h.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:t?(0,h.jsx)(`ul`,{className:`sheen-stage-feed m-0 w-full list-none p-0 text-start`,children:(0,h.jsxs)(`li`,{className:`glass-1 rounded-sheen-lg p-4`,children:[(0,h.jsx)(`p`,{className:`sheen-stage-title`,children:`My first project`}),(0,h.jsx)(`p`,{className:`sheen-stage-sub`,children:`Created just now`})]})}):(0,h.jsx)(i,{variant:`compact`,surface:`dashed`,className:`w-full`,icon:g,headingLevel:`none`,title:`No projects yet`,description:`Projects keep your screens and tokens together.`,action:(0,h.jsx)(r,{size:`sm`,"data-stage-pressed":e.pressed?``:void 0,onClick:()=>n(!0),children:`New project`})})})}function v({children:e,...t}){return(0,h.jsx)(`svg`,{"aria-hidden":!0,focusable:`false`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`,strokeLinejoin:`round`,className:`size-6`,...t,children:e})}var y=()=>(0,h.jsxs)(v,{children:[(0,h.jsx)(`path`,{d:`M3.5 7.5A2.5 2.5 0 0 1 6 5h3.6l2 2.2H18a2.5 2.5 0 0 1 2.5 2.5v7.8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5Z`}),(0,h.jsx)(`path`,{d:`M12 11v5M9.5 13.5h5`})]}),b=()=>(0,h.jsxs)(v,{children:[(0,h.jsx)(`circle`,{cx:`11`,cy:`11`,r:`6.5`}),(0,h.jsx)(`path`,{d:`m20 20-4.2-4.2M8.8 9l4.4 4.4M13.2 9l-4.4 4.4`})]}),x=()=>(0,h.jsxs)(v,{children:[(0,h.jsx)(`path`,{d:`M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2A2 2 0 0 1 18 5.8l2.5 7.7V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z`}),(0,h.jsx)(`path`,{d:`M3.5 13.5h4.8l1.4 2.4h4.6l1.4-2.4h4.8`})]}),S=()=>(0,h.jsxs)(v,{children:[(0,h.jsx)(`path`,{d:`M7 18.5h10.2a4 4 0 0 0 1-7.9 6 6 0 0 0-10.9-2.2A4.8 4.8 0 0 0 7 18.5Z`}),(0,h.jsx)(`path`,{d:`m4 4 16 16`})]}),C=()=>(0,h.jsx)(v,{className:`size-4`,children:(0,h.jsx)(`path`,{d:`M12 5v14M5 12h14`})});function w(){let[e,t]=(0,m.useState)(`glassmorphism tokens`);return(0,h.jsxs)(o,{eyebrow:`Data display`,title:`Empty state`,description:`What a page, list or search shows when there is nothing in it yet, with one clear next step. A glass orb springs in over soft rings and a fading dot grid; a compact row variant fits tables and side panels.`,source:`theme/src/components/empty-state/empty-state.tsx`,children:[(0,h.jsx)(d,{label:`Empty state demo`,story:()=>f(()=>import(`./ShowcaseStage.empty-state-ClDrQYce.js`),[]),initial:{pressed:!1,added:!1},minHeight:`17rem`,children:(e,t)=>(0,h.jsx)(_,{scene:e,ctx:t})}),(0,h.jsx)(l,{title:`First run`,description:`Full variant on a dashed outline: icon, title, description, a primary and a secondary action.`,code:`
import { Button, EmptyState } from "@sheenui/theme";
import { Folder as FolderIcon, Plus as PlusIcon } from "lucide-react";

export function Example() {
  return (
    <EmptyState
      surface="dashed"
      icon={<FolderIcon />}
      title="Create your first project"
      description="Projects keep your screens, tokens and assets together. Start from scratch or import a design file."
      action={<Button leading={<PlusIcon />}>New project</Button>}
      secondaryAction={<Button variant="glass">Import a file</Button>}
    />
  );
}`,children:(0,h.jsx)(i,{surface:`dashed`,className:`w-full max-w-2xl`,icon:(0,h.jsx)(y,{}),title:`Create your first project`,description:`Projects keep your screens, tokens and assets together. Start from scratch or import a design file.`,action:(0,h.jsx)(r,{leading:(0,h.jsx)(C,{}),children:`New project`}),secondaryAction:(0,h.jsx)(r,{variant:`glass`,children:`Import a file`})})}),(0,h.jsx)(l,{title:`No results`,description:`Neutral tone on a glass card. announce reads it out when a search comes back empty, through one status region that stays mounted (a region that mounts with its text is often skipped by screen readers).`,code:`
import { useState } from "react";
import { Button, EmptyState } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  const [query, setQuery] = useState("flrbl");

  return (
    <EmptyState
      announce
      surface="glass"
      tone="neutral"
      icon={<SearchIcon />}
      title={\`No results for “\${query}”\`}
      description="Check the spelling or try fewer words."
      action={<Button variant="glass" onClick={() => setQuery("")}>Clear search</Button>}
    />
  );
}`,children:(0,h.jsx)(i,{announce:!0,surface:`glass`,tone:`neutral`,className:`w-full max-w-xl`,icon:(0,h.jsx)(b,{}),title:e?`No results for “${e}”`:`Search cleared`,description:e?`Check the spelling or try fewer words.`:`Type to search the docs again.`,action:(0,h.jsx)(r,{variant:`glass`,onClick:()=>t(e?``:`glassmorphism tokens`),children:e?`Clear search`:`Restore the search`})},e)}),(0,h.jsx)(l,{title:`Compact and error`,description:`Compact: one row for tables, inboxes and sidebars (it wraps on phones). Tones color the icon only; the words carry the meaning.`,stageClassName:`flex-col items-stretch`,code:`
import { Button, EmptyState } from "@sheenui/theme";
import { CloudOff as CloudOffIcon, Inbox as InboxIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <EmptyState
        variant="compact"
        surface="glass"
        icon={<InboxIcon />}
        title="Inbox zero"
        description="New messages from your team show up here."
        action={<Button size="sm" variant="glass">Compose</Button>}
      />
      <EmptyState
        variant="compact"
        surface="glass"
        tone="danger"
        icon={<CloudOffIcon />}
        title="Couldn't load invoices"
        description="The server took too long to answer."
        action={<Button size="sm">Try again</Button>}
      />
    </>
  );
}`,children:(0,h.jsxs)(`div`,{className:`mx-auto flex w-full max-w-2xl flex-col gap-4`,children:[(0,h.jsx)(i,{variant:`compact`,surface:`glass`,icon:(0,h.jsx)(x,{}),title:`Inbox zero`,description:`New messages from your team show up here.`,action:(0,h.jsx)(r,{size:`sm`,variant:`glass`,children:`Compose`})}),(0,h.jsx)(i,{variant:`compact`,surface:`glass`,tone:`danger`,icon:(0,h.jsx)(S,{}),title:`Couldn't load invoices`,description:`The server took too long to answer.`,action:(0,h.jsx)(r,{size:`sm`,children:`Try again`})})]})}),(0,h.jsx)(c,{of:p}),(0,h.jsx)(s,{rows:[[`Tab`,`Not focusable: the block is not focusable. The buttons in action and secondaryAction are normal tab stops.`]]}),(0,h.jsx)(a,{items:[`Plain markup with a heading; the icon is decorative. Pass announce to tell screen readers when the state appears after a search or filter.`,`Always offer a way forward (clear the filter, create the first item); do not leave an empty state without an action when one exists.`]})]})}export{w as default};