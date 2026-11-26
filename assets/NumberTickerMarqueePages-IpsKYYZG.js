import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./avatar-CpgGSsX5.js";import{t as i}from"./button-8i4LQrEk.js";import{i as a}from"./use-preferences-CCoq5AYS.js";import{t as o}from"./marquee-CygBS_ql.js";import{i as s,n as c,o as l,r as u}from"./Page-ClekXXh-.js";import{t as d}from"./Example-jva669kg.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./ShowcaseStage.follow-C3IvOXPy.js";import{t as m}from"./preload-helper-BrmCrVM7.js";var h=[[`children`,`ReactNode`,``,`The items: each child is one item (a logo, a card…).`,!0],[`speed`,`number`,`40`,`Sets the speed in px per second.`,!1],[`reverse`,`boolean`,`false`,`Move towards the end (right in LTR, or down when vertical) instead of the start.`,!1],[`vertical`,`boolean`,`false`,`Scroll vertically. Give the marquee a height with className (default h-96).`,!1],[`gap`,`number`,`24`,`Sets the space between items, in px.`,!1],[`pauseOnHover`,`boolean`,`true`,`Ease to a stop while the mouse is over it.`,!1],[`fade`,`boolean`,`true`,`Fades out the two edges of the strip.`,!1],[`fadeSize`,`number`,`64`,`Length of each faded edge, in px (at most 12% of the strip, so narrow strips stay readable).`,!1],[`controls`,`boolean`,`true`,`Show the Pause / Play button. Keep it unless you provide your own control (WCAG 2.2.2).`,!1],[`paused`,`boolean`,``,`Paused (controlled). Use with onPausedChange, e.g. to drive several marquees from one button.`,!1],[`defaultPaused`,`boolean`,`false`,`Starts in the paused state (uncontrolled).`,!1],[`onPausedChange`,`((paused: boolean) => void)`,``,`Called when the Pause / Play button is pressed.`,!1],[`listLabel`,`string`,``,`Accessible name for the list of items, e.g. "Customers".`,!1],[`itemClassName`,`string`,``,`Classes for every item (<li>). Put a glass class here to make each item a glass card.`,!1],[`labels`,`Partial<MarqueeLabels>`,`defaultMarqueeLabels`,'Text of the Pause / Play button; a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: `labels={{ pause: "…" }}`; omitted keys keep the English of `defaultMarqueeLabels`. All 2 keys of `MarqueeLabels` are listed in the key table under the props table.',!1,{type:`MarqueeLabels`,const:`defaultMarqueeLabels`,keys:[[`pause`,`Pause animation`],[`play`,`Play animation`]]}]],g=e(t()),_=n(),v=[`Acme`,`Globex`,`Initech`,`Umbrella`,`Hooli`,`Stark`,`Wayne`,`Wonka`];function y({scene:e}){let[t,n]=p(e.running);return(0,_.jsxs)(`div`,{className:`sheen-stage-col`,children:[(0,_.jsx)(`p`,{className:`sheen-stage-sub`,children:`Trusted by teams at`}),(0,_.jsx)(o,{className:`w-full`,speed:55,gap:16,paused:!t,onPausedChange:e=>n(!e),listLabel:`Customers`,children:v.map(e=>(0,_.jsx)(`span`,{className:`rounded-full border border-sheen-border px-4 py-1.5 text-sm font-semibold text-sheen-fg`,children:e},e))})]})}var b=[`Northwind`,`Lumina`,`Arcadia`,`Vertex`,`Quanta`,`Helix`,`Orbitly`,`Nimbus`];function x({name:e,index:t}){let n=[(0,_.jsx)(`circle`,{cx:`12`,cy:`12`,r:`8`},`c`),(0,_.jsx)(`rect`,{x:`4`,y:`4`,width:`16`,height:`16`,rx:`4`},`r`),(0,_.jsx)(`path`,{d:`M12 3 21 20H3Z`},`t`),(0,_.jsx)(`path`,{d:`M12 2 22 12 12 22 2 12Z`},`d`)];return(0,_.jsxs)(`a`,{href:`#customer-${e.toLowerCase()}`,className:`flex min-h-11 items-center gap-2 rounded-sheen-sm px-2 text-lg font-semibold tracking-tight text-sheen-fg-muted motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast) hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`,children:[(0,_.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-6`,fill:`currentColor`,children:n[t%n.length]}),e]})}var S=[[`Ana Ribeiro`,`Design lead, Lumina`,`The glass actually stays readable. First theme I've shipped without a contrast fight.`],[`Kenji Watanabe`,`Frontend, Vertex`,`Reduced motion is handled everywhere. Our accessibility audit had nothing to say.`],[`Priya Natarajan`,`Founder, Helix`,`Copied four components and had a landing page that looked custom by lunch.`],[`Marcus Lee`,`Engineer, Quanta`,`The springs feel expensive. Exits are quicker than entrances, which is exactly right.`],[`Sofia Greco`,`Product designer`,`Dark mode isn't an afterthought: every token was clearly checked twice.`],[`Tom Becker`,`CTO, Orbitly`,`Typed props, Base UI underneath, nothing magic. Easy to own.`]];function C({name:e,role:t,quote:n}){return(0,_.jsxs)(`figure`,{className:`flex h-full flex-col gap-4`,children:[(0,_.jsxs)(`blockquote`,{className:`text-sm text-pretty`,children:[`“`,n,`”`]}),(0,_.jsxs)(`figcaption`,{className:`mt-auto flex items-center gap-3`,children:[(0,_.jsx)(r,{name:e,size:`sm`}),(0,_.jsxs)(`span`,{className:`flex min-w-0 flex-col`,children:[(0,_.jsx)(`span`,{className:`truncate text-sm font-semibold`,children:e}),(0,_.jsx)(`span`,{className:`truncate text-xs text-sheen-fg-muted`,children:t})]})]})]})}function w({paused:e,onChange:t,label:n}){return(0,_.jsxs)(i,{variant:`glass`,size:`sm`,className:`rounded-sheen-full`,onClick:()=>t(!e),children:[e?(0,_.jsx)(D,{}):(0,_.jsx)(E,{}),e?`Play ${n}`:`Pause ${n}`]})}function T(){let e=a(),[t,n]=(0,g.useState)(!1),[r,i]=(0,g.useState)(!1);return(0,_.jsxs)(c,{eyebrow:`Effect`,title:`Marquee`,description:`An endless, seamless strip of logos or testimonials. It eases to a stop under the mouse or keyboard focus, has a Pause button, rests off-screen, runs the other way in right-to-left pages, and holds still when reduced motion is on.`,source:`theme/src/components/marquee/marquee.tsx`,children:[(0,_.jsx)(f,{label:`Marquee demo`,story:()=>m(()=>import(`./ShowcaseStage.marquee-EANT8_Pt.js`),[]),initial:{running:!1},minHeight:`15rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!`,children:(e,t)=>(0,_.jsx)(y,{scene:e,ctx:t})}),(0,_.jsx)(d,{title:`Logo cloud`,description:`The list is read once by screen readers and is in the tab order once. The copies that fill the strip are hidden from both, but stay clickable. Tab to a logo that is off to the side and it glides into the middle. The Pause button sits below the strip and comes first in the tab order.`,stageClassName:`min-h-48 px-0 sm:px-0`,code:`
import { Marquee } from "@sheenui/theme";

