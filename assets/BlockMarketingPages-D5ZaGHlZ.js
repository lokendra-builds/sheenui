import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{i as n}from"./BlockStages.marketing-CqA_tjs2.js";import{i as r,n as i,o as a,r as o}from"./Page-BRuP8nt1.js";import{t as s}from"./Example-DaSezASZ.js";import{n as c}from"./site-B6UYeMYd.js";import{t as l}from"./lazy-block-BfzH_8EP.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`features`,`FeatureGridItem[]`,``,"Lists the cards, which render in reading order (`FeatureGridItem[]`).",!0],[`eyebrow`,`ReactNode`,``,"Shows a small label above the title (`ReactNode`).",!1],[`title`,`ReactNode`,``,"Sets the section heading (`ReactNode`).",!1],[`description`,`ReactNode`,``,"Sets the line under the heading (`ReactNode`).",!1],[`columns`,`2 | 3 | 4`,`3`,"Columns on a wide block (`2 | 3 | 4`). The grid follows the block's own width, so it steps down to two and then one column.",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Level of the section heading (`1` to `6`); the card headings sit one level below. `"none"` renders plain text, no headings.',!1],[`labels`,`Partial<FeatureGridLabels>`,`defaultFeatureGridLabels`,'Every other string, for translation: `labels={{ region: "…" }}`; omitted keys keep the English of `defaultFeatureGridLabels`. All 2 keys of `FeatureGridLabels` are listed in the key table under the props table.',!1,{type:`FeatureGridLabels`,const:`defaultFeatureGridLabels`,keys:[[`region`,`Features`],[`learnMore`,`Learn more`]]}],[`className`,`string`,``,"Adds extra classes to the section (`string`).",!1]];e();var f=t();l(()=>u(()=>import(`./faq-section-7mhPdVJJ.js`).then(e=>e.FaqSection),[]),{minHeight:`24rem`});var p=l(()=>u(()=>import(`./feature-grid-BcrSIfx7.js`).then(e=>e.FeatureGrid),[]),{minHeight:`24rem`});l(()=>u(()=>import(`./hero-section-CD88Y2ls.js`).then(e=>e.HeroSection),[]),{minHeight:`24rem`}),l(()=>u(()=>import(`./testimonials-BhwiUtfx.js`).then(e=>e.Testimonials),[]),{minHeight:`24rem`});var m=e=>(0,f.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,f.jsx)(`path`,{d:e})}),h=e=>`${c}${e.replace(/^\//,``)}`,g=[{id:`tokens`,title:`Design tokens`,description:`Colour, blur and motion live in CSS variables, so a theme is one file.`,icon:m(`M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5`)},{id:`a11y`,title:`Accessible by default`,description:`Built on Base UI: real keyboard support, roles and focus management.`,icon:m(`M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4`),highlight:!0},{id:`motion`,title:`Springs, not tweens`,description:`Interruptible motion with reduced-motion paths for every effect.`,icon:m(`M13 2 4 14h7l-1 8 9-12h-7l1-8Z`)},{id:`presets`,title:`Two presets`,description:`Liquid Glass and Aurora Neon, each in light and dark.`,icon:m(`M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z`)},{id:`copy`,title:`Copy the source`,description:`No runtime to depend on. Own the code, change what you need.`,icon:m(`M8 8h11v11H8zM5 16V5h11`)},{id:`tests`,title:`Tested`,description:`Every component runs in four looks with an axe check.`,icon:m(`m5 12 4 4 10-10`)}];function _(){return(0,f.jsxs)(i,{eyebrow:`Block`,title:`Feature grid`,description:`Icon, title and text on glass cards in two to four columns that follow the block's own width, with one optional highlight card that spans two columns and is lit from a corner.`,source:`theme/src/blocks/feature-grid.tsx`,children:[(0,f.jsx)(n,{}),(0,f.jsx)(s,{title:`Three columns with a highlight`,description:`highlight marks the card that matters most. A card with an href becomes one link with a single tab stop and a whole-card click target.`,stageClassName:`p-3 sm:p-8`,code:`
import { FeatureGrid, type FeatureGridItem } from "@sheenui/theme";

const glyph = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const features: FeatureGridItem[] = [
  { id: "tokens", title: "Design tokens", description: "Colour, blur and motion live in CSS variables.", icon: glyph("M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5") },
  { id: "a11y", title: "Accessible by default", description: "Real keyboard support, roles and focus management.", icon: glyph("m5 12 4 4 10-10"), highlight: true },
  { id: "motion", title: "Springs, not tweens", description: "Interruptible motion with reduced-motion paths.", icon: glyph("M13 2 4 14h7l-1 8 9-12h-7l1-8Z") },
];

export function Example() {
  return (
    <FeatureGrid
      eyebrow="Why SheenUI"
      title="Everything a glass UI needs"
      description="One system for surfaces, motion and accessibility."
      features={features
        .slice(0, 3)
        .map((f) => (f.highlight ? { ...f, href: "/guides/accessible-glassmorphism" } : f))}
    />
  );
}`,children:(0,f.jsx)(p,{headingLevel:`none`,eyebrow:`Why SheenUI`,title:`Everything a glass UI needs`,description:`One system for surfaces, motion and accessibility.`,features:g.slice(0,3).map(e=>e.highlight?{...e,href:h(`/guides/accessible-glassmorphism`)}:e)})}),(0,f.jsx)(s,{title:`Four columns`,description:`columns={4} gives a four-up row on a wide block and steps down to three, two and one as the block narrows (container queries, so it works in a sidebar layout too).`,stageClassName:`p-3 sm:p-8`,code:`
import { FeatureGrid } from "@sheenui/theme";

export function Example() {
  return (
    <FeatureGrid
      columns={4}
      title="Small parts, big range"
      features={[
        { id: "a", title: "Inputs", description: "Fields that share one height scale." },
        { id: "b", title: "Overlays", description: "Dialogs, drawers and menus." },
        { id: "c", title: "Charts", description: "Every chart has a table twin." },
        { id: "d", title: "Blocks", description: "Pages assembled from the parts." },
      ]}
    />
  );
}`,children:(0,f.jsx)(p,{headingLevel:`none`,columns:4,title:`Small parts, big range`,features:[{id:`a`,title:`Inputs`,description:`Fields that share one height scale.`},{id:`b`,title:`Overlays`,description:`Dialogs, drawers and menus.`},{id:`c`,title:`Charts`,description:`Every chart has a table twin.`},{id:`d`,title:`Blocks`,description:`Pages assembled from the parts.`}]})}),(0,f.jsx)(o,{of:d}),(0,f.jsx)(a,{rows:[[`Tab`,`Cards without an href are not stops. A card with an href has one link.`],[`Enter`,`Follow the focused card's link.`]]}),(0,f.jsx)(r,{notes:[`A <section> named by its heading (labels.region when there is no title); card titles are headings one level below it.`,`A card's link is named by 'Learn more' plus the card's title, so a list of links is not a list of identical names.`,`Icons are aria-hidden. The highlight card is also larger and first in its row, so nothing relies on colour.`,`Cards rise on a spring when scrolled into view; reduced motion keeps a short fade.`]})]})}export{_ as default};