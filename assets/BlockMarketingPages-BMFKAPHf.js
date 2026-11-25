import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./scene-DfT8LnQ9.js";import{r}from"./toast-PePh6sao.js";import{a as i}from"./BlockStages.marketing-DYS_HwJw.js";import{i as a,n as o,o as s,r as c}from"./Page-y_OVkLtr.js";import{t as l}from"./Example-B3x8pgFu.js";import{n as u}from"./site-B6UYeMYd.js";import{t as d}from"./lazy-block-BfzH_8EP.js";import{t as f}from"./preload-helper-BrmCrVM7.js";var p=[[`eyebrow`,`ReactNode`,``,"Small pill above the headline (`ReactNode`), for a release note or a category.",!1],[`title`,`ReactNode`,``,"The headline (`ReactNode`). Wrap a phrase in `<em>` to light it with the accent.",!0],[`description`,`ReactNode`,``,"Sets the lede that sits under the headline (`ReactNode`).",!1],[`primaryAction`,`HeroAction`,``,"The main call to action (`HeroAction`).",!1],[`secondaryAction`,`HeroAction`,``,"The quieter call to action next to it (`HeroAction`).",!1],[`media`,`ReactNode`,``,'A product shot, video or live demo shown in a glass frame (`ReactNode`). Below the copy when centered, beside it when `align="start"`.',!1],[`mediaClassName`,`string`,``,"Classes for the media frame (`string`), e.g. an aspect ratio.",!1],[`background`,`ReactNode`,``,"What sits behind the copy (`ReactNode`): pass a `SheenScene`, an image or your own art. Omit it for the built-in aurora of token colours; pass `null` for none. It is decorative and hidden from assistive technology.",!1],[`logos`,`HeroLogo[]`,``,"The logo strip under the hero (`HeroLogo[]`). It is a labelled list.",!1],[`align`,`"center" | "start"`,`"center"`,'Alignment of the copy: `"center"` stacks everything on the middle line, `"start"` aligns it to the start edge and puts `media` beside it.',!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the headline (`1` to `6`); `"none"` renders a paragraph with no heading role (for an example). A landing page\'s hero is usually its `h1`: pass `headingLevel={1}`.',!1],[`labels`,`Partial<HeroSectionLabels>`,`defaultHeroSectionLabels`,'Every other string, for translation: `labels={{ region: "…" }}`; omitted keys keep the English of `defaultHeroSectionLabels`. All 2 keys of `HeroSectionLabels` are listed in the key table under the props table.',!1,{type:`HeroSectionLabels`,const:`defaultHeroSectionLabels`,keys:[[`region`,`Introduction`],[`logosTitle`,`Trusted by teams at`]]}],[`className`,`string`,``,"Adds extra classes to the section (`string`).",!1]];e();var m=t();d(()=>f(()=>import(`./faq-section-BhWDeddX.js`).then(e=>e.FaqSection),[]),{minHeight:`24rem`}),d(()=>f(()=>import(`./feature-grid-CNgsJkYZ.js`).then(e=>e.FeatureGrid),[]),{minHeight:`24rem`});var h=d(()=>f(()=>import(`./hero-section-BW7Bvb9L.js`).then(e=>e.HeroSection),[]),{minHeight:`24rem`});d(()=>f(()=>import(`./testimonials-DtF2DIV2.js`).then(e=>e.Testimonials),[]),{minHeight:`24rem`});var g=e=>`${u}scenes/${e}`,_=e=>`${u}${e.replace(/^\//,``)}`;function v(){let e=r();return(0,m.jsxs)(o,{eyebrow:`Block`,title:`Hero section`,description:`A landing-page hero: display headline, lede, calls to action, a product shot in a lit glass frame and a logo strip, over an aurora of token colours or a SheenScene of your own.`,source:`theme/src/blocks/hero-section.tsx`,children:[(0,m.jsx)(i,{}),(0,m.jsx)(l,{title:`Centered, over a scene`,description:`The background slot takes a SheenScene (or any image). The product shot sits in a glass frame with a pool of light under it. Wrap a phrase of the headline in <em> to light it with the accent.`,stageClassName:`p-0 sm:p-0`,code:`
import { HeroSection, SheenScene } from "@sheenui/theme";