const brands = [
  { name: "Acme", href: "https://example.com/acme", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><circle cx="12" cy="12" r="10" fill="currentColor" /></svg> },
  { name: "Globex", href: "https://example.com/globex", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" /></svg> },
  { name: "Initech", href: "https://example.com/initech", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><path d="M12 2l10 18H2z" fill="currentColor" /></svg> },
];

export function Example() {
  return (
    <Marquee listLabel="Customers" speed={36} gap={48}>
      {brands.map((brand) => (
        <a
          key={brand.name}
          href={brand.href}
          className="flex min-h-11 items-center gap-2 rounded-sheen-sm px-2 text-lg font-semibold text-sheen-fg-muted hover:text-sheen-fg"
        >
          <brand.Logo className="size-6" />
          {brand.name}
        </a>
      ))}
    </Marquee>
  );
}`,children:(0,_.jsx)(o,{listLabel:`Customers`,speed:36,gap:48,children:b.map((e,t)=>(0,_.jsx)(x,{name:e,index:t},e))})}),(0,_.jsxs)(d,{title:`Testimonials in glass`,description:`Level-1 glass items (tint, rim and light, no blur of their own) keep a moving strip cheap: a blurred card re-blurs its backdrop on every frame it moves, and a dozen in view would blow the glass budget. Put a blurred level (glass-2) on the items and the edges fade card by card instead, each card masked on its own glass element so its blur keeps working (a mask on the strip would switch it off). Both rows share one Pause button.`,stageClassName:`min-h-96 flex-col gap-2 px-0 sm:px-0`,code:`
import { useState } from "react";
import { Button, Marquee } from "@sheenui/theme";

const reviews = [
  { name: "Asha", text: "Best docs I have read this year." },
  { name: "Ravi", text: "Dropped into our app in an afternoon." },
  { name: "Meera", text: "The glass looks great in dark mode." },
];

function Review({ name, text }: (typeof reviews)[number]) {
  return (
    <figure>
      <blockquote className="text-sm">{text}</blockquote>
      <figcaption className="mt-2 text-xs text-sheen-fg-muted">{name}</figcaption>
    </figure>
  );
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Marquee
        listLabel="What people say"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Marquee
        reverse
        speed={30}
        listLabel="More reviews"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play reviews" : "Pause reviews"}
      </Button>
    </>
  );
}`,children:[(0,_.jsx)(o,{listLabel:`What people say`,paused:t,controls:!1,itemClassName:`glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72`,children:S.map(([e,t,n])=>(0,_.jsx)(C,{name:e,role:t,quote:n},e))}),(0,_.jsx)(o,{reverse:!0,speed:30,listLabel:`More reviews`,paused:t,controls:!1,itemClassName:`glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72`,children:[...S].reverse().map(([e,t,n])=>(0,_.jsx)(C,{name:e,role:t,quote:n},e))}),!e&&(0,_.jsx)(`div`,{className:`flex w-full justify-end px-3 sm:px-4`,children:(0,_.jsx)(w,{paused:t,onChange:n,label:`reviews`})})]}),(0,_.jsxs)(d,{title:`Vertical`,description:`Columns scroll at different speeds and directions. Give a vertical marquee a height; with reduced motion it keeps that height and scrolls instead.`,stageClassName:`flex-col gap-3 p-3 sm:p-6`,code:`
import { useState } from "react";
import { Button, Marquee } from "@sheenui/theme";

