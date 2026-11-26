import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./animated-beam-Dw7BoZ8-.js";import{t as i}from"./glass-card-OGQy5mxG.js";import{t as a}from"./switch-BETATXZg.js";import{i as o,n as s,o as c,r as l}from"./Page-ClekXXh-.js";import{t as u}from"./Example-jva669kg.js";import{t as d}from"./ShowcaseStage-qzIATPiV.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`containerRef`,`RefObject<HTMLElement | null>`,``,`The positioned element that holds both ends (the beam fills it). Pass the same ref you put on that element.`,!0],[`fromRef`,`RefObject<HTMLElement | null>`,``,"Element the beam leaves from. Must be inside `containerRef`'s element.",!0],[`toRef`,`RefObject<HTMLElement | null>`,``,"Element the beam arrives at. Must be inside `containerRef`'s element.",!0],[`curvature`,`number`,`0`,`Bend of the path in px, measured sideways from the straight line between the two elements. Positive bends to the left of the direction of travel; 0 draws a straight line.`,!1],[`reverse`,`boolean`,`false`,"Run from `toRef` to `fromRef` instead.",!1],[`duration`,`number`,`2.4`,`Seconds one pass of the beam takes from one end to the other.`,!1],[`interval`,`number`,`1.2`,`Seconds the path rests, empty, between two passes.`,!1],[`delay`,`number`,`0`,`Seconds before the first pass (lets several beams in one diagram run out of step).`,!1],[`length`,`number`,`96`,`Length of the travelling light in px, measured along the path.`,!1],[`thickness`,`number`,`2.5`,`Thickness of the light and of the track in px.`,!1],[`gap`,`number`,`6`,`Gap in px kept between the path and the edge of each element.`,!1],[`colorFrom`,`string`,`"var(--sheen-accent)"`,`Colour at the tail of the light, any CSS colour.`,!1],[`colorTo`,`string`,`"var(--sheen-accent-2)"`,`Colour at the bright head of the light, any CSS colour.`,!1],[`track`,`boolean`,`true`,`Draw the faint static track under the light, so the connection reads even between passes.`,!1],[`fromOffset`,`BeamOffset`,``,"Nudges where the beam leaves `fromRef`, in px from its centre.",!1],[`toOffset`,`BeamOffset`,``,"Nudges where the beam arrives at `toRef`, in px from its centre.",!1],[`paused`,`boolean`,`false`,`Hold the light where it is (it carries on from there when unpaused).`,!1],[`className`,`string`,``,`Adds extra classes to the overlay.`,!1],[`style`,`CSSProperties`,``,`Applies an inline style to the overlay.`,!1]],h=e(t()),g=n(),_=f(()=>p(()=>import(`./ShowcaseStage.animated-beam.scene-BLYka6X7.js`).then(e=>e.AnimatedBeamScene),[]),{minHeight:`19rem`,eager:!0});f(()=>p(()=>import(`./ShowcaseStage.particles.scene-D1Ta-V_9.js`).then(e=>e.ParticlesScene),[]),{minHeight:`19rem`,eager:!0});function v({ref:e,label:t}){return(0,g.jsx)(i,{ref:e,className:`grid size-16 place-items-center text-sm font-semibold`,children:t})}function y(){let[e,t]=(0,h.useState)(!1),n=(0,h.useRef)(null),f=(0,h.useRef)(null),y=(0,h.useRef)(null),b=(0,h.useRef)(null),x=(0,h.useRef)(null),S=(0,h.useRef)(null),C=(0,h.useRef)(null),w=(0,h.useRef)(null);return(0,g.jsxs)(s,{eyebrow:`Effect`,title:`Animated beam`,description:`A light that travels along a path between two elements, measured from refs, for integration diagrams and data-flow maps. It leaves from the edge of each element, bends with curvature, moves by transform only, rests off-screen and in hidden tabs, and holds still when reduced motion is on.`,source:`theme/src/components/animated-beam/animated-beam.tsx`,children:[(0,g.jsx)(d,{label:`Animated beam demo`,story:()=>p(()=>import(`./ShowcaseStage.animated-beam-BSvuON62.js`),[]),initial:{run:`idle`},minHeight:`19rem`,children:(e,t)=>(0,g.jsx)(_,{scene:e,ctx:t})}),(0,g.jsx)(u,{title:`Integration diagram`,description:`Three sources feed one hub. Each beam is staggered with delay and bent with curvature, so the network reads as alive without any one beam competing. The beam is decorative (aria-hidden), so say what is connected in the labels.`,controls:(0,g.jsx)(a,{label:`Pause beams`,checked:e,onCheckedChange:t}),stageClassName:`min-h-80 px-4`,code:`
import { useRef, useState } from "react";
import { AnimatedBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);

  return (
    <>
      <Switch label="Pause beams" checked={paused} onCheckedChange={setPaused} />
      <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
        <div className="flex flex-col gap-8">
          <GlassCard ref={a} className="grid size-16 place-items-center text-sm font-semibold">Billing</GlassCard>
          <GlassCard ref={b} className="grid size-16 place-items-center text-sm font-semibold">Chat</GlassCard>
          <GlassCard ref={c} className="grid size-16 place-items-center text-sm font-semibold">Docs</GlassCard>
        </div>
        <GlassCard ref={hub} tint className="grid size-24 place-items-center font-semibold">Your app</GlassCard>
        <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.8} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.6} paused={paused} />
      </div>
    </>
  );
}`,children:(0,g.jsxs)(`div`,{ref:n,className:`relative flex w-full max-w-md items-center justify-between py-6`,children:[(0,g.jsxs)(`div`,{className:`flex flex-col gap-8`,children:[(0,g.jsx)(v,{ref:f,label:`Billing`}),(0,g.jsx)(v,{ref:y,label:`Chat`}),(0,g.jsx)(v,{ref:b,label:`Docs`})]}),(0,g.jsx)(i,{ref:x,tint:!0,className:`grid size-24 place-items-center font-semibold`,children:`Your app`}),(0,g.jsx)(r,{containerRef:n,fromRef:f,toRef:x,curvature:-40,paused:e}),(0,g.jsx)(r,{containerRef:n,fromRef:y,toRef:x,delay:.8,paused:e}),(0,g.jsx)(r,{containerRef:n,fromRef:b,toRef:x,curvature:40,delay:1.6,paused:e})]})}),(0,g.jsx)(u,{title:`One connection, your colours`,description:`colorFrom and colorTo take any CSS colour (the defaults are the accent tokens), length and thickness shape the comet, and reverse sends it the other way, for a reply travelling back.`,stageClassName:`min-h-48 px-4`,code:`
import { useRef } from "react";
import { AnimatedBeam, GlassCard } from "@sheenui/theme";

export function Example() {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);

  return (
    <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
      <GlassCard ref={from} className="grid size-16 place-items-center text-sm font-semibold">API</GlassCard>
      <GlassCard ref={to} className="grid size-16 place-items-center text-sm font-semibold">Client</GlassCard>
      <AnimatedBeam
        containerRef={container}
        fromRef={from}
        toRef={to}
        reverse
        length={96}
        thickness={3}
        colorFrom="var(--sheen-accent-2)"
        colorTo="var(--sheen-accent)"
      />
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{ref:S,className:`relative flex w-full max-w-md items-center justify-between py-6`,children:[(0,g.jsx)(v,{ref:C,label:`API`}),(0,g.jsx)(v,{ref:w,label:`Client`}),(0,g.jsx)(r,{containerRef:S,fromRef:C,toRef:w,reverse:!0,length:96,thickness:3,colorFrom:`var(--sheen-accent-2)`,colorTo:`var(--sheen-accent)`})]})}),(0,g.jsx)(l,{of:m}),(0,g.jsx)(c,{rows:[[`Tab`,`Not focusable: the beam never takes focus or pointer events, so the elements it connects stay usable.`]]}),(0,g.jsx)(o,{items:[`Decorative: the overlay is aria-hidden. The connection must also be in text (a label, a heading or a sentence), because the picture is invisible to assistive technology.`,`paused holds the light where it is, so a page can offer a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.`,`Under reduced motion there is no light, only the faint still track between the elements.`,`The light is one element moved by transform and faded by opacity along positions sampled from the real path; nothing blurs, masks or filters the glass nodes.`]})]})}export{y as default};