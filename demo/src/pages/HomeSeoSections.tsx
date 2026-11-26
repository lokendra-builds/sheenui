import { useState, type ReactNode } from "react";
import { Button } from "@sheenui/theme";

import { AboutSection, type AboutItem } from "../layout/AboutAccordion";
import { type FaqItem } from "../layout/Faq";
import { slugify } from "../layout/heading-ids";
import { useScrollFade } from "../layout/use-scroll-fade";
import { href } from "../router";
import { BASE_PATH, SITE_URL } from "../seo/site";
import { COUNTS } from "../seo/counts";

/*
 * The text of the home page that owns the five head keywords: glassmorphism React components,
 * Liquid Glass for React, animated React components, charts, blocks and the shadcn install, then a visible
 * FAQ. Copy only; the page's design lives in HomeHero.tsx and HomeSections.tsx. The FAQ is static markup (no island), and
 * the prerender reads it back into the page's FAQPage JSON-LD (scripts/lib/faq.mjs).
 */

const link = "font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg";

function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={link}>
      {children}
    </a>
  );
}

const code = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";

/** The home FAQ, one array: the page shows it as is. */
export const HOME_FAQ: FaqItem[] = [
  {
    q: "What is SheenUI?",
    a: `SheenUI is a free, open-source (MIT) library of glassmorphism and Liquid Glass React components. It has ${COUNTS.components} components (${COUNTS.ui} UI components and ${COUNTS.effects} effects), ${COUNTS.charts} charts and ${COUNTS.blocks} blocks, animated with Motion and built on Base UI and Tailwind CSS v4. You copy the source into your app and own the code, including for commercial projects.`,
  },
  {
    q: "What is glassmorphism?",
    a: (
      <>
        Glassmorphism is a UI style where surfaces look like frosted glass: a translucent tint, a background blur (CSS{" "}
        <code className={code}>backdrop-filter</code>) and a thin, light border, over a colorful background. SheenUI
        ships three glass levels as Tailwind CSS v4 utilities; the{" "}
        <A to="/guides/glassmorphism-react-tutorial">glassmorphism React tutorial</A> builds one from scratch.
      </>
    ),
  },
  {
    q: "What is the difference between glassmorphism and Liquid Glass?",
    a: (
      <>
        Glassmorphism blurs what is behind a surface. Liquid Glass, Apple&rsquo;s design language since iOS 26, also
        bends that background like a lens and adds a bright rim. SheenUI&rsquo;s{" "}
        <code className={code}>LiquidGlass</code> component refracts in Chrome and Edge and shows frosted glass in
        Safari and Firefox. See <A to="/guides/glassmorphism-vs-liquid-glass">Glassmorphism vs Liquid Glass</A>.
      </>
    ),
  },
  {
    q: "Does Liquid Glass work in Safari and Firefox?",
    a: "The refraction uses an SVG displacement map inside backdrop-filter, which only Chromium browsers support today. Safari and Firefox get SheenUI's normal frosted glass instead, so nothing breaks.",
  },
  {
    q: "Is glassmorphism accessible?",
    a: (
      <>
        It can be. SheenUI checks text contrast on the glass (WCAG AA, at least 4.5:1), turns the glass solid when the
        user asks for reduced transparency or more contrast, and switches to system colors in Windows forced-colors
        mode. Under reduced motion, movement becomes short fades. Read{" "}
        <A to="/guides/accessible-glassmorphism">accessible glassmorphism</A> for the details.
      </>
    ),
  },
  {
    q: "Does SheenUI use Framer Motion?",
    a: (
      <>
        It uses Motion for React, the library formerly called Framer Motion: the <code className={code}>motion</code>{" "}
        package, imported from <code className={code}>motion/react</code>. The{" "}
        <A to="/guides/framer-motion-to-motion">Framer Motion to Motion guide</A> explains the rename.
      </>
    ),
  },
  {
    q: "Is SheenUI free, and what is the licence?",
    a: "Yes. SheenUI is MIT-licensed, so you can use, change and ship the copied source in personal and commercial projects. It is at version 0.1 and is not on npm yet: you install it with the shadcn CLI or by copying the files a page lists.",
  },
  {
    q: "Which React and Tailwind CSS versions does it need?",
    a: "React 19.2 or newer, Tailwind CSS 4.1 or newer, Motion 14 and Base UI 1.9 or newer. There is no tailwind.config file: the glass tokens and utilities are plain CSS for Tailwind v4.",
  },
  {
    q: "How is SheenUI different from shadcn/ui?",
    a: (
      <>
        Both are copy-the-source libraries, so you own the code. shadcn/ui is a neutral, flat design system on Radix.
        SheenUI is glass by default (frosted and Liquid Glass surfaces, two style presets, light and dark), is built on
        Base UI, animates with Motion and adds charts, blocks and dashboards. You can install SheenUI items through the
        shadcn CLI and use both side by side.
      </>
    ),
  },
  {
    q: "How do I install SheenUI components?",
    a: (
      <>
        Copy the folders listed in each page&rsquo;s &ldquo;Files to copy&rdquo; box into a React 19.2+ and Tailwind CSS
        v4 app, or use the shadcn CLI with one registry URL per component. The{" "}
        <A to="/docs/installation">installation page</A> has the commands and the Next.js and Vite notes, and the{" "}
        <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A> covers the two CSS imports.
      </>
    ),
  },
  {
    q: "Can I use SheenUI with Next.js or shadcn/ui?",
    a: (
      <>
        Yes. The components are React 19.2+ client components styled with Tailwind CSS v4. They work in Next.js, Vite
        and React Router apps, next to shadcn/ui components, and they are built on Base UI rather than Radix. Compare
        the options in <A to="/guides/shadcn-alternatives">shadcn alternatives</A>, or see{" "}
        <A to="/guides/shadcn-glassmorphism">shadcn glassmorphism</A> for glass on stock shadcn/ui components.
      </>
    ),
  },
  {
    q: "Who makes SheenUI, and is it ready for production?",
    a: (
      <>
        Lokendra Singh Rathore designs and builds it as an open-source project. It is version 0.1 (pre-1.0), so props
        can still change between releases, and no real iPhone or Android phone has been used to check it yet. The{" "}
        <A to="/about">About SheenUI</A> page says what is tested, how and how to cite it.
      </>
    ),
  },
];

