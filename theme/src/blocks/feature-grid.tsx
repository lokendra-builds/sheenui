"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { NoScriptReveal } from "../lib/no-script-reveal";
import { duration, ease, spring, distance, staggerStep } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { HEADING_TAGS, headingTag, type HeadingLevelOption } from "../lib/heading";
import { GlassCard } from "../components/glass-card/glass-card";

/** One card of `FeatureGrid`. */
export type FeatureGridItem = {
  /** Stable key. */
  id: string;
  /** The card heading. */
  title: ReactNode;
  /** The card text. */
  description: ReactNode;
  /** A decorative glyph shown in a lit tile (an inline `<svg>`). It is `aria-hidden`. */
  icon?: ReactNode;
  /** Makes the whole card a link to this address, with a "learn more" line as its accessible name. */
  href?: string;
  /** Marks the one card that matters most: it is tinted with the accent, lit from a corner and spans two columns. */
  highlight?: boolean;
};

/** Every string `FeatureGrid` adds around your content, so the block can be translated. */
export type FeatureGridLabels = {
  /** Accessible name of the `<section>` when there is no `title`. */
  region: string;
  /** The link line of a card that has an `href`. */
  learnMore: string;
};

/** The English {@link FeatureGridLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultFeatureGridLabels: FeatureGridLabels = {
  region: "Features",
  learnMore: "Learn more",
};

/** Props of `FeatureGrid`. */
export type FeatureGridProps = {
  /** Lists the cards, which render in reading order (`FeatureGridItem[]`). */
  features: FeatureGridItem[];
  /** Shows a small label above the title (`ReactNode`). */
  eyebrow?: ReactNode;
  /** Sets the section heading (`ReactNode`). */
  title?: ReactNode;
  /** Sets the line under the heading (`ReactNode`). */
  description?: ReactNode;
  /**
   * Columns on a wide block (`2 | 3 | 4`). The grid follows the block's own width, so it steps down to two and then one column.
   * @default 3
   */
  columns?: 2 | 3 | 4;
  /**
   * Level of the section heading (`1` to `6`); the card headings sit one level below. `"none"` renders plain text, no headings.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<FeatureGridLabels>`). */
  labels?: Partial<FeatureGridLabels>;
  /** Adds extra classes to the section (`string`). */
  className?: string;
};

const gridCols = {
  2: "@xl:grid-cols-2",
  3: "@xl:grid-cols-2 @4xl:grid-cols-3",
  4: "@xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4",
} as const;

const MotionGlassCard = motion.create(GlassCard);

/**
 * A grid of feature cards: an icon in a lit tile, a title and a line of text each, two to four columns by the
 * block's own width, and an optional highlight card that spans two columns. Use it under a hero to say what the
 * product does; use `BentoGrid` instead when the cards should hold live demos.
 *
 * Props (see `FeatureGridProps`): `features` (`{ id, title, description, icon?, href?, highlight? }[]`), `eyebrow`,
 * `title`, `description`, `columns` (`3`), `headingLevel` (`2`), `labels` (`Partial<FeatureGridLabels>`), `className`.
 *
 * Keyboard: cards without an `href` are not tab stops. A card with an `href` has one link (Enter follows it); its whole
 * surface is the click target but there is a single stop per card.
 * Accessibility: a `<section>` named by its heading (or by `labels.region`); card titles are headings one level below;
 * icons are `aria-hidden`; the highlight is never conveyed by colour alone (it is also larger and first in its row).
 * Glass and motion: one glass card per feature (keep the grid to 8 cards or fewer in view). Cards rise on a spring
 * when they scroll into view, and their own opacity blinks in; no wrapper is faded. Reduced motion: a short fade only.
 *
 * @example
 * ```tsx
 * import { FeatureGrid } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <FeatureGrid
 *       title="Everything a glass UI needs"
 *       columns={3}
 *       features={[
 *         { id: "tokens", title: "Design tokens", description: "Colours, blur and motion in CSS variables." },
 *         { id: "a11y", title: "Accessible", description: "Keyboard and screen reader tested.", highlight: true },
 *         { id: "themes", title: "Two presets", description: "Liquid Glass and Aurora Neon, light and dark." },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/feature-grid
 */
export function FeatureGrid({
  features,
  eyebrow,
  title,
  description,
  columns = 3,
  headingLevel = 2,
  labels,
  className,
}: FeatureGridProps) {
  const L = { ...defaultFeatureGridLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const headingId = useId();
  const Heading = HEADING_TAGS[headingLevel];
  const CardHeading = headingTag(headingLevel, 1);
  const perRow = columns;

  return (
    <section
      data-slot="feature-grid"
      role="group"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : L.region}
      className={cn("@container flex w-full min-w-0 flex-col gap-10", className)}
    >
      {(Boolean(eyebrow) || Boolean(title) || Boolean(description)) && (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {eyebrow && <p className="text-sm font-semibold tracking-widest text-sheen-accent uppercase">{eyebrow}</p>}
          {title && (
            <Heading
              id={headingId}
              className="font-sheen-display text-3xl font-semibold tracking-(--sheen-display-tracking) text-balance @xl:text-5xl"
            >
              {title}
            </Heading>
          )}
          {description && <p className="text-base text-pretty text-sheen-fg-muted @xl:text-lg">{description}</p>}
        </div>
      )}

      <NoScriptReveal />
      <ul className={cn("grid list-none gap-4 p-0 @4xl:gap-5", gridCols[columns])}>
        {features.map((feature, index) => {
          const delay = (index % perRow) * staggerStep.cards;
          return (
            <li key={feature.id} className={cn("flex min-w-0", feature.highlight && "@xl:col-span-2")}>
              <MotionGlassCard
                data-sheen-reveal=""
                data-highlight={feature.highlight ? "" : undefined}
                tint={feature.highlight}
                interactive={Boolean(feature.href)}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance.reveal }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={
                  reduced
                    ? { duration: duration.fast }
                    : { y: { ...spring.gentle, delay }, opacity: { duration: duration.fast, ease: ease.out, delay } }
                }
                className="relative isolate flex w-full flex-col gap-4 overflow-hidden p-6 @xl:p-7"
              >
                {/* A lit corner: the card's own light, behind its content, never on a wrapper. */}
                {feature.highlight && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -end-16 -top-20 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,var(--sheen-accent-glow),transparent)] opacity-40"
                  />
                )}
                {feature.icon && (
                  <span
                    aria-hidden
                    className="glass-1 relative flex size-11 shrink-0 items-center justify-center rounded-sheen-lg text-sheen-accent [&_svg]:size-5"
                  >
                    {feature.icon}
                  </span>
                )}
                <div className="flex min-w-0 flex-col gap-2">
                  <CardHeading
                    id={`${headingId}-${feature.id}-title`}
                    className={cn(
                      "font-sheen-display font-semibold tracking-tight text-balance",
                      feature.highlight ? "text-2xl" : "text-lg",
                    )}
                  >
                    {feature.title}
                  </CardHeading>
                  <p className="text-pretty text-sheen-fg-muted">{feature.description}</p>
                </div>
                {feature.href && (
                  <a
                    href={feature.href}
                    id={`${headingId}-${feature.id}-link`}
                    aria-labelledby={`${headingId}-${feature.id}-link ${headingId}-${feature.id}-title`}
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-sheen-sm text-sm font-semibold text-sheen-accent after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
                  >
                    {L.learnMore}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-4 rtl:-scale-x-100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                )}
              </MotionGlassCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
