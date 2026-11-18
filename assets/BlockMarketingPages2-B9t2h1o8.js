import"./rolldown-runtime-WkwZ5CU-.js";import{r as e}from"./demo-utils-DKtmFFFD.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{r}from"./toast-CiFfCngf.js";import{s as i}from"./BlockStages.marketing-CqA_tjs2.js";import{i as a,n as o,o as s,r as c}from"./Page-BRuP8nt1.js";import{t as l}from"./Example-DaSezASZ.js";import{t as u}from"./lazy-block-BfzH_8EP.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`brand`,`ReactNode`,``,"The logo and name at the start of the footer (`ReactNode`).",!1],[`description`,`ReactNode`,``,"A line about the product under the brand (`ReactNode`).",!1],[`columns`,`FooterColumn[]`,`[]`,"The link columns (`FooterColumn[]`). Each one is a `<nav>` named by its title.",!1],[`onSubscribe`,`((email: string) => void | Promise<void>)`,``,"Shows the newsletter form and is called with the trimmed email (`(email: string) => void | Promise<void>`). Return a promise to show the loading state; throw to show an error. Without it there is no form.",!1],[`socials`,`FooterSocial[]`,`[]`,"The social icon links (`FooterSocial[]`).",!1],[`copyright`,`ReactNode`,``,"The copyright line in the legal row (`ReactNode`).",!1],[`legalLinks`,`FooterLink[]`,`[]`,"The legal links in the legal row, for example privacy and terms (`FooterLink[]`).",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the column and newsletter headings (`1` to `6`); `"none"` renders plain text.',!1],[`labels`,`Partial<SiteFooterLabels>`,`defaultSiteFooterLabels`,'Every other string, for translation: `labels={{ newsletterTitle: "…" }}`; omitted keys keep the English of `defaultSiteFooterLabels`. All 10 keys of `SiteFooterLabels` are listed in the key table under the props table.',!1,{type:`SiteFooterLabels`,const:`defaultSiteFooterLabels`,keys:[[`newsletterTitle`,`Stay in the loop`],[`newsletterText`,`One short email when something ships. No spam, unsubscribe any time.`],[`email`,`Email address`],[`emailPlaceholder`,`you@example.com`],[`subscribe`,`Subscribe`],[`invalidEmail`,`Enter a valid email address.`],[`subscribed`,`Thanks. Check your inbox to confirm.`],[`genericError`,`Something went wrong. Try again.`],[`social`,`Social links`],[`legal`,`Legal`]]}],[`className`,`string`,``,"Adds extra classes to the `<footer>` (`string`).",!1]];t();var p=n();u(()=>d(()=>import(`./announcement-banner-PIYviNyn.js`).then(e=>e.AnnouncementBanner),[]),{minHeight:`24rem`}),u(()=>d(()=>import(`./contact-form-CYaEDdhD.js`).then(e=>e.ContactForm),[]),{minHeight:`24rem`}),u(()=>d(()=>import(`./not-found-page-DUEiuZmF.js`).then(e=>e.NotFound),[]),{minHeight:`24rem`});var m=u(()=>d(()=>import(`./site-footer-BOTykgr1.js`).then(e=>e.SiteFooter),[]),{minHeight:`24rem`});u(()=>d(()=>import(`./BlockMarketingPages2.hook-form-Dhgi06xe.js`).then(e=>e.HookFormDemo),[]),{minHeight:`30rem`});var h=[{id:`product`,title:`Product`,links:[{label:`Features`,href:`https://example.com/features`},{label:`Pricing`,href:`https://example.com/pricing`},{label:`Changelog`,href:`https://example.com/changelog`}]},{id:`resources`,title:`Resources`,links:[{label:`Documentation`,href:`https://example.com/docs`},{label:`Guides`,href:`https://example.com/guides`},{label:`Status`,href:`https://example.com/status`,external:!0}]},{id:`company`,title:`Company`,links:[{label:`About`,href:`https://example.com/about`},{label:`Careers`,href:`https://example.com/careers`},{label:`Contact`,href:`https://example.com/contact`}]}],g=e=>(0,p.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,p.jsx)(`path`,{d:e})}),_=[{id:`code`,label:`Source code`,href:`https://example.com/code`,icon:g(`m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14`)},{id:`chat`,label:`Community chat`,href:`https://example.com/chat`,icon:g(`M4 5h16v11H9l-5 4V5Z`)},{id:`feed`,label:`News feed`,href:`https://example.com/feed`,icon:g(`M5 19a1 1 0 1 0 0 .01M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14`)}];function v(){let t=r();return(0,p.jsxs)(o,{eyebrow:`Block`,title:`Site footer`,description:`A glass footer: brand and blurb, link columns that are navigation landmarks, a newsletter field with validation and a live confirmation, social icon links and a legal row.`,source:`theme/src/blocks/site-footer.tsx`,children:[(0,p.jsx)(i,{}),(0,p.jsx)(l,{title:`Full footer`,stageClassName:`p-3 sm:p-8`,description:`Try the newsletter field with a bad address, then a good one: the message under it is announced. Without onSubscribe the form is not rendered.`,code:`
import { SiteFooter, type FooterColumn } from "@sheenui/theme";

// Your call; throw to show the error under the field
async function subscribe(email: string) {
  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("We could not subscribe that address.");
}

const columns: FooterColumn[] = [
  { id: "product", title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }] },
  { id: "company", title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
];

export function Example() {
  return (
    <SiteFooter
      brand="Acme"
      description="Tools for small teams who like their software calm."
      columns={columns}
      onSubscribe={async (email) => {
        await subscribe(email);
      }}
      socials={[
        {
          id: "code",
          label: "Source code",
          href: "https://example.com/code",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
            </svg>
          ),
        },
      ]}
      copyright="© 2026 Acme, Inc."
      legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,brand:`Acme`,description:`Tools for small teams who like their software calm.`,columns:h,onSubscribe:async n=>{await e(900),t.info(`Subscribed`,n)},socials:_,copyright:`© 2026 Acme, Inc.`,legalLinks:[{label:`Privacy`,href:`https://example.com/privacy`},{label:`Terms`,href:`https://example.com/terms`}]})}),(0,p.jsx)(l,{title:`Minimal`,stageClassName:`p-3 sm:p-8`,description:`Every part is optional: a brand and a legal row make a short footer.`,code:`
import { SiteFooter } from "@sheenui/theme";

export function Example() {
  return (
    <SiteFooter
      brand="Acme"
      copyright="© 2026 Acme, Inc."
      legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
    />
  );
}`,children:(0,p.jsx)(m,{headingLevel:`none`,brand:`Acme`,copyright:`© 2026 Acme, Inc.`,legalLinks:[{label:`Privacy`,href:`https://example.com/privacy`},{label:`Terms`,href:`https://example.com/terms`}]})}),(0,p.jsx)(c,{of:f}),(0,p.jsx)(s,{rows:[[`Tab`,`Column links top to bottom, then the newsletter field and button, the social links and the legal links.`],[`Enter`,`Follow a link, or submit the newsletter form.`]]}),(0,p.jsx)(a,{notes:[`A <footer> (the page's contentinfo landmark). Each column is a <nav> named by its heading; with headingLevel 'none' the names fall away with the headings.`,`Social links are named by their label and their icons are aria-hidden. External links open a new tab with rel='noreferrer'.`,`The subscribe confirmation is a polite status region that is always in the page, so it is announced when its text appears.`,`Links and icon buttons grow to 44 px on touch devices. One glass panel holds everything, so there is one backdrop blur.`]})]})}export{v as default};