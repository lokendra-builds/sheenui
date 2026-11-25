import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./badge-AQ2Afjwl.js";import{n as r,r as i,t as a}from"./ShowcaseStage.tilt-card.scene-tKs5aXmZ.js";import{i as o,n as s,o as c,r as l}from"./Page-DQ8sr8qt.js";import{t as u}from"./Example-DMEbQwm9.js";import{t as d}from"./lazy-block-BfzH_8EP.js";import{t as f}from"./shared-gkmG8m55.js";import{t as p}from"./ShowcaseStage-qzIATPiV.js";import{t as m}from"./preload-helper-BrmCrVM7.js";var h=[[`level`,`2 | 1 | 3`,`2`,`Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque.`,!1],[`tint`,`boolean`,`false`,`Tints the surface with the accent colour.`,!1],[`maxTilt`,`number`,`6`,`Largest tilt in degrees, 0 to 8 (clamped).`,!1],[`glare`,`boolean`,`true`,`Draws a light that slides across the surface.`,!1],[`glareColor`,`string`,`a white light, stronger in light mode`,`Colour of the glare (any CSS colour, keep it translucent).`,!1],[`hoverScale`,`number`,`1.02`,`Scale while the pointer is on the card (1 for none).`,!1],[`perspective`,`number`,`1000`,`Distance to the "camera" in px: smaller is more dramatic.`,!1],[`style`,`CSSProperties`,``,`Inline styles for the card (merged with the tilt transform, which wins).`,!1]],g=[[`depth`,`number`,`10`,`How far (px) the layer drifts toward the pointer at the card's edge. Negative drifts away.`,!1],[`style`,`CSSProperties`,``,`Inline styles for the layer (the drift transform is added to them).`,!1]];e();var _=t(),v=[{name:`Starter`,price:`$0`,note:`For side projects`,href:`#starter`},{name:`Pro`,price:`$24`,note:`For growing teams`,href:`#pro`,tint:!0},{name:`Scale`,price:`$79`,note:`For serious traffic`,href:`#scale`}];function y(){return(0,_.jsxs)(s,{eyebrow:`Effect`,title:`Tilt card`,description:`A glass card that leans toward the pointer in 3D, at most 8°, with a glare sliding across its surface, all on springs. The glass element itself tilts, so its blur keeps working. Touch and reduced motion get a still card.`,source:`theme/src/components/tilt-card/tilt-card.tsx`,children:[(0,_.jsx)(p,{label:`Tilt card demo`,story:()=>m(()=>import(`./ShowcaseStage.tilt-card-C3tqBlAq.js`),[]),initial:{at:null},minHeight:`20rem`,children:(e,t)=>(0,_.jsx)(a,{scene:e,ctx:t})}),(0,_.jsx)(u,{title:`Membership card`,description:`TiltCardLayer adds parallax: layers drift toward the pointer by their depth, so the card reads as layered without preserve-3d (which glass cannot use). A glare and a diagonal streak of light slide across the glass, and its edge catches the light nearest the pointer. Rest the pointer near a corner: the card holds still.`,stageClassName:`min-h-96`,code:`
import { Badge, TiltCard, TiltCardLayer } from "@sheenui/theme";
import { Sparkles as SparkIcon } from "lucide-react";

export function Example() {
  return (
    <TiltCard tint className="flex aspect-[1.586] w-full max-w-sm flex-col p-5 sm:p-6">
      {/* Lights behind the content that drift the other way (negative depth). */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <TiltCardLayer
          depth={-14}
          className="absolute -top-1/3 -end-1/4 aspect-square w-3/4 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-accent)_30%,transparent),transparent)]"
        />
        <TiltCardLayer
          depth={-8}
          className="absolute -end-[15%] -bottom-1/2 aspect-square w-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-teal-500)_22%,transparent),transparent)]"
        />
      </span>
      <TiltCardLayer depth={6} className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="sheen-fill grid size-8 place-items-center rounded-sheen-sm text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]">
            <SparkIcon /> {/* any 16px svg icon */}
          </span>
          Sheen Pay
        </span>
        <Badge tone="accent">Pro</Badge>
      </TiltCardLayer>
      {/* The chip */}
      <TiltCardLayer depth={10} className="mt-3 sm:mt-5">
        <span aria-hidden className="block h-8 w-11 rounded-md border border-sheen-border [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))] opacity-80" />
      </TiltCardLayer>
      <TiltCardLayer depth={16} className="mt-auto flex flex-col gap-1">
        <p className="font-sheen-mono text-base tracking-wider sm:text-lg">
          <span className="sr-only">Card ending in 0815</span>
          <span aria-hidden>4921 ···· ···· 0815</span>
        </p>
        <p className="text-sm text-sheen-fg-muted">Ada Lovelace · 09/29</p>
      </TiltCardLayer>
    </TiltCard>
  );
}`,children:(0,_.jsxs)(r,{tint:!0,className:`flex aspect-[1.586] w-full max-w-sm flex-col p-5 sm:p-6`,children:[(0,_.jsxs)(`span`,{"aria-hidden":!0,className:`pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]`,children:[(0,_.jsx)(i,{depth:-14,className:`absolute -top-1/3 -end-1/4 aspect-square w-3/4 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-accent)_30%,transparent),transparent)]`}),(0,_.jsx)(i,{depth:-8,className:`absolute -end-[15%] -bottom-1/2 aspect-square w-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-teal-500)_22%,transparent),transparent)]`})]}),(0,_.jsxs)(i,{depth:6,className:`flex items-start justify-between gap-3`,children:[(0,_.jsxs)(`span`,{className:`flex items-center gap-2 font-semibold`,children:[(0,_.jsx)(`span`,{"aria-hidden":!0,className:`sheen-fill grid size-8 place-items-center rounded-sheen-sm text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]`,children:(0,_.jsx)(b,{})}),`Sheen Pay`]}),(0,_.jsx)(n,{tone:`accent`,children:`Pro`})]}),(0,_.jsx)(i,{depth:10,className:`mt-3 sm:mt-5`,children:(0,_.jsx)(`span`,{"aria-hidden":!0,className:`block h-8 w-11 rounded-md border border-sheen-border [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))] opacity-80`})}),(0,_.jsxs)(i,{depth:16,className:`mt-auto flex flex-col gap-1`,children:[(0,_.jsxs)(`p`,{className:`font-sheen-mono text-base tracking-wider sm:text-lg`,children:[(0,_.jsx)(`span`,{className:`sr-only`,children:`Card ending in 0815`}),(0,_.jsx)(`span`,{"aria-hidden":!0,children:`4921 ···· ···· 0815`})]}),(0,_.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:`Ada Lovelace · 09/29`})]})]})}),(0,_.jsx)(u,{title:`Pricing cards`,description:`A gentler tilt (maxTilt={5}) on cards that are links. The whole card is clickable through a stretched link, and keyboard focus shows a solid ring.`,code:`
import { Badge, TiltCard } from "@sheenui/theme";

