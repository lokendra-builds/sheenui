import { wait } from "../demo-utils";
import { useRef } from "react";
import {
  Input,
  SheenScene,
  type FaqItem,
  type FeatureGridItem,
  type FooterColumn,
  type FooterSocial,
  type Testimonial,
} from "@sheenui/theme";

import { BASE_PATH } from "../seo/site";
import { lazyBlock } from "../layout/lazy-block";
import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { all, press, type, type Action } from "../layout/ShowcaseStage.block.drive";
import { useFollow } from "../layout/ShowcaseStage.follow";

const AnnouncementBanner = lazyBlock(
  () => import("../../../theme/src/blocks/announcement-banner").then((m) => m.AnnouncementBanner),
  { minHeight: "36rem", eager: true },
);
const ContactForm = lazyBlock(() => import("../../../theme/src/blocks/contact-form").then((m) => m.ContactForm), {
  minHeight: "36rem",
  eager: true,
});
const FaqSection = lazyBlock(() => import("../../../theme/src/blocks/faq-section").then((m) => m.FaqSection), {
  minHeight: "36rem",
  eager: true,
});
const FeatureGrid = lazyBlock(() => import("../../../theme/src/blocks/feature-grid").then((m) => m.FeatureGrid), {
  minHeight: "36rem",
  eager: true,
});
const HeroSection = lazyBlock(() => import("../../../theme/src/blocks/hero-section").then((m) => m.HeroSection), {
  minHeight: "36rem",
  eager: true,
});
const NotFound = lazyBlock(() => import("../../../theme/src/blocks/not-found-page").then((m) => m.NotFound), {
  minHeight: "36rem",
  eager: true,
});
const SiteFooter = lazyBlock(() => import("../../../theme/src/blocks/site-footer").then((m) => m.SiteFooter), {
  minHeight: "36rem",
  eager: true,
});
const Testimonials = lazyBlock(() => import("../../../theme/src/blocks/testimonials").then((m) => m.Testimonials), {
  minHeight: "36rem",
  eager: true,
});

const site = (path: string) => `${BASE_PATH}${path.replace(/^\//, "")}`;

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

/** The stage at the top of /blocks/hero-section: the hero is put together slot by slot, headline, eyebrow and buttons first, then the logo strip. */
export function HeroSectionStage() {
  return (
    <BlockStage label="Hero section demo" story="two" width={880} height={520} fit={520} align="start" actions={[]}>
      {(step) => (
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
          background={
            <SheenScene
              src={`${BASE_PATH}scenes/swoosh-v2.webp`}
              avifSrc={`${BASE_PATH}scenes/swoosh-v2.avif`}
              dim={0.72}
              priority
            />
          }
          logos={
            step >= 1
              ? [
                  { name: "Alder" },
                  { name: "Brightloom" },
                  { name: "Cobalt" },
                  { name: "Driftwood" },
                  { name: "Evergreen" },
                ]
              : undefined
          }
        />
      )}
    </BlockStage>
  );
}
HeroSectionStage.isShowcaseStage = true;

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

/** The stage at the top of /blocks/feature-grid: three features grow into a full grid, the highlighted one first in line. */
export function FeatureGridStage() {
  return (
    <BlockStage
      label="Feature grid demo"
      story="tour"
      width={1000}
      height={830}
      fit={620}
      fade
      align="start"
      actions={[]}
    >
      {(step) => (
        <FeatureGrid
          headingLevel="none"
          eyebrow="Why SheenUI"
          title="Everything a glass UI needs"
          description="One system for surfaces, motion and accessibility."
          features={features.slice(0, Math.min(3 + step, 6))}
        />
      )}
    </BlockStage>
  );
}
FeatureGridStage.isShowcaseStage = true;

