import { useState } from "react";
import { SheenScene, useToast } from "@sheenui/theme";
import type { FaqItem, FeatureGridItem, Testimonial } from "@sheenui/theme";

import { FaqSectionStage, FeatureGridStage, HeroSectionStage, TestimonialsStage } from "./BlockStages.marketing";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";
import { BASE_PATH } from "../seo/site";
import { lazyBlock } from "../layout/lazy-block";

const FaqSection = lazyBlock(() => import("../../../theme/src/blocks/faq-section").then((m) => m.FaqSection), {
  minHeight: "24rem",
});
const FeatureGrid = lazyBlock(() => import("../../../theme/src/blocks/feature-grid").then((m) => m.FeatureGrid), {
  minHeight: "24rem",
});
const HeroSection = lazyBlock(() => import("../../../theme/src/blocks/hero-section").then((m) => m.HeroSection), {
  minHeight: "24rem",
});
const Testimonials = lazyBlock(() => import("../../../theme/src/blocks/testimonials").then((m) => m.Testimonials), {
  minHeight: "24rem",
});

const glyph = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/* =====================================================================
 * Hero section
 * ===================================================================== */

const scene = (file: string) => `${BASE_PATH}scenes/${file}`;
/** A docs route as a real address under the site base (the Code panel shows the plain path). */
const site = (path: string) => `${BASE_PATH}${path.replace(/^\//, "")}`;

