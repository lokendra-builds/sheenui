import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{n as i,t as a}from"./ShowcaseStage.blur-in.scene-DOwtlecj.js";import{i as o,n as s,o as c,r as l}from"./Page-DQ8sr8qt.js";import{t as u}from"./Example-DMEbQwm9.js";import"./demo-clock-CoEY-AlH.js";import{t as d}from"./shared-gkmG8m55.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`text`,`string`,``,`The text to reveal.`,!0],[`by`,`"word" | "character"`,`"word"`,`Reveal word by word (default), or character by character (also the choice for languages written without spaces).`,!1],[`delay`,`number`,`0`,`Seconds before the first piece starts.`,!1],[`stagger`,`number`,`0.07 for words, 0.025 for characters`,`Sets the seconds between pieces.`,!1],[`duration`,`number`,`durations.slower`,`Seconds each piece takes to arrive.`,!1],[`blur`,`number`,`10`,`Starting blur in px. 0 for a plain fade-up.`,!1],[`offset`,`string`,`"0.35em"`,`How far each piece rises, as a CSS length. "0" for none.`,!1],[`animateOnView`,`boolean`,`true`,`Wait until the text is on screen. Off: play on mount.`,!1],[`once`,`boolean`,`true`,`Play only the first time it enters the view. Off: replay every time it comes back.`,!1],[`onComplete`,`(() => void)`,``,`Called when the last piece has landed.`,!1],[`pieceClassName`,`string`,``,`Classes for each animated piece (e.g. a gradient per word).`,!1]],h=e(t()),g=n();function _(){let[e,t]=(0,h.useState)(0);return[e,(0,g.jsx)(r,{variant:`glass`,size:`sm`,onClick:()=>t(e=>e+1),leading:(0,g.jsx)(y,{}),children:`Replay`})]}function v(){let[e,t]=_(),[n,r]=_();return(0,g.jsxs)(s,{eyebrow:`Effect`,title:`Blur in`,description:`Words sharpen out of a soft blur one after another, rising a little as they land: the hero-headline reveal. Screen readers get the sentence once, in one piece; reduced motion shows plain text straight away.`,source:[`theme/src/components/text-effects/blur-in.tsx`,`theme/src/components/text-effects/text-utils.ts`],children:[(0,g.jsx)(f,{label:`Blur in demo`,story:()=>p(()=>import(`./ShowcaseStage.blur-in-DSKbcoLl.js`),[]),initial:{headline:!1,sub:!1},minHeight:`16rem`,children:(e,t)=>(0,g.jsx)(a,{scene:e,ctx:t})}),(0,g.jsx)(u,{title:`Hero headline`,description:`Render it as any element with render (here paragraphs styled as a headline; use render={<h1 />} for the page's real heading). It plays once, when it scrolls into view.`,controls:t,stageClassName:`min-h-72`,code:`
import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
      <BlurIn
        render={<p />}
        text="Interfaces you can see through."
        className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl"
      />
      <BlurIn
        render={<p />}
        text="Glass components with motion that stays readable, accessible and fast."
        delay={0.45}
        stagger={0.03}
        blur={6}
        className="max-w-lg text-base text-pretty text-sheen-fg-muted sm:text-lg"
      />
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex max-w-2xl flex-col items-center gap-4 text-center`,children:[(0,g.jsx)(i,{render:(0,g.jsx)(`p`,{}),text:`Interfaces you can see through.`,className:`text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl`}),(0,g.jsx)(i,{render:(0,g.jsx)(`p`,{}),text:`Glass components with motion that stays readable, accessible and fast.`,delay:.45,stagger:.03,blur:6,className:`max-w-lg text-base text-pretty text-sheen-fg-muted sm:text-lg`})]},e)}),(0,g.jsx)(u,{title:`Character by character`,description:`by="character" reveals each letter (emoji and accents stay whole). Words never break apart mid-line. It is also the mode for languages written without spaces.`,controls:r,code:`
import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BlurIn
        by="character"
        render={<p />}
        text="Ship it ✨"
        blur={12}
        offset="0.5em"
        className="text-5xl font-bold tracking-tight sm:text-6xl"
      />
      <BlurIn
        by="character"
        render={<p />}
        text="こんにちは、世界"
        delay={0.5}
        stagger={0.05}
        lang="ja"
        className="text-xl font-medium text-sheen-fg-muted"
      />
    </div>
  );
}`,children:(0,g.jsxs)(`div`,{className:`flex flex-col items-center gap-3 text-center`,children:[(0,g.jsx)(i,{by:`character`,render:(0,g.jsx)(`p`,{}),text:`Ship it ✨`,blur:12,offset:`0.5em`,className:`text-5xl font-bold tracking-tight sm:text-6xl`}),(0,g.jsx)(i,{by:`character`,render:(0,g.jsx)(`p`,{}),text:`こんにちは、世界`,delay:.5,stagger:.05,className:`text-xl font-medium text-sheen-fg-muted`,lang:`ja`})]},n)}),(0,g.jsx)(l,{of:m,rows:[[`render`,`ReactElement | function`,`<span />`,`Render as another element: an h1, a p…`]]}),(0,g.jsx)(c,{rows:[[`Tab`,`Not focusable: this is text.`]]}),(0,g.jsx)(o,{items:[`The text is in the DOM from the start, so screen readers and search engines read it once, whether or not it has animated.`,`Under reduced motion it is plain static text, with nothing to wait for.`]})]})}function y(){return(0,g.jsxs)(d,{className:`size-3.5`,children:[(0,g.jsx)(`path`,{d:`M3 12a9 9 0 1 0 3-6.7L3 8`}),(0,g.jsx)(`path`,{d:`M3 3v5h5`})]})}export{v as default};