const quotes: Testimonial[] = [
  {
    id: "1",
    quote: "We replaced three internal component packages and shipped the dashboard in a week.",
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
];

/** The stage at the top of /blocks/testimonials: the wall of quotes fills up, one voice at a time. */
export function TestimonialsStage() {
  return (
    <BlockStage label="Testimonials demo" story="two" width={1000} height={605} fit={605} align="start" actions={[]}>
      {(step) => (
        <Testimonials
          headingLevel="none"
          eyebrow="Kind words"
          title="Loved by small teams"
          testimonials={quotes.slice(0, step + 1)}
        />
      )}
    </BlockStage>
  );
}
TestimonialsStage.isShowcaseStage = true;

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
    answer:
      "Built on Base UI, with keyboard support, visible focus, 44 px touch targets and a reduced-motion path for every effect.",
  },
  {
    id: "colour",
    question: "Can I change the colours?",
    answer: "Yes. Every colour is a token, so one CSS variable re-themes the whole set.",
  },
];

/** The stage at the top of /blocks/faq-section: three questions are opened one after the other and each answer unfolds in place. */
export function FaqSectionStage() {
  return (
    <BlockStage
      label="FAQ section demo"
      story="tour"
      width={680}
      height={580}
      fit={580}
      align="start"
      frameClassName="sheen-blk-faq"
      actions={[
        press("Which React versions work?"),
        press("How accessible is it?"),
        press("Can I change the colours?"),
      ]}
    >
      <FaqSection headingLevel="none" title="Questions, answered" items={faqs} defaultValue={["license"]} />
    </BlockStage>
  );
}
FaqSectionStage.isShowcaseStage = true;

const columns: FooterColumn[] = [
  {
    id: "product",
    title: "Product",
    links: [
      { label: "Features", href: "https://example.com/features" },
      { label: "Pricing", href: "https://example.com/pricing" },
      { label: "Changelog", href: "https://example.com/changelog" },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://example.com/docs" },
      { label: "Guides", href: "https://example.com/guides" },
      { label: "Status", href: "https://example.com/status" },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About", href: "https://example.com/about" },
      { label: "Careers", href: "https://example.com/careers" },
      { label: "Contact", href: "https://example.com/contact" },
    ],
  },
];
const socials: FooterSocial[] = [
  {
    id: "code",
    label: "Source code",
    href: "https://example.com/code",
    icon: glyph("m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"),
  },
  { id: "chat", label: "Community chat", href: "https://example.com/chat", icon: glyph("M4 5h16v11H9l-5 4V5Z") },
];

/** The stage at the top of /blocks/site-footer: a visitor types an email into the newsletter field and subscribes. */
export function SiteFooterStage() {
  return (
    <BlockStage
      label="Site footer demo"
      story="three"
      width={1000}
      height={467}
      fit={467}
      align="start"
      frameClassName="sheen-blk-footer"
      actions={[type("Email address", "maya@example.com", 45), press("Subscribe")]}
    >
      {(_step, reduced) => (
        <SiteFooter
          headingLevel="none"
          brand="Acme"
          description="Tools for small teams who like their software calm."
          columns={columns}
          socials={socials}
          onSubscribe={() => wait(reduced ? 0 : 700)}
          copyright="© 2026 Acme, Inc."
          legalLinks={[
            { label: "Privacy", href: "https://example.com/privacy" },
            { label: "Terms", href: "https://example.com/terms" },
          ]}
        />
      )}
    </BlockStage>
  );
}
SiteFooterStage.isShowcaseStage = true;

const lost = [
  { label: "Documentation", href: site("/docs/installation"), description: "Guides and API reference" },
  { label: "Components", href: site("/components/"), description: "Every part, with examples" },
  { label: "Blocks", href: site("/blocks/"), description: "Pages built from the parts" },
];
const found = [
  { label: "Pricing", href: site("/blocks/pricing"), description: "Plans for every team size" },
  { label: "Pricing block", href: site("/blocks/pricing"), description: "The page this one links to" },
  { label: "Contact sales", href: site("/blocks/contact-form"), description: "Talk to a person" },
];

