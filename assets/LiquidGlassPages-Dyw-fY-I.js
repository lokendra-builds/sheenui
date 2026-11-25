import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./badge-AQ2Afjwl.js";import{t as i}from"./button-8i4LQrEk.js";import{t as a}from"./glass-card-OGQy5mxG.js";import{t as o}from"./input-DALTA051.js";import{t as s}from"./switch-BETATXZg.js";import{n as c,t as l}from"./ShowcaseStage.border-beam.scene-BWAwM6rr.js";import{i as u,n as d,o as f,r as p}from"./Page-y_OVkLtr.js";import{t as m}from"./Example-B3x8pgFu.js";import{t as h}from"./ShowcaseStage-qzIATPiV.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`duration`,`number`,`8`,`Seconds one lap around the border takes.`,!1],[`delay`,`number`,`0`,`Seconds before the first lap (lets several beams run out of step).`,!1],[`length`,`number`,`120`,`Length of the beam in px, measured along the border.`,!1],[`width`,`number`,`1.5`,`Sets the thickness of the ring in px.`,!1],[`colorFrom`,`string`,`"var(--sheen-accent)"`,`Sets the tail colour (any CSS colour).`,!1],[`colorTo`,`string`,`"var(--sheen-accent-2)"`,"Colour of the beam's bright head, any CSS colour; the tail fades in from `colorFrom`.",!1],[`reverse`,`boolean`,`false`,`Runs the beam anticlockwise instead of clockwise.`,!1],[`double`,`boolean`,`false`,`Draws two beams on opposite sides.`,!1],[`glow`,`boolean`,`true`,`Soft halo around the beam (skipped for lite glass and reduced transparency). It moves by transform; nothing is blurred per frame.`,!1],[`track`,`boolean`,`true`,`Faint, static rim under the beam, so the border reads as lit even between laps.`,!1],[`offset`,`number`,`-1`,`Distance from the parent's padding edge in px. -1 sits on a 1px border.`,!1],[`paused`,`boolean`,`false`,`Hold the beam where it is (it carries on from there when unpaused).`,!1],[`className`,`string`,``,`Adds extra classes to the beam element.`,!1],[`style`,`CSSProperties`,``,`Inline style for the beam element (for example custom properties).`,!1]],v=e(t()),y=n();function b(){let[e,t]=(0,v.useState)(!1);return(0,y.jsxs)(d,{eyebrow:`Effect`,title:`Border beam`,description:`A comet of light running around a rounded border. Its keyframes follow the real outline, so it keeps one speed and one length all the way round, even on a wide bar. It rests off-screen and holds still with reduced motion.`,source:`theme/src/components/border-beam/border-beam.tsx`,children:[(0,y.jsx)(h,{label:`Border beam demo`,story:()=>g(()=>import(`./ShowcaseStage.border-beam-BR8um64Q.js`),[]),initial:{beam:`idle`},minHeight:`16rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!`,children:(e,t)=>(0,y.jsx)(l,{scene:e,ctx:t})}),(0,y.jsx)(m,{title:`On a glass card`,description:`Drop it inside any positioned, rounded element: it takes the parent's radius and sits on its border. paused holds the beam exactly where it is.`,stageClassName:`min-h-80`,controls:(0,y.jsx)(s,{label:`Pause the beam`,checked:e,onCheckedChange:t}),code:`
import { useState } from "react";
import { BorderBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause the beam" checked={paused} onCheckedChange={setPaused} />
      <GlassCard className="relative w-full max-w-sm p-6">
        <h3 id="deploying-to-production" className="font-semibold">Deploying to production</h3>
        <p className="text-sm text-sheen-fg-muted">Build 2f9c1a · 14 of 18 steps</p>
        <BorderBeam paused={paused} />
      </GlassCard>
    </>
  );
}`,children:(0,y.jsxs)(a,{className:`relative flex w-full max-w-sm flex-col gap-4 p-6`,children:[(0,y.jsxs)(`div`,{className:`flex items-start justify-between gap-3`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h3`,{id:`deploying-to-production`,className:`font-semibold`,children:`Deploying to production`}),(0,y.jsx)(`p`,{className:`mt-1 text-sm text-sheen-fg-muted`,children:`Build 2f9c1a · 14 of 18 steps`})]}),(0,y.jsx)(r,{tone:`accent`,dot:!0,pulse:!0,children:`Live`})]}),(0,y.jsx)(`div`,{className:`h-1.5 overflow-hidden rounded-full bg-sheen-hover`,children:(0,y.jsx)(`div`,{className:`sheen-fill h-full w-[78%] rounded-full [background-image:var(--sheen-accent-fill)]`})}),(0,y.jsx)(c,{paused:e})]})}),(0,y.jsxs)(m,{title:`Wide bars, two beams, any color`,description:`On a wide search bar the beam keeps its pace along the long sides. double runs two beams on opposite sides; colors take any CSS color (here the warning and danger tokens).`,stageClassName:`min-h-80 flex-col`,code:`
import { BorderBeam, Button, GlassCard, Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <div className="relative w-full max-w-xl rounded-sheen-md">
        <Input aria-label="Ask anything" placeholder="Ask anything…" leading={<SearchIcon />} />
        <BorderBeam length={160} duration={6} />
      </div>

      <Button variant="glass" size="lg" className="rounded-sheen-full">
        Upgrade
        <BorderBeam double duration={5} />
      </Button>

      <GlassCard className="relative p-5">
        2 alerts need attention
        <BorderBeam reverse duration={7} colorFrom="var(--sheen-warning)" colorTo="var(--sheen-danger)" />
      </GlassCard>
    </>
  );
}`,children:[(0,y.jsxs)(`div`,{className:`relative w-full max-w-xl rounded-sheen-md`,children:[(0,y.jsx)(o,{"aria-label":`Ask anything`,placeholder:`Ask anything…`,leading:(0,y.jsx)(S,{})}),(0,y.jsx)(c,{length:160,duration:6})]}),(0,y.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center gap-4`,children:[(0,y.jsxs)(i,{variant:`glass`,size:`lg`,className:`rounded-sheen-full`,children:[`Upgrade`,(0,y.jsx)(c,{double:!0,duration:5})]}),(0,y.jsxs)(a,{className:`relative flex items-center gap-3 p-5 text-sm`,children:[(0,y.jsx)(`span`,{className:`size-2 rounded-full bg-sheen-warning`,"aria-hidden":!0}),(0,y.jsxs)(`span`,{children:[(0,y.jsx)(`span`,{className:`font-semibold`,children:`2 alerts`}),` `,(0,y.jsx)(`span`,{className:`text-sheen-fg-muted`,children:`need attention`})]}),(0,y.jsx)(c,{reverse:!0,duration:7,colorFrom:`var(--sheen-warning)`,colorTo:`var(--sheen-danger)`})]})]})]}),(0,y.jsx)(p,{of:_}),(0,y.jsx)(f,{rows:[[`Tab`,`Not focusable: the beam is decoration.`]]}),(0,y.jsx)(u,{items:[`Purely decorative: aria-hidden, no focus, no pointer events, and hidden in forced colors.`,`It sits on a card you provide, so contrast is that of the card. Under reduced motion it is a still beam lit on the top-left corner.`]})]})}function x({children:e}){return(0,y.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,className:`size-5`,children:e})}function S(){return(0,y.jsxs)(x,{children:[(0,y.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,y.jsx)(`path`,{d:`m20 20-3.5-3.5`})]})}export{b as default};