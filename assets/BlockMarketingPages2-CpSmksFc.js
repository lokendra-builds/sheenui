import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{t as n}from"./input-DALTA051.js";import{o as r}from"./BlockStages.marketing-DYS_HwJw.js";import{i,n as a,o,r as s}from"./Page-BAL5Idhy.js";import{t as c}from"./Example-BPfHvEYD.js";import{n as l}from"./site-B6UYeMYd.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`code`,`string`,`"404"`,"The big code (`string`). Each `0` is drawn as a glass ring. It is decorative: `labels.codeLabel` is what is read aloud.",!1],[`action`,`NotFoundAction`,``,"The main way out, usually back home (`NotFoundAction`).",!1],[`search`,`ReactNode`,``,"A slot for your search field (`ReactNode`), shown under the text: a `Input`, a `Combobox` or a command palette trigger. The block does not search for you.",!1],[`links`,`NotFoundLink[]`,`[]`,"Suggested destinations (`NotFoundLink[]`).",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the heading (`1` to `6`); `"none"` renders plain text. A 404 page\'s heading is its `h1`, so a real page passes `headingLevel={1}`.',!1],[`labels`,`Partial<NotFoundLabels>`,`defaultNotFoundLabels`,'Every other string, for translation: `labels={{ title: "…" }}`; omitted keys keep the English of `defaultNotFoundLabels`. All 4 keys of `NotFoundLabels` are listed in the key table under the props table.',!1,{type:`NotFoundLabels`,const:`defaultNotFoundLabels`,keys:[[`title`,`This page has drifted off`],[`description`,`The address may be mistyped, or the page may have moved. Search for what you need, or pick up from one of these.`],[`codeLabel`,`Error 404`],[`linksTitle`,`Popular places`]]}],[`className`,`string`,``,"Adds extra classes to the section (`string`).",!1]];e();var p=t();u(()=>d(()=>import(`./announcement-banner-B9G8vRh-.js`).then(e=>e.AnnouncementBanner),[]),{minHeight:`24rem`}),u(()=>d(()=>import(`./contact-form-BUIEL7EF.js`).then(e=>e.ContactForm),[]),{minHeight:`24rem`});var m=u(()=>d(()=>import(`./not-found-page-CL8Jt2b3.js`).then(e=>e.NotFound),[]),{minHeight:`24rem`});u(()=>d(()=>import(`./site-footer-CxdNf__b.js`).then(e=>e.SiteFooter),[]),{minHeight:`24rem`}),u(()=>d(()=>import(`./BlockMarketingPages2.hook-form-Lwpw_DKa.js`).then(e=>e.HookFormDemo),[]),{minHeight:`30rem`});var h=e=>`${l}${e.replace(/^\//,``)}`;function g(){return(0,p.jsxs)(a,{eyebrow:`Block`,title:`404 page`,description:`A not-found block: a large code whose zeros are glass rings, a plain explanation, a slot for your search field, a way back and a few suggested links.`,source:`theme/src/blocks/not-found-page.tsx`,children:[(0,p.jsx)(r,{}),(0,p.jsx)(c,{title:`With search and links`,stageClassName:`p-3 sm:p-8`,description:`The search slot takes any node: an Input, a Combobox or a command palette trigger. The block does not search for you. Remember to answer with HTTP status 404 from your router.`,code:`
import { Input, NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      headingLevel={1}
      action={{ label: "Back to home", href: "/" }}
      search={<Input type="search" aria-label="Search the site" placeholder="Search the docs" />}
      links={[
        { label: "Documentation", href: "/docs", description: "Guides and API reference" },
        { label: "Pricing", href: "/pricing", description: "Plans for every team" },
        { label: "Contact", href: "/contact", description: "Talk to a person" },
      ]}
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,action:{label:`Back to home`,href:h(`/`)},search:(0,p.jsx)(n,{type:`search`,"aria-label":`Search the site`,placeholder:`Search the docs`}),links:[{label:`Documentation`,href:h(`/docs/installation`),description:`Guides and API reference`},{label:`Components`,href:h(`/components/`),description:`Every part, with examples`},{label:`Blocks`,href:h(`/blocks/`),description:`Pages built from the parts`}]})}),(0,p.jsx)(c,{title:`A custom status code and your own wording`,stageClassName:`p-3 sm:p-8`,description:`code takes any short string (each 0 becomes a ring), and labels replaces every sentence, so the same block serves a 403 or a 500.`,code:`
import { NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      code="403"
      action={{ label: "Sign in", onClick: () => console.log("sign in") }}
      labels={{
        codeLabel: "Error 403",
        title: "You need permission for this page",
        description: "Sign in with an account that has access, or ask the owner to invite you.",
      }}
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,code:`403`,action:{label:`Sign in`,onClick:()=>void 0},labels:{codeLabel:`Error 403`,title:`You need permission for this page`,description:`Sign in with an account that has access, or ask the owner to invite you.`}})}),(0,p.jsx)(s,{of:f}),(0,p.jsx)(o,{rows:[[`Tab`,`The main action, your search field, then the suggested links in order.`],[`Enter`,`Follow a link or press the action.`]]}),(0,p.jsx)(i,{notes:[`A <section> named by its heading. A 404 page's heading is its h1: pass headingLevel={1}.`,`The large code is aria-hidden; labels.codeLabel ('Error 404') is read instead.`,`Suggested links are a labelled list of real anchors with 44 px targets. The zeros are glass surfaces (keep to two or three), and nothing loops.`,`Digits settle on a spring and the rings drop in once. Reduced motion removes the movement.`]})]})}export{g as default};