export function Example() {
  const plans = [
    { name: "Starter", price: "$0", note: "For side projects", href: "#starter" },
    { name: "Pro", price: "$24", note: "For growing teams", href: "#pro", tint: true },
    { name: "Scale", price: "$79", note: "For serious traffic", href: "#scale" },
  ];

  return (
    <ul className="grid w-full gap-4 sm:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.name}>
          <TiltCard
            maxTilt={5}
            tint={plan.tint}
            className="relative flex flex-col gap-2 p-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sheen-focus"
          >
            <h3 className="flex items-center justify-between gap-2 font-semibold">
              {/* A stretched link: the whole card is clickable. */}
              <a href={plan.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                {plan.name}
              </a>
              {plan.tint && <Badge tone="accent">Popular</Badge>}
            </h3>
            <p className="text-3xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
            </p>
            <p className="text-sm text-sheen-fg-muted">{plan.note}</p>
          </TiltCard>
        </li>
      ))}
    </ul>
  );
}`,children:(0,_.jsx)(`ul`,{className:`grid w-full gap-4 sm:grid-cols-3`,children:v.map(e=>(0,_.jsx)(`li`,{children:(0,_.jsxs)(r,{maxTilt:5,tint:e.tint,className:`relative flex flex-col gap-2 p-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sheen-focus`,children:[(0,_.jsxs)(`h3`,{className:`flex items-center justify-between gap-2 font-semibold`,children:[(0,_.jsx)(`a`,{href:e.href,className:`outline-none after:absolute after:inset-0 after:rounded-[inherit]`,children:e.name}),e.tint&&(0,_.jsx)(n,{tone:`accent`,children:`Popular`})]}),(0,_.jsxs)(`p`,{className:`text-3xl font-semibold tracking-tight`,children:[e.price,(0,_.jsx)(`span`,{className:`text-sm font-normal text-sheen-fg-muted`,children:`/mo`})]}),(0,_.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:e.note})]})},e.name))})}),(0,_.jsx)(l,{title:`TiltCard props`,of:h}),(0,_.jsx)(l,{title:`TiltCardLayer props`,of:g}),(0,_.jsx)(c,{rows:[[`Tab`,`Not focusable: a plain card is not focusable. Interactive children keep their own tab stops, and the tilt never moves them out of reach.`]]}),(0,_.jsx)(o,{items:[`A plain div that does not change reading order. The tilt is transform-only and reads the pointer, not focus.`,`It is off for touch (a finger on a card is scrolling) and under reduced motion; TiltCardLayer adds decorative depth.`]})]})}d(()=>m(()=>import(`./ShowcaseStage.morphing-dialog.scene-C5LHzBGZ.js`).then(e=>e.MorphingDialogScene),[]),{eager:!0,minHeight:`9rem`}),d(()=>m(()=>import(`./MorphingGalleryDemo-ingMtIgu.js`).then(e=>e.MorphingGalleryDemo),[]),{eager:!0,minHeight:`22rem`}),d(()=>m(()=>import(`./MorphingCompactDemo-Bq9CrgBq.js`).then(e=>e.MorphingCompactDemo),[]),{minHeight:`4.25rem`});function b(){return(0,_.jsx)(f,{className:`size-4`,children:(0,_.jsx)(`path`,{d:`M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18`})})}export{y as default};