/** The stage at the top of /blocks/not-found-page: a lost visitor searches and is offered the pages they meant. */
export function NotFoundStage() {
  return (
    <BlockStage
      label="404 page demo"
      story="two"
      width={720}
      height={845}
      fit={520}
      actions={[type("Search the site", "pricing", 70)]}
    >
      {(step) => (
        <NotFound
          headingLevel="none"
          action={{ label: "Back to home", href: site("/") }}
          search={<Input type="search" aria-label="Search the site" placeholder="Search the docs" />}
          links={step >= 2 ? found : lost}
        />
      )}
    </BlockStage>
  );
}
NotFoundStage.isShowcaseStage = true;

/** Dismisses the banner as the story passes step 1. Under reduced motion the story jumps to its last frame (the banner is back, with its new text), so a dismissal then would only hide it. */
const dismiss: Action = (d) => (d.reduced ? undefined : press("Dismiss announcement")(d));

/** The stage at the top of /blocks/announcement-banner: the banner is dismissed, then a new announcement takes its place. */
export function AnnouncementBannerStage() {
  return (
    <BlockStage
      label="Announcement banner demo"
      story="two"
      width={900}
      height={300}
      fit={300}
      align="start"
      actions={[dismiss]}
    >
      {(step) => <BannerBody step={step} />}
    </BlockStage>
  );
}
AnnouncementBannerStage.isShowcaseStage = true;

function BannerBody({ step }: { step: number }) {
  const [open, setOpen] = useFollow(step !== 1);
  const fresh = step >= 2;
  // Dismissing moves focus to the next focusable element (the library's rule). On the stage that would be the Replay
  // button, which would then show a focus ring nobody asked for: hand focus to a plain, unfocusable block instead.
  const sink = useRef<HTMLDivElement>(null);
  return (
    <div className="flex w-full flex-col gap-4">
      {/* The banner's slot is as tall as the banner (58px, 90px where its text wraps on a phone), so dismissing it moves nothing below. */}
      <div className="min-h-[58px] max-[40rem]:min-h-[90px]">
        <AnnouncementBanner
          open={open}
          onOpenChange={setOpen}
          restoreFocusTo={sink}
          tone={fresh ? "success" : "accent"}
          link={{ label: fresh ? "See what changed" : "Read the notes", href: "https://example.com/changelog" }}
        >
          {fresh
            ? "Version 2.1 is live: faster charts and two new blocks."
            : "Version 2 is out: new blocks and a faster build."}
        </AnnouncementBanner>
      </div>
      {/* A believable page top under the banner (decorative): a nav row, a headline and a line of copy. */}
      <div ref={sink} aria-hidden className="flex flex-col gap-6 px-6 pt-2">
        <div className="flex items-center justify-between text-sm text-sheen-fg-muted">
          <span className="text-base font-semibold text-sheen-fg">Acme</span>
          <span className="flex gap-6">
            <span>Product</span>
            <span>Pricing</span>
            <span>Docs</span>
            <span>Changelog</span>
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-4xl font-semibold tracking-tight text-sheen-fg">Ship calmer software</span>
          <span className="max-w-xl text-base text-sheen-fg-muted">
            Tools for small teams who like their releases quiet, their dashboards clear and their weekends free.
          </span>
        </div>
      </div>
    </div>
  );
}

/** The stage at the top of /blocks/contact-form: the message is written and sent, and the form thanks the visitor. */
export function ContactFormStage() {
  return (
    <BlockStage
      label="Contact form demo"
      story="pay"
      width={560}
      height={606}
      actions={[
        all(type("Name", "Maya Rivera", 30), type("Email", "maya@example.com", 30)),
        type("Message", "Can we book a demo for our design team next week?", 20),
        press("Send message"),
      ]}
    >
      {(_step, reduced) => (
        <ContactForm
          headingLevel="none"
          eyebrow="Contact"
          title="Talk to us"
          description="Questions, feedback or a project in mind. We reply within one working day."
          onSubmit={() => wait(reduced ? 0 : 900)}
        />
      )}
    </BlockStage>
  );
}
ContactFormStage.isShowcaseStage = true;
