import { Fragment, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import {
  DashboardStats,
  GlassCard,
  OtpInput,
  budgetStagger,
  distance,
  duration,
  ease,
  spring,
  staggerStep,
  useMotionGate,
} from "@sheenui/theme";

import { href } from "../router";
import { COUNTS } from "../seo/counts";
import { HomeAbout, HomeCta } from "./HomeSeoSections";
import { HomeWow } from "./HomeWow";

/*
 * Everything on the home page below the hero. It is a chunk of its own (HomePage.tsx loads it
 * once the page is idle): the prerendered HTML already holds all of it, so nothing is missing
 * for visitors or crawlers while the code (Motion variants, OTP input, live stats) arrives.
 */

const features = [
  [
    "Glass with guardrails",
    "Three glass levels that turn solid with reduced transparency, more contrast or Windows high contrast.",
  ],
  ["Motion that respects you", "Springs and micro-interactions that turn into gentle fades when reduced motion is on."],
  ["Built on Base UI", "Keyboard navigation, focus management and ARIA come from accessible headless primitives."],
  ["Copy, don't install", "Every component is plain source in theme/. Take what you need and make it yours."],
] as const;

/** The sections under the home hero: key features, component highlights and the install steps. */
export default function HomeSections() {
  return (
    <>
      <HomeWow />
      <KeyFeatures />
      <section aria-labelledby="why-sheenui" className="flex flex-col gap-5">
        <h2 id="why-sheenui" className="text-2xl font-semibold tracking-tight">
          Why SheenUI
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map(([title, body]) => (
            <li key={title} className="flex">
              <GlassCard level={2} className="home-flat w-full p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-sheen-fg-muted">{body}</p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>

      {/*
        One grid for the two showcases. Side by side only when both fit at their natural size
        (the OTP boxes at full width, the stats as a 2 × 2): heading rows line up and the OTP
        card stretches to the stats' height. Otherwise stacked, with the OTP card laid out in a
        row (container query) so it doesn't sit tall and empty.
      */}
      <div className="grid gap-10 min-[85rem]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[85rem]:gap-8">
        <section aria-labelledby="home-otp" className="@container flex min-w-0 flex-col gap-5">
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            {/* A demo label, not a page section: a <p> keeps it out of the document outline. */}
            <p id="home-otp" className="text-xl font-semibold tracking-tight">
              One-time codes
            </p>
            <a
              href={href("/components/otp-input")}
              className="inline-flex items-center rounded-sheen-sm text-sm font-medium text-sheen-accent underline-offset-4 hover:underline any-pointer-coarse:min-h-11"
            >
              OTP input docs <span aria-hidden>&nbsp;→</span>
            </a>
          </div>
          <GlassCard
            level={2}
            className="flex flex-col items-center gap-5 p-3 text-center min-[400px]:p-6 sm:p-8 @2xl:flex-row @2xl:justify-between @2xl:text-start min-[85rem]:flex-1 min-[85rem]:justify-center"
          >
            <div className="flex max-w-xs flex-col gap-1.5">
              <p className="font-semibold text-balance">Type, paste or use the arrow keys</p>
              <p className="text-sm text-sheen-fg-muted">
                Every digit pops in, and a pasted code fills every box at once.
              </p>
            </div>
            <OtpInput length={6} grouped label="Verification code" />
          </GlassCard>
        </section>
        <DashboardStats title="Live stats" headingLevel="none" className="min-w-0" />
      </div>

      <HomeAbout />
      <HomeCta />
    </>
  );
}

/* =====================================================================
 * Key features: the nine points, one line each, on one glass panel right after
 * the hero. One backdrop-filter surface for the whole list (the glass budget: at most 8 blurred surfaces in view).
 * Reveal: the rows rise in one after another when the panel scrolls in (the motion tokens);
 * reduced motion renders them static, nothing animates.
 * ===================================================================== */

const ICON = {
  glass: "M12 3c3.6 4.3 6 7.5 6 10.6a6 6 0 0 1-12 0C6 10.5 8.4 7.3 12 3Zm-3 11a3 3 0 0 0 2.4 2.9",
  styles: "M3 12a4 4 0 0 1 4-4h10a4 4 0 0 1 0 8H7a4 4 0 0 1-4-4Zm13.5 0a1.5 1.5 0 1 0 0-.01",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  motion: "M3 12c2-5.5 4-5.5 6 0s4 5.5 6 0 4-5.5 6 0",
  access: "M12 4.5a1.4 1.4 0 1 0 0-.01M4 8.5h16M12 8.5v5l-3.5 6M12 13.5l3.5 6",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  terminal: "M4 17l6-5-6-5M12 19h8",
  spark:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 13l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z",
  heart: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z",
} as const;

const KEY_FEATURES: { icon: keyof typeof ICON; lead: string; rest: ReactNode }[] = [
  { icon: "glass", lead: "Glassmorphism", rest: "and Apple-style Liquid Glass, with a Safari and Firefox fallback" },
  { icon: "styles", lead: "Two switchable styles:", rest: "Liquid Glass and Aurora Neon" },
  {
    icon: "grid",
    lead: `${COUNTS.components} components`,
    rest: `(${COUNTS.ui} UI components and ${COUNTS.effects} effects), plus ${COUNTS.charts} charts, ${COUNTS.blocks} blocks and ${COUNTS.dashboards} dashboards`,
  },
  { icon: "motion", lead: "Motion built in", rest: "(motion.dev): springs, choreography, reduced-motion safe" },
  {
    icon: "access",
    lead: "Accessible:",
    rest: "WCAG AA, checked by automated axe and contrast tests (scope on the About page), keyboard, screen readers, High Contrast mode",
  },
  {
    icon: "bolt",
    lead: "Built for frame rate:",
    rest: "animation uses only transform and opacity, loops pause off screen, and Lite glass is there for weak devices",
  },
  {
    icon: "terminal",
    lead: "Copy-paste",
    rest: (
      <>
        or <code>npx shadcn add</code>; built on Base UI + Tailwind v4
      </>
    ),
  },
  {
    icon: "spark",
    lead: "AI-ready:",
    rest: (
      <>
        documented source + <code>llms.txt</code>
      </>
    ),
  },
  { icon: "heart", lead: "Free and MIT", rest: "licensed, for personal and commercial work" },
];

const featureList: Variants = {
  hidden: {},
  show: { transition: { delayChildren: budgetStagger(staggerStep.items) } },
};
const featureItem: Variants = {
  hidden: { opacity: 0, y: distance.reveal },
  show: { opacity: 1, y: 0, transition: { ...spring.smooth, opacity: { duration: duration.base, ease: ease.out } } },
};

function KeyFeatures() {
  const { reduced } = useMotionGate();
  const rows = KEY_FEATURES.map(({ icon, lead, rest }) => (
    <Fragment key={icon}>
      <span className="home-feature__icon" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICON[icon]} />
        </svg>
      </span>
      <span className="home-feature__text">
        <strong>{lead}</strong> {rest}
      </span>
    </Fragment>
  ));
  return (
    <section aria-labelledby="home-features-title" className="home-features">
      <GlassCard level={1} sheen={false} className="home-features__card">
        <div className="home-features__head">
          <h2 id="home-features-title" className="home-features__title">
            Key features
          </h2>
          <a href={href("/components")} className="home-features__link">
            All components <span aria-hidden>→</span>
          </a>
        </div>
        {reduced ? (
          <ul className="home-features__list">
            {rows.map((row, i) => (
              <li key={i} className="home-feature">
                {row}
              </li>
            ))}
          </ul>
        ) : (
          <motion.ul
            className="home-features__list"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={featureList}
          >
            {rows.map((row, i) => (
              <motion.li key={i} className="home-feature" variants={featureItem}>
                {row}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </GlassCard>
    </section>
  );
}