/** The "Hero section" docs page (/blocks/hero-section): live examples, props and notes. */
export function HeroSectionPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Hero section"
      description="A landing-page hero: display headline, lede, calls to action, a product shot in a lit glass frame and a logo strip, over an aurora of token colours or a SheenScene of your own."
      source="theme/src/blocks/hero-section.tsx"
    >
      <HeroSectionStage />
      <Example
        title="Centered, over a scene"
        description="The background slot takes a SheenScene (or any image). The product shot sits in a glass frame with a pool of light under it. Wrap a phrase of the headline in <em> to light it with the accent."
        stageClassName="p-0 sm:p-0"
        code={`
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
}`}
      >
        <HeroSection
          headingLevel="none"
          eyebrow="New: every block, light and dark"
          title={
            <>
              Interfaces that <em>catch the light</em>
            </>
          }
          description="A glass component library for React, built on Base UI, Tailwind v4 and Motion. Copy the source and make it yours."
          primaryAction={{ label: "Get started", href: site("/docs/installation") }}
          secondaryAction={{ label: "Browse components", href: site("/components/") }}
          background={<SheenScene src={scene("studio-v2.webp")} avifSrc={scene("studio-v2.avif")} dim={0.75} />}
          media={
            <div className="grid aspect-[16/9] grid-cols-[28%_1fr] gap-3 p-3">
              <div className="rounded-sheen-lg bg-sheen-hover" />
              <div className="grid grid-rows-[auto_1fr] gap-3">
                <div className="h-10 rounded-sheen-lg bg-sheen-hover" />
                <div className="rounded-sheen-lg bg-sheen-hover" />
              </div>
            </div>
          }
          logos={[
            { name: "Alder" },
            { name: "Brightloom" },
            { name: "Cobalt" },
            { name: "Driftwood" },
            { name: "Evergreen" },
          ]}
        />
      </Example>

      <Example
        title="Start-aligned, with the built-in aurora"
        description="align='start' puts the copy at the start edge and the media beside it. Leave background out for the aurora; the actions can be buttons (onClick) as well as links."
        stageClassName="p-0 sm:p-0"
        code={`
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
}`}
      >
        <HeroSection
          headingLevel="none"
          align="start"
          title="Ship the dashboard, not the plumbing"
          description="Charts, tables and forms that already agree on spacing, focus and motion."
          primaryAction={{
            label: "Start a project",
            onClick: () => toast.info("Start a project", "Wire this to your sign-up."),
          }}
          secondaryAction={{ label: "Read the docs", href: site("/docs/installation") }}
          media={<div className="grid aspect-[4/3] place-items-center p-6 text-sheen-fg-muted">Your product shot</div>}
        />
      </Example>

      <PropsTable of={PROPS.HeroSection} />
      <KeyboardTable
        rows={[
          ["Tab", "The calls to action in order, then whatever your media contains."],
          ["Enter", "Follow a link action or press a button action."],
        ]}
      />
      <A11yNotes
        notes={[
          "A <section> named by its headline (labels.region when headingLevel is 'none'). A landing page's hero is usually its h1: pass headingLevel={1}.",
          "The background (aurora or SheenScene) is aria-hidden; the logo strip is a list labelled by labels.logosTitle and every logo has a text name.",
          "Text and buttons rise by transform only; the frame fades in on itself. Reduced motion removes the movement.",
          "Keep the headline over a calm part of your scene and raise dim until the lede reads at 4.5:1 in both themes.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Feature grid
 * ===================================================================== */

const features: FeatureGridItem[] = [
  {
    id: "tokens",
    title: "Design tokens",
    description: "Colour, blur and motion live in CSS variables, so a theme is one file.",
    icon: glyph("M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5"),
  },
  {
    id: "a11y",
    title: "Accessible by default",
    description: "Built on Base UI: real keyboard support, roles and focus management.",
    icon: glyph("M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4"),
    highlight: true,
  },
  {
    id: "motion",
    title: "Springs, not tweens",
    description: "Interruptible motion with reduced-motion paths for every effect.",
    icon: glyph("M13 2 4 14h7l-1 8 9-12h-7l1-8Z"),
  },
  {
    id: "presets",
    title: "Two presets",
    description: "Liquid Glass and Aurora Neon, each in light and dark.",
    icon: glyph("M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"),
  },
  {
    id: "copy",
    title: "Copy the source",
    description: "No runtime to depend on. Own the code, change what you need.",
    icon: glyph("M8 8h11v11H8zM5 16V5h11"),
  },
  {
    id: "tests",
    title: "Tested",
    description: "Every component runs in four looks with an axe check.",
    icon: glyph("m5 12 4 4 10-10"),
  },
];

/** The "Feature grid" docs page (/blocks/feature-grid): live examples, props and notes. */
export function FeatureGridPage() {
  return (
    <Page
      eyebrow="Block"
      title="Feature grid"
      description="Icon, title and text on glass cards in two to four columns that follow the block's own width, with one optional highlight card that spans two columns and is lit from a corner."
      source="theme/src/blocks/feature-grid.tsx"
    >
      <FeatureGridStage />
      <Example
        title="Three columns with a highlight"
        description="highlight marks the card that matters most. A card with an href becomes one link with a single tab stop and a whole-card click target."
        stageClassName="p-3 sm:p-8"
        code={`
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
}`}
      >
        <FeatureGrid
          headingLevel="none"
          eyebrow="Why SheenUI"
          title="Everything a glass UI needs"
          description="One system for surfaces, motion and accessibility."
          features={features
            .slice(0, 3)
            .map((f) => (f.highlight ? { ...f, href: site("/guides/accessible-glassmorphism") } : f))}
        />
      </Example>

      <Example
        title="Four columns"
        description="columns={4} gives a four-up row on a wide block and steps down to three, two and one as the block narrows (container queries, so it works in a sidebar layout too)."
        stageClassName="p-3 sm:p-8"
        code={`
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
}`}
      >
        <FeatureGrid
          headingLevel="none"
          columns={4}
          title="Small parts, big range"
          features={[
            { id: "a", title: "Inputs", description: "Fields that share one height scale." },
            { id: "b", title: "Overlays", description: "Dialogs, drawers and menus." },
            { id: "c", title: "Charts", description: "Every chart has a table twin." },
            { id: "d", title: "Blocks", description: "Pages assembled from the parts." },
          ]}
        />
      </Example>

      <PropsTable of={PROPS.FeatureGrid} />
      <KeyboardTable
        rows={[
          ["Tab", "Cards without an href are not stops. A card with an href has one link."],
          ["Enter", "Follow the focused card's link."],
        ]}
      />
      <A11yNotes
        notes={[
          "A <section> named by its heading (labels.region when there is no title); card titles are headings one level below it.",
          "A card's link is named by 'Learn more' plus the card's title, so a list of links is not a list of identical names.",
          "Icons are aria-hidden. The highlight card is also larger and first in its row, so nothing relies on colour.",
          "Cards rise on a spring when scrolled into view; reduced motion keeps a short fade.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Testimonials
 * ===================================================================== */

const quotes: Testimonial[] = [
  {
    id: "1",
    quote: "We replaced three internal component packages with this and shipped the dashboard in a week.",
    name: "Sam Rivera",
    role: "Engineering lead",
    rating: 5,
  },
  {
    id: "2",
    quote: "The focus states and keyboard support are the best I have seen in a glass UI.",
    name: "Jo Lindqvist",
    role: "Product designer",
    rating: 5,
  },
  {
    id: "3",
    quote: "Reduced motion actually works. Every effect has a calm fallback.",
    name: "Priya Nair",
    role: "Accessibility specialist",
    rating: 5,
  },
  {
    id: "4",
    quote: "Copying the source meant no surprise upgrades and no lock-in.",
    name: "Marcus Webb",
    role: "Frontend developer",
    rating: 4,
  },
  {
    id: "5",
    quote: "Our marketing pages finally look like the product.",
    name: "Elena Rossi",
    role: "Head of design",
    rating: 5,
  },
  {
    id: "6",
    quote: "Dark mode was a token change, not a rewrite.",
    name: "Kofi Mensah",
    role: "Staff engineer",
    rating: 5,
  },
];

/** The "Testimonials" docs page (/blocks/testimonials): live examples, props and notes. */
export function TestimonialsPage() {
  const [paused, setPaused] = useState(false);
  return (
    <Page
      eyebrow="Block"
      title="Testimonials"
      description="Customer quotes in glass cards, as a grid or as a marquee in one or two rows that rests while hovered, focused, off-screen or paused with a button."
      source="theme/src/blocks/testimonials.tsx"
    >
      <TestimonialsStage />
      <Example
        title="Grid"
        description="Each quote is a figure with a blockquote and a caption. Ratings are announced as text through labels.rating."
        stageClassName="p-3 sm:p-8"
        code={`
import { Testimonials, type Testimonial } from "@sheenui/theme";

const quotes: Testimonial[] = [
  { id: "1", quote: "We shipped the dashboard in a week.", name: "Sam Rivera", role: "Engineering lead", rating: 5 },
  { id: "2", quote: "The focus states are the best I have seen.", name: "Jo Lindqvist", role: "Product designer", rating: 5 },
  { id: "3", quote: "Reduced motion actually works.", name: "Priya Nair", role: "Accessibility specialist", rating: 5 },
];

export function Example() {
  return <Testimonials eyebrow="Kind words" title="Loved by small teams" testimonials={quotes} />;
}`}
      >
        <Testimonials
          headingLevel="none"
          eyebrow="Kind words"
          title="Loved by small teams"
          testimonials={quotes.slice(0, 3)}
        />
      </Example>

      <Example
        title="Marquee, two rows"
        description="The second row runs the other way. One Pause button drives both rows (controlled with paused and onPausedChange). Hover or focus rests the strip; it also rests off-screen and in a background tab, and stands still under reduced motion."
        stageClassName="p-3 sm:p-8"
        code={`
import { useState } from "react";
import { Testimonials, type Testimonial } from "@sheenui/theme";

declare const quotes: Testimonial[]; // at least four quotes for two rows

export function Example() {
  const [paused, setPaused] = useState(false);
  return (
    <Testimonials
      title="Loved by small teams"
      layout="marquee"
      rows={2}
      speed={28}
      paused={paused}
      onPausedChange={setPaused}
      testimonials={quotes}
    />
  );
}`}
      >
        <Testimonials
          headingLevel="none"
          title="Loved by small teams"
          layout="marquee"
          rows={2}
          speed={28}
          paused={paused}
          onPausedChange={setPaused}
          testimonials={quotes}
        />
      </Example>

      <PropsTable of={PROPS.Testimonials} />
      <KeyboardTable
        rows={[
          ["Tab", "The grid has no stops. In the marquee, the Pause / Play button comes first."],
          ["Enter / Space", "Pause or resume the marquee."],
          ["Focus inside the strip", "Rests the marquee while focus is there."],
        ]}
      />
      <A11yNotes
        notes={[
          "Each quote is a <figure> with a <blockquote> and a <figcaption>; the list of quotes is named by labels.list.",
          "The marquee has a Pause button (WCAG 2.2.2) and rests while hovered, focused, off-screen or in a hidden tab. Reduced motion stops it.",
          "Avatars and the quote mark are decorative; a star rating is a text alternative ('Rated 5 out of 5').",
          "Each card is one glass surface; the marquee fades each card's own edge, never a wrapper of glass.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * FAQ section
 * ===================================================================== */

const faqs: FaqItem[] = [
  {
    id: "license",
    question: "What licence is SheenUI under?",
    answer: "MIT. Copy the source into your project and change whatever you need.",
  },
  {
    id: "react",
    question: "Which React versions work?",
    answer:
      "React 19. Components start with 'use client' where they need the browser, so they work in Next.js and Vite.",
  },
  {
    id: "a11y",
    question: "How accessible is it?",
    answer: (
      <p>
        Built on Base UI, with keyboard support, visible focus, 44 px touch targets and a reduced-motion path for every
        effect. Each component runs an axe check in four looks.
      </p>
    ),
    answerText:
      "Built on Base UI, with keyboard support, visible focus, 44 px touch targets and a reduced-motion path for every effect. Each component runs an axe check in four looks.",
  },
  {
    id: "theme",
    question: "Can I change the colours?",
    answer: "Yes. Everything reads --sheen-* tokens, so a theme is a handful of CSS variables.",
  },
];

/** The "FAQ section" docs page (/blocks/faq-section): live examples, props and notes. */
export function FaqSectionPage() {
  return (
    <Page
      eyebrow="Block"
      title="FAQ section"
      description="An accordion of questions on glass with find-in-page that opens the matching answer, and a faqPageJsonLd helper that returns the schema.org FAQPage object for the same questions."
      source="theme/src/blocks/faq-section.tsx"
    >
      <FaqSectionStage />
      <Example
        title="Stacked"
        description="Press Ctrl or Cmd + F and search for 'Base UI': the closed answer opens. defaultValue opens an item at first; multiple lets several stay open."
        stageClassName="p-3 sm:p-8"
        code={`
import { FaqSection, type FaqItem } from "@sheenui/theme";

const items: FaqItem[] = [
  { id: "license", question: "What licence is SheenUI under?", answer: "MIT. Copy the source and change whatever you need." },
  { id: "react", question: "Which React versions work?", answer: "React 19." },
  { id: "theme", question: "Can I change the colours?", answer: "Yes. Everything reads --sheen-* tokens." },
];

export function Example() {
  return <FaqSection title="Questions, answered" items={items} defaultValue={["license"]} />;
}`}
      >
        <FaqSection headingLevel="none" title="Questions, answered" items={faqs} defaultValue={["license"]} />
      </Example>

      <Example
        title="Split layout and structured data"
        description="layout='split' keeps the heading and a footer beside the list. faqPageJsonLd(items) returns the FAQPage object: render it into a script tag yourself (it never touches the document), and keep its text equal to what the page shows."
        stageClassName="p-3 sm:p-8"
        code={`
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
}`}
      >
        <FaqSection
          headingLevel="none"
          layout="split"
          variant="separated"
          title="Still curious?"
          description="The short answers."
          footer={
            <a
              className="font-semibold text-sheen-accent underline underline-offset-4"
              href="https://example.com/contact"
            >
              Ask us something else
            </a>
          }
          items={faqs.slice(0, 3)}
        />
      </Example>

      <PropsTable of={PROPS.FaqSection} />
      <KeyboardTable
        rows={[
          ["Tab", "Move between the questions."],
          ["Enter / Space", "Open or close the focused question."],
          ["Arrow Down / Arrow Up", "Move to the next or previous question."],
          ["Home / End", "First or last question."],
        ]}
      />
      <A11yNotes
        notes={[
          "A <section> named by its heading; each question is a button inside a heading one level below it, with aria-expanded and aria-controls.",
          "Closed answers use hidden='until-found', so the browser's find-in-page opens the matching one.",
          "faqPageJsonLd only returns an object. Items whose answer is not a string and that have no answerText are left out, because JSON-LD answers are plain text.",
          "The list is one glass card ('glass') or one card per question ('separated'); the open height animates in about 220 ms and is skipped under reduced motion.",
        ]}
      />
    </Page>
  );
}
