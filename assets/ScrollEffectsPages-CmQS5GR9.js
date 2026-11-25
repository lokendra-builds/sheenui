import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./text-reveal-CCXtNjla.js";import{i,n as a,o,r as s}from"./Page-DQ8sr8qt.js";import{t as c}from"./Example-DMEbQwm9.js";import{t as l}from"./ShowcaseStage-qzIATPiV.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`children`,`string`,``,`The text to reveal, as one plain string. Words are split on whitespace.`,!0],[`as`,`TextRevealTag`,`"p"`,`The element to render: a paragraph for running text, a heading for a statement.`,!1],[`dim`,`number`,`0.28`,`How dim a word is before the scroll reaches it, from 0 (invisible) to 1 (no effect). Keep it at 0.25 or above so the unread words stay legible.`,!1],[`offset`,`ScrollOffset`,`["start 0.9", "end 0.5"]`,'Which part of the scroll drives the reveal, in Motion\'s `offset` format: `["start 0.9", "end 0.5"]` starts when the top of the text reaches 90 % of the viewport height and finishes when its bottom reaches the middle.',!1],[`container`,`RefObject<HTMLElement | null>`,`the page`,`The scrollable element that drives the reveal.`,!1]],p=e(t()),m=n(),h=u(()=>d(()=>import(`./ShowcaseStage.text-reveal.scene-CQMS12uS.js`).then(e=>e.TextRevealScene),[]),{minHeight:`19rem`,eager:!0});u(()=>d(()=>import(`./ShowcaseStage.scroll-progress.scene-BGfvSgjn.js`).then(e=>e.ScrollProgressScene),[]),{minHeight:`19rem`,eager:!0}),u(()=>d(()=>import(`./ShowcaseStage.confetti.scene-BROQY7Hq.js`).then(e=>e.ConfettiScene),[]),{minHeight:`14rem`,eager:!0});var g=`We build interfaces that feel like light passing through glass: calm, precise and never in the way of the thing you came to do.`;function _(){let e=(0,p.useRef)(null);return(0,m.jsxs)(a,{eyebrow:`Effect`,title:`Text reveal`,description:`A statement whose words light up one after another as you scroll. It is real text, readable without JavaScript, and only opacity changes, so nothing shifts. Scroll-linked, so it needs no loop, and every word is fully visible when reduced motion is on.`,source:`theme/src/components/text-reveal/text-reveal.tsx`,children:[(0,m.jsx)(l,{label:`Text reveal demo`,story:()=>d(()=>import(`./ShowcaseStage.text-reveal-BSvuON62.js`),[]),initial:{run:`idle`},minHeight:`19rem`,children:(e,t)=>(0,m.jsx)(h,{scene:e,ctx:t})}),(0,m.jsx)(c,{title:`Scroll inside the panel`,description:`Pass container to follow a scrollable panel instead of the page. offset sets where the reveal starts and ends; here it begins as the text enters the panel and finishes at the middle. Scroll back and the words dim again.`,stageClassName:`min-h-96 p-0 sm:p-0`,code:`
import { useRef } from "react";
import { TextReveal } from "@sheenui/theme";

export function Example() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div ref={scroller} role="region" aria-label="Manifesto" tabIndex={0} className="h-96 w-full overflow-y-auto p-8 focus-visible:outline-2 focus-visible:outline-sheen-focus">
      <div className="h-40" />
      <TextReveal
        as="h2"
        container={scroller}
        offset={["start 0.9", "end 0.5"]}
        className="text-3xl font-semibold tracking-tight text-balance"
      >
        We build interfaces that feel like light passing through glass: calm, precise and never in the way of the thing you came to do.
      </TextReveal>
      <div className="h-96" />
    </div>
  );
}`,children:(0,m.jsxs)(`div`,{ref:e,role:`region`,"aria-label":`Manifesto`,tabIndex:0,className:`h-96 w-full overflow-y-auto p-8 focus-visible:outline-2 focus-visible:outline-sheen-focus`,children:[(0,m.jsx)(`div`,{className:`h-40`}),(0,m.jsx)(r,{as:`h2`,container:e,offset:[`start 0.9`,`end 0.5`],className:`text-3xl font-semibold tracking-tight text-balance`,children:g}),(0,m.jsx)(`div`,{className:`h-96`})]})}),(0,m.jsx)(c,{title:`On the page, as a paragraph`,description:`Without container it follows the page scroll. Raise dim towards 1 for a subtler reveal; keep it at 0.25 or above so unread words stay legible.`,stageClassName:`min-h-48`,code:`
import { TextReveal } from "@sheenui/theme";

export function Example() {
  return (
    <TextReveal dim={0.4} className="max-w-xl text-lg text-pretty">
      Each word arrives as you reach it, left to right, like a progress bar made of language.
    </TextReveal>
  );
}`,children:(0,m.jsx)(r,{dim:.4,className:`max-w-xl text-lg text-pretty`,children:`Each word arrives as you reach it, left to right, like a progress bar made of language.`})}),(0,m.jsx)(s,{of:f}),(0,m.jsx)(o,{rows:[[`Tab`,`Not focusable: the text is plain content in the normal reading order.`]]}),(0,m.jsx)(i,{items:[`The words are real text with normal spaces, in order: selectable, searchable and read by screen readers whatever their opacity. Before hydration (or without JavaScript) every word is fully visible.`,`Dimmed words are lower contrast until revealed: keep dim at 0.25 or above, and avoid the effect on text that must be read at once (instructions, legal copy).`,`Use as="h2" only for a heading that belongs in the outline.`,`Only opacity changes, driven by the scroll position through MotionValues: no layout shift, no React renders while scrolling, no loop to pause. Reduced motion shows every word at full opacity.`]})]})}export{_ as default};