export function Example() {
  return (
    <HeroSection
      headingLevel={1}
      eyebrow="New: every block, light and dark"
      title={<>Interfaces that <em>catch the light</em></>}
      description="A glass component library for React, built on Base UI, Tailwind v4 and Motion. Copy the source and make it yours."
      primaryAction={{ label: "Get started", href: "/docs/installation" }}
      secondaryAction={{ label: "Browse components", href: "/components" }}
      background={
        <SheenScene
          src="/scenes/studio-v2.webp"
          avifSrc="/scenes/studio-v2.avif"
          dim={0.75}
          priority
        />
      }
      media={
        <div className="grid aspect-[16/9] grid-cols-[28%_1fr] gap-3 p-3">
          <div className="rounded-sheen-lg bg-sheen-hover" />
          <div className="grid grid-rows-[auto_1fr] gap-3">
            <div className="h-10 rounded-sheen-lg bg-sheen-hover" />
            <div className="rounded-sheen-lg bg-sheen-hover" />
          </div>
        </div>
      }
      logos={[{ name: "Alder" }, { name: "Brightloom" }, { name: "Cobalt" }, { name: "Driftwood" }, { name: "Evergreen" }]}
    />
  );
}`,children:(0,m.jsx)(h,{headingLevel:`none`,eyebrow:`New: every block, light and dark`,title:(0,m.jsxs)(m.Fragment,{children:[`Interfaces that `,(0,m.jsx)(`em`,{children:`catch the light`})]}),description:`A glass component library for React, built on Base UI, Tailwind v4 and Motion. Copy the source and make it yours.`,primaryAction:{label:`Get started`,href:_(`/docs/installation`)},secondaryAction:{label:`Browse components`,href:_(`/components/`)},background:(0,m.jsx)(n,{src:g(`studio-v2.webp`),avifSrc:g(`studio-v2.avif`),dim:.75}),media:(0,m.jsxs)(`div`,{className:`grid aspect-[16/9] grid-cols-[28%_1fr] gap-3 p-3`,children:[(0,m.jsx)(`div`,{className:`rounded-sheen-lg bg-sheen-hover`}),(0,m.jsxs)(`div`,{className:`grid grid-rows-[auto_1fr] gap-3`,children:[(0,m.jsx)(`div`,{className:`h-10 rounded-sheen-lg bg-sheen-hover`}),(0,m.jsx)(`div`,{className:`rounded-sheen-lg bg-sheen-hover`})]})]}),logos:[{name:`Alder`},{name:`Brightloom`},{name:`Cobalt`},{name:`Driftwood`},{name:`Evergreen`}]})}),(0,m.jsx)(l,{title:`Start-aligned, with the built-in aurora`,description:`align='start' puts the copy at the start edge and the media beside it. Leave background out for the aurora; the actions can be buttons (onClick) as well as links.`,stageClassName:`p-0 sm:p-0`,code:`
import { HeroSection } from "@sheenui/theme";

export function Example() {
  return (
    <HeroSection
      align="start"
      title="Ship the dashboard, not the plumbing"
      description="Charts, tables and forms that already agree on spacing, focus and motion."
      primaryAction={{ label: "Start a project", onClick: () => console.log("start") }}
      secondaryAction={{ label: "Read the docs", href: "/docs/installation" }}
      media={
        <div className="grid aspect-[4/3] place-items-center p-6 text-sheen-fg-muted">Your product shot</div>
      }
    />
  );
}`,children:(0,m.jsx)(h,{headingLevel:`none`,align:`start`,title:`Ship the dashboard, not the plumbing`,description:`Charts, tables and forms that already agree on spacing, focus and motion.`,primaryAction:{label:`Start a project`,onClick:()=>e.info(`Start a project`,`Wire this to your sign-up.`)},secondaryAction:{label:`Read the docs`,href:_(`/docs/installation`)},media:(0,m.jsx)(`div`,{className:`grid aspect-[4/3] place-items-center p-6 text-sheen-fg-muted`,children:`Your product shot`})})}),(0,m.jsx)(c,{of:p}),(0,m.jsx)(s,{rows:[[`Tab`,`The calls to action in order, then whatever your media contains.`],[`Enter`,`Follow a link action or press a button action.`]]}),(0,m.jsx)(a,{notes:[`A <section> named by its headline (labels.region when headingLevel is 'none'). A landing page's hero is usually its h1: pass headingLevel={1}.`,`The background (aurora or SheenScene) is aria-hidden; the logo strip is a list labelled by labels.logosTitle and every logo has a text name.`,`Text and buttons rise by transform only; the frame fades in on itself. Reduced motion removes the movement.`,`Keep the headline over a calm part of your scene and raise dim until the lede reads at 4.5:1 in both themes.`]})]})}export{v as default};