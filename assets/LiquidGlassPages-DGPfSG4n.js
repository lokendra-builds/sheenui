import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{En as r}from"./vendor-docs-DXAayRHf.js";import{It as i}from"./vendor-core-DFpXCaZU.js";import{t as a}from"./badge-AQ2Afjwl.js";import{i as o}from"./use-preferences-CCoq5AYS.js";import{n as s,r as c,t as l}from"./ShowcaseStage.liquid-glass.scene-zLLTgaZe.js";import{i as u,n as d,o as f,r as p}from"./Page-ClekXXh-.js";import{t as m}from"./Example-jva669kg.js";import{t as h}from"./math-D7k6Oux1.js";import{t as g}from"./ShowcaseStage-qzIATPiV.js";import{t as _}from"./preload-helper-BrmCrVM7.js";var v=[[`shape`,`"circle" | "rect" | "pill"`,`"rect"`,`Outline of the lens. "rect" uses the element's own border radius (rounded-sheen-xl by default, override with className); "pill" and "circle" are fully rounded.`,!1],[`variant`,`"regular" | "clear"`,`"regular"`,`"regular": frosted and tinted, for text and controls (legible on anything). "clear": barely tinted, most see-through. For icons and bold labels over media.`,!1],[`refraction`,`number`,`1`,`How strongly the rim bends the backdrop. 0 = flat glass, 1 = default, up to 2.`,!1],[`bezel`,`number`,`most of the corner radius (capped at 40)`,`Sets the width of the curved rim in px.`,!1],[`frost`,`number`,`12 (regular) or 1 (clear)`,`Sets the frost inside the lens, in px.`,!1],[`saturation`,`number`,`1.5`,`Colour boost of the backdrop seen through the lens (1 = none).`,!1],[`aberration`,`number`,`0`,`Splits the refracted edge into its colours, like a prism (0 to 1).`,!1],[`specular`,`boolean`,`true`,`Adds a bright specular rim along the edge.`,!1],[`interactive`,`boolean`,`false`,`Grows slightly on hover and presses in on tap (scale only; none with reduced motion).`,!1]],y=e(t()),b=n();function x({className:e}){return(0,b.jsxs)(`div`,{"aria-hidden":!0,className:`pointer-events-none absolute inset-0 overflow-hidden select-none ${e??``}`,children:[(0,b.jsx)(`div`,{className:`absolute inset-0 [background:conic-gradient(from_210deg_at_70%_35%,var(--sheen-chart-1),var(--sheen-chart-5),var(--sheen-chart-2),var(--sheen-chart-4),var(--sheen-chart-3),var(--sheen-chart-7),var(--sheen-chart-1))]`}),(0,b.jsx)(`div`,{className:`absolute inset-x-0 top-[8%] h-[34%] [background:repeating-linear-gradient(0deg,color-mix(in_oklab,var(--sheen-ink-0)_75%,transparent)_0_2px,transparent_2px_12px)]`}),(0,b.jsx)(`div`,{className:`absolute top-[52%] -start-10 size-48 rounded-full bg-sheen-surface`}),(0,b.jsx)(`div`,{className:`absolute top-[58%] start-[12%] size-24 rounded-full border-[14px] border-[var(--sheen-chart-1)]`}),(0,b.jsx)(`div`,{className:`absolute end-[6%] bottom-[10%] size-32 rotate-12 rounded-sheen-lg [background:repeating-linear-gradient(45deg,var(--sheen-ink-900)_0_6px,var(--sheen-ink-0)_6px_12px)]`}),(0,b.jsx)(`div`,{className:`absolute inset-x-0 top-[44%] -translate-y-1/2 text-center font-black leading-none tracking-tighter text-[var(--sheen-ink-900)] text-[clamp(3.5rem,14vw,9rem)]`,children:`Liquid`}),(0,b.jsx)(`div`,{className:`absolute end-[24%] bottom-[8%] h-24 w-40 [background-image:radial-gradient(circle,var(--sheen-ink-0)_0_2.5px,transparent_3px)] [background-size:14px_14px]`})]})}function S(){return(0,y.useSyncExternalStore)(()=>()=>void 0,c,()=>!1)}function C(){let e=(0,y.useRef)(null),t=o(),n=i(0),a=i(0);function c(t){let r={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[t.key],i=e.current;if(!r||!i)return;t.preventDefault();let o=t.currentTarget,s=t.shiftKey?64:16;n.set(h(n.get()+r[0]*s,-o.offsetLeft,i.clientWidth-o.offsetLeft-o.offsetWidth)),a.set(h(a.get()+r[1]*s,-o.offsetTop,i.clientHeight-o.offsetTop-o.offsetHeight))}return(0,b.jsxs)(`div`,{ref:e,className:`relative h-80 w-full sm:h-96`,children:[(0,b.jsx)(x,{}),(0,b.jsx)(s,{shape:`circle`,variant:`clear`,aberration:.6,render:(0,b.jsx)(r.div,{drag:!0,dragConstraints:e,dragElastic:.12,dragMomentum:!t,whileDrag:t?void 0:{scale:1.06},style:{x:n,y:a}}),tabIndex:0,role:`group`,"aria-roledescription":`movable lens`,"aria-label":`Lens. Drag it, or use the arrow keys to move it.`,onKeyDown:c,className:`absolute top-1/2 left-1/2 -mt-16 -ml-16 size-32 cursor-grab touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus active:cursor-grabbing sm:-mt-20 sm:-ml-20 sm:size-40`})]})}var w=[[`Golden hour`,`var(--sheen-chart-4)`,`var(--sheen-chart-2)`],[`Deep sea`,`var(--sheen-chart-7)`,`var(--sheen-chart-1)`],[`Lagoon`,`var(--sheen-chart-3)`,`var(--sheen-chart-7)`],[`Bloom`,`var(--sheen-chart-5)`,`var(--sheen-chart-1)`],[`Ember`,`var(--sheen-chart-8)`,`var(--sheen-chart-4)`],[`Canopy`,`var(--sheen-chart-6)`,`var(--sheen-chart-3)`],[`Dusk`,`var(--sheen-chart-1)`,`var(--sheen-chart-5)`],[`Citrus`,`var(--sheen-chart-2)`,`var(--sheen-chart-4)`]],T=[{id:`library`,label:`Library`,icon:(0,b.jsx)(k,{})},{id:`for-you`,label:`For you`,icon:(0,b.jsx)(A,{})},{id:`albums`,label:`Albums`,icon:(0,b.jsx)(j,{})},{id:`search`,label:`Search`,icon:(0,b.jsx)(M,{})}];function E(){let[e,t]=(0,y.useState)(`library`);return(0,b.jsxs)(`div`,{className:`relative h-[26rem] w-full overflow-hidden rounded-[inherit]`,children:[(0,b.jsx)(`div`,{role:`region`,"aria-label":`Photo library (scrolls under the tab bar)`,tabIndex:0,className:`h-full overflow-y-auto overscroll-contain p-3 pb-28 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus sm:p-4 sm:pb-28`,children:(0,b.jsx)(`ul`,{className:`grid grid-cols-2 gap-3 sm:grid-cols-4`,children:[...w,...w].map(([e,t,n],r)=>(0,b.jsx)(`li`,{className:`flex aspect-[4/5] items-end rounded-sheen-md p-2.5`,style:{background:`linear-gradient(160deg, ${t}, ${n})`},children:(0,b.jsx)(`span`,{className:`rounded-sheen-full bg-sheen-surface/85 px-2.5 py-1 text-xs font-semibold text-sheen-fg`,children:e})},r))})}),(0,b.jsx)(s,{shape:`pill`,render:(0,b.jsx)(`nav`,{"aria-label":`Library sections`}),className:`absolute inset-x-3 bottom-3 mx-auto flex max-w-md justify-between gap-1 p-1.5 sm:bottom-4`,children:T.map(n=>(0,b.jsxs)(`button`,{type:`button`,"aria-current":e===n.id?`page`:void 0,onClick:()=>t(n.id),className:`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-sheen-full px-2 text-2xs font-semibold text-sheen-fg motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast) hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus aria-[current=page]:bg-sheen-surface/85 aria-[current=page]:[background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))] aria-[current=page]:text-sheen-accent any-pointer-coarse:min-h-14 forced-colors:aria-[current=page]:underline forced-colors:aria-[current=page]:outline-1 forced-colors:aria-[current=page]:outline-solid [&>svg]:size-5`,children:[n.icon,(0,b.jsx)(`span`,{className:`truncate`,children:n.label})]},n.id))})]})}function D(){let e=S();return(0,b.jsxs)(d,{eyebrow:`Effect`,title:`Liquid glass`,description:`A lens that bends the page behind it, like Apple's Liquid Glass: real refraction through an SVG displacement map, with a specular rim. Chromium bends the light; Safari and Firefox get SheenUI's frosted glass, and reduced transparency turns it solid.`,source:[`theme/src/components/liquid-glass/liquid-glass.tsx`,`theme/src/components/liquid-glass/lens-map.ts`],children:[(0,b.jsx)(g,{label:`Liquid glass demo`,story:()=>_(()=>import(`./ShowcaseStage.liquid-glass-iyaHIHK0.js`),[]),initial:{x:.1,lens:!1},minHeight:`18rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!`,children:(e,t)=>(0,b.jsx)(l,{scene:e,ctx:t})}),(0,b.jsxs)(`p`,{className:`-mt-6 flex flex-wrap items-center gap-2 text-sm text-sheen-fg-muted`,children:[`In this browser:`,e?(0,b.jsx)(a,{tone:`success`,dot:!0,children:`Refraction on`}):(0,b.jsx)(a,{tone:`warning`,dot:!0,children:`Frosted fallback`})]}),(0,b.jsx)(m,{title:`Drag the lens`,description:`A clear circle lens over crisp artwork. Drag it (or focus it and use the arrow keys) and watch the lines bend and split into color at the rim.`,stageClassName:`p-0 sm:p-0`,code:`
import { useRef, type KeyboardEvent } from "react";
import { LiquidGlass } from "@sheenui/theme";
import { motion, useMotionValue } from "motion/react";

const moves: Partial<Record<string, [number, number]>> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
// Written out here on purpose: the library's clamp is internal, and this example has to run on its own.
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function Example() {
  const areaRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Arrow keys move the lens (Shift for bigger steps), kept inside the artwork.
  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    const move = moves[event.key];
    const area = areaRef.current;
    if (!move || !area) return;
    event.preventDefault();
    const lens = event.currentTarget;
    const step = event.shiftKey ? 64 : 16;
    x.set(clamp(x.get() + move[0] * step, -lens.offsetLeft, area.clientWidth - lens.offsetLeft - lens.offsetWidth));
    y.set(clamp(y.get() + move[1] * step, -lens.offsetTop, area.clientHeight - lens.offsetTop - lens.offsetHeight));
  }

  return (
    <div ref={areaRef} className="relative h-96 overflow-hidden rounded-sheen-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400">
      <LiquidGlass
        shape="circle"
        variant="clear"
        aberration={0.6}
        render={
          <motion.div
            drag
            dragConstraints={areaRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.06 }}
            style={{ x, y }}
          />
        }
        tabIndex={0}
        role="group"
        aria-roledescription="movable lens"
        aria-label="Lens. Drag it, or use the arrow keys to move it."
        onKeyDown={nudge}
        className="absolute top-1/2 left-1/2 -mt-20 -ml-20 size-40 cursor-grab touch-none"
      />
    </div>
  );
}`,children:(0,b.jsx)(C,{})}),(0,b.jsx)(m,{title:`Floating tab bar`,description:`A pill of regular liquid glass over scrolling content, the way iOS 26 floats its tab bars. Its tint thins out towards the rim, so the tiles visibly bend at the edge while the labels keep a solid backplate.`,stageClassName:`p-0 sm:p-0`,code:`
import { useState } from "react";
import { LiquidGlass } from "@sheenui/theme";

const tabs = [
  { id: "all", label: "All", icon: null },
  { id: "albums", label: "Albums", icon: null },
  { id: "shared", label: "Shared", icon: null },
];

export function Example() {
  const [active, setActive] = useState("all");

  return (
    <div className="relative h-[26rem] overflow-hidden">
      <div role="region" aria-label="Photo library" tabIndex={0} className="h-full overflow-y-auto p-3 pb-28">
        {/* tiles */}
      </div>
      <LiquidGlass
        shape="pill"
        render={<nav aria-label="Library sections" />}
        className="absolute inset-x-3 bottom-3 mx-auto flex max-w-md justify-between gap-1 p-1.5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => setActive(tab.id)}
            className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-sheen-full text-2xs font-semibold aria-[current=page]:text-sheen-accent"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </LiquidGlass>
    </div>
  );
}`,children:(0,b.jsx)(E,{})}),(0,b.jsx)(m,{title:`Shapes and variants`,description:`Pill, circle and rounded rectangle, each with its own displacement map. Interactive glass grows a touch on hover and presses in on tap: only its scale ever animates.`,stageClassName:`p-0 sm:p-0`,code:`
import { LiquidGlass } from "@sheenui/theme";
import { Play as PlayIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <LiquidGlass shape="pill" interactive render={<button type="button" />} className="h-12 px-6 text-sm font-semibold">
        Get started
      </LiquidGlass>

      <LiquidGlass
        shape="circle"
        interactive
        render={<button type="button" aria-label="Play" />}
        className="grid size-14 place-items-center [&>svg]:size-6"
      >
        <PlayIcon />
      </LiquidGlass>

      <LiquidGlass className="flex w-full max-w-72 flex-col gap-1 p-5">
        <p className="font-semibold">Now playing</p>
        <p className="text-sm text-sheen-fg-muted">Glass Animals · Heat Waves</p>
      </LiquidGlass>
    </>
  );
}`,children:(0,b.jsxs)(`div`,{className:`relative flex min-h-80 w-full flex-wrap items-center justify-center gap-6 p-6 sm:p-10`,children:[(0,b.jsx)(x,{}),(0,b.jsx)(s,{shape:`pill`,interactive:!0,render:(0,b.jsx)(`button`,{type:`button`}),className:`h-12 px-6 text-sm font-semibold`,children:`Get started`}),(0,b.jsx)(s,{shape:`circle`,interactive:!0,render:(0,b.jsx)(`button`,{type:`button`,"aria-label":`Play`}),className:`grid size-14 place-items-center [&>svg]:size-6`,children:(0,b.jsx)(N,{})}),(0,b.jsxs)(s,{className:`flex w-full max-w-72 flex-col gap-1 p-5`,children:[(0,b.jsx)(`p`,{className:`font-semibold`,children:`Now playing`}),(0,b.jsx)(`p`,{className:`text-sm text-sheen-fg-muted`,children:`Glass Animals · Heat Waves`})]})]})}),(0,b.jsx)(p,{of:v,rows:[[`render`,`ReactElement | function`,`<div />`,`Render as another element: a button, a nav, a motion.div…`]]}),(0,b.jsx)(f,{rows:[[`Tab`,`Not focusable: LiquidGlass is decoration. Give it role, tabIndex and handlers when it is a control; interactive adds a solid focus ring.`]]}),(0,b.jsx)(u,{items:[`Pure decoration around your content: text on a regular lens keeps 4.5:1 contrast on any backdrop, and the rim is decorative.`,`The lens is Chromium only: Safari and Firefox keep the frosted blur. Reduced transparency, more contrast and forced colors give a solid surface; forced colors drop the rim.`,`A draggable lens needs a keyboard alternative: the example moves with the arrow keys (Shift for bigger steps).`]})]})}function O({children:e}){return(0,b.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,className:`size-5`,children:e})}function k(){return(0,b.jsxs)(O,{children:[(0,b.jsx)(`rect`,{x:`3`,y:`3`,width:`7`,height:`7`,rx:`1.5`}),(0,b.jsx)(`rect`,{x:`14`,y:`3`,width:`7`,height:`7`,rx:`1.5`}),(0,b.jsx)(`rect`,{x:`3`,y:`14`,width:`7`,height:`7`,rx:`1.5`}),(0,b.jsx)(`rect`,{x:`14`,y:`14`,width:`7`,height:`7`,rx:`1.5`})]})}function A(){return(0,b.jsx)(O,{children:(0,b.jsx)(`path`,{d:`M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6`})})}function j(){return(0,b.jsxs)(O,{children:[(0,b.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`16`,rx:`2`}),(0,b.jsx)(`path`,{d:`M3 10h18M9 4v16`})]})}function M(){return(0,b.jsxs)(O,{children:[(0,b.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,b.jsx)(`path`,{d:`m20 20-3.5-3.5`})]})}function N(){return(0,b.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,b.jsx)(`path`,{d:`M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z`})})}export{D as default};