import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./avatar-CpgGSsX5.js";import{t as i}from"./button-8i4LQrEk.js";import{t as a}from"./glass-card-OGQy5mxG.js";import{r as o}from"./toast-PePh6sao.js";import{n as s,t as c}from"./ShowcaseStage.typewriter.scene-C2FtnYwK.js";import{i as l,n as u,o as d,r as f}from"./Page-vzU90LKc.js";import{t as p}from"./Example-CmMsgUlK.js";import"./demo-clock-CoEY-AlH.js";import{t as m}from"./shared-gkmG8m55.js";import{t as h}from"./ShowcaseStage-qzIATPiV.js";import{t as g}from"./preload-helper-BrmCrVM7.js";var _=[[`words`,`string | readonly string[]`,``,`A phrase, or phrases to type one after another.`,!0],[`typeSpeed`,`number`,`0.055`,`Sets the seconds per typed character (on average).`,!1],[`deleteSpeed`,`number`,`0.028`,`Sets the seconds per deleted character.`,!1],[`hold`,`number`,`1.8`,`Seconds a finished phrase stays before it is deleted.`,!1],[`startDelay`,`number`,`0.2`,`Sets the number of seconds before the first character.`,!1],[`loop`,`boolean`,`true when there are several phrases`,`Start again after the last phrase.`,!1],[`cursor`,`boolean`,`true`,`Show the caret. When typing ends (no loop), it blinks a few times and fades.`,!1],[`cursorClassName`,`string`,``,`Adds extra classes to the caret (colour, width).`,!1],[`reserveSpace`,`boolean`,`true`,`Reserve the space of the longest phrase so nothing around it moves.`,!1],[`paused`,`boolean`,`false`,`Stop typing (e.g. from a pause button).`,!1],[`pauseOnHover`,`boolean`,`true`,`Pause while a mouse or pen rests on the text.`,!1],[`label`,`string`,`every phrase, in order`,`Sets what screen readers hear.`,!1],[`onComplete`,`(() => void)`,``,`Called once the last phrase is typed (when not looping).`,!1]],v=e(t()),y=n();function b(){let[e,t]=(0,v.useState)(0);return[e,(0,y.jsx)(i,{variant:`glass`,size:`sm`,onClick:()=>t(e=>e+1),leading:(0,y.jsx)(C,{}),children:`Replay`})]}var x=[`pnpm add @sheenui/theme`,`pnpm dev --open`,`git push origin main`];function S(){let e=o(),[t,n]=b();return(0,y.jsxs)(u,{eyebrow:`Effect`,title:`Typewriter`,description:`Types a phrase with a human rhythm, holds it, deletes it and types the next. The caret is solid while typing and blinks while it waits. The space of the longest phrase is reserved up front, so nothing around it moves.`,source:[`theme/src/components/text-effects/typewriter.tsx`,`theme/src/components/text-effects/text-utils.ts`],children:[(0,y.jsx)(h,{label:`Typewriter demo`,story:()=>g(()=>import(`./ShowcaseStage.typewriter-BfhzkhnN.js`),[]),initial:{prompt:-1},minHeight:`17rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!`,children:(e,t)=>(0,y.jsx)(c,{scene:e,ctx:t})}),(0,y.jsx)(p,{title:`Rotating phrases`,description:`Several phrases loop. It pauses while off screen, in a hidden tab, or under the pointer; paused, the caret holds still.`,stageClassName:`min-h-56`,code:`
import { Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-center text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
      I build{" "}
      <Typewriter
        words={["design systems.", "fast websites.", "accessible apps."]}
        className="text-sheen-accent"
      />
    </p>
  );
}`,children:(0,y.jsxs)(`p`,{className:`text-center text-3xl leading-tight font-semibold tracking-tight sm:text-4xl`,children:[`I build`,` `,(0,y.jsx)(s,{words:[`design systems.`,`fast websites.`,`accessible apps.`],className:`text-sheen-accent`})]})}),(0,y.jsx)(p,{title:`Terminal`,description:`Monospace, a block-ish caret, quicker keys. The reserved space keeps the card from jumping; in a flex row next to the prompt, a long command wraps inside its own column on narrow screens.`,code:`
import { GlassCard, Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard level={3} sheen={false} className="w-full max-w-md overflow-hidden">
      {/* Window controls (decorative) */}
      <div aria-hidden className="flex items-center gap-1.5 border-b border-sheen-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-sheen-danger" />
        <span className="size-2.5 rounded-full bg-sheen-warning" />
        <span className="size-2.5 rounded-full bg-sheen-success" />
      </div>
      <p className="flex gap-[1ch] p-5 font-sheen-mono text-sm">
        <span aria-hidden className="text-sheen-fg-subtle">$</span>
        <Typewriter
          words={["pnpm add @sheenui/theme", "pnpm dev --open", "git push origin main"]}
          typeSpeed={0.04}
          hold={1.4}
          cursorClassName="w-[0.6em] rounded-none bg-sheen-fg-muted"
          className="min-w-0"
        />
      </p>
    </GlassCard>
  );
}`,children:(0,y.jsxs)(a,{level:3,sheen:!1,className:`w-full max-w-md overflow-hidden`,children:[(0,y.jsxs)(`div`,{"aria-hidden":!0,className:`flex items-center gap-1.5 border-b border-sheen-border px-4 py-2.5`,children:[(0,y.jsx)(`span`,{className:`size-2.5 rounded-full bg-sheen-danger`}),(0,y.jsx)(`span`,{className:`size-2.5 rounded-full bg-sheen-warning`}),(0,y.jsx)(`span`,{className:`size-2.5 rounded-full bg-sheen-success`})]}),(0,y.jsxs)(`p`,{className:`flex gap-[1ch] p-5 font-sheen-mono text-sm`,children:[(0,y.jsx)(`span`,{"aria-hidden":!0,className:`text-sheen-fg-subtle`,children:`$`}),(0,y.jsx)(s,{words:x,typeSpeed:.04,hold:1.4,cursorClassName:`w-[0.6em] rounded-none bg-sheen-fg-muted`,className:`min-w-0`})]})]})}),(0,y.jsx)(p,{title:`Type once`,description:`A single phrase types once (loop is off by default for one phrase); the caret blinks a few times, then fades. onComplete fires at the end. The paragraph is already full height before the first letter.`,controls:n,code:`
import { Avatar, GlassCard, Typewriter, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <GlassCard className="flex w-full max-w-md gap-3 p-5">
      <Avatar name="Sheen Assistant" size="sm" />
      <p className="text-sm text-pretty">
        <Typewriter
          words="Your workspace is ready. We imported 24 components, set up dark mode and turned on reduced-motion support."
          typeSpeed={0.025}
          onComplete={() => toast.success("Setup complete")}
        />
      </p>
    </GlassCard>
  );
}`,children:(0,y.jsxs)(a,{className:`flex w-full max-w-md gap-3 p-5`,children:[(0,y.jsx)(r,{name:`Sheen Assistant`,size:`sm`}),(0,y.jsx)(`p`,{className:`text-sm text-pretty`,children:(0,y.jsx)(s,{words:`Your workspace is ready. We imported 24 components, set up dark mode and turned on reduced-motion support.`,typeSpeed:.025,onComplete:()=>e.success(`Setup complete`)})},t)]})}),(0,y.jsx)(f,{of:_}),(0,y.jsx)(d,{rows:[[`Tab`,`Not focusable: this is text.`]]}),(0,y.jsx)(l,{items:[`Screen readers get every phrase once, as plain text (override it with label); the typing itself is aria-hidden.`,`That copy is unselectable, so copying gets only what is on screen. It waits until it is on screen and pauses in a hidden tab or while the pointer rests on it: a pointer convenience, not a WCAG 2.2.2 mechanism, since keyboard and touch users cannot hover. A loop that runs longer than 5 s needs a visible pause button wired to paused. Under reduced motion it shows the first phrase, complete, with no caret.`]})]})}function C(){return(0,y.jsxs)(m,{className:`size-3.5`,children:[(0,y.jsx)(`path`,{d:`M3 12a9 9 0 1 0 3-6.7L3 8`}),(0,y.jsx)(`path`,{d:`M3 3v5h5`})]})}export{S as default};