import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{r as i}from"./toast-PePh6sao.js";import{t as a}from"./BlockStages.marketing-DYS_HwJw.js";import{i as o,n as s,o as c,r as l}from"./Page-BAL5Idhy.js";import{t as u}from"./Example-BPfHvEYD.js";import{t as d}from"./lazy-block-BfzH_8EP.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=[[`children`,`ReactNode`,``,"The announcement text (`ReactNode`). Keep it to a sentence; it is static copy, not a live countdown.",!0],[`tone`,`AnnouncementTone`,`"accent"`,'The semantic colour and icon (`"accent" | "info" | "success" | "warning" | "danger" | "neutral"`). The words carry the meaning; the colour only lights the edge.',!1],[`link`,`AnnouncementLink`,``,"A link after the text (`AnnouncementLink`).",!1],[`icon`,`ReactNode`,``,"Replaces the tone's icon (`ReactNode`); it is `aria-hidden`. Pass `null` for none.",!1],[`dismissible`,`boolean`,`true`,"Show the dismiss button (`boolean`).",!1],[`open`,`boolean`,``,"Controls whether the banner is shown (`boolean`). Use with `onOpenChange`; leave it out to let the block keep the state.",!1],[`defaultOpen`,`boolean`,`true`,"Whether the banner is shown at first when uncontrolled (`boolean`). Pass `false` when you have already stored that this visitor dismissed it.",!1],[`onOpenChange`,`((open: boolean) => void)`,``,"Called whenever the banner is shown or hidden (`(open: boolean) => void`).",!1],[`onDismiss`,`(() => void)`,``,"Called once when the visitor presses dismiss (`() => void`). The block stores nothing: save the choice here (a cookie, localStorage, your account settings) and pass `defaultOpen={false}` next time.",!1],[`restoreFocusTo`,`RefObject<HTMLElement | null>`,``,"Where focus goes when the banner is dismissed (`RefObject<HTMLElement | null>`). Without it, focus moves to the next focusable element after the banner, or to the `<main>` landmark when there is none.",!1],[`labels`,`Partial<AnnouncementBannerLabels>`,`defaultAnnouncementBannerLabels`,'Every other string, for translation: `labels={{ region: "…" }}`; omitted keys keep the English of `defaultAnnouncementBannerLabels`. All 3 keys of `AnnouncementBannerLabels` are listed in the key table under the props table.',!1,{type:`AnnouncementBannerLabels`,const:`defaultAnnouncementBannerLabels`,keys:[[`region`,`Announcement`],[`dismiss`,`Dismiss announcement`],[`dismissed`,`Announcement dismissed`]]}],[`className`,`string`,``,"Adds extra classes to the banner (`string`).",!1]],m=e(t()),h=n(),g=d(()=>f(()=>import(`./announcement-banner-B9G8vRh-.js`).then(e=>e.AnnouncementBanner),[]),{minHeight:`24rem`});d(()=>f(()=>import(`./contact-form-BUIEL7EF.js`).then(e=>e.ContactForm),[]),{minHeight:`24rem`}),d(()=>f(()=>import(`./not-found-page-CL8Jt2b3.js`).then(e=>e.NotFound),[]),{minHeight:`24rem`}),d(()=>f(()=>import(`./site-footer-CxdNf__b.js`).then(e=>e.SiteFooter),[]),{minHeight:`24rem`}),d(()=>f(()=>import(`./BlockMarketingPages2.hook-form-Lwpw_DKa.js`).then(e=>e.HookFormDemo),[]),{minHeight:`30rem`});var _=[`accent`,`info`,`success`,`warning`,`danger`,`neutral`];function v(){let e=i(),[t,n]=(0,m.useState)(!0);return(0,h.jsxs)(s,{eyebrow:`Block`,title:`Announcement banner`,description:`A dismissible top banner on glass with a tone, a link and static copy. It stores nothing: it reports the dismissal through a callback so you can remember it yourself.`,source:`theme/src/blocks/announcement-banner.tsx`,children:[(0,h.jsx)(a,{}),(0,h.jsx)(u,{title:`Remember the dismissal yourself`,stageClassName:`min-h-48 p-3 sm:p-8`,description:`Controlled with open and onOpenChange; onDismiss fires once when the visitor presses the button, which is where you save it (a cookie, localStorage or an account setting) and pass defaultOpen={false} next time.`,controls:(0,h.jsx)(r,{variant:`glass`,size:`sm`,onClick:()=>n(!0),disabled:t,children:`Show again`}),code:`
import { useState } from "react";
import { AnnouncementBanner } from "@sheenui/theme";

// Your own storage: the banner only reports the dismissal.
const remember = () => window.localStorage.setItem("banner-v2", "dismissed");

export function Example() {
  const [open, setOpen] = useState(true);
  return (
    <AnnouncementBanner
      open={open}
      onOpenChange={setOpen}
      onDismiss={remember}
      link={{ label: "Read the notes", href: "/changelog" }}
    >
      Version 2 is out: new blocks and a faster build.
    </AnnouncementBanner>
  );
}`,children:(0,h.jsx)(g,{open:t,onOpenChange:n,onDismiss:()=>e.info(`Dismissed`,`Save this choice in your own storage.`),link:{label:`Read the notes`,href:`https://example.com/changelog`},children:`Version 2 is out: new blocks and a faster build.`})}),(0,h.jsx)(u,{title:`Tones`,stageClassName:`p-3 sm:p-8`,description:`The words carry the meaning; the tone only lights the edge and picks the icon. Set dismissible={false} for a notice that must stay.`,code:`
import { AnnouncementBanner, type AnnouncementTone } from "@sheenui/theme";

const tones: AnnouncementTone[] = ["accent", "info", "success", "warning", "danger", "neutral"];

export function Example() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tones.map((tone) => (
        <AnnouncementBanner key={tone} tone={tone} dismissible={tone === "accent"}>
          This is a {tone} announcement.
        </AnnouncementBanner>
      ))}
    </div>
  );
}`,children:(0,h.jsx)(`div`,{className:`grid w-full gap-3`,children:_.map(e=>(0,h.jsxs)(g,{tone:e,dismissible:e===`accent`,children:[`This is a `,e,` announcement.`]},e))})}),(0,h.jsx)(l,{of:p}),(0,h.jsx)(c,{rows:[[`Tab`,`The link, then the dismiss button.`],[`Enter / Space on dismiss`,`Dismiss the banner and call onDismiss.`]]}),(0,h.jsx)(o,{notes:[`A labelled group (labels.region), not a landmark and deliberately not a live region, so it is not read out on every page load. Dismissing moves focus on and announces it politely.`,`Tone is never the only signal: the text says it and the icon is aria-hidden. Keep the copy static; a live countdown would be a moving target for assistive tech.`,`The dismiss button has an accessible name and a 44 px target. The banner stores nothing, so there is no hidden persistence to explain.`,`It slides up by transform and fades on its own surface, faster on the way out. Reduced motion: a short fade.`]})]})}export{v as default};