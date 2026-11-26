import{t as e}from"./button-8i4LQrEk.js";import{a as t,i as n,n as r,o as i,r as a,t as o}from"./glass-card-OGQy5mxG.js";import{i as s,n as c,o as l,r as u}from"./Page-BAL5Idhy.js";import{t as d}from"./ShowcaseStage-qzIATPiV.js";import{t as f}from"./vendor-react-D30i__oY.js";import{t as p}from"./Example-BPfHvEYD.js";import{t as m}from"./preload-helper-BrmCrVM7.js";var h=[[`level`,`2 | 1 | 3`,`2`,`1 = subtle (chips), 2 = cards (default), 3 = most opaque (dialogs, bars).`,!1],[`sheen`,`boolean`,`true`,`Soft highlight that follows the pointer (mouse and pen only).`,!1],[`tint`,`boolean`,`false`,`Tints the surface with the accent for featured content.`,!1],[`interactive`,`boolean`,`false`,`Lifts slightly on hover; use for clickable cards. Movement is off with reduced motion.`,!1]],g=[[`headingLevel`,`HeadingLevelOption`,`3`,'Heading level (`"none"` renders a paragraph with the same look).',!1]],_=f(),v={1:`Quiet`,2:`Default`,3:`Raised`};function y({scene:e}){return(0,_.jsxs)(o,{level:e.level,tint:e.tint,className:`w-full max-w-72 text-start`,children:[(0,_.jsxs)(t,{children:[(0,_.jsxs)(i,{headingLevel:`none`,children:[`Glass level `,e.level]}),(0,_.jsxs)(a,{children:[v[e.level],` depth`,e.tint?`, tinted`:``,`.`]})]}),(0,_.jsx)(r,{children:(0,_.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:`A soft highlight follows your pointer across the surface.`})})]})}function b(){return(0,_.jsxs)(c,{eyebrow:`Component`,title:`Glass card`,description:`The basic glass surface. A soft highlight follows your pointer, and every level falls back to a solid surface when transparency is reduced.`,source:`theme/src/components/glass-card/glass-card.tsx`,children:[(0,_.jsx)(d,{label:`Glass card demo`,story:()=>m(()=>import(`./ShowcaseStage.glass-card-3u83eDPq.js`),[]),initial:{level:1,tint:!1},children:e=>(0,_.jsx)(y,{scene:e})}),(0,_.jsx)(p,{title:`Card with header, content and footer`,stageClassName:`min-h-80`,code:`
import {
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="w-full max-w-sm">
      <GlassCardHeader>
        <GlassCardTitle>Team plan</GlassCardTitle>
        <GlassCardDescription>Everything your team needs to ship.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-4xl font-semibold">$29<span className="text-sm">/mo</span></p>
      </GlassCardContent>
      <GlassCardFooter>
        <Button fullWidth>Upgrade</Button>
      </GlassCardFooter>
    </GlassCard>
  );
}`,children:(0,_.jsxs)(o,{className:`w-full max-w-sm`,children:[(0,_.jsxs)(t,{children:[(0,_.jsx)(i,{children:`Team plan`}),(0,_.jsx)(a,{children:`Everything your team needs to ship.`})]}),(0,_.jsx)(r,{children:(0,_.jsxs)(`p`,{className:`text-4xl font-semibold tracking-tight`,children:[`$29`,(0,_.jsx)(`span`,{className:`text-sm font-normal text-sheen-fg-muted`,children:`/mo`})]})}),(0,_.jsx)(n,{children:(0,_.jsx)(e,{fullWidth:!0,children:`Upgrade`})})]})}),(0,_.jsxs)(p,{title:`Levels, tint and interactive`,description:`Interactive cards lift on hover; tinted cards carry a hint of the accent color.`,stageClassName:`min-h-64`,code:`
import { GlassCard } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <GlassCard level={1} className="p-5">Level 1</GlassCard>
      <GlassCard level={2} interactive className="p-5">Level 2 · interactive</GlassCard>
      <GlassCard level={3} tint className="p-5">Level 3 · tint</GlassCard>
    </>
  );
}`,children:[(0,_.jsx)(o,{level:1,className:`w-44 p-5 text-sm font-medium`,children:`Level 1`}),(0,_.jsx)(o,{level:2,interactive:!0,className:`w-44 p-5 text-sm font-medium`,children:`Level 2 · interactive`}),(0,_.jsx)(o,{level:3,tint:!0,className:`w-44 p-5 text-sm font-medium`,children:`Level 3 · tint`})]}),(0,_.jsx)(u,{of:h}),(0,_.jsx)(u,{of:g,title:`GlassCardTitle props`,as:`h3`}),(0,_.jsx)(l,{rows:[[`Tab`,`Not focusable: a plain card is not interactive. Buttons and links inside it keep their own tab stops. For a clickable card give it role="link" or role="button" and a tabIndex.`]]}),(0,_.jsx)(s,{items:[`Plain markup with no role, so reading order is the DOM order.`,`Glass levels keep text at 4.5:1 over any backdrop; reduced transparency makes the card opaque, and forced colors give it a real border.`,`The sheen is a soft highlight that follows a mouse or pen (never on touch). The hover lift is off with reduced motion.`]})]})}export{b as default};