const p = "text-base leading-relaxed text-pretty text-sheen-fg-muted";

/** The six keyword sections, one accordion item each (the text stays in the HTML). */
const ABOUT_ITEMS: AboutItem[] = [
  {
    value: "home-glass",
    title: "Glassmorphism React components that stay readable",
    body: (
      <>
        <p className={p}>
          SheenUI is a library of glassmorphism React components: buttons, inputs, dialogs, menus, tables and more,
          drawn as frosted glass with a tint, a backdrop blur and a lit rim. Three glass levels come from a few Tailwind
          CSS v4 tokens, and every surface turns solid when someone asks for reduced transparency or more contrast, so
          text stays readable on any background. Taken together it is a glassmorphism UI kit for React rather than a
          single effect.
        </p>
        <p className={p}>
          Browse <A to="/components">all glass UI components</A>, learn the system in{" "}
          <A to="/foundations">glass design tokens</A>, or see how contrast is checked in{" "}
          <A to="/guides/accessible-glassmorphism">accessible glassmorphism</A>.
        </p>
      </>
    ),
  },
  {
    value: "home-liquid",
    title: "Liquid Glass for React, with a Safari fallback",
    body: (
      <>
        <p className={p}>
          Liquid Glass is the Apple look that bends the background behind a panel like a lens. SheenUI&rsquo;s{" "}
          <A to="/effects/liquid-glass">Liquid Glass React component</A> does it with an SVG displacement map in Chrome
          and Edge, and falls back to ordinary frosted glass in Safari and Firefox, so every browser gets a good result.
        </p>
        <p className={p}>
          The <A to="/guides/liquid-glass-css-react">Liquid Glass CSS and React guide</A> shows the code, and{" "}
          <A to="/guides/best-glassmorphism-react-libraries">the best glassmorphism React libraries</A> compares the
          alternatives honestly.
        </p>
      </>
    ),
  },
  {
    value: "home-motion",
    title: "Animated React components, made with Motion",
    body: (
      <>
        <p className={p}>
          The animation comes from Motion (formerly Framer Motion). Buttons lift and press, switches spring, tabs slide
          a pill to the active tab, and a shared set of springs and durations keeps every component in the same rhythm.
          Reduced motion turns movement into short fades.
        </p>
        <p className={p}>
          The <A to="/effects">animated React components</A> page lists the effects, including a border beam, a
          macOS-style dock and a number ticker. Patterns for your own code are in{" "}
          <A to="/guides/framer-motion-examples">12 Framer Motion examples</A>.
        </p>
      </>
    ),
  },
  {
    value: "home-charts",
    title: `${COUNTS.charts} animated, accessible React charts`,
    body: (
      <>
        <p className={p}>
          The chart set covers line, area, bar and donut charts, funnels, heatmaps, treemaps, Sankey diagrams and more,{" "}
          {COUNTS.charts} chart components in all. Each has a glass tooltip you can drive with the arrow keys, a
          color-blind-safe palette and a table view of the same data.
        </p>
        <p className={p}>
          Start with the <A to="/charts">animated React charts gallery</A>, or open the{" "}
          <A to="/charts/line-chart">React line chart</A>, <A to="/charts/bar-chart">bar chart</A> and{" "}
          <A to="/charts/donut-chart">donut chart</A> pages.{" "}
          <A to="/guides/accessible-react-charts">Accessible React charts</A> explains the reading model.
        </p>
      </>
    ),
  },
  {
    value: "home-blocks",
    title: "Glassmorphism blocks: login, OTP, checkout, pricing, AI chat and dashboards",
    body: (
      <>
        <p className={p}>
          Blocks are whole sections made only from SheenUI components. There are {COUNTS.blocks} of them, from a{" "}
          <A to="/blocks/glass-login">glassmorphism login form</A> and an{" "}
          <A to="/blocks/otp-verification">OTP verification page</A> to a <A to="/blocks/pricing">pricing table</A>, a{" "}
          <A to="/blocks/payment-checkout">checkout form</A> and an <A to="/blocks/ai-chat">AI chat UI</A>.
        </p>
        <p className={p}>
          {COUNTS.dashboards} full <A to="/dashboards">glassmorphism dashboard templates</A> cover web analytics, SaaS
          revenue, e-commerce, product analytics and crypto. Browse them all as{" "}
          <A to="/blocks">React Tailwind blocks</A>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <img
            src={`${BASE_PATH}img/glassmorphism-login-form-react-liquid-light-768.webp`}
            width={768}
            height={469}
            alt="Glassmorphism login form in React: a frosted glass sign-in card with email and password fields"
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-sheen-md border border-sheen-border"
          />
          <img
            src={`${BASE_PATH}img/glassmorphism-dashboard-react-liquid-light-768.webp`}
            width={768}
            height={562}
            alt="Glassmorphism dashboard in React: animated charts and KPI tiles on glass cards"
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-sheen-md border border-sheen-border"
          />
        </div>
      </>
    ),
  },
  {
    value: "home-install",
    title: "Install with the shadcn CLI, or copy the source",
    body: (
      <>
        <p className={p}>
          Every component is a registry item, so one command copies its source and installs the packages it needs:
        </p>
        {/* A scrolling box must be keyboard focusable (WCAG 2.1.1); the group name says what it holds. */}
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling box must be keyboard focusable so it can be scrolled without a mouse
          tabIndex={0}
          role="group"
          aria-label="Install command"
          className="glass-1 overflow-x-auto rounded-sheen-md p-3 font-sheen-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
        >
          <code>npx shadcn@latest add {`${SITE_URL}/r/glass-card.json`}</code>
        </pre>
        <p className={p}>
          SheenUI needs React 19.2+ and Tailwind CSS v4 (the <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A>{" "}
          shows the two CSS imports) and is free under the MIT license. The{" "}
          <A to="/docs/installation">installation page</A> and the guide to{" "}
          <A to="/guides/install-frameworks">installing in Next.js and Vite</A> list the tested steps.
        </p>
      </>
    ),
  },
];

