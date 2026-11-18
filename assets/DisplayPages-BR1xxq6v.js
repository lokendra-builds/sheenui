import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./badge-CGzgiK-J.js";import{t as r}from"./button-BFXhYCnI.js";import{i,n as a,o,r as s}from"./Page-BRuP8nt1.js";import{t as c}from"./ShowcaseStage-6bIrHuoy.js";import{t as l}from"./Example-DaSezASZ.js";import"./demo-clock-CoEY-AlH.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`tone`,`"neutral" | "accent" | "success" | "warning" | "danger" | "solid"`,`"neutral"`,`Colour role: "neutral" (glass), "accent", "success", "warning", "danger" or "solid" (filled accent).`,!1],[`dot`,`boolean`,`false`,`Small dot before the text, e.g. for statuses.`,!1],[`pulse`,`boolean`,`false`,`Pulsing dot for live states. Pings a few times, then rests; still with reduced motion.`,!1]];e();var f=t(),p={pending:{tone:`warning`,label:`Pending`,pulse:!0},processing:{tone:`accent`,label:`Processing`,pulse:!0},paid:{tone:`success`,label:`Paid`,pulse:!1}};function m({scene:e}){let t=p[e.status];return(0,f.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,f.jsx)(`p`,{className:`sheen-stage-title`,children:`Invoice #1042`}),(0,f.jsxs)(`div`,{className:`sheen-stage-slot flex gap-2`,children:[(0,f.jsx)(n,{tone:`neutral`,children:`$1,240.00`}),(0,f.jsx)(n,{tone:t.tone,dot:!0,pulse:t.pulse,children:t.label},e.status)]})]})}function h(){return(0,f.jsxs)(a,{eyebrow:`Component`,title:`Badge`,description:`Small labels for status and counts. Status badges carry words, never color alone.`,source:`theme/src/components/badge/badge.tsx`,children:[(0,f.jsx)(c,{label:`Badge demo`,story:()=>u(()=>import(`./ShowcaseStage.badge-CLZDZDbf.js`),[]),initial:{status:`pending`},children:e=>(0,f.jsx)(m,{scene:e})}),(0,f.jsxs)(l,{title:`Tones`,code:`
import { Badge } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success" dot>Active</Badge>
      <Badge tone="warning" dot>Pending</Badge>
      <Badge tone="danger" dot>Failed</Badge>
      <Badge tone="solid">Pro</Badge>
      <Badge tone="success" pulse>Live</Badge>
    </>
  );
}`,children:[(0,f.jsx)(n,{children:`Draft`}),(0,f.jsx)(n,{tone:`accent`,children:`New`}),(0,f.jsx)(n,{tone:`success`,dot:!0,children:`Active`}),(0,f.jsx)(n,{tone:`warning`,dot:!0,children:`Pending`}),(0,f.jsx)(n,{tone:`danger`,dot:!0,children:`Failed`}),(0,f.jsx)(n,{tone:`solid`,children:`Pro`}),(0,f.jsx)(n,{tone:`success`,pulse:!0,children:`Live`})]}),(0,f.jsxs)(l,{title:`Counts and inline status`,description:`Badges sit beside the thing they describe: a count on a button, a status next to a name.`,code:`
import { Badge, Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button variant="glass">
        Inbox <Badge tone="accent">12</Badge>
      </Button>
      <p className="flex items-center gap-2 text-sm">
        Production deploy <Badge tone="success" dot>Passing</Badge>
      </p>
      <p className="flex items-center gap-2 text-sm">
        Billing <Badge tone="warning" dot>Past due</Badge>
      </p>
      <Badge tone="danger">3 failed</Badge>
    </>
  );
}`,children:[(0,f.jsxs)(r,{variant:`glass`,children:[`Inbox `,(0,f.jsx)(n,{tone:`accent`,children:`12`})]}),(0,f.jsxs)(`p`,{className:`flex items-center gap-2 text-sm`,children:[`Production deploy`,` `,(0,f.jsx)(n,{tone:`success`,dot:!0,children:`Passing`})]}),(0,f.jsxs)(`p`,{className:`flex items-center gap-2 text-sm`,children:[`Billing`,` `,(0,f.jsx)(n,{tone:`warning`,dot:!0,children:`Past due`})]}),(0,f.jsx)(n,{tone:`danger`,children:`3 failed`})]}),(0,f.jsx)(s,{of:d}),(0,f.jsx)(o,{rows:[[`Tab`,`Not focusable: a Badge is not interactive. Put it inside a button or link if it should be.`]]}),(0,f.jsx)(i,{items:[`A badge always carries words, so color is never the only signal; the dot is aria-hidden.`,`The tint sits on a near-opaque surface, so text keeps 4.5:1 contrast over glass or photos.`,`The pulse stops after four pings (WCAG 2.2.2) and is off under reduced motion.`]})]})}export{h as default};