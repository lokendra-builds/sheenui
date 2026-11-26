import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./badge-AQ2Afjwl.js";import{t as r}from"./button-8i4LQrEk.js";import{n as i,r as a,t as o}from"./ShowcaseStage.spotlight-card.scene-D2UImT0K.js";import{i as s,n as c,o as l,r as u}from"./Page-BAL5Idhy.js";import{t as d}from"./Example-BPfHvEYD.js";import{t as f}from"./ShowcaseStage-qzIATPiV.js";import{t as p}from"./preload-helper-BrmCrVM7.js";var m=[[`color`,`string`,`a soft accent`,`Colour of the glow inside the card (any CSS colour).`,!1],[`level`,`2 | 1 | 3`,`2`,`Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque.`,!1],[`tint`,`boolean`,`false`,`Tints the surface with the accent colour.`,!1],[`diameter`,`number`,`the card's width, at most 380px`,`Sets the diameter of the glow in px.`,!1],[`rimColor`,`string`,`the accent`,`Sets the colour of the light on the rim.`,!1],[`rim`,`boolean`,`true`,`Makes the rim light up near the pointer.`,!1]];e();var h=t(),g=[{title:`Instant previews`,body:`Every branch gets its own URL, ready before the review starts.`,icon:(0,h.jsx)(y,{})},{title:`Edge caching`,body:`Pages are served from the region closest to each visitor.`,icon:(0,h.jsx)(b,{})},{title:`Zero-config TLS`,body:`Certificates are issued and renewed for you, on every domain.`,icon:(0,h.jsx)(x,{})},{title:`Rollbacks`,body:`Go back to any earlier deploy in one click, with no rebuild.`,icon:(0,h.jsx)(S,{})},{title:`Live logs`,body:`Stream function logs as they happen, filtered by route.`,icon:(0,h.jsx)(C,{})},{title:`Team roles`,body:`Owners, members and viewers, with audit history for each.`,icon:(0,h.jsx)(w,{})}];function _(){return(0,h.jsxs)(c,{eyebrow:`Effect`,title:`Spotlight card`,description:`A glass card lit by a soft glow that follows the pointer, with a rim that catches the light. The position goes straight into CSS variables, once per frame at most: no React state, no re-renders.`,source:`theme/src/components/spotlight/spotlight.tsx`,children:[(0,h.jsx)(f,{label:`Spotlight card demo`,story:()=>p(()=>import(`./ShowcaseStage.spotlight-card-M7s3EQ3y.js`),[]),initial:{at:null},minHeight:`16rem`,className:`[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!`,children:(e,t)=>(0,h.jsx)(o,{scene:e,ctx:t})}),(0,h.jsx)(d,{title:`Feature grid`,description:`In a SpotlightGroup every card shares the pointer, so the rims of neighboring cards light up as you move between them. On touch screens the glow rests near the top of each card.`,code:`
import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";

const features = [
  { title: "Fast", body: "Compositor-only animation.", icon: "⚡" },
  { title: "Accessible", body: "Keyboard and screen reader tested.", icon: "♿" },
  { title: "Themeable", body: "Tokens for every color.", icon: "🎨" },
];

export function Example() {
  return (
    <SpotlightGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <SpotlightCard key={feature.title} className="p-6">
          <span className="grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent">
            {feature.icon}
          </span>
          <h3 className="mt-4 font-semibold">{feature.title}</h3>
          <p className="mt-1 text-sm text-pretty text-sheen-fg-muted">{feature.body}</p>
        </SpotlightCard>
      ))}
    </SpotlightGroup>
  );
}`,children:(0,h.jsx)(a,{className:`docs-flat grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3`,children:g.map(e=>(0,h.jsxs)(i,{className:`p-6`,children:[(0,h.jsx)(`span`,{className:`grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent [&>svg]:size-5`,children:e.icon}),(0,h.jsx)(`h3`,{className:`mt-4 font-semibold`,children:e.title}),(0,h.jsx)(`p`,{className:`mt-1 text-sm text-pretty text-sheen-fg-muted`,children:e.body})]},e.title))})}),(0,h.jsx)(d,{title:`Custom colors, as a link`,description:`Any CSS color works for the glow and the rim. Keyboard focus inside the card lights it too.`,code:`
import { Badge, Button, SpotlightCard } from "@sheenui/theme";

