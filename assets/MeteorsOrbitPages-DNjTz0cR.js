import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./glass-card-OGQy5mxG.js";import{t as i}from"./orbiting-circles-DZRsaidD.js";import{t as a}from"./switch-BETATXZg.js";import{i as o,n as s,o as c,r as l}from"./Page-DQ8sr8qt.js";import{t as u}from"./Example-DMEbQwm9.js";import{t as d}from"./ShowcaseStage-qzIATPiV.js";import{t as f}from"./lazy-block-BfzH_8EP.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`children`,`ReactNode`,``,`The orbiting items (icons, logos, avatars): each child sits on the ring, evenly spaced.`,!0],[`radius`,`number`,`120`,`Radius of the ring in px, from the centre of the parent.`,!1],[`duration`,`number`,`28`,`Seconds one full turn takes. Slow reads as calm: 20 to 40 suits a hero.`,!1],[`reverse`,`boolean`,`false`,`Turn anticlockwise instead of clockwise.`,!1],[`startAngle`,`number`,`0`,`Angle of the first item in degrees, clockwise from the top. The others follow evenly; use it to offset one ring from another.`,!1],[`path`,`boolean`,`true`,`Draw the faint ring the items sit on.`,!1],[`pauseOnHover`,`boolean`,`true`,`Hold the ring still while the pointer or keyboard focus is on one of its items, so an item is never a moving target.`,!1],[`label`,`string`,``,`Accessible name for the group. Set it when the items mean something (integrations, team) and the ring is exposed as a labelled list; without it the whole ring is decorative and hidden from assistive technology.`,!1],[`paused`,`boolean`,`false`,`Hold the ring where it is (it carries on from there when unpaused).`,!1],[`className`,`string`,``,"Adds extra classes to the overlay. It fills a `relative` parent; the ring is centred in it.",!1],[`itemClassName`,`string`,``,`Classes for every item's box (sizing, glass, rounding).`,!1],[`style`,`CSSProperties`,``,`Applies an inline style to the overlay.`,!1]],h=e(t()),g=n();f(()=>p(()=>import(`./ShowcaseStage.meteors.scene-C1ttFGqu.js`).then(e=>e.MeteorsScene),[]),{minHeight:`17rem`,eager:!0});var _=f(()=>p(()=>import(`./ShowcaseStage.orbiting-circles.scene-X4wwSnvX.js`).then(e=>e.OrbitingCirclesScene),[]),{minHeight:`23rem`,eager:!0}),v=[`A`,`B`,`C`,`D`,`E`,`F`];function y({children:e}){return(0,g.jsx)(`span`,{className:`glass-2 grid size-10 place-items-center rounded-full text-sm font-semibold`,children:e})}function b(){let[e,t]=(0,h.useState)(!1);return(0,g.jsxs)(s,{eyebrow:`Effect`,title:`Orbiting circles`,description:`Items circling a centre on rings, for integration and works-with sections. Each item stays upright while the ring turns, by transform only. It holds still while an item is hovered or focused, pauses off-screen and in hidden tabs, and rests on the ring when reduced motion is on.`,source:`theme/src/components/orbiting-circles/orbiting-circles.tsx`,children:[(0,g.jsx)(d,{label:`Orbiting circles demo`,story:()=>p(()=>import(`./ShowcaseStage.orbiting-circles-BSvuON62.js`),[]),initial:{run:`idle`},minHeight:`23rem`,children:(e,t)=>(0,g.jsx)(_,{scene:e,ctx:t})}),(0,g.jsx)(u,{title:`Two rings`,description:`Stack rings with different radius, duration, reverse and startAngle around a central card. Give the ring a label when the items mean something: it then becomes a labelled list. Glass items use level-2 glass; keep a handful in view.`,controls:(0,g.jsx)(a,{label:`Pause`,checked:e,onCheckedChange:t}),stageClassName:`min-h-[26rem]`,code:`
import { useState } from "react";
import { GlassCard, OrbitingCircles, Switch } from "@sheenui/theme";

const GLYPHS = ["A", "B", "C", "D", "E", "F"];

function Glyph({ children }: { children: string }) {
  return <span className="glass-2 grid size-10 place-items-center rounded-full text-sm font-semibold">{children}</span>;
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <div className="relative grid size-[22rem] place-items-center">
        <GlassCard tint className="relative grid size-20 place-items-center text-sm font-semibold">Core</GlassCard>
        <OrbitingCircles label="Inner integrations" radius={96} duration={24} paused={paused}>
          {GLYPHS.slice(0, 3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
        <OrbitingCircles label="Outer integrations" radius={160} duration={36} reverse startAngle={30} paused={paused}>
          {GLYPHS.slice(3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
      </div>
    </>
  );
}`,children:(0,g.jsxs)(`div`,{className:`relative grid size-[22rem] max-w-full place-items-center`,children:[(0,g.jsx)(r,{tint:!0,className:`relative grid size-20 place-items-center text-sm font-semibold`,children:`Core`}),(0,g.jsx)(i,{label:`Inner integrations`,radius:96,duration:24,paused:e,children:v.slice(0,3).map(e=>(0,g.jsx)(y,{children:e},e))}),(0,g.jsx)(i,{label:`Outer integrations`,radius:160,duration:36,reverse:!0,startAngle:30,paused:e,children:v.slice(3).map(e=>(0,g.jsx)(y,{children:e},e))})]})}),(0,g.jsx)(l,{of:m}),(0,g.jsx)(c,{rows:[[`Tab`,`Moves through any links or buttons inside the items, in their order. The ring itself is not focusable.`],[`Focus on an item`,`Holds the ring still (pauseOnHover) so nobody chases a moving control.`]]}),(0,g.jsx)(o,{items:[`Without label the ring is decorative and aria-hidden; never put interactive items in a hidden ring. With label it is a labelled list with one item per child, in order.`,`pauseOnHover holds the ring while the pointer or focus is on an item; paused gives a page a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.`,`Reduced motion: the items rest on the ring, still, in the same places.`,`Two transform rotations per item on the compositor (the ring turns, the item turns back); nothing blurs, masks or filters the items.`]})]})}export{b as default};