/** "About SheenUI" (the keyword sections, first item open) and the FAQ below it: two glass accordions, both static markup. */
export function HomeAbout() {
  return (
    <>
      <AboutSection
        title="About SheenUI"
        lede="The short version of what the library is, how it handles glass, motion and accessibility, and how to install it."
        flat
        className="w-full"
        groups={[{ items: ABOUT_ITEMS, numbered: true, defaultOpen: ["home-glass"] }]}
      />
      <AboutSection
        title="Frequently asked questions"
        flat
        className="w-full"
        groups={[
          {
            anchorPrefix: "faq-",
            items: HOME_FAQ.map(({ q, a }) => ({ value: slugify(q), title: q, body: <p>{a}</p> })),
          },
        ]}
      />
    </>
  );
}

/** The last thing on the page: the install command and the way into the library, on a lit glass band. */
export function HomeCta() {
  const [copied, setCopied] = useState(false);
  const field = useScrollFade<HTMLElement>();
  const command = "npx shadcn@latest add " + SITE_URL + "/r/glass-card.json";
  const copy = () => {
    void navigator.clipboard.writeText(command).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => undefined,
    );
  };
  return (
    <section aria-labelledby="home-cta-title" className="home-cta glass-2">
      <i className="home-cta__glow" aria-hidden />
      <div className="home-cta__copy">
        <h2 id="home-cta-title" className="home-cta__title">
          One command to start
        </h2>
        <p className="text-base text-pretty text-sheen-fg-muted">
          Copy a component into your React 19 and Tailwind v4 app and own the code. Free, MIT licensed.
        </p>
      </div>
      <div className="home-cta__term">
        <span className="home-cta__prompt" aria-hidden>
          $
        </span>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable */}
        <code ref={field} className="home-cta__cmd" tabIndex={0} role="region" aria-label="Install command">
          {command}
        </code>
        <button type="button" className="home-cta__copy-btn" onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="home-cta__actions">
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a> */}
        <Button size="lg" render={<a href={href("/components")} />}>
          Browse components
        </Button>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a> */}
        <Button size="lg" variant="glass" render={<a href={href("/docs/installation")} />}>
          Installation guide
        </Button>
      </div>
    </section>
  );
}