export function Example() {
  return (
    <SpotlightCard
      tint
      color="color-mix(in oklab, var(--sheen-accent-2) 18%, transparent)"
      rimColor="var(--sheen-accent-2)"
      className="flex w-full max-w-sm flex-col gap-4 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="pro" className="text-lg font-semibold">Pro</h3>
        <Badge tone="accent">Most popular</Badge>
      </div>
      <p className="text-4xl font-semibold tracking-tight">
        $24<span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
      </p>
      <ul className="flex flex-col gap-2 text-sm text-sheen-fg-muted">
        <li>Unlimited projects</li>
        <li>Preview deployments</li>
        <li>Priority support</li>
      </ul>
      <Button render={<a href="#pricing" />} fullWidth>
        Choose Pro
      </Button>
    </SpotlightCard>
  );
}`,children:(0,h.jsxs)(i,{tint:!0,color:`color-mix(in oklab, var(--sheen-accent-2) 18%, transparent)`,rimColor:`var(--sheen-accent-2)`,className:`flex w-full max-w-sm flex-col gap-4 p-6`,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,h.jsx)(`h3`,{id:`pro`,className:`text-lg font-semibold`,children:`Pro`}),(0,h.jsx)(n,{tone:`accent`,children:`Most popular`})]}),(0,h.jsxs)(`p`,{className:`text-4xl font-semibold tracking-tight`,children:[`$24`,(0,h.jsx)(`span`,{className:`text-sm font-normal text-sheen-fg-muted`,children:`/mo`})]}),(0,h.jsxs)(`ul`,{className:`flex flex-col gap-2 text-sm text-sheen-fg-muted`,children:[(0,h.jsx)(`li`,{children:`Unlimited projects`}),(0,h.jsx)(`li`,{children:`Preview deployments`}),(0,h.jsx)(`li`,{children:`Priority support`})]}),(0,h.jsx)(r,{render:(0,h.jsx)(`a`,{href:`#pricing`}),fullWidth:!0,children:`Choose Pro`})]})}),(0,h.jsx)(u,{title:`SpotlightCard props`,of:m}),(0,h.jsx)(u,{title:`SpotlightGroup props`,rows:[[`...props`,`div props`,``,`A plain div that shares one pointer with every SpotlightCard inside it. Lay the cards out with className.`]]}),(0,h.jsx)(l,{rows:[[`Tab`,`Not focusable: a plain card is not focusable. Keyboard focus inside the card lights it too, so interactive children are never in the dark.`]]}),(0,h.jsx)(s,{items:[`No role of its own; reading order is the DOM order. SpotlightGroup shares one pointer listener across the cards.`,`The glow and rim are aria-hidden and hidden in forced colors. On touch screens the glow is static.`]})]})}function v({children:e}){return(0,h.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,className:`size-5`,children:e})}function y(){return(0,h.jsx)(v,{children:(0,h.jsx)(`path`,{d:`M13 2 4 14h7l-1 8 9-12h-7Z`})})}function b(){return(0,h.jsxs)(v,{children:[(0,h.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,h.jsx)(`path`,{d:`M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18`})]})}function x(){return(0,h.jsxs)(v,{children:[(0,h.jsx)(`rect`,{x:`4`,y:`11`,width:`16`,height:`10`,rx:`2`}),(0,h.jsx)(`path`,{d:`M8 11V7a4 4 0 0 1 8 0v4`})]})}function S(){return(0,h.jsxs)(v,{children:[(0,h.jsx)(`path`,{d:`M3 12a9 9 0 1 0 3-6.7L3 8`}),(0,h.jsx)(`path`,{d:`M3 3v5h5`})]})}function C(){return(0,h.jsx)(v,{children:(0,h.jsx)(`path`,{d:`M3 12h4l3-8 4 16 3-8h4`})})}function w(){return(0,h.jsxs)(v,{children:[(0,h.jsx)(`circle`,{cx:`9`,cy:`8`,r:`3.5`}),(0,h.jsx)(`path`,{d:`M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6`})]})}export{_ as default};