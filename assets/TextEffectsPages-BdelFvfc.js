import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./switch-BETATXZg.js";import{En as i,kn as a}from"./vendor-docs-DXAayRHf.js";import{n as o}from"./cn-CgB_fvgf.js";import{t as s}from"./use-controllable-DRYOK5nT.js";import{c,i as l,r as u}from"./tokens-u9Dgzdrd.js";import{i as d}from"./use-preferences-CCoq5AYS.js";import{i as f,t as p}from"./text-utils-Bm100FU5.js";import{i as m,n as h,o as g,r as _}from"./Page-ClekXXh-.js";import{t as v}from"./Example-jva669kg.js";import{t as y}from"./demo-clock-CoEY-AlH.js";import{t as b}from"./ShowcaseStage-qzIATPiV.js";import{t as x}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as S}from"./preload-helper-BrmCrVM7.js";var C=e(t(),1),w=n(),T={start:`justify-self-start`,center:`justify-self-center`,end:`justify-self-end`};function E({words:e,interval:t=2.6,direction:n=`up`,align:r=`start`,paused:m=!1,pauseOnHover:h=!0,index:g,defaultIndex:_=0,onIndexChange:v,label:y,locales:b,wordClassName:x,highlightClassName:S,className:E,...D}){let O=d(),k=(0,C.useRef)(null),[A,j]=s(g,_,v),M=e.length,N=M===0?0:(A%M+M)%M,P=f(k,{paused:m||O||M<2,pauseOnHover:h}),F=v!==void 0;(0,C.useEffect)(()=>{if(!P||g!==void 0&&!F)return;let e=window.setTimeout(()=>{let e=(N+1)%M;j(e)},t*1e3);return()=>window.clearTimeout(e)},[P,N,M,t,g,F,j]);let I=(0,C.useRef)(null),[L,R]=(0,C.useState)();(0,C.useLayoutEffect)(()=>{let e=I.current;e&&(e.style.borderRadius=``,R(getComputedStyle(e).borderTopLeftRadius))},[S]);let z=e[N]??``,B=n===`up`?`100%`:`-100%`,V=n===`up`?`-100%`:`100%`,H=`col-start-1 row-start-1 whitespace-nowrap`;return(0,w.jsxs)(`span`,{ref:k,"data-slot":`word-rotate`,className:o(`relative inline-grid`,E),...D,children:[(0,w.jsx)(`span`,{className:`sr-only select-none`,children:y??p(e,b)}),e.map((e,t)=>(0,w.jsx)(`span`,{"aria-hidden":!0,className:o(H,`invisible`,x),children:e},t)),S&&(0,w.jsx)(i.span,{ref:I,"aria-hidden":!0,"data-slot":`word-rotate-highlight`,layout:!O,transition:{layout:c.snappy},className:o(H,T[r],`-my-[0.1em] self-stretch forced-colors:border forced-colors:border-[CanvasText]`,S),style:L?{borderRadius:L}:void 0,children:(0,w.jsx)(`span`,{className:o(`invisible inline-block py-[0.1em]`,x),children:z})}),(0,w.jsx)(`span`,{"aria-hidden":!0,className:o(H,`grid overflow-clip [clip-path:inset(0)] -my-[0.1em] py-[0.1em]`),children:O?(0,w.jsx)(`span`,{className:o(H,T[r],x),children:z}):(0,w.jsx)(a,{initial:!1,children:(0,w.jsx)(i.span,{"data-slot":`word-rotate-word`,className:o(H,T[r],x),initial:{y:B,opacity:0},animate:{y:0,opacity:1,transition:c.gentle},exit:{y:V,opacity:0,transition:{duration:u.base,ease:l.exit,opacity:{duration:u.exit,ease:`linear`}}},children:z},`${N}-${z}`)})})]})}var D=[[`words`,`readonly string[]`,``,`The words to cycle through, in order.`,!0],[`interval`,`number`,`2.6`,`Seconds each word stays.`,!1],[`direction`,`"up" | "down"`,`"up"`,`Which way words travel: "up" (in from below, default) or "down" (in from above).`,!1],[`align`,`"center" | "end" | "start"`,`"start"`,`Where a shorter word sits in the slot (the slot is as wide as the longest word).`,!1],[`paused`,`boolean`,`false`,`Stop cycling (e.g. from a pause button).`,!1],[`pauseOnHover`,`boolean`,`true`,`Pause while a mouse or pen rests on the words.`,!1],[`index`,`number`,``,`Controlled index of the word shown.`,!1],[`defaultIndex`,`number`,`0`,`Sets the index shown first when uncontrolled.`,!1],[`onIndexChange`,`((index: number) => void)`,``,`Called with the index of each new word.`,!1],[`label`,`string`,``,`What screen readers hear instead of the list of words.`,!1],[`locales`,`Intl.LocalesArgument`,``,`Locale(s) for the default list label (Intl.ListFormat).`,!1],[`wordClassName`,`string`,``,`Classes for each word (padding, gradient text). Put a highlight's padding here.`,!1],[`highlightClassName`,`string`,``,`Classes for a highlight behind the current word (e.g. "rounded-sheen-md bg-sheen-accent-soft"). It morphs to fit each word.`,!1]],O=[`faster`,`calmer`,`clearer`,`brighter`];function k({scene:e}){let[t,n]=x(e.index);return(0,w.jsx)(`div`,{className:`sheen-stage-col`,children:(0,w.jsxs)(`p`,{className:`m-0 text-2xl leading-tight font-semibold text-sheen-fg`,children:[`Ship interfaces`,` `,(0,w.jsx)(E,{words:O,index:t,onIndexChange:n,paused:!0,highlightClassName:`rounded-full bg-sheen-accent-soft`,wordClassName:`px-3 text-sheen-accent`})]})})}function A(){let[e,t]=(0,C.useState)(!1);return(0,w.jsxs)(h,{eyebrow:`Effect`,title:`Word rotate`,description:`One slot in a sentence that cycles through words, each sliding up through a clipped window. The slot is as wide as the longest word, so the sentence never reflows, and an optional highlight morphs to fit each word. It pauses off screen, in hidden tabs and under the pointer; screen readers hear every word once, as a list.`,source:[`theme/src/components/text-effects/word-rotate.tsx`,`theme/src/components/text-effects/text-utils.ts`],children:[(0,w.jsx)(b,{label:`Word rotate demo`,story:()=>S(()=>import(`./ShowcaseStage.word-rotate-CIrogw-0.js`),[]),initial:{index:0},minHeight:`15rem`,children:(e,t)=>(0,w.jsx)(k,{scene:e,ctx:t})}),(0,w.jsx)(v,{title:`In a headline`,description:`highlightClassName draws a pill behind the current word: watch it morph between short and long words (transforms only, corners stay round). Padding goes in wordClassName so the pill and the word line up. Rest the pointer on it, or use the switch, to pause.`,controls:(0,w.jsx)(r,{label:`Pause`,checked:e,onCheckedChange:t}),stageClassName:`min-h-64`,code:`
import { useState } from "react";
import { Switch, WordRotate } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <p className="text-center text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        Built for{" "}
        <WordRotate
          words={["designers", "developers", "founders", "everyone"]}
          paused={paused}
          className="text-sheen-accent"
          wordClassName="px-3"
          highlightClassName="rounded-sheen-md bg-sheen-accent-soft"
        />
      </p>
    </>
  );
}`,children:(0,w.jsxs)(`p`,{className:`text-center text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl`,children:[`Built for`,` `,(0,w.jsx)(E,{words:[`designers`,`developers`,`founders`,`everyone`],locales:y,paused:e,className:`text-sheen-accent`,wordClassName:`px-3`,highlightClassName:`rounded-sheen-md bg-sheen-accent-soft`})]})}),(0,w.jsx)(v,{title:`Inside running text`,description:`direction="down" brings words in from above; align="center" centers shorter words in the slot. A custom label gives screen readers a better sentence than the plain list.`,code:`
import { WordRotate } from "@sheenui/theme";

export function Example() {
  return (
    <p className="max-w-md text-center text-xl text-pretty sm:text-2xl">
      Your dashboard,{" "}
      <WordRotate
        words={["faster", "clearer", "calmer"]}
        direction="down"
        align="center"
        interval={2}
        label="faster, clearer and calmer"
        className="font-semibold text-sheen-accent"
      />{" "}
      than ever.
    </p>
  );
}`,children:(0,w.jsxs)(`p`,{className:`max-w-md text-center text-xl text-pretty sm:text-2xl`,children:[`Your dashboard,`,` `,(0,w.jsx)(E,{words:[`faster`,`clearer`,`calmer`],direction:`down`,align:`center`,interval:2,label:`faster, clearer and calmer`,className:`font-semibold text-sheen-accent`}),` `,`than ever.`]})}),(0,w.jsx)(_,{of:D}),(0,w.jsx)(g,{rows:[[`Tab`,`Not focusable: this is text.`]]}),(0,w.jsx)(m,{items:[`Screen readers get the words once, as plain text (override it with label); the rotating word is not re-announced every few seconds.`,`Under reduced motion it stays on the current word.`]})]})}export{A as default};