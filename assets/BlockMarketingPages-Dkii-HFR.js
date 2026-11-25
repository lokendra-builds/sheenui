import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{r as n}from"./BlockStages.marketing-DYS_HwJw.js";import{i as r,n as i,o as a,r as o}from"./Page-DQ8sr8qt.js";import{t as s}from"./Example-DMEbQwm9.js";import{t as c}from"./lazy-block-BfzH_8EP.js";import{t as l}from"./preload-helper-BrmCrVM7.js";var u=[[`items`,`FaqItem[]`,``,"Lists the questions, which render in the order given (`FaqItem[]`).",!0],[`eyebrow`,`ReactNode`,``,"Shows a small label above the title (`ReactNode`).",!1],[`title`,`ReactNode`,``,"Sets the section heading (`ReactNode`).",!1],[`description`,`ReactNode`,``,"Sets the line under the heading (`ReactNode`).",!1],[`footer`,`ReactNode`,``,'Content under the heading or under the list, for a "still stuck?" line and a link (`ReactNode`).',!1],[`layout`,`"split" | "stacked"`,`"stacked"`,'`"stacked"` centers the heading above the list; `"split"` puts the heading and the footer beside the list on a wide block.',!1],[`variant`,`"glass" | "separated"`,`"glass"`,'Surface of the list: `"glass"` is one glass card, `"separated"` gives each question its own card.',!1],[`multiple`,`boolean`,`false`,"Let several answers be open at once (`boolean`).",!1],[`value`,`string[]`,``,"Controls which items are open (`string[]` of item ids). Use with `onValueChange`.",!1],[`defaultValue`,`string[]`,``,"The items open at first when uncontrolled (`string[]`).",!1],[`onValueChange`,`((value: string[]) => void)`,``,"Called with the open item ids whenever one opens or closes (`(value: string[]) => void`).",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the section heading (`1` to `6`); the questions sit one level below. `"none"` renders plain text, no headings.',!1],[`labels`,`Partial<FaqSectionLabels>`,`defaultFaqSectionLabels`,'Every other string, for translation: `labels={{ region: "…" }}`; omitted keys keep the English of `defaultFaqSectionLabels`. Its only key is listed in the key table under the props table.',!1,{type:`FaqSectionLabels`,const:`defaultFaqSectionLabels`,keys:[[`region`,`Frequently asked questions`]]}],[`className`,`string`,``,"Adds extra classes to the section (`string`).",!1]];e();var d=t(),f=c(()=>l(()=>import(`./faq-section-BhWDeddX.js`).then(e=>e.FaqSection),[]),{minHeight:`24rem`});c(()=>l(()=>import(`./feature-grid-CNgsJkYZ.js`).then(e=>e.FeatureGrid),[]),{minHeight:`24rem`}),c(()=>l(()=>import(`./hero-section-BW7Bvb9L.js`).then(e=>e.HeroSection),[]),{minHeight:`24rem`}),c(()=>l(()=>import(`./testimonials-DtF2DIV2.js`).then(e=>e.Testimonials),[]),{minHeight:`24rem`});var p=[{id:`license`,question:`What licence is SheenUI under?`,answer:`MIT. Copy the source into your project and change whatever you need.`},{id:`react`,question:`Which React versions work?`,answer:`React 19. Components start with 'use client' where they need the browser, so they work in Next.js and Vite.`},{id:`a11y`,question:`How accessible is it?`,answer:(0,d.jsx)(`p`,{children:`Built on Base UI, with keyboard support, visible focus, 44 px touch targets and a reduced-motion path for every effect. Each component runs an axe check in four looks.`}),answerText:`Built on Base UI, with keyboard support, visible focus, 44 px touch targets and a reduced-motion path for every effect. Each component runs an axe check in four looks.`},{id:`theme`,question:`Can I change the colours?`,answer:`Yes. Everything reads --sheen-* tokens, so a theme is a handful of CSS variables.`}];function m(){return(0,d.jsxs)(i,{eyebrow:`Block`,title:`FAQ section`,description:`An accordion of questions on glass with find-in-page that opens the matching answer, and a faqPageJsonLd helper that returns the schema.org FAQPage object for the same questions.`,source:`theme/src/blocks/faq-section.tsx`,children:[(0,d.jsx)(n,{}),(0,d.jsx)(s,{title:`Stacked`,description:`Press Ctrl or Cmd + F and search for 'Base UI': the closed answer opens. defaultValue opens an item at first; multiple lets several stay open.`,stageClassName:`p-3 sm:p-8`,code:`
import { FaqSection, type FaqItem } from "@sheenui/theme";

const items: FaqItem[] = [
  { id: "license", question: "What licence is SheenUI under?", answer: "MIT. Copy the source and change whatever you need." },
  { id: "react", question: "Which React versions work?", answer: "React 19." },
  { id: "theme", question: "Can I change the colours?", answer: "Yes. Everything reads --sheen-* tokens." },
];

export function Example() {
  return <FaqSection title="Questions, answered" items={items} defaultValue={["license"]} />;
}`,children:(0,d.jsx)(f,{headingLevel:`none`,title:`Questions, answered`,items:p,defaultValue:[`license`]})}),(0,d.jsx)(s,{title:`Split layout and structured data`,description:`layout='split' keeps the heading and a footer beside the list. faqPageJsonLd(items) returns the FAQPage object: render it into a script tag yourself (it never touches the document), and keep its text equal to what the page shows.`,stageClassName:`p-3 sm:p-8`,code:`
import { FaqSection, faqPageJsonLd, type FaqItem } from "@sheenui/theme";

const items: FaqItem[] = [
  { id: "license", question: "What licence is SheenUI under?", answer: "MIT." },
  {
    id: "a11y",
    question: "How accessible is it?",
    answer: <p>Keyboard support, visible focus and a reduced-motion path.</p>,
    answerText: "Keyboard support, visible focus and a reduced-motion path.",
  },
];

export function Example() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)) }} />
      <FaqSection
        layout="split"
        variant="separated"
        title="Still curious?"
        description="The short answers."
        footer={<a href="https://example.com/contact">Ask us something else</a>}
        items={items}
      />
    </>
  );
}`,children:(0,d.jsx)(f,{headingLevel:`none`,layout:`split`,variant:`separated`,title:`Still curious?`,description:`The short answers.`,footer:(0,d.jsx)(`a`,{className:`font-semibold text-sheen-accent underline underline-offset-4`,href:`https://example.com/contact`,children:`Ask us something else`}),items:p.slice(0,3)})}),(0,d.jsx)(o,{of:u}),(0,d.jsx)(a,{rows:[[`Tab`,`Move between the questions.`],[`Enter / Space`,`Open or close the focused question.`],[`Arrow Down / Arrow Up`,`Move to the next or previous question.`],[`Home / End`,`First or last question.`]]}),(0,d.jsx)(r,{notes:[`A <section> named by its heading; each question is a button inside a heading one level below it, with aria-expanded and aria-controls.`,`Closed answers use hidden='until-found', so the browser's find-in-page opens the matching one.`,`faqPageJsonLd only returns an object. Items whose answer is not a string and that have no answerText are left out, because JSON-LD answers are plain text.`,`The list is one glass card ('glass') or one card per question ('separated'); the open height animates in about 220 ms and is skipped under reduced motion.`]})]})}export{m as default};