const items = ["Fast", "Accessible", "Themeable", "Typed", "Small"];

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Marquee vertical speed={28} paused={paused} controls={false} className="h-[28rem]" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical reverse speed={22} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical speed={34} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
      </div>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play columns" : "Pause columns"}
      </Button>
    </>
  );
}`,children:[(0,_.jsx)(`div`,{className:`grid w-full gap-4 sm:grid-cols-3`,children:[0,1,2].map(e=>(0,_.jsx)(o,{vertical:!0,reverse:e===1,speed:[28,22,34][e],gap:16,paused:r,controls:!1,listLabel:`Reviews, column ${e+1}`,className:e===0?`h-[28rem]`:`hidden h-[28rem] sm:flex`,itemClassName:`glass-1 w-full rounded-sheen-lg p-5`,children:S.slice(e*2).concat(S.slice(0,e*2)).map(([e,t,n])=>(0,_.jsx)(C,{name:e,role:t,quote:n},e))},e))}),!e&&(0,_.jsx)(`div`,{className:`flex w-full justify-end`,children:(0,_.jsx)(w,{paused:r,onChange:i,label:`columns`})})]}),(0,_.jsx)(u,{of:h}),(0,_.jsx)(l,{rows:[[`Tab`,`Reach the Pause / Play button first, then the real items.`],[`Enter / Space`,`Pause or resume the strip.`]]}),(0,_.jsx)(s,{items:[`Mouse over it, or keyboard focus inside it, eases it to a stop (and back up after); focusing an off-screen item glides it into view.`,`The strip has a Pause / Play button (WCAG 2.2.2). The list is rendered once for assistive tech; the repeated copies are aria-hidden and out of the tab order. listLabel names the list.`,`Under reduced motion it does not move, and the copies, the edge fade and the button are dropped.`]})]})}function E(){return(0,_.jsxs)(`svg`,{"aria-hidden":!0,viewBox:`0 0 16 16`,fill:`currentColor`,className:`size-3.5`,children:[(0,_.jsx)(`rect`,{x:`3.5`,y:`2.5`,width:`3`,height:`11`,rx:`1`}),(0,_.jsx)(`rect`,{x:`9.5`,y:`2.5`,width:`3`,height:`11`,rx:`1`})]})}function D(){return(0,_.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 16 16`,fill:`currentColor`,className:`size-3.5`,children:(0,_.jsx)(`path`,{d:`M4.5 2.9v10.2a1 1 0 0 0 1.53.85l8.1-5.1a1 1 0 0 0 0-1.7l-8.1-5.1A1 1 0 0 0 4.5 2.9Z`})})}export{T as default};